---
doc: estudio
fonte-de-verdade: codigo
controla:
  - app/estudio/
  - app/api/estudio/
  - lib/estudio/
  - components/estudio/
  - components/CascaDoSite.tsx
  - scripts/estudio-migrar.mjs
  - app/robots.ts#estudio
  - app/privacidade/page.tsx#registo-interno
relacionado:
  - docs/01-marca.md
  - docs/04-componentes-e-padroes.md
---

# O Estúdio

O **Estúdio** é a ferramenta interna do estúdio, em `/estudio`: onde se vai
pondo o trabalho que vamos tendo, em que estado está, quem o está a fazer e
para quando é.

**O código é a fonte de verdade.** Este doc não copia o esquema nem a lista de
campos — vai a `lib/estudio/schema.sql` e a `lib/estudio/tipos.ts`. O que está
aqui é o que o código não consegue dizer sozinho.

## Chama-se Estúdio e não painel

Porque **"Painel de Gestão" já é um serviço que vendemos** — está em
`lib/services.ts` e três projetos listam-no em `lib/projects.ts`. Se a nossa
ferramenta interna se chamasse painel, "o painel" passava a querer dizer duas
coisas diferentes na mesma conversa: o produto que se entrega ao cliente e a
casa onde nos organizamos. Uma delas tinha de mudar de nome, e a que ainda não
está vendida a ninguém é esta.

Em texto corrido escreve-se **Estúdio**, com maiúscula, quando é este sítio.
`estúdio` em minúscula continua a ser o negócio, como em `site.tagline`.

## O que lá está

| Onde                          | O quê                                          |
| ----------------------------- | ---------------------------------------------- |
| `lib/estudio/schema.sql`      | as tabelas, com o porquê de cada decisão        |
| `lib/estudio/tipos.ts`        | os tipos e os quatro estados                    |
| `lib/estudio/dados.ts`        | as leituras — é o único sítio que lê SQL        |
| `lib/estudio/acoes.ts`        | as escritas, em Server Actions                  |
| `lib/estudio/validacao.ts`    | as regras dos formulários, partilhadas          |
| `lib/estudio/sessao.ts`       | cookie, sessão e `requerSessao()`               |
| `components/estudio/GraficoMeses.tsx` | o único gráfico, em SVG escrito à mão   |
| `lib/estudio/github.ts`       | o OAuth                                         |
| `components/estudio/`         | os componentes, sobre as primitivas de `ui/`    |

## Quem entra

Entra-se com a conta do GitHub, e só entram os logins que estiverem em
`ESTUDIO_LOGINS`. **A lista vive no ambiente e não na base de dados de
propósito:** se estivesse na base, quem entrasse uma vez podia acrescentar-se a
si próprio. Assim, dar acesso ao Estúdio passa por quem tem acesso à Vercel.

Uma lista vazia não deixa entrar ninguém. A alternativa — vazio quer dizer toda
a gente — transformava uma variável esquecida num Estúdio aberto ao mundo.

**Os responsáveis de um projeto escolhem-se sempre à mão**, de uma lista de
quem já entrou. Nunca se atribui automaticamente a quem está a gravar: quem
mexe num projeto não é, na maior parte das vezes, quem o está a fazer.

## O dinheiro

`/estudio` é o resumo; a lista de projetos vive em `/estudio/projetos`.

**Não se chama "lucro" a nada, e a palavra não aparece na interface.** Receitas
menos gastos, sem ordenados e sem impostos, é **margem**. Chamar-lhe lucro dava
um número confortável e errado, e é sobre números destes que se decide contratar
alguém.

**Todos os valores são sem IVA.** O IVA nunca foi nosso: passa por nós para o
Estado, e metê-lo aqui inflacionava a margem com dinheiro que não é do estúdio.
Os campos dizem-no, para ninguém ter de adivinhar ao escrever.

**Acordado e recebido são coisas diferentes**, e é a distinção que faz esta
página valer alguma coisa. O `projetos.valor` é o que ficou combinado; a tabela
`pagamentos` é o que entrou mesmo. A diferença é o **por cobrar** — o único
número aqui que faz alguém pegar no telefone. Um painel que somasse só valores
acordados mostrava dinheiro que ainda não existe.

