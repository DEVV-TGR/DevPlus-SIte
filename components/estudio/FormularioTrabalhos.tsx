/** docs: docs/07-estudio.md */
"use client";

import { useActionState } from "react";
import { BotaoGuardar } from "@/components/estudio/BotaoGuardar";
import type { EstadoCliente } from "@/lib/estudio/acoes";
import type { RepoGitHub } from "@/lib/estudio/repos";
import type { ProjetoLeve } from "@/lib/estudio/tipos";
import { SeletorDeRepos } from "@/components/estudio/SeletorDeRepos";

/**
 * O seletor de trabalhos na ficha de um cliente que já existe.
 *
 * É o caminho para o caso invulgar: o repositório nasceu depois do cliente. O
 * caso comum — já existir quando se cria o cliente — resolve-se no formulário
 * de cliente novo, sem passar por aqui.
 */
export function FormularioTrabalhos({
  acao,
  clienteId,
  projetos,
  repos,
  jaDoCliente,
  erroDoGitHub,
}: {
  acao: (anterior: EstadoCliente, form: FormData) => Promise<EstadoCliente>;
  clienteId: number;
  projetos: ProjetoLeve[];
  repos: RepoGitHub[];
  jaDoCliente: number[];
  erroDoGitHub?: string;
}) {
  const [estado, submeter] = useActionState<EstadoCliente, FormData>(acao, {});

  return (
    <form action={submeter} className="space-y-5">
      <input type="hidden" name="clienteId" value={clienteId} />

      <SeletorDeRepos
        projetos={projetos}
        repos={repos}
        jaDoCliente={jaDoCliente}
        erroDoGitHub={erroDoGitHub}
      />

      <div className="flex flex-wrap items-center gap-4">
        <BotaoGuardar>Guardar trabalhos</BotaoGuardar>

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
  );
}
