  /* 4.4 Introduction to Wage and Hour Policies: four things feed your pay, ask your manager */
  (function () {
    var FACT = ['Surveys', 'Effort', 'Profits', 'Market forces'], TOP = ['Time off', 'Commissions', 'Overtime', 'Benefits'];
    var C1 = cam(18, 6, 0, 120, 92), C2 = cam(18, 6, 0, 120, 88), C3 = cam(32, 4, 0, 196, 88);
    var COL = ['blue', 'red', 'green', 'amber'];
    make({ sid: '4.4', key: 'a44', title: 'Wage and hour policies', std: 'Pay & Hours', blurb: 'Your pay depends on a range of factors. Questions about pay, overtime or deductions go to your manager.',
      X: 46, Y: 28, H: 24, backdrop: ['diag', '#151210', '#1d1915'],
      floor: { style: 'epoxy', a: '#2a2824', b: '#312e29', zones: [[10, 18, 14, 8, '#3a342a', 1]] }, wall: { style: 'studs', tint: '#e0a43a' },
      items: function (L, g, fx, S) {
        /* footprints: four bins at 4..10, 12..18, 20..26, 28..34 x 4..10, pay stub mat 12..23 x 17..25 (flat), employee at 36,18, manager walks along y 14 */
        for (var i = 0; i < 4; i++) { if (S.bins > i) L.prop('bin', 4 + i * 8, 4, 0, { col: COL[i], w: 6, d: 6, h: 6, fill: 2, item: 'cream' }); }
        L.prop('paystub', 12, 17, 0, { rows: S.rows, total: S.total });
        for (var k = 0; k < 4; k++) if (S.flows > k) L.flow([[7 + k * 8, 11], [7 + k * 8, 14], [16, 18]], S.t + k * 0.4, { color: ['#5f8cbf', P.redT, '#6ad79f', '#f0c264'][k], len: 2, gap: 3, speed: 8, z: 0 });
        if (S.emp) L.person(S.emp.x, S.emp.y, S.emp.dir, fx.who(S.emp, ext(ME, { arm: S.empArm || 'down' })));
        if (S.mgr) L.person(S.mgr.x, S.mgr.y, S.mgr.dir, fx.who(S.mgr, ext(MGR, { arm: S.mgrArm || 'down' })));
        L.prop('haPlant', 42, 24, 0, {});
      },
      steps: [
        { title: 'What sets your pay', sub: 'A wide range of factors', dur: 8, cam: C1, key: ['bin'], chips: FACT, chipAt: function (t) { return Math.min(3, Math.floor(t / 1.7)); }, cap: ['Many things feed into your pay', 'They all land on one stub'],
          S: function (t, fx) { return { t: t, bins: 1 + Math.floor(t / 1.7), flows: Math.floor(t / 1.7), rows: Math.min(4, Math.floor(t / 1.7) + 1), total: fx.E(t, 5.8, 7.4), emp: { x: 36, y: 18, dir: 2 }, empArm: 'down' }; } },
        { title: 'Ask your manager', sub: 'Pay, overtime, benefits, deductions', dur: 7.5, cam: C2, key: ['bin'], chips: TOP, chipAt: function (t) { return Math.min(3, Math.floor(t / 1.8)); }, cap: ['Not sure about your pay? Ask', 'Speak with your manager'],
          S: function (t, fx) { var w = fx.walk([[4, 14], [16, 14], [27, 14]], t, 0.6, 3.4, { endDir: 0 }); return { t: t, bins: 4, flows: 0, rows: 4, total: 1, emp: { x: 38, y: 15, dir: 2 }, mgr: w, empArm: t > 3.6 ? 'out' : 'down', mgrArm: t > 4.4 ? 'out' : 'down' }; } },
        { title: 'Speak up', sub: 'Questions are welcome', dur: 6.5, cam: C3, big: { n: 'SPEAK', label: 'with your manager', pos: 'left' },
          S: function (t, fx) { return { t: t, bins: 4, flows: 0, rows: 4, total: 1, emp: { x: 36, y: 18, dir: 2 }, empArm: 'out', mgr: { x: 44, y: 18, dir: 2 }, mgrArm: 'out' }; } }
      ] });
  })();
