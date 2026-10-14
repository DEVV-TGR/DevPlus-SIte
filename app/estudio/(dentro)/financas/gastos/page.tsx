/** docs: docs/07-estudio.md */
import Link from "next/link";
import { FormularioGasto } from "@/components/estudio/FormularioGasto";
import { Bloco, Numero, TopoDoBloco, Vazio } from "@/components/estudio/Bloco";
import { CabecaDasFinancas } from "@/components/estudio/CabecaDasFinancas";
import { Icone } from "@/components/estudio/Icone";
import { CARTAO, TITULO_CARTAO } from "@/components/estudio/estilos";
import { apagarGasto, criarGasto } from "@/lib/estudio/acoes";
import {
  listarClientes,
  listarGastos,
  listarProjetosLeves,
} from "@/lib/estudio/dados";
import { requerSessao } from "@/lib/estudio/sessao";
import {
  agruparPorMes,
  formatarData,
  formatarEuros,
  formatarMesLongo,
  POR_MES,
  ROTULO_CURTO,
} from "@/lib/estudio/tipos";
import { cn } from "@/lib/utils";

/**
 * O que sai.
 *
 * Um gasto pode ser de um projeto (o domínio de um cliente) ou do estúdio (a
 * Vercel, o Figma). Os do estúdio não entram na margem de projeto nenhum — se
 * entrassem, um projeto parecia pior por causa de uma despesa que existiria na
 * mesma sem ele.
 *
 * A página é uma coluna só, de cima a baixo: o formulário abre em cima, a lista
 * fica por baixo com o ecrã todo. Espremer as duas coisas lado a lado deixava a
 * descrição de um gasto sem sítio para se ler.
 */
