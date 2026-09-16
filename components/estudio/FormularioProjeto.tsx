/** docs: docs/07-estudio.md */
"use client";

import { useActionState } from "react";
import { BotaoGuardar } from "@/components/estudio/BotaoGuardar";
import { CAMPO, ETIQUETA } from "@/components/estudio/estilos";
import type { EstadoProjeto } from "@/lib/estudio/acoes";
import {
  ESTADOS,
  ROTULO_ESTADO,
  type Cliente,
  type Projeto,
  type Utilizador,
} from "@/lib/estudio/tipos";

/**
 * O formulário de um projeto — o mesmo para criar e para editar. A diferença é
 * a ação que lhe chega por prop e o `id` escondido.
 *
 * Não há validação de browser a duplicar a de `lib/estudio/validacao.ts`: o
 * `<form>` não leva `required` nem `pattern`, porque a mensagem que o browser
 * inventa não é a nossa e muda de língua com o sistema da pessoa. Quem valida é
 * a ação, e as mensagens voltam daqui a pouco escritas em português nosso.
 */

function Erro({ id, mensagem }: { id: string; mensagem?: string }) {
  if (!mensagem) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-danger">
      {mensagem}
    </p>
  );
}

export function FormularioProjeto({
  acao,
  projeto,
  clientes,
  pessoas,
  rotulo = "Guardar",
}: {
  acao: (anterior: EstadoProjeto, form: FormData) => Promise<EstadoProjeto>;
  projeto?: Projeto;
  clientes: Cliente[];
  pessoas: Utilizador[];
  rotulo?: string;
}) {
  const [estado, submeter] = useActionState<EstadoProjeto, FormData>(acao, {});
  const erros = estado.erros ?? {};

  const jaEscolhido = new Set(projeto?.responsaveis.map((r) => r.id) ?? []);

  return (
    <form action={submeter} className="space-y-6" noValidate>
      {projeto ? <input type="hidden" name="id" value={projeto.id} /> : null}

      <div>
        <label htmlFor="nome" className={ETIQUETA}>
          Nome do projeto
        </label>
        <input
          id="nome"
          name="nome"
          defaultValue={projeto?.nome ?? ""}
          className={CAMPO}
          aria-invalid={erros.nome ? true : undefined}
          aria-describedby={erros.nome ? "erro-nome" : undefined}
        />
        <Erro id="erro-nome" mensagem={erros.nome} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="clienteId" className={ETIQUETA}>
            Cliente
          </label>
          <select
            id="clienteId"
            name="clienteId"
            defaultValue={projeto?.clienteId ?? ""}
            className={CAMPO}
          >
            <option value="">Sem cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="estado" className={ETIQUETA}>
            Estado
          </label>
          <select
            id="estado"
            name="estado"
            defaultValue={projeto?.estado ?? "proposta"}
            className={CAMPO}
            aria-invalid={erros.estado ? true : undefined}
            aria-describedby={erros.estado ? "erro-estado" : undefined}
          >
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {ROTULO_ESTADO[e]}
              </option>
            ))}
          </select>
          <Erro id="erro-estado" mensagem={erros.estado} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="progresso" className={ETIQUETA}>
            Progresso (%)
          </label>
          <input
            id="progresso"
            name="progresso"
            type="number"
            min={0}
            max={100}
            step={5}
            inputMode="numeric"
            defaultValue={projeto?.progresso ?? 0}
            className={CAMPO}
            aria-invalid={erros.progresso ? true : undefined}
            aria-describedby={erros.progresso ? "erro-progresso" : undefined}
          />
          <Erro id="erro-progresso" mensagem={erros.progresso} />
        </div>

        <div>
          <label htmlFor="inicio" className={ETIQUETA}>
            Início
          </label>
          <input
            id="inicio"
            name="inicio"
            type="date"
            defaultValue={projeto?.inicio ?? ""}
            className={CAMPO}
            aria-invalid={erros.inicio ? true : undefined}
            aria-describedby={erros.inicio ? "erro-inicio" : undefined}
          />
          <Erro id="erro-inicio" mensagem={erros.inicio} />
        </div>

        <div>
          <label htmlFor="prazo" className={ETIQUETA}>
            Prazo
          </label>
          <input
            id="prazo"
            name="prazo"
            type="date"
            defaultValue={projeto?.prazo ?? ""}
            className={CAMPO}
            aria-invalid={erros.prazo ? true : undefined}
            aria-describedby={erros.prazo ? "erro-prazo" : undefined}
          />
          <Erro id="erro-prazo" mensagem={erros.prazo} />
        </div>
      </div>

      <fieldset>
        {/* `legend` e não um `h2`: isto rotula um grupo de campos, e um título
            de secção aqui mentia sobre a estrutura da página. Ver docs/04. */}
        <legend className={ETIQUETA}>Quem está no projeto</legend>

        {pessoas.length === 0 ? (
          <p className="text-sm text-muted">
            Ainda só entraste tu. À medida que os outros entrarem no Estúdio,
            aparecem aqui para escolheres.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {pessoas.map((p) => (
              <li key={p.id}>
                {/* Uma caixa por pessoa, todas com o mesmo `name`. Escolhe-se à
                    mão — ninguém é atribuído automaticamente. Ver docs/07. */}
                <label className="flex cursor-pointer items-center gap-2 rounded-full border border-border-strong px-3.5 py-2 text-sm transition-colors hover:border-ink/40 has-[:checked]:border-primary/50 has-[:checked]:bg-primary/10 has-[:checked]:text-primary">
                  <input
                    type="checkbox"
                    name="responsaveis"
                    value={p.id}
                    defaultChecked={jaEscolhido.has(p.id)}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                  {p.nome}
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="repoUrl" className={ETIQUETA}>
            Repositório
          </label>
          <input
            id="repoUrl"
            name="repoUrl"
            type="url"
            placeholder="https://github.com/…"
            defaultValue={projeto?.repoUrl ?? ""}
            className={CAMPO}
            aria-invalid={erros.repoUrl ? true : undefined}
            aria-describedby={erros.repoUrl ? "erro-repoUrl" : undefined}
          />
          <Erro id="erro-repoUrl" mensagem={erros.repoUrl} />
        </div>

        <div>
          <label htmlFor="deployUrl" className={ETIQUETA}>
            Site no ar
          </label>
          <input
            id="deployUrl"
            name="deployUrl"
            type="url"
            placeholder="https://…"
            defaultValue={projeto?.deployUrl ?? ""}
            className={CAMPO}
            aria-invalid={erros.deployUrl ? true : undefined}
            aria-describedby={erros.deployUrl ? "erro-deployUrl" : undefined}
          />
          <Erro id="erro-deployUrl" mensagem={erros.deployUrl} />
        </div>
      </div>

      <div>
        <label htmlFor="notas" className={ETIQUETA}>
          Notas
        </label>
        <textarea
          id="notas"
          name="notas"
          rows={5}
          defaultValue={projeto?.notas ?? ""}
          className={`${CAMPO} resize-y`}
          aria-invalid={erros.notas ? true : undefined}
          aria-describedby={erros.notas ? "erro-notas" : undefined}
        />
        <Erro id="erro-notas" mensagem={erros.notas} />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <BotaoGuardar>{rotulo}</BotaoGuardar>

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
