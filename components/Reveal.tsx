"use client";
/** docs: docs/04-componentes-e-padroes.md — durações e easing são especificados aí. */

import { motion, type Variants } from "motion/react";

const variants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

/**
 * Scroll-triggered reveal. Subtle by design; MotionConfig (reducedMotion="user")
 * strips the transform for users who prefer reduced motion.
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
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
