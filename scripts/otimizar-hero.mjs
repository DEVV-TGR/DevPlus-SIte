/**
 * docs: docs/04-componentes-e-padroes.md (performance) · docs/02 (a paleta)
 *
 * Prepara os planos do hero para o browser. O gerador devolve PNG de ~5 MB a
 * 2736×1520, e três desses no hero seriam 16 MB antes de a página pintar — o
 * oposto do que o `docs/04` exige.
 *
 * Faz duas coisas que o `next/image` não faz por nós:
 *
 * 1. **Corta para mobile em vez de encolher.** Um plano de 16:9 reduzido a um
 *    ecrã de telemóvel deixa a estrutura do tamanho de uma unha. O recorte 3:4
 *    aproxima-se do centro, que é onde os três planos têm o assunto — o ponto
 *    de fuga no plano de fundo, a estrutura no do meio.
 * 2. **Escolhe a qualidade por plano.** O plano da frente vive desfocado e
 *    aguenta compressão agressiva; o do meio tem arestas de betão e não aguenta.
 *
 * Correr com:  node scripts/otimizar-hero.mjs <pasta-de-origem>
 */
import sharp from "sharp";
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";

const origem = process.argv[2];
if (!origem) {
  console.error("Falta a pasta de origem: node scripts/otimizar-hero.mjs <pasta>");
  process.exit(1);
}

const destino = path.join(process.cwd(), "public", "hero");

/** Por plano: a qualidade que a imagem justifica, e nada mais. */
const PLANOS = {
  "plane-far": { q: 74, nota: "névoa e gradiente, sem arestas" },
  "plane-mid": { q: 84, nota: "arestas de betão, é o assunto" },
  "plane-near": { q: 68, nota: "desfocado de propósito" },
};

const LARGURA_DESKTOP = 2400;
const MOBILE = { w: 1080, h: 1440 }; // 3:4, recortado ao centro

await mkdir(destino, { recursive: true });

const ficheiros = (await readdir(origem)).filter((f) => f.endsWith(".png"));
if (!ficheiros.length) {
  console.error(`Nenhum PNG em ${origem}`);
  process.exit(1);
}

let totalAntes = 0;
let totalDepois = 0;

for (const ficheiro of ficheiros.sort()) {
  const nome = path.basename(ficheiro, ".png");
  const plano = PLANOS[nome];
  if (!plano) {
    console.log(`  ${nome}: sem regra definida, ignorado`);
    continue;
  }

  const entrada = path.join(origem, ficheiro);
  const antes = (await stat(entrada)).size;  // metadata().size vem a 0 para PNG
  totalAntes += antes;

  const desktop = path.join(destino, `${nome}.webp`);
  const infoD = await sharp(entrada)
    .resize({ width: LARGURA_DESKTOP, withoutEnlargement: true })
    .webp({ quality: plano.q, effort: 6 })
    .toFile(desktop);

  const movel = path.join(destino, `${nome}-m.webp`);
  const infoM = await sharp(entrada)
    .resize({ ...MOBILE, fit: "cover", position: "center" })
    .webp({ quality: plano.q, effort: 6 })
    .toFile(movel);

  totalDepois += infoD.size + infoM.size;
  const kb = (n) => (n / 1024).toFixed(0).padStart(5) + " kB";
  console.log(
    `  ${nome.padEnd(11)} q${plano.q}  ${kb(antes)} → ${kb(infoD.size)} (${infoD.width}px)` +
      ` + ${kb(infoM.size)} mobile   ${plano.nota}`,
  );
}

const mb = (n) => (n / 1024 / 1024).toFixed(2);
console.log(
  `\ntotal ${mb(totalAntes)} MB → ${mb(totalDepois)} MB ` +
    `(${(100 - (totalDepois / totalAntes) * 100).toFixed(1)}% menos), em ${destino}`,
);
