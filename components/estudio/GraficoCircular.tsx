/** docs: docs/07-estudio.md */
import { formatarEuros } from "@/lib/estudio/tipos";

/**
 * Para onde vai o dinheiro — as despesas do mês repartidas.
 *
 * Três regras da skill de visualização, e as três mudaram o que aqui está:
 *
 * 1. **Nunca um circular de duas fatias.** Com menos de duas despesas, um
 *    círculo não reparte nada: mostra-se o número, porque "o número é o
 *    gráfico". É por isso que este componente às vezes não desenha círculo
 *    nenhum, e está certo assim.
 * 2. **Seis fatias no máximo.** As cinco maiores e um "outros" com o resto.
 *    Passadas as seis, as fatias pequenas ficam indistinguíveis umas das
 *    outras e o círculo passa a decoração.
 * 3. **Uma cor só, em tons.** A DevPlus tem duas cores de marca; arranjar seis
 *    matizes distinguíveis dali — e que sobrevivessem a daltonismo — não dava.
 *    Um `part-to-whole` ordenado por tamanho pede um degradê de uma cor, da
 *    mais forte para a mais fraca, e é isso que está aqui. Como é sequencial e
 *    não categórico, o que se verifica não é separação de matizes: é que a
 *    luminosidade desce sempre, e desce.
 *
 * A identidade nunca depende da cor: cada fatia tem o nome e o valor escritos
 * na legenda ao lado.
 */

export type Fatia = { rotulo: string; valor: number };

const MAX_FATIAS = 6;

/**
 * O tom de cada fatia, do mais forte ao mais fraco.
 *
 * Espalha-se pelo intervalo **todo** consoante o número de fatias, em vez de ir
 * buscar os primeiros valores de uma tabela fixa: com uma tabela, duas fatias
 * saíam a 1 e 0,8 e viam-se quase iguais. Assim, duas fatias ficam a 1 e 0,3 —
 * a separação é sempre a maior que cabe.
 *
 * O piso é 0,3 e não 0: abaixo disso a fatia desaparece contra o fundo.
 */
function tom(i: number, quantas: number): number {
  if (quantas <= 1) return 1;
  return 1 - (i / (quantas - 1)) * 0.7;
}

function agrupar(fatias: Fatia[]): Fatia[] {
  const ordenadas = [...fatias]
    .filter((f) => f.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  if (ordenadas.length <= MAX_FATIAS) return ordenadas;

  const principais = ordenadas.slice(0, MAX_FATIAS - 1);
  const resto = ordenadas.slice(MAX_FATIAS - 1);

  return [
    ...principais,
    {
      rotulo: `Outros (${resto.length})`,
      valor: resto.reduce((soma, f) => soma + f.valor, 0),
    },
  ];
}

/** O caminho de um anel entre dois ângulos, em graus, a começar no topo. */
function arco(de: number, ate: number, raio: number, interior: number): string {
  const rad = (g: number) => ((g - 90) * Math.PI) / 180;
  const ponto = (g: number, r: number) => [
    100 + r * Math.cos(rad(g)),
    100 + r * Math.sin(rad(g)),
  ];

  const [x1, y1] = ponto(de, raio);
  const [x2, y2] = ponto(ate, raio);
  const [ix2, iy2] = ponto(ate, interior);
  const [ix1, iy1] = ponto(de, interior);
  const grande = ate - de > 180 ? 1 : 0;

  return [
    `M ${x1} ${y1}`,
    `A ${raio} ${raio} 0 ${grande} 1 ${x2} ${y2}`,
    `L ${ix2} ${iy2}`,
    `A ${interior} ${interior} 0 ${grande} 0 ${ix1} ${iy1}`,
    "Z",
  ].join(" ");
}

export function GraficoCircular({
  fatias,
  vazio,
  nota,
  descreve,
}: {
  fatias: Fatia[];
  vazio: string;
  /** O período, escrito por extenso, para o centro da roda: `este mês`,
   *  `este ano`, `desde sempre`. Chega por prop e não está aqui escrito porque
   *  o mesmo componente desenha agora as entradas e as saídas, e nenhum dos
   *  dois manda no período do outro. */
  nota: string;
  /** O que isto é, para quem ouve a página em vez de a ver — "Despesas",
   *  "Entradas". Entra no `aria-label` junto com o total e a `nota`. */
  descreve: string;
}) {
  const agrupadas = agrupar(fatias);
  const total = agrupadas.reduce((soma, f) => soma + f.valor, 0);

  if (agrupadas.length === 0 || total <= 0) {
    return <p className="text-sm text-muted">{vazio}</p>;
  }

  /* Uma fatia só não é uma repartição — é um número. Ver a regra 1 lá em cima. */
  if (agrupadas.length === 1) {
    return (
      <div>
        <p className="font-display text-2xl font-semibold tabular-nums tracking-tight">
          {formatarEuros(total)}
        </p>
        <p className="mt-1 text-sm text-muted">
          {/* Sem `toLowerCase()`: os rótulos deixaram de ser só descrições de
              gastos e passaram a ser também nomes de projetos. "tudo em
              império auto concept" lê-se a um nome próprio estropiado. */}
          tudo em {agrupadas[0].rotulo}
        </p>
      </div>
    );
  }

  /* 2 graus de intervalo entre fatias, como a skill pede: sem ele, duas fatias
     encostadas leem-se como uma. */
  const INTERVALO = 2;

  /* Um ciclo e não um `map`: o ângulo acumula de fatia para fatia, e o
     compilador do React não deixa (bem) mexer numa variável de fora dentro do
     callback de um `map` durante o render. */
  const desenhadas: (Fatia & { de: number; ate: number; tom: number })[] = [];
  let angulo = 0;

  for (const [i, f] of agrupadas.entries()) {
    const fatia = (f.valor / total) * 360;
    const de = angulo + INTERVALO / 2;
    const ate = angulo + fatia - INTERVALO / 2;
    angulo += fatia;
    desenhadas.push({
      ...f,
      de,
      /* Uma fatia minúscula tem de continuar a desenhar-se: sem o mínimo, o
         intervalo comia-a e ela desaparecia do círculo mas continuava na
         legenda. */
      ate: Math.max(ate, de + 0.5),
      tom: tom(i, agrupadas.length),
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
      <svg
        viewBox="0 0 200 200"
        className="h-40 w-40 shrink-0"
        role="img"
        aria-label={`${descreve} ${nota}, ${formatarEuros(total)} no total`}
      >
        {desenhadas.map((f) => (
          <path
            key={f.rotulo}
            d={arco(f.de, f.ate, 88, 56)}
            className="fill-primary"
            style={{ opacity: f.tom }}
          >
            <title>{`${f.rotulo} · ${formatarEuros(f.valor)}`}</title>
          </path>
        ))}

        <text
          x="100"
          y="97"
          textAnchor="middle"
          className="fill-ink font-semibold"
          style={{ fontSize: 19 }}
        >
          {formatarEuros(total).replace(/\s?€/, "")}
        </text>
        <text
          x="100"
          y="114"
          textAnchor="middle"
          className="fill-muted"
          style={{ fontSize: 11 }}
        >
          {nota}
        </text>
      </svg>

      <ul className="min-w-0 flex-1 space-y-2">
        {desenhadas.map((f) => (
          <li key={f.rotulo} className="flex items-baseline gap-2.5 text-sm">
            <span
              aria-hidden
              className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-sm bg-primary"
              style={{ opacity: f.tom }}
            />
            <span className="min-w-0 flex-1 truncate">{f.rotulo}</span>
            <span className="shrink-0 tabular-nums text-muted">
              {formatarEuros(f.valor)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
