/** docs: docs/07-estudio.md */
import { consulta, consultaUma } from "@/lib/estudio/db";
import { vencimentosAte } from "@/lib/estudio/tipos";
import type {
  Cliente,
  Cobranca,
  ContasProjeto,
  Estado,
  Gasto,
  Metrica,
  Objetivo,
  Pagamento,
  Periodicidade,
  Periodo,
  Projeto,
  ProjetoLeve,
  Recebimento,
  Receita,
  Reparticao,
  Tarefa,
  TipoReceita,
  Utilizador,
} from "@/lib/estudio/tipos";

/**
 * As leituras do Estúdio. Só isto fala SQL — as páginas chamam funções com
 * nome e recebem os tipos de `lib/estudio/tipos.ts`.
 *
 * Nada disto pode ser importado por um componente de cliente. Não há aqui uma
 * guarda a dizê-lo porque não é precisa: o `pg` corre sobre `node:net` e
 * `node:crypto`, e um `"use client"` que chegasse a este módulo partia o build
 * sozinho.
 *
 * O `pg` devolve `bigint` como **texto** (um bigint não cabe sempre num número
 * de JavaScript). Daí o `Number(...)` em cada `id` — os nossos ids nunca lá
 * chegam perto, mas a conversão tem de estar num sítio só, e é aqui.
 *
 * O mesmo vale para o `numeric` do dinheiro, e por uma razão mais séria: **as
 * somas de euros fazem-se todas em SQL**, nunca em JavaScript. O `numeric` do
 * Postgres é exato; o `number` do JavaScript não é, e somar cinquenta valores
 * em vírgula flutuante acumula cêntimos que ninguém consegue explicar três
 * meses depois. Cá em cima só se converte o resultado já somado, para o
 * formatar.
 */

/* A ordem por que os projetos aparecem na lista. É uma ordem de atenção, não
   alfabética: o que está a andar primeiro, o que já acabou por último. Dentro
   de cada grupo, o prazo mais próximo à frente e os sem prazo no fim.

   Os dois estados de bloqueio vêm logo a seguir ao que está a andar, e não lá
   para baixo com o que está quieto: é a diferença entre "está parado" e "está
   parado à espera de alguém a quem se pode ligar hoje". Enterrá-los era garantir
   que ninguém lhes pegava.

   Entre os dois, `visita` fica à frente de `a-espera` por uma razão só: é o que
   depende de nós. Esperar por um cliente é a bola dele; ir lá é a nossa, e o que
   está ao nosso alcance resolver hoje merece ser lido primeiro. */
const ORDEM = `
  order by case p.estado
             when 'em-curso' then 0
             when 'visita'   then 1
             when 'a-espera' then 2
             when 'proposta' then 3
             when 'parado'   then 4
             else 5
           end,
           p.prazo asc nulls last,
           p.id desc`;

/* As datas saem em texto `YYYY-MM-DD` já da base. Deixar o `pg` construir um
   `Date` a partir de uma coluna `date` dava-lhe meia-noite UTC, que em Portugal
   no verão é o dia anterior — e um prazo a aparecer um dia mais cedo. */
const CAMPOS_PROJETO = `
  p.id,
  p.nome,
  p.cliente_id,
  c.nome as cliente_nome,
  p.estado,
  p.progresso,
  p.valor,
  to_char(p.inicio, 'YYYY-MM-DD') as inicio,
  to_char(p.prazo,  'YYYY-MM-DD') as prazo,
  p.repo_url,
  p.deploy_url,
  p.notas,
  coalesce(
    json_agg(
      json_build_object(
        'id', u.id, 'githubLogin', u.github_login,
        'nome', u.nome, 'avatarUrl', u.avatar_url
      ) order by u.nome
    ) filter (where u.id is not null),
    '[]'
  ) as responsaveis`;

const DE_PROJETOS = `
  from projetos p
  left join clientes c on c.id = p.cliente_id
  left join projeto_responsaveis pr on pr.projeto_id = p.id
  left join utilizadores u on u.id = pr.utilizador_id`;

type LinhaProjeto = {
  id: string;
  nome: string;
  cliente_id: string | null;
  cliente_nome: string | null;
  estado: Estado;
  progresso: number;
  valor: string | null;
  inicio: string | null;
  prazo: string | null;
  repo_url: string | null;
  deploy_url: string | null;
  notas: string | null;
  responsaveis: Utilizador[];
};

