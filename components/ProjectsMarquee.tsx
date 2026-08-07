"use client";
/** docs: docs/04-componentes-e-padroes.md · docs/06-projetos.md */

import { useEffect, useRef } from "react";
import { ProjectCard } from "@/components/ui/ProjectCard";
import type { Project } from "@/lib/projects";

/**
 * Faixa contínua de projetos, arrastável.
 *
 * Não usa a animação do `Marquee`: com `translateX` o conteúdo não é
 * agarrável, e quem quisesse voltar a um projeto que passou tinha de esperar
 * pela volta inteira. Aqui o movimento é **scroll a sério** — um
 * `requestAnimationFrame` empurra o `scrollLeft` devagar — o que traz de
 * borla o arrasto com o dedo, o trackpad, a roda com shift e as setas do
 * teclado. O arrasto com o rato é o único que precisa de código.
 *
 * O conteúdo repete-se `RONDAS` vezes e o `scrollLeft` dá a volta ao fim de
 * uma ronda, o que faz o ciclo parecer infinito nos dois sentidos. Só a
 * primeira conta para o teclado e para os leitores de ecrã: as outras são
 * `aria-hidden` e os seus links não recebem foco, para não haver 15 alvos de
 * teclado onde existem 5 projetos. **Clicáveis são todas** — quem carrega num
 * card espera abri-lo, e não tem como saber que aquele é uma repetição.
 *
 * Sem JavaScript continua a ser um carrossel — só não anda sozinho.
 */

const CARD_SIZES = "(min-width: 1024px) 440px, (min-width: 640px) 380px, 90vw";

/** Largura da célula = largura do card + os 2×`px-2`. */
const CELL = "w-[calc(100vw-2rem)] shrink-0 px-2 sm:w-[396px] lg:w-[456px]";

/**
 * Quantas vezes a lista se repete. Duas chegam para o ciclo fechar, mas em
 * ecrãs largos a repetição fica à vista: a cópia entra no campo de visão quase
 * ao mesmo tempo que o original sai. Com três, a volta acontece longe do que se
 * está a ver.
 */
const RONDAS = 3;

/** Píxeis por segundo. Devagar: tem de dar para ler e para acertar num card. */
const VELOCIDADE = 34;

/**
 * Milissegundos sem movimento vindo de fora antes de o avanço automático
 * retomar. É o tempo que se dá à inércia do telemóvel para assentar sozinha.
 */
const ESPERA_INERCIA = 250;

