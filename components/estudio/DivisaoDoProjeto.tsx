/** docs: docs/07-estudio.md */
"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { BotaoGuardar } from "@/components/estudio/BotaoGuardar";
import { CAMPO, ETIQUETA } from "@/components/estudio/estilos";
import type { EstadoDivisao } from "@/lib/estudio/acoes";
import {
  formatarEuros,
  formatarPercentagem,
  type ProjetoADividir,
  type Socio,
} from "@/lib/estudio/tipos";

/**
 * De quem é a margem deste projeto, e o sítio onde isso se muda.
 *
 * Em cima a conta — a margem, e quanto dela vai para cada um —, em baixo o
 * formulário. A conta vem feita do servidor (`partesDoProjeto()`), para ser a
 * mesma que a página Finanças › Divisão mostra; aqui não se reparte nada.
 *
 * "Partes iguais" é a regra e não se escreve. As caixas das percentagens só
 * aparecem "à medida", que é a exceção: um projeto em que alguém não entrou.
 */
export function DivisaoDoProjeto({
  acao,
  projeto,
  socios,
  pesos,
  margens,
  agora,
  prevista,
  fechado,
}: {
  acao: (anterior: EstadoDivisao, form: FormData) => Promise<EstadoDivisao>;
  projeto: ProjetoADividir;
  socios: Socio[];
  pesos: number[];
  margens: { agora: number; prevista: number };
  agora: number[];
  prevista: number[];
  fechado: boolean;
}) {
  const [estado, submeter] = useActionState<EstadoDivisao, FormData>(acao, {});
  const [aMedida, setAMedida] = useState(projeto.partes !== null);
  const erros = estado.erros ?? {};

  /* Com previsão só quando há diferença: num projeto entregue e pago, "agora"
     e "se pagarem tudo" são o mesmo número duas vezes. */
  const comPrevisao = !fechado && margens.prevista !== margens.agora;

  return (
    <section aria-labelledby="divisao">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="divisao"
          className="font-display text-lg font-semibold tracking-tight"
        >
          Divisão
        </h2>
        {fechado ? null : (
          <span className="text-xs text-primary">
            Em desenvolvimento — é uma estimativa
          </span>
        )}
      </div>

      <p className="mt-1 text-sm text-muted">
        O que o cliente pagou pelo projeto menos o que se gastou nele. O
        alojamento e o domínio ficam de fora.
      </p>

      {socios.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          Ainda não há ninguém na divisão. Junta as pessoas em{" "}
          <Link
            href="/estudio/financas/divisao"
            className="text-ink underline underline-offset-4"
          >
            Finanças › Divisão
          </Link>
          .
        </p>
      ) : (
        <>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div>
              <dt className="text-xs text-muted">Margem agora</dt>
              <dd className="mt-0.5 text-sm font-medium tabular-nums">
                {formatarEuros(margens.agora)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Se pagarem tudo</dt>
              <dd className="mt-0.5 text-sm font-medium tabular-nums text-muted">
                {formatarEuros(margens.prevista)}
              </dd>
            </div>
          </dl>

          <ul className="mt-4 divide-y divide-border border-y border-border">
            {socios.map((s, i) => (
              <li key={s.id} className="flex items-baseline gap-3 py-2.5">
                <span className="min-w-0 flex-1 truncate text-sm">
                  {s.nome}
                  {projeto.comissao?.socioId === s.id ? (
                    <span className="text-muted">
                      {" "}
                      · comissão de {formatarPercentagem(projeto.comissao.pct)}
                    </span>
                  ) : null}
                </span>
                <span className="w-16 shrink-0 text-right text-xs tabular-nums text-muted">
                  {formatarPercentagem(Math.round(pesos[i] * 100) / 100)}
                </span>
                <span className="w-24 shrink-0 text-right text-sm font-medium tabular-nums">
                  {formatarEuros(agora[i])}
                  {comPrevisao ? (
                    <span className="block text-xs font-normal text-muted">
                      até {formatarEuros(prevista[i])}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>

          <form action={submeter} className="mt-5 space-y-5" noValidate>
            <input type="hidden" name="projetoId" value={projeto.id} />

            <fieldset>
              <legend className={ETIQUETA}>
                Comissão <span className="text-muted">(a quem arranjou o cliente)</span>
              </legend>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
                <select
                  name="comissaoSocio"
                  aria-label="Quem fica com a comissão"
                  defaultValue={projeto.comissao?.socioId ?? ""}
                  className={CAMPO}
                >
                  <option value="">Sem comissão</option>
                  {socios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
                <input
                  name="comissaoPct"
                  inputMode="decimal"
                  placeholder="15"
                  aria-label="Comissão em percentagem"
                  defaultValue={
                    projeto.comissao
                      ? String(projeto.comissao.pct).replace(".", ",")
                      : ""
                  }
                  className={`${CAMPO} tabular-nums`}
                  aria-invalid={erros.comissao ? true : undefined}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted">
                Sai da margem antes das partes, e o resto divide-se a seguir.
              </p>
              {erros.comissao ? (
                <p role="alert" className="mt-1.5 text-sm text-danger">
                  {erros.comissao}
                </p>
              ) : null}
            </fieldset>

            <fieldset>
              <legend className={ETIQUETA}>Partes</legend>
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="modo"
                    value="iguais"
                    checked={!aMedida}
                    onChange={() => setAMedida(false)}
                  />
                  Partes iguais por toda a gente
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="modo"
                    value="medida"
                    checked={aMedida}
                    onChange={() => setAMedida(true)}
                  />
                  À medida — alguém não entrou, ou entrou menos
                </label>
              </div>

              {aMedida ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {socios.map((s) => {
                    const escrita = projeto.partes?.find((x) => x.socioId === s.id);
                    return (
                      <div key={s.id}>
                        <label htmlFor={`parte-${s.id}`} className="mb-1 block text-xs text-muted">
                          {s.nome} (%)
                        </label>
                        <input
                          id={`parte-${s.id}`}
                          name={`parte-${s.id}`}
                          inputMode="decimal"
                          placeholder="0"
                          defaultValue={
                            escrita
                              ? String(escrita.pct).replace(".", ",")
                              : projeto.partes
                                ? "0"
                                : String(
                                    Math.round((100 / socios.length) * 100) / 100,
                                  ).replace(".", ",")
                          }
                          className={`${CAMPO} tabular-nums`}
                          aria-invalid={erros.partes ? true : undefined}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : null}
              {aMedida ? (
                <p className="mt-1.5 text-xs text-muted">
                  Do que sobra depois da comissão. Somam 100.
                </p>
              ) : null}
              {erros.partes ? (
                <p role="alert" className="mt-1.5 text-sm text-danger">
                  {erros.partes}
                </p>
              ) : null}
            </fieldset>

            <div className="flex flex-wrap items-center gap-4">
              <BotaoGuardar>Guardar a divisão</BotaoGuardar>
              {estado.ok ? (
                <p role="status" className="text-sm text-accent">
                  Guardado
                </p>
              ) : null}
              {estado.erro ? (
                <p role="alert" className="text-sm text-danger">
                  {estado.erro}
                </p>
              ) : null}
            </div>
          </form>
        </>
      )}
    </section>
  );
}
