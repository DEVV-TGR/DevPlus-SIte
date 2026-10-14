/** docs: docs/07-estudio.md */
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Abas } from "@/components/estudio/Abas";
import { Bloco, TopoDoBloco, Vazio } from "@/components/estudio/Bloco";
import { CartaoProjeto } from "@/components/estudio/CartaoProjeto";
import { FormularioCliente } from "@/components/estudio/FormularioCliente";
import { FormularioTrabalhos } from "@/components/estudio/FormularioTrabalhos";
import { Icone } from "@/components/estudio/Icone";
import { CARTAO } from "@/components/estudio/estilos";
import { TituloDaPagina } from "@/components/estudio/TituloDaPagina";
import {
  apagarCliente,
  definirProjetosDoCliente,
  guardarCliente,
} from "@/lib/estudio/acoes";
import {
  listarProjetosLeves,
  obterCliente,
  projetosDoCliente,
  receitasDoCliente,
} from "@/lib/estudio/dados";
import { listarRepos } from "@/lib/estudio/repos";
import { requerSessao } from "@/lib/estudio/sessao";
import {
  formatarEuros,
  hojeEmLisboa,
  ROTULO_CURTO,
  ROTULO_RECEITA,
} from "@/lib/estudio/tipos";

/**
 * A ficha de um cliente, em duas abas: os **projetos** dele (e o que paga de
 * alojamento e domínio), e os **dados** — os contactos, as notas e o apagar.
 *
 * Os contactos sobem para a cabeça, como ligações: o que se vem buscar à
 * ficha de um cliente é, quase sempre, o número para lhe ligar.
 */
const ABAS = [
  { chave: "projetos", rotulo: "Projetos" },
  { chave: "dados", rotulo: "Dados" },
] as const;

type Aba = (typeof ABAS)[number]["chave"];

function lerAba(valor: string | undefined): Aba {
  return ABAS.some((a) => a.chave === valor) ? (valor as Aba) : "projetos";
}

