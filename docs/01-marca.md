---
doc: marca
fonte-de-verdade: doc
controla:
  - lib/site.ts
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
| `locale` / `lang` | pt_PT / pt-PT                               |

O `email` é a caixa que lemos — é ele que aparece no rodapé, em `/contacto`, em
`/privacidade` e nos dados estruturados.

O `emailFrom` **nunca aparece no site**: é só o remetente com que o Resend envia
as submissões do formulário para a nossa caixa. Vive num subdomínio de propósito
— ver `docs/04`, "O formulário de contacto".

## Redes sociais

As contas **ainda não existem**. Estão em `socials` (`lib/site.ts`) com o `href`
por preencher, o que é a forma de dizer "sem link":

- `href` ausente → renderiza como texto esbatido, sem `<a>`;
- `href` preenchido → passa a link automaticamente, sem tocar em JSX.

Contas previstas: **Instagram, Facebook, WhatsApp**. O LinkedIn foi retirado.

**Quando as contas existirem:** acrescenta o `href` em `lib/site.ts` e apaga as
duas notas de "em breve" — o `<span>· em breve</span>` em `components/Footer.tsx`
e o parágrafo "Ainda a preparar as contas" em `app/contacto/page.tsx`.

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

`app/layout.tsx` monta tudo a partir de `site`: o título é
`` `${site.name} — ${site.tagline}` ``, o template das subpáginas é
`` `%s · ${site.name}` ``. Não escrevas títulos literais.

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

A data de "Última atualização" no fim da página muda sempre que o texto mudar.

## Ao alterar este documento

| Se mudares…                                      | Faz também                                                                                                                                           |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| o nome, o domínio ou o email                     | só `lib/site.ts` — todo o resto importa de lá                                                                                                        |
| o `emailFrom`                                    | `lib/site.ts` **e** o domínio verificado no Resend — um `from` que o Resend não reconhece faz o envio falhar por inteiro. Ver `docs/04`              |
| o que o site recolhe, ou quem trata esses dados  | `app/privacidade/page.tsx` — nomeia o subcontratante e atualiza a data de "Última atualização" no mesmo PR em que o serviço passa a receber dados     |
| as redes (ou acrescentares um `href`)            | `socials` em `lib/site.ts`; apaga as notas de "em breve" no `Footer.tsx` e em `contacto/page.tsx`                                                    |
| a `tagline` ou a `description`                   | `lib/site.ts`; confirma o cartão social em `/opengraph-image`                                                                                        |
| a forma de escrever o nome                       | `docs/03` (o lockup) e o `aria-label` em `components/Wordmark.tsx`                                                                                   |
| o tom de voz                                     | revê `components/Hero.tsx`, `app/sobre/page.tsx` e os `blurb` em `lib/services.ts`                                                                   |
| a morada, o telefone ou qualquer dado da empresa | `lib/site.ts` **e** `components/JsonLd.tsx` — os dados estruturados dizem ao Google quem é a DevPlus, e uma divergência ali é pior do que a ausência |

## Dados estruturados

`components/JsonLd.tsx` publica três coisas: a organização (em todas as páginas,
a partir do `layout`), as perguntas frequentes (em `/servicos`) e, em cada caso de
estudo, o trabalho mais o rasto de navegação. Todos os campos vêm de `lib/site.ts`
e de `lib/projects.ts` — **não escrevas valores à mão neste ficheiro**, é a mesma
regra do resto do doc. Depois de mexer, passa o output pelo Rich Results Test.
