"use client";
/** docs: docs/04-componentes-e-padroes.md · docs/05-servicos.md */

import Image from "next/image";
import Link from "next/link";
import { useRef, useSyncExternalStore, type CSSProperties } from "react";
import {
  MOVIMENTO,
  ScrollTrigger,
  gsap,
  useGSAP,
  comPausa,
} from "@/lib/motion";
import { Button } from "@/components/ui/Button";
import { services } from "@/lib/services";
import { MaterialGround } from "@/components/atelier/MaterialGround";

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
 *
 * As quatro figuras são ilustrações conceptuais da mesma família do hero
 * (docs/09) e o `alt` di-lo: nenhuma é uma captura de um sistema entregue. A
 * prova real de cada serviço é o link para o caso, por baixo do texto — a
 * captura do Império continua no portfólio e no caso de estudo.
 */
const FIGURAS = [
  {
    src: "/hero/atelier-digital-v2.webp",
    alt: "Composição de interfaces web e mobile em acrílico laranja, vidro verde e alumínio.",
  },
  {
    src: "/atelier/desenvolvimento-digital-v3.webp",
    alt: "Ilustração conceptual de um website em construção, em camadas de alumínio, vidro verde e acrílico laranja.",
  },
  {
    src: "/hero/nfc-digital-v2.webp",
    alt: "Ilustração de um telemóvel com ementa digital sobre um suporte contactless.",
  },
  {
    src: "/hero/painel-digital-v2.webp",
    alt: "Ilustração conceptual de um painel de gestão em alumínio e vidro verde.",
  },
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
  return [
    base + i * passo + FOLGA / 2,
    base + (i + 1) * passo - FOLGA / 2,
  ] as const;
}

/** Dois segundos de trégua: ver `manual`, abaixo. */
const TREGUA = 2000;

const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (callback: () => void) => {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};

