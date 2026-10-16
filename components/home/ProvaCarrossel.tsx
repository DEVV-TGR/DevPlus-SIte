"use client";
/** docs: docs/04-componentes-e-padroes.md · docs/06-projetos.md */
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { homeProjects } from "@/lib/projects";
import {
  gsap,
  ScrollTrigger,
  useGSAP,
  comPausa,
  MOVIMENTO,
} from "@/lib/motion";

export function ProvaCarrossel() {
  const lenis = useLenis();
  const track = useRef<HTMLUListElement>(null);
  const pin = useRef<ReturnType<typeof ScrollTrigger.create> | null>(null);
  useGSAP(
    () => {
      const el = track.current;
      const root = el?.closest("section");
      const stage = root?.querySelector<HTMLElement>("[data-gallery-stage]");
      if (!el || !root || !stage) return;
      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const distance = () => Math.max(0, el.scrollWidth - el.clientWidth);
          el.style.scrollSnapType = "none";
          const st = ScrollTrigger.create({
            trigger: root,
            start: "top top",
            end: () => `+=${comPausa(distance()).total}`,
            pin: stage,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const d = distance();
              el.scrollLeft = comPausa(d).progresso(self.progress) * d;
            },
          });
          pin.current = st;
          return () => {
            pin.current = null;
            st.kill();
            el.style.removeProperty("scroll-snap-type");
          };
        },
      );
      return () => mm.revert();
    },
    { scope: track },
  );
  const [active, setActive] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      const cards = Array.from(el.children) as HTMLElement[];
      const left = el.getBoundingClientRect().left;
      const index = cards.reduce(
        (best, card, i) =>
          Math.abs(card.getBoundingClientRect().left - left) <
          Math.abs(cards[best].getBoundingClientRect().left - left)
            ? i
            : best,
        0,
      );
      setActive(index);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 3);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);
  const go = (index: number) => {
    const el = track.current;
    const card = el?.children[
      Math.max(0, Math.min(homeProjects.length - 1, index))
    ] as HTMLElement | undefined;
    if (!el || !card) return;
    const position =
      card.getBoundingClientRect().left -
      el.getBoundingClientRect().left +
      el.scrollLeft;
    const st = pin.current;
    if (st) {
      const distance = el.scrollWidth - el.clientWidth;
      const pause = comPausa(distance).fracao;
      const progress =
        pause +
        (Math.min(position, distance) / Math.max(1, distance)) *
          (1 - 2 * pause);
      const target = st.start + progress * (st.end - st.start);
      if (lenis) lenis.scrollTo(target, { duration: MOVIMENTO.hero });
      else window.scrollTo({ top: target, behavior: "smooth" });
      return;
    }
    el.scrollTo({
      left: position,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  return (
    <Section
      id="trabalho"
      top={false}
      bottom={false}
      className="relative bg-paper text-paper-ink"
    >
      <div data-gallery-stage className="gallery-stage">
        <Container>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-4 text-sm text-paper-muted">
                Negócios diferentes. A mesma atenção.
              </p>
              <h2 className="home-heading max-w-[16ch]">
                Trabalho que
                <br />
                fala por nós<span className="text-paper-muted">.</span>
              </h2>
            </div>
            <Link
              href="/portfolio"
              className="inline-flex min-h-11 items-center gap-4 border-b border-paper-muted text-sm font-semibold"
            >
              Todo o portfólio <span aria-hidden>↗</span>
            </Link>
          </div>
          <ul
            id="home-projects"
            ref={track}
            aria-label="Projetos selecionados"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                go(active + (event.key === "ArrowRight" ? 1 : -1));
              }
              if (event.key === "Home" || event.key === "End") {
                event.preventDefault();
                go(event.key === "Home" ? 0 : homeProjects.length - 1);
              }
            }}
            className="project-track"
          >
            {homeProjects.map((p, i) => (
              <li key={p.slug} className="project-slide">
                <Link
                  href={`/portfolio/${p.slug}`}
                  className="group block rounded-xl"
                >
                  <div className="project-cover">
                    {p.image && (
                      <Image
                        src={p.image}
                        alt={p.imageAlt ?? `Página inicial de ${p.name}`}
                        fill
                        sizes="(min-width: 768px) 58vw, 85vw"
                        className="object-cover object-top transition-transform duration-500 motion-safe:group-hover:scale-[1.025]"
                      />
                    )}
                    <span className="project-status">
                      {p.status === "em-curso"
                        ? "Em desenvolvimento"
                        : "Concluído"}
                    </span>
                    <span className="project-open" aria-hidden>
                      ↗
                    </span>
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-paper-muted">
                        {p.category} · {p.year}
                      </p>
                      <h3 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                        {p.name}
                      </h3>
                    </div>
                    <span className="pt-1 text-sm tabular-nums text-paper-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-3 max-w-[54ch] text-sm leading-relaxed text-paper-muted">
                    {p.summary}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center gap-5">
            <span
              className="min-w-12 text-sm tabular-nums"
              aria-live="polite"
              aria-atomic="true"
            >
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(homeProjects.length).padStart(2, "0")}
            </span>
            <div className="h-px flex-1 bg-paper-muted/25" aria-hidden>
              <div
                className="h-px bg-paper-ink transition-[width] duration-300"
                style={{
                  width: `${((atEnd ? homeProjects.length : active + 1) / homeProjects.length) * 100}%`,
                }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Projeto anterior"
                aria-controls="home-projects"
                disabled={active === 0}
                onClick={() => go(active - 1)}
                className="gallery-arrow"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Projeto seguinte"
                aria-controls="home-projects"
                disabled={atEnd}
                onClick={() => go(active + 1)}
                className="gallery-arrow"
              >
                →
              </button>
            </div>
          </div>
        </Container>
      </div>
    </Section>
  );
}
