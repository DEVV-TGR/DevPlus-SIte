---
doc: servicos
fonte-de-verdade: codigo
controla:
  - lib/services.ts
  - app/servicos/page.tsx
  - app/page.tsx#servicos
relacionado:
  - docs/01-marca.md
  - docs/06-projetos.md
---

# Serviços

**A lista vive em `lib/services.ts`** e é a fonte de verdade — este doc não a
copia, para não haver duas listas a divergir. Vai lá ver quais são.

São **6**. Aparecem em dois sítios, ambos a ler do mesmo array:

- `app/servicos/page.tsx` — os seis, no **acordeão de colunas** do
  `components/paginas/ServicosAcordeao.tsx` (aguenta qualquer número: as colunas
  repartem a largura entre si). **No telemóvel o acordeão deita-se e perde o
  pin** — seis linhas abertas que se lêem de uma vez; com pin, cobrava 3,4 ecrãs
  de scroll para mostrar o que já estava no ecrã. **Os seis têm figura**, todas
  da família do atelier (acrílico laranja, vidro verde, alumínio), lidas de
  `atelierAssets` em `components/atelier/assets.ts` (docs/10): Web Design,
  Desenvolvimento v3, menus/NFC, painel, e as esculturas novas de **Branding**
  e **Motion & Interação**. No telemóvel a figura encolhe para 44px ao lado do
  título;
- `app/page.tsx` — os **quatro primeiros**, um de cada vez, na
  `components/home/ServicosMostra.tsx`: número enorme, figura num círculo e uma
  meia-roda à direita para escolher qual. Vem **depois** do trabalho
  selecionado — a oferta a seguir à prova, não antes; ver `docs/04`, "A homepage
  conta uma história".

O bloco **"Como trabalhamos"** (os quatro passos) vive nesta página desde agosto
de 2026, entre a lista de serviços e "Por onde podemos começar". Veio da
homepage. A página lê-se: o que fazemos → como o fazemos → por onde começar →
dúvidas → contacto.

## A página inicial mostra quatro, não seis

A `ServicosMostra` corta em `services.slice(0, FIGURAS.length)` — hoje quatro, que
são os que têm ilustração. **A página inicial apresenta, a `/servicos` cataloga**,
e o botão "Todos os serviços" trata do resto; um teaser não tem de ser exaustivo.

Se acrescentares figuras, a roda aguenta mais um segmento ou dois — mas o arco é
de 168° e reparte-se pelos serviços que lá estão: a seis, cada fatia fica com 28°,
que a 390px é um alvo que já se erra. Antes de passar de cinco, vê o desenho.

## Como se escreve um serviço

```ts
{
  title: "Painel de Gestão",     // curto, em português, sem jargão inglês
  blurb: "…",                     // 2 frases: o que é + o que o cliente ganha
  items: ["Backoffice", "Base de dados", "Agendamento"],  // exatamente 3
}
```

- **`title`** em português. Evita "digital signage", "CMS headless" como título —
  o cliente-alvo é um restaurante ou um stand, não uma agência. (Dentro dos
  `items` o termo técnico já passa.)
- **`blurb`**: a primeira frase diz o que é, a segunda diz o que o cliente ganha.
  A segunda frase é a que vende. Compara: "Mudas o preço num sítio e muda em todo
  o lado" contra "solução centralizada de gestão de conteúdos".
- **`items`**: sempre 3. Dois parecem pobres, quatro rebentam a linha em mobile.
- Tratamento por "tu", como no resto do site (ver `docs/01`).

## A FAQ não é copy — é compromisso comercial

As perguntas frequentes vivem em `app/servicos/page.tsx` e alimentam também os
dados estruturados (`FaqJsonLd`). Quatro delas descrevem **como o negócio
funciona**, não como a marca soa:

