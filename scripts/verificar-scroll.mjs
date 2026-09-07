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
 * E, no fim, duas coisas que só se veem comparando posições:
 *   · se o gesto do `Cruz` **anda até ao fim da página**. Chegou a estar preso
 *     no último posto a partir dos ~50% — metade da página com o "+" imóvel —
 *     e nenhuma verificação de uma posição só apanhava isso, porque em cada
 *     frame estava tudo bem
 *   · se cada `[data-scroll-item]` **chega a ver-se** em alguma posição
 *
 * A diferença entre `[data-reveal-item]` e `[data-scroll-item]` é essa: o
 * primeiro entra de uma vez e estar invisível dentro do ecrã é avaria; o
 * segundo chega ao longo do percurso, e num frame a meio é suposto ainda não
 * ter chegado. O que se lhe exige é que chegue.
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
    /* O gesto do "+" vive em variáveis CSS pintadas pelo ScrollTrigger. Duas
       posições com o mesmo par são duas posições em que ele não se mexeu. */
    const chegam = [...document.querySelectorAll("[data-scroll-item]")].map((el) =>
      parseFloat(getComputedStyle(el).opacity),
    );
    const svg = document.querySelector("[data-cruz] svg");
    const cs = svg && getComputedStyle(svg);
    return {
      falhadas,
      presos,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      largura: document.documentElement.scrollWidth,
      chegam,
      cruz: cs ? `${cs.getPropertyValue("--cs").trim()}|${cs.getPropertyValue("--cx").trim()}` : null,
    };
  });

  await page.screenshot({ path: `${destino}/${String(i).padStart(2, "0")}.png` });
  linhas.push({ i, y, ...estado });
}

await browser.close();
writeFileSync(`${destino}/relatorio.json`, JSON.stringify(linhas, null, 1));

/** Índices dos `[data-scroll-item]` que nunca se chegaram a ver. */
const nuncaChegaram = (linhas[0]?.chegam ?? [])
  .map((_, i) => i)
  .filter((i) => !linhas.some((l) => (l.chegam[i] ?? 0) >= 0.9));

/**
 * Quantas posições finais ficaram com o gesto exatamente no mesmo sítio. Com
 * movimento reduzido o `Cruz` é estático por decisão — ver `docs/04` — e aqui
 * não há nada a medir.
 */
let gestoParado = 0;
if (!reduzido && linhas.at(-1)?.cruz) {
  const ultimo = linhas.at(-1).cruz;
  while (gestoParado < linhas.length && linhas.at(-1 - gestoParado)?.cruz === ultimo) gestoParado++;
}
/* Duas posições seguidas iguais no fim ainda podem ser o gesto a assentar; três
   são 1/5 da página com o "+" pregado. */
const gestoPreso = gestoParado >= 3;

const comFalha = linhas.filter((l) => l.falhadas.length);
const comPresos = linhas.filter((l) => l.presos.length);
const comOverflow = linhas.filter((l) => l.overflow);

console.log(`\n${destino}  (${movel ? "390px" : "1440px"}${reduzido ? ", movimento reduzido" : ""})`);
console.log(`  imagens falhadas .... ${comFalha.length ? comFalha.map((l) => l.i).join(", ") : "nenhuma"}`);
console.log(`  presos invisíveis ... ${comPresos.length ? comPresos.map((l) => `${l.i}:${l.presos[0]}`).join(" | ") : "nenhum"}`);
console.log(`  overflow horizontal . ${comOverflow.length ? comOverflow.map((l) => `${l.i} (${l.largura}px)`).join(", ") : "nenhum"}`);
console.log(`  erros de consola .... ${erros.length ? erros.slice(0, 3).join(" | ") : "nenhum"}`);
console.log(
  `  nunca chegaram ...... ${nuncaChegaram.length ? nuncaChegaram.map((i) => `#${i + 1}`).join(", ") : "nenhum"}`,
);
console.log(
  `  gesto do "+" ....... ${
    reduzido || !linhas.at(-1)?.cruz
      ? "não se aplica"
      : gestoPreso
        ? `PRESO nas últimas ${gestoParado} posições (${linhas.at(-gestoParado).y}px em diante)`
        : "anda até ao fim"
  }`,
);
console.log(`  ${PASSOS} capturas em ${destino}/\n`);
process.exit(
  comFalha.length ||
    comPresos.length ||
    comOverflow.length ||
    erros.length ||
    gestoPreso ||
    nuncaChegaram.length
    ? 1
    : 0,
);
