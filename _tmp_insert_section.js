const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'templates', 'product.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

data.sections.whats_included_Kp7mR2 = {
  type: 'whats-included',
  name: "What's Included",
  settings: {
    heading: 'Hvad medfølger?',
    bg_color: '#FFFFFF'
  },
  blocks: {
    item_handpump: { type: 'item', settings: { title: 'Håndpumpe' } },
    item_drain: { type: 'item', settings: { title: 'Afløbshane' } },
    item_hose: { type: 'item', settings: { title: 'Afløbsslange' } },
    item_cover: { type: 'item', settings: { title: 'Overtræk' } }
  },
  block_order: ['item_handpump', 'item_drain', 'item_hose', 'item_cover']
};

const order = data.order;
const mainIdx = order.indexOf('main');
if (mainIdx === -1) throw new Error('main section not found');
if (!order.includes('whats_included_Kp7mR2')) {
  order.splice(mainIdx + 1, 0, 'whats_included_Kp7mR2');
}

fs.writeFileSync(file, JSON.stringify(data));
console.log('OK:', data.order.slice(0, 4).join(' -> '));
