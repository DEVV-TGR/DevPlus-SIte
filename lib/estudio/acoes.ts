/** docs: docs/07-estudio.md */
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { consulta, consultaUma } from "@/lib/estudio/db";
import { listarRepos } from "@/lib/estudio/repos";
import { requerSessao } from "@/lib/estudio/sessao";
import { hojeEmLisboa } from "@/lib/estudio/tipos";
import {
  eData,
  eEstado,
  lerValor,
  validarGasto,
  validarPagamento,
  validarObjetivo,
  validarReceita,
} from "@/lib/estudio/validacao";
import {
  campo,
  LIMITES,
  ouNulo,
  validarCliente,
  validarProjeto,
  validarTarefa,
  type ErrosCliente,
  type ErrosProjeto,
} from "@/lib/estudio/validacao";

/**
 * As escritas do Estúdio.
 *
 * **Cada ação começa por `requerSessao()`.** Uma Server Action é um endpoint
 * como outro qualquer — quem souber o identificador chama-a de fora do
 * formulário, e a página onde o botão vive não protege nada. A verificação vive
 * aqui, ao lado da escrita, e não num sítio que se possa contornar.
 *
 * Validação: sempre a de `lib/estudio/validacao.ts`, a mesma que o formulário
 * corre no browser. Nunca uma segunda cópia — ver `lib/contacto.ts`, que já
 * fazia isto para o formulário de contacto.
 */

export type EstadoProjeto = { erros?: ErrosProjeto; erro?: string; ok?: boolean };
export type EstadoCliente = {
  erros?: ErrosCliente;
  erro?: string;
  ok?: boolean;
  /** Quantos trabalhos ficaram ligados a este cliente nesta gravação. */
  ligados?: number;
};

/** `"3"` -> `3`, e qualquer outra coisa -> `null`. Serve para os `id` que
 *  chegam de campos escondidos e de `<select>`. */
function paraId(valor: string): number | null {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function lerProjeto(form: FormData) {
  return {
    nome: campo(form.get("nome"), LIMITES.nome),
    clienteId: campo(form.get("clienteId"), 20),
    estado: campo(form.get("estado"), 20),
    progresso: campo(form.get("progresso"), 5),
    valor: campo(form.get("valor"), 20),
    inicio: campo(form.get("inicio"), 10),
    prazo: campo(form.get("prazo"), 10),
    repoUrl: campo(form.get("repoUrl"), LIMITES.url),
    deployUrl: campo(form.get("deployUrl"), LIMITES.url),
    notas: campo(form.get("notas"), LIMITES.notas),
  };
}

/** Os projetos marcados no seletor de trabalhos. */
function lerProjetosEscolhidos(form: FormData): number[] {
  return form
    .getAll("projetos")
    .map((v) => (typeof v === "string" ? paraId(v) : null))
    .filter((v): v is number => v !== null);
}

/** Os repositórios marcados no seletor de trabalhos, por `full_name`. */
function lerReposEscolhidos(form: FormData): string[] {
  return form
    .getAll("repos")
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.slice(0, 200));
}

/** Os responsáveis chegam como uma caixa por pessoa, todas com o mesmo nome.
 *  Escolhidos à mão, sempre — nunca se acrescenta quem está a gravar. */
function lerResponsaveis(form: FormData): number[] {
  return form
    .getAll("responsaveis")
    .map((v) => (typeof v === "string" ? paraId(v) : null))
    .filter((v): v is number => v !== null);
}

async function definirResponsaveis(projetoId: number, ids: number[]) {
  await consulta("delete from projeto_responsaveis where projeto_id = $1", [
    projetoId,
  ]);

  if (ids.length === 0) return;

  /* Um `insert` só, com a lista a ser desdobrada pela base. O `::bigint[]`
     obriga a que só entrem números — o array vai como parâmetro, nunca colado
     ao texto da consulta. */
  await consulta(
    `insert into projeto_responsaveis (projeto_id, utilizador_id)
     select $1, id from unnest($2::bigint[]) as id
     on conflict do nothing`,
    [projetoId, ids],
  );
}

