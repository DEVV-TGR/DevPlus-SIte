"use client";
/** docs: docs/04-componentes-e-padroes.md — a voz é a mesma do `not-found.tsx`. */

import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

/**
 * O último recurso: só aparece quando o erro acontece no próprio `layout.tsx`,
 * acima de qualquer `error.tsx`. Substitui o layout inteiro, e por isso tem de
 * trazer o seu próprio `<html>`, `<body>`, CSS e fonte — não herda nada.
 *
 * Não importa `Container` nem `Button` de propósito: se o que rebentou foi o
 * layout, quanto menos código nosso este ecrã precisar de correr, maior a
 * probabilidade de ele próprio conseguir aparecer.
 *
 * Como no `error.tsx`, mostra-se o `digest` e nunca o `error.message`.
 */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang={site.lang} className={bricolage.variable}>
      <body className="flex min-h-dvh flex-col items-center justify-center px-6 text-center antialiased">
        {/* Um `global-error` não pode exportar `metadata` — é um componente de
            cliente. O `<title>` do React é a alternativa. */}
        <title>{`Erro · ${site.name}`}</title>
        <p className="font-display text-sm font-medium text-primary">Erro</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Alguma coisa correu mal
        </h1>
        <p className="mt-4 max-w-sm text-muted">
          Foi do nosso lado, não do teu. Tenta outra vez — se continuar,
          escreve-nos para{" "}
          <a
            href={`mailto:${site.email}`}
            className="break-all text-ink underline-offset-4 hover:underline"
          >
            {site.email}
          </a>
          .
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-ink transition-colors hover:bg-primary-strong"
        >
          Tentar outra vez
        </button>
        {error.digest ? (
          <p className="mt-8 text-sm text-muted">
            Referência: <code className="font-mono">{error.digest}</code>
          </p>
        ) : null}
      </body>
    </html>
  );
}
