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
  /** O site a fazer scroll num iPhone, no caso de estudo. **Só com site no ar**
   *  — é um vídeo do site verdadeiro, e um site por acabar não se grava. Os
   *  ficheiros saem de `scripts/gravar-telemovel.mjs` para /public/telemovel. */
  mobile?: { video: string; poster: string; alt: string };
  /** Corpo do caso de estudo. */
  overview: string;
  contribution: string;
};

/**
 * O primeiro da lista é o primeiro a entrar na faixa da página inicial.
 * A cor de capa alterna entre `primary` e `accent` — ver docs/06.
 */
export const projects: Project[] = [
  {
    slug: "cafe-preguica",
    name: "Café Preguiça",
    client: "Café Preguiça",
    category: "Cocktails & petiscos",
    year: "2026",
    status: "concluido",
    url: "https://www.cafepreguica.pt",
    image: "/capas/cafe-preguica.jpg",
    imageAlt:
      "Página inicial do Café Preguiça, com o logótipo da preguiça sobre uma fotografia da fachada amarela da casa entre árvores, e os botões para ver a ementa e saber onde fica.",
    mobile: {
      video: "/telemovel/cafe-preguica.mp4",
      poster: "/telemovel/cafe-preguica.jpg",
      alt: "O site do Café Preguiça num telemóvel, a descer a página inicial toda: a fachada, a casa, o carril de cocktails a passar de lado, as avaliações do Google, o mapa e o horário.",
    },
    summary:
      "Um site com a preguiça da casa pendurada na página, e uma carta em português e inglês que abre do QR da mesa e que a equipa muda sozinha.",
    services: [
      "Web Design",
      "Desenvolvimento",
      "Menus & Ecrãs Digitais",
      "Painel de Gestão",
    ],
    accent: "primary",
    overview:
      "O Café Preguiça é um bar de cocktails e petiscos em Ermesinde, com esplanada e uma preguiça por mascote. A carta vivia em papel e nas redes sociais, e não havia um sítio só onde se visse o que a casa serve, a que horas abre e onde fica. Queriam um site com a personalidade do espaço e uma carta que se abrisse à mesa, sem app nem PDF.",
    contribution:
      "Desenhámos e desenvolvemos o site de raiz, com a preguiça do logótipo a acompanhar quem desce a página inicial. A carta tem mais de cem artigos, em português e inglês, e abre a partir de um QR em cada uma das 22 mesas — os autocolantes também saíram daqui. Pelo painel de gestão, a casa muda preços, esconde o que acabou, atualiza o horário e as redes, e escreve a newsletter a quem se inscreveu no site, tudo sem nos ligar.",
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
    mobile: {
      video: "/telemovel/taskuinha-do-pirata.mp4",
      poster: "/telemovel/taskuinha-do-pirata.jpg",
      alt: "O site da Taskuinha do Pirata num telemóvel, a descer da tabuleta com o nome da taberna pelas secções da casa.",
    },
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
    mobile: {
      video: "/telemovel/imperio-auto-concept.mp4",
      poster: "/telemovel/imperio-auto-concept.jpg",
      alt: "O site do Império Auto Concept num telemóvel, a descer da pesquisa de viaturas pelo stock em destaque.",
    },
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
    mobile: {
      video: "/telemovel/antonio-home-repair.mp4",
      poster: "/telemovel/antonio-home-repair.jpg",
      alt: "O site da António Home Repair Services num telemóvel, a descer do título pelos serviços e pelos contactos.",
    },
    summary:
      "Um site que troca o passa-palavra por contactos que chegam do telemóvel, para quem repara e mantém casas ao domicílio.",
    services: ["Web Design", "Desenvolvimento"],
    accent: "accent",
    overview:
      "A António Home Repair Services queria deixar de depender do passa-palavra e passar a ter presença online própria — um site que explicasse os serviços e tornasse o contacto imediato, sobretudo a partir do telemóvel.",
    contribution:
      "Tratámos da identidade, do design e do desenvolvimento. Organizámos os serviços de forma legível, demos destaque às chamadas para ação e otimizámos para mobile e pesquisa local, onde estão os clientes deste tipo de negócio.",
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
    mobile: {
      video: "/telemovel/jsk.mp4",
      poster: "/telemovel/jsk.jpg",
      alt: "O site da JSK num telemóvel, a descer da página inicial pelas áreas de serviço.",
    },
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
    slug: "confeitaria-damira",
    name: "Confeitaria Damira",
    client: "Confeitaria Damira",
    category: "Pastelaria e confeitaria",
    year: "2026",
    status: "em-curso",
    image: "/capas/confeitaria-damira.jpg",
    imageAlt:
      "Página da Confeitaria Damira sobre a porta da casa, com a morada em letra grande ao lado de uma fotografia da montra, onde se lê Pão Quente e Histórias com sabor.",
    summary:
      "Uma pastelaria de bairro com loja online: a carta inteira, encomendas de bolos e kits de festa com dia de levantamento, e um painel para o balcão.",
    services: ["Web Design", "Desenvolvimento", "Painel de Gestão"],
    accent: "accent",
    overview:
      "A Confeitaria Damira faz pastelaria, padaria e cozinha em Ermesinde desde 1996. As encomendas — bolos de aniversário, kits de festa, boxes — chegavam por telefone e por mensagem, e a casa queria que se pudessem fazer a qualquer hora, sem perder o trato de balcão que os clientes já conhecem.",
    contribution:
      "Estamos a construir o site e a loja de raiz, em português e inglês. A ementa mostra as quatro cartas, com uma página para cada artigo; as encomendas juntam os bolos por medida, os kits de festa e as boxes, com a escolha do dia de levantamento e o pagamento online. Para a equipa, estamos a fazer um painel pensado para o tablet do balcão, onde entram os pedidos do dia, com uma vista de gestão à parte para a gerência.",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
