/** docs: docs/06-projetos.md · docs/04-componentes-e-padroes.md · docs/10-materiais-atelier.md */
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Capa } from "@/components/paginas/Capa";
import { Cruz, POSTOS_PAGINA } from "@/components/home/Cruz";
import { Curva } from "@/components/home/Curva";
import Image from "next/image";
import Link from "next/link";
import { PortfolioIndice } from "@/components/paginas/PortfolioIndice";
import { Carril } from "@/components/paginas/Carril";
import { InstagramLink } from "@/components/InstagramLink";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/Reveal";
import { MaterialSurface } from "@/components/atelier/MaterialSurface";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/portfolio",
  title: "Portfólio",
  description: `Projetos recentes da ${site.name} — sites, menus digitais e plataformas feitos à medida de cada negócio.`,
});

/**
 * O portfólio, em índice.
 *
 * **A grelha de `ProjectCard` saiu daqui.** Não por ser má — é a mesma que
 * continua a servir os projetos relacionados no fim de cada caso de estudo —
 * mas porque uma grelha de capas diz o mesmo que a fila da página inicial, e
 * duas páginas a dizer a mesma coisa da mesma maneira são uma página mostrada
 * duas vezes. Aqui os nomes vêm em coluna, grandes, e a capa do que se está a
 * ler aparece numa moldura que não se mexe: quem chega a esta página já veio
 * procurar, e um índice é a forma de quem procura.
 */
export default function PortfolioPage() {
  const noAr = projects.filter((p) => p.status === "concluido").length;

  return (
    <>
      <Cruz postos={POSTOS_PAGINA} />

      <Capa
        id="portfolio-capa"
        ambiente="margens"
        eyebrow="Portfólio"
        title="O trabalho, com nome e ano."
        intro="Restaurantes, um stand, serviços ao domicílio e uma plataforma. Todos começaram da mesma maneira: uma folha em branco e uma conversa."
        contas={[
          { n: String(projects.length).padStart(2, "0"), label: "projetos" },
          { n: String(noAr).padStart(2, "0"), label: "no ar" },
        ]}
      />
      <Curva forma="c" de="var(--bg)" cor="var(--bg-deep)" />

      <Section className="relative bg-bg-deep">
        <Container>
          <h2 className="sr-only">Os projetos</h2>
          <PortfolioIndice />
          <div className="md:hidden">
            <Carril rotulo="Projeto">
              {projects.map((p) => (
                <article key={p.slug} className="grid h-full content-start">
                  <Link
                    href={`/portfolio/${p.slug}`}
                    tabIndex={-1}
                    aria-hidden
                    className="relative m-3 mb-0 block aspect-[1.35] overflow-hidden rounded-[10px] bg-forest"
                  >
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt=""
                        fill
                        sizes="84vw"
                        className="object-cover object-top"
                      />
                    ) : (
                      /* Sem capa não se põe a de outro: fica o nome — ver docs/06. */
                      <span className="grid h-full place-items-center px-6 text-center font-display text-2xl font-titulo text-creme">
                        {p.name}
                      </span>
                    )}
                  </Link>
                  <div className="grid gap-3 p-5 pt-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-display text-[1.6rem] font-titulo leading-tight tracking-[-0.025em]">
                        <Link href={`/portfolio/${p.slug}`}>{p.name}</Link>
                      </h3>
                      <span className="text-sm tabular-nums text-muted">{p.year}</span>
                    </div>
                    <p className="text-sm text-muted">
                      {p.status === "em-curso" ? "Em desenvolvimento" : "Concluído"}
                    </p>
                    <ul className="flex flex-wrap gap-1.5" aria-label="Serviços">
                      {p.services.map((s) => (
                        <li key={s} className="rounded-full border border-border-strong px-2.5 py-1 text-sm">
                          {s}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/portfolio/${p.slug}`}
                      className="mt-2 flex min-h-11 items-center justify-between border-t border-border pt-3 text-sm font-medium"
                    >
                      Explorar projeto <span aria-hidden>→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </Carril>
          </div>
          <InstagramLink className="mt-10 border-b border-border-strong pb-1" />
        </Container>
      </Section>
      <Curva forma="a" de="var(--bg-deep)" cor="var(--bg)" />

      <Section className="relative">
        <Container>
          {/* O convite ganha vidro verde: é a única placa da página que não
              é trabalho, e a cor separa-a das capas sem mais um laranja. */}
          <Reveal>
            <MaterialSurface finish="forest" padding="none">
              {/* O padding vive aqui e não no `contentClassName`: o
                  `padding="none"` do material é CSS sem camada e ganha a
                  qualquer utilidade do Tailwind (docs/10). */}
              <div className="flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-12">
                <div>
                  <h2 className="t-seccao font-display font-titulo">
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
            </MaterialSurface>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