| Pergunta                                | O que o site compromete hoje                                                                              |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Quanto custa um site?                   | Valor combinado antes de começar, **ajustável** se o âmbito mudar — e sempre falado antes de ser feito      |
| O site vai ser mesmo meu?               | O site e o conteúdo são do cliente; **o alojamento e o suporte ficam com a DevPlus, por mensalidade**       |
| Tratam do alojamento e do domínio?      | Sim, e o alojamento entra nessa mensalidade                                                                 |
| Dão apoio depois do lançamento?         | Sim, é o que a mensalidade cobre                                                                            |

**Não se alteram por iniciativa tua — pergunta primeiro.** Uma frase mais
bonita que prometa "orçamento fixo" ou "sem mensalidades" deixa de ser copy e
passa a ser uma promessa que a DevPlus não cumpre — foi exatamente o que
aconteceu até agosto de 2026, com o site a dizer "sem dependências nem
mensalidades obrigatórias" enquanto o modelo assentava no contrário.

A mensalidade escreve-se como o que é: alguém do outro lado, site sempre no ar e
atualizado. Não se esconde nem se pede desculpa por ela.

## Ordem

A ordem do array é a ordem no site. Está pensada assim: os dois primeiros são o
que qualquer cliente entende (Web Design, Desenvolvimento); os dois do meio são o
que nos distingue (Menus & Ecrãs Digitais, Painel de Gestão); os dois últimos são
complementares (Branding, Motion).

Um serviço que já foi entregue a um cliente e não está nesta lista é uma
oportunidade desperdiçada — é por isso que o Painel de Gestão tem linha própria
em vez de ficar diluído numa frase do serviço de Desenvolvimento.

## Checklist — adicionar um serviço

1. Acrescenta o objeto em `lib/services.ts`, na posição certa (ver "Ordem").
2. **Confere a grelha da homepage** — ficou par? (ver acima)
3. Acrescenta o termo ao array `disciplines` em `app/page.tsx` (o marquee).
4. Atualiza a `description` da metadata em `app/servicos/page.tsx`, que enumera
   os serviços, e o `intro` do `PageHero` dessa página.
5. Se houver um projeto que o demonstre, usa o mesmo nome nas `services` desse
   projeto em `lib/projects.ts` — os nomes devem bater certo entre as duas listas.

## Os pacotes vivem em `lib/packages.ts`

Estiveram escritos à mão dentro de `app/servicos/page.tsx` até a página inicial
passar a mostrá-los também. Saíram de lá nessa altura: duas cópias da mesma
lista divergem ao segundo mês, e a que fica desatualizada é sempre a que o
cliente lê primeiro.

**Não levam preços, e isso é deliberado.** O valor sai de uma proposta, depois
de se perceber o âmbito — é um compromisso comercial e não copy, pela mesma
razão que as respostas do FAQ não se reescrevem sem confirmação.

Só um pacote pode ter `featured` — e o que ele faz é **pintar o card inteiro de
laranja** na página inicial, não só pôr-lhe a etiqueta "Mais escolhido". Marcar
dois destrói o sinal: dois recomendados não recomendam nada. As regras de cor e
de contraste desse card estão no `docs/04`, em "O pacote destacado é um ground,
não uma etiqueta".

## Ao alterar este documento

| Se mudares…                         | Faz também                                                     |
| ----------------------------------- | -------------------------------------------------------------- |
| a lista de serviços                 | `lib/services.ts`; segue a checklist acima toda                |
| uma resposta da FAQ sobre dinheiro  | pergunta **antes** de mexer — ver "A FAQ não é copy"           |
| o número de serviços                | verifica a meia-roda da página inicial (ver acima: o arco reparte-se) **e** o acordeão da `/servicos`: acima de sete colunas, as fechadas deixam de se ler |
| acrescentares um serviço com figura | o bitmap entra pelo catálogo do docs/10 (`components/atelier/assets.ts` e `public/atelier/`) e a chave vai para os **dois** `FIGURAS` — `components/paginas/ServicosAcordeao.tsx` e `components/home/ServicosMostra.tsx`; a ordem é a de `lib/services.ts`, e é o segundo que decide quantos a página inicial mostra |
| um `title`                          | procura esse nome nas `services` de `lib/projects.ts` e alinha |
| as regras de escrita (blurb, items) | revê os 6 serviços existentes de uma vez                       |

