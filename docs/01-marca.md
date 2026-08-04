---
doc: marca
fonte-de-verdade: doc
controla:
  - lib/site.ts
  - app/layout.tsx
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
("Web design que **soma** ao teu negócio"). Copy nova pode jogar com *somar*,
*acrescentar*, *mais* — mas sem forçar. Uma piada de "+" por página é o limite.

## Os dados

Tudo vive em **`lib/site.ts`**. Não escrevas nenhum destes valores à mão noutro
ficheiro; importa-os. Se precisas de um dado novo, acrescenta-o lá.

| Campo | Valor |
| --- | --- |
| `name` | DevPlus |
| `domain` / `url` | devplus.pt / https://devplus.pt |
| `email` | developerplusteam@gmail.com |
| `tagline` | Estúdio de Web Design & Desenvolvimento |
| `locale` / `lang` | pt_PT / pt |

O `email` é longo e parte o layout em colunas estreitas — onde aparece, leva
`break-all`.

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

- **Português de Portugal**, tratamento por **"tu"**. Nunca "você", nunca PT-BR.
- Direto e concreto. "Mudas o preço num sítio e muda em todo o lado" vale mais do
  que "solução integrada de gestão de conteúdos".
- Sem superlativos de agência: nada de "soluções inovadoras", "excelência",
  "parceiro estratégico", "à medida das suas necessidades".
- Frases curtas. Se uma frase tem duas vírgulas e um travessão, parte-a.
- Acentuação sempre correta — nunca "nao", "servicos", "ecra".

## Metadata

`app/layout.tsx` monta tudo a partir de `site`: o título é
`` `${site.name} — ${site.tagline}` ``, o template das subpáginas é
`` `%s · ${site.name}` ``. Não escrevas títulos literais.

## Ao alterar este documento

| Se mudares… | Faz também |
| --- | --- |
| o nome, o domínio ou o email | só `lib/site.ts` — todo o resto importa de lá |
| as redes (ou acrescentares um `href`) | `socials` em `lib/site.ts`; apaga as notas de "em breve" no `Footer.tsx` e em `contacto/page.tsx` |
| a `tagline` ou a `description` | `lib/site.ts`; confirma o cartão social em `/opengraph-image` |
| a forma de escrever o nome | `docs/03` (o lockup) e o `aria-label` em `components/Wordmark.tsx` |
| o tom de voz | revê `components/Hero.tsx`, `app/sobre/page.tsx` e os `blurb` em `lib/services.ts` |
