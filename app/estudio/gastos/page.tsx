/** docs: docs/07-estudio.md */
import { redirect } from "next/navigation";

/**
 * Os gastos mudaram-se para dentro de Finanças, ao lado das receitas.
 *
 * Isto fica porque o endereço antigo está em marcadores e no histórico de quem
 * usa o Estúdio todos os dias, e porque um 404 num sítio onde se ia todos os
 * dias não explica nada a ninguém. Sem `requerSessao()` de propósito: não toca
 * na base, não lê o cookie, e mandar quem não tem sessão para o endereço novo
 * é mais útil do que o mandar para o ecrã de entrada — lá, o `requerSessao()`
 * da página a sério trata dele.
 */
export default function GastosMudouDeSitio() {
  redirect("/estudio/financas/gastos");
}