**Vários pagamentos por projeto**, porque é assim que se paga: um sinal, um
faseado, um resto. Quem paga a mais não fica a dever ao contrário — o `por
cobrar` nunca desce abaixo de zero, senão um pagamento a mais abatia dívidas
verdadeiras de outros projetos.

**O que o cliente paga todos os meses vive no projeto, não no cliente**, porque
é o alojamento *daquele site*: um cliente com dois sites pode pagar um e não o
outro. Na ficha do cliente vê-se a soma, só de leitura; escreve-se na ficha do
projeto. São duas coisas — **alojamento e apoio** e **domínio** — na tabela
`receitas`.

**E não se chama "mensalidade" a nada.** Há clientes que pagam ao ano. Um campo
com esse nome onde se escreve um valor anual é um campo que mente, e a soma
sairia doze vezes errada. O nome diz o que a coisa **é**; de quanto em quanto
tempo se paga é a escolha ao lado, como já era nos gastos. (O `docs/05` continua
a falar de mensalidade ao cliente — isso é copy de venda, e é outra conversa.)

**Guarda o que está contratado.** Quando um cliente deixa de pagar, põe-se a
data de fim em vez de se apagar a linha: o histórico do que já se cobrou
continua a valer.

**E cada receita gera cobranças** — ver a secção a seguir. Este doc dizia aqui
que isso não se pagava já; passou a pagar-se no dia em que a maior parte do
dinheiro que entra deixou de ser o preço de um site.

### As cobranças, e porque não são pagamentos

Uma receita diz o que está **contratado**; um `recebimento` diz que **aquele
vencimento** foi pago. A diferença entre os dois — os vencimentos que já
chegaram e não têm recebimento — são as **cobranças por fazer**, e aparecem no
"por cobrar" do resumo ao lado do que os clientes devem dos projetos. É o que
faz um alojamento pago à cabeça voltar a pedir atenção um ano depois, sozinho.

**Um recebimento não é um pagamento, e a distinção é o ponto todo.** Um
`pagamento` abate ao valor combinado do projeto; uma mensalidade não abate a um
site. Foi isto que obrigou à tabela nova: no mesmo mês entraram 125 € do site do
Império e 10 € do alojamento dele, e somá-los fazia o Estúdio dizer que ele já
só devia 115 € — o único número da página que faz pegar no telefone, errado por
dez euros.

**Os vencimentos não se guardam.** Calculam-se a partir do `desde` e da
periodicidade, no `vencimentosAte()` de `tipos.ts`. Uma tabela de vencimentos
por gerar era uma coisa para manter atualizada todos os meses, e o mês em que
ninguém a corresse era o mês em que o Estúdio deixava de avisar. É o outro lado
do `proximaOcorrencia()`: aquele responde "o que ainda vem este mês", este "o
que já se venceu e devia estar pago", e nenhum serve para o trabalho do outro.

**Os dois lados contam no saldo**, porque os dois são dinheiro que entrou. O
`resumoDoMes()` soma as duas tabelas, e a métrica `recebido` dos objetivos
também — um objetivo de dinheiro que ignorasse as mensalidades ignorava aquilo
de que o estúdio vai viver.

**O botão de dar baixa está no resumo, e não só na ficha.** No resumo entra pelo
valor da receita e com a data de hoje, que é o caso normal: vi que entrou,
dou-lhe baixa. Corrigir o valor, corrigir a data ou desfazer é na ficha do
projeto, onde se vê o histórico todo. Obrigar a abrir uma ficha para carregar
num sítio era garantir que ficavam por marcar.

**Uma receita a zero não gera cobranças.** Um cliente em cortesia continua a ser
uma linha de receita — o valor é que é zero — e não há ali nada para cobrar.

**As cobranças aparecem antes dos projetos na lista do "por cobrar".** Um site
por pagar está à espera há semanas e não muda hoje; uma mensalidade que venceu
ontem é a única coisa daquela página que se resolve com uma mensagem.

