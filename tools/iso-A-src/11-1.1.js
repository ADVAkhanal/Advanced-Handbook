  /* 1.1 A Welcome Policy: the front lobby, a handbook across the counter */
  (function () {
    var C1 = cam(14, 4, 0, 120, 90), C2 = cam(14, 4, 0, 160, 90), C3 = cam(20, 2, 0, 212, 96);
    make({ sid: '1.1', key: 'a11', title: 'A welcome policy', std: 'Welcome & Company', blurb: 'A new team member arrives, gets the handbook, reads it and signs.',
      X: 40, Y: 28, H: 26, backdrop: ['stripes', '#171a1d', '#1d2226'],
      floor: { style: 'checker', a: '#34383c', b: '#3b4046', tile: 6, zones: [[28, 14, 10, 10, '#a51f1f', 0.5]] }, wall: { style: 'panel', tint: '#3d6fa5' },
      deco: function (s) { s.isoPanel('x', 0, 8, 10, 12, 9, { fill: '#a9c6dd', border: P.st3 }); s.isoPanel('x', 0, 13, 10, 1, 9, P.st3); s.isoPanel('y', 0, 14, 12, 8, 6, { fill: P.cream, border: P.st3 }); s.isoPanel('y', 0, 16, 14, 4, 2, P.red); },
      items: function (L, g, fx, S) {
        /* footprints: counter 8..32 x 6..13 (HR behind it at 14,4), bench 2..7 x 8..16, plants at 35,5 and 2,22, new hire walks in to 24,17 */
        L.prop('counter', 8, 6, 0, { w: 24, d: 7, body: 'blue' });
        if (S.docsOnDesk) L.prop('docs', 12, 8, 11, { n: S.docsOnDesk, head: P.red, w: 6, d: 4 });
        L.prop('docs', 22, 8, 11, { n: 1, head: S.sign > 0.95 ? P.green : P.amber, w: 6, d: 4 });
        L.person(14, 4, 1, ext(HRP, { arm: S.hrArm }));
        L.prop('haPlant', 35, 5, 0, {}); L.prop('haPlant', 2, 22, 0, {});
        L.prop('haBench', 2, 8, 0, { w: 8, face: 'x' });
        L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { arm: S.meArm || 'down', hold: S.hold ? P.cream : undefined, holdSize: [5, 4] })));
        if (S.stamp) L.add([20, 6, 11, 31, 14, 12], function () { glowAt(g, 25, 10, 12, 10, '#6ad79f', 0.6 * fx.pulse(S.t, 1)); });
      },
      steps: [
        { title: 'A new face', sub: 'You have just joined us', dur: 7, cam: C1, key: ['counter'], cap: ['A new team member walks in', 'HR says welcome'],
          S: function (t, fx) { return { t: t, docsOnDesk: 3, hrArm: t > 3.2 && t < 5.4 ? 'up' : 'down', me: fx.walk([[36, 12], [31, 16], [24, 17]], t, 0.3, 3.0, { endDir: 3 }) }; } },
        { title: 'The handbook', sub: 'Read it carefully', dur: 7.5, cam: C2, key: ['counter'], cap: ['HR hands over the handbook', 'It sets out the basic rules'],
          S: function (t, fx) { var h = t > 2.6; return { t: t, docsOnDesk: h ? 0 : 3, hold: h, hrArm: t > 1.2 && t < 2.8 ? 'out' : 'down', me: { x: 24, y: 17, dir: 3 }, meArm: h ? 'out' : 'down' }; } },
        { title: 'Sign it, then ask', sub: 'Sign the acknowledgment', dur: 6.5, cam: C3, big: { n: 'HR', label: 'for any questions', pos: 'left' },
          S: function (t, fx) { return { t: t, docsOnDesk: 0, sign: fx.E(t, 0.6, 3.6), me: { x: 24, y: 17, dir: 3 }, meArm: 'write', stamp: t > 3.8 }; } }
      ] });
  })();
