/** docs: docs/07-estudio.md */
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { consulta, consultaUma } from "@/lib/estudio/db";
import type { Utilizador } from "@/lib/estudio/tipos";

/**
 * As sessões do Estúdio.
 *
 * O token é aleatório e vive no cookie; na base guarda-se só o **hash**. Quem
 * conseguir ler a tabela `sessoes` não consegue entrar com o que lá está — é a
 * mesma razão por que uma password nunca se guarda em claro.
 */

export const COOKIE = "estudio_sessao";

/** Trinta dias. Somos três pessoas a usar isto todos os dias; obrigar a entrar
 *  de novo a cada semana era atrito sem nada em troca. */
const DURACAO_DIAS = 30;

/** O cookie do `state` do OAuth. Curto: só tem de sobreviver à ida ao GitHub. */
export const COOKIE_STATE = "estudio_oauth_state";
export const DURACAO_STATE_SEGUNDOS = 10 * 60;

function hash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Comparação em tempo constante. Num `state` de OAuth a diferença de tempo do
 *  `===` não dá para explorar na prática, mas a comparação certa custa uma
 *  linha e poupa a discussão. */
export function iguaisEmTempoConstante(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function tokenAleatorio(): string {
  return randomBytes(32).toString("base64url");
}

/** Abre a sessão: grava-a e põe o cookie. Devolve nada — quem chama redireciona. */
export async function abrirSessao(utilizadorId: number): Promise<void> {
  const token = tokenAleatorio();
  const expira = new Date(Date.now() + DURACAO_DIAS * 24 * 60 * 60 * 1000);

  await consulta(
    `insert into sessoes (token_hash, utilizador_id, expira_em)
     values ($1, $2, $3)`,
    [hash(token), utilizadorId, expira],
  );

  /* Aproveita-se a escrita para varrer o que já expirou. Sem isto a tabela só
     cresce, e ninguém se lembra de a limpar à mão. */
  await consulta("delete from sessoes where expira_em < now()");

  const caixa = await cookies();
  caixa.set(COOKIE, token, {
    httpOnly: true,
    /* Em desenvolvimento o site corre em `http://localhost` e um cookie
       `secure` nunca chegaria a ser guardado. */
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expira,
  });
}

export async function fecharSessao(): Promise<void> {
  const caixa = await cookies();
  const token = caixa.get(COOKIE)?.value;

  if (token) {
    await consulta("delete from sessoes where token_hash = $1", [hash(token)]);
  }

  caixa.delete(COOKIE);
}

/**
 * Quem está autenticado, ou `null`.
 *
 * **Sem cookie, devolve `null` sem tocar na base.** É isso que deixa o site
 * compilar e arrancar no CI, onde não há `DATABASE_URL` nenhuma — ver o
 * comentário do topo de `lib/estudio/db.ts`.
 */
export async function sessaoAtual(): Promise<Utilizador | null> {
  const caixa = await cookies();
  const token = caixa.get(COOKIE)?.value;
  if (!token) return null;

  const linha = await consultaUma<{
    id: string;
    github_login: string;
    nome: string;
    avatar_url: string | null;
  }>(
    `select u.id, u.github_login, u.nome, u.avatar_url
       from sessoes s
       join utilizadores u on u.id = s.utilizador_id
      where s.token_hash = $1
        and s.expira_em > now()`,
    [hash(token)],
  );

  if (!linha) return null;

  return {
    id: Number(linha.id),
    githubLogin: linha.github_login,
    nome: linha.nome,
    avatarUrl: linha.avatar_url,
  };
}

/**
 * O guarda de todas as páginas e de todas as ações do Estúdio. Ou devolve quem
 * está autenticado, ou redireciona e não volta.
 *
 * Não há `proxy.ts` a fazer isto por todos: um proxy corre em **todos** os
 * pedidos do site e obrigava as páginas públicas a render dinâmico. Verificar
 * aqui custa uma linha por página e não tira nada ao resto. Ver docs/07.
 */
export async function requerSessao(): Promise<Utilizador> {
  const utilizador = await sessaoAtual();
  if (!utilizador) redirect("/estudio/entrar");
  return utilizador;
}
