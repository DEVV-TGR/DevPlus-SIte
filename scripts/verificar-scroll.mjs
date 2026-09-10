/**
 * Percorre uma página do site e reporta o que só se vê a meio do scroll.
 *
 * Existe porque o harness da skill `scroll-craft` espera pelo motor dela
 * (`html.sc-ready`), que o site não usa — e porque uma página com movimento
 * não tem um estado só: cada posição de scroll é um frame diferente, e as
 * avarias vivem entre os dois que se olhou.
 *
 * Antes de tudo verifica a coisa mais básica de todas: se a **roda do rato**
 * mexe a página. Parece absurdo ter de o testar, e não é — o Lenis corre com
 * `autoRaf: false` e é o ticker do GSAP que o alimenta; quando essa ligação se
 * partiu, ele continuou a travar o scroll nativo sem aplicar o seu, e a página
 * ficou imóvel à roda. Todo o resto deste script usa `window.scrollTo`, que é
 * nativo e passa ao lado do problema.
 *
 * Em `--mobile` verifica ainda quatro coisas que só são defeito num ecrã
 * estreito, e que passaram todas despercebidas à primeira ronda:
 *   · **ecrãs de scroll** — a homepage ia em 15,6 contra os 9 do site de
 *     referência medido no mesmo iPhone
 *   · **alvos de toque** com menos de 44px
 *   · **texto abaixo de 14px**
 *   · **o "+" por cima de texto** — em `vw`, os postos de desktop punham-no
 *     em cima dos telefones do `/contacto`
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

await page.mouse.move(200, 300);
await page.mouse.wheel(0, 600);
await page.waitForTimeout(700);
const rodaAndou = await page.evaluate(() => window.scrollY);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);

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

  const estado = await page.evaluate((movel) => {
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
    /* Só em telemóvel: o que se toca tem de ter 44px, o que se lê tem de ter
       14px, e o gesto não pode passar por cima de nenhum dos dois. */
    const toque = movel
      ? [...document.querySelectorAll('a,button,[role="button"],input,textarea,select')]
          .filter((el) => {
            /* A armadilha do formulário é `sr-only` e tem dimensão: ninguém lhe
               toca, nem de dedo nem de leitor de ecrã. Ver `ContactForm`. */
            if (el.closest("[aria-hidden='true'],.sr-only") || el.tabIndex < 0) return false;
            /* Um link **dentro de uma frase** não se aumenta: dar-lhe 44px de
               altura abria buracos entre as linhas do parágrafo. É a exceção
               que a própria norma faz (WCAG 2.5.8, "inline"). */
            const pai = el.parentElement;
            if (el.tagName === "A" && pai && /^(P|LI|DD|SPAN|H1|H2|H3)$/.test(pai.tagName) &&
                (pai.textContent || "").trim().length > (el.textContent || "").trim().length + 8) return false;
            const r = el.getBoundingClientRect();
            return r.width > 1 && r.height > 1 && r.top < innerHeight && r.bottom > 0 && (r.height < 44 || r.width < 44);
          })
          .map((el) => `${(el.textContent || el.getAttribute("aria-label") || el.tagName).replace(/\s+/g, " ").trim().slice(0, 18)} ${Math.round(el.getBoundingClientRect().width)}×${Math.round(el.getBoundingClientRect().height)}`)
      : [];
    const miudo = movel
      ? [...document.querySelectorAll("p,li,span,dd,dt,a,label,summary")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return el.textContent?.trim() && r.width > 0 && r.top < innerHeight && r.bottom > 0 &&
              parseFloat(getComputedStyle(el).fontSize) < 14;
          })
          .map((el) => `${Math.round(parseFloat(getComputedStyle(el).fontSize))}px:${(el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 18)}`)
      : [];
    /* O "+" é decorativo, mas é opaco: onde ele passa por cima de uma linha de
       texto, essa linha deixa de se ler. Compara-se o retângulo do desenho, e
       não o da camada, que é o ecrã inteiro. */
    /* o mesmo `svg` de cima: o gesto e a verificação de sobreposição olham
       para o mesmo desenho. */
    const tapados = [];
    if (movel && svg) {
      const c = svg.getBoundingClientRect();
      if (c.width > 1) {
        for (const el of document.querySelectorAll("p,h1,h2,h3,dd,dt,li,label")) {
          if (!el.textContent?.trim()) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 1 || r.top > innerHeight || r.bottom < 0) continue;
          const sobrepoe = Math.max(0, Math.min(r.right, c.right) - Math.max(r.left, c.left)) *
            Math.max(0, Math.min(r.bottom, c.bottom) - Math.max(r.top, c.top));
          /* Um canto do "+" a roçar uma linha não estorva; um terço da caixa
             do texto por baixo dele, sim. */
          if (sobrepoe > r.width * r.height * 0.33) {
            tapados.push((el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 22));
          }
        }
      }
    }
    return {
      falhadas,
      presos,
      toque,
      miudo,
      tapados,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      largura: document.documentElement.scrollWidth,
      chegam,
      cruz: cs ? `${cs.getPropertyValue("--cs").trim()}|${cs.getPropertyValue("--cx").trim()}` : null,
    };
  }, movel);

  await page.screenshot({ path: `${destino}/${String(i).padStart(2, "0")}.png` });
  linhas.push({ i, y, ...estado });
}

