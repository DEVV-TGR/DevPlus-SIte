/** docs: docs/06-projetos.md — casos de estudo e vídeo do Preguiça. · docs/04-componentes-e-padroes.md · docs/10-materiais-atelier.md */
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
import { Ambiente } from "@/components/paginas/Ambiente";
import { MaterialSurface } from "@/components/atelier/MaterialSurface";
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
          esquerda e a ficha, que é opaca, tapa-o do outro lado. O primeiro
          posto é mais pequeno e mais encostado ao canto do que nas outras
          páginas: a capa já não é uma imagem opaca a sangrar que o tapava, e
          em escala 1,6 ele pousava em cima do nome do projeto. */}
      <Cruz
        postos={[
          { p: 0.0, s: 1.0, x: 44, y: -30, r: 8, c: "var(--primary)" },
          { p: 0.4, s: 0.5, x: 44, y: 24, r: 0, c: "var(--paper-muted)" },
          { p: 0.76, s: 0.55, x: 46, y: -22, r: 6, c: "var(--primary)" },
          { p: 1.0, s: 1.3, x: 40, y: 30, r: 0, c: "var(--primary)" },
        ]}
      />

      {/* A CAPA, EXPOSTA
          Continua a ser o único sítio do site onde o trabalho ocupa o ecrã,
          e continua a ser a captura real do site. O que mudou foi o lugar do
          título. A sangrar, o nome do projeto ficava **por cima** da captura,
          e a captura é uma página com os seus próprios títulos: no Império
          lia-se "Que viatura procura?" atravessado pelo "Império Auto
          Concept", com o véu a escurecer o trabalho para salvar o texto.
          Agora o nome vem primeiro, sobre o ambiente do atelier, e a captura
          logo a seguir, inteira e sem véu, numa placa com espessura. */}
      <section
        id="caso-capa"
        className="relative overflow-hidden px-4 pb-4 pt-36 sm:px-8 sm:pt-32"
      >
        <Ambiente corte="topo" alvo="caso-capa" />

        {/* A saída fica no canto, e não por cima do título: centrada, uma
            seta de voltar lê-se como parte do cabeçalho do projeto. */}
        <Link
          href="/portfolio"
          className="absolute left-4 top-[5rem] z-[2] inline-flex min-h-11 items-center px-2 text-sm text-muted transition-colors hover:text-ink sm:left-6"
        >
          ← Portfólio
        </Link>

        <div className="relative z-[1] mx-auto w-full max-w-6xl px-2 text-center sm:px-0">
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

        {/* A placa: a proporção é a das capas (8:5), por isso a captura
            entra inteira, sem corte. A aresta clara de cima e a sombra curta
            dão-lhe espessura; nada se mexe por cima do trabalho. */}
        <div
          aria-hidden
          className="relative mx-auto mt-12 w-full max-w-6xl sm:mt-16"
        >
          <div className="relative aspect-[8/5] overflow-hidden rounded-2xl border border-border-strong/40 bg-surface shadow-[inset_0_1px_0_color-mix(in_oklch,var(--ink)_14%,transparent),0_24px_48px_-16px_color-mix(in_oklch,var(--bg-deep)_80%,transparent)]">
            {project.image ? (
              <Image
                src={project.image}
                alt=""
                fill
                preload
                sizes="(min-width: 1200px) 72rem, 100vw"
                className="object-cover object-top"
              />
            ) : (
              <div className={cn("absolute inset-0", shape)} />
            )}
          </div>
        </div>
      </section>

      <Section className="relative">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-8">
              <div className="space-y-10">
                <div>
                  <h2 className="font-display text-[clamp(1.5rem,3vw,2.2rem)] font-bold tracking-[-0.03em]">
                    O que era preciso
                  </h2>
                  <p className="mt-3 max-w-[62ch] text-lg leading-[1.55] text-muted">
                    {project.overview}
                  </p>
                </div>
                <div>
                  <h2 className="font-display text-[clamp(1.5rem,3vw,2.2rem)] font-bold tracking-[-0.03em]">
                    O que fizemos
                  </h2>
                  <p className="mt-3 max-w-[62ch] text-lg leading-[1.55] text-muted">
                    {project.contribution}
                  </p>
                </div>
              </div>
            </Reveal>

            {/* A FICHA FICA
                Numa leitura desta dimensão, a ficha presa é o que impede que
                se perca de quem é o projeto a meio do segundo parágrafo. Leva
                fundo próprio e não só borda: o "+" passa por trás, e sobre uma
                caixa transparente atravessava as etiquetas. */}
            <div className="lg:col-span-4">
              {/* O `h-full` é o que deixa a ficha prender. Um `sticky` só
                  anda dentro do pai, e o pai era o `Reveal`, da altura exata
                  da ficha: não havia percurso. Esticado à coluna, há. */}
              <Reveal delay={0.08} className="h-full">
                {/* A ficha é uma placa: alumínio grafite, opaca, presa ao lado
                    do texto. Não se inclina — está ao lado de uma leitura
                    longa, e um objeto a mexer na margem tira o olho da
                    frase. O `sticky` vive num `div` próprio porque o material
                    ocupa 100% da altura do pai. */}
                <div className="lg:sticky lg:top-[18vh]">
                  <MaterialSurface finish="graphite" interactive={false}>
                    <dl className="grid gap-5">
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
                                <span
                                  aria-hidden
                                  className="mr-1.5 font-bold text-primary"
                                >
                                  +
                                </span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                      {project.url ? (
                        <Button
                          href={project.url}
                          variant="primary"
                          className="w-full"
                        >
                          Visitar site
                        </Button>
                      ) : null}
                    </dl>
                  </MaterialSurface>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {project.slug === "cafe-preguica" ? (
        <Section top={false} className="relative">
          <Container>
            <div className="grid items-center gap-8 rounded-2xl bg-surface p-6 sm:p-10 md:grid-cols-[1fr_minmax(0,340px)]">
              <div>
                <p className="mb-4 text-sm text-primary">
                  Do espaço físico para o digital
                </p>
                <h2 className="home-heading max-w-[16ch]">
                  A ementa está
                  <br />
                  mesmo à mão.
                </h2>
                <p className="mt-5 max-w-[42ch] text-lg leading-relaxed text-muted">
                  Ler o QR code ou aproximar o telemóvel do NFC. Dois caminhos
                  na mesma mesa para abrir a carta do Café Preguiça.
                </p>
              </div>
              <figure>
                <video
                  controls
                  playsInline
                  preload="none"
                  poster="/projetos/preguica-nfc.jpg"
                  width={720}
                  height={1280}
                  aria-label="Demonstração do suporte com QR code e NFC numa mesa do Café Preguiça"
                  className="max-h-[65svh] w-full rounded-xl bg-bg object-contain"
                >
                  <source src="/projetos/preguica-nfc.mp4" type="video/mp4" />O
                  teu navegador não suporta vídeo. Podes abrir a ementa lendo o
                  QR code ou aproximando um telemóvel compatível do NFC.
                </video>
                <figcaption className="mt-3 text-sm text-muted">
                  QR code e NFC nas mesas do Café Preguiça. Vídeo demonstrativo.
                </figcaption>
              </figure>
            </div>
          </Container>
        </Section>
      ) : null}

      {next.slug !== slug ? (
        <Section top={false} className="relative">
          <Container>
            <div className="border-t border-border pt-10">
              <p className="text-sm text-muted">Próximo projeto</p>
              <Link
                href={`/portfolio/${next.slug}`}
                className="group mt-2 inline-flex min-h-11 items-center gap-3 font-display text-3xl font-semibold tracking-tight transition-colors hover:text-primary sm:text-4xl"
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
