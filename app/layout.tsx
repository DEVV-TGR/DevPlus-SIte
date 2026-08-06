/** docs: docs/01-marca.md — títulos, descrições e Open Graph vêm de lib/site.ts. */
import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { OrganizationJsonLd } from "@/components/JsonLd";
import { site } from "@/lib/site";

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

const fullTitle = `${site.name} — ${site.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: fullTitle,
    template: `%s · ${site.name}`,
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
  alternates: { canonical: "/" },
  openGraph: {
    title: fullTitle,
    description: site.description,
    url: site.url,
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
    <html lang={site.lang} className={bricolage.variable}>
      <head>
        {/* Marca que há JavaScript antes do primeiro paint. Sem esta classe,
            `globals.css` mostra tudo o que está à espera de animar — ver
            docs/04, "Movimento". Não mexer sem ler essa secção. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js")`,
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
          <Nav />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
        <div className="grain-overlay" aria-hidden />
      </body>
    </html>
  );
}
