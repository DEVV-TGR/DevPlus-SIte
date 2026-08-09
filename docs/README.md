# Docs da DevPlus — começa aqui

Esta pasta é a **fonte de verdade** do site: marca, cores, símbolo, componentes,
serviços e projetos. Não é documentação de arquivo — é especificação viva.
Se um doc e o código discordarem, é um bug, não uma questão de gosto.

## Qual doc é que eu preciso?

| Vou mexer em…                                  | Lê                                                         |
| ---------------------------------------------- | ---------------------------------------------------------- |
| nome, domínio, email, redes, metadata, SEO     | [01-marca.md](01-marca.md)                                 |
| cores, tokens, fontes, cantos, espaçamento     | [02-cores-e-tipografia.md](02-cores-e-tipografia.md)       |
| o logótipo "D+", favicon, o "+", cartão social | [03-simbolo-e-logotipo.md](03-simbolo-e-logotipo.md)       |
| botões, cards, secções, animações              | [04-componentes-e-padroes.md](04-componentes-e-padroes.md) |
| a lista de serviços                            | [05-servicos.md](05-servicos.md)                           |
| o portfólio, um cliente novo, capas            | [06-projetos.md](06-projetos.md)                           |

## Mapa inverso — de um ficheiro para o seu doc

| Ficheiro                                                                                                  | Doc que manda nele       |
| --------------------------------------------------------------------------------------------------------- | ------------------------ |
| `lib/site.ts`                                                                                             | 01                       |
| `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`                                                       | 01                       |
| `app/globals.css`                                                                                         | 02                       |
| `lib/brand.ts`, `components/Logo.tsx`, `components/Lockup.tsx`, `components/Wordmark.tsx`, `app/icon.svg` | 03                       |
| `scripts/vectorizar-logo.py`, `images/Dev+-logosimples.png`                                               | 03                       |
| `app/opengraph-image.tsx`                                                                                 | 01 (texto) + 03 (o mark) |
| `components/ui/*`, `components/Reveal.tsx`, `components/Marquee.tsx`                                      | 04                       |
| `components/Testimonials.tsx`, `lib/testimonials.ts`, a ordem das secções de `app/page.tsx`               | 04                       |
| `lib/services.ts`                                                                                         | 05                       |
| `lib/projects.ts`, `components/ui/ProjectCard.tsx`, `components/ProjectsMarquee.tsx`, `public/capas/`     | 06                       |

## Como isto se mantém vivo

Três mecanismos, e os três têm de ser respeitados:

1. **`controla:`** — cada doc declara no topo os ficheiros que governa, e se a
   fonte de verdade é o doc ou o código (`fonte-de-verdade:`).
2. **`docs:` no topo do ficheiro** — cada ficheiro governado tem um comentário na
   primeira linha a apontar para o seu doc. Se abriste um ficheiro e ele tem esse
   comentário, **lê o doc antes de editar**, mesmo para uma alteração de uma linha.
3. **`## Ao alterar este documento`** — a última secção de cada doc é uma tabela
   de "se mudares X, faz também Y". É a lista de ações, não é decorativa.

**Alteraste um doc?** Aplica já as alterações de código da tabela desse doc.
**Alteraste um ficheiro que aparece num `controla:`?** Atualiza o doc na mesma
sessão. Nunca deixes um dos lados por fazer.

## Regra de duplicação

O doc duplica **apenas** aquilo que o código já é obrigado a duplicar (os hex das
cores, a geometria do "+"). Tudo o que o código tem numa fonte única — a lista de
serviços, a de projetos, os tokens — o doc **aponta**, não copia. Copiar cria uma
segunda fonte que diverge ao segundo mês.
