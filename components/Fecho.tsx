"use client";
/** docs: docs/04-componentes-e-padroes.md — a forma e o movimento estão lá. */

import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/Logo";
import { gsap, useGSAP, MOVIMENTO } from "@/lib/motion";
import { site } from "@/lib/site";

/**
 * O convite, e é a **cabeça do rodapé** — não uma secção antes dele.
 *
 * Até setembro de 2026 isto era `components/home/Fecho.tsx`, só da página
 * inicial, e o rodapé trazia por baixo outro título de convite e outro CTA para
 * `/contacto`. Dois grounds, dois títulos, dois botões: a página acabava duas
 * vezes. Agora é **um bloco só** — este convite e, no mesmo laranja, a
 * navegação, as redes e o legal. Sem ground novo entre eles não há emenda para
 * se ver.
 *
 * E é o fim do percurso, portanto **resolve**: o título sobe de dentro de uma
 * máscara, a poeira de "+" que estava espalhada pela banda **converge para a
 * régua** que fecha o convite, e a régua desenha-se com ela. É a mesma peça que
 * o `Cruz` andou a atravessar a página inteira — aqui ela pousa.
 *
 * **O texto sobre o laranja é escuro e opaco.** Uma transparência aqui já pôs
 * um subtítulo em 2.55:1. Os tons medidos sobre `--primary` estão no `docs/02`:
 * `primary-ink` a 7.26:1 e `paper-ink` a 6.07:1. `paper-muted`, que parece o
 * candidato óbvio para o apoio, dá 2.95:1 e não se usa aqui.
 *
 * **E o ground do convite não é o laranja limpo:** a poeira passa por trás do
 * texto a caminho da régua, e um "+" a 0,22 escurece o que está debaixo dele.
 * Medido nesse pior caso: `paper-ink` cai a 4.18:1 e **falha** os 4.5:1, o
 * `primary-ink` fica em 4.81:1. Por isso o subtítulo aqui é `primary-ink` — a
 * hierarquia com o título faz-se por tamanho e peso, como manda o `docs/02` —
 * e **nenhuma semente passa de 0,22**. O apoio em `paper-ink` fica para a zona
 * de baixo, onde a poeira não chega.
 */

/**
 * A poeira de "+" da banda, em percentagem da caixa dela.
 *
 * `s` é a escala de partida e `r` a rotação de partida — **nunca perto de
 * 45°**, que é a regra do `Cruz` e da `Curva`: um "+" a meio caminho é um X.
 * Todos acabam a 0°, do mesmo tamanho e alinhados na régua.
 */
const POEIRA = [
  { x: 8, y: 20, s: 1.7, r: -14, o: 0.22 },
  { x: 21, y: 63, s: 0.9, r: 22, o: 0.18 },
  { x: 13, y: 88, s: 1.2, r: 8, o: 0.2 },
  { x: 33, y: 13, s: 0.7, r: -24, o: 0.16 },
  { x: 49, y: 91, s: 1.0, r: 16, o: 0.18 },
  { x: 67, y: 15, s: 1.3, r: 10, o: 0.2 },
  { x: 85, y: 35, s: 2.0, r: -18, o: 0.22 },
  { x: 77, y: 73, s: 0.8, r: 26, o: 0.16 },
  { x: 91, y: 89, s: 1.1, r: -8, o: 0.2 },
];

/**
 * O título, em duas linhas. Cada uma sobe de dentro da sua máscara.
 *
 * O `nowrap` do "Conta-nos" não é gosto: a 390px o `t-seccao` dá 62px, a linha
 * parte-se, e o único sítio onde ela cabia era **no hífen** — o convite abria
 * com "Conta-" sozinho numa linha.
 */
const TITULO = [
  { id: "convite", node: <><span className="whitespace-nowrap">Conta-nos</span> o que </> },
  { id: "mente", node: "tens em mente." },
];

