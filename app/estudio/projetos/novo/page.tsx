/** docs: docs/07-estudio.md */
import Link from "next/link";
import { FormularioProjeto } from "@/components/estudio/FormularioProjeto";
import { SOBRETITULO } from "@/components/estudio/estilos";
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
      <Link
        href="/estudio"
        className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
      >
        ← Projetos
      </Link>

      <p className={`${SOBRETITULO} mt-6`}>Novo</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        Um projeto novo
      </h1>
      <p className="mt-1.5 text-sm text-muted">
        Só o nome é obrigatório. O resto acrescenta-se à medida que se souber.
      </p>

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
