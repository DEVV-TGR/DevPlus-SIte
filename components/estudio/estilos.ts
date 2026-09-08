/** docs: docs/07-estudio.md */
import type { Estado } from "@/lib/estudio/tipos";

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

export const SOBRETITULO = "text-xs uppercase tracking-[0.18em] text-muted";

/**
 * A cor de cada estado. **Nenhuma cor nova**: `accent` é o verde que docs/02 já
 * reserva para "Em curso", `primary` é o laranja de destaque, `danger` é o
 * vermelho de problema e `muted` é o que ainda não começou.
 *
 * `parado` fica a `danger` de propósito. Um projeto parado não é neutro — é uma
 * coisa que alguém tem de destravar.
 */
export const COR_ESTADO: Record<Estado, string> = {
  proposta: "border-border-strong text-muted",
  "em-curso": "border-accent/40 text-accent",
  entregue: "border-primary/40 text-primary",
  parado: "border-danger/40 text-danger",
};

/** A cor da barra de progresso segue a do estado, para as duas dizerem o mesmo. */
export const COR_BARRA: Record<Estado, string> = {
  proposta: "bg-border-strong",
  "em-curso": "bg-accent",
  entregue: "bg-primary",
  parado: "bg-danger",
};
