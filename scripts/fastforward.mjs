// Press Next mid-build and sample the build's progress: it should climb steadily (fast-forward), not jump.
import { chromium } from 'playwright';
const BASE = process.env.URL || 'http://localhost:4173/';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
await p.goto(BASE); await p.waitForFunction(() => window.__netto && window.__netto.state().p === 1);
for (const id of ['apps', 'card']) {
  await p.evaluate((id) => { const i = [...document.querySelectorAll('.slide')].findIndex((s) => s.id === id); window.__netto.goTo(i - 1, { instant: true, built: true }); }, id);
  await p.waitForTimeout(300);
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(2600);
  const before = await p.evaluate(() => window.__netto.state());
  await p.keyboard.press('ArrowRight');
  const trace = [];
  for (let k = 0; k < 12; k++) { trace.splice(trace.length, 0, (await p.evaluate(() => window.__netto.state().p)).toFixed(2)); await p.waitForTimeout(150); }
  const after = await p.evaluate(() => location.hash + ' speed=' + window.__netto.state().speed.toFixed(2));
  console.log(`#${id}: at press p=${before.p.toFixed(2)} speed=${before.speed}; every 150ms -> ${trace.join(' ')}; then ${after}`);
}
await b.close();
