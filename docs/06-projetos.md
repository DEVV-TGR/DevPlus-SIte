---
doc: projetos
fonte-de-verdade: codigo
controla:
  - lib/projects.ts
  - components/ui/ProjectCard.tsx
  - components/paginas/PortfolioIndice.tsx
  - components/ProjectsMarquee.tsx
  - app/portfolio/page.tsx
  - app/portfolio/[slug]/page.tsx
  - components/paginas/Dispositivos.tsx
  - components/paginas/Pecas.tsx
  - scripts/desenhar-damira.mjs
  - public/projetos/damira/
  - public/casos/
  - app/page.tsx#projetos
  - public/capas/
relacionado:
  - docs/05-servicos.md
---

# Projetos

**A lista vive em `lib/projects.ts`** e é a fonte de verdade — este doc não a
copia. Vai lá ver quais são e em que estado estão.

## Regras que não estão no código

**O catálogo e a seleção da home são independentes.** `HOME_PROJECT_SLUGS` em
`lib/projects.ts` determina os sete projetos e a ordem da galeria da home;
`homeProjects` resolve os slugs e falha se algum não existir. O catálogo completo
continua a alimentar o índice, as rotas estáticas e o próximo projeto.

Entraram Café Preguiça e Café Avenida, concluídos por confirmação do Gonçalo,
e Damira, loja online em desenvolvimento. Os outros repositórios da organização
não entram por omissão. As capas do Preguiça e do Avenida são capturas dos
sites reais; a da Damira é um desenho (ver "A Damira desenhada").

O Café Preguiça inclui ementa, painel e suportes de mesa com QR codes e NFC.
O caso de estudo mostra o vídeo fornecido pelo Gonçalo: reprodução manual,
`preload="none"`, poster local e versão 720px sem áudio. O vídeo mostra a
aproximação à mesa e os acessos à ementa; não é usado como fundo nem autoplay.
O tipo `Project` não muda para acomodar um vídeo específico deste caso.

O domínio `avenidacafe.pt` apresentou erro de certificado na verificação de
2026-10-16; o link publicado usa a versão Vercel verificada, até o domínio ser
corrigido. A Damira mantém-se sem `url` de lançamento.

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

## Apresentações

A home usa uma galeria horizontal sem repetição: sete projetos, setas,
contador e progresso. Em desktop é conduzida pelo scroll com pin e pausas;
em mobile e com movimento reduzido usa scroll horizontal nativo. O índice do portfólio continua tipográfico; a capa real do ativo aparece dentro
de uma moldura de alumínio (render com abertura transparente, docs/10), sempre
com a captura do cliente por baixo, em HTML. Aceita qualquer número. `ProjectsMarquee` permanece disponível
para usos existentes, mas já não é a galeria da home.

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

## Checklist — adicionar um caso de estudo

1. Objeto novo em `lib/projects.ts`, na posição certa (o 1.º abre a faixa).
2. `status` correto e o texto no tempo verbal certo (presente/passado).
3. `accent` a alternar com o vizinho.
4. `services` com nomes que existam em `lib/services.ts`.
5. `url` só se estiver no ar.
6. Capa em `public/capas/` + `image` e `imageAlt` — ou nenhum dos dois.
7. **Sem `updatedAt`.** Um caso de estudo novo não é uma reescrita; o campo só
   entra da segunda vez que o texto mudar.
8. Confere as grelhas (tabela acima).
9. Nada mais: o `sitemap`, o `generateStaticParams` e a navegação "próximo
   projeto" leem todos do array e atualizam-se sozinhos.

## Lacunas por preencher

Isto é trabalho conhecido em falta. Apaga a linha quando estiver feita.

- [ ] **Painel de gestão da Taskuinha** — o card já anuncia o serviço e o
      `contribution` diz que está em desenvolvimento. Quando estiver entregue,
      tira a última frase do `contribution`.
- [ ] **Painel de gestão do Império** — o site já está no ar e o projeto passou a
      `"concluido"`, mas o painel ainda não foi entregue. O `contribution` diz
      isso na última frase; quando estiver entregue, tira-a.
- [ ] **Damira no ar** — quando a loja tiver endereço: `url`, as duas
      capturas em `capturas`, `status: "concluido"` e o texto no passado. As
      `pecasDoCaso` deixam de aparecer sozinhas (a página prefere as capturas).

Já resolvido: as capas do Império Auto Concept, da JSK, da António Home Repair
e da Taskuinha do Pirata.

> A capa da Taskuinha saiu da receita headless acima sem truque nenhum. O site
> abre com uma cortina (`Chegada.tsx`) que tapa a página, mas o
> `--virtual-time-budget=30000` adianta-a e o print apanha já o Hero. Se um dia
> apanhar a cortina, sobe o orçamento de tempo virtual antes de inventar outra
> coisa.

