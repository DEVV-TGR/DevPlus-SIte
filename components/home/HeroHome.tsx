"use client";
/** docs: docs/04-componentes-e-padroes.md — a oficina digital. */
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP, MOVIMENTO } from "@/lib/motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/Logo";

export function HeroHome() {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-hero-copy]",
          { y: 24 },
          {
            y: 0,
            duration: MOVIMENTO.hero,
            ease: MOVIMENTO.ease,
            stagger: MOVIMENTO.stagger,
            clearProps: "transform",
          },
        );
        gsap.fromTo(
          "[data-oficina]",
          { rotate: -4, scale: 0.94 },
          {
            rotate: 0,
            scale: 1,
            duration: MOVIMENTO.hero,
            ease: MOVIMENTO.ease,
          },
        );
        gsap.to("[data-oficina]", {
          y: 55,
          rotate: 3,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        gsap.to("[data-modulo]", {
          y: -35,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });
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
          <div className="relative z-10">
            <p
              data-hero-copy
              className="mb-6 flex items-center gap-3 text-sm text-muted"
            >
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
              Design com intenção. Código à medida.
            </p>
            <h1 id="home-title" data-hero-copy className="home-title">
              Web design
              <br />
              que <span className="text-primary">soma</span>
              <br />
              ao teu negócio.
            </h1>
            <p
              data-hero-copy
              className="mt-6 max-w-[37ch] text-base leading-relaxed text-muted sm:text-lg"
            >
              Da primeira ideia ao site no ar. Criamos sites, menus digitais e
              ferramentas que te dão mais tempo para o teu negócio.
            </p>
            <div data-hero-copy className="mt-8 flex flex-wrap gap-3">
              <Button href="/portfolio" className="group">
                Ver o trabalho{" "}
                <span
                  aria-hidden
                  className="transition-transform motion-safe:group-hover:translate-x-1"
                >
                  ↗
                </span>
              </Button>
              <Button href="/contacto" variant="outline">
                Falar connosco
              </Button>
            </div>
          </div>
          <div className="home-workshop relative" aria-hidden>
            <div className="workshop-orbit" />
            <div className="workshop-orbit workshop-orbit-inner" />
            <span className="workshop-caption">
              IDEIA → DESIGN → CÓDIGO → NO AR
            </span>
            <div data-oficina className="relative z-10">
              <Image
                src="/hero/oficina-digital.webp"
                alt=""
                width={1200}
                height={800}
                sizes="(min-width: 1024px) 55vw, (min-width: 768px) 50vw, 100vw"
                preload
                className="h-auto w-full"
              />
            </div>
            <div data-modulo className="workshop-label">
              <Logo className="h-6 w-6 text-primary" />
              <span>
                O teu negócio.
                <br />
                <strong>Com mais possibilidades.</strong>
              </span>
            </div>
          </div>
        </div>
        <div className="home-hero-bottom">
          <p>
            Websites <span aria-hidden> / </span> Lojas online{" "}
            <span aria-hidden> / </span> Menus digitais
          </p>
          <Link
            href="#trabalho"
            className="inline-flex min-h-11 items-center gap-3"
          >
            Explora o que fazemos <span aria-hidden>↓</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
