/** docs: docs/07-estudio.md */
import {
  formatarEuros,
  formatarMes,
  type MesDeContas,
} from "@/lib/estudio/tipos";

/**
 * Entradas e saídas, mês a mês. Barras agrupadas, SVG escrito à mão.
 *
 * **Sem biblioteca de gráficos.** É um gráfico de barras: uma dependência para
 * isto trazia bundle, mais uma superfície de `npm audit` e uma segunda forma de
 * desenhar coisas neste projeto. Não se paga.
 *
 * **Um eixo só.** Entradas e saídas são as duas em euros e partilham a escala —
 * é isso que deixa comparar a altura de uma com a da outra. Dois eixos com duas
 * escalas seria a forma mais rápida de mentir com um gráfico verdadeiro.
 *
 * **As cores foram validadas, não escolhidas a olho.** Com o verde do `accent`
 * contra o cinzento claro do `muted` — que era a escolha óbvia — as duas barras
 * ficavam a ΔE 4.8 para quem tem daltonismo deutan, ou seja, indistinguíveis
 * para cerca de uma em cada doze pessoas. Trocar o cinzento claro pelo escuro
 * do `border-strong` leva isso a 25.3. Ver docs/07.
 *
 * A identidade nunca depende só da cor: há legenda por cima e o valor de cada
 * barra no `title`, que o browser mostra ao passar por cima.
 */

const L = 48; // espaço à esquerda para os valores do eixo
const R = 8;
const TOPO = 14;
const BASE = 26; // espaço em baixo para os meses
const LARGURA = 720;
const ALTURA = 190;
const PLOT = ALTURA - TOPO - BASE;

/** Arredonda o topo da escala para um número que se leia — 1.234 vira 1.500. */
function tetoBonito(max: number): number {
  if (max <= 0) return 100;
  const potencia = 10 ** Math.floor(Math.log10(max));
  for (const passo of [1, 1.5, 2, 2.5, 5, 10]) {
    const candidato = passo * potencia;
    if (candidato >= max) return candidato;
  }
  return 10 * potencia;
}

export function GraficoMeses({ meses }: { meses: MesDeContas[] }) {
  const houveMovimento = meses.some((m) => m.entradas > 0 || m.saidas > 0);

  if (!houveMovimento) {
    return (
      <p className="text-sm text-muted">
        Ainda não há entradas nem saídas registadas. Assim que houver, aparece
        aqui a história dos últimos doze meses.
      </p>
    );
  }

  const teto = tetoBonito(
    Math.max(...meses.map((m) => Math.max(m.entradas, m.saidas))),
  );

  const plotLargura = LARGURA - L - R;
  const grupo = plotLargura / meses.length;
  /* 2px de intervalo entre as duas barras do mesmo mês, como a skill de
     visualização pede — sem ele, duas barras encostadas leem-se como uma. */
  const barra = Math.max(6, (grupo - 14) / 2 - 1);
  const y = (valor: number) => TOPO + PLOT - (valor / teto) * PLOT;

  const linhas = [0, 0.5, 1].map((f) => ({ f, valor: teto * f }));

  return (
    <figure className="m-0">
      <figcaption className="mb-3 flex flex-wrap items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm bg-accent"
            aria-hidden
          />
          Entradas
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm bg-border-strong"
            aria-hidden
          />
          Saídas
        </span>
      </figcaption>

      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        className="w-full"
        role="img"
        aria-label={`Entradas e saídas dos últimos ${meses.length} meses`}
      >
        {/* Grelha recessiva: três linhas, nunca a competir com os dados. */}
        {linhas.map(({ f, valor }) => (
          <g key={f}>
            <line
              x1={L}
              x2={LARGURA - R}
              y1={y(valor)}
              y2={y(valor)}
              stroke="var(--color-border)"
              strokeWidth="1"
            />
            <text
              x={L - 8}
              y={y(valor) + 3.5}
              textAnchor="end"
              className="fill-muted"
              style={{ fontSize: 10 }}
            >
              {valor === 0 ? "0" : formatarEuros(valor).replace(/\s?€/, "")}
            </text>
          </g>
        ))}

        {meses.map((m, i) => {
          const x = L + i * grupo + 7;
          return (
            <g key={m.mes}>
              {m.entradas > 0 ? (
                <rect
                  x={x}
                  y={y(m.entradas)}
                  width={barra}
                  height={Math.max(2, TOPO + PLOT - y(m.entradas))}
                  rx="3"
                  className="fill-accent"
                >
                  <title>{`${formatarMes(m.mes)} · entrou ${formatarEuros(m.entradas)}`}</title>
                </rect>
              ) : null}

              {m.saidas > 0 ? (
                <rect
                  x={x + barra + 2}
                  y={y(m.saidas)}
                  width={barra}
                  height={Math.max(2, TOPO + PLOT - y(m.saidas))}
                  rx="3"
                  className="fill-border-strong"
                >
                  <title>{`${formatarMes(m.mes)} · saiu ${formatarEuros(m.saidas)}`}</title>
                </rect>
              ) : null}

              {/* Um mês sim, um mês não — doze etiquetas colidiam em mobile. A
                  contagem faz-se **a partir do fim**, para o mês atual ficar
                  sempre etiquetado: é o que tem os números que interessam, e
                  contar a partir do início deixava-o sem nome em metade dos
                  meses do ano. */}
              {(meses.length - 1 - i) % 2 === 0 ? (
                <text
                  x={x + barra + 1}
                  y={ALTURA - 8}
                  textAnchor="middle"
                  className="fill-muted"
                  style={{ fontSize: 10 }}
                >
                  {formatarMes(m.mes)}
                </text>
              ) : null}
            </g>
          );
        })}

        <line
          x1={L}
          x2={LARGURA - R}
          y1={TOPO + PLOT}
          y2={TOPO + PLOT}
          stroke="var(--color-border-strong)"
          strokeWidth="1"
        />
      </svg>

      {/* A tabela é o que torna isto legível para quem usa leitor de ecrã, para
          quem imprime, e para quem só quer o número exato. Ver a skill de
          visualização: um gráfico sem tabela é um gráfico que exclui gente. */}
      <details className="mt-4">
        <summary className="cursor-pointer text-xs text-muted hover:text-ink">
          Ver os números
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-muted">
              <tr>
                <th className="py-1.5 pr-4 font-medium">Mês</th>
                <th className="py-1.5 pr-4 font-medium">Entrou</th>
                <th className="py-1.5 font-medium">Saiu</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {meses.map((m) => (
                <tr key={m.mes} className="border-t border-border">
                  <td className="py-1.5 pr-4">{formatarMes(m.mes)}</td>
                  <td className="py-1.5 pr-4">{formatarEuros(m.entradas)}</td>
                  <td className="py-1.5">{formatarEuros(m.saidas)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
