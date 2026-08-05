/** docs: docs/03-simbolo-e-logotipo.md — o logótipo "D+" é especificado aí. */
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Lockup } from "@/components/Lockup";
import { site } from "@/lib/site";

/**
 * A marca clicável: o logótipo "D+" a levar à página inicial.
 *
 * O `aria-label` é obrigatório porque o `Lockup` é `aria-hidden` — sem ele o
 * leitor de ecrã anunciava só "link".
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} — página inicial`}
      className={cn("group inline-flex items-center", className)}
    >
      <Lockup animated className="h-6 w-auto shrink-0" />
    </Link>
  );
}
