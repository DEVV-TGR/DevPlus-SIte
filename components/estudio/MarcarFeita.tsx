/** docs: docs/07-estudio.md */
"use client";

import { useFormStatus } from "react-dom";
import { Marca } from "@/components/estudio/Marca";
import { alternarTarefa } from "@/lib/estudio/acoes";

/**
 * Marcar uma tarefa como feita sem sair do resumo.
 *
 * Um `<form>` com um botão, como na ficha do projeto — funciona antes de o
 * JavaScript chegar. O `marcar=feita` diz à ação que é para pôr como feita, e
 * não para trocar: no resumo só aparecem as que estão por fazer, e dois cliques
 * seguidos não podem desfazer o primeiro.
 *
 * Enquanto a ação corre, a caixa já mostra o visto — a lista só se atualiza
 * quando o servidor responder, e sem isto o clique parecia não ter feito nada.
 */
export function MarcarFeita({
  id,
  projetoId,
  texto,
}: {
  id: number;
  projetoId: number;
  texto: string;
}) {
  return (
    <form action={alternarTarefa} className="flex-none">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="projetoId" value={projetoId} />
      <input type="hidden" name="marcar" value="feita" />
      <Botao texto={texto} />
    </form>
  );
}

function Botao({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={`Marcar "${texto}" como feita`}
      className="grid size-8 place-items-center rounded-lg transition-colors hover:bg-surface-2 disabled:cursor-wait"
    >
      <Marca feita={pending} />
    </button>
  );
}
