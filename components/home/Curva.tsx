/** docs: docs/04-componentes-e-padroes.md */

/**
 * O corte entre dois capítulos da página inicial.
 *
 * A curva é a fronteira, e é orgânica de propósito: uma linha a régua entre
 * dois grounds lê-se como duas `div` empilhadas, uma curva lê-se como dois
 * lugares. Pinta-se com a cor do capítulo **seguinte**, porque é ele que está a
 * chegar.
 *
 * As três formas alternam ao longo da página. Uma só, repetida, transforma o
 * corte em separador de template.
 */
const FORMAS = {
  a: "M0,120 L0,52 C260,-16 560,104 820,58 C1050,18 1280,4 1440,34 L1440,120 Z",
  b: "M0,120 L0,30 C300,90 620,-10 900,40 C1130,80 1300,96 1440,62 L1440,120 Z",
  c: "M0,120 L0,74 C280,26 520,102 780,72 C1040,42 1260,8 1440,44 L1440,120 Z",
} as const;

export function Curva({
  forma = "a",
  cor,
}: {
  forma?: keyof typeof FORMAS;
  /** Um token de cor. Nunca um hex — ver docs/02. */
  cor: string;
}) {
  return (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden
      className="relative z-[3] -mb-px block h-[clamp(60px,9vw,150px)] w-full"
    >
      <path d={FORMAS[forma]} fill={cor} />
    </svg>
  );
}
