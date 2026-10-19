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
    updatedAt: "2026-10-16",
    status: "em-curso",
    image: "/capas/damira.jpg",
    imageAlt:
      "Pré-visualização do site da Confeitaria Damira, com os produtos e a identidade da marca.",
    summary:
      "Uma loja online em desenvolvimento para levar os produtos da confeitaria até ao pedido, com uma experiência à medida da casa.",
    services: ["Web Design", "Desenvolvimento"],
    accent: "primary",
    overview:
      "A Confeitaria Damira, em Ermesinde, junta pastelaria, padaria e cozinha. O projeto precisa de apresentar essa variedade com clareza e dar aos clientes uma forma simples de escolher produtos e preparar encomendas online.",
    contribution:
      "Estamos a desenvolver a loja online e a organizar a carta, os produtos por encomenda e os kits de festa. O trabalho já inclui a apresentação dos produtos em português e inglês, páginas de detalhe e um cesto para preparar o pedido. A loja continua em desenvolvimento; as funcionalidades previstas para o lançamento não são apresentadas como já entregues.",
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
  "damira": {
    preciso: [
      "Mostrar a variedade da confeitaria.",
      "Preparar encomendas online de forma simples.",
    ],
    feito: [
      "Loja online em desenvolvimento.",
      "Produtos em português e inglês.",
      "Páginas de detalhe e cesto para preparar o pedido.",
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
  "mira-mar": {
    preciso: [
      "Apresentar o restaurante.",
      "Substituir a ementa impressa.",
    ],
    feito: [
      "Landing page em construção.",
      "Ementas digitais e programação de menus.",
      "QR codes na sala e na esplanada.",
    ],
  },
  "a-barraquinha-nova": {
    preciso: [
      "Atualizar preços sem reimprimir a carta.",
      "Mostrar a ementa no telemóvel e na sala.",
    ],
    feito: [
      "Menu digital em implementação.",
      "Televisão com a ementa em loop.",
      "Um menu sincronizado nos dois suportes.",
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

export type Captura = { src: string; width: number; height: number };

/**
 * Capturas de página inteira dos sites publicados, em computador (1440px) e
 * telemóvel (390px), servidas de `public/casos/`. **Não são sites vivos**: no
 * caso de estudo percorrem-se por scroll dentro de uma moldura, e um clique
 * abre o `url` original. Só existem para projetos com `url` — Damira, Mira Mar
 * e Barraquinha ainda não têm endereço, e não se inventa captura.
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
