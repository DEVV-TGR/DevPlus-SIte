// docs: docs/06-projetos.md — "A Damira desenhada" · docs/02-cores-e-tipografia.md
/**
 * Os desenhos da Confeitaria Damira: a loja online, o painel do balcão e o
 * painel da gerência, sozinhos (SVG, para o caso de estudo) e juntos (a capa,
 * em JPG, para a galeria, o índice e o cartão social).
 *
 * A Damira ainda não está no ar e não se mostra fotografia nem captura dela —
 * mostra-se o que vai ter. As cores não se inventam: leem-se dos tokens do
 * `:root` de `app/globals.css` e convertem-se de OKLCH para hex aqui. Mudou um
 * token? Corre outra vez:
 *
 *   node scripts/desenhar-damira.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import sharp from "sharp";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const raiz = css.slice(css.indexOf(":root"), css.indexOf("}", css.indexOf(":root")));

/** OKLCH -> sRGB hex (Björn Ottosson). */
function hex(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return (
    "#" +
    [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ]
      .map((x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055))
      .map((x) => Math.round(Math.min(1, Math.max(0, x)) * 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

function token(nome) {
  const m = raiz.match(new RegExp(`--${nome}:\\s*oklch\\(([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\)`));
  if (!m) throw new Error(`Token em falta no :root: --${nome}`);
  return hex(+m[1], +m[2], +m[3]);
}

const c = Object.fromEntries(
  [
    "bg", "bg-deep", "surface", "surface-2", "border", "border-strong", "ink",
    "muted", "primary", "primary-ink", "accent", "paper", "paper-ink",
    "paper-muted", "copper", "peach", "mint",
  ].map((n) => [n, token(n)]),
);

const rect = (x, y, w, h, rx, fill, extra = "") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const traco = (x, y, w, h, fill) => rect(x, y, w, h, h / 2, fill);
const mais = (x, y, t, cor) =>
  `<path d="M${x - t} ${y}h${2 * t}M${x} ${y - t}v${2 * t}" stroke="${cor}" stroke-width="${t * 0.62}" stroke-linecap="round"/>`;

/* ---- Os doces, nas montras da loja ---------------------------------------- */
const bolo = (x, y) => `
  ${rect(x - 26, y - 4, 52, 24, 6, c.paper)}
  ${rect(x - 20, y - 22, 40, 20, 6, c.copper)}
  <path d="M${x - 20} ${y - 14}q5 7 10 0t10 0t10 0t10 0" stroke="${c.paper}" stroke-width="4" fill="none" stroke-linecap="round"/>
  <circle cx="${x}" cy="${y - 28}" r="6" fill="${c.primary}"/>`;
const croissant = (x, y) =>
  [-72, 72, -38, 38, 0]
    .map((g) => {
      const r = (g * Math.PI) / 180, px = x + 26 * Math.sin(r), py = y + 26 - 26 * Math.cos(r);
      const t = Math.abs(g) === 72 ? 0.62 : Math.abs(g) === 38 ? 0.84 : 1;
      return `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${13 * t}" ry="${15 * t}" transform="rotate(${g} ${px.toFixed(1)} ${py.toFixed(1)})" fill="${c.primary}" stroke="${c.copper}" stroke-width="2.5"/>`;
    })
    .join("");
const pao = (x, y) => `
  ${rect(x - 30, y - 14, 60, 30, 15, c.copper)}
  <path d="M${x - 14} ${y - 8}l-6 18M${x} ${y - 9}l-6 18M${x + 14} ${y - 8}l-6 18" stroke="${c.peach}" stroke-width="3.5" stroke-linecap="round"/>`;
const tarte = (x, y) => `
  <ellipse cx="${x}" cy="${y + 6}" rx="32" ry="12" fill="${c.copper}"/>
  <ellipse cx="${x}" cy="${y}" rx="28" ry="10" fill="${c.paper}"/>
  <circle cx="${x - 12}" cy="${y - 2}" r="4" fill="${c.primary}"/>
  <circle cx="${x + 2}" cy="${y + 2}" r="4" fill="${c.primary}"/>
  <circle cx="${x + 14}" cy="${y - 3}" r="4" fill="${c.primary}"/>`;

/* ---- A loja online, no telemóvel do cliente (300 × 600) ------------------- */
function telemovel() {
  const cartao = (x, y, fundo, doce) => `
    ${rect(x, y, 114, 128, 16, c.ink, `stroke="${c["paper-muted"]}" stroke-opacity=".18"`)}
    ${rect(x + 8, y + 8, 98, 66, 11, fundo)}
    ${doce(x + 57, y + 44)}
    ${traco(x + 12, y + 86, 64, 10, c["paper-ink"])}
    ${traco(x + 12, y + 104, 36, 9, c["paper-muted"])}
    <circle cx="${x + 92}" cy="${y + 106}" r="12" fill="${c.primary}"/>
    ${mais(x + 92, y + 106, 5, c["primary-ink"])}`;
  return `
    ${rect(0, 0, 300, 600, 46, c["surface-2"], `stroke="${c["border-strong"]}" stroke-width="3"`)}
    ${rect(14, 14, 272, 572, 34, c.paper)}
    ${rect(118, 26, 64, 14, 7, c["surface-2"])}
    <circle cx="46" cy="72" r="11" fill="${c.copper}"/>
    ${traco(64, 66, 70, 12, c["paper-ink"])}
    <path d="M226 66h36l-5 20h-26z" stroke="${c["paper-ink"]}" stroke-width="3" stroke-linejoin="round" fill="none"/>
    <path d="M230 66q14 -22 28 0M238 72v8M244 72v8M250 72v8" stroke="${c["paper-ink"]}" stroke-width="3" stroke-linecap="round" fill="none"/>
    <circle cx="263" cy="58" r="9" fill="${c.primary}"/>
    ${rect(30, 102, 240, 112, 20, c.peach)}
    ${traco(48, 128, 82, 13, c["paper-ink"])}
    ${traco(48, 150, 56, 10, c["paper-muted"])}
    ${rect(48, 174, 70, 24, 12, c.primary)}
    ${bolo(208, 178)}
    ${rect(30, 230, 62, 24, 12, c["paper-ink"])}
    ${[98, 166, 234].map((x) => rect(x, 230, x === 234 ? 36 : 62, 24, 12, "none", `stroke="${c["paper-muted"]}" stroke-width="2"`)).join("")}
    ${cartao(30, 270, c.mint, croissant)}
    ${cartao(156, 270, c.peach, tarte)}
    ${cartao(30, 408, c.peach, pao)}
    ${cartao(156, 408, c.mint, bolo)}
    ${rect(30, 538, 240, 34, 17, c.primary)}
    ${traco(110, 549, 80, 12, c["primary-ink"])}`;
}

/* ---- O painel do balcão, no tablet (760 × 540) ---------------------------- */
function tablet() {
  const pedido = (x, y, destaque, fundos) => `
    ${rect(x, y, 200, 92, 14, c["surface-2"], `stroke="${destaque ? c.primary : c.border}" stroke-width="${destaque ? 3 : 1.5}"`)}
    ${traco(x + 16, y + 18, 104, 12, c.ink)}
    ${traco(x + 16, y + 40, 66, 10, c.muted)}
    ${fundos.map((f, i) => rect(x + 16 + i * 26, y + 60, 20, 20, 5, f)).join("")}
    ${rect(x + 140, y + 14, 46, 22, 11, "none", `stroke="${c["border-strong"]}" stroke-width="2"`)}`;
  const coluna = (x, cor, n, destaque = -1) => `
    <circle cx="${x + 8}" cy="102" r="7" fill="${cor}"/>
    ${traco(x + 24, 96, 90, 12, c.muted)}
    ${Array.from({ length: n }, (_, i) =>
      pedido(x, 126 + i * 106, i === destaque, [[c.peach, c.mint, c.copper], [c.mint, c.peach], [c.copper, c.peach, c.mint, c.mint]][i % 3]),
    ).join("")}`;
  return `
    ${rect(0, 0, 760, 540, 38, c["surface-2"], `stroke="${c["border-strong"]}" stroke-width="3"`)}
    ${rect(22, 22, 716, 496, 22, c.bg)}
    ${traco(52, 50, 150, 16, c.ink)}
    ${traco(590, 50, 104, 16, c.muted)}
    <path d="M556 66v-8a10 10 0 0 1 20 0v8l3 4h-26z" fill="${c.primary}"/>
    ${coluna(52, c.primary, 3, 0)}
    ${coluna(282, c.peach, 2)}
    ${coluna(512, c.accent, 2)}`;
}

/* ---- O painel da gerência, no portátil (900 × 560) ------------------------ */
function portatil() {
  const ox = 80, oy = 20; // origem do ecrã
  const kpi = (x, cor, subida) => `
    ${rect(ox + x, oy + 22, 176, 90, 14, c.surface)}
    ${traco(ox + x + 18, oy + 42, 72, 10, c.muted)}
    ${traco(ox + x + 18, oy + 64, 92, 22, c.ink)}
    <polyline points="${[0, 1, 2, 3, 4].map((i) => `${ox + x + 122 + i * 10},${oy + 88 - (subida[i] ?? 0)}`).join(" ")}" fill="none" stroke="${cor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  const barras = [58, 84, 70, 112, 96, 138, 124]
    .map((h, i) => rect(ox + 200 + i * 44, oy + 312 - h, 26, h, 6, i === 5 ? c.primary : c.peach, i === 5 ? "" : `fill-opacity=".55"`))
    .join("");
  const circ = 2 * Math.PI * 50;
  const arco = (cor, ini, fra) =>
    `<circle cx="${ox + 648}" cy="${oy + 232}" r="50" fill="none" stroke="${cor}" stroke-width="18" stroke-dasharray="${circ * fra} ${circ}" stroke-dashoffset="${-circ * ini}" transform="rotate(-90 ${ox + 648} ${oy + 232})"/>`;
  const linha = (y, cor) => `
    ${rect(ox + 200, oy + y, 22, 22, 6, cor)}
    ${traco(ox + 236, oy + y + 5, 150, 12, c.ink)}
    ${traco(ox + 410, oy + y + 6, 90, 10, c.muted)}
    ${rect(ox + 640, oy + y + 1, 62, 20, 10, "none", `stroke="${cor === c.mint ? c.accent : c.primary}" stroke-width="2"`)}`;
  return `
    ${rect(60, 0, 780, 520, 26, c["surface-2"], `stroke="${c["border-strong"]}" stroke-width="3"`)}
    ${rect(ox, oy, 740, 476, 14, c.bg)}
    ${rect(ox, oy, 168, 476, 14, c.surface)}
    <circle cx="${ox + 34}" cy="${oy + 38}" r="12" fill="${c.copper}"/>
    ${traco(ox + 54, oy + 32, 74, 12, c.ink)}
    ${rect(ox + 16, oy + 78, 136, 32, 10, c.primary, `fill-opacity=".18"`)}
    ${traco(ox + 30, oy + 88, 80, 12, c.ink)}
    ${[128, 162, 196, 230].map((y) => traco(ox + 30, oy + y, 70 + (y % 3) * 8, 12, c.muted)).join("")}
    ${kpi(186, c.accent, [6, 10, 8, 16, 22])}
    ${kpi(374, c.primary, [4, 12, 10, 14, 24])}
    ${kpi(562, c.accent, [10, 6, 14, 12, 18])}
    ${rect(ox + 186, oy + 128, 362, 200, 14, c.surface)}
    ${barras}
    ${rect(ox + 200, oy + 312, 334, 2, 1, c.border)}
    ${rect(ox + 562, oy + 128, 176 - 14, 200, 14, c.surface)}
    <circle cx="${ox + 648}" cy="${oy + 232}" r="50" fill="none" stroke="${c.border}" stroke-width="18"/>
    ${arco(c.primary, 0, 0.46)}${arco(c.peach, 0.48, 0.3)}${arco(c.mint, 0.8, 0.18)}
    ${rect(ox + 186, oy + 344, 552 - 14, 116, 14, c.surface)}
    ${linha(358, c.peach)}${linha(392, c.mint)}${linha(426, c.peach)}
    ${rect(0, 520, 900, 26, 13, c["surface-2"], `stroke="${c["border-strong"]}" stroke-width="3"`)}
    ${rect(380, 520, 140, 9, 4.5, c.border)}`;
}

/* ---- Saída ---------------------------------------------------------------- */
const svg = (w, h, corpo, fundo = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${fundo}${corpo}</svg>\n`;
const sombra = (cx, cy, rx) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * 0.07}" fill="${c["bg-deep"]}" opacity=".55" filter="url(#desfoque)"/>`;
const defs = `<defs><filter id="desfoque" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="14"/></filter></defs>`;

const destino = new URL("../public/projetos/damira/", import.meta.url);
mkdirSync(destino, { recursive: true });
const desenhos = {
  loja: svg(380, 680, `${defs}${sombra(190, 650, 130)}<g transform="translate(40 30)">${telemovel()}</g>`),
  balcao: svg(840, 620, `${defs}${sombra(420, 590, 340)}<g transform="translate(40 30)">${tablet()}</g>`),
  gerencia: svg(980, 640, `${defs}${sombra(490, 600, 420)}<g transform="translate(40 30)">${portatil()}</g>`),
};
for (const [nome, conteudo] of Object.entries(desenhos)) {
  writeFileSync(new URL(`${nome}.svg`, destino), conteudo);
}

/* A capa: as três peças juntas, 16:10, sobre o ground da marca. */
const W = 1600, H = 1000;
const fundo = `
  <defs>
    <radialGradient id="luz" cx="68%" cy="34%" r="60%"><stop offset="0" stop-color="${c.primary}" stop-opacity=".22"/><stop offset="1" stop-color="${c.primary}" stop-opacity="0"/></radialGradient>
    <radialGradient id="luz2" cx="14%" cy="86%" r="50%"><stop offset="0" stop-color="${c.accent}" stop-opacity=".10"/><stop offset="1" stop-color="${c.accent}" stop-opacity="0"/></radialGradient>
    <filter id="desfoque" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="16"/></filter>
  </defs>
  ${rect(0, 0, W, H, 0, c["bg-deep"])}
  ${rect(0, 0, W, H, 0, "url(#luz)")}
  ${rect(0, 0, W, H, 0, "url(#luz2)")}
  ${mais(170, 170, 22, c.primary)}${mais(1470, 120, 12, c["paper-muted"])}${mais(1556, 318, 16, c.primary)}${mais(340, 340, 10, c["paper-muted"])}`;
const capa = svg(
  W,
  H,
  `${sombra(1010, 742, 470)}<g transform="translate(560 170)">${portatil()}</g>
   ${sombra(420, 918, 280)}<g transform="translate(120 470) scale(.78)">${tablet()}</g>
   ${sombra(1372, 952, 130)}<g transform="translate(1240 400) scale(.9)">${telemovel()}</g>`,
  fundo,
);
await sharp(Buffer.from(capa))
  .resize(1728)
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(new URL("../public/capas/damira-20261019.jpg", import.meta.url).pathname);

console.log("Desenhos da Damira gerados:", Object.keys(desenhos).join(", "), "+ capa");
console.log("primary =", c.primary, "(deve bater com BRAND_HEX em lib/brand.ts)");
