---
doc: componentes-e-padroes
fonte-de-verdade: codigo
controla:
  - components/ui/Button.tsx
  - components/ui/Container.tsx
  - components/ui/Section.tsx
  - components/ui/ProjectCard.tsx
  - components/Reveal.tsx
  - components/Marquee.tsx
  - components/ProjectsMarquee.tsx
  - components/PageHero.tsx
  - components/paginas/Capa.tsx
  - components/paginas/ServicosAcordeao.tsx
  - components/paginas/PortfolioIndice.tsx
  - components/Providers.tsx
  - components/Nav.tsx
  - components/ContactForm.tsx
  - lib/contacto.ts
  - app/api/contacto/route.ts
  - components/Testimonials.tsx
  - lib/testimonials.ts
  - app/page.tsx#ordem-das-seccoes
  - components/home/Curva.tsx
relacionado:
  - docs/02-cores-e-tipografia.md
---

# Componentes e padrões

**Fonte de verdade: o código.** Este doc não repete props — descreve quando usar
cada primitivo e o que nunca fazer. Para a assinatura exata, lê o ficheiro.

Regra geral: **não escrevas markup de layout à mão** se já existe primitivo.
Uma `<section>` com padding próprio ou um `<div class="max-w-6xl mx-auto">` novo
é sinal de que devias ter usado `Section` ou `Container`.

## Os primitivos

| Componente        | Para que serve                                                             | Nunca                                                                                      |
| ----------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `ui/Container`    | largura máxima (`max-w-6xl`) e padding lateral                             | criar outro wrapper de largura                                                             |
| `ui/Section`      | espaçamento vertical entre blocos; `top`/`bottom` desligam cada metade      | pôr padding vertical à mão, ou tentar anulá-lo com `pt-0` — ver abaixo                     |
| `ui/Button`       | 3 variantes: `primary`, `outline`, `ghost`                                 | usar `<a>` cru com classes de botão; links externos já são detetados pelo `http` no `href` |
| `ui/ProjectCard`  | um projeto na grelha (capa, etiquetas, serviços)                           | duplicar o card noutra página                                                              |
| `Reveal`          | aparecer no scroll (fade + 16px)                                           | envolver cada elemento; envolve o bloco                                                    |
| `Marquee`         | faixa horizontal infinita, decorativa                                      | pôr lá conteúdo que importe — é `aria-hidden`                                              |
| `ProjectsMarquee` | a faixa de projetos da página inicial: conteúdo real, focável e arrastável | usá-lo para decoração — para isso é o `Marquee`; e pôr `gap` no track, que parte o ciclo   |
| `PageHero`        | cabeçalho da `/privacidade` — texto que não precisa de composição           | usá-lo nas quatro páginas que ganharam capa própria; para essas é o `paginas/Capa`         |
| `paginas/Capa`    | a capa de uma página interior: um ecrã só, com o título a ocupá-lo          | pôr-lhe uma figura — a figura é o pico da inicial e repeti-la em cinco capas gasta-a       |
| `paginas/ServicosAcordeao` | os seis serviços, em colunas que abrem uma de cada vez             | usá-lo na inicial: lá os serviços apresentam-se um a um, aqui catalogam-se                  |
| `paginas/PortfolioIndice`  | o trabalho em índice, com a capa do ativo numa moldura fixa        | voltar a pôr aqui a grelha de `ProjectCard` — diz o mesmo que a fila da página inicial      |
| `home/HeroHome`   | a capa da página inicial                                                   | reutilizar noutro sítio; e pôr o título em dois elementos — ver abaixo                    |
| `home/Cruz`       | o "+" que atravessa uma página. `postos` muda o percurso                    | dar-lhe os mesmos postos em duas páginas — o que gasta o gesto é repeti-lo **igual**       |
| `home/Curva`      | o corte entre dois capítulos                                               | pôr uma linha reta no lugar dela; e usá-la sem `de`, que deixa passar o fundo do `body`     |
| `home/ComoTrabalhamos` | os quatro passos: cards que se acumulam em computador, fila horizontal no telemóvel | transformá-los numa grelha — a acumulação é o ponto; e dar-lhes a pilha no telemóvel, onde não cabe |
| `home/ProvaCarrossel`  | o trabalho feito, em fila horizontal com a página presa                | usá-lo para hierarquia; lateral lê-se como alcance, não como ordem                          |
| `home/ServicosMostra`  | os serviços um de cada vez                                            | catalogar aqui os seis — a página inicial apresenta, a `/servicos` cataloga                |
| `home/Pacotes`    | por onde um projeto começa                                                 | escrever preços; saem de proposta, ver `docs/05`. E distinguir o destacado só com a etiqueta |
| `home/Fecho`      | o convite, no fim                                                          | deixá-lo esbater-se para o rodapé                                                          |
| `Hero` *(sem uso)* | era a capa antiga                                                         | —                                                                                          |
| `Testimonials`    | o que os clientes dizem, na homepage a seguir aos serviços                 | inventar a frase de um cliente para encher a secção — ver abaixo                           |
| `Wordmark`        | o logótipo com link para "/"                                               | ver `docs/03`                                                                              |
| `Lockup` / `Logo` | o logótipo "D+" e o "+" isolado                                            | desenhar o logótipo à mão em SVG — ver `docs/03`                                           |
| `Providers`       | Lenis, e a ligação dele ao ScrollTrigger                                   | acrescentar providers sem necessidade; separar os relógios do Lenis e do GSAP; ir buscar a instância por `ref` em vez do `useLenis` |

Secções encadeadas levam **`top={false}`** na segunda em diante, para o
espaçamento não duplicar. É o padrão em toda a homepage. Há também
`bottom={false}`, para a secção seguinte encostar a esta — é o que cola a faixa
de projetos à lista de clientes.

> **Nunca `className="pt-0"`.** Esteve assim em 13 sítios e **não funcionava a
> partir dos 640px**: o `pt-0` só ganha ao `py-16`, e as variantes `sm:py-24` e
> `lg:py-32` são escritas depois no CSS gerado, portanto ganhavam de volta. O
> site andou com o dobro do espaço entre secções encadeadas em todo o desktop, e
> nenhum valor que se afinasse no `className` o corrigia — porque o problema não
> era o valor, era uma classe a tentar anular outra da mesma especificidade. Por
> isso o `Section` desliga cada metade por **ausência de classe**, e não por
> `-0`. Se voltares a ver espaço a dobrar, é aqui que se procura.

