/** docs: docs/06-projetos.md — "A Damira desenhada" e "O painel por dentro". */
import Image from "next/image";
import { MaterialSurface } from "@/components/atelier/MaterialSurface";
import { Reveal } from "@/components/Reveal";
import type { Peca } from "@/lib/projects";

/**
 * Peças de um projeto em cartões de grafite: imagem, título e uma frase.
 *
 * - `planta` — o que um projeto em desenvolvimento **vai ter**, em desenho.
 *   Ocupa o lugar de `Dispositivos` quando não há site no ar. A primeira peça
 *   é a vertical (o telemóvel) e ocupa a coluna da esquerda inteira; as outras
 *   empilham-se à direita.
 * - `janelas` — prints reais do painel de gestão, à proporção em que foram
 *   tirados (nada se corta em CSS: o corte faz-se no ficheiro). Duas colunas;
 *   quando são três, a primeira vai a toda a largura.
 */
export function Pecas({
  pecas,
  variante,
  intro,
}: {
  pecas: Peca[];
  variante: "planta" | "janelas";
  intro?: string;
}) {
  const planta = variante === "planta";
  const Titulo = planta ? "h2" : "h3";
  const lugar = (i: number) =>
    planta
      ? i === 0
        ? "md:col-span-2 md:row-span-2"
        : "md:col-span-3"
      : i === 0 && pecas.length % 2 === 1
        ? "md:col-span-2"
        : "";

  return (
    <div>
      {intro ? <p className="mb-4 text-sm text-muted">{intro}</p> : null}
      <ul
        className={`grid gap-4 ${planta ? "md:grid-cols-5 md:grid-rows-2" : "md:grid-cols-2"}`}
      >
        {pecas.map((p, i) => (
          <li key={p.titulo} className={lugar(i)}>
            <Reveal delay={i * 0.06} className="h-full">
              <MaterialSurface
                finish="graphite"
                interactive={false}
                padding="none"
                className="h-full"
                contentClassName="h-full"
              >
                <div className="flex h-full flex-col gap-5 p-5 sm:p-6">
                  {p.tipo === "desenho" ? (
                    <div
                      className={`relative flex-1 ${i === 0 ? "min-h-[300px]" : "min-h-[220px]"}`}
                    >
                      <Image
                        src={p.imagem.src}
                        alt=""
                        fill
                        unoptimized
                        sizes="(min-width: 768px) 40vw, 100vw"
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-1 items-center">
                      <Image
                        src={p.imagem.src}
                        alt={`${p.titulo}, no painel de gestão.`}
                        width={p.imagem.width}
                        height={p.imagem.height}
                        sizes={
                          lugar(i)
                            ? "(min-width: 1152px) 1100px, 100vw"
                            : "(min-width: 768px) 50vw, 100vw"
                        }
                        className="h-auto w-full rounded-[10px] shadow-[0_18px_40px_-24px_color-mix(in_oklch,var(--bg-deep)_90%,transparent)]"
                      />
                    </div>
                  )}
                  <div>
                    <Titulo className="t-cartao font-display font-titulo">
                      {p.titulo}
                    </Titulo>
                    <p className="mt-1.5 max-w-[46ch] text-muted">{p.texto}</p>
                  </div>
                </div>
              </MaterialSurface>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}
