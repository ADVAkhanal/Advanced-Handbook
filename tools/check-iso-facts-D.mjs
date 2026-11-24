// check-iso-facts-D.mjs: fact check for the batch D isometric explainers (iso/hb-iso-D.js).
// Every word on a sign, caption, chip or card, and every number, must come from the policy's own text. The text is read from the page
// (window.HANDBOOK_DATA.sections), never hand copied. Claims live in iso/facts-D.json:
//   { sections: { "<section id>": { claims: [ { quote, source, uses: [ { at, text } ] } ], generic: [ { at, text } ] } } }
//   at: s1.title s1.sub s1.cap0 s1.cap1 s1.note0 s3.big   (s3.big is "N | label")      quote: words copied from the policy text
//   source: the full sentence the quote sits in                                       generic: plain framing words with no number
// Fails (exit 1) when: a quote or source is not in the section text; a number on a sign is not in its claim's quote and the section;
// a word on a sign is not in the section text; a shown string has no claim and is not listed generic; the facts file shows different
// words than the spec; a text is too long to fit the picture; non-ASCII characters or em dashes appear.
// Usage: node tools/check-iso-facts-D.mjs [--page <path to Advanced_Handbook_Dashboard.html>]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const argPage = process.argv.indexOf('--page');
const pagePath = argPage > 0 ? process.argv[argPage + 1] : path.join(repo, 'Advanced_Handbook_Dashboard.html');
const factsPath = path.join(repo, 'iso', 'facts-D.json');
const specs = require(path.join(repo, 'iso', 'hb-iso-D.js'));

const IDS = ['7.8', '7.9', '7.10', '7.11', '7.12', '7.13', '7.14', '7.15', '7.16', '7.17', 'OK-Jury Duty Leave', 'OK-Voting Leave', '8.1', '8.2', '8.3',
  'OK-Workplace Smoking', '9.1', 'CLOSE-Closing Statement', 'CLOSE-Acknowledgment of Re'];
const LIMITS = { title: 24, sub: 46, cap: 40, note: 12, bigN: 7, bigLabel: 20 };
const GENERIC_CHIPS = ['Who', 'What', 'To do'];

// ---- the policy text, read from the page
const html = fs.readFileSync(pagePath, 'utf8');
const line = html.split(/\r?\n/).find((l) => l.startsWith('window.HANDBOOK_DATA = '));
if (!line) { console.error('FAIL: window.HANDBOOK_DATA not found in ' + pagePath); process.exit(1); }
const DATA = JSON.parse(line.slice('window.HANDBOOK_DATA = '.length).trim().replace(/;$/, ''));
const secById = {}; DATA.sections.forEach((s) => { secById[s.id] = s; });

const norm = (s) => String(s).toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\*/g, '').replace(/\s+/g, ' ').trim();
const WORDNUM = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30, ninety: 90 };
function nums(s) {
  const out = new Set(); const t = norm(s);
  (t.match(/\d[\d,]*(?:\.\d+)?/g) || []).forEach((m) => out.add(String(parseFloat(m.replace(/,/g, '')))));
  (t.match(/[a-z]+/g) || []).forEach((w) => { if (w in WORDNUM) out.add(String(WORDNUM[w])); });
  return out;
}
const STOP = new Set(('a an and are as at be by for from if in is it its of on or so the to too up we you your our with who what that this than then they their them there which will may can not no do does did how any all more most only both each also but out off into over under after before while when where why have has had been being were was i me my us').split(' '));
const stem = (w) => { for (const suf of ['ing', 'ed', 'es', 's', 'd', 'e', 'ly']) if (w.length > suf.length + 2 && w.endsWith(suf)) { w = w.slice(0, -suf.length); break; } return w; };
const words = (s) => (norm(s).match(/[a-z]+/g) || []).filter((w) => w.length >= 3 && !STOP.has(w) && !(w in WORDNUM));
const fails = []; const fail = (id, msg) => fails.push(id + ': ' + msg);
let checked = 0;

// ---- facts file
let facts;
try { facts = JSON.parse(fs.readFileSync(factsPath, 'utf8')); } catch (e) { console.error('FAIL: cannot read ' + factsPath + ': ' + e.message); process.exit(1); }

