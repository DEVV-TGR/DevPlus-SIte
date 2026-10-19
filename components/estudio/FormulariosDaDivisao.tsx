/** docs: docs/07-estudio.md */
"use client";

import { useActionState, useEffect, useRef } from "react";
import { BotaoGuardar } from "@/components/estudio/BotaoGuardar";
import { CAMPO, ETIQUETA } from "@/components/estudio/estilos";
import type { EstadoDinheiro } from "@/lib/estudio/acoes";
import { hojeEmLisboa, type Socio } from "@/lib/estudio/tipos";

type Acao = (anterior: EstadoDinheiro, form: FormData) => Promise<EstadoDinheiro>;

/**
 * Os dois formulários da página Finanças › Divisão: juntar alguém à divisão, e
 * registar o que já se pagou a alguém.
 *
 * Ambos limpam depois de gravar, como o de registar pagamento: quem regista
 * um levantamento costuma registar o do sócio seguinte logo a seguir.
 */
function useLimparDepoisDeGravar(ok: boolean | undefined) {
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (ok) form.current?.reset();
  }, [ok]);
  return form;
}

export function FormularioSocio({ acao }: { acao: Acao }) {
  const [estado, submeter] = useActionState<EstadoDinheiro, FormData>(acao, {});
  const form = useLimparDepoisDeGravar(estado.ok);
  const erro = estado.erros?.nome;

  return (
    <form ref={form} action={submeter} className="flex flex-wrap items-start gap-3" noValidate>
      <div className="min-w-0 flex-1">
        <label htmlFor="socio-nome" className="sr-only">
          Nome
        </label>
        <input
          id="socio-nome"
          name="nome"
          placeholder="Nome de quem entra na divisão"
          className={CAMPO}
          aria-invalid={erro ? true : undefined}
        />
        {erro ? (
          <p role="alert" className="mt-1.5 text-sm text-danger">
            {erro}
          </p>
        ) : null}
      </div>
      <BotaoGuardar aGuardar="A juntar…">Juntar</BotaoGuardar>
      {estado.erro ? (
        <p role="alert" className="basis-full text-sm text-danger">
          {estado.erro}
        </p>
      ) : null}
    </form>
  );
}

export function FormularioLevantamento({
  acao,
  socios,
}: {
  acao: Acao;
  socios: Socio[];
}) {
  const [estado, submeter] = useActionState<EstadoDinheiro, FormData>(acao, {});
  const form = useLimparDepoisDeGravar(estado.ok);
  const erros = estado.erros ?? {};

  return (
    <form ref={form} action={submeter} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="levantamento-socio" className={ETIQUETA}>
            A quem
          </label>
          <select
            id="levantamento-socio"
            name="socioId"
            defaultValue=""
            className={CAMPO}
            aria-invalid={erros.socio ? true : undefined}
          >
            <option value="" disabled>
              Escolhe
            </option>
            {socios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
          {erros.socio ? (
            <p role="alert" className="mt-1.5 text-sm text-danger">
              {erros.socio}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="levantamento-valor" className={ETIQUETA}>
            Quanto
          </label>
          <input
            id="levantamento-valor"
            name="valor"
            inputMode="decimal"
            placeholder="120,00"
            className={`${CAMPO} tabular-nums`}
            aria-invalid={erros.valor ? true : undefined}
          />
          {erros.valor ? (
            <p role="alert" className="mt-1.5 text-sm text-danger">
              {erros.valor}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="levantamento-data" className={ETIQUETA}>
            Quando
          </label>
          <input
            id="levantamento-data"
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
        <label htmlFor="levantamento-notas" className={ETIQUETA}>
          Nota <span className="text-muted">(opcional)</span>
        </label>
        <input
          id="levantamento-notas"
          name="notas"
          placeholder="do café Avenida, transferência…"
          className={CAMPO}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <BotaoGuardar aGuardar="A registar…">Registar</BotaoGuardar>
        {estado.ok ? (
          <p role="status" className="text-sm text-accent">
            Registado
          </p>
        ) : null}
        {estado.erro ? (
          <p role="alert" className="text-sm text-danger">
            {estado.erro}
          </p>
        ) : null}
      </div>
    </form>
  );
}