export default async function Gastos({
  searchParams,
}: {
  searchParams: Promise<{ novo?: string }>;
}) {
  await requerSessao();

  /* O "Registar gasto" do título e do Resumo traz `?novo=1`, e o formulário
     abre já aberto. */
  const novo = (await searchParams).novo === "1";

  const [gastos, projetos, clientes] = await Promise.all([
    listarGastos(),
    listarProjetosLeves(),
    listarClientes(),
  ]);

  const doEstudio = gastos.filter((g) => g.projetoId === null);

  /* O custo fixo põe as periodicidades todas na mesma escala. Sem isto, somar
     um domínio anual com um alojamento mensal dava um número doze vezes errado
     — ver `POR_MES` em `lib/estudio/tipos.ts`. */
  const porMes = (g: { valor: number; periodicidade: keyof typeof POR_MES }) =>
    g.valor * POR_MES[g.periodicidade];

  const repetem = gastos.filter((g) => g.periodicidade !== "unica");

  /* **O que se repete divide-se em dois, e a divisão é a própria conta.**
     Um domínio que pagamos por um cliente repete-se todos os anos, mas não é
     custo nosso: sai daqui e volta a entrar pela receita `dominio` do projeto,
     ao cêntimo e no mesmo dia. Somá-lo ao custo fixo fazia o estúdio parecer
     mais caro do que é, e era o mesmo erro que a nota do topo desta página
     manda evitar — só ao contrário.

     O que fica no número grande é o que se paga esteja ou não a haver trabalho:
     o alojamento do nosso site, o nosso domínio. Esse é o que interessa saber
     de cor, porque é o que corre mesmo com o mês vazio. */
  const fixosDoEstudio = repetem.filter((g) => g.projetoId === null);
  const repetemPorProjeto = repetem.filter((g) => g.projetoId !== null);

  const fixoPorMes = fixosDoEstudio.reduce((total, g) => total + porMes(g), 0);
  const recuperadoPorMes = repetemPorProjeto.reduce(
    (total, g) => total + porMes(g),
    0,
  );

  /* A lista já vem ordenada por data da consulta (`order by g.data desc`). Isto
     só a parte em blocos de mês, para a ordem se **ver** em vez de ser preciso
     confiar nela: numa linha, a data é a coisa mais pequena e mais apagada, e
     o valor é o que salta primeiro — o que fazia a lista parecer baralhada
     quando nunca esteve. */
  const meses = agruparPorMes(gastos);

  return (
    <div className="mx-auto max-w-6xl">
      <CabecaDasFinancas atual="gastos" />

      {/* Abre sozinho quando ainda não há gastos, ou quando se chega pelo
          "Registar gasto" (`?novo=1`). */}
      <details
        id="registar"
        open={novo || gastos.length === 0}
        className={cn(CARTAO, "group mt-6 scroll-mt-6")}
      >
        <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
          <span
            aria-hidden
            className="grid size-9 flex-none place-items-center rounded-lg bg-primary/10 text-primary"
          >
            <Icone nome="mais" tamanho={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className={cn(TITULO_CARTAO, "block")}>Registar um gasto</span>
            <span className="block text-sm text-muted">
              Uma compra, uma subscrição, um domínio. Se se repete, diz-se
              aqui uma vez e o Estúdio lembra-se nos meses seguintes.
            </span>
          </span>
          <span className="text-sm text-muted group-open:hidden">Abrir</span>
          <span className="hidden text-sm text-muted group-open:inline">Fechar</span>
        </summary>
        <div className="mt-6">
          <FormularioGasto
            acao={criarGasto}
            projetos={projetos}
            clientes={clientes}
          />
        </div>
      </details>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      {repetem.length > 0 ? (
        <Bloco aria-labelledby="custo-fixo">
          <TopoDoBloco
            id="custo-fixo"
            icone="calendario"
            titulo="Custo fixo do estúdio"
            sub="O que se paga todos os meses, haja ou não trabalho"
          />
          <Numero
            rotulo="Por mês"
            valor={formatarEuros(fixoPorMes)}
            grande
            nota={
              fixosDoEstudio.length === 0
                ? "Nada que se repita é do estúdio."
                : `${fixosDoEstudio.length} ${
                    fixosDoEstudio.length === 1
                      ? "despesa que corre"
                      : "despesas que correm"
                  } mesmo com o mês vazio.`
            }
          />

          {fixosDoEstudio.length > 0 ? (
            <ul className="divide-y divide-border border-y border-border">
              {fixosDoEstudio.map((g) => (
                <li
                  key={g.id}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5"
                >
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {g.descricao}
                  </span>
                  <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[0.6875rem] text-muted">
                    {ROTULO_CURTO[g.periodicidade]}
                  </span>
                  <span className="w-20 shrink-0 text-right text-sm tabular-nums text-muted">
                    {formatarEuros(g.valor)}
                  </span>
                  {/* A conversão mostra-se ao lado do valor real, e não em vez
                      dele: um domínio de 39,50 € por ano não é uma despesa de
                      3,29 €, é 39,50 € que aparecem todos de uma vez num mês.
                      Esconder o valor de origem fazia perder isso. */}
                  <span className="w-24 shrink-0 text-right text-sm font-medium tabular-nums">
                    {formatarEuros(porMes(g))}
                    <span className="font-normal text-muted">/mês</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {repetemPorProjeto.length > 0 ? (
            <div>
              <p className="text-xs text-muted">
                Repetem-se, mas são de clientes e voltam a entrar pela receita do
                projeto. Não entram na conta de cima.
              </p>
              <ul className="mt-3 space-y-2">
                {repetemPorProjeto.map((g) => (
                  <li
                    key={g.id}
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-muted"
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {g.descricao}
                      {g.projetoId && g.projetoNome ? (
                        <>
                          {" · "}
                          <Link
                            href={`/estudio/projetos/${g.projetoId}`}
                            className="underline-offset-4 hover:text-ink hover:underline"
                          >
                            {g.projetoNome}
                          </Link>
                        </>
                      ) : null}
                    </span>
                    <span className="shrink-0">
                      {ROTULO_CURTO[g.periodicidade]}
                    </span>
                    <span className="w-20 shrink-0 text-right tabular-nums">
                      {formatarEuros(g.valor)}
                    </span>
                    <span className="w-24 shrink-0 text-right tabular-nums">
                      {formatarEuros(porMes(g))}/mês
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">
                São {formatarEuros(recuperadoPorMes)} por mês que saem e voltam a
                entrar.
              </p>
            </div>
          ) : null}
        </Bloco>
      ) : null}

      <Bloco
        aria-labelledby="lista-gastos"
        className={cn(repetem.length === 0 && "lg:col-span-2")}
      >
        <TopoDoBloco
          id="lista-gastos"
          icone="sai"
          titulo="Tudo o que já saiu"
          sub="Mês a mês, do mais recente para o mais antigo"
        />

        {gastos.length === 0 ? (
          <Vazio>
            Ainda não há gastos registados. Começa pelos que se repetem — o
            alojamento, os domínios, as ferramentas. São os que se esquecem e os
            que mais pesam ao fim do ano.
          </Vazio>
        ) : (
          <>
            <div className="space-y-6">
              {meses.map(({ mes, itens }) => (
                <div key={mes}>
                  {/* Um `h3` e não um `<p>`: são secções de uma lista, e
                      quem navega por cabeçalhos tem de as apanhar. */}
                  <h3 className="text-xs uppercase tracking-[0.18em] text-muted">
                    {formatarMesLongo(mes)}
                  </h3>
                  <ul className="mt-3 divide-y divide-border border-y border-border">
                    {itens.map((g) => (
                      <li
                        key={g.id}
                        className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-3"
                      >
                        <span className="w-24 shrink-0 text-sm font-medium tabular-nums">
                          {formatarEuros(g.valor)}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-sm">{g.descricao}</span>
                            {g.periodicidade !== "unica" ? (
                              <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[0.6875rem] text-muted">
                                {ROTULO_CURTO[g.periodicidade]}
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted">
                            {formatarData(g.data)}
                            {" · "}
                            {g.projetoId && g.projetoNome ? (
                              <Link
                                href={`/estudio/projetos/${g.projetoId}`}
                                className="underline-offset-4 hover:text-ink hover:underline"
                              >
                                {g.projetoNome}
                              </Link>
                            ) : (
                              "do estúdio"
                            )}
                          </span>
                        </span>

                        <form action={apagarGasto} className="shrink-0">
                          <input type="hidden" name="id" value={g.id} />
                          <button
                            type="submit"
                            aria-label={`Apagar o gasto "${g.descricao}"`}
                            className="rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-surface hover:text-danger"
                          >
                            Apagar
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {doEstudio.length > 0 ? (
              <p className="text-xs text-muted">
                {doEstudio.length}{" "}
                {doEstudio.length === 1 ? "gasto é" : "gastos são"} do estúdio e
                não {doEstudio.length === 1 ? "entra" : "entram"} na margem de
                projeto nenhum.
              </p>
            ) : null}
          </>
        )}
      </Bloco>
      </div>
    </div>
  );
}
