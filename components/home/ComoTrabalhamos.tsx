"use client";
/** docs: docs/04-componentes-e-padroes.md */

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, MOVIMENTO } from "@/lib/motion";

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
const PASSOS = [
  {
    n: "01",
    t: "Conversa",
    d: "Sentamo-nos contigo a perceber o negócio, quem são os teus clientes e o que queres ganhar com isto. Sem isso, o resto é decoração.",
    img: "/ilustra/t1-conversa.webp",
    alt: "Duas pessoas frente a frente com balões de fala e um caderno.",
    pose: "translate-x-[-31vw] translate-y-[8svh] -rotate-[5deg]",
    poseSm: "max-md:translate-x-[-13vw] max-md:translate-y-[0svh] max-md:-rotate-[5deg]",
  },
  {
    n: "02",
    t: "Design",
    d: "Mostramos-te o site desenhado antes de ele existir. Vês, dizes o que mudarias, e só depois se escreve código.",
    img: "/ilustra/t2-design.webp",
    alt: "Uma pessoa a desenhar um layout numa prancha, com régua e esquadro.",
    pose: "translate-x-[-10.5vw] translate-y-[13svh] rotate-[4deg]",
    poseSm: "max-md:translate-x-[13vw] max-md:translate-y-[6svh] max-md:rotate-[4deg]",
  },
  {
    n: "03",
    t: "Construção",
    d: "Abre depressa, funciona bem no telemóvel e aparece nas pesquisas. Não são extras que se pedem, é como fazemos.",
    img: "/ilustra/t3-construcao.webp",
    alt: "Blocos geométricos empilhados a formar uma janela de browser.",
    pose: "translate-x-[10.5vw] translate-y-[8svh] -rotate-[3deg]",
    poseSm: "max-md:translate-x-[-13vw] max-md:translate-y-[14svh] max-md:-rotate-[3deg]",
  },
  {
    n: "04",
    t: "No ar",
    d: "Pomos o site online, acompanhamos os primeiros dias e afinamos o que for preciso. E ficamos cá para o que vier a seguir.",
    img: "/ilustra/t4-no-ar.webp",
    alt: "Uma janela de browser a subir com um foguete e linhas de velocidade.",
    pose: "translate-x-[31vw] translate-y-[13svh] rotate-[5deg]",
    poseSm: "max-md:translate-x-[13vw] max-md:translate-y-[22svh] max-md:rotate-[5deg]",
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

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(cards, { opacity: 1, scale: 1 });
        return;
      }

      gsap.set(cards, { opacity: 0, scale: 0.92 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: raiz,
          start: "top top",
          end: "+=180%",
          pin: palco,
          scrub: 0.6,
        },
      });

      /* Cada card ocupa uma fatia do percurso e **fica** — o `stagger` não
         serve aqui, porque queremos que se acumulem, não que se sucedam. */
      cards.forEach((c, i) => {
        tl.to(
          c,
          { opacity: 1, scale: 1, duration: 0.6, ease: MOVIMENTO.ease },
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
        className="relative grid min-h-[100svh] place-items-center overflow-hidden px-6"
      >
        {/* O título tem lugar próprio no terço de cima, e os cards chegam por
            baixo dele. Estavam todos centrados no mesmo ponto: acumulavam-se
            uns por cima dos outros e tapavam o título por inteiro — o que fica
            é uma pilha de caixas sem se perceber a que capítulo pertencem. */}
        <div className="absolute inset-x-0 top-[10svh] mx-auto max-w-[46rem] px-6 text-center">
          <h2
            id="como-trabalhamos"
            className="font-display text-[clamp(2.2rem,5.6vw,4.6rem)] font-extrabold leading-[0.95] tracking-[-0.045em]"
          >
            Como trabalhamos.
          </h2>
          <p className="mx-auto mt-4 max-w-[40ch] text-muted">
            Metade dos sites da tua rua saiu do mesmo template. O teu não sai:
            passa por aqui.
          </p>
        </div>

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
            className={`absolute grid w-[min(20rem,74vw)] gap-2 rounded-2xl border border-border bg-surface p-5 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.7)] ${p.pose} ${p.poseSm}`}
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
    </section>
  );
}
