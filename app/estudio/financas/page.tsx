/** docs: docs/07-estudio.md */
import { redirect } from "next/navigation";

/**
 * Finanças não é uma página, são duas.
 *
 * Abre nas receitas e não nos gastos porque a pergunta que se faz primeiro é
 * quanto entrou; o que saiu lê-se a seguir, para saber o que sobra.
 */
export default function Financas() {
  redirect("/estudio/financas/receitas");
}
