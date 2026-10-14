/** docs: docs/07-estudio.md */
import { FormularioProjeto } from "@/components/estudio/FormularioProjeto";
import { TituloDaPagina } from "@/components/estudio/TituloDaPagina";
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

      <div className="mt-8">
        <FormularioProjeto
          acao={criarProjeto}
          clientes={clientes}
          pessoas={pessoas}
          rotulo="Criar projeto"
        />
      </div>
    </div>
  );
}
