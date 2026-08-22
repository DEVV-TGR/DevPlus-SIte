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
    "Sites, menus digitais e plataformas feitos à medida do teu negócio — com um painel de gestão para mudares preços, fotos e textos sem ligar a ninguém.",
  locale: "pt_PT",
  /** `pt-PT` e não `pt`: o site é português de Portugal, e é isso que o
   *  `<html lang>` deve dizer a leitores de ecrã e tradutores. */
  lang: "pt-PT",
} as const;

/** `href` ausente = a conta ainda não existe; renderiza-se sem link. */
export type Social = { label: string; href?: string };

/**
 * O Instagram e o Facebook existem desde agosto de 2026; o WhatsApp ainda não,
 * e por isso continua sem `href` — renderiza como texto esbatido, sem `<a>`.
 *
 * Estes `href` não são só links no rodapé: alimentam o `sameAs` dos dados
 * estruturados (`components/JsonLd.tsx`), que é o que diz ao Google que estas
 * contas e o site são a mesma entidade. Um `href` errado aqui é pior do que
 * `href` nenhum — confirma-o no browser antes de o escrever.
 */
export const socials: Social[] = [
  { label: "Instagram", href: "https://www.instagram.com/devplus.pt/" },
  {
    label: "Facebook",
    // URL de perfil sem username. Assim que a página tiver um (`/devplus.pt`),
    // troca aqui: é mais curto, sobrevive a mudanças de id e lê-se melhor.
    href: "https://www.facebook.com/profile.php?id=61592793399224",
  },
  { label: "WhatsApp" },
];
