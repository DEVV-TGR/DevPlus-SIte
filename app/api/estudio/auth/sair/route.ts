/** docs: docs/07-estudio.md */
import { fecharSessao } from "@/lib/estudio/sessao";

/**
 * Sair.
 *
 * É `POST` e não `GET` de propósito: um `GET` que apaga a sessão é disparado
 * por qualquer `<img src="/api/estudio/auth/sair">` numa página qualquer, e
 * punha-te fora do Estúdio a partir de fora dele. O `sameSite: "lax"` do cookie
 * já não deixa um POST de outro domínio chegar cá com a sessão.
 */
export async function POST(request: Request) {
  await fecharSessao();
  return Response.redirect(new URL("/estudio/entrar", request.url), 303);
}
