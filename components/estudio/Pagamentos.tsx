/** docs: docs/07-estudio.md */
"use client";

import { useActionState, useEffect, useRef } from "react";
import { BotaoGuardar } from "@/components/estudio/BotaoGuardar";
import { CAMPO, ETIQUETA } from "@/components/estudio/estilos";
import {
  apagarPagamento,
  type EstadoDinheiro,
  type EstadoValorCombinado,
} from "@/lib/estudio/acoes";
import {
  formatarData,
  formatarEuros,
  hojeEmLisboa,
  type ContasProjeto,
  type Pagamento,
} from "@/lib/estudio/tipos";

/**
 * O dinheiro de um projeto, todo no mesmo sítio: o que se combinou, o que já
 * entrou, e um campo para registar mais.
 *
 * O valor combinado era um campo do formulário do projeto, lá em cima, ao lado
 * do progresso e do prazo. Não é aí que se pensa nele — pensa-se nele quando se
 * está a olhar para o que já entrou e para o que falta cobrar, que é aqui.
 *
 * O campo é ao mesmo tempo o que mostra e o que edita: não há um número
 * "Combinado" em cima e um campo repetido em baixo a dizer o mesmo. Por isso a
 * grelha ao lado só tem os dois números que *derivam* dele. A diferença entre
 * os dois é o "por cobrar", e é o único número aqui que faz alguém pegar no
 * telefone.
 *
 * Dois `useActionState` e não um: um erro a escrever o valor combinado não tem
 * que apagar o "Guardado" do pagamento que se registou ao lado. Mesmo motivo
 * que no `Receitas.tsx`.
 *
 * Vários pagamentos por projeto de propósito: um sinal, um faseado, um resto.
 * Um campo só "já pagou / não pagou" perdia metade dos casos reais.
 */
