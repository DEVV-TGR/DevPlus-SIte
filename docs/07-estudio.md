---
doc: estudio
fonte-de-verdade: codigo
controla:
  - app/estudio/
  - app/api/estudio/
  - lib/estudio/
  - components/estudio/
  - components/CascaDoSite.tsx
  - vercel.json
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
| `components/estudio/GraficoCircular.tsx` | os circulares, em SVG escrito à mão  |
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

`/estudio` é o resumo; a lista de projetos vive em `/estudio/projetos`; e o
dinheiro tem casa própria em **`/estudio/financas`**, com duas sub-páginas:

| Endereço                     | O quê                                              |
| ---------------------------- | -------------------------------------------------- |
| `/estudio/financas`          | redireciona para as receitas                        |
| `/estudio/financas/receitas` | o que está contratado, e tudo o que já entrou       |
| `/estudio/financas/gastos`   | o custo fixo do estúdio, e tudo o que já saiu       |
| `/estudio/gastos`            | redireciona — era aqui que os gastos viviam         |

Os gastos estiveram em `/estudio/gastos` e o endereço ficou a redirecionar, não
a dar 404: era um sítio onde se ia todos os dias, e está em marcadores.

A sub-navegação entre as duas é o `components/estudio/SubNavegacao.tsx`, que
**recebe o separador ativo por prop**. Descobri-lo com o `usePathname` obrigava
a `"use client"` numa barra de dois links que o servidor já sabe desenhar — é o
mesmo arranjo do `SeletorDePeriodo`, e as pastilhas são as do `pastilhaFiltro()`
e não umas novas.

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

**E o combinado escreve-se na secção Dinheiro da ficha do projeto**, ao lado do
que já entrou. Esteve no formulário do projeto, lá em cima, entre o progresso e
o prazo — e não é aí que se pensa nele. Pensa-se nele a olhar para o que falta
cobrar. O campo é ao mesmo tempo o que mostra e o que edita, por isso a grelha
ao lado só tem os dois números que *derivam* dele: ter o "Combinado" em número
**e** em campo era dizer duas vezes a mesma coisa no mesmo ecrã.

Consequência deliberada: **o `guardarValorCombinado` é o único sítio que escreve
`projetos.valor`.** Um projeto nasce sem preço e escreve-se logo a seguir, na
ficha. Com dois escritores, o `update` do formulário do projeto levava
`valor = lerValor("")` — ou seja `null` — e uma gravação do nome apagava o preço
combinado sem ninguém pedir.

**A página de receitas responde a duas perguntas, e são mesmo duas.** "O que
está contratado" é a tabela `receitas` — que não é dinheiro, é a promessa de que
ele vem. "Tudo o que já entrou" é `pagamentos` **mais** `recebimentos`, e é esse
o espelho exato da lista de gastos: um gasto tem data, um contrato não. Pôr as
duas na mesma lista era deixar um alojamento de 10 €/mês a contar como uma
entrada de 10 € num mês em que ninguém pagou nada.

**E não há lá um total "por mês".** A página de gastos pode ter um, porque uma
subscrição mensal sai mesmo todos os meses. Um domínio anual dividido por doze é
um número de planeamento e não de tesouraria — a mesma razão pela qual o resumo
também não tem um "a entrar por mês" médio. O que a página diz no fim é quantos
alojamentos e quantos domínios estão a correr, que é uma contagem e não uma
média.

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

### Um fragmento de SQL partilhado qualifica-se sempre

As listas de colunas que se reutilizam entre consultas — os `CAMPOS_*` de
`lib/estudio/dados.ts` — escrevem-se com o alias da tabela à frente de cada
coluna, e a consulta que as usa é obrigada a dar esse alias.

Isto custou uma página. O `CAMPOS_RECEITA` nasceu sem qualificação, porque a
primeira consulta que o usou tinha uma tabela só e não precisava. Quando o
mesmo fragmento entrou na consulta das receitas de um cliente, que faz
`join projetos`, o `id`, o `valor` e as `notas` passaram a existir nas duas
tabelas e o Postgres recusou a consulta com `column reference "id" is
ambiguous`. Recusou-a **no planeamento**: não era um erro que aparecesse quando
havia receitas, era a ficha de todos os clientes a rebentar sempre, e ninguém
deu por isso porque o teste de fumo do CI responde `307` a `/estudio/clientes`
sem nunca correr uma consulta.