**Um gasto sem projeto é do estúdio** e não entra na margem de projeto nenhum.
A Vercel e o Figma existiriam na mesma sem qualquer um dos trabalhos; imputá-los
a um deles fazia-o parecer pior do que é.

**Um gasto tem periodicidade, não um sim/não.** `unica`, `semanal`, `mensal` ou
`anual`. Um booleano "recorrente" não chegava: um domínio paga-se uma vez por
ano e o alojamento todos os meses, e somá-los como se fossem a mesma coisa dava
um custo fixo errado por doze vezes. O `POR_MES` em `lib/estudio/tipos.ts` põe-os
na mesma escala — e a semanal conta `52 / 12`, não `4`, porque um ano tem 52
semanas e arredondar para quatro escondia quase um mês de despesa por ano.

**O custo fixo do estúdio conta só o que se repete e não é de um projeto.** Um
domínio que pagamos por um cliente repete-se todos os anos, mas não é despesa
nossa: sai e volta a entrar pela receita `dominio` do projeto, ao cêntimo e
normalmente no mesmo dia. Contá-lo fazia o estúdio parecer mais caro do que é —
o mesmo erro que a regra de cima evita, só ao contrário. Esses aparecem na
página, listados à parte e com o seu subtotal, porque não os mostrar era pior:
saem da conta bancária na mesma, e quem olha tem de os ver algures.

**O cartão do custo fixo diz de onde vem o número.** Um total sozinho não se
consegue verificar nem contestar, e um número que ninguém consegue contestar
deixa de ser olhado. Cada despesa aparece com a periodicidade, o valor a que é
paga **e** o equivalente por mês — os dois, porque um domínio de 39,50 € por ano
não é uma despesa de 3,29 €: são 39,50 € que caem todos de uma vez num mês.

**A lista de gastos agrupa-se por mês.** A ordem vem do `order by g.data desc`
da consulta e não se decide no componente. O agrupamento é só para a ordem se
**ver**: numa linha, o valor é o que salta primeiro e a data é a coisa mais
pequena e mais apagada, o que fazia a lista parecer baralhada quando nunca
esteve. Quem parte a lista é o `agruparPorMes()` de `tipos.ts`, que preserva a
ordem que recebe de propósito — se um dia a consulta vier baralhada, quer-se que
isso apareça, não que seja escondido a caminho do ecrã.

### As somas fazem-se todas em SQL

O `pg` devolve `numeric` como texto, e o `number` do JavaScript não é exato.
Somar cinquenta valores em vírgula flutuante acumula cêntimos que ninguém
consegue explicar três meses depois. Em `lib/estudio/dados.ts` o `Number()`
aparece só a converter um total que já vem somado pelo Postgres.

### A escrever, aceitam-se vírgulas

`1.500,50` é como se escreve cá, e `Number("1.500,50")` é `NaN`. Quem trata
disso é o `lerValor()` de `lib/estudio/validacao.ts`, partilhado pelo formulário
e pela ação. As regras são deliberadamente previsíveis em vez de espertas: com
vírgula, a vírgula é o decimal; só com ponto, é decimal se tiver um ou dois
dígitos a seguir e milhares nos outros casos.

### As tarefas: a caixa marca, o texto edita

São dois alvos de clique diferentes, e é de propósito. Antes o texto todo
marcava como feita, e não havia onde carregar para corrigir uma tarefa mal
escrita a não ser apagá-la e escrevê-la outra vez. Agora a caixa marca, e clicar
no texto abre a edição — texto, quem fica com ela, e o apagar lá dentro.

**O apagar mudou-se para dentro da edição.** Um botão de apagar ao lado de cada
tarefa é um clique errado à espera de acontecer.

**Editar existe só na ficha do projeto.** No resumo as tarefas são de leitura —
aquilo é a vista do que está por fazer em todo o lado, e um campo de edição por
linha transformava-a num formulário gigante que ninguém pediu. O dono vê-se nos
dois sítios; muda-se num só.

`on delete set null` no dono: se alguém sair do estúdio, a tarefa fica. O
trabalho não desaparece com a pessoa.

### Objetivos: escreve-se o alvo, conta-se o resto

