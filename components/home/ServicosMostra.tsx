"use client";
/** docs: docs/04-componentes-e-padroes.md · docs/05-servicos.md */

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import { MOVIMENTO, ScrollTrigger, gsap, useGSAP } from "@/lib/motion";
import { Button } from "@/components/ui/Button";
import { services } from "@/lib/services";

/**
 * Os serviços, **um de cada vez**: número enorme, figura num círculo, nome em
 * baixo, e uma **meia-roda** encostada à direita para saltar entre eles.
 *
 * Três formas de chegar ao mesmo sítio, e as três são precisas: o scroll para
 * quem só passa, o rato em cima de um segmento para quem está a explorar, o
 * clique e o teclado para quem procura um serviço em concreto. Uma lista que se
 * lê seria mais barata de construir e não deixava escolher.
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

/* ── A geometria da roda ───────────────────────────────────────────────────
   O centro do círculo está no canto **direito** da caixa, a meio da altura:
   a caixa tem um raio de largura e dois de altura, e o que se vê é a metade
   esquerda. Por isso `x` conta em raios (100% da largura) e `y` em meios
   (50% da altura) — é o mesmo raio medido em duas caixas diferentes.

   168° em vez de 180: com o leque fechado nos extremos, o primeiro e o último
   segmento acabam com alguma espessura em vez de irem morrer a um fio contra a
   margem. */
const ARCO = 168;
/** Graus de folga entre segmentos. É o que faz a roda ler-se como peças. */
const FOLGA = 3.4;
/** O buraco do meio, em fração do raio. Abaixo de ~0.45 deixa de ser roda. */
const R_DENTRO = 0.5;
/** Pontos por arco. 12 chegam: a 240px de raio, cada lado dá ~1.5px. */
const PASSOS = 12;

function coord(grau: number, r: number) {
  const a = (grau * Math.PI) / 180;
  return { x: 100 + r * Math.cos(a) * 100, y: 50 - r * Math.sin(a) * 50 };
}

/** Um sector anular entre dois ângulos, como `clip-path`. */
function fatia(de: number, ate: number) {
  const pontos: string[] = [];
  for (let k = 0; k <= PASSOS; k++) {
    const p = coord(de + ((ate - de) * k) / PASSOS, 1);
    pontos.push(`${p.x.toFixed(2)}% ${p.y.toFixed(2)}%`);
  }
  for (let k = PASSOS; k >= 0; k--) {
    const p = coord(de + ((ate - de) * k) / PASSOS, R_DENTRO);
    pontos.push(`${p.x.toFixed(2)}% ${p.y.toFixed(2)}%`);
  }
  return `polygon(${pontos.join(",")})`;
}

/** Os limites do segmento `i` de `n`, em graus. O 0 é o de cima. */
function limites(i: number, n: number) {
  const passo = ARCO / n;
  const base = 180 - ARCO / 2;
  return [base + i * passo + FOLGA / 2, base + (i + 1) * passo - FOLGA / 2] as const;
}

/** Dois segundos de trégua: ver `manual`, abaixo. */
const TREGUA = 2000;

