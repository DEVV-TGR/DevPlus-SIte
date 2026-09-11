/** docs: docs/07-estudio.md */
import Link from "next/link";
import { pastilhaFiltro } from "@/components/estudio/estilos";

/**
 * Os dois lados das Finanças: o que entra e o que sai.
 *
 * **Recebe o separador ativo por prop** em vez de o descobrir com o
 * `usePathname`. Descobri-lo obrigava a `"use client"`, e isto é uma barra de
 * dois links que o servidor já sabe desenhar — o Estúdio funciona sem JS de
 * cliente e não há razão para esta barra ser a primeira exceção. É o mesmo
 * arranjo do `SeletorDePeriodo`, que também recebe o `atual` de quem o usa.
 *
 * As pastilhas são as do `pastilhaFiltro()`, e não umas novas: já é a primitiva
 * de "um de vários, escolhido" em duas páginas, e uma terceira cópia divergia
 * no dia em que alguém mudasse a cor num sítio só.
 */
const SECCOES = [
  { chave: "receitas", href: "/estudio/financas/receitas", rotulo: "Receitas" },
  { chave: "gastos", href: "/estudio/financas/gastos", rotulo: "Gastos" },
] as const;

export type SeccaoFinanceira = (typeof SECCOES)[number]["chave"];

export function SubNavegacao({ atual }: { atual: SeccaoFinanceira }) {
  return (
    <nav aria-label="Finanças" className="mt-6">
      <ul className="flex flex-wrap items-center gap-2">
        {SECCOES.map((s) => {
          const escolhida = s.chave === atual;
          return (
            <li key={s.chave}>
              <Link
                href={s.href}
                aria-current={escolhida ? "page" : undefined}
                className={pastilhaFiltro(escolhida)}
              >
                {s.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
