/** docs: docs/04-componentes-e-padroes.md */
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/Reveal";

export function PageHero({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="border-b border-border">
      <Container className="pb-14 pt-14 sm:pb-20 sm:pt-20">
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
