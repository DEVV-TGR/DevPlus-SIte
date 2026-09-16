import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/Reveal";
import { Capa } from "@/components/paginas/Capa";
import { Cruz, POSTOS_PAGINA } from "@/components/home/Cruz";
import { Curva } from "@/components/home/Curva";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/sobre",
  title: "Sobre",
  description: `A ${site.name} é um estúdio pequeno de web design e desenvolvimento. Poucos projetos de cada vez, para dar a cada um a atenção que precisa.`,
});

const values: [string, string][] = [
  [
    "Detalhe",
    "Ninguém repara num espaçamento certo. Repara-se sempre num errado. É aí que se vê se alguém teve cuidado.",
  ],
  [
    "Rapidez",
    "Um site que demora a abrir perde o cliente antes de lhe mostrar seja o que for. Rapidez não é um extra que se pede.",
  ],
];

/* Vieram da homepage, onde estavam como "Porquê a DevPlus". O valor "Parceria"
   saiu da lista acima quando estes chegaram: dizia o mesmo que o terceiro, a
   dois blocos de distância. */
const differentiators: [string, string][] = [
  [
    "O site fica nas tuas mãos",
    "Damos-te um painel feito à tua medida. Mudas preços, fotos e textos à hora que te der jeito, sem ligar a ninguém.",
  ],
  [
    "Falas sempre com quem faz",
    "Aceitamos poucos projetos de cada vez. Quem te atende é quem desenha e quem escreve o código.",
  ],
  [
    "Não desaparecemos no lançamento",
    "O alojamento e o suporte ficam connosco. Se alguma coisa falhar, não tens de andar à procura de quem resolve.",
  ],
];

const beliefs: [string, string][] = [
  [
    "Nada de modelos prontos",
    "Cada negócio é diferente e o site devia dar por isso. Nunca partimos de um modelo feito, e não vamos começar agora.",
  ],
  [
    "Menos, mas melhor",
    "Aceitamos poucos projetos ao mesmo tempo. É a única maneira de dar a cada um a atenção que precisa.",
  ],
  [
    "Feito para durar",
    "Escrevemos o site a pensar em daqui a três anos, não só no dia da entrega. Crescer depois tem de ser fácil.",
  ],
];

/**
 * As notas que vão habitar as margens do texto.
 *
 * São os mesmos `values` e `differentiators` de antes — o que mudou não foi o
 * conteúdo, foi o sítio. Estavam em duas secções próprias, uma coluna e um
 * painel; passam a viver **ao lado** da voz do estúdio, alternadamente à
 * esquerda e à direita, para o olho não cair sempre do mesmo lado.
 *
 * O `topo` é a classe da posição vertical, e só conta a partir dos 1024px:
 * abaixo disso não há margem para habitar, e as notas entram na coluna, que é
 * onde cabem. Está escrita por extenso e não montada a partir de um número
 * porque o Tailwind só gera o que consegue **ler no ficheiro** — uma classe
 * construída em runtime não chega a existir no CSS.
 */
const notas: { lado: "e" | "d"; topo: string; par: [string, string] }[] = [
  { lado: "e", topo: "lg:top-[6%]", par: values[0] },
  { lado: "d", topo: "lg:top-[22%]", par: values[1] },
  { lado: "e", topo: "lg:top-[44%]", par: differentiators[0] },
  { lado: "d", topo: "lg:top-[62%]", par: differentiators[1] },
  { lado: "e", topo: "lg:top-[80%]", par: differentiators[2] },
];

/** Uma nota à margem: aparte no telemóvel, margem habitada no computador. */
function Nota({ nota }: { nota: (typeof notas)[number] }) {
  const [titulo, texto] = nota.par;
  return (
    <Reveal
      className={`block lg:absolute lg:max-w-[22rem] ${
        nota.lado === "e"
          ? "lg:left-[max(1.5rem,6vw)]"
          : "lg:right-[max(1.5rem,6vw)]"
      } ${nota.topo}`}
    >
      <aside className="border-l-2 border-primary pl-4">
        <h2 className="font-display text-lg font-bold tracking-[-0.02em]">
          {titulo}
        </h2>
        <p className="mt-1.5 text-sm text-muted">{texto}</p>
      </aside>
    </Reveal>
  );
}

