/* run-iso-checks-A.cjs: clean-pixels checker on every step of batch A (iso/hb-iso-A.js), then exclusivity across all of
   batch A's scenes (and, with --all, across every other batch file that exists next to it: hb-iso-B.js, C, D).
     node tools/run-iso-checks-A.cjs [--all]       exit code 1 when anything is reported
   It uses the checkers of the iso kit (iso-explainer-kit/tools), found next to this repo. */
'use strict';
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const KIT_TOOLS = [path.resolve(ROOT, '..', 'iso-explainer-kit', 'tools'), path.join(__dirname, 'iso-kit-tools')].find((d) => fs.existsSync(path.join(d, 'checker.cjs')));
if (!KIT_TOOLS) { console.error('checker.cjs not found (expected ../iso-explainer-kit/tools)'); process.exit(2); }
const ISO = require(path.join(ROOT, 'iso', 'iso-kit.js'));
const ISOX = require(path.join(ROOT, 'iso', 'iso-explainer.js'));
const C = require(path.join(KIT_TOOLS, 'checker.cjs')), X = require(path.join(KIT_TOOLS, 'exclusivity.cjs'));
const MAP = require(path.join(ROOT, 'iso', 'hb-iso-A.js'));
const ALL = process.argv.indexOf('--all') > 0;
const ONLY = (process.argv.find((a) => a.indexOf('--only=') === 0) || '').slice(7).split(',').filter(Boolean);
const QUICK = ONLY.length > 0;

const noteBox = (n) => { const w = n.text.length * 3.4 + 7, h = 8; return [n.x - w / 2, n.y - h / 2, n.x + w / 2, n.y + h / 2]; };
let total = 0; const rows = [];
Object.keys(MAP).filter((id) => !ONLY.length || ONLY.indexOf(id) >= 0).forEach(function (id) {
  const spec = MAP[id], W = spec.W || 240, H = spec.H || 180;
  spec.steps.forEach(function (st, i) {
    const rec = C.recorder();
    const g = C.wrapKit(ISO.make(rec.ctx, { W, H, makeCanvas: null }), rec, { person: /^isoPerson$/, prop: /^(isoBox|isoCyl|isoProp)$/ });
    for (let t = 0; t < st.dur - 0.001; t += 0.1) {
      rec.frame(t);
      try { ISOX.render(spec, g, i, t); } catch (e) { console.log(id, i + 1, 'THROW', e.message); total++; break; }
    }
    const iss = C.analyze(rec.frames, {
      W, H, marquee: [8, 3, W - 8, st.chips ? 40 : 34], captionBand: [158, 177],
      captionOn: (t) => { const f = t / st.dur; return !!st.cap && ((f >= 0.12 && f < 0.48) || (f >= 0.5 && f < 0.94)); },
      notes: st.notes || [], noteBox, keyKinds: st.key || [], camDur: spec.camDur || 1,
    });
    rows.push([id, i + 1, st.title, iss.length]);
    total += iss.length;
    iss.slice(0, 10).forEach((x) => console.log(' ', id, 'step', i + 1, x.rule, '@' + x.t + 's', x.a, '|', x.b, '|', x.detail));
  });
});
console.log('\nclean-pixels checker, issues per step (batch A):');
rows.forEach((r) => console.log(' ', r[0], 'step', r[1], '(' + r[2] + ')', r[3]));
console.log('TOTAL clean-pixels issues:', total, 'in', rows.length, 'steps of', Object.keys(MAP).length, 'policies');

if (QUICK) process.exit(total ? 1 : 0);
const scenes = {};
function addScenes(map, tag) { Object.keys(map).forEach((id) => map[id].steps.forEach((st, i) => { scenes[tag + ':' + id + ':' + (i + 1)] = { L: st.dur, draw: (g, t) => ISOX.render(map[id], g, i, t) }; })); }
addScenes(MAP, 'A');
if (ALL) ['B', 'C', 'D'].forEach((b) => { const f = path.join(ROOT, 'iso', 'hb-iso-' + b + '.js'); if (fs.existsSync(f)) { try { addScenes(require(f), b); } catch (e) { console.log('could not load', f, e.message); } } });
const ex = X.check({ scenes, makeKit: (ctx) => ISO.make(ctx, { W: 240, H: 180, makeCanvas: null }), W: 240, H: 180, moments: 8 });
console.log('\nexclusivity (' + Object.keys(scenes).length + ' scenes) problems:', ex.problems.length);
ex.problems.forEach((p) => console.log(' ', p.id, p.rule, p.detail));
console.log('closest pairs:');
ex.closest.forEach((c) => console.log('  ', c.a, '~', c.b, 'exact', Math.round(c.diff * 100) + '%', 'structure', Math.round(c.struct * 100) + '%'));
process.exit(total + ex.problems.length ? 1 : 0);
