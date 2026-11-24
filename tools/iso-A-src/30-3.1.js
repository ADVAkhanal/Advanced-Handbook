  /* 3.1 Conflicts of Interest: a supplier at the dock, your manager in the office */
  (function () {
    var C1 = cam(12, 0, 0, 120, 84), C2 = cam(24, 0, 0, 130, 84), C3 = cam(42, 4, 0, 196, 94);
    make({ sid: '3.1', key: 'a31', title: 'Conflicts of interest', std: 'Hiring & Orientation', blurb: 'A possible conflict with a supplier or competitor must be disclosed to your manager.',
      X: 56, Y: 26, H: 26, backdrop: ['stripes', '#14161a', '#1b1e23'],
      floor: { style: 'checker', a: '#2f3236', b: '#35393d', tile: 8, zones: [[0, 14, 24, 10, '#3a3f45', 1]] }, wall: { style: 'panel', tint: '#c9952b' },
      items: function (L, g, fx, S) {
        /* footprints: dock door 2..18 x 0..2, pallet 4..16 x 3..13 with a crate, supplier at 8,14, you at 20,14 then walking right, manager desk 40..52 x 1..7, manager at 44,10, chair 46..51 x 13..18 */
        L.prop('rolldoor', 2, 0, 0, { w: 16, h: 22, open: 0.8 });
        L.prop('pallet', 4, 3, 0, {}); L.prop('crate', 5, 4, 3, { tag: P.red, w: 8, d: 6, h: 6 });
        L.prop('desk', 40, 1, 0, { w: 12, d: 6 });
        L.prop('monitor', 45, 2, 9, { rows: 3 });
        L.prop('haChair', 47, 14, 0, { col: 'dark' });
        L.person(38, 8, 1, ext(MGR, { arm: S.mgrArm || 'down' }));
        if (!S.noSup) L.person(8, 15, 0, ext(OPC, { vest: true, arm: S.supArm || 'down' }));
        L.person(S.me.x, S.me.y, S.me.dir, fx.who(S.me, ext(ME, { arm: S.meArm || 'down' })));
        if (S.link) L.flow(S.link, S.t, { color: P.amber, len: 3, gap: 3, speed: 9, z: 0 });
        L.prop('haPlant', 52, 20, 0, {});
        if (S.warn) L.add([10, 12, 0, 12, 14, 20], function () { ring(g, 14, 15, 6, S.t * 0.9, P.amber, 12); });
        if (S.ok) L.add([38, 8, 0, 40, 10, 20], function () { ring(g, S.ok[0], S.ok[1], 8, S.t * 0.8, '#6ad79f', 12); });
      },
      steps: [
        { title: 'A possible conflict', sub: 'You and a supplier or competitor', dur: 7, cam: C1, key: ['pallet'], cap: ['You have a tie to a supplier', 'It could affect the job'],
          S: function (t, fx) { return { t: t, me: { x: 20, y: 15, dir: 2 }, link: [[11, 16], [19, 16]], warn: true, meArm: t > 1.5 ? 'out' : 'down', supArm: t > 1.5 ? 'out' : 'down' }; } },
        { title: 'Tell your manager', sub: 'You must disclose it', dur: 8, cam: C2, key: ['desk'], cap: ['Walk to your manager', 'Disclose the conflict'],
          S: function (t, fx) { var w = fx.walk([[20, 15], [26, 19], [33, 17]], t, 0.6, 3.6, { endDir: 0 }); return { t: t, me: w, meArm: t > 3.8 ? 'out' : 'down', mgrArm: t > 4.8 ? 'out' : 'down', ok: t > 5.4 ? [40, 12] : null }; } },
        { title: 'Your manager decides', sub: 'ADVANCED takes the steps it needs', dur: 6.5, cam: C3, big: { n: 'MANAGER', label: 'is who you tell', pos: 'bottom-left' },
          S: function (t, fx) { return { t: t, noSup: true, me: { x: 33, y: 17, dir: 0 }, meArm: 'out', mgrArm: 'out', ok: [40, 12] }; } }
      ] });
  })();
