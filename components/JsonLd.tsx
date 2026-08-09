/** docs: docs/01-marca.md — o nome, o domínio e o email vêm de lib/site.ts. */
import { site } from "@/lib/site";

/**
 * Dados estruturados. Ficam num sítio só para o `@id` da organização ser o
 * mesmo em todas as páginas — é isso que diz ao Google que a DevPlus do rodapé
 * e a autora dos casos de estudo são a mesma entidade.
 */

const ORG_ID = `${site.url}/#organizacao`;

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Conteúdo nosso, vindo de `lib/site.ts` e `lib/projects.ts` — nunca de
      // input de terceiros.
      //
      // O `<` escapado não é zelo a mais: o `JSON.stringify` não escapa
      // `</script>`, e o dia em que um `summary` de `lib/projects.ts` levar um
      // (a falar de HTML, por exemplo) o elemento fecha ali e o resto do JSON
      // passa a ser HTML interpretado pelo browser. `<` é a mesma string
      // para quem lê o JSON e deixa de ser uma tag para quem lê o HTML.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/** No layout: identifica o estúdio uma vez para o site inteiro. */
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "@id": ORG_ID,
        name: site.name,
        url: site.url,
        email: site.email,
        description: site.description,
        areaServed: "PT",
        knowsLanguage: ["pt-PT", "en"],
        slogan: site.tagline,
      }}
    />
  );
}

/** Na página de serviços: as perguntas podem aparecer direto na pesquisa. */
export function FaqJsonLd({ faqs }: { faqs: [string, string][] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(([pergunta, resposta]) => ({
          "@type": "Question",
          name: pergunta,
          acceptedAnswer: { "@type": "Answer", text: resposta },
        })),
      }}
    />
  );
}

/** No caso de estudo: o trabalho, quem o fez, e o caminho até ele. */
export function CaseStudyJsonLd({
  name,
  description,
  slug,
  image,
  year,
}: {
  name: string;
  description: string;
  slug: string;
  image?: string;
  year: string;
}) {
  const url = `${site.url}/portfolio/${slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name,
          description,
          url,
          dateCreated: year,
          creator: { "@id": ORG_ID },
          ...(image ? { image: `${site.url}${image}` } : {}),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Início",
              item: site.url,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Portfólio",
              item: `${site.url}/portfolio`,
            },
            { "@type": "ListItem", position: 3, name, item: url },
          ],
        }}
      />
    </>
  );
}
