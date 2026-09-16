/** docs: docs/04-componentes-e-padroes.md */
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "contraste";

type Props = {
  href?: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

/* Sem `focus-visible:outline-none`: o contorno global de `app/globals.css` é o
   único indicador de foco que o site tem, e anulá-lo aqui apagava-o em todos os
   botões e CTAs de uma vez — ver docs/04, "Acessibilidade". */
const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-ink hover:bg-primary-strong",
  outline:
    "border border-border-strong text-ink hover:border-ink/40 hover:bg-surface",
  ghost: "text-muted hover:bg-surface hover:text-ink",
  /* O CTA **sobre o ground laranja**, onde o `primary` desapareceria: laranja
     sobre laranja não é um botão. Escuro e opaco (7.26:1 medido, ver docs/02),
     e no hover inverte para creme — é o único sítio do site onde um botão
     troca de ground, e é de propósito: é o botão do fim do percurso. */
  contraste:
    "bg-primary-ink text-ink hover:bg-ink hover:text-primary-ink",
};

export function Button({
  href,
  variant = "primary",
  className,
  children,
  ...rest
}: Props) {
  const cls = cn(base, variants[variant], className);

  if (href) {
    if (href.startsWith("http")) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cls}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
