# Plano da terceira ronda

Escrito **antes** de gerar imagem nenhuma, como o Gonçalo pediu.

## O problema que ele apontou

> "Todas as secções seguem o mesmo padrão."

É verdade e é estrutural: cinco dos seis capítulos são *título grande + texto +
imagem a sangrar*. Muda a cor e muda o conteúdo, mas o molde é o mesmo, e é isso
que faz a página ler-se como uma lista em vez de um percurso. A skill avisa
exatamente disto — "cinco secções que se comportam da mesma maneira são uma
secção mostrada cinco vezes".

A resposta não é mais movimento: é **cada capítulo ter uma forma diferente**.

## A estrutura nova

Seis capítulos, seis formas distintas. O "reconhecimento" desaparece como
capítulo próprio e passa a ser a abertura do "como trabalhamos" — não perdia
nada em ser uma secção inteira só para uma frase.

| # | Capítulo | A forma | Vem da referência |
| - | --- | --- | --- |
| 0 | **Hero** | Tipografia gigante partida pelas margens, com uma personagem ilustrada **grande ao centro**, entre as duas metades do título | img 17 (escala) + img 18 (a personagem) |
| 1 | **Como trabalhamos** | Quatro cards **inclinados que entram com o scroll e se acumulam sobrepostos ao título**. É o oposto de uma grelha: cada um chega, roda e assenta por cima do anterior | img 8, 9, 10 |
| 2 | **A prova** | O carrossel horizontal do portfólio, como está. É o único que já tem forma própria | — |
| 3 | **Serviços, um a um** | Número enorme, ilustração num círculo ao centro, nome do serviço em baixo à esquerda, e uma **coluna de ícones circulares à direita** para saltar entre eles | img 13 |
| 4 | **Pacotes** | Três cards claros lado a lado + **um quarto card escuro que é só um CTA**, com os botões **por fora, por baixo de cada card** | img 12 (a forma) + img 11 (o conteúdo, que já é teu) |
| 5 | **O convite** | O fecho, como está | — |

O acordeão de abas verticais que fiz na ronda anterior **sai da homepage e vai
para a página `/servicos`** — foi o que ele disse: *"como tu colocaste é para a
página dedicada aos serviços"*. Não se perde, muda de sítio.

Contagem de formas: tipografia+personagem, cards a acumular, carrossel,
showcase com navegação circular, grelha de preços, fecho pinado. **Seis formas,
zero repetidas.**

## Os spans

| Capítulo | Span | Porquê |
| --- | --- | --- |
| 0 Hero | 3.2 | É o pico. Mantém-se. |
| 1 Como trabalhamos | 3.4 | Precisa de espaço: quatro cards a entrar um a um querem ~0.8vh cada |
| 2 A prova | 1.6 | Como está |
| 3 Serviços | 2.6 | Quatro serviços a passar, com pausa em cada |
| 4 Pacotes | 1.4 | Uma grelha lê-se de uma vez |
| 5 Convite | 1.2 | Como está |

**Total 13.4vh.** Fora da banda 13.6–13.8vh que a skill marca como impressão
digital. Confirmar depois de construído.

## As imagens: nove, e o que cada uma é

**Estilo** — o que ele pediu nas img 14, 15, 16 e 18: ilustração vetorial
plana, contorno preto uniforme, preenchimentos chapados sem gradientes nem
sombras, e **fundo transparente**.

**Preâmbulo único, repetido à letra:**

> Flat vector illustration, bold uniform black outlines of even weight, simple
> geometric shapes, flat colour fills with no gradients and no shading, friendly
> editorial character illustration. Colours strictly limited to burnt orange
> #F2762B, cream #f7f2ec, warm charcoal #1a1613 and black outlines. Centred
> composition isolated on a PURE WHITE #FFFFFF background, no shadow, no
> backdrop, no ground plane, no frame. NOT 3D, NOT photorealistic, NOT painterly,
> no text, no letters, no logos, no UI mockups with readable words.

| # | Ficheiro | Onde | O que mostra |
| - | --- | --- | --- |
| 1 | `h-boneco` | Hero | Uma personagem sentada a trabalhar num ecrã grande, com blocos de código e formas a flutuar à volta. É a peça central da página |
| 2 | `t1-conversa` | Passo 01 | Duas personagens frente a frente com balões de fala e um caderno |
| 3 | `t2-design` | Passo 02 | Uma personagem a desenhar um ecrã numa prancha, com régua e formas |
| 4 | `t3-construcao` | Passo 03 | Uma personagem a montar blocos que formam uma janela de browser |
| 5 | `t4-no-ar` | Passo 04 | Uma janela de browser a subir com um foguete pequeno e linhas de velocidade |
| 6 | `s1-web-design` | Serviço 01 | Ecrã com pincel e paleta, formas de layout |
| 7 | `s2-desenvolvimento` | Serviço 02 | Ecrã com chavetas de código e engrenagem |
| 8 | `s3-menus` | Serviço 03 | Telemóvel com QR e um ecrã de parede ao lado |
| 9 | `s4-painel` | Serviço 04 | Painel com interruptores, cursores e uma lista |

## O fundo transparente, e o risco

O KIE devolve JPEG/PNG sem canal alfa. O plano é gerar sobre **branco puro** e
recortar esse branco para alfa com `ffmpeg` (`colorkey`), o que funciona bem em
line-art.

**O risco, dito antes de acontecer:** se a ilustração tiver branco *por dentro*
(o interior de um ecrã, o branco dos olhos), esse branco também fica
transparente e a figura ganha buracos. A mitigação está no preâmbulo — os
preenchimentos claros são **creme `#f7f2ec`, nunca branco** — e o recorte usa
tolerância apertada. Cada imagem é inspecionada contra o ground escuro antes de
entrar; a que abrir buracos é regerada, não remendada.

## O que isto não resolve

O `docs/05` diz que a lista de serviços vive em `lib/services.ts` e a de
pacotes em `app/servicos/page.tsx`. Este protótipo **lê de lá e não inventa** —
nem serviços, nem pacotes, nem preços. Os cards de pacotes não levam valores,
porque os valores não estão no código e não é a mim que compete escrevê-los.