export async function criarProjeto(
  _anterior: EstadoProjeto,
  form: FormData,
): Promise<EstadoProjeto> {
  await requerSessao();

  const dados = lerProjeto(form);
  const erros = validarProjeto(dados);
  if (Object.keys(erros).length > 0) return { erros };

  let id: number;

  try {
    const linha = await consultaUma<{ id: string }>(
      `insert into projetos
         (nome, cliente_id, estado, progresso, valor, inicio, prazo,
          repo_url, deploy_url, notas)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       returning id`,
      [
        dados.nome.trim(),
        paraId(dados.clienteId),
        dados.estado,
        Number(dados.progresso),
        lerValor(dados.valor),
        ouNulo(dados.inicio),
        ouNulo(dados.prazo),
        ouNulo(dados.repoUrl),
        ouNulo(dados.deployUrl),
        ouNulo(dados.notas),
      ],
    );

    if (!linha) return { erro: "Não foi possível criar o projeto." };

    id = Number(linha.id);
    await definirResponsaveis(id, lerResponsaveis(form));
  } catch (erro) {
    /* Nunca o conteúdo do formulário no log: passam por aqui notas sobre
       clientes. É a mesma regra do `app/api/contacto/route.ts`. */
    console.error("[estudio] falhou criar projeto:", erro);
    return { erro: "Não foi possível criar o projeto. Tenta outra vez." };
  }

  revalidatePath("/estudio");
  /* `redirect` atira — tem de ficar fora do `try`, senão o `catch` apanhava-o e
     transformava uma gravação bem-sucedida num erro. */
  redirect(`/estudio/projetos/${id}`);
}

export async function guardarProjeto(
  _anterior: EstadoProjeto,
  form: FormData,
): Promise<EstadoProjeto> {
  await requerSessao();

  const id = paraId(campo(form.get("id"), 20));
  if (!id) return { erro: "Projeto não encontrado." };

  const dados = lerProjeto(form);
  const erros = validarProjeto(dados);
  if (Object.keys(erros).length > 0) return { erros };

  try {
    await consulta(
      `update projetos
          set nome = $2, cliente_id = $3, estado = $4, progresso = $5,
              valor = $6, inicio = $7, prazo = $8, repo_url = $9,
              deploy_url = $10, notas = $11, atualizado_em = now()
        where id = $1`,
      [
        id,
        dados.nome.trim(),
        paraId(dados.clienteId),
        dados.estado,
        Number(dados.progresso),
        lerValor(dados.valor),
        ouNulo(dados.inicio),
        ouNulo(dados.prazo),
        ouNulo(dados.repoUrl),
        ouNulo(dados.deployUrl),
        ouNulo(dados.notas),
      ],
    );

    await definirResponsaveis(id, lerResponsaveis(form));
  } catch (erro) {
    console.error("[estudio] falhou guardar projeto:", erro);
    return { erro: "Não foi possível guardar. Tenta outra vez." };
  }

  revalidatePath("/estudio");
  revalidatePath(`/estudio/projetos/${id}`);
  return { ok: true };
}

export async function apagarProjeto(form: FormData): Promise<void> {
  await requerSessao();

  const id = paraId(campo(form.get("id"), 20));
  if (!id) return;

  /* As tarefas e os responsáveis vão atrás por `on delete cascade`, declarado
     no esquema. Ver `lib/estudio/schema.sql`. */
  await consulta("delete from projetos where id = $1", [id]);

  revalidatePath("/estudio");
  redirect("/estudio");
}

/**
 * Liga trabalhos a um cliente.
 *
 * Aceita duas coisas ao mesmo tempo — projetos que já existem e repositórios
 * que ainda não foram importados — porque para quem está a marcar caixas são a
 * mesma coisa. Os repositórios são criados aqui, já com o cliente posto.
 *
 * Como na importação, **os dados do repositório vêm outra vez do GitHub**, não
 * do formulário: o browser só diz quais é que foram escolhidos.
 *
 * Devolve quantos ficaram ligados, para a página poder dizê-lo.
 */
