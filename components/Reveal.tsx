"use client";
/** docs: docs/04-componentes-e-padroes.md — durações e easing são especificados aí. */

import { motion, useInView, type Variants } from "motion/react";
import { useEffect, useRef, useState } from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

/**
 * Scroll-triggered reveal. Subtle by design; MotionConfig (reducedMotion="user")
 * strips the transform for users who prefer reduced motion.
 *
 * A animação é uma melhoria, nunca a condição de o conteúdo existir. Há dois
 * casos em que o observador de viewport não chega a disparar e a secção ficaria
 * em branco para sempre:
 *
 * 1. **Sem JavaScript** — tratado em `globals.css`: enquanto o `<html>` não tiver
 *    a classe `js` (posta por um script no `layout`), o `[data-reveal]` aparece.
 * 2. **Com JavaScript, mas em renderizadores headless** — previews de link,
 *    ferramentas de captura, separadores em segundo plano. Aí o `IntersectionObserver`
 *    hidrata mas nunca dispara. Daí o temporizador de segurança abaixo: se ao fim
 *    de 1,2 s nada aconteceu, mostra-se de qualquer maneira.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFallback(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      ref={ref}
      data-reveal
      className={className}
      variants={variants}
      initial="hidden"
      animate={inView || fallback ? "show" : "hidden"}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
