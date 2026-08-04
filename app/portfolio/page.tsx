/** docs: docs/06-projetos.md */
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/PageHero";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/Reveal";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Portfólio",
  description: `Trabalho selecionado da ${site.name} — sites, plataformas e menus digitais desenhados e desenvolvidos de raiz.`,
};

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfólio"
        title="Trabalho selecionado."
        intro="Uma seleção de projetos recentes — cada um desenhado e construído de raiz, do conceito ao código."
      />

      <Section>
        <Container>
          <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2">
            {projects.map((p, i) => (
              <ProjectCard key={p.slug} project={p} index={i} />
            ))}
          </div>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <Reveal>
            <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-8 sm:flex-row sm:items-center sm:justify-between sm:p-12">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  O próximo pode ser o teu.
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted">
                  Conta-nos o que tens em mente. Respondemos em 24 a 48 horas
                  úteis.
                </p>
              </div>
              <Button href="/contacto" variant="primary" className="shrink-0">
                Começar um projeto
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
