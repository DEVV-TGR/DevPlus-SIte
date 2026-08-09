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
  description: `Projetos recentes da ${site.name} — sites, menus digitais e plataformas feitos à medida de cada negócio.`,
};

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfólio"
        title="Trabalho selecionado."
        intro="Alguns dos projetos mais recentes. Todos começaram da mesma maneira: uma folha em branco e uma conversa."
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

      <Section top={false}>
        <Container>
          <Reveal>
            <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-8 sm:flex-row sm:items-center sm:justify-between sm:p-12">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  O próximo pode ser o teu.
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted">
                  Conta-nos o que tens em mente. Não precisas de ter tudo
                  decidido para nos falares.
                </p>
              </div>
              <Button href="/contacto" variant="primary" className="shrink-0">
                Vamos a isso
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
