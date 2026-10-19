/** docs: docs/10-materiais-atelier.md */
"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";
import { attachPointerMaterial } from "./pointerMaterial";
import styles from "./atelier.module.css";

export type MaterialSurfaceProps = HTMLAttributes<HTMLDivElement> & {
  finish?: "graphite" | "silver" | "forest" | "aluminio";
  interactive?: boolean;
  padding?: "default" | "none";
  contentClassName?: string;
};

/** Place the consumer's scroll/GSAP transform on the OUTSIDE wrapper. */
export function MaterialSurface({
  finish = "graphite",
  interactive = true,
  padding = "default",
  className,
  contentClassName,
  children,
  ...rest
}: MaterialSurfaceProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const face = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!interactive || !wrapper.current || !face.current) return;
    return attachPointerMaterial(wrapper.current, face.current);
  }, [interactive]);

  return (
    <div
      {...rest}
      ref={wrapper}
      className={[styles.material, className].filter(Boolean).join(" ")}
      data-atelier-surface={finish}
    >
      <div ref={face} className={styles.face} data-atelier-face>
        <div aria-hidden="true" className={styles.grain} />
        <div aria-hidden="true" className={styles.reflection} />
        <div
          data-padding={padding}
          className={[styles.content, contentClassName].filter(Boolean).join(" ")}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
