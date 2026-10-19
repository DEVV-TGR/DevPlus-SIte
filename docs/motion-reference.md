---
doc: motion-reference
fonte-de-verdade: medicao-externa
estado: relatorio-de-investigacao
controla: []
relacionado:
  - docs/04-componentes-e-padroes.md
---

# Vocabulário de movimento — medição do dontboardme.com

**Isto não é uma especificação do nosso site.** É o registo do que foi medido num
site de referência, em 6 de setembro de 2026, para servir de base à decisão sobre
o movimento da DevPlus. O que governa o nosso movimento continua a ser o
`docs/04`. Este ficheiro existe para essa conversa ter números em vez de gosto.

Referência: <https://dontboardme.com> — feito pela The First The Last.
Medido em Chrome, viewport 1496×795, com a página instrumentada por JavaScript.

## Como foi medido

O CSS não serve de fonte aqui: **o site inteiro tem uma única transição CSS**
(`transform 100ms` na barra de progresso do carrossel). Tudo o resto é GSAP a
escrever `style` inline frame a frame. Por isso a medição foi feita assim:

1. **Gravador `requestAnimationFrame`** sobre os elementos-alvo, a ~120 fps,
   lendo `transform`, `opacity` e `filter` computados em cada frame.
2. **Normalização do progresso** de cada tween entre o valor inicial e o final, e
   leitura desse progresso a 10%, 25%, 50%, 75% e 90% do tempo. É a assinatura
   que permite identificar o easing.
3. **Teste de reversão** — recuar o scroll e verificar se os valores voltam atrás.
   É o que distingue `scrub` de entrada única.

O preloader ("bounce a ball to get to the site") é um portão real que mantém o
Lenis em `lenis-stopped`. **Passa-se com um único arrasto do rato** sobre a área
da bola; o clique não conta. Depois disso o `lenis-stopped` cai e o site é normal.

## A stack, confirmada em runtime

| O quê | Versão | Como se confirmou |
| --- | --- | --- |
| GSAP | **3.12.2** | `window.gsapVersions` |
| Lenis | **1.0.25** | `window.lenisVersion`, mais `lenis lenis-smooth` no `<html>` |
| Nuxt | sim | `window.__NUXT__` |
| ScrollTrigger | usado, não exposto | comportamento; `window.gsap` não está no `window` |
| Three.js | **não usado** | `window.THREE` ausente e **zero `<canvas>` na página** |

O preloader é **SVG**, não WebGL. A suspeita de Three.js não se confirmou nesta
página: não há nenhum `<canvas>` no documento em momento nenhum da sessão.

## A descoberta que interessa

**Não há um único `scrub` no site. Não há pinning. Não há marquee animado.**

- Teste de reversão: depois de entrarem, os elementos ficam onde ficaram —
  voltar ao topo não os re-anima, e o GSAP **limpa o `transform`** no fim
  (`clearProps`), deixando `transform: none`.
- `document.querySelectorAll('.pin-spacer').length` → **0**. O ScrollTrigger não
  está a fixar nada.
- Nenhum elemento largo com `transform` em movimento contínuo, em toda a página.

A fluidez do site **não vem de orquestração complexa**. Vem de três coisas
simples e bem calibradas: o smooth scroll do Lenis, durações generosas, e
staggers grandes. Isto é uma boa notícia — é reproduzível sem WebGL e sem
amarrar nada ao scroll.

## A tabela

Durações em milissegundos, medidas. "Progresso" é o valor normalizado a 25%,
50% e 75% do tempo — é o que identifica a curva.

