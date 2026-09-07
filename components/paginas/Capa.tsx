/** docs: docs/04-componentes-e-padroes.md */
import { Reveal } from "@/components/Reveal";

/**
 * A capa de uma página interior: um ecrã só, com o título a ocupá-lo.
 *
 * Substitui o `PageHero` nas quatro páginas que ganharam composição própria —
 * o `PageHero` continua a servir a `/privacidade`, que é texto e não precisa de
 * mais do que um cabeçalho. A diferença não é de tamanho: o `PageHero` é um
 * cabeçalho por cima de conteúdo, isto é **um capítulo**, com o ground e o vão
 * que a página inteira usa a seguir.
 *
 * Não leva figura. A figura é o pico da página inicial, e repeti-la em cinco
 * capas ao mesmo tempo gastava-a — quem entra pelo `/servicos` via a mesma
 * composição que viu na entrada, mais pequena.
 */
export function Capa({
  eyebrow,
  title,
  intro,
  contas,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  /** Três números que dizem o tamanho do que vem a seguir. Opcional. */
  contas?: { n: string; label: string }[];
}) {
  return (
    <section className="relative grid min-h-[78svh] content-center px-6 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mt-4 max-w-[14ch] font-display text-[clamp(2.4rem,7vw,5.6rem)] font-extrabold leading-[0.92] tracking-[-0.05em]">
            {title}
          </h1>
        </Reveal>
        {intro ? (
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-[46ch] text-lg text-muted">{intro}</p>
          </Reveal>
        ) : null}
        {contas?.length ? (
          <Reveal delay={0.15}>
            <dl className="mt-10 flex gap-8 sm:gap-12">
              {contas.map((c) => (
                <div key={c.label}>
                  <dt className="sr-only">{c.label}</dt>
                  <dd className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-extrabold tabular-nums tracking-[-0.03em]">
                    {c.n}
                  </dd>
                  <p
                    aria-hidden
                    className="text-xs uppercase tracking-[0.18em] text-muted"
                  >
                    {c.label}
                  </p>
                </div>
              ))}
            </dl>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
