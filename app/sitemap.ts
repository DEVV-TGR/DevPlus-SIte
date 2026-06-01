import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";

const base = "https://xquisitevision.pt";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/servicos",
    "/portfolio",
    "/sobre",
    "/contacto",
    "/privacidade",
  ].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
    }),
  );

  const caseStudies = projects
    .filter((p) => !p.placeholder)
    .map((p) => ({
      url: `${base}/portfolio/${p.slug}`,
      lastModified: new Date(),
    }));

  return [...pages, ...caseStudies];
}
