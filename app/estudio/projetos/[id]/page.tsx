/** docs: docs/07-estudio.md */
import Link from "next/link";
import { notFound } from "next/navigation";
import { EtiquetaEstado } from "@/components/estudio/EtiquetaEstado";
import { FormularioProjeto } from "@/components/estudio/FormularioProjeto";
import { Pagamentos } from "@/components/estudio/Pagamentos";
import { Tarefas } from "@/components/estudio/Tarefas";
import { CARTAO } from "@/components/estudio/estilos";
import {
  apagarProjeto,
  guardarProjeto,
  registarPagamento,
} from "@/lib/estudio/acoes";
import {
  contasDoProjeto,
  listarClientes,
  listarPagamentos,
  listarTarefas,
  listarUtilizadores,
  obterProjeto,
} from "@/lib/estudio/dados";
import { requerSessao } from "@/lib/estudio/sessao";
import { emAtraso, formatarData, hojeEmLisboa } from "@/lib/estudio/tipos";

export default async function Projeto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requerSessao();

  const { id } = await params;
  const numero = Number(id);
  /* Um `id` que não seja um número inteiro nunca chega à base: `notFound()`
     primeiro, e a consulta poupa-se. */
  if (!Number.isInteger(numero) || numero <= 0) notFound();

  const projeto = await obterProjeto(numero);
  if (!projeto) notFound();

  const [tarefas, clientes, pessoas, contas, pagamentos] = await Promise.all([
    listarTarefas(projeto.id),
    listarClientes(),
    listarUtilizadores(),
    contasDoProjeto(projeto.id),
    listarPagamentos(projeto.id),
  ]);

  const hoje = hojeEmLisboa();
  const atrasado = emAtraso(projeto, hoje);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/estudio/projetos"
        className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
      >
        ← Projetos
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {projeto.nome}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {projeto.clienteId && projeto.clienteNome ? (
              <Link
                href={`/estudio/clientes/${projeto.clienteId}`}
                className="underline-offset-4 hover:text-ink hover:underline"
              >
                {projeto.clienteNome}
              </Link>
            ) : (
              "Sem cliente"
            )}
            {projeto.inicio ? ` · desde ${formatarData(projeto.inicio)}` : null}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <EtiquetaEstado estado={projeto.estado} />
          {atrasado && projeto.prazo ? (
            <span className="rounded-full border border-danger/40 px-2.5 py-1 text-xs font-medium text-danger">
              Atrasado desde {formatarData(projeto.prazo)}
            </span>
          ) : null}
        </div>
      </div>

      {projeto.repoUrl || projeto.deployUrl ? (
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {projeto.repoUrl ? (
            <li>
              <a
                href={projeto.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted underline-offset-4 hover:text-ink hover:underline"
              >
                Repositório ↗
              </a>
            </li>
          ) : null}
          {projeto.deployUrl ? (
            <li>
              <a
                href={projeto.deployUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted underline-offset-4 hover:text-ink hover:underline"
              >
                Site no ar ↗
              </a>
            </li>
          ) : null}
        </ul>
      ) : null}

      {/* Uma coluna. O formulário, o dinheiro e as tarefas seguidos, cada um
          com o seu espaço — antes o dinheiro e as tarefas viviam espremidos
          numa coluna de 20rem ao lado. */}
      <div className="mt-12">
        <div>
          <h2 className="sr-only">Detalhes do projeto</h2>
          <FormularioProjeto
            acao={guardarProjeto}
            projeto={projeto}
            clientes={clientes}
            pessoas={pessoas}
          />

        </div>

        <div className="mt-12 space-y-12">
          <section className={CARTAO}>
            <Pagamentos
              acao={registarPagamento}
              projetoId={projeto.id}
              contas={contas}
              pagamentos={pagamentos}
            />
          </section>

          <section className={CARTAO}>
            <Tarefas projetoId={projeto.id} tarefas={tarefas} />
          </section>
        </div>

        {/* Num `details` de propósito: apagar não pode estar a um clique de
            distância do botão de guardar. Sem `confirm()` do browser — um
            diálogo do sistema não se pode desenhar nem traduzir. */}
        <details className="mt-16 border-t border-border pt-6">
          <summary className="cursor-pointer text-sm text-muted transition-colors hover:text-ink">
            Apagar este projeto
          </summary>
          <div className="mt-4">
            <p className="text-sm text-muted">
              Apaga o projeto e as suas tarefas. Não há como voltar atrás.
            </p>
            <form action={apagarProjeto} className="mt-3">
              <input type="hidden" name="id" value={projeto.id} />
              <button
                type="submit"
                className="rounded-full border border-danger/40 px-4 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
              >
                Apagar {projeto.nome}
              </button>
            </form>
          </div>
        </details>

      </div>
    </div>
  );
}