"10 clientes até ao fim do ano." O alvo escreve-se; **o que já está feito é
contado pela base**, num `case` sobre a métrica em `listarObjetivos()`. Um
objetivo cujo progresso fosse escrito à mão era mais um número para manter
atualizado, e o primeiro a ficar desatualizado — daí a métrica ser uma lista
fechada com só o que o Estúdio sabe contar sozinho.

**Um cliente só conta quando já lhe entregámos alguma coisa.** A primeira versão
contava as linhas da tabela `clientes`, e estava errada: lá dentro estão também
os potenciais e quem só tem uma proposta por responder. Um objetivo de "10
clientes" assim cumpre-se a mandar emails. Hoje conta quem tem pelo menos um
projeto em `entregue` — com os dados reais, isso é 2 e não 6, e a diferença é o
ponto todo.

**Os projetos vossos contam nas métricas de projetos**, e isso foi decidido: um
objetivo de "20 projetos" inclui o site da DevPlus e as demonstrações. Se um dia
não fizer sentido, o sítio de mudar é o mesmo `case`.

**O nome de cada métrica diz o que ela conta**, e não a tabela de onde vem. Foi
chamar-lhe "Clientes" que escondeu o erro — o formulário mostra agora uma linha
por métrica a explicar o que entra na conta, antes de alguém guardar um objetivo
que conta outra coisa.

**O `desde` é o que separa duas coisas que se dizem igual:** *ter* 10 clientes
conta os que já cá estão; *ganhar* 10 clientes este ano põe `desde` em janeiro e
conta os criados a partir daí. O formulário explica-o por baixo dos campos,
porque ninguém adivinha isso de uma etiqueta que diz "a contar de".

**Passado o alvo, a barra enche e o texto diz a verdade** — `12 de 10`, não
`10 de 10`. Cumprir de mais não é um erro a esconder.

### Dois saldos, não um

O do mês diz como está a correr agora; o de sempre diz se o estúdio ganha
dinheiro. São perguntas diferentes e por isso são dois números lado a lado.

Os dois cartões de saldo levam `justify-center`: a grelha estica os três à
altura do mais alto, e com três objetivos na coluna da direita os números
ficavam encostados ao topo com um palmo de vazio por baixo.

### O resumo é do mês, e a primeira versão não era

A primeira versão desta página tinha quatro números genéricos e um gráfico de
doze meses. Estava desenhada para um ano de histórico e foi mostrada a quem
tinha três semanas de dados: três dos quatro números a zero, e duas barras em
doze lugares. **O erro não era o desenho, era a escala.**

Agora responde por ordem: *quanto sobrou este mês*, *a quem tenho de cobrar*,
*para onde foi o dinheiro*, e *o que ainda falta acontecer antes de o mês
fechar*.

**Chama-se "saldo" e não "lucro".** Não leva ordenados nem impostos. A palavra
errada faria um número confortável passar por outro, e é sobre números destes
que se decide contratar alguém.

**Não há um "a entrar por mês" médio.** Um alojamento anual dividido por doze é
um número de planeamento, não de tesouraria, e numa página que é toda sobre este
mês seria o único valor a falar de outra coisa.

**O "ainda este mês"** junta os dois lados na mesma lista, por data: as despesas
que se repetem e os alojamentos e domínios a receber. Quem converte uma
periodicidade numa data é o `proximaOcorrencia()` de `lib/estudio/tipos.ts`, em
JavaScript e não em SQL — a conta envolve meses de 28 a 31 dias e dias da
semana, e em SQL ficava ilegível para poupar uma passagem por dez linhas. Um
pagamento de dia 31 num mês de 30 cai no último dia, não desaparece.

### O circular, e três regras que mudaram o que lá está

1. **Nunca um circular de duas fatias.** Com menos de duas despesas mostra-se o
   número, porque o número é o gráfico.
2. **Seis fatias no máximo** — as cinco maiores e um "outros". Passadas as seis,
   as pequenas ficam indistinguíveis e o círculo passa a decoração.
