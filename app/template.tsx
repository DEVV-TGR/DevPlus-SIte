"use client";

import { motion } from "motion/react";

/**
 * Per-navigation page transition. `template.tsx` remounts on each route change,
 * so the page content fades/slides in while Nav and Footer (in layout) persist.
 * Subtle by design; honors reduced motion via MotionConfig in Providers.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
