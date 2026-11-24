/* ============================================================================================================
   hb-iso-adapter.js  -  plays the isometric cutaway explainers (HB_ISO) inside the handbook page's policy videos.

   What it does
   1. Loads iso-kit.js, iso-explainer.js and the batch files (hb-iso-A.js ...) lazily, the first time any policy video is opened.
   2. window.HBIso.video(sec, inTv, fallback) is called by the page's video(sec). It returns an iso video for ids that have
      a spec in window.HB_ISO[sec.id], and null (the page then draws its old 2D scene) for the others.
      Until the files have arrived an id listed in KNOWN shows a dark placeholder of the same size (no layout shift);
      any other id shows its old 2D scene and is upgraded the moment its spec turns up.
   3. In TV mode (inTv) the explainer plays once, holds its last card for a moment, and tells the page it is finished.
   4. The explainer draws its own sign and captions, so the page's marquee and callouts are never created for it.
   5. Reduced motion and off-screen / hidden-tab pausing come from iso-explainer.js (still frames, one shared 30 fps loop).
   6. Sound hook: HBIso.onstep(function (e) { e.id, e.step, e.steps, e.title, e.inst }) runs on every step change, and the
      wrapper element also fires a bubbling 'hbiso-step' event with the same detail. Nothing here makes a sound.

   Controls: Back, Pause or Play, Next, Replay under the picture, a clickable step ticker in the picture, and the keys
   Space, left and right arrows, R on the focused picture. In TV mode the page's own Back / Pause / Next / Close act on whole
   policies, and R replays the current explainer.

   To take it out: remove the one script tag from the page; the page falls back to its 2D scenes.
   ============================================================================================================ */
