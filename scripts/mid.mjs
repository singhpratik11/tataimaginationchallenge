// Captures slides part-way through their build (fractions of the pinned distance).
import { chromium } from 'playwright';
const ids = (process.env.IDS || 'apps,gap,loan,beti,card,languages').split(',');
const fr = [0.25, 0.5, 0.75];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
for (const id of ids) for (const f of fr) {
  await p.evaluate(([id, f]) => window.__netto.at(id, f), [id, f]);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `shots/mid-${id}-${f}.png` });
}
await b.close();
