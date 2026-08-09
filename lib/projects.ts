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
  /** Capa do card, em /public/capas. Sem imagem, cai na forma gerada em CSS. */
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
    image: "/capas/imperio-auto-concept.jpg",
    imageAlt:
      "Página inicial do Império Auto Concept, com filtro de pesquisa por marca, modelo e combustível sobre uma fotografia de uma viatura.",
    summary:
      "Um stand online com página própria para cada viatura e um painel que liberta a equipa dos portais de classificados.",
    services: ["Web Design", "Desenvolvimento", "Painel de Gestão"],
    accent: "primary",
    overview:
      "O Império Auto Concept vende automóveis e queria deixar de depender dos portais de classificados para mostrar o stock. O desafio é ter um site próprio, onde cada viatura tem a sua página, e que a equipa consiga manter atualizado sem nos ligar de cada vez que entra ou sai um carro.",
    contribution:
      "Estamos a desenhar e a construir o site de raiz, com base de dados própria e um painel de gestão completo. A partir de um formulário, a equipa publica novos anúncios, edita os que já existem, gere as fotografias de cada viatura e retira do site o que já foi vendido — tudo sem tocar em código.",
  },
  {
    slug: "mira-mar",
    name: "Mira Mar",
    client: "Mira Mar",
    category: "Restaurante",
    year: "2026",
    status: "em-curso",
    image: "/capas/mira-mar.jpg",
    imageAlt:
      "Página inicial do Mira Mar, com o nome do restaurante sobre uma fotografia da praia e acessos rápidos à ementa, take away e pool bar.",
    summary:
      "Uma página que apresenta o restaurante e ementas digitais que a equipa muda e programa sozinha, com QR codes na sala e na explanada.",
    services: ["Landing Page", "Menu Digital", "Painel de Gestão", "QR Code"],
    accent: "accent",
    overview:
      "O Mira Mar, em Angeiras, queria uma presença online que fizesse duas coisas ao mesmo tempo: apresentar o restaurante a quem ainda não o conhece e substituir a ementa impressa por uma versão digital sempre atualizada.",
    contribution:
      "Estamos a construir uma landing page com todas as secções numa só página — sobre, fotos, localização e as avaliações do Google — com acesso direto à ementa, ao take away e ao pool bar, e disponível em mais do que um idioma. Numa área separada ficam as ementas: a do dia, os menus e a da explanada. O painel de gestão permite à equipa criar, editar, apagar e programar os menus diários com antecedência. Os QR codes, em suportes na sala e colados nas mesas da explanada, levam o cliente diretamente à ementa digital.",
  },
  {
    slug: "a-barraquinha-nova",
    name: "A Barraquinha Nova",
    client: "A Barraquinha Nova",
    category: "Restauração",
    year: "2026",
    status: "em-curso",
    // Falta a capa: foto da televisão no espaço a passar a ementa (ver docs/06).
    summary:
      "A ementa no telemóvel por QR code e numa televisão dentro do espaço, em loop. Muda-se uma vez e muda nas duas, sem reimprimir nada.",
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
    image: "/capas/jsk.jpg",
    imageAlt:
      "Página inicial da JSK, com o título de boas-vindas sobre uma fotografia de equipamento de videovigilância e um formulário de orçamento.",
    summary:
      "Várias áreas de negócio numa só plataforma, com uma navegação que se mantém simples à medida que a empresa cresce.",
    services: ["Web Design", "Desenvolvimento", "SEO"],
    accent: "primary",
    overview:
      "A JSK reúne diferentes serviços sob a mesma marca e precisava de um site que apresentasse cada área com clareza, sem confundir o visitante. O desafio foi criar uma estrutura capaz de acomodar vários tipos de conteúdo e continuar fácil de navegar.",
    contribution:
      "Desenhámos e construímos o site do zero. Começámos por arrumar os serviços de forma que cada visitante chegue depressa ao que lhe interessa, demos-lhes uma linguagem visual comum e escrevemos o site a pensar em velocidade e em aparecer nas pesquisas. Ficou uma base pronta a receber novos serviços sem ter de se refazer nada.",
  },
  {
    slug: "antonio-home-repair",
    name: "António Home Repair",
    client: "António Home Repair Services",
    category: "Serviços ao domicílio",
    year: "2025",
    status: "concluido",
    url: "https://antoniohomerepairservices.pt",
    image: "/capas/antonio-home-repair.jpg",
    imageAlt:
      "Página inicial da António Home Repair Services, com o título a laranja sobre um fundo preto com ilustrações de ferramentas.",
    summary:
      "Um site que troca o passa-palavra por contactos que chegam do telemóvel, para quem repara e mantém casas ao domicílio.",
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
