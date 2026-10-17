/** docs: docs/10-materiais-atelier.md */
"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { atelierAssets } from "./assets";
import { attachPointerMaterial } from "./pointerMaterial";
import styles from "./atelier.module.css";

export type AtelierBackdropProps = {
  theme?: "dark" | "forest";
  intensity?: "quiet" | "standard";
  interactive?: boolean;
  /** Defaults to the direct parent. Pass an existing section id when needed. */
  targetId?: string;
  className?: string;
  /** `eager` quando o fundo está acima da dobra: aí é a imagem LCP da página,
   *  e em `lazy` o browser só a pedia depois de desenhar o resto. */
  loading?: "lazy" | "eager";
};

/** Decorative absolute sibling: parent relative/isolate, content relative/z-10. */
export function AtelierBackdrop({
  theme = "dark",
  intensity = "quiet",
  interactive = false,
  targetId,
  className,
  loading = "lazy",
}: AtelierBackdropProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const output = ref.current;
    if (!interactive || !output) return;
    const target = targetId
      ? document.getElementById(targetId)
      : output.parentElement;
    // An invalid explicit target keeps the decoration static.
    if (!target) return;
    return attachPointerMaterial(target, output);
  }, [interactive, targetId]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-atelier-backdrop={theme}
      data-intensity={intensity}
      className={[styles.backdrop, className].filter(Boolean).join(" ")}
    >
      <div className={styles.environment}>
        <Image
          src={atelierAssets.environment.src}
          alt=""
          fill
          sizes="100vw"
          loading={loading}
          className={styles.environmentImage}
        />
      </div>
      <div className={styles.veil} />
      <div className={styles.ambientLight} />
    </div>
  );
}
