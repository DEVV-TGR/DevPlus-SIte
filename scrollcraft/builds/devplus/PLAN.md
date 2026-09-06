# PLANO — DevPlus

## Gramática: **chaptered editorial**, em família estética **playful**

Os dois eixos são separados na skill, e é essa separação que resolve o pedido:
o Gonçalo quer a *estrutura* do dontboardme (cenas com paleta própria, cortes
entre capítulos) e uma *estética* solta. A chaptered editorial dá a estrutura; a
família playful dá o resto.

**Porque as outras sete perderam:**

| Gramática | Porque não |
| --- | --- |
| Filmic one-shot | Proíbe cortes duros entre grounds — e é exatamente o que ele pediu. Carrega ónus de prova e não o cumpre. |
| Live surface | A DevPlus vende sites feitos à medida, não um produto operável. Não há superfície real para operar. |
| Continuous world | Foi respondida e **corrigida** pelo próprio: "cenas distintas, era isso que eu queria". |
| Typographic poster | Bane cards e `tilt`. Perdia-se o portfólio inclinado, que é a prova. |
| Gallery / catalog | O hero seria o objeto um, sem tratamento próprio — e o pico dele **é** o hero. |
| Split stage | Não há dois lados em tensão ao longo da página. |
| Rhythmic cutlist | O hero corta em menos de um viewport, sem assentar. Incompatível com um pico no hero. |

**O que a chaptered editorial impõe, e como cumprimos:**

- Sem barra fixa. A chrome é um **fólio na margem**: número e nome do capítulo,
  a atualizar. É também a resposta aos círculos numerados do dontboardme.
- O hero é **title page**: tipografia no ground, **sem media acima da dobra**.
  Cumpre-se e ainda assim há profundidade, porque os planos são tipografia e o
  `+` em SVG — geometria, não media.
- Cortes duros entre capítulos. **Grounds pintados por secção, não `drift`.** É
  o que a `devices.md` manda para uma página chaptered: um corte não é uma
  interpolação.
- Media em coluna com legenda de facto, não argumentário.
- Banidos: `scrub` além de um capítulo (usamos zero), `spotlight`, `magnet`,
  hero full-bleed, acts de tipo com crossfade, copy centrada no hero.

## Fingerprint gate

O registry está **vazio** — é o primeiro build. Passa sem constrangimento. A
linha fica registada no fim para constranger o próximo.

## Signature move: **o `+` atravessa a página**

Uma camada fixa, própria, fora da pilha de capítulos, com o `+` da marca em SVG
(o `PLUS_PATH` de `lib/brand.ts`, nunca gerado). O scroll **da página inteira**
conduz escala, rotação, posição e cor — não o `--sc-p` de um act, precisamente
para ele sobreviver aos capítulos que atravessa.

| Onde | O que o `+` faz |
| --- | --- |
| Capa | Chega à escala de um edifício, atrás do título. É o pico. |
| Corte 0→1 | Encolhe e roda 45°, e é ele que corta a curva entre capítulos. |
| Reconhecimento | Fica pequeno, na margem, do lado do leitor. |
| Viragem | Roda de volta a 0° no momento exato em que o ground aquece. |
| Prova | Vira a marca de fólio de cada projeto. |
| Alcance | Multiplica-se na grelha de serviços. |
| Convite | Assenta ao centro e **vira o botão**. |

Não é um parâmetro de nenhum device do kit. É JS próprio na página a ler o
scroll e a escrever `transform` numa camada; o engine não é tocado.

## A pontuação

| # | Capítulo | Batida | Device | Porquê este | Span |
| - | --- | --- | --- | --- | --- |
| 0 | Capa | Espanto | `parallax` + `kinetic` | Planos tipográficos a taxas diferentes dão profundidade sem media, que é o que a gramática exige. É o pico e leva o maior span. | **3.2** |
| 1 | O reconhecimento | Incómodo | `flow` + `in` | Uma pergunta lê-se, não se encena. Um act pinado aqui era encenação. | 1.6 |
| 2 | A viragem | Alívio | `reveal` (wipe) | Um wipe **é** uma mudança de estado, e esta batida é a mudança de estado da página. | 1.8 |
| 3 | A prova | Curiosidade | `pan` | Movimento lateral lê-se como alcance; vertical lê-se como argumento. Aqui não se argumenta, mostra-se. | 2.4 |
| 4 | O alcance | Confiança | `flow` + `count` | Grelha densa e números reais. Depois do pico, isto é repouso — silêncio autorado. | 1.4 |
| 5 | O convite | Decisão | `reveal` + pointer | O `+` assenta e vira botão. Resolve em vez de esvanecer. | 1.2 |

**Verificações:**

- **7 famílias** de devices (parallax, kinetic, flow, reveal, pan, count, pointer). Mínimo é 4. ✓
- Nenhuma família duas vezes seguidas: parallax → flow → reveal → pan → flow → reveal. ✓
- **Zero `scrub`.** O máximo é dois; a gramática restringe a um; usamos nenhum. ✓
- Nenhum par de capítulos adjacentes partilha sensação. ✓
- O pico tem o maior span por margem visível: 3.2 contra 2.4 do segundo. ✓
- Total **11.6vh** em 6 capítulos — fora da banda 13.6–13.8vh que a skill marca
  como impressão digital dos quatro builds anteriores do autor. ✓

## Mundo: **hard-light graphic**

Fotografia de estúdio, uma fonte dura, sombras nítidas usadas como formas.
Escolhido em vez do ilustrado porque o dontboardme é genuinamente ilustrado e a
DevPlus não é: copiar-lhe o traço dava um site com identidade emprestada. A
luz dura dá a mesma energia com objetos reais, e a sombra longa faz o papel
gráfico que lá é feito a vetor.

**Preâmbulo de estilo** (repetido à letra em todos os prompts — é o que faz
várias imagens parecerem a mesma sessão fotográfica):

> Studio product photography, single hard undiffused key light from upper left,
> crisp high-contrast cast shadow used as a graphic shape. Saturated seamless
> backdrop. Palette strictly warm charcoal #1a1613, burnt orange #F2762B, cream
> #f7f2ec. Punchy contrast, slight halation on speculars, fine sensor grain.
> Digital medium format, sharp throughout. NOT 3D render, NOT clay, NOT
> illustration, no digital glow, no plastic sheen, no text, no logos, no people.

## Assets

**Reais (não se gera o que já existe):** as 5 capas de `public/capas/` são o
capítulo 3 inteiro.

**Gerados (4 stills):** um objeto por capítulo que precisa de ground, nenhum
acima da dobra.
