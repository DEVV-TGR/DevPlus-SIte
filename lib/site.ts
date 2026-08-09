/** docs: docs/01-marca.md — o nome, o domínio, o email e as redes são especificados aí. */

/**
 * Identidade da DevPlus num só sítio. Nada disto se escreve à mão noutro
 * ficheiro — se precisares de um valor novo, acrescenta-o aqui.
 */
export const site = {
  name: "DevPlus",
  domain: "devplus.pt",
  url: "https://devplus.pt",
  email: "support@devplus.pt",
  /** Remetente das submissões do formulário. Não é uma caixa que alguém leia —
   *  é a identidade de envio verificada no Resend. Vive num subdomínio para não
   *  colidir com o SPF do webmail em `devplus.pt`. Ver docs/04. */
  emailFrom: "Site DevPlus <formulario@send.devplus.pt>",
  tagline: "Estúdio de Web Design & Desenvolvimento",
  description:
    "A DevPlus desenha e constrói sites, plataformas e menus digitais — com painel de gestão para atualizares tudo sozinho. Rápidos, acessíveis e pensados para converter.",
  locale: "pt_PT",
  /** `pt-PT` e não `pt`: o site é português de Portugal, e é isso que o
   *  `<html lang>` deve dizer a leitores de ecrã e tradutores. */
  lang: "pt-PT",
} as const;

/** `href` ausente = a conta ainda não existe; renderiza-se sem link. */
export type Social = { label: string; href?: string };

/**
 * As contas ainda não estão criadas. Ficam visíveis (para o visitante saber que
 * existem) mas sem link — basta acrescentar o `href` para passarem a ligar.
 */
export const socials: Social[] = [
  { label: "Instagram" },
  { label: "Facebook" },
  { label: "WhatsApp" },
];
