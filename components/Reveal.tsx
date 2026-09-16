"use client";
/** docs: docs/04-componentes-e-padroes.md — durações e easing são especificados aí. */

import { useRef } from "react";
import { gsap, useGSAP, MOVIMENTO } from "@/lib/motion";

/**
 * Entrada de um bloco quando chega ao ecrã. Dispara uma vez — nada re-anima ao
 * subir.
 *
 * **A opacidade e a posição têm durações diferentes de propósito.** O bloco
 * acaba de aparecer aos 290 ms e continua a assentar até aos 475 ms. Com uma
 * duração só, chega inteiro de uma vez e lê-se como um `fade` com deslocamento;
 * com duas, tem peso. Vem medido — ver `docs/motion-reference.md`.
 *
 * **Nada de `setState` aqui dentro.** A primeira versão avisava o React quando
 * a animação acabava, e isso pendurava o separador: doze `Reveal` a chamar
 * `setState` a partir de um `onComplete` do GSAP re-renderizavam durante o tick
 * do próprio GSAP, o que voltava a mexer no layout, o que fazia o ScrollTrigger
 * recalcular dentro do mesmo tick. O sintoma era o renderer deixar de responder
 * e as animações ficarem paradas a meio, com valores intermédios no `style`.
 * Quem mostra o bloco é o GSAP, escrevendo no DOM; o React não precisa de saber.
 *
 * A animação é uma melhoria, nunca a condição de o conteúdo existir. Três casos
 * em que ela não corre e o conteúdo tem de aparecer na mesma:
 *
 * 1. **Sem JavaScript** — `globals.css` mostra `[data-reveal]` enquanto o
 *    `<html>` não tiver a classe `js`, posta por um script em `app/layout.tsx`.
 * 2. **Movimento reduzido** — tratado abaixo. Não vem de borla como vinha no
 *    Motion: o `MotionConfig` desarmava as animações sozinho, o GSAP não.
 * 3. **Renderizadores headless** — previews de link, ferramentas de captura,
 *    separadores em segundo plano. O ScrollTrigger hidrata mas pode nunca
 *    disparar. Daí o temporizador de segurança: ao fim de 1,2 s mostra-se.
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

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      /* `opacity: 1` explícito, e nunca `clearProps: "all"`: devolver o
         elemento ao CSS devolve-o à regra que o esconde. */
      const mostrar = () =>
        gsap.set(el, { opacity: 1, y: 0, clearProps: "transform" });

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        mostrar();
        return;
      }

      const tl = gsap.timeline({
        delay,
        scrollTrigger: {
          trigger: el,
          /* 90% da altura do ecrã: o bloco começa a entrar assim que assoma,
             não quando já está a meio da vista. */
          start: "top 90%",
          once: true,
        },
      });

      tl.fromTo(
        el,
        { opacity: 0, y: MOVIMENTO.y },
        { opacity: 1, duration: MOVIMENTO.escala, ease: MOVIMENTO.ease },
        0,
      ).to(el, { y: 0, duration: MOVIMENTO.entrada, ease: MOVIMENTO.ease }, 0);

      /* Rede de segurança: se ao fim de 1,2 s o gatilho não disparou, mostra-se.
         `progress() === 0` distingue "nunca começou" de "está a meio". */
      const t = setTimeout(() => {
        if (tl.progress() === 0) {
          tl.kill();
          mostrar();
        }
      }, 1200);

      return () => clearTimeout(t);
    },
    { scope: ref, dependencies: [delay] },
  );

  return (
    <div ref={ref} data-reveal className={className}>
      {children}
    </div>
  );
}
