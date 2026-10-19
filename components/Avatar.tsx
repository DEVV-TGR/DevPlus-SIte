/** docs: docs/01-marca.md · docs/02-sistema-visual.md — exceção de paleta dos retratos. */
import type { Membro } from "@/lib/site";

/**
 * Um retrato plano, de 48×48, para cada pessoa da equipa no `/contacto`.
 *
 * É uma ilustração simples e não uma fotografia: diz que do outro lado do
 * número está uma pessoa, sem fingir uma fotografia que não existe. As cores
 * de pele e de cabelo são a única exceção à paleta do site (docs/02) e vêm de
 * `--avatar-*`; a camisola usa as cores da marca. Decorativo (`aria-hidden`):
 * o nome está escrito ao lado.
 */
const CAMISOLA = ["var(--primary)", "var(--accent)", "var(--peach)"] as const;

export function Avatar({
  avatar,
  indice = 0,
  className,
}: {
  avatar: Membro["avatar"];
  indice?: number;
  className?: string;
}) {
  const pele = `var(--avatar-pele-${avatar.pele})`;
  const cabelo = `var(--avatar-cabelo-${avatar.cabelo})`;
  const id = `avatar-${avatar.pele}-${avatar.cabelo}-${avatar.forma}-${indice}`;
  return (
    <svg
      viewBox="0 0 48 48"
      width="48"
      height="48"
      aria-hidden
      className={className}
    >
      <defs>
        <clipPath id={id}>
          <circle cx="24" cy="24" r="24" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width="48" height="48" style={{ fill: "color-mix(in oklch, var(--ink) 16%, transparent)" }} />
        {avatar.forma === "caracois" && (
          /* O volume dos caracóis atrás da cabeça. */
          <g style={{ fill: cabelo }}>
            <circle cx="15.5" cy="20" r="4.2" />
            <circle cx="32.5" cy="20" r="4.2" />
            <circle cx="15.8" cy="25.5" r="3.2" />
            <circle cx="32.2" cy="25.5" r="3.2" />
          </g>
        )}
        <ellipse cx="24" cy="50" rx="17" ry="12" style={{ fill: CAMISOLA[indice % CAMISOLA.length] }} />
        <rect x="20.5" y="29" width="7" height="10" rx="3.5" style={{ fill: pele }} />
        <ellipse cx="24" cy="23" rx="8.4" ry="9.4" style={{ fill: pele }} />
        {avatar.forma === "liso" ? (
          /* Liso, com risca e franja a cair para o lado. */
          <path
            d="M15.3 24.5C14.2 15.6 18.4 11.6 24.3 11.6c6 0 9.6 3.9 8.6 12.1-1.4-3.6-4.6-6-9.6-5.7-3.4.2-6.4 2.4-8 6.5Z"
            style={{ fill: cabelo }}
          />
        ) : (
          /* Caracóis: uma nuvem de círculos por cima da testa. */
          <g style={{ fill: cabelo }}>
            <circle cx="17.2" cy="16.4" r="3.9" />
            <circle cx="20.6" cy="12.9" r="4" />
            <circle cx="25" cy="11.8" r="4.1" />
            <circle cx="29.2" cy="13.4" r="3.9" />
            <circle cx="31.6" cy="17" r="3.5" />
            <circle cx="23.2" cy="16" r="3.4" />
            <circle cx="27.6" cy="16.6" r="3" />
          </g>
        )}
        <g style={{ fill: "var(--avatar-traco)" }}>
          <circle cx="20.8" cy="24.2" r="0.95" />
          <circle cx="27.2" cy="24.2" r="0.95" />
        </g>
        <path
          d="M21.6 28.1c1.4 1.1 3.4 1.1 4.8 0"
          fill="none"
          style={{ stroke: "var(--avatar-traco)" }}
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
