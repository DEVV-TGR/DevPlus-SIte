/** docs: docs/03-simbolo-e-logotipo.md — a geometria do "+" é especificada aí. */
import { PLUS_PATH } from "@/lib/brand";

type LogoProps = {
  className?: string;
  /** Versão de contorno (usa currentColor) — para motivos de fundo grandes. */
  outline?: boolean;
};

/**
 * A marca da DevPlus — o "+".
 *
 * Usa sempre `currentColor`: a cor vem de quem chama (`className="text-primary"`),
 * para o símbolo poder aparecer a branco sobre laranja sem duplicar geometria.
 * As duas variantes partilham o mesmo path — nunca as desenhes em separado.
 */
export function Logo({ className, outline = false }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={PLUS_PATH}
        fill={outline ? "none" : "currentColor"}
        stroke={outline ? "currentColor" : "none"}
        strokeWidth={outline ? 2.5 : undefined}
        strokeLinejoin="round"
      />
    </svg>
  );
}
