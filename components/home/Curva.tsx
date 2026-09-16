/** docs: docs/04-componentes-e-padroes.md */

/**
 * O corte entre dois capítulos da página inicial.
 *
 * A curva é a fronteira, e é orgânica de propósito: uma linha a régua entre
 * dois grounds lê-se como duas `div` empilhadas, uma curva lê-se como dois
 * lugares. Pinta-se com a cor do capítulo **seguinte**, porque é ele que está a
 * chegar.
 *
 * Mas uma forma sólida e mais nada é só o sítio onde uma cor acaba. Por isso a
 * fronteira vem **costurada** — uma fila de pontos sobre a aresta — e com
 * **linhas de nível** por cima, ecos da mesma curva a esbater-se para dentro do
 * capítulo que fica para trás. Lê-se como uma margem, não como um corte de
 * tesoura, e é o que dá carácter a uma divisória que se repete quatro vezes.
 *
 * As três formas alternam ao longo da página. Uma só, repetida, transforma o
 * corte em separador de template.
 */

/** A fronteira, só a curva: o sólido e os ecos derivam todos daqui. */
const FORMAS = {
  a: "M0,52 C260,-16 560,104 820,58 C1050,18 1280,4 1440,34",
  b: "M0,30 C300,90 620,-10 900,40 C1130,80 1300,96 1440,62",
  c: "M0,74 C280,26 520,102 780,72 C1040,42 1260,8 1440,44",
} as const;

/**
 * Os ecos, em unidades do `viewBox`, com a opacidade de cada um. Sobem para
 * dentro do capítulo anterior e apagam-se — o mais distante quase não está lá.
 * O `viewBox` abre 34 unidades acima do zero precisamente para lhes dar sítio:
 * a curva mais alta chega a `y = 18`, e o eco de cima leva-a a `−12`.
 */
const NIVEIS = [
  { dy: 10, o: 0.38 },
  { dy: 20, o: 0.22 },
  { dy: 30, o: 0.12 },
];

export function Curva({
  forma = "a",
  cor,
  de,
  acento = "var(--primary)",
}: {
  forma?: keyof typeof FORMAS;
  /** Um token de cor. Nunca um hex — ver docs/02. */
  cor: string;
  /**
   * O ground do capítulo que fica **para trás**, pintado por baixo de tudo.
   * Sem ele a metade de cima do SVG é transparente e deixa passar o fundo do
   * `body` — o que num par claro→escuro, como o da `ProvaCarrossel` para os
   * serviços, punha um corte a régua por cima da curva e dava cabo dela.
   * Também um token, nunca um hex.
   */
  de: string;
  /**
   * A cor da costura e dos ecos. Vive sempre **acima** da fronteira, ou seja
   * sobre o ground do capítulo que fica para trás — por isso o laranja da marca
   * serve as quatro passagens. Também um token, nunca um hex.
   */
  acento?: string;
}) {
  const linha = FORMAS[forma];

  return (
    <svg
      viewBox="0 -34 1440 154"
      preserveAspectRatio="none"
      aria-hidden
      /* `z-0` e não mais: chega para tapar o `Cruz`, que está no mesmo plano e
         vem antes no DOM, e fica **por baixo** do `.grain-overlay` (fixo em
         `z-1`). Com o `z-3` que tinha, a curva era a única superfície da
         página sem grão, e via-se: uma faixa lisa com uma aresta reta a
         atravessá-la de lado a lado. */
      className="relative z-0 -mb-px block h-[clamp(60px,9vw,150px)] w-full"
    >
      {/* O capítulo que fica para trás. */}
      <rect x="0" y="-34" width="1440" height="154" fill={de} />

      {/* O capítulo que chega. */}
      <path d={`M0,120 L${linha.slice(1)} L1440,120 Z`} fill={cor} />

      {/* Os ecos. O `vector-effect` mantém o traço com a mesma espessura em
          qualquer largura: sem ele o `preserveAspectRatio="none"` estica-o com
          a caixa e no telemóvel ficava um risco grosso. */}
      {NIVEIS.map((n) => (
        <path
          key={n.dy}
          d={linha}
          transform={`translate(0 ${-n.dy})`}
          fill="none"
          stroke={acento}
          strokeWidth={1.5}
          strokeOpacity={n.o}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* A costura: um traço de comprimento zero com ponta redonda é um ponto,
          e o `dasharray` distribui-os ao longo da fronteira sem que ninguém
          tenha de calcular onde é que ela passa. Corre cinco unidades **acima**
          da aresta, e não em cima dela: na última passagem o capítulo que chega
          é o próprio laranja, e uma costura laranja sobre laranja não existe. */}
      <path
        d={linha}
        transform="translate(0 -5)"
        fill="none"
        stroke={acento}
        strokeWidth={3}
        strokeOpacity={0.6}
        strokeLinecap="round"
        strokeDasharray="0 26"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
