"use client";
/** docs: docs/04-componentes-e-padroes.md · docs/06-projetos.md · docs/10-materiais-atelier.md */
import Image from "next/image";
import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import { useLenis } from "lenis/react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { MaterialGround } from "@/components/atelier/MaterialGround";
import { homeProjects } from "@/lib/projects";
import { distanceFrom, wrapIndex } from "@/lib/carrossel";
import {
  gsap,
  ScrollTrigger,
  useGSAP,
  comPausa,
  MOVIMENTO,
} from "@/lib/motion";

/**
 * O trabalho, num carrossel de vidro.
 *
 * Um cartão ao centro, nítido: capa verdadeira, nome, estado e os serviços do
 * catálogo. Os vizinhos recuam em perspetiva, escala e transparência, a ±1, ±2
 * e ±3 — com sete projetos vê-se a volta inteira em desktop, e no telemóvel o
 * centro e uma pista de cada lado. A volta é **circular**: depois do último
 * vem o primeiro.
 *
 * **Em desktop o scroll continua a conduzir.** O capítulo pina e cada troço de
 * scroll põe o projeto seguinte ao centro — é a imersão aprovada da galeria,
 * agora com o vidro. Setas, teclado, arrasto e um clique num vizinho fazem o
 * scroll ir até à posição desse projeto, em vez de o trocarem por baixo dele:
 * assim o que está ao centro e o sítio da página dizem sempre o mesmo. No
 * telemóvel e com movimento reduzido não há pin, e a escolha é só manual.
 *
 * **A seleção não é estado do React** — é a regra do `docs/04` para quem é
 * conduzido por um ScrollTrigger. O React desenha os sete cartões uma vez; a
 * função `aplicar` escreve no DOM as distâncias, a camada, o `aria-hidden` e o
 * contador. Só o cartão do centro tem elementos focáveis.
 *
 * Sem autoplay e sem ticker novo: as transições são CSS, e o desfoque do vidro
 * fica só no cartão do centro (docs/10).
 */
const N = homeProjects.length;
const FADE = [1, 0.64, 0.32, 0.12];

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
  const lenis = useLenis();
  const palco = useRef<HTMLDivElement>(null);
  const ativo = useRef(0);
  const pin = useRef<ScrollTrigger | null>(null);
  const toque = useRef<{ x: number; y: number } | null>(null);

  /** Escreve a seleção `i` no DOM: poses, camadas, foco e contador. */
  const aplicar = (i: number) => {
    const raiz = palco.current;
    if (!raiz) return;
    ativo.current = i;
    raiz.querySelectorAll<HTMLElement>("[data-projeto]").forEach((card, j) => {
      const d = distanceFrom(j, i, N);
      const atual = d === 0;
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
    });
    const contador = raiz.querySelector("[data-contador]");
    if (contador) contador.textContent = String(i + 1).padStart(2, "0");
    const nome = raiz.querySelector("[data-nome-atual]");
    if (nome) nome.textContent = homeProjects[i].name;
  };

  /** Vai para o projeto `i` — pelo scroll quando há pin, direto quando não. */
  const ir = (destino: number) => {
    const i = wrapIndex(destino, N);
    const st = pin.current;
    if (!st) {
      aplicar(i);
      return;
    }
    const { fracao } = comPausa(st.end - st.start);
    const progresso = fracao + (i / (N - 1)) * (1 - 2 * fracao);
    const alvo = st.start + progresso * (st.end - st.start);
    if (lenis) lenis.scrollTo(alvo, { duration: MOVIMENTO.hero });
    else window.scrollTo({ top: alvo, behavior: "smooth" });
  };

  useGSAP(
    () => {
      const raiz = palco.current;
      const seccao = raiz?.closest("section");
      if (!raiz || !seccao) return;
      aplicar(ativo.current);
      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          /* Pouco mais de meio ecrã por projeto: com seis trocas são ~3,3
             ecrãs, mais as duas pausas do `comPausa`. A galeria horizontal
             antiga gastava 8. */
          const percurso = () => window.innerHeight * 0.55 * (N - 1);
          const st = ScrollTrigger.create({
            trigger: seccao,
            start: "top top",
            end: () => `+=${comPausa(percurso()).total}`,
            pin: seccao.querySelector<HTMLElement>("[data-gallery-stage]"),
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = comPausa(percurso()).progresso(self.progress);
              const i = Math.round(p * (N - 1));
              if (i !== ativo.current) aplicar(i);
            },
          });
          pin.current = st;
          return () => {
            pin.current = null;
            st.kill();
          };
        },
      );
      return () => mm.revert();
    },
    { scope: palco },
  );

  return (
    <Section
      id="trabalho"
      top={false}
      bottom={false}
      className="capitulo-inverso relative isolate overflow-hidden"
    >
      <MaterialGround finish="metal" />
      <div data-gallery-stage className="gallery-stage">
        <Container>
          <div className="gallery-head">
            <h2 className="home-heading">
              Trabalho que{" "}
              <em className="font-medium text-acento-inverso">fala por nós.</em>
            </h2>
            <Link href="/portfolio" className="gallery-all">
              Todo o portfólio <span aria-hidden>↗</span>
            </Link>
          </div>
        </Container>
        <div ref={palco}>
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
            <p className="gallery-count" aria-live="polite" aria-atomic="true">
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
          </div>
        </div>
      </div>
    </Section>
  );
}
