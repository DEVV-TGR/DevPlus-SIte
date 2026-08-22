---
doc: simbolo-e-logotipo
fonte-de-verdade: doc
controla:
  - lib/brand.ts#plus-path
  - lib/brand.ts#d-path
  - lib/brand.ts#lockup
  - components/Logo.tsx
  - components/Lockup.tsx
  - components/Wordmark.tsx
  - app/icon.png
  - app/favicon.ico
  - images/Dev+-icone-2000.png
  - app/opengraph-image.tsx#marca
  - scripts/vectorizar-logo.py
  - images/Dev+-logosimples.png
relacionado:
  - docs/01-marca.md
  - docs/02-cores-e-tipografia.md
---

# O símbolo e o logótipo

O logótipo da DevPlus é o monograma **"D+"**: um "D" com um "+" laranja
sobreposto. Substituiu, em agosto de 2026, a cruz de cantos arredondados que
tinha vindo do rebrand de XquisiteVision — que por sua vez substituíra o "X com
um olho". Os ficheiros de ambas as identidades anteriores continuam no
histórico: `git show 95499e0 -- assets/`.

## O ficheiro de origem

**`images/Dev+-logosimples.png`** (2000×2000, alfa) é o desenho original. Não é
servido ao browser — nada no site o carrega. Existe por duas razões: é a prova
do que o vetor tem de reproduzir, e é o input de `scripts/vectorizar-logo.py`.

Se o logótipo mudar, substitui esse PNG e volta a correr o script:

```
python3 scripts/vectorizar-logo.py
```

O script imprime o `D_PATH` novo (para colar em `lib/brand.ts`), as medidas do
"+", e a sobreposição com o bitmap. **Se a sobreposição descer abaixo de 99.5%,
não colas** — o traçado falhou e há que perceber porquê. Só usa a stdlib do
Python; não é preciso instalar nada.

## Geometria

### O "+"

Um "+" tipográfico de **cantos vivos** — os quatro cantos côncavos arredondados
da versão anterior desapareceram, é essa a diferença que se vê.

Medido no PNG: caixa 562×542, barras de 175 e 166 px — ou seja proporções de
0.311 e 0.306. Em `PLUS_PATH` (viewBox `0 0 100 100`) ficam ambas **0.31**, com
a barra dos 34.5 aos 65.5. Arredondar torna o símbolo quadrado, e um símbolo
quadrado pode rodar sem mudar de silhueta — é o que a nav e o Hero fazem.

### O "D"

`D_PATH` em `lib/brand.ts`, em coordenadas onde a **altura do "D" é 1000**.
Vetorizado do PNG (99.9% de sobreposição), não é o glifo de nenhuma fonte
instalada — nem o da Bricolage Grotesque do site, que tem um "D" mais leve.
Por isso trocar a fonte do site **não** obriga a mexer no logótipo: o "D" é um
desenho próprio, não texto.

Precisa de **`fill-rule="evenodd"`**: o segundo contorno do path é a
contra-forma. Sem isso o "D" sai como uma mancha cheia.

### O lockup

`LOCKUP` em `lib/brand.ts`: viewBox `0 0 1507.6 1000`, portanto **1.5076 de
largura por 1 de altura**. O "+" ocupa 657.3×633.9 e **sobrepõe-se** ao "D" —
não fica ao lado dele. É essa sobreposição que faz o monograma ser um objeto só.

O "D" está desenhado **por inteiro** por baixo do "+" (a parte que o "+" tapa
foi reconstruída por simetria vertical durante a vetorização). É isso que
permite ao "+" rodar por cima sem abrir buracos no "D".

`LOCKUP.plusPath` é o mesmo "+" já nas coordenadas do lockup, com as medidas
exatas em vez do 0.31 arredondado. Vem escrito assim, e não como um `transform`,
porque o Satori não desenha `<g transform>` de forma fiável.

## As renderizações

O mesmo desenho existe em quatro sítios, por razões técnicas. **Não é descuido —
é uma duplicação necessária**, e é por isso que está registada aqui.

| Onde                      | Como                                 | Porquê                                    |
| ------------------------- | ------------------------------------ | ----------------------------------------- |
| `components/Lockup.tsx`   | importa `D_PATH` + `LOCKUP.plusPath` | é o logótipo, e o único que pode importar |
| `components/Logo.tsx`     | importa `PLUS_PATH`                  | o "+" isolado, para o favicon e o motivo  |
| `app/icon.png` + `.ico`   | bitmap, gerado de `Dev+-icone-2000`  | é o ícone do browser, não executa nada    |
| `app/opengraph-image.tsx` | dois `<path>` sem `<g>`              | o Satori é frágil com transforms          |

O ícone do browser deixou de ser vetorial em agosto de 2026: o `app/icon.svg`
foi substituído por dois bitmaps. É a única renderização que **não** deriva de
`lib/brand.ts` — não há coordenadas para manter em sincronia, há pixels.

### O favicon é o lockup, não o "+"

Contraria o que este doc dizia até agosto de 2026, e a razão continua a ser
verdade: **a 16px o "D+" perde-se**. Medido no bitmap atual, o desenho ocupa 43%
da altura do quadrado, o que a 16px dá 7px de "D" e 4px de "+" — o "+" lê-se
como uma mancha. A 32px já se distingue, e a partir dos 48 está limpo.

