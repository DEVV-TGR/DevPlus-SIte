type LogoProps = {
  className?: string;
  /** Outline / mono version (uses currentColor) — for large background motifs. */
  outline?: boolean;
};

/**
 * XquisiteVision mark — a bold "X" with the "Vision" eye at its center.
 * Recreated as a vector (transparent, theme-matched) from the brand logo.
 * The full version uses the brand orange (var --color-primary) for the X and a
 * black/white eye; the outline version draws everything in currentColor.
 */
export function Logo({ className, outline = false }: LogoProps) {
  if (outline) {
    return (
      <svg
        viewBox="0 0 100 100"
        className={className}
        aria-hidden
        xmlns="http://www.w3.org/2000/svg"
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="14" y1="14" x2="86" y2="86" />
          <line x1="86" y1="14" x2="14" y2="86" />
          <path d="M30 50 Q50 32 70 50 Q50 68 30 50 Z" />
          <circle cx="50" cy="50" r="11" />
          <circle cx="50" cy="50" r="3.5" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* X — two bold crossing bars (solid brand orange) */}
      <g stroke="var(--color-primary)" strokeWidth="26">
        <line x1="12" y1="12" x2="88" y2="88" />
        <line x1="88" y1="12" x2="12" y2="88" />
      </g>
      {/* Eye — the "Vision" motif, sitting over the X crossing */}
      <path d="M32 50 Q50 34 68 50 Q50 66 32 50 Z" fill="#000000" />
      <path d="M37 50 Q50 40 63 50 Q50 60 37 50 Z" fill="#ffffff" />
      <circle cx="50" cy="50" r="11" fill="#000000" />
      <circle cx="50" cy="50" r="4" fill="#ffffff" />
    </svg>
  );
}