export default function SobrePage() {
  return (
    <>
      <Cruz postos={POSTOS_PAGINA} />

      <Capa
        eyebrow="Sobre"
        title="Estúdio pequeno, projetos poucos, atenção toda."
        intro={`A ${site.name} nasceu de uma ideia simples: a maior parte dos sites podia ser bem melhor. Existimos para acrescentar o que lhes falta.`}
      />
      <Curva forma="a" de="var(--bg)" cor="var(--bg-deep)" />

      {/* A VOZ, E AS MARGENS
          O texto ao meio, estreito, e as notas à volta. Um estúdio pequeno a
          falar de si não precisa de secções — precisa de uma voz e de notas à
          margem que não a interrompam. Antes eram dois blocos próprios: uma
          coluna de valores e um painel "Porquê a DevPlus". Diziam o mesmo, mas
          obrigavam a lê-los como capítulos. */}
      <section className="relative bg-bg-deep py-24 sm:py-32 lg:py-40">
        {/* **As notas vivem dentro da coluna, e não antes dela.** Estavam num
            `map` próprio acima do texto: acima dos 1024px isso não se via,
            porque saem do fluxo para as margens, mas num telemóvel caíam pela
            ordem do JSX e quem abria a página lia cinco notas seguidas antes de
            chegar à primeira frase sobre o estúdio. Agora estão intercaladas —
            no telemóvel são apartes entre parágrafos, no computador continuam a
            ir para as margens. */}
        <div className="mx-auto grid max-w-[34rem] gap-6 px-6 sm:px-8">
          <Reveal>
            <p className="text-[clamp(1.05rem,1.6vw,1.4rem)] leading-[1.55]">
              Somos um estúdio pequeno de web design e desenvolvimento.
              Trabalhamos sobretudo com negócios que já fazem bem aquilo que
              fazem e só precisam que a internet o mostre — restaurantes,
              stands, empresas de serviços.
            </p>
          </Reveal>

          <Nota nota={notas[0]} />
          <Nota nota={notas[1]} />

          <Reveal delay={0.06}>
            <p className="text-[clamp(1.05rem,1.6vw,1.4rem)] leading-[1.55]">
              Quem fala contigo é quem desenha e quem escreve o código. Não há
              intermediários pelo meio nem modelos prontos a preencher.
            </p>
          </Reveal>

          <Nota nota={notas[2]} />
          <Nota nota={notas[3]} />

          <Reveal delay={0.12}>
            <p className="text-[clamp(1.05rem,1.6vw,1.4rem)] leading-[1.55] text-muted">
              E não te deixamos sozinho quando o site fica no ar: o alojamento e
              o suporte ficam connosco. Se alguma coisa falhar, não tens de andar
              à procura de quem resolve.
            </p>
          </Reveal>

          <Nota nota={notas[4]} />
        </div>
      </section>
      <Curva forma="b" de="var(--bg-deep)" cor="var(--bg)" />

      <Section className="relative">
        <Container>
          <Reveal>
            <h2 className="t-seccao max-w-[14ch] font-display font-extrabold">
              Em que acreditamos
            </h2>
          </Reveal>
          {/* Sem cards e sem 01/02/03: não é uma sequência — são três coisas
              em que se acredita ao mesmo tempo, e numerá-las era decoração.
              Fica uma lista assumida, com o peso na frase e não na caixa. */}
          <dl className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-3">
            {beliefs.map(([title, blurb]) => (
              <Reveal key={title}>
                <div className="border-t border-border pt-5">
                  <dt className="font-display text-2xl tracking-tight">
                    {title}
                  </dt>
                  <dd className="mt-3 text-muted">{blurb}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </Container>
      </Section>
    </>
  );
}
