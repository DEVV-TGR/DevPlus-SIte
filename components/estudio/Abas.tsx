/** docs: docs/07-estudio.md */
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Os separadores de dentro de uma página — as abas da ficha de um projeto, a
 * de um cliente.
 *
 * São ligações com `?aba=`, desenhadas no servidor: funcionam sem JavaScript,
 * o endereço diz onde se está (e pode mandar-se a alguém), e o "voltar" do
 * browser volta à aba de antes. Quem decide qual está escolhida é a página,
 * com uma `lerAba()` que estreita o valor do endereço aos que existem — o mesmo
 * cuidado do `lerPeriodo()` de `tipos.ts`.
 *
 * O desenho é o da `SubNavegacao`: os separadores do topo em pequeno, sem o
 * laranja, que já diz em que secção se está.
 */
export function Abas<T extends string>({
  abas,
  atual,
  base,
  rotulo,
}: {
  abas: readonly { chave: T; rotulo: string; conta?: number }[];
  atual: T;
  /** O endereço da página, sem `?`. A primeira aba é este endereço limpo. */
  base: string;
  rotulo: string;
}) {
  return (
    <nav aria-label={rotulo} className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <ul className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1">
        {abas.map((a, i) => {
          const escolhida = a.chave === atual;
          return (
            <li key={a.chave} className="flex-none">
              <Link
                href={i === 0 ? base : `${base}?aba=${a.chave}`}
                scroll={false}
                aria-current={escolhida ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-sm whitespace-nowrap transition-colors duration-200",
                  escolhida
                    ? "bg-surface-2 font-medium text-ink ring-1 ring-border-strong"
                    : "text-muted hover:text-ink",
                )}
              >
                {a.rotulo}
                {a.conta !== undefined ? (
                  <span className="text-xs tabular-nums text-muted">{a.conta}</span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
