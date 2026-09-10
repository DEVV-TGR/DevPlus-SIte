/** docs: docs/04-componentes-e-padroes.md · docs/05-servicos.md */

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/Reveal";
import { packages } from "@/lib/packages";

/**
 * Por onde um projeto costuma começar.
 *
 * Três cards e um quarto que **não é um card, é um caminho** — leva à página
 * de serviços para quem não se revê em nenhum dos três. Os botões vivem **por
 * fora** da caixa, por baixo: é o que separa esta grelha de três cartões com
 * um botão lá dentro.
 *
 * As quatro colunas têm a mesma altura porque a grelha estica e cada uma é
 * duas linhas — caixa e botão. Deixadas ao conteúdo, o card de CTA ficava um
 * terço mais baixo que os outros e os botões desalinhavam.
 */
export function Pacotes() {
  return (
    <Section top={false}>
      <Container>
        <Reveal>
          <h2 className="max-w-[16ch] font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Por onde podemos começar.
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            Cada projeto é diferente, mas costuma partir de um destes pontos.
          </p>
        </Reveal>

        <div className="mt-10 grid items-stretch gap-4 lg:grid-cols-4">
          {packages.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.06} className="grid">
              <div className="grid h-full grid-rows-[1fr_auto] gap-3">
                <div className="relative grid h-full content-start gap-2 rounded-2xl bg-paper p-6 text-paper-ink">
                  {p.featured ? (
                    <span className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl bg-primary-ink px-3 py-1 text-xs text-ink">
                      Mais escolhido
                    </span>
                  ) : null}
                  <h3 className="font-display text-lg font-semibold tracking-tight">
                    {p.name}
                  </h3>
                  <p className="text-sm text-paper-muted">{p.desc}</p>
                  <ul className="mt-1 grid gap-1 text-sm text-paper-muted">
                    {p.points.map((pt) => (
                      <li key={pt}>
                        <span aria-hidden className="mr-2 font-extrabold text-primary">
                          +
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button href="/contacto" variant="primary" className="w-full justify-center">
                  Pedir proposta
                </Button>
              </div>
            </Reveal>
          ))}

          <Reveal delay={packages.length * 0.06} className="grid">
            <div className="grid h-full grid-rows-[1fr_auto] gap-3">
              <div className="grid h-full place-content-center gap-5 rounded-2xl border border-border bg-surface p-6 text-center">
                <h3 className="font-display text-xl font-semibold tracking-tight">
                  Nenhum destes é o teu caso?
                </h3>
                <span
                  aria-hidden
                  className="mx-auto grid h-18 w-18 place-items-center rounded-full bg-primary text-2xl text-primary-ink"
                >
                  →
                </span>
              </div>
              <Button href="/servicos" variant="outline" className="w-full justify-center">
                Ver todos os serviços
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
