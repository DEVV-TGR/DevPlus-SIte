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
                                  'entregue', 'parado')),
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
  texto       text not null,
  feita       boolean not null default false,
  ordem       integer not null default 0,
  criada_em   timestamptz not null default now()
);

create index if not exists tarefas_projeto_idx on tarefas (projeto_id, ordem, id);


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

alter table projetos add constraint projetos_estado_check
  check (estado in ('proposta', 'em-curso', 'a-espera', 'entregue', 'parado'));
