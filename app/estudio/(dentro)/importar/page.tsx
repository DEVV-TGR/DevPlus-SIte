/** docs: docs/07-estudio.md */
import Link from "next/link";
import { FormularioImportar } from "@/components/estudio/FormularioImportar";
import { CARTAO } from "@/components/estudio/estilos";
import { TituloDaPagina } from "@/components/estudio/TituloDaPagina";
import { importarRepos } from "@/lib/estudio/acoes";
import { reposJaNoEstudio } from "@/lib/estudio/dados";
import { ORGANIZACAO } from "@/lib/estudio/github";
import { listarRepos } from "@/lib/estudio/repos";
import { requerSessao } from "@/lib/estudio/sessao";

/**
 * Trazer para o Estúdio os repositórios que já existem na organização.
 *
 * Isto é para os que **já lá estão**. Os que forem criados a partir de agora
 * aparecem sozinhos, pelo webhook em `app/api/estudio/github/webhook`.
 */
export default async function Importar() {
  await requerSessao();

  const [{ repos, erro }, conhecidos] = await Promise.all([
    listarRepos(),
    reposJaNoEstudio(),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <TituloDaPagina
        sobretitulo="Trazer do GitHub"
        titulo="Projetos que já estão no GitHub"
        voltarPara={{ href: "/estudio/projetos", rotulo: "Projetos" }}
        frase={
          <p>
            Tudo o que está guardado no GitHub da {ORGANIZACAO}. Escolhe o que
            passa a ser projeto aqui — vem o nome, o link e a descrição; o
            resto pões tu. Os que se criarem no GitHub a partir de agora
            aparecem sozinhos.
          </p>
        }
      />

      <div className="mt-8">
        {erro ? (
          <div className={CARTAO}>
            <p role="alert" className="text-sm text-danger">
              {erro}
            </p>
            <p className="mt-2 text-sm text-muted">
              Podes criar o projeto à mão em{" "}
              <Link
                href="/estudio/projetos/novo"
                className="underline-offset-4 hover:text-ink hover:underline"
              >
                projeto novo
              </Link>
              .
            </p>
          </div>
        ) : repos.length === 0 ? (
          <div className={CARTAO}>
            <p className="text-sm text-muted">
              O GitHub da {ORGANIZACAO} não tem projetos visíveis. Se os
              que procuras forem privados, é preciso um{" "}
              <code>GITHUB_TOKEN</code> — ver <code>docs/07-estudio.md</code>.
            </p>
          </div>
        ) : (
          <FormularioImportar
            acao={importarRepos}
            repos={repos}
            jaNoEstudio={[...conhecidos]}
          />
        )}
      </div>
    </div>
  );
}
