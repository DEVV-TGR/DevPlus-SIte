/** docs: docs/07-estudio.md */
import { Button } from "@/components/ui/Button";
import { Numero } from "@/components/estudio/Bloco";
import { SubNavegacao, type SeccaoFinanceira } from "@/components/estudio/SubNavegacao";
import { TituloDaPagina } from "@/components/estudio/TituloDaPagina";
import { CARTAO } from "@/components/estudio/estilos";
import { resumoDoMes } from "@/lib/estudio/dados";
import { formatarEuros } from "@/lib/estudio/tipos";
import { cn } from "@/lib/utils";

/**
 * A cabeça das duas páginas das Finanças: o título, os três números do mês e
 * os separadores Receitas · Gastos.
 *
 * Os números são os mesmos nas duas páginas, e de propósito: quem vai registar
 * um gasto quer ver logo quanto já saiu este mês, e quem olha para as receitas
 * quer saber quanto falta receber. Vêm do `resumoDoMes()`, a mesma conta do
 * cartão do Resumo — somada em SQL, como todas.
 *
 * É um componente de servidor que vai à base sozinho. As duas páginas chamam-no
 * em paralelo com as suas próprias leituras, porque o React resolve os dois
 * `await` ao mesmo tempo dentro do mesmo render.
 */
export async function CabecaDasFinancas({ atual }: { atual: SeccaoFinanceira }) {
  const mes = await resumoDoMes();

  return (
    <>
      <TituloDaPagina
        titulo="Finanças"
        frase="O dinheiro que entra e o que sai do estúdio. Todos os valores são sem IVA."
        accoes={
          atual === "gastos" ? (
            <Button href="/estudio/financas/gastos?novo=1#registar">
              Registar gasto
            </Button>
          ) : null
        }
      />

      <div className={cn(CARTAO, "mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4")}>
        <Numero
          rotulo="Entrou este mês"
          valor={formatarEuros(mes.entrou)}
          tom={mes.entrou > 0 ? "bom" : undefined}
        />
        <Numero rotulo="Saiu este mês" valor={formatarEuros(mes.saiu)} />
        <Numero
          rotulo="Sobrou este mês"
          valor={formatarEuros(mes.saldo)}
          tom={mes.saldo > 0 ? "bom" : mes.saldo < 0 ? "mau" : undefined}
        />
        <Numero
          rotulo="Falta receber"
          valor={formatarEuros(mes.porCobrar)}
          nota={
            mes.projetosPorCobrar > 0
              ? `de ${mes.projetosPorCobrar} ${mes.projetosPorCobrar === 1 ? "projeto" : "projetos"}`
              : undefined
          }
          tom={mes.porCobrar > 0 ? "atencao" : undefined}
        />
      </div>

      <SubNavegacao atual={atual} />
    </>
  );
}
