/** docs: docs/07-estudio.md */
"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

/**
 * O botão de submeter de qualquer formulário do Estúdio.
 *
 * Vive num componente à parte porque o `useFormStatus` só sabe o estado do
 * `<form>` **acima** de si — chamado dentro do próprio formulário, devolvia
 * sempre `pending: false`.
 */
export function BotaoGuardar({
  children,
  aGuardar = "A guardar…",
}: {
  children: React.ReactNode;
  aGuardar?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? aGuardar : children}
    </Button>
  );
}
