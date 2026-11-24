  /* 3.7 Training Program: a training bay, a manager shows a new person the exact procedure */
  (function () {
    var C1 = cam(16, 10, 0, 120, 92), C2 = cam(18, 10, 0, 120, 92), C3 = cam(28, 4, 0, 232, 90);
    make({ sid: '3.7', key: 'a37', title: 'Training program', std: 'Hiring & Orientation', blurb: 'Your department manager decides your training. Ask your manager if you need more.',
      X: 44, Y: 30, H: 26, backdrop: ['bands', '#14130f', '#1c1a14'],
      floor: { style: 'epoxy', a: '#26282a', b: '#2d3033' }, wall: { style: 'tile', tint: '#5f8cbf' },
      items: function (L, g, fx, S) {
        /* footprints: training board (wall) 22..40, machine 2..16 x 16..34 facing x, bench 24..40 x 6..14, manager at 22,18, trainee at 30,20 */
        L.prop('board', 22, 0, 6, { w: 20, h: 18, rows: 5, show: S.rows, done: S.done, lit: S.lit });
        L.prop('machine', 2, 14, 0, { face: 'x', door: S.door || 0, lamp: 'green', spin: S.t * 2, run: S.run ? 0.5 : 0, t: S.t, work: P.alT });
        L.prop('table', 26, 8, 0, { w: 14, d: 7, h: 9, plate: P.st2 });
        L.prop('caliper', 30, 10, 9, { open: 0.5 });
        if (!S.noM) L.person(22, 20, 0, ext(MGR, { arm: S.mArm || 'down' }));
        L.person(S.tr.x, S.tr.y, S.tr.dir, fx.who(S.tr, ext(ME, { arm: S.trArm || 'down', hat: P.amber })));
        if (S.q) L.person(38, 20, 2, ext(OPB, { arm: 'out' }));
        if (S.pop) L.add([S.pop[0], S.pop[1], 0, S.pop[0] + 1, S.pop[1] + 1, 1], function () { ring(g, S.pop[0], S.pop[1], 6, S.t * 0.9, S.pop[2] || '#6ad79f', 10); });
      },
      steps: [
        { title: 'Your manager trains you', sub: 'It is decided one person at a time', dur: 7, cam: C1, key: ['board'], cap: ['Your department manager leads it', 'Training fits each person'],
          S: function (t, fx) { return { t: t, rows: 5, lit: Math.floor(t * 0.6) % 5, tr: { x: 30, y: 20, dir: 2 }, mArm: t > 3 ? 'out' : 'down', trArm: t > 3.4 ? 'out' : 'down' }; } },
        { title: 'Learn our way', sub: 'Our own procedures and your position', dur: 8, cam: C2, key: ['machine'], cap: ['Even with experience, learn our procedures', 'Step by step at the machine'],
          S: function (t, fx) { var k = fx.E(t, 0.6, 5.6); return { t: t, rows: 5, done: Math.floor(k * 5), lit: Math.min(4, Math.floor(k * 5)), door: fx.E(t, 3, 3.8), run: t > 4, tr: { x: 30, y: 20, dir: 2 }, mArm: Math.floor(t * 1.5) % 2 ? 'out' : 'down', trArm: 'out' }; } },
        { title: 'Need more training?', sub: 'Say so', dur: 6.5, cam: C3, big: { n: 'CONSULT', label: 'your manager for more', pos: 'left' },
          S: function (t, fx) { return { t: t, rows: 5, done: 5, noM: true, tr: { x: 34, y: 18, dir: 2 }, trArm: 'up', mArm: 'out', pop: [34, 18, P.amber] }; } }
      ] });
  })();
