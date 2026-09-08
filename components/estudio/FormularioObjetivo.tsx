/** docs: docs/07-estudio.md */
"use client";

import { useActionState, useEffect, useRef } from "react";
import { BotaoGuardar } from "@/components/estudio/BotaoGuardar";
import { CAMPO, ETIQUETA } from "@/components/estudio/estilos";
import { apagarObjetivo, type EstadoDinheiro } from "@/lib/estudio/acoes";
import {
  formatarData,
  METRICAS,
  progressoEscrito,
  ROTULO_METRICA,
  type Objetivo,
} from "@/lib/estudio/tipos";

/**
 * Pôr e tirar objetivos.
 *
 * Vive a toda a largura, por baixo da linha dos cartões, e não dentro do cartão
 * dos objetivos: um formulário de cinco campos num terço de linha fica
 * espremido, e isso já se aprendeu nesta página.
 *
 * Não há campo para o progresso, e é o ponto todo: escreve-se onde se quer
 * chegar, e o Estúdio conta sozinho onde já se está.
 */
export function FormularioObjetivo({
  acao,
  objetivos,
}: {
  acao: (anterior: EstadoDinheiro, form: FormData) => Promise<EstadoDinheiro>;
  objetivos: Objetivo[];
}) {
  const [estado, submeter] = useActionState<EstadoDinheiro, FormData>(acao, {});
  const form = useRef<HTMLFormElement>(null);
  const erros = estado.erros ?? {};

  useEffect(() => {
    if (estado.ok) form.current?.reset();
  }, [estado.ok]);

  return (
    <div>
      {objetivos.length > 0 ? (
        <ul className="mb-8 divide-y divide-border border-y border-border">
          {objetivos.map((o) => (
            <li key={o.id} className="flex items-center gap-3 py-2.5">
              <span className="min-w-0 flex-1 truncate text-sm">
                {o.titulo}
                <span className="text-muted">
                  {" · "}
                  {ROTULO_METRICA[o.metrica].toLowerCase()}
                  {o.desde ? ` desde ${formatarData(o.desde)}` : ""}
                  {o.prazo ? ` · até ${formatarData(o.prazo)}` : ""}
                </span>
              </span>
              <span className="shrink-0 text-xs tabular-nums text-muted">
                {progressoEscrito(o)}
              </span>
              <form action={apagarObjetivo}>
                <input type="hidden" name="id" value={o.id} />
                <button
                  type="submit"
                  aria-label={`Apagar o objetivo "${o.titulo}"`}
                  className="rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-danger"
                >
                  Apagar
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : null}

      <form ref={form} action={submeter} className="space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="objetivo-titulo" className={ETIQUETA}>
              O que queres alcançar
            </label>
            <input
              id="objetivo-titulo"
              name="titulo"
              placeholder="10 clientes até ao fim do ano"
              className={CAMPO}
              aria-invalid={erros.titulo ? true : undefined}
            />
            {erros.titulo ? (
              <p role="alert" className="mt-1.5 text-sm text-danger">
                {erros.titulo}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="objetivo-metrica" className={ETIQUETA}>
              O que se conta
            </label>
            <select
              id="objetivo-metrica"
              name="metrica"
              defaultValue="clientes"
              className={CAMPO}
            >
              {METRICAS.map((m) => (
                <option key={m} value={m}>
                  {ROTULO_METRICA[m]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="objetivo-alvo" className={ETIQUETA}>
              Chegar a
            </label>
            <input
              id="objetivo-alvo"
              name="alvo"
              inputMode="decimal"
              placeholder="10"
              className={CAMPO}
              aria-invalid={erros.alvo ? true : undefined}
            />
            {erros.alvo ? (
              <p role="alert" className="mt-1.5 text-sm text-danger">
                {erros.alvo}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="objetivo-prazo" className={ETIQUETA}>
              Até quando <span className="text-muted">(opcional)</span>
            </label>
            <input
              id="objetivo-prazo"
              name="prazo"
              type="date"
              className={CAMPO}
              aria-invalid={erros.prazo ? true : undefined}
            />
            {erros.prazo ? (
              <p role="alert" className="mt-1.5 text-sm text-danger">
                {erros.prazo}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="objetivo-desde" className={ETIQUETA}>
              A contar de <span className="text-muted">(opcional)</span>
            </label>
            <input
              id="objetivo-desde"
              name="desde"
              type="date"
              className={CAMPO}
              aria-invalid={erros.desde ? true : undefined}
            />
            {erros.desde ? (
              <p role="alert" className="mt-1.5 text-sm text-danger">
                {erros.desde}
              </p>
            ) : null}
          </div>
        </div>

        {/* A diferença entre "ter 10 clientes" e "ganhar 10 clientes este ano"
            é esta data, e ninguém adivinha isso de um campo chamado "desde". */}
        <p className="text-xs text-muted">
          Deixa <strong className="font-medium">a contar de</strong> vazio para
          contar tudo o que já existe. Preenche-o para contar só o que vier a
          partir dessa data — é a diferença entre <em>ter</em> 10 clientes e{" "}
          <em>ganhar</em> 10 clientes este ano.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <BotaoGuardar>Pôr objetivo</BotaoGuardar>
          {estado.erro ? (
            <p role="alert" className="text-sm text-danger">
              {estado.erro}
            </p>
          ) : null}
          {estado.ok ? (
            <p role="status" className="text-sm text-accent">
              Guardado.
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
