"use client";
/** docs: docs/04-componentes-e-padroes.md */

import { useRef } from "react";
import {
  gsap,
  ScrollTrigger,
  useGSAP,
  MOVIMENTO,
  comPausa,
} from "@/lib/motion";
import { MaterialGround } from "@/components/atelier/MaterialGround";
import { MaterialSurface } from "@/components/atelier/MaterialSurface";

/**
 * Os quatro passos, em cards que **chegam com o scroll e se acumulam** por
 * cima do título — não numa grelha.
 *
 * O empilhamento é o ponto: cada card entra rodado para o seu lado e fica, e
 * no fim vê-se o processo todo de uma vez. Quatro caixas iguais lado a lado
 * diriam a mesma coisa e não se lembrariam.
 *
 * Os textos são os mesmos de `app/servicos/page.tsx` — se mudarem lá, mudam
 * aqui. Não se inventa um processo diferente por página.
 */
/**
 * Cada passo tem duas poses, **só de `md` para cima**: `pousa`, onde assenta no
 * leque, e `atira`, de onde é lançado — fora do palco e rodado a mais.
 *
 * São dados e não classes Tailwind porque o GSAP tem de animar de uma para a
 * outra, e uma classe e um `transform` inline a disputar o mesmo elemento dão
 * sempre empate a favor do inline: as poses em classe ficavam a decorar o
 * markup sem mandar em nada. As finais chegam ao CSS na mesma, por custom
 * properties no `style` de cada card (ver o `xl:[transform:…]` lá em baixo),
 * para que sem JavaScript — ou com `prefers-reduced-motion` — o leque exista.
 * Uma fonte, dois leitores.
 *
 * `x` é em `vw`, `y` em `svh`, ambos medidos do centro do palco, e `r` em
 * graus. Em telemóvel a secção é uma fila horizontal e **nada disto se
 * aplica**: um `translate` em vw atirava os cards para fora dela — foi assim
 * que o passo 01 ficou com metade do texto cortada pela margem esquerda.
 */
const PASSOS = [
  {
    n: "01",
    t: "Conversa",
    d: "Sentamo-nos contigo a perceber o negócio, quem são os teus clientes e o que queres ganhar com isto. Sem isso, o resto é decoração.",
    entrega: "Objetivos alinhados",
    pousa: { x: -31, y: 8, r: -5 },
    atira: { x: -78, y: 34, r: -30 },
  },
  {
    n: "02",
    t: "Design",
    d: "Mostramos-te o site desenhado antes de ele existir. Vês, dizes o que mudarias, e só depois se escreve código.",
    entrega: "Design validado",
    pousa: { x: -10.5, y: 13, r: 4 },
    atira: { x: -21, y: 95, r: 22 },
  },
  {
    n: "03",
    t: "Construção",
    d: "Abre depressa, funciona bem no telemóvel e aparece nas pesquisas. Não são extras que se pedem, é como fazemos.",
    entrega: "Site construído",
    pousa: { x: 10.5, y: 8, r: -3 },
    atira: { x: 21, y: 95, r: -20 },
  },
  {
    n: "04",
    t: "No ar",
    d: "Pomos o site online, acompanhamos os primeiros dias e afinamos o que for preciso. E ficamos cá para o que vier a seguir.",
    entrega: "Lançamento e acompanhamento",
    pousa: { x: 31, y: 13, r: 5 },
    atira: { x: 78, y: 34, r: 30 },
  },
];

