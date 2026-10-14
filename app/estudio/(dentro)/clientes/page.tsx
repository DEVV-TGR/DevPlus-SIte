/** docs: docs/07-estudio.md */
import { CartaoCliente } from "@/components/estudio/CartaoCliente";
import { FormularioCliente } from "@/components/estudio/FormularioCliente";
import { SeletorDeRepos } from "@/components/estudio/SeletorDeRepos";
import { Button } from "@/components/ui/Button";
import { Vazio } from "@/components/estudio/Bloco";
import { Icone } from "@/components/estudio/Icone";
import { CARTAO, TITULO_CARTAO } from "@/components/estudio/estilos";
import { TituloDaPagina } from "@/components/estudio/TituloDaPagina";
import { criarCliente } from "@/lib/estudio/acoes";
import { listarClientes, listarProjetosLeves } from "@/lib/estudio/dados";
import { listarRepos } from "@/lib/estudio/repos";
import { requerSessao } from "@/lib/estudio/sessao";
import type { ProjetoLeve } from "@/lib/estudio/tipos";
import { cn } from "@/lib/utils";

/**
 * Os clientes, e o formulário de acrescentar um.
 *
 * O formulário traz o seletor de trabalhos, e é isso que faz dele a via
 * normal: cria-se o cliente e marcam-se logo os repositórios dele, importados
 * ou não. Está dentro de um `details` porque, aberto de raiz, empurrava a lista
 * de clientes — que é o que se vem cá ver — para fora do ecrã.
 *
 * Três colunas desde 2026-10-14: a página deixou o `max-w-4xl` que o formulário
 * lhe impunha, e a largura toda dá cartões de ~380px, que é mais do que as duas
 * colunas de antes davam.
 */
export default async function Clientes({
  searchParams,
}: {
  searchParams: Promise<{ novo?: string }>;
}) {
  await requerSessao();

  /* O "Cliente novo" das ações do título leva aqui com `?novo=1`, e o
     formulário abre já aberto. Sem ele continua fechado, porque aberto de raiz
     empurrava a lista — que é o que se vem cá ver — para fora do ecrã. */
  const aberto = (await searchParams).novo === "1";

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
    <div className="space-y-8">
      <TituloDaPagina
        titulo="Clientes"
        frase="As pessoas e as empresas para quem trabalhamos. Abre um cliente para ver os projetos dele e os contactos."
        accoes={
          <Button href="/estudio/clientes?novo=1#novo">Cliente novo</Button>
        }
      />

      <details id="novo" open={aberto} className={cn(CARTAO, "group scroll-mt-6")}>
        <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
          <span
            aria-hidden
            className="grid size-9 flex-none place-items-center rounded-lg bg-primary/10 text-primary"
          >
            <Icone nome="mais" tamanho={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className={cn(TITULO_CARTAO, "block")}>Acrescentar um cliente</span>
            <span className="block text-sm text-muted">
              O nome chega. Os contactos e os projetos dele podem vir depois.
            </span>
          </span>
          <span className="text-sm text-muted group-open:hidden">Abrir</span>
          <span className="hidden text-sm text-muted group-open:inline">Fechar</span>
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

      {clientes.length === 0 ? (
        <Vazio
          accao={
            <Button href="/estudio/clientes?novo=1#novo" variant="outline">
              Acrescentar o primeiro
            </Button>
          }
        >
          Ainda não há clientes. Ao acrescentar um, podes marcar logo os projetos
          que são dele — os que já estão no Estúdio e os que ainda só estão no
          GitHub.
        </Vazio>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
  );
}
