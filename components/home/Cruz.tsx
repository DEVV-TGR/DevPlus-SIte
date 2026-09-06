"use client";
/** docs: docs/04-componentes-e-padroes.md — o gesto está especificado aí. */

import { useRef } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/motion";
import { Logo } from "@/components/Logo";

/**
 * O "+" atravessa a página inicial.
 *
 * Uma camada fixa, atrás do conteúdo, conduzida pelo **scroll do documento
 * inteiro** e não pelo progresso de uma secção — é isso que o deixa sobreviver
 * aos cortes entre capítulos em vez de morrer com aquele onde nasceu. Chega à
 * escala de um prédio na capa, encolhe e roda no corte, fica cinzento sobre o
 * papel, e volta a laranja para fechar.
 *
 * A geometria vem do `Logo`, que a lê de `lib/brand.ts`. Nunca se redesenha o
 * "+" à mão nem se gera por modelo — ver `docs/03`.
 */

/** Os postos, em fração do scroll total da página. */
const POSTOS = [
  { p: 0.0, s: 2.7, x: 30, y: -10, r: 0, c: "var(--primary)" },
  { p: 0.12, s: 2.1, x: 34, y: 8, r: 18, c: "var(--primary)" },
  { p: 0.26, s: 0.55, x: -38, y: 18, r: 45, c: "var(--primary)" },
  { p: 0.44, s: 0.8, x: 36, y: -20, r: 0, c: "var(--paper-muted)" },
  { p: 0.62, s: 0.5, x: -40, y: -26, r: 45, c: "var(--primary)" },
  { p: 0.8, s: 0.9, x: 36, y: 22, r: 12, c: "var(--primary)" },
  /* No fecho o "+" sai do centro: é ali que vive o CTA, e o gesto não pode
     custar o botão. Creme sobre o laranja lê-se como marca-d'água em vez de
     competir com o título, que é escuro. */
  { p: 1.0, s: 1.15, x: 40, y: 30, r: 0, c: "var(--ink)" },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Suaviza a passagem entre postos: sem isto o "+" muda de direção em bicos. */
const suave = (t: number) => t * t * (3 - 2 * t);

function posto(p: number) {
  let i = 0;
  while (i < POSTOS.length - 2 && p > POSTOS[i + 1].p) i++;
  const a = POSTOS[i];
  const b = POSTOS[i + 1];
  const t = suave(Math.min(1, Math.max(0, (p - a.p) / (b.p - a.p))));
  return {
    s: lerp(a.s, b.s, t),
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    r: lerp(a.r, b.r, t),
    c: t < 0.5 ? a.c : b.c,
  };
}

export function Cruz() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current?.firstElementChild as HTMLElement | null;
      if (!el) return;

      const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const pintar = (p: number) => {
        const v = posto(p);
        el.style.setProperty("--cs", v.s.toFixed(3));
        el.style.setProperty("--cx", `${v.x.toFixed(2)}vw`);
        el.style.setProperty("--cy", `${v.y.toFixed(2)}vh`);
        el.style.setProperty("--cr", `${v.r.toFixed(2)}deg`);
        el.style.setProperty("--cfill", v.c);
      };

      if (reduz) {
        /* Sem movimento, o "+" fica onde a capa o põe. A página continua a
           ter o símbolo; o que não tem é a viagem. */
        pintar(0);
        return;
      }

      /* Um objeto deste tamanho a seguir o scroll 1:1 mostra cada buraco entre
         eventos de roda como um solavanco. O `scrub` do ScrollTrigger faz a
         interpolação por nós, e no mesmo relógio do resto da página. */
      const st = ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        onUpdate: (self) => pintar(self.progress),
      });
      pintar(0);
      return () => st.kill();
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 grid place-items-center"
    >
      <Logo className="h-[22vmin] w-[22vmin] overflow-visible [transform-origin:50%_50%] [transform:translate3d(var(--cx,0),var(--cy,0),0)_rotate(var(--cr,0deg))_scale(var(--cs,1))] [&_path]:fill-[var(--cfill,var(--primary))] [&_path]:transition-[fill] [&_path]:duration-500" />
    </div>
  );
}
