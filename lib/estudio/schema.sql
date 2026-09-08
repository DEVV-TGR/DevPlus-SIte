-- docs: docs/07-estudio.md
--
-- O esquema do Estúdio. Corre-se com `node scripts/estudio-migrar.mjs`.
--
-- Tudo é `if not exists`: o ficheiro corre-se as vezes que forem precisas sem
-- estragar nada. Não há sistema de migrações porque ainda não há histórico para
-- migrar — quando o primeiro `alter table` fizer falta, é aqui que se decide se
-- vale a pena montar um. Até lá, uma migração é isto e chega.

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
                check (estado in ('proposta', 'em-curso', 'entregue', 'parado')),
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
