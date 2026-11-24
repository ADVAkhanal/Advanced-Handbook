/* check-page-scripts.cjs: extracts every inline <script> (without a src) from the handbook page and runs node --check on each.
     node tools/check-page-scripts.cjs [page.html]      exit code 1 when a script has a syntax error */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const file = process.argv[2] || path.join(__dirname, '..', 'Advanced_Handbook_Dashboard.html');
const html = fs.readFileSync(file, 'utf8');
const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pagejs-'));
let m, n = 0, bad = 0;
while ((m = re.exec(html))) {
  if (/\bsrc\s*=/.test(m[1])) continue;
  if (/type\s*=\s*["'](?!text\/javascript|module)/.test(m[1])) continue;
  n++;
  const idm = /id\s*=\s*["']([^"']+)["']/.exec(m[1]), name = (idm ? idm[1] : 'script' + n) + '.js', f = path.join(tmp, name);
  fs.writeFileSync(f, m[2]);
  const r = cp.spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  if (r.status !== 0) { bad++; console.log('SYNTAX ERROR in ' + name + '\n' + r.stderr); } else console.log('ok   ' + name + ' (' + m[2].length + ' chars)');
}
console.log(n + ' inline scripts checked, ' + bad + ' with errors');
process.exit(bad ? 1 : 0);
