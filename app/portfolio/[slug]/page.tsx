import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Cruz } from "@/components/home/Cruz";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/Reveal";
import { CaseStudyJsonLd } from "@/components/JsonLd";
import { projects, getProject } from "@/lib/projects";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  // Sem `images`, partilhar um caso de estudo mostrava o cartão genérico do
  // site em vez da capa do projeto. Quem não tem capa cai no cartão global.
  return pageMetadata({
    path: `/portfolio/${project.slug}`,
    title: project.name,
    socialTitle: `${project.name} — ${project.category}`,
    description: project.summary,
    type: "article",
    ...(project.image
      ? {
          images: [
            {
              url: project.image,
              alt: project.imageAlt ?? `Capa do projeto ${project.name}`,
            },
          ],
        }
      : {}),
  });
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const idx = projects.findIndex((p) => p.slug === slug);
  const next = projects[(idx + 1) % projects.length];
  const shape = project.accent === "accent" ? "bg-accent/15" : "bg-primary/15";

  return (
    <>
      <CaseStudyJsonLd
        name={project.name}
        description={project.summary}
        slug={project.slug}
        image={project.image}
        year={project.year}
      />
      {/* O "+" fica todo do lado direito nesta página: o texto do caso corre à
          esquerda e a ficha, que é opaca, tapa-o do outro lado. */}
      <Cruz
        postos={[
          { p: 0.0, s: 1.6, x: 36, y: -22, r: 8, c: "var(--primary)" },
          { p: 0.4, s: 0.5, x: 44, y: 24, r: 0, c: "var(--paper-muted)" },
          { p: 0.76, s: 0.55, x: 46, y: -22, r: 6, c: "var(--primary)" },
          { p: 1.0, s: 1.3, x: 40, y: 30, r: 0, c: "var(--primary)" },
        ]}
      />

      {/* A CAPA, A SANGRAR
          É o único sítio do site onde uma fotografia ocupa o ecrã todo: aqui o
          assunto é o trabalho, e o trabalho vê-se. Antes eram dois blocos — um
          cabeçalho com o nome e, por baixo, a capa numa caixa com o nome outra
          vez — e o nome aparecia duas vezes com um scroll de intervalo. */}
      <section className="relative grid min-h-[82svh] place-items-center overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          {project.image ? (
            <Image
              src={project.image}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className={cn("absolute inset-0", shape)} />
          )}
          {/* Véu de baixo para cima: o texto assenta sobre capas claras e
              escuras sem trocar de cor. */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/25" />
        </div>

        {/* A saída fica no canto, e não por cima do título: centrada, uma
            seta de voltar lê-se como parte do cabeçalho do projeto. */}
        <Link
          href="/portfolio"
          className="absolute left-4 top-[5rem] z-[2] inline-flex min-h-11 items-center px-2 text-sm text-muted transition-colors hover:text-ink sm:left-6"
        >
          ← Portfólio
        </Link>

        <div className="relative z-[1] mx-auto w-full max-w-6xl px-6 text-center sm:px-8">
          <Reveal delay={0.05}>
            <p className="text-sm uppercase tracking-[0.18em] text-primary">
              {project.category} · {project.year}
              {project.status === "em-curso" ? " · Em curso" : ""}
            </p>
            <h1 className="t-capa mt-4 font-display font-extrabold">
              {project.name}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-[54ch] text-lg text-muted">
              {project.summary}
            </p>
          </Reveal>
        </div>
      </section>

      <Section className="relative">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-8">
              <div className="space-y-10">
                <div>
                  <h2 className="font-display text-[clamp(1.5rem,3vw,2.2rem)] font-bold tracking-[-0.03em]">O que era preciso</h2>
                  <p className="mt-3 max-w-[62ch] text-lg leading-[1.55] text-muted">{project.overview}</p>
                </div>
                <div>
                  <h2 className="font-display text-[clamp(1.5rem,3vw,2.2rem)] font-bold tracking-[-0.03em]">O que fizemos</h2>
                  <p className="mt-3 max-w-[62ch] text-lg leading-[1.55] text-muted">{project.contribution}</p>
                </div>
              </div>
            </Reveal>

            {/* A FICHA FICA
                Numa leitura desta dimensão, a ficha presa é o que impede que
                se perca de quem é o projeto a meio do segundo parágrafo. Leva
                fundo próprio e não só borda: o "+" passa por trás, e sobre uma
                caixa transparente atravessava as etiquetas. */}
            <div className="lg:col-span-4">
              <Reveal delay={0.08}>
                <dl className="grid gap-5 rounded-2xl border border-border bg-surface p-6 lg:sticky lg:top-[18vh]">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-muted">
                      Cliente
                    </dt>
                    <dd className="mt-1 font-display font-semibold">
                      {project.client}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-muted">
                      Setor
                    </dt>
                    <dd className="mt-1 font-display font-semibold">
                      {project.category}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-muted">
                      Ano
                    </dt>
                    <dd className="mt-1 font-display font-semibold tabular-nums">
                      {project.year}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-muted">
                      O que entrou
                    </dt>
                    <dd>
                      <ul className="mt-2 grid gap-1 text-sm">
                        {project.services.map((s) => (
                          <li key={s} className="text-muted">
                            <span aria-hidden className="mr-1.5 font-bold text-primary">
                              +
                            </span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  {project.url ? (
                    <Button href={project.url} variant="primary" className="w-full">
                      Visitar site
                    </Button>
                  ) : null}
                </dl>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {next.slug !== slug ? (
        <Section top={false} className="relative">
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
