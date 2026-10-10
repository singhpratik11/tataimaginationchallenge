// Corner leaf mark: visible where it should be, hidden on the full-logo slides, never on top of slide content.
import { chromium } from 'playwright';
const BASE = process.env.URL || 'http://localhost:4173/';
const b = await chromium.launch();
let problems = 0;
for (const [w, h] of [[1920, 1080], [1366, 768], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(BASE); await p.waitForFunction(() => window.__netto && window.__netto.state().p === 1);
  const n = await p.evaluate(() => window.__netto.N);
  const report = [];
  for (let i = 0; i < n; i++) {
    await p.evaluate((i) => window.__netto.show(i), i); await p.waitForTimeout(700);
    const r = await p.evaluate(() => {
      const s = document.querySelector('.slide.is-on');
      const cm = document.querySelector('.corner-mark'); const m = cm.getBoundingClientRect();
      const shown = +getComputedStyle(cm).opacity > 0.5;
      const lit = [...cm.querySelectorAll('.cm')].filter((e) => +getComputedStyle(e).opacity > 0.5).map((e) => e.className.split(' ')[1]);
      const hits = [];
      if (shown) s.querySelectorAll('p, h1, h2, h3, li, img, .phone, .clip, .mini, .cardframe, .lc, .chip, .bar').forEach((el) => {
        const cs = getComputedStyle(el);
        let r = el.getBoundingClientRect();
        if (/^(P|H1|H2|H3|LI)$/.test(el.tagName)) { const rg = document.createRange(); rg.selectNodeContents(el); r = rg.getBoundingClientRect(); } // the text itself, not the full-width block
        if (!r.width || +cs.opacity === 0 || cs.visibility === 'hidden') return;
        if (r.left < m.right + 6 && r.right > m.left - 6 && r.top < m.bottom + 6 && r.bottom > m.top - 6) hits.push((el.className || el.tagName).toString().slice(0, 24));
      });
      return { id: s.id, shown, lit: lit.join(), hits };
    });
    if (r.hits.length) problems++;
    report.push(`${r.id}:${r.shown ? r.lit.replace('cm-on-', '') : 'hidden'}${r.hits.length ? ' OVERLAP ' + r.hits.join('|') : ''}`);
  }
  console.log(`${w}x${h}  ` + report.join('  '));
  await p.close();
}
await b.close();
console.log(problems ? `${problems} overlap(s)` : 'no overlaps');