async function ligarAoCliente(
  clienteId: number,
  projetoIds: number[],
  reposEscolhidos: string[],
): Promise<number> {
  let ligados = 0;

  if (projetoIds.length > 0) {
    const atribuidos = await consulta<{ id: string }>(
      `update projetos set cliente_id = $1, atualizado_em = now()
        where id = any($2::bigint[])
       returning id`,
      [clienteId, projetoIds],
    );
    ligados += atribuidos.length;
  }

  if (reposEscolhidos.length === 0) return ligados;

  const escolhidos = new Set(reposEscolhidos);
  const { repos, erro } = await listarRepos();
  /* Um GitHub em baixo não pode desfazer o que já se ligou acima. O cliente
     fica criado e os projetos existentes ligados; os repositórios importam-se
     depois. */
  if (erro) return ligados;

  const aTrazer = repos.filter((r) => escolhidos.has(r.nomeCompleto));
  if (aTrazer.length === 0) return ligados;

  const jaLa = await consulta<{ repo_url: string }>(
    "select repo_url from projetos where repo_url is not null",
  );
  const conhecidos = new Set(jaLa.map((l) => l.repo_url));
  const novos = aTrazer.filter((r) => !conhecidos.has(r.url));
  if (novos.length === 0) return ligados;

  const criados = await consulta<{ id: string }>(
    `insert into projetos (nome, estado, repo_url, deploy_url, notas, cliente_id)
     select * from unnest(
       $1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::bigint[]
     )
     returning id`,
    [
      novos.map((r) => r.nome),
      novos.map(() => "em-curso"),
      novos.map((r) => r.url),
      novos.map((r) => r.homepage),
      novos.map((r) => r.descricao),
      novos.map(() => clienteId),
    ],
  );

  return ligados + criados.length;
}

export async function criarCliente(
  _anterior: EstadoCliente,
  form: FormData,
): Promise<EstadoCliente> {
  await requerSessao();

  const dados = {
    nome: campo(form.get("nome"), LIMITES.nome),
    email: campo(form.get("email"), LIMITES.email),
    telefone: campo(form.get("telefone"), LIMITES.telefone),
    notas: campo(form.get("notas"), LIMITES.notas),
  };

  const erros = validarCliente(dados);
  if (Object.keys(erros).length > 0) return { erros };

  let ligados = 0;

  try {
    const linha = await consultaUma<{ id: string }>(
      `insert into clientes (nome, email, telefone, notas)
       values ($1, $2, $3, $4)
       returning id`,
      [
        dados.nome.trim(),
        ouNulo(dados.email),
        ouNulo(dados.telefone),
        ouNulo(dados.notas),
      ],
    );

    if (!linha) return { erro: "Não foi possível guardar o cliente." };

    ligados = await ligarAoCliente(
      Number(linha.id),
      lerProjetosEscolhidos(form),
      lerReposEscolhidos(form),
    );
  } catch (erro) {
    console.error("[estudio] falhou criar cliente:", erro);
    return { erro: "Não foi possível guardar o cliente. Tenta outra vez." };
  }

  revalidatePath("/estudio/clientes");
  revalidatePath("/estudio");
  return { ok: true, ligados };
}

export async function guardarCliente(
  _anterior: EstadoCliente,
  form: FormData,
): Promise<EstadoCliente> {
  await requerSessao();

  const id = paraId(campo(form.get("id"), 20));
  if (!id) return { erro: "Cliente não encontrado." };

  const dados = {
    nome: campo(form.get("nome"), LIMITES.nome),
    email: campo(form.get("email"), LIMITES.email),
    telefone: campo(form.get("telefone"), LIMITES.telefone),
    notas: campo(form.get("notas"), LIMITES.notas),
  };

  const erros = validarCliente(dados);
  if (Object.keys(erros).length > 0) return { erros };

  try {
    await consulta(
      `update clientes set nome = $2, email = $3, telefone = $4, notas = $5
        where id = $1`,
      [
        id,
        dados.nome.trim(),
        ouNulo(dados.email),
        ouNulo(dados.telefone),
        ouNulo(dados.notas),
      ],
    );
  } catch (erro) {
    console.error("[estudio] falhou guardar cliente:", erro);
    return { erro: "Não foi possível guardar. Tenta outra vez." };
  }

  revalidatePath("/estudio/clientes");
  revalidatePath(`/estudio/clientes/${id}`);
  revalidatePath("/estudio");
  return { ok: true };
}

