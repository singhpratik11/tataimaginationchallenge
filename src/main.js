import '@fontsource/poppins/latin-400.css';
import '@fontsource/poppins/latin-500.css';
import '@fontsource/poppins/latin-600.css';
import '@fontsource/poppins/latin-700.css';
import '@fontsource/poppins/latin-ext-400.css';
import '@fontsource/poppins/latin-ext-500.css';
import '@fontsource/poppins/latin-ext-600.css';
import '@fontsource/poppins/latin-ext-700.css';
import './style.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import logoWhite from './brand/logo-white.svg?raw';
import logoColor from './brand/logo.svg?raw';

gsap.registerPlugin(ScrollTrigger);

let initDone = false;
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const COARSE = window.matchMedia('(pointer: coarse)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const inr = (n) => Math.round(n).toLocaleString('en-IN');
const vh = () => window.innerHeight;
if (RM) document.documentElement.classList.add('rm');

/* ---------------------------------------------------------------- setup DOM */

// Logos: inline the exact brand SVG, wrapping each part so it can animate without touching its own transform.
function mountLogos() {
  $$('[data-logo]').forEach((el) => {
    el.innerHTML = el.dataset.logo === 'color' ? logoColor : logoWhite;
    const svg = el.querySelector('svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    [...svg.children].filter((c) => c.tagName === 'g').forEach((g, i) => {
      const wrap = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      wrap.setAttribute('class', ['leaf-a', 'leaf-b', 'word'][i] || 'part');
      g.replaceWith(wrap);
      wrap.appendChild(g);
    });
  });
}

const SB_ICONS = `<span class="ic"><svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg><svg viewBox="0 0 16 12"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.3-1.4A10.3 10.3 0 0 0 8 .3C5.2.3 2.6 1.4.7 3.2L2 4.6a8.4 8.4 0 0 1 6-2.4Zm0 3.8c1.3 0 2.5.5 3.4 1.3l1.3-1.4A6.7 6.7 0 0 0 8 4.1c-1.8 0-3.4.7-4.7 1.8l1.3 1.4C5.5 6.5 6.7 6 8 6Zm0 3.7L9.9 8a2.9 2.9 0 0 0-3.8 0L8 9.7Z"/></svg><svg viewBox="0 0 27 12"><rect x=".5" y=".5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity=".5"/><rect x="2" y="2" width="15" height="8" rx="1.8"/><rect x="24" y="4" width="2" height="4" rx="1"/></svg></span>`;
function mountStatusBars() {
  $$('.sb').forEach((el) => { el.innerHTML = `<span>${el.dataset.time}</span>${SB_ICONS}`; });
}

// Split text into word spans (keeps inline elements such as .hl intact).
function splitWords(root) {
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(' '));
          else { const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(root);
}

mountLogos();
mountStatusBars();
$$('.split-words').forEach(splitWords);
$('.segs').innerHTML = '<i></i>'.repeat(30);

/* ---------------------------------------------------------------- helpers */

function counter(tl, el, at, dur = 1, from = 0) {
  const to = +el.dataset.to;
  const o = { v: from };
  el.textContent = inr(from);
  tl.to(o, { v: to, duration: dur, ease: 'power2.out', onUpdate: () => { el.textContent = inr(o.v); } }, at);
}
const rise = { y: 26, opacity: 0, duration: 1, ease: 'power3.out' };
function buzz(tl, el, at) {
  tl.to(el, { keyframes: { x: [0, -5, 5, -4, 4, -2, 0] }, duration: 0.45, ease: 'none' }, at);
  tl.call(() => { try { navigator.vibrate && navigator.vibrate(14); } catch (e) { /* not supported */ } }, null, at);
}

/* ---------------------------------------------------------------- slide builds */
// Each build fills a paused timeline that is scrubbed by scroll. Markup is in its FINAL state,
// so reduced-motion and print show everything without running these.