| Elemento | Gatilho | Propriedades | Duração | Progresso (25/50/75%) | Easing estimado | Stagger |
| --- | --- | --- | --- | --- | --- | --- |
| Título do hero, linha 1 (`top-title`) | fim do preloader | `y 84→0`, `opacity 0→1` | **981 ms** (y), 948 ms (op) | 0.50 / 0.80 / 0.94 | ~`power1.5.out`–`power2.out` | — |
| Título do hero, linha 2 (`bottom-title`) | fim do preloader | `opacity 0→1` | 951 ms | 0.49 / 0.78 / 0.93 | igual à linha 1 | **198 ms** após a linha 1 |
| Linhas de parágrafo (4 linhas, split por linha) | ScrollTrigger, entrada | `y 44→0` | **475 ms** | 0.545 / 0.84 / 0.955 | ~`power2.out` | **~150 ms** entre linhas |
| — as mesmas linhas | idem | `scaleX 0.87→1` | **290 ms** | 0.62 / 0.86 / 0.955 | ~`power2.out` | **~150 ms** |
| Título de secção (`OUR SERVICES`) | ScrollTrigger | `y 66→0`, `opacity 0→1` | não isolado | — | — | — |
| Título de secção (`HOW IT WORKS?`) | ScrollTrigger | `y 22→0`, `opacity 0→1` | não isolado | — | — | — |
| Cards de preço (`cost-of-walking__card`) | ScrollTrigger | `y 150→0`, `opacity 0.8→1` | não isolado | — | — | presente, não quantificado |
| Scroll da página (Lenis) | roda do rato | `scrollY`, 300 px | **1092 ms** | 0.80 / 0.96 / 0.99 | **`expo.out`** | — |
| Barra de progresso do carrossel | estado do slider | `scaleX` | **100 ms** (transição CSS) | — | curva CSS, não lida | — |
| Transição entre páginas | clique num link | nenhuma | **~75 ms** | — | **não há transição** | — |

### O detalhe que faz a diferença

Nas linhas de texto, **a escala e a posição têm durações diferentes no mesmo
elemento**: `scaleX` assenta em 290 ms, `y` só em 475 ms. A escala chega
primeiro, a posição continua a assentar. É isso que dá a sensação de peso —
não é uma tween só com duas propriedades.

E repara no que **não** acontece: nas linhas de texto a `opacity` fica sempre a
**1**. O reveal é feito por **deslocamento e escala dentro de uma máscara**, não
por fade. O fade só aparece nos títulos.

Nos cards de preço a `opacity` vai de **0.8** a 1 — quase nada. O trabalho é
todo feito pelos 150 px de deslocamento.

## O Lenis está nos defaults

O perfil medido (0.80 a 25% do tempo, 0.96 a 50%) é **exatamente** `expo.out` com
`duration: 1.2`, que é o default do Lenis. Não há configuração exótica aqui.
Nós já usamos Lenis no `components/Providers.tsx` — vale a pena comparar os
valores antes de mexer em mais alguma coisa.

## Como isto se compara com o que já fazemos

Esta é a parte que interessa para decidir. O `docs/04` fixa 0,45–0,6 s e a curva
`[0.22, 1, 0.36, 1]` em tudo.

| | DevPlus hoje | dontboardme |
| --- | --- | --- |
| Duração dos reveals | 450–600 ms | **475 ms** (posição) + 290 ms (escala) |
| Duração da entrada do hero | 450–600 ms | **~980 ms** |
| Stagger entre irmãos | 60–80 ms | **150 ms** |
| Curva, progresso a 25% do tempo | **0.77** | **0.545** |
| Curva, progresso a 50% do tempo | **0.96** | **0.84** |
| Deslocamento de entrada | 20 px | **44 px** (texto), 150 px (cards) |
| Fade | 0 → 1 | **quase nenhum** no texto; 0.8 → 1 nos cards |
| Scrub / pinning | nenhum | **nenhum** |

Três conclusões:

1. **A nossa duração de reveal já está certa.** 475 ms cai dentro dos nossos
   450–600 ms. Não é aí que está a diferença.
2. **A nossa curva é bastante mais agressiva do que a deles.** A meio do tempo já
   fizemos 96% do percurso; eles fizeram 84%. A `[0.22, 1, 0.36, 1]` dispara e
   trava; a deles desacelera de forma mais longa e mais orgânica.
