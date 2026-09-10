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
| 4 | O alcance | Confiança | `flow` + acordeão | Seis painéis em abas verticais, um aberto de cada vez. Uma lista que se **opera** em vez de se ler — foi pedido explicitamente, à imagem do acordeão da `/services` do dontboardme. | 1.4 |
| 5 | O convite | Decisão | `reveal` + pointer | O `+` assenta e vira botão. Resolve em vez de esvanecer. | 1.2 |

**Verificações:**

- **7 famílias** de devices (parallax, kinetic, flow, reveal, pan, count, pointer). Mínimo é 4. ✓
- Nenhuma família duas vezes seguidas: parallax → flow → reveal → pan → flow → reveal. ✓
- **Zero `scrub`.** O máximo é dois; a gramática restringe a um; usamos nenhum. ✓
- Nenhum par de capítulos adjacentes partilha sensação. ✓
- O pico tem o maior span por margem visível: 3.2 contra 2.4 do segundo. ✓
- Total **11.6vh** em 6 capítulos — fora da banda 13.6–13.8vh que a skill marca
  como impressão digital dos quatro builds anteriores do autor. ✓

## Mundo: **render 3D / cyber**

Primeiro foi fotografia de estúdio com luz dura. O Gonçalo viu e trocou:
*"não uses imagens reais, usa mais num estilo virtual, 3D, cyber"*. As
fotografias ficaram em `out/` por usar.

**Preâmbulo de estilo** (repetido à letra em todos os prompts — é o que faz
várias imagens parecerem saídas da mesma cena):

> High-end 3D render, cinematic product visualisation, matte dielectric and
> polished glass materials, volumetric rim lighting in burnt orange, subtle
> wireframe and grid structure, crisp reflections, shallow depth of field, fine
> digital grain, dark cyber aesthetic. Abstract geometric forms only. NOT
> photography, NOT clay, NOT low-poly, NOT plastic toy, no text, no logos, no
> people, no UI screens.

**E o fundo de cada imagem é o ground exato do capítulo onde ela vive.** Foi o
defeito da primeira leva e o próprio Gonçalo apontou-o: *"as imagens terem
fundo e não encaixarem com a secção"*. Uma imagem com fundo próprio dentro de
uma caixa de cantos redondos lê-se como um autocolante colado por cima da
secção. Agora sangram de margem a margem, nascem com o ground do capítulo como
fundo, e uma máscara desvanece as quatro bordas — o que apanha a diferença que
sobra entre o hex que se pede ao modelo e o que ele devolve.

## Assets

**Reais (não se gera o que já existe):** as 5 capas de `public/capas/` são o
capítulo 3 inteiro.

**Gerados (4 stills):** um objeto por capítulo que precisa de ground, nenhum
acima da dobra.


---

## Segunda ronda: o que o Gonçalo mudou

Feedback dele depois de ver o primeiro corte.

**Gostou:** as animações e o scroll. Não se mexeu em nenhum dos dois.

**"As imagens terem fundo e não encaixarem com a secção."** Resolvido acima:
fundo do capítulo, sangria de margem a margem, máscara nas bordas.

**"Focaste o site no painel de gestão."** Tinha razão, e era um erro de leitura
meu: a copy inteira girava à volta de *"o comando é teu"*, o que faz a DevPlus
parecer um CMS em vez de um estúdio de web design. A narrativa foi reescrita:

| | Antes | Agora |
| --- | --- | --- |
| Capa | "O site é teu. O comando também." | "Web design que **soma** ao teu negócio." |
| Reconhecimento | "Já tiveste de ligar a alguém só para mudar um preço?" | "Metade dos sites da tua rua saiu do mesmo template." |
| Viragem | "Depois muda-se assim" (o painel) | "O teu é desenhado do zero." (o ofício) |

O painel de gestão continua a existir — é o serviço 04 de seis, e não o tema
do site.

**"Usa os cards como o dontboardme para os serviços."** O capítulo 4 deixou de
ser uma grelha e passou a ser o **acordeão de abas verticais** que eles usam na
`/services`: seis painéis, os fechados reduzidos a uma aba com o nome de pé, o
aberto a ocupar o resto da fila. Abre ao clique e, no rato, ao passar por cima.
Em ecrã estreito deita-se, porque um nome de pé numa coluna de 390 px é
ilegível. Os seis serviços são os de `lib/services.ts`, sem inventar nenhum.

**"Acrescenta alguns CTA."** Passaram de um para **onze**, e nenhum é
decorativo: cada um leva a uma página que existe.

| Capítulo | CTA |
| --- | --- |
| Capa | Ver o trabalho · Falar connosco |
| Reconhecimento | Como trabalhamos |
| Viragem | O que fazemos · Pedir uma proposta |
| Prova | Ver todos os projetos |
| Alcance | Falar sobre isto (em cada serviço aberto) · Ver a página de serviços |
| Convite | Começar a conversa · Ver o trabalho primeiro · o email |

**"Tem de integrar para as outras páginas."** Duas coisas: os CTA acima levam a
`/portfolio`, `/servicos`, `/sobre` e `/contacto`, e o fecho ganhou um
**colophon** com a navegação completa do site. Numa gramática que proíbe barra
fixa, é ali que a navegação vive por inteiro — o que é a solução da própria
gramática, não um remendo.
