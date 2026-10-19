"use client";
/** docs: docs/04-componentes-e-padroes.md — os carris do telemóvel. */

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./paginas.module.css";

/**
 * Um carril horizontal para o telemóvel: cartões lado a lado, scroll nativo
 * com snap, contador e setas.
 *
 * Existe porque duas listas longas — os nove projetos do portfólio e os seis
 * serviços — empilhadas num ecrã de 390px custavam ecrãs e ecrãs de scroll, e
 * no portfólio o nome ficava longe da capa. Num carril cada cartão leva tudo
 * junto e a lista ocupa a altura de um cartão.
 *
 * O scroll é o do browser (o dedo arrasta, a roda e o trackpad também); as
 * setas e as teclas ← → no carril só pedem ao browser que vá ao cartão
 * seguinte. Sem autoplay. Os cartões chegam já desenhados pelo servidor; aqui
 * só se gere a posição.
 */
export function Carril({
  rotulo,
  children,
  glass = false,
}: {
  /** O nome do que se percorre, no singular: "Projeto", "Serviço". */
  rotulo: string;
  children: ReactNode;
  glass?: boolean;
}) {
  const pista = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState(0);
  const total = Children.count(children);

  const medir = () => {
    const el = pista.current;
    if (!el) return;
    const esquerda = el.getBoundingClientRect().left;
    let melhor = 0;
    let dist = Infinity;
    Array.from(el.children).forEach((filho, i) => {
      const d = Math.abs(filho.getBoundingClientRect().left - esquerda);
      if (d < dist) {
        dist = d;
        melhor = i;
      }
    });
    setAtivo(melhor);
  };

  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  const mover = (delta: number) => {
    const el = pista.current;
    if (!el) return;
    const i = Math.max(0, Math.min(total - 1, ativo + delta));
    const alvo = el.children[i] as HTMLElement | undefined;
    if (!alvo) return;
    el.scrollTo({
      left: alvo.offsetLeft - (el.children[0] as HTMLElement).offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  return (
    <div className={styles.carril} data-glass={glass || undefined}>
      <div className={styles.carrilControlos}>
        <span aria-live="polite" className="tabular-nums">
          {String(ativo + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span className="text-muted">Desliza para explorar</span>
        <button
          type="button"
          aria-label={`${rotulo} anterior`}
          disabled={ativo === 0}
          onClick={() => mover(-1)}
        >
          <Seta atras />
        </button>
        <button
          type="button"
          aria-label={`${rotulo} seguinte`}
          disabled={ativo === total - 1}
          onClick={() => mover(1)}
        >
          <Seta />
        </button>
      </div>
      <div
        ref={pista}
        className={styles.carrilPista}
        role="region"
        aria-label={`${rotulo}s`}
        tabIndex={0}
        onScroll={medir}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            mover(e.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        {Children.map(children, (filho, i) => (
          <div
            className={styles.carrilCartao}
            data-active={i === ativo}
            role="group"
            aria-roledescription="cartão"
            aria-label={`${i + 1} de ${total}`}
          >
            {filho}
          </div>
        ))}
      </div>
    </div>
  );
}

function Seta({ atras = false }: { atras?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={atras ? "m14 5-7 7 7 7M7 12h14" : "m10 5 7 7-7 7M17 12H3"} />
    </svg>
  );
}
