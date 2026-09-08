/** docs: docs/07-estudio.md */
import Link from "next/link";
import { notFound } from "next/navigation";
import { CartaoProjeto } from "@/components/estudio/CartaoProjeto";
import { FormularioCliente } from "@/components/estudio/FormularioCliente";
import { SOBRETITULO } from "@/components/estudio/estilos";
import { apagarCliente, guardarCliente } from "@/lib/estudio/acoes";
import { obterCliente, projetosDoCliente } from "@/lib/estudio/dados";
import { requerSessao } from "@/lib/estudio/sessao";
import { hojeEmLisboa } from "@/lib/estudio/tipos";

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

  const projetos = await projetosDoCliente(cliente.id);
  const hoje = hojeEmLisboa();

  return (
    <div className="mx-auto max-w-5xl">
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

      <div className="mt-8 grid gap-10 lg:grid-cols-[22rem_1fr]">
        <div>
          <h2 className="sr-only">Dados do cliente</h2>
          <FormularioCliente acao={guardarCliente} cliente={cliente} />

          <details className="mt-10 border-t border-border pt-6">
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

        <section aria-labelledby="projetos-do-cliente">
          <h2
            id="projetos-do-cliente"
            className="font-display text-lg font-semibold tracking-tight"
          >
            Projetos
          </h2>

          {projetos.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Ainda não há trabalho para este cliente.{" "}
              <Link
                href="/estudio/projetos/novo"
                className="underline-offset-4 hover:text-ink hover:underline"
              >
                Criar um projeto
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
        </section>
      </div>
    </div>
  );
}
