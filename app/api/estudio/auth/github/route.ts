/** docs: docs/07-estudio.md */
import { cookies } from "next/headers";
import { clientId, urlDeAutorizacao } from "@/lib/estudio/github";
import {
  COOKIE_STATE,
  DURACAO_STATE_SEGUNDOS,
  tokenAleatorio,
} from "@/lib/estudio/sessao";

/**
 * O primeiro passo do OAuth: manda a pessoa ao GitHub.
 *
 * O `state` é um valor aleatório que sai daqui num cookie e volta na query. Se
 * os dois não baterem certo, o pedido de volta não foi este que o começou — é o
 * que impede alguém de te entregar um link de retorno já preparado e te pôr a
 * entrar na conta dele sem dares por isso.
 *
 * Como em `app/api/contacto/route.ts`, não há `export const dynamic`: no Next 16
 * um handler que lê cookies nunca é cacheado.
 */
export async function GET(request: Request) {
  if (!clientId()) {
    console.error("[estudio] falta o GITHUB_CLIENT_ID");
    return Response.redirect(
      new URL("/estudio/entrar?erro=config", request.url),
      302,
    );
  }

  const state = tokenAleatorio();

  const caixa = await cookies();
  caixa.set(COOKIE_STATE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_STATE_SEGUNDOS,
  });

  return Response.redirect(urlDeAutorizacao(state), 302);
}
