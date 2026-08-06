/** docs: docs/01-marca.md — o domínio vem de lib/site.ts. */
import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";

/**
 * Sem `lastModified`. Estava a pôr a data da build em todas as URLs, o que
 * anunciava ao Google que o site inteiro mudou de cada vez que se faz deploy —
 * um sinal falso vale menos do que sinal nenhum. Volta a fazer sentido quando
 * cada página souber dizer quando mudou de facto.
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
  }));

  return [...pages, ...caseStudies];
}
