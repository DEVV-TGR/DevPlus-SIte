/** docs: docs/04-componentes-e-padroes.md — "O loader". */
"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { D_PATH, LOCKUP } from "@/lib/brand";

/**
 * O loader do site público: uma cortina com o "D+" — o "+" a rodar — e uma
 * barra fina, que abre para cima quando a página está pronta.
 *
 * **Na primeira entrada** vem já desenhado pelo servidor, por isso cobre a
 * página desde o primeiro paint. Sai quando o `load` da janela e as fontes
 * chegaram, nunca antes de 700 ms (senão era um piscar) e nunca depois de
 * 2,5 s (uma imagem lenta não prende ninguém à porta).
 *
 * **Em cada navegação** volta a cobrir — num `useLayoutEffect`, antes do
 * paint, para a página nova não aparecer um quadro por baixo — e abre ao fim
 * de 350 ms. A página já está montada por baixo; a cortina só dá a passagem.
 *
 * Sem JavaScript não existe (`html:not(.js)` no CSS): ninguém fica preso atrás
 * de uma cortina que nunca abre. E se a hidratação falhar, uma animação de
 * segurança esconde-a aos 4 s. Com movimento reduzido o "+" não roda e a
 * cortina sai de uma vez. Decorativo para leitores de ecrã (`aria-hidden`):
 * dura menos de um segundo e o título da página já diz onde se está.
 */
type Fase = "entra" | "sai" | "fora";

export function Carregador() {
  const pathname = usePathname();
  const [fase, setFase] = useState<Fase>("entra");
  const primeira = useRef(true);
  const desde = useRef(0);

  /* Navegação de cliente: cobre antes do paint. */
  useLayoutEffect(() => {
    if (primeira.current) return;
    desde.current = performance.now();
    setFase("entra");
  }, [pathname]);

  useEffect(() => {
    if (fase !== "entra") return;
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const inicial = primeira.current;
    primeira.current = false;
    /* Na primeira carga conta desde o início da navegação (`performance.now`
       começa aí); nas seguintes, desde que a cortina cobriu. */
    const inicio = inicial ? 0 : desde.current;
    const minimo = reduz ? 200 : inicial ? 700 : 350;
    let relogio = 0;
    let feito = false;

    const sair = () => {
      if (feito) return;
      feito = true;
      const falta = Math.max(0, minimo - (performance.now() - inicio));
      relogio = window.setTimeout(() => setFase("sai"), falta);
    };

    const teto = window.setTimeout(sair, inicial ? 2500 : 1200);
    if (!inicial) sair();
    else {
      const pronto = () => document.fonts.ready.then(sair, sair);
      if (document.readyState === "complete") pronto();
      else window.addEventListener("load", pronto, { once: true });
    }
    return () => {
      window.clearTimeout(teto);
      window.clearTimeout(relogio);
    };
  }, [fase, pathname]);

  if (fase === "fora") return null;

  return (
    <div
      className="carregador"
      data-fase={fase}
      aria-hidden
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget && fase === "sai") setFase("fora");
      }}
    >
      <div className="carregador-conteudo">
        <svg
          viewBox={LOCKUP.viewBox}
          className="carregador-marca"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={D_PATH} fill="currentColor" fillRule="evenodd" />
          <path d={LOCKUP.plusPath} className="carregador-mais" />
        </svg>
        <span className="carregador-barra" />
      </div>
    </div>
  );
}
