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

| Componente        | Para que serve                                                                    | Nunca                                                                                      |
| ----------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `ui/Container`    | largura máxima (`max-w-6xl`) e padding lateral                                    | criar outro wrapper de largura                                                             |
| `ui/Section`      | espaçamento vertical entre blocos (`py-16/24/32`)                                 | pôr padding vertical à mão numa `<section>`                                                |
| `ui/Button`       | 3 variantes: `primary`, `outline`, `ghost`                                        | usar `<a>` cru com classes de botão; links externos já são detetados pelo `http` no `href` |
| `ui/ProjectCard`  | um projeto na grelha (capa, etiquetas, serviços)                                  | duplicar o card noutra página                                                              |
| `Reveal`          | aparecer no scroll (fade + 16px)                                                  | envolver cada elemento; envolve o bloco                                                    |
| `Marquee`         | faixa horizontal infinita, decorativa                                             | pôr lá conteúdo que importe — é `aria-hidden`                                              |
| `ProjectsMarquee` | a faixa de projetos da página inicial: mesma técnica, mas conteúdo real e focável | usá-lo para decoração — para isso é o `Marquee`; e pôr `gap` no track, que parte o ciclo   |
| `PageHero`        | cabeçalho das páginas internas (eyebrow + h1 + intro)                             | escrever um h1 solto numa página interna                                                   |
| `Hero`            | só a página inicial                                                               | reutilizar noutro sítio                                                                    |
| `Wordmark`        | o logótipo com link para "/"                                                      | ver `docs/03`                                                                              |
| `Lockup` / `Logo` | o logótipo "D+" e o "+" isolado                                                   | desenhar o logótipo à mão em SVG — ver `docs/03`                                           |
| `Providers`       | Lenis + `MotionConfig`                                                            | acrescentar providers sem necessidade                                                      |

Secções encadeadas levam `className="pt-0"` na segunda em diante, para o
espaçamento não duplicar. É o padrão em toda a homepage.

## Movimento

- **Duração** 0.45–0.6s. Acima disso sente-se lento.
- **Easing** `[0.22, 1, 0.36, 1]` em tudo. Não introduzas outra curva.
- **Stagger** 0.06–0.08s entre irmãos (`delay={i * 0.06}`).
- `Reveal` dispara uma vez (`viewport={{ once: true }}`) — nada re-anima ao subir.
- **Movimento reduzido está tratado globalmente**: `MotionConfig reducedMotion="user"`
  em `Providers`, mais uma regra em `app/globals.css` que neutraliza o marquee e o
  spin. Não escrevas `prefers-reduced-motion` novo sem verificar se já está coberto.
  **Uma exceção:** o `ProjectsMarquee` transporta conteúdo navegável, e congelá-lo
  deixaria três projetos fora do ecrã sem forma de lá chegar. Por isso `globals.css`
  transforma-o num carrossel de scroll manual com snap (`.carousel-*`) nesse modo.
- **Nenhuma animação pode ser a condição de o conteúdo existir.** Tudo o que nasce
  invisível à espera de animar leva `data-reveal`, e `globals.css` mostra esses
  elementos enquanto o `<html>` não tiver a classe `js` — posta por um script inline
  em `app/layout.tsx`. Sem isto, o HTML pré-renderizado sai com dezenas de elementos
  a `opacity:0` e quem não executa JavaScript vê uma página em branco. O `Reveal`
  tem ainda um temporizador de segurança: se o observador de viewport não disparar
  (renderizadores headless, separadores em segundo plano), mostra-se ao fim de 1,2 s.
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

## Nota conhecida

`components/ContactForm.tsx` **não envia nada** — o submit é um `setTimeout` de
placeholder. Falta ligar a um serviço de email (Resend, Formspree) ou a um route
handler em `app/api/`. Enquanto isso, o email em `lib/site.ts` é o único canal
real de contacto.

## Ao alterar este documento

| Se mudares…                       | Faz também                                                                                                |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| criares um primitivo novo         | acrescenta-o à tabela acima                                                                               |
| a duração ou o easing             | `components/Reveal.tsx`, `components/Hero.tsx` e os `transition-*` dos cards — muda em todos ou em nenhum |
| o espaçamento vertical            | `components/ui/Section.tsx`, não as páginas                                                               |
| a largura máxima                  | `components/ui/Container.tsx`, não as páginas                                                             |
| ligares o formulário a um serviço | `components/ContactForm.tsx` e apaga a "Nota conhecida" acima                                             |