export async function apagarCliente(form: FormData): Promise<void> {
  await requerSessao();

  const id = paraId(campo(form.get("id"), 20));
  if (!id) return;

  /* Os projetos ficam, com o cliente a `null` — `on delete set null` no
     esquema. Apagar um cliente não pode levar atrás o trabalho que se lhe fez. */
  await consulta("delete from clientes where id = $1", [id]);

  revalidatePath("/estudio/clientes");
  revalidatePath("/estudio");
  redirect("/estudio/clientes");
}

export async function juntarTarefa(form: FormData): Promise<void> {
  await requerSessao();

  const projetoId = paraId(campo(form.get("projetoId"), 20));
  if (!projetoId) return;

  const texto = campo(form.get("texto"), LIMITES.tarefa);
  if (validarTarefa(texto)) return;

  /* A tarefa nova entra no fim. `coalesce` porque a primeira de todas não tem
     máximo nenhum de que partir. */
  await consulta(
    `insert into tarefas (projeto_id, texto, utilizador_id, ordem)
     values ($1, $2, $3, coalesce((select max(ordem) + 1 from tarefas
                                    where projeto_id = $1), 0))`,
    [projetoId, texto.trim(), paraId(campo(form.get("utilizadorId"), 20))],
  );

  revalidatePath(`/estudio/projetos/${projetoId}`);
}

/**
 * Muda o texto de uma tarefa e quem fica com ela.
 *
 * Só existe na ficha do projeto. No resumo as tarefas são de leitura: aquilo é
 * uma vista do que está por fazer em todo o lado, e um campo de edição por
 * linha transformava-o num formulário gigante que ninguém pediu.
 */
export async function guardarTarefa(form: FormData): Promise<void> {
  await requerSessao();

  const id = paraId(campo(form.get("id"), 20));
  const projetoId = paraId(campo(form.get("projetoId"), 20));
  if (!id || !projetoId) return;

  const texto = campo(form.get("texto"), LIMITES.tarefa);
  /* Texto vazio não apaga a tarefa — deixa-a como estava. Apagar é um botão
     próprio, e não uma consequência de limpar um campo sem querer. */
  if (validarTarefa(texto)) return;

  await consulta(
    `update tarefas set texto = $3, utilizador_id = $4
      where id = $1 and projeto_id = $2`,
    [
      id,
      projetoId,
      texto.trim(),
      paraId(campo(form.get("utilizadorId"), 20)),
    ],
  );

  revalidatePath("/estudio");
  revalidatePath(`/estudio/projetos/${projetoId}`);
}

export async function alternarTarefa(form: FormData): Promise<void> {
  await requerSessao();

  const id = paraId(campo(form.get("id"), 20));
  const projetoId = paraId(campo(form.get("projetoId"), 20));
  if (!id || !projetoId) return;

  /* O `and projeto_id` não é decoração: sem ele, um id de tarefa doutro projeto
     passava aqui na mesma. */
  await consulta(
    "update tarefas set feita = not feita where id = $1 and projeto_id = $2",
    [id, projetoId],
  );

  revalidatePath(`/estudio/projetos/${projetoId}`);
}

export async function apagarTarefa(form: FormData): Promise<void> {
  await requerSessao();

  const id = paraId(campo(form.get("id"), 20));
  const projetoId = paraId(campo(form.get("projetoId"), 20));
  if (!id || !projetoId) return;

  await consulta("delete from tarefas where id = $1 and projeto_id = $2", [
    id,
    projetoId,
  ]);

  revalidatePath(`/estudio/projetos/${projetoId}`);
}

export type EstadoImportacao = {
  erro?: string;
  criados?: number;
  ignorados?: number;
};

/**
 * Traz repositórios da organização para dentro do Estúdio.
 *
 * O formulário manda só os `full_name` escolhidos — **os dados vêm outra vez do
 * GitHub**, não do que o browser enviou. Não é desconfiança de quem carrega no
 * botão: é que assim o nome e o link não podem chegar torcidos por um
 * formulário remendado, e o código fica com uma fonte só.
 *
 * Repetir a importação não duplica nada: o que já existe pelo `repo_url` é
 * saltado, e diz-se quantos foram.
 */
