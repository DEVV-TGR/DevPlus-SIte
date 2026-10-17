"use client";
/** docs: docs/04-componentes-e-padroes.md · docs/09-direcao-atelier.md — atelier digital, profundidade por camadas. */
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP, MOVIMENTO } from "@/lib/motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/Logo";

/**
 * A capa. Três linhas, "soma" em itálico, e a escultura do atelier ao lado.
 *
 * A escultura vive em três invólucros, e cada um tem um só dono do
 * `transform`: `data-hero-depth` é do scroll, `data-hero-object` é da entrada e
 * da inclinação ao ponteiro (o GSAP compõe `rotate`/`scale` com
 * `rotationX`/`rotationY` no mesmo elemento), e o disco é do scroll na
 * direção oposta. Juntos dão profundidade sem duas animações a escreverem a
 * mesma propriedade.
 *
 * O texto está visível por omissão: a entrada só desloca, não esconde, e sem
 * movimento não há nada à espera.
 */
export function HeroHome() {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-hero-line]", {
          y: 38,
          rotate: 1.5,
          duration: MOVIMENTO.hero,
          stagger: MOVIMENTO.staggerHero,
          ease: MOVIMENTO.ease,
          clearProps: "transform",
        });
        gsap.from("[data-hero-object]", {
          scale: 0.88,
          rotate: -7,
          duration: MOVIMENTO.hero,
          ease: MOVIMENTO.ease,
        });
        gsap
          .timeline({
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          })
          .to(
            "[data-hero-depth]",
            { yPercent: 16, rotate: 6, scale: 1.08, ease: "none" },
            0,
          )
          .to("[data-hero-disc]", { yPercent: -18, rotate: -12, ease: "none" }, 0);
      });
      /* A inclinação só com um ponteiro fino: num ecrã tátil não há
         `pointermove` sem dedo em cima, e o objeto ficava torto onde o toque
         o deixou. */
      mm.add(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const object = root.querySelector<HTMLElement>("[data-hero-object]");
          if (!object) return;
          const tilt = { duration: MOVIMENTO.hero, ease: MOVIMENTO.ease };
          const x = gsap.quickTo(object, "rotationY", tilt);
          const y = gsap.quickTo(object, "rotationX", tilt);
          const move = (event: PointerEvent) => {
            const r = root.getBoundingClientRect();
            x(((event.clientX - r.left) / r.width - 0.5) * 12);
            y(-((event.clientY - r.top) / r.height - 0.5) * 8);
          };
          const reset = () => {
            x(0);
            y(0);
          };
          root.addEventListener("pointermove", move);
          root.addEventListener("pointerleave", reset);
          return () => {
            root.removeEventListener("pointermove", move);
            root.removeEventListener("pointerleave", reset);
          };
        },
      );
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className="home-hero relative isolate overflow-hidden"
      aria-labelledby="home-title"
    >
      <Container>
        <div className="home-hero-grid">
          <div className="relative z-[2]">
            <h1 id="home-title" className="home-title">
              <span data-hero-line>Web design</span>
              <span data-hero-line>
                que <em>soma</em>
              </span>
              <span data-hero-line>ao teu negócio.</span>
            </h1>
            <p className="home-hero-intro">
              Da primeira ideia ao site no ar. Criamos sites, menus digitais e
              ferramentas que te dão mais tempo para o teu negócio.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="#trabalho">
                Explorar o trabalho <span aria-hidden>↗</span>
              </Button>
              <Button href="/contacto" variant="outline">
                Falar connosco
              </Button>
            </div>
          </div>
          <div className="home-hero-art" aria-hidden>
            <div data-hero-disc className="home-hero-disc">
              <Logo className="home-hero-disc-mark" />
            </div>
            <div data-hero-depth className="relative z-[1]">
              <div data-hero-object className="[transform-style:preserve-3d]">
                <Image
                  src="/hero/atelier-digital-v2.webp"
                  alt=""
                  width={1200}
                  height={1200}
                  /* Os mesmos tetos do CSS: 620px ou 46vw em desktop, metade
                     da grelha em tablet, 390px ou 85vw no telemóvel. */
                  sizes="(min-width: 1348px) 620px, (min-width: 1024px) 46vw, (min-width: 768px) 50vw, (min-width: 459px) 390px, 85vw"
                  preload
                  className="block h-auto w-full"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="home-hero-bottom">
          <p>
            Websites <span aria-hidden>/</span> Lojas online{" "}
            <span aria-hidden>/</span> Menus digitais
          </p>
          <Link
            href="#trabalho"
            className="inline-flex min-h-11 items-center gap-3"
          >
            Continua a explorar <span aria-hidden>↓</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
