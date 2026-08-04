/** docs: docs/03-simbolo-e-logotipo.md — o lockup "Dev+" é especificado aí. */
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { site } from "@/lib/site";

/**
 * O lockup da marca: "Dev" + o símbolo a fazer de "+".
 *
 * O "+" é o próprio `Logo`, não um caractere — assim a marca desenhada (favicon,
 * cartão social) e a marca escrita são o mesmo objeto. O `aria-label` é
 * obrigatório porque o `Logo` é `aria-hidden`; sem ele lia-se só "Dev".
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} — página inicial`}
      className={cn("group inline-flex items-center gap-1", className)}
    >
      <span className="font-display text-[1.05rem] font-semibold tracking-tight">
        Dev
      </span>
      <Logo className="h-[0.78em] w-[0.78em] shrink-0 text-primary transition-transform duration-300 group-hover:rotate-90" />
    </Link>
  );
}
