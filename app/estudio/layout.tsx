/** docs: docs/07-estudio.md */
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Lockup } from "@/components/Lockup";
import { sessaoAtual } from "@/lib/estudio/sessao";

/**
 * A casca do Estúdio.
 *
 * O site público não aparece aqui — a `Nav` e o `Footer` desligam-se em
 * `/estudio` (ver `components/CascaDoSite.tsx`).
 *
 * **Não se usa `Section`**, e é uma exceção assumida a docs/04: o `Section`
 * codifica o ritmo vertical do site de marketing (`pt-16 sm:pt-24 lg:pt-32`),
 * que numa ferramenta de trabalho é meio ecrã de vazio antes de se ver o
 * primeiro projeto. O ritmo do Estúdio é este, e está definido uma vez, aqui —
 * as páginas por baixo não voltam a escrever padding nenhum.
 */

export const metadata: Metadata = {
  /* Cinto e suspensórios com o `disallow` de `app/robots.ts`: o robots.txt é um
     pedido, isto é uma instrução, e um motor que ignore o primeiro respeita o
     segundo. Ver docs/01. */
  robots: { index: false, follow: false },
  title: "Estúdio",
};

const links = [
  { href: "/estudio", label: "Projetos" },
  { href: "/estudio/clientes", label: "Clientes" },
];

export default async function EstudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* `sessaoAtual` e não `requerSessao`: a página de entrada vive dentro deste
     layout e tem de conseguir renderizar sem ninguém autenticado. Quem protege
     cada página é a própria página. */
  const utilizador = await sessaoAtual();

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
        <Container className="flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <Link
              href="/estudio"
              aria-label="Estúdio DevPlus"
              className="flex items-center gap-2.5"
            >
              <Lockup className="h-5 w-auto" />
              <span className="text-sm font-medium text-muted">Estúdio</span>
            </Link>

            {utilizador ? (
              <nav aria-label="Estúdio">
                <ul className="flex items-center gap-1">
                  {links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </div>

          {utilizador ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-muted sm:inline">
                {utilizador.nome}
              </span>
              {/* POST e não link: ver o comentário em
                  `app/api/estudio/auth/sair/route.ts`. */}
              <form action="/api/estudio/auth/sair" method="post">
                <button
                  type="submit"
                  className="rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
                >
                  Sair
                </button>
              </form>
            </div>
          ) : null}
        </Container>
      </header>

      <Container className="py-8 sm:py-10">{children}</Container>
    </div>
  );
}
