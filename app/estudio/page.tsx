/** docs: docs/07-estudio.md */
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EtiquetaEstado } from "@/components/estudio/EtiquetaEstado";
import { FormularioObjetivo } from "@/components/estudio/FormularioObjetivo";
import { GraficoCircular } from "@/components/estudio/GraficoCircular";
import { Objetivos } from "@/components/estudio/Objetivos";
import { CARTAO, SOBRETITULO } from "@/components/estudio/estilos";
import { criarObjetivo } from "@/lib/estudio/acoes";
import {
  gastosDoMes,
  listarObjetivos,
  listarProjetos,
  porCobrarPorProjeto,
  recorrentes,
  resumoDoMes,
  tarefasPorFazer,
} from "@/lib/estudio/dados";
import { requerSessao } from "@/lib/estudio/sessao";
import {
  emAtraso,
  formatarData,
  formatarEuros,
  hojeEmLisboa,
  proximaOcorrencia,
} from "@/lib/estudio/tipos";
import { cn } from "@/lib/utils";

/**
 * O resumo — e é do **mês em que estamos**, não do ano.
 *
 * A primeira versão desta página tinha quatro números genéricos e um gráfico de
 * doze meses. Estava desenhada para um ano de histórico e mostrada a quem tem
 * três semanas de dados: três dos quatro números a zero, e duas barras em doze
 * lugares. O erro não era o desenho, era a escala.
 *
 * Agora responde, por ordem: *quanto sobrou este mês*, *a quem tenho de
 * cobrar*, *para onde foi o dinheiro*, e *o que ainda falta acontecer antes de
 * o mês fechar*.
 */

