"use client";
/** docs: docs/04-componentes-e-padroes.md · docs/06-projetos.md */

import { useEffect, useRef } from "react";
import { ProjectCard } from "@/components/ui/ProjectCard";
import type { Project } from "@/lib/projects";

/**
 * Faixa contínua de projetos, arrastável.
 *
 * Não usa a animação do `Marquee`: com `translateX` o conteúdo não é
 * agarrável, e quem quisesse voltar a um projeto que passou tinha de esperar
 * pela volta inteira. Aqui o movimento é **scroll a sério** — um
 * `requestAnimationFrame` empurra o `scrollLeft` devagar — o que traz de
 * borla o arrasto com o dedo, o trackpad, a roda com shift e as setas do
 * teclado. O arrasto com o rato é o único que precisa de código.
 *
 * O conteúdo está duplicado e o `scrollLeft` dá a volta a meio da largura, o
 * que faz o ciclo parecer infinito nos dois sentidos. Só o primeiro conjunto
 * conta: o segundo é `inert` e `aria-hidden`, para não haver 10 alvos de
 * teclado onde existem 5 projetos.
 *
 * Sem JavaScript continua a ser um carrossel — só não anda sozinho.
 */

const CARD_SIZES = "(min-width: 1024px) 440px, (min-width: 640px) 380px, 90vw";

/** Largura da célula = largura do card + os 2×`px-2`. */
const CELL = "w-[calc(100vw-2rem)] shrink-0 px-2 sm:w-[396px] lg:w-[456px]";

/** Píxeis por segundo. Devagar: tem de dar para ler e para acertar num card. */
const VELOCIDADE = 34;

export function ProjectsMarquee({
  projects,
  velocidade = VELOCIDADE,
}: {
  projects: Project[];
  velocidade?: number;
}) {
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;

    const metade = () => el.scrollWidth / 2;

    // Arrancar a meio dá margem para arrastar nos dois sentidos desde o
    // primeiro instante. Fica adiado para o primeiro frame em que já há
    // largura: enquanto as capas não têm dimensão, `scrollWidth` é 0.
    let porArrancar = true;

    let posicao = 0;
    let ultimoAplicado = posicao;
    let anterior: number | null = null;
    let parado = false;
    let raf = 0;

    // Mantém a posição dentro da primeira metade. Como as duas cópias são
    // idênticas, o salto não se vê.
    const normalizar = (v: number) => {
      const m = metade();
      if (m <= 0) return v;
      return ((v % m) + m) % m;
    };

    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Escreve a posição já normalizada. É aqui que o ciclo se fecha: o browser
    // nunca deixaria o `scrollLeft` passar de 0, e sem isto o arrasto para trás
    // encravava no extremo esquerdo em vez de dar a volta.
    const aplicar = (v: number) => {
      posicao = normalizar(v);
      el.scrollLeft = posicao;
      ultimoAplicado = el.scrollLeft;
    };

    const passo = (agora: number) => {
      raf = requestAnimationFrame(passo);
      const delta = anterior === null ? 0 : (agora - anterior) / 1000;
      anterior = agora;

      if (porArrancar) {
        if (metade() <= 0) return;
        porArrancar = false;
        aplicar(metade() / 2);
      }

      // Alguém mexeu por fora (roda, trackpad, teclado): aceita a posição dele.
      if (Math.abs(el.scrollLeft - ultimoAplicado) > 1) posicao = el.scrollLeft;

      if (parado || semMovimento.matches || aArrastar) return;

      // Os cards viajam da direita para a esquerda — o mesmo sentido da faixa
      // de disciplinas. Foi decidido a olhar para o ecrã, e não em abstrato:
      // ao contrário, a faixa lê-se como se a página estivesse a recuar. Não
      // troques o sinal sem esse teste. `Math.min` protege de saltos enormes
      // quando o separador esteve em segundo plano.
      aplicar(posicao + velocidade * Math.min(delta, 0.05));
    };

    // Declarado antes do `raf` porque o `passo` consulta-o.
    let aArrastar = false;

    raf = requestAnimationFrame(passo);

    const parar = () => {
      parado = true;
    };
    const retomar = () => {
      parado = false;
    };

    el.addEventListener("pointerenter", parar);
    el.addEventListener("pointerleave", retomar);
    el.addEventListener("focusin", parar);
    el.addEventListener("focusout", retomar);
    el.addEventListener("touchstart", parar, { passive: true });
    el.addEventListener("touchend", retomar, { passive: true });

    // Arrasto com o rato. O dedo e o trackpad já são tratados pelo browser.
    let xInicial = 0;
    let scrollInicial = 0;
    let percorrido = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      aArrastar = true;
      percorrido = 0;
      xInicial = e.clientX;
      scrollInicial = el.scrollLeft;
      el.setPointerCapture(e.pointerId);
      el.classList.add("cursor-grabbing");
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!aArrastar) return;
      const dx = e.clientX - xInicial;
      percorrido = Math.max(percorrido, Math.abs(dx));
      aplicar(scrollInicial - dx);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!aArrastar) return;
      aArrastar = false;
      el.releasePointerCapture?.(e.pointerId);
      el.classList.remove("cursor-grabbing");
    };

    // Arrastar não deve abrir o projeto que estava debaixo do cursor.
    const onClick = (e: MouseEvent) => {
      if (percorrido > 6) {
        e.preventDefault();
        e.stopPropagation();
        percorrido = 0;
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("click", onClick, true);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", parar);
      el.removeEventListener("pointerleave", retomar);
      el.removeEventListener("focusin", parar);
      el.removeEventListener("focusout", retomar);
      el.removeEventListener("touchstart", parar);
      el.removeEventListener("touchend", retomar);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("click", onClick, true);
    };
  }, [velocidade]);

  return (
    <div
      ref={viewport}
      // `data-lenis-prevent`: sem isto o scroll suave da página rouba o
      // gesto horizontal ao carrossel.
      data-lenis-prevent
      className="carousel-viewport cursor-grab overflow-x-auto overscroll-x-contain"
    >
      <ul className="flex w-max">
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
            className={`carousel-item ${CELL}`}
          >
            <ProjectCard project={p} reveal={false} sizes={CARD_SIZES} />
          </li>
        ))}
      </ul>
    </div>
  );
}
