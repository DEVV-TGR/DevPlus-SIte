---
doc: cores-e-tipografia
fonte-de-verdade: doc
controla:
  - app/globals.css
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
2. **Sem glass por defeito.** `backdrop-blur` só onde já existe (chips sobre capas).
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
| `danger` sobre `bg`           | 6.27:1  | passa AA                                   |
| `border` sobre `bg`           | 1.49:1  | **falha** os 3:1 de 1.4.11 — só decorativo |
| `border-strong` sobre `bg`    | 3.56:1  | passa 1.4.11 — é o dos controlos           |

O texto do site **não tem problema de contraste em lado nenhum**, incluindo em
`muted`. O único falhanço era a `border` a servir de contorno a campos e ao botão
`outline`, onde é a única forma de perceber que ali existe um controlo — daí o
`border-strong`.

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
abaixo disso as letras tocam-se). O h1 da homepage usa
`text-[clamp(2.25rem,7vw,5.5rem)]` — escala fluida, sem breakpoints, com o topo
em 88px (o teto é 96px: acima disso a página grita em vez de desenhar).

## Ao alterar este documento

| Se mudares…             | Faz também                                                                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| um valor de cor         | `:root` **e** `@theme inline` em `app/globals.css`; se afetar primary/bg/ink/muted, atualiza `BRAND_HEX` em `lib/brand.ts`. Os ícones **não** seguem os tokens — ver a secção acima antes de lhes tocar |
| acrescentares um token  | as duas camadas de `app/globals.css`, e a tabela acima                                                                                                |
| `--radius`              | confirma os cards em `ProjectCard` e nas caixas de `app/servicos/page.tsx`                                                                            |
| uma fonte               | `app/layout.tsx` (o import e a `variable`) e `@theme inline`                                                                                          |
| uma das três proibições | avisa — está espalhada por todo o site                                                                                                                |