## A homepage conta uma história

Setembro de 2026, segunda escrita. A versão anterior tinha sete secções que
eram **todas a mesma forma**: título grande, texto, uma coisa por baixo. Mudava
a cor e o conteúdo, mas o molde não mudava — e uma página assim lê-se como uma
lista, não como um percurso. O Gonçalo disse-o em três palavras: *"todas as
secções seguem o mesmo padrão"*.

A resposta não foi mais movimento. Foi **cada capítulo ter uma forma
diferente**, e é essa a regra que agora governa esta página:

| # | Capítulo | A forma | Porque esta |
| - | --- | --- | --- |
| 0 | Capa | Tipografia partida pelas duas margens, figura no vão | É o pico da página, e um pico precisa de composição, não de um cabeçalho |
| 1 | Como trabalhamos | Quatro cards inclinados que chegam com o scroll e se **acumulam** sobre o título | No fim vê-se o processo todo de uma vez. Quatro caixas lado a lado diziam o mesmo e não se lembravam |
| 2 | A prova | Fila horizontal, com a página presa | Lateral lê-se como **alcance**; vertical lê-se como argumento. Aqui não se argumenta |
| 3 | Serviços | Um de cada vez, número enorme, navegação em círculos | Uma lista lê-se; isto **opera-se**, e quem procura um serviço salta-lhe em cima |
| 4 | Por onde começar | Grelha de pacotes: três e um caminho | O quarto não é um card, é a saída para quem não se revê nos três |
| 5 | O convite | Fecho quente, que resolve | A última sensação é a que se leva |

**Seis formas, zero repetidas.** Se acrescentares um capítulo, ele traz uma
forma nova ou não entra.

Os grounds mudam por capítulo com cortes duros, separados por `Curva` — ver os
tokens em `docs/02`. O `Cruz` é a única coisa que atravessa todos.

### O percurso do "+" mede-se de zero a `"max"`

O `Cruz` é conduzido pelo scroll da **página inteira**, e é isso que o deixa
sobreviver aos cortes entre capítulos. O ScrollTrigger dele leva `start: 0` e
**`end: "max"`** — e nenhuma das duas alternativas óbvias serve:

- `trigger: document.body` com `end: "bottom bottom"` mede o corpo do documento
  no momento em que o `_refreshAll` do ScrollTrigger tem os pins **revertidos**,
  portanto sem os ~6000 px que a `ComoTrabalhamos`, a `ProvaCarrossel` e a
  `ServicosMostra` acrescentam. Foi assim que o "+" chegou a atingir o último
  posto aos 50% da página e a ficar lá parado o resto do caminho;
- um número, ou uma função que devolva o `maxScroll`, é avaliado uma vez por
  refresh e sofre do mesmo problema.

O `"max"` é o único valor que o GSAP volta a corrigir num **segundo passe**, no
fim do `_refreshAll`, já com os espaçadores dos pins no sítio. Se acrescentares
uma secção pinada à página, o gesto acompanha sozinho.

### A fronteira entre capítulos tem cinco camadas

A `Curva` não é só a forma sólida. São cinco coisas, de baixo para cima: o
ground do capítulo que fica para trás (a prop **`de`**), a forma sólida com a
cor do que chega (`cor`), três **linhas de nível** que sobem para dentro do
capítulo anterior a esbater-se, uma **costura** de pontos cinco unidades acima
da aresta, e o **"+" semeado ao longo dela**.

Tudo o que não é a forma sólida vive **acima** da fronteira, sobre o ground do
capítulo que fica para trás. É o que faz a divisória ler-se como uma margem em
vez de um corte de tesoura — e é o que a distingue de um separador de template,
numa peça que se repete dez vezes no site.

- **O `de` não é opcional por preguiça.** Sem ele a metade de cima do SVG é
  transparente e deixa passar o fundo do `body`: no par claro→escuro da
  `ProvaCarrossel` para os serviços isso punha um corte a régua por cima da
  curva, que é exatamente o que ela existe para não ser.
- **A costura corre acima da aresta, não em cima dela.** Na última passagem o
  capítulo que chega é o próprio laranja, e uma costura laranja sobre laranja
  não existe.
- **O SVG fica em `z-0`.** Chega para tapar o `Cruz`, que está no mesmo plano e
  vem antes no DOM. Com um `z` acima de 1 a curva passa a ser a única superfície
  da página por cima do `.grain-overlay` — e vê-se: uma faixa lisa com uma
  aresta reta a atravessá-la de lado a lado.

#### A curva é dados, não uma string de path

O `d` deriva dos pontos de controlo, e não o contrário. Uma string de path serve
para desenhar e mais nada, e os "+" precisam de saber **por onde é que a curva
passa**. A alternativa — medi-la no browser com `getPointAtLength` — obrigava a
`Curva` a ser componente de cliente e a esperar pelo DOM para desenhar uma coisa
que é estática. Assim os pontos e o traço não podem divergir: são a mesma fonte.

#### O "+" da divisória tem três regras

A geometria vem do `Logo`, que a lê de `lib/brand.ts`. Nunca se redesenha à mão
— ver `docs/03`.

1. **Nada de rotações perto de 45°.** Um "+" a meio caminho é um X, e um X ao
   longo da fronteira lê-se como um botão de fechar. É a mesma regra do `Cruz`,
   e vem do mesmo sítio: do protótipo, onde aconteceu.
2. **Nenhum "+" atravessa a aresta.** Metade laranja sobre o capítulo que fica e
   metade sobre o que chega não se lê como símbolo, lê-se como erro de recorte.
   O `dy` de cada um tem de ser maior do que meia altura do símbolo mais as
   cinco unidades da costura. Foi a primeira versão da lista, e via-se.
