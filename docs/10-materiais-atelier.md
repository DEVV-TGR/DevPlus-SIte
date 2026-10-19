---
doc: materiais-atelier
fonte-de-verdade: codigo
controla:
  - components/atelier/
  - public/atelier/
relacionado:
  - docs/02-cores-e-tipografia.md
  - docs/04-componentes-e-padroes.md
  - docs/09-direcao-atelier.md
---

# Materiais atelier — integração partilhada

Primitivos preparados pelo Codex para a home e páginas interiores. A integração
nos consumidores pertence aos dois Claudes; este documento descreve os ficheiros
novos, não afirma que os componentes já estão montados no site.

## Fontes e catálogo

`components/atelier/assets.ts` é o catálogo único dos caminhos, dimensões, bytes,
alfa e hashes: 11 novos WebP em `public/atelier/` e referências aos três v2 já
existentes em `public/hero/`. Não duplica os bitmaps v2. Originais e prompts dos
novos assets estão em `outputs/atelier-3d-evolution/`; a imagem de estudo dos
botões fica apenas nessa pasta e não é servida como controlo da interface.

Importar `atelierAssets` de `@/components/atelier/assets` em código de servidor;
importar cada componente diretamente pelo seu ficheiro quando se pretende uma
fronteira cliente explícita. O barrel `@/components/atelier` também está disponível.
Nenhuma imagem é preload por defeito. Consumidores de `next/image` passam `src`,
`width`, `height` e `sizes`; não espalham o objeto inteiro com bytes/hash em JSX.

As figuras são ilustrações conceptuais. Capas reais, estados e dados dos clientes
continuam no catálogo de projetos. Usar `contain` nas esculturas. A moldura tem
abertura central transparente; a imagem real é um elemento HTML separado, com
inset calibrado pelo consumidor. Nunca gerar trabalho fictício de um cliente.

## MaterialSurface

```tsx
import { MaterialSurface } from "@/components/atelier/MaterialSurface";

// O article mantém a semântica e recebe o transform do leque/GSAP.
<article className="h-full">
  <MaterialSurface finish="graphite" contentClassName="flex flex-col gap-4">
    {conteudoExistente}
  </MaterialSurface>
</article>
```

| Prop | Default | Papel |
|---|---|---|
| `finish` | `graphite` | `graphite`, `silver`, `forest` ou `aluminio`, com tinta emparelhada |
| `interactive` | `true` | Autoriza tilt apenas com rato, desktop e movimento permitido |
| `padding` | `default` | 24px; `none` entrega o espaçamento ao conteúdo existente |
| `className` | — | Wrapper exterior: largura, altura e layout do consumidor |
| `contentClassName` | — | Conteúdo interior: flex/grid/alinhamento |
| restantes atributos de div | — | id, aria, handlers e style exteriores |

Não cria headings, texto, tabIndex, role de botão nem handlers de clique. Não
usar como controlo clicável: os links/botões reais ficam dentro. O consumidor
mantém semântica, dimensões e conteúdo. O padding ajusta-se pela prop, sem
depender da precedência entre Tailwind e CSS Modules.

Três camadas: wrapper com perspectiva, face interna transformável, conteúdo
acima da textura/reflexo decorativos. A face não corta overflow: anéis de foco
dos controlos devem ficar visíveis. Não aplicar animações externas em
`[data-atelier-face]` ou nas propriedades `--atelier-*`; são reservadas.

Os acabamentos usam exclusivamente tokens existentes. `silver` herda
`paper-ink`; texto secundário dentro dele deve usar `paper-muted`, nunca a
utilidade global `text-muted` pensada para escuro. `graphite` e `forest`
herdam `ink`. Um filho que define a sua cor continua a ser responsabilidade do
consumidor. O material não faz uma auditoria automática de contraste.

## AtelierBackdrop

```tsx
import { AtelierBackdrop } from "@/components/atelier/AtelierBackdrop";

<section id="secao-existente" className="relative isolate">
  <AtelierBackdrop interactive intensity="quiet" />
  <div className="relative z-10">{conteudoExistente}</div>
</section>
```

| Prop | Default | Papel |
|---|---|---|
| `theme` | `dark` | `dark` usa bg; `forest` usa forest |
| `intensity` | `quiet` | `quiet` ou `standard`; presença da imagem |
| `interactive` | `false` | Ativa deslocação/luz quando a modalidade o permite |
| `targetId` | — | ID existente da região que recebe o ponteiro; sem prop usa o pai imediato |
| `className` | — | Ajustes locais de enquadramento |

O pai deve ter posição relativa e altura determinada por conteúdo; nunca dar
altura só ao backdrop absoluto. Os irmãos de conteúdo ficam em z-10. A
decoração é aria-hidden e pointer-events:none; escuta o ponteiro no pai/alvo e
não interceta cliques. Se um targetId explícito não existir na montagem, fica
estático. Não mudar o elemento alvo mantendo o mesmo id sem remontar o fundo.

Imagem de ambiente lazy com sizes=100vw, véus e luz em camadas próprias.
Deslocação limitada a ±12px, com 14px extra de imagem por aresta. As arestas
misturam-se com o token do fundo; o bitmap não é prometido como seamless.
Não usar atrás de campos nem do texto legal com interatividade ligada.

## MaterialGround

```tsx
<section className="capitulo-verde relative isolate">
  <MaterialGround finish="glass" />
  …conteúdo em fluxo…
</section>
```

