/** docs: docs/07-estudio.md */
import Link from "next/link";
import { FormularioGasto } from "@/components/estudio/FormularioGasto";
import { CARTAO, SOBRETITULO } from "@/components/estudio/estilos";
import { apagarGasto, criarGasto } from "@/lib/estudio/acoes";
import { listarGastos, listarProjetosLeves } from "@/lib/estudio/dados";
import { requerSessao } from "@/lib/estudio/sessao";
import {
  formatarData,
  formatarEuros,
  POR_MES,
  ROTULO_CURTO,
} from "@/lib/estudio/tipos";

/**
 * O que sai.
 *
 * Um gasto pode ser de um projeto (o domínio de um cliente) ou do estúdio (a
 * Vercel, o Figma). Os do estúdio não entram na margem de projeto nenhum — se
 * entrassem, um projeto parecia pior por causa de uma despesa que existiria na
 * mesma sem ele.
 *
 * A página é uma coluna só, de cima a baixo: o formulário abre em cima, a lista
 * fica por baixo com o ecrã todo. Espremer as duas coisas lado a lado deixava a
 * descrição de um gasto sem sítio para se ler.
 */
export default async function Gastos() {
  await requerSessao();

  const [gastos, projetos] = await Promise.all([
    listarGastos(),
    listarProjetosLeves(),
  ]);

  const doEstudio = gastos.filter((g) => g.projetoId === null);

  /* O custo fixo põe as periodicidades todas na mesma escala. Sem isto, somar
     um domínio anual com um alojamento mensal dava um número doze vezes errado
     — ver `POR_MES` em `lib/estudio/tipos.ts`. */
  const fixoPorMes = gastos.reduce(
    (total, g) => total + g.valor * POR_MES[g.periodicidade],
    0,
  );

  const repetem = gastos.filter((g) => g.periodicidade !== "unica");

  return (
    <div className="mx-auto max-w-4xl">
      <p className={SOBRETITULO}>Estúdio</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        Gastos
      </h1>
      <p className="mt-2 text-sm text-muted">Todos os valores sem IVA.</p>

      {repetem.length > 0 ? (
        <div className={`${CARTAO} mt-8`}>
          <p className="text-xs text-muted">Custo fixo do estúdio</p>
          <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums tracking-tight">
            {formatarEuros(fixoPorMes)}
            <span className="ml-1.5 text-base font-normal text-muted">
              por mês
            </span>
          </p>
          <p className="mt-1.5 text-xs text-muted">
            {repetem.length}{" "}
            {repetem.length === 1 ? "despesa que se repete" : "despesas que se repetem"},
            com as semanais e as anuais já convertidas para mês.
          </p>
        </div>
      ) : null}

      <details className={`${CARTAO} mt-8`} open={gastos.length === 0}>
        <summary className="cursor-pointer font-display text-lg font-semibold tracking-tight">
          Gasto novo
        </summary>
        <div className="mt-6">
          <FormularioGasto acao={criarGasto} projetos={projetos} />
        </div>
      </details>

      <section aria-labelledby="lista-gastos" className="mt-12">
        <h2
          id="lista-gastos"
          className="font-display text-lg font-semibold tracking-tight"
        >
          Tudo o que já saiu
        </h2>

        {gastos.length === 0 ? (
          <p className="mt-3 max-w-lg text-sm text-muted">
            Ainda não há gastos registados. Começa pelos que se repetem — o
            alojamento, os domínios, as ferramentas. São os que se esquecem e os
            que mais pesam ao fim do ano.
          </p>
        ) : (
          <>
            <ul className="mt-5 divide-y divide-border border-y border-border">
              {gastos.map((g) => (
                <li
                  key={g.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-4"
                >
                  <span className="w-24 shrink-0 text-sm font-medium tabular-nums">
                    {formatarEuros(g.valor)}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm">{g.descricao}</span>
                      {g.periodicidade !== "unica" ? (
                        <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[0.6875rem] text-muted">
                          {ROTULO_CURTO[g.periodicidade]}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted">
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

                  <form action={apagarGasto} className="shrink-0">
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

            {doEstudio.length > 0 ? (
              <p className="mt-4 text-xs text-muted">
                {doEstudio.length}{" "}
                {doEstudio.length === 1 ? "gasto é" : "gastos são"} do estúdio e
                não {doEstudio.length === 1 ? "entra" : "entram"} na margem de
                projeto nenhum.
              </p>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
