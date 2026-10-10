// Screenshots every slide at the target viewports and reports console errors + text cut off the screen.
// Usage: npm run build && npx vite preview --port 4173 & ; npm run shots [-- chromium|webkit]
import { chromium, webkit } from 'playwright';
import { mkdirSync } from 'node:fs';

const engine = process.argv[2] === 'webkit' ? webkit : chromium;
const URL = process.env.URL || 'http://localhost:4173/';
const sizes = (process.env.SIZES || '1920x1080,1366x768,390x844').split(',');
const out = `shots/${process.argv[2] || 'chromium'}`;
mkdirSync(out, { recursive: true });

const browser = await engine.launch();
let problems = 0;
for (const size of sizes) {
  const [w, h] = size.split('x').map(Number);
  const mobile = w < 600;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: mobile && engine === chromium, hasTouch: mobile });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2600);
  const n = await page.evaluate(() => window.__netto.N);
  for (let i = 0; i < n; i++) {
    await page.evaluate((i) => window.__netto.goTo(i, { immediate: true }), i);
    await page.waitForTimeout(1700);
    const id = await page.evaluate((i) => document.querySelectorAll('.slide')[i].id, i);
    await page.screenshot({ path: `${out}/${size}-${String(i).padStart(2, '0')}-${id}.png` });
    const bad = await page.evaluate((i) => {
      const s = document.querySelectorAll('.slide')[i];
      if (s.id === 'sources' || s.id === 'try') return [];
      const W = innerWidth, H = innerHeight, res = [];
      s.querySelectorAll('p, h1, h2, h3, li, .gl, .sample, .row-k, button').forEach((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (!r.width || cs.visibility === 'hidden' || +cs.opacity === 0 || el.closest('.track, .czi, .lightbox')) return;
        if (r.left < -1 || r.right > W + 1 || r.top < -1 || r.bottom > H + 1) res.push(`${el.className || el.tagName}: "${el.textContent.trim().slice(0, 40)}" [${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}]`);
      });
      return res;
    }, i);
    if (bad.length) { problems += bad.length; console.log(`  ${size} #${id} off-screen:\n    ` + bad.join('\n    ')); }
  }
  if (errors.length) { problems += errors.length; console.log(`  ${size} console errors:\n    ` + errors.join('\n    ')); }
  await ctx.close();
}
await browser.close();
console.log(problems ? `${problems} problem(s)` : 'clean');
