/** docs: docs/07-estudio.md */
import { cookies } from "next/headers";
import { consultaUma } from "@/lib/estudio/db";
import {
  lerUtilizador,
  loginAutorizado,
  trocarCodigoPorToken,
} from "@/lib/estudio/github";
import {
  abrirSessao,
  COOKIE_STATE,
  iguaisEmTempoConstante,
} from "@/lib/estudio/sessao";

/**
 * O regresso do GitHub. Sete portas por ordem, e a pessoa só entra se passar as
 * sete:
 *
 * 1. o GitHub não recusou (`?error=` ausente)
 * 2. veio um `code`
 * 3. veio um `state` e havia um cookie de `state`
 * 4. os dois são iguais
 * 5. o código troca-se por um token
 * 6. o token diz quem é a pessoa
 * 7. **esse login está em `ESTUDIO_LOGINS`**
 *
 * A sétima é a que interessa: as seis primeiras só provam que a pessoa tem uma
 * conta no GitHub, e isso tem toda a gente.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);

  const paraEntrar = (erro: string) =>
    Response.redirect(new URL(`/estudio/entrar?erro=${erro}`, request.url), 302);

  const caixa = await cookies();
  const stateGuardado = caixa.get(COOKIE_STATE)?.value;
  /* De uso único: gasta-se aqui, aconteça o que acontecer a seguir. */
  caixa.delete(COOKIE_STATE);

  if (url.searchParams.get("error")) return paraEntrar("recusado");

  const codigo = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!codigo || !state || !stateGuardado) return paraEntrar("estado");
  if (!iguaisEmTempoConstante(state, stateGuardado)) return paraEntrar("estado");

  const token = await trocarCodigoPorToken(codigo);
  if (!token) {
    console.error("[estudio] o GitHub não trocou o código por um token");
    return paraEntrar("github");
  }

  const perfil = await lerUtilizador(token);
  if (!perfil) {
    console.error("[estudio] o GitHub não devolveu o perfil");
    return paraEntrar("github");
  }

  if (!loginAutorizado(perfil.login)) {
    /* O login é público e é ele que explica a recusa quando alguém perguntar
       porque é que não entrou. Não há aqui dado nenhum que não esteja à vista
       na página de perfil da pessoa. */
    console.warn(`[estudio] entrada recusada a @${perfil.login}`);
    return paraEntrar("naoAutorizado");
  }

  try {
    /* O nome e o avatar são atualizados a cada entrada: se alguém mudar a foto
       no GitHub, o Estúdio acompanha sem ninguém ter de mexer na base. */
    const linha = await consultaUma<{ id: string }>(
      `insert into utilizadores (github_login, nome, avatar_url)
       values ($1, $2, $3)
       on conflict (github_login)
       do update set nome = excluded.nome, avatar_url = excluded.avatar_url
       returning id`,
      [perfil.login.toLowerCase(), perfil.nome, perfil.avatarUrl],
    );

    if (!linha) return paraEntrar("base");

    await abrirSessao(Number(linha.id));
  } catch (erro) {
    console.error("[estudio] falhou abrir a sessão:", erro);
    return paraEntrar("base");
  }

  return Response.redirect(new URL("/estudio", request.url), 302);
}
