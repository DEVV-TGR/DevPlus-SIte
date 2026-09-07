import { Cruz } from "@/components/home/Cruz";
import { Curva } from "@/components/home/Curva";
import { HeroHome } from "@/components/home/HeroHome";
import { ComoTrabalhamos } from "@/components/home/ComoTrabalhamos";
import { ProvaCarrossel } from "@/components/home/ProvaCarrossel";
import { ServicosMostra } from "@/components/home/ServicosMostra";
import { Pacotes } from "@/components/home/Pacotes";
import { Fecho } from "@/components/home/Fecho";
import { Testimonials } from "@/components/Testimonials";
import { pageMetadata } from "@/lib/seo";

/* Sem `title`: a homepage fica com o `title.default` do layout. O resto — o
   canónico, o Open Graph e o cartão do Twitter — sai do `path`. Ver docs/01. */
export const metadata = pageMetadata({ path: "/" });

/**
 * A página inicial: seis capítulos, e **cada um com uma forma diferente**.
 *
 * A versão anterior tinha sete secções que eram todas a mesma: título grande,
 * texto, uma coisa por baixo. Mudava a cor e o conteúdo, mas o molde era o
 * mesmo, e uma página assim lê-se como uma lista em vez de um percurso. A
 * razão de cada forma está no `docs/04`.
 *
 * | # | Capítulo           | Forma                                             |
 * | - | ------------------ | ------------------------------------------------- |
 * | 0 | Capa               | Tipografia partida pelas margens, figura no vão   |
 * | 1 | Como trabalhamos   | Cards inclinados que chegam e se acumulam         |
 * | 2 | A prova            | Fila horizontal, com a página presa               |
 * | 3 | Serviços           | Um de cada vez, com navegação em círculos         |
 * | 4 | Por onde começar   | Grelha de pacotes, três e um caminho              |
 * | 5 | O convite          | Fecho quente, que resolve                         |
 *
 * Os grounds mudam por capítulo, com cortes duros: numa página de capítulos um
 * corte não é um gradiente. O `Cruz` é a única coisa que os atravessa a todos.
 */
export default function Home() {
  return (
    <>
      <Cruz />

      <HeroHome />
      <Curva forma="a" de="var(--bg)" cor="var(--bg-deep)" />

      <ComoTrabalhamos />
      <Curva forma="b" de="var(--bg-deep)" cor="var(--paper)" />

      <ProvaCarrossel />
      <Curva forma="c" de="var(--paper)" cor="var(--bg)" />

      <ServicosMostra />
      <Pacotes />

      {/* Não renderiza nada enquanto não houver frases reais — ver docs/04. */}
      <Testimonials />

      <Curva forma="a" de="var(--bg)" cor="var(--primary)" />
      <Fecho />
    </>
  );
}
