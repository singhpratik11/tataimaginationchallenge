// Checks that Next during a build finishes the build instead of leaving the slide.
import { chromium } from 'playwright';
const BASE = process.env.URL || 'http://localhost:4173/';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
const errs = [];
p.on('pageerror', (e) => errs.splice(errs.length, 0, String(e)));
await p.goto(BASE); await p.waitForTimeout(5000);
await p.keyboard.press('ArrowRight'); await p.waitForTimeout(3000);
await p.screenshot({ path: 'shots/apps-mid.png' });
await p.keyboard.press('ArrowRight'); await p.waitForTimeout(900);
console.log('next mid-build ->', await p.evaluate(() => location.hash), '(should stay #apps)');
await p.screenshot({ path: 'shots/apps-done.png' });
await p.keyboard.press('ArrowRight'); await p.waitForTimeout(1800);
console.log('next again     ->', await p.evaluate(() => location.hash), '(should be #question)');
await p.waitForTimeout(9000); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(1800);
console.log('build done,next->', await p.evaluate(() => location.hash), '(should be #gap)');
console.log('errors:', errs.length ? errs : 'none');
await b.close();
