/** docs: docs/04-componentes-e-padroes.md */

import { Logo } from "@/components/Logo";

/**
 * O corte entre dois capítulos.
 *
 * A curva é a fronteira, e é orgânica de propósito: uma linha a régua entre
 * dois grounds lê-se como duas `div` empilhadas, uma curva lê-se como dois
 * lugares. Pinta-se com a cor do capítulo **seguinte**, porque é ele que está a
 * chegar.
 *
 * Mas uma forma sólida e mais nada é só o sítio onde uma cor acaba. Por isso a
 * fronteira vem **costurada** — uma fila de pontos sobre a aresta — com
 * **linhas de nível** por cima, ecos da mesma curva a esbater-se para dentro do
 * capítulo que fica para trás, e com o **"+" semeado ao longo dela**. Lê-se
 * como uma margem, não como um corte de tesoura, e é o que dá carácter a uma
 * divisória que se repete dez vezes no site.
 *
 * As três formas alternam ao longo da página. Uma só, repetida, transforma o
 * corte em separador de template.
 */

/** Uma cúbica: os dois pontos de controlo e o ponto de chegada. */
type Cubica = readonly [number, number, number, number, number, number];

/**
 * A fronteira, em dados e não em `d`.
 *
 * Estava escrita como uma string de path, que serve para desenhar e não para
 * mais nada. Os "+" precisam de saber **por onde é que a curva passa**, e a
 * alternativa — medir o path no browser com `getPointAtLength` — obrigava o
 * componente a ser de cliente e a esperar pelo DOM para desenhar uma coisa que
 * é estática. Aqui a curva é a fonte, e o `d` deriva dela: os pontos e o traço
 * não podem divergir porque são a mesma coisa.
 */
const FORMAS = {
  a: {
    de: [0, 52],
    segs: [
      [260, -16, 560, 104, 820, 58],
      [1050, 18, 1280, 4, 1440, 34],
    ],
  },
  b: {
    de: [0, 30],
    segs: [
      [300, 90, 620, -10, 900, 40],
      [1130, 80, 1300, 96, 1440, 62],
    ],
  },
  c: {
    de: [0, 74],
    segs: [
      [280, 26, 520, 102, 780, 72],
      [1040, 42, 1260, 8, 1440, 44],
    ],
  },
} as const satisfies Record<string, { de: readonly [number, number]; segs: readonly Cubica[] }>;

type Forma = (typeof FORMAS)[keyof typeof FORMAS];

/** O `d` da fronteira. */
function caminho(f: Forma) {
  const cs = f.segs.map((s) => `C${s[0]},${s[1]} ${s[2]},${s[3]} ${s[4]},${s[5]}`);
  return `M${f.de[0]},${f.de[1]} ${cs.join(" ")}`;
}

const cubica = (a: number, b: number, c: number, d: number, t: number) => {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};

/**
 * Onde é que a fronteira passa, em `t` de 0 a 1 repartido pelos segmentos.
 *
 * O `t` é paramétrico e não por comprimento de arco — os dois segmentos de cada
 * forma não têm o mesmo comprimento, portanto a mesma semente cai em sítios
 * ligeiramente diferentes em cada uma. É a favor: o que não se quer é uma fila
 * regular a régua.
 */
function ponto(f: Forma, t: number) {
  const n = f.segs.length;
  const u = Math.min(0.999999, Math.max(0, t)) * n;
  const i = Math.floor(u);
  const local = u - i;
  const anterior = f.segs[i - 1];
  const [px, py] = i === 0 ? f.de : [anterior[4], anterior[5]];
  const [c1x, c1y, c2x, c2y, x, y] = f.segs[i];
  return {
    x: cubica(px, c1x, c2x, x, local),
    y: cubica(py, c1y, c2y, y, local),
  };
}

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

/**
 * A sementeira do "+" ao longo da fronteira.
 *
 * `t` é a posição na curva, `dy` a altura **acima** dela em unidades do
 * `viewBox` — os "+" vivem no mesmo lado que a costura e os ecos, sobre o
 * ground do capítulo que fica para trás. `s` é a escala, `o` a opacidade, `r`
 * a rotação.
 *
 * Três regras a respeitar se mexeres nisto:
 *
 * 1. **Nada de rotações perto de 45°.** Um "+" a meio caminho é um X, e um X
 *    ao longo da fronteira lê-se como um botão de fechar. A regra é a mesma do
 *    `Cruz`, e vem do mesmo sítio: do protótipo, onde aconteceu.
 * 2. **Nenhum "+" pode atravessar a aresta.** Metade laranja sobre o capítulo
 *    que fica e metade sobre o que chega não se lê como símbolo, lê-se como
 *    erro de recorte. O `dy` de cada um tem de ser maior do que meia altura do
 *    símbolo — que é `--sem × s` — mais as cinco unidades da costura. Foi a
 *    primeira versão desta lista, e via-se.
 * 3. **A lista é partilhada pelas três formas.** As curvas passam em sítios
 *    diferentes, portanto a mesma sementeira dá composições diferentes — e não
 *    há duas divisórias visíveis ao mesmo tempo para se compararem.
 */
const SEMENTEIRA = [
  { t: 0.05, dy: 16, s: 0.5, o: 0.5, r: -12 },
  { t: 0.13, dy: 27, s: 0.28, o: 0.26, r: 16 },
  { t: 0.22, dy: 17, s: 0.82, o: 0.7, r: 8 },
  { t: 0.3, dy: 30, s: 0.32, o: 0.18, r: -20 },
  { t: 0.41, dy: 21, s: 0.44, o: 0.4, r: 14 },
  { t: 0.5, dy: 19, s: 0.95, o: 0.82, r: -6 },
  { t: 0.58, dy: 29, s: 0.28, o: 0.22, r: 21 },
  { t: 0.67, dy: 14, s: 0.58, o: 0.54, r: -15 },
  { t: 0.76, dy: 25, s: 0.36, o: 0.3, r: 11 },
  { t: 0.87, dy: 16, s: 0.72, o: 0.62, r: -9 },
  { t: 0.95, dy: 28, s: 0.3, o: 0.2, r: 18 },
];

