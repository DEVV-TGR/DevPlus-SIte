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
      const movel = () => window.matchMedia("(max-width: 767px)").matches;

      const st = ScrollTrigger.create({
        trigger: raiz,
        start: "top top",
        /* A folga no fim era um ecrã inteiro: em desktop é a pausa depois do
           último projeto, no telemóvel eram 844px de scroll com a fila já
           parada. Lá basta 40% — a secção passa de 4 ecrãs para 3. */
        end: () => `+=${percurso() + window.innerHeight * (movel() ? 0.15 : 1)}`,
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
        {/* A fila é sempre **uma linha**: é o `x` dela que o scroll conduz, e
            uma coluna não tem para onde andar. O que muda em telemóvel é a
            medida — o cabeçalho passa a ocupar um ecrã quase inteiro, e cada
            capa outro, em vez de dividirem a largura entre si. */}
        <div
          data-fila
          className="flex h-full items-center gap-4 px-6 will-change-transform md:gap-[clamp(1.25rem,3vw,2.5rem)] md:px-[clamp(1.25rem,5vw,5.5rem)]"
        >
          <div className="shrink-0 basis-[82vw] md:basis-[min(26rem,58vw)]">
            <p className="text-xs uppercase tracking-[0.18em] text-paper-muted">
              Feito
            </p>
            <h2
              id="prova"
              className="t-seccao mt-2 font-display font-semibold"
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
            <article key={p.slug} className="shrink-0 basis-[82vw] md:basis-[min(27rem,72vw)]">
              <Link href={`/portfolio/${p.slug}`} className="group block">
                {/* Em telemóvel a moldura é **retrato**. As capas são
                    paisagem, e a 82vw davam cards de 200px de alto num ecrã de
                    844: metade da secção era vazio. Com `4/5` e `object-cover`
                    mostra-se o topo de cada site — que é o hero, a parte por
                    que se reconhece — e o card ocupa o ecrã como na referência. */}
                <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-paper-muted/20 shadow-[0_24px_50px_-28px_rgb(34_28_23/0.55)] transition-transform duration-500 group-hover:-translate-y-1 md:aspect-auto">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.imageAlt ?? `Página inicial de ${p.name}.`}
                      width={1200}
                      height={750}
                      loading="lazy"
                      className="block h-full w-full object-cover object-top md:h-auto"
                    />
                  ) : (
                    /* Sem capa não fica um retângulo cinzento a ocupar meio
                       ecrã: fica o nome, como no `PortfolioIndice`. A lacuna
                       está registada no `docs/06` e não se disfarça com a capa
                       de outro projeto. */
                    <div className="grid h-full place-items-center bg-gradient-to-br from-primary/20 to-paper-muted/25 px-6 text-center md:aspect-[8/5]">
                      <span className="font-display text-xl font-extrabold tracking-[-0.03em] text-paper-ink">
                        {p.name}
                      </span>
                    </div>
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
