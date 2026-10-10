// Content checks: hero count-up runs, "He says yes" lives only on the Beti slide and lands after the chat.
import { chromium } from 'playwright';
const BASE = process.env.URL || 'http://localhost:4173/';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(BASE);
const seen = [];
for (let k = 0; k < 14; k++) { seen.splice(seen.length, 0, await p.evaluate(() => document.querySelector('.crore')?.textContent)); await p.waitForTimeout(250); }
console.log('hero count-up:', [...new Set(seen)].join(' → '));
const where = await p.evaluate(() => [...document.querySelectorAll('.slide')].filter((s) => /hopes he/i.test(s.textContent)).map((s) => s.id));
console.log('"He says yes / hopes he\'s right" found on slides:', where.join(', '));
await p.waitForFunction(() => window.__netto.state().p === 1);
const i = await p.evaluate(() => [...document.querySelectorAll('.slide')].findIndex((s) => s.id === 'beti'));
await p.evaluate((i) => window.__netto.goTo(i - 1, { instant: true, built: true }), i);
await p.keyboard.press('ArrowRight');
const order = [];
for (let k = 0; k < 40; k++) {
  const st = await p.evaluate(() => { const s = document.getElementById('beti'); const op = (sel) => +getComputedStyle(s.querySelector(sel)).opacity; return { her: op('.msg.in') > 0.5, reply: op('.msg.reply') > 0.5, says: op('.line') > 0.5 }; });
  for (const [k2, v] of Object.entries(st)) if (v && !order.includes(k2)) order.splice(order.length, 0, k2);
  await p.waitForTimeout(200);
}
console.log('Beti slide reveal order:', order.join(' → '));
await b.close();