function paraProjeto(linha: LinhaProjeto): Projeto {
  return {
    id: Number(linha.id),
    nome: linha.nome,
    clienteId: linha.cliente_id === null ? null : Number(linha.cliente_id),
    clienteNome: linha.cliente_nome,
    estado: linha.estado,
    progresso: linha.progresso,
    valor: linha.valor === null ? null : Number(linha.valor),
    inicio: linha.inicio,
    prazo: linha.prazo,
    repoUrl: linha.repo_url,
    deployUrl: linha.deploy_url,
    notas: linha.notas,
    responsaveis: linha.responsaveis.map((r) => ({ ...r, id: Number(r.id) })),
  };
}

export async function listarProjetos(): Promise<Projeto[]> {
  const linhas = await consulta<LinhaProjeto>(
    `select ${CAMPOS_PROJETO} ${DE_PROJETOS}
     group by p.id, c.nome
     ${ORDEM}`,
  );
  return linhas.map(paraProjeto);
}

export async function obterProjeto(id: number): Promise<Projeto | null> {
  const linha = await consultaUma<LinhaProjeto>(
    `select ${CAMPOS_PROJETO} ${DE_PROJETOS}
     where p.id = $1
     group by p.id, c.nome`,
    [id],
  );
  return linha ? paraProjeto(linha) : null;
}

export async function projetosDoCliente(clienteId: number): Promise<Projeto[]> {
  const linhas = await consulta<LinhaProjeto>(
    `select ${CAMPOS_PROJETO} ${DE_PROJETOS}
     where p.cliente_id = $1
     group by p.id, c.nome
     ${ORDEM}`,
    [clienteId],
  );
  return linhas.map(paraProjeto);
}

export async function listarTarefas(projetoId: number): Promise<Tarefa[]> {
  const linhas = await consulta<{
    id: string;
    projeto_id: string;
    texto: string;
    feita: boolean;
    ordem: number;
    utilizador_id: string | null;
    utilizador_nome: string | null;
  }>(
    `select t.id, t.projeto_id, t.texto, t.feita, t.ordem,
            t.utilizador_id, u.nome as utilizador_nome
       from tarefas t
       left join utilizadores u on u.id = t.utilizador_id
      where t.projeto_id = $1
      order by t.feita asc, t.ordem asc, t.id asc`,
    [projetoId],
  );

  return linhas.map((l) => ({
    id: Number(l.id),
    projetoId: Number(l.projeto_id),
    texto: l.texto,
    feita: l.feita,
    ordem: l.ordem,
    utilizadorId: l.utilizador_id === null ? null : Number(l.utilizador_id),
    utilizadorNome: l.utilizador_nome,
  }));
}

type LinhaCliente = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  notas: string | null;
};

function paraCliente(linha: LinhaCliente): Cliente {
  return {
    id: Number(linha.id),
    nome: linha.nome,
    email: linha.email,
    telefone: linha.telefone,
    notas: linha.notas,
  };
}

export async function listarClientes(): Promise<Cliente[]> {
  const linhas = await consulta<LinhaCliente>(
    `select id, nome, email, telefone, notas from clientes order by nome asc`,
  );
  return linhas.map(paraCliente);
}

export async function obterCliente(id: number): Promise<Cliente | null> {
  const linha = await consultaUma<LinhaCliente>(
    `select id, nome, email, telefone, notas from clientes where id = $1`,
    [id],
  );
  return linha ? paraCliente(linha) : null;
}

/** Toda a gente que já entrou no Estúdio. É desta lista que se escolhem os
 *  responsáveis de um projeto — nunca automaticamente de quem está a entrar. */
export async function listarUtilizadores(): Promise<Utilizador[]> {
  const linhas = await consulta<{
    id: string;
    github_login: string;
    nome: string;
    avatar_url: string | null;
  }>(
    `select id, github_login, nome, avatar_url from utilizadores order by nome asc`,
  );

  return linhas.map((l) => ({
    id: Number(l.id),
    githubLogin: l.github_login,
    nome: l.nome,
    avatarUrl: l.avatar_url,
  }));
}

/** Os `repo_url` que já estão no Estúdio. É por eles que a importação sabe o
 *  que não deve trazer duas vezes. */
export async function reposJaNoEstudio(): Promise<Set<string>> {
  const linhas = await consulta<{ repo_url: string }>(
    "select repo_url from projetos where repo_url is not null",
  );
  return new Set(linhas.map((l) => l.repo_url));
}

