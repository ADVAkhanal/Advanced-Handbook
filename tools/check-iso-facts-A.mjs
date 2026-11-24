/* check-iso-facts-A.mjs: the fact rule for handbook batch A.
     node tools/check-iso-facts-A.mjs        (exit code 1 on any failure)
   For every policy in iso/hb-iso-A.js it collects each string a viewer can read (sign title, subtitle, chips, captions, notes, big
   card) and checks them against that policy's OWN text in Advanced_Handbook_Dashboard.html (HANDBOOK_DATA):
     1. every number shown (digits, $ amounts, number words such as three, third, ninety) is in the policy text (as digits or words)
     2. every acronym or form name shown (HR, ADVANCED, PWFA, I-9 ...) is in the policy text
     3. every claim in iso/facts-A.json: its "from" sentence is in the policy text; an "exact" claim's words are inside its "from";
        its "use" is really shown in the explainer (so the table cannot drift away from the pictures)
     4. every big card (the last step) is covered by a claim
   Like tools/check-game-quotes.mjs: the source text is the page's own data, nothing is typed in twice. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const require = createRequire(import.meta.url);

const html = fs.readFileSync(path.join(ROOT, 'Advanced_Handbook_Dashboard.html'), 'utf8');
const m = html.match(/window\.HANDBOOK_DATA = (\{[\s\S]*?\});\r?\n/);
const DATA = JSON.parse(m[1]);
const SPECS = require(path.join(ROOT, 'iso', 'hb-iso-A.js'));
const FACTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'iso', 'facts-A.json'), 'utf8')).policies;

const rawText = (id) => String(DATA.sections.find((s) => s.id === id).content || '').replace(/\*+/g, '');
const norm = (s) => String(s).toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/^\s*[-•]\s*/gm, '').replace(/\s+/g, ' ').trim();
const plain = (s) => norm(s).replace(/[^a-z0-9$ -]+/g, ' ').replace(/\s+/g, ' ').trim();

const WORDS = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, twenty: 20, thirty: 30, forty: 40, fifty: 50, ninety: 90, hundred: 100, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7 };
const numbersIn = (s) => {
  const out = []; const t = norm(s);
  (t.match(/\$?\d[\d,.]*/g) || []).forEach((x) => out.push(String(parseInt(x.replace(/[$,]/g, ''), 10))));
  (t.match(/[a-z]+/g) || []).forEach((w) => { if (WORDS[w]) out.push(String(WORDS[w])); });
  return out;
};
const ACR = /\b(?:[A-Z]{2,}[A-Za-z0-9-]*|[A-Z]-\d+)\b/g;

let fails = 0, nums = 0, acrs = 0, claims = 0, bigs = 0;
const fail = (id, msg) => { fails++; console.log('FAIL ' + id + ': ' + msg); };

Object.keys(SPECS).forEach((id) => {
  const spec = SPECS[id], raw = rawText(id), text = norm(raw), textPlain = plain(raw), textNums = new Set(numbersIn(raw));
  const shown = [];   /* [where, string, isBigN] */
  spec.steps.forEach((st, i) => {
    const at = 'step ' + (i + 1);
    shown.push([at + ' title', st.title]); if (st.sub) shown.push([at + ' sub', st.sub]);
    (st.cap || []).forEach((c, k) => shown.push([at + ' caption ' + (k + 1), c]));
    (st.notes || []).forEach((n, k) => shown.push([at + ' note ' + (k + 1), n.text]));
    if (st.chips) { const own = !(st.chips.length === 3 && st.chips[0] === 'Who'); if (own) st.chips.forEach((c, k) => shown.push([at + ' chip ' + (k + 1), c])); }
    if (st.big) { shown.push([at + ' big number', st.big.n, true]); shown.push([at + ' big label', st.big.label]); }
  });
  /* 1 and 2: numbers and acronyms */
  shown.forEach(([where, s, isBig]) => {
    numbersIn(s).forEach((n) => { nums++; if (!textNums.has(n)) fail(id, where + ' "' + s + '": number ' + n + ' is not in the policy text'); });
    if (!isBig) (String(s).match(ACR) || []).forEach((a) => { acrs++; if (raw.indexOf(a) < 0) fail(id, where + ' "' + s + '": "' + a + '" is not in the policy text'); });
  });
  /* 3: claims */
  const F = FACTS[id]; if (!F) { fail(id, 'no entry in facts-A.json'); return; }
  const shownPlain = shown.map(([, s]) => plain(s));
  F.claims.forEach((c) => {
    claims++;
    const from = plain(c.from), use = plain(c.use);
    if (textPlain.indexOf(from) < 0) fail(id, 'from not found in the policy text: "' + c.from + '"');
    if (c.kind === 'exact' && from.indexOf(use) < 0) fail(id, 'exact claim "' + c.use + '" is not inside its source "' + c.from + '"');
    if (c.kind !== 'exact' && c.kind !== 'paraphrase') fail(id, 'claim "' + c.use + '" has no kind');
    if (shownPlain.indexOf(use) < 0) fail(id, 'claim "' + c.use + '" is not shown anywhere in the explainer');
  });
  /* 4: big cards */
  spec.steps.forEach((st, i) => {
    if (!st.big) return; bigs++;
    ['n', 'label'].forEach((k) => { if (!F.claims.some((c) => plain(c.use) === plain(st.big[k]))) fail(id, 'big card ' + k + ' "' + st.big[k] + '" has no claim'); });
  });
  if (!spec.steps[spec.steps.length - 1].big) fail(id, 'the last step is not a big card');
});

console.log(`\nfact check: ${Object.keys(SPECS).length} policies, ${nums} numbers, ${acrs} acronyms or form names, ${claims} claims, ${bigs} big cards: ${fails ? fails + ' FAILED' : 'all pass'}`);
process.exit(fails ? 1 : 0);
