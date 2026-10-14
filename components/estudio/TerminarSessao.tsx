/** docs: docs/07-estudio.md */
"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { terminarSessao } from "@/lib/estudio/acoes";

/**
 * O "Terminar sessão" de um aparelho, com a confirmação na própria linha — e
 * não num `confirm()` do browser, que no telemóvel tapa o ecrã e parece um
 * erro. Igual ao do painel do Café Preguiça.
 *
 * O "Terminar" é o botão de apagar do Estúdio (contorno `danger`, nunca cheio),
 * o mesmo do "Apagar este projeto": é uma coisa que não se desfaz.
 */
export function TerminarSessao({
  sessaoId,
  este,
}: {
  sessaoId: number;
  este: boolean;
}) {
  const [aConfirmar, setAConfirmar] = useState(false);

  if (!aConfirmar) {
    return (
      <button
        type="button"
        onClick={() => setAConfirmar(true)}
        className="min-h-9 rounded-full border border-border-strong px-3.5 text-sm transition-colors hover:border-ink/40"
      >
        Terminar sessão
      </button>
    );
  }

  return (
    <form
      action={terminarSessao}
      className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
    >
      <input type="hidden" name="sessaoId" value={sessaoId} />
      <span className="text-xs text-muted">
        {este
          ? "Sais deste aparelho, e para voltar entras outra vez pelo GitHub."
          : "Esse aparelho sai já, e para voltar tem de entrar outra vez."}
      </span>
      <Confirmar />
      <button
        type="button"
        onClick={() => setAConfirmar(false)}
        className="min-h-9 rounded-full px-3 text-sm text-muted transition-colors hover:text-ink"
      >
        Não
      </button>
    </form>
  );
}

function Confirmar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-9 rounded-full border border-danger/40 px-3.5 text-sm text-danger transition-colors hover:bg-danger/10 disabled:opacity-60"
    >
      {pending ? "A terminar…" : "Terminar"}
    </button>
  );
}
