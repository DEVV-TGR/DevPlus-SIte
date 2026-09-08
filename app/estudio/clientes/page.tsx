/** docs: docs/07-estudio.md */
import Link from "next/link";
import { FormularioCliente } from "@/components/estudio/FormularioCliente";
import { CARTAO, SOBRETITULO } from "@/components/estudio/estilos";
import { criarCliente } from "@/lib/estudio/acoes";
import { listarClientes, listarProjetos } from "@/lib/estudio/dados";
import { requerSessao } from "@/lib/estudio/sessao";

/**
 * Os clientes, e o formulário de acrescentar um logo ao lado.
 *
 * Não há rota `/clientes/novo`: um cliente são quatro campos, e mandar alguém a
 * outra página para os preencher era um passo a mais sem nada em troca.
 */
export default async function Clientes() {
  await requerSessao();

  const [clientes, projetos] = await Promise.all([
    listarClientes(),
    listarProjetos(),
  ]);

  /* Quantos projetos tem cada cliente. Uma passagem pela lista chega — são
     dezenas de projetos, não milhares, e poupa uma consulta à base. */
  const quantos = new Map<number, number>();
  for (const p of projetos) {
    if (p.clienteId === null) continue;
    quantos.set(p.clienteId, (quantos.get(p.clienteId) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <p className={SOBRETITULO}>Estúdio</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        Clientes
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div>
          {clientes.length === 0 ? (
            <div className={CARTAO}>
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Ainda não há clientes.
              </h2>
              <p className="mt-2 text-sm text-muted">
                Acrescenta o primeiro no formulário ao lado. Depois é só
                escolhê-lo quando criares um projeto.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {clientes.map((c) => {
                const total = quantos.get(c.id) ?? 0;
                return (
                  <li key={c.id}>
                    <Link
                      href={`/estudio/clientes/${c.id}`}
                      className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-surface"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{c.nome}</p>
                        <p className="mt-0.5 truncate text-sm text-muted">
                          {c.email ?? c.telefone ?? "Sem contacto"}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs tabular-nums text-muted">
                        {total} {total === 1 ? "projeto" : "projetos"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <aside className={CARTAO}>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Cliente novo
          </h2>
          <div className="mt-5">
            <FormularioCliente acao={criarCliente} rotulo="Acrescentar" />
          </div>
        </aside>
      </div>
    </div>
  );
}