| acrescentares ou mudares um pacote | `lib/packages.ts` — a página inicial e a `/servicos` leem ambas de lá        |

## Home de outubro de 2026

A meia-roda e a escolha por scroll, hover, clique e teclado são preservadas.
Cada cena liga a um trabalho real: JSK, Império Auto Concept ou Café Preguiça.
Os menus do Preguiça incluem QR code e NFC; o painel é um exemplo separado.
Os pacotes mantêm o conteúdo comercial; a etiqueta do Website passa a
"Website completo", sem alegar popularidade sem dados.

## Apresentação atelier — 17 de outubro

Na home, a meia-roda mantém quatro serviços. As quatro figuras são esculturas
da mesma família — acrílico laranja, vidro verde e alumínio — e o `alt` de cada
uma diz que é uma ilustração conceptual. Desenvolvimento usa
`desenvolvimento-digital-v3.webp`, um browser montado por camadas, por decisão
do utilizador; a prova real continua no link "Ver o Império Auto Concept" e no
caso de estudo. Os pacotes da home são três placas comparáveis, cada uma com o
objeto do seu pacote (folha, camadas, expositor — docs/10); o Website destaca-se
pela placa forest/mint **e** pelo botão cheio em vez de contorno (o sinal não
pode ser só cor), sem etiqueta, sem alegações de popularidade e sem mudanças
aos compromissos comerciais. A etiqueta "Website completo" descrita acima
deixou de existir na home.

No telemóvel, a `/servicos` mostra os seis serviços num carril
(`components/paginas/Carril.tsx`): objeto, nome, texto, etiquetas e "Falar
sobre isto", a mesma ação da home. O acordeão fica a partir de 768px.

Na `/servicos` o acordeão usa as seis figuras da família. Os pacotes usam a
mesma `PackagePlates` da home: objetos landing/development v3/commerce,
Website em forest/mint, CTA cheio, sem alegação de popularidade. O percurso
usa cristal, os pacotes cetim quente e a FAQ acabamento mate. As perguntas
abrem individualmente por `details`, com a primeira aberta; o texto comercial
continua a ser a fonte do FAQ visível e dos dados estruturados.

Os títulos seguem a escala partilhada de `docs/02`: principais com o mesmo
tamanho da home, títulos de cartões a 24px. Sem escalas próprias por página.

## A demo grátis e os atalhos do contacto — 18 de outubro

**Compromisso comercial confirmado pela equipa:** a DevPlus faz uma **demo
grátis** de qualquer serviço, **só da parte visual**. As funcionalidades
discutem-se depois e fazem-se à medida. O próprio atalho "Pedir demo grátis"
diz exatamente isto, por baixo do nome, e não se promete mais em lado nenhum. **Não há "orçamento grátis"** — foi considerado e não escolhido.

Os atalhos do formulário (`GRUPOS_INTERESSE` em `lib/contacto.ts`) são a
demo, os seis serviços de `lib/services.ts` e os três pacotes de
`lib/packages.ts`, por esta ordem: um serviço ou pacote novo ganha atalho
sozinho. O id é o nome sem acentos (`idInteresse`): `menus-ecras-digitais`,
`landing-page`. Os botões "Pedir proposta" (pacotes) e "Falar sobre isto"
(serviços) abrem o contacto com o assunto já escolhido (`contactoCom`).

### Apresentação das perguntas

`Perguntas.tsx` recebe o mesmo array usado pelo FaqJsonLd; o texto e os
compromissos comerciais mantêm-se. A abertura e o fecho animam a altura,
incluindo no Safari, conforme docs/04. As mudanças de ground à entrada e
saída dos pacotes usam Curva, em continuidade com os materiais das secções.
