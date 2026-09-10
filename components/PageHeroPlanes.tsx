"use client";
/** docs: docs/04-componentes-e-padroes.md (movimento) · docs/03 (o "+") */

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Logo } from "@/components/Logo";

/*
  A versão contida do hero da homepage, para as páginas internas.

  Reutiliza o **mesmo** plano de grelha (`plane-far`) de propósito: as páginas
  têm de parecer o mesmo sítio, e um fundo diferente por página dava cinco
  mundos em vez de um. Muda o enquadramento, não o mundo.

  Dois planos e não quatro: um cabeçalho de página é mais baixo que o hero e não
  tem scroll suficiente para quatro taxas se distinguirem. Empilhar planos que
  não chegam a separar-se é peso sem profundidade.
*/

/** Enquadramentos por página. O mundo é o mesmo; o sítio onde se está é que muda. */
const VISTAS = {
  servicos: { pos: "30% 40%", esc: 1.15, mais: "-right-[8%] top-[-30%]" },
  portfolio: { pos: "70% 55%", esc: 1.1, mais: "-right-[12%] top-[-18%]" },
  sobre: { pos: "50% 30%", esc: 1.2, mais: "-right-[6%] top-[-36%]" },
  contacto: { pos: "20% 65%", esc: 1.12, mais: "-right-[10%] top-[-24%]" },
  neutra: { pos: "50% 50%", esc: 1.1, mais: "-right-[10%] top-[-26%]" },
} as const;

export type Vista = keyof typeof VISTAS;

export function PageHeroPlanes({ vista = "neutra" }: { vista?: Vista }) {
  const ref = useRef<HTMLDivElement>(null);
  const semMovimento = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Mesma razão do `HeroPlanes`: um `useTransform` de scroll não é animação, e
  // o `MotionConfig reducedMotion="user"` não lhe toca.
  const k = semMovimento ? 0 : 1;
  const yFundo = useTransform(scrollYProgress, [0, 1], ["0%", `${9 * k}%`]);
  const yMais = useTransform(scrollYProgress, [0, 1], ["0%", `${34 * k}%`]);

  const v = VISTAS[vista];

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <motion.div
        className="absolute -inset-[10%] will-change-transform"
        style={{ y: yFundo }}
      >
        <Image
          src="/hero/plane-far.webp"
          alt=""
          fill
          sizes="100vw"
          quality={70}
          className="object-cover opacity-95"
          style={{ objectPosition: v.pos, scale: v.esc }}
        />
      </motion.div>

      {/* O "+", como no hero: preenchimento por baixo para dar massa, contorno
          por cima para dar aresta. Mesma geometria de `lib/brand.ts`. */}
      <motion.div
        className={`absolute w-[42%] max-w-[26rem] text-primary will-change-transform ${v.mais}`}
        style={{ y: yMais }}
      >
        <Logo className="absolute inset-0 h-auto w-full opacity-[0.05]" />
        <Logo outline className="h-auto w-full opacity-[0.24] sm:opacity-[0.3]" />
      </motion.div>

      {/* O mesmo véu do hero: o `h1` lê-se sobre o mundo, sempre. */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-bg/25" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg to-transparent" />
    </div>
  );
}
