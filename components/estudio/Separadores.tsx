/** docs: docs/07-estudio.md */
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icone, type NomeDoIcone } from "@/components/estudio/Icone";
import { PREFIXO_ESTUDIO } from "@/lib/estudio/rotas";
import { cn } from "@/lib/utils";

/**
 * As secções do Estúdio, sempre à vista, com a que está aberta preenchida.
 *
 * Vivem no `Cabecalho`, que vive no layout de `app/estudio/(dentro)/` — e um
 * layout não se desenha outra vez ao mudar de secção. É isso que faz a mudança
 * ser suave: o topo fica, só o conteúdo de baixo troca.
 *
 * É de cliente por uma razão só: saber onde se está (`usePathname`). O
 * `SubNavegacao` das Finanças recebe o `atual` por prop e fica no servidor; aqui
 * não dá, porque o layout não volta a correr ao navegar e não saberia qual
 * acender.
 *
 * `base` e não `href` para decidir qual acende: as Finanças abrem nas Receitas,
 * mas são as Finanças também nos Gastos.
 */
const SECCOES: { href: string; base: string; nome: string; icone: NomeDoIcone }[] = [
  { href: PREFIXO_ESTUDIO, base: PREFIXO_ESTUDIO, nome: "Resumo", icone: "resumo" },
  { href: `${PREFIXO_ESTUDIO}/projetos`, base: `${PREFIXO_ESTUDIO}/projetos`, nome: "Projetos", icone: "projetos" },
  { href: `${PREFIXO_ESTUDIO}/clientes`, base: `${PREFIXO_ESTUDIO}/clientes`, nome: "Clientes", icone: "clientes" },
  { href: `${PREFIXO_ESTUDIO}/financas/receitas`, base: `${PREFIXO_ESTUDIO}/financas`, nome: "Finanças", icone: "financas" },
  { href: `${PREFIXO_ESTUDIO}/sessoes`, base: `${PREFIXO_ESTUDIO}/sessoes`, nome: "Sessões", icone: "sessoes" },
];

/* O Resumo só acende quando é mesmo o Resumo — senão, sendo o prefixo de todas,
   acendia em todas. O `importar` é a outra porta de entrada dos projetos, e
   acende os Projetos: é de lá que se chega, e é para lá que se volta. */
function ativa(caminho: string, base: string): boolean {
  if (base === PREFIXO_ESTUDIO) return caminho === base;
  if (base === `${PREFIXO_ESTUDIO}/projetos` && caminho.startsWith(`${PREFIXO_ESTUDIO}/importar`)) return true;
  return caminho === base || caminho.startsWith(`${base}/`);
}

export function Separadores() {
  const caminho = usePathname();
  const fila = useRef<HTMLElement>(null);

  /* No telemóvel a fila rola de lado e as Finanças ficavam fora do ecrã, sem se
     ver onde se está. Centra-se o separador ativo — à mão, e não com
     `scrollIntoView`, que também rolava a página inteira. */
  useEffect(() => {
    const nav = fila.current;
    const ativo = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !ativo) return;
    nav.scrollTo({
      left: ativo.offsetLeft - (nav.clientWidth - ativo.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [caminho]);

  return (
    <nav
      ref={fila}
      aria-label="Secções do Estúdio"
      className="order-last flex basis-full gap-1 overflow-x-auto rounded-full border border-border bg-surface p-1 [scrollbar-width:none] md:order-none md:basis-auto [&::-webkit-scrollbar]:hidden"
    >
      {SECCOES.map(({ href, base, nome, icone }) => {
        const aqui = ativa(caminho, base);
        return (
          <Link
            key={href}
            href={href}
            aria-current={aqui ? "page" : undefined}
            className={cn(
              "inline-flex min-h-10 flex-none items-center gap-2 rounded-full px-4 text-sm whitespace-nowrap transition-colors duration-200",
              /* `primary-ink` sobre `primary`: o par que docs/02 mede a 7.26:1. */
              aqui
                ? "bg-primary font-medium text-primary-ink"
                : "text-muted hover:bg-surface-2 hover:text-ink",
            )}
          >
            <Icone nome={icone} tamanho={17} />
            {nome}
          </Link>
        );
      })}
    </nav>
  );
}
