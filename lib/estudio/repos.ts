/** docs: docs/07-estudio.md */
import { ORGANIZACAO } from "@/lib/estudio/github";
import { site } from "@/lib/site";

/**
 * Os repositórios da organização, lidos da API do GitHub.
 *
 * **Sem token nenhum.** Os repositórios do `DEVV-TGR` são públicos, e a API
 * pública devolve-os a quem perguntar — não é preciso alargar o `scope` da
 * OAuth App, nem guardar o token de quem entra, nem criar um PAT. O Estúdio
 * continua a saber do GitHub apenas quem tu és.
 *
 * O `GITHUB_TOKEN` é opcional e serve para duas coisas: ver repositórios
 * privados, e subir o limite de pedidos de 60 por hora (por IP, sem token) para
 * 5000. Enquanto forem todos públicos e formos três pessoas, não faz falta.
 */

export type RepoGitHub = {
  nome: string;
  nomeCompleto: string;
  descricao: string | null;
  url: string;
  /** O site que o repositório declara, se declarar algum. Vira `deploy_url`. */
  homepage: string | null;
  privado: boolean;
  /** `YYYY-MM-DD` do último push. Serve para ordenar por vida, não por nome. */
  ultimoPush: string;
};

export type ResultadoRepos =
  | { repos: RepoGitHub[]; erro?: undefined }
  | { repos: []; erro: string };

type LinhaApi = {
  name?: unknown;
  full_name?: unknown;
  description?: unknown;
  html_url?: unknown;
  homepage?: unknown;
  private?: unknown;
  pushed_at?: unknown;
};

function texto(valor: unknown): string | null {
  return typeof valor === "string" && valor.trim() ? valor.trim() : null;
}

export async function listarRepos(): Promise<ResultadoRepos> {
  const cabecalhos: Record<string, string> = {
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
    /* O GitHub recusa pedidos sem `user-agent`. */
    "user-agent": site.domain,
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) cabecalhos.authorization = `Bearer ${token}`;

  try {
    const resposta = await fetch(
      `https://api.github.com/orgs/${ORGANIZACAO}/repos?per_page=100&sort=pushed&direction=desc`,
      {
        headers: cabecalhos,
        /* Cinco minutos de cache. Sem token são 60 pedidos por hora por IP, e
           um recarregar da página por cada projeto que se importa gastava-os
           depressa. Cinco minutos é mais fresco do que a paciência de quem está
           a importar. */
        next: { revalidate: 300 },
      },
    );

    if (!resposta.ok) {
      /* Nunca o corpo da resposta no log — pode trazer o token no eco de um
         erro de autenticação. Só o código. */
      console.error(`[estudio] o GitHub devolveu ${resposta.status} nos repos`);

      if (resposta.status === 403 || resposta.status === 429)
        return {
          repos: [],
          erro: "O GitHub cortou os pedidos por agora. Tenta daqui a bocado.",
        };

      if (resposta.status === 404)
        return {
          repos: [],
          erro: `Não encontrámos a organização ${ORGANIZACAO} no GitHub.`,
        };

      return { repos: [], erro: "O GitHub não respondeu como devia." };
    }

    const corpo: unknown = await resposta.json();
    if (!Array.isArray(corpo))
      return { repos: [], erro: "O GitHub respondeu numa forma inesperada." };

    const repos = corpo
      .map((linha: LinhaApi): RepoGitHub | null => {
        const nome = texto(linha.name);
        const nomeCompleto = texto(linha.full_name);
        const url = texto(linha.html_url);
        if (!nome || !nomeCompleto || !url) return null;

        return {
          nome,
          nomeCompleto,
          descricao: texto(linha.description),
          url,
          homepage: texto(linha.homepage),
          privado: linha.private === true,
          ultimoPush: texto(linha.pushed_at)?.slice(0, 10) ?? "",
        };
      })
      .filter((r): r is RepoGitHub => r !== null);

    return { repos };
  } catch (erro) {
    console.error("[estudio] falhou ler os repos:", erro);
    return { repos: [], erro: "Não foi possível falar com o GitHub." };
  }
}
