/** docs: docs/01-marca.md — o email e as redes vêm de lib/site.ts. */
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/Wordmark";
import { site, socials } from "@/lib/site";

const nav = [
  { href: "/servicos", label: "Serviços" },
  { href: "/portfolio", label: "Portfólio" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contacto", label: "Contacto" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <Container className="py-16">
        <div className="flex flex-col gap-8 border-b border-border pb-12 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Vamos somar ao teu próximo projeto.
          </h2>
          <Button href="/contacto" variant="primary">
            Falar connosco
          </Button>
        </div>

        <div className="grid gap-10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Wordmark />
            <p className="mt-4 max-w-xs text-sm text-muted">
              Estúdio de web design e desenvolvimento. Sites, menus digitais e
              plataformas para negócios que gostam de mandar no que é seu.
            </p>
          </div>

          <nav aria-label="Rodapé">
            <h3 className="text-sm font-medium text-ink">Navegação</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {nav.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-medium text-ink">Contacto</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="text-sm text-muted transition-colors hover:text-ink"
                >
                  {site.email}
                </a>
              </li>
            </ul>

            <h3 className="mt-6 text-sm font-medium text-ink">Redes</h3>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {socials.map((s) => (
                <li key={s.label}>
                  {s.href ? (
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted transition-colors hover:text-ink"
                    >
                      {s.label}
                    </a>
                  ) : (
                    <span className="text-sm text-muted/60">{s.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          {/* Sem ano: a página é estática, `getFullYear()` congelava no ano da
              build e o rodapé passava janeiro a mentir até ao próximo deploy. */}
          <p>© {site.name}. Todos os direitos reservados.</p>
          <Link
            href="/privacidade"
            className="transition-colors hover:text-ink"
          >
            Política de Privacidade
          </Link>
        </div>
      </Container>
    </footer>
  );
}
