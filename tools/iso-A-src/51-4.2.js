  /* 4.2 Business Expenses: a meeting over a table, the expense report, the gift limit */
  (function () {
    var C1 = cam(14, 8, 0, 120, 84), C2 = cam(30, 6, 0, 120, 88), C3 = cam(32, 2, 0, 196, 88);
    make({ sid: '4.2', key: 'a42b', title: 'Business expenses', std: 'Pay & Hours', blurb: 'ADVANCED pays reasonable business expenses. The most senior person present pays and reports; gifts over $25 are not reimbursed.',
      X: 50, Y: 30, H: 24, backdrop: ['diag', '#17130e', '#201a12'],
      floor: { style: 'checker', a: '#352a24', b: '#3c2f28', tile: 6 }, wall: { style: 'panel', tint: '#c98a55' },
      items: function (L, g, fx, S) {
        /* footprints: meeting table 12..32 x 8..18 (customer at 8,14 left, employee behind at 24,5, senior person at 36,16 right); report desk 30..44 x 2..12 */
        L.prop('table', 12, 8, 0, { w: 20, d: 10, h: 9, top: 'wood' });
        if (S.receipt) L.prop('paystub', 18, 11, 9, { rows: 3, total: 1 });
        L.prop('desk', 34, 2, 0, { w: 14, d: 10 });
        if (S.form) L.prop('ledger', 34, 3, 9, { lines: S.lines, write: S.write });
        if (S.gift) L.prop('haGift', 40, 5, 9, { col: 'red' });
        if (!S.noBg) { L.person(8, 14, 0, ext(CRM, { arm: S.cusArm || 'down' })); L.person(24, 5, 1, ext(ME, { arm: S.meArm || 'down' })); }
        if (S.sen) L.person(S.sen.x, S.sen.y, S.sen.dir, fx.who(S.sen, ext(MGR, { arm: S.senArm || 'down', card: S.card ? P.red : undefined })));
        if (S.pop) L.add([S.pop[0], S.pop[1], 0, S.pop[0] + 1, S.pop[1] + 1, 1], function () { ring(g, S.pop[0], S.pop[1], S.pop[2] || 4, S.t * 0.9, '#6ad79f', 10); });
      },
      steps: [
        { title: 'A business meeting', sub: 'With a customer, a vendor or colleagues', dur: 7, cam: C1, key: ['table'], cap: ['A valid business purpose', 'The most senior person pays and reports'],
          S: function (t, fx) { return { t: t, receipt: t > 3.6, sen: { x: 36, y: 15, dir: 1 }, senArm: t > 2 ? 'out' : 'down', card: t > 2 && t < 4.2, cusArm: Math.floor(t) % 2 ? 'out' : 'down', meArm: Math.floor(t * 1.2) % 2 ? 'out' : 'down', pop: t > 3.6 && t < 4.8 ? [22, 13, 6] : null }; } },
        { title: 'Report the expense', sub: 'Use the standard expense report form', dur: 8, cam: C2, key: ['desk'], cap: ['Say what it was and why', 'Add the date, the place and who came'],
          S: function (t, fx) { var w = fx.walk([[36, 15], [37, 15]], t, 0.4, 1.0, { endDir: 3 }); return { t: t, noBg: true, receipt: true, form: true, lines: Math.min(4, Math.floor(t / 1.2)), write: fx.E((t % 1.2) / 1.2, 0, 1), sen: { x: 37, y: 15, dir: 3 }, senArm: t > 1.2 ? 'write' : 'down' }; } },
        { title: 'Gift limit', sub: 'Gifts need approval first', dur: 6.5, cam: C3, big: { n: '$25', label: 'business gift limit', pos: 'left' },
          S: function (t, fx) { return { t: t, noBg: true, receipt: true, gift: true, sen: { x: 37, y: 15, dir: 3 }, senArm: 'out', pop: [39, 8, 8] }; } }
      ] });
  })();
