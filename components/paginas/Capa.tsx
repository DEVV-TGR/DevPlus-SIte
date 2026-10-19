/** docs: docs/04-componentes-e-padroes.md · docs/10-materiais-atelier.md */
import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";
import { MaterialGround } from "@/components/atelier/MaterialGround";

/** Capas interiores: vidro verde em Sobre, cristal nos serviços e cetim no portfólio.
 * Mesma luz e tipografia, com silhuetas distintas por função. */
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
  title: ReactNode;
  intro?: string;
  /** Três números que dizem o tamanho do que vem a seguir. Opcional. */
  contas?: { n: string; label: string }[];
}) {
  return (
    <section
      id={id}
      className={`interior-cover relative isolate grid content-center px-6 sm:px-8 ${ambiente === "espelho" ? "capitulo-verde" : "capitulo-base"}`}
    >
      <MaterialGround finish={ambiente === "espelho" ? "glass" : ambiente === "margens" ? "satin" : "crystal"} />
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <p className="sr-only">
            {eyebrow}
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="t-capa mt-4 max-w-[20ch] font-display font-titulo">
            {title}
          </h1>
        </Reveal>
        {intro ? (
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-[46ch] text-lg text-[var(--cover-muted)]">{intro}</p>
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
