/** docs: docs/01-marca.md — o domínio vem de lib/site.ts. */
import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";

/**
 * `lastModified` só onde existe uma data verdadeira, que hoje é o `updatedAt`
 * de um caso de estudo — e nenhum o tem ainda.
 *
 * A versão anterior punha a data da build em todas as URLs, o que anunciava ao
 * Google que o site inteiro mudou de cada vez que se faz deploy: um sinal falso
 * vale menos do que sinal nenhum. A saída não é arranjar outra data qualquer —
 * o `year` de `lib/projects.ts` daria `2026-01-01` a seis projetos, e o git
 * daria a mesma data a todos, porque vivem no mesmo ficheiro. É `updatedAt`,
 * escrito à mão quando o texto muda de facto.
 *
 * As páginas fixas não têm equivalente e por isso continuam sem data. Ausência
 * é uma resposta legítima: o Google trata-a como "não sei", não como "nunca
 * mudou". Ver docs/01.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/servicos",
    "/portfolio",
    "/sobre",
    "/contacto",
    "/privacidade",
  ].map((path) => ({
    url: `${site.url}${path}`,
    priority: path === "" ? 1 : 0.8,
  }));

  const caseStudies = projects.map((p) => ({
    url: `${site.url}/portfolio/${p.slug}`,
    priority: 0.6,
    // Sem `updatedAt` isto fica `undefined`, e o Next não escreve a linha: a
    // serialização testa `if (item.lastModified)` antes de emitir `<lastmod>`.
    lastModified: p.updatedAt,
  }));

  return [...pages, ...caseStudies];
}