### A `/portfolio` é um índice, não uma grelha

Setembro de 2026. A grelha de `ProjectCard` saiu da `/portfolio` — **e o
componente fica**: é o mesmo que serve os projetos relacionados e qualquer
grelha futura. O que saiu foi a decisão de composição, não o código.

A razão é a regra das formas: a página inicial já mostra o trabalho a passar de
lado, e uma grelha de capas dizia a mesma coisa outra vez. Agora os nomes vêm em
coluna, grandes, e a capa do que se está a ler aparece numa moldura que não se
mexe — `components/paginas/PortfolioIndice.tsx`.

Duas consequências para quem acrescenta um projeto:

- **o nome carrega a página.** Numa grelha, um nome fraco escondia-se atrás da
  capa; num índice o nome é o que se lê primeiro e a capa é a confirmação;
- **um projeto sem capa não fica com um buraco nem com a capa de outro** — fica
  com o nome sobre um ground da marca — um fallback legítimo, que hoje nenhum
  projeto usa.

O caso de estudo mudou duas vezes. Em setembro a capa passou a sangrar num ecrã
só (o nome aparecia duas vezes, no cabeçalho e por cima da imagem). Em outubro
o nome saiu de cima dela: as capturas são páginas com títulos próprios, e a do
Império lia-se "Que viatura procura?" atravessado pelo nome do projeto, com um
véu a escurecer o trabalho para salvar o texto. Agora o nome vem primeiro, sobre
o ambiente do atelier, e a captura logo a seguir, inteira e sem véu, numa placa
8:5 — a proporção das capas. A ficha técnica é uma placa de grafite que fica
presa ao lado do texto (o `sticky` nunca chegou a prender antes: o pai tinha a
altura exata da ficha).

## Ao alterar este documento

| Se mudares…              | Faz também                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| a lista de projetos      | `lib/projects.ts`; segue a checklist acima toda                                             |
| a ordem                  | a ordem da home vem de `HOME_PROJECT_SLUGS`; o resto segue o catálogo                                   |
| o `status` de um projeto | vira também o tempo verbal do `overview` e do `contribution`                                |
| o texto de um projeto já publicado | põe `updatedAt` com a data da reescrita — é o que faz o `app/sitemap.ts` emitir `lastmod` para essa página |
| o shape do `Project`     | `lib/projects.ts` (tipo) e `components/ui/ProjectCard.tsx`                                  |
| como as capas funcionam  | `components/ui/ProjectCard.tsx`, `app/portfolio/[slug]/page.tsx` **e** `components/paginas/PortfolioIndice.tsx` — os três renderizam capa |
| a forma da `/portfolio`  | lê "A `/portfolio` é um índice, não uma grelha" antes: a decisão tem uma razão e não é de gosto |
| resolveres uma lacuna    | apaga a linha da lista acima                                                                |

## Prova QR/NFC na home

O vídeo fornecido do Preguiça também aparece em `NaMesa`, depois da galeria.
Sem autoplay, com preload none e poster; o texto adjacente explica integralmente
a demonstração. A derivada servida não tem faixa de áudio, por isso **não leva
legendas**: uma descrição posta como `captions` apresentava-se como transcrição
de um som que não existe. A legenda da figura diz "vídeo sem som, 20 s". Os
sete slugs e os estados mantêm-se.

## O caso de estudo visual e o portfólio no telemóvel

Outubro de 2026, por pedido do utilizador. A página do caso passou a ser: o
nome, a categoria, o ano e o estado; os serviços; e **o próprio site em duas
molduras**, computador e telemóvel (`components/paginas/Dispositivos.tsx`),
para percorrer por scroll. Em desktop as duas lado a lado, no telemóvel uma de
cada vez. Depois, os tópicos curtos, o vídeo QR/NFC no Preguiça e o próximo
projeto.

- **Capturas, não sites vivos.** `capturas` em `lib/projects.ts` aponta para
  `public/casos/`: páginas inteiras a 1440 e 390px dos seis sites publicados
  (Preguiça, Avenida, Taskuinha, Império, JSK, António). Nenhum script do
  cliente corre no nosso site; um clique no ecrã abre o `url` original, e um
  arrasto de mais de 8px não conta como clique. As molduras têm a proporção da
  janela que tirou a captura (1440/900 e 390/844), com o scroll por dentro.
  As capturas são verificadas até ao rodapé, sem estados intermédios de entrada.
- **Sem endereço, sem captura.** A Damira não tem `url`: mostra-se o que vai
  ter, em desenho (`pecasDoCaso`, ver abaixo) — nunca uma captura ou um URL
  inventados. Um projeto sem `url` e sem peças cai no aviso de `Dispositivos`.
