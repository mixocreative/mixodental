/* node-editor sources 1a0bd0819e8cfa1f - rebuild with npm run review:editor */
/*! Contains third-party code - React, React DOM, @xyflow/react and their dependencies, each MIT or ISC. Full licence texts: THIRD-PARTY-NOTICES.txt, written by npm run build. */
function Ih(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var Nu = { exports: {} }, si = {}, Mu = { exports: {} }, Ne = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var rp;
function gy() {
  if (rp) return Ne;
  rp = 1;
  var t = Symbol.for("react.element"), r = Symbol.for("react.portal"), i = Symbol.for("react.fragment"), l = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), c = Symbol.for("react.provider"), f = Symbol.for("react.context"), p = Symbol.for("react.forward_ref"), h = Symbol.for("react.suspense"), g = Symbol.for("react.memo"), m = Symbol.for("react.lazy"), v = Symbol.iterator;
  function y(C) {
    return C === null || typeof C != "object" ? null : (C = v && C[v] || C["@@iterator"], typeof C == "function" ? C : null);
  }
  var _ = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, x = Object.assign, N = {};
  function E(C, H, ie) {
    this.props = C, this.context = H, this.refs = N, this.updater = ie || _;
  }
  E.prototype.isReactComponent = {}, E.prototype.setState = function(C, H) {
    if (typeof C != "object" && typeof C != "function" && C != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, C, H, "setState");
  }, E.prototype.forceUpdate = function(C) {
    this.updater.enqueueForceUpdate(this, C, "forceUpdate");
  };
  function M() {
  }
  M.prototype = E.prototype;
  function T(C, H, ie) {
    this.props = C, this.context = H, this.refs = N, this.updater = ie || _;
  }
  var S = T.prototype = new M();
  S.constructor = T, x(S, E.prototype), S.isPureReactComponent = !0;
  var P = Array.isArray, B = Object.prototype.hasOwnProperty, D = { current: null }, F = { key: !0, ref: !0, __self: !0, __source: !0 };
  function Q(C, H, ie) {
    var re, ae = {}, ce = null, ue = null;
    if (H != null) for (re in H.ref !== void 0 && (ue = H.ref), H.key !== void 0 && (ce = "" + H.key), H) B.call(H, re) && !F.hasOwnProperty(re) && (ae[re] = H[re]);
    var q = arguments.length - 2;
    if (q === 1) ae.children = ie;
    else if (1 < q) {
      for (var le = Array(q), we = 0; we < q; we++) le[we] = arguments[we + 2];
      ae.children = le;
    }
    if (C && C.defaultProps) for (re in q = C.defaultProps, q) ae[re] === void 0 && (ae[re] = q[re]);
    return { $$typeof: t, type: C, key: ce, ref: ue, props: ae, _owner: D.current };
  }
  function K(C, H) {
    return { $$typeof: t, type: C.type, key: H, ref: C.ref, props: C.props, _owner: C._owner };
  }
  function ee(C) {
    return typeof C == "object" && C !== null && C.$$typeof === t;
  }
  function J(C) {
    var H = { "=": "=0", ":": "=2" };
    return "$" + C.replace(/[=:]/g, function(ie) {
      return H[ie];
    });
  }
  var A = /\/+/g;
  function W(C, H) {
    return typeof C == "object" && C !== null && C.key != null ? J("" + C.key) : H.toString(36);
  }
  function k(C, H, ie, re, ae) {
    var ce = typeof C;
    (ce === "undefined" || ce === "boolean") && (C = null);
    var ue = !1;
    if (C === null) ue = !0;
    else switch (ce) {
      case "string":
      case "number":
        ue = !0;
        break;
      case "object":
        switch (C.$$typeof) {
          case t:
          case r:
            ue = !0;
        }
    }
    if (ue) return ue = C, ae = ae(ue), C = re === "" ? "." + W(ue, 0) : re, P(ae) ? (ie = "", C != null && (ie = C.replace(A, "$&/") + "/"), k(ae, H, ie, "", function(we) {
      return we;
    })) : ae != null && (ee(ae) && (ae = K(ae, ie + (!ae.key || ue && ue.key === ae.key ? "" : ("" + ae.key).replace(A, "$&/") + "/") + C)), H.push(ae)), 1;
    if (ue = 0, re = re === "" ? "." : re + ":", P(C)) for (var q = 0; q < C.length; q++) {
      ce = C[q];
      var le = re + W(ce, q);
      ue += k(ce, H, ie, le, ae);
    }
    else if (le = y(C), typeof le == "function") for (C = le.call(C), q = 0; !(ce = C.next()).done; ) ce = ce.value, le = re + W(ce, q++), ue += k(ce, H, ie, le, ae);
    else if (ce === "object") throw H = String(C), Error("Objects are not valid as a React child (found: " + (H === "[object Object]" ? "object with keys {" + Object.keys(C).join(", ") + "}" : H) + "). If you meant to render a collection of children, use an array instead.");
    return ue;
  }
  function $(C, H, ie) {
    if (C == null) return C;
    var re = [], ae = 0;
    return k(C, re, "", "", function(ce) {
      return H.call(ie, ce, ae++);
    }), re;
  }
  function O(C) {
    if (C._status === -1) {
      var H = C._result;
      H = H(), H.then(function(ie) {
        (C._status === 0 || C._status === -1) && (C._status = 1, C._result = ie);
      }, function(ie) {
        (C._status === 0 || C._status === -1) && (C._status = 2, C._result = ie);
      }), C._status === -1 && (C._status = 0, C._result = H);
    }
    if (C._status === 1) return C._result.default;
    throw C._result;
  }
  var V = { current: null }, b = { transition: null }, j = { ReactCurrentDispatcher: V, ReactCurrentBatchConfig: b, ReactCurrentOwner: D };
  function U() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return Ne.Children = { map: $, forEach: function(C, H, ie) {
    $(C, function() {
      H.apply(this, arguments);
    }, ie);
  }, count: function(C) {
    var H = 0;
    return $(C, function() {
      H++;
    }), H;
  }, toArray: function(C) {
    return $(C, function(H) {
      return H;
    }) || [];
  }, only: function(C) {
    if (!ee(C)) throw Error("React.Children.only expected to receive a single React element child.");
    return C;
  } }, Ne.Component = E, Ne.Fragment = i, Ne.Profiler = a, Ne.PureComponent = T, Ne.StrictMode = l, Ne.Suspense = h, Ne.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = j, Ne.act = U, Ne.cloneElement = function(C, H, ie) {
    if (C == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + C + ".");
    var re = x({}, C.props), ae = C.key, ce = C.ref, ue = C._owner;
    if (H != null) {
      if (H.ref !== void 0 && (ce = H.ref, ue = D.current), H.key !== void 0 && (ae = "" + H.key), C.type && C.type.defaultProps) var q = C.type.defaultProps;
      for (le in H) B.call(H, le) && !F.hasOwnProperty(le) && (re[le] = H[le] === void 0 && q !== void 0 ? q[le] : H[le]);
    }
    var le = arguments.length - 2;
    if (le === 1) re.children = ie;
    else if (1 < le) {
      q = Array(le);
      for (var we = 0; we < le; we++) q[we] = arguments[we + 2];
      re.children = q;
    }
    return { $$typeof: t, type: C.type, key: ae, ref: ce, props: re, _owner: ue };
  }, Ne.createContext = function(C) {
    return C = { $$typeof: f, _currentValue: C, _currentValue2: C, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, C.Provider = { $$typeof: c, _context: C }, C.Consumer = C;
  }, Ne.createElement = Q, Ne.createFactory = function(C) {
    var H = Q.bind(null, C);
    return H.type = C, H;
  }, Ne.createRef = function() {
    return { current: null };
  }, Ne.forwardRef = function(C) {
    return { $$typeof: p, render: C };
  }, Ne.isValidElement = ee, Ne.lazy = function(C) {
    return { $$typeof: m, _payload: { _status: -1, _result: C }, _init: O };
  }, Ne.memo = function(C, H) {
    return { $$typeof: g, type: C, compare: H === void 0 ? null : H };
  }, Ne.startTransition = function(C) {
    var H = b.transition;
    b.transition = {};
    try {
      C();
    } finally {
      b.transition = H;
    }
  }, Ne.unstable_act = U, Ne.useCallback = function(C, H) {
    return V.current.useCallback(C, H);
  }, Ne.useContext = function(C) {
    return V.current.useContext(C);
  }, Ne.useDebugValue = function() {
  }, Ne.useDeferredValue = function(C) {
    return V.current.useDeferredValue(C);
  }, Ne.useEffect = function(C, H) {
    return V.current.useEffect(C, H);
  }, Ne.useId = function() {
    return V.current.useId();
  }, Ne.useImperativeHandle = function(C, H, ie) {
    return V.current.useImperativeHandle(C, H, ie);
  }, Ne.useInsertionEffect = function(C, H) {
    return V.current.useInsertionEffect(C, H);
  }, Ne.useLayoutEffect = function(C, H) {
    return V.current.useLayoutEffect(C, H);
  }, Ne.useMemo = function(C, H) {
    return V.current.useMemo(C, H);
  }, Ne.useReducer = function(C, H, ie) {
    return V.current.useReducer(C, H, ie);
  }, Ne.useRef = function(C) {
    return V.current.useRef(C);
  }, Ne.useState = function(C) {
    return V.current.useState(C);
  }, Ne.useSyncExternalStore = function(C, H, ie) {
    return V.current.useSyncExternalStore(C, H, ie);
  }, Ne.useTransition = function() {
    return V.current.useTransition();
  }, Ne.version = "18.3.1", Ne;
}
var op;
function Si() {
  return op || (op = 1, Mu.exports = gy()), Mu.exports;
}
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ip;
function my() {
  if (ip) return si;
  ip = 1;
  var t = Si(), r = Symbol.for("react.element"), i = Symbol.for("react.fragment"), l = Object.prototype.hasOwnProperty, a = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, c = { key: !0, ref: !0, __self: !0, __source: !0 };
  function f(p, h, g) {
    var m, v = {}, y = null, _ = null;
    g !== void 0 && (y = "" + g), h.key !== void 0 && (y = "" + h.key), h.ref !== void 0 && (_ = h.ref);
    for (m in h) l.call(h, m) && !c.hasOwnProperty(m) && (v[m] = h[m]);
    if (p && p.defaultProps) for (m in h = p.defaultProps, h) v[m] === void 0 && (v[m] = h[m]);
    return { $$typeof: r, type: p, key: y, ref: _, props: v, _owner: a.current };
  }
  return si.Fragment = i, si.jsx = f, si.jsxs = f, si;
}
var sp;
function yy() {
  return sp || (sp = 1, Nu.exports = my()), Nu.exports;
}
var R = yy(), Xs = {}, zu = { exports: {} }, gt = {}, Pu = { exports: {} }, Iu = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var lp;
function vy() {
  return lp || (lp = 1, (function(t) {
    function r(b, j) {
      var U = b.length;
      b.push(j);
      e: for (; 0 < U; ) {
        var C = U - 1 >>> 1, H = b[C];
        if (0 < a(H, j)) b[C] = j, b[U] = H, U = C;
        else break e;
      }
    }
    function i(b) {
      return b.length === 0 ? null : b[0];
    }
    function l(b) {
      if (b.length === 0) return null;
      var j = b[0], U = b.pop();
      if (U !== j) {
        b[0] = U;
        e: for (var C = 0, H = b.length, ie = H >>> 1; C < ie; ) {
          var re = 2 * (C + 1) - 1, ae = b[re], ce = re + 1, ue = b[ce];
          if (0 > a(ae, U)) ce < H && 0 > a(ue, ae) ? (b[C] = ue, b[ce] = U, C = ce) : (b[C] = ae, b[re] = U, C = re);
          else if (ce < H && 0 > a(ue, U)) b[C] = ue, b[ce] = U, C = ce;
          else break e;
        }
      }
      return j;
    }
    function a(b, j) {
      var U = b.sortIndex - j.sortIndex;
      return U !== 0 ? U : b.id - j.id;
    }
    if (typeof performance == "object" && typeof performance.now == "function") {
      var c = performance;
      t.unstable_now = function() {
        return c.now();
      };
    } else {
      var f = Date, p = f.now();
      t.unstable_now = function() {
        return f.now() - p;
      };
    }
    var h = [], g = [], m = 1, v = null, y = 3, _ = !1, x = !1, N = !1, E = typeof setTimeout == "function" ? setTimeout : null, M = typeof clearTimeout == "function" ? clearTimeout : null, T = typeof setImmediate < "u" ? setImmediate : null;
    typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function S(b) {
      for (var j = i(g); j !== null; ) {
        if (j.callback === null) l(g);
        else if (j.startTime <= b) l(g), j.sortIndex = j.expirationTime, r(h, j);
        else break;
        j = i(g);
      }
    }
    function P(b) {
      if (N = !1, S(b), !x) if (i(h) !== null) x = !0, O(B);
      else {
        var j = i(g);
        j !== null && V(P, j.startTime - b);
      }
    }
    function B(b, j) {
      x = !1, N && (N = !1, M(Q), Q = -1), _ = !0;
      var U = y;
      try {
        for (S(j), v = i(h); v !== null && (!(v.expirationTime > j) || b && !J()); ) {
          var C = v.callback;
          if (typeof C == "function") {
            v.callback = null, y = v.priorityLevel;
            var H = C(v.expirationTime <= j);
            j = t.unstable_now(), typeof H == "function" ? v.callback = H : v === i(h) && l(h), S(j);
          } else l(h);
          v = i(h);
        }
        if (v !== null) var ie = !0;
        else {
          var re = i(g);
          re !== null && V(P, re.startTime - j), ie = !1;
        }
        return ie;
      } finally {
        v = null, y = U, _ = !1;
      }
    }
    var D = !1, F = null, Q = -1, K = 5, ee = -1;
    function J() {
      return !(t.unstable_now() - ee < K);
    }
    function A() {
      if (F !== null) {
        var b = t.unstable_now();
        ee = b;
        var j = !0;
        try {
          j = F(!0, b);
        } finally {
          j ? W() : (D = !1, F = null);
        }
      } else D = !1;
    }
    var W;
    if (typeof T == "function") W = function() {
      T(A);
    };
    else if (typeof MessageChannel < "u") {
      var k = new MessageChannel(), $ = k.port2;
      k.port1.onmessage = A, W = function() {
        $.postMessage(null);
      };
    } else W = function() {
      E(A, 0);
    };
    function O(b) {
      F = b, D || (D = !0, W());
    }
    function V(b, j) {
      Q = E(function() {
        b(t.unstable_now());
      }, j);
    }
    t.unstable_IdlePriority = 5, t.unstable_ImmediatePriority = 1, t.unstable_LowPriority = 4, t.unstable_NormalPriority = 3, t.unstable_Profiling = null, t.unstable_UserBlockingPriority = 2, t.unstable_cancelCallback = function(b) {
      b.callback = null;
    }, t.unstable_continueExecution = function() {
      x || _ || (x = !0, O(B));
    }, t.unstable_forceFrameRate = function(b) {
      0 > b || 125 < b ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : K = 0 < b ? Math.floor(1e3 / b) : 5;
    }, t.unstable_getCurrentPriorityLevel = function() {
      return y;
    }, t.unstable_getFirstCallbackNode = function() {
      return i(h);
    }, t.unstable_next = function(b) {
      switch (y) {
        case 1:
        case 2:
        case 3:
          var j = 3;
          break;
        default:
          j = y;
      }
      var U = y;
      y = j;
      try {
        return b();
      } finally {
        y = U;
      }
    }, t.unstable_pauseExecution = function() {
    }, t.unstable_requestPaint = function() {
    }, t.unstable_runWithPriority = function(b, j) {
      switch (b) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          b = 3;
      }
      var U = y;
      y = b;
      try {
        return j();
      } finally {
        y = U;
      }
    }, t.unstable_scheduleCallback = function(b, j, U) {
      var C = t.unstable_now();
      switch (typeof U == "object" && U !== null ? (U = U.delay, U = typeof U == "number" && 0 < U ? C + U : C) : U = C, b) {
        case 1:
          var H = -1;
          break;
        case 2:
          H = 250;
          break;
        case 5:
          H = 1073741823;
          break;
        case 4:
          H = 1e4;
          break;
        default:
          H = 5e3;
      }
      return H = U + H, b = { id: m++, callback: j, priorityLevel: b, startTime: U, expirationTime: H, sortIndex: -1 }, U > C ? (b.sortIndex = U, r(g, b), i(h) === null && b === i(g) && (N ? (M(Q), Q = -1) : N = !0, V(P, U - C))) : (b.sortIndex = H, r(h, b), x || _ || (x = !0, O(B))), b;
    }, t.unstable_shouldYield = J, t.unstable_wrapCallback = function(b) {
      var j = y;
      return function() {
        var U = y;
        y = j;
        try {
          return b.apply(this, arguments);
        } finally {
          y = U;
        }
      };
    };
  })(Iu)), Iu;
}
var ap;
function wy() {
  return ap || (ap = 1, Pu.exports = vy()), Pu.exports;
}
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var up;
function xy() {
  if (up) return gt;
  up = 1;
  var t = Si(), r = wy();
  function i(e) {
    for (var n = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, o = 1; o < arguments.length; o++) n += "&args[]=" + encodeURIComponent(arguments[o]);
    return "Minified React error #" + e + "; visit " + n + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  var l = /* @__PURE__ */ new Set(), a = {};
  function c(e, n) {
    f(e, n), f(e + "Capture", n);
  }
  function f(e, n) {
    for (a[e] = n, e = 0; e < n.length; e++) l.add(n[e]);
  }
  var p = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), h = Object.prototype.hasOwnProperty, g = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, m = {}, v = {};
  function y(e) {
    return h.call(v, e) ? !0 : h.call(m, e) ? !1 : g.test(e) ? v[e] = !0 : (m[e] = !0, !1);
  }
  function _(e, n, o, s) {
    if (o !== null && o.type === 0) return !1;
    switch (typeof n) {
      case "function":
      case "symbol":
        return !0;
      case "boolean":
        return s ? !1 : o !== null ? !o.acceptsBooleans : (e = e.toLowerCase().slice(0, 5), e !== "data-" && e !== "aria-");
      default:
        return !1;
    }
  }
  function x(e, n, o, s) {
    if (n === null || typeof n > "u" || _(e, n, o, s)) return !0;
    if (s) return !1;
    if (o !== null) switch (o.type) {
      case 3:
        return !n;
      case 4:
        return n === !1;
      case 5:
        return isNaN(n);
      case 6:
        return isNaN(n) || 1 > n;
    }
    return !1;
  }
  function N(e, n, o, s, u, d, w) {
    this.acceptsBooleans = n === 2 || n === 3 || n === 4, this.attributeName = s, this.attributeNamespace = u, this.mustUseProperty = o, this.propertyName = e, this.type = n, this.sanitizeURL = d, this.removeEmptyString = w;
  }
  var E = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
    E[e] = new N(e, 0, !1, e, null, !1, !1);
  }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
    var n = e[0];
    E[n] = new N(n, 1, !1, e[1], null, !1, !1);
  }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
    E[e] = new N(e, 2, !1, e.toLowerCase(), null, !1, !1);
  }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
    E[e] = new N(e, 2, !1, e, null, !1, !1);
  }), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
    E[e] = new N(e, 3, !1, e.toLowerCase(), null, !1, !1);
  }), ["checked", "multiple", "muted", "selected"].forEach(function(e) {
    E[e] = new N(e, 3, !0, e, null, !1, !1);
  }), ["capture", "download"].forEach(function(e) {
    E[e] = new N(e, 4, !1, e, null, !1, !1);
  }), ["cols", "rows", "size", "span"].forEach(function(e) {
    E[e] = new N(e, 6, !1, e, null, !1, !1);
  }), ["rowSpan", "start"].forEach(function(e) {
    E[e] = new N(e, 5, !1, e.toLowerCase(), null, !1, !1);
  });
  var M = /[\-:]([a-z])/g;
  function T(e) {
    return e[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
    var n = e.replace(
      M,
      T
    );
    E[n] = new N(n, 1, !1, e, null, !1, !1);
  }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
    var n = e.replace(M, T);
    E[n] = new N(n, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
  }), ["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
    var n = e.replace(M, T);
    E[n] = new N(n, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
  }), ["tabIndex", "crossOrigin"].forEach(function(e) {
    E[e] = new N(e, 1, !1, e.toLowerCase(), null, !1, !1);
  }), E.xlinkHref = new N("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), ["src", "href", "action", "formAction"].forEach(function(e) {
    E[e] = new N(e, 1, !1, e.toLowerCase(), null, !0, !0);
  });
  function S(e, n, o, s) {
    var u = E.hasOwnProperty(n) ? E[n] : null;
    (u !== null ? u.type !== 0 : s || !(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && (x(n, o, u, s) && (o = null), s || u === null ? y(n) && (o === null ? e.removeAttribute(n) : e.setAttribute(n, "" + o)) : u.mustUseProperty ? e[u.propertyName] = o === null ? u.type === 3 ? !1 : "" : o : (n = u.attributeName, s = u.attributeNamespace, o === null ? e.removeAttribute(n) : (u = u.type, o = u === 3 || u === 4 && o === !0 ? "" : "" + o, s ? e.setAttributeNS(s, n, o) : e.setAttribute(n, o))));
  }
  var P = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, B = Symbol.for("react.element"), D = Symbol.for("react.portal"), F = Symbol.for("react.fragment"), Q = Symbol.for("react.strict_mode"), K = Symbol.for("react.profiler"), ee = Symbol.for("react.provider"), J = Symbol.for("react.context"), A = Symbol.for("react.forward_ref"), W = Symbol.for("react.suspense"), k = Symbol.for("react.suspense_list"), $ = Symbol.for("react.memo"), O = Symbol.for("react.lazy"), V = Symbol.for("react.offscreen"), b = Symbol.iterator;
  function j(e) {
    return e === null || typeof e != "object" ? null : (e = b && e[b] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var U = Object.assign, C;
  function H(e) {
    if (C === void 0) try {
      throw Error();
    } catch (o) {
      var n = o.stack.trim().match(/\n( *(at )?)/);
      C = n && n[1] || "";
    }
    return `
` + C + e;
  }
  var ie = !1;
  function re(e, n) {
    if (!e || ie) return "";
    ie = !0;
    var o = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      if (n) if (n = function() {
        throw Error();
      }, Object.defineProperty(n.prototype, "props", { set: function() {
        throw Error();
      } }), typeof Reflect == "object" && Reflect.construct) {
        try {
          Reflect.construct(n, []);
        } catch (G) {
          var s = G;
        }
        Reflect.construct(e, [], n);
      } else {
        try {
          n.call();
        } catch (G) {
          s = G;
        }
        e.call(n.prototype);
      }
      else {
        try {
          throw Error();
        } catch (G) {
          s = G;
        }
        e();
      }
    } catch (G) {
      if (G && s && typeof G.stack == "string") {
        for (var u = G.stack.split(`
`), d = s.stack.split(`
`), w = u.length - 1, z = d.length - 1; 1 <= w && 0 <= z && u[w] !== d[z]; ) z--;
        for (; 1 <= w && 0 <= z; w--, z--) if (u[w] !== d[z]) {
          if (w !== 1 || z !== 1)
            do
              if (w--, z--, 0 > z || u[w] !== d[z]) {
                var I = `
` + u[w].replace(" at new ", " at ");
                return e.displayName && I.includes("<anonymous>") && (I = I.replace("<anonymous>", e.displayName)), I;
              }
            while (1 <= w && 0 <= z);
          break;
        }
      }
    } finally {
      ie = !1, Error.prepareStackTrace = o;
    }
    return (e = e ? e.displayName || e.name : "") ? H(e) : "";
  }
  function ae(e) {
    switch (e.tag) {
      case 5:
        return H(e.type);
      case 16:
        return H("Lazy");
      case 13:
        return H("Suspense");
      case 19:
        return H("SuspenseList");
      case 0:
      case 2:
      case 15:
        return e = re(e.type, !1), e;
      case 11:
        return e = re(e.type.render, !1), e;
      case 1:
        return e = re(e.type, !0), e;
      default:
        return "";
    }
  }
  function ce(e) {
    if (e == null) return null;
    if (typeof e == "function") return e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case F:
        return "Fragment";
      case D:
        return "Portal";
      case K:
        return "Profiler";
      case Q:
        return "StrictMode";
      case W:
        return "Suspense";
      case k:
        return "SuspenseList";
    }
    if (typeof e == "object") switch (e.$$typeof) {
      case J:
        return (e.displayName || "Context") + ".Consumer";
      case ee:
        return (e._context.displayName || "Context") + ".Provider";
      case A:
        var n = e.render;
        return e = e.displayName, e || (e = n.displayName || n.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
      case $:
        return n = e.displayName || null, n !== null ? n : ce(e.type) || "Memo";
      case O:
        n = e._payload, e = e._init;
        try {
          return ce(e(n));
        } catch {
        }
    }
    return null;
  }
  function ue(e) {
    var n = e.type;
    switch (e.tag) {
      case 24:
        return "Cache";
      case 9:
        return (n.displayName || "Context") + ".Consumer";
      case 10:
        return (n._context.displayName || "Context") + ".Provider";
      case 18:
        return "DehydratedFragment";
      case 11:
        return e = n.render, e = e.displayName || e.name || "", n.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef");
      case 7:
        return "Fragment";
      case 5:
        return n;
      case 4:
        return "Portal";
      case 3:
        return "Root";
      case 6:
        return "Text";
      case 16:
        return ce(n);
      case 8:
        return n === Q ? "StrictMode" : "Mode";
      case 22:
        return "Offscreen";
      case 12:
        return "Profiler";
      case 21:
        return "Scope";
      case 13:
        return "Suspense";
      case 19:
        return "SuspenseList";
      case 25:
        return "TracingMarker";
      case 1:
      case 0:
      case 17:
      case 2:
      case 14:
      case 15:
        if (typeof n == "function") return n.displayName || n.name || null;
        if (typeof n == "string") return n;
    }
    return null;
  }
  function q(e) {
    switch (typeof e) {
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return e;
      case "object":
        return e;
      default:
        return "";
    }
  }
  function le(e) {
    var n = e.type;
    return (e = e.nodeName) && e.toLowerCase() === "input" && (n === "checkbox" || n === "radio");
  }
  function we(e) {
    var n = le(e) ? "checked" : "value", o = Object.getOwnPropertyDescriptor(e.constructor.prototype, n), s = "" + e[n];
    if (!e.hasOwnProperty(n) && typeof o < "u" && typeof o.get == "function" && typeof o.set == "function") {
      var u = o.get, d = o.set;
      return Object.defineProperty(e, n, { configurable: !0, get: function() {
        return u.call(this);
      }, set: function(w) {
        s = "" + w, d.call(this, w);
      } }), Object.defineProperty(e, n, { enumerable: o.enumerable }), { getValue: function() {
        return s;
      }, setValue: function(w) {
        s = "" + w;
      }, stopTracking: function() {
        e._valueTracker = null, delete e[n];
      } };
    }
  }
  function Se(e) {
    e._valueTracker || (e._valueTracker = we(e));
  }
  function me(e) {
    if (!e) return !1;
    var n = e._valueTracker;
    if (!n) return !0;
    var o = n.getValue(), s = "";
    return e && (s = le(e) ? e.checked ? "true" : "false" : e.value), e = s, e !== o ? (n.setValue(e), !0) : !1;
  }
  function ve(e) {
    if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  function Ee(e, n) {
    var o = n.checked;
    return U({}, n, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: o ?? e._wrapperState.initialChecked });
  }
  function Ce(e, n) {
    var o = n.defaultValue == null ? "" : n.defaultValue, s = n.checked != null ? n.checked : n.defaultChecked;
    o = q(n.value != null ? n.value : o), e._wrapperState = { initialChecked: s, initialValue: o, controlled: n.type === "checkbox" || n.type === "radio" ? n.checked != null : n.value != null };
  }
  function ze(e, n) {
    n = n.checked, n != null && S(e, "checked", n, !1);
  }
  function Ve(e, n) {
    ze(e, n);
    var o = q(n.value), s = n.type;
    if (o != null) s === "number" ? (o === 0 && e.value === "" || e.value != o) && (e.value = "" + o) : e.value !== "" + o && (e.value = "" + o);
    else if (s === "submit" || s === "reset") {
      e.removeAttribute("value");
      return;
    }
    n.hasOwnProperty("value") ? at(e, n.type, o) : n.hasOwnProperty("defaultValue") && at(e, n.type, q(n.defaultValue)), n.checked == null && n.defaultChecked != null && (e.defaultChecked = !!n.defaultChecked);
  }
  function Ct(e, n, o) {
    if (n.hasOwnProperty("value") || n.hasOwnProperty("defaultValue")) {
      var s = n.type;
      if (!(s !== "submit" && s !== "reset" || n.value !== void 0 && n.value !== null)) return;
      n = "" + e._wrapperState.initialValue, o || n === e.value || (e.value = n), e.defaultValue = n;
    }
    o = e.name, o !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, o !== "" && (e.name = o);
  }
  function at(e, n, o) {
    (n !== "number" || ve(e.ownerDocument) !== e) && (o == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + o && (e.defaultValue = "" + o));
  }
  var et = Array.isArray;
  function tt(e, n, o, s) {
    if (e = e.options, n) {
      n = {};
      for (var u = 0; u < o.length; u++) n["$" + o[u]] = !0;
      for (o = 0; o < e.length; o++) u = n.hasOwnProperty("$" + e[o].value), e[o].selected !== u && (e[o].selected = u), u && s && (e[o].defaultSelected = !0);
    } else {
      for (o = "" + q(o), n = null, u = 0; u < e.length; u++) {
        if (e[u].value === o) {
          e[u].selected = !0, s && (e[u].defaultSelected = !0);
          return;
        }
        n !== null || e[u].disabled || (n = e[u]);
      }
      n !== null && (n.selected = !0);
    }
  }
  function sn(e, n) {
    if (n.dangerouslySetInnerHTML != null) throw Error(i(91));
    return U({}, n, { value: void 0, defaultValue: void 0, children: "" + e._wrapperState.initialValue });
  }
  function Yt(e, n) {
    var o = n.value;
    if (o == null) {
      if (o = n.children, n = n.defaultValue, o != null) {
        if (n != null) throw Error(i(92));
        if (et(o)) {
          if (1 < o.length) throw Error(i(93));
          o = o[0];
        }
        n = o;
      }
      n == null && (n = ""), o = n;
    }
    e._wrapperState = { initialValue: q(o) };
  }
  function Zt(e, n) {
    var o = q(n.value), s = q(n.defaultValue);
    o != null && (o = "" + o, o !== e.value && (e.value = o), n.defaultValue == null && e.defaultValue !== o && (e.defaultValue = o)), s != null && (e.defaultValue = "" + s);
  }
  function ut(e) {
    var n = e.textContent;
    n === e._wrapperState.initialValue && n !== "" && n !== null && (e.value = n);
  }
  function Nt(e) {
    switch (e) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function mt(e, n) {
    return e == null || e === "http://www.w3.org/1999/xhtml" ? Nt(n) : e === "http://www.w3.org/2000/svg" && n === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
  }
  var Mt, Cr = (function(e) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(n, o, s, u) {
      MSApp.execUnsafeLocalFunction(function() {
        return e(n, o, s, u);
      });
    } : e;
  })(function(e, n) {
    if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = n;
    else {
      for (Mt = Mt || document.createElement("div"), Mt.innerHTML = "<svg>" + n.valueOf().toString() + "</svg>", n = Mt.firstChild; e.firstChild; ) e.removeChild(e.firstChild);
      for (; n.firstChild; ) e.appendChild(n.firstChild);
    }
  });
  function ln(e, n) {
    if (n) {
      var o = e.firstChild;
      if (o && o === e.lastChild && o.nodeType === 3) {
        o.nodeValue = n;
        return;
      }
    }
    e.textContent = n;
  }
  var Zn = {
    animationIterationCount: !0,
    aspectRatio: !0,
    borderImageOutset: !0,
    borderImageSlice: !0,
    borderImageWidth: !0,
    boxFlex: !0,
    boxFlexGroup: !0,
    boxOrdinalGroup: !0,
    columnCount: !0,
    columns: !0,
    flex: !0,
    flexGrow: !0,
    flexPositive: !0,
    flexShrink: !0,
    flexNegative: !0,
    flexOrder: !0,
    gridArea: !0,
    gridRow: !0,
    gridRowEnd: !0,
    gridRowSpan: !0,
    gridRowStart: !0,
    gridColumn: !0,
    gridColumnEnd: !0,
    gridColumnSpan: !0,
    gridColumnStart: !0,
    fontWeight: !0,
    lineClamp: !0,
    lineHeight: !0,
    opacity: !0,
    order: !0,
    orphans: !0,
    tabSize: !0,
    widows: !0,
    zIndex: !0,
    zoom: !0,
    fillOpacity: !0,
    floodOpacity: !0,
    stopOpacity: !0,
    strokeDasharray: !0,
    strokeDashoffset: !0,
    strokeMiterlimit: !0,
    strokeOpacity: !0,
    strokeWidth: !0
  }, Dl = ["Webkit", "ms", "Moz", "O"];
  Object.keys(Zn).forEach(function(e) {
    Dl.forEach(function(n) {
      n = n + e.charAt(0).toUpperCase() + e.substring(1), Zn[n] = Zn[e];
    });
  });
  function Pi(e, n, o) {
    return n == null || typeof n == "boolean" || n === "" ? "" : o || typeof n != "number" || n === 0 || Zn.hasOwnProperty(e) && Zn[e] ? ("" + n).trim() : n + "px";
  }
  function Ii(e, n) {
    e = e.style;
    for (var o in n) if (n.hasOwnProperty(o)) {
      var s = o.indexOf("--") === 0, u = Pi(o, n[o], s);
      o === "float" && (o = "cssFloat"), s ? e.setProperty(o, u) : e[o] = u;
    }
  }
  var Ll = U({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
  function yo(e, n) {
    if (n) {
      if (Ll[e] && (n.children != null || n.dangerouslySetInnerHTML != null)) throw Error(i(137, e));
      if (n.dangerouslySetInnerHTML != null) {
        if (n.children != null) throw Error(i(60));
        if (typeof n.dangerouslySetInnerHTML != "object" || !("__html" in n.dangerouslySetInnerHTML)) throw Error(i(61));
      }
      if (n.style != null && typeof n.style != "object") throw Error(i(62));
    }
  }
  function vo(e, n) {
    if (e.indexOf("-") === -1) return typeof n.is == "string";
    switch (e) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var wo = null;
  function xo(e) {
    return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
  }
  var _o = null, _n = null, Sn = null;
  function Ti(e) {
    if (e = Wo(e)) {
      if (typeof _o != "function") throw Error(i(280));
      var n = e.stateNode;
      n && (n = ls(n), _o(e.stateNode, e.type, n));
    }
  }
  function bi(e) {
    _n ? Sn ? Sn.push(e) : Sn = [e] : _n = e;
  }
  function Ri() {
    if (_n) {
      var e = _n, n = Sn;
      if (Sn = _n = null, Ti(e), n) for (e = 0; e < n.length; e++) Ti(n[e]);
    }
  }
  function Di(e, n) {
    return e(n);
  }
  function Li() {
  }
  var So = !1;
  function $i(e, n, o) {
    if (So) return e(n, o);
    So = !0;
    try {
      return Di(e, n, o);
    } finally {
      So = !1, (_n !== null || Sn !== null) && (Li(), Ri());
    }
  }
  function Qn(e, n) {
    var o = e.stateNode;
    if (o === null) return null;
    var s = ls(o);
    if (s === null) return null;
    o = s[n];
    e: switch (n) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (s = !s.disabled) || (e = e.type, s = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !s;
        break e;
      default:
        e = !1;
    }
    if (e) return null;
    if (o && typeof o != "function") throw Error(i(231, n, typeof o));
    return o;
  }
  var ko = !1;
  if (p) try {
    var Kn = {};
    Object.defineProperty(Kn, "passive", { get: function() {
      ko = !0;
    } }), window.addEventListener("test", Kn, Kn), window.removeEventListener("test", Kn, Kn);
  } catch {
    ko = !1;
  }
  function $l(e, n, o, s, u, d, w, z, I) {
    var G = Array.prototype.slice.call(arguments, 3);
    try {
      n.apply(o, G);
    } catch (ne) {
      this.onError(ne);
    }
  }
  var Gn = !1, Nr = null, Mr = !1, Eo = null, Ol = { onError: function(e) {
    Gn = !0, Nr = e;
  } };
  function Al(e, n, o, s, u, d, w, z, I) {
    Gn = !1, Nr = null, $l.apply(Ol, arguments);
  }
  function jl(e, n, o, s, u, d, w, z, I) {
    if (Al.apply(this, arguments), Gn) {
      if (Gn) {
        var G = Nr;
        Gn = !1, Nr = null;
      } else throw Error(i(198));
      Mr || (Mr = !0, Eo = G);
    }
  }
  function Qt(e) {
    var n = e, o = e;
    if (e.alternate) for (; n.return; ) n = n.return;
    else {
      e = n;
      do
        n = e, (n.flags & 4098) !== 0 && (o = n.return), e = n.return;
      while (e);
    }
    return n.tag === 3 ? o : null;
  }
  function Co(e) {
    if (e.tag === 13) {
      var n = e.memoizedState;
      if (n === null && (e = e.alternate, e !== null && (n = e.memoizedState)), n !== null) return n.dehydrated;
    }
    return null;
  }
  function No(e) {
    if (Qt(e) !== e) throw Error(i(188));
  }
  function Hl(e) {
    var n = e.alternate;
    if (!n) {
      if (n = Qt(e), n === null) throw Error(i(188));
      return n !== e ? null : e;
    }
    for (var o = e, s = n; ; ) {
      var u = o.return;
      if (u === null) break;
      var d = u.alternate;
      if (d === null) {
        if (s = u.return, s !== null) {
          o = s;
          continue;
        }
        break;
      }
      if (u.child === d.child) {
        for (d = u.child; d; ) {
          if (d === o) return No(u), e;
          if (d === s) return No(u), n;
          d = d.sibling;
        }
        throw Error(i(188));
      }
      if (o.return !== s.return) o = u, s = d;
      else {
        for (var w = !1, z = u.child; z; ) {
          if (z === o) {
            w = !0, o = u, s = d;
            break;
          }
          if (z === s) {
            w = !0, s = u, o = d;
            break;
          }
          z = z.sibling;
        }
        if (!w) {
          for (z = d.child; z; ) {
            if (z === o) {
              w = !0, o = d, s = u;
              break;
            }
            if (z === s) {
              w = !0, s = d, o = u;
              break;
            }
            z = z.sibling;
          }
          if (!w) throw Error(i(189));
        }
      }
      if (o.alternate !== s) throw Error(i(190));
    }
    if (o.tag !== 3) throw Error(i(188));
    return o.stateNode.current === o ? e : n;
  }
  function Oi(e) {
    return e = Hl(e), e !== null ? Ai(e) : null;
  }
  function Ai(e) {
    if (e.tag === 5 || e.tag === 6) return e;
    for (e = e.child; e !== null; ) {
      var n = Ai(e);
      if (n !== null) return n;
      e = e.sibling;
    }
    return null;
  }
  var ji = r.unstable_scheduleCallback, Hi = r.unstable_cancelCallback, Fl = r.unstable_shouldYield, Fi = r.unstable_requestPaint, Oe = r.unstable_now, Vl = r.unstable_getCurrentPriorityLevel, Mo = r.unstable_ImmediatePriority, Vi = r.unstable_UserBlockingPriority, zr = r.unstable_NormalPriority, Bl = r.unstable_LowPriority, Bi = r.unstable_IdlePriority, Pr = null, yt = null;
  function Ul(e) {
    if (yt && typeof yt.onCommitFiberRoot == "function") try {
      yt.onCommitFiberRoot(Pr, e, void 0, (e.current.flags & 128) === 128);
    } catch {
    }
  }
  var vt = Math.clz32 ? Math.clz32 : Yl, Wl = Math.log, Xl = Math.LN2;
  function Yl(e) {
    return e >>>= 0, e === 0 ? 32 : 31 - (Wl(e) / Xl | 0) | 0;
  }
  var Ir = 64, Tr = 4194304;
  function qn(e) {
    switch (e & -e) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return e & 4194240;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return e & 130023424;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 1073741824;
      default:
        return e;
    }
  }
  function Jn(e, n) {
    var o = e.pendingLanes;
    if (o === 0) return 0;
    var s = 0, u = e.suspendedLanes, d = e.pingedLanes, w = o & 268435455;
    if (w !== 0) {
      var z = w & ~u;
      z !== 0 ? s = qn(z) : (d &= w, d !== 0 && (s = qn(d)));
    } else w = o & ~u, w !== 0 ? s = qn(w) : d !== 0 && (s = qn(d));
    if (s === 0) return 0;
    if (n !== 0 && n !== s && (n & u) === 0 && (u = s & -s, d = n & -n, u >= d || u === 16 && (d & 4194240) !== 0)) return n;
    if ((s & 4) !== 0 && (s |= o & 16), n = e.entangledLanes, n !== 0) for (e = e.entanglements, n &= s; 0 < n; ) o = 31 - vt(n), u = 1 << o, s |= e[o], n &= ~u;
    return s;
  }
  function Zl(e, n) {
    switch (e) {
      case 1:
      case 2:
      case 4:
        return n + 250;
      case 8:
      case 16:
      case 32:
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return n + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return -1;
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function Ui(e, n) {
    for (var o = e.suspendedLanes, s = e.pingedLanes, u = e.expirationTimes, d = e.pendingLanes; 0 < d; ) {
      var w = 31 - vt(d), z = 1 << w, I = u[w];
      I === -1 ? ((z & o) === 0 || (z & s) !== 0) && (u[w] = Zl(z, n)) : I <= n && (e.expiredLanes |= z), d &= ~z;
    }
  }
  function zo(e) {
    return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
  }
  function Wi() {
    var e = Ir;
    return Ir <<= 1, (Ir & 4194240) === 0 && (Ir = 64), e;
  }
  function er(e) {
    for (var n = [], o = 0; 31 > o; o++) n.push(e);
    return n;
  }
  function tr(e, n, o) {
    e.pendingLanes |= n, n !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, n = 31 - vt(n), e[n] = o;
  }
  function Ql(e, n) {
    var o = e.pendingLanes & ~n;
    e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= n, e.mutableReadLanes &= n, e.entangledLanes &= n, n = e.entanglements;
    var s = e.eventTimes;
    for (e = e.expirationTimes; 0 < o; ) {
      var u = 31 - vt(o), d = 1 << u;
      n[u] = 0, s[u] = -1, e[u] = -1, o &= ~d;
    }
  }
  function br(e, n) {
    var o = e.entangledLanes |= n;
    for (e = e.entanglements; o; ) {
      var s = 31 - vt(o), u = 1 << s;
      u & n | e[s] & n && (e[s] |= n), o &= ~u;
    }
  }
  var Te = 0;
  function Dc(e) {
    return e &= -e, 1 < e ? 4 < e ? (e & 268435455) !== 0 ? 16 : 536870912 : 4 : 1;
  }
  var Lc, Kl, $c, Oc, Ac, Gl = !1, Xi = [], kn = null, En = null, Cn = null, Po = /* @__PURE__ */ new Map(), Io = /* @__PURE__ */ new Map(), Nn = [], Om = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  function jc(e, n) {
    switch (e) {
      case "focusin":
      case "focusout":
        kn = null;
        break;
      case "dragenter":
      case "dragleave":
        En = null;
        break;
      case "mouseover":
      case "mouseout":
        Cn = null;
        break;
      case "pointerover":
      case "pointerout":
        Po.delete(n.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        Io.delete(n.pointerId);
    }
  }
  function To(e, n, o, s, u, d) {
    return e === null || e.nativeEvent !== d ? (e = { blockedOn: n, domEventName: o, eventSystemFlags: s, nativeEvent: d, targetContainers: [u] }, n !== null && (n = Wo(n), n !== null && Kl(n)), e) : (e.eventSystemFlags |= s, n = e.targetContainers, u !== null && n.indexOf(u) === -1 && n.push(u), e);
  }
  function Am(e, n, o, s, u) {
    switch (n) {
      case "focusin":
        return kn = To(kn, e, n, o, s, u), !0;
      case "dragenter":
        return En = To(En, e, n, o, s, u), !0;
      case "mouseover":
        return Cn = To(Cn, e, n, o, s, u), !0;
      case "pointerover":
        var d = u.pointerId;
        return Po.set(d, To(Po.get(d) || null, e, n, o, s, u)), !0;
      case "gotpointercapture":
        return d = u.pointerId, Io.set(d, To(Io.get(d) || null, e, n, o, s, u)), !0;
    }
    return !1;
  }
  function Hc(e) {
    var n = nr(e.target);
    if (n !== null) {
      var o = Qt(n);
      if (o !== null) {
        if (n = o.tag, n === 13) {
          if (n = Co(o), n !== null) {
            e.blockedOn = n, Ac(e.priority, function() {
              $c(o);
            });
            return;
          }
        } else if (n === 3 && o.stateNode.current.memoizedState.isDehydrated) {
          e.blockedOn = o.tag === 3 ? o.stateNode.containerInfo : null;
          return;
        }
      }
    }
    e.blockedOn = null;
  }
  function Yi(e) {
    if (e.blockedOn !== null) return !1;
    for (var n = e.targetContainers; 0 < n.length; ) {
      var o = Jl(e.domEventName, e.eventSystemFlags, n[0], e.nativeEvent);
      if (o === null) {
        o = e.nativeEvent;
        var s = new o.constructor(o.type, o);
        wo = s, o.target.dispatchEvent(s), wo = null;
      } else return n = Wo(o), n !== null && Kl(n), e.blockedOn = o, !1;
      n.shift();
    }
    return !0;
  }
  function Fc(e, n, o) {
    Yi(e) && o.delete(n);
  }
  function jm() {
    Gl = !1, kn !== null && Yi(kn) && (kn = null), En !== null && Yi(En) && (En = null), Cn !== null && Yi(Cn) && (Cn = null), Po.forEach(Fc), Io.forEach(Fc);
  }
  function bo(e, n) {
    e.blockedOn === n && (e.blockedOn = null, Gl || (Gl = !0, r.unstable_scheduleCallback(r.unstable_NormalPriority, jm)));
  }
  function Ro(e) {
    function n(u) {
      return bo(u, e);
    }
    if (0 < Xi.length) {
      bo(Xi[0], e);
      for (var o = 1; o < Xi.length; o++) {
        var s = Xi[o];
        s.blockedOn === e && (s.blockedOn = null);
      }
    }
    for (kn !== null && bo(kn, e), En !== null && bo(En, e), Cn !== null && bo(Cn, e), Po.forEach(n), Io.forEach(n), o = 0; o < Nn.length; o++) s = Nn[o], s.blockedOn === e && (s.blockedOn = null);
    for (; 0 < Nn.length && (o = Nn[0], o.blockedOn === null); ) Hc(o), o.blockedOn === null && Nn.shift();
  }
  var Rr = P.ReactCurrentBatchConfig, Zi = !0;
  function Hm(e, n, o, s) {
    var u = Te, d = Rr.transition;
    Rr.transition = null;
    try {
      Te = 1, ql(e, n, o, s);
    } finally {
      Te = u, Rr.transition = d;
    }
  }
  function Fm(e, n, o, s) {
    var u = Te, d = Rr.transition;
    Rr.transition = null;
    try {
      Te = 4, ql(e, n, o, s);
    } finally {
      Te = u, Rr.transition = d;
    }
  }
  function ql(e, n, o, s) {
    if (Zi) {
      var u = Jl(e, n, o, s);
      if (u === null) ma(e, n, s, Qi, o), jc(e, s);
      else if (Am(u, e, n, o, s)) s.stopPropagation();
      else if (jc(e, s), n & 4 && -1 < Om.indexOf(e)) {
        for (; u !== null; ) {
          var d = Wo(u);
          if (d !== null && Lc(d), d = Jl(e, n, o, s), d === null && ma(e, n, s, Qi, o), d === u) break;
          u = d;
        }
        u !== null && s.stopPropagation();
      } else ma(e, n, s, null, o);
    }
  }
  var Qi = null;
  function Jl(e, n, o, s) {
    if (Qi = null, e = xo(s), e = nr(e), e !== null) if (n = Qt(e), n === null) e = null;
    else if (o = n.tag, o === 13) {
      if (e = Co(n), e !== null) return e;
      e = null;
    } else if (o === 3) {
      if (n.stateNode.current.memoizedState.isDehydrated) return n.tag === 3 ? n.stateNode.containerInfo : null;
      e = null;
    } else n !== e && (e = null);
    return Qi = e, null;
  }
  function Vc(e) {
    switch (e) {
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 1;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "toggle":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 4;
      case "message":
        switch (Vl()) {
          case Mo:
            return 1;
          case Vi:
            return 4;
          case zr:
          case Bl:
            return 16;
          case Bi:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var Mn = null, ea = null, Ki = null;
  function Bc() {
    if (Ki) return Ki;
    var e, n = ea, o = n.length, s, u = "value" in Mn ? Mn.value : Mn.textContent, d = u.length;
    for (e = 0; e < o && n[e] === u[e]; e++) ;
    var w = o - e;
    for (s = 1; s <= w && n[o - s] === u[d - s]; s++) ;
    return Ki = u.slice(e, 1 < s ? 1 - s : void 0);
  }
  function Gi(e) {
    var n = e.keyCode;
    return "charCode" in e ? (e = e.charCode, e === 0 && n === 13 && (e = 13)) : e = n, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
  }
  function qi() {
    return !0;
  }
  function Uc() {
    return !1;
  }
  function wt(e) {
    function n(o, s, u, d, w) {
      this._reactName = o, this._targetInst = u, this.type = s, this.nativeEvent = d, this.target = w, this.currentTarget = null;
      for (var z in e) e.hasOwnProperty(z) && (o = e[z], this[z] = o ? o(d) : d[z]);
      return this.isDefaultPrevented = (d.defaultPrevented != null ? d.defaultPrevented : d.returnValue === !1) ? qi : Uc, this.isPropagationStopped = Uc, this;
    }
    return U(n.prototype, { preventDefault: function() {
      this.defaultPrevented = !0;
      var o = this.nativeEvent;
      o && (o.preventDefault ? o.preventDefault() : typeof o.returnValue != "unknown" && (o.returnValue = !1), this.isDefaultPrevented = qi);
    }, stopPropagation: function() {
      var o = this.nativeEvent;
      o && (o.stopPropagation ? o.stopPropagation() : typeof o.cancelBubble != "unknown" && (o.cancelBubble = !0), this.isPropagationStopped = qi);
    }, persist: function() {
    }, isPersistent: qi }), n;
  }
  var Dr = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
    return e.timeStamp || Date.now();
  }, defaultPrevented: 0, isTrusted: 0 }, ta = wt(Dr), Do = U({}, Dr, { view: 0, detail: 0 }), Vm = wt(Do), na, ra, Lo, Ji = U({}, Do, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: ia, button: 0, buttons: 0, relatedTarget: function(e) {
    return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
  }, movementX: function(e) {
    return "movementX" in e ? e.movementX : (e !== Lo && (Lo && e.type === "mousemove" ? (na = e.screenX - Lo.screenX, ra = e.screenY - Lo.screenY) : ra = na = 0, Lo = e), na);
  }, movementY: function(e) {
    return "movementY" in e ? e.movementY : ra;
  } }), Wc = wt(Ji), Bm = U({}, Ji, { dataTransfer: 0 }), Um = wt(Bm), Wm = U({}, Do, { relatedTarget: 0 }), oa = wt(Wm), Xm = U({}, Dr, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), Ym = wt(Xm), Zm = U({}, Dr, { clipboardData: function(e) {
    return "clipboardData" in e ? e.clipboardData : window.clipboardData;
  } }), Qm = wt(Zm), Km = U({}, Dr, { data: 0 }), Xc = wt(Km), Gm = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, qm = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, Jm = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function e0(e) {
    var n = this.nativeEvent;
    return n.getModifierState ? n.getModifierState(e) : (e = Jm[e]) ? !!n[e] : !1;
  }
  function ia() {
    return e0;
  }
  var t0 = U({}, Do, { key: function(e) {
    if (e.key) {
      var n = Gm[e.key] || e.key;
      if (n !== "Unidentified") return n;
    }
    return e.type === "keypress" ? (e = Gi(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? qm[e.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: ia, charCode: function(e) {
    return e.type === "keypress" ? Gi(e) : 0;
  }, keyCode: function(e) {
    return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
  }, which: function(e) {
    return e.type === "keypress" ? Gi(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
  } }), n0 = wt(t0), r0 = U({}, Ji, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Yc = wt(r0), o0 = U({}, Do, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: ia }), i0 = wt(o0), s0 = U({}, Dr, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), l0 = wt(s0), a0 = U({}, Ji, {
    deltaX: function(e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function(e) {
      return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), u0 = wt(a0), c0 = [9, 13, 27, 32], sa = p && "CompositionEvent" in window, $o = null;
  p && "documentMode" in document && ($o = document.documentMode);
  var f0 = p && "TextEvent" in window && !$o, Zc = p && (!sa || $o && 8 < $o && 11 >= $o), Qc = " ", Kc = !1;
  function Gc(e, n) {
    switch (e) {
      case "keyup":
        return c0.indexOf(n.keyCode) !== -1;
      case "keydown":
        return n.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function qc(e) {
    return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
  }
  var Lr = !1;
  function d0(e, n) {
    switch (e) {
      case "compositionend":
        return qc(n);
      case "keypress":
        return n.which !== 32 ? null : (Kc = !0, Qc);
      case "textInput":
        return e = n.data, e === Qc && Kc ? null : e;
      default:
        return null;
    }
  }
  function p0(e, n) {
    if (Lr) return e === "compositionend" || !sa && Gc(e, n) ? (e = Bc(), Ki = ea = Mn = null, Lr = !1, e) : null;
    switch (e) {
      case "paste":
        return null;
      case "keypress":
        if (!(n.ctrlKey || n.altKey || n.metaKey) || n.ctrlKey && n.altKey) {
          if (n.char && 1 < n.char.length) return n.char;
          if (n.which) return String.fromCharCode(n.which);
        }
        return null;
      case "compositionend":
        return Zc && n.locale !== "ko" ? null : n.data;
      default:
        return null;
    }
  }
  var h0 = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
  function Jc(e) {
    var n = e && e.nodeName && e.nodeName.toLowerCase();
    return n === "input" ? !!h0[e.type] : n === "textarea";
  }
  function ef(e, n, o, s) {
    bi(s), n = os(n, "onChange"), 0 < n.length && (o = new ta("onChange", "change", null, o, s), e.push({ event: o, listeners: n }));
  }
  var Oo = null, Ao = null;
  function g0(e) {
    wf(e, 0);
  }
  function es(e) {
    var n = Hr(e);
    if (me(n)) return e;
  }
  function m0(e, n) {
    if (e === "change") return n;
  }
  var tf = !1;
  if (p) {
    var la;
    if (p) {
      var aa = "oninput" in document;
      if (!aa) {
        var nf = document.createElement("div");
        nf.setAttribute("oninput", "return;"), aa = typeof nf.oninput == "function";
      }
      la = aa;
    } else la = !1;
    tf = la && (!document.documentMode || 9 < document.documentMode);
  }
  function rf() {
    Oo && (Oo.detachEvent("onpropertychange", of), Ao = Oo = null);
  }
  function of(e) {
    if (e.propertyName === "value" && es(Ao)) {
      var n = [];
      ef(n, Ao, e, xo(e)), $i(g0, n);
    }
  }
  function y0(e, n, o) {
    e === "focusin" ? (rf(), Oo = n, Ao = o, Oo.attachEvent("onpropertychange", of)) : e === "focusout" && rf();
  }
  function v0(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown") return es(Ao);
  }
  function w0(e, n) {
    if (e === "click") return es(n);
  }
  function x0(e, n) {
    if (e === "input" || e === "change") return es(n);
  }
  function _0(e, n) {
    return e === n && (e !== 0 || 1 / e === 1 / n) || e !== e && n !== n;
  }
  var Dt = typeof Object.is == "function" ? Object.is : _0;
  function jo(e, n) {
    if (Dt(e, n)) return !0;
    if (typeof e != "object" || e === null || typeof n != "object" || n === null) return !1;
    var o = Object.keys(e), s = Object.keys(n);
    if (o.length !== s.length) return !1;
    for (s = 0; s < o.length; s++) {
      var u = o[s];
      if (!h.call(n, u) || !Dt(e[u], n[u])) return !1;
    }
    return !0;
  }
  function sf(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function lf(e, n) {
    var o = sf(e);
    e = 0;
    for (var s; o; ) {
      if (o.nodeType === 3) {
        if (s = e + o.textContent.length, e <= n && s >= n) return { node: o, offset: n - e };
        e = s;
      }
      e: {
        for (; o; ) {
          if (o.nextSibling) {
            o = o.nextSibling;
            break e;
          }
          o = o.parentNode;
        }
        o = void 0;
      }
      o = sf(o);
    }
  }
  function af(e, n) {
    return e && n ? e === n ? !0 : e && e.nodeType === 3 ? !1 : n && n.nodeType === 3 ? af(e, n.parentNode) : "contains" in e ? e.contains(n) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(n) & 16) : !1 : !1;
  }
  function uf() {
    for (var e = window, n = ve(); n instanceof e.HTMLIFrameElement; ) {
      try {
        var o = typeof n.contentWindow.location.href == "string";
      } catch {
        o = !1;
      }
      if (o) e = n.contentWindow;
      else break;
      n = ve(e.document);
    }
    return n;
  }
  function ua(e) {
    var n = e && e.nodeName && e.nodeName.toLowerCase();
    return n && (n === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || n === "textarea" || e.contentEditable === "true");
  }
  function S0(e) {
    var n = uf(), o = e.focusedElem, s = e.selectionRange;
    if (n !== o && o && o.ownerDocument && af(o.ownerDocument.documentElement, o)) {
      if (s !== null && ua(o)) {
        if (n = s.start, e = s.end, e === void 0 && (e = n), "selectionStart" in o) o.selectionStart = n, o.selectionEnd = Math.min(e, o.value.length);
        else if (e = (n = o.ownerDocument || document) && n.defaultView || window, e.getSelection) {
          e = e.getSelection();
          var u = o.textContent.length, d = Math.min(s.start, u);
          s = s.end === void 0 ? d : Math.min(s.end, u), !e.extend && d > s && (u = s, s = d, d = u), u = lf(o, d);
          var w = lf(
            o,
            s
          );
          u && w && (e.rangeCount !== 1 || e.anchorNode !== u.node || e.anchorOffset !== u.offset || e.focusNode !== w.node || e.focusOffset !== w.offset) && (n = n.createRange(), n.setStart(u.node, u.offset), e.removeAllRanges(), d > s ? (e.addRange(n), e.extend(w.node, w.offset)) : (n.setEnd(w.node, w.offset), e.addRange(n)));
        }
      }
      for (n = [], e = o; e = e.parentNode; ) e.nodeType === 1 && n.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
      for (typeof o.focus == "function" && o.focus(), o = 0; o < n.length; o++) e = n[o], e.element.scrollLeft = e.left, e.element.scrollTop = e.top;
    }
  }
  var k0 = p && "documentMode" in document && 11 >= document.documentMode, $r = null, ca = null, Ho = null, fa = !1;
  function cf(e, n, o) {
    var s = o.window === o ? o.document : o.nodeType === 9 ? o : o.ownerDocument;
    fa || $r == null || $r !== ve(s) || (s = $r, "selectionStart" in s && ua(s) ? s = { start: s.selectionStart, end: s.selectionEnd } : (s = (s.ownerDocument && s.ownerDocument.defaultView || window).getSelection(), s = { anchorNode: s.anchorNode, anchorOffset: s.anchorOffset, focusNode: s.focusNode, focusOffset: s.focusOffset }), Ho && jo(Ho, s) || (Ho = s, s = os(ca, "onSelect"), 0 < s.length && (n = new ta("onSelect", "select", null, n, o), e.push({ event: n, listeners: s }), n.target = $r)));
  }
  function ts(e, n) {
    var o = {};
    return o[e.toLowerCase()] = n.toLowerCase(), o["Webkit" + e] = "webkit" + n, o["Moz" + e] = "moz" + n, o;
  }
  var Or = { animationend: ts("Animation", "AnimationEnd"), animationiteration: ts("Animation", "AnimationIteration"), animationstart: ts("Animation", "AnimationStart"), transitionend: ts("Transition", "TransitionEnd") }, da = {}, ff = {};
  p && (ff = document.createElement("div").style, "AnimationEvent" in window || (delete Or.animationend.animation, delete Or.animationiteration.animation, delete Or.animationstart.animation), "TransitionEvent" in window || delete Or.transitionend.transition);
  function ns(e) {
    if (da[e]) return da[e];
    if (!Or[e]) return e;
    var n = Or[e], o;
    for (o in n) if (n.hasOwnProperty(o) && o in ff) return da[e] = n[o];
    return e;
  }
  var df = ns("animationend"), pf = ns("animationiteration"), hf = ns("animationstart"), gf = ns("transitionend"), mf = /* @__PURE__ */ new Map(), yf = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function zn(e, n) {
    mf.set(e, n), c(n, [e]);
  }
  for (var pa = 0; pa < yf.length; pa++) {
    var ha = yf[pa], E0 = ha.toLowerCase(), C0 = ha[0].toUpperCase() + ha.slice(1);
    zn(E0, "on" + C0);
  }
  zn(df, "onAnimationEnd"), zn(pf, "onAnimationIteration"), zn(hf, "onAnimationStart"), zn("dblclick", "onDoubleClick"), zn("focusin", "onFocus"), zn("focusout", "onBlur"), zn(gf, "onTransitionEnd"), f("onMouseEnter", ["mouseout", "mouseover"]), f("onMouseLeave", ["mouseout", "mouseover"]), f("onPointerEnter", ["pointerout", "pointerover"]), f("onPointerLeave", ["pointerout", "pointerover"]), c("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), c("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), c("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), c("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var Fo = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), N0 = new Set("cancel close invalid load scroll toggle".split(" ").concat(Fo));
  function vf(e, n, o) {
    var s = e.type || "unknown-event";
    e.currentTarget = o, jl(s, n, void 0, e), e.currentTarget = null;
  }
  function wf(e, n) {
    n = (n & 4) !== 0;
    for (var o = 0; o < e.length; o++) {
      var s = e[o], u = s.event;
      s = s.listeners;
      e: {
        var d = void 0;
        if (n) for (var w = s.length - 1; 0 <= w; w--) {
          var z = s[w], I = z.instance, G = z.currentTarget;
          if (z = z.listener, I !== d && u.isPropagationStopped()) break e;
          vf(u, z, G), d = I;
        }
        else for (w = 0; w < s.length; w++) {
          if (z = s[w], I = z.instance, G = z.currentTarget, z = z.listener, I !== d && u.isPropagationStopped()) break e;
          vf(u, z, G), d = I;
        }
      }
    }
    if (Mr) throw e = Eo, Mr = !1, Eo = null, e;
  }
  function De(e, n) {
    var o = n[Sa];
    o === void 0 && (o = n[Sa] = /* @__PURE__ */ new Set());
    var s = e + "__bubble";
    o.has(s) || (xf(n, e, 2, !1), o.add(s));
  }
  function ga(e, n, o) {
    var s = 0;
    n && (s |= 4), xf(o, e, s, n);
  }
  var rs = "_reactListening" + Math.random().toString(36).slice(2);
  function Vo(e) {
    if (!e[rs]) {
      e[rs] = !0, l.forEach(function(o) {
        o !== "selectionchange" && (N0.has(o) || ga(o, !1, e), ga(o, !0, e));
      });
      var n = e.nodeType === 9 ? e : e.ownerDocument;
      n === null || n[rs] || (n[rs] = !0, ga("selectionchange", !1, n));
    }
  }
  function xf(e, n, o, s) {
    switch (Vc(n)) {
      case 1:
        var u = Hm;
        break;
      case 4:
        u = Fm;
        break;
      default:
        u = ql;
    }
    o = u.bind(null, n, o, e), u = void 0, !ko || n !== "touchstart" && n !== "touchmove" && n !== "wheel" || (u = !0), s ? u !== void 0 ? e.addEventListener(n, o, { capture: !0, passive: u }) : e.addEventListener(n, o, !0) : u !== void 0 ? e.addEventListener(n, o, { passive: u }) : e.addEventListener(n, o, !1);
  }
  function ma(e, n, o, s, u) {
    var d = s;
    if ((n & 1) === 0 && (n & 2) === 0 && s !== null) e: for (; ; ) {
      if (s === null) return;
      var w = s.tag;
      if (w === 3 || w === 4) {
        var z = s.stateNode.containerInfo;
        if (z === u || z.nodeType === 8 && z.parentNode === u) break;
        if (w === 4) for (w = s.return; w !== null; ) {
          var I = w.tag;
          if ((I === 3 || I === 4) && (I = w.stateNode.containerInfo, I === u || I.nodeType === 8 && I.parentNode === u)) return;
          w = w.return;
        }
        for (; z !== null; ) {
          if (w = nr(z), w === null) return;
          if (I = w.tag, I === 5 || I === 6) {
            s = d = w;
            continue e;
          }
          z = z.parentNode;
        }
      }
      s = s.return;
    }
    $i(function() {
      var G = d, ne = xo(o), oe = [];
      e: {
        var te = mf.get(e);
        if (te !== void 0) {
          var fe = ta, pe = e;
          switch (e) {
            case "keypress":
              if (Gi(o) === 0) break e;
            case "keydown":
            case "keyup":
              fe = n0;
              break;
            case "focusin":
              pe = "focus", fe = oa;
              break;
            case "focusout":
              pe = "blur", fe = oa;
              break;
            case "beforeblur":
            case "afterblur":
              fe = oa;
              break;
            case "click":
              if (o.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              fe = Wc;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              fe = Um;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              fe = i0;
              break;
            case df:
            case pf:
            case hf:
              fe = Ym;
              break;
            case gf:
              fe = l0;
              break;
            case "scroll":
              fe = Vm;
              break;
            case "wheel":
              fe = u0;
              break;
            case "copy":
            case "cut":
            case "paste":
              fe = Qm;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              fe = Yc;
          }
          var he = (n & 4) !== 0, Be = !he && e === "scroll", X = he ? te !== null ? te + "Capture" : null : te;
          he = [];
          for (var L = G, Z; L !== null; ) {
            Z = L;
            var se = Z.stateNode;
            if (Z.tag === 5 && se !== null && (Z = se, X !== null && (se = Qn(L, X), se != null && he.push(Bo(L, se, Z)))), Be) break;
            L = L.return;
          }
          0 < he.length && (te = new fe(te, pe, null, o, ne), oe.push({ event: te, listeners: he }));
        }
      }
      if ((n & 7) === 0) {
        e: {
          if (te = e === "mouseover" || e === "pointerover", fe = e === "mouseout" || e === "pointerout", te && o !== wo && (pe = o.relatedTarget || o.fromElement) && (nr(pe) || pe[an])) break e;
          if ((fe || te) && (te = ne.window === ne ? ne : (te = ne.ownerDocument) ? te.defaultView || te.parentWindow : window, fe ? (pe = o.relatedTarget || o.toElement, fe = G, pe = pe ? nr(pe) : null, pe !== null && (Be = Qt(pe), pe !== Be || pe.tag !== 5 && pe.tag !== 6) && (pe = null)) : (fe = null, pe = G), fe !== pe)) {
            if (he = Wc, se = "onMouseLeave", X = "onMouseEnter", L = "mouse", (e === "pointerout" || e === "pointerover") && (he = Yc, se = "onPointerLeave", X = "onPointerEnter", L = "pointer"), Be = fe == null ? te : Hr(fe), Z = pe == null ? te : Hr(pe), te = new he(se, L + "leave", fe, o, ne), te.target = Be, te.relatedTarget = Z, se = null, nr(ne) === G && (he = new he(X, L + "enter", pe, o, ne), he.target = Z, he.relatedTarget = Be, se = he), Be = se, fe && pe) t: {
              for (he = fe, X = pe, L = 0, Z = he; Z; Z = Ar(Z)) L++;
              for (Z = 0, se = X; se; se = Ar(se)) Z++;
              for (; 0 < L - Z; ) he = Ar(he), L--;
              for (; 0 < Z - L; ) X = Ar(X), Z--;
              for (; L--; ) {
                if (he === X || X !== null && he === X.alternate) break t;
                he = Ar(he), X = Ar(X);
              }
              he = null;
            }
            else he = null;
            fe !== null && _f(oe, te, fe, he, !1), pe !== null && Be !== null && _f(oe, Be, pe, he, !0);
          }
        }
        e: {
          if (te = G ? Hr(G) : window, fe = te.nodeName && te.nodeName.toLowerCase(), fe === "select" || fe === "input" && te.type === "file") var ge = m0;
          else if (Jc(te)) if (tf) ge = x0;
          else {
            ge = v0;
            var xe = y0;
          }
          else (fe = te.nodeName) && fe.toLowerCase() === "input" && (te.type === "checkbox" || te.type === "radio") && (ge = w0);
          if (ge && (ge = ge(e, G))) {
            ef(oe, ge, o, ne);
            break e;
          }
          xe && xe(e, te, G), e === "focusout" && (xe = te._wrapperState) && xe.controlled && te.type === "number" && at(te, "number", te.value);
        }
        switch (xe = G ? Hr(G) : window, e) {
          case "focusin":
            (Jc(xe) || xe.contentEditable === "true") && ($r = xe, ca = G, Ho = null);
            break;
          case "focusout":
            Ho = ca = $r = null;
            break;
          case "mousedown":
            fa = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            fa = !1, cf(oe, o, ne);
            break;
          case "selectionchange":
            if (k0) break;
          case "keydown":
          case "keyup":
            cf(oe, o, ne);
        }
        var _e;
        if (sa) e: {
          switch (e) {
            case "compositionstart":
              var ke = "onCompositionStart";
              break e;
            case "compositionend":
              ke = "onCompositionEnd";
              break e;
            case "compositionupdate":
              ke = "onCompositionUpdate";
              break e;
          }
          ke = void 0;
        }
        else Lr ? Gc(e, o) && (ke = "onCompositionEnd") : e === "keydown" && o.keyCode === 229 && (ke = "onCompositionStart");
        ke && (Zc && o.locale !== "ko" && (Lr || ke !== "onCompositionStart" ? ke === "onCompositionEnd" && Lr && (_e = Bc()) : (Mn = ne, ea = "value" in Mn ? Mn.value : Mn.textContent, Lr = !0)), xe = os(G, ke), 0 < xe.length && (ke = new Xc(ke, e, null, o, ne), oe.push({ event: ke, listeners: xe }), _e ? ke.data = _e : (_e = qc(o), _e !== null && (ke.data = _e)))), (_e = f0 ? d0(e, o) : p0(e, o)) && (G = os(G, "onBeforeInput"), 0 < G.length && (ne = new Xc("onBeforeInput", "beforeinput", null, o, ne), oe.push({ event: ne, listeners: G }), ne.data = _e));
      }
      wf(oe, n);
    });
  }
  function Bo(e, n, o) {
    return { instance: e, listener: n, currentTarget: o };
  }
  function os(e, n) {
    for (var o = n + "Capture", s = []; e !== null; ) {
      var u = e, d = u.stateNode;
      u.tag === 5 && d !== null && (u = d, d = Qn(e, o), d != null && s.unshift(Bo(e, d, u)), d = Qn(e, n), d != null && s.push(Bo(e, d, u))), e = e.return;
    }
    return s;
  }
  function Ar(e) {
    if (e === null) return null;
    do
      e = e.return;
    while (e && e.tag !== 5);
    return e || null;
  }
  function _f(e, n, o, s, u) {
    for (var d = n._reactName, w = []; o !== null && o !== s; ) {
      var z = o, I = z.alternate, G = z.stateNode;
      if (I !== null && I === s) break;
      z.tag === 5 && G !== null && (z = G, u ? (I = Qn(o, d), I != null && w.unshift(Bo(o, I, z))) : u || (I = Qn(o, d), I != null && w.push(Bo(o, I, z)))), o = o.return;
    }
    w.length !== 0 && e.push({ event: n, listeners: w });
  }
  var M0 = /\r\n?/g, z0 = /\u0000|\uFFFD/g;
  function Sf(e) {
    return (typeof e == "string" ? e : "" + e).replace(M0, `
`).replace(z0, "");
  }
  function is(e, n, o) {
    if (n = Sf(n), Sf(e) !== n && o) throw Error(i(425));
  }
  function ss() {
  }
  var ya = null, va = null;
  function wa(e, n) {
    return e === "textarea" || e === "noscript" || typeof n.children == "string" || typeof n.children == "number" || typeof n.dangerouslySetInnerHTML == "object" && n.dangerouslySetInnerHTML !== null && n.dangerouslySetInnerHTML.__html != null;
  }
  var xa = typeof setTimeout == "function" ? setTimeout : void 0, P0 = typeof clearTimeout == "function" ? clearTimeout : void 0, kf = typeof Promise == "function" ? Promise : void 0, I0 = typeof queueMicrotask == "function" ? queueMicrotask : typeof kf < "u" ? function(e) {
    return kf.resolve(null).then(e).catch(T0);
  } : xa;
  function T0(e) {
    setTimeout(function() {
      throw e;
    });
  }
  function _a(e, n) {
    var o = n, s = 0;
    do {
      var u = o.nextSibling;
      if (e.removeChild(o), u && u.nodeType === 8) if (o = u.data, o === "/$") {
        if (s === 0) {
          e.removeChild(u), Ro(n);
          return;
        }
        s--;
      } else o !== "$" && o !== "$?" && o !== "$!" || s++;
      o = u;
    } while (o);
    Ro(n);
  }
  function Pn(e) {
    for (; e != null; e = e.nextSibling) {
      var n = e.nodeType;
      if (n === 1 || n === 3) break;
      if (n === 8) {
        if (n = e.data, n === "$" || n === "$!" || n === "$?") break;
        if (n === "/$") return null;
      }
    }
    return e;
  }
  function Ef(e) {
    e = e.previousSibling;
    for (var n = 0; e; ) {
      if (e.nodeType === 8) {
        var o = e.data;
        if (o === "$" || o === "$!" || o === "$?") {
          if (n === 0) return e;
          n--;
        } else o === "/$" && n++;
      }
      e = e.previousSibling;
    }
    return null;
  }
  var jr = Math.random().toString(36).slice(2), Kt = "__reactFiber$" + jr, Uo = "__reactProps$" + jr, an = "__reactContainer$" + jr, Sa = "__reactEvents$" + jr, b0 = "__reactListeners$" + jr, R0 = "__reactHandles$" + jr;
  function nr(e) {
    var n = e[Kt];
    if (n) return n;
    for (var o = e.parentNode; o; ) {
      if (n = o[an] || o[Kt]) {
        if (o = n.alternate, n.child !== null || o !== null && o.child !== null) for (e = Ef(e); e !== null; ) {
          if (o = e[Kt]) return o;
          e = Ef(e);
        }
        return n;
      }
      e = o, o = e.parentNode;
    }
    return null;
  }
  function Wo(e) {
    return e = e[Kt] || e[an], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
  }
  function Hr(e) {
    if (e.tag === 5 || e.tag === 6) return e.stateNode;
    throw Error(i(33));
  }
  function ls(e) {
    return e[Uo] || null;
  }
  var ka = [], Fr = -1;
  function In(e) {
    return { current: e };
  }
  function Le(e) {
    0 > Fr || (e.current = ka[Fr], ka[Fr] = null, Fr--);
  }
  function be(e, n) {
    Fr++, ka[Fr] = e.current, e.current = n;
  }
  var Tn = {}, nt = In(Tn), ct = In(!1), rr = Tn;
  function Vr(e, n) {
    var o = e.type.contextTypes;
    if (!o) return Tn;
    var s = e.stateNode;
    if (s && s.__reactInternalMemoizedUnmaskedChildContext === n) return s.__reactInternalMemoizedMaskedChildContext;
    var u = {}, d;
    for (d in o) u[d] = n[d];
    return s && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = n, e.__reactInternalMemoizedMaskedChildContext = u), u;
  }
  function ft(e) {
    return e = e.childContextTypes, e != null;
  }
  function as() {
    Le(ct), Le(nt);
  }
  function Cf(e, n, o) {
    if (nt.current !== Tn) throw Error(i(168));
    be(nt, n), be(ct, o);
  }
  function Nf(e, n, o) {
    var s = e.stateNode;
    if (n = n.childContextTypes, typeof s.getChildContext != "function") return o;
    s = s.getChildContext();
    for (var u in s) if (!(u in n)) throw Error(i(108, ue(e) || "Unknown", u));
    return U({}, o, s);
  }
  function us(e) {
    return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || Tn, rr = nt.current, be(nt, e), be(ct, ct.current), !0;
  }
  function Mf(e, n, o) {
    var s = e.stateNode;
    if (!s) throw Error(i(169));
    o ? (e = Nf(e, n, rr), s.__reactInternalMemoizedMergedChildContext = e, Le(ct), Le(nt), be(nt, e)) : Le(ct), be(ct, o);
  }
  var un = null, cs = !1, Ea = !1;
  function zf(e) {
    un === null ? un = [e] : un.push(e);
  }
  function D0(e) {
    cs = !0, zf(e);
  }
  function bn() {
    if (!Ea && un !== null) {
      Ea = !0;
      var e = 0, n = Te;
      try {
        var o = un;
        for (Te = 1; e < o.length; e++) {
          var s = o[e];
          do
            s = s(!0);
          while (s !== null);
        }
        un = null, cs = !1;
      } catch (u) {
        throw un !== null && (un = un.slice(e + 1)), ji(Mo, bn), u;
      } finally {
        Te = n, Ea = !1;
      }
    }
    return null;
  }
  var Br = [], Ur = 0, fs = null, ds = 0, zt = [], Pt = 0, or = null, cn = 1, fn = "";
  function ir(e, n) {
    Br[Ur++] = ds, Br[Ur++] = fs, fs = e, ds = n;
  }
  function Pf(e, n, o) {
    zt[Pt++] = cn, zt[Pt++] = fn, zt[Pt++] = or, or = e;
    var s = cn;
    e = fn;
    var u = 32 - vt(s) - 1;
    s &= ~(1 << u), o += 1;
    var d = 32 - vt(n) + u;
    if (30 < d) {
      var w = u - u % 5;
      d = (s & (1 << w) - 1).toString(32), s >>= w, u -= w, cn = 1 << 32 - vt(n) + u | o << u | s, fn = d + e;
    } else cn = 1 << d | o << u | s, fn = e;
  }
  function Ca(e) {
    e.return !== null && (ir(e, 1), Pf(e, 1, 0));
  }
  function Na(e) {
    for (; e === fs; ) fs = Br[--Ur], Br[Ur] = null, ds = Br[--Ur], Br[Ur] = null;
    for (; e === or; ) or = zt[--Pt], zt[Pt] = null, fn = zt[--Pt], zt[Pt] = null, cn = zt[--Pt], zt[Pt] = null;
  }
  var xt = null, _t = null, $e = !1, Lt = null;
  function If(e, n) {
    var o = Rt(5, null, null, 0);
    o.elementType = "DELETED", o.stateNode = n, o.return = e, n = e.deletions, n === null ? (e.deletions = [o], e.flags |= 16) : n.push(o);
  }
  function Tf(e, n) {
    switch (e.tag) {
      case 5:
        var o = e.type;
        return n = n.nodeType !== 1 || o.toLowerCase() !== n.nodeName.toLowerCase() ? null : n, n !== null ? (e.stateNode = n, xt = e, _t = Pn(n.firstChild), !0) : !1;
      case 6:
        return n = e.pendingProps === "" || n.nodeType !== 3 ? null : n, n !== null ? (e.stateNode = n, xt = e, _t = null, !0) : !1;
      case 13:
        return n = n.nodeType !== 8 ? null : n, n !== null ? (o = or !== null ? { id: cn, overflow: fn } : null, e.memoizedState = { dehydrated: n, treeContext: o, retryLane: 1073741824 }, o = Rt(18, null, null, 0), o.stateNode = n, o.return = e, e.child = o, xt = e, _t = null, !0) : !1;
      default:
        return !1;
    }
  }
  function Ma(e) {
    return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
  }
  function za(e) {
    if ($e) {
      var n = _t;
      if (n) {
        var o = n;
        if (!Tf(e, n)) {
          if (Ma(e)) throw Error(i(418));
          n = Pn(o.nextSibling);
          var s = xt;
          n && Tf(e, n) ? If(s, o) : (e.flags = e.flags & -4097 | 2, $e = !1, xt = e);
        }
      } else {
        if (Ma(e)) throw Error(i(418));
        e.flags = e.flags & -4097 | 2, $e = !1, xt = e;
      }
    }
  }
  function bf(e) {
    for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
    xt = e;
  }
  function ps(e) {
    if (e !== xt) return !1;
    if (!$e) return bf(e), $e = !0, !1;
    var n;
    if ((n = e.tag !== 3) && !(n = e.tag !== 5) && (n = e.type, n = n !== "head" && n !== "body" && !wa(e.type, e.memoizedProps)), n && (n = _t)) {
      if (Ma(e)) throw Rf(), Error(i(418));
      for (; n; ) If(e, n), n = Pn(n.nextSibling);
    }
    if (bf(e), e.tag === 13) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(i(317));
      e: {
        for (e = e.nextSibling, n = 0; e; ) {
          if (e.nodeType === 8) {
            var o = e.data;
            if (o === "/$") {
              if (n === 0) {
                _t = Pn(e.nextSibling);
                break e;
              }
              n--;
            } else o !== "$" && o !== "$!" && o !== "$?" || n++;
          }
          e = e.nextSibling;
        }
        _t = null;
      }
    } else _t = xt ? Pn(e.stateNode.nextSibling) : null;
    return !0;
  }
  function Rf() {
    for (var e = _t; e; ) e = Pn(e.nextSibling);
  }
  function Wr() {
    _t = xt = null, $e = !1;
  }
  function Pa(e) {
    Lt === null ? Lt = [e] : Lt.push(e);
  }
  var L0 = P.ReactCurrentBatchConfig;
  function Xo(e, n, o) {
    if (e = o.ref, e !== null && typeof e != "function" && typeof e != "object") {
      if (o._owner) {
        if (o = o._owner, o) {
          if (o.tag !== 1) throw Error(i(309));
          var s = o.stateNode;
        }
        if (!s) throw Error(i(147, e));
        var u = s, d = "" + e;
        return n !== null && n.ref !== null && typeof n.ref == "function" && n.ref._stringRef === d ? n.ref : (n = function(w) {
          var z = u.refs;
          w === null ? delete z[d] : z[d] = w;
        }, n._stringRef = d, n);
      }
      if (typeof e != "string") throw Error(i(284));
      if (!o._owner) throw Error(i(290, e));
    }
    return e;
  }
  function hs(e, n) {
    throw e = Object.prototype.toString.call(n), Error(i(31, e === "[object Object]" ? "object with keys {" + Object.keys(n).join(", ") + "}" : e));
  }
  function Df(e) {
    var n = e._init;
    return n(e._payload);
  }
  function Lf(e) {
    function n(X, L) {
      if (e) {
        var Z = X.deletions;
        Z === null ? (X.deletions = [L], X.flags |= 16) : Z.push(L);
      }
    }
    function o(X, L) {
      if (!e) return null;
      for (; L !== null; ) n(X, L), L = L.sibling;
      return null;
    }
    function s(X, L) {
      for (X = /* @__PURE__ */ new Map(); L !== null; ) L.key !== null ? X.set(L.key, L) : X.set(L.index, L), L = L.sibling;
      return X;
    }
    function u(X, L) {
      return X = Hn(X, L), X.index = 0, X.sibling = null, X;
    }
    function d(X, L, Z) {
      return X.index = Z, e ? (Z = X.alternate, Z !== null ? (Z = Z.index, Z < L ? (X.flags |= 2, L) : Z) : (X.flags |= 2, L)) : (X.flags |= 1048576, L);
    }
    function w(X) {
      return e && X.alternate === null && (X.flags |= 2), X;
    }
    function z(X, L, Z, se) {
      return L === null || L.tag !== 6 ? (L = xu(Z, X.mode, se), L.return = X, L) : (L = u(L, Z), L.return = X, L);
    }
    function I(X, L, Z, se) {
      var ge = Z.type;
      return ge === F ? ne(X, L, Z.props.children, se, Z.key) : L !== null && (L.elementType === ge || typeof ge == "object" && ge !== null && ge.$$typeof === O && Df(ge) === L.type) ? (se = u(L, Z.props), se.ref = Xo(X, L, Z), se.return = X, se) : (se = As(Z.type, Z.key, Z.props, null, X.mode, se), se.ref = Xo(X, L, Z), se.return = X, se);
    }
    function G(X, L, Z, se) {
      return L === null || L.tag !== 4 || L.stateNode.containerInfo !== Z.containerInfo || L.stateNode.implementation !== Z.implementation ? (L = _u(Z, X.mode, se), L.return = X, L) : (L = u(L, Z.children || []), L.return = X, L);
    }
    function ne(X, L, Z, se, ge) {
      return L === null || L.tag !== 7 ? (L = pr(Z, X.mode, se, ge), L.return = X, L) : (L = u(L, Z), L.return = X, L);
    }
    function oe(X, L, Z) {
      if (typeof L == "string" && L !== "" || typeof L == "number") return L = xu("" + L, X.mode, Z), L.return = X, L;
      if (typeof L == "object" && L !== null) {
        switch (L.$$typeof) {
          case B:
            return Z = As(L.type, L.key, L.props, null, X.mode, Z), Z.ref = Xo(X, null, L), Z.return = X, Z;
          case D:
            return L = _u(L, X.mode, Z), L.return = X, L;
          case O:
            var se = L._init;
            return oe(X, se(L._payload), Z);
        }
        if (et(L) || j(L)) return L = pr(L, X.mode, Z, null), L.return = X, L;
        hs(X, L);
      }
      return null;
    }
    function te(X, L, Z, se) {
      var ge = L !== null ? L.key : null;
      if (typeof Z == "string" && Z !== "" || typeof Z == "number") return ge !== null ? null : z(X, L, "" + Z, se);
      if (typeof Z == "object" && Z !== null) {
        switch (Z.$$typeof) {
          case B:
            return Z.key === ge ? I(X, L, Z, se) : null;
          case D:
            return Z.key === ge ? G(X, L, Z, se) : null;
          case O:
            return ge = Z._init, te(
              X,
              L,
              ge(Z._payload),
              se
            );
        }
        if (et(Z) || j(Z)) return ge !== null ? null : ne(X, L, Z, se, null);
        hs(X, Z);
      }
      return null;
    }
    function fe(X, L, Z, se, ge) {
      if (typeof se == "string" && se !== "" || typeof se == "number") return X = X.get(Z) || null, z(L, X, "" + se, ge);
      if (typeof se == "object" && se !== null) {
        switch (se.$$typeof) {
          case B:
            return X = X.get(se.key === null ? Z : se.key) || null, I(L, X, se, ge);
          case D:
            return X = X.get(se.key === null ? Z : se.key) || null, G(L, X, se, ge);
          case O:
            var xe = se._init;
            return fe(X, L, Z, xe(se._payload), ge);
        }
        if (et(se) || j(se)) return X = X.get(Z) || null, ne(L, X, se, ge, null);
        hs(L, se);
      }
      return null;
    }
    function pe(X, L, Z, se) {
      for (var ge = null, xe = null, _e = L, ke = L = 0, Ke = null; _e !== null && ke < Z.length; ke++) {
        _e.index > ke ? (Ke = _e, _e = null) : Ke = _e.sibling;
        var Ie = te(X, _e, Z[ke], se);
        if (Ie === null) {
          _e === null && (_e = Ke);
          break;
        }
        e && _e && Ie.alternate === null && n(X, _e), L = d(Ie, L, ke), xe === null ? ge = Ie : xe.sibling = Ie, xe = Ie, _e = Ke;
      }
      if (ke === Z.length) return o(X, _e), $e && ir(X, ke), ge;
      if (_e === null) {
        for (; ke < Z.length; ke++) _e = oe(X, Z[ke], se), _e !== null && (L = d(_e, L, ke), xe === null ? ge = _e : xe.sibling = _e, xe = _e);
        return $e && ir(X, ke), ge;
      }
      for (_e = s(X, _e); ke < Z.length; ke++) Ke = fe(_e, X, ke, Z[ke], se), Ke !== null && (e && Ke.alternate !== null && _e.delete(Ke.key === null ? ke : Ke.key), L = d(Ke, L, ke), xe === null ? ge = Ke : xe.sibling = Ke, xe = Ke);
      return e && _e.forEach(function(Fn) {
        return n(X, Fn);
      }), $e && ir(X, ke), ge;
    }
    function he(X, L, Z, se) {
      var ge = j(Z);
      if (typeof ge != "function") throw Error(i(150));
      if (Z = ge.call(Z), Z == null) throw Error(i(151));
      for (var xe = ge = null, _e = L, ke = L = 0, Ke = null, Ie = Z.next(); _e !== null && !Ie.done; ke++, Ie = Z.next()) {
        _e.index > ke ? (Ke = _e, _e = null) : Ke = _e.sibling;
        var Fn = te(X, _e, Ie.value, se);
        if (Fn === null) {
          _e === null && (_e = Ke);
          break;
        }
        e && _e && Fn.alternate === null && n(X, _e), L = d(Fn, L, ke), xe === null ? ge = Fn : xe.sibling = Fn, xe = Fn, _e = Ke;
      }
      if (Ie.done) return o(
        X,
        _e
      ), $e && ir(X, ke), ge;
      if (_e === null) {
        for (; !Ie.done; ke++, Ie = Z.next()) Ie = oe(X, Ie.value, se), Ie !== null && (L = d(Ie, L, ke), xe === null ? ge = Ie : xe.sibling = Ie, xe = Ie);
        return $e && ir(X, ke), ge;
      }
      for (_e = s(X, _e); !Ie.done; ke++, Ie = Z.next()) Ie = fe(_e, X, ke, Ie.value, se), Ie !== null && (e && Ie.alternate !== null && _e.delete(Ie.key === null ? ke : Ie.key), L = d(Ie, L, ke), xe === null ? ge = Ie : xe.sibling = Ie, xe = Ie);
      return e && _e.forEach(function(hy) {
        return n(X, hy);
      }), $e && ir(X, ke), ge;
    }
    function Be(X, L, Z, se) {
      if (typeof Z == "object" && Z !== null && Z.type === F && Z.key === null && (Z = Z.props.children), typeof Z == "object" && Z !== null) {
        switch (Z.$$typeof) {
          case B:
            e: {
              for (var ge = Z.key, xe = L; xe !== null; ) {
                if (xe.key === ge) {
                  if (ge = Z.type, ge === F) {
                    if (xe.tag === 7) {
                      o(X, xe.sibling), L = u(xe, Z.props.children), L.return = X, X = L;
                      break e;
                    }
                  } else if (xe.elementType === ge || typeof ge == "object" && ge !== null && ge.$$typeof === O && Df(ge) === xe.type) {
                    o(X, xe.sibling), L = u(xe, Z.props), L.ref = Xo(X, xe, Z), L.return = X, X = L;
                    break e;
                  }
                  o(X, xe);
                  break;
                } else n(X, xe);
                xe = xe.sibling;
              }
              Z.type === F ? (L = pr(Z.props.children, X.mode, se, Z.key), L.return = X, X = L) : (se = As(Z.type, Z.key, Z.props, null, X.mode, se), se.ref = Xo(X, L, Z), se.return = X, X = se);
            }
            return w(X);
          case D:
            e: {
              for (xe = Z.key; L !== null; ) {
                if (L.key === xe) if (L.tag === 4 && L.stateNode.containerInfo === Z.containerInfo && L.stateNode.implementation === Z.implementation) {
                  o(X, L.sibling), L = u(L, Z.children || []), L.return = X, X = L;
                  break e;
                } else {
                  o(X, L);
                  break;
                }
                else n(X, L);
                L = L.sibling;
              }
              L = _u(Z, X.mode, se), L.return = X, X = L;
            }
            return w(X);
          case O:
            return xe = Z._init, Be(X, L, xe(Z._payload), se);
        }
        if (et(Z)) return pe(X, L, Z, se);
        if (j(Z)) return he(X, L, Z, se);
        hs(X, Z);
      }
      return typeof Z == "string" && Z !== "" || typeof Z == "number" ? (Z = "" + Z, L !== null && L.tag === 6 ? (o(X, L.sibling), L = u(L, Z), L.return = X, X = L) : (o(X, L), L = xu(Z, X.mode, se), L.return = X, X = L), w(X)) : o(X, L);
    }
    return Be;
  }
  var Xr = Lf(!0), $f = Lf(!1), gs = In(null), ms = null, Yr = null, Ia = null;
  function Ta() {
    Ia = Yr = ms = null;
  }
  function ba(e) {
    var n = gs.current;
    Le(gs), e._currentValue = n;
  }
  function Ra(e, n, o) {
    for (; e !== null; ) {
      var s = e.alternate;
      if ((e.childLanes & n) !== n ? (e.childLanes |= n, s !== null && (s.childLanes |= n)) : s !== null && (s.childLanes & n) !== n && (s.childLanes |= n), e === o) break;
      e = e.return;
    }
  }
  function Zr(e, n) {
    ms = e, Ia = Yr = null, e = e.dependencies, e !== null && e.firstContext !== null && ((e.lanes & n) !== 0 && (dt = !0), e.firstContext = null);
  }
  function It(e) {
    var n = e._currentValue;
    if (Ia !== e) if (e = { context: e, memoizedValue: n, next: null }, Yr === null) {
      if (ms === null) throw Error(i(308));
      Yr = e, ms.dependencies = { lanes: 0, firstContext: e };
    } else Yr = Yr.next = e;
    return n;
  }
  var sr = null;
  function Da(e) {
    sr === null ? sr = [e] : sr.push(e);
  }
  function Of(e, n, o, s) {
    var u = n.interleaved;
    return u === null ? (o.next = o, Da(n)) : (o.next = u.next, u.next = o), n.interleaved = o, dn(e, s);
  }
  function dn(e, n) {
    e.lanes |= n;
    var o = e.alternate;
    for (o !== null && (o.lanes |= n), o = e, e = e.return; e !== null; ) e.childLanes |= n, o = e.alternate, o !== null && (o.childLanes |= n), o = e, e = e.return;
    return o.tag === 3 ? o.stateNode : null;
  }
  var Rn = !1;
  function La(e) {
    e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
  }
  function Af(e, n) {
    e = e.updateQueue, n.updateQueue === e && (n.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
  }
  function pn(e, n) {
    return { eventTime: e, lane: n, tag: 0, payload: null, callback: null, next: null };
  }
  function Dn(e, n, o) {
    var s = e.updateQueue;
    if (s === null) return null;
    if (s = s.shared, (Pe & 2) !== 0) {
      var u = s.pending;
      return u === null ? n.next = n : (n.next = u.next, u.next = n), s.pending = n, dn(e, o);
    }
    return u = s.interleaved, u === null ? (n.next = n, Da(s)) : (n.next = u.next, u.next = n), s.interleaved = n, dn(e, o);
  }
  function ys(e, n, o) {
    if (n = n.updateQueue, n !== null && (n = n.shared, (o & 4194240) !== 0)) {
      var s = n.lanes;
      s &= e.pendingLanes, o |= s, n.lanes = o, br(e, o);
    }
  }
  function jf(e, n) {
    var o = e.updateQueue, s = e.alternate;
    if (s !== null && (s = s.updateQueue, o === s)) {
      var u = null, d = null;
      if (o = o.firstBaseUpdate, o !== null) {
        do {
          var w = { eventTime: o.eventTime, lane: o.lane, tag: o.tag, payload: o.payload, callback: o.callback, next: null };
          d === null ? u = d = w : d = d.next = w, o = o.next;
        } while (o !== null);
        d === null ? u = d = n : d = d.next = n;
      } else u = d = n;
      o = { baseState: s.baseState, firstBaseUpdate: u, lastBaseUpdate: d, shared: s.shared, effects: s.effects }, e.updateQueue = o;
      return;
    }
    e = o.lastBaseUpdate, e === null ? o.firstBaseUpdate = n : e.next = n, o.lastBaseUpdate = n;
  }
  function vs(e, n, o, s) {
    var u = e.updateQueue;
    Rn = !1;
    var d = u.firstBaseUpdate, w = u.lastBaseUpdate, z = u.shared.pending;
    if (z !== null) {
      u.shared.pending = null;
      var I = z, G = I.next;
      I.next = null, w === null ? d = G : w.next = G, w = I;
      var ne = e.alternate;
      ne !== null && (ne = ne.updateQueue, z = ne.lastBaseUpdate, z !== w && (z === null ? ne.firstBaseUpdate = G : z.next = G, ne.lastBaseUpdate = I));
    }
    if (d !== null) {
      var oe = u.baseState;
      w = 0, ne = G = I = null, z = d;
      do {
        var te = z.lane, fe = z.eventTime;
        if ((s & te) === te) {
          ne !== null && (ne = ne.next = {
            eventTime: fe,
            lane: 0,
            tag: z.tag,
            payload: z.payload,
            callback: z.callback,
            next: null
          });
          e: {
            var pe = e, he = z;
            switch (te = n, fe = o, he.tag) {
              case 1:
                if (pe = he.payload, typeof pe == "function") {
                  oe = pe.call(fe, oe, te);
                  break e;
                }
                oe = pe;
                break e;
              case 3:
                pe.flags = pe.flags & -65537 | 128;
              case 0:
                if (pe = he.payload, te = typeof pe == "function" ? pe.call(fe, oe, te) : pe, te == null) break e;
                oe = U({}, oe, te);
                break e;
              case 2:
                Rn = !0;
            }
          }
          z.callback !== null && z.lane !== 0 && (e.flags |= 64, te = u.effects, te === null ? u.effects = [z] : te.push(z));
        } else fe = { eventTime: fe, lane: te, tag: z.tag, payload: z.payload, callback: z.callback, next: null }, ne === null ? (G = ne = fe, I = oe) : ne = ne.next = fe, w |= te;
        if (z = z.next, z === null) {
          if (z = u.shared.pending, z === null) break;
          te = z, z = te.next, te.next = null, u.lastBaseUpdate = te, u.shared.pending = null;
        }
      } while (!0);
      if (ne === null && (I = oe), u.baseState = I, u.firstBaseUpdate = G, u.lastBaseUpdate = ne, n = u.shared.interleaved, n !== null) {
        u = n;
        do
          w |= u.lane, u = u.next;
        while (u !== n);
      } else d === null && (u.shared.lanes = 0);
      ur |= w, e.lanes = w, e.memoizedState = oe;
    }
  }
  function Hf(e, n, o) {
    if (e = n.effects, n.effects = null, e !== null) for (n = 0; n < e.length; n++) {
      var s = e[n], u = s.callback;
      if (u !== null) {
        if (s.callback = null, s = o, typeof u != "function") throw Error(i(191, u));
        u.call(s);
      }
    }
  }
  var Yo = {}, Gt = In(Yo), Zo = In(Yo), Qo = In(Yo);
  function lr(e) {
    if (e === Yo) throw Error(i(174));
    return e;
  }
  function $a(e, n) {
    switch (be(Qo, n), be(Zo, e), be(Gt, Yo), e = n.nodeType, e) {
      case 9:
      case 11:
        n = (n = n.documentElement) ? n.namespaceURI : mt(null, "");
        break;
      default:
        e = e === 8 ? n.parentNode : n, n = e.namespaceURI || null, e = e.tagName, n = mt(n, e);
    }
    Le(Gt), be(Gt, n);
  }
  function Qr() {
    Le(Gt), Le(Zo), Le(Qo);
  }
  function Ff(e) {
    lr(Qo.current);
    var n = lr(Gt.current), o = mt(n, e.type);
    n !== o && (be(Zo, e), be(Gt, o));
  }
  function Oa(e) {
    Zo.current === e && (Le(Gt), Le(Zo));
  }
  var Ae = In(0);
  function ws(e) {
    for (var n = e; n !== null; ) {
      if (n.tag === 13) {
        var o = n.memoizedState;
        if (o !== null && (o = o.dehydrated, o === null || o.data === "$?" || o.data === "$!")) return n;
      } else if (n.tag === 19 && n.memoizedProps.revealOrder !== void 0) {
        if ((n.flags & 128) !== 0) return n;
      } else if (n.child !== null) {
        n.child.return = n, n = n.child;
        continue;
      }
      if (n === e) break;
      for (; n.sibling === null; ) {
        if (n.return === null || n.return === e) return null;
        n = n.return;
      }
      n.sibling.return = n.return, n = n.sibling;
    }
    return null;
  }
  var Aa = [];
  function ja() {
    for (var e = 0; e < Aa.length; e++) Aa[e]._workInProgressVersionPrimary = null;
    Aa.length = 0;
  }
  var xs = P.ReactCurrentDispatcher, Ha = P.ReactCurrentBatchConfig, ar = 0, je = null, Xe = null, Ze = null, _s = !1, Ko = !1, Go = 0, $0 = 0;
  function rt() {
    throw Error(i(321));
  }
  function Fa(e, n) {
    if (n === null) return !1;
    for (var o = 0; o < n.length && o < e.length; o++) if (!Dt(e[o], n[o])) return !1;
    return !0;
  }
  function Va(e, n, o, s, u, d) {
    if (ar = d, je = n, n.memoizedState = null, n.updateQueue = null, n.lanes = 0, xs.current = e === null || e.memoizedState === null ? H0 : F0, e = o(s, u), Ko) {
      d = 0;
      do {
        if (Ko = !1, Go = 0, 25 <= d) throw Error(i(301));
        d += 1, Ze = Xe = null, n.updateQueue = null, xs.current = V0, e = o(s, u);
      } while (Ko);
    }
    if (xs.current = Es, n = Xe !== null && Xe.next !== null, ar = 0, Ze = Xe = je = null, _s = !1, n) throw Error(i(300));
    return e;
  }
  function Ba() {
    var e = Go !== 0;
    return Go = 0, e;
  }
  function qt() {
    var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
    return Ze === null ? je.memoizedState = Ze = e : Ze = Ze.next = e, Ze;
  }
  function Tt() {
    if (Xe === null) {
      var e = je.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = Xe.next;
    var n = Ze === null ? je.memoizedState : Ze.next;
    if (n !== null) Ze = n, Xe = e;
    else {
      if (e === null) throw Error(i(310));
      Xe = e, e = { memoizedState: Xe.memoizedState, baseState: Xe.baseState, baseQueue: Xe.baseQueue, queue: Xe.queue, next: null }, Ze === null ? je.memoizedState = Ze = e : Ze = Ze.next = e;
    }
    return Ze;
  }
  function qo(e, n) {
    return typeof n == "function" ? n(e) : n;
  }
  function Ua(e) {
    var n = Tt(), o = n.queue;
    if (o === null) throw Error(i(311));
    o.lastRenderedReducer = e;
    var s = Xe, u = s.baseQueue, d = o.pending;
    if (d !== null) {
      if (u !== null) {
        var w = u.next;
        u.next = d.next, d.next = w;
      }
      s.baseQueue = u = d, o.pending = null;
    }
    if (u !== null) {
      d = u.next, s = s.baseState;
      var z = w = null, I = null, G = d;
      do {
        var ne = G.lane;
        if ((ar & ne) === ne) I !== null && (I = I.next = { lane: 0, action: G.action, hasEagerState: G.hasEagerState, eagerState: G.eagerState, next: null }), s = G.hasEagerState ? G.eagerState : e(s, G.action);
        else {
          var oe = {
            lane: ne,
            action: G.action,
            hasEagerState: G.hasEagerState,
            eagerState: G.eagerState,
            next: null
          };
          I === null ? (z = I = oe, w = s) : I = I.next = oe, je.lanes |= ne, ur |= ne;
        }
        G = G.next;
      } while (G !== null && G !== d);
      I === null ? w = s : I.next = z, Dt(s, n.memoizedState) || (dt = !0), n.memoizedState = s, n.baseState = w, n.baseQueue = I, o.lastRenderedState = s;
    }
    if (e = o.interleaved, e !== null) {
      u = e;
      do
        d = u.lane, je.lanes |= d, ur |= d, u = u.next;
      while (u !== e);
    } else u === null && (o.lanes = 0);
    return [n.memoizedState, o.dispatch];
  }
  function Wa(e) {
    var n = Tt(), o = n.queue;
    if (o === null) throw Error(i(311));
    o.lastRenderedReducer = e;
    var s = o.dispatch, u = o.pending, d = n.memoizedState;
    if (u !== null) {
      o.pending = null;
      var w = u = u.next;
      do
        d = e(d, w.action), w = w.next;
      while (w !== u);
      Dt(d, n.memoizedState) || (dt = !0), n.memoizedState = d, n.baseQueue === null && (n.baseState = d), o.lastRenderedState = d;
    }
    return [d, s];
  }
  function Vf() {
  }
  function Bf(e, n) {
    var o = je, s = Tt(), u = n(), d = !Dt(s.memoizedState, u);
    if (d && (s.memoizedState = u, dt = !0), s = s.queue, Xa(Xf.bind(null, o, s, e), [e]), s.getSnapshot !== n || d || Ze !== null && Ze.memoizedState.tag & 1) {
      if (o.flags |= 2048, Jo(9, Wf.bind(null, o, s, u, n), void 0, null), Qe === null) throw Error(i(349));
      (ar & 30) !== 0 || Uf(o, n, u);
    }
    return u;
  }
  function Uf(e, n, o) {
    e.flags |= 16384, e = { getSnapshot: n, value: o }, n = je.updateQueue, n === null ? (n = { lastEffect: null, stores: null }, je.updateQueue = n, n.stores = [e]) : (o = n.stores, o === null ? n.stores = [e] : o.push(e));
  }
  function Wf(e, n, o, s) {
    n.value = o, n.getSnapshot = s, Yf(n) && Zf(e);
  }
  function Xf(e, n, o) {
    return o(function() {
      Yf(n) && Zf(e);
    });
  }
  function Yf(e) {
    var n = e.getSnapshot;
    e = e.value;
    try {
      var o = n();
      return !Dt(e, o);
    } catch {
      return !0;
    }
  }
  function Zf(e) {
    var n = dn(e, 1);
    n !== null && jt(n, e, 1, -1);
  }
  function Qf(e) {
    var n = qt();
    return typeof e == "function" && (e = e()), n.memoizedState = n.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: qo, lastRenderedState: e }, n.queue = e, e = e.dispatch = j0.bind(null, je, e), [n.memoizedState, e];
  }
  function Jo(e, n, o, s) {
    return e = { tag: e, create: n, destroy: o, deps: s, next: null }, n = je.updateQueue, n === null ? (n = { lastEffect: null, stores: null }, je.updateQueue = n, n.lastEffect = e.next = e) : (o = n.lastEffect, o === null ? n.lastEffect = e.next = e : (s = o.next, o.next = e, e.next = s, n.lastEffect = e)), e;
  }
  function Kf() {
    return Tt().memoizedState;
  }
  function Ss(e, n, o, s) {
    var u = qt();
    je.flags |= e, u.memoizedState = Jo(1 | n, o, void 0, s === void 0 ? null : s);
  }
  function ks(e, n, o, s) {
    var u = Tt();
    s = s === void 0 ? null : s;
    var d = void 0;
    if (Xe !== null) {
      var w = Xe.memoizedState;
      if (d = w.destroy, s !== null && Fa(s, w.deps)) {
        u.memoizedState = Jo(n, o, d, s);
        return;
      }
    }
    je.flags |= e, u.memoizedState = Jo(1 | n, o, d, s);
  }
  function Gf(e, n) {
    return Ss(8390656, 8, e, n);
  }
  function Xa(e, n) {
    return ks(2048, 8, e, n);
  }
  function qf(e, n) {
    return ks(4, 2, e, n);
  }
  function Jf(e, n) {
    return ks(4, 4, e, n);
  }
  function ed(e, n) {
    if (typeof n == "function") return e = e(), n(e), function() {
      n(null);
    };
    if (n != null) return e = e(), n.current = e, function() {
      n.current = null;
    };
  }
  function td(e, n, o) {
    return o = o != null ? o.concat([e]) : null, ks(4, 4, ed.bind(null, n, e), o);
  }
  function Ya() {
  }
  function nd(e, n) {
    var o = Tt();
    n = n === void 0 ? null : n;
    var s = o.memoizedState;
    return s !== null && n !== null && Fa(n, s[1]) ? s[0] : (o.memoizedState = [e, n], e);
  }
  function rd(e, n) {
    var o = Tt();
    n = n === void 0 ? null : n;
    var s = o.memoizedState;
    return s !== null && n !== null && Fa(n, s[1]) ? s[0] : (e = e(), o.memoizedState = [e, n], e);
  }
  function od(e, n, o) {
    return (ar & 21) === 0 ? (e.baseState && (e.baseState = !1, dt = !0), e.memoizedState = o) : (Dt(o, n) || (o = Wi(), je.lanes |= o, ur |= o, e.baseState = !0), n);
  }
  function O0(e, n) {
    var o = Te;
    Te = o !== 0 && 4 > o ? o : 4, e(!0);
    var s = Ha.transition;
    Ha.transition = {};
    try {
      e(!1), n();
    } finally {
      Te = o, Ha.transition = s;
    }
  }
  function id() {
    return Tt().memoizedState;
  }
  function A0(e, n, o) {
    var s = An(e);
    if (o = { lane: s, action: o, hasEagerState: !1, eagerState: null, next: null }, sd(e)) ld(n, o);
    else if (o = Of(e, n, o, s), o !== null) {
      var u = lt();
      jt(o, e, s, u), ad(o, n, s);
    }
  }
  function j0(e, n, o) {
    var s = An(e), u = { lane: s, action: o, hasEagerState: !1, eagerState: null, next: null };
    if (sd(e)) ld(n, u);
    else {
      var d = e.alternate;
      if (e.lanes === 0 && (d === null || d.lanes === 0) && (d = n.lastRenderedReducer, d !== null)) try {
        var w = n.lastRenderedState, z = d(w, o);
        if (u.hasEagerState = !0, u.eagerState = z, Dt(z, w)) {
          var I = n.interleaved;
          I === null ? (u.next = u, Da(n)) : (u.next = I.next, I.next = u), n.interleaved = u;
          return;
        }
      } catch {
      } finally {
      }
      o = Of(e, n, u, s), o !== null && (u = lt(), jt(o, e, s, u), ad(o, n, s));
    }
  }
  function sd(e) {
    var n = e.alternate;
    return e === je || n !== null && n === je;
  }
  function ld(e, n) {
    Ko = _s = !0;
    var o = e.pending;
    o === null ? n.next = n : (n.next = o.next, o.next = n), e.pending = n;
  }
  function ad(e, n, o) {
    if ((o & 4194240) !== 0) {
      var s = n.lanes;
      s &= e.pendingLanes, o |= s, n.lanes = o, br(e, o);
    }
  }
  var Es = { readContext: It, useCallback: rt, useContext: rt, useEffect: rt, useImperativeHandle: rt, useInsertionEffect: rt, useLayoutEffect: rt, useMemo: rt, useReducer: rt, useRef: rt, useState: rt, useDebugValue: rt, useDeferredValue: rt, useTransition: rt, useMutableSource: rt, useSyncExternalStore: rt, useId: rt, unstable_isNewReconciler: !1 }, H0 = { readContext: It, useCallback: function(e, n) {
    return qt().memoizedState = [e, n === void 0 ? null : n], e;
  }, useContext: It, useEffect: Gf, useImperativeHandle: function(e, n, o) {
    return o = o != null ? o.concat([e]) : null, Ss(
      4194308,
      4,
      ed.bind(null, n, e),
      o
    );
  }, useLayoutEffect: function(e, n) {
    return Ss(4194308, 4, e, n);
  }, useInsertionEffect: function(e, n) {
    return Ss(4, 2, e, n);
  }, useMemo: function(e, n) {
    var o = qt();
    return n = n === void 0 ? null : n, e = e(), o.memoizedState = [e, n], e;
  }, useReducer: function(e, n, o) {
    var s = qt();
    return n = o !== void 0 ? o(n) : n, s.memoizedState = s.baseState = n, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: n }, s.queue = e, e = e.dispatch = A0.bind(null, je, e), [s.memoizedState, e];
  }, useRef: function(e) {
    var n = qt();
    return e = { current: e }, n.memoizedState = e;
  }, useState: Qf, useDebugValue: Ya, useDeferredValue: function(e) {
    return qt().memoizedState = e;
  }, useTransition: function() {
    var e = Qf(!1), n = e[0];
    return e = O0.bind(null, e[1]), qt().memoizedState = e, [n, e];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(e, n, o) {
    var s = je, u = qt();
    if ($e) {
      if (o === void 0) throw Error(i(407));
      o = o();
    } else {
      if (o = n(), Qe === null) throw Error(i(349));
      (ar & 30) !== 0 || Uf(s, n, o);
    }
    u.memoizedState = o;
    var d = { value: o, getSnapshot: n };
    return u.queue = d, Gf(Xf.bind(
      null,
      s,
      d,
      e
    ), [e]), s.flags |= 2048, Jo(9, Wf.bind(null, s, d, o, n), void 0, null), o;
  }, useId: function() {
    var e = qt(), n = Qe.identifierPrefix;
    if ($e) {
      var o = fn, s = cn;
      o = (s & ~(1 << 32 - vt(s) - 1)).toString(32) + o, n = ":" + n + "R" + o, o = Go++, 0 < o && (n += "H" + o.toString(32)), n += ":";
    } else o = $0++, n = ":" + n + "r" + o.toString(32) + ":";
    return e.memoizedState = n;
  }, unstable_isNewReconciler: !1 }, F0 = {
    readContext: It,
    useCallback: nd,
    useContext: It,
    useEffect: Xa,
    useImperativeHandle: td,
    useInsertionEffect: qf,
    useLayoutEffect: Jf,
    useMemo: rd,
    useReducer: Ua,
    useRef: Kf,
    useState: function() {
      return Ua(qo);
    },
    useDebugValue: Ya,
    useDeferredValue: function(e) {
      var n = Tt();
      return od(n, Xe.memoizedState, e);
    },
    useTransition: function() {
      var e = Ua(qo)[0], n = Tt().memoizedState;
      return [e, n];
    },
    useMutableSource: Vf,
    useSyncExternalStore: Bf,
    useId: id,
    unstable_isNewReconciler: !1
  }, V0 = { readContext: It, useCallback: nd, useContext: It, useEffect: Xa, useImperativeHandle: td, useInsertionEffect: qf, useLayoutEffect: Jf, useMemo: rd, useReducer: Wa, useRef: Kf, useState: function() {
    return Wa(qo);
  }, useDebugValue: Ya, useDeferredValue: function(e) {
    var n = Tt();
    return Xe === null ? n.memoizedState = e : od(n, Xe.memoizedState, e);
  }, useTransition: function() {
    var e = Wa(qo)[0], n = Tt().memoizedState;
    return [e, n];
  }, useMutableSource: Vf, useSyncExternalStore: Bf, useId: id, unstable_isNewReconciler: !1 };
  function $t(e, n) {
    if (e && e.defaultProps) {
      n = U({}, n), e = e.defaultProps;
      for (var o in e) n[o] === void 0 && (n[o] = e[o]);
      return n;
    }
    return n;
  }
  function Za(e, n, o, s) {
    n = e.memoizedState, o = o(s, n), o = o == null ? n : U({}, n, o), e.memoizedState = o, e.lanes === 0 && (e.updateQueue.baseState = o);
  }
  var Cs = { isMounted: function(e) {
    return (e = e._reactInternals) ? Qt(e) === e : !1;
  }, enqueueSetState: function(e, n, o) {
    e = e._reactInternals;
    var s = lt(), u = An(e), d = pn(s, u);
    d.payload = n, o != null && (d.callback = o), n = Dn(e, d, u), n !== null && (jt(n, e, u, s), ys(n, e, u));
  }, enqueueReplaceState: function(e, n, o) {
    e = e._reactInternals;
    var s = lt(), u = An(e), d = pn(s, u);
    d.tag = 1, d.payload = n, o != null && (d.callback = o), n = Dn(e, d, u), n !== null && (jt(n, e, u, s), ys(n, e, u));
  }, enqueueForceUpdate: function(e, n) {
    e = e._reactInternals;
    var o = lt(), s = An(e), u = pn(o, s);
    u.tag = 2, n != null && (u.callback = n), n = Dn(e, u, s), n !== null && (jt(n, e, s, o), ys(n, e, s));
  } };
  function ud(e, n, o, s, u, d, w) {
    return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(s, d, w) : n.prototype && n.prototype.isPureReactComponent ? !jo(o, s) || !jo(u, d) : !0;
  }
  function cd(e, n, o) {
    var s = !1, u = Tn, d = n.contextType;
    return typeof d == "object" && d !== null ? d = It(d) : (u = ft(n) ? rr : nt.current, s = n.contextTypes, d = (s = s != null) ? Vr(e, u) : Tn), n = new n(o, d), e.memoizedState = n.state !== null && n.state !== void 0 ? n.state : null, n.updater = Cs, e.stateNode = n, n._reactInternals = e, s && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = u, e.__reactInternalMemoizedMaskedChildContext = d), n;
  }
  function fd(e, n, o, s) {
    e = n.state, typeof n.componentWillReceiveProps == "function" && n.componentWillReceiveProps(o, s), typeof n.UNSAFE_componentWillReceiveProps == "function" && n.UNSAFE_componentWillReceiveProps(o, s), n.state !== e && Cs.enqueueReplaceState(n, n.state, null);
  }
  function Qa(e, n, o, s) {
    var u = e.stateNode;
    u.props = o, u.state = e.memoizedState, u.refs = {}, La(e);
    var d = n.contextType;
    typeof d == "object" && d !== null ? u.context = It(d) : (d = ft(n) ? rr : nt.current, u.context = Vr(e, d)), u.state = e.memoizedState, d = n.getDerivedStateFromProps, typeof d == "function" && (Za(e, n, d, o), u.state = e.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof u.getSnapshotBeforeUpdate == "function" || typeof u.UNSAFE_componentWillMount != "function" && typeof u.componentWillMount != "function" || (n = u.state, typeof u.componentWillMount == "function" && u.componentWillMount(), typeof u.UNSAFE_componentWillMount == "function" && u.UNSAFE_componentWillMount(), n !== u.state && Cs.enqueueReplaceState(u, u.state, null), vs(e, o, u, s), u.state = e.memoizedState), typeof u.componentDidMount == "function" && (e.flags |= 4194308);
  }
  function Kr(e, n) {
    try {
      var o = "", s = n;
      do
        o += ae(s), s = s.return;
      while (s);
      var u = o;
    } catch (d) {
      u = `
Error generating stack: ` + d.message + `
` + d.stack;
    }
    return { value: e, source: n, stack: u, digest: null };
  }
  function Ka(e, n, o) {
    return { value: e, source: null, stack: o ?? null, digest: n ?? null };
  }
  function Ga(e, n) {
    try {
      console.error(n.value);
    } catch (o) {
      setTimeout(function() {
        throw o;
      });
    }
  }
  var B0 = typeof WeakMap == "function" ? WeakMap : Map;
  function dd(e, n, o) {
    o = pn(-1, o), o.tag = 3, o.payload = { element: null };
    var s = n.value;
    return o.callback = function() {
      bs || (bs = !0, du = s), Ga(e, n);
    }, o;
  }
  function pd(e, n, o) {
    o = pn(-1, o), o.tag = 3;
    var s = e.type.getDerivedStateFromError;
    if (typeof s == "function") {
      var u = n.value;
      o.payload = function() {
        return s(u);
      }, o.callback = function() {
        Ga(e, n);
      };
    }
    var d = e.stateNode;
    return d !== null && typeof d.componentDidCatch == "function" && (o.callback = function() {
      Ga(e, n), typeof s != "function" && ($n === null ? $n = /* @__PURE__ */ new Set([this]) : $n.add(this));
      var w = n.stack;
      this.componentDidCatch(n.value, { componentStack: w !== null ? w : "" });
    }), o;
  }
  function hd(e, n, o) {
    var s = e.pingCache;
    if (s === null) {
      s = e.pingCache = new B0();
      var u = /* @__PURE__ */ new Set();
      s.set(n, u);
    } else u = s.get(n), u === void 0 && (u = /* @__PURE__ */ new Set(), s.set(n, u));
    u.has(o) || (u.add(o), e = ry.bind(null, e, n, o), n.then(e, e));
  }
  function gd(e) {
    do {
      var n;
      if ((n = e.tag === 13) && (n = e.memoizedState, n = n !== null ? n.dehydrated !== null : !0), n) return e;
      e = e.return;
    } while (e !== null);
    return null;
  }
  function md(e, n, o, s, u) {
    return (e.mode & 1) === 0 ? (e === n ? e.flags |= 65536 : (e.flags |= 128, o.flags |= 131072, o.flags &= -52805, o.tag === 1 && (o.alternate === null ? o.tag = 17 : (n = pn(-1, 1), n.tag = 2, Dn(o, n, 1))), o.lanes |= 1), e) : (e.flags |= 65536, e.lanes = u, e);
  }
  var U0 = P.ReactCurrentOwner, dt = !1;
  function st(e, n, o, s) {
    n.child = e === null ? $f(n, null, o, s) : Xr(n, e.child, o, s);
  }
  function yd(e, n, o, s, u) {
    o = o.render;
    var d = n.ref;
    return Zr(n, u), s = Va(e, n, o, s, d, u), o = Ba(), e !== null && !dt ? (n.updateQueue = e.updateQueue, n.flags &= -2053, e.lanes &= ~u, hn(e, n, u)) : ($e && o && Ca(n), n.flags |= 1, st(e, n, s, u), n.child);
  }
  function vd(e, n, o, s, u) {
    if (e === null) {
      var d = o.type;
      return typeof d == "function" && !wu(d) && d.defaultProps === void 0 && o.compare === null && o.defaultProps === void 0 ? (n.tag = 15, n.type = d, wd(e, n, d, s, u)) : (e = As(o.type, null, s, n, n.mode, u), e.ref = n.ref, e.return = n, n.child = e);
    }
    if (d = e.child, (e.lanes & u) === 0) {
      var w = d.memoizedProps;
      if (o = o.compare, o = o !== null ? o : jo, o(w, s) && e.ref === n.ref) return hn(e, n, u);
    }
    return n.flags |= 1, e = Hn(d, s), e.ref = n.ref, e.return = n, n.child = e;
  }
  function wd(e, n, o, s, u) {
    if (e !== null) {
      var d = e.memoizedProps;
      if (jo(d, s) && e.ref === n.ref) if (dt = !1, n.pendingProps = s = d, (e.lanes & u) !== 0) (e.flags & 131072) !== 0 && (dt = !0);
      else return n.lanes = e.lanes, hn(e, n, u);
    }
    return qa(e, n, o, s, u);
  }
  function xd(e, n, o) {
    var s = n.pendingProps, u = s.children, d = e !== null ? e.memoizedState : null;
    if (s.mode === "hidden") if ((n.mode & 1) === 0) n.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, be(qr, St), St |= o;
    else {
      if ((o & 1073741824) === 0) return e = d !== null ? d.baseLanes | o : o, n.lanes = n.childLanes = 1073741824, n.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, n.updateQueue = null, be(qr, St), St |= e, null;
      n.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, s = d !== null ? d.baseLanes : o, be(qr, St), St |= s;
    }
    else d !== null ? (s = d.baseLanes | o, n.memoizedState = null) : s = o, be(qr, St), St |= s;
    return st(e, n, u, o), n.child;
  }
  function _d(e, n) {
    var o = n.ref;
    (e === null && o !== null || e !== null && e.ref !== o) && (n.flags |= 512, n.flags |= 2097152);
  }
  function qa(e, n, o, s, u) {
    var d = ft(o) ? rr : nt.current;
    return d = Vr(n, d), Zr(n, u), o = Va(e, n, o, s, d, u), s = Ba(), e !== null && !dt ? (n.updateQueue = e.updateQueue, n.flags &= -2053, e.lanes &= ~u, hn(e, n, u)) : ($e && s && Ca(n), n.flags |= 1, st(e, n, o, u), n.child);
  }
  function Sd(e, n, o, s, u) {
    if (ft(o)) {
      var d = !0;
      us(n);
    } else d = !1;
    if (Zr(n, u), n.stateNode === null) Ms(e, n), cd(n, o, s), Qa(n, o, s, u), s = !0;
    else if (e === null) {
      var w = n.stateNode, z = n.memoizedProps;
      w.props = z;
      var I = w.context, G = o.contextType;
      typeof G == "object" && G !== null ? G = It(G) : (G = ft(o) ? rr : nt.current, G = Vr(n, G));
      var ne = o.getDerivedStateFromProps, oe = typeof ne == "function" || typeof w.getSnapshotBeforeUpdate == "function";
      oe || typeof w.UNSAFE_componentWillReceiveProps != "function" && typeof w.componentWillReceiveProps != "function" || (z !== s || I !== G) && fd(n, w, s, G), Rn = !1;
      var te = n.memoizedState;
      w.state = te, vs(n, s, w, u), I = n.memoizedState, z !== s || te !== I || ct.current || Rn ? (typeof ne == "function" && (Za(n, o, ne, s), I = n.memoizedState), (z = Rn || ud(n, o, z, s, te, I, G)) ? (oe || typeof w.UNSAFE_componentWillMount != "function" && typeof w.componentWillMount != "function" || (typeof w.componentWillMount == "function" && w.componentWillMount(), typeof w.UNSAFE_componentWillMount == "function" && w.UNSAFE_componentWillMount()), typeof w.componentDidMount == "function" && (n.flags |= 4194308)) : (typeof w.componentDidMount == "function" && (n.flags |= 4194308), n.memoizedProps = s, n.memoizedState = I), w.props = s, w.state = I, w.context = G, s = z) : (typeof w.componentDidMount == "function" && (n.flags |= 4194308), s = !1);
    } else {
      w = n.stateNode, Af(e, n), z = n.memoizedProps, G = n.type === n.elementType ? z : $t(n.type, z), w.props = G, oe = n.pendingProps, te = w.context, I = o.contextType, typeof I == "object" && I !== null ? I = It(I) : (I = ft(o) ? rr : nt.current, I = Vr(n, I));
      var fe = o.getDerivedStateFromProps;
      (ne = typeof fe == "function" || typeof w.getSnapshotBeforeUpdate == "function") || typeof w.UNSAFE_componentWillReceiveProps != "function" && typeof w.componentWillReceiveProps != "function" || (z !== oe || te !== I) && fd(n, w, s, I), Rn = !1, te = n.memoizedState, w.state = te, vs(n, s, w, u);
      var pe = n.memoizedState;
      z !== oe || te !== pe || ct.current || Rn ? (typeof fe == "function" && (Za(n, o, fe, s), pe = n.memoizedState), (G = Rn || ud(n, o, G, s, te, pe, I) || !1) ? (ne || typeof w.UNSAFE_componentWillUpdate != "function" && typeof w.componentWillUpdate != "function" || (typeof w.componentWillUpdate == "function" && w.componentWillUpdate(s, pe, I), typeof w.UNSAFE_componentWillUpdate == "function" && w.UNSAFE_componentWillUpdate(s, pe, I)), typeof w.componentDidUpdate == "function" && (n.flags |= 4), typeof w.getSnapshotBeforeUpdate == "function" && (n.flags |= 1024)) : (typeof w.componentDidUpdate != "function" || z === e.memoizedProps && te === e.memoizedState || (n.flags |= 4), typeof w.getSnapshotBeforeUpdate != "function" || z === e.memoizedProps && te === e.memoizedState || (n.flags |= 1024), n.memoizedProps = s, n.memoizedState = pe), w.props = s, w.state = pe, w.context = I, s = G) : (typeof w.componentDidUpdate != "function" || z === e.memoizedProps && te === e.memoizedState || (n.flags |= 4), typeof w.getSnapshotBeforeUpdate != "function" || z === e.memoizedProps && te === e.memoizedState || (n.flags |= 1024), s = !1);
    }
    return Ja(e, n, o, s, d, u);
  }
  function Ja(e, n, o, s, u, d) {
    _d(e, n);
    var w = (n.flags & 128) !== 0;
    if (!s && !w) return u && Mf(n, o, !1), hn(e, n, d);
    s = n.stateNode, U0.current = n;
    var z = w && typeof o.getDerivedStateFromError != "function" ? null : s.render();
    return n.flags |= 1, e !== null && w ? (n.child = Xr(n, e.child, null, d), n.child = Xr(n, null, z, d)) : st(e, n, z, d), n.memoizedState = s.state, u && Mf(n, o, !0), n.child;
  }
  function kd(e) {
    var n = e.stateNode;
    n.pendingContext ? Cf(e, n.pendingContext, n.pendingContext !== n.context) : n.context && Cf(e, n.context, !1), $a(e, n.containerInfo);
  }
  function Ed(e, n, o, s, u) {
    return Wr(), Pa(u), n.flags |= 256, st(e, n, o, s), n.child;
  }
  var eu = { dehydrated: null, treeContext: null, retryLane: 0 };
  function tu(e) {
    return { baseLanes: e, cachePool: null, transitions: null };
  }
  function Cd(e, n, o) {
    var s = n.pendingProps, u = Ae.current, d = !1, w = (n.flags & 128) !== 0, z;
    if ((z = w) || (z = e !== null && e.memoizedState === null ? !1 : (u & 2) !== 0), z ? (d = !0, n.flags &= -129) : (e === null || e.memoizedState !== null) && (u |= 1), be(Ae, u & 1), e === null)
      return za(n), e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? ((n.mode & 1) === 0 ? n.lanes = 1 : e.data === "$!" ? n.lanes = 8 : n.lanes = 1073741824, null) : (w = s.children, e = s.fallback, d ? (s = n.mode, d = n.child, w = { mode: "hidden", children: w }, (s & 1) === 0 && d !== null ? (d.childLanes = 0, d.pendingProps = w) : d = js(w, s, 0, null), e = pr(e, s, o, null), d.return = n, e.return = n, d.sibling = e, n.child = d, n.child.memoizedState = tu(o), n.memoizedState = eu, e) : nu(n, w));
    if (u = e.memoizedState, u !== null && (z = u.dehydrated, z !== null)) return W0(e, n, w, s, z, u, o);
    if (d) {
      d = s.fallback, w = n.mode, u = e.child, z = u.sibling;
      var I = { mode: "hidden", children: s.children };
      return (w & 1) === 0 && n.child !== u ? (s = n.child, s.childLanes = 0, s.pendingProps = I, n.deletions = null) : (s = Hn(u, I), s.subtreeFlags = u.subtreeFlags & 14680064), z !== null ? d = Hn(z, d) : (d = pr(d, w, o, null), d.flags |= 2), d.return = n, s.return = n, s.sibling = d, n.child = s, s = d, d = n.child, w = e.child.memoizedState, w = w === null ? tu(o) : { baseLanes: w.baseLanes | o, cachePool: null, transitions: w.transitions }, d.memoizedState = w, d.childLanes = e.childLanes & ~o, n.memoizedState = eu, s;
    }
    return d = e.child, e = d.sibling, s = Hn(d, { mode: "visible", children: s.children }), (n.mode & 1) === 0 && (s.lanes = o), s.return = n, s.sibling = null, e !== null && (o = n.deletions, o === null ? (n.deletions = [e], n.flags |= 16) : o.push(e)), n.child = s, n.memoizedState = null, s;
  }
  function nu(e, n) {
    return n = js({ mode: "visible", children: n }, e.mode, 0, null), n.return = e, e.child = n;
  }
  function Ns(e, n, o, s) {
    return s !== null && Pa(s), Xr(n, e.child, null, o), e = nu(n, n.pendingProps.children), e.flags |= 2, n.memoizedState = null, e;
  }
  function W0(e, n, o, s, u, d, w) {
    if (o)
      return n.flags & 256 ? (n.flags &= -257, s = Ka(Error(i(422))), Ns(e, n, w, s)) : n.memoizedState !== null ? (n.child = e.child, n.flags |= 128, null) : (d = s.fallback, u = n.mode, s = js({ mode: "visible", children: s.children }, u, 0, null), d = pr(d, u, w, null), d.flags |= 2, s.return = n, d.return = n, s.sibling = d, n.child = s, (n.mode & 1) !== 0 && Xr(n, e.child, null, w), n.child.memoizedState = tu(w), n.memoizedState = eu, d);
    if ((n.mode & 1) === 0) return Ns(e, n, w, null);
    if (u.data === "$!") {
      if (s = u.nextSibling && u.nextSibling.dataset, s) var z = s.dgst;
      return s = z, d = Error(i(419)), s = Ka(d, s, void 0), Ns(e, n, w, s);
    }
    if (z = (w & e.childLanes) !== 0, dt || z) {
      if (s = Qe, s !== null) {
        switch (w & -w) {
          case 4:
            u = 2;
            break;
          case 16:
            u = 8;
            break;
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            u = 32;
            break;
          case 536870912:
            u = 268435456;
            break;
          default:
            u = 0;
        }
        u = (u & (s.suspendedLanes | w)) !== 0 ? 0 : u, u !== 0 && u !== d.retryLane && (d.retryLane = u, dn(e, u), jt(s, e, u, -1));
      }
      return vu(), s = Ka(Error(i(421))), Ns(e, n, w, s);
    }
    return u.data === "$?" ? (n.flags |= 128, n.child = e.child, n = oy.bind(null, e), u._reactRetry = n, null) : (e = d.treeContext, _t = Pn(u.nextSibling), xt = n, $e = !0, Lt = null, e !== null && (zt[Pt++] = cn, zt[Pt++] = fn, zt[Pt++] = or, cn = e.id, fn = e.overflow, or = n), n = nu(n, s.children), n.flags |= 4096, n);
  }
  function Nd(e, n, o) {
    e.lanes |= n;
    var s = e.alternate;
    s !== null && (s.lanes |= n), Ra(e.return, n, o);
  }
  function ru(e, n, o, s, u) {
    var d = e.memoizedState;
    d === null ? e.memoizedState = { isBackwards: n, rendering: null, renderingStartTime: 0, last: s, tail: o, tailMode: u } : (d.isBackwards = n, d.rendering = null, d.renderingStartTime = 0, d.last = s, d.tail = o, d.tailMode = u);
  }
  function Md(e, n, o) {
    var s = n.pendingProps, u = s.revealOrder, d = s.tail;
    if (st(e, n, s.children, o), s = Ae.current, (s & 2) !== 0) s = s & 1 | 2, n.flags |= 128;
    else {
      if (e !== null && (e.flags & 128) !== 0) e: for (e = n.child; e !== null; ) {
        if (e.tag === 13) e.memoizedState !== null && Nd(e, o, n);
        else if (e.tag === 19) Nd(e, o, n);
        else if (e.child !== null) {
          e.child.return = e, e = e.child;
          continue;
        }
        if (e === n) break e;
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === n) break e;
          e = e.return;
        }
        e.sibling.return = e.return, e = e.sibling;
      }
      s &= 1;
    }
    if (be(Ae, s), (n.mode & 1) === 0) n.memoizedState = null;
    else switch (u) {
      case "forwards":
        for (o = n.child, u = null; o !== null; ) e = o.alternate, e !== null && ws(e) === null && (u = o), o = o.sibling;
        o = u, o === null ? (u = n.child, n.child = null) : (u = o.sibling, o.sibling = null), ru(n, !1, u, o, d);
        break;
      case "backwards":
        for (o = null, u = n.child, n.child = null; u !== null; ) {
          if (e = u.alternate, e !== null && ws(e) === null) {
            n.child = u;
            break;
          }
          e = u.sibling, u.sibling = o, o = u, u = e;
        }
        ru(n, !0, o, null, d);
        break;
      case "together":
        ru(n, !1, null, null, void 0);
        break;
      default:
        n.memoizedState = null;
    }
    return n.child;
  }
  function Ms(e, n) {
    (n.mode & 1) === 0 && e !== null && (e.alternate = null, n.alternate = null, n.flags |= 2);
  }
  function hn(e, n, o) {
    if (e !== null && (n.dependencies = e.dependencies), ur |= n.lanes, (o & n.childLanes) === 0) return null;
    if (e !== null && n.child !== e.child) throw Error(i(153));
    if (n.child !== null) {
      for (e = n.child, o = Hn(e, e.pendingProps), n.child = o, o.return = n; e.sibling !== null; ) e = e.sibling, o = o.sibling = Hn(e, e.pendingProps), o.return = n;
      o.sibling = null;
    }
    return n.child;
  }
  function X0(e, n, o) {
    switch (n.tag) {
      case 3:
        kd(n), Wr();
        break;
      case 5:
        Ff(n);
        break;
      case 1:
        ft(n.type) && us(n);
        break;
      case 4:
        $a(n, n.stateNode.containerInfo);
        break;
      case 10:
        var s = n.type._context, u = n.memoizedProps.value;
        be(gs, s._currentValue), s._currentValue = u;
        break;
      case 13:
        if (s = n.memoizedState, s !== null)
          return s.dehydrated !== null ? (be(Ae, Ae.current & 1), n.flags |= 128, null) : (o & n.child.childLanes) !== 0 ? Cd(e, n, o) : (be(Ae, Ae.current & 1), e = hn(e, n, o), e !== null ? e.sibling : null);
        be(Ae, Ae.current & 1);
        break;
      case 19:
        if (s = (o & n.childLanes) !== 0, (e.flags & 128) !== 0) {
          if (s) return Md(e, n, o);
          n.flags |= 128;
        }
        if (u = n.memoizedState, u !== null && (u.rendering = null, u.tail = null, u.lastEffect = null), be(Ae, Ae.current), s) break;
        return null;
      case 22:
      case 23:
        return n.lanes = 0, xd(e, n, o);
    }
    return hn(e, n, o);
  }
  var zd, ou, Pd, Id;
  zd = function(e, n) {
    for (var o = n.child; o !== null; ) {
      if (o.tag === 5 || o.tag === 6) e.appendChild(o.stateNode);
      else if (o.tag !== 4 && o.child !== null) {
        o.child.return = o, o = o.child;
        continue;
      }
      if (o === n) break;
      for (; o.sibling === null; ) {
        if (o.return === null || o.return === n) return;
        o = o.return;
      }
      o.sibling.return = o.return, o = o.sibling;
    }
  }, ou = function() {
  }, Pd = function(e, n, o, s) {
    var u = e.memoizedProps;
    if (u !== s) {
      e = n.stateNode, lr(Gt.current);
      var d = null;
      switch (o) {
        case "input":
          u = Ee(e, u), s = Ee(e, s), d = [];
          break;
        case "select":
          u = U({}, u, { value: void 0 }), s = U({}, s, { value: void 0 }), d = [];
          break;
        case "textarea":
          u = sn(e, u), s = sn(e, s), d = [];
          break;
        default:
          typeof u.onClick != "function" && typeof s.onClick == "function" && (e.onclick = ss);
      }
      yo(o, s);
      var w;
      o = null;
      for (G in u) if (!s.hasOwnProperty(G) && u.hasOwnProperty(G) && u[G] != null) if (G === "style") {
        var z = u[G];
        for (w in z) z.hasOwnProperty(w) && (o || (o = {}), o[w] = "");
      } else G !== "dangerouslySetInnerHTML" && G !== "children" && G !== "suppressContentEditableWarning" && G !== "suppressHydrationWarning" && G !== "autoFocus" && (a.hasOwnProperty(G) ? d || (d = []) : (d = d || []).push(G, null));
      for (G in s) {
        var I = s[G];
        if (z = u?.[G], s.hasOwnProperty(G) && I !== z && (I != null || z != null)) if (G === "style") if (z) {
          for (w in z) !z.hasOwnProperty(w) || I && I.hasOwnProperty(w) || (o || (o = {}), o[w] = "");
          for (w in I) I.hasOwnProperty(w) && z[w] !== I[w] && (o || (o = {}), o[w] = I[w]);
        } else o || (d || (d = []), d.push(
          G,
          o
        )), o = I;
        else G === "dangerouslySetInnerHTML" ? (I = I ? I.__html : void 0, z = z ? z.__html : void 0, I != null && z !== I && (d = d || []).push(G, I)) : G === "children" ? typeof I != "string" && typeof I != "number" || (d = d || []).push(G, "" + I) : G !== "suppressContentEditableWarning" && G !== "suppressHydrationWarning" && (a.hasOwnProperty(G) ? (I != null && G === "onScroll" && De("scroll", e), d || z === I || (d = [])) : (d = d || []).push(G, I));
      }
      o && (d = d || []).push("style", o);
      var G = d;
      (n.updateQueue = G) && (n.flags |= 4);
    }
  }, Id = function(e, n, o, s) {
    o !== s && (n.flags |= 4);
  };
  function ei(e, n) {
    if (!$e) switch (e.tailMode) {
      case "hidden":
        n = e.tail;
        for (var o = null; n !== null; ) n.alternate !== null && (o = n), n = n.sibling;
        o === null ? e.tail = null : o.sibling = null;
        break;
      case "collapsed":
        o = e.tail;
        for (var s = null; o !== null; ) o.alternate !== null && (s = o), o = o.sibling;
        s === null ? n || e.tail === null ? e.tail = null : e.tail.sibling = null : s.sibling = null;
    }
  }
  function ot(e) {
    var n = e.alternate !== null && e.alternate.child === e.child, o = 0, s = 0;
    if (n) for (var u = e.child; u !== null; ) o |= u.lanes | u.childLanes, s |= u.subtreeFlags & 14680064, s |= u.flags & 14680064, u.return = e, u = u.sibling;
    else for (u = e.child; u !== null; ) o |= u.lanes | u.childLanes, s |= u.subtreeFlags, s |= u.flags, u.return = e, u = u.sibling;
    return e.subtreeFlags |= s, e.childLanes = o, n;
  }
  function Y0(e, n, o) {
    var s = n.pendingProps;
    switch (Na(n), n.tag) {
      case 2:
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return ot(n), null;
      case 1:
        return ft(n.type) && as(), ot(n), null;
      case 3:
        return s = n.stateNode, Qr(), Le(ct), Le(nt), ja(), s.pendingContext && (s.context = s.pendingContext, s.pendingContext = null), (e === null || e.child === null) && (ps(n) ? n.flags |= 4 : e === null || e.memoizedState.isDehydrated && (n.flags & 256) === 0 || (n.flags |= 1024, Lt !== null && (gu(Lt), Lt = null))), ou(e, n), ot(n), null;
      case 5:
        Oa(n);
        var u = lr(Qo.current);
        if (o = n.type, e !== null && n.stateNode != null) Pd(e, n, o, s, u), e.ref !== n.ref && (n.flags |= 512, n.flags |= 2097152);
        else {
          if (!s) {
            if (n.stateNode === null) throw Error(i(166));
            return ot(n), null;
          }
          if (e = lr(Gt.current), ps(n)) {
            s = n.stateNode, o = n.type;
            var d = n.memoizedProps;
            switch (s[Kt] = n, s[Uo] = d, e = (n.mode & 1) !== 0, o) {
              case "dialog":
                De("cancel", s), De("close", s);
                break;
              case "iframe":
              case "object":
              case "embed":
                De("load", s);
                break;
              case "video":
              case "audio":
                for (u = 0; u < Fo.length; u++) De(Fo[u], s);
                break;
              case "source":
                De("error", s);
                break;
              case "img":
              case "image":
              case "link":
                De(
                  "error",
                  s
                ), De("load", s);
                break;
              case "details":
                De("toggle", s);
                break;
              case "input":
                Ce(s, d), De("invalid", s);
                break;
              case "select":
                s._wrapperState = { wasMultiple: !!d.multiple }, De("invalid", s);
                break;
              case "textarea":
                Yt(s, d), De("invalid", s);
            }
            yo(o, d), u = null;
            for (var w in d) if (d.hasOwnProperty(w)) {
              var z = d[w];
              w === "children" ? typeof z == "string" ? s.textContent !== z && (d.suppressHydrationWarning !== !0 && is(s.textContent, z, e), u = ["children", z]) : typeof z == "number" && s.textContent !== "" + z && (d.suppressHydrationWarning !== !0 && is(
                s.textContent,
                z,
                e
              ), u = ["children", "" + z]) : a.hasOwnProperty(w) && z != null && w === "onScroll" && De("scroll", s);
            }
            switch (o) {
              case "input":
                Se(s), Ct(s, d, !0);
                break;
              case "textarea":
                Se(s), ut(s);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof d.onClick == "function" && (s.onclick = ss);
            }
            s = u, n.updateQueue = s, s !== null && (n.flags |= 4);
          } else {
            w = u.nodeType === 9 ? u : u.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = Nt(o)), e === "http://www.w3.org/1999/xhtml" ? o === "script" ? (e = w.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof s.is == "string" ? e = w.createElement(o, { is: s.is }) : (e = w.createElement(o), o === "select" && (w = e, s.multiple ? w.multiple = !0 : s.size && (w.size = s.size))) : e = w.createElementNS(e, o), e[Kt] = n, e[Uo] = s, zd(e, n, !1, !1), n.stateNode = e;
            e: {
              switch (w = vo(o, s), o) {
                case "dialog":
                  De("cancel", e), De("close", e), u = s;
                  break;
                case "iframe":
                case "object":
                case "embed":
                  De("load", e), u = s;
                  break;
                case "video":
                case "audio":
                  for (u = 0; u < Fo.length; u++) De(Fo[u], e);
                  u = s;
                  break;
                case "source":
                  De("error", e), u = s;
                  break;
                case "img":
                case "image":
                case "link":
                  De(
                    "error",
                    e
                  ), De("load", e), u = s;
                  break;
                case "details":
                  De("toggle", e), u = s;
                  break;
                case "input":
                  Ce(e, s), u = Ee(e, s), De("invalid", e);
                  break;
                case "option":
                  u = s;
                  break;
                case "select":
                  e._wrapperState = { wasMultiple: !!s.multiple }, u = U({}, s, { value: void 0 }), De("invalid", e);
                  break;
                case "textarea":
                  Yt(e, s), u = sn(e, s), De("invalid", e);
                  break;
                default:
                  u = s;
              }
              yo(o, u), z = u;
              for (d in z) if (z.hasOwnProperty(d)) {
                var I = z[d];
                d === "style" ? Ii(e, I) : d === "dangerouslySetInnerHTML" ? (I = I ? I.__html : void 0, I != null && Cr(e, I)) : d === "children" ? typeof I == "string" ? (o !== "textarea" || I !== "") && ln(e, I) : typeof I == "number" && ln(e, "" + I) : d !== "suppressContentEditableWarning" && d !== "suppressHydrationWarning" && d !== "autoFocus" && (a.hasOwnProperty(d) ? I != null && d === "onScroll" && De("scroll", e) : I != null && S(e, d, I, w));
              }
              switch (o) {
                case "input":
                  Se(e), Ct(e, s, !1);
                  break;
                case "textarea":
                  Se(e), ut(e);
                  break;
                case "option":
                  s.value != null && e.setAttribute("value", "" + q(s.value));
                  break;
                case "select":
                  e.multiple = !!s.multiple, d = s.value, d != null ? tt(e, !!s.multiple, d, !1) : s.defaultValue != null && tt(
                    e,
                    !!s.multiple,
                    s.defaultValue,
                    !0
                  );
                  break;
                default:
                  typeof u.onClick == "function" && (e.onclick = ss);
              }
              switch (o) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  s = !!s.autoFocus;
                  break e;
                case "img":
                  s = !0;
                  break e;
                default:
                  s = !1;
              }
            }
            s && (n.flags |= 4);
          }
          n.ref !== null && (n.flags |= 512, n.flags |= 2097152);
        }
        return ot(n), null;
      case 6:
        if (e && n.stateNode != null) Id(e, n, e.memoizedProps, s);
        else {
          if (typeof s != "string" && n.stateNode === null) throw Error(i(166));
          if (o = lr(Qo.current), lr(Gt.current), ps(n)) {
            if (s = n.stateNode, o = n.memoizedProps, s[Kt] = n, (d = s.nodeValue !== o) && (e = xt, e !== null)) switch (e.tag) {
              case 3:
                is(s.nodeValue, o, (e.mode & 1) !== 0);
                break;
              case 5:
                e.memoizedProps.suppressHydrationWarning !== !0 && is(s.nodeValue, o, (e.mode & 1) !== 0);
            }
            d && (n.flags |= 4);
          } else s = (o.nodeType === 9 ? o : o.ownerDocument).createTextNode(s), s[Kt] = n, n.stateNode = s;
        }
        return ot(n), null;
      case 13:
        if (Le(Ae), s = n.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
          if ($e && _t !== null && (n.mode & 1) !== 0 && (n.flags & 128) === 0) Rf(), Wr(), n.flags |= 98560, d = !1;
          else if (d = ps(n), s !== null && s.dehydrated !== null) {
            if (e === null) {
              if (!d) throw Error(i(318));
              if (d = n.memoizedState, d = d !== null ? d.dehydrated : null, !d) throw Error(i(317));
              d[Kt] = n;
            } else Wr(), (n.flags & 128) === 0 && (n.memoizedState = null), n.flags |= 4;
            ot(n), d = !1;
          } else Lt !== null && (gu(Lt), Lt = null), d = !0;
          if (!d) return n.flags & 65536 ? n : null;
        }
        return (n.flags & 128) !== 0 ? (n.lanes = o, n) : (s = s !== null, s !== (e !== null && e.memoizedState !== null) && s && (n.child.flags |= 8192, (n.mode & 1) !== 0 && (e === null || (Ae.current & 1) !== 0 ? Ye === 0 && (Ye = 3) : vu())), n.updateQueue !== null && (n.flags |= 4), ot(n), null);
      case 4:
        return Qr(), ou(e, n), e === null && Vo(n.stateNode.containerInfo), ot(n), null;
      case 10:
        return ba(n.type._context), ot(n), null;
      case 17:
        return ft(n.type) && as(), ot(n), null;
      case 19:
        if (Le(Ae), d = n.memoizedState, d === null) return ot(n), null;
        if (s = (n.flags & 128) !== 0, w = d.rendering, w === null) if (s) ei(d, !1);
        else {
          if (Ye !== 0 || e !== null && (e.flags & 128) !== 0) for (e = n.child; e !== null; ) {
            if (w = ws(e), w !== null) {
              for (n.flags |= 128, ei(d, !1), s = w.updateQueue, s !== null && (n.updateQueue = s, n.flags |= 4), n.subtreeFlags = 0, s = o, o = n.child; o !== null; ) d = o, e = s, d.flags &= 14680066, w = d.alternate, w === null ? (d.childLanes = 0, d.lanes = e, d.child = null, d.subtreeFlags = 0, d.memoizedProps = null, d.memoizedState = null, d.updateQueue = null, d.dependencies = null, d.stateNode = null) : (d.childLanes = w.childLanes, d.lanes = w.lanes, d.child = w.child, d.subtreeFlags = 0, d.deletions = null, d.memoizedProps = w.memoizedProps, d.memoizedState = w.memoizedState, d.updateQueue = w.updateQueue, d.type = w.type, e = w.dependencies, d.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), o = o.sibling;
              return be(Ae, Ae.current & 1 | 2), n.child;
            }
            e = e.sibling;
          }
          d.tail !== null && Oe() > Jr && (n.flags |= 128, s = !0, ei(d, !1), n.lanes = 4194304);
        }
        else {
          if (!s) if (e = ws(w), e !== null) {
            if (n.flags |= 128, s = !0, o = e.updateQueue, o !== null && (n.updateQueue = o, n.flags |= 4), ei(d, !0), d.tail === null && d.tailMode === "hidden" && !w.alternate && !$e) return ot(n), null;
          } else 2 * Oe() - d.renderingStartTime > Jr && o !== 1073741824 && (n.flags |= 128, s = !0, ei(d, !1), n.lanes = 4194304);
          d.isBackwards ? (w.sibling = n.child, n.child = w) : (o = d.last, o !== null ? o.sibling = w : n.child = w, d.last = w);
        }
        return d.tail !== null ? (n = d.tail, d.rendering = n, d.tail = n.sibling, d.renderingStartTime = Oe(), n.sibling = null, o = Ae.current, be(Ae, s ? o & 1 | 2 : o & 1), n) : (ot(n), null);
      case 22:
      case 23:
        return yu(), s = n.memoizedState !== null, e !== null && e.memoizedState !== null !== s && (n.flags |= 8192), s && (n.mode & 1) !== 0 ? (St & 1073741824) !== 0 && (ot(n), n.subtreeFlags & 6 && (n.flags |= 8192)) : ot(n), null;
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(i(156, n.tag));
  }
  function Z0(e, n) {
    switch (Na(n), n.tag) {
      case 1:
        return ft(n.type) && as(), e = n.flags, e & 65536 ? (n.flags = e & -65537 | 128, n) : null;
      case 3:
        return Qr(), Le(ct), Le(nt), ja(), e = n.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (n.flags = e & -65537 | 128, n) : null;
      case 5:
        return Oa(n), null;
      case 13:
        if (Le(Ae), e = n.memoizedState, e !== null && e.dehydrated !== null) {
          if (n.alternate === null) throw Error(i(340));
          Wr();
        }
        return e = n.flags, e & 65536 ? (n.flags = e & -65537 | 128, n) : null;
      case 19:
        return Le(Ae), null;
      case 4:
        return Qr(), null;
      case 10:
        return ba(n.type._context), null;
      case 22:
      case 23:
        return yu(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var zs = !1, it = !1, Q0 = typeof WeakSet == "function" ? WeakSet : Set, de = null;
  function Gr(e, n) {
    var o = e.ref;
    if (o !== null) if (typeof o == "function") try {
      o(null);
    } catch (s) {
      Fe(e, n, s);
    }
    else o.current = null;
  }
  function iu(e, n, o) {
    try {
      o();
    } catch (s) {
      Fe(e, n, s);
    }
  }
  var Td = !1;
  function K0(e, n) {
    if (ya = Zi, e = uf(), ua(e)) {
      if ("selectionStart" in e) var o = { start: e.selectionStart, end: e.selectionEnd };
      else e: {
        o = (o = e.ownerDocument) && o.defaultView || window;
        var s = o.getSelection && o.getSelection();
        if (s && s.rangeCount !== 0) {
          o = s.anchorNode;
          var u = s.anchorOffset, d = s.focusNode;
          s = s.focusOffset;
          try {
            o.nodeType, d.nodeType;
          } catch {
            o = null;
            break e;
          }
          var w = 0, z = -1, I = -1, G = 0, ne = 0, oe = e, te = null;
          t: for (; ; ) {
            for (var fe; oe !== o || u !== 0 && oe.nodeType !== 3 || (z = w + u), oe !== d || s !== 0 && oe.nodeType !== 3 || (I = w + s), oe.nodeType === 3 && (w += oe.nodeValue.length), (fe = oe.firstChild) !== null; )
              te = oe, oe = fe;
            for (; ; ) {
              if (oe === e) break t;
              if (te === o && ++G === u && (z = w), te === d && ++ne === s && (I = w), (fe = oe.nextSibling) !== null) break;
              oe = te, te = oe.parentNode;
            }
            oe = fe;
          }
          o = z === -1 || I === -1 ? null : { start: z, end: I };
        } else o = null;
      }
      o = o || { start: 0, end: 0 };
    } else o = null;
    for (va = { focusedElem: e, selectionRange: o }, Zi = !1, de = n; de !== null; ) if (n = de, e = n.child, (n.subtreeFlags & 1028) !== 0 && e !== null) e.return = n, de = e;
    else for (; de !== null; ) {
      n = de;
      try {
        var pe = n.alternate;
        if ((n.flags & 1024) !== 0) switch (n.tag) {
          case 0:
          case 11:
          case 15:
            break;
          case 1:
            if (pe !== null) {
              var he = pe.memoizedProps, Be = pe.memoizedState, X = n.stateNode, L = X.getSnapshotBeforeUpdate(n.elementType === n.type ? he : $t(n.type, he), Be);
              X.__reactInternalSnapshotBeforeUpdate = L;
            }
            break;
          case 3:
            var Z = n.stateNode.containerInfo;
            Z.nodeType === 1 ? Z.textContent = "" : Z.nodeType === 9 && Z.documentElement && Z.removeChild(Z.documentElement);
            break;
          case 5:
          case 6:
          case 4:
          case 17:
            break;
          default:
            throw Error(i(163));
        }
      } catch (se) {
        Fe(n, n.return, se);
      }
      if (e = n.sibling, e !== null) {
        e.return = n.return, de = e;
        break;
      }
      de = n.return;
    }
    return pe = Td, Td = !1, pe;
  }
  function ti(e, n, o) {
    var s = n.updateQueue;
    if (s = s !== null ? s.lastEffect : null, s !== null) {
      var u = s = s.next;
      do {
        if ((u.tag & e) === e) {
          var d = u.destroy;
          u.destroy = void 0, d !== void 0 && iu(n, o, d);
        }
        u = u.next;
      } while (u !== s);
    }
  }
  function Ps(e, n) {
    if (n = n.updateQueue, n = n !== null ? n.lastEffect : null, n !== null) {
      var o = n = n.next;
      do {
        if ((o.tag & e) === e) {
          var s = o.create;
          o.destroy = s();
        }
        o = o.next;
      } while (o !== n);
    }
  }
  function su(e) {
    var n = e.ref;
    if (n !== null) {
      var o = e.stateNode;
      switch (e.tag) {
        case 5:
          e = o;
          break;
        default:
          e = o;
      }
      typeof n == "function" ? n(e) : n.current = e;
    }
  }
  function bd(e) {
    var n = e.alternate;
    n !== null && (e.alternate = null, bd(n)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (n = e.stateNode, n !== null && (delete n[Kt], delete n[Uo], delete n[Sa], delete n[b0], delete n[R0])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
  }
  function Rd(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 4;
  }
  function Dd(e) {
    e: for (; ; ) {
      for (; e.sibling === null; ) {
        if (e.return === null || Rd(e.return)) return null;
        e = e.return;
      }
      for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
        if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
        e.child.return = e, e = e.child;
      }
      if (!(e.flags & 2)) return e.stateNode;
    }
  }
  function lu(e, n, o) {
    var s = e.tag;
    if (s === 5 || s === 6) e = e.stateNode, n ? o.nodeType === 8 ? o.parentNode.insertBefore(e, n) : o.insertBefore(e, n) : (o.nodeType === 8 ? (n = o.parentNode, n.insertBefore(e, o)) : (n = o, n.appendChild(e)), o = o._reactRootContainer, o != null || n.onclick !== null || (n.onclick = ss));
    else if (s !== 4 && (e = e.child, e !== null)) for (lu(e, n, o), e = e.sibling; e !== null; ) lu(e, n, o), e = e.sibling;
  }
  function au(e, n, o) {
    var s = e.tag;
    if (s === 5 || s === 6) e = e.stateNode, n ? o.insertBefore(e, n) : o.appendChild(e);
    else if (s !== 4 && (e = e.child, e !== null)) for (au(e, n, o), e = e.sibling; e !== null; ) au(e, n, o), e = e.sibling;
  }
  var qe = null, Ot = !1;
  function Ln(e, n, o) {
    for (o = o.child; o !== null; ) Ld(e, n, o), o = o.sibling;
  }
  function Ld(e, n, o) {
    if (yt && typeof yt.onCommitFiberUnmount == "function") try {
      yt.onCommitFiberUnmount(Pr, o);
    } catch {
    }
    switch (o.tag) {
      case 5:
        it || Gr(o, n);
      case 6:
        var s = qe, u = Ot;
        qe = null, Ln(e, n, o), qe = s, Ot = u, qe !== null && (Ot ? (e = qe, o = o.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(o) : e.removeChild(o)) : qe.removeChild(o.stateNode));
        break;
      case 18:
        qe !== null && (Ot ? (e = qe, o = o.stateNode, e.nodeType === 8 ? _a(e.parentNode, o) : e.nodeType === 1 && _a(e, o), Ro(e)) : _a(qe, o.stateNode));
        break;
      case 4:
        s = qe, u = Ot, qe = o.stateNode.containerInfo, Ot = !0, Ln(e, n, o), qe = s, Ot = u;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (!it && (s = o.updateQueue, s !== null && (s = s.lastEffect, s !== null))) {
          u = s = s.next;
          do {
            var d = u, w = d.destroy;
            d = d.tag, w !== void 0 && ((d & 2) !== 0 || (d & 4) !== 0) && iu(o, n, w), u = u.next;
          } while (u !== s);
        }
        Ln(e, n, o);
        break;
      case 1:
        if (!it && (Gr(o, n), s = o.stateNode, typeof s.componentWillUnmount == "function")) try {
          s.props = o.memoizedProps, s.state = o.memoizedState, s.componentWillUnmount();
        } catch (z) {
          Fe(o, n, z);
        }
        Ln(e, n, o);
        break;
      case 21:
        Ln(e, n, o);
        break;
      case 22:
        o.mode & 1 ? (it = (s = it) || o.memoizedState !== null, Ln(e, n, o), it = s) : Ln(e, n, o);
        break;
      default:
        Ln(e, n, o);
    }
  }
  function $d(e) {
    var n = e.updateQueue;
    if (n !== null) {
      e.updateQueue = null;
      var o = e.stateNode;
      o === null && (o = e.stateNode = new Q0()), n.forEach(function(s) {
        var u = iy.bind(null, e, s);
        o.has(s) || (o.add(s), s.then(u, u));
      });
    }
  }
  function At(e, n) {
    var o = n.deletions;
    if (o !== null) for (var s = 0; s < o.length; s++) {
      var u = o[s];
      try {
        var d = e, w = n, z = w;
        e: for (; z !== null; ) {
          switch (z.tag) {
            case 5:
              qe = z.stateNode, Ot = !1;
              break e;
            case 3:
              qe = z.stateNode.containerInfo, Ot = !0;
              break e;
            case 4:
              qe = z.stateNode.containerInfo, Ot = !0;
              break e;
          }
          z = z.return;
        }
        if (qe === null) throw Error(i(160));
        Ld(d, w, u), qe = null, Ot = !1;
        var I = u.alternate;
        I !== null && (I.return = null), u.return = null;
      } catch (G) {
        Fe(u, n, G);
      }
    }
    if (n.subtreeFlags & 12854) for (n = n.child; n !== null; ) Od(n, e), n = n.sibling;
  }
  function Od(e, n) {
    var o = e.alternate, s = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (At(n, e), Jt(e), s & 4) {
          try {
            ti(3, e, e.return), Ps(3, e);
          } catch (he) {
            Fe(e, e.return, he);
          }
          try {
            ti(5, e, e.return);
          } catch (he) {
            Fe(e, e.return, he);
          }
        }
        break;
      case 1:
        At(n, e), Jt(e), s & 512 && o !== null && Gr(o, o.return);
        break;
      case 5:
        if (At(n, e), Jt(e), s & 512 && o !== null && Gr(o, o.return), e.flags & 32) {
          var u = e.stateNode;
          try {
            ln(u, "");
          } catch (he) {
            Fe(e, e.return, he);
          }
        }
        if (s & 4 && (u = e.stateNode, u != null)) {
          var d = e.memoizedProps, w = o !== null ? o.memoizedProps : d, z = e.type, I = e.updateQueue;
          if (e.updateQueue = null, I !== null) try {
            z === "input" && d.type === "radio" && d.name != null && ze(u, d), vo(z, w);
            var G = vo(z, d);
            for (w = 0; w < I.length; w += 2) {
              var ne = I[w], oe = I[w + 1];
              ne === "style" ? Ii(u, oe) : ne === "dangerouslySetInnerHTML" ? Cr(u, oe) : ne === "children" ? ln(u, oe) : S(u, ne, oe, G);
            }
            switch (z) {
              case "input":
                Ve(u, d);
                break;
              case "textarea":
                Zt(u, d);
                break;
              case "select":
                var te = u._wrapperState.wasMultiple;
                u._wrapperState.wasMultiple = !!d.multiple;
                var fe = d.value;
                fe != null ? tt(u, !!d.multiple, fe, !1) : te !== !!d.multiple && (d.defaultValue != null ? tt(
                  u,
                  !!d.multiple,
                  d.defaultValue,
                  !0
                ) : tt(u, !!d.multiple, d.multiple ? [] : "", !1));
            }
            u[Uo] = d;
          } catch (he) {
            Fe(e, e.return, he);
          }
        }
        break;
      case 6:
        if (At(n, e), Jt(e), s & 4) {
          if (e.stateNode === null) throw Error(i(162));
          u = e.stateNode, d = e.memoizedProps;
          try {
            u.nodeValue = d;
          } catch (he) {
            Fe(e, e.return, he);
          }
        }
        break;
      case 3:
        if (At(n, e), Jt(e), s & 4 && o !== null && o.memoizedState.isDehydrated) try {
          Ro(n.containerInfo);
        } catch (he) {
          Fe(e, e.return, he);
        }
        break;
      case 4:
        At(n, e), Jt(e);
        break;
      case 13:
        At(n, e), Jt(e), u = e.child, u.flags & 8192 && (d = u.memoizedState !== null, u.stateNode.isHidden = d, !d || u.alternate !== null && u.alternate.memoizedState !== null || (fu = Oe())), s & 4 && $d(e);
        break;
      case 22:
        if (ne = o !== null && o.memoizedState !== null, e.mode & 1 ? (it = (G = it) || ne, At(n, e), it = G) : At(n, e), Jt(e), s & 8192) {
          if (G = e.memoizedState !== null, (e.stateNode.isHidden = G) && !ne && (e.mode & 1) !== 0) for (de = e, ne = e.child; ne !== null; ) {
            for (oe = de = ne; de !== null; ) {
              switch (te = de, fe = te.child, te.tag) {
                case 0:
                case 11:
                case 14:
                case 15:
                  ti(4, te, te.return);
                  break;
                case 1:
                  Gr(te, te.return);
                  var pe = te.stateNode;
                  if (typeof pe.componentWillUnmount == "function") {
                    s = te, o = te.return;
                    try {
                      n = s, pe.props = n.memoizedProps, pe.state = n.memoizedState, pe.componentWillUnmount();
                    } catch (he) {
                      Fe(s, o, he);
                    }
                  }
                  break;
                case 5:
                  Gr(te, te.return);
                  break;
                case 22:
                  if (te.memoizedState !== null) {
                    Hd(oe);
                    continue;
                  }
              }
              fe !== null ? (fe.return = te, de = fe) : Hd(oe);
            }
            ne = ne.sibling;
          }
          e: for (ne = null, oe = e; ; ) {
            if (oe.tag === 5) {
              if (ne === null) {
                ne = oe;
                try {
                  u = oe.stateNode, G ? (d = u.style, typeof d.setProperty == "function" ? d.setProperty("display", "none", "important") : d.display = "none") : (z = oe.stateNode, I = oe.memoizedProps.style, w = I != null && I.hasOwnProperty("display") ? I.display : null, z.style.display = Pi("display", w));
                } catch (he) {
                  Fe(e, e.return, he);
                }
              }
            } else if (oe.tag === 6) {
              if (ne === null) try {
                oe.stateNode.nodeValue = G ? "" : oe.memoizedProps;
              } catch (he) {
                Fe(e, e.return, he);
              }
            } else if ((oe.tag !== 22 && oe.tag !== 23 || oe.memoizedState === null || oe === e) && oe.child !== null) {
              oe.child.return = oe, oe = oe.child;
              continue;
            }
            if (oe === e) break e;
            for (; oe.sibling === null; ) {
              if (oe.return === null || oe.return === e) break e;
              ne === oe && (ne = null), oe = oe.return;
            }
            ne === oe && (ne = null), oe.sibling.return = oe.return, oe = oe.sibling;
          }
        }
        break;
      case 19:
        At(n, e), Jt(e), s & 4 && $d(e);
        break;
      case 21:
        break;
      default:
        At(
          n,
          e
        ), Jt(e);
    }
  }
  function Jt(e) {
    var n = e.flags;
    if (n & 2) {
      try {
        e: {
          for (var o = e.return; o !== null; ) {
            if (Rd(o)) {
              var s = o;
              break e;
            }
            o = o.return;
          }
          throw Error(i(160));
        }
        switch (s.tag) {
          case 5:
            var u = s.stateNode;
            s.flags & 32 && (ln(u, ""), s.flags &= -33);
            var d = Dd(e);
            au(e, d, u);
            break;
          case 3:
          case 4:
            var w = s.stateNode.containerInfo, z = Dd(e);
            lu(e, z, w);
            break;
          default:
            throw Error(i(161));
        }
      } catch (I) {
        Fe(e, e.return, I);
      }
      e.flags &= -3;
    }
    n & 4096 && (e.flags &= -4097);
  }
  function G0(e, n, o) {
    de = e, Ad(e);
  }
  function Ad(e, n, o) {
    for (var s = (e.mode & 1) !== 0; de !== null; ) {
      var u = de, d = u.child;
      if (u.tag === 22 && s) {
        var w = u.memoizedState !== null || zs;
        if (!w) {
          var z = u.alternate, I = z !== null && z.memoizedState !== null || it;
          z = zs;
          var G = it;
          if (zs = w, (it = I) && !G) for (de = u; de !== null; ) w = de, I = w.child, w.tag === 22 && w.memoizedState !== null ? Fd(u) : I !== null ? (I.return = w, de = I) : Fd(u);
          for (; d !== null; ) de = d, Ad(d), d = d.sibling;
          de = u, zs = z, it = G;
        }
        jd(e);
      } else (u.subtreeFlags & 8772) !== 0 && d !== null ? (d.return = u, de = d) : jd(e);
    }
  }
  function jd(e) {
    for (; de !== null; ) {
      var n = de;
      if ((n.flags & 8772) !== 0) {
        var o = n.alternate;
        try {
          if ((n.flags & 8772) !== 0) switch (n.tag) {
            case 0:
            case 11:
            case 15:
              it || Ps(5, n);
              break;
            case 1:
              var s = n.stateNode;
              if (n.flags & 4 && !it) if (o === null) s.componentDidMount();
              else {
                var u = n.elementType === n.type ? o.memoizedProps : $t(n.type, o.memoizedProps);
                s.componentDidUpdate(u, o.memoizedState, s.__reactInternalSnapshotBeforeUpdate);
              }
              var d = n.updateQueue;
              d !== null && Hf(n, d, s);
              break;
            case 3:
              var w = n.updateQueue;
              if (w !== null) {
                if (o = null, n.child !== null) switch (n.child.tag) {
                  case 5:
                    o = n.child.stateNode;
                    break;
                  case 1:
                    o = n.child.stateNode;
                }
                Hf(n, w, o);
              }
              break;
            case 5:
              var z = n.stateNode;
              if (o === null && n.flags & 4) {
                o = z;
                var I = n.memoizedProps;
                switch (n.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    I.autoFocus && o.focus();
                    break;
                  case "img":
                    I.src && (o.src = I.src);
                }
              }
              break;
            case 6:
              break;
            case 4:
              break;
            case 12:
              break;
            case 13:
              if (n.memoizedState === null) {
                var G = n.alternate;
                if (G !== null) {
                  var ne = G.memoizedState;
                  if (ne !== null) {
                    var oe = ne.dehydrated;
                    oe !== null && Ro(oe);
                  }
                }
              }
              break;
            case 19:
            case 17:
            case 21:
            case 22:
            case 23:
            case 25:
              break;
            default:
              throw Error(i(163));
          }
          it || n.flags & 512 && su(n);
        } catch (te) {
          Fe(n, n.return, te);
        }
      }
      if (n === e) {
        de = null;
        break;
      }
      if (o = n.sibling, o !== null) {
        o.return = n.return, de = o;
        break;
      }
      de = n.return;
    }
  }
  function Hd(e) {
    for (; de !== null; ) {
      var n = de;
      if (n === e) {
        de = null;
        break;
      }
      var o = n.sibling;
      if (o !== null) {
        o.return = n.return, de = o;
        break;
      }
      de = n.return;
    }
  }
  function Fd(e) {
    for (; de !== null; ) {
      var n = de;
      try {
        switch (n.tag) {
          case 0:
          case 11:
          case 15:
            var o = n.return;
            try {
              Ps(4, n);
            } catch (I) {
              Fe(n, o, I);
            }
            break;
          case 1:
            var s = n.stateNode;
            if (typeof s.componentDidMount == "function") {
              var u = n.return;
              try {
                s.componentDidMount();
              } catch (I) {
                Fe(n, u, I);
              }
            }
            var d = n.return;
            try {
              su(n);
            } catch (I) {
              Fe(n, d, I);
            }
            break;
          case 5:
            var w = n.return;
            try {
              su(n);
            } catch (I) {
              Fe(n, w, I);
            }
        }
      } catch (I) {
        Fe(n, n.return, I);
      }
      if (n === e) {
        de = null;
        break;
      }
      var z = n.sibling;
      if (z !== null) {
        z.return = n.return, de = z;
        break;
      }
      de = n.return;
    }
  }
  var q0 = Math.ceil, Is = P.ReactCurrentDispatcher, uu = P.ReactCurrentOwner, bt = P.ReactCurrentBatchConfig, Pe = 0, Qe = null, Ue = null, Je = 0, St = 0, qr = In(0), Ye = 0, ni = null, ur = 0, Ts = 0, cu = 0, ri = null, pt = null, fu = 0, Jr = 1 / 0, gn = null, bs = !1, du = null, $n = null, Rs = !1, On = null, Ds = 0, oi = 0, pu = null, Ls = -1, $s = 0;
  function lt() {
    return (Pe & 6) !== 0 ? Oe() : Ls !== -1 ? Ls : Ls = Oe();
  }
  function An(e) {
    return (e.mode & 1) === 0 ? 1 : (Pe & 2) !== 0 && Je !== 0 ? Je & -Je : L0.transition !== null ? ($s === 0 && ($s = Wi()), $s) : (e = Te, e !== 0 || (e = window.event, e = e === void 0 ? 16 : Vc(e.type)), e);
  }
  function jt(e, n, o, s) {
    if (50 < oi) throw oi = 0, pu = null, Error(i(185));
    tr(e, o, s), ((Pe & 2) === 0 || e !== Qe) && (e === Qe && ((Pe & 2) === 0 && (Ts |= o), Ye === 4 && jn(e, Je)), ht(e, s), o === 1 && Pe === 0 && (n.mode & 1) === 0 && (Jr = Oe() + 500, cs && bn()));
  }
  function ht(e, n) {
    var o = e.callbackNode;
    Ui(e, n);
    var s = Jn(e, e === Qe ? Je : 0);
    if (s === 0) o !== null && Hi(o), e.callbackNode = null, e.callbackPriority = 0;
    else if (n = s & -s, e.callbackPriority !== n) {
      if (o != null && Hi(o), n === 1) e.tag === 0 ? D0(Bd.bind(null, e)) : zf(Bd.bind(null, e)), I0(function() {
        (Pe & 6) === 0 && bn();
      }), o = null;
      else {
        switch (Dc(s)) {
          case 1:
            o = Mo;
            break;
          case 4:
            o = Vi;
            break;
          case 16:
            o = zr;
            break;
          case 536870912:
            o = Bi;
            break;
          default:
            o = zr;
        }
        o = Gd(o, Vd.bind(null, e));
      }
      e.callbackPriority = n, e.callbackNode = o;
    }
  }
  function Vd(e, n) {
    if (Ls = -1, $s = 0, (Pe & 6) !== 0) throw Error(i(327));
    var o = e.callbackNode;
    if (eo() && e.callbackNode !== o) return null;
    var s = Jn(e, e === Qe ? Je : 0);
    if (s === 0) return null;
    if ((s & 30) !== 0 || (s & e.expiredLanes) !== 0 || n) n = Os(e, s);
    else {
      n = s;
      var u = Pe;
      Pe |= 2;
      var d = Wd();
      (Qe !== e || Je !== n) && (gn = null, Jr = Oe() + 500, fr(e, n));
      do
        try {
          ty();
          break;
        } catch (z) {
          Ud(e, z);
        }
      while (!0);
      Ta(), Is.current = d, Pe = u, Ue !== null ? n = 0 : (Qe = null, Je = 0, n = Ye);
    }
    if (n !== 0) {
      if (n === 2 && (u = zo(e), u !== 0 && (s = u, n = hu(e, u))), n === 1) throw o = ni, fr(e, 0), jn(e, s), ht(e, Oe()), o;
      if (n === 6) jn(e, s);
      else {
        if (u = e.current.alternate, (s & 30) === 0 && !J0(u) && (n = Os(e, s), n === 2 && (d = zo(e), d !== 0 && (s = d, n = hu(e, d))), n === 1)) throw o = ni, fr(e, 0), jn(e, s), ht(e, Oe()), o;
        switch (e.finishedWork = u, e.finishedLanes = s, n) {
          case 0:
          case 1:
            throw Error(i(345));
          case 2:
            dr(e, pt, gn);
            break;
          case 3:
            if (jn(e, s), (s & 130023424) === s && (n = fu + 500 - Oe(), 10 < n)) {
              if (Jn(e, 0) !== 0) break;
              if (u = e.suspendedLanes, (u & s) !== s) {
                lt(), e.pingedLanes |= e.suspendedLanes & u;
                break;
              }
              e.timeoutHandle = xa(dr.bind(null, e, pt, gn), n);
              break;
            }
            dr(e, pt, gn);
            break;
          case 4:
            if (jn(e, s), (s & 4194240) === s) break;
            for (n = e.eventTimes, u = -1; 0 < s; ) {
              var w = 31 - vt(s);
              d = 1 << w, w = n[w], w > u && (u = w), s &= ~d;
            }
            if (s = u, s = Oe() - s, s = (120 > s ? 120 : 480 > s ? 480 : 1080 > s ? 1080 : 1920 > s ? 1920 : 3e3 > s ? 3e3 : 4320 > s ? 4320 : 1960 * q0(s / 1960)) - s, 10 < s) {
              e.timeoutHandle = xa(dr.bind(null, e, pt, gn), s);
              break;
            }
            dr(e, pt, gn);
            break;
          case 5:
            dr(e, pt, gn);
            break;
          default:
            throw Error(i(329));
        }
      }
    }
    return ht(e, Oe()), e.callbackNode === o ? Vd.bind(null, e) : null;
  }
  function hu(e, n) {
    var o = ri;
    return e.current.memoizedState.isDehydrated && (fr(e, n).flags |= 256), e = Os(e, n), e !== 2 && (n = pt, pt = o, n !== null && gu(n)), e;
  }
  function gu(e) {
    pt === null ? pt = e : pt.push.apply(pt, e);
  }
  function J0(e) {
    for (var n = e; ; ) {
      if (n.flags & 16384) {
        var o = n.updateQueue;
        if (o !== null && (o = o.stores, o !== null)) for (var s = 0; s < o.length; s++) {
          var u = o[s], d = u.getSnapshot;
          u = u.value;
          try {
            if (!Dt(d(), u)) return !1;
          } catch {
            return !1;
          }
        }
      }
      if (o = n.child, n.subtreeFlags & 16384 && o !== null) o.return = n, n = o;
      else {
        if (n === e) break;
        for (; n.sibling === null; ) {
          if (n.return === null || n.return === e) return !0;
          n = n.return;
        }
        n.sibling.return = n.return, n = n.sibling;
      }
    }
    return !0;
  }
  function jn(e, n) {
    for (n &= ~cu, n &= ~Ts, e.suspendedLanes |= n, e.pingedLanes &= ~n, e = e.expirationTimes; 0 < n; ) {
      var o = 31 - vt(n), s = 1 << o;
      e[o] = -1, n &= ~s;
    }
  }
  function Bd(e) {
    if ((Pe & 6) !== 0) throw Error(i(327));
    eo();
    var n = Jn(e, 0);
    if ((n & 1) === 0) return ht(e, Oe()), null;
    var o = Os(e, n);
    if (e.tag !== 0 && o === 2) {
      var s = zo(e);
      s !== 0 && (n = s, o = hu(e, s));
    }
    if (o === 1) throw o = ni, fr(e, 0), jn(e, n), ht(e, Oe()), o;
    if (o === 6) throw Error(i(345));
    return e.finishedWork = e.current.alternate, e.finishedLanes = n, dr(e, pt, gn), ht(e, Oe()), null;
  }
  function mu(e, n) {
    var o = Pe;
    Pe |= 1;
    try {
      return e(n);
    } finally {
      Pe = o, Pe === 0 && (Jr = Oe() + 500, cs && bn());
    }
  }
  function cr(e) {
    On !== null && On.tag === 0 && (Pe & 6) === 0 && eo();
    var n = Pe;
    Pe |= 1;
    var o = bt.transition, s = Te;
    try {
      if (bt.transition = null, Te = 1, e) return e();
    } finally {
      Te = s, bt.transition = o, Pe = n, (Pe & 6) === 0 && bn();
    }
  }
  function yu() {
    St = qr.current, Le(qr);
  }
  function fr(e, n) {
    e.finishedWork = null, e.finishedLanes = 0;
    var o = e.timeoutHandle;
    if (o !== -1 && (e.timeoutHandle = -1, P0(o)), Ue !== null) for (o = Ue.return; o !== null; ) {
      var s = o;
      switch (Na(s), s.tag) {
        case 1:
          s = s.type.childContextTypes, s != null && as();
          break;
        case 3:
          Qr(), Le(ct), Le(nt), ja();
          break;
        case 5:
          Oa(s);
          break;
        case 4:
          Qr();
          break;
        case 13:
          Le(Ae);
          break;
        case 19:
          Le(Ae);
          break;
        case 10:
          ba(s.type._context);
          break;
        case 22:
        case 23:
          yu();
      }
      o = o.return;
    }
    if (Qe = e, Ue = e = Hn(e.current, null), Je = St = n, Ye = 0, ni = null, cu = Ts = ur = 0, pt = ri = null, sr !== null) {
      for (n = 0; n < sr.length; n++) if (o = sr[n], s = o.interleaved, s !== null) {
        o.interleaved = null;
        var u = s.next, d = o.pending;
        if (d !== null) {
          var w = d.next;
          d.next = u, s.next = w;
        }
        o.pending = s;
      }
      sr = null;
    }
    return e;
  }
  function Ud(e, n) {
    do {
      var o = Ue;
      try {
        if (Ta(), xs.current = Es, _s) {
          for (var s = je.memoizedState; s !== null; ) {
            var u = s.queue;
            u !== null && (u.pending = null), s = s.next;
          }
          _s = !1;
        }
        if (ar = 0, Ze = Xe = je = null, Ko = !1, Go = 0, uu.current = null, o === null || o.return === null) {
          Ye = 1, ni = n, Ue = null;
          break;
        }
        e: {
          var d = e, w = o.return, z = o, I = n;
          if (n = Je, z.flags |= 32768, I !== null && typeof I == "object" && typeof I.then == "function") {
            var G = I, ne = z, oe = ne.tag;
            if ((ne.mode & 1) === 0 && (oe === 0 || oe === 11 || oe === 15)) {
              var te = ne.alternate;
              te ? (ne.updateQueue = te.updateQueue, ne.memoizedState = te.memoizedState, ne.lanes = te.lanes) : (ne.updateQueue = null, ne.memoizedState = null);
            }
            var fe = gd(w);
            if (fe !== null) {
              fe.flags &= -257, md(fe, w, z, d, n), fe.mode & 1 && hd(d, G, n), n = fe, I = G;
              var pe = n.updateQueue;
              if (pe === null) {
                var he = /* @__PURE__ */ new Set();
                he.add(I), n.updateQueue = he;
              } else pe.add(I);
              break e;
            } else {
              if ((n & 1) === 0) {
                hd(d, G, n), vu();
                break e;
              }
              I = Error(i(426));
            }
          } else if ($e && z.mode & 1) {
            var Be = gd(w);
            if (Be !== null) {
              (Be.flags & 65536) === 0 && (Be.flags |= 256), md(Be, w, z, d, n), Pa(Kr(I, z));
              break e;
            }
          }
          d = I = Kr(I, z), Ye !== 4 && (Ye = 2), ri === null ? ri = [d] : ri.push(d), d = w;
          do {
            switch (d.tag) {
              case 3:
                d.flags |= 65536, n &= -n, d.lanes |= n;
                var X = dd(d, I, n);
                jf(d, X);
                break e;
              case 1:
                z = I;
                var L = d.type, Z = d.stateNode;
                if ((d.flags & 128) === 0 && (typeof L.getDerivedStateFromError == "function" || Z !== null && typeof Z.componentDidCatch == "function" && ($n === null || !$n.has(Z)))) {
                  d.flags |= 65536, n &= -n, d.lanes |= n;
                  var se = pd(d, z, n);
                  jf(d, se);
                  break e;
                }
            }
            d = d.return;
          } while (d !== null);
        }
        Yd(o);
      } catch (ge) {
        n = ge, Ue === o && o !== null && (Ue = o = o.return);
        continue;
      }
      break;
    } while (!0);
  }
  function Wd() {
    var e = Is.current;
    return Is.current = Es, e === null ? Es : e;
  }
  function vu() {
    (Ye === 0 || Ye === 3 || Ye === 2) && (Ye = 4), Qe === null || (ur & 268435455) === 0 && (Ts & 268435455) === 0 || jn(Qe, Je);
  }
  function Os(e, n) {
    var o = Pe;
    Pe |= 2;
    var s = Wd();
    (Qe !== e || Je !== n) && (gn = null, fr(e, n));
    do
      try {
        ey();
        break;
      } catch (u) {
        Ud(e, u);
      }
    while (!0);
    if (Ta(), Pe = o, Is.current = s, Ue !== null) throw Error(i(261));
    return Qe = null, Je = 0, Ye;
  }
  function ey() {
    for (; Ue !== null; ) Xd(Ue);
  }
  function ty() {
    for (; Ue !== null && !Fl(); ) Xd(Ue);
  }
  function Xd(e) {
    var n = Kd(e.alternate, e, St);
    e.memoizedProps = e.pendingProps, n === null ? Yd(e) : Ue = n, uu.current = null;
  }
  function Yd(e) {
    var n = e;
    do {
      var o = n.alternate;
      if (e = n.return, (n.flags & 32768) === 0) {
        if (o = Y0(o, n, St), o !== null) {
          Ue = o;
          return;
        }
      } else {
        if (o = Z0(o, n), o !== null) {
          o.flags &= 32767, Ue = o;
          return;
        }
        if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
        else {
          Ye = 6, Ue = null;
          return;
        }
      }
      if (n = n.sibling, n !== null) {
        Ue = n;
        return;
      }
      Ue = n = e;
    } while (n !== null);
    Ye === 0 && (Ye = 5);
  }
  function dr(e, n, o) {
    var s = Te, u = bt.transition;
    try {
      bt.transition = null, Te = 1, ny(e, n, o, s);
    } finally {
      bt.transition = u, Te = s;
    }
    return null;
  }
  function ny(e, n, o, s) {
    do
      eo();
    while (On !== null);
    if ((Pe & 6) !== 0) throw Error(i(327));
    o = e.finishedWork;
    var u = e.finishedLanes;
    if (o === null) return null;
    if (e.finishedWork = null, e.finishedLanes = 0, o === e.current) throw Error(i(177));
    e.callbackNode = null, e.callbackPriority = 0;
    var d = o.lanes | o.childLanes;
    if (Ql(e, d), e === Qe && (Ue = Qe = null, Je = 0), (o.subtreeFlags & 2064) === 0 && (o.flags & 2064) === 0 || Rs || (Rs = !0, Gd(zr, function() {
      return eo(), null;
    })), d = (o.flags & 15990) !== 0, (o.subtreeFlags & 15990) !== 0 || d) {
      d = bt.transition, bt.transition = null;
      var w = Te;
      Te = 1;
      var z = Pe;
      Pe |= 4, uu.current = null, K0(e, o), Od(o, e), S0(va), Zi = !!ya, va = ya = null, e.current = o, G0(o), Fi(), Pe = z, Te = w, bt.transition = d;
    } else e.current = o;
    if (Rs && (Rs = !1, On = e, Ds = u), d = e.pendingLanes, d === 0 && ($n = null), Ul(o.stateNode), ht(e, Oe()), n !== null) for (s = e.onRecoverableError, o = 0; o < n.length; o++) u = n[o], s(u.value, { componentStack: u.stack, digest: u.digest });
    if (bs) throw bs = !1, e = du, du = null, e;
    return (Ds & 1) !== 0 && e.tag !== 0 && eo(), d = e.pendingLanes, (d & 1) !== 0 ? e === pu ? oi++ : (oi = 0, pu = e) : oi = 0, bn(), null;
  }
  function eo() {
    if (On !== null) {
      var e = Dc(Ds), n = bt.transition, o = Te;
      try {
        if (bt.transition = null, Te = 16 > e ? 16 : e, On === null) var s = !1;
        else {
          if (e = On, On = null, Ds = 0, (Pe & 6) !== 0) throw Error(i(331));
          var u = Pe;
          for (Pe |= 4, de = e.current; de !== null; ) {
            var d = de, w = d.child;
            if ((de.flags & 16) !== 0) {
              var z = d.deletions;
              if (z !== null) {
                for (var I = 0; I < z.length; I++) {
                  var G = z[I];
                  for (de = G; de !== null; ) {
                    var ne = de;
                    switch (ne.tag) {
                      case 0:
                      case 11:
                      case 15:
                        ti(8, ne, d);
                    }
                    var oe = ne.child;
                    if (oe !== null) oe.return = ne, de = oe;
                    else for (; de !== null; ) {
                      ne = de;
                      var te = ne.sibling, fe = ne.return;
                      if (bd(ne), ne === G) {
                        de = null;
                        break;
                      }
                      if (te !== null) {
                        te.return = fe, de = te;
                        break;
                      }
                      de = fe;
                    }
                  }
                }
                var pe = d.alternate;
                if (pe !== null) {
                  var he = pe.child;
                  if (he !== null) {
                    pe.child = null;
                    do {
                      var Be = he.sibling;
                      he.sibling = null, he = Be;
                    } while (he !== null);
                  }
                }
                de = d;
              }
            }
            if ((d.subtreeFlags & 2064) !== 0 && w !== null) w.return = d, de = w;
            else e: for (; de !== null; ) {
              if (d = de, (d.flags & 2048) !== 0) switch (d.tag) {
                case 0:
                case 11:
                case 15:
                  ti(9, d, d.return);
              }
              var X = d.sibling;
              if (X !== null) {
                X.return = d.return, de = X;
                break e;
              }
              de = d.return;
            }
          }
          var L = e.current;
          for (de = L; de !== null; ) {
            w = de;
            var Z = w.child;
            if ((w.subtreeFlags & 2064) !== 0 && Z !== null) Z.return = w, de = Z;
            else e: for (w = L; de !== null; ) {
              if (z = de, (z.flags & 2048) !== 0) try {
                switch (z.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Ps(9, z);
                }
              } catch (ge) {
                Fe(z, z.return, ge);
              }
              if (z === w) {
                de = null;
                break e;
              }
              var se = z.sibling;
              if (se !== null) {
                se.return = z.return, de = se;
                break e;
              }
              de = z.return;
            }
          }
          if (Pe = u, bn(), yt && typeof yt.onPostCommitFiberRoot == "function") try {
            yt.onPostCommitFiberRoot(Pr, e);
          } catch {
          }
          s = !0;
        }
        return s;
      } finally {
        Te = o, bt.transition = n;
      }
    }
    return !1;
  }
  function Zd(e, n, o) {
    n = Kr(o, n), n = dd(e, n, 1), e = Dn(e, n, 1), n = lt(), e !== null && (tr(e, 1, n), ht(e, n));
  }
  function Fe(e, n, o) {
    if (e.tag === 3) Zd(e, e, o);
    else for (; n !== null; ) {
      if (n.tag === 3) {
        Zd(n, e, o);
        break;
      } else if (n.tag === 1) {
        var s = n.stateNode;
        if (typeof n.type.getDerivedStateFromError == "function" || typeof s.componentDidCatch == "function" && ($n === null || !$n.has(s))) {
          e = Kr(o, e), e = pd(n, e, 1), n = Dn(n, e, 1), e = lt(), n !== null && (tr(n, 1, e), ht(n, e));
          break;
        }
      }
      n = n.return;
    }
  }
  function ry(e, n, o) {
    var s = e.pingCache;
    s !== null && s.delete(n), n = lt(), e.pingedLanes |= e.suspendedLanes & o, Qe === e && (Je & o) === o && (Ye === 4 || Ye === 3 && (Je & 130023424) === Je && 500 > Oe() - fu ? fr(e, 0) : cu |= o), ht(e, n);
  }
  function Qd(e, n) {
    n === 0 && ((e.mode & 1) === 0 ? n = 1 : (n = Tr, Tr <<= 1, (Tr & 130023424) === 0 && (Tr = 4194304)));
    var o = lt();
    e = dn(e, n), e !== null && (tr(e, n, o), ht(e, o));
  }
  function oy(e) {
    var n = e.memoizedState, o = 0;
    n !== null && (o = n.retryLane), Qd(e, o);
  }
  function iy(e, n) {
    var o = 0;
    switch (e.tag) {
      case 13:
        var s = e.stateNode, u = e.memoizedState;
        u !== null && (o = u.retryLane);
        break;
      case 19:
        s = e.stateNode;
        break;
      default:
        throw Error(i(314));
    }
    s !== null && s.delete(n), Qd(e, o);
  }
  var Kd;
  Kd = function(e, n, o) {
    if (e !== null) if (e.memoizedProps !== n.pendingProps || ct.current) dt = !0;
    else {
      if ((e.lanes & o) === 0 && (n.flags & 128) === 0) return dt = !1, X0(e, n, o);
      dt = (e.flags & 131072) !== 0;
    }
    else dt = !1, $e && (n.flags & 1048576) !== 0 && Pf(n, ds, n.index);
    switch (n.lanes = 0, n.tag) {
      case 2:
        var s = n.type;
        Ms(e, n), e = n.pendingProps;
        var u = Vr(n, nt.current);
        Zr(n, o), u = Va(null, n, s, e, u, o);
        var d = Ba();
        return n.flags |= 1, typeof u == "object" && u !== null && typeof u.render == "function" && u.$$typeof === void 0 ? (n.tag = 1, n.memoizedState = null, n.updateQueue = null, ft(s) ? (d = !0, us(n)) : d = !1, n.memoizedState = u.state !== null && u.state !== void 0 ? u.state : null, La(n), u.updater = Cs, n.stateNode = u, u._reactInternals = n, Qa(n, s, e, o), n = Ja(null, n, s, !0, d, o)) : (n.tag = 0, $e && d && Ca(n), st(null, n, u, o), n = n.child), n;
      case 16:
        s = n.elementType;
        e: {
          switch (Ms(e, n), e = n.pendingProps, u = s._init, s = u(s._payload), n.type = s, u = n.tag = ly(s), e = $t(s, e), u) {
            case 0:
              n = qa(null, n, s, e, o);
              break e;
            case 1:
              n = Sd(null, n, s, e, o);
              break e;
            case 11:
              n = yd(null, n, s, e, o);
              break e;
            case 14:
              n = vd(null, n, s, $t(s.type, e), o);
              break e;
          }
          throw Error(i(
            306,
            s,
            ""
          ));
        }
        return n;
      case 0:
        return s = n.type, u = n.pendingProps, u = n.elementType === s ? u : $t(s, u), qa(e, n, s, u, o);
      case 1:
        return s = n.type, u = n.pendingProps, u = n.elementType === s ? u : $t(s, u), Sd(e, n, s, u, o);
      case 3:
        e: {
          if (kd(n), e === null) throw Error(i(387));
          s = n.pendingProps, d = n.memoizedState, u = d.element, Af(e, n), vs(n, s, null, o);
          var w = n.memoizedState;
          if (s = w.element, d.isDehydrated) if (d = { element: s, isDehydrated: !1, cache: w.cache, pendingSuspenseBoundaries: w.pendingSuspenseBoundaries, transitions: w.transitions }, n.updateQueue.baseState = d, n.memoizedState = d, n.flags & 256) {
            u = Kr(Error(i(423)), n), n = Ed(e, n, s, o, u);
            break e;
          } else if (s !== u) {
            u = Kr(Error(i(424)), n), n = Ed(e, n, s, o, u);
            break e;
          } else for (_t = Pn(n.stateNode.containerInfo.firstChild), xt = n, $e = !0, Lt = null, o = $f(n, null, s, o), n.child = o; o; ) o.flags = o.flags & -3 | 4096, o = o.sibling;
          else {
            if (Wr(), s === u) {
              n = hn(e, n, o);
              break e;
            }
            st(e, n, s, o);
          }
          n = n.child;
        }
        return n;
      case 5:
        return Ff(n), e === null && za(n), s = n.type, u = n.pendingProps, d = e !== null ? e.memoizedProps : null, w = u.children, wa(s, u) ? w = null : d !== null && wa(s, d) && (n.flags |= 32), _d(e, n), st(e, n, w, o), n.child;
      case 6:
        return e === null && za(n), null;
      case 13:
        return Cd(e, n, o);
      case 4:
        return $a(n, n.stateNode.containerInfo), s = n.pendingProps, e === null ? n.child = Xr(n, null, s, o) : st(e, n, s, o), n.child;
      case 11:
        return s = n.type, u = n.pendingProps, u = n.elementType === s ? u : $t(s, u), yd(e, n, s, u, o);
      case 7:
        return st(e, n, n.pendingProps, o), n.child;
      case 8:
        return st(e, n, n.pendingProps.children, o), n.child;
      case 12:
        return st(e, n, n.pendingProps.children, o), n.child;
      case 10:
        e: {
          if (s = n.type._context, u = n.pendingProps, d = n.memoizedProps, w = u.value, be(gs, s._currentValue), s._currentValue = w, d !== null) if (Dt(d.value, w)) {
            if (d.children === u.children && !ct.current) {
              n = hn(e, n, o);
              break e;
            }
          } else for (d = n.child, d !== null && (d.return = n); d !== null; ) {
            var z = d.dependencies;
            if (z !== null) {
              w = d.child;
              for (var I = z.firstContext; I !== null; ) {
                if (I.context === s) {
                  if (d.tag === 1) {
                    I = pn(-1, o & -o), I.tag = 2;
                    var G = d.updateQueue;
                    if (G !== null) {
                      G = G.shared;
                      var ne = G.pending;
                      ne === null ? I.next = I : (I.next = ne.next, ne.next = I), G.pending = I;
                    }
                  }
                  d.lanes |= o, I = d.alternate, I !== null && (I.lanes |= o), Ra(
                    d.return,
                    o,
                    n
                  ), z.lanes |= o;
                  break;
                }
                I = I.next;
              }
            } else if (d.tag === 10) w = d.type === n.type ? null : d.child;
            else if (d.tag === 18) {
              if (w = d.return, w === null) throw Error(i(341));
              w.lanes |= o, z = w.alternate, z !== null && (z.lanes |= o), Ra(w, o, n), w = d.sibling;
            } else w = d.child;
            if (w !== null) w.return = d;
            else for (w = d; w !== null; ) {
              if (w === n) {
                w = null;
                break;
              }
              if (d = w.sibling, d !== null) {
                d.return = w.return, w = d;
                break;
              }
              w = w.return;
            }
            d = w;
          }
          st(e, n, u.children, o), n = n.child;
        }
        return n;
      case 9:
        return u = n.type, s = n.pendingProps.children, Zr(n, o), u = It(u), s = s(u), n.flags |= 1, st(e, n, s, o), n.child;
      case 14:
        return s = n.type, u = $t(s, n.pendingProps), u = $t(s.type, u), vd(e, n, s, u, o);
      case 15:
        return wd(e, n, n.type, n.pendingProps, o);
      case 17:
        return s = n.type, u = n.pendingProps, u = n.elementType === s ? u : $t(s, u), Ms(e, n), n.tag = 1, ft(s) ? (e = !0, us(n)) : e = !1, Zr(n, o), cd(n, s, u), Qa(n, s, u, o), Ja(null, n, s, !0, e, o);
      case 19:
        return Md(e, n, o);
      case 22:
        return xd(e, n, o);
    }
    throw Error(i(156, n.tag));
  };
  function Gd(e, n) {
    return ji(e, n);
  }
  function sy(e, n, o, s) {
    this.tag = e, this.key = o, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = n, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = s, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Rt(e, n, o, s) {
    return new sy(e, n, o, s);
  }
  function wu(e) {
    return e = e.prototype, !(!e || !e.isReactComponent);
  }
  function ly(e) {
    if (typeof e == "function") return wu(e) ? 1 : 0;
    if (e != null) {
      if (e = e.$$typeof, e === A) return 11;
      if (e === $) return 14;
    }
    return 2;
  }
  function Hn(e, n) {
    var o = e.alternate;
    return o === null ? (o = Rt(e.tag, n, e.key, e.mode), o.elementType = e.elementType, o.type = e.type, o.stateNode = e.stateNode, o.alternate = e, e.alternate = o) : (o.pendingProps = n, o.type = e.type, o.flags = 0, o.subtreeFlags = 0, o.deletions = null), o.flags = e.flags & 14680064, o.childLanes = e.childLanes, o.lanes = e.lanes, o.child = e.child, o.memoizedProps = e.memoizedProps, o.memoizedState = e.memoizedState, o.updateQueue = e.updateQueue, n = e.dependencies, o.dependencies = n === null ? null : { lanes: n.lanes, firstContext: n.firstContext }, o.sibling = e.sibling, o.index = e.index, o.ref = e.ref, o;
  }
  function As(e, n, o, s, u, d) {
    var w = 2;
    if (s = e, typeof e == "function") wu(e) && (w = 1);
    else if (typeof e == "string") w = 5;
    else e: switch (e) {
      case F:
        return pr(o.children, u, d, n);
      case Q:
        w = 8, u |= 8;
        break;
      case K:
        return e = Rt(12, o, n, u | 2), e.elementType = K, e.lanes = d, e;
      case W:
        return e = Rt(13, o, n, u), e.elementType = W, e.lanes = d, e;
      case k:
        return e = Rt(19, o, n, u), e.elementType = k, e.lanes = d, e;
      case V:
        return js(o, u, d, n);
      default:
        if (typeof e == "object" && e !== null) switch (e.$$typeof) {
          case ee:
            w = 10;
            break e;
          case J:
            w = 9;
            break e;
          case A:
            w = 11;
            break e;
          case $:
            w = 14;
            break e;
          case O:
            w = 16, s = null;
            break e;
        }
        throw Error(i(130, e == null ? e : typeof e, ""));
    }
    return n = Rt(w, o, n, u), n.elementType = e, n.type = s, n.lanes = d, n;
  }
  function pr(e, n, o, s) {
    return e = Rt(7, e, s, n), e.lanes = o, e;
  }
  function js(e, n, o, s) {
    return e = Rt(22, e, s, n), e.elementType = V, e.lanes = o, e.stateNode = { isHidden: !1 }, e;
  }
  function xu(e, n, o) {
    return e = Rt(6, e, null, n), e.lanes = o, e;
  }
  function _u(e, n, o) {
    return n = Rt(4, e.children !== null ? e.children : [], e.key, n), n.lanes = o, n.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, n;
  }
  function ay(e, n, o, s, u) {
    this.tag = n, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = er(0), this.expirationTimes = er(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = er(0), this.identifierPrefix = s, this.onRecoverableError = u, this.mutableSourceEagerHydrationData = null;
  }
  function Su(e, n, o, s, u, d, w, z, I) {
    return e = new ay(e, n, o, z, I), n === 1 ? (n = 1, d === !0 && (n |= 8)) : n = 0, d = Rt(3, null, null, n), e.current = d, d.stateNode = e, d.memoizedState = { element: s, isDehydrated: o, cache: null, transitions: null, pendingSuspenseBoundaries: null }, La(d), e;
  }
  function uy(e, n, o) {
    var s = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: D, key: s == null ? null : "" + s, children: e, containerInfo: n, implementation: o };
  }
  function qd(e) {
    if (!e) return Tn;
    e = e._reactInternals;
    e: {
      if (Qt(e) !== e || e.tag !== 1) throw Error(i(170));
      var n = e;
      do {
        switch (n.tag) {
          case 3:
            n = n.stateNode.context;
            break e;
          case 1:
            if (ft(n.type)) {
              n = n.stateNode.__reactInternalMemoizedMergedChildContext;
              break e;
            }
        }
        n = n.return;
      } while (n !== null);
      throw Error(i(171));
    }
    if (e.tag === 1) {
      var o = e.type;
      if (ft(o)) return Nf(e, o, n);
    }
    return n;
  }
  function Jd(e, n, o, s, u, d, w, z, I) {
    return e = Su(o, s, !0, e, u, d, w, z, I), e.context = qd(null), o = e.current, s = lt(), u = An(o), d = pn(s, u), d.callback = n ?? null, Dn(o, d, u), e.current.lanes = u, tr(e, u, s), ht(e, s), e;
  }
  function Hs(e, n, o, s) {
    var u = n.current, d = lt(), w = An(u);
    return o = qd(o), n.context === null ? n.context = o : n.pendingContext = o, n = pn(d, w), n.payload = { element: e }, s = s === void 0 ? null : s, s !== null && (n.callback = s), e = Dn(u, n, w), e !== null && (jt(e, u, w, d), ys(e, u, w)), w;
  }
  function Fs(e) {
    if (e = e.current, !e.child) return null;
    switch (e.child.tag) {
      case 5:
        return e.child.stateNode;
      default:
        return e.child.stateNode;
    }
  }
  function ep(e, n) {
    if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
      var o = e.retryLane;
      e.retryLane = o !== 0 && o < n ? o : n;
    }
  }
  function ku(e, n) {
    ep(e, n), (e = e.alternate) && ep(e, n);
  }
  function cy() {
    return null;
  }
  var tp = typeof reportError == "function" ? reportError : function(e) {
    console.error(e);
  };
  function Eu(e) {
    this._internalRoot = e;
  }
  Vs.prototype.render = Eu.prototype.render = function(e) {
    var n = this._internalRoot;
    if (n === null) throw Error(i(409));
    Hs(e, n, null, null);
  }, Vs.prototype.unmount = Eu.prototype.unmount = function() {
    var e = this._internalRoot;
    if (e !== null) {
      this._internalRoot = null;
      var n = e.containerInfo;
      cr(function() {
        Hs(null, e, null, null);
      }), n[an] = null;
    }
  };
  function Vs(e) {
    this._internalRoot = e;
  }
  Vs.prototype.unstable_scheduleHydration = function(e) {
    if (e) {
      var n = Oc();
      e = { blockedOn: null, target: e, priority: n };
      for (var o = 0; o < Nn.length && n !== 0 && n < Nn[o].priority; o++) ;
      Nn.splice(o, 0, e), o === 0 && Hc(e);
    }
  };
  function Cu(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
  }
  function Bs(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
  }
  function np() {
  }
  function fy(e, n, o, s, u) {
    if (u) {
      if (typeof s == "function") {
        var d = s;
        s = function() {
          var G = Fs(w);
          d.call(G);
        };
      }
      var w = Jd(n, s, e, 0, null, !1, !1, "", np);
      return e._reactRootContainer = w, e[an] = w.current, Vo(e.nodeType === 8 ? e.parentNode : e), cr(), w;
    }
    for (; u = e.lastChild; ) e.removeChild(u);
    if (typeof s == "function") {
      var z = s;
      s = function() {
        var G = Fs(I);
        z.call(G);
      };
    }
    var I = Su(e, 0, !1, null, null, !1, !1, "", np);
    return e._reactRootContainer = I, e[an] = I.current, Vo(e.nodeType === 8 ? e.parentNode : e), cr(function() {
      Hs(n, I, o, s);
    }), I;
  }
  function Us(e, n, o, s, u) {
    var d = o._reactRootContainer;
    if (d) {
      var w = d;
      if (typeof u == "function") {
        var z = u;
        u = function() {
          var I = Fs(w);
          z.call(I);
        };
      }
      Hs(n, w, e, u);
    } else w = fy(o, n, e, u, s);
    return Fs(w);
  }
  Lc = function(e) {
    switch (e.tag) {
      case 3:
        var n = e.stateNode;
        if (n.current.memoizedState.isDehydrated) {
          var o = qn(n.pendingLanes);
          o !== 0 && (br(n, o | 1), ht(n, Oe()), (Pe & 6) === 0 && (Jr = Oe() + 500, bn()));
        }
        break;
      case 13:
        cr(function() {
          var s = dn(e, 1);
          if (s !== null) {
            var u = lt();
            jt(s, e, 1, u);
          }
        }), ku(e, 1);
    }
  }, Kl = function(e) {
    if (e.tag === 13) {
      var n = dn(e, 134217728);
      if (n !== null) {
        var o = lt();
        jt(n, e, 134217728, o);
      }
      ku(e, 134217728);
    }
  }, $c = function(e) {
    if (e.tag === 13) {
      var n = An(e), o = dn(e, n);
      if (o !== null) {
        var s = lt();
        jt(o, e, n, s);
      }
      ku(e, n);
    }
  }, Oc = function() {
    return Te;
  }, Ac = function(e, n) {
    var o = Te;
    try {
      return Te = e, n();
    } finally {
      Te = o;
    }
  }, _o = function(e, n, o) {
    switch (n) {
      case "input":
        if (Ve(e, o), n = o.name, o.type === "radio" && n != null) {
          for (o = e; o.parentNode; ) o = o.parentNode;
          for (o = o.querySelectorAll("input[name=" + JSON.stringify("" + n) + '][type="radio"]'), n = 0; n < o.length; n++) {
            var s = o[n];
            if (s !== e && s.form === e.form) {
              var u = ls(s);
              if (!u) throw Error(i(90));
              me(s), Ve(s, u);
            }
          }
        }
        break;
      case "textarea":
        Zt(e, o);
        break;
      case "select":
        n = o.value, n != null && tt(e, !!o.multiple, n, !1);
    }
  }, Di = mu, Li = cr;
  var dy = { usingClientEntryPoint: !1, Events: [Wo, Hr, ls, bi, Ri, mu] }, ii = { findFiberByHostInstance: nr, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, py = { bundleType: ii.bundleType, version: ii.version, rendererPackageName: ii.rendererPackageName, rendererConfig: ii.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: P.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
    return e = Oi(e), e === null ? null : e.stateNode;
  }, findFiberByHostInstance: ii.findFiberByHostInstance || cy, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Ws = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Ws.isDisabled && Ws.supportsFiber) try {
      Pr = Ws.inject(py), yt = Ws;
    } catch {
    }
  }
  return gt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = dy, gt.createPortal = function(e, n) {
    var o = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!Cu(n)) throw Error(i(200));
    return uy(e, n, null, o);
  }, gt.createRoot = function(e, n) {
    if (!Cu(e)) throw Error(i(299));
    var o = !1, s = "", u = tp;
    return n != null && (n.unstable_strictMode === !0 && (o = !0), n.identifierPrefix !== void 0 && (s = n.identifierPrefix), n.onRecoverableError !== void 0 && (u = n.onRecoverableError)), n = Su(e, 1, !1, null, null, o, !1, s, u), e[an] = n.current, Vo(e.nodeType === 8 ? e.parentNode : e), new Eu(n);
  }, gt.findDOMNode = function(e) {
    if (e == null) return null;
    if (e.nodeType === 1) return e;
    var n = e._reactInternals;
    if (n === void 0)
      throw typeof e.render == "function" ? Error(i(188)) : (e = Object.keys(e).join(","), Error(i(268, e)));
    return e = Oi(n), e = e === null ? null : e.stateNode, e;
  }, gt.flushSync = function(e) {
    return cr(e);
  }, gt.hydrate = function(e, n, o) {
    if (!Bs(n)) throw Error(i(200));
    return Us(null, e, n, !0, o);
  }, gt.hydrateRoot = function(e, n, o) {
    if (!Cu(e)) throw Error(i(405));
    var s = o != null && o.hydratedSources || null, u = !1, d = "", w = tp;
    if (o != null && (o.unstable_strictMode === !0 && (u = !0), o.identifierPrefix !== void 0 && (d = o.identifierPrefix), o.onRecoverableError !== void 0 && (w = o.onRecoverableError)), n = Jd(n, null, e, 1, o ?? null, u, !1, d, w), e[an] = n.current, Vo(e), s) for (e = 0; e < s.length; e++) o = s[e], u = o._getVersion, u = u(o._source), n.mutableSourceEagerHydrationData == null ? n.mutableSourceEagerHydrationData = [o, u] : n.mutableSourceEagerHydrationData.push(
      o,
      u
    );
    return new Vs(n);
  }, gt.render = function(e, n, o) {
    if (!Bs(n)) throw Error(i(200));
    return Us(null, e, n, !1, o);
  }, gt.unmountComponentAtNode = function(e) {
    if (!Bs(e)) throw Error(i(40));
    return e._reactRootContainer ? (cr(function() {
      Us(null, null, e, !1, function() {
        e._reactRootContainer = null, e[an] = null;
      });
    }), !0) : !1;
  }, gt.unstable_batchedUpdates = mu, gt.unstable_renderSubtreeIntoContainer = function(e, n, o, s) {
    if (!Bs(o)) throw Error(i(200));
    if (e == null || e._reactInternals === void 0) throw Error(i(38));
    return Us(e, n, o, !1, s);
  }, gt.version = "18.3.1-next-f1338f8080-20240426", gt;
}
var cp;
function Th() {
  if (cp) return zu.exports;
  cp = 1;
  function t() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(t);
      } catch (r) {
        console.error(r);
      }
  }
  return t(), zu.exports = xy(), zu.exports;
}
var fp;
function _y() {
  if (fp) return Xs;
  fp = 1;
  var t = Th();
  return Xs.createRoot = t.createRoot, Xs.hydrateRoot = t.hydrateRoot, Xs;
}
var bh = _y();
const Sy = ".react-flow{direction:ltr;--xy-edge-stroke-default: #b1b1b7;--xy-edge-stroke-width-default: 1;--xy-edge-stroke-selected-default: #555;--xy-connectionline-stroke-default: #b1b1b7;--xy-connectionline-stroke-width-default: 1;--xy-attribution-background-color-default: rgba(255, 255, 255, .5);--xy-minimap-background-color-default: #fff;--xy-minimap-mask-background-color-default: rgba(240, 240, 240, .6);--xy-minimap-mask-stroke-color-default: transparent;--xy-minimap-mask-stroke-width-default: 1;--xy-minimap-node-background-color-default: #e2e2e2;--xy-minimap-node-stroke-color-default: transparent;--xy-minimap-node-stroke-width-default: 2;--xy-background-color-default: transparent;--xy-background-pattern-dots-color-default: #91919a;--xy-background-pattern-lines-color-default: #eee;--xy-background-pattern-cross-color-default: #e2e2e2;background-color:var(--xy-background-color, var(--xy-background-color-default));--xy-node-color-default: inherit;--xy-node-border-default: 1px solid #1a192b;--xy-node-background-color-default: #fff;--xy-node-group-background-color-default: rgba(240, 240, 240, .25);--xy-node-boxshadow-hover-default: 0 1px 4px 1px rgba(0, 0, 0, .08);--xy-node-boxshadow-selected-default: 0 0 0 .5px #1a192b;--xy-node-border-radius-default: 3px;--xy-handle-background-color-default: #1a192b;--xy-handle-border-color-default: #fff;--xy-selection-background-color-default: rgba(0, 89, 220, .08);--xy-selection-border-default: 1px dotted rgba(0, 89, 220, .8);--xy-controls-button-background-color-default: #fefefe;--xy-controls-button-background-color-hover-default: #f4f4f4;--xy-controls-button-color-default: inherit;--xy-controls-button-color-hover-default: inherit;--xy-controls-button-border-color-default: #eee;--xy-controls-box-shadow-default: 0 0 2px 1px rgba(0, 0, 0, .08);--xy-edge-label-background-color-default: #ffffff;--xy-edge-label-color-default: inherit;--xy-resize-background-color-default: #3367d9}.react-flow.dark{--xy-edge-stroke-default: #3e3e3e;--xy-edge-stroke-width-default: 1;--xy-edge-stroke-selected-default: #727272;--xy-connectionline-stroke-default: #b1b1b7;--xy-connectionline-stroke-width-default: 1;--xy-attribution-background-color-default: rgba(150, 150, 150, .25);--xy-minimap-background-color-default: #141414;--xy-minimap-mask-background-color-default: rgba(60, 60, 60, .6);--xy-minimap-mask-stroke-color-default: transparent;--xy-minimap-mask-stroke-width-default: 1;--xy-minimap-node-background-color-default: #2b2b2b;--xy-minimap-node-stroke-color-default: transparent;--xy-minimap-node-stroke-width-default: 2;--xy-background-color-default: #141414;--xy-background-pattern-dots-color-default: #555;--xy-background-pattern-lines-color-default: #333;--xy-background-pattern-cross-color-default: #333;--xy-node-color-default: #f8f8f8;--xy-node-border-default: 1px solid #3c3c3c;--xy-node-background-color-default: #1e1e1e;--xy-node-group-background-color-default: rgba(240, 240, 240, .25);--xy-node-boxshadow-hover-default: 0 1px 4px 1px rgba(255, 255, 255, .08);--xy-node-boxshadow-selected-default: 0 0 0 .5px #999;--xy-handle-background-color-default: #bebebe;--xy-handle-border-color-default: #1e1e1e;--xy-selection-background-color-default: rgba(200, 200, 220, .08);--xy-selection-border-default: 1px dotted rgba(200, 200, 220, .8);--xy-controls-button-background-color-default: #2b2b2b;--xy-controls-button-background-color-hover-default: #3e3e3e;--xy-controls-button-color-default: #f8f8f8;--xy-controls-button-color-hover-default: #fff;--xy-controls-button-border-color-default: #5b5b5b;--xy-controls-box-shadow-default: 0 0 2px 1px rgba(0, 0, 0, .08);--xy-edge-label-background-color-default: #141414;--xy-edge-label-color-default: #f8f8f8}.react-flow__background{background-color:var(--xy-background-color-props, var(--xy-background-color, var(--xy-background-color-default)));pointer-events:none;z-index:-1}.react-flow__container{position:absolute;width:100%;height:100%;top:0;left:0}.react-flow__pane{z-index:1;touch-action:none}.react-flow__pane.draggable{cursor:grab}.react-flow__pane.dragging{cursor:grabbing}.react-flow__pane.selection{cursor:pointer}.react-flow__viewport{transform-origin:0 0;z-index:2;pointer-events:none}.react-flow__renderer{z-index:4}.react-flow__selection{z-index:6}.react-flow__nodesselection-rect:focus,.react-flow__nodesselection-rect:focus-visible{outline:none}.react-flow__edge-path{stroke:var(--xy-edge-stroke, var(--xy-edge-stroke-default));stroke-width:var(--xy-edge-stroke-width, var(--xy-edge-stroke-width-default));fill:none}.react-flow__connection-path{stroke:var(--xy-connectionline-stroke, var(--xy-connectionline-stroke-default));stroke-width:var(--xy-connectionline-stroke-width, var(--xy-connectionline-stroke-width-default));fill:none}.react-flow .react-flow__edges{position:absolute}.react-flow .react-flow__edges svg{overflow:visible;position:absolute;pointer-events:none}.react-flow__edge{pointer-events:visibleStroke}.react-flow__edge.selectable{cursor:pointer}.react-flow__edge.animated path{stroke-dasharray:5;animation:dashdraw .5s linear infinite}.react-flow__edge.animated path.react-flow__edge-interaction{stroke-dasharray:none;animation:none}.react-flow__edge.inactive{pointer-events:none}.react-flow__edge.selected,.react-flow__edge:focus,.react-flow__edge:focus-visible{outline:none}.react-flow__edge.selected .react-flow__edge-path,.react-flow__edge.selectable:focus .react-flow__edge-path,.react-flow__edge.selectable:focus-visible .react-flow__edge-path{stroke:var(--xy-edge-stroke-selected, var(--xy-edge-stroke-selected-default))}.react-flow__edge-textwrapper{pointer-events:all}.react-flow__edge .react-flow__edge-text{pointer-events:none;-webkit-user-select:none;-moz-user-select:none;user-select:none}.react-flow__arrowhead polyline{stroke:var(--xy-edge-stroke, var(--xy-edge-stroke-default))}.react-flow__arrowhead polyline.arrowclosed{fill:var(--xy-edge-stroke, var(--xy-edge-stroke-default))}.react-flow__connection{pointer-events:none}.react-flow__connection .animated{stroke-dasharray:5;animation:dashdraw .5s linear infinite}svg.react-flow__connectionline{z-index:1001;overflow:visible;position:absolute}.react-flow__nodes{pointer-events:none;transform-origin:0 0}.react-flow__node{position:absolute;-webkit-user-select:none;-moz-user-select:none;user-select:none;pointer-events:all;transform-origin:0 0;box-sizing:border-box;cursor:default}.react-flow__node.selectable{cursor:pointer}.react-flow__node.draggable{cursor:grab;pointer-events:all}.react-flow__node.draggable.dragging{cursor:grabbing}.react-flow__nodesselection{z-index:3;transform-origin:left top;pointer-events:none}.react-flow__nodesselection-rect{position:absolute;pointer-events:all;cursor:grab}.react-flow__handle{position:absolute;pointer-events:none;min-width:5px;min-height:5px;width:6px;height:6px;background-color:var(--xy-handle-background-color, var(--xy-handle-background-color-default));border:1px solid var(--xy-handle-border-color, var(--xy-handle-border-color-default));border-radius:100%}.react-flow__handle.connectingfrom{pointer-events:all}.react-flow__handle.connectionindicator{pointer-events:all;cursor:crosshair}.react-flow__handle-bottom{top:auto;left:50%;bottom:0;transform:translate(-50%,50%)}.react-flow__handle-top{top:0;left:50%;transform:translate(-50%,-50%)}.react-flow__handle-left{top:50%;left:0;transform:translate(-50%,-50%)}.react-flow__handle-right{top:50%;right:0;transform:translate(50%,-50%)}.react-flow__edgeupdater{cursor:move;pointer-events:all}.react-flow__pane.selection .react-flow__panel{pointer-events:none}.react-flow__panel{position:absolute;z-index:5;margin:15px}.react-flow__panel.top{top:0}.react-flow__panel.bottom{bottom:0}.react-flow__panel.top.center,.react-flow__panel.bottom.center{left:50%;transform:translate(-15px) translate(-50%)}.react-flow__panel.left{left:0}.react-flow__panel.right{right:0}.react-flow__panel.left.center,.react-flow__panel.right.center{top:50%;transform:translateY(-15px) translateY(-50%)}.react-flow__attribution{font-size:10px;background:var(--xy-attribution-background-color, var(--xy-attribution-background-color-default));padding:2px 3px;margin:0}.react-flow__attribution a{text-decoration:none;color:#999}@keyframes dashdraw{0%{stroke-dashoffset:10}}.react-flow__edgelabel-renderer{position:absolute;width:100%;height:100%;pointer-events:none;-webkit-user-select:none;-moz-user-select:none;user-select:none;left:0;top:0}.react-flow__viewport-portal{position:absolute;width:100%;height:100%;left:0;top:0;-webkit-user-select:none;-moz-user-select:none;user-select:none}.react-flow__minimap{background:var( --xy-minimap-background-color-props, var(--xy-minimap-background-color, var(--xy-minimap-background-color-default)) )}.react-flow__minimap-svg{display:block}.react-flow__minimap-mask{fill:var( --xy-minimap-mask-background-color-props, var(--xy-minimap-mask-background-color, var(--xy-minimap-mask-background-color-default)) );stroke:var( --xy-minimap-mask-stroke-color-props, var(--xy-minimap-mask-stroke-color, var(--xy-minimap-mask-stroke-color-default)) );stroke-width:var( --xy-minimap-mask-stroke-width-props, var(--xy-minimap-mask-stroke-width, var(--xy-minimap-mask-stroke-width-default)) )}.react-flow__minimap-node{fill:var( --xy-minimap-node-background-color-props, var(--xy-minimap-node-background-color, var(--xy-minimap-node-background-color-default)) );stroke:var( --xy-minimap-node-stroke-color-props, var(--xy-minimap-node-stroke-color, var(--xy-minimap-node-stroke-color-default)) );stroke-width:var( --xy-minimap-node-stroke-width-props, var(--xy-minimap-node-stroke-width, var(--xy-minimap-node-stroke-width-default)) )}.react-flow__background-pattern.dots{fill:var( --xy-background-pattern-color-props, var(--xy-background-pattern-color, var(--xy-background-pattern-dots-color-default)) )}.react-flow__background-pattern.lines{stroke:var( --xy-background-pattern-color-props, var(--xy-background-pattern-color, var(--xy-background-pattern-lines-color-default)) )}.react-flow__background-pattern.cross{stroke:var( --xy-background-pattern-color-props, var(--xy-background-pattern-color, var(--xy-background-pattern-cross-color-default)) )}.react-flow__controls{display:flex;flex-direction:column;box-shadow:var(--xy-controls-box-shadow, var(--xy-controls-box-shadow-default))}.react-flow__controls.horizontal{flex-direction:row}.react-flow__controls-button{display:flex;justify-content:center;align-items:center;height:26px;width:26px;padding:4px;border:none;background:var(--xy-controls-button-background-color, var(--xy-controls-button-background-color-default));border-bottom:1px solid var( --xy-controls-button-border-color-props, var(--xy-controls-button-border-color, var(--xy-controls-button-border-color-default)) );color:var( --xy-controls-button-color-props, var(--xy-controls-button-color, var(--xy-controls-button-color-default)) );cursor:pointer;-webkit-user-select:none;-moz-user-select:none;user-select:none}.react-flow__controls-button svg{width:100%;max-width:12px;max-height:12px;fill:currentColor}.react-flow__edge.updating .react-flow__edge-path{stroke:#777}.react-flow__edge-text{font-size:10px}.react-flow__node.selectable:focus,.react-flow__node.selectable:focus-visible{outline:none}.react-flow__node-input,.react-flow__node-default,.react-flow__node-output,.react-flow__node-group{padding:10px;border-radius:var(--xy-node-border-radius, var(--xy-node-border-radius-default));width:150px;font-size:12px;color:var(--xy-node-color, var(--xy-node-color-default));text-align:center;border:var(--xy-node-border, var(--xy-node-border-default));background-color:var(--xy-node-background-color, var(--xy-node-background-color-default))}.react-flow__node-input.selectable:hover,.react-flow__node-default.selectable:hover,.react-flow__node-output.selectable:hover,.react-flow__node-group.selectable:hover{box-shadow:var(--xy-node-boxshadow-hover, var(--xy-node-boxshadow-hover-default))}.react-flow__node-input.selectable.selected,.react-flow__node-input.selectable:focus,.react-flow__node-input.selectable:focus-visible,.react-flow__node-default.selectable.selected,.react-flow__node-default.selectable:focus,.react-flow__node-default.selectable:focus-visible,.react-flow__node-output.selectable.selected,.react-flow__node-output.selectable:focus,.react-flow__node-output.selectable:focus-visible,.react-flow__node-group.selectable.selected,.react-flow__node-group.selectable:focus,.react-flow__node-group.selectable:focus-visible{box-shadow:var(--xy-node-boxshadow-selected, var(--xy-node-boxshadow-selected-default))}.react-flow__node-group{background-color:var(--xy-node-group-background-color, var(--xy-node-group-background-color-default))}.react-flow__nodesselection-rect,.react-flow__selection{background:var(--xy-selection-background-color, var(--xy-selection-background-color-default));border:var(--xy-selection-border, var(--xy-selection-border-default))}.react-flow__nodesselection-rect:focus,.react-flow__nodesselection-rect:focus-visible,.react-flow__selection:focus,.react-flow__selection:focus-visible{outline:none}.react-flow__controls-button:hover{background:var( --xy-controls-button-background-color-hover-props, var(--xy-controls-button-background-color-hover, var(--xy-controls-button-background-color-hover-default)) );color:var( --xy-controls-button-color-hover-props, var(--xy-controls-button-color-hover, var(--xy-controls-button-color-hover-default)) )}.react-flow__controls-button:disabled{pointer-events:none}.react-flow__controls-button:disabled svg{fill-opacity:.4}.react-flow__controls-button:last-child{border-bottom:none}.react-flow__controls.horizontal .react-flow__controls-button{border-bottom:none;border-right:1px solid var( --xy-controls-button-border-color-props, var(--xy-controls-button-border-color, var(--xy-controls-button-border-color-default)) )}.react-flow__controls.horizontal .react-flow__controls-button:last-child{border-right:none}.react-flow__resize-control{position:absolute}.react-flow__resize-control.left,.react-flow__resize-control.right{cursor:ew-resize}.react-flow__resize-control.top,.react-flow__resize-control.bottom{cursor:ns-resize}.react-flow__resize-control.top.left,.react-flow__resize-control.bottom.right{cursor:nwse-resize}.react-flow__resize-control.bottom.left,.react-flow__resize-control.top.right{cursor:nesw-resize}.react-flow__resize-control.handle{width:5px;height:5px;border:1px solid #fff;border-radius:1px;background-color:var(--xy-resize-background-color, var(--xy-resize-background-color-default));translate:-50% -50%}.react-flow__resize-control.handle.left{left:0;top:50%}.react-flow__resize-control.handle.right{left:100%;top:50%}.react-flow__resize-control.handle.top{left:50%;top:0}.react-flow__resize-control.handle.bottom{left:50%;top:100%}.react-flow__resize-control.handle.top.left,.react-flow__resize-control.handle.bottom.left{left:0}.react-flow__resize-control.handle.top.right,.react-flow__resize-control.handle.bottom.right{left:100%}.react-flow__resize-control.line{border-color:var(--xy-resize-background-color, var(--xy-resize-background-color-default));border-width:0;border-style:solid}.react-flow__resize-control.line.left,.react-flow__resize-control.line.right{width:1px;transform:translate(-50%);top:0;height:100%}.react-flow__resize-control.line.left{left:0;border-left-width:1px}.react-flow__resize-control.line.right{left:100%;border-right-width:1px}.react-flow__resize-control.line.top,.react-flow__resize-control.line.bottom{height:1px;transform:translateY(-50%);left:0;width:100%}.react-flow__resize-control.line.top{top:0;border-top-width:1px}.react-flow__resize-control.line.bottom{border-bottom-width:1px;top:100%}.react-flow__edge-textbg{fill:var(--xy-edge-label-background-color, var(--xy-edge-label-background-color-default))}.react-flow__edge-text{fill:var(--xy-edge-label-color, var(--xy-edge-label-color-default))}";
var Y = Si();
const ky = /* @__PURE__ */ Ih(Y);
function We(t) {
  if (typeof t == "string" || typeof t == "number") return "" + t;
  let r = "";
  if (Array.isArray(t))
    for (let i = 0, l; i < t.length; i++)
      (l = We(t[i])) !== "" && (r += (r && " ") + l);
  else
    for (let i in t)
      t[i] && (r += (r && " ") + i);
  return r;
}
var Ey = { value: () => {
} };
function wl() {
  for (var t = 0, r = arguments.length, i = {}, l; t < r; ++t) {
    if (!(l = arguments[t] + "") || l in i || /[\s.]/.test(l)) throw new Error("illegal type: " + l);
    i[l] = [];
  }
  return new nl(i);
}
function nl(t) {
  this._ = t;
}
function Cy(t, r) {
  return t.trim().split(/^|\s+/).map(function(i) {
    var l = "", a = i.indexOf(".");
    if (a >= 0 && (l = i.slice(a + 1), i = i.slice(0, a)), i && !r.hasOwnProperty(i)) throw new Error("unknown type: " + i);
    return { type: i, name: l };
  });
}
nl.prototype = wl.prototype = {
  constructor: nl,
  on: function(t, r) {
    var i = this._, l = Cy(t + "", i), a, c = -1, f = l.length;
    if (arguments.length < 2) {
      for (; ++c < f; ) if ((a = (t = l[c]).type) && (a = Ny(i[a], t.name))) return a;
      return;
    }
    if (r != null && typeof r != "function") throw new Error("invalid callback: " + r);
    for (; ++c < f; )
      if (a = (t = l[c]).type) i[a] = dp(i[a], t.name, r);
      else if (r == null) for (a in i) i[a] = dp(i[a], t.name, null);
    return this;
  },
  copy: function() {
    var t = {}, r = this._;
    for (var i in r) t[i] = r[i].slice();
    return new nl(t);
  },
  call: function(t, r) {
    if ((a = arguments.length - 2) > 0) for (var i = new Array(a), l = 0, a, c; l < a; ++l) i[l] = arguments[l + 2];
    if (!this._.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    for (c = this._[t], l = 0, a = c.length; l < a; ++l) c[l].value.apply(r, i);
  },
  apply: function(t, r, i) {
    if (!this._.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    for (var l = this._[t], a = 0, c = l.length; a < c; ++a) l[a].value.apply(r, i);
  }
};
function Ny(t, r) {
  for (var i = 0, l = t.length, a; i < l; ++i)
    if ((a = t[i]).name === r)
      return a.value;
}
function dp(t, r, i) {
  for (var l = 0, a = t.length; l < a; ++l)
    if (t[l].name === r) {
      t[l] = Ey, t = t.slice(0, l).concat(t.slice(l + 1));
      break;
    }
  return i != null && t.push({ name: r, value: i }), t;
}
var Qu = "http://www.w3.org/1999/xhtml", pp = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: Qu,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function xl(t) {
  var r = t += "", i = r.indexOf(":");
  return i >= 0 && (r = t.slice(0, i)) !== "xmlns" && (t = t.slice(i + 1)), pp.hasOwnProperty(r) ? { space: pp[r], local: t } : t;
}
function My(t) {
  return function() {
    var r = this.ownerDocument, i = this.namespaceURI;
    return i === Qu && r.documentElement.namespaceURI === Qu ? r.createElement(t) : r.createElementNS(i, t);
  };
}
function zy(t) {
  return function() {
    return this.ownerDocument.createElementNS(t.space, t.local);
  };
}
function Rh(t) {
  var r = xl(t);
  return (r.local ? zy : My)(r);
}
function Py() {
}
function cc(t) {
  return t == null ? Py : function() {
    return this.querySelector(t);
  };
}
function Iy(t) {
  typeof t != "function" && (t = cc(t));
  for (var r = this._groups, i = r.length, l = new Array(i), a = 0; a < i; ++a)
    for (var c = r[a], f = c.length, p = l[a] = new Array(f), h, g, m = 0; m < f; ++m)
      (h = c[m]) && (g = t.call(h, h.__data__, m, c)) && ("__data__" in h && (g.__data__ = h.__data__), p[m] = g);
  return new Et(l, this._parents);
}
function Ty(t) {
  return t == null ? [] : Array.isArray(t) ? t : Array.from(t);
}
function by() {
  return [];
}
function Dh(t) {
  return t == null ? by : function() {
    return this.querySelectorAll(t);
  };
}
function Ry(t) {
  return function() {
    return Ty(t.apply(this, arguments));
  };
}
function Dy(t) {
  typeof t == "function" ? t = Ry(t) : t = Dh(t);
  for (var r = this._groups, i = r.length, l = [], a = [], c = 0; c < i; ++c)
    for (var f = r[c], p = f.length, h, g = 0; g < p; ++g)
      (h = f[g]) && (l.push(t.call(h, h.__data__, g, f)), a.push(h));
  return new Et(l, a);
}
function Lh(t) {
  return function() {
    return this.matches(t);
  };
}
function $h(t) {
  return function(r) {
    return r.matches(t);
  };
}
var Ly = Array.prototype.find;
function $y(t) {
  return function() {
    return Ly.call(this.children, t);
  };
}
function Oy() {
  return this.firstElementChild;
}
function Ay(t) {
  return this.select(t == null ? Oy : $y(typeof t == "function" ? t : $h(t)));
}
var jy = Array.prototype.filter;
function Hy() {
  return Array.from(this.children);
}
function Fy(t) {
  return function() {
    return jy.call(this.children, t);
  };
}
function Vy(t) {
  return this.selectAll(t == null ? Hy : Fy(typeof t == "function" ? t : $h(t)));
}
function By(t) {
  typeof t != "function" && (t = Lh(t));
  for (var r = this._groups, i = r.length, l = new Array(i), a = 0; a < i; ++a)
    for (var c = r[a], f = c.length, p = l[a] = [], h, g = 0; g < f; ++g)
      (h = c[g]) && t.call(h, h.__data__, g, c) && p.push(h);
  return new Et(l, this._parents);
}
function Oh(t) {
  return new Array(t.length);
}
function Uy() {
  return new Et(this._enter || this._groups.map(Oh), this._parents);
}
function ll(t, r) {
  this.ownerDocument = t.ownerDocument, this.namespaceURI = t.namespaceURI, this._next = null, this._parent = t, this.__data__ = r;
}
ll.prototype = {
  constructor: ll,
  appendChild: function(t) {
    return this._parent.insertBefore(t, this._next);
  },
  insertBefore: function(t, r) {
    return this._parent.insertBefore(t, r);
  },
  querySelector: function(t) {
    return this._parent.querySelector(t);
  },
  querySelectorAll: function(t) {
    return this._parent.querySelectorAll(t);
  }
};
function Wy(t) {
  return function() {
    return t;
  };
}
function Xy(t, r, i, l, a, c) {
  for (var f = 0, p, h = r.length, g = c.length; f < g; ++f)
    (p = r[f]) ? (p.__data__ = c[f], l[f] = p) : i[f] = new ll(t, c[f]);
  for (; f < h; ++f)
    (p = r[f]) && (a[f] = p);
}
function Yy(t, r, i, l, a, c, f) {
  var p, h, g = /* @__PURE__ */ new Map(), m = r.length, v = c.length, y = new Array(m), _;
  for (p = 0; p < m; ++p)
    (h = r[p]) && (y[p] = _ = f.call(h, h.__data__, p, r) + "", g.has(_) ? a[p] = h : g.set(_, h));
  for (p = 0; p < v; ++p)
    _ = f.call(t, c[p], p, c) + "", (h = g.get(_)) ? (l[p] = h, h.__data__ = c[p], g.delete(_)) : i[p] = new ll(t, c[p]);
  for (p = 0; p < m; ++p)
    (h = r[p]) && g.get(y[p]) === h && (a[p] = h);
}
function Zy(t) {
  return t.__data__;
}
function Qy(t, r) {
  if (!arguments.length) return Array.from(this, Zy);
  var i = r ? Yy : Xy, l = this._parents, a = this._groups;
  typeof t != "function" && (t = Wy(t));
  for (var c = a.length, f = new Array(c), p = new Array(c), h = new Array(c), g = 0; g < c; ++g) {
    var m = l[g], v = a[g], y = v.length, _ = Ky(t.call(m, m && m.__data__, g, l)), x = _.length, N = p[g] = new Array(x), E = f[g] = new Array(x), M = h[g] = new Array(y);
    i(m, v, N, E, M, _, r);
    for (var T = 0, S = 0, P, B; T < x; ++T)
      if (P = N[T]) {
        for (T >= S && (S = T + 1); !(B = E[S]) && ++S < x; ) ;
        P._next = B || null;
      }
  }
  return f = new Et(f, l), f._enter = p, f._exit = h, f;
}
function Ky(t) {
  return typeof t == "object" && "length" in t ? t : Array.from(t);
}
function Gy() {
  return new Et(this._exit || this._groups.map(Oh), this._parents);
}
function qy(t, r, i) {
  var l = this.enter(), a = this, c = this.exit();
  return typeof t == "function" ? (l = t(l), l && (l = l.selection())) : l = l.append(t + ""), r != null && (a = r(a), a && (a = a.selection())), i == null ? c.remove() : i(c), l && a ? l.merge(a).order() : a;
}
function Jy(t) {
  for (var r = t.selection ? t.selection() : t, i = this._groups, l = r._groups, a = i.length, c = l.length, f = Math.min(a, c), p = new Array(a), h = 0; h < f; ++h)
    for (var g = i[h], m = l[h], v = g.length, y = p[h] = new Array(v), _, x = 0; x < v; ++x)
      (_ = g[x] || m[x]) && (y[x] = _);
  for (; h < a; ++h)
    p[h] = i[h];
  return new Et(p, this._parents);
}
function ev() {
  for (var t = this._groups, r = -1, i = t.length; ++r < i; )
    for (var l = t[r], a = l.length - 1, c = l[a], f; --a >= 0; )
      (f = l[a]) && (c && f.compareDocumentPosition(c) ^ 4 && c.parentNode.insertBefore(f, c), c = f);
  return this;
}
function tv(t) {
  t || (t = nv);
  function r(v, y) {
    return v && y ? t(v.__data__, y.__data__) : !v - !y;
  }
  for (var i = this._groups, l = i.length, a = new Array(l), c = 0; c < l; ++c) {
    for (var f = i[c], p = f.length, h = a[c] = new Array(p), g, m = 0; m < p; ++m)
      (g = f[m]) && (h[m] = g);
    h.sort(r);
  }
  return new Et(a, this._parents).order();
}
function nv(t, r) {
  return t < r ? -1 : t > r ? 1 : t >= r ? 0 : NaN;
}
function rv() {
  var t = arguments[0];
  return arguments[0] = this, t.apply(null, arguments), this;
}
function ov() {
  return Array.from(this);
}
function iv() {
  for (var t = this._groups, r = 0, i = t.length; r < i; ++r)
    for (var l = t[r], a = 0, c = l.length; a < c; ++a) {
      var f = l[a];
      if (f) return f;
    }
  return null;
}
function sv() {
  let t = 0;
  for (const r of this) ++t;
  return t;
}
function lv() {
  return !this.node();
}
function av(t) {
  for (var r = this._groups, i = 0, l = r.length; i < l; ++i)
    for (var a = r[i], c = 0, f = a.length, p; c < f; ++c)
      (p = a[c]) && t.call(p, p.__data__, c, a);
  return this;
}
function uv(t) {
  return function() {
    this.removeAttribute(t);
  };
}
function cv(t) {
  return function() {
    this.removeAttributeNS(t.space, t.local);
  };
}
function fv(t, r) {
  return function() {
    this.setAttribute(t, r);
  };
}
function dv(t, r) {
  return function() {
    this.setAttributeNS(t.space, t.local, r);
  };
}
function pv(t, r) {
  return function() {
    var i = r.apply(this, arguments);
    i == null ? this.removeAttribute(t) : this.setAttribute(t, i);
  };
}
function hv(t, r) {
  return function() {
    var i = r.apply(this, arguments);
    i == null ? this.removeAttributeNS(t.space, t.local) : this.setAttributeNS(t.space, t.local, i);
  };
}
function gv(t, r) {
  var i = xl(t);
  if (arguments.length < 2) {
    var l = this.node();
    return i.local ? l.getAttributeNS(i.space, i.local) : l.getAttribute(i);
  }
  return this.each((r == null ? i.local ? cv : uv : typeof r == "function" ? i.local ? hv : pv : i.local ? dv : fv)(i, r));
}
function Ah(t) {
  return t.ownerDocument && t.ownerDocument.defaultView || t.document && t || t.defaultView;
}
function mv(t) {
  return function() {
    this.style.removeProperty(t);
  };
}
function yv(t, r, i) {
  return function() {
    this.style.setProperty(t, r, i);
  };
}
function vv(t, r, i) {
  return function() {
    var l = r.apply(this, arguments);
    l == null ? this.style.removeProperty(t) : this.style.setProperty(t, l, i);
  };
}
function wv(t, r, i) {
  return arguments.length > 1 ? this.each((r == null ? mv : typeof r == "function" ? vv : yv)(t, r, i ?? "")) : lo(this.node(), t);
}
function lo(t, r) {
  return t.style.getPropertyValue(r) || Ah(t).getComputedStyle(t, null).getPropertyValue(r);
}
function xv(t) {
  return function() {
    delete this[t];
  };
}
function _v(t, r) {
  return function() {
    this[t] = r;
  };
}
function Sv(t, r) {
  return function() {
    var i = r.apply(this, arguments);
    i == null ? delete this[t] : this[t] = i;
  };
}
function kv(t, r) {
  return arguments.length > 1 ? this.each((r == null ? xv : typeof r == "function" ? Sv : _v)(t, r)) : this.node()[t];
}
function jh(t) {
  return t.trim().split(/^|\s+/);
}
function fc(t) {
  return t.classList || new Hh(t);
}
function Hh(t) {
  this._node = t, this._names = jh(t.getAttribute("class") || "");
}
Hh.prototype = {
  add: function(t) {
    var r = this._names.indexOf(t);
    r < 0 && (this._names.push(t), this._node.setAttribute("class", this._names.join(" ")));
  },
  remove: function(t) {
    var r = this._names.indexOf(t);
    r >= 0 && (this._names.splice(r, 1), this._node.setAttribute("class", this._names.join(" ")));
  },
  contains: function(t) {
    return this._names.indexOf(t) >= 0;
  }
};
function Fh(t, r) {
  for (var i = fc(t), l = -1, a = r.length; ++l < a; ) i.add(r[l]);
}
function Vh(t, r) {
  for (var i = fc(t), l = -1, a = r.length; ++l < a; ) i.remove(r[l]);
}
function Ev(t) {
  return function() {
    Fh(this, t);
  };
}
function Cv(t) {
  return function() {
    Vh(this, t);
  };
}
function Nv(t, r) {
  return function() {
    (r.apply(this, arguments) ? Fh : Vh)(this, t);
  };
}
function Mv(t, r) {
  var i = jh(t + "");
  if (arguments.length < 2) {
    for (var l = fc(this.node()), a = -1, c = i.length; ++a < c; ) if (!l.contains(i[a])) return !1;
    return !0;
  }
  return this.each((typeof r == "function" ? Nv : r ? Ev : Cv)(i, r));
}
function zv() {
  this.textContent = "";
}
function Pv(t) {
  return function() {
    this.textContent = t;
  };
}
function Iv(t) {
  return function() {
    var r = t.apply(this, arguments);
    this.textContent = r ?? "";
  };
}
function Tv(t) {
  return arguments.length ? this.each(t == null ? zv : (typeof t == "function" ? Iv : Pv)(t)) : this.node().textContent;
}
function bv() {
  this.innerHTML = "";
}
function Rv(t) {
  return function() {
    this.innerHTML = t;
  };
}
function Dv(t) {
  return function() {
    var r = t.apply(this, arguments);
    this.innerHTML = r ?? "";
  };
}
function Lv(t) {
  return arguments.length ? this.each(t == null ? bv : (typeof t == "function" ? Dv : Rv)(t)) : this.node().innerHTML;
}
function $v() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function Ov() {
  return this.each($v);
}
function Av() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function jv() {
  return this.each(Av);
}
function Hv(t) {
  var r = typeof t == "function" ? t : Rh(t);
  return this.select(function() {
    return this.appendChild(r.apply(this, arguments));
  });
}
function Fv() {
  return null;
}
function Vv(t, r) {
  var i = typeof t == "function" ? t : Rh(t), l = r == null ? Fv : typeof r == "function" ? r : cc(r);
  return this.select(function() {
    return this.insertBefore(i.apply(this, arguments), l.apply(this, arguments) || null);
  });
}
function Bv() {
  var t = this.parentNode;
  t && t.removeChild(this);
}
function Uv() {
  return this.each(Bv);
}
function Wv() {
  var t = this.cloneNode(!1), r = this.parentNode;
  return r ? r.insertBefore(t, this.nextSibling) : t;
}
function Xv() {
  var t = this.cloneNode(!0), r = this.parentNode;
  return r ? r.insertBefore(t, this.nextSibling) : t;
}
function Yv(t) {
  return this.select(t ? Xv : Wv);
}
function Zv(t) {
  return arguments.length ? this.property("__data__", t) : this.node().__data__;
}
function Qv(t) {
  return function(r) {
    t.call(this, r, this.__data__);
  };
}
function Kv(t) {
  return t.trim().split(/^|\s+/).map(function(r) {
    var i = "", l = r.indexOf(".");
    return l >= 0 && (i = r.slice(l + 1), r = r.slice(0, l)), { type: r, name: i };
  });
}
function Gv(t) {
  return function() {
    var r = this.__on;
    if (r) {
      for (var i = 0, l = -1, a = r.length, c; i < a; ++i)
        c = r[i], (!t.type || c.type === t.type) && c.name === t.name ? this.removeEventListener(c.type, c.listener, c.options) : r[++l] = c;
      ++l ? r.length = l : delete this.__on;
    }
  };
}
function qv(t, r, i) {
  return function() {
    var l = this.__on, a, c = Qv(r);
    if (l) {
      for (var f = 0, p = l.length; f < p; ++f)
        if ((a = l[f]).type === t.type && a.name === t.name) {
          this.removeEventListener(a.type, a.listener, a.options), this.addEventListener(a.type, a.listener = c, a.options = i), a.value = r;
          return;
        }
    }
    this.addEventListener(t.type, c, i), a = { type: t.type, name: t.name, value: r, listener: c, options: i }, l ? l.push(a) : this.__on = [a];
  };
}
function Jv(t, r, i) {
  var l = Kv(t + ""), a, c = l.length, f;
  if (arguments.length < 2) {
    var p = this.node().__on;
    if (p) {
      for (var h = 0, g = p.length, m; h < g; ++h)
        for (a = 0, m = p[h]; a < c; ++a)
          if ((f = l[a]).type === m.type && f.name === m.name)
            return m.value;
    }
    return;
  }
  for (p = r ? qv : Gv, a = 0; a < c; ++a) this.each(p(l[a], r, i));
  return this;
}
function Bh(t, r, i) {
  var l = Ah(t), a = l.CustomEvent;
  typeof a == "function" ? a = new a(r, i) : (a = l.document.createEvent("Event"), i ? (a.initEvent(r, i.bubbles, i.cancelable), a.detail = i.detail) : a.initEvent(r, !1, !1)), t.dispatchEvent(a);
}
function ew(t, r) {
  return function() {
    return Bh(this, t, r);
  };
}
function tw(t, r) {
  return function() {
    return Bh(this, t, r.apply(this, arguments));
  };
}
function nw(t, r) {
  return this.each((typeof r == "function" ? tw : ew)(t, r));
}
function* rw() {
  for (var t = this._groups, r = 0, i = t.length; r < i; ++r)
    for (var l = t[r], a = 0, c = l.length, f; a < c; ++a)
      (f = l[a]) && (yield f);
}
var Uh = [null];
function Et(t, r) {
  this._groups = t, this._parents = r;
}
function ki() {
  return new Et([[document.documentElement]], Uh);
}
function ow() {
  return this;
}
Et.prototype = ki.prototype = {
  constructor: Et,
  select: Iy,
  selectAll: Dy,
  selectChild: Ay,
  selectChildren: Vy,
  filter: By,
  data: Qy,
  enter: Uy,
  exit: Gy,
  join: qy,
  merge: Jy,
  selection: ow,
  order: ev,
  sort: tv,
  call: rv,
  nodes: ov,
  node: iv,
  size: sv,
  empty: lv,
  each: av,
  attr: gv,
  style: wv,
  property: kv,
  classed: Mv,
  text: Tv,
  html: Lv,
  raise: Ov,
  lower: jv,
  append: Hv,
  insert: Vv,
  remove: Uv,
  clone: Yv,
  datum: Zv,
  on: Jv,
  dispatch: nw,
  [Symbol.iterator]: rw
};
function kt(t) {
  return typeof t == "string" ? new Et([[document.querySelector(t)]], [document.documentElement]) : new Et([[t]], Uh);
}
var iw = 0;
function hp() {
  this._ = "@" + (++iw).toString(36);
}
hp.prototype = {
  constructor: hp,
  get: function(t) {
    for (var r = this._; !(r in t); ) if (!(t = t.parentNode)) return;
    return t[r];
  },
  set: function(t, r) {
    return t[this._] = r;
  },
  remove: function(t) {
    return this._ in t && delete t[this._];
  },
  toString: function() {
    return this._;
  }
};
function sw(t) {
  let r;
  for (; r = t.sourceEvent; ) t = r;
  return t;
}
function Ht(t, r) {
  if (t = sw(t), r === void 0 && (r = t.currentTarget), r) {
    var i = r.ownerSVGElement || r;
    if (i.createSVGPoint) {
      var l = i.createSVGPoint();
      return l.x = t.clientX, l.y = t.clientY, l = l.matrixTransform(r.getScreenCTM().inverse()), [l.x, l.y];
    }
    if (r.getBoundingClientRect) {
      var a = r.getBoundingClientRect();
      return [t.clientX - a.left - r.clientLeft, t.clientY - a.top - r.clientTop];
    }
  }
  return [t.pageX, t.pageY];
}
const lw = { passive: !1 }, pi = { capture: !0, passive: !1 };
function Tu(t) {
  t.stopImmediatePropagation();
}
function ro(t) {
  t.preventDefault(), t.stopImmediatePropagation();
}
function Wh(t) {
  var r = t.document.documentElement, i = kt(t).on("dragstart.drag", ro, pi);
  "onselectstart" in r ? i.on("selectstart.drag", ro, pi) : (r.__noselect = r.style.MozUserSelect, r.style.MozUserSelect = "none");
}
function Xh(t, r) {
  var i = t.document.documentElement, l = kt(t).on("dragstart.drag", null);
  r && (l.on("click.drag", ro, pi), setTimeout(function() {
    l.on("click.drag", null);
  }, 0)), "onselectstart" in i ? l.on("selectstart.drag", null) : (i.style.MozUserSelect = i.__noselect, delete i.__noselect);
}
var Ys = (t) => () => t;
function Ku(t, {
  sourceEvent: r,
  subject: i,
  target: l,
  identifier: a,
  active: c,
  x: f,
  y: p,
  dx: h,
  dy: g,
  dispatch: m
}) {
  Object.defineProperties(this, {
    type: { value: t, enumerable: !0, configurable: !0 },
    sourceEvent: { value: r, enumerable: !0, configurable: !0 },
    subject: { value: i, enumerable: !0, configurable: !0 },
    target: { value: l, enumerable: !0, configurable: !0 },
    identifier: { value: a, enumerable: !0, configurable: !0 },
    active: { value: c, enumerable: !0, configurable: !0 },
    x: { value: f, enumerable: !0, configurable: !0 },
    y: { value: p, enumerable: !0, configurable: !0 },
    dx: { value: h, enumerable: !0, configurable: !0 },
    dy: { value: g, enumerable: !0, configurable: !0 },
    _: { value: m }
  });
}
Ku.prototype.on = function() {
  var t = this._.on.apply(this._, arguments);
  return t === this._ ? this : t;
};
function aw(t) {
  return !t.ctrlKey && !t.button;
}
function uw() {
  return this.parentNode;
}
function cw(t, r) {
  return r ?? { x: t.x, y: t.y };
}
function fw() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function Yh() {
  var t = aw, r = uw, i = cw, l = fw, a = {}, c = wl("start", "drag", "end"), f = 0, p, h, g, m, v = 0;
  function y(P) {
    P.on("mousedown.drag", _).filter(l).on("touchstart.drag", E).on("touchmove.drag", M, lw).on("touchend.drag touchcancel.drag", T).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function _(P, B) {
    if (!(m || !t.call(this, P, B))) {
      var D = S(this, r.call(this, P, B), P, B, "mouse");
      D && (kt(P.view).on("mousemove.drag", x, pi).on("mouseup.drag", N, pi), Wh(P.view), Tu(P), g = !1, p = P.clientX, h = P.clientY, D("start", P));
    }
  }
  function x(P) {
    if (ro(P), !g) {
      var B = P.clientX - p, D = P.clientY - h;
      g = B * B + D * D > v;
    }
    a.mouse("drag", P);
  }
  function N(P) {
    kt(P.view).on("mousemove.drag mouseup.drag", null), Xh(P.view, g), ro(P), a.mouse("end", P);
  }
  function E(P, B) {
    if (t.call(this, P, B)) {
      var D = P.changedTouches, F = r.call(this, P, B), Q = D.length, K, ee;
      for (K = 0; K < Q; ++K)
        (ee = S(this, F, P, B, D[K].identifier, D[K])) && (Tu(P), ee("start", P, D[K]));
    }
  }
  function M(P) {
    var B = P.changedTouches, D = B.length, F, Q;
    for (F = 0; F < D; ++F)
      (Q = a[B[F].identifier]) && (ro(P), Q("drag", P, B[F]));
  }
  function T(P) {
    var B = P.changedTouches, D = B.length, F, Q;
    for (m && clearTimeout(m), m = setTimeout(function() {
      m = null;
    }, 500), F = 0; F < D; ++F)
      (Q = a[B[F].identifier]) && (Tu(P), Q("end", P, B[F]));
  }
  function S(P, B, D, F, Q, K) {
    var ee = c.copy(), J = Ht(K || D, B), A, W, k;
    if ((k = i.call(P, new Ku("beforestart", {
      sourceEvent: D,
      target: y,
      identifier: Q,
      active: f,
      x: J[0],
      y: J[1],
      dx: 0,
      dy: 0,
      dispatch: ee
    }), F)) != null)
      return A = k.x - J[0] || 0, W = k.y - J[1] || 0, function $(O, V, b) {
        var j = J, U;
        switch (O) {
          case "start":
            a[Q] = $, U = f++;
            break;
          case "end":
            delete a[Q], --f;
          // falls through
          case "drag":
            J = Ht(b || V, B), U = f;
            break;
        }
        ee.call(
          O,
          P,
          new Ku(O, {
            sourceEvent: V,
            subject: k,
            target: y,
            identifier: Q,
            active: U,
            x: J[0] + A,
            y: J[1] + W,
            dx: J[0] - j[0],
            dy: J[1] - j[1],
            dispatch: ee
          }),
          F
        );
      };
  }
  return y.filter = function(P) {
    return arguments.length ? (t = typeof P == "function" ? P : Ys(!!P), y) : t;
  }, y.container = function(P) {
    return arguments.length ? (r = typeof P == "function" ? P : Ys(P), y) : r;
  }, y.subject = function(P) {
    return arguments.length ? (i = typeof P == "function" ? P : Ys(P), y) : i;
  }, y.touchable = function(P) {
    return arguments.length ? (l = typeof P == "function" ? P : Ys(!!P), y) : l;
  }, y.on = function() {
    var P = c.on.apply(c, arguments);
    return P === c ? y : P;
  }, y.clickDistance = function(P) {
    return arguments.length ? (v = (P = +P) * P, y) : Math.sqrt(v);
  }, y;
}
function mo(t, r, i) {
  t.prototype = r.prototype = i, i.constructor = t;
}
function Ei(t, r) {
  var i = Object.create(t.prototype);
  for (var l in r) i[l] = r[l];
  return i;
}
function Yn() {
}
var wr = 0.7, ao = 1 / wr, oo = "\\s*([+-]?\\d+)\\s*", hi = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", nn = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", dw = /^#([0-9a-f]{3,8})$/, pw = new RegExp(`^rgb\\(${oo},${oo},${oo}\\)$`), hw = new RegExp(`^rgb\\(${nn},${nn},${nn}\\)$`), gw = new RegExp(`^rgba\\(${oo},${oo},${oo},${hi}\\)$`), mw = new RegExp(`^rgba\\(${nn},${nn},${nn},${hi}\\)$`), yw = new RegExp(`^hsl\\(${hi},${nn},${nn}\\)$`), vw = new RegExp(`^hsla\\(${hi},${nn},${nn},${hi}\\)$`), gp = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
mo(Yn, xr, {
  copy(t) {
    return Object.assign(new this.constructor(), this, t);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: mp,
  // Deprecated! Use color.formatHex.
  formatHex: mp,
  formatHex8: ww,
  formatHsl: xw,
  formatRgb: yp,
  toString: yp
});
function mp() {
  return this.rgb().formatHex();
}
function ww() {
  return this.rgb().formatHex8();
}
function xw() {
  return Zh(this).formatHsl();
}
function yp() {
  return this.rgb().formatRgb();
}
function xr(t) {
  var r, i;
  return t = (t + "").trim().toLowerCase(), (r = dw.exec(t)) ? (i = r[1].length, r = parseInt(r[1], 16), i === 6 ? vp(r) : i === 3 ? new Ge(r >> 8 & 15 | r >> 4 & 240, r >> 4 & 15 | r & 240, (r & 15) << 4 | r & 15, 1) : i === 8 ? Zs(r >> 24 & 255, r >> 16 & 255, r >> 8 & 255, (r & 255) / 255) : i === 4 ? Zs(r >> 12 & 15 | r >> 8 & 240, r >> 8 & 15 | r >> 4 & 240, r >> 4 & 15 | r & 240, ((r & 15) << 4 | r & 15) / 255) : null) : (r = pw.exec(t)) ? new Ge(r[1], r[2], r[3], 1) : (r = hw.exec(t)) ? new Ge(r[1] * 255 / 100, r[2] * 255 / 100, r[3] * 255 / 100, 1) : (r = gw.exec(t)) ? Zs(r[1], r[2], r[3], r[4]) : (r = mw.exec(t)) ? Zs(r[1] * 255 / 100, r[2] * 255 / 100, r[3] * 255 / 100, r[4]) : (r = yw.exec(t)) ? _p(r[1], r[2] / 100, r[3] / 100, 1) : (r = vw.exec(t)) ? _p(r[1], r[2] / 100, r[3] / 100, r[4]) : gp.hasOwnProperty(t) ? vp(gp[t]) : t === "transparent" ? new Ge(NaN, NaN, NaN, 0) : null;
}
function vp(t) {
  return new Ge(t >> 16 & 255, t >> 8 & 255, t & 255, 1);
}
function Zs(t, r, i, l) {
  return l <= 0 && (t = r = i = NaN), new Ge(t, r, i, l);
}
function dc(t) {
  return t instanceof Yn || (t = xr(t)), t ? (t = t.rgb(), new Ge(t.r, t.g, t.b, t.opacity)) : new Ge();
}
function Gu(t, r, i, l) {
  return arguments.length === 1 ? dc(t) : new Ge(t, r, i, l ?? 1);
}
function Ge(t, r, i, l) {
  this.r = +t, this.g = +r, this.b = +i, this.opacity = +l;
}
mo(Ge, Gu, Ei(Yn, {
  brighter(t) {
    return t = t == null ? ao : Math.pow(ao, t), new Ge(this.r * t, this.g * t, this.b * t, this.opacity);
  },
  darker(t) {
    return t = t == null ? wr : Math.pow(wr, t), new Ge(this.r * t, this.g * t, this.b * t, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Ge(mr(this.r), mr(this.g), mr(this.b), al(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: wp,
  // Deprecated! Use color.formatHex.
  formatHex: wp,
  formatHex8: _w,
  formatRgb: xp,
  toString: xp
}));
function wp() {
  return `#${gr(this.r)}${gr(this.g)}${gr(this.b)}`;
}
function _w() {
  return `#${gr(this.r)}${gr(this.g)}${gr(this.b)}${gr((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function xp() {
  const t = al(this.opacity);
  return `${t === 1 ? "rgb(" : "rgba("}${mr(this.r)}, ${mr(this.g)}, ${mr(this.b)}${t === 1 ? ")" : `, ${t})`}`;
}
function al(t) {
  return isNaN(t) ? 1 : Math.max(0, Math.min(1, t));
}
function mr(t) {
  return Math.max(0, Math.min(255, Math.round(t) || 0));
}
function gr(t) {
  return t = mr(t), (t < 16 ? "0" : "") + t.toString(16);
}
function _p(t, r, i, l) {
  return l <= 0 ? t = r = i = NaN : i <= 0 || i >= 1 ? t = r = NaN : r <= 0 && (t = NaN), new Ft(t, r, i, l);
}
function Zh(t) {
  if (t instanceof Ft) return new Ft(t.h, t.s, t.l, t.opacity);
  if (t instanceof Yn || (t = xr(t)), !t) return new Ft();
  if (t instanceof Ft) return t;
  t = t.rgb();
  var r = t.r / 255, i = t.g / 255, l = t.b / 255, a = Math.min(r, i, l), c = Math.max(r, i, l), f = NaN, p = c - a, h = (c + a) / 2;
  return p ? (r === c ? f = (i - l) / p + (i < l) * 6 : i === c ? f = (l - r) / p + 2 : f = (r - i) / p + 4, p /= h < 0.5 ? c + a : 2 - c - a, f *= 60) : p = h > 0 && h < 1 ? 0 : f, new Ft(f, p, h, t.opacity);
}
function Sw(t, r, i, l) {
  return arguments.length === 1 ? Zh(t) : new Ft(t, r, i, l ?? 1);
}
function Ft(t, r, i, l) {
  this.h = +t, this.s = +r, this.l = +i, this.opacity = +l;
}
mo(Ft, Sw, Ei(Yn, {
  brighter(t) {
    return t = t == null ? ao : Math.pow(ao, t), new Ft(this.h, this.s, this.l * t, this.opacity);
  },
  darker(t) {
    return t = t == null ? wr : Math.pow(wr, t), new Ft(this.h, this.s, this.l * t, this.opacity);
  },
  rgb() {
    var t = this.h % 360 + (this.h < 0) * 360, r = isNaN(t) || isNaN(this.s) ? 0 : this.s, i = this.l, l = i + (i < 0.5 ? i : 1 - i) * r, a = 2 * i - l;
    return new Ge(
      bu(t >= 240 ? t - 240 : t + 120, a, l),
      bu(t, a, l),
      bu(t < 120 ? t + 240 : t - 120, a, l),
      this.opacity
    );
  },
  clamp() {
    return new Ft(Sp(this.h), Qs(this.s), Qs(this.l), al(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const t = al(this.opacity);
    return `${t === 1 ? "hsl(" : "hsla("}${Sp(this.h)}, ${Qs(this.s) * 100}%, ${Qs(this.l) * 100}%${t === 1 ? ")" : `, ${t})`}`;
  }
}));
function Sp(t) {
  return t = (t || 0) % 360, t < 0 ? t + 360 : t;
}
function Qs(t) {
  return Math.max(0, Math.min(1, t || 0));
}
function bu(t, r, i) {
  return (t < 60 ? r + (i - r) * t / 60 : t < 180 ? i : t < 240 ? r + (i - r) * (240 - t) / 60 : r) * 255;
}
const Qh = Math.PI / 180, Kh = 180 / Math.PI, ul = 18, Gh = 0.96422, qh = 1, Jh = 0.82521, eg = 4 / 29, io = 6 / 29, tg = 3 * io * io, kw = io * io * io;
function ng(t) {
  if (t instanceof rn) return new rn(t.l, t.a, t.b, t.opacity);
  if (t instanceof yn) return rg(t);
  t instanceof Ge || (t = dc(t));
  var r = $u(t.r), i = $u(t.g), l = $u(t.b), a = Ru((0.2225045 * r + 0.7168786 * i + 0.0606169 * l) / qh), c, f;
  return r === i && i === l ? c = f = a : (c = Ru((0.4360747 * r + 0.3850649 * i + 0.1430804 * l) / Gh), f = Ru((0.0139322 * r + 0.0971045 * i + 0.7141733 * l) / Jh)), new rn(116 * a - 16, 500 * (c - a), 200 * (a - f), t.opacity);
}
function Ew(t, r, i, l) {
  return arguments.length === 1 ? ng(t) : new rn(t, r, i, l ?? 1);
}
function rn(t, r, i, l) {
  this.l = +t, this.a = +r, this.b = +i, this.opacity = +l;
}
mo(rn, Ew, Ei(Yn, {
  brighter(t) {
    return new rn(this.l + ul * (t ?? 1), this.a, this.b, this.opacity);
  },
  darker(t) {
    return new rn(this.l - ul * (t ?? 1), this.a, this.b, this.opacity);
  },
  rgb() {
    var t = (this.l + 16) / 116, r = isNaN(this.a) ? t : t + this.a / 500, i = isNaN(this.b) ? t : t - this.b / 200;
    return r = Gh * Du(r), t = qh * Du(t), i = Jh * Du(i), new Ge(
      Lu(3.1338561 * r - 1.6168667 * t - 0.4906146 * i),
      Lu(-0.9787684 * r + 1.9161415 * t + 0.033454 * i),
      Lu(0.0719453 * r - 0.2289914 * t + 1.4052427 * i),
      this.opacity
    );
  }
}));
function Ru(t) {
  return t > kw ? Math.pow(t, 1 / 3) : t / tg + eg;
}
function Du(t) {
  return t > io ? t * t * t : tg * (t - eg);
}
function Lu(t) {
  return 255 * (t <= 31308e-7 ? 12.92 * t : 1.055 * Math.pow(t, 1 / 2.4) - 0.055);
}
function $u(t) {
  return (t /= 255) <= 0.04045 ? t / 12.92 : Math.pow((t + 0.055) / 1.055, 2.4);
}
function Cw(t) {
  if (t instanceof yn) return new yn(t.h, t.c, t.l, t.opacity);
  if (t instanceof rn || (t = ng(t)), t.a === 0 && t.b === 0) return new yn(NaN, 0 < t.l && t.l < 100 ? 0 : NaN, t.l, t.opacity);
  var r = Math.atan2(t.b, t.a) * Kh;
  return new yn(r < 0 ? r + 360 : r, Math.sqrt(t.a * t.a + t.b * t.b), t.l, t.opacity);
}
function Nw(t, r, i, l) {
  return arguments.length === 1 ? Cw(t) : new yn(t, r, i, l ?? 1);
}
function yn(t, r, i, l) {
  this.h = +t, this.c = +r, this.l = +i, this.opacity = +l;
}
function rg(t) {
  if (isNaN(t.h)) return new rn(t.l, 0, 0, t.opacity);
  var r = t.h * Qh;
  return new rn(t.l, Math.cos(r) * t.c, Math.sin(r) * t.c, t.opacity);
}
mo(yn, Nw, Ei(Yn, {
  brighter(t) {
    return new yn(this.h, this.c, this.l + ul * (t ?? 1), this.opacity);
  },
  darker(t) {
    return new yn(this.h, this.c, this.l - ul * (t ?? 1), this.opacity);
  },
  rgb() {
    return rg(this).rgb();
  }
}));
var og = -0.14861, pc = 1.78277, hc = -0.29227, _l = -0.90649, gi = 1.97294, kp = gi * _l, Ep = gi * pc, Cp = pc * hc - _l * og;
function Mw(t) {
  if (t instanceof yr) return new yr(t.h, t.s, t.l, t.opacity);
  t instanceof Ge || (t = dc(t));
  var r = t.r / 255, i = t.g / 255, l = t.b / 255, a = (Cp * l + kp * r - Ep * i) / (Cp + kp - Ep), c = l - a, f = (gi * (i - a) - hc * c) / _l, p = Math.sqrt(f * f + c * c) / (gi * a * (1 - a)), h = p ? Math.atan2(f, c) * Kh - 120 : NaN;
  return new yr(h < 0 ? h + 360 : h, p, a, t.opacity);
}
function qu(t, r, i, l) {
  return arguments.length === 1 ? Mw(t) : new yr(t, r, i, l ?? 1);
}
function yr(t, r, i, l) {
  this.h = +t, this.s = +r, this.l = +i, this.opacity = +l;
}
mo(yr, qu, Ei(Yn, {
  brighter(t) {
    return t = t == null ? ao : Math.pow(ao, t), new yr(this.h, this.s, this.l * t, this.opacity);
  },
  darker(t) {
    return t = t == null ? wr : Math.pow(wr, t), new yr(this.h, this.s, this.l * t, this.opacity);
  },
  rgb() {
    var t = isNaN(this.h) ? 0 : (this.h + 120) * Qh, r = +this.l, i = isNaN(this.s) ? 0 : this.s * r * (1 - r), l = Math.cos(t), a = Math.sin(t);
    return new Ge(
      255 * (r + i * (og * l + pc * a)),
      255 * (r + i * (hc * l + _l * a)),
      255 * (r + i * (gi * l)),
      this.opacity
    );
  }
}));
var Sl = (t) => () => t;
function ig(t, r) {
  return function(i) {
    return t + i * r;
  };
}
function zw(t, r, i) {
  return t = Math.pow(t, i), r = Math.pow(r, i) - t, i = 1 / i, function(l) {
    return Math.pow(t + l * r, i);
  };
}
function Pw(t, r) {
  var i = r - t;
  return i ? ig(t, i > 180 || i < -180 ? i - 360 * Math.round(i / 360) : i) : Sl(isNaN(t) ? r : t);
}
function Iw(t) {
  return (t = +t) == 1 ? so : function(r, i) {
    return i - r ? zw(r, i, t) : Sl(isNaN(r) ? i : r);
  };
}
function so(t, r) {
  var i = r - t;
  return i ? ig(t, i) : Sl(isNaN(t) ? r : t);
}
var cl = (function t(r) {
  var i = Iw(r);
  function l(a, c) {
    var f = i((a = Gu(a)).r, (c = Gu(c)).r), p = i(a.g, c.g), h = i(a.b, c.b), g = so(a.opacity, c.opacity);
    return function(m) {
      return a.r = f(m), a.g = p(m), a.b = h(m), a.opacity = g(m), a + "";
    };
  }
  return l.gamma = t, l;
})(1);
function Tw(t, r) {
  r || (r = []);
  var i = t ? Math.min(r.length, t.length) : 0, l = r.slice(), a;
  return function(c) {
    for (a = 0; a < i; ++a) l[a] = t[a] * (1 - c) + r[a] * c;
    return l;
  };
}
function bw(t) {
  return ArrayBuffer.isView(t) && !(t instanceof DataView);
}
function Rw(t, r) {
  var i = r ? r.length : 0, l = t ? Math.min(i, t.length) : 0, a = new Array(l), c = new Array(i), f;
  for (f = 0; f < l; ++f) a[f] = fi(t[f], r[f]);
  for (; f < i; ++f) c[f] = r[f];
  return function(p) {
    for (f = 0; f < l; ++f) c[f] = a[f](p);
    return c;
  };
}
function Dw(t, r) {
  var i = /* @__PURE__ */ new Date();
  return t = +t, r = +r, function(l) {
    return i.setTime(t * (1 - l) + r * l), i;
  };
}
function tn(t, r) {
  return t = +t, r = +r, function(i) {
    return t * (1 - i) + r * i;
  };
}
function Lw(t, r) {
  var i = {}, l = {}, a;
  (t === null || typeof t != "object") && (t = {}), (r === null || typeof r != "object") && (r = {});
  for (a in r)
    a in t ? i[a] = fi(t[a], r[a]) : l[a] = r[a];
  return function(c) {
    for (a in i) l[a] = i[a](c);
    return l;
  };
}
var Ju = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, Ou = new RegExp(Ju.source, "g");
function $w(t) {
  return function() {
    return t;
  };
}
function Ow(t) {
  return function(r) {
    return t(r) + "";
  };
}
function sg(t, r) {
  var i = Ju.lastIndex = Ou.lastIndex = 0, l, a, c, f = -1, p = [], h = [];
  for (t = t + "", r = r + ""; (l = Ju.exec(t)) && (a = Ou.exec(r)); )
    (c = a.index) > i && (c = r.slice(i, c), p[f] ? p[f] += c : p[++f] = c), (l = l[0]) === (a = a[0]) ? p[f] ? p[f] += a : p[++f] = a : (p[++f] = null, h.push({ i: f, x: tn(l, a) })), i = Ou.lastIndex;
  return i < r.length && (c = r.slice(i), p[f] ? p[f] += c : p[++f] = c), p.length < 2 ? h[0] ? Ow(h[0].x) : $w(r) : (r = h.length, function(g) {
    for (var m = 0, v; m < r; ++m) p[(v = h[m]).i] = v.x(g);
    return p.join("");
  });
}
function fi(t, r) {
  var i = typeof r, l;
  return r == null || i === "boolean" ? Sl(r) : (i === "number" ? tn : i === "string" ? (l = xr(r)) ? (r = l, cl) : sg : r instanceof xr ? cl : r instanceof Date ? Dw : bw(r) ? Tw : Array.isArray(r) ? Rw : typeof r.valueOf != "function" && typeof r.toString != "function" || isNaN(r) ? Lw : tn)(t, r);
}
var Np = 180 / Math.PI, ec = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function lg(t, r, i, l, a, c) {
  var f, p, h;
  return (f = Math.sqrt(t * t + r * r)) && (t /= f, r /= f), (h = t * i + r * l) && (i -= t * h, l -= r * h), (p = Math.sqrt(i * i + l * l)) && (i /= p, l /= p, h /= p), t * l < r * i && (t = -t, r = -r, h = -h, f = -f), {
    translateX: a,
    translateY: c,
    rotate: Math.atan2(r, t) * Np,
    skewX: Math.atan(h) * Np,
    scaleX: f,
    scaleY: p
  };
}
var Ks;
function Aw(t) {
  const r = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(t + "");
  return r.isIdentity ? ec : lg(r.a, r.b, r.c, r.d, r.e, r.f);
}
function jw(t) {
  return t == null || (Ks || (Ks = document.createElementNS("http://www.w3.org/2000/svg", "g")), Ks.setAttribute("transform", t), !(t = Ks.transform.baseVal.consolidate())) ? ec : (t = t.matrix, lg(t.a, t.b, t.c, t.d, t.e, t.f));
}
function ag(t, r, i, l) {
  function a(g) {
    return g.length ? g.pop() + " " : "";
  }
  function c(g, m, v, y, _, x) {
    if (g !== v || m !== y) {
      var N = _.push("translate(", null, r, null, i);
      x.push({ i: N - 4, x: tn(g, v) }, { i: N - 2, x: tn(m, y) });
    } else (v || y) && _.push("translate(" + v + r + y + i);
  }
  function f(g, m, v, y) {
    g !== m ? (g - m > 180 ? m += 360 : m - g > 180 && (g += 360), y.push({ i: v.push(a(v) + "rotate(", null, l) - 2, x: tn(g, m) })) : m && v.push(a(v) + "rotate(" + m + l);
  }
  function p(g, m, v, y) {
    g !== m ? y.push({ i: v.push(a(v) + "skewX(", null, l) - 2, x: tn(g, m) }) : m && v.push(a(v) + "skewX(" + m + l);
  }
  function h(g, m, v, y, _, x) {
    if (g !== v || m !== y) {
      var N = _.push(a(_) + "scale(", null, ",", null, ")");
      x.push({ i: N - 4, x: tn(g, v) }, { i: N - 2, x: tn(m, y) });
    } else (v !== 1 || y !== 1) && _.push(a(_) + "scale(" + v + "," + y + ")");
  }
  return function(g, m) {
    var v = [], y = [];
    return g = t(g), m = t(m), c(g.translateX, g.translateY, m.translateX, m.translateY, v, y), f(g.rotate, m.rotate, v, y), p(g.skewX, m.skewX, v, y), h(g.scaleX, g.scaleY, m.scaleX, m.scaleY, v, y), g = m = null, function(_) {
      for (var x = -1, N = y.length, E; ++x < N; ) v[(E = y[x]).i] = E.x(_);
      return v.join("");
    };
  };
}
var Hw = ag(Aw, "px, ", "px)", "deg)"), Fw = ag(jw, ", ", ")", ")"), Vw = 1e-12;
function Mp(t) {
  return ((t = Math.exp(t)) + 1 / t) / 2;
}
function Bw(t) {
  return ((t = Math.exp(t)) - 1 / t) / 2;
}
function Uw(t) {
  return ((t = Math.exp(2 * t)) - 1) / (t + 1);
}
var rl = (function t(r, i, l) {
  function a(c, f) {
    var p = c[0], h = c[1], g = c[2], m = f[0], v = f[1], y = f[2], _ = m - p, x = v - h, N = _ * _ + x * x, E, M;
    if (N < Vw)
      M = Math.log(y / g) / r, E = function(F) {
        return [
          p + F * _,
          h + F * x,
          g * Math.exp(r * F * M)
        ];
      };
    else {
      var T = Math.sqrt(N), S = (y * y - g * g + l * N) / (2 * g * i * T), P = (y * y - g * g - l * N) / (2 * y * i * T), B = Math.log(Math.sqrt(S * S + 1) - S), D = Math.log(Math.sqrt(P * P + 1) - P);
      M = (D - B) / r, E = function(F) {
        var Q = F * M, K = Mp(B), ee = g / (i * T) * (K * Uw(r * Q + B) - Bw(B));
        return [
          p + ee * _,
          h + ee * x,
          g * K / Mp(r * Q + B)
        ];
      };
    }
    return E.duration = Math.abs(M) * 1e3 * r / Math.SQRT2, E;
  }
  return a.rho = function(c) {
    var f = Math.max(1e-3, +c), p = f * f, h = p * p;
    return t(f, p, h);
  }, a;
})(Math.SQRT2, 2, 4);
function ug(t) {
  return (function r(i) {
    i = +i;
    function l(a, c) {
      var f = t((a = qu(a)).h, (c = qu(c)).h), p = so(a.s, c.s), h = so(a.l, c.l), g = so(a.opacity, c.opacity);
      return function(m) {
        return a.h = f(m), a.s = p(m), a.l = h(Math.pow(m, i)), a.opacity = g(m), a + "";
      };
    }
    return l.gamma = r, l;
  })(1);
}
ug(Pw);
ug(so);
var uo = 0, ui = 0, li = 0, cg = 1e3, fl, ci, dl = 0, _r = 0, kl = 0, mi = typeof performance == "object" && performance.now ? performance : Date, fg = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(t) {
  setTimeout(t, 17);
};
function gc() {
  return _r || (fg(Ww), _r = mi.now() + kl);
}
function Ww() {
  _r = 0;
}
function pl() {
  this._call = this._time = this._next = null;
}
pl.prototype = dg.prototype = {
  constructor: pl,
  restart: function(t, r, i) {
    if (typeof t != "function") throw new TypeError("callback is not a function");
    i = (i == null ? gc() : +i) + (r == null ? 0 : +r), !this._next && ci !== this && (ci ? ci._next = this : fl = this, ci = this), this._call = t, this._time = i, tc();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, tc());
  }
};
function dg(t, r, i) {
  var l = new pl();
  return l.restart(t, r, i), l;
}
function Xw() {
  gc(), ++uo;
  for (var t = fl, r; t; )
    (r = _r - t._time) >= 0 && t._call.call(void 0, r), t = t._next;
  --uo;
}
function zp() {
  _r = (dl = mi.now()) + kl, uo = ui = 0;
  try {
    Xw();
  } finally {
    uo = 0, Zw(), _r = 0;
  }
}
function Yw() {
  var t = mi.now(), r = t - dl;
  r > cg && (kl -= r, dl = t);
}
function Zw() {
  for (var t, r = fl, i, l = 1 / 0; r; )
    r._call ? (l > r._time && (l = r._time), t = r, r = r._next) : (i = r._next, r._next = null, r = t ? t._next = i : fl = i);
  ci = t, tc(l);
}
function tc(t) {
  if (!uo) {
    ui && (ui = clearTimeout(ui));
    var r = t - _r;
    r > 24 ? (t < 1 / 0 && (ui = setTimeout(zp, Math.ceil(t - mi.now() - kl) + 1)), li && (li = clearInterval(li))) : (li || (dl = mi.now(), li = setInterval(Yw, cg)), uo = 1, fg(zp));
  }
}
function Pp(t, r, i) {
  var l = new pl();
  return r = r == null ? 0 : +r, l.restart((a) => {
    l.stop(), t(a + r);
  }, r, i), l;
}
function Qw(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}
var mc = 3;
(function t(r) {
  r = +r;
  function i(l) {
    return Math.pow(l, r);
  }
  return i.exponent = t, i;
})(mc);
(function t(r) {
  r = +r;
  function i(l) {
    return 1 - Math.pow(1 - l, r);
  }
  return i.exponent = t, i;
})(mc);
(function t(r) {
  r = +r;
  function i(l) {
    return ((l *= 2) <= 1 ? Math.pow(l, r) : 2 - Math.pow(2 - l, r)) / 2;
  }
  return i.exponent = t, i;
})(mc);
function hl(t) {
  return (Math.pow(2, -10 * t) - 9765625e-10) * 1.0009775171065494;
}
var yc = 1.70158;
(function t(r) {
  r = +r;
  function i(l) {
    return (l = +l) * l * (r * (l - 1) + l);
  }
  return i.overshoot = t, i;
})(yc);
(function t(r) {
  r = +r;
  function i(l) {
    return --l * l * ((l + 1) * r + l) + 1;
  }
  return i.overshoot = t, i;
})(yc);
(function t(r) {
  r = +r;
  function i(l) {
    return ((l *= 2) < 1 ? l * l * ((r + 1) * l - r) : (l -= 2) * l * ((r + 1) * l + r) + 2) / 2;
  }
  return i.overshoot = t, i;
})(yc);
var co = 2 * Math.PI, vc = 1, wc = 0.3;
(function t(r, i) {
  var l = Math.asin(1 / (r = Math.max(1, r))) * (i /= co);
  function a(c) {
    return r * hl(- --c) * Math.sin((l - c) / i);
  }
  return a.amplitude = function(c) {
    return t(c, i * co);
  }, a.period = function(c) {
    return t(r, c);
  }, a;
})(vc, wc);
(function t(r, i) {
  var l = Math.asin(1 / (r = Math.max(1, r))) * (i /= co);
  function a(c) {
    return 1 - r * hl(c = +c) * Math.sin((c + l) / i);
  }
  return a.amplitude = function(c) {
    return t(c, i * co);
  }, a.period = function(c) {
    return t(r, c);
  }, a;
})(vc, wc);
(function t(r, i) {
  var l = Math.asin(1 / (r = Math.max(1, r))) * (i /= co);
  function a(c) {
    return ((c = c * 2 - 1) < 0 ? r * hl(-c) * Math.sin((l - c) / i) : 2 - r * hl(c) * Math.sin((l + c) / i)) / 2;
  }
  return a.amplitude = function(c) {
    return t(c, i * co);
  }, a.period = function(c) {
    return t(r, c);
  }, a;
})(vc, wc);
var Kw = wl("start", "end", "cancel", "interrupt"), Gw = [], pg = 0, Ip = 1, nc = 2, ol = 3, Tp = 4, rc = 5, il = 6;
function El(t, r, i, l, a, c) {
  var f = t.__transition;
  if (!f) t.__transition = {};
  else if (i in f) return;
  qw(t, i, {
    name: r,
    index: l,
    // For context during callback.
    group: a,
    // For context during callback.
    on: Kw,
    tween: Gw,
    time: c.time,
    delay: c.delay,
    duration: c.duration,
    ease: c.ease,
    timer: null,
    state: pg
  });
}
function xc(t, r) {
  var i = Wt(t, r);
  if (i.state > pg) throw new Error("too late; already scheduled");
  return i;
}
function on(t, r) {
  var i = Wt(t, r);
  if (i.state > ol) throw new Error("too late; already running");
  return i;
}
function Wt(t, r) {
  var i = t.__transition;
  if (!i || !(i = i[r])) throw new Error("transition not found");
  return i;
}
function qw(t, r, i) {
  var l = t.__transition, a;
  l[r] = i, i.timer = dg(c, 0, i.time);
  function c(g) {
    i.state = Ip, i.timer.restart(f, i.delay, i.time), i.delay <= g && f(g - i.delay);
  }
  function f(g) {
    var m, v, y, _;
    if (i.state !== Ip) return h();
    for (m in l)
      if (_ = l[m], _.name === i.name) {
        if (_.state === ol) return Pp(f);
        _.state === Tp ? (_.state = il, _.timer.stop(), _.on.call("interrupt", t, t.__data__, _.index, _.group), delete l[m]) : +m < r && (_.state = il, _.timer.stop(), _.on.call("cancel", t, t.__data__, _.index, _.group), delete l[m]);
      }
    if (Pp(function() {
      i.state === ol && (i.state = Tp, i.timer.restart(p, i.delay, i.time), p(g));
    }), i.state = nc, i.on.call("start", t, t.__data__, i.index, i.group), i.state === nc) {
      for (i.state = ol, a = new Array(y = i.tween.length), m = 0, v = -1; m < y; ++m)
        (_ = i.tween[m].value.call(t, t.__data__, i.index, i.group)) && (a[++v] = _);
      a.length = v + 1;
    }
  }
  function p(g) {
    for (var m = g < i.duration ? i.ease.call(null, g / i.duration) : (i.timer.restart(h), i.state = rc, 1), v = -1, y = a.length; ++v < y; )
      a[v].call(t, m);
    i.state === rc && (i.on.call("end", t, t.__data__, i.index, i.group), h());
  }
  function h() {
    i.state = il, i.timer.stop(), delete l[r];
    for (var g in l) return;
    delete t.__transition;
  }
}
function sl(t, r) {
  var i = t.__transition, l, a, c = !0, f;
  if (i) {
    r = r == null ? null : r + "";
    for (f in i) {
      if ((l = i[f]).name !== r) {
        c = !1;
        continue;
      }
      a = l.state > nc && l.state < rc, l.state = il, l.timer.stop(), l.on.call(a ? "interrupt" : "cancel", t, t.__data__, l.index, l.group), delete i[f];
    }
    c && delete t.__transition;
  }
}
function Jw(t) {
  return this.each(function() {
    sl(this, t);
  });
}
function ex(t, r) {
  var i, l;
  return function() {
    var a = on(this, t), c = a.tween;
    if (c !== i) {
      l = i = c;
      for (var f = 0, p = l.length; f < p; ++f)
        if (l[f].name === r) {
          l = l.slice(), l.splice(f, 1);
          break;
        }
    }
    a.tween = l;
  };
}
function tx(t, r, i) {
  var l, a;
  if (typeof i != "function") throw new Error();
  return function() {
    var c = on(this, t), f = c.tween;
    if (f !== l) {
      a = (l = f).slice();
      for (var p = { name: r, value: i }, h = 0, g = a.length; h < g; ++h)
        if (a[h].name === r) {
          a[h] = p;
          break;
        }
      h === g && a.push(p);
    }
    c.tween = a;
  };
}
function nx(t, r) {
  var i = this._id;
  if (t += "", arguments.length < 2) {
    for (var l = Wt(this.node(), i).tween, a = 0, c = l.length, f; a < c; ++a)
      if ((f = l[a]).name === t)
        return f.value;
    return null;
  }
  return this.each((r == null ? ex : tx)(i, t, r));
}
function _c(t, r, i) {
  var l = t._id;
  return t.each(function() {
    var a = on(this, l);
    (a.value || (a.value = {}))[r] = i.apply(this, arguments);
  }), function(a) {
    return Wt(a, l).value[r];
  };
}
function hg(t, r) {
  var i;
  return (typeof r == "number" ? tn : r instanceof xr ? cl : (i = xr(r)) ? (r = i, cl) : sg)(t, r);
}
function rx(t) {
  return function() {
    this.removeAttribute(t);
  };
}
function ox(t) {
  return function() {
    this.removeAttributeNS(t.space, t.local);
  };
}
function ix(t, r, i) {
  var l, a = i + "", c;
  return function() {
    var f = this.getAttribute(t);
    return f === a ? null : f === l ? c : c = r(l = f, i);
  };
}
function sx(t, r, i) {
  var l, a = i + "", c;
  return function() {
    var f = this.getAttributeNS(t.space, t.local);
    return f === a ? null : f === l ? c : c = r(l = f, i);
  };
}
function lx(t, r, i) {
  var l, a, c;
  return function() {
    var f, p = i(this), h;
    return p == null ? void this.removeAttribute(t) : (f = this.getAttribute(t), h = p + "", f === h ? null : f === l && h === a ? c : (a = h, c = r(l = f, p)));
  };
}
function ax(t, r, i) {
  var l, a, c;
  return function() {
    var f, p = i(this), h;
    return p == null ? void this.removeAttributeNS(t.space, t.local) : (f = this.getAttributeNS(t.space, t.local), h = p + "", f === h ? null : f === l && h === a ? c : (a = h, c = r(l = f, p)));
  };
}
function ux(t, r) {
  var i = xl(t), l = i === "transform" ? Fw : hg;
  return this.attrTween(t, typeof r == "function" ? (i.local ? ax : lx)(i, l, _c(this, "attr." + t, r)) : r == null ? (i.local ? ox : rx)(i) : (i.local ? sx : ix)(i, l, r));
}
function cx(t, r) {
  return function(i) {
    this.setAttribute(t, r.call(this, i));
  };
}
function fx(t, r) {
  return function(i) {
    this.setAttributeNS(t.space, t.local, r.call(this, i));
  };
}
function dx(t, r) {
  var i, l;
  function a() {
    var c = r.apply(this, arguments);
    return c !== l && (i = (l = c) && fx(t, c)), i;
  }
  return a._value = r, a;
}
function px(t, r) {
  var i, l;
  function a() {
    var c = r.apply(this, arguments);
    return c !== l && (i = (l = c) && cx(t, c)), i;
  }
  return a._value = r, a;
}
function hx(t, r) {
  var i = "attr." + t;
  if (arguments.length < 2) return (i = this.tween(i)) && i._value;
  if (r == null) return this.tween(i, null);
  if (typeof r != "function") throw new Error();
  var l = xl(t);
  return this.tween(i, (l.local ? dx : px)(l, r));
}
function gx(t, r) {
  return function() {
    xc(this, t).delay = +r.apply(this, arguments);
  };
}
function mx(t, r) {
  return r = +r, function() {
    xc(this, t).delay = r;
  };
}
function yx(t) {
  var r = this._id;
  return arguments.length ? this.each((typeof t == "function" ? gx : mx)(r, t)) : Wt(this.node(), r).delay;
}
function vx(t, r) {
  return function() {
    on(this, t).duration = +r.apply(this, arguments);
  };
}
function wx(t, r) {
  return r = +r, function() {
    on(this, t).duration = r;
  };
}
function xx(t) {
  var r = this._id;
  return arguments.length ? this.each((typeof t == "function" ? vx : wx)(r, t)) : Wt(this.node(), r).duration;
}
function _x(t, r) {
  if (typeof r != "function") throw new Error();
  return function() {
    on(this, t).ease = r;
  };
}
function Sx(t) {
  var r = this._id;
  return arguments.length ? this.each(_x(r, t)) : Wt(this.node(), r).ease;
}
function kx(t, r) {
  return function() {
    var i = r.apply(this, arguments);
    if (typeof i != "function") throw new Error();
    on(this, t).ease = i;
  };
}
function Ex(t) {
  if (typeof t != "function") throw new Error();
  return this.each(kx(this._id, t));
}
function Cx(t) {
  typeof t != "function" && (t = Lh(t));
  for (var r = this._groups, i = r.length, l = new Array(i), a = 0; a < i; ++a)
    for (var c = r[a], f = c.length, p = l[a] = [], h, g = 0; g < f; ++g)
      (h = c[g]) && t.call(h, h.__data__, g, c) && p.push(h);
  return new wn(l, this._parents, this._name, this._id);
}
function Nx(t) {
  if (t._id !== this._id) throw new Error();
  for (var r = this._groups, i = t._groups, l = r.length, a = i.length, c = Math.min(l, a), f = new Array(l), p = 0; p < c; ++p)
    for (var h = r[p], g = i[p], m = h.length, v = f[p] = new Array(m), y, _ = 0; _ < m; ++_)
      (y = h[_] || g[_]) && (v[_] = y);
  for (; p < l; ++p)
    f[p] = r[p];
  return new wn(f, this._parents, this._name, this._id);
}
function Mx(t) {
  return (t + "").trim().split(/^|\s+/).every(function(r) {
    var i = r.indexOf(".");
    return i >= 0 && (r = r.slice(0, i)), !r || r === "start";
  });
}
function zx(t, r, i) {
  var l, a, c = Mx(r) ? xc : on;
  return function() {
    var f = c(this, t), p = f.on;
    p !== l && (a = (l = p).copy()).on(r, i), f.on = a;
  };
}
function Px(t, r) {
  var i = this._id;
  return arguments.length < 2 ? Wt(this.node(), i).on.on(t) : this.each(zx(i, t, r));
}
function Ix(t) {
  return function() {
    var r = this.parentNode;
    for (var i in this.__transition) if (+i !== t) return;
    r && r.removeChild(this);
  };
}
function Tx() {
  return this.on("end.remove", Ix(this._id));
}
function bx(t) {
  var r = this._name, i = this._id;
  typeof t != "function" && (t = cc(t));
  for (var l = this._groups, a = l.length, c = new Array(a), f = 0; f < a; ++f)
    for (var p = l[f], h = p.length, g = c[f] = new Array(h), m, v, y = 0; y < h; ++y)
      (m = p[y]) && (v = t.call(m, m.__data__, y, p)) && ("__data__" in m && (v.__data__ = m.__data__), g[y] = v, El(g[y], r, i, y, g, Wt(m, i)));
  return new wn(c, this._parents, r, i);
}
function Rx(t) {
  var r = this._name, i = this._id;
  typeof t != "function" && (t = Dh(t));
  for (var l = this._groups, a = l.length, c = [], f = [], p = 0; p < a; ++p)
    for (var h = l[p], g = h.length, m, v = 0; v < g; ++v)
      if (m = h[v]) {
        for (var y = t.call(m, m.__data__, v, h), _, x = Wt(m, i), N = 0, E = y.length; N < E; ++N)
          (_ = y[N]) && El(_, r, i, N, y, x);
        c.push(y), f.push(m);
      }
  return new wn(c, f, r, i);
}
var Dx = ki.prototype.constructor;
function Lx() {
  return new Dx(this._groups, this._parents);
}
function $x(t, r) {
  var i, l, a;
  return function() {
    var c = lo(this, t), f = (this.style.removeProperty(t), lo(this, t));
    return c === f ? null : c === i && f === l ? a : a = r(i = c, l = f);
  };
}
function gg(t) {
  return function() {
    this.style.removeProperty(t);
  };
}
function Ox(t, r, i) {
  var l, a = i + "", c;
  return function() {
    var f = lo(this, t);
    return f === a ? null : f === l ? c : c = r(l = f, i);
  };
}
function Ax(t, r, i) {
  var l, a, c;
  return function() {
    var f = lo(this, t), p = i(this), h = p + "";
    return p == null && (h = p = (this.style.removeProperty(t), lo(this, t))), f === h ? null : f === l && h === a ? c : (a = h, c = r(l = f, p));
  };
}
function jx(t, r) {
  var i, l, a, c = "style." + r, f = "end." + c, p;
  return function() {
    var h = on(this, t), g = h.on, m = h.value[c] == null ? p || (p = gg(r)) : void 0;
    (g !== i || a !== m) && (l = (i = g).copy()).on(f, a = m), h.on = l;
  };
}
function Hx(t, r, i) {
  var l = (t += "") == "transform" ? Hw : hg;
  return r == null ? this.styleTween(t, $x(t, l)).on("end.style." + t, gg(t)) : typeof r == "function" ? this.styleTween(t, Ax(t, l, _c(this, "style." + t, r))).each(jx(this._id, t)) : this.styleTween(t, Ox(t, l, r), i).on("end.style." + t, null);
}
function Fx(t, r, i) {
  return function(l) {
    this.style.setProperty(t, r.call(this, l), i);
  };
}
function Vx(t, r, i) {
  var l, a;
  function c() {
    var f = r.apply(this, arguments);
    return f !== a && (l = (a = f) && Fx(t, f, i)), l;
  }
  return c._value = r, c;
}
function Bx(t, r, i) {
  var l = "style." + (t += "");
  if (arguments.length < 2) return (l = this.tween(l)) && l._value;
  if (r == null) return this.tween(l, null);
  if (typeof r != "function") throw new Error();
  return this.tween(l, Vx(t, r, i ?? ""));
}
function Ux(t) {
  return function() {
    this.textContent = t;
  };
}
function Wx(t) {
  return function() {
    var r = t(this);
    this.textContent = r ?? "";
  };
}
function Xx(t) {
  return this.tween("text", typeof t == "function" ? Wx(_c(this, "text", t)) : Ux(t == null ? "" : t + ""));
}
function Yx(t) {
  return function(r) {
    this.textContent = t.call(this, r);
  };
}
function Zx(t) {
  var r, i;
  function l() {
    var a = t.apply(this, arguments);
    return a !== i && (r = (i = a) && Yx(a)), r;
  }
  return l._value = t, l;
}
function Qx(t) {
  var r = "text";
  if (arguments.length < 1) return (r = this.tween(r)) && r._value;
  if (t == null) return this.tween(r, null);
  if (typeof t != "function") throw new Error();
  return this.tween(r, Zx(t));
}
function Kx() {
  for (var t = this._name, r = this._id, i = mg(), l = this._groups, a = l.length, c = 0; c < a; ++c)
    for (var f = l[c], p = f.length, h, g = 0; g < p; ++g)
      if (h = f[g]) {
        var m = Wt(h, r);
        El(h, t, i, g, f, {
          time: m.time + m.delay + m.duration,
          delay: 0,
          duration: m.duration,
          ease: m.ease
        });
      }
  return new wn(l, this._parents, t, i);
}
function Gx() {
  var t, r, i = this, l = i._id, a = i.size();
  return new Promise(function(c, f) {
    var p = { value: f }, h = { value: function() {
      --a === 0 && c();
    } };
    i.each(function() {
      var g = on(this, l), m = g.on;
      m !== t && (r = (t = m).copy(), r._.cancel.push(p), r._.interrupt.push(p), r._.end.push(h)), g.on = r;
    }), a === 0 && c();
  });
}
var qx = 0;
function wn(t, r, i, l) {
  this._groups = t, this._parents = r, this._name = i, this._id = l;
}
function mg() {
  return ++qx;
}
var mn = ki.prototype;
wn.prototype = {
  constructor: wn,
  select: bx,
  selectAll: Rx,
  selectChild: mn.selectChild,
  selectChildren: mn.selectChildren,
  filter: Cx,
  merge: Nx,
  selection: Lx,
  transition: Kx,
  call: mn.call,
  nodes: mn.nodes,
  node: mn.node,
  size: mn.size,
  empty: mn.empty,
  each: mn.each,
  on: Px,
  attr: ux,
  attrTween: hx,
  style: Hx,
  styleTween: Bx,
  text: Xx,
  textTween: Qx,
  remove: Tx,
  tween: nx,
  delay: yx,
  duration: xx,
  ease: Sx,
  easeVarying: Ex,
  end: Gx,
  [Symbol.iterator]: mn[Symbol.iterator]
};
var Jx = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: Qw
};
function e1(t, r) {
  for (var i; !(i = t.__transition) || !(i = i[r]); )
    if (!(t = t.parentNode))
      throw new Error(`transition ${r} not found`);
  return i;
}
function t1(t) {
  var r, i;
  t instanceof wn ? (r = t._id, t = t._name) : (r = mg(), (i = Jx).time = gc(), t = t == null ? null : t + "");
  for (var l = this._groups, a = l.length, c = 0; c < a; ++c)
    for (var f = l[c], p = f.length, h, g = 0; g < p; ++g)
      (h = f[g]) && El(h, t, r, g, f, i || e1(h, r));
  return new wn(l, this._parents, t, r);
}
ki.prototype.interrupt = Jw;
ki.prototype.transition = t1;
var Gs = (t) => () => t;
function n1(t, {
  sourceEvent: r,
  target: i,
  transform: l,
  dispatch: a
}) {
  Object.defineProperties(this, {
    type: { value: t, enumerable: !0, configurable: !0 },
    sourceEvent: { value: r, enumerable: !0, configurable: !0 },
    target: { value: i, enumerable: !0, configurable: !0 },
    transform: { value: l, enumerable: !0, configurable: !0 },
    _: { value: a }
  });
}
function vn(t, r, i) {
  this.k = t, this.x = r, this.y = i;
}
vn.prototype = {
  constructor: vn,
  scale: function(t) {
    return t === 1 ? this : new vn(this.k * t, this.x, this.y);
  },
  translate: function(t, r) {
    return t === 0 & r === 0 ? this : new vn(this.k, this.x + this.k * t, this.y + this.k * r);
  },
  apply: function(t) {
    return [t[0] * this.k + this.x, t[1] * this.k + this.y];
  },
  applyX: function(t) {
    return t * this.k + this.x;
  },
  applyY: function(t) {
    return t * this.k + this.y;
  },
  invert: function(t) {
    return [(t[0] - this.x) / this.k, (t[1] - this.y) / this.k];
  },
  invertX: function(t) {
    return (t - this.x) / this.k;
  },
  invertY: function(t) {
    return (t - this.y) / this.k;
  },
  rescaleX: function(t) {
    return t.copy().domain(t.range().map(this.invertX, this).map(t.invert, t));
  },
  rescaleY: function(t) {
    return t.copy().domain(t.range().map(this.invertY, this).map(t.invert, t));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
var Cl = new vn(1, 0, 0);
yg.prototype = vn.prototype;
function yg(t) {
  for (; !t.__zoom; ) if (!(t = t.parentNode)) return Cl;
  return t.__zoom;
}
function Au(t) {
  t.stopImmediatePropagation();
}
function ai(t) {
  t.preventDefault(), t.stopImmediatePropagation();
}
function r1(t) {
  return (!t.ctrlKey || t.type === "wheel") && !t.button;
}
function o1() {
  var t = this;
  return t instanceof SVGElement ? (t = t.ownerSVGElement || t, t.hasAttribute("viewBox") ? (t = t.viewBox.baseVal, [[t.x, t.y], [t.x + t.width, t.y + t.height]]) : [[0, 0], [t.width.baseVal.value, t.height.baseVal.value]]) : [[0, 0], [t.clientWidth, t.clientHeight]];
}
function bp() {
  return this.__zoom || Cl;
}
function i1(t) {
  return -t.deltaY * (t.deltaMode === 1 ? 0.05 : t.deltaMode ? 1 : 2e-3) * (t.ctrlKey ? 10 : 1);
}
function s1() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function l1(t, r, i) {
  var l = t.invertX(r[0][0]) - i[0][0], a = t.invertX(r[1][0]) - i[1][0], c = t.invertY(r[0][1]) - i[0][1], f = t.invertY(r[1][1]) - i[1][1];
  return t.translate(
    a > l ? (l + a) / 2 : Math.min(0, l) || Math.max(0, a),
    f > c ? (c + f) / 2 : Math.min(0, c) || Math.max(0, f)
  );
}
function vg() {
  var t = r1, r = o1, i = l1, l = i1, a = s1, c = [0, 1 / 0], f = [[-1 / 0, -1 / 0], [1 / 0, 1 / 0]], p = 250, h = rl, g = wl("start", "zoom", "end"), m, v, y, _ = 500, x = 150, N = 0, E = 10;
  function M(k) {
    k.property("__zoom", bp).on("wheel.zoom", Q, { passive: !1 }).on("mousedown.zoom", K).on("dblclick.zoom", ee).filter(a).on("touchstart.zoom", J).on("touchmove.zoom", A).on("touchend.zoom touchcancel.zoom", W).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  M.transform = function(k, $, O, V) {
    var b = k.selection ? k.selection() : k;
    b.property("__zoom", bp), k !== b ? B(k, $, O, V) : b.interrupt().each(function() {
      D(this, arguments).event(V).start().zoom(null, typeof $ == "function" ? $.apply(this, arguments) : $).end();
    });
  }, M.scaleBy = function(k, $, O, V) {
    M.scaleTo(k, function() {
      var b = this.__zoom.k, j = typeof $ == "function" ? $.apply(this, arguments) : $;
      return b * j;
    }, O, V);
  }, M.scaleTo = function(k, $, O, V) {
    M.transform(k, function() {
      var b = r.apply(this, arguments), j = this.__zoom, U = O == null ? P(b) : typeof O == "function" ? O.apply(this, arguments) : O, C = j.invert(U), H = typeof $ == "function" ? $.apply(this, arguments) : $;
      return i(S(T(j, H), U, C), b, f);
    }, O, V);
  }, M.translateBy = function(k, $, O, V) {
    M.transform(k, function() {
      return i(this.__zoom.translate(
        typeof $ == "function" ? $.apply(this, arguments) : $,
        typeof O == "function" ? O.apply(this, arguments) : O
      ), r.apply(this, arguments), f);
    }, null, V);
  }, M.translateTo = function(k, $, O, V, b) {
    M.transform(k, function() {
      var j = r.apply(this, arguments), U = this.__zoom, C = V == null ? P(j) : typeof V == "function" ? V.apply(this, arguments) : V;
      return i(Cl.translate(C[0], C[1]).scale(U.k).translate(
        typeof $ == "function" ? -$.apply(this, arguments) : -$,
        typeof O == "function" ? -O.apply(this, arguments) : -O
      ), j, f);
    }, V, b);
  };
  function T(k, $) {
    return $ = Math.max(c[0], Math.min(c[1], $)), $ === k.k ? k : new vn($, k.x, k.y);
  }
  function S(k, $, O) {
    var V = $[0] - O[0] * k.k, b = $[1] - O[1] * k.k;
    return V === k.x && b === k.y ? k : new vn(k.k, V, b);
  }
  function P(k) {
    return [(+k[0][0] + +k[1][0]) / 2, (+k[0][1] + +k[1][1]) / 2];
  }
  function B(k, $, O, V) {
    k.on("start.zoom", function() {
      D(this, arguments).event(V).start();
    }).on("interrupt.zoom end.zoom", function() {
      D(this, arguments).event(V).end();
    }).tween("zoom", function() {
      var b = this, j = arguments, U = D(b, j).event(V), C = r.apply(b, j), H = O == null ? P(C) : typeof O == "function" ? O.apply(b, j) : O, ie = Math.max(C[1][0] - C[0][0], C[1][1] - C[0][1]), re = b.__zoom, ae = typeof $ == "function" ? $.apply(b, j) : $, ce = h(re.invert(H).concat(ie / re.k), ae.invert(H).concat(ie / ae.k));
      return function(ue) {
        if (ue === 1) ue = ae;
        else {
          var q = ce(ue), le = ie / q[2];
          ue = new vn(le, H[0] - q[0] * le, H[1] - q[1] * le);
        }
        U.zoom(null, ue);
      };
    });
  }
  function D(k, $, O) {
    return !O && k.__zooming || new F(k, $);
  }
  function F(k, $) {
    this.that = k, this.args = $, this.active = 0, this.sourceEvent = null, this.extent = r.apply(k, $), this.taps = 0;
  }
  F.prototype = {
    event: function(k) {
      return k && (this.sourceEvent = k), this;
    },
    start: function() {
      return ++this.active === 1 && (this.that.__zooming = this, this.emit("start")), this;
    },
    zoom: function(k, $) {
      return this.mouse && k !== "mouse" && (this.mouse[1] = $.invert(this.mouse[0])), this.touch0 && k !== "touch" && (this.touch0[1] = $.invert(this.touch0[0])), this.touch1 && k !== "touch" && (this.touch1[1] = $.invert(this.touch1[0])), this.that.__zoom = $, this.emit("zoom"), this;
    },
    end: function() {
      return --this.active === 0 && (delete this.that.__zooming, this.emit("end")), this;
    },
    emit: function(k) {
      var $ = kt(this.that).datum();
      g.call(
        k,
        this.that,
        new n1(k, {
          sourceEvent: this.sourceEvent,
          target: M,
          transform: this.that.__zoom,
          dispatch: g
        }),
        $
      );
    }
  };
  function Q(k, ...$) {
    if (!t.apply(this, arguments)) return;
    var O = D(this, $).event(k), V = this.__zoom, b = Math.max(c[0], Math.min(c[1], V.k * Math.pow(2, l.apply(this, arguments)))), j = Ht(k);
    if (O.wheel)
      (O.mouse[0][0] !== j[0] || O.mouse[0][1] !== j[1]) && (O.mouse[1] = V.invert(O.mouse[0] = j)), clearTimeout(O.wheel);
    else {
      if (V.k === b) return;
      O.mouse = [j, V.invert(j)], sl(this), O.start();
    }
    ai(k), O.wheel = setTimeout(U, x), O.zoom("mouse", i(S(T(V, b), O.mouse[0], O.mouse[1]), O.extent, f));
    function U() {
      O.wheel = null, O.end();
    }
  }
  function K(k, ...$) {
    if (y || !t.apply(this, arguments)) return;
    var O = k.currentTarget, V = D(this, $, !0).event(k), b = kt(k.view).on("mousemove.zoom", H, !0).on("mouseup.zoom", ie, !0), j = Ht(k, O), U = k.clientX, C = k.clientY;
    Wh(k.view), Au(k), V.mouse = [j, this.__zoom.invert(j)], sl(this), V.start();
    function H(re) {
      if (ai(re), !V.moved) {
        var ae = re.clientX - U, ce = re.clientY - C;
        V.moved = ae * ae + ce * ce > N;
      }
      V.event(re).zoom("mouse", i(S(V.that.__zoom, V.mouse[0] = Ht(re, O), V.mouse[1]), V.extent, f));
    }
    function ie(re) {
      b.on("mousemove.zoom mouseup.zoom", null), Xh(re.view, V.moved), ai(re), V.event(re).end();
    }
  }
  function ee(k, ...$) {
    if (t.apply(this, arguments)) {
      var O = this.__zoom, V = Ht(k.changedTouches ? k.changedTouches[0] : k, this), b = O.invert(V), j = O.k * (k.shiftKey ? 0.5 : 2), U = i(S(T(O, j), V, b), r.apply(this, $), f);
      ai(k), p > 0 ? kt(this).transition().duration(p).call(B, U, V, k) : kt(this).call(M.transform, U, V, k);
    }
  }
  function J(k, ...$) {
    if (t.apply(this, arguments)) {
      var O = k.touches, V = O.length, b = D(this, $, k.changedTouches.length === V).event(k), j, U, C, H;
      for (Au(k), U = 0; U < V; ++U)
        C = O[U], H = Ht(C, this), H = [H, this.__zoom.invert(H), C.identifier], b.touch0 ? !b.touch1 && b.touch0[2] !== H[2] && (b.touch1 = H, b.taps = 0) : (b.touch0 = H, j = !0, b.taps = 1 + !!m);
      m && (m = clearTimeout(m)), j && (b.taps < 2 && (v = H[0], m = setTimeout(function() {
        m = null;
      }, _)), sl(this), b.start());
    }
  }
  function A(k, ...$) {
    if (this.__zooming) {
      var O = D(this, $).event(k), V = k.changedTouches, b = V.length, j, U, C, H;
      for (ai(k), j = 0; j < b; ++j)
        U = V[j], C = Ht(U, this), O.touch0 && O.touch0[2] === U.identifier ? O.touch0[0] = C : O.touch1 && O.touch1[2] === U.identifier && (O.touch1[0] = C);
      if (U = O.that.__zoom, O.touch1) {
        var ie = O.touch0[0], re = O.touch0[1], ae = O.touch1[0], ce = O.touch1[1], ue = (ue = ae[0] - ie[0]) * ue + (ue = ae[1] - ie[1]) * ue, q = (q = ce[0] - re[0]) * q + (q = ce[1] - re[1]) * q;
        U = T(U, Math.sqrt(ue / q)), C = [(ie[0] + ae[0]) / 2, (ie[1] + ae[1]) / 2], H = [(re[0] + ce[0]) / 2, (re[1] + ce[1]) / 2];
      } else if (O.touch0) C = O.touch0[0], H = O.touch0[1];
      else return;
      O.zoom("touch", i(S(U, C, H), O.extent, f));
    }
  }
  function W(k, ...$) {
    if (this.__zooming) {
      var O = D(this, $).event(k), V = k.changedTouches, b = V.length, j, U;
      for (Au(k), y && clearTimeout(y), y = setTimeout(function() {
        y = null;
      }, _), j = 0; j < b; ++j)
        U = V[j], O.touch0 && O.touch0[2] === U.identifier ? delete O.touch0 : O.touch1 && O.touch1[2] === U.identifier && delete O.touch1;
      if (O.touch1 && !O.touch0 && (O.touch0 = O.touch1, delete O.touch1), O.touch0) O.touch0[1] = this.__zoom.invert(O.touch0[0]);
      else if (O.end(), O.taps === 2 && (U = Ht(U, this), Math.hypot(v[0] - U[0], v[1] - U[1]) < E)) {
        var C = kt(this).on("dblclick.zoom");
        C && C.apply(this, arguments);
      }
    }
  }
  return M.wheelDelta = function(k) {
    return arguments.length ? (l = typeof k == "function" ? k : Gs(+k), M) : l;
  }, M.filter = function(k) {
    return arguments.length ? (t = typeof k == "function" ? k : Gs(!!k), M) : t;
  }, M.touchable = function(k) {
    return arguments.length ? (a = typeof k == "function" ? k : Gs(!!k), M) : a;
  }, M.extent = function(k) {
    return arguments.length ? (r = typeof k == "function" ? k : Gs([[+k[0][0], +k[0][1]], [+k[1][0], +k[1][1]]]), M) : r;
  }, M.scaleExtent = function(k) {
    return arguments.length ? (c[0] = +k[0], c[1] = +k[1], M) : [c[0], c[1]];
  }, M.translateExtent = function(k) {
    return arguments.length ? (f[0][0] = +k[0][0], f[1][0] = +k[1][0], f[0][1] = +k[0][1], f[1][1] = +k[1][1], M) : [[f[0][0], f[0][1]], [f[1][0], f[1][1]]];
  }, M.constrain = function(k) {
    return arguments.length ? (i = k, M) : i;
  }, M.duration = function(k) {
    return arguments.length ? (p = +k, M) : p;
  }, M.interpolate = function(k) {
    return arguments.length ? (h = k, M) : h;
  }, M.on = function() {
    var k = g.on.apply(g, arguments);
    return k === g ? M : k;
  }, M.clickDistance = function(k) {
    return arguments.length ? (N = (k = +k) * k, M) : Math.sqrt(N);
  }, M.tapDistance = function(k) {
    return arguments.length ? (E = +k, M) : E;
  }, M;
}
const Ut = {
  error001: (t = "react") => `Seems like you have not used ${t === "svelte" ? "SvelteFlowProvider" : "ReactFlowProvider"} as an ancestor. Help: https://${t}flow.dev/error#001`,
  error002: () => "It looks like you've created a new nodeTypes or edgeTypes object. If this wasn't on purpose please define the nodeTypes/edgeTypes outside of the component or memoize them.",
  error003: (t) => `Node type "${t}" not found. Using fallback type "default".`,
  error004: () => "The parent container needs a width and a height to render the graph.",
  error005: () => "Only child nodes can use a parent extent.",
  error006: () => "Can't create edge. An edge needs a source and a target.",
  error007: (t) => `The old edge with id=${t} does not exist.`,
  error009: (t) => `Marker type "${t}" doesn't exist.`,
  error008: (t, { id: r, sourceHandle: i, targetHandle: l }) => `Couldn't create edge for ${t} handle id: "${t === "source" ? i : l}", edge id: ${r}.`,
  error010: () => "Handle: No node id found. Make sure to only use a Handle inside a custom Node.",
  error011: (t) => `Edge type "${t}" not found. Using fallback type "default".`,
  error012: (t) => `Node with id "${t}" does not exist, it may have been removed. This can happen when a node is deleted before the "onNodeClick" handler is called.`,
  error013: (t = "react") => `It seems that you haven't loaded the styles. Please import '@xyflow/${t}/dist/style.css' or base.css to make sure everything is working properly.`,
  error014: () => "useNodeConnections: No node ID found. Call useNodeConnections inside a custom Node or provide a node ID.",
  error015: () => "It seems that you are trying to drag a node that is not initialized. Please use onNodesChange as explained in the docs.",
  error016: (t) => `Edge with id "${t}" does not exist, it may have been removed. This can happen when an edge is deleted before the "onEdgeClick" handler is called.`
}, yi = [
  [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
  [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
], wg = ["Enter", " ", "Escape"], xg = {
  "node.a11yDescription.default": "Press enter or space to select a node. Press delete to remove it and escape to cancel.",
  "node.a11yDescription.keyboardDisabled": "Press enter or space to select a node. You can then use the arrow keys to move the node around. Press delete to remove it and escape to cancel.",
  "node.a11yDescription.ariaLiveMessage": ({ direction: t, x: r, y: i }) => `Moved selected node ${t}. New position, x: ${r}, y: ${i}`,
  "edge.a11yDescription.default": "Press enter or space to select an edge. You can then press delete to remove it or escape to cancel.",
  // Control elements
  "controls.ariaLabel": "Control Panel",
  "controls.zoomIn.ariaLabel": "Zoom In",
  "controls.zoomOut.ariaLabel": "Zoom Out",
  "controls.fitView.ariaLabel": "Fit View",
  "controls.interactive.ariaLabel": "Toggle Interactivity",
  // Mini map
  "minimap.ariaLabel": "Mini Map",
  // Handle
  "handle.ariaLabel": "Handle"
};
var fo;
(function(t) {
  t.Strict = "strict", t.Loose = "loose";
})(fo || (fo = {}));
var vr;
(function(t) {
  t.Free = "free", t.Vertical = "vertical", t.Horizontal = "horizontal";
})(vr || (vr = {}));
var vi;
(function(t) {
  t.Partial = "partial", t.Full = "full";
})(vi || (vi = {}));
const _g = {
  inProgress: !1,
  isValid: null,
  from: null,
  fromHandle: null,
  fromPosition: null,
  fromNode: null,
  to: null,
  toHandle: null,
  toPosition: null,
  toNode: null,
  pointer: null
};
var Wn;
(function(t) {
  t.Bezier = "default", t.Straight = "straight", t.Step = "step", t.SmoothStep = "smoothstep", t.SimpleBezier = "simplebezier";
})(Wn || (Wn = {}));
var gl;
(function(t) {
  t.Arrow = "arrow", t.ArrowClosed = "arrowclosed";
})(gl || (gl = {}));
var ye;
(function(t) {
  t.Left = "left", t.Top = "top", t.Right = "right", t.Bottom = "bottom";
})(ye || (ye = {}));
const Rp = {
  [ye.Left]: ye.Right,
  [ye.Right]: ye.Left,
  [ye.Top]: ye.Bottom,
  [ye.Bottom]: ye.Top
}, Sg = (t) => !!t && typeof t == "object" && "id" in t && "source" in t && "target" in t, a1 = (t) => !!t && typeof t == "object" && "id" in t && "position" in t && !("source" in t) && !("target" in t), Sc = (t) => !!t && typeof t == "object" && "id" in t && "internals" in t && !("source" in t) && !("target" in t), Ci = (t, r = [0, 0]) => {
  const { width: i, height: l } = Xt(t), a = t.origin ?? r, c = i * a[0], f = l * a[1];
  return {
    x: t.position.x - c,
    y: t.position.y - f
  };
}, u1 = (t, r = { nodeOrigin: [0, 0] }) => {
  if (t.length === 0)
    return { x: 0, y: 0, width: 0, height: 0 };
  let i = !1;
  const l = t.reduce((a, c) => {
    const f = typeof c == "string";
    let p = !r.nodeLookup && !f ? c : void 0;
    return r.nodeLookup && (p = f ? r.nodeLookup.get(c) : Sc(c) ? c : r.nodeLookup.get(c.id)), p ? (i = !0, Nl(a, ml(p, r.nodeOrigin))) : a;
  }, { x: 1 / 0, y: 1 / 0, x2: -1 / 0, y2: -1 / 0 });
  return i ? Ml(l) : { x: 0, y: 0, width: 0, height: 0 };
}, Ni = (t, r = {}) => {
  let i = { x: 1 / 0, y: 1 / 0, x2: -1 / 0, y2: -1 / 0 }, l = !1;
  return t.forEach((a) => {
    (r.filter === void 0 || r.filter(a)) && (i = Nl(i, ml(a)), l = !0);
  }), l ? Ml(i) : { x: 0, y: 0, width: 0, height: 0 };
}, kc = (t, r, [i, l, a] = [0, 0, 1], c = !1, f = !1) => {
  const p = (r.x - i) / a, h = (r.y - l) / a, g = r.width / a, m = r.height / a, v = [];
  for (const y of t.values()) {
    const { measured: _, selectable: x = !0, hidden: N = !1 } = y;
    if (f && !x || N)
      continue;
    const E = _.width ?? y.width ?? y.initialWidth ?? 0, M = _.height ?? y.height ?? y.initialHeight ?? 0, { x: T, y: S } = y.internals.positionAbsolute, P = Ng(p, h, g, m, T, S, E, M), B = E * M, D = c && P > 0;
    (!y.internals.handleBounds || D || P >= B || y.dragging) && v.push(y);
  }
  return v;
}, c1 = (t, r) => {
  const i = /* @__PURE__ */ new Set();
  return t.forEach((l) => {
    i.add(l.id);
  }), r.filter((l) => i.has(l.source) || i.has(l.target));
};
function f1(t, r) {
  const i = /* @__PURE__ */ new Map(), l = r?.nodes ? new Set(r.nodes.map((a) => a.id)) : null;
  return t.forEach((a) => {
    let c;
    if (r?.includeHiddenNodes) {
      const { width: f, height: p } = Xt(a);
      c = f > 0 && p > 0;
    } else
      c = !!(a.measured.width && a.measured.height && !a.hidden);
    c && (!l || l.has(a.id)) && i.set(a.id, a);
  }), i;
}
async function d1({ nodes: t, width: r, height: i, panZoom: l, minZoom: a, maxZoom: c }, f) {
  if (t.size === 0)
    return !0;
  const p = f1(t, f), h = Ni(p), g = Cc(h, r, i, f?.minZoom ?? a, f?.maxZoom ?? c, f?.padding ?? 0.1);
  return await l.setViewport(g, {
    duration: f?.duration,
    ease: f?.ease,
    interpolate: f?.interpolate
  }), !0;
}
function kg({ nodeId: t, nextPosition: r, nodeLookup: i, nodeOrigin: l = [0, 0], nodeExtent: a, onError: c }) {
  const f = i.get(t), p = f.parentId ? i.get(f.parentId) : void 0, { x: h, y: g } = p ? p.internals.positionAbsolute : { x: 0, y: 0 }, m = f.origin ?? l;
  let v = f.extent || a;
  if (f.extent === "parent" && !f.expandParent)
    if (!p)
      c?.("005", Ut.error005());
    else {
      const { width: _, height: x } = Xt(p);
      _ && x && (v = [
        [h, g],
        [h + _, g + x]
      ]);
    }
  else p && kr(f.extent) && (v = [
    [f.extent[0][0] + h, f.extent[0][1] + g],
    [f.extent[1][0] + h, f.extent[1][1] + g]
  ]);
  const y = kr(v) ? Sr(r, v, f.measured) : r;
  return (f.measured.width === void 0 || f.measured.height === void 0) && c?.("015", Ut.error015()), {
    position: {
      x: y.x - h + (f.measured.width ?? 0) * m[0],
      y: y.y - g + (f.measured.height ?? 0) * m[1]
    },
    positionAbsolute: y
  };
}
async function p1({ nodesToRemove: t = [], edgesToRemove: r = [], nodes: i, edges: l, onBeforeDelete: a }) {
  const c = new Set(t.map((y) => y.id)), f = [];
  for (const y of i) {
    if (y.deletable === !1)
      continue;
    const _ = c.has(y.id), x = !_ && y.parentId && f.find((N) => N.id === y.parentId);
    (_ || x) && f.push(y);
  }
  const p = new Set(r.map((y) => y.id)), h = l.filter((y) => y.deletable !== !1), m = c1(f, h);
  for (const y of h)
    p.has(y.id) && !m.find((x) => x.id === y.id) && m.push(y);
  if (!a)
    return {
      edges: m,
      nodes: f
    };
  const v = await a({
    nodes: f,
    edges: m
  });
  return typeof v == "boolean" ? v ? { edges: m, nodes: f } : { edges: [], nodes: [] } : v;
}
const po = (t, r = 0, i = 1) => Math.min(Math.max(t, r), i), Sr = (t = { x: 0, y: 0 }, r, i) => ({
  x: po(t.x, r[0][0], r[1][0] - (i?.width ?? 0)),
  y: po(t.y, r[0][1], r[1][1] - (i?.height ?? 0))
});
function Eg(t, r, i) {
  const { width: l, height: a } = Xt(i), { x: c, y: f } = i.internals.positionAbsolute;
  return Sr(t, [
    [c, f],
    [c + l, f + a]
  ], r);
}
const Dp = (t, r, i) => t < r ? po(Math.abs(t - r), 1, r) / r : t > i ? -po(Math.abs(t - i), 1, r) / r : 0, Ec = (t, r, i = 15, l = 40) => {
  const a = Dp(t.x, l, r.width - l) * i, c = Dp(t.y, l, r.height - l) * i;
  return [a, c];
}, Nl = (t, r) => ({
  x: Math.min(t.x, r.x),
  y: Math.min(t.y, r.y),
  x2: Math.max(t.x2, r.x2),
  y2: Math.max(t.y2, r.y2)
}), oc = ({ x: t, y: r, width: i, height: l }) => ({
  x: t,
  y: r,
  x2: t + i,
  y2: r + l
}), Ml = ({ x: t, y: r, x2: i, y2: l }) => ({
  x: t,
  y: r,
  width: i - t,
  height: l - r
}), wi = (t, r = [0, 0]) => {
  const { x: i, y: l } = Sc(t) ? t.internals.positionAbsolute : Ci(t, r);
  return {
    x: i,
    y: l,
    width: t.measured?.width ?? t.width ?? t.initialWidth ?? 0,
    height: t.measured?.height ?? t.height ?? t.initialHeight ?? 0
  };
}, ml = (t, r = [0, 0]) => {
  const { x: i, y: l } = Sc(t) ? t.internals.positionAbsolute : Ci(t, r);
  return {
    x: i,
    y: l,
    x2: i + (t.measured?.width ?? t.width ?? t.initialWidth ?? 0),
    y2: l + (t.measured?.height ?? t.height ?? t.initialHeight ?? 0)
  };
}, Cg = (t, r) => Ml(Nl(oc(t), oc(r))), Ng = (t, r, i, l, a, c, f, p) => {
  const h = Math.max(0, Math.min(t + i, a + f) - Math.max(t, a)), g = Math.max(0, Math.min(r + l, c + p) - Math.max(r, c));
  return Math.ceil(h * g);
}, yl = (t, r) => Ng(t.x, t.y, t.width, t.height, r.x, r.y, r.width, r.height), Lp = (t) => Vt(t.width) && Vt(t.height) && Vt(t.x) && Vt(t.y), Vt = (t) => !isNaN(t) && isFinite(t), Mg = (t, r) => (i, l) => {
}, Mi = (t, r = [1, 1]) => ({
  x: r[0] * Math.round(t.x / r[0]),
  y: r[1] * Math.round(t.y / r[1])
}), zi = ({ x: t, y: r }, [i, l, a], c = !1, f = [1, 1]) => {
  const p = {
    x: (t - i) / a,
    y: (r - l) / a
  };
  return c ? Mi(p, f) : p;
}, ho = ({ x: t, y: r }, [i, l, a]) => ({
  x: t * a + i,
  y: r * a + l
});
function to(t, r) {
  if (typeof t == "number")
    return Math.floor((r - r / (1 + t)) * 0.5);
  if (typeof t == "string" && t.endsWith("px")) {
    const i = parseFloat(t);
    if (!Number.isNaN(i))
      return Math.floor(i);
  }
  if (typeof t == "string" && t.endsWith("%")) {
    const i = parseFloat(t);
    if (!Number.isNaN(i))
      return Math.floor(r * i * 0.01);
  }
  return console.error(`The padding value "${t}" is invalid. Please provide a number or a string with a valid unit (px or %).`), 0;
}
function h1(t, r, i) {
  if (typeof t == "string" || typeof t == "number") {
    const l = to(t, i), a = to(t, r);
    return {
      top: l,
      right: a,
      bottom: l,
      left: a,
      x: a * 2,
      y: l * 2
    };
  }
  if (typeof t == "object") {
    const l = to(t.top ?? t.y ?? 0, i), a = to(t.bottom ?? t.y ?? 0, i), c = to(t.left ?? t.x ?? 0, r), f = to(t.right ?? t.x ?? 0, r);
    return { top: l, right: f, bottom: a, left: c, x: c + f, y: l + a };
  }
  return { top: 0, right: 0, bottom: 0, left: 0, x: 0, y: 0 };
}
function g1(t, r, i, l, a, c) {
  const { x: f, y: p } = ho(t, [r, i, l]), { x: h, y: g } = ho({ x: t.x + t.width, y: t.y + t.height }, [r, i, l]), m = a - h, v = c - g;
  return {
    left: Math.floor(f),
    top: Math.floor(p),
    right: Math.floor(m),
    bottom: Math.floor(v)
  };
}
const Cc = (t, r, i, l, a, c) => {
  const f = h1(c, r, i), p = (r - f.x) / t.width, h = (i - f.y) / t.height, g = Math.min(p, h), m = po(g, l, a), v = t.x + t.width / 2, y = t.y + t.height / 2, _ = r / 2 - v * m, x = i / 2 - y * m, N = g1(t, _, x, m, r, i), E = {
    left: Math.min(N.left - f.left, 0),
    top: Math.min(N.top - f.top, 0),
    right: Math.min(N.right - f.right, 0),
    bottom: Math.min(N.bottom - f.bottom, 0)
  };
  return {
    x: _ - E.left + E.right,
    y: x - E.top + E.bottom,
    zoom: m
  };
}, xi = () => typeof navigator < "u" && navigator?.userAgent?.indexOf("Mac") >= 0;
function kr(t) {
  return t != null && t !== "parent";
}
function Xt(t) {
  return {
    width: t.measured?.width ?? t.width ?? t.initialWidth ?? 0,
    height: t.measured?.height ?? t.height ?? t.initialHeight ?? 0
  };
}
function zg(t) {
  return (t.measured?.width ?? t.width ?? t.initialWidth) !== void 0 && (t.measured?.height ?? t.height ?? t.initialHeight) !== void 0;
}
function Pg(t, r = { width: 0, height: 0 }, i, l, a) {
  const c = { ...t }, f = l.get(i);
  if (f) {
    const p = f.origin || a;
    c.x += f.internals.positionAbsolute.x - (r.width ?? 0) * p[0], c.y += f.internals.positionAbsolute.y - (r.height ?? 0) * p[1];
  }
  return c;
}
function $p(t, r) {
  if (t.size !== r.size)
    return !1;
  for (const i of t)
    if (!r.has(i))
      return !1;
  return !0;
}
function m1() {
  let t, r;
  return { promise: new Promise((l, a) => {
    t = l, r = a;
  }), resolve: t, reject: r };
}
function y1(t) {
  return { ...xg, ...t || {} };
}
function Ig(t) {
  return t === null ? null : t ? "valid" : "invalid";
}
function di(t, { snapGrid: r = [0, 0], snapToGrid: i = !1, transform: l, containerBounds: a }) {
  const { x: c, y: f } = Bt(t), p = zi({ x: c - (a?.left ?? 0), y: f - (a?.top ?? 0) }, l), { x: h, y: g } = i ? Mi(p, r) : p;
  return {
    xSnapped: h,
    ySnapped: g,
    ...p
  };
}
const Nc = (t) => ({
  width: t.offsetWidth,
  height: t.offsetHeight
}), Tg = (t) => t?.getRootNode?.() || window?.document, v1 = ["INPUT", "SELECT", "TEXTAREA"];
function bg(t) {
  const r = t.composedPath?.()?.[0] || t.target;
  return r?.nodeType !== 1 ? !1 : v1.includes(r.nodeName) || r.hasAttribute("contenteditable") || !!r.closest(".nokey");
}
const Rg = (t) => "clientX" in t, Bt = (t, r) => {
  const i = Rg(t), l = i ? t.clientX : t.touches?.[0].clientX, a = i ? t.clientY : t.touches?.[0].clientY;
  return {
    x: l - (r?.left ?? 0),
    y: a - (r?.top ?? 0)
  };
}, Op = (t, r, i, l, a) => {
  const c = r.querySelectorAll(`.${t}`);
  return !c || !c.length ? null : Array.from(c).map((f) => {
    const p = f.getBoundingClientRect();
    return {
      id: f.getAttribute("data-handleid"),
      type: t,
      nodeId: a,
      position: f.getAttribute("data-handlepos"),
      x: (p.left - i.left) / l,
      y: (p.top - i.top) / l,
      ...Nc(f)
    };
  });
};
function Dg({ sourceX: t, sourceY: r, targetX: i, targetY: l, sourceControlX: a, sourceControlY: c, targetControlX: f, targetControlY: p }) {
  const h = t * 0.125 + a * 0.375 + f * 0.375 + i * 0.125, g = r * 0.125 + c * 0.375 + p * 0.375 + l * 0.125, m = Math.abs(h - t), v = Math.abs(g - r);
  return [h, g, m, v];
}
function qs(t, r) {
  return t >= 0 ? 0.5 * t : r * 25 * Math.sqrt(-t);
}
function Ap({ pos: t, x1: r, y1: i, x2: l, y2: a, c }) {
  switch (t) {
    case ye.Left:
      return [r - qs(r - l, c), i];
    case ye.Right:
      return [r + qs(l - r, c), i];
    case ye.Top:
      return [r, i - qs(i - a, c)];
    case ye.Bottom:
      return [r, i + qs(a - i, c)];
  }
}
function Lg({ sourceX: t, sourceY: r, sourcePosition: i = ye.Bottom, targetX: l, targetY: a, targetPosition: c = ye.Top, curvature: f = 0.25 }) {
  const [p, h] = Ap({
    pos: i,
    x1: t,
    y1: r,
    x2: l,
    y2: a,
    c: f
  }), [g, m] = Ap({
    pos: c,
    x1: l,
    y1: a,
    x2: t,
    y2: r,
    c: f
  }), [v, y, _, x] = Dg({
    sourceX: t,
    sourceY: r,
    targetX: l,
    targetY: a,
    sourceControlX: p,
    sourceControlY: h,
    targetControlX: g,
    targetControlY: m
  });
  return [
    `M${t},${r} C${p},${h} ${g},${m} ${l},${a}`,
    v,
    y,
    _,
    x
  ];
}
function $g({ sourceX: t, sourceY: r, targetX: i, targetY: l }) {
  const a = Math.abs(i - t) / 2, c = i < t ? i + a : i - a, f = Math.abs(l - r) / 2, p = l < r ? l + f : l - f;
  return [c, p, a, f];
}
function w1({ sourceNode: t, targetNode: r, selected: i = !1, zIndex: l = 0, elevateOnSelect: a = !1, zIndexMode: c = "basic" }) {
  if (c === "manual")
    return l;
  const f = a && i ? l + 1e3 : l, p = Math.max(t.parentId || a && t.selected ? t.internals.z : 0, r.parentId || a && r.selected ? r.internals.z : 0);
  return f + p;
}
function x1({ sourceNode: t, targetNode: r, width: i, height: l, transform: a }) {
  const c = Nl(ml(t), ml(r));
  c.x === c.x2 && (c.x2 += 1), c.y === c.y2 && (c.y2 += 1);
  const f = {
    x: -a[0] / a[2],
    y: -a[1] / a[2],
    width: i / a[2],
    height: l / a[2]
  };
  return yl(f, Ml(c)) > 0;
}
const _1 = ({ source: t, sourceHandle: r, target: i, targetHandle: l }) => `xy-edge__${t}${r || ""}-${i}${l || ""}`, S1 = (t, r) => r.some((i) => i.source === t.source && i.target === t.target && (i.sourceHandle === t.sourceHandle || !i.sourceHandle && !t.sourceHandle) && (i.targetHandle === t.targetHandle || !i.targetHandle && !t.targetHandle)), k1 = (t, r, i = {}) => {
  if (!t.source || !t.target)
    return i.onError?.("006", Ut.error006()), r;
  const l = i.getEdgeId || _1;
  let a;
  return Sg(t) ? a = { ...t } : a = {
    ...t,
    id: l(t)
  }, S1(a, r) ? r : (a.sourceHandle === null && delete a.sourceHandle, a.targetHandle === null && delete a.targetHandle, r.concat(a));
};
function Og({ sourceX: t, sourceY: r, targetX: i, targetY: l }) {
  const [a, c, f, p] = $g({
    sourceX: t,
    sourceY: r,
    targetX: i,
    targetY: l
  });
  return [`M ${t},${r}L ${i},${l}`, a, c, f, p];
}
const jp = {
  [ye.Left]: { x: -1, y: 0 },
  [ye.Right]: { x: 1, y: 0 },
  [ye.Top]: { x: 0, y: -1 },
  [ye.Bottom]: { x: 0, y: 1 }
}, E1 = ({ source: t, sourcePosition: r = ye.Bottom, target: i }) => r === ye.Left || r === ye.Right ? t.x < i.x ? { x: 1, y: 0 } : { x: -1, y: 0 } : t.y < i.y ? { x: 0, y: 1 } : { x: 0, y: -1 }, Hp = (t, r) => Math.sqrt(Math.pow(r.x - t.x, 2) + Math.pow(r.y - t.y, 2)), C1 = (t, r, i) => t.x === r.x && r.x === i.x && (r.y - t.y) * (i.y - r.y) >= 0 || t.y === r.y && r.y === i.y && (r.x - t.x) * (i.x - r.x) >= 0;
function N1({ source: t, sourcePosition: r = ye.Bottom, target: i, targetPosition: l = ye.Top, center: a, offset: c, stepPosition: f }) {
  const p = jp[r], h = jp[l], g = { x: t.x + p.x * c, y: t.y + p.y * c }, m = { x: i.x + h.x * c, y: i.y + h.y * c }, v = E1({
    source: g,
    sourcePosition: r,
    target: m
  }), y = v.x !== 0 ? "x" : "y", _ = v[y];
  let x = [], N, E;
  const M = { x: 0, y: 0 }, T = { x: 0, y: 0 }, [, , S, P] = $g({
    sourceX: t.x,
    sourceY: t.y,
    targetX: i.x,
    targetY: i.y
  });
  if (p[y] * h[y] === -1) {
    y === "x" ? (N = a.x ?? g.x + (m.x - g.x) * f, E = a.y ?? (g.y + m.y) / 2) : (N = a.x ?? (g.x + m.x) / 2, E = a.y ?? g.y + (m.y - g.y) * f);
    const Q = [
      { x: N, y: g.y },
      { x: N, y: m.y }
    ], K = [
      { x: g.x, y: E },
      { x: m.x, y: E }
    ];
    p[y] === _ ? x = y === "x" ? Q : K : x = y === "x" ? K : Q;
  } else {
    const Q = [{ x: g.x, y: m.y }], K = [{ x: m.x, y: g.y }];
    if (y === "x" ? x = p.x === _ ? K : Q : x = p.y === _ ? Q : K, r === l) {
      const k = Math.abs(t[y] - i[y]);
      if (k <= c) {
        const $ = Math.min(c - 1, c - k);
        p[y] === _ ? M[y] = (g[y] > t[y] ? -1 : 1) * $ : T[y] = (m[y] > i[y] ? -1 : 1) * $;
      }
    }
    if (r !== l) {
      const k = y === "x" ? "y" : "x", $ = p[y] === h[k], O = g[k] > m[k], V = g[k] < m[k];
      (p[y] === 1 && (!$ && O || $ && V) || p[y] !== 1 && (!$ && V || $ && O)) && (x = y === "x" ? Q : K);
    }
    const ee = { x: g.x + M.x, y: g.y + M.y }, J = { x: m.x + T.x, y: m.y + T.y }, A = Math.max(Math.abs(ee.x - x[0].x), Math.abs(J.x - x[0].x)), W = Math.max(Math.abs(ee.y - x[0].y), Math.abs(J.y - x[0].y));
    A >= W ? (N = (ee.x + J.x) / 2, E = x[0].y) : (N = x[0].x, E = (ee.y + J.y) / 2);
  }
  const B = { x: g.x + M.x, y: g.y + M.y }, D = { x: m.x + T.x, y: m.y + T.y }, F = [];
  for (const Q of [t, B, ...x, D, i]) {
    const [K, ee] = F.slice(-2);
    ee && C1(K, ee, Q) && F.pop(), F.push(Q);
  }
  return [F, N, E, S, P];
}
function M1(t, r, i, l) {
  const a = Math.min(Hp(t, r) / 2, Hp(r, i) / 2, l), { x: c, y: f } = r;
  if (t.x === c && c === i.x || t.y === f && f === i.y)
    return `L${c} ${f}`;
  if (t.y === f) {
    const g = t.x < i.x ? -1 : 1, m = t.y < i.y ? 1 : -1;
    return `L ${c + a * g},${f}Q ${c},${f} ${c},${f + a * m}`;
  }
  const p = t.x < i.x ? 1 : -1, h = t.y < i.y ? -1 : 1;
  return `L ${c},${f + a * h}Q ${c},${f} ${c + a * p},${f}`;
}
function ic({ sourceX: t, sourceY: r, sourcePosition: i = ye.Bottom, targetX: l, targetY: a, targetPosition: c = ye.Top, borderRadius: f = 5, centerX: p, centerY: h, offset: g = 20, stepPosition: m = 0.5 }) {
  const [v, y, _, x, N] = N1({
    source: { x: t, y: r },
    sourcePosition: i,
    target: { x: l, y: a },
    targetPosition: c,
    center: { x: p, y: h },
    offset: g,
    stepPosition: m
  });
  let E = `M${v[0].x} ${v[0].y}`;
  for (let M = 1; M < v.length - 1; M++)
    E += M1(v[M - 1], v[M], v[M + 1], f);
  return E += `L${v[v.length - 1].x} ${v[v.length - 1].y}`, [E, y, _, x, N];
}
function Fp(t) {
  return t && !!(t.internals.handleBounds || t.handles?.length) && !!(t.measured.width || t.width || t.initialWidth);
}
function z1(t) {
  const { sourceNode: r, targetNode: i } = t;
  if (!Fp(r) || !Fp(i))
    return null;
  const l = r.internals.handleBounds || Vp(r.handles), a = i.internals.handleBounds || Vp(i.handles), c = Bp(l?.source ?? [], t.sourceHandle), f = Bp(
    // when connection type is loose we can define all handles as sources and connect source -> source
    t.connectionMode === fo.Strict ? a?.target ?? [] : (a?.target ?? []).concat(a?.source ?? []),
    t.targetHandle
  );
  if (!c || !f)
    return t.onError?.("008", Ut.error008(c ? "target" : "source", {
      id: t.id,
      sourceHandle: t.sourceHandle,
      targetHandle: t.targetHandle
    })), null;
  const p = c?.position || ye.Bottom, h = f?.position || ye.Top, g = Er(r, c, p), m = Er(i, f, h);
  return {
    sourceX: g.x,
    sourceY: g.y,
    targetX: m.x,
    targetY: m.y,
    sourcePosition: p,
    targetPosition: h
  };
}
function Vp(t) {
  if (!t)
    return null;
  const r = [], i = [];
  for (const l of t)
    l.width = l.width ?? 1, l.height = l.height ?? 1, l.type === "source" ? r.push(l) : l.type === "target" && i.push(l);
  return {
    source: r,
    target: i
  };
}
function Er(t, r, i = ye.Left, l = !1) {
  const a = (r?.x ?? 0) + t.internals.positionAbsolute.x, c = (r?.y ?? 0) + t.internals.positionAbsolute.y, { width: f, height: p } = r ?? Xt(t);
  if (l)
    return { x: a + f / 2, y: c + p / 2 };
  switch (r?.position ?? i) {
    case ye.Top:
      return { x: a + f / 2, y: c };
    case ye.Right:
      return { x: a + f, y: c + p / 2 };
    case ye.Bottom:
      return { x: a + f / 2, y: c + p };
    case ye.Left:
      return { x: a, y: c + p / 2 };
  }
}
function Bp(t, r) {
  return t && (r ? t.find((i) => i.id === r) : t[0]) || null;
}
function sc(t, r) {
  return t ? typeof t == "string" ? t : `${r ? `${r}__` : ""}${Object.keys(t).sort().map((l) => `${l}=${t[l]}`).join("&")}` : "";
}
function P1(t, { id: r, defaultColor: i, defaultMarkerStart: l, defaultMarkerEnd: a }) {
  const c = /* @__PURE__ */ new Set();
  return t.reduce((f, p) => ([p.markerStart || l, p.markerEnd || a].forEach((h) => {
    if (h && typeof h == "object") {
      const g = sc(h, r);
      c.has(g) || (f.push({ id: g, color: h.color || i, ...h }), c.add(g));
    }
  }), f), []).sort((f, p) => f.id.localeCompare(p.id));
}
const Ag = 1e3, I1 = 10, Mc = {
  nodeOrigin: [0, 0],
  nodeExtent: yi,
  elevateNodesOnSelect: !0,
  zIndexMode: "basic",
  defaults: {}
}, T1 = {
  ...Mc,
  checkEquality: !0
};
function zc(t, r) {
  const i = { ...t };
  for (const l in r)
    r[l] !== void 0 && (i[l] = r[l]);
  return i;
}
function b1(t, r, i) {
  const l = zc(Mc, i);
  for (const a of t.values())
    if (a.parentId)
      Ic(a, t, r, l);
    else {
      const c = Ci(a, l.nodeOrigin), f = kr(a.extent) ? a.extent : l.nodeExtent, p = Sr(c, f, Xt(a));
      a.internals.positionAbsolute = p;
    }
}
function R1(t, r) {
  if (!t.handles)
    return t.measured ? r?.internals.handleBounds : void 0;
  const i = [], l = [];
  for (const a of t.handles) {
    const c = {
      id: a.id,
      width: a.width ?? 1,
      height: a.height ?? 1,
      nodeId: t.id,
      x: a.x,
      y: a.y,
      position: a.position,
      type: a.type
    };
    a.type === "source" ? i.push(c) : a.type === "target" && l.push(c);
  }
  return {
    source: i,
    target: l
  };
}
function Pc(t) {
  return t === "manual";
}
function lc(t, r, i, l = {}) {
  const a = zc(T1, l), c = { i: 0 }, f = new Map(r), p = a?.elevateNodesOnSelect && !Pc(a.zIndexMode) ? Ag : 0;
  let h = t.length > 0, g = !1;
  r.clear(), i.clear();
  for (const m of t) {
    let v = f.get(m.id);
    if (a.checkEquality && m === v?.internals.userNode)
      r.set(m.id, v);
    else {
      const y = Ci(m, a.nodeOrigin), _ = kr(m.extent) ? m.extent : a.nodeExtent, x = Sr(y, _, Xt(m));
      v = {
        ...a.defaults,
        ...m,
        measured: {
          width: m.measured?.width,
          height: m.measured?.height
        },
        internals: {
          positionAbsolute: x,
          // if user re-initializes the node or removes `measured` for whatever reason, we reset the handleBounds so that the node gets re-measured
          handleBounds: R1(m, v),
          z: jg(m, p, a.zIndexMode),
          userNode: m
        }
      }, r.set(m.id, v);
    }
    (v.measured === void 0 || v.measured.width === void 0 || v.measured.height === void 0) && !v.hidden && (h = !1), m.parentId && Ic(v, r, i, l, c), g ||= m.selected ?? !1;
  }
  return { nodesInitialized: h, hasSelectedNodes: g };
}
function D1(t, r) {
  if (!t.parentId)
    return;
  const i = r.get(t.parentId);
  i ? i.set(t.id, t) : r.set(t.parentId, /* @__PURE__ */ new Map([[t.id, t]]));
}
function Ic(t, r, i, l, a) {
  const { elevateNodesOnSelect: c, nodeOrigin: f, nodeExtent: p, zIndexMode: h } = zc(Mc, l), g = t.parentId, m = r.get(g);
  if (!m) {
    console.warn(`Parent node ${g} not found. Please make sure that parent nodes are in front of their child nodes in the nodes array.`);
    return;
  }
  D1(t, i), a && !m.parentId && m.internals.rootParentIndex === void 0 && h === "auto" && (m.internals.rootParentIndex = ++a.i, m.internals.z = m.internals.z + a.i * I1), a && m.internals.rootParentIndex !== void 0 && (a.i = m.internals.rootParentIndex);
  const v = c && !Pc(h) ? Ag : 0, { x: y, y: _, z: x } = L1(t, m, f, p, v, h), { positionAbsolute: N } = t.internals, E = y !== N.x || _ !== N.y;
  (E || x !== t.internals.z) && r.set(t.id, {
    ...t,
    internals: {
      ...t.internals,
      positionAbsolute: E ? { x: y, y: _ } : N,
      z: x
    }
  });
}
function jg(t, r, i) {
  const l = Vt(t.zIndex) ? t.zIndex : 0;
  return Pc(i) ? l : l + (t.selected ? r : 0);
}
function L1(t, r, i, l, a, c) {
  const { x: f, y: p } = r.internals.positionAbsolute, h = Xt(t), g = Ci(t, i), m = kr(t.extent) ? Sr(g, t.extent, h) : g;
  let v = Sr({ x: f + m.x, y: p + m.y }, l, h);
  t.extent === "parent" && (v = Eg(v, h, r));
  const y = jg(t, a, c), _ = r.internals.z ?? 0;
  return {
    x: v.x,
    y: v.y,
    z: _ >= y ? _ + 1 : y
  };
}
function Tc(t, r, i, l = [0, 0]) {
  const a = [], c = /* @__PURE__ */ new Map();
  for (const f of t) {
    const p = r.get(f.parentId);
    if (!p)
      continue;
    const h = c.get(f.parentId)?.expandedRect ?? wi(p), g = Cg(h, f.rect);
    c.set(f.parentId, { expandedRect: g, parent: p });
  }
  return c.size > 0 && c.forEach(({ expandedRect: f, parent: p }, h) => {
    const g = p.internals.positionAbsolute, m = Xt(p), v = p.origin ?? l, y = f.x < g.x ? Math.round(Math.abs(g.x - f.x)) : 0, _ = f.y < g.y ? Math.round(Math.abs(g.y - f.y)) : 0, x = Math.max(m.width, Math.round(f.width)), N = Math.max(m.height, Math.round(f.height)), E = (x - m.width) * v[0], M = (N - m.height) * v[1];
    (y > 0 || _ > 0 || E || M) && (a.push({
      id: h,
      type: "position",
      position: {
        x: p.position.x - y + E,
        y: p.position.y - _ + M
      }
    }), i.get(h)?.forEach((T) => {
      t.some((S) => S.id === T.id) || a.push({
        id: T.id,
        type: "position",
        position: {
          x: T.position.x + y,
          y: T.position.y + _
        }
      });
    })), (m.width < f.width || m.height < f.height || y || _) && a.push({
      id: h,
      type: "dimensions",
      setAttributes: !0,
      dimensions: {
        width: x + (y ? v[0] * y - E : 0),
        height: N + (_ ? v[1] * _ - M : 0)
      }
    });
  }), a;
}
function $1(t, r, i, l, a, c, f) {
  const p = l?.querySelector(".xyflow__viewport");
  let h = !1;
  if (!p)
    return { changes: [], updatedInternals: h };
  const g = [], m = window.getComputedStyle(p), { m22: v } = new window.DOMMatrixReadOnly(m.transform), y = [];
  for (const _ of t.values()) {
    const x = r.get(_.id);
    if (!x)
      continue;
    if (x.hidden) {
      r.set(x.id, {
        ...x,
        internals: {
          ...x.internals,
          handleBounds: void 0
        }
      }), h = !0;
      continue;
    }
    const N = Nc(_.nodeElement), E = x.measured.width !== N.width || x.measured.height !== N.height;
    if (!!(N.width && N.height && (E || !x.internals.handleBounds || _.force))) {
      const T = _.nodeElement.getBoundingClientRect(), S = kr(x.extent) ? x.extent : c;
      let { positionAbsolute: P } = x.internals;
      if (x.parentId && x.extent === "parent") {
        const D = r.get(x.parentId);
        D && (P = Eg(P, N, D));
      } else S && (P = Sr(P, S, N));
      const B = {
        ...x,
        measured: N,
        internals: {
          ...x.internals,
          positionAbsolute: P,
          handleBounds: {
            source: Op("source", _.nodeElement, T, v, x.id),
            target: Op("target", _.nodeElement, T, v, x.id)
          }
        }
      };
      r.set(x.id, B), x.parentId && Ic(B, r, i, { nodeOrigin: a, zIndexMode: f }), h = !0, E && (g.push({
        id: x.id,
        type: "dimensions",
        dimensions: N
      }), x.expandParent && x.parentId && y.push({
        id: x.id,
        parentId: x.parentId,
        rect: wi(B, a)
      }));
    }
  }
  if (y.length > 0) {
    const _ = Tc(y, r, i, a);
    g.push(..._);
  }
  return { changes: g, updatedInternals: h };
}
async function O1({ delta: t, panZoom: r, transform: i, translateExtent: l, width: a, height: c }) {
  if (!r || !t.x && !t.y)
    return !1;
  const f = await r.setViewportConstrained({
    x: i[0] + t.x,
    y: i[1] + t.y,
    zoom: i[2]
  }, [
    [0, 0],
    [a, c]
  ], l);
  return !!f && (f.x !== i[0] || f.y !== i[1] || f.k !== i[2]);
}
function Up(t, r, i, l, a, c) {
  let f = a;
  const p = l.get(f) || /* @__PURE__ */ new Map();
  l.set(f, p.set(i, r)), f = `${a}-${t}`;
  const h = l.get(f) || /* @__PURE__ */ new Map();
  if (l.set(f, h.set(i, r)), c) {
    f = `${a}-${t}-${c}`;
    const g = l.get(f) || /* @__PURE__ */ new Map();
    l.set(f, g.set(i, r));
  }
}
function Hg(t, r, i) {
  t.clear(), r.clear();
  for (const l of i) {
    const { source: a, target: c, sourceHandle: f = null, targetHandle: p = null } = l, h = { edgeId: l.id, source: a, target: c, sourceHandle: f, targetHandle: p }, g = `${a}-${f}--${c}-${p}`, m = `${c}-${p}--${a}-${f}`;
    Up("source", h, m, t, a, f), Up("target", h, g, t, c, p), r.set(l.id, l);
  }
}
function Fg(t, r) {
  if (!t.parentId)
    return !1;
  const i = r.get(t.parentId);
  return i ? i.selected ? !0 : Fg(i, r) : !1;
}
function Wp(t, r, i) {
  let l = t;
  do {
    if (l?.matches?.(r))
      return !0;
    if (l === i)
      return !1;
    l = l?.parentElement;
  } while (l);
  return !1;
}
function A1(t, r, i, l, a) {
  const c = /* @__PURE__ */ new Map();
  for (const [f, p] of t)
    if ((a ? p.id === l : p.selected || p.id === l) && (a || !p.parentId || !Fg(p, t)) && (p.draggable || r && typeof p.draggable > "u")) {
      const g = t.get(f);
      g && c.set(f, {
        id: f,
        position: g.position || { x: 0, y: 0 },
        distance: {
          x: i.x - g.internals.positionAbsolute.x,
          y: i.y - g.internals.positionAbsolute.y
        },
        extent: g.extent,
        parentId: g.parentId,
        origin: g.origin,
        expandParent: g.expandParent,
        internals: {
          positionAbsolute: g.internals.positionAbsolute || { x: 0, y: 0 }
        },
        measured: {
          width: g.measured.width ?? 0,
          height: g.measured.height ?? 0
        }
      });
    }
  return c;
}
function ju({ nodeId: t, dragItems: r, nodeLookup: i, dragging: l = !0 }) {
  const a = [];
  for (const [f, p] of r) {
    const h = i.get(f)?.internals.userNode;
    h && a.push({
      ...h,
      position: p.position,
      dragging: l
    });
  }
  if (!t)
    return [a[0], a];
  const c = i.get(t)?.internals.userNode;
  return [
    c ? {
      ...c,
      position: r.get(t)?.position || c.position,
      dragging: l
    } : a[0],
    a
  ];
}
function j1({ dragItems: t, snapGrid: r, x: i, y: l }) {
  const a = t.values().next().value;
  if (!a)
    return null;
  const c = {
    x: i - a.distance.x,
    y: l - a.distance.y
  }, f = Mi(c, r);
  return {
    x: f.x - c.x,
    y: f.y - c.y
  };
}
function H1({ onNodeMouseDown: t, getStoreItems: r, onDragStart: i, onDrag: l, onDragStop: a }) {
  let c = { x: null, y: null }, f = 0, p = /* @__PURE__ */ new Map(), h = !1, g = { x: 0, y: 0 }, m = null, v = !1, y = null, _ = !1, x = !1, N = null;
  function E({ noDragClassName: T, handleSelector: S, domNode: P, isSelectable: B, nodeId: D, nodeClickDistance: F = 0 }) {
    y = kt(P);
    function Q({ x: A, y: W }) {
      const { nodeLookup: k, nodeExtent: $, snapGrid: O, snapToGrid: V, nodeOrigin: b, onNodeDrag: j, onSelectionDrag: U, onError: C, updateNodePositions: H } = r();
      c = { x: A, y: W };
      let ie = !1;
      const re = p.size > 1, ae = re && $ ? oc(Ni(p)) : null, ce = re && V ? j1({
        dragItems: p,
        snapGrid: O,
        x: A,
        y: W
      }) : null;
      for (const [ue, q] of p) {
        if (!k.has(ue))
          continue;
        let le = { x: A - q.distance.x, y: W - q.distance.y };
        V && (le = ce ? {
          x: Math.round(le.x + ce.x),
          y: Math.round(le.y + ce.y)
        } : Mi(le, O));
        let we = null;
        if (re && $ && !q.extent && ae) {
          const { positionAbsolute: ve } = q.internals, Ee = ve.x - ae.x + $[0][0], Ce = ve.x + q.measured.width - ae.x2 + $[1][0], ze = ve.y - ae.y + $[0][1], Ve = ve.y + q.measured.height - ae.y2 + $[1][1];
          we = [
            [Ee, ze],
            [Ce, Ve]
          ];
        }
        const { position: Se, positionAbsolute: me } = kg({
          nodeId: ue,
          nextPosition: le,
          nodeLookup: k,
          nodeExtent: we || $,
          nodeOrigin: b,
          onError: C
        });
        ie = ie || q.position.x !== Se.x || q.position.y !== Se.y, q.position = Se, q.internals.positionAbsolute = me;
      }
      if (x = x || ie, !!ie && (H(p, !0), N && (l || j || !D && U))) {
        const [ue, q] = ju({
          nodeId: D,
          dragItems: p,
          nodeLookup: k
        });
        l?.(N, p, ue, q), j?.(N, ue, q), D || U?.(N, q);
      }
    }
    async function K() {
      if (!m)
        return;
      const { transform: A, panBy: W, autoPanSpeed: k, autoPanOnNodeDrag: $ } = r();
      if (!$) {
        h = !1, cancelAnimationFrame(f);
        return;
      }
      const [O, V] = Ec(g, m, k);
      (O !== 0 || V !== 0) && (c.x = (c.x ?? 0) - O / A[2], c.y = (c.y ?? 0) - V / A[2], await W({ x: O, y: V }) && Q(c)), f = requestAnimationFrame(K);
    }
    function ee(A) {
      const { nodeLookup: W, multiSelectionActive: k, nodesDraggable: $, transform: O, snapGrid: V, snapToGrid: b, selectNodesOnDrag: j, onNodeDragStart: U, onSelectionDragStart: C, unselectNodesAndEdges: H } = r();
      v = !0;
      const ie = !!D && !k && !W.get(D)?.selected;
      (!j || !B) && !k && D && (W.get(D)?.selected || H()), B && j && D && t?.(D);
      const re = di(A.sourceEvent, { transform: O, snapGrid: V, snapToGrid: b, containerBounds: m });
      if (c = re, p = A1(W, $, re, D, ie), p.size > 0 && (i || U || !D && C)) {
        const [ae, ce] = ju({
          nodeId: D,
          dragItems: p,
          nodeLookup: W
        });
        i?.(A.sourceEvent, p, ae, ce), U?.(A.sourceEvent, ae, ce), D || C?.(A.sourceEvent, ce);
      }
    }
    const J = Yh().clickDistance(F).on("start", (A) => {
      const { domNode: W, nodeDragThreshold: k, transform: $, snapGrid: O, snapToGrid: V } = r();
      m = W?.getBoundingClientRect() || null, _ = !1, x = !1, N = A.sourceEvent, k === 0 && ee(A), c = di(A.sourceEvent, { transform: $, snapGrid: O, snapToGrid: V, containerBounds: m }), g = Bt(A.sourceEvent, m);
    }).on("drag", (A) => {
      const { autoPanOnNodeDrag: W, transform: k, snapGrid: $, snapToGrid: O, nodeDragThreshold: V, nodeLookup: b } = r(), j = di(A.sourceEvent, { transform: k, snapGrid: $, snapToGrid: O, containerBounds: m });
      if (N = A.sourceEvent, (A.sourceEvent.type === "touchmove" && A.sourceEvent.touches.length > 1 || // if user deletes a node while dragging, we need to abort the drag to prevent errors
      D && !b.has(D)) && (_ = !0), !_) {
        if (!h && W && v && (h = !0, K()), !v) {
          const U = Bt(A.sourceEvent, m), C = U.x - g.x, H = U.y - g.y;
          Math.sqrt(C * C + H * H) > V && ee(A);
        }
        (c.x !== j.xSnapped || c.y !== j.ySnapped) && p && v && (g = Bt(A.sourceEvent, m), Q(j));
      }
    }).on("end", (A) => {
      if (!v || _) {
        _ && p.size > 0 && r().updateNodePositions(p, !1);
        return;
      }
      if (h = !1, v = !1, cancelAnimationFrame(f), p.size > 0) {
        const { nodeLookup: W, updateNodePositions: k, onNodeDragStop: $, onSelectionDragStop: O } = r();
        if (x && (k(p, !1), x = !1), a || $ || !D && O) {
          const [V, b] = ju({
            nodeId: D,
            dragItems: p,
            nodeLookup: W,
            dragging: !1
          });
          a?.(A.sourceEvent, p, V, b), $?.(A.sourceEvent, V, b), D || O?.(A.sourceEvent, b);
        }
      }
    }).filter((A) => {
      const W = A.target;
      return !A.button && (!T || !Wp(W, `.${T}`, P)) && (!S || Wp(W, S, P));
    });
    y.call(J);
  }
  function M() {
    y?.on(".drag", null);
  }
  return {
    update: E,
    destroy: M
  };
}
function F1(t, r, i) {
  const l = [], a = {
    x: t.x - i,
    y: t.y - i,
    width: i * 2,
    height: i * 2
  };
  for (const c of r.values())
    yl(a, wi(c)) > 0 && l.push(c);
  return l;
}
const V1 = 250;
function B1(t, r, i, l) {
  let a = [], c = 1 / 0;
  const f = F1(t, i, r + V1);
  for (const p of f) {
    const h = [...p.internals.handleBounds?.source ?? [], ...p.internals.handleBounds?.target ?? []];
    for (const g of h) {
      if (l.nodeId === g.nodeId && l.type === g.type && l.id === g.id)
        continue;
      const { x: m, y: v } = Er(p, g, g.position, !0), y = Math.sqrt(Math.pow(m - t.x, 2) + Math.pow(v - t.y, 2));
      y > r || (y < c ? (a = [{ ...g, x: m, y: v }], c = y) : y === c && a.push({ ...g, x: m, y: v }));
    }
  }
  if (!a.length)
    return null;
  if (a.length > 1) {
    const p = l.type === "source" ? "target" : "source";
    return a.find((h) => h.type === p) ?? a[0];
  }
  return a[0];
}
function Vg(t, r, i, l, a, c = !1) {
  const f = l.get(t);
  if (!f)
    return null;
  const p = a === "strict" ? f.internals.handleBounds?.[r] : [...f.internals.handleBounds?.source ?? [], ...f.internals.handleBounds?.target ?? []], h = (i ? p?.find((g) => g.id === i) : p?.[0]) ?? null;
  return h && c ? { ...h, ...Er(f, h, h.position, !0) } : h;
}
function Bg(t, r) {
  return t || (r?.classList.contains("target") ? "target" : r?.classList.contains("source") ? "source" : null);
}
function U1(t, r) {
  let i = null;
  return r ? i = !0 : t && !r && (i = !1), i;
}
const Ug = () => !0;
function W1(t, { connectionMode: r, connectionRadius: i, handleId: l, nodeId: a, edgeUpdaterType: c, isTarget: f, domNode: p, nodeLookup: h, lib: g, autoPanOnConnect: m, flowId: v, panBy: y, cancelConnection: _, onConnectStart: x, onConnect: N, onConnectEnd: E, isValidConnection: M = Ug, onReconnectEnd: T, updateConnection: S, getTransform: P, getFromHandle: B, autoPanSpeed: D, dragThreshold: F = 1, handleDomNode: Q }) {
  const K = Tg(t.target);
  let ee = 0, J;
  const { x: A, y: W } = Bt(t), k = Bg(c, Q), $ = p?.getBoundingClientRect();
  let O = !1;
  if (!$ || !k)
    return;
  const V = Vg(a, k, l, h, r);
  if (!V)
    return;
  let b = Bt(t, $), j = !1, U = null, C = !1, H = null;
  function ie() {
    if (!m || !$)
      return;
    const [Se, me] = Ec(b, $, D);
    y({ x: Se, y: me }), ee = requestAnimationFrame(ie);
  }
  const re = {
    ...V,
    nodeId: a,
    type: k,
    position: V.position
  }, ae = h.get(a);
  let ue = {
    inProgress: !0,
    isValid: null,
    from: Er(ae, re, ye.Left, !0),
    fromHandle: re,
    fromPosition: re.position,
    fromNode: ae,
    to: b,
    toHandle: null,
    toPosition: Rp[re.position],
    toNode: null,
    pointer: b
  };
  function q() {
    O = !0, S(ue), x?.(t, { nodeId: a, handleId: l, handleType: k });
  }
  F === 0 && q();
  function le(Se) {
    if (!O) {
      const { x: Ve, y: Ct } = Bt(Se), at = Ve - A, et = Ct - W;
      if (!(at * at + et * et > F * F))
        return;
      q();
    }
    if (!B() || !re) {
      we(Se);
      return;
    }
    const me = P();
    b = Bt(Se, $), J = B1(zi(b, me, !1, [1, 1]), i, h, re), j || (ie(), j = !0);
    const ve = Wg(Se, {
      handle: J,
      connectionMode: r,
      fromNodeId: a,
      fromHandleId: l,
      fromType: f ? "target" : "source",
      isValidConnection: M,
      doc: K,
      lib: g,
      flowId: v,
      nodeLookup: h
    });
    H = ve.handleDomNode, U = ve.connection, C = U1(!!J, ve.isValid);
    const Ee = h.get(a), Ce = Ee ? Er(Ee, re, ye.Left, !0) : ue.from, ze = {
      ...ue,
      from: Ce,
      isValid: C,
      to: ve.toHandle && C ? ho({ x: ve.toHandle.x, y: ve.toHandle.y }, me) : b,
      toHandle: ve.toHandle,
      toPosition: C && ve.toHandle ? ve.toHandle.position : Rp[re.position],
      toNode: ve.toHandle ? h.get(ve.toHandle.nodeId) : null,
      pointer: b
    };
    S(ze), ue = ze;
  }
  function we(Se) {
    if (!("touches" in Se && Se.touches.length > 0)) {
      if (O) {
        (J || H) && U && C && N?.(U);
        const { inProgress: me, ...ve } = ue, Ee = {
          ...ve,
          toPosition: ue.toHandle ? ue.toPosition : null
        };
        E?.(Se, Ee), c && T?.(Se, Ee);
      }
      _(), cancelAnimationFrame(ee), j = !1, C = !1, U = null, H = null, K.removeEventListener("mousemove", le), K.removeEventListener("mouseup", we), K.removeEventListener("touchmove", le), K.removeEventListener("touchend", we);
    }
  }
  K.addEventListener("mousemove", le), K.addEventListener("mouseup", we), K.addEventListener("touchmove", le), K.addEventListener("touchend", we);
}
function Wg(t, { handle: r, connectionMode: i, fromNodeId: l, fromHandleId: a, fromType: c, doc: f, lib: p, flowId: h, isValidConnection: g = Ug, nodeLookup: m }) {
  const v = c === "target", y = r ? f.querySelector(`.${p}-flow__handle[data-id="${h}-${r?.nodeId}-${r?.id}-${r?.type}"]`) : null, { x: _, y: x } = Bt(t), N = f.elementFromPoint(_, x), E = N?.classList.contains(`${p}-flow__handle`) ? N : y, M = {
    handleDomNode: E,
    isValid: !1,
    connection: null,
    toHandle: null
  };
  if (E) {
    const T = Bg(void 0, E), S = E.getAttribute("data-nodeid"), P = E.getAttribute("data-handleid"), B = E.classList.contains("connectable"), D = E.classList.contains("connectableend");
    if (!S || !T)
      return M;
    const F = {
      source: v ? S : l,
      sourceHandle: v ? P : a,
      target: v ? l : S,
      targetHandle: v ? a : P
    };
    M.connection = F;
    const K = B && D && (i === fo.Strict ? v && T === "source" || !v && T === "target" : S !== l || P !== a);
    M.isValid = K && g(F), M.toHandle = Vg(S, T, P, m, i, !0);
  }
  return M;
}
const ac = {
  onPointerDown: W1,
  isValid: Wg
};
function X1({ domNode: t, panZoom: r, getTransform: i, getViewScale: l }) {
  const a = kt(t);
  function c({ translateExtent: p, width: h, height: g, zoomStep: m = 1, pannable: v = !0, zoomable: y = !0, inversePan: _ = !1 }) {
    const x = (S) => {
      if (S.sourceEvent.type !== "wheel" || !r)
        return;
      const P = i(), B = S.sourceEvent.ctrlKey && xi() ? 10 : 1, D = -S.sourceEvent.deltaY * (S.sourceEvent.deltaMode === 1 ? 0.05 : S.sourceEvent.deltaMode ? 1 : 2e-3) * m, F = P[2] * Math.pow(2, D * B);
      r.scaleTo(F);
    };
    let N = [0, 0];
    const E = (S) => {
      (S.sourceEvent.type === "mousedown" || S.sourceEvent.type === "touchstart") && (N = [
        S.sourceEvent.clientX ?? S.sourceEvent.touches[0].clientX,
        S.sourceEvent.clientY ?? S.sourceEvent.touches[0].clientY
      ]);
    }, M = (S) => {
      const P = i();
      if (S.sourceEvent.type !== "mousemove" && S.sourceEvent.type !== "touchmove" || !r)
        return;
      const B = [
        S.sourceEvent.clientX ?? S.sourceEvent.touches[0].clientX,
        S.sourceEvent.clientY ?? S.sourceEvent.touches[0].clientY
      ], D = [B[0] - N[0], B[1] - N[1]];
      N = B;
      const F = l() * Math.max(P[2], Math.log(P[2])) * (_ ? -1 : 1), Q = {
        x: P[0] - D[0] * F,
        y: P[1] - D[1] * F
      }, K = [
        [0, 0],
        [h, g]
      ];
      r.setViewportConstrained({
        x: Q.x,
        y: Q.y,
        zoom: P[2]
      }, K, p);
    }, T = vg().on("start", E).on("zoom", v ? M : null).on("zoom.wheel", y ? x : null);
    a.call(T, {});
  }
  function f() {
    a.on("zoom", null);
  }
  return {
    update: c,
    destroy: f,
    pointer: Ht
  };
}
const zl = (t) => ({
  x: t.x,
  y: t.y,
  zoom: t.k
}), Hu = ({ x: t, y: r, zoom: i }) => Cl.translate(t, r).scale(i), Un = (t, r) => t.target.closest(`.${r}`), Xg = (t, r) => r === 2 && Array.isArray(t) && t.includes(2), Y1 = (t) => ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2, Fu = (t, r = 0, i = Y1, l = () => {
}) => {
  const a = typeof r == "number" && r > 0;
  return a || l(), a ? t.transition().duration(r).ease(i).on("end", l) : t;
}, Yg = (t) => {
  const r = t.ctrlKey && xi() ? 10 : 1;
  return -t.deltaY * (t.deltaMode === 1 ? 0.05 : t.deltaMode ? 1 : 2e-3) * r;
};
function Z1({ zoomPanValues: t, noWheelClassName: r, d3Selection: i, d3Zoom: l, panOnScrollMode: a, panOnScrollSpeed: c, zoomOnPinch: f, onPanZoomStart: p, onPanZoom: h, onPanZoomEnd: g }) {
  return (m) => {
    if (Un(m, r))
      return m.ctrlKey && m.preventDefault(), !1;
    m.preventDefault(), m.stopImmediatePropagation();
    const v = i.property("__zoom").k || 1;
    if (m.ctrlKey && f) {
      const E = Ht(m), M = Yg(m), T = v * Math.pow(2, M);
      l.scaleTo(i, T, E, m);
      return;
    }
    const y = m.deltaMode === 1 ? 20 : 1;
    let _ = a === vr.Vertical ? 0 : m.deltaX * y, x = a === vr.Horizontal ? 0 : m.deltaY * y;
    !xi() && m.shiftKey && a !== vr.Vertical && (_ = m.deltaY * y, x = 0), l.translateBy(
      i,
      -(_ / v) * c,
      -(x / v) * c,
      // @ts-ignore
      { internal: !0 }
    );
    const N = zl(i.property("__zoom"));
    clearTimeout(t.panScrollTimeout), t.isPanScrolling ? h?.(m, N) : (t.isPanScrolling = !0, p?.(m, N)), t.panScrollTimeout = setTimeout(() => {
      g?.(m, N), t.isPanScrolling = !1;
    }, 150);
  };
}
function Q1({ noWheelClassName: t, preventScrolling: r, d3ZoomHandler: i }) {
  return function(l, a) {
    const c = l.type === "wheel", f = !r && c && !l.ctrlKey, p = Un(l, t);
    if (l.ctrlKey && c && p && l.preventDefault(), f || p)
      return null;
    l.preventDefault(), i.call(this, l, a);
  };
}
function K1({ zoomPanValues: t, onDraggingChange: r, onPanZoomStart: i }) {
  return (l) => {
    if (l.sourceEvent?.internal)
      return;
    const a = zl(l.transform);
    t.mouseButton = l.sourceEvent?.button || 0, t.isZoomingOrPanning = !0, t.prevViewport = a, l.sourceEvent?.type === "mousedown" && r(!0), i && i?.(l.sourceEvent, a);
  };
}
function G1({ zoomPanValues: t, panOnDrag: r, onPaneContextMenu: i, onTransformChange: l, onPanZoom: a }) {
  return (c) => {
    t.usedRightMouseButton = !!(i && Xg(r, t.mouseButton ?? 0)), c.sourceEvent?.sync || l([c.transform.x, c.transform.y, c.transform.k]), a && !c.sourceEvent?.internal && a?.(c.sourceEvent, zl(c.transform));
  };
}
function q1({ zoomPanValues: t, panOnDrag: r, panOnScroll: i, onDraggingChange: l, onPanZoomEnd: a, onPaneContextMenu: c }) {
  return (f) => {
    if (!f.sourceEvent?.internal && (t.isZoomingOrPanning = !1, c && Xg(r, t.mouseButton ?? 0) && !t.usedRightMouseButton && f.sourceEvent && c(f.sourceEvent), t.usedRightMouseButton = !1, l(!1), a)) {
      const p = zl(f.transform);
      t.prevViewport = p, clearTimeout(t.timerId), t.timerId = setTimeout(
        () => {
          a?.(f.sourceEvent, p);
        },
        // we need a setTimeout for panOnScroll to suppress multiple end events fired during scroll
        i ? 150 : 0
      );
    }
  };
}
function J1({ panActivationKeyPressed: t, zoomActivationKeyPressed: r, zoomOnScroll: i, zoomOnPinch: l, panOnDrag: a, panOnScroll: c, zoomOnDoubleClick: f, userSelectionActive: p, noWheelClassName: h, noPanClassName: g, lib: m, connectionInProgress: v }) {
  return (y) => {
    const _ = r || i, x = l && y.ctrlKey, N = y.type === "wheel";
    if (y.button === 1 && y.type === "mousedown" && (Un(y, `${m}-flow__node`) || Un(y, `${m}-flow__edge`) || Un(y, `${m}-flow__selection`) || Un(y, `${m}-flow__nodesselection`)))
      return !0;
    if (!a && !_ && !c && !f && !l || p || v && !N || Un(y, h) && N || Un(y, g) && (!N || c && N && !r) || !l && y.ctrlKey && N)
      return !1;
    if (!l && y.type === "touchstart" && y.touches?.length > 1)
      return y.preventDefault(), !1;
    if (!_ && !c && !x && N || !a && (y.type === "mousedown" || y.type === "touchstart") || Array.isArray(a) && !a.includes(y.button) && y.type === "mousedown")
      return !1;
    const E = Array.isArray(a) && a.includes(y.button) || !y.button || y.button <= 1;
    return (!y.ctrlKey || N || t) && E;
  };
}
function e_({ domNode: t, minZoom: r, maxZoom: i, translateExtent: l, viewport: a, onPanZoom: c, onPanZoomStart: f, onPanZoomEnd: p, onDraggingChange: h }) {
  const g = {
    isZoomingOrPanning: !1,
    usedRightMouseButton: !1,
    prevViewport: {},
    mouseButton: 0,
    timerId: void 0,
    panScrollTimeout: void 0,
    isPanScrolling: !1
  }, m = t.getBoundingClientRect();
  let v = [
    [0, 0],
    [m.width, m.height]
  ];
  const y = typeof ResizeObserver < "u" ? new ResizeObserver((W) => {
    const k = W[0];
    k?.contentRect && (v = [
      [0, 0],
      [k.contentRect.width, k.contentRect.height]
    ]);
  }) : null;
  y?.observe(t);
  const _ = vg().extent(() => v).scaleExtent([r, i]).translateExtent(l), x = kt(t).call(_);
  P({
    x: a.x,
    y: a.y,
    zoom: po(a.zoom, r, i)
  }, [
    [0, 0],
    [m.width, m.height]
  ], l);
  const N = x.on("wheel.zoom"), E = x.on("dblclick.zoom");
  _.wheelDelta(Yg);
  async function M(W, k) {
    return x ? new Promise(($) => {
      _?.interpolate(k?.interpolate === "linear" ? fi : rl).transform(Fu(x, k?.duration, k?.ease, () => $(!0)), W);
    }) : !1;
  }
  function T({ noWheelClassName: W, noPanClassName: k, onPaneContextMenu: $, userSelectionActive: O, panOnScroll: V, panOnDrag: b, panOnScrollMode: j, panOnScrollSpeed: U, preventScrolling: C, zoomOnPinch: H, zoomOnScroll: ie, zoomOnDoubleClick: re, panActivationKeyPressed: ae = !1, zoomActivationKeyPressed: ce, lib: ue, onTransformChange: q, connectionInProgress: le, paneClickDistance: we, selectionOnDrag: Se }) {
    O && !g.isZoomingOrPanning && _.on("zoom", null);
    const me = V && !ce && !O;
    _.clickDistance(Se ? 1 / 0 : !Vt(we) || we < 0 ? 0 : we);
    const ve = me ? Z1({
      zoomPanValues: g,
      noWheelClassName: W,
      d3Selection: x,
      d3Zoom: _,
      panOnScrollMode: j,
      panOnScrollSpeed: U,
      zoomOnPinch: H,
      onPanZoomStart: f,
      onPanZoom: c,
      onPanZoomEnd: p
    }) : Q1({
      noWheelClassName: W,
      preventScrolling: C,
      d3ZoomHandler: N
    });
    x.on("wheel.zoom", ve, { passive: !1 });
    const Ee = K1({
      zoomPanValues: g,
      onDraggingChange: h,
      onPanZoomStart: f
    });
    _.on("start", Ee);
    const Ce = G1({
      zoomPanValues: g,
      panOnDrag: b,
      onPaneContextMenu: !!$,
      onPanZoom: c,
      onTransformChange: q
    });
    _.on("zoom", Ce);
    const ze = q1({
      zoomPanValues: g,
      panOnDrag: b,
      panOnScroll: V,
      onPaneContextMenu: $,
      onPanZoomEnd: p,
      onDraggingChange: h
    });
    _.on("end", ze);
    const Ve = J1({
      panActivationKeyPressed: ae,
      zoomActivationKeyPressed: ce,
      panOnDrag: b,
      zoomOnScroll: ie,
      panOnScroll: V,
      zoomOnDoubleClick: re,
      zoomOnPinch: H,
      userSelectionActive: O,
      noPanClassName: k,
      noWheelClassName: W,
      lib: ue,
      connectionInProgress: le
    });
    _.filter(Ve), re ? x.on("dblclick.zoom", E) : x.on("dblclick.zoom", null);
  }
  function S() {
    _.on("zoom", null), y?.disconnect();
  }
  async function P(W, k, $) {
    const O = Hu(W), V = _?.constrain()(O, k, $);
    return V && await M(V), V;
  }
  async function B(W, k) {
    const $ = Hu(W);
    return await M($, k), $;
  }
  function D(W) {
    if (x) {
      const k = Hu(W), $ = x.property("__zoom");
      ($.k !== W.zoom || $.x !== W.x || $.y !== W.y) && _?.transform(x, k, null, { sync: !0 });
    }
  }
  function F() {
    const W = x ? yg(x.node()) : { x: 0, y: 0, k: 1 };
    return { x: W.x, y: W.y, zoom: W.k };
  }
  async function Q(W, k) {
    return x ? new Promise(($) => {
      _?.interpolate(k?.interpolate === "linear" ? fi : rl).scaleTo(Fu(x, k?.duration, k?.ease, () => $(!0)), W);
    }) : !1;
  }
  async function K(W, k) {
    return x ? new Promise(($) => {
      _?.interpolate(k?.interpolate === "linear" ? fi : rl).scaleBy(Fu(x, k?.duration, k?.ease, () => $(!0)), W);
    }) : !1;
  }
  function ee(W) {
    _?.scaleExtent(W);
  }
  function J(W) {
    _?.translateExtent(W);
  }
  function A(W) {
    const k = !Vt(W) || W < 0 ? 0 : W;
    _?.clickDistance(k);
  }
  return {
    update: T,
    destroy: S,
    setViewport: B,
    setViewportConstrained: P,
    getViewport: F,
    scaleTo: Q,
    scaleBy: K,
    setScaleExtent: ee,
    setTranslateExtent: J,
    syncViewport: D,
    setClickDistance: A
  };
}
var go;
(function(t) {
  t.Line = "line", t.Handle = "handle";
})(go || (go = {}));
function t_({ width: t, prevWidth: r, height: i, prevHeight: l, affectsX: a, affectsY: c }) {
  const f = t - r, p = i - l, h = [f > 0 ? 1 : f < 0 ? -1 : 0, p > 0 ? 1 : p < 0 ? -1 : 0];
  return f && a && (h[0] = h[0] * -1), p && c && (h[1] = h[1] * -1), h;
}
function Xp(t) {
  const r = t.includes("right") || t.includes("left"), i = t.includes("bottom") || t.includes("top"), l = t.includes("left"), a = t.includes("top");
  return {
    isHorizontal: r,
    isVertical: i,
    affectsX: l,
    affectsY: a
  };
}
function Vn(t, r) {
  return Math.max(0, r - t);
}
function Bn(t, r) {
  return Math.max(0, t - r);
}
function Js(t, r, i) {
  return Math.max(0, r - t, t - i);
}
function Yp(t, r) {
  return t ? !r : r;
}
function n_(t, r, i, l, a, c, f, p) {
  let { affectsX: h, affectsY: g } = r;
  const { isHorizontal: m, isVertical: v } = r, y = m && v, { xSnapped: _, ySnapped: x } = i, { minWidth: N, maxWidth: E, minHeight: M, maxHeight: T } = l, { x: S, y: P, width: B, height: D, aspectRatio: F } = t;
  let Q = Math.floor(m ? _ - t.pointerX : 0), K = Math.floor(v ? x - t.pointerY : 0);
  const ee = B + (h ? -Q : Q), J = D + (g ? -K : K), A = -c[0] * B, W = -c[1] * D;
  let k = Js(ee, N, E), $ = Js(J, M, T);
  if (f) {
    let b = 0, j = 0;
    h && Q < 0 ? b = Vn(S + Q + A, f[0][0]) : !h && Q > 0 && (b = Bn(S + ee + A, f[1][0])), g && K < 0 ? j = Vn(P + K + W, f[0][1]) : !g && K > 0 && (j = Bn(P + J + W, f[1][1])), k = Math.max(k, b), $ = Math.max($, j);
  }
  if (p) {
    let b = 0, j = 0;
    h && Q > 0 ? b = Bn(S + Q, p[0][0]) : !h && Q < 0 && (b = Vn(S + ee, p[1][0])), g && K > 0 ? j = Bn(P + K, p[0][1]) : !g && K < 0 && (j = Vn(P + J, p[1][1])), k = Math.max(k, b), $ = Math.max($, j);
  }
  if (a) {
    if (m) {
      const b = Js(ee / F, M, T) * F;
      if (k = Math.max(k, b), f) {
        let j = 0;
        !h && !g || h && !g && y ? j = Bn(P + W + ee / F, f[1][1]) * F : j = Vn(P + W + (h ? Q : -Q) / F, f[0][1]) * F, k = Math.max(k, j);
      }
      if (p) {
        let j = 0;
        !h && !g || h && !g && y ? j = Vn(P + ee / F, p[1][1]) * F : j = Bn(P + (h ? Q : -Q) / F, p[0][1]) * F, k = Math.max(k, j);
      }
    }
    if (v) {
      const b = Js(J * F, N, E) / F;
      if ($ = Math.max($, b), f) {
        let j = 0;
        !h && !g || g && !h && y ? j = Bn(S + J * F + A, f[1][0]) / F : j = Vn(S + (g ? K : -K) * F + A, f[0][0]) / F, $ = Math.max($, j);
      }
      if (p) {
        let j = 0;
        !h && !g || g && !h && y ? j = Vn(S + J * F, p[1][0]) / F : j = Bn(S + (g ? K : -K) * F, p[0][0]) / F, $ = Math.max($, j);
      }
    }
  }
  K = K + (K < 0 ? $ : -$), Q = Q + (Q < 0 ? k : -k), a && (y ? ee > J * F ? K = (Yp(h, g) ? -Q : Q) / F : Q = (Yp(h, g) ? -K : K) * F : m ? (K = Q / F, g = h) : (Q = K * F, h = g));
  const O = h ? S + Q : S, V = g ? P + K : P;
  return {
    width: B + (h ? -Q : Q),
    height: D + (g ? -K : K),
    x: c[0] * Q * (h ? -1 : 1) + O,
    y: c[1] * K * (g ? -1 : 1) + V
  };
}
const Zg = { width: 0, height: 0, x: 0, y: 0 }, r_ = {
  ...Zg,
  pointerX: 0,
  pointerY: 0,
  aspectRatio: 1
};
function o_(t, r, i) {
  const l = r.position.x + t.position.x, a = r.position.y + t.position.y, c = t.measured.width ?? 0, f = t.measured.height ?? 0, p = i[0] * c, h = i[1] * f;
  return [
    [l - p, a - h],
    [l + c - p, a + f - h]
  ];
}
function i_({ domNode: t, nodeId: r, getStoreItems: i, onChange: l, onEnd: a }) {
  const c = kt(t);
  let f = {
    controlDirection: Xp("bottom-right"),
    boundaries: {
      minWidth: 0,
      minHeight: 0,
      maxWidth: Number.MAX_VALUE,
      maxHeight: Number.MAX_VALUE
    },
    resizeDirection: void 0,
    keepAspectRatio: !1
  };
  function p({ controlPosition: g, boundaries: m, keepAspectRatio: v, resizeDirection: y, onResizeStart: _, onResize: x, onResizeEnd: N, shouldResize: E }) {
    let M = { ...Zg }, T = { ...r_ };
    f = {
      boundaries: m,
      resizeDirection: y,
      keepAspectRatio: v,
      controlDirection: Xp(g)
    };
    let S, P = null, B = [], D, F, Q;
    const K = Yh().on("start", (ee) => {
      const { nodeLookup: J, transform: A, snapGrid: W, snapToGrid: k, nodeOrigin: $, paneDomNode: O } = i();
      if (S = J.get(r), !S)
        return;
      P = O?.getBoundingClientRect() ?? null;
      const { xSnapped: V, ySnapped: b } = di(ee.sourceEvent, {
        transform: A,
        snapGrid: W,
        snapToGrid: k,
        containerBounds: P
      });
      M = {
        width: S.measured.width ?? 0,
        height: S.measured.height ?? 0,
        x: S.position.x ?? 0,
        y: S.position.y ?? 0
      }, T = {
        ...M,
        pointerX: V,
        pointerY: b,
        aspectRatio: M.width / M.height
      }, D = void 0, F = kr(S.extent) ? S.extent : void 0, S.parentId && (S.extent === "parent" || S.expandParent) && (D = J.get(S.parentId)), D && S.extent === "parent" && (F = [
        [0, 0],
        [D.measured.width, D.measured.height]
      ]), B = [], Q = void 0;
      for (const [j, U] of J)
        if (U.parentId === r && (B.push({
          id: j,
          position: { ...U.position },
          extent: U.extent
        }), U.extent === "parent" || U.expandParent)) {
          const C = o_(U, S, U.origin ?? $);
          Q ? Q = [
            [Math.min(C[0][0], Q[0][0]), Math.min(C[0][1], Q[0][1])],
            [Math.max(C[1][0], Q[1][0]), Math.max(C[1][1], Q[1][1])]
          ] : Q = C;
        }
      _?.(ee, { ...M });
    }).on("drag", (ee) => {
      const { transform: J, snapGrid: A, snapToGrid: W, nodeOrigin: k } = i(), $ = di(ee.sourceEvent, {
        transform: J,
        snapGrid: A,
        snapToGrid: W,
        containerBounds: P
      }), O = [];
      if (!S)
        return;
      const { x: V, y: b, width: j, height: U } = M, C = {}, H = S.origin ?? k, { width: ie, height: re, x: ae, y: ce } = n_(T, f.controlDirection, $, f.boundaries, f.keepAspectRatio, H, F, Q), ue = ie !== j, q = re !== U, le = ae !== V && ue, we = ce !== b && q;
      if (!le && !we && !ue && !q)
        return;
      const Se = {
        prevValues: { ...M },
        startX: T.x,
        startY: T.y,
        childNodes: B.map((Ce) => ({
          ...Ce,
          position: { ...Ce.position }
        }))
      };
      if ((le || we || H[0] === 1 || H[1] === 1) && (C.x = le ? ae : M.x, C.y = we ? ce : M.y, M.x = C.x, M.y = C.y, B.length > 0)) {
        const Ce = ae - V, ze = ce - b;
        for (const Ve of B)
          Ve.position = {
            x: Ve.position.x - Ce + H[0] * (ie - j),
            y: Ve.position.y - ze + H[1] * (re - U)
          }, O.push(Ve);
      }
      if ((ue || q) && (C.width = ue && (!f.resizeDirection || f.resizeDirection === "horizontal") ? ie : M.width, C.height = q && (!f.resizeDirection || f.resizeDirection === "vertical") ? re : M.height, M.width = C.width, M.height = C.height), D && S.expandParent) {
        const Ce = H[0] * (C.width ?? 0);
        C.x && C.x < Ce && (M.x = Ce, T.x = T.x - (C.x - Ce));
        const ze = H[1] * (C.height ?? 0);
        C.y && C.y < ze && (M.y = ze, T.y = T.y - (C.y - ze));
      }
      const me = t_({
        width: M.width,
        prevWidth: j,
        height: M.height,
        prevHeight: U,
        affectsX: f.controlDirection.affectsX,
        affectsY: f.controlDirection.affectsY
      }), ve = { ...M, direction: me };
      if (E?.(ee, ve) === !1) {
        M = Se.prevValues, T.x = Se.startX, T.y = Se.startY, B.forEach((Ce, ze) => {
          Ce.position = Se.childNodes[ze].position;
        });
        return;
      }
      x?.(ee, ve), l(C, O);
    }).on("end", (ee) => {
      N?.(ee, { ...M }), a?.({ ...M });
    });
    c.call(K);
  }
  function h() {
    c.on(".drag", null);
  }
  return {
    update: p,
    destroy: h
  };
}
var Vu = { exports: {} }, Bu = {}, Uu = { exports: {} }, Wu = {};
/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Zp;
function s_() {
  if (Zp) return Wu;
  Zp = 1;
  var t = Si();
  function r(v, y) {
    return v === y && (v !== 0 || 1 / v === 1 / y) || v !== v && y !== y;
  }
  var i = typeof Object.is == "function" ? Object.is : r, l = t.useState, a = t.useEffect, c = t.useLayoutEffect, f = t.useDebugValue;
  function p(v, y) {
    var _ = y(), x = l({ inst: { value: _, getSnapshot: y } }), N = x[0].inst, E = x[1];
    return c(
      function() {
        N.value = _, N.getSnapshot = y, h(N) && E({ inst: N });
      },
      [v, _, y]
    ), a(
      function() {
        return h(N) && E({ inst: N }), v(function() {
          h(N) && E({ inst: N });
        });
      },
      [v]
    ), f(_), _;
  }
  function h(v) {
    var y = v.getSnapshot;
    v = v.value;
    try {
      var _ = y();
      return !i(v, _);
    } catch {
      return !0;
    }
  }
  function g(v, y) {
    return y();
  }
  var m = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? g : p;
  return Wu.useSyncExternalStore = t.useSyncExternalStore !== void 0 ? t.useSyncExternalStore : m, Wu;
}
var Qp;
function l_() {
  return Qp || (Qp = 1, Uu.exports = s_()), Uu.exports;
}
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Kp;
function a_() {
  if (Kp) return Bu;
  Kp = 1;
  var t = Si(), r = l_();
  function i(g, m) {
    return g === m && (g !== 0 || 1 / g === 1 / m) || g !== g && m !== m;
  }
  var l = typeof Object.is == "function" ? Object.is : i, a = r.useSyncExternalStore, c = t.useRef, f = t.useEffect, p = t.useMemo, h = t.useDebugValue;
  return Bu.useSyncExternalStoreWithSelector = function(g, m, v, y, _) {
    var x = c(null);
    if (x.current === null) {
      var N = { hasValue: !1, value: null };
      x.current = N;
    } else N = x.current;
    x = p(
      function() {
        function M(D) {
          if (!T) {
            if (T = !0, S = D, D = y(D), _ !== void 0 && N.hasValue) {
              var F = N.value;
              if (_(F, D))
                return P = F;
            }
            return P = D;
          }
          if (F = P, l(S, D)) return F;
          var Q = y(D);
          return _ !== void 0 && _(F, Q) ? (S = D, F) : (S = D, P = Q);
        }
        var T = !1, S, P, B = v === void 0 ? null : v;
        return [
          function() {
            return M(m());
          },
          B === null ? void 0 : function() {
            return M(B());
          }
        ];
      },
      [m, v, y, _]
    );
    var E = a(g, x[0], x[1]);
    return f(
      function() {
        N.hasValue = !0, N.value = E;
      },
      [E]
    ), h(E), E;
  }, Bu;
}
var Gp;
function u_() {
  return Gp || (Gp = 1, Vu.exports = a_()), Vu.exports;
}
var c_ = u_();
const f_ = /* @__PURE__ */ Ih(c_), d_ = {}, qp = (t) => {
  let r;
  const i = /* @__PURE__ */ new Set(), l = (m, v) => {
    const y = typeof m == "function" ? m(r) : m;
    if (!Object.is(y, r)) {
      const _ = r;
      r = v ?? (typeof y != "object" || y === null) ? y : Object.assign({}, r, y), i.forEach((x) => x(r, _));
    }
  }, a = () => r, h = { setState: l, getState: a, getInitialState: () => g, subscribe: (m) => (i.add(m), () => i.delete(m)), destroy: () => {
    (d_ ? "production" : void 0) !== "production" && console.warn(
      "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
    ), i.clear();
  } }, g = r = t(l, a, h);
  return h;
}, p_ = (t) => t ? qp(t) : qp, { useDebugValue: h_ } = ky, { useSyncExternalStoreWithSelector: g_ } = f_, m_ = (t) => t;
function Qg(t, r = m_, i) {
  const l = g_(
    t.subscribe,
    t.getState,
    t.getServerState || t.getInitialState,
    r,
    i
  );
  return h_(l), l;
}
const Jp = (t, r) => {
  const i = p_(t), l = (a, c = r) => Qg(i, a, c);
  return Object.assign(l, i), l;
}, y_ = (t, r) => t ? Jp(t, r) : Jp;
function He(t, r) {
  if (Object.is(t, r))
    return !0;
  if (typeof t != "object" || t === null || typeof r != "object" || r === null)
    return !1;
  if (t instanceof Map && r instanceof Map) {
    if (t.size !== r.size) return !1;
    for (const [l, a] of t)
      if (!Object.is(a, r.get(l)))
        return !1;
    return !0;
  }
  if (t instanceof Set && r instanceof Set) {
    if (t.size !== r.size) return !1;
    for (const l of t)
      if (!r.has(l))
        return !1;
    return !0;
  }
  const i = Object.keys(t);
  if (i.length !== Object.keys(r).length)
    return !1;
  for (const l of i)
    if (!Object.prototype.hasOwnProperty.call(r, l) || !Object.is(t[l], r[l]))
      return !1;
  return !0;
}
Th();
const Pl = Y.createContext(null), v_ = Pl.Provider, Kg = Ut.error001("react");
function Me(t, r) {
  const i = Y.useContext(Pl);
  if (i === null)
    throw new Error(Kg);
  return Qg(i, t, r);
}
function Re() {
  const t = Y.useContext(Pl);
  if (t === null)
    throw new Error(Kg);
  return Y.useMemo(() => ({
    getState: t.getState,
    setState: t.setState,
    subscribe: t.subscribe
  }), [t]);
}
const eh = { display: "none" }, w_ = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  border: 0,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0px, 0px, 0px, 0px)",
  clipPath: "inset(100%)"
}, Gg = "react-flow__node-desc", qg = "react-flow__edge-desc", x_ = "react-flow__aria-live", __ = (t) => t.ariaLiveMessage, S_ = (t) => t.ariaLabelConfig;
function k_({ rfId: t }) {
  const r = Me(__);
  return R.jsx("div", { id: `${x_}-${t}`, "aria-live": "assertive", "aria-atomic": "true", style: w_, children: r });
}
function E_({ rfId: t, disableKeyboardA11y: r }) {
  const i = Me(S_);
  return R.jsxs(R.Fragment, { children: [R.jsx("div", { id: `${Gg}-${t}`, style: eh, children: r ? i["node.a11yDescription.default"] : i["node.a11yDescription.keyboardDisabled"] }), R.jsx("div", { id: `${qg}-${t}`, style: eh, children: i["edge.a11yDescription.default"] }), !r && R.jsx(k_, { rfId: t })] });
}
const Il = Y.forwardRef(({ position: t = "top-left", children: r, className: i, style: l, ...a }, c) => {
  const f = `${t}`.split("-");
  return R.jsx("div", { className: We(["react-flow__panel", i, ...f]), style: l, ref: c, ...a, children: r });
});
Il.displayName = "Panel";
const th = "https://reactflow.dev?utm_source=attribution";
function C_({ proOptions: t, position: r = "bottom-right" }) {
  return Y.useEffect(() => {
  }, []), t?.hideAttribution ? null : R.jsx(Il, { position: r, className: "react-flow__attribution", "data-message": `Please only hide this attribution when you are subscribed to React Flow Pro: ${th}`, children: R.jsx("a", { href: th, target: "_blank", rel: "noopener noreferrer", "aria-label": "React Flow attribution", children: "React Flow" }) });
}
const N_ = (t) => {
  const r = [], i = [];
  for (const [, l] of t.nodeLookup)
    l.selected && r.push(l.internals.userNode);
  for (const [, l] of t.edgeLookup)
    l.selected && i.push(l);
  return { selectedNodes: r, selectedEdges: i };
}, el = (t) => t.id;
function M_(t, r) {
  return He(t.selectedNodes.map(el), r.selectedNodes.map(el)) && He(t.selectedEdges.map(el), r.selectedEdges.map(el));
}
function z_({ onSelectionChange: t }) {
  const r = Re(), { selectedNodes: i, selectedEdges: l } = Me(N_, M_);
  return Y.useEffect(() => {
    const a = { nodes: i, edges: l };
    t?.(a), r.getState().onSelectionChangeHandlers.forEach((c) => c(a));
  }, [i, l, t]), null;
}
const P_ = (t) => !!t.onSelectionChangeHandlers;
function I_({ onSelectionChange: t }) {
  const r = Me(P_);
  return t || r ? R.jsx(z_, { onSelectionChange: t }) : null;
}
const Jg = [0, 0], T_ = { x: 0, y: 0, zoom: 1 }, b_ = [
  "nodes",
  "edges",
  "defaultNodes",
  "defaultEdges",
  "onConnect",
  "onConnectStart",
  "onConnectEnd",
  "onClickConnectStart",
  "onClickConnectEnd",
  "nodesDraggable",
  "autoPanOnNodeFocus",
  "nodesConnectable",
  "nodesFocusable",
  "edgesFocusable",
  "edgesReconnectable",
  "elevateNodesOnSelect",
  "elevateEdgesOnSelect",
  "minZoom",
  "maxZoom",
  "nodeExtent",
  "onNodesChange",
  "onEdgesChange",
  "elementsSelectable",
  "connectionMode",
  "snapGrid",
  "snapToGrid",
  "translateExtent",
  "connectOnClick",
  "defaultEdgeOptions",
  "fitView",
  "fitViewOptions",
  "onNodesDelete",
  "onEdgesDelete",
  "onDelete",
  "onNodeDrag",
  "onNodeDragStart",
  "onNodeDragStop",
  "onSelectionDrag",
  "onSelectionDragStart",
  "onSelectionDragStop",
  "onMoveStart",
  "onMove",
  "onMoveEnd",
  "noPanClassName",
  "nodeOrigin",
  "autoPanOnConnect",
  "autoPanOnNodeDrag",
  "onError",
  "connectionRadius",
  "isValidConnection",
  "selectNodesOnDrag",
  "nodeDragThreshold",
  "connectionDragThreshold",
  "onBeforeDelete",
  "debug",
  "autoPanSpeed",
  "ariaLabelConfig",
  "zIndexMode"
], nh = [...b_, "rfId"], R_ = (t) => ({
  setNodes: t.setNodes,
  setEdges: t.setEdges,
  setMinZoom: t.setMinZoom,
  setMaxZoom: t.setMaxZoom,
  setTranslateExtent: t.setTranslateExtent,
  setNodeExtent: t.setNodeExtent,
  reset: t.reset,
  setDefaultNodesAndEdges: t.setDefaultNodesAndEdges
}), rh = {
  /*
   * these are values that are also passed directly to other components
   * than the StoreUpdater. We can reduce the number of setStore calls
   * by setting the same values here as prev fields.
   */
  translateExtent: yi,
  nodeOrigin: Jg,
  minZoom: 0.5,
  maxZoom: 2,
  elementsSelectable: !0,
  noPanClassName: "nopan",
  rfId: "1"
};
function D_(t) {
  const { setNodes: r, setEdges: i, setMinZoom: l, setMaxZoom: a, setTranslateExtent: c, setNodeExtent: f, reset: p, setDefaultNodesAndEdges: h } = Me(R_, He), g = Re();
  Y.useEffect(() => (h(t.defaultNodes, t.defaultEdges), () => {
    m.current = rh, p();
  }), []);
  const m = Y.useRef(rh);
  return Y.useEffect(
    () => {
      for (const v of nh) {
        const y = t[v], _ = m.current[v];
        y !== _ && (typeof t[v] > "u" || (v === "nodes" ? r(y) : v === "edges" ? i(y) : v === "minZoom" ? l(y) : v === "maxZoom" ? a(y) : v === "translateExtent" ? c(y) : v === "nodeExtent" ? f(y) : v === "ariaLabelConfig" ? g.setState({ ariaLabelConfig: y1(y) }) : v === "fitView" ? g.setState({ fitViewQueued: y }) : v === "fitViewOptions" ? g.setState({ fitViewOptions: y }) : g.setState({ [v]: y })));
      }
      m.current = t;
    },
    // Only re-run the effect if one of the fields we track changes
    nh.map((v) => t[v])
  ), null;
}
function oh() {
  return typeof window > "u" || !window.matchMedia ? null : window.matchMedia("(prefers-color-scheme: dark)");
}
function L_(t) {
  const [r, i] = Y.useState(t === "system" ? null : t);
  return Y.useEffect(() => {
    if (t !== "system") {
      i(t);
      return;
    }
    const l = oh(), a = () => i(l?.matches ? "dark" : "light");
    return a(), l?.addEventListener("change", a), () => {
      l?.removeEventListener("change", a);
    };
  }, [t]), r !== null ? r : oh()?.matches ? "dark" : "light";
}
const ih = typeof document < "u" ? document : null;
function _i(t = null, r = { target: ih, actInsideInputWithModifier: !0 }) {
  const [i, l] = Y.useState(!1), a = Y.useRef(!1), c = Y.useRef(/* @__PURE__ */ new Set([])), [f, p] = Y.useMemo(() => {
    if (t !== null) {
      const g = (Array.isArray(t) ? t : [t]).filter((v) => typeof v == "string").map((v) => v.replace(/\+/g, `
`).replace(`

`, `
+`).split(`
`)), m = g.reduce((v, y) => v.concat(...y), []);
      return [g, m];
    }
    return [[], []];
  }, [t]);
  return Y.useEffect(() => {
    const h = r?.target ?? ih, g = r?.actInsideInputWithModifier ?? !0;
    if (t !== null) {
      const m = (_) => {
        if (a.current = _.ctrlKey || _.metaKey || _.shiftKey || _.altKey, (!a.current || a.current && !g) && bg(_))
          return !1;
        const N = lh(_.code, p);
        if (c.current.add(_[N]), sh(f, c.current, !1)) {
          const E = _.composedPath?.()?.[0] || _.target, M = E?.nodeName === "BUTTON" || E?.nodeName === "A";
          r.preventDefault !== !1 && (a.current || !M) && _.preventDefault(), l(!0);
        }
      }, v = (_) => {
        const x = lh(_.code, p);
        sh(f, c.current, !0) ? (l(!1), c.current.clear()) : c.current.delete(_[x]), _.key === "Meta" && c.current.clear(), a.current = !1;
      }, y = () => {
        c.current.clear(), l(!1);
      };
      return h?.addEventListener("keydown", m), h?.addEventListener("keyup", v), window.addEventListener("blur", y), window.addEventListener("contextmenu", y), () => {
        h?.removeEventListener("keydown", m), h?.removeEventListener("keyup", v), window.removeEventListener("blur", y), window.removeEventListener("contextmenu", y);
      };
    }
  }, [t, l]), i;
}
function sh(t, r, i) {
  return t.filter((l) => i || l.length === r.size).some((l) => l.every((a) => r.has(a)));
}
function lh(t, r) {
  return r.includes(t) ? "code" : "key";
}
const $_ = () => {
  const t = Re();
  return Y.useMemo(() => ({
    zoomIn: async (r) => {
      const { panZoom: i } = t.getState();
      return i ? i.scaleBy(1.2, r) : !1;
    },
    zoomOut: async (r) => {
      const { panZoom: i } = t.getState();
      return i ? i.scaleBy(1 / 1.2, r) : !1;
    },
    zoomTo: async (r, i) => {
      const { panZoom: l } = t.getState();
      return l ? l.scaleTo(r, i) : !1;
    },
    getZoom: () => t.getState().transform[2],
    setViewport: async (r, i) => {
      const { transform: [l, a, c], panZoom: f } = t.getState();
      return f ? (await f.setViewport({
        x: r.x ?? l,
        y: r.y ?? a,
        zoom: r.zoom ?? c
      }, i), !0) : !1;
    },
    getViewport: () => {
      const [r, i, l] = t.getState().transform;
      return { x: r, y: i, zoom: l };
    },
    setCenter: async (r, i, l) => t.getState().setCenter(r, i, l),
    fitBounds: async (r, i) => {
      const { width: l, height: a, minZoom: c, maxZoom: f, panZoom: p } = t.getState(), h = Cc(r, l, a, c, f, i?.padding ?? 0.1);
      return p ? (await p.setViewport(h, {
        duration: i?.duration,
        ease: i?.ease,
        interpolate: i?.interpolate
      }), !0) : !1;
    },
    screenToFlowPosition: (r, i = {}) => {
      const { transform: l, snapGrid: a, snapToGrid: c, domNode: f } = t.getState();
      if (!f)
        return r;
      const { x: p, y: h } = f.getBoundingClientRect(), g = {
        x: r.x - p,
        y: r.y - h
      }, m = i.snapGrid ?? a, v = i.snapToGrid ?? c;
      return zi(g, l, v, m);
    },
    flowToScreenPosition: (r) => {
      const { transform: i, domNode: l } = t.getState();
      if (!l)
        return r;
      const { x: a, y: c } = l.getBoundingClientRect(), f = ho(r, i);
      return {
        x: f.x + a,
        y: f.y + c
      };
    }
  }), []);
};
function em(t, r) {
  const i = [], l = /* @__PURE__ */ new Map(), a = [];
  for (const c of t)
    if (c.type === "add") {
      a.push(c);
      continue;
    } else if (c.type === "remove" || c.type === "replace")
      l.set(c.id, [c]);
    else {
      const f = l.get(c.id);
      f ? f.push(c) : l.set(c.id, [c]);
    }
  for (const c of r) {
    const f = l.get(c.id);
    if (!f) {
      i.push(c);
      continue;
    }
    if (f[0].type === "remove")
      continue;
    if (f[0].type === "replace") {
      i.push({ ...f[0].item });
      continue;
    }
    const p = { ...c };
    for (const h of f)
      O_(h, p);
    i.push(p);
  }
  return a.length && a.forEach((c) => {
    c.index !== void 0 ? i.splice(c.index, 0, { ...c.item }) : i.push({ ...c.item });
  }), i;
}
function O_(t, r) {
  switch (t.type) {
    case "select": {
      r.selected = t.selected;
      break;
    }
    case "position": {
      typeof t.position < "u" && (r.position = t.position), typeof t.dragging < "u" && (r.dragging = t.dragging);
      break;
    }
    case "dimensions": {
      typeof t.dimensions < "u" && (r.measured = {
        ...t.dimensions
      }, t.setAttributes && ((t.setAttributes === !0 || t.setAttributes === "width") && (r.width = t.dimensions.width), (t.setAttributes === !0 || t.setAttributes === "height") && (r.height = t.dimensions.height))), typeof t.resizing == "boolean" && (r.resizing = t.resizing);
      break;
    }
  }
}
function bc(t, r) {
  return em(t, r);
}
function tm(t, r) {
  return em(t, r);
}
function hr(t, r) {
  return {
    id: t,
    type: "select",
    selected: r
  };
}
function no(t, r = /* @__PURE__ */ new Set()) {
  const i = [];
  for (const [l, a] of t) {
    const c = r.has(l);
    !(a.selected === void 0 && !c) && a.selected !== c && i.push(hr(a.id, c));
  }
  return i;
}
function ah({ items: t = [], lookup: r }) {
  const i = [], l = new Map(t.map((a) => [a.id, a]));
  for (const [a, c] of t.entries()) {
    const f = r.get(c.id), p = f?.internals?.userNode ?? f;
    p !== void 0 && p !== c && i.push({ id: c.id, item: c, type: "replace" }), p === void 0 && i.push({ item: c, type: "add", index: a });
  }
  for (const [a] of r)
    l.get(a) === void 0 && i.push({ id: a, type: "remove" });
  return i;
}
function uh(t) {
  return {
    id: t.id,
    type: "remove"
  };
}
const A_ = Mg();
function j_(t, r, i = {}) {
  return k1(t, r, {
    ...i,
    onError: i.onError ?? A_
  });
}
const ch = (t) => a1(t), H_ = (t) => Sg(t);
function nm(t) {
  return Y.forwardRef(t);
}
const rm = typeof window < "u" ? Y.useLayoutEffect : Y.useEffect;
function fh(t) {
  const [r, i] = Y.useState(BigInt(0)), [l] = Y.useState(() => F_(() => i((a) => a + BigInt(1))));
  return rm(() => {
    const a = l.get();
    a.length && (t(a), l.reset());
  }, [r]), l;
}
function F_(t) {
  let r = [];
  return {
    get: () => r,
    reset: () => {
      r = [];
    },
    push: (i) => {
      r.push(i), t();
    }
  };
}
const om = Y.createContext(null);
function V_({ children: t }) {
  const r = Re(), i = Y.useCallback((p) => {
    const { nodes: h = [], setNodes: g, hasDefaultNodes: m, onNodesChange: v, nodeLookup: y, fitViewQueued: _, onNodesChangeMiddlewareMap: x } = r.getState();
    let N = h;
    for (const M of p)
      N = typeof M == "function" ? M(N) : M;
    let E = ah({
      items: N,
      lookup: y
    });
    for (const M of x.values())
      E = M(E);
    m && g(N), E.length > 0 ? v?.(E) : _ && window.requestAnimationFrame(() => {
      const { fitViewQueued: M, nodes: T, setNodes: S } = r.getState();
      M && S(T);
    });
  }, []), l = fh(i), a = Y.useCallback((p) => {
    const { edges: h = [], setEdges: g, hasDefaultEdges: m, onEdgesChange: v, edgeLookup: y } = r.getState();
    let _ = h;
    for (const x of p)
      _ = typeof x == "function" ? x(_) : x;
    m ? g(_) : v && v(ah({
      items: _,
      lookup: y
    }));
  }, []), c = fh(a), f = Y.useMemo(() => ({ nodeQueue: l, edgeQueue: c }), []);
  return R.jsx(om.Provider, { value: f, children: t });
}
function B_() {
  const t = Y.useContext(om);
  if (!t)
    throw new Error("useBatchContext must be used within a BatchProvider");
  return t;
}
const U_ = (t) => !!t.panZoom;
function Tl() {
  const t = $_(), r = Re(), i = B_(), l = Me(U_), a = Y.useMemo(() => {
    const c = (v) => r.getState().nodeLookup.get(v), f = (v) => {
      i.nodeQueue.push(v);
    }, p = (v) => {
      i.edgeQueue.push(v);
    }, h = (v) => {
      const { nodeLookup: y, nodeOrigin: _ } = r.getState(), x = ch(v) ? v : y.get(v.id), N = x.parentId ? Pg(x.position, x.measured, x.parentId, y, _) : x.position, E = {
        ...x,
        position: N,
        width: x.measured?.width ?? x.width,
        height: x.measured?.height ?? x.height
      };
      return wi(E, x.parentId ? void 0 : _);
    }, g = (v, y, _ = { replace: !1 }) => {
      f((x) => x.map((N) => {
        if (N.id === v) {
          const E = typeof y == "function" ? y(N) : y;
          return _.replace && ch(E) ? E : { ...N, ...E };
        }
        return N;
      }));
    }, m = (v, y, _ = { replace: !1 }) => {
      p((x) => x.map((N) => {
        if (N.id === v) {
          const E = typeof y == "function" ? y(N) : y;
          return _.replace && H_(E) ? E : { ...N, ...E };
        }
        return N;
      }));
    };
    return {
      getNodes: () => r.getState().nodes.map((v) => ({ ...v })),
      getNode: (v) => c(v)?.internals.userNode,
      getInternalNode: c,
      getEdges: () => {
        const { edges: v = [] } = r.getState();
        return v.map((y) => ({ ...y }));
      },
      getEdge: (v) => r.getState().edgeLookup.get(v),
      setNodes: f,
      setEdges: p,
      addNodes: (v) => {
        const y = Array.isArray(v) ? v : [v];
        i.nodeQueue.push((_) => [..._, ...y]);
      },
      addEdges: (v) => {
        const y = Array.isArray(v) ? v : [v];
        i.edgeQueue.push((_) => [..._, ...y]);
      },
      toObject: () => {
        const { nodes: v = [], edges: y = [], transform: _ } = r.getState(), [x, N, E] = _;
        return {
          nodes: v.map((M) => ({ ...M })),
          edges: y.map((M) => ({ ...M })),
          viewport: {
            x,
            y: N,
            zoom: E
          }
        };
      },
      deleteElements: async ({ nodes: v = [], edges: y = [] }) => {
        const { nodes: _, edges: x, onNodesDelete: N, onEdgesDelete: E, triggerNodeChanges: M, triggerEdgeChanges: T, onDelete: S, onBeforeDelete: P } = r.getState(), { nodes: B, edges: D } = await p1({
          nodesToRemove: v,
          edgesToRemove: y,
          nodes: _,
          edges: x,
          onBeforeDelete: P
        }), F = D.length > 0, Q = B.length > 0;
        if (F) {
          const K = D.map(uh);
          E?.(D), T(K);
        }
        if (Q) {
          const K = B.map(uh);
          N?.(B), M(K);
        }
        return (Q || F) && S?.({ nodes: B, edges: D }), { deletedNodes: B, deletedEdges: D };
      },
      /**
       * Partial is defined as "the 2 nodes/areas are intersecting partially".
       * If a is contained in b or b is contained in a, they are both
       * considered fully intersecting.
       */
      getIntersectingNodes: (v, y = !0, _) => {
        const x = Lp(v), N = x ? v : h(v), E = _ !== void 0;
        if (!N)
          return [];
        const { nodeOrigin: M } = r.getState();
        return (_ || r.getState().nodes).filter((T) => {
          const S = r.getState().nodeLookup.get(T.id);
          if (S && !x && (T.id === v.id || !S.internals.positionAbsolute))
            return !1;
          const P = wi(E ? T : S, M), B = yl(P, N);
          return y && B > 0 || B >= P.width * P.height || B >= N.width * N.height;
        });
      },
      isNodeIntersecting: (v, y, _ = !0) => {
        const N = Lp(v) ? v : h(v);
        if (!N)
          return !1;
        const E = yl(N, y);
        return _ && E > 0 || E >= y.width * y.height || E >= N.width * N.height;
      },
      updateNode: g,
      updateNodeData: (v, y, _ = { replace: !1 }) => {
        g(v, (x) => {
          const N = typeof y == "function" ? y(x) : y;
          return _.replace ? { ...x, data: N } : { ...x, data: { ...x.data, ...N } };
        }, _);
      },
      updateEdge: m,
      updateEdgeData: (v, y, _ = { replace: !1 }) => {
        m(v, (x) => {
          const N = typeof y == "function" ? y(x) : y;
          return _.replace ? { ...x, data: N } : { ...x, data: { ...x.data, ...N } };
        }, _);
      },
      getNodesBounds: (v) => {
        const { nodeLookup: y, nodeOrigin: _ } = r.getState();
        return u1(v, { nodeLookup: y, nodeOrigin: _ });
      },
      getHandleConnections: ({ type: v, id: y, nodeId: _ }) => Array.from(r.getState().connectionLookup.get(`${_}-${v}${y ? `-${y}` : ""}`)?.values() ?? []),
      getNodeConnections: ({ type: v, handleId: y, nodeId: _ }) => Array.from(r.getState().connectionLookup.get(`${_}${v ? y ? `-${v}-${y}` : `-${v}` : ""}`)?.values() ?? []),
      fitView: async (v) => {
        const y = r.getState().fitViewResolver ?? m1();
        return r.setState({ fitViewQueued: !0, fitViewOptions: v, fitViewResolver: y }), i.nodeQueue.push((_) => [..._]), y.promise;
      }
    };
  }, []);
  return Y.useMemo(() => ({
    ...a,
    ...t,
    viewportInitialized: l
  }), [l]);
}
const dh = (t) => t.selected, W_ = typeof window < "u" ? window : void 0;
function X_({ deleteKeyCode: t, multiSelectionKeyCode: r }) {
  const i = Re(), { deleteElements: l } = Tl(), a = _i(t, { actInsideInputWithModifier: !1 }), c = _i(r, { target: W_ });
  Y.useEffect(() => {
    if (a) {
      const { edges: f, nodes: p } = i.getState();
      l({ nodes: p.filter(dh), edges: f.filter(dh) }), i.setState({ nodesSelectionActive: !1 });
    }
  }, [a]), Y.useEffect(() => {
    i.setState({ multiSelectionActive: c });
  }, [c]);
}
function Y_(t) {
  const r = Re();
  Y.useEffect(() => {
    const i = () => {
      if (!t.current || !(t.current.checkVisibility?.() ?? !0))
        return !1;
      const l = Nc(t.current);
      (l.height === 0 || l.width === 0) && r.getState().onError?.("004", Ut.error004()), r.setState({ width: l.width || 500, height: l.height || 500 });
    };
    if (t.current) {
      i(), window.addEventListener("resize", i);
      const l = new ResizeObserver(() => i());
      return l.observe(t.current), () => {
        window.removeEventListener("resize", i), l.disconnect();
      };
    }
  }, []);
}
const bl = {
  position: "absolute",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0
}, Z_ = (t) => ({
  userSelectionActive: t.userSelectionActive,
  lib: t.lib,
  connectionInProgress: t.connection.inProgress
});
function Q_({ onPaneContextMenu: t, zoomOnScroll: r = !0, zoomOnPinch: i = !0, panOnScroll: l = !1, panActivationKeyPressed: a, panOnScrollSpeed: c = 0.5, panOnScrollMode: f = vr.Free, zoomOnDoubleClick: p = !0, panOnDrag: h = !0, defaultViewport: g, translateExtent: m, minZoom: v, maxZoom: y, zoomActivationKeyCode: _, preventScrolling: x = !0, children: N, noWheelClassName: E, noPanClassName: M, onViewportChange: T, isControlledViewport: S, paneClickDistance: P, selectionOnDrag: B }) {
  const D = Re(), F = Y.useRef(null), { userSelectionActive: Q, lib: K, connectionInProgress: ee } = Me(Z_, He), J = _i(_), A = Y.useRef();
  Y_(F);
  const W = Y.useCallback((k) => {
    T?.({ x: k[0], y: k[1], zoom: k[2] }), S || D.setState({ transform: k });
  }, [T, S]);
  return Y.useEffect(() => {
    if (F.current) {
      A.current = e_({
        domNode: F.current,
        minZoom: v,
        maxZoom: y,
        translateExtent: m,
        viewport: g,
        onDraggingChange: (V) => D.setState((b) => b.paneDragging === V ? b : { paneDragging: V }),
        onPanZoomStart: (V, b) => {
          const { onViewportChangeStart: j, onMoveStart: U } = D.getState();
          U?.(V, b), j?.(b);
        },
        onPanZoom: (V, b) => {
          const { onViewportChange: j, onMove: U } = D.getState();
          U?.(V, b), j?.(b);
        },
        onPanZoomEnd: (V, b) => {
          const { onViewportChangeEnd: j, onMoveEnd: U } = D.getState();
          U?.(V, b), j?.(b);
        }
      });
      const { x: k, y: $, zoom: O } = A.current.getViewport();
      return D.setState({
        panZoom: A.current,
        transform: [k, $, O],
        domNode: F.current.closest(".react-flow")
      }), () => {
        A.current?.destroy();
      };
    }
  }, []), Y.useEffect(() => {
    A.current?.update({
      onPaneContextMenu: t,
      zoomOnScroll: r,
      zoomOnPinch: i,
      panOnScroll: l,
      panActivationKeyPressed: a,
      panOnScrollSpeed: c,
      panOnScrollMode: f,
      zoomOnDoubleClick: p,
      panOnDrag: h,
      zoomActivationKeyPressed: J,
      preventScrolling: x,
      noPanClassName: M,
      userSelectionActive: Q,
      noWheelClassName: E,
      lib: K,
      onTransformChange: W,
      connectionInProgress: ee,
      selectionOnDrag: B,
      paneClickDistance: P
    });
  }, [
    t,
    r,
    i,
    l,
    a,
    c,
    f,
    p,
    h,
    J,
    x,
    M,
    Q,
    E,
    K,
    W,
    ee,
    B,
    P
  ]), R.jsx("div", { className: "react-flow__renderer", ref: F, style: bl, children: N });
}
const K_ = (t) => ({
  userSelectionActive: t.userSelectionActive,
  userSelectionRect: t.userSelectionRect
});
function G_() {
  const { userSelectionActive: t, userSelectionRect: r } = Me(K_, He);
  return t && r ? R.jsx("div", { className: "react-flow__selection react-flow__container", style: {
    width: r.width,
    height: r.height,
    transform: `translate(${r.x}px, ${r.y}px)`
  } }) : null;
}
const Xu = (t, r) => (i) => {
  i.target === r.current && t?.(i);
}, q_ = (t) => ({
  userSelectionActive: t.userSelectionActive,
  elementsSelectable: t.elementsSelectable,
  dragging: t.paneDragging,
  panBy: t.panBy,
  autoPanSpeed: t.autoPanSpeed
});
function J_({ isSelecting: t, selectionKeyPressed: r, selectionMode: i = vi.Full, panOnDrag: l, autoPanOnSelection: a, paneClickDistance: c, selectionOnDrag: f, onSelectionStart: p, onSelectionEnd: h, onPaneClick: g, onPaneContextMenu: m, onPaneScroll: v, onPaneMouseEnter: y, onPaneMouseMove: _, onPaneMouseLeave: x, children: N }) {
  const E = Y.useRef(0), M = Re(), { userSelectionActive: T, elementsSelectable: S, dragging: P, panBy: B, autoPanSpeed: D } = Me(q_, He), F = S && (t || T), Q = Y.useRef(null), K = Y.useRef(), ee = Y.useRef(/* @__PURE__ */ new Set()), J = Y.useRef(/* @__PURE__ */ new Set()), A = Y.useRef(!1), W = Y.useRef(!1), k = Y.useRef({ x: 0, y: 0 }), $ = Y.useRef(!1), O = (q) => {
    if (W.current || A.current || M.getState().connection.inProgress) {
      W.current = !1, A.current = !1;
      return;
    }
    const { connectionClickStartHandle: le, connection: we, onClickConnectEnd: Se, resetSelectedElements: me } = M.getState();
    if (le) {
      const ve = structuredClone(we);
      delete ve.inProgress, ve.toPosition = ve.toHandle ? ve.toHandle.position : null, Se?.(q.nativeEvent, ve), M.setState({ connectionClickStartHandle: null });
    }
    g?.(q), me(), M.setState({ nodesSelectionActive: !1 });
  }, V = (q) => {
    if (Array.isArray(l) && l?.includes(2)) {
      q.preventDefault();
      return;
    }
    m?.(q);
  }, b = v ? (q) => v(q) : void 0, j = (q) => {
    W.current && (q.stopPropagation(), W.current = !1);
  }, U = (q) => {
    if (q.pointerType === "touch" && l !== !1 && !r)
      return;
    const { domNode: le, transform: we } = M.getState();
    if (K.current = le?.getBoundingClientRect(), !K.current)
      return;
    const Se = q.target === Q.current;
    if (!Se && !!q.target.closest(".nokey") || !t || !(f && Se || r) || q.button !== 0 || !q.isPrimary)
      return;
    q.target?.setPointerCapture?.(q.pointerId), W.current = !1;
    const { x: Ee, y: Ce } = Bt(q.nativeEvent, K.current), ze = zi({ x: Ee, y: Ce }, we);
    M.setState({
      userSelectionRect: {
        width: 0,
        height: 0,
        startX: ze.x,
        startY: ze.y,
        x: Ee,
        y: Ce
      }
    }), Se || (q.stopPropagation(), q.preventDefault());
  };
  function C(q, le) {
    const { userSelectionRect: we } = M.getState();
    if (!we)
      return;
    const { transform: Se, nodeLookup: me, edgeLookup: ve, connectionLookup: Ee, triggerNodeChanges: Ce, triggerEdgeChanges: ze, defaultEdgeOptions: Ve } = M.getState(), Ct = { x: we.startX, y: we.startY }, { x: at, y: et } = ho(Ct, Se), tt = {
      startX: Ct.x,
      startY: Ct.y,
      x: q < at ? q : at,
      y: le < et ? le : et,
      width: Math.abs(q - at),
      height: Math.abs(le - et)
    }, sn = ee.current, Yt = J.current;
    ee.current = new Set(kc(me, tt, Se, i === vi.Partial, !0).map((ut) => ut.id)), J.current = /* @__PURE__ */ new Set();
    const Zt = Ve?.selectable ?? !0;
    for (const ut of ee.current) {
      const Nt = Ee.get(ut);
      if (Nt)
        for (const { edgeId: mt } of Nt.values()) {
          const Mt = ve.get(mt);
          Mt && (Mt.selectable ?? Zt) && J.current.add(mt);
        }
    }
    if (!$p(sn, ee.current)) {
      const ut = no(me, ee.current);
      Ce(ut);
    }
    if (!$p(Yt, J.current)) {
      const ut = no(ve, J.current);
      ze(ut);
    }
    M.setState({
      userSelectionRect: tt,
      userSelectionActive: !0,
      nodesSelectionActive: !1
    });
  }
  function H() {
    if (!a || !K.current)
      return;
    const [q, le] = Ec(k.current, K.current, D);
    B({ x: q, y: le }).then((we) => {
      if (!W.current || !we) {
        E.current = requestAnimationFrame(H);
        return;
      }
      const { x: Se, y: me } = k.current;
      C(Se, me), E.current = requestAnimationFrame(H);
    });
  }
  const ie = () => {
    cancelAnimationFrame(E.current), E.current = 0, $.current = !1;
  };
  Y.useEffect(() => () => ie(), []);
  const re = (q) => {
    const { userSelectionRect: le, transform: we, resetSelectedElements: Se } = M.getState();
    if (!K.current || !le)
      return;
    const { x: me, y: ve } = Bt(q.nativeEvent, K.current);
    k.current = { x: me, y: ve };
    const Ee = ho({ x: le.startX, y: le.startY }, we);
    if (!W.current) {
      const Ce = r ? 0 : c;
      if (Math.hypot(me - Ee.x, ve - Ee.y) <= Ce)
        return;
      Se(), p?.(q);
    }
    W.current = !0, $.current || (H(), $.current = !0), C(me, ve);
  }, ae = (q) => {
    if (!F) {
      q.target === Q.current && M.getState().connection.inProgress && (A.current = !0);
      return;
    }
    q.button === 0 && (q.target?.releasePointerCapture?.(q.pointerId), !T && q.target === Q.current && M.getState().userSelectionRect && O?.(q), M.setState({
      userSelectionActive: !1,
      userSelectionRect: null
    }), W.current && (h?.(q), M.setState({
      nodesSelectionActive: ee.current.size > 0
    })), ie());
  }, ce = (q) => {
    q.target?.releasePointerCapture?.(q.pointerId), ie();
  }, ue = l === !0 || Array.isArray(l) && l.includes(0);
  return R.jsxs("div", { className: We(["react-flow__pane", { draggable: ue, dragging: P, selection: t }]), onClick: F ? void 0 : Xu(O, Q), onContextMenu: Xu(V, Q), onWheel: Xu(b, Q), onPointerEnter: F ? void 0 : y, onPointerMove: F ? re : _, onPointerUp: ae, onPointerCancel: F ? ce : void 0, onPointerDownCapture: F ? U : void 0, onClickCapture: F ? j : void 0, onPointerLeave: x, ref: Q, style: bl, children: [N, R.jsx(G_, {})] });
}
function uc({ id: t, store: r, unselect: i = !1, nodeRef: l }) {
  const { addSelectedNodes: a, unselectNodesAndEdges: c, multiSelectionActive: f, nodeLookup: p, onError: h } = r.getState(), g = p.get(t);
  if (!g) {
    h?.("012", Ut.error012(t));
    return;
  }
  r.setState({ nodesSelectionActive: !1 }), g.selected ? (i || g.selected && f) && (c({ nodes: [g], edges: [] }), requestAnimationFrame(() => l?.current?.blur())) : a([t]);
}
function im({ nodeRef: t, disabled: r = !1, noDragClassName: i, handleSelector: l, nodeId: a, isSelectable: c, nodeClickDistance: f }) {
  const p = Re(), [h, g] = Y.useState(!1), m = Y.useRef();
  return Y.useEffect(() => {
    if (!r)
      return m.current = H1({
        getStoreItems: () => p.getState(),
        onNodeMouseDown: (v) => {
          uc({
            id: v,
            store: p,
            nodeRef: t
          });
        },
        onDragStart: () => {
          g(!0);
        },
        onDragStop: () => {
          g(!1);
        }
      }), () => {
        m.current?.destroy(), m.current = void 0;
      };
  }, [r, p, t]), Y.useEffect(() => {
    r || !t.current || !m.current || m.current.update({
      noDragClassName: i,
      handleSelector: l,
      domNode: t.current,
      isSelectable: c,
      nodeId: a,
      nodeClickDistance: f
    });
  }, [i, l, r, c, t, a, f]), h;
}
const eS = (t) => (r) => r.selected && (r.draggable || t && typeof r.draggable > "u");
function sm() {
  const t = Re();
  return Y.useCallback((i) => {
    const { nodeExtent: l, snapToGrid: a, snapGrid: c, nodesDraggable: f, onError: p, updateNodePositions: h, nodeLookup: g, nodeOrigin: m } = t.getState(), v = /* @__PURE__ */ new Map(), y = eS(f), _ = a ? c[0] : 5, x = a ? c[1] : 5, N = i.direction.x * _ * i.factor, E = i.direction.y * x * i.factor;
    for (const [, M] of g) {
      if (!y(M))
        continue;
      let T = {
        x: M.internals.positionAbsolute.x + N,
        y: M.internals.positionAbsolute.y + E
      };
      a && (T = Mi(T, c));
      const { position: S, positionAbsolute: P } = kg({
        nodeId: M.id,
        nextPosition: T,
        nodeLookup: g,
        nodeExtent: l,
        nodeOrigin: m,
        onError: p
      });
      M.position = S, M.internals.positionAbsolute = P, v.set(M.id, M);
    }
    h(v);
  }, []);
}
const Rc = Y.createContext(null), tS = Rc.Provider;
Rc.Consumer;
const lm = () => Y.useContext(Rc), nS = (t) => ({
  connectOnClick: t.connectOnClick,
  noPanClassName: t.noPanClassName,
  rfId: t.rfId
}), am = Y.createContext(null);
function rS({ children: t }) {
  const r = Me(nS, He);
  return R.jsx(am.Provider, { value: r, children: t });
}
function oS() {
  const t = Y.useContext(am);
  if (!t)
    throw new Error("useHandleConfig must be used within a HandleConfigProvider");
  return t;
}
const iS = {
  connectingFrom: !1,
  connectingTo: !1,
  clickConnecting: !1,
  isPossibleEndHandle: !0,
  connectionInProcess: !1,
  clickConnectionInProcess: !1,
  valid: !1
}, sS = (t, r, i) => (l) => {
  const { connectionClickStartHandle: a, connectionMode: c, connection: f } = l, { fromHandle: p, toHandle: h, isValid: g } = f;
  if (!p && !a)
    return iS;
  const m = h?.nodeId === t && h?.id === r && h?.type === i;
  return {
    connectingFrom: p?.nodeId === t && p?.id === r && p?.type === i,
    connectingTo: m,
    clickConnecting: a?.nodeId === t && a?.id === r && a?.type === i,
    isPossibleEndHandle: c === fo.Strict ? p?.type !== i : t !== p?.nodeId || r !== p?.id,
    connectionInProcess: !!p,
    clickConnectionInProcess: !!a,
    valid: m && g
  };
};
function lS({ type: t = "source", position: r = ye.Top, isValidConnection: i, isConnectable: l = !0, isConnectableStart: a = !0, isConnectableEnd: c = !0, id: f, onConnect: p, children: h, className: g, onMouseDown: m, onTouchStart: v, ...y }, _) {
  const x = f || null, N = t === "target", E = Re(), M = lm(), { connectOnClick: T, noPanClassName: S, rfId: P } = oS(), { connectingFrom: B, connectingTo: D, clickConnecting: F, isPossibleEndHandle: Q, connectionInProcess: K, clickConnectionInProcess: ee, valid: J } = Me(sS(M, x, t), He);
  M || E.getState().onError?.("010", Ut.error010());
  const A = ($) => {
    const { defaultEdgeOptions: O, onConnect: V, hasDefaultEdges: b } = E.getState(), j = {
      ...O,
      ...$
    };
    if (b) {
      const { edges: U, setEdges: C, onError: H } = E.getState();
      C(j_(j, U, { onError: H }));
    }
    V?.(j), p?.(j);
  }, W = ($) => {
    if (!M)
      return;
    const O = Rg($.nativeEvent);
    if (a && (O && $.button === 0 || !O)) {
      const V = E.getState();
      ac.onPointerDown($.nativeEvent, {
        handleDomNode: $.currentTarget,
        autoPanOnConnect: V.autoPanOnConnect,
        connectionMode: V.connectionMode,
        connectionRadius: V.connectionRadius,
        domNode: V.domNode,
        nodeLookup: V.nodeLookup,
        lib: V.lib,
        isTarget: N,
        handleId: x,
        nodeId: M,
        flowId: V.rfId,
        panBy: V.panBy,
        cancelConnection: V.cancelConnection,
        onConnectStart: V.onConnectStart,
        onConnectEnd: (...b) => E.getState().onConnectEnd?.(...b),
        updateConnection: V.updateConnection,
        onConnect: A,
        isValidConnection: i || ((...b) => E.getState().isValidConnection?.(...b) ?? !0),
        getTransform: () => E.getState().transform,
        getFromHandle: () => E.getState().connection.fromHandle,
        autoPanSpeed: V.autoPanSpeed,
        dragThreshold: V.connectionDragThreshold
      });
    }
    O ? m?.($) : v?.($);
  }, k = ($) => {
    const { onClickConnectStart: O, onClickConnectEnd: V, connectionClickStartHandle: b, connectionMode: j, isValidConnection: U, lib: C, rfId: H, nodeLookup: ie, connection: re } = E.getState();
    if (!M || !b && !a)
      return;
    if (!b) {
      O?.($.nativeEvent, { nodeId: M, handleId: x, handleType: t }), E.setState({ connectionClickStartHandle: { nodeId: M, type: t, id: x } });
      return;
    }
    const ae = Tg($.target), ce = i || U, { connection: ue, isValid: q } = ac.isValid($.nativeEvent, {
      handle: {
        nodeId: M,
        id: x,
        type: t
      },
      connectionMode: j,
      fromNodeId: b.nodeId,
      fromHandleId: b.id || null,
      fromType: b.type,
      isValidConnection: ce,
      flowId: H,
      doc: ae,
      lib: C,
      nodeLookup: ie
    });
    q && ue && A(ue);
    const le = structuredClone(re);
    delete le.inProgress, le.toPosition = le.toHandle ? le.toHandle.position : null, V?.($, le), E.setState({ connectionClickStartHandle: null });
  };
  return R.jsx("div", { "data-handleid": x, "data-nodeid": M, "data-handlepos": r, "data-id": `${P}-${M}-${x}-${t}`, className: We([
    "react-flow__handle",
    `react-flow__handle-${r}`,
    "nodrag",
    S,
    g,
    {
      source: !N,
      target: N,
      connectable: l,
      connectablestart: a,
      connectableend: c,
      clickconnecting: F,
      connectingfrom: B,
      connectingto: D,
      valid: J,
      /*
       * shows where you can start a connection from
       * and where you can end it while connecting
       */
      connectionindicator: l && (!K || Q) && (K || ee ? c : a)
    }
  ]), onMouseDown: W, onTouchStart: W, onClick: T ? k : void 0, ref: _, ...y, children: h });
}
const xn = Y.memo(nm(lS));
function aS({ data: t, isConnectable: r, sourcePosition: i = ye.Bottom }) {
  return R.jsxs(R.Fragment, { children: [t?.label, R.jsx(xn, { type: "source", position: i, isConnectable: r })] });
}
function uS({ data: t, isConnectable: r, targetPosition: i = ye.Top, sourcePosition: l = ye.Bottom }) {
  return R.jsxs(R.Fragment, { children: [R.jsx(xn, { type: "target", position: i, isConnectable: r }), t?.label, R.jsx(xn, { type: "source", position: l, isConnectable: r })] });
}
function cS() {
  return null;
}
function fS({ data: t, isConnectable: r, targetPosition: i = ye.Top }) {
  return R.jsxs(R.Fragment, { children: [R.jsx(xn, { type: "target", position: i, isConnectable: r }), t?.label] });
}
const vl = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
}, ph = {
  input: aS,
  default: uS,
  output: fS,
  group: cS
};
function dS(t) {
  return t.internals.handleBounds === void 0 ? {
    width: t.width ?? t.initialWidth ?? t.style?.width,
    height: t.height ?? t.initialHeight ?? t.style?.height
  } : {
    width: t.width ?? t.style?.width,
    height: t.height ?? t.style?.height
  };
}
const pS = (t) => {
  const { width: r, height: i, x: l, y: a } = Ni(t.nodeLookup, {
    filter: (c) => !!c.selected
  });
  return {
    width: Vt(r) ? r : null,
    height: Vt(i) ? i : null,
    userSelectionActive: t.userSelectionActive,
    transformString: `translate(${t.transform[0]}px,${t.transform[1]}px) scale(${t.transform[2]}) translate(${l}px,${a}px)`
  };
};
function hS({ onSelectionContextMenu: t, noPanClassName: r, disableKeyboardA11y: i }) {
  const l = Re(), { width: a, height: c, transformString: f, userSelectionActive: p } = Me(pS, He), h = sm(), g = Y.useRef(null);
  Y.useEffect(() => {
    i || g.current?.focus({
      preventScroll: !0
    });
  }, [i]);
  const m = !p && a !== null && c !== null;
  if (im({
    nodeRef: g,
    disabled: !m
  }), !m)
    return null;
  const v = t ? (_) => {
    const x = l.getState().nodes.filter((N) => N.selected);
    t(_, x);
  } : void 0, y = (_) => {
    Object.prototype.hasOwnProperty.call(vl, _.key) && (_.preventDefault(), h({
      direction: vl[_.key],
      factor: _.shiftKey ? 4 : 1
    }));
  };
  return R.jsx("div", { className: We(["react-flow__nodesselection", "react-flow__container", r]), style: {
    transform: f
  }, children: R.jsx("div", { ref: g, className: "react-flow__nodesselection-rect", onContextMenu: v, tabIndex: i ? void 0 : -1, onKeyDown: i ? void 0 : y, style: {
    width: a,
    height: c
  } }) });
}
const hh = typeof window < "u" ? window : void 0, gS = (t) => ({ nodesSelectionActive: t.nodesSelectionActive, userSelectionActive: t.userSelectionActive });
function um({ children: t, onPaneClick: r, onPaneMouseEnter: i, onPaneMouseMove: l, onPaneMouseLeave: a, onPaneContextMenu: c, onPaneScroll: f, paneClickDistance: p, deleteKeyCode: h, selectionKeyCode: g, selectionOnDrag: m, selectionMode: v, onSelectionStart: y, onSelectionEnd: _, multiSelectionKeyCode: x, panActivationKeyCode: N, zoomActivationKeyCode: E, elementsSelectable: M, zoomOnScroll: T, zoomOnPinch: S, panOnScroll: P, panOnScrollSpeed: B, panOnScrollMode: D, zoomOnDoubleClick: F, panOnDrag: Q, autoPanOnSelection: K, defaultViewport: ee, translateExtent: J, minZoom: A, maxZoom: W, preventScrolling: k, onSelectionContextMenu: $, noWheelClassName: O, noPanClassName: V, disableKeyboardA11y: b, onViewportChange: j, isControlledViewport: U }) {
  const { nodesSelectionActive: C, userSelectionActive: H } = Me(gS, He), ie = _i(g, { target: hh }), re = _i(N, { target: hh }), ae = re || Q, ce = re || P, ue = m && ae !== !0, q = ie || H || ue;
  return X_({ deleteKeyCode: h, multiSelectionKeyCode: x }), R.jsx(Q_, { onPaneContextMenu: c, elementsSelectable: M, zoomOnScroll: T, zoomOnPinch: S, panOnScroll: ce, panActivationKeyPressed: re, panOnScrollSpeed: B, panOnScrollMode: D, zoomOnDoubleClick: F, panOnDrag: !ie && ae, defaultViewport: ee, translateExtent: J, minZoom: A, maxZoom: W, zoomActivationKeyCode: E, preventScrolling: k, noWheelClassName: O, noPanClassName: V, onViewportChange: j, isControlledViewport: U, paneClickDistance: p, selectionOnDrag: ue, children: R.jsxs(J_, { onSelectionStart: y, onSelectionEnd: _, onPaneClick: r, onPaneMouseEnter: i, onPaneMouseMove: l, onPaneMouseLeave: a, onPaneContextMenu: c, onPaneScroll: f, panOnDrag: ae, autoPanOnSelection: K, isSelecting: !!q, selectionMode: v, selectionKeyPressed: ie, paneClickDistance: p, selectionOnDrag: ue, children: [t, C && R.jsx(hS, { onSelectionContextMenu: $, noPanClassName: V, disableKeyboardA11y: b })] }) });
}
um.displayName = "FlowRenderer";
const mS = Y.memo(um), yS = (t) => (r) => t ? kc(r.nodeLookup, { x: 0, y: 0, width: r.width, height: r.height }, r.transform, !0).map((i) => i.id) : Array.from(r.nodeLookup.keys());
function vS(t) {
  return Me(Y.useCallback(yS(t), [t]), He);
}
const wS = (t) => t.updateNodeInternals;
function xS() {
  const t = Me(wS), [r] = Y.useState(() => typeof ResizeObserver > "u" ? null : new ResizeObserver((i) => {
    const l = /* @__PURE__ */ new Map();
    i.forEach((a) => {
      const c = a.target.getAttribute("data-id");
      l.set(c, {
        id: c,
        nodeElement: a.target,
        force: !0
      });
    }), t(l);
  }));
  return Y.useEffect(() => () => {
    r?.disconnect();
  }, [r]), r;
}
function _S({ node: t, nodeType: r, hasDimensions: i, resizeObserver: l }) {
  const a = Re(), c = Y.useRef(null), f = Y.useRef(null), p = Y.useRef(t.sourcePosition), h = Y.useRef(t.targetPosition), g = Y.useRef(r), m = i && !!t.internals.handleBounds;
  return Y.useEffect(() => {
    c.current && !t.hidden && (!m || f.current !== c.current) && (f.current && l?.unobserve(f.current), l?.observe(c.current), f.current = c.current);
  }, [m, t.hidden]), Y.useEffect(() => () => {
    f.current && (l?.unobserve(f.current), f.current = null);
  }, []), Y.useEffect(() => {
    if (c.current) {
      const v = g.current !== r, y = p.current !== t.sourcePosition, _ = h.current !== t.targetPosition;
      (v || y || _) && (g.current = r, p.current = t.sourcePosition, h.current = t.targetPosition, a.getState().updateNodeInternals(/* @__PURE__ */ new Map([[t.id, { id: t.id, nodeElement: c.current, force: !0 }]])));
    }
  }, [t.id, r, t.sourcePosition, t.targetPosition]), c;
}
function SS({ id: t, onClick: r, onMouseEnter: i, onMouseMove: l, onMouseLeave: a, onContextMenu: c, onDoubleClick: f, nodesDraggable: p, elementsSelectable: h, nodesConnectable: g, nodesFocusable: m, resizeObserver: v, noDragClassName: y, noPanClassName: _, disableKeyboardA11y: x, rfId: N, nodeTypes: E, nodeClickDistance: M, onError: T }) {
  const { node: S, internals: P, isParent: B } = Me((q) => {
    const le = q.nodeLookup.get(t), we = q.parentLookup.has(t);
    return {
      node: le,
      internals: le.internals,
      isParent: we
    };
  }, He);
  let D = S.type || "default", F = E?.[D] || ph[D];
  F === void 0 && (T?.("003", Ut.error003(D)), D = "default", F = E?.default || ph.default);
  const Q = !!(S.draggable || p && typeof S.draggable > "u"), K = !!(S.selectable || h && typeof S.selectable > "u"), ee = !!(S.connectable || g && typeof S.connectable > "u"), J = !!(S.focusable || m && typeof S.focusable > "u"), A = Re(), W = zg(S), k = _S({ node: S, nodeType: D, hasDimensions: W, resizeObserver: v }), $ = im({
    nodeRef: k,
    disabled: S.hidden || !Q,
    noDragClassName: y,
    handleSelector: S.dragHandle,
    nodeId: t,
    isSelectable: K,
    nodeClickDistance: M
  }), O = sm();
  if (S.hidden)
    return null;
  const V = Xt(S), b = dS(S), j = K || Q || r || i || l || a, U = i ? (q) => i(q, { ...P.userNode }) : void 0, C = l ? (q) => l(q, { ...P.userNode }) : void 0, H = a ? (q) => a(q, { ...P.userNode }) : void 0, ie = c ? (q) => c(q, { ...P.userNode }) : void 0, re = f ? (q) => f(q, { ...P.userNode }) : void 0, ae = (q) => {
    const { selectNodesOnDrag: le, nodeDragThreshold: we } = A.getState();
    K && (!le || !Q || we > 0) && uc({
      id: t,
      store: A,
      nodeRef: k
    }), r && r(q, { ...P.userNode });
  }, ce = (q) => {
    if (!(bg(q.nativeEvent) || x)) {
      if (wg.includes(q.key) && K) {
        const le = q.key === "Escape";
        uc({
          id: t,
          store: A,
          unselect: le,
          nodeRef: k
        });
      } else if (Q && S.selected && Object.prototype.hasOwnProperty.call(vl, q.key)) {
        q.preventDefault();
        const { ariaLabelConfig: le } = A.getState();
        A.setState({
          ariaLiveMessage: le["node.a11yDescription.ariaLiveMessage"]({
            direction: q.key.replace("Arrow", "").toLowerCase(),
            x: ~~P.positionAbsolute.x,
            y: ~~P.positionAbsolute.y
          })
        }), O({
          direction: vl[q.key],
          factor: q.shiftKey ? 4 : 1
        });
      }
    }
  }, ue = () => {
    if (x || !k.current?.matches(":focus-visible"))
      return;
    const { transform: q, width: le, height: we, autoPanOnNodeFocus: Se, setCenter: me } = A.getState();
    if (!Se)
      return;
    kc(/* @__PURE__ */ new Map([[t, S]]), { x: 0, y: 0, width: le, height: we }, q, !0).length > 0 || me(S.position.x + V.width / 2, S.position.y + V.height / 2, {
      zoom: q[2]
    });
  };
  return R.jsx("div", { className: We([
    "react-flow__node",
    `react-flow__node-${D}`,
    {
      // this is overwritable by passing `nopan` as a class name
      [_]: Q
    },
    S.className,
    {
      selected: S.selected,
      selectable: K,
      parent: B,
      draggable: Q,
      dragging: $
    }
  ]), ref: k, style: {
    zIndex: P.z,
    transform: `translate(${P.positionAbsolute.x}px,${P.positionAbsolute.y}px)`,
    pointerEvents: j ? "all" : "none",
    visibility: W ? "visible" : "hidden",
    ...S.style,
    ...b
  }, "data-id": t, "data-testid": `rf__node-${t}`, onMouseEnter: U, onMouseMove: C, onMouseLeave: H, onContextMenu: ie, onClick: ae, onDoubleClick: re, onKeyDown: J ? ce : void 0, tabIndex: J ? 0 : void 0, onFocus: J ? ue : void 0, role: S.ariaRole ?? (J ? "group" : void 0), "aria-roledescription": "node", "aria-describedby": x ? void 0 : `${Gg}-${N}`, "aria-label": S.ariaLabel, ...S.domAttributes, children: R.jsx(tS, { value: t, children: R.jsx(F, { id: t, data: S.data, type: D, positionAbsoluteX: P.positionAbsolute.x, positionAbsoluteY: P.positionAbsolute.y, selected: S.selected ?? !1, selectable: K, draggable: Q, deletable: S.deletable ?? !0, isConnectable: ee, sourcePosition: S.sourcePosition, targetPosition: S.targetPosition, dragging: $, dragHandle: S.dragHandle, zIndex: P.z, parentId: S.parentId, ...V }) }) });
}
var kS = Y.memo(SS);
const ES = (t) => ({
  nodesConnectable: t.nodesConnectable,
  nodesFocusable: t.nodesFocusable,
  elementsSelectable: t.elementsSelectable,
  onError: t.onError
});
function cm(t) {
  const { nodesConnectable: r, nodesFocusable: i, elementsSelectable: l, onError: a } = Me(ES, He), c = vS(t.onlyRenderVisibleElements), f = xS();
  return R.jsx("div", { className: "react-flow__nodes", style: bl, children: c.map((p) => (
    /*
     * The split of responsibilities between NodeRenderer and
     * NodeComponentWrapper may appear weird. However, it’s designed to
     * minimize the cost of updates when individual nodes change.
     *
     * For example, when you’re dragging a single node, that node gets
     * updated multiple times per second. If `NodeRenderer` were to update
     * every time, it would have to re-run the `nodes.map()` loop every
     * time. This gets pricey with hundreds of nodes, especially if every
     * loop cycle does more than just rendering a JSX element!
     *
     * As a result of this choice, we took the following implementation
     * decisions:
     * - NodeRenderer subscribes *only* to node IDs – and therefore
     *   rerender *only* when visible nodes are added or removed.
     * - NodeRenderer performs all operations the result of which can be
     *   shared between nodes (such as creating the `ResizeObserver`
     *   instance, or subscribing to `selector`). This means extra prop
     *   drilling into `NodeComponentWrapper`, but it means we need to run
     *   these operations only once – instead of once per node.
     * - Any operations that you’d normally write inside `nodes.map` are
     *   moved into `NodeComponentWrapper`. This ensures they are
     *   memorized – so if `NodeRenderer` *has* to rerender, it only
     *   needs to regenerate the list of nodes, nothing else.
     */
    R.jsx(kS, { id: p, nodeTypes: t.nodeTypes, nodeExtent: t.nodeExtent, onClick: t.onNodeClick, onMouseEnter: t.onNodeMouseEnter, onMouseMove: t.onNodeMouseMove, onMouseLeave: t.onNodeMouseLeave, onContextMenu: t.onNodeContextMenu, onDoubleClick: t.onNodeDoubleClick, noDragClassName: t.noDragClassName, noPanClassName: t.noPanClassName, rfId: t.rfId, disableKeyboardA11y: t.disableKeyboardA11y, resizeObserver: f, nodesDraggable: t.nodesDraggable ?? !0, nodesConnectable: r, nodesFocusable: i, elementsSelectable: l, nodeClickDistance: t.nodeClickDistance, onError: a }, p)
  )) });
}
cm.displayName = "NodeRenderer";
const CS = Y.memo(cm);
function NS(t) {
  return Me(Y.useCallback((i) => {
    if (!t)
      return i.edges.map((a) => a.id);
    const l = [];
    if (i.width && i.height)
      for (const a of i.edges) {
        const c = i.nodeLookup.get(a.source), f = i.nodeLookup.get(a.target);
        c && f && x1({
          sourceNode: c,
          targetNode: f,
          width: i.width,
          height: i.height,
          transform: i.transform
        }) && l.push(a.id);
      }
    return l;
  }, [t]), He);
}
const MS = ({ color: t = "none", strokeWidth: r = 1 }) => {
  const i = {
    strokeWidth: r,
    ...t && { stroke: t }
  };
  return R.jsx("polyline", { className: "arrow", style: i, strokeLinecap: "round", fill: "none", strokeLinejoin: "round", points: "-5,-4 0,0 -5,4" });
}, zS = ({ color: t = "none", strokeWidth: r = 1 }) => {
  const i = {
    strokeWidth: r,
    ...t && { stroke: t, fill: t }
  };
  return R.jsx("polyline", { className: "arrowclosed", style: i, strokeLinecap: "round", strokeLinejoin: "round", points: "-5,-4 0,0 -5,4 -5,-4" });
}, gh = {
  [gl.Arrow]: MS,
  [gl.ArrowClosed]: zS
};
function PS(t) {
  const r = Re();
  return Y.useMemo(() => Object.prototype.hasOwnProperty.call(gh, t) ? gh[t] : (r.getState().onError?.("009", Ut.error009(t)), null), [t]);
}
const IS = ({ id: t, type: r, color: i, width: l = 12.5, height: a = 12.5, markerUnits: c = "strokeWidth", strokeWidth: f, orient: p = "auto-start-reverse" }) => {
  const h = PS(r);
  return h ? R.jsx("marker", { className: "react-flow__arrowhead", id: t, markerWidth: `${l}`, markerHeight: `${a}`, viewBox: "-10 -10 20 20", markerUnits: c, orient: p, refX: "0", refY: "0", children: R.jsx(h, { color: i, strokeWidth: f }) }) : null;
}, fm = ({ defaultColor: t, rfId: r }) => {
  const i = Me((c) => c.edges), l = Me((c) => c.defaultEdgeOptions), a = Y.useMemo(() => P1(i, {
    id: r,
    defaultColor: t,
    defaultMarkerStart: l?.markerStart,
    defaultMarkerEnd: l?.markerEnd
  }), [i, l, r, t]);
  return a.length ? R.jsx("svg", { className: "react-flow__marker", "aria-hidden": "true", children: R.jsx("defs", { children: a.map((c) => R.jsx(IS, { id: c.id, type: c.type, color: c.color, width: c.width, height: c.height, markerUnits: c.markerUnits, strokeWidth: c.strokeWidth, orient: c.orient }, c.id)) }) }) : null;
};
fm.displayName = "MarkerDefinitions";
var TS = Y.memo(fm);
function dm({ x: t, y: r, label: i, labelStyle: l, labelShowBg: a = !0, labelBgStyle: c, labelBgPadding: f = [2, 4], labelBgBorderRadius: p = 2, children: h, className: g, ...m }) {
  const [v, y] = Y.useState({ x: 1, y: 0, width: 0, height: 0 }), _ = We(["react-flow__edge-textwrapper", g]), x = Y.useRef(null);
  return Y.useEffect(() => {
    if (x.current) {
      const N = x.current.getBBox();
      y({
        x: N.x,
        y: N.y,
        width: N.width,
        height: N.height
      });
    }
  }, [i]), i ? R.jsxs("g", { transform: `translate(${t - v.width / 2} ${r - v.height / 2})`, className: _, visibility: v.width ? "visible" : "hidden", ...m, children: [a && R.jsx("rect", { width: v.width + 2 * f[0], x: -f[0], y: -f[1], height: v.height + 2 * f[1], className: "react-flow__edge-textbg", style: c, rx: p, ry: p }), R.jsx("text", { className: "react-flow__edge-text", y: v.height / 2, dy: "0.3em", ref: x, style: l, children: i }), h] }) : null;
}
dm.displayName = "EdgeText";
const bS = Y.memo(dm);
function Rl({ path: t, labelX: r, labelY: i, label: l, labelStyle: a, labelShowBg: c, labelBgStyle: f, labelBgPadding: p, labelBgBorderRadius: h, interactionWidth: g = 20, ...m }) {
  return R.jsxs(R.Fragment, { children: [R.jsx("path", { ...m, d: t, fill: "none", className: We(["react-flow__edge-path", m.className]) }), g ? R.jsx("path", { d: t, fill: "none", strokeOpacity: 0, strokeWidth: g, className: "react-flow__edge-interaction" }) : null, l && Vt(r) && Vt(i) ? R.jsx(bS, { x: r, y: i, label: l, labelStyle: a, labelShowBg: c, labelBgStyle: f, labelBgPadding: p, labelBgBorderRadius: h }) : null] });
}
function mh({ pos: t, x1: r, y1: i, x2: l, y2: a }) {
  return t === ye.Left || t === ye.Right ? [0.5 * (r + l), i] : [r, 0.5 * (i + a)];
}
function pm({ sourceX: t, sourceY: r, sourcePosition: i = ye.Bottom, targetX: l, targetY: a, targetPosition: c = ye.Top }) {
  const [f, p] = mh({
    pos: i,
    x1: t,
    y1: r,
    x2: l,
    y2: a
  }), [h, g] = mh({
    pos: c,
    x1: l,
    y1: a,
    x2: t,
    y2: r
  }), [m, v, y, _] = Dg({
    sourceX: t,
    sourceY: r,
    targetX: l,
    targetY: a,
    sourceControlX: f,
    sourceControlY: p,
    targetControlX: h,
    targetControlY: g
  });
  return [
    `M${t},${r} C${f},${p} ${h},${g} ${l},${a}`,
    m,
    v,
    y,
    _
  ];
}
function hm(t) {
  return Y.memo(({ id: r, sourceX: i, sourceY: l, targetX: a, targetY: c, sourcePosition: f, targetPosition: p, label: h, labelStyle: g, labelShowBg: m, labelBgStyle: v, labelBgPadding: y, labelBgBorderRadius: _, style: x, markerEnd: N, markerStart: E, interactionWidth: M }) => {
    const [T, S, P] = pm({
      sourceX: i,
      sourceY: l,
      sourcePosition: f,
      targetX: a,
      targetY: c,
      targetPosition: p
    }), B = t.isInternal ? void 0 : r;
    return R.jsx(Rl, { id: B, path: T, labelX: S, labelY: P, label: h, labelStyle: g, labelShowBg: m, labelBgStyle: v, labelBgPadding: y, labelBgBorderRadius: _, style: x, markerEnd: N, markerStart: E, interactionWidth: M });
  });
}
const RS = hm({ isInternal: !1 }), gm = hm({ isInternal: !0 });
RS.displayName = "SimpleBezierEdge";
gm.displayName = "SimpleBezierEdgeInternal";
function mm(t) {
  return Y.memo(({ id: r, sourceX: i, sourceY: l, targetX: a, targetY: c, label: f, labelStyle: p, labelShowBg: h, labelBgStyle: g, labelBgPadding: m, labelBgBorderRadius: v, style: y, sourcePosition: _ = ye.Bottom, targetPosition: x = ye.Top, markerEnd: N, markerStart: E, pathOptions: M, interactionWidth: T }) => {
    const [S, P, B] = ic({
      sourceX: i,
      sourceY: l,
      sourcePosition: _,
      targetX: a,
      targetY: c,
      targetPosition: x,
      borderRadius: M?.borderRadius,
      offset: M?.offset,
      stepPosition: M?.stepPosition
    }), D = t.isInternal ? void 0 : r;
    return R.jsx(Rl, { id: D, path: S, labelX: P, labelY: B, label: f, labelStyle: p, labelShowBg: h, labelBgStyle: g, labelBgPadding: m, labelBgBorderRadius: v, style: y, markerEnd: N, markerStart: E, interactionWidth: T });
  });
}
const ym = mm({ isInternal: !1 }), vm = mm({ isInternal: !0 });
ym.displayName = "SmoothStepEdge";
vm.displayName = "SmoothStepEdgeInternal";
function wm(t) {
  return Y.memo(({ id: r, ...i }) => {
    const l = t.isInternal ? void 0 : r;
    return R.jsx(ym, { ...i, id: l, pathOptions: Y.useMemo(() => ({ borderRadius: 0, offset: i.pathOptions?.offset }), [i.pathOptions?.offset]) });
  });
}
const DS = wm({ isInternal: !1 }), xm = wm({ isInternal: !0 });
DS.displayName = "StepEdge";
xm.displayName = "StepEdgeInternal";
function _m(t) {
  return Y.memo(({ id: r, sourceX: i, sourceY: l, targetX: a, targetY: c, label: f, labelStyle: p, labelShowBg: h, labelBgStyle: g, labelBgPadding: m, labelBgBorderRadius: v, style: y, markerEnd: _, markerStart: x, interactionWidth: N }) => {
    const [E, M, T] = Og({ sourceX: i, sourceY: l, targetX: a, targetY: c }), S = t.isInternal ? void 0 : r;
    return R.jsx(Rl, { id: S, path: E, labelX: M, labelY: T, label: f, labelStyle: p, labelShowBg: h, labelBgStyle: g, labelBgPadding: m, labelBgBorderRadius: v, style: y, markerEnd: _, markerStart: x, interactionWidth: N });
  });
}
const LS = _m({ isInternal: !1 }), Sm = _m({ isInternal: !0 });
LS.displayName = "StraightEdge";
Sm.displayName = "StraightEdgeInternal";
function km(t) {
  return Y.memo(({ id: r, sourceX: i, sourceY: l, targetX: a, targetY: c, sourcePosition: f = ye.Bottom, targetPosition: p = ye.Top, label: h, labelStyle: g, labelShowBg: m, labelBgStyle: v, labelBgPadding: y, labelBgBorderRadius: _, style: x, markerEnd: N, markerStart: E, pathOptions: M, interactionWidth: T }) => {
    const [S, P, B] = Lg({
      sourceX: i,
      sourceY: l,
      sourcePosition: f,
      targetX: a,
      targetY: c,
      targetPosition: p,
      curvature: M?.curvature
    }), D = t.isInternal ? void 0 : r;
    return R.jsx(Rl, { id: D, path: S, labelX: P, labelY: B, label: h, labelStyle: g, labelShowBg: m, labelBgStyle: v, labelBgPadding: y, labelBgBorderRadius: _, style: x, markerEnd: N, markerStart: E, interactionWidth: T });
  });
}
const $S = km({ isInternal: !1 }), Em = km({ isInternal: !0 });
$S.displayName = "BezierEdge";
Em.displayName = "BezierEdgeInternal";
const yh = {
  default: Em,
  straight: Sm,
  step: xm,
  smoothstep: vm,
  simplebezier: gm
}, vh = {
  sourceX: null,
  sourceY: null,
  targetX: null,
  targetY: null,
  sourcePosition: null,
  targetPosition: null,
  zIndex: void 0
}, OS = (t, r, i) => i === ye.Left ? t - r : i === ye.Right ? t + r : t, AS = (t, r, i) => i === ye.Top ? t - r : i === ye.Bottom ? t + r : t, wh = "react-flow__edgeupdater";
function xh({ position: t, centerX: r, centerY: i, radius: l = 10, onMouseDown: a, onMouseEnter: c, onMouseOut: f, type: p }) {
  return R.jsx("circle", { onMouseDown: a, onMouseEnter: c, onMouseOut: f, className: We([wh, `${wh}-${p}`]), cx: OS(r, l, t), cy: AS(i, l, t), r: l, stroke: "transparent", fill: "transparent" });
}
function jS({ isReconnectable: t, reconnectRadius: r, edge: i, sourceX: l, sourceY: a, targetX: c, targetY: f, sourcePosition: p, targetPosition: h, onReconnect: g, onReconnectStart: m, onReconnectEnd: v, setReconnecting: y, setUpdateHover: _ }) {
  const x = Re(), N = (P, B) => {
    if (P.button !== 0)
      return;
    const { autoPanOnConnect: D, domNode: F, connectionMode: Q, connectionRadius: K, lib: ee, onConnectStart: J, cancelConnection: A, nodeLookup: W, rfId: k, panBy: $, updateConnection: O } = x.getState(), V = B.type === "target", b = (C, H) => {
      y(!1), v?.(C, i, B.type, H);
    }, j = (C) => g?.(i, C), U = (C, H) => {
      y(!0), m?.(P, i, B.type), J?.(C, H);
    };
    ac.onPointerDown(P.nativeEvent, {
      autoPanOnConnect: D,
      connectionMode: Q,
      connectionRadius: K,
      domNode: F,
      handleId: B.id,
      nodeId: B.nodeId,
      nodeLookup: W,
      isTarget: V,
      edgeUpdaterType: B.type,
      lib: ee,
      flowId: k,
      cancelConnection: A,
      panBy: $,
      isValidConnection: (...C) => x.getState().isValidConnection?.(...C) ?? !0,
      onConnect: j,
      onConnectStart: U,
      onConnectEnd: (...C) => x.getState().onConnectEnd?.(...C),
      onReconnectEnd: b,
      updateConnection: O,
      getTransform: () => x.getState().transform,
      getFromHandle: () => x.getState().connection.fromHandle,
      dragThreshold: x.getState().connectionDragThreshold,
      handleDomNode: P.currentTarget
    });
  }, E = (P) => N(P, { nodeId: i.target, id: i.targetHandle ?? null, type: "target" }), M = (P) => N(P, { nodeId: i.source, id: i.sourceHandle ?? null, type: "source" }), T = () => _(!0), S = () => _(!1);
  return R.jsxs(R.Fragment, { children: [(t === !0 || t === "source") && R.jsx(xh, { position: p, centerX: l, centerY: a, radius: r, onMouseDown: E, onMouseEnter: T, onMouseOut: S, type: "source" }), (t === !0 || t === "target") && R.jsx(xh, { position: h, centerX: c, centerY: f, radius: r, onMouseDown: M, onMouseEnter: T, onMouseOut: S, type: "target" })] });
}
function HS({ id: t, edgesFocusable: r, edgesReconnectable: i, elementsSelectable: l, onClick: a, onDoubleClick: c, onContextMenu: f, onMouseEnter: p, onMouseMove: h, onMouseLeave: g, reconnectRadius: m, onReconnect: v, onReconnectStart: y, onReconnectEnd: _, rfId: x, edgeTypes: N, noPanClassName: E, onError: M, disableKeyboardA11y: T }) {
  let S = Me((me) => me.edgeLookup.get(t));
  const P = Me((me) => me.defaultEdgeOptions);
  S = P ? { ...P, ...S } : S;
  let B = S.type || "default", D = N?.[B] || yh[B];
  D === void 0 && (M?.("011", Ut.error011(B)), B = "default", D = N?.default || yh.default);
  const F = !!(S.focusable || r && typeof S.focusable > "u"), Q = typeof v < "u" && (S.reconnectable || i && typeof S.reconnectable > "u"), K = !!(S.selectable || l && typeof S.selectable > "u"), ee = Y.useRef(null), [J, A] = Y.useState(!1), [W, k] = Y.useState(!1), $ = Re(), { zIndex: O = S.zIndex, sourceX: V, sourceY: b, targetX: j, targetY: U, sourcePosition: C, targetPosition: H } = Me(Y.useCallback((me) => {
    const ve = me.nodeLookup.get(S.source), Ee = me.nodeLookup.get(S.target);
    if (!ve || !Ee)
      return vh;
    const Ce = z1({
      id: t,
      sourceNode: ve,
      targetNode: Ee,
      sourceHandle: S.sourceHandle || null,
      targetHandle: S.targetHandle || null,
      connectionMode: me.connectionMode,
      onError: M
    }), ze = w1({
      selected: S.selected,
      zIndex: S.zIndex,
      sourceNode: ve,
      targetNode: Ee,
      elevateOnSelect: me.elevateEdgesOnSelect,
      zIndexMode: me.zIndexMode
    });
    return {
      ...Ce || vh,
      zIndex: ze
    };
  }, [S.source, S.target, S.sourceHandle, S.targetHandle, S.selected, S.zIndex, M]), He), ie = Y.useMemo(() => S.markerStart ? `url('#${sc(S.markerStart, x)}')` : void 0, [S.markerStart, x]), re = Y.useMemo(() => S.markerEnd ? `url('#${sc(S.markerEnd, x)}')` : void 0, [S.markerEnd, x]);
  if (S.hidden || V === null || b === null || j === null || U === null)
    return null;
  const ae = (me) => {
    const { addSelectedEdges: ve, unselectNodesAndEdges: Ee, multiSelectionActive: Ce } = $.getState();
    K && ($.setState({ nodesSelectionActive: !1 }), S.selected && Ce ? (Ee({ nodes: [], edges: [S] }), ee.current?.blur()) : ve([t])), a && a(me, S);
  }, ce = c ? (me) => {
    c(me, { ...S });
  } : void 0, ue = f ? (me) => {
    f(me, { ...S });
  } : void 0, q = p ? (me) => {
    p(me, { ...S });
  } : void 0, le = h ? (me) => {
    h(me, { ...S });
  } : void 0, we = g ? (me) => {
    g(me, { ...S });
  } : void 0, Se = (me) => {
    if (!T && wg.includes(me.key) && K) {
      const { unselectNodesAndEdges: ve, addSelectedEdges: Ee } = $.getState();
      me.key === "Escape" ? (ee.current?.blur(), ve({ edges: [S] })) : Ee([t]);
    }
  };
  return R.jsx("svg", { style: { zIndex: O }, children: R.jsxs("g", { className: We([
    "react-flow__edge",
    `react-flow__edge-${B}`,
    S.className,
    E,
    {
      selected: S.selected,
      animated: S.animated,
      inactive: !K && !a,
      updating: J,
      selectable: K
    }
  ]), onClick: ae, onDoubleClick: ce, onContextMenu: ue, onMouseEnter: q, onMouseMove: le, onMouseLeave: we, onKeyDown: F ? Se : void 0, tabIndex: F ? 0 : void 0, role: S.ariaRole ?? (F ? "group" : "img"), "aria-roledescription": "edge", "data-id": t, "data-testid": `rf__edge-${t}`, "aria-label": S.ariaLabel === null ? void 0 : S.ariaLabel || `Edge from ${S.source} to ${S.target}`, "aria-describedby": F ? `${qg}-${x}` : void 0, ref: ee, ...S.domAttributes, children: [!W && R.jsx(D, { id: t, source: S.source, target: S.target, type: S.type, selected: S.selected, animated: S.animated, selectable: K, deletable: S.deletable ?? !0, label: S.label, labelStyle: S.labelStyle, labelShowBg: S.labelShowBg, labelBgStyle: S.labelBgStyle, labelBgPadding: S.labelBgPadding, labelBgBorderRadius: S.labelBgBorderRadius, sourceX: V, sourceY: b, targetX: j, targetY: U, sourcePosition: C, targetPosition: H, data: S.data, style: S.style, sourceHandleId: S.sourceHandle, targetHandleId: S.targetHandle, markerStart: ie, markerEnd: re, pathOptions: "pathOptions" in S ? S.pathOptions : void 0, interactionWidth: S.interactionWidth }), Q && R.jsx(jS, { edge: S, isReconnectable: Q, reconnectRadius: m, onReconnect: v, onReconnectStart: y, onReconnectEnd: _, sourceX: V, sourceY: b, targetX: j, targetY: U, sourcePosition: C, targetPosition: H, setUpdateHover: A, setReconnecting: k })] }) });
}
var FS = Y.memo(HS);
const VS = (t) => ({
  edgesFocusable: t.edgesFocusable,
  edgesReconnectable: t.edgesReconnectable,
  elementsSelectable: t.elementsSelectable,
  connectionMode: t.connectionMode,
  onError: t.onError
});
function Cm({ defaultMarkerColor: t, onlyRenderVisibleElements: r, rfId: i, edgeTypes: l, noPanClassName: a, onReconnect: c, onEdgeContextMenu: f, onEdgeMouseEnter: p, onEdgeMouseMove: h, onEdgeMouseLeave: g, onEdgeClick: m, reconnectRadius: v, onEdgeDoubleClick: y, onReconnectStart: _, onReconnectEnd: x, disableKeyboardA11y: N }) {
  const { edgesFocusable: E, edgesReconnectable: M, elementsSelectable: T, onError: S } = Me(VS, He), P = NS(r);
  return R.jsxs("div", { className: "react-flow__edges", children: [R.jsx(TS, { defaultColor: t, rfId: i }), P.map((B) => R.jsx(FS, { id: B, edgesFocusable: E, edgesReconnectable: M, elementsSelectable: T, noPanClassName: a, onReconnect: c, onContextMenu: f, onMouseEnter: p, onMouseMove: h, onMouseLeave: g, onClick: m, reconnectRadius: v, onDoubleClick: y, onReconnectStart: _, onReconnectEnd: x, rfId: i, onError: S, edgeTypes: l, disableKeyboardA11y: N }, B))] });
}
Cm.displayName = "EdgeRenderer";
const BS = Y.memo(Cm), _h = (t) => `translate(${t[0]}px,${t[1]}px) scale(${t[2]})`;
function US({ children: t }) {
  const r = Re(), i = Y.useRef(null), [l] = Y.useState(() => r.getState().transform);
  return rm(() => {
    let a = null;
    const c = () => {
      const f = r.getState().transform;
      a && f[0] === a[0] && f[1] === a[1] && f[2] === a[2] || (a = f, i.current && (i.current.style.transform = _h(f)));
    };
    return c(), r.subscribe(c);
  }, [r]), R.jsx("div", { ref: i, className: "react-flow__viewport xyflow__viewport react-flow__container", style: { transform: _h(l) }, children: t });
}
function WS(t) {
  const r = Tl(), i = Y.useRef(!1);
  Y.useEffect(() => {
    !i.current && r.viewportInitialized && t && (setTimeout(() => t(r), 1), i.current = !0);
  }, [t, r.viewportInitialized]);
}
const XS = (t) => t.panZoom?.syncViewport;
function YS(t) {
  const r = Me(XS), i = Re();
  return Y.useEffect(() => {
    t && (r?.(t), i.setState({ transform: [t.x, t.y, t.zoom] }));
  }, [t, r]), null;
}
function ZS(t) {
  return t.connection.inProgress ? { ...t.connection, to: zi(t.connection.to, t.transform) } : { ...t.connection };
}
function QS(t) {
  return ZS;
}
function KS(t) {
  const r = QS();
  return Me(r, He);
}
const GS = (t) => ({
  nodesConnectable: t.nodesConnectable,
  isValid: t.connection.isValid,
  inProgress: t.connection.inProgress,
  width: t.width,
  height: t.height
});
function qS({ containerStyle: t, style: r, type: i, component: l }) {
  const { nodesConnectable: a, width: c, height: f, isValid: p, inProgress: h } = Me(GS, He);
  return !(c && a && h) ? null : R.jsx("svg", { style: t, width: c, height: f, className: "react-flow__connectionline react-flow__container", children: R.jsx("g", { className: We(["react-flow__connection", Ig(p)]), children: R.jsx(Nm, { style: r, type: i, CustomComponent: l, isValid: p }) }) });
}
const Nm = ({ style: t, type: r = Wn.Bezier, CustomComponent: i, isValid: l }) => {
  const { inProgress: a, from: c, fromNode: f, fromHandle: p, fromPosition: h, to: g, toNode: m, toHandle: v, toPosition: y, pointer: _ } = KS();
  if (!a)
    return;
  if (i)
    return R.jsx(i, { connectionLineType: r, connectionLineStyle: t, fromNode: f, fromHandle: p, fromX: c.x, fromY: c.y, toX: g.x, toY: g.y, fromPosition: h, toPosition: y, connectionStatus: Ig(l), toNode: m, toHandle: v, pointer: _ });
  let x = "";
  const N = {
    sourceX: c.x,
    sourceY: c.y,
    sourcePosition: h,
    targetX: g.x,
    targetY: g.y,
    targetPosition: y
  };
  switch (r) {
    case Wn.Bezier:
      [x] = Lg(N);
      break;
    case Wn.SimpleBezier:
      [x] = pm(N);
      break;
    case Wn.Step:
      [x] = ic({
        ...N,
        borderRadius: 0
      });
      break;
    case Wn.SmoothStep:
      [x] = ic(N);
      break;
    default:
      [x] = Og(N);
  }
  return R.jsx("path", { d: x, fill: "none", className: "react-flow__connection-path", style: t });
};
Nm.displayName = "ConnectionLine";
const JS = {};
function Sh(t = JS) {
  Y.useRef(t), Re(), Y.useEffect(() => {
  }, [t]);
}
function ek() {
  Re(), Y.useRef(!1), Y.useEffect(() => {
  }, []);
}
function Mm({ nodeTypes: t, edgeTypes: r, onInit: i, onNodeClick: l, onEdgeClick: a, onNodeDoubleClick: c, onEdgeDoubleClick: f, onNodeMouseEnter: p, onNodeMouseMove: h, onNodeMouseLeave: g, onNodeContextMenu: m, onSelectionContextMenu: v, onSelectionStart: y, onSelectionEnd: _, connectionLineType: x, connectionLineStyle: N, connectionLineComponent: E, connectionLineContainerStyle: M, selectionKeyCode: T, selectionOnDrag: S, selectionMode: P, multiSelectionKeyCode: B, panActivationKeyCode: D, zoomActivationKeyCode: F, deleteKeyCode: Q, onlyRenderVisibleElements: K, elementsSelectable: ee, defaultViewport: J, translateExtent: A, minZoom: W, maxZoom: k, preventScrolling: $, defaultMarkerColor: O, zoomOnScroll: V, zoomOnPinch: b, panOnScroll: j, panOnScrollSpeed: U, panOnScrollMode: C, zoomOnDoubleClick: H, panOnDrag: ie, autoPanOnSelection: re, onPaneClick: ae, onPaneMouseEnter: ce, onPaneMouseMove: ue, onPaneMouseLeave: q, onPaneScroll: le, onPaneContextMenu: we, paneClickDistance: Se, nodeClickDistance: me, onEdgeContextMenu: ve, onEdgeMouseEnter: Ee, onEdgeMouseMove: Ce, onEdgeMouseLeave: ze, reconnectRadius: Ve, onReconnect: Ct, onReconnectStart: at, onReconnectEnd: et, noDragClassName: tt, noWheelClassName: sn, noPanClassName: Yt, disableKeyboardA11y: Zt, nodeExtent: ut, rfId: Nt, viewport: mt, onViewportChange: Mt, nodesDraggable: Cr }) {
  return Sh(t), Sh(r), ek(), WS(i), YS(mt), R.jsx(mS, { onPaneClick: ae, onPaneMouseEnter: ce, onPaneMouseMove: ue, onPaneMouseLeave: q, onPaneContextMenu: we, onPaneScroll: le, paneClickDistance: Se, deleteKeyCode: Q, selectionKeyCode: T, selectionOnDrag: S, selectionMode: P, onSelectionStart: y, onSelectionEnd: _, multiSelectionKeyCode: B, panActivationKeyCode: D, zoomActivationKeyCode: F, elementsSelectable: ee, zoomOnScroll: V, zoomOnPinch: b, zoomOnDoubleClick: H, panOnScroll: j, panOnScrollSpeed: U, panOnScrollMode: C, panOnDrag: ie, autoPanOnSelection: re, defaultViewport: J, translateExtent: A, minZoom: W, maxZoom: k, onSelectionContextMenu: v, preventScrolling: $, noDragClassName: tt, noWheelClassName: sn, noPanClassName: Yt, disableKeyboardA11y: Zt, onViewportChange: Mt, isControlledViewport: !!mt, children: R.jsxs(US, { children: [R.jsx(BS, { edgeTypes: r, onEdgeClick: a, onEdgeDoubleClick: f, onReconnect: Ct, onReconnectStart: at, onReconnectEnd: et, onlyRenderVisibleElements: K, onEdgeContextMenu: ve, onEdgeMouseEnter: Ee, onEdgeMouseMove: Ce, onEdgeMouseLeave: ze, reconnectRadius: Ve, defaultMarkerColor: O, noPanClassName: Yt, disableKeyboardA11y: Zt, rfId: Nt }), R.jsx(qS, { style: N, type: x, component: E, containerStyle: M }), R.jsx("div", { className: "react-flow__edgelabel-renderer" }), R.jsx(CS, { nodeTypes: t, onNodeClick: l, onNodeDoubleClick: c, onNodeMouseEnter: p, onNodeMouseMove: h, onNodeMouseLeave: g, onNodeContextMenu: m, nodeClickDistance: me, onlyRenderVisibleElements: K, noPanClassName: Yt, noDragClassName: tt, disableKeyboardA11y: Zt, nodeExtent: ut, rfId: Nt, nodesDraggable: Cr }), R.jsx("div", { className: "react-flow__viewport-portal" })] }) });
}
Mm.displayName = "GraphView";
const tk = Y.memo(Mm), nk = Mg(), kh = ({ nodes: t, edges: r, defaultNodes: i, defaultEdges: l, width: a, height: c, fitView: f, fitViewOptions: p, minZoom: h = 0.5, maxZoom: g = 2, nodeOrigin: m, nodeExtent: v, zIndexMode: y = "basic" } = {}) => {
  const _ = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map(), N = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map(), M = l ?? r ?? [], T = i ?? t ?? [], S = m ?? [0, 0], P = v ?? yi;
  Hg(N, E, M);
  const { nodesInitialized: B } = lc(T, _, x, {
    nodeOrigin: S,
    nodeExtent: P,
    zIndexMode: y
  });
  let D = [0, 0, 1];
  if (f && a && c) {
    const F = Ni(_, {
      filter: (J) => !!((J.width || J.initialWidth) && (J.height || J.initialHeight))
    }), { x: Q, y: K, zoom: ee } = Cc(F, a, c, h, g, p?.padding ?? 0.1);
    D = [Q, K, ee];
  }
  return {
    rfId: "1",
    width: a ?? 0,
    height: c ?? 0,
    transform: D,
    nodes: T,
    nodesInitialized: B,
    nodeLookup: _,
    parentLookup: x,
    edges: M,
    edgeLookup: E,
    connectionLookup: N,
    onNodesChange: null,
    onEdgesChange: null,
    hasDefaultNodes: i !== void 0,
    hasDefaultEdges: l !== void 0,
    panZoom: null,
    minZoom: h,
    maxZoom: g,
    translateExtent: yi,
    nodeExtent: P,
    nodesSelectionActive: !1,
    userSelectionActive: !1,
    userSelectionRect: null,
    connectionMode: fo.Strict,
    domNode: null,
    paneDragging: !1,
    noPanClassName: "nopan",
    nodeOrigin: S,
    nodeDragThreshold: 1,
    connectionDragThreshold: 1,
    snapGrid: [15, 15],
    snapToGrid: !1,
    nodesDraggable: !0,
    nodesConnectable: !0,
    nodesFocusable: !0,
    edgesFocusable: !0,
    edgesReconnectable: !0,
    elementsSelectable: !0,
    elevateNodesOnSelect: !0,
    elevateEdgesOnSelect: !0,
    selectNodesOnDrag: !0,
    multiSelectionActive: !1,
    fitViewQueued: f ?? !1,
    fitViewOptions: p,
    fitViewResolver: null,
    connection: { ..._g },
    connectionClickStartHandle: null,
    connectOnClick: !0,
    ariaLiveMessage: "",
    autoPanOnConnect: !0,
    autoPanOnNodeDrag: !0,
    autoPanOnNodeFocus: !0,
    autoPanSpeed: 15,
    connectionRadius: 20,
    onError: nk,
    isValidConnection: void 0,
    onSelectionChangeHandlers: [],
    lib: "react",
    debug: !1,
    ariaLabelConfig: xg,
    zIndexMode: y,
    defaultEdgeOptions: void 0,
    onNodesChangeMiddlewareMap: /* @__PURE__ */ new Map(),
    onEdgesChangeMiddlewareMap: /* @__PURE__ */ new Map(),
    onNodesDelete: void 0,
    onEdgesDelete: void 0,
    onDelete: void 0,
    onBeforeDelete: void 0,
    onViewportChangeStart: void 0,
    onViewportChange: void 0,
    onViewportChangeEnd: void 0,
    onNodeDragStart: void 0,
    onNodeDrag: void 0,
    onNodeDragStop: void 0,
    onSelectionDragStart: void 0,
    onSelectionDrag: void 0,
    onSelectionDragStop: void 0,
    onMoveStart: void 0,
    onMove: void 0,
    onMoveEnd: void 0,
    onConnect: void 0,
    onConnectStart: void 0,
    onConnectEnd: void 0,
    onClickConnectStart: void 0,
    onClickConnectEnd: void 0
  };
}, rk = ({ nodes: t, edges: r, defaultNodes: i, defaultEdges: l, width: a, height: c, fitView: f, fitViewOptions: p, minZoom: h, maxZoom: g, nodeOrigin: m, nodeExtent: v, zIndexMode: y }) => y_((_, x) => {
  async function N() {
    const { nodeLookup: E, panZoom: M, fitViewOptions: T, fitViewResolver: S, width: P, height: B, minZoom: D, maxZoom: F } = x();
    M && (await d1({
      nodes: E,
      width: P,
      height: B,
      panZoom: M,
      minZoom: D,
      maxZoom: F
    }, T), S?.resolve(!0), _({ fitViewResolver: null }));
  }
  return {
    ...kh({
      nodes: t,
      edges: r,
      width: a,
      height: c,
      fitView: f,
      fitViewOptions: p,
      minZoom: h,
      maxZoom: g,
      nodeOrigin: m,
      nodeExtent: v,
      defaultNodes: i,
      defaultEdges: l,
      zIndexMode: y
    }),
    setNodes: (E) => {
      const { nodeLookup: M, parentLookup: T, nodeOrigin: S, nodeExtent: P, elevateNodesOnSelect: B, fitViewQueued: D, zIndexMode: F, nodesSelectionActive: Q } = x(), { nodesInitialized: K, hasSelectedNodes: ee } = lc(E, M, T, {
        nodeOrigin: S,
        nodeExtent: P,
        elevateNodesOnSelect: B,
        checkEquality: !0,
        zIndexMode: F
      }), J = Q && ee;
      D && K ? (N(), _({
        nodes: E,
        nodesInitialized: K,
        fitViewQueued: !1,
        fitViewOptions: void 0,
        nodesSelectionActive: J
      })) : _({ nodes: E, nodesInitialized: K, nodesSelectionActive: J });
    },
    setEdges: (E) => {
      const { connectionLookup: M, edgeLookup: T } = x();
      Hg(M, T, E), _({ edges: E });
    },
    setDefaultNodesAndEdges: (E, M) => {
      if (E) {
        const { setNodes: T } = x();
        T(E), _({ hasDefaultNodes: !0 });
      }
      if (M) {
        const { setEdges: T } = x();
        T(M), _({ hasDefaultEdges: !0 });
      }
    },
    /*
     * Every node gets registered at a ResizeObserver. Whenever a node
     * changes its dimensions, this function is called to measure the
     * new dimensions and update the nodes.
     */
    updateNodeInternals: (E) => {
      const { triggerNodeChanges: M, nodeLookup: T, parentLookup: S, domNode: P, nodeOrigin: B, nodeExtent: D, debug: F, fitViewQueued: Q, zIndexMode: K } = x(), { changes: ee, updatedInternals: J } = $1(E, T, S, P, B, D, K);
      J && (b1(T, S, { nodeOrigin: B, nodeExtent: D, zIndexMode: K }), Q ? (N(), _({ fitViewQueued: !1, fitViewOptions: void 0 })) : _({}), ee?.length > 0 && (F && console.log("React Flow: trigger node changes", ee), M?.(ee)));
    },
    updateNodePositions: (E, M = !1) => {
      const T = [];
      let S = [];
      const { nodeLookup: P, triggerNodeChanges: B, connection: D, updateConnection: F, onNodesChangeMiddlewareMap: Q } = x();
      for (const [K, ee] of E) {
        const J = P.get(K), A = !!(J?.expandParent && J?.parentId && ee?.position), W = {
          id: K,
          type: "position",
          position: A ? {
            x: Math.max(0, ee.position.x),
            y: Math.max(0, ee.position.y)
          } : ee.position,
          dragging: M
        };
        if (J && D.inProgress && D.fromNode.id === J.id) {
          const k = Er(J, D.fromHandle, ye.Left, !0);
          F({ ...D, from: k });
        }
        A && J.parentId && T.push({
          id: K,
          parentId: J.parentId,
          rect: {
            ...ee.internals.positionAbsolute,
            width: ee.measured.width ?? 0,
            height: ee.measured.height ?? 0
          }
        }), S.push(W);
      }
      if (T.length > 0) {
        const { parentLookup: K, nodeOrigin: ee } = x(), J = Tc(T, P, K, ee);
        S.push(...J);
      }
      for (const K of Q.values())
        S = K(S);
      B(S);
    },
    triggerNodeChanges: (E) => {
      const { onNodesChange: M, setNodes: T, nodes: S, hasDefaultNodes: P, debug: B } = x();
      if (E?.length) {
        if (P) {
          const D = bc(E, S);
          T(D);
        }
        B && console.log("React Flow: trigger node changes", E), M?.(E);
      }
    },
    triggerEdgeChanges: (E) => {
      const { onEdgesChange: M, setEdges: T, edges: S, hasDefaultEdges: P, debug: B } = x();
      if (E?.length) {
        if (P) {
          const D = tm(E, S);
          T(D);
        }
        B && console.log("React Flow: trigger edge changes", E), M?.(E);
      }
    },
    addSelectedNodes: (E) => {
      const { multiSelectionActive: M, edgeLookup: T, nodeLookup: S, triggerNodeChanges: P, triggerEdgeChanges: B } = x();
      if (M) {
        const D = E.map((F) => hr(F, !0));
        P(D);
        return;
      }
      P(no(S, /* @__PURE__ */ new Set([...E]))), B(no(T));
    },
    addSelectedEdges: (E) => {
      const { multiSelectionActive: M, edgeLookup: T, nodeLookup: S, triggerNodeChanges: P, triggerEdgeChanges: B } = x();
      if (M) {
        const D = E.map((F) => hr(F, !0));
        B(D);
        return;
      }
      B(no(T, /* @__PURE__ */ new Set([...E]))), P(no(S, /* @__PURE__ */ new Set()));
    },
    unselectNodesAndEdges: ({ nodes: E, edges: M } = {}) => {
      const { edges: T, nodes: S, nodeLookup: P, triggerNodeChanges: B, triggerEdgeChanges: D } = x(), F = E || S, Q = M || T, K = [];
      for (const J of F)
        J.selected && K.push(hr(J.id, !1));
      const ee = [];
      for (const J of Q)
        J.selected && ee.push(hr(J.id, !1));
      B(K), D(ee);
    },
    setMinZoom: (E) => {
      const { panZoom: M, maxZoom: T } = x();
      M?.setScaleExtent([E, T]), _({ minZoom: E });
    },
    setMaxZoom: (E) => {
      const { panZoom: M, minZoom: T } = x();
      M?.setScaleExtent([T, E]), _({ maxZoom: E });
    },
    setTranslateExtent: (E) => {
      x().panZoom?.setTranslateExtent(E), _({ translateExtent: E });
    },
    resetSelectedElements: () => {
      const { edges: E, nodes: M, triggerNodeChanges: T, triggerEdgeChanges: S, elementsSelectable: P } = x();
      if (!P)
        return;
      const B = M.reduce((F, Q) => Q.selected ? [...F, hr(Q.id, !1)] : F, []), D = E.reduce((F, Q) => Q.selected ? [...F, hr(Q.id, !1)] : F, []);
      T(B), S(D);
    },
    setNodeExtent: (E) => {
      const { nodes: M, nodeLookup: T, parentLookup: S, nodeOrigin: P, elevateNodesOnSelect: B, nodeExtent: D, zIndexMode: F } = x();
      E[0][0] === D[0][0] && E[0][1] === D[0][1] && E[1][0] === D[1][0] && E[1][1] === D[1][1] || (lc(M, T, S, {
        nodeOrigin: P,
        nodeExtent: E,
        elevateNodesOnSelect: B,
        checkEquality: !1,
        zIndexMode: F
      }), _({ nodeExtent: E }));
    },
    panBy: (E) => {
      const { transform: M, width: T, height: S, panZoom: P, translateExtent: B } = x();
      return O1({ delta: E, panZoom: P, transform: M, translateExtent: B, width: T, height: S });
    },
    setCenter: async (E, M, T) => {
      const { width: S, height: P, maxZoom: B, panZoom: D } = x();
      if (!D)
        return !1;
      const F = typeof T?.zoom < "u" ? T.zoom : B;
      return await D.setViewport({
        x: S / 2 - E * F,
        y: P / 2 - M * F,
        zoom: F
      }, { duration: T?.duration, ease: T?.ease, interpolate: T?.interpolate }), !0;
    },
    cancelConnection: () => {
      _({
        connection: { ..._g }
      });
    },
    updateConnection: (E) => {
      _({ connection: E });
    },
    reset: () => _({ ...kh() })
  };
}, Object.is);
function ok({ initialNodes: t, initialEdges: r, defaultNodes: i, defaultEdges: l, initialWidth: a, initialHeight: c, initialMinZoom: f, initialMaxZoom: p, initialFitViewOptions: h, fitView: g, nodeOrigin: m, nodeExtent: v, zIndexMode: y, children: _ }) {
  const [x] = Y.useState(() => rk({
    nodes: t,
    edges: r,
    defaultNodes: i,
    defaultEdges: l,
    width: a,
    height: c,
    fitView: g,
    minZoom: f,
    maxZoom: p,
    fitViewOptions: h,
    nodeOrigin: m,
    nodeExtent: v,
    zIndexMode: y
  }));
  return R.jsx(v_, { value: x, children: R.jsx(V_, { children: R.jsx(rS, { children: _ }) }) });
}
function ik({ children: t, nodes: r, edges: i, defaultNodes: l, defaultEdges: a, width: c, height: f, fitView: p, fitViewOptions: h, minZoom: g, maxZoom: m, nodeOrigin: v, nodeExtent: y, zIndexMode: _ }) {
  return Y.useContext(Pl) ? R.jsx(R.Fragment, { children: t }) : R.jsx(ok, { initialNodes: r, initialEdges: i, defaultNodes: l, defaultEdges: a, initialWidth: c, initialHeight: f, fitView: p, initialFitViewOptions: h, initialMinZoom: g, initialMaxZoom: m, nodeOrigin: v, nodeExtent: y, zIndexMode: _, children: t });
}
const sk = {
  width: "100%",
  height: "100%",
  overflow: "hidden",
  position: "relative",
  zIndex: 0
};
function lk({ nodes: t, edges: r, defaultNodes: i, defaultEdges: l, className: a, nodeTypes: c, edgeTypes: f, onNodeClick: p, onEdgeClick: h, onInit: g, onMove: m, onMoveStart: v, onMoveEnd: y, onConnect: _, onConnectStart: x, onConnectEnd: N, onClickConnectStart: E, onClickConnectEnd: M, onNodeMouseEnter: T, onNodeMouseMove: S, onNodeMouseLeave: P, onNodeContextMenu: B, onNodeDoubleClick: D, onNodeDragStart: F, onNodeDrag: Q, onNodeDragStop: K, onNodesDelete: ee, onEdgesDelete: J, onDelete: A, onSelectionChange: W, onSelectionDragStart: k, onSelectionDrag: $, onSelectionDragStop: O, onSelectionContextMenu: V, onSelectionStart: b, onSelectionEnd: j, onBeforeDelete: U, connectionMode: C, connectionLineType: H = Wn.Bezier, connectionLineStyle: ie, connectionLineComponent: re, connectionLineContainerStyle: ae, deleteKeyCode: ce = "Backspace", selectionKeyCode: ue = "Shift", selectionOnDrag: q = !1, selectionMode: le = vi.Full, panActivationKeyCode: we = "Space", multiSelectionKeyCode: Se = xi() ? "Meta" : "Control", zoomActivationKeyCode: me = xi() ? "Meta" : "Control", snapToGrid: ve, snapGrid: Ee, onlyRenderVisibleElements: Ce = !1, selectNodesOnDrag: ze, nodesDraggable: Ve, autoPanOnNodeFocus: Ct, nodesConnectable: at, nodesFocusable: et, nodeOrigin: tt = Jg, edgesFocusable: sn, edgesReconnectable: Yt, elementsSelectable: Zt = !0, defaultViewport: ut = T_, minZoom: Nt = 0.5, maxZoom: mt = 2, translateExtent: Mt = yi, preventScrolling: Cr = !0, nodeExtent: ln, defaultMarkerColor: Zn = "#b1b1b7", zoomOnScroll: Dl = !0, zoomOnPinch: Pi = !0, panOnScroll: Ii = !1, panOnScrollSpeed: Ll = 0.5, panOnScrollMode: yo = vr.Free, zoomOnDoubleClick: vo = !0, panOnDrag: wo = !0, onPaneClick: xo, onPaneMouseEnter: _o, onPaneMouseMove: _n, onPaneMouseLeave: Sn, onPaneScroll: Ti, onPaneContextMenu: bi, paneClickDistance: Ri = 1, nodeClickDistance: Di = 0, children: Li, onReconnect: So, onReconnectStart: $i, onReconnectEnd: Qn, onEdgeContextMenu: ko, onEdgeDoubleClick: Kn, onEdgeMouseEnter: $l, onEdgeMouseMove: Gn, onEdgeMouseLeave: Nr, reconnectRadius: Mr = 10, onNodesChange: Eo, onEdgesChange: Ol, noDragClassName: Al = "nodrag", noWheelClassName: jl = "nowheel", noPanClassName: Qt = "nopan", fitView: Co, fitViewOptions: No, connectOnClick: Hl, attributionPosition: Oi, proOptions: Ai, defaultEdgeOptions: ji, elevateNodesOnSelect: Hi = !0, elevateEdgesOnSelect: Fl = !1, disableKeyboardA11y: Fi = !1, autoPanOnConnect: Oe, autoPanOnNodeDrag: Vl, autoPanOnSelection: Mo = !0, autoPanSpeed: Vi, connectionRadius: zr, isValidConnection: Bl, onError: Bi, style: Pr, id: yt, nodeDragThreshold: Ul, connectionDragThreshold: vt, viewport: Wl, onViewportChange: Xl, width: Yl, height: Ir, colorMode: Tr = "light", debug: qn, onScroll: Jn, ariaLabelConfig: Zl, zIndexMode: Ui = "basic", ...zo }, Wi) {
  const er = yt || "1", tr = L_(Tr), Ql = Y.useCallback((br) => {
    br.currentTarget.scrollTo({ top: 0, left: 0, behavior: "instant" }), Jn?.(br);
  }, [Jn]);
  return R.jsx("div", { "data-testid": "rf__wrapper", ...zo, onScroll: Ql, style: { ...Pr, ...sk }, ref: Wi, className: We(["react-flow", a, tr]), id: yt, role: "application", children: R.jsxs(ik, { nodes: t, edges: r, width: Yl, height: Ir, fitView: Co, fitViewOptions: No, minZoom: Nt, maxZoom: mt, nodeOrigin: tt, nodeExtent: ln, zIndexMode: Ui, children: [R.jsx(D_, { nodes: t, edges: r, defaultNodes: i, defaultEdges: l, onConnect: _, onConnectStart: x, onConnectEnd: N, onClickConnectStart: E, onClickConnectEnd: M, nodesDraggable: Ve, autoPanOnNodeFocus: Ct, nodesConnectable: at, nodesFocusable: et, edgesFocusable: sn, edgesReconnectable: Yt, elementsSelectable: Zt, elevateNodesOnSelect: Hi, elevateEdgesOnSelect: Fl, minZoom: Nt, maxZoom: mt, nodeExtent: ln, onNodesChange: Eo, onEdgesChange: Ol, snapToGrid: ve, snapGrid: Ee, connectionMode: C, translateExtent: Mt, connectOnClick: Hl, defaultEdgeOptions: ji, fitView: Co, fitViewOptions: No, onNodesDelete: ee, onEdgesDelete: J, onDelete: A, onNodeDragStart: F, onNodeDrag: Q, onNodeDragStop: K, onSelectionDrag: $, onSelectionDragStart: k, onSelectionDragStop: O, onMove: m, onMoveStart: v, onMoveEnd: y, noPanClassName: Qt, nodeOrigin: tt, rfId: er, autoPanOnConnect: Oe, autoPanOnNodeDrag: Vl, autoPanSpeed: Vi, onError: Bi, connectionRadius: zr, isValidConnection: Bl, selectNodesOnDrag: ze, nodeDragThreshold: Ul, connectionDragThreshold: vt, onBeforeDelete: U, debug: qn, ariaLabelConfig: Zl, zIndexMode: Ui }), R.jsx(tk, { onInit: g, onNodeClick: p, onEdgeClick: h, onNodeMouseEnter: T, onNodeMouseMove: S, onNodeMouseLeave: P, onNodeContextMenu: B, onNodeDoubleClick: D, nodeTypes: c, edgeTypes: f, connectionLineType: H, connectionLineStyle: ie, connectionLineComponent: re, connectionLineContainerStyle: ae, selectionKeyCode: ue, selectionOnDrag: q, selectionMode: le, deleteKeyCode: ce, multiSelectionKeyCode: Se, panActivationKeyCode: we, zoomActivationKeyCode: me, onlyRenderVisibleElements: Ce, defaultViewport: ut, translateExtent: Mt, minZoom: Nt, maxZoom: mt, preventScrolling: Cr, zoomOnScroll: Dl, zoomOnPinch: Pi, zoomOnDoubleClick: vo, panOnScroll: Ii, panOnScrollSpeed: Ll, panOnScrollMode: yo, panOnDrag: wo, autoPanOnSelection: Mo, onPaneClick: xo, onPaneMouseEnter: _o, onPaneMouseMove: _n, onPaneMouseLeave: Sn, onPaneScroll: Ti, onPaneContextMenu: bi, paneClickDistance: Ri, nodeClickDistance: Di, onSelectionContextMenu: V, onSelectionStart: b, onSelectionEnd: j, onReconnect: So, onReconnectStart: $i, onReconnectEnd: Qn, onEdgeContextMenu: ko, onEdgeDoubleClick: Kn, onEdgeMouseEnter: $l, onEdgeMouseMove: Gn, onEdgeMouseLeave: Nr, reconnectRadius: Mr, defaultMarkerColor: Zn, noDragClassName: Al, noWheelClassName: jl, noPanClassName: Qt, rfId: er, disableKeyboardA11y: Fi, nodeExtent: ln, viewport: Wl, onViewportChange: Xl, nodesDraggable: Ve }), R.jsx(I_, { onSelectionChange: W }), Li, R.jsx(C_, { proOptions: Ai, position: Oi }), R.jsx(E_, { rfId: er, disableKeyboardA11y: Fi })] }) });
}
var zm = nm(lk);
function ak() {
  const t = Re();
  return Y.useCallback((r) => {
    const { domNode: i, updateNodeInternals: l } = t.getState(), a = Array.isArray(r) ? r : [r], c = /* @__PURE__ */ new Map();
    a.forEach((f) => {
      const p = i?.querySelector(`.react-flow__node[data-id="${f}"]`);
      p && c.set(f, { id: f, nodeElement: p, force: !0 });
    }), requestAnimationFrame(() => l(c, { triggerFitView: !1 }));
  }, []);
}
function uk({ dimensions: t, lineWidth: r, variant: i, className: l }) {
  return R.jsx("path", { strokeWidth: r, d: `M${t[0] / 2} 0 V${t[1]} M0 ${t[1] / 2} H${t[0]}`, className: We(["react-flow__background-pattern", i, l]) });
}
function ck({ radius: t, className: r }) {
  return R.jsx("circle", { cx: t, cy: t, r: t, className: We(["react-flow__background-pattern", "dots", r]) });
}
var Xn;
(function(t) {
  t.Lines = "lines", t.Dots = "dots", t.Cross = "cross";
})(Xn || (Xn = {}));
const fk = {
  [Xn.Dots]: 1,
  [Xn.Lines]: 1,
  [Xn.Cross]: 6
}, dk = (t) => ({ transform: t.transform, patternId: `pattern-${t.rfId}` });
function Pm({
  id: t,
  variant: r = Xn.Dots,
  // only used for dots and cross
  gap: i = 20,
  // only used for lines and cross
  size: l,
  lineWidth: a = 1,
  offset: c = 0,
  color: f,
  bgColor: p,
  style: h,
  className: g,
  patternClassName: m
}) {
  const v = Y.useRef(null), { transform: y, patternId: _ } = Me(dk, He), x = l || fk[r], N = r === Xn.Dots, E = r === Xn.Cross, M = Array.isArray(i) ? i : [i, i], T = [M[0] * y[2] || 1, M[1] * y[2] || 1], S = x * y[2], P = Array.isArray(c) ? c : [c, c], B = E ? [S, S] : T, D = [
    P[0] * y[2] + B[0] / 2,
    P[1] * y[2] + B[1] / 2
  ], F = `${_}${t || ""}`;
  return R.jsxs("svg", { className: We(["react-flow__background", g]), style: {
    ...h,
    ...bl,
    "--xy-background-color-props": p,
    "--xy-background-pattern-color-props": f
  }, ref: v, "data-testid": "rf__background", children: [R.jsx("pattern", { id: F, x: y[0] % T[0], y: y[1] % T[1], width: T[0], height: T[1], patternUnits: "userSpaceOnUse", patternTransform: `translate(-${D[0]},-${D[1]})`, children: N ? R.jsx(ck, { radius: S / 2, className: m }) : R.jsx(uk, { dimensions: B, lineWidth: a, variant: r, className: m }) }), R.jsx("rect", { x: "0", y: "0", width: "100%", height: "100%", fill: `url(#${F})` })] });
}
Pm.displayName = "Background";
const Im = Y.memo(Pm);
function pk() {
  return R.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 32", children: R.jsx("path", { d: "M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z" }) });
}
function hk() {
  return R.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 5", children: R.jsx("path", { d: "M0 0h32v4.2H0z" }) });
}
function gk() {
  return R.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 30", children: R.jsx("path", { d: "M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0027.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94c-.531 0-.939-.4-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z" }) });
}
function mk() {
  return R.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 25 32", children: R.jsx("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z" }) });
}
function yk() {
  return R.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 25 32", children: R.jsx("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047z" }) });
}
function tl({ children: t, className: r, ...i }) {
  return R.jsx("button", { type: "button", className: We(["react-flow__controls-button", r]), ...i, children: t });
}
const vk = (t) => ({
  isInteractive: t.nodesDraggable || t.nodesConnectable || t.elementsSelectable,
  minZoomReached: t.transform[2] <= t.minZoom,
  maxZoomReached: t.transform[2] >= t.maxZoom,
  ariaLabelConfig: t.ariaLabelConfig
});
function Tm({ style: t, showZoom: r = !0, showFitView: i = !0, showInteractive: l = !0, fitViewOptions: a, onZoomIn: c, onZoomOut: f, onFitView: p, onInteractiveChange: h, className: g, children: m, position: v = "bottom-left", orientation: y = "vertical", "aria-label": _ }) {
  const x = Re(), { isInteractive: N, minZoomReached: E, maxZoomReached: M, ariaLabelConfig: T } = Me(vk, He), { zoomIn: S, zoomOut: P, fitView: B } = Tl(), D = () => {
    S(), c?.();
  }, F = () => {
    P(), f?.();
  }, Q = () => {
    B(a), p?.();
  }, K = () => {
    x.setState({
      nodesDraggable: !N,
      nodesConnectable: !N,
      elementsSelectable: !N
    }), h?.(!N);
  }, ee = y === "horizontal" ? "horizontal" : "vertical";
  return R.jsxs(Il, { className: We(["react-flow__controls", ee, g]), position: v, style: t, "data-testid": "rf__controls", "aria-label": _ ?? T["controls.ariaLabel"], children: [r && R.jsxs(R.Fragment, { children: [R.jsx(tl, { onClick: D, className: "react-flow__controls-zoomin", title: T["controls.zoomIn.ariaLabel"], "aria-label": T["controls.zoomIn.ariaLabel"], disabled: M, children: R.jsx(pk, {}) }), R.jsx(tl, { onClick: F, className: "react-flow__controls-zoomout", title: T["controls.zoomOut.ariaLabel"], "aria-label": T["controls.zoomOut.ariaLabel"], disabled: E, children: R.jsx(hk, {}) })] }), i && R.jsx(tl, { className: "react-flow__controls-fitview", onClick: Q, title: T["controls.fitView.ariaLabel"], "aria-label": T["controls.fitView.ariaLabel"], children: R.jsx(gk, {}) }), l && R.jsx(tl, { className: "react-flow__controls-interactive", onClick: K, title: T["controls.interactive.ariaLabel"], "aria-label": T["controls.interactive.ariaLabel"], children: N ? R.jsx(yk, {}) : R.jsx(mk, {}) }), m] });
}
Tm.displayName = "Controls";
const bm = Y.memo(Tm);
function wk({ id: t, x: r, y: i, width: l, height: a, style: c, color: f, strokeColor: p, strokeWidth: h, className: g, borderRadius: m, shapeRendering: v, selected: y, onClick: _ }) {
  const { background: x, backgroundColor: N } = c || {}, E = f || x || N;
  return R.jsx("rect", { className: We(["react-flow__minimap-node", { selected: y }, g]), x: r, y: i, rx: m, ry: m, width: l, height: a, style: {
    fill: E,
    stroke: p,
    strokeWidth: h
  }, shapeRendering: v, onClick: _ ? (M) => _(M, t) : void 0 });
}
const xk = Y.memo(wk), _k = (t) => t.nodes.map((r) => r.id), Yu = (t) => t instanceof Function ? t : () => t;
function Sk({
  nodeStrokeColor: t,
  nodeColor: r,
  nodeClassName: i = "",
  nodeBorderRadius: l = 5,
  nodeStrokeWidth: a,
  /*
   * We need to rename the prop to be `CapitalCase` so that JSX will render it as
   * a component properly.
   */
  nodeComponent: c = xk,
  onClick: f
}) {
  const p = Me(_k, He), h = Yu(r), g = Yu(t), m = Yu(i), v = typeof window > "u" || window.chrome ? "crispEdges" : "geometricPrecision";
  return R.jsx(R.Fragment, { children: p.map((y) => (
    /*
     * The split of responsibilities between MiniMapNodes and
     * NodeComponentWrapper may appear weird. However, it’s designed to
     * minimize the cost of updates when individual nodes change.
     *
     * For more details, see a similar commit in `NodeRenderer/index.tsx`.
     */
    R.jsx(Ek, { id: y, nodeColorFunc: h, nodeStrokeColorFunc: g, nodeClassNameFunc: m, nodeBorderRadius: l, nodeStrokeWidth: a, NodeComponent: c, onClick: f, shapeRendering: v }, y)
  )) });
}
function kk({ id: t, nodeColorFunc: r, nodeStrokeColorFunc: i, nodeClassNameFunc: l, nodeBorderRadius: a, nodeStrokeWidth: c, shapeRendering: f, NodeComponent: p, onClick: h }) {
  const { node: g, x: m, y: v, width: y, height: _ } = Me((x) => {
    const N = x.nodeLookup.get(t);
    if (!N)
      return { node: void 0, x: 0, y: 0, width: 0, height: 0 };
    const E = N.internals.userNode, { x: M, y: T } = N.internals.positionAbsolute, { width: S, height: P } = Xt(E);
    return {
      node: E,
      x: M,
      y: T,
      width: S,
      height: P
    };
  }, He);
  return !g || g.hidden || !zg(g) ? null : R.jsx(p, { x: m, y: v, width: y, height: _, style: g.style, selected: !!g.selected, className: l(g), color: r(g), borderRadius: a, strokeColor: i(g), strokeWidth: c, shapeRendering: f, onClick: h, id: g.id });
}
const Ek = Y.memo(kk);
var Ck = Y.memo(Sk);
const Nk = 200, Mk = 150, zk = (t) => !t.hidden, Pk = (t) => {
  const r = {
    x: -t.transform[0] / t.transform[2],
    y: -t.transform[1] / t.transform[2],
    width: t.width / t.transform[2],
    height: t.height / t.transform[2]
  };
  let i = !1;
  for (const l of t.nodeLookup.values())
    if (!l.hidden) {
      i = !0;
      break;
    }
  return {
    viewBB: r,
    boundingRect: i ? Cg(Ni(t.nodeLookup, { filter: zk }), r) : r,
    rfId: t.rfId,
    panZoom: t.panZoom,
    translateExtent: t.translateExtent,
    flowWidth: t.width,
    flowHeight: t.height,
    ariaLabelConfig: t.ariaLabelConfig
  };
}, Eh = (t, r) => t.x === r.x && t.y === r.y && t.width === r.width && t.height === r.height, Ik = (t, r) => Eh(t.viewBB, r.viewBB) && Eh(t.boundingRect, r.boundingRect) && t.rfId === r.rfId && t.panZoom === r.panZoom && t.translateExtent === r.translateExtent && t.flowWidth === r.flowWidth && t.flowHeight === r.flowHeight && t.ariaLabelConfig === r.ariaLabelConfig, Tk = "react-flow__minimap-desc";
function Rm({
  style: t,
  className: r,
  nodeStrokeColor: i,
  nodeColor: l,
  nodeClassName: a = "",
  nodeBorderRadius: c = 5,
  nodeStrokeWidth: f,
  /*
   * We need to rename the prop to be `CapitalCase` so that JSX will render it as
   * a component properly.
   */
  nodeComponent: p,
  bgColor: h,
  maskColor: g,
  maskStrokeColor: m,
  maskStrokeWidth: v,
  position: y = "bottom-right",
  onClick: _,
  onNodeClick: x,
  pannable: N = !1,
  zoomable: E = !1,
  ariaLabel: M,
  inversePan: T,
  zoomStep: S = 1,
  offsetScale: P = 5
}) {
  const B = Re(), D = Y.useRef(null), { boundingRect: F, panZoom: Q, viewBB: K, rfId: ee, translateExtent: J, flowWidth: A, flowHeight: W, ariaLabelConfig: k } = Me(Pk, Ik), $ = t?.width ?? Nk, O = t?.height ?? Mk, V = F.width / $, b = F.height / O, j = Math.max(V, b), U = j * $, C = j * O, H = P * j, ie = F.x - (U - F.width) / 2 - H, re = F.y - (C - F.height) / 2 - H, ae = U + H * 2, ce = C + H * 2, ue = `${Tk}-${ee}`, q = Y.useRef(0), le = Y.useRef();
  q.current = j, Y.useEffect(() => {
    const Ee = B.getState().panZoom;
    if (D.current && Ee)
      return le.current = X1({
        domNode: D.current,
        panZoom: Ee,
        getTransform: () => B.getState().transform,
        getViewScale: () => q.current
      }), () => {
        le.current?.destroy();
      };
  }, [Q]), Y.useEffect(() => {
    le.current?.update({
      translateExtent: J,
      width: A,
      height: W,
      inversePan: T,
      pannable: N,
      zoomStep: S,
      zoomable: E
    });
  }, [N, E, T, S, J, A, W]);
  const we = _ ? (Ee) => {
    const [Ce, ze] = le.current?.pointer(Ee) || [0, 0];
    _(Ee, { x: Ce, y: ze });
  } : void 0, Se = Y.useCallback((Ee, Ce) => {
    const ze = B.getState().nodeLookup.get(Ce).internals.userNode;
    x?.(Ee, ze);
  }, [x]), me = x ? Se : void 0, ve = M ?? k["minimap.ariaLabel"];
  return R.jsx(Il, { position: y, style: {
    ...t,
    "--xy-minimap-background-color-props": typeof h == "string" ? h : void 0,
    "--xy-minimap-mask-background-color-props": typeof g == "string" ? g : void 0,
    "--xy-minimap-mask-stroke-color-props": typeof m == "string" ? m : void 0,
    "--xy-minimap-mask-stroke-width-props": typeof v == "number" ? v * j : void 0,
    "--xy-minimap-node-background-color-props": typeof l == "string" ? l : void 0,
    "--xy-minimap-node-stroke-color-props": typeof i == "string" ? i : void 0,
    "--xy-minimap-node-stroke-width-props": typeof f == "number" ? f : void 0
  }, className: We(["react-flow__minimap", r]), "data-testid": "rf__minimap", children: R.jsxs("svg", { width: $, height: O, viewBox: `${ie} ${re} ${ae} ${ce}`, className: "react-flow__minimap-svg", role: "img", "aria-labelledby": ue, ref: D, onClick: we, children: [ve && R.jsx("title", { id: ue, children: ve }), R.jsx(Ck, { onClick: me, nodeColor: l, nodeStrokeColor: i, nodeBorderRadius: c, nodeClassName: a, nodeStrokeWidth: f, nodeComponent: p }), R.jsx("path", { className: "react-flow__minimap-mask", d: `M${ie - H},${re - H}h${ae + H * 2}v${ce + H * 2}h${-ae - H * 2}z
        M${K.x},${K.y}h${K.width}v${K.height}h${-K.width}z`, fillRule: "evenodd", pointerEvents: "none" })] }) });
}
Rm.displayName = "MiniMap";
const bk = Y.memo(Rm), Rk = (t) => (r) => t ? `${Math.max(1 / r.transform[2], 1)}` : void 0, Dk = {
  [go.Line]: "right",
  [go.Handle]: "bottom-right"
};
function Lk({ nodeId: t, position: r, variant: i = go.Handle, className: l, style: a = void 0, children: c, color: f, minWidth: p = 10, minHeight: h = 10, maxWidth: g = Number.MAX_VALUE, maxHeight: m = Number.MAX_VALUE, keepAspectRatio: v = !1, resizeDirection: y, autoScale: _ = !0, shouldResize: x, onResizeStart: N, onResize: E, onResizeEnd: M }) {
  const T = lm(), S = typeof t == "string" ? t : T, P = Re(), B = Y.useRef(null), D = i === go.Handle, F = Me(Y.useCallback(Rk(D && _), [D, _]), He), Q = Y.useRef(null), K = r ?? Dk[i];
  Y.useEffect(() => {
    if (!(!B.current || !S))
      return Q.current || (Q.current = i_({
        domNode: B.current,
        nodeId: S,
        getStoreItems: () => {
          const { nodeLookup: J, transform: A, snapGrid: W, snapToGrid: k, nodeOrigin: $, domNode: O } = P.getState();
          return {
            nodeLookup: J,
            transform: A,
            snapGrid: W,
            snapToGrid: k,
            nodeOrigin: $,
            paneDomNode: O
          };
        },
        onChange: (J, A) => {
          const { triggerNodeChanges: W, nodeLookup: k, parentLookup: $, nodeOrigin: O } = P.getState(), V = [], b = { x: J.x, y: J.y }, j = k.get(S);
          if (j && j.expandParent && j.parentId) {
            const U = j.origin ?? O, C = J.width ?? j.measured.width ?? 0, H = J.height ?? j.measured.height ?? 0, ie = {
              id: j.id,
              parentId: j.parentId,
              rect: {
                width: C,
                height: H,
                ...Pg({
                  x: J.x ?? j.position.x,
                  y: J.y ?? j.position.y
                }, { width: C, height: H }, j.parentId, k, U)
              }
            }, re = Tc([ie], k, $, O);
            V.push(...re), b.x = J.x ? Math.max(U[0] * C, J.x) : void 0, b.y = J.y ? Math.max(U[1] * H, J.y) : void 0;
          }
          if (b.x !== void 0 && b.y !== void 0) {
            const U = {
              id: S,
              type: "position",
              position: { ...b }
            };
            V.push(U);
          }
          if (J.width !== void 0 && J.height !== void 0) {
            const C = {
              id: S,
              type: "dimensions",
              resizing: !0,
              setAttributes: y ? y === "horizontal" ? "width" : "height" : !0,
              dimensions: {
                width: J.width,
                height: J.height
              }
            };
            V.push(C);
          }
          for (const U of A) {
            const C = {
              ...U,
              type: "position"
            };
            V.push(C);
          }
          W(V);
        },
        onEnd: ({ width: J, height: A }) => {
          const W = {
            id: S,
            type: "dimensions",
            resizing: !1,
            dimensions: {
              width: J,
              height: A
            }
          };
          P.getState().triggerNodeChanges([W]);
        }
      })), Q.current.update({
        controlPosition: K,
        boundaries: {
          minWidth: p,
          minHeight: h,
          maxWidth: g,
          maxHeight: m
        },
        keepAspectRatio: v,
        resizeDirection: y,
        onResizeStart: N,
        onResize: E,
        onResizeEnd: M,
        shouldResize: x
      }), () => {
        Q.current?.destroy();
      };
  }, [
    K,
    p,
    h,
    g,
    m,
    v,
    N,
    E,
    M,
    x
  ]);
  const ee = K.split("-");
  return R.jsx("div", { className: We(["react-flow__resize-control", "nodrag", ...ee, i, l]), ref: B, style: {
    ...a,
    scale: F,
    ...f && { [D ? "backgroundColor" : "borderColor"]: f }
  }, children: c });
}
Y.memo(Lk);
function Dm({ ids: t }) {
  const r = Me((l) => l.domNode !== null), i = ak();
  return Y.useEffect(() => {
    r && requestAnimationFrame(() => i(t.split(",")));
  }, [r, t, i]), null;
}
const en = "outputs";
function Ch(t, r) {
  const i = /* @__PURE__ */ new Set(), l = (a) => {
    if (!i.has(a)) {
      i.add(a);
      for (const c of Object.values(t.nodes.find((f) => f.id === a)?.inputs ?? {})) c && l(c);
    }
  };
  return r.forEach(l), i;
}
function Lm(t, r) {
  const i = (c) => Object.entries(t.outputs).filter(([f, p]) => p && c(f)).map(([, f]) => f), l = Ch(t, i((c) => !r.includes(c))), a = Ch(t, i((c) => r.includes(c)));
  return new Set([...a].filter((c) => !l.has(c)));
}
const Nh = 260, $k = 210;
function Zk(t, r = []) {
  const i = /* @__PURE__ */ new Map(), l = (h, g) => {
    if (i.has(h)) return i.get(h);
    if (g.has(h)) return 0;
    g.add(h);
    const m = t.nodes.find((_) => _.id === h), v = Object.values(m?.inputs ?? {}).filter((_) => !!_), y = v.length === 0 ? 0 : 1 + Math.max(...v.map((_) => l(_, g)));
    return i.set(h, y), y;
  };
  t.nodes.forEach((h) => l(h.id, /* @__PURE__ */ new Set()));
  const a = Math.max(0, ...i.values()) + 1, c = Lm(t, r), f = (h, g) => {
    const m = /* @__PURE__ */ new Map();
    for (const v of h) {
      const y = i.get(v) ?? 0, _ = m.get(y) ?? 0;
      m.set(y, _ + 1), p[v] = { x: y * Nh, y: g + _ * $k };
    }
  }, p = {};
  return f(t.nodes.map((h) => h.id).filter((h) => !c.has(h)), 0), p[en] = { x: a * Nh, y: 0 }, p;
}
function Ok({ missing: t, onPlace: r }) {
  const i = Tl(), l = Me((a) => a.domNode);
  return Y.useEffect(() => {
    if (!t || !l) return;
    const a = l.getBoundingClientRect(), c = i.screenToFlowPosition({ x: a.left + a.width / 2, y: a.top + a.height / 2 });
    r(Object.fromEntries(t.split(",").map((f, p) => [f, { x: c.x - 110 + p * 30, y: c.y - 80 + p * 30 }])));
  }, [t, l, i, r]), null;
}
function Ak({ data: t, selected: r }) {
  const { lib: i, node: l, idle: a, live: c, onParam: f, onRemove: p, issues: h } = t, g = i.KINDS[l.kind], m = i.KIND_WORDS[l.kind], v = i.NODE_GROUPS[i.KIND_GROUP[l.kind]], y = (x) => {
    const N = x.replace(/\?$/, "").split("|").map((E) => i.TYPE_WORDS[E] ?? E).join(" or ");
    return x.endsWith("?") ? `${N} (optional)` : N;
  }, _ = (x) => l.kind === "subtract" ? x === "a" ? "A - kept" : "B - removed from A" : x === "a" || x === "b" ? x.toUpperCase() : x === "under" ? "zone so far" : x;
  return /* @__PURE__ */ R.jsxs("div", { className: `zn${a ? " idle" : ""}${g.fixed ? " fixed" : ""}${h.some((x) => !x.warn) ? " has-issue" : ""}`, style: { "--zn-group": `var(${v?.token ?? "--muted"})` }, children: [
    /* @__PURE__ */ R.jsx("div", { className: "zn-group", children: v?.title }),
    /* @__PURE__ */ R.jsxs("div", { className: "zn-head", title: `${l.id} - ${m.says}`, children: [
      /* @__PURE__ */ R.jsx("b", { children: m.title }),
      r && !g.fixed && /* @__PURE__ */ R.jsx("button", { type: "button", className: "zn-remove nodrag", "aria-label": `Remove ${m.title}`, title: "Remove this node (or press Delete)", onClick: () => p(l.id), children: "×" })
    ] }),
    h.map((x) => /* @__PURE__ */ R.jsx("div", { className: x.warn ? "zn-warn" : "zn-issue", children: x.text }, x.text)),
    /* @__PURE__ */ R.jsx("div", { className: "zn-says", children: m.says }),
    (t.values?.length ?? 0) > 0 && /* @__PURE__ */ R.jsx("div", { className: "zn-readout", "data-ui": "node-readout", title: "What this step measured on the case on screen", children: t.values.map((x) => /* @__PURE__ */ R.jsx("div", { children: x }, x)) }),
    /* @__PURE__ */ R.jsxs("div", { className: "zn-takes", "data-ui": "node-takes", children: [
      /* @__PURE__ */ R.jsx("b", { children: "Takes:" }),
      " ",
      Object.keys(g.inputs).length === 0 ? "the scan itself" : Object.values(g.inputs).map(y).join(", "),
      " · ",
      /* @__PURE__ */ R.jsx("b", { children: "Gives:" }),
      " ",
      y(g.out)
    ] }),
    Object.entries(g.inputs).map(([x, N]) => (
      // The handle lives INSIDE its row, so it lines up with its label however the sentence above wraps.
      /* @__PURE__ */ R.jsxs("div", { className: "zn-row zn-socket", children: [
        /* @__PURE__ */ R.jsx(xn, { type: "target", position: ye.Left, id: x, className: `h-${N.replace(/\?$/, "").split("|")[0]}` }),
        /* @__PURE__ */ R.jsx("span", { className: "zn-in", children: _(x) }),
        /* @__PURE__ */ R.jsx("span", { className: "zn-type", children: y(N) })
      ] }, x)
    )),
    Object.entries(l.params).map(([x, N]) => {
      const E = i.PARAM_WORDS[x] ?? { label: x, help: "" }, M = c.includes(`${l.id}.${x}`);
      if (i.FIXED.params[l.kind]?.includes(x)) {
        const T = E.choices?.find(([S]) => S === N)?.[1] ?? String(N);
        return /* @__PURE__ */ R.jsxs("div", { className: "zn-row", title: `${E.help} Locked: this version of the engine does not read a change to it yet.`, children: [
          /* @__PURE__ */ R.jsx("span", { className: "zn-in", children: E.label }),
          /* @__PURE__ */ R.jsxs("span", { className: "zn-fixed", children: [
            T,
            " · locked"
          ] })
        ] }, x);
      }
      return /* @__PURE__ */ R.jsxs("label", { className: "zn-row", title: M ? `${E.help} LIVE: this one runs today.` : E.help, children: [
        /* @__PURE__ */ R.jsxs("span", { className: "zn-in", children: [
          E.label,
          M && /* @__PURE__ */ R.jsx("b", { className: "zn-live", children: " · live" })
        ] }),
        E.choices ? (
          // The choice's OWN value goes back, not the option's text: a yes / no is `true`, and the engine
          // refuses the string "true" (a Mark's `seen`, plan D1).
          /* @__PURE__ */ R.jsx(
            "select",
            {
              className: "nodrag",
              defaultValue: String(N),
              title: E.choices.find(([T]) => String(T) === String(N))?.[1],
              onChange: (T) => f(l.id, x, E.choices.find(([S]) => String(S) === T.target.value)?.[0] ?? T.target.value),
              children: E.choices.map(([T, S]) => /* @__PURE__ */ R.jsx("option", { value: String(T), children: S }, String(T)))
            }
          )
        ) : /* @__PURE__ */ R.jsx(
          "input",
          {
            className: "nodrag",
            defaultValue: String(N),
            type: "number",
            step: "any",
            onBlur: (T) => f(l.id, x, Number(T.target.value))
          }
        ),
        (() => {
          const T = i.defaultOf(l, x);
          return T !== void 0 && String(T) !== String(N) ? /* @__PURE__ */ R.jsx("button", { type: "button", className: "zn-restore nodrag", "data-ui": "node-restore", title: `Restore to ${E.choices?.find(([S]) => String(S) === String(T))?.[1] ?? String(T)}`, "aria-label": `Restore ${E.label}`, onClick: (S) => {
            S.preventDefault(), f(l.id, x, T);
          }, children: "↺" }) : null;
        })()
      ] }, `${x}=${String(N)}`);
    }),
    a && /* @__PURE__ */ R.jsx("div", { className: "zn-note", children: "Not connected to the output - not run, costs nothing." }),
    g.fixed && /* @__PURE__ */ R.jsx("div", { className: "zn-note", children: "Found in stage 1 (Orient); fixed here." }),
    /* @__PURE__ */ R.jsxs("div", { className: "zn-row zn-out-row", children: [
      /* @__PURE__ */ R.jsxs("span", { className: "zn-outtype", children: [
        "gives ",
        i.TYPE_WORDS[g.out] ?? g.out
      ] }),
      /* @__PURE__ */ R.jsx(xn, { type: "source", position: ye.Right, id: "out", className: `h-${g.out}` })
    ] })
  ] });
}
const jk = ["rim", "rim_band", "low_rim_band"];
function Hk({ data: t }) {
  const { lib: r, filled: i } = t;
  return /* @__PURE__ */ R.jsxs("div", { className: "zo", children: [
    /* @__PURE__ */ R.jsx("div", { className: "zn-head", children: /* @__PURE__ */ R.jsx("b", { children: r.OUTPUT_NODE.title }) }),
    /* @__PURE__ */ R.jsx("div", { className: "zn-says", children: r.OUTPUT_NODE.says }),
    Object.entries(r.REQUIRED_OUTPUTS).map(([l, a]) => /* @__PURE__ */ R.jsxs("div", { className: `zn-row zn-socket zo-row${i[l] ? "" : " empty"}${r.FIXED.outputs.includes(l) ? " fixed" : ""}`, title: r.OUTPUT_WORDS[l].says, children: [
      r.FIXED.outputs.includes(l) ? /* @__PURE__ */ R.jsx("span", { className: "zo-set", "aria-hidden": "true", children: "✓" }) : /* @__PURE__ */ R.jsx(xn, { type: "target", position: ye.Left, id: l, className: `h-${a}` }),
      /* @__PURE__ */ R.jsxs("div", { children: [
        /* @__PURE__ */ R.jsx("b", { children: r.OUTPUT_WORDS[l].title }),
        r.FIXED.outputs.includes(l) && /* @__PURE__ */ R.jsxs("span", { className: "zo-from", children: [
          " · already set ",
          jk.includes(l) ? "in Orient" : "by the engine"
        ] }),
        /* @__PURE__ */ R.jsx("div", { className: "zo-says", children: r.OUTPUT_WORDS[l].says })
      ] })
    ] }, l))
  ] });
}
const Fk = { zone: Ak, zoneOutput: Hk };
function Vk(t) {
  const r = t.data, i = r.lib && r.node ? r.lib.NODE_GROUPS[r.lib.KIND_GROUP[r.node.kind]]?.token : void 0;
  return i ? getComputedStyle(document.documentElement).getPropertyValue(i).trim() || "gray" : getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();
}
function Mh({ lib: t, graph: r, positions: i, liveParams: l = [], onGraph: a, onPositions: c, values: f, onSelect: p }) {
  const h = Y.useMemo(() => new Set(t.unreached(r)), [t, r]), g = Y.useMemo(() => Lm(r, t.FIXED.outputs), [r, t]), m = Y.useMemo(() => {
    const { problems: A, warnings: W } = t.validate(r), k = /* @__PURE__ */ new Map(), $ = (O, V) => {
      const b = O.indexOf(": "), j = b > 0 ? O.slice(0, b) : "";
      r.nodes.some((U) => U.id === j) && k.set(j, [...k.get(j) ?? [], { text: O.slice(b + 2), warn: V }]);
    };
    return A.forEach((O) => $(O, !1)), W.forEach((O) => $(O, !0)), k;
  }, [t, r]), v = Y.useCallback((A, W, k) => a(t.setParam(r, A, W, k)), [t, r, a]), y = Y.useCallback((A) => a(t.removeNode(r, A)), [t, r, a]), _ = Y.useMemo(() => [
    // What only a fixed output needs (the rim line and its strips from Orient, the sockets) is not
    // drawn: the owner's call, 2026-11-20 - "no reason to make it into a node, just show it is already
    // set". It stays in the graph, because the engine checks those outputs by name.
    ...r.nodes.filter((A) => !g.has(A.id)).map((A) => ({
      id: A.id,
      type: "zone",
      position: i[A.id] ?? { x: 0, y: 0 },
      deletable: !t.KINDS[A.kind].fixed,
      data: { lib: t, node: A, idle: h.has(A.id), live: l, onParam: v, onRemove: y, issues: m.get(A.id) ?? [], values: f?.[A.id] }
    })),
    {
      id: en,
      type: "zoneOutput",
      position: i[en] ?? { x: 0, y: 0 },
      deletable: !1,
      data: { lib: t, filled: Object.fromEntries(Object.keys(t.REQUIRED_OUTPUTS).map((A) => [A, !!r.outputs[A]])) }
    }
  ], [r, i, t, h, l, v, y, m, g, f]), [x, N] = Y.useState(_);
  Y.useEffect(() => {
    N((A) => _.map((W) => {
      const k = A.find(($) => $.id === W.id);
      return k ? { ...W, measured: k.measured, selected: k.selected } : W;
    }));
  }, [_]);
  const E = Y.useCallback((A) => N((W) => bc(A, W)), []), M = Y.useMemo(() => [
    ...r.nodes.filter((A) => !g.has(A.id)).flatMap((A) => Object.entries(A.inputs).filter(([, W]) => W && !g.has(W)).map(([W, k]) => ({
      id: `${k}->${A.id}.${W}`,
      source: k,
      sourceHandle: "out",
      target: A.id,
      targetHandle: W
    }))),
    ...Object.entries(r.outputs).filter(([A, W]) => W && !t.FIXED.outputs.includes(A)).map(([A, W]) => ({
      id: `${W}->${en}.${A}`,
      source: W,
      sourceHandle: "out",
      target: en,
      targetHandle: A,
      className: "to-output"
    }))
  ], [r, g, t]), [T, S] = Y.useState(M);
  Y.useEffect(() => {
    S((A) => M.map((W) => ({ ...W, selected: A.find((k) => k.id === W.id)?.selected ?? !1 })));
  }, [M]);
  const P = Y.useCallback((A) => S((W) => tm(A, W)), []), B = Y.useCallback((A) => {
    const W = r.nodes.find((V) => V.id === A.source);
    if (!W || A.source === A.target) return !1;
    const k = t.KINDS[W.kind].out;
    if (A.target === en) return !!A.targetHandle && !t.FIXED.outputs.includes(A.targetHandle) && t.REQUIRED_OUTPUTS[A.targetHandle] === k;
    const $ = r.nodes.find((V) => V.id === A.target), O = $ && A.targetHandle ? t.KINDS[$.kind].inputs[A.targetHandle] : void 0;
    return !!(O && O.replace(/\?$/, "").split("|").includes(k));
  }, [r, t]), D = Y.useCallback((A) => {
    !A.source || !A.target || (A.target === en ? A.targetHandle && a(t.bindOutput(r, A.targetHandle, A.source)) : A.targetHandle && a(t.rewire(r, A.target, A.targetHandle, A.source)));
  }, [r, t, a]), F = Y.useCallback((A) => {
    let W = r;
    for (const k of A)
      k.target === en ? k.targetHandle && (W = t.bindOutput(W, k.targetHandle, null)) : k.targetHandle && (W = t.rewire(W, k.target, k.targetHandle, null));
    a(W);
  }, [r, t, a]), Q = Y.useCallback((A) => {
    let W = r;
    for (const k of A) k.type === "zone" && (W = t.removeNode(W, k.id));
    a(W);
  }, [r, t, a]), K = Y.useCallback((A, W) => c({ ...i, [W.id]: W.position }), [i, c]), ee = Y.useMemo(() => ({
    minZoom: 0.6,
    padding: 0.05,
    nodes: [...r.nodes.filter((A) => !g.has(A.id)).map((A) => ({ id: A.id })), { id: en }]
  }), [r, g]), J = Y.useCallback((A) => c({ ...i, ...A }), [i, c]);
  return /* @__PURE__ */ R.jsxs(
    zm,
    {
      nodes: x,
      edges: T,
      nodeTypes: Fk,
      isValidConnection: B,
      onConnect: D,
      onEdgesDelete: F,
      onNodesDelete: Q,
      onNodeDragStop: K,
      onNodesChange: E,
      onEdgesChange: P,
      onSelectionChange: ({ nodes: A }) => p?.(A.length === 1 && A[0].id !== en ? A[0].id : null),
      deleteKeyCode: ["Backspace", "Delete"],
      fitView: !0,
      fitViewOptions: ee,
      minZoom: 0.2,
      proOptions: { hideAttribution: !1 },
      children: [
        /* @__PURE__ */ R.jsx(Dm, { ids: x.map((A) => A.id).join(",") }),
        /* @__PURE__ */ R.jsx(Ok, { missing: r.nodes.filter((A) => !i[A.id]).map((A) => A.id).join(","), onPlace: J }),
        /* @__PURE__ */ R.jsx(Im, {}),
        /* @__PURE__ */ R.jsx(bm, { fitViewOptions: ee }),
        /* @__PURE__ */ R.jsx(bk, { pannable: !0, zoomable: !0, nodeColor: Vk })
      ]
    }
  );
}
const Zu = { frame: "a frame", direction: "a direction", rim: "a rim line", mask: "faces", plane: "a plane", position: "a point" };
function Bk({ data: t }) {
  const { n: r } = t;
  return /* @__PURE__ */ R.jsxs(
    "div",
    {
      className: `zn rim-node${r.derived ? " derived" : ""}`,
      "aria-disabled": r.derived || void 0,
      "data-ui": `rim-node-${r.id}`,
      style: { "--zn-group": r.derived ? "var(--muted)" : "var(--node-orient)" },
      children: [
        /* @__PURE__ */ R.jsx("div", { className: "zn-group", children: r.derived ? "From the rim" : "Rim tab" }),
        /* @__PURE__ */ R.jsx("div", { className: "zn-head", title: `${r.id} - ${r.says}`, children: /* @__PURE__ */ R.jsx("b", { children: r.title }) }),
        r.reason && /* @__PURE__ */ R.jsx("div", { className: "zn-reason", children: r.reason }),
        /* @__PURE__ */ R.jsx("div", { className: "zn-says", children: r.says }),
        /* @__PURE__ */ R.jsxs("div", { className: "zn-takes", "data-ui": "node-takes", children: [
          /* @__PURE__ */ R.jsx("b", { children: "Takes:" }),
          " ",
          r.takes.length === 0 ? "the scan itself" : r.takes.map((i) => Zu[i] ?? i).join(", "),
          " · ",
          /* @__PURE__ */ R.jsx("b", { children: "Gives:" }),
          " ",
          Zu[r.out] ?? r.out
        ] }),
        r.inputs.map(([i]) => /* @__PURE__ */ R.jsxs("div", { className: "zn-row zn-socket", children: [
          /* @__PURE__ */ R.jsx(xn, { type: "target", position: ye.Left, id: i, isConnectable: !1 }),
          /* @__PURE__ */ R.jsx("span", { className: "zn-in", children: i })
        ] }, i)),
        /* @__PURE__ */ R.jsxs("div", { className: "zn-row zn-out-row", children: [
          /* @__PURE__ */ R.jsxs("span", { className: "zn-outtype", children: [
            "gives ",
            Zu[r.out] ?? r.out
          ] }),
          /* @__PURE__ */ R.jsx(xn, { type: "source", position: ye.Right, id: "out", isConnectable: !1 })
        ] })
      ]
    }
  );
}
const Uk = { rim: Bk }, Wk = 250, Xk = 150;
function Yk(t) {
  const r = /* @__PURE__ */ new Map(), i = (c, f = /* @__PURE__ */ new Set()) => {
    if (r.has(c)) return r.get(c);
    if (f.has(c)) return 0;
    f.add(c);
    const p = t.find((g) => g.id === c)?.inputs ?? [], h = p.length === 0 ? 0 : 1 + Math.max(...p.map(([, g]) => i(g, f)));
    return r.set(c, h), h;
  }, l = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
  for (const c of t) {
    const f = i(c.id), p = a.get(f) ?? /* @__PURE__ */ new Set();
    let h = c.inputs.length > 0 ? l.get(c.inputs[0][1]) ?? 0 : 0;
    for (; p.has(h); ) h += 1;
    p.add(h), a.set(f, p), l.set(c.id, h);
  }
  return Object.fromEntries(t.map((c) => [c.id, { x: i(c.id) * Wk, y: (l.get(c.id) ?? 0) * Xk }]));
}
function zh({ view: t }) {
  const r = Y.useMemo(() => Yk(t), [t]), i = Y.useMemo(() => t.map((h) => ({
    id: h.id,
    type: "rim",
    position: r[h.id] ?? { x: 0, y: 0 },
    data: { n: h },
    deletable: !1,
    connectable: !1
  })), [t, r]), [l, a] = Y.useState(i);
  Y.useEffect(() => {
    a((h) => i.map((g) => ({ ...g, measured: h.find((m) => m.id === g.id)?.measured })));
  }, [i]);
  const c = Y.useCallback((h) => a((g) => bc(h, g)), []), f = Y.useMemo(() => t.flatMap((h) => h.inputs.map(([g, m]) => ({
    id: `${m}->${h.id}.${g}`,
    source: m,
    sourceHandle: "out",
    target: h.id,
    targetHandle: g,
    className: h.derived ? "to-derived" : void 0
  }))), [t]), p = Y.useMemo(() => ({ padding: 0.06, minZoom: 0.8, maxZoom: 1 }), []);
  return /* @__PURE__ */ R.jsxs(
    zm,
    {
      nodes: l,
      edges: f,
      nodeTypes: Uk,
      onNodesChange: c,
      nodesConnectable: !1,
      deleteKeyCode: null,
      fitView: !0,
      fitViewOptions: p,
      minZoom: 0.2,
      proOptions: { hideAttribution: !1 },
      children: [
        /* @__PURE__ */ R.jsx(Dm, { ids: l.map((h) => h.id).join(",") }),
        /* @__PURE__ */ R.jsx(Im, {}),
        /* @__PURE__ */ R.jsx(bm, { showInteractive: !1, fitViewOptions: p })
      ]
    }
  );
}
let Ph = !1;
function $m() {
  if (Ph) return;
  const t = document.createElement("style");
  t.dataset.ui = "node-editor-css", t.textContent = Sy, document.head.append(t), Ph = !0;
}
function Qk(t, r) {
  $m();
  const i = bh.createRoot(t);
  return i.render(/* @__PURE__ */ R.jsx(Mh, { ...r })), {
    update: (l) => i.render(/* @__PURE__ */ R.jsx(Mh, { ...l })),
    unmount: () => i.unmount()
  };
}
function Kk(t, r) {
  $m();
  const i = bh.createRoot(t);
  return i.render(/* @__PURE__ */ R.jsx(zh, { ...r }, r.kind)), {
    update: (l) => i.render(/* @__PURE__ */ R.jsx(zh, { ...l }, l.kind)),
    unmount: () => i.unmount()
  };
}
export {
  Zk as autoLayout,
  Kk as mountRimCanvas,
  Qk as mountZoneEditor
};
