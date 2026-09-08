-- docs: docs/07-estudio.md
--
-- O esquema do Estúdio. Corre-se com `node scripts/estudio-migrar.mjs`.
--
-- Tudo é `if not exists`: o ficheiro corre-se as vezes que forem precisas sem
-- estragar nada.
--
-- O primeiro `alter table` chegou (o estado `a-espera`), e a decisão foi **não**
-- montar um sistema de migrações numerado. Em vez disso há a secção "Ajustes" no
-- fim deste ficheiro: alterações escritas de forma a poderem correr as vezes que
-- forem precisas, sobre uma base nova ou sobre uma que já existe.
--
-- Porquê: um sistema de migrações ganha-se quando há várias bases em estados
-- diferentes e um histórico que interessa reproduzir. Aqui há uma base e três
-- pessoas. O dia de montar um é aquele em que um ajuste destes precisar de mexer
-- em dados — mudar o significado de uma coluna, partir uma tabela em duas — e
-- não só na forma. Aí a ordem passa a contar, e um ficheiro que corre todo de
-- cada vez deixa de servir.

create table if not exists utilizadores (
  id            bigint generated always as identity primary key,
  -- É a identidade: o login do GitHub é único e é por ele que se entra.
  github_login  text not null unique,
  nome          text not null,
  avatar_url    text,
  criado_em     timestamptz not null default now()
);

-- Guarda-se o **hash** do token, nunca o token. Se a base for lida por quem não
-- devia, não dá para entrar com o que lá está — é a mesma razão por que nunca
-- se guarda uma password em claro.
create table if not exists sessoes (
  token_hash      text primary key,
  utilizador_id   bigint not null references utilizadores(id) on delete cascade,
  criada_em       timestamptz not null default now(),
  expira_em       timestamptz not null
);

create index if not exists sessoes_expira_em_idx on sessoes (expira_em);

create table if not exists clientes (
  id         bigint generated always as identity primary key,
  nome       text not null,
  email      text,
  telefone   text,
  notas      text,
  criado_em  timestamptz not null default now()
);

