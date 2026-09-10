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
  de scroll para mostrar o que já estava no ecrã. Há ilustração para quatro; o **Branding** e o
  **Motion & Interação** ficam com o "+" em marca-d'água em vez de uma figura
  emprestada de outro serviço — se forem geradas, é com o preâmbulo do
  `scrollcraft/builds/devplus/PLANO-V3.md`, que é o que mantém as nove atuais no
  mesmo estilo;
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

**Não se alteram sem confirmação do Gonçalo.** Uma frase mais bonita que
prometa "orçamento fixo" ou "sem mensalidades" deixa de ser copy e passa a ser
uma promessa que a DevPlus não cumpre — foi exatamente o que aconteceu até
agosto de 2026, com o site a dizer "sem dependências nem mensalidades
obrigatórias" enquanto o modelo assentava no contrário.

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

Só um pacote pode ter `featured`.

## Ao alterar este documento

| Se mudares…                         | Faz também                                                     |
| ----------------------------------- | -------------------------------------------------------------- |
| a lista de serviços                 | `lib/services.ts`; segue a checklist acima toda                |
| uma resposta da FAQ sobre dinheiro  | confirma com o Gonçalo **antes** — ver "A FAQ não é copy"      |
| o número de serviços                | verifica a meia-roda da página inicial (ver acima: o arco reparte-se) **e** o acordeão da `/servicos`: acima de sete colunas, as fechadas deixam de se ler |
| acrescentares um serviço com figura | põe-na em `public/ilustra/` e acrescenta-a aos **dois** `FIGURAS` — `components/paginas/ServicosAcordeao.tsx` e `components/home/ServicosMostra.tsx`; a ordem é a de `lib/services.ts`, e é o segundo que decide quantos a página inicial mostra |
| um `title`                          | procura esse nome nas `services` de `lib/projects.ts` e alinha |
| as regras de escrita (blurb, items) | revê os 6 serviços existentes de uma vez                       |

| acrescentares ou mudares um pacote | `lib/packages.ts` — a página inicial e a `/servicos` leem ambas de lá        |
