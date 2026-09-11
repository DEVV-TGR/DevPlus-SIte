/** docs: docs/07-estudio.md */

/**
 * Onde é que o Estúdio começa.
 *
 * Isto existe porque a resposta é precisa em mais do que um sítio do lado do
 * cliente — a `CascaDoSite` decide a `Nav`, o rodapé e o grão por ela, e o
 * `Providers` decide o Lenis — e um `startsWith("/estudio")` copiado é a
 * espécie de duplicação que diverge no dia em que o prefixo mudar.
 *
 * **Não importa nada de propósito.** É o único ficheiro de `lib/estudio/` que
 * um componente `"use client"` pode carregar: os outros trazem atrás o `pg`, o
 * `node:crypto` ou o `next/headers`, e nenhum deles tem lugar no browser.
 */
export const PREFIXO_ESTUDIO = "/estudio";

export function noEstudio(pathname: string): boolean {
  return pathname.startsWith(PREFIXO_ESTUDIO);
}
