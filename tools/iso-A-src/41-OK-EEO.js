  /* OK-EEO Statement and Non harassment Policy: the open shop floor, report to HR, a confidential investigation */
  (function () {
    var C1 = cam(15, 5, 0, 120, 84), C2 = cam(15, 5, 0, 90, 84), C3 = cam(32, 2, 0, 196, 88);
    make({ sid: 'OK-EEO Statement and Non harassme', key: 'a41', title: 'Equal opportunity and respect', std: 'Hiring & Orientation', blurb: 'Everyone is protected from harassment, discrimination and retaliation. Report concerns to HR or any manager.',
      X: 46, Y: 28, H: 26, backdrop: ['bands', '#14181a', '#1b2124'],
      floor: { style: 'epoxy', a: '#2a2a2e', b: '#303035' }, wall: { style: 'studs', tint: '#a0d9c4' },
      items: function (L, g, fx, S) {
        /* footprints: bench 4..24 x 2..10 (workers in front at y 14), HR desk 30..44 x 6..14, HR behind at 37,4, file cabinet 44..52 */
        L.prop('table', 4, 4, 0, { w: 20, d: 8, h: 9, plate: P.st2 });
        L.prop('desk', 30, 7, 0, { w: 14, d: 8 });
        L.prop('docs', 34, 9, 9, { n: S.notes, head: P.green, w: 6, d: 4 });
        L.prop('lamp', 41, 8, 9, { col: S.conf ? 'green' : 'amber', on: true });
        if (!S.noBg) { L.person(6, 14, 1, ext(OPA, { arm: 'down' })); L.person(16, 14, 1, ext(OPB, { arm: 'out' })); }
        L.person(37, 4, 1, ext(HRP, { arm: S.hrArm || 'down' }));
        if (S.me) L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { arm: S.meArm || 'down' })));
        if (S.shield) L.add([2, 12, 0, 3, 13, 1], function () { ring(g, 18, 14, 14, S.t * 0.7, '#6ad79f', 18); });
        if (S.scan) L.add([34, 9, 9, 40, 13, 10], function () { glowAt(g, 37, 11, 11, 9, '#6ad79f', 0.5 * fx.pulse(S.t, 1)); });
      },
      steps: [
        { title: 'Everyone is covered', sub: 'Free of harassment and retaliation', dur: 7, cam: C1, key: ['table'], cap: ['Equal opportunity for all of us', 'A workplace free of harassment'],
          S: function (t, fx) { return { t: t, notes: 1, me: { x: 26, y: 14, dir: 1 }, shield: t > 1.4 && t < 6, conf: false }; } },
        { title: 'Report it right away', sub: 'Tell HR or any member of management', dur: 8, cam: C2, key: ['desk'], cap: ['If you see it or feel it, tell HR', 'HR investigates promptly and thoroughly'],
          S: function (t, fx) { var w = fx.walk([[26, 14], [30, 18], [36, 17]], t, 0.6, 3.2, { endDir: 3 }); return { t: t, noBg: true, notes: 1 + (t > 4 ? 1 : 0) + (t > 5 ? 1 : 0), me: w, meArm: t > 3.4 ? 'out' : 'down', hrArm: t > 4 ? 'write' : 'down', scan: t > 5, conf: t > 5.4 }; } },
        { title: 'Kept confidential', sub: 'Action is taken where it is needed', dur: 6.5, cam: C3, big: { n: 'HR', label: 'or any manager', pos: 'left' },
          S: function (t, fx) { return { t: t, notes: 3, noBg: true, me: { x: 36, y: 17, dir: 3 }, meArm: 'out', hrArm: 'write', conf: true, scan: true }; } }
      ] });
  })();
