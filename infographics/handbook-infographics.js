/*
 * Handbook infographics — navigation map, policy drawings, "how answers work".
 *
 * Method: EpicInfographics (github.com/OrRon/EpicInfographics, MIT), Blueprint
 * design language translated into the handbook brand: a graphite engineering
 * sheet, silver linework, Oswald display + Inter annotation, red reserved for
 * data marks. Composition: "Big Object" (the routing drawing) for navigation,
 * "Specimen sheet" figures inside section cards.
 *
 * Rules kept:
 *   - Every number comes from the handbook text and every figure cites its section.
 *     The section text below each figure governs; figures never add policy.
 *   - Geometry is computed from values (area ∝ count, length ∝ hours/weeks).
 *   - Live text (no baked images), keyboard reachable, works offline.
 *
 * Inlined into Advanced_Handbook_Dashboard.html by `node infographics/inline.mjs`.
 * Edit here, not in the HTML.
 */
(function () {
  'use strict';

  var uid = 0;
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function t(x, y, s, cls, extra) {
    return '<text x="' + x + '" y="' + y + '" class="' + (cls || '') + '" ' + (extra || '') + '>' + esc(s) + '</text>';
  }
  function r1(n) { return Math.round(n * 10) / 10; }

  /* ---------------------------------------------------------------- sheet */
  // Shared defs per SVG (ids are unique per drawing so hidden copies never break refs).
  function defs(p) {
    return '<defs>' +
      '<pattern id="' + p + 'g" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" class="hb-gridline"/></pattern>' +
      '<pattern id="' + p + 'h" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="1.6" height="7" class="hb-hatch"/></pattern>' +
      '<pattern id="' + p + 'hr" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="2" height="6" class="hb-hatch-red"/></pattern>' +
      '<marker id="' + p + 'a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1L10 5L0 9z" class="hb-arrowhead"/></marker>' +
      '<marker id="' + p + 'ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1L10 5L0 9z" class="hb-arrowhead-red"/></marker>' +
      '</defs>';
  }
  function cross(x, y) {
    return '<path d="M' + (x - 6) + ' ' + y + 'H' + (x + 6) + 'M' + x + ' ' + (y - 6) + 'V' + (y + 6) + '" class="hb-reg"/>';
  }
  // Double-rule sheet with grid, registration crosses and a figure strip (title block).
  function sheet(p, W, H, fig, source) {
    var s = defs(p) +
      '<rect width="' + W + '" height="' + H + '" class="hb-paper"/>' +
      '<rect x="8" y="8" width="' + (W - 16) + '" height="' + (H - 16) + '" fill="url(#' + p + 'g)"/>' +
      '<rect x="8" y="8" width="' + (W - 16) + '" height="' + (H - 16) + '" class="hb-frame"/>' +
      '<rect x="12" y="12" width="' + (W - 24) + '" height="' + (H - 24) + '" class="hb-frame-in"/>' +
      cross(26, 26) + cross(W - 26, 26) + cross(26, H - 26);
    if (fig) {
      var y = H - 40;
      s += '<line x1="12" y1="' + y + '" x2="' + (W - 12) + '" y2="' + y + '" class="hb-frame-in"/>' +
        t(26, y + 18, fig, 'hb-tb-key') +
        t(W - 26, y + 18, source, 'hb-tb', 'text-anchor="end"');
    }
    return s;
  }
  function svgOpen(W, H, label, cls) {
    var id = 'hbt' + (++uid);
    return '<svg class="hb-svg ' + (cls || '') + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="' + id + '">' +
      '<title id="' + id + '">' + esc(label) + '</title>';
  }
  // Horizontal dimension line with end ticks, arrowheads and a knockout label.
  function dim(p, x1, x2, y, label, red) {
    var m = red ? 'ar' : 'a', w = Math.max(40, label.length * 7.4 + 14), cx = (x1 + x2) / 2;
    return '<g class="hb-dim' + (red ? ' red' : '') + '">' +
      '<line x1="' + x1 + '" y1="' + (y - 9) + '" x2="' + x1 + '" y2="' + (y + 9) + '"/>' +
      '<line x1="' + x2 + '" y1="' + (y - 9) + '" x2="' + x2 + '" y2="' + (y + 9) + '"/>' +
      '<line x1="' + (x1 + 1) + '" y1="' + y + '" x2="' + (x2 - 1) + '" y2="' + y + '" marker-start="url(#' + p + m + ')" marker-end="url(#' + p + m + ')"/>' +
      '<rect x="' + (cx - w / 2) + '" y="' + (y - 10) + '" width="' + w + '" height="20" class="hb-knock"/>' +
      t(cx, y + 4.5, label, 'hb-dimlabel', 'text-anchor="middle"') + '</g>';
  }

  /* ---------------------------------------------------------------- navigation map */
  var CHAPTERS = [
    { cat: 'Welcome & Company', l1: 'Welcome &', l2: 'Company' },
    { cat: 'Hiring & Orientation', l1: 'Hiring &', l2: 'Orientation' },
    { cat: 'Pay & Hours', l1: 'Pay &', l2: 'Hours' },
    { cat: 'Performance & Conduct', l1: 'Performance', l2: '& Conduct' },
    { cat: 'Workplace Policies', l1: 'Workplace', l2: 'Policies' },
    { cat: 'Benefits & Leave', l1: 'Benefits &', l2: 'Leave' },
    { cat: 'Safety', l1: 'Safety', l2: '' },
    { cat: 'Trade Secrets', l1: 'Trade', l2: 'Secrets' },
    { cat: 'Closing', l1: 'Closing', l2: '' },
  ];

  function countChapters(sections) {
    return CHAPTERS.map(function (c) {
      var all = sections.filter(function (s) { return s.category === c.cat; });
      var ok = all.filter(function (s) { return String(s.id).indexOf('OK-') === 0; }).length;
      return { cat: c.cat, l1: c.l1, l2: c.l2, n: all.length, ok: ok };
    });
  }

  // Station: circle whose AREA is proportional to sections; hatched red wedge = Oklahoma share.
  function station(p, x, y, r, ch, i) {
    var g = '<g class="hb-stop" tabindex="0" role="button" data-cat="' + esc(ch.cat) + '" aria-label="Open ' + esc(ch.cat) + ', ' + ch.n + ' sections">' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + r1(r + 9) + '" class="hb-stop-hit"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + r1(r) + '" class="hb-stop-ring"/>';
    if (ch.ok) {
      var a = (ch.ok / ch.n) * Math.PI * 2, sx = x, sy = y - r,
        ex = x + r * Math.sin(a), ey = y - r * Math.cos(a), large = a > Math.PI ? 1 : 0;
      g += '<path d="M' + x + ' ' + y + 'L' + r1(sx) + ' ' + r1(sy) + 'A' + r1(r) + ' ' + r1(r) + ' 0 ' + large + ' 1 ' + r1(ex) + ' ' + r1(ey) + 'Z" fill="url(#' + p + 'hr)" class="hb-wedge"/>';
    }
    g += '<circle cx="' + x + '" cy="' + y + '" r="3.5" class="hb-stop-core"/>';
    return { open: g, close: '</g>' };
  }

  function navMapWide(sections) {
    var p = 'nw' + (++uid) + '-', W = 1160, H = 480, Y = 262;
    var ch = countChapters(sections), max = Math.max.apply(null, ch.map(function (c) { return c.n; }));
    var k = 44 / Math.sqrt(max), x0 = 92, step = (1068 - x0) / 8;
    var total = sections.length;
    var s = svgOpen(W, H, 'Handbook route map: nine chapters from Welcome to Closing, sized by number of sections. Select a chapter to open it.', 'hb-nav-wide') +
      sheet(p, W, H, null, null);
    // title + hero
    s += t(40, 66, 'Your path through Advanced', 'hb-title') +
      t(40, 92, 'The handbook drawn as a shop routing — one station per chapter, sized by how many sections it holds.', 'hb-sub') +
      t(40, 112, 'Select a station to open that chapter.', 'hb-sub') +
      t(1120, 128, String(total), 'hb-hero', 'text-anchor="end" data-hero') +
      t(1120, 158, 'Sections · one route · effective 01.01.2026', 'hb-cap', 'text-anchor="end"');
    // route line with flow chevrons
    s += '<line x1="' + (x0 - 40) + '" y1="' + Y + '" x2="' + (x0 + step * 8 + 34) + '" y2="' + Y + '" class="hb-route"/>';
    for (var cx = x0 - 20; cx < x0 + step * 8 + 20; cx += 24) {
      s += '<path d="M' + cx + ' ' + (Y - 4) + 'l5 4l-5 4" class="hb-chevron"/>';
    }
    // dimension across the whole route
    s += dim(p, x0, x0 + step * 8, 186, 'Nine chapters · hire to separation');
    // stations
    var okXs = [];
    ch.forEach(function (c, i) {
      var x = x0 + step * i, r = k * Math.sqrt(c.n), st = station(p, x, Y, r, c, i);
      s += st.open +
        t(x, Y - r - 12, 'OP ' + ((i + 1) * 10), 'hb-op', 'text-anchor="middle"') +
        t(x, Y + 66, c.l1, 'hb-name', 'text-anchor="middle"') +
        (c.l2 ? t(x, Y + 86, c.l2, 'hb-name', 'text-anchor="middle"') : '') +
        t(x, Y + (c.l2 ? 108 : 88), c.n + (c.n === 1 ? ' section' : ' sections'), 'hb-cap', 'text-anchor="middle"') +
        st.close;
      if (c.ok) okXs.push({ x: x, ok: c.ok, y: Y + (c.l2 ? 116 : 96) });
    });
    // Oklahoma supplement lane
    var LY = 410;
    if (okXs.length) {
      s += t(40, LY + 4, 'Oklahoma supplement', 'hb-lane');
      s += '<line x1="' + (okXs[0].x - 34) + '" y1="' + LY + '" x2="' + (okXs[okXs.length - 1].x + 34) + '" y2="' + LY + '" class="hb-lane-line"/>';
      okXs.forEach(function (o) {
        s += '<path d="M' + o.x + ' ' + (o.y + 2) + 'V' + (LY - 9) + '" class="hb-leader"/>' +
          '<rect x="' + (o.x - 15) + '" y="' + (LY - 9) + '" width="30" height="18" class="hb-oktag"/>' +
          t(o.x, LY + 4.5, '+' + o.ok, 'hb-oktext', 'text-anchor="middle"');
      });
    }
    // legend + title block
    s += '<g transform="translate(40 446)">' +
      '<circle cx="8" cy="-4" r="8" class="hb-stop-ring"/>' + t(24, 0, 'Circle area = number of sections', 'hb-cap') +
      '<rect x="238" y="-12" width="16" height="16" fill="url(#' + p + 'hr)" class="hb-wedge"/>' + t(262, 0, 'Oklahoma share of that chapter', 'hb-cap') +
      '</g>';
    s += '<g class="hb-tblock"><rect x="842" y="420" width="296" height="44" class="hb-tb-box"/>' +
      '<line x1="842" y1="442" x2="1138" y2="442" class="hb-frame-in"/>' +
      t(852, 436, 'Employee Handbook · Navigation', 'hb-tb-key') + t(1128, 436, 'Sheet 1', 'hb-tb', 'text-anchor="end"') +
      t(852, 457, 'Source: handbook sections 1.0 – 9.1 + supplements', 'hb-tb') + '</g>';
    return s + '</svg>';
  }

  function navMapNarrow(sections) {
    var p = 'nn' + (++uid) + '-', W = 380, top = 168, gap = 84, X = 62;
    var ch = countChapters(sections), max = Math.max.apply(null, ch.map(function (c) { return c.n; }));
    var k = 28 / Math.sqrt(max), H = top + gap * 8 + 120;
    var s = svgOpen(W, H, 'Handbook route map: nine chapters, sized by number of sections. Select a chapter to open it.', 'hb-nav-narrow') +
      sheet(p, W, H, null, null);
    s += t(28, 56, 'Your path', 'hb-title') + t(28, 84, 'through Advanced', 'hb-title') +
      t(352, 78, String(sections.length), 'hb-hero-sm', 'text-anchor="end" data-hero') +
      t(352, 98, 'Sections', 'hb-cap', 'text-anchor="end"') +
      t(28, 120, 'One station per chapter, sized by how', 'hb-sub') +
      t(28, 138, 'many sections it holds. Tap to open.', 'hb-sub');
    s += '<line x1="' + X + '" y1="' + (top - 26) + '" x2="' + X + '" y2="' + (top + gap * 8 + 26) + '" class="hb-route"/>';
    for (var cy = top - 12; cy < top + gap * 8 + 12; cy += 22) {
      s += '<path d="M' + (X - 4) + ' ' + cy + 'l4 5l4 -5" class="hb-chevron"/>';
    }
    ch.forEach(function (c, i) {
      var y = top + gap * i, r = k * Math.sqrt(c.n), st = station(p, X, y, r, c, i);
      s += st.open +
        '<rect x="' + (X + 34) + '" y="' + (y - 30) + '" width="' + (W - X - 60) + '" height="58" class="hb-stop-hit"/>' +
        t(X + 44, y - 8, 'OP ' + ((i + 1) * 10), 'hb-op') +
        t(X + 44, y + 14, c.cat, 'hb-name') +
        t(352, y - 8, c.n + (c.n === 1 ? ' section' : ' sections'), 'hb-cap', 'text-anchor="end"') +
        (c.ok ? '<rect x="' + (352 - 46) + '" y="' + (y + 2) + '" width="46" height="18" class="hb-oktag"/>' +
          t(352 - 23, y + 15.5, '+' + c.ok + ' OK', 'hb-oktext', 'text-anchor="middle"') : '') +
        st.close;
    });
    var ly = top + gap * 8 + 64;
    s += '<rect x="28" y="' + (ly - 13) + '" width="16" height="16" fill="url(#' + p + 'hr)" class="hb-wedge"/>' +
      t(52, ly, 'Hatched wedge / OK tag = Oklahoma supplement', 'hb-cap') +
      t(28, ly + 22, 'Circle area = number of sections', 'hb-cap');
    return s + '</svg>';
  }

  /* ---------------------------------------------------------------- policy drawings */
  var W = 640;
  var FIGS = {};

  // 7.14 — PTO accrual staircase (values from the accrual table).
  FIGS['7.14'] = function () {
    var p = 'f' + (++uid) + '-', H = 580;
    var tiers = [[0.5, 1, 24, '3 days · 24 h'], [1, 3, 80, '10 days · 80 h'], [3, 5, 120, '15 days · 120 h'], [5, 6.6, 144, '18 days · 144 h']];
    var X0 = 64, PX = 76, Y0 = 290, PH = 1.15; // px per year, px per hour
    var s = svgOpen(W, H, 'PTO accrual by years of service: none in the first 6 months, then 24, 80, 120 and 144 hours per year.') +
      sheet(p, W, H, 'Fig. 7.14 · PTO accrual', 'Source: Section 7.14 — the text below governs');
    s += t(32, 54, 'Paid time off grows with service', 'hb-ftitle') +
      t(32, 78, 'Full-time employees normally working 30+ h/week. Earned on hours worked;', 'hb-sub') +
      t(32, 96, 'each year’s amount is reached within 39 weeks.', 'hb-sub');
    // axis
    s += '<line x1="' + X0 + '" y1="' + Y0 + '" x2="' + (X0 + PX * 6.9) + '" y2="' + Y0 + '" class="hb-axis" marker-end="url(#' + p + 'a)"/>';
    [0, 0.5, 1, 3, 5].forEach(function (yv) {
      var x = X0 + PX * yv;
      s += '<line x1="' + x + '" y1="' + Y0 + '" x2="' + x + '" y2="' + (Y0 + 6) + '" class="hb-axis"/>' +
        t(x, Y0 + 22, yv === 0 ? 'Hire' : yv === 0.5 ? '6 mo' : yv + ' yr', 'hb-cap', 'text-anchor="middle"');
    });
    s += t(X0 + PX * 6.9, Y0 + 22, 'Years of service', 'hb-cap', 'text-anchor="end"');
    // no-accrual zone
    s += '<rect x="' + X0 + '" y="' + (Y0 - 40) + '" width="' + (PX * 0.5) + '" height="40" fill="url(#' + p + 'h)" class="hb-zone"/>';
    s += t(X0, Y0 + 42, 'Hatched: first 6 months, no accrual yet', 'hb-cap');
    tiers.forEach(function (tr, i) {
      var x = X0 + PX * tr[0], w = PX * (tr[1] - tr[0]) - 3, h = tr[2] * PH, last = i === tiers.length - 1;
      s += '<rect x="' + x + '" y="' + (Y0 - h) + '" width="' + w + '" height="' + h + '" class="' + (last ? 'hb-bar-red' : 'hb-bar') + '"/>' +
        t(x + w / 2, Y0 - h - 10, tr[3], 'hb-val', 'text-anchor="middle"');
    });
    s += t(X0 + PX * 6.6, Y0 - 144 * PH + 18, '5+ years →', 'hb-cap', 'text-anchor="end"');
    // shift usage: widths proportional to hours
    var sy = 356;
    s += t(32, sy, 'A missed day uses one full shift of PTO', 'hb-h');
    [[8, '8-hour shift'], [10, '10-hour shift'], [12, '12-hour shift']].forEach(function (sh, i) {
      var y = sy + 18 + i * 28, w = sh[0] * 16;
      s += '<rect x="32" y="' + y + '" width="' + w + '" height="18" class="hb-bar"/>' +
        t(32 + w + 10, y + 14, sh[0] + ' h — ' + sh[1], 'hb-val');
    });
    // cash-out callout
    s += '<g transform="translate(32 462)"><rect width="576" height="64" class="hb-callout"/>' +
      t(14, 24, 'Cash-out · 3+ years of service', 'hb-h') +
      t(14, 48, 'Up to 40 h on your anniversary · 30 days’ written notice · manager approval', 'hb-note') + '</g>';
    return s + '</svg>';
  };

  // 7.11 — Holidays.
  FIGS['7.11'] = function () {
    var p = 'f' + (++uid) + '-', H = 360;
    var s = svgOpen(W, H, 'Seven company holidays, in addition to PTO. Saturday holidays move to Friday, Sunday holidays to Monday.') +
      sheet(p, W, H, 'Fig. 7.11 · Holidays', 'Source: Section 7.11 — the text below governs');
    s += t(32, 54, 'Seven company holidays', 'hb-ftitle') + t(32, 78, 'Holiday time off is in addition to PTO.', 'hb-sub');
    for (var i = 0; i < 7; i++) {
      var x = 50 + i * 40;
      s += '<rect x="' + (x - 14) + '" y="100" width="28" height="32" class="hb-bar-red"/><rect x="' + (x - 14) + '" y="100" width="28" height="8" class="hb-cal-top"/>';
    }
    s += t(330, 124, '7', 'hb-hero-sm', 'data-hero') + t(372, 112, 'per year', 'hb-cap') + t(372, 128, 'company-observed', 'hb-cap');
    // weekend rule
    var cells = ['Fri', 'Sat', 'Sun', 'Mon'], cx0 = 40, cw = 70, cy = 176;
    cells.forEach(function (c, i) {
      s += '<rect x="' + (cx0 + i * cw) + '" y="' + cy + '" width="' + (cw - 6) + '" height="40" class="hb-cell"/>' +
        t(cx0 + i * cw + (cw - 6) / 2, cy + 25, c, 'hb-name', 'text-anchor="middle"');
    });
    s += '<path d="M' + (cx0 + cw * 1 + 30) + ' ' + (cy + 46) + 'C' + (cx0 + cw + 30) + ' ' + (cy + 76) + ' ' + (cx0 + 32) + ' ' + (cy + 76) + ' ' + (cx0 + 32) + ' ' + (cy + 48) + '" class="hb-flow" marker-end="url(#' + p + 'ar)"/>' +
      '<path d="M' + (cx0 + cw * 2 + 30) + ' ' + (cy + 46) + 'C' + (cx0 + cw * 2 + 30) + ' ' + (cy + 76) + ' ' + (cx0 + cw * 3 + 32) + ' ' + (cy + 76) + ' ' + (cx0 + cw * 3 + 32) + ' ' + (cy + 48) + '" class="hb-flow" marker-end="url(#' + p + 'ar)"/>' +
      t(cx0, cy + 100, 'Saturday holiday → observed Friday · Sunday holiday → observed Monday', 'hb-note');
    // eligibility
    s += '<g transform="translate(340 166)"><rect width="268" height="94" class="hb-callout"/>' +
      t(12, 22, 'To be paid for a holiday', 'hb-h') +
      t(12, 44, '· Full-time, 90 days continuous', 'hb-note') +
      t(12, 62, '· Work your full shift before', 'hb-note') +
      t(12, 80, '  and after (unless arranged)', 'hb-note') + '</g>';
    return s + '</svg>';
  };

  // 4.7 — Recording time: four punches around the meal period.
  FIGS['4.7'] = function () {
    var p = 'f' + (++uid) + '-', H = 350;
    var s = svgOpen(W, H, 'Record time at four points: before your shift, before your meal, after your meal, and after work.') +
      sheet(p, W, H, 'Fig. 4.7 · Recording time', 'Source: Section 4.7 — the text below governs');
    s += t(32, 54, 'Four punches, every shift', 'hb-ftitle') + t(32, 78, 'Plus a punch out and in for any other time away from work.', 'hb-sub');
    var y = 168, a = 40, b = 290, c = 360, d = 600;
    s += '<rect x="' + a + '" y="' + (y - 14) + '" width="' + (b - a) + '" height="28" class="hb-bar"/>' +
      '<rect x="' + b + '" y="' + (y - 14) + '" width="' + (c - b) + '" height="28" fill="url(#' + p + 'h)" class="hb-zone"/>' +
      '<rect x="' + c + '" y="' + (y - 14) + '" width="' + (d - c) + '" height="28" class="hb-bar"/>' +
      t((a + b) / 2, y + 5, 'Work', 'hb-name', 'text-anchor="middle"') + t((b + c) / 2, y + 5, 'Meal', 'hb-name', 'text-anchor="middle"') +
      t((c + d) / 2, y + 5, 'Work', 'hb-name', 'text-anchor="middle"');
    [[a, '1', 'Before your shift'], [b, '2', 'Before your meal'], [c, '3', 'After your meal'], [d, '4', 'After work']].forEach(function (k, i) {
      var up = i % 2 === 0, ly = up ? y - 48 : y + 56;
      s += '<line x1="' + k[0] + '" y1="' + (y - 22) + '" x2="' + k[0] + '" y2="' + (y + 22) + '" class="hb-punch"/>' +
        '<circle cx="' + k[0] + '" cy="' + (up ? y - 34 : y + 34) + '" r="11" class="hb-punch-dot"/>' +
        t(k[0], (up ? y - 30 : y + 38), k[1], 'hb-punch-n', 'text-anchor="middle"') +
        t(k[0], ly + (up ? -8 : 10), k[2], 'hb-cap', 'text-anchor="' + (i === 0 ? 'start' : i === 3 ? 'end' : 'middle') + '"');
    });
    s += '<g transform="translate(32 256)"><rect width="576" height="40" class="hb-callout red"/>' +
      t(14, 25, 'Working “off the clock” counts as falsifying time — report pay errors to HR.', 'hb-note') + '</g>';
    return s + '</svg>';
  };

  // 3.6 — Introductory period.
  FIGS['3.6'] = function () {
    var p = 'f' + (++uid) + '-', H = 250;
    var s = svgOpen(W, H, 'The first 90 days of employment are an introductory period.') +
      sheet(p, W, H, 'Fig. 3.6 · Introductory period', 'Source: Section 3.6 — the text below governs');
    s += t(32, 54, 'The first 90 days', 'hb-ftitle') + t(32, 78, 'Learn the company and the job; your manager reviews fit and performance.', 'hb-sub');
    s += '<rect x="40" y="112" width="560" height="26" fill="url(#' + p + 'h)" class="hb-zone"/>' +
      '<line x1="40" y1="104" x2="40" y2="146" class="hb-punch"/>' + t(40, 162, 'Day 1', 'hb-cap') +
      '<line x1="600" y1="104" x2="600" y2="146" class="hb-punch"/>' + t(600, 162, 'Day 90', 'hb-cap', 'text-anchor="end"') +
      dim(p, 40, 600, 186, '90 days · may be shortened or lengthened by management and HR', true);
    return s + '</svg>';
  };

  // 5.3 — Open door ladder.
  FIGS['5.3'] = function () {
    var p = 'f' + (++uid) + '-', H = 360;
    var s = svgOpen(W, H, 'Raise a concern with your manager first; go to HR or upper-level management if that does not resolve it or if your manager is the source.') +
      sheet(p, W, H, 'Fig. 5.3 · Open door', 'Source: Section 5.3 — the text below governs');
    s += t(32, 54, 'Where to take a concern', 'hb-ftitle') + t(32, 78, 'Most problems are solved in a conversation with your manager.', 'hb-sub');
    function node(x, y, w, l1, l2, red) {
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="56" class="' + (red ? 'hb-node red' : 'hb-node') + '"/>' +
        t(x + w / 2, y + (l2 ? 24 : 34), l1, 'hb-name', 'text-anchor="middle"') +
        (l2 ? t(x + w / 2, y + 44, l2, 'hb-cap', 'text-anchor="middle"') : '');
    }
    s += node(32, 110, 136, 'You', 'describe the problem') + node(214, 110, 140, 'Your manager', 'first stop') +
      node(424, 110, 184, 'HR or upper-level', 'management', true);
    s += '<line x1="170" y1="138" x2="210" y2="138" class="hb-flow" marker-end="url(#' + p + 'a)"/>' +
      '<line x1="356" y1="138" x2="420" y2="138" class="hb-flow" marker-end="url(#' + p + 'a)"/>' +
      t(388, 128, 'not', 'hb-cap', 'text-anchor="middle"') + t(388, 158, 'resolved', 'hb-cap', 'text-anchor="middle"');
    s += '<path d="M100 168V200H516V170" class="hb-flow red" marker-end="url(#' + p + 'ar)"/>' +
      t(320, 220, 'Go straight here if your manager is the source of the problem', 'hb-note', 'text-anchor="middle"');
    s += t(32, 262, 'Bring', 'hb-h');
    ['The problem', 'Who is involved', 'What you have tried', 'Your suggested fix'].forEach(function (b, i) {
      var x = 32 + i * 146;
      s += '<rect x="' + x + '" y="274" width="136" height="30" class="hb-cell"/>' + t(x + 68, 294, b, 'hb-note', 'text-anchor="middle"');
    });
    return s + '</svg>';
  };

  // 5.9 — Resignation notice (lengths proportional to weeks).
  FIGS['5.9'] = function () {
    var p = 'f' + (++uid) + '-', H = 400, PW = 85;
    var s = svgOpen(W, H, 'Give at least two weeks notice of resignation, or four weeks if you are a manager, in writing.') +
      sheet(p, W, H, 'Fig. 5.9 · Resigning', 'Source: Sections 5.9 and 7.14 — the text below governs');
    s += t(32, 54, 'Leaving well', 'hb-ftitle') + t(32, 78, 'Give written notice to your manager.', 'hb-sub');
    s += t(32, 124, 'Employees', 'hb-name') + '<rect x="160" y="110" width="' + (2 * PW) + '" height="20" class="hb-bar"/>' + t(170 + 2 * PW, 125, '2 weeks minimum', 'hb-val');
    s += t(32, 164, 'Managers', 'hb-name') + '<rect x="160" y="150" width="' + (4 * PW) + '" height="20" class="hb-bar-red"/>' + t(170 + 4 * PW, 165, '4 weeks minimum', 'hb-val');
    s += '<line x1="160" y1="186" x2="' + (160 + 4 * PW) + '" y2="186" class="hb-axis"/>';
    for (var wk = 0; wk <= 4; wk++) s += '<line x1="' + (160 + wk * PW) + '" y1="182" x2="' + (160 + wk * PW) + '" y2="190" class="hb-axis"/>' + t(160 + wk * PW, 206, wk + ' wk', 'hb-cap', 'text-anchor="middle"');
    var items = [['Return all company property', 'at separation'], ['Keep your address current', 'for year-end tax forms'], ['Unused accrued PTO is paid', 'with 2 weeks’ notice, worked if asked (§7.14)']];
    items.forEach(function (it, i) {
      var y = 226 + i * 44;
      s += '<rect x="32" y="' + y + '" width="576" height="36" class="hb-cell"/>' +
        '<circle cx="50" cy="' + (y + 18) + '" r="4" class="hb-punch-dot"/>' +
        t(66, y + 23, it[0], 'hb-note') + t(596, y + 23, it[1], 'hb-cap', 'text-anchor="end"');
    });
    return s + '</svg>';
  };

  // OK — Overtime.
  FIGS['OK-Overtime'] = function () {
    var p = 'f' + (++uid) + '-', H = 290;
    var s = svgOpen(W, H, 'Nonexempt overtime is paid at one and one-half times the regular rate for hours over 40 in a workweek, approved in advance in writing.') +
      sheet(p, W, H, 'Fig. OK · Overtime', 'Source: Oklahoma supplement — text below governs');
    s += t(32, 54, 'Over 40 hours in a workweek', 'hb-ftitle') + t(32, 78, 'Nonexempt employees · approved in advance, in writing, by your manager.', 'hb-sub');
    var x0 = 40, px = 10; // px per hour
    s += '<rect x="' + x0 + '" y="108" width="' + (40 * px) + '" height="32" class="hb-bar"/>' +
      t(x0 + 20 * px, 129, 'Regular rate', 'hb-name', 'text-anchor="middle"') +
      '<rect x="' + (x0 + 40 * px) + '" y="108" width="' + (8 * px) + '" height="32" class="hb-bar-red"/>' +
      '<path d="M' + (x0 + 48 * px) + ' 108l14 16l-14 16" class="hb-flow red"/>' +
      t(x0 + 48 * px + 24, 129, '1.5× rate', 'hb-val');
    s += dim(p, x0, x0 + 40 * px, 166, '40 hours');
    s += '<g transform="translate(32 196)"><rect width="576" height="44" class="hb-callout"/>' +
      t(14, 27, 'Holidays, vacation and sick days do not count as time worked for overtime.', 'hb-note') + '</g>';
    return s + '</svg>';
  };

  // OK — Disciplinary process.
  FIGS['OK-Disciplinary Process'] = function () {
    var p = 'f' + (++uid) + '-', H = 300;
    var s = svgOpen(W, H, 'Discipline usually progresses from a verbal warning to written warnings to demotion, transfer, forced leave or termination, but steps may be skipped.') +
      sheet(p, W, H, 'Fig. OK · Disciplinary process', 'Source: Oklahoma supplement — text below governs');
    s += t(32, 54, 'How discipline usually progresses', 'hb-ftitle') + t(32, 78, 'You will normally be allowed to respond to any action taken.', 'hb-sub');
    var steps = [['Verbal', 'warning'], ['Written', 'warning(s)'], ['Demotion, transfer,', 'forced leave or termination']];
    var xs = [32, 214, 396], ws = [160, 160, 212];
    steps.forEach(function (st, i) {
      s += '<rect x="' + xs[i] + '" y="108" width="' + ws[i] + '" height="58" class="' + (i === 2 ? 'hb-node red' : 'hb-node') + '"/>' +
        t(xs[i] + ws[i] / 2, 132, st[0], 'hb-name', 'text-anchor="middle"') + t(xs[i] + ws[i] / 2, 152, st[1], 'hb-cap', 'text-anchor="middle"');
      if (i < 2) s += '<line x1="' + (xs[i] + ws[i] + 2) + '" y1="137" x2="' + (xs[i + 1] - 4) + '" y2="137" class="hb-flow" marker-end="url(#' + p + 'a)"/>';
    });
    s += '<path d="M112 174V206H502V172" class="hb-flow red dashed" marker-end="url(#' + p + 'ar)"/>' +
      t(307, 230, 'Steps may be skipped — progressive discipline is not required', 'hb-note', 'text-anchor="middle"');
    return s + '</svg>';
  };

  // 7.8 — FMLA eligibility (all three) and leave length (bars ∝ weeks).
  FIGS['7.8'] = function () {
    var p = 'f' + (++uid) + '-', H = 380, PW = 20;
    var s = svgOpen(W, H, 'FMLA eligibility needs 12 months of service, 1,250 hours in the last 12 months, and a worksite with 50 or more employees within 75 miles. Up to 12 weeks, or 26 weeks for military caregiver leave, unpaid and job-protected.') +
      sheet(p, W, H, 'Fig. 7.8 · Family and medical leave', 'Source: Section 7.8 — the text below governs');
    s += t(32, 54, 'Eligible when all three are true', 'hb-ftitle');
    var g = [['12 months', 'worked here, not', 'necessarily consecutive'], ['1,250 hours', 'worked in the last', '12 months'], ['50+ employees', 'at a worksite', 'within 75 miles']];
    g.forEach(function (it, i) {
      var x = 32 + i * 197;
      s += '<rect x="' + x + '" y="76" width="182" height="90" class="hb-node"/>' +
        t(x + 14, 104, it[0], 'hb-val') + t(x + 14, 128, it[1], 'hb-note') + t(x + 14, 148, it[2], 'hb-note');
      if (i < 2) s += t(x + 189.5, 128, '+', 'hb-and', 'text-anchor="middle"');
    });
    s += t(32, 206, 'Leave in a 12-month period · unpaid · job-protected', 'hb-h');
    s += '<rect x="32" y="222" width="' + (12 * PW) + '" height="24" class="hb-bar"/>' + t(42 + 12 * PW, 239, 'Up to 12 weeks — birth, placement, serious health', 'hb-note');
    s += t(42 + 12 * PW, 257, 'condition, qualifying military exigency', 'hb-cap');
    s += '<rect x="32" y="272" width="' + (26 * PW) + '" height="24" class="hb-bar-red"/>' + t(42, 289, 'Up to 26 weeks', 'hb-name');
    s += t(32, 314, 'Caring for a covered service member with a serious injury or illness from active duty', 'hb-cap');
    return s + '</svg>';
  };

  // 7.2 — Bereavement.
  FIGS['7.2'] = function () {
    var p = 'f' + (++uid) + '-', H = 380;
    var s = svgOpen(W, H, 'Two days of paid bereavement leave for the death of an immediate family member, for full-time employees after 90 days.') +
      sheet(p, W, H, 'Fig. 7.2 · Bereavement leave', 'Source: Section 7.2 — the text below governs');
    s += t(32, 54, 'Time for family', 'hb-ftitle') + t(32, 78, 'Full-time employees after 90 days of employment.', 'hb-sub');
    s += t(32, 176, '2', 'hb-hero-sm', 'data-hero') + t(80, 152, 'days paid', 'hb-name') + t(80, 172, 'immediate family', 'hb-cap');
    var fam = ['Child', 'Spouse', 'Sister', 'Brother', 'Parents', 'Grandparents'];
    var cx = 452, cy = 186, R = 74;
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" class="hb-ring"/>' +
      t(cx, cy - 4, 'Immediate', 'hb-name', 'text-anchor="middle"') + t(cx, cy + 16, 'family', 'hb-name', 'text-anchor="middle"');
    fam.forEach(function (f, i) {
      var a = -Math.PI / 2 + i * (Math.PI * 2 / fam.length), x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
      s += '<circle cx="' + r1(x) + '" cy="' + r1(y) + '" r="5" class="hb-dot"/>' +
        t(r1(x + Math.cos(a) * 16), r1(y + Math.sin(a) * 16 + 5), f, 'hb-cap', 'text-anchor="' + (Math.cos(a) > 0.3 ? 'start' : Math.cos(a) < -0.3 ? 'end' : 'middle') + '"');
    });
    s += t(32, 302, 'Includes your spouse’s family and step / foster relations.', 'hb-note') +
      t(32, 322, 'Others: unpaid with manager approval · PTO may extend the time.', 'hb-note');
    return s + '</svg>';
  };

  /* ---------------------------------------------------------------- how answers work */
  function howItWorks() {
    var p = 'hw' + (++uid) + '-', HW = 640, H = 300;
    var s = svgOpen(HW, H, 'How the portal answers: you ask, it ranks handbook sections, quotes the best sentences, cites the section, and sends you to HR when the handbook is unclear.') +
      sheet(p, HW, H, 'How this portal answers', 'Nothing leaves this computer · no tracking');
    s += t(32, 54, 'Every answer is the handbook’s own words', 'hb-ftitle');
    var steps = [['Ask', 'plain English'], ['Rank', 'matching sections'], ['Quote', 'best sentences'], ['Cite', 'section number']];
    steps.forEach(function (st, i) {
      var x = 32 + i * 148;
      s += '<rect x="' + x + '" y="82" width="124" height="60" class="hb-node' + (i === 3 ? ' red' : '') + '"/>' +
        t(x + 62, 108, st[0], 'hb-name', 'text-anchor="middle"') + t(x + 62, 128, st[1], 'hb-cap', 'text-anchor="middle"');
      if (i < 3) s += '<line x1="' + (x + 126) + '" y1="112" x2="' + (x + 144) + '" y2="112" class="hb-flow" marker-end="url(#' + p + 'a)"/>';
    });
    s += '<path d="M106 146V180H260" class="hb-flow dashed" marker-end="url(#' + p + 'a)"/>' +
      '<rect x="264" y="164" width="184" height="34" class="hb-cell"/>' + t(356, 186, 'Not clear? Ask HR', 'hb-note', 'text-anchor="middle"') +
      t(116, 198, 'low confidence', 'hb-cap');
    s += '<rect x="32" y="216" width="30" height="20" class="hb-oktag"/>' + t(47, 230, 'OK', 'hb-oktext', 'text-anchor="middle"') +
      t(72, 231, 'Oklahoma supplement', 'hb-note') +
      t(260, 231, '/  focus search  ·  Enter ask  ·  Esc clear', 'hb-note');
    return s + '</svg>';
  }

  /* ---------------------------------------------------------------- public API */
  var FIG_TITLES = {
    '7.14': 'PTO accrual', '7.11': 'Holidays', '4.7': 'Recording time', '3.6': 'First 90 days',
    '5.3': 'Open door', '5.9': 'Resigning', 'OK-Overtime': 'Overtime (OK)',
    'OK-Disciplinary Process': 'Discipline (OK)', '7.8': 'FMLA', '7.2': 'Bereavement',
  };

  window.HBFigures = {
    has: function (id) { return !!FIGS[id]; },
    forSection: function (id) {
      if (!FIGS[id]) return '';
      return '<figure class="hb-fig"><div class="hb-fig-scroll" tabindex="0" role="group" aria-label="Drawing for this section">' + FIGS[id]() + '</div>' +
        '<figcaption><span class="hb-swipe">Swipe sideways to see the whole drawing. </span>Drawing summarises this section. If anything differs, the section text governs — ask HR.</figcaption></figure>';
    },
    list: function () { return Object.keys(FIG_TITLES).map(function (id) { return { id: id, title: FIG_TITLES[id] }; }); },
    navMap: function (sections) { return navMapWide(sections) + navMapNarrow(sections); },
    howItWorks: howItWorks,
  };

  /* ---------------------------------------------------------------- mount */
  // The app (app-logic-script) exposes window.HB = { openCategory, openSection } and
  // fires 'hb:render' after every render; nothing here touches its state directly.
  var DOC_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2.5" y="1.5" width="11" height="13"/><path d="M5 5h6M5 8h6M5 11h3"/></svg>';

  function mount() {
    var data = window.HANDBOOK_DATA;
    var nav = document.getElementById('hb-nav');
    if (!data || !nav) return;

    var strip = '<div class="hb-drawings" aria-label="Policies explained with drawings"><span class="label">Explained visually</span>' +
      window.HBFigures.list().map(function (f) {
        return '<button type="button" class="hb-drawing-btn" data-open-section="' + esc(f.id) + '">' + DOC_ICON + esc(f.title) + '</button>';
      }).join('') +
      '<button type="button" class="hb-drawing-btn hb-how" data-open-about>' + DOC_ICON + 'How answers work</button></div>';
    nav.innerHTML = window.HBFigures.navMap(data.sections) + strip;

    function openCat(el) { if (window.HB) window.HB.openCategory(el.getAttribute('data-cat')); }
    nav.addEventListener('click', function (e) {
      var stop = e.target.closest('.hb-stop');
      if (stop) return openCat(stop);
      var sec = e.target.closest('[data-open-section]');
      if (sec && window.HB) return window.HB.openSection(sec.getAttribute('data-open-section'));
      if (e.target.closest('[data-open-about]')) {
        var b = document.getElementById('open-about-btn');
        if (b) b.click();
      }
    });
    nav.addEventListener('keydown', function (e) {
      var stop = e.target.closest('.hb-stop');
      if (stop && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openCat(stop); }
    });
    document.addEventListener('hb:render', function (e) {
      var cat = (e.detail && e.detail.category) || '';
      nav.querySelectorAll('.hb-stop').forEach(function (g) {
        g.classList.toggle('is-active', !!cat && g.getAttribute('data-cat') === cat);
      });
    });

    var about = document.querySelector('#about-modal .modal-body');
    if (about && !about.querySelector('.hb-how-fig')) {
      var fig = document.createElement('figure');
      fig.className = 'hb-fig hb-how-fig';
      fig.innerHTML = howItWorks();
      about.insertBefore(fig, about.firstChild);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
