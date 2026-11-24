/* hb-iso-D.js: Advanced PMC employee handbook, batch D. Isometric cutaway explainers for 19 policies (7.8 to 7.17, OK-Jury Duty Leave,
   OK-Voting Leave, 8.1, 8.2, 8.3, OK-Workplace Smoking, 9.1, CLOSE-Closing Statement, CLOSE-Acknowledgment). Each one is its own place, three
   steps (who, what happens, what to do), and ends on a card taken from its own policy text. Words on signs, captions and chips are checked
   against the page's policy text by tools/check-iso-facts-D.mjs (claims in iso/facts-D.json).
   Registers window.HB_ISO['<section id>'] = spec. Needs iso-kit.js (and iso-explainer.js to play). Generated from source parts; do not edit by hand. */
(function (root) {
  'use strict';
  var ISO = root.ISO || require('./iso-kit.js'), P = ISO.P, mix = ISO.mix;
  var HB = root.HB_ISO = root.HB_ISO || {};
  var CH = ['Who', 'What', 'To do'];
  function ext(a, b) { var r = {}, k; for (k in a) r[k] = a[k]; for (k in b) r[k] = b[k]; return r; }
  /* the three-step shape every policy uses: sign title and plain subtitle, captions under the picture, the layer chip, one build per step */
  function reg(id, o) {
    var spec = { id: 'hb-' + id, title: o.title, std: o.std, blurb: o.blurb, backdrop: o.backdrop, camDur: 1, steps: o.steps };
    spec.steps.forEach(function (st, i) { st.chips = CH; st.chipAt = function () { return i; }; if (st.tag === undefined) st.tag = 'REAL SPEED'; });
    HB[id] = spec; return spec;
  }
  /* the cached floor and walls of a setting; key names the setting */
  function room(g, key, X, Y, H, fo, wo) { g.layer(key, [-6, -6, -8, X + 4, Y + 4, H + 2], function (s) { s.isoFloor(X, Y, fo); s.isoWallCut(X, Y, H, wo); }); }
  /* camera shifted so the subject sits px pixels to the left (or right when negative) of the picture centre */
  function shift(cam, px) { var Z = cam.zoom || 1, a = px / (4 * Z), r = ext(cam, {}); r.x = cam.x + a; r.y = cam.y - a; return r; }
  function pw(w, opt) { return ext({}, opt || {}); }
  function person(L, fx, w, opt) { L.person(w.x, w.y, w.dir, fx.who(w, opt)); }
  function still(x, y, dir) { return { x: x, y: y, dir: dir }; }
  var SK = [P.skin, P.skin2, P.skin3];

  /* pictograms: rows of a small bitmap, '#' is a pixel. Drawn on wall plates as 1 unit by 2 pixel cells (square on screen). */
  var PIC = {
    check: ['....#', '...#.', '#.#..', '.#...'],
    cross: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
    clock: ['.###.', '#.#.#', '#.###', '#...#', '.###.'],
    person: ['..#..', '.###.', '..#..', '.###.', '.#.#.'],
    people: ['.#.#.', '###.#', '.#.##', '###.#', '#.#.#'],
    doc: ['####.', '#.##.', '####.', '#.##.', '####.'],
    drop: ['..#..', '.###.', '#####', '#####', '.###.'],
    heart: ['.#.#.', '#####', '#####', '.###.', '..#..'],
    lock: ['.###.', '#...#', '#####', '##.##', '#####'],
    scale: ['..#..', '#####', '#.#.#', '#.#.#', '.###.'],
    cal: ['#####', '#####', '#.#.#', '#####', '#.#.#'],
    plus: ['..#..', '..#..', '#####', '..#..', '..#..'],
    key: ['.##..', '#..#.', '.##.#', '...##', '...#.'],
    flag: ['###..', '####.', '#....', '#....', '#....'],
    hand: ['.#.#.', '#####', '#####', '.###.', '.###.'],
    star: ['..#..', '#####', '.###.', '.#.#.', '#...#'],
    coin: ['.###.', '#.#.#', '##.##', '#.#.#', '.###.'],
    box: ['#####', '#...#', '#####', '#...#', '#####'],
    pen: ['....#', '...##', '..##.', '.##..', '##...'],
    cig: ['..#..', '.#...', '#####'],
    vote: ['.....', '#####', '#.#.#', '#####', '.....']
  };
  var BAR = ['##...', '.##..', '..##.', '...##', '....#'];
  function bit(s, rows, u0, z0, col, cw, ch) {
    var n = rows.length, r, c;
    for (r = 0; r < n; r++) for (c = 0; c < rows[r].length; c++) if (rows[r].charAt(c) === '#') s.F(u0 + c * cw, z0 + (n - 1 - r) * ch, cw, ch, col, 1);
  }
  /* a wall plate with a pictogram: opts pic, bg, fg, over ('no' puts a red ring and slash on it), w, h */
  ISO.defineProp('hdsign', function (o) { return [o.w || 9, 1, o.h || 14]; }, function (s, o) {
    var w = s.w, h = s.h, rows = PIC[o.pic || 'check'], cols = rows[0].length;
    s.B(0, 0, 0, w, 1, h, 'dark', { rim: false });
    s.F(1, 1, w - 2, h - 2, { fill: o.bg || P.cream, border: o.edge || P.st3 }, 1);
    bit(s, rows, Math.floor((w - cols) / 2), Math.floor((h - rows.length * 2) / 2), o.fg || P.creamInk, 1, 2);
    if (o.over === 'no') bit(s, BAR, Math.floor((w - 5) / 2), Math.floor((h - 10) / 2), P.red, 1, 2);
  });
  /* a wall calendar or chart: cols x rows cells, n filled in reading order, hi = one highlighted cell, count = cells that exist */
  ISO.defineProp('hdcal', function (o) { return [o.w || 26, 2, o.h || 14]; }, function (s, o) {
    var w = s.w, h = s.h, cols = o.cols || 6, rows = o.rows || 2, n = o.n || 0, cnt = o.count || cols * rows, i, j;
    var cw = Math.floor((w - 3) / cols), ch = Math.floor((h - 7) / rows);
    s.B(0, 0, 0, w, 2, h, 'dark', { rim: false });
    s.F(1, 1, w - 2, h - 2, { fill: P.cream, border: P.st3 }, 2);
    s.F(1, h - 5, w - 2, 4, o.head || P.red, 2);
    for (j = 0; j < rows; j++) for (i = 0; i < cols; i++) {
      var k = j * cols + i; if (k >= cnt) continue;
      var on = k < n, hi = o.hi === k;
      s.F(2 + i * cw, h - 6 - (j + 1) * ch, cw - 1, ch - 1, on ? (o.on || P.red) : (hi ? P.amber : '#c9c2b2'), 2);
    }
  });
  /* a door in a wall: open 0..1 slides a dark gap in; frame is steel */
  ISO.defineProp('hddoor', function (o) { return [o.w || 8, 2, o.h || 22]; }, function (s, o) {
    var w = s.w, h = s.h, op = o.open || 0;
    s.B(0, 0, 0, w, 2, h, 'steel', { rim: false });
    s.F(1, 0, w - 2, h - 1, '#0c0e10', 2);
    var dw = Math.round((w - 2) * (1 - op * 0.85));
    if (dw > 0) { s.F(1, 0, dw, h - 2, o.col || P.st2, 2); s.F(1, h - 2, dw, 1, P.st3, 2); s.F(dw - 1, 9, 1, 3, P.st4, 2); }
  });
  ISO.defineProp('hdplant', [4, 4, 14], function (s) {
    s.C(2, 2, 0, 1.6, 4, 'red', { rim: false });
    s.C(2, 2, 4, 0.5, 3, 'dark', { rim: false });
    s.C(2, 2, 7, 1.9, 3, 'green', { rim: false });
    s.C(2, 2, 10, 1.2, 4, 'green', { rim: false });
  });
  /* a ring binder on a desk or shelf: o.col spine colour */
  ISO.defineProp('hdbinder', [6, 5, 2], function (s, o) {
    s.B(0, 0, 0, 6, 5, 2, 'paper', { rim: false, shadow: true });
    s.B(0, 0, 0, 1, 5, 2, { top: o.col || P.red, left: o.col || P.red, right: mix(o.col || P.red, '#000000', 0.3) }, { rim: false });
    s.top(2, 1, 3, 1, 2, P.line);
  });
  /* a form lying flat with a signature line: write 0..1 fills it */
  ISO.defineProp('hdform', [9, 6, 1], function (s, o) {
    s.B(0, 0, 0, 9, 6, 1, 'paper', { rim: false, shadow: true });
    s.top(1, 1, 7, 1, 1, o.head || P.red);
    s.top(1, 2, 6, 1, 1, P.line); s.top(1, 3, 5, 1, 1, P.line);
    s.top(1, 4, 7, 1, 1, P.st2);
    if (o.write > 0) s.top(1, 4, Math.max(1, Math.round(7 * o.write)), 1, 1, o.ink || P.blue);
    if (o.stamp) s.top(6, 2, 2, 2, 1, P.red);
  });
  /* world position on the picture, for placing notes (cam = the step's last camera) */
  function at(cam, x, y, z) {
    var Z = cam.zoom, ox = Math.round(120 - (cam.x - cam.y) * 2 * Z), oy = Math.round(98 - (cam.x + cam.y - (cam.z || 0)) * Z);
    return [Math.round(ox + (x - y) * 2 * Z), Math.round(oy + (x + y - z) * Z)];
  }
  /* a wall bar chart: vals are the bar sizes, n bars are up, grow 0..1 is the next one rising, hi = a bar in amber */
  ISO.defineProp('hdbars', function (o) { return [o.w || 28, 2, o.h || 20]; }, function (s, o) {
    var w = s.w, h = s.h, vals = o.vals || [3, 10, 15, 18], n = o.n === undefined ? vals.length : o.n, i, bw = Math.floor((w - 4) / vals.length) - 1, base = 3, mx = 0;
    for (i = 0; i < vals.length; i++) if (vals[i] > mx) mx = vals[i];
    s.B(0, 0, 0, w, 2, h, 'dark', { rim: false });
    s.F(1, 1, w - 2, h - 2, { fill: P.cream, border: P.st3 }, 2);
    s.F(2, base, w - 4, 1, P.st2, 2);
    for (i = 0; i < vals.length; i++) {
      var bh = Math.max(1, Math.round(vals[i] / mx * (h - base - 4))), k = i < n ? 1 : (i === n ? (o.grow || 0) : 0), hh = Math.round(bh * k);
      if (hh > 0) s.F(3 + i * (bw + 1), base + 1, bw, hh, i === o.hi ? P.amber : P.red, 2); else s.F(3 + i * (bw + 1), base + 1, bw, 1, '#c9c2b2', 2);
    }
  });
  /* a window in a wall */
  ISO.defineProp('hdwin', function (o) { return [o.w || 12, 1, o.h || 14]; }, function (s, o) {
    var w = s.w, h = s.h;
    s.B(0, 0, 0, w, 1, h, 'dark', { rim: false });
    s.F(1, 1, w - 2, h - 2, o.sky || '#6d8fa8', 1);
    s.F(Math.floor(w / 2), 1, 1, h - 2, P.st1, 1); s.F(1, Math.floor(h / 2), w - 2, 1, P.st1, 1);
    if (o.sun) s.F(2, h - 5, 2, 2, '#f0d9a0', 1);
  });

  /* ---------------------------------------------------------------- 7.10 Health Insurance: the benefits window */
  (function () {
    var X = 26, Y = 36, H = 26;
    var EMP = { who: 'raul', h: 26, shirt: P.red, hair: '#2b2018' }, DEP = { who: 'randel', h: 26, shirt: '#3f8f6a', shirtD: '#2b6a4d', hair: '#6b4a2b', skin: P.skin3 }, CLK = { who: 'dora', h: 26, shirt: P.blue, shirtD: P.blueS, hair: '#1f1a17', skin: P.skin2, glasses: true };
    function world(g, fx, S) {
      room(g, 'd710', X, Y, H, { style: 'epoxy', a: '#22302a', b: '#27362f' }, { style: 'tile', tint: P.green, line: '#2f4a3e' });
      var L = g.list(), pics = ['person', 'people', 'heart'], i;
      for (i = 0; i < 3; i++) L.prop('hdsign', 0, 2 + i * 7, 1, { face: 'x', w: 7, h: 13, pic: pics[i], bg: S.lit[i] === 2 ? P.amber : S.lit[i] ? P.green : P.cream, fg: S.lit[i] ? '#0e2a1c' : P.creamInk });
      L.prop('shelf', 0, 24, 0, { face: 'x', w: 8, d: 6, h: 22, seed: 7 });
      L.prop('counter', 11, 8, 0, { face: 'x', w: 16, d: 7, body: 'steel', top: 'silver' });
      L.prop('hdbinder', 13, S.bin ? S.bin[1] : 9, 11, { col: P.blue });
      if (S.docs) L.prop('docs', 13, 16, 11, { face: 'x', n: S.docs, head: P.green, stamp: S.docs > 2 });
      L.prop('hdplant', 22, 3, 0, {});
      person(L, fx, S.clerk, S.clerkOpt || CLK);
      person(L, fx, S.me, S.meOpt);
      if (S.dep) person(L, fx, S.dep, DEP);
      L.flush();
    }
    function base() { return { lit: [0, 0, 0], bin: null, docs: null, clerk: still(9, 16, 0), me: still(21, 18, 2), meOpt: EMP, dep: null }; }
    var C1 = { x: 12, y: 17, zoom: 2, z: 10 }, C2 = { x: 11, y: 27, zoom: 2, z: 10 }, C3 = shift({ x: 14, y: 17, zoom: 2, z: 8 }, 52);
    var steps = [
      { title: 'Employee and family', sub: 'After the plan\'s waiting period', dur: 7.5, cam: C1,
        cap: ['Eligible employees', 'And their eligible dependents'],
        build: function (t, g, fx) {
          var S = base(); S.lit = [t > 1.6 ? 1 : 0, t > 4.6 ? 1 : 0, 0];
          S.dep = fx.walk([[27, 12], [21, 12]], t, 2.8, 4.2, { endDir: 2 }); if (t < 2.8) S.dep = null;
          world(g, fx, S);
        } },
      { title: 'The plan binder', sub: 'The details are in the SPD', dur: 8, cam: C2, key: ['shelf'],
        cap: ['The Summary Plan Description has details', 'It may be obtained from HR'],
        build: function (t, g, fx) {
          var S = base(); S.lit = [1, 1, 0]; S.dep = still(21, 12, 2);
          var go = fx.walk([[9, 16], [9, 28]], t, 0.4, 1.8, { endDir: 0 }), back = fx.walk([[9, 28], [9, 16]], t, 3.4, 4.8, { startDir: 0, endDir: 0 });
          S.clerk = t < 3.4 ? go : back;
          var carry = t > 3.0 && t < 5.2;
          S.clerkOpt = ext(CLK, { arm: t > 2.0 && t < 3.0 ? 'up' : 'down', hold: carry ? P.blue : undefined });
          S.bin = t > 5.2 ? [13, 9] : null;
          world(g, fx, S);
        } },
      { title: 'If coverage ends', sub: 'You may have the right to continue', dur: 7, cam: C3, key: ['docs'], big: { n: 'SPD', label: 'from HR', pos: 'right' },
        cap: ['A change in work hours or a life event', 'ADVANCED will provide information'],
        build: function (t, g, fx) {
          var S = base(); S.lit = [1, 1, t > 1.4 ? 2 : 0]; S.dep = still(21, 12, 2); S.bin = [13, 9];
          
          S.docs = t < 2.4 ? 0 : t < 3.4 ? 1 : t < 4.4 ? 2 : 3;
          S.meOpt = ext(EMP, { arm: t > 4.0 ? 'out' : 'down' });
          world(g, fx, S);
        } }
    ];
    reg('7.10', { title: 'Health Insurance', std: 'Handbook, Benefits & Leave', blurb: 'Who is covered, where the plan details are and what happens if coverage ends.', backdrop: ['stripes', '#0f1814', '#16221c'], steps: steps });
  })();

  /* ---------------------------------------------------------------- 7.11 Holidays: the shop on a company holiday */
  (function () {
    var X = 40, Y = 30, H = 30;
    var EMP = { who: 'pk', h: 26, shirt: P.red, hair: '#2b2018', vest: true }, FOR = { who: 'randel', h: 26, shirt: P.amber, shirtD: P.amberD, hair: '#1f1a17', skin: P.skin2, hat: '#d8dde1' };
    function world(g, fx, S) {
      room(g, 'd711', X, Y, H, { style: 'checker', a: '#2e2a2b', b: '#343033', zones: [[10, 8, 22, 12, '#3a2628'], [2, 24, 36, 1, P.red2]] }, { style: 'studs', tint: P.red });
      var L = g.list(), i;
      L.prop('hdsign', 4, 0, 2, { w: 7, h: 14, pic: 'person', bg: S.ok[0] ? P.green : P.cream, fg: S.ok[0] ? '#0e2a1c' : P.creamInk });
      L.prop('hdsign', 12, 0, 2, { w: 7, h: 14, pic: 'cal', bg: S.ok[1] ? P.green : P.cream, fg: S.ok[1] ? '#0e2a1c' : P.creamInk });
      L.prop('wallclock', 21, 0, 8, { hour: S.hour, min: S.min });
      L.prop('rolldoor', 30, 0, 0, { w: 9, h: 20, open: 0 });
      L.prop('hdcal', 0, 3, 3, { face: 'x', w: 24, h: 12, cols: 7, rows: 1, n: S.days, hi: S.hi });
      L.prop('table', 12, 10, 0, { w: 16, d: 8, h: 9, top: 'steel', plate: '#1c1f22' });
      L.prop('pallet', 31, 12, 0, { w: 8, d: 8 });
      L.prop('crate', 32, 13, 3, { w: 6, d: 6, h: 6, tag: P.red });
      if (S.part) L.box(15, 12, 9, 3, 3, 3, 'silver', { rim: false });
      L.prop('stool', 14, 19, 0, { col: 'red' });
      person(L, fx, S.me, S.meOpt);
      L.flush();
      for (i = 0; i < 7; i++) if (S.ring === i) { var q = g.proj(0, 3 + 1.5 + i * 3.4, 9); g.ring(q[0], q[1], 7, S.rt, P.redT); }
    }
    function base() { return { ok: [0, 0], days: 0, hi: -1, hour: 6, min: 0, part: false, ring: -1, rt: 0, me: still(22, 21, 3), meOpt: EMP }; }
    var C1 = { x: 14, y: 12, zoom: 2, z: 8 }, C2 = { x: 8, y: 16, zoom: 2, z: 8 }, C3 = shift({ x: 16, y: 16, zoom: 2, z: 6 }, 56);
    var steps = [
      { title: 'Who gets paid', sub: 'Full-time, 90 days of employment', dur: 7.5, cam: C1,
        cap: ['Full-time employees', '90 days of continuous employment'],
        build: function (t, g, fx) {
          var S = base(); S.me = fx.walk([[28, 21], [22, 21]], t, 0.3, 1.5, { endDir: 3 });
          S.ok = [t > 2.2 ? 1 : 0, t > 4.2 ? 1 : 0]; S.hour = 9; S.min = Math.floor(t * 8) % 60;
          world(g, fx, S);
        } },
      { title: 'The seven days', sub: 'Time off in addition to PTO', dur: 8, cam: C2, key: ['hdcal'],
        cap: ['7 company holidays', 'In addition to PTO'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 1];
          S.days = Math.floor(fx.E(t, 1.0, 5.4) * 7.99); S.ring = S.days > 0 && S.days < 8 && t < 6.2 ? S.days - 1 : -1; S.rt = t * 1.4;
          S.hour = 9;
          world(g, fx, S);
        } },
      { title: 'Work your full shift', sub: 'Before and after the holiday', dur: 7, cam: C3, key: ['wallclock'], big: { n: '7', label: 'holidays', pos: 'right' },
        cap: ['Work your full shift before and after', 'Unless prior arrangements were made'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 1]; S.days = 7; S.hi = -1;
          var k = fx.E(t, 0.6, 5.6); var mins = 6 * 60 + k * 8 * 60; S.hour = Math.floor(mins / 60); S.min = Math.round(mins % 60);
          S.meOpt = ext(EMP, { arm: Math.floor(t * 2) % 2 ? 'write' : 'down' });
          S.part = t > 2.4;
          world(g, fx, S);
        } }
    ];
    reg('7.11', { title: 'Holidays', std: 'Handbook, Benefits & Leave', blurb: 'Who is paid for company holidays and what to work around them.', backdrop: ['bands', '#1b1416', '#261a1d'], steps: steps });
  })();

  /* ---------------------------------------------------------------- 7.12 Life Insurance: the benefits administrator's desk */
  (function () {
    var X = 28, Y = 26, H = 24;
    var EMP = { who: 'forrest', h: 26, shirt: P.red, hair: '#2b2018' }, ADM = { who: 'dora', h: 26, shirt: '#3f8f6a', shirtD: '#2b6a4d', hair: '#8a8f94', skin: P.skin3, glasses: true };
    function world(g, fx, S) {
      room(g, 'd712', X, Y, H, { style: 'checker', a: '#262a33', b: '#2c313b', zones: [[6, 8, 22, 14, '#202734']] }, { style: 'panel', tint: '#8f979e' });
      var L = g.list(), i, pics = ['person', 'heart'];
      for (i = 0; i < 2; i++) L.prop('hdsign', 0, 3 + i * 7, 2, { face: 'x', w: 7, h: 14, pic: pics[i], bg: S.ok[i] ? P.green : P.cream, fg: S.ok[i] ? '#0e2a1c' : P.creamInk });
      L.prop('wallclock', 0, 17, 8, { face: 'x', hour: S.hour, min: S.min });
      L.prop('cabinet', 20, 0, 0, {});
      L.prop('desk', 8, 9, 0, { w: 18, d: 11 });
      L.prop('monitor', 9, 10, 9, { rows: 2 });
      L.prop('hdbinder', 10, 15, 9, { col: S.hi ? P.amber : P.blue });
      L.prop('hdform', 17, 12, 9, { write: S.write, stamp: S.stamp });
      L.prop('hdplant', 2, 20, 0, {});
      person(L, fx, S.adm, S.admOpt || ADM);
      person(L, fx, S.me, S.meOpt);
      L.flush();
      if (S.ring) { var q = g.proj(13, 18, 11); g.ring(q[0], q[1], 10, S.ring, P.redT, 0.5); }
    }
    function base() { return { ok: [0, 0], hour: 9, min: 0, write: 0, stamp: false, hi: false, ring: 0, adm: still(17, 6, 1), me: still(17, 22, 3), meOpt: EMP }; }
    var C1 = { x: 12, y: 16, zoom: 2, z: 10 }, C2 = { x: 15, y: 12, zoom: 2, z: 8 }, C3 = shift({ x: 14, y: 14, zoom: 2, z: 8 }, 54);
    var steps = [
      { title: 'Employee covered', sub: 'After the plan\'s waiting period', dur: 7.5, cam: C1,
        cap: ['Life insurance for eligible employees', 'After the plan\'s defined waiting period'],
        build: function (t, g, fx) {
          var S = base(); S.me = fx.walk([[22, 22], [17, 22]], t, 0.3, 1.3, { endDir: 3 });
          var k = fx.E(t, 1.4, 4.4); var m = k * 12 * 60; S.hour = Math.floor(m / 60) % 12; S.min = Math.round(m % 60);
          S.ok = [t > 2.0 ? 1 : 0, t > 4.8 ? 1 : 0];
          world(g, fx, S);
        } },
      { title: 'Name a beneficiary', sub: 'Your intended beneficiary', dur: 8, cam: C2, key: ['hdform'],
        cap: ['Notify the benefits administrator', 'Of your intended beneficiary'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 1];
          S.meOpt = ext(EMP, { arm: t > 1.0 && t < 5.2 ? 'write' : 'down' });
          S.write = fx.E(t, 1.4, 4.8); S.stamp = t > 5.4;
          S.admOpt = ext(ADM, { arm: t > 5.0 && t < 6.2 ? 'out' : 'down' });
          world(g, fx, S);
        } },
      { title: 'Read the plan details', sub: 'Refer to the SPD', dur: 7, cam: C3, key: ['hdbinder'], big: { n: 'SPD', label: 'for details', pos: 'right' },
        cap: ['Refer to the Summary Plan Description', 'For details about the benefit'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 1]; S.write = 1; S.stamp = true;
          S.hi = t > 1.6; S.ring = t > 1.6 && t < 5.4 ? t * 0.9 : 0;
          S.admOpt = ext(ADM, { arm: t > 1.0 && t < 2.6 ? 'out' : 'down' });
          world(g, fx, S);
        } }
    ];
    reg('7.12', { title: 'Life Insurance', std: 'Handbook, Benefits & Leave', blurb: 'Who is covered and the one thing you tell the benefits administrator.', backdrop: ['diag', '#14161c', '#1c2029'], steps: steps });
  })();

  /* ---------------------------------------------------------------- 7.13 Military Leave (USERRA): the gate to the HR desk */
  (function () {
    var X = 34, Y = 28, H = 26;
    var MEM = { who: 'steve', h: 26, shirt: '#5a6b3c', shirtD: '#3f4c29', hair: '#2b2018', hat: '#4a5a30' }, HRP = { who: 'pam', h: 26, shirt: P.blue, shirtD: P.blueS, hair: '#1f1a17', skin: P.skin2, glasses: true };
    function world(g, fx, S) {
      room(g, 'd713', X, Y, H, { style: 'grid', a: '#262b22', b: '#2c3227', zones: [[10, 5, 20, 3, '#33392a']] }, { style: 'studs', tint: '#6b7a4a' });
      var L = g.list();
      L.prop('hddoor', 3, 0, 0, { w: 8, h: 22, open: S.door });
      L.prop('hdsign', 14, 0, 2, { w: 7, h: 14, pic: 'flag', bg: S.ok[0] ? P.green : P.cream, fg: S.ok[0] ? '#0e2a1c' : P.creamInk });
      L.prop('hdsign', 22, 0, 2, { w: 7, h: 14, pic: 'doc', bg: S.ok[1] ? P.green : P.cream, fg: S.ok[1] ? '#0e2a1c' : P.creamInk });
      L.prop('table', 1, 14, 0, { face: 'x', w: 12, d: 7, h: 9, top: 'steel' });
      L.prop('monitor', 2, 17, 9, { face: 'x', rows: S.screen, screen: S.ok[2] ? '#0f2a1d' : '#0c0e10' });
      L.prop('hdsign', 0, 8, 2, { face: 'x', w: 7, h: 14, pic: 'check', bg: S.ok[2] ? P.green : P.cream, fg: S.ok[2] ? '#0e2a1c' : P.creamInk });
      L.prop('desk', 12, 9, 0, { w: 14, d: 10 });
      L.prop('hdform', 14, 10, 9, { write: S.write, stamp: S.stamp });
      L.prop('hdplant', 30, 4, 0, {});
      person(L, fx, S.hr, HRP);
      person(L, fx, S.me, S.meOpt);
      L.flush();
    }
    function base() { return { door: 0, ok: [0, 0, 0], screen: 0, write: 0, stamp: false, hr: still(29, 14, 2), me: still(19, 22, 3), meOpt: MEM }; }
    var C1 = { x: 15, y: 12, zoom: 2, z: 8 }, C2 = { x: 21, y: 15, zoom: 2, z: 6 }, C3 = shift({ x: 13, y: 16, zoom: 2, z: 6 }, 54);
    var steps = [
      { title: 'Who it covers', sub: 'Members of the uniformed services', dur: 7.5, cam: C1,
        cap: ['Members of the uniformed services', 'Under USERRA and state law'],
        build: function (t, g, fx) {
          var S = base(); S.door = fx.E(t, 0.2, 1.0) * (t < 3.4 ? 1 : 1 - fx.E(t, 3.4, 4.2));
          S.me = fx.walk([[10, 5], [10, 22], [19, 22]], t, 0.8, 3.4, { endDir: 3, startDir: 1 });
          S.ok = [t > 4.0 ? 1 : 0, 0, 0];
          world(g, fx, S);
        } },
      { title: 'Send paperwork to HR', sub: 'Unpaid leave is granted', dur: 8, cam: C2, key: ['hdform'],
        cap: ['Submit documentation to HR', 'Unpaid military leave is granted'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 0, 0];
          S.meOpt = ext(MEM, { arm: t > 0.8 && t < 2.8 ? 'out' : 'down', hold: t > 0.8 && t < 2.2 ? P.paper : undefined });
          S.write = t > 2.2 ? fx.E(t, 2.2, 3.8) : 0; S.stamp = t > 4.2; S.hrStamp = t > 3.8 && t < 4.4;
          if (t < 2.2) S.write = 0;
          S.ok[1] = t > 4.6 ? 1 : 0;
          S.door = fx.E(t, 5.0, 5.8);
          S.me = fx.walk([[19, 22], [10, 22], [10, 9]], t, 5.2, 7.2, { endDir: 3, startDir: 3 }); if (t < 5.2) S.me = still(19, 22, 3);
          world(g, fx, S);
        } },
      { title: 'Coming back', sub: 'Your previous or a similar position', dur: 7.5, cam: C3, tag: false, key: ['hdsign'], big: { n: '1994', label: 'USERRA', pos: 'right' },
        cap: ['Notify your manager of intent to return', 'Reinstated to your previous position'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 1, 0]; S.write = 1; S.stamp = false;
          S.door = fx.E(t, 0.2, 0.9) * (t < 2.4 ? 1 : 1 - fx.E(t, 2.4, 3.2));
          var a = fx.walk([[10, 5], [10, 22], [19, 22]], t, 0.6, 2.8, { endDir: 3, startDir: 1 }), b = fx.walk([[19, 22], [12, 22]], t, 4.6, 5.6, { endDir: 2, startDir: 3 });
          S.me = t < 4.6 ? a : b;
          S.meOpt = ext(MEM, { arm: t > 3.0 && t < 4.4 ? 'out' : 'down', hold: t > 3.0 && t < 4.2 ? P.paper : undefined });
          S.stamp = t > 4.0; S.ok[2] = t > 5.8 ? 1 : 0; S.screen = t > 5.8 ? 3 : 0;
          world(g, fx, S);
        } }
    ];
    reg('7.13', { title: 'Military Leave (USERRA)', std: 'Handbook, Benefits & Leave', blurb: 'Send paperwork to HR, then tell your manager when you will return.', backdrop: ['stripes', '#161a12', '#20261a'], steps: steps });
  })();

  /* ---------------------------------------------------------------- 7.14 Paid Time Off (PTO): the break room accrual wall */
  (function () {
    var X = 40, Y = 26, H = 28;
    var EMP = { who: 'dora', h: 26, shirt: P.red, hair: '#2b2018', badge: true }, MGR = { who: 'scott', h: 26, shirt: P.blue, shirtD: P.blueS, hair: '#8a8f94', skin: P.skin2, glasses: true };
    function world(g, fx, S) {
      room(g, 'd714', X, Y, H, { style: 'grid', a: '#2e2b24', b: '#35322a', zones: [[8, 8, 24, 14, '#3a3524']] }, { style: 'panel', tint: P.amberD });
      var L = g.list();
      L.prop('hdsign', 2, 0, 2, { w: 7, h: 14, pic: 'person', bg: S.ok ? P.green : P.cream, fg: S.ok ? '#0e2a1c' : P.creamInk });
      L.prop('hdbars', 11, 0, 2, { w: 28, h: 16, n: S.bars, grow: S.grow, hi: S.hiBar });
      L.prop('hdcal', 0, 4, 2, { face: 'x', w: 21, h: 13, cols: 6, rows: 1, n: S.months, hi: S.hiM });
      L.prop('table', 14, 10, 0, { w: 16, d: 9, h: 9, top: 'wood' });
      L.prop('stool', 13, 20, 0, { col: 'amber' });
      L.prop('stool', 31, 12, 0, { col: 'amber' });
      if (S.req) L.prop('hdform', S.req[0], S.req[1], 9, { write: S.write, stamp: S.stamp });
      L.prop('hdplant', 35, 22, 0, {});
      if (S.mgr) person(L, fx, S.mgr, MGR);
      person(L, fx, S.me, S.meOpt);
      L.flush();
    }
    function base() { return { ok: 0, bars: 0, grow: 0, hiBar: -1, months: 0, hiM: -1, req: null, write: 0, stamp: false, mgr: null, me: still(22, 21, 3), meOpt: EMP }; }
    var C1 = { x: 10, y: 16, zoom: 2, z: 8 }, C2 = { x: 25, y: 11, zoom: 2, z: 8 }, C3 = shift({ x: 20, y: 15, zoom: 2, z: 6 }, 56);
    var b0 = at(C2, 16.5, 0, 0), b1 = at(C2, 22.5, 0, 0), b2 = at(C2, 28.5, 0, 0), b3 = at(C2, 34.5, 0, 0);
    var steps = [
      { title: 'Who earns PTO', sub: 'Full-time, 30+ hours a week', dur: 7.5, cam: C1,
        cap: ['Full-time and working 30+ hours a week', 'Accrual begins after 6 months'],
        build: function (t, g, fx) {
          var S = base(); S.me = fx.walk([[28, 21], [22, 21]], t, 0.3, 1.4, { endDir: 3 });
          S.ok = t > 1.8 ? 1 : 0; S.months = Math.floor(fx.E(t, 2.6, 5.6) * 6.99);
          world(g, fx, S);
        } },
      { title: 'More years, more PTO', sub: 'Accrual grows with service', dur: 8.5, cam: C2,
        notes: [{ a: 1.5, b: 8.0, x: b0[0], y: b0[1], text: '3 days' }, { a: 3.0, b: 8.0, x: b1[0], y: b1[1], text: '10 days' }, { a: 4.5, b: 8.0, x: b2[0], y: b2[1], text: '15 days' }, { a: 6.0, b: 8.0, x: b3[0], y: b3[1], text: '18 days' }],
        cap: ['6 months to 1 year: 3 days a year', '5+ years: 18 days a year'],
        build: function (t, g, fx) {
          var S = base(); S.ok = 1; S.months = 6;
          var k = fx.E(t, 0.8, 7.0) * 4; S.bars = Math.min(4, Math.floor(k)); S.grow = k - Math.floor(k); if (k >= 4) { S.bars = 4; S.grow = 0; }
          S.hiBar = t > 7.2 ? 3 : -1;
          S.me = still(22, 21, 3);
          world(g, fx, S);
        } },
      { title: 'Ask first', sub: 'PTO must be approved in advance', dur: 7.5, cam: C3, key: ['hdform'], big: { n: '39', label: 'weeks to earn', pos: 'right' },
        cap: ['Approved in advance by your manager', 'Provide 3 weeks notice for a full week'],
        build: function (t, g, fx) {
          var S = base(); S.ok = 1; S.months = 6; S.bars = 4; S.mgr = still(22, 4, 1);
          S.meOpt = ext(EMP, { arm: t > 1.0 && t < 3.6 ? 'out' : 'down' });
          S.req = t > 1.6 ? [18, 14] : null; S.write = fx.E(t, 1.8, 3.4); S.stamp = t > 4.4;
          S.hiM = t > 4.8 ? 5 : -1; S.months = 6;
          world(g, fx, S);
        } }
    ];
    reg('7.14', { title: 'Paid Time Off (PTO)', std: 'Handbook, Benefits & Leave', blurb: 'Who earns PTO, how it grows with service and how to ask for it.', backdrop: ['bands', '#1a1612', '#262016'], steps: steps });
  })();

  /* ---------------------------------------------------------------- 7.15 Personal Leave of Absence: the manager's office */
  (function () {
    var X = 32, Y = 26, H = 26;
    var EMP = { who: 'pam', h: 26, shirt: P.red, hair: '#2b2018' }, MGR = { who: 'kim', h: 26, shirt: '#3a8f8f', shirtD: '#27696a', hair: '#1f1a17', skin: P.skin2, glasses: true };
    function world(g, fx, S) {
      room(g, 'd715', X, Y, H, { style: 'checker', a: '#22302f', b: '#283837', zones: [[8, 6, 20, 15, '#1c2a33']] }, { style: 'panel', tint: '#3f9f9f' });
      var L = g.list();
      L.prop('hdwin', 3, 0, 4, { w: 12, h: 14, sky: S.sky, sun: true });
      L.prop('hdsign', 18, 0, 2, { w: 7, h: 14, pic: 'doc', bg: S.ok[1] ? P.green : P.cream, fg: S.ok[1] ? '#0e2a1c' : P.creamInk });
      L.prop('hdsign', 25, 0, 2, { w: 7, h: 14, pic: 'person', bg: S.ok[0] ? P.green : P.cream, fg: S.ok[0] ? '#0e2a1c' : P.creamInk });
      L.prop('hdcal', 0, 3, 3, { face: 'x', w: 21, h: 13, cols: 6, rows: 1, n: S.months, hi: S.hi, on: S.leave ? P.amberD : P.red });
      L.prop('desk', 12, 9, 0, { w: 16, d: 10 });
      L.prop('monitor', 12, 10, 9, { rows: 1 });
      if (S.form) L.prop('hdform', S.form[0], S.form[1], 9, { write: S.write, stamp: S.stamp });
      L.prop('hdplant', 29, 19, 0, {});
      person(L, fx, S.mgr, S.mgrOpt || MGR);
      person(L, fx, S.me, S.meOpt);
      L.flush();
      if (S.ring) { var q = g.proj(23, 16, 11); g.ring(q[0], q[1], 10, S.ring, P.redT, 0.5); }
    }
    function base() { return { sky: '#6d8fa8', ok: [0, 0], months: 0, hi: -1, leave: false, form: null, write: 0, stamp: false, ring: 0, mgr: still(9, 9, 0), me: still(20, 21, 3), meOpt: EMP }; }
    var C1 = { x: 10, y: 16, zoom: 2, z: 8 }, C2 = { x: 22, y: 13, zoom: 2, z: 8 }, C3 = shift({ x: 14, y: 16, zoom: 2, z: 6 }, 54);
    var steps = [
      { title: 'Who can ask', sub: 'Unpaid leave after 6 months', dur: 7.5, cam: C1,
        cap: ['Regular, full-time, part-time employees', 'Employed at least 6 months'],
        build: function (t, g, fx) {
          var S = base(); S.me = fx.walk([[26, 21], [20, 21]], t, 0.3, 1.4, { endDir: 3 });
          S.ok = [t > 1.8 ? 1 : 0, 0]; S.months = Math.floor(fx.E(t, 2.4, 5.6) * 6.99);
          world(g, fx, S);
        } },
      { title: 'Put it in writing', sub: 'Reason for the leave and the dates', dur: 8, cam: C2, key: ['hdform'],
        cap: ['Requests are submitted to HR in writing', 'Include the reason and the dates'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 0]; S.months = 6;
          S.meOpt = ext(EMP, { arm: t > 1.0 && t < 5.0 ? 'write' : 'down' });
          S.form = [20, 13]; S.write = fx.E(t, 1.2, 4.8); S.stamp = t > 5.4;
          S.mgrOpt = ext(MGR, { arm: t > 5.0 && t < 6.4 ? 'out' : 'down' });
          S.ok[1] = t > 6.0 ? 1 : 0; S.ring = t > 5.4 && t < 7.0 ? t : 0;
          world(g, fx, S);
        } },
      { title: 'Come back on time', sub: 'Extension requests in writing', dur: 7.5, cam: C3, key: ['hdcal'], big: { n: '30', label: 'days in advance', pos: 'right' },
        cap: ['Return on the originally scheduled date', 'Extension: 1 week in advance'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 1]; S.months = 6; S.leave = true;
          S.hi = t > 1.4 ? 5 : -1; S.sky = '#c98a55';
          S.form = [20, 13]; S.write = fx.E(t, 3.0, 5.0); S.stamp = false;
          S.meOpt = ext(EMP, { arm: t > 3.0 && t < 5.4 ? 'write' : 'down' });
          world(g, fx, S);
        } }
    ];
    reg('7.15', { title: 'Personal Leave of Absence', std: 'Handbook, Benefits & Leave', blurb: 'Who can ask, how to ask in writing and when to be back.', backdrop: ['diag', '#161a1a', '#1f2626'], steps: steps });
  })();

  /* ---------------------------------------------------------------- 7.16 Unemployment Compensation Insurance: the pay window */
  (function () {
    var X = 28, Y = 26, H = 26;
    var EMP = { who: 'randel', h: 26, shirt: P.red, hair: '#2b2018' }, CLK = { who: 'dora', h: 26, shirt: '#c9a42b', shirtD: '#8a6f1c', hair: '#1f1a17', skin: P.skin3, glasses: true };
    function stack(L, x, y, n, col) { for (var i = 0; i < n; i++) L.cyl(x, y, 11 + i * 2, 1.6, 2, col, { rim: false }); }
    function world(g, fx, S) {
      room(g, 'd716', X, Y, H, { style: 'grid', a: '#2e2c22', b: '#34321f', zones: [[14, 3, 12, 20, '#3a3620']] }, { style: 'tile', tint: '#c9a42b' });
      var L = g.list(), pics = ['person', 'coin', 'scale'], i;
      for (i = 0; i < 3; i++) L.prop('hdsign', 0, 3 + i * 7, 2, { face: 'x', w: 7, h: 14, pic: pics[i], bg: S.ok[i] ? P.green : P.cream, fg: S.ok[i] ? '#0e2a1c' : P.creamInk });
      L.prop('counter', 11, 4, 0, { face: 'x', w: 20, d: 6, body: 'dark', top: 'counter' });
      stack(L, 14, 8, S.coA, 'amber'); stack(L, 14, 24 - 2, S.coB, 'amber');
      if (S.doc) L.prop('docs', 12, 12, 11, { face: 'x', n: 2, head: P.amber });
      if (S.flow) L.flow([[13, 9], [13, 20]], S.flow, { color: P.amber, z: 12, len: 2, gap: 2, speed: 8 });
      L.prop('hdplant', 23, 3, 0, {});
      person(L, fx, S.clerk, S.clerkOpt || CLK);
      person(L, fx, S.me, S.meOpt);
      L.flush();
    }
    function base() { return { ok: [0, 0, 0], coA: 0, coB: 0, doc: false, flow: 0, clerk: still(8, 14, 0), me: still(19, 15, 2), meOpt: ext(EMP, { hold: P.card, holdSize: [5, 4] }) }; }
    var C1 = { x: 12, y: 16, zoom: 2, z: 10 }, C2 = { x: 13, y: 15, zoom: 2, z: 8 }, C3 = shift({ x: 14, y: 15, zoom: 2, z: 8 }, 54);
    var steps = [
      { title: 'Who it helps', sub: 'Employees who lost their job', dur: 7.5, cam: C1,
        cap: ['Employees who have lost their job', 'Under certain circumstances'],
        build: function (t, g, fx) {
          var S = base(); S.me = fx.walk([[24, 20], [19, 15]], t, 0.3, 1.8, { endDir: 2 });
          S.meOpt = ext(EMP, { hold: P.card, holdSize: [5, 4] }); S.ok = [t > 2.4 ? 1 : 0, 0, 0];
          world(g, fx, S);
        } },
      { title: 'ADVANCED pays', sub: 'Temporary income', dur: 8, cam: C2, key: ['counter'],
        cap: ['Paid for by ADVANCED', 'It provides temporary income'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 0, 0];
          S.coA = Math.round(5 - 5 * fx.E(t, 1.4, 5.0)); S.coB = Math.round(5 * fx.E(t, 2.0, 5.6));
          S.flow = t > 1.4 && t < 5.8 ? t : 0; S.ok[1] = t > 2.0 ? 1 : 0;
          S.clerkOpt = ext(CLK, { arm: t > 1.0 && t < 5.4 ? 'out' : 'down' });
          world(g, fx, S);
        } },
      { title: 'Why you left matters', sub: 'The reasons for your separation', dur: 7.5, cam: C3, key: ['docs'], big: { n: 'PAID', label: 'for by ADVANCED', pos: 'right' },
        cap: ['Eligibility is determined in part', 'By the reasons for your separation'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 1, t > 2.2 ? 1 : 0]; S.coA = 0; S.coB = 5; S.doc = t > 1.0;
          S.clerkOpt = ext(CLK, { arm: t > 1.4 && t < 3.6 ? 'out' : 'down' });
          world(g, fx, S);
        } }
    ];
    reg('7.16', { title: 'Unemployment Compensation Insurance', std: 'Handbook, Benefits & Leave', blurb: 'Who it helps, who pays and what decides eligibility.', backdrop: ['stripes', '#1a1a14', '#26261a'], steps: steps });
  })();

  /* ---------------------------------------------------------------- 7.17 Workers' Compensation Insurance: the first aid corner of the shop */
  (function () {
    var X = 38, Y = 28, H = 28;
    var EMP = { who: 'raul', h: 26, shirt: P.red, hair: '#2b2018', vest: true }, MGR = { who: 'kim', h: 26, shirt: P.blue, shirtD: P.blueS, hair: '#1f1a17', skin: P.skin2, hat: '#d8dde1' };
    function world(g, fx, S) {
      room(g, 'd717', X, Y, H, { style: 'epoxy', a: '#2d3033', b: '#33373a', zones: [[18, 4, 14, 20, '#243329'], [2, 25, 34, 1, '#e0a43a']] }, { style: 'studs', tint: P.red });
      var L = g.list(), pics = ['plus', 'cal', 'coin'], i;
      for (i = 0; i < 3; i++) L.prop('hdsign', 3 + i * 8, 0, 2, { w: 7, h: 14, pic: pics[i], bg: S.ok[i] ? P.green : P.cream, fg: S.ok[i] ? '#0e2a1c' : P.creamInk });
      L.prop('machine', 0, 5, 0, { face: 'x', door: 0, lamp: 'green', run: 0 });
      L.prop('cabinet', 28, 0, 0, {});
      L.prop('hdsign', 28, 0, 16, { w: 7, h: 11, pic: 'plus', bg: P.cream, fg: P.red });
      L.prop('table', 14, 6, 0, { w: 14, d: 8, h: 9, top: 'wood' });
      if (S.form) L.prop('hdform', S.form[0], S.form[1], 9, { write: S.write, stamp: S.stamp });
      person(L, fx, S.mgr, MGR);
      person(L, fx, S.me, S.meOpt);
      L.flush();
    }
    function base() { return { ok: [0, 0, 0], form: null, write: 0, stamp: false, mgr: still(33, 18, 2), me: still(20, 18, 0), meOpt: EMP }; }
    var C1 = { x: 18, y: 12, zoom: 2, z: 8 }, C2 = { x: 22, y: 16, zoom: 2, z: 6 }, C3 = shift({ x: 22, y: 12, zoom: 2, z: 6 }, 54);
    var steps = [
      { title: 'Who is covered', sub: 'Work-related injuries, no-fault', dur: 7.5, cam: C1,
        cap: ['Medical treatment, leave, lost wages', 'Paid for by employers'],
        build: function (t, g, fx) {
          var S = base(); S.mgr = still(33, 15, 2); S.ok = [t > 2.0 ? 1 : 0, t > 3.6 ? 1 : 0, t > 5.2 ? 1 : 0];
          world(g, fx, S);
        } },
      { title: 'Tell your manager', sub: 'No matter how slightly', dur: 8, cam: C2, key: ['table'],
        cap: ['Report it immediately to your manager', 'Failure to report jeopardizes your claim'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 1, 1];
          S.me = fx.walk([[17, 18], [25, 18]], t, 0.8, 3.6, { endDir: 0, startDir: 0 });
          S.meOpt = ext(EMP, { arm: t > 3.8 ? 'out' : 'down' });
          S.mgr = still(33, 18, 2);
          world(g, fx, S);
        } },
      { title: 'Then tell HR', sub: 'Accident report and medical release', dur: 7.5, cam: C3, key: ['hdform'], big: { n: 'HR', label: 'immediately', pos: 'right' },
        cap: ['Notify HR of your claim', 'Fill out an accident report'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 1, 1];
          S.me = still(21, 17, 3); S.meOpt = ext(EMP, { arm: t > 1.0 && t < 5.2 ? 'write' : 'down' });
          S.mgr = still(33, 18, 2);
          S.form = [18, 8]; S.write = fx.E(t, 1.2, 4.8); S.stamp = t > 5.4;
          world(g, fx, S);
        } }
    ];
    reg('7.17', { title: 'Workers\' Compensation Insurance', std: 'Handbook, Benefits & Leave', blurb: 'What it covers, who to tell first and what to fill out.', backdrop: ['bands', '#1c1313', '#2a1a1a'], steps: steps });
  })();

  /* ---------------------------------------------------------------- 7.8 Family and Medical Leave (FMLA): the leave office */
  (function () {
    var X = 38, Y = 30, H = 28;
    var EMP = { who: 'pk', h: 26, shirt: P.red, hair: '#2b2018' }, HRP = { who: 'pam', h: 26, shirt: P.blue, shirtD: P.blueS, hair: '#1f1a17', skin: P.skin2, glasses: true };
    function world(g, fx, S) {
      room(g, 'd78', X, Y, H, { style: 'grid', a: '#2b3038', b: '#31363e', zones: [[8, 6, 26, 19, '#24364b']] }, { style: 'panel', tint: P.blue });
      var L = g.list(), i, pics = ['clock', 'doc', 'people'];
      for (i = 0; i < 3; i++) L.prop('hdsign', 4 + i * 8, 0, 2, { w: 7, h: 14, pic: pics[i], bg: S.ok[i] ? P.green : P.cream, fg: S.ok[i] ? '#0e2a1c' : P.creamInk });
      L.prop('hdcal', 0, 1, 2, { face: 'x', w: 20, h: 14, cols: 6, rows: 2, n: S.weeks });
      L.prop('hddoor', 0, 22, 0, { face: 'x', open: S.door });
      L.prop('desk', 14, 8, 0, { w: 16, d: 12 });
      L.prop('monitor', 15, 9, 9, { rows: 2 });
      L.prop('hdsign', 24, 9, 9, { w: 7, h: 14, pic: 'lock', bg: S.lock ? P.amber : P.cream });
      if (S.form) L.prop('hdform', S.form[0], S.form[1], 9, { write: S.write, stamp: S.stamp });
      L.prop('hdplant', 33, 4, 0, {});
      person(L, fx, S.hr, HRP);
      person(L, fx, S.me, S.meOpt);
      L.flush();
      for (i = 0; i < 3; i++) if (S.pulse[i]) { var q = g.proj(4 + i * 8 + 3, 0, 14); g.ring(q[0], q[1], 9, S.pulse[i], '#6ad79f'); }
    }
    function base() { return { ok: [0, 0, 0], pulse: [0, 0, 0], weeks: 0, lock: false, door: 0, form: null, write: 0, stamp: false, hr: still(10, 6, 0), me: still(22, 22, 3), meOpt: EMP }; }
    var C1 = { x: 16, y: 11, zoom: 2, z: 8 }, C2 = { x: 10, y: 18, zoom: 2, z: 8 }, C3 = shift({ x: 19, y: 16, zoom: 2, z: 6 }, 52);
    var steps = [
      { title: 'Who qualifies', sub: 'Time worked, hours, worksite size', dur: 7.5, cam: C1,
        cap: ['12 months at ADVANCED', '1,250 hours in the last 12 months'],
        build: function (t, g, fx) {
          var S = base(); S.me = fx.walk([[28, 22], [22, 22]], t, 0.3, 1.6, { endDir: 3 });
          for (var i = 0; i < 3; i++) { var a = 2.2 + i * 1.5; S.ok[i] = t > a ? 1 : 0; S.pulse[i] = t > a && t < a + 1.4 ? t : 0; }
          world(g, fx, S);
        } },
      { title: 'The leave', sub: 'Unpaid and job-protected', dur: 8, cam: C2, key: ['hdcal'],
        cap: ['Up to 12 weeks of unpaid leave', 'The job is protected'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 1, 1];
          S.weeks = Math.floor(fx.E(t, 1.0, 5.6) * 12.99);
          S.lock = t > 4.6;
          S.me = fx.walk([[22, 22], [4, 22], [4, 26]], t, 0.6, 4.4, { endDir: 2 });
          S.door = fx.E(t, 4.0, 5.4);
          world(g, fx, S);
        } },
      { title: 'Give notice', sub: 'Tell ADVANCED early', dur: 7, cam: C3, key: ['hdform'], big: { n: '12', label: 'weeks unpaid', pos: 'right' },
        cap: ["At least 30 days' notice", 'Medical certification forms from HR'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 1, 1]; S.weeks = 12; S.lock = true;
          S.meOpt = ext(EMP, { arm: t > 1.0 && t < 3.4 ? 'out' : 'down', hold: t > 1.0 && t < 2.4 ? P.paper : undefined });
          var k = fx.E(t, 2.2, 3.6);
          S.form = [Math.round(22 - 6 * k), 14]; if (t < 2.2) S.form = null;
          S.write = fx.E(t, 3.8, 5.4); S.stamp = t > 5.6;
          world(g, fx, S);
        } }
    ];
    reg('7.8', { title: 'Family and Medical Leave (FMLA)', std: 'Handbook, Benefits & Leave', blurb: 'Who qualifies, how the leave works and when to give notice.', backdrop: ['bands', '#13171c', '#1a2027'], steps: steps });
  })();

  /* ---------------------------------------------------------------- 7.9 Flexible Spending Account (FSA): the payroll counter */
  (function () {
    var X = 36, Y = 26, H = 26;
    var EMP = { who: 'forrest', h: 26, shirt: '#3f8f6a', shirtD: '#2b6a4d', hair: '#3a2c22' }, CLK = { who: 'dora', h: 26, shirt: P.amber, shirtD: P.amberD, hair: '#1f1a17', skin: P.skin3, glasses: true };
    function world(g, fx, S) {
      room(g, 'd79', X, Y, H, { style: 'checker', a: '#322e27', b: '#38342b', zones: [[4, 18, 28, 6, '#3a2e1c']] }, { style: 'tile', tint: P.amber });
      var L = g.list();
      L.prop('hdsign', 10, 0, 2, { w: 7, h: 14, pic: 'heart', bg: S.lit[0] ? '#f3d9a4' : P.cream, fg: P.red2 });
      L.prop('hdsign', 18, 0, 2, { w: 7, h: 14, pic: 'people', bg: S.lit[1] ? '#f3d9a4' : P.cream, fg: P.blueS });
      L.prop('wallclock', 27, 0, 8, { hour: S.hour, min: S.min });
      L.prop('counter', 4, 10, 0, { w: 28, d: 7, body: 'wood', top: 'metal' });
      L.prop('bin', 5, 12, 11, { col: 'blue', w: 6, d: 5, fill: S.fill[0], item: 'silver' });
      L.prop('bin', 26, 12, 11, { col: 'green', w: 6, d: 5, fill: S.fill[1], item: 'silver' });
      if (S.stub !== false) L.prop('paystub', 15, 12, 11, { rows: S.rows, total: S.tot });
      if (S.docs) L.prop('docs', S.docs[0], S.docs[1], 11, { n: 2, head: P.amber });
      L.prop('lamp', 12, 10, 11, { col: S.lamp, on: true });
      if (S.flow) { L.flow([[15, 15], [11, 15]], S.flow, { color: P.amber, z: 12, len: 2, gap: 2, speed: 9 }); L.flow([[26, 15], [30, 15]], S.flow, { color: P.amber, z: 12, len: 2, gap: 2, speed: 9 }); }
      person(L, fx, S.clerk, CLK);
      person(L, fx, S.me, S.meOpt);
      L.flush();
    }
    function base() { return { lit: [0, 0], hour: 9, min: 0, fill: [0, 0], rows: 0, tot: 0, docs: null, lamp: 'amber', flow: 0, clerk: still(18, 7, 1), me: still(20, 21, 3), meOpt: EMP }; }
    var C1 = { x: 17, y: 12, zoom: 2, z: 8 }, C2 = { x: 15, y: 11, zoom: 2, z: 10 }, C3 = shift({ x: 17, y: 14, zoom: 2, z: 6 }, 54);
    var steps = [
      { title: 'Eligible employees', sub: 'After the plan\'s waiting period', dur: 7.5, cam: C1,
        cap: ['For eligible employees', 'After the plan\'s defined waiting period'],
        build: function (t, g, fx) {
          var S = base(); S.me = fx.walk([[28, 21], [20, 21]], t, 0.3, 1.6, { endDir: 3 });
          var k = fx.E(t, 1.8, 5.0); S.hour = 9; S.min = Math.round(k * 59 * 3) % 60; S.hour = 9 + Math.floor(k * 3);
          S.lamp = t > 5.2 ? 'green' : 'amber'; S.lit = [t > 5.4 ? 1 : 0, t > 5.8 ? 1 : 0];
          world(g, fx, S);
        } },
      { title: 'Paid from your pay', sub: 'Pre-tax, each pay period', dur: 8, cam: C2, key: ['bin'],
        cap: ['Deducted from your pay each pay period', 'Amounts in and out are income tax free'],
        build: function (t, g, fx) {
          var S = base(); S.lamp = 'green'; S.lit = [1, 1];
          S.rows = 4; S.tot = 1; S.flow = t > 1.2 && t < 6.6 ? t : 0;
          S.fill = [Math.floor(fx.E(t, 1.6, 6.0) * 4.99), Math.floor(fx.E(t, 2.4, 6.4) * 4.99)];
          S.meOpt = ext(EMP, { arm: 'down' });
          world(g, fx, S);
        } },
      { title: 'Pick your amount', sub: 'You may elect an annual amount', dur: 7, cam: C3, key: ['docs'], big: { n: 'FSA', label: 'tax-free', pos: 'right' },
        cap: ['Limited by established plan maximums', 'Contact HR for the plan summary'],
        build: function (t, g, fx) {
          var S = base(); S.lamp = 'green'; S.lit = [1, 1]; S.rows = 4; S.tot = 1; S.fill = [4, 4];
          var k = fx.E(t, 2.0, 3.6);
          S.stub = false; S.docs = [Math.round(19 - 5 * k), 14]; if (t < 2.0) S.docs = [19, 14];
          S.clerk = still(18, 7, 1);
          S.meOpt = ext(EMP, { arm: t > 2.0 && t < 4.8 ? 'out' : 'down' });
          world(g, fx, S);
        } }
    ];
    reg('7.9', { title: 'Flexible Spending Account (FSA)', std: 'Handbook, Benefits & Leave', blurb: 'Two kinds of account, paid from your pay before tax.', backdrop: ['diag', '#1a160f', '#241e14'], steps: steps });
  })();

  /* ---------------------------------------------------------------- 8.1 Drug and Alcohol Policy: the entrance and the bench (calm, steady lights) */
  (function () {
    var X = 36, Y = 26, H = 26;
    var EMP = { who: 'steve', h: 26, shirt: P.red, hair: '#2b2018', vest: true }, MGR = { who: 'scott', h: 26, shirt: P.blue, shirtD: P.blueS, hair: '#1f1a17', skin: P.skin2, hat: '#d8dde1' };
    function world(g, fx, S) {
      room(g, 'd81', X, Y, H, { style: 'epoxy', a: '#222d30', b: '#273337', zones: [[2, 14, 8, 10, '#1f3a30']] }, { style: 'tile', tint: '#4a8f9f', line: '#2f4a50' });
      var L = g.list(), pics = ['clock', 'box'], i;
      for (i = 0; i < 2; i++) L.prop('hdsign', 4 + i * 8, 0, 2, { w: 7, h: 14, pic: pics[i], bg: S.ok[i] ? P.green : P.cream, fg: S.ok[i] ? '#0e2a1c' : P.creamInk });
      L.prop('cabinet', 22, 0, 0, {}); L.prop('cabinet', 30, 0, 0, {});
      L.prop('hddoor', 0, 16, 0, { face: 'x', w: 8, open: S.door });
      L.prop('table', 12, 8, 0, { w: 16, d: 7, h: 9, top: 'steel' });
      if (S.items !== false) { L.cyl(17, 11, 9, 1.4, 6, 'green', { rim: false }); L.cyl(17, 11, 15, 0.7, 3, 'green', { rim: false });
      L.cyl(21, 11, 9, 1.4, 4, 'blue', { rim: false });
      L.cyl(25, 11, 9, 1.2, 4, 'amber', { rim: false }); }
      if (S.form) L.prop('hdform', S.form[0], S.form[1], 9, { write: S.write });
      L.prop('lamp', 12, 8, 9, { col: S.lamp, on: false });
      if (S.mgr) person(L, fx, S.mgr, MGR);
      person(L, fx, S.me, S.meOpt);
      L.flush();
      for (i = 0; i < 3; i++) if (S.cut > i) { var xs = [17, 21, 25][i], q = g.proj(xs, 11, 12), a = 4 * g.Z; g.line(q[0] - a, q[1] - a, q[0] + a, q[1] + a, P.red); g.line(q[0] - a, q[1] + a, q[0] + a, q[1] - a, P.red); }
    }
    function base() { return { ok: [0, 0], door: 0, cut: 0, form: null, write: 0, lamp: 'amber', mgr: null, me: still(20, 20, 3), meOpt: EMP }; }
    var C1 = { x: 12, y: 15, zoom: 2, z: 8 }, C2 = { x: 20, y: 12, zoom: 2, z: 8 }, C3 = shift({ x: 18, y: 14, zoom: 2, z: 6 }, 56);
    var steps = [
      { title: 'On duty or on site', sub: 'Working or not, on company premises', dur: 7.5, cam: C1,
        cap: ['On duty or conducting ADVANCED business', 'On ADVANCED premises, working or not'],
        build: function (t, g, fx) {
          var S = base(); S.door = fx.E(t, 0.2, 0.9) * (t < 2.8 ? 1 : 1 - fx.E(t, 2.8, 3.5));
          S.me = fx.walk([[6, 20], [20, 20]], t, 0.8, 3.0, { endDir: 3, startDir: 0 });
          S.ok = [t > 3.6 ? 1 : 0, t > 5.2 ? 1 : 0];
          world(g, fx, S);
        } },
      { title: 'What is not allowed', sub: 'Alcohol, illegal drugs, impairing substances', dur: 8, cam: C2,
        cap: ['Use, or being under the influence', 'Possession, sale, purchase, transfer'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 1];
          S.cut = Math.floor(fx.E(t, 1.0, 5.0) * 3.99);
          world(g, fx, S);
        } },
      { title: 'Fit for duty', sub: 'Inform your manager of medication', dur: 7.5, cam: C3, key: ['hdform'], big: { n: 'FIT', label: 'for duty', pos: 'right' },
        cap: ['Report to work fit for duty', 'If it may impair, inform your manager'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 1]; S.lamp = t > 1.6 ? 'green' : 'amber'; S.mgr = still(24, 16, 2);
          S.me = still(18, 18, 0); S.meOpt = ext(EMP, { arm: t > 2.4 && t < 6.0 ? 'out' : 'down', hold: t > 2.4 && t < 5.6 ? P.paper : undefined });
          S.items = false; S.form = t > 5.8 ? [19, 8] : null; S.write = 1;
          world(g, fx, S);
        } }
    ];
    reg('8.1', { title: 'Drug and Alcohol Policy', std: 'Handbook, Safety', blurb: 'Where the policy applies, what is not allowed and being fit for duty.', backdrop: ['bands', '#12191a', '#18262a'], steps: steps });
  })();

  /* ---------------------------------------------------------------- 8.2 General Safety: the shop floor walkway (calm, steady lights) */
  (function () {
    var X = 40, Y = 28, H = 30;
    var EMP = { who: 'dora', h: 26, shirt: P.red, hair: '#2b2018', vest: true, hat: '#e8d88a' }, MGR = { who: 'kim', h: 26, shirt: P.blue, shirtD: P.blueS, hair: '#1f1a17', skin: P.skin2, vest: true, hat: '#d8dde1' };
    function world(g, fx, S) {
      room(g, 'd82', X, Y, H, { style: 'checker', a: '#262a22', b: '#2d3226', zones: [[2, 24, 36, 2, '#a8781f'], [2, 20, 36, 1, '#3c4430'], [14, 8, 18, 8, '#20241c']] }, { style: 'studs', tint: '#c9a42b' });
      var L = g.list(), pics = ['person', 'plus', 'check'], i;
      for (i = 0; i < 3; i++) L.prop('hdsign', 0, 4 + i * 8, 2, { face: 'x', w: 7, h: 14, pic: pics[i], bg: S.ok[i] ? P.green : P.cream, fg: S.ok[i] ? '#0e2a1c' : P.creamInk });
      L.prop('machine', 14, 0, 0, { lamp: 'green', door: 0, run: 0 });
      L.prop('cabinet', 33, 0, 0, {});
      L.prop('hdsign', 33, 0, 16, { w: 7, h: 11, pic: 'plus', bg: P.cream, fg: P.red });
      L.prop('hdbinder', 8, 8, 0, { col: P.amber });
      if (S.crate) { L.prop('crate', 20, 15, 0, { w: 7, d: 5, h: 7, tag: P.amber }); L.prop('lamp', 29, 16, 0, { col: 'amber', on: false }); }
      if (S.form) { L.prop('table', 20, 17, 0, { w: 12, d: 7, h: 9, top: 'steel' }); L.prop('hdform', 21, 17, 9, { write: S.write, stamp: S.stamp }); }
      if (S.mgr) person(L, fx, S.mgr, MGR);
      person(L, fx, S.me, S.meOpt);
      L.flush();
    }
    function base() { return { ok: [0, 0, 0], crate: false, form: false, write: 0, stamp: false, mgr: null, me: still(8, 22, 0), meOpt: EMP }; }
    var C1 = { x: 14, y: 12, zoom: 2, z: 8 }, C2 = { x: 24, y: 17, zoom: 2, z: 8 }, C3 = shift({ x: 25, y: 18, zoom: 2, z: 6 }, 56);
    var steps = [
      { title: 'Everyone\'s job', sub: 'A healthy and safe work environment', dur: 7.5, cam: C1,
        cap: ['The responsibility of all employees', 'Maintain a healthy, safe environment'],
        build: function (t, g, fx) {
          var S = base(); S.me = fx.walk([[8, 22], [14, 22]], t, 0.4, 1.8, { endDir: 3 });
          S.ok = [t > 2.2 ? 1 : 0, t > 3.8 ? 1 : 0, t > 5.4 ? 1 : 0];
          world(g, fx, S);
        } },
      { title: 'Spot it, report it', sub: 'Hazards and the safety rules', dur: 8, cam: C2, key: ['crate'],
        cap: ['Report any health or safety hazards', 'Follow the health and safety rules'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 1, 1]; S.crate = true; S.mgr = still(34, 22, 2);
          S.me = fx.walk([[14, 22], [17, 22], [28, 22]], t, 0.4, 5.0, { endDir: 0 });
          S.meOpt = ext(EMP, { arm: t > 1.2 && t < 2.6 ? 'out' : 'down' });
          world(g, fx, S);
        } },
      { title: 'Report injuries', sub: 'As soon as reasonably possible', dur: 7.5, cam: C3, key: ['hdform'], big: { n: 'FORM', label: 'for each incident', pos: 'right' },
        cap: ['Report illness or injury to your MANAGER', 'Complete an illness or injury form'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 1, 1]; S.mgr = still(34, 20, 2);
          S.me = still(17, 20, 0); S.meOpt = ext(EMP, { arm: t > 1.0 && t < 5.0 ? 'write' : 'down' });
          S.form = true; S.write = fx.E(t, 1.2, 4.8); S.stamp = t > 5.2;
          world(g, fx, S);
        } }
    ];
    reg('8.2', { title: 'General Safety', std: 'Handbook, Safety', blurb: 'Everyone keeps it safe, reports hazards and reports injuries.', backdrop: ['diag', '#191a12', '#242616'], steps: steps });
  })();

  /* ---------------------------------------------------------------- 8.3 Workplace Violence: the lobby (calm, steady lights) */
  (function () {
    var X = 30, Y = 28, H = 26;
    var EMP = { who: 'pam', h: 26, shirt: P.red, hair: '#2b2018' }, VIS = { who: 'kim', h: 26, shirt: '#3f8f6a', shirtD: '#2b6a4d', hair: '#6b4a2b', skin: P.skin3 }, CON = { who: 'forrest', h: 26, shirt: P.amber, shirtD: P.amberD, hair: '#1f1a17', skin: P.skin2, hat: '#d8dde1' }, MGR = { who: 'scott', h: 26, shirt: P.blue, shirtD: P.blueS, hair: '#8a8f94', skin: P.skin2, glasses: true };
    function world(g, fx, S) {
      room(g, 'd83', X, Y, H, { style: 'grid', a: '#2a2a2d', b: '#303034', zones: [[4, 6, 22, 18, '#25282c']] }, { style: 'tile', tint: '#8f979e', line: '#3a3d42' });
      var L = g.list();
      L.prop('hdsign', 4, 0, 2, { w: 7, h: 14, pic: 'people', bg: S.ok[0] ? P.green : P.cream, fg: S.ok[0] ? '#0e2a1c' : P.creamInk });
      L.prop('hdsign', 12, 0, 2, { w: 7, h: 14, pic: 'hand', bg: S.ok[1] ? '#f3d9a4' : P.cream, fg: P.creamInk });
      L.prop('hdsign', 22, 0, 2, { w: 7, h: 14, pic: 'lock', bg: S.ok[2] ? P.green : P.cream, fg: S.ok[2] ? '#0e2a1c' : P.creamInk });
      L.prop('hddoor', 0, 18, 0, { face: 'x', w: 8, open: S.door, col: P.st3 });
      L.prop('desk', 12, 4, 0, { w: 12, d: 6, top: 'steel' });
      L.prop('hdplant', 26, 20, 0, {});
      if (S.glass) L.glass(14, 14, 0, 2, 10, 16, 'silver', { dens: 0.14, topDens: 0, edge: P.st2 });
      if (S.p) S.p.forEach(function (q) { person(L, fx, q[0], q[1]); });
      L.flush();
    }
    function base() { return { ok: [0, 0, 0], door: 0, glass: false, p: null }; }
    var C1 = { x: 13, y: 15, zoom: 2, z: 8 }, C2 = { x: 15, y: 11, zoom: 2, z: 8 }, C3 = shift({ x: 9, y: 17, zoom: 2, z: 6 }, 56);
    var steps = [
      { title: 'Zero tolerance', sub: 'All individuals on company property', dur: 7.5, cam: C1,
        cap: ['Employees, contractors and visitors', 'On company property or business'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [t > 2.2 ? 1 : 0, 0, 0];
          S.p = [[still(10, 22, 3), EMP], [still(17, 22, 3), CON], [still(24, 22, 3), VIS], [still(12, 12, 1), MGR]];
          world(g, fx, S);
        } },
      { title: 'What is not allowed', sub: 'Acts or threats of violence', dur: 8, cam: C2,
        cap: ['Intimidation and harassment', 'Physical altercations and weapons'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, t > 1.4 ? 1 : 0, 0]; S.glass = true;
          S.p = [[still(8, 19, 0), EMP], [still(22, 19, 2), VIS]];
          world(g, fx, S);
        } },
      { title: 'Tell your manager', sub: 'Reports are investigated immediately', dur: 7.5, cam: C3, key: ['hddoor'], big: { n: 'ZERO', label: 'tolerance', pos: 'right' },
        cap: ['Investigated immediately; confidential', 'No retaliation for good-faith reports'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 1, t > 4.4 ? 1 : 0];
          S.door = fx.E(t, 0.6, 1.6);
          var w = fx.walk([[16, 22], [10, 22]], t, 1.2, 3.0, { endDir: 2 });
          S.p = [[w, ext(EMP, { arm: t > 3.2 ? 'out' : 'down' })], [still(3, 22, 0), MGR]];
          world(g, fx, S);
        } }
    ];
    reg('8.3', { title: 'Workplace Violence', std: 'Handbook, Safety', blurb: 'Zero tolerance, what is not allowed and how to report it.', backdrop: ['stripes', '#141414', '#1e1e1e'], steps: steps });
  })();

  /* ---------------------------------------------------------------- OK-Jury Duty Leave: from the work desk to the jury box */
  (function () {
    var X = 40, Y = 28, H = 28;
    var EMP = { who: 'randel', h: 26, shirt: P.red, hair: '#2b2018' }, MGR = { who: 'kim', h: 26, shirt: P.blue, shirtD: P.blueS, hair: '#1f1a17', skin: P.skin2, glasses: true };
    var JA = { who: 'steve', h: 26, shirt: '#3f8f6a', shirtD: '#2b6a4d', hair: '#8a8f94', skin: P.skin3 }, JB = { who: 'pk', h: 26, shirt: P.amber, shirtD: P.amberD, hair: '#1f1a17', skin: P.skin2 };
    function world(g, fx, S) {
      room(g, 'dJury', X, Y, H, { style: 'checker', a: '#2d2620', b: '#352d25', zones: [[3, 11, 16, 12, '#3a2a1c'], [20, 2, 18, 9, '#2a2018']] }, { style: 'panel', tint: P.woodT });
      var L = g.list();
      L.prop('hdsign', 22, 0, 2, { w: 7, h: 14, pic: 'scale', bg: S.ok ? P.green : P.cream, fg: S.ok ? '#0e2a1c' : P.creamInk });
      L.prop('wallclock', 31, 0, 8, { hour: S.hour, min: S.min });
      L.prop('hdsign', 0, 4, 2, { face: 'x', w: 7, h: 14, pic: 'doc', bg: S.sum ? P.amber : P.cream });
      L.prop('hdsign', 0, 12, 2, { face: 'x', w: 7, h: 14, pic: 'cal', bg: S.cal ? P.green : P.cream, fg: S.cal ? '#0e2a1c' : P.creamInk });
      L.prop('desk', 3, 12, 0, { w: 26, d: 9 });
      if (S.stubs) { L.prop('paystub', 5, 14, 9, { rows: 4, total: 1 }); L.prop('paystub', 17, 14, 9, { rows: 0, total: 0 }); }
      if (S.paper) L.prop('docs', S.paper[0], S.paper[1], 9, { n: 1, head: P.amber });
      L.box(20, 10, 0, 18, 1, 7, 'wood', { rim: false }); L.box(20, 2, 0, 1, 8, 7, 'wood', { rim: false }); L.box(37, 2, 0, 1, 8, 7, 'wood', { rim: false });
      L.box(22, 3, 0, 14, 3, 4, 'wood', { rim: false });
      if (S.mgr) person(L, fx, S.mgr, MGR);
      person(L, fx, S.me, S.meOpt);
      if (S.jur) { person(L, fx, still(22, 7, 1), JA); person(L, fx, still(36, 7, 1), JB); }
      L.flush();
      if (S.ring) { var q = g.proj(10, 16, 11); g.ring(q[0], q[1], 10, S.ring, P.redT, 0.5); }
    }
    function base() { return { ok: 0, hour: 9, min: 0, sum: 0, cal: 0, stubs: false, paper: null, ring: 0, jur: false, mgr: still(10, 9, 1), me: still(10, 24, 3), meOpt: EMP }; }
    var C1 = { x: 10, y: 17, zoom: 2, z: 8 }, C2 = { x: 17, y: 14, zoom: 2, z: 8 }, C3 = shift({ x: 30, y: 9, zoom: 2, z: 6 }, 56);
    var steps = [
      { title: 'Summoned for jury duty', sub: 'Notify your managers', dur: 7.5, cam: C1,
        cap: ['You are summoned for jury duty', 'Notify managers as soon as possible'],
        build: function (t, g, fx) {
          var S = base(); S.sum = t > 0.6 ? 1 : 0; S.paper = t > 0.6 && t < 3.0 ? [8, 15] : null;
          S.me = fx.walk([[16, 24], [10, 24]], t, 0.2, 1.0, { endDir: 3 });
          S.meOpt = ext(EMP, { arm: t > 3.0 && t < 5.6 ? 'out' : 'down' });
          S.ring = t > 3.4 && t < 5.8 ? t : 0; S.cal = t > 4.4 ? 1 : 0;
          world(g, fx, S);
        } },
      { title: 'How pay works', sub: 'Exempt and nonexempt differ', dur: 8, cam: C2,
        cap: ['Exempt: no pay deduction', 'Nonexempt: not compensated'],
        build: function (t, g, fx) {
          var S = base(); S.sum = 1; S.cal = 1; S.stubs = true; S.mgr = null;
          S.ok = t > 5.0 ? 1 : 0; S.hour = 9;
          world(g, fx, S);
        } },
      { title: 'Cover the time', sub: 'PTO and proof of service', dur: 7.5, cam: C3, big: { n: 'PTO', label: 'for unpaid leave', pos: 'right' },
        cap: ['Use PTO in place of unpaid leave', 'May require proof of service'],
        build: function (t, g, fx) {
          var S = base(); S.sum = 1; S.cal = 1; S.ok = 1; S.jur = true; S.mgr = null;
          S.me = still(29, 8, 1); S.meOpt = ext(EMP, { arm: t > 3.0 && t < 5.4 ? 'up' : 'down' });
          var k = fx.E(t, 0.6, 6.0); var m = 9 * 60 + k * 8 * 60; S.hour = Math.floor(m / 60) % 12; S.min = Math.round(m % 60);
          world(g, fx, S);
        } }
    ];
    reg('OK-Jury Duty Leave', { title: 'Jury Duty Leave', std: 'Handbook, Benefits & Leave, Oklahoma', blurb: 'Tell your managers, how pay works and covering the time.', backdrop: ['diag', '#16130f', '#221c14'], steps: steps });
  })();

  /* ---------------------------------------------------------------- OK-Voting Leave: the polling place */
  (function () {
    var X = 34, Y = 28, H = 26;
    var VOT = { who: 'raul', h: 26, shirt: P.red, hair: '#2b2018' }, POLL = { who: 'kim', h: 26, shirt: P.blue, shirtD: P.blueS, hair: '#8a8f94', skin: P.skin3, glasses: true }, MGR = { who: 'scott', h: 26, shirt: '#3f8f6a', shirtD: '#2b6a4d', hair: '#1f1a17', skin: P.skin2 };
    /* a voting booth: curtain open 0..1 */
    ISO.defineProp('hdbooth', [9, 7, 18], function (s, o) {
      var op = o.open === undefined ? 1 : o.open;
      s.B(0, 0, 0, 9, 7, 2, 'steel', { shadow: true });
      s.B(0, 0, 2, 1, 7, 14, 'steel', { rim: false }); s.B(8, 0, 2, 1, 7, 14, 'steel', { rim: false });
      s.B(1, 0, 2, 7, 1, 14, 'dark', { rim: false });
      s.B(0, 0, 16, 9, 7, 2, 'blue');
      s.B(1, 3, 8, 7, 3, 1, 'steel', { rim: false });
      var cw = Math.round(7 * (1 - op * 0.75));
      if (cw > 0) s.F(1, 2, cw, 13, { fill: P.blueT, border: P.blueS }, 7);
    });
    function world(g, fx, S) {
      room(g, 'dVote', X, Y, H, { style: 'checker', a: '#232a36', b: '#29313f', zones: [[8, 14, 16, 12, '#1d2530']] }, { style: 'panel', tint: P.blue });
      var L = g.list(), i;
      for (i = 0; i < 3; i++) L.prop('hdbooth', 3 + i * 11, 0, 0, { open: i === S.booth ? S.open : 1 });
      L.prop('hdsign', 0, 4, 2, { face: 'x', w: 7, h: 14, pic: 'vote', bg: S.ok ? P.green : P.cream, fg: S.ok ? '#0e2a1c' : P.creamInk });
      L.prop('hdcal', 0, 12, 3, { face: 'x', w: S.cw, h: 13, cols: S.cols, rows: 1, n: S.n, hi: S.hi, on: S.ink });
      L.prop('table', 6, 14, 0, { w: 14, d: 7, h: 9, top: 'wood' });
      if (S.sheet) L.prop('hdform', 9, 16, 9, { write: S.write, stamp: S.stamp });
      L.prop('bin', 27, 10, 0, { col: 'blue', w: 6, d: 6, h: 9 });
      if (S.mgr) person(L, fx, S.mgr, MGR);
      person(L, fx, S.poll, POLL);
      person(L, fx, S.me, S.meOpt);
      L.flush();
      if (S.ring) { var q = g.proj(30, 13, 12); g.ring(q[0], q[1], 9, S.ring, P.blueL, 0.5); }
    }
    function base() { return { booth: -1, open: 1, ok: 0, cw: 12, cols: 3, n: 0, hi: -1, ink: P.amberD, sheet: true, write: 0, stamp: false, ring: 0, mgr: null, poll: still(9, 11, 1), me: still(13, 25, 3), meOpt: VOT }; }
    var C1 = { x: 10, y: 15, zoom: 2, z: 8 }, C2 = { x: 18, y: 13, zoom: 2, z: 8 }, C3 = shift({ x: 14, y: 17, zoom: 2, z: 6 }, 56);
    var steps = [
      { title: 'Who gets time', sub: 'While the polls are open', dur: 7.5, cam: C1,
        cap: ['You are a registered voter', 'Less than 3 hours outside work to vote'],
        build: function (t, g, fx) {
          var S = base(); S.me = fx.walk([[20, 25], [13, 25]], t, 0.3, 1.4, { endDir: 3 });
          S.ok = t > 1.8 ? 1 : 0; S.n = Math.floor(fx.E(t, 2.6, 5.6) * 2.99);
          world(g, fx, S);
        } },
      { title: 'Two hours off', sub: 'Without loss of pay', dur: 8, cam: C2, key: ['hdbooth'],
        cap: ['2 hours off to vote', 'During your work hours'],
        build: function (t, g, fx) {
          var S = base(); S.ok = 1; S.cw = 8; S.cols = 2; S.n = Math.floor(fx.E(t, 0.8, 3.4) * 2.99); S.ink = P.greenD;
          S.me = fx.walk([[13, 25], [23, 25], [23, 11], [19, 11]], t, 1.0, 5.2, { endDir: 3 });
          S.booth = 1; S.open = t > 5.4 ? 1 - fx.E(t, 5.4, 6.2) : 1;
          world(g, fx, S);
        } },
      { title: 'Notice and proof', sub: 'Oral or written notice', dur: 7.5, cam: C3, key: ['hdform'], big: { n: '2', label: 'hours off', pos: 'right' },
        cap: ['Notice at least 3 days prior', 'Submit proof of voting'],
        build: function (t, g, fx) {
          var S = base(); S.ok = 1; S.cw = 16; S.cols = 4; S.n = Math.floor(fx.E(t, 0.6, 3.0) * 3.99); S.hi = t > 3.4 ? 3 : -1; S.ink = P.red;
          S.mgr = still(30, 19, 2); S.me = still(13, 25, 3);
          S.meOpt = ext(VOT, { arm: t > 4.0 && t < 6.6 ? 'out' : 'down', hold: t > 4.0 && t < 6.2 ? P.paper : undefined });
          S.ring = t > 3.4 && t < 6.6 ? t : 0;
          world(g, fx, S);
        } }
    ];
    reg('OK-Voting Leave', { title: 'Voting Leave', std: 'Handbook, Benefits & Leave, Oklahoma', blurb: 'Who gets time to vote, how much, and what to tell your manager.', backdrop: ['stripes', '#121820', '#18222e'], steps: steps });
  })();

  /* ---------------------------------------------------------------- 9.1 Confidentiality and Nondisclosure of Trade Secrets: the records vault */
  (function () {
    var X = 34, Y = 28, H = 28;
    var EMP = { who: 'pk', h: 26, shirt: P.red, hair: '#2b2018', badge: true }, VIS = { who: 'kim', h: 26, shirt: '#3f8f6a', shirtD: '#2b6a4d', hair: '#6b4a2b', skin: P.skin3 }, MGR = { who: 'kim', h: 26, shirt: P.blue, shirtD: P.blueS, hair: '#8a8f94', skin: P.skin2, glasses: true };
    /* the vault door in a wall: open 0..1 */
    ISO.defineProp('hdvault', [16, 3, 22], function (s, o) {
      var op = o.open || 0, i;
      s.B(0, 0, 0, 16, 3, 22, 'steel', { rim: false });
      s.F(1, 1, 14, 20, '#0c0e10', 3);
      for (i = 0; i < 3; i++) s.F(2 + i * 4, 2 + (i % 2) * 6, 3, 5, P.st1, 3);
      var dw = Math.round(14 * (1 - op * 0.8));
      if (dw > 0) {
        s.F(1, 1, dw, 20, { fill: '#3a4047', border: P.st3 }, 3);
        s.F(Math.max(2, dw - 8), 9, 2, 6, P.st3, 3); s.F(Math.max(2, dw - 10), 11, 6, 2, P.st3, 3); s.F(Math.max(2, dw - 8) + 0, 11, 2, 2, P.red, 3);
      }
    });
    function world(g, fx, S) {
      room(g, 'd91', X, Y, H, { style: 'epoxy', a: '#222a31', b: '#273038', zones: [[4, 10, 24, 14, '#1d252c']] }, { style: 'studs', tint: P.blue });
      var L = g.list(), pics = ['coin', 'star', 'people'], i;
      for (i = 0; i < 3; i++) {
        L.prop('cabinet', 6 + i * 9, 0, 0, {});
        L.prop('hdsign', 6 + i * 9, 8, 2, { w: 7, h: 12, pic: pics[i], bg: S.ok[i] ? P.green : P.cream, fg: S.ok[i] ? '#0e2a1c' : P.creamInk });
      }
      L.prop('hdvault', 0, 6, 0, { face: 'x', open: S.open });
      L.prop('scanner', 3, 23, 0, { face: 'x', lit: S.scan });
      if (S.rope) { L.box(6, 10, 0, 1, 1, 8, 'dark', { rim: false }); L.box(6, 19, 0, 1, 1, 8, 'dark', { rim: false }); L.box(6, 11, 7, 1, 8, 1, 'red', { rim: false }); }
      if (S.table) { L.prop('table', 14, 17, 0, { w: 12, d: 6, h: 9, top: 'wood' }); L.prop('hdform', 15, 17, 9, { write: S.write }); }
      if (S.mgr) person(L, fx, S.mgr, MGR);
      if (S.vis) person(L, fx, S.vis, VIS);
      person(L, fx, S.me, S.meOpt);
      L.flush();
    }
    function base() { return { ok: [0, 0, 0], open: 0, scan: false, rope: false, table: false, write: 0, mgr: null, vis: null, me: still(20, 18, 2), meOpt: EMP }; }
    var C1 = { x: 12, y: 8, zoom: 2, z: 8 }, C2 = { x: 12, y: 16, zoom: 2, z: 6 }, C3 = shift({ x: 18, y: 16, zoom: 2, z: 6 }, 56);
    var steps = [
      { title: 'What is protected', sub: 'Trade secrets and confidential information', dur: 7.5, cam: C1,
        cap: ['Financial or sales records', 'Customer lists, patents, trademarks'],
        build: function (t, g, fx) {
          var S = base(); S.me = fx.walk([[24, 16], [20, 16]], t, 0.3, 1.2, { endDir: 2 });
          S.ok = [t > 1.8 ? 1 : 0, t > 3.4 ? 1 : 0, t > 5.0 ? 1 : 0];
          world(g, fx, S);
        } },
      { title: 'Need to know', sub: 'Access is limited', dur: 8, cam: C2, key: ['hdvault'],
        cap: ['Access is limited to need to know', 'Not for personal benefit'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 1, 1]; S.rope = true;
          S.vis = still(12, 11, 2);
          S.me = fx.walk([[18, 24], [8, 24], [8, 22]], t, 0.6, 2.8, { endDir: 2 });
          S.scan = t > 3.0 && t < 6.0; S.open = fx.E(t, 3.4, 4.6) * (t < 6.0 ? 1 : 1 - fx.E(t, 6.0, 7.0));
          S.meOpt = ext(EMP, { arm: t > 2.8 && t < 4.0 ? 'out' : 'down', card: t > 2.8 && t < 4.0 ? P.red : undefined });
          world(g, fx, S);
        } },
      { title: 'If you suspect a leak', sub: 'Suspect that employees are sharing it', dur: 7.5, cam: C3, key: ['hdform'], big: { n: 'HR', label: 'or your manager', pos: 'right' },
        cap: ['Inform your manager or HR', 'May result in disciplinary action'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 1, 1]; S.table = true; S.write = fx.E(t, 1.4, 4.4);
          S.me = still(13, 20, 0); S.mgr = still(28, 20, 2);
          S.meOpt = ext(EMP, { arm: t > 1.0 && t < 4.6 ? 'write' : 'down' });
          world(g, fx, S);
        } }
    ];
    reg('9.1', { title: 'Confidentiality and Nondisclosure of Trade Secrets', std: 'Handbook, Trade Secrets', blurb: 'What is protected, who gets in and who to tell if you suspect a leak.', backdrop: ['stripes', '#0e1418', '#141d24'], steps: steps });
  })();

  /* ---------------------------------------------------------------- CLOSE-Acknowledgment of Receipt and Review: the signature desk */
  (function () {
    var X = 28, Y = 26, H = 24;
    var EMP = { who: 'forrest', h: 26, shirt: P.red, hair: '#2b2018' }, HRP = { who: 'pam', h: 26, shirt: P.blue, shirtD: P.blueS, hair: '#1f1a17', skin: P.skin2, glasses: true };
    function world(g, fx, S) {
      room(g, 'dAck', X, Y, H, { style: 'grid', a: '#232830', b: '#292f38', zones: [[6, 6, 18, 16, '#1c2230']] }, { style: 'panel', tint: '#a8781f' });
      var L = g.list(), pics = ['box', 'doc', 'check'], i;
      for (i = 0; i < 3; i++) L.prop('hdsign', 3 + i * 8, 0, 2, { w: 7, h: 14, pic: pics[i], bg: S.ok[i] ? P.green : P.cream, fg: S.ok[i] ? '#0e2a1c' : P.creamInk });
      L.prop('cabinet', 0, 17, 0, { face: 'x' });
      L.prop('desk', 8, 7, 0, { w: 16, d: 12 });
      L.prop('hdbinder', 9, 8, 9, { col: P.red });
      if (S.contract) { L.prop('docs', 16, 8, 9, { n: 2, head: P.st2 }); L.prop('hdsign', 16, 14, 9, { w: 7, h: 12, pic: 'cross', bg: P.cream, fg: P.red2 }); }
      if (S.lockSign) L.prop('hdsign', 9, 14, 9, { w: 7, h: 12, pic: 'lock', bg: S.lockSign === 2 ? P.amber : P.cream });
      if (S.form) L.prop('hdform', 14, 13, 9, { write: S.write, stamp: S.stamp, ink: P.blue });
      L.prop('hdplant', 24, 22, 0, {});
      person(L, fx, S.hr, HRP);
      person(L, fx, S.me, S.meOpt);
      L.flush();
    }
    function base() { return { ok: [0, 0, 0], contract: false, lockSign: 0, form: false, write: 0, stamp: false, hr: still(5, 11, 0), me: still(16, 22, 3), meOpt: EMP }; }
    var C1 = { x: 15, y: 11, zoom: 2, z: 8 }, C2 = { x: 17, y: 14, zoom: 2, z: 8 }, C3 = shift({ x: 14, y: 15, zoom: 2, z: 6 }, 56);
    var steps = [
      { title: 'What you confirm', sub: 'You received and read the handbook', dur: 7.5, cam: C1,
        cap: ['You received a copy of the handbook', 'You have read it and understand it'],
        build: function (t, g, fx) {
          var S = base(); S.me = fx.walk([[22, 22], [16, 22]], t, 0.3, 1.3, { endDir: 3 });
          S.ok = [t > 1.8 ? 1 : 0, t > 3.6 ? 1 : 0, t > 5.4 ? 1 : 0];
          world(g, fx, S);
        } },
      { title: 'What it does not do', sub: 'Only the CEO can approve changes', dur: 8, cam: C2, key: ['docs'],
        cap: ['It is not a contract of employment', 'Changes only if approved in writing'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 1, 1]; S.contract = t > 0.8; S.lockSign = t > 4.6 ? 2 : (t > 4.0 ? 1 : 0);
          S.hr = still(5, 11, 0);
          world(g, fx, S);
        } },
      { title: 'Sign and date', sub: 'Print name. Contact HR with questions', dur: 7.5, cam: C3, key: ['hdform'], big: { n: 'SIGN', label: 'and date', pos: 'right' },
        cap: ['Sign, date and print your name', 'Questions? Contact HR'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 1, 1]; S.form = true; S.write = fx.E(t, 1.2, 4.6); S.stamp = t > 5.0;
          S.meOpt = ext(EMP, { arm: t > 1.0 && t < 4.8 ? 'write' : 'down' });
          S.hr = still(5, 11, 0);
          world(g, fx, S);
        } }
    ];
    reg('CLOSE-Acknowledgment of Re', { title: 'Acknowledgment of Receipt and Review', std: 'Handbook, Closing', blurb: 'What you confirm by signing, what the handbook is not, and how to sign.', backdrop: ['bands', '#13151a', '#1b1f26'], steps: steps });
  })();

  /* ---------------------------------------------------------------- CLOSE-Closing Statement: the welcome lobby */
  (function () {
    var X = 30, Y = 26, H = 26;
    var A = { who: 'steve', h: 26, shirt: P.red, hair: '#2b2018' }, B = { who: 'randel', h: 26, shirt: P.blue, shirtD: P.blueS, hair: '#1f1a17', skin: P.skin2 }, C = { who: 'kim', h: 26, shirt: '#3f8f6a', shirtD: '#2b6a4d', hair: '#6b4a2b', skin: P.skin3 };
    /* a handbook: open 0..1 */
    ISO.defineProp('hdbook', [8, 6, 4], function (s, o) {
      var op = o.open || 0;
      s.B(0, 0, 0, 8, 6, 1, 'red', { shadow: true });
      if (op > 0.5) { s.B(1, 1, 1, 3, 4, 1, 'paper', { rim: false }); s.B(4, 1, 1, 3, 4, 1, 'paper', { rim: false }); s.top(1, 2, 2, 1, 2, P.line); s.top(5, 2, 2, 1, 2, P.line); s.top(1, 3, 2, 1, 2, P.line); s.top(5, 3, 2, 1, 2, P.line); }
      else s.B(0, 0, 1, 8, 6, 2, 'red');
    });
    function world(g, fx, S) {
      room(g, 'dClose', X, Y, H, { style: 'checker', a: '#2e2a26', b: '#35302a', zones: [[6, 8, 18, 14, '#3a2a1c']] }, { style: 'panel', tint: '#c9952b' });
      var L = g.list(), pics = ['star', 'cal', 'people', 'doc'], i;
      for (i = 0; i < 4; i++) L.prop('hdsign', 2 + i * 7, 0, 2, { w: 7, h: 14, pic: pics[i], bg: S.ok[i] ? P.green : P.cream, fg: S.ok[i] ? '#0e2a1c' : P.creamInk });
      L.prop('hddoor', 0, 16, 0, { face: 'x', w: 8, open: 0 });
      L.prop('table', 11, 9, 0, { w: 8, d: 6, h: 9, top: 'wood' });
      L.prop('hdbook', 11, 10, 9, { open: S.book });
      L.prop('hdplant', 25, 6, 0, {}); L.prop('hdplant', 4, 4, 0, {});
      S.p.forEach(function (q) { person(L, fx, q[0], q[1]); });
      L.flush();
      if (S.ring) { var r = g.proj(15, 12, 11); g.ring(r[0], r[1], 10, S.ring, P.redT, 0.5); }
    }
    function base() { return { ok: [0, 0, 0, 0], book: 0, ring: 0, p: [] }; }
    var C1 = { x: 12, y: 12, zoom: 2, z: 8 }, C2 = { x: 14, y: 9, zoom: 2, z: 8 }, C3 = shift({ x: 14, y: 14, zoom: 2, z: 6 }, 56);
    var steps = [
      { title: 'Thank you', sub: 'For reading our handbook', dur: 7, cam: C1,
        cap: ['Thank you for reading our handbook', 'We hope it provided an understanding'],
        build: function (t, g, fx) {
          var S = base(); S.book = fx.E(t, 0.8, 2.0); S.ring = t > 2.2 && t < 6.4 ? t * 0.9 : 0;
          S.p = [[still(15, 18, 3), ext(A, { arm: t > 2.4 ? 'out' : 'down' })]];
          world(g, fx, S);
        } },
      { title: 'What it gave you', sub: 'Mission, history, structure, policies', dur: 8, cam: C2,
        cap: ['Our mission, history and structure', 'Current policies and guidelines'],
        build: function (t, g, fx) {
          var S = base(); S.book = 1; S.ok = [t > 1.2 ? 1 : 0, t > 2.6 ? 1 : 0, t > 4.0 ? 1 : 0, t > 5.4 ? 1 : 0];
          S.p = [[still(15, 18, 3), A]];
          world(g, fx, S);
        } },
      { title: 'Working together', sub: 'Safe, productive and pleasant', dur: 7.5, cam: C3, big: { n: 'THANK', label: 'you', pos: 'right' },
        cap: ['We look forward to working with you', 'A safe, productive, pleasant workplace'],
        build: function (t, g, fx) {
          var S = base(); S.book = 1; S.ok = [1, 1, 1, 1];
          S.p = [[still(9, 18, 3), ext(A, { hold: P.red })], [still(15, 18, 3), ext(B, { hold: P.red })], [still(21, 18, 3), ext(C, { hold: P.red })]];
          world(g, fx, S);
        } }
    ];
    reg('CLOSE-Closing Statement', { title: 'Closing Statement', std: 'Handbook, Closing', blurb: 'Thanks for reading, what the handbook gave you and working together.', backdrop: ['diag', '#1a1314', '#261b1d'], steps: steps });
  })();

  /* ---------------------------------------------------------------- OK-Workplace Smoking: the office, the client area and the restroom */
  (function () {
    var X = 36, Y = 28, H = 26;
    var EMP = { who: 'dora', h: 26, shirt: P.red, hair: '#2b2018' }, CLI = { who: 'kim', h: 26, shirt: '#3f8f6a', shirtD: '#2b6a4d', hair: '#6b4a2b', skin: P.skin3 };
    PIC.vape = ['.#.#.', '#####', '..#..', '..#..', '..#..'];
    function world(g, fx, S) {
      room(g, 'dSmoke', X, Y, H, { style: 'tile', a: '#2c2623', b: '#322a26', zones: [[1, 1, 34, 8, '#26303a'], [1, 10, 34, 8, '#3a2e24'], [1, 19, 34, 8, '#24342f']] }, { style: 'panel', tint: '#c9733a' });
      var L = g.list(), i, pic = ['cig', 'cig', 'cig'];
      for (i = 0; i < 3; i++) L.prop('hdsign', 0, 1 + i * 9, 2, { face: 'x', w: 8, h: 15, pic: S.vape ? 'vape' : pic[i], over: 'no', bg: S.ok[i] ? '#f3d9a4' : P.cream, fg: P.creamInk });
      L.box(2, 9, 0, 33, 1, 4, 'steel', { rim: false }); L.box(2, 18, 0, 33, 1, 4, 'steel', { rim: false });
      L.prop('desk', 2, 2, 0, { w: 14, d: 6 }); L.prop('monitor', 4, 3, 9, { rows: 1 });
      L.prop('table', 16, 12, 0, { w: 10, d: 5, h: 7, top: 'wood' }); L.prop('stool', 12, 12, 0, { col: 'amber' }); L.prop('stool', 28, 13, 0, { col: 'amber' });
      L.prop('cabinet', 26, 20, 0, {}); L.prop('bin', 14, 21, 0, { col: 'steel', w: 5, d: 5, h: 6 });
      L.prop('hdplant', 32, 12, 0, {});
      person(L, fx, S.me, EMP); if (S.cli) person(L, fx, S.cli, CLI);
      L.flush();
    }
    function base() { return { ok: [0, 0, 0], vape: false, me: still(22, 6, 1), cli: still(9, 14, 0) }; }
    var C1 = { x: 12, y: 14, zoom: 2, z: 8 }, C2 = { x: 12, y: 9, zoom: 2, z: 10 }, C3 = shift({ x: 14, y: 14, zoom: 2, z: 8 }, 56);
    var steps = [
      { title: 'Where it applies', sub: 'Office, client areas, restrooms', dur: 7.5, cam: C1,
        cap: ['In the office', 'In client areas and restrooms'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [t > 1.4 ? 1 : 0, t > 3.0 ? 1 : 0, t > 4.6 ? 1 : 0]; S.cli = null; S.me = still(22, 6, 1);
          S.cli = t > 2.4 ? still(9, 14, 0) : null;
          world(g, fx, S);
        } },
      { title: 'Smoking and vaping', sub: 'Both are prohibited', dur: 8, cam: C2,
        cap: ['Smoking is prohibited', 'Vaping is prohibited too'],
        build: function (t, g, fx) {
          var S = base(); S.vape = t > 4.2; S.ok = [1, 1, 1]; S.cli = still(9, 14, 0);
          world(g, fx, S);
        } },
      { title: 'Why it matters', sub: 'The effect on employees and clients', dur: 7.5, cam: C3, big: { n: 'NO', label: 'smoking, vaping', pos: 'right' },
        cap: ['Concern for employees and clients', 'Smoking and secondhand smoke inhalation'],
        build: function (t, g, fx) {
          var S = base(); S.ok = [1, 1, 1]; S.cli = still(9, 14, 0);
          world(g, fx, S);
        } }
    ];
    reg('OK-Workplace Smoking', { title: 'Workplace Smoking', std: 'Handbook, Safety, Oklahoma', blurb: 'Where smoking and vaping are prohibited, and why.', backdrop: ['bands', '#1a1512', '#251c16'], steps: steps });
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
    "7.13": {"2":{"cam":12}},
    "7.14": {"3":{"who":{"dora":[0,1]}}},
    "7.15": {"1":{"who":{"kim":[0,-2]}},"2":{"cam":8,"who":{"kim":[2,-2]}},"3":{"who":{"kim":[2,-2]}}},
    "7.8": {"3":{"cam":16}},
    "7.9": {"1":{"who":{"forrest":[0,1]}},"2":{"who":{"forrest":[0,1]}}},
    "8.1": {"3":{"who":{"scott":[0,1]}}},
    "8.3": {"1":{"who":{"scott":[-2,-5],"forrest":[-1,0]}},"3":{"who":{"scott":[1,1]}}},
    "OK-Jury Duty Leave": {"3":{"who":{"steve":[1,1],"pk":[-1,1]}}},
    "OK-Voting Leave": {"1":{"who":{"kim":[1,0]}},"2":{"who":{"kim":[-1,-1]}}},
    "9.1": {"3":{"who":{"pk":[-1,0]}}},
    "CLOSE-Acknowledgment of Re": {"1":{"who":{"pam":[-2,-2]}},"2":{"cam":4,"who":{"forrest":[2,2]}},"3":{"cam":4,"who":{"forrest":[2,2]}}},
    "CLOSE-Closing Statement": {"3":{"who":{"randel":[-1,0]}}}
  };
  if (!globalThis.HB_NOFIX) applyFix(HB, FIX);
  /*FIX:END*/

  if (typeof module !== 'undefined' && module.exports) module.exports = HB;
})(typeof window !== 'undefined' ? window : this);
