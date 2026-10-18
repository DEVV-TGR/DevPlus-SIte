---
doc: cores-e-tipografia
fonte-de-verdade: doc
controla:
  - app/globals.css
  - lib/tema.ts
  - components/SeletorTema.tsx
  - app/layout.tsx#tema
  - lib/brand.ts#hex
  - app/icon.png#cores
  - app/favicon.ico#cores
  - app/opengraph-image.tsx#cores
relacionado:
  - docs/04-componentes-e-padroes.md
---

# Cores e tipografia

**As cores não mudaram no rebrand** e não devem mudar sem decisão explícita. O
laranja e o verde são a identidade; foi o símbolo que mudou, não a paleta.

## Onde vivem

`app/globals.css`, em duas camadas:

1. `:root` — as variáveis em **OKLCH** (a fonte de verdade dos valores);
2. `@theme inline` — mapeia cada uma para um token Tailwind `--color-*`, que é o
   que gera as classes `bg-primary`, `text-muted`, `border-border`, etc.

Para acrescentar uma cor tens de a declarar **nas duas** camadas. Só em `:root`
não gera classe nenhuma.

## Os tokens

| Token            | Para que serve                                                                                           | Onde é proibido                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `bg`             | fundo da página                                                                                          | —                                                                          |
| `surface`        | cards, rodapé, caixas                                                                                    | como fundo de página                                                       |
| `surface-2`      | capas de projeto, superfícies dentro de cards                                                            | texto por cima sem contraste                                               |
| `border`         | separadores e contornos decorativos (cards, réguas, etiquetas)                                           | **contornos de controlos** — dá 1.49:1 sobre `bg` e a WCAG 1.4.11 pede 3:1 |
| `border-strong`  | contorno de campos e do botão `outline`, onde a borda é a única pista de que ali há um controlo (3.56:1) | separadores — fica pesado                                                  |
| `ink`            | texto principal                                                                                          | —                                                                          |
| `muted`          | texto secundário, parágrafos de apoio, legendas                                                          | títulos e o texto que **tem** de ser lido primeiro — ver a nota abaixo     |
| `primary`        | o laranja da marca: CTA, destaques, o "+"                                                                | grandes áreas de fundo                                                     |
| `primary-strong` | hover do primary                                                                                         | texto sobre fundo escuro; **estados de erro** — para isso há `danger`      |
| `danger`         | erros de validação: texto da mensagem e contorno do campo                                                | como cor decorativa ou de ação                                             |
| `primary-ink`    | texto **sobre** fundo primary                                                                            | sobre fundo escuro                                                         |
| `accent`         | o verde: sinais de estado, etiqueta "Em curso", pontos                                                   | como segunda cor de CTA                                                    |
| `accent-strong`  | hover do accent                                                                                          | —                                                                          |
| `accent-ink`     | texto **sobre** fundo accent                                                                             | —                                                                          |

`--grad` existe para superfícies e linhas. **Nunca em texto** — sem gradient-text.

`--radius: 0.875rem` (14px). Os cards ficam ≤16px; `rounded-full` é só para chips,
badges e botões.

## As três proibições

Herdadas do design original e ainda em vigor:

1. **Sem gradient-text.** O gradiente é para superfícies e linhas.
2. **Glass apenas nas superfícies aprovadas.** Além dos materiais atelier e
   do carrossel, o header e o menu usam vidro translúcido por pedido explícito.
   Header: `bg` a 58%, blur 18px/saturação 160%, reflexo diagonal `creme`; menu: `bg` a 82%, blur 28px, reflexo `creme`
   e aresta. Fallback opaco sem suporte; forced-colors usa Canvas.
3. **Hierarquia, não contraste.** `ink` para o que se lê primeiro, `muted` para o
   apoio. Isto é uma regra de hierarquia visual — **não** é um problema de
   legibilidade, como se explica já a seguir.

## Contraste — os números medidos

