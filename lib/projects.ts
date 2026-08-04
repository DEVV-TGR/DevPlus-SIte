/** docs: docs/06-projetos.md — o shape, as regras e as lacunas por preencher estão aí. */

export type Project = {
  slug: string;
  name: string;
  client: string;
  category: string;
  year: string;
  /** Só quando o site está mesmo no ar — sem isto, não há botão de visita. */
  url?: string;
  summary: string;
  services: string[];
  /** Qual das cores da marca tinge a capa deste projeto. */
  accent: "primary" | "accent";
  /** "em-curso" mostra a etiqueta no card e no caso de estudo. */
  status: "em-curso" | "concluido";
  /** Capa do card, em /public/portfolio. Sem imagem, cai na forma gerada em CSS. */
  image?: string;
  imageAlt?: string;
  /** Corpo do caso de estudo. */
  overview: string;
  contribution: string;
};

/**
 * O primeiro da lista é o projeto em destaque na página inicial (card grande).
 * A cor de capa alterna entre `primary` e `accent` — ver docs/06.
 */
export const projects: Project[] = [
  {
    slug: "imperio-auto-concept",
    name: "Império Auto Concept",
    client: "Império Auto Concept",
    category: "Stand automóvel",
    year: "2026",
    status: "em-curso",
    summary:
      "Um stand virtual com página própria para cada viatura e um painel de gestão que deixa a equipa publicar, editar e retirar anúncios sozinha.",
    services: ["Web Design", "Desenvolvimento", "Painel de Gestão"],
    accent: "primary",
    overview:
      "O Império Auto Concept vende automóveis e queria deixar de depender dos portais de classificados para mostrar o stock. O desafio é ter um site próprio, onde cada viatura tem a sua página, e que a equipa consiga manter atualizado sem nos ligar de cada vez que entra ou sai um carro.",
    contribution:
      "Estamos a desenhar e a construir o site de raiz, com base de dados própria e um painel de gestão completo. A partir de um formulário, a equipa publica novos anúncios, edita os que já existem, gere as fotografias de cada viatura e retira do site o que já foi vendido — tudo sem tocar em código.",
  },
  {
    slug: "miramar",
    name: "Miramar",
    client: "Miramar",
    category: "Restaurante",
    year: "2026",
    status: "em-curso",
    summary:
      "Landing page com avaliações do Google e ementas digitais que o restaurante atualiza e programa sozinho, com QR codes na sala e na explanada.",
    services: ["Landing Page", "Menu Digital", "Painel de Gestão", "QR Code"],
    accent: "accent",
    overview:
      "O Miramar, em Angeiras, queria uma presença online que fizesse duas coisas ao mesmo tempo: apresentar o restaurante a quem ainda não o conhece e substituir a ementa impressa por uma versão digital sempre atualizada.",
    contribution:
      "Estamos a construir uma landing page com todas as secções numa só página, incluindo as avaliações do Google, e uma área separada para as ementas — a do dia, os menus e a da explanada. O painel de gestão permite à equipa criar, editar, apagar e programar os menus diários com antecedência. Os QR codes, em suportes na sala e colados nas mesas da explanada, levam o cliente diretamente à ementa digital.",
  },
  {
    slug: "a-barraquinha-nova",
    name: "A Barraquinha Nova",
    client: "A Barraquinha Nova",
    category: "Restauração",
    year: "2026",
    status: "em-curso",
    summary:
      "Menu digital acessível por QR code e uma televisão no espaço a passar a ementa em loop — sempre atualizada, sem reimprimir nada.",
    services: ["Menu Digital", "Ecrã Digital"],
    accent: "primary",
    overview:
      "A Barraquinha Nova, na Praia da Granja, servia a ementa em papel e reimprimia-a sempre que mudava um preço ou faltava um prato. Queria uma ementa digital fácil de manter e visível também para quem já está sentado à mesa.",
    contribution:
      "Estamos a implementar o menu digital e a instalar uma televisão dentro do espaço a passar a ementa em loop, sincronizada com o mesmo menu. Uma alteração feita uma vez chega ao telemóvel do cliente e ao ecrã da sala ao mesmo tempo.",
  },
  {
    slug: "jsk",
    name: "JSK",
    client: "JSK",
    category: "Plataforma multi-serviço",
    year: "2025",
    status: "concluido",
    url: "https://jsk.pt",
    summary:
      "Várias áreas de negócio reunidas numa só plataforma, com uma identidade coerente e navegação que se mantém simples à medida que cresce.",
    services: ["Web Design", "Desenvolvimento", "SEO"],
    accent: "primary",
    overview:
      "A JSK reúne diferentes serviços sob a mesma marca e precisava de um site que apresentasse cada área com clareza, sem confundir o visitante. O desafio foi criar uma estrutura capaz de acomodar vários tipos de conteúdo e continuar fácil de navegar.",
    contribution:
      "Desenhámos e desenvolvemos o site de raiz: arquitetura de informação, design system, interface responsiva e desenvolvimento em Next.js com foco em velocidade e SEO. O resultado é uma base modular, pronta para acolher novos serviços sem retrabalho.",
  },
  {
    slug: "antonio-home-repair",
    name: "António Home Repair",
    client: "António Home Repair Services",
    category: "Serviços ao domicílio",
    year: "2025",
    status: "concluido",
    url: "https://antoniohomerepairservices.pt",
    summary:
      "Um site de apresentação para serviços de reparação e manutenção ao domicílio, pensado para transmitir confiança e gerar contactos.",
    services: ["Web Design", "Desenvolvimento"],
    accent: "accent",
    overview:
      "A António Home Repair Services queria deixar de depender do passa-palavra e passar a ter presença online própria — um site que explicasse os serviços e tornasse o contacto imediato, sobretudo a partir do telemóvel.",
    contribution:
      "Tratámos da identidade, do design e do desenvolvimento. Organizámos os serviços de forma legível, demos destaque às chamadas para ação e otimizámos para mobile e pesquisa local, onde estão os clientes deste tipo de negócio.",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
