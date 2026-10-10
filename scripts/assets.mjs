// One-off: converts the source PNGs in the competition folder into WebP under public/assets.
import sharp from 'sharp';
const SRC = '../../08_Tata_Imagination_Challenge_2026';
const langs = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Bengali'];
for (const l of langs) {
  const src = `${SRC}/Netto_Weekly_Cards/Netto_Card_${l}.png`;
  const lc = l.toLowerCase();
  await sharp(src).webp({ quality: 86 }).toFile(`public/assets/cards/card-${lc}.webp`);
  await sharp(src).resize(560).webp({ quality: 82 }).toFile(`public/assets/cards/card-${lc}-sm.webp`);
}
await sharp(`${SRC}/Netto_Brand/Final/netto_video_end_frame.png`).webp({ quality: 82 }).toFile('public/assets/video/poster.webp');
console.log('done');
