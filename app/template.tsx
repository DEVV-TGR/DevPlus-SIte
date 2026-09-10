"use client";
/** docs: docs/04-componentes-e-padroes.md — "Movimento" e "Transições entre páginas". */

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/*
  Este ficheiro já animou a página com Motion — um fade de 10px a cada
  navegação. Deixou de o fazer quando as capas do portfólio passaram a morfar
  entre páginas: o morph e o fade são duas gramáticas de movimento a correr na
  mesma navegação, e a capa via-se a mudar de tamanho **enquanto** a página
  inteira lhe fazia fade por baixo.

  Agora a animação de página é toda das view transitions, em `globals.css`.
  Uma gramática só. O que sobra aqui é a **direção**, que o CSS não consegue
  saber sozinho: descer na hierarquia do site desliza para a frente, subir
  desliza para trás.

  `sessionStorage` e não estado do React: o `template.tsx` remonta a cada
  navegação, portanto não tem memória do sítio de onde veio.
*/

/** `/` é 0, `/portfolio` é 1, `/portfolio/taskuinha` é 2. */
function profundidade(caminho: string) {
  return caminho.split("/").filter(Boolean).length;
}

const CHAVE = "devplus:profundidade";

export default function Template({ children }: { children: React.ReactNode }) {
  const caminho = usePathname();

  useEffect(() => {
    const agora = profundidade(caminho);

    try {
      const guardado = sessionStorage.getItem(CHAVE);
      const anterior = guardado ? (JSON.parse(guardado) as { c: string; p: number }) : null;

      /*
        Guarda-se o CAMINHO, não só a profundidade.

        Em desenvolvimento o StrictMode corre este efeito duas vezes. Guardando
        só o número, a segunda passagem lia a profundidade que a primeira acabara
        de escrever, comparava-a consigo própria e concluía "lado" — a navegação
        `/` → `/portfolio` perdia a direção. Medido: dava "lado" onde devia dar
        "avanca". Com o caminho, a segunda passagem reconhece-se e não faz nada.
      */
      if (anterior?.c === caminho) return;

      sessionStorage.setItem(CHAVE, JSON.stringify({ c: caminho, p: agora }));

      const antes = anterior?.p ?? agora;
      document.documentElement.dataset.sentido =
        agora > antes ? "avanca" : agora < antes ? "recua" : "lado";
    } catch {
      // Modo privado, ou armazenamento bloqueado. Sem direção o CSS usa a
      // transição neutra, que nunca está errada — a navegação continua a andar.
    }
  }, [caminho]);

  return children;
}
