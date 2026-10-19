/** docs: docs/07-estudio.md */
import { FormularioProjeto } from "@/components/estudio/FormularioProjeto";
import { CARTAO } from "@/components/estudio/estilos";
import { TituloDaPagina } from "@/components/estudio/TituloDaPagina";
import { cn } from "@/lib/utils";
import { criarProjeto } from "@/lib/estudio/acoes";
import { listarClientes, listarUtilizadores } from "@/lib/estudio/dados";
import { requerSessao } from "@/lib/estudio/sessao";

export default async function ProjetoNovo() {
  await requerSessao();

  const [clientes, pessoas] = await Promise.all([
    listarClientes(),
    listarUtilizadores(),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <TituloDaPagina
        sobretitulo="Novo"
        titulo="Um projeto novo"
        voltarPara={{ href: "/estudio/projetos", rotulo: "Projetos" }}
        frase="Só o nome é obrigatório. O resto acrescenta-se à medida que se souber."
      />

      <section className={cn(CARTAO, "mt-8")}>
        <h2 className="sr-only">Dados do projeto novo</h2>
        <FormularioProjeto
          acao={criarProjeto}
          clientes={clientes}
          pessoas={pessoas}
          rotulo="Criar projeto"
        />
      </section>
    </div>
  );
}
