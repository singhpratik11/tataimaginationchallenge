// Plays the deck with the arrow key and the mouse wheel, and reports dropped frames (frame gaps > 24ms).
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(process.env.URL || 'http://localhost:4173/', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
await p.evaluate(() => {
  window.__gaps = []; let last = performance.now();
  const f = (t) => { window.__gaps.push(t - last); last = t; requestAnimationFrame(f); };
  requestAnimationFrame(f);
});
const n = +(process.env.STEPS || 8);
for (let i = 0; i < n; i++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(+(process.env.WAIT || 4200)); }
const keys = await p.evaluate(() => { const g = window.__gaps; window.__gaps = []; return g; });
for (let i = 0; i < 120; i++) { await p.mouse.wheel(0, 60); await p.waitForTimeout(16); }
await p.waitForTimeout(1500);
const wheel = await p.evaluate(() => window.__gaps);
const rep = (g) => { const d = g.filter((x) => x > 24).length; const p95 = [...g].sort((a, b) => a - b)[Math.floor(g.length * 0.95)]; return `${g.length} frames, ${d} dropped (${(100 * d / g.length).toFixed(1)}%), p95 ${p95.toFixed(1)}ms`; };
console.log('keys :', rep(keys));
console.log('wheel:', rep(wheel));
await b.close();