Medidos convertendo os tokens OKLCH para sRGB e aplicando a fórmula da WCAG.
Fica aqui registado para ninguém voltar a discutir isto por instinto:

| Par                           | Rácio   | Veredicto                                  |
| ----------------------------- | ------- | ------------------------------------------ |
| `ink` sobre `bg`              | 18.05:1 | passa AA e AAA                             |
| `muted` sobre `bg`            | 9.49:1  | **passa AA com folga**                     |
| `muted/60` sobre `bg`         | 6.10:1  | passa AA                                   |
| `primary` sobre `bg`          | 7.45:1  | passa AA                                   |
| `accent` sobre `bg`           | 10.12:1 | passa AA                                   |
| `primary-ink` sobre `primary` | 7.26:1  | passa AA                                   |
| `paper-ink` sobre `primary`   | 6.07:1  | passa AA — é o tom de apoio sobre o laranja |
| `paper-muted` sobre `primary` | 2.95:1  | **falha** — parece o candidato óbvio e não é |
| `danger` sobre `bg`           | 6.27:1  | passa AA                                   |
| `border` sobre `bg`           | 1.49:1  | **falha** os 3:1 de 1.4.11 — só decorativo |
| `border-strong` sobre `bg`    | 3.56:1  | passa 1.4.11 — é o dos controlos           |

O texto do site **não tem problema de contraste em lado nenhum**, incluindo em
`muted`. O único falhanço era a `border` a servir de contorno a campos e ao botão
`outline`, onde é a única forma de perceber que ali existe um controlo — daí o
`border-strong`.

### O ground laranja tem duas tintas, e uma delas depende do que está por baixo

O rodapé é o único bloco do site com texto sobre `--primary` (ver `docs/01`), e
lá há duas medições a respeitar:

- **`paper-ink` é o tom de apoio** sobre o laranja, e `paper-muted` **não serve**
  — 2.95:1. Sobre o creme são estes dois que fazem par; sobre o laranja só o
  primeiro atravessa.
- **O laranja do convite não está limpo.** A poeira de "+" do `Fecho` passa por
  trás do texto, e um símbolo a 0,22 de opacidade escurece o ground debaixo dele:
  aí o `paper-ink` cai a **4.18:1** e falha, e o `primary-ink` fica em 4.81:1. Por
  isso o texto do convite é todo `primary-ink` e a hierarquia faz-se por tamanho
  e peso — que é a regra geral deste doc, aqui por obrigação e não por gosto. O
  `paper-ink` fica para a zona de baixo do rodapé, onde a poeira não chega.

**Transparências sobre o laranja medem-se sempre.** `primary-ink/85` dá 5.86:1 e
passa; `primary-ink/70` dá 4.31:1 e falha por pouco. É por isso que a regra do
`docs/04` diz "escuro e **opaco**".

## Os hex duplicados — e porquê

Há ficheiros que **não conseguem ler CSS custom properties** e por isso têm os
valores à mão:

- `app/opengraph-image.tsx` — é gerado pelo Satori, fora do browser;
- `app/icon.png` e `app/favicon.ico` — são bitmaps, as cores estão nos pixels.

Os equivalentes estão registados em **`lib/brand.ts` → `BRAND_HEX`**, que o
`opengraph-image.tsx` importa. Desde que o `app/icon.svg` foi substituído pelos
bitmaps, já não há nenhum ficheiro de código com hex literal — o que resta são
os pixels, que ninguém consegue rever num diff.

### Os ícones estão fora da paleta — de propósito

Os bitmaps de agosto de 2026 **não usam os tokens**: o fundo é `#000000` em vez
de `--bg` `#1a1613`, e o "+" é `#FF780A` em vez de `--primary` `#F2762B`. Foi
uma decisão explícita do Gonçalo ao adotar o desenho, não um lapso — fica aqui
registada porque é a única exceção viva à regra de não inventar cores, e porque
um bitmap não se revê num diff como se revê um hex.

