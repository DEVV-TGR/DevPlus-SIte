/** docs: docs/07-estudio.md */
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EtiquetaEstado } from "@/components/estudio/EtiquetaEstado";
import { GraficoMeses } from "@/components/estudio/GraficoMeses";
import { CARTAO, SOBRETITULO } from "@/components/estudio/estilos";
import {
  listarProjetos,
  movimentoMensal,
  porCobrarPorProjeto,
  resumoContas,
  tarefasPorFazer,
} from "@/lib/estudio/dados";
import { requerSessao } from "@/lib/estudio/sessao";
import {
  emAtraso,
  formatarData,
  formatarEuros,
  hojeEmLisboa,
} from "@/lib/estudio/tipos";
import { cn } from "@/lib/utils";

/**
 * O resumo — a página de entrada do Estúdio.
 *
 * Cada número aqui responde a uma pergunta que se faz mesmo, e a ordem é a das
 * perguntas: *aguento-me este mês?*, *quanto entrou?*, *quanto saiu?*, *a quem
 * tenho de ligar?*.
 *
 * **Não há aqui a palavra "lucro"**, e é deliberado. Receitas menos gastos, sem
 * ordenados e sem impostos, é margem — chamar-lhe lucro dava um número
 * confortável e errado, e é sobre números destes que se decide contratar
 * alguém. Ver docs/07.
 */

function Numero({
  rotulo,
  valor,
  nota,
  destaque,
}: {
  rotulo: string;
  valor: string;
  nota?: string;
  destaque?: "primary" | "accent";
}) {
  return (
    <div className={CARTAO}>
      <p className="text-xs text-muted">{rotulo}</p>
      <p
        className={cn(
          "mt-1.5 font-display text-2xl font-semibold tabular-nums tracking-tight",
          destaque === "primary" && "text-primary",
          destaque === "accent" && "text-accent",
        )}
      >
        {valor}
      </p>
      {nota ? <p className="mt-1 text-xs text-muted">{nota}</p> : null}
    </div>
  );
}