/** Todos os projetos, no mínimo necessário para o seletor de repositórios. */
export async function listarProjetosLeves(): Promise<ProjetoLeve[]> {
  const linhas = await consulta<{
    id: string;
    nome: string;
    repo_url: string | null;
    cliente_id: string | null;
  }>("select id, nome, repo_url, cliente_id from projetos order by nome asc");

  return linhas.map((l) => ({
    id: Number(l.id),
    nome: l.nome,
    repoUrl: l.repo_url,
    clienteId: l.cliente_id === null ? null : Number(l.cliente_id),
  }));
}

/* --------------------------------------------------------------------------
   Dinheiro

   Ver a nota do topo: as somas são todas do lado do Postgres. O `Number()`
   aparece só a converter um total que já vem feito.
   -------------------------------------------------------------------------- */

export async function contasDoProjeto(
  projetoId: number,
): Promise<ContasProjeto> {
  const linha = await consultaUma<{
    valor: string | null;
    recebido: string;
    gastos: string;
  }>(
    `select p.valor,
            coalesce((select sum(valor) from pagamentos
                       where projeto_id = p.id), 0) as recebido,
            coalesce((select sum(valor) from gastos
                       where projeto_id = p.id), 0) as gastos
       from projetos p
      where p.id = $1`,
    [projetoId],
  );

  const valor = linha?.valor == null ? null : Number(linha.valor);
  const recebido = Number(linha?.recebido ?? 0);

  return {
    valor,
    recebido,
    /* Nunca negativo: quem pagou a mais não fica a dever ao contrário, e um
       número negativo aqui abatia dívidas verdadeiras de outros projetos. */
    porCobrar: valor === null ? 0 : Math.max(valor - recebido, 0),
    gastos: Number(linha?.gastos ?? 0),
  };
}

export async function listarPagamentos(
  projetoId: number,
): Promise<Pagamento[]> {
  const linhas = await consulta<{
    id: string;
    projeto_id: string;
    valor: string;
    data: string;
    descricao: string | null;
  }>(
    `select id, projeto_id, valor, to_char(data, 'YYYY-MM-DD') as data, descricao
       from pagamentos
      where projeto_id = $1
      order by data desc, id desc`,
    [projetoId],
  );

  return linhas.map((l) => ({
    id: Number(l.id),
    projetoId: Number(l.projeto_id),
    valor: Number(l.valor),
    data: l.data,
    descricao: l.descricao,
  }));
}

export async function listarGastos(): Promise<Gasto[]> {
  const linhas = await consulta<{
    id: string;
    projeto_id: string | null;
    projeto_nome: string | null;
    valor: string;
    data: string;
    descricao: string;
    periodicidade: Periodicidade;
  }>(
    `select g.id, g.projeto_id, p.nome as projeto_nome, g.valor,
            to_char(g.data, 'YYYY-MM-DD') as data, g.descricao, g.periodicidade
       from gastos g
       left join projetos p on p.id = g.projeto_id
      order by g.data desc, g.id desc`,
  );

  return linhas.map((l) => ({
    id: Number(l.id),
    projetoId: l.projeto_id === null ? null : Number(l.projeto_id),
    projetoNome: l.projeto_nome,
    valor: Number(l.valor),
    data: l.data,
    descricao: l.descricao,
    periodicidade: l.periodicidade,
  }));
}

export type PorCobrar = {
  id: number;
  nome: string;
  clienteNome: string | null;
  valor: number;
  recebido: number;
  porCobrar: number;
};

/** Quem ainda deve, do que deve mais para o que deve menos. */
export async function porCobrarPorProjeto(): Promise<PorCobrar[]> {
  const linhas = await consulta<{
    id: string;
    nome: string;
    cliente_nome: string | null;
    valor: string;
    recebido: string;
    por_cobrar: string;
  }>(
    `select p.id, p.nome, c.nome as cliente_nome, p.valor,
            coalesce(pg.recebido, 0) as recebido,
            p.valor - coalesce(pg.recebido, 0) as por_cobrar
       from projetos p
       left join clientes c on c.id = p.cliente_id
       left join lateral (
         select sum(valor) as recebido from pagamentos where projeto_id = p.id
       ) pg on true
      where p.valor is not null
        and p.valor > coalesce(pg.recebido, 0)
      order by por_cobrar desc, p.nome asc`,
  );

  return linhas.map((l) => ({
    id: Number(l.id),
    nome: l.nome,
    clienteNome: l.cliente_nome,
    valor: Number(l.valor),
    recebido: Number(l.recebido),
    porCobrar: Number(l.por_cobrar),
  }));
}

