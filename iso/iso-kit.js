/* global module */
/* ============================================================================================================
   iso-kit.js  -  Advanced PMC isometric cutaway kit (pixel style, 2:1 isometric, canvas 2D)   VERSION 1.1
   v1.1: g.setCam accepts dx, dy (a pixel shift); g.watch / g.watchMark / g.screenBox for the framework keep-out planner; lint-only edits merged from the Tool Crib copy.

   Dependency free, ES5 style (var / function), no emoji, no gradients, no shadows, no blur, no alpha
   blending. Every pixel is an integer rectangle filled with a flat colour. "See through" is done with
   ordered dither (Bayer 4 x 4), never with alpha. Works in a browser and in Node (with a mock or a real
   canvas), so the same draw code can be checked by machine and looked at by eye.

   USAGE
     var ctx = canvas.getContext('2d');                 // canvas.width = 240, canvas.height = 180
     var g = ISO.make(ctx, { W: 240, H: 180 });         // one kit per canvas
     g.setCam({ x: 26, y: 14, zoom: 1 });               // world point (x, y on the floor) shown at the picture centre
     g.fill(ISO.P.bg);                                  // clear
     g.layer('floor', [-6,-6,-8, 60,30,30], function (s) { s.isoFloor(54, 28, {}); s.isoWallCut(54, 28, 26, {}); });
     var L = g.list();                                  // depth-sorted draw list (painter's algorithm)
     L.box(10, 6, 0, 8, 6, 9, 'card');                  // anything queued here is sorted, then drawn by L.flush()
     L.person(20, 12, 0, { shirt: ISO.P.red });
     L.flush();

   COORDINATES
     World x runs to the lower right of the picture, world y to the lower left, world z is straight up and is
     measured in SCREEN PIXELS at zoom 1 (not in tiles). One floor "tile" is 6 x 6 world units. A cube that looks
     cubic is about 6 x 6 wide and 14 high. All shape positions and sizes are WHOLE numbers (they are rounded),
     so every edge keeps the clean 2:1 stair step. Projection:
         screenX = ox + (x - y) * 2 * Z        screenY = oy + (x + y - z) * Z        (Z = zoom, 1 or 2)
     The camera only ever changes ox / oy (whole pixels) and Z (1 or 2): zoom is integer pixel scaling.

   FACES (light comes from the upper left)
     "top" is the lightest, "left" is the face that looks to world +y (lower left of the picture), "right" is the
     face that looks to world +x (lower right). A material is { top, left, right } of three flat hex colours.
     ISO.M has ready materials: steel, dark, silver, red, cream, card, wood, blue, green, amber, black.

   --------------------------------------------------------------------------------------------------------
   API (g = ISO.make(ctx, opts);  opts = { W, H, makeCanvas, cy })
   --------------------------------------------------------------------------------------------------------
   Raster      g.r(x,y,w,h,c)  g.p(x,y,c)  g.poly(pts,c,dens)  g.line(x0,y0,x1,y1,c)  g.ell(cx,cy,rx,ry,c,dens)
               g.disc(cx,cy,R,c)  g.fill(c)  g.veil(dens,c)  (dens 0..1 = ordered dither, never alpha)
   Camera      g.setCam({x,y,zoom,z,dx,dy})  g.proj(x,y,z) -> [sx,sy]  g.Z  g.ox  g.oy
   Shapes      g.isoBox(x,y,z,w,d,h,col,opts)     opts: glass, dens, rim:false, shadow
               g.isoCyl(x,y,z,rad,h,col,opts)     vertical cylinder / disc stack, centre (x,y); opts: bands, shadow
               g.isoTile(x,y,w,d,col,z)           flat rectangle on the floor (or at height z)
               g.isoEll(x,y,z,rad,col,dens)       flat disc on the floor;  g.isoRing(x,y,z,rad,col)  ring outline
               g.isoPanel(plane,pos,u,z,w,h,col,opts)   rectangle on a wall plane: plane 'y' (y = pos, spans x)
                                                  or 'x' (x = pos, spans y); col may be {fill,border}
               g.isoFloor(X,Y,opts)               the floor slab and tiles (style: checker, grid, epoxy)
               g.isoWallCut(X,Y,H,opts)           the two back walls with a cut top edge (cutaway corner)
               g.isoGlassBack / g.isoGlass...     see "Glass" below
   Things      g.isoPerson(x,y,dir,opts)          worker sprite: dir 0 +x, 1 +y, 2 -x, 3 -y;  opts.step 0/1 walks
               g.isoProp(kind,x,y,z,opts)         crate, pallet, desk, table, counter, cabinet, shelf, bin, cart, machine,
                                                  timeclock, monitor, printer, scanner, docs, paystub, board, rolldoor,
                                                  wallclock, lamp, stool, caliper, badge, ledger, shadowboard, outboard
               ISO.defineProp(name, dim, drawFn)  add your own prop (see README)
               g.propBox(kind,x,y,z,opts)         world bounding box [x0,y0,z0,x1,y1,z1]
   Motion      g.isoArrowFlow(path,t,opts)        moving dashes along a world path (never arrow glyphs)
               g.ring(sx,sy,r,t,c)                expanding pulse rings (screen space)
               g.glow(sx,sy,r,c,k)                dithered glow (screen space)
               g.sparks(sx,sy,t,n,spread,c)       deterministic particles (chips, sparks)
               g.isoBeam(x0,y0,z0,x1,y1,z1,c,t)   dashed line in the world (scanner beam, wire)
   Depth       var L = g.list();  L.box L.cyl L.person L.prop L.glass L.flat L.add(bbox, fn) ;  L.flush()
               The list sorts by separating axes (topological painter's algorithm), so nothing passes
               through anything when the bounding boxes are honest.
   Backdrop    g.backdrop(kind, base, line)           'bands' | 'stripes' | 'diag' pattern behind the diorama
   Cache       g.sprite(key, bbox, fn, wx, wy, wz)   draw fn once into an offscreen canvas, then blit
               g.layer(key, bbox, fn)                same, origin at the world origin: the static floor and walls
   Glass       L.glass(x,y,z,w,d,h,col,{dens,rear})  see-through casing: inner back faces behind, dithered front
                                                     faces in front of whatever is inside, drawn in the right order
   ============================================================================================================ */