Se algum dia se realinharem com a paleta, é regerar os dois ficheiros a partir
de um original nas cores certas. Ver `docs/03-simbolo-e-logotipo.md`.

| Token OKLCH                        | Hex       |
| ---------------------------------- | --------- |
| `--primary` `oklch(0.72 0.188 50)` | `#F2762B` |
| `--bg` `oklch(0.15 0.011 56)`      | `#1a1613` |
| `--ink` `oklch(0.97 0.006 80)`     | `#f7f2ec` |
| `--muted` `oklch(0.77 0.012 80)`   | `#c8bdb0` |

Esta é a **única duplicação de cor autorizada**. Se mudares um token, atualiza os
dois sítios ou o cartão social passa a ter uma cor diferente do site.

## Tipografia

**Uma família só: Bricolage Grotesque.**

| Papel   | Fonte               | Token          | `opsz` | Uso                        |
| ------- | ------------------- | -------------- | ------ | -------------------------- |
| Display | Bricolage Grotesque | `font-display` | 48     | títulos, wordmark, números |
| Corpo   | Bricolage Grotesque | `font-sans`    | 14     | tudo o resto               |

Carregada em `app/layout.tsx` via `next/font/google`, com `display: "swap"` e o
eixo `opsz` ativo.

**Porquê uma só.** O contraste faz-se por **peso e tamanho**, e sobretudo pelo
eixo óptico: em corpo pequeno o desenho abre e lê-se melhor; em título fecha e
ganha carácter. É a mesma letra a fazer dois trabalhos, e carrega menos do que
duas famílias.

**Porquê esta.** Três palavras para a voz da marca — **direto, oficinal,
próximo**. O site trata por "tu", diz que constrói de raiz e assenta em laranja
quente sobre quase-preto. A Bricolage tem irregularidades deliberadas em vez de
uma grelha perfeita: tem cara de oficina, que é o que o texto do site promete.

**O que saiu, e porquê.** Space Grotesk + Inter. São duas sans-serif próximas
mas não idênticas — o par a evitar, porque o contraste não chega para ler como
intenção nem a semelhança para ler como sistema. Ambas estão, além disso, entre
as fontes mais saturadas em sites gerados por IA.

Títulos levam sempre `tracking-tight` (−0.02em; o mínimo aceitável é −0.04em,
abaixo disso as letras tocam-se).

### A escala dos títulos vive no `globals.css`

Uma medida única para os títulos principais do site público: capas, títulos de secção, casos, contacto, privacidade e fecho. As classes
`t-capa`, `t-seccao`, `home-heading` e `interior-heading` leem
`--titulo-principal: clamp(2.25rem, 1.75rem + 2.5vw, 4rem)`.
A única exceção, aprovada pelo utilizador, é o hero da home: `home-title`
usa `--titulo-hero: clamp(2.65rem, 2rem + 3.2vw, 5.3rem)`.
Não há outras escalas próprias por página.

| Papel | A 320px | A 390px | A 1440px |
| --- | --- | --- | --- |
| Hero da home | 42,4px | 44,48px | 78,08px |
| Título principal | 36px | 37,75px | 64px |
| Cartão / subtítulo (`t-cartao`, `t-obra`) | 24px | 24px | 24px |

Bricolage, peso 650 e tracking −0,035em em ambos. Entrelinha 1,06 nos
principais e 1,15 nos cartões. Os títulos editoriais partilham uma assinatura:
frase principal a 650, destaque em `em` itálico a 500 e `--acento` do capítulo.
A regra vive em `globals.css` e abrange `t-capa`, `t-seccao`, `home-heading` e
`interior-heading`. A Bricolage mantém-se como família única; o contraste vem
do desenho inclinado e do peso. O fecho sobre laranja usa `--primary-ink` no
itálico para preservar o contraste. Não acrescentar itálicos aos nomes de
clientes ou a cada pequeno subtítulo.
Rótulos de navegação, controlos e colunas fechadas do acordeão continuam
compactos; não são títulos editoriais. O Estúdio interno tem a sua escala.