export type TarefaPendente = Tarefa & {
  projetoNome: string;
  estadoProjeto: Estado;
};

/** As tarefas por fazer de todos os projetos, na ordem de atenção dos projetos
 *  a que pertencem — o que está a andar primeiro. */
export async function tarefasPorFazer(
  limite = 12,
): Promise<TarefaPendente[]> {
  const linhas = await consulta<{
    id: string;
    projeto_id: string;
    texto: string;
    feita: boolean;
    ordem: number;
    projeto_nome: string;
    estado: Estado;
    utilizador_id: string | null;
    utilizador_nome: string | null;
  }>(
    `select t.id, t.projeto_id, t.texto, t.feita, t.ordem,
            p.nome as projeto_nome, p.estado,
            t.utilizador_id, u.nome as utilizador_nome
       from tarefas t
       join projetos p on p.id = t.projeto_id
       left join utilizadores u on u.id = t.utilizador_id
      where t.feita = false
      order by case p.estado
                 when 'em-curso' then 0
                 when 'visita'   then 1
                 when 'a-espera' then 2
                 when 'proposta' then 3
                 when 'parado'   then 4
                 else 5
               end,
               p.prazo asc nulls last, t.ordem asc, t.id asc
      limit $1`,
    [limite],
  );

  return linhas.map((l) => ({
    id: Number(l.id),
    projetoId: Number(l.projeto_id),
    texto: l.texto,
    feita: l.feita,
    ordem: l.ordem,
    utilizadorId: l.utilizador_id === null ? null : Number(l.utilizador_id),
    utilizadorNome: l.utilizador_nome,
    projetoNome: l.projeto_nome,
    estadoProjeto: l.estado,
  }));
}

/* --------------------------------------------------------------------------
   Receitas recorrentes — o alojamento e o domínio de cada site
   -------------------------------------------------------------------------- */

type LinhaReceita = {
  id: string;
  projeto_id: string;
  tipo: TipoReceita;
  valor: string;
  periodicidade: Periodicidade;
  desde: string;
  ate: string | null;
  notas: string | null;
};

const CAMPOS_RECEITA = `
  id, projeto_id, tipo, valor, periodicidade,
  to_char(desde, 'YYYY-MM-DD') as desde,
  to_char(ate,   'YYYY-MM-DD') as ate,
  notas`;

function paraReceita(l: LinhaReceita): Receita {
  return {
    id: Number(l.id),
    projetoId: Number(l.projeto_id),
    tipo: l.tipo,
    valor: Number(l.valor),
    periodicidade: l.periodicidade,
    desde: l.desde,
    ate: l.ate,
    notas: l.notas,
  };
}

export async function receitasDoProjeto(projetoId: number): Promise<Receita[]> {
  const linhas = await consulta<LinhaReceita>(
    `select ${CAMPOS_RECEITA} from receitas
      where projeto_id = $1
      order by tipo asc, desde desc`,
    [projetoId],
  );
  return linhas.map(paraReceita);
}

export type ReceitaDeCliente = Receita & { projetoNome: string };

/** As receitas dos projetos de um cliente. Na ficha dele vê-se a soma, mas o
 *  sítio onde se escrevem é o projeto — é o alojamento *daquele* site. */
export async function receitasDoCliente(
  clienteId: number,
): Promise<ReceitaDeCliente[]> {
  const linhas = await consulta<LinhaReceita & { projeto_nome: string }>(
    `select ${CAMPOS_RECEITA}, p.nome as projeto_nome
       from receitas r
       join projetos p on p.id = r.projeto_id
      where p.cliente_id = $1
      order by p.nome asc, r.tipo asc`,
    [clienteId],
  );
  return linhas.map((l) => ({ ...paraReceita(l), projetoNome: l.projeto_nome }));
}

/* --------------------------------------------------------------------------
   Cobranças — os vencimentos que já chegaram e ainda não foram pagos

   A `receitas` diz o que está contratado; a `recebimentos` diz o que já entrou.
   O que falta entre as duas é uma cobrança por fazer, e é o que faz um
   alojamento anual voltar a pedir atenção um ano depois de ter sido pago.

   **A conta faz-se em JavaScript e não em SQL**, ao contrário das somas de
   dinheiro. Não é distração: aqui não se somam euros, geram-se datas — e gerar
   uma série de vencimentos com meses de 28 a 31 dias em SQL dava uma consulta
   que ninguém voltava a ler. O `vencimentosAte()` de `lib/estudio/tipos.ts` é o
   mesmo que a ficha do projeto usa, para as duas páginas não poderem discordar.
   -------------------------------------------------------------------------- */

