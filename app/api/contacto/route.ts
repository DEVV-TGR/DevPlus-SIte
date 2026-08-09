/** docs: docs/04-componentes-e-padroes.md — ver "O formulário de contacto". */

import { Resend } from "resend";
import { site } from "@/lib/site";
import {
  CAMPOS,
  HONEYPOT,
  LIMITES,
  validarContacto,
  type Contacto,
} from "@/lib/contacto";

/* Em Next 16 os handlers POST correm sempre a pedido e nunca são cacheados —
   não é preciso `export const dynamic`. O runtime Node (o predefinido) é o que
   o SDK do Resend quer. */

/**
 * Este endpoint é a única porta aberta de um site que, de resto, é estático. As
 * defesas estão por ordem do mais barato para o mais caro: quanto mais cedo se
 * recusa um pedido, menos recursos ele gasta a ser recusado.
 *
 *   1. `Origin` estranha           → 403, sem ler nada
 *   2. corpo grande de mais        → 413, sem ler nada
 *   3. rajada de pedidos deste IP  → 429, sem parsear
 *   4. corpo ilegível              → 400
 *   5. armadilha preenchida        → 200 a fingir
 *   6. campos inválidos            → 400
 *   7. envios a mais deste IP      → 429
 *   8. teto diário de envios       → 503
 *   9. envia
 */

/** Envios com sucesso por IP, dentro da janela. */
const LIMITE_ENVIOS = 3;
/** Pedidos de qualquer tipo por IP, dentro da janela. Ver `demasiadosPedidos`. */
const LIMITE_PEDIDOS = 20;
const JANELA_MS = 10 * 60 * 1000;

/**
 * Teto diário de envios, o travão que existe para a quota do Resend e não para
 * o visitante. O plano gratuito do Resend dá 100 emails por dia; isto fica bem
 * abaixo para que um pico nunca chegue a gastá-la por inteiro.
 */
const TETO_DIARIO = 40;

/**
 * O corpo maior que aceitamos, antes sequer de o ler. Os `LIMITES` de
 * `lib/contacto.ts` somam ~5 KB no pior caso legítimo; o resto é folga para o
 * JSON e para acentos em UTF-8.
 */
const MAX_CORPO_BYTES = 32 * 1024;

/* Os contadores vivem na memória da instância, e é preciso ser claro sobre o
   que isso quer dizer: em serverless há N instâncias, cada uma com a sua cópia,
   por isso o limite real é N × o que está aqui escrito. Isto trava o script que
   dispara em ciclo — não trava um ataque distribuído.

   O sítio para travar isso a sério é à frente da função, no Vercel Firewall,
   que vê todos os pedidos e não só os que chegam a esta instância. Ver docs/04,
   "O que isto não trava". */
const pedidos = new Map<string, number[]>();
const envios = new Map<string, number[]>();
let enviadosHoje = { dia: "", total: 0 };

/** Conta um acontecimento por IP e diz se já passou do limite. */
function passouDoLimite(
  registo: Map<string, number[]>,
  ip: string,
  limite: number,
): boolean {
  const agora = Date.now();
  const recentes = (registo.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);

  /* Sem esta limpeza o `Map` cresce para sempre com IPs que já não voltam — uma
     fuga de memória lenta numa instância de vida longa. */
  if (registo.size > 5000) {
    for (const [chave, marcas] of registo) {
      if (marcas.every((t) => agora - t >= JANELA_MS)) registo.delete(chave);
    }
  }

  if (recentes.length >= limite) {
    registo.set(ip, recentes);
    return true;
  }

  recentes.push(agora);
  registo.set(ip, recentes);
  return false;
}

/** `true` quando o teto diário já foi atingido. Só conta envios com sucesso. */
function tetoDiarioAtingido(): boolean {
  const hoje = new Date().toISOString().slice(0, 10);
  if (enviadosHoje.dia !== hoje) enviadosHoje = { dia: hoje, total: 0 };
  return enviadosHoje.total >= TETO_DIARIO;
}

