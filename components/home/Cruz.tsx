"use client";
/** docs: docs/04-componentes-e-padroes.md — o gesto está especificado aí. */

import { useRef } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/motion";
import { Logo } from "@/components/Logo";

/**
 * O "+" atravessa a página.
 *
 * **Nasceu na página inicial e deixou de ser só dela.** A regra antiga —
 * "usá-lo noutra página; o gesto perde sentido repetido" — foi escrita quando
 * a homepage era a única página com esta gramática. Com as cinco interiores a
 * partilhá-la, o que gastava o gesto não era repeti-lo, era repeti-lo **igual**:
 * cada página traz os seus postos, e as interiores levam quatro em vez de sete.
 * Ver `POSTOS_PAGINA` abaixo e o `docs/04`.
 *
 * Uma camada fixa, atrás do conteúdo, conduzida pelo **scroll do documento
 * inteiro** e não pelo progresso de uma secção — é isso que o deixa sobreviver
 * aos cortes entre capítulos em vez de morrer com aquele onde nasceu. Chega à
 * escala de um prédio na capa, encolhe e roda no corte, fica cinzento sobre o
 * papel, e volta a laranja para fechar.
 *
 * A geometria vem do `Logo`, que a lê de `lib/brand.ts`. Nunca se redesenha o
 * "+" à mão nem se gera por modelo — ver `docs/03`.
 */

export type Posto = {
  /** Fração do scroll total da página. */
  p: number;
  /** Escala. */
  s: number;
  /** Deslocamento horizontal, em vw. */
  x: number;
  /** Deslocamento vertical, em vh. */
  y: number;
  /** Rotação, em graus. */
  r: number;
  /** Um token de cor. Nunca um hex — ver docs/02. */
  c: string;
};

/** Os postos da **página inicial**: sete, para um percurso de quinze ecrãs. */
const POSTOS_HOME: Posto[] = [
  { p: 0.0, s: 2.7, x: 30, y: -10, r: 0, c: "var(--primary)" },
  { p: 0.12, s: 2.1, x: 34, y: 8, r: 18, c: "var(--primary)" },
  { p: 0.26, s: 0.55, x: -38, y: 18, r: 45, c: "var(--primary)" },
  { p: 0.44, s: 0.8, x: 36, y: -20, r: 0, c: "var(--paper-muted)" },
  { p: 0.62, s: 0.5, x: -40, y: -26, r: 45, c: "var(--primary)" },
  { p: 0.8, s: 0.9, x: 36, y: 22, r: 12, c: "var(--primary)" },
  /* No fecho o "+" sai do centro: é ali que vive o CTA, e o gesto não pode
     custar o botão. Creme sobre o laranja lê-se como marca-d'água em vez de
     competir com o título, que é escuro. */
  { p: 1.0, s: 1.15, x: 40, y: 30, r: 0, c: "var(--ink)" },
];

/**
 * Os postos das **páginas interiores**, que são curtas: quatro paragens, e o
 * mesmo desenho serve as cinco. Duas regras que a homepage não precisou de ter,
 * porque lá o "+" vive quase sempre sobre imagem ou sobre vazio:
 *
 * 1. **Grande só onde não há texto corrido** — nos extremos, que é onde a
 *    página tem o título ou o fecho. A meio, onde se lê, nunca passa de 0,6.
 * 2. **Nunca 45°.** Um "+" rodado a meio caminho é um X, e um X grande e
 *    cinzento ao lado das capas do portfólio lê-se como um botão de fechar por
 *    cima do trabalho. Aconteceu no protótipo, e é de lá que vem esta regra.
 *
 * Cada página passa os seus em `postos` — o que muda de página para página é
 * o **lado**, para o "+" não cair sempre onde está o texto dela.
 */
export const POSTOS_PAGINA: Posto[] = [
  /* O tramo grande é curto de propósito: aos 22% da página o "+" já encolheu.
     Com o primeiro posto a durar até meio, ele ainda ia em escala 1,6 quando
     o conteúdo começava — e ao lado das capas do portfólio isso não é um
     gesto de fundo, é uma mancha a competir com o trabalho. */
  { p: 0.0, s: 1.9, x: 36, y: -24, r: 0, c: "var(--primary)" },
  { p: 0.22, s: 0.5, x: 44, y: 18, r: 8, c: "var(--primary)" },
  { p: 0.72, s: 0.45, x: -42, y: -26, r: 10, c: "var(--paper-muted)" },
  { p: 1.0, s: 1.2, x: -38, y: 30, r: 0, c: "var(--primary)" },
];

/**
 * Os postos do **telemóvel**, e são outros por uma razão de geometria: os
 * deslocamentos são em `vw`, e num ecrã de 390px `36vw` são 140px — o "+" cai
 * no meio da coluna de leitura em vez de ficar na margem, que num ecrã de
 * 1440px é onde ele estava. Medido: tapava os três telefones do `/contacto` e
 * atravessava os parágrafos do caso de estudo.
 *
 * Aqui a escala nunca passa de 1,1 (contra 1,9), e o "+" vive **encostado aos
 * cantos**: entra por cima à direita, desce pela margem, e assenta em baixo.
 * Continua a atravessar a página — é a assinatura do site — mas por trás dela,
 * e não por cima do que se está a ler.
 */
