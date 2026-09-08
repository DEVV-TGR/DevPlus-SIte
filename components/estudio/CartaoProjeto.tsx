/** docs: docs/07-estudio.md */
import Link from "next/link";
import { BarraProgresso } from "@/components/estudio/BarraProgresso";
import { EtiquetaEstado } from "@/components/estudio/EtiquetaEstado";
import { Responsaveis } from "@/components/estudio/Responsaveis";
import { emAtraso, formatarData, type Projeto } from "@/lib/estudio/tipos";

/**
 * Um projeto na lista. O cartão inteiro é o link — ver docs/04: o alvo de
 * clique é o cartão, não um "ver mais" ao canto.
 */
export function CartaoProjeto({
  projeto,
  hoje,
}: {
  projeto: Projeto;
  hoje: string;
}) {
  const atrasado = emAtraso(projeto, hoje);

  return (
    <li>
      <Link
        href={`/estudio/projetos/${projeto.id}`}
        className="block rounded-2xl border border-border bg-surface p-5 transition-colors duration-300 hover:border-ink/20"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-semibold tracking-tight">
              {projeto.nome}
            </h3>
            <p className="mt-0.5 truncate text-sm text-muted">
              {projeto.clienteNome ?? "Sem cliente"}
            </p>
          </div>
          <EtiquetaEstado estado={projeto.estado} className="shrink-0" />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <BarraProgresso
            progresso={projeto.progresso}
            estado={projeto.estado}
          />
          <span className="shrink-0 text-xs tabular-nums text-muted">
            {projeto.progresso}%
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Responsaveis pessoas={projeto.responsaveis} vazio="Por atribuir" />

          {projeto.prazo ? (
            <p
              className={
                atrasado ? "text-xs font-medium text-danger" : "text-xs text-muted"
              }
            >
              {atrasado ? "Atrasado desde " : "Prazo "}
              {formatarData(projeto.prazo)}
            </p>
          ) : (
            <p className="text-xs text-muted">Sem prazo</p>
          )}
        </div>
      </Link>
    </li>
  );
}
