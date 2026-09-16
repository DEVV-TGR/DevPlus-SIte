/** docs: docs/07-estudio.md */
import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { consulta } from "@/lib/estudio/db";
import { ORGANIZACAO } from "@/lib/estudio/github";

/**
 * O webhook da organização: um repositório novo vira um projeto no Estúdio.
 *
 * **Esta é a única rota do Estúdio sem sessão** — quem a chama é o GitHub, que
 * não tem cookie nenhum. Em vez da sessão, a prova é a assinatura: o GitHub
 * assina o corpo com um segredo que só ele e nós conhecemos, e sem assinatura
 * válida nada disto corre. É por isso que a verificação é a primeira coisa a
 * acontecer e que se compara em tempo constante.
 *
 * Como se liga (uma vez, ver docs/07):
 *   Organização DEVV-TGR -> Settings -> Webhooks -> Add webhook
 *   Payload URL:  https://devplus.pt/api/estudio/github/webhook
 *   Content type: application/json
 *   Secret:       o mesmo valor de GITHUB_WEBHOOK_SECRET
 *   Events:       "Let me select individual events" -> Repositories
 *
 * Devolve-se 200 a tudo o que seja legítimo mas não interesse (um `ping`, um
 * repositório arquivado). O GitHub desativa webhooks que respondem com erro, e
 * um evento que não nos diz respeito não é um erro.
 */

/* Um payload de repositório anda pelos 10 kB. Um megabyte é folgado e continua
   a travar quem tente empurrar o processo contra a parede. */
const MAX_CORPO_BYTES = 1024 * 1024;

async function lerCorpoLimitado(
  request: Request,
  maximo: number,
): Promise<string | null> {
  const leitor = request.body?.getReader();
  if (!leitor) return "";

  const partes: Uint8Array[] = [];
  let total = 0;

  /* Lê-se aos bocados em vez de confiar no `content-length`: o cabeçalho é
     escrito por quem envia e pode mentir. Mesma defesa do `app/api/contacto`. */
  for (;;) {
    const { done, value } = await leitor.read();
    if (done) break;
    if (!value) continue;

    total += value.byteLength;
    if (total > maximo) {
      await leitor.cancel();
      return null;
    }
    partes.push(value);
  }

  const junto = new Uint8Array(total);
  let posicao = 0;
  for (const parte of partes) {
    junto.set(parte, posicao);
    posicao += parte.byteLength;
  }

  return new TextDecoder().decode(junto);
}

function assinaturaValida(corpo: string, cabecalho: string | null): boolean {
  const segredo = process.env.GITHUB_WEBHOOK_SECRET;
  if (!segredo || !cabecalho) return false;

  const esperada =
    "sha256=" + createHmac("sha256", segredo).update(corpo).digest("hex");

  const a = Buffer.from(esperada);
  const b = Buffer.from(cabecalho);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!process.env.GITHUB_WEBHOOK_SECRET) {
    console.error("[estudio] webhook chamado sem GITHUB_WEBHOOK_SECRET");
    return Response.json({ error: "Serviço indisponível." }, { status: 503 });
  }

  const corpo = await lerCorpoLimitado(request, MAX_CORPO_BYTES);
  if (corpo === null)
    return Response.json({ error: "Pedido grande demais." }, { status: 413 });

  if (!assinaturaValida(corpo, request.headers.get("x-hub-signature-256"))) {
    console.warn("[estudio] webhook com assinatura inválida");
    return Response.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  const evento = request.headers.get("x-github-event");

  /* O `ping` é o que o GitHub manda ao criar o webhook, para ver se responde. */
  if (evento === "ping") return Response.json({ ok: true });
  if (evento !== "repository") return Response.json({ ok: true });

  let payload: unknown;
  try {
    payload = JSON.parse(corpo);
  } catch {
    return Response.json({ error: "Corpo ilegível." }, { status: 400 });
  }

  const dados =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};

  if (dados.action !== "created") return Response.json({ ok: true });

  const repo =
    dados.repository && typeof dados.repository === "object"
      ? (dados.repository as Record<string, unknown>)
      : {};

  const dono =
    repo.owner && typeof repo.owner === "object"
      ? (repo.owner as Record<string, unknown>)
      : {};

  /* Cinto e suspensórios: a assinatura já prova que o evento vem do nosso
     webhook, mas um repositório de outra organização aqui dentro seria sinal de
     que alguma coisa está mal configurada, e mais vale não o guardar. */
  if (
    typeof dono.login !== "string" ||
    dono.login.toLowerCase() !== ORGANIZACAO.toLowerCase()
  ) {
    console.warn("[estudio] webhook de uma organização inesperada");
    return Response.json({ ok: true });
  }

  const nome = typeof repo.name === "string" ? repo.name.slice(0, 120) : "";
  const url = typeof repo.html_url === "string" ? repo.html_url : "";
  if (!nome || !url) return Response.json({ ok: true });

  const descricao =
    typeof repo.description === "string" && repo.description.trim()
      ? repo.description.trim().slice(0, 5000)
      : null;

  try {
    /* `where not exists` e não `on conflict`: não há índice único no `repo_url`
       (um projeto pode legitimamente não ter repositório, e vários podem não o
       ter). Isto torna o webhook seguro de repetir — o GitHub reenvia eventos
       quando não tem a certeza de que chegaram. */
    const criado = await consulta<{ id: string }>(
      `insert into projetos (nome, estado, repo_url, notas)
       select $1, 'proposta', $2, $3
        where not exists (select 1 from projetos where repo_url = $2)
       returning id`,
      [nome, url, descricao],
    );

    if (criado.length === 0) {
      console.log(`[estudio] webhook: ${nome} já cá estava`);
      return Response.json({ ok: true });
    }

    console.log(`[estudio] webhook: projeto criado a partir de ${nome}`);
    revalidatePath("/estudio");
    return Response.json({ ok: true });
  } catch (erro) {
    console.error("[estudio] o webhook falhou a gravar:", erro);
    /* 500 de propósito: o GitHub volta a tentar, e este evento vale a pena
       recuperar. */
    return Response.json({ error: "Não foi possível gravar." }, { status: 500 });
  }
}
