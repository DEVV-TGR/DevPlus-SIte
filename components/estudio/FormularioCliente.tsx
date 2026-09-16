/** docs: docs/07-estudio.md */
"use client";

import { useActionState, useEffect, useRef } from "react";
import { BotaoGuardar } from "@/components/estudio/BotaoGuardar";
import { CAMPO, ETIQUETA } from "@/components/estudio/estilos";
import type { EstadoCliente } from "@/lib/estudio/acoes";
import type { Cliente } from "@/lib/estudio/tipos";

/**
 * O formulário de um cliente — o mesmo para criar e para editar.
 *
 * Guarda nome, contactos e notas de pessoas reais. É por isso que o Estúdio
 * está fechado por trás de login e fora do `robots.txt`, e é por isso que a
 * política de privacidade nomeia quem aloja esta base — ver docs/01 e docs/07.
 */

function Erro({ id, mensagem }: { id: string; mensagem?: string }) {
  if (!mensagem) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-danger">
      {mensagem}
    </p>
  );
}

export function FormularioCliente({
  acao,
  cliente,
  rotulo = "Guardar",
  extra,
}: {
  acao: (anterior: EstadoCliente, form: FormData) => Promise<EstadoCliente>;
  cliente?: Cliente;
  rotulo?: string;
  /** O seletor de trabalhos, quando o formulário o leva. Chega como `node`
   *  para o formulário não ter de saber nada sobre repositórios. */
  extra?: React.ReactNode;
}) {
  const [estado, submeter] = useActionState<EstadoCliente, FormData>(acao, {});
  const form = useRef<HTMLFormElement>(null);

  /* A criar, limpa-se o formulário depois de gravar — quem acrescenta um
     cliente costuma acrescentar logo o seguinte. A editar não se limpa nada:
     os campos são o estado atual do cliente. */
  const aCriar = !cliente;
  useEffect(() => {
    if (aCriar && estado.ok) form.current?.reset();
  }, [aCriar, estado.ok]);

  return (
    <form ref={form} action={submeter} className="space-y-5" noValidate>
      {cliente ? <input type="hidden" name="id" value={cliente.id} /> : null}

      <div>
        <label htmlFor="cliente-nome" className={ETIQUETA}>
          Nome
        </label>
        <input
          id="cliente-nome"
          name="nome"
          defaultValue={cliente?.nome ?? ""}
          className={CAMPO}
          aria-invalid={estado.erros?.nome ? true : undefined}
          aria-describedby={estado.erros?.nome ? "erro-cliente-nome" : undefined}
        />
        <Erro id="erro-cliente-nome" mensagem={estado.erros?.nome} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cliente-email" className={ETIQUETA}>
            Email
          </label>
          <input
            id="cliente-email"
            name="email"
            type="email"
            defaultValue={cliente?.email ?? ""}
            className={CAMPO}
            aria-invalid={estado.erros?.email ? true : undefined}
            aria-describedby={
              estado.erros?.email ? "erro-cliente-email" : undefined
            }
          />
          <Erro id="erro-cliente-email" mensagem={estado.erros?.email} />
        </div>

        <div>
          <label htmlFor="cliente-telefone" className={ETIQUETA}>
            Telefone
          </label>
          <input
            id="cliente-telefone"
            name="telefone"
            type="tel"
            defaultValue={cliente?.telefone ?? ""}
            className={CAMPO}
            aria-invalid={estado.erros?.telefone ? true : undefined}
            aria-describedby={
              estado.erros?.telefone ? "erro-cliente-telefone" : undefined
            }
          />
          <Erro id="erro-cliente-telefone" mensagem={estado.erros?.telefone} />
        </div>
      </div>

      <div>
        <label htmlFor="cliente-notas" className={ETIQUETA}>
          Notas
        </label>
        <textarea
          id="cliente-notas"
          name="notas"
          rows={4}
          defaultValue={cliente?.notas ?? ""}
          className={`${CAMPO} resize-y`}
          aria-invalid={estado.erros?.notas ? true : undefined}
          aria-describedby={
            estado.erros?.notas ? "erro-cliente-notas" : undefined
          }
        />
        <Erro id="erro-cliente-notas" mensagem={estado.erros?.notas} />
      </div>

      {extra}

      <div className="flex flex-wrap items-center gap-4">
        <BotaoGuardar>{rotulo}</BotaoGuardar>

        {estado.erro ? (
          <p role="alert" className="text-sm text-danger">
            {estado.erro}
          </p>
        ) : null}

        {estado.ok ? (
          <p role="status" className="text-sm text-accent">
            Guardado.
            {estado.ligados
              ? ` ${estado.ligados} ${estado.ligados === 1 ? "trabalho ligado" : "trabalhos ligados"}.`
              : ""}
          </p>
        ) : null}
      </div>
    </form>
  );
}