3. **É no stagger e no deslocamento que a diferença é maior** — o dobro do
   stagger e o dobro do deslocamento. É provavelmente daí que vem a sensação de
   que "aquilo respira" e o nosso "aparece".

## O que não consegui determinar

Sou explícito nisto em vez de inventar números:

- **O easing exato.** Está dentro do bundle minificado. O que tenho é a
  assinatura do progresso, que aponta para a família `power2.out`, mas não
  distingue `power2.out` de uma Bézier próxima. Os valores da tabela são
  estimativas com a margem que a amostragem permite.
- **Os títulos de secção e os cards de preço** entram por ScrollTrigger, mas não
  consegui isolar duração e stagger: um salto de scroll grande faz o
  ScrollTrigger aplicar o estado final **sem animar**, e um scroll gradual
  dispara-os junto com os vizinhos. Os estados inicial e final estão medidos; as
  durações não.
- **O carrossel de serviços** (navegação numerada 1–4) — não o operei.
- **O carrossel de testemunhos** — não o operei.
- **A abertura do menu overlay.** Existe no DOM (`.menu__hover-ball`, links
  posicionados acima do viewport), mas em desktop os links vivem no header e o
  botão de menu tem dimensão zero. Não o testei em viewport móvel.
- **A faixa de imagens do Instagram.** Não encontrei nenhum elemento em movimento
  contínuo, nem por `transform` nem por animação CSS. Ou não é animada, ou não
  estava ativa na sessão.
- **Os hover states.** Há bolas de ténis que seguem o cursor e aparecem nos links
  do menu (`.menu__hover-ball`, 10 no DOM). Não os medi — e são identidade
  deles, não vocabulário a importar.

## O que daqui se aproveita, e o que não

**Aproveita-se** o *timing*: durações mais longas na entrada de página, staggers
de ~150 ms, deslocamentos maiores, uma curva com desaceleração mais longa, e a
disciplina de dar durações diferentes a propriedades diferentes do mesmo
elemento.

**Não se aproveita** nada de forma: as bolas de ténis, o cursor personalizado, o
preloader com jogo, o cão ilustrado, a paleta rosa, a tipografia condensada em
caixa alta. Isso é a marca deles.

E não se aproveita a stack: eles usam GSAP porque usam Nuxt e UIkit. Nós usamos
`motion` e as View Transitions do React, e as durações e curvas acima
exprimem-se lá tão bem como em GSAP.

---

# Estrutura das páginas — os dois sites lado a lado

Levantamento visual feito na mesma sessão, em `/`, `/pricing` e `/services`.
Nota de método: o preloader foi removido por JavaScript para poder percorrer as
páginas. Isso tem um efeito colateral honesto — **as entradas do hero não
disparam**, e por isso alguns heróis aparecem vazios nas capturas. O que está
descrito abaixo é a **composição**, não o estado animado.

`/services` devolve **403 em acesso direto** (nginx). Só se lá chega por
navegação SPA, a partir de outra página.

## A anatomia da homepage deles

| # | Secção | Composição |
| --- | --- | --- |
| 1 | Hero | Título em duas linhas **sobrepostas** (a segunda sobe 156 px por cima da primeira), ilustração central que sangra, redes na margem inferior esquerda, CTA no canto superior direito |
| 2 | Our services | Título **de margem a margem**, numerado `01`, seta para baixo |
| 3 | Carrossel de serviços | Nome do serviço grande à esquerda, ilustração num círculo ao centro, botão-pílula **inclinado**, navegação em **círculos numerados 1–4** flutuantes à direita |
| 4 | How it works | Quatro cards **inclinados** e sobrepostos ao título, cada um com etiqueta (`PROCESS`), número (`01.`), texto e ilustração |
| 5 | Care pet | Título gigante centrado, bolas de ténis em várias escalas por trás |
| 6 | Cost of walking | **Fundo azul** — muda a paleta inteira. Três cards claros + **um card escuro de CTA** com seta circular. Etiqueta `MOST POPULAR`. Botão `TRY IT` **por fora** do card, por baixo |
| 7 | Instagram | Fotos em **posições dispersas e irregulares**, não em grelha nem em faixa. Bordo superior desenhado à mão |
| 8 | Rodapé | Logótipo, morada, email, duas colunas de links |

