  /* 1.2 At-Will Employment: one door, either side can leave */
  (function () {
    var C1 = cam(18, 7, 0, 120, 88), C2 = cam(18, 7, 0, 150, 88), C3 = cam(24, 2, 0, 214, 94);
    make({ sid: '1.2', key: 'a12', title: 'At-will employment', std: 'Welcome & Company', blurb: 'Either side may end the work relationship at any time.',
      X: 46, Y: 28, H: 28, backdrop: ['diag', '#13171c', '#1a2027'],
      floor: { style: 'epoxy', a: '#24292e', b: '#2b3137', zones: [[17, 2, 10, 14, '#2f3a46', 1]] }, wall: { style: 'tile', tint: '#3d6fa5' },
      deco: function (s) { s.isoPanel('x', 0, 4, 10, 8, 8, { fill: '#5b7690', border: P.st3 }); s.isoPanel('x', 0, 18, 10, 8, 8, { fill: '#5b7690', border: P.st3 }); },
      items: function (L, g, fx, S) {
        /* footprints: door 17..27 x 0..2, bench 4..14 x 18..23, desk 38..46 x 4..16 (the manager stands in front of it at 38,14), employee left at 11,14 */
        L.prop('haDoor', 17, 0, 0, { w: 10, h: 22, open: S.open, col: ISO.M.wood.right });
        L.prop('desk', 34, 2, 0, { w: 8, d: 10, face: 'x' });
        L.prop('haBench', 4, 20, 0, { w: 10 });
        L.prop('haPlant', 42, 22, 0, {});
        L.person(S.mgr.x, S.mgr.y, S.mgr.dir, fx.who(S.mgr, ext(MGR, { arm: S.mgrArm || 'down' })));
        if (S.me) L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { hold: S.box ? ISO.M.card.left : undefined, holdSize: [5, 4] })));
        S.flows.forEach(function (f) { L.flow(f, S.t, { color: P.redT, len: 3, gap: 3, speed: 8, z: 0 }); });
        if (S.out) L.add([17, 0, 22, 27, 2, 23], function () { glowAt(g, 22, 3, 12, 14, '#f0e0a0', 0.5); });
      },
      steps: [
        { title: 'Both sides, one door', sub: 'You and ADVANCED', dur: 7, cam: C1, key: ['haDoor'], cap: ['You are on one side', 'ADVANCED is on the other'],
          S: function (t, fx) { return { t: t, open: 0, flows: [], me: { x: 11, y: 14, dir: 0 }, mgr: { x: 38, y: 14, dir: 1 } }; } },
        { title: 'Either side can leave', sub: 'Any time, with or without notice', dur: 8.5, cam: C2, key: ['haDoor'], cap: ['You may leave at any time', 'The company may end it at any time'],
          S: function (t, fx) {
            var a = t < 4.2, open = a ? fx.E(t, 1.8, 2.6) * (1 - fx.E(t, 3.6, 4.2)) : fx.E(t, 5.8, 6.6) * (1 - fx.E(t, 7.8, 8.4));
            var me = a ? (t < 3.2 ? fx.walk([[11, 14], [18, 12], [22, 4]], t, 0.6, 3.0, { endDir: 3 }) : null) : (t < 7.6 ? fx.walk([[11, 14], [18, 12], [22, 4]], t, 5.2, 7.4, { endDir: 3 }) : null);
            return { t: t, open: open, flows: [], me: me, box: !a, out: open > 0.5, mgr: { x: 38, y: 14, dir: 1 }, mgrArm: !a && t > 4.6 && t < 7.4 ? 'out' : 'down' }; } },
        { title: 'At-will', sub: 'That is how it works here', dur: 6.5, cam: C3, big: { n: 'AT WILL', label: 'either side, any time', pos: 'left' },
          S: function (t, fx) { return { t: t, open: 0.4, flows: [[[11, 14], [16, 9], [21, 4]], [[37, 13], [30, 9], [25, 4]]], me: { x: 11, y: 14, dir: 0 }, mgr: { x: 38, y: 14, dir: 1 } }; } }
      ] });
  })();
