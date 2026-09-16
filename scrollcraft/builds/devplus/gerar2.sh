#!/bin/bash
SKILL=/Users/goncalosilva/.claude/plugins/cache/nateherk/nateherk-design/0.3.0/skills/scroll-craft
: "${KIE_AI_API_KEY:?falta KIE_AI_API_KEY}"

# O preâmbulo continua o mesmo — é o que faz as quatro parecerem a mesma sessão.
# O que muda: o fundo de cada imagem passa a ser EXATAMENTE o ground do capítulo
# onde ela vive, para a fotografia se fundir com a secção em vez de aterrar lá
# como uma caixa. É também por isso que passam a sangrar de margem a margem.
P="Studio product photography, single hard undiffused key light from upper left, crisp high-contrast cast shadow used as a graphic shape. Punchy contrast, slight halation on speculars, fine sensor grain. Digital medium format, sharp throughout. NOT 3D render, NOT clay, NOT illustration, no digital glow, no plastic sheen, no text, no logos, no people, no props other than described."

node "$SKILL/scripts/kie.mjs" still "$P

A cream and burnt orange desktop computer monitor and a smartphone standing beside it, both plain and screenless with blank matte faces, arranged as a still life. The seamless backdrop and the surface are one continuous VERY DARK WARM NEAR-BLACK, hex #100e0c, filling the entire frame edge to edge with no vignette and no lighter border. Objects sit in the right third. The long hard shadow rakes across the empty left half." out/n1-oficio.png --ar 16:9 2>&1 | tail -2

node "$SKILL/scripts/kie.mjs" still "$P

An architect's flat lay: a cream set square, a burnt orange ruler and two blank cream cards overlapping at clean angles, shot from directly above. The seamless backdrop is one continuous SATURATED BURNT ORANGE, hex #F2762B, filling the entire frame edge to edge with no vignette and no lighter border. Hard shadows fall sharply to the lower right. Composition sits low-left with generous empty orange above." out/n2-medida.png --ar 16:9 2>&1 | tail -2

node "$SKILL/scripts/kie.mjs" still "$P

Six simple modular geometric blocks in cream and burnt orange, cubes and slabs, arranged in a loose interlocking grid, shot slightly from above. The seamless backdrop and surface are one continuous WARM CHARCOAL, hex #1a1613, filling the entire frame edge to edge with no vignette and no lighter border. Six parallel long hard shadows read as a graphic pattern across the right half." out/n3-modular.png --ar 16:9 2>&1 | tail -2

echo "GERACAO 2 TERMINADA"; ls -la out/n*.png
