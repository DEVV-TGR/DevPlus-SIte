"use client";
/** docs: docs/04-componentes-e-padroes.md — ver "Nota conhecida": este formulário ainda não envia. */

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "submitting" | "success" | "error";
type Errors = { name?: string; email?: string; message?: string };

/* `border-strong` e não `border`: aqui a borda é a única pista de que existe um
   campo, e a WCAG 1.4.11 pede 3:1 para isso — ver docs/02. */
const inputClass =
  "w-full rounded-lg border border-border-strong bg-surface px-4 py-3 text-ink transition-colors focus:border-ink/50 aria-[invalid=true]:border-danger";

function validate(data: {
  name: string;
  email: string;
  message: string;
}): Errors {
  const errors: Errors = {};
  if (!data.name.trim()) errors.name = "Indica o teu nome.";
  if (!data.email.trim()) errors.email = "Indica o teu email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "Email inválido.";
  if (!data.message.trim()) errors.message = "Escreve uma mensagem.";
  return errors;
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      message: String(fd.get("message") ?? ""),
    };

    const errs = validate(data);
    setErrors(errs);
    const [primeiroCampoInvalido] = (
      ["name", "email", "message"] as const
    ).filter((campo) => errs[campo]);
    if (primeiroCampoInvalido) {
      // Sem isto, submeter com erros não leva a lado nenhum: a mensagem aparece
      // fora do ecrã e quem navega por teclado fica no botão.
      form
        .querySelector<HTMLElement>(`[name="${primeiroCampoInvalido}"]`)
        ?.focus();
      return;
    }

    setStatus("submitting");
    try {
      // Placeholder submit — wire to an email service (Resend, Formspree…) later.
      await new Promise((r) => setTimeout(r, 900));
      setStatus("success");
      form.reset();
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
        <h2 className="font-display text-xl">Mensagem enviada</h2>
        <p className="mt-2 text-muted">
          Obrigado pelo contacto. Respondemos normalmente em 24 a 48 horas
          úteis.
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
            Algo correu mal. Tenta novamente.
          </p>
        ) : null}
      </div>
    </form>
  );
}
