  /* 2.1 About the Company: the values wall in the shop, one letter lights up one value */
  (function () {
    var VALS = ['Accountability', 'Dedication', 'Versatility', 'Advancement', 'Nurture', 'Craftsmanship', 'Excellence', 'Drive'];
    var COLS = [P.red, P.amber, P.green, P.blueT, '#d9a0c4', '#e0c060', P.redT, '#6ad79f'];
    var C1 = cam(22, 4, 14, 120, 80), C2 = cam(23, 0, 14, 150, 72), C3 = cam(28, 4, 12, 196, 80);
    function noteSeq() { return VALS.map(function (v, i) { return { a: 0.7 + i * 0.78, b: 1.45 + i * 0.78, x: 192, y: 60, text: v }; }); }
    make({ sid: '2.1', key: 'a21', title: 'About the company', std: 'Welcome & Company', blurb: 'The ADVANCED name is an acronym: each letter is one of our core values.',
      X: 44, Y: 28, H: 26, backdrop: ['stripes', '#12181a', '#182024'],
      floor: { style: 'checker', a: '#232a26', b: '#29312c', tile: 6 }, wall: { style: 'panel', tint: '#3fbf7f' },
      items: function (L, g, fx, S) {
        /* footprints: eight plaques on the back wall 4..44, table 22..40 x 5..13, machine 2..16 x 2..20, people at 24,15 / 34,15 / 14,24 / 24,23 */
        for (var i = 0; i < 8; i++) L.prop('haPlaque', 4 + i * 5, 0, 10, { w: 4, h: 10, lit: S.lit > i, col: COLS[i] });
        L.prop('table', 22, 5, 0, { w: 18, d: 8, h: 9, plate: P.st2 });
        L.prop('caliper', 27, 7, 9, { open: 0.5 });
        L.prop('machine', 2, 2, 0, { face: 'x', door: 0, lamp: 'green', spin: S.t * 2, run: 0.4, t: S.t });
        if (!S.noPpl) {
          L.person(24, 15, 1, ext(ME, { arm: S.arm }));
          L.person(14, 24, 0, ext(MGR, { arm: S.lit > 4 ? 'out' : 'down' }));
          L.person(24, 23, 2, ext(OPB, {}));
          L.person(34, 15, 1, ext(OPA, { arm: 'down' }));
        }
        if (S.lit > 0) L.add([4 + (S.lit - 1) * 5, 0, 20, 9 + (S.lit - 1) * 5, 1, 21], function () { glowAt(g, 6 + (S.lit - 1) * 5, 0, 14, 8, COLS[S.lit - 1], 0.4); });
      },
      steps: [
        { title: 'One name', sub: 'The name is the values', dur: 6.5, cam: C1, key: ['table'], cap: ['Our name is an acronym', 'Every letter is a value'],
          S: function (t, fx) { return { t: t, lit: 0, arm: 'down' }; } },
        { title: 'One letter, one value', sub: 'Each letter lights a value', dur: 8, cam: C2, key: [], notes: noteSeq(),
          S: function (t, fx) { return { t: t, lit: clampN(Math.floor((t - 0.7) / 0.78) + 1, 0, 8), arm: Math.floor(t * 2) % 2 ? 'out' : 'down' }; } },
        { title: 'Values we work by', sub: 'Built into every day', dur: 6.5, cam: C3, big: { n: 'VALUES', label: 'spelled by our name', pos: 'left' },
          S: function (t, fx) { return { t: t, lit: 8, arm: 'down', noPpl: true }; } }
      ] });
  })();
