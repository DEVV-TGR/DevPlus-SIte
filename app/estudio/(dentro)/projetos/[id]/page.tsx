/** docs: docs/07-estudio.md */
import Link from "next/link";
import { notFound } from "next/navigation";
import { Abas } from "@/components/estudio/Abas";
import { BarraProgresso } from "@/components/estudio/BarraProgresso";
import {
  Bloco,
  Numero,
  TopoDoBloco,
  Vazio,
} from "@/components/estudio/Bloco";
import { EtiquetaEstado } from "@/components/estudio/EtiquetaEstado";
import { FormularioProjeto } from "@/components/estudio/FormularioProjeto";
import { Icone } from "@/components/estudio/Icone";
import { Pagamentos } from "@/components/estudio/Pagamentos";
import { Receitas } from "@/components/estudio/Receitas";
import { Responsaveis } from "@/components/estudio/Responsaveis";
import { Tarefas } from "@/components/estudio/Tarefas";
import { CARTAO } from "@/components/estudio/estilos";
import { TituloDaPagina } from "@/components/estudio/TituloDaPagina";
import {
  apagarProjeto,
  guardarProjeto,
  guardarReceita,
  guardarValorCombinado,
  registarPagamento,
  registarRecebimento,
} from "@/lib/estudio/acoes";
import {
  cobrancasPorReceber,
  contasDoProjeto,
  listarClientes,
  listarPagamentos,
  listarTarefas,
  listarUtilizadores,
  obterProjeto,
  recebimentosDoProjeto,
  receitasDoProjeto,
} from "@/lib/estudio/dados";
import { requerSessao } from "@/lib/estudio/sessao";
import {
  emAtraso,
  formatarData,
  formatarEuros,
  hojeEmLisboa,
} from "@/lib/estudio/tipos";

/**
 * A ficha de um projeto, em quatro abas.
 *
 * Esteve tudo numa coluna — o formulário, o dinheiro, as tarefas e o apagar —,
 * e para chegar às tarefas era preciso passar por cima de vinte campos. Desde
 * 2026-10-14 é como a Casa do painel do Café Preguiça: em cima o essencial, e
 * por baixo uma aba por pergunta.
 *
 * - **Visão geral** — como está, quanto falta receber, o que se faz a seguir;
 * - **Tarefas** — a lista inteira, para marcar e acrescentar;
 * - **Dinheiro** — o valor combinado, o que já se recebeu, os alojamentos;
 * - **Dados** — o formulário do projeto, e o apagar no fim.
 *
 * A aba vem do endereço (`?aba=`), estreitada pela `lerAba()` aos quatro
 * valores — um `?aba=` qualquer é a Visão geral, nunca um erro.
 */
const ABAS = [
  { chave: "geral", rotulo: "Visão geral" },
  { chave: "tarefas", rotulo: "Tarefas" },
  { chave: "dinheiro", rotulo: "Dinheiro" },
  { chave: "dados", rotulo: "Dados" },
] as const;

type Aba = (typeof ABAS)[number]["chave"];

function lerAba(valor: string | undefined): Aba {
  return ABAS.some((a) => a.chave === valor) ? (valor as Aba) : "geral";
}

