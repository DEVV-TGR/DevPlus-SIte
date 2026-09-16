"use client";
/** docs: docs/04-componentes-e-padroes.md · docs/05-servicos.md */

import Image from "next/image";
import { useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/motion";
import { Button } from "@/components/ui/Button";
import { services } from "@/lib/services";

/**
 * Os serviços, **um de cada vez**: número enorme, figura num círculo, nome em
 * baixo, e uma coluna de botões redondos à direita para saltar entre eles.
 *
 * Duas formas de chegar ao mesmo sítio, e as duas são precisas: o scroll para
 * quem só passa, o botão para quem procura um serviço em concreto. Uma lista
 * que se lê seria mais barata de construir e não deixava escolher.
 *
 * Mostra os **quatro primeiros** de `lib/services.ts`. Os restantes vivem na
 * `/servicos` — a página inicial apresenta, não cataloga.
 */
const FIGURAS = [
  { src: "/ilustra/s1-web-design.webp", alt: "Um ecrã com um pincel e uma paleta de cores." },
  { src: "/ilustra/s2-desenvolvimento.webp", alt: "Um ecrã com chavetas de código e uma engrenagem." },
  { src: "/ilustra/s3-menus.webp", alt: "Um telemóvel com um código QR ao lado de um ecrã de parede." },
  { src: "/ilustra/s4-painel.webp", alt: "Um painel com interruptores e controlos deslizantes." },
];

export function ServicosMostra() {
  const ref = useRef<HTMLElement>(null);
  const [ativo, setAtivo] = useState(0);
  /* Um clique manda durante dois segundos; depois o scroll volta a mandar.
     Sem esta trégua, rolar um pixel logo a seguir ao clique desfazia-o e a
     coluna parecia não funcionar. */
  const manual = useRef(0);

  const cenas = services.slice(0, FIGURAS.length);

  useGSAP(
    () => {
      const raiz = ref.current;
      if (!raiz) return;
      const palco = raiz.querySelector<HTMLElement>("[data-palco]");
      if (!palco) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const st = ScrollTrigger.create({
        trigger: raiz,
        start: "top top",
        /* 260% dá um ecrã por serviço em desktop, onde há sítio para o
           número gigante e a figura ao lado. Num telemóvel isso são 3,6 ecrãs
           de scroll para quatro cartões que se lêem num relance — 140% chega,
           e é o que mantém a página inteira abaixo dos dez ecrãs. */
        end: window.matchMedia("(max-width: 767px)").matches ? "+=110%" : "+=260%",
        pin: palco,
        scrub: 0.5,
        onUpdate: (self) => {
          if (performance.now() - manual.current < 2000) return;
          const i = Math.min(
            cenas.length - 1,
            Math.floor(self.progress * cenas.length),
          );
          setAtivo((a) => (a === i ? a : i));
        },
      });

      return () => st.kill();
    },
    { scope: ref, dependencies: [cenas.length] },
  );

  return (
    <section ref={ref} className="relative bg-bg" aria-labelledby="servicos-mostra">
      <h2 id="servicos-mostra" className="sr-only">
        O que fazemos
      </h2>
      <div data-palco className="relative h-[100svh] overflow-hidden">
        {cenas.map((s, i) => (
          <div
            key={s.title}
            hidden={i !== ativo}
            className="absolute inset-0 grid place-items-center"
          >
            <div className="grid aspect-square w-[min(60vh,34rem)] place-items-center rounded-full bg-ink/[0.06] max-sm:w-[min(44vh,20rem)]">
              <Image
                src={FIGURAS[i].src}
                alt={FIGURAS[i].alt}
                width={760}
                height={760}
                loading={i === 0 ? "eager" : "lazy"}
                className="w-[66%] object-contain"
              />
            </div>

            <span
              aria-hidden
              className="absolute left-[clamp(1.25rem,5vw,5.5rem)] top-[clamp(3.5rem,9vh,6rem)] font-display text-[clamp(4rem,13vw,11rem)] font-extrabold leading-[0.8] tracking-[-0.06em] tabular-nums text-primary"
            >
              {String(i + 1).padStart(2, "0")}
            </span>

            <div className="absolute bottom-[clamp(4.5rem,12vh,8rem)] left-[clamp(1.25rem,5vw,5.5rem)] max-w-[min(26rem,70vw)]">
              <h3 className="font-display text-[clamp(1.8rem,5vw,3.6rem)] font-extrabold leading-[0.98] tracking-[-0.04em]">
                {s.title}
              </h3>
              <p className="mt-3 max-w-[34ch] text-sm text-muted">{s.blurb}</p>
              <div className="mt-5">
                <Button href="/contacto" variant="primary">
                  Falar sobre isto
                </Button>
              </div>
            </div>
          </div>
        ))}

        <div
          className="absolute right-[clamp(0.75rem,2.5vw,2.25rem)] top-1/2 z-[4] grid -translate-y-1/2 gap-3"
          role="tablist"
          aria-label="Serviços"
        >
          {cenas.map((s, i) => (
            <button
              key={s.title}
              type="button"
              role="tab"
              aria-selected={i === ativo}
              aria-label={s.title}
              onClick={() => {
                manual.current = performance.now();
                setAtivo(i);
              }}
              className={`grid h-13 w-13 place-items-center rounded-full border text-xs font-semibold tabular-nums transition-all duration-300 max-sm:h-11 max-sm:w-11 ${
                i === ativo
                  ? "scale-108 border-primary bg-primary text-primary-ink"
                  : "border-ink/15 bg-ink/[0.08] text-muted hover:text-ink"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