export function Fecho() {
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const banda = raiz.current?.querySelector<HTMLElement>("[data-banda]");
      const camada = raiz.current?.querySelector<HTMLElement>("[data-poeira]");
      const regua = raiz.current?.querySelector<HTMLElement>("[data-regua]");
      if (!banda || !camada || !regua) return;

      const mais = gsap.utils.toArray<HTMLElement>("[data-mais]", camada);
      const linhas = gsap.utils.toArray<HTMLElement>("[data-linha]", banda);
      const titulo = gsap.utils.toArray<HTMLElement>("[data-titulo]", banda);

      /* `opacity: 1` à mão e nunca `clearProps: "all"`: devolver o elemento ao
         CSS devolve-o à regra que esconde os `[data-reveal]` — ver docs/04. */
      const mostrar = () => {
        gsap.set([...titulo, ...linhas], { opacity: 1, y: 0, yPercent: 0 });
        gsap.set(regua, { scaleX: 1 });
      };

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        /* Sem movimento a poeira fica onde foi semeada, que é uma composição
           por si — o que não há é a viagem até à régua. */
        mostrar();
        return;
      }

      /* ── A poeira converge, e a régua desenha-se com ela ──────────────────
         Os alvos calculam-se a partir do **layout** (`offsetWidth`), e não de
         `getBoundingClientRect`, porque o rect já traz a transformação que
         este mesmo tween escreveu — a meio do scrub, medir com ele é medir o
         próprio resultado. E é `fromTo` de propósito: com `invalidateOnRefresh`
         o GSAP volta a ler os valores de partida, e um `to` puro leria a
         posição intermédia em que o elemento estivesse nesse instante. */
      const alvoX = (i: number) => ((i + 0.5) / mais.length) * camada.offsetWidth;
      const partidaX = (i: number) => (POEIRA[i].x / 100) * camada.offsetWidth;
      const partidaY = (i: number) => (POEIRA[i].y / 100) * camada.offsetHeight;

      /* A janela vai de quando a banda assoma até ao **fim do documento**, e
         não do topo ao fundo dela. A banda tem 70svh: entre estar toda visível
         e o fundo dela chegar ao fim do ecrã há menos de 200px de scroll, ou
         seja a poeira espalhada nunca se via — quem chegasse ao convite já a
         apanhava reunida. Com `end: "max"` a viagem acaba exatamente quando a
         página acaba, que é o que ela quer dizer. */
      const viagem = gsap.timeline({
        scrollTrigger: {
          trigger: banda,
          start: "top 75%",
          end: "max",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      viagem
        .fromTo(
          mais,
          {
            x: 0,
            y: 0,
            rotation: (i: number) => POEIRA[i].r,
            scale: (i: number) => POEIRA[i].s,
          },
          {
            x: (i: number) => alvoX(i) - partidaX(i),
            y: (i: number) => camada.offsetHeight - partidaY(i),
            rotation: 0,
            scale: 0.55,
            ease: "none",
            stagger: 0.05,
          },
          0,
        )
        .fromTo(regua, { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);

      /* ── O convite chega ──────────────────────────────────────────────────
         As duas durações são as do site e são duas de propósito: a opacidade
         assenta aos 290 ms e a posição continua até aos 475 ms. Ver docs/04. */
      const entrada = gsap.timeline({
        scrollTrigger: { trigger: banda, start: "top 85%", once: true },
      });

      entrada
        .fromTo(
          titulo,
          { yPercent: 110, opacity: 0 },
          {
            opacity: 1,
            duration: MOVIMENTO.escala,
            ease: MOVIMENTO.ease,
            stagger: MOVIMENTO.staggerHero,
          },
          0,
        )
        .to(
          titulo,
          {
            yPercent: 0,
            duration: MOVIMENTO.entrada,
            ease: MOVIMENTO.ease,
            stagger: MOVIMENTO.staggerHero,
          },
          0,
        )
        .fromTo(
          linhas,
          { y: MOVIMENTO.y, opacity: 0 },
          {
            opacity: 1,
            duration: MOVIMENTO.escala,
            ease: MOVIMENTO.ease,
            stagger: MOVIMENTO.stagger,
          },
          0.3,
        )
        .to(
          linhas,
          {
            y: 0,
            duration: MOVIMENTO.entrada,
            ease: MOVIMENTO.ease,
            stagger: MOVIMENTO.stagger,
          },
          0.3,
        );

      /* A mesma rede de segurança do `Reveal`: um renderizador headless ou um
         separador em segundo plano podem nunca disparar o gatilho, e o convite
         não pode ficar por escrever. `progress() === 0` distingue "nunca
         começou" de "está a meio". */
      const t = setTimeout(() => {
        if (entrada.progress() === 0) {
          entrada.kill();
          mostrar();
        }
      }, 1200);

      return () => clearTimeout(t);
    },
    { scope: raiz },
  );

  return (
    <div ref={raiz}>
      {/* `overflow-x: clip` e não `hidden`: o `clip` não obriga o outro eixo a
          recortar também, e a poeira tem de poder pousar **em cima** da régua,
          meia unidade abaixo da banda. Com `overflow-hidden` os "+" chegavam
          ao fim cortados ao meio. */}
      <div
        data-banda
        className="relative grid min-h-[62svh] place-content-center py-[clamp(4rem,9vh,6.5rem)] text-center [overflow-x:clip] sm:min-h-[70svh]"
      >
        {/* A poeira. Decorativa: não leva `data-scroll-item` nem `data-reveal`
            — o que ela promete não é conteúdo, e a 0,2 de opacidade nunca
            passaria o "chegou a ver-se" do verificador. */}
        <div
          data-poeira
          aria-hidden
          className="pointer-events-none absolute inset-0 [--poeira:clamp(15px,2.4vw,30px)]"
        >
          {POEIRA.map((g, i) => (
            <span
              key={i}
              data-mais
              /* O `translate` é a propriedade CSS, não uma transformação: o
                 GSAP escreve o `transform` e as duas somam-se sem se pisarem.
                 Com `-translate-x-1/2` do Tailwind, o primeiro `gsap.set`
                 apagava a centragem e a poeira saltava meio símbolo. */
              style={{
                left: `${g.x}%`,
                top: `${g.y}%`,
                width: "var(--poeira)",
                height: "var(--poeira)",
                translate: "-50% -50%",
                opacity: g.o,
              }}
              className="absolute block text-primary-ink"
            >
              {/* A geometria vem do `Logo`, que a lê de `lib/brand.ts` e pinta
                  em `currentColor`. Nunca se redesenha o "+" à mão — docs/03. */}
              <Logo className="h-full w-full" />
            </span>
          ))}
        </div>

        <Container className="relative">
          <h2 className="t-seccao mx-auto max-w-[15ch] font-display font-extrabold text-primary-ink">
            {TITULO.map((l) => (
              /* Uma máscara por linha, e o `h2` continua a ser **um elemento
                 só**: quem lê com leitor de ecrã recebe a frase inteira. O
                 `pb`/`-mb` é o que impede a máscara de cortar as descidas do
                 "q" — com `line-height: 0.95` elas passam a linha de base. */
              <span key={l.id} className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
                <span data-titulo data-reveal className="block">
                  {l.node}
                </span>
              </span>
            ))}
          </h2>

          <p
            data-linha
            data-reveal
            className="mx-auto mt-5 max-w-[42ch] text-lg text-primary-ink"
          >
            Mesmo que ainda seja só uma ideia. Respondemos depressa e dizemos-te
            logo se é trabalho para nós.
          </p>

          <div data-linha data-reveal className="mt-8 flex justify-center">
            <Button href="/contacto" variant="contraste" className="group">
              Começar a conversa
              {/* O "+" que roda no hover é a mesma coisa que o `Lockup` faz com
                  o do logótipo. É a assinatura do site a responder ao rato. */}
              <span
                aria-hidden
                className="text-base font-extrabold leading-none transition-transform duration-300 group-hover:rotate-90"
              >
                +
              </span>
            </Button>
          </div>

          <div data-linha data-reveal className="mt-4">
            <a
              href={`mailto:${site.email}`}
              className="inline-flex min-h-11 items-center px-2 text-sm text-primary-ink underline decoration-primary-ink/40 underline-offset-4 transition-colors hover:decoration-primary-ink"
            >
              {site.email}
            </a>
          </div>
        </Container>
      </div>

      {/* A régua onde a poeira pousa. `scale-x-0` não fica em classe nenhuma:
          sem JavaScript ela tem de estar desenhada, e quem a esconde para
          animar é o GSAP. */}
      <div
        aria-hidden
        data-regua
        className="h-px w-full origin-left bg-primary-ink/25"
      />
    </div>
  );
}
