/** docs: docs/04-componentes-e-padroes.md */
import { cn } from "@/lib/utils";

/**
 * O espaçamento vertical entre blocos vive aqui e em mais lado nenhum.
 *
 * As duas metades são classes separadas — e não um `py-*` — porque desligar uma
 * delas tem de ser **ausência de classe**, não uma classe a anular outra.
 * `<Section className="pt-0">` parecia fazê-lo e não fazia: o `pt-0` só ganha ao
 * `py-16` sem media query, e `sm:py-24`/`lg:py-32` são escritos depois no CSS
 * gerado, portanto ganhavam de volta a partir dos 640px. O site inteiro andou
 * com o dobro do espaço entre secções encadeadas em desktop, e nenhum valor que
 * se afinasse no `className` o corrigia. Usa `top={false}` / `bottom={false}`.
 */
const ESPACO = {
  top: "pt-16 sm:pt-24 lg:pt-32",
  bottom: "pb-16 sm:pb-24 lg:pb-32",
} as const;

export function Section({
  id,
  className,
  top = true,
  bottom = true,
  children,
}: {
  id?: string;
  className?: string;
  /** `false` numa secção encadeada — o espaço vem do `bottom` da anterior. */
  top?: boolean;
  /** `false` para a próxima secção encostar a esta. */
  bottom?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(top && ESPACO.top, bottom && ESPACO.bottom, className)}
    >
      {children}
    </section>
  );
}
