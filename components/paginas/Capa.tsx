/** docs: docs/04-componentes-e-padroes.md · docs/10-materiais-atelier.md */
import { Reveal } from "@/components/Reveal";
import { Ambiente } from "@/components/paginas/Ambiente";

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
 *
 * O que leva, desde outubro, é **ambiente**: o mesmo render do atelier por
 * trás, com um corte por página (`ambiente`). É profundidade, não figura —
 * fica por baixo do "+" e mexe-se até 12px com o rato, nunca com o scroll.
 */
export function Capa({
  eyebrow,
  title,
  intro,
  contas,
  id,
  ambiente = "pleno",
}: {
  /** O `id` da secção, que é também a região onde o ambiente ouve o rato. */
  id: string;
  ambiente?: "pleno" | "margens" | "espelho";
  eyebrow: string;
  title: string;
  intro?: string;
  /** Três números que dizem o tamanho do que vem a seguir. Opcional. */
  contas?: { n: string; label: string }[];
}) {
  return (
    <section
      id={id}
      className="relative grid min-h-[78svh] content-center px-6 sm:px-8"
    >
      <Ambiente
        corte={ambiente}
        alvo={id}
        intensidade={ambiente === "pleno" ? "standard" : "quiet"}
      />
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-acento">
            {eyebrow}
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="t-capa mt-4 max-w-[14ch] font-display font-titulo">
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
                  <dd className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-titulo tabular-nums tracking-[-0.03em]">
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
