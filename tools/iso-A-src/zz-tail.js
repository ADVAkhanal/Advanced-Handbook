
/*FIX:BEGIN*/
  /* Placement fixes for the named characters (they are larger than the old workers). FIX[spec key][step number] =
     { cam: n (the picture moves down n screen px, keeps heads below the sign), who: { name: [dx, dy] } (that character moves by whole world units) }. */
  function applyFix(H, FIX) {
    Object.keys(FIX).forEach(function (key) {
      var spec = H[key]; if (!spec) return;
      Object.keys(FIX[key]).forEach(function (sn) {
        var st = spec.steps[+sn - 1], f = FIX[key][sn]; if (!st) return;
        if (f.cam) {
          ['cam'].forEach(function (k) { var c = st[k] || { x: 26, y: 14, zoom: 1 }, z = c.zoom === 2 ? 2 : 1, d = f.cam / (2 * z), n = {}, q; for (q in c) n[q] = c[q]; n.x = c.x - d; n.y = c.y - d; st[k] = n; });
        }
        if (f.who && st.build) {
          var b0 = st.build;
          st.build = function (t, g, fx) {
            var l0 = g.list;
            g.list = function () { var L = l0.apply(g, arguments), p0 = L.person; L.person = function (x, y, d, o) { var m = o && o.who && f.who[o.who]; return p0.call(L, m ? x + m[0] : x, m ? y + m[1] : y, d, o); }; return L; };
            try { return b0.call(st, t, g, fx); } finally { g.list = l0; }
          };
        }
      });
    });
  }
  var FIX = {
    "1.1": {"1":{"who":{"raul":[0,1]}},"2":{"who":{"pam":[1,0]}},"3":{"who":{"pam":[1,0]}}},
    "1.2": {"3":{"who":{"scott":[-1,0]}}},
    "2.1": {"1":{"who":{"scott":[2,0]}}},
    "2.2": {"1":{"cam":4},"3":{"who":{"raul":[1,0]}}},
    "2.3": {"1":{"cam":4}},
    "3.1": {"2":{"cam":4}},
    "3.2": {"1":{"cam":4},"3":{"cam":4}},
    "3.3": {"2":{"cam":4}},
    "3.4": {"1":{"who":{"raul":[1,0]}}},
    "3.5": {"3":{"cam":4}},
    "3.6": {"2":{"who":{"scott":[1,1]}}},
    "OK-EEO Statement and Non harassme": {"1":{"cam":4}},
    "OK-Religious Accommodation": {"2":{"who":{"scott":[-1,0]}}},
    "4.2": {"1":{"cam":4,"who":{"raul":[-2,-2]}}},
    "4.4": {"2":{"cam":4}},
    "1.0": {"1":{"who":{"kim":[2,2],"randel":[1,0]}}},
    "OK-Disability Accommodation": {"2":{"cam":12},"3":{"cam":4}}
  };
  if (!globalThis.HB_NOFIX) applyFix(HB, FIX);
  /*FIX:END*/

  if (typeof module !== 'undefined' && module.exports) module.exports = OUT;
})(typeof window !== 'undefined' ? window : this);
