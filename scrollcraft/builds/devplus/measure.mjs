import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
await pg.goto('http://localhost:4500', { waitUntil: 'load' });
await pg.waitForTimeout(700);
const out = await pg.evaluate(() => [...document.querySelectorAll('.sc-copy')].map((el) => {
  const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
  return { cls: el.className.replace('sc-copy ', ''), left: +r.left.toFixed(1), right: +r.right.toFixed(1),
           w: +r.width.toFixed(1), pos: cs.position, insetL: cs.left, transl: cs.translate, cssW: cs.width };
}));
console.log('viewport = 390');
out.forEach((o) => console.log(`${o.left < 0 || o.right > 390 ? 'FORA ' : ' ok  '} ${o.cls.padEnd(18)} left=${o.left} right=${o.right} w=${o.w} cssW=${o.cssW} left:${o.insetL} translate:${o.transl}`));
await b.close();
