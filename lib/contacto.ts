/** docs: docs/04-componentes-e-padroes.md — ver "O formulário de contacto". */

/**
 * As regras do formulário de contacto, num só sítio. O cliente valida para dar
 * resposta imediata; o servidor valida porque um POST não tem de passar pelo
 * formulário. Duas cópias das regras divergiam ao segundo mês.
 */
import { services } from "@/lib/services";
import { packages } from "@/lib/packages";

export type Contacto = {
  /** Os atalhos escolhidos no topo do formulário (ids de `INTERESSES`). */
  interesses: string[];
  name: string;
  email: string;
  message: string;
};
export type ErrosContacto = Partial<Record<keyof Contacto, string>>;

/** A ordem conta: é por ela que o formulário decide onde pôr o foco. */
export const CAMPOS = ["interesses", "name", "email", "message"] as const;

/** Sem tetos, um POST direto empurra megabytes para dentro da caixa de email. */
export const LIMITES = { name: 100, email: 200, message: 5000 } as const;

/** `Menus & Ecrãs Digitais` -> `menus-ecras-digitais`. O id que vai no URL. */
export function idInteresse(rotulo: string): string {
  return rotulo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type Interesse = { id: string; rotulo: string };

/**
 * Os atalhos do topo do formulário, em três grupos (docs/05).
 *
 * A **demo grátis** é um compromisso comercial confirmado pela equipa: é de
 * qualquer serviço, mas **só da parte visual** — as funcionalidades
 * discutem-se e personalizam-se depois. A nota do formulário diz isto mesmo,
 * e não se promete mais do que isto em lado nenhum. Não há "orçamento grátis".
 *
 * Os serviços e os pacotes vêm das listas de `lib/services.ts` e
 * `lib/packages.ts`: um serviço novo ganha atalho sem se mexer aqui.
 */
export const GRUPOS_INTERESSE: { titulo: string; itens: Interesse[] }[] = [
  { titulo: "Para começar", itens: [{ id: "demo", rotulo: "Pedir demo grátis" }] },
  {
    titulo: "Serviços",
    itens: services.map((s) => ({ id: idInteresse(s.title), rotulo: s.title })),
  },
  {
    titulo: "Pacotes",
    itens: packages.map((p) => ({ id: idInteresse(p.name), rotulo: p.name })),
  },
];

export const INTERESSES: Interesse[] = GRUPOS_INTERESSE.flatMap((g) => g.itens);
const IDS = new Set(INTERESSES.map((i) => i.id));

/** Só os ids que existem, sem repetidos, pela ordem do formulário. */
export function limparInteresses(valores: unknown): string[] {
  const lista = Array.isArray(valores) ? valores : [];
  return INTERESSES.map((i) => i.id).filter((id) => lista.includes(id));
}

/**
 * O endereço de um botão que já sabe do que se vai falar: o "Pedir proposta"
 * da Landing page abre o contacto com a Landing page escolhida. Um rótulo que
 * não seja um atalho dá o contacto simples, nunca um link partido.
 */
export function contactoCom(...rotulos: string[]): string {
  const ids = rotulos.map(idInteresse).filter((id) => IDS.has(id));
  return ids.length ? `/contacto?interesse=${ids.join(",")}` : "/contacto";
}

/* Deliberadamente permissiva: validar email a sério é impossível por regex, e o
   endereço confirma-se é ao responder. Isto só apanha o erro de distração. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* As mensagens estão aqui e não no formulário porque o servidor devolve estas
   mesmas, e o visitante não tem de perceber qual dos dois o travou. A voz é a
   do resto do site — ver docs/01: fala-se por "tu" e diz-se o que fazer, não o
   que está errado. "Email inválido." não é uma frase que se diga a alguém. */
export function validarContacto(data: Contacto): ErrosContacto {
  const errors: ErrosContacto = {};

  /* Só se chega aqui com um POST montado à mão: o formulário só tem caixas
     para os atalhos que existem. */
  if (
    data.interesses.length > INTERESSES.length ||
    data.interesses.some((id) => !IDS.has(id))
  )
    errors.interesses = "Escolhe só entre as opções do formulário.";

  if (!data.name.trim()) errors.name = "Diz-nos como te chamas.";
  else if (data.name.length > LIMITES.name)
    errors.name = `O nome não pode passar dos ${LIMITES.name} caracteres.`;

  if (!data.email.trim())
    errors.email = "Precisamos do teu email para responder.";
  else if (data.email.length > LIMITES.email)
    errors.email = `O email não pode passar dos ${LIMITES.email} caracteres.`;
  else if (!EMAIL.test(data.email))
    errors.email = "Este email parece ter alguma coisa trocada.";

  if (!data.message.trim())
    errors.message = "Conta-nos o que precisas, nem que seja em duas linhas.";
  else if (data.message.length > LIMITES.message)
    errors.message = `A mensagem não pode passar dos ${LIMITES.message} caracteres.`;

  return errors;
}

/**
 * O nome do campo-armadilha. Está no formulário fora do ecrã: uma pessoa nunca
 * o vê nem lhe chega por teclado, um bot que preenche tudo cai nele.
 */
export const HONEYPOT = "website";
