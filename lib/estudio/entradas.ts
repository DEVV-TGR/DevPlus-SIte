/** docs: docs/07-estudio.md */
import { headers } from "next/headers";
import { consulta } from "@/lib/estudio/db";
import { aparelhoDe } from "@/lib/estudio/aparelho";
import type { ComoEntrou } from "@/lib/estudio/tipos";

/**
 * Anotar quem entrou, saiu, teve a sessão terminada ou foi recusado — o
 * histórico da aba Sessões.
 *
 * É uma escrita, e vive fora do `acoes.ts` pela mesma razão que o
 * `sessao.ts`: não é uma Server Action, é chamada a meio da entrada e da saída.
 * As leituras estão no `dados.ts`, como todas.
 *
 * ## Anotar nunca impede ninguém de entrar
 *
 * O registo é para consultar, não é um trinco. Se a escrita falhar, quem estava
 * a entrar entra na mesma e a falha fica no registo da Vercel (`[estudio]`).
 * Por isso isto nunca atira.
 *
 * ## O que fica, e o que não fica
 *
 * O login do GitHub, o nome que já está em `utilizadores`, e o aparelho em duas
 * palavras (`aparelhoDe`). **O IP não fica.** E as linhas com mais de um ano
 * apagam-se a cada escrita — para três pessoas é histórico de sobra, e uma
 * tabela que só cresce é uma tabela de que ninguém se lembra até custar.
 */
export async function anotar({
  como,
  githubLogin,
  utilizadorId = null,
  aparelho,
}: {
  como: ComoEntrou;
  githubLogin: string;
  utilizadorId?: number | null;
  /** Só vem de fora quando a linha é sobre **outro** aparelho — uma sessão
   *  terminada a partir deste. Nos outros casos é o do pedido. */
  aparelho?: string | null;
}): Promise<void> {
  try {
    const deste =
      aparelho === undefined
        ? aparelhoDe((await headers()).get("user-agent"))
        : aparelho;

    await consulta(
      `insert into entradas (github_login, utilizador_id, como, aparelho)
       values ($1, $2, $3, $4)`,
      [githubLogin.toLowerCase(), utilizadorId, como, deste],
    );
    await consulta(
      `delete from entradas where quando < now() - interval '1 year'`,
    );
  } catch (erro) {
    console.error(`[estudio] não foi possível anotar a entrada (${como}):`, erro);
  }
}
