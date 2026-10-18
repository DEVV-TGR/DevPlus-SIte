"use client";
/** docs: docs/04-componentes-e-padroes.md · docs/05-servicos.md · docs/10-materiais-atelier.md */

import { MaterialGround } from "@/components/atelier/MaterialGround";
import Image from "next/image";
import { useCallback, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, comPausa } from "@/lib/motion";
import { atelierAssets } from "@/components/atelier/assets";
import { services } from "@/lib/services";
import { contactoCom } from "@/lib/contacto";
import { Button } from "@/components/ui/Button";
import { Carril } from "./Carril";
import styles from "./paginas.module.css";

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

/**
 * As figuras, pela ordem de `lib/services.ts`: as seis da família do atelier —
 * acrílico laranja, vidro verde, alumínio. Branding e Motion deixaram de ficar
 * com o "+" em marca-d'água: têm escultura própria, e nenhuma é emprestada de
 * outro serviço. São ilustrações conceptuais, não capturas de trabalho
 * entregue — ver docs/09 e docs/10.
 */
const FIGURAS = [
  atelierAssets.webDesign,
  atelierAssets.development,
  atelierAssets.nfc,
  atelierAssets.dashboard,
  atelierAssets.branding,
  atelierAssets.motion,
] as const;

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
         empilhadas e abrem-se ao clique, que é a outra forma de as ver. **E no
         telemóvel também não** — lá os serviços vão num carril.

         A decisão vive num `gsap.matchMedia` e não num `if` na montagem: com
         o `if`, estreitar a janela de 1366 para 390px sem recarregar deixava o
         pin montado por cima do carril, com um espaçador de 4000px e o palco
         a −500px do topo. Agora o pin monta e desmonta ao cruzar os 768px. */
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
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
      });

      return () => mm.revert();
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
        /* Só a partir de 768px. No telemóvel as seis linhas abertas somavam
           seis secções de altura; lá os serviços vão no `Carril` abaixo, que
           ocupa a altura de um cartão. Em baixo, 5rem: o botão do tema vive
           no canto inferior esquerdo e ficava em cima da primeira coluna. */
        className="relative isolate capitulo-fundo hidden gap-1.5 px-6 pb-8 pt-24 sm:px-8 md:flex md:min-h-[100svh] md:flex-row md:overflow-hidden md:pb-20 md:pt-28"
      >
        <MaterialGround finish="glass" />
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
              className={`${styles.coluna} group relative grid min-w-0 cursor-pointer grid-rows-[minmax(0,1fr)_auto_auto] overflow-hidden rounded-2xl border p-4 text-left transition-[flex-grow,border-color] duration-[420ms] ease-out md:basis-0 md:grow md:p-5 md:data-[aberta=true]:grow-[5]`}
            >
              <span className="absolute left-4 top-4 text-sm font-titulo tabular-nums text-acento md:left-5 md:top-5">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* A figura é a peça da coluna aberta e ocupa o espaço todo
                  por cima do texto: é a primeira linha da grelha, com `1fr`,
                  e a imagem entra contida (`object-contain`) — cresce com a
                  coluna e nunca desce para cima do título. Antes era um
                  quadrado de 24rem no canto, com meio ecrã vazio por cima do
                  texto. A margem de cima deixa o número livre. Nas colunas
                  fechadas a linha existe mas a figura está apagada. */}
              <span
                aria-hidden
                className="pointer-events-none relative mb-5 mt-10 min-h-0 translate-y-2 opacity-0 transition-[opacity,transform] duration-[420ms] ease-out group-data-[aberta=true]:translate-y-0 group-data-[aberta=true]:opacity-100"
              >
                <Image
                  src={fig.src}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 40rem, 50vw"
                  loading="lazy"
                  className="object-contain"
                />
              </span>

              {/* O nome roda quando a coluna está fechada e endireita-se ao
                  abrir: é o que torna seis colunas legíveis a 130px de largura.
                  No telemóvel nunca roda — lá as colunas são linhas. */}
              <h3 className="m-0 pl-10 pr-14 font-display md:whitespace-nowrap md:pr-0 text-[1.35rem] font-titulo tracking-[-0.02em] md:pl-0 md:text-[clamp(1rem,1.5vw,1.35rem)] md:[writing-mode:vertical-rl] md:[transform:rotate(180deg)] md:group-data-[aberta=true]:text-[length:var(--titulo-cartao)] md:group-data-[aberta=true]:[writing-mode:horizontal-tb] md:group-data-[aberta=true]:[transform:none]">
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

      <div className="relative isolate capitulo-fundo px-6 pb-12 pt-20 md:hidden">
        <MaterialGround finish="glass" />
        <Carril rotulo="Serviço">
          {services.map((s, i) => (
            <div key={s.title} className="grid h-full content-start gap-3 p-5">
              <Image
                src={FIGURAS[i].src}
                alt=""
                width={FIGURAS[i].width}
                height={FIGURAS[i].height}
                sizes="40vw"
                loading="lazy"
                className="h-40 w-auto justify-self-center object-contain"
              />
              <span className="text-sm tabular-nums text-acento">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="t-cartao font-display font-titulo">
                {s.title}
              </h3>
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
              <Button href={contactoCom(s.title)} variant="outline" className="mt-2 justify-self-start">
                Falar sobre isto
              </Button>
            </div>
          ))}
        </Carril>
      </div>
    </section>
  );
}
