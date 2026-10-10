import { chromium } from 'playwright';
const b = await chromium.launch();
const errs = [];
const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto('http://localhost:4173/'); await p.waitForTimeout(1500);
const hashes = [];
for (let i = 0; i < 4; i++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(1800); hashes.push(await p.evaluate(() => location.hash)); }
await p.keyboard.press('c'); await p.mouse.click(600, 400); await p.waitForTimeout(1800); hashes.push('click:' + await p.evaluate(() => location.hash));
await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(1800); hashes.push('back:' + await p.evaluate(() => location.hash));
await p.keyboard.press('End'); await p.waitForTimeout(2500); hashes.push('end:' + await p.evaluate(() => location.hash));
await p.keyboard.press('Home'); await p.waitForTimeout(2500); hashes.push('home:' + await p.evaluate(() => location.hash));
await p.keyboard.press('p'); hashes.push('presenter:' + await p.evaluate(() => document.body.classList.contains('presenter') + ' ' + document.querySelector('.counter').textContent));
console.log(hashes.join(' | '));
const d = await b.newPage({ viewport: { width: 1366, height: 768 } });
d.on('pageerror', (e) => errs.push('deep:' + e));
await d.goto('http://localhost:4173/#card'); await d.waitForTimeout(2500);
console.log('deeplink', await d.evaluate(() => location.hash + ' visible=' + [...document.querySelectorAll('.slide.is-on')].map((s) => s.id)));
for (let k = 0; k < 3; k++) { await d.mouse.wheel(0, 30); await d.waitForTimeout(20); }
for (let k = 0; k < 40; k++) { await d.mouse.wheel(0, 12); await d.waitForTimeout(16); }
await d.waitForTimeout(1800);
console.log('one wheel gesture from #card ->', await d.evaluate(() => location.hash));
await d.waitForTimeout(4000);
console.log('after 4s idle, still', await d.evaluate(() => location.hash));
const rm = await b.newPage({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
rm.on('pageerror', (e) => errs.push('rm:' + e));
await rm.goto('http://localhost:4173/'); await rm.waitForTimeout(800); await rm.keyboard.press('ArrowRight'); await rm.waitForTimeout(1500);
console.log('rm', await rm.evaluate(() => location.hash));
const f = await b.newPage(); f.on('pageerror', (e) => errs.push('file:' + e));
await f.goto('file://' + process.cwd() + '/dist/index.html'); await f.waitForTimeout(1500);
console.log('file://', await f.evaluate(() => !!document.querySelector('.logo svg') + ' dots=' + document.querySelectorAll('.dots button').length + ' font=' + document.fonts.check('700 20px Poppins')));
console.log('errors:', errs.length ? errs : 'none');
await b.close();
