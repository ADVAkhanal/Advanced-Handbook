  /* OK-Disability Accommodation: an HR meeting room, a talk across the table, then the workstation is changed */
  (function () {
    var C1 = cam(16, 4, 0, 120, 90), C2 = cam(18, 6, 0, 138, 84), C3 = cam(30, 0, 0, 226, 88);
    make({ sid: 'OK-Disability Accommodation', key: 'a40', title: 'Disability accommodation', std: 'Hiring & Orientation', blurb: 'If you need an accommodation because of a disability, tell your manager. You and the company talk it through.',
      X: 44, Y: 26, H: 26, backdrop: ['diag', '#12161a', '#1a2026'],
      floor: { style: 'grid', a: '#23282c', b: '#292f34' }, wall: { style: 'panel', tint: '#8fb4d9' },
      items: function (L, g, fx, S) {
        /* footprints: table 12..30 x 10..18, HR behind it at 21,6, employee left at 6,14, manager right at 36,14; adjustable desk 28..40 x 20..26 */
        L.prop('table', 12, 10, 0, { w: 18, d: 8, h: 9, top: 'wood' });
        if (S.docs > 0) L.prop('docs', 16, 12, 9, { n: S.docs, head: P.blue, w: 6, d: 4 });
        if (S.docs > 1) L.prop('docs', 23, 13, 9, { n: 1, head: P.amber, w: 5, d: 4 });
        L.prop('cabinet', 38, 2, 0, {}); L.prop('lamp', 36, 3, 15, { col: 'green', on: true });
        if (S.desk) { L.prop('desk', 28, 20, S.deskUp, { w: 12, d: 6 }); L.prop('haChair', 34, 20 + 6, 0, { col: 'blue' }); }
        L.person(21, 6, 1, ext(HRP, { arm: S.hrArm || 'down' }));
        L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { arm: S.meArm || 'down' })));
        if (!S.noMgr) L.person(36, 14, 1, ext(MGR, { arm: S.mgrArm || 'down' }));
        if (S.flow) S.flow.forEach(function (p) { L.flow(p, S.t, { color: P.amber, len: 2, gap: 3, speed: 9, z: 0 }); });
        if (S.pop) L.add([S.pop[0], S.pop[1], 0, S.pop[0] + 1, S.pop[1] + 1, 1], function () { ring(g, S.pop[0], S.pop[1], 4, S.t * 0.9, '#6ad79f', 10); });
      },
      steps: [
        { title: 'You ask for help', sub: 'Because of a disability', dur: 7, cam: C1, key: ['table'], cap: ['You need an accommodation', 'You tell your manager'],
          S: function (t, fx) { return { t: t, docs: 0, me: fx.walk([[0, 20], [4, 17], [6, 14]], t, 0.4, 2.2, { endDir: 0 }), meArm: t > 3 ? 'out' : 'down', mgrArm: t > 4 ? 'out' : 'down' }; } },
        { title: 'You talk it through', sub: 'An interactive dialogue', dur: 8, cam: C2, key: ['table'], cap: ['What is needed and why, and how it helps', 'Medical information stays confidential'],
          S: function (t, fx) { var a = Math.floor(t * 1.3) % 2; return { t: t, docs: t > 1 ? (t > 2.4 ? 2 : 1) : 0, me: { x: 6, y: 14, dir: 0 }, meArm: a ? 'out' : 'down', mgrArm: a ? 'down' : 'out', hrArm: t > 4 ? 'out' : 'down', flow: [[[8, 23], [18, 23], [30, 23]]], desk: t > 5, deskUp: Math.round(fx.E(t, 5.2, 7) * 4), pop: t > 5 && t < 6.2 ? [38, 22] : null }; } },
        { title: 'No payback', sub: 'Asking is protected', dur: 6.5, cam: C3, big: { n: 'NO', label: 'retaliation for asking', pos: 'left' },
          S: function (t, fx) { return { t: t, docs: 2, desk: true, deskUp: 4, noMgr: true, me: { x: 38, y: 17, dir: 3 }, meArm: 'out' }; } }
      ] });
  })();
