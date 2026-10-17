/** docs: docs/04-componentes-e-padroes.md · docs/05-servicos.md · docs/10-materiais-atelier.md */

import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { MaterialGround } from "@/components/atelier/MaterialGround";
import { MaterialSurface } from "@/components/atelier/MaterialSurface";
import { atelierAssets } from "@/components/atelier/assets";
import { packages } from "@/lib/packages";

/**
 * Por onde um projeto costuma começar.
 *
 * **Placas comparáveis, cada uma com o seu objeto.** O objeto à esquerda dá o
 * carácter — uma folha para a landing, camadas para o website, um expositor
 * para a loja — e o resto fica em colunas que se comparam de cima para baixo:
 * nome e descrição, o que inclui, pedido de proposta. Em tablet a lista passa
 * para baixo do texto; no telemóvel o objeto fica junto ao título e a ação a
 * toda a largura.
 *
 * A placa é a mesma `MaterialSurface` nos dois temas: grafite no escuro,
 * cristal no claro (docs/10). O Website, que é o `featured` de
 * `lib/packages.ts`, vai em forest no escuro e mint no claro, **e** com o botão
 * cheio em vez de contorno — o sinal não pode ser só cor (WCAG 1.4.1). Não leva
 * etiqueta nem preço: ver `docs/05`.
 *
 * O capítulo é **quente** (cobre sobre grafite no escuro, peach no claro), com
 * fundo de cetim.
 */
const OBJETOS: Record<string, (typeof atelierAssets)[keyof typeof atelierAssets]> = {
  "Landing page": atelierAssets.landing,
  Website: atelierAssets.development,
  "Loja online": atelierAssets.commerce,
};

export function Pacotes() {
  return (
    <Section className="home-packages capitulo-quente relative isolate">
      <MaterialGround finish="satin" />
      <Container>
        <h2 className="home-heading max-w-[19ch]">
          Por onde podemos <em className="font-medium text-acento">começar.</em>
        </h2>
        <p className="mt-4 max-w-xl text-quente-muted">
          Cada projeto é diferente, mas costuma partir de um destes pontos.
        </p>
        <div className="package-bench">
          {packages.map((p) => {
            const objeto = OBJETOS[p.name];
            return (
              <article key={p.name}>
                <MaterialSurface
                  finish={p.featured ? "forest" : "graphite"}
                  padding="none"
                >
                  <div className="package-plate">
                    <div className="package-object" aria-hidden>
                      {objeto && (
                        <Image
                          src={objeto.src}
                          alt=""
                          width={objeto.width}
                          height={objeto.height}
                          sizes="(min-width: 1024px) 132px, (min-width: 601px) 112px, 76px"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="package-copy">
                      <h3>{p.name}</h3>
                      <p>{p.desc}</p>
                    </div>
                    <ul className="package-points">
                      {p.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                    <Button
                      href="/contacto"
                      variant={p.featured ? "primary" : "outline"}
                      className="package-cta"
                    >
                      Pedir proposta <span aria-hidden>↗</span>
                    </Button>
                  </div>
                </MaterialSurface>
              </article>
            );
          })}
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
