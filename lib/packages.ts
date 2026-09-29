/** docs: docs/05-servicos.md — os pacotes e o que cada um inclui vivem aqui. */

export type Package = {
  name: string;
  desc: string;
  points: string[];
  /** O mais escolhido leva etiqueta. Só um pode ter. */
  featured?: boolean;
};

/**
 * Os pontos de partida de um projeto.
 *
 * Viviam dentro de `app/servicos/page.tsx`. Saíram de lá quando a página
 * inicial passou a mostrá-los também: duas cópias da mesma lista divergem ao
 * segundo mês, e a que fica desatualizada é sempre a que o cliente lê primeiro.
 *
 * **Não levam preços.** O valor sai de uma proposta, depois de se perceber o
 * âmbito — é o que o `docs/05` diz e é um compromisso comercial, não copy.
 */
export const packages: Package[] = [
  {
    name: "Landing page",
    desc: "Uma página só, com o que interessa: quem és, o que fazes e como te contactam. Rápida de pôr no ar.",
    points: [
      "Página única",
      "Copy + design",
      "Formulário de contacto",
      "Otimizada para SEO",
    ],
  },
  {
    name: "Website",
    desc: "O site completo da tua marca, com várias páginas e a mesma linguagem visual em todas.",
    points: [
      "Várias páginas",
      "Design system próprio",
      "CMS opcional",
      "Performance + SEO",
    ],
    featured: true,
  },
  {
    name: "Loja online",
    desc: "Uma loja feita para vender: o cliente compra em poucos toques e tu geres os produtos sem ajuda.",
    points: ["Catálogo + checkout", "Pagamentos", "Gestão de produtos", "Analytics"],
  },
];