export async function importarRepos(
  _anterior: EstadoImportacao,
  form: FormData,
): Promise<EstadoImportacao> {
  await requerSessao();

  const escolhidos = new Set(
    form
      .getAll("repos")
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.slice(0, 200)),
  );

  if (escolhidos.size === 0)
    return { erro: "Escolhe pelo menos um repositório." };

  const estado = campo(form.get("estado"), 20);
  if (!eEstado(estado)) return { erro: "Escolhe um estado da lista." };

  const { repos, erro } = await listarRepos();
  if (erro) return { erro };

  const aTrazer = repos.filter((r) => escolhidos.has(r.nomeCompleto));
  if (aTrazer.length === 0)
    return { erro: "Nenhum dos repositórios escolhidos existe já no GitHub." };

  try {
    const jaLa = await consulta<{ repo_url: string }>(
      "select repo_url from projetos where repo_url is not null",
    );
    const conhecidos = new Set(jaLa.map((l) => l.repo_url));

    const novos = aTrazer.filter((r) => !conhecidos.has(r.url));
    const ignorados = aTrazer.length - novos.length;

    if (novos.length === 0) return { criados: 0, ignorados };

    /* Um `insert` só. As listas vão como parâmetros e a base desdobra-as — em
       lado nenhum se cola texto do GitHub dentro da consulta. */
    await consulta(
      `insert into projetos (nome, estado, repo_url, deploy_url, notas)
       select * from unnest(
         $1::text[], $2::text[], $3::text[], $4::text[], $5::text[]
       )`,
      [
        novos.map((r) => r.nome),
        novos.map(() => estado),
        novos.map((r) => r.url),
        novos.map((r) => r.homepage),
        novos.map((r) => r.descricao),
      ],
    );

    revalidatePath("/estudio");
    revalidatePath("/estudio/importar");
    return { criados: novos.length, ignorados };
  } catch (erro) {
    console.error("[estudio] falhou importar repos:", erro);
    return { erro: "Não foi possível importar. Tenta outra vez." };
  }
}

/**
 * Define, de uma vez, quais são os trabalhos de um cliente — na ficha dele.
 *
 * O que estiver marcado fica ligado; o que **deixou** de estar marcado é
 * desligado. É o comportamento que uma lista de caixas promete: o que se vê é
 * o que fica. Desligar não apaga o projeto, só o deixa sem cliente.
 */
export async function definirProjetosDoCliente(
  _anterior: EstadoCliente,
  form: FormData,
): Promise<EstadoCliente> {
  await requerSessao();

  const clienteId = paraId(campo(form.get("clienteId"), 20));
  if (!clienteId) return { erro: "Cliente não encontrado." };

  const escolhidos = lerProjetosEscolhidos(form);

  try {
    /* Primeiro tira-se o que foi desmarcado. Com a lista vazia, `= any('{}')`
       não é verdade para nenhum id e desliga-se tudo — que é exatamente o que
       desmarcar tudo deve fazer. */
    await consulta(
      `update projetos set cliente_id = null, atualizado_em = now()
        where cliente_id = $1 and not (id = any($2::bigint[]))`,
      [clienteId, escolhidos],
    );

    const ligados = await ligarAoCliente(
      clienteId,
      escolhidos,
      lerReposEscolhidos(form),
    );

    revalidatePath("/estudio");
    revalidatePath("/estudio/clientes");
    revalidatePath(`/estudio/clientes/${clienteId}`);
    return { ok: true, ligados };
  } catch (erro) {
    console.error("[estudio] falhou definir os projetos do cliente:", erro);
    return { erro: "Não foi possível guardar. Tenta outra vez." };
  }
}

/* --------------------------------------------------------------------------
   Dinheiro

   Os valores chegam como texto — `1.500,50` é como se escreve cá — e passam
   todos pelo `lerValor()` de `lib/estudio/validacao.ts`, o mesmo que o
   formulário usa. Nunca um `Number()` direto: `Number("1.500,50")` é `NaN`, e
   um `NaN` que chegue à base é um valor perdido em silêncio.
   -------------------------------------------------------------------------- */

