export type Project = {
  slug: string;
  name: string;
  client: string;
  category: string;
  year: string;
  url?: string;
  summary: string;
  services: string[];
  /** Which brand color tints this project's cover. */
  accent: "primary" | "accent";
  /** Case-study body. */
  overview: string;
  contribution: string;
  /** True for the not-yet-filled 3rd slot. */
  placeholder?: boolean;
};

export const projects: Project[] = [
  {
    slug: "jsk",
    name: "JSK",
    client: "JSK",
    category: "Plataforma multi-serviço",
    year: "2025",
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
  {
    slug: "proximo-projeto",
    name: "Em breve",
    client: "O teu projeto",
    category: "Próximo caso de estudo",
    year: "2025",
    summary:
      "Estamos a preparar o próximo caso de estudo. Volta em breve — ou fala connosco para seres tu o próximo.",
    services: ["Web Design"],
    accent: "primary",
    overview:
      "Estamos a preparar o próximo caso de estudo.",
    contribution:
      "Tens um projeto em mente? Fala connosco e construímos o próximo juntos.",
    placeholder: true,
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
