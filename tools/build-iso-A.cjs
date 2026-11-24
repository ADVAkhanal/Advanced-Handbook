/* build-iso-A.cjs: joins tools/iso-A-src/*.js (sorted by name) into iso/hb-iso-A.js.
   00-head.js and zz-tail.js are the frame; every other file is one policy. Run: node tools/build-iso-A.cjs */
'use strict';
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, 'iso-A-src');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort();
let out = '';
files.forEach((f) => { let s = fs.readFileSync(path.join(dir, f), 'utf8'); if (!s.endsWith('\n')) s += '\n'; out += s; });
fs.writeFileSync(path.join(__dirname, '..', 'iso', 'hb-iso-A.js'), out);
console.log('built iso/hb-iso-A.js from', files.length, 'parts,', out.length, 'bytes');