export function ServicosMostra() {
  const ref = useRef<HTMLElement>(null);
  /* O serviço ativo **não é estado do React**. Quem o muda é o scroll, e um
     `setState` a partir do `onUpdate` de um ScrollTrigger re-renderiza durante
     o tick do próprio GSAP — é a regra do `docs/04`, e custou duas avarias.
     Aqui vive num `ref` e escreve-se no DOM: `hidden`, `aria-selected` e o
     `tabIndex` móvel. O React renderiza a cena uma vez e não volta a ser
     preciso. */
  const ativo = useRef(0);
  /* Uma escolha à mão manda durante dois segundos; depois o scroll volta a
     mandar. Sem esta trégua, rolar um pixel logo a seguir desfazia a escolha e
     a roda parecia não funcionar. Vale para o clique, para o teclado e para o
     rato — e enquanto o ponteiro está **em cima** da roda o scroll não manda
     de todo, senão o que o rato acabou de escolher durava um frame. */
  const manual = useRef(0);
  const sobreRoda = useRef(false);
  /* A ponte entre os eventos do React e o mundo do GSAP, que vive dentro do
     `useGSAP` e é o único sítio onde as animações são criadas e revertidas. */
  const escolher = useRef<((i: number) => void) | null>(null);

  const cenas = services.slice(0, FIGURAS.length);

  useGSAP(
    () => {
      const raiz = ref.current;
      if (!raiz) return;
      const palco = raiz.querySelector<HTMLElement>("[data-palco]");
      if (!palco) return;

      const painéis = gsap.utils.toArray<HTMLElement>("[data-cena]", raiz);
      const segmentos = gsap.utils.toArray<HTMLElement>("[data-segmento]", raiz);
      const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const peças = (cena: HTMLElement) => gsap.utils.toArray<HTMLElement>("[data-peca]", cena);

      let troca: gsap.core.Timeline | null = null;

      const arrumar = (cena: HTMLElement) => {
        gsap.set(peças(cena), { opacity: 1, y: 0, rotate: 0, scale: 1 });
        cena.inert = true;
        cena.hidden = true;
      };

      const marcar = (i: number) => {
        segmentos.forEach((s, j) => {
          s.setAttribute("aria-selected", String(j === i));
          s.tabIndex = j === i ? 0 : -1;
        });
      };

      const trocar = (i: number) => {
        const anterior = ativo.current;
        if (i === anterior || i < 0 || i >= painéis.length) return;
        ativo.current = i;
        marcar(i);

        troca?.kill();
        const sai = painéis[anterior];
        const entra = painéis[i];
        /* Restos de uma troca interrompida a meio: a cena que estava a sair
           ficaria visível para sempre com a opacidade a meio. */
        painéis.forEach((c, j) => {
          if (j !== i && j !== anterior) arrumar(c);
        });

        entra.hidden = false;
        entra.inert = false;
        /* Um `hidden` não anima — por isso quem sai só o recebe no fim. Até lá
           fica `inert`, senão durante 200 ms há dois "Falar sobre isto" na
           ordem de teclado. */
        sai.inert = true;

        if (reduzido) {
          arrumar(sai);
          gsap.set(peças(entra), { opacity: 1, y: 0, rotate: 0, scale: 1 });
          return;
        }

        /* A troca não se pode ler como a entrada da secção: aquela é a roda a
           montar-se, esta é a roda a **girar**. Daí o sentido — as peças saem
           e entram pelo lado para onde a roda andou — e daí a figura chegar
           com um resto de rotação, que é o que liga o gesto do rato ao que
           acontece no meio do ecrã. */
        const d = i > anterior ? 1 : -1;
        troca = gsap
          .timeline()
          .to(peças(sai), {
            opacity: 0,
            y: -26 * d,
            duration: 0.2,
            ease: "power2.in",
            overwrite: true,
          })
          .add(() => arrumar(sai))
          .fromTo(
            peças(entra),
            { opacity: 0, y: 34 * d },
            { opacity: 1, y: 0, duration: 0.36, ease: MOVIMENTO.ease, stagger: 0.05 },
            /* Sem sobreposição: as duas ilustrações a atravessarem-se a meio
               do crossfade liam-se como um borrão, não como uma troca. Uma
               sai, a outra chega. */
            ">",
          )
          .fromTo(
            entra.querySelectorAll("[data-figura]"),
            { rotate: 7 * d, scale: 0.96 },
            { rotate: 0, scale: 1, duration: 0.5, ease: MOVIMENTO.ease },
            "<",
          );
      };

      escolher.current = (i: number) => {
        manual.current = performance.now();
        trocar(i);
      };

      if (reduzido) return () => void (escolher.current = null);

      /* A entrada da secção. O `gsap.set` esconde as peças assim que o
         componente hidrata; não levam `data-reveal-item` de propósito — a
         secção está quatro capítulos abaixo da dobra, portanto não há frame
         visível para tapar, e marcá-las punha o `verificar-scroll.mjs` a
         reportar como presas as posições em que a secção ainda vem a subir. */
      const inicial = peças(painéis[0]);
      gsap.set(inicial, { opacity: 0 });
      gsap.set(segmentos, { opacity: 0 });

      const chegada = gsap
        .timeline({ paused: true })
        /* A roda monta-se de cima para baixo, cada peça a rodar para o seu
           sítio à volta do centro — que é o canto direito da caixa, não o
           meio dela. */
        .from(segmentos, {
          rotate: -14,
          duration: MOVIMENTO.entrada,
          ease: MOVIMENTO.ease,
          stagger: MOVIMENTO.stagger * 0.5,
          transformOrigin: "100% 50%",
        })
        .to(segmentos, { opacity: 1, duration: MOVIMENTO.escala, stagger: MOVIMENTO.stagger * 0.5 }, "<")
        .from(
          inicial,
          {
            y: MOVIMENTO.y,
            duration: MOVIMENTO.entrada,
            ease: MOVIMENTO.ease,
            stagger: MOVIMENTO.stagger,
          },
          "<0.12",
        )
        .to(inicial, { opacity: 1, duration: MOVIMENTO.escala, stagger: MOVIMENTO.stagger }, "<")
        .from(
          painéis[0].querySelectorAll("[data-figura]"),
          { scale: MOVIMENTO.escalaDe, duration: MOVIMENTO.entrada, ease: MOVIMENTO.ease },
          "<",
        )
        /* O `transform` volta ao CSS no fim, senão o `rotate: 0` que a
           montagem deixa escrito no `style` ganha à escala do segmento ativo,
           que é uma classe. `clearProps: "transform"` é seguro; `"all"` não —
           ver `docs/04`. */
        .set(segmentos, { clearProps: "transform" });

      const entrada = ScrollTrigger.create({
        trigger: raiz,
        start: "top 75%",
        once: true,
        onEnter: () => chegada.play(),
      });

      const st = ScrollTrigger.create({
        trigger: raiz,
        start: "top top",
        /* 260% dá um ecrã por serviço em desktop, onde há sítio para o
           número gigante e a figura ao lado. Num telemóvel isso são 3,6 ecrãs
           de scroll para quatro cartões que se lêem num relance — 110% chega,
           e é o que mantém a página inteira abaixo dos dez ecrãs. */
        end: window.matchMedia("(max-width: 767px)").matches ? "+=110%" : "+=260%",
        pin: palco,
        scrub: 0.5,
        onUpdate: (self) => {
          if (sobreRoda.current) return;
          if (performance.now() - manual.current < TREGUA) return;
          const i = Math.min(cenas.length - 1, Math.floor(self.progress * cenas.length));
          trocar(i);
        },
      });

      return () => {
        troca?.kill();
        chegada.kill();
        entrada.kill();
        st.kill();
        escolher.current = null;
      };
    },
    { scope: ref, dependencies: [cenas.length] },
  );

  const rato = (e: React.PointerEvent) => e.pointerType === "mouse";

  return (
    <section ref={ref} className="relative bg-bg" aria-labelledby="servicos-mostra">
      <h2 id="servicos-mostra" className="sr-only">
        O que fazemos
      </h2>
      <div data-palco className="relative h-[100svh] overflow-hidden">
        {cenas.map((s, i) => (
          <div
            key={s.title}
            data-cena
            id={`servico-cena-${i}`}
            role="tabpanel"
            aria-labelledby={`servico-tab-${i}`}
            hidden={i !== 0}
            inert={i !== 0}
            className="absolute inset-0 grid place-items-center"
          >
            {/* O deslocamento vive no invólucro porque o GSAP escreve
                `transform` na figura, e as duas coisas não cabem no mesmo
                elemento sem uma apagar a outra. */}
            <div className="lg:-translate-x-[6%] max-sm:-translate-x-[14%]">
              <div
                data-peca
                data-figura
                className="grid aspect-square w-[min(62vh,36rem)] place-items-center rounded-full bg-ink/[0.06] max-sm:w-[min(42vh,17.5rem)]"
              >
                <Image
                  src={FIGURAS[i].src}
                  alt={FIGURAS[i].alt}
                  width={760}
                  height={760}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="w-[82%] object-contain"
                />
              </div>
            </div>

            <span
              data-peca
              aria-hidden
              className="absolute left-[clamp(1.25rem,5vw,5.5rem)] top-[clamp(3.5rem,9vh,6rem)] font-display text-[clamp(4rem,13vw,11rem)] font-extrabold leading-[0.8] tracking-[-0.06em] tabular-nums text-primary"
            >
              {String(i + 1).padStart(2, "0")}
            </span>

            <div
              data-peca
              className="absolute bottom-[clamp(4.5rem,12vh,8rem)] left-[clamp(1.25rem,5vw,5.5rem)] max-w-[min(26rem,70vw)]"
            >
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
          role="tablist"
          aria-label="Serviços"
          aria-orientation="vertical"
          style={{ "--roda": "clamp(7.5rem, 22vw, 15rem)" } as CSSProperties}
          className="absolute right-[clamp(0.25rem,1.5vw,1.5rem)] top-1/2 z-[4] h-[calc(var(--roda)*2)] w-[var(--roda)] -translate-y-1/2"
          onPointerEnter={(e) => {
            if (rato(e)) sobreRoda.current = true;
          }}
          onPointerLeave={(e) => {
            if (!rato(e)) return;
            sobreRoda.current = false;
            /* A trégua começa a contar quando o rato **sai**: por baixo dele o
               scroll continuou a andar, e sem isto o serviço trocava sozinho
               no instante seguinte. */
            manual.current = performance.now();
          }}
          onKeyDown={(e) => {
            const n = cenas.length;
            const passo = e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : 0;
            const i = passo
              ? (ativo.current + passo + n) % n
              : e.key === "Home"
                ? 0
                : e.key === "End"
                  ? n - 1
                  : -1;
            if (i < 0) return;
            e.preventDefault();
            escolher.current?.(i);
            e.currentTarget.querySelectorAll("button")[i]?.focus();
          }}
        >
          <span
            aria-hidden
            style={{ clipPath: fatia(180 - ARCO / 2, 180 + ARCO / 2) }}
            className="absolute inset-0 bg-surface/70"
          />
          {cenas.map((s, i) => {
            const [de, ate] = limites(i, cenas.length);
            const meio = coord((de + ate) / 2, (1 + R_DENTRO) / 2);
            return (
              <button
                key={s.title}
                data-segmento
                type="button"
                role="tab"
                id={`servico-tab-${i}`}
                aria-controls={`servico-cena-${i}`}
                aria-selected={i === 0}
                aria-label={s.title}
                tabIndex={i === 0 ? 0 : -1}
                style={{ clipPath: fatia(de, ate) }}
                onClick={() => escolher.current?.(i)}
                /* O rato **acrescenta** uma forma de chegar lá; não substitui
                   o clique. E um toque também dispara `pointerenter`, muitas
                   vezes sem o `pointerleave` a seguir — por isso o dedo fica
                   de fora e chega cá pelo clique, como sempre. */
                onPointerEnter={(e) => {
                  if (rato(e)) escolher.current?.(i);
                }}
                /* O ativo não muda só de cor: **cresce**, a partir do centro
                   da roda. É o que dá a leitura de meia-roda de inventário em
                   vez de quatro fatias pintadas. */
                /* Superfícies **opacas**, não tintas por cima do que está
                   atrás: num ecrã estreito a roda cai em cima do círculo da
                   figura, e um `ink/0.09` translúcido tem lá a mesma
                   luminosidade — os segmentos desapareciam e restavam quatro
                   números a flutuar. */
                className="group absolute inset-0 origin-[100%_50%] bg-surface-2 transition-[background-color,transform] duration-300 hover:bg-border aria-selected:scale-[1.06] aria-selected:bg-primary"
              >
                <span
                  data-marca
                  aria-hidden
                  style={{ left: `${meio.x}%`, top: `${meio.y}%` }}
                  className="absolute grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-sm font-semibold tabular-nums text-muted transition-colors duration-300 group-hover:text-ink group-aria-selected:text-primary-ink group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-ink"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
