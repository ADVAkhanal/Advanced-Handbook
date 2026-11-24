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