### E o corpo, no telemóvel

Abaixo dos 768px, `globals.css` sobe a escala inteira do texto — `--text-xs` a
`--text-lg` — em vez de se trocarem as dezenas de `text-sm` um a um:

| | Computador | Telemóvel |
| --- | --- | --- |
| `text-xs` | 12px | **14px** |
| `text-sm` | 14px | 15px |
| `text-base` | 16px | 17px |
| `text-lg` | 18px | 19px |

**14px é o chão.** Nada abaixo disso se lê de pé, na rua, ao sol — e o
`verificar-scroll.mjs --mobile` falha se aparecer.

## Os grounds dos capítulos

Setembro de 2026: a página inicial deixou de ter um fundo só. Cada capítulo
pinta o seu, e os cortes entre eles são **duros** — numa página de capítulos um
corte não é um gradiente, e interpolar entre dois grounds é exatamente a
suavidade que essa estrutura existe para recusar. Ver `docs/04`.

| Token | Onde | Porquê existe |
| --- | --- | --- |
| `--bg-deep` | o capítulo "Como trabalhamos" | Mais fundo que o `--bg`, para o capítulo a seguir à capa recuar em vez de continuar |
| `--paper` | o capítulo da prova | O trabalho lê-se melhor sobre claro, e a mudança marca que ali se mostra em vez de se argumentar |
| `--paper-ink` | texto sobre `--paper` | 12.6:1 |
| `--paper-muted` | apoio sobre `--paper` | 6.1:1 |
| `--primary` | o fecho, que é o rodapé inteiro | O último ground do site, e o único quente. Ver `docs/01` |
| `--mint` | o capítulo QR/NFC (`NaMesa`), os cards pares do processo, uma das molduras das capas | Verde claro para a prova à mesa. Leva `--forest`: 11,71:1 |
| `--forest` | as cenas 01 e 03 dos serviços, uma das molduras das capas, tinta sobre `--mint` | Verde fundo, a profundidade dos serviços. `--ink` sobre ele: 15,10:1; `--primary`: 6,23:1 |
| `--forest-muted` | apoio nos serviços, sobre `--forest`, `--bg` e `--bg-deep` | 8,06:1 / 9,64:1 / 9,98:1 |
| `--peach` | os cards ímpares do processo, uma das molduras das capas | Laranja claro. Leva `--primary-ink`: 13,18:1 |
| `--copper` | o itálico sobre `--paper` ("fala por nós.") | O laranja não se lê no creme; o cobre dá 7,35:1 |

**`--paper` nunca se usa sozinho.** Sobre creme, o `--ink` é invisível: quem
usa o fundo usa também a tinta que lhe pertence. É por isso que são quatro
tokens e não dois.

## Ao alterar este documento

| Se mudares…             | Faz também                                                                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| um valor de cor         | `:root` **e** `@theme inline` em `app/globals.css`; se afetar primary/bg/ink/muted, atualiza `BRAND_HEX` em `lib/brand.ts`. Os ícones **não** seguem os tokens — ver a secção acima antes de lhes tocar |
| acrescentares um token  | as duas camadas de `app/globals.css`, e a tabela acima                                                                                                |
| `--radius`              | confirma os cards em `ProjectCard` e nas caixas de `app/servicos/page.tsx`                                                                            |
| uma fonte               | `app/layout.tsx` (o import e a `variable`) e `@theme inline`                                                                                          |
| uma das três proibições | avisa — está espalhada por todo o site                                                                                                                |

