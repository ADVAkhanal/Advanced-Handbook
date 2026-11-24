/* patch-page-iso-stack-phone.cjs: on a phone (up to 640 px) the stacked explainer uses the card's own side padding too (margin -24px each side),
   so the picture is 300 px wide instead of 252 px. Run after patch-page-iso-stack.cjs. BYTE-LEVEL edit (latin1 read and write, the page has mixed
   line endings); the edit must match exactly once, or nothing is written. A second run reports "already patched". */
'use strict';
const fs = require('fs'), path = require('path');
const FILE = path.join(__dirname, '..', 'Advanced_Handbook_Dashboard.html');
let s = fs.readFileSync(FILE).toString('latin1');
if (s.indexOf('.hbv{margin-left:-24px;margin-right:-24px}') >= 0) { console.log('already patched'); process.exit(0); }
const from = '@media (max-width:640px){.hbv-w{grid-template-columns:auto minmax(0,1fr);';
const to = '@media (max-width:640px){.hbv{margin-left:-24px;margin-right:-24px}.hbv-w{grid-template-columns:auto minmax(0,1fr);';
const i = s.indexOf(from);
if (i < 0) throw new Error('missing: phone media rule (run patch-page-iso-stack.cjs first)');
if (s.indexOf(from, i + 1) >= 0) throw new Error('not unique: phone media rule');
s = s.slice(0, i) + to + s.slice(i + from.length);
fs.writeFileSync(FILE, Buffer.from(s, 'latin1'));
console.log('patched');
