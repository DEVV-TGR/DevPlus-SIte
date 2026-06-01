export type Service = {
  title: string;
  blurb: string;
  items: string[];
};

export const services: Service[] = [
  {
    title: "Web Design",
    blurb:
      "Desenhamos cada ecrã à medida da tua marca — do wireframe ao protótipo navegável. Interfaces claras, com hierarquia pensada e todos os estados resolvidos.",
    items: ["UI/UX", "Design systems", "Protótipos"],
  },
  {
    title: "Desenvolvimento",
    blurb:
      "Construímos em Next.js e React, com código limpo e a performance como prioridade. Sites rápidos, acessíveis e simples de manter ou expandir.",
    items: ["Next.js", "Performance", "Headless CMS"],
  },
  {
    title: "Branding",
    blurb:
      "Damos identidade à tua marca — do logótipo às guidelines. Um sistema visual coerente que funciona tão bem no ecrã como no papel.",
    items: ["Identidade", "Logótipo", "Guidelines"],
  },
  {
    title: "Motion & Interação",
    blurb:
      "Animação e micro-interações que dão vida à interface sem nunca atrapalhar. Movimento com intenção — para guiar o olhar, não para decorar.",
    items: ["Animação", "Micro-interações", "Scroll"],
  },
];