export default async function Projeto({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aba?: string }>;
}) {
  await requerSessao();

  const { id } = await params;
  const numero = Number(id);
  /* Um `id` que não seja um número inteiro nunca chega à base: `notFound()`
     primeiro, e a consulta poupa-se. */
  if (!Number.isInteger(numero) || numero <= 0) notFound();

  const aba = lerAba((await searchParams).aba);

  const projeto = await obterProjeto(numero);
  if (!projeto) notFound();

  /* Antes das consultas: é o `hoje` que decide que vencimentos já chegaram. */
  const hoje = hojeEmLisboa();

  /* Tudo de uma vez, seja qual for a aba: as contas e as tarefas aparecem em
     mais do que uma, e as idas à base vão em paralelo — a diferença entre ler
     tudo e ler só o da aba é de milissegundos. Ver "Porque é que isto esteve
     lento" em docs/07. */
  const [
    tarefas,
    clientes,
    pessoas,
    contas,
    pagamentos,
    receitas,
    cobrancas,
    recebimentos,
  ] = await Promise.all([
    listarTarefas(projeto.id),
    listarClientes(),
    listarUtilizadores(),
    contasDoProjeto(projeto.id),
    listarPagamentos(projeto.id),
    receitasDoProjeto(projeto.id),
    cobrancasPorReceber(hoje, projeto.id),
    recebimentosDoProjeto(projeto.id),
  ]);

  const atrasado = emAtraso(projeto, hoje);
  const porFazer = tarefas.filter((t) => !t.feita);
  const base = `/estudio/projetos/${projeto.id}`;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <TituloDaPagina
        sobretitulo="Projeto"
        titulo={projeto.nome}
        voltarPara={{ href: "/estudio/projetos", rotulo: "Projetos" }}
        frase={
          <p>
            {projeto.clienteId && projeto.clienteNome ? (
              <Link
                href={`/estudio/clientes/${projeto.clienteId}`}
                className="underline-offset-4 hover:text-ink hover:underline"
              >
                {projeto.clienteNome}
              </Link>
            ) : (
              "Sem cliente"
            )}
            {projeto.inicio ? ` · desde ${formatarData(projeto.inicio)}` : null}
            {projeto.prazo && !atrasado
              ? ` · prazo ${formatarData(projeto.prazo)}`
              : null}
          </p>
        }
        accoes={
          <>
            <EtiquetaEstado estado={projeto.estado} />
            {atrasado && projeto.prazo ? (
              <span className="rounded-full border border-danger/40 px-2.5 py-1 text-xs font-medium text-danger">
                Atrasado desde {formatarData(projeto.prazo)}
              </span>
            ) : null}
          </>
        }
      />

      {/* O progresso e quem está, sempre à vista, seja qual for a aba. */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex min-w-48 flex-1 items-center gap-3">
          <BarraProgresso progresso={projeto.progresso} estado={projeto.estado} />
          <span className="shrink-0 text-sm tabular-nums text-muted">
            {projeto.progresso}% feito
          </span>
        </div>
        <Responsaveis pessoas={projeto.responsaveis} vazio="Ninguém atribuído" />
        {projeto.deployUrl || projeto.repoUrl ? (
          <ul className="flex flex-wrap gap-2">
            {projeto.deployUrl ? (
              <li>
                <a
                  href={projeto.deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-sm transition-colors hover:border-ink/30"
                >
                  <Icone nome="externo" tamanho={14} className="text-muted" />
                  Ver o site
                </a>
              </li>
            ) : null}
            {projeto.repoUrl ? (
              <li>
                <a
                  href={projeto.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-sm text-muted transition-colors hover:border-ink/30 hover:text-ink"
                >
                  <Icone nome="externo" tamanho={14} />
                  Código no GitHub
                </a>
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>

      <Abas
        rotulo="Partes do projeto"
        base={base}
        atual={aba}
        abas={ABAS.map((a) => ({
          ...a,
          conta: a.chave === "tarefas" ? porFazer.length : undefined,
        }))}
      />

      {aba === "geral" ? (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <Bloco aria-labelledby="dinheiro-resumo" className="lg:col-span-2">
            <TopoDoBloco
              id="dinheiro-resumo"
              icone="financas"
              titulo="Dinheiro"
              sub="Sem IVA"
              href={`${base}?aba=dinheiro`}
              rotuloDaSeta="Abrir a aba Dinheiro"
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Numero
                rotulo="Combinado"
                valor={contas.valor === null ? "—" : formatarEuros(contas.valor)}
                nota={contas.valor === null ? "ainda por combinar" : undefined}
              />
              <Numero
                rotulo="Já recebido"
                valor={formatarEuros(contas.recebido)}
                tom={contas.recebido > 0 ? "bom" : undefined}
              />
              <Numero
                rotulo="Falta receber"
                valor={formatarEuros(contas.porCobrar)}
                tom={contas.porCobrar > 0 ? "atencao" : undefined}
              />
              <Numero rotulo="Gastos do projeto" valor={formatarEuros(contas.gastos)} />
            </div>
          </Bloco>

          <Bloco aria-labelledby="a-seguir">
            <TopoDoBloco
              id="a-seguir"
              icone="tarefas"
              titulo="A seguir"
              sub={
                porFazer.length === 0
                  ? "Nada por fazer"
                  : `${porFazer.length} ${porFazer.length === 1 ? "tarefa" : "tarefas"} por fazer`
              }
              href={`${base}?aba=tarefas`}
              rotuloDaSeta="Abrir a aba Tarefas"
            />
            {porFazer.length === 0 ? (
              <Vazio
                accao={
                  <Link
                    href={`${base}?aba=tarefas`}
                    className="text-sm text-ink underline-offset-4 hover:underline"
                  >
                    Acrescentar uma tarefa
                  </Link>
                }
              >
                Não há tarefas por fazer neste projeto.
              </Vazio>
            ) : (
              <ul className="space-y-1">
                {porFazer.slice(0, 5).map((t) => (
                  <li key={t.id} className="flex items-start gap-2.5 py-1">
                    <span
                      aria-hidden
                      className="mt-0.5 size-4 flex-none rounded border border-border-strong"
                    />
                    <span className="min-w-0 flex-1 text-sm">{t.texto}</span>
                    {t.utilizadorNome ? (
                      <span className="shrink-0 text-xs text-muted">
                        {t.utilizadorNome}
                      </span>
                    ) : null}
                  </li>
                ))}
                {porFazer.length > 5 ? (
                  <li className="pt-1 text-xs text-muted">
                    e mais {porFazer.length - 5} na aba Tarefas
                  </li>
                ) : null}
              </ul>
            )}
          </Bloco>

          <Bloco aria-labelledby="notas">
            <TopoDoBloco
              id="notas"
              icone="projetos"
              titulo="Notas"
              sub="O que ficou combinado, e o que é preciso saber"
              href={`${base}?aba=dados`}
              rotuloDaSeta="Editar na aba Dados"
            />
            {projeto.notas ? (
              <p className="text-sm whitespace-pre-line">{projeto.notas}</p>
            ) : (
              <Vazio>Sem notas. Escrevem-se na aba Dados.</Vazio>
            )}
          </Bloco>
        </div>
      ) : null}

      {aba === "tarefas" ? (
        <section className={CARTAO}>
          <Tarefas projetoId={projeto.id} tarefas={tarefas} pessoas={pessoas} />
        </section>
      ) : null}

      {aba === "dinheiro" ? (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <section className={CARTAO}>
            <Pagamentos
              acao={registarPagamento}
              acaoValor={guardarValorCombinado}
              projetoId={projeto.id}
              contas={contas}
              pagamentos={pagamentos}
            />
          </section>

          <section className={CARTAO}>
            <Receitas
              acao={guardarReceita}
              acaoRecebimento={registarRecebimento}
              projetoId={projeto.id}
              receitas={receitas}
              cobrancas={cobrancas}
              recebimentos={recebimentos}
            />
          </section>
        </div>
      ) : null}

      {aba === "dados" ? (
        <>
          <section className={CARTAO}>
            <h2 className="sr-only">Dados do projeto</h2>
            <FormularioProjeto
              acao={guardarProjeto}
              projeto={projeto}
              clientes={clientes}
              pessoas={pessoas}
            />
          </section>

          {/* Num `details` de propósito, e na última aba: apagar não pode estar
              a um clique do botão de guardar. Sem `confirm()` do browser — um
              diálogo do sistema não se pode desenhar nem traduzir. */}
          <details className="border-t border-border pt-6">
            <summary className="cursor-pointer text-sm text-muted transition-colors hover:text-ink">
              Apagar este projeto
            </summary>
            <div className="mt-4">
              <p className="text-sm text-muted">
                Apaga o projeto e as suas tarefas. Não há como voltar atrás.
              </p>
              <form action={apagarProjeto} className="mt-3">
                <input type="hidden" name="id" value={projeto.id} />
                <button
                  type="submit"
                  className="rounded-full border border-danger/40 px-4 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
                >
                  Apagar {projeto.nome}
                </button>
              </form>
            </div>
          </details>
        </>
      ) : null}
    </div>
  );
}
