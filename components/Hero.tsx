"use client";
/** docs: docs/04-componentes-e-padroes.md — o motivo de fundo é o "+" (ver docs/03). */

import { Fragment } from "react";
import { motion, type Variants } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HeroPlanes } from "@/components/HeroPlanes";
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
    /*
      Um ecrã, não vários. O hero ganha profundidade mas não se prende nem
      atrasa quem vem ver o portfólio — decisão do Gonçalo, setembro de 2026.
      `svh` e não `vh`: no telemóvel a barra do browser faz `vh` mentir, e o
      hero ficava mais alto do que o ecrã que existe.
    */
    <section className="relative flex min-h-[88svh] items-center overflow-hidden">
      {/* Quatro planos com taxas de viagem diferentes — ver HeroPlanes. */}
      <HeroPlanes />

      <Container className="relative z-10 w-full pb-14 pt-14 sm:pb-24 sm:pt-24">
        <motion.div
          data-reveal
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} data-reveal-item>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Disponível para novos projetos
            </span>
          </motion.div>

          {/* O espaço entre palavras é um espaço a sério, não `margin`. Cada
              palavra anima em separado, e por isso é um `<span>` — mas com a
              margem a fazer de espaço o HTML servido não tinha separador
              nenhum, e o título chegava ao Google e aos leitores de ecrã como
              "Webdesignquesomaaoteunegócio.". O `{" "}` entre os spans custa
              nada e devolve o título a quem o lê sem o ver. */}
          <h1 className="mt-5 max-w-[20ch] font-display font-semibold leading-[1.02] tracking-tight text-[clamp(2.25rem,7vw,5.5rem)]">
            {words.map((w, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                <motion.span
                  variants={item}
                  data-reveal-item
                  className={cn("inline-block", w.accent && "text-primary")}
                >
                  {w.t}
                </motion.span>
              </Fragment>
            ))}
          </h1>

          <motion.p
            variants={item}
            data-reveal-item
            className="mt-6 max-w-xl text-base text-muted sm:text-lg"
          >
            Já tiveste de ligar a alguém só para mudar um preço no site?
            Connosco não. Somos a {site.name}: fazemos o teu site à medida e
            entregamos-te o comando — mudas o que quiseres, quando quiseres, do
            telemóvel.
          </motion.p>

          <motion.div
            variants={item}
            data-reveal-item
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button
              href="/portfolio"
              variant="primary"
              className="w-full sm:w-auto"
            >
              Ver portfólio
            </Button>
            <Button
              href="/contacto"
              variant="outline"
              className="w-full sm:w-auto"
            >
              Conta-nos a tua ideia
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