export type EstadoDinheiro = {
  erros?: Record<string, string>;
  erro?: string;
  ok?: boolean;
};

export async function registarPagamento(
  _anterior: EstadoDinheiro,
  form: FormData,
): Promise<EstadoDinheiro> {
  await requerSessao();

  const projetoId = paraId(campo(form.get("projetoId"), 20));
  if (!projetoId) return { erro: "Projeto não encontrado." };

  const dados = {
    valor: campo(form.get("valor"), 20),
    data: campo(form.get("data"), 10),
    descricao: campo(form.get("descricao"), LIMITES.nome),
  };

  const erros = validarPagamento(dados);
  if (Object.keys(erros).length > 0) return { erros };

  try {
    await consulta(
      `insert into pagamentos (projeto_id, valor, data, descricao)
       values ($1, $2, $3, $4)`,
      [projetoId, lerValor(dados.valor), dados.data, ouNulo(dados.descricao)],
    );
  } catch (erro) {
    console.error("[estudio] falhou registar pagamento:", erro);
    return { erro: "Não foi possível registar. Tenta outra vez." };
  }

  revalidatePath("/estudio");
  revalidatePath(`/estudio/projetos/${projetoId}`);
  return { ok: true };
}

export async function apagarPagamento(form: FormData): Promise<void> {
  await requerSessao();

  const id = paraId(campo(form.get("id"), 20));
  const projetoId = paraId(campo(form.get("projetoId"), 20));
  if (!id || !projetoId) return;

  /* O `and projeto_id` não é decoração: sem ele, um id de pagamento doutro
     projeto passava aqui na mesma. Mesma regra das tarefas. */
  await consulta("delete from pagamentos where id = $1 and projeto_id = $2", [
    id,
    projetoId,
  ]);

  revalidatePath("/estudio");
  revalidatePath(`/estudio/projetos/${projetoId}`);
}

/**
 * O alojamento ou o domínio de um site.
 *
 * Um `id` presente edita; ausente cria. É o que deixa terminar uma receita
 * (pondo-lhe `ate`) e começar outra a seguir, com o histórico do que se cobrou
 * antes intacto.
 */
export async function guardarReceita(
  _anterior: EstadoDinheiro,
  form: FormData,
): Promise<EstadoDinheiro> {
  await requerSessao();

  const projetoId = paraId(campo(form.get("projetoId"), 20));
  if (!projetoId) return { erro: "Projeto não encontrado." };

  const dados = {
    valor: campo(form.get("valor"), 20),
    tipo: campo(form.get("tipo"), 20),
    periodicidade: campo(form.get("periodicidade"), 20),
    desde: campo(form.get("desde"), 10),
    ate: campo(form.get("ate"), 10),
  };

  const erros = validarReceita(dados);
  if (Object.keys(erros).length > 0) return { erros };

  const id = paraId(campo(form.get("id"), 20));

  try {
    if (id) {
      await consulta(
        `update receitas
            set valor = $3, tipo = $4, periodicidade = $5, desde = $6, ate = $7
          where id = $1 and projeto_id = $2`,
        [
          id,
          projetoId,
          lerValor(dados.valor),
          dados.tipo,
          dados.periodicidade,
          dados.desde,
          ouNulo(dados.ate),
        ],
      );
    } else {
      await consulta(
        `insert into receitas (projeto_id, valor, tipo, periodicidade, desde, ate)
         values ($1, $2, $3, $4, $5, $6)`,
        [
          projetoId,
          lerValor(dados.valor),
          dados.tipo,
          dados.periodicidade,
          dados.desde,
          ouNulo(dados.ate),
        ],
      );
    }
  } catch (erro) {
    console.error("[estudio] falhou guardar receita:", erro);
    return { erro: "Não foi possível guardar. Tenta outra vez." };
  }

  revalidatePath("/estudio");
  revalidatePath(`/estudio/projetos/${projetoId}`);
  return { ok: true };
}

export async function apagarReceita(form: FormData): Promise<void> {
  await requerSessao();

  const id = paraId(campo(form.get("id"), 20));
  const projetoId = paraId(campo(form.get("projetoId"), 20));
  if (!id || !projetoId) return;

  await consulta("delete from receitas where id = $1 and projeto_id = $2", [
    id,
    projetoId,
  ]);

  revalidatePath("/estudio");
  revalidatePath(`/estudio/projetos/${projetoId}`);
}

