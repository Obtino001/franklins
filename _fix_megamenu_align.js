const fs = require('fs');

const file = 'C:/Users/Yasir/Pictures/world-of-comfort/franklins/sections/header-group.json';
let raw = fs.readFileSync(file, 'utf8');
let header = '';
if (raw.trimStart().startsWith('/*')) {
  const i = raw.indexOf('*/');
  header = raw.slice(0, i + 2) + '\n';
  raw = raw.slice(i + 2).trim();
}
const data = JSON.parse(raw);
const pretty = true;

const cards = [
  { heading: 'Isbad', link: 'shopify://collections/isbad' },
  { heading: 'Dampsauna', link: 'shopify://collections/dampsauna' },
  { heading: 'Isbad + Dampsauna', link: 'shopify://collections/isbad-dampsauna' },
  { heading: 'Saunatæppe', link: 'shopify://collections/saunataeppe' },
  { heading: 'Infrarødt lys', link: 'shopify://collections/infrarodt-lys' },
];

function fixBanner(block) {
  if (!block || block.type !== 'banner') return;
  const s = block.settings;
  cards.forEach((card, idx) => {
    const n = idx + 1;
    s[`heading_${n}`] = card.heading;
    s[`button_label_${n}`] = card.heading;
    s[`button_link_${n}`] = card.link;
    s[`button_style_${n}`] = 'primary';
    s[`button_size_${n}`] = 'medium';
    s[`button_icon_${n}`] = 'caret-right';
    s[`button_icon_style_${n}`] = 'default';
  });
}

const headerSec = data.sections.header;
for (const block of Object.values(headerSec.blocks || {})) {
  fixBanner(block);
}

fs.writeFileSync(file, header + JSON.stringify(data, null, 2) + '\n');
console.log('Updated Produkter mega-menu links for', Object.keys(headerSec.blocks).length, 'banners');
cards.forEach((c, i) => console.log(i + 1, c.heading, '→', c.link));
