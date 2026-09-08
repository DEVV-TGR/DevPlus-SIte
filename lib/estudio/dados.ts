/** docs: docs/07-estudio.md */
import { consulta, consultaUma } from "@/lib/estudio/db";
import type {
  Cliente,
  ContasProjeto,
  Estado,
  Gasto,
  Metrica,
  Objetivo,
  Pagamento,
  Periodicidade,
  Projeto,
  ProjetoLeve,
  Receita,
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
  }>(
    `select id, projeto_id, texto, feita, ordem
       from tarefas
      where projeto_id = $1
      order by feita asc, ordem asc, id asc`,
    [projetoId],
  );

  return linhas.map((l) => ({
    id: Number(l.id),
    projetoId: Number(l.projeto_id),
    texto: l.texto,
    feita: l.feita,
    ordem: l.ordem,
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
  }>(
    `select t.id, t.projeto_id, t.texto, t.feita, t.ordem,
            p.nome as projeto_nome, p.estado
       from tarefas t
       join projetos p on p.id = t.projeto_id
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
   O resumo do mês
   -------------------------------------------------------------------------- */

const MES_ATUAL_SQL = `to_char(now() at time zone 'Europe/Lisbon', 'YYYY-MM')`;

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
                  where to_char(data, 'YYYY-MM') = ${MES_ATUAL_SQL}), 0) as entrou,
       coalesce((select sum(valor) from gastos
                  where to_char(data, 'YYYY-MM') = ${MES_ATUAL_SQL}), 0) as saiu,
       coalesce((select sum(valor) from pagamentos), 0) as entrou_sempre,
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

/** Os gastos deste mês, para o circular. Um por linha — quem os agrupa em
 *  fatias é o componente, que é quem sabe quantas cabem. */
export async function gastosDoMes(): Promise<Gasto[]> {
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
      where to_char(g.data, 'YYYY-MM') = ${MES_ATUAL_SQL}
      order by g.valor desc`,
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
              when 'recebido' then (
                select coalesce(sum(valor), 0) from pagamentos pg
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
