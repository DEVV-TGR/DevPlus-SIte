---
doc: projetos
fonte-de-verdade: codigo
controla:
  - lib/projects.ts
  - components/ui/ProjectCard.tsx
  - components/ProjectsMarquee.tsx
  - app/portfolio/page.tsx
  - app/portfolio/[slug]/page.tsx
  - app/page.tsx#projetos
  - public/capas/
  - public/telemovel/
  - components/TelemovelVideo.tsx
  - scripts/gravar-telemovel.mjs
  - next.config.ts#redirects
relacionado:
  - docs/05-servicos.md
---

# Projetos

**A lista vive em `lib/projects.ts`** e é a fonte de verdade — este doc não a
copia. Vai lá ver quais são e em que estado estão.

## Regras que não estão no código

**O primeiro do array é o primeiro a entrar em cena.** Na página inicial os
projetos passam todos numa faixa contínua (`ProjectsMarquee`), ao mesmo tamanho —
já não há card de destaque. Reordenar o array continua a reordenar o site, mas o
primeiro lugar deixou de valer tamanho: vale só a ordem de aparição. Um destaque
por tamanho, se voltar a fazer falta, tem de ser reintroduzido de propósito.

**A cor alterna.** O campo `accent` (`primary` | `accent`) tinge a capa. Alterna
ao longo do array para as capas não ficarem todas da mesma cor lado a lado.

**Os nomes dos serviços têm de bater certo** com os `title` de `lib/services.ts`.
Se um projeto lista "Painel de Gestão", esse serviço tem de existir na outra lista
— senão o portfólio anuncia um serviço que a página de serviços não descreve.

**`url` só quando o site está mesmo no ar.** Sem `url`, o caso de estudo não
mostra o botão "Visitar site". Um link para uma página vazia é pior do que link
nenhum.

**`updatedAt` só quando o caso de estudo for reescrito.** É a data — `YYYY-MM-DD` —
em que o **texto** mudou, e não o ano do trabalho (`year`) nem a data do deploy. É
o único campo que o `app/sitemap.ts` aceita como `lastModified`, e é opcional de
propósito: hoje nenhum projeto o tem e o sitemap sai sem datas, que é a resposta
certa enquanto ninguém reescrever nada. **Não o preenchas em massa** — seis
projetos com a mesma data inventada é o sinal falso que o `docs/01` proíbe.

**O botão "Visitar site" é `variant="primary"`** — laranja cheio, e é o único
botão de todo o caso de estudo. Era `outline` e passava despercebido: a página
que mostra o trabalho feito tinha o link para esse trabalho como o elemento mais
apagado do ecrã. Não uses o verde para o tornar mais vivo — o `docs/02` reserva o
`accent` para estado (a etiqueta "Em curso", logo ali ao lado) e para o anel de
foco de todo o site, e proíbe-o como segunda cor de CTA.

**`status: "em-curso"`** mostra a etiqueta verde no card e no caso de estudo, e o
texto deve estar no **presente** ("Estamos a construir…"). `"concluido"` usa o
passado ("Desenhámos e desenvolvemos…"). Quando um projeto acabar, muda as duas
coisas ao mesmo tempo — o campo e o tempo verbal.

## As grelhas

| Onde                      | Classe           | Conta                        |
| ------------------------- | ---------------- | ---------------------------- |
| `app/page.tsx` (projetos) | faixa contínua   | qualquer número — ver abaixo |
| `app/portfolio/page.tsx`  | `sm:grid-cols-2` | o total tem de ser **par**   |
| `app/page.tsx` (clientes) | `flex-wrap`      | qualquer número              |

A página inicial deixou de ter grelha de projetos, e com ela caiu a regra de o
resto ter de ser par. A faixa aceita qualquer número, mas **abaixo de 3 projetos
não a uses**: com dois, o mesmo card volta a entrar no ecrã antes de o original
sair e a repetição fica à vista.

A lista repete-se **três vezes** no markup (`RONDAS` em `components/ProjectsMarquee.tsx`).
Duas chegavam para o ciclo fechar, mas em ecrãs largos a volta acontecia dentro do
campo de visão. Só a primeira ronda conta para o teclado e para o leitor de ecrã; as
outras são clicáveis à mesma — ver `docs/04`.

Com 6 projetos o portfólio fecha três linhas cheias e já não há card sozinho ao
fundo. **Ao chegar a 7, volta a conferir `app/portfolio/page.tsx`** — a linha
órfã regressa a cada número ímpar.

## Capas

O campo `image` aponta para um ficheiro em `public/capas/`
(ex.: `/capas/jsk.jpg`). Sem `image`, o card cai na forma sólida gerada em
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

## Vídeo no telemóvel

O caso de estudo mostra, a seguir ao texto, o site a fazer scroll dentro de um
iPhone. A capa mostra o desktop; isto mostra o mesmo site no ecrã pequeno. Só
aparece quando o projeto tem `mobile` em `lib/projects.ts`.

**Só com site no ar.** É uma gravação do site verdadeiro. Um projeto
`"em-curso"` sem domínio fica sem vídeo — gravar o servidor de
desenvolvimento era mostrar como acabado o que ainda não está.

```bash
node scripts/gravar-telemovel.mjs <slug> <url>
# opções: --ecras 5 (quantos ecrãs desce) · --esconder "<css>" (o que tapar)
```

