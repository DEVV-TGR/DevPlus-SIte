/** docs: docs/07-estudio.md */
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EtiquetaEstado } from "@/components/estudio/EtiquetaEstado";
import { FormularioObjetivo } from "@/components/estudio/FormularioObjetivo";
import { GraficoCircular } from "@/components/estudio/GraficoCircular";
import { Objetivos } from "@/components/estudio/Objetivos";
import { SeletorDePeriodo } from "@/components/estudio/SeletorDePeriodo";
import { CARTAO, SOBRETITULO } from "@/components/estudio/estilos";
import { criarObjetivo, marcarRecebida } from "@/lib/estudio/acoes";
import {
  cobrancasPorReceber,
  entradasDoPeriodo,
  listarObjetivos,
  listarProjetos,
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
  formatarEuros,
  hojeEmLisboa,
  iniciais,
  lerPeriodo,
  PERIODO_ESCRITO,
  proximaOcorrencia,
  ROTULO_ESTADO,
  ROTULO_RECEITA,
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
  ]);

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

  /* Sem `.slice()`: cortar aos seis escondia metade do que está aberto, e a
     lista existe precisamente para se ver o todo. Quem a torna legível é o
     agrupamento por estado — e a ordem dos grupos não se decide aqui, vem do
     `ORDEM` de `dados.ts`, tal como a dos meses vem do `order by` nos gastos. */
  const emCimaDaMesa = projetos.filter(
    (p) => p.estado !== "entregue" && p.estado !== "parado",
  );

  const maiorDivida = porCobrar[0]?.porCobrar ?? 0;

  /* A única soma de euros do Estúdio feita fora do Postgres, e não há como:
     as cobranças nascem de datas geradas em JavaScript, não de linhas de uma
     tabela. Arredonda-se aos cêntimos aqui, uma vez, para não haver um
     `160.00000000000003` a chegar ao ecrã. */
  const totalCobrancas =
    Math.round(cobrancas.reduce((soma, c) => soma + c.valor, 0) * 100) / 100;
  const totalPorCobrar =
    Math.round((mes.porCobrar + totalCobrancas) * 100) / 100;

  /* Uma cobrança de um mês que já fechou está atrasada, e diz-se. */
  const mesAtual = hoje.slice(0, 7);

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

        {/* O terceiro número é teu, e é o único do Estúdio que muda consoante
            quem entra. Somos três e o trabalho é partilhado — mas "o que é que
            eu tenho para fazer" não se responde com um número de toda a gente.
            Só o número: a lista está no fundo da página, e duas listas iguais
            no mesmo ecrã não são informação, são ruído. */}
        <div className={cn(CARTAO, "flex flex-col justify-center")}>
          <p className="text-xs text-muted">As tuas tarefas</p>
          {/* Sem cor: duas tarefas por fazer não são boas nem más, e pintar o
              zero de verde era inventar um juízo que não é nosso. */}
          <p className="mt-1.5 font-display text-3xl font-semibold tabular-nums tracking-tight">
            {tarefasMinhas.minhas}
          </p>
          <p className="mt-1.5 text-xs text-muted">
            {tarefasMinhas.minhas === 0
              ? "Nada atribuído a ti."
              : "por fazer, atribuídas a ti"}
            {/* As que não têm dono aparecem à parte e não somadas: são trabalho
                por atribuir, não trabalho teu. Hoje são a maioria — escondê-las
                fazia delas tarefas que ninguém vê. */}
            {tarefasMinhas.semDono > 0 ? (
              <>
                {" · "}
                <Link
                  href="#tarefas-pendentes"
                  className="underline-offset-4 hover:text-ink hover:underline"
                >
                  {tarefasMinhas.semDono} sem dono
                </Link>
              </>
            ) : null}
          </p>
        </div>
      </div>

      {/* Os objetivos passaram a ter a linha toda, e o cabeçalho passou a ser um
          `h2` como o das outras secções. Num terço de linha os títulos vinham
          cortados pelo `truncate` e o cartão dizia menos do que estava escrito
          nele — ver o comentário no `Objetivos.tsx`. */}
      <section aria-labelledby="objetivos" className={cn(CARTAO, "mt-8")}>
        <h2
          id="objetivos"
          className="font-display text-lg font-semibold tracking-tight"
        >
          Objetivos
        </h2>
        <div className="mt-5">
          <Objetivos objetivos={objetivos} />
        </div>
      </section>

      <details className={cn(CARTAO, "mt-4")}>
        <summary className="cursor-pointer text-sm text-muted transition-colors hover:text-ink">
          Pôr ou tirar objetivos
        </summary>
        <div className="mt-6">
          <FormularioObjetivo acao={criarObjetivo} objetivos={objetivos} />
        </div>
      </details>

      {/* "Por cobrar" e "Ainda este mês" lado a lado: são as duas
          perguntas do fim do mês — quem me deve, e o que ainda falta
          acontecer — e em `max-w-4xl` sobrava largura para as duas. */}
      <div className="mt-12 grid items-start gap-8 lg:grid-cols-2">
        <section aria-labelledby="por-cobrar" className={CARTAO}>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2
              id="por-cobrar"
              className="font-display text-lg font-semibold tracking-tight"
            >
              Por cobrar, e a quem
            </h2>
            {totalPorCobrar > 0 ? (
              <p className="text-lg font-semibold tabular-nums text-primary">
                {formatarEuros(totalPorCobrar)}
              </p>
            ) : null}
          </div>

          {/* Primeiro os alojamentos e domínios que se venceram, e não os
              projetos: um site por pagar está lá há semanas e não muda hoje; uma
              mensalidade que venceu ontem é a única coisa nesta página que se
              resolve com uma mensagem. Cada uma tem o botão de lhe dar baixa
              aqui — obrigar a abrir a ficha do projeto para carregar num sítio
              era garantir que ficavam por marcar. */}
          {cobrancas.length > 0 ? (
            <ul className="mt-5 divide-y divide-border border-y border-border">
              {cobrancas.map((c) => (
                <li
                  key={`${c.receitaId}-${c.vencimento}`}
                  className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3"
                >
                  <Link
                    href={`/estudio/projetos/${c.projetoId}`}
                    className="min-w-0 flex-1 rounded-lg p-1.5 transition-colors hover:bg-surface-2"
                  >
                    <span className="block truncate text-sm font-medium">
                      {ROTULO_RECEITA[c.tipo]}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {c.clienteNome ?? c.projetoNome}
                      {" · venceu a "}
                      <span
                        className={cn(
                          c.vencimento.slice(0, 7) < mesAtual && "text-danger",
                        )}
                      >
                        {formatarData(c.vencimento)}
                      </span>
                    </span>
                  </Link>
                  <span className="shrink-0 text-sm font-medium tabular-nums text-primary">
                    {formatarEuros(c.valor)}
                  </span>
                  <form action={marcarRecebida}>
                    <input type="hidden" name="receitaId" value={c.receitaId} />
                    <input type="hidden" name="vencimento" value={c.vencimento} />
                    <button
                      type="submit"
                      className="rounded-full border border-border-strong px-3 py-1 text-xs transition-colors hover:border-accent hover:text-accent"
                    >
                      Recebido
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : null}

          {porCobrar.length === 0 ? (
            cobrancas.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                Não há nada por cobrar. Ou está tudo pago, ou ainda não puseste
                valores nos projetos.
              </p>
            ) : null
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

        <section aria-labelledby="ainda" className={CARTAO}>
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
      </div>

      {/* Os dois lados do dinheiro, lado a lado — e **cada um com o seu
          período**. As perguntas "de onde veio este ano" e "para onde foi este
          mês" fazem-se ao mesmo tempo, e um filtro partilhado obrigava a
          escolher uma delas. O período de cada um vai escrito no centro da
          roda, que é o que impede alguém de comparar coisas diferentes sem dar
          por isso. */}
      <div className="mt-12 grid items-start gap-8 lg:grid-cols-2">
        <section aria-labelledby="de-onde" className={CARTAO}>
          <h2
            id="de-onde"
            className="font-display text-lg font-semibold tracking-tight"
          >
            De onde veio o dinheiro
          </h2>
          <p className="mt-1 text-sm text-muted">
            O que entrou, por projeto. Conta o que os clientes pagaram pelo
            trabalho e o que pagaram de alojamento e domínio.
          </p>
          <div className="mt-4">
            <SeletorDePeriodo
              parametro="entradas"
              atual={periodoEntradas}
              outros={{ saidas: periodoSaidas }}
              ancora="de-onde"
              descreve="Período do dinheiro que entrou"
            />
          </div>
          <div className="mt-6">
            <GraficoCircular
              fatias={entradas}
              nota={PERIODO_ESCRITO[periodoEntradas]}
              descreve="Entradas"
              vazio={`Não entrou dinheiro ${PERIODO_ESCRITO[periodoEntradas]}.`}
            />
          </div>
        </section>

        <section aria-labelledby="para-onde" className={CARTAO}>
          <h2
            id="para-onde"
            className="font-display text-lg font-semibold tracking-tight"
          >
            Para onde foi o dinheiro
          </h2>
          <p className="mt-1 text-sm text-muted">
            O que saiu, por descrição do gasto.
          </p>
          <div className="mt-4">
            <SeletorDePeriodo
              parametro="saidas"
              atual={periodoSaidas}
              outros={{ entradas: periodoEntradas }}
              ancora="para-onde"
              descreve="Período das despesas"
            />
          </div>
          <div className="mt-6">
            <GraficoCircular
              fatias={saidas}
              nota={PERIODO_ESCRITO[periodoSaidas]}
              descreve="Despesas"
              vazio={`Não houve despesas ${PERIODO_ESCRITO[periodoSaidas]}. Regista-as em Gastos e aparecem aqui repartidas.`}
            />
          </div>
        </section>
      </div>

      <div className="mt-12 grid items-start gap-8 lg:grid-cols-2">
        {/* Deixou de se chamar "Precisa de ti" no momento em que passou a
            incluir propostas — que, por definição, ainda não pedem nada. Agora
            mostra tudo o que está vivo, e é o agrupamento por estado que diz o
            que urge. Os entregues ficam de fora porque acabaram; os parados
            porque não estão em mãos, e pô-los ao lado do que anda fazia a lista
            deixar de responder a "o que é que temos entre mãos". */}
        <section aria-labelledby="em-cima-da-mesa" className={CARTAO}>
          <h2
            id="em-cima-da-mesa"
            className="font-display text-lg font-semibold tracking-tight"
          >
            Em cima da mesa
          </h2>
          <p className="mt-1 text-sm text-muted">
            Tudo o que não está entregue nem parado.
          </p>

          {emCimaDaMesa.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Não há nada aberto. Ou está tudo entregue, ou falta pôr aqui o que
              anda a acontecer.
            </p>
          ) : (
            <div className="mt-5 space-y-6">
              {agruparPorEstado(emCimaDaMesa).map(({ estado, itens }) => (
                <div key={estado}>
                  <h3 className="text-xs uppercase tracking-[0.18em] text-muted">
                    {ROTULO_ESTADO[estado]} · {itens.length}
                  </h3>
                  <ul className="mt-3 space-y-3">
                    {itens.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/estudio/projetos/${p.id}`}
                          className="flex items-center justify-between gap-3 rounded-lg p-1.5 transition-colors hover:bg-surface-2"
                        >
                          <span className="min-w-0 truncate text-sm">
                            {p.nome}
                          </span>
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
                </div>
              ))}
            </div>
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
                  {/* Aqui as tarefas são de leitura. Editar é na ficha do
                      projeto — esta é a vista do que está por fazer em todo o
                      lado, e um campo por linha fazia dela um formulário. */}
                  <Link
                    href={`/estudio/projetos/${t.projetoId}`}
                    className="flex items-start gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-surface-2"
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
        </section>
      </div>
    </div>
  );
}
