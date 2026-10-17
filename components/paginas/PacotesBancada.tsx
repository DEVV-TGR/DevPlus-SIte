/** docs: docs/04-componentes-e-padroes.md · docs/05-servicos.md · docs/10-materiais-atelier.md */
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/Reveal";
import { MaterialSurface } from "@/components/atelier/MaterialSurface";
import { atelierAssets } from "@/components/atelier/assets";
import { packages } from "@/lib/packages";
import { cn } from "@/lib/utils";

/**
 * "Por onde podemos começar", na `/servicos`: uma bancada de três placas.
 *
 * Os dados são os de `lib/packages.ts`, sem tirar nem pôr — o que muda é o
 * suporte. Cada placa tem um objeto pequeno que lhe dá carácter: a landing é
 * uma folha só, o website é a composição de camadas, a loja é um expositor.
 * O objeto **não** é o assunto: fica numa faixa própria por cima do título, e
 * a comparação continua a ler-se de cima a baixo, coluna a coluna, sem nada
 * escondido atrás de um hover.
 *
 * O enquadramento do objeto alterna (esquerda, centro, direita); a posição
 * das colunas não — três colunas comparáveis têm de alinhar título com título.
 *
 * A placa inclina até 4° com o rato (o `MaterialSurface` trata disso, e
 * endireita-se assim que o foco entra no botão). O destaque do Website é a
 * aresta laranja e o botão `primary` — e a etiqueta, que diz por escrito o
 * que a cor diz à distância (docs/04).
 */

/** Pela ordem de `lib/packages.ts`. Um pacote a mais fica sem objeto. */
const OBJETOS = [
  atelierAssets.landing,
  atelierAssets.webDesign,
  atelierAssets.commerce,
] as const;

const ENQUADRAMENTO = ["justify-start", "justify-center", "justify-end"];

export function PacotesBancada() {
  return (
    <div className="mt-10 grid gap-4 lg:grid-cols-3">
      {packages.map((p, i) => {
        const objeto = OBJETOS[i];
        return (
          <Reveal key={p.name} delay={i * 0.06} className="h-full">
            <article
              className={cn(
                "h-full rounded-[var(--radius)]",
                p.featured && "ring-1 ring-primary/70",
              )}
            >
              <MaterialSurface
                finish="graphite"
                contentClassName="flex h-full flex-col"
              >
                {/* A etiqueta pousa na faixa do objeto, e não por cima do
                    título: com ela no fluxo, o título do destacado descia uma
                    linha e as três colunas deixavam de alinhar. */}
                <div className="relative -mt-2 mb-4 h-24 sm:h-32 lg:h-36">
                  {objeto ? (
                    <div
                      aria-hidden
                      className={cn(
                        "flex h-full",
                        ENQUADRAMENTO[i % ENQUADRAMENTO.length],
                      )}
                    >
                      <Image
                        src={objeto.src}
                        alt=""
                        width={objeto.width}
                        height={objeto.height}
                        sizes="(min-width: 1024px) 9rem, 8rem"
                        loading="lazy"
                        className="h-full w-auto object-contain"
                      />
                    </div>
                  ) : null}
                  {p.featured ? (
                    <span className="absolute bottom-0 left-0 inline-flex w-fit items-center rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-ink">
                      Mais escolhido
                    </span>
                  ) : null}
                </div>
                <h3 className="font-display text-xl">{p.name}</h3>
                <p className="mt-2 text-sm text-muted">{p.desc}</p>
                <ul className="mt-5 space-y-2 text-sm">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5">
                      <span
                        aria-hidden
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"
                      />
                      <span className="text-muted">{pt}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  <Button
                    href="/contacto"
                    variant={p.featured ? "primary" : "outline"}
                    className="w-full"
                  >
                    Pedir proposta
                  </Button>
                </div>
              </MaterialSurface>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}
