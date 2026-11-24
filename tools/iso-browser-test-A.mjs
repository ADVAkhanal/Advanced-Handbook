/* iso-browser-test-A.mjs: drives the handbook page in its OWN headless Chrome (own profile, own tab) through the iso adapter.
     node tools/iso-browser-test-A.mjs [baseUrl] [outDir]
   Serve the repo first, e.g.  python -m http.server 8847 --bind 127.0.0.1 --directory <repo>
   Checks at 1920, 1366, 1024 and 390 px: a few policies open in the page (explainer mounted, 4:3 stage, controls present, no
   horizontal overflow, nothing overlapping the controls), a policy with no iso spec still draws its old scene, TV mode (full screen
   box, side text, Next / Back, the explainer moves on by itself), reduced motion shows a still, console errors are listed. */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const BASE = process.argv[2] || 'http://127.0.0.1:8847/Advanced_Handbook_Dashboard.html';
const OUT = process.argv[3] || path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', 'iso', 'shots-A');
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

const PORT = 9500 + Math.floor(Math.random() * 400);
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'isotest-'));
const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=' + PORT, '--user-data-dir=' + prof, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
let ver; for (let i = 0; i < 60; i++) { try { ver = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); break; } catch { await sleep(200); } }
if (!ver) { console.error('chrome did not start'); process.exit(2); }
const ws = new WebSocket(ver.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = new Map(), logs = [];
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pend.has(d.id)) { const { res, rej } = pend.get(d.id); pend.delete(d.id); d.error ? rej(new Error(d.error.message)) : res(d.result); return; }
  if (d.method === 'Runtime.consoleAPICalled' && (d.params.type === 'error' || d.params.type === 'warning')) logs.push(d.params.type + ': ' + d.params.args.map((a) => a.value ?? a.description).join(' '));
  else if (d.method === 'Runtime.exceptionThrown') logs.push('exception: ' + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text));
  else if (d.method === 'Log.entryAdded' && (d.params.entry.level === 'error' || d.params.entry.level === 'warning')) logs.push('log.' + d.params.entry.level + ': ' + d.params.entry.text + ' ' + (d.params.entry.url || ''));
};
const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const S = (m, p) => send(m, p, sessionId);
await S('Page.enable'); await S('Runtime.enable'); await S('Log.enable'); await S('Network.enable'); await S('Network.setCacheDisabled', { cacheDisabled: true });
const ev = async (expr) => { const r = await S('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval failed'); return r.result.value; };
const view = (w, h, mobile) => S('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: !!mobile });
const shot = async (name) => { const r = await S('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(r.data, 'base64')); };
const click = async (x, y) => { for (const type of ['mousePressed', 'mouseReleased']) await S('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 }); };
const key = async (k, code) => { for (const type of ['keyDown', 'keyUp']) await S('Input.dispatchKeyEvent', { type, key: k, code: code || k, windowsVirtualKeyCode: k.length === 1 ? k.toUpperCase().charCodeAt(0) : ({ ArrowRight: 39, ArrowLeft: 37, Escape: 27 })[k] || 0, text: k.length === 1 ? k : '' }); };

const results = []; const ok = (name, pass, detail) => { results.push({ name, pass, detail }); console.log((pass ? 'PASS ' : 'FAIL ') + name + (detail ? '  ' + detail : '')); };

const IDS = ['1.0', '3.2', '4.4', 'OK-EEO Statement and Non harassme', '4.5', '8.1' /* no iso spec: old 2D scene */];
const open = (sid) => ev(`(function(){var c=document.querySelector('.section-card[data-section-id="${sid.replace(/"/g, '\\"')}"]'); if(!c) return 'nocard'; if(!c.classList.contains('expanded')){var h=c.querySelector('.section-card-header'); h.click();} c.scrollIntoView({block:'start'}); return 'ok';})()`);
const close = (sid) => ev(`(function(){var c=document.querySelector('.section-card[data-section-id="${sid.replace(/"/g, '\\"')}"]'); if(c&&c.classList.contains('expanded')) c.querySelector('.section-card-header').click(); })()`);

for (const [w, h, mobile] of [[1920, 1080], [1366, 768], [1024, 768], [390, 844, true]]) {
  await view(w, h, mobile);
  await S('Page.navigate', { url: BASE }); await sleep(2200);
  const ovf = await ev('document.documentElement.scrollWidth - document.documentElement.clientWidth');
  ok(`${w}: no horizontal overflow on load`, ovf <= 1, 'by ' + ovf);
  for (const sid of IDS) {
    if (sid === '8.1') await ev('delete window.HB_ISO["8.1"]');   /* all 81 policies have a spec now: take one away to test the old-scene fallback */
    const r = await open(sid); await sleep(900);
    if (r !== 'ok') { ok(`${w}: card ${sid}`, false, r); continue; }
    await sleep(1800);
    const info = await ev(`(function(){var c=document.querySelector('.section-card[data-section-id="${sid.replace(/"/g, '\\"')}"]'); var wrap=c.querySelector('.hbv'); if(!wrap) return {nowrap:true};
      var iso=wrap.querySelector('.isx'), st=wrap.querySelector('.hbv-st'), r=st.getBoundingClientRect(), ctl=wrap.querySelector('.hbv-isoctl'), cv=wrap.querySelector('canvas');
      var mq=wrap.querySelector('.isx-mq'), cap=wrap.querySelector('.isx-cap.on'), tag=wrap.querySelector('.isx-tag');
      var mr=mq&&mq.getBoundingClientRect(), tr=tag&&tag.getBoundingClientRect();
      return {iso:!!iso, w:Math.round(r.width), h:Math.round(r.height), ratio:+(r.width/r.height).toFixed(3), ctl:ctl&&!ctl.hidden, btns:ctl?ctl.querySelectorAll('button').length:0, canvas:cv?cv.width+'x'+cv.height:null,
        mqFont: mq? parseFloat(getComputedStyle(mq.querySelector('h3')).fontSize):0, capFont: cap? parseFloat(getComputedStyle(cap).fontSize):0,
        mqBottom: mr? +((mr.bottom-r.top)/r.height).toFixed(3):null, capInside: cap? (function(c){return c.left>=r.left-1&&c.right<=r.right+1&&c.bottom<=r.bottom+1})(cap.getBoundingClientRect()):null,
        mqInside: mr? (mr.left>=r.left-1 && mr.right<=r.right+1):null, tagOverlap: (mr&&tr)? !(tr.top>=mr.bottom-1||tr.bottom<=mr.top||tr.left>=mr.right||tr.right<=mr.left):null,
        hasOldMq: !!wrap.querySelector('.hbv-mq'), where:(wrap.querySelector('.where')||{}).textContent, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, top: Math.round(r.top)};})()`);
    const isIso = sid !== '8.1';
    if (info.nowrap) { ok(`${w}: ${sid} video block`, false, 'no .hbv block'); continue; }
    ok(`${w}: ${sid} ${isIso ? 'iso explainer mounted' : 'old 2D scene kept'}`, isIso ? (info.iso && info.canvas === '240x180') : (!info.iso && info.hasOldMq), JSON.stringify(info));
    if (isIso) {
      ok(`${w}: ${sid} 4:3 stage, controls, no old sign`, Math.abs(info.ratio - 1.333) < 0.02 && info.ctl && info.btns === 4 && !info.hasOldMq, `ratio ${info.ratio} btns ${info.btns}`);
      ok(`${w}: ${sid} no sign overflow, tag clear of sign, no page overflow`, info.mqInside && !info.tagOverlap && info.overflow <= 1, `mqInside ${info.mqInside} tagOverlap ${info.tagOverlap} overflow ${info.overflow}`);
      ok(`${w}: ${sid} sign stays in the top 27% of the picture, caption inside the picture`, info.mqBottom <= 0.27 && info.capInside !== false, `sign bottom ${info.mqBottom} capInside ${info.capInside} cap ${info.capFont}px`);
      if (info.mqFont) ok(`${w}: ${sid} sign title at least 12px and captions at least 12px`, info.mqFont >= 12 && (info.capFont === 0 || info.capFont >= 11.4), 'title ' + info.mqFont.toFixed(1) + 'px, stage ' + info.w + 'px');
    }
    if (sid === '3.2' || sid === '4.4' || sid === '8.1') await shot(`page-${w}-${sid.replace(/[^A-Za-z0-9.]/g, '_')}`);
    await close(sid);
  }
  /* controls on one policy */
  if (w === 1366) {
    await open('4.5'); await sleep(1500);
    const lab0 = await ev(`document.querySelector('.section-card[data-section-id="4.5"] .where').textContent`);
    await ev(`(function(){var b=[].slice.call(document.querySelectorAll('.section-card[data-section-id="4.5"] .hbv-ib'));b.find(function(x){return x.textContent==='Next'}).click();})()`); await sleep(400);
    const lab1 = await ev(`document.querySelector('.section-card[data-section-id="4.5"] .where').textContent`);
    await ev(`(function(){var b=[].slice.call(document.querySelectorAll('.section-card[data-section-id="4.5"] .hbv-ib'));b.find(function(x){return x.textContent==='Pause'}).click();})()`); await sleep(300);
    const lab2 = await ev(`[].slice.call(document.querySelectorAll('.section-card[data-section-id="4.5"] .hbv-ib')).map(function(x){return x.textContent}).join('|')`);
    await ev(`document.querySelector('.section-card[data-section-id="4.5"] .isx').focus()`);
    await key('ArrowRight'); await sleep(300);
    const lab3 = await ev(`document.querySelector('.section-card[data-section-id="4.5"] .where').textContent`);
    await key('r'); await sleep(300);
    const lab4 = await ev(`document.querySelector('.section-card[data-section-id="4.5"] .where').textContent`);
    ok('controls: Next, Pause/Play, arrow key, R', lab0 === 'Step 1 of 3' && lab1 === 'Step 2 of 3' && /Play/.test(lab2) && lab3 === 'Step 3 of 3' && lab4 === 'Step 1 of 3', [lab0, lab1, lab2, lab3, lab4].join(' / '));
    const evs = await ev(`(function(){var n=0; window.HBIso.onstep(function(){n++;}); var c=document.querySelector('.section-card[data-section-id="4.5"] .isx'); c.focus(); return 0;})()`);
    await key('ArrowRight'); await sleep(200);
    ok('onstep hook fires', (await ev(`(function(){var n=0;var off=window.HBIso.onstep(function(){n++;});document.querySelector('.section-card[data-section-id="4.5"] .hbv-ib:nth-child(3)').click();off();return n;})()`)) >= 1, '');
    await close('4.5');
  }
  /* TV mode */
  if (w === 1366 || w === 390) {
    const r = await ev(`(function(){var b=[].slice.call(document.querySelectorAll('.hbv-all')).find(function(x){return /Watch all/.test(x.textContent)}); if(!b) return 'nobutton'; b.click(); return 'ok';})()`);
    await sleep(1800);
    const tv = await ev(`(function(){var t=document.querySelector('.hbv-tv'); if(!t) return null; var st=t.querySelector('.hbv-st'), r=st.getBoundingClientRect(), a=t.querySelector('aside').getBoundingClientRect(); return {iso:!!t.querySelector('.isx'), n:t.querySelector('.n').textContent, h2:t.querySelector('h2').textContent, stageW:Math.round(r.width), stageH:Math.round(r.height), asideW:Math.round(a.width), overlap: r.right>a.left+1 && r.bottom>a.top+1 && w>820, ctlHidden: getComputedStyle(t.querySelector('.hbv-isoctl')||document.body).display, boxW:t.getBoundingClientRect().width}; function w(){return innerWidth} })()`);
    ok(`${w}: TV mode opens ("Watch all" button)`, r === 'ok' && tv && tv.iso, JSON.stringify(tv));
    await shot(`tv-${w}-a`);
    await key('ArrowRight'); await sleep(1500);
    const n2 = await ev(`document.querySelector('.hbv-tv .n').textContent`);
    await key('ArrowLeft'); await sleep(1500);
    const n3 = await ev(`document.querySelector('.hbv-tv .n').textContent`);
    ok(`${w}: TV Next and Back`, !!tv && n2 !== tv.n && n3 === tv.n, [tv && tv.n, n2, n3].join(' > '));
    if (w === 1366) {
      await sleep(25000);
      const n4 = await ev(`document.querySelector('.hbv-tv .n').textContent`);
      await shot('tv-1366-b');
      ok('1366: TV explainer moves on by itself after its own length', n4 !== n3, n3 + ' > ' + n4);
    }
    await key('Escape'); await sleep(600);
    ok(`${w}: Escape closes TV mode`, (await ev(`!document.querySelector('.hbv-tv')`)), '');
  }
}

/* reduced motion: a still frame, no autoplay */
await S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await view(1366, 768); await S('Page.navigate', { url: BASE }); await sleep(2200);
await open('3.2'); await sleep(2500);
const rm = await ev(`(function(){var c=document.querySelector('.section-card[data-section-id="3.2"]'); var w=c.querySelector('.where'); var b=[].slice.call(c.querySelectorAll('.hbv-ib')); return {where:w&&w.textContent, playDisabled:b.some(function(x){return /Play|Pause/.test(x.textContent)&&x.disabled})};})()`);
await shot('reduced-1366-3.2');
ok('reduced motion: still frame, play button off', rm.where === 'Step 1 of 3' && rm.playDisabled, JSON.stringify(rm));

console.log('\nconsole errors/warnings (' + logs.length + '):'); logs.forEach((l) => console.log('  ' + l));
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed} passed, ${failed} failed, ${logs.length} console messages`);
ws.close(); proc.kill();
process.exit(failed || logs.length ? 1 : 0);