3. **A poeira não sobrevive a uma faixa de 60px.** Num ecrã estreito a divisória
   encolhe para o mínimo do `clamp` mas continua a ter 1440 unidades de largura,
   ou seja os "+" ficam quatro vezes mais juntos e com 3px. Medido a 580px: os
   pequenos leem-se como sujidade em cima da costura. Abaixo de `md` ficam só os
   seis maiores.

Os "+" vivem **fora** do SVG. Lá dentro apanhavam o `preserveAspectRatio="none"`,
que estica tudo com a caixa — num ecrã de 390px a divisória é 0.27× em largura e
0.39× em altura, e o símbolo chegava oval. Fora dele são caixas quadradas
posicionadas em percentagem da mesma caixa, e o mapeamento do `viewBox` é linear,
portanto a percentagem dá exatamente o ponto da curva.

#### O acento muda com o ground que fica para trás

Sobre escuro o `--primary` dá ~7.9:1 e lê-se sozinho. Sobre o `--paper` dá
~2.2:1, e a mesma divisória que tem carácter entre dois capítulos escuros ficava
a boiar na passagem da prova para os serviços: os ecos a 0.12 e 0.22 de opacidade
desapareciam. Por isso a prop **`ground="claro"`** troca o acento para
`--primary-strong` e sobe as opacidades — o que se iguala entre as dez passagens
é a **presença**, não o número. Nenhuma das duas cores é nova: são tokens do
`app/globals.css`.

O `ground` não se deduz do `de` porque o `de` é uma string de CSS que o servidor
não resolve. Hoje há **uma só** passagem clara em todo o site: a terceira da
página inicial.

### As páginas interiores também têm forma própria

Setembro de 2026, a seguir à segunda escrita da homepage. A regra das seis
formas não acaba na página inicial: se as cinco páginas interiores forem todas
"cabeçalho mais blocos empilhados", o site volta a ler-se como uma lista, só
que distribuída por ficheiros.

| Página | A forma | Porque esta |
| - | --- | --- |
| `/servicos` | Acordeão de seis colunas verticais, uma aberta de cada vez | Aqui quem chega já sabe o que procura. A inicial **apresenta** quatro serviços um a um; esta **cataloga** os seis, e catalogar quer dizer vê-los todos ao mesmo tempo |
| `/portfolio` | Índice tipográfico, com a capa do ativo numa moldura que não se mexe | A inicial já mostra o trabalho a passar de lado. Uma grelha de capas aqui era a mesma coisa outra vez — e um índice é a forma de quem procura, não de quem passeia |
| `/portfolio/[slug]` | Capa a sangrar, e uma ficha técnica que fica presa ao lado do texto | Numa leitura longa a ficha fixa é o que impede que se perca de quem é o projeto a meio do segundo parágrafo |
| `/sobre` | Coluna central estreita, com as margens habitadas pelas notas | Um estúdio pequeno a falar de si não precisa de secções: precisa de uma voz, e de notas à margem que não a interrompam |
| `/contacto` | Duas colunas num ecrã, sem percurso | É onde se age. Um formulário que obriga a rolar para se ver inteiro perde gente a meio |
| `/privacidade` | `PageHero` e texto | É a exceção, e é deliberada: um documento legal não leva composição |

**O "+" deixou de ser só da inicial.** A regra anterior dizia para não o repetir
noutra página. Estava certa enquanto a homepage era a única com esta gramática;
com cinco páginas a partilhá-la, o que gastava o gesto não era repeti-lo, era
repeti-lo **igual**. Cada página passa os seus `postos` — as interiores levam
quatro em vez de sete — e há duas regras que a inicial não precisou de ter,
porque lá o "+" vive quase sempre sobre imagem ou sobre vazio:

1. **Grande só onde não há texto corrido**, e por pouco tempo: o primeiro tramo
   acaba aos 22% do percurso. Com ele a durar até meio, o "+" ainda ia em escala
   1,6 quando o conteúdo começava, e ao lado das capas do portfólio isso não é
   um gesto de fundo, é uma mancha a competir com o trabalho.
2. **Nunca 45°.** Um "+" rodado a meio caminho é um X — e um X grande e cinzento
   por cima do trabalho lê-se como um botão de fechar.

E uma terceira, que é de pintura e não de composição: **numa página com `Cruz`,
as secções levam `relative`**. A camada do "+" é `fixed z-0`, e uma secção sem
`position` é pintada **antes** de qualquer elemento posicionado — ou seja, por
baixo dele. Na página inicial nunca se viu porque lá todas as secções já são
`relative`; na `/contacto` o "+" apareceu por cima do formulário, a tapar os
campos.

### O telemóvel não é o computador estreitado

Setembro de 2026, depois de o site estar feito. Medido a 390×844 contra o site
de referência do `BRIEF`, no mesmo ecrã: os nossos títulos eram **um terço** dos
dele (30–38px contra 79–113px) e a homepage era **73% mais longa** (15,6 ecrãs
contra 9). Não havia overflow, nem erros, nem quebras de desempenho — o site
funcionava; o que ele não era é **composto** para ali.

O que mudou, e o que fica como regra:

| | Regra |
| --- | --- |
| **Tipografia** | A escala vive em `globals.css` e o `vw` domina no telemóvel — ver `docs/02`. Nada de texto abaixo de 14px |
| **Comprimento** | A homepage passou de 15,6 para 13,3 ecrãs. O `verificar-scroll.mjs --mobile` tem um teto por rota — é um **travão de regressão**, não uma meta: quem acrescentar uma secção sabe logo |
| **Uma forma pode ter duas** | A `ComoTrabalhamos` é uma pilha de cards em computador e uma **fila horizontal** no telemóvel. Quatro cards sobrepostos num ecrã de 390px saíam pelas margens, e a pilha custava 2,8 ecrãs. É a mesma secção com a mesma informação e duas composições — e é o que a referência faz nesta mesma secção |
| **Pin, mas curto** | O pin fica onde a referência o tem. O que encurta é o percurso: a folga no fim do `ProvaCarrossel` era um ecrã inteiro parado, e passa a 15% no telemóvel. O acordeão da `/servicos` **perde o pin**: lá está deitado, cabe num ecrã e meio, e o pin cobrava 3,4 ecrãs para mostrar o que já se via |
| **Toque** | 44px de área tocável. Consegue-se com `min-h-11` e `px`, sem mexer no desenho — e com `-mx`/`-my` a compensar, o elemento nem muda de sítio. A exceção é o link **dentro de uma frase**, que não se aumenta: abria buracos entre as linhas (WCAG 2.5.8) |
| **Ordem de leitura** | O que é margem em computador cai no fluxo no telemóvel, **pela ordem do JSX**. No `/sobre` isso punha as cinco notas antes da primeira frase do texto. Notas de margem escrevem-se **intercaladas** e só depois vão para a margem com `lg:absolute` |
| **O menu é um lugar** | Ecrã inteiro, links à escala dos títulos. E o header não pode ter `backdrop-blur` com ele aberto: um `backdrop-filter` cria bloco contentor para os `fixed` descendentes, e o painel ficava preso aos 64px do header |

