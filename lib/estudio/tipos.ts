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
  /** Quem fica com ela. `null` = ainda ninguém. */
  utilizadorId: number | null;
  utilizadorNome: string | null;
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
 * `2026-09-08` -> `08/09/2026`.
 *
 * O `month: "short"` está lá de propósito e não é engano: em `pt-PT` o ICU
 * responde-lhe com a data toda em números, que é como se escrevem datas cá.
 * Pedir `month: "long"` daria "8 de setembro de 2026", comprido de mais para
 * uma lista.
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

/**
 * O que o cliente paga de forma recorrente por um site.
 *
 * **Não se chama mensalidade**, e é de propósito: há clientes que pagam ao ano.
 * O `tipo` diz o que a coisa é; a `periodicidade` diz de quanto em quanto tempo
 * se paga. Um campo chamado "mensalidade" onde se escreve um valor anual é um
 * campo que mente, e a soma sairia doze vezes errada.
 */
export const TIPOS_RECEITA = ["alojamento", "dominio"] as const;

export type TipoReceita = (typeof TIPOS_RECEITA)[number];

export const ROTULO_RECEITA: Record<TipoReceita, string> = {
  alojamento: "Alojamento e apoio",
  dominio: "Domínio",
};

export type Receita = {
  id: number;
  projetoId: number;
  tipo: TipoReceita;
  valor: number;
  periodicidade: Periodicidade;
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

/** `2026-09` -> `setembro de 2026`. Para os cabeçalhos que separam os meses numa
 *  lista, onde `set 26` ficaria a dizer menos do que o espaço permite. */
export function formatarMesLongo(mes: string): string {
  const [ano, m] = mes.split("-").map(Number);
  const nome = new Intl.DateTimeFormat("pt-PT", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(ano, m - 1, 1)));
  return `${nome} de ${ano}`;
}

/**
 * Parte uma lista já ordenada em blocos de mês, sem lhe mexer na ordem.
 *
 * Recebe a lista pela ordem em que vai ser mostrada e devolve-a agrupada por
 * `YYYY-MM`. **Não ordena nada**: quem ordena é o `order by` da consulta, e se
 * esta função também ordenasse passavam a existir duas fontes para a mesma
 * decisão. Se a lista vier baralhada, sai baralhada em blocos — e é isso que se
 * quer, porque o bug fica à vista em vez de ser escondido aqui.
 */
export function agruparPorMes<T extends { data: string }>(
  itens: T[],
): { mes: string; itens: T[] }[] {
  const blocos: { mes: string; itens: T[] }[] = [];

  for (const item of itens) {
    const mes = item.data.slice(0, 7);
    const ultimo = blocos[blocos.length - 1];

    if (ultimo && ultimo.mes === mes) ultimo.itens.push(item);
    else blocos.push({ mes, itens: [item] });
  }

  return blocos;
}

/**
 * Parte uma lista de projetos **já ordenada** em blocos de estado.
 *
 * Irmão do `agruparPorMes()`, e com a mesma regra: **não ordena nada**. Quem
 * ordena é o `order by` de `listarProjetos()`, que já põe os estados na ordem de
 * atenção (em curso, falta ir lá, à espera, proposta). Ordenar aqui outra vez
 * criava uma segunda fonte para a mesma decisão, e um dia as duas discordavam.
 */
export function agruparPorEstado<T extends { estado: Estado }>(
  itens: T[],
): { estado: Estado; itens: T[] }[] {
  const blocos: { estado: Estado; itens: T[] }[] = [];

  for (const item of itens) {
    const ultimo = blocos[blocos.length - 1];

    if (ultimo && ultimo.estado === item.estado) ultimo.itens.push(item);
    else blocos.push({ estado: item.estado, itens: [item] });
  }

  return blocos;
}

/* ------------------------------------------------------------------------
   Períodos

   A janela de tempo por que se olha para o dinheiro nos gráficos do resumo.
   Vive aqui, e não em `dados.ts`, porque quem a lê primeiro é a página — o
   valor vem do endereço, e tem de ser validado antes de chegar perto do SQL.
   ------------------------------------------------------------------------ */

