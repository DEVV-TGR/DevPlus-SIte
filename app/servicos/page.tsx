/** docs: docs/05-servicos.md */
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/Reveal";
import { PageHero } from "@/components/PageHero";
import { services } from "@/lib/services";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Serviços",
  description:
    "Web design, desenvolvimento, menus e ecrãs digitais, painel de gestão, branding e motion. Acompanhamos o teu projeto do primeiro esboço ao lançamento.",
};

const packages: {
  name: string;
  desc: string;
  points: string[];
  featured?: boolean;
}[] = [
  {
    name: "Landing page",
    desc: "Uma página focada num objetivo: apresentar, lançar ou converter. Rápida de pôr no ar.",
    points: [
      "Página única",
      "Copy + design",
      "Formulário de contacto",
      "Otimizada para SEO",
    ],
  },
  {
    name: "Website",
    desc: "O site completo da tua marca, com várias páginas e um sistema visual coerente.",
    points: [
      "Várias páginas",
      "Design system próprio",
      "CMS opcional",
      "Performance + SEO",
    ],
    featured: true,
  },
  {
    name: "Loja online",
    desc: "Uma loja pensada para vender, com checkout simples e gestão fácil de produtos.",
    points: [
      "Catálogo + checkout",
      "Pagamentos",
      "Gestão de produtos",
      "Analytics",
    ],
  },
];

const faqs: [string, string][] = [
  [
    "Quanto custa um site?",
    "Depende do âmbito — número de páginas, funcionalidades e conteúdo. Damos sempre um orçamento fixo antes de começar, sem surpresas.",
  ],
  [
    "Quanto tempo demora?",
    "Uma landing page pode estar pronta em 1 a 2 semanas; um site completo, normalmente entre 3 e 6 semanas, conforme o conteúdo.",
  ],
  [
    "Trabalham com clientes fora de Portugal?",
    "Sim. Trabalhamos remotamente e estamos habituados a colaborar à distância, em português ou inglês.",
  ],
  [
    "O site vai ser mesmo meu?",
    "Totalmente. Entregamos o código e todos os acessos. O site é teu, sem dependências nem mensalidades obrigatórias.",
  ],
  [
    "Tratam do alojamento e do domínio?",
    "Tratamos de toda a parte técnica do lançamento e aconselhamos as melhores opções de alojamento e domínio para o teu caso.",
  ],
  [
    "Dão apoio depois do lançamento?",
    "Sim. Ficamos disponíveis para manutenção, melhorias e novas funcionalidades à medida que o negócio cresce.",
  ],
];

export default function ServicosPage() {
  return (
    <>
      <PageHero
        eyebrow="Serviços"
        title="Tudo o que a tua marca precisa para se destacar online."
        intro="Da primeira ideia ao site no ar — design, desenvolvimento, menus digitais e painel de gestão, tratados pela mesma equipa e com o mesmo cuidado."
      />

      <Section>
        <Container>
          <div className="flex flex-col divide-y divide-border">
            {services.map((s) => (
              <Reveal key={s.title}>
                <div className="grid gap-6 py-10 sm:grid-cols-12 sm:py-14">
                  <div className="sm:col-span-4">
                    <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
                      {s.title}
                    </h2>
                  </div>
                  <div className="sm:col-span-8">
                    <p className="max-w-xl text-muted">{s.blurb}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {s.items.map((it) => (
                        <li
                          key={it}
                          className="rounded-full border border-border px-3 py-1.5 text-sm text-muted"
                        >
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* PACKAGES */}
      <Section className="pt-0">
        <Container>
          <Reveal>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Por onde podemos começar
            </h2>
            <p className="mt-3 max-w-xl text-muted">
              Cada projeto é único, mas costuma partir de um destes pontos. O
              orçamento é sempre fixo e definido antes de avançarmos.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {packages.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.06}>
                <div
                  className={cn(
                    "flex h-full flex-col rounded-2xl border p-6",
                    p.featured
                      ? "border-primary/60 bg-primary/[0.06]"
                      : "border-border bg-surface",
                  )}
                >
                  {p.featured ? (
                    <span className="mb-3 inline-flex w-fit items-center rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-ink">
                      Mais escolhido
                    </span>
                  ) : null}
                  <h3 className="font-display text-xl">{p.name}</h3>
                  <p className="mt-2 text-sm text-muted">{p.desc}</p>
                  <ul className="mt-5 space-y-2 text-sm">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5">
                        <span
                          aria-hidden
                          className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"
                        />
                        <span className="text-muted">{pt}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-6">
                    <Button
                      href="/contacto"
                      variant={p.featured ? "primary" : "outline"}
                      className="w-full"
                    >
                      Pedir proposta
                    </Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">
            Não te encaixas em nenhum?{" "}
            <Link
              href="/contacto"
              className="text-ink underline-offset-4 hover:underline"
            >
              Fala connosco
            </Link>{" "}
            — adaptamo-nos ao teu projeto.
          </p>
        </Container>
      </Section>

      {/* FAQ */}
      <Section className="pt-0">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Perguntas frequentes
              </h2>
              <p className="mt-3 text-muted">
                Não encontras a tua pergunta?{" "}
                <Link
                  href="/contacto"
                  className="text-ink underline-offset-4 hover:underline"
                >
                  Escreve-nos.
                </Link>
              </p>
            </Reveal>
            <div className="lg:col-span-8">
              <dl className="flex flex-col divide-y divide-border">
                {faqs.map(([q, a], i) => (
                  <Reveal key={q} delay={i * 0.04}>
                    <div className="py-6 first:pt-0">
                      <dt className="font-display text-lg">{q}</dt>
                      <dd className="mt-2 text-muted">{a}</dd>
                    </div>
                  </Reveal>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <Reveal>
            <div className="rounded-2xl border border-border bg-surface p-8 text-center sm:p-12">
              <h2 className="mx-auto max-w-lg font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Tens um projeto em mente?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-muted">
                Conta-nos o que precisas. Respondemos em 24 a 48 horas úteis com
                uma proposta de próximos passos.
              </p>
              <div className="mt-6 flex justify-center">
                <Button href="/contacto" variant="primary">
                  Falar connosco
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
