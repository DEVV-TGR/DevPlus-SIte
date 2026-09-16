/** docs: docs/07-estudio.md */
"use client";

import { useActionState } from "react";
import { BotaoGuardar } from "@/components/estudio/BotaoGuardar";
import { CAMPO, ETIQUETA } from "@/components/estudio/estilos";
import {
  apagarRecebimento,
  apagarReceita,
  type EstadoDinheiro,
} from "@/lib/estudio/acoes";
import {
  formatarData,
  formatarEuros,
  hojeEmLisboa,
  PERIODICIDADES,
  ROTULO_CURTO,
  ROTULO_PERIODICIDADE,
  ROTULO_RECEITA,
  TIPOS_RECEITA,
  type Cobranca,
  type Recebimento,
  type Receita,
  type TipoReceita,
} from "@/lib/estudio/tipos";

/**
 * O que o cliente paga de forma recorrente por este site: o alojamento com o
 * apoio, e o domínio.
 *
 * **Não lhe chamamos mensalidade em lado nenhum**, e é por uma razão prática:
 * há clientes que pagam ao ano. Um campo com esse nome onde se escreve um valor
 * anual é um campo que mente, e a soma sairia doze vezes errada. O nome diz o
 * que a coisa é; de quanto em quanto tempo se paga é a escolha ao lado.
 *
 * Vive no projeto e não no cliente porque é o alojamento *daquele site* — um
 * cliente com dois sites pode pagar um e não o outro.
 *
 * Debaixo de cada uma está o que ela já rendeu: as **cobranças por fazer** —
 * os vencimentos que chegaram e ainda não foram pagos — e o histórico do que
 * entrou. É aqui que se corrige um valor ou uma data; no resumo há só o botão
 * de dar baixa, que serve o caso normal.
 */

/** `150` -> `150,00`, para o campo já vir escrito como se escreve cá. O
 *  `lerValor()` da validação lê a vírgula sem se queixar. */
function paraCampo(valor: number): string {
  return valor.toFixed(2).replace(".", ",");
}

