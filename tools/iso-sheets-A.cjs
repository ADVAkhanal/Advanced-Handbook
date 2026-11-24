/* iso-sheets-A.cjs: contact sheets for handbook batch A (iso/hb-iso-A.js), made with a REAL canvas.
     node tools/iso-sheets-A.cjs all                    -> iso/sheets-A/<id>.png, one row per step, five moments (15/35/55/75/90 %)
     node tools/iso-sheets-A.cjs <id> [step moment% scale]  -> one frame, big (iso/sheets-A/frame.png)
   The canvas package is found with require('canvas'), or in the folder named by the ISO_CANVAS_DIR environment variable.
   The sign, caption, notes and big card are drawn approximately (they are HTML in the real page). */
'use strict';
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
let createCanvas;
try { ({ createCanvas } = require('canvas')); } catch (e) { ({ createCanvas } = require(path.join(process.env.ISO_CANVAS_DIR || '', 'node_modules', 'canvas'))); }
const ISO = require(path.join(ROOT, 'iso', 'iso-kit.js'));
const ISOX = require(path.join(ROOT, 'iso', 'iso-explainer.js'));
const MAP = require(path.join(ROOT, 'iso', 'hb-iso-A.js'));
const OUT = path.join(ROOT, 'iso', 'sheets-A');
const MOMENTS = [0.15, 0.35, 0.55, 0.75, 0.9];
const safe = (id) => id.replace(/[^A-Za-z0-9.-]+/g, '_');

function frame(spec, i, t, S) {
  const W = spec.W || 240, H = spec.H || 180;
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  const g = ISO.make(ctx, { W, H, makeCanvas: (w, h) => createCanvas(w, h) });
  ISOX.render(spec, g, i, t);
  const out = createCanvas(W * S, H * S), c = out.getContext('2d');
  c.imageSmoothingEnabled = false; c.drawImage(cv, 0, 0, W * S, H * S);
  const st = spec.steps[i], f = t / st.dur;
  c.font = 'bold ' + Math.round(11 * S) + 'px sans-serif';
  const title = st.title.toUpperCase(), tw = c.measureText(title).width, chips = st.chips || [];
  const mw = Math.max(tw + 30 * S, 80 * S), mh = (chips.length ? 28 : 21) * S, mx = (W * S - mw) / 2, my = 5 * S;
  c.fillStyle = '#f1ece2'; c.fillRect(mx, my, mw, mh); c.strokeStyle = '#16191c'; c.lineWidth = Math.max(1, S * 0.8); c.strokeRect(mx, my, mw, mh);
  c.fillStyle = '#e03131'; c.beginPath(); c.arc(mx + 9 * S, my + 10 * S, 5.5 * S, 0, 7); c.fill();
  c.fillStyle = '#fff'; c.font = 'bold ' + Math.round(7 * S) + 'px sans-serif'; c.fillText(String(i + 1), mx + 7 * S, my + 12.5 * S);
  c.fillStyle = '#16191c'; c.font = 'bold ' + Math.round(10 * S) + 'px sans-serif'; c.fillText(title, mx + 18 * S, my + 10 * S);
  c.font = 'bold ' + Math.round(5 * S) + 'px sans-serif'; c.fillStyle = '#3d4349'; c.fillText(st.sub || '', mx + 18 * S, my + 17 * S);
  const act = st.chipAt ? st.chipAt(t) : Math.min(chips.length - 1, Math.floor(f * chips.length));
  let cx = mx + 18 * S; chips.forEach((ch, k) => { const w = c.measureText(ch.toUpperCase()).width + 4 * S; c.fillStyle = k === act ? '#e03131' : '#c9c2b2'; c.fillRect(cx, my + 19 * S, w, 6 * S); c.fillStyle = k === act ? '#fff' : '#16191c'; c.fillText(ch.toUpperCase(), cx + 2 * S, my + 23.6 * S); cx += w + 2 * S; });
  c.font = 'bold ' + Math.round(5 * S) + 'px sans-serif'; const tg = st.tag || 'REAL SPEED';
  c.fillStyle = tg === 'REAL SPEED' ? '#16191c' : '#e03131'; c.fillRect(4 * S, my + mh + 3 * S, c.measureText(tg).width + 5 * S, 8 * S);
  c.fillStyle = '#fff'; c.fillText(tg, 6.5 * S, my + mh + 8.6 * S);
  if (st.cap) {
    const k = f >= 0.12 && f < 0.48 ? 0 : (f >= 0.5 && f < 0.94 ? 1 : -1);
    if (k >= 0 && st.cap[k]) {
      c.font = 'bold ' + Math.round(7 * S) + 'px sans-serif'; const w = c.measureText(st.cap[k].toUpperCase()).width + 8 * S;
      c.fillStyle = '#f1ece2'; c.fillRect((W * S - w) / 2, (H - 17) * S, w, 12 * S); c.strokeRect((W * S - w) / 2, (H - 17) * S, w, 12 * S);
      c.fillStyle = '#16191c'; c.fillText(st.cap[k].toUpperCase(), (W * S - w) / 2 + 4 * S, (H - 8.5) * S);
    }
  }
  (st.notes || []).forEach((n) => { if (t >= n.a && t < n.b) { c.font = 'bold ' + Math.round(6 * S) + 'px sans-serif'; const w = c.measureText(n.text.toUpperCase()).width + 6 * S; c.fillStyle = '#f1ece2'; c.fillRect(n.x * S - w / 2, n.y * S - 5 * S, w, 10 * S); c.strokeRect(n.x * S - w / 2, n.y * S - 5 * S, w, 10 * S); c.fillStyle = '#16191c'; c.fillText(n.text.toUpperCase(), n.x * S - w / 2 + 3 * S, n.y * S + 2 * S); } });
  if (st.big && t > 0.7) {
    const nTxt = st.big.n, lTxt = st.big.label.toUpperCase();
    const nW = nTxt.length * 21.5, lW = lTxt.length * 5.6, bw = Math.max(nW, lW) + 20, bh = 70;
    const bx = st.big.pos === 'left' ? 7.2 : st.big.pos === 'right' ? W - 7.2 - bw : (W - bw) / 2, by = H - 19.8 - bh;
    c.fillStyle = '#f1ece2'; c.fillRect(bx * S, by * S, bw * S, bh * S); c.lineWidth = 1.7 * S; c.strokeStyle = '#16191c'; c.strokeRect(bx * S, by * S, bw * S, bh * S);
    c.fillStyle = '#e03131'; c.font = 'bold ' + Math.round(48 * S) + 'px sans-serif'; c.textAlign = 'center'; c.fillText(nTxt, (bx + bw / 2) * S, (by + 45) * S, (bw - 12) * S);
    c.fillStyle = '#16191c'; c.font = 'bold ' + Math.round(11 * S) + 'px sans-serif'; c.fillText(lTxt, (bx + bw / 2) * S, (by + 63) * S, (bw - 12) * S); c.textAlign = 'left';
  }
  return out;
}

