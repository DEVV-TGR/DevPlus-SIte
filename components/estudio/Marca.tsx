/** docs: docs/07-estudio.md */

/**
 * A caixa de uma tarefa — vazia por fazer, com o visto verde quando feita.
 *
 * Num ficheiro à parte porque é usada em dois sítios que não se conhecem: a
 * checklist da ficha do projeto (`Tarefas`, de servidor) e o botão de marcar
 * do resumo (`MarcarFeita`, de cliente). Desenhada uma vez, as duas caixas
 * não divergem.
 */
export function Marca({ feita }: { feita: boolean }) {
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