### Chegar não é o mesmo que aparecer

Dois atributos, e o `scripts/verificar-scroll.mjs` trata-os de maneira
diferente:

| Atributo             | O que promete                                    | Como se verifica                                   |
| -------------------- | ------------------------------------------------ | -------------------------------------------------- |
| `data-reveal-item`   | entra de uma vez quando a secção aparece         | invisível dentro do ecrã, em qualquer posição, é avaria |
| `data-scroll-item`   | chega ao longo do percurso e fica                | tem de estar visível em **alguma** posição          |

Os cards da `ComoTrabalhamos` são do segundo tipo: enquanto a secção se
aproxima, é suposto ainda não terem chegado. Marcá-los como revelação enche o
verificador de avarias que não existem — e um verificador que ladra por tudo
deixa de se ler.

### O que saiu, e continua no repositório

A faixa de disciplinas (`Marquee`), a lista de clientes e a faixa de projetos
(`ProjectsMarquee`) deixaram de estar na página inicial. **Os ficheiros ficam**:
o `ProjectsMarquee` carrega meia dúzia de aprendizagens que custaram caro — o
arrasto, a inércia do telemóvel, o `setPointerCapture` que rouba o clique — e
apagá-lo deitava fora tudo isso por uma decisão de composição que pode mudar.
Estão sem uso, não estão mortos.

### Secções que se escondem

O `Testimonials` devolve `null` quando `lib/testimonials.ts` está vazio: não há
título, não há espaçamento, a secção não existe no HTML. **É o padrão a seguir
sempre que uma secção depende de dados que ainda não existem** — uma zona de
prova social vazia, ou um "em breve", anuncia que ninguém falou, o que é pior do
que o silêncio.

E o array só se preenche com frases que um cliente disse mesmo e autorizou. Um
testemunho inventado atribuído a um cliente real é uma avaliação falsa, não é
texto de rascunho — quem o lê não tem como distinguir.

### O pacote destacado é um ground, não uma etiqueta

Os quatro cards de "Por onde podemos começar" eram todos `bg-paper`, e o mais
escolhido distinguia-se por um rótulo no canto superior direito. Numa fila de
quatro colunas isso não faz o olho parar em lado nenhum: o rótulo lê-se depois
de já se ter lido os quatro títulos, e nessa altura já não recomenda nada.

Agora o card destacado é **`bg-primary` inteiro**, com `text-primary-ink` —
7,26:1, o par já medido no `docs/02` e o mesmo que o `Fecho` usa. O texto de
apoio vai a `/85` (5,86:1) para manter a hierarquia sem cair abaixo dos 4,5:1, e
o "+" da lista troca o laranja pela tinta do ground: sobre o creme ele tem
2,30:1 e é decorativo, sobre laranja desaparecia de vez.

**A etiqueta fica.** Se o destaque passasse a ser só a cor, quem não a distingue
deixava de saber qual é o pacote recomendado — 1.4.1 da WCAG. É ela que o diz
por escrito; a cor é que o diz à distância.

A coluna inteira acaba em laranja, porque o botão por baixo é `primary` como o
dos outros três. Não é acidente: o que separa o botão do card é o `gap-3` com o
ground escuro a passar no meio, e essa é a regra que não se desfaz — o botão
vive **por fora** da caixa.

## Movimento

**A biblioteca é o GSAP.** Setembro de 2026: o Motion saiu do projeto e o
movimento passou todo para `gsap` + `ScrollTrigger`, com `useGSAP` do
`@gsap/react`. Não voltes a instalar o `motion` — duas bibliotecas de animação
no mesmo site são duas gramáticas, e elas divergem.

**Os valores vivem em `lib/motion.ts`, na constante `MOVIMENTO`, e em mais lado
nenhum.** Não escrevas durações à mão num componente. E não são gosto: saíram de
uma medição a 120 fps sobre um site de referência, registada em
`docs/motion-reference.md`.

| | Valor | Era antes |
| --- | --- | --- |
| Entrada de um bloco no scroll | **0,475 s** | 0,45–0,6 s |
| Opacidade dentro dessa entrada | **0,29 s** | a mesma da posição |
| Entrada da página (hero) | **0,95 s** | 0,6 s |
| Transição entre páginas | 0,45 s | 0,45 s |
| Curva | **`power2.out`** | `[0.22, 1, 0.36, 1]` |
| Stagger entre irmãos | **0,15 s** | 0,06–0,08 s |
| Deslocamento de entrada | **44 px** | 16 px |

- **A opacidade e a posição têm durações diferentes de propósito.** O bloco acaba
  de aparecer aos 290 ms e continua a assentar até aos 475 ms. Com uma duração
  só, chega inteiro de uma vez e lê-se como um `fade` com deslocamento; com duas,
  tem peso.
- **A curva é mais suave do que a anterior.** A `[0.22, 1, 0.36, 1]` ia em 96% do
  percurso a meio do tempo; a `power2.out` vai em 84%. A antiga dispara e trava.
