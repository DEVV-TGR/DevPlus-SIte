/** docs: docs/04-componentes-e-padroes.md · docs/05-servicos.md · docs/10-materiais-atelier.md */

import { PackagePlates } from "@/components/PackagePlates";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { MaterialGround } from "@/components/atelier/MaterialGround";

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
export function Pacotes() {
  /* `top={false}`: o capítulo abre com a `--abertura`, como os outros. */
  return (
    <Section
      top={false}
      className="home-packages capitulo-quente relative isolate pt-[var(--abertura)]"
    >
      <MaterialGround finish="satin" />
      <Container>
        <h2 className="home-heading max-w-[19ch]">
          Por onde podemos <em className="font-medium text-acento">começar.</em>
        </h2>
        <p className="mt-4 max-w-xl text-quente-muted">
          Cada projeto é diferente, mas costuma partir de um destes pontos.
        </p>
        <PackagePlates />
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
