  /* 3.4 Federal Accommodations for Pregnant Employees: the car park and the entrance */
  (function () {
    var C1 = cam(18, 12, 0, 120, 90), C2 = cam(18, 12, 0, 96, 90), C3 = cam(30, 4, 0, 196, 88);
    make({ sid: '3.4', key: 'a34', title: 'Pregnancy accommodations', std: 'Hiring & Orientation', blurb: 'ADVANCED provides reasonable accommodation for known limits related to pregnancy, childbirth or related conditions.',
      X: 48, Y: 34, H: 22, backdrop: ['stripes', '#101417', '#171c20'],
      floor: { style: 'checker', a: '#2a2d30', b: '#2e3235', tile: 8, zones: [[24, 6, 10, 14, '#3a4a40', 1], [3, 16, 11, 1, P.st3, 1], [3, 24, 11, 1, P.st3, 1], [3, 32, 11, 1, P.st3, 1]] }, wall: { style: 'panel', tint: '#6ad79f' },
      items: function (L, g, fx, S) {
        /* footprints: far car space 3..17 x 22..29, closer space 24..34 x 6..20, door 38..48 x 0..2, rack 40..48 x 4..12, bench 36..42 x 26..31 */
        L.prop('haDoor', 38, 0, 0, { w: 10, h: 18, open: S.door || 0, col: ISO.M.blue.left });
        L.prop('haCar', S.car.x, S.car.y, 0, { col: S.car.col || 'red' });
        if (S.seat) L.prop('haBench', 36, 26, 0, { w: 6 });
        if (S.vest) { L.prop('cabinet', 40, 4, 0, {}); L.prop('wallclock', 26, 0, 9, { hour: 9, min: 30 }); }
        L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { shirt: '#d98a9a', arm: S.meArm || 'down' })));
        if (S.mgr) L.person(S.mgr.x, S.mgr.y, S.mgr.dir, fx.who(S.mgr, ext(MGR, { arm: S.mgrArm || 'down' })));
        if (S.pop) L.add([S.pop[0], S.pop[1], 0, S.pop[0] + 1, S.pop[1] + 1, 1], function () { ring(g, S.pop[0], S.pop[1], S.pop[2] || 6, S.t * 0.9, '#6ad79f', 10); });
      },
      steps: [
        { title: 'Who this is for', sub: 'Pregnancy, childbirth, related conditions', dur: 7, cam: C1, key: ['haCar'], cap: ['A long walk from the far space', 'Limits can come with pregnancy'],
          S: function (t, fx) { return { t: t, car: { x: 3, y: 22, col: 'blue' }, me: fx.walk([[18, 26], [24, 22], [32, 16]], t, 0.6, 5.6, { endDir: 0 }), mgr: { x: 42, y: 16, dir: 1 }, door: 0 }; } },
        { title: 'Reasonable accommodation', sub: 'Seating, parking, hours, safety apparel', dur: 8.5, cam: C2, key: ['haCar'], cap: ['A closer space and a seat', 'Flexible hours and safety apparel'],
          S: function (t, fx) { var k = fx.E(t, 0.6, 2.4); return { t: t, car: { x: Math.round(3 + 23 * k), y: Math.round(22 - 14 * k), col: 'blue' }, seat: t > 3.4, vest: t > 5.2, pop: t > 2.4 && t < 3.6 ? [29, 13, 10] : (t > 3.4 && t < 4.6 ? [39, 28, 6] : (t > 5.2 && t < 6.4 ? [44, 8, 8] : null)), me: { x: 34, y: 22, dir: 0 }, mgr: { x: 42, y: 16, dir: 1 }, door: 0 }; } },
        { title: 'Tell your manager', sub: 'Ask for what you need', dur: 6.5, cam: C3, big: { n: 'PWFA', label: 'the federal act', pos: 'left' },
          S: function (t, fx) { return { t: t, car: { x: 26, y: 8, col: 'blue' }, seat: true, vest: true, me: { x: 33, y: 18, dir: 0 }, mgr: { x: 44, y: 18, dir: 2 }, meArm: 'out', mgrArm: 'out', door: 0.4 }; } }
      ] });
  })();
