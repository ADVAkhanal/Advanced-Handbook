/* global module, require */
/* ============================================================================================================
   iso-explainer.js  -  step-by-step isometric explainer framework (needs iso-kit.js loaded first)

   VERSION 1.1  (ISOX.version)
   Changelog
     1.1  Text is sized with clamp(MIN px, cqi, MAX px): sign title >= 15 px, caption >= 14 px, subtitle / chips / notes / tag >= 12 px,
          big card label >= 15 px. Layout rule: on a stage narrower than ISOX.NARROW (560 px) only the sign title and the caption stay
          in the picture; the subtitle, speed tag, chips and notes move into an HTML panel directly under the picture (nothing is hidden,
          nothing is below its minimum). Wide stages keep the established look.
          Big number card: big.size 's' | 'm' | 'l' (default: auto by text length, shrink to fit, 's' never wider than 38 % of the stage,
          'm' 46 %, 'l' 58 %), big.pos left | right | bottom-left | bottom-right | center | auto (auto = the side opposite the step's
          focus: { x, y } in world coordinates, or opposite the key props and people when there is no focus).
          Keep-out: ISOX.zones(stage, step) (sign, tag, caption, card, free band), ISOX.fit(worldBox, opts) (camera that frames a world
          box into the free band), ISOX.plan(spec, i, stageW) (the camera nudge that keeps key props and people out from under the sign,
          caption and card; the world is never moved), console warnings with ?isxdebug.
          Sign bulbs and flicker never hide text; no flicker in the first 1.2 s or under reduced motion. Control hint text is lighter.
          cam.cut: true switches a zoom change with a one frame cut instead of the dither. cam.fill: 'width' (or spec.fill / mount option
          fill) fills the 16:9 stage with the 4:3 picture, no side bands. Fonts can be set with --isx-display and --isx-body.
          Merged from the Portal copy: reduced motion also follows the lobby's .pv2.reduce switch, step.tag === false hides the speed tag,
          a bubbling 'isx-step' DOM event per step, note chips are pushed back inside the picture and off the sign (now also off the
          caption and the card).
     1.0  First release: steps, sign, speed tag, captions, notes, big card, ticks, controls, keys, TV mode, one shared loop.

   A SPEC describes one explainer:
     { id, title, std,                    // title for the page, std = the plain source line ("Shop habit")
       W, H,                              // optional logical canvas, default 240 x 180 (4:3) or 320 x 180 (16:9)
       bg,                                // background colour behind the scene, default ISO.P.bg
       backdrop: ['bands', '#15171a', '#20252a'],  // optional patterned backdrop: 'bands' | 'stripes' | 'diag', base colour, line colour
       camDur,                            // seconds the camera takes to reach each step's framing (default 1)
       fill,                              // 'width': a 16:9 stage shows the 4:3 picture filling the width (no side bands)
       nudge,                             // false turns the automatic keep-out camera nudge off
       steps: [ {
         title: 'READ THE LIST',          // marquee title (upper case, 24 characters or fewer)
         sub:   'Top job goes first',     // marquee subtitle
         dur:   7,                        // seconds
         cam:   { x: 26, y: 14, zoom: 1, z: 0, cut: false, fill: 'width' }, // world point at the picture centre, zoom 1 or 2 (integer)
         tag:   'REAL SPEED',             // speed tag: 'REAL SPEED' | 'SLOWER' | '10x SLOWER'; false hides it
         chips: ['List', 'Cut', 'Check'], // optional chips in the sign, the active one is red
         chipAt: function (t) { return 0; }, // optional: which chip is active at step time t
         cap:   ['First caption', 'Second caption'],   // captions under the picture: 12-48% and 50-94% of the step
         notes: [ { a: 1, b: 4, x: 120, y: 60, text: '2 x 40' } ], // tiny cream chips at canvas x,y
         key:   ['crate'],                // prop kinds that must stay clear of the sign, caption and card (people always must)
         focus: { x: 20, y: 10 },         // optional world point of interest (the card goes to the other side with pos 'auto')
         big:   { n: '7', label: 'jobs leave today', size: 'm', pos: 'auto' },  // makes this the final big-number card step
         build: function (t, g, fx) { ... }            // draws the whole picture for local time t (a pure function)
       } ] }

   build(t, g, fx):  t = seconds since the step began.  g = the ISO kit (camera already set, canvas already cleared).
   fx = { W, H, i, dur, E, seg, ez, clamp, lerp, rnd, reveal(t,a,b), pulse(t,per), blink(t,per), cycle(t,per),
          walk(path,t,a,b,opts), who(w,opts), steps count n, stage(i) ... }
   Everything must be a pure function of (step, t): no Date.now(), no Math.random().

   ISOX.define(spec)                       register (returns spec)
   ISOX.mount(element, spec, options)      DOM instance: marquee, speed tag, captions, notes, ticks, controls, keys
        options: { aspect: '4:3' | '16:9', fill: 'width', controls: true, autoplay: true, loop: true, onEnd: fn, tv: false, nudge: true }
        returns inst with  play() pause() toggle() next() back() replay() goto(i) drawAt(i,t) destroy()
   ISOX.render(spec, g, i, t, opts)        headless pure render of step i at time t into any ISO kit (used by the checkers);
                                           opts { stageW, aspect, fill } also applies the keep-out camera nudge for that stage width
   ISOX.timeline(spec)                     { starts: [...], total }
   ISOX.stepAt(spec, T)                    { i, t } for a timeline time
   ISOX.tv(specs, options)                 full screen TV mode: plays the explainers one after another
   ISOX.sizes(stageW, o)                   pixel size of every text element for a stage width (pure)
   ISOX.zones(stage, step, o)              sign / tag / caption / card / free band in canvas pixels (stage = width in px, or an instance)
   ISOX.fit(worldBox, o)                   a { x, y, z, zoom } camera that frames a world box [x0,y0,z0,x1,y1,z1] into the free band
   ISOX.plan(spec, i, stageW, o)           { dx, dy, ... } the camera nudge for step i at a stage width (pure, cached)
   ============================================================================================================ */
