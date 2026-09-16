/** docs: docs/07-estudio.md */
"use client";

import { useActionState } from "react";
import { BotaoGuardar } from "@/components/estudio/BotaoGuardar";
import { CAMPO, ETIQUETA } from "@/components/estudio/estilos";
import type { EstadoImportacao } from "@/lib/estudio/acoes";
import type { RepoGitHub } from "@/lib/estudio/repos";
import { ESTADOS, ROTULO_ESTADO } from "@/lib/estudio/tipos";
import { cn } from "@/lib/utils";

/**
 * A lista de repositórios da organização, para escolher quais viram projeto.
 *
 * Os que já estão no Estúdio aparecem desativados e assinalados — não se
 * escondem. Um repositório que desaparecia da lista deixava a pessoa a
 * perguntar-se se se enganou a ler; assim vê-se que está lá e porquê.
 */
export function FormularioImportar({
  acao,
  repos,
  jaNoEstudio,
}: {
  acao: (
    anterior: EstadoImportacao,
    form: FormData,
  ) => Promise<EstadoImportacao>;
  repos: RepoGitHub[];
  jaNoEstudio: string[];
}) {
  const [estado, submeter] = useActionState<EstadoImportacao, FormData>(
    acao,
    {},
  );

  const conhecidos = new Set(jaNoEstudio);
  const porTrazer = repos.filter((r) => !conhecidos.has(r.url));

  return (
    <form action={submeter} className="space-y-6">
      <div className="max-w-xs">
        <label htmlFor="estado-importacao" className={ETIQUETA}>
          Trazer com o estado
        </label>
        <select
          id="estado-importacao"
          name="estado"
          defaultValue="em-curso"
          className={CAMPO}
        >
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {ROTULO_ESTADO[e]}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-muted">
          Aplica-se a todos os que trouxeres agora. Depois muda-se um a um.
        </p>
      </div>

      <fieldset>
        <legend className="sr-only">Repositórios a trazer</legend>

        <ul className="divide-y divide-border border-y border-border">
          {repos.map((r) => {
            const dentro = conhecidos.has(r.url);

            return (
              <li key={r.nomeCompleto}>
                <label
                  className={cn(
                    "flex items-start gap-3 py-3",
                    dentro
                      ? "cursor-default opacity-55"
                      : "cursor-pointer hover:bg-surface",
                  )}
                >
                  <input
                    type="checkbox"
                    name="repos"
                    value={r.nomeCompleto}
                    disabled={dentro}
                    defaultChecked={!dentro}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{r.nome}</span>
                      {r.privado ? (
                        <span className="rounded-full border border-border px-2 py-0.5 text-[0.6875rem] text-muted">
                          privado
                        </span>
                      ) : null}
                      {dentro ? (
                        <span className="rounded-full border border-accent/40 px-2 py-0.5 text-[0.6875rem] text-accent">
                          já no Estúdio
                        </span>
                      ) : null}
                    </span>

                    {r.descricao ? (
                      <span className="mt-0.5 block text-sm text-muted">
                        {r.descricao}
                      </span>
                    ) : (
                      <span className="mt-0.5 block text-sm text-muted/70">
                        Sem descrição no GitHub
                      </span>
                    )}
                  </span>

                  <span className="shrink-0 text-xs tabular-nums text-muted">
                    {r.ultimoPush}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <BotaoGuardar aGuardar="A trazer…">
          {porTrazer.length > 0
            ? `Trazer ${porTrazer.length} ${porTrazer.length === 1 ? "repositório" : "repositórios"}`
            : "Trazer os escolhidos"}
        </BotaoGuardar>

        {estado.erro ? (
          <p role="alert" className="text-sm text-danger">
            {estado.erro}
          </p>
        ) : null}

        {estado.criados !== undefined ? (
          <p role="status" className="text-sm text-accent">
            {estado.criados === 0
              ? "Não havia nada de novo para trazer."
              : `${estado.criados} ${estado.criados === 1 ? "projeto criado" : "projetos criados"}.`}
            {estado.ignorados ? ` ${estado.ignorados} já lá estavam.` : ""}
          </p>
        ) : null}
      </div>
    </form>
  );
}
