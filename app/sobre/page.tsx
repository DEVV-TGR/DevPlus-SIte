import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/Reveal";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre",
  description: `A ${site.name} é um estúdio independente de web design e desenvolvimento, movido por detalhe, performance e parceria.`,
};

const values: [string, string][] = [
  [
    "Detalhe",
    "Está nos espaços, na tipografia e nos estados que ninguém repara — até faltarem. É aí que se nota o cuidado.",
  ],
  [
    "Performance",
    "Um site lento custa clientes. Velocidade, acessibilidade e SEO fazem parte de tudo o que entregamos.",
  ],
  [
    "Parceria",
    "Não desaparecemos no lançamento. Ficamos por perto para evoluir o projeto à medida que o negócio muda.",
  ],
];

const beliefs: [string, string][] = [
  [
    "Sem templates",
    "Cada marca é diferente — o site também devia ser. Desenhamos e construímos tudo à medida.",
  ],
  [
    "Menos, mas melhor",
    "Aceitamos poucos projetos de cada vez, para dar a cada um a atenção que merece.",
  ],
  [
    "Código que dura",
    "Escrevemos código limpo e moderno, fácil de manter e de fazer crescer com o negócio.",
  ],
];

export default function SobrePage() {
  return (
    <>
      <PageHero
        eyebrow="Sobre"
        title="Um estúdio movido por detalhe e por fazer mais."
        intro={`A ${site.name} nasceu de uma ideia simples: a maioria dos sites podia ser muito melhor. Existimos para acrescentar o que falta.`}
      />

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <div className="space-y-5 text-lg text-muted">
                <p>
                  Somos um estúdio independente de web design e desenvolvimento.
                  Trabalhamos com marcas que querem mais do que um site bonito —
                  querem uma presença digital rápida, clara e que consigam gerir
                  sozinhas.
                </p>
                <p>
                  Cada projeto é tratado pela mesma equipa, do primeiro esboço à
                  última linha de código. Sem intermediários e sem templates:
                  desenhamos e construímos tudo de raiz, à medida de quem vamos
                  servir.
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

      <Section className="pt-0">
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
