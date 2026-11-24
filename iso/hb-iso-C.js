/* hb-iso-C.js: Advanced PMC handbook, batch C of isometric cutaway explainers (policies 6.1 to 6.13, access to personnel
   and medical records files, 7.1 to 7.7). Each policy is registered as window.HB_ISO['<section id>'] = spec, a 3 step
   explainer for iso-explainer.js: who is involved, what happens, what to do. Every number and rule word on a sign, caption,
   chip or big card comes from that section's own text (see facts-C.json and tools/check-iso-facts-C.mjs).
   Policies are rules about people, so each one is a tilted cutaway of the real place (office, shop floor, locker room, party,
   benefits desk) with the people in it. The kit and the framework are not modified. */
(function (root) {
  'use strict';
  var ISO = root.ISO || (typeof require === 'function' ? require('./iso-kit.js') : null);
  var P = ISO.P, mix = ISO.mix;
  var HB = root.HB_ISO = root.HB_ISO || {};

  /* ------------------------------------------------------------------ shared helpers */
  function ext(a, b) { var r = {}, k; for (k in a) r[k] = a[k]; for (k in b) r[k] = b[k]; return r; }
  /* camera that puts world point (wx, wy, wz) at picture point (sx, sy); the picture is 240 x 180 */
  function cam(wx, wy, wz, sx, sy, zoom) {
    var Z = zoom === 2 ? 2 : 1, d = wx - wy - (sx - 120) / (2 * Z), s = wx + wy - (wz || 0) - (sy - 98) / Z;
    return { x: (s + d) / 2, y: (s - d) / 2, zoom: Z, z: 0 };
  }
  /* the cached floor and walls of a room: c = { X, Y, H, style, a, b, tint, wall, zones, deco(s) } */
  function room(g, key, c) {
    g.layer(key, [-6, -6, -8, c.X + 4, c.Y + 4, c.H + 2], function (s) {
      s.isoFloor(c.X, c.Y, { style: c.style, a: c.a, b: c.b, zones: c.zones });
      s.isoWallCut(c.X, c.Y, c.H, { style: c.wall, tint: c.tint });
      if (c.deco) c.deco(s);
    });
  }
  /* a round sticker that hangs in the air over a thing: 'no' red with a cross, 'ok' green with a tick, 'ask' amber with a bar.
     k 0..1 is how far it has popped in */
  function sticker(g, wx, wy, wz, kind, k) {
    if (k === undefined) k = 1;
    if (k < 0.15) return;
    var p = g.proj(wx, wy, wz), Z = g.Z, R = Math.round(6 * Z * (k < 1 ? 0.6 + 0.4 * k : 1)), c = kind === 'no' ? P.red : kind === 'ok' ? P.greenD : P.amberD, cx = p[0], cy = p[1];
    if (cy - R - Z < 46) { cy = 46 + R + Z; cx += R + 6 * Z; }   /* never under the sign: slide down and to the side of what it marks */
    g.disc(cx, cy, R + Z, P.cream); g.disc(cx, cy, R, c);
    if (R < 4 * Z) return;
    var u = Z, lc = P.cream;
    if (kind === 'no') { g.line(cx - 3 * u, cy - 3 * u, cx + 3 * u, cy + 3 * u, lc); g.line(cx - 3 * u, cy + 3 * u, cx + 3 * u, cy - 3 * u, lc); g.line(cx - 3 * u + u, cy - 3 * u, cx + 3 * u + u, cy + 3 * u, lc); g.line(cx - 3 * u + u, cy + 3 * u, cx + 3 * u + u, cy - 3 * u, lc); }
    else if (kind === 'ok') { g.line(cx - 3 * u, cy, cx - u, cy + 2 * u, lc); g.line(cx - u, cy + 2 * u, cx + 3 * u, cy - 3 * u, lc); g.line(cx - 3 * u, cy + u, cx - u, cy + 3 * u, lc); g.line(cx - u, cy + 3 * u, cx + 3 * u, cy - 2 * u, lc); }
    else { g.r(cx - u, cy - 3 * u, 2 * u, 4 * u, lc); g.r(cx - u, cy + 2 * u, 2 * u, 2 * u, lc); }
  }
  /* people: palettes */
  function who(shirt, hair, skin, more) { return ext({ shirt: shirt, hair: hair || P.hair, skin: skin || P.skin }, more || {}); }
  var ME = who(P.red, '#2b2018', P.skin, { badge: true });
  var BLU = who('#3d6fa5', '#d8b36a', P.skin3), GRN = who('#3fbf7f', '#3a2c22', P.skin2), AMB = who('#e0a43a', '#6b4a2a', P.skin), GRY = who('#7d858c', '#8a8a8a', P.skin3);
  var MGR = who('#f1ece2', '#3a2c22', P.skin, { hat: '#16191c', badge: true }), VIS = who('#2b4f78', '#2b2018', P.skin2, { glasses: true });
  var PNK = who('#c9758a', '#5a2f2f', P.skin3);
  /* a small flat paper or card lying at a world point */
  /* a person helper for the lists: fx.who merges the walking step in */
  function person(L, fx, w, o) { L.person(w.x, w.y, w.dir, fx.who(w, o)); }
  function still(x, y, dir) { return { x: x, y: y, dir: dir, step: undefined }; }
  /* build a spec: o = { id, title, std, blurb, backdrop, world(g, fx, S), steps: [{ s(t, fx) -> state, ...step }] } */
  function reg(o) {
    var spec = { id: o.id, title: o.title, std: o.std, blurb: o.blurb, backdrop: o.backdrop, camDur: 1, steps: [] };
    o.steps.forEach(function (st, i) {
      var step = {}, k;
      for (k in st) if (k !== 's') step[k] = st[k];
      step.chips = st.chips || o.chips; step.chipAt = st.chipAt || function () { return i; };
      step.build = function (t, g, fx) { o.world(g, fx, st.s(t, fx), t); };
      spec.steps.push(step);
    });
    HB[o.id] = spec;
    return spec;
  }
  /* where a world point lands on the picture for a given camera (to place note chips) */
  function scr(c, x, y, z) { var Z = c.zoom === 2 ? 2 : 1; return { x: Math.round(120 + ((x - y) - (c.x - c.y)) * 2 * Z), y: Math.round(98 + ((x + y - (z || 0)) - (c.x + c.y)) * Z) }; }
  function note(c, x, y, z, a, b, text, dx, dy) { var p = scr(c, x, y, z); return { a: a, b: b, x: p.x + (dx || 0), y: p.y + (dy || 0), text: text }; }

  /* ================================================================ 6.1 Computer Security and Copying of Software */
  (function () {
    var R = { X: 46, Y: 34, H: 26, style: 'grid', a: '#1f2a36', b: '#27323f', tint: '#3d6fa5', wall: 'tile' };
    function sw(L, x, y, z, tag) {
      L.add([x, y, z, x + 5, y + 3, z + 6], function (g) { g.isoBox(x, y, z, 5, 3, 6, 'blue'); g.isoPanel('y', y + 3, x + 1, z + 1, 3, 3, P.cream); if (tag) g.isoPanel('y', y + 3, x + 1, z + 4, 3, 1, P.red); });
    }
    function world(g, fx, S, t) {
      room(g, 'c61', R);
      var L = g.list();
      L.prop('desk', 4, 0, 0, { w: 16 }); L.prop('monitor', 6, 2, 9, { rows: 3 });
      L.prop('desk', 26, 0, 0, { w: 16 }); L.prop('monitor', 28, 2, 9, { rows: 2 });
      L.prop('cabinet', 1, 14, 0); L.prop('cabinet', 1, 23, 0);
      if (S.sw1) sw(L, 15, 4, 9 + Math.round((1 - S.sw1) * 14), S.tag); if (S.sw2) sw(L, 37, 4, 9 + Math.round((1 - S.sw2) * 14), S.tag);
      if (S.counter) L.prop('counter', 22, 18, 0, { w: 20, top: 'cream' });
      if (S.docs) L.prop('docs', 27, 20, 11, { n: 2, stamp: S.stamp });
      if (S.box) L.box(36, 21, 11, 5, 3, 6, 'blue');
      if (S.a) person(L, fx, S.a, S.aO);
      if (S.b) person(L, fx, S.b, S.bO);
      if (S.m) L.person(S.m.x, S.m.y, S.m.dir, S.mO);
      if (S.v) person(L, fx, S.v, S.vO);
      L.flush();
      if (S.tag) { var p1 = g.proj(17, 5, 16), p2 = g.proj(39, 5, 16); g.ring(p1[0], p1[1], 9, t * 0.8, P.redT, 0.5); g.ring(p2[0], p2[1], 9, t * 0.8 + 0.4, P.redT, 0.5); }
      if (S.no) sticker(g, 19, 26, 26, 'no', S.no);
      if (S.ok) sticker(g, 32, 22, 28, 'ok', S.ok);
    }
    var C1 = cam(22, 8, 6, 120, 98, 2), C2 = cam(19, 26, 10, 120, 108, 2), C3 = cam(32, 22, 6, 82, 98, 2);
    reg({ id: '6.1', title: 'Computer Security and Copying of Software', std: 'Handbook, 6.1 Computer Security and Copying of Software',
      blurb: 'Company software is for company work. Do not copy it or give it away. Get your manager\'s approval to buy software.',
      backdrop: ['stripes', '#12161b', '#191f27'], world: world, chips: ['Whose', 'No copies', 'Buy it'],
      steps: [
        { title: 'COMPANY SOFTWARE', sub: 'Used for ADVANCED work only', dur: 7, cam: C1, tag: 'REAL SPEED', key: ['desk', 'monitor'],
          cap: ['ADVANCED buys the software', 'It is ADVANCED property'],
          s: function (t, fx) { var a = fx.walk([[12, 22], [12, 14]], t, 0.2, 1.2, { endDir: 3 }), b = fx.walk([[34, 22], [34, 14]], t, 0.5, 1.5, { endDir: 3 });
            return { a: a, b: b, aO: ext(ME, { arm: t > 2 ? 'write' : 'down' }), bO: ext(BLU, { arm: t > 2.3 ? 'write' : 'down' }), sw1: fx.E(t, 2.2, 3.0), sw2: fx.E(t, 2.6, 3.4), tag: t > 4 ? 1 : 0 }; } },
        { title: 'NO COPIES', sub: 'Do not give software to outsiders', dur: 7, cam: C2, tag: 'REAL SPEED', key: ['cabinet'],
          cap: ['Do not copy it', 'Do not give it to outsiders'],
          s: function (t, fx) { var v = fx.walk([[34, 31], [24, 26]], t, 0.3, 1.8, { endDir: 2 }); var give = t > 2.6 && t < 5.6;
            return { sw1: 1, sw2: 1, tag: 1, a: still(14, 26, 0), aO: ext(ME, { arm: give ? 'out' : 'down', hold: give ? P.blue : undefined, holdSize: [4, 3] }), v: v, vO: ext(VIS, { arm: t > 3.4 && t < 5.6 ? 'out' : 'down' }), no: fx.E(t, 3.8, 4.4) }; } },
        { title: 'BUY IT THE RIGHT WAY', sub: 'Your manager approves first', dur: 7, cam: C3, tag: 'REAL SPEED', key: ['counter'],
          cap: ['Get your manager\'s approval', 'Buy through Information Systems'],
          big: { n: 'ASK', label: 'your manager first', pos: 'right' },
          s: function (t, fx) { var a = fx.walk([[12, 30], [32, 30]], t, 0.3, 2.0, { endDir: 3 });
            return { counter: 1, sw1: 1, sw2: 1, tag: 1, a: a, aO: ext(ME, { arm: t > 2.2 && t < 3.6 ? 'out' : 'down' }), m: { x: 32, y: 15, dir: 1 }, mO: ext(MGR, { arm: t > 3.4 && t < 5 ? 'write' : 'down' }),
              docs: t > 2.6 ? 1 : 0, stamp: t > 4.2, ok: fx.E(t, 4.6, 5.2), box: t > 5.4 }; } }
      ] });
  })();

  /* ---- shared props built from boxes (each queued once, with an honest bounding box) ---- */
  function lockers(L, x, y, n, open, mat) {
    L.add([x, y, 0, x + 4 * n, y + 5, 22], function (g) {
      for (var i = 0; i < n; i++) {
        var xx = x + i * 4;
        g.isoBox(xx, y, 0, 4, 5, 22, mat || 'steel', { rim: false });
        g.isoPanel('y', y + 5, xx + 1, 3, 2, 16, { fill: i === open ? '#0c0e10' : '#4c5359', border: P.st3 });
        if (i !== open) g.isoPanel('y', y + 5, xx + 1, 14, 2, 1, P.st4);
      }
    });
  }
  function phone(L, x, y, z, lit) {
    L.add([x, y, z, x + 3, y + 2, z + 1], function (g) { g.isoBox(x, y, z, 3, 2, 1, 'black', { rim: false }); g.isoTile(x, y, 3, 2, lit ? '#6ad79f' : '#2a3a4c', z + 1); });
  }
  function balloon(L, x, y, col, bob) {
    var z = 8 + Math.round(bob || 0);
    L.add([x - 2, y - 2, 0, x + 2, y + 2, z + 6], function (g) { g.isoBox(x, y, 0, 1, 1, z, 'dark', { rim: false }); g.isoCyl(x, y, z, 2, 6, col, { rim: false }); });
  }
  function truck(L, x, y) {
    L.add([x, y, 0, x + 26, y + 12, 14], function (g) {
      g.isoCyl(x + 4, y + 3, 0, 2, 3, 'black', { rim: false }); g.isoCyl(x + 4, y + 9, 0, 2, 3, 'black', { rim: false });
      g.isoCyl(x + 20, y + 3, 0, 2, 3, 'black', { rim: false }); g.isoCyl(x + 20, y + 9, 0, 2, 3, 'black', { rim: false });
      g.isoBox(x, y, 3, 16, 12, 8, 'steel');
      g.isoPanel('y', y + 12, x + 1, 5, 14, 1, P.red);
      g.isoBox(x + 16, y, 3, 9, 12, 11, 'blue');
      g.isoBox(x + 25, y + 1, 3, 1, 10, 2, 'silver', { rim: false });
      g.isoPanel('x', x + 25, y + 2, 8, 8, 4, { fill: '#17323d', border: P.st3 });
      g.isoPanel('x', x + 25, y + 1, 4, 2, 1, P.amber); g.isoPanel('x', x + 25, y + 9, 4, 2, 1, P.amber);
    });
  }
  /* a small floating tag over a point: red company tag */
  function tagAt(g, x, y, z, k) { if (k <= 0) return; var p = g.proj(x, y, z), Z = g.Z; g.r(p[0] - 6 * Z, p[1] - 4 * Z, 12 * Z, 8 * Z, P.cream); g.r(p[0] - 5 * Z, p[1] - 3 * Z, 10 * Z, 6 * Z, P.red); g.r(p[0] - 5 * Z, p[1] - 3 * Z, 10 * Z, Z, P.redT); g.r(p[0] - 3 * Z, p[1], 6 * Z, Z, P.cream); g.r(p[0] - 3 * Z, p[1] + 2 * Z, 4 * Z, Z, P.cream); }

  /* ================================================================ 6.2 Employer Sponsored Social Events */
  (function () {
    var R = { X: 40, Y: 34, H: 24, style: 'checker', a: '#3a3128', b: '#43392f', tint: '#c9952b', wall: 'panel', zones: [[6, 3, 24, 15, '#5c2a2a']],
      deco: function (s) { s.isoPanel('y', 0, 8, 12, 22, 5, P.red); for (var i = 0; i < 6; i++) s.isoPanel('y', 0, 9 + i * 3, 9, 2, 3, i % 2 ? P.cream : P.amber); } };
    function world(g, fx, S, t) {
      room(g, 'c62', R);
      var L = g.list(), i;
      L.prop('table', 8, 6, 0, { w: 20, d: 10, top: 'wood' });
      L.cyl(18, 11, 9, 3, 3, 'cream', { rim: false }); L.box(18, 11, 12, 1, 1, 2, 'red', { rim: false });
      L.box(11, 8, 9, 2, 2, 1, 'paper', { rim: false }); L.box(23, 12, 9, 2, 2, 1, 'paper', { rim: false }); L.box(25, 8, 9, 1, 1, 2, 'blue', { rim: false });
      for (i = 0; i < 3; i++) balloon(L, 3 + i * 6, 26 + (i % 2) * 2, [P.red, P.amber, '#3d6fa5'][i], Math.sin(t * 2 + i) * 1.4);
      if (S.bench) { L.prop('table', 26, 24, 0, { w: 12, d: 8, top: 'steel' }); L.box(29, 26, 9, 3, 2, 2, 'silver', { rim: false }); L.box(33, 27, 9, 2, 2, 3, 'card', { rim: false }); }
      if (S.desk) { L.prop('desk', 26, 20, 0, { w: 14, d: 8 }); if (S.docs) L.prop('docs', 30, 22, 9, { n: 2, stamp: S.stamp }); }
      person(L, fx, S.a, S.aO);
      if (!S.desk) { L.person(19, 4, 1, ext(BLU, { arm: S.cheer ? 'up' : 'down' })); L.person(27, 4, 1, ext(GRN, { arm: S.cheer ? 'down' : 'up' })); }
      if (S.m) L.person(S.m.x, S.m.y, S.m.dir, S.mO);
      if (S.c) person(L, fx, S.c, S.cO);
      L.flush();
      if (S.ok) sticker(g, 32, 21, 26, 'ok', S.ok);
      if (S.ok2) sticker(g, 32, 20, 26, 'ok', S.ok2);
    }
    var C1 = cam(18, 10, 8, 120, 104, 2), C2 = cam(28, 14, 6, 120, 104, 2), C3 = cam(32, 24, 6, 82, 98, 2);
    reg({ id: '6.2', title: 'Employer Sponsored Social Events', std: 'Handbook, 6.2 Employer Sponsored Social Events',
      blurb: 'Company social events are voluntary and are not part of your work duties. Any exception must be in writing and signed by a manager before the event.',
      backdrop: ['bands', '#1d1710', '#271e14'], world: world, chips: ['The event', 'Your choice', 'In writing'],
      steps: [
        { title: 'SOCIAL EVENTS', sub: 'ADVANCED holds them for employees', dur: 7, cam: C1, tag: 'REAL SPEED', key: ['table'],
          cap: ['ADVANCED holds social events', 'For employees, from time to time'],
          s: function (t, fx) { return { a: still(6, 11, 0), aO: ext(ME, { arm: Math.floor(t * 2) % 2 ? 'up' : 'down' }), cheer: Math.floor(t * 2) % 2 }; } },
        { title: 'YOUR CHOICE', sub: 'Going is voluntary', dur: 7, cam: C2, tag: 'REAL SPEED', key: ['table'],
          cap: ['Attendance is voluntary', 'It is not part of your work duties'],
          s: function (t, fx) { var a = fx.walk([[6, 11], [6, 23], [32, 23]], t, 0.5, 4.0, { endDir: 1 });
            return { bench: 1, a: a, aO: ext(ME, { arm: t > 4.4 ? 'write' : 'down' }), cheer: Math.floor(t * 2) % 2, ok2: fx.E(t, 4.6, 5.2) }; } },
        { title: 'EXCEPTIONS IN WRITING', sub: 'A manager signs before the event', dur: 7, cam: C3, tag: 'REAL SPEED', key: ['desk'],
          cap: ['An exception must be in writing', 'Signed by a manager first'],
          big: { n: 'SIGNED', label: 'by a manager first', pos: 'right' },
          s: function (t, fx) { var a = fx.walk([[18, 31], [33, 31]], t, 0.3, 1.8, { endDir: 3 });
            return { desk: 1, docs: t > 2.2, stamp: t > 4.0, a: a, aO: ext(ME, { arm: t > 2 && t < 3.4 ? 'out' : 'down' }), m: { x: 33, y: 17, dir: 1 }, mO: ext(MGR, { arm: t > 3.2 && t < 4.6 ? 'write' : 'down' }), ok: fx.E(t, 4.6, 5.2) }; } }
      ] });
  })();

  /* ================================================================ 6.3 Employer-Provided Cell Phones/Mobile Devices */
  (function () {
    var R = { X: 44, Y: 32, H: 22, style: 'epoxy', a: '#2a2f33', b: '#30363b', tint: '#5b7690', wall: 'panel', zones: [[14, 14, 1, 16, '#c4c9ce'], [44 - 2, 14, 1, 16, '#c4c9ce'], [14, 30, 28, 1, '#c4c9ce']] };
    function earpiece(g, x, y, k) { if (k <= 0) return; var p = g.proj(x, y, 0), Z = g.Z; g.r(p[0] + 3 * Z, p[1] - 17 * Z, 2 * Z, 2 * Z, P.cream); g.r(p[0] + 3 * Z, p[1] - 15 * Z, 2 * Z, Z, P.blueL); }
    function world(g, fx, S, t) {
      room(g, 'c63', R);
      var L = g.list();
      truck(L, 18, 2);
      if (S.counter) { L.prop('counter', 4, 4, 0, { w: 12, top: 'cream' }); phone(L, 8, 6, 11, S.phoneOn); if (S.pass) L.prop('docs', 11, 6, 11, { n: 1 }); }
      if (S.m) L.person(S.m.x, S.m.y, S.m.dir, S.mO);
      person(L, fx, S.a, S.aO);
      L.flush();
      if (S.ear) earpiece(g, S.a.x, S.a.y, S.ear);
      if (S.no) sticker(g, S.a.x + 2, S.a.y, 29, 'no', S.no);
      if (S.ok) sticker(g, S.a.x + 2, S.a.y, 29, 'ok', S.ok);
      if (S.ok3) sticker(g, 10, 8, 26, 'ok', S.ok3);
      if (S.ring) { var p = g.proj(S.a.x + 3, S.a.y, 12); g.ring(p[0], p[1], 8, t * 0.9, '#6ad79f', 0.5); }
    }
    var C1 = cam(27, 18, 0, 120, 100, 2), C2 = cam(36, 17, 0, 120, 106, 2), C3 = cam(10, 12, 0, 82, 98, 2);
    reg({ id: '6.3', title: 'Employer-Provided Cell Phones/Mobile Devices', std: 'Handbook, 6.3 Employer-Provided Cell Phones/Mobile Devices',
      blurb: 'A company phone is for work. Use hands-free when you drive. When you leave, return the phone and its passwords.',
      backdrop: ['diag', '#12161a', '#1a2026'], world: world, chips: ['Issued', 'Driving', 'Return'],
      steps: [
        { title: 'COMPANY PHONE', sub: 'Issued for work calls', dur: 7, cam: C1, tag: 'REAL SPEED', key: [],
          cap: ['ADVANCED may issue a phone', 'It is for work communications'],
          s: function (t, fx) { var a = fx.walk([[40, 22], [32, 21]], t, 0.3, 1.5, { endDir: 2 });
            return { a: a, aO: ext(ME, { arm: t > 3.4 ? 'out' : 'down', hold: t > 3.4 ? '#14171a' : undefined, holdSize: [2, 3] }), m: { x: 23, y: 21, dir: 0 }, mO: ext(MGR, { arm: t > 2 && t < 3.4 ? 'out' : 'down', hold: t > 2 && t < 3.4 ? '#14171a' : undefined, holdSize: [2, 3] }), ring: t > 4 ? 1 : 0 }; } },
        { title: 'HANDS-FREE DRIVING', sub: 'Not in your hand while you drive', dur: 7, cam: C2, tag: 'REAL SPEED', key: [],
          cap: ['No phone in your hand while driving', 'Use the hands-free option'],
          s: function (t, fx) { var hand = t < 3.6;
            return { a: still(36, 18, 3), aO: ext(ME, { arm: hand ? 'out' : 'down', hold: hand ? '#14171a' : undefined, holdSize: [2, 3] }), no: hand ? fx.E(t, 1.4, 2.0) : 0, ear: t > 4.2 ? 1 : 0, ok: t > 4.2 ? fx.E(t, 4.4, 5.0) : 0 }; } },
        { title: 'RETURN IT ALL', sub: 'Phone and passwords go back', dur: 7, cam: C3, tag: 'REAL SPEED', key: ['counter'],
          cap: ['When you leave, it all goes back', 'In operable condition'],
          big: { n: 'RETURN', label: 'phone and passwords', pos: 'right' },
          s: function (t, fx) { var a = fx.walk([[16, 24], [10, 15]], t, 0.3, 1.8, { endDir: 3 });
            return { counter: 1, a: a, aO: ext(ME, { arm: t > 2.2 && t < 3.4 ? 'out' : 'down', hold: t > 2.2 && t < 3.4 ? '#14171a' : undefined, holdSize: [2, 3] }), m: { x: 10, y: 2, dir: 1 }, mO: ext(MGR, { arm: t > 3.6 ? 'write' : 'down' }), phoneOn: t > 3.4, pass: t > 4, ok3: fx.E(t, 4.6, 5.2) }; } }
      ] });
  })();

  /* ================================================================ 6.4 Non solicitation/Non distribution Policy */
  (function () {
    var R = { X: 46, Y: 30, H: 24, style: 'grid', a: '#252a2d', b: '#2c3236', tint: '#4f8a5b', wall: 'studs', zones: [[26, 0, 20, 30, '#2a3a2c'], [25, 0, 1, 30, '#e0b24f']] };
    function world(g, fx, S, t) {
      room(g, 'c64', R);
      var L = g.list();
      L.prop('machine', 4, 2, 0, { run: S.run ? 0.6 : 0, spin: t * 2, t: t, door: 0 });
      L.prop('table', 30, 8, 0, { w: 14, d: 8, top: 'wood' }); L.box(33, 10, 9, 2, 2, 2, 'cream', { rim: false }); L.box(38, 11, 9, 2, 2, 2, 'cream', { rim: false });
      L.prop('stool', 31, 16, 0, { col: 'green' }); L.prop('stool', 38, 16, 0, { col: 'green' });
      if (S.a) person(L, fx, S.a, S.aO);
      if (S.b) person(L, fx, S.b, S.bO);
      if (S.c) person(L, fx, S.c, S.cO);
      if (S.m) L.person(S.m.x, S.m.y, S.m.dir, S.mO);
      L.flush();
      if (S.no) sticker(g, S.nx, S.ny, 28, 'no', S.no);
      if (S.ok) sticker(g, S.nx, S.ny, 28, 'ok', S.ok);
    }
    var C1 = cam(16, 18, 0, 120, 100, 2), C2 = cam(36, 20, 0, 120, 100, 2), C3 = cam(24, 25, 0, 82, 98, 2);
    reg({ id: '6.4', title: 'Non solicitation/Non distribution Policy', std: 'Handbook, 6.4 Non solicitation/Non distribution Policy',
      blurb: 'No soliciting during working time. Lunch and breaks are fine. Report violations to your manager.',
      backdrop: ['stripes', '#14181a', '#1b2224'], world: world, chips: ['Work time', 'Break time', 'Report'],
      steps: [
        { title: 'WORKING TIME', sub: 'No selling or asking for support', dur: 7, cam: C1, tag: 'REAL SPEED', key: ['machine'],
          cap: ['No soliciting during working time', 'Coworkers are busy with assigned work'],
          s: function (t, fx) { var c = fx.walk([[34, 21], [23, 20]], t, 0.4, 2.0, { endDir: 2 });
            return { run: 1, a: still(13, 19, 3), aO: ext(ME, { arm: 'write' }), c: c, cO: ext(VIS, { hold: P.cream, holdSize: [4, 3], arm: t > 2.4 ? 'out' : 'down' }), nx: 18, ny: 20, no: fx.E(t, 3.0, 3.6) }; } },
        { title: 'BREAKS ARE FINE', sub: 'Lunch, coffee breaks, break rooms', dur: 7, cam: C2, tag: 'REAL SPEED', key: ['table'],
          cap: ['OK at lunch and coffee breaks', 'When coworkers are on a break too'],
          s: function (t, fx) { var c = fx.walk([[46, 18], [42, 22]], t, 0.3, 1.8, { endDir: 2 });
            return { a: still(28, 22, 0), aO: ext(BLU, { hold: '#f1ece2', holdSize: [2, 2], arm: 'out' }), b: still(35, 22, 1), bO: GRN, c: c, cO: ext(VIS, { hold: P.cream, holdSize: [4, 3], arm: t > 2.4 ? 'out' : 'down' }), nx: 39, ny: 22, ok: fx.E(t, 3.2, 3.8) }; } },
        { title: 'REPORT VIOLATIONS', sub: 'Tell your manager', dur: 7, cam: C3, tag: 'REAL SPEED', key: [],
          cap: ['Outsiders may not hand out materials', 'Report violations to your manager'],
          big: { n: 'REPORT', label: 'to your manager', pos: 'right' },
          s: function (t, fx) { var a = fx.walk([[28, 25], [21, 25]], t, 0.8, 2.4, { endDir: 2 });
            return { m: { x: 14, y: 25, dir: 0 }, mO: ext(MGR, { arm: t > 3 ? 'out' : 'down' }), a: a, aO: ext(ME, { arm: t > 2.6 ? 'out' : 'down' }), c: still(37, 25, 1), cO: ext(VIS, { hold: P.cream, holdSize: [4, 3] }), nx: 37, ny: 25, no: fx.E(t, 0.6, 1.2) }; } }
      ] });
  })();

  /* ================================================================ 6.5 Off-Duty Use of Employer Property or Premises */
  (function () {
    var R = { X: 38, Y: 30, H: 24, style: 'checker', a: '#262a33', b: '#2b303a', tint: '#3a4a60', wall: 'studs',
      deco: function (s) { s.isoPanel('x', 0, 6, 8, 12, 10, { fill: '#0f1626', border: P.st3 }); s.isoPanel('x', 0, 15, 14, 2, 2, '#f0d9a0'); s.isoPanel('x', 0, 9, 13, 1, 1, '#f0d9a0'); s.isoPanel('x', 0, 11, 10, 1, 1, '#f0d9a0'); } };
    function world(g, fx, S, t) {
      room(g, 'c65', R);
      var L = g.list();
      L.prop('table', 4, 3, 0, { w: 14, d: 8, top: 'steel' }); L.prop('printer', 5, 4, 9, { out: S.out, lit: S.out > 0 });
      if (S.copies) L.prop('docs', 14, 5, 9, { n: S.copies, w: 4, d: 4 });
      L.prop('shelf', 22, 1, 0, { w: 14, d: 6, h: 22, seed: 7 });
      if (!S.desk) L.prop('table', 4, 16, 0, { w: 14, d: 8, top: 'steel' });
      if (S.mon) L.prop('monitor', 9, 18, 9, { rows: S.fixed ? 3 : 0, screen: S.fixed ? '#0f2a1d' : '#2a1010' });
      if (S.newbox) L.box(5, 18, 9, 3, 3, 3, 'card', { rim: false });
      if (S.desk) { L.prop('desk', 16, 12, 0, { w: 14, d: 8 }); if (S.docs) L.prop('docs', 20, 14, 9, { n: 2, stamp: S.stamp }); }
      L.prop('table', 28, 22, 0, { w: 6, d: 4, h: 8, top: 'wood' }); L.prop('docs', 29, 23, 8, { n: 1, w: 4, d: 2, head: S.logged ? P.red : P.st2 });
      if (S.a) person(L, fx, S.a, S.aO);
      if (S.m) L.person(S.m.x, S.m.y, S.m.dir, S.mO);
      L.flush();
      if (S.mon && !S.fixed) { var p = g.proj(11, 19, 14), Z = g.Z; g.line(p[0] - 2 * Z, p[1] - 3 * Z, p[0] + Z, p[1] + 2 * Z, P.red); g.line(p[0] + Z, p[1] - 3 * Z, p[0] - 2 * Z, p[1] + Z, P.redT); }
      if (S.no) sticker(g, 9, 8, 22, 'no', S.no);
      if (S.ok) sticker(g, 11, 20, 24, 'ok', S.ok);
      if (S.ok3) sticker(g, 31, 24, 22, 'ok', S.ok3);
      if (S.ok4) sticker(g, 23, 16, 26, 'ok', S.ok4);
    }
    var C1 = cam(11, 14, 0, 120, 100, 2), C2 = cam(11, 24, 0, 120, 100, 2), C3 = cam(24, 20, 0, 82, 106, 2);
    reg({ id: '6.5', title: 'Off-Duty Use of Employer Property or Premises', std: 'Handbook, 6.5 Off-Duty Use of Employer Property or Premises',
      blurb: 'Company property is not for personal use during working time. Return it in good condition. Off hours use needs your manager\'s written consent.',
      backdrop: ['bands', '#0f1218', '#151a22'], world: world, chips: ['Work time', 'Damage', 'Off hours'],
      steps: [
        { title: 'NO PERSONAL USE', sub: 'Not during working time', dur: 7, cam: C1, tag: 'REAL SPEED', key: ['printer'],
          cap: ['No personal copies or supplies', 'Get authorization first'],
          s: function (t, fx) { return { a: still(11, 14, 3), aO: ext(ME, { arm: Math.floor(t * 3) % 2 ? 'write' : 'down' }), out: fx.E(t, 0.8, 2.4), copies: t > 2.6 ? Math.min(5, 1 + Math.floor((t - 2.6) * 1.4)) : 0, no: fx.E(t, 3.8, 4.4) }; } },
        { title: 'BREAK IT, FIX IT', sub: 'Return property in good condition', dur: 7, cam: C2, tag: 'REAL SPEED', key: ['monitor'],
          cap: ['Return property in good condition', 'Repair or replace what you damage'],
          s: function (t, fx) { var a = fx.walk([[24, 27], [12, 27]], t, 0.3, 1.8, { endDir: 3 });
            return { mon: 1, fixed: t > 4.4, a: a, aO: ext(ME, { arm: t > 2.4 && t < 4.4 ? 'out' : 'down', hold: t > 2 && t < 4.4 ? '#a07a52' : undefined, holdSize: [3, 3] }), newbox: t > 4.6, ok: fx.E(t, 5.0, 5.6) }; } },
        { title: 'AFTER HOURS: ASK FIRST', sub: 'Written consent from your manager', dur: 7, cam: C3, tag: 'REAL SPEED', key: ['desk'],
          cap: ['Get your manager\'s written consent', 'Sign the log-in and log-out sheet'],
          big: { n: 'SIGN', label: 'log-in and log-out', pos: 'right' },
          s: function (t, fx) { var a = fx.walk([[14, 28], [31, 28]], t, 2.4, 4.0, { endDir: 3 });
            return { desk: 1, docs: t > 0.6, stamp: t > 1.8, m: { x: 23, y: 9, dir: 1 }, mO: ext(MGR, { arm: t > 0.8 && t < 1.8 ? 'write' : 'down' }), ok4: fx.E(t, 2.0, 2.6), a: a, aO: ext(ME, { arm: t > 4.1 ? 'write' : 'down' }), logged: t > 4.8, ok3: fx.E(t, 5.0, 5.6) }; } }
      ] });
  })();

  /* ================================================================ 6.6 Personal Appearance */
  (function () {
    var R = { X: 36, Y: 28, H: 24, style: 'checker', a: '#2b3a3a', b: '#31434a', tint: '#5f8cbf', wall: 'tile',
      deco: function (s) { s.isoPanel('y', 0, 22, 6, 10, 14, { fill: '#8fb4d9', border: P.st3 }); s.isoPanel('y', 0, 24, 8, 1, 9, '#c7dff2'); s.isoPanel('y', 0, 27, 8, 1, 5, '#c7dff2'); } };
    function world(g, fx, S, t) {
      room(g, 'c66', R);
      var L = g.list();
      lockers(L, 4, 1, 4, S.open);
      L.prop('table', 6, 12, 0, { w: 14, d: 4, h: 5, top: 'wood' });
      if (S.gear > 0) L.box(8, 13, 5, 4, 2, 1, 'amber', { rim: false });
      if (S.gear > 1) L.box(13, 13, 5, 3, 1, 1, 'blue', { rim: false });
      if (S.gear > 2) L.cyl(18, 14, 5, 1, 2, 'amber', { rim: false });
      if (S.docs) L.prop('docs', 21, 7, 0, { n: 1, w: 4, d: 3 });
      if (S.a) person(L, fx, S.a, S.aO);
      if (S.m) L.person(S.m.x, S.m.y, S.m.dir, S.mO);
      if (S.b) L.person(S.b.x, S.b.y, S.b.dir, S.bO);
      L.flush();
      if (S.ok) sticker(g, S.okx || 27, S.oky || 5, 26, 'ok', S.ok);
    }
    var C1 = cam(18, 9, 0, 120, 100, 2), C2 = cam(14, 10, 0, 120, 100, 2), C3 = cam(22, 10, 0, 82, 98, 2);
    var DRESSED = { vest: true, glasses: true, hat: '#e0c040' };
    reg({ id: '6.6', title: 'Personal Appearance', std: 'Handbook, 6.6 Personal Appearance',
      blurb: 'Come to work neatly groomed and dressed, in the uniform or safety gear the job needs. Ask your manager for an accommodation if you need one.',
      backdrop: ['diag', '#10181a', '#172123'], world: world, chips: ['Ready', 'Gear', 'Ask'],
      steps: [
        { title: 'COME TO WORK READY', sub: 'Neatly groomed and dressed', dur: 7, cam: C1, tag: 'REAL SPEED', key: [],
          cap: ['Report to work neatly groomed', 'And neatly dressed'],
          s: function (t, fx) { var a = fx.walk([[11, 9], [27, 9], [27, 5]], t, 2.2, 4.2, { endDir: 1 });
            return { open: t < 2.4 ? 1 : -1, a: t < 2.2 ? still(11, 9, 1) : a, aO: ext(t < 3.6 ? GRY : ME, { arm: t < 2.2 ? 'out' : (t > 4.4 ? 'up' : 'down') }), ok: fx.E(t, 5.0, 5.6) }; } },
        { title: 'RIGHT GEAR FOR THE JOB', sub: 'Uniform or protective safety gear', dur: 7, cam: C2, tag: 'REAL SPEED', key: ['table'],
          cap: ['Uniform or safety clothing', 'It depends upon the job'],
          s: function (t, fx) { var n = t < 1.8 ? 3 : t < 3 ? 2 : t < 4.2 ? 1 : 0;
            return { gear: n, a: still(13, 9, 1), aO: ext(ME, { vest: t > 1.8, glasses: t > 3, hat: t > 4.2 ? '#e0c040' : undefined, arm: t > 1.4 && t < 4.6 ? 'out' : 'down' }), b: still(25, 9, 1), bO: ext(BLU, DRESSED), ok: fx.E(t, 5.0, 5.6), okx: 13, oky: 9 }; } },
        { title: 'NEED AN ACCOMMODATION?', sub: 'Disability or religious beliefs', dur: 7, cam: C3, tag: 'REAL SPEED', key: [],
          cap: ['Contact your manager', 'To request a reasonable accommodation'],
          big: { n: 'ASK', label: 'your manager', pos: 'right' },
          s: function (t, fx) { var a = fx.walk([[10, 9], [18, 9]], t, 0.3, 1.8, { endDir: 0 });
            return { a: a, aO: ext(ME, { arm: t > 2.4 ? 'out' : 'down', hold: t > 2.4 ? P.paper : undefined, holdSize: [3, 3] }), m: { x: 27, y: 9, dir: 2 }, mO: ext(MGR, { arm: t > 3.4 ? 'write' : 'down' }), ok: fx.E(t, 4.2, 4.8), okx: 23, oky: 9 }; } }
      ] });
  })();

  /* ================================================================ 6.7 Personal Cell Phone/Mobile Device Use */
  (function () {
    var R = { X: 44, Y: 30, H: 26, style: 'epoxy', a: '#2d2b27', b: '#34312c', tint: '#c9952b', wall: 'panel' };
    function world(g, fx, S, t) {
      room(g, 'c67', R);
      var L = g.list();
      L.prop('machine', 4, 2, 0, { run: S.run ? 0.6 : 0, spin: t * 2, t: t, lamp: S.run ? 'green' : 'red' });
      lockers(L, 28, 1, 4, S.open);
      L.prop('table', 28, 16, 0, { w: 12, d: 8, top: 'wood' }); L.prop('stool', 30, 26, 0, { col: 'red' });
      if (S.lampOn) L.prop('lamp', 24, 18, 0, { col: 'red', on: Math.floor(t * 3) % 2 === 0 });
      if (S.a) person(L, fx, S.a, S.aO);
      if (S.m) person(L, fx, S.m, S.mO);
      L.flush();
      if (S.ear) { var p = g.proj(S.a.x, S.a.y, 0), Z = g.Z; g.r(p[0] + 3 * Z, p[1] - 17 * Z, 2 * Z, 2 * Z, P.cream); g.ring(p[0] - 4 * Z, p[1] - 16 * Z, 9, t * 0.8, '#6ad79f', 0.6); }
      if (S.no) sticker(g, S.a.x + 2, S.a.y, 29, 'no', S.no);
      if (S.ok) sticker(g, S.okx, S.oky, 26, 'ok', S.ok);
      if (S.ask) sticker(g, S.a.x + 2, S.a.y, 29, 'ask', S.ask);
      if (S.ok2) sticker(g, 27, 22, 24, 'ok', S.ok2);
    }
    var C1 = cam(22, 14, 0, 120, 104, 2), C2 = cam(18, 20, 0, 120, 100, 2), C3 = cam(19, 20, 0, 82, 100, 2);
    reg({ id: '6.7', title: 'Personal Cell Phone/Mobile Device Use', std: 'Handbook, 6.7 Personal Cell Phone/Mobile Device Use',
      blurb: 'On the shop floor, keep your phone away while you work and use it on breaks. In an emergency, tell your supervisor. Wear one earbud at most.',
      backdrop: ['bands', '#17140f', '#1f1b14'], world: world, chips: ['Breaks', 'Emergency', 'Earbud'],
      steps: [
        { title: 'PHONES ON BREAKS', sub: 'Pocket or locker while you work', dur: 7, cam: C1, tag: 'REAL SPEED', key: [],
          cap: ['Keep your phone in a pocket or locker', 'Use it on breaks and at lunch'],
          s: function (t, fx) { var a = fx.walk([[13, 19], [25, 19], [25, 11], [33, 11], [25, 11], [25, 21]], t, 1.0, 5.2, { endDir: 0 });
            return { run: t < 1.5, open: t > 3.2 && t < 4.2 ? 1 : -1, a: t < 1 ? still(13, 19, 3) : a, aO: ext(ME, { arm: t < 1 ? 'write' : (t > 3.2 && t < 4.0 ? 'out' : (t > 5.3 ? 'out' : 'down')), hold: t > 5.3 ? '#14171a' : undefined, holdSize: [2, 3] }), ok: fx.E(t, 4.4, 5.0), okx: 33, oky: 6, ok2: fx.E(t, 5.6, 6.2) }; } },
        { title: 'EMERGENCIES ONLY', sub: 'Tell your supervisor', dur: 7, cam: C2, tag: 'REAL SPEED', key: ['machine'],
          cap: ['Never use a phone while running a machine', 'In an emergency, tell your supervisor'],
          s: function (t, fx) { var m = fx.walk([[26, 26], [21, 21]], t, 3.6, 5.0, { endDir: 2 });
            return { run: t < 3.4, a: still(13, 19, 3), aO: ext(ME, { arm: t > 1.0 ? 'out' : 'write', hold: t > 1.0 ? '#14171a' : undefined, holdSize: [2, 3] }), no: t > 1.0 && t < 3.4 ? fx.E(t, 1.2, 1.8) : 0, ask: t > 3.6 ? fx.E(t, 3.8, 4.4) : 0, m: t > 3.5 ? m : null, mO: MGR }; } },
        { title: 'ONE EARBUD ONLY', sub: 'Keep the other ear open', dur: 7, cam: C3, tag: 'REAL SPEED', key: [],
          cap: ['One earbud on the shop floor', 'Hear your surroundings and alarms'],
          big: { n: 'ONE', label: 'earbud on the floor', pos: 'right' },
          s: function (t, fx) { return { run: 1, lampOn: t > 2.4, a: still(19, 21, 1), aO: ext(ME, { arm: 'write' }), ear: t > 0.8 ? 1 : 0 }; } }
      ] });
  })();

  /* ================================================================ 6.8 Personal Data Changes */
  (function () {
    var R = { X: 44, Y: 30, H: 22, style: 'grid', a: '#2d3330', b: '#343c37', tint: '#8a7f5f', wall: 'panel' };
    function house(L, x, y, bad) {
      L.add([x, y, 0, x + 9, y + 9, 10], function (g) { g.isoBox(x + 1, y + 1, 0, 7, 7, 6, 'cream'); g.isoBox(x, y, 6, 9, 9, 2, bad ? 'card' : 'red'); g.isoBox(x + 2, y + 2, 8, 5, 5, 2, bad ? 'card' : 'red'); g.isoPanel('y', y + 8, x + 3, 0, 2, 4, bad ? P.st1 : P.blueS); });
    }
    function world(g, fx, S, t) {
      room(g, 'c68', R);
      var L = g.list();
      L.prop('counter', 20, 4, 0, { w: 20, top: 'cream' }); L.prop('monitor', 21, 5, 11, { rows: 2 });
      if (S.form) L.prop('docs', 31, 6, 11, { n: 2, stamp: S.stamp });
      if (S.stub) L.prop('paystub', 29, 5, 11, { rows: Math.min(4, S.stub), total: S.stub > 4 ? 1 : 0 });
      house(L, 3, 12, S.badHouse); house(L, 3, 22, false);
      if (S.m) L.person(S.m.x, S.m.y, S.m.dir, S.mO);
      if (S.a) person(L, fx, S.a, S.aO);
      L.flush();
      if (S.mailOld) g.isoArrowFlow([[22, 14], [14, 15], [13, 16]], t, { color: P.redT, z: 1, len: 2, gap: 3, speed: 9 });
      if (S.mailNew) g.isoArrowFlow([[22, 16], [16, 26], [13, 26]], t, { color: '#6ad79f', z: 1, len: 2, gap: 3, speed: 9 });
      if (S.no) sticker(g, 7, 16, 16, 'no', S.no);
      if (S.ok) sticker(g, S.okx || 7, S.oky || 26, 16, 'ok', S.ok);
      if (S.ask) sticker(g, 29, 14, 22, 'ask', S.ask);
    }
    var C1 = cam(28, 12, 0, 120, 100, 2), C2 = cam(32, 8, 6, 120, 96, 2), C3 = cam(14, 20, 0, 82, 98, 2);
    reg({ id: '6.8', title: 'Personal Data Changes', std: 'Handbook, 6.8 Personal Data Changes',
      blurb: 'Keep your address, phone number and tax withholding current with HR so your mail and benefits reach you.',
      backdrop: ['stripes', '#161812', '#1d2118'], world: world, chips: ['Contact info', 'Tax status', 'Mail'],
      steps: [
        { title: 'KEEP HR UPDATED', sub: 'Address and phone number', dur: 7, cam: C1, tag: 'REAL SPEED', key: ['counter'],
          cap: ['Give HR your current address', 'And your telephone number'],
          s: function (t, fx) { var a = fx.walk([[34, 22], [28, 15]], t, 0.3, 1.8, { endDir: 3 });
            return { m: { x: 28, y: 2, dir: 1 }, mO: ext(PNK, { arm: t > 3.2 ? 'write' : 'down' }), a: a, aO: ext(ME, { arm: t > 2.2 && t < 3.4 ? 'out' : 'down', hold: t > 2.2 && t < 3.4 ? P.paper : undefined, holdSize: [3, 3] }), form: t > 3.4, stamp: t > 4.6, ok: fx.E(t, 4.8, 5.4), okx: 30, oky: 10 }; } },
        { title: 'TAX WITHHOLDING TOO', sub: 'Tell HR about any change', dur: 7, cam: C2, tag: 'REAL SPEED', key: ['counter'],
          cap: ['Tell HR if your tax withholding changes', 'Contact HR to make the change'],
          s: function (t, fx) { return { m: { x: 28, y: 2, dir: 1 }, mO: ext(PNK, { arm: t > 3 ? 'write' : 'down' }), a: still(28, 15, 3), aO: ext(ME, { arm: 'down' }), stub: Math.floor(fx.E(t, 1.0, 4.0) * 5), ask: t > 0.8 && t < 4.6 ? fx.E(t, 0.8, 1.4) : 0 }; } },
        { title: 'OLD INFO, LATE MAIL', sub: 'W-2 and other mail can be delayed', dur: 7, cam: C3, tag: 'REAL SPEED', key: [],
          cap: ['Old information can delay your mail', 'HR updates it, mail follows you'],
          big: { n: 'W-2', label: 'mail can be late', pos: 'right' },
          s: function (t, fx) { var late = t < 3.4;
            return { badHouse: late, m: { x: 28, y: 2, dir: 1 }, mO: PNK, mailOld: late, mailNew: !late, no: late ? fx.E(t, 1.2, 1.8) : 0, ok: !late ? fx.E(t, 4.0, 4.6) : 0 }; } }
      ] });
  })();

  /* ================================================================ 6.9 Security */
  (function () {
    var R = { X: 40, Y: 30, H: 24, style: 'checker', a: '#2a2d33', b: '#31353d', tint: '#7d858c', wall: 'tile' };
    function lock(L, x, y, z, k) { if (k <= 0) return; L.add([x, y, z, x + 2, y + 1, z + 2], function (g) { g.isoBox(x, y, z, 2, 1, 2, 'amber', { rim: false }); }); }
    function world(g, fx, S, t) {
      room(g, 'c69', R);
      var L = g.list();
      lockers(L, 2, 1, 3, -1);
      L.prop('rolldoor', 22, 0, 0, { w: 14, h: 18, open: S.doorOpen || 0 });
      L.prop('desk', 4, 12, 0, { w: 14, d: 8 }); L.prop('monitor', 6, 13, 9, { rows: 2 });
      lock(L, 8, 20, 7, S.l1); lock(L, 7, 6, 12, S.l2); lock(L, 28, 2, 6, S.l3);
      if (S.key) L.box(S.key[0], S.key[1], 0, 2, 1, 1, 'amber', { rim: false });
      if (S.a) person(L, fx, S.a, S.aO);
      if (S.m) L.person(S.m.x, S.m.y, S.m.dir, S.mO);
      if (S.v) person(L, fx, S.v, S.vO);
      L.flush();
      if (S.l1 > 0) sticker(g, 9, 17, 18, 'ok', S.l1); if (S.l2 > 0) sticker(g, 8, 4, 28, 'ok', S.l2); if (S.l3 > 0) sticker(g, 29, 4, 24, 'ok', S.l3);
      if (S.ask) sticker(g, S.askx, S.asky, 28, 'ask', S.ask);
      if (S.no) sticker(g, S.nox, S.noy, 28, 'no', S.no);
    }
    var C1 = cam(16, 14, 0, 120, 100, 2), C2 = cam(26, 22, 0, 120, 100, 2), C3 = cam(22, 18, 0, 82, 98, 2);
    reg({ id: '6.9', title: 'Security', std: 'Handbook, 6.9 Security',
      blurb: 'Lock up when you leave, report lost keys at once, and tell your manager about any security risk.',
      backdrop: ['diag', '#151a14', '#1c2319'], world: world, chips: ['Lock up', 'Lost keys', 'Speak up'],
      steps: [
        { title: 'LOCK UP WHEN YOU LEAVE', sub: 'Desks, lockers and doors', dur: 7, cam: C1, tag: 'REAL SPEED', key: [],
          cap: ['Lock desks, lockers and doors', 'That protect valuable material'],
          s: function (t, fx) { var a = fx.walk([[12, 24], [24, 24], [26, 12], [26, 8]], t, 0.4, 5.6, { endDir: 3 });
            return { a: a, aO: ext(ME, { arm: 'down' }), l1: fx.E(t, 1.0, 1.6), l2: fx.E(t, 2.6, 3.2), l3: fx.E(t, 5.0, 5.6) }; } },
        { title: 'LOST KEY? TELL NOW', sub: 'Report lost keys and passes', dur: 7, cam: C2, tag: 'REAL SPEED', key: [],
          cap: ['Report a lost key or pass', 'Tell your manager immediately'],
          s: function (t, fx) { var m = fx.walk([[38, 26], [32, 22]], t, 2.4, 3.8, { endDir: 2 });
            return { l1: 1, l2: 1, l3: 1, key: [15, 25], a: still(24, 22, 0), aO: ext(ME, { arm: t > 3.8 ? 'out' : 'down' }), m: t > 2.2 ? m : null, mO: MGR, ask: fx.E(t, 0.8, 1.4), askx: 25, asky: 22 }; } },
        { title: 'SPOT A RISK? SPEAK UP', sub: 'Keep alarms and passwords private', dur: 7, cam: C3, tag: 'REAL SPEED', key: [],
          cap: ['Tell your manager about any risk', 'Do not share alarms or passwords outside'],
          big: { n: 'NOW', label: 'tell your manager', pos: 'right' },
          s: function (t, fx) { var v = fx.walk([[30, 22], [30, 14]], t, 0.3, 1.8, { endDir: 1 });
            return { doorOpen: t > 0.2 ? 0.4 : 0, l1: 1, l2: 1, l3: 1, v: v, vO: ext(VIS, { hat: '#16191c' }), ask: fx.E(t, 2.0, 2.6), askx: 30, asky: 14, a: still(22, 22, 2), aO: ext(ME, { arm: t > 3.0 ? 'out' : 'down' }), m: { x: 14, y: 22, dir: 0 }, mO: MGR }; } }
      ] });
  })();

  function rack(L, x, y, t, seed) {
    L.add([x, y, 0, x + 6, y + 6, 24], function (g) {
      g.isoBox(x, y, 0, 6, 6, 24, 'dark');
      for (var i = 0; i < 6; i++) { g.isoPanel('y', y + 6, x + 1, 3 + i * 3, 4, 2, '#0c0e10'); g.isoPanel('y', y + 6, x + 1 + ((i + seed) % 3), 3 + i * 3, 1, 1, Math.floor(t * 3 + i * 2 + seed) % 3 ? P.green : P.amber); }
    });
  }

  /* ================================================================ 6.10 Social Media */
  (function () {
    var R = { X: 36, Y: 30, H: 22, style: 'epoxy', a: '#22313a', b: '#283a45', tint: '#5f8cbf', wall: 'panel', zones: [[22, 20, 12, 8, '#2a3a2c']] };
    function world(g, fx, S, t) {
      room(g, 'c610', R);
      var L = g.list();
      L.prop('board', 16, 0, 4, { w: 18, h: 18, rows: 6, show: S.rows, lit: S.lit });
      L.prop('desk', 4, 4, 0, { w: 14, d: 10 }); L.prop('monitor', 6, 5, 9, { rows: 3 });
      if (S.a) person(L, fx, S.a, S.aO);
      if (S.v) person(L, fx, S.v, S.vO);
      if (S.m) L.person(S.m.x, S.m.y, S.m.dir, S.mO);
      L.flush();
      if (S.post) g.isoBeam(10, 6, 16, 24, 2, 14, P.redT, t);
      if (S.ask) sticker(g, 25, 2, 28, 'ask', S.ask);
      if (S.no) sticker(g, S.nox, S.noy, 28, 'no', S.no);
      if (S.ok) sticker(g, S.okx, S.oky, 28, 'ok', S.ok);
    }
    var C1 = cam(20, 10, 4, 120, 100, 2), C2 = cam(24, 14, 0, 120, 100, 2), C3 = cam(24, 22, 0, 82, 98, 2);
    reg({ id: '6.10', title: 'Social Media', std: 'Handbook, 6.10 Social Media',
      blurb: 'You are responsible for what you post. Speak for yourself, never for ADVANCED, and keep company secrets private. At work, use social media on breaks.',
      backdrop: ['bands', '#10171c', '#17222a'], world: world, chips: ['Your posts', 'Your voice', 'At work'],
      steps: [
        { title: 'YOU OWN YOUR POSTS', sub: 'You are responsible for what you post', dur: 7, cam: C1, tag: 'REAL SPEED', key: ['board'],
          cap: ['You are responsible for what you post', 'Keep company secrets private'],
          s: function (t, fx) { return { a: still(11, 17, 3), aO: ext(ME, { arm: Math.floor(t * 3) % 2 ? 'write' : 'down' }), rows: Math.min(6, Math.floor(fx.E(t, 1.0, 5.0) * 6.9)), post: t > 1.0 && t < 5.4, ask: fx.E(t, 5.2, 5.8) }; } },
        { title: 'SPEAK FOR YOURSELF', sub: 'Never for ADVANCED', dur: 7, cam: C2, tag: 'REAL SPEED', key: [],
          cap: ['Do not speak for ADVANCED', 'Media goes to Sr. Leadership or H.R.'],
          s: function (t, fx) { var v = fx.walk([[36, 24], [27, 20]], t, 0.3, 1.8, { endDir: 2 });
            return { rows: 6, a: still(19, 20, 0), aO: ext(ME, { arm: t > 2.2 ? 'out' : 'down' }), v: v, vO: ext(VIS, { hold: '#7d858c', holdSize: [2, 3], arm: t > 1.8 ? 'out' : 'down' }), no: fx.E(t, 2.6, 3.2), nox: 23, noy: 20, m: { x: 33, y: 8, dir: 2 }, mO: ext(MGR, { arm: t > 4.4 ? 'out' : 'down' }), ok: fx.E(t, 4.8, 5.4), okx: 33, oky: 8 }; } },
        { title: 'AT WORK: BREAKS ONLY', sub: 'Unless it is work related', dur: 7, cam: C3, tag: 'REAL SPEED', key: [],
          cap: ['Break times only, during work hours', 'Work use needs your manager\'s OK'],
          big: { n: 'BREAKS', label: 'for social media', pos: 'right' },
          s: function (t, fx) { var a = fx.walk([[16, 22], [27, 24]], t, 2.4, 4.0, { endDir: 0 });
            return { rows: 6, a: a, aO: ext(ME, { hold: '#14171a', holdSize: [2, 3], arm: 'out' }), no: t < 2.4 ? fx.E(t, 0.8, 1.4) : 0, nox: 17, noy: 22, ok: t > 4.2 ? fx.E(t, 4.4, 5.0) : 0, okx: 28, oky: 24 }; } }
      ] });
  })();

  /* ================================================================ 6.11 Third Party Disclosures */
  (function () {
    var R = { X: 40, Y: 30, H: 24, style: 'checker', a: '#3a3a35', b: '#40403a', tint: '#b0605f', wall: 'panel' };
    function world(g, fx, S, t) {
      room(g, 'c611', R);
      var L = g.list();
      L.prop('counter', 8, 6, 0, { w: 14, top: 'cream' }); phone(L, 11, 8, 11, S.ring);
      L.prop('desk', 28, 4, 0, { w: 12, d: 8 }); phone(L, 31, 6, 9, S.hrOn);
      if (S.a) L.person(S.a.x, S.a.y, S.a.dir, S.aO);
      if (S.h) L.person(34, 2, 1, ext(PNK, { arm: S.hrOn ? 'up' : 'down' }));
      if (S.c1) person(L, fx, S.c1, S.c1O);
      if (S.c2) person(L, fx, S.c2, S.c2O);
      if (S.c3) person(L, fx, S.c3, S.c3O);
      L.flush();
      if (S.ring) { var p = g.proj(12, 9, 12); g.ring(p[0], p[1], 10, t * 1.2, P.redT, 0.5); }
      if (S.flow) g.isoArrowFlow([[13, 15], [26, 15], [30, 11]], t, { color: '#6ad79f', z: 1, len: 3, gap: 3, speed: 10 });
      if (S.no) sticker(g, 15, 4, 28, 'no', S.no);
      if (S.ok) sticker(g, 34, 2, 28, 'ok', S.ok);
    }
    var C1 = cam(16, 14, 0, 120, 100, 2), C2 = cam(15, 8, 0, 120, 108, 2), C3 = cam(22, 12, 0, 84, 106, 2);
    reg({ id: '6.11', title: 'Third Party Disclosures', std: 'Handbook, 6.11 Third Party Disclosures',
      blurb: 'If an outsider calls about a news story or a legal matter, do not speak for ADVANCED. Refer the call to HR.',
      backdrop: ['stripes', '#191513', '#211b17'], world: world, chips: ['Callers', 'Do not answer', 'Refer to HR'],
      steps: [
        { title: 'OUTSIDE CALLERS', sub: 'News, lawyers, law enforcement', dur: 7, cam: C1, tag: 'REAL SPEED', key: ['counter'],
          cap: ['Outsiders may call about a news story', 'Or about a legal matter'],
          s: function (t, fx) { return { a: { x: 15, y: 4, dir: 1 }, aO: ext(ME, { arm: 'down' }), ring: t > 4.2,
            c1: fx.walk([[34, 19], [8, 22]], t, 0.3, 1.7, { endDir: 3 }), c1O: ext(VIS, { hold: P.paper, holdSize: [3, 3] }), c2: t > 1.3 ? fx.walk([[34, 19], [16, 22]], t, 1.4, 2.8, { endDir: 3 }) : null, c2O: ext(GRY, { hold: '#6b4a2a', holdSize: [3, 3] }), c3: t > 2.4 ? fx.walk([[34, 19], [24, 22]], t, 2.5, 3.9, { endDir: 3 }) : null, c3O: ext(who('#2b4f78', '#2b2018', P.skin2, { hat: '#2b4f78' })) }; } },
        { title: 'DO NOT SPEAK FOR US', sub: 'Do not give the company position', dur: 7, cam: C2, tag: 'REAL SPEED', key: ['counter'],
          cap: ['Do not speak for ADVANCED', 'Do not give the company position'],
          s: function (t, fx) { return { a: { x: 15, y: 4, dir: 1 }, aO: ext(ME, { arm: t > 1 ? 'up' : 'down' }), ring: t < 1, c1: still(8, 22, 3), c1O: ext(VIS, { hold: P.paper, holdSize: [3, 3] }), c2: still(16, 22, 3), c2O: ext(GRY, { hold: '#6b4a2a', holdSize: [3, 3] }), no: fx.E(t, 1.6, 2.2) }; } },
        { title: 'REFER THE CALL TO HR', sub: 'HR gives the answer', dur: 7, cam: C3, tag: 'REAL SPEED', key: ['desk'],
          cap: ['Refer the call to HR', 'Ask HR if you are not sure'],
          big: { n: 'HR', label: 'takes the call', pos: 'right' },
          s: function (t, fx) { return { a: { x: 15, y: 4, dir: 1 }, aO: ext(ME, { arm: t > 0.6 ? 'out' : 'down' }), h: 1, hrOn: t > 2.4, flow: t > 1.2 && t < 5.4, ok: fx.E(t, 3.2, 3.8) }; } }
      ] });
  })();

  /* ================================================================ 6.12 Use of Company Technology */
  (function () {
    var R = { X: 40, Y: 30, H: 26, style: 'grid', a: '#1b2a2a', b: '#223434', tint: '#3fbf7f', wall: 'tile' };
    function camera(L, x, y, z) { L.add([x, y, z, x + 5, y + 3, z + 3], function (g) { g.isoBox(x, y, z, 5, 3, 3, 'dark'); g.isoPanel('y', y + 3, x + 1, z + 1, 2, 1, P.redT); }); }
    function world(g, fx, S, t) {
      room(g, 'c612', R);
      var L = g.list();
      rack(L, 30, 1, t, 0); rack(L, 37, 1, t, 1);
      L.prop('desk', 4, 4, 0, { w: 22, d: 10 }); L.prop('monitor', 5, 5, 9, { rows: 3 }); L.prop('printer', 17, 6, 9, { out: 0, lit: S.pr }); phone(L, 14, 8, 9, S.ph);
      camera(L, 22, 1, 16); L.prop('scanner', 26, 1, 8, { lit: S.card });
      if (S.a) person(L, fx, S.a, S.aO);
      L.flush();
      if (S.beam) { var b = g.proj(24, 3, 15), q = g.proj(11, 14, 12); g.line(b[0], b[1], q[0], q[1], P.redT, 2, Math.floor(t * 10)); g.line(b[0], b[1], g.proj(10, 6, 14)[0], g.proj(10, 6, 14)[1], P.redT, 2, Math.floor(t * 10)); }
      if (S.flow) g.isoBeam(10, 6, 16, 32, 6, 16, '#6ad79f', t);
      if (S.ringAt) { var r = S.ringAt, p = g.proj(r[0], r[1], r[2]); g.ring(p[0], p[1], 9, t * 0.9, P.redT, 0.5); }
      if (S.no) sticker(g, 14, 16, 26, 'no', S.no);
      if (S.ask) sticker(g, 11, 14, 28, 'ask', S.ask);
    }
    var C1 = cam(18, 8, 4, 120, 100, 2), C2 = cam(20, 10, 4, 120, 104, 2), C3 = cam(16, 10, 4, 82, 98, 2);
    var RINGS = [[9, 6, 16], [15, 9, 10], [21, 10, 8], [24, 3, 16], [28, 2, 10]];
    reg({ id: '6.12', title: 'Use of Company Technology', std: 'Handbook, 6.12 Use of Company Technology',
      blurb: 'Company systems are for business use and belong to ADVANCED. ADVANCED may monitor them, so do not expect privacy.',
      backdrop: ['diag', '#0f1a18', '#152421'], world: world, chips: ['Systems', 'Business only', 'Monitored'],
      steps: [
        { title: 'COMPANY SYSTEMS', sub: 'Email, phones, printers, cameras', dur: 7, cam: C1, tag: 'REAL SPEED', key: [],
          cap: ['Email, phones and printers', 'Cameras and key cards too'],
          notes: [note(C1, 9, 6, 22, 1.0, 2.2, 'Email', 0, -4), note(C1, 15, 9, 16, 2.2, 3.4, 'Phones', 0, -4), note(C1, 21, 10, 14, 3.4, 4.6, 'Printers', 0, -6), note(C1, 24, 3, 22, 4.6, 6.0, 'CCTV', 0, -6)],
          s: function (t, fx) { var k = t < 1.0 ? -1 : t < 2.2 ? 0 : t < 3.4 ? 1 : t < 4.6 ? 2 : t < 6.0 ? 3 : 4;
            return { a: still(11, 16, 3), aO: ext(ME, { arm: 'write' }), ph: k === 1, pr: k === 2, card: k === 4, ringAt: k >= 0 && k < 5 ? RINGS[k] : null }; } },
        { title: 'BUSINESS USE ONLY', sub: 'All content belongs to ADVANCED', dur: 7, cam: C2, tag: 'REAL SPEED', key: ['desk'],
          cap: ['Use company systems for business', 'All content is ADVANCED property'],
          s: function (t, fx) { return { a: still(11, 16, 3), aO: ext(ME, { arm: 'write' }), flow: t > 1.0, no: t > 3.4 ? fx.E(t, 3.6, 4.2) : 0 }; } },
        { title: 'ADVANCED CAN MONITOR', sub: 'No expectation of privacy', dur: 7, cam: C3, tag: 'REAL SPEED', key: ['desk'],
          cap: ['ADVANCED may review all use', 'A password does not make it private'],
          big: { n: 'NO', label: 'privacy', pos: 'right' },
          s: function (t, fx) { return { a: still(11, 16, 3), aO: ext(ME, { arm: 'write' }), beam: t > 0.8, ask: fx.E(t, 2.4, 3.0) }; } }
      ] });
  })();

  /* ================================================================ 6.13 Workplace Privacy and Right to Inspect */
  (function () {
    var R = { X: 42, Y: 30, H: 24, style: 'epoxy', a: '#2b2f2a', b: '#323730', tint: '#8f979e', wall: 'studs' };
    function world(g, fx, S, t) {
      room(g, 'c613', R);
      var L = g.list();
      lockers(L, 2, 1, 4, S.open);
      L.prop('desk', 24, 2, 0, { w: 14, d: 10 }); L.prop('monitor', 26, 3, 9, { rows: 2 });
      L.prop('cart', 26, 20, 0, { col: 'card' });
      
      if (S.a) person(L, fx, S.a, S.aO);
      if (S.m) person(L, fx, S.m, S.mO);
      L.flush();
      if (S.bag) { g.isoPanel('y', 6, 11, 5, 2, 4, '#a07a52'); g.isoPanel('y', 6, 11, 9, 2, 1, '#cfa371'); }
      if (S.tags) { if (S.tags > 0) tagAt(g, 10, 4, 28, 1); if (S.tags > 1) tagAt(g, 31, 6, 26, 1); if (S.tags > 2) tagAt(g, 33, 24, 20, 1); }
      if (S.ask) sticker(g, S.askx, S.asky, 30, 'ask', S.ask);
    }
    var C1 = cam(18, 12, 0, 120, 100, 2), C2 = cam(8, 10, 0, 120, 100, 2), C3 = cam(14, 14, 0, 82, 98, 2);
    reg({ id: '6.13', title: 'Workplace Privacy and Right to Inspect', std: 'Handbook, 6.13 Workplace Privacy and Right to Inspect',
      blurb: 'Lockers, desks, vehicles and machines belong to ADVANCED and can be inspected at any time without notice.',
      backdrop: ['bands', '#141714', '#1b201b'], world: world, chips: ['Company property', 'Your things', 'Inspection'],
      steps: [
        { title: 'COMPANY PROPERTY', sub: 'Lockers, desks, vehicles, machines', dur: 7, cam: C1, tag: 'REAL SPEED', key: [],
          cap: ['These belong to ADVANCED', 'They stay under company control'],
          s: function (t, fx) { return { tags: t < 1.2 ? 0 : t < 2.6 ? 1 : t < 4.0 ? 2 : 3 }; } },
        { title: 'YOUR THINGS, YOUR RISK', sub: 'No company responsibility for loss', dur: 7, cam: C2, tag: 'REAL SPEED', key: ['lamp'],
          cap: ['We assume no responsibility', 'For your things in lockers and desks'],
          s: function (t, fx) { var a = fx.walk([[14, 12], [11, 9]], t, 0.4, 1.6, { endDir: 3 }); var inside = t > 3.4;
            return { a: a, aO: ext(ME, { arm: t > 1.8 && t < 3.4 ? 'out' : 'down', hold: t > 1.8 && t < 3.4 ? '#a07a52' : undefined, holdSize: [3, 3] }), open: t > 1.8 ? 2 : -1, bag: inside, ask: inside ? fx.E(t, 3.6, 4.2) : 0, askx: 11, asky: 4 }; } },
        { title: 'INSPECTED ANY TIME', sub: 'No notice, and you need not be there', dur: 7, cam: C3, tag: 'REAL SPEED', key: [],
          cap: ['ADVANCED may inspect at any time', 'Without notice or your presence'],
          big: { n: 'ANY', label: 'time, without notice', pos: 'right' },
          s: function (t, fx) { var m = fx.walk([[14, 12], [10, 9]], t, 0.4, 1.8, { endDir: 3 });
            return { a: still(22, 26, 0), aO: ext(ME, { arm: 'write' }), m: m, mO: ext(MGR, { arm: t > 2 ? 'out' : 'down' }), open: t > 2.2 ? 2 : -1, bag: true, ask: fx.E(t, 3.6, 4.2), askx: 11, asky: 4 }; } }
      ] });
  })();

  /* ================================================================ Access to Personnel and Medical Records Files */
  (function () {
    var R = { X: 42, Y: 30, H: 24, style: 'checker', a: '#2e2c2c', b: '#363333', tint: '#a8781f', wall: 'panel' };
    function safe(L, x, y, lit, open) {
      L.add([x, y, 0, x + 8, y + 8, 16], function (g) { g.isoBox(x, y, 0, 8, 8, 16, 'dark'); g.isoPanel('y', y + 8, x + 1, 2, 6, 12, { fill: open ? '#0c0e10' : '#31363b', border: P.st2 }); g.isoPanel('y', y + 8, x + 5, 7, 1, 2, lit ? P.red : P.st3); });
    }
    function world(g, fx, S, t) {
      room(g, 'c6ok', R);
      var L = g.list();
      L.prop('cabinet', 3, 1, 0); L.prop('cabinet', 11, 1, 0); L.prop('cabinet', 19, 1, 0);
      safe(L, 32, 2, S.lock, S.safeOpen);
      L.glass(29, 0, 0, 13, 13, 20, 'silver', { dens: 0.1, topDens: 0, edge: '#7d858c' });
      L.prop('desk', 6, 16, 0, { w: 14, d: 8 }); if (S.docs) L.prop('docs', 10, 18, 9, { n: 2, head: P.blueS });
      if (S.a) person(L, fx, S.a, S.aO);
      if (S.m) person(L, fx, S.m, S.mO);
      if (S.h) L.person(S.h.x, S.h.y, S.h.dir, S.hO);
      L.flush();
      if (S.hl1) { var p = g.proj(14, 8, 14); g.ring(p[0], p[1], 14, t * 0.8, P.blueL, 0.5); }
      if (S.hl2) { var q = g.proj(36, 7, 10); g.ring(q[0], q[1], 14, t * 0.8, P.redT, 0.5); }
      if (S.no) sticker(g, 36, 12, 24, 'no', S.no);
      if (S.ok) sticker(g, S.okx || 14, S.oky || 11, 26, 'ok', S.ok);
    }
    var C1 = cam(22, 8, 4, 120, 100, 2), C2 = cam(24, 10, 0, 120, 100, 2), C3 = cam(14, 20, 0, 82, 98, 2);
    reg({ id: 'OK-Access to Personnel and Medica', title: 'Access to Personnel and Medical Records Files', std: 'Handbook, Access to Personnel and Medical Records Files',
      blurb: 'Medical files and personnel files are kept apart. Medical records are need-to-know only. You can review your own files with notice, and HR answers outside requests.',
      backdrop: ['stripes', '#171412', '#1e1a16'], world: world, chips: ['Two files', 'Who sees', 'Your file'],
      steps: [
        { title: 'TWO SEPARATE FILES', sub: 'Personnel and medical', dur: 7, cam: C1, tag: 'REAL SPEED', key: [],
          cap: ['Personnel files and medical files', 'Are kept apart'],
          notes: [note(C1, 15, 9, 20, 1.0, 6.8, 'Personnel', 0, 0), note(C1, 36, 6, 20, 2.4, 6.8, 'Medical', 0, 0)],
          s: function (t, fx) { return { hl1: t > 1.0, hl2: t > 2.4, lock: t > 3.4 }; } },
        { title: 'NEED TO KNOW', sub: 'Medical files stay locked up', dur: 7, cam: C2, tag: 'REAL SPEED', key: [],
          cap: ['Medical records: need to know only', 'Managers may see personnel files'],
          s: function (t, fx) { var m = fx.walk([[24, 24], [24, 12]], t, 0.4, 2.0, { endDir: 3 }); var m2 = fx.walk([[24, 12], [36, 16]], t, 3.6, 5.0, { endDir: 0 });
            return { lock: true, m: t < 3.4 ? m : m2, mO: MGR, ok: t < 3.4 ? fx.E(t, 2.2, 2.8) : 0, okx: 15, oky: 9, no: t > 5.0 ? fx.E(t, 5.2, 5.8) : 0 }; } },
        { title: 'REVIEW YOUR OWN FILE', sub: 'Reasonable notice, with a representative', dur: 7, cam: C3, tag: 'REAL SPEED', key: ['desk'],
          cap: ['Give the Company reasonable notice', 'A representative stays with you'],
          big: { n: 'HR', label: 'outside requests', pos: 'right' },
          s: function (t, fx) { var a = fx.walk([[18, 29], [13, 27]], t, 0.4, 1.6, { endDir: 3 });
            return { lock: true, a: a, aO: ext(ME, { arm: t > 2 ? 'out' : 'down' }), h: { x: 13, y: 13, dir: 1 }, hO: ext(PNK, { arm: t > 2.6 ? 'write' : 'down' }), docs: t > 1.8, ok: fx.E(t, 3.4, 4.0), okx: 13, oky: 20 }; } }
      ] });
  })();

  function chairBox(L, x, y, mat) {
    L.add([x, y, 0, x + 6, y + 6, 12], function (g) { g.isoBox(x, y, 0, 6, 6, 4, mat || 'blue'); g.isoBox(x, y, 4, 2, 6, 8, mat || 'blue'); });
  }
  function rugAt(g, x, y, w, d, k, col, base) { g.isoTile(x, y, w, d, base || P.floorLine, 0); if (k > 0) g.isoTile(x, y, Math.max(1, Math.round(w * k)), d, col, 0); }

  /* ================================================================ 7.1 Simple IRA */
  (function () {
    var R = { X: 38, Y: 30, H: 24, style: 'grid', a: '#2a3028', b: '#313930', tint: '#3fbf7f', wall: 'studs' };
    function world(g, fx, S, t) {
      room(g, 'c71', R);
      var L = g.list();
      L.prop('board', 4, 0, 4, { w: 14, h: 16, rows: 6, done: S.done, lit: S.lit });
      L.prop('desk', 20, 4, 0, { w: 16, d: 8 }); L.prop('monitor', 22, 5, 9, { rows: 2 });
      if (S.book) L.prop('docs', 30, 6, 9, { n: 2, w: 5, d: 4, head: P.blueS });
      if (S.letter) L.prop('docs', S.letter[0], S.letter[1], S.letter[2], { n: 1, w: 4, d: 3, head: P.red });
      if (S.h) L.person(28, 2, 1, ext(PNK, { arm: S.hArm || 'down' }));
      if (S.a) person(L, fx, S.a, S.aO);
      L.flush();
      if (S.flow) g.isoArrowFlow([[30, 12], [24, 16], [14, 18]], t, { color: P.redT, z: 1, len: 2, gap: 3, speed: 9 });
      if (S.ask) sticker(g, 10, 14, 28, 'ask', S.ask);
      if (S.ok) sticker(g, S.okx || 14, S.oky || 18, 28, 'ok', S.ok);
    }
    var C1 = cam(12, 8, 6, 120, 100, 2), C2 = cam(22, 14, 0, 120, 100, 2), C3 = cam(26, 14, 0, 82, 98, 2);
    reg({ id: '7.1', title: 'Simple IRA', std: 'Handbook, 7.1 Simple IRA',
      blurb: 'Eligible employees may join the Simple IRA plan after any waiting period. ADVANCED tells you when you are eligible. Contact HR with questions.',
      backdrop: ['diag', '#12181a', '#192226'], world: world, chips: ['Eligible', 'Notice', 'Details'],
      steps: [
        { title: 'ELIGIBLE EMPLOYEES', sub: 'After any waiting period', dur: 7, cam: C1, tag: 'REAL SPEED', key: ['board'],
          cap: ['Eligible employees may join', 'After any waiting period in the plan'],
          s: function (t, fx) { return { a: still(11, 14, 3), aO: ext(ME, { arm: 'down' }), done: Math.floor(fx.E(t, 1.0, 5.0) * 6.9), ask: fx.E(t, 5.2, 5.8) }; } },
        { title: 'ADVANCED TELLS YOU', sub: 'You are notified if eligible', dur: 7, cam: C2, tag: 'REAL SPEED', key: ['desk'],
          cap: ['ADVANCED will notify you', 'If you are eligible'],
          s: function (t, fx) { var a = fx.walk([[18, 22], [16, 18]], t, 0.3, 1.2, { endDir: 3 });
            return { h: 1, hArm: t > 1.2 && t < 3.0 ? 'write' : 'down', letter: t > 3.0 ? null : [32, 6, 9], flow: t > 3.0 && t < 5.4, a: a, aO: ext(ME, { arm: t > 5.4 ? 'out' : 'down', hold: t > 5.4 ? P.paper : undefined, holdSize: [3, 3] }), ok: fx.E(t, 5.6, 6.2), okx: 16, oky: 18, done: 6 }; } },
        { title: 'READ YOUR SPD', sub: 'Summary Plan Description', dur: 7, cam: C3, tag: 'REAL SPEED', key: ['desk'],
          cap: ['Read your Summary Plan Description', 'Contact HR about eligibility'],
          big: { n: 'HR', label: 'for eligibility', pos: 'right' },
          s: function (t, fx) { return { h: 1, hArm: t > 2 ? 'out' : 'down', book: t > 0.6, a: still(28, 14, 3), aO: ext(ME, { arm: t > 1.4 ? 'out' : 'down' }), ok: fx.E(t, 3.4, 4.0), okx: 31, oky: 8, done: 6 }; } }
      ] });
  })();

  /* ================================================================ 7.2 Bereavement Leave */
  (function () {
    var R = { X: 34, Y: 28, H: 22, style: 'checker', a: '#2b2a29', b: '#323130', tint: '#8fb4d9', wall: 'panel' };
    function world(g, fx, S, t) {
      room(g, 'c72', R);
      if (S.bar >= 0) rugAt(g, 5, 18, 24, 3, S.bar, '#3fbf7f');
      var L = g.list();
      if (S.desk) { L.prop('desk', 14, 4, 0, { w: 14, d: 8 }); if (S.docs) L.prop('docs', 18, 6, 9, { n: 2, head: P.blueS }); }
      L.cyl(31, 5, 0, 2, 7, '#3fbf7f', { rim: false }); L.cyl(31, 5, 7, 2, 3, 'green', { rim: false });
      if (S.day1) L.prop('docs', 8, 24, 0, { n: 1, w: 5, d: 4, head: P.red });
      if (S.day2) L.prop('docs', 15, 24, 0, { n: 1, w: 5, d: 4, head: P.red });
      if (S.a) person(L, fx, S.a, S.aO);
      if (S.f) { person(L, fx, S.f[0], S.fO[0]); person(L, fx, S.f[1], S.fO[1]); person(L, fx, S.f[2], S.fO[2]); }
      if (S.m) L.person(S.m.x, S.m.y, S.m.dir, S.mO);
      L.flush();
      if (S.ring) { var p = g.proj(S.ring[0], S.ring[1], 10); g.ring(p[0], p[1], 12, t * 0.9, P.blueL, 0.5); }
      if (S.ok) sticker(g, S.okx, S.oky, 28, 'ok', S.ok);
    }
    var C1 = cam(22, 16, 0, 120, 100, 2), C2 = cam(18, 22, 0, 120, 104, 2), C3 = cam(18, 12, 0, 82, 98, 2);
    var FAM = ['Child', 'Spouse', 'Sister', 'Brother', 'Parents', 'Grandparents'];
    reg({ id: '7.2', title: 'Bereavement Leave', std: 'Handbook, 7.2 Bereavement Leave',
      blurb: 'After 90 days of employment, full-time employees get 2 days of bereavement leave for the death of an immediate family member. Tell your manager as early as you can.',
      backdrop: ['bands', '#14181c', '#1b2127'], world: world, chips: ['Family', '90 days', 'Notice'],
      steps: [
        { title: 'WHO IS FAMILY', sub: 'An immediate family member', dur: 7, cam: C1, tag: 'REAL SPEED', key: [], chips: FAM, chipAt: function (t) { return Math.min(5, Math.floor(t / 1.1)); },
          cap: ['Covers an immediate family member', 'Yours or your spouse\'s'],
          s: function (t, fx) { var k = Math.min(2, Math.floor(t / 2.2));
            return { a: still(8, 16, 0), aO: ext(ME, { arm: 'down' }), f: [still(22, 8, 2), still(22, 16, 2), still(22, 24, 2)], fO: [AMB, ext(PNK, {}), ext(GRY, {})], ring: [22, 8 + k * 8] }; } },
        { title: '90 DAYS, THEN 2 DAYS', sub: 'Full-time employees', dur: 7, cam: C2, tag: 'REAL SPEED', key: [],
          cap: ['After 90 days of employment', 'You get 2 days of leave'],
          notes: [note(C2, 5, 19, 0, 0.8, 4.4, '90 days', 0, -10), note(C2, 12, 24, 0, 4.8, 6.8, '2 days', 0, -10)],
          s: function (t, fx) { return { bar: fx.E(t, 0.8, 4.2), a: still(31, 20, 2), aO: ext(ME, { arm: 'down' }), day1: t > 4.8, day2: t > 5.3 }; } },
        { title: 'TELL YOUR MANAGER', sub: 'Notice as early as you can', dur: 7, cam: C3, tag: 'REAL SPEED', key: ['desk'],
          cap: ['Give notice as far ahead as possible', 'ADVANCED may ask for documents'],
          big: { n: '2', label: 'days of leave', pos: 'right' },
          s: function (t, fx) { var a = fx.walk([[20, 24], [21, 14]], t, 0.3, 1.8, { endDir: 3 });
            return { desk: 1, docs: t > 2.4, a: a, aO: ext(ME, { arm: t > 2 ? 'out' : 'down' }), m: { x: 21, y: 2, dir: 1 }, mO: ext(MGR, { arm: t > 3 ? 'write' : 'down' }), ok: fx.E(t, 4.0, 4.6), okx: 21, oky: 8 }; } }
      ] });
  })();

  /* ================================================================ 7.3 COBRA */
  (function () {
    var R = { X: 44, Y: 30, H: 24, style: 'grid', a: '#262c33', b: '#2d3540', tint: '#5f8cbf', wall: 'tile', zones: [[16, 10, 12, 8, '#161a20']] };
    function world(g, fx, S, t) {
      room(g, 'c73', R);
      var L = g.list(), z1 = S.sink ? -Math.round(S.sink * 5) : 0;
      L.box(4, 8, z1, 12, 14, 3, 'blue'); L.box(28, 8, 0, 12, 14, 3, 'green');
      if (S.bridge > 0) L.box(16, 13, 0, Math.max(1, Math.round(12 * S.bridge)), 4, 2, 'amber');
      if (S.h) L.person(38, 15, 2, ext(PNK, { z: 3, arm: S.hArm || 'down' }));
      person(L, fx, S.a, S.aO);
      L.flush();
      if (S.warn) { var p = g.proj(10, 15, 8); g.ring(p[0], p[1], 14, t * 0.9, P.redT, 0.5); }
      if (S.ok) sticker(g, 32, 15, 30, 'ok', S.ok);
      if (S.no) sticker(g, 10, 20, 26, 'no', S.no);
    }
    var C1 = cam(10, 15, 3, 120, 104, 2), C2 = cam(14, 15, 0, 120, 100, 2), C3 = cam(22, 14, 3, 82, 98, 2);
    reg({ id: '7.3', title: 'COBRA', std: 'Handbook, 7.3 COBRA',
      blurb: 'COBRA lets eligible employees and their beneficiaries keep their health insurance coverage after a qualifying event. Contact HR to learn more.',
      backdrop: ['stripes', '#12161b', '#191f27'], world: world, chips: ['Coverage', 'Event', 'Keep it'],
      steps: [
        { title: 'HEALTH COVERAGE', sub: 'COBRA lets you continue it', dur: 7, cam: C1, tag: 'REAL SPEED', key: [],
          cap: ['You have health insurance coverage', 'Under the ADVANCED health plan'],
          s: function (t, fx) { return { a: still(10, 15, 1), aO: ext(ME, { z: 3, arm: 'out', card: P.red }) }; } },
        { title: 'A QUALIFYING EVENT', sub: 'A change could end coverage', dur: 7, cam: C2, tag: 'SLOWER', key: [],
          cap: ['A qualifying event can end it', 'You may lose eligibility'],
          notes: [note(C2, 10, 15, 30, 0.8, 2.2, 'Reduction in hours', 30, 0), note(C2, 10, 15, 30, 2.2, 3.6, 'Divorce or legal separation', 30, 0), note(C2, 10, 15, 30, 3.6, 5.0, 'Termination of employment', 30, 0), note(C2, 10, 15, 30, 5.0, 6.6, 'Resignation', 30, 0)],
          s: function (t, fx) { var sk = fx.E(t, 1.0, 5.0) * 0.6; return { a: still(10, 15, 1), aO: ext(ME, { z: 3 - Math.round(sk * 5), arm: 'out', card: P.red }), sink: sk, warn: t > 0.8, no: fx.E(t, 5.0, 5.6) }; } },
        { title: 'COBRA KEEPS IT GOING', sub: 'Continue your plan coverage', dur: 7, cam: C3, tag: 'REAL SPEED', key: [],
          cap: ['COBRA gives you a way to continue', 'Contact HR about your COBRA rights'],
          big: { n: 'COBRA', label: 'keeps you covered', pos: 'right' },
          s: function (t, fx) { var a = fx.walk([[10, 15], [29, 15]], t, 2.4, 4.6, { endDir: 0 });
            return { sink: 0, bridge: fx.E(t, 0.6, 2.2), h: 1, hArm: t > 4.8 ? 'out' : 'down', a: a, aO: ext(ME, { z: 3, arm: 'out', card: P.red }), ok: fx.E(t, 5.0, 5.6) }; } }
      ] });
  })();

  /* ================================================================ 7.4 Dental Insurance */
  (function () {
    var R = { X: 30, Y: 26, H: 22, style: 'epoxy', a: '#2c3a40', b: '#33454c', tint: '#8fb4d9', wall: 'tile' };
    function dchair(L, x, y) {
      L.add([x, y, 0, x + 10, y + 7, 16], function (g) { g.isoCyl(x + 5, y + 3, 0, 2, 3, 'steel', { rim: false }); g.isoBox(x + 1, y, 3, 9, 6, 3, 'blue'); g.isoBox(x, y, 6, 3, 6, 9, 'blue'); g.isoBox(x - 0, y + 1, 15, 3, 4, 1, 'blue'); });
    }
    function world(g, fx, S, t) {
      room(g, 'c74', R);
      var L = g.list();
      L.prop('board', 3, 0, 4, { w: 14, h: 14, rows: 5, done: S.done });
      dchair(L, 6, 10);
      L.cyl(18, 9, 0, 1, 18, 'steel', { rim: false }); L.box(16, 7, 18, 5, 4, 2, 'amber', { rim: false });
      L.prop('table', 22, 12, 0, { w: 6, d: 5, h: 7, top: 'silver' });
      if (S.book) L.prop('docs', 22, 13, 7, { n: 2, w: 4, d: 3, head: P.blueS });
      if (S.d) L.person(S.d.x, S.d.y, S.d.dir, S.dO);
      if (S.a) person(L, fx, S.a, S.aO);
      L.flush();
      if (S.lamp) { var p = g.proj(14, 9, 17); g.glow(p[0], p[1], 10, '#f0d9a0', 0.6); }
      if (S.ok) sticker(g, S.okx || 12, S.oky || 18, 28, 'ok', S.ok);
      if (S.ask) sticker(g, 12, 18, 28, 'ask', S.ask);
    }
    var C1 = cam(14, 12, 0, 120, 100, 2), C2 = cam(10, 14, 4, 120, 100, 2), C3 = cam(18, 18, 0, 82, 98, 2);
    reg({ id: '7.4', title: 'Dental Insurance', std: 'Handbook, 7.4 Dental Insurance',
      blurb: 'Regular full-time employees are eligible for the dental plan after its waiting period. The plan details are in the SPD.',
      backdrop: ['bands', '#0f1a1e', '#162428'], world: world, chips: ['Plan', 'Wait', 'Details'],
      steps: [
        { title: 'DENTAL PLAN', sub: 'For regular full-time employees', dur: 7, cam: C1, tag: 'REAL SPEED', key: [],
          cap: ['The company dental plan', 'For regular full-time employees'],
          s: function (t, fx) { return { lamp: t > 1.0, d: { x: 6, y: 20, dir: 0 }, dO: ext(who('#f1ece2', '#3a2c22', P.skin, { glasses: true }), { arm: t > 2 ? 'out' : 'down' }), a: still(14, 20, 2), aO: ext(ME, { arm: 'down' }), ok: fx.E(t, 3.4, 4.0), okx: 10, oky: 20 }; } },
        { title: 'AFTER THE WAIT', sub: 'The plan sets a waiting period', dur: 7, cam: C2, tag: 'REAL SPEED', key: [],
          cap: ['Finish the plan\'s waiting period', 'Then you are eligible'],
          s: function (t, fx) { return { done: Math.floor(fx.E(t, 0.8, 5.0) * 5.9), a: still(10, 8, 3), aO: ext(ME, { arm: 'down' }), ask: t < 5.2 ? fx.E(t, 0.6, 1.2) : 0, ok: t > 5.4 ? fx.E(t, 5.4, 6.0) : 0, okx: 12, oky: 18 }; } },
        { title: 'DETAILS IN THE SPD', sub: 'Summary Plan Description', dur: 7, cam: C3, tag: 'REAL SPEED', key: ['table'],
          cap: ['Benefits are described in the SPD', 'Read the plan for details'],
          big: { n: 'SPD', label: 'has the details', pos: 'right' },
          s: function (t, fx) { var a = fx.walk([[16, 22], [22, 20]], t, 0.3, 1.6, { endDir: 3 });
            return { done: 6, book: t > 1.0, a: a, aO: ext(ME, { arm: t > 1.8 ? 'out' : 'down' }), ok: fx.E(t, 3.0, 3.6), okx: 25, oky: 16 }; } }
      ] });
  })();

  /* ================================================================ 7.5 Vision Care Insurance */
  (function () {
    var R = { X: 30, Y: 26, H: 22, style: 'checker', a: '#262a2a', b: '#2c3232', tint: '#6ad79f', wall: 'panel',
      deco: function (s) { s.isoPanel('x', 0, 5, 5, 14, 15, { fill: '#f1ece2', border: P.st3 }); var w = [9, 7, 6, 4, 3, 2], i; for (i = 0; i < 6; i++) s.isoPanel('x', 0, 12 - Math.round(w[i] / 2), 16 - i * 2, w[i], 1, '#16191c'); } };
    function world(g, fx, S, t) {
      room(g, 'c75', R);
      if (S.bar >= 0) rugAt(g, 6, 20, 20, 3, S.bar, '#3fbf7f');
      var L = g.list();
      chairBox(L, 14, 14, 'green');
      L.prop('table', 18, 4, 0, { w: 10, d: 6, h: 8, top: 'wood' }); L.box(19, 6, 8, 3, 1, 1, 'blue', { rim: false }); L.box(22, 7, 8, 3, 1, 1, 'dark', { rim: false });
      if (S.book) L.prop('docs', 25, 5, 8, { n: 2, w: 3, d: 3, head: P.blueS });
      if (S.d) L.person(S.d.x, S.d.y, S.d.dir, S.dO);
      if (S.a) person(L, fx, S.a, S.aO);
      L.flush();
      if (S.ok) sticker(g, S.okx, S.oky, 28, 'ok', S.ok);
    }
    var C1 = cam(12, 14, 4, 120, 100, 2), C2 = cam(20, 12, 0, 120, 100, 2), C3 = cam(14, 20, 0, 82, 98, 2);
    reg({ id: '7.5', title: 'Vision Care Insurance', std: 'Handbook, 7.5 Vision Care Insurance',
      blurb: 'Regular full-time employees are eligible for the vision care plan after 90 days of employment. The plan details are in the SPD.',
      backdrop: ['stripes', '#0f1a16', '#16241f'], world: world, chips: ['Plan', 'Details', '90 days'],
      steps: [
        { title: 'VISION CARE PLAN', sub: 'A company vision plan', dur: 7, cam: C1, tag: 'REAL SPEED', key: [],
          cap: ['The company vision care plan', 'For regular full-time employees'],
          s: function (t, fx) { return { bar: -1, a: still(8, 14, 2), aO: ext(ME, { arm: 'down' }), d: { x: 22, y: 22, dir: 3 }, dO: ext(who('#f1ece2', '#3a2c22', P.skin3, { glasses: true }), { arm: t > 2 ? 'out' : 'down' }) }; } },
        { title: 'DETAILS IN THE SPD', sub: 'Plan benefits are described there', dur: 7, cam: C2, tag: 'REAL SPEED', key: ['table'],
          cap: ['Benefits are described in the SPD', 'Read it for the details'],
          s: function (t, fx) { var a = fx.walk([[24, 22], [24, 12]], t, 0.3, 1.8, { endDir: 3 });
            return { bar: -1, book: t > 0.6, a: a, aO: ext(ME, { arm: t > 2.2 ? 'out' : 'down' }), ok: fx.E(t, 3.4, 4.0), okx: 27, oky: 8 }; } },
        { title: '90 DAYS, THEN COVERED', sub: 'Full-time employees at ADVANCED', dur: 7, cam: C3, tag: 'REAL SPEED', key: [],
          cap: ['Complete 90 days of employment', 'Then you are eligible'],
          notes: [note(C3, 6, 21, 0, 0.8, 5.0, '90 days', 0, -10)],
          big: { n: '90', label: 'days, then covered', pos: 'right' },
          s: function (t, fx) { var k = fx.E(t, 0.8, 4.4); return { bar: k, a: still(22, 25, 2), aO: ext(ME, { glasses: t > 4.6, arm: 'down' }), ok: fx.E(t, 4.8, 5.4), okx: 22, oky: 25 }; } }
      ] });
  })();

  /* ================================================================ 7.6 Employee Assistance Program (EAP) */
  (function () {
    var R = { X: 36, Y: 30, H: 24, style: 'checker', a: '#2a322e', b: '#313b36', tint: '#6aa089', wall: 'panel' };
    function world(g, fx, S, t) {
      room(g, 'c76', R);
      var L = g.list();
      chairBox(L, 1, 22, 'blue'); L.cyl(5, 5, 0, 2, 8, '#3fbf7f', { rim: false }); L.cyl(5, 5, 8, 2, 3, 'green', { rim: false });
      L.prop('table', 10, 6, 0, { w: 8, d: 5, h: 7, top: 'wood' });
      if (S.doc1) L.prop('docs', 11, 7, 7, { n: 1, w: 4, d: 3, head: P.greenD });
      if (S.doc2) L.prop('docs', 15, 7, 7, { n: 1, w: 3, d: 3, head: P.amberD });
      L.glass(22, 0, 0, 2, 30, 20, 'silver', { dens: 0.1, topDens: 0, edge: '#7d858c' });
      L.prop('desk', 26, 4, 0, { w: 10, d: 8 }); L.prop('monitor', 28, 5, 9, { rows: 2 });
      if (S.m) L.person(S.m.x, S.m.y, S.m.dir, S.mO);
      if (S.a) person(L, fx, S.a, S.aO);
      if (S.c) person(L, fx, S.c, S.cO);
      L.flush();
      if (S.beam) g.isoBeam(15, 18, 14, 21, 18, 14, P.redT, t);
      if (S.no) sticker(g, 22, 18, 26, 'no', S.no);
      if (S.ok) sticker(g, S.okx, S.oky, 28, 'ok', S.ok);
      if (S.ask) sticker(g, S.askx, S.asky, 24, 'ask', S.ask);
    }
    var C1 = cam(12, 18, 0, 120, 100, 2), C2 = cam(20, 18, 0, 120, 100, 2), C3 = cam(12, 12, 0, 82, 98, 2);
    var CONC = ['Health', 'Family', 'Financial', 'Legal', 'Emotional'];
    reg({ id: '7.6', title: 'Employee Assistance Program (EAP)', std: 'Handbook, 7.6 Employee Assistance Program (EAP)',
      blurb: 'The EAP gives you and your family confidential counseling for personal concerns. What you share is not given to ADVANCED, and there is no charge for the service.',
      backdrop: ['bands', '#121a16', '#19231e'], world: world, chips: CONC, chipAt: function (t) { return Math.min(4, Math.floor(t / 1.3)); },
      steps: [
        { title: 'CONFIDENTIAL HELP', sub: 'Counseling for personal concerns', dur: 7, cam: C1, tag: 'REAL SPEED', key: [],
          cap: ['Help with personal concerns', 'Counseling is confidential'], chips: CONC, chipAt: function (t) { return Math.min(4, Math.floor(t / 1.3)); },
          s: function (t, fx) { return { a: still(7, 18, 0), aO: ext(ME, { arm: 'down' }), c: still(15, 18, 2), cO: ext(who('#f1ece2', '#3a2c22', P.skin3, { glasses: true }), { arm: Math.floor(t * 1.5) % 2 ? 'out' : 'down' }) }; } },
        { title: 'STAYS PRIVATE', sub: 'Not shared with ADVANCED', dur: 7, cam: C2, tag: 'REAL SPEED', key: [], chips: ['Talk', 'Private', 'No charge'], chipAt: function () { return 1; },
          cap: ['What you share stays confidential', 'Joining will not hurt promotion'],
          s: function (t, fx) { return { a: still(7, 18, 0), aO: ext(ME, { arm: 'down' }), c: still(15, 18, 2), cO: ext(who('#f1ece2', '#3a2c22', P.skin3, { glasses: true }), { arm: 'down' }), beam: t > 1.0, no: fx.E(t, 2.4, 3.0), m: { x: 31, y: 16, dir: 2 }, mO: MGR }; } },
        { title: 'NO CHARGE FOR EAP', sub: 'Referral costs may be yours', dur: 7, cam: C3, tag: 'REAL SPEED', key: ['table'], chips: ['Talk', 'Private', 'No charge'], chipAt: function () { return 2; },
          cap: ['EAP services are without charge', 'Referral costs may be yours'],
          big: { n: 'NO', label: 'charge for EAP', pos: 'right' },
          s: function (t, fx) { return { a: still(11, 16, 3), aO: ext(ME, { arm: 'down' }), c: still(15, 3, 1), cO: ext(who('#f1ece2', '#3a2c22', P.skin3, { glasses: true }), { arm: t > 1.4 ? 'out' : 'down' }), doc1: t > 0.8, doc2: t > 2.6, ok: fx.E(t, 1.6, 2.2), okx: 13, oky: 8, ask: fx.E(t, 3.4, 4.0), askx: 17, asky: 8 }; } }
      ] });
  })();

  /* ================================================================ 7.7 Employer-Sponsored Disability Benefits */
  (function () {
    var R = { X: 38, Y: 30, H: 24, style: 'checker', a: '#2c3036', b: '#33383f', tint: '#e0a43a', wall: 'studs', zones: [[6, 4, 22, 14, '#4a3a2a']] };
    function sofa(L, x, y) {
      L.add([x, y, 0, x + 14, y + 6, 12], function (g) { g.isoBox(x, y, 0, 14, 6, 4, 'blue'); g.isoBox(x, y, 4, 14, 2, 8, 'blue'); g.isoBox(x, y + 2, 4, 2, 4, 3, 'blue'); g.isoBox(x + 12, y + 2, 4, 2, 4, 3, 'blue'); });
    }
    function world(g, fx, S, t) {
      room(g, 'c77', R);
      if (S.bar >= 0) rugAt(g, 6, 24, 22, 3, S.bar, '#3fbf7f');
      var L = g.list();
      L.prop('board', 24, 0, 4, { w: 12, h: 16, rows: 7, done: S.done });
      sofa(L, 8, 5); L.prop('lamp', 4, 6, 0, { col: 'amber', on: true });
      L.prop('table', 26, 12, 0, { w: 12, d: 10, h: 8, top: 'wood' });
      if (S.stub) L.prop('paystub', 27, 13, 8, { rows: S.stub, total: S.total });
      if (S.a) person(L, fx, S.a, S.aO);
      L.flush();
      if (S.flow) g.isoArrowFlow([[30, 3], [31, 8], [31, 13]], t, { color: '#6ad79f', z: 1, len: 2, gap: 3, speed: 9 });
      if (S.ask) sticker(g, 13, 14, 28, 'ask', S.ask);
      if (S.ok) sticker(g, 31, 17, 22, 'ok', S.ok);
    }
    var C1 = cam(14, 12, 0, 120, 100, 2), C2 = cam(28, 10, 0, 120, 100, 2), C3 = cam(22, 18, 0, 82, 98, 2);
    reg({ id: '7.7', title: 'Employer-Sponsored Disability Benefits', std: 'Handbook, 7.7 Employer-Sponsored Disability Benefits',
      blurb: 'If a covered illness or injury that is not work related keeps you from work, short-term disability pays a weekly benefit and long-term disability pays a monthly benefit.',
      backdrop: ['diag', '#17140f', '#1f1b14'], world: world, chips: ['Cannot work', 'Short-term', 'Long-term'],
      steps: [
        { title: 'CANNOT WORK?', sub: 'Illness or injury, not from work', dur: 7, cam: C1, tag: 'REAL SPEED', key: [],
          cap: ['A covered illness or injury', 'That is not work related'],
          s: function (t, fx) { return { a: still(15, 16, 3), aO: ext(ME, { arm: 'down' }), ask: fx.E(t, 1.2, 1.8) }; } },
        { title: 'SHORT-TERM: WEEKLY', sub: 'A weekly benefit pays part of income', dur: 7, cam: C2, tag: 'REAL SPEED', key: ['table'],
          cap: ['Short-term pays a weekly benefit', 'It replaces part of your income'],
          s: function (t, fx) { return { done: Math.floor(fx.E(t, 0.8, 4.4) * 7.9), flow: t > 4.6, stub: t > 5.0 ? 2 : 0, total: t > 5.4 ? 0.5 : 0, a: still(31, 23, 3), aO: ext(ME, { arm: 'down' }), ok: fx.E(t, 5.6, 6.2) }; } },
        { title: 'LONG-TERM: MONTHLY', sub: 'A monthly benefit pays part of income', dur: 7, cam: C3, tag: 'REAL SPEED', key: ['table'],
          cap: ['Long-term pays a monthly benefit', 'Check your plan documents'],
          big: { n: 'LONG', label: 'term pays monthly', pos: 'right' },
          s: function (t, fx) { return { done: 7, bar: fx.E(t, 0.8, 4.4), stub: t > 4.6 ? 3 : 0, total: t > 5.0 ? 0.5 : 0, a: still(31, 24, 3), aO: ext(ME, { arm: 'down' }), ok: fx.E(t, 5.2, 5.8) }; } }
      ] });
  })();

})(typeof window !== 'undefined' ? window : this);
