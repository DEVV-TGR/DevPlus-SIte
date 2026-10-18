"use client";
/** docs: docs/04-componentes-e-padroes.md — ver "O formulário de contacto". */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";
import {
  CAMPOS,
  GRUPOS_INTERESSE,
  HONEYPOT,
  limparInteresses,
  validarContacto,
  type ErrosContacto,
} from "@/lib/contacto";

type Status = "idle" | "submitting" | "success" | "error" | "rate-limited";
type Errors = ErrosContacto;

/* `border-strong` e não `border`: aqui a borda é a única pista de que existe um
   campo, e a WCAG 1.4.11 pede 3:1 para isso — ver docs/02. */
const inputClass =
  "w-full rounded-lg border border-border-strong bg-surface px-4 py-3 text-ink transition-[border-color,box-shadow] duration-200 hover:border-ink/40 focus:border-ink/60 focus:shadow-[0_0_0_4px_color-mix(in_oklch,var(--ink)_8%,transparent)] aria-[invalid=true]:border-danger";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [interesses, setInteresses] = useState<string[]>([]);

  /* Os botões do site trazem o assunto no URL (`?interesse=landing-page`,
     ver `contactoCom`). Lê-se depois de montar, e não com `useSearchParams`:
     assim a página continua estática e não precisa de um `Suspense`. */
  useEffect(() => {
    const pedidos = new URLSearchParams(window.location.search)
      .get("interesse")
      ?.split(",");
    const validos = limparInteresses(pedidos);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- vem do URL, só existe no cliente
    if (validos.length) setInteresses(validos);
  }, []);

  const alternar = (id: string) =>
    setInteresses((atuais) =>
      limparInteresses(
        atuais.includes(id) ? atuais.filter((x) => x !== id) : [...atuais, id],
      ),
    );

  /** Pinta os erros e devolve `true` se havia algum. */
  function mostrarErros(errs: Errors, form: HTMLFormElement): boolean {
    setErrors(errs);
    const [primeiroCampoInvalido] = CAMPOS.filter((campo) => errs[campo]);
    if (!primeiroCampoInvalido) return false;

    // Sem isto, submeter com erros não leva a lado nenhum: a mensagem aparece
    // fora do ecrã e quem navega por teclado fica no botão.
    form
      .querySelector<HTMLElement>(`[name="${primeiroCampoInvalido}"]`)
      ?.focus();
    return true;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = {
      interesses,
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      message: String(fd.get("message") ?? ""),
    };

    if (mostrarErros(validarContacto(data), form)) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          [HONEYPOT]: String(fd.get(HONEYPOT) ?? ""),
        }),
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
        setInteresses([]);
        return;
      }

      if (res.status === 429) {
        setStatus("rate-limited");
        return;
      }

      // O servidor revalida — se recusou por campos, mostra-os como se a
      // validação de cliente os tivesse apanhado.
      if (res.status === 400) {
        const { errors: doServidor } = (await res.json().catch(() => ({}))) as {
          errors?: Errors;
        };
        if (doServidor && mostrarErros(doServidor, form)) {
          setStatus("idle");
          return;
        }
      }

      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-accent/40 bg-surface p-8"
      >
        <h2 className="t-cartao font-display">Recebida, obrigado.</h2>
        <p className="mt-2 text-muted">
          Vamos ler com calma e damos-te notícias em 24 a 48 horas úteis.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {/* A armadilha. `sr-only` e não `display:none` nem `type="hidden"` — os
          bots que interessa apanhar ignoram esses dois. O `aria-hidden` e o
          `tabIndex` garantem que ninguém lá chega por leitor de ecrã ou
          teclado; quem o preencher é porque preenche tudo. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor={HONEYPOT}>Não preenchas este campo</label>
        <input
          id={HONEYPOT}
          name={HONEYPOT}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      {/* Os atalhos: um toque diz do que se vai falar. Caixas e não rádios —
          dá para pedir a demo **e** dizer que é uma landing page. A nota da
          demo só aparece quando ela está escolhida, e diz exatamente o que a
          equipa oferece (docs/05). */}
      <fieldset
        aria-describedby={errors.interesses ? "interesses-error" : undefined}
      >
        <legend className="mb-3 text-sm font-medium">
          Do que queres falar? <span className="text-muted">(opcional)</span>
        </legend>
        <div className="grid gap-3">
          {GRUPOS_INTERESSE.map((g) => (
            <div key={g.titulo} className="flex flex-wrap items-center gap-2">
              <span className="w-full whitespace-nowrap text-xs uppercase tracking-[0.14em] text-muted sm:w-[7.5rem] sm:shrink-0">
                {g.titulo}
              </span>
              {g.itens.map((it) => {
                const ativo = interesses.includes(it.id);
                return (
                  <label
                    key={it.id}
                    className={`inline-flex min-h-9 cursor-pointer select-none items-center gap-1.5 rounded-full border px-3.5 text-sm transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.96] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--foco)] ${
                      ativo
                        ? "border-primary bg-primary text-primary-ink"
                        : "border-border-strong text-ink hover:border-ink/50 hover:bg-ink/5"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="interesses"
                      value={it.id}
                      checked={ativo}
                      onChange={() => alternar(it.id)}
                      className="sr-only"
                    />
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                      className={`transition-[width,opacity] duration-200 ${ativo ? "w-3.5 opacity-100" : "w-0 opacity-0"}`}
                    >
                      <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {it.rotulo}
                  </label>
                );
              })}
            </div>
          ))}
        </div>
        {interesses.includes("demo") ? (
          <p className="mt-3 rounded-lg border border-border bg-ink/5 px-3.5 py-2.5 text-sm text-muted">
            A demo é grátis e mostra a parte visual do teu projeto. As
            funcionalidades vêm depois: discutimo-las contigo e fazemo-las à
            medida.
          </p>
        ) : null}
        {errors.interesses ? (
          <p
            id="interesses-error"
            role="alert"
            className="mt-1.5 text-sm text-danger"
          >
            {errors.interesses}
          </p>
        ) : null}
      </fieldset>

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          Nome
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          className={inputClass}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name ? (
          <p
            id="name-error"
            role="alert"
            className="mt-1.5 text-sm text-danger"
          >
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className={inputClass}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email ? (
          <p
            id="email-error"
            role="alert"
            className="mt-1.5 text-sm text-danger"
          >
            {errors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
          Mensagem
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className={`${inputClass} resize-y`}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message ? (
          <p
            id="message-error"
            role="alert"
            className="mt-1.5 text-sm text-danger"
          >
            {errors.message}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "A enviar…" : "Enviar mensagem"}
        </Button>
        {status === "error" ? (
          <p role="alert" className="text-sm text-danger">
            Não conseguimos enviar. Tenta outra vez, se faz favor — ou escreve
            direto para {site.email}.
          </p>
        ) : null}
        {status === "rate-limited" ? (
          <p role="alert" className="text-sm text-danger">
            Já nos escreveste há pouco. Dá-nos uns minutos e tenta de novo.
          </p>
        ) : null}
      </div>
    </form>
  );
}
