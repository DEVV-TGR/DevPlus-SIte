/** docs: docs/06-projetos.md — "A Damira desenhada". */
import Image from "next/image";
import { MaterialSurface } from "@/components/atelier/MaterialSurface";
import { Reveal } from "@/components/Reveal";
import type { Peca } from "@/lib/projects";

/**
 * O que um projeto em desenvolvimento vai ter, peça a peça, em desenho.
 *
 * Ocupa o lugar de `Dispositivos` quando não há site no ar: sem captura e sem
 * fotografia, mostra-se o plano — e só o plano. A primeira peça é a vertical
 * (o telemóvel) e ocupa a coluna da esquerda inteira; as outras empilham-se à
 * direita. Uma frase cada, e mais nada.
 */
export function Pecas({ pecas }: { pecas: Peca[] }) {
  return (
    <div>
      <p className="mb-4 text-sm text-muted">
        Ainda não está no ar. Isto é o que vai ter:
      </p>
      <ul className="grid gap-4 md:grid-cols-5 md:grid-rows-2">
        {pecas.map((p, i) => (
          <li
            key={p.titulo}
            className={
              i === 0 ? "md:col-span-2 md:row-span-2" : "md:col-span-3"
            }
          >
            <Reveal delay={i * 0.06} className="h-full">
              <MaterialSurface
                finish="graphite"
                interactive={false}
                padding="none"
                className="h-full"
                contentClassName="h-full"
              >
                <div className="flex h-full flex-col gap-5 p-5 sm:p-6">
                  <div
                    className={`relative flex-1 ${i === 0 ? "min-h-[300px]" : "min-h-[220px]"}`}
                  >
                    <Image
                      src={p.desenho.src}
                      alt=""
                      fill
                      unoptimized
                      sizes="(min-width: 768px) 40vw, 100vw"
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="t-cartao font-display font-titulo">
                      {p.titulo}
                    </h2>
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