export const POSTOS_MOBILE: Posto[] = [
  { p: 0.0, s: 1.1, x: 40, y: -34, r: 0, c: "var(--primary)" },
  { p: 0.34, s: 0.42, x: 44, y: 30, r: 8, c: "var(--primary)" },
  { p: 0.72, s: 0.4, x: -44, y: -32, r: 10, c: "var(--paper-muted)" },
  { p: 1.0, s: 0.9, x: -42, y: 34, r: 0, c: "var(--primary)" },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Suaviza a passagem entre postos: sem isto o "+" muda de direção em bicos. */
const suave = (t: number) => t * t * (3 - 2 * t);

function posto(POSTOS: Posto[], p: number) {
  let i = 0;
  while (i < POSTOS.length - 2 && p > POSTOS[i + 1].p) i++;
  const a = POSTOS[i];
  const b = POSTOS[i + 1];
  const t = suave(Math.min(1, Math.max(0, (p - a.p) / (b.p - a.p))));
  return {
    s: lerp(a.s, b.s, t),
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    r: lerp(a.r, b.r, t),
    c: t < 0.5 ? a.c : b.c,
  };
}

export function Cruz({
  postos = POSTOS_HOME,
  /** O percurso do telemóvel. Só se passa quando a página quer um seu. */
  postosMobile = POSTOS_MOBILE,
}: {
  postos?: Posto[];
  postosMobile?: Posto[];
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current?.firstElementChild as HTMLElement | null;
      if (!el) return;

      const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      /* Qual dos dois percursos vale é decidido a cada `refresh` e não uma vez
         na montagem: rodar o telemóvel troca a largura sem desmontar nada. */
      const estreito = window.matchMedia("(max-width: 767px)");
      const quais = () => (estreito.matches ? postosMobile : postos);

      const pintar = (p: number) => {
        const v = posto(quais(), p);
        el.style.setProperty("--cs", v.s.toFixed(3));
        el.style.setProperty("--cx", `${v.x.toFixed(2)}vw`);
        el.style.setProperty("--cy", `${v.y.toFixed(2)}vh`);
        el.style.setProperty("--cr", `${v.r.toFixed(2)}deg`);
        el.style.setProperty("--cfill", v.c);
      };

      if (reduz) {
        /* Sem movimento, o "+" fica onde a capa o põe. A página continua a
           ter o símbolo; o que não tem é a viagem. */
        pintar(0);
        return;
      }

      /* Um objeto deste tamanho a seguir o scroll 1:1 mostra cada buraco entre
         eventos de roda como um solavanco. O `scrub` do ScrollTrigger faz a
         interpolação por nós, e no mesmo relógio do resto da página.

         O percurso mede-se de zero a **`"max"`**, e não do topo ao fundo do
         `document.body`. Com `trigger: document.body` e `end: "bottom bottom"`
         o fim ficava preso à altura do corpo medida com os pins revertidos —
         o `_refreshAll` do ScrollTrigger reverte-os para medir — portanto sem
         os ~6000 px que as secções pinadas (`ComoTrabalhamos`,
         `ProvaCarrossel`, `ServicosMostra`) acrescentam. O gesto chegava ao
         último posto a meio da página e ficava lá parado o resto do caminho.

         O `"max"` é a única forma que o GSAP corrige **depois** de todos os
         triggers refrescarem: no fim do `_refreshAll` há um segundo passe que
         reposiciona quem tem `end: "max"` pelo scroll máximo já com os
         espaçadores dos pins no sítio. Um número, uma função ou um
         `"bottom bottom"` não entram nesse passe. */
      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => pintar(self.progress),
      });
      pintar(0);

      const repintar = () => pintar(st.progress);
      estreito.addEventListener("change", repintar);
      return () => {
        estreito.removeEventListener("change", repintar);
        st.kill();
      };
    },
    /* Os postos entram nas dependências: sem isso, uma página que os mude
       continuava com os da anterior depois de uma navegação de cliente. */
    { scope: ref, dependencies: [postos, postosMobile] },
  );

  return (
    <div
      ref={ref}
      aria-hidden
      /* O `scripts/verificar-scroll.mjs` procura-o por aqui, para confirmar que
         o gesto anda até ao fim da página. */
      data-cruz
      className="pointer-events-none fixed inset-0 z-0 grid place-items-center"
    >
      <Logo className="h-[22vmin] w-[22vmin] overflow-visible [transform-origin:50%_50%] [transform:translate3d(var(--cx,0),var(--cy,0),0)_rotate(var(--cr,0deg))_scale(var(--cs,1))] [&_path]:fill-[var(--cfill,var(--primary))] [&_path]:transition-[fill] [&_path]:duration-500" />
    </div>
  );
}