/**
 * O acento conforme o ground que fica **para trás** — que é onde a costura, os
 * ecos e os "+" vivem.
 *
 * Sobre escuro o laranja da marca dá ~7.9:1 e lê-se sozinho. Sobre o `--paper`
 * dá ~2.2:1, e a mesma divisória que tem carácter entre dois capítulos escuros
 * ficava a boiar na passagem da prova para os serviços: os traços a 0.12 e 0.22
 * de opacidade desapareciam por completo. Por isso sobre claro o acento é o
 * `--primary-strong`, que é mais escuro, e as opacidades sobem — o que se quer
 * igualar entre as dez passagens é a **presença**, não o número.
 *
 * Nenhuma das duas cores é nova: ambas são tokens do `app/globals.css`.
 */
const GROUNDS = {
  escuro: { acento: "var(--primary)", ganho: 1 },
  claro: { acento: "var(--primary-strong)", ganho: 1.6 },
} as const;

export function Curva({
  forma = "a",
  cor,
  de,
  ground = "escuro",
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
   * Se o `de` é claro ou escuro. Não se deduz do token porque o `de` é uma
   * string de CSS que o servidor não resolve — e é uma pergunta com duas
   * respostas, não uma cor a escolher: quem chama diz o que tem por trás e o
   * componente trata do resto.
   */
  ground?: keyof typeof GROUNDS;
}) {
  const f = FORMAS[forma];
  const linha = caminho(f);
  const { acento, ganho } = GROUNDS[ground];
  const op = (o: number) => Math.min(1, o * ganho);

  return (
    <div
      aria-hidden
      /* `z-0` e não mais: chega para tapar o `Cruz`, que está no mesmo plano e
         vem antes no DOM, e fica **por baixo** do `.grain-overlay` (fixo em
         `z-1`). Com o `z-3` que tinha, a curva era a única superfície da
         página sem grão, e via-se: uma faixa lisa com uma aresta reta a
         atravessá-la de lado a lado.

         Sem `overflow-hidden`: os "+" mais altos passam a aresta de cima e
         entram uns pixels no capítulo anterior, tal como os ecos já fazem. É a
         diferença entre uma margem e uma faixa recortada. */
      className="pointer-events-none relative z-0 -mb-px h-[clamp(60px,9vw,150px)] w-full [--sem:clamp(10px,1.35vw,22px)]"
      style={{ color: acento }}
    >
      <svg
        viewBox="0 -34 1440 154"
        preserveAspectRatio="none"
        className="absolute inset-0 block h-full w-full"
      >
        {/* O capítulo que fica para trás. */}
        <rect x="0" y="-34" width="1440" height="154" fill={de} />

        {/* O capítulo que chega. */}
        <path d={`M0,120 L${linha.slice(1)} L1440,120 Z`} fill={cor} />

        {/* Os ecos. O `vector-effect` mantém o traço com a mesma espessura em
            qualquer largura: sem ele o `preserveAspectRatio="none"` estica-o
            com a caixa e no telemóvel ficava um risco grosso. */}
        {NIVEIS.map((n) => (
          <path
            key={n.dy}
            d={linha}
            transform={`translate(0 ${-n.dy})`}
            fill="none"
            stroke={acento}
            strokeWidth={1.5}
            strokeOpacity={op(n.o)}
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
          strokeOpacity={op(0.6)}
          strokeLinecap="round"
          strokeDasharray="0 26"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Os "+" vivem **fora** do SVG de propósito. Lá dentro apanhavam o
          `preserveAspectRatio="none"`, que estica tudo com a caixa: num ecrã de
          390px a divisória é 0.27× em largura e 0.39× em altura, e o símbolo
          chegava oval. Aqui são caixas quadradas posicionadas em percentagem da
          mesma caixa — o mapeamento do `viewBox` é linear, portanto a
          percentagem dá exatamente o ponto da curva — e mantêm-se quadrados em
          qualquer largura sem ninguém ter de compensar a escala.

          A geometria vem do `Logo`, que a lê de `lib/brand.ts`. Nunca se
          redesenha o "+" à mão — ver docs/03. */}
      {SEMENTEIRA.map((g) => {
        const p = ponto(f, g.t);
        return (
          /* O `span` existe porque o `Logo` não recebe `style` — e não vale a
             pena alargar a API de um componente de marca para o posicionar. */
          <span
            key={g.t}
            /* A poeira não sobrevive a uma faixa de 60px: num ecrã estreito a
               divisória encolhe para o mínimo do `clamp` mas continua a ter
               1440 unidades de largura, ou seja os "+" ficam quatro vezes mais
               juntos e com 3px. Medido a 580px: leem-se como sujidade em cima
               da costura, não como símbolo. Aí ficam só os seis maiores. */
            className={`absolute block -translate-x-1/2 -translate-y-1/2 ${
              g.s < 0.4 ? "max-md:hidden" : ""
            }`}
            style={{
              left: `${(p.x / 1440) * 100}%`,
              top: `${((p.y - g.dy + 34) / 154) * 100}%`,
              width: `calc(var(--sem) * ${g.s})`,
              height: `calc(var(--sem) * ${g.s})`,
              rotate: `${g.r}deg`,
              opacity: op(g.o),
            }}
          >
            <Logo className="h-full w-full" />
          </span>
        );
      })}
    </div>
  );
}
