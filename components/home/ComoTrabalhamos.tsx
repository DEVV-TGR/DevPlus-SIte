"use client";
/** docs: docs/04-componentes-e-padroes.md */

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MOVIMENTO } from "@/lib/motion";

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
 * properties no `style` de cada card (ver o `md:[transform:…]` lá em baixo),
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
    img: "/ilustra/t1-conversa.webp",
    alt: "Duas pessoas frente a frente com balões de fala e um caderno.",
    pousa: { x: -31, y: 8, r: -5 },
    atira: { x: -78, y: 34, r: -30 },
  },
  {
    n: "02",
    t: "Design",
    d: "Mostramos-te o site desenhado antes de ele existir. Vês, dizes o que mudarias, e só depois se escreve código.",
    img: "/ilustra/t2-design.webp",
    alt: "Uma pessoa a desenhar um layout numa prancha, com régua e esquadro.",
    pousa: { x: -10.5, y: 13, r: 4 },
    atira: { x: -21, y: 95, r: 22 },
  },
  {
    n: "03",
    t: "Construção",
    d: "Abre depressa, funciona bem no telemóvel e aparece nas pesquisas. Não são extras que se pedem, é como fazemos.",
    img: "/ilustra/t3-construcao.webp",
    alt: "Blocos geométricos empilhados a formar uma janela de browser.",
    pousa: { x: 10.5, y: 8, r: -3 },
    atira: { x: 21, y: 95, r: -20 },
  },
  {
    n: "04",
    t: "No ar",
    d: "Pomos o site online, acompanhamos os primeiros dias e afinamos o que for preciso. E ficamos cá para o que vier a seguir.",
    img: "/ilustra/t4-no-ar.webp",
    alt: "Uma janela de browser a subir com um foguete e linhas de velocidade.",
    pousa: { x: 31, y: 13, r: 5 },
    atira: { x: 78, y: 34, r: 30 },
  },
];

export function ComoTrabalhamos() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const raiz = ref.current;
      if (!raiz) return;
      const palco = raiz.querySelector<HTMLElement>("[data-palco]");
      const cards = raiz.querySelectorAll<HTMLElement>("[data-passo]");
      if (!palco) return;

      /* As poses finais estão no CSS (o `md:[transform:…]` do card), por isso
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
      if (window.matchMedia("(max-width: 767px)").matches) {
        const fila = raiz.querySelector<HTMLElement>("[data-fila]");
        if (!fila) return;
        gsap.set(cards, { opacity: 1 });

        const percurso = () => Math.max(0, fila.scrollWidth - window.innerWidth);
        const st = ScrollTrigger.create({
          trigger: raiz,
          start: "top top",
          end: () => `+=${percurso() + window.innerHeight * 0.25}`,
          pin: palco,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) =>
            gsap.set(fila, { x: -self.progress * percurso(), force3D: true }),
        });
        return () => st.kill();
      }

      gsap.set(cards, { opacity: 0 });

      /* As poses vêm em `vw`/`svh` e o GSAP escreve px. São funções para o
         `invalidateOnRefresh` as remedir a cada `refresh` — de outro modo o
         leque ficava com as medidas da janela que existia ao carregar. */
      const vw = (n: number) => (window.innerWidth * n) / 100;
      const svh = (n: number) => (palco.clientHeight * n) / 100;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: raiz,
          start: "top top",
          end: "+=180%",
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
         destino e volta — é o encaixe que faz a leitura de carta a assentar —
         e a opacidade leva a curva normal, porque uma opacidade com overshoot
         passa de 1 e volta, o que é um `flash` e não um gesto. A escala
         assenta antes da posição, como em todo o site. */
      cards.forEach((c, i) => {
        const { pousa, atira } = PASSOS[i];
        tl.fromTo(
          c,
          { opacity: 0, scale: MOVIMENTO.escalaDe },
          {
            opacity: 1,
            scale: 1,
            duration: 0.36,
            ease: MOVIMENTO.ease,
          },
          i * 0.7,
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
            duration: 0.6,
            ease: MOVIMENTO.easeCarta,
          },
          i * 0.7,
        );
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className="relative bg-bg-deep"
      aria-labelledby="como-trabalhamos"
    >
      <div
        data-palco
        /* `justify-start` e não `center`: o palco corta nos dois lados
           (`overflow-hidden`), e com o conteúdo centrado era o topo do título
           que desaparecia. Em telemóvel o título encosta ao cimo e a fila
           ocupa o que sobra. */
        className="relative flex min-h-[100svh] flex-col justify-start gap-6 overflow-hidden pb-10 pt-24 md:grid md:place-items-center md:gap-0 md:px-6 md:py-0"
      >
        {/* O título tem lugar próprio no terço de cima, e os cards chegam por
            baixo dele. Estavam todos centrados no mesmo ponto: acumulavam-se
            uns por cima dos outros e tapavam o título por inteiro — o que fica
            é uma pilha de caixas sem se perceber a que capítulo pertencem. */}
        {/* Em telemóvel o título fica preso no topo enquanto os cards passam
            por baixo dele — é o que a referência faz nesta secção. Em desktop
            continua no terço de cima, com os cards em leque por baixo. */}
        <div className="mx-auto w-full max-w-[46rem] shrink-0 px-6 text-center md:absolute md:inset-x-0 md:top-[10svh]">
          <h2
            id="como-trabalhamos"
            className="t-seccao font-display font-extrabold"
          >
            Como trabalhamos.
          </h2>
          <p className="mx-auto mt-4 max-w-[40ch] text-muted">
            Metade dos sites da tua rua saiu do mesmo template. O teu não sai:
            passa por aqui.
          </p>
        </div>

        {/* `md:contents` faz o wrapper desaparecer do layout em desktop, e os
            cards voltam a ser filhos do palco — que é o que o `absolute` das
            poses precisa como referência. */}
        <div
          data-fila
          className="flex w-max items-stretch gap-4 px-6 will-change-transform md:contents"
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
            className="grid w-[78vw] shrink-0 gap-2 rounded-2xl border border-border bg-surface p-5 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.7)] md:absolute md:w-[min(20rem,74vw)] md:[transform:translate(var(--pousa-x),var(--pousa-y))_rotate(var(--pousa-r))]"
          >
            <span className="justify-self-start rounded-full bg-primary px-3 py-0.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary-ink">
              Processo
            </span>
            <span className="font-display text-[clamp(2rem,4vw,3rem)] font-extrabold leading-none tabular-nums text-primary">
              {p.n}
            </span>
            <h3 className="font-display text-xl font-semibold tracking-tight">
              {p.t}
            </h3>
            <p className="text-sm text-muted">{p.d}</p>
            {/* A figura é posicionada contra esta caixa, e não dimensionada em
                percentagem dentro dela: com `h-[90%]` numa linha de grelha
                automática a altura realimentava-se — a linha crescia para caber
                a imagem, a imagem crescia para 90% da linha, e a figura acabava
                ao dobro da caixa, a sair pelas bordas do card. O `overflow`
                fechado é o cinto; o `object-contain` garante que assenta lá
                dentro inteira. */}
            <div className="relative mt-1 h-32 overflow-hidden rounded-xl bg-ink/5 max-md:h-24">
              <Image
                src={p.img}
                alt={p.alt}
                width={760}
                height={760}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-contain p-1"
              />
            </div>
          </article>
        ))}
        </div>
      </div>
    </section>
  );
}
