/** docs: docs/04-componentes-e-padroes.md — navegação e menu modal acessível. */
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";
import { InstagramLink } from "@/components/InstagramLink";
const links = [
  { href: "/", label: "Início" },
  { href: "/portfolio", label: "Portfólio" },
  { href: "/servicos", label: "Serviços" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contacto", label: "Contacto" },
];
export function Nav() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const close = () => dialog.current?.close();
  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onResize = () => {
      if (window.innerWidth >= 768) dialog.current?.close();
    };
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("resize", onResize);
    };
  }, [open]);
  return (
    <>
    <header className="site-header sticky top-0 z-50">
      <Container>
        <nav
          aria-label="Principal"
          className="flex h-20 items-center justify-between gap-4"
        >
          <Wordmark />
          <ul className="nav-glass-links hidden items-center gap-1 rounded-full px-2 py-1 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active(l.href) ? "page" : undefined}
                  className={`nav-link ${active(l.href) ? "nav-link-active" : ""}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="hidden items-center gap-4 md:flex">
            {/* O perfil do Instagram só a partir de 1280px: entre 768 e 1279
                as cinco ligações e o CTA já ocupam a barra. No menu do
                telemóvel aparece sempre. */}
            <InstagramLink compacto className="hidden text-muted transition-colors hover:text-ink xl:inline-flex" />
            <Button href="/contacto">
              Vamos conversar <span aria-hidden>↗</span>
            </Button>
          </div>
          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => {
              dialog.current?.showModal();
              setOpen(true);
            }}
            className="inline-flex min-h-11 items-center gap-3 px-2 text-sm md:hidden"
          >
            Menu{" "}
            <span aria-hidden className="text-2xl text-acento">
              +
            </span>
          </button>
        </nav>
      </Container>
    </header>
      <dialog
        id="mobile-navigation"
        ref={dialog}
        aria-label="Menu principal"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="mobile-navigation"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">{site.name}</span>
          <button
            type="button"
            autoFocus
            aria-label="Fechar menu"
            onClick={close}
            className="inline-flex min-h-11 items-center gap-3 px-2 text-sm"
          >
            Fechar{" "}
            <span aria-hidden className="text-2xl text-acento">
              ×
            </span>
          </button>
        </div>
        <nav aria-label="Navegação mobile" className="py-4">
          <ul>
            {links.map((l, i) => (
              <li key={l.href} className="border-b border-border">
                <Link
                  href={l.href}
                  onClick={close}
                  aria-current={active(l.href) ? "page" : undefined}
                  className={`flex min-h-14 items-center justify-between gap-4 py-3 font-display text-[1.75rem] font-semibold tracking-tight ${active(l.href) ? "text-acento" : "text-ink"}`}
                >
                  {l.label}
                  <span aria-hidden className="text-sm text-muted">
                    0{i + 1}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <InstagramLink className="mb-4 text-ink" />
        <p className="text-sm text-muted">
          Uma ideia?{" "}
          <a
            href={`mailto:${site.email}`}
            className="inline-flex min-h-11 items-center text-ink underline underline-offset-4"
          >
            {site.email}
          </a>
        </p>
      </dialog>
    </>
  );
}
