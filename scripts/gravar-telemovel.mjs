/** docs: docs/06-projetos.md — "Vídeo no telemóvel" */

/**
 * Grava um site a fazer scroll num ecrã de telemóvel, para o iPhone do caso de
 * estudo.
 *
 *   node scripts/gravar-telemovel.mjs <slug> <url> [--ecras 5] [--esconder "<css>"]
 *
 * Sai `public/telemovel/<slug>.mp4` e `public/telemovel/<slug>.jpg` (o poster).
 *
 * **Não usa o `recordVideo` do Playwright.** Esse grava em VP8 a um débito
 * baixo e o texto sai borrado — num ecrã de telemóvel, onde quase tudo é texto,
 * isso é o vídeo inteiro. Aqui o scroll é posto à mão frame a frame e cada frame
 * é um print a 2x; o `ffmpeg` junta-os depois. Demora um minuto em vez de dez
 * segundos, e o resultado lê-se.
 *
 * O preço é o tempo das animações: entre dois prints passa mais tempo real do
 * que um frame, e uma transição CSS que corre durante o scroll fica mais
 * rápida no vídeo. Por isso o site é percorrido uma vez **antes** de gravar —
 * as imagens preguiçosas carregam e as entradas no scroll já aconteceram.
 *
 * Usa o Google Chrome instalado (`channel: "chrome"`), o mesmo das capas.
 */

import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const [slug, url, ...resto] = process.argv.slice(2);
if (!slug || !url) {
  console.error(
    'Uso: node scripts/gravar-telemovel.mjs <slug> <url> [--ecras 5] [--esconder "<css>"]',
  );
  process.exit(1);
}

function opcao(nome, defeito) {
  const i = resto.indexOf(`--${nome}`);
  return i === -1 ? defeito : resto[i + 1];
}

/** Quantos ecrãs desce, no máximo. Uma página de 20 ecrãs não cabe em 12 s. */
const ECRAS = Number(opcao("ecras", "5"));
/** CSS a esconder durante a gravação (faixas de teste, pop-ups). */
const ESCONDER = opcao("esconder", "");

const FPS = 30;
/** O tamanho de um iPhone 15/16 em pontos. O ecrã do `IPhone.tsx` tem esta proporção. */
const VIEWPORT = { width: 390, height: 844 };
/** Velocidade da descida, em px CSS por segundo — a de um polegar sem pressa. */
const VELOCIDADE = 520;

const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1";

const saida = resolve("public/telemovel");
mkdirSync(saida, { recursive: true });
const frames = mkdtempSync(join(tmpdir(), `telemovel-${slug}-`));

/**
 * Um aviso de cookies ou um pop-up de newsletter a tapar meio ecrã fazem o vídeo
 * de outra coisa. Aceita os cookies e fecha o que tiver cara de diálogo.
 */
async function limpar(page) {
  const botoes = [
    /^(aceitar|aceito|concordo|accept|ok)\b/i,
    /^(fechar|close|dispensar|agora não|não, obrigad|×|✕)/i,
  ];
  for (const name of botoes) {
    for (const b of await page.getByRole("button", { name }).all()) {
      if (await b.isVisible().catch(() => false)) {
        await b.click().catch(() => {});
        await page.waitForTimeout(500);
      }
    }
  }
}

const suave = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: UA,
    locale: "pt-PT",
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 });
  // Cortinas de entrada e o primeiro reveal.
  await page.waitForTimeout(3000);

  await page.addStyleTag({
    content: `html{scroll-behavior:auto!important}::-webkit-scrollbar{display:none}${
      ESCONDER ? `${ESCONDER}{display:none!important}` : ""
    }`,
  });

  await limpar(page);

  const alturaTotal = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight,
  );
  const destino = Math.max(0, Math.min(alturaTotal, ECRAS * VIEWPORT.height));

  // A volta de reconhecimento: imagens preguiçosas e entradas no scroll.
  for (let y = 0; y <= destino; y += VIEWPORT.height / 2) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(350);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);
  // Há pop-ups que só aparecem a meio da página ou ao fim de uns segundos.
  await limpar(page);

  const descida = Math.min(10, Math.max(5, destino / VELOCIDADE));
  /** [duração em s, de, para] — pausa, descida, pausa, subida, pausa. */
  const troços = [
    [1.2, 0, 0],
    [descida, 0, destino],
    [0.8, destino, destino],
    [1.6, destino, 0],
    [0.4, 0, 0],
  ];

  let n = 0;
  for (const [duracao, de, para] of troços) {
    const total = Math.round(duracao * FPS);
    for (let i = 0; i < total; i++) {
      const y = de + (para - de) * suave(i / Math.max(1, total - 1));
      // Dois frames de animação para quem anima com o scroll (sticky, GSAP,
      // Lenis) acompanhar antes do print.
      await page.evaluate(
        (v) =>
          new Promise((ok) => {
            window.scrollTo(0, v);
            requestAnimationFrame(() => requestAnimationFrame(ok));
          }),
        Math.round(y),
      );
      await page.screenshot({
        path: join(frames, `${String(n++).padStart(5, "0")}.png`),
      });
    }
  }
  console.log(`${n} frames (${(n / FPS).toFixed(1)} s), desceu ${destino}px`);
} finally {
  await browser.close();
}

const mp4 = join(saida, `${slug}.mp4`);
const poster = join(saida, `${slug}.jpg`);
execFileSync(
  "ffmpeg",
  [
    "-y", "-loglevel", "error",
    "-framerate", String(FPS),
    "-i", join(frames, "%05d.png"),
    // 600px chegam: no caso de estudo o ecrã do iPhone mede ~280px CSS, 560 a 2x.
    "-vf", "scale=600:-2:flags=lanczos",
    "-c:v", "libx264", "-preset", "slow", "-crf", "28",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
    mp4,
  ],
  { stdio: "inherit" },
);
execFileSync(
  "ffmpeg",
  ["-y", "-loglevel", "error", "-i", join(frames, "00000.png"), "-vf", "scale=600:-2:flags=lanczos", "-q:v", "4", poster],
  { stdio: "inherit" },
);
rmSync(frames, { recursive: true, force: true });
console.log(`→ ${mp4}\n→ ${poster}`);