(function (root) {
  'use strict';

  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

  /* ---- palette (company: dark steel, red #E03131 accents, cream signs, silver metals) ---- */
  var P = {
    ink: '#222629', bg: '#15171a', bg2: '#1a1d20',
    floorA: '#2b3035', floorB: '#30363c', floorLine: '#23272b', shadow: '#1d2124', slab: '#3b4147',
    wallL: '#2b3036', wallR: '#383e44', wallTop: '#aab1b7', wallLine: '#31373c', wallLine2: '#444b52', base: '#a51f1f',
    red: '#e03131', red2: '#a51f1f', redT: '#f0605f',
    cream: '#f1ece2', cream2: '#d8d1c2', creamInk: '#16191c',
    st0: '#30353a', st1: '#4c5359', st2: '#7d858c', st3: '#aab1b7', st4: '#dde1e4',
    al: '#c2c8cd', alT: '#e4e7ea', alS: '#8f979e',
    dark: '#121417', green: '#3fbf7f', greenD: '#2b8a5a', amber: '#e0a43a', amberD: '#a8781f',
    blue: '#3d6fa5', blueT: '#5f8cbf', blueS: '#2b4f78', blueL: '#8fb4d9',
    skin: '#c99a7a', skin2: '#a8765a', skin3: '#e0b48f', hair: '#3a2c22', paper: '#eef0f2', line: '#9aa0a4', glassC: '#8fb4d9'
  };
  var M = {
    steel: { top: '#8d959c', left: '#5e666d', right: '#434a50' },
    dark: { top: '#4a5157', left: '#31363b', right: '#24282c' },
    black: { top: '#262b30', left: '#1a1d20', right: '#101214' },
    counter: { top: '#7d858c', left: '#4f575d', right: '#383e43' },
    metal: { top: '#aab1b7', left: '#7d858c', right: '#5c646b' },
    silver: { top: '#e4e7ea', left: '#c2c8cd', right: '#8f979e' },
    red: { top: '#f0605f', left: '#e03131', right: '#a51f1f' },
    cream: { top: '#f6f1e6', left: '#e4dccb', right: '#b9b09b' },
    card: { top: '#cfa371', left: '#a07a52', right: '#7d5c3d' },
    wood: { top: '#a3825f', left: '#86684a', right: '#63492f' },
    blue: { top: '#5f8cbf', left: '#3d6fa5', right: '#2b4f78' },
    green: { top: '#6ad79f', left: '#3fbf7f', right: '#2b8a5a' },
    amber: { top: '#f0c264', left: '#e0a43a', right: '#a8781f' },
    paper: { top: '#f4f6f7', left: '#dfe3e6', right: '#b3b9be' }
  };

  var hexCache = {}, mixCache = {};
  function hex(c) {
    var h = hexCache[c];
    if (h) return h;
    h = hexCache[c] = [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
    return h;
  }
  function to2(n) { n = Math.max(0, Math.min(255, Math.round(n))); return (n < 16 ? '0' : '') + n.toString(16); }
  /* mix(a, b, k): flat colour k of the way from a to b (both '#rrggbb'). Used for shades, never for transparency. */
  function mix(a, b, k) {
    var key = a + b + k, v = mixCache[key];
    if (v) return v;
    var A = hex(a), B = hex(b);
    v = mixCache[key] = '#' + to2(A[0] + (B[0] - A[0]) * k) + to2(A[1] + (B[1] - A[1]) * k) + to2(A[2] + (B[2] - A[2]) * k);
    return v;
  }
  function C(col) { return typeof col === 'string' ? (M[col] || { top: col, left: col, right: col }) : col; }
  function rnd(i) { var s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

  /* frontOf(a, b): +1 when box a is in front of box b (draw a later), -1 when behind, 0 when they intersect or when two axes disagree (no order is needed then).
     Boxes are [x0,y0,z0,x1,y1,z1]. The viewer looks from +x, +y and above. */
  function frontOf(a, b) {
    var r = 0, v;
    v = a[0] >= b[3] ? 1 : b[0] >= a[3] ? -1 : 0; if (v) { if (r && r !== v) return 0; r = v; }
    v = a[1] >= b[4] ? 1 : b[1] >= a[4] ? -1 : 0; if (v) { if (r && r !== v) return 0; r = v; }
    v = a[2] >= b[5] ? 1 : b[2] >= a[5] ? -1 : 0; if (v) { if (r && r !== v) return 0; r = v; }
    return r;
  }
  function boxesIntersect(a, b) {
    return a[0] < b[3] && b[0] < a[3] && a[1] < b[4] && b[1] < a[4] && a[2] < b[5] && b[2] < a[5];
  }

  function defaultMk(w, h) {
    if (typeof document === 'undefined') return null;
    var c = document.createElement('canvas'); c.width = w; c.height = h; return c;
  }

  var PROPS = {};
  /* ISO.defineProp(name, dim, draw): dim = [w, d, h] (front width along u, depth along v, height) or
     function(opts) returning it; draw = function (s, o) where s has B(), F(), C(), x, y, z, face, w, d, h. */
  function defineProp(name, dim, draw) { PROPS[name] = { dim: dim, draw: draw }; }

  function make(ctx, o) {
    o = o || {};
    var W = o.W || 240, H = o.H || 180;
    var mk = o.makeCanvas === undefined ? defaultMk : o.makeCanvas;
    var cyDefault = o.cy || 98;
    var g = { W: W, H: H, ctx: ctx, Z: 1, ox: Math.round(W / 2), oy: cyDefault, lastBox: null, P: P, M: M, mix: mix, rnd: rnd, canCache: !!mk };
    var sprites = o.sprites || {};
    try { ctx.imageSmoothingEnabled = false; } catch { /* mock */ }

    /* ---------------- raster ---------------- */
    function r(x, y, w, h, c) {
      x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
      if (w <= 0 || h <= 0) return;
      ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
    }
    g.r = r;
    g.p = function (x, y, c) { r(x, y, 1, 1, c); };
    g.fill = function (c) { r(0, 0, W, H, c); };
    /* local scaled rectangle: used by sprites that are built from pixels (people, small props) */
    function q(ax, ay, dx, dy, w, h, c) { var Z = g.Z; r(ax + dx * Z, ay + dy * Z, w * Z, h * Z, c); }
    g.q = q;

    g.proj = function (x, y, z) {
      return [Math.round(g.ox + (x - y) * 2 * g.Z), Math.round(g.oy + (x + y - (z || 0)) * g.Z)];
    };
    /* screen rectangle [x0,y0,x1,y1] of a world box [x0,y0,z0,x1,y1,z1] under the current camera (used by the framework's keep-out
       planner: set g.watch = [] (and g.watchMark = function returning a running count of painted rectangles) and every isoPerson / isoProp
       call appends { kind, name, box, m0, m1 }: the rectangles painted by that call are numbers m0 up to m1) */
    function worldScreenBox(b) {
      var xs = [], ys = [], i, j, k, p;
      for (i = 0; i < 2; i++) for (j = 0; j < 2; j++) for (k = 0; k < 2; k++) { p = g.proj(i ? b[3] : b[0], j ? b[4] : b[1], k ? b[5] : b[2]); xs.push(p[0]); ys.push(p[1]); }
      return [Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys)];
    }
    g.screenBox = worldScreenBox;
    g.setCam = function (c) {
      var Z = c.zoom === 2 ? 2 : 1;
      g.Z = Z;
      g.ox = Math.round(W / 2 - (c.x - c.y) * 2 * Z) + Math.round(c.dx || 0);                    /* dx, dy: a whole pixel shift of the picture (the framework's keep-out nudge) */
      g.oy = Math.round(cyDefault - (c.x + c.y) * Z + (c.z || 0) * Z) + Math.round(c.dy || 0);
      return g;
    };

    /* convex polygon fill with integer vertices; dens (0..1) makes it an ordered dither instead of solid */
    function poly(pts, c, dens) {
      var n = pts.length, i, ymin = 1e9, ymax = -1e9;
      for (i = 0; i < n; i++) { if (pts[i][1] < ymin) ymin = pts[i][1]; if (pts[i][1] > ymax) ymax = pts[i][1]; }
      if (ymax <= ymin) return;
      ctx.fillStyle = c;
      var solid = dens === undefined || dens >= 1, py = 0, px0 = 0, px1 = 0, ps = 0, lim = (dens || 0) * 16;
      for (var y = ymin; y < ymax; y++) {
        var yc = y + 0.5, xl = 1e9, xr = -1e9;
        for (i = 0; i < n; i++) {
          var a = pts[i], b = pts[(i + 1) % n], y0 = a[1], y1 = b[1];
          if (y0 === y1) continue;
          if ((yc >= y0 && yc < y1) || (yc >= y1 && yc < y0)) {
            var x = a[0] + (b[0] - a[0]) * (yc - y0) / (y1 - y0);
            if (x < xl) xl = x;
            if (x > xr) xr = x;
          }
        }
        if (xr < xl) continue;
        var xa = Math.round(xl), xb = Math.round(xr);
        if (xb <= xa) continue;
        if (solid) {
          if (ps && xa === px0 && xb === px1 && y === py + ps) ps++;
          else { if (ps) ctx.fillRect(px0, py, px1 - px0, ps); px0 = xa; px1 = xb; py = y; ps = 1; }
        } else {
          var run = -1;
          for (var xx = xa; xx < xb; xx++) {
            var on = BAYER[((y & 3) << 2) | (xx & 3)] < lim;
            if (on && run < 0) run = xx;
            if (!on && run >= 0) { ctx.fillRect(run, y, xx - run, 1); run = -1; }
          }
          if (run >= 0) ctx.fillRect(run, y, xb - run, 1);
        }
      }
      if (ps) ctx.fillRect(px0, py, px1 - px0, ps);
    }
    g.poly = poly;

    /* straight pixel line, thickness = zoom */
    function line(x0, y0, x1, y1, c, every, phase) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx - dy, i = 0, Z = g.Z;
      every = every || 1; phase = phase || 0;
      for (;;) {
        if ((i + phase) % every === 0) r(x0, y0, Z, Z, c);
        if (x0 === x1 && y0 === y1) break;
        var e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
        i++;
      }
    }
    g.line = line;

    function ell(cx, cy, rx, ry, c, dens) {
      cx = Math.round(cx); cy = Math.round(cy); rx = Math.round(rx); ry = Math.round(ry);
      var lim = (dens === undefined ? 1 : dens) * 16;
      for (var dy = -ry; dy <= ry; dy++) {
        var k = ry ? dy / ry : 0, hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - k * k)));
        if (dens === undefined || dens >= 1) r(cx - hw, cy + dy, hw * 2 + 1, 1, c);
        else for (var x = cx - hw; x <= cx + hw; x++) if (BAYER[(((cy + dy) & 3) << 2) | (x & 3)] < lim) r(x, cy + dy, 1, 1, c);
      }
    }
    g.ell = ell;
    g.disc = function (cx, cy, R, c) { ell(cx, cy, R, R, c); };

    /* ---------------- offscreen cache ---------------- */
    function bbScreen(bb, Z) {
      var xs = [bb[0], bb[3]], ys = [bb[1], bb[4]], zs = [bb[2], bb[5]], minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
      for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) for (var k = 0; k < 2; k++) {
        var sx = (xs[i] - ys[j]) * 2 * Z, sy = (xs[i] + ys[j] - zs[k]) * Z;
        if (sx < minx) minx = sx; if (sx > maxx) maxx = sx; if (sy < miny) miny = sy; if (sy > maxy) maxy = sy;
      }
      return [Math.floor(minx) - 2, Math.floor(miny) - 2, Math.ceil(maxx) + 2, Math.ceil(maxy) + 2];
    }
    /* screen sprite: fn(sub) paints into a w x h offscreen canvas once (key must name every input that changes the pixels) */
    function screenSprite(key, w, h, fn, sx, sy) {
      var ent = sprites[key];
      if (!ent && mk) {
        var cv = mk(w, h);
        if (cv) {
          var c2 = cv.getContext('2d'), sub = make(c2, { W: w, H: h, makeCanvas: null });
          sub.Z = g.Z; fn(sub); ent = sprites[key] = cv;
        }
      }
      if (ent) ctx.drawImage(ent, Math.round(sx), Math.round(sy));
      else {
        /* no offscreen canvas (a checker, an old browser): draw straight onto the picture, shifted to the sprite's place */
        var off = Object.create(g);
        off.r = function (x, y, w, h, c) { r(x + sx, y + sy, w, h, c); };
        off.poly = function (pts, c, dens) { poly(pts.map(function (p) { return [p[0] + Math.round(sx), p[1] + Math.round(sy)]; }), c, dens); };
        fn(off);
      }
    }
    g.screenSprite = screenSprite;
    /* world sprite: fn(s) draws in coordinates relative to the sprite origin; bbox is [x0,y0,z0,x1,y1,z1] relative to it */
    g.sprite = function (key, bb, fn, wx, wy, wz) {
      var Z = g.Z, k = key + '@' + Z, org = g.proj(wx || 0, wy || 0, wz || 0), sb = bbScreen(bb, Z);
      var ent = sprites[k];
      if (!ent && mk) {
        var w = sb[2] - sb[0], h = sb[3] - sb[1], cv = mk(w, h);
        if (cv) {
          var c2 = cv.getContext('2d'), sub = make(c2, { W: w, H: h, makeCanvas: null });
          sub.Z = Z; sub.ox = -sb[0]; sub.oy = -sb[1]; fn(sub); ent = sprites[k] = cv;
        }
      }
      if (ent) ctx.drawImage(ent, org[0] + sb[0], org[1] + sb[1]);
      else { var save = [g.ox, g.oy]; g.ox = org[0]; g.oy = org[1]; fn(g); g.ox = save[0]; g.oy = save[1]; }
    };
    g.layer = function (key, bb, fn) { g.sprite(key, bb, fn, 0, 0, 0); };

    /* a calm backdrop behind the diorama: kind 'bands' (horizontal), 'stripes' (vertical) or 'diag' (2:1 lines, in line with the iso grid) */
    g.backdrop = function (kind, base, line) {
      g.fill(base);
      screenSprite('bd|' + kind + '|' + base + '|' + line + '|' + W + 'x' + H, W, H, function (s) {
        var i;
        if (kind === 'bands') for (i = 0; i < H; i += 24) s.r(0, i, W, 12, line);
        else if (kind === 'stripes') for (i = 0; i < W; i += 32) s.r(i, 0, 16, H, line);
        else for (i = -H * 2; i < W; i += 24) { s.line(i, 0, i + H * 2, H, line); s.line(i + 1, 0, i + 1 + H * 2, H, line); s.line(i + W, 0, i + W - H * 2, H, line); }
      }, 0, 0);
    };

    /* full picture ordered-dither veil: dens 0 = nothing, 1 = solid */
    g.veil = function (dens, c) {
      if (dens <= 0) return;
      if (dens >= 1) { g.fill(c); return; }
      dens = Math.round(dens * 16) / 16;
      screenSprite('veil|' + dens + '|' + c + '|' + W + 'x' + H, W, H, function (s) { s.poly([[0, 0], [W, 0], [W, H], [0, H]], c, dens); }, 0, 0);
    };

    /* ---------------- shapes ---------------- */
    function lineP(a, b, c, dy) { line(a[0], a[1] + (dy || 0), b[0], b[1] + (dy || 0), c); }

    function shadowAt(x, y, w, d, ext) {
      var e = ext === undefined ? 2 : ext;
      var A = g.proj(x + 1, y + 1, 0), B = g.proj(x + w + e, y + 1, 0), Cc = g.proj(x + w + e, y + d + 0, 0), D = g.proj(x + 1, y + d, 0);
      poly([A, B, Cc, D], P.shadow);
    }
    g.shadowAt = shadowAt;

    g.isoBox = function (x, y, z, w, d, h, col, op) {
      op = op || {};
      x = Math.round(x); y = Math.round(y); z = Math.round(z); w = Math.round(w); d = Math.round(d); h = Math.round(h);
      g.lastBox = [x, y, z, x + w, y + d, z + h];
      if (w <= 0 || d <= 0 || h <= 0) return;
      if (op.glass) { glassFront(x, y, z, w, d, h, col, op); return; }
      var c = C(col);
      if (op.shadow) shadowAt(x, y, w, d);
      var T00 = g.proj(x, y, z + h), T10 = g.proj(x + w, y, z + h), T11 = g.proj(x + w, y + d, z + h), T01 = g.proj(x, y + d, z + h);
      var B11 = g.proj(x + w, y + d, z), B01 = g.proj(x, y + d, z), B10 = g.proj(x + w, y, z);
      poly([T00, T10, T11, T01], c.top);
      poly([T01, T11, B11, B01], c.left);
      poly([T11, T10, B10, B11], c.right);
      if (op.rim !== false && (w + d >= 5)) {
        var rim = mix(c.top, '#ffffff', 0.35);
        lineP(T01, T11, rim, -g.Z); lineP(T11, T10, rim, -g.Z);
        if (h * g.Z >= 6) { var ve = mix(c.left, c.top, 0.45); r(T11[0] - g.Z, T11[1], g.Z, (h * g.Z), ve); }
      }
    };

    /* flat rectangle on the floor (or at height z): paint, marks, mats */
    g.isoTile = function (x, y, w, d, col, z, dens) {
      z = z || 0;
      var A = g.proj(x, y, z), B = g.proj(x + w, y, z), Cc = g.proj(x + w, y + d, z), D = g.proj(x, y + d, z);
      g.lastBox = [x, y, z - 1, x + w, y + d, z];
      poly([A, B, Cc, D], col, dens);
    };
    g.isoEll = function (x, y, z, rad, col, dens) {
      var c = g.proj(x, y, z), ry = Math.round(1.414 * rad * g.Z);
      g.lastBox = [x - rad, y - rad, z - 1, x + rad, y + rad, z];
      ell(c[0], c[1], ry * 2, ry, col, dens);
    };
    g.isoRing = function (x, y, z, rad, col, gap) {
      var c = g.proj(x, y, z), ry = 1.414 * rad * g.Z, rx = ry * 2, n = Math.max(12, Math.round(rad * 8)), Z = g.Z;
      g.lastBox = [x - rad, y - rad, z - 1, x + rad, y + rad, z];
      for (var i = 0; i < n; i++) {
        if (gap && i % gap === 0) continue;
        var a = i / n * Math.PI * 2;
        r(c[0] + Math.round(Math.cos(a) * rx), c[1] + Math.round(Math.sin(a) * ry), Z, Z, col);
      }
    };

    /* vertical cylinder: centre (x, y), footprint radius rad (world units), height h (pixels) */
    g.isoCyl = function (x, y, z, rad, h, col, op) {
      op = op || {};
      var c = C(col), Z = g.Z, b = Math.max(1, Math.round(1.414 * rad * Z)), a = b * 2, cc = g.proj(x, y, z), cx = cc[0], cyB = cc[1], hh = Math.round(h * Z), cyT = cyB - hh;
      g.lastBox = [x - rad, y - rad, z, x + rad, y + rad, z + h];
      if (op.shadow) ell(cx + 3 * Z, cyB + Z, a, b, P.shadow);
      var L2 = mix(c.left, c.top, 0.5), R2 = mix(c.right, '#000000', 0.18);
      function band(dy, hgt, cl) {
        var rows = hgt, y0 = dy;
        for (var i = 0; i < rows; i++) {
          var yy = y0 + i;
          r(cx - a, yy, Math.round(a * 0.5), 1, cl.left);
          r(cx - Math.round(a * 0.5), yy, Math.round(a * 0.5), 1, cl.hi || L2);
          r(cx, yy, Math.round(a * 0.4), 1, cl.left);
          r(cx + Math.round(a * 0.4), yy, Math.round(a * 0.35), 1, cl.right);
          r(cx + Math.round(a * 0.75), yy, a - Math.round(a * 0.75) + 1, 1, cl.dk || R2);
        }
      }
      /* lower half of the base ellipse, then the straight body */
      for (var dy = 0; dy <= b; dy++) {
        var k = dy / b, hw = Math.round(a * Math.sqrt(Math.max(0, 1 - k * k))), yy = cyB + dy, fr = hw / a;
        var xl = cx - hw, xr = cx + hw + 1;
        var segs = [[-1, -0.5, c.left], [-0.5, 0, L2], [0, 0.4, c.left], [0.4, 0.75, c.right], [0.75, 1.01, R2]];
        for (var s = 0; s < segs.length; s++) {
          var s0 = Math.max(xl, cx + Math.round(segs[s][0] * a)), s1 = Math.min(xr, cx + Math.round(segs[s][1] * a) + (s === segs.length - 1 ? 1 : 0));
          if (s1 > s0) r(s0, yy, s1 - s0, 1, segs[s][2]);
        }
        void fr;
      }
      band(cyT, hh, { left: c.left, right: c.right });
      if (op.bands) for (var i = 0; i < op.bands.length; i++) {
        var bd = op.bands[i], bc = C(bd[2]);
        band(cyB - Math.round((bd[0] + bd[1]) * Z), Math.round(bd[1] * Z), { left: bc.left, right: bc.right, hi: mix(bc.left, bc.top, 0.5), dk: mix(bc.right, '#000000', 0.18) });
      }
      ell(cx, cyT, a, b, c.top);
      if (op.rim !== false && a >= 4) {
        for (var th = 0; th < 24; th++) {
          var an = th / 24 * Math.PI * 2;
          if (Math.sin(an) > 0.2) r(cx + Math.round(Math.cos(an) * a), cyT + Math.round(Math.sin(an) * b) - 0, Z, Z, mix(c.top, '#ffffff', 0.3));
        }
      }
      if (op.topCol) ell(cx, cyT, Math.max(1, a - 2 * Z), Math.max(1, b - Z), op.topCol);
    };

    /* rectangle drawn on a wall plane. plane 'y': the plane y = pos, spans x from u; plane 'x': the plane x = pos, spans y from u */
    g.isoPanel = function (plane, pos, u, z, w, h, col, op) {
      op = op || {};
      u = Math.round(u); z = Math.round(z); w = Math.round(w); h = Math.round(h); pos = Math.round(pos);
      if (w <= 0 || h <= 0) return;
      g.lastBox = plane === 'y' ? [u, pos - 1, z, u + w, pos, z + h] : [pos - 1, u, z, pos, u + w, z + h];
      function pts(u0, z0, w0, h0) {
        return plane === 'y'
          ? [g.proj(u0, pos, z0 + h0), g.proj(u0 + w0, pos, z0 + h0), g.proj(u0 + w0, pos, z0), g.proj(u0, pos, z0)]
          : [g.proj(pos, u0, z0 + h0), g.proj(pos, u0 + w0, z0 + h0), g.proj(pos, u0 + w0, z0), g.proj(pos, u0, z0)];
      }
      if (typeof col === 'object' && col) {
        poly(pts(u, z, w, h), col.border);
        if (w > 2 && h > 2) poly(pts(u + 1, z + 1, w - 2, h - 2), col.fill);
      } else poly(pts(u, z, w, h), col, op.dens);
    };

    /* ---------------- glass (dither, never alpha) ---------------- */
    function facePts(s, face, w, d, h) {
      switch (face) {
        case 'top': return [s.proj(0, 0, h), s.proj(w, 0, h), s.proj(w, d, h), s.proj(0, d, h)];
        case 'y+': return [s.proj(0, d, h), s.proj(w, d, h), s.proj(w, d, 0), s.proj(0, d, 0)];
        case 'x+': return [s.proj(w, d, h), s.proj(w, 0, h), s.proj(w, 0, 0), s.proj(w, d, 0)];
        case 'y-': return [s.proj(0, 0, h), s.proj(w, 0, h), s.proj(w, 0, 0), s.proj(0, 0, 0)];
        default: return [s.proj(0, d, h), s.proj(0, 0, h), s.proj(0, 0, 0), s.proj(0, d, 0)]; // 'x-'
      }
    }
    /* one dithered glass face; the pixels are cached because the face never changes while its box does not move */
    g.isoGlassFace = function (face, x, y, z, w, d, h, col, op) {
      op = op || {};
      var dens = Math.round((op.dens === undefined ? 0.28 : op.dens) * 16) / 16, c = C(col || 'silver');
      var tone = (face === 'top') ? c.top : (face === 'y+' || face === 'y-') ? c.left : c.right;
      var edge = op.edge || mix(c.top, '#ffffff', 0.2);
      var sx = (face === 'x+' || face === 'x-') ? 'R' : 'L';
      void sx;
      g.lastBox = [x, y, z, x + w, y + d, z + h];
      var key = 'gf|' + face + '|' + w + '|' + d + '|' + h + '|' + dens + '|' + tone + '|' + edge + '|' + (op.noEdge ? 1 : 0);
      g.sprite(key, [0, 0, 0, w, d, h], function (s) {
        var pts = facePts(s, face, w, d, h);
        if (dens > 0) s.poly(pts, tone, dens);
        if (!op.noEdge) for (var i = 0; i < 4; i++) {
          var a = pts[i], b = pts[(i + 1) % 4];
          s.line(a[0], a[1], b[0], b[1], edge);
        }
      }, x, y, z);
    };
    function glassFront(x, y, z, w, d, h, col, op) {
      g.isoGlassFace('top', x, y, z + h - h, w, d, h, col, op); // top plane is the h-high plane of the box
      g.isoGlassFace('y+', x, y, z, w, d, h, col, op);
      g.isoGlassFace('x+', x, y, z, w, d, h, col, op);
      g.lastBox = [x, y, z, x + w, y + d, z + h];
    }
    g.isoGlassBack = function (x, y, z, w, d, h, col, op) {
      op = op || {};
      var o2 = {}; for (var k in op) o2[k] = op[k];
      o2.noEdge = true; o2.dens = (op.dens === undefined ? 0.28 : op.dens) * 0.6;
      g.isoGlassFace('y-', x, y, z, w, d, h, col, o2);
      if (!op.rear) g.isoGlassFace('x-', x, y, z, w, d, h, col, o2);
    };

    /* ---------------- floor and walls ---------------- */
    g.isoFloor = function (X, Y, op) {
      op = op || {};
      var slab = op.slab === undefined ? 5 : op.slab, t = op.tile || 6, style = op.style || 'checker';
      var a = op.a || P.floorA, b = op.b || P.floorB, i, j;
      var edgeCol = { top: a, left: P.slab, right: mix(P.slab, '#000000', 0.3) };
      g.isoBox(0, 0, -slab, X, Y, slab, edgeCol, { rim: false });
      poly([g.proj(0, 0, 0), g.proj(X, 0, 0), g.proj(X, Y, 0), g.proj(0, Y, 0)], a);
      if (style === 'checker') {
        for (i = 0; i * t < X; i++) for (j = 0; j * t < Y; j++) if ((i + j) % 2 === 0) {
          var x0 = i * t, y0 = j * t, w = Math.min(t, X - x0), d = Math.min(t, Y - y0);
          poly([g.proj(x0, y0, 0), g.proj(x0 + w, y0, 0), g.proj(x0 + w, y0 + d, 0), g.proj(x0, y0 + d, 0)], b);
        }
      } else if (style === 'grid' || style === 'epoxy') {
        for (i = 0; i <= X; i += t) lineP(g.proj(i, 0, 0), g.proj(i, Y, 0), P.floorLine);
        for (j = 0; j <= Y; j += t) lineP(g.proj(0, j, 0), g.proj(X, j, 0), P.floorLine);
      }
      if (op.zones) for (i = 0; i < op.zones.length; i++) { var zz = op.zones[i]; g.isoTile(zz[0], zz[1], zz[2], zz[3], zz[4], 0, zz[5]); }
      /* a thin red edge line on the front of the slab, the company accent */
      lineP(g.proj(0, Y, -1), g.proj(X, Y, -1), P.red2); lineP(g.proj(X, Y, -1), g.proj(X, 0, -1), P.red2);
    };

    /* the two back walls (left wall on plane x = 0, right wall on plane y = 0), thick, with the cut top edge in silver */
    g.isoWallCut = function (X, Y, Hh, op) {
      op = op || {};
      var t = op.thick || 2, style = op.style || 'studs', i, j;
      var wl = { top: P.wallTop, left: P.wallL, right: P.wallL }, wr = { top: P.wallTop, left: P.wallR, right: P.wallR };
      var tint = op.tint;
      if (tint) { wl.left = wl.right = mix(P.wallL, tint, 0.18); wr.left = wr.right = mix(P.wallR, tint, 0.18); }
      g.isoBox(-t, -t, 0, t, Y + t, Hh, { top: wl.top, left: mix(wl.left, '#000000', 0.15), right: wl.right }, { rim: false });
      g.isoBox(0, -t, 0, X, t, Hh, { top: wr.top, left: wr.left, right: mix(wr.right, '#000000', 0.15) }, { rim: false });
      /* skirting line and dado */
      g.isoPanel('x', 0, 0, 0, Y, 2, P.base);
      g.isoPanel('y', 0, 0, 0, X, 2, P.base);
      var lc = op.line || P.wallLine;
      if (style === 'studs') {
        for (i = 12; i < Y; i += 12) g.isoPanel('x', 0, i, 2, 1, Hh - 2, mix(wl.left, '#ffffff', 0.05));
        for (i = 12; i < X; i += 12) g.isoPanel('y', 0, i, 2, 1, Hh - 2, mix(wr.left, '#000000', 0.12));
      } else if (style === 'tile') {
        for (j = 8; j < Hh; j += 6) { g.isoPanel('x', 0, 0, j, Y, 1, lc); g.isoPanel('y', 0, 0, j, X, 1, lc); }
        for (i = 6; i < Y; i += 6) g.isoPanel('x', 0, i, 2, 1, Hh - 2, lc);
        for (i = 6; i < X; i += 6) g.isoPanel('y', 0, i, 2, 1, Hh - 2, lc);
      } else if (style === 'panel') {
        g.isoPanel('x', 0, 0, Math.round(Hh * 0.45), Y, 1, P.wallLine2); g.isoPanel('y', 0, 0, Math.round(Hh * 0.45), X, 1, P.wallLine2);
        g.isoPanel('x', 0, 0, 2, Y, Math.round(Hh * 0.45) - 2, mix(wl.left, '#000000', 0.12)); g.isoPanel('y', 0, 0, 2, X, Math.round(Hh * 0.45) - 2, mix(wr.left, '#000000', 0.1));
      }
    };

    /* ---------------- motion helpers ---------------- */
    /* pulse rings in screen space: three rings that grow and thin out */
    g.ring = function (sx, sy, rad, t, c, squash) {
      var Z = g.Z, sq = squash || 1;
      for (var i = 0; i < 3; i++) {
        var f = (t + i / 3) % 1, R = Math.round(rad * f);
        if (R < 2) continue;
        var n = Math.max(12, R * 4), every = f > 0.6 ? 3 : f > 0.3 ? 2 : 1;
        for (var k = 0; k < n; k++) {
          if (k % every) continue;
          var a = k / n * Math.PI * 2;
          r(sx + Math.round(Math.cos(a) * R), sy + Math.round(Math.sin(a) * R * sq), Z, Z, c);
        }
      }
    };
    /* dithered glow: a disc whose density falls off with distance. k scales strength (0..1) */
    g.glow = function (sx, sy, rad, c, k) {
      var Z = g.Z, kk = k === undefined ? 1 : k;
      rad = Math.round(rad * Z);
      var gh = Math.round(rad * 0.5);
      screenSprite('glow|' + rad + '|' + c + '|' + kk + '|' + Z, rad * 2 + 1, gh * 2 + 1, function (s) {
        for (var y = -gh; y <= gh; y++) for (var x = -rad; x <= rad; x++) {
          var dd = Math.sqrt(x * x + (y * 2) * (y * 2)) / rad;
          if (dd >= 1) continue;
          var inten = Math.pow(1 - dd, 1.3) * kk;
          if (BAYER[(((y + gh) & 3) << 2) | ((x + rad) & 3)] < inten * 15) s.r(x + rad, y + gh, 1, 1, c);
        }
      }, sx - rad, sy - gh);
    };
    /* deterministic particles flying out of a point (chips, sparks). t in seconds */
    g.sparks = function (sx, sy, t, n, spread, c, c2) {
      var Z = g.Z;
      for (var i = 0; i < n; i++) {
        var ph = (t * 1.6 + i / n + rnd(i * 3.1) * 0.3) % 1, a = rnd(i * 7.7 + 1) * Math.PI * 2, sp = (0.4 + rnd(i * 5.3)) * spread;
        var px = sx + Math.cos(a) * sp * ph, py = sy + Math.sin(a) * sp * ph * 0.6 + ph * ph * spread * 0.9 - spread * 0.3 * Math.sin(ph * Math.PI);
        if (ph < 0.85) r(px, py, Z, Z, (i % 3 === 0 && c2) ? c2 : c);
      }
    };
    /* dashed line through the world (a scanner beam, a wire): dashes march when t changes */
    g.isoBeam = function (x0, y0, z0, x1, y1, z1, c, t) {
      var a = g.proj(x0, y0, z0), b = g.proj(x1, y1, z1);
      g.lastBox = [Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1), Math.max(x0, x1) + 0.5, Math.max(y0, y1) + 0.5, Math.max(z0, z1) + 0.5];
      line(a[0], a[1], b[0], b[1], c, 2, Math.floor((t || 0) * 12));
    };
    /* path = [[x,y],[x,y],...] on the floor; dashes of len world units every gap units, moving at speed units per second */
    g.isoArrowFlow = function (path, t, op) {
      op = op || {};
      var len = op.len || 3, gap = op.gap || 4, spd = op.speed || 8, col = op.color || P.red, col2 = op.color2, z = op.z || 0, i, tot = 0, segs = [];
      for (i = 0; i < path.length - 1; i++) {
        var dx = path[i + 1][0] - path[i][0], dy = path[i + 1][1] - path[i][1], l = Math.sqrt(dx * dx + dy * dy);
        segs.push([tot, l, path[i][0], path[i][1], dx / (l || 1), dy / (l || 1)]); tot += l;
      }
      function at(s) {
        for (var k = 0; k < segs.length; k++) { var sg = segs[k]; if (s >= sg[0] && s <= sg[0] + sg[1]) { var u = s - sg[0]; return [sg[2] + sg[4] * u, sg[3] + sg[5] * u]; } }
        return null;
      }
      var minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
      for (i = 0; i < path.length; i++) { minx = Math.min(minx, path[i][0]); maxx = Math.max(maxx, path[i][0]); miny = Math.min(miny, path[i][1]); maxy = Math.max(maxy, path[i][1]); }
      g.lastBox = [minx, miny, z - 1, maxx + 1, maxy + 1, z];
      var off = (t * spd) % (len + gap), n = 0;
      for (var s0 = -off; s0 < tot; s0 += len + gap) {
        var a = s0, b = s0 + len;
        if (b < 0 || a > tot) continue;
        a = Math.max(0, a); b = Math.min(tot, b);
        var pa = at(a), pb = at(b);
        if (!pa || !pb) continue;
        var A = g.proj(pa[0], pa[1], z), B = g.proj(pb[0], pb[1], z);
        line(A[0], A[1], B[0], B[1], (op.alt && n % 2) ? (col2 || col) : col);
        if (op.thick) line(A[0], A[1] + g.Z, B[0], B[1] + g.Z, (op.alt && n % 2) ? (col2 || col) : col);
        n++;
      }
    };

    /* ---------------- depth list ---------------- */
    /* screen rectangle of a world box at the current camera (for the "do these two even overlap" test) */
    function screenBox(bb) {
      var xs = [bb[0], bb[3]], ys = [bb[1], bb[4]], zs = [bb[2], bb[5]], minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9, Z = g.Z;
      for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) for (var k = 0; k < 2; k++) {
        var sx = (xs[i] - ys[j]) * 2 * Z, sy = (xs[i] + ys[j] - zs[k]) * Z;
        if (sx < minx) minx = sx; if (sx > maxx) maxx = sx; if (sy < miny) miny = sy; if (sy > maxy) maxy = sy;
      }
      return [minx, miny, maxx, maxy];
    }
    /* painter's algorithm by separating axes: an edge a -> b means "draw a before b", added only when the two boxes overlap on screen */
    function sortItems(items) {
      var n = items.length, out = [], done = [], pred = [], i, j, left = n;
      for (i = 0; i < n; i++) { pred[i] = []; items[i].sb = screenBox(items[i].bb); }
      for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) {
        var A = items[i].sb, B = items[j].sb;
        if (A[0] >= B[2] + 3 || B[0] >= A[2] + 3 || A[1] >= B[3] + 3 || B[1] >= A[3] + 3) continue;
        var f = frontOf(items[i].bb, items[j].bb);
        if (f === 1) pred[i].push(j); else if (f === -1) pred[j].push(i);
      }
      while (left > 0) {
        var best = -1, bestOpen = 1e9;
        for (i = 0; i < n; i++) {
          if (done[i]) continue;
          var open = 0;
          for (var qq = 0; qq < pred[i].length; qq++) if (!done[pred[i][qq]]) open++;
          if (open < bestOpen || (open === bestOpen && items[i].k < items[best].k)) { best = i; bestOpen = open; }
        }
        done[best] = true; out.push(items[best]); left--;
      }
      return out;
    }
    g.list = function () {
      var host = this, items = [], L = {};
      function key(bb) { return (bb[0] + bb[3]) / 2 + (bb[1] + bb[4]) / 2 + (bb[2] + bb[5]) / 4; }
      L.add = function (bb, fn) { items.push({ bb: bb, fn: fn, k: key(bb) }); return L; };
      L.box = function (x, y, z, w, d, h, col, op) { return L.add([x, y, z, x + w, y + d, z + h], function () { host.isoBox(x, y, z, w, d, h, col, op); }); };
      L.cyl = function (x, y, z, rad, h, col, op) { return L.add([x - rad, y - rad, z, x + rad, y + rad, z + h], function () { host.isoCyl(x, y, z, rad, h, col, op); }); };
      L.person = function (x, y, dir, op) { var z = (op && op.z) || 0; return L.add([x - 1, y - 1, z, x + 1, y + 1, z + 19], function () { host.isoPerson(x, y, dir, op); }); };
      L.prop = function (kind, x, y, z, op) { return L.add(host.propBox(kind, x, y, z, op), function () { host.isoProp(kind, x, y, z, op); }); };
      L.flat = function (x, y, w, d, fn) { return L.add([x, y, -1, x + w, y + d, 0], function () { fn(host); }); };
      L.tile = function (x, y, w, d, col, z, dens) { return L.add([x, y, (z || 0) - 1, x + w, y + d, z || 0], function () { host.isoTile(x, y, w, d, col, z, dens); }); };
      L.flow = function (path, t, op) {
        var minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
        for (var i = 0; i < path.length; i++) { minx = Math.min(minx, path[i][0]); maxx = Math.max(maxx, path[i][0]); miny = Math.min(miny, path[i][1]); maxy = Math.max(maxy, path[i][1]); }
        return L.add([minx, miny, -1, maxx + 1, maxy + 1, 0], function () { host.isoArrowFlow(path, t, op); });
      };
      /* a see-through casing: dithered back faces first, whatever is inside, then dithered front faces */
      L.glass = function (x, y, z, w, d, h, col, op) {
        var e = 0.5;
        /* opts.rear = true leaves the x- end open (a trailer, a doorway) so things can slide in */
        if (!(op && op.rear)) L.add([x - e, y - e, z, x, y + d + e, z + h], function () { host.isoGlassFace('x-', x, y, z, w, d, h, col, nb(op)); });
        L.add([x - e, y - e, z, x + w + e, y, z + h], function () { host.isoGlassFace('y-', x, y, z, w, d, h, col, nb(op)); });
        L.add([x, y + d, z, x + w, y + d + e, z + h], function () { host.isoGlassFace('y+', x, y, z, w, d, h, col, op); });
        L.add([x + w, y, z, x + w + e, y + d, z + h], function () { host.isoGlassFace('x+', x, y, z, w, d, h, col, op); });
        L.add([x, y, z + h, x + w, y + d, z + h + e], function () { host.isoGlassFace('top', x, y, z, w, d, h, col, (op && op.topDens !== undefined) ? topOp(op) : op); });
        return L;
      };
      function topOp(op) { var o2 = {}; for (var k in op) o2[k] = op[k]; o2.dens = op.topDens; return o2; }
      function nb(op) { var o2 = {}; for (var k in (op || {})) o2[k] = op[k]; o2.noEdge = true; o2.dens = (op && op.dens !== undefined ? op.dens : 0.28) * 0.6; return o2; }
      L.flush = function () {
        var s = sortItems(items);
        for (var i = 0; i < s.length; i++) s[i].fn(host);
        items.length = 0;
        return L;
      };
      L.size = function () { return items.length; };
      return L;
    };

    /* ---------------- people ---------------- */
    /* dir: 0 faces +x (lower right), 1 faces +y (lower left), 2 faces -x (upper left, back to viewer), 3 faces -y (upper right, back to viewer)
       opts: z, shirt, shirtD, pants, hair, skin, hat (colour), glasses (bool), vest (bool), step (0/1 walking frame; omit when standing),
             arm ('down' | 'out' | 'up' | 'write'), hold (colour of a small item carried in front), holdSize [w,h], badge (bool), shadow:false */
    g.isoPerson = function (x, y, dir, op) {
      op = op || {};
      x = Math.round(x); y = Math.round(y);
      var z = op.z || 0, A = g.proj(x, y, z), ax = A[0], ay = A[1], Z = g.Z;
      g.lastBox = [x - 1, y - 1, z, x + 1, y + 1, z + 19];
      var wm0 = g.watch && g.watchMark ? g.watchMark() : 0;
      var shirt = op.shirt || P.red, shirtD = op.shirtD || mix(shirt, '#000000', 0.32), pants = op.pants || '#2f3a4a', skin = op.skin || P.skin, hair = op.hair || P.hair;
      var front = (dir === 0 || dir === 1), f = dir === 0 ? 1 : dir === 1 ? -1 : dir === 2 ? -1 : 1;
      if (op.shadow !== false) ell(ax + Z, ay, 5 * Z, 2 * Z, P.shadow);
      var st = op.step, yo = (st === 1 ? 1 : 0);
      /* legs and shoes: while walking one foot lifts a pixel and the body bobs a pixel */
      var lift1 = st === 0 ? 1 : 0, lift2 = st === 1 ? 1 : 0;
      q(ax, ay, -2, -6 - lift1 + 0, 2, 5, pants); q(ax, ay, 1, -6 - lift2, 2, 5, pants);
      q(ax, ay, -3, -1 - lift1, 3, 1, '#14171a'); q(ax, ay, 1, -1 - lift2, 3, 1, '#14171a');
      /* torso, shaded left light / right dark */
      var ty = -13 + yo * 0 - (st === undefined ? 0 : 0);
      q(ax, ay, -3, ty, 3, 7, shirt); q(ax, ay, 0, ty, 3, 7, shirtD);
      q(ax, ay, -3, ty + 6, 6, 1, mix(shirtD, '#000000', 0.25));
      if (op.vest) { q(ax, ay, -3, ty + 3, 6, 1, P.cream); }
      if (op.badge && front) { q(ax, ay, f > 0 ? 0 : -2, ty + 2, 2, 3, P.paper); q(ax, ay, f > 0 ? 0 : -2, ty + 2, 2, 1, P.red); }
      /* arms */
      var arm = op.arm || 'down', fx = f;
      q(ax, ay, -4, ty + 1, 1, 5, shirt); q(ax, ay, 3, ty + 1, 1, 5, shirtD);
      q(ax, ay, -4, ty + 6, 1, 1, skin); q(ax, ay, 3, ty + 6, 1, 1, skin);
      if (arm === 'out' || arm === 'write') {
        var sd = fx > 0 ? 3 : -4, dx = fx > 0 ? 1 : -2;
        q(ax, ay, sd, ty + 1, 1, 5, fx > 0 ? shirtD : shirt);
        q(ax, ay, sd + dx + (fx > 0 ? 0 : 0), ty + 3, 2, 1, fx > 0 ? shirtD : shirt);
        var hxp = sd + dx + (fx > 0 ? 2 : -1);
        q(ax, ay, hxp, ty + 3, 1, 1, skin);
        q(ax, ay, sd, ty + 6, 1, 1, shirt);
        if (op.card) { q(ax, ay, fx > 0 ? hxp + 1 : hxp - 3, ty + 2, 3, 2, P.paper); q(ax, ay, fx > 0 ? hxp + 1 : hxp - 3, ty + 2, 3, 1, op.card); }
        if (op.tool) { q(ax, ay, fx > 0 ? hxp + 1 : hxp - 3, ty + 3, 3, 1, op.tool); q(ax, ay, fx > 0 ? hxp + 3 : hxp - 3, ty + 2, 1, 3, op.tool); }
      } else if (arm === 'up') {
        var su = fx > 0 ? 3 : -4;
        q(ax, ay, su, ty - 3, 1, 5, fx > 0 ? shirtD : shirt); q(ax, ay, su, ty - 4, 1, 1, skin);
      }
      /* carried item */
      if (op.hold) {
        var hs = op.holdSize || [4, 4], hx = fx > 0 ? 3 : -3 - hs[0];
        q(ax, ay, hx, ty + 3, hs[0], hs[1], op.hold); q(ax, ay, hx, ty + 3, hs[0], 1, mix(op.hold, '#ffffff', 0.35));
        q(ax, ay, fx > 0 ? hx - 1 : hx + hs[0], ty + 3 + hs[1] - 1, 1, 1, skin);
      }
      /* head */
      var hy = ty - 6;
      q(ax, ay, -2, hy, 5, 6, front ? skin : hair);
      q(ax, ay, -2, hy, 5, 2, hair);
      if (front) {
        q(ax, ay, -2, hy + 2, 1, 1, hair); q(ax, ay, 2, hy + 2, 1, 1, hair);
        q(ax, ay, fx > 0 ? 0 : -1, hy + 3, 1, 1, '#1b1e21'); q(ax, ay, fx > 0 ? 2 : 1, hy + 3, 1, 1, '#1b1e21');
        if (op.glasses) q(ax, ay, -1, hy + 3, 3, 1, P.blueL);
        q(ax, ay, 0, hy + 5, 3, 1, mix(skin, '#000000', 0.12));
      } else {
        q(ax, ay, -2, hy + 5, 5, 1, mix(hair, '#000000', 0.2));
      }
      if (op.hat) { q(ax, ay, -3, hy - 1, 7, 2, op.hat); q(ax, ay, -2, hy - 2, 5, 1, op.hat); q(ax, ay, -3, hy - 1, 7, 1, mix(op.hat, '#ffffff', 0.3)); }
      if (g.watch) g.watch.push({ kind: 'person', name: 'isoPerson', box: worldScreenBox(g.lastBox), m0: wm0, m1: g.watchMark ? g.watchMark() : 0 });
    };

    /* ---------------- props ---------------- */
    function dimOf(kind, op) {
      var pr = PROPS[kind];
      if (!pr) throw new Error('unknown prop ' + kind);
      return typeof pr.dim === 'function' ? pr.dim(op || {}) : pr.dim;
    }
    g.propBox = function (kind, x, y, z, op) {
      op = op || {};
      var dm = dimOf(kind, op);
      return op.face === 'x' ? [x, y, z, x + dm[1], y + dm[0], z + dm[2]] : [x, y, z, x + dm[0], y + dm[1], z + dm[2]];
    };
    g.isoProp = function (kind, x, y, z, op) {
      op = op || {};
      x = Math.round(x); y = Math.round(y); z = Math.round(z || 0);
      var dm = dimOf(kind, op), face = op.face === 'x' ? 'x' : 'y';
      var s = { g: g, x: x, y: y, z: z, o: op, face: face, w: dm[0], d: dm[1], h: dm[2] };
      s.B = function (u, v, zz, ww, dd, hh, col, bo) {
        if (face === 'y') g.isoBox(x + u, y + v, z + zz, ww, dd, hh, col, bo);
        else g.isoBox(x + v, y + u, z + zz, dd, ww, hh, col, bo);
      };
      /* panel on the front plane (v = vf, default the front surface) */
      s.F = function (u, zz, ww, hh, col, vf, po) {
        vf = vf === undefined ? s.d : vf;
        if (face === 'y') g.isoPanel('y', y + vf, x + u, z + zz, ww, hh, col, po);
        else g.isoPanel('x', x + vf, y + u, z + zz, ww, hh, col, po);
      };
      s.C = function (u, v, zz, rad, hh, col, co) {
        if (face === 'y') g.isoCyl(x + u, y + v, z + zz, rad, hh, col, co);
        else g.isoCyl(x + v, y + u, z + zz, rad, hh, col, co);
      };
      /* world position of a point of the prop (u across the front, v depth, zz height) */
      s.at = function (u, v, zz) { return face === 'y' ? [x + u, y + v, z + zz] : [x + v, y + u, z + zz]; };
      s.top = function (u, v, ww, dd, zz, col) { if (face === 'y') g.isoTile(x + u, y + v, ww, dd, col, z + zz); else g.isoTile(x + v, y + u, dd, ww, col, z + zz); };
      var pm0 = g.watch && g.watchMark ? g.watchMark() : 0;
      PROPS[kind].draw(s, op);
      g.lastBox = g.propBox(kind, x, y, z, op);
      if (g.watch) g.watch.push({ kind: 'prop', name: 'isoProp:' + kind, box: worldScreenBox(g.lastBox), m0: pm0, m1: g.watchMark ? g.watchMark() : 0 });
    };

    return g;
  }

  /* ===========================================================================================================
     BUILT-IN PROPS.  Each prop is drawn in its own front frame: u runs across the front, v is depth (towards the
     viewer), zz is height. s.B(u,v,zz,w,d,h,col,opts) is a box, s.F(u,zz,w,h,col,vf) a panel on the front plane,
     s.top(u,v,w,d,zz,col) a flat tile at height zz, s.C(u,v,zz,rad,h,col) a cylinder. opts.face = 'x' turns the
     front to the lower right. Draw back to front inside a prop.
     =========================================================================================================== */
  function fixed(w, d, h) { return [w, d, h]; }
  var PI = P;

  defineProp('crate', function (o) { return [o.w || 10, o.d || 8, o.h || 8]; }, function (s, o) {
    var w = s.w, d = s.d, h = s.h;
    s.B(0, 0, 0, w, d, h, o.col || 'card', { shadow: o.shadow !== false });
    var m = Math.round(w / 2) - 1;
    s.top(m, 0, 2, d, h, o.tape || PI.cream2);
    s.F(m, 0, 2, h, o.tape || PI.cream2);
    s.F(1, Math.max(1, Math.round(h * 0.35)), Math.max(3, Math.round(w * 0.3)), 3, PI.cream);
    if (o.tag) s.F(Math.max(2, w - 4), h - 3, 2, 2, o.tag);
  });

  defineProp('pallet', function (o) { return [o.w || 12, o.d || 10, 3]; }, function (s, _o) {
    var w = s.w, d = s.d;
    s.B(0, 0, 0, 2, d, 1, 'wood', { rim: false }); s.B(Math.round(w / 2) - 1, 0, 0, 2, d, 1, 'wood', { rim: false }); s.B(w - 2, 0, 0, 2, d, 1, 'wood', { rim: false });
    s.B(0, 0, 1, w, 2, 2, 'wood', { rim: false }); s.B(0, Math.round(d / 2) - 1, 1, w, 2, 2, 'wood', { rim: false }); s.B(0, d - 2, 1, w, 2, 2, 'wood', { rim: false });
  });

  defineProp('desk', function (o) { return [o.w || 24, o.d || 12, 9]; }, function (s, o) {
    var w = s.w, d = s.d;
    s.B(1, 1, 0, 2, d - 2, 7, 'steel', { rim: false });
    s.B(w - 8, 1, 0, 7, d - 2, 7, 'steel', { rim: false });
    s.F(w - 7, 4, 5, 2, PI.st0); s.F(w - 5, 4, 1, 1, PI.st4);
    s.F(w - 7, 1, 5, 2, PI.st0); s.F(w - 5, 1, 1, 1, PI.st4);
    s.B(0, 0, 7, w, d, 2, o.top || 'wood', { shadow: true });
  });

  defineProp('table', function (o) { return [o.w || 20, o.d || 10, o.h || 9]; }, function (s, o) {
    var w = s.w, d = s.d, h = s.h;
    s.B(1, 1, 0, 2, 2, h - 2, 'steel', { rim: false }); s.B(w - 3, 1, 0, 2, 2, h - 2, 'steel', { rim: false });
    s.B(1, d - 3, 0, 2, 2, h - 2, 'steel', { rim: false }); s.B(w - 3, d - 3, 0, 2, 2, h - 2, 'steel', { rim: false });
    s.B(0, 0, h - 2, w, d, 2, o.top || 'steel', { shadow: true });
    if (o.plate) s.top(2, 2, w - 4, d - 4, h, o.plate);
  });

  defineProp('counter', function (o) { return [o.w || 30, o.d || 8, 11]; }, function (s, o) {
    var w = s.w, d = s.d;
    s.B(0, 0, 0, w, d, 9, o.body || 'dark', { shadow: true });
    for (var i = 3; i < w - 2; i += 6) s.F(i, 1, 4, 7, PI.st1);
    s.B(0, 0, 9, w, d, 2, o.top || 'counter', { rim: true });
  });

  defineProp('cabinet', fixed(8, 8, 15), function (s, _o) {
    s.B(0, 0, 0, 8, 8, 15, 'steel', { shadow: true });
    for (var i = 0; i < 3; i++) { s.F(1, 1 + i * 5, 6, 4, { fill: mix(PI.st1, '#ffffff', 0.08), border: PI.st0 }); s.F(3, 3 + i * 5, 2, 1, PI.st4); }
  });

  defineProp('shelf', function (o) { return [o.w || 26, o.d || 8, o.h || 22]; }, function (s, o) {
    var w = s.w, d = s.d, h = s.h, lv = [0, 7, 14, 21].filter(function (z) { return z < h; }), seed = o.seed || 1, i;
    s.B(0, 0, 0, w, 1, h, 'black', { rim: false });
    for (i = 0; i < lv.length; i++) {
      var zz = lv[i];
      s.B(0, 0, zz, w, d, 1, 'steel', { rim: false });
      if (i < lv.length - 1 || o.topItems) {
        var u = 2;
        while (u < w - 4) {
          var bw = 3 + Math.floor(rnd(seed * 17 + i * 5 + u) * 4), bh = 3 + Math.floor(rnd(seed * 3 + i * 9 + u) * 3);
          var cl = ['card', 'blue', 'steel', 'cream', 'dark'][Math.floor(rnd(seed + i * 11 + u * 3) * 5)];
          if (u + bw > w - 3) break;
          s.B(u, 2, zz + 1, bw, d - 3, bh, cl, { rim: false }); u += bw + 1;
        }
      }
    }
    s.B(0, 0, 0, 2, d, h, 'steel', { rim: false }); s.B(w - 2, 0, 0, 2, d, h, 'steel', { rim: false });
  });

  defineProp('bin', function (o) { return [o.w || 6, o.d || 6, o.h || 5]; }, function (s, o) {
    s.B(0, 0, 0, s.w, s.d, s.h, o.col || 'blue', { shadow: o.shadow !== false });
    s.top(1, 1, s.w - 2, s.d - 2, s.h, '#0f1214');
    if (o.fill) for (var i = 0; i < o.fill; i++) s.B(1 + (i % 2) * 2, 1 + Math.floor(i / 2) * 2, s.h - 1, 2, 2, 2, o.item || 'silver', { rim: false });
  });

  defineProp('cart', fixed(14, 8, 12), function (s, o) {
    s.B(1, 0, 0, 2, 2, 3, 'black', { rim: false }); s.B(11, 0, 0, 2, 2, 3, 'black', { rim: false });
    s.B(1, 6, 0, 2, 2, 3, 'black', { rim: false }); s.B(11, 6, 0, 2, 2, 3, 'black', { rim: false });
    s.B(0, 0, 3, 14, 8, 2, o.col || 'steel', { shadow: true });
    s.B(0, 0, 5, 1, 1, 7, 'silver', { rim: false }); s.B(0, 7, 5, 1, 1, 7, 'silver', { rim: false }); s.B(0, 0, 11, 1, 8, 1, 'silver', { rim: false });
  });

  /* A CNC machine tool, front faces +y (or +x with face:'x').  opts: door 0..1 (sliding glass), cut 0..1 (the head casing goes
     see-through and shows the motor), spin (turns per second phase), lamp ('green'|'amber'|'red'), work (colour), run (0..1 glow
     and chips while cutting), t (time for the chips), screen */
  /* A CNC machine tool, front faces +y (or +x with face:'x').  opts: door 0..1 (sliding glass), cut 0..1 (the head casing goes
     see-through and shows the motor), spin (turns per second phase), lamp ('green'|'amber'|'red'), work (colour), run (0..1 glow
     and chips while cutting), t (time for the chips), screen */
  defineProp('machine', fixed(18, 14, 34), function (s, o) {
    var door = o.door || 0, spin = o.spin || 0, lamp = o.lamp || 'green', cut = o.cut || 0, run = o.run || 0, i;
    s.B(0, 0, 0, 18, 14, 6, 'steel', { shadow: true });
    s.B(2, 0, 6, 9, 8, 10, 'black', { rim: false });           /* the dark back of the work area */
    s.B(2, 8, 6, 9, 6, 1, 'dark', { rim: false });              /* sill inside the opening */
    s.B(0, 0, 6, 2, 14, 10, 'steel');                           /* left pillar */
    s.B(4, 9, 7, 5, 4, 3, 'dark', { rim: false });              /* vise */
    s.B(5, 10, 10, 3, 2, 2, o.work || 'silver', { rim: false });/* the part in the vise */
    var ph = Math.floor(spin * 6) % 3, spin1 = [[1 + ph, 1, '#5c646b'], [3 + (ph % 2), 1, '#5c646b']];
    s.C(6.5, 10.5, 12, 1.2, 6, { top: '#c9ced2', left: '#aab1b7', right: '#7d858c' }, { rim: false, bands: spin1 });    /* spindle */
    /* the motor sits in the head, above the spindle */
    s.C(6.5, 10.5, 17, 2.4, 8, { top: '#f0605f', left: '#e03131', right: '#a51f1f' }, { rim: false, bands: [[2 + ph % 2, 1, '#a51f1f'], [5 + ph % 2, 1, '#a51f1f']] });
    s.B(11, 0, 6, 7, 14, 10, 'steel');                          /* right pillar */
    /* the head casing: solid, or dithered glass once cut > 0 so the motor shows through */
    if (cut > 0) s.B(0, 0, 16, 18, 14, 10, 'steel', { glass: true, dens: Math.max(0.22, 1 - 0.8 * cut) });
    else s.B(0, 0, 16, 18, 14, 10, 'steel');
    s.F(0, 24, 18, 2, PI.red); s.F(0, 0, 18, 2, PI.red2);
    s.B(12, 10, 7, 5, 3, 6, 'dark', { rim: false });           /* control panel on the right pillar */
    s.F(13, 9, 3, 3, { fill: o.screen || '#0f2a1d', border: PI.st1 }, 13);
    s.F(13, 8, 1, 1, lamp === 'red' ? PI.red : PI.green, 13); s.F(15, 8, 1, 1, PI.amber, 13);
    /* sliding glass door: closed over the opening, slides to the right when open */
    var shift = Math.round(door * 9);
    if (door < 1) {
      s.F(2 + shift, 6, 9, 10, { fill: '#17323d', border: PI.st3 }, 14);
      for (i = 0; i < 4; i++) s.F(3 + shift + i * 2, 7 + ((i * 3) % 4), 1, 4, mix('#17323d', '#8fb4d9', 0.22), 14);
    }
    s.C(15.5, 7, 26, 0.7, 4, 'dark', { rim: false });           /* stack light */
    s.C(15.5, 7, 30, 1.3, 3, lamp === 'red' ? 'red' : lamp === 'amber' ? 'amber' : 'green', { rim: false });
    if (run > 0) {
      var wp = s.at(6.5, 10.5, 12), tip = s.g.proj(wp[0], wp[1], wp[2]);
      s.g.glow(tip[0], tip[1], 9, '#f0c264', 0.5 * run);
      s.g.sparks(tip[0], tip[1], o.t || 0, 7, 9, '#e4e7ea', '#f0c264');
    }
  });

  /* A wall mounted time clock. opts: lit (display on), cut 0..1 (the case goes see-through and shows the board inside), beep (0..1 lamp) */
  defineProp('timeclock', fixed(8, 5, 12), function (s, o) {
    var cut = o.cut || 0;
    s.B(0, 0, 0, 8, 1, 12, 'dark', { rim: false });
    s.B(1, 1, 3, 6, 1, 7, 'green', { rim: false });               /* the board inside */
    s.B(2, 2, 7, 2, 1, 2, 'black', { rim: false }); s.B(5, 2, 4, 2, 1, 2, 'black', { rim: false });
    s.B(2, 2, 3, 3, 1, 2, 'steel', { rim: false });                /* the badge reader */
    s.C(5.5, 3, 3, 0.9, 3, 'amber', { rim: false });               /* the backup cell */
    if (cut > 0) s.B(0, 1, 0, 8, 4, 12, 'dark', { glass: true, dens: Math.max(0.2, 1 - 0.8 * cut), edge: PI.st3 });
    else s.B(0, 1, 0, 8, 4, 12, 'dark', { shadow: false });
    s.B(0, 1, 10, 8, 4, 2, 'red', { rim: false });
    s.F(1, 6, 6, 3, { fill: o.lit ? '#12301f' : '#0c0e10', border: PI.st1 }, 5);
    if (o.lit) { s.F(2, 7, 1, 1, PI.green, 5); s.F(4, 7, 2, 1, PI.green, 5); }
    s.F(2, 3, 4, 1, o.lit ? PI.green : '#000000', 5); s.F(2, 2, 4, 1, PI.st1, 5);
  });

  defineProp('monitor', fixed(8, 5, 10), function (s, o) {
    s.B(2, 1, 0, 4, 3, 1, 'dark', { rim: false }); s.B(3, 2, 1, 2, 1, 3, 'dark', { rim: false });
    s.B(0, 1, 4, 8, 2, 6, 'black');
    s.F(1, 5, 6, 4, o.screen || '#0f2a1d', 3);
    var rows = o.rows === undefined ? 3 : o.rows;
    for (var i = 0; i < rows; i++) s.F(2, 8 - i - Math.floor(i / 1), 2 + (i % 3) * 1, 1, o.ink || PI.green, 3);
  });

  defineProp('printer', fixed(9, 7, 5), function (s, o) {
    s.B(0, 0, 0, 9, 7, 5, 'dark', { shadow: true });
    s.F(1, 3, 7, 1, '#0c0e10'); s.F(6, 1, 1, 1, o.lit ? PI.green : PI.st1);
    var out = o.out || 0;
    if (out > 0) s.top(2, 7, 5, Math.max(1, Math.round(out * 6)), 0, PI.paper);
  });

  defineProp('scanner', fixed(4, 3, 7), function (s, o) {
    s.B(1, 1, 0, 2, 2, 4, 'black', { rim: false });
    s.B(0, 0, 4, 4, 3, 3, 'dark', { rim: false });
    s.F(1, 5, 2, 1, o.lit ? PI.redT : PI.st2, 3);
    if (o.lit) s.F(1, 6, 2, 1, PI.red, 3);
  });

  defineProp('docs', function (o) { return [o.w || 7, o.d || 5, Math.max(1, o.n || 3)]; }, function (s, o) {
    var n = Math.max(1, o.n || 3);
    for (var i = 0; i < n; i++) s.B(i % 2, 0, i, s.w - (i % 2), s.d, 1, 'paper', { rim: false, shadow: i === 0 });
    s.top(1, 1, s.w - 3, 1, n, o.head || PI.red);
    if (o.stamp) s.top(s.w - 4, 2, 2, 2, n, PI.red);
  });

  /* a pay stub lying flat: rows of text lines that fill in, and a red total bar. opts: rows 0..5, total 0..1 */
  defineProp('paystub', fixed(11, 8, 1), function (s, o) {
    s.B(0, 0, 0, 11, 8, 1, 'paper', { shadow: true, rim: false });
    s.top(1, 1, 9, 1, 1, PI.red);
    var n = o.rows || 0, i;
    for (i = 0; i < n && i < 4; i++) { s.top(1, 2 + i, 3 + (i % 2), 1, 1, PI.st2); s.top(7, 2 + i, 3, 1, 1, PI.st3); }
    if (o.total > 0) s.top(1, 6, Math.max(1, Math.round(9 * o.total)), 1, 1, PI.red);
  });

  defineProp('board', function (o) { return [o.w || 22, 2, o.h || 22]; }, function (s, o) {
    var w = s.w, h = s.h, rows = o.rows || 7, i;
    s.B(0, 0, 0, w, 2, h, 'dark', { rim: false });
    s.F(1, 1, w - 2, h - 2, { fill: PI.cream, border: PI.st3 }, 2);
    s.F(2, h - 5, w - 4, 3, PI.red, 2);
    s.F(3, h - 4, 5, 1, PI.cream, 2); s.F(w - 8, h - 4, 4, 1, PI.cream, 2);
    var top = h - 8;
    for (i = 0; i < rows; i++) {
      if (o.show !== undefined && i >= o.show) continue;
      var yy = top - i * 2, lit = o.lit === i, done = o.done !== undefined && i < o.done, chip = o.chips ? o.chips[i] : (i === 0 ? PI.red : i < 3 ? PI.amber : PI.st2);
      if (lit) s.F(2, yy - 1, w - 4, 2, PI.redT, 2);
      s.F(3, yy, 3, 1, done ? PI.st2 : chip, 2);
      s.F(7, yy, w - 11 - ((i * 3) % 4), 1, done ? PI.st3 : (lit ? PI.cream : PI.st1), 2);
    }
  });

  defineProp('rolldoor', function (o) { return [o.w || 14, 2, o.h || 18]; }, function (s, o) {
    var w = s.w, h = s.h, open = o.open || 0;
    s.B(0, 0, 0, w, 2, h, 'dark', { rim: false });
    s.F(1, 0, w - 2, h - 1, '#0c0e10', 2);
    var hh = Math.round((h - 2) * (1 - open));
    if (hh > 0) { s.F(1, h - 1 - hh, w - 2, hh, PI.st2, 2); for (var z = h - 2 - hh + 1; z < h - 1; z += 2) s.F(1, z, w - 2, 1, PI.st1, 2); }
    s.F(0, h - 1, w, 1, PI.red, 2);
  });

  defineProp('wallclock', fixed(8, 1, 8), function (s, o) {
    var R = 3.5, cu = 4, cz = 4, pts = [], k;
    var plane = s.face === 'y' ? 'y' : 'x';
    function P3(u, zz) { return plane === 'y' ? s.g.proj(s.x + u, s.y + 1, s.z + zz) : s.g.proj(s.x + 1, s.y + u, s.z + zz); }
    for (k = 0; k < 16; k++) { var a = k / 16 * Math.PI * 2; pts.push(P3(cu + Math.cos(a) * (R + 0.5), cz + Math.sin(a) * (R + 0.5))); }
    s.g.poly(pts, PI.st3); pts = [];
    for (k = 0; k < 16; k++) { a = k / 16 * Math.PI * 2; pts.push(P3(cu + Math.cos(a) * (R - 0.8), cz + Math.sin(a) * (R - 0.8))); }
    s.g.poly(pts, PI.cream);
    var m = o.min === undefined ? 0 : o.min, hr = (o.hour === undefined ? 3 : o.hour) % 12;
    var am = m / 60 * Math.PI * 2 - Math.PI / 2, ah = (hr + m / 60) / 12 * Math.PI * 2 - Math.PI / 2;
    var c0 = P3(cu, cz), e1 = P3(cu + Math.cos(am) * 3, cz - Math.sin(am) * 3), e2 = P3(cu + Math.cos(ah) * 2, cz - Math.sin(ah) * 2);
    s.g.line(c0[0], c0[1], e1[0], e1[1], PI.red); s.g.line(c0[0], c0[1], e2[0], e2[1], PI.creamInk);
  });

  defineProp('lamp', fixed(3, 3, 12), function (s, o) {
    s.C(1.5, 1.5, 0, 0.6, 8, 'dark', { rim: false });
    var col = o.col || 'green';
    s.C(1.5, 1.5, 8, 1.2, 3, col, { rim: false });
    if (o.on !== false) { var p = s.g.proj(s.x + 1.5, s.y + 1.5, s.z + 10); s.g.glow(p[0], p[1] + 2, 7, col === 'red' ? PI.redT : col === 'amber' ? '#f0c264' : '#6ad79f', 0.7); }
  });

  defineProp('stool', fixed(4, 4, 7), function (s, o) {
    s.C(2, 2, 0, 0.5, 5, 'dark', { rim: false }); s.C(2, 2, 5, 1.6, 2, o.col || 'red', { rim: false });
  });

  defineProp('caliper', fixed(8, 3, 2), function (s, o) {
    var op2 = o.open === undefined ? 0.5 : o.open, k = Math.round(op2 * 4);
    s.B(0, 0, 0, 8, 1, 1, 'silver', { rim: false }); s.B(0, 0, 0, 1, 3, 2, 'silver', { rim: false });
    s.B(1 + k, 0, 0, 1, 3, 2, 'red', { rim: false });
  });

  defineProp('badge', fixed(3, 1, 5), function (s, o) {
    s.B(0, 0, 0, 3, 1, 5, 'paper', { rim: false });
    s.F(0, 3, 3, 2, o.col || PI.red, 1);
    s.F(1, 1, 1, 1, PI.st1, 1);
  });

  defineProp('ledger', fixed(14, 9, 2), function (s, o) {
    s.B(0, 0, 0, 14, 9, 1, 'dark', { shadow: true });
    s.B(1, 1, 1, 6, 7, 1, 'paper', { rim: false }); s.B(7, 1, 1, 6, 7, 1, 'paper', { rim: false });
    var n = o.lines === undefined ? 3 : o.lines, i;
    for (i = 0; i < n; i++) { s.top(2, 2 + i * 2, 4, 1, 2, PI.line); s.top(8, 2 + i * 2, 4, 1, 2, PI.line); }
    if (o.write > 0) { s.top(2, 2 + n * 2, Math.max(1, Math.round(o.write * 4)), 1, 2, PI.red); s.top(8, 2 + n * 2, Math.max(1, Math.round(o.write * 4)), 1, 2, PI.red); }
  });

  /* wall tools: shapes as lists of [du,dz,w,h] inside a slot that is 5 wide and 10 high; u is doubled on screen */
  var TOOLS = [
    [[2, 1, 1, 6], [1, 7, 3, 2]],                              /* spanner */
    [[2, 1, 1, 6], [1, 6, 3, 3]],                              /* hammer */
    [[1, 1, 1, 4], [3, 1, 1, 4], [1, 5, 3, 1], [1, 6, 1, 3], [3, 6, 1, 3]],   /* pliers */
    [[1, 1, 1, 8], [1, 1, 3, 1], [1, 8, 3, 1]],                /* square */
    [[2, 3, 1, 6], [1, 1, 3, 3]],                              /* driver */
    [[2, 1, 1, 8], [3, 7, 1, 1], [3, 5, 1, 1]]                 /* key */
  ];
  /* opts: slots (array of 0/1: tool present), flash (slot index that blinks), w, h */
  defineProp('shadowboard', function (o) { return [o.w || 26, 2, o.h || 22]; }, function (s, o) {
    var w = s.w, h = s.h, cols = Math.floor((w - 1) / 6), rows = Math.floor((h - 3) / 11), i, j, k, n = 0;
    s.B(0, 0, 0, w, 2, h, 'dark', { rim: false });
    s.F(1, 1, w - 2, h - 2, { fill: '#d9d2c2', border: PI.st3 }, 2);
    for (j = 0; j < rows; j++) for (i = 0; i < cols; i++) {
      var present = o.slots ? o.slots[n] : true, shape = TOOLS[n % TOOLS.length], u0 = 1 + i * 6 + 1, z0 = h - 14 - j * 11 + 2;
      var flash = o.flash === n, on = flash && Math.floor((o.t || 0) * 6) % 2 === 0;
      s.F(u0, z0, 5, 10, { fill: present ? '#c7bfae' : '#e9c6c0', border: present ? '#9c9484' : PI.red }, 2);
      var col = present ? (flash ? PI.greenD : '#3d444a') : PI.red2;
      for (k = 0; k < shape.length; k++) s.F(u0 + shape[k][0], z0 + shape[k][1], shape[k][2], shape[k][3], present ? col : '#d99a92', 2);
      if (on) s.F(u0, z0, 5, 10, { fill: present ? '#9fe0bd' : '#f4a29a', border: present ? PI.greenD : PI.red }, 2);
      n++;
    }
    s.F(1, h - 3, w - 2, 2, PI.red, 2);
  });

  defineProp('outboard', function (o) { return [o.w || 18, 2, o.h || 16]; }, function (s, o) {
    var w = s.w, h = s.h, rows = o.rows || 5, i, half = Math.floor(w / 2);
    s.B(0, 0, 0, w, 2, h, 'dark', { rim: false });
    s.F(1, 1, w - 2, h - 2, { fill: PI.cream, border: PI.st3 }, 2);
    s.F(2, h - 5, half - 3, 3, PI.st1, 2); s.F(half + 1, h - 5, half - 3, 3, PI.red, 2);
    s.F(half, 2, 1, h - 7, PI.st3, 2);
    for (i = 0; i < rows; i++) {
      var yy = h - 8 - i * 2, st = o.state ? o.state[i] : 0;
      s.F(2, yy, half - 3, 1, '#c9c2b2', 2);
      if (st === 1) s.F(half + 2, yy - 1, half - 4, 2, PI.red, 2);
      else if (st === 3) s.F(half + 2, yy - 1, half - 4, 2, PI.amber, 2);
      else if (st === 2) s.F(2, yy - 1, half - 3, 2, PI.greenD, 2);
      else s.F(2, yy - 1, half - 3, 2, PI.st1, 2);
    }
  });

  var ISO = { P: P, M: M, make: make, mix: mix, rnd: rnd, BAYER: BAYER, frontOf: frontOf, boxesIntersect: boxesIntersect, defineProp: defineProp, PROPS: PROPS, C: C, version: '1.1' };
  root.ISO = ISO;
  if (typeof module !== 'undefined' && module.exports) module.exports = ISO;
})(typeof window !== 'undefined' ? window : this);
