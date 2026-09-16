/** docs: docs/07-estudio.md */
import { COR_BARRA } from "@/components/estudio/estilos";
import type { Estado } from "@/lib/estudio/tipos";

/**
 * A barra é decorativa: o número está sempre escrito ao lado, e quem não
 * distingue as cores lê-o na mesma. Daí `aria-hidden` na barra e nada de
 * `role="progressbar"` — não há aqui um valor a anunciar que o texto já não
 * diga. Ver docs/04, "Acessibilidade".
 */
export function BarraProgresso({
  progresso,
  estado,
}: {
  progresso: number;
  estado: Estado;
}) {
  /* Defensivo de propósito: o `check` da base garante 0–100, mas a barra nunca
     pode transbordar do cartão por causa de um número que lá chegou torto. */
  const largura = Math.min(100, Math.max(0, progresso));

  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
      aria-hidden
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${COR_BARRA[estado]}`}
        style={{ width: `${largura}%` }}
      />
    </div>
  );
}
