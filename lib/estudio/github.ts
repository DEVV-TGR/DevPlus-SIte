/** docs: docs/07-estudio.md */
import { site } from "@/lib/site";

/**
 * Entrar no Estúdio com a conta do GitHub.
 *
 * O fluxo é o OAuth normal, escrito à mão e **todo do lado do servidor**: o
 * browser nunca fala com a API do GitHub. Isso é o que mantém o
 * `connect-src 'self'` da CSP intacto (ver o comentário em `next.config.ts`) e
 * o que evita arrastar uma biblioteca de autenticação inteira para trocar um
 * código por um token.
 *
 * Só se troca o token por uma coisa — saber quem é a pessoa — e deita-se fora.
 * Não se guarda em lado nenhum: o Estúdio não faz nada no GitHub em nome de
 * ninguém, e um token guardado é só uma coisa a mais que pode fugir.
 */

/**
 * A organização do estúdio no GitHub.
 *
 * Está aqui e não em `lib/site.ts` de propósito: `site.ts` é a identidade
 * pública — o que aparece no site, nos metadados e nos dados estruturados — e a
 * organização nunca aparece em lado nenhum disso. É um detalhe da ferramenta
 * interna, e é aqui que se lê. Ver docs/07.
 */
export const ORGANIZACAO = "DEVV-TGR";

const AUTORIZAR = "https://github.com/login/oauth/authorize";
const TOKEN = "https://github.com/login/oauth/access_token";
const UTILIZADOR = "https://api.github.com/user";

/** O endereço de retorno tem de bater certo, letra a letra, com o que está
 *  registado na OAuth App do GitHub. São dois: o de produção e o de local. Os
 *  deploys de pré-visualização da Vercel não entram — cada um tem um domínio
 *  diferente e não há como os registar todos. Ver docs/07. */
export function urlDeRetorno(): string {
  const base =
    process.env.NODE_ENV === "production" ? site.url : "http://localhost:3000";
  return `${base}/api/estudio/auth/callback`;
}

/** `undefined` quando falta configuração. Quem chama decide o que dizer — a
 *  página de entrada mostra o aviso em vez de um botão que não faria nada. */
export function clientId(): string | undefined {
  return process.env.GITHUB_CLIENT_ID || undefined;
}

export function urlDeAutorizacao(state: string): string {
  const id = clientId();
  if (!id) throw new Error("[estudio] falta o GITHUB_CLIENT_ID");

  const params = new URLSearchParams({
    client_id: id,
    redirect_uri: urlDeRetorno(),
    /* Só o perfil público. O Estúdio não precisa de ler repositórios nem de
       escrever seja o que for — quando o webhook chegar, é a organização que
       nos manda os eventos, não somos nós a ir buscá-los. */
    scope: "read:user",
    state,
    /* Obriga a escolher a conta em vez de entrar em silêncio com a sessão do
       browser. Somos três a partilhar computadores de vez em quando. */
    allow_signup: "false",
  });

  return `${AUTORIZAR}?${params}`;
}

/**
 * Quem pode entrar. A lista vive no ambiente e não na base de dados de
 * propósito: se estivesse na base, quem entrasse uma vez podia acrescentar-se
 * a si próprio. Assim, entrar no Estúdio passa por quem tem acesso à Vercel.
 *
 * Formato: `ESTUDIO_LOGINS=logindoTomas,logindoGoncalo,logindoRodrigo`
 */
export function loginAutorizado(login: string): boolean {
  const lista = (process.env.ESTUDIO_LOGINS ?? "")
    .split(",")
    .map((l) => l.trim().toLowerCase())
    .filter(Boolean);

  /* Lista vazia não deixa entrar ninguém. A alternativa — vazio quer dizer
     "toda a gente" — transformava uma variável esquecida num Estúdio aberto ao
     mundo. */
  if (lista.length === 0) return false;

  return lista.includes(login.toLowerCase());
}

export type UtilizadorGitHub = {
  login: string;
  nome: string;
  avatarUrl: string | null;
};

/** Troca o código pelo token. `null` se o GitHub recusar. */
export async function trocarCodigoPorToken(
  codigo: string,
): Promise<string | null> {
  const id = process.env.GITHUB_CLIENT_ID;
  const segredo = process.env.GITHUB_CLIENT_SECRET;
  if (!id || !segredo) return null;

  const resposta = await fetch(TOKEN, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      client_id: id,
      client_secret: segredo,
      code: codigo,
      redirect_uri: urlDeRetorno(),
    }),
  });

  if (!resposta.ok) return null;

  const corpo: unknown = await resposta.json();
  const token =
    corpo && typeof corpo === "object" && "access_token" in corpo
      ? (corpo as { access_token?: unknown }).access_token
      : undefined;

  return typeof token === "string" && token ? token : null;
}

/** Quem é a pessoa por trás do token. `null` se o GitHub não disser. */
export async function lerUtilizador(
  token: string,
): Promise<UtilizadorGitHub | null> {
  const resposta = await fetch(UTILIZADOR, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "user-agent": site.domain,
    },
  });

  if (!resposta.ok) return null;

  const corpo: unknown = await resposta.json();
  if (!corpo || typeof corpo !== "object") return null;

  const dados = corpo as Record<string, unknown>;
  const login = typeof dados.login === "string" ? dados.login : "";
  if (!login) return null;

  return {
    login,
    /* Nem toda a gente preenche o nome no GitHub. O login é o que existe
       sempre, e serve de nome enquanto não houver outro. */
    nome: typeof dados.name === "string" && dados.name ? dados.name : login,
    avatarUrl: typeof dados.avatar_url === "string" ? dados.avatar_url : null,
  };
}
