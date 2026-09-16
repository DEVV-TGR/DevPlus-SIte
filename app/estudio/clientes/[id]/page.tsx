/** docs: docs/07-estudio.md */
import Link from "next/link";
import { notFound } from "next/navigation";
import { CartaoProjeto } from "@/components/estudio/CartaoProjeto";
import { FormularioCliente } from "@/components/estudio/FormularioCliente";
import { FormularioTrabalhos } from "@/components/estudio/FormularioTrabalhos";
import { CARTAO, SOBRETITULO } from "@/components/estudio/estilos";
import {
  apagarCliente,
  definirProjetosDoCliente,
  guardarCliente,
} from "@/lib/estudio/acoes";
import {
  listarProjetosLeves,
  obterCliente,
  projetosDoCliente,
  receitasDoCliente,
} from "@/lib/estudio/dados";
import { listarRepos } from "@/lib/estudio/repos";
import { requerSessao } from "@/lib/estudio/sessao";
import {
  formatarEuros,
  hojeEmLisboa,
  ROTULO_CURTO,
  ROTULO_RECEITA,
} from "@/lib/estudio/tipos";

export default async function ClienteFicha({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requerSessao();

  const { id } = await params;
  const numero = Number(id);
  if (!Number.isInteger(numero) || numero <= 0) notFound();

  const cliente = await obterCliente(numero);
  if (!cliente) notFound();

  const [projetos, leves, receitas, { repos, erro }] = await Promise.all([
    projetosDoCliente(cliente.id),
    listarProjetosLeves(),
    receitasDoCliente(cliente.id),
    listarRepos(),
  ]);

  const hoje = hojeEmLisboa();

  const ativas = receitas.filter(
    (r) => r.desde <= hoje && (r.ate === null || r.ate >= hoje),
  );

  /* O seletor mostra os que não têm dono e os que já são deste — os deste
     entram marcados, e desmarcá-los é como se lhes tira o cliente. */
  const atribuiveis = leves.filter(
    (p) => p.clienteId === null || p.clienteId === cliente.id,
  );
  const jaDoCliente = leves
    .filter((p) => p.clienteId === cliente.id)
    .map((p) => p.id);

  const jaNoEstudio = new Set(
    leves.map((p) => p.repoUrl).filter((u): u is string => u !== null),
  );
  const porImportar = repos.filter((r) => !jaNoEstudio.has(r.url));

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/estudio/clientes"
        className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
      >
        ← Clientes
      </Link>

      <p className={`${SOBRETITULO} mt-6`}>Cliente</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        {cliente.nome}
      </h1>

      <div className="mt-12">
        <div>
          <h2 className="sr-only">Dados do cliente</h2>
          <FormularioCliente acao={guardarCliente} cliente={cliente} />

          {/* Só de leitura: o sítio onde se escrevem é a ficha de cada projeto,
              porque o alojamento é *daquele site*. Aqui vê-se o que o cliente
              paga ao todo, que é a pergunta que se faz na ficha dele. */}
          <div className="mt-10 border-t border-border pt-6">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              O que este cliente paga
            </h2>
            {ativas.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                Nada recorrente. O alojamento e o domínio de cada site
                escrevem-se na ficha do projeto.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {ativas.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-baseline justify-between gap-3 text-sm"
                  >
                    <Link
                      href={`/estudio/projetos/${r.projetoId}`}
                      className="min-w-0 truncate underline-offset-4 hover:text-ink hover:underline"
                    >
                      {ROTULO_RECEITA[r.tipo]}
                      <span className="text-muted"> · {r.projetoNome}</span>
                    </Link>
                    <span className="shrink-0 tabular-nums text-accent">
                      {formatarEuros(r.valor)}
                      <span className="text-muted">
                        {" "}
                        /{ROTULO_CURTO[r.periodicidade]}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

        <section aria-labelledby="projetos-do-cliente" className="mt-16">
          <h2
            id="projetos-do-cliente"
            className="font-display text-lg font-semibold tracking-tight"
          >
            Projetos
          </h2>

          {projetos.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Ainda não há trabalho para este cliente. Marca-o aqui em baixo, ou{" "}
              <Link
                href="/estudio/projetos/novo"
                className="underline-offset-4 hover:text-ink hover:underline"
              >
                cria um projeto de raiz
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {projetos.map((p) => (
                <CartaoProjeto key={p.id} projeto={p} hoje={hoje} />
              ))}
            </ul>
          )}

          <details className={`${CARTAO} mt-6`}>
            <summary className="cursor-pointer text-sm font-medium">
              Juntar ou tirar trabalhos
            </summary>
            <div className="mt-5">
              <FormularioTrabalhos
                acao={definirProjetosDoCliente}
                clienteId={cliente.id}
                projetos={atribuiveis}
                repos={porImportar}
                jaDoCliente={jaDoCliente}
                erroDoGitHub={erro}
              />
            </div>
          </details>
        </section>

        <details className="mt-16 border-t border-border pt-6">
          <summary className="cursor-pointer text-sm text-muted transition-colors hover:text-ink">
            Apagar este cliente
          </summary>
          <div className="mt-4">
            <p className="text-sm text-muted">
              Os projetos ficam — passam apenas a não ter cliente. Os
              contactos e as notas desaparecem.
            </p>
            <form action={apagarCliente} className="mt-3">
              <input type="hidden" name="id" value={cliente.id} />
              <button
                type="submit"
                className="rounded-full border border-danger/40 px-4 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
              >
                Apagar {cliente.nome}
              </button>
            </form>
          </div>
        </details>
      </div>
    </div>
  );
}
