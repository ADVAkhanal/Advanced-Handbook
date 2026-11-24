/* patch-page-iso-wide.cjs: gives the in-page policy video a wider stage on desktop, with BYTE-LEVEL edits (the page has mixed line
   endings: it is read and written as latin1 and only the matched text changes). Every edit must match exactly once, or nothing is written.
     from 1100 px wide: the video takes 58% of the block and starts in the number gutter (left margin -90px, right -16px), the text sits beside it
     under 1100 px: the video stacks above the text (it was 820 px) (from 821 px it also uses the number gutter; a phone keeps the page margins)
   Run once:  node tools/patch-page-iso-wide.cjs   (a second run reports "already patched"). */
'use strict';
const fs = require('fs'), path = require('path');
const FILE = path.join(__dirname, '..', 'Advanced_Handbook_Dashboard.html');
let s = fs.readFileSync(FILE).toString('latin1');
if (s.indexOf('min-width:821px) and (max-width:1099px)') >= 0) { console.log('already patched'); process.exit(0); }
const from = '@media (max-width:820px){.hbv{grid-template-columns:1fr}.hbv-tv{';
const to = '@media (min-width:1100px){.hbv{margin:4px -16px 22px -90px;grid-template-columns:minmax(0,58fr) minmax(0,42fr)}}@media (max-width:1099px){.hbv{grid-template-columns:1fr}}@media (min-width:821px) and (max-width:1099px){.hbv{margin:4px -16px 22px -90px}}@media (max-width:820px){.hbv-tv{';
const i = s.indexOf(from);
if (i < 0) throw new Error('missing: media rule');
if (s.indexOf(from, i + 1) >= 0) throw new Error('not unique: media rule');
s = s.slice(0, i) + to + s.slice(i + from.length);
fs.writeFileSync(FILE, Buffer.from(s, 'latin1'));
console.log('patched');
