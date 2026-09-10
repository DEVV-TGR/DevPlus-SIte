"use client";
/** docs: docs/04-componentes-e-padroes.md · docs/05-servicos.md */

import Image from "next/image";
import { useCallback, useRef } from "react";
import { ScrollTrigger, useGSAP, comPausa } from "@/lib/motion";
import { Logo } from "@/components/Logo";
import { services } from "@/lib/services";

/**
 * Os seis serviços, em colunas verticais que abrem uma de cada vez.
 *
 * **É a forma da `/servicos` e de mais nenhuma página.** A inicial apresenta
 * quatro serviços um a um, com números enormes; aqui estão os seis ao mesmo
 * tempo, e o que se pede a esta página é que se possa catalogar — daí as seis
 * colunas todas visíveis, mesmo as fechadas.
 *
 * Duas maneiras de trocar a coluna aberta: o scroll para quem passa, o clique
 * para quem procura. O clique manda durante dois segundos, senão rolar um pixel
 * a seguir desfazia-o.
 *
 * **Quem abre e fecha escreve no DOM, não no React.** A primeira versão tinha
 * um `useState` mudado a partir do `onUpdate` do ScrollTrigger, e rebentava com
 * `Cannot read properties of undefined (reading 'end')`: o `setState` re-renderiza
 * **durante o tick do GSAP**, o re-render muda a largura das colunas, e o
 * ScrollTrigger recalcula-se a meio do seu próprio update. É o mesmo defeito que
 * está descrito no `Reveal.tsx` e que lá custou um separador pendurado. O estado
 * vive num atributo `data-aberta`, o CSS trata do resto, e o React não precisa
 * de saber.
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
  /** Enquanto o relógio não passar isto, manda o clique e não o scroll. */
  const manual = useRef(0);

  const abrir = useCallback((i: number) => {
    const cols = ref.current?.querySelectorAll<HTMLElement>("[data-col]");
    if (!cols?.length) return;
    cols.forEach((c, k) => {
      const on = k === i;
      /* Só escreve o que muda: um `setAttribute` por frame em seis colunas
         obrigava o browser a recalcular estilo seis vezes por frame, para
         nada. */
      if ((c.dataset.aberta === "true") === on) return;
      c.dataset.aberta = on ? "true" : "false";
      c.setAttribute("aria-expanded", String(on));
    });
  }, []);

  useGSAP(
    () => {
      const raiz = ref.current;
      if (!raiz) return;
      const palco = raiz.querySelector<HTMLElement>("[data-palco]");
      if (!palco) return;

      /* Com movimento reduzido não há pin nem percurso: as seis colunas ficam
         empilhadas e abrem-se ao clique, que é a outra forma de as ver.

         **E no telemóvel também não.** Lá o acordeão está deitado — seis
         linhas que cabem num ecrã e meio — e o pin cobrava 3,4 ecrãs de scroll
         para mostrar o que já se via. Ficam abertas todas e lê-se de uma vez;
         quem quiser fechar umas continua a poder tocar. */
      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        window.matchMedia("(max-width: 767px)").matches
      ) {
        return;
      }

      /* Os 240% são o percurso das seis colunas. À volta deles ficam as duas
         pausas do `comPausa`, como em qualquer secção pinada: a primeira
         coluna fica aberta e parada antes de a passagem começar, e a última
         fica aberta e parada depois de ela acabar. */
      const animacao = () => window.innerHeight * 2.4;

      const st = ScrollTrigger.create({
        trigger: raiz,
        start: "top top",
        end: () => `+=${comPausa(animacao()).total}`,
        pin: palco,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (performance.now() < manual.current) return;
          const p = comPausa(animacao()).progresso(self.progress);
          abrir(Math.min(services.length - 1, Math.floor(p * services.length)));
        },
      });

      return () => st.kill();
    },
    { scope: ref, dependencies: [abrir] },
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
        className="flex flex-col gap-1.5 px-6 pb-8 pt-24 sm:px-8 md:min-h-[100svh] md:flex-row md:overflow-hidden md:pt-28"
      >
        {services.map((s, i) => {
          const fig = FIGURAS[i];
          return (
            <button
              key={s.title}
              type="button"
              data-col
              /* O primeiro vem aberto do servidor: sem isto, quem chega com o
                 JavaScript ainda a carregar vê seis colunas fechadas e nenhum
                 texto. */
              /* Em telemóvel abrem todas: sem o scroll a conduzi-las, cinco
                 linhas fechadas eram cinco títulos sem resposta. O CSS trata
                 disso com `max-md:` — o atributo continua a marcar a que o
                 scroll abriu em desktop. */
              data-aberta={i === 0 ? "true" : "false"}
              aria-expanded={i === 0}
              onClick={() => {
                manual.current = performance.now() + 2000;
                abrir(i);
              }}
              className="group relative grid min-w-0 cursor-pointer content-end overflow-hidden rounded-2xl border border-border bg-surface p-4 text-left transition-[flex-grow,background-color,border-color] duration-[420ms] ease-out md:data-[aberta=true]:border-primary/45 md:data-[aberta=true]:bg-primary/10 md:basis-0 md:grow md:p-5 md:data-[aberta=true]:grow-[5]"
            >
              <span className="absolute left-4 top-4 text-sm font-extrabold tabular-nums text-primary md:left-5 md:top-5">
                {String(i + 1).padStart(2, "0")}
              </span>

              {fig ? (
                <span
                  aria-hidden
                  className="absolute right-4 top-4 hidden w-[min(34%,15rem)] opacity-0 transition-opacity duration-[420ms] group-data-[aberta=true]:opacity-100 md:block"
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
                  className="absolute right-6 top-6 hidden w-[min(26%,11rem)] opacity-0 transition-opacity duration-[420ms] group-data-[aberta=true]:opacity-[0.12] md:block [&_path]:fill-primary"
                />
              )}

              {/* O nome roda quando a coluna está fechada e endireita-se ao
                  abrir: é o que torna seis colunas legíveis a 130px de largura.
                  No telemóvel nunca roda — lá as colunas são linhas. */}
              <h3 className="m-0 whitespace-nowrap pl-10 font-display text-[1.35rem] font-bold tracking-[-0.02em] md:pl-0 md:text-[clamp(1rem,1.5vw,1.35rem)] md:[writing-mode:vertical-rl] md:[transform:rotate(180deg)] md:group-data-[aberta=true]:text-[clamp(1.5rem,3vw,2.6rem)] md:group-data-[aberta=true]:[writing-mode:horizontal-tb] md:group-data-[aberta=true]:[transform:none]">
                {s.title}
              </h3>

              <div className="mt-3 grid max-w-[44ch] gap-3 md:hidden md:group-data-[aberta=true]:grid">
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
            </button>
          );
        })}
      </div>
    </section>
  );
}
