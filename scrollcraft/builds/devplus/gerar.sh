#!/bin/bash
SKILL=/Users/goncalosilva/.claude/plugins/cache/nateherk/nateherk-design/0.3.0/skills/scroll-craft
# A chave vem do ambiente e NUNCA fica escrita aqui — este ficheiro é
# versionado. Põe `KIE_API_KEY=...` no `.env.local` (que o git ignora) e
# corre:  KIE_AI_API_KEY=$(grep '^KIE_API_KEY=' ../../../.env.local | cut -d= -f2) ./gerar.sh
: "${KIE_AI_API_KEY:?falta KIE_AI_API_KEY no ambiente}"

P="Studio product photography, single hard undiffused key light from upper left, crisp high-contrast cast shadow used as a graphic shape. Saturated seamless backdrop. Palette strictly warm charcoal #1a1613, burnt orange #F2762B, cream #f7f2ec. Punchy contrast, slight halation on speculars, fine sensor grain. Digital medium format, sharp throughout. NOT 3D render, NOT clay, NOT illustration, no digital glow, no plastic sheen, no text, no logos, no people."

node "$SKILL/scripts/kie.mjs" still "$P

A single vintage rotary dial telephone in burnt orange, handset off the hook and cord hanging taut, isolated on a deep warm charcoal seamless backdrop. The hard key light throws one long sharp shadow to the lower right that is as much of the composition as the object. Object sits in the left third, generous empty backdrop to the right." out/01-dependencia.png --ar 16:9 2>&1 | tail -2

node "$SKILL/scripts/kie.mjs" still "$P

One oversized cream physical push button or industrial toggle switch, caught mid-press, mounted on a small burnt orange plinth, on a saturated burnt orange seamless backdrop. Hard shadow rakes sharply left. The object is centred and close, filling the middle of the frame. Cream and orange only." out/02-comando.png --ar 16:9 2>&1 | tail -2

node "$SKILL/scripts/kie.mjs" still "$P

Six simple modular geometric blocks in cream and burnt orange, cubes and slabs, arranged in a loose grid on a warm charcoal seamless surface, some stacked and interlocking, one slightly apart. Overhead-ish hard light casting six parallel long shadows that read as a graphic pattern. Shot slightly from above." out/03-modular.png --ar 16:9 2>&1 | tail -2

node "$SKILL/scripts/kie.mjs" still "$P

A single cream card or thick paper rectangle standing upright on edge on a warm charcoal seamless surface, lit hard from the upper left so a long clean shadow stretches to the right. Nothing else in frame. Calm, resolved, a lot of empty backdrop above. Minimal." out/04-fecho.png --ar 16:9 2>&1 | tail -2

echo "GERACAO TERMINADA"
ls -la out/
