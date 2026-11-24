  /* 4.5 Job Abandonment: an empty workstation, a phone that is not answered, three days on the calendar */
  (function () {
    var C1 = cam(16, 6, 0, 120, 90), C2 = cam(16, 6, 0, 100, 90), C3 = cam(30, 2, 0, 196, 88);
    make({ sid: '4.5', key: 'a45', title: 'Job abandonment', std: 'Pay & Hours', blurb: 'If you do not show up or call in with an acceptable reason for three consecutive days, you are considered to have resigned.',
      X: 46, Y: 28, H: 24, backdrop: ['bands', '#170f0f', '#211515'],
      floor: { style: 'grid', a: '#2a2424', b: '#312a2a' }, wall: { style: 'panel', tint: '#e03131' },
      items: function (L, g, fx, S) {
        /* footprints: empty bench 4..20 x 8..16 with a stool, manager desk 30..44 x 6..14 (manager behind at 37,4), calendar on the wall 30..42 */
        L.prop('table', 4, 8, 0, { w: 16, d: 8, h: 9, plate: P.st2 });
        L.prop('haChair', 10, 18, 0, { col: 'red' });
        L.prop('lamp', 6, 10, 9, { col: 'red', on: true });
        L.prop('desk', 30, 6, 0, { w: 14, d: 8 });
        L.prop('haPhone', 32, 8, 9, { ring: S.ring });
        L.prop('haCal', 30, 0, 8, { w: 12, h: 12, mark: S.day, cols: 3, rows: 3 });
        if (S.file) L.prop('docs', 38, 8, 9, { n: 2, head: P.red, w: 6, d: 4, stamp: S.stamp });
        L.person(37, 3, 1, ext(MGR, { arm: S.mgrArm || 'down' }));
        if (S.hr) L.person(S.hr.x, S.hr.y, S.hr.dir, fx.who(S.hr, ext(HRP, { arm: S.hrArm || 'down' })));
        if (S.pop) L.add([S.pop[0], S.pop[1], 0, S.pop[0] + 1, S.pop[1] + 1, 1], function () { ring(g, S.pop[0], S.pop[1], 8, S.t * 0.9, P.redT, 10); });
      },
      steps: [
        { title: 'The bench is empty', sub: 'No show and no call', dur: 7, cam: C1, key: ['table'], cap: ['A team member does not show up', 'Nobody has called in'],
          S: function (t, fx) { return { t: t, day: 1, ring: t > 2 && t < 5, mgrArm: t > 5 ? 'out' : 'down', pop: t > 1.6 && t < 3 ? [12, 12] : null }; } },
        { title: 'Day after day', sub: 'Consecutive days with no call', dur: 8, cam: C2, key: ['table'], cap: ['The days add up', 'Still no acceptable reason'],
          S: function (t, fx) { return { t: t, day: 1 + Math.min(2, Math.floor(t / 2.4)), ring: Math.floor(t * 1.5) % 2 === 0 && t < 7, mgrArm: Math.floor(t * 0.8) % 2 ? 'out' : 'down', pop: Math.floor(t / 2.4) < 3 && (t % 2.4) < 0.9 ? [12, 12] : null }; } },
        { title: 'Considered resigned', sub: 'After three days the job is treated as left', dur: 6.5, cam: C3, big: { n: 'THREE', label: 'days in a row', pos: 'left' },
          S: function (t, fx) { return { t: t, day: 3, file: true, stamp: t > 3, hr: t > 0.6 ? { x: 44, y: 17, dir: 2 } : null, pop: t > 0.6 && t < 1.8 ? [44, 17] : null, hrArm: t > 2.2 ? 'out' : 'down', mgrArm: 'out' }; } }
      ] });
  })();
