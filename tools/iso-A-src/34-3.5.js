  /* 3.5 Job Descriptions: three jobs on the shop floor, each with its own sheet */
  (function () {
    var C1 = cam(20, 10, 0, 120, 90), C2 = cam(20, 10, 0, 150, 90), C3 = cam(30, 2, 0, 196, 88);
    make({ sid: '3.5', key: 'a35', title: 'Job descriptions', std: 'Hiring & Orientation', blurb: 'ADVANCED keeps a job description for each position. It is an outline only: ask your manager about your duties.',
      X: 52, Y: 30, H: 26, backdrop: ['diag', '#16150f', '#1f1d14'],
      floor: { style: 'checker', a: '#2b2f33', b: '#31363b', tile: 6 }, wall: { style: 'panel', tint: '#c9952b' },
      items: function (L, g, fx, S) {
        /* footprints: machine 4..22 x 1..15, bench 28..44 x 3..11, sheet tables 22..28 x 14..19 and 44..50 x 14..19; workers at 12,18 and 36,15; manager walks along y 24 */
        L.prop('machine', 4, 1, 0, { door: 0, lamp: 'green', spin: S.t * 2, run: 0.4, t: S.t });
        L.prop('table', 28, 3, 0, { w: 16, d: 8, h: 9, plate: P.st2 });
        L.prop('caliper', 33, 5, 9, { open: 0.6 });
        L.prop('table', 2, 17, 0, { w: 6, d: 5, h: 9 });
        L.prop('table', 40, 16, 0, { w: 6, d: 5, h: 9 });
        if (S.s1) L.prop('docs', 3, 18, 9, { n: 1, head: P.green, w: 4, d: 3 });
        if (S.s2) L.prop('docs', 41, 17, 9, { n: 1, head: P.amber, w: 4, d: 3 });
        L.person(12, 18, 3, ext(OPA, { arm: S.w1Arm || 'out' }));
        if (!S.noW2) L.person(36, 14, 1, ext(OPB, { arm: S.w2Arm || 'write', tool: P.st4 }));
        if (S.crate) L.prop('crate', S.crate.x, S.crate.y, 0, { w: 6, d: 5, h: 5, tag: P.red });
        if (S.mgr) L.person(S.mgr.x, S.mgr.y, S.mgr.dir, fx.who(S.mgr, ext(MGR, { arm: S.mgrArm || 'down', hold: S.mgrHold ? ISO.M.card.left : undefined, holdSize: [5, 5] })));
        if (S.pop) L.add([S.pop[0], S.pop[1], 0, S.pop[0] + 1, S.pop[1] + 1, 1], function () { ring(g, S.pop[0], S.pop[1], S.pop[2], S.t * 0.9, S.pop[3] || '#6ad79f', 10); });
      },
      steps: [
        { title: 'A job for each role', sub: 'Operator, machinist, deburr technician', dur: 7, cam: C1, key: ['machine'], cap: ['Every position has a description', 'It lists the role and the duties'],
          S: function (t, fx) { return { t: t, s1: t > 1.2, s2: t > 2.6, pop: t > 1.2 && t < 2.4 ? [5, 19, 9] : (t > 2.6 && t < 3.8 ? [43, 18, 9] : null) }; } },
        { title: 'It is an outline', sub: 'Duties can change with business needs', dur: 8, cam: C2, key: ['machine'], cap: ['You may be asked to do more', 'Duties not in your written description'],
          S: function (t, fx) { var m = fx.walk([[40, 24], [30, 20], [20, 17]], t, 0.4, 3.0, { endDir: 2 }); return { t: t, s1: true, s2: true, noW2: true, mgr: m, mgrHold: t < 4.6, mgrArm: t > 3.4 && t < 4.8 ? 'out' : 'down', crate: t > 4.6 ? { x: 15, y: 21 } : null, w1Arm: t > 3.4 && t < 4.8 ? 'out' : 'out' }; } },
        { title: 'Ask your manager', sub: 'Questions about your duties', dur: 6.5, cam: C3, big: { n: 'OUTLINE', label: 'only, not every duty', pos: 'left' },
          S: function (t, fx) { return { t: t, s1: true, s2: true, mgr: { x: 49, y: 18, dir: 2 }, mgrArm: 'out', w2Arm: 'out' }; } }
      ] });
  })();
