/** docs: docs/07-estudio.md */
import { Cabecalho } from "@/components/estudio/Cabecalho";
import { requerSessao } from "@/lib/estudio/sessao";

/**
 * O invólucro das secções de dentro do Estúdio: o topo, e por baixo a secção.
 *
 * Um grupo de rotas (`(dentro)`), que não entra no endereço, e que existe para
 * o topo **não** se desenhar outra vez em cada mudança de secção: o Next guarda
 * o layout e só troca a página. A entrada fica fora do grupo, sem topo.
 *
 * ⚠️ **Este layout não é a proteção.** Um layout não volta a correr quando se
 * navega do lado do cliente, por isso cada `page.tsx` e cada ação continuam a
 * chamar o seu `requerSessao()`. O `sessaoAtual` está em `cache()`, e a segunda
 * pergunta no mesmo render não vai à base.
 *
 * ## Mas manda para a entrada quem não tem sessão, e é por causa do `loading`
 *
 * Com o `loading.tsx` deste grupo, o Next começa a mandar a resposta logo — com
 * o estado 200 — e um `redirect` que só acontecesse na página chegava a meio do
 * corpo. O teste de fumo do CI, que pede 307 em `/estudio` sem cookie, passava
 * a falhar. O layout corre antes de a resposta começar, e um `redirect` aqui é
 * um 307 a sério. Aprendido no painel do Café Preguiça, onde aconteceu.
 */
export default async function LayoutDeDentro({
  children,
}: {
  children: React.ReactNode;
}) {
  const utilizador = await requerSessao();

  return (
    <>
      <Cabecalho utilizador={utilizador} />
      {/* `relative` para o risco da transição (`template.tsx`) se encostar à
          linha de baixo do topo. */}
      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {children}
      </main>
    </>
  );
}
