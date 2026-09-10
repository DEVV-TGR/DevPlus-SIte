/** docs: docs/04-componentes-e-padroes.md · docs/05-servicos.md */

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/Reveal";
import { packages } from "@/lib/packages";
import { cn } from "@/lib/utils";

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
 *
 * **O pacote mais escolhido é laranja, não é uma etiqueta.** Estava a
 * distinguir-se só por um rótulo no canto, e numa fila de quatro colunas um
 * rótulo pequeno não faz o olho parar. Agora é o card inteiro que muda de
 * ground — a etiqueta fica na mesma, porque o sinal não pode ser **só** cor
 * (WCAG 1.4.1) e é ela que o diz por escrito.
 *
 * **O hover é curto**: 200 ms, como o dos botões. É resposta a um gesto, não
 * uma animação de entrada — e as duas coisas que faz são separáveis de
 * propósito. O contorno acende sempre; o deslocamento é `motion-safe`, por
 * isso quem pediu movimento reduzido fica só com a mudança de cor.
 *
 * O anel acende **com a cor que o card não tem**: laranja sobre os cremes e
 * sobre o `surface`, creme sobre o card laranja. Um anel `primary-ink` no
 * laranja parecia a escolha óbvia e não é: o anel desenha-se **por fora** da
 * caixa, ou seja sobre o ground escuro da secção, onde `primary-ink` e `bg`
 * estão a 0,02 de luminosidade um do outro. Não se via — e em movimento
 * reduzido, onde o anel é o único sinal, esse card ficava sem resposta.
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
                <div
                  className={cn(
                    "relative grid h-full content-start gap-2 rounded-2xl p-6",
                    "ring-2 ring-transparent transition-[transform,box-shadow] duration-200 ease-out motion-safe:hover:-translate-y-1",
                    p.featured
                      ? "bg-primary text-primary-ink hover:ring-ink"
                      : "bg-paper text-paper-ink hover:ring-primary",
                  )}
                >
                  {p.featured ? (
                    <span className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl bg-primary-ink px-3 py-1 text-xs text-ink">
                      Mais escolhido
                    </span>
                  ) : null}
                  <h3 className="font-display text-lg font-semibold tracking-tight">
                    {p.name}
                  </h3>
                  <p
                    className={cn(
                      "text-sm",
                      p.featured ? "text-primary-ink/85" : "text-paper-muted",
                    )}
                  >
                    {p.desc}
                  </p>
                  <ul
                    className={cn(
                      "mt-1 grid gap-1 text-sm",
                      p.featured ? "text-primary-ink/85" : "text-paper-muted",
                    )}
                  >
                    {p.points.map((pt) => (
                      <li key={pt}>
                        {/* Sobre o card laranja o "+" laranja desaparecia. A
                            tinta do próprio ground é o que sobra — e dá 7.26:1,
                            mais do que o "+" tem sobre o creme. */}
                        <span
                          aria-hidden
                          className={cn(
                            "mr-2 font-extrabold",
                            p.featured ? "text-primary-ink" : "text-primary",
                          )}
                        >
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
              <div className="group grid h-full place-content-center gap-5 rounded-2xl border border-border bg-surface p-6 text-center ring-2 ring-transparent transition-[transform,box-shadow] duration-200 ease-out hover:ring-primary motion-safe:hover:-translate-y-1">
                <h3 className="font-display text-xl font-semibold tracking-tight">
                  Nenhum destes é o teu caso?
                </h3>
                <span
                  aria-hidden
                  className="mx-auto grid h-18 w-18 place-items-center rounded-full bg-primary text-2xl text-primary-ink transition-transform duration-200 ease-out motion-safe:group-hover:translate-x-1"
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