export default async function Resumo() {
  await requerSessao();

  const [mes, porCobrar, gastos, repetem, tarefas, projetos, objetivos] =
    await Promise.all([
      resumoDoMes(),
      porCobrarPorProjeto(),
      gastosDoMes(),
      recorrentes(),
      tarefasPorFazer(6),
      listarProjetos(),
      listarObjetivos(),
    ]);

  const hoje = hojeEmLisboa();

  /* O que ainda vem antes de o mês acabar, dos dois lados na mesma lista: o que
     há para pagar e o que há para receber. Quem sabe converter uma
     periodicidade numa data é o `proximaOcorrencia()`. */
  const aindaEsteMes = repetem
    .map((r) => ({
      ...r,
      quando: proximaOcorrencia(r.base, r.periodicidade, hoje),
    }))
    .filter((r): r is typeof r & { quando: string } => r.quando !== null)
    .sort((a, b) => a.quando.localeCompare(b.quando));

  const precisamDeTi = projetos
    .filter(
      (p) =>
        p.estado === "visita" || p.estado === "a-espera" || emAtraso(p, hoje),
    )
    .slice(0, 6);

  const maiorDivida = porCobrar[0]?.porCobrar ?? 0;

  if (projetos.length === 0) {
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
    <div className="mx-auto max-w-4xl">
      <p className={SOBRETITULO}>Estúdio</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        Este mês
      </h1>

      {/* Os três números da primeira linha. Chamam-se saldos e não lucros de
          propósito: não levam ordenados nem impostos, e a palavra errada faria
          um número confortável passar por outro. Ver docs/07. */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {/* `justify-center` nos dois cartões de saldo: a grelha estica-os todos
            à altura do mais alto, e com três objetivos na coluna da direita os
            números ficavam encostados ao topo com um palmo de vazio por baixo.
            Centrados, o espaço lê-se como respiro em vez de esquecimento. */}
        <div className={cn(CARTAO, "flex flex-col justify-center")}>
          <p className="text-xs text-muted">Saldo deste mês</p>
          <p
            className={cn(
              "mt-1.5 font-display text-3xl font-semibold tabular-nums tracking-tight",
              mes.saldo > 0 && "text-accent",
              mes.saldo < 0 && "text-danger",
            )}
          >
            {formatarEuros(mes.saldo)}
          </p>
          <p className="mt-1.5 text-xs text-muted">
            entrou {formatarEuros(mes.entrou)} · saiu {formatarEuros(mes.saiu)}
          </p>
        </div>

        {/* O do mês diz como está a correr agora; este diz se o estúdio ganha
            dinheiro. São perguntas diferentes, e por isso são dois números. */}
        <div className={cn(CARTAO, "flex flex-col justify-center")}>
          <p className="text-xs text-muted">Saldo desde sempre</p>
          <p
            className={cn(
              "mt-1.5 font-display text-3xl font-semibold tabular-nums tracking-tight",
              mes.saldoSempre > 0 && "text-accent",
              mes.saldoSempre < 0 && "text-danger",
            )}
          >
            {formatarEuros(mes.saldoSempre)}
          </p>
          <p className="mt-1.5 text-xs text-muted">
            entrou {formatarEuros(mes.entrouSempre)} · saiu{" "}
            {formatarEuros(mes.saiuSempre)}
          </p>
        </div>

        <div className={CARTAO}>
          <Objetivos objetivos={objetivos} />
        </div>
      </div>

      <details className={cn(CARTAO, "mt-4")}>
        <summary className="cursor-pointer text-sm text-muted transition-colors hover:text-ink">
          Pôr ou tirar objetivos
        </summary>
        <div className="mt-6">
          <FormularioObjetivo acao={criarObjetivo} objetivos={objetivos} />
        </div>
      </details>

      <section aria-labelledby="por-cobrar" className={cn(CARTAO, "mt-12")}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2
            id="por-cobrar"
            className="font-display text-lg font-semibold tracking-tight"
          >
            Por cobrar, e a quem
          </h2>
          {mes.porCobrar > 0 ? (
            <p className="text-lg font-semibold tabular-nums text-primary">
              {formatarEuros(mes.porCobrar)}
            </p>
          ) : null}
        </div>

        {porCobrar.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Não há nada por cobrar. Ou está tudo pago, ou ainda não puseste
            valores nos projetos.
          </p>
        ) : (
          <ul className="mt-5 space-y-4">
            {porCobrar.slice(0, 8).map((p) => (
              <li key={p.id}>
                <Link
                  href={`/estudio/projetos/${p.id}`}
                  className="block rounded-lg p-1.5 transition-colors hover:bg-surface-2"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-sm">
                      <span className="font-medium">
                        {p.clienteNome ?? "Sem cliente"}
                      </span>
                      <span className="text-muted"> · {p.nome}</span>
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

      <section aria-labelledby="para-onde" className={cn(CARTAO, "mt-12")}>
        <h2
          id="para-onde"
          className="font-display text-lg font-semibold tracking-tight"
        >
          Para onde foi o dinheiro
        </h2>
        <p className="mt-1 text-sm text-muted">As despesas deste mês.</p>
        <div className="mt-6">
          <GraficoCircular
            fatias={gastos.map((g) => ({
              rotulo: g.descricao,
              valor: g.valor,
            }))}
            vazio="Não houve despesas este mês. Regista-as em Gastos e aparecem aqui repartidas."
          />
        </div>
      </section>

      <section aria-labelledby="ainda" className={cn(CARTAO, "mt-12")}>
        <h2
          id="ainda"
          className="font-display text-lg font-semibold tracking-tight"
        >
          Ainda este mês
        </h2>
        <p className="mt-1 text-sm text-muted">
          O que se repete e ainda não aconteceu, de um lado e do outro.
        </p>

        {aindaEsteMes.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Nada agendado até ao fim do mês. As despesas que se repetem e os
            alojamentos dos clientes aparecem aqui com o dia.
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-border border-y border-border">
            {aindaEsteMes.map((r) => (
              <li key={r.chave} className="flex items-center gap-3 py-3">
                {/* Só dia e mês: a lista é toda deste mês, e o ano repetido em
                    cada linha é ruído. Corta-se da própria cadeia `YYYY-MM-DD`,
                    que é exata — o `formatarData` devolve `20/09/2026` e não
                    havia sufixo de ano para tirar com segurança. */}
                <span className="w-12 shrink-0 text-xs tabular-nums text-muted">
                  {`${r.quando.slice(8, 10)}/${r.quando.slice(5, 7)}`}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{r.descricao}</span>
                  {r.contexto ? (
                    <span className="block truncate text-xs text-muted">
                      {r.contexto}
                    </span>
                  ) : null}
                </span>
                <span
                  className={cn(
                    "shrink-0 text-sm font-medium tabular-nums",
                    r.lado === "entra" ? "text-accent" : "text-muted",
                  )}
                >
                  {r.lado === "entra" ? "+" : "−"}
                  {formatarEuros(r.valor)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

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
              Sem tarefas por fazer. Cada projeto tem uma checklist.
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