- `Reveal` dispara uma vez (`once: true`) — nada re-anima ao subir.
- **Nada de `setState` a partir de um callback do GSAP.** Vale para o
  `onComplete` de uma animação e vale para o `onUpdate` de um ScrollTrigger. O
  `setState` re-renderiza durante o tick do próprio GSAP; se o render mexer no
  layout — e mexe, é para isso que serve — o ScrollTrigger recalcula-se a meio
  do seu update. Custou duas vezes: um separador pendurado no `Reveal`, e um
  `Cannot read properties of undefined (reading 'end')` no `ServicosAcordeao`,
  onde a coluna aberta mudava de largura a cada frame de scroll. **O estado de
  quem é conduzido pelo scroll vive num atributo** (`data-aberta`,
  `data-ativo`), escrito no DOM, com o CSS a tratar do resto — como o `Cruz`
  faz com as suas variáveis. O React não precisa de saber.
- **Movimento reduzido deixou de vir de borla.** O `MotionConfig` desarmava as
  animações sozinho; o GSAP não desarma nada. Cada componente que anima **tem de
  verificar** `prefers-reduced-motion` e mostrar o conteúdo sem o animar. A regra
  de `app/globals.css` continua a tratar do marquee e do spin, que são CSS.
  **Uma exceção:** o `ProjectsMarquee` transporta conteúdo navegável, e congelá-lo
  deixaria três projetos fora do ecrã sem forma de lá chegar. Aí o componente
  desliga o avanço automático (lê a mesma preferência em JS, porque o movimento é
  scroll e não animação CSS) e `globals.css` acrescenta-lhe snap: continua a
  arrastar-se, só não anda sozinho.
- **A faixa de projetos move-se por `scrollLeft`, não por `translateX`.** É o que a
  torna agarrável: quem quer voltar a um projeto que passou arrasta-o de volta em
  vez de esperar pela volta. Vem de borla o dedo, o trackpad, a roda com shift e as
  setas; o arrasto com o rato é o único que precisa de código. O ciclo fecha-se
  pondo o `scrollLeft` sempre dentro de uma ronda — sem isso o browser encravava
  no extremo esquerdo, que nunca deixa passar de 0.
- **Dentro da faixa não há `backdrop-filter`.** Cada card tem três superfícies
  desfocadas sobre a capa, e a faixa mostra 15 cards: medido no Chrome, **todos os
  elementos com `backdrop-filter` da homepage estavam dentro do carrossel** — a serem
  recompostos a cada frame de um contentor a rolar depressa. Aí o desfoque dá lugar a
  superfície opaca (`bg-bg/85`), pela prop `blur={false}` do `ProjectCard`; nas
  grelhas paradas fica como está. Não o resolvas com CSS a caçar classes por dentro
  do viewport — a decisão é de quem usa o card, e passa pela prop.
- **Escrever no `scrollLeft` cancela a inércia do telemóvel.** Por isso o avanço
  automático espera ~250 ms sem movimento vindo de fora antes de voltar a empurrar:
  enquanto o impulso do dedo corre, o componente só o acompanha. Sem essa espera o
  primeiro frame a seguir ao dedo sair mata o impulso e a faixa parece presa.
- **Pausar ao passar por cima é só para o rato.** Um toque também dispara
  `pointerenter`, mas o `pointerleave` correspondente muitas vezes nunca chega — e a
  faixa ficava parada para sempre a partir do primeiro toque. Filtra por
  `pointerType === "mouse"`; o dedo tem o par `touchstart`/`touchend`.
- **A posição dá a volta numa janela centrada**, não na primeira ronda. O mínimo para
  o ciclo fechar deixava a faixa colada ao extremo esquerdo, onde um impulso bate na
  parede do scroll e pára a seco. A janela é uma ronda inteira centrada no que dá
  para rolar, o que garante a mesma folga dos dois lados em qualquer largura.
- **As repetições da faixa não levam `inert`.** `inert` tira do teclado e do leitor
  de ecrã, mas também mata o rato — e como a faixa mostra várias rondas ao mesmo
  tempo, metade dos cards no ecrã não abriam ao clique. O que se quer é `aria-hidden`
  na `<li>` e `tabIndex={-1}` no link (prop `focusable={false}` do `ProjectCard`):
  clicável para quem vê, invisível para quem tabula. São 15 cards e **5** alvos de
  teclado.
- **Numa faixa arrastável não uses `setPointerCapture`.** Parece o caminho certo
  para o arrasto continuar quando o cursor sai do elemento, mas o Chrome redireciona
  também o `click` para quem capturou o ponteiro — e o link do projeto deixa de o
  receber, portanto clicar num card não abre nada. Medido: o alvo do `click` era a
  `div` do viewport, e o listener no `<a>` nunca disparava. O arrasto fora da faixa
  faz-se com `pointermove`/`pointerup` na `window`.
- **Uma faixa arrastável tem de cancelar o `dragstart`.** O browser tem um arrasto
  próprio para links e imagens, e ele ganha ao nosso: sem o cancelar, agarrar num
  card arrasta o *link do projeto* em vez da faixa. `-webkit-user-drag: none` chega
  ao Chrome e ao Safari e deixa o Firefox de fora — o listener chega aos três. O
  track leva ainda `select-none`, senão o arrasto pinta seleção pelo caminho.
- **As duas faixas correm no mesmo sentido**, da direita para a esquerda. Chegou-se
  aí a olhar para o ecrã: a faixa de projetos ao contrário lê-se como se a página
  estivesse a recuar. Contrariá-las uma à outra parece boa ideia no papel e não é.
- **Nenhuma animação pode ser a condição de o conteúdo existir.** Tudo o que nasce
  invisível à espera de animar leva `data-reveal`, e `globals.css` mostra esses
  elementos enquanto o `<html>` não tiver a classe `js` — posta por um script inline
  em `app/layout.tsx`. Sem isto, o HTML pré-renderizado sai com dezenas de elementos
  a `opacity:0` e quem não executa JavaScript vê uma página em branco. O `Reveal`
  tem ainda um temporizador de segurança: se o observador de viewport não disparar
  (renderizadores headless, separadores em segundo plano), mostra-se ao fim de 1,2 s.
