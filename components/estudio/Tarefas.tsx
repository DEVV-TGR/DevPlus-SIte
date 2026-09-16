/** docs: docs/07-estudio.md */
import { CAMPO } from "@/components/estudio/estilos";
import {
  alternarTarefa,
  apagarTarefa,
  guardarTarefa,
  juntarTarefa,
} from "@/lib/estudio/acoes";
import { iniciais, type Tarefa, type Utilizador } from "@/lib/estudio/tipos";

/**
 * A checklist de um projeto.
 *
 * Cada tarefa é um `<form>` com um botão — e não uma checkbox que submete
 * sozinha com JavaScript. Assim funciona antes de o JavaScript carregar, e é um
 * botão a sério para quem navega por teclado.
 *
 * **A caixa marca como feita; clicar no texto abre a edição.** São dois alvos
 * diferentes de propósito: antes o texto todo marcava como feita, e não havia
 * onde carregar para corrigir uma tarefa mal escrita a não ser apagá-la e
 * escrevê-la de novo.
 *
 * Editar existe só aqui, na ficha do projeto. No resumo as tarefas são de
 * leitura — aquilo é uma vista do que está por fazer em todo o lado, e um campo
 * de edição por linha transformava-o num formulário gigante.
 *
 * As tarefas feitas caem para o fim da lista — a ordenação vem de
 * `listarTarefas` em `lib/estudio/dados.ts`.
 */

function Marca({ feita }: { feita: boolean }) {
  return (
    <span
      aria-hidden
      className={
        feita
          ? "grid h-5 w-5 shrink-0 place-items-center rounded border border-accent/50 bg-accent/15 text-accent"
          : "grid h-5 w-5 shrink-0 place-items-center rounded border border-border-strong"
      }
    >
      {feita ? (
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
  );
}

/** As iniciais de quem ficou com a tarefa. Vazio não desenha nada — uma bolinha
 *  com um ponto de interrogação em cada linha era ruído. */
function Dono({ nome }: { nome: string | null }) {
  if (!nome) return null;
  return (
    <span
      title={nome}
      className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full border border-border-strong bg-surface-2 px-1.5 text-[0.625rem] font-medium text-ink"
    >
      <span aria-hidden>{iniciais(nome)}</span>
      <span className="sr-only">{nome}</span>
    </span>
  );
}

function SeletorDePessoa({
  pessoas,
  escolhida,
  id,
}: {
  pessoas: Utilizador[];
  escolhida: number | null;
  id: string;
}) {
  return (
    <>
      <label htmlFor={id} className="sr-only">
        Quem fica com esta tarefa
      </label>
      <select
        id={id}
        name="utilizadorId"
        defaultValue={escolhida ?? ""}
        className={`${CAMPO} py-2 sm:w-44`}
      >
        <option value="">Ninguém</option>
        {pessoas.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome}
          </option>
        ))}
      </select>
    </>
  );
}

export function Tarefas({
  projetoId,
  tarefas,
  pessoas,
}: {
  projetoId: number;
  tarefas: Tarefa[];
  pessoas: Utilizador[];
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
            <li key={t.id} className="flex items-start gap-3 py-2.5">
              <form action={alternarTarefa} className="pt-0.5">
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="projetoId" value={projetoId} />
                <button
                  type="submit"
                  aria-pressed={t.feita}
                  aria-label={
                    t.feita
                      ? `Marcar "${t.texto}" como por fazer`
                      : `Marcar "${t.texto}" como feita`
                  }
                  className="rounded p-1 transition-colors hover:bg-surface-2"
                >
                  <Marca feita={t.feita} />
                </button>
              </form>

              <details className="min-w-0 flex-1">
                <summary className="flex cursor-pointer list-none items-center gap-2 py-1">
                  <span
                    className={
                      t.feita
                        ? "min-w-0 truncate text-sm text-muted line-through"
                        : "min-w-0 truncate text-sm text-ink"
                    }
                  >
                    {t.texto}
                  </span>
                  <Dono nome={t.utilizadorNome} />
                </summary>

                <div className="mt-2 space-y-3 pb-2">
                  <form
                    action={guardarTarefa}
                    className="flex flex-col gap-2 sm:flex-row"
                  >
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="projetoId" value={projetoId} />
                    <label htmlFor={`tarefa-${t.id}`} className="sr-only">
                      O que é a tarefa
                    </label>
                    <input
                      id={`tarefa-${t.id}`}
                      name="texto"
                      defaultValue={t.texto}
                      className={`${CAMPO} py-2`}
                    />
                    <SeletorDePessoa
                      pessoas={pessoas}
                      escolhida={t.utilizadorId}
                      id={`tarefa-${t.id}-dono`}
                    />
                    <button
                      type="submit"
                      className="shrink-0 rounded-lg border border-border-strong px-4 py-2 text-sm text-ink transition-colors hover:border-ink/40 hover:bg-surface-2"
                    >
                      Guardar
                    </button>
                  </form>

                  {/* O apagar vive aqui dentro, e não na linha: um botão de
                      apagar ao lado de cada tarefa é um clique errado à espera
                      de acontecer. */}
                  <form action={apagarTarefa}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="projetoId" value={projetoId} />
                    <button
                      type="submit"
                      className="text-xs text-muted transition-colors hover:text-danger"
                    >
                      Apagar esta tarefa
                    </button>
                  </form>
                </div>
              </details>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">
          Sem tarefas. Escreve a primeira aqui em baixo.
        </p>
      )}

      <form
        action={juntarTarefa}
        className="mt-4 flex flex-col gap-2 sm:flex-row"
      >
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
        <SeletorDePessoa
          pessoas={pessoas}
          escolhida={null}
          id="tarefa-nova-dono"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg border border-border-strong px-4 py-2.5 text-sm text-ink transition-colors hover:border-ink/40 hover:bg-surface"
        >
          Juntar
        </button>
      </form>
    </section>
  );
}
