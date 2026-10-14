/** docs: docs/07-estudio.md */
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Vazio } from "@/components/estudio/Bloco";
import { CartaoProjeto } from "@/components/estudio/CartaoProjeto";
import { CARTAO, pastilhaFiltro } from "@/components/estudio/estilos";
import { TituloDaPagina } from "@/components/estudio/TituloDaPagina";
import { listarProjetos, listarUtilizadores } from "@/lib/estudio/dados";
import { requerSessao } from "@/lib/estudio/sessao";
import {
  emAtraso,
  ESTADOS,
  hojeEmLisboa,
  ROTULO_ESTADO,
  type Estado,
} from "@/lib/estudio/tipos";
import { cn } from "@/lib/utils";

/**
 * Tudo o que temos em mãos, por ordem de atenção: o que está a andar primeiro,
 * o que já acabou por último. A ordem vem da base — ver `ORDEM` em
 * `lib/estudio/dados.ts`.
 *
 * Esta lista esteve em `/estudio` até o resumo lhe ocupar o lugar. Mudou de
 * endereço, não de conteúdo.
 *
 * Os filtros são links com `searchParams`, não estado no browser. Assim o
 * endereço filtrado partilha-se e sobrevive a um refresh, e a página continua a
 * ser de servidor — sem um único componente de cliente nesta lista.
 */

type Filtros = { estado?: string; quem?: string };

/** Constrói o link de um filtro, mantendo o outro. Clicar no que já está
 *  escolhido desliga-o — é o que uma pastilha de filtro deve fazer. */
function href(atual: Filtros, mudanca: Filtros): string {
  const params = new URLSearchParams();
  const estado = mudanca.estado ?? atual.estado;
  const quem = mudanca.quem ?? atual.quem;

  if (estado) params.set("estado", estado);
  if (quem) params.set("quem", quem);

  const query = params.toString();
  return query ? `/estudio/projetos?${query}` : "/estudio/projetos";
}

export default async function Projetos({
  searchParams,
}: {
  searchParams: Promise<Filtros>;
}) {
  const utilizador = await requerSessao();

  const [{ estado, quem }, projetos, pessoas] = await Promise.all([
    searchParams,
    listarProjetos(),
    listarUtilizadores(),
  ]);

  const hoje = hojeEmLisboa();

  const filtrados = projetos.filter((p) => {
    if (estado && p.estado !== estado) return false;
    if (quem && !p.responsaveis.some((r) => String(r.id) === quem)) return false;
    return true;
  });

  const atrasados = projetos.filter((p) => emAtraso(p, hoje)).length;
  const emCurso = projetos.filter((p) => p.estado === "em-curso").length;
  const aEspera = projetos.filter((p) => p.estado === "a-espera").length;
  const porVisitar = projetos.filter((p) => p.estado === "visita").length;

  return (
    <>
      <TituloDaPagina
        titulo="Projetos"
        frase={
          projetos.length > 0 ? (
            <p>
              Todos os trabalhos do estúdio. Abre um para ver as tarefas, o
              dinheiro e os dados dele.
              <br />
              {projetos.length}{" "}
              {projetos.length === 1 ? "projeto" : "projetos"} · {emCurso} a
              andar
              {porVisitar > 0 ? (
                <>
                  {" · "}
                  <span className="text-primary">
                    {porVisitar} por visitar
                  </span>
                </>
              ) : null}
              {aEspera > 0 ? (
                <>
                  {" · "}
                  <span className="text-primary">
                    {aEspera} à espera de resposta
                  </span>
                </>
              ) : null}
              {atrasados > 0 ? (
                <>
                  {" · "}
                  <span className="font-medium text-danger">
                    {atrasados}{" "}
                    {atrasados === 1 ? "atrasado" : "atrasados"}
                  </span>
                </>
              ) : null}
            </p>
          ) : null
        }
        accoes={
          /* O "Importar" mora aqui, ao lado do "Projeto novo": são as duas
             formas de um projeto entrar no Estúdio, e é aqui que se procuram. */
          <>
            <Button href="/estudio/importar" variant="outline">
              Trazer do GitHub
            </Button>
            <Button href="/estudio/projetos/novo">Projeto novo</Button>
          </>
        }
      />

      {projetos.length === 0 ? (
        /* O vazio diz o que fazer a seguir, não pede desculpa. Ver docs/04,
           "Secções que se escondem sozinhas". */
        <div className={cn(CARTAO, "mt-8 text-center")}>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Ainda não há nada aqui.
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Cria o primeiro projeto e este ecrã passa a ser o sítio onde se vê o
            que está a andar, quem o está a fazer e o que falta.
          </p>
          <div className="mt-5">
            <Button href="/estudio/projetos/novo">Criar o primeiro</Button>
          </div>
        </div>
      ) : (
        <>
          {/* Os filtros. Em cima os estados, cada um com quantos tem — é
              assim que se percebe de relance onde está o trabalho. Em baixo,
              de quem: "Os meus" primeiro, porque é a pergunta de quem abre a
              página, e depois cada pessoa. */}
          <div className="mt-8 space-y-3">
            <nav
              aria-label="Filtrar por estado"
              className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <ul className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1">
                {[
                  { chave: "", rotulo: "Todos", conta: projetos.length },
                  ...ESTADOS.map((e: Estado) => ({
                    chave: e as string,
                    rotulo: ROTULO_ESTADO[e],
                    conta: projetos.filter((p) => p.estado === e).length,
                  })),
                ].map((f) => {
                  const escolhido = (estado ?? "") === f.chave;
                  return (
                    <li key={f.chave || "todos"} className="flex-none">
                      <Link
                        href={href({ estado, quem }, { estado: f.chave })}
                        aria-current={escolhido ? "page" : undefined}
                        className={cn(
                          "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-sm whitespace-nowrap transition-colors duration-200",
                          escolhido
                            ? "bg-surface-2 font-medium text-ink ring-1 ring-border-strong"
                            : "text-muted hover:text-ink",
                          f.conta === 0 && !escolhido && "opacity-60",
                        )}
                      >
                        {f.rotulo}
                        <span className="text-xs tabular-nums text-muted">
                          {f.conta}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {pessoas.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-xs text-muted">De quem:</span>
                <Link
                  href={href({ estado, quem }, { quem: "" })}
                  className={pastilhaFiltro(!quem)}
                >
                  Toda a gente
                </Link>
                <Link
                  href={href(
                    { estado, quem },
                    { quem: quem === String(utilizador.id) ? "" : String(utilizador.id) },
                  )}
                  className={pastilhaFiltro(quem === String(utilizador.id))}
                >
                  Os meus
                </Link>
                {pessoas
                  .filter((p) => p.id !== utilizador.id)
                  .map((p) => (
                    <Link
                      key={p.id}
                      href={href(
                        { estado, quem },
                        { quem: quem === String(p.id) ? "" : String(p.id) },
                      )}
                      className={pastilhaFiltro(quem === String(p.id))}
                    >
                      {p.nome}
                    </Link>
                  ))}
              </div>
            ) : null}
          </div>

          {filtrados.length === 0 ? (
            <div className="mt-6">
              <Vazio
                accao={
                  <Button href="/estudio/projetos" variant="outline">
                    Ver todos os projetos
                  </Button>
                }
              >
                Nenhum projeto com este filtro.
              </Vazio>
            </div>
          ) : (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtrados.map((p) => (
                <CartaoProjeto key={p.id} projeto={p} hoje={hoje} />
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