/**
 * O IP de quem fez o pedido.
 *
 * A ordem não é arbitrária. Na Vercel, o `x-forwarded-for` é **reescrito pela
 * plataforma** com o IP real e os IPs externos não são reencaminhados, de
 * propósito, para impedir spoofing — por isso confiar nele é seguro *enquanto
 * estivermos lá e sem proxy pelo meio*. O `x-vercel-forwarded-for` é o mesmo
 * valor, mas sobrevive a um proxy montado por cima, e é por isso que vem
 * primeiro. O `x-forwarded-for` fica em último porque é o único que um cliente
 * consegue escrever se um dia isto correr fora da Vercel.
 *
 * Ver https://vercel.com/docs/headers/request-headers
 */
function ipDe(request: Request): string {
  const cabecalhos = request.headers;
  const candidato =
    cabecalhos.get("x-vercel-forwarded-for") ??
    cabecalhos.get("x-real-ip") ??
    cabecalhos.get("x-forwarded-for");

  return candidato?.split(",")[0]?.trim() || "desconhecido";
}

/**
 * Um `Origin` de outro domínio é sempre um pedido que não veio do nosso
 * formulário. Sem `Origin` deixa-se passar: não é um browser, e o que trava
 * um script fora do browser são os limites por IP, não este cabeçalho.
 */
