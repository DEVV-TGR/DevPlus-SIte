/** docs: docs/03-simbolo-e-logotipo.md — a geometria do "+" é especificada aí. */

/**
 * O "+" da DevPlus, em viewBox 0 0 100 100.
 *
 * Cruz de braços iguais: vão 10→90, barra 26 (proporção barra/vão = 0.325),
 * raio 8 nos 12 cantos — incluindo os 4 côncavos, que são o que distingue o
 * símbolo de um "+" tipográfico.
 *
 * Este `d` é copiado à mão para `app/icon.svg`, que é estático e não pode
 * importar. Ao alterá-lo, altera lá também.
 */
export const PLUS_PATH =
  "M37 18 A8 8 0 0 1 45 10 L55 10 A8 8 0 0 1 63 18 L63 29 A8 8 0 0 0 71 37 " +
  "L82 37 A8 8 0 0 1 90 45 L90 55 A8 8 0 0 1 82 63 L71 63 A8 8 0 0 0 63 71 " +
  "L63 82 A8 8 0 0 1 55 90 L45 90 A8 8 0 0 1 37 82 L37 71 A8 8 0 0 0 29 63 " +
  "L18 63 A8 8 0 0 1 10 55 L10 45 A8 8 0 0 1 18 37 L29 37 A8 8 0 0 0 37 29 Z";

/**
 * Equivalentes hex dos tokens OKLCH, para os dois sítios que não conseguem ler
 * CSS custom properties: `app/opengraph-image.tsx` (Satori) e `app/icon.svg`.
 * Se mudares um token em `app/globals.css`, atualiza aqui — ver docs/02.
 */
export const BRAND_HEX = {
  primary: "#F2762B", // ≈ --primary  oklch(0.72 0.188 50)
  bg: "#1a1613", // ≈ --bg       oklch(0.15 0.011 56)
  ink: "#f7f2ec", // ≈ --ink      oklch(0.97 0.006 80)
  muted: "#c8bdb0", // ≈ --muted    oklch(0.77 0.012 80)
} as const;
