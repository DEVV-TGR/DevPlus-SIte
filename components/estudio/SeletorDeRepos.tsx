/** docs: docs/07-estudio.md */
import type { RepoGitHub } from "@/lib/estudio/repos";
import type { ProjetoLeve } from "@/lib/estudio/tipos";

/**
 * A lista de trabalhos que se podem atribuir a um cliente.
 *
 * Mistura duas coisas de propósito, porque para quem está a usar são a mesma:
 *
 * - **projetos** que já existem no Estúdio e ainda não têm dono (ou que já são
 *   deste cliente, e aparecem marcados)
 * - **repositórios** do GitHub que ainda ninguém importou — marcar um destes
 *   cria o projeto e liga-o ao cliente de uma vez
 *
 * Sem esta mistura era preciso importar primeiro e ligar depois, e essa ordem
 * é a única coisa que obrigava a passar por dois ecrãs para fazer uma coisa só.
 *
 * Não é um componente de cliente: são caixas de formulário normais, e quem
 * submete é o `<form>` que o envolve. Sem JavaScript, funciona na mesma.
 */
export function SeletorDeRepos({
  projetos,
  repos,
  jaDoCliente,
  erroDoGitHub,
}: {
  /** Projetos atribuíveis: os sem cliente e os que já são deste. */
  projetos: ProjetoLeve[];
  /** Repositórios do GitHub que ainda não estão no Estúdio. */
  repos: RepoGitHub[];
  /** Ids dos projetos que já pertencem a este cliente — entram marcados. */
  jaDoCliente?: number[];
  erroDoGitHub?: string;
}) {
  const marcados = new Set(jaDoCliente ?? []);
  const nada = projetos.length === 0 && repos.length === 0;

  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-medium">
        Trabalhos deste cliente
      </legend>
      <p className="mb-3 text-xs text-muted">
        Marca os que são dele. Os que ainda não estiverem no Estúdio são criados
        agora, a partir do GitHub.
      </p>

      {nada ? (
        <p className="text-sm text-muted">
          Não há projetos por atribuir nem repositórios por importar.
        </p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {projetos.map((p) => (
            <li key={`projeto-${p.id}`}>
              <label className="flex items-start gap-3 py-2.5 hover:bg-surface">
                <input
                  type="checkbox"
                  name="projetos"
                  value={p.id}
                  defaultChecked={marcados.has(p.id)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{p.nome}</span>
                  <span className="block text-xs text-muted">
                    {marcados.has(p.id)
                      ? "já é deste cliente — desmarca para tirar"
                      : "já está no Estúdio, sem cliente"}
                  </span>
                </span>
              </label>
            </li>
          ))}

          {repos.map((r) => (
            <li key={`repo-${r.nomeCompleto}`}>
              <label className="flex items-start gap-3 py-2.5 hover:bg-surface">
                <input
                  type="checkbox"
                  name="repos"
                  value={r.nomeCompleto}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{r.nome}</span>
                  <span className="block text-xs text-muted">
                    {r.descricao ?? "no GitHub, ainda não está no Estúdio"}
                  </span>
                </span>
                <span className="shrink-0 self-center rounded-full border border-border px-2 py-0.5 text-[0.6875rem] text-muted">
                  GitHub
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {erroDoGitHub ? (
        <p className="mt-3 text-xs text-muted">
          Não deu para ler os repositórios do GitHub ({erroDoGitHub}) — aqui em
          cima estão só os projetos que já existem no Estúdio.
        </p>
      ) : null}
    </fieldset>
  );
}
