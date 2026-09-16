const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const svgBadge = (num) => Buffer.from(`
<svg width="44" height="44" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>
  <circle cx="22" cy="22" r="18" fill="#0071e3" stroke="#ffffff" stroke-width="2.5" filter="url(#shadow)"/>
  <text x="22" y="28" font-size="18" font-family="Arial, Helvetica, sans-serif" font-weight="bold" fill="#ffffff" text-anchor="middle">${num}</text>
</svg>
`);

async function test() {
  const dir = 'public/docs_assets';
  fs.mkdirSync(dir, { recursive: true });

  const sample = await sharp({
    create: {
      width: 400,
      height: 400,
      channels: 4,
      background: { r: 240, g: 240, b: 245, alpha: 1 }
    }
  })
  .composite([
    { input: svgBadge('1'), top: 50, left: 50 },
    { input: svgBadge('2'), top: 150, left: 150 },
    { input: svgBadge('3'), top: 250, left: 250 }
  ])
  .png()
  .toFile(path.join(dir, 'test_badge.png'));

  console.log('Badge compositing test succeeded:', sample);
}
test();