## Os padrões estruturais deles

Sete decisões que se repetem e que fazem o site:

1. **Cada página tem a sua paleta.** A home é rosa, `/pricing` é azul, `/services`
   é creme. Não é um acento que muda — é o fundo inteiro.
2. **E dentro da mesma página o fundo também muda.** A secção de preços da home
   passa a azul a meio do scroll.
3. **As secções separam-se por curvas orgânicas**, arcos gigantes e bordos
   desenhados à mão. Nunca por uma linha reta ou uma borda de 1px.
4. **Rotação como norma.** Cards inclinados, botões-pílula inclinados, texto em
   arco à volta de círculos (`ADDITIONS`, `LET'S BOOK A WALK`).
5. **Tipografia condensada em caixa alta, gigante, a sangrar** para lá das
   margens.
6. **Números por todo o lado** — `01`, `02` nas secções, círculos numerados na
   navegação, `01.` nos cards de processo.
7. **Um objeto recorrente** — a bola de ténis — em todas as escalas: cursor,
   decoração de fundo, centro dos botões circulares, marcador de hover no menu.

O acordeão de serviços merece nota à parte: os painéis fechados ficam como
**abas verticais com o texto rodado 90°** na margem direita, e o painel aberto
mostra título gigante + preço, botão e descrição. É a solução mais bem resolvida
da estrutura toda.

## A anatomia da nossa homepage

De `app/page.tsx`, e a razão de cada uma está no `docs/04`:

| # | Secção | Composição |
| --- | --- | --- |
| 1 | `Hero` | Etiqueta de disponibilidade, h1 palavra a palavra, parágrafo, dois botões. Quatro planos de profundidade por trás (`HeroPlanes`) |
| 2 | Faixa de disciplinas | `Marquee` decorativo entre duas bordas |
| 3 | Quem confia em nós | Frase grande + lista de clientes por baixo de uma linha |
| 4 | Trabalho selecionado | `ProjectsMarquee` a sangrar + botão alinhado à direita |
| 5 | O que fazemos | Título + grelha de 2 colunas de cards de serviço com etiquetas |
| 6 | `Testimonials` | Esconde-se quando não há dados |
| 7 | Contacto | Card centrado com título, texto, botão e email |

## O que isto diz, a sério

A diferença entre os dois sites **não é de movimento**. É de composição.

| | DevPlus | dontboardme |
| --- | --- | --- |
| Paleta | uma, em todo o site | uma **por página**, e muda a meio |
| Separação de secções | `Section` com padding vertical, bordas retas | curvas orgânicas de página inteira |
| Grelha | tudo dentro do `Container` (`max-w-6xl`), alinhado | sangra, sobrepõe-se, sai da margem |
| Rotação | nenhuma | cards, botões e texto |
| Cards | retângulos alinhados numa grelha | inclinados, sobrepostos ao título |
| Escala tipográfica | `clamp(2.25rem, 7vw, 5.5rem)` no h1 | maior, e a sangrar |
| Objeto recorrente | o `+` (só no hero) | a bola, em todo o lado e em todas as escalas |

**O nosso movimento não vai resolver isto.** Se o objetivo é que o site deixe de
parecer contido, o trabalho está na composição — sangrar, sobrepor, mudar a
paleta por página, dar ao `+` o papel que a bola tem lá — e o movimento vem
depois sublinhar essas decisões. Fazer o inverso é pôr animação boa por cima de
uma grelha que não muda, e o resultado continua a ler-se como um site arrumado.

Isto é uma observação, não uma proposta: mexer na composição é uma decisão de
marca e é do Gonçalo, não minha.
