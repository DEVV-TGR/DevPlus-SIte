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
      /* `py-2.5` e o `-my-2.5` que o compensa: a área tocável passa a 44px de
         alto sem o logótipo mudar de sítio nem de tamanho. O desenho fica
         onde estava; o dedo é que passa a acertar-lhe. */
      className={cn("group -mx-2 -my-2.5 inline-flex items-center px-2 py-2.5", className)}
    >
      <Lockup animated className="h-6 w-auto shrink-0" />
    </Link>
  );
}
