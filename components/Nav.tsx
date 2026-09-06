/** docs: docs/04-componentes-e-padroes.md */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { gsap, useGSAP, MOVIMENTO } from "@/lib/motion";

const links = [
  { href: "/", label: "Início" },
  { href: "/servicos", label: "Serviços" },
  { href: "/portfolio", label: "Portfólio" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contacto", label: "Contacto" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  /* O painel só sai do DOM depois de a animação de saída acabar. */
  const [montado, setMontado] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const listaRef = useRef<HTMLUListElement>(null);
  const risco = useRef<HTMLSpanElement>(null);
  const painel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Com o menu aberto: Escape fecha, e o fundo deixa de deslizar por trás dele.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowAnterior;
    };
  }, [open]);

  /* Montar no clique, e não num efeito: o painel tem de existir no DOM antes
     de o GSAP lhe pegar, e um `setState` dentro de um efeito custa um render a
     mais por nada. */
  const alternarMenu = () => {
    if (!open) setMontado(true);
    setOpen((v) => !v);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  /*
    O sublinhado é **um só elemento** que viaja entre os links, e não um por
    link a aparecer e a desaparecer. É a diferença entre o menu parecer um
    mecanismo e parecer cinco luzes a piscar.

    O Motion fazia isto com `layoutId` e media as duas posições sozinho. Em
    GSAP mede-se à mão: a posição do link ativo dentro da lista, e o `x` e a
    largura animam para lá. O `Flip` do GSAP fazia o mesmo com menos código, mas
    é plugin do Club — e para um risco de 2px não se justifica pedi-lo.
  */
  useGSAP(
    () => {
      const lista = listaRef.current;
      const barra = risco.current;
      if (!lista || !barra) return;

      const ativo = lista.querySelector<HTMLElement>("[data-ativo='true']");
      if (!ativo) {
        gsap.to(barra, { opacity: 0, duration: 0.15 });
        return;
      }

      const cx = lista.getBoundingClientRect();
      const cl = ativo.getBoundingClientRect();
      const destino = { x: cl.left - cx.left, width: cl.width, opacity: 1 };

      /* Na primeira pintura não há de onde viajar: aparece onde tem de estar. */
      if (gsap.getProperty(barra, "opacity") === 0) {
        gsap.set(barra, destino);
        return;
      }

      gsap.to(barra, {
        ...destino,
        duration: MOVIMENTO.entrada,
        ease: MOVIMENTO.ease,
      });
    },
    { dependencies: [pathname], scope: listaRef },
  );

  /* Abertura e fecho do painel de telemóvel. */
  useGSAP(
    () => {
      const el = painel.current;
      if (!el) return;

      if (open) {
        gsap.fromTo(
          el,
          { opacity: 0, y: -8 },
          {
            opacity: 1,
            y: 0,
            duration: MOVIMENTO.menu,
            ease: MOVIMENTO.ease,
          },
        );
      } else {
        gsap.to(el, {
          opacity: 0,
          y: -8,
          duration: MOVIMENTO.menu,
          ease: MOVIMENTO.ease,
          onComplete: () => setMontado(false),
        });
      }
    },
    { dependencies: [open, montado], scope: painel },
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        scrolled || open
          ? "border-b border-border bg-bg/80 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <nav aria-label="Principal">
        <Container className="flex h-16 items-center justify-between">
          <Wordmark />

          <ul ref={listaRef} className="relative hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = isActive(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    data-ativo={active}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative block rounded-full px-3.5 py-2 text-sm transition-colors",
                      active ? "text-ink" : "text-muted hover:text-ink",
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
            {/* Decorativo: quem usa leitor de ecrã tem o `aria-current`. */}
            <span
              ref={risco}
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full bg-primary opacity-0"
            />
          </ul>

          <div className="hidden md:block">
            <Button href="/contacto" variant="primary">
              Falar connosco
            </Button>
          </div>

          <button
            type="button"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={alternarMenu}
            className="-mr-2 grid h-11 w-11 place-items-center rounded-lg text-ink hover:bg-surface md:hidden"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden
            >
              {open ? (
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3 6h14M3 10h14M3 14h14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </Container>
      </nav>

      {montado && (
        <div
          ref={painel}
          onClick={() => setOpen(false)}
          className="absolute left-0 right-0 top-full border-b border-border bg-bg px-6 pb-6 pt-2 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={cn(
                    "block rounded-lg px-3 py-3 text-base transition-colors",
                    isActive(l.href)
                      ? "bg-surface text-ink"
                      : "text-muted hover:bg-surface hover:text-ink",
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Button href="/contacto" variant="primary" className="w-full">
              Falar connosco
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
