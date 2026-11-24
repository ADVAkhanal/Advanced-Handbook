  /* 3.6 New Hires and Introductory Periods: a path through the shop, one calendar, a manager checking in */
  (function () {
    var C1 = cam(16, 12, 0, 120, 90), C2 = cam(20, 12, 0, 120, 90), C3 = cam(28, 6, 0, 198, 90);
    make({ sid: '3.6', key: 'a36', title: 'Introductory period', std: 'Hiring & Orientation', blurb: 'The first 90 days are an introductory period to learn the job and to see how it goes.',
      X: 50, Y: 32, H: 26, backdrop: ['stripes', '#101514', '#161d1b'],
      floor: { style: 'grid', a: '#222a28', b: '#283230', zones: [[4, 20, 8, 8, '#2f4a3c', 1], [18, 20, 8, 8, '#4a4a2f', 1], [32, 20, 8, 8, '#3c3c3c', 1]] }, wall: { style: 'studs', tint: '#6ad79f' },
      items: function (L, g, fx, S) {
        /* footprints: calendar on the wall at x 30..44, work bench 4..20 x 4..12, machine 28..46 x 1..15, mats are flat. new hire starts at 6,24, manager waits at 26,16 */
        L.prop('haCal', 32, 0, 8, { w: 14, h: 14, mark: S.mark, cols: 5, rows: 4 });
        L.prop('table', 4, 4, 0, { w: 16, d: 8, h: 9, plate: P.st2 });
        L.prop('machine', 28, 1, 0, { face: 'y', door: 0, lamp: 'green', spin: S.t * 2, run: S.run ? 0.4 : 0, t: S.t });
        L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { arm: S.meArm || 'down', badge: true })));
        if (S.mgr) L.person(S.mgr.x, S.mgr.y, S.mgr.dir, fx.who(S.mgr, ext(MGR, { arm: S.mgrArm || 'down' })));
        if (S.pop) L.add([S.pop[0], S.pop[1], 0, S.pop[0] + 1, S.pop[1] + 1, 1], function () { ring(g, S.pop[0], S.pop[1], 2, S.t * 0.9, '#6ad79f', 10); });
      },
      steps: [
        { title: 'Your first days', sub: 'You are new here', dur: 7, cam: C1, key: ['haCal'], cap: ['You learn the company and the job', 'The first 90 days'],
          S: function (t, fx) { return { t: t, mark: 1 + Math.floor(t * 1.2), me: fx.walk([[6, 26], [10, 22], [14, 18]], t, 0.4, 3.0, { endDir: 1 }), meArm: t > 3.4 ? 'out' : 'down', mgr: { x: 24, y: 17, dir: 2 } }; } },
        { title: 'Your performance is watched', sub: 'Quality and value of your work', dur: 8, cam: C2, key: ['haCal', 'machine'], cap: ['Your manager sees how it goes', 'Changes can be made to your duties'],
          S: function (t, fx) { var w = fx.walk([[14, 18], [22, 24], [36, 20], [36, 18]], t, 0.8, 3.8, { endDir: 3 }), m = fx.walk([[48, 6], [48, 11], [47, 14]], t, 3.8, 5.2, { endDir: 2 }); return { t: t, mark: 4 + Math.floor(t * 2.2), me: t < 0.8 ? { x: 14, y: 18, dir: 1 } : w, run: t > 3.4, meArm: t > 3.4 ? 'out' : 'down', mgr: t > 3.6 ? m : null, mgrArm: t > 5.4 ? 'out' : 'down', pop: t > 5.4 && t < 6.4 ? [47, 14] : null }; } },
        { title: 'Ninety days', sub: 'Management and Human Resources decide', dur: 6.5, cam: C3, big: { n: '90', label: 'days, introductory period', pos: 'left' },
          S: function (t, fx) { return { t: t, mark: 20, me: { x: 36, y: 18, dir: 3 }, run: true, meArm: 'out', mgr: { x: 44, y: 19, dir: 2 }, mgrArm: 'out' }; } }
      ] });
  })();
