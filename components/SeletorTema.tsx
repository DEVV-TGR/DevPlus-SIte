/** docs: docs/02-cores-e-tipografia.md — "Temas". */
"use client";

import { useEffect, useSyncExternalStore } from "react";
import { CHAVE_TEMA, type Tema } from "@/lib/tema";

/**
 * O botão sol/lua, fixo no canto inferior esquerdo do site público.
 *
 * Quem pinta o primeiro tema é o script do `app/layout.tsx`, antes do React;
 * este botão só lê o atributo `data-theme` do `<html>` e troca-o. Por isso o
 * estado vive no DOM e não num `useState`: o React não tem de adivinhar no
 * servidor o que o browser já decidiu, e a escolha atravessa as navegações sem
 * se perder.
 *
 * É um botão alternável com nome fixo — "Modo escuro", premido ou não — que é
 * o que os leitores de ecrã anunciam bem. A dica visual diz a ação seguinte.
 *
 * Sem escolha guardada, acompanha o sistema em direto; depois de um clique, a
 * escolha manda até ser trocada outra vez.
 */
const html = () => document.documentElement;
const ler = (): Tema => (html().dataset.theme === "light" ? "light" : "dark");

function subscrever(avisar: () => void) {
  const observador = new MutationObserver(avisar);
  observador.observe(html(), { attributes: true, attributeFilter: ["data-theme"] });
  return () => observador.disconnect();
}

function escolhaGuardada(): Tema | null {
  try {
    const valor = localStorage.getItem(CHAVE_TEMA);
    return valor === "light" || valor === "dark" ? valor : null;
  } catch {
    return null;
  }
}

export function SeletorTema() {
  const tema = useSyncExternalStore(subscrever, ler, () => "dark" as Tema);

  useEffect(() => {
    const sistema = window.matchMedia("(prefers-color-scheme: light)");
    const seguir = () => {
      if (escolhaGuardada()) return;
      html().dataset.theme = sistema.matches ? "light" : "dark";
    };
    sistema.addEventListener("change", seguir);
    return () => sistema.removeEventListener("change", seguir);
  }, []);

  const escuro = tema === "dark";
  const seguinte = escuro ? "claro" : "escuro";

  return (
    <button
      type="button"
      className="seletor-tema"
      aria-label="Modo escuro"
      aria-pressed={escuro}
      onClick={() => {
        const novo: Tema = escuro ? "light" : "dark";
        html().dataset.theme = novo;
        try {
          localStorage.setItem(CHAVE_TEMA, novo);
        } catch {
          /* Sem armazenamento (modo privado), a troca vale até recarregar. */
        }
      }}
    >
      {escuro ? <Sol /> : <Lua />}
      <span className="seletor-tema-dica" aria-hidden>
        Mudar para {seguinte}
      </span>
    </button>
  );
}

function Sol() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
    </svg>
  );
}

function Lua() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </svg>
  );
}
