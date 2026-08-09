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

- `app/servicos/page.tsx` — lista completa, em `divide-y` (aguenta qualquer número);
- `app/page.tsx` — teaser, numa grelha `sm:grid-cols-2`.

## A grelha da página inicial

`sm:grid-cols-2` com 6 serviços dá **3 linhas certas**. Com 5 ou 7 fica um card
órfão na última linha.

Se passares para um número ímpar, ou acrescentas outro para emparelhar, ou cortas
o teaser com `services.slice(0, 6)` — o botão "Todos os serviços" já lá está, o
teaser não tem de ser exaustivo. **Não deixes o órfão.**

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

## Ao alterar este documento

| Se mudares…                         | Faz também                                                     |
| ----------------------------------- | -------------------------------------------------------------- |
| a lista de serviços                 | `lib/services.ts`; segue a checklist acima toda                |
| uma resposta da FAQ sobre dinheiro  | confirma com o Gonçalo **antes** — ver "A FAQ não é copy"      |
| o número de serviços                | verifica a grelha `sm:grid-cols-2` em `app/page.tsx`           |
| um `title`                          | procura esse nome nas `services` de `lib/projects.ts` e alinha |
| as regras de escrita (blurb, items) | revê os 6 serviços existentes de uma vez                       |
