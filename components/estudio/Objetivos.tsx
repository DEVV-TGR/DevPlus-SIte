/** docs: docs/07-estudio.md */
import {
  formatarData,
  percentagemObjetivo,
  progressoEscrito,
  type Objetivo,
} from "@/lib/estudio/tipos";

/**
 * Onde queremos chegar, e quanto falta.
 *
 * O alvo escreve-se; **o que já está feito é contado pela base**. Ver
 * `listarObjetivos()` em `lib/estudio/dados.ts`.
 *
 * Cabem três no cartão. Com mais, mostram-se os três de prazo mais próximo e
 * diz-se quantos ficam de fora — um cartão de um terço de linha com sete barras
 * deixa de se ler de relance, que é a única coisa que ele tem de fazer.
 */

const QUANTOS_CABEM = 3;

export function Objetivos({ objetivos }: { objetivos: Objetivo[] }) {
  const mostrados = objetivos.slice(0, QUANTOS_CABEM);
  const escondidos = objetivos.length - mostrados.length;

  return (
    <>
      <p className="text-xs text-muted">Objetivos</p>

      {objetivos.length === 0 ? (
        <p className="mt-2 text-sm text-muted">
          Ainda nenhum. Põe um aqui em baixo — o progresso conta-se sozinho.
        </p>
      ) : (
        <ul className="mt-3 space-y-3.5">
          {mostrados.map((o) => {
            const por = percentagemObjetivo(o);
            const cumprido = o.feito >= o.alvo;

            return (
              <li key={o.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate text-sm">{o.titulo}</span>
                  <span
                    className={`shrink-0 text-xs tabular-nums ${
                      cumprido ? "text-accent" : "text-muted"
                    }`}
                  >
                    {progressoEscrito(o)}
                  </span>
                </div>

                <div
                  className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
                  aria-hidden
                >
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${
                      cumprido ? "bg-accent" : "bg-primary"
                    }`}
                    style={{ width: `${por}%` }}
                  />
                </div>

                {o.prazo ? (
                  <p className="mt-1 text-[0.6875rem] text-muted">
                    até {formatarData(o.prazo)}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {escondidos > 0 ? (
        <p className="mt-3 text-xs text-muted">
          e mais {escondidos} {escondidos === 1 ? "objetivo" : "objetivos"}
        </p>
      ) : null}
    </>
  );
}
