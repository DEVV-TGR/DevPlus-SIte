# Direção atelier — 17 de outubro de 2026

## Brief confirmado
Evoluir a home do remake com uma identidade elegante e consistente com os posts
fornecidos pelo utilizador. O utilizador aprovou os novos assets e a palavra
“soma” em itálico. Preservar Bricolage Grotesque, laranja, verde, geometria original
do +, conteúdo real e imersão com scroll, leque do processo e roda dos serviços.
A continuação trabalha no PR #104 para remake, sem merge nem publicação.

## Estudo e plano aplicado
- [Lusion v3 — Awwwards SOTD](https://www.awwwards.com/sites/lusion-v3):
  estudar a escala da imagem e a progressão entre imagem e narrativa.
- [Unseen Studio — Awwwards SOTD](https://www.awwwards.com/sites/unseen-studio):
  estudar continuidade de materiais e ambiente. Os sites atuais foram vistos
  no browser; podem ter evoluído face às versões premiadas.
- Posts do utilizador: palavra em itálico, uma cor de acento, mockups reais,
  fundos com profundidade. Dourado pertence aos clientes apresentados; não se
  transfere para a marca DevPlus.
- Hero: três linhas legíveis, nova escultura digital em alfa, profundidade por
  scroll e inclinação subtil ao ponteiro, com ações disponíveis imediatamente.
- Projetos: sete casos na mesma ordem, galeria horizontal pinada em desktop,
  enquadramento por superfícies da marca, navegação por teclado e controlos.
- Prova real: novo capítulo “O digital também vive à mesa”, vídeo fornecido
  pelo utilizador, sem autoplay e com preload none, QR/NFC explicados em texto.
- Processo: o mesmo leque; cartões tipográficos com resultado de cada etapa,
  eliminando a quebra estética das ilustrações anteriores.
- Serviços: manter a meia-roda, pins e seleção manual; quatro esculturas da
  mesma família. Desenvolvimento passou da capa real do Império para
  `desenvolvimento-digital-v3.webp` por decisão do utilizador (17 de outubro); a
  prova real fica no link para o caso. O fundo acompanha a cena.
- Pacotes: linhas comparáveis, conteúdo comercial inalterado.
- Interiores: sem redesenho nesta intervenção; Estúdio e backend fora do âmbito.

## Sistema
Bricolage continua a única família. Itálico de peso médio em poucas palavras,
laranja no escuro, cobre no claro. Os tokens originais não mudam; copper,
peach, forest, mint e forest-muted acrescentam profundidades e luminosidades.
Assets: acrílico laranja, vidro verde e alumínio escovado. Ilustrações conceptuais
nunca são apresentadas como screenshots de sistemas entregues.

## Assets e proveniência
Gerados através de ImageGen integrada, transparentes, convertidos para WebP
com sharp preservando alfa. Originais guardados na pasta de generated_images.
- public/hero/atelier-digital-v2.webp — 1200×1200, 200202 bytes.
- public/hero/nfc-digital-v2.webp — 850×850, 109942 bytes.
- public/hero/painel-digital-v2.webp — 850×850, 99462 bytes.
- public/atelier/desenvolvimento-digital-v3.webp — 1200×1200, 172010 bytes,
  SHA-256 `fb06349a…bc39`. Vive no catálogo partilhado de `docs/10`
  (`components/atelier/assets.ts`), sem cópia em `public/hero/`. Produzido pelo
  agente de direção visual com a mesma ferramenta; prompt completo abaixo. O
  original PNG ficou na pasta de preparação desse agente, fora do repositório. Um browser montado por camadas:
  moldura de alumínio, grelha de vidro verde, painel marfim e dois módulos de
  acrílico laranja. Sem letras nem código.
As imagens existentes dos clientes e o vídeo mantêm a proveniência em docs/08.
Não são usadas imagens dos sites de referência.

### Prompt hero
Use case: stylized-concept. Create a premium art-directed 3D product sculpture for a Portuguese digital design atelier website hero. Transparent alpha cutout, no background plane. A large upright thin rounded rectangular browser-window frame in intensely vivid translucent burnt-orange acrylic with subtly refractive edges, seen in three-quarter view with a gentle clockwise tilt. Inside the frame a beautifully composed cream website sheet with a single large abstract orange architectural photograph and dark forest-green geometric layout blocks, NO text. A slender brushed aluminium smartphone with a mint screen floats in front of its lower left corner, and two thin green glass interface panels hover behind at different depths. One elegant fluid satin aluminium ribbon threads between the elements, expressing connection between web, mobile and business. Restrained sculptural composition with only these 5 objects, realistic premium industrial materials, crisp reflections, warm editorial studio light, deep contact occlusion, no toy-like clay, no bubbly plastic, no hands, no people, no orbit lines, no sparkles, no lettering, no logos, no plus symbols. Strong graphic silhouette, objects entirely in frame, large composition filling a square canvas with a little transparent breathing room. Palette orange #F2762B, copper, light peach, mint green, forest green and brushed silver. This is a usable transparent website image asset, not a whole page mockup.

### Prompt menus
Use case: stylized-concept. Transparent alpha cutout for a premium Portuguese digital studio's restaurant QR/NFC service. Photorealistic 3D product sculpture: a brushed aluminium smartphone floats diagonally above a small orange translucent acrylic restaurant table puck, indicating a contactless interaction. Phone display shows a cream menu layout with three beautifully photographed tiny food dishes, green rectangular lines, no text at all. The orange puck contains an embossed simple contactless radio-wave icon, NO QR code and NO lettering. A single satin aluminium ribbon makes a wide open loop behind the phone and puck, with one small translucent forest green glass sheet hovering at the rear. Three-quarter perspective, sharp studio reflections, refined industrial product aesthetic, orange #F2762B, copper highlights, pale mint, forest green, silver, cream. Complete objects fully in frame, generous transparent space, strong silhouette on dark green background of website. No background plane, no shadows outside cutout, no hands, no people, no text, no logos, no brand symbols, no cartoons, no clay material. Match luxurious translucent orange acrylic and brushed aluminium material family; square composition.

### Prompt painel
Use case: stylized-concept. Create a square transparent alpha cutout 3D asset for a premium custom software studio's management dashboard service. A floating thin brushed aluminium tablet with a cream screen showing an abstract sophisticated dashboard: dark forest green side strip, orange rectangular visual cards, simple green bars and small rounded toggles. No text, no letters, no numbers, no logos. Two translucent forest-green glass panels behind it at different depths, and a single smooth satin aluminium ribbon looping behind and under the tablet; one small translucent orange acrylic slider knob in front. Three-quarter perspective, tilted slightly counterclockwise, entire objects within frame. Premium industrial product photography lighting, warm crisp reflections, detailed brushed metal, clear rich orange acrylic #F2762B, pale mint, forest green, ivory. Refined material sophistication, not clay, not cartoon, not bubbly toys. Clean strong readable silhouette, no background floor or plane, genuine transparent alpha, no typography, no plus shapes. Asset should visually match a family of orange acrylic web browser and NFC smartphone sculptures with silver ribbons.

### Prompt desenvolvimento
Use case: stylized-concept. Asset type: production-ready transparent 3D sculpture for the Development service of a Portuguese digital atelier. Create ONE freestanding exploded assembly of a sophisticated web browser, visibly being constructed from three floating layers, NOT a screenshot and NOT a whole website design. Rear layer: slim brushed aluminium structural frame. Middle layer: one dark forest-green translucent glass interface grid. Front layer: warm ivory website panel with an orange architectural image block and a few clean forest-green geometric layout blocks, absolutely no text. Two small translucent vivid burnt-orange acrylic modules are shown precisely docking into the open space between layers. One restrained satin aluminium ribbon loops once beneath the structure, linking these materials. No phone, no tablet, no dashboard charts: this must read as modular construction rather than the existing finished web-design sculpture. Three-quarter perspective with clearly separated depth, gentle counterclockwise tilt, tangible rich refractive orange edges, real brushed metal grain, refined industrial product photography, warm studio key light from upper left, premium realistic reflections, strong sculptural silhouette. Match a visual family of orange acrylic browser frames, forest-green glass and satin silver ribbons. Palette vivid orange #F2762B, deep forest green, pale mint, ivory, brushed silver; no purple or blue. Square canvas, entire sculpture fits within central 84 percent, generous transparent margin on all four sides, actual transparent alpha background, no backdrop, no floor, no cast shadow outside the cutout. Make the composition simple enough to read at 240px. No letters, numbers, code, logos, symbols resembling a plus, watermarks, QR codes, cables, gears, floating particles, neon glow, clay or toy plastic. This is a conceptual illustration of development, not an actual delivered client system.

## Critérios de validação
Lint, tipos e build; imagens e links; larguras 390, 768, 1024, 1366 e 1440;
entradas e saídas de pins, setas e End da galeria, teclado da roda, menu mobile,
mudança de tamanho, regressões no portfólio e ausência de overflow.
Movimento reduzido deve manter conteúdo e escolha manual acessíveis.
Os resultados efetivamente executados são registados na entrega, sem presumir
testes que o browser integrado não permita executar.


## Verificação final
Novos contrastes: copper/paper 7,35:1; forest/mint 11,71:1; primary-ink/peach
13,18:1; ink/forest 15,10:1; forest-muted/forest 8,06:1; primary/forest 6,23:1.
O leque começa em 1280px; abaixo permanece o percurso horizontal.
