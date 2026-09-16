"use client";
/** docs: docs/04-componentes-e-padroes.md */

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion";
import { noEstudio } from "@/lib/estudio/rotas";

/**
 * Lenis (scroll suave) e a sua ligação ao ScrollTrigger.
 *
 * **Os dois têm de partilhar o mesmo relógio.** Cada um traz o seu: o Lenis
 * corre um `requestAnimationFrame` próprio e o GSAP tem o `gsap.ticker`. A
 * correr em separado, o ScrollTrigger lê a posição do scroll de um frame que o
 * Lenis ainda não escreveu, e as entradas disparam um frame atrasadas — o que
 * se vê como um tremor nas secções que entram durante um scroll rápido. Por
 * isso `autoRaf: false` e o `raf` do Lenis passa a ser chamado pelo ticker do
 * GSAP.
 *
 * O `lagSmoothing(0)` desliga a compensação do GSAP: por omissão, quando um
 * frame demora de mais, o GSAP finge que passou menos tempo do que passou. Isso
 * é bom numa animação isolada e é mau num scroll, onde a posição tem de
 * corresponder ao que o dedo fez.
 */
/**
 * A ligação em si, num componente **dentro** do `ReactLenis`.
 *
 * Não é arrumação: é a única forma de a apanhar. O `ReactLenis` cria a
 * instância no seu próprio `useEffect` e guarda-a em **estado**, e o
 * `useImperativeHandle` que preenche a `ref` depende desse estado — ou seja, a
 * `ref` só passa a ter `.lenis` num render posterior. Um `useEffect` no pai com
 * `[]` corre antes disso e lê `undefined`, desiste, e nunca mais tenta.
 *
 * O preço disso não é o tremor que a ligação evita: com `autoRaf: false`,
 * **ninguém chega a chamar o `raf` do Lenis**. Ele continua a apanhar a roda do
 * rato e a travar o scroll nativo, mas nunca aplica o seu — a página fica presa
 * no sítio, e só as teclas (que o browser trata sozinho) é que a mexem. O
 * `useLenis` lê a instância do contexto e volta a correr quando ela existe.
 */
function LigarAoTicker() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, [lenis]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  /*
    As posições de arranque do ScrollTrigger são medidas antes de as imagens
    terem altura. Sem este `refresh`, tudo o que está por baixo de uma imagem
    dispara na posição errada — normalmente cedo de mais, com o bloco a entrar
    fora do ecrã. `load` chega depois de as imagens assentarem.

    **Não ponhas aqui um `ResizeObserver` sobre o `<body>`.** Parece o passo
    seguinte óbvio — apanhar as imagens `lazy` que chegam depois — e congela o
    separador: o `refresh()` mexe no layout, o que volta a disparar o observer,
    que chama `refresh()` outra vez. Medido: o renderer deixa de responder e as
    animações ficam paradas a meio, com valores intermédios escritos no `style`.
    O ScrollTrigger já ouve o `resize` da janela sozinho; para as imagens, o
    `load` chega.
  */
  useEffect(() => {
    const refrescar = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") refrescar();
    else window.addEventListener("load", refrescar, { once: true });
    return () => window.removeEventListener("load", refrescar);
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
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ autoRaf: false }}>
      <LigarAoTicker />
      {children}
    </ReactLenis>
  );
}
