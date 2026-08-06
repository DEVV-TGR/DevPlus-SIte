/** docs: docs/03-simbolo-e-logotipo.md — o logótipo "D+" é especificado aí. */
import { cn } from "@/lib/utils";
import { D_PATH, LOCKUP } from "@/lib/brand";

type LockupProps = {
  className?: string;
  /** Roda o "+" 90° no hover do grupo pai (`group`). */
  animated?: boolean;
};

/**
 * O logótipo da DevPlus: o "D" com o "+" laranja sobreposto.
 *
 * Duas cores, portanto duas fontes: o "D" segue o `currentColor` de quem chama,
 * o "+" é sempre `--primary`. O "D" está desenhado por inteiro por baixo do
 * "+" — é isso que permite ao "+" rodar sem abrir buracos no "D".
 *
 * É `aria-hidden`: quem o usa tem de dar o rótulo (ver `Wordmark`).
 */
export function Lockup({ className, animated = false }: LockupProps) {
  return (
    <svg
      viewBox={LOCKUP.viewBox}
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={D_PATH} fill="currentColor" fillRule="evenodd" />
      {/* `transform-box: fill-box` faz a rotação acontecer à volta do centro do
          próprio "+", e não do centro do lockup inteiro. */}
      <path
        d={LOCKUP.plusPath}
        className={cn(
          "fill-primary",
          animated &&
            "origin-center transition-transform duration-300 [transform-box:fill-box] group-hover:rotate-90",
        )}
      />
    </svg>
  );
}