export const PERIODOS = ["mes", "ano", "sempre"] as const;

export type Periodo = (typeof PERIODOS)[number];

/** O que se lê na pastilha do filtro. Curto: são três a competir por uma linha
 *  ao lado de um título. */
export const ROTULO_PERIODO: Record<Periodo, string> = {
  mes: "Mês",
  ano: "Ano",
  sempre: "Desde sempre",
};

/** O mesmo, em texto corrido, para o centro da roda e para os avisos de vazio.
 *  "Mês" debaixo de um total não diz nada; "este mês" diz. */
export const PERIODO_ESCRITO: Record<Periodo, string> = {
  mes: "este mês",
  ano: "este ano",
  sempre: "desde sempre",
};

/**
 * Lê um período vindo do endereço.
 *
 * **Isto é uma fronteira de segurança, não uma conveniência.** O valor chega
 * pelo `?entradas=` e o `dados.ts` escolhe com ele um pedaço de SQL. Se um valor
 * qualquer passasse daqui, passava para dentro da consulta — e o `dados.ts` já
 * constrói SQL por interpolação de texto noutros sítios, por isso o engano
 * estaria a um copiar-colar de distância. Só saem daqui os três valores da
 * lista; tudo o resto — vazio, lixo, ou uma tentativa de injeção — cai em `mes`
 * sem erro nenhum, porque um endereço estranho não é motivo para partir a
 * página de alguém.
 */
export function lerPeriodo(valor: string | undefined): Periodo {
  return PERIODOS.includes(valor as Periodo) ? (valor as Periodo) : "mes";
}

/**
 * Uma fatia de dinheiro **já somada pela base**, pronta para o circular.
 *
 * Vive aqui e não em `GraficoCircular.tsx` para o `dados.ts` não ter de importar
 * tipos de um componente — a seta aponta sempre no mesmo sentido. É
 * estruturalmente igual ao `Fatia` do componente, e por isso passa-lhe direto
 * sem `.map()` pelo meio.
 */
export type Reparticao = { rotulo: string; valor: number };

/** Um mês na história do dinheiro. Vive aqui, e não em `dados.ts`, para os
 *  gráficos não terem de importar tipos do módulo que fala com a base. */
export type MesDeContas = { mes: string; entradas: number; saidas: number };

/**
 * Quando é que uma coisa recorrente volta a acontecer **dentro deste mês**.
 *
 * Devolve `YYYY-MM-DD` se ainda estiver para vir antes de o mês acabar, e
 * `null` se já passou, se cai noutro mês, ou se não se repete.
 *
 * É o que faz a lista do "ainda este mês": um alojamento anual com `desde` em
 * março não aparece em setembro; um mensal aparece todos os meses; e um que já
 * passou este mês desaparece em vez de ficar a pedir atenção que já teve.
 *
 * Faz-se em texto e em UTC, como as outras datas do Estúdio — um `Date` local a
 * meio disto punha o dia a saltar nos meses de verão.
 */
