/** docs: docs/07-estudio.md */
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CARTAO, SOBRETITULO } from "@/components/estudio/estilos";
import { clientId } from "@/lib/estudio/github";
import { sessaoAtual } from "@/lib/estudio/sessao";

/**
 * A porta do Estúdio.
 *
 * **Esta página tem de renderizar sem base de dados nenhuma.** É a única do
 * Estúdio que o CI vê a responder 200, e o CI corre sem segredos — se ela
 * precisasse da `DATABASE_URL`, o site deixava de compilar no GitHub por causa
 * de uma página interna. Daí `sessaoAtual()`, que sem cookie devolve `null` sem
 * tocar em nada.
 */

/* As mensagens vêm todas daqui e nunca do URL: a query só traz um código, e um
   código desconhecido cai na mensagem genérica. Escrever na página o que vem no
   endereço era deixar qualquer pessoa compor o aviso que lhe apetecesse. */
const MENSAGENS: Record<string, string> = {
  config:
    "O Estúdio ainda não está ligado ao GitHub. Falta preencher o GITHUB_CLIENT_ID.",
  recusado: "Cancelaste a entrada no GitHub. Podes tentar de novo.",
  estado: "O pedido demorou demasiado e caducou. Tenta entrar outra vez.",
  github: "O GitHub não respondeu como devia. Tenta daqui a pouco.",
  naoAutorizado:
    "Essa conta do GitHub não está na lista de quem pode entrar no Estúdio.",
  base: "Não foi possível abrir a sessão. Tenta outra vez.",
};

export default async function Entrar({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  if (await sessaoAtual()) redirect("/estudio");

  const { erro } = await searchParams;
  const mensagem = erro
    ? (MENSAGENS[erro] ?? "Não foi possível entrar. Tenta outra vez.")
    : null;

  const configurado = Boolean(clientId());

  return (
    <div className="mx-auto max-w-md py-12 sm:py-20">
      <div className={CARTAO}>
        <p className={SOBRETITULO}>Estúdio</p>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">
          Onde organizamos o nosso trabalho.
        </h1>
        <p className="mt-2 text-sm text-muted">
          Entra com a tua conta do GitHub. Só entram as contas que estão na
          lista do estúdio.
        </p>

        {mensagem ? (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-danger/40 px-4 py-3 text-sm text-danger"
          >
            {mensagem}
          </p>
        ) : null}

        <div className="mt-6">
          {configurado ? (
            /* Um link, não um formulário: é uma navegação para outro domínio, e
               o `form-action 'self'` da CSP não deixaria um POST sair daqui. */
            <Button href="/api/estudio/auth/github" className="w-full">
              Entrar com o GitHub
            </Button>
          ) : (
            <p className="text-sm text-muted">
              Falta configurar o <code>GITHUB_CLIENT_ID</code>. Vê o{" "}
              <code>.env.example</code> e o <code>docs/07-estudio.md</code>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
