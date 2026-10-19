/** docs: docs/06-projetos.md — o shape, as regras e as lacunas por preencher estão aí. */

export type Project = {
  slug: string;
  name: string;
  client: string;
  category: string;
  year: string;
  /** Data em que este caso de estudo foi **reescrito**, em `YYYY-MM-DD`. Não é o
   *  `year` — esse é o ano do trabalho, e serviria `2026-01-01` a seis projetos,
   *  uma data que nunca aconteceu. É a única coisa que o `app/sitemap.ts` aceita
   *  como `lastModified`: escreve-se à mão quando o texto muda de facto, e quem
   *  não a tiver continua a não emitir data nenhuma. Não preencher em massa. */
  updatedAt?: string;
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
 * O catálogo alimenta o portfólio; a seleção da home vive em HOME_PROJECT_SLUGS.
 * A cor de capa alterna entre `primary` e `accent` — ver docs/06.
 */
export const projects: Project[] = [
  {
    slug: "cafe-preguica",
    name: "Café Preguiça",
    client: "Café Preguiça — Cocktails & Snacks",
    category: "Café & cocktail bar",
    year: "2026",
    updatedAt: "2026-10-16",
    status: "concluido",
    url: "https://cafepreguica.pt",
    image: "/capas/cafe-preguica.jpg",
    imageAlt:
      "Site do Café Preguiça, com a identidade da casa e a apresentação dos cocktails e snacks.",
    summary:
      "Da mesa à ementa, por QR code ou NFC. Um site com a personalidade da casa e um painel para a equipa gerir a carta.",
    services: [
      "Web Design",
      "Desenvolvimento",
      "Menus & Ecrãs Digitais",
      "Painel de Gestão",
    ],
    accent: "primary",
    overview:
      "O Café Preguiça, em Ermesinde, precisava de levar a identidade do espaço para o digital e tornar a carta acessível a quem já está à mesa. A equipa precisava também de autonomia para atualizar produtos e preços sem depender de alterações ao código.",
    contribution:
      "Desenhámos e desenvolvemos o site em português e inglês, com uma apresentação própria dos cocktails e snacks. Criámos a ementa digital e o painel que permite à equipa gerir a carta. Nas mesas, os suportes com QR codes e NFC abrem a ementa: basta ler o código com a câmara ou aproximar um telemóvel compatível. Os acessos por mesa podem ser acompanhados no painel, ligando a experiência no espaço à ferramenta de gestão.",
  },
  {
    slug: "cafe-avenida",
    name: "Café Avenida",
    client: "Café Avenida",
    category: "Café & restauração",
    year: "2026",
    updatedAt: "2026-10-16",
    status: "concluido",
    url: "https://cafe-avenida.vercel.app",
    image: "/capas/cafe-avenida.jpg",
    imageAlt:
      "Página inicial do Café Avenida, com fotografia do espaço e acesso à ementa.",
    summary:
      "Uma casa com presença própria na web. Site e ementa em três línguas, acessíveis no telemóvel por QR code.",
    services: ["Web Design", "Desenvolvimento", "Menus & Ecrãs Digitais"],
    accent: "accent",
    overview:
      "O Café Avenida, em Alpendurada, precisava de um site que apresentasse o espaço, mostrasse as sugestões da casa e desse acesso simples à ementa, tanto antes da visita como à mesa.",
    contribution:
      "Criámos o site com fotografias do espaço, galeria, sugestões, localização e horário com indicação de aberto ou fechado. A ementa está disponível em português, inglês e francês, organizada por categorias e preparada para consulta no telemóvel. Os QR codes nas mesas dão acesso direto à carta, e as imagens otimizadas mantêm a navegação leve.",
  },
  {
    slug: "damira",
    name: "Confeitaria Damira",
    client: "Confeitaria Damira",
    category: "Loja online · Confeitaria",
    year: "2026",
    updatedAt: "2026-10-19",
    status: "em-curso",
    // Desenho, não fotografia: a loja ainda não está no ar (docs/06).
    image: "/capas/damira-20261019.jpg",
    imageAlt:
      "Desenho da loja online da Confeitaria Damira num telemóvel, ao lado do painel do balcão num tablet e do painel da gerência num portátil.",
    summary:
      "Uma loja online para encomendar, com um painel para o balcão preparar os pedidos e outro para a gerência gerir a casa.",
    services: ["Web Design", "Desenvolvimento", "Painel de Gestão"],
    accent: "primary",
    overview:
      "A Confeitaria Damira, em Ermesinde, junta pastelaria, padaria e cozinha. Quer receber encomendas online sem perder o fio no balcão, e ter num só sítio os produtos, os preços e o que se vende.",
    contribution:
      "Estamos a desenvolver três peças ligadas entre si: a loja online, onde o cliente escolhe e encomenda; o painel do balcão, onde cada pedido entra e se acompanha até ser levantado; e o painel da gerência, para mudar produtos e preços e ver as vendas. Ainda não está no ar."
  },
  {
    slug: "taskuinha-do-pirata",
    name: "Taskuinha do Pirata",
    client: "Rumoceano — Taskuinha",
    category: "Taberna de petiscos",
    year: "2026",
    status: "concluido",
    url: "https://taskuinhapirata.pt",
    image: "/capas/taskuinha-do-pirata.jpg",
    imageAlt:
      "Página inicial da Taskuinha do Pirata, com o nome em letra de tabuleta sobre a fotografia da fachada da taberna à noite e um esqueleto pirata sentado num baú a beber uma cerveja.",
    summary:
      "Um site que veste a decoração da taberna e põe a ementa em quatro línguas, para quem chega pela praia e pelo Caminho de Santiago.",
    services: [
      "Web Design",
      "Desenvolvimento",
      "Menus & Ecrãs Digitais",
      "Painel de Gestão",
    ],
    accent: "accent",
    overview:
      "A Taskuinha do Pirata é uma taberna à beira-mar em Vila Chã, decorada de alto a baixo: barris na fachada a soletrar o nome, tecto de tábuas turquesa com um mural de nau em tempestade e um esqueleto pirata sentado à porta. O pedido do dono foi só um, e não era sobre design — o site não podia parecer uma coisa à parte do restaurante. Quem entrasse tinha de sentir que já estava dentro da casa. E como a porta dá para o Caminho de Santiago, metade de quem chega no Verão não fala português.",
    contribution:
      "Desenhámos e desenvolvemos o site de raiz, com a casa real como referência: madeira, pergaminho e letra de tabuleta, num tema nocturno único, com fotografias do espaço por trás de cada secção. A ementa completa vive numa página só, e o site inteiro fala quatro línguas — português, inglês, francês e espanhol — cada uma com o seu endereço, para se poder enviar a um amigo. Do mesmo desenho saiu a ementa impressa, pronta a entregar na gráfica. O painel de gestão, para a casa mudar pratos e preços sem nos ligar, está em desenvolvimento.",
  },
  {
    slug: "imperio-auto-concept",
    name: "Império Auto Concept",
    client: "Império Auto Concept",
    category: "Stand automóvel",
    year: "2026",
    status: "concluido",
    url: "https://www.imperioautoconcept.com",
    image: "/capas/imperio-auto-concept.jpg",
    imageAlt:
      "Página inicial do Império Auto Concept, com filtro de pesquisa por marca, modelo e combustível sobre uma fotografia de uma viatura.",
    summary:
      "Um stand online com página própria para cada viatura e um painel que liberta a equipa dos portais de classificados.",
    services: ["Web Design", "Desenvolvimento", "Painel de Gestão"],
    accent: "primary",
    overview:
      "O Império Auto Concept vende automóveis e queria deixar de depender dos portais de classificados para mostrar o stock. O desafio era ter um site próprio, onde cada viatura tem a sua página, e que a equipa conseguisse manter atualizado sem nos ligar de cada vez que entra ou sai um carro.",
    contribution:
      "Desenhámos e desenvolvemos o site de raiz, com base de dados própria: cada viatura tem a sua página, e quem chega filtra o stock por marca, modelo e combustível sem sair da página inicial. O painel de gestão, que deixa a equipa publicar novos anúncios, editar os que já existem, gerir as fotografias de cada viatura e retirar do site o que já foi vendido — tudo sem tocar em código —, está em desenvolvimento.",
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

/**
 * Os casos em tópicos curtos — "o que era preciso" e "o que fizemos" —, que é
 * o que a página do caso mostra desde outubro de 2026, por pedido do
 * utilizador. Resumem o `overview` e o `contribution` de cada projeto sem
 * acrescentar nada: as pendências (painéis em desenvolvimento, sites em
 * construção) continuam ditas. O texto longo fica no catálogo. Ver docs/06.
 */
export const notasDoCaso: Record<string, { preciso: string[]; feito: string[] }> = {
  "cafe-preguica": {
    preciso: [
      "Levar a identidade da casa para o digital.",
      "Dar autonomia à equipa para atualizar a carta.",
    ],
    feito: [
      "Site em português e inglês.",
      "Ementa digital e painel de gestão.",
      "QR code e NFC nas mesas.",
    ],
  },
  "cafe-avenida": {
    preciso: [
      "Apresentar o espaço e as sugestões da casa.",
      "Facilitar o acesso à ementa antes e durante a visita.",
    ],
    feito: [
      "Site com galeria, localização e horário.",
      "Ementa em português, inglês e francês.",
      "QR codes nas mesas.",
    ],
  },
  "taskuinha-do-pirata": {
    preciso: [
      "Trazer a decoração da taberna para o site.",
      "Receber quem chega sem falar português.",
    ],
    feito: [
      "Design inspirado na casa real.",
      "Site e ementa em quatro línguas.",
      "Ementa impressa; painel ainda em desenvolvimento.",
    ],
  },
  "imperio-auto-concept": {
    preciso: [
      "Mostrar o stock num site próprio.",
      "Dar uma página a cada viatura.",
    ],
    feito: [
      "Pesquisa por marca, modelo e combustível.",
      "Base de dados e páginas de viaturas.",
      "Painel de gestão em desenvolvimento.",
    ],
  },
  "jsk": {
    preciso: [
      "Organizar várias áreas de negócio.",
      "Manter a navegação clara ao crescer.",
    ],
    feito: [
      "Design e desenvolvimento de raiz.",
      "Serviços com linguagem visual comum.",
      "Preparado para velocidade e pesquisa.",
    ],
  },
  "antonio-home-repair": {
    preciso: [
      "Criar presença online própria.",
      "Facilitar contactos a partir do telemóvel.",
    ],
    feito: [
      "Identidade, design e desenvolvimento.",
      "Serviços organizados e contactos em destaque.",
      "Otimização para mobile e pesquisa local.",
    ],
  },
};

/**
 * O que um projeto **ainda em desenvolvimento** vai ter, em desenhos — para
 * quem não tem endereço nem captura, e não pode mostrar fotografias. Uma frase
 * por peça, sem mais: um trabalho por entregar não se explica em parágrafos.
 * Os desenhos saem de `scripts/desenhar-damira.mjs`. Ver docs/06.
 */
export type Peca = { titulo: string; texto: string; desenho: { src: string; width: number; height: number } };
export const pecasDoCaso: Record<string, Peca[]> = {
  "damira": [
    {
      titulo: "Loja online",
      texto: "O cliente escolhe, junta ao cesto e encomenda, do telemóvel ou do computador.",
      desenho: { src: "/projetos/damira/loja.svg", width: 380, height: 680 },
    },
    {
      titulo: "Painel do balcão",
      texto: "Cada pedido entra na hora e passa de “por preparar” a “pronto” com um toque.",
      desenho: { src: "/projetos/damira/balcao.svg", width: 840, height: 620 },
    },
    {
      titulo: "Painel da gerência",
      texto: "Produtos, preços e horários num só sítio, com as vendas à vista.",
      desenho: { src: "/projetos/damira/gerencia.svg", width: 980, height: 640 },
    },
  ],
};

export type Captura = { src: string; width: number; height: number };

/**
 * Capturas de página inteira dos sites publicados, em computador (1440px) e
 * telemóvel (390px), servidas de `public/casos/`. **Não são sites vivos**: no
 * caso de estudo percorrem-se por scroll dentro de uma moldura, e um clique
 * abre o `url` original. Só existem para projetos com `url` — a Damira ainda
 * não tem endereço, e não se inventa captura.
 * As capturas são verificadas até ao rodapé; páginas com animações usam
 * a apresentação estática original quando disponível. Ver docs/06.
 */
export const capturas: Record<string, { desktop: Captura; mobile: Captura }> = {
  "cafe-preguica": {
    desktop: { src: "/casos/cafe-preguica-desktop-20261019.webp", width: 1440, height: 8367 },
    mobile: { src: "/casos/cafe-preguica-mobile-20261019.webp", width: 390, height: 9547 },
  },
  "cafe-avenida": {
    desktop: { src: "/casos/cafe-avenida-desktop-20261019.webp", width: 1440, height: 5226 },
    mobile: { src: "/casos/cafe-avenida-mobile-20261019.webp", width: 390, height: 5469 },
  },
  "taskuinha-do-pirata": {
    desktop: { src: "/casos/taskuinha-do-pirata-desktop-20261019.webp", width: 1440, height: 7263 },
    mobile: { src: "/casos/taskuinha-do-pirata-mobile-20261019.webp", width: 390, height: 8452 },
  },
  "imperio-auto-concept": {
    desktop: { src: "/casos/imperio-auto-concept-desktop-20261019.webp", width: 1440, height: 4331 },
    mobile: { src: "/casos/imperio-auto-concept-mobile-20261019.webp", width: 390, height: 5718 },
  },
  "jsk": {
    desktop: { src: "/casos/jsk-desktop-20261019.webp", width: 1440, height: 4381 },
    mobile: { src: "/casos/jsk-mobile-20261019.webp", width: 390, height: 7145 },
  },
  "antonio-home-repair": {
    desktop: { src: "/casos/antonio-home-repair-desktop-20261019.webp", width: 1440, height: 3534 },
    mobile: { src: "/casos/antonio-home-repair-mobile-20261019.webp", width: 390, height: 3739 },
  },
};

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Seleção editorial da home, independente da ordem do catálogo completo. */
export const HOME_PROJECT_SLUGS = [
  "cafe-preguica",
  "cafe-avenida",
  "jsk",
  "antonio-home-repair",
  "imperio-auto-concept",
  "taskuinha-do-pirata",
  "damira",
] as const;
export const homeProjects: Project[] = HOME_PROJECT_SLUGS.map((slug) => {
  const project = getProject(slug);
  if (!project) throw new Error(`Projeto da home inexistente: ${slug}`);
  return project;
});
