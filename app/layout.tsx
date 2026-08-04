/** docs: docs/01-marca.md — títulos, descrições e Open Graph vêm de lib/site.ts. */
import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { site } from "@/lib/site";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    description:
      "Sites, plataformas e menus digitais — com painel de gestão para atualizares tudo sozinho.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={site.lang} className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-ink"
        >
          Saltar para o conteúdo
        </a>
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
