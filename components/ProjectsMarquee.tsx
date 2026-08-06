"use client";
/** docs: docs/04-componentes-e-padroes.md · docs/06-projetos.md */

import { ProjectCard } from "@/components/ui/ProjectCard";
import type { Project } from "@/lib/projects";

/**
 * Faixa contínua de projetos. Partilha a técnica do `Marquee` (conteúdo
 * duplicado, `-50%` a fechar o ciclo) mas não a semântica: aqui o conteúdo são
 * links reais, por isso só o primeiro conjunto conta — o segundo é `inert` e
 * `aria-hidden`, para não existirem 10 alvos de teclado onde há 5 projetos.
 *
 * O espaçamento é `px-2` em cada célula e não `gap` no track: com `gap`, metade
 * da largura cai a meio de um espaço em vez de cair no início do segundo
 * conjunto, e o ciclo salta meio intervalo de cada vez.
 *
 * Congelado por `prefers-reduced-motion`, deixaria três projetos fora do ecrã
 * sem forma de lá chegar — daí as classes `carousel-*`, que `globals.css`
 * transforma num carrossel de scroll manual nesse caso.
 */

const CARD_SIZES = "(min-width: 1024px) 440px, (min-width: 640px) 380px, 90vw";

/** Largura da célula = largura do card + os 2×`px-2`. */
const CELL = "w-[calc(100vw-2rem)] shrink-0 px-2 sm:w-[396px] lg:w-[456px]";

export function ProjectsMarquee({
  projects,
  duration = 55,
}: {
  projects: Project[];
  duration?: number;
}) {
  return (
    <div className="carousel-viewport group flex overflow-hidden">
      <ul
        className={
          "carousel-track flex w-max shrink-0 animate-marquee [animation-direction:reverse] " +
          "group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] " +
          "group-active:[animation-play-state:paused]"
        }
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        {projects.map((p) => (
          <li key={p.slug} className={`carousel-item ${CELL}`}>
            <ProjectCard project={p} reveal={false} sizes={CARD_SIZES} />
          </li>
        ))}
        {projects.map((p) => (
          <li
            key={`copia-${p.slug}`}
            inert
            aria-hidden
            className={`carousel-clone carousel-item ${CELL}`}
          >
            <ProjectCard project={p} reveal={false} sizes={CARD_SIZES} />
          </li>
        ))}
      </ul>
    </div>
  );
}