Um fragmento qualificado obriga o alias no sítio onde é usado. O próximo `join`
que o reutilize mal parte na consulta nova, à vista, em vez de partir uma
página que ninguém está a olhar.

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

**E ocupam a linha toda.** Isto viveu num terço de linha, ao lado dos dois
saldos, e não dava: um objetivo é uma frase que alguém escreveu — "Dinheiro até
ao final do ano" — e num terço de linha o `truncate` comia-a a meio. O cartão
dizia menos do que estava escrito nele. Cabiam três e os restantes viravam um
"e mais N" que ninguém abria, e cinco dos seis textos eram `text-muted` a 11-14
px ao lado de números em corpo 30.

Agora aparecem todos, os títulos envolvem em vez de cortar, e a barra tem altura
e um fundo que se distingue do cartão. Em ecrã largo vão a duas colunas dentro
da linha, para a altura não crescer com a largura — uma barra de 900 px para
dizer "6 de 10" é espaço gasto sem nada em troca.

### Três cartões, e o terceiro é teu

O saldo do mês diz como está a correr agora; o de sempre diz se o estúdio ganha
dinheiro. São perguntas diferentes e por isso são dois números lado a lado.

**O terceiro é o número de tarefas por fazer de quem está a ver a página**, e é
a única coisa do Estúdio que muda consoante quem entra. Todo o resto mostra o
mesmo a toda a gente, de propósito: somos três e o trabalho é partilhado. Mas
"o que é que *eu* tenho para fazer" não se responde com um número de toda a
gente.

**Só o número, e sem cor.** A lista das tarefas está no fundo da mesma página, e
duas listas iguais no mesmo ecrã não são informação, são ruído. Sem cor
semântica porque duas tarefas por fazer não são boas nem más — pintar o zero de
verde era inventar um juízo que não é nosso.

**As tarefas sem dono aparecem à parte e não somadas.** São trabalho por
atribuir, não trabalho de ninguém, e hoje são a maioria. Somá-las ao número de
cada pessoa fazia toda a gente parecer ter o mesmo; escondê-las fazia delas
tarefas que ninguém vê.

**Esta é a primeira consulta do resumo filtrada por quem está autenticado.** Até
aqui a página chamava `requerSessao()` e deitava fora o que ele devolve.

Os dois cartões de saldo levam `justify-center` porque a grelha estica os três à
altura do mais alto.

### O resumo é do mês, e a primeira versão não era

A primeira versão desta página tinha quatro números genéricos e um gráfico de
doze meses. Estava desenhada para um ano de histórico e foi mostrada a quem
tinha três semanas de dados: três dos quatro números a zero, e duas barras em
doze lugares. **O erro não era o desenho, era a escala.**

Agora responde por ordem: *quanto sobrou este mês e o que tenho para fazer*,
*onde queremos chegar*, *a quem tenho de cobrar e o que ainda falta acontecer*,
*de onde veio e para onde foi o dinheiro*, e *o que temos em mãos*.

**E nem tudo é do mês, desde que os circulares ganharam filtro.** O `h1`
continua a dizer "Este mês" porque é o que a página assume por omissão, e porque
os saldos, o "por cobrar" e o "ainda este mês" continuam todos a sê-lo. Os dois
circulares é que passaram a dizer, no centro da roda, o período que estão a
mostrar — e foi por isso que o texto do centro deixou de estar escrito dentro do
componente.

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
4. **O texto do centro é uma prop, nunca está escrito lá dentro.** Esteve: dizia
   `este mês`, cozido no SVG. No dia em que o mesmo componente passou a desenhar
   também "desde sempre", passou a ser uma legenda a mentir — e uma legenda a
   mentir é pior do que não ter legenda nenhuma.

### Cada circular tem o seu período

