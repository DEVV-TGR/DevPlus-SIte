/**
 * Percorre uma página do site e reporta o que só se vê a meio do scroll.
 *
 * Existe porque o harness da skill `scroll-craft` espera pelo motor dela
 * (`html.sc-ready`), que o site não usa — e porque uma página com movimento
 * não tem um estado só: cada posição de scroll é um frame diferente, e as
 * avarias vivem entre os dois que se olhou.
 *
 * O que verifica, por posição:
 *   · imagens que não carregaram
 *   · elementos que ficaram presos invisíveis (uma animação que não completou)
 *   · overflow horizontal
 *   · erros de consola
 *
 * Uso:  node scripts/verificar-scroll.mjs [url] [--mobile] [--reduzido]
 *
 * O `playwright-core` não é dependência do site: resolve-se do protótipo, que
 * já o tem. Instalar um browser headless nas dependências de um site estático
 * era peso que ninguém em produção usa.
 */
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";

const url = process.argv[2]?.startsWith("http") ? process.argv[2] : "http://localhost:3000";
const movel = process.argv.includes("--mobile");
const reduzido = process.argv.includes("--reduzido");
const PASSOS = 14;
const destino = `lab/next${movel ? "-m" : ""}${reduzido ? "-r" : ""}`;

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({
  viewport: movel ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: reduzido ? "reduce" : "no-preference",
});

const erros = [];
page.on("console", (m) => m.type() === "error" && erros.push(m.text()));
page.on("pageerror", (e) => erros.push(String(e)));

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

mkdirSync(destino, { recursive: true });
const linhas = [];
const altura = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);

for (let i = 0; i < PASSOS; i++) {
  const y = Math.round((altura * i) / (PASSOS - 1));
  await page.evaluate((v) => window.scrollTo(0, v), y);
  /* Duas esperas: uma para o scroll assentar, outra para o GSAP acabar o que
     esse scroll disparou. Um screenshot tirado entre as duas apanha a página
     a meio de uma animação e reporta problemas que não existem. */
  await page.waitForTimeout(650);

  const estado = await page.evaluate(() => {
    const falhadas = [...document.images]
      .filter((im) => im.complete && im.naturalWidth === 0)
      .map((im) => im.currentSrc || im.src);
    const presos = [...document.querySelectorAll("[data-reveal],[data-reveal-item]")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        const dentro = r.top < innerHeight && r.bottom > 0 && r.width > 0;
        return dentro && parseFloat(getComputedStyle(el).opacity) < 0.9;
      })
      .map((el) => (el.textContent || "").replace(/\s+/g, " ").slice(0, 40));
    return {
      falhadas,
      presos,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      largura: document.documentElement.scrollWidth,
    };
  });

  await page.screenshot({ path: `${destino}/${String(i).padStart(2, "0")}.png` });
  linhas.push({ i, y, ...estado });
}

await browser.close();
writeFileSync(`${destino}/relatorio.json`, JSON.stringify(linhas, null, 1));

const comFalha = linhas.filter((l) => l.falhadas.length);
const comPresos = linhas.filter((l) => l.presos.length);
const comOverflow = linhas.filter((l) => l.overflow);

console.log(`\n${destino}  (${movel ? "390px" : "1440px"}${reduzido ? ", movimento reduzido" : ""})`);
console.log(`  imagens falhadas .... ${comFalha.length ? comFalha.map((l) => l.i).join(", ") : "nenhuma"}`);
console.log(`  presos invisíveis ... ${comPresos.length ? comPresos.map((l) => `${l.i}:${l.presos[0]}`).join(" | ") : "nenhum"}`);
console.log(`  overflow horizontal . ${comOverflow.length ? comOverflow.map((l) => `${l.i} (${l.largura}px)`).join(", ") : "nenhum"}`);
console.log(`  erros de consola .... ${erros.length ? erros.slice(0, 3).join(" | ") : "nenhum"}`);
console.log(`  ${PASSOS} capturas em ${destino}/\n`);
process.exit(comFalha.length || comPresos.length || comOverflow.length || erros.length ? 1 : 0);
