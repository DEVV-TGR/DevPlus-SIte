import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/Wordmark";

const nav = [
  { href: "/servicos", label: "Serviços" },
  { href: "/portfolio", label: "Portfólio" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contacto", label: "Contacto" },
];

const socials = [
  { href: "https://www.instagram.com/xquisitevision", label: "Instagram" },
  { href: "https://www.linkedin.com/company/xquisitevision", label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <Container className="py-16">
        <div className="flex flex-col gap-8 border-b border-border pb-12 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Vamos criar algo extraordinário.
          </h2>
          <Button href="/contacto" variant="primary">
            Começar um projeto
          </Button>
        </div>

        <div className="grid gap-10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Wordmark />
            <p className="mt-4 max-w-xs text-sm text-muted">
              Estúdio independente de web design e desenvolvimento. Desenhamos e
              construímos sites e produtos digitais ao detalhe.
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
                  href="mailto:ola@xquisitevision.pt"
                  className="text-sm text-muted transition-colors hover:text-ink"
                >
                  ola@xquisitevision.pt
                </a>
              </li>
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} XquisiteVision. Todos os direitos
            reservados.
          </p>
          <Link href="/privacidade" className="transition-colors hover:text-ink">
            Política de Privacidade
          </Link>
        </div>
      </Container>
    </footer>
  );
}
