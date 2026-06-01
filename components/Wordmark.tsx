import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

/**
 * Logo lockup: the XquisiteVision eye-X mark + wordmark.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="XquisiteVision — página inicial"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <Logo className="h-7 w-7 shrink-0 transition-transform duration-300 group-hover:scale-110" />
      <span className="font-display text-[1.05rem] font-semibold tracking-tight">
        XquisiteVision
      </span>
    </Link>
  );
}
