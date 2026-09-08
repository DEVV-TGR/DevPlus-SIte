/** docs: docs/07-estudio.md */
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CartaoProjeto } from "@/components/estudio/CartaoProjeto";
import { CARTAO, PASTILHA, SOBRETITULO } from "@/components/estudio/estilos";
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
  return query ? `/estudio?${query}` : "/estudio";
}

export default async function Estudio({
  searchParams,
}: {
  searchParams: Promise<Filtros>;
}) {
  await requerSessao();

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

  const pastilha = (ativa: boolean) =>
    cn(
      PASTILHA,
      "transition-colors",
      ativa
        ? "border-primary/50 bg-primary/10 text-primary"
        : "border-border text-muted hover:border-ink/30 hover:text-ink",
    );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={SOBRETITULO}>Estúdio</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            Projetos
          </h1>
          {projetos.length > 0 ? (
            <p className="mt-1.5 text-sm text-muted">
              {projetos.length}{" "}
              {projetos.length === 1 ? "projeto" : "projetos"} · {emCurso} a
              andar
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
          ) : null}
        </div>

        <Button href="/estudio/projetos/novo">Projeto novo</Button>
      </div>

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
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="sr-only">Filtrar por estado</span>
              <Link
                href={href({ estado, quem }, { estado: "" })}
                className={pastilha(!estado)}
              >
                Todos
              </Link>
              {ESTADOS.map((e: Estado) => (
                <Link
                  key={e}
                  href={href({ estado, quem }, { estado: estado === e ? "" : e })}
                  className={pastilha(estado === e)}
                >
                  {ROTULO_ESTADO[e]}
                </Link>
              ))}
            </div>

            {pessoas.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="sr-only">Filtrar por pessoa</span>
                {pessoas.map((p) => (
                  <Link
                    key={p.id}
                    href={href(
                      { estado, quem },
                      { quem: quem === String(p.id) ? "" : String(p.id) },
                    )}
                    className={pastilha(quem === String(p.id))}
                  >
                    {p.nome}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          {filtrados.length === 0 ? (
            <p className="mt-8 text-sm text-muted">
              Nenhum projeto com este filtro.{" "}
              <Link
                href="/estudio"
                className="underline-offset-4 hover:text-ink hover:underline"
              >
                Ver todos
              </Link>
              .
            </p>
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
