---
doc: marca
fonte-de-verdade: doc
controla:
  - lib/site.ts
  - lib/seo.ts
  - app/layout.tsx
  - components/JsonLd.tsx
  - app/sitemap.ts
  - app/robots.ts
  - app/opengraph-image.tsx#texto
  - app/privacidade/page.tsx
  - components/Footer.tsx
  - app/contacto/page.tsx
relacionado:
  - docs/03-simbolo-e-logotipo.md
---

# A marca

## O nome

**DevPlus** — uma palavra, D e P maiúsculos. É assim que se escreve em **todo o
texto corrido**: páginas, metadata, emails, propostas.

**`Dev+` é exclusivamente o logótipo.** Nunca aparece em texto corrido.

Errado, sempre: ~~Dev Plus~~, ~~devplus~~, ~~DEV+~~, ~~Devplus~~, ~~D+~~.

O "+" não é decoração: significa o que acrescentamos a cada projeto. É de onde vem
a linha do rodapé ("Vamos somar ao teu próximo projeto") e o destaque do h1
("Web design que **soma** ao teu negócio"). Copy nova pode jogar com _somar_,
_acrescentar_, _mais_ — mas sem forçar. Uma piada de "+" por página é o limite.

## Os dados

Tudo vive em **`lib/site.ts`**. Não escrevas nenhum destes valores à mão noutro
ficheiro; importa-os. Se precisas de um dado novo, acrescenta-o lá.

| Campo             | Valor                                       |
| ----------------- | ------------------------------------------- |
| `name`            | DevPlus                                     |
| `domain` / `url`  | devplus.pt / https://devplus.pt             |
| `email`           | support@devplus.pt                          |
| `emailFrom`       | Site DevPlus <formulario@send.devplus.pt>   |
| `tagline`         | Estúdio de Web Design & Desenvolvimento     |
| `city`            | Porto                                       |
| `locale` / `lang` | pt_PT / pt-PT                               |

O `email` é a caixa que lemos — é ele que aparece no rodapé, em `/contacto`, em
`/privacidade` e nos dados estruturados.

O `emailFrom` **nunca aparece no site**: é só o remetente com que o Resend envia
as submissões do formulário para a nossa caixa. Vive num subdomínio de propósito
— ver `docs/04`, "O formulário de contacto".

### Não há morada, e isso escreve-se

O estúdio está a começar e não tem sede. **Não inventes uma**, nem NIF, nem
código postal: a morada de um negócio tem de bater certo, carácter a carácter,
entre o site, o Perfil de Empresa do Google e as redes — e uma morada inventada
é pior do que morada nenhuma, porque dá aparência de solidez sem a substância.

O que é verdade é a cidade. `site.city` é o único sinal geográfico que o site dá,
e é o que os dados estruturados dizem (`areaServed`). Quando houver sede, entra
aqui, em `lib/site.ts`, em `app/privacidade/page.tsx` e no `address` do JSON-LD,
no mesmo PR.

### A geografia fica fora do texto visível

**Decidido em agosto de 2026: a DevPlus trabalha para todo o país, e o site
escreve-se assim.** O `<title>`, a `description` e o `<h1>` da homepage **não
levam a localidade**, e isso é uma decisão, não uma lacuna.

A alternativa era apostar no local — pôr "Porto" no título e na descrição para
apanhar quem procura *"web design porto"*, e abrir um Perfil de Empresa do
Google. Não se escolheu, por duas razões: o trabalho faz-se à distância e não
ganha nada em limitar-se a uma cidade, e o Perfil de Empresa exige **morada
verificável** — que a secção acima explica porque é que não existe.

**As duas não se juntam.** Um título que tenta apanhar a cidade e o país não
apanha nenhum dos dois. Se um dia se quiser inverter, inverte-se por inteiro: a
localidade entra no título, na descrição e numa menção natural no corpo, e o
`areaServed` alinha-se com o que o texto passar a dizer — nunca metade.

O `areaServed` do `components/JsonLd.tsx` fica como está, e não contradiz isto:
diz `City: Porto` **e** `Country: Portugal`. A cidade é onde estamos, o país é
até onde vamos. É uma afirmação de facto, não uma aposta em pesquisa local.

Consequência prática: **o esforço de SEO vai para os termos do serviço, não para
a geografia.** Se estiveres a pensar acrescentar uma cidade a um título para
"aparecer mais", é isto que estás a desfazer.

## Os telefones

`team` em `lib/site.ts`: três pessoas, três telemóveis, cada um com o nome de
quem atende. Um estúdio de três pessoas que publica um número anónimo está a
esconder a única vantagem que tem sobre uma agência.

- O `phone` escreve-se **como se lê**, com espaços (`916 416 063`). É essa a
  grafia que aparece no site.
