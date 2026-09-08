/** docs: docs/01-marca.md — o domínio vem de lib/site.ts. */
import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      /* O Estúdio é a ferramenta interna do estúdio, não é conteúdo. Não tem
         nada que ser rastreado nem indexado — e o que lá está por trás do login
         são dados de clientes. O `robots.txt` é um pedido, não uma tranca: quem
         tranca é o `requerSessao()` de cada página, e o `robots` da metadata em
         `app/estudio/layout.tsx` diz o mesmo a quem ignore isto. Ver docs/07. */
      disallow: ["/estudio", "/api/estudio"],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