3. **Uma cor só, em tons.** A DevPlus tem duas cores de marca; seis matizes
   distinguíveis (e que sobrevivessem a daltonismo) não saíam dali. Um
   `part-to-whole` ordenado por tamanho pede um degradê de uma cor. Os tons
   espalham-se pelo intervalo todo consoante o número de fatias — com uma tabela
   fixa, duas fatias saíam quase iguais.

### O gráfico de barras, e uma cor que se mudou por causa do validador

Houve um gráfico de barras de doze meses, e **saiu** — está no histórico do git
para quando houver um ano de história para contar. Fica aqui a lição, que é o
que dele vale a pena guardar.

A escolha óbvia para as duas séries era o verde do `accent` e o cinzento claro
do `muted`. **O validador de paletas recusou-a:** as duas ficavam a ΔE 4.8 para
quem tem daltonismo deutan, ou seja, indistinguíveis para cerca de uma em cada
doze pessoas — e somos três homens a usar isto. Trocar o cinzento claro pelo
escuro do `border-strong` leva a separação a 25.3. Não se decidiu a olho; correu-se
o validador.

Ficam dois avisos por resolver nesse validador, e é deliberado: a "banda de
luminosidade" e o "piso de croma" são parâmetros da paleta de referência dele, e
chocam com os tokens do docs/02 — que não se inventam. Os testes que protegem
quem lê (separação para daltonismo, visão normal, contraste) passam todos.

A identidade nunca depende só da cor: há legenda, o valor de cada barra aparece
ao passar o rato, e há uma tabela com os números por baixo.

## Decisões que não estão no código

**Não há `proxy.ts`.** Cada página e cada ação chamam `requerSessao()` por si.
Um proxy a proteger `/estudio` corria em **todos** os pedidos do site e obrigava
as páginas públicas a render dinâmico — é exatamente o custo que o comentário da
CSP em `next.config.ts` recusa pagar. Uma linha por página é mais barato.

**Sem cookie, ninguém toca na base.** `requerSessao()` despacha quem não traz
cookie antes de haver consulta nenhuma, e `lib/estudio/db.ts` só liga quando
alguém corre mesmo uma consulta. Isto não é higiene: o CI corre sem segredos e
faz `npm run build` mais um teste de fumo. Se o Estúdio precisasse da
`DATABASE_URL` para compilar, o site inteiro deixava de compilar no GitHub por
causa de uma página que nem é pública. É por isso que o CI verifica
`/estudio → 307` e `/estudio/entrar → 200`: **se um dia derem 500, alguém pôs
uma consulta antes da verificação do cookie.**

**A CSP não mudou.** O comentário em `next.config.ts` justificava-se com "não há
base de dados, não há utilizadores, não há input" — e agora há os três. A conta
continua a bater certo porque nada disso chega ao browser: as leituras e as
escritas correm no servidor, o OAuth é servidor contra servidor, e o que se
renderiza foi escrito por uma das pessoas que entram cá. O dia de refazer a
conta é aquele em que texto de alguém de fora do estúdio chegar a uma destas
páginas.

**Nenhuma cor nova**, com seis estados. Os tokens de docs/02 chegam porque o que
os separa não é só a cor:

| Estado | Sinal | Porquê |
| --- | --- | --- |
| Proposta | `muted`, contorno | ainda não começou; não pede nada |
| Em curso | `accent` | docs/02 já reserva o verde para esta etiqueta |
| À espera do cliente | laranja de **contorno** | bloqueado; a bola está com ele |
| Falta ir lá | laranja **cheio** | bloqueado; a bola está connosco |
| Entregue | `muted`, contorno | acabou; deixou de pedir atenção |
| Parado | `danger` | não é neutro: alguém tem de o destravar |

**Os dois bloqueios partilham o laranja de propósito.** O que os distingue é o
preenchimento, e isso quer dizer uma coisa concreta: na etiqueta cheia, a bola
está contigo. Esperar por um cliente é a bola dele; ter de lá ir é a nossa, e é a
única que se resolve se alguém se mexer — daí ser a mais forte do painel.

O laranja saiu do `entregue` quando o `a-espera` nasceu. É caro de mais para se
gastar no que já não pede nada.

