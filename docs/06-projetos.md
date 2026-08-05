---
doc: projetos
fonte-de-verdade: codigo
controla:
  - lib/projects.ts
  - components/ui/ProjectCard.tsx
  - app/portfolio/page.tsx
  - app/portfolio/[slug]/page.tsx
  - app/page.tsx#projetos
  - public/capas/
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

O campo `image` aponta para um ficheiro em `public/capas/`
(ex.: `/capas/mira-mar.jpg`). Sem `image`, o card cai na forma sólida gerada em
CSS, tingida pelo `accent` — que continua a ser um fallback legítimo, não um erro.

A pasta chama-se `capas/` e não `portfolio/` só por clareza — `public/` tem
precedência sobre a rota `/portfolio/[slug]`, por isso `portfolio/` também
funcionaria (testado). Não há armadilha aqui.

> **Se uma capa não aparecer, confirma primeiro que estás a ver o servidor
> certo.** Um `next start` antigo continua a servir a build velha, e as imagens
> dão 404 como se não existissem. O `pkill -f "next start"` **não os apanha** —
> os processos chamam-se `next-server`. Usa `pgrep -fl next-server` e mata o PID.

Põe sempre `imageAlt` quando houver `image`. Deixa-o vazio (`""`) só se a imagem
for puramente decorativa e o nome do projeto já estiver no texto ao lado.

### Como preparar uma capa nova

Os **originais** (prints em cheio, fotos do telemóvel) vão para `images/` na raiz,
que está no `.gitignore` — não são versionados, porque um print retina anda pelos
5–8 MB e o repositório inchava depressa. O que vai para o site é a versão
otimizada.

```bash
# 1728px de largura, JPEG q82 — de ~5 MB para ~200 KB
sips -Z 1728 --setProperty format jpeg --setProperty formatOptions 82 \
  images/OPrint.png --out public/capas/o-projeto.jpg
```

O nome do ficheiro deve ser o `slug` do projeto.

**Print de um site que já está no ar** — usa o Chrome em headless. O
`--user-agent` de browser real **não é opcional**: sem ele há sites que não
servem as imagens e o print sai com o layout partido (aconteceu com o do
António).

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=2 --window-size=1728,993 \
  --virtual-time-budget=30000 --user-agent="$UA" \
  --screenshot=images/OPrint.png https://exemplo.pt
```

**Foto de um espaço físico** (um ecrã na parede, por exemplo): tira em horizontal,
enquadra de forma a que o conteúdo do ecrã se leia, e evita contraluz. O card
recorta a 16/10 e o topo do caso de estudo a 16/9 — o que importa deve ficar ao
centro.

## Checklist — adicionar um caso de estudo

1. Objeto novo em `lib/projects.ts`, na posição certa (o 1.º é o destaque).
2. `status` correto e o texto no tempo verbal certo (presente/passado).
3. `accent` a alternar com o vizinho.
4. `services` com nomes que existam em `lib/services.ts`.
5. `url` só se estiver no ar.
6. Capa em `public/capas/` + `image` e `imageAlt` — ou nenhum dos dois.
7. Confere as grelhas (tabela acima).
8. Nada mais: o `sitemap`, o `generateStaticParams` e a navegação "próximo
   projeto" leem todos do array e atualizam-se sozinhos.

## Lacunas por preencher

Isto é trabalho conhecido em falta. Apaga a linha quando estiver feita.

- [ ] **A Barraquinha Nova** — sem capa. Falta a **foto da televisão no espaço a
      passar a ementa** — é o que torna este projeto legível num relance, porque
      metade da entrega é física. Instagram: `@a_barraquinha_nova`. Morada:
      Esplanada Fernando Ermida, 5, Praia da Granja, São Félix da Marinha.
- [ ] **URLs** do Império, do Mira Mar e da Barraquinha — nenhum está no ar.
      Acrescentar `url` quando estiverem.
- [ ] **Estado** desses três — passar a `"concluido"` e virar o texto para o
      passado quando forem entregues.

Já resolvido: as capas do Império Auto Concept, do Mira Mar, da JSK e da António
Home Repair.

## Ao alterar este documento

| Se mudares… | Faz também |
| --- | --- |
| a lista de projetos | `lib/projects.ts`; segue a checklist acima toda |
| a ordem | lembra-te que o 1.º é o destaque da homepage |
| o `status` de um projeto | vira também o tempo verbal do `overview` e do `contribution` |
| o shape do `Project` | `lib/projects.ts` (tipo) e `components/ui/ProjectCard.tsx` |
| como as capas funcionam | `components/ui/ProjectCard.tsx` e `app/portfolio/[slug]/page.tsx` — os dois renderizam capa |
| resolveres uma lacuna | apaga a linha da lista acima |