export default async function ClienteFicha({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aba?: string }>;
}) {
  await requerSessao();

  const { id } = await params;
  const numero = Number(id);
  if (!Number.isInteger(numero) || numero <= 0) notFound();

  const aba = lerAba((await searchParams).aba);

  const cliente = await obterCliente(numero);
  if (!cliente) notFound();

  const [projetos, leves, receitas, { repos, erro }] = await Promise.all([
    projetosDoCliente(cliente.id),
    listarProjetosLeves(),
    receitasDoCliente(cliente.id),
    listarRepos(),
  ]);

  const hoje = hojeEmLisboa();

  const ativas = receitas.filter(
    (r) => r.desde <= hoje && (r.ate === null || r.ate >= hoje),
  );

  /* O seletor mostra os que não têm dono e os que já são deste — os deste
     entram marcados, e desmarcá-los é como se lhes tira o cliente. */
  const atribuiveis = leves.filter(
    (p) => p.clienteId === null || p.clienteId === cliente.id,
  );
  const jaDoCliente = leves
    .filter((p) => p.clienteId === cliente.id)
    .map((p) => p.id);

  const jaNoEstudio = new Set(
    leves.map((p) => p.repoUrl).filter((u): u is string => u !== null),
  );
  const porImportar = repos.filter((r) => !jaNoEstudio.has(r.url));

  const base = `/estudio/clientes/${cliente.id}`;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <TituloDaPagina
        sobretitulo="Cliente"
        titulo={cliente.nome}
        voltarPara={{ href: "/estudio/clientes", rotulo: "Clientes" }}
        frase={
          cliente.telefone || cliente.email ? (
            <ul className="mt-1 flex flex-wrap gap-2">
              {cliente.telefone ? (
                <li>
                  <a
                    href={`tel:${cliente.telefone.replace(/\s+/g, "")}`}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-sm text-ink transition-colors hover:border-ink/30"
                  >
                    <Icone nome="telefone" tamanho={14} className="text-muted" />
                    {cliente.telefone}
                  </a>
                </li>
              ) : null}
              {cliente.email ? (
                <li>
                  <a
                    href={`mailto:${cliente.email}`}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-sm text-ink transition-colors hover:border-ink/30"
                  >
                    <Icone nome="email" tamanho={14} className="text-muted" />
                    {cliente.email}
                  </a>
                </li>
              ) : null}
            </ul>
          ) : (
            <p>
              Sem contactos.{" "}
              <Link
                href={`${base}?aba=dados`}
                className="underline-offset-4 hover:text-ink hover:underline"
              >
                Acrescentar
              </Link>
            </p>
          )
        }
      />

      <Abas
        rotulo="Partes do cliente"
        base={base}
        atual={aba}
        abas={ABAS.map((a) => ({
          ...a,
          conta: a.chave === "projetos" ? projetos.length : undefined,
        }))}
      />

      {aba === "projetos" ? (
        <>
          {projetos.length === 0 ? (
            <Vazio
              accao={
                <Button href="/estudio/projetos/novo" variant="outline">
                  Criar um projeto
                </Button>
              }
            >
              Ainda não há trabalho para este cliente. Junta-lhe um projeto que
              já exista, aqui em baixo, ou cria um de raiz.
            </Vazio>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {projetos.map((p) => (
                <CartaoProjeto key={p.id} projeto={p} hoje={hoje} />
              ))}
            </ul>
          )}

          <div className="grid items-start gap-4 lg:grid-cols-2">
            {/* Só de leitura: o sítio onde se escrevem é a ficha de cada
                projeto, porque o alojamento é *daquele site*. Aqui vê-se o que
                o cliente paga ao todo. */}
            <Bloco aria-labelledby="paga">
              <TopoDoBloco
                id="paga"
                icone="financas"
                titulo="O que paga todos os meses ou anos"
                sub="Alojamento e domínio, sem IVA"
              />
              {ativas.length === 0 ? (
                <Vazio>
                  Nada que se repita. O alojamento e o domínio de cada site
                  escrevem-se na aba Dinheiro do projeto.
                </Vazio>
              ) : (
                <ul className="divide-y divide-border border-y border-border">
                  {ativas.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-baseline justify-between gap-3 py-2.5 text-sm"
                    >
                      <Link
                        href={`/estudio/projetos/${r.projetoId}?aba=dinheiro`}
                        className="min-w-0 truncate underline-offset-4 hover:text-ink hover:underline"
                      >
                        {ROTULO_RECEITA[r.tipo]}
                        <span className="text-muted"> · {r.projetoNome}</span>
                      </Link>
                      <span className="shrink-0 tabular-nums text-accent">
                        {formatarEuros(r.valor)}
                        <span className="text-muted">
                          {" "}
                          /{ROTULO_CURTO[r.periodicidade]}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Bloco>

            <Bloco aria-labelledby="juntar">
              <TopoDoBloco
                id="juntar"
                icone="projetos"
                titulo="Juntar ou tirar projetos"
                sub="Marca os que são deste cliente"
              />
              <details className="group">
                <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-1.5 rounded-full border border-border px-3.5 text-sm text-muted transition-colors hover:border-ink/30 hover:text-ink [&::-webkit-details-marker]:hidden">
                  <Icone nome="mais" tamanho={14} />
                  <span className="group-open:hidden">Escolher projetos</span>
                  <span className="hidden group-open:inline">Fechar</span>
                </summary>
                <div className="mt-5">
                  <FormularioTrabalhos
                    acao={definirProjetosDoCliente}
                    clienteId={cliente.id}
                    projetos={atribuiveis}
                    repos={porImportar}
                    jaDoCliente={jaDoCliente}
                    erroDoGitHub={erro}
                  />
                </div>
              </details>
            </Bloco>
          </div>
        </>
      ) : null}

      {aba === "dados" ? (
        <>
          <section className={CARTAO}>
            <h2 className="sr-only">Dados do cliente</h2>
            <FormularioCliente acao={guardarCliente} cliente={cliente} />
          </section>

          <details className="border-t border-border pt-6">
            <summary className="cursor-pointer text-sm text-muted transition-colors hover:text-ink">
              Apagar este cliente
            </summary>
            <div className="mt-4">
              <p className="text-sm text-muted">
                Os projetos ficam — passam apenas a não ter cliente. Os
                contactos e as notas desaparecem.
              </p>
              <form action={apagarCliente} className="mt-3">
                <input type="hidden" name="id" value={cliente.id} />
                <button
                  type="submit"
                  className="rounded-full border border-danger/40 px-4 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
                >
                  Apagar {cliente.nome}
                </button>
              </form>
            </div>
          </details>
        </>
      ) : null}
    </div>
  );
}
