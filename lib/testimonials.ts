/** docs: docs/04-componentes-e-padroes.md — ver "Secções que se escondem". */

export type Testimonial = {
  /** A frase, como o cliente a disse. Curta: 1 a 3 linhas. */
  quote: string;
  name: string;
  /** Empresa ou cargo — o que der mais credibilidade à frase. */
  role?: string;
  /** Slug em `lib/projects.ts`, quando o cliente já tem caso de estudo. */
  projectSlug?: string;
  /** Fotografia ou logótipo, em `/public`. Sem isto, mostra-se a inicial. */
  image?: string;
  imageAlt?: string;
};

/**
 * **Só entram aqui frases que um cliente disse mesmo e autorizou a publicar.**
 *
 * Não é uma lista de exemplo à espera de ser preenchida com texto plausível: um
 * testemunho inventado e atribuído a um cliente real é uma avaliação falsa, e
 * quem o lê não tem como distinguir. Enquanto o array estiver vazio, o
 * `Testimonials` não renderiza nada e a secção simplesmente não existe na
 * página — é assim de propósito.
 *
 * Ao recolher um testemunho: pede a frase por escrito, confirma o nome e o
 * cargo como a pessoa os quer ver publicados, e guarda a autorização.
 */
export const testimonials: Testimonial[] = [];