- **O `<html>` leva `suppressHydrationWarning`, e é preciso.** Duas coisas lhe mexem
  no `class` antes de o React hidratar: o script da classe `js`, acima, e o Lenis,
  que lhe põe `lenis lenis-smooth` ao arrancar. O servidor manda
  `class="…__variable"` e o browser já tem mais três classes — diferença que o React
  reporta como erro de hidratação na consola. O `suppressHydrationWarning` cala-o
  **só nesse elemento e só nos atributos dele**; a árvore por baixo continua
  verificada. **Não o alastres ao `<body>` nem a componentes:** aí um aviso destes é
  um bug a sério e tem de aparecer.
- **Hover em cards: o contorno acende, e o card sobe — mas são duas coisas.** O
  anel está sempre lá, `ring-2 ring-transparent`, para que o hover não mexa no
  tamanho da caixa; o que muda é a cor — e acende **com a cor que o card não
  tem**: `ring-primary` sobre creme e sobre `surface`, `ring-ink` sobre o card
  laranja dos pacotes. Ali `ring-primary-ink` parece a escolha óbvia e não é: o
  anel desenha-se por fora da caixa, sobre o ground escuro, e `primary-ink`
  contra `bg` são 0,02 de luminosidade — não se via, e em movimento reduzido
  esse card ficava sem resposta nenhuma. O deslocamento é `-translate-y-1` e vive **sozinho atrás
  de `motion-safe:`** — a regra global de `globals.css` corta a *duração* da
  transição, não o deslocamento, portanto sem essa variante quem pede movimento
  reduzido continua a ver o card saltar, só que instantaneamente. Com ela sobra a
  mudança de cor, que é o que se quer. `duration-200`, a mesma dos botões: é
  resposta a um gesto, não uma entrada — e por isso é um dos poucos números que
  não vem do `MOVIMENTO`, que é a gramática do scroll. Botões:
  `active:scale-[0.97]`.

### O que o GSAP custou a aprender

Cinco coisas que partiram o site e a razão de cada uma. Não as desfaças:

- **Nada de `setState` num `onComplete` do GSAP.** O `Reveal` avisava o React
  quando acabava de animar. Doze `Reveal` a fazer isso re-renderizavam *durante o
  tick do próprio GSAP*, o que voltava a mexer no layout, o que fazia o
  ScrollTrigger recalcular dentro do mesmo tick. Quem mostra o bloco é o GSAP, a
  escrever no DOM — o React não precisa de saber.
- **Nada de `ResizeObserver` sobre o `<body>` a chamar `ScrollTrigger.refresh()`.**
  Parece o passo óbvio para apanhar imagens `lazy` e realimenta-se: o `refresh()`
  mexe no layout, que dispara o observer, que chama `refresh()`. O ScrollTrigger
  já ouve o `resize` da janela; para as imagens, o `load` chega.
- **Nada de `clearProps: "all"`.** Devolver o elemento ao CSS devolve-o à regra
  que o esconde (ver abaixo), e ele desaparece para sempre. Põe `opacity: 1` à
  mão; `clearProps: "transform"` é seguro.
- **Nada de `mm.revert()` à mão dentro do `useGSAP`.** Ele já reverte o que for
  criado no seu escopo. Revertê-lo duas vezes, com o StrictMode a montar e
  desmontar, matava a timeline da segunda montagem — e o bloco ficava preso no
  estado inicial, com `opacity: 0` escrito no `style`.
- **O Lenis e o GSAP partilham um relógio só.** `autoRaf: false` no Lenis, e o
  `raf` dele passa a ser chamado pelo `gsap.ticker`. A correr em separado, o
  ScrollTrigger lê a posição de um frame que o Lenis ainda não escreveu, e as
  entradas disparam um frame atrasadas — vê-se como tremor durante um scroll
  rápido.
- **Essa ligação faz-se com o `useLenis`, de dentro do `ReactLenis`, e nunca
  por uma `ref` do componente que o renderiza.** O `ReactLenis` cria a instância
  no seu `useEffect` e guarda-a em estado; a `ref` só passa a ter `.lenis` num
  render posterior, portanto um `useEffect` com `[]` no pai lê `undefined`,
  desiste, e nunca mais tenta. **E com `autoRaf: false` o preço não é o tremor:
  é ninguém chamar o `raf`.** O Lenis continua a apanhar a roda do rato e a
  travar o scroll nativo sem aplicar o seu — a página fica imóvel à roda, e só
  as teclas, que o browser trata sozinho, é que a mexem. Foi assim que o site
  esteve, e nenhuma verificação dava por isso porque o
  `scripts/verificar-scroll.mjs` rolava com `window.scrollTo`. Hoje a primeira
  coisa que ele faz é dar uma volta à roda e confirmar que a página anda.

E uma regra nova em `app/globals.css`, que faz par com a que já lá estava:

```css
html.js [data-reveal], html.js [data-reveal-item] { opacity: 0; }
```

O Motion escrevia o estado inicial no HTML servido, portanto o elemento já
chegava invisível. **O GSAP só lhe toca depois de hidratar**, o que deixava um
frame — vários, numa ligação lenta — com tudo visível e no sítio final, seguido
de um salto para trás para a animação começar. As duas regras juntas cobrem os
dois mundos: sem JavaScript nada se esconde, com JavaScript quem mostra é o GSAP.

**Um contentor que não é animado não pode levar `data-reveal`.** O contentor do
`Hero` levava, e a regra de cima escondia-o para sempre — os filhos animavam
dentro de um pai a `opacity: 0`. Marca só o que o GSAP vai mesmo tocar.

### O sublinhado da `Nav` é um elemento só

Viaja entre os links; não é um por link a aparecer e a desaparecer. É a diferença
entre o menu parecer um mecanismo e parecer cinco luzes a piscar.

O Motion fazia isto com `layoutId` e media as duas posições sozinho. Em GSAP
mede-se à mão — a posição do link ativo dentro da lista, e o `x` e a largura
animam para lá. O `Flip` do GSAP fazia o mesmo com menos código, **mas é plugin
do Club**: se um dia o projeto tiver licença, é aqui que se usa. Para um risco de
2 px não se pediu.

### O que a página inicial nova custou a aprender

- **O título da capa é um `h1` só.** Esteve partido em dois elementos, e o
  Google e um leitor de ecrã recebiam duas frases soltas. Agora o `h1` é
  `sr-only` com a frase inteira e as duas metades visíveis são `aria-hidden` —
  quem vê tem a composição, quem lê tem a frase.
