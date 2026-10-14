/** docs: docs/07-estudio.md */
import Link from "next/link";
import { Icone, type NomeDoIcone } from "@/components/estudio/Icone";
import { cn } from "@/lib/utils";

/**
 * Os dois lados das Finanças: o que entra e o que sai.
 *
 * **Recebe o separador ativo por prop** em vez de o descobrir com o
 * `usePathname`. Descobri-lo obrigava a `"use client"`, e isto é uma barra de
 * dois links que o servidor já sabe desenhar. Os `Separadores` do topo não
 * conseguem fazer o mesmo — vivem num layout, que não volta a correr ao navegar
 * — mas esta barra vive na página, e a página sabe onde está.
 *
 * É a mesma pastilha dos `Separadores`, em pequeno e sem o laranja: o laranja
 * cheio diz "a secção onde estás", e uma segunda pastilha laranja logo por baixo
 * diria a mesma coisa duas vezes. Aqui a escolhida só acende a `surface-2`.
 */
const SECCOES: {
  chave: string;
  href: string;
  rotulo: string;
  icone: NomeDoIcone;
}[] = [
  { chave: "receitas", href: "/estudio/financas/receitas", rotulo: "Receitas", icone: "entra" },
  { chave: "gastos", href: "/estudio/financas/gastos", rotulo: "Gastos", icone: "sai" },
];

export type SeccaoFinanceira = "receitas" | "gastos";

export function SubNavegacao({ atual }: { atual: SeccaoFinanceira }) {
  return (
    <nav aria-label="Finanças" className="mt-6">
      <ul className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1">
        {SECCOES.map((s) => {
          const escolhida = s.chave === atual;
          return (
            <li key={s.chave}>
              <Link
                href={s.href}
                aria-current={escolhida ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-sm transition-colors duration-200",
                  escolhida
                    ? "bg-surface-2 font-medium text-ink ring-1 ring-border-strong"
                    : "text-muted hover:text-ink",
                )}
              >
                <Icone nome={s.icone} tamanho={15} />
                {s.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
