import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/Reveal";
import { projects, getProject } from "@/lib/projects";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return projects
    .filter((p) => !p.placeholder)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.name, description: project.summary };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project || project.placeholder) notFound();

  const idx = projects.findIndex((p) => p.slug === slug);
  const next = projects[(idx + 1) % projects.length];
  const shape =
    project.accent === "accent" ? "bg-accent/15" : "bg-primary/15";

  return (
    <>
      <section className="border-b border-border">
        <Container className="pb-12 pt-14 sm:pt-20">
          <Reveal>
            <Link
              href="/portfolio"
              className="text-sm text-muted transition-colors hover:text-ink"
            >
              ← Portfólio
            </Link>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {project.name}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span>{project.client}</span>
              <span aria-hidden>·</span>
              <span>{project.category}</span>
              <span aria-hidden>·</span>
              <span>{project.year}</span>
            </div>
          </Reveal>
        </Container>
      </section>

      <Container className="pt-10">
        <Reveal>
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-surface-2">
            <div
              aria-hidden
              className={cn(
                "absolute -right-16 -top-16 h-72 w-72 rounded-full",
                shape,
              )}
            />
            <span className="absolute bottom-6 left-6 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {project.name}
            </span>
          </div>
        </Reveal>
      </Container>

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-8">
              <div className="space-y-10">
                <div>
                  <h2 className="font-display text-2xl">Visão geral</h2>
                  <p className="mt-3 text-muted">{project.overview}</p>
                </div>
                <div>
                  <h2 className="font-display text-2xl">O nosso papel</h2>
                  <p className="mt-3 text-muted">{project.contribution}</p>
                </div>
              </div>
            </Reveal>

            <Reveal className="lg:col-span-4" delay={0.08}>
              <div className="rounded-2xl border border-border bg-surface p-6">
                <h2 className="text-sm font-medium text-ink">Serviços</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {project.services.map((s) => (
                    <li
                      key={s}
                      className="rounded-full border border-border px-2.5 py-1 text-xs text-muted"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
                {project.url ? (
                  <div className="mt-6">
                    <Button
                      href={project.url}
                      variant="outline"
                      className="w-full"
                    >
                      Visitar site
                    </Button>
                  </div>
                ) : null}
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {!next.placeholder && next.slug !== slug ? (
        <Section className="pt-0">
          <Container>
            <div className="border-t border-border pt-10">
              <p className="text-sm text-muted">Próximo projeto</p>
              <Link
                href={`/portfolio/${next.slug}`}
                className="group mt-2 inline-flex items-center gap-3 font-display text-3xl font-semibold tracking-tight transition-colors hover:text-primary sm:text-4xl"
              >
                {next.name}
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
