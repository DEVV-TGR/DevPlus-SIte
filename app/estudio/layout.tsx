/** docs: docs/07-estudio.md */
import type { Metadata } from "next";

/**
 * O invólucro de todo o Estúdio, entrada incluída.
 *
 * O site público não aparece aqui — a `Nav` e o `Footer` desligam-se em
 * `/estudio` (ver `components/CascaDoSite.tsx`). O topo, as secções e a
 * transição estão um nível abaixo, em `app/estudio/(dentro)/`, para a entrada
 * ficar sem eles.
 *
 * **Não se usa `Section`**, e é uma exceção assumida a docs/04: o `Section`
 * codifica o ritmo vertical do site de marketing (`pt-16 sm:pt-24 lg:pt-32`),
 * que numa ferramenta de trabalho é meio ecrã de vazio antes de se ver o
 * primeiro projeto. O ritmo do Estúdio está no `<main>` de
 * `app/estudio/(dentro)/layout.tsx`, uma vez — as páginas por baixo não voltam
 * a escrever padding nenhum.
 */

export const metadata: Metadata = {
  /* Cinto e suspensórios com o `disallow` de `app/robots.ts`: o robots.txt é um
     pedido, isto é uma instrução, e um motor que ignore o primeiro respeita o
     segundo. Ver docs/01. */
  robots: { index: false, follow: false },
  title: "Estúdio",
};

export default function EstudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-dvh">{children}</div>;
}
