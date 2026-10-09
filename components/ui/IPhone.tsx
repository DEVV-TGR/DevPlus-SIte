/** docs: docs/04-componentes-e-padroes.md · docs/06-projetos.md ("Vídeo no telemóvel") */
import { cn } from "@/lib/utils";

/**
 * Uma moldura de iPhone feita em CSS, sem imagem.
 *
 * Desenhada e não fotografada por duas razões: uma fotografia de telemóvel
 * trazia cores de fora dos tokens (o titânio, os reflexos) e pesava mais do
 * que o vídeo que vai lá dentro. O site é escuro, e um corpo em `bg` com o
 * contorno em `border-strong` lê-se como aparelho sem precisar de mais nada.
 *
 * O ecrã tem a proporção 390/844 — a do viewport em que
 * `scripts/gravar-telemovel.mjs` grava. Se uma mudar, a outra muda também,
 * ou o vídeo fica cortado em cima e em baixo.
 */
export function IPhone({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[300px] rounded-[3rem] bg-bg p-[10px] ring-1 ring-border-strong",
        className,
      )}
    >
      {/* Botões laterais: volume à esquerda, ligar à direita. */}
      <span
        aria-hidden
        className="absolute -left-[3px] top-[22%] h-10 w-[3px] rounded-l bg-border-strong"
      />
      <span
        aria-hidden
        className="absolute -left-[3px] top-[31%] h-10 w-[3px] rounded-l bg-border-strong"
      />
      <span
        aria-hidden
        className="absolute -right-[3px] top-[26%] h-16 w-[3px] rounded-r bg-border-strong"
      />

      <div className="relative aspect-[390/844] overflow-hidden rounded-[2.4rem] bg-surface-2">
        {children}
        {/* A Dynamic Island fica por cima do vídeo, como no aparelho. */}
        <span
          aria-hidden
          className="absolute left-1/2 top-[1.4%] h-[3.4%] w-[30%] -translate-x-1/2 rounded-full bg-bg"
        />
      </div>
    </div>
  );
}