- O `href` do `tel:` **deriva** por `telHref()` — `+351916416063`. Nunca
  escrevas o número em duas grafias: divergem à primeira correção.
- Aparecem em `/contacto` e no `contactPoint` dos dados estruturados. Se
  entrarem no rodapé algum dia, saem do mesmo sítio.

## Redes sociais

Vivem em `socials` (`lib/site.ts`). O `href` é o interruptor:

- `href` ausente → renderiza como texto esbatido, sem `<a>`;
- `href` preenchido → passa a link automaticamente, sem tocar em JSX.

| Rede      | Estado                                          |
| --------- | ----------------------------------------------- |
| Instagram | existe desde agosto de 2026 — `@devplus.pt`     |
| Facebook  | existe desde agosto de 2026                     |
| WhatsApp  | por criar, continua sem `href`                  |

O LinkedIn foi retirado.

O `href` do Facebook é um `profile.php?id=…`, porque a página não tem username.
**Quando tiver**, troca-o pelo curto — sobrevive a mudanças de id e é melhor
sinal do que uma URL com query string.

Estes `href` não servem só o rodapé: alimentam o **`sameAs`** dos dados
estruturados, que é o que diz ao Google que estas contas e o site são a mesma
entidade. Um `href` errado é pior do que `href` nenhum — abre-o no browser antes
de o escrever.

**Quando o WhatsApp existir:** acrescenta o `href` e reescreve o parágrafo em
`app/contacto/page.tsx`, que hoje diz que só ele falta.

## Tom de voz

O registo é **caloroso e próximo**: escreve-se como quem fala com um cliente à
mesa, não como quem manda uma proposta. Personalidade sim, graçola forçada não.

- **Português de Portugal**, tratamento por **"tu"**. Nunca "você", nunca PT-BR.
- Direto e concreto. "Mudas o preço num sítio e muda em todo o lado" vale mais do
  que "solução integrada de gestão de conteúdos".
- Sem superlativos de agência: nada de "soluções inovadoras", "excelência",
  "parceiro estratégico", "à medida das suas necessidades".
- Frases curtas. Se uma frase tem duas vírgulas e um travessão, parte-a.
- Acentuação sempre correta — nunca "nao", "servicos", "ecra".

### Para quem escrevemos

O cliente-alvo é **um negócio local** — um restaurante, um stand, uma empresa de
serviços. Não é uma agência nem um developer. O jargão técnico ("design system",
"protótipo navegável", "arquitetura de informação", "headless CMS") só aparece
nas etiquetas dos `items` em `lib/services.ts` e nas `services` de um projeto.
**Nunca em texto corrido.**

O bom teste: a frase diz alguma coisa a quem tem um restaurante? "Performance,
acessibilidade e SEO são o ponto de partida" não diz. "Um site que demora a abrir
perde o cliente antes de lhe mostrar o que vendes" diz.

### Começar pela dor, não pela lista

Uma boa frase deste site nomeia um problema que o cliente reconhece e só depois
apresenta a solução. É por isso que o hero abre com "Já tiveste de ligar a alguém
só para mudar um preço no site?" e não com a lista do que fazemos.

### Repetições a vigiar

Fórmulas que já se gastaram por aparecerem em demasiados sítios. Antes de usar
uma destas, procura no repositório quantas vezes já lá está:

| Fórmula                    | Onde pode ficar                              |
| -------------------------- | -------------------------------------------- |
| "de raiz" / "sem templates" | uma vez, em `/sobre`                        |
| "24 a 48 horas úteis"      | `/contacto` e o estado de sucesso do formulário |
| "Falar connosco"           | o botão fixo da navegação e o do rodapé; nos CTA dentro das páginas, varia |

## Metadata

**A metadata de uma página faz-se com `pageMetadata()`, de `lib/seo.ts`.** Não se
escreve um objeto `metadata` à mão, e não se escrevem títulos literais — o
título, a `description` e o `path` entram uma vez e saem no `<title>`, no
canónico, no Open Graph e no cartão do Twitter, todos coerentes por construção.

```ts
export const metadata = pageMetadata({
  path: "/servicos",
  title: "Serviços",
  description: "…",
});
```

O `path` escreve-se relativo (`"/servicos"`), que o `metadataBase` resolve para
o domínio de `lib/site.ts`. Nos casos de estudo é o `generateMetadata` a chamar
a mesma função, com `type: "article"` e a capa do projeto em `images`.

### Porque é que isto é uma função e não uma convenção

Porque a convenção falhou duas vezes, do mesmo alçapão. **O que está no
`metadata` do `app/layout.tsx` é herdado por todas as páginas que não o
sobreponham**, e o `openGraph` é substituído *por inteiro* quando uma página o
declara — não há merge de campos.

