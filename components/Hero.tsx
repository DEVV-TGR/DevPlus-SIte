"use client";
/** docs: docs/04-componentes-e-padroes.md — o motivo de fundo é o "+" (ver docs/03). */

import { Fragment, useRef } from "react";
import { gsap, useGSAP, MOVIMENTO } from "@/lib/motion";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/Logo";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const words: { t: string; accent?: boolean }[] = [
  { t: "Web" },
  { t: "design" },
  { t: "que" },
  { t: "soma", accent: true },
  { t: "ao" },
  { t: "teu" },
  { t: "negócio." },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  /*
    A entrada da página é o único sítio do site onde o movimento se pode
    demorar: quase um segundo por elemento, contra os 475 ms de uma secção que
    entra no scroll. Só acontece uma vez, à chegada, e é ela que dá o tom.

    A orquestração é em três tempos, e não um `stagger` só: o distintivo abre,
    o título entra palavra a palavra com um intervalo curto — sete palavras a
    150 ms cada seriam mais de um segundo só no `<h1>` — e o texto e os botões
    fecham no ritmo normal dos irmãos.
  */
  useGSAP(
    () => {
      const raiz = ref.current;
      if (!raiz) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          anima: "(prefers-reduced-motion: no-preference)",
          reduz: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const itens = raiz.querySelectorAll("[data-reveal-item]");

          /* `opacity: 1` à mão: um `clearProps: "all"` devolvia estes
             elementos à regra de CSS que os esconde antes de o GSAP lhes
             pegar, e o hero ficava em branco para quem pediu menos movimento. */
          if (!ctx.conditions?.anima) {
            gsap.set(itens, { opacity: 1, y: 0, clearProps: "transform" });
            return;
          }

          const de = { opacity: 0, y: MOVIMENTO.y };
          const para = {
            opacity: 1,
            y: 0,
            duration: MOVIMENTO.hero,
            ease: MOVIMENTO.ease,
            clearProps: "transform",
          };

          const tl = gsap.timeline();
          tl.fromTo(raiz.querySelectorAll('[data-hero="abre"]'), de, para, 0)
            .fromTo(
              raiz.querySelectorAll('[data-hero="palavra"]'),
              de,
              { ...para, stagger: 0.06 },
              MOVIMENTO.stagger,
            )
            .fromTo(
              raiz.querySelectorAll('[data-hero="fecha"]'),
              de,
              { ...para, stagger: MOVIMENTO.stagger },
              MOVIMENTO.stagger * 3,
            );
        },
      );

      /* Sem `mm.revert()`: quem limpa é o `useGSAP`. Ver a nota no `Reveal`. */
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* O "+" em contorno, a rodar devagar — o logo no fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[12%] -top-[18%] z-0 w-[78%] max-w-[42rem] text-primary opacity-[0.06] sm:opacity-[0.07]"
      >
        <Logo
          outline
          className="h-auto w-full animate-spin-slow [animation-duration:120s]"
        />
      </div>

      <Container className="relative z-10 pb-14 pt-14 sm:pb-24 sm:pt-24">
        <div>
          <div data-reveal-item data-hero="abre">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Disponível para novos projetos
            </span>
          </div>

          {/* O espaço entre palavras é um espaço a sério, não `margin`. Cada
              palavra anima em separado, e por isso é um `<span>` — mas com a
              margem a fazer de espaço o HTML servido não tinha separador
              nenhum, e o título chegava ao Google e aos leitores de ecrã como
              "Webdesignquesomaaoteunegócio.". O `{" "}` entre os spans custa
              nada e devolve o título a quem o lê sem o ver. */}
          <h1 className="mt-5 max-w-[20ch] font-display font-semibold leading-[1.02] tracking-tight text-[clamp(2.25rem,7vw,5.5rem)]">
            {words.map((w, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                <span
                  data-reveal-item
                  data-hero="palavra"
                  className={cn("inline-block", w.accent && "text-primary")}
                >
                  {w.t}
                </span>
              </Fragment>
            ))}
          </h1>

          <p
            data-reveal-item
            data-hero="fecha"
            className="mt-6 max-w-xl text-base text-muted sm:text-lg"
          >
            Já tiveste de ligar a alguém só para mudar um preço no site?
            Connosco não. Somos a {site.name}: fazemos o teu site à medida e
            entregamos-te o comando — mudas o que quiseres, quando quiseres, do
            telemóvel.
          </p>

          <div
            data-reveal-item
            data-hero="fecha"
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button
              href="/portfolio"
              variant="primary"
              className="w-full sm:w-auto"
            >
              Ver portfólio
            </Button>
            <Button
              href="/contacto"
              variant="outline"
              className="w-full sm:w-auto"
            >
              Conta-nos a tua ideia
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
