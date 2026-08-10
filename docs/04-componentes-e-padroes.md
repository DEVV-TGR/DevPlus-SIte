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
  - components/Providers.tsx
  - components/Nav.tsx
  - components/ContactForm.tsx
  - lib/contacto.ts
  - app/api/contacto/route.ts
  - components/Testimonials.tsx
  - lib/testimonials.ts
  - app/page.tsx#ordem-das-seccoes
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
| `PageHero`        | cabeçalho das páginas internas (eyebrow + h1 + intro)                      | escrever um h1 solto numa página interna                                                   |
| `Hero`            | só a página inicial                                                        | reutilizar noutro sítio                                                                    |
| `Testimonials`    | o que os clientes dizem, na homepage a seguir aos serviços                 | inventar a frase de um cliente para encher a secção — ver abaixo                           |
| `Wordmark`        | o logótipo com link para "/"                                               | ver `docs/03`                                                                              |
| `Lockup` / `Logo` | o logótipo "D+" e o "+" isolado                                            | desenhar o logótipo à mão em SVG — ver `docs/03`                                           |
| `Providers`       | Lenis + `MotionConfig`                                                     | acrescentar providers sem necessidade                                                      |

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

A ordem das secções **não é arbitrária** e não se muda por conveniência de
layout. É prova primeiro, oferta depois, confirmação no fim:

| # | Secção                 | Porque está aí                                                        |
| - | ---------------------- | ---------------------------------------------------------------------- |
| 1 | `Hero`                 | a proposta em cinco palavras                                          |
| 2 | Faixa de disciplinas   | o alcance, num relance                                                |
| 3 | Quem confia em nós     | antes de dizer o que sabemos fazer, mostra-se para quem já se fez     |
| 4 | Trabalho selecionado   | os nomes acabados de ler ganham cara — por isso vem **logo a seguir** |
| 5 | O que fazemos          | só agora a oferta, com o visitante já convencido de que há trabalho   |
| 6 | `Testimonials`         | a confirmação vem de fora, não de nós                                 |
| 7 | Contacto               | o convite, no fim do percurso                                         |

A oferta esteve em cima e o trabalho por baixo até agosto de 2026. Inverteu-se
porque quem chega ao site pela primeira vez não tem razão nenhuma para se
interessar pela lista de serviços antes de ver o que dela sai.

"Porquê a DevPlus" e "Como trabalhamos" viviam no fim desta página e mudaram de
casa na mesma altura — para `app/sobre/page.tsx` e `app/servicos/page.tsx`. O
fim da homepage passou a ser do contacto.

### Secções que se escondem

O `Testimonials` devolve `null` quando `lib/testimonials.ts` está vazio: não há
título, não há espaçamento, a secção não existe no HTML. **É o padrão a seguir
sempre que uma secção depende de dados que ainda não existem** — uma zona de
prova social vazia, ou um "em breve", anuncia que ninguém falou, o que é pior do
que o silêncio.

E o array só se preenche com frases que um cliente disse mesmo e autorizou. Um
testemunho inventado atribuído a um cliente real é uma avaliação falsa, não é
texto de rascunho — quem o lê não tem como distinguir.

## Movimento

- **Duração** 0.45–0.6s. Acima disso sente-se lento.
- **Easing** `[0.22, 1, 0.36, 1]` em tudo. Não introduzas outra curva.
- **Stagger** 0.06–0.08s entre irmãos (`delay={i * 0.06}`).
- `Reveal` dispara uma vez (`viewport={{ once: true }}`) — nada re-anima ao subir.
- **Movimento reduzido está tratado globalmente**: `MotionConfig reducedMotion="user"`
  em `Providers`, mais uma regra em `app/globals.css` que neutraliza o marquee e o
  spin. Não escrevas `prefers-reduced-motion` novo sem verificar se já está coberto.
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
- Hover em cards: `-translate-y-1` no grupo. Botões: `active:scale-[0.97]`.

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
| a ordem das secções da homepage   | `app/page.tsx` **e** a tabela em "A homepage conta uma história" — a ordem sem a razão dura uma sessão   |
| recolheres um testemunho          | `lib/testimonials.ts`; a secção aparece sozinha assim que o array deixar de estar vazio                  |
| a duração ou o easing             | `components/Reveal.tsx`, `components/Hero.tsx` e os `transition-*` dos cards — muda em todos ou em nenhum |
| o espaçamento vertical            | `components/ui/Section.tsx`, não as páginas                                                               |
| a largura máxima                  | `components/ui/Container.tsx`, não as páginas                                                             |
| as regras do formulário           | `lib/contacto.ts` — os dois lados importam de lá; não acrescentes uma segunda cópia                       |
| o serviço de envio ou o remetente | `app/api/contacto/route.ts`, `site.emailFrom` em `lib/site.ts`, a tabela do `docs/01` e os registos DNS   |
| um dos limites do endpoint        | a tabela de "As defesas do endpoint" — o número no doc e o do `route.ts` têm de dizer o mesmo             |
| o plano do Resend                 | o `TETO_DIARIO` em `app/api/contacto/route.ts`, que existe para ficar abaixo da quota desse plano         |
