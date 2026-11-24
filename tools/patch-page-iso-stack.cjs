/* patch-page-iso-stack.cjs: the in-page policy video is stacked full width ABOVE the policy text at every width (video up to 760 px,
   left aligned, so the kit always takes its wide layout on a laptop). The text row below holds the number, title, opening words and
   the 'Play full screen' button. BYTE-LEVEL edit (the page has mixed line endings: read and written as latin1, only the matched text
   changes). The edit must match exactly once, or nothing is written.
   Run once:  node tools/patch-page-iso-stack.cjs   (a second run reports "already patched"). */
'use strict';
const fs = require('fs'), path = require('path');
const FILE = path.join(__dirname, '..', 'Advanced_Handbook_Dashboard.html');
let s = fs.readFileSync(FILE).toString('latin1');
if (s.indexOf('/* stacked explainer */') >= 0) { console.log('already patched'); process.exit(0); }
const from = '@media (min-width:1100px){.hbv{margin:4px -16px 22px -90px;grid-template-columns:minmax(0,58fr) minmax(0,42fr)}}@media (max-width:1099px){.hbv{grid-template-columns:1fr}}@media (min-width:821px) and (max-width:1099px){.hbv{margin:4px -16px 22px -90px}}@media (max-width:820px){.hbv-tv{';
const to = '/* stacked explainer */.hbv{display:block;margin:4px 0 22px}' +
  '.hbv>.hbv-isow,.hbv>.hbv-st{max-width:760px}' +
  '.hbv-w{max-width:760px;margin-top:16px;display:grid;grid-template-columns:auto minmax(0,1fr) auto;column-gap:20px;align-items:start}' +
  '.hbv-w .n{grid-column:1;grid-row:1/span 3;margin:0}.hbv-w h4{grid-column:2;grid-row:1;margin:4px 0 8px}.hbv-w p{grid-column:2;grid-row:2}.hbv-w .c{grid-column:2;grid-row:3;margin:0}' +
  '.hbv-w>div:last-child{grid-column:3;grid-row:1/span 3;align-self:center}' +
  '@media (max-width:640px){.hbv-w{grid-template-columns:auto minmax(0,1fr);column-gap:14px}.hbv-w .n{font-size:40px;grid-row:1}.hbv-w h4{font-size:22px;margin:0}.hbv-w p,.hbv-w .c{grid-column:1/-1}.hbv-w p{grid-row:2;margin-top:10px}.hbv-w .c{grid-row:3;margin-top:2px}.hbv-w>div:last-child{grid-column:1/-1;grid-row:4;margin-top:12px}}' +
  '@media (max-width:820px){.hbv-tv{';
const i = s.indexOf(from);
if (i < 0) throw new Error('missing: media rules');
if (s.indexOf(from, i + 1) >= 0) throw new Error('not unique: media rules');
s = s.slice(0, i) + to + s.slice(i + from.length);
fs.writeFileSync(FILE, Buffer.from(s, 'latin1'));
console.log('patched');