**Os dois contam como atrasados.** Um prazo que passou enquanto se esperava por
um cliente — ou enquanto faltava lá ir — continua a ser um prazo que passou. É
precisamente aí que se liga a perguntar, ou que se mete o carro a andar. Ver
`emAtraso()` em `lib/estudio/tipos.ts`.

**E aparecem logo a seguir ao que está a andar**, na ordem da lista (`ORDEM` em
`lib/estudio/dados.ts`), com o `visita` à frente do `a-espera` — o que depende de
nós lê-se primeiro. É a diferença entre "está parado" e "está parado à espera de
alguém a quem se pode ligar hoje"; enterrá-los era garantir que ninguém lhes
pegava.

**As fotos do GitHub não aparecem.** `img-src 'self' data: blob:` não deixa
carregar imagens de outro domínio, e abrir a CSP a `avatars.githubusercontent.com`
era pagar caro por uma bolinha. Mostram-se iniciais. O `avatar_url` fica
guardado para o dia em que valha a pena.

**Uma coluna, e secções com ar.** As páginas do Estúdio empilham-se de cima a
baixo — nada de duas colunas com caixas espremidas ao lado. O ecrã tem altura de
sobra; a largura é que é cara, e um nome de projeto ou a descrição de um gasto
precisam de sítio para se lerem. Onde há mesmo duas colunas (o "precisa de ti" e
as "tarefas" do resumo), leva `items-start`: sem isso a grelha estica os dois
cartões à altura do mais alto e o mais curto fica com meio ecrã de vazio.

**O que apaga fica sempre no fim.** Depois de tudo o resto, atrás de um
`details` e de um separador. Um botão de apagar a meio da página, ao lado do de
guardar, é um acidente à espera de acontecer.

**O Estúdio não usa `Section`.** É uma exceção assumida a docs/04: o `Section`
codifica o ritmo do site de marketing (`pt-16 sm:pt-24 lg:pt-32`), que numa
ferramenta de trabalho é meio ecrã de vazio antes de se ver o primeiro projeto.
O ritmo do Estúdio está definido uma vez, em `app/estudio/layout.tsx`, e as
páginas por baixo não escrevem padding nenhum. `Container`, `Button`, `Reveal` e
`cn` usam-se como em todo o lado.

**As alterações ao esquema vivem na secção "Ajustes"** do fim de
`lib/estudio/schema.sql`, escritas para poderem correr sobre uma base nova ou
sobre uma que já existe. Não há sistema de migrações numerado, e a decisão está
escrita no topo desse ficheiro: ganha-se um quando houver várias bases em
estados diferentes, ou quando um ajuste precisar de mexer em **dados** e não só
na forma. Aí a ordem passa a contar.

**Datas civis, não instantes.** `inicio` e `prazo` são `date` e viajam como
`YYYY-MM-DD`. Um prazo é um dia, não um momento: passá-lo por `timestamptz`
fazia-o aparecer um dia mais cedo nos meses de verão. Por isso é que
`hojeEmLisboa()` existe e `formatarData()` formata em UTC.

**O rodapé viaja no payload das páginas do Estúdio.** O `Footer` chega à
`CascaDoSite` como prop para continuar a ser componente de servidor, e o React
serializa-o mesmo quando não o renderiza. São uns quilobytes de conteúdo público
numa ferramenta interna — custo conhecido, e o preço de não tocar em ficheiros
que os PR #54 e #65 estão a reescrever.

## Trazer do GitHub

Duas coisas diferentes, e vale a pena não as confundir:

**Os repositórios que já existem** — `/estudio/importar`. Lista os repositórios
da organização, marca os que já cá estão e tu escolhes quais viram projeto. Vem
o nome, o link e a descrição; o estado escolhe-se para todos de uma vez e
corrige-se depois um a um. Repetir a importação não duplica nada: o que já tem
`repo_url` conhecido é saltado.

**Os que forem criados de agora em diante** — o webhook em
`app/api/estudio/github/webhook`. Repositório criado na organização, projeto
criado aqui, em `proposta`.

