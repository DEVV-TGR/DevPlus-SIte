/** docs: docs/07-estudio.md */
import { consulta, consultaUma } from "@/lib/estudio/db";
import type {
  Cliente,
  Estado,
  Projeto,
  Tarefa,
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
 */

/* A ordem por que os projetos aparecem na lista. É uma ordem de atenção, não
   alfabética: o que está a andar primeiro, o que já acabou por último. Dentro
   de cada grupo, o prazo mais próximo à frente e os sem prazo no fim. */
const ORDEM = `
  order by case p.estado
             when 'em-curso' then 0
             when 'proposta' then 1
             when 'parado'   then 2
             else 3
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
