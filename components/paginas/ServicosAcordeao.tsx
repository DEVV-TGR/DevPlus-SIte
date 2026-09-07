"use client";
/** docs: docs/04-componentes-e-padroes.md · docs/05-servicos.md */

import Image from "next/image";
import { useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/motion";
import { Logo } from "@/components/Logo";
import { services } from "@/lib/services";

/**
 * Os seis serviços, em colunas verticais que abrem uma de cada vez.
 *
 * **É a forma da `/servicos` e de mais nenhuma página.** A inicial apresenta
 * quatro serviços um a um, com números enormes; aqui estão os seis ao mesmo
 * tempo, e o que se pede à página é que se possa catalogar — daí as seis
 * colunas todas visíveis, mesmo as fechadas.
 *
 * Duas maneiras de trocar a coluna aberta, como na `ServicosMostra`: o scroll
 * para quem passa, o clique para quem procura. E o clique manda durante dois
 * segundos, senão rolar um pixel a seguir desfazia-o.
 *
 * As colunas são `<button>`: assim vêm de borla o foco, o Enter, o Espaço e o
 * estado anunciado por `aria-expanded`. O texto fechado continua no DOM e
 * continua a ser lido — ao contrário das cenas da página inicial, aqui o que
 * está fechado não é um duplicado do que está aberto.
 */

/** As ilustrações que existem, pela ordem de `lib/services.ts`. */
const FIGURAS: (string | null)[] = [
  "/ilustra/s1-web-design.webp",
  "/ilustra/s2-desenvolvimento.webp",
  "/ilustra/s3-menus.webp",
  "/ilustra/s4-painel.webp",
  /* Branding e Motion não têm ilustração. Ficam com o "+" em marca-d'água em
     vez de uma figura emprestada de outro serviço — ver docs/05. */
  null,
  null,
];

export function ServicosAcordeao() {
  const ref = useRef<HTMLElement>(null);
  const [aberta, setAberta] = useState(0);
  /** Enquanto isto for maior que o relógio, manda o clique e não o scroll. */
  const manual = useRef(0);

  useGSAP(
    () => {
      const raiz = ref.current;
      if (!raiz) return;
      const palco = raiz.querySelector<HTMLElement>("[data-palco]");
      if (!palco) return;

      /* Com movimento reduzido não há pin nem percurso: as seis colunas ficam
         empilhadas e abrem-se ao clique, que é a outra forma de as ver. */
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const st = ScrollTrigger.create({
        trigger: raiz,
        start: "top top",
        end: "+=240%",
        pin: palco,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (performance.now() < manual.current) return;
          const i = Math.min(
            services.length - 1,
            Math.floor(self.progress * services.length),
          );
          setAberta((antes) => (antes === i ? antes : i));
        },
      });

      return () => st.kill();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className="relative bg-bg-deep"
      aria-labelledby="servicos-acordeao"
    >
      <h2 id="servicos-acordeao" className="sr-only">
        O que fazemos
      </h2>
      <div
        data-palco
        className="flex min-h-[100svh] flex-col gap-1.5 overflow-hidden px-6 pb-8 pt-24 sm:px-8 md:flex-row md:pt-28"
      >
        {services.map((s, i) => {
          const ativo = i === aberta;
          const fig = FIGURAS[i];
          return (
            <button
              key={s.title}
              type="button"
              aria-expanded={ativo}
              onClick={() => {
                manual.current = performance.now() + 2000;
                setAberta(i);
              }}
              /* A proporção é do CSS: aberta vale cinco fechadas. Em coluna
                 estreita não há proporção nenhuma — o acordeão deita-se, e a
                 altura resolve-se com o conteúdo. */
              className={`group relative grid min-w-0 cursor-pointer content-end overflow-hidden rounded-2xl border p-4 text-left transition-[flex-grow,background-color] duration-[420ms] ease-out md:p-5 ${
                ativo
                  ? "border-primary/45 bg-primary/10 md:grow-[5]"
                  : "border-border bg-surface md:grow"
              } md:basis-0`}
            >
              <span className="absolute left-4 top-4 text-sm font-extrabold tabular-nums text-primary md:left-5 md:top-5">
                {String(i + 1).padStart(2, "0")}
              </span>

              {fig ? (
                <span
                  aria-hidden
                  className={`absolute right-4 top-4 hidden w-[min(34%,15rem)] transition-opacity duration-[420ms] md:block ${ativo ? "opacity-100" : "opacity-0"}`}
                >
                  <Image
                    src={fig}
                    alt=""
                    width={760}
                    height={760}
                    loading="lazy"
                    className="h-auto w-full"
                  />
                </span>
              ) : (
                <Logo
                  aria-hidden
                  className={`absolute right-6 top-6 hidden w-[min(26%,11rem)] transition-opacity duration-[420ms] md:block ${ativo ? "opacity-[0.12]" : "opacity-0"} [&_path]:fill-primary`}
                />
              )}

              {/* O nome roda quando a coluna está fechada e endireita-se ao
                  abrir: é o que torna seis colunas legíveis a 130px de largura.
                  No telemóvel nunca roda — lá as colunas são linhas. */}
              <h3
                className={`m-0 whitespace-nowrap font-display font-bold tracking-[-0.02em] ${
                  ativo
                    ? "text-[clamp(1.5rem,3vw,2.6rem)] md:[writing-mode:horizontal-tb] md:[transform:none]"
                    : "text-[clamp(1rem,1.5vw,1.35rem)] md:[writing-mode:vertical-rl] md:[transform:rotate(180deg)]"
                } pl-10 md:pl-0`}
              >
                {s.title}
              </h3>

              {ativo ? (
                <div className="mt-3 grid max-w-[44ch] gap-3">
                  <p className="text-muted">{s.blurb}</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {s.items.map((it) => (
                      <li
                        key={it}
                        className="rounded-full border border-border-strong px-2.5 py-1 text-xs uppercase tracking-[0.18em]"
                      >
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <span className="sr-only">
                {ativo ? "" : `Ver ${s.title}`}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
