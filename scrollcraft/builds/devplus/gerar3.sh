#!/bin/bash
SKILL=/Users/goncalosilva/.claude/plugins/cache/nateherk/nateherk-design/0.3.0/skills/scroll-craft
: "${KIE_AI_API_KEY:?falta KIE_AI_API_KEY}"

# Mundo: render 3D / cyber. Escolha do Gonçalo, que trocou o fotográfico por
# isto a meio. O fundo de cada imagem é o ground exato do capítulo onde ela
# vive — foi o que faltou à primeira leva, e é por isso que elas aterravam na
# secção como autocolantes em vez de fazerem parte dela.
P="High-end 3D render, cinematic product visualisation, matte dielectric and polished glass materials, volumetric rim lighting in burnt orange, subtle wireframe and grid structure, crisp reflections, shallow depth of field, fine digital grain, dark cyber aesthetic. Abstract geometric forms only. NOT photography, NOT clay, NOT low-poly, NOT plastic toy, no text, no logos, no people, no UI screens."

node "$SKILL/scripts/kie.mjs" still "$P

Twelve identical featureless monoliths standing in a perfect repeating grid, receding into darkness, all exactly the same, cold and anonymous. Thin orange wireframe lines trace the grid floor beneath them. The void and the floor are one continuous VERY DARK WARM NEAR-BLACK, hex #100e0c, filling the frame edge to edge with no vignette and no lighter border. Composition weighted to the right, empty dark space on the left." out/c1-iguais.png --ar 16:9 2>&1 | tail -2

node "$SKILL/scripts/kie.mjs" still "$P

A single distinct crystalline form being constructed mid-air from floating glass panels and glowing orange wireframe edges, panels snapping into place around an emerging solid core. Cream and deep charcoal materials against SATURATED BURNT ORANGE, hex #F2762B, filling the entire frame edge to edge as a seamless void with no vignette and no lighter border. Object sits low-left, generous empty orange above." out/c2-medida.png --ar 16:9 2>&1 | tail -2

node "$SKILL/scripts/kie.mjs" still "$P

Six modular geometric volumes in cream and burnt orange, cubes and slabs, floating and interlocking in an exploded assembly arrangement, thin orange wireframe lines connecting them. The void is one continuous WARM CHARCOAL, hex #1a1613, filling the frame edge to edge with no vignette and no lighter border. Shot slightly from above, forms spread across the right two thirds." out/c3-modular.png --ar 16:9 2>&1 | tail -2

echo "GERACAO CYBER TERMINADA"; ls -la out/c*.png
