/** docs: docs/04-componentes-e-padroes.md — ver "O formulário de contacto". */

/**
 * As regras do formulário de contacto, num só sítio. O cliente valida para dar
 * resposta imediata; o servidor valida porque um POST não tem de passar pelo
 * formulário. Duas cópias das regras divergiam ao segundo mês.
 */
export type Contacto = { name: string; email: string; message: string };
export type ErrosContacto = Partial<Record<keyof Contacto, string>>;

/** A ordem conta: é por ela que o formulário decide onde pôr o foco. */
export const CAMPOS = ["name", "email", "message"] as const;

/** Sem tetos, um POST direto empurra megabytes para dentro da caixa de email. */
export const LIMITES = { name: 100, email: 200, message: 5000 } as const;

/* Deliberadamente permissiva: validar email a sério é impossível por regex, e o
   endereço confirma-se é ao responder. Isto só apanha o erro de distração. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* As mensagens estão aqui e não no formulário porque o servidor devolve estas
   mesmas, e o visitante não tem de perceber qual dos dois o travou. A voz é a
   do resto do site — ver docs/01: fala-se por "tu" e diz-se o que fazer, não o
   que está errado. "Email inválido." não é uma frase que se diga a alguém. */
export function validarContacto(data: Contacto): ErrosContacto {
  const errors: ErrosContacto = {};

  if (!data.name.trim()) errors.name = "Diz-nos como te chamas.";
  else if (data.name.length > LIMITES.name)
    errors.name = `O nome não pode passar dos ${LIMITES.name} caracteres.`;

  if (!data.email.trim())
    errors.email = "Precisamos do teu email para responder.";
  else if (data.email.length > LIMITES.email)
    errors.email = `O email não pode passar dos ${LIMITES.email} caracteres.`;
  else if (!EMAIL.test(data.email))
    errors.email = "Este email parece ter alguma coisa trocada.";

  if (!data.message.trim())
    errors.message = "Conta-nos o que precisas, nem que seja em duas linhas.";
  else if (data.message.length > LIMITES.message)
    errors.message = `A mensagem não pode passar dos ${LIMITES.message} caracteres.`;

  return errors;
}

/**
 * O nome do campo-armadilha. Está no formulário fora do ecrã: uma pessoa nunca
 * o vê nem lhe chega por teclado, um bot que preenche tudo cai nele.
 */
export const HONEYPOT = "website";