São **dois filtros e não um**. "De onde veio este ano" e "para onde foi este
mês" são perguntas que se fazem ao mesmo tempo, e um filtro partilhado obrigava
a escolher uma delas. O risco — comparar dois períodos diferentes sem dar por
isso — resolve-se com o período escrito no centro de cada roda.

**O estado vive no endereço, não no browser.** São links com `searchParams`, e
não botões com estado: o Estúdio inteiro funciona sem JavaScript de cliente, e
um seletor com estado obrigava a tornar a página de cliente, arrastando consigo
as consultas todas. De borla vêm três coisas que um `useState` não dava — um
`/estudio?saidas=ano` é partilhável, o botão de voltar funciona, e recarregar
não perde a escolha.

**O valor por omissão não aparece no endereço.** `/estudio` e
`/estudio?saidas=mes` mostram a mesma coisa, e um endereço que só carrega o que
foi mesmo escolhido lê-se melhor quando se manda a alguém.

**Um período que não existe é o período por omissão, nunca um erro.** Um
`?saidas=banana` mostra o mês. Uma página de resumo não se recusa a desenhar por
causa da barra de endereço.

**E é isso que a torna segura.** O período vem de fora e escolhe um pedaço de
SQL. O `lerPeriodo()` de `tipos.ts` estreita-o à lista fechada **antes** de
chegar perto do `dados.ts`, e o `ONDE_PERIODO` é um `Record` de três predicados
escritos à mão — não uma função que aceita texto. Se um dia isto aceitar uma
`string`, é uma injeção de SQL a partir do endereço. O comentário no código diz
isto por palavras, e não "interpola o período".

**Cada link leva uma âncora** (`#de-onde`, `#para-onde`). Sem ela, cada clique
atirava a página para o topo e deixava o gráfico que se está a filtrar a meio.

### De onde veio o dinheiro, e de que projeto

O espelho do "para onde foi", e faltava: via-se sempre o que saiu e nunca o que
entrou.

**Soma as duas tabelas** — `pagamentos` e `recebimentos` — como o
`resumoDoMes()` e como o `case 'recebido'` dos objetivos. Os dois são dinheiro
que entrou, e um gráfico que ignorasse o segundo ignorava aquilo de que o
estúdio vai viver. Aqui somam-se de propósito, ao contrário do "por cobrar": lá,
misturar um recebimento com um pagamento fazia o Estúdio dizer que um cliente
devia menos dez euros do que devia — o único número da página que faz pegar no
telefone, errado. Aqui a pergunta é só "de onde veio", e a resposta é o mesmo
projeto.

**As entradas repartem-se por projeto; as saídas por descrição.** Uma despesa
interessa pelo nome ("Vercel Pro", "360imprimir — ementas"); uma entrada
interessa por *de quem veio*, e um projeto pago em três prestações são três
linhas que ninguém quer ver separadas no mesmo círculo.

**Os dois somam em SQL**, e o "para onde foi" passou a somar também. Devolvia uma
linha por gasto e deixava o componente juntá-las, o que era contra a regra da
casa — e dava um erro a sério: dois gastos com a mesma descrição no mesmo mês
viravam duas fatias iguais no mesmo círculo, com a mesma chave de React. Com o
`group by`, o total não muda e as fatias passam a ser uma por descrição.

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

**Quem sai aterra no site, não no ecrã de entrada.** O `/api/estudio/auth/sair`
manda para `/`. Devolver alguém a `/estudio/entrar` é oferecer-lhe a porta por
onde acabou de passar; quem sai do Estúdio saiu da ferramenta e o que quer ver a
seguir é o site. Continua a ser um `POST` — isso é sobre não se poder disparar
de fora, e não tem nada a ver com o destino.

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
precisam de sítio para se lerem. A regra continua a valer para as **listas de
texto longo** — os gastos, os projetos, as fichas.

O resumo é a exceção, e tem hoje três linhas de duas colunas: o "por cobrar" ao
lado do "ainda este mês", os dois circulares, e o "em cima da mesa" ao lado das
tarefas. São pares de coisas curtas que se leem melhor juntas do que empilhadas
com meia página de largura por usar. **Todas levam `items-start`**: sem isso a
grelha estica os dois cartões à altura do mais alto e o mais curto fica com meio
ecrã de vazio.

