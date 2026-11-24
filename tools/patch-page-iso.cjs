/* patch-page-iso.cjs: wires the iso adapter into Advanced_Handbook_Dashboard.html with BYTE-LEVEL edits (the page has mixed line
   endings, so it is read and written as latin1 and only the matched text changes). Every edit must match exactly once, or the
   script stops without writing. Run once:  node tools/patch-page-iso.cjs   (a second run reports "already patched"). */
'use strict';
const fs = require('fs'), path = require('path');
const FILE = path.join(__dirname, '..', 'Advanced_Handbook_Dashboard.html');
let s = fs.readFileSync(FILE).toString('latin1');
if (s.indexOf('window.HBIso') >= 0) { console.log('already patched'); process.exit(0); }

function once(label, from, to) {
  const i = s.indexOf(from);
  if (i < 0) throw new Error('missing: ' + label);
  if (s.indexOf(from, i + 1) >= 0) throw new Error('not unique: ' + label);
  s = s.slice(0, i) + to + s.slice(i + from.length);
}

/* 1. video(sec): ask the adapter first, keep the old drawing as video2d (the fallback) */
once('video()',
  '  function video(sec) {\r\n',
  '  function video(sec, inTv) { var iv = window.HBIso && window.HBIso.video(sec, inTv, video2d); return iv || video2d(sec); }\r\n  function video2d(sec) {\r\n');

/* 2. TV mode: a new video replaces the old one (and frees it), and is told it is in TV mode */
once('tv show()',
  'if (cur) cur.el.remove(); cur = video(sec);',
  'if (cur) { cur.el.remove(); if (cur.dispose) cur.dispose(); } cur = video(sec, true);');

/* 3. TV mode: an explainer moves on when it has finished, the old scenes after the usual 12 seconds */
once('tv tick()',
  '(now - t0) / 1000 > HOLD) show(idx + 1);',
  '(cur && cur.finished ? cur.finished() : (now - t0) / 1000 > HOLD)) show(idx + 1);');

/* 4. TV mode: Pause also pauses the explainer */
once('tv toggle()',
  'function toggle() { paused = !paused;',
  'function toggle() { paused = !paused; if (cur && cur.setPaused) cur.setPaused(paused);');

/* 5. the one script tag, after the First Shift block */
once('script tag',
  '</script>\r\n\r\n</body>',
  '</script>\r\n\r\n<script src="iso/hb-iso-adapter.js" defer></script>\r\n\r\n</body>');

fs.writeFileSync(FILE, Buffer.from(s, 'latin1'));
console.log('patched');