export function ServicosMostra() {
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(motionQuery).matches,
    () => false,
  );
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
      const segmentos = gsap.utils.toArray<HTMLElement>(
        "[data-segmento]",
        raiz,
      );
      const reduzido = reducedMotion;
      ativo.current = 0;
      raiz.dataset.tone = "0";
      /* A cena recomeça no 01 quando a preferência de movimento muda: o
         revert desfaz as animações, mas não o `hidden` que o scroll deixou. */
      painéis.forEach((painel, i) => {
        painel.hidden = i !== 0;
        painel.inert = i !== 0;
      });
      segmentos.forEach((segmento, i) => {
        segmento.setAttribute("aria-selected", String(i === 0));
        segmento.tabIndex = i === 0 ? 0 : -1;
      });
      const peças = (cena: HTMLElement) =>
        gsap.utils.toArray<HTMLElement>("[data-peca]", cena);

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
        raiz.dataset.tone = String(i);
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
            {
              opacity: 1,
              y: 0,
              duration: 0.36,
              ease: MOVIMENTO.ease,
              stagger: 0.05,
            },
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
        .to(
          segmentos,
          {
            opacity: 1,
            duration: MOVIMENTO.escala,
            stagger: MOVIMENTO.stagger * 0.5,
          },
          "<",
        )
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
        .to(
          inicial,
          {
            opacity: 1,
            duration: MOVIMENTO.escala,
            stagger: MOVIMENTO.stagger,
          },
          "<",
        )
        .from(
          painéis[0].querySelectorAll("[data-figura]"),
          {
            scale: MOVIMENTO.escalaDe,
            duration: MOVIMENTO.entrada,
            ease: MOVIMENTO.ease,
          },
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

      /* 260% dá um ecrã por serviço em desktop, onde há sítio para o número
         gigante e a figura ao lado. Num telemóvel isso são 3,6 ecrãs de scroll
         para quatro cartões que se lêem num relance — 110% chega, e é o que
         mantém a página inteira dentro do teto do verificador.

         A isto somam-se as duas pausas do `comPausa`: o serviço 01 fica parado
         antes de a troca começar, e o 04 fica parado depois de ela acabar. Sem
         elas, o quarto serviço aparecia no último pixel do pin e a secção
         seguinte já estava a entrar. */
      const animacao = () =>
        window.innerHeight *
        (window.matchMedia("(max-width: 767px)").matches ? 1.1 : 2.6);

      const st = ScrollTrigger.create({
        trigger: raiz,
        start: "top top",
        end: () => `+=${comPausa(animacao()).total}`,
        pin: palco,
        scrub: 0.5,
        onUpdate: (self) => {
          if (sobreRoda.current) return;
          if (performance.now() - manual.current < TREGUA) return;
          const p = comPausa(animacao()).progresso(self.progress);
          const i = Math.min(cenas.length - 1, Math.floor(p * cenas.length));
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
    {
      scope: ref,
      dependencies: [cenas.length, reducedMotion],
      revertOnUpdate: true,
    },
  );

  const rato = (e: React.PointerEvent) => e.pointerType === "mouse";

  return (
    <section
      ref={ref}
      className="relative"
      aria-labelledby="servicos-mostra"
    >
      <h2 id="servicos-mostra" className="sr-only">
        O que fazemos
      </h2>
      <div data-palco className="relative isolate h-[100svh] overflow-hidden">
        {/* O vidro vive no palco e não na secção: a secção mede o pin inteiro
            (3,4 ecrãs), e os planos em percentagem dela ficavam do tamanho de
            um prédio. No palco pinam com a cena. */}
        <MaterialGround finish="glass" />
        {/* A roda vem **antes** das cenas no DOM, embora se desenhe por cima
            delas (`z-[4]`). É a ordem do padrão de separadores: Tab a partir
            do serviço escolhido entra na cena dele — o link do caso e o
            "Falar sobre isto". Com a roda no fim, o Tab saltava a cena e ia
            direto para os pacotes. */}
        <div
          role="tablist"
          aria-label="Serviços"
          aria-orientation="vertical"
          style={{ "--roda": "clamp(7.5rem, 22vw, 15rem)" } as CSSProperties}
          className="absolute right-[clamp(0.25rem,1.5vw,1.5rem)] top-1/2 z-[4] h-[calc(var(--roda)*2)] w-[var(--roda)] md:-translate-y-1/2"
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
            const passo =
              e.key === "ArrowUp" || e.key === "ArrowLeft"
                ? -1
                : e.key === "ArrowDown" || e.key === "ArrowRight"
                  ? 1
                  : 0;
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
                  className="absolute grid h-10 w-10 md:-translate-x-1/2 md:-translate-y-1/2 place-items-center rounded-full text-sm font-semibold tabular-nums text-muted transition-colors duration-300 group-hover:text-ink group-aria-selected:text-primary-ink group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-ink"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>
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
            <div data-service-figure-wrap>
              <div
                data-peca
                data-figura
                className="grid aspect-square w-[min(62vh,36rem)] place-items-center max-sm:w-[min(42vh,17.5rem)]"
              >
                <Image
                  src={FIGURAS[i].src}
                  alt={FIGURAS[i].alt}
                  width={760}
                  height={760}
                  loading="lazy"
                  sizes="(min-width: 1280px) 37vw, (min-width: 768px) 32vw, 86vw"
                  className="w-full object-contain"
                />
              </div>
            </div>

            <span
              data-peca
              aria-hidden
              data-service-number
              className="absolute left-[clamp(1.25rem,5vw,5.5rem)] top-[clamp(3.5rem,9vh,6rem)] font-display text-[clamp(4rem,13vw,11rem)] font-titulo leading-[0.8] tracking-[-0.035em] tabular-nums text-acento"
            >
              {String(i + 1).padStart(2, "0")}
            </span>

            <div
              data-peca
              data-service-copy
              className="absolute bottom-[clamp(4.5rem,12vh,8rem)] left-[clamp(1.25rem,5vw,5.5rem)] max-w-[min(26rem,70vw)]"
            >
              {/* Título de cartão no telemóvel; a partir de 768px é o título
                  da cena, ao lado de um número de 11rem, e volta à medida
                  principal — a 24px lia-se como uma legenda. */}
              <h3 className="t-cartao font-display font-titulo md:text-[length:var(--titulo-principal)] md:leading-[var(--titulo-entrelinha)]">
                {s.title}
              </h3>
              <p className="mt-3 max-w-[34ch] text-sm text-verde-muted">{s.blurb}</p>
              <Link
                href={`/portfolio/${i === 0 ? "jsk" : i === 1 ? "imperio-auto-concept" : "cafe-preguica"}`}
                className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-acento"
              >
                {i === 0
                  ? "Ver o trabalho da JSK"
                  : i === 1
                    ? "Ver o Império Auto Concept"
                    : i === 2
                      ? "QR code e NFC no Café Preguiça"
                      : "O painel do Café Preguiça"}{" "}
                <span aria-hidden>↗</span>
              </Link>
              <div className="mt-3">
                <Button href="/contacto" variant="primary">
                  Falar sobre isto
                </Button>
              </div>
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}
