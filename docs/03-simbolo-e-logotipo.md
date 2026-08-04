---
doc: simbolo-e-logotipo
fonte-de-verdade: doc
controla:
  - lib/brand.ts#plus-path
  - components/Logo.tsx
  - components/Wordmark.tsx
  - app/icon.svg
  - app/opengraph-image.tsx#marca
relacionado:
  - docs/01-marca.md
  - docs/02-cores-e-tipografia.md
---

# O símbolo e o logótipo

O símbolo da DevPlus é um **"+"**. Substituiu o "X com um olho" da identidade
anterior (XquisiteVision), descontinuada em agosto de 2026. Os ficheiros originais
do logótipo antigo continuam no histórico: `git show 95499e0 -- assets/`.

## Geometria

Cruz de braços iguais em `viewBox 0 0 100 100`:

- **vão** 10 → 90
- **barra** 26 (de 37 a 63 em ambos os eixos)
- **proporção barra/vão = 0.325** ← é este o número que se preserva ao escalar
- **raio 8 em todos os 12 cantos**, incluindo os 4 côncavos

Os cantos côncavos arredondados são o que distingue o símbolo de um "+" de
teclado. Sem eles lê-se como texto, não como marca. Não os tires.

O `d` canónico está em **`lib/brand.ts` → `PLUS_PATH`**. É a origem; tudo o resto
copia ou aproxima.

## As três renderizações

O mesmo símbolo existe em três sítios, por razões técnicas. **Não é descuido — é
uma duplicação necessária**, e é por isso que está registada aqui.

| Onde | Como | Porquê |
| --- | --- | --- |
| `components/Logo.tsx` | importa `PLUS_PATH` | é o único que pode importar |
| `app/icon.svg` | `d` copiado à mão | ficheiro estático, não executa JS |
| `app/opengraph-image.tsx` | duas `div` (44×14 e 14×44, raio 4) | o Satori não desenha SVG complexo |

**Aproximação assumida no cartão social:** as barras têm proporção 14/44 = 0.318
(a canónica é 0.325, menos de 1% de diferença) e os cantos interiores ficam vivos
em vez de arredondados. A 64px isso é sub-pixel. Não vale a pena tentar corrigir.

**No `icon.svg` não recalcules coordenadas** para dar margem dentro do quadrado —
usa `transform="translate(50,50) scale(0.85) translate(-50,-50)"`. Foi a recopiar
coordenadas à mão que a identidade anterior divergiu entre ficheiros.

## `components/Logo.tsx`

Um único `<path>` serve as duas variantes — nunca as desenhes em separado:

- **sólida**: `fill="currentColor"`
- **outline**: `fill="none" stroke="currentColor" strokeWidth={2.5}`

Usa **`currentColor`**, não `var(--color-primary)`. A cor vem de quem chama
(`className="text-primary"`), para o símbolo poder aparecer a branco sobre laranja
sem se duplicar geometria. É `aria-hidden` — quem o usa tem de dar o rótulo.

A variante `outline` é o motivo rotativo no fundo do Hero
(`components/Hero.tsx`), a 6-7% de opacidade e 120s por volta. Aos 45° lê-se como
"×" — continuidade discreta com a identidade anterior, de graça.

## O lockup

`components/Wordmark.tsx`: a palavra **"Dev"** seguida do `Logo` a fazer de "+",
a `0.78em` e `text-primary`.

O "+" do lockup **é o símbolo**, não o caractere da fonte. É isso que faz o
favicon, a nav e o cartão social serem o mesmo objeto. Se usasses o glifo do Space
Grotesk (fino, cantos vivos) ao lado do símbolo (grosso, arredondado), a
inconsistência via-se lado a lado.

- `aria-label` obrigatório no `<Link>` — o `Logo` é `aria-hidden`, sem ele o
  leitor de ecrã lê só "Dev".
- Alinhamento por `items-center` com `gap-1`. **Não uses `items-baseline`** — não
  funciona bem com SVG.
- Hover: `rotate-90` (o "+" roda para "×" e volta). Não voltes ao `scale`.

## Tamanhos e área de proteção

- **Mínimo**: 16px (favicon). Abaixo disso os raios de 8/100 desaparecem.
- **Nav**: ~28px. **Cartão social**: 64px. **Motivo de fundo**: até ~600px.
- **Área de proteção**: pelo menos metade da largura da barra (13/100 do lado) de
  espaço livre à volta. No lockup, o `gap-1` já a garante.

## Ao alterar este documento

| Se mudares… | Faz também |
| --- | --- |
| a geometria do "+" | `PLUS_PATH` em `lib/brand.ts`; copia o mesmo `d` para `app/icon.svg`; ajusta as duas barras em `app/opengraph-image.tsx` |
| a espessura da barra | os três sítios acima — a proporção 0.325 tem de se manter |
| a cor do símbolo | nada aqui: vem de `--primary` via `currentColor` (ver `docs/02`) |
| o lockup ("Dev" + o mark) | `components/Wordmark.tsx` e o `aria-label` do link |
| o raio dos cantos | `PLUS_PATH`, `app/icon.svg`, e o `borderRadius` das barras do OG |
| o motivo de fundo do Hero | `components/Hero.tsx` (opacidade, duração, posição) |