- **Tópicos curtos** em `notasDoCaso` ("o que era preciso", "o que fizemos"),
  resumidos do `overview` e do `contribution` sem acrescentar nada; as
  pendências (painéis em desenvolvimento, sites em construção) continuam
  ditas. O texto longo fica no catálogo.
- **Portfólio no telemóvel:** um carril de cartões com capa, nome, ano, estado,
  serviços e "Explorar projeto" juntos. O índice com o nome longe da capa foi
  rejeitado no telemóvel e fica a partir de 768px. O Instagram aparece com o
  perfil por baixo.

| Se mudares… | Faz também |
| --- | --- |
| um projeto passar a ter `url` | recolhe as duas capturas (1440 e 390px), põe-nas em `public/casos/` e acrescenta-as a `capturas` |
| o texto de um caso | revê os tópicos em `notasDoCaso` — são o que a página mostra |

### Refinamento das molduras e do carril

O ecrã percorrível de `Dispositivos` declara `data-lenis-prevent`: roda e
trackpad ficam no scroll da captura, mesmo com o Lenis ativo. As proporções
1440/900 e 390/844 mantêm-se. Os dois grupos de tópicos têm snap horizontal
em mobile e duas colunas em desktop, preservando o texto curto aprovado.
O carril mobile do portfólio destaca visualmente o cartão ativo com aresta,
reflexo e escala; a opacidade plena regressa também ao receber foco. O índice
desktop mantém a sua função de escolha. Fundos: cetim na capa, metal no
índice, vidro no convite e metal em torno dos dispositivos dos casos.

Os títulos seguem a escala partilhada de `docs/02`: principais com o mesmo
tamanho da home, títulos de cartões a 24px. Sem escalas próprias por página.

### Capturas completas revistas — 19 de outubro

Mantêm-se as duas molduras, com uma captura própria da página inicial em
1440px e 390px, à largura do ecrã e sem esticar a altura. Os metadados de
`capturas` correspondem às dimensões reais dos WebP em `public/casos/`.

A recolha espera pelas fontes e imagens e percorre a página para carregar
conteúdo tardio antes da captura completa. Não se juntam screenshots de
viewports com secções fixas: isso repete cabeçalhos e corta os painéis
animados. No Preguiça usa-se a apresentação estática original, sem JavaScript:
o próprio site apresenta todos os conteúdos em fluxo, incluindo os cocktails,
petiscos, vídeos, avaliações e contactos. Assim não há zonas vazias de pin
nem o convite de newsletter por cima do trabalho. Não há alteração ao site
do cliente nem conteúdo inventado para preencher as imagens.

Os nomes dos ficheiros incluem a data da recolha para invalidar as capturas
antigas na cache de imagens sem depender de parâmetros de query.

## Saíram do portfólio — 19 de outubro

O **Mira Mar** e **A Barraquinha Nova** saíram do catálogo, por pedido do
utilizador. Estavam publicados e indexados, por isso `/portfolio/mira-mar` e
`/portfolio/a-barraquinha-nova` redirecionam (308) para `/portfolio`
(`redirects` em `next.config.ts`). A capa do Mira Mar foi apagada. Os nomes
que ainda aparecem no Estúdio (`/estudio`) são dados de clientes, não do
portfólio — não se mexe lá por isto.

## A Damira desenhada — 19 de outubro

A Damira está em desenvolvimento e **não mostra fotografias nem capturas** —
nem a capa antiga, que era uma pré-visualização. Mostra o que vai ter, em
desenho: a loja online no telemóvel, o painel do balcão no tablet e o painel
da gerência no portátil.

- **Os desenhos saem de `scripts/desenhar-damira.mjs`** (Node). Lê os tokens
  do `:root` de `app/globals.css`, converte-os de OKLCH para hex e escreve três
  SVG em `public/projetos/damira/` e a capa em JPG (as três peças juntas, 16:10)
  em `public/capas/`. Sem texto dentro dos desenhos — as palavras estão no HTML.
  Mudou um token? `node scripts/desenhar-damira.mjs`.
- **A capa tem a data no nome** (`damira-20261019.jpg`), como as capturas: a
  cache do otimizador de imagens servia a fotografia antiga com o nome velho.
- **No caso de estudo**, `pecasDoCaso` em `lib/projects.ts` substitui as
  molduras de `Dispositivos`: `components/paginas/Pecas.tsx` mostra três
  cartões de grafite (desenho, título, **uma frase**). O telemóvel ocupa a
  coluna da esquerda; os painéis empilham-se à direita. Sem "o que era preciso"
  nem "o que fizemos": um trabalho por entregar não se explica em parágrafos.
- O texto do catálogo diz o mesmo, no presente: loja online, painel do balcão,
  painel da gerência, e que ainda não está no ar.
