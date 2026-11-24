  /* 4.3 Direct Deposit: the HR form, the bank, the pay stub */
  (function () {
    var C1 = cam(16, 3, 0, 120, 90), C2 = cam(24, 3, 0, 120, 90), C3 = cam(36, 1, 0, 190, 86);
    make({ sid: '4.3', key: 'a43', title: 'Direct deposit', std: 'Pay & Hours', blurb: 'Ask HR for the application form. Typically the bank starts direct deposit within 30 calendar days.',
      X: 52, Y: 28, H: 24, backdrop: ['bands', '#0f1612', '#16201a'],
      floor: { style: 'grid', a: '#202a24', b: '#26322b' }, wall: { style: 'tile', tint: '#3fbf7f' },
      items: function (L, g, fx, S) {
        /* footprints: HR desk 6..22 x 8..16 (HR behind at 14,5), bank counter 30..46 x 8..16 (teller behind at 38,5), employee walks to 14,20 */
        L.prop('desk', 6, 8, 0, { w: 16, d: 8 });
        if (S.form) L.prop('docs', S.formX, S.formY || 10, S.formX >= 22 ? 12 : 9, { n: 1, head: P.green, w: 6, d: 4 });
        L.prop('counter', 30, 8, 0, { w: 16, d: 8, body: 'blue' });
        L.prop('cabinet', 47, 5, 0, {});
        L.prop('haCal', 34, 0, 10, { w: 12, h: 12, mark: S.mark, cols: 4, rows: 3 });
        if (!S.noHr) L.person(14, 5, 1, ext(HRP, { arm: S.hrArm || 'down' }));
        L.person(38, 5, 1, ext(OPC, { arm: S.tellerArm || 'down', vest: true }));
        if (S.me) L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { arm: S.meArm || 'down' })));
        if (S.stub) L.prop('paystub', 33, 10, 11, { rows: S.stub, total: S.total });
        if (S.flow) L.flow([[16, 18], [24, 19], [36, 19], [38, 17]], S.t, { color: P.amber, len: 3, gap: 3, speed: 9, z: 0 });
        if (S.flow2) L.flow([[38, 18], [30, 20], [22, 20]], S.t, { color: P.green, len: 3, gap: 3, speed: 9, z: 0 });
      },
      steps: [
        { title: 'Ask HR for the form', sub: 'The direct deposit application', dur: 7, cam: C1, key: ['desk'], cap: ['Direct deposit is encouraged', 'Ask HR for an application form'],
          S: function (t, fx) { return { t: t, mark: 1, form: t > 3, formX: 12, hrArm: t > 2.6 && t < 4 ? 'out' : 'down', me: fx.walk([[4, 24], [10, 22], [14, 20]], t, 0.4, 2.4, { endDir: 3 }) }; } },
        { title: 'The bank starts paying', sub: 'Your payroll goes straight to your bank', dur: 8, cam: C2, key: ['counter'], cap: ['You submit the completed form', 'The bank sets it up for payroll'],
          S: function (t, fx) { var k = fx.E(t, 1, 3.4); return { t: t, mark: 2 + Math.floor(t * 1.5), form: t < 4, formX: Math.round(12 + 22 * k), noHr: true, flow: t > 1 && t < 5, tellerArm: t > 3.4 ? 'write' : 'down', me: { x: 14, y: 20, dir: 3 }, meArm: t < 1.2 ? 'out' : 'down' }; } },
        { title: 'Pay arrives, with a note', sub: 'A written explanation of deductions', dur: 6.5, cam: C3, big: { n: '30', label: 'calendar days, typically', pos: 'left' },
          S: function (t, fx) { return { t: t, mark: 12, noHr: true, stub: 4, total: fx.E(t, 0.4, 2.4), tellerArm: 'out' }; } }
      ] });
  })();
