# BRIEF — DevPlus, mundo contínuo

Estado: **parcial.** As decisões estruturais estão fechadas com o Gonçalo.
As cinco respostas abertas da entrevista continuam por dar; o que aparece
abaixo marcado como `[AUTORADO — POR CONFIRMAR]` é proposta minha, não
palavra dele, e não deve ser lida como citação.

## As oito perguntas

### 1. Vibe em três a cinco palavras, e até três referências
`[PENDENTE]`

### 2. A viagem do scroll, secção a secção, nas palavras dele
`[PENDENTE]`

`[AUTORADO — POR CONFIRMAR]` A geografia que a gramática exige é a viagem de
um projeto web: do rascunho ao negócio a crescer. Oito paragens, abaixo.

### 3. A curva de energia
`[PENDENTE]`

### 4. Como se deve sentir, etapa a etapa, e o ÚNICO momento a lembrar
`[PENDENTE]`

### 5. Uma coisa que este site faça que nenhum outro faz
`[PENDENTE]`

`[AUTORADO — POR CONFIRMAR]` O "+" somador. A marca já diz que o "+" é o que
a DevPlus acrescenta a cada projeto (docs/01). Aqui ele deixa de ser sinal e
passa a ser instrumento: um retículo em forma de "+" que o visitante move
sobre o mundo, e por onde ele passa a camada "depois" soma-se à camada
"antes", recortada pela forma do próprio "+". Não é um antes/depois de
slider; é uma adição local, com a forma do símbolo. No último waypoint o
retículo pousa e torna-se o botão.

### 6. Registo estético
**Brutalista.** Resposta do Gonçalo. Cru, mecânico, grelha rígida, escala
tipográfica extrema.

### 7. Um mundo contínuo ou cenas distintas
**Um mundo contínuo.** Resposta do Gonçalo. Gramática 2.4, modo worldflight
obrigatório: uma só fase fixa, um spacer, legs que fazem crossfade. Sem atos,
sem fronteiras de secção, sem `drift`.

### 8. Assets que já existem
As capas de projeto em `public/capas/` e o logótipo/símbolo `Dev+`
(`images/`, governado por docs/03). Sem fotografia nova do estúdio.

## O que a marca já fixa, e não se renegoceia

Vem de `docs/` e de `lib/site.ts`, que são fonte de verdade:

- A marca escreve-se **DevPlus** em texto corrido. `Dev+` é só o logótipo.
- Paleta, só tokens: `--bg` `#1a1613`, `--primary` `#F2762B`,
  `--ink` `#f7f2ec`, `--muted` `#c8bdb0`.
- Tipografia: Bricolage Grotesque, display e corpo.
- Português de Portugal, tratamento por "tu".
- Sem geografia no texto visível — decisão de agosto de 2026, docs/01.
- Sem números inventados. Nada de contadores de estatísticas.

## A curva de sentimento

`[AUTORADO — POR CONFIRMAR]` Uma linha por paragem: a emoção, e o que no
ecrã a causa.

| # | Paragem | Sente | Causado por |
|---|---|---|---|
| 1 | Papel | reconhecimento | a escala macro de um rascunho a lápis, antes de haver ecrã nenhum |
| 2 | Grelha | ordem a nascer | o traço solta-se do papel e alinha |
| 3 | Estrutura | ambição | a grelha ganha altura e vira arquitetura por cima do leitor |
| 4 | Travessia | competência | passar por dentro, ver as juntas, perceber que aguenta |
| 5 | Matéria | prazer | as superfícies ganham cor e o laranja aparece pela primeira vez a sério |
| 6 | Ecrã | chegada | emergir num ecrã aceso: é um site, e é bonito |
| 7 | Muitos | prova | o recuo revela que este ecrã é um de muitos — as capas reais |
| 8 | O mais | decisão | o "+" como objeto físico no mundo, e o único gesto que resta |

**O pico:** paragem 5→6, a emergência. É onde o mundo passa de desenho a
coisa acesa, e é a paragem que leva o maior span de scroll.

**A frase de contar a alguém:** `[PENDENTE — depende da 5]`

## Orçamento e mecânica de assets

- Oito a dez legs, clips de 5s. **160 créditos por clip.** Mais alguns stills
  a 28. Estimativa: **1600–1800 créditos**, com margem para reroll — a skill
  avisa que esta é a gramática mais frágil e que o reroll se orça à cabeça.
- Saldo em 6 de setembro de 2026: **80 créditos.** Insuficiente. O Gonçalo
  ficou de carregar.
- **Arquitetura A da lei da costura:** encadear só por start image. O leg N+1
  arranca do último frame do leg N, extraído do **mp4 já encodado**, nunca do
  master pré-encode. Nunca forçar end-image: o modelo resolve o conflito
  puxando a câmara para trás e todas as legs acabam no mesmo plano geral.
- Geração é **sequencial**, não paralela. É o que a corrente impõe.
- Pace: mesma duração de clip, mesmo peso. O desvio entre legs fica abaixo de
  10% ou o mundo dá arranques e o leitor lê isso como defeito.
- Encode: GOP 8 desktop, GOP 4 mobile, e `data-sc-src-mobile` para toda a leg.
- Posters: o ffmpeg local não traz encoder libwebp, portanto saem JPEG. Mais
  pesados, não fatais.

## Gramática, e o que ela proíbe

Gramática 2.4, mundo contínuo. Herda as proibições, e elas não são negociáveis:

- Sem blocos `sc-section`, sem atos, sem segunda fase, sem passos `drift`.
- Nada faz scroll por cima do canvas. O texto chega **dentro** dele, nos
  waypoints, na camada de copy fixa.
- Sem `pan`, sem `flow`, sem cortes duros, sem troca de `src`.
- A nav é um **mapa**: lista de waypoints, leitura de profundidade, marcador
  de posição, e é clicável — um mundo onde não se pode saltar é um vídeo.
- O herói é uma posição de partida dentro do mundo, não uma fase de título
  à parte.
- O fecho é uma chegada a um sítio do mesmo canvas, e o CTA é um objeto
  desse sítio.