- Até agosto de 2026 o layout tinha `alternates: { canonical: "/" }`. Resultado:
  `/servicos`, `/portfolio`, `/sobre`, `/contacto` e `/privacidade` anunciavam-se
  todas como cópias da homepage — a pedir ao Google que as deixasse cair. O
  Search Console confirmou-o com o motivo _"Página alternativa com etiqueta
  canónica correta"_.
- Corrigido o canónico, ficou o gémeo: `openGraph` e `twitter` no layout faziam
  qualquer partilha de `/servicos` mostrar o **título, a descrição e o URL da
  homepage**. Só se deu por isso a verificar produção depois do deploy.
- E havia um terceiro, ao contrário: os casos de estudo declaravam `openGraph`
  próprio, e por isso **perdiam o cartão global** — o `a-barraquinha-nova`, que
  não tem capa, estava sem `og:image` nenhum, apesar de um comentário no código
  garantir o contrário.

A lição não é "não te esqueças do `openGraph`" — foi exatamente isso que falhou.
É que **não deve haver três sítios onde escrever a mesma coisa.**

### As duas regras que sobram

1. **Página nova, `pageMetadata()` novo.** Sem ele a página não fica errada,
   fica invisível — e partilhá-la mostra o cartão de outra.
2. **O `openGraph` do layout fica sem `url`, de propósito.** É só a rede de
   segurança do `not-found`. Um `url` ali era herdado por quem falhasse a regra
   1, e um `og:url` errado é pior do que nenhum: manda a plataforma atribuir a
   partilha à página errada. Ausente, a plataforma usa o URL que foi buscar.

O cartão social global vive em `app/opengraph-image.tsx`, mas o `alt` e o `size`
vêm de `lib/seo.ts` — a rota consome-os, não os define. Ver `docs/03`.

## Sitemap

`app/sitemap.ts` lista as seis páginas fixas e um caso de estudo por projeto, com
`priority` e mais nada. **O `lastModified` é opcional por decisão, não por
esquecimento.**

A primeira versão punha a data da build em todas as URLs. Isso anunciava ao Google
que o site inteiro tinha mudado de cada vez que se faz deploy — e um sinal falso
vale menos do que sinal nenhum, porque ensina o Google a ignorar o campo. Foi
retirado.

Nenhuma das datas que o repositório já tem serve de substituto:

- o `year` de `lib/projects.ts` é o ano do **trabalho**, não o dia em que o texto
  foi escrito. Daria `2026-01-01` a seis projetos: uma data que nunca aconteceu;
- o histórico do git dá a mesma data aos seis, porque vivem todos no mesmo
  ficheiro.

Por isso a única data aceite é o **`updatedAt` de cada projeto** — `YYYY-MM-DD`,
escrito à mão quando o caso de estudo é reescrito. Quem não o tiver não emite
`<lastmod>`, e é o caso de todos hoje. A ausência é uma resposta legítima: o
Google lê-a como "não sei", não como "nunca mudou".

**As páginas fixas continuam sem data**, e ficam assim até haver algo que saiba
dizer quando mudaram de facto. Não lhes ponhas a data da build para "ficarem
completas" — é a mesma armadilha, com outro nome.

> Preencher `updatedAt` em massa desfaz isto por inteiro. A regra de quando o
> escrever está no `docs/06`.

## Privacidade

`app/privacidade/page.tsx` é um documento legal, e a regra aqui é diferente da do
resto do site: **cada frase tem de ser verdade no dia em que está publicada.**

Duas consequências práticas:

- **Os subcontratantes dizem-se pelo nome.** O RGPD pede transparência sobre quem
  trata os dados, e "por exemplo, um serviço de email" não é transparência. Hoje
  são dois: a **Vercel** (alojamento) e a **Resend** (entrega das mensagens do
  formulário). Quem entrar a seguir entra nesta lista no mesmo PR em que passa a
  receber dados — nunca antes, nunca depois.
- **Não descrevas recolha que ainda não acontece.** A secção "Que dados
  recolhemos" descreve o formulário de contacto, e só é verdade porque o
  formulário **envia mesmo** — foi placeholder até agosto de 2026, e nessa altura
  a página estava a descrever o futuro. Se o envio for algum dia desligado, esta
  secção volta atrás com ele. Ver `docs/04-componentes-e-padroes.md`, "O
  formulário de contacto".

- **A identificação do responsável é a DevPlus e o email, e é uma decisão, não
  um esquecimento.** O RGPD quer saber _quem_ trata os dados e _como_ se fala com
  ele; a secção "Responsável pelo tratamento" diz as duas coisas. Não há
  designação social, NIF nem morada na página **de propósito** — não existe sede,
  e a decisão foi não publicar os nomes das três pessoas. Quando houver sociedade
  constituída, entram os três dados de uma vez, vindos de `lib/site.ts`. Até lá,
  não "completes" esta secção a achar que falta alguma coisa: não falta.

