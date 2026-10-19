"use client";
/** docs: docs/04-componentes-e-padroes.md · docs/06-projetos.md · docs/10-materiais-atelier.md */
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { MaterialGround } from "@/components/atelier/MaterialGround";
import { homeProjects } from "@/lib/projects";
import { distanceFrom, wrapIndex } from "@/lib/carrossel";

/**
 * O trabalho, num carrossel de vidro.
 *
 * Um cartão ao centro, nítido: capa verdadeira, nome, estado e os serviços do
 * catálogo. Os vizinhos recuam em perspetiva, escala e transparência, a ±1, ±2
 * e ±3 — com sete projetos vê-se a volta inteira em desktop, e no telemóvel o
 * centro e uma pista de cada lado. A volta é **circular**: depois do último
 * vem o primeiro.
 *
 * **Anda sozinho e não prende o scroll.** A cada 2 s passa ao projeto
 * seguinte. Para com o ponteiro em cima, com o foco do teclado lá dentro e com
 * o botão de pausa (o hover não chega a quem usa o dedo — WCAG 2.2.2); para
 * também fora do ecrã e com o separador escondido, e com movimento reduzido
 * nem arranca. Setas, teclado, arrasto e um clique num vizinho continuam e
 * recomeçam a contagem. O pin antigo obrigava a percorrer os sete projetos
 * para chegar à secção seguinte; já não existe.
 *
 * **A seleção não é estado do React** — o React desenha os sete cartões uma
 * vez e `aplicar` escreve no DOM as distâncias, a camada, o `aria-hidden` e o
 * contador: o autoplay chama-a a cada passo, e re-renderizar sete cartões para
 * isso não faz sentido. Só o cartão do centro tem elementos focáveis. A pausa
 * é estado porque muda o rótulo do botão.
 *
 * As transições são CSS e mexem tudo junto — posição, escala, transparência
 * da capa e do texto, camada e desfoque — para a troca ser um movimento e não
 * dois quadros. O cartão que dá a volta (do −3 para o +3) não atravessa o
 * palco por trás dos outros: some de um lado e aparece do outro.
 */
const N = homeProjects.length;
const FADE = [1, 0.64, 0.32, 0.12];
const PASSO_MS = 2000;

/** As variáveis de um cartão a uma distância `d` do centro. */
function pose(d: number) {
  const depth = Math.abs(d);
  return {
    "--distance": d,
    "--scale": 1 - depth * 0.13,
    "--fade": FADE[depth] ?? 0,
    "--turn": `${d * -9}deg`,
    zIndex: N - depth,
  } as CSSProperties;
}