(function () {
  'use strict';
  if (window.HBIso) return;

  var VERSION = '2';   /* cache key for the kit and batch files: v1.1 kit */
  /* batch files, one per group of policies (each registers window.HB_ISO['<section id>'] = spec) */
  var BATCHES = ['hb-iso-A.js', 'hb-iso-B.js', 'hb-iso-C.js', 'hb-iso-D.js'];
  /* ids that are known to have a spec, so the first open shows a placeholder instead of the old scene while the files load.
     An id missing here still works: it shows its old scene first and is upgraded when its spec arrives. */
  var KNOWN = {};
  ['1.0', '1.1', '1.2', '2.1', '2.2', '2.3', '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', 'OK-Disability Accommodation', 'OK-EEO Statement and Non harassme', 'OK-Religious Accommodation', '4.1', '4.2', '4.3', '4.4', '4.5',
    '4.6', '4.7', '4.8', '4.9', 'OK-Accommodations for Nursing Mot', 'OK-Meal and Rest Periods', 'OK-Overtime', '5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7', '5.8', '5.9', '5.10', '5.11', '5.12', 'OK-Disciplinary Process',
    '6.1', '6.2', '6.3', '6.4', '6.5', '6.6', '6.7', '6.8', '6.9', '6.10', '6.11', '6.12', '6.13', 'OK-Access to Personnel and Medica', '7.1', '7.2', '7.3', '7.4', '7.5', '7.6', '7.7',
    '7.8', '7.9', '7.10', '7.11', '7.12', '7.13', '7.14', '7.15', '7.16', '7.17', 'OK-Jury Duty Leave', 'OK-Voting Leave', '8.1', '8.2', '8.3', 'OK-Workplace Smoking', '9.1', 'CLOSE-Closing Statement', 'CLOSE-Acknowledgment of Re'].forEach(function (id) { KNOWN[id] = 1; });

  var script = document.currentScript, BASE = (script && script.src) ? script.src.replace(/[^\/]*$/, '') : 'iso/';
  var state = 'idle', waiters = [], listeners = [], live = [], sweeper = 0;
  var HOLD_END = 1.6;   /* seconds the last card stays up in TV mode before the page moves on */

  /* ---------------------------------------------------------------- styles */
  var css = document.createElement('style'); css.id = 'hbv-iso-css';
  css.textContent =
    '.hbv-isow{width:100%;min-width:0;container-type:inline-size}' +
    /* kit v1.1 sizes all its own text (clamp with pixel minimums, panel under a narrow picture): the page only supplies fonts, the frame and the controls */
    '.hbv-st.hbv-iso{border:0;aspect-ratio:auto;overflow:visible;background:none;container-type:normal}' +
    '.hbv-st.hbv-iso.hbv-wait{aspect-ratio:4/3;display:grid;place-items:center;background:#15171a;border:1px solid var(--border-strong);overflow:hidden}' +
    '@container (max-width:559px){.hbv-st.hbv-iso.hbv-wait{aspect-ratio:auto;min-height:calc(75cqi + 100px)}}' +
    '.hbv-iso .isx{--isx-display:var(--font-display);--isx-body:var(--font-body)}' +
    '.hbv-iso .isx-stage{outline:1px solid var(--border-strong);outline-offset:-1px}' +
    '.hbv-iso .isx-mq h3,.hbv-iso .isx-mq b,.hbv-iso .isx-big b,.hbv-iso .isx-big span{font-weight:600}' +
    '.hbv-isoctl{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:10px}' +
    '.hbv-ib{font-family:var(--font-display);font-size:12px;letter-spacing:1.5px;text-transform:uppercase;background:transparent;color:var(--text-primary);border:1px solid var(--border-strong);border-radius:2px;padding:7px 12px;cursor:pointer}' +
    '.hbv-ib.pri{border-color:var(--brand-red,#EE2D24)}' +
    '.hbv-ib:disabled{opacity:.45;cursor:default}' +
    '.hbv-ib:focus-visible{outline:2px solid var(--text-primary);outline-offset:2px}' +
    '.hbv-isoctl .where{font:600 12px var(--font-display);letter-spacing:1.5px;text-transform:uppercase;color:var(--text-secondary);margin-left:4px}' +
    '.hbv-isoctl .hint{margin-left:auto;font:400 12px var(--font-body);color:var(--text-secondary)}' +
    '.hbv-tv .hbv-isow{width:100%;display:flex;justify-content:center}' +
    '.hbv-tv .hbv-isoctl{display:none}' +
    '@media (max-width:520px){.hbv-isoctl .hint{display:none}}' +
    '@media print{.hbv-isoctl{display:none!important}}';
  document.head.appendChild(css);

  /* ---------------------------------------------------------------- loading */
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = src; s.async = false;
      s.onload = function () { res(); }; s.onerror = function () { rej(new Error('could not load ' + src)); };
      document.head.appendChild(s);
    });
  }
  function start() {
    if (state !== 'idle') return;
    state = 'loading';
    loadScript(BASE + 'iso-kit.js?v=' + VERSION).then(function () { return loadScript(BASE + 'iso-explainer.js?v=' + VERSION); })
      .then(function () { return Promise.all(BATCHES.map(function (f) { return loadScript(BASE + f + '?v=' + VERSION).catch(function (e) { if (window.console) console.warn('HBIso: ' + e.message); }); })); })
      .then(function () { state = (window.ISOX && window.HB_ISO) ? 'ready' : 'failed'; flush(); })
      .catch(function (e) { state = 'failed'; if (window.console) console.warn('HBIso: ' + e.message); flush(); });
  }
  function flush() { var w = waiters; waiters = []; w.forEach(function (fn) { try { fn(); } catch (e) { /* never breaks the page */ } }); }
  function whenReady(fn) { if (state === 'ready' || state === 'failed') fn(); else { waiters.push(fn); start(); } }

  /* ---------------------------------------------------------------- one video */
  function btn(label, cls, parent) { var b = document.createElement('button'); b.type = 'button'; b.className = 'hbv-ib' + (cls ? ' ' + cls : ''); b.textContent = label; parent.appendChild(b); return b; }

  function make(sec, inTv, fallback) {
    var wrap = document.createElement('div'); wrap.className = 'hbv-isow';
    var st = document.createElement('div'); st.className = 'hbv-st hbv-iso hbv-wait'; st.setAttribute('role', 'group'); st.setAttribute('aria-label', 'Animated explainer: ' + sec.title);
    wrap.appendChild(st);
    var ctl = document.createElement('div'); ctl.className = 'hbv-isoctl'; ctl.hidden = true; wrap.appendChild(ctl);
    var v = { el: wrap, t0: 0, L: 21, vis: true, iso: false, inst: null, endedAt: 0, startedAt: performance.now(), fb: null, place: function () {}, spec: null };
    var bBack, bPlay, bNext, bReplay, where, hint;

    function sync() {
      if (!v.inst || !where) return;
      var s = v.inst.spec.steps.length, i = Math.min(s - 1, Math.max(0, v.inst.shown));
      where.textContent = 'Step ' + (i + 1) + ' of ' + s;
      bPlay.textContent = v.inst.playing ? 'Pause' : 'Play';
      bPlay.disabled = !!window.ISOX.reduced;
    }
    function mount(spec) {
      var ISOX = window.ISOX;
      st.className = 'hbv-st hbv-iso'; st.textContent = '';
      v.spec = spec; v.iso = true; v.L = ISOX.timeline(spec).total;
      v.inst = ISOX.mount(st, spec, {
        aspect: '4:3', controls: false, loop: !inTv,
        onEnd: function () { v.endedAt = performance.now(); },
        onStep: function (i, inst) {
          sync();
          var d = { id: sec.id, step: i, steps: spec.steps.length, title: spec.steps[i].title, inst: inst, spec: spec, tv: !!inTv };
          listeners.slice().forEach(function (fn) { try { fn(d); } catch (e) { /* a sound pass must never break the video */ } });
          try { wrap.dispatchEvent(new CustomEvent('hbiso-step', { bubbles: true, detail: d })); } catch (e) { /* old browser */ }
        }
      });
      if (!inTv) {
        ctl.hidden = false; ctl.textContent = '';
        bBack = btn('Back', '', ctl); bPlay = btn('Pause', 'pri', ctl); bNext = btn('Next', '', ctl); bReplay = btn('Replay', '', ctl);
        where = document.createElement('span'); where.className = 'where'; ctl.appendChild(where);
        hint = document.createElement('span'); hint.className = 'hint'; hint.textContent = 'Space pauses, arrow keys step, R replays'; ctl.appendChild(hint);
        bBack.setAttribute('aria-label', 'Back one step'); bNext.setAttribute('aria-label', 'Next step'); bReplay.setAttribute('aria-label', 'Replay from the start'); bPlay.setAttribute('aria-label', 'Pause or play');
        bBack.addEventListener('click', function (e) { e.stopPropagation(); v.inst.back(); sync(); });
        bNext.addEventListener('click', function (e) { e.stopPropagation(); v.inst.next(); sync(); });
        bReplay.addEventListener('click', function (e) { e.stopPropagation(); v.inst.replay(); sync(); });
        bPlay.addEventListener('click', function (e) { e.stopPropagation(); v.inst.toggle(); sync(); });
        sync();
      }
      track(v);
    }
    function mountWhenAttached(spec, tries) {
      if (wrap.isConnected || tries > 60) { mount(spec); return; }
      requestAnimationFrame(function () { mountWhenAttached(spec, (tries || 0) + 1); });
    }
    function showFallback() {
      if (!fallback || v.fb) return;
      var f = fallback(sec); v.fb = f; if (f && f.el) { wrap.insertBefore(f.el, st); st.hidden = true; }
    }
    function arrive() {
      var spec = window.HB_ISO && window.HB_ISO[sec.id];
      if (spec) { if (v.fb && v.fb.el) v.fb.el.remove(); st.hidden = false; mountWhenAttached(spec, 0); }
      else { showFallback(); }
    }
    if (state === 'ready') arrive();
    else { if (!KNOWN[sec.id]) showFallback(); whenReady(arrive); }

    /* page-facing API */
    v.finished = function () {
      if (!v.iso) return (performance.now() - v.startedAt) / 1000 > 12;
      return v.endedAt > 0 && (performance.now() - v.endedAt) / 1000 > HOLD_END;
    };
    v.setPaused = function (p) { if (v.inst) { if (p) v.inst.pause(); else if (v.endedAt === 0) v.inst.play(); } };
    v.replay = function () { if (v.inst) { v.endedAt = 0; v.inst.replay(); sync(); } };
    v.next = function () { if (v.inst) { v.inst.next(); sync(); } };
    v.back = function () { if (v.inst) { v.inst.back(); sync(); } };
    v.dispose = function () { if (v.inst) { try { v.inst.destroy(); } catch (e) { /* gone already */ } v.inst = null; } };
    return v;
  }

  /* an explainer whose picture has left the page is destroyed, so the shared loop never keeps dead instances */
  function track(v) {
    live.push(v);
    if (!sweeper) sweeper = setInterval(function () {
      live = live.filter(function (x) { if (x.el.isConnected) return true; x.dispose(); return false; });
      if (!live.length) { clearInterval(sweeper); sweeper = 0; }
    }, 1500);
  }

  /* ---------------------------------------------------------------- keys in TV mode: R replays the current explainer */
  document.addEventListener('keydown', function (e) {
    if ((e.key !== 'r' && e.key !== 'R') || e.ctrlKey || e.metaKey || e.altKey) return;
    var tv = document.querySelector('.hbv-tv'); if (!tv) return;
    var w = tv.querySelector('.hbv-isow'), cur = null;
    live.forEach(function (x) { if (x.el === w) cur = x; });
    if (cur) { e.preventDefault(); cur.replay(); }
  }, true);

  /* ---------------------------------------------------------------- public */
  window.HBIso = {
    version: VERSION,
    /* the page calls this from video(sec): returns a video object, or null to use the old 2D scene */
    video: function (sec, inTv, fallback) {
      if (!sec || !sec.id) return null;
      if (state === 'failed') return null;
      if (state === 'ready') return (window.HB_ISO && window.HB_ISO[sec.id]) ? make(sec, inTv, fallback) : null;
      return make(sec, inTv, fallback);
    },
    has: function (id) { return state === 'ready' ? !!(window.HB_ISO && window.HB_ISO[id]) : !!KNOWN[id]; },
    preload: start,
    onstep: function (fn) { if (typeof fn === 'function') listeners.push(fn); return function () { var k = listeners.indexOf(fn); if (k >= 0) listeners.splice(k, 1); }; },
    get state() { return state; }
  };
})();
