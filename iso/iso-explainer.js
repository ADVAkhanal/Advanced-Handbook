/* ============================================================================================================
   iso-explainer.js  -  step-by-step isometric explainer framework (needs iso-kit.js loaded first)

   A SPEC describes one explainer:
     { id, title, std,                    // title for the page, std = the plain source line ("Shop habit")
       W, H,                              // optional logical canvas, default 240 x 180 (4:3) or 320 x 180 (16:9)
       bg,                                // background colour behind the scene, default ISO.P.bg
       backdrop: ['bands', '#15171a', '#20252a'],  // optional patterned backdrop: 'bands' | 'stripes' | 'diag', base colour, line colour
       camDur,                            // seconds the camera takes to reach each step's framing (default 1)
       steps: [ {
         title: 'READ THE LIST',          // marquee title (upper case, 24 characters or fewer)
         sub:   'Top job goes first',     // marquee subtitle
         dur:   7,                        // seconds
         cam:   { x: 26, y: 14, zoom: 1, z: 0 }, // world point shown at the picture centre (z = its height), zoom 1 or 2 (integer)
         tag:   'REAL SPEED',             // speed tag: 'REAL SPEED' | 'SLOWER' | '10x SLOWER'
         chips: ['List', 'Cut', 'Check'], // optional chips in the sign, the active one is red
         chipAt: function (t) { return 0; }, // optional: which chip is active at step time t
         cap:   ['First caption', 'Second caption'],   // captions under the picture: 12-48% and 50-94% of the step
         notes: [ { a: 1, b: 4, x: 120, y: 60, text: '2 x 40' } ], // tiny cream chips at canvas x,y (no dot, no leader)
         big:   { n: '7', label: 'jobs leave today' },  // makes this the final big-number card step
         build: function (t, g, fx) { ... }            // draws the whole picture for local time t (a pure function)
       } ] }

   build(t, g, fx):  t = seconds since the step began.  g = the ISO kit (camera already set, canvas already cleared).
   fx = { W, H, i, dur, E, seg, ez, clamp, lerp, rnd, reveal(t,a,b), pulse(t,per), blink(t,per), cycle(t,per),
          walk(path,t,a,b,opts), who(w,opts), steps count n, stage(i) ... }
   Everything must be a pure function of (step, t): no Date.now(), no Math.random().

   ISOX.define(spec)                       register (returns spec)
   ISOX.mount(element, spec, options)      DOM instance: marquee, speed tag, captions, notes, ticks, controls, keys
        options: { aspect: '4:3' | '16:9', controls: true, autoplay: true, loop: true, onEnd: fn, tv: false, fit: false }
        returns inst with  play() pause() toggle() next() back() replay() goto(i) drawAt(i,t) destroy()
   ISOX.render(spec, g, i, t)              headless pure render of step i at time t into any ISO kit (used by the checkers)
   ISOX.timeline(spec)                     { starts: [...], total }
   ISOX.stepAt(spec, T)                    { i, t } for a timeline time
   ISOX.tv(specs, options)                 full screen TV mode: plays the explainers one after another
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

  /* the camera for step i at local time t: eased pan from the previous step's framing; zoom (integer) switches at the half way point */
  function camAt(spec, i, t) {
    var to = spec.steps[i].cam || DEF_CAM, from = i > 0 ? (spec.steps[i - 1].cam || DEF_CAM) : to, D = spec.camDur || 1;
    var k = ez(clamp(t / D));
    return { x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k), z: lerp(from.z || 0, to.z || 0, k), zoom: k < 0.5 ? (from.zoom || 1) : (to.zoom || 1), k: k, zoomChange: (from.zoom || 1) !== (to.zoom || 1) };
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
  function render(spec, g, i, t) {
    var st = spec.steps[i], cam = camAt(spec, i, t), fx = makeFx(spec, i, t), tl = timeline(spec);
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
    '.isx{--isx-red:#e03131;--isx-ink:#222629;--isx-steel:#3a3f44;--isx-silver:#c4c9ce;--isx-cream:#f1ece2;display:block;width:100%;font-family:Raleway,system-ui,sans-serif;color:#e9eaeb}',
    '.isx:focus-visible{outline:2px solid #e9eaeb;outline-offset:2px}',
    '.isx-stage{--u:1cqi;position:relative;width:100%;aspect-ratio:4/3;overflow:hidden;background:#15171a;container-type:inline-size}',
    '.isx.w169 .isx-stage{aspect-ratio:16/9;--u:.75cqi}',
    '.isx-stage canvas{position:absolute;inset:0;display:block;width:100%;height:100%;image-rendering:pixelated;image-rendering:crisp-edges}',
    '.isx-mq{position:absolute;left:50%;top:2.6%;transform:translateX(-50%);max-width:94%;background:#f1ece2;color:#16191c;border:calc(var(--u)*.55) solid #16191c;padding:calc(var(--u)*1.2) calc(var(--u)*3) calc(var(--u)*1) calc(var(--u)*8.5);text-align:left;white-space:nowrap}',
    '.isx-mq b{position:absolute;left:calc(var(--u)*1.6);top:50%;transform:translateY(-50%);width:calc(var(--u)*5.4);height:calc(var(--u)*5.4);border-radius:50%;background:#e03131;color:#fff;font:400 calc(var(--u)*3.6)/calc(var(--u)*5.6) "Bebas Neue",Impact,sans-serif;text-align:center}',
    '.isx-mq h3{margin:0;font:400 calc(var(--u)*4.8)/1 "Bebas Neue",Impact,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#16191c}',
    '.isx-mq small{display:block;margin-top:calc(var(--u)*.4);font:700 calc(var(--u)*1.95)/1.15 Raleway,system-ui,sans-serif;color:#3d4349;white-space:normal}',
    '.isx-mq .chips{display:flex;gap:calc(var(--u)*.7);margin-top:calc(var(--u)*.7)}',
    '.isx-mq .chips u{text-decoration:none;font:700 calc(var(--u)*1.45)/1 Raleway,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:calc(var(--u)*.45) calc(var(--u)*.8);background:#c9c2b2;color:#16191c;border:calc(var(--u)*.2) solid #16191c}',
    '.isx-mq .chips u.on{background:#e03131;color:#fff}',
    '.isx-mq i{position:absolute;width:calc(var(--u)*1.1);height:calc(var(--u)*1.1);border-radius:50%;background:#e0b24f;opacity:.35}',
    '.isx-mq i.lit{opacity:1;background:#ffd77a}',
    '.isx-mq.swap h3,.isx-mq.swap small,.isx-mq.swap .chips{animation:isx-flick .17s steps(1) 1}',
    '@keyframes isx-flick{0%{visibility:hidden}60%{visibility:visible}100%{visibility:visible}}',
    '.isx-tag{position:absolute;left:calc(var(--u)*2);font:700 calc(var(--u)*1.7)/1 Raleway,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;background:#16191c;color:#f1ece2;border:calc(var(--u)*.25) solid #f1ece2;padding:calc(var(--u)*.6) calc(var(--u)*1.1);white-space:nowrap}',
    '.isx-tag.slow{background:#e03131;color:#fff;border-color:#f1ece2}',
    '.isx-note{position:absolute;transform:translate(-50%,-50%);font:700 calc(var(--u)*1.9)/1 Raleway,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;background:#f1ece2;color:#16191c;border:calc(var(--u)*.3) solid #16191c;padding:calc(var(--u)*.6) calc(var(--u)*1);white-space:nowrap;display:none}',
    '.isx-note.on{display:block}',
    '.isx-cap{position:absolute;left:50%;bottom:3%;transform:translateX(-50%);font:700 calc(var(--u)*3)/1 Raleway,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;background:#f1ece2;color:#16191c;border:calc(var(--u)*.3) solid #16191c;padding:calc(var(--u)*1) calc(var(--u)*1.8);white-space:nowrap;display:none;max-width:94%}',
    '.isx-cap.on{display:block}',
    '.isx-big{position:absolute;left:50%;bottom:11%;transform:translateX(-50%);background:#f1ece2;color:#16191c;border:calc(var(--u)*.7) solid #16191c;padding:calc(var(--u)*1) calc(var(--u)*4) calc(var(--u)*1.2);text-align:center;display:none;white-space:nowrap}',
    '.isx-big.on{display:block}',
    '.isx-big.left{left:3%;transform:none}',
    '.isx-big.right{left:auto;right:3%;transform:none}',
    '.isx-big b{display:block;font:400 calc(var(--u)*21)/.82 "Bebas Neue",Impact,sans-serif;color:#e03131}',
    '.isx-big span{display:block;margin-top:calc(var(--u)*.8);font:400 calc(var(--u)*6)/1 "Bebas Neue",Impact,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#16191c}',
    '.isx-ticks{position:absolute;left:0;right:0;bottom:0;height:calc(var(--u)*1.1);display:flex;gap:calc(var(--u)*.5);padding:0 calc(var(--u)*.5) calc(var(--u)*.35)}',
    '.isx-ticks i{flex:1;background:#3a3f44;position:relative;cursor:pointer}',
    '.isx-ticks i em{position:absolute;left:0;top:0;bottom:0;width:0;background:#e03131}',
    '.isx-ticks i.done em{width:100%}',
    '.isx-ctl{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:10px}',
    '.isx-ctl button{font:700 13px Raleway,system-ui,sans-serif;color:#fff;background:#e03131;border:0;border-radius:2px;padding:8px 14px;cursor:pointer}',
    '.isx-ctl button.q{background:transparent;border:1px solid #3a3f44;color:#e9eaeb}',
    '.isx-ctl button:focus-visible{outline:2px solid #e9eaeb;outline-offset:2px}',
    '.isx-ctl .hint{margin-left:auto;font:600 12px Raleway,system-ui,sans-serif;color:#9aa0a4}',
    '.isx-ctl .where{font:700 12px Raleway,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#c4c9ce}',
    '@media (prefers-reduced-motion:reduce){.isx-mq i{display:none}}',
    '.isx-tv{position:fixed;inset:0;z-index:50;background:#0f1113;display:none;grid-template-columns:minmax(0,1fr) minmax(300px,30vw);font-family:Raleway,system-ui,sans-serif;color:#e9eaeb}',
    '.isx-tv.on{display:grid}',
    '.isx-tv .tvl{display:grid;place-items:center;min-height:0;min-width:0;padding:2vh 2vw}',
    '.isx-tv .tvl .isx{width:min(100%,calc((100vh - 4vh) * 4 / 3))}',
    '.isx-tv.w169 .tvl .isx{width:min(100%,calc((100vh - 4vh) * 16 / 9))}',
    '.isx-tv aside{border-left:1px solid #3a3f44;padding:5vh 3vw;display:flex;flex-direction:column;gap:2vh;background:#222629}',
    '.isx-tv aside .no{font:400 clamp(80px,14vh,180px)/.8 "Bebas Neue",Impact,sans-serif;color:#e03131}',
    '.isx-tv aside h2{margin:0;font:400 clamp(36px,6.4vh,88px)/.92 "Bebas Neue",Impact,sans-serif}',
    '.isx-tv aside p{margin:0;font-size:clamp(16px,2.4vh,28px);line-height:1.45;color:#c4c9ce}',
    '.isx-tv aside .std{font-size:clamp(12px,1.6vh,18px);font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9aa0a4}',
    '.isx-tv aside .steps{margin-top:auto;display:flex;gap:6px}',
    '.isx-tv aside .steps i{flex:1;height:5px;background:#3a3f44}',
    '.isx-tv aside .steps i.on{background:#e03131}',
    '.isx-tv .x{position:absolute;top:14px;right:14px;font:700 13px Raleway,system-ui,sans-serif;color:#e9eaeb;background:transparent;border:1px solid #3a3f44;border-radius:2px;padding:8px 14px;cursor:pointer}',
    '@media (max-width:760px){.isx-tv.on{grid-template-columns:1fr;grid-template-rows:auto 1fr}.isx-tv aside{border-left:0;border-top:1px solid #3a3f44}}'
  ].join('\n');

  var reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var instances = [], rafOn = false, lastNow = 0, lastDraw = 0;

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
    self.spec = spec; self.o = o; self.tl = timeline(spec);
    var wide = o.aspect === '16:9';
    self.W = spec.W || (wide ? 320 : 240); self.H = spec.H || 180;
    var specView = spec;
    if (spec.W !== self.W) { specView = Object.create(spec); specView.W = self.W; }
    self.view = specView;
    self.root = el('div', 'isx' + (wide ? ' w169' : ''), host);
    self.root.tabIndex = 0; self.root.setAttribute('role', 'group'); self.root.setAttribute('aria-label', spec.title + ', animated explainer');
    self.stage = el('div', 'isx-stage', self.root);
    self.cv = el('canvas', '', self.stage); self.cv.width = self.W; self.cv.height = self.H;
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
    self.bulbs = []; self.lit = -1; self.shown = -1; self.T = 0; self.playing = o.autoplay !== false && !reduced; self.visible = true; self.forced = true; self.lastKey = '';
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
    if (typeof ResizeObserver === 'function') { self.ro = new ResizeObserver(function () { self.place(); }); self.ro.observe(self.stage); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { self.place(); });
    self.setStep(0);
    if (reduced) self.T = self.tl.starts[0] + spec.steps[0].dur * 0.92;
    instances.push(self);
    self.drawNow();
    kick();
  }

  Inst.prototype.key = function (e) {
    var k = e.key;
    if (k === ' ' || k === 'Spacebar') { this.toggle(); e.preventDefault(); }
    else if (k === 'ArrowRight') { this.next(); e.preventDefault(); }
    else if (k === 'ArrowLeft') { this.back(); e.preventDefault(); }
    else if (k === 'r' || k === 'R') { this.replay(); e.preventDefault(); }
  };
  Inst.prototype.place = function () {
    var mq = this.mq, w = mq.clientWidth, h = mq.clientHeight, self = this;
    if (!w) return;
    self.bulbs.forEach(function (b) { b.remove(); }); self.bulbs.length = 0;
    var n = Math.max(10, Math.round((w + h) / 14)), per = 2 * (w + h);
    for (var k = 0; k < n; k++) {
      var d = k / n * per, x, y;
      if (d < w) { x = d; y = 0; } else if (d < w + h) { x = w; y = d - w; } else if (d < 2 * w + h) { x = 2 * w + h - d; y = h; } else { x = 0; y = per - d; }
      var b = el('i', '', mq); b.style.left = 'calc(' + x.toFixed(1) + 'px - calc(var(--u)*.55))'; b.style.top = 'calc(' + y.toFixed(1) + 'px - calc(var(--u)*.55))'; self.bulbs.push(b);
    }
    var sh = this.stage.clientHeight || 1;
    this.tag.style.top = 'calc(' + ((mq.offsetTop + mq.offsetHeight) / sh * 100).toFixed(2) + '% + calc(var(--u)*1.4))';
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
    var tg = st.tag || 'REAL SPEED';
    self.tag.textContent = tg; self.tag.className = 'isx-tag' + (tg === 'REAL SPEED' ? '' : ' slow');
    self.notes.forEach(function (n) { n.e.remove(); }); self.notes = [];
    (st.notes || []).forEach(function (n) {
      var e = el('div', 'isx-note', self.stage, n.text); e.style.left = (n.x / self.W * 100).toFixed(2) + '%'; e.style.top = (n.y / self.H * 100).toFixed(2) + '%'; self.notes.push({ e: e, a: n.a, b: n.b });
    });
    self.tickEls.forEach(function (te, k) { te.className = k < i ? 'done' : ''; te.firstChild.style.width = ''; });
    if (!reduced) { self.mq.classList.remove('swap'); void self.mq.offsetWidth; self.mq.classList.add('swap'); }
    self.place();
    if (self.where) self.where.textContent = 'Step ' + (i + 1) + ' of ' + self.spec.steps.length;
    if (self.o.onStep) self.o.onStep(i, self);
  };
  Inst.prototype.overlay = function (i, t, now) {
    var st = this.spec.steps[i], self = this;
    if (i !== this.shown) this.setStep(i);
    var f = t / st.dur;
    if (st.cap) {
      var c = f >= 0.12 && f < 0.48 ? 0 : (f >= 0.5 && f < 0.94 ? 1 : -1);
      if (c >= 0 && st.cap[c]) { this.cap.textContent = st.cap[c]; this.cap.className = 'isx-cap on'; } else this.cap.className = 'isx-cap';
    } else this.cap.className = 'isx-cap';
    this.notes.forEach(function (n) { n.e.className = 'isx-note' + (t >= n.a && t < n.b ? ' on' : ''); });
    if (st.big) {
      this.bigN.textContent = st.big.n; this.bigL.textContent = st.big.label;
      this.big.className = 'isx-big' + (st.big.pos ? ' ' + st.big.pos : '') + (t > 0.7 ? ' on' : '');
    } else this.big.className = 'isx-big';
    if (this.chipEls && this.chipEls.length) {
      var ai = st.chipAt ? st.chipAt(t) : Math.min(this.chipEls.length - 1, Math.floor(f * this.chipEls.length));
      this.chipEls.forEach(function (ce, k) { ce.className = k === ai ? 'on' : ''; });
    }
    this.tickEls.forEach(function (te, k) { if (k === i) { te.className = ''; te.firstChild.style.width = (f * 100).toFixed(1) + '%'; } else te.className = k < i ? 'done' : ''; if (k > i) te.firstChild.style.width = ''; });
    if (this.bulbs.length && !reduced && now !== undefined) {
      var k2 = Math.floor(now / 160) % 3;
      if (k2 !== this.lit) { this.lit = k2; this.bulbs.forEach(function (b, n) { b.classList.toggle('lit', n % 3 === k2); }); }
    }
    void self;
  };
  /* draw step i at local time t, scene and overlay: a pure function of its arguments (this is what the checkers and sheets call) */
  Inst.prototype.drawAt = function (i, t, now) {
    try { render(this.view, this.g, i, t); } catch (e) { if (!this.broken) { this.broken = true; if (typeof console !== 'undefined') console.error('explainer ' + this.spec.id + ' step ' + i + ': ' + e.message); } }
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
      cur = new Inst(left, sp, { aspect: o.aspect, controls: false, loop: false, onEnd: function () { show(idx + 1); }, onStep: function (i) { var is = steps.children; for (var q = 0; q < is.length; q++) is[q].className = q <= i ? 'on' : ''; } });
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

  var ISOX = {
    define: function (spec) { ISOX.specs.push(spec); return spec; }, specs: [],
    mount: function (host, spec, o) { return new Inst(host, spec, o); },
    render: render, timeline: timeline, stepAt: stepAt, camAt: camAt, makeFx: makeFx, tv: tv,
    fx: { clamp: clamp, seg: seg, ez: ez, E: E, lerp: lerp, rnd: rnd, walk: walk, who: who },
    reduced: reduced, version: '1.0'
  };
  root.ISOX = ISOX;
  if (typeof module !== 'undefined' && module.exports) module.exports = ISOX;
})(typeof window !== 'undefined' ? window : this);
