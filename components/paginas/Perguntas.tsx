"use client";
/** docs: docs/04-componentes-e-padroes.md · docs/05-servicos.md */

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/motion";
import styles from "./paginas.module.css";

/** Disclosures nativos sem JS; altura medida e interrompível com JS. */
export function Perguntas({ items }: { items: [string, string][] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Map<HTMLDetailsElement, Animation>();
    const intended = new Map<HTMLDetailsElement, boolean>();
    let refresh = 0;

    const animate = (details: HTMLDetailsElement, open: boolean) => {
      const from = details.getBoundingClientRect().height;
      const previous = animations.get(details);
      if (previous) {
        previous.onfinish = null;
        previous.cancel();
      }
      intended.set(details, open);
      details.dataset.expanded = String(open);
      // Manter o conteúdo montado durante o fecho evita o flash do <details>.
      details.open = true;
      const to = open
        ? details.getBoundingClientRect().height
        : details.querySelector("summary")!.getBoundingClientRect().height +
          parseFloat(getComputedStyle(details).borderTopWidth);
      const finish = () => {
        details.open = open;
        details.style.removeProperty("overflow");
        animations.delete(details);
        cancelAnimationFrame(refresh);
        refresh = requestAnimationFrame(() => ScrollTrigger.refresh());
      };
      if (reduced.matches || from === to) {
        finish();
        return;
      }
      details.style.overflow = "hidden";
      const animation = details.animate(
        { height: [`${from}px`, `${to}px`] },
        { duration: 360, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
      animations.set(details, animation);
      animation.onfinish = finish;
    };
    const click = (event: MouseEvent) => {
      const summary = (event.target as Element).closest("summary");
      if (!summary || !element.contains(summary)) return;
      event.preventDefault();
      const selected = summary.parentElement as HTMLDetailsElement;
      const open = !(intended.get(selected) ?? selected.open);
      // Fechar a anterior com a mesma animação, sem o fecho abrupto de name.
      for (const details of element.querySelectorAll("details")) {
        if (details !== selected && (intended.get(details) ?? details.open)) {
          animate(details, false);
        }
      }
      animate(selected, open);
    };
    const settle = () => {
      for (const animation of animations.values()) animation.finish();
    };
    element.addEventListener("click", click);
    window.addEventListener("resize", settle);
    reduced.addEventListener("change", settle);
    return () => {
      element.removeEventListener("click", click);
      window.removeEventListener("resize", settle);
      reduced.removeEventListener("change", settle);
      for (const [details, animation] of animations) {
        animation.onfinish = null;
        animation.cancel();
        details.open = intended.get(details) ?? details.open;
        details.style.removeProperty("overflow");
      }
      cancelAnimationFrame(refresh);
    };
  }, []);

  return (
    <div ref={root} className={styles.faq}>
      {items.map(([question, answer], i) => (
        <details key={question} open={i === 0}>
          <summary>
            {question}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M4 12h16M12 4v16" />
            </svg>
          </summary>
          <p>{answer}</p>
        </details>
      ))}
    </div>
  );
}