export function ProjectsMarquee({
  projects,
  velocidade = VELOCIDADE,
}: {
  projects: Project[];
  velocidade?: number;
}) {
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;

    /** Largura de uma ronda: é ao fim dela que a faixa se repete. */
    const ronda = () => el.scrollWidth / RONDAS;

    // Arrancar a meio dá margem para arrastar nos dois sentidos desde o
    // primeiro instante. Fica adiado para o primeiro frame em que já há
    // largura: enquanto as capas não têm dimensão, `scrollWidth` é 0.
    let porArrancar = true;

    let posicao = 0;
    let ultimoAplicado = posicao;
    let anterior: number | null = null;
    let parado = false;
    let raf = 0;

    /** Instante do último movimento vindo de fora (dedo, roda, teclado). */
    let ultimoExterno = -Infinity;

    // Mantém a posição numa janela de uma ronda, centrada no meio do que dá
    // para rolar. Como as rondas são idênticas, o salto não se vê.
    //
    // A janela não é a primeira ronda, que era o mínimo para o ciclo fechar: aí
    // a faixa acabava colada ao extremo esquerdo, e um impulso do dedo batia na
    // parede do scroll e parava a seco. Assim sobra sempre a mesma folga dos
    // dois lados, seja qual for a largura do ecrã.
    //
    // O que dá para rolar são `RONDAS` rondas menos o que se vê; tirando a
    // ronda da janela e dividindo por dois, sobra a folga de cada lado.
    const inicioJanela = () =>
      Math.max(0, ((RONDAS - 1) * ronda() - el.clientWidth) / 2);

    const normalizar = (v: number) => {
      const m = ronda();
      if (m <= 0) return v;
      const base = inicioJanela();
      return ((((v - base) % m) + m) % m) + base;
    };

    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Escreve a posição já normalizada. É aqui que o ciclo se fecha: o browser
    // nunca deixaria o `scrollLeft` passar de 0, e sem isto o arrasto para trás
    // encravava no extremo esquerdo em vez de dar a volta.
    const aplicar = (v: number) => {
      posicao = normalizar(v);
      el.scrollLeft = posicao;
      ultimoAplicado = el.scrollLeft;
    };

    const passo = (agora: number) => {
      raf = requestAnimationFrame(passo);
      const delta = anterior === null ? 0 : (agora - anterior) / 1000;
      anterior = agora;

      if (porArrancar) {
        if (ronda() <= 0) return;
        porArrancar = false;
        aplicar(ronda() / 2);
      }

      // Alguém mexeu por fora (dedo, roda, trackpad, teclado): aceita a
      // posição dele e marca a hora.
      if (Math.abs(el.scrollLeft - ultimoAplicado) > 1) {
        posicao = el.scrollLeft;
        ultimoExterno = agora;
      }

      if (parado || semMovimento.matches || aArrastar) return;

      // Escrever no `scrollLeft` cancela a inércia nativa. Sem esta espera, o
      // frame a seguir ao dedo sair do ecrã matava o impulso — no telemóvel
      // sentia-se como se a faixa estivesse presa. Enquanto a inércia corre o
      // componente só a acompanha; volta a empurrar quando ela assentar.
      if (agora - ultimoExterno < ESPERA_INERCIA) return;

      // Os cards viajam da direita para a esquerda — o mesmo sentido da faixa
      // de disciplinas. Foi decidido a olhar para o ecrã, e não em abstrato:
      // ao contrário, a faixa lê-se como se a página estivesse a recuar. Não
      // troques o sinal sem esse teste. `Math.min` protege de saltos enormes
      // quando o separador esteve em segundo plano.
      aplicar(posicao + velocidade * Math.min(delta, 0.05));
    };

    // Declarado antes do `raf` porque o `passo` consulta-o.
    let aArrastar = false;

    raf = requestAnimationFrame(passo);

    const parar = () => {
      parado = true;
    };
    const retomar = () => {
      parado = false;
    };

    // Só o rato. Um toque também dispara `pointerenter`, mas o `pointerleave`
    // que devia desfazê-lo muitas vezes nunca chega — e a faixa ficava parada
    // para sempre a partir do primeiro toque. O dedo é tratado pelo par
    // `touchstart`/`touchend` logo a seguir.
    const aoEntrar = (e: PointerEvent) => {
      if (e.pointerType === "mouse") parar();
    };
    const aoSair = (e: PointerEvent) => {
      if (e.pointerType === "mouse") retomar();
    };

    el.addEventListener("pointerenter", aoEntrar);
    el.addEventListener("pointerleave", aoSair);
    el.addEventListener("focusin", parar);
    el.addEventListener("focusout", retomar);
    el.addEventListener("touchstart", parar, { passive: true });
    el.addEventListener("touchend", retomar, { passive: true });

    // Arrasto com o rato. O dedo e o trackpad já são tratados pelo browser.
    let xInicial = 0;
    let scrollInicial = 0;
    let percorrido = 0;

    // Sem `setPointerCapture`. Capturar o ponteiro parece o caminho óbvio para
    // o arrasto continuar quando o cursor sai da faixa, mas o Chrome
    // redireciona também o `click` para o elemento que capturou — e o link do
    // projeto deixava de o receber, portanto clicar num card não abria nada.
    // O arrasto fora da faixa resolve-se com os listeners na `window`.
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      aArrastar = true;
      percorrido = 0;
      xInicial = e.clientX;
      scrollInicial = el.scrollLeft;
      el.classList.add("cursor-grabbing");
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!aArrastar) return;
      const dx = e.clientX - xInicial;
      percorrido = Math.max(percorrido, Math.abs(dx));
      aplicar(scrollInicial - dx);
    };

    const onPointerUp = () => {
      if (!aArrastar) return;
      aArrastar = false;
      el.classList.remove("cursor-grabbing");
    };

    // O browser tem um arrasto próprio para links e imagens — o "fantasma" que
    // se cola ao cursor — e ele ganha ao nosso: assim que arranca, o
    // `pointermove` deixa de chegar e o que se arrasta é o link do projeto, não
    // a faixa. Cancelar o `dragstart` é o que o desliga em todos os browsers;
    // `-webkit-user-drag: none` resolveria no Chrome e no Safari e deixava o
    // Firefox de fora.
    const onDragStart = (e: DragEvent) => e.preventDefault();

    // Arrastar não deve abrir o projeto que estava debaixo do cursor.
    const onClick = (e: MouseEvent) => {
      if (percorrido > 8) {
        e.preventDefault();
        e.stopPropagation();
        percorrido = 0;
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("dragstart", onDragStart);
    el.addEventListener("click", onClick, true);

    // Na `window` e não no elemento: um arrasto que sai da faixa — ou que acaba
    // com o cursor fora dela — tem de continuar a contar e de terminar bem.
    // É o que a captura de ponteiro faria, sem o efeito de roubar o `click`.
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", aoEntrar);
      el.removeEventListener("pointerleave", aoSair);
      el.removeEventListener("focusin", parar);
      el.removeEventListener("focusout", retomar);
      el.removeEventListener("touchstart", parar);
      el.removeEventListener("touchend", retomar);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("dragstart", onDragStart);
      el.removeEventListener("click", onClick, true);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [velocidade]);

  return (
    <div
      ref={viewport}
      // `data-lenis-prevent`: sem isto o scroll suave da página rouba o
      // gesto horizontal ao carrossel.
      data-lenis-prevent
      className="carousel-viewport cursor-grab overflow-x-auto overscroll-x-contain"
    >
      {/* `select-none`: sem isto o arrasto vai pintando de seleção os nomes dos
          projetos por onde passa. */}
      <ul className="flex w-max select-none">
        {Array.from({ length: RONDAS }, (_, ronda) =>
          projects.map((p) => {
            const original = ronda === 0;
            return (
              <li
                key={`${ronda}-${p.slug}`}
                // As repetições saem do teclado e do leitor de ecrã, mas
                // continuam clicáveis. Aqui esteve `inert`, que também as
                // tornava mortas ao rato — e metade dos cards no ecrã não
                // abriam ao clique.
                aria-hidden={original ? undefined : true}
                className={`carousel-item ${CELL}`}
              >
                <ProjectCard
                  project={p}
                  reveal={false}
                  focusable={original}
                  blur={false}
                  sizes={CARD_SIZES}
                />
              </li>
            );
          }),
        )}
      </ul>
    </div>
  );
}
