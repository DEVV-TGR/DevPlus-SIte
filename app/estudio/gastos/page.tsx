/** docs: docs/07-estudio.md */
import Link from "next/link";
import { FormularioGasto } from "@/components/estudio/FormularioGasto";
import { CARTAO, SOBRETITULO } from "@/components/estudio/estilos";
import { apagarGasto, criarGasto } from "@/lib/estudio/acoes";
import { listarGastos, listarProjetosLeves } from "@/lib/estudio/dados";
import { requerSessao } from "@/lib/estudio/sessao";
import { formatarData, formatarEuros } from "@/lib/estudio/tipos";

/**
 * O que sai.
 *
 * Um gasto pode ser de um projeto (o domínio de um cliente) ou do estúdio (a
 * Vercel, o Figma). Os do estúdio não entram na margem de projeto nenhum — se
 * entrassem, um projeto parecia pior por causa de uma despesa que existiria na
 * mesma sem ele.
 */
export default async function Gastos() {
  await requerSessao();

  const [gastos, projetos] = await Promise.all([
    listarGastos(),
    listarProjetosLeves(),
  ]);

  const doEstudio = gastos.filter((g) => g.projetoId === null);
  const fixosPorMes = gastos
    .filter((g) => g.recorrente)
    .reduce((total, g) => total + g.valor, 0);

  return (
    <div className="mx-auto max-w-5xl">
      <p className={SOBRETITULO}>Estúdio</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        Gastos
      </h1>
      <p className="mt-1.5 text-sm text-muted">
        Todos os valores sem IVA.
        {fixosPorMes > 0
          ? ` ${formatarEuros(fixosPorMes)} por mês em despesas que se repetem.`
          : ""}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div>
          {gastos.length === 0 ? (
            <div className={CARTAO}>
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Ainda não há gastos registados.
              </h2>
              <p className="mt-2 text-sm text-muted">
                Começa pelos que se repetem — o alojamento, os domínios, as
                ferramentas. São os que se esquecem e os que mais pesam ao fim
                do ano.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {gastos.map((g) => (
                <li key={g.id} className="flex items-center gap-3 py-3">
                  <span className="w-24 shrink-0 text-sm font-medium tabular-nums">
                    {formatarEuros(g.valor)}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">
                      {g.descricao}
                      {g.recorrente ? (
                        <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-[0.6875rem] text-muted">
                          todos os meses
                        </span>
                      ) : null}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {formatarData(g.data)}
                      {" · "}
                      {g.projetoId && g.projetoNome ? (
                        <Link
                          href={`/estudio/projetos/${g.projetoId}`}
                          className="underline-offset-4 hover:text-ink hover:underline"
                        >
                          {g.projetoNome}
                        </Link>
                      ) : (
                        "do estúdio"
                      )}
                    </span>
                  </span>

                  <form action={apagarGasto}>
                    <input type="hidden" name="id" value={g.id} />
                    <button
                      type="submit"
                      aria-label={`Apagar o gasto "${g.descricao}"`}
                      className="rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-surface hover:text-danger"
                    >
                      Apagar
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          {doEstudio.length > 0 ? (
            <p className="mt-4 text-xs text-muted">
              {doEstudio.length}{" "}
              {doEstudio.length === 1 ? "gasto é" : "gastos são"} do estúdio e
              não {doEstudio.length === 1 ? "entra" : "entram"} na margem de
              projeto nenhum.
            </p>
          ) : null}
        </div>

        <aside className={CARTAO}>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Gasto novo
          </h2>
          <div className="mt-5">
            <FormularioGasto acao={criarGasto} projetos={projetos} />
          </div>
        </aside>
      </div>
    </div>
  );
}
