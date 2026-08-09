import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/Reveal";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { ProjectsMarquee } from "@/components/ProjectsMarquee";
import { Testimonials } from "@/components/Testimonials";
import { projects } from "@/lib/projects";
import { services } from "@/lib/services";
import { site } from "@/lib/site";

const disciplines = [
  "Web Design",
  "Desenvolvimento",
  "Menus digitais",
  "Painel de gestão",
  "Branding",
  "Motion",
  "UI / UX",
  "Performance",
  "SEO",
  "Ecrãs em loop",
];

/**
 * A ordem das secções conta uma história: prova primeiro, oferta depois,
 * confirmação no fim. Quem chega vê quem já confia na DevPlus, o que foi feito
 * para essas pessoas, só então o que se oferece, e por último o que os clientes
 * dizem — antes do convite para falar. A razão está escrita no `docs/04`.
 */
export default function Home() {
  return (
    <>
      <Hero />

      {/* DISCIPLINE MARQUEE */}
      <section className="border-y border-border py-5 sm:py-7">
        <Marquee
          items={disciplines}
          className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-6xl"
        />
      </section>

      {/* QUEM CONFIA EM NÓS */}
      <Section>
        <Container>
          <Reveal>
            <p className="max-w-4xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Bonito é fácil.{" "}
              <span className="text-muted">O difícil é dar-te trabalho a </span>
              <span className="text-primary">menos</span>.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-12 flex flex-col gap-x-10 gap-y-4 border-t border-border pt-8 sm:flex-row sm:items-center">
              <p className="shrink-0 text-xs uppercase tracking-[0.18em] text-muted">
                Já trabalhamos com
              </p>
              <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
                {projects.map((c) => (
                  <li
                    key={c.slug}
                    className="font-display text-lg font-medium text-ink/80"
                  >
                    {c.client}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* TRABALHO SELECIONADO — faixa contínua; a grelha completa vive em
          /portfolio. Vem logo a seguir aos clientes de propósito: os nomes
          acabados de ler ganham cara aqui. */}
      <Section className="pt-0">
        <Container>
          <div className="flex items-end justify-between gap-6">
            <Reveal>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Trabalho selecionado
              </h2>
            </Reveal>
            <Reveal>
              <Button
                href="/portfolio"
                variant="ghost"
                className="hidden sm:inline-flex"
              >
                Ver todos os projetos
              </Button>
            </Reveal>
          </div>
        </Container>

        {/* Fora do Container: a faixa sangra até às margens do ecrã. */}
        <div className="mt-10">
          <ProjectsMarquee projects={projects} />
        </div>

        {/* No telemóvel deixou de haver a grelha inteira à vista — o acesso ao
            portfólio completo passa a ser explícito. */}
        <Container className="mt-8 sm:hidden">
          <Button href="/portfolio" variant="outline" className="w-full">
            Ver todos os projetos
          </Button>
        </Container>
      </Section>

      {/* O QUE FAZEMOS */}
      <Section className="pt-0">
        <Container>
          <div className="flex items-end justify-between gap-6">
            <Reveal>
              <h2 className="max-w-md font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                O que fazemos
              </h2>
            </Reveal>
            <Reveal>
              <Button
                href="/servicos"
                variant="ghost"
                className="hidden sm:inline-flex"
              >
                Todos os serviços
              </Button>
            </Reveal>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06}>
                <div className="h-full rounded-2xl border border-border bg-surface p-6 transition-colors duration-300 hover:border-ink/20">
                  <h3 className="font-display text-xl">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted">{s.blurb}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {s.items.map((it) => (
                      <li
                        key={it}
                        className="rounded-full border border-border px-2.5 py-1 text-xs text-muted"
                      >
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* TESTEMUNHOS — não renderiza nada enquanto não houver frases reais. */}
      <Testimonials />

      {/* CONTACTO */}
      <Section className="pt-0">
        <Container>
          <Reveal>
            <div className="rounded-2xl border border-border bg-surface p-8 text-center sm:p-12">
              <h2 className="mx-auto max-w-lg font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Tens um projeto em mente?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-muted">
                Conta-nos o que tens em mente, mesmo que ainda seja só uma
                ideia. Damos-te notícias depressa.
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
                <Button href="/contacto" variant="primary">
                  Começar a conversa
                </Button>
                {/* O email à vista é o que distingue esta secção do rodapé:
                    quem prefere escrever direto não tem de abrir outra página. */}
                <a
                  href={`mailto:${site.email}`}
                  className="font-display text-lg transition-colors hover:text-primary"
                >
                  {site.email}
                </a>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