| um dos grounds dos capítulos       | `app/globals.css` **e** a tabela "Os grounds dos capítulos" acima            |
| `--paper`                          | verifica `--paper-ink` e `--paper-muted` no mesmo passo — vivem em par        |
| `--primary` (o ground do rodapé)   | volta a medir as duas tintas sobre ele **e** o pior caso com a poeira do `Fecho` por baixo — a secção "O ground laranja tem duas tintas" tem os números |
| a medida de um título              | `t-capa` / `t-seccao` / `t-obra` em `app/globals.css`, e a tabela acima — não escrevas um `clamp` novo num componente sem dizer porquê |
| a escala do corpo em telemóvel     | o bloco `@media (max-width: 767px)` de `app/globals.css`; e corre o verificador em `--mobile`, que falha abaixo de 14px |

## Home de outubro de 2026

A identidade e os tokens mantêm-se. A escala da home foi unificada com os
restantes títulos em 17 de outubro: ver a tabela acima. As linhas do hero
não levam `nowrap`, para o texto continuar a quebrar com zoom.
A home, as órbitas, as etiquetas e os controlos não acrescentam cores: usam
os tokens existentes, com a tinta do ground correspondente.

## Extensão atelier — 17 de outubro

Por pedido explícito do utilizador, a home acrescenta cinco tokens, sem alterar
os valores originais. `copper` é o acento legível no papel; `peach` é uma
superfície clara quente; `forest` dá profundidade aos serviços; `mint` sustenta
a demonstração real e cartões; `forest-muted` serve o texto secundário no
escuro. Valores em `:root`, espelhados em `@theme inline`, junto dos tokens
originais e não num bloco à parte. As combinações usadas e os contrastes medidos
estão na tabela "Os grounds dos capítulos", acima.
A tipografia mantém Bricolage: itálico de peso médio em soma, fala por nós,
à mesa, trabalhamos e começar. A direção e os assets estão em docs/09.

## Temas — claro e escuro

Outubro de 2026. O site público tem dois temas. **O escuro é o site de
sempre**; o claro troca base e papel. Quem decide no primeiro desenho é o
script do `<head>` em `app/layout.tsx`: lê a escolha guardada em
`localStorage` (chave `devplus-tema`, em `lib/tema.ts`) ou, sem escolha, o
`prefers-color-scheme`, e escreve `data-theme` no `<html>` antes de pintar —
sem salto de escuro para claro. O botão sol/lua (`components/SeletorTema.tsx`)
vive no canto inferior esquerdo, com 48px, nome fixo "Modo escuro" e
`aria-pressed`; a dica diz a ação seguinte. Sem escolha, acompanha o sistema em
direto; com escolha, a escolha manda. O Estúdio fica sempre escuro: o `<html>`
leva `data-area="estudio"` e o CSS do claro ignora-o.

**A inversão faz-se nos tokens, não nos componentes.** O bloco
`html[data-theme="light"]` de `app/globals.css` redefine os tokens, e a
navegação, o rodapé, os formulários e as interiores seguem sem uma segunda
implementação. Os componentes pedem **papéis**:

| Papel | Escuro | Claro | Usado em |
| --- | --- | --- | --- |
| base (`--bg`, `--ink`, `--muted`) | grafite, creme | creme, grafite | hero, pacotes de `/servicos`, interiores |
| fundo (`--bg-deep`) | `oklch(0.115 …)` | `oklch(0.915 0.011 76)` | processo, índice do portfólio |
| inverso (`--paper*`) | creme | grafite | galeria da home |
| verde (`--verde*`) | forest, tinta creme | mint, tinta forest | `NaMesa`, serviços da home |
| quente (`--quente*`) | cobre a 18% sobre `--bg-deep` | peach, tinta `primary-ink` | pacotes da home |
| laranja | `--primary` | `--primary` | rodapé (`.ground-laranja`) |

As classes `.capitulo-base`, `-fundo`, `-inverso`, `-verde`, `-quente` e
`-laranja` pintam o capítulo e definem `--ground` e `--fg`, que o
`MaterialGround` lê (docs/10).

Papéis que não são cores de fundo:

- `--acento` — o laranja **quando é texto**: `--primary` no escuro, `--copper`
  no claro, porque o laranja sobre creme dá 2,30:1. Utilidade `text-acento`.
  Como fundo de botão, o `--primary` é o mesmo nos dois temas.
