/** docs: docs/07-estudio.md */
import { CartaoCliente } from "@/components/estudio/CartaoCliente";
import { FormularioCliente } from "@/components/estudio/FormularioCliente";
import { SeletorDeRepos } from "@/components/estudio/SeletorDeRepos";
import { CARTAO, SOBRETITULO } from "@/components/estudio/estilos";
import { criarCliente } from "@/lib/estudio/acoes";
import { listarClientes, listarProjetosLeves } from "@/lib/estudio/dados";
import { listarRepos } from "@/lib/estudio/repos";
import { requerSessao } from "@/lib/estudio/sessao";
import type { ProjetoLeve } from "@/lib/estudio/tipos";

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

  /* Os projetos de cada cliente. Uma passagem pela lista chega — são dezenas de
     projetos, não milhares, e poupa uma consulta à base. Agrupar nomes em vez
     de os contar não muda essa conta, e nenhum euro é somado aqui: a regra de
     somar em SQL continua de pé porque não há nada para somar. */
  const trabalhos = new Map<number, ProjetoLeve[]>();
  for (const p of projetos) {
    if (p.clienteId === null) continue;
    const lista = trabalhos.get(p.clienteId);
    if (lista) lista.push(p);
    else trabalhos.set(p.clienteId, [p]);
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
          /* Duas colunas e não três, ao contrário da lista de projetos: esta
             página está presa a `max-w-4xl` por causa do formulário lá de cima,
             e a três os cartões ficavam com ~285px — o suficiente para cortar
             ao meio exatamente os nomes de projeto que vieram cá fazer falta.
             É a mesma grelha que a ficha do cliente já usa para os projetos
             dele. */
          <ul className="grid gap-4 sm:grid-cols-2">
            {clientes.map((c) => (
              <CartaoCliente
                key={c.id}
                cliente={c}
                projetos={trabalhos.get(c.id) ?? []}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
