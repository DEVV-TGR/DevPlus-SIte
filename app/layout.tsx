/** docs: docs/01-marca.md — títulos, descrições e Open Graph vêm de lib/site.ts. */
import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { CascaDoSite } from "@/components/CascaDoSite";
import { Footer } from "@/components/Footer";
import { OrganizationJsonLd } from "@/components/JsonLd";
import { site } from "@/lib/site";
import { fullTitle, titleTemplate } from "@/lib/seo";
import { CHAVE_TEMA } from "@/lib/tema";

/**
 * Uma família só, a fazer títulos e corpo — o contraste faz-se por peso e pelo
 * eixo óptico, não por uma segunda fonte. Ver docs/02: as duas famílias
 * anteriores eram sans-serif próximas, que é o par a evitar, e uma família
 * carrega menos do que duas.
 *
 * `opsz` é o que faz isto funcionar num só tipo: em corpo pequeno o desenho
 * abre e fica legível, em título fecha e ganha carácter.
 */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: fullTitle,
    template: titleTemplate,
  },
  description: site.description,
  keywords: [
    "web design",
    "desenvolvimento web",
    "criação de sites",
    "menu digital",
    "painel de gestão",
    "Next.js",
    "branding",
    "estúdio de design",
    "Portugal",
  ],
  /* Sem `alternates` aqui de propósito. O que estiver neste objeto é
     **herdado** por todas as páginas que não o sobreponham, e um
     `canonical: "/"` no layout fazia `/servicos`, `/portfolio`, `/sobre`,
     `/contacto` e `/privacidade` declararem-se todas cópias da homepage — ou
     seja, a pedir ao Google que não as indexasse. Cada página declara o seu,
     incluindo `app/page.tsx`. Ver docs/01, "Metadata". */
  /* Estes dois são só a rede de segurança de quem não passe pelo
     `pageMetadata()` — hoje, o `not-found`. **Sem `url` de propósito**, pela
     mesma razão do `alternates`: um `url` aqui era herdado por todas as
     páginas, e fazia qualquer partilha de `/servicos` dizer ao Facebook que o
     conteúdo vive na homepage. Ausente é inofensivo — a plataforma usa o URL
     que foi buscar. Ver `lib/seo.ts` e docs/01, "Metadata". */
  openGraph: {
    title: fullTitle,
    description: site.description,
    siteName: site.name,
    locale: site.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: fullTitle,
    // Vem de `lib/site.ts` como tudo o resto: escrita à mão, divergia da
    // description do site sem ninguém dar por isso — ver docs/01.
    description: site.description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={site.lang}
      className={bricolage.variable}
      data-theme="dark"
      /* Duas coisas mexem no `class` deste elemento antes de o React hidratar,
         e ambas são de propósito: o script aqui abaixo, que lhe acrescenta
         `js`, e o Lenis, que lhe põe `lenis lenis-smooth` ao arrancar. O
         servidor manda `class="…__variable"`, o browser já tem
         `class="…__variable js lenis lenis-smooth"` — e é essa diferença que o
         React reporta como erro de hidratação. O mesmo script troca também o
         `data-theme` e, no Estúdio, acrescenta `data-area`.

         Isto silencia o aviso **só neste elemento e só nos seus atributos**;
         tudo o que está por baixo continua a ser verificado. É a solução que o
         Next indica para o caso, e não se estende ao `body` nem a componentes:
         aí um aviso destes é um bug a sério e tem de aparecer. */
      suppressHydrationWarning
    >
      <head>
        {/* Duas coisas antes do primeiro paint, no mesmo script:

            1. A classe `js`. Sem ela, `globals.css` mostra tudo o que está à
               espera de animar — ver docs/04, "Movimento". Não mexer sem ler
               essa secção.
            2. O tema. O servidor manda sempre `data-theme="dark"`; aqui troca
               para a escolha guardada ou, sem escolha, para a do sistema.
               Feito depois da hidratação, a página pintava escura e saltava
               para clara. O Estúdio marca-se com `data-area` e fica escuro.
               Ver docs/02, "Temas", e o guia do Next "Preventing flash before
               hydration". */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;d.classList.add("js");var t;try{t=localStorage.getItem("${CHAVE_TEMA}")}catch(e){}if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";d.setAttribute("data-theme",t);if(location.pathname.indexOf("/estudio")===0)d.setAttribute("data-area","estudio")})()`,
          }}
        />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-ink"
        >
          Saltar para o conteúdo
        </a>
        <OrganizationJsonLd />
        <Providers>
          {/* A `Nav`, o `Footer` e o grão só existem no site público — o Estúdio
              (`/estudio`) tem casca própria. Quem decide é a `CascaDoSite`,
              que precisa do caminho e por isso é de cliente; o `Footer` vai
              como prop para continuar a ser de servidor. Ver docs/07.

              O `.grain-overlay` estava aqui fora e passou para lá dentro: era a
              única maneira de o tirar do Estúdio, onde uma textura de marketing
              por cima de uma tabela de dinheiro não faz falta nenhuma. Continua
              a ser o último elemento do `body` em todas as páginas onde existe,
              e continua sem transform por cima — com `root`, o `ReactLenis` não
              envolve os filhos em `div` nenhum. Ver docs/02 para a textura. */}
          <CascaDoSite rodape={<Footer />}>{children}</CascaDoSite>
        </Providers>
      </body>
    </html>
  );
}
