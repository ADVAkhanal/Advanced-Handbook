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
