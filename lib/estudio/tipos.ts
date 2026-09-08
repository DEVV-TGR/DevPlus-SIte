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
 * Os seis estados por que um trabalho passa, por ordem de vida.
 *
 * A ordem do array é a ordem por que aparecem nos filtros e nos seletores —
 * mudá-la muda o site. `parado` fica no fim de propósito: é a exceção, não uma
 * etapa.
 *
 * `a-espera` e `visita` ficam a seguir a `em-curso` porque é aí que acontecem:
 * um trabalho não nasce bloqueado, fica-o a meio. São os dois estados que
 * explicam quase todos os atrasos, e **são bloqueios diferentes**:
 *
 * - `a-espera` — a bola está com o cliente. Falta ele responder.
 * - `visita` — a bola está connosco. Falta lá ir, quase sempre outra vez,
 *   porque da primeira não estavam ou não havia tempo.
 *
 * Sem os separar, os dois cairiam em `parado`, e "parado" não diz a quem se há
 * de ligar nem quem tem de se mexer.
 */
export const ESTADOS = [
  "proposta",
  "em-curso",
  "a-espera",
  "visita",
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
  /* Diz o que falta fazer, que é o tom do resto do site. "Visita por marcar"
     não serve — nem sempre é de marcar; "Por visitar" soa a que nunca lá se foi,
     e o caso normal é ter de voltar porque não estavam. */
  visita: "Falta ir lá",
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
  /** O que ficou combinado, **sem IVA**. `null` = ainda não se combinou, que
   *  não é a mesma coisa que zero. */
  valor: number | null;
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
 * Todos os outros contam como atrasados, e é de propósito: parar não é
 * entregar, e um prazo que passou enquanto se esperava por um cliente — ou
 * enquanto faltava lá ir — continua a ser um prazo que passou. É precisamente
 * aí que se liga a perguntar, ou que se mete o carro a andar. Esconder o atraso
 * era a forma mais rápida de ele ser esquecido.
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

/* ------------------------------------------------------------------------
   Dinheiro

   Todos os valores são **sem IVA**. O IVA nunca foi nosso: passa por nós para
   o Estado, e metê-lo aqui inflacionava a margem com dinheiro que não é do
   estúdio. Os campos dizem-no, para ninguém ter de adivinhar ao escrever.

   E não se chama "lucro" a nada. Receitas menos gastos, sem ordenados e sem
   impostos, é **margem** — chamar-lhe lucro dava um número confortável e
   errado, e é sobre números destes que se decide contratar alguém.
   ------------------------------------------------------------------------ */

export type Pagamento = {
  id: number;
  projetoId: number;
  valor: number;
  data: string;
  descricao: string | null;
};

export type Mensalidade = {
  id: number;
  clienteId: number;
  valor: number;
  desde: string;
  /** `null` = ainda ativa. */
  ate: string | null;
  notas: string | null;
};

/**
 * De quanto em quanto tempo se paga um gasto.
 *
 * Um booleano "recorrente" não chegava: um domínio paga-se uma vez por ano e o
 * alojamento todos os meses, e somar os dois como se fossem a mesma coisa dava
 * um custo fixo errado por doze vezes.
 */
export const PERIODICIDADES = ["unica", "semanal", "mensal", "anual"] as const;

export type Periodicidade = (typeof PERIODICIDADES)[number];

export const ROTULO_PERIODICIDADE: Record<Periodicidade, string> = {
  unica: "Uma vez só",
  semanal: "Todas as semanas",
  mensal: "Todos os meses",
  anual: "Todos os anos",
};

/** Curto, para caber na etiqueta ao lado de um gasto na lista. */
export const ROTULO_CURTO: Record<Periodicidade, string> = {
  unica: "uma vez",
  semanal: "semanal",
  mensal: "mensal",
  anual: "anual",
};

/**
 * Quanto é que cada periodicidade custa por mês.
 *
 * `52 / 12` e não `4`: um ano tem 52 semanas, não 48, e arredondar para quatro
 * escondia quase um mês de despesa por ano. `unica` vale zero — um gasto que
 * aconteceu uma vez não é custo fixo, é história.
 */
export const POR_MES: Record<Periodicidade, number> = {
  unica: 0,
  semanal: 52 / 12,
  mensal: 1,
  anual: 1 / 12,
};

export type Gasto = {
  id: number;
  /** `null` = gasto do estúdio, não de um projeto. */
  projetoId: number | null;
  projetoNome: string | null;
  valor: number;
  data: string;
  descricao: string;
  periodicidade: Periodicidade;
};

/** As contas de um projeto: o que se combinou, o que entrou, o que falta. */
export type ContasProjeto = {
  /** `null` = ainda não se combinou valor. Diferente de zero. */
  valor: number | null;
  recebido: number;
  /** `valor - recebido`, nunca abaixo de zero — quem pagou a mais não fica a
   *  dever negativo, e somar negativos escondia dívidas de outros projetos. */
  porCobrar: number;
  gastos: number;
};

export function formatarEuros(valor: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(valor);
}

/** `2026-09` -> `set 26`. Para os eixos dos gráficos, onde não cabe mais. */
export function formatarMes(mes: string): string {
  const [ano, m] = mes.split("-").map(Number);
  const nome = new Intl.DateTimeFormat("pt-PT", {
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(ano, m - 1, 1)));
  return `${nome} ${String(ano).slice(2)}`;
}

/** Um mês na história do dinheiro. Vive aqui, e não em `dados.ts`, para os
 *  gráficos não terem de importar tipos do módulo que fala com a base. */
export type MesDeContas = { mes: string; entradas: number; saidas: number };
