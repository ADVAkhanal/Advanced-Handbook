/* shop-sound.js: the Shop Rock 8-bit tunes, opt in.
   One small button ("Sound off" / "Sound on"). OFF by default. Nothing plays, loads or asks the browser for anything until a person
   turns it on. The choice is remembered per site in localStorage; on a later visit a remembered ON waits for the person's first click
   or key press (browsers do not allow sound before that), then plays. Never autoplays. Stops when the tab is hidden, and with
   "reduce motion" it is not offered at all. The tune file loads only when sound is first turned on.
   Use:  ShopSound.mount(hostElement, { key: 'handbook', src: 'audio/lunch-whistle-boogie.mp3', volume: 0.35 })
   Events: a bubbling "shopsound" event on document ({ on }) when it is switched, so a page can react.
   The kit pages fire "isx-step"; this module does not need it (the tune is one loop), but the hook is there: ShopSound.onStep(fn). */
(function (root) {
  'use strict';
  var doc = root.document;
  var reduced = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var store = {
    get: function (k) { try { return root.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { root.localStorage.setItem(k, v); } catch (e) { /* private window: the choice is not remembered */ } }
  };
  var instances = [];

  function mount(host, opts) {
    if (!host || !opts || !opts.src || reduced) return null;
    var key = 'shopsound.' + (opts.key || 'site');
    var audio = null, on = false, wantOn = store.get(key) === '1', started = false;
    var btn = doc.createElement('button');
    btn.type = 'button'; btn.className = 'shop-sound'; btn.setAttribute('aria-pressed', 'false');
    btn.title = 'Shop rock, 8-bit tunes. Off unless you turn them on.';
    host.appendChild(btn);
    function paint() { btn.textContent = on ? 'Sound on' : 'Sound off'; btn.setAttribute('aria-pressed', on ? 'true' : 'false'); }
    function ensureAudio() {
      if (audio) return audio;
      audio = new root.Audio(); audio.src = opts.src; audio.loop = true; audio.preload = 'auto'; audio.volume = typeof opts.volume === 'number' ? opts.volume : 0.35;
      return audio;
    }
    function play() {
      var p; try { p = ensureAudio().play(); } catch (e) { p = null; }
      if (p && p.then) p.then(function () { on = true; started = true; paint(); announce(); }, function () { on = false; paint(); });
      else { on = true; started = true; paint(); announce(); }
    }
    function stop() { if (audio) { try { audio.pause(); } catch (e) { /* already stopped */ } } on = false; paint(); announce(); }
    function announce() { try { doc.dispatchEvent(new root.CustomEvent('shopsound', { detail: { on: on, key: opts.key || 'site' } })); } catch (e) { /* old browser */ } }
    btn.addEventListener('click', function () {
      if (on) { store.set(key, '0'); wantOn = false; stop(); } else { store.set(key, '1'); wantOn = true; play(); }
    });
    // a remembered ON starts only after the person's own first click or key press on this visit
    if (wantOn) {
      var first = function (e) { if (e && e.target === btn) return; doc.removeEventListener('pointerdown', first, true); doc.removeEventListener('keydown', first, true); if (wantOn && !on) play(); };
      doc.addEventListener('pointerdown', first, true); doc.addEventListener('keydown', first, true);
    }
    doc.addEventListener('visibilitychange', function () {
      if (!audio || !started) return;
      if (doc.hidden) { try { audio.pause(); } catch (e) { /* stopped */ } } else if (on) { try { audio.play(); } catch (e) { /* needs a gesture again */ } }
    });
    paint();
    var api = { button: btn, isOn: function () { return on; }, turnOff: function () { store.set(key, '0'); wantOn = false; stop(); } };
    instances.push(api);
    return api;
  }
  var stepHooks = [];
  function onStep(fn) { if (typeof fn === 'function') stepHooks.push(fn); }
  if (doc && doc.addEventListener) doc.addEventListener('isx-step', function (e) { stepHooks.forEach(function (f) { try { f(e && e.detail); } catch (err) { /* a hook never breaks the page */ } }); });
  var API = { mount: mount, onStep: onStep, instances: instances };
  root.ShopSound = API; if (typeof module !== 'undefined') module.exports = API;
})(typeof window !== 'undefined' ? window : this);
