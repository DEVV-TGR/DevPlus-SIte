import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/Reveal";
import { PageHero } from "@/components/PageHero";
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

export default function SobrePage() {
  return (
    <>
      <PageHero
        eyebrow="Sobre"
        title="Estúdio pequeno, projetos poucos, atenção toda."
        intro={`A ${site.name} nasceu de uma ideia simples: a maior parte dos sites podia ser bem melhor. Existimos para acrescentar o que lhes falta.`}
      />

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <div className="space-y-5 text-lg text-muted">
                <p>
                  Somos um estúdio pequeno de web design e desenvolvimento.
                  Trabalhamos sobretudo com negócios que já fazem bem aquilo que
                  fazem e só precisam que a internet o mostre — restaurantes,
                  stands, empresas de serviços.
                </p>
                <p>
                  Quem fala contigo é quem desenha e quem escreve o código. Não
                  há intermediários pelo meio nem modelos prontos a preencher.
                  E não te deixamos sozinho quando o site fica no ar: o
                  alojamento e o suporte ficam connosco.
                </p>
              </div>
            </Reveal>

            <Reveal className="lg:col-span-5" delay={0.08}>
              <div className="flex flex-col divide-y divide-border">
                {values.map(([title, blurb]) => (
                  <div key={title} className="py-5 first:pt-0">
                    <h2 className="font-display text-lg">{title}</h2>
                    <p className="mt-1.5 text-sm text-muted">{blurb}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* PORQUÊ A DEVPLUS — veio da homepage, que passou a dar o lugar ao
          trabalho feito e aos testemunhos. Ver docs/04. */}
      <Section top={false}>
        <Container>
          <Reveal>
            <div className="rounded-2xl border border-border bg-surface p-8 sm:p-12">
              <h2 className="max-w-md font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Porquê a {site.name}
              </h2>
              <div className="mt-10 grid gap-8 sm:grid-cols-3">
                {differentiators.map(([title, blurb], i) => (
                  <Reveal key={title} delay={i * 0.06}>
                    <div>
                      <span
                        aria-hidden
                        className="block h-px w-10 bg-primary"
                      />
                      <h3 className="mt-4 font-display text-lg">{title}</h3>
                      <p className="mt-2 text-sm text-muted">{blurb}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section top={false}>
        <Container>
          <Reveal>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
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
