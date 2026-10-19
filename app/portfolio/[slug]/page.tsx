/** docs: docs/06-projetos.md — casos de estudo e vídeo do Preguiça. · docs/04-componentes-e-padroes.md · docs/10-materiais-atelier.md */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Cruz } from "@/components/home/Cruz";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/Reveal";
import { CaseStudyJsonLd } from "@/components/JsonLd";
import { MaterialGround } from "@/components/atelier/MaterialGround";
import styles from "@/components/paginas/paginas.module.css";
import { MaterialSurface } from "@/components/atelier/MaterialSurface";
import { Dispositivos } from "@/components/paginas/Dispositivos";
import { Pecas } from "@/components/paginas/Pecas";
import { projects, getProject, notasDoCaso, capturas, pecasDoCaso, painelDoCaso } from "@/lib/projects";
import { pageMetadata } from "@/lib/seo";

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
  const notas = notasDoCaso[project.slug];
  const pecas = pecasDoCaso[project.slug];
  const painel = painelDoCaso[project.slug];

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

      {/* O PROJETO, PARA PERCORRER
          Outubro de 2026. O caso deixou de ser uma capa e dois parágrafos: o
          nome, os serviços e o próprio site em duas molduras — computador e
          telemóvel — que se percorrem por scroll. São capturas reais, não o
          site vivo; um clique abre o original. Os parágrafos longos passaram
          a tópicos curtos (`notasDoCaso`), por pedido do utilizador; o texto
          completo continua no catálogo. Ver docs/06. */}
      <section
        id="caso-capa"
        className="relative isolate capitulo-base overflow-hidden px-4 pb-10 pt-28 sm:px-8"
      >
        <MaterialGround finish="metal" />

        <div className="relative z-[1] mx-auto w-full max-w-6xl">
          <Link
            href="/portfolio"
            className="-ml-2 inline-flex min-h-11 items-center px-2 text-sm text-muted transition-colors hover:text-ink"
          >
            ← Portfólio
          </Link>
          <Reveal delay={0.05}>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-sm text-acento">
                  {project.category} · {project.year} ·{" "}
                  {project.status === "em-curso" ? "Em desenvolvimento" : "Concluído"}
                </p>
                <h1 className="interior-heading mt-3 font-display font-titulo">
                  {project.name}
                </h1>
              </div>
              <ul className="flex max-w-md flex-wrap gap-1.5 sm:justify-end" aria-label="Serviços">
                {project.services.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-border-strong px-3 py-1 text-sm"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Sem site no ar, mostra-se o que vai ter, em desenho (Pecas);
              com site, o próprio site em duas molduras (Dispositivos). */}
          <div className="mt-10">
            {pecas && !capturas[project.slug] ? (
              <Pecas
                pecas={pecas}
                variante="planta"
                intro="Ainda não está no ar. Isto é o que vai ter:"
              />
            ) : (
              <Dispositivos projeto={project} captura={capturas[project.slug]} />
            )}
          </div>
        </div>
      </section>

      {notas ? (
        <Section className="relative isolate capitulo-base">
          <MaterialGround finish="matte" />
          <Container>
            <div className={styles.casoNotas}>
              {(
                [
                  ["O que era preciso", notas.preciso],
                  ["O que fizemos", notas.feito],
                ] as const
              ).map(([titulo, itens]) => (
                <Reveal key={titulo} className="border-t border-border-strong pt-6">
                  <h2 className="t-cartao font-display font-titulo">
                    {titulo}
                  </h2>
                  <ul className="mt-4 grid gap-2.5 text-lg text-muted">
                    {itens.map((t) => (
                      <li key={t} className="flex gap-3">
                        <span aria-hidden className="text-acento">
                          •
                        </span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* O PAINEL POR DENTRO
          Prints reais do painel de gestão, no mesmo cartão das peças da
          Damira. Só para quem tem painel entregue (`painelDoCaso`). */}
      {painel ? (
        <Section top={false} className="relative">
          <Container>
            <Reveal>
              <h2 className="home-heading">
                O painel <em>por dentro.</em>
              </h2>
              <p className="mt-4 max-w-[48ch] text-lg text-muted">
                O que a equipa usa para mudar o site sem nos ligar.
              </p>
            </Reveal>
            <div className="mt-10">
              <Pecas pecas={painel} variante="janelas" />
            </div>
          </Container>
        </Section>
      ) : null}

      {project.slug === "cafe-preguica" ? (
        <Section top={false} className="relative">
          <Container>
            <MaterialSurface padding="none" interactive={false}>
              <div className="grid items-center gap-8 p-6 sm:p-10 md:grid-cols-[1fr_minmax(0,300px)]">
                <div>
                  <p className="mb-4 text-sm text-acento">
                    Do espaço físico para o digital
                  </p>
                  <h2 className="home-heading max-w-[16ch]">
                    A ementa está
                    <br />
                    <em>mesmo à mão.</em>
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
                    className="max-h-[65svh] w-full rounded-xl bg-bg-deep object-contain"
                  >
                    <source src="/projetos/preguica-nfc.mp4" type="video/mp4" />O
                    teu navegador não suporta vídeo. Podes abrir a ementa lendo o
                    QR code ou aproximando um telemóvel compatível do NFC.
                  </video>
                  <figcaption className="mt-3 text-sm text-muted">
                    QR code e NFC nas mesas do Café Preguiça. Vídeo sem som.
                  </figcaption>
                </figure>
              </div>
            </MaterialSurface>
          </Container>
        </Section>
      ) : null}

      {next.slug !== slug ? (
        <Section top={false} className="relative">
          <Container>
            <MaterialSurface padding="none">
              <Link
                href={`/portfolio/${next.slug}`}
                className="group flex min-h-24 items-center justify-between gap-6 p-6 sm:p-8"
              >
                <span>
                  <span className="block text-sm text-muted">Próximo projeto</span>
                  <span className="mt-1 block font-display text-3xl font-titulo tracking-[-0.025em] sm:text-4xl">
                    {next.name}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="text-2xl transition-transform duration-300 motion-safe:group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </MaterialSurface>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
