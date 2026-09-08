/** docs: docs/07-estudio.md */
import {
  ESTADOS,
  PERIODICIDADES,
  TIPOS_RECEITA,
  type Estado,
  type Periodicidade,
  type TipoReceita,
} from "@/lib/estudio/tipos";

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
    | "nome"
    | "estado"
    | "progresso"
    | "valor"
    | "inicio"
    | "prazo"
    | "repoUrl"
    | "deployUrl"
    | "notas",
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
  "valor",
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
  valor: string;
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

  /* Vazio vale: um projeto pode existir muito antes de haver preço combinado,
     e `null` na base quer dizer isso mesmo — não é zero. */
  const valor = validarValor(dados.valor, { vazioVale: true });
  if (valor) erros.valor = valor;

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

/* ------------------------------------------------------------------------
   Dinheiro
   ------------------------------------------------------------------------ */

/** `numeric(10,2)` na base dá quase cem milhões. Isto é um teto de sanidade
 *  muito abaixo disso: um valor com sete dígitos num estúdio de três pessoas é
 *  quase de certeza um zero a mais. */
export const VALOR_MAXIMO = 9_999_999.99;

/**
 * Lê um valor em euros escrito por uma pessoa. Devolve `null` se não der.
 *
 * Em Portugal escreve-se `1.500,50`, e um `parseFloat` disso dá `1`. As regras
 * são estas, e são deliberadamente previsíveis em vez de espertas:
 *
 * - Se houver **vírgula**, a vírgula é o decimal e os pontos são milhares.
 *   `1.500,50` -> 1500.50
 * - Se só houver **ponto**, é decimal quando tem 1 ou 2 dígitos a seguir, e
 *   milhares nos outros casos. `1.50` -> 1.50, `1.500` -> 1500.
 * - `€`, espaços e espaços duros são ignorados.
 *
 * O caso ambíguo (`1.500` querer dizer um euro e meio) não existe na prática:
 * ninguém escreve o preço de um trabalho assim.
 */
export function lerValor(texto: string): number | null {
  const limpo = texto
    .replace(/[\s  ]/g, "")
    .replace(/€/g, "")
    .trim();

  if (!limpo) return null;
  if (!/^-?[\d.,]+$/.test(limpo)) return null;

  let normalizado: string;

  if (limpo.includes(",")) {
    normalizado = limpo.replace(/\./g, "").replace(",", ".");
  } else {
    const ponto = limpo.lastIndexOf(".");
    const decimais = ponto === -1 ? -1 : limpo.length - ponto - 1;
    normalizado =
      decimais === 1 || decimais === 2 ? limpo : limpo.replace(/\./g, "");
  }

  const numero = Number(normalizado);
  if (!Number.isFinite(numero)) return null;

  /* Arredonda aos cêntimos aqui, uma vez, para não haver um `1500.0000001` a
     chegar à base e a estragar somas depois. */
  return Math.round(numero * 100) / 100;
}

/**
 * Valida um valor em euros. Devolve a mensagem de erro, ou `undefined`.
 *
 * `vazioVale` para os campos onde não ter valor é uma resposta legítima — o
 * `projetos.valor` por combinar, por exemplo. `null` na base quer dizer "ainda
 * não se combinou", que não é a mesma coisa que zero.
 */
export function validarValor(
  texto: string,
  { vazioVale = false, minimo = 0.01 } = {},
): string | undefined {
  if (!texto.trim()) {
    return vazioVale ? undefined : "Escreve o valor.";
  }

  const valor = lerValor(texto);
  if (valor === null) return "Escreve o valor em euros, por exemplo 1500,50.";
  if (valor < 0) return "O valor não pode ser negativo.";
  if (valor < minimo) return `O valor tem de ser pelo menos ${minimo}.`;
  if (valor > VALOR_MAXIMO) return "Esse valor parece ter um zero a mais.";

  return undefined;
}

export function ePeriodicidade(valor: string): valor is Periodicidade {
  return (PERIODICIDADES as readonly string[]).includes(valor);
}

export type ErrosGasto = Partial<
  Record<"valor" | "data" | "descricao" | "periodicidade", string>
>;

export function validarGasto(dados: {
  valor: string;
  data: string;
  descricao: string;
  periodicidade: string;
}): ErrosGasto {
  const erros: ErrosGasto = {};

  if (!ePeriodicidade(dados.periodicidade))
    erros.periodicidade = "Escolhe de quanto em quanto tempo se paga.";

  const valor = validarValor(dados.valor);
  if (valor) erros.valor = valor;

  if (!dados.data.trim()) erros.data = "Escolhe a data no calendário.";
  else if (!DATA.test(dados.data)) erros.data = "Escolhe a data no calendário.";

  if (!dados.descricao.trim())
    erros.descricao = "Diz do que é o gasto, nem que seja numa palavra.";
  else if (dados.descricao.length > LIMITES.nome)
    erros.descricao = `A descrição não pode passar dos ${LIMITES.nome} caracteres.`;

  return erros;
}

export type ErrosPagamento = Partial<Record<"valor" | "data", string>>;

export function validarPagamento(dados: {
  valor: string;
  data: string;
}): ErrosPagamento {
  const erros: ErrosPagamento = {};

  const valor = validarValor(dados.valor);
  if (valor) erros.valor = valor;

  if (!dados.data.trim() || !DATA.test(dados.data))
    erros.data = "Escolhe a data em que o dinheiro entrou.";

  return erros;
}

export type ErrosReceita = Partial<
  Record<"valor" | "tipo" | "periodicidade" | "desde" | "ate", string>
>;

export function eTipoReceita(valor: string): valor is TipoReceita {
  return (TIPOS_RECEITA as readonly string[]).includes(valor);
}

/**
 * O alojamento e o domínio de um site.
 *
 * O mínimo é zero e não um cêntimo: uma receita a zero é uma coisa que
 * acontece — um cliente em cortesia durante uns meses — e é diferente de não
 * ter receita nenhuma.
 */
export function validarReceita(dados: {
  valor: string;
  tipo: string;
  periodicidade: string;
  desde: string;
  ate: string;
}): ErrosReceita {
  const erros: ErrosReceita = {};

  const valor = validarValor(dados.valor, { minimo: 0 });
  if (valor) erros.valor = valor;

  if (!eTipoReceita(dados.tipo)) erros.tipo = "Escolhe do que é a receita.";

  if (!ePeriodicidade(dados.periodicidade))
    erros.periodicidade = "Escolhe de quanto em quanto tempo é paga.";

  if (!dados.desde.trim() || !DATA.test(dados.desde))
    erros.desde = "Escolhe desde quando é que conta.";

  if (dados.ate.trim()) {
    if (!DATA.test(dados.ate)) erros.ate = "Escolhe a data no calendário.";
    else if (!erros.desde && dados.ate < dados.desde)
      erros.ate = "A data de fim é antes do início — troca as datas.";
  }

  return erros;
}