export function Pagamentos({
  acao,
  acaoValor,
  projetoId,
  contas,
  pagamentos,
}: {
  acao: (anterior: EstadoDinheiro, form: FormData) => Promise<EstadoDinheiro>;
  acaoValor: (
    anterior: EstadoValorCombinado,
    form: FormData,
  ) => Promise<EstadoValorCombinado>;
  projetoId: number;
  contas: ContasProjeto;
  pagamentos: Pagamento[];
}) {
  const [estado, submeter] = useActionState<EstadoDinheiro, FormData>(acao, {});
  const [estadoValor, submeterValor] = useActionState<
    EstadoValorCombinado,
    FormData
  >(acaoValor, {});
  const form = useRef<HTMLFormElement>(null);

  /* Limpa depois de gravar: quem regista um pagamento costuma registar o
     seguinte, e reescrever a data por cima da anterior é atrito à toa. */
  useEffect(() => {
    if (estado.ok) form.current?.reset();
  }, [estado.ok]);

  const erros = estado.erros ?? {};

  return (
    <section aria-labelledby="dinheiro">
      <h2
        id="dinheiro"
        className="font-display text-lg font-semibold tracking-tight"
      >
        Dinheiro
      </h2>

      {/* Irmão do formulário de registar pagamento, nunca aninhado nele: dois
          `<form>` não se metem um dentro do outro. */}
      <form action={submeterValor} className="mt-4" noValidate>
        <input type="hidden" name="projetoId" value={projetoId} />
        <label htmlFor="valor-combinado" className={ETIQUETA}>
          Combinado <span className="text-muted">(sem IVA)</span>
        </label>
        <div className="flex flex-wrap items-start gap-3">
          {/* A largura vai no invólucro e não no `<input>`: o `CAMPO` já traz
              `w-full`, e pôr um `w-40` ao lado deixava duas larguras a competir
              no mesmo elemento — quem ganha depende da ordem no CSS gerado, não
              da ordem em que se escrevem. */}
          <div className="w-40">
            {/* Texto e não `type="number"`: escreve-se `1.500,50` cá, e um
                campo numérico do browser recusa a vírgula em metade das
                configurações. Quem trata disto é o `lerValor()` de
                `lib/estudio/validacao.ts`, o mesmo que a ação corre. */}
            <input
              id="valor-combinado"
              name="valor"
              inputMode="decimal"
              placeholder="1500,50"
              /* Devolvido com vírgula, que é como se pede. Um campo que
                 aceita `1.234,56` e responde `1234.56` põe quem o usa a
                 duvidar se ficou bem gravado. Sem `formatarEuros()`: isto é um
                 campo de escrita, não um número para ler — o `€` e o separador
                 de milhares vinham só para serem apagados à mão. */
              defaultValue={
                contas.valor === null
                  ? ""
                  : String(contas.valor).replace(".", ",")
              }
              className={`${CAMPO} tabular-nums`}
              aria-invalid={estadoValor.erro ? true : undefined}
              aria-describedby={estadoValor.erro ? "erro-combinado" : undefined}
            />
          </div>
          <BotaoGuardar aGuardar="A guardar…">Guardar</BotaoGuardar>
          {estadoValor.ok ? (
            <p role="status" className="self-center text-sm text-accent">
              Guardado
            </p>
          ) : null}
        </div>
        {estadoValor.erro ? (
          <p
            id="erro-combinado"
            role="alert"
            className="mt-1.5 text-sm text-danger"
          >
            {estadoValor.erro}
          </p>
        ) : null}
      </form>

      {/* Só os dois números que derivam do campo acima — repetir o "Combinado"
          aqui era dizer duas vezes a mesma coisa no mesmo ecrã. */}
      <dl className="mt-5 grid grid-cols-2 gap-3 text-center">
        <div>
          <dt className="text-xs text-muted">Recebido</dt>
          <dd className="mt-0.5 text-sm font-medium tabular-nums text-accent">
            {formatarEuros(contas.recebido)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Por cobrar</dt>
          <dd
            className={`mt-0.5 text-sm font-medium tabular-nums ${
              contas.porCobrar > 0 ? "text-primary" : "text-muted"
            }`}
          >
            {contas.valor === null ? "—" : formatarEuros(contas.porCobrar)}
          </dd>
        </div>
      </dl>

      {contas.valor === null ? (
        <p className="mt-3 text-xs text-muted">
          Sem valor combinado ainda — escreve-o aqui em cima e o &ldquo;por
          cobrar&rdquo; passa a fazer contas.
        </p>
      ) : null}

      {pagamentos.length > 0 ? (
        <ul className="mt-5 divide-y divide-border border-y border-border">
          {pagamentos.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-2.5">
              <span className="w-24 shrink-0 text-sm font-medium tabular-nums">
                {formatarEuros(p.valor)}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-muted">
                {formatarData(p.data)}
                {p.descricao ? ` · ${p.descricao}` : ""}
              </span>
              <form action={apagarPagamento}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="projetoId" value={projetoId} />
                <button
                  type="submit"
                  aria-label={`Apagar o pagamento de ${formatarEuros(p.valor)}`}
                  className="rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-danger"
                >
                  Apagar
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : null}

      <form ref={form} action={submeter} className="mt-5 space-y-4" noValidate>
        <input type="hidden" name="projetoId" value={projetoId} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pagamento-valor" className={ETIQUETA}>
              Entrou quanto? <span className="text-muted">(sem IVA)</span>
            </label>
            <input
              id="pagamento-valor"
              name="valor"
              inputMode="decimal"
              placeholder="1500,50"
              className={CAMPO}
              aria-invalid={erros.valor ? true : undefined}
            />
            {erros.valor ? (
              <p role="alert" className="mt-1.5 text-sm text-danger">
                {erros.valor}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="pagamento-data" className={ETIQUETA}>
              Quando
            </label>
            <input
              id="pagamento-data"
              name="data"
              type="date"
              defaultValue={hojeEmLisboa()}
              className={CAMPO}
              aria-invalid={erros.data ? true : undefined}
            />
            {erros.data ? (
              <p role="alert" className="mt-1.5 text-sm text-danger">
                {erros.data}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor="pagamento-descricao" className={ETIQUETA}>
            Nota <span className="text-muted">(opcional)</span>
          </label>
          <input
            id="pagamento-descricao"
            name="descricao"
            placeholder="sinal, segunda tranche…"
            className={CAMPO}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <BotaoGuardar aGuardar="A registar…">Registar pagamento</BotaoGuardar>
          {estado.erro ? (
            <p role="alert" className="text-sm text-danger">
              {estado.erro}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