function origemPermitida(request: Request): boolean {
  const origem = request.headers.get("origin");
  if (!origem) return true;
  if (origem === site.url) return true;

  // Em desenvolvimento o site corre em localhost, com porta variável.
  if (process.env.NODE_ENV !== "production") {
    try {
      return new URL(origem).hostname === "localhost";
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Lê o corpo com um tecto real de bytes, em vez de acreditar no
 * `content-length`. Esse cabeçalho pode vir a mentir, ou nem vir de todo se o
 * pedido for `chunked` — e nesse caso um `request.json()` direto puxava o que
 * lhe mandassem para memória antes de alguém poder dizer que não.
 *
 * Devolve `null` quando o corpo passa do limite; aí o pedido morre sem nunca
 * ter sido lido por inteiro.
 */
async function lerCorpoLimitado(
  request: Request,
  maxBytes: number,
): Promise<string | null> {
  const stream = request.body;
  if (!stream) return "";

  const leitor = stream.getReader();
  const pedacos: Uint8Array[] = [];
  let total = 0;

  try {
    for (;;) {
      const { done, value } = await leitor.read();
      if (done) break;
      if (!value) continue;

      total += value.byteLength;
      if (total > maxBytes) {
        await leitor.cancel();
        return null;
      }
      pedacos.push(value);
    }
  } finally {
    leitor.releaseLock();
  }

  return new TextDecoder().decode(
    pedacos.reduce<Uint8Array>((junto, pedaco) => {
      const novo = new Uint8Array(junto.length + pedaco.length);
      novo.set(junto);
      novo.set(pedaco, junto.length);
      return novo;
    }, new Uint8Array(0)),
  );
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Tira quebras de linha ao que vai para o `subject`. O Resend recebe JSON e
 * monta o cabeçalho do lado dele, o que já absorve a maior parte do risco — mas
 * um nome com `\r\n` não tem nada que chegar perto de um cabeçalho de email.
 */
function umaLinha(texto: string): string {
  return texto.replace(/[\r\n]+/g, " ").replace(/\s{2,}/g, " ").trim();
}

export async function POST(request: Request) {
  if (!origemPermitida(request)) {
    return Response.json({ error: "Origem não permitida." }, { status: 403 });
  }

  /* Antes de `request.json()`, que leria o corpo inteiro para memória para só
     depois descobrir que tinha 50 MB. */
  const tamanho = Number(request.headers.get("content-length") ?? 0);
  if (tamanho > MAX_CORPO_BYTES) {
    return Response.json({ error: "Mensagem grande de mais." }, { status: 413 });
  }

  const ip = ipDe(request);

  /* Este limite é largo de propósito: conta *pedidos*, não envios, e existe só
     para travar quem dispara em ciclo. Quem escreve o email mal três vezes
     seguidas não fica de fora por causa dele — para isso está o `LIMITE_ENVIOS`
     mais abaixo, que só conta o que chegou a sair. */
  if (passouDoLimite(pedidos, ip, LIMITE_PEDIDOS)) {
    return Response.json({ error: "Demasiados pedidos." }, { status: 429 });
  }

  const bruto = await lerCorpoLimitado(request, MAX_CORPO_BYTES);
  if (bruto === null) {
    return Response.json({ error: "Mensagem grande de mais." }, { status: 413 });
  }

  let corpo: unknown;
  try {
    corpo = JSON.parse(bruto || "{}");
  } catch {
    return Response.json({ error: "Corpo inválido." }, { status: 400 });
  }

  /* Um corpo como `[1,2,3]` ou `"olá"` é JSON válido e não é um objeto. Sem
     isto, o `dados.name` que vem a seguir lia uma propriedade de um array. */
  const dados =
    corpo && typeof corpo === "object" && !Array.isArray(corpo)
      ? (corpo as Record<string, unknown>)
      : {};

  /* Armadilha antes do resto: responder 200 sem enviar nada faz o bot seguir
     caminho convencido de que passou. */
  if (String(dados[HONEYPOT] ?? "").trim()) {
    return Response.json({ ok: true });
  }

  /**
   * Tipo certo antes de tamanho certo: um `String(...)` a um valor que não é
   * texto produz coisas como `"[object Object]"` ou `"1,2"`, que depois passam
   * pela validação como se fossem um nome. O que não é `string` não é um campo
   * preenchido — é lixo, e trata-se como vazio.
   *
   * O corte é um a mais do que o limite de propósito: assim o valor continua a
   * ser longo de mais aos olhos do `validarContacto`, que devolve a mensagem de
   * erro certa em vez de aceitar em silêncio uma versão truncada.
   */
  const campo = (valor: unknown, maximo: number): string =>
    typeof valor === "string" ? valor.slice(0, maximo + 1) : "";

  const contacto: Contacto = {
    name: campo(dados.name, LIMITES.name),
    email: campo(dados.email, LIMITES.email),
    message: campo(dados.message, LIMITES.message),
  };

  const errors = validarContacto(contacto);
  if (CAMPOS.some((campo) => errors[campo])) {
    return Response.json({ errors }, { status: 400 });
  }

  if (passouDoLimite(envios, ip, LIMITE_ENVIOS)) {
    return Response.json(
      { error: "Demasiados envios seguidos." },
      { status: 429 },
    );
  }

  if (tetoDiarioAtingido()) {
    /* Não é culpa de quem está a escrever, e por isso a mensagem não o trata
       como abusador. O 503 diz a quem lê os logs que fomos nós que fechámos a
       porta, e não o Resend que recusou. */
    console.error("[contacto] teto diário de envios atingido");
    return Response.json(
      { error: "Serviço indisponível de momento." },
      { status: 503 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    /* Sem chave o site não finge que enviou: a mensagem perder-se-ia em
       silêncio, que é exatamente o problema que este endpoint veio resolver. */
    console.error(
      "[contacto] RESEND_API_KEY em falta — a mensagem não foi enviada.",
    );
    return Response.json({ error: "Serviço indisponível." }, { status: 500 });
  }

  const texto = [
    `Nome: ${contacto.name}`,
    `Email: ${contacto.email}`,
    "",
    contacto.message,
  ].join("\n");

  const html = [
    `<p><strong>Nome:</strong> ${escaparHtml(contacto.name)}</p>`,
    `<p><strong>Email:</strong> ${escaparHtml(contacto.email)}</p>`,
    `<p style="white-space:pre-wrap">${escaparHtml(contacto.message)}</p>`,
  ].join("");

  const { data, error } = await new Resend(apiKey).emails.send({
    from: site.emailFrom,
    to: site.email,
    /* O ponto todo: carregar em "Responder" na caixa responde ao visitante, e
       não a nós próprios. */
    replyTo: contacto.email,
    subject: umaLinha(`Novo contacto de ${contacto.name}`),
    text: texto,
    html,
  });

  if (error) {
    /* Só a razão da falha. O `error` do Resend não traz o corpo da mensagem,
       mas traz o destinatário — e os logs não são sítio para dados de
       ninguém. */
    console.error("[contacto] o Resend recusou o envio:", error.name);
    return Response.json({ error: "Não foi possível enviar." }, { status: 502 });
  }

  enviadosHoje.total += 1;

  /* O `id` do Resend chega para seguir o rasto de uma mensagem até à caixa. O
     email de quem escreveu **não** vai para os logs: é um dado pessoal, e os
     logs da Vercel ficam guardados e visíveis a quem tenha acesso ao projeto. */
  console.log(`[contacto] enviado (${data?.id})`);
  return Response.json({ ok: true });
}