IDS.forEach((id) => {
  const sec = secById[id], spec = specs[id], f = facts.sections && facts.sections[id];
  if (!sec) return fail(id, 'section not found in the page');
  if (!spec) return fail(id, 'no spec registered in HB_ISO');
  if (!f) return fail(id, 'no entry in facts-D.json');
  const source = norm(sec.title + ' \n ' + sec.content);
  const srcNums = nums(source), srcStems = new Set(words(source).map(stem));
  // ---- shape: 3 steps, about 21 s, last step is the card
  if (spec.steps.length !== 3) fail(id, 'needs 3 steps, has ' + spec.steps.length);
  const total = spec.steps.reduce((a, s) => a + s.dur, 0);
  if (total < 18 || total > 26) fail(id, 'total length ' + total + ' s, wanted about 21 s');
  spec.steps.forEach((st, i) => { if (!!st.big !== (i === spec.steps.length - 1)) fail(id, 'step ' + (i + 1) + ': the card belongs on the last step only'); });
  // ---- every shown string, by location
  const shown = {};
  spec.steps.forEach((st, i) => {
    const s = 's' + (i + 1) + '.';
    shown[s + 'title'] = st.title; if (st.sub) shown[s + 'sub'] = st.sub;
    (st.cap || []).forEach((c, k) => { shown[s + 'cap' + k] = c; });
    (st.notes || []).forEach((n, k) => { shown[s + 'note' + k] = n.text; });
    if (st.big) shown[s + 'big'] = st.big.n + ' | ' + st.big.label;
    (st.chips || []).forEach((c) => { if (GENERIC_CHIPS.indexOf(c) < 0) fail(id, 'chip "' + c + '" is not one of the three layer names'); });
    // fit
    if (st.title.length > LIMITS.title) fail(id, s + 'title is ' + st.title.length + ' characters (max ' + LIMITS.title + ')');
    if (st.sub && st.sub.length > LIMITS.sub) fail(id, s + 'sub is ' + st.sub.length + ' characters (max ' + LIMITS.sub + ')');
    (st.cap || []).forEach((c, k) => { if (c.length > LIMITS.cap) fail(id, s + 'cap' + k + ' is ' + c.length + ' characters (max ' + LIMITS.cap + ')'); });
    (st.notes || []).forEach((n, k) => { if (n.text.length > LIMITS.note) fail(id, s + 'note' + k + ' too long'); });
    if (st.big) { if (st.big.n.length > LIMITS.bigN) fail(id, s + 'big n too long'); if (st.big.label.length > LIMITS.bigLabel) fail(id, s + 'big label too long'); }
  });
  Object.keys(shown).forEach((at) => {
    const t = shown[at];
    if (/[^\x20-\x7e]/.test(t)) fail(id, at + ' has a non-ASCII character or an em dash: ' + t);
    if (/\bit's not\b.*\bit's\b/i.test(t)) fail(id, at + ' uses an "it\'s not X, it\'s Y" line');
  });
  // ---- facts entries
  const claimsFor = {}, genericAt = new Set();
  const addUse = (at, text, where) => {
    if (!(at in shown)) return fail(id, where + ': location ' + at + ' does not exist');
    if (shown[at] !== text) fail(id, where + ': ' + at + ' shows "' + shown[at] + '" but the facts file says "' + text + '"');
  };
  (f.claims || []).forEach((c, ci) => {
    const where = 'claim ' + (ci + 1);
    const q = norm(c.quote || ''), src = norm(c.source || '');
    if (!q) return fail(id, where + ': empty quote');
    if (source.indexOf(q) < 0) fail(id, where + ': quote not found in the section text: "' + c.quote + '"');
    if (!src || source.indexOf(src) < 0 || src.indexOf(q) < 0) fail(id, where + ': source sentence missing, not in the text, or does not contain the quote');
    (c.uses || []).forEach((u) => { addUse(u.at, u.text, where); (claimsFor[u.at] = claimsFor[u.at] || []).push(q); });
  });
  (f.generic || []).forEach((u) => { addUse(u.at, u.text, 'generic'); genericAt.add(u.at); });
  // ---- every shown string is claimed or generic; numbers and words come from the text
  Object.keys(shown).forEach((at) => {
    const t = shown[at]; checked++;
    const qs = claimsFor[at] || [], isGen = genericAt.has(at), tn = nums(t);
    if (!qs.length && !isGen) return fail(id, at + ' "' + t + '" has no claim and is not listed generic');
    if (qs.length && isGen) fail(id, at + ' is both claimed and generic');
    if (isGen) { if (tn.size) fail(id, at + ' "' + t + '" is listed generic but has a number'); return; }
    const qn = new Set(); qs.forEach((q) => nums(q).forEach((n) => qn.add(n)));
    tn.forEach((n) => { if (!qn.has(n)) fail(id, at + ' "' + t + '": the number ' + n + ' is not in its claim quote'); if (!srcNums.has(n)) fail(id, at + ' "' + t + '": the number ' + n + ' is not in the policy text'); });
    words(t).forEach((w) => { if (!srcStems.has(stem(w))) fail(id, at + ' "' + t + '": the word "' + w + '" is not in the policy text'); });
  });
});

if (fails.length) { console.error('FACT CHECK FAILED (' + fails.length + '):'); fails.forEach((m) => console.error('  ' + m)); process.exit(1); }
console.log('FACT CHECK PASSED: ' + IDS.length + ' policies, ' + checked + ' shown strings, every number and word traced to the policy text read from ' + path.basename(pagePath));
