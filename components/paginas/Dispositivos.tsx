"use client";
/** docs: docs/06-projetos.md — o caso de estudo visual. */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Captura, Project } from "@/lib/projects";
import styles from "./paginas.module.css";

/**
 * O site do cliente em duas molduras — computador e telemóvel — para se
 * percorrer por scroll.
 *
 * **São capturas, não sites vivos.** Nenhum script, formulário ou rastreio do
 * cliente corre aqui; os botões fotografados não fazem nada, e um clique no
 * ecrã abre o site original numa aba nova. Um arrasto ou scroll que mexa mais
 * de oito pixels não conta como clique — senão percorrer abria o site.
 *
 * As molduras têm a proporção da janela que tirou a captura (1440/900 e
 * 390/844), e a captura entra à largura do ecrã com a altura dela: o scroll é
 * por dentro, com `overscroll-behavior: contain` para não arrastar a página.
 * Em desktop as duas lado a lado; no telemóvel uma de cada vez, com dois
 * botões para escolher. Sem captura (projetos sem endereço), mostra-se a capa
 * real quando há, ou um aviso — nunca uma imagem inventada.
 */
type Vista = "desktop" | "mobile";

export function Dispositivos({
  projeto,
  captura,
}: {
  projeto: Pick<Project, "name" | "url" | "image" | "imageAlt">;
  captura?: { desktop: Captura; mobile: Captura };
}) {
  const [vista, setVista] = useState<Vista>("desktop");
  return (
    <div className={styles.dispositivos}>
      <div className={styles.dispositivosBarra}>
        <span className="text-sm text-muted">
          {captura ? "Explora as duas versões" : "Projeto em desenvolvimento"}
        </span>
        {projeto.url ? (
          <a
            href={projeto.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 border-b border-border-strong text-sm"
          >
            Abrir site <span aria-hidden>↗</span>
          </a>
        ) : null}
      </div>
      <div className={styles.dispositivosTroca} role="group" aria-label="Vista do projeto">
        {(
          [
            ["desktop", "Computador"],
            ["mobile", "Telemóvel"],
          ] as const
        ).map(([id, rotulo]) => (
          <button
            key={id}
            type="button"
            aria-pressed={vista === id}
            onClick={() => setVista(id)}
          >
            {rotulo}
          </button>
        ))}
      </div>
      <div className={styles.dispositivosPar} data-vista={vista}>
        <Ecra projeto={projeto} captura={captura?.desktop} vista="desktop" />
        <Ecra projeto={projeto} captura={captura?.mobile} vista="mobile" />
      </div>
      <p className="mt-4 text-sm text-muted">
        {captura
          ? "Faz scroll dentro de cada ecrã. Um clique abre o site original."
          : "O site ainda não tem endereço publicado. Mostramos apenas o material real disponível."}
      </p>
    </div>
  );
}

function Ecra({
  projeto,
  captura,
  vista,
}: {
  projeto: Pick<Project, "name" | "url" | "image" | "imageAlt">;
  captura?: Captura;
  vista: Vista;
}) {
  const nome = vista === "mobile" ? "Telemóvel" : "Computador";
  const ecra = useRef<HTMLDivElement>(null);
  const gesto = useRef<{ x: number; y: number } | null>(null);
  const arrastou = useRef(false);

  useEffect(() => {
    if (ecra.current) ecra.current.scrollTop = 0;
  }, [captura?.src]);

  return (
    <div className={styles.dispositivo} data-dispositivo={vista}>
      <div className={styles.dispositivoTopo} aria-hidden>
        <span className={styles.dispositivoPontos}>
          <i />
          <i />
          <i />
        </span>
        <span>{nome}</span>
      </div>
      <div
        ref={ecra}
        className={styles.dispositivoEcra}
        role="region"
        tabIndex={0}
        aria-label={`${projeto.name}, vista de ${nome.toLowerCase()}.${captura ? " Faz scroll para explorar." : ""}`}
        onScroll={() => (arrastou.current = true)}
        onPointerDown={(e) => {
          arrastou.current = false;
          gesto.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerMove={(e) => {
          const g = gesto.current;
          if (g && (Math.abs(e.clientX - g.x) > 8 || Math.abs(e.clientY - g.y) > 8))
            arrastou.current = true;
        }}
        onPointerCancel={() => (arrastou.current = true)}
        onClickCapture={(e) => {
          if (arrastou.current) {
            e.preventDefault();
            e.stopPropagation();
          }
          gesto.current = null;
        }}
      >
        {captura && projeto.url ? (
          <a
            href={projeto.url}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            aria-hidden
            draggable={false}
            className="block"
          >
            <Image
              src={captura.src}
              alt=""
              width={captura.width}
              height={captura.height}
              sizes={vista === "mobile" ? "260px" : "(min-width: 1024px) 820px, 90vw"}
              draggable={false}
              className="block h-auto w-full"
            />
          </a>
        ) : vista === "desktop" && projeto.image ? (
          <Image
            src={projeto.image}
            alt={projeto.imageAlt ?? `Página inicial de ${projeto.name}`}
            fill
            sizes="(min-width: 1024px) 820px, 90vw"
            className="object-cover object-top"
          />
        ) : (
          <div className={styles.dispositivoVazio}>
            <strong>{projeto.name}</strong>
            <span>
              {projeto.image
                ? "Captura de telemóvel ainda por recolher."
                : "Material visual ainda por disponibilizar."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
