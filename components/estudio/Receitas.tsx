/** docs: docs/07-estudio.md */
"use client";

import { useActionState } from "react";
import { BotaoGuardar } from "@/components/estudio/BotaoGuardar";
import { CAMPO, ETIQUETA } from "@/components/estudio/estilos";
import { apagarReceita, type EstadoDinheiro } from "@/lib/estudio/acoes";
import {
  formatarData,
  formatarEuros,
  hojeEmLisboa,
  PERIODICIDADES,
  ROTULO_CURTO,
  ROTULO_PERIODICIDADE,
  ROTULO_RECEITA,
  TIPOS_RECEITA,
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
 */

function Bloco({
  tipo,
  projetoId,
  receitas,
  submeter,
  estado,
  hoje,
}: {
  tipo: TipoReceita;
  projetoId: number;
  receitas: Receita[];
  submeter: (form: FormData) => void;
  estado: EstadoDinheiro;
  hoje: string;
}) {
  const minhas = receitas.filter((r) => r.tipo === tipo);
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
  projetoId,
  receitas,
}: {
  acao: (anterior: EstadoDinheiro, form: FormData) => Promise<EstadoDinheiro>;
  projetoId: number;
  receitas: Receita[];
}) {
  const [estado, submeter] = useActionState<EstadoDinheiro, FormData>(acao, {});
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
            submeter={submeter}
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
    </section>
  );
}
