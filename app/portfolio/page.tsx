import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/PageHero";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Portfólio",
  description:
    "Trabalho selecionado da XquisiteVision — sites e produtos digitais desenhados e desenvolvidos de raiz.",
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
    </>
  );
}
