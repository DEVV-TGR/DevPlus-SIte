/** docs: docs/07-estudio.md */
import { Logo } from "@/components/Logo";

/**
 * O que se vê se a secção nova demorar mais do que a transição: o "+" da marca
 * sozinho, a rodar um quarto de volta e a voltar.
 *
 * Sem esqueleto de cartões, e de propósito. No painel do Café Preguiça houve um,
 * e eram quadrados que não existiam na secção que ia aparecer — prometiam uma
 * forma e depois chegava outra.
 */
export default function ACarregar() {
  return (
    <div aria-busy="true" className="grid min-h-[40vh] place-items-center">
      <p role="status" className="sr-only">
        A carregar…
      </p>
      <Logo className="estudio-espera size-8 text-primary" />
    </div>
  );
}
