"use client";
/** docs: docs/04-componentes-e-padroes.md · docs/06-projetos.md */

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion";
import { Button } from "@/components/ui/Button";
import { projects } from "@/lib/projects";

/**
 * O trabalho feito, numa fila que atravessa o ecrã enquanto a secção fica
 * presa.
 *
 * **Movimento lateral lê-se como alcance; vertical lê-se como argumento.**
 * Aqui não se argumenta, mostra-se — por isso a fila anda de lado e a página
 * pára. O percurso é longo de propósito: passa pelos cinco projetos sem
 * pressa, e é a única secção da página que retém o visitante.
 *
 * As legendas são **facto, não argumentário**: nome, o que é, ano. Um card de
 * portfólio que se vende a si próprio deixa de ser prova.
 */
export function ProvaCarrossel() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const raiz = ref.current;
      if (!raiz) return;
      const palco = raiz.querySelector<HTMLElement>("[data-palco]");
      const fila = raiz.querySelector<HTMLElement>("[data-fila]");
      if (!palco || !fila) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        /* Sem pin nem deslocação: a fila passa a rolar na horizontal com o
           dedo ou o teclado, e continua a dar acesso aos cinco projetos. */
        fila.classList.add("overflow-x-auto", "snap-x", "snap-mandatory");
        return;
      }

      const percurso = () => Math.max(0, fila.scrollWidth - window.innerWidth);

      const st = ScrollTrigger.create({
        trigger: raiz,
        start: "top top",
        end: () => `+=${percurso() + window.innerHeight}`,
        pin: palco,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) =>
          gsap.set(fila, { x: -self.progress * percurso(), force3D: true }),
      });

      return () => st.kill();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative bg-paper text-paper-ink" aria-labelledby="prova">
      <div data-palco className="relative h-[100svh] overflow-hidden">
        <div
          data-fila
          className="flex h-full items-center gap-[clamp(1.25rem,3vw,2.5rem)] px-[clamp(1.25rem,5vw,5.5rem)] will-change-transform"
        >
          <div className="shrink-0 basis-[min(26rem,58vw)]">
            <p className="text-xs uppercase tracking-[0.18em] text-paper-muted">
              Feito
            </p>
            <h2
              id="prova"
              className="mt-2 font-display text-[clamp(2rem,4.5vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.04em]"
            >
              Cinco que já estão no ar.
            </h2>
            <div className="mt-6">
              <Button href="/portfolio" variant="primary">
                Ver todos os projetos
              </Button>
            </div>
          </div>

          {projects.map((p, i) => (
            <article key={p.slug} className="shrink-0 basis-[min(27rem,72vw)]">
              <Link href={`/portfolio/${p.slug}`} className="group block">
                <div className="overflow-hidden rounded-2xl bg-paper-muted/20 shadow-[0_24px_50px_-28px_rgb(34_28_23/0.55)] transition-transform duration-500 group-hover:-translate-y-1">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.imageAlt ?? `Página inicial de ${p.name}.`}
                      width={1200}
                      height={750}
                      loading="lazy"
                      className="block h-auto w-full"
                    />
                  ) : (
                    <div className="aspect-[8/5] bg-paper-muted/25" />
                  )}
                </div>
                <div className="mt-4 grid gap-0.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] tabular-nums text-paper-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-lg font-semibold tracking-tight">
                    {p.name}
                  </h3>
                  <p className="text-sm text-paper-muted">
                    {p.category}. {p.year}.
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
