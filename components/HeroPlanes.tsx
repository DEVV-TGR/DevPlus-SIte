"use client";
/** docs: docs/04-componentes-e-padroes.md (movimento) · docs/03 (o "+") */

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Logo } from "@/components/Logo";

/*
  Profundidade a sério, não uma imagem com parallax.

  Três planos gerados separadamente — grelha em fuga ao fundo, estrutura de
  betão ao meio, betão desfocado à frente — mais o "+" da marca, que é o quarto
  plano e o único desenhado em código.

  O que faz isto ler como profundidade e não como uma fotografia a deslizar são
  as **taxas visivelmente diferentes**: o fundo quase não se mexe, a frente
  viaja seis vezes mais. Taxas próximas dão uma imagem só, que é exatamente o
  que o `hero-depth.md` da skill diz não servir.

  O "+" nunca é gerado. A geometria dele vive em `lib/brand.ts` e é governada
  por `docs/03`; um modelo generativo a desenhá-lo devolvia um símbolo torto.
*/

/** Quanto cada plano viaja ao longo do hero, em percentagem da própria altura. */
const VIAGEM = {
  fundo: 6,
  meio: 20,
  frente: 46,
  mais: 32,
} as const;

/** Quanto cada plano responde ao ponteiro, em pixels. O fundo quase ignora. */
const PONTEIRO = {
  fundo: 6,
  meio: 16,
  frente: 34,
  mais: 24,
} as const;

function Plano({
  src,
  srcMobile,
  alt,
  y,
  px,
  py,
  className,
  priority = false,
  quality,
}: {
  src: string;
  srcMobile: string;
  alt: string;
  y: MotionValue<string>;
  px: MotionValue<number>;
  py: MotionValue<number>;
  className?: string;
  priority?: boolean;
  quality?: number;
}) {
  return (
    /*
      Dois `div` aninhados, e não um só: `y` e `translateY` são a MESMA
      propriedade no motion, portanto passá-las juntas fazia a segunda anular a
      primeira e o parallax de scroll desaparecia em silêncio. Aninhados, as
      transformações compõem-se — o exterior leva o scroll, o interior o
      ponteiro.
    */
    <motion.div aria-hidden className={className} style={{ y }}>
      <motion.div className="absolute inset-0" style={{ x: px, y: py }}>
      {/*
        `<picture>` e não duas `next/image` com `hidden`: o recorte de telemóvel
        é 3:4 e o de secretária 16:9 — enquadramentos diferentes, não tamanhos
        diferentes. Duas imagens escondidas por CSS descarregam as duas em
        vários browsers, e aqui isso seria pagar o hero a dobrar. As imagens já
        vêm dimensionadas e em WebP de `scripts/otimizar-hero.mjs`, portanto não
        se perde nada por não passar pelo otimizador do Next.
      */}
      <picture>
        <source media="(max-width: 639px)" srcSet={srcMobile} />
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          quality={quality}
          sizes="100vw"
          className="object-cover"
        />
      </picture>
      </motion.div>
    </motion.div>
  );
}

