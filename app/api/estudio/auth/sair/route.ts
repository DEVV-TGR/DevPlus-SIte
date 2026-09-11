/** docs: docs/07-estudio.md */
import { fecharSessao } from "@/lib/estudio/sessao";

/**
 * Sair.
 *
 * É `POST` e não `GET` de propósito: um `GET` que apaga a sessão é disparado
 * por qualquer `<img src="/api/estudio/auth/sair">` numa página qualquer, e
 * punha-te fora do Estúdio a partir de fora dele. O `sameSite: "lax"` do cookie
 * já não deixa um POST de outro domínio chegar cá com a sessão.
 *
 * Aterra em `/` e não em `/estudio/entrar`. Quem sai do Estúdio saiu da
 * ferramenta; devolvê-lo ao ecrã de entrada é oferecer-lhe logo a porta por
 * onde acabou de passar, e não é isso que quem sai quer ver. O `303` é que
 * converte este POST no GET da página seguinte.
 */
export async function POST(request: Request) {
  await fecharSessao();
  return Response.redirect(new URL("/", request.url), 303);
}
