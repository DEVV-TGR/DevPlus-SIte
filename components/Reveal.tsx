"use client";
/** docs: docs/04-componentes-e-padroes.md — durações e easing são especificados aí. */

import { motion, useInView, type Variants } from "motion/react";
import { useEffect, useRef, useState } from "react";

/*
  O `opacity + y:16` sozinho é o reveal por omissão de meia internet. O que lhe
  dá carácter aqui é o **desfoque de entrada**, e não uma curva nova: o `docs/04`
  diz que o easing `[0.22, 1, 0.36, 1]` vale para tudo, e uma segunda curva era
  uma segunda gramática de movimento no mesmo site.

  Os 4px de desfoque são os mesmos que o morph das capas usa a meio do voo. O
  conteúdo chega como se estivesse a focar, o que liga o movimento das secções
  ao movimento das páginas em vez de os deixar como dois efeitos sem parentesco.

  A distância subiu de 16 para 20px. É pouco, e é de propósito: o suficiente
  para o olho registar a chegada, longe do salto que faz um site parecer
  instável a meio da leitura.
*/
const variants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    /*
      `blur(0px)` não é `none`: um filtro, mesmo a zero, deixa o elemento com
      containing block e camada de composição próprios. Como o `Reveal` envolve
      blocos por toda a página, isso são dezenas de camadas que o browser passa
      a manter para nada, depois de a animação ter acabado. `transitionEnd`
      corre no fim e devolve o filtro a `none`.

      Nota para quem vier a seguir: chegou a suspeitar-se que este filtro parado
      partia o morph das capas, porque um `view-transition-name` dentro de um
      ancestral com filtro não pode ser elevado para a camada da transição.
      **Foi testado e não parte** — o morph forma o par com ou sem esta linha. O
      que falhava era o instrumento de verificação, que lia as animações uma só
      vez no `ready` e às vezes caía depois de elas terem sido descartadas. A
      limpeza fica pelo custo das camadas, não por uma avaria que não existe.
    */
    transitionEnd: { filter: "none" },
  },
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