**Os de um cliente** — o `SeletorDeRepos`, no formulário de cliente novo e na
ficha de um cliente que já exista. Mistura numa lista só os projetos sem dono e
os repositórios ainda por importar, porque para quem está a marcar caixas são a
mesma coisa: "os trabalhos deste cliente". Marcar um repositório que ainda não
está cá cria o projeto e liga-o, de uma vez.

Isto existe porque o GitHub não sabe de quem é o repositório. Sem ele, a ordem
era sempre importar primeiro e atribuir depois, em dois ecrãs — e essa ordem era
a única coisa que obrigava a passar duas vezes pelo mesmo trabalho. O caso comum
(o repositório já existir quando se cria o cliente) resolve-se no formulário de
criação; a ficha do cliente é para o caso invulgar, o repositório nascer depois.

Na ficha, **o que se vê é o que fica**: o que estiver marcado fica ligado, o que
for desmarcado é desligado. Desligar nunca apaga o projeto — deixa-o sem
cliente, como o `on delete set null` do esquema já fazia.

Três decisões que valem a leitura:

- **A importação não usa token nenhum.** Os repositórios do `DEVV-TGR` são
  públicos, e a API pública devolve-os a quem perguntar. Não foi preciso alargar
  o `scope` da OAuth App (continua em `read:user`), nem guardar o token de quem
  entra, nem criar um PAT. O `GITHUB_TOKEN` existe, é opcional, e serve para ver
  repositórios privados ou subir o limite de 60 pedidos por hora.
- **O formulário manda só os nomes escolhidos; os dados vêm outra vez do
  GitHub.** Não é desconfiança de quem carrega no botão — é que assim o nome e o
  link não podem chegar torcidos por um formulário remendado.
- **O webhook é a única rota do Estúdio sem sessão.** Quem a chama é o GitHub,
  que não tem cookie. A prova é a assinatura `sha256` do corpo, comparada em
  tempo constante, e é a primeira coisa que a rota faz. Responde 200 ao que for
  legítimo mas não interessar (um `ping`, um evento que não é `created`): o
  GitHub desativa webhooks que respondem com erro, e um evento que não nos diz
  respeito não é um erro. O `insert` traz `where not exists` para o evento poder
  ser reenviado sem criar o projeto duas vezes.

## Pôr isto a andar

1. **Base de dados.** Cria um Postgres (na Vercel, o mesmo projeto) e põe a
   string de ligação em `DATABASE_URL` no `.env.local`. Usa a ligação com
   pooling se a tiveres — em serverless, uma ligação direta por invocação esgota
   o limite da base.
2. **Tabelas:** `node --env-file=.env.local scripts/estudio-migrar.mjs`.
3. **OAuth App** em <https://github.com/settings/developers>. O callback tem de
   bater certo letra a letra: `https://devplus.pt/api/estudio/auth/callback`.
   Para trabalhar em local faz uma segunda App com
   `http://localhost:3000/api/estudio/auth/callback` — o GitHub só aceita um
   callback por App, e por isso **os deploys de pré-visualização da Vercel não
   conseguem entrar no Estúdio**.
4. **`ESTUDIO_LOGINS`** com os logins do GitHub de quem entra, separados por
   vírgulas.
5. **Webhook** (só depois de estar em produção): gera um segredo com
   `openssl rand -hex 32`, põe-no em `GITHUB_WEBHOOK_SECRET`, e cria o webhook
   em `DEVV-TGR -> Settings -> Webhooks` com a Payload URL
   `https://devplus.pt/api/estudio/github/webhook`, content type
   `application/json` e só o evento **Repositories**.
6. As mesmas variáveis nas Environment Variables do projeto na Vercel.

## Lacunas por preencher

Trabalho conhecido em falta. Apaga a linha quando estiver feita.

- [ ] **Ligar o webhook na organização.** O código está feito; falta o passo
      manual em `DEVV-TGR -> Settings -> Webhooks` e pôr o
      `GITHUB_WEBHOOK_SECRET` na Vercel. Só se consegue testar a sério depois de
      estar em produção — o GitHub não chama `localhost`.
- [ ] **Raiz própria.** Quando os PR #54 e #65 fundirem, ver se o Estúdio não
      fica melhor com `app/(site)` e `app/(estudio)` em vez da `CascaDoSite` —
      resolvia o rodapé no payload e o Lenis, que hoje continua a suavizar o
      scroll também aqui.
