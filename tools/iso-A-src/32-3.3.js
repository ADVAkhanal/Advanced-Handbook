  /* 3.3 Employment of Relatives and Friends: a work cell, two people who know each other, a supervisor's desk */
  (function () {
    var C1 = cam(18, 4, 0, 120, 90), C2 = cam(36, 4, 0, 140, 90), C3 = cam(36, 5, 0, 188, 90);
    make({ sid: '3.3', key: 'a33', title: 'Relatives and friends', std: 'Hiring & Orientation', blurb: 'Tell ADVANCED when a relative or friend could create a conflict.',
      X: 46, Y: 30, H: 26, backdrop: ['bands', '#16181b', '#1e2126'],
      floor: { style: 'epoxy', a: '#2d2a2a', b: '#353131', zones: [[8, 12, 20, 14, '#3a2f2f', 1]] }, wall: { style: 'studs', tint: '#d9a0a0' },
      deco: function (s) { s.isoPanel('y', 0, 30, 10, 8, 8, { fill: '#5b7690', border: P.st3 }); },
      items: function (L, g, fx, S) {
        /* footprints: table 10..26 x 14..22; person A stands left of it (7,15), person B right of it (29,13); supervisor desk 34..46 x 4..12, supervisor behind it */
        L.prop('table', 10, 14, 0, { w: 16, d: 8, h: 9, plate: P.st2 });
        L.prop('caliper', 16, 16, 9, { open: 0.4 });
        L.prop('desk', 34, 4, 0, { w: 8, d: 12, face: 'x' });
        L.prop('monitor', 35, 8, 9, { rows: 2 });
        L.person(S.a.x, S.a.y, S.a.dir, fx.who(S.a, ext(ME, { arm: S.aArm || 'down' })));
        if (S.b) L.person(S.b.x, S.b.y, S.b.dir, fx.who(S.b, ext(OPC, { arm: S.bArm || 'down', hair: '#2b2018' })));
        L.person(S.s.x, S.s.y, S.s.dir, fx.who(S.s, ext(MGR, { arm: S.sArm || 'down' })));
        if (S.link) L.flow(S.link, S.t, { color: '#f0a0a0', len: 2, gap: 3, speed: 8, z: 0 });
        if (S.warn) L.add([27, 12, 0, 29, 14, 20], function () { ring(g, 18, 11, 6, S.t * 0.9, P.amber, 10); });
        L.prop('haPlant', 2, 24, 0, {});
      },
      steps: [
        { title: 'People who know each other', sub: 'Relatives and friends at work', dur: 7, cam: C1, key: ['table'], cap: ['A relative or a friend at work', 'They work in the same area'],
          S: function (t, fx) { return { t: t, a: { x: 29, y: 13, dir: 1 }, b: { x: 7, y: 15, dir: 0 }, s: { x: 40, y: 2, dir: 1 }, link: [[8, 12], [18, 11], [28, 12]], aArm: t > 1.6 ? 'out' : 'down', bArm: t > 1.6 ? 'out' : 'down' }; } },
        { title: 'It could be a conflict', sub: 'Supervision, safety, security, morale', dur: 8, cam: C2, key: ['desk'], cap: ['A conflict could come up', 'You tell ADVANCED about it'],
          S: function (t, fx) { var w = fx.walk([[29, 13], [30, 9], [32, 8]], t, 1.2, 3.4, { endDir: 0 }); return { t: t, warn: t < 3, a: t < 1.2 ? { x: 29, y: 13, dir: 1 } : w, b: null, s: { x: 40, y: 2, dir: 1 }, aArm: t > 3.6 ? 'out' : 'down', sArm: t > 4.8 ? 'out' : 'down' }; } },
        { title: 'Inform ADVANCED', sub: 'It is your obligation', dur: 6.5, cam: C3, big: { n: 'INFORM', label: 'about a possible conflict', pos: 'left' },
          S: function (t, fx) { return { t: t, a: { x: 32, y: 8, dir: 0 }, b: null, s: { x: 40, y: 2, dir: 1 }, aArm: 'out', sArm: 'out' }; } }
      ] });
  })();