**Os clientes são cartões, e não uma lista de linhas.** Não foi por gosto: em
lista, a ficha do cliente abria-se desde sempre com um clique na linha inteira e
**ninguém percebia que aquilo se clicava**. A linha só mudava de fundo ao passar
o rato, e não se passa o rato por cima de texto à espera de descobrir que é um
botão. Um cartão com contorno próprio diz parado o que a linha só dizia ao ser
tocada. É a mesma grelha dos projetos, e as duas listas de fichas passam a
ler-se da mesma maneira.

Dentro do cartão vão os **nomes** dos trabalhos e não a contagem: a pergunta que
se faz a uma lista de clientes é "qual deles é o do restaurante?", e um "3
projetos" obriga a entrar para a responder. Com uma exceção que só se vê com os
dados à frente — aqui a maioria dos projetos chama-se exatamente como o cliente,
e "A Barraquinha Nova" com "A Barraquinha Nova" por baixo é o título do cartão
outra vez, em cinzento. Esses saltam; se não sobrar nenhum, diz-se quantos são.

**"Em cima da mesa" chamava-se "Precisa de ti"**, e mostrava seis projetos
filtrados por bloqueio ou atraso. O nome deixou de ser verdade no momento em que
passou a mostrar tudo o que está aberto — uma proposta, que este doc descreve
como "ainda não começou, não pede nada", não precisa de ninguém. Agora mostra
tudo o que não está `entregue` nem `parado`, agrupado por estado, e é o
agrupamento que diz o que urge; o `emAtraso()` continua a pintar a data de
vermelho, e é isso que continua a dizer o que precisa mesmo de ti.

**Os parados ficam de fora com os entregues.** Um projeto parado não está em
mãos, e pô-lo ao lado do que anda fazia a lista deixar de responder à pergunta
que lhe dá o nome.

**Sem corte a seis.** Cortar escondia metade do que está aberto, numa lista que
existe precisamente para se ver o todo. Quem a torna legível é o agrupamento —
e a ordem dos grupos não se decide no componente, vem do `ORDEM` de `dados.ts`,
tal como a ordem dos meses nos gastos vem do `order by`.

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

## Porque é que isto esteve lento

Houve uma altura em que o Resumo demorava mais de um segundo a aparecer, e a
sensação era de que o Estúdio tinha ficado pesado com as funcionalidades. Não
tinha: eram três erros de infraestrutura que se somavam, e nenhum deles estava
no SQL nem no desenho das páginas. Fica escrito porque a forma de os descobrir
não é óbvia, e porque qualquer um deles se reintroduz sem dar nas vistas.

**O pool tinha `max: 1`, e isso serializava os `Promise.all`.** É o erro mais
caro dos três e o mais fácil de não ver, porque o código estava certo: o Resumo
pede treze consultas de uma vez, como deve. Mas com uma única ligação no pool,
o `pg` dá-as à vez a quem espera — o `Promise.all` estava escrito como paralelo
e corria como um `for`. Medido contra a base real, as treze consultas:

|         | a frio  | ligação quente |
| ------- | ------- | -------------- |
| max: 1  | 1612 ms | 682 ms         |
| max: 10 | 454 ms  | 105 ms         |

O raciocínio que lá tinha posto o `1` — em serverless um pool grande
multiplica-se pelo número de instâncias e esgota o limite da base — trazia a
sua própria refutação na frase a seguir: quem faz o pooling a sério é o
`-pooler` da string de ligação. É o pgbouncer da Neon que protege o limite, e
protege-o melhor do que nós, porque vê todas as instâncias e nós só vemos a
nossa. **Se alguém voltar a baixar este número, mede antes.**

**A função corria do outro lado do Atlântico.** O `x-vercel-id` de qualquer
resposta do Estúdio dizia `cdg1::iad1::` — o pedido entrava em Paris e a função
corria em Washington — enquanto a base está em `eu-central-1`, Frankfurt. Cada
uma daquelas idas à base atravessava o oceano duas vezes. Não havia
`vercel.json`, e sem ele a Vercel põe as funções em `iad1` por omissão. Agora há,
e fixa `fra1` — Frankfurt, ao lado da base:

```json
{ "regions": ["fra1"] }
```

Isto vale para **todas** as funções do projeto, e é o que se quer: a única outra
é a `/api/contacto`, e quem a usa está em Portugal. As páginas públicas não
mexem — são estáticas e continuam a ser servidas do CDN em todo o lado, o que o
`○` do `npm run build` confirma.

**A sessão era consultada duas vezes por navegação.** O `app/estudio/layout.tsx`
chama `sessaoAtual()` para o nome no cabeçalho, e a página por baixo chama
`requerSessao()`, que chama `sessaoAtual()` outra vez. Mesmo cookie, mesmo
render, duas idas à base. Resolve-se com o `cache()` do React à volta da função
— o âmbito é um render, não uma sessão, por isso ninguém fica com uma sessão
velha viva depois de sair.

**O que não era o problema, e vale a pena dizer:** o `lib/estudio/dados.ts` está
limpo, uma consulta por função e nenhum N+1, e não há `motion` nenhum dentro do
Estúdio. Quando isto voltar a parecer lento, começa por medir a rede — o
`x-vercel-id`, a região da base e o tamanho do pool — antes de mexer no SQL.

**A parte que se sente e não se mede** é outra, e está em docs/04: o Lenis
deixou de suavizar o scroll aqui. O tempo até a página aparecer é o que as
tabelas acima contam; o scroll a continuar a andar depois de se largar a roda
não aparece em medição nenhuma e era metade da sensação de peso.

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
   string de ligação em `DATABASE_URL` no `.env.local`. **Usa a ligação com
   pooling** — a que tem `-pooler` no host. Não é uma preferência: em serverless
   uma ligação direta por invocação esgota o limite da base, e é o pooler que
   deixa o `max: 10` de `lib/estudio/db.ts` ser seguro. Cria-a na região mais
   perto do `regions` do `vercel.json` — hoje as duas são Frankfurt, e a secção
   "Porque é que isto esteve lento" explica o que custa separá-las.
