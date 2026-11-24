  /* 1.0 A Letter from Our Owners: a small shop grows into a team */
  (function () {
    var C1 = cam(14, 12, 6, 120, 90), C2 = cam(46, 14, 6, 120, 98), C3 = cam(46, 14, 6, 204, 98);
    function mach(L, x, y, S, k) { if (S.m > k) L.prop('machine', x, y, 0, { door: 0, lamp: 'green', spin: S.t * 2, run: 0.5, t: S.t, work: P.alT }); }
    make({ sid: '1.0', key: 'a10', title: 'A letter from our owners', std: 'Welcome & Company', blurb: 'The owners write to the team: a small shop that grew because of its people.',
      X: 62, Y: 36, H: 28, backdrop: ['bands', '#14171a', '#1b2025'],
      floor: { style: 'grid', a: '#2a2d31', b: '#2f3338' }, wall: { style: 'studs', tint: '#c9952b' },
      deco: function (s) { s.isoPanel('y', 0, 5, 12, 10, 9, { fill: '#5b7690', border: P.st3 }); s.isoPanel('y', 0, 10, 12, 1, 9, P.st3); s.isoPanel('x', 0, 22, 12, 10, 9, { fill: '#a9c6dd', border: P.st3 }); s.isoPanel('x', 0, 27, 12, 1, 9, P.st3); },
      items: function (L, g, fx, S) {
        L.prop('desk', 2, 10, 0, { w: 22, d: 10 });
        L.prop('docs', 9, 13, 9, { n: S.letterN, head: P.red, w: 8, d: 5 });
        if (S.owners) { L.person(9, 6, 1, ext(CRM, { arm: S.write ? 'write' : 'down' })); L.person(18, 6, 1, ext(MGR, { shirt: '#9a6a3a', hair: '#2a2018' })); }
        mach(L, 26, 1, S, 0); mach(L, 44, 1, S, 1);
        L.prop('haPlant', 2, 30, 0, {});
        if (S.op1) L.person(S.op1.x, S.op1.y, S.op1.dir, fx.who(S.op1, ext(S.lead ? ext(OPA, { vest: true, hat: P.amber }) : OPB, { arm: S.op1.moving ? 'down' : 'out' })));
        if (S.m > 1) { L.person(46, 17, 3, ext(OPA, { who: 'forrest', h: 26, arm: 'out' })); L.person(54, 17, 3, ext(OPC, { arm: 'out' })); }
                if (S.pops) S.pops.forEach(function (q) { L.add([q[0], q[1], 0, q[0] + 1, q[1] + 1, 1], function () { ring(g, q[3], q[4], 14, q[2], P.redT, 14); }); });
      },
      steps: [
        { title: 'Where we started', sub: 'A small machine shop, 1979', dur: 7, cam: C1, key: ['desk'], cap: ['The owners write to the team', 'One machine, a few people'],
          S: function (t, fx) { return { t: t, m: 1, owners: true, letterN: 1 + (t > 3.4 ? 1 : 0) + (t > 5.4 ? 1 : 0), write: t < 5.6, op1: fx.walk([[6, 36], [18, 28], [32, 19]], t, 0.3, 3.0, { endDir: 3 }) }; } },
        { title: 'The people grow', sub: 'Operators become leaders', dur: 7.5, cam: C2, key: ['machine'], cap: ['More people join the shop', 'Fathers and sons side by side'],
          S: function (t, fx) { return { t: t, m: 1 + (t > 0.8 ? 1 : 0), letterN: 3, write: false, op1: { x: 32, y: 19, dir: 3 }, lead: t > 4.4,
            pops: [[0, 0, t - 0.8, 53, 6], [0, 0, t - 4.4, 32, 16]].filter(function (q) { return q[2] > 0 && q[2] < 1.2; }) }; } },
        { title: 'The people are the story', sub: 'We love seeing our people grow', dur: 6.5, cam: C3, big: { n: '1979', label: 'the early days', pos: 'left' },
          S: function (t, fx) { return { t: t, m: 2, letterN: 3, write: false, op1: { x: 32, y: 19, dir: 3 }, lead: true }; } }
      ] });
  })();
