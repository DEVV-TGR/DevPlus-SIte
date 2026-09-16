#!/bin/bash
SKILL=/Users/goncalosilva/.claude/plugins/cache/nateherk/nateherk-design/0.3.0/skills/scroll-craft
: "${KIE_AI_API_KEY:?falta KIE_AI_API_KEY}"

# Estilo pedido nas referências: vetorial plano, contorno preto uniforme,
# preenchimentos chapados, fundo branco puro para depois se recortar para alfa.
# Os claros são CREME e nunca branco — se fossem brancos, o recorte abria
# buracos no interior das figuras.
P="Flat vector illustration, bold uniform black outlines of even weight, simple geometric shapes, flat colour fills with no gradients and no shading, friendly editorial character illustration. Colours strictly limited to burnt orange #F2762B, cream #f7f2ec, warm charcoal #1a1613 and black outlines. Light areas are CREAM #f7f2ec, never white. Centred composition isolated on a PURE WHITE #FFFFFF background, no shadow, no backdrop, no ground plane, no frame, no border. NOT 3D, NOT photorealistic, NOT painterly, no text, no letters, no numbers, no logos."

g () { node "$SKILL/scripts/kie.mjs" still "$P

$2" "out/$1.png" --ar "${3:-1:1}" 2>&1 | tail -1; }

g h-boneco "A single seated character with a simple rounded head and no facial detail beyond dots and a line, working at a large monitor seen from the side. Around them float a code bracket block, a small image frame, a gear and a cloud, all outlined. The character wears a burnt orange top. Generous empty margin all round." 4:3

g t1-conversa "Two simple characters facing each other across a small round table, one gesturing, speech bubbles above them, an open notebook on the table. Burnt orange and cream clothing."
g t2-design  "One simple character standing at a large drafting board, drawing a wireframe layout of rectangles with a pen, a ruler and a set square resting nearby. Burnt orange top."
g t3-construcao "One simple character assembling stacked geometric blocks that together form a browser window with a title bar and three dots. Burnt orange top, cream blocks."
g t4-no-ar "A browser window shape rising upward with a small rocket below it and short straight speed lines beneath, a simple character waving from beside it. Burnt orange accents."

g s1-web-design "A monitor outline containing simple layout rectangles, with a large paintbrush crossing diagonally over it and a small colour palette beside it. Cream screen, burnt orange brush."
g s2-desenvolvimento "A monitor outline containing a large code bracket symbol made of simple angular shapes, with a gear at one corner and a small terminal window overlapping. Cream screen, burnt orange gear."
g s3-menus "A smartphone outline standing beside a larger wall-mounted screen outline, a simple square QR-like grid pattern on the phone, both connected by a short curved line. Burnt orange frames, cream screens."
g s4-painel "A dashboard panel outline containing toggle switches, two slider controls and a short list of stacked bars, with a cursor arrow over one toggle. Cream panel, burnt orange toggles."

echo "GERACAO V3 TERMINADA"; ls -la out/h-*.png out/t*.png out/s*.png 2>/dev/null
