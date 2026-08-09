"use client";
/** docs: docs/04-componentes-e-padroes.md — ver "O formulário de contacto". */

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";
import {
  CAMPOS,
  HONEYPOT,
  validarContacto,
  type ErrosContacto,
} from "@/lib/contacto";

type Status = "idle" | "submitting" | "success" | "error" | "rate-limited";
type Errors = ErrosContacto;

/* `border-strong` e não `border`: aqui a borda é a única pista de que existe um
   campo, e a WCAG 1.4.11 pede 3:1 para isso — ver docs/02. */
const inputClass =
  "w-full rounded-lg border border-border-strong bg-surface px-4 py-3 text-ink transition-colors focus:border-ink/50 aria-[invalid=true]:border-danger";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});

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
        <h2 className="font-display text-xl">Recebida, obrigado.</h2>
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
