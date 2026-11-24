// Proves every number, name and rule on a batch B explainer (iso/hb-iso-B.js: sign title and subtitle, captions, note chips, big card)
// comes from the policy's own text in Advanced_Handbook_Dashboard.html (DATA.sections, parsed from the page, never hand copied).
//   node tools/check-iso-facts-B.mjs
// For each displayed string, iso/facts-B.json records the exact handbook words that support it. The check fails when:
//   - a displayed string has no recorded source (generic chips and speed tags are the only exception),
//   - a recorded source is not found word for word in the section (Markdown emphasis, runs of whitespace, case and curly quotes are ignored),
//   - a number (digits, $ amounts, number words such as two or one-half) in a displayed string is missing from its recorded source,
//   - a recorded fact line is no longer shown anywhere (stale), a spec title differs from the section title, or the house style is broken
//     (sign title not upper case or over 24 characters, caption over 48, big label over 22, big number over 6, dashes, emoji, arrow glyphs).
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const hb = readFileSync(join(root, 'Advanced_Handbook_Dashboard.html'), 'utf8');
const data = JSON.parse(hb.match(/window\.HANDBOOK_DATA = (\{[\s\S]*?\});\s*<\/script>/)[1]);
const facts = JSON.parse(readFileSync(join(root, 'iso', 'facts-B.json'), 'utf8'));
const HB = require('../iso/hb-iso-B.js');

const norm = (s) => String(s).replace(/\*+/g, '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim().toLowerCase();
const sections = new Map(data.sections.map((s) => [s.id, { title: norm(s.title || ''), text: norm((s.title || '') + ' ' + (s.content || '')) }]));
const BANNED = new RegExp('[' + ['2013', '2014', '2190-' + '21ff', '2600-' + '27bf', 'd83c-dbff'].map((c) => c.split('-').map((h) => String.fromCharCode(92) + 'u' + h).join('-')).join('') + ']');
const generic = new Set(facts.generic || []);
const NUMWORDS = 'one two three four five six seven eight nine ten eleven twelve thirty forty fifty sixty ninety hundred half'.split(' ');
const numbersOf = (s) => {
  const out = [], low = norm(s);
  (low.match(/\$?\d[\d,]*(?:\.\d+)?/g) || []).forEach((x) => out.push(x.replace(/^\$/, '')));
  NUMWORDS.forEach((w) => { if (new RegExp('\\b' + w + '\\b').test(low)) out.push(w); });
  return out;
};
const hasNumber = (num, phrase) => (/^\d/.test(num) ? new RegExp('(^|[^\\d.,])' + num.replace(/\./g, '\\.') + '([^\\d]|$)').test(phrase) : new RegExp('\\b' + num + '\\b').test(phrase));

let shown = 0, checked = 0, problems = 0, generics = 0;
const bad = (id, what, detail) => { problems++; console.log('PROBLEM  ' + id + '  ' + what + (detail ? '  ' + detail : '')); };

Object.keys(HB).forEach((id) => {
  const spec = HB[id], sec = sections.get(id), fs = facts.sections[id];
  if (!sec) { bad(id, 'NO SECTION in the page'); return; }
  if (!fs) { bad(id, 'NO FACTS recorded'); return; }
  if (norm(spec.title) !== sec.title) bad(id, 'TITLE differs from the section title', '"' + spec.title + '"');
  const used = new Set();
  const lines = [['blurb', spec.blurb]];
  spec.steps.forEach((st, i) => {
    const p = 'step ' + (i + 1) + ' ';
    lines.push([p + 'sign title', st.title], [p + 'sign subtitle', st.sub]);
    (st.cap || []).forEach((c, k) => lines.push([p + 'caption ' + (k + 1), c]));
    (st.notes || []).forEach((n, k) => lines.push([p + 'note ' + (k + 1), n.text]));
    (st.chips || []).forEach((c) => lines.push([p + 'chip', c]));
    lines.push([p + 'speed tag', st.tag || 'REAL SPEED']);
    if (st.big) lines.push([p + 'big number', st.big.n], [p + 'big label', st.big.label]);
    if (st.title !== st.title.toUpperCase() || st.title.length > 24) bad(id, p + 'sign title must be upper case, 24 characters or fewer', st.title);
    (st.cap || []).forEach((c) => { if (c.length > 48) bad(id, p + 'caption over 48 characters', c); });
    if (st.big && st.big.label.length > 22) bad(id, p + 'big label over 22 characters (the card grows wider than the picture)', st.big.label);
    if (st.big && st.big.n.length > 6) bad(id, p + 'big number over 6 characters (the card grows wider than the picture)', st.big.n);
  });
  lines.forEach(([where, s]) => {
    shown++;
    if (BANNED.test(s)) bad(id, where + ' has a dash, arrow or emoji', s);
    if (generic.has(s)) { generics++; return; }
    const rec = fs.lines[s];
    if (rec === undefined) { bad(id, where + ' has no recorded source', '"' + s + '"'); return; }
    used.add(s); checked++;
    const phrases = Array.isArray(rec) ? rec : [rec], pn = phrases.map(norm);
    phrases.forEach((ph, k) => { if (!sec.text.includes(pn[k])) bad(id, where + ' source NOT FOUND in the section', '"' + ph + '"'); });
    numbersOf(s).forEach((num) => { if (!pn.some((ph) => hasNumber(num, ph))) bad(id, where + ' number "' + num + '" is not in its recorded source', '"' + s + '"'); });
  });
  Object.keys(fs.lines).forEach((s) => { if (!used.has(s) && !generic.has(s)) bad(id, 'STALE fact line (not shown any more)', '"' + s + '"'); });
});
Object.keys(facts.sections).forEach((id) => { if (!HB[id]) bad(id, 'facts recorded for a policy that has no explainer'); });

console.log(Object.keys(HB).length + ' explainers, ' + shown + ' strings shown (' + generics + ' generic chips and tags), ' + checked + ' checked against the page text, ' + problems + ' problems');
process.exit(problems || !shown ? 1 : 0);
