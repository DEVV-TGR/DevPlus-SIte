# Plano das páginas interiores

Escrito **antes** de construir, como na ronda da homepage. A homepage está
feita e implementada; isto é o resto do site.

## A regra que manda aqui

A homepage resolveu-se com **seis capítulos, seis formas, zero repetidas**. A
regra não acaba na homepage: se as cinco páginas interiores forem todas
"cabeçalho + blocos empilhados", o site volta a ler-se como uma lista, só que
distribuída por ficheiros em vez de por secções.

Por isso cada página traz **uma forma dominante que não existe em mais lado
nenhum**, e nenhuma delas reutiliza as seis já gastas na homepage
(tipografia partida com figura no vão · cards a acumular · fila horizontal
pinada · um-a-um com navegação em círculos · grelha de pacotes · fecho
pinado).

| Página | Forma dominante | Porquê esta |
| - | --- | --- |
| `/servicos` | **Acordeão de seis colunas verticais**, que abrem uma de cada vez | Foi a decisão do Gonçalo na ronda 3: *"como tu colocaste é para a página dedicada aos serviços"*. E é a forma que deixa ver os seis ao mesmo tempo sem os catalogar |
| `/portfolio` | **Índice tipográfico com moldura fixa**: os nomes em coluna, a capa do ativo numa moldura que não se move | A homepage já mostra o trabalho a passar de lado. Aqui não se passeia, escolhe-se — e um índice é a forma de quem procura |
| `/portfolio/[slug]` | **Capa a sangrar que recua com o scroll, e depois uma ficha técnica que fica** enquanto o texto corre ao lado | Um caso de estudo é uma leitura longa. A ficha fixa é o que impede que se perca de quem é o projeto a meio do segundo parágrafo |
| `/sobre` | **Coluna central com as margens habitadas**: o texto ao meio, e as fichas a entrar alternadamente pela esquerda e pela direita | Um estúdio pequeno a falar de si não precisa de secções — precisa de uma voz e de notas à margem |
| `/contacto` | **Duas colunas assimétricas, sem scroll longo**: as formas de falar em tipografia grande, o formulário num painel claro | É a página onde se age. Uma página de ação não tem percurso: resolve-se num ecrã |

## Os spans, previstos e medidos

A homepage tem 17,8vh porque é o percurso todo. Uma página interior que peça o
mesmo é uma página que se recusa a acabar.

Só as capas, o acordeão e os fechos são **pinados**, com span próprio. Os blocos
de conteúdo — o processo, os pacotes, as dúvidas, o índice, o corpo do caso, a
voz — são `flow`, e valem a altura do que têm dentro. Por isso as páginas saíram
mais curtas do que os spans previam, o que é a direção certa do erro.

| Página | Previsto | **Medido** (1440×900) | Medido (390×844) |
| --- | --- | --- | --- |
| `/servicos` | 8,2vh | **6,5vh** | 7,3vh |
| `/portfolio` | 6,4vh | **2,9vh** | 2,8vh |
| `/portfolio/[slug]` | 6,0vh | **3,6vh** | 4,5vh |
| `/sobre` | 5,6vh | **3,1vh** | 3,7vh |
| `/contacto` | 2,2vh | **0,1vh** | 0,1vh |

O contacto a 0,1vh não é um erro de conta: a página resolve-se num ecrã e o que
sobra é o rodapé. Era esse o objetivo — *"uma página de ação não tem percurso"*.

## O "+" continua a atravessar

É a assinatura do site e não pode ser só da homepage — mas também não pode ser
o mesmo percurso, porque estas páginas são curtas. Cada uma leva **quatro
postos** em vez de sete, e todas acabam com o "+" fora do centro, onde vive a
ação. O código do gesto sai do `pagina.js` para o `paginas.js`, que o lê de
`window.CRUZ_POSTOS`.

## O que não se inventa

