/** docs: docs/04-componentes-e-padroes.md */
import { cn } from "@/lib/utils";

export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("py-16 sm:py-24 lg:py-32", className)}>
      {children}
    </section>
  );
}
