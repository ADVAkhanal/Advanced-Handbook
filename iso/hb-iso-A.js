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
  var ME = { who: 'raul', h: 26, shirt: P.red, hair: '#2b2018', badge: true };
  var MGR = { who: 'scott', h: 26, shirt: P.blue, hair: '#5a3a22', skin: P.skin3, badge: true };
  var HRP = { who: 'pam', h: 26, shirt: P.st2, hair: '#1f1a17', skin: P.skin2, badge: true, glasses: true };
  var OPA = { who: 'pk', h: 26, shirt: P.green, hair: '#3a2c22', skin: P.skin2, vest: true, hat: P.amber };
  var OPB = { who: 'randel', h: 26, shirt: P.amber, hair: '#1f1a17', skin: P.skin3 };
  var OPC = { who: 'steve', h: 26, shirt: '#6c4aa0', hair: '#7a5a3a', skin: P.skin };
  var CRM = { who: 'kim', h: 26, shirt: '#d8d1c2', hair: '#9a9a9a', skin: P.skin3 };
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

  /* 1.0 A Letter from Our Owners: a small shop grows into a team */
  (function () {
    var C1 = cam(14, 12, 6, 120, 90), C2 = cam(46, 14, 6, 120, 98), C3 = cam(46, 14, 6, 204, 98);
    function mach(L, x, y, S, k) { if (S.m > k) L.prop('machine', x, y, 0, { door: 0, lamp: 'green', spin: S.t * 2, run: 0.5, t: S.t, work: P.alT }); }
    make({ sid: '1.0', key: 'a10', title: 'A letter from our owners', std: 'Welcome & Company', blurb: 'The owners write to the team: a small shop that grew because of its people.',
      X: 62, Y: 36, H: 28, backdrop: ['bands', '#14171a', '#1b2025'],
      floor: { style: 'grid', a: '#2a2d31', b: '#2f3338' }, wall: { style: 'studs', tint: '#c9952b' },
      deco: function (s) { s.isoPanel('y', 0, 5, 12, 10, 9, { fill: '#5b7690', border: P.st3 }); s.isoPanel('y', 0, 10, 12, 1, 9, P.st3); s.isoPanel('x', 0, 22, 12, 10, 9, { fill: '#a9c6dd', border: P.st3 }); s.isoPanel('x', 0, 27, 12, 1, 9, P.st3); },
      items: function (L, g, fx, S) {
        L.prop('desk', 2, 10, 0, { w: 22, d: 10 });
        L.prop('docs', 9, 13, 9, { n: S.letterN, head: P.red, w: 8, d: 5 });
        if (S.owners) { L.person(9, 6, 1, ext(CRM, { arm: S.write ? 'write' : 'down' })); L.person(18, 6, 1, ext(MGR, { shirt: '#9a6a3a', hair: '#2a2018' })); }
        mach(L, 26, 1, S, 0); mach(L, 44, 1, S, 1);
        L.prop('haPlant', 2, 30, 0, {});
        if (S.op1) L.person(S.op1.x, S.op1.y, S.op1.dir, fx.who(S.op1, ext(S.lead ? ext(OPA, { vest: true, hat: P.amber }) : OPB, { arm: S.op1.moving ? 'down' : 'out' })));
        if (S.m > 1) { L.person(46, 17, 3, ext(OPA, { who: 'forrest', h: 26, arm: 'out' })); L.person(54, 17, 3, ext(OPC, { arm: 'out' })); }
                if (S.pops) S.pops.forEach(function (q) { L.add([q[0], q[1], 0, q[0] + 1, q[1] + 1, 1], function () { ring(g, q[3], q[4], 14, q[2], P.redT, 14); }); });
      },
      steps: [
        { title: 'Where we started', sub: 'A small machine shop, 1979', dur: 7, cam: C1, key: ['desk'], cap: ['The owners write to the team', 'One machine, a few people'],
          S: function (t, fx) { return { t: t, m: 1, owners: true, letterN: 1 + (t > 3.4 ? 1 : 0) + (t > 5.4 ? 1 : 0), write: t < 5.6, op1: fx.walk([[6, 36], [18, 28], [32, 19]], t, 0.3, 3.0, { endDir: 3 }) }; } },
        { title: 'The people grow', sub: 'Operators become leaders', dur: 7.5, cam: C2, key: ['machine'], cap: ['More people join the shop', 'Fathers and sons side by side'],
          S: function (t, fx) { return { t: t, m: 1 + (t > 0.8 ? 1 : 0), letterN: 3, write: false, op1: { x: 32, y: 19, dir: 3 }, lead: t > 4.4,
            pops: [[0, 0, t - 0.8, 53, 6], [0, 0, t - 4.4, 32, 16]].filter(function (q) { return q[2] > 0 && q[2] < 1.2; }) }; } },
        { title: 'The people are the story', sub: 'We love seeing our people grow', dur: 6.5, cam: C3, big: { n: '1979', label: 'the early days', pos: 'left' },
          S: function (t, fx) { return { t: t, m: 2, letterN: 3, write: false, op1: { x: 32, y: 19, dir: 3 }, lead: true }; } }
      ] });
  })();
  /* 1.1 A Welcome Policy: the front lobby, a handbook across the counter */
  (function () {
    var C1 = cam(14, 4, 0, 120, 90), C2 = cam(14, 4, 0, 160, 90), C3 = cam(20, 2, 0, 212, 96);
    make({ sid: '1.1', key: 'a11', title: 'A welcome policy', std: 'Welcome & Company', blurb: 'A new team member arrives, gets the handbook, reads it and signs.',
      X: 40, Y: 28, H: 26, backdrop: ['stripes', '#171a1d', '#1d2226'],
      floor: { style: 'checker', a: '#34383c', b: '#3b4046', tile: 6, zones: [[28, 14, 10, 10, '#a51f1f', 0.5]] }, wall: { style: 'panel', tint: '#3d6fa5' },
      deco: function (s) { s.isoPanel('x', 0, 8, 10, 12, 9, { fill: '#a9c6dd', border: P.st3 }); s.isoPanel('x', 0, 13, 10, 1, 9, P.st3); s.isoPanel('y', 0, 14, 12, 8, 6, { fill: P.cream, border: P.st3 }); s.isoPanel('y', 0, 16, 14, 4, 2, P.red); },
      items: function (L, g, fx, S) {
        /* footprints: counter 8..32 x 6..13 (HR behind it at 14,4), bench 2..7 x 8..16, plants at 35,5 and 2,22, new hire walks in to 24,17 */
        L.prop('counter', 8, 6, 0, { w: 24, d: 7, body: 'blue' });
        if (S.docsOnDesk) L.prop('docs', 12, 8, 11, { n: S.docsOnDesk, head: P.red, w: 6, d: 4 });
        L.prop('docs', 22, 8, 11, { n: 1, head: S.sign > 0.95 ? P.green : P.amber, w: 6, d: 4 });
        L.person(14, 4, 1, ext(HRP, { arm: S.hrArm }));
        L.prop('haPlant', 35, 5, 0, {}); L.prop('haPlant', 2, 22, 0, {});
        L.prop('haBench', 2, 8, 0, { w: 8, face: 'x' });
        L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { arm: S.meArm || 'down', hold: S.hold ? P.cream : undefined, holdSize: [5, 4] })));
        if (S.stamp) L.add([20, 6, 11, 31, 14, 12], function () { glowAt(g, 25, 10, 12, 10, '#6ad79f', 0.6 * fx.pulse(S.t, 1)); });
      },
      steps: [
        { title: 'A new face', sub: 'You have just joined us', dur: 7, cam: C1, key: ['counter'], cap: ['A new team member walks in', 'HR says welcome'],
          S: function (t, fx) { return { t: t, docsOnDesk: 3, hrArm: t > 3.2 && t < 5.4 ? 'up' : 'down', me: fx.walk([[36, 12], [31, 16], [24, 17]], t, 0.3, 3.0, { endDir: 3 }) }; } },
        { title: 'The handbook', sub: 'Read it carefully', dur: 7.5, cam: C2, key: ['counter'], cap: ['HR hands over the handbook', 'It sets out the basic rules'],
          S: function (t, fx) { var h = t > 2.6; return { t: t, docsOnDesk: h ? 0 : 3, hold: h, hrArm: t > 1.2 && t < 2.8 ? 'out' : 'down', me: { x: 24, y: 17, dir: 3 }, meArm: h ? 'out' : 'down' }; } },
        { title: 'Sign it, then ask', sub: 'Sign the acknowledgment', dur: 6.5, cam: C3, big: { n: 'HR', label: 'for any questions', pos: 'left' },
          S: function (t, fx) { return { t: t, docsOnDesk: 0, sign: fx.E(t, 0.6, 3.6), me: { x: 24, y: 17, dir: 3 }, meArm: 'write', stamp: t > 3.8 }; } }
      ] });
  })();
  /* 1.2 At-Will Employment: one door, either side can leave */
  (function () {
    var C1 = cam(18, 7, 0, 120, 88), C2 = cam(18, 7, 0, 150, 88), C3 = cam(24, 2, 0, 214, 94);
    make({ sid: '1.2', key: 'a12', title: 'At-will employment', std: 'Welcome & Company', blurb: 'Either side may end the work relationship at any time.',
      X: 46, Y: 28, H: 28, backdrop: ['diag', '#13171c', '#1a2027'],
      floor: { style: 'epoxy', a: '#24292e', b: '#2b3137', zones: [[17, 2, 10, 14, '#2f3a46', 1]] }, wall: { style: 'tile', tint: '#3d6fa5' },
      deco: function (s) { s.isoPanel('x', 0, 4, 10, 8, 8, { fill: '#5b7690', border: P.st3 }); s.isoPanel('x', 0, 18, 10, 8, 8, { fill: '#5b7690', border: P.st3 }); },
      items: function (L, g, fx, S) {
        /* footprints: door 17..27 x 0..2, bench 4..14 x 18..23, desk 38..46 x 4..16 (the manager stands in front of it at 38,14), employee left at 11,14 */
        L.prop('haDoor', 17, 0, 0, { w: 10, h: 22, open: S.open, col: ISO.M.wood.right });
        L.prop('desk', 34, 2, 0, { w: 8, d: 10, face: 'x' });
        L.prop('haBench', 4, 20, 0, { w: 10 });
        L.prop('haPlant', 42, 22, 0, {});
        L.person(S.mgr.x, S.mgr.y, S.mgr.dir, fx.who(S.mgr, ext(MGR, { arm: S.mgrArm || 'down' })));
        if (S.me) L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { hold: S.box ? ISO.M.card.left : undefined, holdSize: [5, 4] })));
        S.flows.forEach(function (f) { L.flow(f, S.t, { color: P.redT, len: 3, gap: 3, speed: 8, z: 0 }); });
        if (S.out) L.add([17, 0, 22, 27, 2, 23], function () { glowAt(g, 22, 3, 12, 14, '#f0e0a0', 0.5); });
      },
      steps: [
        { title: 'Both sides, one door', sub: 'You and ADVANCED', dur: 7, cam: C1, key: ['haDoor'], cap: ['You are on one side', 'ADVANCED is on the other'],
          S: function (t, fx) { return { t: t, open: 0, flows: [], me: { x: 11, y: 14, dir: 0 }, mgr: { x: 38, y: 14, dir: 1 } }; } },
        { title: 'Either side can leave', sub: 'Any time, with or without notice', dur: 8.5, cam: C2, key: ['haDoor'], cap: ['You may leave at any time', 'The company may end it at any time'],
          S: function (t, fx) {
            var a = t < 4.2, open = a ? fx.E(t, 1.8, 2.6) * (1 - fx.E(t, 3.6, 4.2)) : fx.E(t, 5.8, 6.6) * (1 - fx.E(t, 7.8, 8.4));
            var me = a ? (t < 3.2 ? fx.walk([[11, 14], [18, 12], [22, 4]], t, 0.6, 3.0, { endDir: 3 }) : null) : (t < 7.6 ? fx.walk([[11, 14], [18, 12], [22, 4]], t, 5.2, 7.4, { endDir: 3 }) : null);
            return { t: t, open: open, flows: [], me: me, box: !a, out: open > 0.5, mgr: { x: 38, y: 14, dir: 1 }, mgrArm: !a && t > 4.6 && t < 7.4 ? 'out' : 'down' }; } },
        { title: 'At-will', sub: 'That is how it works here', dur: 6.5, cam: C3, big: { n: 'AT WILL', label: 'either side, any time', pos: 'left', size: 's' },
          S: function (t, fx) { return { t: t, open: 0.4, flows: [[[11, 14], [16, 9], [21, 4]], [[37, 13], [30, 9], [25, 4]]], me: { x: 11, y: 14, dir: 0 }, mgr: { x: 38, y: 14, dir: 1 } }; } }
      ] });
  })();
  /* 2.1 About the Company: the values wall in the shop, one letter lights up one value */
  (function () {
    var VALS = ['Accountability', 'Dedication', 'Versatility', 'Advancement', 'Nurture', 'Craftsmanship', 'Excellence', 'Drive'];
    var COLS = [P.red, P.amber, P.green, P.blueT, '#d9a0c4', '#e0c060', P.redT, '#6ad79f'];
    var C1 = cam(22, 4, 14, 120, 80), C2 = cam(23, 0, 14, 150, 72), C3 = cam(28, 4, 12, 196, 80);
    function noteSeq() { return VALS.map(function (v, i) { return { a: 0.7 + i * 0.78, b: 1.45 + i * 0.78, x: 192, y: 60, text: v }; }); }
    make({ sid: '2.1', key: 'a21', title: 'About the company', std: 'Welcome & Company', blurb: 'The ADVANCED name is an acronym: each letter is one of our core values.',
      X: 44, Y: 28, H: 26, backdrop: ['stripes', '#12181a', '#182024'],
      floor: { style: 'checker', a: '#232a26', b: '#29312c', tile: 6 }, wall: { style: 'panel', tint: '#3fbf7f' },
      items: function (L, g, fx, S) {
        /* footprints: eight plaques on the back wall 4..44, table 22..40 x 5..13, machine 2..16 x 2..20, people at 24,15 / 34,15 / 14,24 / 24,23 */
        for (var i = 0; i < 8; i++) L.prop('haPlaque', 4 + i * 5, 0, 10, { w: 4, h: 10, lit: S.lit > i, col: COLS[i] });
        L.prop('table', 22, 5, 0, { w: 18, d: 8, h: 9, plate: P.st2 });
        L.prop('caliper', 27, 7, 9, { open: 0.5 });
        L.prop('machine', 2, 2, 0, { face: 'x', door: 0, lamp: 'green', spin: S.t * 2, run: 0.4, t: S.t });
        if (!S.noPpl) {
          L.person(24, 15, 1, ext(ME, { arm: S.arm }));
          L.person(14, 24, 0, ext(MGR, { arm: S.lit > 4 ? 'out' : 'down' }));
          L.person(24, 23, 2, ext(OPB, {}));
          L.person(34, 15, 1, ext(OPA, { arm: 'down' }));
        }
        if (S.lit > 0) L.add([4 + (S.lit - 1) * 5, 0, 20, 9 + (S.lit - 1) * 5, 1, 21], function () { glowAt(g, 6 + (S.lit - 1) * 5, 0, 14, 8, COLS[S.lit - 1], 0.4); });
      },
      steps: [
        { title: 'One name', sub: 'The name is the values', dur: 6.5, cam: C1, key: ['table'], cap: ['Our name is an acronym', 'Every letter is a value'],
          S: function (t, fx) { return { t: t, lit: 0, arm: 'down' }; } },
        { title: 'One letter, one value', sub: 'Each letter lights a value', dur: 8, cam: C2, key: [], notes: noteSeq(),
          S: function (t, fx) { return { t: t, lit: clampN(Math.floor((t - 0.7) / 0.78) + 1, 0, 8), arm: Math.floor(t * 2) % 2 ? 'out' : 'down' }; } },
        { title: 'Values we work by', sub: 'Built into every day', dur: 6.5, cam: C3, big: { n: 'VALUES', label: 'spelled by our name', pos: 'left' },
          S: function (t, fx) { return { t: t, lit: 8, arm: 'down', noPpl: true }; } }
      ] });
  })();
  /* 2.2 Ethics Code: the meeting room, the podium and the locked cabinet */
  (function () {
    var C1 = cam(20, 4, 0, 120, 88), C2 = cam(12, 12, 0, 120, 88), C3 = cam(34, 4, 0, 196, 90);
    make({ sid: '2.2', key: 'a22', title: 'Ethics code', std: 'Welcome & Company', blurb: 'We do business honestly, speak for ADVANCED only when authorized, and keep secrets on a need-to-know basis.',
      X: 46, Y: 30, H: 26, backdrop: ['bands', '#1a1814', '#221f19'],
      floor: { style: 'epoxy', a: '#2c2a26', b: '#33302b' }, wall: { style: 'panel', tint: '#a8781f' },
      deco: function (s) { s.isoPanel('x', 0, 8, 8, 14, 10, { fill: '#a9c6dd', border: P.st3 }); s.isoPanel('x', 0, 14, 8, 1, 10, P.st3); },
      items: function (L, g, fx, S) {
        /* footprints: table 14..28 x 4..14, cabinet 36..44 x 4..12 with the lamp at 38,14, podium 4..12 x 18..24; customer 9,10, employee 33,10 */
        L.prop('table', 14, 4, 0, { w: 14, d: 10, h: 9, top: 'wood' });
        L.prop('docs', 18, 7, 9, { n: 2, head: P.blue, w: 6, d: 4 });
        if (S.cus) L.person(10, 13, 0, ext(CRM, { shirt: '#4a5a3a', arm: S.cusArm || 'down' }));
        if (S.me) L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { arm: S.meArm || 'down' })));
        if (S.mgr) L.person(S.mgr.x, S.mgr.y, S.mgr.dir, fx.who(S.mgr, ext(MGR, { arm: S.mgrArm || 'down' })));
        L.prop('haPodium', 4, 18, 0, { lit: S.podium });
        L.prop('cabinet', 36, 4, 0, {});
        L.prop('lamp', 38, 14, 0, { col: S.locked ? 'red' : 'green', on: true });
        if (S.badge) L.prop('badge', S.badge.x, S.badge.y, 8, { col: P.green });
        if (S.check) L.add([20, 8, 9, 22, 10, 10], function () { ring(g, 21, 9, 14, S.t * 0.8, '#6ad79f', 12); });
      },
      steps: [
        { title: 'Honest every day', sub: 'Honesty, fairness, respect', dur: 7, cam: C1, key: ['table'], cap: ['We do business honestly', 'Fairness and respect, always'],
          S: function (t, fx) { return { t: t, cus: true, check: t > 3.2, podium: false, me: { x: 33, y: 10, dir: 1 }, cusArm: t > 2 ? 'out' : 'down', meArm: t > 2 ? 'out' : 'down' }; } },
        { title: 'Speak only if cleared', sub: 'Unless you are authorized', dur: 7.5, cam: C2, key: ['haPodium'], cap: ['Do not speak for ADVANCED on your own', 'Only if you are specifically authorized'],
          S: function (t, fx) {
            var gotBadge = t > 3.6;
            return { t: t, podium: gotBadge && t > 4.6, mgr: { x: 22, y: 24, dir: 1 }, mgrArm: t > 2.2 && t < 3.6 ? 'out' : 'down',
              me: { x: 12, y: 26, dir: 0 }, meArm: gotBadge ? 'out' : 'down', badge: t > 2.4 && t < 3.6 ? { x: 16, y: 25 } : null }; } },
        { title: 'Secrets stay put', sub: 'Share only who needs to know', dur: 6.5, cam: C3, big: { n: 'SECRETS', label: 'need-to-know basis only', pos: 'left' },
          S: function (t, fx) { return { t: t, podium: false, locked: true, me: { x: 42, y: 15, dir: 3 }, meArm: 'out' }; } }
      ] });
  })();
  /* 2.3 Revisions to Handbook: the hallway bulletin board */
  (function () {
    var C1 = cam(21, 7, 0, 120, 88), C2 = cam(28, 3, 0, 150, 88), C3 = cam(28, 3, 0, 198, 88);
    make({ sid: '2.3', key: 'a23', title: 'Revisions to the handbook', std: 'Welcome & Company', blurb: 'The handbook can change; changes come as a written supplement or a posting on the bulletin board.',
      X: 44, Y: 24, H: 28, backdrop: ['diag', '#161514', '#1e1c1a'],
      floor: { style: 'grid', a: '#2a2824', b: '#302d28' }, wall: { style: 'studs', tint: '#5f8cbf' },
      deco: function (s) { s.isoPanel('x', 0, 8, 10, 8, 10, { fill: '#a9c6dd', border: P.st3 }); },
      items: function (L, g, fx, S) {
        /* footprints: board on the back wall 22..36, shelf 2..8 x 6..16 (left wall), supplement table 38..44 x 8..13, HR walks along x 30..34, employee at 18,10 */
        L.prop('board', 22, 0, 2, { w: 14, h: 14, rows: 6, show: S.rows, lit: S.lit, chips: [P.red, P.amber, P.amber, P.st2, P.st2, P.st2] });
        L.prop('shelf', 2, 6, 0, { w: 10, d: 6, h: 22, seed: 3, face: 'x' });
        L.prop('table', 38, 8, 0, { w: 6, d: 5, h: 9 });
        if (S.supp) L.prop('docs', 39, 9, 9, { n: 2, head: P.red, w: 4, d: 3 });
        L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { arm: S.meArm || 'down', hold: S.hold ? P.cream : undefined, holdSize: [4, 5] })));
        if (S.hr) L.person(S.hr.x, S.hr.y, S.hr.dir, fx.who(S.hr, ext(HRP, { arm: S.hrArm || 'down', hold: S.hrHold ? P.paper : undefined, holdSize: [4, 5] })));
        L.prop('haPlant', 40, 18, 0, {});
        if (S.flash) L.add([22, 0, 2, 36, 1, 16], function () { glowAt(g, 29, 0, 9, 16, '#f0e0a0', 0.35); });
      },
      steps: [
        { title: 'Kept informed', sub: 'The handbook explains your job terms', dur: 6.5, cam: C1, key: ['board'], cap: ['The handbook keeps you informed', 'It is not a contract'],
          S: function (t, fx) { return { t: t, rows: 5, lit: -1, me: fx.walk([[10, 20], [14, 14], [20, 10]], t, 0.3, 2.4, { endDir: 3 }), meArm: t > 3 ? 'out' : 'down', hold: t > 3 }; } },
        { title: 'Changes get posted', sub: 'ADVANCED may revise, add or delete', dur: 8, cam: C2, key: ['board'], cap: ['A new page goes on the board', 'Or it comes as a written supplement'],
          S: function (t, fx) {
            var hr = fx.walk([[36, 14], [32, 9], [31, 6]], t, 0.2, 1.8, { endDir: 3 });
            return { t: t, rows: t > 3.2 ? 6 : 5, lit: t > 3.2 ? 5 : -1, flash: t > 3.2 && t < 5.2, hr: hr, hrHold: t < 2.6, hrArm: t > 2.4 && t < 3.6 ? 'up' : 'down',
              me: { x: 20, y: 10, dir: 3 }, hold: false, supp: t > 5 }; } },
        { title: 'Check the board', sub: 'Changes reach you in a timely fashion', dur: 6.5, cam: C3, big: { n: 'WRITTEN', label: 'supplement or posting', pos: 'left' },
          S: function (t, fx) { return { t: t, rows: 6, lit: 5, supp: true, hr: { x: 31, y: 6, dir: 1 }, me: { x: 20, y: 10, dir: 3 }, meArm: 'out' }; } }
      ] });
  })();
  /* 3.1 Conflicts of Interest: a supplier at the dock, your manager in the office */
  (function () {
    var C1 = cam(12, 0, 0, 120, 84), C2 = cam(24, 0, 0, 130, 84), C3 = cam(42, 4, 0, 196, 94);
    make({ sid: '3.1', key: 'a31', title: 'Conflicts of interest', std: 'Hiring & Orientation', blurb: 'A possible conflict with a supplier or competitor must be disclosed to your manager.',
      X: 56, Y: 26, H: 26, backdrop: ['stripes', '#14161a', '#1b1e23'],
      floor: { style: 'checker', a: '#2f3236', b: '#35393d', tile: 8, zones: [[0, 14, 24, 10, '#3a3f45', 1]] }, wall: { style: 'panel', tint: '#c9952b' },
      items: function (L, g, fx, S) {
        /* footprints: dock door 2..18 x 0..2, pallet 4..16 x 3..13 with a crate, supplier at 8,14, you at 20,14 then walking right, manager desk 40..52 x 1..7, manager at 44,10, chair 46..51 x 13..18 */
        L.prop('rolldoor', 2, 0, 0, { w: 16, h: 22, open: 0.8 });
        L.prop('pallet', 4, 3, 0, {}); L.prop('crate', 5, 4, 3, { tag: P.red, w: 8, d: 6, h: 6 });
        L.prop('desk', 40, 1, 0, { w: 12, d: 6 });
        L.prop('monitor', 45, 2, 9, { rows: 3 });
        L.prop('haChair', 47, 14, 0, { col: 'dark' });
        L.person(38, 8, 1, ext(MGR, { arm: S.mgrArm || 'down' }));
        if (!S.noSup) L.person(8, 15, 0, ext(OPC, { vest: true, arm: S.supArm || 'down' }));
        L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { arm: S.meArm || 'down' })));
        if (S.link) L.flow(S.link, S.t, { color: P.amber, len: 3, gap: 3, speed: 9, z: 0 });
        L.prop('haPlant', 52, 20, 0, {});
        if (S.warn) L.add([10, 12, 0, 12, 14, 20], function () { ring(g, 14, 15, 6, S.t * 0.9, P.amber, 12); });
        if (S.ok) L.add([38, 8, 0, 40, 10, 20], function () { ring(g, S.ok[0], S.ok[1], 8, S.t * 0.8, '#6ad79f', 12); });
      },
      steps: [
        { title: 'A possible conflict', sub: 'You and a supplier or competitor', dur: 7, cam: C1, key: ['pallet'], cap: ['You have a tie to a supplier', 'It could affect the job'],
          S: function (t, fx) { return { t: t, me: { x: 20, y: 15, dir: 2 }, link: [[11, 16], [19, 16]], warn: true, meArm: t > 1.5 ? 'out' : 'down', supArm: t > 1.5 ? 'out' : 'down' }; } },
        { title: 'Tell your manager', sub: 'You must disclose it', dur: 8, cam: C2, key: ['desk'], cap: ['Walk to your manager', 'Disclose the conflict'],
          S: function (t, fx) { var w = fx.walk([[20, 15], [26, 19], [33, 17]], t, 0.6, 3.6, { endDir: 0 }); return { t: t, me: w, meArm: t > 3.8 ? 'out' : 'down', mgrArm: t > 4.8 ? 'out' : 'down', ok: t > 5.4 ? [40, 12] : null }; } },
        { title: 'Your manager decides', sub: 'ADVANCED takes the steps it needs', dur: 6.5, cam: C3, big: { n: 'MANAGER', label: 'is who you tell', pos: 'bottom-left' },
          S: function (t, fx) { return { t: t, noSup: true, me: { x: 33, y: 17, dir: 0 }, meArm: 'out', mgrArm: 'out', ok: [40, 12] }; } }
      ] });
  })();
  /* 3.2 Employment Authorization Verification: the HR desk, a scanner and the calendar */
  (function () {
    var C1 = cam(24, 10, 0, 120, 98), C2 = cam(24, 10, 0, 150, 100), C3 = cam(26, 10, 0, 204, 100);
    make({ sid: '3.2', key: 'a32', title: 'Employment authorization', std: 'Hiring & Orientation', blurb: 'New hires complete Section 1 of Form I-9 on day one and show their documents by the third business day.',
      X: 44, Y: 28, H: 26, backdrop: ['diag', '#12171b', '#192027'],
      floor: { style: 'grid', a: '#222a30', b: '#283139' }, wall: { style: 'tile', tint: '#6ad79f' },
      deco: function (s) { s.isoPanel('x', 0, 14, 8, 8, 8, { fill: '#5b7690', border: P.st3 }); },
      items: function (L, g, fx, S) {
        /* footprints: desk 12..38 x 8..18; HR stands behind at y 5; the new hire in front at y 20 */
        L.prop('desk', 12, 8, 0, { w: 26, d: 10 });
        L.prop('docs', 14, 11, 9, { n: S.docs, head: P.amber, w: 7, d: 5 });
        L.prop('monitor', 23, 9, 9, { rows: 3 });
        L.prop('scanner', 33, 11, 9, { lit: S.scan });
        L.prop('haCal', 30, 0, 8, { w: 14, h: 12, mark: S.day, cols: 5, rows: 2 });
        L.person(22, 5, 1, ext(HRP, { arm: S.hrArm || 'down' }));
        L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { arm: S.meArm || 'down', hold: S.hold ? P.paper : undefined, holdSize: [5, 4] })));
        L.prop('haChair', 3, 16, 0, { col: 'dark' }); L.prop('haPlant', 40, 22, 0, {});
        if (S.scan) L.add([33, 11, 9, 37, 14, 16], function () { ring(g, 35, 12, 16, S.t * 0.9, '#6ad79f', 10); });
      },
      steps: [
        { title: 'Day one paperwork', sub: 'Section 1 of federal Form I-9', dur: 7, cam: C1, key: ['desk'], cap: ['Complete Section 1 on day one', 'The first day of paid employment'],
          S: function (t, fx) { return { t: t, day: 1, docs: 1, me: fx.walk([[8, 28], [16, 24], [24, 20]], t, 0.3, 2.6, { endDir: 3 }), meArm: t > 3 ? 'write' : 'down', hrArm: t > 4.6 ? 'out' : 'down' }; } },
        { title: 'Show your documents', sub: 'They prove identity and work authorization', dur: 8, cam: C2, key: ['scanner'], cap: ['Bring acceptable documents', 'No later than the third business day'],
          S: function (t, fx) { var d = 1 + (t > 1.6 ? 1 : 0) + (t > 3.2 ? 1 : 0); return { t: t, day: d, docs: 3, me: { x: 24, y: 20, dir: 3 }, hold: t < 4.4 && t > 3.4, meArm: t > 3.4 && t < 4.6 ? 'out' : 'down', hrArm: t > 4.4 && t < 6 ? 'out' : 'down', scan: t > 4.8 }; } },
        { title: 'Third business day', sub: 'No later than that', dur: 6.5, cam: C3, big: { n: 'THIRD', label: 'business day deadline', pos: 'left' },
          S: function (t, fx) { return { t: t, day: 3, docs: 3, me: { x: 24, y: 20, dir: 3 }, scan: true, hrArm: 'down' }; } }
      ] });
  })();
  /* 3.3 Employment of Relatives and Friends: a work cell, two people who know each other, a supervisor's desk */
  (function () {
    var C1 = cam(18, 4, 0, 120, 90), C2 = cam(36, 4, 0, 140, 90), C3 = cam(36, 5, 0, 188, 90);
    make({ sid: '3.3', key: 'a33', title: 'Relatives and friends', std: 'Hiring & Orientation', blurb: 'Tell ADVANCED when a relative or friend could create a conflict.',
      X: 46, Y: 30, H: 26, backdrop: ['bands', '#16181b', '#1e2126'],
      floor: { style: 'epoxy', a: '#2d2a2a', b: '#353131', zones: [[8, 12, 20, 14, '#3a2f2f', 1]] }, wall: { style: 'studs', tint: '#d9a0a0' },
      deco: function (s) { s.isoPanel('y', 0, 30, 10, 8, 8, { fill: '#5b7690', border: P.st3 }); },
      items: function (L, g, fx, S) {
        /* footprints: table 10..26 x 14..22; person A stands left of it (7,15), person B right of it (29,13); supervisor desk 34..46 x 4..12, supervisor behind it */
        L.prop('table', 10, 14, 0, { w: 16, d: 8, h: 9, plate: P.st2 });
        L.prop('caliper', 16, 16, 9, { open: 0.4 });
        L.prop('desk', 34, 4, 0, { w: 8, d: 12, face: 'x' });
        L.prop('monitor', 35, 8, 9, { rows: 2 });
        L.person(S.a.x, S.a.y, S.a.dir, fx.who(S.a, ext(ME, { arm: S.aArm || 'down' })));
        if (S.b) L.person(S.b.x, S.b.y, S.b.dir, fx.who(S.b, ext(OPC, { arm: S.bArm || 'down', hair: '#2b2018' })));
        L.person(S.s.x, S.s.y, S.s.dir, fx.who(S.s, ext(MGR, { arm: S.sArm || 'down' })));
        if (S.link) L.flow(S.link, S.t, { color: '#f0a0a0', len: 2, gap: 3, speed: 8, z: 0 });
        if (S.warn) L.add([27, 12, 0, 29, 14, 20], function () { ring(g, 18, 11, 6, S.t * 0.9, P.amber, 10); });
        L.prop('haPlant', 2, 24, 0, {});
      },
      steps: [
        { title: 'People who know each other', sub: 'Relatives and friends at work', dur: 7, cam: C1, key: ['table'], cap: ['A relative or a friend at work', 'They work in the same area'],
          S: function (t, fx) { return { t: t, a: { x: 29, y: 13, dir: 1 }, b: { x: 7, y: 15, dir: 0 }, s: { x: 40, y: 2, dir: 1 }, link: [[8, 12], [18, 11], [28, 12]], aArm: t > 1.6 ? 'out' : 'down', bArm: t > 1.6 ? 'out' : 'down' }; } },
        { title: 'It could be a conflict', sub: 'Supervision, safety, security, morale', dur: 8, cam: C2, key: ['desk'], cap: ['A conflict could come up', 'You tell ADVANCED about it'],
          S: function (t, fx) { var w = fx.walk([[29, 13], [30, 9], [32, 8]], t, 1.2, 3.4, { endDir: 0 }); return { t: t, warn: t < 3, a: t < 1.2 ? { x: 29, y: 13, dir: 1 } : w, b: null, s: { x: 40, y: 2, dir: 1 }, aArm: t > 3.6 ? 'out' : 'down', sArm: t > 4.8 ? 'out' : 'down' }; } },
        { title: 'Inform ADVANCED', sub: 'It is your obligation', dur: 6.5, cam: C3, big: { n: 'INFORM', label: 'about a possible conflict', pos: 'left' },
          S: function (t, fx) { return { t: t, a: { x: 32, y: 8, dir: 0 }, b: null, s: { x: 40, y: 2, dir: 1 }, aArm: 'out', sArm: 'out' }; } }
      ] });
  })();
  /* 3.4 Federal Accommodations for Pregnant Employees: the car park and the entrance */
  (function () {
    var C1 = cam(18, 12, 0, 120, 90), C2 = cam(18, 12, 0, 96, 90), C3 = cam(30, 4, 0, 196, 88);
    make({ sid: '3.4', key: 'a34', title: 'Pregnancy accommodations', std: 'Hiring & Orientation', blurb: 'ADVANCED provides reasonable accommodation for known limits related to pregnancy, childbirth or related conditions.',
      X: 48, Y: 34, H: 22, backdrop: ['stripes', '#101417', '#171c20'],
      floor: { style: 'checker', a: '#2a2d30', b: '#2e3235', tile: 8, zones: [[24, 6, 10, 14, '#3a4a40', 1], [3, 16, 11, 1, P.st3, 1], [3, 24, 11, 1, P.st3, 1], [3, 32, 11, 1, P.st3, 1]] }, wall: { style: 'panel', tint: '#6ad79f' },
      items: function (L, g, fx, S) {
        /* footprints: far car space 3..17 x 22..29, closer space 24..34 x 6..20, door 38..48 x 0..2, rack 40..48 x 4..12, bench 36..42 x 26..31 */
        L.prop('haDoor', 38, 0, 0, { w: 10, h: 18, open: S.door || 0, col: ISO.M.blue.left });
        L.prop('haCar', S.car.x, S.car.y, 0, { col: S.car.col || 'red' });
        if (S.seat) L.prop('haBench', 36, 26, 0, { w: 6 });
        if (S.vest) { L.prop('cabinet', 40, 4, 0, {}); L.prop('wallclock', 26, 0, 9, { hour: 9, min: 30 }); }
        L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { shirt: '#d98a9a', arm: S.meArm || 'down' })));
        if (S.mgr) L.person(S.mgr.x, S.mgr.y, S.mgr.dir, fx.who(S.mgr, ext(MGR, { arm: S.mgrArm || 'down' })));
        if (S.pop) L.add([S.pop[0], S.pop[1], 0, S.pop[0] + 1, S.pop[1] + 1, 1], function () { ring(g, S.pop[0], S.pop[1], S.pop[2] || 6, S.t * 0.9, '#6ad79f', 10); });
      },
      steps: [
        { title: 'Who this is for', sub: 'Pregnancy, childbirth, related conditions', dur: 7, cam: C1, key: ['haCar'], cap: ['A long walk from the far space', 'Limits can come with pregnancy'],
          S: function (t, fx) { return { t: t, car: { x: 3, y: 22, col: 'blue' }, me: fx.walk([[18, 26], [24, 22], [32, 16]], t, 0.6, 5.6, { endDir: 0 }), mgr: { x: 42, y: 16, dir: 1 }, door: 0 }; } },
        { title: 'Reasonable accommodation', sub: 'Seating, parking, hours, safety apparel', dur: 8.5, cam: C2, key: ['haCar'], cap: ['A closer space and a seat', 'Flexible hours and safety apparel'],
          S: function (t, fx) { var k = fx.E(t, 0.6, 2.4); return { t: t, car: { x: Math.round(3 + 23 * k), y: Math.round(22 - 14 * k), col: 'blue' }, seat: t > 3.4, vest: t > 5.2, pop: t > 2.4 && t < 3.6 ? [29, 13, 10] : (t > 3.4 && t < 4.6 ? [39, 28, 6] : (t > 5.2 && t < 6.4 ? [44, 8, 8] : null)), me: { x: 34, y: 22, dir: 0 }, mgr: { x: 42, y: 16, dir: 1 }, door: 0 }; } },
        { title: 'Tell your manager', sub: 'Ask for what you need', dur: 6.5, cam: C3, big: { n: 'PWFA', label: 'the federal act', pos: 'left' },
          S: function (t, fx) { return { t: t, car: { x: 26, y: 8, col: 'blue' }, seat: true, vest: true, me: { x: 33, y: 18, dir: 0 }, mgr: { x: 44, y: 18, dir: 2 }, meArm: 'out', mgrArm: 'out', door: 0.4 }; } }
      ] });
  })();
  /* 3.5 Job Descriptions: three jobs on the shop floor, each with its own sheet */
  (function () {
    var C1 = cam(20, 10, 0, 120, 90), C2 = cam(20, 10, 0, 150, 90), C3 = cam(30, 2, 0, 196, 88);
    make({ sid: '3.5', key: 'a35', title: 'Job descriptions', std: 'Hiring & Orientation', blurb: 'ADVANCED keeps a job description for each position. It is an outline only: ask your manager about your duties.',
      X: 52, Y: 30, H: 26, backdrop: ['diag', '#16150f', '#1f1d14'],
      floor: { style: 'checker', a: '#2b2f33', b: '#31363b', tile: 6 }, wall: { style: 'panel', tint: '#c9952b' },
      items: function (L, g, fx, S) {
        /* footprints: machine 4..22 x 1..15, bench 28..44 x 3..11, sheet tables 22..28 x 14..19 and 44..50 x 14..19; workers at 12,18 and 36,15; manager walks along y 24 */
        L.prop('machine', 4, 1, 0, { door: 0, lamp: 'green', spin: S.t * 2, run: 0.4, t: S.t });
        L.prop('table', 28, 3, 0, { w: 16, d: 8, h: 9, plate: P.st2 });
        L.prop('caliper', 33, 5, 9, { open: 0.6 });
        L.prop('table', 2, 17, 0, { w: 6, d: 5, h: 9 });
        L.prop('table', 40, 16, 0, { w: 6, d: 5, h: 9 });
        if (S.s1) L.prop('docs', 3, 18, 9, { n: 1, head: P.green, w: 4, d: 3 });
        if (S.s2) L.prop('docs', 41, 17, 9, { n: 1, head: P.amber, w: 4, d: 3 });
        L.person(12, 18, 3, ext(OPA, { arm: S.w1Arm || 'out' }));
        if (!S.noW2) L.person(36, 14, 1, ext(OPB, { arm: S.w2Arm || 'write', tool: P.st4 }));
        if (S.crate) L.prop('crate', S.crate.x, S.crate.y, 0, { w: 6, d: 5, h: 5, tag: P.red });
        if (S.mgr) L.person(S.mgr.x, S.mgr.y, S.mgr.dir, fx.who(S.mgr, ext(MGR, { arm: S.mgrArm || 'down', hold: S.mgrHold ? ISO.M.card.left : undefined, holdSize: [5, 5] })));
        if (S.pop) L.add([S.pop[0], S.pop[1], 0, S.pop[0] + 1, S.pop[1] + 1, 1], function () { ring(g, S.pop[0], S.pop[1], S.pop[2], S.t * 0.9, S.pop[3] || '#6ad79f', 10); });
      },
      steps: [
        { title: 'A job for each role', sub: 'Operator, machinist, deburr technician', dur: 7, cam: C1, key: ['machine'], cap: ['Every position has a description', 'It lists the role and the duties'],
          S: function (t, fx) { return { t: t, s1: t > 1.2, s2: t > 2.6, pop: t > 1.2 && t < 2.4 ? [5, 19, 9] : (t > 2.6 && t < 3.8 ? [43, 18, 9] : null) }; } },
        { title: 'It is an outline', sub: 'Duties can change with business needs', dur: 8, cam: C2, key: ['machine'], cap: ['You may be asked to do more', 'Duties not in your written description'],
          S: function (t, fx) { var m = fx.walk([[40, 24], [30, 20], [20, 17]], t, 0.4, 3.0, { endDir: 2 }); return { t: t, s1: true, s2: true, noW2: true, mgr: m, mgrHold: t < 4.6, mgrArm: t > 3.4 && t < 4.8 ? 'out' : 'down', crate: t > 4.6 ? { x: 15, y: 21 } : null, w1Arm: t > 3.4 && t < 4.8 ? 'out' : 'out' }; } },
        { title: 'Ask your manager', sub: 'Questions about your duties', dur: 6.5, cam: C3, big: { n: 'OUTLINE', label: 'only, not every duty', pos: 'left' },
          S: function (t, fx) { return { t: t, s1: true, s2: true, mgr: { x: 49, y: 18, dir: 2 }, mgrArm: 'out', w2Arm: 'out' }; } }
      ] });
  })();
  /* 3.6 New Hires and Introductory Periods: a path through the shop, one calendar, a manager checking in */
  (function () {
    var C1 = cam(16, 12, 0, 120, 90), C2 = cam(20, 12, 0, 120, 90), C3 = cam(28, 6, 0, 198, 90);
    make({ sid: '3.6', key: 'a36', title: 'Introductory period', std: 'Hiring & Orientation', blurb: 'The first 90 days are an introductory period to learn the job and to see how it goes.',
      X: 50, Y: 32, H: 26, backdrop: ['stripes', '#101514', '#161d1b'],
      floor: { style: 'grid', a: '#222a28', b: '#283230', zones: [[4, 20, 8, 8, '#2f4a3c', 1], [18, 20, 8, 8, '#4a4a2f', 1], [32, 20, 8, 8, '#3c3c3c', 1]] }, wall: { style: 'studs', tint: '#6ad79f' },
      items: function (L, g, fx, S) {
        /* footprints: calendar on the wall at x 30..44, work bench 4..20 x 4..12, machine 28..46 x 1..15, mats are flat. new hire starts at 6,24, manager waits at 26,16 */
        L.prop('haCal', 32, 0, 8, { w: 14, h: 14, mark: S.mark, cols: 5, rows: 4 });
        L.prop('table', 4, 4, 0, { w: 16, d: 8, h: 9, plate: P.st2 });
        L.prop('machine', 28, 1, 0, { face: 'y', door: 0, lamp: 'green', spin: S.t * 2, run: S.run ? 0.4 : 0, t: S.t });
        L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { arm: S.meArm || 'down', badge: true })));
        if (S.mgr) L.person(S.mgr.x, S.mgr.y, S.mgr.dir, fx.who(S.mgr, ext(MGR, { arm: S.mgrArm || 'down' })));
        if (S.pop) L.add([S.pop[0], S.pop[1], 0, S.pop[0] + 1, S.pop[1] + 1, 1], function () { ring(g, S.pop[0], S.pop[1], 2, S.t * 0.9, '#6ad79f', 10); });
      },
      steps: [
        { title: 'Your first days', sub: 'You are new here', dur: 7, cam: C1, key: ['haCal'], cap: ['You learn the company and the job', 'The first 90 days'],
          S: function (t, fx) { return { t: t, mark: 1 + Math.floor(t * 1.2), me: fx.walk([[6, 26], [10, 22], [14, 18]], t, 0.4, 3.0, { endDir: 1 }), meArm: t > 3.4 ? 'out' : 'down', mgr: { x: 24, y: 17, dir: 2 } }; } },
        { title: 'Your performance is watched', sub: 'Quality and value of your work', dur: 8, cam: C2, key: ['haCal', 'machine'], cap: ['Your manager sees how it goes', 'Changes can be made to your duties'],
          S: function (t, fx) { var w = fx.walk([[14, 18], [22, 24], [36, 20], [36, 18]], t, 0.8, 3.8, { endDir: 3 }), m = fx.walk([[48, 6], [48, 11], [47, 14]], t, 3.8, 5.2, { endDir: 2 }); return { t: t, mark: 4 + Math.floor(t * 2.2), me: t < 0.8 ? { x: 14, y: 18, dir: 1 } : w, run: t > 3.4, meArm: t > 3.4 ? 'out' : 'down', mgr: t > 3.6 ? m : null, mgrArm: t > 5.4 ? 'out' : 'down', pop: t > 5.4 && t < 6.4 ? [47, 14] : null }; } },
        { title: 'Ninety days', sub: 'Management and Human Resources decide', dur: 6.5, cam: C3, big: { n: '90', label: 'days, introductory period', pos: 'left' },
          S: function (t, fx) { return { t: t, mark: 20, me: { x: 36, y: 18, dir: 3 }, run: true, meArm: 'out', mgr: { x: 44, y: 19, dir: 2 }, mgrArm: 'out' }; } }
      ] });
  })();
  /* 3.7 Training Program: a training bay, a manager shows a new person the exact procedure */
  (function () {
    var C1 = cam(16, 10, 0, 120, 92), C2 = cam(18, 10, 0, 120, 92), C3 = cam(28, 4, 0, 232, 90);
    make({ sid: '3.7', key: 'a37', title: 'Training program', std: 'Hiring & Orientation', blurb: 'Your department manager decides your training. Ask your manager if you need more.',
      X: 44, Y: 30, H: 26, backdrop: ['bands', '#14130f', '#1c1a14'],
      floor: { style: 'epoxy', a: '#26282a', b: '#2d3033' }, wall: { style: 'tile', tint: '#5f8cbf' },
      items: function (L, g, fx, S) {
        /* footprints: training board (wall) 22..40, machine 2..16 x 16..34 facing x, bench 24..40 x 6..14, manager at 22,18, trainee at 30,20 */
        L.prop('board', 22, 0, 6, { w: 20, h: 18, rows: 5, show: S.rows, done: S.done, lit: S.lit });
        L.prop('machine', 2, 14, 0, { face: 'x', door: S.door || 0, lamp: 'green', spin: S.t * 2, run: S.run ? 0.5 : 0, t: S.t, work: P.alT });
        L.prop('table', 26, 8, 0, { w: 14, d: 7, h: 9, plate: P.st2 });
        L.prop('caliper', 30, 10, 9, { open: 0.5 });
        if (!S.noM) L.person(22, 20, 0, ext(MGR, { arm: S.mArm || 'down' }));
        L.person(S.tr.x, S.tr.y, S.tr.dir, fx.who(S.tr, ext(ME, { arm: S.trArm || 'down', hat: P.amber })));
        if (S.q) L.person(38, 20, 2, ext(OPB, { arm: 'out' }));
        if (S.pop) L.add([S.pop[0], S.pop[1], 0, S.pop[0] + 1, S.pop[1] + 1, 1], function () { ring(g, S.pop[0], S.pop[1], 6, S.t * 0.9, S.pop[2] || '#6ad79f', 10); });
      },
      steps: [
        { title: 'Your manager trains you', sub: 'It is decided one person at a time', dur: 7, cam: C1, key: ['board'], cap: ['Your department manager leads it', 'Training fits each person'],
          S: function (t, fx) { return { t: t, rows: 5, lit: Math.floor(t * 0.6) % 5, tr: { x: 30, y: 20, dir: 2 }, mArm: t > 3 ? 'out' : 'down', trArm: t > 3.4 ? 'out' : 'down' }; } },
        { title: 'Learn our way', sub: 'Our own procedures and your position', dur: 8, cam: C2, key: ['machine'], cap: ['Even with experience, learn our procedures', 'Step by step at the machine'],
          S: function (t, fx) { var k = fx.E(t, 0.6, 5.6); return { t: t, rows: 5, done: Math.floor(k * 5), lit: Math.min(4, Math.floor(k * 5)), door: fx.E(t, 3, 3.8), run: t > 4, tr: { x: 30, y: 20, dir: 2 }, mArm: Math.floor(t * 1.5) % 2 ? 'out' : 'down', trArm: 'out' }; } },
        { title: 'Need more training?', sub: 'Say so', dur: 6.5, cam: C3, big: { n: 'CONSULT', label: 'your manager for more', pos: 'left' },
          S: function (t, fx) { return { t: t, rows: 5, done: 5, noM: true, tr: { x: 34, y: 18, dir: 2 }, trArm: 'up', mArm: 'out', pop: [34, 18, P.amber] }; } }
      ] });
  })();
  /* OK-Disability Accommodation: an HR meeting room, a talk across the table, then the workstation is changed */
  (function () {
    var C1 = cam(16, 4, 0, 120, 90), C2 = cam(18, 6, 0, 138, 84), C3 = cam(30, 0, 0, 226, 88);
    make({ sid: 'OK-Disability Accommodation', key: 'a40', title: 'Disability accommodation', std: 'Hiring & Orientation', blurb: 'If you need an accommodation because of a disability, tell your manager. You and the company talk it through.',
      X: 44, Y: 26, H: 26, backdrop: ['diag', '#12161a', '#1a2026'],
      floor: { style: 'grid', a: '#23282c', b: '#292f34' }, wall: { style: 'panel', tint: '#8fb4d9' },
      items: function (L, g, fx, S) {
        /* footprints: table 12..30 x 10..18, HR behind it at 21,6, employee left at 6,14, manager right at 36,14; adjustable desk 28..40 x 20..26 */
        L.prop('table', 12, 10, 0, { w: 18, d: 8, h: 9, top: 'wood' });
        if (S.docs > 0) L.prop('docs', 16, 12, 9, { n: S.docs, head: P.blue, w: 6, d: 4 });
        if (S.docs > 1) L.prop('docs', 23, 13, 9, { n: 1, head: P.amber, w: 5, d: 4 });
        L.prop('cabinet', 38, 2, 0, {}); L.prop('lamp', 36, 3, 15, { col: 'green', on: true });
        if (S.desk) { L.prop('desk', 28, 20, S.deskUp, { w: 12, d: 6 }); L.prop('haChair', 34, 20 + 6, 0, { col: 'blue' }); }
        L.person(21, 6, 1, ext(HRP, { arm: S.hrArm || 'down' }));
        L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { arm: S.meArm || 'down' })));
        if (!S.noMgr) L.person(36, 14, 1, ext(MGR, { arm: S.mgrArm || 'down' }));
        if (S.flow) S.flow.forEach(function (p) { L.flow(p, S.t, { color: P.amber, len: 2, gap: 3, speed: 9, z: 0 }); });
        if (S.pop) L.add([S.pop[0], S.pop[1], 0, S.pop[0] + 1, S.pop[1] + 1, 1], function () { ring(g, S.pop[0], S.pop[1], 4, S.t * 0.9, '#6ad79f', 10); });
      },
      steps: [
        { title: 'You ask for help', sub: 'Because of a disability', dur: 7, cam: C1, key: ['table'], cap: ['You need an accommodation', 'You tell your manager'],
          S: function (t, fx) { return { t: t, docs: 0, me: fx.walk([[0, 20], [4, 17], [6, 14]], t, 0.4, 2.2, { endDir: 0 }), meArm: t > 3 ? 'out' : 'down', mgrArm: t > 4 ? 'out' : 'down' }; } },
        { title: 'You talk it through', sub: 'An interactive dialogue', dur: 8, cam: C2, key: ['table'], cap: ['What is needed and why, and how it helps', 'Medical information stays confidential'],
          S: function (t, fx) { var a = Math.floor(t * 1.3) % 2; return { t: t, docs: t > 1 ? (t > 2.4 ? 2 : 1) : 0, me: { x: 6, y: 14, dir: 0 }, meArm: a ? 'out' : 'down', mgrArm: a ? 'down' : 'out', hrArm: t > 4 ? 'out' : 'down', flow: [[[8, 23], [18, 23], [30, 23]]], desk: t > 5, deskUp: Math.round(fx.E(t, 5.2, 7) * 4), pop: t > 5 && t < 6.2 ? [38, 22] : null }; } },
        { title: 'No payback', sub: 'Asking is protected', dur: 6.5, cam: C3, big: { n: 'NO', label: 'retaliation for asking', pos: 'left' },
          S: function (t, fx) { return { t: t, docs: 2, desk: true, deskUp: 4, noMgr: true, me: { x: 38, y: 17, dir: 3 }, meArm: 'out' }; } }
      ] });
  })();
  /* OK-EEO Statement and Non harassment Policy: the open shop floor, report to HR, a confidential investigation */
  (function () {
    var C1 = cam(15, 5, 0, 120, 84), C2 = cam(15, 5, 0, 90, 84), C3 = cam(32, 2, 0, 196, 88);
    make({ sid: 'OK-EEO Statement and Non harassme', key: 'a41', title: 'Equal opportunity and respect', std: 'Hiring & Orientation', blurb: 'Everyone is protected from harassment, discrimination and retaliation. Report concerns to HR or any manager.',
      X: 46, Y: 28, H: 26, backdrop: ['bands', '#14181a', '#1b2124'],
      floor: { style: 'epoxy', a: '#2a2a2e', b: '#303035' }, wall: { style: 'studs', tint: '#a0d9c4' },
      items: function (L, g, fx, S) {
        /* footprints: bench 4..24 x 2..10 (workers in front at y 14), HR desk 30..44 x 6..14, HR behind at 37,4, file cabinet 44..52 */
        L.prop('table', 4, 4, 0, { w: 20, d: 8, h: 9, plate: P.st2 });
        L.prop('desk', 30, 7, 0, { w: 14, d: 8 });
        L.prop('docs', 34, 9, 9, { n: S.notes, head: P.green, w: 6, d: 4 });
        L.prop('lamp', 41, 8, 9, { col: S.conf ? 'green' : 'amber', on: true });
        if (!S.noBg) { L.person(6, 14, 1, ext(OPA, { arm: 'down' })); L.person(16, 14, 1, ext(OPB, { arm: 'out' })); }
        L.person(37, 4, 1, ext(HRP, { arm: S.hrArm || 'down' }));
        if (S.me) L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { arm: S.meArm || 'down' })));
        if (S.shield) L.add([2, 12, 0, 3, 13, 1], function () { ring(g, 18, 14, 14, S.t * 0.7, '#6ad79f', 18); });
        if (S.scan) L.add([34, 9, 9, 40, 13, 10], function () { glowAt(g, 37, 11, 11, 9, '#6ad79f', 0.5 * fx.pulse(S.t, 1)); });
      },
      steps: [
        { title: 'Everyone is covered', sub: 'Free of harassment and retaliation', dur: 7, cam: C1, key: ['table'], cap: ['Equal opportunity for all of us', 'A workplace free of harassment'],
          S: function (t, fx) { return { t: t, notes: 1, me: { x: 26, y: 14, dir: 1 }, shield: t > 1.4 && t < 6, conf: false }; } },
        { title: 'Report it right away', sub: 'Tell HR or any member of management', dur: 8, cam: C2, key: ['desk'], cap: ['If you see it or feel it, tell HR', 'HR investigates promptly and thoroughly'],
          S: function (t, fx) { var w = fx.walk([[26, 14], [30, 18], [36, 17]], t, 0.6, 3.2, { endDir: 3 }); return { t: t, noBg: true, notes: 1 + (t > 4 ? 1 : 0) + (t > 5 ? 1 : 0), me: w, meArm: t > 3.4 ? 'out' : 'down', hrArm: t > 4 ? 'write' : 'down', scan: t > 5, conf: t > 5.4 }; } },
        { title: 'Kept confidential', sub: 'Action is taken where it is needed', dur: 6.5, cam: C3, big: { n: 'HR', label: 'or any manager', pos: 'left' },
          S: function (t, fx) { return { t: t, notes: 3, noBg: true, me: { x: 36, y: 17, dir: 3 }, meArm: 'out', hrArm: 'write', conf: true, scan: true }; } }
      ] });
  })();
  /* OK-Religious Accommodation: the break room schedule board, a request to the manager */
  (function () {
    var C1 = cam(14, 8, 0, 120, 90), C2 = cam(16, 8, 0, 150, 90), C3 = cam(30, 2, 0, 219, 88);
    make({ sid: 'OK-Religious Accommodation', key: 'a42', title: 'Religious accommodation', std: 'Hiring & Orientation', blurb: 'You may ask for a change to dress code, schedule or duties because of your beliefs. The company will not question your belief.',
      X: 44, Y: 28, H: 26, backdrop: ['stripes', '#16140f', '#1e1b14'],
      floor: { style: 'checker', a: '#2e2b27', b: '#34312c', tile: 6 }, wall: { style: 'panel', tint: '#d9c27a' },
      items: function (L, g, fx, S) {
        /* footprints: schedule board on the wall 24..44, break table 4..20 x 4..12, manager at 34,10, coffee counter 36..46 x 16..22 */
        L.prop('board', 24, 0, 6, { w: 20, h: 18, rows: 6, lit: S.lit, done: S.done, chips: [P.green, P.amber, P.blueT, P.green, P.amber, P.blueT] });
        L.prop('table', 4, 4, 0, { w: 16, d: 8, h: 9, top: 'wood' });
        L.prop('haPlant', 2, 22, 0, {});
        if (!S.noBg) L.person(8, 16, 1, ext(OPC, { arm: 'down' })); L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { arm: S.meArm || 'down' })));
        if (S.mgr) L.person(S.mgr.x, S.mgr.y, S.mgr.dir, fx.who(S.mgr, ext(MGR, { arm: S.mgrArm || 'down' })));
        if (S.pop) L.add([S.pop[0], S.pop[1], 0, S.pop[0] + 1, S.pop[1] + 1, 1], function () { ring(g, S.pop[0], S.pop[1], 4, S.t * 0.9, '#6ad79f', 10); });
      },
      steps: [
        { title: 'Respect for each person', sub: 'Everyone is treated equally', dur: 7, cam: C1, key: ['table'], cap: ['We treat everyone equally', 'We respect diverse beliefs'],
          S: function (t, fx) { return { t: t, lit: Math.floor(t * 0.7) % 6, done: 0, me: { x: 18, y: 16, dir: 1 }, meArm: Math.floor(t) % 2 ? 'out' : 'down' }; } },
        { title: 'Ask for a change', sub: 'Dress code, schedule or duties', dur: 8, cam: C2, key: ['board'], cap: ['Speak with your manager', 'The company considers your request'],
          S: function (t, fx) { var w = fx.walk([[18, 16], [26, 17], [31, 14]], t, 0.6, 2.8, { endDir: 0 }); var k = fx.E(t, 4, 6); return { t: t, lit: t > 4 ? 2 : -1, done: t > 6 ? 3 : 0, me: w, meArm: t > 3 ? 'out' : 'down', mgr: { x: 38, y: 12, dir: 2 }, mgrArm: t > 3.4 ? 'out' : 'down', pop: t > 6 && t < 7.2 ? [34, 14] : null }; } },
        { title: 'Never questioned', sub: 'The company does not judge your belief', dur: 6.5, cam: C3, big: { n: 'NEVER', label: 'questioned: your belief', pos: 'left' },
          S: function (t, fx) { return { t: t, lit: 3, done: 3, noBg: true, me: { x: 31, y: 14, dir: 0 }, meArm: 'out', mgr: { x: 38, y: 12, dir: 2 }, mgrArm: 'out' }; } }
      ] });
  })();
  /* 4.1 Attendance: at home, a call to the shop desk */
  (function () {
    var C1 = cam(20, 6, 0, 120, 90), C2 = cam(20, 6, 0, 100, 90), C3 = cam(38, 2, 0, 196, 88);
    make({ sid: '4.1', key: 'a41b', title: 'Attendance', std: 'Pay & Hours', blurb: 'If you know ahead of time that you will be absent or late, give your manager reasonable advance notice.',
      X: 52, Y: 28, H: 24, backdrop: ['stripes', '#13151a', '#1a1d24'],
      floor: { style: 'checker', a: '#2c2a30', b: '#322f37', tile: 6, zones: [[0, 0, 24, 28, '#3a3028', 1]] }, wall: { style: 'panel', tint: '#7d858c' },
      items: function (L, g, fx, S) {
        /* footprints: bed 4..18 x 4..12 (home), divider at x 25, shop desk 32..48 x 6..15, manager behind it at 40,4, employee beside the bed at 10,16 */
        L.prop('haBed', 4, 4, 0, {});
        L.box(25, 2, 0, 1, 22, 9, 'steel', { rim: false });
        L.prop('desk', 32, 6, 0, { w: 16, d: 9 });
        L.prop('haPhone', 34, 8, 9, { ring: S.ring });
        L.prop('haCal', 34, 0, 8, { w: 12, h: 12, mark: S.day, cols: 4, rows: 3 });
        if (S.note) L.prop('docs', 42, 9, 9, { n: 2, head: P.red, w: 6, d: 4 });
        if (S.me) L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { arm: S.meArm || 'down', hold: S.phone ? '#20262b' : undefined, holdSize: [2, 4] })));
        if (S.mgr) L.person(40, 3, 1, ext(MGR, { arm: S.mgrArm || 'down' }));
        if (S.flow) L.flow([[12, 20], [26, 20], [38, 20], [38, 16]], S.t, { color: P.amber, len: 3, gap: 3, speed: 9, z: 0 });
        if (S.pop) L.add([S.pop[0], S.pop[1], 0, S.pop[0] + 1, S.pop[1] + 1, 1], function () { ring(g, S.pop[0], S.pop[1], 6, S.t * 0.9, '#6ad79f', 10); });
      },
      steps: [
        { title: 'You know ahead of time', sub: 'You will be late or away', dur: 7, cam: C1, key: ['haBed'], cap: ['You know you will be late or absent', 'Plan to tell your manager first'],
          S: function (t, fx) { return { t: t, day: 1 + Math.floor(t * 0.4), me: { x: 10, y: 16, dir: 1 }, meArm: t > 3 ? 'out' : 'down', mgr: true }; } },
        { title: 'Call your manager', sub: 'Reasonable advance notice', dur: 8, cam: C2, key: ['desk'], cap: ['Give your manager advance notice', 'You may be asked for documentation'],
          S: function (t, fx) { return { t: t, day: 2, me: { x: 10, y: 16, dir: 1 }, phone: t > 0.6 && t < 5.4, meArm: t > 0.6 && t < 5.4 ? 'up' : 'down', flow: t > 1 && t < 5, ring: t > 2 && t < 4, mgr: true, mgrArm: t > 3.6 ? 'out' : 'down', note: t > 5.6, pop: t > 4 && t < 5.2 ? [38, 12] : null }; } },
        { title: 'Notice given', sub: 'Your manager knows', dur: 6.5, cam: C3, big: { n: 'ADVANCE', label: 'notice to your manager', pos: 'left' },
          S: function (t, fx) { return { t: t, day: 2, mgr: true, mgrArm: 'out', note: true, me: null }; } }
      ] });
  })();
  /* 4.2 Business Expenses: a meeting over a table, the expense report, the gift limit */
  (function () {
    var C1 = cam(14, 8, 0, 120, 84), C2 = cam(30, 6, 0, 120, 88), C3 = cam(32, 2, 0, 196, 88);
    make({ sid: '4.2', key: 'a42b', title: 'Business expenses', std: 'Pay & Hours', blurb: 'ADVANCED pays reasonable business expenses. The most senior person present pays and reports; gifts over $25 are not reimbursed.',
      X: 50, Y: 30, H: 24, backdrop: ['diag', '#17130e', '#201a12'],
      floor: { style: 'checker', a: '#352a24', b: '#3c2f28', tile: 6 }, wall: { style: 'panel', tint: '#c98a55' },
      items: function (L, g, fx, S) {
        /* footprints: meeting table 12..32 x 8..18 (customer at 8,14 left, employee behind at 24,5, senior person at 36,16 right); report desk 30..44 x 2..12 */
        L.prop('table', 12, 8, 0, { w: 20, d: 10, h: 9, top: 'wood' });
        if (S.receipt) L.prop('paystub', 18, 11, 9, { rows: 3, total: 1 });
        L.prop('desk', 34, 2, 0, { w: 14, d: 10 });
        if (S.form) L.prop('ledger', 34, 3, 9, { lines: S.lines, write: S.write });
        if (S.gift) L.prop('haGift', 40, 5, 9, { col: 'red' });
        if (!S.noBg) { L.person(8, 14, 0, ext(CRM, { arm: S.cusArm || 'down' })); L.person(24, 5, 1, ext(ME, { arm: S.meArm || 'down' })); }
        if (S.sen) L.person(S.sen.x, S.sen.y, S.sen.dir, fx.who(S.sen, ext(MGR, { arm: S.senArm || 'down', card: S.card ? P.red : undefined })));
        if (S.pop) L.add([S.pop[0], S.pop[1], 0, S.pop[0] + 1, S.pop[1] + 1, 1], function () { ring(g, S.pop[0], S.pop[1], S.pop[2] || 4, S.t * 0.9, '#6ad79f', 10); });
      },
      steps: [
        { title: 'A business meeting', sub: 'With a customer, a vendor or colleagues', dur: 7, cam: C1, key: ['table'], cap: ['A valid business purpose', 'The most senior person pays and reports'],
          S: function (t, fx) { return { t: t, receipt: t > 3.6, sen: { x: 36, y: 15, dir: 1 }, senArm: t > 2 ? 'out' : 'down', card: t > 2 && t < 4.2, cusArm: Math.floor(t) % 2 ? 'out' : 'down', meArm: Math.floor(t * 1.2) % 2 ? 'out' : 'down', pop: t > 3.6 && t < 4.8 ? [22, 13, 6] : null }; } },
        { title: 'Report the expense', sub: 'Use the standard expense report form', dur: 8, cam: C2, key: ['desk'], cap: ['Say what it was and why', 'Add the date, the place and who came'],
          S: function (t, fx) { var w = fx.walk([[36, 15], [37, 15]], t, 0.4, 1.0, { endDir: 3 }); return { t: t, noBg: true, receipt: true, form: true, lines: Math.min(4, Math.floor(t / 1.2)), write: fx.E((t % 1.2) / 1.2, 0, 1), sen: { x: 37, y: 15, dir: 3 }, senArm: t > 1.2 ? 'write' : 'down' }; } },
        { title: 'Gift limit', sub: 'Gifts need approval first', dur: 6.5, cam: C3, big: { n: '$25', label: 'business gift limit', pos: 'left' },
          S: function (t, fx) { return { t: t, noBg: true, receipt: true, gift: true, sen: { x: 37, y: 15, dir: 3 }, senArm: 'out', pop: [39, 8, 8] }; } }
      ] });
  })();
  /* 4.3 Direct Deposit: the HR form, the bank, the pay stub */
  (function () {
    var C1 = cam(16, 3, 0, 120, 90), C2 = cam(24, 3, 0, 120, 90), C3 = cam(36, 1, 0, 190, 86);
    make({ sid: '4.3', key: 'a43', title: 'Direct deposit', std: 'Pay & Hours', blurb: 'Ask HR for the application form. Typically the bank starts direct deposit within 30 calendar days.',
      X: 52, Y: 28, H: 24, backdrop: ['bands', '#0f1612', '#16201a'],
      floor: { style: 'grid', a: '#202a24', b: '#26322b' }, wall: { style: 'tile', tint: '#3fbf7f' },
      items: function (L, g, fx, S) {
        /* footprints: HR desk 6..22 x 8..16 (HR behind at 14,5), bank counter 30..46 x 8..16 (teller behind at 38,5), employee walks to 14,20 */
        L.prop('desk', 6, 8, 0, { w: 16, d: 8 });
        if (S.form) L.prop('docs', S.formX, S.formY || 10, S.formX >= 22 ? 12 : 9, { n: 1, head: P.green, w: 6, d: 4 });
        L.prop('counter', 30, 8, 0, { w: 16, d: 8, body: 'blue' });
        L.prop('cabinet', 47, 5, 0, {});
        L.prop('haCal', 34, 0, 10, { w: 12, h: 12, mark: S.mark, cols: 4, rows: 3 });
        if (!S.noHr) L.person(14, 5, 1, ext(HRP, { arm: S.hrArm || 'down' }));
        L.person(38, 5, 1, ext(OPC, { arm: S.tellerArm || 'down', vest: true }));
        if (S.me) L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { arm: S.meArm || 'down' })));
        if (S.stub) L.prop('paystub', 33, 10, 11, { rows: S.stub, total: S.total });
        if (S.flow) L.flow([[16, 18], [24, 19], [36, 19], [38, 17]], S.t, { color: P.amber, len: 3, gap: 3, speed: 9, z: 0 });
        if (S.flow2) L.flow([[38, 18], [30, 20], [22, 20]], S.t, { color: P.green, len: 3, gap: 3, speed: 9, z: 0 });
      },
      steps: [
        { title: 'Ask HR for the form', sub: 'The direct deposit application', dur: 7, cam: C1, key: ['desk'], cap: ['Direct deposit is encouraged', 'Ask HR for an application form'],
          S: function (t, fx) { return { t: t, mark: 1, form: t > 3, formX: 12, hrArm: t > 2.6 && t < 4 ? 'out' : 'down', me: fx.walk([[4, 24], [10, 22], [14, 20]], t, 0.4, 2.4, { endDir: 3 }) }; } },
        { title: 'The bank starts paying', sub: 'Your payroll goes straight to your bank', dur: 8, cam: C2, key: ['counter'], cap: ['You submit the completed form', 'The bank sets it up for payroll'],
          S: function (t, fx) { var k = fx.E(t, 1, 3.4); return { t: t, mark: 2 + Math.floor(t * 1.5), form: t < 4, formX: Math.round(12 + 22 * k), noHr: true, flow: t > 1 && t < 5, tellerArm: t > 3.4 ? 'write' : 'down', me: { x: 14, y: 20, dir: 3 }, meArm: t < 1.2 ? 'out' : 'down' }; } },
        { title: 'Pay arrives, with a note', sub: 'A written explanation of deductions', dur: 6.5, cam: C3, big: { n: '30', label: 'calendar days, typically', pos: 'left' },
          S: function (t, fx) { return { t: t, mark: 12, noHr: true, stub: 4, total: fx.E(t, 0.4, 2.4), tellerArm: 'out' }; } }
      ] });
  })();
  /* 4.4 Introduction to Wage and Hour Policies: four things feed your pay, ask your manager */
  (function () {
    var FACT = ['Surveys', 'Effort', 'Profits', 'Market forces'], TOP = ['Time off', 'Commissions', 'Overtime', 'Benefits'];
    var C1 = cam(18, 6, 0, 120, 92), C2 = cam(18, 6, 0, 120, 88), C3 = cam(32, 4, 0, 196, 88);
    var COL = ['blue', 'red', 'green', 'amber'];
    make({ sid: '4.4', key: 'a44', title: 'Wage and hour policies', std: 'Pay & Hours', blurb: 'Your pay depends on a range of factors. Questions about pay, overtime or deductions go to your manager.',
      X: 46, Y: 28, H: 24, backdrop: ['diag', '#151210', '#1d1915'],
      floor: { style: 'epoxy', a: '#2a2824', b: '#312e29', zones: [[10, 18, 14, 8, '#3a342a', 1]] }, wall: { style: 'studs', tint: '#e0a43a' },
      items: function (L, g, fx, S) {
        /* footprints: four bins at 4..10, 12..18, 20..26, 28..34 x 4..10, pay stub mat 12..23 x 17..25 (flat), employee at 36,18, manager walks along y 14 */
        for (var i = 0; i < 4; i++) { if (S.bins > i) L.prop('bin', 4 + i * 8, 4, 0, { col: COL[i], w: 6, d: 6, h: 6, fill: 2, item: 'cream' }); }
        L.prop('paystub', 12, 17, 0, { rows: S.rows, total: S.total });
        for (var k = 0; k < 4; k++) if (S.flows > k) L.flow([[7 + k * 8, 11], [7 + k * 8, 14], [16, 18]], S.t + k * 0.4, { color: ['#5f8cbf', P.redT, '#6ad79f', '#f0c264'][k], len: 2, gap: 3, speed: 8, z: 0 });
        if (S.emp) L.person(S.emp.x, S.emp.y, S.emp.dir, fx.who(S.emp, ext(ME, { arm: S.empArm || 'down' })));
        if (S.mgr) L.person(S.mgr.x, S.mgr.y, S.mgr.dir, fx.who(S.mgr, ext(MGR, { arm: S.mgrArm || 'down' })));
        L.prop('haPlant', 42, 24, 0, {});
      },
      steps: [
        { title: 'What sets your pay', sub: 'A wide range of factors', dur: 8, cam: C1, key: ['bin'], chips: FACT, chipAt: function (t) { return Math.min(3, Math.floor(t / 1.7)); }, cap: ['Many things feed into your pay', 'They all land on one stub'],
          S: function (t, fx) { return { t: t, bins: 1 + Math.floor(t / 1.7), flows: Math.floor(t / 1.7), rows: Math.min(4, Math.floor(t / 1.7) + 1), total: fx.E(t, 5.8, 7.4), emp: { x: 36, y: 18, dir: 2 }, empArm: 'down' }; } },
        { title: 'Ask your manager', sub: 'Pay, overtime, benefits, deductions', dur: 7.5, cam: C2, key: ['bin'], chips: TOP, chipAt: function (t) { return Math.min(3, Math.floor(t / 1.8)); }, cap: ['Not sure about your pay? Ask', 'Speak with your manager'],
          S: function (t, fx) { var w = fx.walk([[4, 14], [16, 14], [27, 14]], t, 0.6, 3.4, { endDir: 0 }); return { t: t, bins: 4, flows: 0, rows: 4, total: 1, emp: { x: 38, y: 15, dir: 2 }, mgr: w, empArm: t > 3.6 ? 'out' : 'down', mgrArm: t > 4.4 ? 'out' : 'down' }; } },
        { title: 'Speak up', sub: 'Questions are welcome', dur: 6.5, cam: C3, big: { n: 'SPEAK', label: 'with your manager', pos: 'left' },
          S: function (t, fx) { return { t: t, bins: 4, flows: 0, rows: 4, total: 1, emp: { x: 36, y: 18, dir: 2 }, empArm: 'out', mgr: { x: 44, y: 18, dir: 2 }, mgrArm: 'out' }; } }
      ] });
  })();
  /* 4.5 Job Abandonment: an empty workstation, a phone that is not answered, three days on the calendar */
  (function () {
    var C1 = cam(16, 6, 0, 120, 90), C2 = cam(16, 6, 0, 100, 90), C3 = cam(30, 2, 0, 196, 88);
    make({ sid: '4.5', key: 'a45', title: 'Job abandonment', std: 'Pay & Hours', blurb: 'If you do not show up or call in with an acceptable reason for three consecutive days, you are considered to have resigned.',
      X: 46, Y: 28, H: 24, backdrop: ['bands', '#170f0f', '#211515'],
      floor: { style: 'grid', a: '#2a2424', b: '#312a2a' }, wall: { style: 'panel', tint: '#e03131' },
      items: function (L, g, fx, S) {
        /* footprints: empty bench 4..20 x 8..16 with a stool, manager desk 30..44 x 6..14 (manager behind at 37,4), calendar on the wall 30..42 */
        L.prop('table', 4, 8, 0, { w: 16, d: 8, h: 9, plate: P.st2 });
        L.prop('haChair', 10, 18, 0, { col: 'red' });
        L.prop('lamp', 6, 10, 9, { col: 'red', on: true });
        L.prop('desk', 30, 6, 0, { w: 14, d: 8 });
        L.prop('haPhone', 32, 8, 9, { ring: S.ring });
        L.prop('haCal', 30, 0, 8, { w: 12, h: 12, mark: S.day, cols: 3, rows: 3 });
        if (S.file) L.prop('docs', 38, 8, 9, { n: 2, head: P.red, w: 6, d: 4, stamp: S.stamp });
        L.person(37, 3, 1, ext(MGR, { arm: S.mgrArm || 'down' }));
        if (S.hr) L.person(S.hr.x, S.hr.y, S.hr.dir, fx.who(S.hr, ext(HRP, { arm: S.hrArm || 'down' })));
        if (S.pop) L.add([S.pop[0], S.pop[1], 0, S.pop[0] + 1, S.pop[1] + 1, 1], function () { ring(g, S.pop[0], S.pop[1], 8, S.t * 0.9, P.redT, 10); });
      },
      steps: [
        { title: 'The bench is empty', sub: 'No show and no call', dur: 7, cam: C1, key: ['table'], cap: ['A team member does not show up', 'Nobody has called in'],
          S: function (t, fx) { return { t: t, day: 1, ring: t > 2 && t < 5, mgrArm: t > 5 ? 'out' : 'down', pop: t > 1.6 && t < 3 ? [12, 12] : null }; } },
        { title: 'Day after day', sub: 'Consecutive days with no call', dur: 8, cam: C2, key: ['table'], cap: ['The days add up', 'Still no acceptable reason'],
          S: function (t, fx) { return { t: t, day: 1 + Math.min(2, Math.floor(t / 2.4)), ring: Math.floor(t * 1.5) % 2 === 0 && t < 7, mgrArm: Math.floor(t * 0.8) % 2 ? 'out' : 'down', pop: Math.floor(t / 2.4) < 3 && (t % 2.4) < 0.9 ? [12, 12] : null }; } },
        { title: 'Considered resigned', sub: 'After three days the job is treated as left', dur: 6.5, cam: C3, big: { n: 'THREE', label: 'days in a row', pos: 'left' },
          S: function (t, fx) { return { t: t, day: 3, file: true, stamp: t > 3, hr: t > 0.6 ? { x: 44, y: 17, dir: 2 } : null, pop: t > 0.6 && t < 1.8 ? [44, 17] : null, hrArm: t > 2.2 ? 'out' : 'down', mgrArm: 'out' }; } }
      ] });
  })();

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
    "1.1": {"1":{"who":{"raul":[0,1]}},"2":{"who":{"pam":[1,0]}},"3":{"who":{"pam":[1,0]}}},
    "1.2": {"3":{"who":{"scott":[-1,0]}}},
    "2.1": {"1":{"who":{"scott":[2,0]}}},
    "2.2": {"1":{"cam":4},"3":{"who":{"raul":[1,0]}}},
    "2.3": {"1":{"cam":4}},
    "3.1": {"2":{"cam":4}},
    "3.2": {"1":{"cam":4},"3":{"cam":4}},
    "3.3": {"2":{"cam":4}},
    "3.4": {"1":{"who":{"raul":[1,0]}}},
    "3.5": {"3":{"cam":4}},
    "3.6": {"2":{"who":{"scott":[1,1]}}},
    "OK-EEO Statement and Non harassme": {"1":{"cam":4}},
    "OK-Religious Accommodation": {"2":{"who":{"scott":[-1,0]}}},
    "4.2": {"1":{"cam":4,"who":{"raul":[-2,-2]}}},
    "4.4": {"2":{"cam":4}},
    "1.0": {"1":{"who":{"kim":[2,2],"randel":[1,0]}}},
    "OK-Disability Accommodation": {"2":{"cam":12},"3":{"cam":4}}
  };
  if (!globalThis.HB_NOFIX) applyFix(HB, FIX);
  /*FIX:END*/

  if (typeof module !== 'undefined' && module.exports) module.exports = OUT;
})(typeof window !== 'undefined' ? window : this);
