/** docs: docs/07-estudio.md */
import {
  formatarData,
  percentagemObjetivo,
  progressoEscrito,
  type Objetivo,
} from "@/lib/estudio/tipos";

/**
 * Onde queremos chegar, e quanto falta.
 *
 * O alvo escreve-se; **o que já está feito é contado pela base**. Ver
 * `listarObjetivos()` em `lib/estudio/dados.ts`.
 *
 * **Isto viveu num terço de linha e não dava.** Os títulos que as pessoas
 * escrevem — "Dinheiro até ao final do ano", "Clientes até final do ano" —
 * levavam `truncate` e liam-se cortados a meio; cabiam três e os restantes
 * viravam um "e mais N" que ninguém abria; e cinco dos seis textos eram
 * `text-muted` a 11-14 px ao lado de dois saldos em corpo 30. Um objetivo que
 * não se lê não é um objetivo, é decoração.
 *
 * Agora tem a linha toda: os títulos **envolvem em vez de cortar**, aparecem
 * todos, e a barra tem altura e fundo que se veem. Em ecrã largo vão a duas
 * colunas, porque uma barra de 900 px de comprimento para dizer "6 de 10" é
 * espaço gasto sem nada em troca.
 *
 * O cabeçalho não está aqui: é a página que o escreve, como faz nas outras
 * secções, para este componente poder ser usado noutro sítio sem trazer um
 * título colado.
 */
export function Objetivos({ objetivos }: { objetivos: Objetivo[] }) {
  if (objetivos.length === 0) {
    return (
      <p className="text-sm text-muted">
        Ainda nenhum. Põe um aqui em baixo — o progresso conta-se sozinho.
      </p>
    );
  }

  return (
    <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      {objetivos.map((o) => {
        const por = percentagemObjetivo(o);
        const cumprido = o.feito >= o.alvo;

        return (
          <li key={o.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              {/* Sem `truncate`: o título é a frase que a pessoa escreveu, e
                  cortá-la a meio tirava-lhe o sentido. Envolve. */}
              <span className="min-w-0 text-sm font-medium">{o.titulo}</span>
              <span
                className={`shrink-0 text-sm tabular-nums ${
                  cumprido ? "text-accent" : "text-ink"
                }`}
              >
                {progressoEscrito(o)}
              </span>
            </div>

            {/* `h-2` e fundo `border-strong`: a barra vazia era `surface-2`
                sobre `surface`, dois tons quase iguais — não se via onde a barra
                acabava, e sem isso a parte cheia não diz nada. É o mesmo token
                que a `COR_BARRA.proposta` já usa por esta razão. */}
            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border-strong"
              aria-hidden
            >
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${
                  cumprido ? "bg-accent" : "bg-primary"
                }`}
                style={{ width: `${por}%` }}
              />
            </div>

            {o.prazo ? (
              <p className="mt-1.5 text-xs text-muted">
                até {formatarData(o.prazo)}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
