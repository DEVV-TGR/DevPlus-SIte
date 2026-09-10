/** docs: docs/04-componentes-e-padroes.md — os valores daqui são especificados aí. */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/*
  O registo corre uma vez, no cliente. O `ScrollTrigger` toca no `window` logo
  no registo, por isso não pode acontecer no servidor — e todos os componentes
  que animam são `"use client"`, portanto importam este módulo já no browser.
*/
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/**
 * A gramática de movimento do site, num sítio só.
 *
 * Os números não são gosto: saíram da medição em `docs/motion-reference.md`,
 * feita com um gravador a 120 fps sobre um site de referência. Se mudares um
 * valor aqui, muda-o no `docs/04` — e não escrevas durações à mão nos
 * componentes, senão em dois meses há três vocabulários no mesmo site.
 */
export const MOVIMENTO = {
  /** Entrada de um bloco no scroll. Medido: 475 ms. */
  entrada: 0.475,

  /**
   * A escala assenta **antes** da posição — 290 ms contra 475 ms. É este
   * desencontro que dá peso à entrada; com uma duração só, o bloco chega
   * inteiro de uma vez e lê-se como um `fade` com deslocamento.
   */
  escala: 0.29,

  /**
   * A entrada da página é quase o dobro da entrada de um bloco. Medido: 981 ms.
   * Só se pode ser assim lento uma vez, à chegada — em cada secção do scroll
   * isto seria insuportável.
   */
  hero: 0.95,

  /** Transição entre páginas. Herdada do site, não medida lá: eles não têm. */
  pagina: 0.45,

  /** Abertura e fecho do menu. Curta de propósito: é resposta a um clique. */
  menu: 0.28,

  /**
   * Medido: a 25% do tempo o percurso vai em 54%, a 50% em 84%.
   * É `power2.out`, e é **mais suave** do que a curva que o site usava antes
   * (`[0.22, 1, 0.36, 1]`, que a meio do tempo já ia em 96%). A antiga dispara
   * e trava; esta desacelera durante mais tempo.
   */
  ease: "power2.out",

  /** Entre irmãos. Medido: 150 ms — o dobro dos 60–80 ms de antes. */
  stagger: 0.15,

  /** Entre as linhas do título de entrada. Medido: 198 ms. */
  staggerHero: 0.2,

  /**
   * Deslocamento de entrada, em px. Medido: 44 px no texto (contra os 16 px
   * que o site usava). É o que distingue "aparecer" de "chegar".
   */
  y: 44,

  /**
   * Escala de partida. No site de referência é 0.87, mas ali aplica-se a texto
   * display em caixa alta; no nosso corpo de texto essa distorção lê-se como
   * uma falha de renderização a meio da animação. 0.94 faz o mesmo gesto sem
   * o defeito.
   */
  escalaDe: 0.94,

  /**
   * A **pausa** de uma secção pinada, em ecrãs de scroll: o tramo morto antes
   * de a animação arrancar, e outro igual depois de ela acabar.
   *
   * Não é tempo. Numa secção com `scrub` o relógio é a roda do rato, por isso
   * a pausa mede-se em espaço — 0,35 de um ecrã de scroll com a página presa
   * e nada a mexer.
   *
   * Existe porque os capítulos se encadeavam sem respiro: cada um começava a
   * animar no instante em que o anterior acabava, e o primeiro card de uma
   * secção já entrava enquanto a anterior ainda saía. Nunca havia um momento
   * em que se visse **um capítulo parado e inteiro** — que é o que a pausa da
   * saída mostra, e o que a da entrada anuncia.
   */
  pausa: 0.35,

  /**
   * A mesma pausa no telemóvel, e é mais curta por aritmética: são três
   * secções pinadas, cada pausa conta duas vezes, e a homepage tem um teto de
   * ecrãs que o `scripts/verificar-scroll.mjs` guarda. Medido: a 0,35 a página
   * ia a 15 ecrãs; a 0,15 ficava em 13,8 contra um teto de 14, o que gastava a
   * margem toda e deixava o travão a disparar ao primeiro que lhe tocasse. Um
   * décimo de ecrã são ~84px de pausa num iPhone, e a página fica em 13,5.
   */
  pausaMovel: 0.1,
} as const;

/**
 * O percurso de uma secção pinada, **com a pausa nos dois extremos**.
 *
 * Recebe o comprimento da animação em px — o que a secção precisa para contar
 * o que tem — e devolve o `end` já com as duas pausas somadas, mais a
 * conversão do progresso do trigger de volta ao tramo do meio.
 *
 * Chama-se **dentro** do `end: () => …` e do `onUpdate`, nunca uma vez na
 * montagem: a pausa é uma fração da altura do ecrã, e o ecrã muda de tamanho e
 * de breakpoint sem o componente voltar a montar.
 */
export function comPausa(animacao: number) {
  const pausa =
    window.innerHeight *
    (window.matchMedia("(max-width: 767px)").matches
      ? MOVIMENTO.pausaMovel
      : MOVIMENTO.pausa);
  const total = animacao + pausa * 2;

  return {
    /** O percurso todo, em px. É isto que vai para o `end` do trigger. */
    total,
    /**
     * A pausa em fração do percurso, para quem escreve a animação numa
     * timeline: lá as durações são relativas, e o `scrub` estica-as para caber
     * no percurso todo.
     */
    fracao: pausa / total,
    /**
     * O progresso do trigger recortado à animação: fica em 0 enquanto a pausa
     * de entrada corre, e em 1 durante a de saída.
     */
    progresso: (p: number) =>
      animacao > 0 ? gsap.utils.clamp(0, 1, (p * total - pausa) / animacao) : 0,
  };
}

export { gsap, ScrollTrigger, useGSAP };
