"use client";

import { ReactLenis } from "lenis/react";
import { MotionConfig } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Global client providers:
 * - Lenis smooth scroll (root), disabled when the user prefers reduced motion.
 * - MotionConfig with reducedMotion="user" so all Motion animations honor the
 *   OS setting automatically.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const [smooth, setSmooth] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSmooth(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <ReactLenis
        root
        options={{ lerp: 0.1, smoothWheel: smooth, touchMultiplier: 1.5 }}
      >
        {children}
      </ReactLenis>
    </MotionConfig>
  );
}
