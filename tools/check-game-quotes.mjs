// Proves every handbook quote in handbook-game.html appears word for word in the handbook (Advanced_Handbook_Dashboard.html),
// in the section the game names. Run after editing either file:  node tools/check-game-quotes.mjs
// Markdown emphasis (* and **) and runs of whitespace are ignored on both sides; nothing else is.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const hb = readFileSync(join(root, 'Advanced_Handbook_Dashboard.html'), 'utf8');
const game = readFileSync(join(root, 'handbook-game.html'), 'utf8');
const data = JSON.parse(hb.match(/window\.HANDBOOK_DATA = (\{[\s\S]*?\});\s*<\/script>/)[1]);
const norm = (s) => s.replace(/\*+/g, '').replace(/\s+/g, ' ').trim();
const byId = new Map(data.sections.map((s) => [s.id, norm(s.content || '')]));
const unq = (s) => s.replace(/\\(.)/g, '$1');

const re = /sec: '([^']+)'[^{}]*?quote: '((?:[^'\\]|\\.)*)'/g;
let n = 0, bad = 0, m;
while ((m = re.exec(game))) {
  n++;
  const sec = m[1], quote = norm(unq(m[2]));
  const text = byId.get(sec) ?? [...byId.entries()].find(([id]) => id.startsWith(sec + ' ') || id === sec)?.[1];
  if (!text) { bad++; console.log('NO SECTION  ' + sec + '  ' + quote.slice(0, 60)); continue; }
  if (!text.includes(quote)) { bad++; console.log('NOT FOUND   ' + sec + '  "' + quote + '"'); }
}
console.log(n + ' quotes checked, ' + (n - bad) + ' found word for word, ' + bad + ' problems');
process.exit(bad || !n ? 1 : 0);