const ecras = await page.evaluate(() => +(document.documentElement.scrollHeight / innerHeight).toFixed(1));
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

/**
 * O teto de scroll, em ecrãs.
 *
 * **É um travão de regressão, não uma meta.** Cada número é o que a rota mede
 * hoje mais uma margem curta: se alguém acrescentar uma secção ou esticar um
 * pin, o verificador diz. Para referência: o site que serviu de modelo, medido
 * no mesmo iPhone, faz a página inteira em **9 ecrãs**; a nossa homepage vinha
 * de 15,9 e está em 13,2 — a diferença que falta são capítulos de conteúdo, e
 * cortá-los é decisão de quem escreve o site, não deste script.
 */
const TETOS = [
  [/\/servicos/, 11],
  [/\/portfolio\/[^/]+/, 6],
  [/\/(portfolio|sobre|contacto|privacidade)/, 6],
];
const TETO = TETOS.find(([re]) => re.test(new URL(url).pathname))?.[1] ?? 14;
const compridaDemais = movel && ecras > TETO;

const comToque = linhas.filter((l) => l.toque.length);
const comMiudo = linhas.filter((l) => l.miudo.length);
const comTapado = linhas.filter((l) => l.tapados.length);
const comFalha = linhas.filter((l) => l.falhadas.length);
const comPresos = linhas.filter((l) => l.presos.length);
const comOverflow = linhas.filter((l) => l.overflow);

console.log(`\n${destino}  (${movel ? "390px" : "1440px"}${reduzido ? ", movimento reduzido" : ""})`);
console.log(`  roda do rato ........ ${rodaAndou > 0 ? `mexe (${rodaAndou}px)` : "NÃO MEXE A PÁGINA"}`);
if (movel) {
  console.log(`  ecrãs de scroll ..... ${ecras}${compridaDemais ? `  DEMASIADO (teto ${TETO})` : `  (teto ${TETO})`}`);
  console.log(`  alvos < 44px ........ ${comToque.length ? [...new Set(comToque.flatMap((l) => l.toque))].slice(0, 4).join(" | ") : "nenhum"}`);
  console.log(`  texto < 14px ........ ${comMiudo.length ? [...new Set(comMiudo.flatMap((l) => l.miudo))].slice(0, 4).join(" | ") : "nenhum"}`);
  console.log(`  "+" por cima de texto ${comTapado.length ? [...new Set(comTapado.flatMap((l) => l.tapados))].slice(0, 4).join(" | ") : "nenhum"}`);
}
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
    nuncaChegaram.length ||
    !rodaAndou ||
    compridaDemais ||
    comToque.length ||
    comMiudo.length ||
    comTapado.length
    ? 1
    : 0,
);