const builds = {
  apps(tl, s) {
    const lines = $$('.line', s);
    const tiles = $$('.tile', s);
    const rings = $$('.ring', s);
    const thumb = $('.thumb', s);
    const phone = $('.phone', s);
    const pos = (i) => {
      const t = tiles[i];
      return { x: () => t.offsetLeft + t.offsetWidth * 0.72 - thumb.offsetWidth / 2, y: () => t.offsetTop + t.offsetHeight / 2 - thumb.offsetHeight / 2 };
    };
    tl.from(lines[0], rise, 0);
    tl.from(tiles, { y: 30, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' }, 0.1);
    tl.set(thumb, { ...pos(0), opacity: 0 }, 0);
    tl.to(thumb, { opacity: 1, duration: 0.3 }, 1.0);
    [0, 1, 2].forEach((i) => {
      const at = 1.2 + i * 1.5;
      if (i) tl.to(thumb, { ...pos(i), duration: 0.6, ease: 'power2.inOut' }, at - 0.6);
      tl.to(thumb, { scale: 0.8, duration: 0.15, yoyo: true, repeat: 1 }, at);
      tl.to(rings[i], { opacity: 1, duration: 0.25 }, at + 0.1);
      tl.to(tiles[i], { scale: 1.03, duration: 0.3 }, at + 0.1);
      if (i) {
        tl.to(rings[i - 1], { opacity: 0, duration: 0.25 }, at + 0.1);
        tl.to(tiles[i - 1], { scale: 1, duration: 0.3 }, at + 0.1);
      }
      buzz(tl, phone, at + 0.12);
    });
    tl.to(lines[0], { opacity: 0.45, duration: 0.5 }, 2.6);
    tl.from(lines[1], rise, 2.6);
    tl.to(lines[1], { opacity: 0.45, duration: 0.5 }, 4.6);
    tl.from(lines[2], rise, 4.6);
    tl.to(thumb, { opacity: 0, duration: 0.3 }, 5.2);
  },

  question(tl, s) {
    tl.from($$('.huge .w', s), { y: 30, opacity: 0, stagger: 0.14, duration: 0.8, ease: 'power3.out' }, 0);
    tl.to($('.drift', s), { opacity: 0.4, duration: 1 }, 0.4);
    tl.from($('.sub', s), rise, '>+0.3');
  },

  gap(tl, s) {
    const [earned, kept] = $$('.count', s);
    tl.from($('.eyebrow', s), rise, 0);
    tl.from($('.gl.earned', s), { ...rise, duration: 0.6 }, 0.1);
    tl.from($('.bar-fill', s), { scaleX: 0, duration: 1.3, ease: 'power2.inOut' }, 0.3);
    counter(tl, earned, 0.3, 1.3);
    tl.from($('.bar-cost', s), { xPercent: 101, duration: 1.3, ease: 'power3.inOut' }, 1.9);
    tl.from($('.bar-cost em', s), { opacity: 0, duration: 0.4 }, 2.8);
    tl.from($('.gl.kept', s), { ...rise, duration: 0.6 }, 2.9);
    counter(tl, kept, 2.9, 1.1);
    tl.from($$('.big .w', s), { y: 28, opacity: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out' }, 3.6);
    tl.from($('.foot', s), { opacity: 0, duration: 0.6 }, '>-0.2');
  },

  loan(tl, s) {
    const lines = $$('.line', s);
    const phone = $('.phone', s);
    const [nEmi, nMissed, nOld] = $$('.notif', s);
    const H = (el) => el.offsetHeight + parseFloat(getComputedStyle(el.parentElement).rowGap || 0);
    tl.from(lines[0], rise, 0);
    tl.to($('.call', s), { opacity: 0, scale: 0.94, duration: 0.7, ease: 'power2.in' }, 1.6);
    tl.from($('.lock', s), { opacity: 0, duration: 0.6 }, 1.9);
    tl.from($$('.lock-day, .lock-time', s), { y: -16, opacity: 0, stagger: 0.08, duration: 0.6 }, 1.9);
    // newest notification lands on top and pushes the older ones down
    tl.fromTo(nOld, { y: () => -(H(nMissed) + H(nEmi)) - 24, opacity: 0 }, { y: () => -(H(nMissed) + H(nEmi)), opacity: 1, duration: 0.6, ease: 'power3.out' }, 2.4);
    tl.fromTo(nMissed, { y: () => -H(nEmi) - 24, opacity: 0 }, { y: () => -H(nEmi), opacity: 1, duration: 0.6, ease: 'power3.out' }, 3.3);
    tl.to(nOld, { y: () => -H(nEmi), duration: 0.6, ease: 'power3.out' }, 3.3);
    buzz(tl, phone, 3.35);
    tl.to(lines[0], { opacity: 0.45, duration: 0.5 }, 3.6);
    tl.from(lines[1], rise, 3.6);
    tl.fromTo(nEmi, { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 4.3);
    tl.to([nOld, nMissed], { y: 0, duration: 0.6, ease: 'power3.out' }, 4.3);
    buzz(tl, phone, 4.35);
    tl.from($('.stat', s), { opacity: 0, y: 14, duration: 0.7 }, 5.1);
  },

  beti(tl, s) {
    chatScene(tl, s, { msgAt: 0.4, typingAt: 1.8, replyAt: 3.6 });
    const line = $('.line', s);
    tl.from(line, { opacity: 0, y: 20, duration: 1.2 }, 4.4);
    tl.from($('.soft', line), { opacity: 0, duration: 1.4 }, 5.6);
    tl.to($('.screen', s), { opacity: 0.82, duration: 1.4 }, 6.4);
  },

  unnoticed(tl, s) {
    const talk = $$('.talk .w', s);
    tl.from(talk, { y: 26, opacity: 0, stagger: 0.07, duration: 0.7, ease: 'power3.out' }, 0);
    tl.to(talk, { opacity: 0.35, duration: 0.8 }, 1.6);
    tl.from($$('.under .w', s), { y: 26, opacity: 0, stagger: 0.06, duration: 0.7, ease: 'power3.out' }, 1.8);
    tl.from($('.scale', s), { opacity: 0, y: 20, duration: 0.8 }, 3.6);
    counter(tl, $('.scale .count', s), 3.7, 1.4);
  },

  news(tl, s) {
    const clips = $$('.clip', s);
    tl.from($('.eyebrow', s), rise, 0);
    tl.from($$('.big .w', s), { y: 26, opacity: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out' }, 0.1);
    clips.forEach((c, i) => {
      const at = 1.0 + i * 0.9;
      tl.from(c, { y: 90, opacity: 0, rotate: (i % 2 ? 7 : -7), duration: 1.1, ease: 'power3.out' }, at);
      const marks = $$('mark', c);
      if (marks.length) tl.from(marks, { backgroundSize: '0% 34%', duration: 0.9, ease: 'power2.inOut' }, at + 0.8);
    });
    tl.from($('.sample', s), { opacity: 0, duration: 0.6 }, '>');
  },

  netto(tl, s) {
    const logo = $('.meet-logo svg', s);
    tl.from($$('.leaf-a, .leaf-b', logo), { scale: 0, rotate: -25, transformOrigin: '0% 100%', stagger: 0.15, duration: 0.8, ease: 'power3.out' }, 0);
    tl.from($('.word', logo), { opacity: 0, x: -24, duration: 0.8, ease: 'power3.out' }, 0.3);
    $$('.step', s).forEach((st, i) => {
      tl.from(st, { y: 44, opacity: 0, duration: 0.8, ease: 'power3.out' }, 1.1 + i * 0.7);
      tl.from($('.step-ic', st), { scale: 0.4, rotate: -12, duration: 0.6, ease: 'power3.out' }, 1.3 + i * 0.7);
    });
  },

  message(tl, s) {
    tl.from($$('.copy > *', s), { ...rise, stagger: 0.15 }, 0);
    const pop = { y: 22, opacity: 0, scale: 0.96, transformOrigin: '0% 100%', duration: 0.6, ease: 'power3.out' };
    tl.from($('.m1', s), pop, 0.7);
    $$('.m1 .count', s).forEach((c, i) => counter(tl, c, 0.8 + i * 0.2, 0.9));
    tl.from($('.m2', s), pop, 2.0);
    counter(tl, $('.m2 .count', s), 2.1, 0.8);
    tl.from($('.m3', s), pop, 3.0);
    counter(tl, $('.m3 .count', s), 3.1, 0.5);
    tl.to($('.qr-yes', s), { backgroundColor: '#486AAE', color: '#ffffff', borderRadius: '0.6em', duration: 0.25 }, 4.0);
    tl.from($('.m4', s), { ...pop, transformOrigin: '100% 100%' }, 4.2);
  },

  card(tl, s) {
    const czi = $('.czi', s);
    const spot = $('.spot', s);
    // regions on the card image, in % of its box: [left, top, width, height, zoom]
    const R = [[5, 13.6, 90, 14.6, 1.12], [5, 28.1, 90, 17, 1.1], [5, 46, 90, 39.8, 1.04], [5, 87.4, 90, 7.8, 1.1]];
    const view = (r) => {
      const [l, t, w, h, z] = r;
      const cx = (l + w / 2) / 100, cy = (t + h / 2) / 100;
      const clamp = (v, lo) => Math.min(0, Math.max(lo, v));
      return { scale: z, xPercent: clamp((0.5 - z * cx) * 100, (1 - z) * 100), yPercent: clamp((0.5 - z * cy) * 100, (1 - z) * 100) };
    };
    const box = (r) => ({ left: r[0] + '%', top: r[1] + '%', width: r[2] + '%', height: r[3] + '%' });
    tl.from($('.cardframe', s), { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out' }, 0);
    tl.from($('.callouts', s), { x: -20, opacity: 0, duration: 0.6 }, 0.2);
    tl.set(spot, { ...box(R[0]), opacity: 0 }, 0);
    tl.addLabel('c0', 1.0);
    tl.to(spot, { opacity: 1, duration: 0.5 }, 1.0);
    tl.to(czi, { ...view(R[0]), duration: 0.9, ease: 'power2.inOut' }, 1.0);
    [1, 2, 3].forEach((k) => {
      const at = 1.0 + k * 1.6;
      tl.addLabel('c' + k, at);
      tl.to(spot, { ...box(R[k]), duration: 0.9, ease: 'power2.inOut' }, at);
      tl.to(czi, { ...view(R[k]), duration: 0.9, ease: 'power2.inOut' }, at);
    });
    tl.to(spot, { opacity: 0, duration: 0.6 }, 7.0);
    tl.to(czi, { scale: 1, xPercent: 0, yPercent: 0, duration: 0.9, ease: 'power2.inOut' }, 7.0);
    tl.addLabel('end', 7.0);
    // which callout is lit, derived from playhead so it works scrubbing both ways
    const lis = $$('.callouts li', s);
    tl.eventCallback('onUpdate', () => {
      const t = tl.time();
      let on = 0;
      ['c0', 'c1', 'c2', 'c3'].forEach((l, i) => { if (t >= tl.labels[l] - 0.2) on = i; });
      lis.forEach((li, i) => li.classList.toggle('on', i === on));
    });
  },

  try(tl, s) {
    tl.from($$('.copy > *', s), { ...rise, stagger: 0.07, duration: 0.7 }, 0);
    tl.from($('.mini', s), { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out' }, 0.2);
  },

  languages(tl, s) {
    const fan = $('.fan', s);
    const track = $('.track', s);
    const cards = $$('.lc', s);
    cards.forEach((c, i) => { c.style.zIndex = String(cards.length - i); });
    tl.from($$('.lang-line .w', s), { y: 26, opacity: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out' }, 0);
    tl.from($('.sub', s), { opacity: 0, y: 14, duration: 0.7 }, 0.5);
    // pile in the middle of the fan, then spread into a row, then pan the row
    tl.fromTo(cards, {
      x: (i, c) => fan.offsetWidth / 2 - (c.offsetLeft + c.offsetWidth / 2),
      rotate: (i) => (i - 3) * 3.2,
      y: (i) => Math.abs(i - 3) * 6,
      opacity: 0,
    }, { opacity: 1, duration: 0.5, stagger: 0.05 }, 0.4);
    tl.to(cards, { x: 0, rotate: 0, y: 0, duration: 1.4, ease: 'power3.inOut', stagger: 0.03 }, 1.4);
    tl.fromTo(track, { x: 0 }, { x: () => Math.min(0, fan.offsetWidth - track.scrollWidth), duration: 2.4, ease: 'power1.inOut' }, 3.0);
  },

  payoff(tl, s) {
    chatScene(tl, s, { msgAt: 0.4, typingAt: 1.6, replyAt: 2.8 });
    tl.from($('.heart', s), { scale: 0, opacity: 0, transformOrigin: '0% 100%', duration: 0.5, ease: 'back.out(2)' }, 3.6);
    const line = $('.line', s);
    tl.from(line, { opacity: 0, y: 20, duration: 1.2 }, 4.0);
    tl.from($('.hl-blue', line), { opacity: 0, y: 12, duration: 1.2 }, 5.4);
  },

  why(tl, s) {
    tl.from($$('.big .w', s), { y: 26, opacity: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out' }, 0);
    tl.from($$('.col', s), { y: 40, opacity: 0, stagger: 0.35, duration: 0.8, ease: 'power3.out' }, 0.4);
    counter(tl, $('.col .count', s), 1.3, 1);
  },

  tata(tl, s) {
    tl.from($('.eyebrow', s), rise, 0);
    tl.from($$('.row', s), { y: 36, opacity: 0, stagger: 0.55, duration: 0.8, ease: 'power3.out' }, 0.2);
    counter(tl, $('.row .count', s), 1.4, 1);
  },


  close(tl, s) {
    tl.from($$('.c1 .w', s), { y: 26, opacity: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out' }, 0);
    tl.to($('.c1', s), { opacity: 0.55, duration: 0.6 }, 1.5);
    tl.from($$('.c2 .w', s), { y: 26, opacity: 0, stagger: 0.06, duration: 0.7, ease: 'power3.out' }, 1.5);
    const logo = $('.close-sign svg', s);
    tl.from($$('.leaf-a, .leaf-b', logo), { scale: 0, transformOrigin: '0% 100%', stagger: 0.15, duration: 0.8, ease: 'power3.out' }, 3.2);
    tl.from($('.word', logo), { opacity: 0, x: -16, duration: 0.8 }, 3.4);
    tl.from($('.close-sign .tagline', s), { opacity: 0, y: 12, duration: 0.9 }, 3.8);
  },
};

// Chat with a daughter: her message, "typing…", then his reply.
function chatScene(tl, s, { msgAt, typingAt, replyAt }) {
  const pop = (o) => ({ y: 18, opacity: 0, scale: 0.95, transformOrigin: o, duration: 0.7, ease: 'power3.out' });
  tl.from($('.msg.in', s), pop('0% 100%'), msgAt);
  tl.to($('.st-on', s), { opacity: 0, duration: 0.3 }, typingAt);
  tl.to($('.st-typing', s), { opacity: 1, duration: 0.3 }, typingAt);
  tl.fromTo($('.typing', s), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, typingAt + 0.1);
  tl.to($('.typing', s), { opacity: 0, duration: 0.25 }, replyAt - 0.1);
  tl.to($('.st-typing', s), { opacity: 0, duration: 0.3 }, replyAt);
  tl.to($('.st-on', s), { opacity: 1, duration: 0.3 }, replyAt);
  tl.from($('.msg.reply', s), pop('100% 100%'), replyAt);
  tl.fromTo($('.msg.reply .ticks', s), { color: '#9aa3b5' }, { color: '#486AAE', duration: 0.3 }, replyAt + 0.8);
}

/* ---------------------------------------------------------------- scroll engine */

const slides = $$('.slide');
const N = slides.length;
const pins = [];       // per slide: { start, stop }
const timelines = [];
let lenis = null;

if (!RM) {
  lenis = new Lenis({ lerp: 0.07, wheelMultiplier: 0.7, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
ScrollTrigger.config({ ignoreMobileResize: true });

slides.forEach((s, i) => {
  const len = parseFloat(s.dataset.len || 0);
  if (RM || !len) {
    const st = ScrollTrigger.create({ trigger: s, start: 'top top' });
    pins[i] = { st, pinned: false };
    if (RM) gsap.from($('.inner', s), { opacity: 0, duration: 0.6, scrollTrigger: { trigger: s, start: 'top 70%' } });
    return;
  }
  const pin = ScrollTrigger.create({ trigger: s, start: 'top top', end: () => '+=' + len * vh(), pin: true });
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
  builds[s.id]?.(tl, s);
  tl.to({}, { duration: Math.max(0.6, tl.duration() * 0.18) }); // hold before handing over
  timelines.push(tl);
  ScrollTrigger.create({ trigger: s, start: 'top 62%', end: () => pin.end, scrub: true, animation: tl, invalidateOnRefresh: true });
  pins[i] = { st: pin, pinned: true };
});

const maxScroll = () => ScrollTrigger.maxScroll(window);
const stopOf = (i) => {
  const p = pins[i];
  if (!p) return 0;
  return Math.min(maxScroll(), p.pinned ? p.st.end - 2 : p.st.start);
};
const startOf = (i) => Math.min(maxScroll(), pins[i].st.start);
const scrollY = () => (lenis ? lenis.scroll : window.scrollY);

function currentIndex(y = scrollY()) {
  let idx = 0;
  for (let i = 0; i < N; i++) if (startOf(i) - vh() * 0.5 <= y) idx = i;
  return idx;
}

let navTarget = null;
let navigating = false;
const ease = (t) => -(Math.cos(Math.PI * t) - 1) / 2; // sine in-out: no sudden rush mid-move

function goTo(i, { immediate = false } = {}) {
  i = Math.max(0, Math.min(N - 1, i));
  lenis?.resize();
  const target = stopOf(i);
  navTarget = i;
  const dist = Math.abs(target - scrollY());
  if (!lenis) {
    window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' });
    navTarget = null;
    return;
  }
  if (dist < 2) { navTarget = null; return; }
  const far = Math.abs(i - currentIndex()) > 1;
  let duration = far ? 2.2 : Math.min(7, Math.max(1.6, (dist / vh()) * 0.95));
  if (slides[i].hasAttribute('data-slow') && !far) duration *= 1.2;
  navigating = true;
  lenis.scrollTo(target, {
    duration, easing: ease, lock: true, force: true, immediate,
    onComplete: () => { navigating = false; navTarget = null; },
  });
}

function step(dir) {
  const y = scrollY();
  if (navigating && navTarget != null) return goTo(navTarget + dir);
  if (dir > 0) {
    for (let i = 0; i < N; i++) if (stopOf(i) > y + 4) return goTo(i);
    return;
  }
  for (let i = N - 1; i >= 0; i--) if (stopOf(i) < y - 4) return goTo(i);
  goTo(0);
}

/* gentle snapping for people scrolling on their own */
let snapTimer = 0;
let touching = false;
let lastDir = 1;
function maybeSnap() {
  if (!lenis || navigating || touching || !$('.lightbox').hidden) return;
  const y = scrollY();
  for (let i = 0; i < N; i++) {
    const d = stopOf(i) - y;
    if (d > 2 && d < vh() * 0.18) return goTo(i);
  }
}
if (lenis) {
  lenis.on('scroll', (l) => {
    if (l.direction) lastDir = l.direction;
    clearTimeout(snapTimer);
    snapTimer = setTimeout(maybeSnap, 650);
  });
}
window.addEventListener('touchstart', () => { touching = true; }, { passive: true });
window.addEventListener('touchend', () => { touching = false; clearTimeout(snapTimer); snapTimer = setTimeout(maybeSnap, 420); }, { passive: true });

/* ---------------------------------------------------------------- chrome: dots, progress, counter, hash */

const dotsNav = $('.dots');
slides.forEach((s, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.setAttribute('aria-label', `Slide ${i + 1}: ${s.dataset.label}`);
  b.innerHTML = `<span>${s.dataset.label}</span>`;
  b.addEventListener('click', () => goTo(i));
  dotsNav.appendChild(b);
});
const dotBtns = $$('button', dotsNav);
const bar = $('.progress span');
const counterEl = $('.counter');
let lastIdx = -1;

function onScrollUI() {
  const y = scrollY();
  bar.style.transform = `scaleX(${Math.min(1, y / Math.max(1, maxScroll()))})`;
  const idx = currentIndex(y);
  if (idx !== lastIdx) {
    lastIdx = idx;
    dotBtns.forEach((b, i) => { b.classList.toggle('on', i === idx); b.toggleAttribute('aria-current', i === idx); });
    counterEl.textContent = `${idx + 1}/${N}`;
    document.body.dataset.tone = slides[idx].classList.contains('bg-light') ? 'light' : 'dark';
    if (initDone) history.replaceState(null, '', '#' + slides[idx].id);
  }
  $('.hint') && ($('.hint').style.opacity = y > 40 ? '0' : '');
}
if (lenis) lenis.on('scroll', onScrollUI); else window.addEventListener('scroll', onScrollUI, { passive: true });

/* ---------------------------------------------------------------- keys, click, presenter, fullscreen */

const toggles = {
  present: () => {
    const on = document.body.classList.toggle('presenter');
    $('[data-act="present"]').setAttribute('aria-pressed', String(on));
  },
  click: () => {
    clickAdvance = !clickAdvance;
    $('[data-act="click"]').setAttribute('aria-pressed', String(clickAdvance));
  },
  full: () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  },
};
let clickAdvance = !COARSE;
$('[data-act="click"]').setAttribute('aria-pressed', String(clickAdvance));
$$('.toolbar button').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); toggles[b.dataset.act](); }));

window.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const t = e.target;
  const typing = t.matches?.('input, textarea, select, [contenteditable]');
    if (!$('.lightbox').hidden) { if (e.key === 'Escape') closeLightbox(); return; }
  if (typing && t.type === 'range' && /Arrow|Page|Home|End/.test(e.key)) return;
  if (typing) return;
  const k = e.key;
  if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(k) || (k === ' ' && !e.shiftKey)) { e.preventDefault(); step(1); }
  else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(k) || (k === ' ' && e.shiftKey)) { e.preventDefault(); step(-1); }
  else if (k === 'Home') { e.preventDefault(); goTo(0); }
  else if (k === 'End') { e.preventDefault(); goTo(N - 1); }
  else if (k === 'p' || k === 'P') toggles.present();
  else if (k === 'f' || k === 'F') toggles.full();
  else if (k === 'c' || k === 'C') toggles.click();
});

document.addEventListener('click', (e) => {
  if (!clickAdvance) return;
  if (e.target.closest('a, button, input, label, .lc, .mini, .lightbox, .dots, .toolbar, .presets')) return;
  if (String(window.getSelection?.() || '').length) return;
  step(1);
});

/* ---------------------------------------------------------------- pointer tilt (one parallax layer) */

if (!RM && !COARSE) {
  const setters = $$('.tilt').map((p) => ({
    rx: gsap.quickTo(p, 'rotationX', { duration: 1.6, ease: 'power2.out' }),
    ry: gsap.quickTo(p, 'rotationY', { duration: 1.6, ease: 'power2.out' }),
  }));
  $$('.stage').forEach((st) => { st.style.perspective = '1400px'; });
  window.addEventListener('pointermove', (e) => {
    const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
    setters.forEach((s) => { s.ry(nx * 5); s.rx(-ny * 3.5); });
  }, { passive: true });
}

/* ---------------------------------------------------------------- title: plays on load */

function titleIntro() {
  if (RM) return;
  const s = $('#title');
  const svg = $('.title-logo svg', s);
  gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 })
    .from($$('.leaf-a, .leaf-b', svg), { scale: 0, rotate: -30, transformOrigin: '0% 100%', stagger: 0.18, duration: 1.1 })
    .from($('.word', svg), { opacity: 0, x: -30, duration: 1 }, 0.35)
    .from($$('.tagline .w', s), { y: 24, opacity: 0, stagger: 0.09, duration: 0.8 }, 0.9)
    .from($('.byline', s), { opacity: 0, duration: 0.8 }, 1.5)
    .from($('.hint', s), { opacity: 0, y: -8, duration: 0.8 }, 1.9);
  // a slow drift as the title leaves
  gsap.to($('.title-logo', s), { yPercent: -30, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: s, start: 'top top', end: 'bottom top', scrub: true } });
}

/* ---------------------------------------------------------------- try a week */

const WEEKLY_FIXED = 1200; // rent, money home, EMI
const DAILY_NEED = 450;
const AVG_KEPT = 3400;
const PRESETS = { good: { in: 7800, cost: 3700, saved: 4050 }, slow: { in: 5200, cost: 3100, saved: 4050 }, break: { in: 7000, cost: 6200, saved: 4050 } };
const tryState = { ...PRESETS.good };
const shown = { in: 0, cost: 0, kept: 0, safe: 0, days: 0 };
const ranges = $$('#try input[type=range]');
function paintRange(r) {
  const p = ((r.value - r.min) / (r.max - r.min)) * 100;
  r.style.setProperty('--p', p + '%');
}
function renderTry(animate = true) {
  const kept = tryState.in - tryState.cost;
  const safe = kept - WEEKLY_FIXED;
  const savedAfter = safe < 0 ? tryState.saved + safe : tryState.saved;
  const days = Math.max(0, Math.min(30, Math.floor(savedAfter / DAILY_NEED)));
  ranges.forEach((r) => { r.value = tryState[r.dataset.k]; paintRange(r); $(`output[data-o="${r.dataset.k}"]`).textContent = '₹' + inr(tryState[r.dataset.k]); });
  const target = { in: tryState.in, cost: tryState.cost, kept, safe: Math.max(0, safe), days };
  gsap.to(shown, {
    ...target, duration: animate && !RM ? 0.5 : 0, ease: 'power2.out', overwrite: true,
    onUpdate: () => {
      $('[data-v="in"]').textContent = '₹' + inr(shown.in);
      $('[data-v="cost"]').textContent = '₹' + inr(shown.cost);
      $('[data-v="kept"]').textContent = (shown.kept < 0 ? '−₹' : '₹') + inr(Math.abs(shown.kept));
      $('[data-v="days"]').textContent = Math.round(shown.days) + (Math.round(shown.days) === 1 ? ' day' : ' days');
    },
  });
  const safeEl = $('[data-v="safe"]');
  safeEl.classList.toggle('short', safe < 0);
  safeEl.textContent = safe < 0 ? `Short by ₹${inr(-safe)}` : '₹' + inr(safe);
  $$('.segs i').forEach((seg, i) => seg.classList.toggle('f', i < days));
  const nudge = $('[data-v="nudge"]');
  let msg;
  if (safe < 0 && savedAfter >= 0) msg = `Tough week. ₹${inr(-safe)} from your cushion covers it. Still ${days} days left.`;
  else if (safe < 0) msg = `Tough week. You're ₹${inr(-safe)} short. Let's see what can wait.`;
  else if (kept >= AVG_KEPT) msg = 'Good week! Keep ₹300 aside for bike repairs?';
  else msg = 'Steady week. Rent, home and EMI are covered.';
  nudge.textContent = msg;
  nudge.classList.toggle('tough', safe < 0);
}
ranges.forEach((r) => r.addEventListener('input', () => {
  tryState[r.dataset.k] = +r.value;
  $$('.presets button').forEach((b) => b.classList.remove('on'));
  renderTry();
}));
$$('.presets button').forEach((b) => b.addEventListener('click', () => {
  Object.assign(tryState, PRESETS[b.dataset.preset]);
  $$('.presets button').forEach((x) => x.classList.toggle('on', x === b));
  renderTry();
}));
renderTry(false);

/* ---------------------------------------------------------------- lightbox for language cards */

const lb = $('.lightbox');
let lbReturn = null;
function closeLightbox() { lb.hidden = true; lenis?.start(); lbReturn?.focus(); }
$$('.lc').forEach((c) => c.addEventListener('click', () => {
  lbReturn = c;
  $('img', lb).src = c.dataset.full;
  $('img', lb).alt = $('img', c).alt;
  lb.hidden = false;
  lenis?.stop();
  $('.lb-close', lb).focus();
}));
lb.addEventListener('click', (e) => { if (e.target === lb || e.target.closest('.lb-close')) closeLightbox(); });

/* the quick-reply buttons in the sample chat respond when tapped */
$$('#message .qr button').forEach((b) => b.addEventListener('click', () => gsap.fromTo(b, { scale: 0.9 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' })));

/* ---------------------------------------------------------------- print: show every slide fully built */

window.addEventListener('beforeprint', () => timelines.forEach((t) => t.progress(1)));
window.addEventListener('afterprint', () => ScrollTrigger.getAll().forEach((st) => st.animation && st.animation.progress(st.progress)));

/* ---------------------------------------------------------------- start */

titleIntro();
document.fonts.ready.then(() => {
  ScrollTrigger.refresh();
  lenis?.resize(); // pin spacers just grew the page; let Lenis see the new height before jumping
  const id = location.hash.slice(1);
  const i = slides.findIndex((s) => s.id === id);
  if (i > 0) {
    if (lenis) lenis.scrollTo(stopOf(i), { immediate: true, force: true });
    else window.scrollTo(0, stopOf(i));
    ScrollTrigger.update();
  }
  initDone = true;
  onScrollUI();
});
window.addEventListener('hashchange', () => {
  const i = slides.findIndex((s) => s.id === location.hash.slice(1));
  if (i >= 0 && i !== currentIndex()) goTo(i);
});
// test hook: jump to a fraction of a slide's build (used by scripts/mid.mjs)
const at = (id, f) => {
  const i = slides.findIndex((s) => s.id === id);
  const st = pins[i].st;
  const y = st.start + (st.end - st.start) * f;
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
};
window.__netto = { goTo, step, stopOf, at, N };
