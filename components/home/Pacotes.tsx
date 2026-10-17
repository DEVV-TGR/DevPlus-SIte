/** docs: docs/04-componentes-e-padroes.md · docs/05-servicos.md */

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { packages } from "@/lib/packages";
import { cn } from "@/lib/utils";

/**
 * Por onde um projeto costuma começar.
 *
 * **Linhas comparáveis, não cartões.** Nome, descrição, o que inclui e o
 * pedido de proposta ficam nas mesmas colunas, e lê-se de cima para baixo como
 * uma tabela editorial. Em tablet passam a duas colunas, no telemóvel a uma.
 *
 * O pacote em destaque (`featured`, em `lib/packages.ts`) tem o nome e o filete
 * em laranja **e** o botão cheio em vez de contorno — o sinal não pode ser só
 * cor (WCAG 1.4.1). Não leva etiqueta nem preço: ver `docs/05`.
 */
export function Pacotes() {
  return (
    <Section className="home-packages">
      <Container>
        <h2 className="home-heading max-w-[19ch]">
          Por onde podemos <em className="font-medium text-primary">começar.</em>
        </h2>
        <p className="mt-4 max-w-xl text-muted">
          Cada projeto é diferente, mas costuma partir de um destes pontos.
        </p>
        <div className="package-rows">
          {packages.map((p) => (
            <article
              key={p.name}
              className={cn("package-row", p.featured && "package-row-featured")}
            >
              <h3>{p.name}</h3>
              <p>{p.desc}</p>
              <ul>
                {p.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <Button
                href="/contacto"
                variant={p.featured ? "primary" : "outline"}
              >
                Pedir proposta <span aria-hidden>↗</span>
              </Button>
            </article>
          ))}
        </div>
        <div className="package-other">
          <p>Nenhum destes é o teu caso?</p>
          <Button href="/servicos" variant="ghost">
            Ver todos os serviços <span aria-hidden>↗</span>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
