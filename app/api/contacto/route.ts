/** docs: docs/04-componentes-e-padroes.md — ver "O formulário de contacto". */

import { Resend } from "resend";
import { site } from "@/lib/site";
import {
  CAMPOS,
  HONEYPOT,
  validarContacto,
  type Contacto,
} from "@/lib/contacto";

/* Em Next 16 os handlers POST correm sempre a pedido e nunca são cacheados —
   não é preciso `export const dynamic`. O runtime Node (o predefinido) é o que
   o SDK do Resend quer. */

/** Máximo de envios por IP dentro da janela. */
const LIMITE = 3;
const JANELA_MS = 10 * 60 * 1000;

/* Travão de rajada *best-effort*. Em serverless cada instância tem a sua
   memória, por isso isto não é uma garantia — trava o script trivial que
   dispara em ciclo e mais nada. Se um dia for preciso a sério, o sítio de o
   fazer é à frente da função (WAF/Vercel Firewall), não aqui. */
const envios = new Map<string, number[]>();

function emRajada(ip: string): boolean {
  const agora = Date.now();
  const recentes = (envios.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);

  if (recentes.length >= LIMITE) {
    envios.set(ip, recentes);
    return true;
  }

  recentes.push(agora);
  envios.set(ip, recentes);
  return false;
}

/** `x-forwarded-for` é uma lista; o cliente real é o primeiro. */
function ipDe(request: Request): string {
  const encaminhado = request.headers.get("x-forwarded-for");
  return encaminhado?.split(",")[0]?.trim() || "desconhecido";
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return Response.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const dados = (corpo ?? {}) as Record<string, unknown>;

  /* Armadilha antes de tudo o resto: responder 200 sem enviar nada faz o bot
     seguir caminho convencido de que passou. */
  if (String(dados[HONEYPOT] ?? "").trim()) {
    return Response.json({ ok: true });
  }

  const contacto: Contacto = {
    name: String(dados.name ?? ""),
    email: String(dados.email ?? ""),
    message: String(dados.message ?? ""),
  };

  const errors = validarContacto(contacto);
  if (CAMPOS.some((campo) => errors[campo])) {
    return Response.json({ errors }, { status: 400 });
  }

  if (emRajada(ipDe(request))) {
    return Response.json(
      { error: "Demasiados envios seguidos." },
      { status: 429 },
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
    subject: `Novo contacto de ${contacto.name}`,
    text: texto,
    html,
  });

  if (error) {
    console.error("[contacto] o Resend recusou o envio:", error);
    return Response.json({ error: "Não foi possível enviar." }, { status: 502 });
  }

  console.log(`[contacto] enviado (${data?.id}) de ${contacto.email}`);
  return Response.json({ ok: true });
}
