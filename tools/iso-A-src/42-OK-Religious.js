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