(function (root) {
  'use strict';
  var ISO = root.ISO || (typeof require === 'function' ? require('./iso-kit.js') : null);
  var P = ISO.P;

  function clamp(x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return x < a ? a : x > b ? b : x; }
  function seg(t, a, b) { return clamp((t - a) / (b - a)); }
  function ez(x) { return x * x * (3 - 2 * x); }
  function E(t, a, b) { return ez(seg(t, a, b)); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  var rnd = ISO.rnd;

  var DEF_CAM = { x: 26, y: 14, zoom: 1 };
  var VERSION = '1.1';
  var NARROW = 560;            /* a stage narrower than this (px) uses the panel layout */
  var CY = 98;                 /* canvas row of the picture centre (see iso-kit: cy) */
  var FLICKER_FREE_MS = 1200;  /* no sign flicker for this long after mount */

  /* ------------------------------------------------------------------ text sizes: [min px, cqi factor, max px] */
  var SZ = {
    title: [15, 4.8, 80], sub: [12, 1.95, 34], chip: [12, 1.45, 28], note: [12, 1.9, 32], cap: [14, 3, 56], tag: [12, 1.7, 30],
    badge: [14, 3.6, 44], bigL: [15, 6, 64], tick: [6, 1.1, 20], mqBorder: [2, 0.55, 8], gap: [4, 0.7, 14]
  };
  /* the panel under a narrow picture uses fixed sizes (a phone is a phone) */
  var PANEL = { sub: 14, chip: 13, note: 13, tag: 12 };
  var BIG_FRAC = { s: 0.38, m: 0.46, l: 0.58 };      /* widest the card may be, as a share of the stage width */
  var BIG_N_PREF = { s: 11.5, m: 15, l: 19 };        /* preferred number size in cqi per card size */
  var BIG_L_PREF = { s: 3.6, m: 4.6, l: 6 };         /* preferred label size in cqi */
  var BIG_N_MIN = 34;

  function uOf(stageW, wide169) { return stageW / 100 * (wide169 ? 0.75 : 1); }
  function px1(key, u) { var s = SZ[key]; return Math.round(Math.min(s[2], Math.max(s[0], s[1] * u)) * 10) / 10; }
  function cssClamp(key) { var s = SZ[key]; return 'clamp(' + s[0] + 'px,calc(var(--u)*' + s[1] + '),' + s[2] + 'px)'; }
  function modeOf(stageW) { return stageW < NARROW ? 'narrow' : 'wide'; }

  /* pixel size of every text element at a stage width. o: { aspect: '4:3' | '16:9' } */
  function sizes(stageW, o) {
    o = o || {};
    var u = uOf(stageW, o.aspect === '16:9'), r = {};
    Object.keys(SZ).forEach(function (k) { r[k] = px1(k, u); });
    r.u = u; r.mode = modeOf(stageW); r.panel = PANEL;
    return r;
  }

  /* text width estimates (px), deliberately on the wide side so keep-out zones are never too small */
  var EM = { rale: 0.74, raleMix: 0.6, bebas: 0.56 };
  function tw(text, px, kind, ls) { return String(text || '').length * px * ((EM[kind] || 0.6) + (ls || 0)); }

  /* ------------------------------------------------------------------ geometry: canvas <-> stage pixels */
  function geom(stageW, o) {
    o = o || {};
    var wide169 = o.aspect === '16:9', fill = o.fill === 'width' && wide169;
    var W = o.W || (wide169 && !fill ? 320 : 240), H = o.H || 180;
    var stageH = wide169 ? stageW * 9 / 16 : stageW * 0.75;
    var scale = stageW / W, top = fill ? stageH / 2 - CY * scale : 0;
    return { W: W, H: H, stageW: stageW, stageH: stageH, scale: scale, top: top, wide169: wide169, fill: fill };
  }
  function toCanvas(G, r) { return [r[0] / G.scale, (r[1] - G.top) / G.scale, r[2] / G.scale, (r[3] - G.top) / G.scale]; }
  function ovl(a, b) { return Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1])); }
  function area(a) { return Math.max(0, a[2] - a[0]) * Math.max(0, a[3] - a[1]); }

  /* ------------------------------------------------------------------ big card layout (pure) */
  function bigLayout(big, stageW, o) {
    o = o || {};
    var u = uOf(stageW, o.aspect === '16:9'), n = String(big.n === undefined ? '' : big.n), lab = String(big.label || '');
    var padX = Math.max(8, 2.2 * u), padY = Math.max(6, 1 * u), bd = Math.max(3, 0.7 * u);
    var lMin = SZ.bigL[0];
    function fit(sz) {
      var maxW = BIG_FRAC[sz] * stageW, inner = maxW - 2 * padX - 2 * bd;
      var nPx = Math.max(BIG_N_MIN, BIG_N_PREF[sz] * u), lPx = clamp(BIG_L_PREF[sz] * u, lMin, SZ.bigL[2]);
      var nW = tw(n, nPx, 'bebas', 0.0), lW = tw(lab, lPx, 'bebas', 0.04);
      if (nW > inner) { nPx = Math.max(BIG_N_MIN, nPx * inner / nW); nW = tw(n, nPx, 'bebas', 0.0); }   /* shrink the number a little before asking for a bigger card */
      var ok = nW <= inner && Math.ceil(lW / Math.max(1, inner)) <= (sz === 'l' ? 3 : 2);
      return { size: sz, nPx: nPx, lPx: lPx, nW: nW, lW: lW, inner: inner, maxW: maxW, ok: ok };
    }
    var size = big.size, f;
    if (size === 's' || size === 'm' || size === 'l') f = fit(size);
    else {
      f = fit('s'); if (!f.ok) { f = fit('m'); if (!f.ok) f = fit('l'); }
      size = f.size;
    }
    /* shrink to fit the width of its size class (never below the minimums) */
    if (!f.ok) {
      var k = Math.min(1, f.inner / Math.max(1, f.nW));
      f.nPx = Math.max(BIG_N_MIN, f.nPx * k);
      var k2 = Math.min(1, f.inner / Math.max(1, f.lW));
      f.lPx = Math.max(lMin, f.lPx * k2);
      f.nW = tw(n, f.nPx, 'bebas', 0); f.lW = tw(lab, f.lPx, 'bebas', 0.04);
    }
    var lines = Math.max(1, Math.ceil(f.lW / Math.max(1, f.inner)));
    var w = Math.min(f.maxW, Math.max(f.nW, Math.min(f.lW, f.inner)) + 2 * padX + 2 * bd);
    if (f.nW + 2 * padX + 2 * bd > w) w = Math.min(Math.max(w, f.nW + 2 * padX + 2 * bd), Math.max(f.maxW, f.nW + 2 * padX + 2 * bd));
    var h = f.nPx * 0.82 + Math.max(6, 0.8 * u) + lines * f.lPx * 1.0 + 2 * padY + 2 * bd;
    return { size: size, nPx: Math.round(f.nPx * 10) / 10, lPx: Math.round(f.lPx * 10) / 10, w: w, h: h, lines: lines, padX: padX, padY: padY, border: bd, maxW: f.maxW, fitted: f.ok };
  }

  /* where the card sits: 'left' | 'right' | 'bottom-left' | 'bottom-right' | 'center' (the old default) */
  function resolveBigPos(spec, i, keyCx) {
    var st = spec.steps[i], pos = st.big && st.big.pos;
    if (pos === 'left' || pos === 'right' || pos === 'bottom-left' || pos === 'bottom-right' || pos === 'center') return pos;
    if (pos !== 'auto') return 'center';
    var W = spec.W || 240, cam = st.cam || DEF_CAM, cx = null;
    if (st.focus && typeof st.focus.x === 'number') cx = W / 2 + ((st.focus.x - st.focus.y) - (cam.x - cam.y)) * 2 * (cam.zoom === 2 ? 2 : 1);
    else if (typeof keyCx === 'number') cx = keyCx;
    if (cx === null) return 'right';
    return cx < W / 2 ? 'right' : 'left';
  }

  /* ------------------------------------------------------------------ zones (pure estimate; the live one measures the DOM) */
  function estimateZones(stageW, step, o) {
    o = o || {};
    var G = geom(stageW, o), s = sizes(stageW, o), narrow = s.mode === 'narrow', u = s.u;
    step = step || {};
    var bd = s.mqBorder, tpx = s.title;
    var availW = 0.94 * stageW, badge = 1.65 * s.badge;
    var colAvail = availW - 2 * bd - badge - 0.45 * tpx - 1.04 * tpx;
    var rows = tpx * 1.0, tgPx = s.tag;
    var title = step.title || 'TITLE', sub = step.sub || '', chips = narrow ? null : step.chips;
    var titleW = tw(title, tpx, 'bebas', 0.04);
    var inner = Math.max(titleW, 40), h;
    if (!narrow && sub) { var sW = tw(sub, s.sub, 'raleMix', 0); inner = Math.max(inner, Math.min(sW, colAvail)); rows += 0.1 * tpx + Math.ceil(sW / Math.max(60, colAvail)) * s.sub * 1.15; }
    if (!narrow && chips && chips.length) {
      var cw = 0, i;
      for (i = 0; i < chips.length; i++) cw += tw(chips[i], s.chip, 'rale', 0.06) + 1.6 * s.chip + 2 * Math.max(1, 0.2 * u) + s.gap;
      inner = Math.max(inner, Math.min(cw, colAvail));
      var cr = Math.ceil(cw / Math.max(60, colAvail)), chipH = s.chip + 0.9 * s.chip + 2 * Math.max(1, 0.2 * u);
      rows += s.gap + cr * chipH + (cr - 1) * s.gap;
    }
    h = Math.max(rows, badge) + 0.52 * tpx + 2 * bd;
    var w = Math.min(availW, inner + badge + 0.45 * tpx + 1.04 * tpx + 2 * bd);
    var sx = (stageW - w) / 2, sy = 0.026 * G.stageH;
    var sign = [sx, sy, sx + w, sy + h];
    var tag = null;
    if (!narrow && step.tag !== false) {
      var tgw = tw(step.tag || 'REAL SPEED', tgPx, 'rale', 0.08) + 2.2 * tgPx + 2 * Math.max(1, 0.25 * u), tgh = tgPx + 1.2 * tgPx + 2 * Math.max(1, 0.25 * u);
      tag = [2 * u, sign[3] + 1.4 * u, 2 * u + tgw, sign[3] + 1.4 * u + tgh];
    }
    var ticks = s.tick + 0.35 * u, cap = null, capTop = G.stageH - ticks - 3;
    if (step.cap && step.cap.length) {
      var longest = step.cap.reduce(function (a, c) { return String(c).length > String(a).length ? c : a; }, '');
      var cwid = tw(longest, s.cap, 'rale', 0.06) + 2 * s.cap * 0.9 + 2 * Math.max(1, 0.3 * u), cmax = 0.94 * stageW;
      var cl = Math.ceil(cwid / cmax), cwp = Math.min(cmax, cwid), chh = cl * s.cap * 1.15 + 2 * s.cap * 0.55 + 2 * Math.max(1, 0.3 * u);
      var cb = Math.max(0.03 * G.stageH, ticks + 6);
      cap = [(stageW - cwp) / 2, G.stageH - cb - chh, (stageW + cwp) / 2, G.stageH - cb];
      capTop = cap[1];
    }
    var card = null, pos = null, bl = null;
    if (step.big) {
      bl = bigLayout(step.big, stageW, o);
      pos = o.bigPos || (step.big.pos === 'left' || step.big.pos === 'right' || step.big.pos === 'bottom-left' || step.big.pos === 'bottom-right' ? step.big.pos : 'center');
      card = bigRect(G, pos, bl, sign[3], capTop, cap);
    }
    var mg = 3 * G.scale;
    var free = [mg, sign[3] + 2 * G.scale, stageW - mg, (cap ? cap[1] : G.stageH - ticks) - 2 * G.scale];
    function cv(r) { return r ? toCanvas(G, r) : null; }
    var out = { W: G.W, H: G.H, scale: G.scale, mode: s.mode, narrow: narrow, stageW: stageW, stageH: G.stageH, sign: cv(sign), tag: cv(tag), cap: cv(cap), card: cv(card), free: cv(free), bigPos: pos, big: bl, live: false };
    if (card && (pos === 'left' || pos === 'bottom-left')) out.free[0] = Math.min(out.free[2] - 20, out.card[2] + 2);
    if (card && (pos === 'right' || pos === 'bottom-right')) out.free[2] = Math.max(out.free[0] + 20, out.card[0] - 2);
    out.free[1] = Math.min(out.free[1], out.free[3] - 20);
    return out;
  }
  function bigRect(G, pos, bl, signBottom, capTop, cap) {
    var w = bl.w, h = bl.h, sw = G.stageW, mx = 0.03 * sw, x, y;
    var gap = 0.012 * G.stageH + 4, floor = capTop - gap, ceil = signBottom + gap;
    if (pos === 'left' || pos === 'bottom-left') x = mx;
    else if (pos === 'right' || pos === 'bottom-right') x = sw - mx - w;
    else x = (sw - w) / 2;
    if (pos === 'left' || pos === 'right') y = (ceil + floor) / 2 - h / 2;
    else y = floor - h;
    if (pos === 'center' && !cap) y = G.stageH - 0.11 * G.stageH - h;
    y = Math.max(ceil * 0.5, Math.min(y, G.stageH - h - 3));
    return [x, y, x + w, y + h];
  }

  /* ------------------------------------------------------------------ probe: where the people and key props are (pure) */
  var CELL = 4;   /* canvas px per occupancy cell */
  var rectLog = [];
  var nullCtx = {
    fillStyle: '', imageSmoothingEnabled: false, fillRect: function (x, y, w, h) { rectLog.push(x, y, w, h); }, drawImage: function () {}, clearRect: function () {},
    getImageData: function (x, y, w, h) { return { data: new Uint8ClampedArray(w * h * 4), width: w, height: h }; }
  };
  var probeKits = {}, probeCache = typeof WeakMap === 'function' ? new WeakMap() : null;
  function probeKit(W, H) {
    var k = W + 'x' + H, g = probeKits[k];
    if (!g) { g = probeKits[k] = ISO.make(nullCtx, { W: W, H: H, makeCanvas: null }); g.watchMark = function () { return rectLog.length / 4; }; }
    return g;
  }
  function keyMatch(st, name) { return !!st.key && st.key.some(function (kk) { return name === 'isoProp:' + kk; }); }
  /* occupancy cells of painted rectangles (flat [x, y, w, h, ...]): an Int16Array of cell pairs [cx, cy, ...] whose centre a rectangle covers */
  function cellsOf(flat, from, to) {
    var seen = {}, out = [], i, x, y, w, h, cx0, cx1, cy0, cy1, cx, cy, key;
    for (i = from; i < to; i += 4) {
      x = flat[i]; y = flat[i + 1]; w = flat[i + 2]; h = flat[i + 3];
      cx0 = Math.ceil((x - CELL / 2) / CELL); cx1 = Math.ceil((x + w - CELL / 2) / CELL) - 1; cy0 = Math.ceil((y - CELL / 2) / CELL); cy1 = Math.ceil((y + h - CELL / 2) / CELL) - 1;
      for (cy = cy0; cy <= cy1; cy++) for (cx = cx0; cx <= cx1; cx++) { key = (cy + 512) * 2048 + (cx + 512); if (!seen[key]) { seen[key] = 1; out.push(cx, cy); } }
    }
    return Int16Array.from(out);
  }
  /* share of a cell mask (shifted by dx, dy canvas px) that lies inside any of the zones */
  function maskCover(cells, dx, dy, zs) {
    var n = cells.length / 2, c = 0, i, z, px, py, r;
    if (!n) return 0;
    for (i = 0; i < cells.length; i += 2) {
      px = cells[i] * CELL + CELL / 2 + dx; py = cells[i + 1] * CELL + CELL / 2 + dy;
      for (z = 0; z < zs.length; z++) { r = zs[z]; if (px >= r[0] && px < r[2] && py >= r[1] && py < r[3]) { c++; break; } }
    }
    return c / n;
  }

  /* samples of the people and key props of step i at its own camera (no nudge): [{ t, boxes: [{ kind, name, box, cells }] }] */
  function probe(spec, i) {
    var cache = probeCache && probeCache.get(spec); if (cache && cache[i]) return cache[i];
    var st = spec.steps[i], W = spec.W || 240, H = spec.H || 180, g = probeKit(W, H), out = [], camDur = spec.camDur || 1, N = Math.max(8, Math.min(24, Math.round(st.dur / 0.4))), k, t, boxes;
    for (k = 0; k < N; k++) {
      t = lerp(Math.min(camDur, st.dur * 0.5), st.dur - 0.05, k / (N - 1));
      g.watch = []; rectLog.length = 0;
      try { render(spec, g, i, t); } catch (e) { void e; }
      boxes = g.watch.filter(function (b) { return b.kind === 'person' || keyMatch(st, b.name); }).map(function (b) { return { kind: b.kind, name: b.name, box: b.box, cells: cellsOf(rectLog, b.m0 * 4, b.m1 * 4) }; });
      g.watch = null; rectLog.length = 0;
      out.push({ t: t, boxes: boxes });
    }
    if (probeCache) { if (!cache) { cache = {}; probeCache.set(spec, cache); } cache[i] = out; }
    return out;
  }
  function keyCentroidX(samples) {
    var sx = 0, n = 0; samples.forEach(function (s) { s.boxes.forEach(function (b) { sx += (b.box[0] + b.box[2]) / 2; n++; }); });
    return n ? sx / n : null;
  }

  /* zones for a spec step at a stage width, with the card side resolved (auto) from the focus or the probe */
  function zonesFor(spec, i, stageW, o) {
    o = o || {};
    var st = spec.steps[i], oo = { aspect: o.aspect, fill: o.fill || spec.fill, W: spec.W || (o.aspect === '16:9' && !(o.fill || spec.fill) ? 320 : 240), H: spec.H || 180 };
    if (st.big) oo.bigPos = resolveBigPos(spec, i, st.big.pos === 'auto' && !st.focus ? keyCentroidX(probe(spec, i)) : null);
    return estimateZones(stageW, st, oo);
  }

  /* ------------------------------------------------------------------ keep-out plan: the camera nudge (canvas px) for a step */
  var planCache = {};
  function planKey(spec, i, stageW, o) { return (spec.id || '?') + '|' + i + '|' + Math.round(stageW / 8) + '|' + (o.aspect || '4:3') + '|' + (o.fill || spec.fill || ''); }
  var MAXDX = 36, MAXDY = 24;
  var TOL = { person: 0.1, prop: 0.35 };       /* the share of a person (key prop) the sign, caption or card may cover before the planner moves the camera */
  var REPORT = { person: 0.15, prop: 0.4 };    /* what is still reported as covered after the nudge (the checker's own limits) */
  function plan(spec, i, stageW, o) {
    o = o || {};
    var key = planKey(spec, i, stageW, o), hit = planCache[key];
    if (hit && hit.spec === spec) return hit.plan;
    var none = { dx: 0, dy: 0, cost0: 0, cost: 0, covered: [], zones: null };
    var Z = zonesFor(spec, i, stageW, o);
    none.zones = Z;
    if (spec.nudge === false || o.nudge === false) return none;
    var samples = probe(spec, i), W = Z.W, H = Z.H;
    var zs = [Z.sign]; if (Z.tag) zs.push(Z.tag); if (Z.cap) zs.push(Z.cap); if (Z.card) zs.push(Z.card);
    var out0 = [];
    samples.forEach(function (s, si) { out0[si] = s.boxes.map(function (b) { return 1 - ovl(b.box, [0, 0, W, H]) / Math.max(1, area(b.box)); }); });
    function cost(dx, dy, detail) {
      var c = 0;
      samples.forEach(function (s, si) {
        s.boxes.forEach(function (b, bi) {
          var person = b.kind === 'person', tol = person ? TOL.person : TOL.prop, cov = maskCover(b.cells, dx, dy, zs);
          var bx = [b.box[0] + dx, b.box[1] + dy, b.box[2] + dx, b.box[3] + dy], out = 1 - ovl(bx, [0, 0, W, H]) / Math.max(1, area(bx));
          c += (person ? 3 : 1) * Math.max(0, cov - tol) / (1 - tol) + (person ? 2 : 0.5) * Math.max(0, out - Math.max(out0[si][bi], 0.1));
          if (detail && cov > (person ? REPORT.person : REPORT.prop)) detail.push({ t: +s.t.toFixed(2), name: b.name, covered: +cov.toFixed(2) });
        });
      });
      return c;
    }
    var c0 = cost(0, 0), best = { dx: 0, dy: 0, c: c0 }, dx, dy;
    if (c0 > 0.05) {
      for (dy = -MAXDY; dy <= MAXDY; dy += CELL) for (dx = -MAXDX; dx <= MAXDX; dx += CELL) {
        var c = cost(dx, dy) + 0.004 * (Math.abs(dx) + Math.abs(dy));
        if (c < best.c - 1e-9) best = { dx: dx, dy: dy, c: c };
      }
      if (best.c > c0 * 0.75) best = { dx: 0, dy: 0, c: c0 };
    }
    var covered = []; cost(best.dx, best.dy, covered);
    var res = { dx: best.dx, dy: best.dy, cost0: c0, cost: best.c, covered: covered, zones: Z };
    planCache[key] = { spec: spec, plan: res };
    return res;
  }

  /* a camera that frames a world box [x0,y0,z0,x1,y1,z1] into the free band under the sign and above the caption.
     o: { stageW (default 560), aspect, fill, cap: true, sub, chips, big: { pos }, zoom: 'auto' | 1 | 2, pad: 4 } */
  function fit(wb, o) {
    o = o || {};
    var stage = { title: 'TITLE', sub: o.sub, chips: o.chips, cap: o.cap === false ? null : ['A caption of typical length here'], big: o.big, tag: o.tag };
    var Z = estimateZones(o.stageW || 560, stage, { aspect: o.aspect, fill: o.fill, bigPos: o.big && o.big.pos !== 'auto' ? o.big.pos : (o.big ? 'right' : undefined) });
    var f = Z.free, pad = o.pad === undefined ? 4 : o.pad, fw = f[2] - f[0] - 2 * pad, fh = f[3] - f[1] - 2 * pad;
    function dims(Zm) {
      var xs = [], ys = [], a, b, c;
      for (a = 0; a < 2; a++) for (b = 0; b < 2; b++) for (c = 0; c < 2; c++) { var x = a ? wb[3] : wb[0], y = b ? wb[4] : wb[1], z = c ? wb[5] : wb[2]; xs.push((x - y) * 2 * Zm); ys.push((x + y - z) * Zm); }
      return { x0: Math.min.apply(null, xs), x1: Math.max.apply(null, xs), y0: Math.min.apply(null, ys), y1: Math.max.apply(null, ys) };
    }
    var zoom = o.zoom === 1 || o.zoom === 2 ? o.zoom : 1, d1 = dims(1), d2 = dims(2);
    if (o.zoom !== 1 && o.zoom !== 2 && d2.x1 - d2.x0 <= fw && d2.y1 - d2.y0 <= fh) zoom = 2;
    var d = zoom === 2 ? d2 : d1, tx = (f[0] + f[2]) / 2, ty = (f[1] + f[3]) / 2;
    /* want: screen centre of the box = (tx, ty).  sx = W/2 + ((x - y) - (cx - cy)) * 2Z ; sy = CY + ((x + y - z) - (cx + cy - cz)) * Z */
    var mx = (d.x0 + d.x1) / 2, my = (d.y0 + d.y1) / 2;            /* box centre in screen units relative to the world origin */
    var dCxy = (mx - (tx - Z.W / 2)) / (2 * zoom);                 /* cx - cy */
    var dSum = (my - (ty - CY)) / zoom;                            /* cx + cy - cz, with cz = 0 */
    return { x: Math.round((dSum + dCxy) / 2), y: Math.round((dSum - dCxy) / 2), z: 0, zoom: zoom };
  }

  function timeline(spec) {
    var starts = [], T = 0;
    for (var i = 0; i < spec.steps.length; i++) { starts.push(T); T += spec.steps[i].dur; }
    return { starts: starts, total: T };
  }
  function stepAt(spec, T) {
    var tl = timeline(spec), i = spec.steps.length - 1;
    T = clamp(T, 0, tl.total - 0.0001);
    for (var k = 0; k < spec.steps.length; k++) if (T < tl.starts[k] + spec.steps[k].dur) { i = k; break; }
    return { i: i, t: T - tl.starts[i] };
  }

  /* the camera for step i at local time t: eased pan from the previous step's framing; zoom (integer) switches at the half way point
     under a dither, unless the step's cam has cut: true (then the whole camera cuts to the new framing on the first frame) */
  function camAt(spec, i, t) {
    var to = spec.steps[i].cam || DEF_CAM, from = i > 0 ? (spec.steps[i - 1].cam || DEF_CAM) : to, D = spec.camDur || 1;
    var zc = (from.zoom || 1) !== (to.zoom || 1);
    if (zc && to.cut) return { x: to.x, y: to.y, z: to.z || 0, zoom: to.zoom || 1, k: 1, zoomChange: false, cut: true };
    var k = ez(clamp(t / D));
    return { x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k), z: lerp(from.z || 0, to.z || 0, k), zoom: k < 0.5 ? (from.zoom || 1) : (to.zoom || 1), k: k, zoomChange: zc };
  }

  /* a walker along a path of [x,y] points between times a and b. Returns { x, y, dir, step, moving }.
     step is 0/1 while moving and undefined when standing, so it can go straight into isoPerson options. */
  function walk(path, t, a, b, opt) {
    opt = opt || {};
    var k = clamp((t - a) / (b - a)); if (opt.ease) k = ez(k);
    var tot = 0, i, segs = [];
    for (i = 0; i < path.length - 1; i++) {
      var dx = path[i + 1][0] - path[i][0], dy = path[i + 1][1] - path[i][1], l = Math.sqrt(dx * dx + dy * dy);
      segs.push({ s: tot, l: l, x: path[i][0], y: path[i][1], dx: dx, dy: dy }); tot += l;
    }
    var s = k * tot, sg = segs[segs.length - 1];
    for (i = 0; i < segs.length; i++) if (s <= segs[i].s + segs[i].l) { sg = segs[i]; break; }
    var u = sg.l ? clamp((s - sg.s) / sg.l) : 0;
    var dir = Math.abs(sg.dx) >= Math.abs(sg.dy) ? (sg.dx >= 0 ? 0 : 2) : (sg.dy >= 0 ? 1 : 3);
    var moving = t > a && t < b;
    if (!moving && opt.endDir !== undefined && t >= b) dir = opt.endDir;
    if (!moving && opt.startDir !== undefined && t <= a) dir = opt.startDir;
    return { x: Math.round(sg.x + sg.dx * u), y: Math.round(sg.y + sg.dy * u), dir: dir, step: moving ? Math.floor((t - a) * 5) % 2 : undefined, moving: moving };
  }
  function who(w, o) { var r = {}, k; for (k in (o || {})) r[k] = o[k]; if (w.step !== undefined) r.step = w.step; return r; }

  function makeFx(spec, i, t) {
    var st = spec.steps[i];
    return {
      W: spec.W || 240, H: spec.H || 180, i: i, dur: st.dur, n: spec.steps.length, t: t,
      clamp: clamp, seg: seg, ez: ez, E: E, lerp: lerp, rnd: rnd,
      reveal: function (tt, a, b) { return E(tt, a, b); },
      pulse: function (tt, per) { return 0.5 - 0.5 * Math.cos(tt / per * Math.PI * 2); },
      blink: function (tt, per, duty) { return (tt / per) % 1 < (duty === undefined ? 0.5 : duty); },
      cycle: function (tt, per) { return (tt / per) % 1; },
      walk: walk, who: who
    };
  }

  /* ------------------------------------------------------------------ pure render */
  /* opts (all optional): { stageW, aspect, fill, nudge }  With stageW the keep-out camera nudge for that stage width is applied
     (eased with the camera between steps); without it the picture is exactly the step's own camera. */
  function render(spec, g, i, t, opts) {
    var st = spec.steps[i], cam = camAt(spec, i, t), fx = makeFx(spec, i, t);
    if (opts && opts.stageW && !g.watch) {
      var pc = plan(spec, i, opts.stageW, opts), pp = i > 0 && !cam.cut ? plan(spec, i - 1, opts.stageW, opts) : pc, k = cam.k === undefined ? 1 : cam.k;
      var nx = Math.round(lerp(pp.dx, pc.dx, k)), ny = Math.round(lerp(pp.dy, pc.dy, k));
      cam.dx = nx; cam.dy = ny;
    }
    g.setCam(cam);
    if (spec.backdrop) g.backdrop(spec.backdrop[0], spec.backdrop[1], spec.backdrop[2]); else g.fill(spec.bg || P.bg);
    st.build(t, g, fx);
    if (st.big && st.big.dim) g.veil(st.big.dim * E(t, 0.1, 0.9), P.bg);
    var veil = 0;
    if (cam.zoomChange && t < (spec.camDur || 1)) veil = Math.max(veil, clamp(1 - Math.abs(cam.k - 0.5) / 0.28));
    if (i === 0 && t < 0.5) veil = Math.max(veil, 1 - t / 0.5);
    if (i === spec.steps.length - 1 && t > st.dur - 0.5) veil = Math.max(veil, (t - (st.dur - 0.5)) / 0.5);
    if (veil > 0) g.veil(veil, P.bg);
  }

  /* ------------------------------------------------------------------ DOM */
  var CSS = [
    '.isx{--isx-red:#e03131;--isx-ink:#222629;--isx-steel:#3a3f44;--isx-silver:#c4c9ce;--isx-cream:#f1ece2;--isx-display:"Bebas Neue",Impact,sans-serif;--isx-body:Raleway,system-ui,sans-serif;display:block;width:100%;font-family:var(--isx-body);color:#e9eaeb}',
    '.isx:focus-visible{outline:2px solid #e9eaeb;outline-offset:2px}',
    '.isx-stage{--u:1cqi;--t:' + cssClamp('title') + ';--s:' + cssClamp('sub') + ';--ch:' + cssClamp('chip') + ';--nt:' + cssClamp('note') + ';--cp:' + cssClamp('cap') + ';--tg:' + cssClamp('tag') + ';--bd:' + cssClamp('badge') + ';--bl:' + cssClamp('bigL') + ';--tk:' + cssClamp('tick') + ';--bw:' + cssClamp('mqBorder') + ';--gp:' + cssClamp('gap') + ';position:relative;width:100%;aspect-ratio:4/3;overflow:hidden;background:#15171a;container-type:inline-size}',
    '.isx.w169 .isx-stage{aspect-ratio:16/9;--u:.75cqi}',
    '.isx-stage canvas{position:absolute;inset:0;display:block;width:100%;height:100%;image-rendering:pixelated;image-rendering:crisp-edges}',
    '.isx.fillw .isx-stage canvas{inset:auto;left:0;width:100%}',
    '.isx-mq{position:absolute;left:50%;top:2.6%;transform:translateX(-50%);width:max-content;max-width:94%;box-sizing:border-box;display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:.45em;align-items:center;font-size:var(--t);background:var(--isx-cream);color:#16191c;border:var(--bw) solid #16191c;padding:.26em .7em .26em .34em;text-align:left;white-space:nowrap}',
    '.isx-mq b{grid-column:1;grid-row:1/4;align-self:center;display:block;box-sizing:border-box;width:1.65em;height:1.65em;border-radius:50%;background:#e03131;color:#fff;font:400 var(--bd)/1.65 var(--isx-display);text-align:center}',
    '.isx-mq h3{grid-column:2;margin:0;font:400 var(--t)/1 var(--isx-display);letter-spacing:.04em;text-transform:uppercase;color:#16191c}',
    '.isx-mq small{grid-column:2;display:block;margin-top:.1em;font:700 var(--s)/1.15 var(--isx-body);color:#3d4349;white-space:normal}',
    '.isx-mq .chips{grid-column:2;display:flex;flex-wrap:wrap;gap:var(--gp);margin-top:var(--gp)}',
    '.isx-mq .chips u{text-decoration:none;font:700 var(--ch)/1 var(--isx-body);letter-spacing:.06em;text-transform:uppercase;padding:.45em .8em;background:#c9c2b2;color:#16191c;border:max(1px,calc(var(--u)*.2)) solid #16191c}',
    '.isx-mq .chips u.on{background:#e03131;color:#fff}',
    '.isx-mq i{position:absolute;width:max(4px,calc(var(--u)*1.1));height:max(4px,calc(var(--u)*1.1));border-radius:50%;background:#6b5526}',
    '.isx-mq i.lit{background:#ffd77a}',
    /* a sign change flickers the sign's own colour for a moment; the text is never hidden */
    '.isx-mq.swap{animation:isx-flick .17s steps(1) 1}',
    '@keyframes isx-flick{0%{background:#d9d3c4}60%{background:#f1ece2}100%{background:#f1ece2}}',
    '.isx-tag{position:absolute;left:calc(var(--u)*2);font:700 var(--tg)/1 var(--isx-body);letter-spacing:.08em;text-transform:uppercase;background:#16191c;color:#f1ece2;border:max(1px,calc(var(--u)*.25)) solid #f1ece2;padding:.6em 1.1em;white-space:nowrap}',
    '.isx-tag.slow{background:#e03131;color:#fff;border-color:#f1ece2}',
    '.isx-note{position:absolute;transform:translate(-50%,-50%);font:700 var(--nt)/1 var(--isx-body);letter-spacing:.06em;text-transform:uppercase;background:#f1ece2;color:#16191c;border:max(1px,calc(var(--u)*.3)) solid #16191c;padding:.6em 1em;white-space:nowrap;display:none}',
    '.isx-note.on{display:block}',
    '.isx-cap{position:absolute;left:50%;bottom:max(3%,calc(var(--tk) + 6px));transform:translateX(-50%);font:700 var(--cp)/1.15 var(--isx-body);letter-spacing:.06em;text-transform:uppercase;background:#f1ece2;color:#16191c;border:max(1px,calc(var(--u)*.3)) solid #16191c;padding:.55em .9em;white-space:normal;text-align:center;width:max-content;max-width:94%;box-sizing:border-box;display:none}',
    '.isx-cap.on{display:block}',
    '.isx-big{position:absolute;left:50%;transform:translateX(-50%);box-sizing:border-box;background:#f1ece2;color:#16191c;border:max(3px,calc(var(--u)*.7)) solid #16191c;padding:max(6px,var(--u)) max(8px,calc(var(--u)*2.2));text-align:center;display:none;white-space:normal;max-width:60%}',
    '.isx-big.on{display:block}',
    '.isx-big b{display:block;font:400 var(--bn,40px)/.82 var(--isx-display);color:#e03131;white-space:nowrap}',
    '.isx-big span{display:block;margin-top:max(6px,calc(var(--u)*.8));font:400 var(--bl2,16px)/1 var(--isx-display);letter-spacing:.04em;text-transform:uppercase;color:#16191c}',
    '.isx-ticks{position:absolute;left:0;right:0;bottom:0;height:var(--tk);display:flex;gap:max(2px,calc(var(--u)*.5));padding:0 max(2px,calc(var(--u)*.5)) max(2px,calc(var(--u)*.35))}',
    '.isx-ticks i{flex:1;background:#3a3f44;position:relative;cursor:pointer}',
    '.isx-ticks i::after{content:"";position:absolute;left:0;right:0;top:-8px;bottom:0}',
    '.isx-ticks i em{position:absolute;left:0;top:0;bottom:0;width:0;background:#e03131}',
    '.isx-ticks i.done em{width:100%}',
    /* narrow stage: the picture keeps the sign title and the caption; everything else is in the panel under it */
    '.isx-panel{display:none;box-sizing:border-box;background:#1b1e21;border-top:1px solid #3a3f44;padding:10px 12px 12px;color:#e9eaeb}',
    '.isx-narrow .isx-panel{display:block}',
    '.isx-narrow .isx-mq small,.isx-narrow .isx-mq .chips,.isx-narrow .isx-tag,.isx-narrow .isx-note{display:none!important}',
    '.isx-panel .ps{margin:0;font:600 ' + PANEL.sub + 'px/1.35 var(--isx-body);color:#e9eaeb}',
    '.isx-panel .pt{display:inline-block;margin:0 0 8px;font:700 ' + PANEL.tag + 'px/1 var(--isx-body);letter-spacing:.08em;text-transform:uppercase;background:#16191c;color:#f1ece2;border:1px solid #f1ece2;padding:6px 9px}',
    '.isx-panel .pt.slow{background:#e03131;color:#fff}',
    '.isx-panel .pc,.isx-panel .pn{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}',
    '.isx-panel .pc u{text-decoration:none;font:700 ' + PANEL.chip + 'px/1 var(--isx-body);letter-spacing:.06em;text-transform:uppercase;padding:7px 9px;background:#3a3f44;color:#e9eaeb;border:1px solid #3a3f44}',
    '.isx-panel .pc u.on{background:#e03131;border-color:#e03131;color:#fff}',
    '.isx-panel .pn span{font:700 ' + PANEL.note + 'px/1 var(--isx-body);letter-spacing:.06em;text-transform:uppercase;padding:7px 9px;background:#2a2e31;color:#b4bac0;border:1px solid #3a3f44}',
    '.isx-panel .pn span.on{background:#f1ece2;color:#16191c;border-color:#f1ece2}',
    '.isx-ctl{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:10px}',
    '.isx-ctl button{font:700 13px Raleway,system-ui,sans-serif;color:#fff;background:#e03131;border:0;border-radius:2px;padding:8px 14px;cursor:pointer}',
    '.isx-ctl button.q{background:transparent;border:1px solid #3a3f44;color:#e9eaeb}',
    '.isx-ctl button:focus-visible{outline:2px solid #e9eaeb;outline-offset:2px}',
    '.isx-ctl .hint{margin-left:auto;font:600 12px Raleway,system-ui,sans-serif;color:#b4bac0}',
    '.isx-ctl .where{font:700 12px Raleway,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#c4c9ce}',
    '.isx-tv{position:fixed;inset:0;z-index:50;background:#0f1113;display:none;grid-template-columns:minmax(0,1fr) minmax(300px,30vw);font-family:Raleway,system-ui,sans-serif;color:#e9eaeb}',
    '.isx-tv.on{display:grid}',
    '.isx-tv .tvl{display:grid;place-items:center;min-height:0;min-width:0;padding:2vh 2vw}',
    '.isx-tv .tvl .isx{width:min(100%,calc((100vh - 4vh) * 4 / 3))}',
    '.isx-tv.w169 .tvl .isx{width:min(100%,calc((100vh - 4vh) * 16 / 9))}',
    '.isx-tv aside{border-left:1px solid #3a3f44;padding:5vh 3vw;display:flex;flex-direction:column;gap:2vh;background:#222629}',
    '.isx-tv aside .no{font:400 clamp(80px,14vh,180px)/.8 "Bebas Neue",Impact,sans-serif;color:#e03131}',
    '.isx-tv aside h2{margin:0;font:400 clamp(36px,6.4vh,88px)/.92 "Bebas Neue",Impact,sans-serif}',
    '.isx-tv aside p{margin:0;font-size:clamp(16px,2.4vh,28px);line-height:1.45;color:#c4c9ce}',
    '.isx-tv aside .std{font-size:clamp(12px,1.6vh,18px);font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#b4bac0}',
    '.isx-tv aside .steps{margin-top:auto;display:flex;gap:6px}',
    '.isx-tv aside .steps i{flex:1;height:5px;background:#3a3f44}',
    '.isx-tv aside .steps i.on{background:#e03131}',
    '.isx-tv .x{position:absolute;top:14px;right:14px;font:700 13px Raleway,system-ui,sans-serif;color:#e9eaeb;background:transparent;border:1px solid #3a3f44;border-radius:2px;padding:8px 14px;cursor:pointer}',
    '@media (max-width:760px){.isx-tv.on{grid-template-columns:1fr;grid-template-rows:auto 1fr}.isx-tv aside{border-left:0;border-top:1px solid #3a3f44}}'
  ].join('\n');

  /* reduced motion: the system setting, or the portal lobby's own switch (.pv2.reduce), checked again on every mount */
  function detectReduced() {
    return (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) ||
      (typeof document !== 'undefined' && !!document.querySelector('.pv2.reduce'));
  }
  var reduced = detectReduced();
  var instances = [], rafOn = false, lastNow = 0, lastDraw = 0;
  var DEBUG = typeof location !== 'undefined' && /[?&]isxdebug/.test(location.search || '');

  function injectCss() {
    if (typeof document === 'undefined' || document.getElementById('isx-css')) return;
    var s = document.createElement('style'); s.id = 'isx-css'; s.appendChild(document.createTextNode(CSS)); document.head.appendChild(s);
  }
  function el(tag, cls, parent, text) {
    var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; if (parent) parent.appendChild(e); return e;
  }

  function Inst(host, spec, o) {
    var self = this;
    o = o || {};
    injectCss();
    reduced = detectReduced(); if (ISOX) ISOX.reduced = reduced;
    self.spec = spec; self.o = o; self.tl = timeline(spec);
    var wide = o.aspect === '16:9', fillW = (o.fill || spec.fill || (spec.steps.some(function (s) { return s.cam && s.cam.fill === 'width'; }) ? 'width' : '')) === 'width' && wide;
    self.wide169 = wide; self.fillW = fillW;
    self.W = spec.W || (wide && !fillW ? 320 : 240); self.H = spec.H || 180;
    var specView = spec;
    if (spec.W !== self.W) { specView = Object.create(spec); specView.W = self.W; }
    self.view = specView;
    self.root = el('div', 'isx' + (wide ? ' w169' : '') + (fillW ? ' fillw' : ''), host);
    self.root.tabIndex = 0; self.root.setAttribute('role', 'group'); self.root.setAttribute('aria-label', spec.title + ', animated explainer');
    self.root._isx = self;
    self.stage = el('div', 'isx-stage', self.root);
    self.cv = el('canvas', '', self.stage); self.cv.width = self.W; self.cv.height = self.H;
    if (fillW) { var chp = self.H / self.W / 0.5625 * 100; self.cv.style.height = chp.toFixed(3) + '%'; self.cv.style.top = (50 - CY / self.H * chp).toFixed(3) + '%'; }
    self.cv.setAttribute('role', 'img'); self.cv.setAttribute('aria-label', spec.title + ', animated illustration');
    self.g = ISO.make(self.cv.getContext('2d'), { W: self.W, H: self.H });
    self.mq = el('div', 'isx-mq', self.stage); self.mqNo = el('b', '', self.mq); self.mqH = el('h3', '', self.mq); self.mqS = el('small', '', self.mq); self.mqC = el('div', 'chips', self.mq);
    self.tag = el('div', 'isx-tag', self.stage);
    self.notes = []; self.cap = el('div', 'isx-cap', self.stage);
    self.big = el('div', 'isx-big', self.stage); self.bigN = el('b', '', self.big); self.bigL = el('span', '', self.big);
    self.ticks = el('div', 'isx-ticks', self.stage); self.tickEls = [];
    for (var k = 0; k < spec.steps.length; k++) (function (k) {
      var ti = el('i', '', self.ticks); el('em', '', ti); ti.addEventListener('click', function () { self.goto(k); }); self.tickEls.push(ti);
    })(k);
    /* the panel under the picture (shown on a narrow stage only) */
    self.panel = el('div', 'isx-panel', self.root); self.pTag = el('span', 'pt', self.panel); self.pSub = el('p', 'ps', self.panel); self.pChips = el('div', 'pc', self.panel); self.pNotes = el('div', 'pn', self.panel);
    self.pChipEls = []; self.pNoteEls = [];
    self.bulbs = []; self.lit = -1; self.shown = -1; self.T = 0; self.playing = o.autoplay !== false && !reduced; self.visible = true; self.forced = true; self.lastKey = '';
    self.born = typeof performance !== 'undefined' ? performance.now() : Date.now(); self.stageW = 0; self.narrow = false; self.reservedW = -1;
    if (o.controls !== false) {
      var c = el('div', 'isx-ctl', self.root);
      self.btn = {};
      [['back', 'Back'], ['play', 'Pause'], ['next', 'Next'], ['replay', 'Replay']].forEach(function (b) {
        var bt = el('button', b[0] === 'play' ? '' : 'q', c, b[1]); bt.type = 'button'; self.btn[b[0]] = bt;
        bt.addEventListener('click', function () { self[b[0] === 'play' ? 'toggle' : b[0]](); self.root.focus(); });
      });
      self.where = el('span', 'where', c); el('span', 'hint', c, 'Space pauses, arrow keys step, R replays');
    }
    self.root.addEventListener('keydown', function (e) { self.key(e); });
    if (typeof IntersectionObserver === 'function') {
      self.io = new IntersectionObserver(function (es) { self.visible = es[0].isIntersecting; if (self.visible) self.forced = true; }, { rootMargin: '60px' });
      self.io.observe(self.root);
    }
    if (typeof ResizeObserver === 'function') { self.ro = new ResizeObserver(function () { self.place(); self.forced = true; }); self.ro.observe(self.stage); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { self.reservedW = -1; self.place(); });
    self.measureStage();
    self.setStep(0);
    if (reduced) self.T = self.tl.starts[0] + spec.steps[0].dur * 0.92;
    instances.push(self);
    self.drawNow();
    kick();
  }

  Inst.prototype.measureStage = function () {
    var w = this.stage.clientWidth;
    if (w) { this.stageW = w; this.narrow = modeOf(w) === 'narrow'; this.root.classList.toggle('isx-narrow', this.narrow); }
    return w;
  };
  Inst.prototype.opts = function () {
    return this.o.nudge === false ? { stageW: 0 } : { stageW: this.stageW || 0, aspect: this.wide169 ? '16:9' : '4:3', fill: this.fillW ? 'width' : '' };
  };
  Inst.prototype.key = function (e) {
    var k = e.key;
    if (k === ' ' || k === 'Spacebar') { this.toggle(); e.preventDefault(); }
    else if (k === 'ArrowRight') { this.next(); e.preventDefault(); }
    else if (k === 'ArrowLeft') { this.back(); e.preventDefault(); }
    else if (k === 'r' || k === 'R') { this.replay(); e.preventDefault(); }
  };
  Inst.prototype.place = function () {
    var mq = this.mq, self = this;
    if (!this.measureStage()) return;
    var w = mq.clientWidth, h = mq.clientHeight;
    self.bulbs.forEach(function (b) { b.remove(); }); self.bulbs.length = 0;
    if (w) {
      var n = Math.max(10, Math.round((w + h) / 14)), per = 2 * (w + h), half = Math.max(2, Math.round(Math.max(4, this.stageW * 0.011) / 2));
      for (var k = 0; k < n; k++) {
        var d = k / n * per, x, y;
        if (d < w) { x = d; y = 0; } else if (d < w + h) { x = w; y = d - w; } else if (d < 2 * w + h) { x = 2 * w + h - d; y = h; } else { x = 0; y = per - d; }
        var b = el('i', '', mq); b.style.left = (x - half).toFixed(1) + 'px'; b.style.top = (y - half).toFixed(1) + 'px'; self.bulbs.push(b);
      }
    }
    var sh = this.stage.clientHeight || 1;
    this.tag.style.top = 'calc(' + ((mq.offsetTop + mq.offsetHeight) / sh * 100).toFixed(2) + '% + calc(var(--u)*1.4))';
    if (this.shown >= 0) { this.placeBig(this.shown); this.reservePanel(); this.notes.forEach(function (n) { n.on = false; }); }
  };
  /* size and place the big card (px, from the pure layout) */
  Inst.prototype.placeBig = function (i) {
    var st = this.spec.steps[i], b = this.big; if (!st.big || !this.stageW) return;
    var o = this.opts(), Z = zonesFor(this.spec, i, this.stageW, o), bl = Z.big, pos = Z.bigPos, G = geom(this.stageW, o);
    b.style.setProperty('--bn', bl.nPx + 'px'); b.style.setProperty('--bl2', bl.lPx + 'px');
    b.style.maxWidth = Math.round(bl.maxW) + 'px';
    var r = [Z.card[0] * G.scale, Z.card[1] * G.scale + G.top, Z.card[2] * G.scale, Z.card[3] * G.scale + G.top];
    b.style.transform = 'none'; b.style.bottom = 'auto';
    b.style.left = Math.round(r[0]) + 'px'; b.style.top = Math.round(r[1]) + 'px';
    this.bigPosNow = pos;
  };
  /* the panel keeps the height of its tallest step, so the page below never jumps */
  Inst.prototype.reservePanel = function () {
    if (!this.narrow) { this.panel.style.minHeight = ''; this.reservedW = -1; return; }
    if (this.reservedW === this.stageW) return;
    this.reservedW = this.stageW;
    var keep = this.shown, mx = 0, k;
    this.panel.style.minHeight = '';
    for (k = 0; k < this.spec.steps.length; k++) { this.fillPanel(k); mx = Math.max(mx, this.panel.offsetHeight); }
    this.fillPanel(keep < 0 ? 0 : keep);
    this.panel.style.minHeight = mx + 'px';
  };
  Inst.prototype.fillPanel = function (i) {
    var st = this.spec.steps[i], self = this, tg = st.tag === false ? '' : (st.tag || 'REAL SPEED');
    self.pTag.textContent = tg; self.pTag.className = 'pt' + (tg === 'REAL SPEED' ? '' : ' slow'); self.pTag.style.display = tg ? '' : 'none';
    self.pSub.textContent = st.sub || ''; self.pSub.style.display = st.sub ? '' : 'none';
    self.pChips.textContent = ''; self.pChipEls = (st.chips || []).map(function (c) { return el('u', '', self.pChips, c); });
    self.pChips.style.display = st.chips ? '' : 'none';
    self.pNotes.textContent = ''; self.pNoteEls = (st.notes || []).map(function (n) { return el('span', '', self.pNotes, n.text); });
    self.pNotes.style.display = st.notes && st.notes.length ? '' : 'none';
  };
  /* set the sign, tag, chips and notes for a step (done once per step change) */
  Inst.prototype.setStep = function (i) {
    var st = this.spec.steps[i], self = this;
    self.shown = i;
    self.mqNo.textContent = String(i + 1); self.mqH.textContent = st.title; self.mqS.textContent = st.sub || '';
    self.mqS.style.display = st.sub ? '' : 'none';
    self.mqC.textContent = ''; self.chipEls = [];
    (st.chips || []).forEach(function (c) { self.chipEls.push(el('u', '', self.mqC, c)); });
    self.mqC.style.display = st.chips ? '' : 'none';
    var tg = st.tag === false ? '' : (st.tag || 'REAL SPEED');
    self.tag.textContent = tg; self.tag.className = 'isx-tag' + (tg === 'REAL SPEED' ? '' : ' slow'); self.tag.style.display = tg ? '' : 'none';
    self.notes.forEach(function (n) { n.e.remove(); }); self.notes = [];
    (st.notes || []).forEach(function (n) {
      var e = el('div', 'isx-note', self.stage, n.text); e.style.left = (n.x / self.W * 100).toFixed(2) + '%'; e.style.top = (n.y / self.H * 100).toFixed(2) + '%'; self.notes.push({ e: e, a: n.a, b: n.b, x: n.x, y: n.y });
    });
    self.tickEls.forEach(function (te, k) { te.className = k < i ? 'done' : ''; te.firstChild.style.width = ''; });
    self.fillPanel(i);
    var calm = reduced || (((typeof performance !== 'undefined') ? performance.now() : Date.now()) - self.born < FLICKER_FREE_MS);
    self.mq.classList.remove('swap');
    if (!calm) { void self.mq.offsetWidth; self.mq.classList.add('swap'); }
    self.place();
    if (self.where) self.where.textContent = 'Step ' + (i + 1) + ' of ' + self.spec.steps.length;
    if (DEBUG) self.debugStep(i);
    if (self.o.onStep) self.o.onStep(i, self);
    if (typeof CustomEvent === 'function') self.root.dispatchEvent(new CustomEvent('isx-step', { bubbles: true, detail: { id: self.spec.id, step: i, count: self.spec.steps.length } }));
  };
  /* ?isxdebug: warn about key props and people under the sign, caption or card, and when the real sign is larger than the estimate */
  Inst.prototype.debugStep = function (i) {
    if (typeof console === 'undefined' || !this.stageW) return;
    var pl = plan(this.spec, i, this.stageW, this.opts()), tag = 'isx ' + this.spec.id + ' step ' + (i + 1) + ' @' + this.stageW + 'px: ';
    if (pl.dx || pl.dy) console.info(tag + 'camera nudged by ' + pl.dx + ', ' + pl.dy + ' canvas px (keep-out)');
    if (pl.covered.length) console.warn(tag + 'still covered after the nudge:', pl.covered.slice(0, 4));
    var live = this.zonesNow(), est = pl.zones;
    if (live && est && live.sign[3] > est.sign[3] + 2) console.warn(tag + 'the sign is taller (' + live.sign[3].toFixed(1) + ') than the keep-out estimate (' + est.sign[3].toFixed(1) + ')');
    if (live && est && live.cap && est.cap && live.cap[1] < est.cap[1] - 2) console.warn(tag + 'the caption is taller than the keep-out estimate');
  };
  /* the live zones (canvas px) measured from the DOM */
  Inst.prototype.zonesNow = function () {
    var G = geom(this.stageW || 1, this.opts()), sr = this.stage.getBoundingClientRect(), self = this;
    if (!sr.width) return null;
    function rect(e) {
      if (!e || e.style.display === 'none') return null;
      var r = e.getBoundingClientRect(); if (!r.width) return null;
      return toCanvas(G, [r.left - sr.left, r.top - sr.top, r.right - sr.left, r.bottom - sr.top]);
    }
    var cap = rect(this.cap.className.indexOf('on') >= 0 ? this.cap : null);
    var out = { W: G.W, H: G.H, sign: rect(this.mq), tag: this.narrow ? null : rect(this.tag), cap: cap, card: this.big.className.indexOf('on') >= 0 ? rect(this.big) : null, narrow: this.narrow, live: true };
    void self; return out;
  };
  Inst.prototype.overlay = function (i, t, now) {
    var st = this.spec.steps[i], self = this;
    if (i !== this.shown) this.setStep(i);
    var f = t / st.dur;
    if (st.cap) {
      var c = f >= 0.12 && f < 0.48 ? 0 : (f >= 0.5 && f < 0.94 ? 1 : -1);
      if (c >= 0 && st.cap[c]) { if (this.cap.textContent !== st.cap[c]) this.cap.textContent = st.cap[c]; this.cap.className = 'isx-cap on'; } else this.cap.className = 'isx-cap';
    } else this.cap.className = 'isx-cap';
    /* a note chip that would run past the picture edge, or sit on the sign, the caption or the card, is slid back (and each one on a narrow stage lives in the panel) */
    this.notes.forEach(function (n, k) {
      var on = t >= n.a && t < n.b;
      if (self.pNoteEls[k]) self.pNoteEls[k].className = on ? 'on' : '';
      if (on === !!n.on) return;
      n.on = on; n.e.className = 'isx-note' + (on ? ' on' : '');
      if (!on || self.narrow) return;
      n.e.style.marginLeft = ''; n.e.style.marginTop = '';
      var r = n.e.getBoundingClientRect(), s = self.stage.getBoundingClientRect(), dx = 0, dy = 0;
      if (r.width && s.width) {
        if (r.left < s.left + 4) dx = s.left + 4 - r.left; else if (r.right > s.right - 4) dx = s.right - 4 - r.right;
        if (dx) n.e.style.marginLeft = Math.round(dx) + 'px';
        var m = self.mq.getBoundingClientRect(), L = r.left + dx, R = r.right + dx;
        if (r.bottom > m.top && r.top < m.bottom && R > m.left && L < m.right) { dy = m.bottom + 6 - r.top; n.e.style.marginTop = Math.round(dy) + 'px'; }
        var cr = self.cap.className.indexOf('on') >= 0 ? self.cap.getBoundingClientRect() : null;
        if (cr && r.bottom + dy > cr.top - 4 && r.top + dy < cr.bottom && R > cr.left && L < cr.right) { dy = cr.top - 6 - r.bottom; n.e.style.marginTop = Math.round(dy) + 'px'; }
      }
    });
    if (st.big) {
      if (this.bigN.textContent !== String(st.big.n)) { this.bigN.textContent = st.big.n; this.bigL.textContent = st.big.label; this.placeBig(i); }
      this.big.className = 'isx-big' + (t > 0.7 ? ' on' : '');
    } else this.big.className = 'isx-big';
    if (this.chipEls && this.chipEls.length) {
      var ai = st.chipAt ? st.chipAt(t) : Math.min(this.chipEls.length - 1, Math.floor(f * this.chipEls.length));
      this.chipEls.forEach(function (ce, k) { ce.className = k === ai ? 'on' : ''; });
      this.pChipEls.forEach(function (ce, k) { ce.className = k === ai ? 'on' : ''; });
    }
    this.tickEls.forEach(function (te, k) { if (k === i) { te.className = ''; te.firstChild.style.width = (f * 100).toFixed(1) + '%'; } else te.className = k < i ? 'done' : ''; if (k > i) te.firstChild.style.width = ''; });
    if (this.bulbs.length && !reduced && now !== undefined) {
      var k2 = Math.floor(now / 160) % 3;
      if (k2 !== this.lit) { this.lit = k2; this.bulbs.forEach(function (b, n) { b.classList.toggle('lit', n % 3 === k2); }); }
    }
  };
  /* draw step i at local time t, scene and overlay: a pure function of its arguments (this is what the checkers and sheets call) */
  Inst.prototype.drawAt = function (i, t, now) {
    try { render(this.view, this.g, i, t, this.opts()); } catch (e) { if (!this.broken) { this.broken = true; if (typeof console !== 'undefined') console.error('explainer ' + this.spec.id + ' step ' + i + ': ' + e.message); } }
    this.overlay(i, t, now);
  };
  Inst.prototype.drawNow = function (now) {
    var s = stepAt(this.spec, this.T);
    this.drawAt(s.i, s.t, now);
  };
  Inst.prototype.tick = function (now, dt) {
    if (!this.visible) return;
    if (this.playing && !reduced) {
      this.T += dt;
      if (this.T >= this.tl.total) {
        if (this.o.loop === false) { this.T = this.tl.total - 0.001; this.playing = false; if (this.o.onEnd) this.o.onEnd(this); }
        else this.T -= this.tl.total;
      }
    }
    var key = Math.round(this.T * 30) + '|' + this.playing;
    if (key !== this.lastKey || this.forced || this.playing) { this.lastKey = key; this.forced = false; this.drawNow(now); }
    if (this.btn) this.btn.play.textContent = this.playing ? 'Pause' : 'Play';
  };
  Inst.prototype.play = function () { this.playing = !reduced; this.forced = true; };
  Inst.prototype.pause = function () { this.playing = false; this.forced = true; };
  Inst.prototype.toggle = function () { if (reduced) return; this.playing = !this.playing; this.forced = true; };
  Inst.prototype.goto = function (i) {
    i = (i + this.spec.steps.length) % this.spec.steps.length;
    this.T = this.tl.starts[i] + (reduced ? this.spec.steps[i].dur * 0.92 : 0.001); this.forced = true; this.drawNow();
  };
  Inst.prototype.next = function () { this.goto(stepAt(this.spec, this.T).i + 1); };
  Inst.prototype.back = function () {
    var s = stepAt(this.spec, this.T);
    this.goto(s.t > 1.5 && !reduced ? s.i : s.i - 1);
  };
  Inst.prototype.replay = function () { this.T = 0; this.playing = !reduced; this.forced = true; this.shown = -1; this.drawNow(); };
  Inst.prototype.destroy = function () {
    var k = instances.indexOf(this); if (k >= 0) instances.splice(k, 1);
    if (this.io) this.io.disconnect(); if (this.ro) this.ro.disconnect();
    if (this.root.parentNode) this.root.parentNode.removeChild(this.root);
  };

  /* one shared requestAnimationFrame loop for every instance; about 30 frames a second is plenty for pixel art */
  function frame(now) {
    rafOn = false;
    var dt = lastNow ? Math.min(0.1, (now - lastNow) / 1000) : 0;
    if (now - lastDraw >= 30) {
      lastDraw = now; lastNow = now;
      if (!document.hidden) for (var i = 0; i < instances.length; i++) instances[i].tick(now, dt);
    }
    if (instances.length) kick();
  }
  function kick() { if (!rafOn && typeof requestAnimationFrame === 'function') { rafOn = true; requestAnimationFrame(frame); } }
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', function () { lastNow = 0; });

  /* ------------------------------------------------------------------ TV mode */
  function tv(specs, o) {
    o = o || {};
    injectCss();
    var wide = o.aspect === '16:9', box = el('div', 'isx-tv on' + (wide ? ' w169' : ''), document.body), idx = 0, cur = null, onKey;
    var left = el('div', 'tvl', box), side = el('aside', '', box);
    var no = el('div', 'no', side), h2 = el('h2', '', side), p = el('p', '', side), std = el('div', 'std', side), steps = el('div', 'steps', side);
    var x = el('button', 'x', box, 'Close'); x.type = 'button';
    function show(k) {
      idx = (k + specs.length) % specs.length;
      if (cur) cur.destroy();
      var sp = specs[idx];
      no.textContent = String(idx + 1).length < 2 ? '0' + (idx + 1) : String(idx + 1); h2.textContent = sp.title; std.textContent = sp.std || '';
      p.textContent = sp.blurb || '';
      steps.textContent = ''; sp.steps.forEach(function () { el('i', '', steps); });
      cur = new Inst(left, sp, { aspect: o.aspect, fill: o.fill, controls: false, loop: false, onEnd: function () { show(idx + 1); }, onStep: function (i) { var is = steps.children; for (var q = 0; q < is.length; q++) is[q].className = q <= i ? 'on' : ''; } });
      cur.root.focus();
    }
    function close() { if (cur) cur.destroy(); document.removeEventListener('keydown', onKey); if (box.parentNode) box.parentNode.removeChild(box); if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); if (o.onClose) o.onClose(); }
    onKey = function (e) { if (e.key === 'Escape') close(); else if (cur) cur.key(e); };
    document.addEventListener('keydown', onKey);
    x.addEventListener('click', close);
    if (box.requestFullscreen) box.requestFullscreen().catch(function () {});
    show(0);
    return { close: close, show: show };
  }

  /* ISOX.zones(stage, step, o): stage is a width in px, an Inst, or an element inside one (live measure) */
  function zones(stage, step, o) {
    if (stage && typeof stage === 'object') {
      var inst = stage instanceof Inst ? stage : (stage._isx || (stage.closest && stage.closest('.isx') && stage.closest('.isx')._isx));
      if (inst) { var z = inst.zonesNow(); if (z) { z.free = estimateZones(inst.stageW, step || inst.spec.steps[Math.max(0, inst.shown)], inst.opts()).free; return z; } }
      return null;
    }
    return estimateZones(stage, step, o);
  }

  var ISOX = {
    define: function (spec) { ISOX.specs.push(spec); return spec; }, specs: [],
    mount: function (host, spec, o) { return new Inst(host, spec, o); },
    render: render, timeline: timeline, stepAt: stepAt, camAt: camAt, makeFx: makeFx, tv: tv,
    sizes: sizes, zones: zones, fit: fit, plan: plan, probe: probe, cellsOf: cellsOf, maskCover: maskCover, CELL: CELL, TOL: TOL, REPORT: REPORT, bigLayout: bigLayout, resolveBigPos: resolveBigPos, layoutMode: modeOf, geom: geom,
    SZ: SZ, PANEL: PANEL, NARROW: NARROW, BIG_FRAC: BIG_FRAC,
    fx: { clamp: clamp, seg: seg, ez: ez, E: E, lerp: lerp, rnd: rnd, walk: walk, who: who },
    reduced: reduced, version: VERSION, debug: DEBUG
  };
  root.ISOX = ISOX;
  if (typeof module !== 'undefined' && module.exports) module.exports = ISOX;
})(typeof window !== 'undefined' ? window : this);
