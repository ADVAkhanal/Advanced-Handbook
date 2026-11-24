/* ============================================================================================================
   hb-iso-A.js  -  handbook policy explainers, batch A (21 policies): Welcome & Company, Hiring & Orientation, Pay & Hours (first five).
   One spec per policy section, registered as HB_ISO['<section id>'] and played by hb-iso-adapter.js.
   Every spec: 3 steps, about 7 seconds each. The sign names the layer (who it is about, what happens, what to do);
   the last step ends on one big number or one short fact taken from the policy's own text (see facts-A.json).
   The pictures are tilted cutaways of the real workplace, built layer by layer. No text is drawn in the canvas.
   ============================================================================================================ */
(function (root) {
  'use strict';
  var ISO = root.ISO || require('./iso-kit.js'), P = ISO.P, HB = (root.HB_ISO = root.HB_ISO || {}), OUT = {};
  function clampN(x, a, b) { return x < a ? a : x > b ? b : x; }
  function ext(a, b) { var r = {}, k; for (k in a) r[k] = a[k]; for (k in b) r[k] = b[k]; return r; }
  function scr(c, x, y, z) { var Z = c.zoom === 2 ? 2 : 1; return [Math.round(120 + (x - y) * 2 * Z - (c.x - c.y) * 2 * Z), Math.round(98 + (x + y - (z || 0)) * Z - (c.x + c.y - (c.z || 0)) * Z)]; }
  /* camera at zoom 2 that puts the world point (ax, ay, az) at the picture point (sx, sy) */
  function cam(ax, ay, az, sx, sy) { var a = (ax - ay) - (sx - 120) / 4, b = (ax + ay - (az || 0)) - (sy - 98) / 2; return { x: Math.round((a + b) / 2), y: Math.round((b - a) / 2), zoom: 2, z: 0 }; }
  function ring(g, x, y, z, t, col, rad) { var p = g.proj(x, y, z); g.ring(p[0], p[1], rad || 12, t, col || P.redT, 0.5); }
  function glowAt(g, x, y, z, rad, col, k) { var p = g.proj(x, y, z); g.glow(p[0], p[1], rad, col, k); }

  /* people */
  var ME = { shirt: P.red, hair: '#2b2018', badge: true };
  var MGR = { shirt: P.blue, hair: '#5a3a22', skin: P.skin3, badge: true };
  var HRP = { shirt: P.st2, hair: '#1f1a17', skin: P.skin2, badge: true, glasses: true };
  var OPA = { shirt: P.green, hair: '#3a2c22', skin: P.skin2, vest: true, hat: P.amber };
  var OPB = { shirt: P.amber, hair: '#1f1a17', skin: P.skin3 };
  var OPC = { shirt: '#6c4aa0', hair: '#7a5a3a', skin: P.skin };
  var CRM = { shirt: '#d8d1c2', hair: '#9a9a9a', skin: P.skin3 };
  var LAYERS = ['Who', 'What happens', 'What to do'];

  /* extra props (prefix ha) used by this batch */
  ISO.defineProp('haWin', function (o) { return [o.w || 10, 1, o.h || 10]; }, function (s, o) {
    s.B(0, 0, 0, s.w, 1, s.h, 'dark', { rim: false });
    s.F(1, 1, s.w - 2, s.h - 2, { fill: o.sky || '#5b7690', border: P.st3 }, 1);
    s.F(Math.floor(s.w / 2), 1, 1, s.h - 2, P.st3, 1); s.F(1, Math.floor(s.h / 2), s.w - 2, 1, P.st3, 1);
  });
  ISO.defineProp('haDoor', function (o) { return [o.w || 10, 2, o.h || 20]; }, function (s, o) {
    var open = o.open || 0;
    s.B(0, 0, 0, s.w, 2, s.h, 'dark', { rim: false });
    s.F(1, 0, s.w - 2, s.h - 1, '#0c0e10', 2);
    var dw = Math.round((s.w - 2) * (1 - open));
    if (dw > 0) { s.F(1, 0, dw, s.h - 1, o.col || ISO.M.wood.left, 2); s.F(Math.max(2, dw - 2), Math.round(s.h / 2), 1, 2, P.amber, 2); }
    s.F(0, s.h - 1, s.w, 1, o.top || P.red, 2);
  });
  ISO.defineProp('haPlant', [4, 4, 12], function (s, o) {
    s.B(1, 1, 0, 3, 3, 4, 'wood', { rim: false });
    s.C(2.5, 2.5, 4, 1.4, 5, 'green', { rim: false }); s.C(2.5, 2.5, 8, 1.9, 4, { top: '#6ad79f', left: '#3fbf7f', right: '#2b8a5a' }, { rim: false });
  });
  ISO.defineProp('haChair', [5, 5, 9], function (s, o) {
    s.B(1, 1, 0, 1, 1, 4, 'dark', { rim: false }); s.B(3, 3, 0, 1, 1, 4, 'dark', { rim: false });
    s.B(0, 0, 4, 5, 5, 1, o.col || 'steel', { rim: false }); s.B(0, 0, 5, 5, 1, 4, o.col || 'steel', { rim: false });
  });
  ISO.defineProp('haBench', function (o) { return [o.w || 16, 5, 6]; }, function (s, o) {
    s.B(1, 1, 0, 2, 3, 4, 'dark', { rim: false }); s.B(s.w - 3, 1, 0, 2, 3, 4, 'dark', { rim: false });
    s.B(0, 0, 4, s.w, 5, 2, o.col || 'wood', { shadow: true });
  });
  ISO.defineProp('haNote', function (o) { return [o.w || 6, 1, o.h || 8]; }, function (s, o) {   /* a paper pinned flat on a wall */
    s.F(0, 0, s.w, s.h, { fill: o.fill || P.paper, border: o.border || P.st3 }, 1);
    for (var k = 2; k < s.h - 1; k += 2) s.F(1, k, s.w - 2 - (k % 3), 1, o.ink || P.line, 1);
    if (o.head) s.F(0, s.h - 2, s.w, 2, o.head, 1);
  });

  ISO.defineProp('haPlaque', function (o) { return [o.w || 5, 1, o.h || 9]; }, function (s, o) {   /* a lettered plaque on a wall: lit or dark, no text */
    s.B(0, 0, 0, s.w, 1, s.h, 'dark', { rim: false });
    s.F(1, 1, s.w - 2, s.h - 2, { fill: o.lit ? (o.col || P.amber) : '#2a2f34', border: o.lit ? ISO.mix(o.col || P.amber, '#000000', 0.45) : P.st1 }, 1);
    if (o.lit) { s.F(1, 1, s.w - 2, 1, P.cream, 1); s.F(2, 3, s.w - 4, 1, ISO.mix(o.col || P.amber, '#ffffff', 0.55), 1); }
  });
  ISO.defineProp('haPodium', [8, 6, 14], function (s, o) {
    s.B(1, 1, 0, 6, 4, 10, 'wood', { shadow: true });
    s.B(0, 0, 10, 8, 5, 2, 'wood', { rim: true });
    s.C(4, 2, 12, 0.5, 3, 'dark', { rim: false }); s.C(4, 2, 15, 0.9, 1, o.lit ? 'amber' : 'dark', { rim: false });
  });
  ISO.defineProp('haCal', function (o) { return [o.w || 14, 1, o.h || 12]; }, function (s, o) {   /* wall calendar: a grid of days, the first n are marked */
    s.B(0, 0, 0, s.w, 1, s.h, 'dark', { rim: false });
    s.F(1, 1, s.w - 2, s.h - 2, { fill: P.cream, border: P.st3 }, 1);
    s.F(1, s.h - 4, s.w - 2, 3, P.red, 1);
    var cols = o.cols || 5, rows = o.rows || 3, i, cw = Math.max(1, Math.floor((s.w - 4) / cols)), n = o.mark || 0;
    for (i = 0; i < cols * rows; i++) s.F(2 + (i % cols) * cw, s.h - 6 - Math.floor(i / cols) * 2, cw - 1, 1, i < n ? (i === n - 1 ? P.red : P.amber) : P.st3, 1);
  });
  ISO.defineProp('haPhone', [4, 3, 3], function (s, o) {
    s.B(0, 0, 0, 4, 3, 2, 'dark', { rim: false }); s.B(0, 0, 2, 4, 1, 1, o.ring ? 'red' : 'steel', { rim: false });
    if (o.ring) { var p = s.g.proj(s.x + 2, s.y + 1, s.z + 4); s.g.glow(p[0], p[1], 7, P.redT, 0.7); }
  });
  ISO.defineProp('haGift', [5, 5, 5], function (s, o) {
    s.B(0, 0, 0, 5, 5, 5, o.col || 'red', { shadow: true }); s.top(2, 0, 1, 5, 5, P.cream); s.F(2, 0, 1, 5, P.cream);
  });
  ISO.defineProp('haBed', [14, 8, 6], function (s, o) {
    s.B(0, 0, 0, 14, 8, 3, 'wood', { shadow: true }); s.B(1, 1, 3, 12, 6, 2, o.col || 'blue', { rim: false }); s.B(1, 1, 5, 4, 6, 1, 'paper', { rim: false });
  });
  ISO.defineProp('haCar', [14, 7, 8], function (s, o) {
    s.B(0, 0, 0, 14, 7, 4, o.col || 'red', { shadow: true }); s.B(3, 1, 4, 8, 5, 3, o.col || 'red', { rim: false });
    s.F(4, 4, 3, 2, '#8fb4d9', 6); s.F(8, 4, 2, 2, '#8fb4d9', 6);
    s.B(1, 0, 0, 3, 1, 1, 'black', { rim: false }); s.B(10, 0, 0, 3, 1, 1, 'black', { rim: false });
  });

  /* ---------------------------------------------------------------------------------------------------------
     builder: one policy = one room (cfg) and three steps. Each step gives a state S(t, fx) and the shared world draws it.
     --------------------------------------------------------------------------------------------------------- */
  function make(cfg) {
    var world = function (g, fx, S) {
      g.layer(cfg.key, [-6, -6, -8, cfg.X + 4, cfg.Y + 4, cfg.H + 2], function (s) {
        s.isoFloor(cfg.X, cfg.Y, cfg.floor || {});
        s.isoWallCut(cfg.X, cfg.Y, cfg.H, cfg.wall || {});
        if (cfg.deco) cfg.deco(s);
      });
      var L = g.list(); cfg.items(L, g, fx, S); L.flush();
    };
    var steps = cfg.steps.map(function (st, i) {
      var s2 = ext({ chips: LAYERS, chipAt: function () { return i; }, tag: 'EXAMPLE' }, st);
      s2.build = function (t, g, fx) { var S = st.S(t, fx); world(g, fx, S); if (st.over) st.over(t, g, fx, S); };
      delete s2.S; delete s2.over;
      return s2;
    });
    var spec = { id: 'hb-' + cfg.sid, title: cfg.title, std: cfg.std, blurb: cfg.blurb, backdrop: cfg.backdrop, camDur: cfg.camDur || 1, steps: steps };
    HB[cfg.sid] = spec; OUT[cfg.sid] = spec;
    return spec;
  }

