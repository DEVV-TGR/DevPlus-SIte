/** docs: docs/07-estudio.md */
import Link from "next/link";
import { FormularioCliente } from "@/components/estudio/FormularioCliente";
import { SeletorDeRepos } from "@/components/estudio/SeletorDeRepos";
import { CARTAO, SOBRETITULO } from "@/components/estudio/estilos";
import { criarCliente } from "@/lib/estudio/acoes";
import { listarClientes, listarProjetosLeves } from "@/lib/estudio/dados";
import { listarRepos } from "@/lib/estudio/repos";
import { requerSessao } from "@/lib/estudio/sessao";

/**
 * Os clientes, e o formulário de acrescentar um.
 *
 * O formulário traz o seletor de trabalhos, e é isso que faz dele a via
 * normal: cria-se o cliente e marcam-se logo os repositórios dele, importados
 * ou não. Está dentro de um `details` porque, aberto de raiz, empurrava a lista
 * de clientes — que é o que se vem cá ver — para fora do ecrã.
 */
export default async function Clientes() {
  await requerSessao();

  const [clientes, projetos, { repos, erro }] = await Promise.all([
    listarClientes(),
    listarProjetosLeves(),
    listarRepos(),
  ]);

  /* Quantos projetos tem cada cliente. Uma passagem pela lista chega — são
     dezenas de projetos, não milhares, e poupa uma consulta à base. */
  const quantos = new Map<number, number>();
  for (const p of projetos) {
    if (p.clienteId === null) continue;
    quantos.set(p.clienteId, (quantos.get(p.clienteId) ?? 0) + 1);
  }

  const semDono = projetos.filter((p) => p.clienteId === null);
  const jaNoEstudio = new Set(
    projetos.map((p) => p.repoUrl).filter((u): u is string => u !== null),
  );
  const porImportar = repos.filter((r) => !jaNoEstudio.has(r.url));

  return (
    <div className="mx-auto max-w-4xl">
      <p className={SOBRETITULO}>Estúdio</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        Clientes
      </h1>

      <details className={`${CARTAO} mt-8`}>
        <summary className="cursor-pointer font-display text-lg font-semibold tracking-tight">
          Cliente novo
        </summary>
        <div className="mt-6">
          <FormularioCliente
            acao={criarCliente}
            rotulo="Acrescentar"
            extra={
              <SeletorDeRepos
                projetos={semDono}
                repos={porImportar}
                erroDoGitHub={erro}
              />
            }
          />
        </div>
      </details>

      <div className="mt-10">
        {clientes.length === 0 ? (
          <div className={CARTAO}>
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Ainda não há clientes.
            </h2>
            <p className="mt-2 text-sm text-muted">
              Abre o &ldquo;Cliente novo&rdquo; aqui em cima. Podes marcar logo
              os repositórios que são dele — os que já estão no Estúdio e os que
              ainda não foram importados.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {clientes.map((c) => {
              const total = quantos.get(c.id) ?? 0;
              return (
                <li key={c.id}>
                  <Link
                    href={`/estudio/clientes/${c.id}`}
                    className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-surface"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.nome}</p>
                      <p className="mt-0.5 truncate text-sm text-muted">
                        {c.email ?? c.telefone ?? "Sem contacto"}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted">
                      {total} {total === 1 ? "projeto" : "projetos"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
