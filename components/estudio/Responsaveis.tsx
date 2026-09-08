/** docs: docs/07-estudio.md */
import type { Utilizador } from "@/lib/estudio/tipos";

/**
 * Quem está no projeto, em iniciais.
 *
 * **Não são as fotos do GitHub**, e é de propósito: a CSP do site tem
 * `img-src 'self' data: blob:` (ver `next.config.ts`), que não deixa carregar
 * imagens de outro domínio. Abrir a CSP a `avatars.githubusercontent.com` para
 * mostrar uma bolinha era pagar caro por muito pouco. O `avatar_url` fica
 * guardado na base para o dia em que valha a pena.
 */

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export function Responsaveis({
  pessoas,
  vazio = "Sem ninguém atribuído",
}: {
  pessoas: Utilizador[];
  vazio?: string;
}) {
  if (pessoas.length === 0) {
    return <p className="text-xs text-muted">{vazio}</p>;
  }

  return (
    <ul className="flex flex-wrap items-center gap-1.5">
      {pessoas.map((p) => (
        <li
          key={p.id}
          /* O nome vai no `title` **e** num `sr-only`: o `title` não chega a
             quem navega por teclado nem a um leitor de ecrã. */
          title={p.nome}
          className="grid h-7 min-w-7 place-items-center rounded-full border border-border-strong bg-surface-2 px-1.5 text-[0.6875rem] font-medium text-ink"
        >
          <span aria-hidden>{iniciais(p.nome)}</span>
          <span className="sr-only">{p.nome}</span>
        </li>
      ))}
    </ul>
  );
}
