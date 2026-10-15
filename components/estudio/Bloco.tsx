/** docs: docs/07-estudio.md */
import Link from "next/link";
import { Icone, type NomeDoIcone } from "@/components/estudio/Icone";
import { CARTAO, TITULO_CARTAO } from "@/components/estudio/estilos";
import { cn } from "@/lib/utils";

/**
 * As peças de que os ecrãs do Estúdio são feitos — o cartão, a cabeça dele, o
 * número grande, o selo e o estado vazio.
 *
 * A forma é a do painel do Café Preguiça: cada cartão diz o que é (ícone e
 * título), para que serve (o subtítulo) e para onde leva (a seta). Quem chega
 * ao Estúdio pela primeira vez não tem de adivinhar onde carregar.
 */

/** O cartão. Uma coluna com espaço entre as partes, e nada mais. */
export function Bloco({
  className,
  children,
  ...resto
}: React.ComponentProps<"section">) {
  return (
    <section className={cn(CARTAO, "flex min-w-0 flex-col gap-4", className)} {...resto}>
      {children}
    </section>
  );
}

/**
 * A cabeça de um cartão: ícone, título, subtítulo e a seta para a secção.
 *
 * O `id` vai para o `h2`, para o `Bloco` o poder usar no `aria-labelledby`.
 * A seta só aparece se houver para onde ir — uma seta que não leva a lado
 * nenhum é uma promessa por cumprir.
 */
export function TopoDoBloco({
  id,
  titulo,
  sub,
  icone,
  href,
  rotuloDaSeta,
  extra,
}: {
  id?: string;
  titulo: React.ReactNode;
  sub?: React.ReactNode;
  icone?: NomeDoIcone;
  href?: string;
  rotuloDaSeta?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      {icone ? (
        <span
          aria-hidden
          className="grid size-9 flex-none place-items-center rounded-lg bg-primary/10 text-primary"
        >
          <Icone nome={icone} tamanho={18} />
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <h2 id={id} className={TITULO_CARTAO}>
          {titulo}
        </h2>
        {sub ? <p className="mt-0.5 text-sm text-muted">{sub}</p> : null}
      </div>
      {extra}
      {href ? (
        <Link
          href={href}
          aria-label={rotuloDaSeta ?? `Abrir ${typeof titulo === "string" ? titulo : "secção"}`}
          className="relative z-10 grid size-9 flex-none place-items-center rounded-lg border border-border text-muted transition-colors hover:border-primary hover:text-primary"
        >
          <Icone nome="seta" tamanho={16} />
        </Link>
      ) : null}
    </div>
  );
}

/** O selo: o "+12%" do modelo. Cheio, para se ler de longe. */
export function Selo({
  children,
  tom = "primario",
}: {
  children: React.ReactNode;
  tom?: "primario" | "neutro" | "perigo";
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full px-3 text-xs font-semibold whitespace-nowrap",
        /* `primary-ink` sobre `primary`: o par de 7.26:1 de docs/02. */
        tom === "primario" && "bg-primary text-primary-ink",
        tom === "neutro" && "border border-border-strong text-muted",
        tom === "perigo" && "border border-danger/40 text-danger",
      )}
    >
      {children}
    </span>
  );
}

/**
 * Um número grande com o rótulo por cima e uma nota por baixo.
 *
 * O `tom` pinta o número e só o número: verde para dinheiro que sobra, vermelho
 * para o que falta, laranja para o que está por cobrar. Um número sem juízo —
 * quantas tarefas, quantos projetos — fica sem cor, e é de propósito.
 */
export function Numero({
  rotulo,
  valor,
  nota,
  tom,
  grande = false,
}: {
  rotulo: string;
  valor: React.ReactNode;
  nota?: React.ReactNode;
  tom?: "bom" | "mau" | "atencao";
  grande?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted">{rotulo}</p>
      <p
        className={cn(
          "mt-1 font-display font-semibold tabular-nums tracking-tight",
          grande ? "text-3xl sm:text-4xl" : "text-2xl",
          tom === "bom" && "text-accent",
          tom === "mau" && "text-danger",
          tom === "atencao" && "text-primary",
        )}
      >
        {valor}
      </p>
      {nota ? <p className="mt-1 text-xs text-muted">{nota}</p> : null}
    </div>
  );
}

/**
 * O que se mostra quando não há nada — e diz sempre o passo seguinte. Um
 * "Sem dados" sozinho deixa quem chegou agora sem saber se partiu alguma coisa.
 */
export function Vazio({
  children,
  accao,
}: {
  children: React.ReactNode;
  accao?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border-strong/60 px-4 py-5 text-sm text-muted">
      <p>{children}</p>
      {accao ? <div className="mt-3 flex flex-wrap gap-2">{accao}</div> : null}
    </div>
  );
}

/**
 * A ligação do título de um cartão que se abre todo.
 *
 * Um `::after` estica-a por cima do cartão inteiro (que tem de ter `relative`,
 * ver `CARTAO_CLICAVEL`). Fica a ser **uma** ligação, com o nome do título — e
 * não o cartão embrulhado num `<a>`, que lia o cartão inteiro de uma vez a quem
 * usa leitor de ecrã e não deixava pôr botões lá dentro.
 */
export function LigacaoQueCobre({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "outline-none after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-accent",
        className,
      )}
    >
      {children}
    </Link>
  );
}
