/** docs: docs/07-estudio.md */
import Link from "next/link";
import { Bloco, TopoDoBloco, Vazio } from "@/components/estudio/Bloco";
import { CabecaDasFinancas } from "@/components/estudio/CabecaDasFinancas";
import { listarEntradas, listarReceitas } from "@/lib/estudio/dados";
import { requerSessao } from "@/lib/estudio/sessao";
import {
  agruparPorMes,
  formatarData,
  formatarEuros,
  formatarMesLongo,
  hojeEmLisboa,
  ROTULO_CURTO,
  ROTULO_RECEITA,
} from "@/lib/estudio/tipos";

/**
 * O que entra.
 *
 * Duas perguntas, e são mesmo duas: **o que está contratado** (a tabela
 * `receitas`, que não é dinheiro — é uma promessa de que ele vem) e **o que
 * entrou mesmo** (os pagamentos dos sites mais os recebimentos de alojamento e
 * domínio já saldados). A segunda é o espelho exato da página de Gastos; a
 * primeira não tem espelho nenhum do lado de lá, e por isso vem primeiro: é a
 * que explica de onde é que a outra há de vir.
 *
 * **Não há aqui um total "por mês".** Não é esquecimento — um alojamento anual
 * dividido por doze é um número de planeamento e não de tesouraria, e a página
 * de Gastos pode ter um porque uma subscrição mensal sai mesmo todos os meses.
 * Ver "O resumo é do mês" no doc.
 *
 * **Não se escreve nada aqui.** O alojamento é *daquele site*, e escreve-se na
 * ficha do projeto — um cliente com dois sites pode pagar um e não o outro.
 * Cada linha leva lá.
 */
export default async function Receitas() {
  await requerSessao();

  const [receitas, entradas] = await Promise.all([
    listarReceitas(),
    listarEntradas(),
  ]);

  const hoje = hojeEmLisboa();

  /* Ativa = já começou e ainda não acabou. O mesmo teste da ficha do cliente —
     uma receita terminada não se apaga, põe-se-lhe o `ate`. */
  const ativas = receitas.filter(
    (r) => r.desde <= hoje && (r.ate === null || r.ate >= hoje),
  );

  const alojamentos = ativas.filter((r) => r.tipo === "alojamento").length;
  const dominios = ativas.filter((r) => r.tipo === "dominio").length;

  const meses = agruparPorMes(entradas);

  return (
    <div className="mx-auto max-w-6xl">
      <CabecaDasFinancas atual="receitas" />

      {/* Lado a lado no computador: o contratado à esquerda, que é curto, e o
          que entrou à direita, que cresce todos os meses. */}
      <div className="mt-6 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Bloco aria-labelledby="contratado">
          <TopoDoBloco
            id="contratado"
            icone="calendario"
            titulo="O que está contratado"
            sub="O que os clientes pagam por ter os sites no ar. Escreve-se na aba Dinheiro de cada projeto."
          />

          {ativas.length === 0 ? (
            <Vazio>
              Ainda não há nada contratado. O alojamento e o domínio de cada
              site escrevem-se na secção &ldquo;O que este site rende&rdquo;, na
              aba Dinheiro do projeto.
            </Vazio>
          ) : (
            <>
              <ul className="divide-y divide-border border-y border-border">
                {ativas.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5"
                  >
                    <span className="w-28 shrink-0 text-sm font-medium tabular-nums text-accent">
                      {formatarEuros(r.valor)}
                      <span className="font-normal text-muted">
                        /{ROTULO_CURTO[r.periodicidade]}
                      </span>
                    </span>
                    <Link
                      href={`/estudio/projetos/${r.projetoId}?aba=dinheiro`}
                      className="min-w-0 flex-1 truncate text-sm underline-offset-4 hover:text-ink hover:underline"
                    >
                      {ROTULO_RECEITA[r.tipo]}
                      <span className="text-muted"> · {r.projetoNome}</span>
                    </Link>
                    <span className="shrink-0 text-xs text-muted">
                      {r.clienteNome ?? "Sem cliente"}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="text-xs text-muted">
                {alojamentos} {alojamentos === 1 ? "alojamento" : "alojamentos"}{" "}
                e {dominios} {dominios === 1 ? "domínio" : "domínios"} a correr.
                Não há aqui um total por mês de propósito: um domínio anual
                dividido por doze é um número de planeamento, não de tesouraria.
              </p>
            </>
          )}
        </Bloco>

        <Bloco aria-labelledby="lista-entradas">
          <TopoDoBloco
            id="lista-entradas"
            icone="entra"
            titulo="Tudo o que já entrou"
            sub="Mês a mês, do mais recente para o mais antigo"
          />

          {entradas.length === 0 ? (
            <Vazio>
              Ainda não entrou nada. Um pagamento de um site regista-se na aba
              Dinheiro do projeto; uma cobrança de alojamento dá-se por paga no
              Resumo ou na ficha, mal o vencimento chega.
            </Vazio>
          ) : (
            <>
              <div className="space-y-6">
                {meses.map((m) => (
                  <div key={m.mes}>
                    <h3 className="text-xs uppercase tracking-[0.18em] text-muted">
                      {formatarMesLongo(m.mes)}
                    </h3>
                    <ul className="mt-3 divide-y divide-border border-y border-border">
                      {m.itens.map((e) => (
                        <li
                          key={e.chave}
                          className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-3"
                        >
                          <span className="w-24 shrink-0 text-sm font-medium tabular-nums text-accent">
                            {formatarEuros(e.valor)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/estudio/projetos/${e.projetoId}?aba=dinheiro`}
                              className="truncate text-sm underline-offset-4 hover:text-ink hover:underline"
                            >
                              {e.projetoNome}
                            </Link>
                            <span className="mt-0.5 block truncate text-xs text-muted">
                              {formatarData(e.data)}
                              {e.clienteNome ? ` · ${e.clienteNome}` : ""}
                              {" · "}
                              {/* O que distingue as duas origens: um pagamento
                                abate ao preço do site, um recebimento salda um
                                vencimento e não abate a nada. Dizer só "entrou"
                                apagava a diferença que o doc inteiro defende. */}
                              {e.origem === "pagamento"
                                ? "pelo site"
                                : e.tipo
                                  ? ROTULO_RECEITA[e.tipo].toLocaleLowerCase(
                                      "pt-PT",
                                    )
                                  : "recorrente"}
                              {e.nota ? ` · ${e.nota}` : ""}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted">
                {entradas.length}{" "}
                {entradas.length === 1 ? "entrada" : "entradas"} ao todo. Um
                pagamento abate ao valor combinado do projeto; um recebimento
                salda um vencimento de alojamento ou domínio e não abate a nada.
              </p>
            </>
          )}
        </Bloco>
      </div>
    </div>
  );
}
