/** docs: docs/07-estudio.md */
import type { Estado } from "@/lib/estudio/tipos";
import { cn } from "@/lib/utils";

/**
 * As classes que se repetem no Estúdio. Estão aqui para o painel inteiro mudar
 * de aspeto num sítio só — não para inventar um segundo sistema de design. Tudo
 * o que está cá dentro sai dos tokens de `app/globals.css` (docs/02).
 */

/* `border-strong` e não `border`: num campo, a borda é a única pista de que ali
   se pode escrever, e a WCAG 1.4.11 pede 3:1 para isso. É a mesma classe do
   formulário de contacto — ver docs/02. */
export const CAMPO =
  "w-full rounded-lg border border-border-strong bg-surface px-4 py-3 text-ink transition-colors focus:border-ink/50 aria-[invalid=true]:border-danger";

export const ETIQUETA = "mb-1.5 block text-sm font-medium";

export const CARTAO =
  "rounded-2xl border border-border bg-surface p-6 transition-colors duration-300";

export const PASTILHA = "rounded-full border px-2.5 py-1 text-xs";

/**
 * Uma pastilha que também é um filtro — a que está escolhida e as outras.
 *
 * Vive aqui porque é usada em dois sítios que não se conhecem: os estados em
 * `/estudio/projetos` e os períodos dos gráficos do resumo. Estava escrita à
 * mão dentro da página dos projetos, e a segunda cópia teria divergido da
 * primeira ao segundo mês — que é exatamente o que este ficheiro existe para
 * evitar.
 */
export const pastilhaFiltro = (ativa: boolean) =>
  cn(
    PASTILHA,
    "transition-colors",
    ativa
      ? "border-primary/50 bg-primary/10 text-primary"
      : "border-border text-muted hover:border-ink/30 hover:text-ink",
  );

export const SOBRETITULO = "text-xs uppercase tracking-[0.18em] text-muted";

/**
 * A cor de cada estado. **Nenhuma cor nova** — cinco estados sobre os tokens que
 * docs/02 já tem. O que os separa é a pergunta "isto precisa de mim?":
 *
 * - `proposta` — ainda não começou. Neutro, não pede nada.
 * - `em-curso` — o verde que docs/02 reserva para esta etiqueta. Está a andar.
 * - `a-espera` — **laranja de contorno**, que docs/02 dá aos destaques. Um
 *   trabalho à espera de um cliente não se desbloqueia sozinho, e se ninguém lhe
 *   pegar fica lá meses.
 * - `visita` — **laranja cheio**. É o mesmo laranja de propósito: os dois são
 *   bloqueios. O que os separa não é a cor, é o preenchimento, e isso quer dizer
 *   uma coisa concreta — **na etiqueta cheia, a bola está contigo**. Ligar a
 *   alguém e esperar é uma coisa; ter de lá ir é outra, e é a que só depende de
 *   nós. É a mais forte do painel porque é a única que se resolve sozinha se
 *   alguém se mexer.
 * - `entregue` — recua. Um trabalho acabado não tem de ser a coisa mais forte no
 *   ecrã; deixou de precisar de atenção, e a cor diz isso.
 * - `parado` — `danger`, porque um projeto parado não é neutro: é uma coisa que
 *   alguém tem de destravar.
 *
 * O `entregue` esteve a laranja até o `a-espera` existir. A troca é deliberada:
 * o laranja é caro de mais para gastar no que já não pede nada.
 */
export const COR_ESTADO: Record<Estado, string> = {
  proposta: "border-border-strong text-muted",
  "em-curso": "border-accent/40 text-accent",
  "a-espera": "border-primary/50 text-primary",
  /* `primary-ink` sobre `primary` é o par que docs/02 mede em 7.26:1 — não se
     escreve texto em `ink` por cima do laranja. */
  visita: "border-transparent bg-primary text-primary-ink",
  entregue: "border-border text-muted",
  parado: "border-danger/40 text-danger",
};

/** A cor da barra de progresso segue a do estado, para as duas dizerem o mesmo.
 *  O `entregue` fica esbatido como a etiqueta — o que o distingue da `proposta`
 *  é a barra estar cheia, não a cor. */
export const COR_BARRA: Record<Estado, string> = {
  proposta: "bg-border-strong",
  "em-curso": "bg-accent",
  "a-espera": "bg-primary",
  visita: "bg-primary-strong",
  entregue: "bg-border-strong",
  parado: "bg-danger",
};