export function proximaOcorrencia(
  dataBase: string,
  periodicidade: Periodicidade,
  hoje: string,
): string | null {
  if (periodicidade === "unica") return null;

  const [anoH, mesH] = hoje.split("-").map(Number);
  const [, mesB, diaB] = dataBase.split("-").map(Number);

  /* O dia 0 do mês seguinte é o último deste. É como se sabe se fevereiro tem
     28 ou 29 sem tabela nenhuma. */
  const diasNoMes = new Date(Date.UTC(anoH, mesH, 0)).getUTCDate();
  const doMes = (dia: number) =>
    `${anoH}-${String(mesH).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

  let candidata: string | null = null;

  if (periodicidade === "mensal") {
    /* Um pagamento de dia 31 num mês de 30 cai no último dia, não desaparece. */
    candidata = doMes(Math.min(diaB, diasNoMes));
  } else if (periodicidade === "anual") {
    if (mesB !== mesH) return null;
    candidata = doMes(Math.min(diaB, diasNoMes));
  } else {
    /* Semanal: o próximo dia da semana igual ao da data base, a contar de hoje. */
    const base = new Date(`${dataBase}T00:00:00Z`);
    const dia = new Date(`${hoje}T00:00:00Z`);
    const salto = (base.getUTCDay() - dia.getUTCDay() + 7) % 7;
    dia.setUTCDate(dia.getUTCDate() + salto);
    const iso = dia.toISOString().slice(0, 10);
    candidata = iso.slice(0, 7) === hoje.slice(0, 7) ? iso : null;
  }

  if (candidata === null) return null;
  /* Já passou este mês, ou ainda nem tinha começado. */
  if (candidata < hoje || candidata < dataBase) return null;

  return candidata;
}

/**
 * O que já se recebeu por causa de uma receita recorrente.
 *
 * Uma linha destas é a prova de que **aquele vencimento** está pago. É o que
 * falta na `receitas`, que guarda só o que está contratado.
 */
export type Recebimento = {
  id: number;
  receitaId: number;
  /** O vencimento que esta linha salda. */
  vencimento: string;
  valor: number;
  /** Quando é que o dinheiro entrou. É esta que conta para o saldo do mês. */
  data: string;
  notas: string | null;
};

/**
 * Uma cobrança por fazer: um vencimento que já chegou e ainda não foi pago.
 *
 * Não vive na base. É a diferença entre os vencimentos que o `vencimentosAte()`
 * calcula e os `recebimentos` que já lá estão — e é isso que aparece no "por
 * cobrar" do resumo, ao lado do que os clientes devem dos projetos.
 */
export type Cobranca = {
  receitaId: number;
  projetoId: number;
  projetoNome: string;
  clienteId: number | null;
  clienteNome: string | null;
  tipo: TipoReceita;
  valor: number;
  periodicidade: Periodicidade;
  vencimento: string;
};

/**
 * Um teto de sanidade para a lista de vencimentos.
 *
 * Uma receita mensal com um `desde` escrito com um zero a mais no ano —
 * `1026-08-11` em vez de `2026` — geraria doze mil linhas antes de alguém dar
 * por isso. Quatrocentos chegam para trinta anos de mensalidades ou sete de
 * semanas, e o que passe disso é engano, não histórico.
 */
const MAXIMO_VENCIMENTOS = 400;

/**
 * Todos os vencimentos de uma coisa recorrente, do `desde` até hoje.
 *
 * É o outro lado do `proximaOcorrencia()`: aquele responde "o que ainda vem
 * este mês", este responde "o que já se venceu e devia estar pago". Os dois
 * são precisos, e nenhum serve para o trabalho do outro.
 *
 * Faz-se em texto e em UTC, como todas as datas do Estúdio. Os meses contam-se
 * em meses (`ano * 12 + mês`) e não com um `Date` a saltar de 30 em 30 dias, que
 * é como um vencimento de dia 31 se transforma em dia 1 ao fim de um ano. Um
 * vencimento de dia 31 num mês de 30 cai no último dia, como no
 * `proximaOcorrencia()`.
 */
export function vencimentosAte(
  desde: string,
  periodicidade: Periodicidade,
  ate: string | null,
  hoje: string,
): string[] {
  /* A receita pode ter acabado antes de hoje. Aí o limite é o fim dela: não se
     cobra um mês em que já não havia contrato. */
  const limite = ate !== null && ate < hoje ? ate : hoje;
  if (desde > limite) return [];
  if (periodicidade === "unica") return [desde];

  const dois = (n: number) => String(n).padStart(2, "0");
  const datas: string[] = [];

  if (periodicidade === "semanal") {
    const dia = new Date(`${desde}T00:00:00Z`);
    for (let i = 0; i < MAXIMO_VENCIMENTOS; i++) {
      const iso = dia.toISOString().slice(0, 10);
      if (iso > limite) break;
      datas.push(iso);
      dia.setUTCDate(dia.getUTCDate() + 7);
    }
    return datas;
  }

  const [ano, mes, dia] = desde.split("-").map(Number);
  const salto = periodicidade === "mensal" ? 1 : 12;

  for (let i = 0; i < MAXIMO_VENCIMENTOS; i++) {
    const meses = ano * 12 + (mes - 1) + i * salto;
    const a = Math.floor(meses / 12);
    const m = (meses % 12) + 1;
    /* O dia 0 do mês seguinte é o último deste — a mesma conta do
       `proximaOcorrencia()`, e a razão por que fevereiro não precisa de tabela. */
    const diasNoMes = new Date(Date.UTC(a, m, 0)).getUTCDate();
    const iso = `${a}-${dois(m)}-${dois(Math.min(dia, diasNoMes))}`;
    if (iso > limite) break;
    datas.push(iso);
  }

  return datas;
}

/* ------------------------------------------------------------------------
   Objetivos

   Escreve-se o alvo; **o que já está feito conta-se sozinho** a partir do que
   já existe na base. Um objetivo cujo progresso fosse escrito à mão era mais um
   número para manter atualizado, e o primeiro a ficar desatualizado.

   Daí a lista de métricas ser fechada: só entram coisas que o Estúdio saiba
   contar sem ajuda.
   ------------------------------------------------------------------------ */

export const METRICAS = [
  "clientes",
  "projetos",
  "entregues",
  "recebido",
] as const;

export type Metrica = (typeof METRICAS)[number];

/**
 * O nome diz **o que se conta**, não a tabela de onde vem.
 *
 * Isto começou por ser só "Clientes", e estava errado: contava toda a gente na
 * lista, incluindo quem só tem uma proposta por responder. Um objetivo de "10
 * clientes" com propostas lá dentro é um objetivo que se cumpre sozinho a
 * mandar emails.
 */
export const ROTULO_METRICA: Record<Metrica, string> = {
  clientes: "Clientes com trabalho entregue",
  projetos: "Projetos",
  entregues: "Projetos entregues",
  recebido: "Dinheiro recebido",
};

/** Uma linha por métrica, para o formulário não deixar dúvidas sobre o que vai
 *  contar antes de alguém guardar um objetivo que conta outra coisa. */
export const EXPLICA_METRICA: Record<Metrica, string> = {
  clientes:
    "Quem já tem pelo menos um projeto entregue. Propostas e trabalho a andar não contam.",
  projetos: "Todos os projetos, incluindo os vossos.",
  entregues: "Os projetos em «Entregue».",
  recebido:
    "Os pagamentos dos projetos mais os alojamentos e domínios já cobrados.",
};

/** O `recebido` é em euros; os outros contam-se. É o que decide se o número se
 *  escreve `1 200,00 €` ou `1200`. */
export function metricaEmEuros(metrica: Metrica): boolean {
  return metrica === "recebido";
}

export type Objetivo = {
  id: number;
  titulo: string;
  metrica: Metrica;
  alvo: number;
  /** Até quando. `null` = sem data marcada. */
  prazo: string | null;
  /** A partir de quando conta. `null` = desde sempre. */
  desde: string | null;
  /** Contado pela base, não escrito por ninguém. */
  feito: number;
};

/** Um número entre 0 e 100 para a barra. Passado o alvo a barra enche e fica
 *  por aí — mas o texto ao lado continua a dizer a verdade (`12 de 10`), que
 *  cumprir de mais não é um erro a esconder. */
export function percentagemObjetivo(o: Objetivo): number {
  if (o.alvo <= 0) return 0;
  return Math.min(100, Math.max(0, (o.feito / o.alvo) * 100));
}

/** Como se escreve o progresso de um objetivo: `6 de 10`, ou em euros. */
export function progressoEscrito(o: Objetivo): string {
  if (metricaEmEuros(o.metrica))
    return `${formatarEuros(o.feito)} de ${formatarEuros(o.alvo)}`;
  /* Sem casas decimais numa contagem: "6 de 10" e não "6,00 de 10,00". */
  return `${Math.round(o.feito)} de ${Math.round(o.alvo)}`;
}

/**
 * As iniciais de um nome, para a bolinha de quem está atribuído.
 *
 * Vive aqui e não no componente porque é usada em dois sítios — nos
 * responsáveis de um projeto e no dono de uma tarefa — e duas cópias disto
 * divergiam à primeira pessoa com três nomes.
 */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}