export function ComoTrabalhamos() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(
        {
          desktop: "(min-width: 1280px)",
          mobile: "(max-width: 1279px)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        () => {
          const raiz = ref.current;
          if (!raiz) return;
          const palco = raiz.querySelector<HTMLElement>("[data-palco]");
          const cards = raiz.querySelectorAll<HTMLElement>("[data-passo]");
          if (!palco) return;

          /* Vindo do leque, o revert da timeline deixa um `transform` inline
             nos cards: o GSAP decompôs a pose do CSS na primeira leitura e volta
             a compô-la com o `scale` de partida. A 1024px a fila ficava 400px
             mais larga do que num carregamento a frio, e o pin mais comprido.
             Aqui recomeça-se sempre do markup — e sem `transform` inline é o
             CSS que manda na pose, que é o que o ramo reduzido precisa. */
          gsap.set(cards, { clearProps: "transform,translate,rotate,scale" });

          /* As poses finais estão no CSS (o `xl:[transform:…]` do card), por isso
         aqui não se escreve `transform` nenhum: basta acender os cards e sai-se
         da frente. Um `scale: 1` inline bastava para o GSAP passar a mandar no
         `transform` e apagar o leque. */
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            gsap.set(cards, { opacity: 1 });
            return;
          }

          /* **No telemóvel a acumulação não cabe.** Quatro cards sobrepostos num
         ecrã de 390px saem pelas margens — metade do texto do passo 01 ficava
         cortada à esquerda — e a pilha custava 2,8 ecrãs de scroll. Aí a
         secção passa a uma **fila horizontal**: o título fica preso em cima e
         os cards passam de lado, um de cada vez. É a forma que o site de
         referência usa nesta mesma secção no iPhone, e é a mesma gramática do
         `ProvaCarrossel` — lateral lê-se como percorrer uma lista, e é isso
         que quatro passos são. */
          if (window.matchMedia("(max-width: 1279px)").matches) {
            const fila = raiz.querySelector<HTMLElement>("[data-fila]");
            if (!fila) return;
            gsap.set(cards, { opacity: 1 });

            const percurso = () =>
              Math.max(0, fila.scrollWidth - window.innerWidth);
            const st = ScrollTrigger.create({
              trigger: raiz,
              start: "top top",
              /* Os 25% de ecrã que aqui sobravam no fim eram a mesma ideia da
             pausa, escrita à mão e só de um lado. Agora são as duas, e vêm do
             `MOVIMENTO`. */
              end: () => `+=${comPausa(percurso()).total}`,
              pin: palco,
              scrub: 0.6,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const d = percurso();
                gsap.set(fila, {
                  x: -comPausa(d).progresso(self.progress) * d,
                  force3D: true,
                });
              },
            });
            return () => st.kill();
          }

          gsap.set(cards, { opacity: 0 });

          /* As poses vêm em `vw`/`svh` e o GSAP escreve px. São funções para o
         `invalidateOnRefresh` as remedir a cada `refresh` — de outro modo o
         leque ficava com as medidas da janela que existia ao carregar. */
          const vw = (n: number) => (window.innerWidth * n) / 100;
          const svh = (n: number) => (palco.clientHeight * n) / 100;

          /* O leque ocupa 180% de ecrã, como sempre ocupou. O que é novo são as
         duas pausas em volta: o título fica sozinho e parado antes de o
         primeiro card chegar, e os quatro ficam parados e inteiros antes de a
         página seguir. */
          const percurso = () => comPausa(window.innerHeight * 1.8);
          const { fracao } = percurso();

          /* O ritmo dos cards está em unidades da timeline, e é o `scrub` que as
         estica para caber no percurso. Por isso o que aqui se escreve são
         **frações do percurso todo** — e a animação vale o que sobra depois de
         tirar as duas pausas. */
          const DUR = 0.6;
          const PASSO = 0.7;
          const escala = (1 - fracao * 2) / (PASSO * (cards.length - 1) + DUR);

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: raiz,
              start: "top top",
              end: () => `+=${percurso().total}`,
              pin: palco,
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });

          /* Cada card ocupa uma fatia do percurso e **fica** — o `stagger` não
         serve aqui, porque queremos que se acumulem, não que se sucedam.

         E cada um **chega de fora**: os das pontas entram pelo lado, os do
         meio sobem de baixo do palco, todos rodados a mais do que a inclinação
         em que acabam. O `overflow-hidden` do palco corta-os à entrada, que é
         precisamente o que se quer ver — uma carta a aparecer pela borda da
         mesa, não a materializar-se no sítio.

         São dois tweens e não um: a posição leva o `easeCarta`, que passa do
         destino por pouco mais de 1% e volta — sente-se a carta a assentar sem
         se ver um ressalto —
         e a opacidade leva a curva normal, porque uma opacidade com overshoot
         passa de 1 e volta, o que é um `flash` e não um gesto. A escala
         assenta antes da posição, como em todo o site. */
          cards.forEach((c, i) => {
            const { pousa, atira } = PASSOS[i];
            const inicio = fracao + i * PASSO * escala;
            tl.fromTo(
              c,
              { opacity: 0, scale: MOVIMENTO.escalaDe },
              {
                opacity: 1,
                scale: 1,
                duration: 0.36 * escala,
                ease: MOVIMENTO.ease,
              },
              inicio,
            ).fromTo(
              c,
              {
                x: () => vw(atira.x),
                y: () => svh(atira.y),
                rotation: atira.r,
              },
              {
                x: () => vw(pousa.x),
                y: () => svh(pousa.y),
                rotation: pousa.r,
                duration: DUR * escala,
                ease: MOVIMENTO.easeCarta,
              },
              inicio,
            );
          });

          /* A pausa da saída tem de estar **na** timeline: sem um tramo que a
         ocupe, o GSAP encurta-a ao último card e o `scrub` volta a esticar
         tudo até ao fim do pin — a pausa desaparecia sozinha. */
          tl.to({}, { duration: fracao }, 1 - fracao);
        },
      );
      return () => media.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className="capitulo-fundo relative"
      aria-labelledby="como-trabalhamos"
    >
      <div
        data-palco
        /* `justify-start` e não `center`: o palco corta nos dois lados
           (`overflow-hidden`), e com o conteúdo centrado era o topo do título
           que desaparecia. Em telemóvel o título encosta ao cimo e a fila
           ocupa o que sobra. */
        className="relative isolate flex min-h-[100svh] flex-col justify-start gap-6 overflow-hidden pb-10 pt-[var(--abertura)] xl:grid xl:place-items-center xl:gap-0 xl:px-6 xl:py-0"
      >
        {/* Cristal no palco, que é o que pina: na secção os planos mediam o
            percurso inteiro. */}
        <MaterialGround finish="crystal" />
        {/* O título tem lugar próprio no terço de cima, e os cards chegam por
            baixo dele. Estavam todos centrados no mesmo ponto: acumulavam-se
            uns por cima dos outros e tapavam o título por inteiro — o que fica
            é uma pilha de caixas sem se perceber a que capítulo pertencem. */}
        {/* Em telemóvel o título fica preso no topo enquanto os cards passam
            por baixo dele — é o que a referência faz nesta secção. Em desktop
            continua no terço de cima, com os cards em leque por baixo. */}
        <div data-process-heading className="mx-auto w-full max-w-[46rem] shrink-0 px-6 text-center xl:absolute xl:inset-x-0 xl:top-[var(--abertura)]">
          <h2
            id="como-trabalhamos"
            className="t-seccao font-display font-titulo"
          >
            Como <em className="font-medium text-acento">trabalhamos.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-[40ch] text-muted">
            Metade dos sites da tua rua saiu do mesmo template. O teu não sai:
            passa por aqui.
          </p>
        </div>

        {/* `xl:contents` faz o wrapper desaparecer do layout em desktop, e os
            cards voltam a ser filhos do palco — que é o que o `absolute` das
            poses precisa como referência. */}
        <div
          data-fila
          className="flex w-max items-stretch gap-4 px-6 will-change-transform xl:contents"
        >
          {PASSOS.map((p) => (
            <article
              key={p.n}
              data-passo
              /* `data-scroll-item` e não `data-reveal-item`: estes cards não
               entram de uma vez quando a secção aparece — chegam ao longo do
               percurso, e enquanto a secção se aproxima é suposto estarem
               invisíveis. O verificador trata os dois casos de maneira
               diferente; ver `scripts/verificar-scroll.mjs`. */
              data-scroll-item
              /* A pose final entra por custom properties e o `transform` lê-as:
               é a mesma fonte que o GSAP usa, sem duplicar números no markup.
               Enquanto o GSAP não escreve o seu `transform` inline — antes da
               hidratação, sem JavaScript, ou com `prefers-reduced-motion` — é
               esta regra que põe o leque de pé. Assim que ele escreve, o inline
               ganha e esta fica em segundo plano, que é a ordem certa. */
              style={
                {
                  "--pousa-x": `${p.pousa.x}vw`,
                  "--pousa-y": `${p.pousa.y}svh`,
                  "--pousa-r": `${p.pousa.r}deg`,
                } as React.CSSProperties
              }
              /* A coreografia escreve o `transform` no `article`; a superfície
                 de material vai por dentro e inclina só a face dela — são dois
                 donos, dois elementos. Alumínio escovado: anodizado escuro no
                 tema escuro, prata no claro (docs/10). Em tablet a largura fica em 24rem: com 78vw um card
                 chegava aos 800px. */
              className="w-[min(78vw,24rem)] shrink-0 xl:absolute xl:w-[min(20rem,22vw)] xl:[transform:translate(var(--pousa-x),var(--pousa-y))_rotate(var(--pousa-r))]"
            >
              <MaterialSurface finish="aluminio" padding="none">
                <div data-passo-conteudo className="flex min-h-[22rem] flex-col p-6 xl:p-7">
                  <span className="text-sm tabular-nums text-acento">{p.n}</span>
                  <h3 className="t-cartao mb-3 mt-7 font-display font-titulo">
                    {p.t}
                  </h3>
                  <p className="text-[0.9375rem] leading-relaxed text-muted">
                    {p.d}
                  </p>
                  <p className="mt-auto grid gap-1 pt-7">
                    <span className="text-sm text-muted">O que levamos daqui</span>
                    <strong className="font-semibold">{p.entrega}</strong>
                  </p>
                </div>
              </MaterialSurface>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