- [ ] **Confirmar quem aloja a base** antes de fundir. `app/privacidade/page.tsx`
      diz que é a Vercel. Se a base acabar noutro sítio, essa frase muda e a data
      de "Última atualização" sobe outra vez.

## Ao alterar este documento

| Se mudares…                            | Faz também                                                                                     |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- |
| o esquema                              | `lib/estudio/schema.sql` **e** os tipos em `lib/estudio/tipos.ts`; corre a migração             |
| os estados                             | `ESTADOS` e `ROTULO_ESTADO` em `tipos.ts`, o `check` do esquema e `COR_ESTADO`/`COR_BARRA`      |
| quem pode entrar                       | `ESTUDIO_LOGINS` na Vercel e no `.env.local` — nunca a base de dados                            |
| as regras dos formulários              | só `lib/estudio/validacao.ts`; o formulário e a ação importam-na, nunca copiam                  |
| uma rota nova em `/estudio`            | acrescenta-a ao teste de fumo em `.github/workflows/ci.yml`                                     |
| o que a base guarda sobre pessoas      | `app/privacidade/page.tsx` e sobe a "Última atualização" **no mesmo PR**                        |
| quem aloja a base                      | nomeia-o em `app/privacidade/page.tsx`, na secção "Partilha com terceiros"                      |
| a decisão de não haver `proxy.ts`      | relê o comentário da CSP em `next.config.ts` antes — a conta muda                                |
| a `CascaDoSite`                        | confirma que a homepage continua estática (`○`) no output do `npm run build`                    |
| a periodicidade dos gastos             | `PERIODICIDADES` e `POR_MES` em `tipos.ts`, o `check` do esquema, e o seletor do formulário      |
| o que conta como custo fixo do estúdio | `app/estudio/gastos/page.tsx` — e confirma que o que sai da conta continua visível algures       |
| a ordem dos gastos                     | é no `order by` de `listarGastos()`, nunca no componente; o `agruparPorMes()` só parte a lista   |
| o que um cliente paga por mês          | é na ficha do **projeto** — a do cliente só mostra a soma                                        |
| o cálculo do "ainda este mês"          | `proximaOcorrencia()` em `tipos.ts`; testa os meses de 30 e 31 dias e fevereiro                  |
| o número de fatias do circular         | `MAX_FATIAS` e `tom()` em `GraficoCircular.tsx` — os tons espalham-se pelo total, não são fixos  |
| a edição de tarefas                    | é só em `components/estudio/Tarefas.tsx` — o resumo mostra-as, não lhes mexe                     |
| as métricas dos objetivos              | `METRICAS` em `tipos.ts`, o `check` do esquema **e** o `case` de `listarObjetivos()` em `dados.ts` |
| a estrutura de uma página              | abre-a no browser e olha — a ordem das secções e a altura das caixas não se veem num diff        |
| como se guarda dinheiro                | `lib/estudio/schema.sql` (`numeric`, nunca `float`) e as somas continuam em SQL                  |
| o cálculo dos vencimentos              | `vencimentosAte()` em `tipos.ts`; testa fevereiro, um mês de 30 e um `desde` a dia 31           |
| o que conta como dinheiro que entrou   | `resumoDoMes()` **e** o `case 'recebido'` de `listarObjetivos()` — os dois somam as duas tabelas |
| as cores do gráfico                    | corre o validador da skill `dataviz` antes — a escolha óbvia falhou o teste de daltonismo       |
| acrescentares uma rota em `/estudio`   | acrescenta-a ao teste de fumo em `.github/workflows/ci.yml`                                      |
| a organização do GitHub                | `ORGANIZACAO` em `lib/estudio/github.ts` — e o webhook na organização nova                       |
| o que a importação traz de cada repo   | `importarRepos` em `lib/estudio/acoes.ts` **e** o webhook, para os dois criarem projetos iguais  |
| o seletor de trabalhos                 | `components/estudio/SeletorDeRepos.tsx` — é usado nos dois sítios, o de criar e o da ficha      |