function Bloco({
  tipo,
  projetoId,
  receitas,
  cobrancas,
  recebimentos,
  submeter,
  submeterRecebimento,
  estado,
  hoje,
}: {
  tipo: TipoReceita;
  projetoId: number;
  receitas: Receita[];
  cobrancas: Cobranca[];
  recebimentos: Recebimento[];
  submeter: (form: FormData) => void;
  submeterRecebimento: (form: FormData) => void;
  estado: EstadoDinheiro;
  hoje: string;
}) {
  const minhas = receitas.filter((r) => r.tipo === tipo);
  const meusIds = new Set(minhas.map((r) => r.id));
  const porCobrar = cobrancas.filter((c) => meusIds.has(c.receitaId));
  const jaEntrou = recebimentos.filter((r) => meusIds.has(r.receitaId));
  const ativa = minhas.find(
    (r) => r.desde <= hoje && (r.ate === null || r.ate >= hoje),
  );
  const erros = estado.erros ?? {};

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-sm font-medium">{ROTULO_RECEITA[tipo]}</h3>
        {ativa ? (
          <p className="text-sm tabular-nums text-accent">
            {formatarEuros(ativa.valor)}
            <span className="text-muted">
              {" · "}
              {ROTULO_CURTO[ativa.periodicidade]}
              {" · desde "}
              {formatarData(ativa.desde)}
            </span>
          </p>
        ) : (
          <p className="text-sm text-muted">Não paga</p>
        )}
      </div>

      {minhas.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {minhas.map((r) => (
            <li
              key={r.id}
              className="flex items-center gap-3 text-xs text-muted"
            >
              <span className="tabular-nums">{formatarEuros(r.valor)}</span>
              <span className="min-w-0 flex-1 truncate">
                {ROTULO_CURTO[r.periodicidade]} · {formatarData(r.desde)}
                {r.ate ? ` a ${formatarData(r.ate)}` : ""}
              </span>
              <form action={apagarReceita}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="projetoId" value={projetoId} />
                <button
                  type="submit"
                  aria-label={`Apagar ${ROTULO_RECEITA[tipo].toLowerCase()} de ${formatarEuros(r.valor)}`}
                  className="rounded px-1.5 py-0.5 transition-colors hover:bg-surface-2 hover:text-danger"
                >
                  Apagar
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : null}

      {/* O que já se venceu e ainda não foi pago. Um por linha, com o valor e a
          data já escritos: o caso normal é carregar em "Registar" sem tocar em
          nada, e os campos existem para o caso em que o cliente pagou a menos
          ou pagou tarde. */}
      {porCobrar.length > 0 ? (
        <div className="mt-4 rounded-lg border border-primary/30 p-3">
          <p className="text-xs font-medium text-primary">
            {porCobrar.length === 1
              ? "Uma cobrança por fazer"
              : `${porCobrar.length} cobranças por fazer`}
          </p>

          <ul className="mt-3 space-y-3">
            {porCobrar.map((c) => (
              <li key={`${c.receitaId}-${c.vencimento}`}>
                <form
                  action={submeterRecebimento}
                  className="flex flex-wrap items-center gap-2"
                  noValidate
                >
                  <input type="hidden" name="receitaId" value={c.receitaId} />
                  <input
                    type="hidden"
                    name="vencimento"
                    value={c.vencimento}
                  />
                  <span className="w-full text-xs text-muted sm:w-auto sm:flex-1">
                    Venceu a {formatarData(c.vencimento)}
                  </span>
                  <label className="sr-only" htmlFor={`entrou-${c.receitaId}-${c.vencimento}`}>
                    Quanto entrou
                  </label>
                  <input
                    id={`entrou-${c.receitaId}-${c.vencimento}`}
                    name="valor"
                    inputMode="decimal"
                    defaultValue={paraCampo(c.valor)}
                    className="w-24 rounded-lg border border-border-strong bg-surface px-2.5 py-1.5 text-sm tabular-nums"
                  />
                  <label className="sr-only" htmlFor={`quando-${c.receitaId}-${c.vencimento}`}>
                    Quando entrou
                  </label>
                  <input
                    id={`quando-${c.receitaId}-${c.vencimento}`}
                    name="data"
                    type="date"
                    defaultValue={hoje}
                    className="rounded-lg border border-border-strong bg-surface px-2.5 py-1.5 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-full border border-border-strong px-3 py-1.5 text-xs transition-colors hover:border-accent hover:text-accent"
                  >
                    Registar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* O histórico. Apagar aqui é desfazer: a cobrança volta a aparecer por
          fazer, que é o que se quer quando o dinheiro afinal não era aquele. */}
      {jaEntrou.length > 0 ? (
        <ul className="mt-3 space-y-1">
          {jaEntrou.map((r) => (
            <li
              key={r.id}
              className="flex items-center gap-3 text-xs text-muted"
            >
              <span className="tabular-nums text-accent">
                {formatarEuros(r.valor)}
              </span>
              <span className="min-w-0 flex-1 truncate">
                entrou a {formatarData(r.data)}
                {r.data !== r.vencimento
                  ? ` · venceu a ${formatarData(r.vencimento)}`
                  : ""}
                {r.notas ? ` · ${r.notas}` : ""}
              </span>
              <form action={apagarRecebimento}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="projetoId" value={projetoId} />
                <button
                  type="submit"
                  aria-label={`Apagar o recebimento de ${formatarEuros(r.valor)}`}
                  className="rounded px-1.5 py-0.5 transition-colors hover:bg-surface-2 hover:text-danger"
                >
                  Apagar
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : null}

      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-muted transition-colors hover:text-ink">
          {ativa ? "Mudar ou terminar" : `Acrescentar ${ROTULO_RECEITA[tipo].toLowerCase()}`}
        </summary>

        <form action={submeter} className="mt-4 space-y-4" noValidate>
          <input type="hidden" name="projetoId" value={projetoId} />
          <input type="hidden" name="tipo" value={tipo} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${tipo}-valor`} className={ETIQUETA}>
                Quanto <span className="text-muted">(sem IVA)</span>
              </label>
              <input
                id={`${tipo}-valor`}
                name="valor"
                inputMode="decimal"
                placeholder={tipo === "dominio" ? "12" : "30"}
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
              <label htmlFor={`${tipo}-periodicidade`} className={ETIQUETA}>
                De quanto em quanto tempo
              </label>
              <select
                id={`${tipo}-periodicidade`}
                name="periodicidade"
                defaultValue={tipo === "dominio" ? "anual" : "mensal"}
                className={CAMPO}
              >
                {PERIODICIDADES.filter((p) => p !== "unica").map((p) => (
                  <option key={p} value={p}>
                    {ROTULO_PERIODICIDADE[p]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${tipo}-desde`} className={ETIQUETA}>
                Desde
              </label>
              <input
                id={`${tipo}-desde`}
                name="desde"
                type="date"
                defaultValue={hoje}
                className={CAMPO}
                aria-invalid={erros.desde ? true : undefined}
              />
              {erros.desde ? (
                <p role="alert" className="mt-1.5 text-sm text-danger">
                  {erros.desde}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor={`${tipo}-ate`} className={ETIQUETA}>
                Até <span className="text-muted">(se acabou)</span>
              </label>
              <input
                id={`${tipo}-ate`}
                name="ate"
                type="date"
                className={CAMPO}
                aria-invalid={erros.ate ? true : undefined}
              />
              {erros.ate ? (
                <p role="alert" className="mt-1.5 text-sm text-danger">
                  {erros.ate}
                </p>
              ) : null}
            </div>
          </div>

          <BotaoGuardar>Guardar</BotaoGuardar>
        </form>
      </details>
    </div>
  );
}

export function Receitas({
  acao,
  acaoRecebimento,
  projetoId,
  receitas,
  cobrancas,
  recebimentos,
}: {
  acao: (anterior: EstadoDinheiro, form: FormData) => Promise<EstadoDinheiro>;
  acaoRecebimento: (
    anterior: EstadoDinheiro,
    form: FormData,
  ) => Promise<EstadoDinheiro>;
  projetoId: number;
  receitas: Receita[];
  cobrancas: Cobranca[];
  recebimentos: Recebimento[];
}) {
  const [estado, submeter] = useActionState<EstadoDinheiro, FormData>(acao, {});
  /* Um estado próprio para as cobranças: um erro ao registar um recebimento
     não tem nada que apagar a mensagem de "Guardado" da receita ao lado. */
  const [estadoRecebimento, submeterRecebimento] = useActionState<
    EstadoDinheiro,
    FormData
  >(acaoRecebimento, {});
  const hoje = hojeEmLisboa();

  return (
    <section aria-labelledby="receitas">
      <h2
        id="receitas"
        className="font-display text-lg font-semibold tracking-tight"
      >
        O que este site rende
      </h2>
      <p className="mt-1 text-sm text-muted">
        O que o cliente paga por ter isto no ar.
      </p>

      <div className="mt-5 space-y-6">
        {TIPOS_RECEITA.map((tipo) => (
          <Bloco
            key={tipo}
            tipo={tipo}
            projetoId={projetoId}
            receitas={receitas}
            cobrancas={cobrancas}
            recebimentos={recebimentos}
            submeter={submeter}
            submeterRecebimento={submeterRecebimento}
            estado={estado}
            hoje={hoje}
          />
        ))}
      </div>

      {estado.erro ? (
        <p role="alert" className="mt-4 text-sm text-danger">
          {estado.erro}
        </p>
      ) : null}
      {estado.ok ? (
        <p role="status" className="mt-4 text-sm text-accent">
          Guardado.
        </p>
      ) : null}
      {estadoRecebimento.erro ?? estadoRecebimento.erros?.valor ??
      estadoRecebimento.erros?.data ? (
        <p role="alert" className="mt-4 text-sm text-danger">
          {estadoRecebimento.erro ??
            estadoRecebimento.erros?.valor ??
            estadoRecebimento.erros?.data}
        </p>
      ) : null}
      {estadoRecebimento.ok ? (
        <p role="status" className="mt-4 text-sm text-accent">
          Cobrança registada.
        </p>
      ) : null}
    </section>
  );
}