/* --------------------------------------------------------------------------
   Cobranças

   Uma receita diz o que está contratado; um recebimento diz que **aquele
   vencimento** já foi pago. É o que tira a cobrança da lista do resumo e o que
   põe o dinheiro no saldo do mês, sem abater ao valor combinado do projeto —
   uma mensalidade não abate a um site.
   -------------------------------------------------------------------------- */

/** O projeto a que uma receita pertence. Serve para duas coisas ao mesmo
 *  tempo: confirmar que a receita existe antes de se escrever nela, e saber
 *  que ficha é que há de ser revalidada. */
async function receitaEProjeto(
  receitaId: number,
): Promise<{ projetoId: number; valor: number } | null> {
  const linha = await consultaUma<{ projeto_id: string; valor: string }>(
    "select projeto_id, valor from receitas where id = $1",
    [receitaId],
  );
  return linha
    ? { projetoId: Number(linha.projeto_id), valor: Number(linha.valor) }
    : null;
}

/**
 * Marca uma cobrança como recebida, num clique.
 *
 * É o botão do resumo: entra pelo valor da receita e com a data de hoje, que é
 * o caso normal — vi que entrou, dou-lhe baixa. Corrigir o valor ou a data
 * faz-se na ficha do projeto, que é onde se vê o histórico todo.
 *
 * `on conflict do nothing`: dois cliques seguidos no mesmo botão não podem
 * pôr o dinheiro duas vezes no saldo.
 */
export async function marcarRecebida(form: FormData): Promise<void> {
  await requerSessao();

  const receitaId = paraId(campo(form.get("receitaId"), 20));
  const vencimento = campo(form.get("vencimento"), 10);
  if (!receitaId || !eData(vencimento)) return;

  const receita = await receitaEProjeto(receitaId);
  if (!receita || receita.valor <= 0) return;

  await consulta(
    `insert into recebimentos (receita_id, vencimento, valor, data)
     values ($1, $2, $3, $4)
     on conflict on constraint recebimentos_unicos do nothing`,
    [receitaId, vencimento, receita.valor, hojeEmLisboa()],
  );

  revalidatePath("/estudio");
  revalidatePath(`/estudio/projetos/${receita.projetoId}`);
}

/**
 * O mesmo, mas com o valor e a data escritos à mão — na ficha do projeto.
 *
 * `do update` e não `do nothing`: registar por cima de um vencimento que já lá
 * está é como se corrige um valor mal escrito. Sem isso, a única forma de
 * emendar era apagar e voltar a escrever.
 */
export async function registarRecebimento(
  _anterior: EstadoDinheiro,
  form: FormData,
): Promise<EstadoDinheiro> {
  await requerSessao();

  const receitaId = paraId(campo(form.get("receitaId"), 20));
  const vencimento = campo(form.get("vencimento"), 10);
  if (!receitaId || !eData(vencimento))
    return { erro: "Cobrança não encontrada." };

  const receita = await receitaEProjeto(receitaId);
  if (!receita) return { erro: "Cobrança não encontrada." };

  const dados = {
    valor: campo(form.get("valor"), 20),
    data: campo(form.get("data"), 10),
  };

  const erros = validarPagamento(dados);
  if (Object.keys(erros).length > 0) return { erros };

  try {
    await consulta(
      `insert into recebimentos (receita_id, vencimento, valor, data, notas)
       values ($1, $2, $3, $4, $5)
       on conflict on constraint recebimentos_unicos
         do update set valor = excluded.valor, data = excluded.data,
                       notas = excluded.notas`,
      [
        receitaId,
        vencimento,
        lerValor(dados.valor),
        dados.data,
        ouNulo(campo(form.get("notas"), LIMITES.nome)),
      ],
    );
  } catch (erro) {
    console.error("[estudio] falhou registar recebimento:", erro);
    return { erro: "Não foi possível registar. Tenta outra vez." };
  }

  revalidatePath("/estudio");
  revalidatePath(`/estudio/projetos/${receita.projetoId}`);
  return { ok: true };
}

