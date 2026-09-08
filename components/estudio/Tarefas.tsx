/** docs: docs/07-estudio.md */
import { CAMPO } from "@/components/estudio/estilos";
import { alternarTarefa, apagarTarefa, juntarTarefa } from "@/lib/estudio/acoes";
import type { Tarefa } from "@/lib/estudio/tipos";

/**
 * A checklist de um projeto.
 *
 * Cada tarefa é um `<form>` com um botão — e não uma checkbox que submete
 * sozinha com JavaScript. Assim funciona antes de o JavaScript carregar, e é um
 * botão a sério para quem navega por teclado. O que se ganhava em elegância
 * perdia-se em coisas que deixam de responder quando a rede está má.
 *
 * As tarefas feitas caem para o fim da lista — a ordenação vem de
 * `listarTarefas` em `lib/estudio/dados.ts`.
 */
export function Tarefas({
  projetoId,
  tarefas,
}: {
  projetoId: number;
  tarefas: Tarefa[];
}) {
  const feitas = tarefas.filter((t) => t.feita).length;

  return (
    <section aria-labelledby="tarefas">
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id="tarefas"
          className="font-display text-lg font-semibold tracking-tight"
        >
          Tarefas
        </h2>
        {tarefas.length > 0 ? (
          <p className="text-xs tabular-nums text-muted">
            {feitas} de {tarefas.length}
          </p>
        ) : null}
      </div>

      {tarefas.length > 0 ? (
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {tarefas.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-2.5">
              <form action={alternarTarefa} className="flex min-w-0 flex-1">
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="projetoId" value={projetoId} />
                <button
                  type="submit"
                  aria-pressed={t.feita}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1 text-left transition-colors hover:bg-surface"
                >
                  <span
                    aria-hidden
                    className={
                      t.feita
                        ? "grid h-5 w-5 shrink-0 place-items-center rounded border border-accent/50 bg-accent/15 text-accent"
                        : "grid h-5 w-5 shrink-0 place-items-center rounded border border-border-strong"
                    }
                  >
                    {t.feita ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2.5 6.2 4.8 8.5 9.5 3.8"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </span>
                  <span
                    className={
                      t.feita
                        ? "truncate text-sm text-muted line-through"
                        : "truncate text-sm text-ink"
                    }
                  >
                    {t.texto}
                  </span>
                </button>
              </form>

              <form action={apagarTarefa}>
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="projetoId" value={projetoId} />
                <button
                  type="submit"
                  aria-label={`Apagar a tarefa "${t.texto}"`}
                  className="rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-surface hover:text-danger"
                >
                  Apagar
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">
          Sem tarefas. Escreve a primeira aqui em baixo.
        </p>
      )}

      <form action={juntarTarefa} className="mt-4 flex gap-2">
        <input type="hidden" name="projetoId" value={projetoId} />
        <label htmlFor="tarefa-nova" className="sr-only">
          Tarefa nova
        </label>
        <input
          id="tarefa-nova"
          name="texto"
          placeholder="O que falta fazer?"
          className={`${CAMPO} py-2.5`}
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg border border-border-strong px-4 text-sm text-ink transition-colors hover:border-ink/40 hover:bg-surface"
        >
          Juntar
        </button>
      </form>
    </section>
  );
}