type LinhaCobranca = {
  id: string;
  projeto_id: string;
  projeto_nome: string;
  cliente_id: string | null;
  cliente_nome: string | null;
  tipo: TipoReceita;
  valor: string;
  periodicidade: Periodicidade;
  desde: string;
  ate: string | null;
  pagos: string[];
};

const DE_COBRANCAS = `
  select r.id, r.projeto_id, p.nome as projeto_nome, p.cliente_id,
         c.nome as cliente_nome, r.tipo, r.valor, r.periodicidade,
         to_char(r.desde, 'YYYY-MM-DD') as desde,
         to_char(r.ate,   'YYYY-MM-DD') as ate,
         coalesce((select array_agg(to_char(x.vencimento, 'YYYY-MM-DD'))
                     from recebimentos x where x.receita_id = r.id),
                  '{}') as pagos
    from receitas r
    join projetos p on p.id = r.projeto_id
    left join clientes c on c.id = p.cliente_id`;

/**
 * O que há para cobrar dos alojamentos e domínios, do mais antigo ao mais
 * recente — o mais antigo primeiro porque é o que está à espera há mais tempo.
 *
 * Sem `projetoId` são as de todos os projetos, que é o que o resumo mostra.
 */
export async function cobrancasPorReceber(
  hoje: string,
  projetoId?: number,
): Promise<Cobranca[]> {
  const linhas = await consulta<LinhaCobranca>(
    `${DE_COBRANCAS} where $1::bigint is null or r.projeto_id = $1`,
    [projetoId ?? null],
  );

  const cobrancas: Cobranca[] = [];

  for (const l of linhas) {
    const valor = Number(l.valor);
    /* Uma receita a zero — um cliente em cortesia — não gera lembretes. Não há
       nada para cobrar, e uma linha de 0,00 € no "por cobrar" era só ruído. */
    if (valor <= 0) continue;

    const pagos = new Set(l.pagos);

    for (const vencimento of vencimentosAte(
      l.desde,
      l.periodicidade,
      l.ate,
      hoje,
    )) {
      if (pagos.has(vencimento)) continue;
      cobrancas.push({
        receitaId: Number(l.id),
        projetoId: Number(l.projeto_id),
        projetoNome: l.projeto_nome,
        clienteId: l.cliente_id === null ? null : Number(l.cliente_id),
        clienteNome: l.cliente_nome,
        tipo: l.tipo,
        valor,
        periodicidade: l.periodicidade,
        vencimento,
      });
    }
  }

  return cobrancas.sort((a, b) => a.vencimento.localeCompare(b.vencimento));
}

/** O que já se recebeu dos alojamentos e domínios de um projeto, do mais
 *  recente para trás. */
export async function recebimentosDoProjeto(
  projetoId: number,
): Promise<Recebimento[]> {
  const linhas = await consulta<{
    id: string;
    receita_id: string;
    vencimento: string;
    valor: string;
    data: string;
    notas: string | null;
  }>(
    `select rc.id, rc.receita_id,
            to_char(rc.vencimento, 'YYYY-MM-DD') as vencimento,
            rc.valor, to_char(rc.data, 'YYYY-MM-DD') as data, rc.notas
       from recebimentos rc
       join receitas r on r.id = rc.receita_id
      where r.projeto_id = $1
      order by rc.vencimento desc, rc.id desc`,
    [projetoId],
  );

  return linhas.map((l) => ({
    id: Number(l.id),
    receitaId: Number(l.receita_id),
    vencimento: l.vencimento,
    valor: Number(l.valor),
    data: l.data,
    notas: l.notas,
  }));
}

/* --------------------------------------------------------------------------
   O resumo do mês
   -------------------------------------------------------------------------- */

const MES_ATUAL_SQL = `to_char(now() at time zone 'Europe/Lisbon', 'YYYY-MM')`;

/**
 * O pedaço de `where` que limita uma coluna de data a um período.
 *
 * **Nenhum destes textos vem de fora.** São três constantes escritas aqui, e o
 * que chega do endereço só serve de *chave* depois de passar pelo `lerPeriodo()`
 * de `tipos.ts`, que devolve sempre um dos três. É esta a razão de o período ser
 * um `Record` e não uma função que recebe texto: assim não há forma de escrever
 * a chamada de maneira a que um valor do utilizador acabe dentro da consulta.
 *
 * O argumento `col` é o nome qualificado da coluna (`g.data`, `rc.data`), e vem
 * sempre de literais deste ficheiro — nunca de dados.
 */