O fundo de um capítulo: a mesma luz (de cima, à direita) e o mesmo grão, cinco
acabamentos — `crystal` (dois planos largos), `metal` (dobras finas
maquinadas), `glass` (uma folha fundida com uma segunda aresta), `satin` (uma
dobra macia) e `matte` (só grão e luz). Vem do estudo de fundos aprovado
(v5): varia o material, não repete a mesma forma cristalina em todos os
capítulos. Não tem cores próprias — lê `--ground` e `--fg` do capítulo (as
classes `.capitulo-*` de `app/globals.css`, docs/02) e o `--creme` para os
brilhos. Absoluto em `z-index: -1` dentro de um pai `relative isolate`;
decorativo, `aria-hidden`, sem eventos. Cristal e vidro reagem ao ponteiro fino
pelo `attachPointerMaterial`; com movimento reduzido ficam parados. Numa secção
pinada vai **dentro do palco**, não na secção: na secção os planos mediam o
percurso inteiro do pin.

Na home: galeria `metal`, `NaMesa` `glass`, processo `crystal`, serviços
`glass`, pacotes `satin`.

O `Footer` partilhado usa `metal` sobre `--primary`, com `--primary-ink` como
tinta. Uma camada local de reflexos claros em `Footer.module.css` prolonga o
acabamento pelo convite e pela navegação, nos dois temas, sem movimento novo.

## Os dois temas

Os primitivos seguem o tema pelos tokens (docs/02). No tema claro, a
`MaterialSurface` passa a **cristal**: face clara translúcida (`--surface` a
72%), aresta luminosa, `backdrop-filter: blur(18px)` e reflexo creme; o
acabamento `forest` passa a mint com tinta forest, que é o par do verde no
claro. É a mesma placa nos dois temas — grafite no escuro, cristal no claro —,
sem uma segunda implementação. O `backdrop-filter` nunca é animado.

O `AtelierBackdrop` aceita `loading="eager"` para quando está acima da dobra:
aí é a imagem LCP da página, e em `lazy` o browser só a pedia depois do resto.
O `Ambiente` das interiores usa-o sempre, porque vive sempre no topo.

## Movimento, acesso e ciclo de vida

`pointerMaterial.ts` atualiza as coordenadas num máximo de um rAF pendente por
instância, solicitado por pointermove; não há loop permanente, listener de
scroll, ticker GSAP ou sistema Lenis novo. Tilt ±4°, resposta 160ms e retorno
300ms por CSS. Estas durações são feedback de ponteiro, não entradas de scroll.

Condições: hover, pointer fine, largura mínima 768px, movimento não reduzido,
pointerType mouse e região visível. Pressão/seleção, foco dentro da região,
pointerleave/cancel, blur da janela, tab oculta e saída da viewport anulam o
frame e repõem a pose. Alterar a preferência de movimento em execução também
repõe a pose. O foco conserva texto/controlo estáveis. Toque fica estático.

O cleanup remove listeners de target/window/document/media, desliga o
IntersectionObserver, cancela o frame e restaura as propriedades/atributos
reservados anteriores. Em forced-colors, textura, fundo e reflexo desaparecem;
a borda da placa usa CanvasText. Os defaults SSR já mostram todo o conteúdo.

## Ao alterar este documento

| Se mudares… | Faz também |
|---|---|
| API ou defaults | componentes TSX, exemplos acima e relatório de integração |
| condições, limites ou cleanup do movimento | pointerMaterial.ts, CSS e testes isolados |
| materiais/camadas | atelier.module.css; rever tinta dos filhos e foco |
| caminhos/bitmaps | assets.ts, hashes e manifestos; preservar originais |
| registo no índice de docs | passar a alteração a Claude 1, dono de docs/README.md |
| um acabamento do `MaterialGround` | confirma o texto por cima nos dois temas — o véu protege a coluna da esquerda, não a da direita |
| a receita de cristal do tema claro | mede o contraste dos filhos sobre a face composta, nos dois acabamentos |

### Cobertura das páginas interiores

O material já não está limitado à home: capas usam glass (Sobre), crystal
(Serviços) e satin (Portfólio); a voz de Sobre usa satin e as crenças metal;
catálogo de serviços usa glass dentro do palco, percurso crystal, pacotes
satin, FAQ matte; índice do portfólio metal, convite glass; casos metal à
volta das molduras e matte nos tópicos; contacto satin estático e privacidade
matte. Estes acabamentos estáticos não inclinam formulários nem texto legal.
A bancada partilhada `PackagePlates` usa os mesmos assets e `MaterialSurface`
nas duas páginas; não existe uma segunda receita para Serviços.

## Alumínio escovado — 18 de outubro

`MaterialSurface finish="aluminio"` é uma chapa e não um vidro: anodizado
escuro no tema escuro, **prata no claro** — não passa a cristal como os
outros acabamentos, e não tem `backdrop-filter`. A face é um gradiente de
`--aluminio-alto` a `--aluminio-baixo` (docs/02), o grão é o
`metal-escovado-v1.webp` em mosaico com um fio horizontal repetido, em
`soft-light`, e a aresta é um chanfro (luz em cima, sombra em baixo). A luz
espalha-se numa faixa larga e baixa (`150% 45%`), nunca num ponto: é como o
escovado a devolve, e pediu-se pouco foco de luz. A inclinação ao ponteiro é
a mesma das outras faces.

Dentro dele, `text-muted` funciona: o acabamento redefine `--muted` para
`--aluminio-muted`. As colunas do acordeão da `/servicos` usam a mesma
receita em `.coluna` (`paginas.module.css`), porque são `<button>` e não
podem ser um `MaterialSurface`.

### Continuidade nas fronteiras

MaterialGround tem máscara de alfa vertical: as camadas chegam a transparência
total nas duas extremidades e a presença plena a 7rem (máximo 18% da altura).
A cor sólida do capítulo fica visível na junção e coincide com os tokens de
Curva; assim a luz, os planos e o grão não formam uma faixa retangular.
A máscara própria do rodapé mantém a sua transição superior existente.