A data de "Última atualização" no fim da página muda sempre que o texto mudar.

## O Livro de Reclamações

Prestadores de serviços são obrigados a divulgar o acesso ao **Livro de
Reclamações Eletrónico** — Decreto-Lei n.º 156/2005, alterado pelo Decreto-Lei
n.º 74/2017, que desde 1 de julho de 2018 estendeu a obrigação para lá dos
serviços públicos essenciais. A obrigação nasce de haver **atividade**, não de
haver escritório: a DevPlus fatura a clientes, logo aplica-se.

O link vive em `site.livroReclamacoes` (`lib/site.ts`) e sai no rodapé, ao lado
da Política de Privacidade. Três regras:

- **Tem de estar visível sem ser preciso procurar.** Por isso o rodapé, que
  aparece em todas as páginas, e não uma página só para ele.
- **O selo oficial não se recria.** Descarrega-se da área reservada da
  plataforma, depois do registo, e entra em `public/`. Redesenhá-lo é
  contrafação de um símbolo oficial — e temos um estúdio de design, o que torna
  a tentação maior e o erro pior. Enquanto não houver selo, o link em texto
  cumpre: o que a lei exige é divulgar o acesso.
- **O link pressupõe registo na plataforma.** Um link para o
  `livroreclamacoes.pt` numa empresa que lá não está registada não cumpre nada —
  cria a aparência de cumprimento, que é o pior dos dois mundos, porque o
  consumidor que clica não encontra a entidade.

## Ao alterar este documento

| Se mudares…                                      | Faz também                                                                                                                                           |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| o nome, o domínio ou o email                     | só `lib/site.ts` — todo o resto importa de lá                                                                                                        |
| o `emailFrom`                                    | `lib/site.ts` **e** o domínio verificado no Resend — um `from` que o Resend não reconhece faz o envio falhar por inteiro. Ver `docs/04`              |
| o que o site recolhe, ou quem trata esses dados  | `app/privacidade/page.tsx` — nomeia o subcontratante e atualiza a data de "Última atualização" no mesmo PR em que o serviço passa a receber dados     |
| as redes (ou acrescentares um `href`)            | `socials` em `lib/site.ts` — o `sameAs` do `JsonLd.tsx` sai de lá sozinho; confirma o texto em `contacto/page.tsx`, que nomeia o que ainda falta     |
| criares uma página nova                          | monta a metadata com `pageMetadata({ path, title, description })` de `lib/seo.ts` — nunca um objeto `metadata` à mão. Ver "Metadata"                 |
| criares uma página nova                          | acrescenta o caminho ao array de `app/sitemap.ts` — as páginas fixas estão lá à mão; só os casos de estudo saem do array de projetos                 |
| a `tagline` (e com ela o título do cartão)       | só `lib/site.ts` — o `fullTitle` e o `alt` do `opengraph-image` derivam de lá por `lib/seo.ts`                                                       |
| quereres apostar em pesquisa local               | é reverter a decisão de "A geografia fica fora do texto visível" — lê-a primeiro; muda o título, a descrição, o corpo e o `areaServed`, ou nenhum   |
| a `tagline` ou a `description`                   | `lib/site.ts`; confirma o cartão social em `/opengraph-image`                                                                                        |
| um telefone, ou quem atende                      | `team` em `lib/site.ts` — `/contacto` e o `contactPoint` do JSON-LD saem de lá sozinhos                                                              |
| passar a haver sede ou sociedade constituída     | `lib/site.ts`, o `address` em `components/JsonLd.tsx`, e a identificação (designação social, NIF, morada) em `app/privacidade/page.tsx` — no mesmo PR |
| passar a haver selo oficial do Livro de Reclamações | põe o ficheiro em `public/`, troca o texto pelo selo em `components/Footer.tsx` — descarregado da plataforma, nunca redesenhado                    |
| a forma de escrever o nome                       | `docs/03` (o lockup) e o `aria-label` em `components/Wordmark.tsx`                                                                                   |
| o tom de voz                                     | revê `components/Hero.tsx`, `app/sobre/page.tsx` e os `blurb` em `lib/services.ts`                                                                   |
| a morada, o telefone ou qualquer dado da empresa | `lib/site.ts` **e** `components/JsonLd.tsx` — os dados estruturados dizem ao Google quem é a DevPlus, e uma divergência ali é pior do que a ausência |

## Dados estruturados

`components/JsonLd.tsx` publica três coisas: a organização (em todas as páginas,
a partir do `layout`), as perguntas frequentes (em `/servicos`) e, em cada caso de
estudo, o trabalho mais o rasto de navegação. Todos os campos vêm de `lib/site.ts`
e de `lib/projects.ts` — **não escrevas valores à mão neste ficheiro**, é a mesma
regra do resto do doc. Depois de mexer, passa o output pelo Rich Results Test.
