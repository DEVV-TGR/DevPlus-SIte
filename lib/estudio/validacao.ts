/** docs: docs/07-estudio.md */
import { ESTADOS, type Estado } from "@/lib/estudio/tipos";

/**
 * As regras dos formulários do Estúdio, num só sítio — o formulário valida para
 * dar resposta imediata, a ação valida porque um POST não tem de passar pelo
 * formulário. É a mesma escolha de `lib/contacto.ts`, e pela mesma razão: duas
 * cópias das regras divergem ao segundo mês.
 *
 * A voz das mensagens é a do resto do site (ver docs/01): fala-se por "tu" e
 * diz-se o que fazer, não o que está errado.
 */

export const LIMITES = {
  nome: 120,
  email: 200,
  telefone: 40,
  url: 500,
  notas: 5000,
  tarefa: 300,
} as const;

export type ErrosProjeto = Partial<
  Record<
    "nome" | "estado" | "progresso" | "inicio" | "prazo" | "repoUrl" | "deployUrl" | "notas",
    string
  >
>;

export type ErrosCliente = Partial<
  Record<"nome" | "email" | "telefone" | "notas", string>
>;

/** A ordem conta: é por ela que o formulário decide onde pôr o foco. */
export const CAMPOS_PROJETO = [
  "nome",
  "estado",
  "progresso",
  "inicio",
  "prazo",
  "repoUrl",
  "deployUrl",
  "notas",
] as const;

export const CAMPOS_CLIENTE = ["nome", "email", "telefone", "notas"] as const;

/* Tão permissiva como a de `lib/contacto.ts`, e pela mesma razão: validar email
   a sério por regex é impossível, e o endereço confirma-se é ao escrever. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Datas civis, `YYYY-MM-DD`. É o que o `<input type="date">` envia. */
const DATA = /^\d{4}-\d{2}-\d{2}$/;

export function eEstado(valor: string): valor is Estado {
  return (ESTADOS as readonly string[]).includes(valor);
}

/** Um endereço que o browser saiba abrir. Aceita-se vazio; o que não se aceita
 *  é um `javascript:` disfarçado de link num campo que depois vira `<a href>`. */
function urlValida(valor: string): boolean {
  try {
    const url = new URL(valor);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export type DadosProjeto = {
  nome: string;
  clienteId: string;
  estado: string;
  progresso: string;
  inicio: string;
  prazo: string;
  repoUrl: string;
  deployUrl: string;
  notas: string;
};

export function validarProjeto(dados: DadosProjeto): ErrosProjeto {
  const erros: ErrosProjeto = {};

  if (!dados.nome.trim()) erros.nome = "Dá um nome ao projeto.";
  else if (dados.nome.length > LIMITES.nome)
    erros.nome = `O nome não pode passar dos ${LIMITES.nome} caracteres.`;

  if (!eEstado(dados.estado)) erros.estado = "Escolhe um estado da lista.";

  const progresso = Number(dados.progresso);
  if (!Number.isInteger(progresso) || progresso < 0 || progresso > 100)
    erros.progresso = "O progresso é um número de 0 a 100.";

  if (dados.inicio && !DATA.test(dados.inicio))
    erros.inicio = "Escolhe uma data de início no calendário.";

  if (dados.prazo && !DATA.test(dados.prazo))
    erros.prazo = "Escolhe um prazo no calendário.";

  /* Um prazo antes do início não é um erro de distração: é um dos dois campos
     preenchido no sítio errado, e mais vale dizê-lo já. */
  if (!erros.inicio && !erros.prazo && dados.inicio && dados.prazo)
    if (dados.prazo < dados.inicio)
      erros.prazo = "O prazo é antes do início — troca as datas.";

  if (dados.repoUrl.trim() && !urlValida(dados.repoUrl.trim()))
    erros.repoUrl = "O link do repositório tem de começar por https://.";

  if (dados.deployUrl.trim() && !urlValida(dados.deployUrl.trim()))
    erros.deployUrl = "O link do site tem de começar por https://.";

  if (dados.notas.length > LIMITES.notas)
    erros.notas = `As notas não podem passar dos ${LIMITES.notas} caracteres.`;

  return erros;
}

export type DadosCliente = {
  nome: string;
  email: string;
  telefone: string;
  notas: string;
};

export function validarCliente(dados: DadosCliente): ErrosCliente {
  const erros: ErrosCliente = {};

  if (!dados.nome.trim()) erros.nome = "Escreve o nome do cliente.";
  else if (dados.nome.length > LIMITES.nome)
    erros.nome = `O nome não pode passar dos ${LIMITES.nome} caracteres.`;

  if (dados.email.trim()) {
    if (dados.email.length > LIMITES.email)
      erros.email = `O email não pode passar dos ${LIMITES.email} caracteres.`;
    else if (!EMAIL.test(dados.email.trim()))
      erros.email = "Este email parece ter alguma coisa trocada.";
  }

  if (dados.telefone.length > LIMITES.telefone)
    erros.telefone = `O telefone não pode passar dos ${LIMITES.telefone} caracteres.`;

  if (dados.notas.length > LIMITES.notas)
    erros.notas = `As notas não podem passar dos ${LIMITES.notas} caracteres.`;

  return erros;
}

export function validarTarefa(texto: string): string | undefined {
  if (!texto.trim()) return "Escreve a tarefa antes de a juntares.";
  if (texto.length > LIMITES.tarefa)
    return `A tarefa não pode passar dos ${LIMITES.tarefa} caracteres.`;
  return undefined;
}

/** Um campo do `FormData` como texto, com teto. Sem isto, um POST direto
 *  empurra megabytes para dentro da base — é a mesma defesa do
 *  `app/api/contacto/route.ts`. */
export function campo(valor: FormDataEntryValue | null, maximo: number): string {
  return typeof valor === "string" ? valor.slice(0, maximo + 1) : "";
}

/** Texto vazio vira `null`: na base, "não preenchido" é `null` e não `''`. */
export function ouNulo(valor: string): string | null {
  const limpo = valor.trim();
  return limpo === "" ? null : limpo;
}
