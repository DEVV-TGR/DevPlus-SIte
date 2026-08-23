/** docs: docs/01-marca.md — títulos, descrições e Open Graph de cada página. */
import type { Metadata } from "next";
import { site } from "./site";

/** O título da homepage, e o `<title>` por omissão de quem não declarar o seu. */
export const fullTitle = `${site.name} — ${site.tagline}`;

/** O template que o layout aplica ao `<title>` das páginas interiores. */
export const titleTemplate = `%s · ${site.name}`;

/**
 * O `<title>` já resolvido. O Next aplica o `titleTemplate` ao `<title>`, mas
 * **não** ao `og:title` nem ao `twitter:title` — nesses, o título é uma string
 * solta, e sem isto a partilha de `/servicos` anunciava-se "Serviços", sem
 * marca nenhuma.
 */
export const composeTitle = (title?: string) =>
  title ? titleTemplate.replace("%s", title) : fullTitle;

/**
 * O cartão social global, gerado por `app/opengraph-image.tsx`. O `alt` e o
 * `size` vivem aqui e não lá porque `lib/seo.ts` precisa deles e importar do
 * ficheiro de rota arrastava o `next/og` para dentro da metadata de todas as
 * páginas. A rota consome-os; a fonte é esta.
 */
export const socialCardAlt = fullTitle;
export const socialCardSize = { width: 1200, height: 630 };

/**
 * O Next serve o cartão gerado em `/opengraph-image` — o hash que aparece no
 * HTML é só cache-busting, e o caminho sem ele responde 200 na mesma.
 */
const cartaoGlobal = [
  { url: "/opengraph-image", alt: socialCardAlt, ...socialCardSize },
];

type Pagina = {
  /** Caminho a partir da raiz, com barra inicial. `"/"` na homepage. */
  path: string;
  /** Sem o `· DevPlus` — é composto aqui. Ausente = é a homepage. */
  title?: string;
  /** Só quando o cartão social ganha em dizer outra coisa que não o `<title>`.
   *  Os casos de estudo usam-no para trocar a marca pela categoria: no `<title>`
   *  interessa "· DevPlus", num cartão partilhado interessa "— Stand automóvel". */
  socialTitle?: string;
  /** Ausente = a `description` do site. */
  description?: string;
  /** `article` nos casos de estudo, `website` no resto. */
  type?: "website" | "article";
  /** Só quando a página tem um cartão próprio. Sem isto cai no cartão global.
   *
   *  Não é opcional por preguiça: o `openGraph` de uma página **substitui** o
   *  do layout por inteiro, imagens incluídas, e o cartão do ficheiro está
   *  preso ao segmento raiz. Uma página que declare `openGraph` sem imagens
   *  fica literalmente sem `og:image` — foi o que aconteceu, e é por isso que
   *  o `cartaoGlobal` entra aqui em vez de se esperar que o Next o herde. */
  images?: { url: string; alt: string; width?: number; height?: number }[];
};

/**
 * A metadata de uma página, inteira e coerente consigo mesma.
 *
 * Isto existe por causa de um bug que apareceu duas vezes seguidas, e a
 * segunda só se descobriu a verificar produção depois de corrigir a primeira.
 * O que estiver no `metadata` do `app/layout.tsx` é **herdado** por todas as
 * páginas que não o sobreponham:
 *
 * - o `alternates.canonical` do layout fazia as cinco páginas interiores
 *   declararem-se cópias da homepage — a pedir ao Google que não as indexasse;
 * - o `openGraph` e o `twitter` faziam o mesmo ao cartão social: partilhar
 *   `/servicos` mostrava o título, a descrição e o URL da homepage.
 *
 * A lição não é "não te esqueças do `openGraph`" — foi exatamente isso que
 * falhou. É que **nenhuma página escreve estes campos à mão**. Chama esta
 * função e o canónico, o Open Graph e o Twitter saem todos do mesmo `path`,
 * do mesmo `title` e da mesma `description`. Não há como divergirem porque
 * não há três sítios onde os escrever.
 */
export function pageMetadata({
  path,
  title,
  socialTitle,
  description = site.description,
  type = "website",
  images,
}: Pagina): Metadata {
  const cardTitle = socialTitle ?? composeTitle(title);

  return {
    // A homepage não declara `title`: fica com o `title.default` do layout.
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      title: cardTitle,
      description,
      url: path,
      siteName: site.name,
      locale: site.locale,
      images: images ?? cartaoGlobal,
    },
    twitter: {
      card: "summary_large_image",
      title: cardTitle,
      description,
      images: images ?? cartaoGlobal,
    },
  };
}
