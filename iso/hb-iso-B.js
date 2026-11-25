/* ============================================================================================================
   hb-iso-B.js  -  handbook policy explainers, batch B (20 policies): 4.6 to 4.9, nursing, meal and rest, overtime,
   5.1 to 5.12, disciplinary process.  Each policy is a 3 step isometric cutaway in its own setting:
   layer 1 = who and where, layer 2 = what happens, layer 3 = what to do (the last step ends on a big card).
   Registered as window.HB_ISO['<section id>'] = spec (needs iso-kit.js first; iso-explainer.js plays the specs).
   Every number, name and rule on a sign, caption, chip or card comes from the policy's own text: see facts-B.json
   and tools/check-iso-facts-B.mjs.  Specs are pure functions of time (no Date, no Math.random).
   ============================================================================================================ */
(function (root) {
  'use strict';
  var ISO = root.ISO || require('./iso-kit.js'), P = ISO.P, mix = ISO.mix;
  var HB = root.HB_ISO = root.HB_ISO || {};
  var CH = ['Who', 'What happens', 'What to do'];
  function ext(a, b) { var r = {}, k; for (k in a) r[k] = a[k]; for (k in b) r[k] = b[k]; return r; }

  /* ------------------------------------------------------------------ people */
  var LOOK = {
    red: { who: 'raul', h: 26, shirt: P.red, hair: '#2b2018' },
    blue: { who: 'randel', h: 26, shirt: P.blue, shirtD: P.blueS, hair: '#1f1a17', skin: P.skin2, glasses: true },
    cream: { who: 'pam', h: 26, shirt: '#dfe3e6', shirtD: '#aab1b7', hair: '#7a5b3c', glasses: true, badge: true },
    amber: { who: 'pk', h: 26, shirt: P.amber, shirtD: P.amberD, vest: true, hat: '#d8dde1', hair: '#3a2c22' },
    green: { who: 'forrest', h: 26, shirt: P.green, shirtD: P.greenD, hair: '#3a2c22', skin: P.skin3 },
    steel: { who: 'scott', h: 26, shirt: '#4c5359', shirtD: '#30353a', hair: '#cfd4d8', badge: true, skin: P.skin3, glasses: true },
    navy: { who: 'kim', h: 26, shirt: '#2b4f78', shirtD: '#1d3857', hair: '#141210', skin: P.skin2, pants: '#20262e' },
    plum: { who: 'dora', h: 26, shirt: '#7a3b52', shirtD: '#552837', hair: '#5a3a22', skin: P.skin3, badge: true },
    sand: { who: 'steve', h: 26, shirt: '#b29a6a', shirtD: '#7e6c45', hair: '#2b2018', skin: P.skin, vest: true }
  };

  /* ------------------------------------------------------------------ props only these explainers use */
  ISO.defineProp('hbBDoor', [10, 2, 24], function (s, o) {
    var w = s.w, h = s.h, open = o.open || 0, leaf = Math.max(1, Math.round((w - 2) * (1 - open * 0.85)));
    var col = o.col || P.st1;
    s.B(0, 0, 0, w, 2, h, 'dark', { rim: false });
    s.F(1, 0, w - 2, h - 5, o.inside || '#0c0e10', 2);
    s.F(1, 0, leaf, h - 5, col, 2);
    if (leaf > 5) { s.F(2, 3, leaf - 2, 5, mix(col, '#000000', 0.18), 2); s.F(2, 10, leaf - 2, 5, mix(col, '#000000', 0.18), 2); }
    s.F(Math.max(1, leaf - 2), 9, 1, 2, P.st4, 2);
    if (o.lamp) s.F(Math.round(w / 2) - 1, h - 3, 2, 2, o.lamp === 'red' ? P.redT : o.lamp === 'green' ? '#6ad79f' : P.amber, 2);
    else s.F(Math.round(w / 2) - 1, h - 3, 2, 2, P.st1, 2);
  });
  ISO.defineProp('hbBWindow', function (o) { return [o.w || 14, 1, o.h || 14]; }, function (s, o) {
    var w = s.w, h = s.h;
    s.B(0, 0, 0, w, 1, h, 'dark', { rim: false });
    s.F(1, 1, w - 2, h - 2, { fill: o.sky || '#4f7391', border: P.st3 }, 1);
    s.F(Math.round(w / 2), 1, 1, h - 2, P.st3, 1); s.F(1, Math.round(h / 2), w - 2, 1, P.st3, 1);
    if (o.sun) s.F(2, h - 5, 2, 2, '#f0d9a0', 1);
  });
  ISO.defineProp('hbBPlant', [5, 5, 13], function (s) {
    s.B(1, 1, 0, 3, 3, 4, { top: '#b0564a', left: '#8a3c2f', right: '#6a2c22' }, { rim: false });
    s.B(2, 2, 4, 1, 1, 3, 'green', { rim: false });
    s.B(0, 1, 6, 5, 3, 3, 'green', { rim: false }); s.B(1, 0, 8, 3, 5, 3, 'green', { rim: false }); s.B(2, 1, 11, 1, 3, 2, 'green', { rim: false });
  });
  ISO.defineProp('hbBChair', [6, 6, 13], function (s, o) {
    var c = o.col || 'blue';
    s.B(0, 0, 0, 1, 1, 4, 'dark', { rim: false }); s.B(5, 0, 0, 1, 1, 4, 'dark', { rim: false });
    s.B(0, 5, 0, 1, 1, 4, 'dark', { rim: false }); s.B(5, 5, 0, 1, 1, 4, 'dark', { rim: false });
    s.B(0, 0, 4, 6, 6, 2, c, { rim: false });
    s.B(0, 0, 6, 6, 1, 7, c, { rim: false });
  });
  ISO.defineProp('hbBSofa', function (o) { return [o.w || 18, 8, 11]; }, function (s, o) {
    var c = o.col || 'blue', c2 = o.col2 || 'steel', w = s.w;
    s.B(0, 0, 0, w, 8, 5, c, { shadow: true });
    s.B(0, 0, 5, w, 2, 6, c2, { rim: false });
    s.B(0, 0, 5, 2, 8, 3, c2, { rim: false }); s.B(w - 2, 0, 5, 2, 8, 3, c2, { rim: false });
    s.B(2, 2, 5, w - 4, 6, 1, mix(P.st3, '#000000', 0.1), { rim: false });
    s.F(Math.round(w / 2), 1, 1, 4, mix(P.st1, '#000000', 0.3), 8);
  });
  ISO.defineProp('hbBCar', function (o) { return [o.w || 24, 10, 11]; }, function (s, o) {
    var w = s.w, body = o.col || 'red';
    s.B(2, 1, 0, 5, 8, 3, 'black', { rim: false }); s.B(w - 8, 1, 0, 5, 8, 3, 'black', { rim: false });
    s.B(0, 0, 3, w, 10, 4, body, { shadow: true });
    s.B(Math.round(w * 0.28), 1, 7, Math.round(w * 0.46), 8, 4, 'dark', { rim: false });
    s.F(Math.round(w * 0.28) + 1, 8, Math.round(w * 0.46) - 2, 2, '#17323d', 10);
    s.F(w - 2, 4, 2, 1, P.amber, 10); s.F(0, 4, 2, 1, P.redT, 10);
  });
  ISO.defineProp('hbBPlane', [10, 8, 5], function (s, o) {
    s.B(0, 3, 1, 10, 2, 2, 'silver', { rim: false, shadow: true }); s.B(9, 3, 1, 1, 2, 2, 'red', { rim: false });
    s.B(3, 0, 2, 3, 8, 1, 'silver', { rim: false }); s.B(0, 3, 3, 2, 2, 2, 'red', { rim: false }); s.B(0, 2, 2, 2, 4, 1, 'silver', { rim: false });
  });
  ISO.defineProp('hbBGauge', function (o) { return [o.w || 10, 1, o.h || 26]; }, function (s, o) {
    var w = s.w, h = s.h, v = Math.max(0, Math.min(1, o.v || 0)), lim = Math.round((h - 6) * (o.line === undefined ? 0.7 : o.line)), tot = Math.round((h - 6) * v), i;
    s.B(0, 0, 0, w, 1, h, 'dark', { rim: false });
    s.F(1, 1, w - 2, h - 2, { fill: P.cream, border: P.st3 }, 1);
    if (tot > 0) s.F(2, 3, w - 4, Math.min(tot, lim), P.amber, 1);
    if (tot > lim) s.F(2, 3 + lim, w - 4, tot - lim, P.red, 1);
    for (i = 0; i < h - 6; i += 4) s.F(w - 3, 3 + i, 1, 1, P.st2, 1);
    s.F(1, 3 + lim, w - 2, 1, P.red2, 1);
  });
  ISO.defineProp('hbBPlaque', [5, 2, 7], function (s, o) {
    s.B(0, 0, 0, 5, 2, 7, 'cream', { rim: false });
    s.F(1, 4, 3, 2, o.col || P.green, 2); s.F(1, 1, 3, 1, P.st1, 2); s.F(2, 2, 1, 1, P.st1, 2);
  });
  ISO.defineProp('hbBMeter', function (o) { return [o.w || 28, 1, 8]; }, function (s, o) {
    var w = s.w, v = Math.max(0, Math.min(1, o.v || 0)), i, fill = Math.round((w - 4) * v);
    s.B(0, 0, 0, w, 1, 8, 'dark', { rim: false });
    s.F(1, 1, w - 2, 6, { fill: P.cream, border: P.st3 }, 1);
    if (fill > 0) s.F(2, 2, fill, 4, v >= 1 ? P.red : P.amber, 1);
    for (i = 4; i < w - 3; i += 4) s.F(i, 1, 1, 1, P.st2, 1);
    s.F(w - 3, 1, 1, 6, P.red2, 1);
  });
  ISO.defineProp('hbBScale', [16, 8, 14], function (s, o) {
    var tl = o.tilt || 0, lz = 5 + Math.round(tl * 2), rz = 5 - Math.round(tl * 2), bz = 9 + Math.round(tl * 1.5);
    s.B(4, 2, 0, 8, 4, 2, 'dark', { shadow: true }); s.B(7, 3, 2, 2, 2, 7, 'metal', { rim: false });
    s.B(1, 3, bz, 14, 2, 1, 'silver', { rim: false });
    s.B(0, 2, lz, 5, 4, 1, 'silver', { rim: false }); s.B(11, 2, rz, 5, 4, 1, 'silver', { rim: false });
    s.B(2, 3, lz + 1, 1, 2, 2, o.l || 'blue', { rim: false }); s.B(13, 3, rz + 1, 1, 2, 2, o.r || 'red', { rim: false });
  });
  ISO.defineProp('hbBPump', [7, 6, 19], function (s, o) {
    s.B(0, 0, 0, 7, 6, 3, 'dark', { shadow: true });
    s.B(1, 1, 3, 5, 4, 13, 'red', { rim: true });
    s.F(2, 12, 3, 3, o.lit ? '#12301f' : '#0c0e10', 5);
    if (o.lit) s.F(3, 13, 1, 1, P.green, 5);
    s.B(1, 1, 16, 5, 4, 3, 'dark', { rim: false });
    s.B(5, 5, 4, 1, 1, 7, 'black', { rim: false }); s.B(5, 5, 3, 2, 1, 1, 'black', { rim: false });
  });
  ISO.defineProp('hbBCalendar', [12, 1, 13], function (s, o) {
    s.B(0, 0, 0, 12, 1, 13, 'dark', { rim: false });
    s.F(1, 1, 10, 11, { fill: P.cream, border: P.st3 }, 1);
    s.F(1, 9, 10, 3, P.red, 1);
    var marks = o.marks || [], n = o.n || 0, i, c, r;
    for (r = 0; r < 4; r++) for (c = 0; c < 5; c++) {
      i = r * 5 + c;
      var on = marks.indexOf(i) >= 0 || i < n;
      s.F(2 + c * 2, 7 - r * 2, 1, 1, on ? (o.col || P.red) : P.st3, 1);
      if (on) s.F(2 + c * 2, 7 - r * 2, 2, 1, o.col || P.red, 1);
    }
  });
  ISO.defineProp('hbBChart', function (o) { return [o.w || 22, 1, o.h || 18]; }, function (s, o) {
    var w = s.w, h = s.h, bars = o.bars || [4, 6, 8], i, n = bars.length, bw = Math.max(2, Math.floor((w - 4) / n) - 1);
    s.B(0, 0, 0, w, 1, h, 'dark', { rim: false });
    s.F(1, 1, w - 2, h - 2, { fill: P.cream, border: P.st3 }, 1);
    s.F(2, 2, w - 4, 1, P.st2, 1);
    for (i = 0; i < n; i++) s.F(2 + i * (bw + 1), 3, bw, Math.max(1, Math.round(bars[i])), (o.cols && o.cols[i]) || P.st1, 1);
    if (o.line !== undefined) for (i = 2; i < w - 2; i += 2) s.F(i, 3 + o.line, 1, 1, P.red, 1);
  });
  ISO.defineProp('hbBBag', [7, 4, 8], function (s, o) {
    s.B(0, 0, 0, 7, 4, 7, o.col || 'blue', { shadow: true });
    s.B(2, 1, 7, 3, 1, 1, 'dark', { rim: false });
    s.F(1, 2, 5, 1, P.cream, 4);
  });
  ISO.defineProp('hbBFridge', [8, 7, 22], function (s, o) {
    s.B(0, 0, 0, 8, 7, 22, 'silver', { shadow: true });
    s.F(0, 11, 8, 1, P.st2, 7); s.F(6, 5, 1, 4, P.st1, 7); s.F(6, 14, 1, 6, P.st1, 7);
  });
  ISO.defineProp('hbBVend', [9, 7, 24], function (s, o) {
    s.B(0, 0, 0, 9, 7, 24, o.col || 'red', { shadow: true });
    s.F(1, 9, 7, 12, { fill: '#17323d', border: P.st3 }, 7);
    for (var i = 0; i < 3; i++) { s.F(2, 11 + i * 3, 5, 1, P.cream, 7); s.F(3, 12 + i * 3, 1, 1, i % 2 ? P.amber : P.green, 7); }
    s.F(2, 3, 3, 2, P.st1, 7);
  });
  ISO.defineProp('hbBMicro', [7, 5, 6], function (s, o) {
    s.B(0, 0, 0, 7, 5, 6, 'dark', { shadow: true });
    s.F(1, 1, 4, 4, o.on ? '#a8781f' : '#0c0e10', 5); s.F(5, 1, 1, 4, P.st2, 5);
  });
  ISO.defineProp('hbBGate', [3, 3, 18], function (s, o) {
    var up = o.up || 0;
    s.B(0, 0, 0, 3, 3, 8, 'dark', { shadow: true }); s.B(0, 0, 8, 3, 3, 2, 'red', { rim: false });
    s.B(1, 1, 10, 1, 1, 1, 'silver', { rim: false });
    if (up > 0.5) s.B(1, 1, 11, 1, 1, 7, P.cream, { rim: false });
  });
  ISO.defineProp('hbBBar', function (o) { return [o.w || 14, 2, 3]; }, function (s, o) {
    var i, w = s.w;
    for (i = 0; i < w; i += 3) s.B(i, 0, 0, Math.min(3, w - i), 2, 3, (i / 3) % 2 ? 'cream' : 'red', { rim: false });
  });
  ISO.defineProp('hbBBooth', [12, 9, 22], function (s, o) {
    s.B(0, 0, 0, 12, 9, 9, 'steel', { shadow: true });
    s.B(0, 0, 9, 12, 9, 10, 'steel', { glass: true, dens: 0.28, edge: P.st3 });
    s.B(0, 0, 19, 12, 9, 3, 'red', { rim: false });
    s.F(2, 4, 8, 3, { fill: '#17323d', border: P.st3 }, 9);
  });
  ISO.defineProp('hbBWhite', function (o) { return [o.w || 24, 1, o.h || 15]; }, function (s, o) {
    var w = s.w, h = s.h, i;
    s.B(0, 0, 0, w, 1, h, 'dark', { rim: false });
    s.F(1, 1, w - 2, h - 2, { fill: P.paper, border: P.st3 }, 1);
    for (i = 0; i < (o.rows === undefined ? 3 : o.rows); i++) s.F(3, h - 5 - i * 3, w - 8 - (i % 2) * 5, 1, (o.cols && o.cols[i]) || P.st1, 1);
  });
  ISO.defineProp('hbBPhone', [4, 3, 3], function (s, o) {
    s.B(0, 0, 0, 4, 3, 2, 'black', { rim: false }); s.B(0, 0, 2, 4, 1, 1, o.ring ? 'red' : 'dark', { rim: false });
  });
  ISO.defineProp('hbBRug', function (o) { return [o.w || 14, o.d || 10, 1]; }, function (s, o) {
    s.B(0, 0, 0, s.w, s.d, 1, o.col || 'blue', { rim: false });
    s.top(1, 1, s.w - 2, 1, 1, o.line || P.cream2); s.top(1, s.d - 2, s.w - 2, 1, 1, o.line || P.cream2);
  });

  /* ------------------------------------------------------------------ rooms (floor and walls, cached) */
  function wallDeco(s, c) {
    var q = { isoPanel: function (pl, pos, u, z, ww, hh, col, op) { if ((pl === 'x' && c.noL) || (pl === 'y' && c.noR)) return; s.isoPanel(pl, pos, u, z, ww, hh, col, op); } };
    var X = c.X, Y = c.Y, H = c.H, i, j, wl = c.wl, wr = c.wr, ls = c.line || mix(wl, '#000000', 0.22), st = c.style || 'plain';
    q.isoPanel('x', 0, 0, 0, Y, 2, c.skirt || P.base); q.isoPanel('y', 0, 0, 0, X, 2, c.skirt || P.base);
    if (st === 'wain') {
      q.isoPanel('x', 0, 0, 2, Y, 9, mix(wl, '#000000', 0.3)); q.isoPanel('y', 0, 0, 2, X, 9, mix(wr, '#000000', 0.3));
      q.isoPanel('x', 0, 0, 11, Y, 1, c.rail || P.st3); q.isoPanel('y', 0, 0, 11, X, 1, c.rail || P.st3);
    } else if (st === 'stripe') {
      for (i = 6; i < Y; i += 8) q.isoPanel('x', 0, i, 2, 3, H - 2, mix(wl, c.accent || '#ffffff', 0.12));
      for (i = 6; i < X; i += 8) q.isoPanel('y', 0, i, 2, 3, H - 2, mix(wr, c.accent || '#ffffff', 0.12));
    } else if (st === 'brick') {
      for (j = 4; j < H; j += 4) { q.isoPanel('x', 0, 0, j, Y, 1, ls); q.isoPanel('y', 0, 0, j, X, 1, ls); }
      for (j = 2; j < H; j += 8) for (i = 4 + ((j / 8) % 2) * 3; i < Y; i += 7) q.isoPanel('x', 0, i, j, 1, 4, ls);
      for (j = 2; j < H; j += 8) for (i = 4 + ((j / 8) % 2) * 3; i < X; i += 7) q.isoPanel('y', 0, i, j, 1, 4, ls);
    } else if (st === 'tile') {
      for (j = 8; j < H; j += 6) { q.isoPanel('x', 0, 0, j, Y, 1, ls); q.isoPanel('y', 0, 0, j, X, 1, ls); }
      for (i = 6; i < Y; i += 6) q.isoPanel('x', 0, i, 2, 1, H - 2, ls);
      for (i = 6; i < X; i += 6) q.isoPanel('y', 0, i, 2, 1, H - 2, ls);
    } else if (st === 'panel') {
      q.isoPanel('x', 0, 0, Math.round(H * 0.45), Y, 1, c.rail || P.wallLine2); q.isoPanel('y', 0, 0, Math.round(H * 0.45), X, 1, c.rail || P.wallLine2);
      q.isoPanel('x', 0, 0, 2, Y, Math.round(H * 0.45) - 2, mix(wl, '#000000', 0.14)); q.isoPanel('y', 0, 0, 2, X, Math.round(H * 0.45) - 2, mix(wr, '#000000', 0.12));
    } else if (st === 'band') {
      q.isoPanel('x', 0, 0, H - 9, Y, 3, c.accent || P.red2); q.isoPanel('y', 0, 0, H - 9, X, 3, c.accent || P.red2);
    }
  }
  function room(g, c) {
    g.layer('hbB-' + c.id, [-6, -6, -8, c.X + 4, c.Y + 4, c.H + 2], function (s) {
      s.isoFloor(c.X, c.Y, { style: c.floor || 'checker', a: c.a, b: c.b, tile: c.tile, zones: c.zones });
      var t = 2, top = c.top || P.wallTop;
      if (!c.noL) s.isoBox(-t, -t, 0, t, c.Y + t, c.H, { top: top, left: mix(c.wl, '#000000', 0.15), right: c.wl }, { rim: false });
      if (!c.noR) s.isoBox(0, -t, 0, c.X, t, c.H, { top: top, left: c.wr, right: mix(c.wr, '#000000', 0.15) }, { rim: false });
      wallDeco(s, c);
      if (c.deco) c.deco(s);
    });
  }

  /* ------------------------------------------------------------------ small helpers */
  function pop(t, a) { return t >= a; }
  /* a floor ring that marks the place a step is about */
  function spot(L, x, y, t, col) {
    L.add([x - 4, y - 4, -1, x + 4, y + 4, 0], function (g) { g.isoRing(x, y, 0, 4, col || P.redT, 2 + (Math.floor(t * 3) % 2)); });
  }
  function ping(g, x, y, z, t, r) { var p = g.proj(x, y, z); g.ring(p[0], p[1], r || 9, t, P.redT, 0.5); }
  function glow(g, x, y, z, t, col, per) { var p = g.proj(x, y, z); g.glow(p[0], p[1], 8, col || '#6ad79f', 0.4 + 0.2 * (0.5 - 0.5 * Math.cos(t / (per || 1.2) * 6.283))); }
  /* a red ring with a bar on the floor: do not do this */
  function noSign(L, x, y) {
    L.add([x - 4, y - 4, -1, x + 4, y + 4, 0], function (g) {
      g.isoRing(x, y, 0, 4, P.red); var a = g.proj(x - 3, y - 3, 0), b = g.proj(x + 3, y + 3, 0); g.line(a[0], a[1], b[0], b[1], P.red); g.line(a[0], a[1] + 1, b[0], b[1] + 1, P.red);
    });
  }
  function person(L, fx, p, look, extra) { if (p) L.person(p.x, p.y, p.dir, fx.who(p, ext(look, extra || {}))); }
  /* a person standing still */
  function at(x, y, dir) { return { x: x, y: y, dir: dir }; }
  /* the step record every policy uses: chips name the layer, the sign title names it too */
  function step(i, o) {
    return { title: o.title, sub: o.sub, dur: o.dur || 7, cam: o.cam, tag: o.tag || 'REAL SPEED', chips: CH, chipAt: function () { return i; },
      cap: o.cap, notes: o.notes, key: o.key || [], big: o.big, speaker: o.speaker, build: o.build };
  }
  function reg(id, num, o) {
    var spec = { id: 'hb-b-' + String(id).toLowerCase().replace(/[^a-z0-9.]+/g, '-'), title: o.title, std: 'Employee handbook, ' + num, blurb: o.blurb,
      backdrop: o.backdrop, steps: o.steps, camDur: 1, source: id };
    HB[id] = spec; return spec;
  }

  /* ================================================================ 4.6 Paycheck Deductions: the payroll office */
  (function () {
    var C = { id: '46', X: 58, Y: 34, H: 28, a: '#8c6e52', b: '#957859', tile: 6, wl: '#b9ae96', wr: '#c9bfa8', style: 'wain', rail: '#7d858c', top: '#e8e0cc',
      zones: [[2, 12, 26, 18, '#6b4a3e'], [3, 13, 24, 16, '#7a5646']] };
    var EMP = LOOK.red, HR = LOOK.blue;
    function world(g, fx, S) {
      room(g, C); var L = g.list();
      L.prop('hbBWindow', 0, 8, 10, { face: 'x', w: 14, h: 14, sun: true });
      L.prop('shelf', 2, 1, 0, { w: 22, d: 7, h: 22, seed: 4 });
      L.prop('hbBCalendar', 31, 0, 9, { marks: S.marks, col: S.payCol });
      L.prop('cabinet', 48, 1, 0);
      L.prop('table', 6, 14, 0, { w: 16, d: 9, h: 9, top: 'wood' });
      if (S.stub) L.prop('paystub', 9, 15, 9, { rows: S.rows, total: S.total });
      L.prop('desk', 26, 10, 0, { w: 18, d: 11 });
      L.prop('monitor', 28, 13, 9, { rows: 3 });
      if (S.fix) L.prop('docs', 37, 11, 9, { n: 2, head: P.green });
      L.prop('hbBPlant', 46, 25, 0); L.prop('hbBPlant', 1, 31, 0);
      person(L, fx, S.hr, HR, S.hrO); person(L, fx, S.emp, EMP, S.empO);
      L.flush();
    }
    function base() { return { stub: true, rows: 0, total: 0, marks: [], payCol: P.red, fix: false, hr: at(35, 7, 1), hrO: {}, emp: at(4, 21, 0), empO: {} }; }
    var cam1 = { x: 16, y: 10.5, zoom: 2 }, cam2 = { x: 21, y: 15, zoom: 2 }, cam3 = { x: 24, y: 16, zoom: 2, z: 6 };
    reg('4.6', '4.6', { title: 'Paycheck Deductions', blurb: 'What comes out of your pay, how to check it, and how an error is fixed.',
      backdrop: ['bands', '#2b2118', '#392c20'],
      steps: [
        step(0, { title: 'YOUR PAY STUB', sub: 'Deductions are listed on it', cam: cam1, key: ['paystub'],
          cap: ['Deductions come out each pay period', 'Your wage statement shows them'],
          notes: [{ a: 1.2, b: 2.9, x: 96, y: 64, text: 'Income tax' }, { a: 3.0, b: 4.7, x: 96, y: 64, text: 'FICA taxes' }, { a: 4.8, b: 6.5, x: 96, y: 64, text: 'Court orders' }],
          build: function (t, g, fx) {
            var S = base(); S.stub = t > 0.5; S.rows = Math.floor(fx.E(t, 1.2, 6.2) * 3.99);
            S.empO = { arm: t > 1 && t < 6.5 ? 'write' : 'down' };
            world(g, fx, S); if (t > 0.5 && t < 1.5) ping(g, 14, 19, 10, t, 9);
          } }),
        step(1, { title: 'CHECK EVERY PAYCHECK', sub: 'Look for errors each pay period', cam: cam2, key: ['paystub'],
          cap: ['Review your paycheck for errors', 'Report any discrepancy immediately'],
          build: function (t, g, fx) {
            var S = base(); S.rows = 4; S.total = 0.45; S.stub = t < 0.9;
            S.emp = fx.walk([[4, 21], [4, 25], [34, 25]], t, 0.9, 4.2, { endDir: 3 });
            S.empO = { hold: t >= 0.9 && t < 5.0 ? P.paper : undefined, holdSize: [4, 3], arm: t > 0.4 && t < 0.9 ? 'out' : 'down' };
            S.hrO = { arm: t > 4.4 && t < 6.5 ? 'out' : 'down' };
            world(g, fx, S);
            if (t > 4.2 && t < 6.5) glow(g, 33, 14, 12, t, P.redT);
          } }),
        step(2, { title: 'FIXED BY NEXT PAYDAY', sub: 'Wrong deductions are paid back in full', cam: cam3, key: ['docs'], big: { n: 'NEXT', label: 'payday at the latest', pos: 'left' },
          cap: ['You are reimbursed in full', 'No retaliation for reporting'],
          build: function (t, g, fx) {
            var S = base(); S.stub = false; S.emp = at(34, 25, 3);
            S.hrO = { arm: t > 0.8 && t < 3.2 ? 'out' : 'down', hold: t > 0.8 && t < 3.0 ? P.paper : undefined, holdSize: [4, 3] };
            S.fix = t > 3.0; S.marks = t > 4.0 ? [8, 9] : []; S.payCol = P.green;
            world(g, fx, S);
            if (t > 3.0 && t < 5.0) ping(g, 40, 14, 11, t, 10);
          } })
      ] });
  })();

  /* ================================================================ 4.7 Recording Time: shop floor, time clock, break table */
  (function () {
    var C = { id: '47', X: 64, Y: 32, H: 30, floor: 'epoxy', a: '#14181b', b: '#191d20', wl: '#2f4960', wr: '#38566f', style: 'panel', rail: '#6b8aa3',
      zones: [[2, 12, 60, 1, P.amberD], [2, 28, 60, 1, P.amberD], [4, 14, 24, 14, '#1f2927']] };
    var WK = LOOK.amber;
    function world(g, fx, S) {
      room(g, C); var L = g.list();
      L.prop('hbBVend', 2, 1, 0);
      L.prop('hbBDoor', 0, 8, 0, { face: 'x', w: 14, col: P.st1 });
      L.prop('timeclock', 14, 0, 10, { lit: S.lit });
      L.prop('board', 26, 0, 6, { w: 18, h: 22, rows: 5, lit: S.litRow, done: S.done, show: 5 });
      L.prop('machine', 44, 2, 0, { lamp: S.lamp, run: S.run, t: fx.t, spin: fx.t * 3 });
      L.prop('table', 6, 16, 0, { w: 16, d: 9, h: 9, top: 'steel' });
      if (S.tray) L.box(11, 19, 9, 4, 3, 1, 'cream', { rim: false });
      L.prop('stool', 7, 26, 0, { col: 'red' }); L.prop('stool', 16, 26, 0, { col: 'red' });
      L.prop('bin', 56, 22, 0, { col: 'dark', fill: 3 });
      if (S.no) noSign(L, 50, 24);
      person(L, fx, S.hr, LOOK.cream); person(L, fx, S.wk, WK, S.wkO);
      L.flush();
    }
    function base() { return { lit: false, lamp: 'green', run: 0, litRow: -1, done: 0, tray: false, no: false, hr: null, wk: at(18, 6, 3), wkO: {} }; }
    var cam1 = { x: 24, y: 6, zoom: 2, z: 8 }, cam2 = { x: 16, y: 12, zoom: 2, z: 4 }, cam3 = { x: 42.5, y: 19.5, zoom: 2, z: 4 };
    reg('4.7', '4.7', { title: 'Recording Time', blurb: 'Record all your time at the clock so you are paid for every hour worked.',
      backdrop: ['diag', '#0f1a22', '#18283a'],
      steps: [
        step(0, { title: 'CLOCK IN FIRST', sub: 'Record time before your shift starts', cam: cam1, key: ['timeclock', 'board'],
          cap: ['Record all of your time', 'Immediately before starting your shift'],
          build: function (t, g, fx) {
            var S = base(), pun = t > 2.6 && t < 4.4;
            S.wk = fx.walk([[10, 12], [18, 12], [18, 6]], t, 0.3, 2.3, { endDir: 3 });
            S.wkO = { arm: pun ? 'out' : 'down', card: pun ? P.red : undefined };
            S.lit = t > 3.0; S.litRow = t > 3.4 ? 0 : -1; S.done = t > 4.4 ? 1 : 0;
            world(g, fx, S);
            if (t > 3.0 && t < 5.4) ping(g, 18, 3, 16, t * 0.9, 10);
          } }),
        step(1, { title: 'MEAL BREAK PUNCHES', sub: 'Out before the meal, in after it', cam: cam2, key: ['timeclock', 'table'], tag: 'FAST FORWARD',
          cap: ['Record before your meal period', 'Record again before you resume work'],
          build: function (t, g, fx) {
            var S = base(); S.done = 1; S.lit = (t > 1.2 && t < 3.0) || t > 5.6;
            var a = fx.walk([[18, 6], [18, 12], [14, 13]], t, 2.6, 3.8, { endDir: 1 }), b = fx.walk([[14, 13], [18, 12], [18, 6]], t, 5.0, 6.0, { endDir: 3 });
            S.wk = t < 1.0 ? at(18, 6, 3) : t < 5.0 ? (t < 2.6 ? at(18, 6, 3) : a) : b;
            var pun1 = t > 0.5 && t < 2.2, pun2 = t > 6.0;
            S.wkO = { arm: pun1 || pun2 ? 'out' : 'down', card: pun1 || pun2 ? P.red : undefined };
            if (t > 3.8 && t < 5.0) { S.wkO = { arm: 'out', hold: P.cream, holdSize: [4, 2] }; S.tray = true; }
            S.lit = (t > 0.9 && t < 2.8) || t > 6.2; S.litRow = t > 1.5 && t < 4.4 ? 1 : t > 6.2 ? 2 : -1; S.done = t > 4.4 ? 2 : 1;
            world(g, fx, S);
          } }),
        step(2, { speaker: false, title: 'NEVER OFF THE CLOCK', sub: 'Falsifying time entries is prohibited', cam: cam3, key: ['machine'], big: { n: 'ALL', label: 'hours worked are paid', pos: 'bottom-right' },
          cap: ['Working off the clock is falsifying time', 'Tell HR about any pay discrepancy'],
          build: function (t, g, fx) {
            var S = base(); S.done = 5; S.lit = true; S.run = t < 3.6 ? 1 : 0; S.lamp = t < 3.6 ? 'green' : 'red'; S.no = t > 1.2;
            S.wk = fx.walk([[53, 19], [53, 22], [50, 22]], t, 4.0, 5.2, { startDir: 3, endDir: 2 });
            S.wkO = { arm: t < 3.6 ? 'write' : 'down' }; S.hr = t > 2.6 ? fx.walk([[34, 22], [44, 22]], t, 2.8, 3.8, { startDir: 0, endDir: 0 }) : null;
            world(g, fx, S);
          } })
      ] });
  })();

  /* ================================================================ 4.8 Travel Expenses: office desk, road, travel agency */
  (function () {
    var zn = [[0, 2, 70, 20, '#8a9096'], [0, 24, 70, 10, '#1c1f22']], i;
    for (i = 2; i < 68; i += 8) zn.push([i, 28, 4, 1, P.amber]);
    var C = { id: '48', X: 70, Y: 34, H: 22, noL: true, floor: 'epoxy', a: '#2e3236', b: '#33383c', wl: '#8a4a3a', wr: '#8a4a3a', style: 'brick', top: '#a9a39a', line: '#6b372c', zones: zn };
    var MG = LOOK.cream, TR = LOOK.green, AG = LOOK.plum;
    function world(g, fx, S) {
      room(g, C); var L = g.list();
      L.prop('hbBWindow', 26, 0, 6, { w: 12, h: 12, sky: '#2f4552' });
      L.prop('hbBWindow', 40, 0, 6, { w: 8, h: 12, sky: '#2f4552' });
      L.prop('desk', 4, 5, 0, { w: 18, d: 11 }); L.prop('monitor', 6, 8, 9, { rows: 2 });
      L.prop('docs', 14, 8, 9, { n: 2, head: S.ok ? P.green : P.amber });
      L.prop('table', 24, 10, 0, { w: 12, d: 8, h: 9, top: 'steel' }); L.prop('hbBPlane', 25, 10, 9);
      L.prop('hbBSofa', 39, 9, 0, { w: 12, col: 'cream', col2: 'blue' });
      L.prop('counter', 52, 4, 0, { w: 16, d: 8 });
      if (S.form) L.prop('ledger', 55, 6, 11, { lines: S.form, write: S.write });
      if (S.bag) L.prop('hbBBag', S.bag[0], S.bag[1], 0, { col: 'blue' });
      if (S.car) L.prop('hbBCar', S.car, 24, 0, { col: 'red', w: 20 });
      person(L, fx, S.mg, MG, S.mgO); person(L, fx, S.tr, TR, S.trO); person(L, fx, S.ag, AG, S.agO);
      L.flush();
    }
    function base() { return { ok: false, form: 0, write: 0, bag: [18, 20], car: 0, mg: at(13, 2, 1), mgO: {}, tr: at(13, 20, 3), trO: {}, ag: null, agO: {} }; }
    var cam1 = { x: 15, y: 12, zoom: 2 }, cam2 = { x: 31, y: 21, zoom: 2 }, cam3 = { x: 49.5, y: 12.5, zoom: 2 };
    reg('4.8', '4.8', { title: 'Travel Expenses', blurb: 'Get approval first, know what ADVANCED pays, book through the agency and report the expenses.',
      backdrop: ['stripes', '#14181c', '#1d252c'],
      steps: [
        step(0, { title: 'APPROVAL FIRST', sub: 'Your manager approves the trip', cam: cam1, key: ['docs'],
          cap: ['Travel needs prior approval from your manager', 'Travel is limited to business activities'],
          build: function (t, g, fx) {
            var S = base(); S.tr = fx.walk([[4, 23], [13, 23], [13, 20]], t, 0.3, 1.8, { endDir: 3 });
            S.mgO = { arm: t > 2.0 && t < 3.8 ? 'write' : 'down' }; S.ok = t > 3.8;
            world(g, fx, S);
            if (t > 3.8 && t < 5.8) ping(g, 16, 10, 10, t, 9);
          } }),
        step(1, { title: 'WHAT ADVANCED PAYS', sub: 'The actual amounts for appropriate expenses', cam: cam2, key: ['hbBCar'], tag: 'REAL SPEED',
          cap: ['Airline tickets, meals and lodging', 'Car rental, bus, taxi, parking'],
          build: function (t, g, fx) {
            var S = base(); S.mg = null; S.bag = null; S.ok = true;
            var w1 = fx.walk([[22, 20], [30, 20]], t, 0.3, 1.8, { endDir: 3 }), w2 = fx.walk([[30, 20], [44, 20]], t, 2.6, 3.6, { endDir: 3 });
            S.tr = t < 2.6 ? w1 : w2; S.car = Math.round(6 + 20 * fx.E(t, 3.4, 5.0));
            world(g, fx, S);
            if (t > 1.0 && t < 2.4) ping(g, 30, 14, 11, t, 8);
            if (t > 3.0 && t < 4.4) ping(g, 45, 13, 8, t, 8);
            if (t > 5.0 && t < 6.6) ping(g, S.car + 10, 29, 8, t, 11);
          } }),
        step(2, { title: 'BOOK IT, REPORT IT', sub: 'Use the travel agency, then file the form', cam: cam3, key: ['ledger'], big: { n: 'BOOK', label: 'via the travel agency', pos: 'left' },
          cap: ['Book air, car and hotel at the agency', 'Report the date, place and participants'],
          build: function (t, g, fx) {
            var S = base(); S.mg = null; S.bag = null; S.ok = true; S.tr = at(60, 16, 3); S.ag = at(60, 2, 1);
            S.agO = { arm: t > 1.0 && t < 3.0 ? 'out' : 'down' }; S.trO = { arm: t > 3.4 && t < 6.0 ? 'write' : 'down' };
            S.form = t > 1.6 ? 1 : 0; S.write = t > 3.4 ? fx.E(t, 3.4, 5.6) : 0; if (t > 5.6) S.form = 2;
            world(g, fx, S);
            if (t > 1.6 && t < 3.0) ping(g, 58, 9, 12, t, 9);
          } })
      ] });
  })();

  /* ================================================================ 4.9 Use of Employer Credit Cards: fuel stop and manager booth */
  (function () {
    var C = { id: '49', X: 58, Y: 34, H: 20, noL: true, floor: 'checker', a: '#3a4045', b: '#41484d', wl: '#3a4a58', wr: '#415669', style: 'stripe', accent: '#c4c9ce', top: '#9aa3ab',
      zones: [[26, 6, 12, 14, '#2c3135'], [26, 20, 12, 1, P.amberD], [40, 14, 18, 8, '#2c3135']] };
    var CH1 = LOOK.sand, MG = LOOK.steel;
    function world(g, fx, S) {
      room(g, C); var L = g.list();
      L.prop('hbBCar', 4, 4, 0, { col: 'silver', w: 22 });
      L.prop('hbBPump', 30, 8, 0, { lit: S.lit });
      L.prop('hbBBooth', 44, 3, 0);
      L.prop('lamp', 40, 5, 0, { col: S.lamp, on: S.lampOn });
      L.prop('table', 44, 24, 0, { w: 12, d: 8, h: 9, top: 'steel' });
      if (S.crate) L.prop('crate', 47, 25, 9, { w: 6, d: 5, h: 5, tag: P.amber });
      L.prop('bin', 49, 18, 0, { col: 'dark', fill: S.bins, item: 'paper' });
      if (S.bag) L.prop('hbBBag', 19, 22, 0, { col: 'cream' });
      if (S.no) noSign(L, 22, 27);
      person(L, fx, S.mg, MG, S.mgO); person(L, fx, S.ch, CH1, S.chO);
      L.flush();
    }
    function base() { return { lit: false, lamp: 'green', lampOn: false, crate: true, bins: 0, bag: false, no: false, ch: at(33, 17, 3), chO: {}, mg: at(53, 16, 2), mgO: {} }; }
    var cam1 = { x: 24, y: 16.5, zoom: 2 }, cam2 = { x: 39, y: 13, zoom: 2 }, cam3 = { x: 32.5, y: 20, zoom: 2 };
    reg('4.9', '4.9', { title: 'Use of Employer Credit Cards', blurb: 'Use the company card for approved business expenses only, with the right approval and receipts.',
      backdrop: ['bands', '#171b1f', '#222a31'],
      steps: [
        step(0, { title: 'BUSINESS USE ONLY', sub: 'The company card is for approved expenses', cam: cam1, key: ['hbBPump'],
          cap: ['Use is restricted to approved business expenses', 'Not for personal reasons'],
          build: function (t, g, fx) {
            var S = base(), sw = t > 1.8 && t < 3.4;
            S.ch = fx.walk([[24, 20], [33, 17]], t, 0.3, 1.5, { endDir: 3 }); S.mg = null;
            S.chO = { arm: sw ? 'out' : 'down', card: sw ? P.red : undefined }; S.lit = t > 2.2; S.bag = t > 3.6; S.no = t > 4.0;
            world(g, fx, S);
            if (sw) ping(g, 33, 12, 14, t, 9);
          } }),
        step(1, { title: 'RECEIPTS AND LOSSES', sub: 'Tell your manager', cam: cam2, key: ['hbBBooth'],
          cap: ['Submit all receipts to your manager', 'Report lost or stolen cards immediately'],
          build: function (t, g, fx) {
            var S = base(); S.lit = true;
            S.ch = fx.walk([[33, 17], [40, 18], [44, 16]], t, 0.4, 2.2, { endDir: 0 });
            S.chO = { hold: t < 2.4 ? P.paper : undefined, holdSize: [4, 3], arm: t > 4.2 && t < 6.2 ? 'out' : 'down', card: t > 4.2 && t < 6.2 ? P.red : undefined };
            S.mgO = { arm: t > 2.4 && t < 3.6 ? 'out' : 'down' }; S.bins = t > 3.4 ? 3 : 1;
            S.lampOn = t > 4.4; S.lamp = 'red';
            world(g, fx, S);
            if (t > 4.6 && t < 6.6) ping(g, 53, 16, 20, t, 8);
          } }),
        step(2, { title: 'WHEN TO ASK FIRST', sub: 'Approval depends on the purchase', cam: cam3, key: ['hbBBooth'], big: { n: '$25', label: 'over this: ask first', pos: 'left' },
          cap: ['Vehicle purchases under $100 need no approval', 'Vehicle over $100 and other over $25: ask first'],
          build: function (t, g, fx) {
            var S = base(), sw = t > 1.0 && t < 2.8;
            S.lit = t > 1.6 && t < 3.4; S.lamp = 'green'; S.lampOn = t > 1.8 && t < 3.4;
            var a = fx.walk([[33, 17], [40, 18], [46, 17]], t, 3.6, 4.8, { endDir: 0 });
            S.ch = t < 3.6 ? at(33, 17, 3) : a; S.crate = t < 6.0;
            S.chO = { arm: sw ? 'out' : 'down', card: sw ? P.red : undefined, hold: t > 6.0 ? P.amber : undefined, holdSize: [4, 3] };
            S.mgO = { arm: t > 4.8 && t < 5.8 ? 'out' : 'down', hold: t > 4.8 && t < 5.8 ? P.green : undefined, holdSize: [4, 3] };
            world(g, fx, S);
          } })
      ] });
  })();

  /* ================================================================ OK-Nursing Accommodations for Nursing Mothers: a private room beside the office floor */
  (function () {
    var C = { id: 'nu', X: 58, Y: 36, H: 26, a: '#a7a190', b: '#b0aa99', tile: 6, wl: '#2d4b4a', wr: '#3a5f5d', style: 'tile', line: '#2a4443', top: '#b9c2c8',
      zones: [[2, 2, 20, 14, '#5a3b46'], [4, 4, 16, 10, '#6a4655']] };
    var MOM = LOOK.plum, MG = LOOK.cream;
    function world(g, fx, S) {
      room(g, C); var L = g.list();
      L.prop('hbBWindow', 0, 20, 10, { face: 'x', w: 9, h: 12, sun: true });
      L.prop('wallclock', 36, 0, 14, { hour: S.hour, min: S.min });
      L.prop('hbBPlant', 25, 3, 0);
      if (S.room > 0) { L.box(22, 0, 0, 2, 18, 12, 'cream', { rim: false }); L.box(0, 16, 0, 8, 2, 12, 'cream', { rim: false }); L.box(14, 16, 0, 8, 2, 12, 'cream', { rim: false }); }
      if (S.room > 1) { L.prop('hbBSofa', 2, 3, 0, { w: 12, col: 'blue', col2: 'steel' }); L.prop('table', 16, 3, 0, { w: 5, d: 5, h: 8, top: 'wood' }); }
      if (S.room > 2) L.prop('hbBPlaque', 15, 18, 4, { col: S.inUse ? P.red : P.green });
      L.prop('desk', 28, 8, 0, { w: 16, d: 11 }); L.prop('monitor', 30, 11, 9, { rows: 2 });
      L.prop('hbBPlant', 45, 24, 0); L.prop('cabinet', 48, 1, 0); L.prop('hbBPlant', 2, 30, 0);
      person(L, fx, S.mg, MG, S.mgO); person(L, fx, S.mom, MOM, S.momO);
      L.flush();
    }
    function base() { return { room: 3, inUse: false, hour: 10, min: 0, mg: at(30, 25, 0), mgO: {}, mom: at(36, 22, 3), momO: {} }; }
    var cam1 = { x: 23, y: 17, zoom: 2 }, cam2 = { x: 17.5, y: 16, zoom: 2 }, cam3 = { x: 24.5, y: 26.5, zoom: 2, z: 2 };
    reg('OK-Accommodations for Nursing Mot', 'Accommodations for Nursing Mothers', { title: 'Accommodations for Nursing Mothers', blurb: 'A private room, reasonable break time and a talk with your manager.',
      backdrop: ['diag', '#101a1a', '#192828'],
      steps: [
        step(0, { title: 'A PRIVATE ROOM', sub: 'Close to the work area, with a lock or a sign', cam: cam1, key: ['hbBPlaque'],
          cap: ['A private, secure and sanitary room', 'Other than a restroom'],
          build: function (t, g, fx) {
            var S = base(); S.room = t < 0.8 ? 0 : t < 1.6 ? 1 : t < 2.6 ? 2 : 3; S.mom = at(36, 22, 3); S.mg = at(30, 25, 0);
            world(g, fx, S); if (t > 2.6 && t < 4.2) ping(g, 17, 20, 9, t, 8);
          } }),
        step(1, { title: 'A BREAK TO EXPRESS MILK', sub: 'Reasonable break time, unpaid', cam: cam2, key: ['hbBPlaque'],
          cap: ['Reasonable unpaid break time to express milk', 'The room shows when it is in use'],
          build: function (t, g, fx) {
            var S = base(); S.mg = null;
            S.mom = fx.walk([[36, 22], [18, 22], [11, 22], [11, 13]], t, 0.4, 3.6, { endDir: 3 });
            S.inUse = t > 3.8; S.min = t > 3.8 ? Math.round(fx.E(t, 3.8, 6.6) * 30) : 0;
            world(g, fx, S); if (t > 3.8 && t < 6.6) glow(g, 17, 19, 8, t, P.redT);
          } }),
        step(2, { title: 'TALK WITH YOUR MANAGER', sub: 'Plan the length and frequency', cam: cam3, key: ['desk'], big: { n: 'UP TO', label: 'one year after birth', pos: 'left' },
          cap: ['Discuss the length and frequency of breaks', 'Break time runs with existing breaks if possible'],
          build: function (t, g, fx) {
            var S = base(); S.mom = at(37, 25, 2); S.mg = at(30, 25, 0);
            S.mgO = { arm: Math.floor(t * 1.3) % 2 ? 'out' : 'down' }; S.momO = { arm: Math.floor(t * 1.1 + 0.5) % 2 ? 'down' : 'out' };
            world(g, fx, S);
          } })
      ] });
  })();

  /* ================================================================ OK-Meal Meal and Rest Periods: the break room */
  (function () {
    var C = { id: 'ml', X: 56, Y: 34, H: 28, floor: 'checker', a: '#383e44', b: '#40474d', tile: 6, wl: '#5b4f33', wr: '#6a5c3d', style: 'band', accent: P.red2, top: '#cfc7b3',
      zones: [[8, 14, 26, 18, '#2a2620'], [9, 15, 24, 16, '#322d26']] };
    var WA = LOOK.amber, WB = LOOK.green, MG = LOOK.steel;
    function world(g, fx, S) {
      room(g, C); var L = g.list();
      L.prop('hbBVend', 3, 1, 0); L.prop('hbBFridge', 14, 1, 0);
      L.prop('counter', 24, 1, 0, { w: 22, d: 8 }); L.prop('hbBMicro', 28, 3, 11, { on: S.micro });
      L.prop('wallclock', 48, 0, 14, { hour: S.hour, min: S.min });
      L.prop('hbBWhite', 0, 8, 8, { face: 'x', w: 16, h: 14, rows: S.rows, cols: [P.red, P.amber, P.st2] });
      L.prop('table', 14, 16, 0, { w: 21, d: 9, h: 9, top: 'wood' });
      L.prop('ledger', 15, 16, 9, { lines: S.lines, write: S.write });
      if (S.tray) L.box(30, 19, 9, 4, 3, 1, 'cream', { rim: false });
      L.prop('stool', 14, 27, 0, { col: 'red' }); L.prop('stool', 24, 27, 0, { col: 'amber' });
      L.prop('lamp', 50, 8, 0, { col: S.lamp, on: S.lampOn });
      L.prop('hbBPlant', 51, 27, 0);
      person(L, fx, S.mg, MG, S.mgO); person(L, fx, S.wa, WA, S.waO); person(L, fx, S.wb, WB, S.wbO);
      L.flush();
    }
    function base() { return { micro: false, hour: 12, min: 0, rows: 0, lines: 0, write: 0, tray: false, lamp: 'amber', lampOn: false, mg: null, mgO: {}, wa: null, waO: {}, wb: null, wbO: {} }; }
    var cam1 = { x: 10, y: 18, zoom: 2 }, cam2 = { x: 21.5, y: 15.5, zoom: 2 }, cam3 = { x: 34, y: 25, zoom: 2, z: 2 };
    reg('OK-Meal and Rest Periods', 'Meal and Rest Periods', { title: 'Meal and Rest Periods', blurb: 'Know your schedule, record each break and tell your manager if a break is missed.',
      backdrop: ['stripes', '#1a1610', '#241e15'],
      steps: [
        step(0, { title: 'KNOW YOUR SCHEDULE', sub: 'Check with your managers', cam: cam1, key: ['hbBWhite'],
          cap: ['Check with your managers about schedules', 'ADVANCED follows meal and rest period rules'],
          build: function (t, g, fx) {
            var S = base(); S.mg = at(4, 16, 0); S.wa = at(12, 16, 2); S.rows = Math.min(3, Math.floor(fx.E(t, 1.0, 5.0) * 3.99));
            S.mgO = { arm: t > 0.8 && t < 5.4 ? 'out' : 'down' };
            world(g, fx, S); if (t > 1.0 && t < 5.0) ping(g, 0, 16, 16, t, 9);
          } }),
        step(1, { title: 'RECORD EVERY BREAK', sub: 'Observe and record meals and rest periods', cam: cam2, key: ['ledger'], tag: 'FAST FORWARD',
          cap: ['Observe and record meal and rest periods', 'Record them accurately'],
          build: function (t, g, fx) {
            var S = base(); S.wa = at(22, 13, 1); S.micro = t > 0.6 && t < 2.0; S.tray = t > 2.0;
            S.waO = { arm: t > 2.4 ? 'write' : 'down' };
            var k = fx.E(t, 0.4, 6.4); S.min = Math.round(k * 30); S.lines = t > 5.2 ? 2 : t > 2.4 ? 1 : 0; S.write = t > 2.4 ? fx.E(t, t > 5.2 ? 5.2 : 2.4, (t > 5.2 ? 5.2 : 2.4) + 1.6) : 0;
            if (t > 4.0 && t < 5.2) S.write = 0;
            S.wb = at(12, 27, 3);
            world(g, fx, S);
          } }),
        step(2, { title: 'MISSED A BREAK?', sub: 'Tell your managers', cam: cam3, key: ['lamp'], big: { n: 'NOTIFY', label: 'if a break is missed', pos: 'left' },
          cap: ['Know in advance? Let your managers know', 'Missed a break? Notify them as soon as possible'],
          build: function (t, g, fx) {
            var S = base(); S.wb = at(40, 22, 0); S.mg = at(47, 22, 2);
            S.wbO = { arm: t > 1.0 && t < 6.0 ? 'up' : 'down' }; S.mgO = { arm: t > 3.4 && t < 6.0 ? 'out' : 'down' };
            S.lampOn = t > 3.4; S.lamp = 'amber'; S.rows = 3;
            world(g, fx, S); if (t > 1.0 && t < 3.4) ping(g, 40, 22, 22, t, 8);
          } })
      ] });
  })();

  /* ================================================================ OK-Overtime Overtime: the late shift, a weekly hours gauge */
  (function () {
    var C = { id: 'ot', X: 64, Y: 34, H: 30, floor: 'epoxy', a: '#14181a', b: '#191d1f', wl: '#4b2a28', wr: '#5a3431', style: 'brick', line: '#2e1716', top: '#8d8a84',
      zones: [[2, 30, 60, 1, P.amberD], [40, 18, 22, 14, '#1d2124']] };
    var MG = LOOK.cream, WK = LOOK.navy;
    function world(g, fx, S) {
      room(g, C); var L = g.list();
      L.prop('wallclock', 10, 0, 14, { hour: 7, min: 40 });
      L.prop('hbBGauge', 28, 0, 0, { w: 10, h: 22, v: S.v, line: 0.7 });
      L.prop('machine', 44, 2, 0, { lamp: S.lamp, run: S.run, t: fx.t, spin: fx.t * 3 });
      L.prop('desk', 4, 12, 0, { w: 18, d: 11 }); L.prop('docs', 8, 15, 9, { n: 2, head: S.ok ? P.green : P.amber });
      L.prop('table', 34, 16, 0, { w: 12, d: 8, h: 9, top: 'steel' });
      if (S.stubs) L.prop('paystub', 35, 17, 9, { rows: 4, total: S.total });
      if (S.hol) { L.prop('docs', 36, 25, 0, { n: 2, head: P.st2 }); L.prop('docs', 45, 25, 0, { n: 2, head: P.st2 }); noSign(L, 42, 30); }
      L.prop('crate', 52, 25, 0, { w: 10, d: 8, h: 8 });
      person(L, fx, S.mg, MG, S.mgO); person(L, fx, S.wk, WK, S.wkO);
      L.flush();
    }
    function base() { return { v: 0, lamp: 'green', run: 0, ok: false, stubs: false, total: 0, hol: false, mg: at(13, 9, 1), mgO: {}, wk: at(13, 27, 3), wkO: {} }; }
    var cam1 = { x: 9.5, y: 14.5, zoom: 2 }, cam2 = { x: 36, y: 12, zoom: 2 }, cam3 = { x: 32.5, y: 16, zoom: 2 };
    reg('OK-Overtime', 'Overtime', { title: 'Overtime', blurb: 'Approval in writing, what counts as hours worked, and when overtime pay starts.',
      backdrop: ['bands', '#1c1210', '#2a1b17'],
      steps: [
        step(0, { title: 'APPROVED IN ADVANCE', sub: 'Nonexempt employees may qualify for overtime pay', cam: cam1, key: ['docs'],
          cap: ['All overtime must be approved in advance', 'In writing, by your managers'],
          build: function (t, g, fx) {
            var S = base(); S.wk = fx.walk([[4, 30], [13, 30], [13, 27]], t, 0.2, 1.4, { endDir: 3 });
            S.mgO = { arm: t > 1.8 && t < 4.4 ? 'write' : 'down' }; S.ok = t > 4.4;
            world(g, fx, S); if (t > 4.4 && t < 6.4) ping(g, 12, 17, 10, t, 8);
          } }),
        step(1, { title: 'HOURS WORKED COUNT', sub: 'Holidays, vacation and sick days do not', cam: cam2, key: ['hbBGauge'],
          cap: ['Hours worked add up in the workweek', 'Holidays, vacation and sick leave do not count'],
          build: function (t, g, fx) {
            var S = base(); S.mg = null; S.wk = at(53, 19, 3); S.wkO = { arm: 'write' }; S.run = 1; S.v = 0.7 * fx.E(t, 0.6, 3.8); S.hol = t > 3.4;
            world(g, fx, S);
          } }),
        step(2, { title: 'PAST 40 HOURS', sub: 'Overtime pay: one and one-half times your rate', cam: cam3, key: ['hbBGauge'], big: { n: '40', label: 'hours in a workweek', pos: 'left' },
          cap: ['Over 40 hours in a workweek is overtime', 'Paid one and one-half times your regular rate'],
          build: function (t, g, fx) {
            var S = base(); S.mg = null; S.wk = at(53, 19, 3); S.wkO = { arm: t < 4 ? 'write' : 'down' }; S.run = t < 4.4 ? 1 : 0; S.lamp = t < 4.4 ? 'green' : 'amber';
            S.v = 0.7 + 0.3 * fx.E(t, 0.6, 3.6); S.stubs = t > 3.8; S.total = fx.E(t, 4.0, 5.6);
            world(g, fx, S); if (t > 0.8 && t < 3.6) glow(g, 33, 2, 14, t, P.redT); if (t > 3.8 && t < 5.8) ping(g, 40, 20, 11, t, 9);
          } })
      ] });
  })();

  /* ================================================================ 5.1 Criminal Activity/Arrests: the company gate and the property line */
  (function () {
    var zn = [[0, 0, 24, 34, '#8a8f95']], i;
    for (i = 0; i < 33; i += 5) zn.push([24, i, 1, 3, P.amber]);
    var C = { id: '51', X: 60, Y: 34, H: 20, noL: true, floor: 'checker', a: '#3a3f44', b: '#41474c', wl: '#3b4a58', wr: '#415669', style: 'stripe', accent: '#c4c9ce', top: '#9aa3ab', zones: zn };
    var EA = LOOK.red, EB = LOOK.blue, MG = LOOK.steel;
    function world(g, fx, S) {
      room(g, C); var L = g.list();
      L.prop('hbBBooth', 38, 2, 0);
      L.prop('hbBCalendar', 28, 0, 6, { marks: S.marks, col: P.green });
      L.prop('wallclock', 17, 0, 12, { hour: 7, min: 0 });
      L.prop('hbBGate', 24, 13, 0, { up: S.up });
      if (S.up <= 0.5) for (var k = 0; k < 4; k++) L.box(24, 16 + k * 3, 9, 1, 3, 1, k % 2 ? 'cream' : 'red', { rim: false });
      L.prop('table', 36, 14, 0, { w: 14, d: 6, h: 9, top: 'steel' });
      if (S.phone) { L.prop('hbBPhone', 38, 15, 9, { ring: S.ring }); L.prop('docs', 43, 15, 9, { n: 1, w: 4, head: P.amber }); L.prop('docs', 47, 15, 9, { n: 1, w: 3, head: P.red }); }
      L.prop('hbBPlant', 53, 27, 0); L.prop('hbBPlant', 54, 3, 0);
      person(L, fx, S.mg, MG, S.mgO); person(L, fx, S.a, EA, S.aO); person(L, fx, S.b, EB, S.bO);
      L.flush();
    }
    function base() { return { marks: [], up: 0, phone: false, ring: false, mg: null, mgO: {}, a: null, aO: {}, b: null, bO: {} }; }
    var cam1 = { x: 20.5, y: 18.5, zoom: 2 }, cam2 = { x: 37.5, y: 12.5, zoom: 2 }, cam3 = { x: 24, y: 21, zoom: 2 };
    reg('5.1', '5.1', { title: 'Criminal Activity/Arrests', blurb: 'Criminal activity on or off ADVANCED property can lead to discipline. Be ready to work when scheduled.',
      backdrop: ['diag', '#14181c', '#1e252b'],
      steps: [
        step(0, { title: 'ON OR OFF PROPERTY', sub: 'The policy covers both sides of the line', cam: cam1, key: [],
          cap: ['Criminal activity, on or off our property', 'May lead to disciplinary action'],
          build: function (t, g, fx) {
            var S = base(); S.a = fx.walk([[10, 22], [18, 22]], t, 0.4, 2.6, { startDir: 0, endDir: 0 }); S.b = fx.walk([[38, 22], [31, 22]], t, 0.4, 2.6, { startDir: 2, endDir: 2 }); S.aO = { arm: t > 3.4 ? 'out' : 'down' }; S.bO = { arm: t > 3.8 ? 'out' : 'down' };
            world(g, fx, S);
          } }),
        step(1, { title: 'WHAT FOLLOWS', sub: 'Reported by law, then discipline', cam: cam2, key: ['table'],
          cap: ['ADVANCED reports it in accordance with the law', 'Discipline can include suspension or termination'],
          build: function (t, g, fx) {
            var S = base(); S.phone = true; S.ring = Math.floor(t * 3) % 2 === 0 && t < 3.0; S.mg = at(33, 13, 1);
            S.mgO = { arm: t > 1.0 && t < 3.0 ? 'out' : 'down', hold: t > 1.0 && t < 3.0 ? P.st1 : undefined, holdSize: [2, 3] };
            world(g, fx, S); if (t > 3.4 && t < 4.8) ping(g, 45, 17, 11, t, 8);
          } }),
        step(2, { title: 'BE READY WHEN SCHEDULED', sub: 'On the job, ready to work', cam: cam3, key: ['hbBGate'], big: { n: 'READY', label: 'when scheduled', pos: 'left' },
          cap: ['Be on the job, ready to work when scheduled', 'Missing work can lead to discipline'],
          build: function (t, g, fx) {
            var S = base(), a1 = fx.walk([[12, 22], [21, 22]], t, 0.3, 1.5, { endDir: 0 }), a2 = fx.walk([[21, 22], [40, 22]], t, 2.9, 4.8, { endDir: 3 });
            S.a = t < 2.9 ? a1 : a2; S.up = t > 1.8 && t < 5.2 ? 1 : 0; S.marks = t > 4.8 ? [6, 7] : [];
            world(g, fx, S); if (t > 4.8 && t < 6.6) ping(g, 33, 3, 14, t, 8);
          } })
      ] });
  })();

  /* ================================================================ 5.2 Exit Interview: a meeting room with a trend chart */
  (function () {
    var C = { id: '52', X: 52, Y: 32, H: 26, floor: 'checker', a: '#a08560', b: '#a98d67', tile: 6, wl: '#2a3140', wr: '#323b4c', style: 'panel', rail: '#5f6c82', top: '#aeb6c2' };
    var HR = LOOK.blue, EM = LOOK.red;
    function world(g, fx, S) {
      room(g, C); var L = g.list();
      L.prop('hbBWindow', 0, 6, 10, { face: 'x', w: 14, h: 14, sky: '#3e6180' });
      L.prop('hbBChart', 30, 0, 5, { w: 22, h: 18, bars: S.bars, cols: [P.st2, P.st2, P.amber, P.red] });
      L.prop('table', 16, 12, 0, { w: 24, d: 10, h: 9, top: 'wood' });
      L.prop('docs', 24, 14, 9, { n: 2, head: S.okHead }); L.prop('hbBPhone', 33, 14, 9);
      L.prop('hbBPlant', 45, 24, 0);
      person(L, fx, S.hr, HR, S.hrO); person(L, fx, S.em, EM, S.emO);
      L.flush();
    }
    function base() { return { bars: [3, 4, 5, 6], okHead: P.red, hr: at(28, 9, 1), hrO: {}, em: at(28, 25, 3), emO: {} }; }
    var cam1 = { x: 17.5, y: 19, zoom: 2 }, cam2 = { x: 24.5, y: 13.5, zoom: 2 }, cam3 = { x: 19, y: 19, zoom: 2, z: 2 };
    reg('5.2', '5.2', { title: 'Exit Interview', blurb: 'You may be asked to share why you are leaving, to help ADVANCED improve.',
      backdrop: ['stripes', '#12161d', '#1b212b'],
      steps: [
        step(0, { title: 'YOU MAY BE ASKED', sub: 'An exit interview when you leave', cam: cam1, key: [],
          cap: ['You may be asked to take part', 'An exit interview when you leave ADVANCED'],
          build: function (t, g, fx) {
            var S = base(); S.em = fx.walk([[6, 28], [28, 28], [28, 25]], t, 0.4, 2.8, { endDir: 3 }); S.bars = [0, 0, 0, 0]; S.emO = { hold: t < 4.0 ? '#cfa371' : undefined, holdSize: [5, 4] };
            S.hrO = { arm: t > 3.2 && t < 5.0 ? 'out' : 'down' };
            world(g, fx, S);
          } }),
        step(1, { title: 'WHY WE ASK', sub: 'Insight into your decision to leave', cam: cam2, key: ['hbBChart'],
          cap: ['Insight into why you decided to leave', 'We look for trends and ways to improve'],
          build: function (t, g, fx) {
            var S = base(), k = fx.E(t, 0.8, 5.6); S.bars = [Math.round(3 + 2 * k), Math.round(3 + 3 * k), Math.round(4 + 5 * k), Math.round(5 + 6 * k)];
            S.hrO = { arm: t > 1.0 && t < 6.0 ? 'out' : 'down' }; S.emO = {};
            world(g, fx, S); if (t > 5.4) ping(g, 40, 1, 14, t, 9);
          } }),
        step(2, { title: 'PLEASE TAKE PART', sub: 'Your cooperation is appreciated', cam: cam3, key: ['docs'], big: { n: 'EXIT', label: 'interview if asked', pos: 'left' },
          cap: ['It helps recruitment and retention', 'Your cooperation is appreciated'],
          build: function (t, g, fx) {
            var S = base(); S.bars = [5, 6, 9, 11]; S.okHead = t > 3.0 ? P.green : P.red;
            S.hrO = { arm: Math.floor(t * 1.2) % 2 ? 'out' : 'down' }; S.emO = { arm: Math.floor(t * 1.2 + 0.6) % 2 ? 'out' : 'down' };
            world(g, fx, S);
          } })
      ] });
  })();

  /* ================================================================ 5.3 Open Door/Conflict Resolution: a corridor with three doors */
  (function () {
    var C = { id: '53', X: 64, Y: 28, H: 30, floor: 'checker', a: '#70777f', b: '#79808a', tile: 6, wl: '#2f4d3a', wr: '#3a5e47', style: 'wain', rail: '#a3946a', top: '#b4bcb6',
      zones: [[2, 14, 60, 10, '#5f666e'], [2, 14, 60, 1, P.amberD], [2, 23, 60, 1, P.amberD]] };
    var EM = LOOK.red, MG = LOOK.cream, HR = LOOK.blue, UP = LOOK.steel;
    function world(g, fx, S) {
      room(g, C); var L = g.list();
      L.prop('hbBDoor', 8, 0, 0, { col: '#a07a52', open: S.o1, inside: '#d9c27a', lamp: 'green' });
      L.prop('hbBDoor', 28, 0, 0, { col: '#4a6a8f', open: S.o2, inside: '#d9c27a', lamp: S.o2 > 0 ? 'green' : 'amber' });
      L.prop('hbBDoor', 48, 0, 0, { col: P.red2, open: S.o3, inside: '#d9c27a', lamp: S.o3 > 0 ? 'green' : 'amber' });
      L.prop('hbBWindow', 0, 6, 10, { face: 'x', w: 14, h: 14 }); L.prop('hbBPlant', 1, 24, 0);
      L.prop('hbBPlant', 22, 4, 0); L.prop('hbBPlant', 42, 4, 0);
      if (S.table) L.prop('table', 41, 10, 0, { w: 16, d: 8, h: 9, top: 'wood' });
      for (var i = 0; i < S.docs; i++) L.prop('docs', 43 + i * 3, 12, 9, { n: 1, w: 3, head: [P.red, P.amber, P.blue, P.green][i] });
      person(L, fx, S.mg, MG, S.mgO); person(L, fx, S.hr, HR, S.hrO); person(L, fx, S.up, UP, S.upO); person(L, fx, S.em, EM, S.emO);
      L.flush();
    }
    function base() { return { o1: 0, o2: 0, o3: 0, table: false, docs: 0, mg: null, mgO: {}, hr: null, hrO: {}, up: null, upO: {}, em: null, emO: {} }; }
    var cam1 = { x: 7.5, y: 13, zoom: 2 }, cam2 = { x: 21.5, y: 9.5, zoom: 2 }, cam3 = { x: 39, y: 20.5, zoom: 2 };
    reg('5.3', '5.3', { title: 'Open Door/Conflict Resolution Process', blurb: 'Bring a concern to your manager first, then to HR or upper-level management.',
      backdrop: ['bands', '#101a14', '#18281e'],
      steps: [
        step(0, { title: 'START WITH YOUR MANAGER', sub: 'Choose a time and place to talk', cam: cam1, key: ['hbBDoor'],
          cap: ['Bring your concern to your manager', 'At a time and place to listen'],
          build: function (t, g, fx) {
            var S = base(); S.mg = at(13, 6, 1); S.em = fx.walk([[4, 22], [13, 22], [13, 15]], t, 0.4, 3.0, { endDir: 3 }); S.o1 = fx.E(t, 3.2, 4.0) * 0.8;
            S.mgO = { arm: t > 3.4 && t < 6.2 ? 'out' : 'down' }; S.emO = { arm: t > 3.8 && t < 6.2 ? 'out' : 'down' };
            world(g, fx, S);
          } }),
        step(1, { title: 'NOT ANSWERED? GO TO HR', sub: 'Or if your manager is the problem', cam: cam2, key: ['hbBDoor'],
          cap: ['Not answered, or manager is the problem', 'Take it to HR or upper-level management'],
          build: function (t, g, fx) {
            var S = base(); S.o1 = 0.8; S.hr = at(33, 7, 1);
            S.em = fx.walk([[13, 15], [33, 15]], t, 0.4, 2.6, { endDir: 3 }); S.o2 = fx.E(t, 2.8, 3.6) * 0.8; S.hrO = { arm: t > 3.4 && t < 6.2 ? 'out' : 'down' };
            S.emO = { arm: t > 3.8 && t < 6.2 ? 'out' : 'down' };
            world(g, fx, S);
          } }),
        step(2, { title: 'TELL THEM THE FACTS', sub: 'Describe the problem and what you tried', cam: cam3, key: ['table'], big: { n: 'OPEN', label: 'door for any problem', pos: 'left' },
          cap: ['Describe the problem and who is involved', 'Say what you tried and suggest a solution'],
          build: function (t, g, fx) {
            var S = base(); S.o1 = 0.8; S.o2 = 0.8; S.o3 = 0.8; S.table = true; S.docs = Math.min(4, Math.floor(fx.E(t, 0.8, 5.6) * 4.99));
            S.up = at(50, 7, 1); S.em = at(50, 23, 3); S.upO = { arm: t > 1.0 && t < 6.0 ? 'out' : 'down' }; S.emO = { arm: Math.floor(t * 1.5) % 2 ? 'out' : 'down' };
            world(g, fx, S);
          } })
      ] });
  })();

  /* ================================================================ 5.4 Outside Employment: the shop and a second job, side by side */
  (function () {
    var zn = [[32, 0, 32, 32, '#8a8670'], [33, 1, 30, 30, '#948f78']];
    var C = { id: '54', X: 64, Y: 32, H: 26, floor: 'epoxy', a: '#121618', b: '#161a1c', wl: '#34404a', wr: '#3d4b58', style: 'tile', line: '#2c353d', top: '#aab1b7', zones: zn,
      deco: function (s) { s.isoPanel('y', 0, 32, 2, 32, 22, '#6a7a86'); s.isoPanel('y', 0, 32, 2, 32, 6, '#4a5a66'); s.isoPanel('y', 0, 32, 8, 32, 1, '#8aa0b0'); } };
    var WK = LOOK.blue, MG = LOOK.cream;
    function world(g, fx, S) {
      room(g, C); var L = g.list();
      L.prop('machine', 2, 2, 0, { lamp: 'green', run: S.run, t: fx.t, spin: fx.t * 3 });
      L.prop('hbBCalendar', 22, 0, 9, { marks: S.mA, col: P.red });
      L.prop('hbBCalendar', 36, 0, 9, { marks: S.mB, col: P.blueT });
      L.prop('shelf', 50, 1, 0, { w: 12, d: 7, h: 22, seed: 7 });
      L.prop('counter', 38, 12, 0, { w: 16, d: 8, top: 'wood' });
      L.prop('hbBPlant', 58, 24, 0);
      person(L, fx, S.mg, MG, S.mgO); person(L, fx, S.wk, WK, S.wkO);
      L.flush();
    }
    function base() { return { run: 0, mA: [0, 1, 2, 3, 4], mB: [], mg: null, mgO: {}, wk: at(14, 22, 0), wkO: {} }; }
    var cam1 = { x: 25.5, y: 18.5, zoom: 2 }, cam2 = { x: 30, y: 6, zoom: 2, z: 12 }, cam3 = { x: 7.5, y: 22, zoom: 2 };
    reg('5.4', '5.4', { title: 'Outside Employment', blurb: 'A second job is allowed off hours, but it must not clash with your work at ADVANCED.',
      backdrop: ['stripes', '#14181c', '#1e2830'],
      steps: [
        step(0, { title: 'A SECOND JOB', sub: 'Extra work in your off hours', cam: cam1, key: [],
          cap: ['You may seek additional employment off hours', 'It must not create a conflict of interest'],
          build: function (t, g, fx) {
            var S = base(); S.wk = fx.walk([[14, 22], [44, 22]], t, 0.6, 4.6, { endDir: 3 }); S.run = t < 4 ? 1 : 0;
            world(g, fx, S);
          } }),
        step(1, { title: 'IT MUST NOT CLASH', sub: 'Attendance, performance, hours and scheduling', cam: cam2, key: ['hbBCalendar'],
          cap: ['It cannot affect your attendance or performance', 'Or your work hours and scheduling'],
          build: function (t, g, fx) {
            var S = base(); S.wk = at(35, 9, 3); S.mB = t > 1.4 ? [3, 4, 5, 6] : []; S.wkO = {};
            world(g, fx, S); if (t > 3.2 && t < 6.4) { ping(g, 27, 1, 14, t, 9); ping(g, 41, 1, 14, t, 9); }
          } }),
        step(2, { title: 'REPORT A CONFLICT', sub: 'Tell your manager', cam: cam3, key: ['docs'], big: { n: 'REPORT', label: 'to your manager', pos: 'left' },
          cap: ['Report any conflict to your manager', 'Not following this policy can lead to discipline'],
          build: function (t, g, fx) {
            var S = base(); S.mB = [3, 4, 5, 6]; S.mg = at(12, 19, 0); S.wk = at(20, 19, 2);
            S.wkO = { arm: t > 1.0 && t < 3.0 ? 'out' : 'down', hold: t > 1.0 && t < 3.0 ? P.paper : undefined, holdSize: [4, 3] };
            S.mgO = { arm: t > 3.0 && t < 5.4 ? 'out' : 'down' };
            world(g, fx, S);
          } })
      ] });
  })();

  /* ================================================================ 5.5 Pay Raises: the boardroom with three stacks */
  (function () {
    var C = { id: '55', X: 56, Y: 32, H: 26, floor: 'checker', a: '#2a1818', b: '#301c1c', tile: 6, wl: '#2b3b4f', wr: '#344a63', style: 'wain', rail: '#b9a46a', top: '#aab4c0',
      zones: [[8, 6, 40, 24, '#220f0f'], [9, 7, 38, 22, '#2a1414']] };
    var HRP = LOOK.blue, MGP = LOOK.steel, EMP = LOOK.red;
    function world(g, fx, S) {
      room(g, C); var L = g.list();
      L.prop('hbBWindow', 0, 8, 10, { face: 'x', w: 14, h: 14, sky: '#35506a' });
      L.prop('hbBChart', 34, 0, 5, { w: 22, h: 18, bars: S.bars, cols: [P.st2, P.amber, P.green, P.green] });
      L.prop('wallclock', 14, 0, 14, { hour: 3, min: 0 });
      L.prop('table', 14, 12, 0, { w: 28, d: 10, h: 9, top: 'wood' });
      if (S.stacks) { L.cyl(18, 17, 9, 2.5, S.h1, 'amber', { rim: false }); L.cyl(23, 17, 9, 2.5, S.h2, 'blue', { rim: false }); L.cyl(28, 17, 9, 2.5, S.h3, 'green', { rim: false }); }
      if (S.flow) L.flow([[20, 14], [31, 14]], fx.t, { z: 10, color: P.redT, len: 2, gap: 3, speed: 8 });
      if (S.stub) L.prop('paystub', 31, 13, 9, { rows: 4, total: S.total });
      L.prop('hbBPlant', 48, 26, 0);
      person(L, fx, S.hr, HRP, S.hrO); person(L, fx, S.mg, MGP, S.mgO); person(L, fx, S.em, EMP, S.emO);
      L.flush();
    }
    function base() { return { bars: [5, 6, 7, 8], stacks: true, h1: 3, h2: 3, h3: 3, flow: false, stub: false, total: 0, hr: at(28, 8, 1), hrO: {}, mg: at(28, 26, 3), mgO: {}, em: null, emO: {} }; }
    var cam1 = { x: 24.5, y: 13.5, zoom: 2 }, cam2 = { x: 24.5, y: 13.5, zoom: 2, z: 6 }, cam3 = { x: 21.5, y: 18.5, zoom: 2 };
    reg('5.5', '5.5', { title: 'Pay Raises', blurb: 'Raises follow profitability, job performance and the consumer price index.',
      backdrop: ['diag', '#1a1213', '#2a1c1d'],
      steps: [
        step(0, { title: 'WHAT RAISES DEPEND ON', sub: 'Financial health and other ADVANCED factors', cam: { x: 24.5, y: 14.5, zoom: 2, z: 2 }, key: ['table'],
          cap: ['Efforts will be made to give pay raises', 'Profitability, job performance, price index'],
          notes: [{ a: 1.4, b: 2.8, x: 90, y: 50, text: 'Profitability' }, { a: 2.9, b: 4.3, x: 112, y: 50, text: 'Job performance' }, { a: 4.4, b: 6.0, x: 132, y: 50, text: 'Consumer price index' }],
          build: function (t, g, fx) {
            var S = base(); S.h1 = Math.round(3 + 6 * fx.E(t, 1.0, 2.6)); S.h2 = Math.round(3 + 9 * fx.E(t, 2.6, 4.2)); S.h3 = Math.round(3 + 5 * fx.E(t, 4.2, 5.8));
            S.hrO = { arm: t > 1.0 && t < 6 ? 'out' : 'down' };
            world(g, fx, S);
          } }),
        step(1, { title: 'RAISES FOLLOW THEM', sub: 'Consistent with profitability and performance', cam: cam2, key: ['table'],
          cap: ['Raises are consistent with those factors', 'It depends on financial health'],
          build: function (t, g, fx) {
            var S = base(); S.h1 = 9; S.h2 = 12; S.h3 = 8; S.flow = t > 0.8 && t < 5.4; S.stub = t > 1.6; S.total = fx.E(t, 2.4, 5.4); S.bars = [5, 7, 9, Math.round(8 + 3 * fx.E(t, 2.4, 5.4))];
            world(g, fx, S);
          } }),
        step(2, { title: 'MERIT OR A NEW JOB', sub: 'Individual raises are possible too', cam: cam3, key: ['paystub'], big: { n: 'MERIT', label: 'or a position change', pos: 'left' },
          cap: ['Individual raises can be based on merit', 'Or due to a change of job position'],
          build: function (t, g, fx) {
            var S = base(); S.stacks = false; S.stub = true; S.total = 1; S.bars = [5, 7, 9, 11]; S.hr = at(30, 8, 1); S.mg = null; S.em = at(30, 24, 3);
            S.hrO = { arm: t > 1.0 && t < 3.2 ? 'out' : 'down', hold: t > 1.0 && t < 3.2 ? P.green : undefined, holdSize: [4, 3] };
            world(g, fx, S); if (t > 3.2 && t < 5.4) ping(g, 36, 17, 10, t, 9);
          } })
      ] });
  })();

  /* ================================================================ 5.6 Performance Improvement: the review meeting with a calendar and a checklist wall */
  (function () {
    var C = { id: '56', X: 56, Y: 32, H: 28, floor: 'checker', a: '#33414f', b: '#3a4958', tile: 6, wl: '#7d7660', wr: '#8a836b', style: 'stripe', accent: '#ffffff', top: '#d6cfba',
      zones: [[6, 8, 30, 22, '#2a3744']] };
    var MG = LOOK.cream, EM = LOOK.red;
    function world(g, fx, S) {
      room(g, C); var L = g.list();
      L.prop('hbBWindow', 0, 8, 10, { face: 'x', w: 14, h: 14, sky: '#4a6a85' });
      L.prop('hbBCalendar', 8, 0, 9, { marks: S.marks, col: P.red });
      L.prop('hbBWhite', 34, 0, 8, { w: 20, h: 15, rows: S.rows, cols: [P.red, P.red, P.red, P.red] });
      L.prop('desk', 12, 12, 0, { w: 18, d: 11 }); L.prop('monitor', 14, 15, 9, { rows: 2 }); L.prop('docs', 22, 15, 9, { n: 2, head: S.ok ? P.green : P.amber });
      L.prop('cabinet', 46, 10, 0); L.prop('hbBPlant', 48, 24, 0);
      person(L, fx, S.mg, MG, S.mgO); person(L, fx, S.em, EM, S.emO);
      L.flush();
    }
    function base() { return { marks: [], rows: 0, ok: false, mg: at(21, 9, 1), mgO: {}, em: at(21, 26, 3), emO: {} }; }
    var cam1 = { x: 17.5, y: 14, zoom: 2, z: 7 }, cam2 = { x: 28, y: 11, zoom: 2 }, cam3 = { x: 10, y: 21.5, zoom: 2 };
    reg('5.6', '5.6', { title: 'Performance Improvement', blurb: 'Regular reviews of your work, and a plan you can ask for at any time.',
      backdrop: ['bands', '#0f161d', '#17212b'],
      steps: [
        step(0, { title: 'REVIEWS HAPPEN', sub: 'Your work performance is reviewed', cam: cam1, key: ['hbBCalendar'],
          cap: ['Your work performance is reviewed periodically', 'Annually, biannually, monthly or as needed'],
          build: function (t, g, fx) {
            var S = base(); S.marks = t > 4.4 ? [2, 7, 12, 17] : t > 3.2 ? [2, 7, 12] : t > 2.0 ? [2, 7] : t > 1.0 ? [2] : [];
            S.mgO = { arm: t > 1.0 ? (Math.floor(t * 1.2) % 2 ? 'out' : 'down') : 'down' };
            world(g, fx, S);
          } }),
        step(1, { title: 'WHAT IS REVIEWED', sub: 'Initiative, effort, attitude, job knowledge', cam: cam2, key: ['hbBWhite'],
          cap: ['Initiative, effort, attitude and job knowledge', 'Strengths and areas for improvement'],
          build: function (t, g, fx) {
            var S = base(); S.rows = Math.min(4, Math.floor(fx.E(t, 0.8, 5.4) * 4.99)); S.mgO = { arm: t > 0.8 && t < 6 ? 'out' : 'down' };
            world(g, fx, S); if (S.rows > 0 && t < 6.2) ping(g, 44, 1, 12, t, 8);
          } }),
        step(2, { title: 'ASK ANY TIME', sub: 'Request a performance improvement plan', cam: cam3, key: ['docs'], big: { n: 'ANY', label: 'time, ask for a plan', pos: 'left' },
          cap: ['You may ask your manager for a plan at any time', 'A good review does not guarantee a raise'],
          build: function (t, g, fx) {
            var S = base(); S.emO = { arm: t > 0.8 && t < 3.0 ? 'up' : 'down' }; S.mgO = { arm: t > 3.2 && t < 5.4 ? 'write' : 'down' }; S.ok = t > 5.4;
            world(g, fx, S);
          } })
      ] });
  })();

  /* ================================================================ 5.7 Post-Employment References: the HR counter */
  (function () {
    var C = { id: '57', X: 50, Y: 30, H: 26, floor: 'checker', a: '#b9b3a4', b: '#c2bcad', tile: 6, wl: '#40505a', wr: '#4a5d69', style: 'wain', rail: '#8a9aa6', top: '#b4bcc2' };
    var HRP = LOOK.blue, RQ = LOOK.plum;
    function world(g, fx, S) {
      room(g, C); var L = g.list();
      L.prop('hbBWindow', 0, 12, 10, { face: 'x', w: 12, h: 14 });
      L.prop('cabinet', 3, 1, 0); L.prop('cabinet', 12, 1, 0);
      L.prop('counter', 14, 10, 0, { w: 26, d: 8 });
      L.prop('hbBPhone', 16, 12, 11, { ring: S.ring });
      if (S.cards > 0) L.prop('docs', 22, 11, 11, { n: 1, w: 6, head: P.blueT });
      if (S.cards > 1) L.prop('docs', 30, 11, 11, { n: 1, w: 6, head: P.green });
      if (S.stub) L.prop('paystub', 28, 10, 11, { rows: S.rows, total: S.total });
      L.prop('hbBPlant', 44, 22, 0);
      person(L, fx, S.hr, HRP, S.hrO); person(L, fx, S.rq, RQ, S.rqO);
      L.flush();
    }
    function base() { return { ring: false, cards: 0, stub: false, rows: 0, total: 0, hr: at(27, 7, 1), hrO: {}, rq: at(27, 22, 3), rqO: {} }; }
    var cam1 = { x: 23.5, y: 11, zoom: 2 }, cam2 = { x: 30, y: 10, zoom: 2, z: 6 }, cam3 = { x: 16, y: 18.5, zoom: 2 };
    reg('5.7', '5.7', { title: 'Post-Employment References', blurb: 'References go through HR: dates of employment and job title only, pay with written authorization.',
      backdrop: ['diag', '#12181c', '#1b242a'],
      steps: [
        step(0, { title: 'REQUESTS GO TO HR', sub: 'Forward any request to HR', cam: cam1, key: ['hbBPhone'],
          cap: ['A request for employment verification arrives', 'Forward it to HR'],
          build: function (t, g, fx) {
            var S = base(); S.rq = fx.walk([[8, 26], [27, 26], [27, 22]], t, 0.3, 2.2, { endDir: 3 }); S.ring = t > 1.2 && t < 3.6 && Math.floor(t * 3) % 2 === 0;
            S.rqO = { hold: t < 3.6 ? P.paper : undefined, holdSize: [4, 3], arm: t > 2.6 && t < 3.8 ? 'out' : 'down' }; S.hrO = { arm: t > 3.6 && t < 6.0 ? 'out' : 'down' };
            world(g, fx, S);
          } }),
        step(1, { title: 'DATES AND JOB TITLE ONLY', sub: 'That is all ADVANCED confirms', cam: cam2, key: ['counter'],
          cap: ['ADVANCED confirms dates of employment', 'And the job title only'],
          build: function (t, g, fx) {
            var S = base(); S.cards = t > 4.0 ? 2 : t > 1.2 ? 1 : 0; S.hrO = { arm: t > 1.0 && t < 6 ? 'out' : 'down' };
            world(g, fx, S); if (t > 1.2 && t < 2.6) ping(g, 25, 14, 14, t, 8); if (t > 4.0 && t < 5.4) ping(g, 33, 14, 14, t, 8);
          } }),
        step(2, { title: 'PAY NEEDS A WRITTEN OK', sub: 'Compensation, with written authorization', cam: cam3, key: ['paystub'], big: { n: 'PAY', label: 'written authorization', pos: 'left' },
          cap: ['Compensation needs written authorization', 'With it, ADVANCED will confirm compensation'],
          build: function (t, g, fx) {
            var S = base(); S.rqO = { hold: t > 0.8 && t < 3.0 ? P.green : undefined, holdSize: [4, 3], arm: t > 0.8 && t < 3.0 ? 'out' : 'down' };
            S.stub = t > 3.4; S.rows = Math.min(4, Math.floor(fx.E(t, 3.4, 5.4) * 4.99)); S.total = fx.E(t, 5.0, 6.4); S.hrO = { arm: t > 3.0 && t < 5.4 ? 'out' : 'down' };
            world(g, fx, S);
          } })
      ] });
  })();

  /* ================================================================ 5.8 Promotions: the climb to the next job */
  (function () {
    var C = { id: '58', X: 58, Y: 30, H: 26, floor: 'checker', a: '#575c61', b: '#5f656a', tile: 6, wl: '#3d4048', wr: '#454951', style: 'band', accent: P.red2, top: '#999fa6' };
    var EMP = LOOK.red, SUP = LOOK.cream, PEER = LOOK.blue, DOC = [P.red, P.amber, P.blueT, P.green];
    /* stair k (1..4) covers x from 34 - 5k to 39 - 5k and is 3k high; the platform (x below 14) is 12 high */
    function hAt(x) { var k = Math.ceil((34 - (x - 1)) / 5); return (k < 0 ? 0 : k > 4 ? 4 : k) * 3; }
    function world(g, fx, S) {
      room(g, C); var L = g.list(), k;
      L.box(0, 4, 0, 14, 18, 12, 'steel');
      for (k = 1; k <= 4; k++) L.box(34 - 5 * k, 12, 0, 5, 8, 3 * k, k % 2 ? 'metal' : 'steel');
      L.prop('desk', 2, 5, 12, { w: 10, d: 8 }); L.prop('monitor', 4, 7, 21, { rows: 2 });
      for (k = 0; k < S.docs; k++) L.prop('docs', 30 - 5 * k, 12, 3 * (k + 1), { n: 1, w: 3, d: 2, head: DOC[k] });
      L.prop('hbBPlant', 50, 22, 0); L.prop('cabinet', 48, 1, 0);
      if (S.sup) L.person(S.sup.x, S.sup.y, S.sup.dir, fx.who(S.sup, ext(SUP, ext({ z: 12 }, S.supO || {}))));
      if (S.em) L.person(S.em.x, S.em.y, S.em.dir, fx.who(S.em, ext(EMP, ext({ z: hAt(S.em.x) }, S.emO || {}))));
      person(L, fx, S.pe, PEER, S.peO);
      L.flush();
    }
    function base() { return { docs: 0, sup: at(4, 16, 0), supO: {}, em: at(38, 16, 2), emO: {}, pe: at(38, 24, 2), peO: {} }; }
    var cam1 = { x: 32, y: 14, zoom: 2 }, cam2 = { x: 26, y: 14, zoom: 2, z: 8 }, cam3 = { x: 6, y: 24, zoom: 2, z: 14 };
    reg('5.8', '5.8', { title: 'Promotions', blurb: 'We promote from within when the most qualified candidate is available.',
      backdrop: ['stripes', '#16181c', '#20242a'],
      steps: [
        step(0, { title: 'PROMOTE FROM WITHIN', sub: 'When the most qualified candidate is available', cam: cam1, key: [],
          cap: ['We promote from within whenever possible', 'When the most qualified candidate is available'],
          build: function (t, g, fx) {
            var S = base(); S.sup = null; S.em = fx.walk([[40, 16], [36, 16]], t, 0.6, 2.0, { startDir: 2, endDir: 2 }); S.supO = { arm: t > 1.0 && t < 5.5 ? 'out' : 'down' };
            S.peO = { arm: Math.floor(t * 1.3) % 2 ? 'out' : 'down' };
            world(g, fx, S);
          } }),
        step(1, { title: 'WHAT COUNTS', sub: 'Skills, education, experience and more', cam: cam2, key: [],
          cap: ['Skills, education, experience and qualifications', 'Promotions are on an equal opportunity basis'],
          build: function (t, g, fx) {
            var S = base(); S.pe = null; S.sup = null; S.docs = t > 4.4 ? 4 : t > 3.2 ? 3 : t > 2.0 ? 2 : t > 0.8 ? 1 : 0;
            S.em = fx.walk([[36, 16], [26, 16], [18, 16]], t, 0.6, 6.0, { startDir: 2, endDir: 2 });
            world(g, fx, S);
          } }),
        step(2, { title: 'SHOW INITIATIVE', sub: 'Tell your supervisor, join the training', cam: cam3, key: ['desk'], big: { n: 'EQUAL', label: 'opportunity basis', pos: 'left' },
          cap: ['Tell your supervisor you want to grow', 'Join training and development programs'],
          build: function (t, g, fx) {
            var S = base(); S.pe = null; S.docs = 4; S.em = fx.walk([[22, 16], [10, 16]], t, 0.2, 2.4, { startDir: 2, endDir: 2 });
            S.supO = { arm: t > 2.8 && t < 5.8 ? 'out' : 'down' }; S.emO = { arm: t > 3.4 && t < 5.4 ? 'up' : 'down' };
            world(g, fx, S);
          } })
      ] });
  })();

  /* ================================================================ 5.9 Resignation Policy: the manager's office and the return bin */
  (function () {
    var C = { id: '59', X: 56, Y: 32, H: 28, floor: 'checker', a: '#556677', b: '#5d6e80', tile: 6, wl: '#6b6f76', wr: '#767b83', style: 'band', accent: '#2b4f78', top: '#c4c9ce',
      zones: [[24, 6, 28, 22, '#3f4d5c']] };
    var EM = LOOK.green, MG = LOOK.cream, ITEM = [P.red, P.st3, P.blueT];
    function world(g, fx, S) {
      room(g, C); var L = g.list();
      L.prop('hbBCalendar', 8, 0, 9, { n: S.n1, col: P.amber });
      L.prop('hbBCalendar', 22, 0, 9, { n: S.n2, col: P.red });
      L.prop('hbBWindow', 0, 8, 10, { face: 'x', w: 14, h: 14, sun: true });
      L.prop('desk', 28, 10, 0, { w: 18, d: 11 }); L.prop('monitor', 30, 13, 9, { rows: 2 });
      if (S.letter) L.prop('docs', 38, 12, 9, { n: 1, w: 6, head: P.paper });
      L.prop('bin', 6, 22, 0, { col: 'dark', fill: S.bin, item: 'silver' });
      L.prop('cabinet', 1, 12, 0, { face: 'x' }); L.prop('hbBPlant', 50, 24, 0);
      person(L, fx, S.mg, MG, S.mgO); person(L, fx, S.em, EM, S.emO);
      L.flush();
    }
    function base() { return { n1: 0, n2: 0, letter: false, bin: 0, mg: at(37, 7, 1), mgO: {}, em: at(37, 26, 3), emO: {} }; }
    var cam1 = { x: 33.5, y: 13, zoom: 2 }, cam2 = { x: 18.5, y: 20, zoom: 2 }, cam3 = { x: 24, y: 4.5, zoom: 2, z: 4 };
    reg('5.9', '5.9', { title: 'Resignation Policy', blurb: 'Give written notice, return ADVANCED property, and know the notice requested.',
      backdrop: ['diag', '#10161d', '#18202b'],
      steps: [
        step(0, { title: 'WHEN YOU RESIGN', sub: 'Give your manager a written letter', cam: cam1, key: ['desk'],
          cap: ['Provide a written resignation letter', 'Give it to your manager'],
          build: function (t, g, fx) {
            var S = base(); S.em = fx.walk([[37, 31], [37, 26]], t, 0.2, 1.2, { startDir: 3, endDir: 3 }); S.emO = { hold: t > 1.4 && t < 3.0 ? P.paper : undefined, holdSize: [4, 3], arm: t > 1.4 && t < 3.0 ? 'out' : 'down' };
            S.mgO = { arm: t > 2.6 && t < 4.2 ? 'out' : 'down' }; S.letter = t > 3.0;
            world(g, fx, S); if (t > 3.0 && t < 5.0) ping(g, 41, 14, 10, t, 8);
          } }),
        step(1, { title: 'RETURN YOUR PROPERTY', sub: 'All ADVANCED property comes back', cam: cam2, key: ['bin'],
          cap: ['Return all ADVANCED property when you leave', 'Unreturned items may come out of final pay'],
          build: function (t, g, fx) {
            var S = base(); S.mg = null; S.letter = true;
            S.em = fx.walk([[37, 26], [20, 26], [20, 18], [10, 18]], t, 0.4, 3.2, { endDir: 1 }); S.bin = t > 5.0 ? 3 : t > 4.2 ? 2 : t > 3.6 ? 1 : 0;
            S.emO = { hold: t < 3.4 ? ITEM[0] : t < 4.6 ? ITEM[1] : t < 5.4 ? ITEM[2] : undefined, holdSize: [3, 3], arm: t > 3.2 && t < 5.6 ? 'out' : 'down' };
            world(g, fx, S);
          } }),
        step(2, { title: 'TWO WEEKS NOTICE', sub: 'Four weeks for managers', cam: cam3, key: ['hbBCalendar'], big: { n: 'TWO', label: 'weeks minimum notice', pos: 'right' },
          cap: ['A minimum of two weeks notice is requested', 'Managers are asked for four weeks'],
          build: function (t, g, fx) {
            var S = base(); S.letter = true; S.n1 = Math.round(10 * fx.E(t, 0.6, 2.6)); S.n2 = t > 3.2 ? Math.round(20 * fx.E(t, 3.2, 5.4)) : 0;
            S.mg = at(21, 8, 1); S.em = at(21, 20, 3); S.mgO = { arm: Math.floor(t * 1.2) % 2 ? 'out' : 'down' };
            world(g, fx, S);
          } })
      ] });
  })();

  /* ================================================================ 5.10 Standards of Conduct: the shop floor with the rules board */
  (function () {
    var C = { id: '510', X: 60, Y: 34, H: 30, floor: 'checker', a: '#161a1e', b: '#1b2025', tile: 6, wl: '#1f2a44', wr: '#273453', style: 'panel', rail: '#6a7fb0', top: '#9aa6bd',
      zones: [[2, 28, 56, 1, P.amberD], [26, 22, 30, 1, P.amberD]] };
    var WA = LOOK.amber, WB = LOOK.green, SP = LOOK.steel;
    function world(g, fx, S) {
      room(g, C); var L = g.list();
      L.prop('board', 0, 6, 6, { face: 'x', w: 24, h: 22, rows: 8, show: S.show, lit: S.lit, done: 0 });
      L.prop('machine', 36, 2, 0, { lamp: 'green', run: S.run, t: fx.t, spin: fx.t * 3 });
      L.prop('hbBPlant', 56, 26, 0);
      if (S.no) noSign(L, S.no[0], S.no[1]);
      person(L, fx, S.a, WA, S.aO); person(L, fx, S.b, WB, S.bO); person(L, fx, S.sp, SP, S.spO);
      L.flush();
    }
    function base() { return { show: 8, lit: -1, run: 0, no: null, a: at(45, 20, 3), aO: {}, b: at(18, 25, 1), bO: {}, sp: at(32, 25, 1), spO: {} }; }
    var cam1 = { x: 28, y: 19, zoom: 2 }, cam2 = { x: 10, y: 18, zoom: 2, z: 8 }, cam3 = { x: 19, y: 24, zoom: 2 };
    reg('5.10', '5.10', { title: 'Standards of Conduct', blurb: 'We share the work environment, so we follow common-sense rules or face discipline.',
      backdrop: ['bands', '#0e1320', '#161d33'],
      steps: [
        step(0, { title: 'WE ALL SHARE IT', sub: 'Respect, responsibility and integrity', cam: cam1, key: [],
          cap: ['Respect, responsibility and integrity', 'By working here you agree to follow our rules'],
          build: function (t, g, fx) {
            var S = base(); S.run = 1; S.aO = { arm: 'write' }; S.bO = { arm: Math.floor(t * 1.2) % 2 ? 'out' : 'down' }; S.spO = { arm: Math.floor(t * 1.2 + 0.6) % 2 ? 'out' : 'down' };
            S.show = Math.floor(fx.E(t, 0.4, 3.4) * 8.99);
            world(g, fx, S);
          } }),
        step(1, { title: 'COMMON-SENSE INFRACTIONS', sub: 'Rules the board lists', cam: cam2, key: ['board'],
          cap: ['Not following safety rules and procedures', 'Excessive tardiness or absences'],
          build: function (t, g, fx) {
            var S = base(); S.a = null; S.sp = null; S.b = at(14, 18, 2); S.lit = Math.min(7, Math.floor(fx.E(t, 0.6, 6.2) * 7.99)); S.bO = { arm: 'down' };
            world(g, fx, S);
          } }),
        step(2, { title: 'WHAT CAN FOLLOW', sub: 'Discipline for misconduct', cam: cam3, key: ['hbBPlant'], big: { n: 'UP TO', label: 'termination', pos: 'left' },
          cap: ['Discipline for misconduct is possible', 'Up to and including immediate termination'],
          build: function (t, g, fx) {
            var S = base(); S.a = at(34, 20, 2); S.b = null; S.sp = at(26, 20, 0);
            S.spO = { arm: t > 1.0 && t < 4.5 ? 'out' : 'down', hold: t > 1.0 && t < 4.5 ? P.amber : undefined, holdSize: [4, 3] }; S.aO = { arm: t > 4.8 ? 'up' : 'down' };
            world(g, fx, S);
          } })
      ] });
  })();

  /* ================================================================ 5.11 Transfers: from one work cell to another, with a 90 day meter */
  (function () {
    var C = { id: '511', X: 64, Y: 32, H: 26, floor: 'checker', a: '#5a5348', b: '#645c50', wl: '#4a3a2c', wr: '#574536', style: 'stripe', accent: P.amber, top: '#a89c86',
      zones: [[2, 14, 26, 10, '#4a3d30'], [34, 14, 26, 14, '#3f4a50']] };
    var WK = LOOK.red;
    function world(g, fx, S) {
      room(g, C); var L = g.list();
      L.prop('table', 6, 6, 0, { w: 16, d: 8, h: 9, top: 'wood' }); L.prop('crate', 8, 7, 9, { w: 6, d: 5, h: 5, tag: P.amber }); L.prop('crate', 15, 7, 9, { w: 5, d: 5, h: 4 });
      L.prop('hbBMeter', 14, 0, 5, { w: 28, v: S.v });
      L.prop('machine', 44, 2, 0, { lamp: S.lamp, run: S.run, t: fx.t, spin: fx.t * 3 });
      L.prop('table', 34, 22, 0, { w: 12, d: 8, h: 9, top: 'steel' });
      if (S.stub) L.prop('paystub', 35, 22, 9, { rows: 4, total: S.total });
      if (S.flow) L.flow([[12, 20], [30, 20], [46, 26]], fx.t, { z: 0, color: P.redT, len: 2, gap: 3, speed: 9 });
      L.prop('hbBPlant', 58, 26, 0);
      person(L, fx, S.wk, WK, S.wkO);
      L.flush();
    }
    function base() { return { v: 0, lamp: 'green', run: 0, flow: false, stub: false, total: 0, wk: at(12, 18, 0), wkO: {} }; }
    var cam1 = { x: 24.5, y: 15.5, zoom: 2 }, cam2 = { x: 31.5, y: 11.5, zoom: 2, z: 8 }, cam3 = { x: 24, y: 27, zoom: 2 };
    reg('5.11', '5.11', { title: 'Transfers', blurb: 'You may be moved to another position. After 90 days a transfer may be final.',
      backdrop: ['diag', '#15120f', '#221c16'],
      steps: [
        step(0, { title: 'MOVED TO A NEW POSITION', sub: 'Production or service needs', cam: cam1, key: [],
          cap: ['ADVANCED may transfer you with or without notice', 'Or at your request, with management approval'],
          build: function (t, g, fx) {
            var S = base(); S.flow = t > 0.6 && t < 5.8; S.wk = fx.walk([[12, 18], [30, 18], [44, 20]], t, 1.0, 5.4, { startDir: 0, endDir: 3 }); S.run = t > 5.4 ? 1 : 0;
            S.wkO = { hold: t < 5.4 ? '#cfa371' : undefined, holdSize: [5, 4] };
            world(g, fx, S);
          } }),
        step(1, { title: 'THE 90 DAY MARK', sub: 'Days pass in the new position', cam: cam2, key: ['hbBMeter'], tag: 'FAST FORWARD',
          cap: ['Transfers in excess of 90 days', 'May be considered final'],
          notes: [{ a: 4.6, b: 6.8, x: 214, y: 100, text: '90 days' }],
          build: function (t, g, fx) {
            var S = base(); S.wk = at(40, 18, 3); S.run = 1; S.wkO = { arm: 'write' }; S.v = fx.E(t, 0.6, 4.6);
            world(g, fx, S); if (t > 4.6 && t < 6.6) ping(g, 40, 1, 14, t, 9);
          } }),
        step(2, { title: 'PAY FOLLOWS THE NEW JOB', sub: 'The pay scale of the new position', cam: cam3, key: ['paystub'], big: { n: '90', label: 'days: may be final', pos: 'left' },
          cap: ['Pay follows the new position pay scale', 'It may go up or down'],
          build: function (t, g, fx) {
            var S = base(); S.v = 1; S.stub = true; S.total = fx.E(t, 0.8, 3.4); S.wk = at(30, 24, 0); S.wkO = { arm: t > 3.6 ? 'out' : 'down' };
            world(g, fx, S);
          } })
      ] });
  })();

  /* ================================================================ 5.12 Workforce Reductions: the meeting room with a falling chart and a balance */
  (function () {
    var C = { id: '512', X: 56, Y: 32, H: 28, floor: 'checker', a: '#a9afb5', b: '#b2b8be', tile: 6, wl: '#24382f', wr: '#2d463b', style: 'stripe', accent: '#b9c2bc', top: '#a7b4ab',
      zones: [[8, 6, 40, 24, '#8f959b']] };
    var M1 = LOOK.cream, M2 = LOOK.blue, M3 = LOOK.steel;
    function world(g, fx, S) {
      room(g, C); var L = g.list();
      L.prop('hbBChart', 8, 0, 6, { w: 22, h: 18, bars: S.bars, cols: [P.st2, P.st2, P.amber, P.red] });
      L.prop('hbBWindow', 0, 8, 10, { face: 'x', w: 14, h: 14, sky: '#3b5a52' });
      L.prop('table', 14, 12, 0, { w: 24, d: 12, h: 9, top: 'wood' });
      if (S.docs) L.prop('docs', 31, 15, 9, { n: 2, head: P.amber });
      L.prop('hbBScale', 14, 14, 9, { tilt: S.tilt });
      L.prop('hbBPlant', 46, 24, 0);
      person(L, fx, S.m1, M1, S.m1O); person(L, fx, S.m2, M2, S.m2O); person(L, fx, S.m3, M3, S.m3O);
      L.flush();
    }
    function base() { return { bars: [8, 7, 6, 5], docs: false, tilt: 0, m1: at(22, 8, 1), m1O: {}, m2: at(22, 28, 3), m2O: {}, m3: at(42, 10, 2), m3O: {} }; }
    var cam3 = { x: 14, y: 14, zoom: 2, z: 2 };
    reg('5.12', '5.12', { title: 'Workforce Reductions (Layoffs)', blurb: 'If business needs require it, management may decide on a reduction in force.',
      backdrop: ['stripes', '#0f1713', '#17241d'],
      steps: [
        step(0, { title: 'BUSINESS NEEDS', sub: 'Management weighs them', cam: { x: 18.5, y: 14.5, zoom: 2, z: 4 }, key: ['hbBChart'],
          cap: ['Management may decide on a reduction in force', 'Only if necessary, based on business needs'],
          build: function (t, g, fx) {
            var S = base(), k = fx.E(t, 0.8, 5.0); S.bars = [8, Math.round(8 - 2 * k), Math.round(8 - 4 * k), Math.round(8 - 6 * k)]; S.m3 = null; S.m1O = { arm: t > 1 ? 'out' : 'down' };
            world(g, fx, S);
          } }),
        step(1, { title: 'A TRYING TIME', sub: 'For everyone involved', cam: { x: 25.5, y: 16.5, zoom: 2, z: 5 }, key: ['docs'],
          cap: ['It can be a trying experience for all involved', 'ADVANCED will make its best effort'],
          build: function (t, g, fx) {
            var S = base(); S.docs = t > 0.8; S.bars = [8, 6, 4, 2]; S.m1O = { arm: Math.floor(t * 1.1) % 2 ? 'out' : 'down' }; S.m2O = { arm: Math.floor(t * 1.1 + 0.5) % 2 ? 'out' : 'down' };
            world(g, fx, S);
          } }),
        step(2, { title: 'SOUND DECISIONS', sub: 'Business decisions and workforce needs', cam: cam3, key: ['hbBScale'], big: { n: 'RIF', label: 'reduction in force', pos: 'left' },
          cap: ['Its best effort at sound business decisions', 'While acknowledging the needs of its workforce'],
          build: function (t, g, fx) {
            var S = base(); S.docs = true; S.bars = [8, 6, 4, 2]; S.tilt = t < 2.2 ? -1 + 0 * t : (t < 4.4 ? 1 : 0); S.tilt = fx.E(t, 0.6, 1.8) * -1 + fx.E(t, 2.6, 3.8) * 2 - fx.E(t, 4.4, 5.6);
            S.m2 = null; S.m3 = null; S.m1O = { arm: 'out' }; S.m3O = { arm: t > 1 ? 'out' : 'down' };
            world(g, fx, S);
          } })
      ] });
  })();

  /* ================================================================ OK-Disciplinary Disciplinary Process: the manager's office and the steps chart */
  (function () {
    var C = { id: 'dp', X: 54, Y: 32, H: 28, floor: 'checker', a: '#241a12', b: '#2a1f16', tile: 6, wl: '#2c2c30', wr: '#353539', style: 'panel', rail: '#8a8d96', top: '#a0a3ab',
      zones: [[14, 4, 36, 24, '#1c140e']] };
    var MG = LOOK.cream, EM = LOOK.red;
    function world(g, fx, S) {
      room(g, C); var L = g.list();
      L.prop('hbBChart', 30, 0, 6, { w: 20, h: 18, bars: S.bars, cols: [P.cream2, P.amber, P.amber, P.red] });
      L.prop('hbBWindow', 0, 8, 10, { face: 'x', w: 14, h: 14, sky: '#3a4350' });
      L.prop('desk', 24, 10, 0, { w: 18, d: 11 }); L.prop('monitor', 26, 13, 9, { rows: 2 });
      for (var i = 0; i < S.docs; i++) L.prop('docs', 35 + (i % 2) * 3, 12 + Math.floor(i / 2) * 3, 9, { n: 1, w: 3, d: 2, head: i === 0 ? P.cream2 : P.amber });
      L.prop('cabinet', 2, 1, 0); L.prop('hbBPlant', 48, 24, 0);
      person(L, fx, S.mg, MG, S.mgO); person(L, fx, S.em, EM, S.emO);
      L.flush();
    }
    function base() { return { bars: [0, 0, 0, 0], docs: 0, mg: at(32, 7, 1), mgO: {}, em: at(32, 26, 3), emO: {} }; }
    var cam1 = { x: 28.5, y: 13.5, zoom: 2 }, cam2 = { x: 27, y: 12, zoom: 2, z: 6 }, cam3 = { x: 21, y: 21, zoom: 2 };
    reg('OK-Disciplinary Process', 'Disciplinary Process', { title: 'Disciplinary Process', blurb: 'Rule violations can lead to discipline, usually in steps, and you can respond.',
      backdrop: ['bands', '#161213', '#231b1c'],
      steps: [
        step(0, { title: 'A POLICY IS BROKEN', sub: 'Discipline may follow a violation', cam: cam1, key: ['desk'],
          cap: ['Violating a policy may lead to discipline', 'Demotion, transfer, unpaid leave or termination'],
          build: function (t, g, fx) {
            var S = base(); S.docs = t > 1.0 ? 1 : 0; S.mgO = { arm: t > 1.0 && t < 4.0 ? 'out' : 'down' };
            world(g, fx, S); if (t > 1.0 && t < 2.6) ping(g, 36, 14, 10, t, 8);
          } }),
        step(1, { title: 'STEPS, USUALLY', sub: 'Progressive discipline', cam: cam2, key: ['hbBChart'],
          cap: ['First a verbal warning, then written warnings', 'Not required: no warning may come first'],
          build: function (t, g, fx) {
            var S = base(); S.docs = t > 4.0 ? 3 : t > 2.6 ? 2 : 1;
            S.bars = [Math.round(3 * fx.E(t, 0.6, 1.4)), Math.round(6 * fx.E(t, 1.8, 2.6)), Math.round(9 * fx.E(t, 3.0, 3.8)), Math.round(12 * fx.E(t, 4.4, 5.2))];
            world(g, fx, S);
          } }),
        step(2, { title: 'YOU CAN RESPOND', sub: 'Your manager makes every effort', cam: cam3, key: ['desk'], big: { n: 'YOU', label: 'can respond to action', pos: 'left' },
          cap: ['Your manager will let you respond', 'To any disciplinary action taken'],
          build: function (t, g, fx) {
            var S = base(); S.docs = 3; S.bars = [3, 6, 9, 12]; S.emO = { arm: Math.floor(t * 1.3) % 2 ? 'up' : 'out' }; S.mgO = { arm: Math.floor(t * 1.3 + 0.7) % 2 ? 'out' : 'down' };
            world(g, fx, S);
          } })
      ] });
  })();

  /*__POLICIES__*/

/*FIX:BEGIN*/
  /* Placement fixes for the named characters (they are larger than the old workers). FIX[spec key][step number] =
     { cam: n (the picture moves down n screen px, keeps heads below the sign), who: { name: [dx, dy] } (that character moves by whole world units) }. */
  function applyFix(H, FIX) {
    Object.keys(FIX).forEach(function (key) {
      var spec = H[key]; if (!spec) return;
      Object.keys(FIX[key]).forEach(function (sn) {
        var st = spec.steps[+sn - 1], f = FIX[key][sn]; if (!st) return;
        if (f.cam) {
          ['cam'].forEach(function (k) { var c = st[k] || { x: 26, y: 14, zoom: 1 }, z = c.zoom === 2 ? 2 : 1, d = f.cam / (2 * z), n = {}, q; for (q in c) n[q] = c[q]; n.x = c.x - d; n.y = c.y - d; st[k] = n; });
        }
        if (f.who && st.build) {
          var b0 = st.build;
          st.build = function (t, g, fx) {
            var l0 = g.list;
            g.list = function () { var L = l0.apply(g, arguments), p0 = L.person; L.person = function (x, y, d, o) { var m = o && o.who && f.who[o.who]; return p0.call(L, m ? x + m[0] : x, m ? y + m[1] : y, d, o); }; return L; };
            try { return b0.call(st, t, g, fx); } finally { g.list = l0; }
          };
        }
      });
    });
  }
  var FIX = {
    "4.8": {"1":{"cam":12},"2":{"cam":4},"3":{"who":{"forrest":[0,1]}}},
    "OK-Accommodations for Nursing Mot": {"2":{"cam":8}},
    "OK-Meal and Rest Periods": {"1":{"cam":4},"3":{"who":{"forrest":[-2,0]}}},
    "5.5": {"1":{"cam":12}},
    "5.6": {"2":{"cam":8}},
    "5.8": {"2":{"who":{"raul":[2,2]}},"3":{"cam":4,"who":{"raul":[1,0]}}},
    "5.9": {"2":{"cam":12,"who":{"forrest":[1,2]}}},
    "5.11": {"1":{"cam":8}},
    "5.12": {"2":{"cam":4}},
    "4.6": {"2":{"cam":8}},
    "4.7": {"1":{"who":{"pk":[0,1]}},"2":{"who":{"pk":[0,1]}},"3":{"who":{"pam":[2,2]}}}
  };
  if (!globalThis.HB_NOFIX) applyFix(HB, FIX);
  /*FIX:END*/

  if (typeof module !== 'undefined' && module.exports) module.exports = HB;
})(typeof window !== 'undefined' ? window : globalThis);