- **Os textos são os do site.** Os serviços vêm de `lib/services.ts`, os pacotes
  de `lib/packages.ts`, os projetos de `lib/projects.ts`, e as dúvidas, os
  passos e as crenças das páginas em `app/`. Onde o protótipo precisou de uma
  frase que não existe no site, ela **não foi escrita**: o lugar fica com o
  texto real, mesmo que mais curto do que a composição pedia.
- **Sem preços.** `docs/05`: o valor sai de proposta.
- **Sem telefones e emails à mão** — os que aparecem no protótipo são os de
  `lib/site.ts`.

## As duas ilustrações que faltam

O acordeão tem seis serviços e há ilustrações para quatro (`s1`–`s4`). O
**Branding** e o **Motion & Interação** ficam com tratamento tipográfico — o
número grande e o "+" — em vez de uma figura emprestada de outro serviço. Se
forem para diante, geram-se com o preâmbulo do `PLANO-V3.md`, que é o que
mantém as nove atuais no mesmo estilo.

## O que este protótipo não é

Não é a implementação. É HTML estático com o motor do `scrollcraft`, para se
ver a composição e o movimento antes de existir código Next — o mesmo caminho
que a homepage fez. A passagem a `app/` é outra ronda, e leva as regras do
`docs/04`: tokens de `globals.css`, valores de `lib/motion.ts`, e nada de
cores escritas à mão.

## O que se partiu pelo caminho

Três defeitos que só apareceram por se ter construído em cima do protótipo
existente. Os dois primeiros **já lá estavam, na homepage**, e ninguém tinha
dado por eles.

| O que | Onde | Porquê passou despercebido |
| --- | --- | --- |
| **Nenhum dos pins pinava.** `.cap > *:not(.cap__ground) { position: relative }` trocava o `sticky` que o engine põe no palco | `estilo.css`, e com ele os cinco acts da homepage | O scrollcraft dizia-o na consola em cada carregamento — *"act ... will not pin: its stage computes position:relative, not sticky"* — e ninguém estava a ler a consola. Sem pin, uma secção de `span 3.4` é só uma secção alta: o conteúdo passa por ela em vez de ficar |
| **O rodapé não gerava altura.** O `.foot` é `position: absolute; bottom: 0`, feito para o palco pinado do fecho | as páginas novas | Numa secção normal, um absoluto não ocupa espaço: a página de contacto ficou com exatamente 900px e zero pixéis de scroll |
| **O `data-sc-cue` num fecho deixa um ecrã vazio.** O cue abre com o progresso do act, e num fecho pinado esse progresso só chega tarde | `portfolio`, `projeto`, `sobre` | Vê-se como um buraco entre a secção anterior e o momento em que o convite se decide a aparecer. Nos fechos usa-se `data-sc-in`, que dispara à entrada |

**Regra que fica:** cue para o que acompanha um percurso, `data-sc-in` para o que
só tem de estar lá quando chega. E o que não rola — o contacto — não leva
nenhum dos dois: fica visível de origem.

## O "+" nas páginas interiores

Duas regras que a homepage não precisou de ter, porque lá o "+" vive quase sempre
sobre imagem ou sobre vazio:

1. **Grande só onde não há texto corrido.** Nos extremos da página, que é onde
   está o título ou o fecho. A meio, onde se lê, nunca passa de 0,6 de escala.
2. **Nunca 45°.** Um "+" rodado a meio caminho é um X — e um X grande e cinzento
   ao lado das capas do portfólio lê-se como um botão de fechar por cima do
   trabalho. Foi o que aconteceu na primeira volta.

## Como ver isto

```
python3 -m http.server 8899 --directory scrollcraft/builds/devplus
```

e abrir `http://localhost:8899/index.html`. As cinco páginas estão ligadas entre
si pela navegação do topo — os `href` absolutos (`/servicos`) da homepage
passaram a relativos, senão o protótipo não se navega.