- **As duas metades posicionam-se em absoluto, não em linhas de grelha.** Com
  grelha, a segunda caía na faixa do meio, aterrava por cima da ilustração e
  por cima da primeira: lia-se "tetunegócio".
- **A figura da capa não fica ao centro.** Ao centro, o creme da ilustração
  cruzava o creme do título e o contraste local caía a 1.5:1. Está à esquerda,
  e o título tem um scrim próprio.
- **Um `scrim` de página inteira resolve o contraste e mata a ilustração.** O
  que se usa é um gradiente radial invertido: escuro na moldura, onde o texto
  vive, transparente no meio.
- **Nas cenas dos serviços usa-se `hidden`, não `opacity: 0`.** Uma cena a zero
  de opacidade continua tabulável e continua a ser lida, o que punha quatro
  botões "Falar sobre isto" na ordem de teclado, três deles invisíveis. E o
  `[hidden]` precisa de regra explícita quando há um `display` declarado, senão
  não faz nada.
- **Os cards do processo acumulam-se, e por isso não levam `stagger`.** Cada um
  tem a sua fatia do percurso e **fica**; um stagger fá-los-ia suceder-se.

## Acessibilidade

Isto não é opcional e já está em vigor:

- Ícones e formas decorativas levam `aria-hidden`. Se um SVG é `aria-hidden`, o
  elemento que o contém tem de ter `aria-label` (ver `Wordmark`).
- `focus-visible` está definido globalmente em `app/globals.css` e é o **único**
  indicador de foco do site — não o anules com `focus-visible:outline-none` sem
  alternativa visível. Esteve anulado no `Button` e no `ProjectCard`, o que
  apagava o foco em todos os CTAs e cards de uma vez. Se precisares mesmo de o
  substituir, põe um `ring` no lugar; nunca deixes o elemento sem nada.
- **Headings são estrutura, não estilo.** Um rótulo de 14px ("Email", "Serviços")
  é `p` ou `dt`, não `h2` — senão um leitor de ecrã anuncia "título nível 2" para
  aquilo que é a legenda de um campo. Se a região precisa de título e o desenho
  não o quer à vista, usa `sr-only`.
- **Contornos de controlos usam `border-strong`**, não `border` — ver `docs/02`.
- O link "Saltar para o conteúdo" em `app/layout.tsx` tem de continuar a ser o
  primeiro elemento focável do `<body>`.
- Contraste: `ink` para o que se lê primeiro, `muted` para o apoio. É
  hierarquia, não legibilidade — os rácios medidos estão em `docs/02`.

## O formulário de contacto

O caminho de uma mensagem:

`components/ContactForm.tsx` → `POST /api/contacto` → Resend → a caixa em
`site.email`.

Três ficheiros, cada um com um trabalho:

| Ficheiro                    | Faz                                                                 |
| --------------------------- | ------------------------------------------------------------------- |
| `lib/contacto.ts`           | as regras: campos, limites, mensagens de erro, o nome da armadilha  |
| `app/api/contacto/route.ts` | recebe, revalida, trava rajadas e envia pelo Resend                 |
| `components/ContactForm.tsx`| o formulário: valida no cliente, submete, mostra o que correu mal   |

**A validação vive em `lib/contacto.ts` e em mais lado nenhum.** O cliente valida
para dar resposta imediata, o servidor porque um POST não tem de passar pelo
formulário — mas as regras são as mesmas e importam-se do mesmo sítio. Se
puseres uma segunda cópia num dos lados, diverge.

### O remetente é um subdomínio, e isso é de propósito

O Resend envia de `site.emailFrom` — hoje `formulario@send.devplus.pt`. Não é
uma caixa que alguém leia, e não aparece em lado nenhum do site.

Está num **subdomínio** porque o `devplus.pt` já tem SPF e MX do webmail. Verificar
o domínio raiz no Resend poria dois registos SPF a competir, o que invalida os
dois e arrisca o email normal da equipa. O subdomínio isola o envio do formulário
e não toca no que faz o webmail funcionar.

O `reply-to` é sempre o email de quem escreveu: responder na caixa responde ao
visitante, não a nós próprios. É o ponto todo.

### Spam

Um campo-armadilha chamado `website`, `sr-only` no formulário. Preenchido, o
endpoint responde `200` e **não envia nada** — o bot segue caminho convencido de
que passou. Nunca o escondas com `display:none` nem `type="hidden"`: os bots que
interessa apanhar ignoram os dois.

### As defesas do endpoint, por ordem

Este é o único endpoint do site — de resto é tudo estático. As verificações estão
por ordem do mais barato para o mais caro, porque quanto mais cedo se recusa um
pedido, menos recursos ele gasta a ser recusado:

| # | Verifica                        | Recusa com | Porquê                                                     |
| - | ------------------------------- | ---------- | ---------------------------------------------------------- |
| 1 | `Origin` é a nossa              | `403`      | um POST de outro domínio nunca veio do nosso formulário     |
| 2 | corpo ≤ 32 KB                   | `413`      | ler antes de medir é como se enche a memória da função      |
| 3 | ≤ 20 pedidos / 10 min por IP    | `429`      | trava quem dispara em ciclo                                 |
| 4 | corpo é JSON, e é um objeto     | `400`      | `[1,2,3]` é JSON válido e não é um formulário               |
| 5 | armadilha vazia                 | `200` 🤫   | ver "Spam"                                                  |
| 6 | campos válidos                  | `400`      | `lib/contacto.ts`, as mesmas regras do cliente              |
| 7 | ≤ 3 **envios** / 10 min por IP  | `429`      | protege a caixa de quem já escreveu três vezes              |
| 8 | teto diário de envios           | `503`      | protege a quota do Resend                                   |

**Os limites 3 e 7 são dois de propósito.** O primeiro conta *pedidos*, o segundo
só conta o que chegou a sair. Se fossem um só, quem escrevesse o email mal três
vezes seguidas ficava impedido de enviar — um erro de distração não pode custar
o mesmo que um ataque.