Sai `public/telemovel/<slug>.mp4` e `<slug>.jpg` (o poster, que é o primeiro
frame). O script:

- grava a 390×844 — o tamanho de um iPhone em pontos — e a 2x. **A proporção
  tem de bater com o ecrã do `components/ui/IPhone.tsx`**, ou o vídeo fica
  cortado;
- aceita os cookies e fecha pop-ups (newsletter, avisos) antes de gravar — se
  um escapar, usa `--esconder`;
- percorre a página uma vez antes de gravar, para as imagens preguiçosas
  carregarem;
- desce, pára e volta ao topo, para o loop fechar sem salto;
- tira um print por frame em vez de usar o `recordVideo` do Playwright, que
  sai borrado. Demora cerca de um minuto por site.

**Peso: até ~2,5 MB por vídeo.** Sai a 600px de largura, H.264, CRF 28 e sem
áudio. Um site com muita textura (a Taskuinha) passa disso; volta a encodar
com `-crf 31`. O `TelemovelVideo` usa `preload="none"`, por isso só se
descarrega quando o iPhone entra no ecrã — mas o peso conta à mesma para
quem lá chega com dados móveis.

**Movimento reduzido:** com `prefers-reduced-motion` o vídeo não arranca e
fica o poster. Fora do ecrã, pausa.

**O `alt`** descreve o que o vídeo mostra (o site de quem, de onde para onde
desce), não o que é ("vídeo de um site").

## Checklist — adicionar um caso de estudo

1. Objeto novo em `lib/projects.ts`, na posição certa (o 1.º abre a faixa).
2. `status` correto e o texto no tempo verbal certo (presente/passado).
3. `accent` a alternar com o vizinho.
4. `services` com nomes que existam em `lib/services.ts`.
5. `url` só se estiver no ar.
6. Capa em `public/capas/` + `image` e `imageAlt` — ou nenhum dos dois.
7. `mobile` (o vídeo no iPhone) **só se o site estiver no ar** — ver "Vídeo no
   telemóvel".
8. **Sem `updatedAt`.** Um caso de estudo novo não é uma reescrita; o campo só
   entra da segunda vez que o texto mudar.
9. Confere as grelhas (tabela acima).
10. Nada mais: o `sitemap`, o `generateStaticParams` e a navegação "próximo
    projeto" leem todos do array e atualizam-se sozinhos.

## Lacunas por preencher

Isto é trabalho conhecido em falta. Apaga a linha quando estiver feita.

- [ ] **Painel de gestão da Taskuinha** — o card já anuncia o serviço e o
      `contribution` diz que está em desenvolvimento. Quando estiver entregue,
      tira a última frase do `contribution`.
- [ ] **Painel de gestão do Império** — o site já está no ar e o projeto passou a
      `"concluido"`, mas o painel ainda não foi entregue. O `contribution` diz
      isso na última frase; quando estiver entregue, tira-a.
- [ ] **Confeitaria Damira** — está `"em-curso"` e sem `url`: o site ainda
      não tem domínio. Quando estiver no ar: `url`, o vídeo do telemóvel
      (`mobile`), `"concluido"` e o texto no passado — tudo no mesmo PR. A capa
      atual saiu do servidor de desenvolvimento (`npm run dev` no repositório
      `DEVV-TGR/Damira`) e vale a pena refazê-la do site publicado.

Já resolvido: as capas do Império Auto Concept, da JSK, da António Home Repair,
da Taskuinha do Pirata, do Café Preguiça e da Confeitaria Damira; os vídeos de
telemóvel de todos os que estão no ar.

**Saíram do portfólio** (outubro de 2026): o Mira Mar e A Barraquinha Nova. Os
casos de estudo redirecionam para a `/portfolio` (`redirects()` em
`next.config.ts`), porque estiveram indexados. Se um voltar, tira o slug de lá
antes — um redirect ganha à página.

> A capa da Taskuinha saiu da receita headless acima sem truque nenhum. O site
> abre com uma cortina (`Chegada.tsx`) que tapa a página, mas o
> `--virtual-time-budget=30000` adianta-a e o print apanha já o Hero. Se um dia
> apanhar a cortina, sobe o orçamento de tempo virtual antes de inventar outra
> coisa.

## Ao alterar este documento

| Se mudares…              | Faz também                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| a lista de projetos      | `lib/projects.ts`; segue a checklist acima toda                                             |
| a ordem                  | é a ordem por que os projetos entram na faixa da homepage                                   |
| o `status` de um projeto | vira também o tempo verbal do `overview` e do `contribution`                                |
| o texto de um projeto já publicado | põe `updatedAt` com a data da reescrita — é o que faz o `app/sitemap.ts` emitir `lastmod` para essa página |
| o shape do `Project`     | `lib/projects.ts` (tipo), `components/ui/ProjectCard.tsx` e `app/portfolio/[slug]/page.tsx` |
| tirares um projeto       | acrescenta o slug aos `redirects()` de `next.config.ts` e apaga a capa e o vídeo           |
| o viewport da gravação   | `scripts/gravar-telemovel.mjs` **e** a proporção do ecrã em `components/ui/IPhone.tsx`; regrava todos |
| como as capas funcionam  | `components/ui/ProjectCard.tsx` e `app/portfolio/[slug]/page.tsx` — os dois renderizam capa |
| resolveres uma lacuna    | apaga a linha da lista acima                                                                |
