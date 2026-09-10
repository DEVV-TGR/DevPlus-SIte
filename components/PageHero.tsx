/** docs: docs/04-componentes-e-padroes.md */
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/Reveal";
import { PageHeroPlanes, type Vista } from "@/components/PageHeroPlanes";

/**
 * O cabeçalho das páginas internas.
 *
 * Setembro de 2026: ganhou o mesmo mundo do hero da homepage, em versão
 * contida. Era texto sobre fundo liso com a metade direita vazia, em quatro
 * páginas ao mesmo tempo — e como todas passam por aqui, um ficheiro muda-as a
 * todas.
 *
 * A `vista` só muda o enquadramento, nunca o mundo: as páginas têm de parecer
 * o mesmo sítio visto de ângulos diferentes, e não cinco sítios.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  vista,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  vista?: Vista;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <PageHeroPlanes vista={vista} />

      <Container className="relative z-10 pb-14 pt-14 sm:pb-20 sm:pt-20">
        {eyebrow ? (
          <Reveal>
            <p className="text-sm font-medium text-primary">{eyebrow}</p>
          </Reveal>
        ) : null}
        <Reveal delay={0.05}>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
        </Reveal>
        {intro ? (
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-xl text-lg text-muted">{intro}</p>
          </Reveal>
        ) : null}
      </Container>
    </section>
  );
}
