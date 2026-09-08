/** docs: docs/07-estudio.md */

/**
 * Os tipos do Estúdio, num só sítio. Batem certo com `lib/estudio/schema.sql` —
 * se mexeres num, mexe no outro na mesma sessão.
 *
 * Nada disto tem que ver com `lib/projects.ts`: essa lista é o portfólio
 * público, curado, escrito à mão e versionado. Isto é gestão interna e vive na
 * base de dados. Um projeto pode existir aqui durante meses antes de alguma vez
 * chegar ao portfólio — e a maioria nunca lá chega.
 */

/** Quem entra no Estúdio. Não confundir com o `Membro` de `lib/site.ts`, que é
 *  quem atende o telefone e aparece no site público. */
export type Utilizador = {
  id: number;
  githubLogin: string;
  nome: string;
  avatarUrl: string | null;
};

/**
 * Os cinco estados por que um trabalho passa, por ordem de vida.
 *
 * A ordem do array é a ordem por que aparecem nos filtros e nos seletores —
 * mudá-la muda o site. `parado` fica no fim de propósito: é a exceção, não uma
 * etapa.
 *
 * `a-espera` fica a seguir a `em-curso` porque é aí que acontece: um trabalho
 * não nasce à espera do cliente, fica-o a meio. É o estado que explica metade
 * dos atrasos — sem ele, um projeto parado à espera de uma resposta é
 * indistinguível de um projeto parado porque ninguém lhe pegou.
 */
export const ESTADOS = [
  "proposta",
  "em-curso",
  "a-espera",
  "entregue",
  "parado",
] as const;

export type Estado = (typeof ESTADOS)[number];

/** O que se lê no ecrã. O valor guardado é o da chave, sempre. */
export const ROTULO_ESTADO: Record<Estado, string> = {
  proposta: "Proposta",
  "em-curso": "Em curso",
  /* Diz de quem é a bola. "Pendente" é jargão, "Em espera" não diz de quem, e
     "Bloqueado" soa a culpa — isto só diz onde a coisa está parada. */
  "a-espera": "À espera do cliente",
  entregue: "Entregue",
  parado: "Parado",
};

export type Cliente = {
  id: number;
  nome: string;
  email: string | null;
  telefone: string | null;
  notas: string | null;
};

export type Projeto = {
  id: number;
  nome: string;
  clienteId: number | null;
  clienteNome: string | null;
  estado: Estado;
  /** 0 a 100. É escrito à mão — não se calcula a partir das tarefas, porque
   *  metade do trabalho de um projeto nunca chega a virar tarefa. */
  progresso: number;
  /** `YYYY-MM-DD` ou `null`. Datas civis, sem hora e sem fuso: um prazo é um
   *  dia, e passá-lo por `timestamptz` fazia-o saltar um dia consoante quem o
   *  lia. Ver docs/07. */
  inicio: string | null;
  prazo: string | null;
  repoUrl: string | null;
  deployUrl: string | null;
  notas: string | null;
  responsaveis: Utilizador[];
};

export type Tarefa = {
  id: number;
  projetoId: number;
  texto: string;
  feita: boolean;
  ordem: number;
};

/**
 * Um prazo está em atraso se já passou e o projeto ainda não está entregue.
 *
 * `parado` e `a-espera` continuam a contar como atrasados, e é de propósito:
 * parar não é entregar, e um prazo que passou enquanto se espera por um cliente
 * continua a ser um prazo que passou — é precisamente quando se lhe liga a
 * perguntar. Esconder o atraso era a forma mais rápida de ele ser esquecido.
 *
 * Compara-se em `YYYY-MM-DD`, que ordena bem como texto e não envolve fusos.
 */
export function emAtraso(projeto: Projeto, hoje: string): boolean {
  if (!projeto.prazo) return false;
  if (projeto.estado === "entregue") return false;
  return projeto.prazo < hoje;
}

/** A data de hoje em `YYYY-MM-DD`, no fuso de Lisboa. `new Date()` no servidor
 *  dá UTC, e entre a meia-noite e a uma da manhã UTC isso é ontem em Portugal —
 *  o que punha um prazo a aparecer atrasado um dia antes de o estar. */
export function hojeEmLisboa(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * `2026-09-08` -> `8 set 2026`.
 *
 * Constrói-se a data em UTC **e** formata-se em UTC. Com qualquer um dos dois
 * em falta, o dia saltava para trás nos meses de verão — que é exatamente o bug
 * que as datas civis desta base existem para não ter.
 */
export function formatarData(data: string): string {
  const [ano, mes, dia] = data.split("-").map(Number);

  return new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(ano, mes - 1, dia)));
}

/**
 * Um projeto reduzido ao que o seletor de repositórios precisa de saber.
 *
 * Existe para o seletor não ter de carregar responsáveis, tarefas e datas só
 * para desenhar uma linha com uma caixa ao lado.
 */
export type ProjetoLeve = {
  id: number;
  nome: string;
  repoUrl: string | null;
  clienteId: number | null;
};
