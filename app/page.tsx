import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/Reveal";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { ProjectsMarquee } from "@/components/ProjectsMarquee";
import { projects } from "@/lib/projects";
import { services } from "@/lib/services";
import { site } from "@/lib/site";

const steps: [string, string, string][] = [
  [
    "01",
    "Conversa",
    "Sentamo-nos contigo a perceber o negócio, quem são os teus clientes e o que queres ganhar com isto. Sem isso, o resto é decoração.",
  ],
  [
    "02",
    "Design",
    "Mostramos-te o site desenhado antes de ele existir. Vês, dizes o que mudarias, e só depois se escreve código.",
  ],
  [
    "03",
    "Construção",
    "Abre depressa, funciona bem no telemóvel e aparece nas pesquisas. Não são extras que se pedem — é como fazemos.",
  ],
  [
    "04",
    "No ar",
    "Pomos o site online, acompanhamos os primeiros dias e afinamos o que for preciso. E ficamos cá para o que vier a seguir.",
  ],
];

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

      {/* STATEMENT + CLIENTS */}
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

      {/* SERVICES TEASER */}
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

      {/* SELECTED WORK — faixa contínua; a grelha completa vive em /portfolio */}
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

      {/* WHY US */}
      <Section className="pt-0">
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

      {/* APPROACH */}
      <Section className="pt-0">
        <Container>
          <Reveal>
            <h2 className="max-w-lg font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Como trabalhamos
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([n, t, d], i) => (
              <Reveal key={n} delay={i * 0.08}>
                <div className="border-t border-border pt-5">
                  <span className="font-display text-sm text-primary">{n}</span>
                  <h3 className="mt-2 font-display text-xl">{t}</h3>
                  <p className="mt-2 text-sm text-muted">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
