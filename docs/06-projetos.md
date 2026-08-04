---
doc: projetos
fonte-de-verdade: codigo
controla:
  - lib/projects.ts
  - components/ui/ProjectCard.tsx
  - app/portfolio/page.tsx
  - app/portfolio/[slug]/page.tsx
  - app/page.tsx#projetos
  - public/portfolio/
relacionado:
  - docs/05-servicos.md
---

# Projetos

**A lista vive em `lib/projects.ts`** e é a fonte de verdade — este doc não a
copia. Vai lá ver quais são e em que estado estão.

## Regras que não estão no código

**O primeiro do array é o destaque.** `app/page.tsx` faz
`const [featured, ...rest] = projects` — o primeiro sai num card grande, os
restantes na grelha por baixo. Reordenar o array reordena o site.

**A cor alterna.** O campo `accent` (`primary` | `accent`) tinge a capa. Alterna
ao longo do array para as capas não ficarem todas da mesma cor lado a lado.

**Os nomes dos serviços têm de bater certo** com os `title` de `lib/services.ts`.
Se um projeto lista "Painel de Gestão", esse serviço tem de existir na outra lista
— senão o portfólio anuncia um serviço que a página de serviços não descreve.

**`url` só quando o site está mesmo no ar.** Sem `url`, o caso de estudo não
mostra o botão "Visitar site". Um link para uma página vazia é pior do que link
nenhum.

**`status: "em-curso"`** mostra a etiqueta verde no card e no caso de estudo, e o
texto deve estar no **presente** ("Estamos a construir…"). `"concluido"` usa o
passado ("Desenhámos e desenvolvemos…"). Quando um projeto acabar, muda as duas
coisas ao mesmo tempo — o campo e o tempo verbal.

## As grelhas

| Onde | Classe | Conta |
| --- | --- | --- |
| `app/page.tsx` (projetos) | 1 destaque + `md:grid-cols-2` | `rest` tem de ser **par** |
| `app/portfolio/page.tsx` | `sm:grid-cols-2` | o total tem de ser **par** |
| `app/page.tsx` (clientes) | `flex-wrap` | qualquer número |

Com 5 projetos: `rest` = 4 (2 linhas certas) e o portfólio tem 5 → uma linha fica
com um card sozinho, o que é aceitável numa lista completa mas não no teaser.
**Ao chegar a 6, confere as duas.**

## Capas

O campo `image` aponta para um ficheiro em `public/portfolio/`
(ex.: `/portfolio/miramar.jpg`). Sem `image`, o card cai na forma sólida gerada em
CSS, tingida pelo `accent` — que continua a ser um fallback legítimo, não um erro.

Põe sempre `imageAlt` quando houver `image`. Deixa-o vazio (`""`) só se a imagem
for puramente decorativa e o nome do projeto já estiver no texto ao lado.

## Checklist — adicionar um caso de estudo

1. Objeto novo em `lib/projects.ts`, na posição certa (o 1.º é o destaque).
2. `status` correto e o texto no tempo verbal certo (presente/passado).
3. `accent` a alternar com o vizinho.
4. `services` com nomes que existam em `lib/services.ts`.
5. `url` só se estiver no ar.
6. Capa em `public/portfolio/` + `image` e `imageAlt` — ou nenhum dos dois.
7. Confere as grelhas (tabela acima).
8. Nada mais: o `sitemap`, o `generateStaticParams` e a navegação "próximo
   projeto" leem todos do array e atualizam-se sozinhos.

## Lacunas por preencher

Isto é trabalho conhecido em falta. Apaga a linha quando estiver feita.

- [ ] **Império Auto Concept** — sem capa. Procurei online e não encontrei a
      empresa; as contas com nomes parecidos ("Império Automóvel", Trofa) são
      outros negócios e **não devem ser usadas**. Falta o logo/fotos.
- [ ] **Miramar** — sem capa.
- [ ] **A Barraquinha Nova** — sem capa. Existe Instagram: `@a_barraquinha_nova`.
      Morada confirmada: Esplanada Fernando Ermida, 5, Praia da Granja,
      São Félix da Marinha.
- [ ] **URLs** dos três — nenhum está no ar. Acrescentar `url` quando estiverem.
- [ ] **Estado** dos três — passar a `"concluido"` e virar o texto para o passado
      quando forem entregues.

## Ao alterar este documento

| Se mudares… | Faz também |
| --- | --- |
| a lista de projetos | `lib/projects.ts`; segue a checklist acima toda |
| a ordem | lembra-te que o 1.º é o destaque da homepage |
| o `status` de um projeto | vira também o tempo verbal do `overview` e do `contribution` |
| o shape do `Project` | `lib/projects.ts` (tipo) e `components/ui/ProjectCard.tsx` |
| como as capas funcionam | `components/ui/ProjectCard.tsx` e `app/portfolio/[slug]/page.tsx` — os dois renderizam capa |
| resolveres uma lacuna | apaga a linha da lista acima |