**O tamanho mede-se a ler, não no `content-length`.** Esse cabeçalho pode mentir,
ou nem vir, se o pedido for `chunked`. O corpo é lido aos pedaços e o pedido morre
a meio da leitura assim que passa dos 32 KB.

**O IP vem do `x-vercel-forwarded-for` primeiro.** Na Vercel o `x-forwarded-for` é
reescrito pela plataforma e os IPs externos não passam, de propósito, para impedir
spoofing — mas pode ser sobreposto por um proxy montado por cima, e é só o
`x-vercel-forwarded-for` que sobrevive a isso. O `x-forwarded-for` fica em último,
porque é o único que um cliente consegue escrever se isto correr fora da Vercel.

### O que isto não trava

Os contadores vivem **na memória da instância**. Em serverless há N instâncias,
cada uma com a sua cópia, por isso o limite real é `N ×` o que está no ficheiro.
Isto trava o script que dispara em ciclo. **Não trava um ataque distribuído por
muitos IPs**, em que cada um se mantém dentro do seu limite e o conjunto esgota a
quota de envio na mesma.

Travar isso a sério exige ver todos os pedidos, e não só os que chegam a esta
instância — ou seja, à frente da função. O sítio é o **Vercel Firewall**, com uma
regra de rate limiting em `/api/contacto`. É configuração no dashboard, não é
código, e **está por fazer**.

### Os logs não levam dados de ninguém

O que se regista de um envio com sucesso é o `id` do Resend e mais nada. O email
de quem escreveu e o corpo da mensagem **nunca** vão para os logs: são dados
pessoais, e os logs da Vercel ficam guardados e visíveis a quem tenha acesso ao
projeto. Nas falhas regista-se a razão, não os campos.

### Configuração

`RESEND_API_KEY` no `.env.local` e nas Environment Variables da Vercel. Sem ela o
endpoint devolve `500` e regista o erro — **nunca** finge que enviou. Ver
`.env.example`.

## Ao alterar este documento

| Se mudares…                       | Faz também                                                                                                |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| criares um primitivo novo         | acrescenta-o à tabela acima                                                                               |
| a ordem ou a forma das secções    | `app/page.tsx` **e** a tabela em "A homepage conta uma história" — uma forma repetida é o defeito que ela existe para travar |
| as ilustrações da homepage        | volta a correr `python3 scripts/otimizar-ilustra.py <ficheiro>`; PNG por otimizar não entram em `public/` |
| qualquer coisa com scroll         | corre `node scripts/verificar-scroll.mjs` nas três passagens (normal, `--mobile`, `--reduzido`)          |
| a ligação do Lenis ao GSAP        | rola com a **roda do rato** antes de dar por bom — o `window.scrollTo` é nativo e passa ao lado da avaria |
| acrescentares uma secção pinada   | nada no `Cruz`: o `end: "max"` acompanha sozinho. Confirma na mesma que o verificador diz "anda até ao fim" |
| os grounds de um capítulo         | o `de` **e** o `cor` da `Curva` que lhe fica ao lado, em `app/page.tsx` — são dois, e o errado é sempre o que se esquece |
| um ground de capítulo para claro  | o `ground="claro"` da `Curva` que lhe fica ao lado — sem ele os ecos e a costura desaparecem sobre o creme |
| a sementeira de "+" da `Curva`    | confirma que nenhum atravessa a aresta: o `dy` tem de ser maior do que meia altura do símbolo mais cinco unidades |
| a forma de uma curva              | mexe nos pontos de controlo, não no `d` — ele é derivado, e os "+" saem dos mesmos números |
| um elemento que só chega a meio do scroll | marca-o `data-scroll-item`, não `data-reveal-item` — ver "Chegar não é o mesmo que aparecer" |
| a forma de uma página interior    | a tabela em "As páginas interiores também têm forma própria" — uma forma repetida é o defeito que ela existe para travar |
| os postos do `Cruz` numa página   | confirma que o gesto continua a "andar até ao fim" no `verificar-scroll.mjs`, e que a meio da página não passa de 0,6 de escala |
| acrescentares uma secção a uma página com `Cruz` | dá-lhe `relative` — sem isso o "+" é pintado por cima dela |
| qualquer coisa que se veja no telemóvel | corre o verificador em `--mobile`: ele mede ecrãs de scroll, alvos de toque, texto miúdo e o "+" por cima de texto, e nenhuma dessas quatro coisas era apanhada antes |
| os postos do `Cruz`              | são **dois** conjuntos: `POSTOS_PAGINA` e `POSTOS_MOBILE`. Em `vw`, o mesmo número é margem num ecrã de 1440 e centro num de 390 |
| o ground de um card, ou o pacote destacado | confirma o contraste do título, do texto de apoio **e** do "+" da lista: são três, e o que se esquece é sempre o terceiro |
| um hover que desloca               | mete o deslocamento atrás de `motion-safe:` — a regra global corta a duração, não o `translate`, e sem a variante ele continua a acontecer |
| recolheres um testemunho          | `lib/testimonials.ts`; a secção aparece sozinha assim que o array deixar de estar vazio                  |
| a duração ou o easing             | **`lib/motion.ts`** e a tabela de valores acima — os componentes leem de lá, não têm números próprios      |
| introduzires um componente que anima | verifica `prefers-reduced-motion` dentro dele: o GSAP não o faz por ti                                   |
| o espaçamento vertical            | `components/ui/Section.tsx`, não as páginas                                                               |
| a largura máxima                  | `components/ui/Container.tsx`, não as páginas                                                             |
| as regras do formulário           | `lib/contacto.ts` — os dois lados importam de lá; não acrescentes uma segunda cópia                       |
| o serviço de envio ou o remetente | `app/api/contacto/route.ts`, `site.emailFrom` em `lib/site.ts`, a tabela do `docs/01` e os registos DNS   |
| um dos limites do endpoint        | a tabela de "As defesas do endpoint" — o número no doc e o do `route.ts` têm de dizer o mesmo             |
| o plano do Resend                 | o `TETO_DIARIO` em `app/api/contacto/route.ts`, que existe para ficar abaixo da quota desse plano         |
