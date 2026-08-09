/** docs: docs/05-servicos.md — como se escreve um serviço novo está aí. */

export type Service = {
  title: string;
  blurb: string;
  items: string[];
};

export const services: Service[] = [
  {
    title: "Web Design",
    blurb:
      "Desenhamos cada ecrã à medida da tua marca e mostramos-te tudo antes de escrever uma linha de código. O cliente encontra o que procura sem ter de pensar — é isso que separa quem visita de quem compra.",
    items: ["UI/UX", "Design systems", "Protótipos"],
  },
  {
    title: "Desenvolvimento",
    blurb:
      "Construímos o site com tecnologia que o faz abrir num instante, em qualquer telemóvel. Um site lento perde o cliente antes sequer de lhe mostrar o que vendes.",
    items: ["Next.js", "Performance", "Headless CMS"],
  },
  {
    title: "Menus & Ecrãs Digitais",
    blurb:
      "Levamos a tua ementa para onde os clientes olham: no telemóvel por QR code e num ecrã dentro do espaço, em loop. Mudas o preço num sítio e muda em todo o lado.",
    items: ["Menu digital", "QR code", "Ecrã em loop"],
  },
  {
    title: "Painel de Gestão",
    blurb:
      "Um painel só teu, feito à medida do que precisas de mudar no dia a dia. Publicas, editas, apagas e deixas coisas agendadas — sem código e sem esperar por nós.",
    items: ["Backoffice", "Base de dados", "Agendamento"],
  },
  {
    title: "Branding",
    blurb:
      "Tratamos da cara da tua marca, do logótipo às cores e às regras de uso. Ficas com uma imagem que se reconhece à distância — no site, na montra ou na farda.",
    items: ["Identidade", "Logótipo", "Guidelines"],
  },
  {
    title: "Motion & Interação",
    blurb:
      "Pequenos movimentos que dão vida ao site sem nunca atrapalhar quem o está a usar. Guiam o olho para onde interessa e fazem o site parecer bem feito — porque é.",
    items: ["Animação", "Micro-interações", "Scroll"],
  },
];
