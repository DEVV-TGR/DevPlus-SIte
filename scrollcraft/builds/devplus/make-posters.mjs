// Posters provisórios do mundo DevPlus. Substituídos por frames reais
// extraídos dos mp4 encodados assim que houver créditos kie.ai.
// Paleta: docs/02-cores-e-tipografia.md. Não inventar cores.
import { mkdirSync, writeFileSync } from 'node:fs';

const BG = '#1a1613', INK = '#f7f2ec', MUTED = '#c8bdb0', ORANGE = '#F2762B';
const W = 1600, H = 900;

// Oito paragens. `t` é a posição na viagem, 0 a 1: a grelha aperta,
// a estrutura levanta, o laranja só chega a sério no pico.
const STOPS = [
  { id: 1, key: 'papel',     label: 'Papel',     grid: 34, rot: -0.6, lift: 0,    accent: 0.04 },
  { id: 2, key: 'grelha',    label: 'Grelha',    grid: 46, rot: -0.2, lift: 0.06, accent: 0.08 },
  { id: 3, key: 'estrutura', label: 'Estrutura', grid: 58, rot: 0,    lift: 0.28, accent: 0.14 },
  { id: 4, key: 'travessia', label: 'Travessia', grid: 72, rot: 0,    lift: 0.52, accent: 0.22 },
  { id: 5, key: 'materia',   label: 'Matéria',   grid: 64, rot: 0,    lift: 0.68, accent: 0.55 },
  { id: 6, key: 'ecra',      label: 'Ecrã',      grid: 48, rot: 0,    lift: 0.82, accent: 0.9  },
  { id: 7, key: 'muitos',    label: 'Muitos',    grid: 30, rot: 0,    lift: 0.9,  accent: 0.5  },
  { id: 8, key: 'mais',      label: 'O mais',    grid: 20, rot: 0,    lift: 1,    accent: 1    },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function poster(s, i) {
  const t = i / (STOPS.length - 1);
  const horizon = H * (0.72 - s.lift * 0.34);
  const p = [];

  p.push(`<rect width="${W}" height="${H}" fill="${BG}"/>`);

  // A grelha do chão, em perspetiva. É o mundo inteiro nas primeiras paragens.
  const step = s.grid;
  for (let x = -W; x < W * 2; x += step) {
    const bx = x, tx = W / 2 + (x - W / 2) * 0.18;
    p.push(`<line x1="${bx.toFixed(1)}" y1="${H}" x2="${tx.toFixed(1)}" y2="${horizon.toFixed(1)}" stroke="${MUTED}" stroke-opacity="${(0.30 - s.lift * 0.14).toFixed(3)}" stroke-width="1"/>`);
  }
  for (let k = 0; k < 26; k++) {
    const f = k / 26, y = horizon + (H - horizon) * (f * f);
    p.push(`<line x1="0" y1="${y.toFixed(1)}" x2="${W}" y2="${y.toFixed(1)}" stroke="${MUTED}" stroke-opacity="${(0.10 + f * 0.34 - s.lift * 0.12).toFixed(3)}" stroke-width="1"/>`);
  }

  // O esboço. Só nas duas primeiras paragens, e é o que lá está em vez de
  // arquitetura: traço solto que ainda não alinhou.
  if (s.lift < 0.1) {
    for (let k = 0; k < 14; k++) {
      const sd = Math.abs(Math.sin((k + 1) * 12.9898 * s.id));
      const x = W * (0.06 + sd * 0.82), y = horizon + (H - horizon) * (0.1 + ((sd * 7) % 1) * 0.8);
      const w = 60 + sd * 280, h = 20 + ((sd * 13) % 1) * 90;
      p.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="none" stroke="${INK}" stroke-opacity="${(0.22 + (1 - s.lift) * 0.2).toFixed(3)}" stroke-width="1.5" transform="rotate(${(s.rot * sd * 6).toFixed(2)} ${(x + w / 2).toFixed(1)} ${(y + h / 2).toFixed(1)})"/>`);
    }
    for (let k = 0; k < 5; k++) {
      const yy = H * (0.16 + k * 0.055);
      p.push(`<rect x="${(W * 0.07).toFixed(1)}" y="${yy.toFixed(1)}" width="${(W * (0.1 + (k % 3) * 0.09)).toFixed(1)}" height="7" fill="${MUTED}" fill-opacity="0.3"/>`);
    }
  }

  // A estrutura: wireframes que se erguem à medida que a viagem sobe.
  const blocks = 9;
  for (let b = 0; b < blocks; b++) {
    const bw = W / blocks, bx = b * bw;
    const seed = Math.abs(Math.sin((b + 1) * (s.id * 1.7)));
    const bh = (H - horizon) * (0.15 + seed * 0.95) * s.lift;
    if (bh < 4) continue;
    const by = horizon + (H - horizon) * 0.34 - bh;
    const lit = seed > 0.72 && s.accent > 0.4;
    p.push(`<rect x="${(bx + 6).toFixed(1)}" y="${by.toFixed(1)}" width="${(bw - 12).toFixed(1)}" height="${bh.toFixed(1)}" fill="${lit ? ORANGE : 'none'}" fill-opacity="${lit ? (s.accent * 0.16).toFixed(3) : 0}" stroke="${lit ? ORANGE : INK}" stroke-opacity="${lit ? 0.85 : 0.3}" stroke-width="${lit ? 2 : 1}"/>`);
    // janelas: só aparecem quando o mundo ganha matéria
    if (s.accent > 0.35) {
      const rows = Math.max(1, Math.round(bh / 46));
      for (let r = 0; r < rows; r++) {
        const wy = by + 12 + r * 46;
        if (wy > by + bh - 14) break;
        const on = Math.abs(Math.sin((b * 13 + r * 7) * s.id)) > 0.55;
        p.push(`<rect x="${(bx + 16).toFixed(1)}" y="${wy.toFixed(1)}" width="${(bw - 32).toFixed(1)}" height="14" fill="${on ? ORANGE : INK}" fill-opacity="${on ? (s.accent * 0.7).toFixed(3) : 0.07}"/>`);
      }
    }
  }

  // O horizonte. Uma só linha, e é a mais forte do quadro.
  p.push(`<line x1="0" y1="${horizon.toFixed(1)}" x2="${W}" y2="${horizon.toFixed(1)}" stroke="${INK}" stroke-opacity="0.5" stroke-width="1.5"/>`);

  // O "+" da marca, presente desde a primeira paragem, a ganhar corpo.
  const ps = 60 + s.accent * 150, pcx = W * 0.78, pcy = horizon - ps * 0.7;
  const arm = ps / 2, th = ps * 0.26;
  p.push(`<g opacity="${(0.16 + s.accent * 0.84).toFixed(3)}"><rect x="${(pcx - th / 2).toFixed(1)}" y="${(pcy - arm).toFixed(1)}" width="${th.toFixed(1)}" height="${ps.toFixed(1)}" fill="${ORANGE}"/><rect x="${(pcx - arm).toFixed(1)}" y="${(pcy - th / 2).toFixed(1)}" width="${ps.toFixed(1)}" height="${th.toFixed(1)}" fill="${ORANGE}"/></g>`);

  // Marcações técnicas. Brutalista: a página mostra a sua própria régua.
  p.push(`<g font-family="ui-monospace, monospace" font-size="17" fill="${MUTED}" fill-opacity="0.55" letter-spacing="0.14em">`);
  p.push(`<text x="40" y="52">${String(s.id).padStart(2, '0')} / 08</text>`);
  p.push(`<text x="40" y="${H - 40}">${esc(s.label.toUpperCase())}</text>`);
  p.push(`<text x="${W - 40}" y="${H - 40}" text-anchor="end">T ${t.toFixed(3)}</text>`);
  p.push(`</g>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${p.join('')}</svg>`;
}

const dir = new URL('./assets/', import.meta.url);
mkdirSync(dir, { recursive: true });
STOPS.forEach((s, i) => {
  writeFileSync(new URL(`p${s.id}.svg`, dir), poster(s, i));
});
console.log(`${STOPS.length} posters provisórios em assets/`);