function Seta({ sentido }: { sentido: -1 | 1 }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={sentido < 0 ? "M15 5 8 12l7 7M8 12h13" : "m9 5 7 7-7 7M16 12H3"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProvaCarrossel() {
  const palco = useRef<HTMLDivElement>(null);
  const ativo = useRef(0);
  const toque = useRef<{ x: number; y: number } | null>(null);
  /** Quem pede pausa agora: ponteiro, foco, ecrã, separador, movimento. */
  const motivos = useRef(new Set<string>());
  const relogio = useRef<number | undefined>(undefined);
  const [pausado, setPausado] = useState(false);
  const pausadoRef = useRef(false);

  /** Escreve a seleção `i` no DOM: poses, camadas, foco e contador. */
  const aplicar = (i: number) => {
    const raiz = palco.current;
    if (!raiz) return;
    ativo.current = i;
    raiz.querySelectorAll<HTMLElement>("[data-projeto]").forEach((card, j) => {
      const d = distanceFrom(j, i, N);
      const antes = Number(card.style.getPropertyValue("--distance") || d);
      const atual = d === 0;
      /* Deu a volta: troca de lado sem transição de posição, com a
         transparência a fazer a passagem (`[data-volta]` no CSS). */
      const volta = Math.abs(d - antes) > 1;
      if (volta) card.dataset.volta = "true";
      Object.entries(pose(d)).forEach(([k, v]) => {
        if (k === "zIndex") card.style.zIndex = String(v);
        else card.style.setProperty(k, String(v));
      });
      card.dataset.depth = String(Math.abs(d));
      card.dataset.current = String(atual);
      card.setAttribute("aria-hidden", String(!atual));
      card
        .querySelectorAll<HTMLElement>("[data-foco-atual]")
        .forEach((el) => (el.tabIndex = atual ? 0 : -1));
      if (volta) {
        void card.offsetWidth;
        requestAnimationFrame(() => delete card.dataset.volta);
      }
    });
    const contador = raiz.querySelector("[data-contador]");
    if (contador) contador.textContent = String(i + 1).padStart(2, "0");
    const nome = raiz.querySelector("[data-nome-atual]");
    if (nome) nome.textContent = homeProjects[i].name;
  };

  /** Arma o passo seguinte, se ninguém pedir pausa. */
  const armar = () => {
    window.clearTimeout(relogio.current);
    relogio.current = undefined;
    if (pausadoRef.current || motivos.current.size > 0) return;
    relogio.current = window.setTimeout(() => {
      aplicar(wrapIndex(ativo.current + 1, N));
      armar();
    }, PASSO_MS);
  };

  const pedirPausa = (motivo: string, sim: boolean) => {
    if (sim) motivos.current.add(motivo);
    else motivos.current.delete(motivo);
    armar();
  };

  /** Vai para o projeto `i` e recomeça a contagem dos 2 s. */
  const ir = (destino: number) => {
    aplicar(wrapIndex(destino, N));
    armar();
  };

  const alternarPausa = () => {
    pausadoRef.current = !pausadoRef.current;
    setPausado(pausadoRef.current);
    armar();
  };

  useEffect(() => {
    const raiz = palco.current;
    if (!raiz) return;
    aplicar(ativo.current);
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)");
    const movimento = () => pedirPausa("movimento", reduzido.matches);
    const separador = () => pedirPausa("separador", document.hidden);
    const visivel = new IntersectionObserver(
      ([e]) => pedirPausa("ecra", !e.isIntersecting),
      { threshold: 0.35 },
    );
    /* Até o observador responder, conta como fora do ecrã. */
    motivos.current.add("ecra");
    movimento();
    separador();
    visivel.observe(raiz);
    reduzido.addEventListener("change", movimento);
    document.addEventListener("visibilitychange", separador);
    return () => {
      window.clearTimeout(relogio.current);
      visivel.disconnect();
      reduzido.removeEventListener("change", movimento);
      document.removeEventListener("visibilitychange", separador);
    };
    // Corre uma vez: `aplicar` e `pedirPausa` só leem refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Section
      id="trabalho"
      top={false}
      bottom={false}
      className="capitulo-inverso relative isolate overflow-hidden"
    >
      <div className="gallery-stage">
        <MaterialGround finish="metal" />
        <Container>
          <div className="gallery-head">
            <h2 className="home-heading">
              Trabalho que{" "}
              <em className="font-medium text-acento-inverso">fala por nós.</em>
            </h2>
            <Link href="/portfolio" className="gallery-all">
              Todo o portfólio <span aria-hidden data-seta="diagonal">↗</span>
            </Link>
          </div>
        </Container>
        <div
          ref={palco}
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse") pedirPausa("ponteiro", true);
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") pedirPausa("ponteiro", false);
          }}
          /* Só o foco do teclado pausa: um clique numa seta também foca o
             botão, e aí a volta tinha de esperar por um clique fora. */
          onFocus={(e) => {
            if (e.target.matches(":focus-visible")) pedirPausa("foco", true);
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null))
              pedirPausa("foco", false);
          }}
        >
          <div
            className="gallery-glass"
            role="region"
            aria-roledescription="carrossel"
            aria-label="Projetos selecionados"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget) return;
              const passo =
                e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
              if (passo) {
                e.preventDefault();
                ir(ativo.current + passo);
              } else if (e.key === "Home" || e.key === "End") {
                e.preventDefault();
                ir(e.key === "Home" ? 0 : N - 1);
              }
            }}
            onPointerDown={(e) => {
              if ((e.target as HTMLElement).closest("a,button") || e.button !== 0)
                return;
              toque.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerCancel={() => (toque.current = null)}
            onPointerUp={(e) => {
              const t = toque.current;
              toque.current = null;
              if (!t) return;
              const dx = e.clientX - t.x;
              const dy = e.clientY - t.y;
              if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2)
                ir(ativo.current + (dx < 0 ? 1 : -1));
            }}
          >
            {homeProjects.map((p, i) => {
              const d = distanceFrom(i, 0, N);
              return (
                <article
                  key={p.slug}
                  data-projeto
                  data-current={String(d === 0)}
                  data-depth={Math.abs(d)}
                  aria-hidden={d !== 0}
                  className="glass-card"
                  style={pose(d)}
                >
                  <div className="glass-card-edge" aria-hidden />
                  <div className="glass-card-image">
                    {p.image && (
                      <Image
                        src={p.image}
                        alt={p.imageAlt ?? `Página inicial de ${p.name}`}
                        fill
                        sizes="(min-width: 1024px) 410px, calc(100vw - 64px)"
                        draggable={false}
                        className="object-cover object-top"
                      />
                    )}
                  </div>
                  <div className="glass-card-meta">
                    <h3>{p.name}</h3>
                    <p className="glass-card-state">
                      {p.status === "em-curso" ? "Em desenvolvimento" : "Concluído"}
                    </p>
                    <ul className="glass-card-tags" aria-label="Serviços">
                      {p.services.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                    <Link
                      href={`/portfolio/${p.slug}`}
                      className="glass-card-link"
                      aria-label={`Ver projeto ${p.name}`}
                      data-foco-atual
                      tabIndex={d === 0 ? 0 : -1}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </div>
                  {/* Um vizinho escolhe-se com um clique em qualquer sítio dele.
                      Fora da ordem de Tab: as setas e o teclado do carrossel
                      chegam a todos sem sete paragens a mais. */}
                  <button
                    type="button"
                    tabIndex={-1}
                    className="glass-card-select"
                    aria-label={`Mostrar ${p.name}`}
                    onClick={() => ir(i)}
                  />
                </article>
              );
            })}
          </div>
          <div className="gallery-controls">
            <button
              type="button"
              aria-label="Projeto anterior"
              onClick={() => ir(ativo.current - 1)}
            >
              <Seta sentido={-1} />
            </button>
            {/* Com a volta a andar, anunciar cada passo era uma voz a cada 2 s:
                o contador só fala quando a pausa está ligada. */}
            <p
              className="gallery-count"
              aria-live={pausado ? "polite" : "off"}
              aria-atomic="true"
            >
              <span data-contador>01</span>
              <span className="gallery-count-line" aria-hidden />
              <span>{String(N).padStart(2, "0")}</span>
              <span className="sr-only">
                {" "}
                — <span data-nome-atual>{homeProjects[0].name}</span>
              </span>
            </p>
            <button
              type="button"
              aria-label="Projeto seguinte"
              onClick={() => ir(ativo.current + 1)}
            >
              <Seta sentido={1} />
            </button>
            <button
              type="button"
              className="gallery-pause"
              aria-pressed={pausado}
              aria-label="Pausar a passagem automática"
              onClick={alternarPausa}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                {pausado ? (
                  <path d="M8 5.5v13l10.5-6.5L8 5.5Z" fill="currentColor" />
                ) : (
                  <path d="M8.5 5.5v13M15.5 5.5v13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
}
