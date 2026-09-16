"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOVIMENTO } from "@/lib/motion";

/**
 * Entrada de cada navegação. O `template.tsx` volta a montar a cada mudança de
 * rota, por isso o conteúdo entra enquanto a `Nav` e o `Footer` (que vivem no
 * layout) ficam onde estão.
 *
 * Discreta de propósito: 10 px e um `fade`. Quem navega já sabe que a página
 * mudou — a animação confirma, não anuncia.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          anima: "(prefers-reduced-motion: no-preference)",
          reduz: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          if (!ctx.conditions?.anima) {
            gsap.set(el, { opacity: 1, y: 0, clearProps: "transform" });
            return;
          }
          gsap.fromTo(
            el,
            { opacity: 0, y: 10 },
            {
              opacity: 1,
              y: 0,
              duration: MOVIMENTO.pagina,
              ease: MOVIMENTO.ease,
              clearProps: "transform",
            },
          );
        },
      );
      /* Sem `mm.revert()`: quem limpa é o `useGSAP`. Ver a nota no `Reveal`. */
    },
    { scope: ref },
  );

  return (
    <div ref={ref} data-reveal>
      {children}
    </div>
  );
}