const ONDE_PERIODO: Record<Periodo, (col: string) => string> = {
  mes: (col) => `to_char(${col}, 'YYYY-MM') = ${MES_ATUAL_SQL}`,
  ano: (col) =>
    `to_char(${col}, 'YYYY') = to_char(now() at time zone 'Europe/Lisbon', 'YYYY')`,
  /* `true` e não a ausência da cláusula: quem chama concatena sempre um `where`,
     e um predicado sempre verdadeiro poupa dois caminhos na construção da
     consulta — que é onde estas coisas se partem. */
  sempre: () => `true`,
};

export type ResumoDoMes = {
  entrou: number;
  saiu: number;
  /** `entrou - saiu`. Não é lucro: não leva ordenados nem impostos. */
  saldo: number;
  /** O mesmo, desde que o Estúdio existe. Responde a outra pergunta: o do mês
   *  diz como está a correr agora, este diz se o estúdio ganha dinheiro. */
  saldoSempre: number;
  entrouSempre: number;
  saiuSempre: number;
  porCobrar: number;
  projetosPorCobrar: number;
};

export async function resumoDoMes(): Promise<ResumoDoMes> {
  const linha = await consultaUma<{
    entrou: string;
    saiu: string;
    entrou_sempre: string;
    saiu_sempre: string;
    por_cobrar: string;
    projetos_por_cobrar: number;
  }>(
    `select
       coalesce((select sum(valor) from pagamentos
                  where to_char(data, 'YYYY-MM') = ${MES_ATUAL_SQL}), 0)
       + coalesce((select sum(valor) from recebimentos
                    where to_char(data, 'YYYY-MM') = ${MES_ATUAL_SQL}), 0) as entrou,
       coalesce((select sum(valor) from gastos
                  where to_char(data, 'YYYY-MM') = ${MES_ATUAL_SQL}), 0) as saiu,
       coalesce((select sum(valor) from pagamentos), 0)
       + coalesce((select sum(valor) from recebimentos), 0) as entrou_sempre,
       coalesce((select sum(valor) from gastos), 0) as saiu_sempre,
       coalesce((select sum(em_falta) from (
                   select greatest(p.valor - coalesce((
                            select sum(valor) from pagamentos
                             where projeto_id = p.id), 0), 0) as em_falta
                     from projetos p
                    where p.valor is not null) as f), 0) as por_cobrar,
       (select count(*)::int from (
          select 1 from projetos p
           where p.valor is not null
             and p.valor > coalesce((select sum(valor) from pagamentos
                                      where projeto_id = p.id), 0)) as n
       ) as projetos_por_cobrar`,
  );

  const entrou = Number(linha?.entrou ?? 0);
  const saiu = Number(linha?.saiu ?? 0);
  const entrouSempre = Number(linha?.entrou_sempre ?? 0);
  const saiuSempre = Number(linha?.saiu_sempre ?? 0);

  return {
    entrou,
    saiu,
    saldo: entrou - saiu,
    entrouSempre,
    saiuSempre,
    saldoSempre: entrouSempre - saiuSempre,
    porCobrar: Number(linha?.por_cobrar ?? 0),
    projetosPorCobrar: linha?.projetos_por_cobrar ?? 0,
  };
}

/**
 * Para onde foi o dinheiro no período, repartido por descrição.
 *
 * **A versão anterior devolvia uma linha por gasto e deixava o componente
 * juntá-las.** Duas coisas estavam mal com isso. A primeira é a regra da casa:
 * as somas de euros fazem-se em SQL (docs/07). A segunda era um erro a sério —
 * dois gastos com a mesma descrição no mesmo mês viravam duas fatias iguais no
 * mesmo círculo, e o `GraficoCircular` usa o rótulo como chave de React, por
 * isso eram também duas chaves repetidas. Com o `group by`, o total não muda e
 * as fatias passam a ser uma por descrição.
 */
export async function saidasDoPeriodo(
  periodo: Periodo,
): Promise<Reparticao[]> {
  const linhas = await consulta<{ rotulo: string; valor: string }>(
    `select g.descricao as rotulo, sum(g.valor) as valor
       from gastos g
      where ${ONDE_PERIODO[periodo]("g.data")}
      group by g.descricao
      order by valor desc, rotulo asc`,
  );

  return linhas.map((l) => ({ rotulo: l.rotulo, valor: Number(l.valor) }));
}

