/** docs: docs/07-estudio.md */
"use client";

import { useActionState, useEffect, useRef } from "react";
import { BotaoGuardar } from "@/components/estudio/BotaoGuardar";
import { CAMPO, ETIQUETA } from "@/components/estudio/estilos";
import type { EstadoDinheiro } from "@/lib/estudio/acoes";
import {
  hojeEmLisboa,
  PERIODICIDADES,
  ROTULO_PERIODICIDADE,
  type ProjetoLeve,
} from "@/lib/estudio/tipos";

export function FormularioGasto({
  acao,
  projetos,
}: {
  acao: (anterior: EstadoDinheiro, form: FormData) => Promise<EstadoDinheiro>;
  projetos: ProjetoLeve[];
}) {
  const [estado, submeter] = useActionState<EstadoDinheiro, FormData>(acao, {});
  const form = useRef<HTMLFormElement>(null);
  const erros = estado.erros ?? {};

  useEffect(() => {
    if (estado.ok) form.current?.reset();
  }, [estado.ok]);

  return (
    <form ref={form} action={submeter} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="gasto-valor" className={ETIQUETA}>
            Quanto <span className="text-muted">(sem IVA)</span>
          </label>
          <input
            id="gasto-valor"
            name="valor"
            inputMode="decimal"
            placeholder="19,90"
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
          <label htmlFor="gasto-data" className={ETIQUETA}>
            Quando
          </label>
          <input
            id="gasto-data"
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

        <div>
          <label htmlFor="gasto-periodicidade" className={ETIQUETA}>
            De quanto em quanto tempo
          </label>
          {/* Um seletor e não uma caixa "é recorrente": um domínio paga-se uma
              vez por ano e o alojamento todos os meses, e tratá-los como a mesma
              coisa dava um custo fixo errado por doze vezes. */}
          <select
            id="gasto-periodicidade"
            name="periodicidade"
            defaultValue="unica"
            className={CAMPO}
            aria-invalid={erros.periodicidade ? true : undefined}
          >
            {PERIODICIDADES.map((p) => (
              <option key={p} value={p}>
                {ROTULO_PERIODICIDADE[p]}
              </option>
            ))}
          </select>
          {erros.periodicidade ? (
            <p role="alert" className="mt-1.5 text-sm text-danger">
              {erros.periodicidade}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="gasto-descricao" className={ETIQUETA}>
          De que é
        </label>
        <input
          id="gasto-descricao"
          name="descricao"
          placeholder="domínio, alojamento, licença…"
          className={CAMPO}
          aria-invalid={erros.descricao ? true : undefined}
        />
        {erros.descricao ? (
          <p role="alert" className="mt-1.5 text-sm text-danger">
            {erros.descricao}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="gasto-projeto" className={ETIQUETA}>
          De que projeto
        </label>
        <select
          id="gasto-projeto"
          name="projetoId"
          defaultValue=""
          className={CAMPO}
        >
          {/* Sem projeto é uma resposta legítima e comum — a Vercel e o Figma
              não são de projeto nenhum. Esses ficam fora da margem de cada
              trabalho, porque existiriam na mesma sem ele. */}
          <option value="">Do estúdio, não é de um projeto</option>
          {projetos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <BotaoGuardar>Registar gasto</BotaoGuardar>
        {estado.erro ? (
          <p role="alert" className="text-sm text-danger">
            {estado.erro}
          </p>
        ) : null}
        {estado.ok ? (
          <p role="status" className="text-sm text-accent">
            Registado.
          </p>
        ) : null}
      </div>
    </form>
  );
}
