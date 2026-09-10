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

  /**
   * A carta que assenta. `back.out` passa do destino e volta — é o encaixe que
   * distingue uma carta atirada para a mesa de uma caixa que trava a direito no
   * sítio. Não sai da medição: sai de uma carta a pousar, e o `1.4` (contra o
   * `1.7` que o GSAP traz de origem) mantém o ressalto abaixo dos 10%, que é o
   * limite a partir do qual isto começa a parecer um brinquedo.
   *
   * **Só para gestos com percurso** — posição e rotação. Numa opacidade ou numa
   * cor, ultrapassar o destino é um `flash`, não é um gesto.
   */
  easeCarta: "back.out(1.4)",

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
} as const;

export { gsap, ScrollTrigger, useGSAP };
