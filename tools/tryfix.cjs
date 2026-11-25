// tryfix.cjs <file> <spec id> <exact text> <candidate1> [<candidate2> ...]
// Tries each replacement of <exact text> in <file>, runs that one spec's checks (tools/run-iso-checks-all.cjs --only=<id>, about 1.5 s),
// and keeps the first candidate that reports 0 issues. Nothing found: the file is put back exactly as it was.
const fs = require('fs'), cp = require('child_process'), path = require('path');
const [file, id, from, ...cands] = process.argv.slice(2);
const ROOT = path.resolve(__dirname, '..');
const orig = fs.readFileSync(file, 'utf8');
if (orig.split(from).length !== 2) { console.log('expected exactly one match for:', from, '- found', orig.split(from).length - 1); process.exit(2); }
function issues() {
  const r = cp.spawnSync(process.execPath, [path.join(ROOT, 'tools', 'run-iso-checks-all.cjs'), '--only=' + id], { encoding: 'utf8' });
  const m = /issues: (\d+)/.exec(r.stdout || ''); return m ? +m[1] : 999;
}
console.log('now:', issues(), 'issues');
let kept = null;
for (const c of cands) {
  fs.writeFileSync(file, orig.replace(from, () => c));
  const n = issues(); console.log(n === 0 ? 'OK  ' : 'FAIL(' + n + ')', c);
  if (n === 0) { kept = c; break; }
}
if (!kept) { fs.writeFileSync(file, orig); console.log('no candidate worked; file restored'); process.exit(1); }
console.log('kept:', kept);