/**
 * De onde veio o dinheiro, repartido **por projeto**.
 *
 * O espelho do `gastosDoPeriodo()`, mas com uma diferença que vale a pena
 * explicar: as saídas vêm linha a linha e as entradas vêm **somadas em SQL**.
 * Uma despesa é uma coisa que aconteceu uma vez e cujo nome interessa ("Vercel
 * Pro", "360imprimir — ementas"); uma entrada interessa por *de quem veio*, e um
 * projeto pago em três prestações são três linhas que ninguém quer ver
 * separadas. Somar aqui, e não no componente, é também a regra da casa — ver
 * docs/07, "As somas fazem-se todas em SQL".
 *
 * As duas tabelas contam, porque as duas são dinheiro que entrou: os
 * `pagamentos` abatem ao valor combinado de um projeto, os `recebimentos` saldam
 * um vencimento de alojamento ou de domínio. Um gráfico que ignorasse os
 * segundos ignorava aquilo de que o estúdio vai viver.
 *
 * A soma é `numeric` até ao fim e só depois vira `Number()`, uma vez por linha
 * já somada — como em todo o resto deste ficheiro.
 */
export async function entradasDoPeriodo(
  periodo: Periodo,
): Promise<Reparticao[]> {
  const linhas = await consulta<{ rotulo: string; valor: string }>(
    `select coalesce(p.nome, 'Sem projeto') as rotulo,
            sum(e.valor) as valor
       from (
              select projeto_id, valor
                from pagamentos
               where ${ONDE_PERIODO[periodo]("data")}
              union all
              select r.projeto_id, rc.valor
                from recebimentos rc
                join receitas r on r.id = rc.receita_id
               where ${ONDE_PERIODO[periodo]("rc.data")}
            ) e
       left join projetos p on p.id = e.projeto_id
      group by 1
      order by 2 desc`,
  );

  return linhas.map((l) => ({ rotulo: l.rotulo, valor: Number(l.valor) }));
}

/**
 * Quantas tarefas é que uma pessoa tem por fazer.
 *
 * **A única consulta do Estúdio filtrada por quem está autenticado.** Todas as
 * outras mostram o mesmo a toda a gente, de propósito — somos três e o trabalho
 * é partilhado. Esta é a exceção porque responde a "o que é que *eu* tenho para
 * fazer", e um número que é de toda a gente não responde a isso.
 *
 * As que não têm dono vêm à parte e não somadas: são trabalho por atribuir, não
 * trabalho de ninguém. Escondê-las fazia com que uma tarefa sem dono fosse uma
 * tarefa que ninguém via — e a maior parte delas está assim.
 */
export async function tarefasPendentesDe(
  utilizadorId: number,
): Promise<{ minhas: number; semDono: number }> {
  const linha = await consultaUma<{ minhas: number; sem_dono: number }>(
    `select count(*) filter (where utilizador_id = $1)::int   as minhas,
            count(*) filter (where utilizador_id is null)::int as sem_dono
       from tarefas
      where feita = false`,
    [utilizadorId],
  );

  return {
    minhas: linha?.minhas ?? 0,
    semDono: linha?.sem_dono ?? 0,
  };
}

export type Recorrente = {
  chave: string;
  lado: "entra" | "sai";
  descricao: string;
  contexto: string | null;
  valor: number;
  /** A data de referência: o dia em que se pagou, ou o dia em que começou. */
  base: string;
  periodicidade: Periodicidade;
};

/**
 * Tudo o que se repete, dos dois lados, em bruto.
 *
 * Quem decide o que ainda vem este mês é o `proximaOcorrencia()` de
 * `lib/estudio/tipos.ts`, em JavaScript — a conta envolve meses de 28 a 31 dias
 * e dias da semana, e em SQL ficava ilegível para poupar uma passagem por uma
 * lista de dez linhas.
 */
