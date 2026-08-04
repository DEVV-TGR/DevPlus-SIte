/** docs: docs/01-marca.md — o domínio vem de lib/site.ts. */
import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";

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
    lastModified: new Date(),
  }));

  const caseStudies = projects.map((p) => ({
    url: `${site.url}/portfolio/${p.slug}`,
    lastModified: new Date(),
  }));

  return [...pages, ...caseStudies];
}
