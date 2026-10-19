/** docs: docs/07-estudio.md */
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import {
  Bloco,
  LigacaoQueCobre,
  Numero,
  TopoDoBloco,
  Vazio,
} from "@/components/estudio/Bloco";
import { BarraProgresso } from "@/components/estudio/BarraProgresso";
import { EtiquetaEstado } from "@/components/estudio/EtiquetaEstado";
import { FormularioObjetivo } from "@/components/estudio/FormularioObjetivo";
import { GraficoCircular } from "@/components/estudio/GraficoCircular";
import { Icone } from "@/components/estudio/Icone";
import { MarcarFeita } from "@/components/estudio/MarcarFeita";
import { Objetivos } from "@/components/estudio/Objetivos";
import { SeletorDePeriodo } from "@/components/estudio/SeletorDePeriodo";
import { SOBRETITULO } from "@/components/estudio/estilos";
import {
  criarObjetivo,
  marcarGastoPago,
  marcarRecebida,
} from "@/lib/estudio/acoes";
import {
  cobrancasPorReceber,
  entradasDoPeriodo,
  listarHistoricoDaPorta,
  listarObjetivos,
  listarProjetos,
  listarUtilizadores,
  porCobrarPorProjeto,
  recorrentes,
  resumoDoMes,
  saidasDoPeriodo,
  tarefasPendentesDe,
  tarefasPorFazer,
} from "@/lib/estudio/dados";
import { requerSessao } from "@/lib/estudio/sessao";
import {
  agruparPorEstado,
  emAtraso,
  formatarData,
  formatarDiaCurto,
  formatarEuros,
  formatarHora,
  hojeEmLisboa,
  hojePorExtenso,
  iniciais,
  lerPeriodo,
  nomeDoDia,
  PERIODO_ESCRITO,
  primeiroNome,
  proximaOcorrencia,
  ROTULO_DA_ENTRADA,
  ROTULO_RECEITA,
  vencimentosDoMes,
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
 *
 * ## É um quadro de cartões, como o do painel do Café Preguiça
 *
 * Desde 2026-10-14. Cada cartão diz o que é, para que serve e para onde leva (a
 * seta), porque o Estúdio passou a ser usado por quem não o construiu. O mês é
 * o cartão-destaque — o "cartão de crédito" do modelo —, e as sessões e quem
 * tem acesso vieram de lá também. A disposição está no `grid-template-areas`
 * da grelha: uma coluna no telemóvel, duas no tablet, três no computador.
 */

export default async function Resumo({
  searchParams,
}: {
  searchParams: Promise<{ entradas?: string; saidas?: string }>;
}) {
  /* **Primeiro o cookie, e só depois tudo o resto.** É este contrato que o
     teste de fumo do CI verifica ao exigir 307 em `/estudio` sem segredos
     nenhuns: se alguma consulta — ou o `await searchParams` — passar para a
     frente desta linha, a página deixa de redirecionar e passa a rebentar. */
  const utilizador = await requerSessao();

  /* Os períodos decidem que consultas se fazem, por isso abrem-se antes do
     `Promise.all`. Não custa ida nenhuma à base. O `lerPeriodo()` estreita o
     que vem do endereço aos três valores possíveis — ver `tipos.ts`, é o que
     impede um `?saidas=` qualquer de chegar ao SQL. */
  const { entradas: entradasParam, saidas: saidasParam } = await searchParams;
  const periodoEntradas = lerPeriodo(entradasParam);
  const periodoSaidas = lerPeriodo(saidasParam);

  /* Antes das consultas: é o `hoje` que decide que vencimentos já chegaram. */
  const hoje = hojeEmLisboa();

  const [
    mes,
    porCobrar,
    cobrancas,
    entradas,
    saidas,
    repetem,
    tarefas,
    tarefasMinhas,
    projetos,
    objetivos,
    pessoas,
    porta,
  ] = await Promise.all([
    resumoDoMes(),
    porCobrarPorProjeto(),
    cobrancasPorReceber(hoje),
    entradasDoPeriodo(periodoEntradas),
    saidasDoPeriodo(periodoSaidas),
    recorrentes(),
    tarefasPorFazer(6),
    tarefasPendentesDe(utilizador.id),
    listarProjetos(),
    listarObjetivos(),
    listarUtilizadores(),
    /* O único cartão que pode falhar sozinho: as sessões vivem numa tabela que
       nasceu a 2026-10-14, e uma base sem esse ajuste não pode deitar abaixo o
       resumo inteiro. `null` quer dizer "não deu", e o cartão di-lo. */
    listarHistoricoDaPorta(6).catch((erro: unknown) => {
      console.error("[estudio] não deu para ler o histórico da porta:", erro);
      return null;
    }),
  ]);
  const agora = agoraMesmo();

  /* O que falta marcar antes de o mês acabar, dos dois lados na mesma lista: o
     que há para pagar e o que há para receber. Os lados contam de maneira
     diferente, e de propósito:

     - uma **despesa** fica enquanto ninguém a der como paga, mesmo que o dia já
       tenha passado — o `vencimentosDoMes()` dá o mês todo;
     - uma **receita** aparece de duas maneiras: a próxima, enquanto não chegou
       o dia (`proximaOcorrencia()`), e as que já venceram e ninguém deu como
       recebidas (as `cobrancas`). Até 2026-10-15 as vencidas viviam no "por
       cobrar"; o Tomás pediu esse cartão só com os projetos, e tudo o que se
       repete passou a estar aqui, num sítio só. **No próprio dia do
       vencimento as duas dão a mesma data** — o `proximaOcorrencia()` conta
       de hoje para a frente e as cobranças até hoje —, e aparecia duas vezes.
       Fica a recorrente, que diz o projeto e o cliente; a cobrança desse dia
       sai.

     O que já foi marcado (os `pagos` de `recorrentes()`) sai. */
  const aindaEsteMes: {
    chave: string;
    quando: string;
    lado: "entra" | "sai";
    id: number;
    descricao: string;
    contexto: string | null;
    valor: number;
  }[] = [
    ...repetem.flatMap((r) => {
      const pagos = new Set(r.pagos);
      const datas =
        r.lado === "sai"
          ? vencimentosDoMes(r.base, r.periodicidade, hoje)
          : [proximaOcorrencia(r.base, r.periodicidade, hoje)].filter(
              (d): d is string => d !== null,
            );

      return datas
        .filter((quando) => !pagos.has(quando))
        .map((quando) => ({
          chave: `${r.chave}-${quando}`,
          quando,
          lado: r.lado,
          id: r.id,
          descricao: r.descricao,
          contexto: r.contexto,
          valor: r.valor,
        }));
    }),
    ...cobrancas
      .filter(
        (c) =>
          !repetem.some(
            (r) =>
              r.lado === "entra" &&
              r.id === c.receitaId &&
              proximaOcorrencia(r.base, r.periodicidade, hoje) === c.vencimento,
          ),
      )
      .map((c) => ({
      chave: `cobranca-${c.receitaId}-${c.vencimento}`,
      quando: c.vencimento,
      lado: "entra" as const,
      id: c.receitaId,
      descricao: ROTULO_RECEITA[c.tipo],
      contexto: c.clienteNome ?? c.projetoNome,
      valor: c.valor,
    })),
  ].sort((a, b) => a.quando.localeCompare(b.quando));

  /* Sem `.slice()`: cortar aos seis escondia metade do que está aberto, e a
     lista existe precisamente para se ver o todo. Quem a torna legível é o
     agrupamento por estado — e a ordem dos grupos não se decide aqui, vem do
     `ORDEM` de `dados.ts`, tal como a dos meses vem do `order by` nos gastos. */
  const emCimaDaMesa = projetos.filter(
    (p) => p.estado !== "entregue" && p.estado !== "parado",
  );


  /* Os estados que aparecem em "Em cima da mesa", pela ordem do `ORDEM`. */
  const grupos = agruparPorEstado(emCimaDaMesa);

  if (projetos.length === 0) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <p className={SOBRETITULO}>Estúdio</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
          Ainda não há nada para resumir.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Traz os projetos que já estão no GitHub ou cria um à mão. Assim que
          houver trabalho e valores, é aqui que se vê o que entra, o que sai e a
          quem é preciso ligar.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/estudio/importar">Trazer projetos do GitHub</Button>
          <Button href="/estudio/projetos/novo" variant="outline">
            Criar um projeto
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* As boas-vindas, como no painel do Café Preguiça: quem és, que dia é,
          e as duas coisas que mais se fazem ao chegar. */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={SOBRETITULO}>Resumo</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            <span className="text-muted">Boas,</span>{" "}
            {primeiroNome(utilizador.nome)}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm">
            <Icone nome="calendario" tamanho={16} className="text-muted" />
            {hojePorExtenso(agora)}
          </span>
          <Link
            href="/estudio/financas/gastos?novo=1#registar"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm transition-colors hover:border-ink/30"
          >
            <Icone nome="sai" tamanho={16} className="text-muted" />
            Registar gasto
          </Link>
          <Link
            href="/estudio/projetos/novo"
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-ink transition-colors hover:bg-primary-strong"
          >
            <Icone nome="mais" tamanho={16} />
            Projeto novo
          </Link>
        </div>
      </header>

      {/* A grelha. Uma coluna no telemóvel, com o dinheiro e o que é teu
          primeiro; duas no tablet; três no computador, com o "Em cima da mesa"
          ao meio a ocupar duas linhas, porque é a lista mais comprida. */}
      <div
        className={cn(
          "mt-8 grid gap-4",
          "grid-cols-1 [grid-template-areas:'mes'_'cobrar'_'tarefas'_'ainda'_'mesa'_'objetivos'_'deonde'_'paraonde'_'sessoes'_'acesso']",
          "md:grid-cols-2 md:[grid-template-areas:'mes_cobrar'_'tarefas_ainda'_'mesa_mesa'_'objetivos_objetivos'_'deonde_paraonde'_'sessoes_sessoes'_'acesso_acesso']",
          "xl:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)_minmax(0,1fr)] xl:[grid-template-areas:'mes_mesa_cobrar'_'tarefas_mesa_ainda'_'objetivos_objetivos_objetivos'_'deonde_paraonde_paraonde'_'sessoes_sessoes_acesso']",
        )}
      >
        {/* ------------------------------------------------ ESTE MÊS
            O cartão de crédito do modelo, com o mês lá dentro. Chamam-se saldos
            e não lucros de propósito: não levam ordenados nem impostos, e a
            palavra errada faria um número confortável passar por outro. */}
        <section
          aria-labelledby="este-mes"
          className="relative isolate flex min-h-52 flex-col overflow-hidden rounded-lg border border-border p-5 [grid-area:mes] sm:p-6"
          style={{
            /* O gradiente da marca, escurecido sobre o `bg` — é superfície, não
               texto (docs/02). O texto por cima é `ink`: o fundo mais claro
               fica por volta de L 0.37, e `ink` (L 0.97) sobre isso passa
               largamente os 4.5:1. */
            background:
              "linear-gradient(140deg, color-mix(in oklab, var(--primary) 38%, var(--bg)) 0%, color-mix(in oklab, var(--accent) 20%, var(--bg)) 100%)",
          }}
        >
          <Logo
            outline
            className="pointer-events-none absolute -right-8 -bottom-10 -z-10 size-44 text-ink/15"
          />
          <div className="flex items-center justify-between gap-3 text-xs text-ink/80">
            <span className="font-medium tracking-wide">DevPlus · Estúdio</span>
            <span className="capitalize">{nomeDoMes(hoje)}</span>
          </div>
          <h2 id="este-mes" className="mt-auto pt-6 text-sm text-ink/85">
            <LigacaoQueCobre href="/estudio/financas/receitas">
              Sobrou este mês
            </LigacaoQueCobre>
          </h2>
          <p className="mt-1 font-display text-4xl font-semibold tabular-nums tracking-tight">
            {formatarEuros(mes.saldo)}
          </p>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/85">
            <span>Entrou {formatarEuros(mes.entrou)}</span>
            <span>Saiu {formatarEuros(mes.saiu)}</span>
            {/* O do mês diz como está a correr agora; este diz se o estúdio
                ganha dinheiro. Perguntas diferentes, por isso dois números. */}
            <span>Desde sempre {formatarEuros(mes.saldoSempre)}</span>
          </p>
        </section>

        {/* ------------------------------------------------ POR COBRAR */}
        <Bloco aria-labelledby="por-cobrar" className="[grid-area:cobrar]">
          <TopoDoBloco
            id="por-cobrar"
            icone="financas"
            titulo="Por cobrar"
            sub="Quem nos deve, e quanto"
            href="/estudio/financas/receitas"
            rotuloDaSeta="Abrir as receitas"
          />
          {mes.porCobrar > 0 ? (
            <Numero
              rotulo="Falta receber dos projetos"
              valor={formatarEuros(mes.porCobrar)}
              tom="atencao"
              grande
            />
          ) : null}

          {/* Só os projetos. Os alojamentos e domínios vencidos estão no
              "Ainda este mês", com o resto do que se repete.

              A barra é **a parte já paga do total** — 680 € de 1700 € enchem
              40% da barra, e o que falta é o vazio. Até 2026-10-15 era a dívida
              comparada com a maior, e um projeto quase pago com a maior dívida
              aparecia com a barra cheia, que lia ao contrário. */}
          {porCobrar.length === 0 ? (
            <Vazio>
              Não há projetos por cobrar. Ou está tudo pago, ou ainda não
              puseste valores nos projetos — faz-se na aba Dinheiro de cada
              projeto.
            </Vazio>
          ) : (
            <ul className="space-y-3">
              {porCobrar.slice(0, 5).map((p) => {
                const pago =
                  p.valor > 0
                    ? Math.min(100, Math.max(0, (p.recebido / p.valor) * 100))
                    : 0;
                return (
                  <li key={p.id}>
                    <Link
                      href={`/estudio/projetos/${p.id}?aba=dinheiro`}
                      className="block rounded-lg p-1.5 transition-colors hover:bg-surface-2"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="min-w-0 truncate text-sm">
                          <span className="font-medium">
                            {p.clienteNome ?? "Sem cliente"}
                          </span>
                          {p.clienteNome !== p.nome ? (
                            <span className="text-muted"> · {p.nome}</span>
                          ) : null}
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-muted">
                          {Math.round(pago)}% pago
                        </span>
                      </div>
                      <div
                        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
                        aria-hidden
                      >
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${pago}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {formatarEuros(p.recebido)} pagos de{" "}
                        {formatarEuros(p.valor)} ·{" "}
                        <span className="font-medium text-primary">
                          faltam {formatarEuros(p.porCobrar)}
                        </span>
                      </p>
                    </Link>
                  </li>
                );
              })}
              {porCobrar.length > 5 ? (
                <li className="text-xs text-muted">
                  e mais {porCobrar.length - 5} —{" "}
                  <Link
                    href="/estudio/financas/receitas"
                    className="underline-offset-4 hover:text-ink hover:underline"
                  >
                    ver todos
                  </Link>
                </li>
              ) : null}
            </ul>
          )}
        </Bloco>

        {/* ------------------------------------------------ AS TUAS TAREFAS
            O único cartão que muda consoante quem entra: "o que é que eu tenho
            para fazer" não se responde com um número de toda a gente. */}
        <Bloco aria-labelledby="tarefas" className="[grid-area:tarefas]">
          <TopoDoBloco
            id="tarefas"
            icone="tarefas"
            titulo="Tarefas"
            sub="O que está por fazer nos projetos"
          />
          <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
            <Numero
              rotulo="Atribuídas a ti"
              valor={tarefasMinhas.minhas}
              nota={tarefasMinhas.minhas === 0 ? "Nada atribuído a ti." : "por fazer"}
            />
            {/* As que não têm dono aparecem à parte e não somadas: são trabalho
                por atribuir, não trabalho teu. */}
            {tarefasMinhas.semDono > 0 ? (
              <Numero
                rotulo="Sem ninguém"
                valor={tarefasMinhas.semDono}
                nota="por atribuir"
              />
            ) : null}
          </div>

          {tarefas.length === 0 ? (
            <Vazio>
              Sem tarefas por fazer. Cada projeto tem a sua lista, na aba
              Tarefas.
            </Vazio>
          ) : (
            <ul className="space-y-1">
              {tarefas.map((t) => (
                <li key={t.id} className="flex items-start gap-1">
                  {/* A caixa marca como feita aqui mesmo; o resto leva à
                      lista do projeto, que é onde se edita. */}
                  <MarcarFeita id={t.id} projetoId={t.projetoId} texto={t.texto} />
                  <Link
                    href={`/estudio/projetos/${t.projetoId}?aba=tarefas`}
                    className="flex min-w-0 flex-1 items-start gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-surface-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{t.texto}</span>
                      <span className="block truncate text-xs text-muted">
                        {t.projetoNome}
                      </span>
                    </span>
                    {t.utilizadorNome ? (
                      <span
                        title={t.utilizadorNome}
                        className="mt-0.5 grid h-6 min-w-6 shrink-0 place-items-center rounded-full border border-border-strong bg-surface-2 px-1.5 text-[0.625rem] font-medium text-ink"
                      >
                        <span aria-hidden>{iniciais(t.utilizadorNome)}</span>
                        <span className="sr-only">{t.utilizadorNome}</span>
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Bloco>

        {/* ------------------------------------------------ AINDA ESTE MÊS */}
        <Bloco aria-labelledby="ainda" className="[grid-area:ainda]">
          <TopoDoBloco
            id="ainda"
            icone="calendario"
            titulo="Ainda este mês"
            sub="O que se repete e o que já venceu, enquanto ninguém o marcar como pago ou recebido"
          />

          {aindaEsteMes.length === 0 ? (
            <Vazio>
              Nada por marcar até ao fim do mês. As despesas que se repetem e os
              alojamentos dos clientes aparecem aqui com o dia.
            </Vazio>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {aindaEsteMes.map((r) => (
                <li
                  key={r.chave}
                  className="flex items-start gap-3 py-3"
                >
                  {/* Só dia e mês: é quase tudo deste mês, e uma cobrança
                      vencida de outro mês lê-se pelo mês. A vermelho quando o
                      dia já passou: numa despesa, o dinheiro saiu e ainda não
                      foi contado; numa receita, alguém ainda não pagou. */}
                  <span
                    className={cn(
                      "w-11 shrink-0 pt-0.5 text-xs tabular-nums",
                      r.quando < hoje ? "text-danger" : "text-muted",
                    )}
                  >
                    {`${r.quando.slice(8, 10)}/${r.quando.slice(5, 7)}`}
                  </span>
                  {/* A descrição parte em duas linhas em vez de se cortar: na
                      coluna estreita do computador "Alojamento e apoio" ficava
                      "Alojamen…", e era a única coisa que dizia o que é. */}
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm leading-snug">{r.descricao}</span>
                    {r.contexto ? (
                      <span className="block truncate text-xs text-muted">
                        {r.contexto}
                      </span>
                    ) : null}
                  </span>
                  {/* O valor e o botão um por cima do outro, à direita: lado a
                      lado comiam metade da coluna e o texto ficava sem espaço. */}
                  <span className="flex shrink-0 flex-col items-end gap-1.5">
                  <span
                    className={cn(
                      "text-sm font-medium tabular-nums",
                      r.lado === "entra" ? "text-accent" : "text-muted",
                    )}
                  >
                    {r.lado === "entra" ? "+" : "−"}
                    {formatarEuros(r.valor)}
                  </span>
                  {/* Do lado que entra, o `marcarRecebida` salda o vencimento —
                      o próximo ou um que já passou; do que sai, o
                      `marcarGastoPago` cria o gasto do mês. Uma receita a zero
                      não tem botão: não há nada para receber. */}
                  {r.valor > 0 ? (
                    <form
                      action={
                        r.lado === "entra" ? marcarRecebida : marcarGastoPago
                      }
                    >
                      <input
                        type="hidden"
                        name={r.lado === "entra" ? "receitaId" : "gastoId"}
                        value={r.id}
                      />
                      <input type="hidden" name="vencimento" value={r.quando} />
                      <button
                        type="submit"
                        aria-label={`${r.lado === "entra" ? "Marcar como recebido" : "Marcar como pago"}: ${r.descricao}, ${formatarData(r.quando)}`}
                        className="min-h-8 rounded-full border border-border-strong px-3 text-xs transition-colors hover:border-accent hover:text-accent"
                      >
                        {r.lado === "entra" ? "Recebido" : "Pago"}
                      </button>
                    </form>
                  ) : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Bloco>

        {/* ------------------------------------------------ EM CIMA DA MESA
            Tudo o que está vivo, agrupado por estado. Os entregues ficam de
            fora porque acabaram; os parados porque não estão em mãos. Cada
            estado leva à lista de projetos já filtrada. */}
        <Bloco aria-labelledby="em-cima-da-mesa" className="[grid-area:mesa]">
          <TopoDoBloco
            id="em-cima-da-mesa"
            icone="camadas"
            titulo="Em cima da mesa"
            sub={`${emCimaDaMesa.length} ${emCimaDaMesa.length === 1 ? "projeto aberto" : "projetos abertos"} — tudo o que não está entregue nem parado`}
            href="/estudio/projetos"
            rotuloDaSeta="Abrir os projetos"
          />

          {emCimaDaMesa.length === 0 ? (
            <Vazio
              accao={
                <Button href="/estudio/projetos/novo" variant="outline">
                  Criar um projeto
                </Button>
              }
            >
              Não há nada aberto. Ou está tudo entregue, ou falta pôr aqui o que
              anda a acontecer.
            </Vazio>
          ) : (
            <div className="space-y-5">
              {grupos.map(({ estado, itens }) => (
                <div key={estado}>
                  <Link
                    href={`/estudio/projetos?estado=${estado}`}
                    className="group flex items-center justify-between gap-3 rounded-lg px-1.5 py-1 transition-colors hover:bg-surface-2"
                  >
                    <span className="flex items-center gap-2">
                      <EtiquetaEstado estado={estado} />
                      <span className="text-sm tabular-nums text-muted">
                        {itens.length}
                      </span>
                    </span>
                    <span className="text-xs text-muted transition-colors group-hover:text-ink">
                      Ver só estes →
                    </span>
                  </Link>
                  {/* Um cartãozinho por projeto, que se abre todo. Nos que
                      estão em curso, a data de entrega vem primeiro — é a
                      pergunta que se faz a um trabalho que está a andar. */}
                  <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                    {itens.map((p) => {
                      const atrasado = emAtraso(p, hoje);
                      return (
                        <li key={p.id}>
                          <Link
                            href={`/estudio/projetos/${p.id}`}
                            className="flex h-full flex-col gap-2 rounded-lg border border-border p-3 transition-colors hover:border-border-strong hover:bg-surface-2/40"
                          >
                            {estado === "em-curso" ? (
                              <span
                                className={cn(
                                  "flex items-center gap-1.5 text-xs",
                                  atrasado && p.prazo
                                    ? "font-medium text-danger"
                                    : p.prazo
                                      ? "font-medium text-primary"
                                      : "text-muted",
                                )}
                              >
                                <Icone nome="calendario" tamanho={14} />
                                {atrasado && p.prazo
                                  ? `Atrasado desde ${formatarData(p.prazo)}`
                                  : p.prazo
                                    ? `Entrega a ${formatarData(p.prazo)}`
                                    : "Sem data de entrega"}
                              </span>
                            ) : null}
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">
                                {p.nome}
                              </span>
                              <span className="block truncate text-xs text-muted">
                                {p.clienteNome ?? "Sem cliente"}
                              </span>
                            </span>
                            {/* Um `div` e não um `span`: a barra é um `div`, e
                                um `div` dentro de um `span` não é HTML válido. */}
                            <div className="mt-auto flex items-center gap-2">
                              <BarraProgresso progresso={p.progresso} estado={p.estado} />
                              <span className="shrink-0 text-xs tabular-nums text-muted">
                                {p.progresso}%
                              </span>
                            </div>
                            {estado !== "em-curso" && atrasado && p.prazo ? (
                              <span className="text-xs text-danger">
                                Atrasado desde {formatarData(p.prazo)}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Bloco>

        {/* ------------------------------------------------ OBJETIVOS
            A linha toda: num terço de linha os títulos vinham cortados — ver o
            comentário no `Objetivos.tsx`. */}
        <Bloco aria-labelledby="objetivos" className="[grid-area:objetivos]">
          <TopoDoBloco
            id="objetivos"
            icone="objetivos"
            titulo="Objetivos"
            sub="Onde queremos chegar, e quanto falta"
          />
          <Objetivos objetivos={objetivos} />
          <details className="group">
            <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-1.5 rounded-full border border-border px-3.5 text-sm text-muted transition-colors hover:border-ink/30 hover:text-ink [&::-webkit-details-marker]:hidden">
              <Icone nome="mais" tamanho={14} />
              Pôr ou tirar objetivos
            </summary>
            <div className="mt-5">
              <FormularioObjetivo acao={criarObjetivo} objetivos={objetivos} />
            </div>
          </details>
        </Bloco>

        {/* ------------------------------------------------ OS DOIS CIRCULARES
            Cada um com o seu período: "de onde veio este ano" e "para onde foi
            este mês" fazem-se ao mesmo tempo. O período vai escrito no centro
            da roda, para ninguém comparar coisas diferentes sem dar por isso. */}
        <Bloco aria-labelledby="de-onde" className="[grid-area:deonde]">
          <TopoDoBloco
            id="de-onde"
            icone="entra"
            titulo="De onde veio o dinheiro"
            sub="O que entrou, por projeto — o trabalho e os alojamentos e domínios"
            href="/estudio/financas/receitas"
            rotuloDaSeta="Abrir as receitas"
          />
          <SeletorDePeriodo
            parametro="entradas"
            atual={periodoEntradas}
            outros={{ saidas: periodoSaidas }}
            ancora="de-onde"
            descreve="Período do dinheiro que entrou"
          />
          <GraficoCircular
            fatias={entradas}
            nota={PERIODO_ESCRITO[periodoEntradas]}
            descreve="Entradas"
            vazio={`Não entrou dinheiro ${PERIODO_ESCRITO[periodoEntradas]}.`}
          />
        </Bloco>

        <Bloco aria-labelledby="para-onde" className="[grid-area:paraonde]">
          <TopoDoBloco
            id="para-onde"
            icone="sai"
            titulo="Para onde foi o dinheiro"
            sub="O que saiu, por descrição do gasto"
            href="/estudio/financas/gastos"
            rotuloDaSeta="Abrir os gastos"
          />
          <SeletorDePeriodo
            parametro="saidas"
            atual={periodoSaidas}
            outros={{ entradas: periodoEntradas }}
            ancora="para-onde"
            descreve="Período das despesas"
          />
          <GraficoCircular
            fatias={saidas}
            nota={PERIODO_ESCRITO[periodoSaidas]}
            descreve="Despesas"
            vazio={`Não houve despesas ${PERIODO_ESCRITO[periodoSaidas]}. Regista-as em Finanças → Gastos e aparecem aqui repartidas.`}
          />
        </Bloco>

        {/* ------------------------------------------------ SESSÕES RECENTES
            O "histórico de pagamentos" do modelo, como no Preguiça. */}
        <Bloco aria-labelledby="sessoes-recentes" className="[grid-area:sessoes]">
          <TopoDoBloco
            id="sessoes-recentes"
            icone="sessoes"
            titulo="Sessões recentes"
            sub="Quem entrou e saiu do Estúdio"
            href="/estudio/sessoes"
            rotuloDaSeta="Abrir as sessões"
          />
          {porta === null ? (
            <Vazio>
              Não deu para ler as sessões. Se acabou de chegar a aba Sessões, falta
              correr o ajuste da base de dados — ver docs/07.
            </Vazio>
          ) : porta.length === 0 ? (
            <Vazio>Ainda não há entradas anotadas.</Vazio>
          ) : (
            <div className="-mx-1 overflow-x-auto px-1">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-border">
                    <th scope="col" className="py-2 pr-3 font-normal">Quem</th>
                    <th scope="col" className="py-2 pr-3 font-normal">Dia</th>
                    <th scope="col" className="py-2 pr-3 font-normal">Hora</th>
                    <th scope="col" className="py-2 pr-3 font-normal">O quê</th>
                    <th scope="col" className="py-2 font-normal">Aparelho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {porta.map((e) => (
                    <tr key={e.id}>
                      <td className="py-2.5 pr-3">
                        <span className="flex items-center gap-2">
                          <span
                            aria-hidden
                            className="grid size-7 flex-none place-items-center rounded-full border border-border-strong bg-surface-2 text-[0.625rem] font-medium"
                          >
                            {iniciais(e.nome ?? e.githubLogin)}
                          </span>
                          <span className="truncate">
                            {e.nome ?? `@${e.githubLogin}`}
                          </span>
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-muted">
                        {nomeDoDia(e.quando, agora) === "Hoje" ||
                        nomeDoDia(e.quando, agora) === "Ontem"
                          ? nomeDoDia(e.quando, agora)
                          : formatarDiaCurto(e.quando)}
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums">{formatarHora(e.quando)}</td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-2.5 py-0.5 text-xs",
                            e.como === "entrou" && "border-accent/40 text-accent",
                            e.como === "saiu" && "border-border-strong text-muted",
                            e.como === "terminada" && "border-primary/50 text-primary",
                            e.como === "recusada" && "border-danger/40 text-danger",
                          )}
                        >
                          {ROTULO_DA_ENTRADA[e.como]}
                        </span>
                      </td>
                      <td className="py-2.5 text-muted">{e.aparelho ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Bloco>

        {/* ------------------------------------------------ QUEM TEM ACESSO */}
        <Bloco aria-labelledby="acesso" className="[grid-area:acesso]">
          <TopoDoBloco
            id="acesso"
            icone="clientes"
            titulo="Quem tem acesso"
            sub="Quem já entrou no Estúdio"
            href="/estudio/sessoes"
            rotuloDaSeta="Abrir as sessões"
          />
          <ul className="flex flex-wrap -space-x-2">
            {pessoas.map((p) => (
              <li
                key={p.id}
                title={p.nome}
                className="grid size-11 place-items-center rounded-full border-2 border-surface bg-surface-2 text-sm font-medium ring-1 ring-border-strong"
              >
                <span aria-hidden>{iniciais(p.nome)}</span>
                <span className="sr-only">{p.nome}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted">
            {pessoas.map((p) => primeiroNome(p.nome)).join(", ")}
          </p>
        </Bloco>
      </div>
    </div>
  );
}

/* O "agora" das Sessões, fora do componente: um componente não lê o relógio. */
function agoraMesmo(): number {
  return Date.now();
}

/** "outubro", do `YYYY-MM-DD` de hoje. */
function nomeDoMes(dia: string): string {
  const [ano, mes] = dia.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-PT", { month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(ano, mes - 1, 1)),
  );
}
