"use client";
/** docs: docs/04-componentes-e-padroes.md */

import { ReactLenis } from "lenis/react";
import { MotionConfig } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { noEstudio } from "@/lib/estudio/rotas";

/**
 * Global client providers:
 * - Lenis smooth scroll (root), disabled when the user prefers reduced motion.
 * - MotionConfig with reducedMotion="user" so all Motion animations honor the
 *   OS setting automatically.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const [smooth, setSmooth] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSmooth(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* **O Estúdio não leva scroll suave**, e não é questão de gosto.

     No site público o Lenis é a intenção: a página desliza, e uma pessoa que
     chega para ler passa lá segundos. O Estúdio é uma ferramenta que se usa
     todos os dias, e ali o mesmo efeito chama-se lag — tira-se a mão da roda e
     a lista de projetos continua a andar mais meio segundo até parar onde já
     devia estar. Quem procura uma linha numa tabela quer que ela pare onde a
     largou.

     E é também o que o cabeçalho `sticky` do Estúdio pedia: o Lenis translada o
     conteúdo a cada frame, e por baixo de um `backdrop-blur-md` isso obriga o
     browser a recalcular o desfoque contra fundo novo em todos os frames. Sem
     Lenis o scroll é o do browser e o desfoque volta a custar o que deve.

     Desligar assim, e não com `smoothWheel: false`, é de propósito: o
     componente sai da árvore e o Lenis não chega a arrancar o seu `rAF`. Ver a
     lacuna "Raiz própria" em docs/07 — quando os PR #54 e #65 fundirem, isto
     resolve-se melhor com `app/(site)` e `app/(estudio)`, e esta verificação
     desaparece com a `CascaDoSite`. */
  if (noEstudio(pathname)) {
    return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
  }

  return (
    <MotionConfig reducedMotion="user">
      <ReactLenis
        root
        options={{ lerp: 0.1, smoothWheel: smooth, touchMultiplier: 1.5 }}
      >
        {children}
      </ReactLenis>
    </MotionConfig>
  );
}
