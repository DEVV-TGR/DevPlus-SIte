/** docs: docs/07-estudio.md */
import Link from "next/link";
import type { Cliente, ProjetoLeve } from "@/lib/estudio/tipos";

/* Quantos trabalhos cabem no cartão antes de virar "e mais uns quantos".
   Três é o que deixa os cartões de alturas parecidas na mesma linha sem
   esconder o essencial — quem tem quatro sites reconhece-se pelos três
   primeiros. */
const MOSTRA = 3;

/**
 * Um cliente na lista. O cartão inteiro é o link — ver docs/04: o alvo de
 * clique é o cartão, não um "ver mais" ao canto.
 *
 * Era uma linha numa lista `divide-y`, e o problema não era o aspeto: é que
 * **não se lia como uma coisa em que se carrega**. Só mudava de fundo ao passar
 * o rato, e ninguém passa o rato por cima de uma linha de texto à espera de
 * descobrir que é um botão. Um cartão com contorno próprio diz o que é parado.
 *
 * Os nomes dos projetos e não a contagem: "3 projetos" obriga a entrar para
 * saber quais são, e a pergunta que se faz a olhar para uma lista de clientes é
 * quase sempre "qual deles é o do restaurante?".
 *
 * Com uma exceção que só se vê com os dados reais à frente: aqui a maioria dos
 * projetos **chama-se como o cliente**. "A Barraquinha Nova" com "A Barraquinha
 * Nova" por baixo não informa ninguém — é o título do cartão outra vez, em
 * cinzento. Esses saltam, e se não sobrar nenhum diz-se quantos são, que é a
 * única coisa que ainda faltava saber. Um "Site Império Auto Concept" fica,
 * porque o "Site" distingue-o de um dia haver lá outra coisa.
 */
export function CartaoCliente({
  cliente,
  projetos,
}: {
  cliente: Cliente;
  projetos: ProjetoLeve[];
}) {
  const mesmoNome = (nome: string) =>
    nome.trim().toLocaleLowerCase("pt-PT") ===
    cliente.nome.trim().toLocaleLowerCase("pt-PT");

  const dizemAlgo = projetos.filter((p) => !mesmoNome(p.nome));
  const mostrados = dizemAlgo.slice(0, MOSTRA);
  const restantes = dizemAlgo.length - mostrados.length;

  return (
    <li>
      {/* `h-full` para os cartões da mesma linha acabarem à mesma altura: o
          número de projetos varia de cliente para cliente, e sem isto a grelha
          ficava aos degraus. */}
      <Link
        href={`/estudio/clientes/${cliente.id}`}
        className="block h-full rounded-2xl border border-border bg-surface p-5 transition-colors duration-300 hover:border-ink/20"
      >
        <h3 className="truncate font-display text-lg font-semibold tracking-tight">
          {cliente.nome}
        </h3>
        <p className="mt-0.5 truncate text-sm text-muted">
          {cliente.email ?? cliente.telefone ?? "Sem contacto"}
        </p>

        {projetos.length === 0 ? (
          <p className="mt-4 text-xs text-muted">Ainda sem trabalhos.</p>
        ) : mostrados.length === 0 ? (
          <p className="mt-4 text-xs text-muted">
            {projetos.length}
            {projetos.length === 1 ? " trabalho" : " trabalhos"}
          </p>
        ) : (
          <ul className="mt-4 space-y-1">
            {mostrados.map((p) => (
              <li key={p.id} className="truncate text-xs text-muted">
                {p.nome}
              </li>
            ))}
            {restantes > 0 ? (
              <li className="text-xs text-muted">
                e mais {restantes}
                {restantes === 1 ? " trabalho" : " trabalhos"}
              </li>
            ) : null}
          </ul>
        )}
      </Link>
    </li>
  );
}