export default async function Resumo() {
  await requerSessao();

  const [contas, meses, porCobrar, tarefas, projetos] = await Promise.all([
    resumoContas(),
    movimentoMensal(12),
    porCobrarPorProjeto(),
    tarefasPorFazer(8),
    listarProjetos(),
  ]);

  const hoje = hojeEmLisboa();

  /* O que não anda sozinho: os bloqueados e os que já passaram do prazo. A
     ordem vem da base, que já sabe pôr à frente o que depende de nós. */
  const precisamDeTi = projetos
    .filter(
      (p) =>
        p.estado === "visita" || p.estado === "a-espera" || emAtraso(p, hoje),
    )
    .slice(0, 6);

  const vazio = projetos.length === 0;
  const maiorDivida = porCobrar[0]?.porCobrar ?? 0;

  if (vazio) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <p className={SOBRETITULO}>Estúdio</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
          Ainda não há nada para resumir.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Traz os repositórios do GitHub ou cria um projeto à mão. Assim que
          houver trabalho e valores, é aqui que se vê o que entra, o que sai e a
          quem é preciso ligar.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/estudio/importar">Importar do GitHub</Button>
          <Button href="/estudio/projetos/novo" variant="outline">
            Projeto novo
          </Button>
        </div>
      </div>
    );
  }

  return (
    /* Uma coluna, de cima a baixo. Antes isto era duas colunas com três caixas
       espremidas à direita, e o nome de um projeto não tinha sítio para se ler.
       O ecrã tem altura de sobra; a largura é que é cara. */
    <div className="mx-auto max-w-4xl">
      <p className={SOBRETITULO}>Estúdio</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        Resumo
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Numero
          rotulo="A entrar por mês"
          valor={formatarEuros(contas.recorrenteMensal)}
          nota="mensalidades contratadas"
          destaque={contas.recorrenteMensal > 0 ? "accent" : undefined}
        />
        <Numero
          rotulo="Recebido este mês"
          valor={formatarEuros(contas.recebidoMes)}
        />
        <Numero rotulo="Gasto este mês" valor={formatarEuros(contas.gastosMes)} />
        <Numero
          rotulo="Por cobrar"
          valor={formatarEuros(contas.porCobrar)}
          nota={
            contas.projetosPorCobrar > 0
              ? `${contas.projetosPorCobrar} ${contas.projetosPorCobrar === 1 ? "projeto" : "projetos"}`
              : "está tudo pago"
          }
          destaque={contas.porCobrar > 0 ? "primary" : undefined}
        />
      </div>

      <section aria-labelledby="movimento" className={cn(CARTAO, "mt-12")}>
        <h2
          id="movimento"
          className="font-display text-lg font-semibold tracking-tight"
        >
          Entradas e saídas
        </h2>
        <p className="mt-1 text-sm text-muted">
          Os últimos doze meses. Todos os valores sem IVA.
        </p>
        <div className="mt-6">
          <GraficoMeses meses={meses} />
        </div>
      </section>

      <section aria-labelledby="por-cobrar" className={cn(CARTAO, "mt-12")}>
          <h2
            id="por-cobrar"
            className="font-display text-lg font-semibold tracking-tight"
          >
            Por cobrar
          </h2>

          {porCobrar.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Não há nada por cobrar. Ou está tudo pago, ou ainda não puseste
              valores nos projetos.
            </p>
          ) : (
            /* Barras em HTML e não em SVG: é uma lista ordenada com nomes e
               valores, e o texto de uma lista lê-se melhor do que texto dentro
               de um desenho. O valor está sempre escrito — a barra é o reforço,
               não a informação. */
            <ul className="mt-5 space-y-4">
              {porCobrar.slice(0, 8).map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/estudio/projetos/${p.id}`}
                    className="block rounded-lg p-1.5 transition-colors hover:bg-surface-2"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0 truncate text-sm">
                        {p.nome}
                        {p.clienteNome ? (
                          <span className="text-muted"> · {p.clienteNome}</span>
                        ) : null}
                      </span>
                      <span className="shrink-0 text-sm font-medium tabular-nums text-primary">
                        {formatarEuros(p.porCobrar)}
                      </span>
                    </div>
                    <div
                      className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
                      aria-hidden
                    >
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${maiorDivida > 0 ? (p.porCobrar / maiorDivida) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {formatarEuros(p.recebido)} recebidos de{" "}
                      {formatarEuros(p.valor)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
      </section>

      {/* `items-start`: sem ele, a grelha estica os dois cartões à altura do
          mais alto, e o das tarefas ficava com meio ecrã de vazio por baixo de
          uma linha de texto. */}
      <div className="mt-12 grid items-start gap-8 lg:grid-cols-2">
          <section aria-labelledby="precisam" className={CARTAO}>
            <h2
              id="precisam"
              className="font-display text-lg font-semibold tracking-tight"
            >
              Precisa de ti
            </h2>

            {precisamDeTi.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                Nada bloqueado nem atrasado. Bom sinal.
              </p>
            ) : (
              <ul className="mt-5 space-y-3">
                {precisamDeTi.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/estudio/projetos/${p.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg p-1.5 transition-colors hover:bg-surface-2"
                    >
                      <span className="min-w-0 truncate text-sm">{p.nome}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        {emAtraso(p, hoje) && p.prazo ? (
                          <span className="text-xs text-danger">
                            {formatarData(p.prazo)}
                          </span>
                        ) : null}
                        <EtiquetaEstado estado={p.estado} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="tarefas-pendentes" className={CARTAO}>
            <h2
              id="tarefas-pendentes"
              className="font-display text-lg font-semibold tracking-tight"
            >
              Tarefas por fazer
            </h2>

            {tarefas.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                Sem tarefas por fazer. Se isso te parece estranho, é porque
                ainda não escreveste nenhuma — cada projeto tem uma checklist.
              </p>
            ) : (
              <ul className="mt-5 space-y-3">
                {tarefas.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/estudio/projetos/${t.projetoId}`}
                      className="block rounded-lg p-1.5 transition-colors hover:bg-surface-2"
                    >
                      <span className="block truncate text-sm">{t.texto}</span>
                      <span className="block truncate text-xs text-muted">
                        {t.projetoNome}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
      </div>
    </div>
  );
}
