// Fact check for batch C of the handbook isometric explainers (iso/hb-iso-C.js, iso/facts-C.json).
// Reads the policy text from the page itself (Advanced_Handbook_Dashboard.html, DATA.sections), loads the specs, and fails when:
//   - a fact's source sentence is not in that section's text
//   - a fact's shown words are not on screen (title, sub, caption, chip, note, big card, blurb) for that section
//   - a number on screen is not a number in the text, or a quoted phrase / an acronym on screen is not in the text
//   - a big card is not tied to a fact, a section has fewer than 3 facts, or a section has no 3 step spec
//   - the on-screen text holds a dash, an arrow glyph or an emoji
// Run after editing either file:  node tools/check-iso-facts-C.mjs
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const req = createRequire(import.meta.url);
const hb = readFileSync(join(root, 'Advanced_Handbook_Dashboard.html'), 'utf8');
const data = JSON.parse(hb.match(/window\.HANDBOOK_DATA = (\{[\s\S]*?\});\s*<\/script>/)[1]);
const facts = JSON.parse(readFileSync(join(root, 'iso', 'facts-C.json'), 'utf8'));

// the kit files are plain scripts that attach to window; give them one in Node
globalThis.window = globalThis;
req(join(root, 'iso', 'iso-kit.js'));
req(join(root, 'iso', 'iso-explainer.js'));
req(join(root, 'iso', 'hb-iso-C.js'));
const SPECS = globalThis.HB_ISO || {};

const IDS = ['6.1', '6.2', '6.3', '6.4', '6.5', '6.6', '6.7', '6.8', '6.9', '6.10', '6.11', '6.12', '6.13', 'OK-Access to Personnel and Medica', '7.1', '7.2', '7.3', '7.4', '7.5', '7.6', '7.7'];
// markdown marks, curly quotes, double quotes and runs of white space do not count
const norm = (s) => String(s).replace(/\*+/g, '').replace(/[‘’]/g, "'").replace(/[“”"]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
const rawNorm = (s) => String(s).replace(/\*+/g, '').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let problems = 0, checks = 0;
const bad = (id, msg) => { problems++; console.log('FAIL  ' + id + '  ' + msg); };

for (const id of IDS) {
  const sec = data.sections.find((s) => s.id === id);
  if (!sec) { bad(id, 'section not found in the page'); continue; }
  const text = norm(sec.content || ''), rawText = rawNorm(sec.content || '');
  const textNoDots = rawText.replace(/\./g, '');
  const spec = SPECS[id];
  if (!spec) { bad(id, 'no spec registered in window.HB_ISO'); continue; }
  if (!Array.isArray(spec.steps) || spec.steps.length !== 3) bad(id, 'expected 3 steps, found ' + (spec.steps ? spec.steps.length : 0));
  const last = spec.steps[spec.steps.length - 1];
  if (!last || !last.big) bad(id, 'last step has no big card');

  // everything a viewer can read; titles are upper case signs, the rest keeps its case
  const signs = [], prose = [];
  spec.steps.forEach((st) => {
    signs.push(st.title);
    prose.push(st.sub);
    (st.cap || []).forEach((c) => prose.push(c));
    (st.chips || []).forEach((c) => prose.push(c));
    (st.notes || []).forEach((n) => prose.push(n.text));
    if (st.big) { prose.push(st.big.label); signs.push(st.big.n); }
  });
  prose.push(spec.blurb || '');
  const shown = signs.concat(prose).filter(Boolean);
  const shownNorm = shown.map(norm);

  // numbers
  shown.forEach((s) => (s.match(/\d+/g) || []).forEach((n) => { checks++; if (!new RegExp('(?<!\\d)' + n + '(?!\\d)').test(text)) bad(id, 'number ' + n + ' on screen is not in the text: "' + s + '"'); }));
  // quoted phrases
  shown.forEach((s) => (s.match(/["“][^"”]+["”]/g) || []).forEach((q) => { checks++; if (!text.includes(norm(q))) bad(id, 'quoted phrase not in the text: ' + q); }));
  // acronyms and forms named on screen (mixed case strings only; the sign titles are upper case by design)
  const okWords = new Set(['OK']);
  prose.forEach((s) => (s.match(/\b[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*\b/g) || []).forEach((w) => {
    if (w.length < 2 || okWords.has(w)) return; checks++;
    if (!rawText.includes(w) && !textNoDots.includes(w)) bad(id, 'name ' + w + ' on screen is not in the text: "' + s + '"');
  }));
  // style: no dashes, arrows or emoji on screen
  shown.forEach((s) => { checks++; if (/[\u2013\u2014\u2192\u2190\u2191\u2193\u27a1\u25b6]|->|<-|[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u.test(s)) bad(id, 'dash, arrow or emoji on screen: "' + s + '"'); });

  // the facts file
  const fl = facts[id] || [];
  if (fl.length < 3) bad(id, 'fewer than 3 facts listed');
  fl.forEach((f) => {
    checks++;
    if (!text.includes(norm(f.source))) bad(id, 'source not in the text: "' + f.source + '"');
    const sn = norm(f.shown);
    if (!shownNorm.some((x) => x.includes(sn))) bad(id, 'shown words are not on screen: "' + f.shown + '"');
  });
  // the big card is tied to a fact: its label (or its short word) sits in a fact's shown words, or the other way round
  if (last && last.big) {
    checks++;
    const n = norm(last.big.n), lab = norm(last.big.label);
    const wb = (a, b) => new RegExp('(^|[^a-z0-9])' + esc(a) + '([^a-z0-9]|$)').test(b);
    const tied = fl.some((f) => { const s = norm(f.shown); return wb(lab, s) || wb(s, lab) || wb(n, s); });
    if (!tied) bad(id, 'big card "' + last.big.n + ' / ' + last.big.label + '" is not tied to a listed fact');
  }
  console.log((problems ? '' : '') + 'ok    ' + id.padEnd(36) + spec.steps.length + ' steps, ' + fl.length + ' facts, ' + shown.length + ' strings read');
}
const extra = Object.keys(SPECS).filter((k) => !IDS.includes(k));
if (extra.length) bad('specs', 'unexpected ids registered: ' + extra.join(', '));
console.log(IDS.length + ' sections, ' + checks + ' checks, ' + problems + ' problems');
process.exit(problems ? 1 : 0);
