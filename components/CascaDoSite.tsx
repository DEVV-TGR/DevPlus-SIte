/** docs: docs/07-estudio.md */
"use client";

import { usePathname } from "next/navigation";
import { Nav } from "@/components/Nav";
import { noEstudio } from "@/lib/estudio/rotas";

/**
 * Decide se a página que está a ser vista leva a casca do site público.
 *
 * O Estúdio (`/estudio`) não leva: é uma ferramenta interna, e uma barra a
 * dizer "Falar connosco" por cima da lista de trabalho não faz sentido nenhum.
 * O rodapé chega por `rodape` em vez de ser importado aqui porque o `Footer` é
 * um componente de servidor — passá-lo como prop deixa-o continuar a sê-lo.
 *
 * O grão veio do `app/layout.tsx` pela mesma razão que a `Nav`: é textura do
 * site público. Numa ferramenta de trabalho era uma camada `fixed` a cobrir o
 * ecrã inteiro para não acrescentar nada a uma tabela de números.
 *
 * Isto vive num componente próprio, e não dentro do `Nav` ou do `Footer`, para
 * não tocar em ficheiros que os PR #54 e #65 estão a reescrever. Quando esses
 * fundirem, vale a pena ver se o Estúdio não fica melhor com uma raiz própria
 * (`app/(site)` e `app/(estudio)`) — ver docs/07.
 */
export function CascaDoSite({
  rodape,
  children,
}: {
  rodape: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const noEstudioAgora = noEstudio(pathname);

  return (
    <>
      {noEstudioAgora ? null : <Nav />}
      <main id="main" className="flex-1">
        {children}
      </main>
      {noEstudioAgora ? null : rodape}
      {noEstudioAgora ? null : <div className="grain-overlay" aria-hidden />}
    </>
  );
}
