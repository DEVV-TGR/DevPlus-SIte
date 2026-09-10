/** docs: docs/07-estudio.md */
import Link from "next/link";
import { pastilhaFiltro } from "@/components/estudio/estilos";
import { PERIODOS, ROTULO_PERIODO, type Periodo } from "@/lib/estudio/tipos";

/**
 * Escolher o período de um gráfico do resumo.
 *
 * **São links e não botões, e o estado vive no endereço.** O Estúdio inteiro
 * funciona sem JavaScript de cliente, e um seletor com estado obrigava a tornar
 * a página de cliente — o que arrastaria consigo as consultas todas. Assim o
 * servidor volta a correr a consulta com o período novo, e a página continua a
 * ser o que já era.
 *
 * Ter o período no endereço traz de borla três coisas que um `useState` não
 * dava: um `/estudio?saidas=ano` é partilhável, o botão de voltar do browser
 * funciona, e recarregar não perde a escolha.
 *
 * A `ancora` existe porque sem ela cada clique atirava a página para o topo, e
 * o gráfico que se está a filtrar fica a meio. Com ela, volta-se ao sítio.
 */
export function SeletorDePeriodo({
  parametro,
  atual,
  outros,
  ancora,
  descreve,
}: {
  /** Qual dos dois gráficos este seletor manda: `entradas` ou `saidas`. */
  parametro: string;
  atual: Periodo;
  /** Os outros parâmetros do endereço, para não se perderem ao clicar aqui —
   *  é isto que deixa os dois gráficos ter períodos independentes. */
  outros: Record<string, Periodo>;
  /** O `id` da secção a que este seletor pertence. */
  ancora: string;
  /** Para quem ouve a página: "Período das despesas". */
  descreve: string;
}) {
  function endereco(periodo: Periodo): string {
    const params = new URLSearchParams();

    /* O valor por omissão não vai para o endereço. `/estudio` e
       `/estudio?saidas=mes` mostram a mesma coisa, e um endereço que só tem o
       que foi mesmo escolhido lê-se melhor quando se partilha. */
    for (const [chave, valor] of Object.entries({
      ...outros,
      [parametro]: periodo,
    })) {
      if (valor !== "mes") params.set(chave, valor);
    }

    const query = params.toString();
    return `/estudio${query ? `?${query}` : ""}#${ancora}`;
  }

  return (
    <div
      role="group"
      aria-label={descreve}
      className="flex flex-wrap items-center gap-1.5"
    >
      {PERIODOS.map((periodo) => {
        const escolhido = periodo === atual;

        return (
          <Link
            key={periodo}
            href={endereco(periodo)}
            /* `aria-current` e não só a cor: quem não distingue o contorno tem
               de conseguir saber na mesma qual é o período que está a ver. */
            aria-current={escolhido ? "true" : undefined}
            className={pastilhaFiltro(escolhido)}
          >
            {ROTULO_PERIODO[periodo]}
          </Link>
        );
      })}
    </div>
  );
}
