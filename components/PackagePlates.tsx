/** docs: docs/04-componentes-e-padroes.md · docs/05-servicos.md · docs/10-materiais-atelier.md */
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { MaterialSurface } from "@/components/atelier/MaterialSurface";
import { atelierAssets } from "@/components/atelier/assets";
import { packages } from "@/lib/packages";

const OBJETOS: Record<string, (typeof atelierAssets)[keyof typeof atelierAssets]> = {
  "Landing page": atelierAssets.landing,
  Website: atelierAssets.development,
  "Loja online": atelierAssets.commerce,
};

/** A mesma composição aprovada na home e no catálogo de serviços. */
export function PackagePlates() {
  return (
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
  );
}
