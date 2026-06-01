import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://xquisitevision.pt"),
  title: {
    default: "XquisiteVision — Estúdio de Web Design & Desenvolvimento",
    template: "%s · XquisiteVision",
  },
  description:
    "XquisiteVision é um estúdio independente de web design e desenvolvimento. Desenhamos e construímos sites e produtos digitais ao detalhe — rápidos, acessíveis e pensados para converter.",
  keywords: [
    "web design",
    "desenvolvimento web",
    "criação de sites",
    "Next.js",
    "branding",
    "estúdio de design",
    "Portugal",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "XquisiteVision — Estúdio de Web Design & Desenvolvimento",
    description:
      "Desenhamos e construímos sites e produtos digitais ao detalhe — rápidos, acessíveis e pensados para converter.",
    url: "https://xquisitevision.pt",
    siteName: "XquisiteVision",
    locale: "pt_PT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XquisiteVision — Estúdio de Web Design & Desenvolvimento",
    description:
      "Desenhamos e construímos sites e produtos digitais ao detalhe.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className={`${display.variable} ${sans.variable}`}>
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
