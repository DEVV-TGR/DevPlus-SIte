/** docs: docs/10-materiais-atelier.md */
"use client";

import { useEffect, useRef } from "react";
import { attachPointerMaterial } from "./pointerMaterial";
import styles from "./atelier.module.css";

/**
 * O fundo material de um capítulo: uma família de luz e textura, cinco
 * acabamentos. Cristal e vidro têm planos largos e reagem ao ponteiro fino;
 * metal são dobras finas maquinadas; cetim uma dobra macia; mate só grão e luz.
 *
 * Vive **dentro** de um capítulo com `relative isolate` e lê de lá duas
 * variáveis: `--ground` (a cor do capítulo) e `--fg` (a tinta). As classes
 * `capitulo-*` do `app/globals.css` definem-nas por papel, e o tema troca-as.
 * O véu vai do ground opaco à esquerda, onde se lê, a quase transparente à
 * direita, onde ficam os planos. Decorativo: `aria-hidden`, sem eventos.
 */
export type Acabamento = "crystal" | "metal" | "glass" | "satin" | "matte";

const PLANOS: Record<Acabamento, number> = {
  crystal: 2,
  metal: 4,
  glass: 2,
  satin: 1,
  matte: 0,
};

export function MaterialGround({ finish = "crystal" }: { finish?: Acabamento }) {
  const camada = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = camada.current;
    if (!el?.parentElement || (finish !== "crystal" && finish !== "glass")) return;
    return attachPointerMaterial(el.parentElement, el);
  }, [finish]);

  return (
    <div
      ref={camada}
      aria-hidden="true"
      data-finish={finish}
      className={styles.ground}
    >
      <div className={styles.groundGrain} />
      <div className={styles.groundSculpture}>
        {Array.from({ length: PLANOS[finish] }, (_, i) => (
          <i key={i} />
        ))}
      </div>
      <div className={styles.groundVeil} />
      <div className={styles.groundLight} />
    </div>
  );
}