2. **Tabelas:** `node --env-file=.env.local scripts/estudio-migrar.mjs`.
3. **OAuth App** em <https://github.com/settings/developers>, separador
   **OAuth Apps** (não **GitHub Apps**, que são outra coisa). Os endereços de
   retorno registam-se na secção **Redirect URIs**, e o GitHub aceita até dez por
   App — os dois cabem na mesma:

   ```
   https://devplus.pt/api/estudio/auth/callback
   http://localhost:3000/api/estudio/auth/callback
   ```

   Têm de bater certo letra a letra: `https` em produção, sem barra no fim, sem
   `www`. Deixa **Allow wildcard matching** desmarcado — ligá-lo mandaria os
   tokens para qualquer subdomínio e qualquer caminho a partir do endereço, e o
   que está por trás são dados de clientes.

   **Os deploys de pré-visualização da Vercel continuam a não entrar no
   Estúdio**: cada um tem um domínio gerado na hora, e esses não há como
   registar.

   Quando não entrar, os dois erros do GitHub dizem coisas diferentes: um
   **"Be careful!"** é um `redirect_uri` que não está na lista da App; uma página
   **404** é um `GITHUB_CLIENT_ID` que não corresponde a App nenhuma — uma gralha
   ou um espaço a mais no valor que está na Vercel.
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
      resolvia o rodapé no payload, e arrumava de vez as três verificações de
      `noEstudio()` que hoje andam espalhadas pela `CascaDoSite` e pelo
      `Providers`. **O Lenis já não faz parte desta lacuna**: está desligado no
      Estúdio desde o PR da latência, e a raiz própria só tornaria a decisão
      estrutural em vez de uma condição.
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
| onde se escreve o valor combinado      | só o `guardarValorCombinado` — um segundo escritor apaga a coluna com um `set valor = null`       |
| o cálculo do "ainda este mês"          | `proximaOcorrencia()` em `tipos.ts`; testa os meses de 30 e 31 dias e fevereiro                  |
| o número de fatias do circular         | `MAX_FATIAS` e `tom()` em `GraficoCircular.tsx` — os tons espalham-se pelo total, não são fixos  |
| a edição de tarefas                    | é só em `components/estudio/Tarefas.tsx` — o resumo mostra-as, não lhes mexe                     |
| as métricas dos objetivos              | `METRICAS` em `tipos.ts`, o `check` do esquema **e** o `case` de `listarObjetivos()` em `dados.ts` |
| a estrutura de uma página              | abre-a no browser e olha — a ordem das secções e a altura das caixas não se veem num diff        |
| como se guarda dinheiro                | `lib/estudio/schema.sql` (`numeric`, nunca `float`) e as somas continuam em SQL                  |
| um fragmento `CAMPOS_*` de `dados.ts`  | qualifica-o com o alias e dá esse alias à tabela — o primeiro `join` que o use sem isso rebenta  |
| para onde vai quem sai                 | `app/api/estudio/auth/sair/route.ts` — é `/`, o site, e o `303` mantém-se                        |
| o cálculo dos vencimentos              | `vencimentosAte()` em `tipos.ts`; testa fevereiro, um mês de 30 e um `desde` a dia 31           |
| o que conta como dinheiro que entrou   | `resumoDoMes()`, o `case 'recebido'` de `listarObjetivos()`, `entradasDoPeriodo()` **e** `listarEntradas()` — todos somam as duas tabelas |
| uma rota dentro de `/estudio/financas` | a `SubNavegacao`, o `revalidatePath` das ações do dinheiro **e** o teste de fumo do CI |
| onde vivem os gastos                   | o `/estudio/gastos` fica a redirecionar — está em marcadores de quem lá ia todos os dias |
| as cores do gráfico                    | corre o validador da skill `dataviz` antes — a escolha óbvia falhou o teste de daltonismo       |
| acrescentares uma rota em `/estudio`   | acrescenta-a ao teste de fumo em `.github/workflows/ci.yml`                                      |
| a organização do GitHub                | `ORGANIZACAO` em `lib/estudio/github.ts` — e o webhook na organização nova                       |
| o que a importação traz de cada repo   | `importarRepos` em `lib/estudio/acoes.ts` **e** o webhook, para os dois criarem projetos iguais  |
| o seletor de trabalhos                 | `components/estudio/SeletorDeRepos.tsx` — é usado nos dois sítios, o de criar e o da ficha      |
| os períodos dos circulares             | `PERIODOS`/`lerPeriodo()` em `tipos.ts` **e** `ONDE_PERIODO` em `dados.ts` — o valor do endereço nunca chega ao SQL |
| o texto do centro de um circular       | é a prop `nota`, nunca escrito lá dentro: os dois gráficos dizem períodos diferentes            |
| um filtro por `searchParams` numa página | acrescenta um endereço **com o filtro** ao teste de fumo em `.github/workflows/ci.yml`         |
| uma consulta filtrada pela pessoa       | guarda o retorno de `requerSessao()` — o resumo deitava-o fora até `tarefasPendentesDe()`       |
| o que aparece em "Em cima da mesa"     | o filtro está em `app/estudio/page.tsx`; a ordem dos grupos vem do `ORDEM` de `dados.ts`        |
| a lista de clientes                    | `components/estudio/CartaoCliente.tsx` — cartões, e o nome do trabalho só aparece se diferir do do cliente |
| quantos objetivos se mostram            | `components/estudio/Objetivos.tsx` — a linha é inteira e o título não se corta                  |
| o `max` do pool em `lib/estudio/db.ts`  | mede antes e mede depois — o `1` original serializava os `Promise.all`; ver "Porque é que isto esteve lento" |
| a região da base de dados              | `regions` no `vercel.json` vai atrás dela; função e base longe uma da outra pagam o dobro em cada consulta   |
| o prefixo `/estudio`                   | é só em `lib/estudio/rotas.ts`; a `CascaDoSite` e o `Providers` importam de lá, nunca escrevem a string      |
| o que a `CascaDoSite` esconde          | confirma no browser que o Estúdio não ganhou `Nav`, rodapé nem grão — e que o site público não os perdeu    |
| onde o `sessaoAtual()` é chamado        | continua envolvido em `cache()`; o layout e a página fazem a mesma pergunta no mesmo render                  |