- `--acento-inverso` — o acento dentro de um capítulo inverso: cobre sobre o
  creme no escuro (7,35:1), laranja sobre o grafite no claro (7,45:1).
- `--foco` — o contorno de foco: o verde no escuro, forest no claro (o verde
  sobre creme dá 1,6:1).
- `--creme` — nunca troca. É a tinta de superfícies escuras nos dois temas (o
  botão `contraste` do fecho) e o brilho dos materiais.

Valores novos do claro (os restantes são tokens de sempre trocados), medidos:

| Token no claro | Valor | Medida |
| --- | --- | --- |
| `--bg-deep` | `oklch(0.915 0.011 76)` | `paper-muted` 6,06:1, `paper-ink` 12,45:1 |
| `--surface` | `oklch(0.975 0.006 80)` | placas e campos |
| `--surface-2` | `oklch(0.925 0.01 78)` | `paper-muted` 6,25:1 |
| `--border` | `oklch(0.86 0.012 70)` | separadores (1,33:1, como o escuro) |
| `--border-strong` | `oklch(0.58 0.016 60)` | 3,74:1 sobre `--bg`, 4,00:1 sobre `--surface` |
| `--danger` | `oklch(0.5 0.19 25)` | 5,76:1 sobre `--bg`, 6,17:1 sobre `--surface` |

Contraste do site inteiro medido por script nos dois temas, a 1366 e 390px,
texto a texto contra o fundo composto (Playwright, build de produção): zero
falhas AA, incluindo navegação, rodapé e o formulário em erro (6,19:1 no claro,
5,89:1 no escuro).

Não se inverte nenhuma fotografia nem captura de cliente: as imagens ficam
como são, e só o que está à volta muda.

### As camadas do CSS

Duas regras de `app/globals.css` estavam **fora de camada** — o `*` que dá a
cor de borda por omissão e o `h1–h4` com `letter-spacing: -0.02em`. No Tailwind
v4 as utilidades vivem em `@layer utilities`, e uma regra sem camada ganha a
qualquer camada, seja qual for a especificidade: nenhum `border-border-strong`,
`border-primary/45` ou `tracking-*` de título se aplicava (os campos do
formulário tinham borda de 1,4:1). As duas passaram para `@layer base`. **Uma
regra global nova que toque numa propriedade que as utilidades também
escrevem vai em `@layer base`.**

### Tipografia — o peso e o tracking dos títulos

Os títulos usam o peso **650** das previews aprovadas, pela utilidade
`font-titulo` (`--font-weight-titulo` no `@theme`): substituiu os
`font-extrabold`/`font-bold` soltos. `home-title` e `home-heading` também a
650. O tracking dos títulos é −0,035em (`t-capa`, `t-seccao`, `t-obra`,
`home-*`). Itálico de peso 500 só em palavras escolhidas, no acento do papel.

| Se mudares… | Faz também |
| --- | --- |
| um token do escuro | o par dele no bloco `html[data-theme="light"]`, e mede os dois |
| um papel (`--verde`, `--quente`, `--acento*`) | as classes `.capitulo-*` e a tabela acima |
| a chave do tema | `lib/tema.ts`; o script do `app/layout.tsx` lê-a de lá |
| o sítio do botão do tema | confirma que não fica por cima de um CTA das cenas pinadas nem dos links legais do rodapé |

### Escala das interiores — revisão das previews

As interiores partilham a escala principal da tabela acima. A capa mantém
20ch de medida e quebra equilibrada; contacto e casos já não têm tamanho
próprio. Alterar o token atualiza todos os títulos principais em conjunto.

Os pacotes de `/servicos` também usam o papel quente. A capa Sobre usa
`--verde`, `--verde-ink` e `--verde-muted`, portanto forest no escuro e mint
no claro. As restantes capas usam o papel base com acabamentos distintos.
Não foram acrescentadas cores nem invertidas imagens.
