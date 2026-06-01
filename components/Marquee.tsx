"use client";

import { cn } from "@/lib/utils";

/**
 * Infinite horizontal marquee. Content is duplicated so a -50% translate loops
 * seamlessly. Pauses on hover; decorative (aria-hidden); freezes gracefully
 * under prefers-reduced-motion (global rule neutralizes the animation).
 */
export function Marquee({
  items,
  className,
  duration = 32,
}: {
  items: string[];
  className?: string;
  duration?: number;
}) {
  const track = [...items, ...items];

  return (
    <div aria-hidden className="group flex overflow-hidden">
      <div
        className={cn(
          "flex w-max shrink-0 animate-marquee items-center group-hover:[animation-play-state:paused]",
          className,
        )}
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        {track.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="px-6 sm:px-10">{item}</span>
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full bg-primary"
            />
          </span>
        ))}
      </div>
    </div>
  );
}
