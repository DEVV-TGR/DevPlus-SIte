"use client";
/** docs: docs/04-componentes-e-padroes.md — a voz é a mesma do `not-found.tsx`. · docs/10-materiais-atelier.md */

import Image from "next/image";
import { useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Ambiente } from "@/components/paginas/Ambiente";
import { atelierAssets } from "@/components/atelier/assets";

/**
 * O que o visitante vê quando alguma coisa rebenta em runtime.
 *
 * **Nunca mostrar o `error.message`.** Em produção o Next já o substitui por uma
 * mensagem genérica nos erros vindos do servidor, mas os que vêm de componentes
 * de cliente chegam aqui com o texto original — e esse texto é interno. O que se
 * mostra é o `digest`, que é um hash e não diz nada a quem o lê, mas permite-nos
 * casar o ecrã com a linha certa nos logs da Vercel.
 *
 * Usa `reset` e não `unstable_retry`: neste site não há nada para voltar a
 * buscar (as páginas são todas estáticas), portanto limpar o estado do boundary
 * e voltar a renderizar é exatamente o que faz falta — e é a API estável.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Fica nos logs do servidor, onde é útil — e não no ecrã de quem visita.
    console.error("[erro]", error.digest ?? "sem digest");
  }, [error]);

  /* O mesmo cenário do 404: ambiente parado e o motivo de ligação longe das
     ações. Decoração que não carregue não tira nada a quem quer recuperar. */
  return (
    <div className="relative">
      <Ambiente corte="topo" />
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <Image
          aria-hidden
          src={atelierAssets.connection.src}
          alt=""
          width={atelierAssets.connection.width}
          height={atelierAssets.connection.height}
          sizes="10rem"
          className="mb-6 h-auto w-40 opacity-90"
        />
        <p className="font-display text-sm font-medium text-primary">Erro</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Alguma coisa correu mal
        </h1>
        <p className="mt-4 max-w-sm text-muted">
          Foi do nosso lado, não do teu. Tenta outra vez — se continuar, escreve-nos
          e resolvemos.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" onClick={reset}>
            Tentar outra vez
          </Button>
          <Button href="/" variant="outline">
            Voltar ao início
          </Button>
        </div>
        {error.digest ? (
          <p className="mt-8 text-sm text-muted">
            Referência: <code className="font-mono">{error.digest}</code>
          </p>
        ) : null}
      </Container>
    </div>
  );
}
