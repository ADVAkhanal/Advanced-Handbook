  /* 2.3 Revisions to Handbook: the hallway bulletin board */
  (function () {
    var C1 = cam(21, 7, 0, 120, 88), C2 = cam(28, 3, 0, 150, 88), C3 = cam(28, 3, 0, 198, 88);
    make({ sid: '2.3', key: 'a23', title: 'Revisions to the handbook', std: 'Welcome & Company', blurb: 'The handbook can change; changes come as a written supplement or a posting on the bulletin board.',
      X: 44, Y: 24, H: 28, backdrop: ['diag', '#161514', '#1e1c1a'],
      floor: { style: 'grid', a: '#2a2824', b: '#302d28' }, wall: { style: 'studs', tint: '#5f8cbf' },
      deco: function (s) { s.isoPanel('x', 0, 8, 10, 8, 10, { fill: '#a9c6dd', border: P.st3 }); },
      items: function (L, g, fx, S) {
        /* footprints: board on the back wall 22..36, shelf 2..8 x 6..16 (left wall), supplement table 38..44 x 8..13, HR walks along x 30..34, employee at 18,10 */
        L.prop('board', 22, 0, 2, { w: 14, h: 14, rows: 6, show: S.rows, lit: S.lit, chips: [P.red, P.amber, P.amber, P.st2, P.st2, P.st2] });
        L.prop('shelf', 2, 6, 0, { w: 10, d: 6, h: 22, seed: 3, face: 'x' });
        L.prop('table', 38, 8, 0, { w: 6, d: 5, h: 9 });
        if (S.supp) L.prop('docs', 39, 9, 9, { n: 2, head: P.red, w: 4, d: 3 });
        L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { arm: S.meArm || 'down', hold: S.hold ? P.cream : undefined, holdSize: [4, 5] })));
        if (S.hr) L.person(S.hr.x, S.hr.y, S.hr.dir, fx.who(S.hr, ext(HRP, { arm: S.hrArm || 'down', hold: S.hrHold ? P.paper : undefined, holdSize: [4, 5] })));
        L.prop('haPlant', 40, 18, 0, {});
        if (S.flash) L.add([22, 0, 2, 36, 1, 16], function () { glowAt(g, 29, 0, 9, 16, '#f0e0a0', 0.35); });
      },
      steps: [
        { title: 'Kept informed', sub: 'The handbook explains your job terms', dur: 6.5, cam: C1, key: ['board'], cap: ['The handbook keeps you informed', 'It is not a contract'],
          S: function (t, fx) { return { t: t, rows: 5, lit: -1, me: fx.walk([[10, 20], [14, 14], [20, 10]], t, 0.3, 2.4, { endDir: 3 }), meArm: t > 3 ? 'out' : 'down', hold: t > 3 }; } },
        { title: 'Changes get posted', sub: 'ADVANCED may revise, add or delete', dur: 8, cam: C2, key: ['board'], cap: ['A new page goes on the board', 'Or it comes as a written supplement'],
          S: function (t, fx) {
            var hr = fx.walk([[36, 14], [32, 9], [31, 6]], t, 0.2, 1.8, { endDir: 3 });
            return { t: t, rows: t > 3.2 ? 6 : 5, lit: t > 3.2 ? 5 : -1, flash: t > 3.2 && t < 5.2, hr: hr, hrHold: t < 2.6, hrArm: t > 2.4 && t < 3.6 ? 'up' : 'down',
              me: { x: 20, y: 10, dir: 3 }, hold: false, supp: t > 5 }; } },
        { title: 'Check the board', sub: 'Changes reach you in a timely fashion', dur: 6.5, cam: C3, big: { n: 'WRITTEN', label: 'supplement or posting', pos: 'left' },
          S: function (t, fx) { return { t: t, rows: 6, lit: 5, supp: true, hr: { x: 31, y: 6, dir: 1 }, me: { x: 20, y: 10, dir: 3 }, meArm: 'out' }; } }
      ] });
  })();
