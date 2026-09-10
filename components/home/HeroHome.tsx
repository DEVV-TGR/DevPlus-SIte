"use client";
/** docs: docs/04-componentes-e-padroes.md — o hero da página inicial. */

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MOVIMENTO } from "@/lib/motion";
import { Button } from "@/components/ui/Button";

/**
 * A capa. É o pico da página — decisão do Gonçalo, setembro de 2026 — e por
 * isso leva o maior espaço de scroll e a única ilustração grande.
 *
 * **O título parte-se pelas duas margens** e a figura ocupa o vão entre elas.
 * As duas metades são posicionadas em absoluto e não em linhas de grelha: com
 * grelha, a segunda caía na faixa do meio, aterrava por cima da ilustração e
 * por cima da primeira, e lia-se "tetunegócio".
 *
 * O `h1` contém a frase **inteira**. As duas metades são `span` dentro dele,
 * porque um título partido em dois elementos chega ao Google e a um leitor de
 * ecrã como duas frases soltas.
 */
export function HeroHome() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const raiz = ref.current;
      if (!raiz) return;

      const itens = raiz.querySelectorAll("[data-reveal-item]");
      const figura = raiz.querySelector("[data-figura]");

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(itens, { opacity: 1, y: 0, clearProps: "transform" });
        return;
      }

      gsap.timeline().fromTo(
        itens,
        { opacity: 0, y: MOVIMENTO.y },
        {
          opacity: 1,
          y: 0,
          duration: MOVIMENTO.hero,
          ease: MOVIMENTO.ease,
          stagger: MOVIMENTO.stagger,
          clearProps: "transform",
        },
      );

      /* A figura afunda mais devagar que o texto. Sem esta diferença de
         velocidade a capa move-se como uma folha só, e a profundidade que a
         composição promete não chega a existir. */
      if (figura) {
        ScrollTrigger.create({
          trigger: raiz,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
          onUpdate: (self) =>
            gsap.set(figura, { y: self.progress * 90, force3D: true }),
        });
      }
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-bg"
    >
      {/* A figura vive à esquerda e não ao centro: a segunda metade do título
          vem da direita, e ao centro o creme da ilustração cruzava o creme do
          texto — medido, 1.5:1 de contraste. */}
      <div
        data-figura
        aria-hidden
        className="pointer-events-none absolute inset-0 grid place-items-center justify-items-start py-[clamp(6rem,16vh,10rem)] pl-[clamp(2rem,12vw,12rem)]"
      >
        <Image
          src="/hero/boneco.webp"
          alt=""
          width={1100}
          height={831}
          priority
          className="h-[min(58%,27rem)] w-auto max-w-[46vw] object-contain"
        />
      </div>

      {/* Scrim nas bordas, transparente no meio: escurece a moldura onde o
          texto vive e deixa a ilustração intacta. Um véu de página inteira
          resolveria o contraste e mataria a figura. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(closest-side at 50% 52%, transparent 30%, color-mix(in oklab, var(--bg) 62%, transparent) 60%, var(--bg) 100%)",
        }}
      />

      <h1 className="sr-only">
        Web design que soma ao teu negócio.
      </h1>

      <div aria-hidden className="absolute inset-0 z-[2]">
        <span
          data-reveal-item
          className="absolute left-[var(--gut)] top-[clamp(4.5rem,12vh,8rem)] block max-w-[8ch] font-display text-[clamp(2.1rem,7vw,6.4rem)] font-extrabold leading-[0.9] tracking-[-0.05em] text-ink [--gut:clamp(1.25rem,5vw,5.5rem)]"
        >
          Web design
        </span>
        <span
          data-reveal-item
          className="absolute bottom-[clamp(11rem,30vh,17rem)] right-[var(--gut)] -mr-2 block max-w-[11ch] rounded-l-full py-[0.35em] pl-6 pr-2 text-right font-display text-[clamp(2.1rem,7vw,6.4rem)] font-extrabold leading-[0.9] tracking-[-0.05em] text-ink [--gut:clamp(1.25rem,5vw,5.5rem)]"
          style={{
            background:
              "radial-gradient(115% 130% at 100% 50%, var(--bg) 46%, color-mix(in oklab, var(--bg) 86%, transparent) 70%, transparent 100%)",
          }}
        >
          que <span className="text-primary">soma</span> ao teu negócio.
        </span>
      </div>

      <div className="absolute bottom-[clamp(2rem,6vh,3.5rem)] left-[clamp(1.25rem,5vw,5.5rem)] z-[2] max-w-[32ch]">
        <p data-reveal-item className="text-sm text-muted">
          Estúdio de web design e desenvolvimento. Desenhamos, mostramos, e só
          depois se escreve código.
        </p>
        <div data-reveal-item className="mt-4 flex flex-wrap gap-3">
          <Button href="/portfolio" variant="primary">
            Ver o trabalho
          </Button>
          <Button href="/contacto" variant="outline">
            Falar connosco
          </Button>
        </div>
      </div>
    </section>
  );
}