export async function recorrentes(): Promise<Recorrente[]> {
  const [saidas, entradas] = await Promise.all([
    consulta<{
      id: string;
      descricao: string;
      projeto_nome: string | null;
      valor: string;
      data: string;
      periodicidade: Periodicidade;
    }>(
      `select g.id, g.descricao, p.nome as projeto_nome, g.valor,
              to_char(g.data, 'YYYY-MM-DD') as data, g.periodicidade
         from gastos g
         left join projetos p on p.id = g.projeto_id
        where g.periodicidade <> 'unica'`,
    ),
    consulta<{
      id: string;
      tipo: TipoReceita;
      projeto_nome: string;
      cliente_nome: string | null;
      valor: string;
      desde: string;
      periodicidade: Periodicidade;
    }>(
      `select r.id, r.tipo, p.nome as projeto_nome, c.nome as cliente_nome,
              r.valor, to_char(r.desde, 'YYYY-MM-DD') as desde, r.periodicidade
         from receitas r
         join projetos p on p.id = r.projeto_id
         left join clientes c on c.id = p.cliente_id
        where r.periodicidade <> 'unica'
          and (r.ate is null or r.ate >= current_date)`,
    ),
  ]);

  return [
    ...saidas.map((l) => ({
      chave: `gasto-${l.id}`,
      lado: "sai" as const,
      descricao: l.descricao,
      contexto: l.projeto_nome,
      valor: Number(l.valor),
      base: l.data,
      periodicidade: l.periodicidade,
    })),
    ...entradas.map((l) => ({
      chave: `receita-${l.id}`,
      lado: "entra" as const,
      descricao:
        l.tipo === "dominio" ? "Domínio" : "Alojamento e apoio",
      contexto: l.cliente_nome
        ? `${l.projeto_nome} · ${l.cliente_nome}`
        : l.projeto_nome,
      valor: Number(l.valor),
      base: l.desde,
      periodicidade: l.periodicidade,
    })),
  ];
}

/* --------------------------------------------------------------------------
   Objetivos
   -------------------------------------------------------------------------- */

/**
 * Os objetivos, com o progresso **contado pela base**.
 *
 * O `case` sobre a métrica é o que faz isto: cada métrica sabe onde ir contar.
 * A contagem fica do lado do Postgres e não em JavaScript pela mesma razão das
 * somas de dinheiro — assim não há duas contagens a poderem discordar uma da
 * outra, e não se traz a tabela inteira de clientes para contar seis linhas.
 *
 * O `desde` a `null` quer dizer desde sempre. É ele que separa *ter* 10
 * clientes (conta os que lá estão) de *ganhar* 10 clientes este ano (conta os
 * criados a partir de janeiro).
 */
export async function listarObjetivos(): Promise<Objetivo[]> {
  const linhas = await consulta<{
    id: string;
    titulo: string;
    metrica: Metrica;
    alvo: string;
    prazo: string | null;
    desde: string | null;
    feito: string;
  }>(
    `select o.id, o.titulo, o.metrica, o.alvo,
            to_char(o.prazo, 'YYYY-MM-DD') as prazo,
            to_char(o.desde, 'YYYY-MM-DD') as desde,
            case o.metrica
              /* Um cliente só conta quando já lhe entregámos alguma coisa.
                 Contar toda a gente na tabela metia lá dentro os potenciais e
                 os que só têm uma proposta por responder — e um objetivo de
                 "10 clientes" assim cumpre-se a mandar emails.

                 O 'desde' continua a filtrar pela data em que o CLIENTE
                 entrou na lista, e não pela da entrega: "angariar 10 clientes
                 este ano" conta os que chegaram este ano e a quem já se
                 entregou. Não guardamos data de entrega — se um dia isso fizer
                 falta, é uma coluna nova em projetos. */
              when 'clientes' then (
                select count(*) from clientes c
                 where exists (select 1 from projetos p
                                where p.cliente_id = c.id
                                  and p.estado = 'entregue')
                   and (o.desde is null
                    or (c.criado_em at time zone 'Europe/Lisbon')::date >= o.desde))
              when 'projetos' then (
                select count(*) from projetos p
                 where o.desde is null
                    or (p.criado_em at time zone 'Europe/Lisbon')::date >= o.desde)
              when 'entregues' then (
                select count(*) from projetos p
                 where p.estado = 'entregue'
                   and (o.desde is null
                    or (p.criado_em at time zone 'Europe/Lisbon')::date >= o.desde))
              /* Os pagamentos dos projetos **e** os alojamentos e domínios
                 já cobrados. Contar só os primeiros deixava de fora quase
                 todo o dinheiro recorrente, que é o que paga as contas. */
              when 'recebido' then (
                select coalesce(sum(valor), 0) from (
                  select valor, data from pagamentos
                  union all
                  select valor, data from recebimentos) pg
                 where o.desde is null or pg.data >= o.desde)
            end as feito
       from objetivos o
      order by o.prazo asc nulls last, o.id asc`,
  );

  return linhas.map((l) => ({
    id: Number(l.id),
    titulo: l.titulo,
    metrica: l.metrica,
    alvo: Number(l.alvo),
    prazo: l.prazo,
    desde: l.desde,
    feito: Number(l.feito),
  }));
}
