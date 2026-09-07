"use client";
/** docs: docs/04-componentes-e-padroes.md · docs/06-projetos.md */

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { projects } from "@/lib/projects";

/**
 * O trabalho todo, num índice: os nomes numa coluna e a capa do que está a ser
 * lido numa moldura que não se mexe.
 *
 * **A página inicial mostra o trabalho a passar de lado; aqui não se passeia,
 * escolhe-se.** É a diferença entre quem está a conhecer o estúdio e quem já
 * veio ver se fizemos alguma coisa parecida com o que precisa — e um índice é
 * a forma de quem procura.
 *
 * O projeto ativo é o que está mais perto da linha dos 42% do ecrã, e não o
 * primeiro visível: com "o primeiro visível", a capa trocava assim que uma
 * linha espreitasse por baixo e o que se via deixava de ser o que se estava a
 * ler. O rato manda por cima do scroll — quem aponta um nome quer ver aquele.
 *
 * **Quem troca a capa escreve no DOM, não no React.** É a mesma razão do
 * `ServicosAcordeao`: um `setState` por frame de scroll re-renderiza doze
 * elementos enquanto o ScrollTrigger do `Cruz` corre nesta página, e o React
 * não tem nada a ganhar em saber qual é a capa visível. Aqui é um `data-ativo`,
 * e o resto é CSS.
 */
export function PortfolioIndice() {
  const ref = useRef<HTMLDivElement>(null);
  const agendado = useRef(false);
  const ativo = useRef(0);

  const marcar = useCallback((i: number) => {
    if (i === ativo.current) return;
    ativo.current = i;
    const raiz = ref.current;
    if (!raiz) return;
    raiz
      .querySelectorAll<HTMLElement>("[data-obra],[data-capa]")
      .forEach((el) => {
        const seu = Number(el.dataset.i);
        el.dataset.ativo = seu === i ? "true" : "false";
      });
  }, []);

  const escolher = useCallback(() => {
    agendado.current = false;
    const itens = ref.current?.querySelectorAll<HTMLElement>("[data-obra]");
    if (!itens?.length) return;
    const linha = window.innerHeight * 0.42;
    let melhor = 0;
    let dist = Infinity;
    itens.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - linha);
      if (d < dist) {
        dist = d;
        melhor = i;
      }
    });
    marcar(melhor);
  }, [marcar]);

  useEffect(() => {
    /* Um cálculo por frame de scroll sobre seis elementos é mais barato — e
       exato — do que um `IntersectionObserver` com dezenas de limiares. */
    const agendar = () => {
      if (agendado.current) return;
      agendado.current = true;
      requestAnimationFrame(escolher);
    };
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    escolher();
    return () => {
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
    };
  }, [escolher]);

  return (
    <div
      ref={ref}
      className="grid items-start gap-10 lg:grid-cols-[1fr_minmax(0,42%)] lg:gap-16"
    >
      <ol className="grid gap-4 sm:gap-6">
        {projects.map((p, i) => (
          <li
            key={p.slug}
            data-obra
            data-i={i}
            data-ativo={i === 0 ? "true" : "false"}
            onMouseEnter={() => marcar(i)}
            className="group/obra border-t border-border pt-4 sm:pt-6"
          >
            <Link href={`/portfolio/${p.slug}`} className="group grid gap-1.5">
              <h2 className="m-0 font-display text-[clamp(1.9rem,5vw,4rem)] font-extrabold leading-[0.95] tracking-[-0.045em] text-ink/40 transition-colors duration-300 group-hover:text-ink group-data-[ativo=true]/obra:text-ink">
                {p.name}
              </h2>
              <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
                <span className="font-semibold tabular-nums text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {p.category} · {p.year}
                {p.status === "em-curso" ? (
                  <span className="rounded-full border border-primary/55 px-2 py-0.5 text-xs uppercase tracking-[0.18em] text-primary">
                    Em curso
                  </span>
                ) : null}
              </p>
            </Link>
          </li>
        ))}
      </ol>

      {/* A moldura fica; muda o que está lá dentro. É `aria-hidden` porque
          repete o que a coluna já diz — quem navega por leitor de ecrã lê os
          nomes, não precisa de ouvir seis capas. */}
      <div
        aria-hidden
        className="relative order-first aspect-[8/5] overflow-hidden rounded-2xl bg-surface lg:sticky lg:top-[18vh] lg:order-last"
      >
        {projects.map((p, i) => (
          <div
            key={p.slug}
            data-capa
            data-i={i}
            data-ativo={i === 0 ? "true" : "false"}
            className="absolute inset-0 opacity-0 transition-opacity duration-[420ms] data-[ativo=true]:opacity-100"
          >
            {p.image ? (
              <Image
                src={p.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
              />
            ) : (
              /* Sem capa não se põe a de outro nem um buraco: fica o nome, que
                 é o que existe. A lacuna está registada no docs/06. */
              <div className="grid h-full place-items-center bg-gradient-to-br from-primary/20 to-surface px-8 text-center">
                <span className="font-display text-[clamp(1.2rem,2.5vw,2rem)] font-extrabold tracking-[-0.03em]">
                  {p.name}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