export function HeroPlanes() {
  const ref = useRef<HTMLDivElement>(null);
  const semMovimento = useReducedMotion();

  /*
    `MotionConfig reducedMotion="user"` em `Providers` desarma as animações
    declarativas, mas **não** desarma um `useTransform` ligado ao scroll: isto
    não é uma animação, é um valor derivado. Sem o corte abaixo, quem pediu
    menos movimento continuava a ver os quatro planos a viajar.
  */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Hooks chamados um a um, ao nível do componente. Um ajudante que envolvesse
  // `useTransform` obrigava a desligar a regra dos hooks, e uma regra desligada
  // é uma regra que deixa de avisar quando o código mudar de forma.
  const k = semMovimento ? 0 : 1;
  const yFundo = useTransform(scrollYProgress, [0, 1], ["0%", `${VIAGEM.fundo * k}%`]);
  const yMeio = useTransform(scrollYProgress, [0, 1], ["0%", `${VIAGEM.meio * k}%`]);
  const yFrente = useTransform(scrollYProgress, [0, 1], ["0%", `${VIAGEM.frente * k}%`]);
  const yMais = useTransform(scrollYProgress, [0, 1], ["0%", `${VIAGEM.mais * k}%`]);
  // Graus ao longo do hero inteiro. Oito é quase nada de propósito: o "+" tem de
  // parecer um objeto que se desloca, não um cata-vento.
  const rodaMais = useTransform(scrollYProgress, [0, 1], [0, 8 * k]);

  // O ponteiro é um extra, nunca a única forma de ver o hero (hero-depth.md).
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const mola = { stiffness: 60, damping: 20, mass: 0.6 };
  const sx = useSpring(mx, mola);
  const sy = useSpring(my, mola);

  useEffect(() => {
    if (semMovimento) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = 0;
    let alvoX = 0;
    let alvoY = 0;

    const mover = (e: PointerEvent) => {
      // -0.5 a 0.5, a partir do centro do ecrã
      alvoX = e.clientX / window.innerWidth - 0.5;
      alvoY = e.clientY / window.innerHeight - 0.5;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        mx.set(alvoX);
        my.set(alvoY);
      });
    };

    window.addEventListener("pointermove", mover, { passive: true });
    return () => {
      window.removeEventListener("pointermove", mover);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [mx, my, semMovimento]);

  // Idem: um par de hooks por plano, escritos à mão.
  const xFundo = useTransform(sx, [-0.5, 0.5], [PONTEIRO.fundo, -PONTEIRO.fundo]);
  const pyFundo = useTransform(sy, [-0.5, 0.5], [PONTEIRO.fundo / 2, -PONTEIRO.fundo / 2]);
  const xMeio = useTransform(sx, [-0.5, 0.5], [PONTEIRO.meio, -PONTEIRO.meio]);
  const pyMeio = useTransform(sy, [-0.5, 0.5], [PONTEIRO.meio / 2, -PONTEIRO.meio / 2]);
  const xFrente = useTransform(sx, [-0.5, 0.5], [PONTEIRO.frente, -PONTEIRO.frente]);
  const pyFrente = useTransform(sy, [-0.5, 0.5], [PONTEIRO.frente / 2, -PONTEIRO.frente / 2]);
  const xMais = useTransform(sx, [-0.5, 0.5], [PONTEIRO.mais, -PONTEIRO.mais]);
  const pyMais = useTransform(sy, [-0.5, 0.5], [PONTEIRO.mais / 2, -PONTEIRO.mais / 2]);

  const camada = "pointer-events-none absolute -inset-[8%] will-change-transform";

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <Plano
        src="/hero/plane-far.webp"
        srcMobile="/hero/plane-far-m.webp"
        alt=""
        y={yFundo}
        px={xFundo}
        py={pyFundo}
        className={camada}
        priority
        quality={80}
      />

      <Plano
        src="/hero/plane-mid.webp"
        srcMobile="/hero/plane-mid-m.webp"
        alt=""
        y={yMeio}
        px={xMeio}
        py={pyMeio}
        className={`${camada} opacity-90`}
      />

      {/*
        O "+" vive ENTRE a estrutura e o betão da frente: é o que lhe dá lugar
        no espaço em vez de o deixar colado ao ecrã.

        Dois `Logo` sobrepostos e não um: o componente desenha contorno **ou**
        preenchimento, e sozinho nenhum dos dois chega. O preenchimento a 4%
        dá-lhe massa, o contorno por cima dá-lhe aresta. Partilham o mesmo path
        de `lib/brand.ts` — não há geometria duplicada, que é o que o `docs/03`
        proíbe.

        A rotação é lenta e vem do SCROLL, não do relógio. Antes era um
        `animate-spin-slow` de 120s que girava sozinho a página inteira parada;
        ligado ao scroll, o símbolo responde a quem está a ler.
      */}
      <motion.div
        className="pointer-events-none absolute -right-[4%] top-[8%] w-[54%] max-w-[34rem] text-primary will-change-transform"
        style={{ y: yMais }}
      >
        <motion.div style={{ x: xMais, y: pyMais, rotate: rodaMais }}>
          <Logo className="absolute inset-0 h-auto w-full opacity-[0.04]" />
          <Logo outline className="h-auto w-full opacity-[0.22] sm:opacity-[0.28]" />
        </motion.div>
      </motion.div>

      <Plano
        src="/hero/plane-near.webp"
        srcMobile="/hero/plane-near-m.webp"
        alt=""
        y={yFrente}
        px={xFrente}
        py={pyFrente}
        className={`${camada} opacity-70 mix-blend-screen`}
      />

      {/* Véu: o `h1` tem de se ler sobre qualquer plano. Superfície, não texto
          — a mesma regra que o `ProjectCard` já segue para as capas. */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/40" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg to-transparent" />
    </div>
  );
}