function sheet(id, spec) {
  const W = spec.W || 240, H = spec.H || 180, S = 1, pad = 3;
  const rows = spec.steps.length, out = createCanvas(MOMENTS.length * (W * S + pad) + pad, rows * (H * S + pad) + pad), c = out.getContext('2d');
  c.fillStyle = '#0b0c0d'; c.fillRect(0, 0, out.width, out.height);
  spec.steps.forEach((st, i) => MOMENTS.forEach((m, k) => { c.drawImage(frame(spec, i, st.dur * m, S), pad + k * (W * S + pad), pad + i * (H * S + pad)); }));
  fs.mkdirSync(OUT, { recursive: true });
  const fp = path.join(OUT, safe(id) + '.png'); fs.writeFileSync(fp, out.toBuffer('image/png')); console.log('wrote', fp);
}

const a = process.argv.slice(2);
if (!a.length || a[0] === 'all') Object.keys(MAP).forEach((id) => sheet(id, MAP[id]));
else if (a.length === 1) { const id = Object.keys(MAP).find((k) => k === a[0] || k.indexOf(a[0]) === 0); sheet(id, MAP[id]); }
else {
  const id = Object.keys(MAP).find((k) => k === a[0] || k.indexOf(a[0]) === 0), spec = MAP[id], i = +a[1], m = +a[2] / 100, S = +(a[3] || 3);
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'frame.png'), frame(spec, i, spec.steps[i].dur * m, S).toBuffer('image/png')); console.log('wrote', path.join(OUT, 'frame.png'));
}
