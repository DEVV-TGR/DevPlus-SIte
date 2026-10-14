/** docs: docs/07-estudio.md */
import Link from "next/link";
import { Lockup } from "@/components/Lockup";
import { Separadores } from "@/components/estudio/Separadores";
import { PREFIXO_ESTUDIO } from "@/lib/estudio/rotas";
import { iniciais, type Utilizador } from "@/lib/estudio/tipos";

/**
 * A barra de cima de todos os ecrãs de dentro do Estúdio: a marca, as secções
 * e quem está.
 *
 * Vive no layout de `app/estudio/(dentro)/`, e não em cada página: um layout
 * não se desenha outra vez quando se muda de secção, e é isso que deixa a
 * transição (`template.tsx`) correr só por baixo dela.
 *
 * Não é `sticky`. Esteve, quando era só uma linha; com os separadores a partir
 * para uma segunda linha no telemóvel, colada em cima comia um quarto do ecrã.
 */
export function Cabecalho({ utilizador }: { utilizador: Utilizador }) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href={PREFIXO_ESTUDIO}
          aria-label="Estúdio DevPlus — Resumo"
          className="group mr-auto flex items-center gap-2.5 rounded-lg md:mr-2"
        >
          <Lockup className="h-6 w-auto" animated />
          <span className="font-display text-lg font-semibold tracking-tight">
            Estúdio
          </span>
        </Link>

        <Separadores />

        <div className="flex items-center gap-3 md:ml-auto">
          {/* As iniciais e não a fotografia do GitHub: a CSP não deixa
              carregar imagens de fora — ver `Responsaveis.tsx`. */}
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-full border border-border-strong bg-surface-2 text-xs font-medium"
          >
            {iniciais(utilizador.nome)}
          </span>
          <span className="hidden text-sm text-muted lg:inline">
            {utilizador.nome}
          </span>
          {/* POST e não link: ver o comentário em
              `app/api/estudio/auth/sair/route.ts`. */}
          <form action="/api/estudio/auth/sair" method="post">
            <button
              type="submit"
              className="min-h-10 rounded-full px-3 text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
