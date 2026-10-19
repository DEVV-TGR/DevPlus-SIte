# Home do remake — outubro de 2026

## Entrega

A home mantém a identidade DevPlus e passa a hero → sete projetos → processo
→ serviços → pacotes → rodapé. A coreografia do scroll, o leque de cards do
processo e a meia-roda dos serviços são essenciais e mantêm-se. O Estúdio não foi alterado. A navegação e o
rodapé são partilhados pelas páginas públicas; o catálogo acrescenta três
casos de estudo, sem alterar APIs, tipos públicos de projeto ou base de dados.
A transição de página deixa de esconder a árvore inteira antes da hidratação.

## Oficina digital

Gerada com a ferramenta integrada ImageGen, em modo `stylized-concept`, com
fundo transparente. O símbolo da marca não foi gerado: vem sempre de `Logo`.

Ficheiros servidos:
- `public/hero/oficina-digital.webp`: 1200 × 800, ~113 KB, alfa preservado;
- `public/hero/oficina-digital-mobile.webp`: 640 × 427, ~47 KB, derivada disponível;
- a imagem principal usa `next/image`, `preload` e `sizes`; o Next serve as
  versões responsivas a partir do master, sem descarregar o tamanho desktop
  por omissão no telemóvel.

Prompt final utilizado:

> Use case: stylized-concept. Asset type: premium website hero transparent cutout for DevPlus, Portuguese custom web design and development studio. Create one art-directed 3D digital workshop assemblage, tactile matte industrial objects, sophisticated playful restraint, not childish. Main object a warm ivory desktop monitor with graphite edges, floating tilted website layout sheets emerging behind, an orange smartphone displaying a minimal restaurant menu made only from geometric rectangles and little food thumbnail circles, a small sage green dashboard module with simple bars, and a compact orange ecommerce basket module. A few small orange connector blocks join the modules like a precision construction kit. Strong sculptural silhouette, physically plausible studio rendering, soft ambient occlusion, elegant warm studio light. Palette strictly burnt orange #F2762B, pale ivory #f7f2ec, near black brown #1a1613, sage green accent. Composition three-quarter perspective, compact asymmetrical landscape cluster, complete objects fully in frame with generous transparent margins, designed to sit at right side of dark website hero. Image must have actual transparent alpha background. No typography, no letters, no numbers, no logos, no plus symbols, no watermarks, no people or mascots, no background plane. Screen mock interfaces use geometric visual blocks only. High quality rendered bitmap with refined materials and crisp edges.

As cores no prompt descrevem os pixels do asset, não acrescentam cores ao CSS.
As cores da interface continuam a vir exclusivamente dos tokens.

## Conteúdo real

Preguiça e Avenida estão concluídos por confirmação do Gonçalo. A Damira está
em desenvolvimento. Os restantes trabalhos da home preservam os casos existentes.
O vídeo de QR/NFC foi fornecido pelo Gonçalo e está só no caso do Preguiça,
com controlos, poster e `preload="none"`. A derivada 720px sem áudio tem ~2 MB;
o original fica intacto na pasta do cliente. Não há autoplay.

As capas novas foram capturadas nos sites públicos do Preguiça, Avenida e Damira. (A da Damira foi trocada por um desenho a 19 de outubro — docs/06.)
O domínio do Avenida apresentou erro de certificado, pelo que o link usa a
versão Vercel verificada. A pré-visualização Damira não é apresentada como loja
lançada. Não são publicados outros clientes ou demonstrações sem confirmação.

## Dependências e ferramentas

Impeccable atualizado para 4.6.0 pelo comando oficial, como autorizado. O runtime
compilado local não é versionado; o launcher disponibiliza o mecanismo de
instalação da versão fixada. A atualização Next 16.4.1 e o override de glob são
os mesmos adotados em master; o lockfile inclui as correções transitivas e a
auditoria npm ficou sem vulnerabilidades.

## Verificação

Os resultados finais e capturas são descritos no PR. O ambiente de execução
não permite abrir o Chrome headless diretamente; a revisão visual usa o
navegador integrado. O build local usa `--webpack` porque o Turbopack não consegue
iniciar FSEvents nesta sandbox. O comando de build do projeto mantém-se igual.

## Imersão preservada

A galeria é pinada em desktop ≥1024px, com pausas e progressão horizontal pelo
scroll; as setas e as teclas também escolhem a posição na narrativa. Em mobile
e movimento reduzido, a galeria usa scroll horizontal nativo. O processo conserva
a acumulação dos cards em desktop e o percurso horizontal por scroll em mobile.
Os serviços mantêm a meia-roda, o pin e a escolha por scroll, rato, toque e teclado.
A alternativa de movimento reduzido preserva os conteúdos e a escolha manual.

## Revisão seguinte

A direção visual foi ampliada em 17 de outubro, depois de estudar referências
premiadas e receber exemplos de posts do utilizador. A descrição histórica da
primeira oficina acima permanece como proveniência; o hero e os serviços usam
agora os assets v2 e o sistema documentado em docs/09-direcao-atelier.md.
