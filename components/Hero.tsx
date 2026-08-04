"use client";
/** docs: docs/04-componentes-e-padroes.md — o motivo de fundo é o "+" (ver docs/03). */

import { motion, type Variants } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/Logo";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const words: { t: string; accent?: boolean }[] = [
  { t: "Web" },
  { t: "design" },
  { t: "que" },
  { t: "soma", accent: true },
  { t: "ao" },
  { t: "teu" },
  { t: "negócio." },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* O "+" em contorno, a rodar devagar — o logo no fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[12%] -top-[18%] z-0 w-[78%] max-w-[42rem] text-primary opacity-[0.06] sm:opacity-[0.07]"
      >
        <Logo
          outline
          className="h-auto w-full animate-spin-slow [animation-duration:120s]"
        />
      </div>

      <Container className="relative z-10 pb-14 pt-14 sm:pb-24 sm:pt-24">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Disponível para novos projetos
            </span>
          </motion.div>

          <h1 className="mt-5 max-w-[20ch] font-display font-semibold leading-[1.02] tracking-tight text-[clamp(2.25rem,7vw,5.5rem)]">
            {words.map((w, i) => (
              <motion.span
                key={i}
                variants={item}
                className={cn("mr-[0.22em] inline-block", w.accent && "text-primary")}
              >
                {w.t}
              </motion.span>
            ))}
          </h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-base text-muted sm:text-lg"
          >
            Somos a {site.name}, um estúdio independente que desenha e desenvolve
            sites, plataformas e menus digitais. Construímos cada projeto de raiz
            — rápido, acessível e pensado para converter.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button href="/portfolio" variant="primary" className="w-full sm:w-auto">
              Ver portfólio
            </Button>
            <Button href="/contacto" variant="outline" className="w-full sm:w-auto">
              Falar connosco
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