Foi uma escolha informada do Gonçalo, com o custo em cima da mesa. Fica aqui
para que ninguém a "corrija" por engano, e para que quem a quiser rever saiba
exatamente o que está a ganhar: mais margem à volta do desenho e/ou o "+"
sozinho recuperam a leitura aos 16px.

## Como se geram os dois bitmaps

O original é **`images/Dev+-icone-2000.png`** (2000×2000, RGB, sem alfa) — como
o `Dev+-logosimples.png`, não é servido ao browser, existe para ser a origem.

Dos três tamanhos do `.ico` e do `icon.png` faz-se tudo com o `sips` do macOS
mais o `scripts/mkico.py` (só stdlib, sem dependências):

```
for s in 512 48 32 16; do
  sips -z $s $s "images/Dev+-icone-2000.png" --out /tmp/i$s.png
done
cp /tmp/i512.png app/icon.png
python3 scripts/mkico.py /tmp/i16.png /tmp/i32.png /tmp/i48.png app/favicon.ico
```

**O `favicon.ico` tem de ser mesmo um ICO.** Chegou a estar lá um PNG só com a
extensão trocada: o Chrome e o Firefox aceitam por sniffing, o Safari e os
atalhos do Windows não. Confirma sempre com `file app/favicon.ico` — tem de
dizer `MS Windows icon resource`, com os três tamanhos.

O `icon.png` fica a **512px**: é o que o Next serve como `rel="icon"` e o que os
Android e as PWA vão buscar. Não voltes a pôr lá os 2000px — são 32KB em todas
as páginas para nada.

## `components/Lockup.tsx`

Duas cores, portanto duas fontes de cor:

- o **"D"** usa `fill="currentColor"` — a cor vem de quem chama, e no site
  herda o `--ink` do header;
- o **"+"** usa a classe `fill-primary` — é sempre laranja, em qualquer fundo.

É `aria-hidden`; quem o usa tem de dar o rótulo. Com `animated`, o "+" roda 90°
no hover do `group` pai — precisa de `[transform-box:fill-box]` para rodar à
volta do próprio centro e não do centro do lockup.

## `components/Logo.tsx`

O "+" isolado. Um único `<path>` serve as duas variantes — nunca as desenhes em
separado:

- **sólida**: `fill="currentColor"`
- **outline**: `fill="none" stroke="currentColor" strokeWidth={2.5}`

Sem `strokeLinejoin="round"`: com cantos vivos, arredondar o traço contradiz o
desenho.

A variante `outline` é o motivo rotativo no fundo do Hero
(`components/Hero.tsx`), a 6-7% de opacidade e 120s por volta. Aos 45° lê-se
como "×" — continuidade discreta com a identidade original, de graça.

## `components/Wordmark.tsx`

A marca clicável: o `Lockup` dentro de um `<Link href="/">`, a `h-6`, usado na
nav e no rodapé.

- `aria-label` obrigatório no `<Link>` — o `Lockup` é `aria-hidden`, sem ele o
  leitor de ecrã anuncia só "link".
- O nome escrito **DevPlus** já não aparece na nav; continua no `<title>`, no
  `aria-label` e no copyright do rodapé.

## Tamanhos e área de proteção

- **Lockup, mínimo**: 20px de altura. Abaixo disso a contra-forma do "D" fecha.
- **Nav e rodapé**: 24px (`h-6`). **Cartão social**: 56px.
- **"+" isolado**: **Motivo de fundo**, até ~600px.
- **Ícone do browser**: 16/32/48 no `.ico`, 512 no `icon.png` (ver acima).
- **Área de proteção**: metade da largura da barra do "+" (≈100/1000 da altura
  do lockup) de espaço livre à volta.

## Ao alterar este documento

| Se mudares…                                   | Faz também                                                                                                                         |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| o desenho do logótipo                         | substitui `images/Dev+-logosimples.png`, corre `scripts/vectorizar-logo.py`, cola o `D_PATH` e as medidas do "+" em `lib/brand.ts` |
| o desenho do **ícone**                        | substitui `images/Dev+-icone-2000.png` e regera `app/icon.png` e `app/favicon.ico` — ver "Como se geram os dois bitmaps"           |
| a geometria do "+"                            | `PLUS_PATH` e `LOCKUP.plusPath` em `lib/brand.ts`; os ícones são bitmaps e **não** acompanham — regera-os à parte                  |
| a espessura da barra                          | os dois paths do "+" acima — a proporção 0.31 tem de se manter em ambos                                                            |
| a cor do "+"                                  | nada aqui: vem de `--primary` (ver `docs/02`)                                                                                      |
| a cor do "D"                                  | nada aqui: é `currentColor`, vem de quem chama                                                                                     |
| o que a nav mostra (logótipo vs nome escrito) | `components/Wordmark.tsx` e o seu `aria-label`                                                                                     |
| o tamanho do lockup no cartão social          | `app/opengraph-image.tsx` (a altura passa por `LOCKUP.ratio`)                                                                      |
| o motivo de fundo do Hero                     | `components/Hero.tsx` (opacidade, duração, posição)                                                                                |
