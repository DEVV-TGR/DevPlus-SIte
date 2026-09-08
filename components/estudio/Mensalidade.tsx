/** docs: docs/07-estudio.md */
"use client";

import { useActionState } from "react";
import { BotaoGuardar } from "@/components/estudio/BotaoGuardar";
import { CAMPO, ETIQUETA } from "@/components/estudio/estilos";
import { apagarMensalidade, type EstadoDinheiro } from "@/lib/estudio/acoes";
import {
  formatarData,
  formatarEuros,
  hojeEmLisboa,
  type Mensalidade as TMensalidade,
} from "@/lib/estudio/tipos";

/**
 * A mensalidade de alojamento e suporte de um cliente.
 *
 * É o modelo que o `docs/05` descreve, e o número que diz se o estúdio se
 * aguenta num mês sem vender nada. **Guarda o que está contratado**, não um
 * registo de cada mês recebido — quando um cliente deixa de pagar, põe-se a
 * data de fim em vez de se apagar a linha, para o histórico do que já se cobrou
 * continuar a valer.
 */
export function Mensalidade({
  acao,
  clienteId,
  mensalidades,
}: {
  acao: (anterior: EstadoDinheiro, form: FormData) => Promise<EstadoDinheiro>;
  clienteId: number;
  mensalidades: TMensalidade[];
}) {
  const [estado, submeter] = useActionState<EstadoDinheiro, FormData>(acao, {});
  const erros = estado.erros ?? {};
  const hoje = hojeEmLisboa();

  const ativa = mensalidades.find(
    (m) => m.desde <= hoje && (m.ate === null || m.ate >= hoje),
  );

  return (
    <section aria-labelledby="mensalidade">
      <h2
        id="mensalidade"
        className="font-display text-lg font-semibold tracking-tight"
      >
        Mensalidade
      </h2>
      <p className="mt-1 text-sm text-muted">
        {ativa
          ? `${formatarEuros(ativa.valor)} por mês, desde ${formatarData(ativa.desde)}.`
          : "Sem mensalidade ativa. Alojamento e suporte, se for o caso."}
      </p>

      {mensalidades.length > 0 ? (
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {mensalidades.map((m) => {
            const estaAtiva = m.desde <= hoje && (m.ate === null || m.ate >= hoje);
            return (
              <li key={m.id} className="flex items-center gap-3 py-2.5">
                <span className="w-24 shrink-0 text-sm font-medium tabular-nums">
                  {formatarEuros(m.valor)}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs text-muted">
                  {formatarData(m.desde)}
                  {m.ate ? ` a ${formatarData(m.ate)}` : " — sem fim marcado"}
                </span>
                {estaAtiva ? (
                  <span className="shrink-0 rounded-full border border-accent/40 px-2 py-0.5 text-[0.6875rem] text-accent">
                    ativa
                  </span>
                ) : null}
                <form action={apagarMensalidade}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="clienteId" value={clienteId} />
                  <button
                    type="submit"
                    aria-label={`Apagar a mensalidade de ${formatarEuros(m.valor)}`}
                    className="rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-danger"
                  >
                    Apagar
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      ) : null}

      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-muted transition-colors hover:text-ink">
          {ativa ? "Mudar ou terminar" : "Acrescentar mensalidade"}
        </summary>

        <form action={submeter} className="mt-4 space-y-4" noValidate>
          <input type="hidden" name="clienteId" value={clienteId} />

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="mensalidade-valor" className={ETIQUETA}>
                Por mês <span className="text-muted">(sem IVA)</span>
              </label>
              <input
                id="mensalidade-valor"
                name="valor"
                inputMode="decimal"
                placeholder="30"
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
              <label htmlFor="mensalidade-desde" className={ETIQUETA}>
                Desde
              </label>
              <input
                id="mensalidade-desde"
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
              <label htmlFor="mensalidade-ate" className={ETIQUETA}>
                Até <span className="text-muted">(se acabou)</span>
              </label>
              <input
                id="mensalidade-ate"
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

          <div className="flex flex-wrap items-center gap-4">
            <BotaoGuardar>Guardar mensalidade</BotaoGuardar>
            {estado.erro ? (
              <p role="alert" className="text-sm text-danger">
                {estado.erro}
              </p>
            ) : null}
            {estado.ok ? (
              <p role="status" className="text-sm text-accent">
                Guardada.
              </p>
            ) : null}
          </div>
        </form>
      </details>
    </section>
  );
}
