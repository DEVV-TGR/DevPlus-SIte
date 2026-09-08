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

**Nenhuma cor nova.** Os quatro estados cabem nos tokens que docs/02 já tem:
`muted` para proposta, `accent` para em curso (o doc já reserva o verde para
essa etiqueta), `primary` para entregue, `danger` para parado e para prazo
ultrapassado. `parado` a vermelho é uma escolha: um projeto parado não é neutro,
é uma coisa que alguém tem de destravar.

**As fotos do GitHub não aparecem.** `img-src 'self' data: blob:` não deixa
carregar imagens de outro domínio, e abrir a CSP a `avatars.githubusercontent.com`
era pagar caro por uma bolinha. Mostram-se iniciais. O `avatar_url` fica
guardado para o dia em que valha a pena.

**O Estúdio não usa `Section`.** É uma exceção assumida a docs/04: o `Section`
codifica o ritmo do site de marketing (`pt-16 sm:pt-24 lg:pt-32`), que numa
ferramenta de trabalho é meio ecrã de vazio antes de se ver o primeiro projeto.
O ritmo do Estúdio está definido uma vez, em `app/estudio/layout.tsx`, e as
páginas por baixo não escrevem padding nenhum. `Container`, `Button`, `Reveal` e
`cn` usam-se como em todo o lado.

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
| a organização do GitHub                | `ORGANIZACAO` em `lib/estudio/github.ts` — e o webhook na organização nova                       |
| o que a importação traz de cada repo   | `importarRepos` em `lib/estudio/acoes.ts` **e** o webhook, para os dois criarem projetos iguais  |
| o seletor de trabalhos                 | `components/estudio/SeletorDeRepos.tsx` — é usado nos dois sítios, o de criar e o da ficha      |
