  /* 3.2 Employment Authorization Verification: the HR desk, a scanner and the calendar */
  (function () {
    var C1 = cam(24, 10, 0, 120, 98), C2 = cam(24, 10, 0, 150, 100), C3 = cam(26, 10, 0, 204, 100);
    make({ sid: '3.2', key: 'a32', title: 'Employment authorization', std: 'Hiring & Orientation', blurb: 'New hires complete Section 1 of Form I-9 on day one and show their documents by the third business day.',
      X: 44, Y: 28, H: 26, backdrop: ['diag', '#12171b', '#192027'],
      floor: { style: 'grid', a: '#222a30', b: '#283139' }, wall: { style: 'tile', tint: '#6ad79f' },
      deco: function (s) { s.isoPanel('x', 0, 14, 8, 8, 8, { fill: '#5b7690', border: P.st3 }); },
      items: function (L, g, fx, S) {
        /* footprints: desk 12..38 x 8..18; HR stands behind at y 5; the new hire in front at y 20 */
        L.prop('desk', 12, 8, 0, { w: 26, d: 10 });
        L.prop('docs', 14, 11, 9, { n: S.docs, head: P.amber, w: 7, d: 5 });
        L.prop('monitor', 23, 9, 9, { rows: 3 });
        L.prop('scanner', 33, 11, 9, { lit: S.scan });
        L.prop('haCal', 30, 0, 8, { w: 14, h: 12, mark: S.day, cols: 5, rows: 2 });
        L.person(22, 5, 1, ext(HRP, { arm: S.hrArm || 'down' }));
        L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { arm: S.meArm || 'down', hold: S.hold ? P.paper : undefined, holdSize: [5, 4] })));
        L.prop('haChair', 3, 16, 0, { col: 'dark' }); L.prop('haPlant', 40, 22, 0, {});
        if (S.scan) L.add([33, 11, 9, 37, 14, 16], function () { ring(g, 35, 12, 16, S.t * 0.9, '#6ad79f', 10); });
      },
      steps: [
        { title: 'Day one paperwork', sub: 'Section 1 of federal Form I-9', dur: 7, cam: C1, key: ['desk'], cap: ['Complete Section 1 on day one', 'The first day of paid employment'],
          S: function (t, fx) { return { t: t, day: 1, docs: 1, me: fx.walk([[8, 28], [16, 24], [24, 20]], t, 0.3, 2.6, { endDir: 3 }), meArm: t > 3 ? 'write' : 'down', hrArm: t > 4.6 ? 'out' : 'down' }; } },
        { title: 'Show your documents', sub: 'They prove identity and work authorization', dur: 8, cam: C2, key: ['scanner'], cap: ['Bring acceptable documents', 'No later than the third business day'],
          S: function (t, fx) { var d = 1 + (t > 1.6 ? 1 : 0) + (t > 3.2 ? 1 : 0); return { t: t, day: d, docs: 3, me: { x: 24, y: 20, dir: 3 }, hold: t < 4.4 && t > 3.4, meArm: t > 3.4 && t < 4.6 ? 'out' : 'down', hrArm: t > 4.4 && t < 6 ? 'out' : 'down', scan: t > 4.8 }; } },
        { title: 'Third business day', sub: 'No later than that', dur: 6.5, cam: C3, big: { n: 'THIRD', label: 'business day deadline', pos: 'left' },
          S: function (t, fx) { return { t: t, day: 3, docs: 3, me: { x: 24, y: 20, dir: 3 }, scan: true, hrArm: 'down' }; } }
      ] });
  })();
