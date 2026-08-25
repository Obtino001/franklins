const fs = require('fs');

function parse(file) {
  let raw = fs.readFileSync(file, 'utf8');
  let header = '';
  if (raw.trimStart().startsWith('/*')) {
    const i = raw.indexOf('*/');
    header = raw.slice(0, i + 2) + '\n';
    raw = raw.slice(i + 2).trim();
  }
  return { header, data: JSON.parse(raw), pretty: raw.includes('\n  ') };
}

function write(file, header, data, pretty) {
  fs.writeFileSync(file, header + (pretty ? JSON.stringify(data, null, 2) + '\n' : JSON.stringify(data)));
}

const BENEFITS_LIQUID = `{%- render 'martilness-pdp-extras', product: product -%}`;

const LEVERING_HTML =
  '<p>Hos Martilness bestræber vi os på at levere alle varer inden for <strong>1–3 dage</strong>. Ordrer afgivet inden kl. <strong>15.00</strong> sendes som udgangspunkt samme dag.</p><ul><li><strong>Leveringstid:</strong> 1–2 hverdage</li><li><strong>Fragtfirma:</strong> GLS</li><li><strong>Fragt:</strong> Altid gratis til GLS pakkeshop</li><li><strong>Tilfredshedsgaranti:</strong> 30 dage</li></ul><p>Spørgsmål? Skriv til <a href="mailto:info@martilness.dk">info@martilness.dk</a> eller ring +45 2779 6900.</p>';

const { header, data, pretty } = parse('templates/product.json');
const details = data.sections.main.blocks['product-details'];

// 1) Trust policy texts
function setTextInTree(obj, from, to) {
  if (!obj || typeof obj !== 'object') return;
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string' && v.includes(from)) obj[k] = v.split(from).join(to);
    else if (typeof v === 'object') setTextInTree(v, from, to);
  }
}
setTextInTree(details, 'Dag-til-dag levering', 'Levering: 1-2 hverdage');
setTextInTree(details, 'Fri fragt over 499 kr.', 'Altid GRATIS fragt');
setTextInTree(details, '100% diskret levering', '30 dages tilfredshedsgaranti');
setTextInTree(details, 'Hos Franklins.dk', 'Hos Martilness');
setTextInTree(details, 'Franklins.dk', 'Martilness.dk');
setTextInTree(details, 'butik i Herning', 'dansk lager');
setTextInTree(details, '100 % diskret:', 'Altid gratis fragt:');
setTextInTree(
  details,
  'Neutral emballage uden logo eller afsendernavn',
  'Gratis fragt på alle ordrer til GLS pakkeshop'
);
setTextInTree(
  details,
  'Din privathed er vigtig for os. Hverken postbud eller naboer kan se, hvad pakken indeholder.',
  'Du har 30 dages tilfredshedsgaranti. Spørgsmål? info@martilness.dk / +45 2779 6900.'
);

// Replace levering accordion body if still old
function findAndSetLevering(obj) {
  if (!obj || typeof obj !== 'object') return;
  if (obj.settings && obj.settings.text === 'Levering') {
    // sibling content in blocks
  }
  if (obj.settings && typeof obj.settings.text === 'string' && obj.settings.text.includes('sender vi alle ordrer')) {
    obj.settings.text = LEVERING_HTML;
  }
  for (const v of Object.values(obj)) {
    if (typeof v === 'object') findAndSetLevering(v);
  }
}
findAndSetLevering(details);

// 2) Insert benefits custom liquid
details.blocks.custom_liquid_benefits = {
  type: 'custom-liquid',
  name: 'Fordele + spar',
  settings: {
    custom_liquid: BENEFITS_LIQUID,
    'padding-block-start': 0,
    'padding-block-end': 0,
    'padding-inline-start': 0,
    'padding-inline-end': 0,
    'mobile-padding-scale': 80,
  },
  blocks: {},
};

// Reorder: title/price group → benefits → variant → trust policies → buy → shipping date → bundle → accordion → recs
details.block_order = [
  'product_information_group_zx4NRb',
  'custom_liquid_benefits',
  'variant_picker_NYNfW9',
  'group_ngeVTK',
  'buy_buttons_rhMNwM',
  'shipping_date_8NUgUx',
  'custom_liquid_6UVzQf',
  'accordion_U9n4kg',
  'product_recommendations_CQcChJ',
];

// Policy group: make it feel more like 3 cards - slightly tighter
if (details.blocks.group_ngeVTK) {
  details.blocks.group_ngeVTK.settings.column_gap = 12;
  details.blocks.group_ngeVTK.settings.column_gap_mobile = 8;
  details.blocks.group_ngeVTK.settings.width = 'fill';
}

// 3) What's included → saunatæppe style defaults (editable)
if (data.sections.whats_included_Kp7mR2) {
  data.sections.whats_included_Kp7mR2.settings.heading = 'Hvad er inkluderet?';
  data.sections.whats_included_Kp7mR2.blocks = {
    item_1: { type: 'item', settings: { title: 'Saunatæppe' } },
    item_2: { type: 'item', settings: { title: 'Fiber håndklæde' } },
    item_3: { type: 'item', settings: { title: 'Controller' } },
    item_4: { type: 'item', settings: { title: 'Dansk manual' } },
    item_5: { type: 'item', settings: { title: 'Stofpose' } },
  };
  data.sections.whats_included_Kp7mR2.block_order = ['item_1', 'item_2', 'item_3', 'item_4', 'item_5'];
}

// 4) Remove empty marquee from PDP order
if (data.sections.custom_section_4XBchF) {
  delete data.sections.custom_section_4XBchF;
}
data.order = data.order.filter((id) => id !== 'custom_section_4XBchF');

// ATC button primary style
try {
  details.blocks.buy_buttons_rhMNwM.blocks['add-to-cart'].settings.style = 'primary';
} catch (e) {}

write('templates/product.json', header, data, pretty);
console.log('PDP updated');
console.log('details order:', details.block_order);
console.log('page order:', data.order);
