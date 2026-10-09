/** docs: docs/06-projetos.md — "Vídeo no telemóvel" */

/**
 * Grava um site a fazer scroll num ecrã de telemóvel, para o iPhone do caso de
 * estudo.
 *
 *   node scripts/gravar-telemovel.mjs <slug> <url> [--ecras 5] [--esconder "<css>"] [--tempo-real]
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
 * **`--tempo-real`** é para sites com motor de scroll próprio — um carril que
 * anda de lado, um scroll com inércia (o Café Preguiça). Esses animam com o
 * relógio, e frame a frame apanham-se a meio da transição. Neste modo a página
 * desce sozinha, em tempo real, e o Chrome vai mandando o que pinta
 * (`Page.startScreencast`). O texto sai um pouco menos nítido (JPEG), o
 * movimento sai certo. E em vez de voltar ao topo a correr — que atravessava o
 * carril num borrão —, o fim funde-se com o primeiro frame para o loop fechar.
 *
 * Usa o Google Chrome instalado (`channel: "chrome"`), o mesmo das capas.
 */

import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
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
/** Grava em tempo real em vez de frame a frame — ver o topo. */
const TEMPO_REAL = resto.includes("--tempo-real");

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

/**
 * Desce a página em tempo real e guarda o que o Chrome pinta. O screencast só
 * manda um frame quando o ecrã muda, por isso cada um leva a duração até ao
 * seguinte — é isso que vai para a lista do `ffmpeg` (`lista.txt`).
 */
async function gravarTempoReal(page, destino, descida) {
  const cdp = await page.context().newCDPSession(page);
  const recebidos = [];
  cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
    recebidos.push({ data, t: metadata.timestamp });
    cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", {
    format: "jpeg",
    quality: 92,
    maxWidth: VIEWPORT.width * 2,
    maxHeight: VIEWPORT.height * 2,
  });
  await page.waitForTimeout(1200);
  await page.evaluate(
    ({ destino, ms }) =>
      new Promise((ok) => {
        const suave = (t) =>
          t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
        const t0 = performance.now();
        const passo = (agora) => {
          const p = Math.min(1, (agora - t0) / ms);
          window.scrollTo(0, Math.round(destino * suave(p)));
          if (p < 1) requestAnimationFrame(passo);
          else ok();
        };
        requestAnimationFrame(passo);
      }),
    { destino, ms: descida * 1000 },
  );
  await page.waitForTimeout(1000);
  const fim = Date.now() / 1000;
  await cdp.send("Page.stopScreencast");

  const linhas = [];
  recebidos.forEach((r, i) => {
    const nome = `${String(i).padStart(5, "0")}.jpg`;
    writeFileSync(join(frames, nome), Buffer.from(r.data, "base64"));
    const ate = i + 1 < recebidos.length ? recebidos[i + 1].t : fim;
    linhas.push(`file '${nome}'`, `duration ${Math.max(0.001, ate - r.t).toFixed(4)}`);
  });
  // O demuxer de concat ignora a duração do último se ele não se repetir.
  linhas.push(linhas.at(-2));
  writeFileSync(join(frames, "lista.txt"), linhas.join("\n") + "\n");
  console.log(
    `${recebidos.length} frames em ${(fim - recebidos[0].t).toFixed(1)} s, desceu ${destino}px`,
  );
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

  if (TEMPO_REAL) {
    await gravarTempoReal(page, destino, descida);
  } else {
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
  }
} finally {
  await browser.close();
}

const mp4 = join(saida, `${slug}.mp4`);
const poster = join(saida, `${slug}.jpg`);
const primeiro = join(frames, TEMPO_REAL ? "00000.jpg" : "00000.png");
// 600px chegam: no caso de estudo o ecrã do iPhone mede ~280px CSS, 560 a 2x.
const ESCALA = "scale=600:-2:flags=lanczos";
const H264 = [
  "-c:v", "libx264", "-preset", "slow", "-crf", "28",
  "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
];
const ffmpeg = (args) =>
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });

if (TEMPO_REAL) {
  // Primeiro o corpo, a 30 fps certos; depois o fim funde-se em 0,6 s com o
  // primeiro frame, que é onde o vídeo recomeça.
  const corpo = join(frames, "corpo.mp4");
  ffmpeg([
    "-f", "concat", "-safe", "0", "-i", join(frames, "lista.txt"),
    "-vf", `fps=${FPS},${ESCALA},format=yuv420p`, ...H264, corpo,
  ]);
  const dur = Number(
    execFileSync("ffprobe", [
      "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", corpo,
    ]).toString(),
  );
  ffmpeg([
    "-i", corpo,
    "-loop", "1", "-framerate", String(FPS), "-t", "1", "-i", primeiro,
    "-filter_complex",
    `[1]${ESCALA},fps=${FPS},format=yuv420p,settb=AVTB[a];[0]settb=AVTB[c];` +
      `[c][a]xfade=transition=fade:duration=0.6:offset=${(dur - 0.6).toFixed(3)},` +
      // Os JPEG do screencast são full range; o H.264 para a web é tv range.
      "scale=out_range=tv,format=yuv420p",
    ...H264, mp4,
  ]);
} else {
  ffmpeg([
    "-framerate", String(FPS), "-i", join(frames, "%05d.png"),
    "-vf", ESCALA, ...H264, mp4,
  ]);
}
if (!existsSync(primeiro)) throw new Error("sem frames");
ffmpeg(["-i", primeiro, "-vf", ESCALA, "-q:v", "4", poster]);
rmSync(frames, { recursive: true, force: true });
console.log(`→ ${mp4}\n→ ${poster}`);