/** Desfaz um recebimento. A cobrança volta a aparecer por fazer, que é o que
 *  se quer quando o dinheiro afinal não era aquele. */
export async function apagarRecebimento(form: FormData): Promise<void> {
  await requerSessao();

  const id = paraId(campo(form.get("id"), 20));
  const projetoId = paraId(campo(form.get("projetoId"), 20));
  if (!id || !projetoId) return;

  /* O `join` não é decoração: sem ele, um id de recebimento de outro projeto
     era apagado daqui na mesma. Mesma regra das tarefas e dos pagamentos. */
  await consulta(
    `delete from recebimentos rc
      using receitas r
      where rc.id = $1 and r.id = rc.receita_id and r.projeto_id = $2`,
    [id, projetoId],
  );

  revalidatePath("/estudio");
  revalidatePath(`/estudio/projetos/${projetoId}`);
}

export async function criarGasto(
  _anterior: EstadoDinheiro,
  form: FormData,
): Promise<EstadoDinheiro> {
  await requerSessao();

  const dados = {
    valor: campo(form.get("valor"), 20),
    data: campo(form.get("data"), 10),
    descricao: campo(form.get("descricao"), LIMITES.nome),
    periodicidade: campo(form.get("periodicidade"), 20),
  };

  const erros = validarGasto(dados);
  if (Object.keys(erros).length > 0) return { erros };

  try {
    await consulta(
      `insert into gastos (projeto_id, valor, data, descricao, periodicidade)
       values ($1, $2, $3, $4, $5)`,
      [
        /* Sem projeto = gasto do estúdio. Não entra na margem de projeto
           nenhum, porque existiria na mesma sem ele. */
        paraId(campo(form.get("projetoId"), 20)),
        lerValor(dados.valor),
        dados.data,
        dados.descricao.trim(),
        dados.periodicidade,
      ],
    );
  } catch (erro) {
    console.error("[estudio] falhou criar gasto:", erro);
    return { erro: "Não foi possível guardar o gasto. Tenta outra vez." };
  }

  revalidatePath("/estudio");
  revalidatePath("/estudio/gastos");
  return { ok: true };
}

export async function apagarGasto(form: FormData): Promise<void> {
  await requerSessao();

  const id = paraId(campo(form.get("id"), 20));
  if (!id) return;

  await consulta("delete from gastos where id = $1", [id]);

  revalidatePath("/estudio");
  revalidatePath("/estudio/gastos");
}

/* --------------------------------------------------------------------------
   Objetivos

   Só se escreve o alvo. O que já está feito conta-o a base — ver
   `listarObjetivos()` em `lib/estudio/dados.ts`.
   -------------------------------------------------------------------------- */

export async function criarObjetivo(
  _anterior: EstadoDinheiro,
  form: FormData,
): Promise<EstadoDinheiro> {
  await requerSessao();

  const dados = {
    titulo: campo(form.get("titulo"), LIMITES.nome),
    metrica: campo(form.get("metrica"), 20),
    alvo: campo(form.get("alvo"), 20),
    prazo: campo(form.get("prazo"), 10),
    desde: campo(form.get("desde"), 10),
  };

  const erros = validarObjetivo(dados);
  if (Object.keys(erros).length > 0) return { erros };

  try {
    await consulta(
      `insert into objetivos (titulo, metrica, alvo, prazo, desde)
       values ($1, $2, $3, $4, $5)`,
      [
        dados.titulo.trim(),
        dados.metrica,
        lerValor(dados.alvo),
        ouNulo(dados.prazo),
        ouNulo(dados.desde),
      ],
    );
  } catch (erro) {
    console.error("[estudio] falhou criar objetivo:", erro);
    return { erro: "Não foi possível guardar. Tenta outra vez." };
  }

  revalidatePath("/estudio");
  return { ok: true };
}

export async function apagarObjetivo(form: FormData): Promise<void> {
  await requerSessao();

  const id = paraId(campo(form.get("id"), 20));
  if (!id) return;

  await consulta("delete from objetivos where id = $1", [id]);
  revalidatePath("/estudio");
}
