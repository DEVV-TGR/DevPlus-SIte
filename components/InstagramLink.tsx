/** docs: docs/01-marca.md — redes vêm de `lib/site.ts`. */
import { instagram, perfil } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * O Instagram, com o perfil escrito: "Instagram · @devplus.pt". Abre numa aba
 * nova. O endereço e o nome vêm de `socials` em `lib/site.ts`; se a conta
 * deixar de ter `href`, isto não desenha nada.
 *
 * `compacto` mostra só o ícone e o perfil, para a navegação de desktop, onde
 * a palavra "Instagram" já não cabe ao lado das cinco ligações.
 */
export function InstagramLink({
  className,
  compacto = false,
}: {
  className?: string;
  compacto?: boolean;
}) {
  if (!instagram?.href) return null;
  const nome = perfil(instagram);
  return (
    <a
      href={instagram.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Instagram ${nome ?? ""} (abre numa aba nova)`.replace("  ", " ")}
      className={cn("inline-flex min-h-11 items-center gap-2.5 text-sm", className)}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden className="shrink-0">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.7" fill="currentColor" />
      </svg>
      <span>{compacto ? nome : `Instagram · ${nome}`}</span>
    </a>
  );
}
