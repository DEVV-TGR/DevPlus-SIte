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
| o fecho e o rodapé (são o mesmo bloco)         | [04](04-componentes-e-padroes.md) a forma, [01](01-marca.md) o texto |
| a lista de serviços                            | [05-servicos.md](05-servicos.md)                           |
| o portfólio, um cliente novo, capas            | [06-projetos.md](06-projetos.md)                           |
| o Estúdio interno em /estudio, projetos, login | [07-estudio.md](07-estudio.md)                             |
| materiais, ambiente e assets do atelier         | [10-materiais-atelier.md](10-materiais-atelier.md)         |

## Mapa inverso — de um ficheiro para o seu doc

| Ficheiro                                                                                                  | Doc que manda nele       |
| --------------------------------------------------------------------------------------------------------- | ------------------------ |
| `lib/site.ts`, `lib/seo.ts`                                                                               | 01                       |
| `components/InstagramLink.tsx`                                                                            | 01                       |
| `lib/tema.ts`, `components/SeletorTema.tsx` (o tema claro/escuro)                                         | 02                       |
| `lib/carrossel.ts`, `components/paginas/Carril.tsx`                                                       | 04                       |
| `components/paginas/Dispositivos.tsx`, `public/casos/`                                                    | 06                       |
| `components/paginas/Pecas.tsx`, `scripts/desenhar-damira.mjs`, `public/projetos/damira/`                 | 06                       |
| `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`                                                       | 01                       |
| `app/globals.css`                                                                                         | 02                       |
| `lib/brand.ts`, `components/Logo.tsx`, `components/Lockup.tsx`, `components/Wordmark.tsx`                 | 03                       |
| `app/icon.png`, `app/favicon.ico`, `images/Dev+-icone-2000.png`, `scripts/mkico.py`                       | 03 (o mark) + 02 (cores) |
| `scripts/vectorizar-logo.py`, `images/Dev+-logosimples.png`                                               | 03                       |
| `app/opengraph-image.tsx`                                                                                 | 01 (texto) + 03 (o mark) |
| `components/ui/*`, `components/Reveal.tsx`, `components/Marquee.tsx`                                      | 04                       |
| `lib/motion.ts`, `components/Providers.tsx`, `components/Nav.tsx`, `app/template.tsx`                     | 04                       |
| `components/home/*`, `app/page.tsx`, `scripts/verificar-scroll.mjs`, `scripts/otimizar-ilustra.py`        | 04                       |
| `components/paginas/*`                                                                                    | 04                       |
| `components/PackagePlates.tsx`                                                                           | 04 + 05 + 10             |
| `lib/packages.ts`                                                                                         | 05                       |
| `components/Testimonials.tsx`, `lib/testimonials.ts`, a ordem das secções de `app/page.tsx`               | 04                       |
| `components/ContactForm.tsx`, `lib/contacto.ts`, `app/api/contacto/route.ts`                              | 04                       |
| `components/Footer.tsx`, `components/Fecho.tsx`                                                           | 04 (a forma) + 01 (o texto) |
| `lib/services.ts`                                                                                         | 05                       |
| `lib/projects.ts`, `components/ui/ProjectCard.tsx`, `components/ProjectsMarquee.tsx`, `public/capas/`     | 06                       |
| `app/estudio/`, `app/api/estudio/`, `lib/estudio/`, `components/estudio/`, `components/CascaDoSite.tsx` | 07                       |
| `scripts/estudio-migrar.mjs`                                                                              | 07                       |
| `components/atelier/`, `public/atelier/`                                                                  | 10                       |
| `vercel.json`                                                                                             | 07                       |

[08-home-remake.md](08-home-remake.md) regista a entrega da home de outubro, o asset e a validação.

## Um doc que não é especificação

[motion-reference.md](motion-reference.md) é a **medição** de um site de
referência, feita em setembro de 2026, e a estrutura dele lado a lado com a
nossa. Não governa ficheiro nenhum: é de onde saíram os números que hoje estão
no `lib/motion.ts`, e serve para quando alguém perguntar "porquê 150 ms?".

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

[09-direcao-atelier.md](09-direcao-atelier.md) regista a direção aprovada, referências, expansão da paleta e assets v2.
[10-materiais-atelier.md](10-materiais-atelier.md) governa os primitivos `MaterialSurface` e `AtelierBackdrop` e o catálogo único dos assets em `public/atelier/`.
