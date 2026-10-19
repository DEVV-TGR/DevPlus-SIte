/** docs: docs/07-estudio.md */
import Link from "next/link";
import { Icone } from "@/components/estudio/Icone";
import { SOBRETITULO } from "@/components/estudio/estilos";

/**
 * A cabeça de cada página do Estúdio: o sobretítulo, o título grande e uma
 * frase — e, à direita, as ações da página.
 *
 * Estava escrita à mão em onze páginas, cada uma com o seu `mt-2` ou `mt-3`, e
 * já não eram iguais. Aqui é uma.
 *
 * A seta de voltar só aparece onde os separadores não chegam: num ecrã que
 * está **dentro** de uma secção (a ficha de um projeto volta aos Projetos).
 */
export function TituloDaPagina({
  sobretitulo,
  titulo,
  frase,
  voltarPara,
  accoes,
}: {
  sobretitulo?: string;
  titulo: React.ReactNode;
  frase?: React.ReactNode;
  voltarPara?: { href: string; rotulo: string };
  accoes?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="flex min-w-0 items-start gap-4">
        {voltarPara ? (
          <Link
            href={voltarPara.href}
            aria-label={`Voltar a ${voltarPara.rotulo}`}
            title={voltarPara.rotulo}
            className="mt-1 grid size-10 flex-none place-items-center rounded-xl border border-border text-muted transition-colors hover:border-ink/40 hover:text-ink"
          >
            <Icone nome="voltar" tamanho={18} />
          </Link>
        ) : null}
        <div className="min-w-0">
          {sobretitulo ? <p className={SOBRETITULO}>{sobretitulo}</p> : null}
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {titulo}
          </h1>
          {frase ? <div className="mt-2 text-sm text-muted">{frase}</div> : null}
        </div>
      </div>
      {accoes ? (
        <div className="flex flex-wrap items-center gap-2">{accoes}</div>
      ) : null}
    </header>
  );
}