create table if not exists projetos (
  id            bigint generated always as identity primary key,
  nome          text not null,
  -- `set null` e não `cascade`: apagar um cliente não pode levar atrás o
  -- histórico do trabalho que se lhe fez.
  cliente_id    bigint references clientes(id) on delete set null,
  estado        text not null default 'proposta'
                constraint projetos_estado_check
                check (estado in ('proposta', 'em-curso', 'a-espera',
                                  'visita', 'entregue', 'parado')),
  progresso     smallint not null default 0
                check (progresso between 0 and 100),
  -- `date` e não `timestamptz`: um prazo é um dia, não um instante. Ver o
  -- comentário do `Projeto` em `lib/estudio/tipos.ts`.
  inicio        date,
  prazo         date,
  repo_url      text,
  deploy_url    text,
  notas         text,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists projetos_estado_idx on projetos (estado);

-- Quem está em cada projeto. É sempre escolhido à mão, de uma lista — nunca
-- atribuído automaticamente a quem está a entrar. Ver docs/07.
create table if not exists projeto_responsaveis (
  projeto_id     bigint not null references projetos(id) on delete cascade,
  utilizador_id  bigint not null references utilizadores(id) on delete cascade,
  primary key (projeto_id, utilizador_id)
);

create table if not exists tarefas (
  id          bigint generated always as identity primary key,
  projeto_id  bigint not null references projetos(id) on delete cascade,
  -- Quem fica com ela. `null` = ainda ninguém. `on delete set null` e não
  -- `cascade`: se alguém sair do estúdio, a tarefa fica — o trabalho não
  -- desaparece com a pessoa.
  utilizador_id bigint references utilizadores(id) on delete set null,
  texto       text not null,
  feita       boolean not null default false,
  ordem       integer not null default 0,
  criada_em   timestamptz not null default now()
);

create index if not exists tarefas_projeto_idx on tarefas (projeto_id, ordem, id);


-- O que se recebeu mesmo, por projeto. Vários por projeto de propósito: um
-- sinal, um faseado, um resto. A soma destes contra o `projetos.valor` é que dá
-- o "por cobrar" — o número que faz ligar a alguém.
create table if not exists pagamentos (
  id          bigint generated always as identity primary key,
  projeto_id  bigint not null references projetos(id) on delete cascade,
  -- Sem IVA, como o `projetos.valor`. O IVA nunca foi nosso.
  valor       numeric(10, 2) not null check (valor > 0),
  data        date not null,
  descricao   text,
  criado_em   timestamptz not null default now()
);

create index if not exists pagamentos_projeto_idx on pagamentos (projeto_id);
create index if not exists pagamentos_data_idx on pagamentos (data);

-- O que o cliente nos paga de forma recorrente por um site: o alojamento com o
-- apoio, e o domínio. Presa ao **projeto** e não ao cliente, porque é o
-- alojamento *daquele site* — um cliente com dois sites pode pagar um e não o
-- outro.
--
-- Não se chama "mensalidade" em lado nenhum: há clientes que pagam ao ano, e um
-- campo com esse nome onde se escreve um valor anual é um campo que mente. O
-- `tipo` diz o que a coisa é; a `periodicidade` diz de quanto em quanto tempo se
-- paga, e são independentes.
create table if not exists receitas (
  id             bigint generated always as identity primary key,
  projeto_id     bigint not null references projetos(id) on delete cascade,
  tipo           text not null
                 constraint receitas_tipo_check
                 check (tipo in ('alojamento', 'dominio')),
  -- Sem IVA, como tudo o resto.
  valor          numeric(10, 2) not null check (valor >= 0),
  periodicidade  text not null default 'mensal'
                 constraint receitas_periodicidade_check
                 check (periodicidade in ('unica', 'semanal', 'mensal', 'anual')),
  -- É o `desde` que diz em que mês (e dia) se renova.
  desde          date not null,
  -- `null` = ainda ativa. Quando um cliente deixa de pagar põe-se a data de
  -- fim, e não se apaga a linha: o histórico do que já se cobrou continua a
  -- valer.
  ate            date,
  notas          text,
  criado_em      timestamptz not null default now(),
  constraint receitas_datas_check check (ate is null or ate >= desde)
);

create index if not exists receitas_projeto_idx on receitas (projeto_id);

-- O que sai. `projeto_id` a `null` é um gasto do estúdio (a Vercel, o Figma) e
-- não entra na margem de projeto nenhum — misturá-los fazia um projeto parecer
-- pior por causa de uma despesa que existiria na mesma sem ele.
--
-- `on delete set null` e não `cascade`: apagar um projeto não pode apagar a
-- despesa que já se pagou por causa dele. O dinheiro saiu à mesma.
create table if not exists gastos (
  id          bigint generated always as identity primary key,
  projeto_id  bigint references projetos(id) on delete set null,
  valor       numeric(10, 2) not null check (valor > 0),
  data        date not null,
  descricao   text not null,
  -- De quanto em quanto tempo se paga. Um booleano "recorrente" não chegava:
  -- um domínio paga-se uma vez por ano e o alojamento todos os meses, e somar
  -- os dois como se fossem a mesma coisa dava um custo fixo errado por doze
  -- vezes. Ver `POR_MES` em `lib/estudio/tipos.ts`, que os põe na mesma escala.
  periodicidade text not null default 'unica'
                constraint gastos_periodicidade_check
                check (periodicidade in ('unica', 'semanal', 'mensal', 'anual')),
  criado_em   timestamptz not null default now()
);

create index if not exists gastos_data_idx on gastos (data);
create index if not exists gastos_projeto_idx on gastos (projeto_id);

-- Onde queremos chegar, e até quando. "10 clientes até ao fim do ano."
--
-- O `alvo` escreve-se; o que já está feito **conta-se sozinho** a partir do que
-- já existe na base. Um objetivo cujo progresso fosse escrito à mão era mais um
-- número para manter atualizado — e o primeiro a ficar desatualizado.
--
-- Por isso a `metrica` é uma lista fechada: só entram aqui coisas que o Estúdio
-- saiba contar sem ajuda.
create table if not exists objetivos (
  id         bigint generated always as identity primary key,
  titulo     text not null,
  metrica    text not null
             constraint objetivos_metrica_check
             check (metrica in ('clientes', 'projetos', 'entregues', 'recebido')),
  alvo       numeric(12, 2) not null check (alvo > 0),
  -- Até quando. `null` = sem data, é um objetivo em aberto.
  prazo      date,
  -- A partir de quando conta. `null` = desde sempre — "ter 10 clientes" conta
  -- os que já cá estão; "ganhar 10 clientes este ano" põe `desde` em janeiro.
  desde      date,
  criado_em  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Ajustes
--
-- O que os `create table if not exists` lá em cima não conseguem aplicar a uma
-- base que já existe. Correm sempre, e correr duas vezes não muda nada.
-- ---------------------------------------------------------------------------

-- 2026-09-08 · o estado `a-espera` ("À espera do cliente").
--
-- O `check` de uma tabela que já existe não se altera: substitui-se. Largar
-- primeiro e voltar a criar é a forma de isto poder correr sobre uma base nova
-- (onde o `constraint` acabou de nascer com a definição certa) e sobre a antiga
-- (onde ainda tem só quatro estados) sem se saber em qual se está.
--
-- Não mexe em nenhuma linha: só alarga o que passa a ser aceite. Nenhum projeto
-- muda de estado por causa disto.
alter table projetos drop constraint if exists projetos_estado_check;

-- 2026-09-08 · o estado `visita` ("Falta ir lá").
--
-- Chegou logo a seguir ao `a-espera`, e por isso não há aqui dois `alter` — há
-- um só, com a lista final. Os ajustes deste ficheiro correm todos de cada vez
-- e não guardam histórico: o que interessa é o estado a que se quer chegar, e
-- dois passos onde basta um seriam só mais uma coisa para manter.
--
-- No dia em que um ajuste precisar de mexer em **dados** — e não só na forma —
-- isto deixa de servir, porque aí a ordem passa a contar. Ver o topo.
alter table projetos add constraint projetos_estado_check
  check (estado in ('proposta', 'em-curso', 'a-espera', 'visita',
                    'entregue', 'parado'));

-- 2026-09-08 · o valor acordado de cada projeto.
--
-- `numeric` e não `float`: dinheiro em vírgula flutuante acumula cêntimos que
-- ninguém consegue explicar três meses depois. O `pg` devolve `numeric` como
-- texto, e é por isso que as somas se fazem todas em SQL — ver o topo de
-- `lib/estudio/dados.ts`.
--
-- Entra a `null` nos projetos que já existem: `null` quer dizer "ainda não se
-- combinou", que é diferente de zero.
alter table projetos add column if not exists valor numeric(10, 2);

-- 2026-09-08 · a periodicidade dos gastos.
--
-- Substitui o booleano `recorrente`, que não distinguia um alojamento mensal de
-- um domínio anual. A conversão é direta: o que era recorrente passa a mensal,
-- que era o que ele queria dizer.
--
-- Os três passos correm sobre uma base nova (onde a coluna já nasceu com a
-- definição certa e o `recorrente` nunca existiu) e sobre a antiga, sem se
-- saber em qual se está.
alter table gastos add column if not exists periodicidade text not null default 'unica';

-- Num bloco `do` com SQL dinâmico, e não num `update` normal: uma consulta que
-- mencione `recorrente` numa base onde essa coluna já não existe rebenta ao ser
-- lida, muito antes de o `where` decidir seja o que for. O `execute` só é
-- analisado se a coluna estiver mesmo lá.
do $$
begin
  if exists (select 1 from information_schema.columns
              where table_name = 'gastos' and column_name = 'recorrente') then
    execute 'update gastos set periodicidade = ''mensal'' where recorrente';
  end if;
end $$;

alter table gastos drop column if exists recorrente;

alter table gastos drop constraint if exists gastos_periodicidade_check;

alter table gastos add constraint gastos_periodicidade_check
  check (periodicidade in ('unica', 'semanal', 'mensal', 'anual'));

-- 2026-09-08 · as receitas recorrentes mudam-se do cliente para o projeto.
--
-- A `mensalidades` estava presa ao cliente, e o alojamento é de um site: um
-- cliente com dois projetos podia pagar um e não o outro. Ganhou também o
-- `tipo`, para o domínio caber ao lado do alojamento, e a `periodicidade`, para
-- quem paga ao ano.
--
-- Larga-se sem migrar nada porque a tabela nunca chegou a ter uma linha. Se um
-- dia isto se repetir com dados lá dentro, o caminho é outro: copiar para a
-- nova, conferir, e só depois largar.
drop table if exists mensalidades;

-- 2026-09-08 · as tarefas passam a poder ter dono.
alter table tarefas add column if not exists utilizador_id bigint;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'tarefas_utilizador_fk') then
    alter table tarefas add constraint tarefas_utilizador_fk
      foreign key (utilizador_id) references utilizadores(id) on delete set null;
  end if;
end $$;

create index if not exists tarefas_utilizador_idx on tarefas (utilizador_id);
