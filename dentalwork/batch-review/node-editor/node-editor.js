/* node-editor sources fa628f2370aded0d - rebuild with npm run review:editor */
/*! Contains third-party code - React, React DOM, @xyflow/react and their dependencies, each MIT or ISC. Full licence texts: THIRD-PARTY-NOTICES.txt, written by npm run build. */
function Ph(t) {
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
var np;
function hy() {
  if (np) return Ne;
  np = 1;
  var t = Symbol.for("react.element"), r = Symbol.for("react.portal"), i = Symbol.for("react.fragment"), l = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), c = Symbol.for("react.provider"), f = Symbol.for("react.context"), p = Symbol.for("react.forward_ref"), h = Symbol.for("react.suspense"), g = Symbol.for("react.memo"), m = Symbol.for("react.lazy"), v = Symbol.iterator;
  function y(k) {
    return k === null || typeof k != "object" ? null : (k = v && k[v] || k["@@iterator"], typeof k == "function" ? k : null);
  }
  var x = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, _ = Object.assign, M = {};
  function N(k, A, ie) {
    this.props = k, this.context = A, this.refs = M, this.updater = ie || x;
  }
  N.prototype.isReactComponent = {}, N.prototype.setState = function(k, A) {
    if (typeof k != "object" && typeof k != "function" && k != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, k, A, "setState");
  }, N.prototype.forceUpdate = function(k) {
    this.updater.enqueueForceUpdate(this, k, "forceUpdate");
  };
  function E() {
  }
  E.prototype = N.prototype;
  function D(k, A, ie) {
    this.props = k, this.context = A, this.refs = M, this.updater = ie || x;
  }
  var S = D.prototype = new E();
  S.constructor = D, _(S, N.prototype), S.isPureReactComponent = !0;
  var P = Array.isArray, V = Object.prototype.hasOwnProperty, b = { current: null }, F = { key: !0, ref: !0, __self: !0, __source: !0 };
  function Q(k, A, ie) {
    var re, ae = {}, ce = null, ue = null;
    if (A != null) for (re in A.ref !== void 0 && (ue = A.ref), A.key !== void 0 && (ce = "" + A.key), A) V.call(A, re) && !F.hasOwnProperty(re) && (ae[re] = A[re]);
    var q = arguments.length - 2;
    if (q === 1) ae.children = ie;
    else if (1 < q) {
      for (var le = Array(q), we = 0; we < q; we++) le[we] = arguments[we + 2];
      ae.children = le;
    }
    if (k && k.defaultProps) for (re in q = k.defaultProps, q) ae[re] === void 0 && (ae[re] = q[re]);
    return { $$typeof: t, type: k, key: ce, ref: ue, props: ae, _owner: b.current };
  }
  function K(k, A) {
    return { $$typeof: t, type: k.type, key: A, ref: k.ref, props: k.props, _owner: k._owner };
  }
  function $(k) {
    return typeof k == "object" && k !== null && k.$$typeof === t;
  }
  function W(k) {
    var A = { "=": "=0", ":": "=2" };
    return "$" + k.replace(/[=:]/g, function(ie) {
      return A[ie];
    });
  }
  var J = /\/+/g;
  function ee(k, A) {
    return typeof k == "object" && k !== null && k.key != null ? W("" + k.key) : A.toString(36);
  }
  function C(k, A, ie, re, ae) {
    var ce = typeof k;
    (ce === "undefined" || ce === "boolean") && (k = null);
    var ue = !1;
    if (k === null) ue = !0;
    else switch (ce) {
      case "string":
      case "number":
        ue = !0;
        break;
      case "object":
        switch (k.$$typeof) {
          case t:
          case r:
            ue = !0;
        }
    }
    if (ue) return ue = k, ae = ae(ue), k = re === "" ? "." + ee(ue, 0) : re, P(ae) ? (ie = "", k != null && (ie = k.replace(J, "$&/") + "/"), C(ae, A, ie, "", function(we) {
      return we;
    })) : ae != null && ($(ae) && (ae = K(ae, ie + (!ae.key || ue && ue.key === ae.key ? "" : ("" + ae.key).replace(J, "$&/") + "/") + k)), A.push(ae)), 1;
    if (ue = 0, re = re === "" ? "." : re + ":", P(k)) for (var q = 0; q < k.length; q++) {
      ce = k[q];
      var le = re + ee(ce, q);
      ue += C(ce, A, ie, le, ae);
    }
    else if (le = y(k), typeof le == "function") for (k = le.call(k), q = 0; !(ce = k.next()).done; ) ce = ce.value, le = re + ee(ce, q++), ue += C(ce, A, ie, le, ae);
    else if (ce === "object") throw A = String(k), Error("Objects are not valid as a React child (found: " + (A === "[object Object]" ? "object with keys {" + Object.keys(k).join(", ") + "}" : A) + "). If you meant to render a collection of children, use an array instead.");
    return ue;
  }
  function O(k, A, ie) {
    if (k == null) return k;
    var re = [], ae = 0;
    return C(k, re, "", "", function(ce) {
      return A.call(ie, ce, ae++);
    }), re;
  }
  function H(k) {
    if (k._status === -1) {
      var A = k._result;
      A = A(), A.then(function(ie) {
        (k._status === 0 || k._status === -1) && (k._status = 1, k._result = ie);
      }, function(ie) {
        (k._status === 0 || k._status === -1) && (k._status = 2, k._result = ie);
      }), k._status === -1 && (k._status = 0, k._result = A);
    }
    if (k._status === 1) return k._result.default;
    throw k._result;
  }
  var B = { current: null }, T = { transition: null }, j = { ReactCurrentDispatcher: B, ReactCurrentBatchConfig: T, ReactCurrentOwner: b };
  function U() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return Ne.Children = { map: O, forEach: function(k, A, ie) {
    O(k, function() {
      A.apply(this, arguments);
    }, ie);
  }, count: function(k) {
    var A = 0;
    return O(k, function() {
      A++;
    }), A;
  }, toArray: function(k) {
    return O(k, function(A) {
      return A;
    }) || [];
  }, only: function(k) {
    if (!$(k)) throw Error("React.Children.only expected to receive a single React element child.");
    return k;
  } }, Ne.Component = N, Ne.Fragment = i, Ne.Profiler = a, Ne.PureComponent = D, Ne.StrictMode = l, Ne.Suspense = h, Ne.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = j, Ne.act = U, Ne.cloneElement = function(k, A, ie) {
    if (k == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + k + ".");
    var re = _({}, k.props), ae = k.key, ce = k.ref, ue = k._owner;
    if (A != null) {
      if (A.ref !== void 0 && (ce = A.ref, ue = b.current), A.key !== void 0 && (ae = "" + A.key), k.type && k.type.defaultProps) var q = k.type.defaultProps;
      for (le in A) V.call(A, le) && !F.hasOwnProperty(le) && (re[le] = A[le] === void 0 && q !== void 0 ? q[le] : A[le]);
    }
    var le = arguments.length - 2;
    if (le === 1) re.children = ie;
    else if (1 < le) {
      q = Array(le);
      for (var we = 0; we < le; we++) q[we] = arguments[we + 2];
      re.children = q;
    }
    return { $$typeof: t, type: k.type, key: ae, ref: ce, props: re, _owner: ue };
  }, Ne.createContext = function(k) {
    return k = { $$typeof: f, _currentValue: k, _currentValue2: k, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, k.Provider = { $$typeof: c, _context: k }, k.Consumer = k;
  }, Ne.createElement = Q, Ne.createFactory = function(k) {
    var A = Q.bind(null, k);
    return A.type = k, A;
  }, Ne.createRef = function() {
    return { current: null };
  }, Ne.forwardRef = function(k) {
    return { $$typeof: p, render: k };
  }, Ne.isValidElement = $, Ne.lazy = function(k) {
    return { $$typeof: m, _payload: { _status: -1, _result: k }, _init: H };
  }, Ne.memo = function(k, A) {
    return { $$typeof: g, type: k, compare: A === void 0 ? null : A };
  }, Ne.startTransition = function(k) {
    var A = T.transition;
    T.transition = {};
    try {
      k();
    } finally {
      T.transition = A;
    }
  }, Ne.unstable_act = U, Ne.useCallback = function(k, A) {
    return B.current.useCallback(k, A);
  }, Ne.useContext = function(k) {
    return B.current.useContext(k);
  }, Ne.useDebugValue = function() {
  }, Ne.useDeferredValue = function(k) {
    return B.current.useDeferredValue(k);
  }, Ne.useEffect = function(k, A) {
    return B.current.useEffect(k, A);
  }, Ne.useId = function() {
    return B.current.useId();
  }, Ne.useImperativeHandle = function(k, A, ie) {
    return B.current.useImperativeHandle(k, A, ie);
  }, Ne.useInsertionEffect = function(k, A) {
    return B.current.useInsertionEffect(k, A);
  }, Ne.useLayoutEffect = function(k, A) {
    return B.current.useLayoutEffect(k, A);
  }, Ne.useMemo = function(k, A) {
    return B.current.useMemo(k, A);
  }, Ne.useReducer = function(k, A, ie) {
    return B.current.useReducer(k, A, ie);
  }, Ne.useRef = function(k) {
    return B.current.useRef(k);
  }, Ne.useState = function(k) {
    return B.current.useState(k);
  }, Ne.useSyncExternalStore = function(k, A, ie) {
    return B.current.useSyncExternalStore(k, A, ie);
  }, Ne.useTransition = function() {
    return B.current.useTransition();
  }, Ne.version = "18.3.1", Ne;
}
var rp;
function Si() {
  return rp || (rp = 1, Mu.exports = hy()), Mu.exports;
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
var op;
function gy() {
  if (op) return si;
  op = 1;
  var t = Si(), r = Symbol.for("react.element"), i = Symbol.for("react.fragment"), l = Object.prototype.hasOwnProperty, a = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, c = { key: !0, ref: !0, __self: !0, __source: !0 };
  function f(p, h, g) {
    var m, v = {}, y = null, x = null;
    g !== void 0 && (y = "" + g), h.key !== void 0 && (y = "" + h.key), h.ref !== void 0 && (x = h.ref);
    for (m in h) l.call(h, m) && !c.hasOwnProperty(m) && (v[m] = h[m]);
    if (p && p.defaultProps) for (m in h = p.defaultProps, h) v[m] === void 0 && (v[m] = h[m]);
    return { $$typeof: r, type: p, key: y, ref: x, props: v, _owner: a.current };
  }
  return si.Fragment = i, si.jsx = f, si.jsxs = f, si;
}
var ip;
function my() {
  return ip || (ip = 1, Nu.exports = gy()), Nu.exports;
}
var R = my(), Xs = {}, zu = { exports: {} }, gt = {}, Pu = { exports: {} }, Iu = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var sp;
function yy() {
  return sp || (sp = 1, (function(t) {
    function r(T, j) {
      var U = T.length;
      T.push(j);
      e: for (; 0 < U; ) {
        var k = U - 1 >>> 1, A = T[k];
        if (0 < a(A, j)) T[k] = j, T[U] = A, U = k;
        else break e;
      }
    }
    function i(T) {
      return T.length === 0 ? null : T[0];
    }
    function l(T) {
      if (T.length === 0) return null;
      var j = T[0], U = T.pop();
      if (U !== j) {
        T[0] = U;
        e: for (var k = 0, A = T.length, ie = A >>> 1; k < ie; ) {
          var re = 2 * (k + 1) - 1, ae = T[re], ce = re + 1, ue = T[ce];
          if (0 > a(ae, U)) ce < A && 0 > a(ue, ae) ? (T[k] = ue, T[ce] = U, k = ce) : (T[k] = ae, T[re] = U, k = re);
          else if (ce < A && 0 > a(ue, U)) T[k] = ue, T[ce] = U, k = ce;
          else break e;
        }
      }
      return j;
    }
    function a(T, j) {
      var U = T.sortIndex - j.sortIndex;
      return U !== 0 ? U : T.id - j.id;
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
    var h = [], g = [], m = 1, v = null, y = 3, x = !1, _ = !1, M = !1, N = typeof setTimeout == "function" ? setTimeout : null, E = typeof clearTimeout == "function" ? clearTimeout : null, D = typeof setImmediate < "u" ? setImmediate : null;
    typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function S(T) {
      for (var j = i(g); j !== null; ) {
        if (j.callback === null) l(g);
        else if (j.startTime <= T) l(g), j.sortIndex = j.expirationTime, r(h, j);
        else break;
        j = i(g);
      }
    }
    function P(T) {
      if (M = !1, S(T), !_) if (i(h) !== null) _ = !0, H(V);
      else {
        var j = i(g);
        j !== null && B(P, j.startTime - T);
      }
    }
    function V(T, j) {
      _ = !1, M && (M = !1, E(Q), Q = -1), x = !0;
      var U = y;
      try {
        for (S(j), v = i(h); v !== null && (!(v.expirationTime > j) || T && !W()); ) {
          var k = v.callback;
          if (typeof k == "function") {
            v.callback = null, y = v.priorityLevel;
            var A = k(v.expirationTime <= j);
            j = t.unstable_now(), typeof A == "function" ? v.callback = A : v === i(h) && l(h), S(j);
          } else l(h);
          v = i(h);
        }
        if (v !== null) var ie = !0;
        else {
          var re = i(g);
          re !== null && B(P, re.startTime - j), ie = !1;
        }
        return ie;
      } finally {
        v = null, y = U, x = !1;
      }
    }
    var b = !1, F = null, Q = -1, K = 5, $ = -1;
    function W() {
      return !(t.unstable_now() - $ < K);
    }
    function J() {
      if (F !== null) {
        var T = t.unstable_now();
        $ = T;
        var j = !0;
        try {
          j = F(!0, T);
        } finally {
          j ? ee() : (b = !1, F = null);
        }
      } else b = !1;
    }
    var ee;
    if (typeof D == "function") ee = function() {
      D(J);
    };
    else if (typeof MessageChannel < "u") {
      var C = new MessageChannel(), O = C.port2;
      C.port1.onmessage = J, ee = function() {
        O.postMessage(null);
      };
    } else ee = function() {
      N(J, 0);
    };
    function H(T) {
      F = T, b || (b = !0, ee());
    }
    function B(T, j) {
      Q = N(function() {
        T(t.unstable_now());
      }, j);
    }
    t.unstable_IdlePriority = 5, t.unstable_ImmediatePriority = 1, t.unstable_LowPriority = 4, t.unstable_NormalPriority = 3, t.unstable_Profiling = null, t.unstable_UserBlockingPriority = 2, t.unstable_cancelCallback = function(T) {
      T.callback = null;
    }, t.unstable_continueExecution = function() {
      _ || x || (_ = !0, H(V));
    }, t.unstable_forceFrameRate = function(T) {
      0 > T || 125 < T ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : K = 0 < T ? Math.floor(1e3 / T) : 5;
    }, t.unstable_getCurrentPriorityLevel = function() {
      return y;
    }, t.unstable_getFirstCallbackNode = function() {
      return i(h);
    }, t.unstable_next = function(T) {
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
        return T();
      } finally {
        y = U;
      }
    }, t.unstable_pauseExecution = function() {
    }, t.unstable_requestPaint = function() {
    }, t.unstable_runWithPriority = function(T, j) {
      switch (T) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          T = 3;
      }
      var U = y;
      y = T;
      try {
        return j();
      } finally {
        y = U;
      }
    }, t.unstable_scheduleCallback = function(T, j, U) {
      var k = t.unstable_now();
      switch (typeof U == "object" && U !== null ? (U = U.delay, U = typeof U == "number" && 0 < U ? k + U : k) : U = k, T) {
        case 1:
          var A = -1;
          break;
        case 2:
          A = 250;
          break;
        case 5:
          A = 1073741823;
          break;
        case 4:
          A = 1e4;
          break;
        default:
          A = 5e3;
      }
      return A = U + A, T = { id: m++, callback: j, priorityLevel: T, startTime: U, expirationTime: A, sortIndex: -1 }, U > k ? (T.sortIndex = U, r(g, T), i(h) === null && T === i(g) && (M ? (E(Q), Q = -1) : M = !0, B(P, U - k))) : (T.sortIndex = A, r(h, T), _ || x || (_ = !0, H(V))), T;
    }, t.unstable_shouldYield = W, t.unstable_wrapCallback = function(T) {
      var j = y;
      return function() {
        var U = y;
        y = j;
        try {
          return T.apply(this, arguments);
        } finally {
          y = U;
        }
      };
    };
  })(Iu)), Iu;
}
var lp;
function vy() {
  return lp || (lp = 1, Pu.exports = yy()), Pu.exports;
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
var ap;
function wy() {
  if (ap) return gt;
  ap = 1;
  var t = Si(), r = vy();
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
  function x(e, n, o, s) {
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
  function _(e, n, o, s) {
    if (n === null || typeof n > "u" || x(e, n, o, s)) return !0;
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
  function M(e, n, o, s, u, d, w) {
    this.acceptsBooleans = n === 2 || n === 3 || n === 4, this.attributeName = s, this.attributeNamespace = u, this.mustUseProperty = o, this.propertyName = e, this.type = n, this.sanitizeURL = d, this.removeEmptyString = w;
  }
  var N = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
    N[e] = new M(e, 0, !1, e, null, !1, !1);
  }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
    var n = e[0];
    N[n] = new M(n, 1, !1, e[1], null, !1, !1);
  }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
    N[e] = new M(e, 2, !1, e.toLowerCase(), null, !1, !1);
  }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
    N[e] = new M(e, 2, !1, e, null, !1, !1);
  }), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
    N[e] = new M(e, 3, !1, e.toLowerCase(), null, !1, !1);
  }), ["checked", "multiple", "muted", "selected"].forEach(function(e) {
    N[e] = new M(e, 3, !0, e, null, !1, !1);
  }), ["capture", "download"].forEach(function(e) {
    N[e] = new M(e, 4, !1, e, null, !1, !1);
  }), ["cols", "rows", "size", "span"].forEach(function(e) {
    N[e] = new M(e, 6, !1, e, null, !1, !1);
  }), ["rowSpan", "start"].forEach(function(e) {
    N[e] = new M(e, 5, !1, e.toLowerCase(), null, !1, !1);
  });
  var E = /[\-:]([a-z])/g;
  function D(e) {
    return e[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
    var n = e.replace(
      E,
      D
    );
    N[n] = new M(n, 1, !1, e, null, !1, !1);
  }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
    var n = e.replace(E, D);
    N[n] = new M(n, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
  }), ["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
    var n = e.replace(E, D);
    N[n] = new M(n, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
  }), ["tabIndex", "crossOrigin"].forEach(function(e) {
    N[e] = new M(e, 1, !1, e.toLowerCase(), null, !1, !1);
  }), N.xlinkHref = new M("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), ["src", "href", "action", "formAction"].forEach(function(e) {
    N[e] = new M(e, 1, !1, e.toLowerCase(), null, !0, !0);
  });
  function S(e, n, o, s) {
    var u = N.hasOwnProperty(n) ? N[n] : null;
    (u !== null ? u.type !== 0 : s || !(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && (_(n, o, u, s) && (o = null), s || u === null ? y(n) && (o === null ? e.removeAttribute(n) : e.setAttribute(n, "" + o)) : u.mustUseProperty ? e[u.propertyName] = o === null ? u.type === 3 ? !1 : "" : o : (n = u.attributeName, s = u.attributeNamespace, o === null ? e.removeAttribute(n) : (u = u.type, o = u === 3 || u === 4 && o === !0 ? "" : "" + o, s ? e.setAttributeNS(s, n, o) : e.setAttribute(n, o))));
  }
  var P = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, V = Symbol.for("react.element"), b = Symbol.for("react.portal"), F = Symbol.for("react.fragment"), Q = Symbol.for("react.strict_mode"), K = Symbol.for("react.profiler"), $ = Symbol.for("react.provider"), W = Symbol.for("react.context"), J = Symbol.for("react.forward_ref"), ee = Symbol.for("react.suspense"), C = Symbol.for("react.suspense_list"), O = Symbol.for("react.memo"), H = Symbol.for("react.lazy"), B = Symbol.for("react.offscreen"), T = Symbol.iterator;
  function j(e) {
    return e === null || typeof e != "object" ? null : (e = T && e[T] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var U = Object.assign, k;
  function A(e) {
    if (k === void 0) try {
      throw Error();
    } catch (o) {
      var n = o.stack.trim().match(/\n( *(at )?)/);
      k = n && n[1] || "";
    }
    return `
` + k + e;
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
    return (e = e ? e.displayName || e.name : "") ? A(e) : "";
  }
  function ae(e) {
    switch (e.tag) {
      case 5:
        return A(e.type);
      case 16:
        return A("Lazy");
      case 13:
        return A("Suspense");
      case 19:
        return A("SuspenseList");
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
      case b:
        return "Portal";
      case K:
        return "Profiler";
      case Q:
        return "StrictMode";
      case ee:
        return "Suspense";
      case C:
        return "SuspenseList";
    }
    if (typeof e == "object") switch (e.$$typeof) {
      case W:
        return (e.displayName || "Context") + ".Consumer";
      case $:
        return (e._context.displayName || "Context") + ".Provider";
      case J:
        var n = e.render;
        return e = e.displayName, e || (e = n.displayName || n.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
      case O:
        return n = e.displayName || null, n !== null ? n : ce(e.type) || "Memo";
      case H:
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
  function on(e, n) {
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
  function sn(e, n) {
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
  function Ri(e) {
    _n ? Sn ? Sn.push(e) : Sn = [e] : _n = e;
  }
  function bi() {
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
  function Oi(e, n, o) {
    if (So) return e(n, o);
    So = !0;
    try {
      return Di(e, n, o);
    } finally {
      So = !1, (_n !== null || Sn !== null) && (Li(), bi());
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
  function Ol(e, n, o, s, u, d, w, z, I) {
    var G = Array.prototype.slice.call(arguments, 3);
    try {
      n.apply(o, G);
    } catch (ne) {
      this.onError(ne);
    }
  }
  var Gn = !1, Nr = null, Mr = !1, Eo = null, $l = { onError: function(e) {
    Gn = !0, Nr = e;
  } };
  function Al(e, n, o, s, u, d, w, z, I) {
    Gn = !1, Nr = null, Ol.apply($l, arguments);
  }
  function Hl(e, n, o, s, u, d, w, z, I) {
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
  function jl(e) {
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
  function $i(e) {
    return e = jl(e), e !== null ? Ai(e) : null;
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
  var Hi = r.unstable_scheduleCallback, ji = r.unstable_cancelCallback, Fl = r.unstable_shouldYield, Fi = r.unstable_requestPaint, $e = r.unstable_now, Vl = r.unstable_getCurrentPriorityLevel, Mo = r.unstable_ImmediatePriority, Vi = r.unstable_UserBlockingPriority, zr = r.unstable_NormalPriority, Bl = r.unstable_LowPriority, Bi = r.unstable_IdlePriority, Pr = null, yt = null;
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
  function Rr(e, n) {
    var o = e.entangledLanes |= n;
    for (e = e.entanglements; o; ) {
      var s = 31 - vt(o), u = 1 << s;
      u & n | e[s] & n && (e[s] |= n), o &= ~u;
    }
  }
  var Te = 0;
  function bc(e) {
    return e &= -e, 1 < e ? 4 < e ? (e & 268435455) !== 0 ? 16 : 536870912 : 4 : 1;
  }
  var Dc, Kl, Lc, Oc, $c, Gl = !1, Xi = [], kn = null, En = null, Cn = null, Po = /* @__PURE__ */ new Map(), Io = /* @__PURE__ */ new Map(), Nn = [], Om = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  function Ac(e, n) {
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
  function $m(e, n, o, s, u) {
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
            e.blockedOn = n, $c(e.priority, function() {
              Lc(o);
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
  function jc(e, n, o) {
    Yi(e) && o.delete(n);
  }
  function Am() {
    Gl = !1, kn !== null && Yi(kn) && (kn = null), En !== null && Yi(En) && (En = null), Cn !== null && Yi(Cn) && (Cn = null), Po.forEach(jc), Io.forEach(jc);
  }
  function Ro(e, n) {
    e.blockedOn === n && (e.blockedOn = null, Gl || (Gl = !0, r.unstable_scheduleCallback(r.unstable_NormalPriority, Am)));
  }
  function bo(e) {
    function n(u) {
      return Ro(u, e);
    }
    if (0 < Xi.length) {
      Ro(Xi[0], e);
      for (var o = 1; o < Xi.length; o++) {
        var s = Xi[o];
        s.blockedOn === e && (s.blockedOn = null);
      }
    }
    for (kn !== null && Ro(kn, e), En !== null && Ro(En, e), Cn !== null && Ro(Cn, e), Po.forEach(n), Io.forEach(n), o = 0; o < Nn.length; o++) s = Nn[o], s.blockedOn === e && (s.blockedOn = null);
    for (; 0 < Nn.length && (o = Nn[0], o.blockedOn === null); ) Hc(o), o.blockedOn === null && Nn.shift();
  }
  var br = P.ReactCurrentBatchConfig, Zi = !0;
  function Hm(e, n, o, s) {
    var u = Te, d = br.transition;
    br.transition = null;
    try {
      Te = 1, ql(e, n, o, s);
    } finally {
      Te = u, br.transition = d;
    }
  }
  function jm(e, n, o, s) {
    var u = Te, d = br.transition;
    br.transition = null;
    try {
      Te = 4, ql(e, n, o, s);
    } finally {
      Te = u, br.transition = d;
    }
  }
  function ql(e, n, o, s) {
    if (Zi) {
      var u = Jl(e, n, o, s);
      if (u === null) ma(e, n, s, Qi, o), Ac(e, s);
      else if ($m(u, e, n, o, s)) s.stopPropagation();
      else if (Ac(e, s), n & 4 && -1 < Om.indexOf(e)) {
        for (; u !== null; ) {
          var d = Wo(u);
          if (d !== null && Dc(d), d = Jl(e, n, o, s), d === null && ma(e, n, s, Qi, o), d === u) break;
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
  function Fc(e) {
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
  function Vc() {
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
  function Bc() {
    return !1;
  }
  function wt(e) {
    function n(o, s, u, d, w) {
      this._reactName = o, this._targetInst = u, this.type = s, this.nativeEvent = d, this.target = w, this.currentTarget = null;
      for (var z in e) e.hasOwnProperty(z) && (o = e[z], this[z] = o ? o(d) : d[z]);
      return this.isDefaultPrevented = (d.defaultPrevented != null ? d.defaultPrevented : d.returnValue === !1) ? qi : Bc, this.isPropagationStopped = Bc, this;
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
  }, defaultPrevented: 0, isTrusted: 0 }, ta = wt(Dr), Do = U({}, Dr, { view: 0, detail: 0 }), Fm = wt(Do), na, ra, Lo, Ji = U({}, Do, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: ia, button: 0, buttons: 0, relatedTarget: function(e) {
    return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
  }, movementX: function(e) {
    return "movementX" in e ? e.movementX : (e !== Lo && (Lo && e.type === "mousemove" ? (na = e.screenX - Lo.screenX, ra = e.screenY - Lo.screenY) : ra = na = 0, Lo = e), na);
  }, movementY: function(e) {
    return "movementY" in e ? e.movementY : ra;
  } }), Uc = wt(Ji), Vm = U({}, Ji, { dataTransfer: 0 }), Bm = wt(Vm), Um = U({}, Do, { relatedTarget: 0 }), oa = wt(Um), Wm = U({}, Dr, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), Xm = wt(Wm), Ym = U({}, Dr, { clipboardData: function(e) {
    return "clipboardData" in e ? e.clipboardData : window.clipboardData;
  } }), Zm = wt(Ym), Qm = U({}, Dr, { data: 0 }), Wc = wt(Qm), Km = {
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
  }, Gm = {
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
  }, qm = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function Jm(e) {
    var n = this.nativeEvent;
    return n.getModifierState ? n.getModifierState(e) : (e = qm[e]) ? !!n[e] : !1;
  }
  function ia() {
    return Jm;
  }
  var e0 = U({}, Do, { key: function(e) {
    if (e.key) {
      var n = Km[e.key] || e.key;
      if (n !== "Unidentified") return n;
    }
    return e.type === "keypress" ? (e = Gi(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Gm[e.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: ia, charCode: function(e) {
    return e.type === "keypress" ? Gi(e) : 0;
  }, keyCode: function(e) {
    return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
  }, which: function(e) {
    return e.type === "keypress" ? Gi(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
  } }), t0 = wt(e0), n0 = U({}, Ji, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Xc = wt(n0), r0 = U({}, Do, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: ia }), o0 = wt(r0), i0 = U({}, Dr, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), s0 = wt(i0), l0 = U({}, Ji, {
    deltaX: function(e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function(e) {
      return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), a0 = wt(l0), u0 = [9, 13, 27, 32], sa = p && "CompositionEvent" in window, Oo = null;
  p && "documentMode" in document && (Oo = document.documentMode);
  var c0 = p && "TextEvent" in window && !Oo, Yc = p && (!sa || Oo && 8 < Oo && 11 >= Oo), Zc = " ", Qc = !1;
  function Kc(e, n) {
    switch (e) {
      case "keyup":
        return u0.indexOf(n.keyCode) !== -1;
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
  function Gc(e) {
    return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
  }
  var Lr = !1;
  function f0(e, n) {
    switch (e) {
      case "compositionend":
        return Gc(n);
      case "keypress":
        return n.which !== 32 ? null : (Qc = !0, Zc);
      case "textInput":
        return e = n.data, e === Zc && Qc ? null : e;
      default:
        return null;
    }
  }
  function d0(e, n) {
    if (Lr) return e === "compositionend" || !sa && Kc(e, n) ? (e = Vc(), Ki = ea = Mn = null, Lr = !1, e) : null;
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
        return Yc && n.locale !== "ko" ? null : n.data;
      default:
        return null;
    }
  }
  var p0 = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
  function qc(e) {
    var n = e && e.nodeName && e.nodeName.toLowerCase();
    return n === "input" ? !!p0[e.type] : n === "textarea";
  }
  function Jc(e, n, o, s) {
    Ri(s), n = os(n, "onChange"), 0 < n.length && (o = new ta("onChange", "change", null, o, s), e.push({ event: o, listeners: n }));
  }
  var $o = null, Ao = null;
  function h0(e) {
    vf(e, 0);
  }
  function es(e) {
    var n = jr(e);
    if (me(n)) return e;
  }
  function g0(e, n) {
    if (e === "change") return n;
  }
  var ef = !1;
  if (p) {
    var la;
    if (p) {
      var aa = "oninput" in document;
      if (!aa) {
        var tf = document.createElement("div");
        tf.setAttribute("oninput", "return;"), aa = typeof tf.oninput == "function";
      }
      la = aa;
    } else la = !1;
    ef = la && (!document.documentMode || 9 < document.documentMode);
  }
  function nf() {
    $o && ($o.detachEvent("onpropertychange", rf), Ao = $o = null);
  }
  function rf(e) {
    if (e.propertyName === "value" && es(Ao)) {
      var n = [];
      Jc(n, Ao, e, xo(e)), Oi(h0, n);
    }
  }
  function m0(e, n, o) {
    e === "focusin" ? (nf(), $o = n, Ao = o, $o.attachEvent("onpropertychange", rf)) : e === "focusout" && nf();
  }
  function y0(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown") return es(Ao);
  }
  function v0(e, n) {
    if (e === "click") return es(n);
  }
  function w0(e, n) {
    if (e === "input" || e === "change") return es(n);
  }
  function x0(e, n) {
    return e === n && (e !== 0 || 1 / e === 1 / n) || e !== e && n !== n;
  }
  var Dt = typeof Object.is == "function" ? Object.is : x0;
  function Ho(e, n) {
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
  function of(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function sf(e, n) {
    var o = of(e);
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
      o = of(o);
    }
  }
  function lf(e, n) {
    return e && n ? e === n ? !0 : e && e.nodeType === 3 ? !1 : n && n.nodeType === 3 ? lf(e, n.parentNode) : "contains" in e ? e.contains(n) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(n) & 16) : !1 : !1;
  }
  function af() {
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
  function _0(e) {
    var n = af(), o = e.focusedElem, s = e.selectionRange;
    if (n !== o && o && o.ownerDocument && lf(o.ownerDocument.documentElement, o)) {
      if (s !== null && ua(o)) {
        if (n = s.start, e = s.end, e === void 0 && (e = n), "selectionStart" in o) o.selectionStart = n, o.selectionEnd = Math.min(e, o.value.length);
        else if (e = (n = o.ownerDocument || document) && n.defaultView || window, e.getSelection) {
          e = e.getSelection();
          var u = o.textContent.length, d = Math.min(s.start, u);
          s = s.end === void 0 ? d : Math.min(s.end, u), !e.extend && d > s && (u = s, s = d, d = u), u = sf(o, d);
          var w = sf(
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
  var S0 = p && "documentMode" in document && 11 >= document.documentMode, Or = null, ca = null, jo = null, fa = !1;
  function uf(e, n, o) {
    var s = o.window === o ? o.document : o.nodeType === 9 ? o : o.ownerDocument;
    fa || Or == null || Or !== ve(s) || (s = Or, "selectionStart" in s && ua(s) ? s = { start: s.selectionStart, end: s.selectionEnd } : (s = (s.ownerDocument && s.ownerDocument.defaultView || window).getSelection(), s = { anchorNode: s.anchorNode, anchorOffset: s.anchorOffset, focusNode: s.focusNode, focusOffset: s.focusOffset }), jo && Ho(jo, s) || (jo = s, s = os(ca, "onSelect"), 0 < s.length && (n = new ta("onSelect", "select", null, n, o), e.push({ event: n, listeners: s }), n.target = Or)));
  }
  function ts(e, n) {
    var o = {};
    return o[e.toLowerCase()] = n.toLowerCase(), o["Webkit" + e] = "webkit" + n, o["Moz" + e] = "moz" + n, o;
  }
  var $r = { animationend: ts("Animation", "AnimationEnd"), animationiteration: ts("Animation", "AnimationIteration"), animationstart: ts("Animation", "AnimationStart"), transitionend: ts("Transition", "TransitionEnd") }, da = {}, cf = {};
  p && (cf = document.createElement("div").style, "AnimationEvent" in window || (delete $r.animationend.animation, delete $r.animationiteration.animation, delete $r.animationstart.animation), "TransitionEvent" in window || delete $r.transitionend.transition);
  function ns(e) {
    if (da[e]) return da[e];
    if (!$r[e]) return e;
    var n = $r[e], o;
    for (o in n) if (n.hasOwnProperty(o) && o in cf) return da[e] = n[o];
    return e;
  }
  var ff = ns("animationend"), df = ns("animationiteration"), pf = ns("animationstart"), hf = ns("transitionend"), gf = /* @__PURE__ */ new Map(), mf = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function zn(e, n) {
    gf.set(e, n), c(n, [e]);
  }
  for (var pa = 0; pa < mf.length; pa++) {
    var ha = mf[pa], k0 = ha.toLowerCase(), E0 = ha[0].toUpperCase() + ha.slice(1);
    zn(k0, "on" + E0);
  }
  zn(ff, "onAnimationEnd"), zn(df, "onAnimationIteration"), zn(pf, "onAnimationStart"), zn("dblclick", "onDoubleClick"), zn("focusin", "onFocus"), zn("focusout", "onBlur"), zn(hf, "onTransitionEnd"), f("onMouseEnter", ["mouseout", "mouseover"]), f("onMouseLeave", ["mouseout", "mouseover"]), f("onPointerEnter", ["pointerout", "pointerover"]), f("onPointerLeave", ["pointerout", "pointerover"]), c("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), c("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), c("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), c("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var Fo = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), C0 = new Set("cancel close invalid load scroll toggle".split(" ").concat(Fo));
  function yf(e, n, o) {
    var s = e.type || "unknown-event";
    e.currentTarget = o, Hl(s, n, void 0, e), e.currentTarget = null;
  }
  function vf(e, n) {
    n = (n & 4) !== 0;
    for (var o = 0; o < e.length; o++) {
      var s = e[o], u = s.event;
      s = s.listeners;
      e: {
        var d = void 0;
        if (n) for (var w = s.length - 1; 0 <= w; w--) {
          var z = s[w], I = z.instance, G = z.currentTarget;
          if (z = z.listener, I !== d && u.isPropagationStopped()) break e;
          yf(u, z, G), d = I;
        }
        else for (w = 0; w < s.length; w++) {
          if (z = s[w], I = z.instance, G = z.currentTarget, z = z.listener, I !== d && u.isPropagationStopped()) break e;
          yf(u, z, G), d = I;
        }
      }
    }
    if (Mr) throw e = Eo, Mr = !1, Eo = null, e;
  }
  function De(e, n) {
    var o = n[Sa];
    o === void 0 && (o = n[Sa] = /* @__PURE__ */ new Set());
    var s = e + "__bubble";
    o.has(s) || (wf(n, e, 2, !1), o.add(s));
  }
  function ga(e, n, o) {
    var s = 0;
    n && (s |= 4), wf(o, e, s, n);
  }
  var rs = "_reactListening" + Math.random().toString(36).slice(2);
  function Vo(e) {
    if (!e[rs]) {
      e[rs] = !0, l.forEach(function(o) {
        o !== "selectionchange" && (C0.has(o) || ga(o, !1, e), ga(o, !0, e));
      });
      var n = e.nodeType === 9 ? e : e.ownerDocument;
      n === null || n[rs] || (n[rs] = !0, ga("selectionchange", !1, n));
    }
  }
  function wf(e, n, o, s) {
    switch (Fc(n)) {
      case 1:
        var u = Hm;
        break;
      case 4:
        u = jm;
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
    Oi(function() {
      var G = d, ne = xo(o), oe = [];
      e: {
        var te = gf.get(e);
        if (te !== void 0) {
          var fe = ta, pe = e;
          switch (e) {
            case "keypress":
              if (Gi(o) === 0) break e;
            case "keydown":
            case "keyup":
              fe = t0;
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
              fe = Uc;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              fe = Bm;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              fe = o0;
              break;
            case ff:
            case df:
            case pf:
              fe = Xm;
              break;
            case hf:
              fe = s0;
              break;
            case "scroll":
              fe = Fm;
              break;
            case "wheel":
              fe = a0;
              break;
            case "copy":
            case "cut":
            case "paste":
              fe = Zm;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              fe = Xc;
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
          if (te = e === "mouseover" || e === "pointerover", fe = e === "mouseout" || e === "pointerout", te && o !== wo && (pe = o.relatedTarget || o.fromElement) && (nr(pe) || pe[ln])) break e;
          if ((fe || te) && (te = ne.window === ne ? ne : (te = ne.ownerDocument) ? te.defaultView || te.parentWindow : window, fe ? (pe = o.relatedTarget || o.toElement, fe = G, pe = pe ? nr(pe) : null, pe !== null && (Be = Qt(pe), pe !== Be || pe.tag !== 5 && pe.tag !== 6) && (pe = null)) : (fe = null, pe = G), fe !== pe)) {
            if (he = Uc, se = "onMouseLeave", X = "onMouseEnter", L = "mouse", (e === "pointerout" || e === "pointerover") && (he = Xc, se = "onPointerLeave", X = "onPointerEnter", L = "pointer"), Be = fe == null ? te : jr(fe), Z = pe == null ? te : jr(pe), te = new he(se, L + "leave", fe, o, ne), te.target = Be, te.relatedTarget = Z, se = null, nr(ne) === G && (he = new he(X, L + "enter", pe, o, ne), he.target = Z, he.relatedTarget = Be, se = he), Be = se, fe && pe) t: {
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
            fe !== null && xf(oe, te, fe, he, !1), pe !== null && Be !== null && xf(oe, Be, pe, he, !0);
          }
        }
        e: {
          if (te = G ? jr(G) : window, fe = te.nodeName && te.nodeName.toLowerCase(), fe === "select" || fe === "input" && te.type === "file") var ge = g0;
          else if (qc(te)) if (ef) ge = w0;
          else {
            ge = y0;
            var xe = m0;
          }
          else (fe = te.nodeName) && fe.toLowerCase() === "input" && (te.type === "checkbox" || te.type === "radio") && (ge = v0);
          if (ge && (ge = ge(e, G))) {
            Jc(oe, ge, o, ne);
            break e;
          }
          xe && xe(e, te, G), e === "focusout" && (xe = te._wrapperState) && xe.controlled && te.type === "number" && at(te, "number", te.value);
        }
        switch (xe = G ? jr(G) : window, e) {
          case "focusin":
            (qc(xe) || xe.contentEditable === "true") && (Or = xe, ca = G, jo = null);
            break;
          case "focusout":
            jo = ca = Or = null;
            break;
          case "mousedown":
            fa = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            fa = !1, uf(oe, o, ne);
            break;
          case "selectionchange":
            if (S0) break;
          case "keydown":
          case "keyup":
            uf(oe, o, ne);
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
        else Lr ? Kc(e, o) && (ke = "onCompositionEnd") : e === "keydown" && o.keyCode === 229 && (ke = "onCompositionStart");
        ke && (Yc && o.locale !== "ko" && (Lr || ke !== "onCompositionStart" ? ke === "onCompositionEnd" && Lr && (_e = Vc()) : (Mn = ne, ea = "value" in Mn ? Mn.value : Mn.textContent, Lr = !0)), xe = os(G, ke), 0 < xe.length && (ke = new Wc(ke, e, null, o, ne), oe.push({ event: ke, listeners: xe }), _e ? ke.data = _e : (_e = Gc(o), _e !== null && (ke.data = _e)))), (_e = c0 ? f0(e, o) : d0(e, o)) && (G = os(G, "onBeforeInput"), 0 < G.length && (ne = new Wc("onBeforeInput", "beforeinput", null, o, ne), oe.push({ event: ne, listeners: G }), ne.data = _e));
      }
      vf(oe, n);
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
  function xf(e, n, o, s, u) {
    for (var d = n._reactName, w = []; o !== null && o !== s; ) {
      var z = o, I = z.alternate, G = z.stateNode;
      if (I !== null && I === s) break;
      z.tag === 5 && G !== null && (z = G, u ? (I = Qn(o, d), I != null && w.unshift(Bo(o, I, z))) : u || (I = Qn(o, d), I != null && w.push(Bo(o, I, z)))), o = o.return;
    }
    w.length !== 0 && e.push({ event: n, listeners: w });
  }
  var N0 = /\r\n?/g, M0 = /\u0000|\uFFFD/g;
  function _f(e) {
    return (typeof e == "string" ? e : "" + e).replace(N0, `
`).replace(M0, "");
  }
  function is(e, n, o) {
    if (n = _f(n), _f(e) !== n && o) throw Error(i(425));
  }
  function ss() {
  }
  var ya = null, va = null;
  function wa(e, n) {
    return e === "textarea" || e === "noscript" || typeof n.children == "string" || typeof n.children == "number" || typeof n.dangerouslySetInnerHTML == "object" && n.dangerouslySetInnerHTML !== null && n.dangerouslySetInnerHTML.__html != null;
  }
  var xa = typeof setTimeout == "function" ? setTimeout : void 0, z0 = typeof clearTimeout == "function" ? clearTimeout : void 0, Sf = typeof Promise == "function" ? Promise : void 0, P0 = typeof queueMicrotask == "function" ? queueMicrotask : typeof Sf < "u" ? function(e) {
    return Sf.resolve(null).then(e).catch(I0);
  } : xa;
  function I0(e) {
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
          e.removeChild(u), bo(n);
          return;
        }
        s--;
      } else o !== "$" && o !== "$?" && o !== "$!" || s++;
      o = u;
    } while (o);
    bo(n);
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
  function kf(e) {
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
  var Hr = Math.random().toString(36).slice(2), Kt = "__reactFiber$" + Hr, Uo = "__reactProps$" + Hr, ln = "__reactContainer$" + Hr, Sa = "__reactEvents$" + Hr, T0 = "__reactListeners$" + Hr, R0 = "__reactHandles$" + Hr;
  function nr(e) {
    var n = e[Kt];
    if (n) return n;
    for (var o = e.parentNode; o; ) {
      if (n = o[ln] || o[Kt]) {
        if (o = n.alternate, n.child !== null || o !== null && o.child !== null) for (e = kf(e); e !== null; ) {
          if (o = e[Kt]) return o;
          e = kf(e);
        }
        return n;
      }
      e = o, o = e.parentNode;
    }
    return null;
  }
  function Wo(e) {
    return e = e[Kt] || e[ln], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
  }
  function jr(e) {
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
  function Re(e, n) {
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
  function Ef(e, n, o) {
    if (nt.current !== Tn) throw Error(i(168));
    Re(nt, n), Re(ct, o);
  }
  function Cf(e, n, o) {
    var s = e.stateNode;
    if (n = n.childContextTypes, typeof s.getChildContext != "function") return o;
    s = s.getChildContext();
    for (var u in s) if (!(u in n)) throw Error(i(108, ue(e) || "Unknown", u));
    return U({}, o, s);
  }
  function us(e) {
    return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || Tn, rr = nt.current, Re(nt, e), Re(ct, ct.current), !0;
  }
  function Nf(e, n, o) {
    var s = e.stateNode;
    if (!s) throw Error(i(169));
    o ? (e = Cf(e, n, rr), s.__reactInternalMemoizedMergedChildContext = e, Le(ct), Le(nt), Re(nt, e)) : Le(ct), Re(ct, o);
  }
  var an = null, cs = !1, Ea = !1;
  function Mf(e) {
    an === null ? an = [e] : an.push(e);
  }
  function b0(e) {
    cs = !0, Mf(e);
  }
  function Rn() {
    if (!Ea && an !== null) {
      Ea = !0;
      var e = 0, n = Te;
      try {
        var o = an;
        for (Te = 1; e < o.length; e++) {
          var s = o[e];
          do
            s = s(!0);
          while (s !== null);
        }
        an = null, cs = !1;
      } catch (u) {
        throw an !== null && (an = an.slice(e + 1)), Hi(Mo, Rn), u;
      } finally {
        Te = n, Ea = !1;
      }
    }
    return null;
  }
  var Br = [], Ur = 0, fs = null, ds = 0, zt = [], Pt = 0, or = null, un = 1, cn = "";
  function ir(e, n) {
    Br[Ur++] = ds, Br[Ur++] = fs, fs = e, ds = n;
  }
  function zf(e, n, o) {
    zt[Pt++] = un, zt[Pt++] = cn, zt[Pt++] = or, or = e;
    var s = un;
    e = cn;
    var u = 32 - vt(s) - 1;
    s &= ~(1 << u), o += 1;
    var d = 32 - vt(n) + u;
    if (30 < d) {
      var w = u - u % 5;
      d = (s & (1 << w) - 1).toString(32), s >>= w, u -= w, un = 1 << 32 - vt(n) + u | o << u | s, cn = d + e;
    } else un = 1 << d | o << u | s, cn = e;
  }
  function Ca(e) {
    e.return !== null && (ir(e, 1), zf(e, 1, 0));
  }
  function Na(e) {
    for (; e === fs; ) fs = Br[--Ur], Br[Ur] = null, ds = Br[--Ur], Br[Ur] = null;
    for (; e === or; ) or = zt[--Pt], zt[Pt] = null, cn = zt[--Pt], zt[Pt] = null, un = zt[--Pt], zt[Pt] = null;
  }
  var xt = null, _t = null, Oe = !1, Lt = null;
  function Pf(e, n) {
    var o = bt(5, null, null, 0);
    o.elementType = "DELETED", o.stateNode = n, o.return = e, n = e.deletions, n === null ? (e.deletions = [o], e.flags |= 16) : n.push(o);
  }
  function If(e, n) {
    switch (e.tag) {
      case 5:
        var o = e.type;
        return n = n.nodeType !== 1 || o.toLowerCase() !== n.nodeName.toLowerCase() ? null : n, n !== null ? (e.stateNode = n, xt = e, _t = Pn(n.firstChild), !0) : !1;
      case 6:
        return n = e.pendingProps === "" || n.nodeType !== 3 ? null : n, n !== null ? (e.stateNode = n, xt = e, _t = null, !0) : !1;
      case 13:
        return n = n.nodeType !== 8 ? null : n, n !== null ? (o = or !== null ? { id: un, overflow: cn } : null, e.memoizedState = { dehydrated: n, treeContext: o, retryLane: 1073741824 }, o = bt(18, null, null, 0), o.stateNode = n, o.return = e, e.child = o, xt = e, _t = null, !0) : !1;
      default:
        return !1;
    }
  }
  function Ma(e) {
    return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
  }
  function za(e) {
    if (Oe) {
      var n = _t;
      if (n) {
        var o = n;
        if (!If(e, n)) {
          if (Ma(e)) throw Error(i(418));
          n = Pn(o.nextSibling);
          var s = xt;
          n && If(e, n) ? Pf(s, o) : (e.flags = e.flags & -4097 | 2, Oe = !1, xt = e);
        }
      } else {
        if (Ma(e)) throw Error(i(418));
        e.flags = e.flags & -4097 | 2, Oe = !1, xt = e;
      }
    }
  }
  function Tf(e) {
    for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
    xt = e;
  }
  function ps(e) {
    if (e !== xt) return !1;
    if (!Oe) return Tf(e), Oe = !0, !1;
    var n;
    if ((n = e.tag !== 3) && !(n = e.tag !== 5) && (n = e.type, n = n !== "head" && n !== "body" && !wa(e.type, e.memoizedProps)), n && (n = _t)) {
      if (Ma(e)) throw Rf(), Error(i(418));
      for (; n; ) Pf(e, n), n = Pn(n.nextSibling);
    }
    if (Tf(e), e.tag === 13) {
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
    _t = xt = null, Oe = !1;
  }
  function Pa(e) {
    Lt === null ? Lt = [e] : Lt.push(e);
  }
  var D0 = P.ReactCurrentBatchConfig;
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
  function bf(e) {
    var n = e._init;
    return n(e._payload);
  }
  function Df(e) {
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
      return X = jn(X, L), X.index = 0, X.sibling = null, X;
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
      return ge === F ? ne(X, L, Z.props.children, se, Z.key) : L !== null && (L.elementType === ge || typeof ge == "object" && ge !== null && ge.$$typeof === H && bf(ge) === L.type) ? (se = u(L, Z.props), se.ref = Xo(X, L, Z), se.return = X, se) : (se = As(Z.type, Z.key, Z.props, null, X.mode, se), se.ref = Xo(X, L, Z), se.return = X, se);
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
          case V:
            return Z = As(L.type, L.key, L.props, null, X.mode, Z), Z.ref = Xo(X, null, L), Z.return = X, Z;
          case b:
            return L = _u(L, X.mode, Z), L.return = X, L;
          case H:
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
          case V:
            return Z.key === ge ? I(X, L, Z, se) : null;
          case b:
            return Z.key === ge ? G(X, L, Z, se) : null;
          case H:
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
          case V:
            return X = X.get(se.key === null ? Z : se.key) || null, I(L, X, se, ge);
          case b:
            return X = X.get(se.key === null ? Z : se.key) || null, G(L, X, se, ge);
          case H:
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
      if (ke === Z.length) return o(X, _e), Oe && ir(X, ke), ge;
      if (_e === null) {
        for (; ke < Z.length; ke++) _e = oe(X, Z[ke], se), _e !== null && (L = d(_e, L, ke), xe === null ? ge = _e : xe.sibling = _e, xe = _e);
        return Oe && ir(X, ke), ge;
      }
      for (_e = s(X, _e); ke < Z.length; ke++) Ke = fe(_e, X, ke, Z[ke], se), Ke !== null && (e && Ke.alternate !== null && _e.delete(Ke.key === null ? ke : Ke.key), L = d(Ke, L, ke), xe === null ? ge = Ke : xe.sibling = Ke, xe = Ke);
      return e && _e.forEach(function(Fn) {
        return n(X, Fn);
      }), Oe && ir(X, ke), ge;
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
      ), Oe && ir(X, ke), ge;
      if (_e === null) {
        for (; !Ie.done; ke++, Ie = Z.next()) Ie = oe(X, Ie.value, se), Ie !== null && (L = d(Ie, L, ke), xe === null ? ge = Ie : xe.sibling = Ie, xe = Ie);
        return Oe && ir(X, ke), ge;
      }
      for (_e = s(X, _e); !Ie.done; ke++, Ie = Z.next()) Ie = fe(_e, X, ke, Ie.value, se), Ie !== null && (e && Ie.alternate !== null && _e.delete(Ie.key === null ? ke : Ie.key), L = d(Ie, L, ke), xe === null ? ge = Ie : xe.sibling = Ie, xe = Ie);
      return e && _e.forEach(function(py) {
        return n(X, py);
      }), Oe && ir(X, ke), ge;
    }
    function Be(X, L, Z, se) {
      if (typeof Z == "object" && Z !== null && Z.type === F && Z.key === null && (Z = Z.props.children), typeof Z == "object" && Z !== null) {
        switch (Z.$$typeof) {
          case V:
            e: {
              for (var ge = Z.key, xe = L; xe !== null; ) {
                if (xe.key === ge) {
                  if (ge = Z.type, ge === F) {
                    if (xe.tag === 7) {
                      o(X, xe.sibling), L = u(xe, Z.props.children), L.return = X, X = L;
                      break e;
                    }
                  } else if (xe.elementType === ge || typeof ge == "object" && ge !== null && ge.$$typeof === H && bf(ge) === xe.type) {
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
          case b:
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
          case H:
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
  var Xr = Df(!0), Lf = Df(!1), gs = In(null), ms = null, Yr = null, Ia = null;
  function Ta() {
    Ia = Yr = ms = null;
  }
  function Ra(e) {
    var n = gs.current;
    Le(gs), e._currentValue = n;
  }
  function ba(e, n, o) {
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
    return u === null ? (o.next = o, Da(n)) : (o.next = u.next, u.next = o), n.interleaved = o, fn(e, s);
  }
  function fn(e, n) {
    e.lanes |= n;
    var o = e.alternate;
    for (o !== null && (o.lanes |= n), o = e, e = e.return; e !== null; ) e.childLanes |= n, o = e.alternate, o !== null && (o.childLanes |= n), o = e, e = e.return;
    return o.tag === 3 ? o.stateNode : null;
  }
  var bn = !1;
  function La(e) {
    e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
  }
  function $f(e, n) {
    e = e.updateQueue, n.updateQueue === e && (n.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
  }
  function dn(e, n) {
    return { eventTime: e, lane: n, tag: 0, payload: null, callback: null, next: null };
  }
  function Dn(e, n, o) {
    var s = e.updateQueue;
    if (s === null) return null;
    if (s = s.shared, (Pe & 2) !== 0) {
      var u = s.pending;
      return u === null ? n.next = n : (n.next = u.next, u.next = n), s.pending = n, fn(e, o);
    }
    return u = s.interleaved, u === null ? (n.next = n, Da(s)) : (n.next = u.next, u.next = n), s.interleaved = n, fn(e, o);
  }
  function ys(e, n, o) {
    if (n = n.updateQueue, n !== null && (n = n.shared, (o & 4194240) !== 0)) {
      var s = n.lanes;
      s &= e.pendingLanes, o |= s, n.lanes = o, Rr(e, o);
    }
  }
  function Af(e, n) {
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
    bn = !1;
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
                bn = !0;
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
  function Oa(e, n) {
    switch (Re(Qo, n), Re(Zo, e), Re(Gt, Yo), e = n.nodeType, e) {
      case 9:
      case 11:
        n = (n = n.documentElement) ? n.namespaceURI : mt(null, "");
        break;
      default:
        e = e === 8 ? n.parentNode : n, n = e.namespaceURI || null, e = e.tagName, n = mt(n, e);
    }
    Le(Gt), Re(Gt, n);
  }
  function Qr() {
    Le(Gt), Le(Zo), Le(Qo);
  }
  function jf(e) {
    lr(Qo.current);
    var n = lr(Gt.current), o = mt(n, e.type);
    n !== o && (Re(Zo, e), Re(Gt, o));
  }
  function $a(e) {
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
  function Ha() {
    for (var e = 0; e < Aa.length; e++) Aa[e]._workInProgressVersionPrimary = null;
    Aa.length = 0;
  }
  var xs = P.ReactCurrentDispatcher, ja = P.ReactCurrentBatchConfig, ar = 0, He = null, Xe = null, Ze = null, _s = !1, Ko = !1, Go = 0, L0 = 0;
  function rt() {
    throw Error(i(321));
  }
  function Fa(e, n) {
    if (n === null) return !1;
    for (var o = 0; o < n.length && o < e.length; o++) if (!Dt(e[o], n[o])) return !1;
    return !0;
  }
  function Va(e, n, o, s, u, d) {
    if (ar = d, He = n, n.memoizedState = null, n.updateQueue = null, n.lanes = 0, xs.current = e === null || e.memoizedState === null ? H0 : j0, e = o(s, u), Ko) {
      d = 0;
      do {
        if (Ko = !1, Go = 0, 25 <= d) throw Error(i(301));
        d += 1, Ze = Xe = null, n.updateQueue = null, xs.current = F0, e = o(s, u);
      } while (Ko);
    }
    if (xs.current = Es, n = Xe !== null && Xe.next !== null, ar = 0, Ze = Xe = He = null, _s = !1, n) throw Error(i(300));
    return e;
  }
  function Ba() {
    var e = Go !== 0;
    return Go = 0, e;
  }
  function qt() {
    var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
    return Ze === null ? He.memoizedState = Ze = e : Ze = Ze.next = e, Ze;
  }
  function Tt() {
    if (Xe === null) {
      var e = He.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = Xe.next;
    var n = Ze === null ? He.memoizedState : Ze.next;
    if (n !== null) Ze = n, Xe = e;
    else {
      if (e === null) throw Error(i(310));
      Xe = e, e = { memoizedState: Xe.memoizedState, baseState: Xe.baseState, baseQueue: Xe.baseQueue, queue: Xe.queue, next: null }, Ze === null ? He.memoizedState = Ze = e : Ze = Ze.next = e;
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
          I === null ? (z = I = oe, w = s) : I = I.next = oe, He.lanes |= ne, ur |= ne;
        }
        G = G.next;
      } while (G !== null && G !== d);
      I === null ? w = s : I.next = z, Dt(s, n.memoizedState) || (dt = !0), n.memoizedState = s, n.baseState = w, n.baseQueue = I, o.lastRenderedState = s;
    }
    if (e = o.interleaved, e !== null) {
      u = e;
      do
        d = u.lane, He.lanes |= d, ur |= d, u = u.next;
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
  function Ff() {
  }
  function Vf(e, n) {
    var o = He, s = Tt(), u = n(), d = !Dt(s.memoizedState, u);
    if (d && (s.memoizedState = u, dt = !0), s = s.queue, Xa(Wf.bind(null, o, s, e), [e]), s.getSnapshot !== n || d || Ze !== null && Ze.memoizedState.tag & 1) {
      if (o.flags |= 2048, Jo(9, Uf.bind(null, o, s, u, n), void 0, null), Qe === null) throw Error(i(349));
      (ar & 30) !== 0 || Bf(o, n, u);
    }
    return u;
  }
  function Bf(e, n, o) {
    e.flags |= 16384, e = { getSnapshot: n, value: o }, n = He.updateQueue, n === null ? (n = { lastEffect: null, stores: null }, He.updateQueue = n, n.stores = [e]) : (o = n.stores, o === null ? n.stores = [e] : o.push(e));
  }
  function Uf(e, n, o, s) {
    n.value = o, n.getSnapshot = s, Xf(n) && Yf(e);
  }
  function Wf(e, n, o) {
    return o(function() {
      Xf(n) && Yf(e);
    });
  }
  function Xf(e) {
    var n = e.getSnapshot;
    e = e.value;
    try {
      var o = n();
      return !Dt(e, o);
    } catch {
      return !0;
    }
  }
  function Yf(e) {
    var n = fn(e, 1);
    n !== null && Ht(n, e, 1, -1);
  }
  function Zf(e) {
    var n = qt();
    return typeof e == "function" && (e = e()), n.memoizedState = n.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: qo, lastRenderedState: e }, n.queue = e, e = e.dispatch = A0.bind(null, He, e), [n.memoizedState, e];
  }
  function Jo(e, n, o, s) {
    return e = { tag: e, create: n, destroy: o, deps: s, next: null }, n = He.updateQueue, n === null ? (n = { lastEffect: null, stores: null }, He.updateQueue = n, n.lastEffect = e.next = e) : (o = n.lastEffect, o === null ? n.lastEffect = e.next = e : (s = o.next, o.next = e, e.next = s, n.lastEffect = e)), e;
  }
  function Qf() {
    return Tt().memoizedState;
  }
  function Ss(e, n, o, s) {
    var u = qt();
    He.flags |= e, u.memoizedState = Jo(1 | n, o, void 0, s === void 0 ? null : s);
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
    He.flags |= e, u.memoizedState = Jo(1 | n, o, d, s);
  }
  function Kf(e, n) {
    return Ss(8390656, 8, e, n);
  }
  function Xa(e, n) {
    return ks(2048, 8, e, n);
  }
  function Gf(e, n) {
    return ks(4, 2, e, n);
  }
  function qf(e, n) {
    return ks(4, 4, e, n);
  }
  function Jf(e, n) {
    if (typeof n == "function") return e = e(), n(e), function() {
      n(null);
    };
    if (n != null) return e = e(), n.current = e, function() {
      n.current = null;
    };
  }
  function ed(e, n, o) {
    return o = o != null ? o.concat([e]) : null, ks(4, 4, Jf.bind(null, n, e), o);
  }
  function Ya() {
  }
  function td(e, n) {
    var o = Tt();
    n = n === void 0 ? null : n;
    var s = o.memoizedState;
    return s !== null && n !== null && Fa(n, s[1]) ? s[0] : (o.memoizedState = [e, n], e);
  }
  function nd(e, n) {
    var o = Tt();
    n = n === void 0 ? null : n;
    var s = o.memoizedState;
    return s !== null && n !== null && Fa(n, s[1]) ? s[0] : (e = e(), o.memoizedState = [e, n], e);
  }
  function rd(e, n, o) {
    return (ar & 21) === 0 ? (e.baseState && (e.baseState = !1, dt = !0), e.memoizedState = o) : (Dt(o, n) || (o = Wi(), He.lanes |= o, ur |= o, e.baseState = !0), n);
  }
  function O0(e, n) {
    var o = Te;
    Te = o !== 0 && 4 > o ? o : 4, e(!0);
    var s = ja.transition;
    ja.transition = {};
    try {
      e(!1), n();
    } finally {
      Te = o, ja.transition = s;
    }
  }
  function od() {
    return Tt().memoizedState;
  }
  function $0(e, n, o) {
    var s = An(e);
    if (o = { lane: s, action: o, hasEagerState: !1, eagerState: null, next: null }, id(e)) sd(n, o);
    else if (o = Of(e, n, o, s), o !== null) {
      var u = lt();
      Ht(o, e, s, u), ld(o, n, s);
    }
  }
  function A0(e, n, o) {
    var s = An(e), u = { lane: s, action: o, hasEagerState: !1, eagerState: null, next: null };
    if (id(e)) sd(n, u);
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
      o = Of(e, n, u, s), o !== null && (u = lt(), Ht(o, e, s, u), ld(o, n, s));
    }
  }
  function id(e) {
    var n = e.alternate;
    return e === He || n !== null && n === He;
  }
  function sd(e, n) {
    Ko = _s = !0;
    var o = e.pending;
    o === null ? n.next = n : (n.next = o.next, o.next = n), e.pending = n;
  }
  function ld(e, n, o) {
    if ((o & 4194240) !== 0) {
      var s = n.lanes;
      s &= e.pendingLanes, o |= s, n.lanes = o, Rr(e, o);
    }
  }
  var Es = { readContext: It, useCallback: rt, useContext: rt, useEffect: rt, useImperativeHandle: rt, useInsertionEffect: rt, useLayoutEffect: rt, useMemo: rt, useReducer: rt, useRef: rt, useState: rt, useDebugValue: rt, useDeferredValue: rt, useTransition: rt, useMutableSource: rt, useSyncExternalStore: rt, useId: rt, unstable_isNewReconciler: !1 }, H0 = { readContext: It, useCallback: function(e, n) {
    return qt().memoizedState = [e, n === void 0 ? null : n], e;
  }, useContext: It, useEffect: Kf, useImperativeHandle: function(e, n, o) {
    return o = o != null ? o.concat([e]) : null, Ss(
      4194308,
      4,
      Jf.bind(null, n, e),
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
    return n = o !== void 0 ? o(n) : n, s.memoizedState = s.baseState = n, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: n }, s.queue = e, e = e.dispatch = $0.bind(null, He, e), [s.memoizedState, e];
  }, useRef: function(e) {
    var n = qt();
    return e = { current: e }, n.memoizedState = e;
  }, useState: Zf, useDebugValue: Ya, useDeferredValue: function(e) {
    return qt().memoizedState = e;
  }, useTransition: function() {
    var e = Zf(!1), n = e[0];
    return e = O0.bind(null, e[1]), qt().memoizedState = e, [n, e];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(e, n, o) {
    var s = He, u = qt();
    if (Oe) {
      if (o === void 0) throw Error(i(407));
      o = o();
    } else {
      if (o = n(), Qe === null) throw Error(i(349));
      (ar & 30) !== 0 || Bf(s, n, o);
    }
    u.memoizedState = o;
    var d = { value: o, getSnapshot: n };
    return u.queue = d, Kf(Wf.bind(
      null,
      s,
      d,
      e
    ), [e]), s.flags |= 2048, Jo(9, Uf.bind(null, s, d, o, n), void 0, null), o;
  }, useId: function() {
    var e = qt(), n = Qe.identifierPrefix;
    if (Oe) {
      var o = cn, s = un;
      o = (s & ~(1 << 32 - vt(s) - 1)).toString(32) + o, n = ":" + n + "R" + o, o = Go++, 0 < o && (n += "H" + o.toString(32)), n += ":";
    } else o = L0++, n = ":" + n + "r" + o.toString(32) + ":";
    return e.memoizedState = n;
  }, unstable_isNewReconciler: !1 }, j0 = {
    readContext: It,
    useCallback: td,
    useContext: It,
    useEffect: Xa,
    useImperativeHandle: ed,
    useInsertionEffect: Gf,
    useLayoutEffect: qf,
    useMemo: nd,
    useReducer: Ua,
    useRef: Qf,
    useState: function() {
      return Ua(qo);
    },
    useDebugValue: Ya,
    useDeferredValue: function(e) {
      var n = Tt();
      return rd(n, Xe.memoizedState, e);
    },
    useTransition: function() {
      var e = Ua(qo)[0], n = Tt().memoizedState;
      return [e, n];
    },
    useMutableSource: Ff,
    useSyncExternalStore: Vf,
    useId: od,
    unstable_isNewReconciler: !1
  }, F0 = { readContext: It, useCallback: td, useContext: It, useEffect: Xa, useImperativeHandle: ed, useInsertionEffect: Gf, useLayoutEffect: qf, useMemo: nd, useReducer: Wa, useRef: Qf, useState: function() {
    return Wa(qo);
  }, useDebugValue: Ya, useDeferredValue: function(e) {
    var n = Tt();
    return Xe === null ? n.memoizedState = e : rd(n, Xe.memoizedState, e);
  }, useTransition: function() {
    var e = Wa(qo)[0], n = Tt().memoizedState;
    return [e, n];
  }, useMutableSource: Ff, useSyncExternalStore: Vf, useId: od, unstable_isNewReconciler: !1 };
  function Ot(e, n) {
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
    var s = lt(), u = An(e), d = dn(s, u);
    d.payload = n, o != null && (d.callback = o), n = Dn(e, d, u), n !== null && (Ht(n, e, u, s), ys(n, e, u));
  }, enqueueReplaceState: function(e, n, o) {
    e = e._reactInternals;
    var s = lt(), u = An(e), d = dn(s, u);
    d.tag = 1, d.payload = n, o != null && (d.callback = o), n = Dn(e, d, u), n !== null && (Ht(n, e, u, s), ys(n, e, u));
  }, enqueueForceUpdate: function(e, n) {
    e = e._reactInternals;
    var o = lt(), s = An(e), u = dn(o, s);
    u.tag = 2, n != null && (u.callback = n), n = Dn(e, u, s), n !== null && (Ht(n, e, s, o), ys(n, e, s));
  } };
  function ad(e, n, o, s, u, d, w) {
    return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(s, d, w) : n.prototype && n.prototype.isPureReactComponent ? !Ho(o, s) || !Ho(u, d) : !0;
  }
  function ud(e, n, o) {
    var s = !1, u = Tn, d = n.contextType;
    return typeof d == "object" && d !== null ? d = It(d) : (u = ft(n) ? rr : nt.current, s = n.contextTypes, d = (s = s != null) ? Vr(e, u) : Tn), n = new n(o, d), e.memoizedState = n.state !== null && n.state !== void 0 ? n.state : null, n.updater = Cs, e.stateNode = n, n._reactInternals = e, s && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = u, e.__reactInternalMemoizedMaskedChildContext = d), n;
  }
  function cd(e, n, o, s) {
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
  var V0 = typeof WeakMap == "function" ? WeakMap : Map;
  function fd(e, n, o) {
    o = dn(-1, o), o.tag = 3, o.payload = { element: null };
    var s = n.value;
    return o.callback = function() {
      Rs || (Rs = !0, du = s), Ga(e, n);
    }, o;
  }
  function dd(e, n, o) {
    o = dn(-1, o), o.tag = 3;
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
      Ga(e, n), typeof s != "function" && (On === null ? On = /* @__PURE__ */ new Set([this]) : On.add(this));
      var w = n.stack;
      this.componentDidCatch(n.value, { componentStack: w !== null ? w : "" });
    }), o;
  }
  function pd(e, n, o) {
    var s = e.pingCache;
    if (s === null) {
      s = e.pingCache = new V0();
      var u = /* @__PURE__ */ new Set();
      s.set(n, u);
    } else u = s.get(n), u === void 0 && (u = /* @__PURE__ */ new Set(), s.set(n, u));
    u.has(o) || (u.add(o), e = ny.bind(null, e, n, o), n.then(e, e));
  }
  function hd(e) {
    do {
      var n;
      if ((n = e.tag === 13) && (n = e.memoizedState, n = n !== null ? n.dehydrated !== null : !0), n) return e;
      e = e.return;
    } while (e !== null);
    return null;
  }
  function gd(e, n, o, s, u) {
    return (e.mode & 1) === 0 ? (e === n ? e.flags |= 65536 : (e.flags |= 128, o.flags |= 131072, o.flags &= -52805, o.tag === 1 && (o.alternate === null ? o.tag = 17 : (n = dn(-1, 1), n.tag = 2, Dn(o, n, 1))), o.lanes |= 1), e) : (e.flags |= 65536, e.lanes = u, e);
  }
  var B0 = P.ReactCurrentOwner, dt = !1;
  function st(e, n, o, s) {
    n.child = e === null ? Lf(n, null, o, s) : Xr(n, e.child, o, s);
  }
  function md(e, n, o, s, u) {
    o = o.render;
    var d = n.ref;
    return Zr(n, u), s = Va(e, n, o, s, d, u), o = Ba(), e !== null && !dt ? (n.updateQueue = e.updateQueue, n.flags &= -2053, e.lanes &= ~u, pn(e, n, u)) : (Oe && o && Ca(n), n.flags |= 1, st(e, n, s, u), n.child);
  }
  function yd(e, n, o, s, u) {
    if (e === null) {
      var d = o.type;
      return typeof d == "function" && !wu(d) && d.defaultProps === void 0 && o.compare === null && o.defaultProps === void 0 ? (n.tag = 15, n.type = d, vd(e, n, d, s, u)) : (e = As(o.type, null, s, n, n.mode, u), e.ref = n.ref, e.return = n, n.child = e);
    }
    if (d = e.child, (e.lanes & u) === 0) {
      var w = d.memoizedProps;
      if (o = o.compare, o = o !== null ? o : Ho, o(w, s) && e.ref === n.ref) return pn(e, n, u);
    }
    return n.flags |= 1, e = jn(d, s), e.ref = n.ref, e.return = n, n.child = e;
  }
  function vd(e, n, o, s, u) {
    if (e !== null) {
      var d = e.memoizedProps;
      if (Ho(d, s) && e.ref === n.ref) if (dt = !1, n.pendingProps = s = d, (e.lanes & u) !== 0) (e.flags & 131072) !== 0 && (dt = !0);
      else return n.lanes = e.lanes, pn(e, n, u);
    }
    return qa(e, n, o, s, u);
  }
  function wd(e, n, o) {
    var s = n.pendingProps, u = s.children, d = e !== null ? e.memoizedState : null;
    if (s.mode === "hidden") if ((n.mode & 1) === 0) n.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, Re(qr, St), St |= o;
    else {
      if ((o & 1073741824) === 0) return e = d !== null ? d.baseLanes | o : o, n.lanes = n.childLanes = 1073741824, n.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, n.updateQueue = null, Re(qr, St), St |= e, null;
      n.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, s = d !== null ? d.baseLanes : o, Re(qr, St), St |= s;
    }
    else d !== null ? (s = d.baseLanes | o, n.memoizedState = null) : s = o, Re(qr, St), St |= s;
    return st(e, n, u, o), n.child;
  }
  function xd(e, n) {
    var o = n.ref;
    (e === null && o !== null || e !== null && e.ref !== o) && (n.flags |= 512, n.flags |= 2097152);
  }
  function qa(e, n, o, s, u) {
    var d = ft(o) ? rr : nt.current;
    return d = Vr(n, d), Zr(n, u), o = Va(e, n, o, s, d, u), s = Ba(), e !== null && !dt ? (n.updateQueue = e.updateQueue, n.flags &= -2053, e.lanes &= ~u, pn(e, n, u)) : (Oe && s && Ca(n), n.flags |= 1, st(e, n, o, u), n.child);
  }
  function _d(e, n, o, s, u) {
    if (ft(o)) {
      var d = !0;
      us(n);
    } else d = !1;
    if (Zr(n, u), n.stateNode === null) Ms(e, n), ud(n, o, s), Qa(n, o, s, u), s = !0;
    else if (e === null) {
      var w = n.stateNode, z = n.memoizedProps;
      w.props = z;
      var I = w.context, G = o.contextType;
      typeof G == "object" && G !== null ? G = It(G) : (G = ft(o) ? rr : nt.current, G = Vr(n, G));
      var ne = o.getDerivedStateFromProps, oe = typeof ne == "function" || typeof w.getSnapshotBeforeUpdate == "function";
      oe || typeof w.UNSAFE_componentWillReceiveProps != "function" && typeof w.componentWillReceiveProps != "function" || (z !== s || I !== G) && cd(n, w, s, G), bn = !1;
      var te = n.memoizedState;
      w.state = te, vs(n, s, w, u), I = n.memoizedState, z !== s || te !== I || ct.current || bn ? (typeof ne == "function" && (Za(n, o, ne, s), I = n.memoizedState), (z = bn || ad(n, o, z, s, te, I, G)) ? (oe || typeof w.UNSAFE_componentWillMount != "function" && typeof w.componentWillMount != "function" || (typeof w.componentWillMount == "function" && w.componentWillMount(), typeof w.UNSAFE_componentWillMount == "function" && w.UNSAFE_componentWillMount()), typeof w.componentDidMount == "function" && (n.flags |= 4194308)) : (typeof w.componentDidMount == "function" && (n.flags |= 4194308), n.memoizedProps = s, n.memoizedState = I), w.props = s, w.state = I, w.context = G, s = z) : (typeof w.componentDidMount == "function" && (n.flags |= 4194308), s = !1);
    } else {
      w = n.stateNode, $f(e, n), z = n.memoizedProps, G = n.type === n.elementType ? z : Ot(n.type, z), w.props = G, oe = n.pendingProps, te = w.context, I = o.contextType, typeof I == "object" && I !== null ? I = It(I) : (I = ft(o) ? rr : nt.current, I = Vr(n, I));
      var fe = o.getDerivedStateFromProps;
      (ne = typeof fe == "function" || typeof w.getSnapshotBeforeUpdate == "function") || typeof w.UNSAFE_componentWillReceiveProps != "function" && typeof w.componentWillReceiveProps != "function" || (z !== oe || te !== I) && cd(n, w, s, I), bn = !1, te = n.memoizedState, w.state = te, vs(n, s, w, u);
      var pe = n.memoizedState;
      z !== oe || te !== pe || ct.current || bn ? (typeof fe == "function" && (Za(n, o, fe, s), pe = n.memoizedState), (G = bn || ad(n, o, G, s, te, pe, I) || !1) ? (ne || typeof w.UNSAFE_componentWillUpdate != "function" && typeof w.componentWillUpdate != "function" || (typeof w.componentWillUpdate == "function" && w.componentWillUpdate(s, pe, I), typeof w.UNSAFE_componentWillUpdate == "function" && w.UNSAFE_componentWillUpdate(s, pe, I)), typeof w.componentDidUpdate == "function" && (n.flags |= 4), typeof w.getSnapshotBeforeUpdate == "function" && (n.flags |= 1024)) : (typeof w.componentDidUpdate != "function" || z === e.memoizedProps && te === e.memoizedState || (n.flags |= 4), typeof w.getSnapshotBeforeUpdate != "function" || z === e.memoizedProps && te === e.memoizedState || (n.flags |= 1024), n.memoizedProps = s, n.memoizedState = pe), w.props = s, w.state = pe, w.context = I, s = G) : (typeof w.componentDidUpdate != "function" || z === e.memoizedProps && te === e.memoizedState || (n.flags |= 4), typeof w.getSnapshotBeforeUpdate != "function" || z === e.memoizedProps && te === e.memoizedState || (n.flags |= 1024), s = !1);
    }
    return Ja(e, n, o, s, d, u);
  }
  function Ja(e, n, o, s, u, d) {
    xd(e, n);
    var w = (n.flags & 128) !== 0;
    if (!s && !w) return u && Nf(n, o, !1), pn(e, n, d);
    s = n.stateNode, B0.current = n;
    var z = w && typeof o.getDerivedStateFromError != "function" ? null : s.render();
    return n.flags |= 1, e !== null && w ? (n.child = Xr(n, e.child, null, d), n.child = Xr(n, null, z, d)) : st(e, n, z, d), n.memoizedState = s.state, u && Nf(n, o, !0), n.child;
  }
  function Sd(e) {
    var n = e.stateNode;
    n.pendingContext ? Ef(e, n.pendingContext, n.pendingContext !== n.context) : n.context && Ef(e, n.context, !1), Oa(e, n.containerInfo);
  }
  function kd(e, n, o, s, u) {
    return Wr(), Pa(u), n.flags |= 256, st(e, n, o, s), n.child;
  }
  var eu = { dehydrated: null, treeContext: null, retryLane: 0 };
  function tu(e) {
    return { baseLanes: e, cachePool: null, transitions: null };
  }
  function Ed(e, n, o) {
    var s = n.pendingProps, u = Ae.current, d = !1, w = (n.flags & 128) !== 0, z;
    if ((z = w) || (z = e !== null && e.memoizedState === null ? !1 : (u & 2) !== 0), z ? (d = !0, n.flags &= -129) : (e === null || e.memoizedState !== null) && (u |= 1), Re(Ae, u & 1), e === null)
      return za(n), e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? ((n.mode & 1) === 0 ? n.lanes = 1 : e.data === "$!" ? n.lanes = 8 : n.lanes = 1073741824, null) : (w = s.children, e = s.fallback, d ? (s = n.mode, d = n.child, w = { mode: "hidden", children: w }, (s & 1) === 0 && d !== null ? (d.childLanes = 0, d.pendingProps = w) : d = Hs(w, s, 0, null), e = pr(e, s, o, null), d.return = n, e.return = n, d.sibling = e, n.child = d, n.child.memoizedState = tu(o), n.memoizedState = eu, e) : nu(n, w));
    if (u = e.memoizedState, u !== null && (z = u.dehydrated, z !== null)) return U0(e, n, w, s, z, u, o);
    if (d) {
      d = s.fallback, w = n.mode, u = e.child, z = u.sibling;
      var I = { mode: "hidden", children: s.children };
      return (w & 1) === 0 && n.child !== u ? (s = n.child, s.childLanes = 0, s.pendingProps = I, n.deletions = null) : (s = jn(u, I), s.subtreeFlags = u.subtreeFlags & 14680064), z !== null ? d = jn(z, d) : (d = pr(d, w, o, null), d.flags |= 2), d.return = n, s.return = n, s.sibling = d, n.child = s, s = d, d = n.child, w = e.child.memoizedState, w = w === null ? tu(o) : { baseLanes: w.baseLanes | o, cachePool: null, transitions: w.transitions }, d.memoizedState = w, d.childLanes = e.childLanes & ~o, n.memoizedState = eu, s;
    }
    return d = e.child, e = d.sibling, s = jn(d, { mode: "visible", children: s.children }), (n.mode & 1) === 0 && (s.lanes = o), s.return = n, s.sibling = null, e !== null && (o = n.deletions, o === null ? (n.deletions = [e], n.flags |= 16) : o.push(e)), n.child = s, n.memoizedState = null, s;
  }
  function nu(e, n) {
    return n = Hs({ mode: "visible", children: n }, e.mode, 0, null), n.return = e, e.child = n;
  }
  function Ns(e, n, o, s) {
    return s !== null && Pa(s), Xr(n, e.child, null, o), e = nu(n, n.pendingProps.children), e.flags |= 2, n.memoizedState = null, e;
  }
  function U0(e, n, o, s, u, d, w) {
    if (o)
      return n.flags & 256 ? (n.flags &= -257, s = Ka(Error(i(422))), Ns(e, n, w, s)) : n.memoizedState !== null ? (n.child = e.child, n.flags |= 128, null) : (d = s.fallback, u = n.mode, s = Hs({ mode: "visible", children: s.children }, u, 0, null), d = pr(d, u, w, null), d.flags |= 2, s.return = n, d.return = n, s.sibling = d, n.child = s, (n.mode & 1) !== 0 && Xr(n, e.child, null, w), n.child.memoizedState = tu(w), n.memoizedState = eu, d);
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
        u = (u & (s.suspendedLanes | w)) !== 0 ? 0 : u, u !== 0 && u !== d.retryLane && (d.retryLane = u, fn(e, u), Ht(s, e, u, -1));
      }
      return vu(), s = Ka(Error(i(421))), Ns(e, n, w, s);
    }
    return u.data === "$?" ? (n.flags |= 128, n.child = e.child, n = ry.bind(null, e), u._reactRetry = n, null) : (e = d.treeContext, _t = Pn(u.nextSibling), xt = n, Oe = !0, Lt = null, e !== null && (zt[Pt++] = un, zt[Pt++] = cn, zt[Pt++] = or, un = e.id, cn = e.overflow, or = n), n = nu(n, s.children), n.flags |= 4096, n);
  }
  function Cd(e, n, o) {
    e.lanes |= n;
    var s = e.alternate;
    s !== null && (s.lanes |= n), ba(e.return, n, o);
  }
  function ru(e, n, o, s, u) {
    var d = e.memoizedState;
    d === null ? e.memoizedState = { isBackwards: n, rendering: null, renderingStartTime: 0, last: s, tail: o, tailMode: u } : (d.isBackwards = n, d.rendering = null, d.renderingStartTime = 0, d.last = s, d.tail = o, d.tailMode = u);
  }
  function Nd(e, n, o) {
    var s = n.pendingProps, u = s.revealOrder, d = s.tail;
    if (st(e, n, s.children, o), s = Ae.current, (s & 2) !== 0) s = s & 1 | 2, n.flags |= 128;
    else {
      if (e !== null && (e.flags & 128) !== 0) e: for (e = n.child; e !== null; ) {
        if (e.tag === 13) e.memoizedState !== null && Cd(e, o, n);
        else if (e.tag === 19) Cd(e, o, n);
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
    if (Re(Ae, s), (n.mode & 1) === 0) n.memoizedState = null;
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
  function pn(e, n, o) {
    if (e !== null && (n.dependencies = e.dependencies), ur |= n.lanes, (o & n.childLanes) === 0) return null;
    if (e !== null && n.child !== e.child) throw Error(i(153));
    if (n.child !== null) {
      for (e = n.child, o = jn(e, e.pendingProps), n.child = o, o.return = n; e.sibling !== null; ) e = e.sibling, o = o.sibling = jn(e, e.pendingProps), o.return = n;
      o.sibling = null;
    }
    return n.child;
  }
  function W0(e, n, o) {
    switch (n.tag) {
      case 3:
        Sd(n), Wr();
        break;
      case 5:
        jf(n);
        break;
      case 1:
        ft(n.type) && us(n);
        break;
      case 4:
        Oa(n, n.stateNode.containerInfo);
        break;
      case 10:
        var s = n.type._context, u = n.memoizedProps.value;
        Re(gs, s._currentValue), s._currentValue = u;
        break;
      case 13:
        if (s = n.memoizedState, s !== null)
          return s.dehydrated !== null ? (Re(Ae, Ae.current & 1), n.flags |= 128, null) : (o & n.child.childLanes) !== 0 ? Ed(e, n, o) : (Re(Ae, Ae.current & 1), e = pn(e, n, o), e !== null ? e.sibling : null);
        Re(Ae, Ae.current & 1);
        break;
      case 19:
        if (s = (o & n.childLanes) !== 0, (e.flags & 128) !== 0) {
          if (s) return Nd(e, n, o);
          n.flags |= 128;
        }
        if (u = n.memoizedState, u !== null && (u.rendering = null, u.tail = null, u.lastEffect = null), Re(Ae, Ae.current), s) break;
        return null;
      case 22:
      case 23:
        return n.lanes = 0, wd(e, n, o);
    }
    return pn(e, n, o);
  }
  var Md, ou, zd, Pd;
  Md = function(e, n) {
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
  }, zd = function(e, n, o, s) {
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
          u = on(e, u), s = on(e, s), d = [];
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
  }, Pd = function(e, n, o, s) {
    o !== s && (n.flags |= 4);
  };
  function ei(e, n) {
    if (!Oe) switch (e.tailMode) {
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
  function X0(e, n, o) {
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
        return s = n.stateNode, Qr(), Le(ct), Le(nt), Ha(), s.pendingContext && (s.context = s.pendingContext, s.pendingContext = null), (e === null || e.child === null) && (ps(n) ? n.flags |= 4 : e === null || e.memoizedState.isDehydrated && (n.flags & 256) === 0 || (n.flags |= 1024, Lt !== null && (gu(Lt), Lt = null))), ou(e, n), ot(n), null;
      case 5:
        $a(n);
        var u = lr(Qo.current);
        if (o = n.type, e !== null && n.stateNode != null) zd(e, n, o, s, u), e.ref !== n.ref && (n.flags |= 512, n.flags |= 2097152);
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
            w = u.nodeType === 9 ? u : u.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = Nt(o)), e === "http://www.w3.org/1999/xhtml" ? o === "script" ? (e = w.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof s.is == "string" ? e = w.createElement(o, { is: s.is }) : (e = w.createElement(o), o === "select" && (w = e, s.multiple ? w.multiple = !0 : s.size && (w.size = s.size))) : e = w.createElementNS(e, o), e[Kt] = n, e[Uo] = s, Md(e, n, !1, !1), n.stateNode = e;
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
                  Yt(e, s), u = on(e, s), De("invalid", e);
                  break;
                default:
                  u = s;
              }
              yo(o, u), z = u;
              for (d in z) if (z.hasOwnProperty(d)) {
                var I = z[d];
                d === "style" ? Ii(e, I) : d === "dangerouslySetInnerHTML" ? (I = I ? I.__html : void 0, I != null && Cr(e, I)) : d === "children" ? typeof I == "string" ? (o !== "textarea" || I !== "") && sn(e, I) : typeof I == "number" && sn(e, "" + I) : d !== "suppressContentEditableWarning" && d !== "suppressHydrationWarning" && d !== "autoFocus" && (a.hasOwnProperty(d) ? I != null && d === "onScroll" && De("scroll", e) : I != null && S(e, d, I, w));
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
        if (e && n.stateNode != null) Pd(e, n, e.memoizedProps, s);
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
          if (Oe && _t !== null && (n.mode & 1) !== 0 && (n.flags & 128) === 0) Rf(), Wr(), n.flags |= 98560, d = !1;
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
        return Ra(n.type._context), ot(n), null;
      case 17:
        return ft(n.type) && as(), ot(n), null;
      case 19:
        if (Le(Ae), d = n.memoizedState, d === null) return ot(n), null;
        if (s = (n.flags & 128) !== 0, w = d.rendering, w === null) if (s) ei(d, !1);
        else {
          if (Ye !== 0 || e !== null && (e.flags & 128) !== 0) for (e = n.child; e !== null; ) {
            if (w = ws(e), w !== null) {
              for (n.flags |= 128, ei(d, !1), s = w.updateQueue, s !== null && (n.updateQueue = s, n.flags |= 4), n.subtreeFlags = 0, s = o, o = n.child; o !== null; ) d = o, e = s, d.flags &= 14680066, w = d.alternate, w === null ? (d.childLanes = 0, d.lanes = e, d.child = null, d.subtreeFlags = 0, d.memoizedProps = null, d.memoizedState = null, d.updateQueue = null, d.dependencies = null, d.stateNode = null) : (d.childLanes = w.childLanes, d.lanes = w.lanes, d.child = w.child, d.subtreeFlags = 0, d.deletions = null, d.memoizedProps = w.memoizedProps, d.memoizedState = w.memoizedState, d.updateQueue = w.updateQueue, d.type = w.type, e = w.dependencies, d.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), o = o.sibling;
              return Re(Ae, Ae.current & 1 | 2), n.child;
            }
            e = e.sibling;
          }
          d.tail !== null && $e() > Jr && (n.flags |= 128, s = !0, ei(d, !1), n.lanes = 4194304);
        }
        else {
          if (!s) if (e = ws(w), e !== null) {
            if (n.flags |= 128, s = !0, o = e.updateQueue, o !== null && (n.updateQueue = o, n.flags |= 4), ei(d, !0), d.tail === null && d.tailMode === "hidden" && !w.alternate && !Oe) return ot(n), null;
          } else 2 * $e() - d.renderingStartTime > Jr && o !== 1073741824 && (n.flags |= 128, s = !0, ei(d, !1), n.lanes = 4194304);
          d.isBackwards ? (w.sibling = n.child, n.child = w) : (o = d.last, o !== null ? o.sibling = w : n.child = w, d.last = w);
        }
        return d.tail !== null ? (n = d.tail, d.rendering = n, d.tail = n.sibling, d.renderingStartTime = $e(), n.sibling = null, o = Ae.current, Re(Ae, s ? o & 1 | 2 : o & 1), n) : (ot(n), null);
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
  function Y0(e, n) {
    switch (Na(n), n.tag) {
      case 1:
        return ft(n.type) && as(), e = n.flags, e & 65536 ? (n.flags = e & -65537 | 128, n) : null;
      case 3:
        return Qr(), Le(ct), Le(nt), Ha(), e = n.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (n.flags = e & -65537 | 128, n) : null;
      case 5:
        return $a(n), null;
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
        return Ra(n.type._context), null;
      case 22:
      case 23:
        return yu(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var zs = !1, it = !1, Z0 = typeof WeakSet == "function" ? WeakSet : Set, de = null;
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
  var Id = !1;
  function Q0(e, n) {
    if (ya = Zi, e = af(), ua(e)) {
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
              var he = pe.memoizedProps, Be = pe.memoizedState, X = n.stateNode, L = X.getSnapshotBeforeUpdate(n.elementType === n.type ? he : Ot(n.type, he), Be);
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
    return pe = Id, Id = !1, pe;
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
  function Td(e) {
    var n = e.alternate;
    n !== null && (e.alternate = null, Td(n)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (n = e.stateNode, n !== null && (delete n[Kt], delete n[Uo], delete n[Sa], delete n[T0], delete n[R0])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
  }
  function Rd(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 4;
  }
  function bd(e) {
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
  var qe = null, $t = !1;
  function Ln(e, n, o) {
    for (o = o.child; o !== null; ) Dd(e, n, o), o = o.sibling;
  }
  function Dd(e, n, o) {
    if (yt && typeof yt.onCommitFiberUnmount == "function") try {
      yt.onCommitFiberUnmount(Pr, o);
    } catch {
    }
    switch (o.tag) {
      case 5:
        it || Gr(o, n);
      case 6:
        var s = qe, u = $t;
        qe = null, Ln(e, n, o), qe = s, $t = u, qe !== null && ($t ? (e = qe, o = o.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(o) : e.removeChild(o)) : qe.removeChild(o.stateNode));
        break;
      case 18:
        qe !== null && ($t ? (e = qe, o = o.stateNode, e.nodeType === 8 ? _a(e.parentNode, o) : e.nodeType === 1 && _a(e, o), bo(e)) : _a(qe, o.stateNode));
        break;
      case 4:
        s = qe, u = $t, qe = o.stateNode.containerInfo, $t = !0, Ln(e, n, o), qe = s, $t = u;
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
  function Ld(e) {
    var n = e.updateQueue;
    if (n !== null) {
      e.updateQueue = null;
      var o = e.stateNode;
      o === null && (o = e.stateNode = new Z0()), n.forEach(function(s) {
        var u = oy.bind(null, e, s);
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
              qe = z.stateNode, $t = !1;
              break e;
            case 3:
              qe = z.stateNode.containerInfo, $t = !0;
              break e;
            case 4:
              qe = z.stateNode.containerInfo, $t = !0;
              break e;
          }
          z = z.return;
        }
        if (qe === null) throw Error(i(160));
        Dd(d, w, u), qe = null, $t = !1;
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
            sn(u, "");
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
              ne === "style" ? Ii(u, oe) : ne === "dangerouslySetInnerHTML" ? Cr(u, oe) : ne === "children" ? sn(u, oe) : S(u, ne, oe, G);
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
          bo(n.containerInfo);
        } catch (he) {
          Fe(e, e.return, he);
        }
        break;
      case 4:
        At(n, e), Jt(e);
        break;
      case 13:
        At(n, e), Jt(e), u = e.child, u.flags & 8192 && (d = u.memoizedState !== null, u.stateNode.isHidden = d, !d || u.alternate !== null && u.alternate.memoizedState !== null || (fu = $e())), s & 4 && Ld(e);
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
        At(n, e), Jt(e), s & 4 && Ld(e);
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
            s.flags & 32 && (sn(u, ""), s.flags &= -33);
            var d = bd(e);
            au(e, d, u);
            break;
          case 3:
          case 4:
            var w = s.stateNode.containerInfo, z = bd(e);
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
  function K0(e, n, o) {
    de = e, $d(e);
  }
  function $d(e, n, o) {
    for (var s = (e.mode & 1) !== 0; de !== null; ) {
      var u = de, d = u.child;
      if (u.tag === 22 && s) {
        var w = u.memoizedState !== null || zs;
        if (!w) {
          var z = u.alternate, I = z !== null && z.memoizedState !== null || it;
          z = zs;
          var G = it;
          if (zs = w, (it = I) && !G) for (de = u; de !== null; ) w = de, I = w.child, w.tag === 22 && w.memoizedState !== null ? jd(u) : I !== null ? (I.return = w, de = I) : jd(u);
          for (; d !== null; ) de = d, $d(d), d = d.sibling;
          de = u, zs = z, it = G;
        }
        Ad(e);
      } else (u.subtreeFlags & 8772) !== 0 && d !== null ? (d.return = u, de = d) : Ad(e);
    }
  }
  function Ad(e) {
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
                var u = n.elementType === n.type ? o.memoizedProps : Ot(n.type, o.memoizedProps);
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
                    oe !== null && bo(oe);
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
  function jd(e) {
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
  var G0 = Math.ceil, Is = P.ReactCurrentDispatcher, uu = P.ReactCurrentOwner, Rt = P.ReactCurrentBatchConfig, Pe = 0, Qe = null, Ue = null, Je = 0, St = 0, qr = In(0), Ye = 0, ni = null, ur = 0, Ts = 0, cu = 0, ri = null, pt = null, fu = 0, Jr = 1 / 0, hn = null, Rs = !1, du = null, On = null, bs = !1, $n = null, Ds = 0, oi = 0, pu = null, Ls = -1, Os = 0;
  function lt() {
    return (Pe & 6) !== 0 ? $e() : Ls !== -1 ? Ls : Ls = $e();
  }
  function An(e) {
    return (e.mode & 1) === 0 ? 1 : (Pe & 2) !== 0 && Je !== 0 ? Je & -Je : D0.transition !== null ? (Os === 0 && (Os = Wi()), Os) : (e = Te, e !== 0 || (e = window.event, e = e === void 0 ? 16 : Fc(e.type)), e);
  }
  function Ht(e, n, o, s) {
    if (50 < oi) throw oi = 0, pu = null, Error(i(185));
    tr(e, o, s), ((Pe & 2) === 0 || e !== Qe) && (e === Qe && ((Pe & 2) === 0 && (Ts |= o), Ye === 4 && Hn(e, Je)), ht(e, s), o === 1 && Pe === 0 && (n.mode & 1) === 0 && (Jr = $e() + 500, cs && Rn()));
  }
  function ht(e, n) {
    var o = e.callbackNode;
    Ui(e, n);
    var s = Jn(e, e === Qe ? Je : 0);
    if (s === 0) o !== null && ji(o), e.callbackNode = null, e.callbackPriority = 0;
    else if (n = s & -s, e.callbackPriority !== n) {
      if (o != null && ji(o), n === 1) e.tag === 0 ? b0(Vd.bind(null, e)) : Mf(Vd.bind(null, e)), P0(function() {
        (Pe & 6) === 0 && Rn();
      }), o = null;
      else {
        switch (bc(s)) {
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
        o = Kd(o, Fd.bind(null, e));
      }
      e.callbackPriority = n, e.callbackNode = o;
    }
  }
  function Fd(e, n) {
    if (Ls = -1, Os = 0, (Pe & 6) !== 0) throw Error(i(327));
    var o = e.callbackNode;
    if (eo() && e.callbackNode !== o) return null;
    var s = Jn(e, e === Qe ? Je : 0);
    if (s === 0) return null;
    if ((s & 30) !== 0 || (s & e.expiredLanes) !== 0 || n) n = $s(e, s);
    else {
      n = s;
      var u = Pe;
      Pe |= 2;
      var d = Ud();
      (Qe !== e || Je !== n) && (hn = null, Jr = $e() + 500, fr(e, n));
      do
        try {
          ey();
          break;
        } catch (z) {
          Bd(e, z);
        }
      while (!0);
      Ta(), Is.current = d, Pe = u, Ue !== null ? n = 0 : (Qe = null, Je = 0, n = Ye);
    }
    if (n !== 0) {
      if (n === 2 && (u = zo(e), u !== 0 && (s = u, n = hu(e, u))), n === 1) throw o = ni, fr(e, 0), Hn(e, s), ht(e, $e()), o;
      if (n === 6) Hn(e, s);
      else {
        if (u = e.current.alternate, (s & 30) === 0 && !q0(u) && (n = $s(e, s), n === 2 && (d = zo(e), d !== 0 && (s = d, n = hu(e, d))), n === 1)) throw o = ni, fr(e, 0), Hn(e, s), ht(e, $e()), o;
        switch (e.finishedWork = u, e.finishedLanes = s, n) {
          case 0:
          case 1:
            throw Error(i(345));
          case 2:
            dr(e, pt, hn);
            break;
          case 3:
            if (Hn(e, s), (s & 130023424) === s && (n = fu + 500 - $e(), 10 < n)) {
              if (Jn(e, 0) !== 0) break;
              if (u = e.suspendedLanes, (u & s) !== s) {
                lt(), e.pingedLanes |= e.suspendedLanes & u;
                break;
              }
              e.timeoutHandle = xa(dr.bind(null, e, pt, hn), n);
              break;
            }
            dr(e, pt, hn);
            break;
          case 4:
            if (Hn(e, s), (s & 4194240) === s) break;
            for (n = e.eventTimes, u = -1; 0 < s; ) {
              var w = 31 - vt(s);
              d = 1 << w, w = n[w], w > u && (u = w), s &= ~d;
            }
            if (s = u, s = $e() - s, s = (120 > s ? 120 : 480 > s ? 480 : 1080 > s ? 1080 : 1920 > s ? 1920 : 3e3 > s ? 3e3 : 4320 > s ? 4320 : 1960 * G0(s / 1960)) - s, 10 < s) {
              e.timeoutHandle = xa(dr.bind(null, e, pt, hn), s);
              break;
            }
            dr(e, pt, hn);
            break;
          case 5:
            dr(e, pt, hn);
            break;
          default:
            throw Error(i(329));
        }
      }
    }
    return ht(e, $e()), e.callbackNode === o ? Fd.bind(null, e) : null;
  }
  function hu(e, n) {
    var o = ri;
    return e.current.memoizedState.isDehydrated && (fr(e, n).flags |= 256), e = $s(e, n), e !== 2 && (n = pt, pt = o, n !== null && gu(n)), e;
  }
  function gu(e) {
    pt === null ? pt = e : pt.push.apply(pt, e);
  }
  function q0(e) {
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
  function Hn(e, n) {
    for (n &= ~cu, n &= ~Ts, e.suspendedLanes |= n, e.pingedLanes &= ~n, e = e.expirationTimes; 0 < n; ) {
      var o = 31 - vt(n), s = 1 << o;
      e[o] = -1, n &= ~s;
    }
  }
  function Vd(e) {
    if ((Pe & 6) !== 0) throw Error(i(327));
    eo();
    var n = Jn(e, 0);
    if ((n & 1) === 0) return ht(e, $e()), null;
    var o = $s(e, n);
    if (e.tag !== 0 && o === 2) {
      var s = zo(e);
      s !== 0 && (n = s, o = hu(e, s));
    }
    if (o === 1) throw o = ni, fr(e, 0), Hn(e, n), ht(e, $e()), o;
    if (o === 6) throw Error(i(345));
    return e.finishedWork = e.current.alternate, e.finishedLanes = n, dr(e, pt, hn), ht(e, $e()), null;
  }
  function mu(e, n) {
    var o = Pe;
    Pe |= 1;
    try {
      return e(n);
    } finally {
      Pe = o, Pe === 0 && (Jr = $e() + 500, cs && Rn());
    }
  }
  function cr(e) {
    $n !== null && $n.tag === 0 && (Pe & 6) === 0 && eo();
    var n = Pe;
    Pe |= 1;
    var o = Rt.transition, s = Te;
    try {
      if (Rt.transition = null, Te = 1, e) return e();
    } finally {
      Te = s, Rt.transition = o, Pe = n, (Pe & 6) === 0 && Rn();
    }
  }
  function yu() {
    St = qr.current, Le(qr);
  }
  function fr(e, n) {
    e.finishedWork = null, e.finishedLanes = 0;
    var o = e.timeoutHandle;
    if (o !== -1 && (e.timeoutHandle = -1, z0(o)), Ue !== null) for (o = Ue.return; o !== null; ) {
      var s = o;
      switch (Na(s), s.tag) {
        case 1:
          s = s.type.childContextTypes, s != null && as();
          break;
        case 3:
          Qr(), Le(ct), Le(nt), Ha();
          break;
        case 5:
          $a(s);
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
          Ra(s.type._context);
          break;
        case 22:
        case 23:
          yu();
      }
      o = o.return;
    }
    if (Qe = e, Ue = e = jn(e.current, null), Je = St = n, Ye = 0, ni = null, cu = Ts = ur = 0, pt = ri = null, sr !== null) {
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
  function Bd(e, n) {
    do {
      var o = Ue;
      try {
        if (Ta(), xs.current = Es, _s) {
          for (var s = He.memoizedState; s !== null; ) {
            var u = s.queue;
            u !== null && (u.pending = null), s = s.next;
          }
          _s = !1;
        }
        if (ar = 0, Ze = Xe = He = null, Ko = !1, Go = 0, uu.current = null, o === null || o.return === null) {
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
            var fe = hd(w);
            if (fe !== null) {
              fe.flags &= -257, gd(fe, w, z, d, n), fe.mode & 1 && pd(d, G, n), n = fe, I = G;
              var pe = n.updateQueue;
              if (pe === null) {
                var he = /* @__PURE__ */ new Set();
                he.add(I), n.updateQueue = he;
              } else pe.add(I);
              break e;
            } else {
              if ((n & 1) === 0) {
                pd(d, G, n), vu();
                break e;
              }
              I = Error(i(426));
            }
          } else if (Oe && z.mode & 1) {
            var Be = hd(w);
            if (Be !== null) {
              (Be.flags & 65536) === 0 && (Be.flags |= 256), gd(Be, w, z, d, n), Pa(Kr(I, z));
              break e;
            }
          }
          d = I = Kr(I, z), Ye !== 4 && (Ye = 2), ri === null ? ri = [d] : ri.push(d), d = w;
          do {
            switch (d.tag) {
              case 3:
                d.flags |= 65536, n &= -n, d.lanes |= n;
                var X = fd(d, I, n);
                Af(d, X);
                break e;
              case 1:
                z = I;
                var L = d.type, Z = d.stateNode;
                if ((d.flags & 128) === 0 && (typeof L.getDerivedStateFromError == "function" || Z !== null && typeof Z.componentDidCatch == "function" && (On === null || !On.has(Z)))) {
                  d.flags |= 65536, n &= -n, d.lanes |= n;
                  var se = dd(d, z, n);
                  Af(d, se);
                  break e;
                }
            }
            d = d.return;
          } while (d !== null);
        }
        Xd(o);
      } catch (ge) {
        n = ge, Ue === o && o !== null && (Ue = o = o.return);
        continue;
      }
      break;
    } while (!0);
  }
  function Ud() {
    var e = Is.current;
    return Is.current = Es, e === null ? Es : e;
  }
  function vu() {
    (Ye === 0 || Ye === 3 || Ye === 2) && (Ye = 4), Qe === null || (ur & 268435455) === 0 && (Ts & 268435455) === 0 || Hn(Qe, Je);
  }
  function $s(e, n) {
    var o = Pe;
    Pe |= 2;
    var s = Ud();
    (Qe !== e || Je !== n) && (hn = null, fr(e, n));
    do
      try {
        J0();
        break;
      } catch (u) {
        Bd(e, u);
      }
    while (!0);
    if (Ta(), Pe = o, Is.current = s, Ue !== null) throw Error(i(261));
    return Qe = null, Je = 0, Ye;
  }
  function J0() {
    for (; Ue !== null; ) Wd(Ue);
  }
  function ey() {
    for (; Ue !== null && !Fl(); ) Wd(Ue);
  }
  function Wd(e) {
    var n = Qd(e.alternate, e, St);
    e.memoizedProps = e.pendingProps, n === null ? Xd(e) : Ue = n, uu.current = null;
  }
  function Xd(e) {
    var n = e;
    do {
      var o = n.alternate;
      if (e = n.return, (n.flags & 32768) === 0) {
        if (o = X0(o, n, St), o !== null) {
          Ue = o;
          return;
        }
      } else {
        if (o = Y0(o, n), o !== null) {
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
    var s = Te, u = Rt.transition;
    try {
      Rt.transition = null, Te = 1, ty(e, n, o, s);
    } finally {
      Rt.transition = u, Te = s;
    }
    return null;
  }
  function ty(e, n, o, s) {
    do
      eo();
    while ($n !== null);
    if ((Pe & 6) !== 0) throw Error(i(327));
    o = e.finishedWork;
    var u = e.finishedLanes;
    if (o === null) return null;
    if (e.finishedWork = null, e.finishedLanes = 0, o === e.current) throw Error(i(177));
    e.callbackNode = null, e.callbackPriority = 0;
    var d = o.lanes | o.childLanes;
    if (Ql(e, d), e === Qe && (Ue = Qe = null, Je = 0), (o.subtreeFlags & 2064) === 0 && (o.flags & 2064) === 0 || bs || (bs = !0, Kd(zr, function() {
      return eo(), null;
    })), d = (o.flags & 15990) !== 0, (o.subtreeFlags & 15990) !== 0 || d) {
      d = Rt.transition, Rt.transition = null;
      var w = Te;
      Te = 1;
      var z = Pe;
      Pe |= 4, uu.current = null, Q0(e, o), Od(o, e), _0(va), Zi = !!ya, va = ya = null, e.current = o, K0(o), Fi(), Pe = z, Te = w, Rt.transition = d;
    } else e.current = o;
    if (bs && (bs = !1, $n = e, Ds = u), d = e.pendingLanes, d === 0 && (On = null), Ul(o.stateNode), ht(e, $e()), n !== null) for (s = e.onRecoverableError, o = 0; o < n.length; o++) u = n[o], s(u.value, { componentStack: u.stack, digest: u.digest });
    if (Rs) throw Rs = !1, e = du, du = null, e;
    return (Ds & 1) !== 0 && e.tag !== 0 && eo(), d = e.pendingLanes, (d & 1) !== 0 ? e === pu ? oi++ : (oi = 0, pu = e) : oi = 0, Rn(), null;
  }
  function eo() {
    if ($n !== null) {
      var e = bc(Ds), n = Rt.transition, o = Te;
      try {
        if (Rt.transition = null, Te = 16 > e ? 16 : e, $n === null) var s = !1;
        else {
          if (e = $n, $n = null, Ds = 0, (Pe & 6) !== 0) throw Error(i(331));
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
                      if (Td(ne), ne === G) {
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
          if (Pe = u, Rn(), yt && typeof yt.onPostCommitFiberRoot == "function") try {
            yt.onPostCommitFiberRoot(Pr, e);
          } catch {
          }
          s = !0;
        }
        return s;
      } finally {
        Te = o, Rt.transition = n;
      }
    }
    return !1;
  }
  function Yd(e, n, o) {
    n = Kr(o, n), n = fd(e, n, 1), e = Dn(e, n, 1), n = lt(), e !== null && (tr(e, 1, n), ht(e, n));
  }
  function Fe(e, n, o) {
    if (e.tag === 3) Yd(e, e, o);
    else for (; n !== null; ) {
      if (n.tag === 3) {
        Yd(n, e, o);
        break;
      } else if (n.tag === 1) {
        var s = n.stateNode;
        if (typeof n.type.getDerivedStateFromError == "function" || typeof s.componentDidCatch == "function" && (On === null || !On.has(s))) {
          e = Kr(o, e), e = dd(n, e, 1), n = Dn(n, e, 1), e = lt(), n !== null && (tr(n, 1, e), ht(n, e));
          break;
        }
      }
      n = n.return;
    }
  }
  function ny(e, n, o) {
    var s = e.pingCache;
    s !== null && s.delete(n), n = lt(), e.pingedLanes |= e.suspendedLanes & o, Qe === e && (Je & o) === o && (Ye === 4 || Ye === 3 && (Je & 130023424) === Je && 500 > $e() - fu ? fr(e, 0) : cu |= o), ht(e, n);
  }
  function Zd(e, n) {
    n === 0 && ((e.mode & 1) === 0 ? n = 1 : (n = Tr, Tr <<= 1, (Tr & 130023424) === 0 && (Tr = 4194304)));
    var o = lt();
    e = fn(e, n), e !== null && (tr(e, n, o), ht(e, o));
  }
  function ry(e) {
    var n = e.memoizedState, o = 0;
    n !== null && (o = n.retryLane), Zd(e, o);
  }
  function oy(e, n) {
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
    s !== null && s.delete(n), Zd(e, o);
  }
  var Qd;
  Qd = function(e, n, o) {
    if (e !== null) if (e.memoizedProps !== n.pendingProps || ct.current) dt = !0;
    else {
      if ((e.lanes & o) === 0 && (n.flags & 128) === 0) return dt = !1, W0(e, n, o);
      dt = (e.flags & 131072) !== 0;
    }
    else dt = !1, Oe && (n.flags & 1048576) !== 0 && zf(n, ds, n.index);
    switch (n.lanes = 0, n.tag) {
      case 2:
        var s = n.type;
        Ms(e, n), e = n.pendingProps;
        var u = Vr(n, nt.current);
        Zr(n, o), u = Va(null, n, s, e, u, o);
        var d = Ba();
        return n.flags |= 1, typeof u == "object" && u !== null && typeof u.render == "function" && u.$$typeof === void 0 ? (n.tag = 1, n.memoizedState = null, n.updateQueue = null, ft(s) ? (d = !0, us(n)) : d = !1, n.memoizedState = u.state !== null && u.state !== void 0 ? u.state : null, La(n), u.updater = Cs, n.stateNode = u, u._reactInternals = n, Qa(n, s, e, o), n = Ja(null, n, s, !0, d, o)) : (n.tag = 0, Oe && d && Ca(n), st(null, n, u, o), n = n.child), n;
      case 16:
        s = n.elementType;
        e: {
          switch (Ms(e, n), e = n.pendingProps, u = s._init, s = u(s._payload), n.type = s, u = n.tag = sy(s), e = Ot(s, e), u) {
            case 0:
              n = qa(null, n, s, e, o);
              break e;
            case 1:
              n = _d(null, n, s, e, o);
              break e;
            case 11:
              n = md(null, n, s, e, o);
              break e;
            case 14:
              n = yd(null, n, s, Ot(s.type, e), o);
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
        return s = n.type, u = n.pendingProps, u = n.elementType === s ? u : Ot(s, u), qa(e, n, s, u, o);
      case 1:
        return s = n.type, u = n.pendingProps, u = n.elementType === s ? u : Ot(s, u), _d(e, n, s, u, o);
      case 3:
        e: {
          if (Sd(n), e === null) throw Error(i(387));
          s = n.pendingProps, d = n.memoizedState, u = d.element, $f(e, n), vs(n, s, null, o);
          var w = n.memoizedState;
          if (s = w.element, d.isDehydrated) if (d = { element: s, isDehydrated: !1, cache: w.cache, pendingSuspenseBoundaries: w.pendingSuspenseBoundaries, transitions: w.transitions }, n.updateQueue.baseState = d, n.memoizedState = d, n.flags & 256) {
            u = Kr(Error(i(423)), n), n = kd(e, n, s, o, u);
            break e;
          } else if (s !== u) {
            u = Kr(Error(i(424)), n), n = kd(e, n, s, o, u);
            break e;
          } else for (_t = Pn(n.stateNode.containerInfo.firstChild), xt = n, Oe = !0, Lt = null, o = Lf(n, null, s, o), n.child = o; o; ) o.flags = o.flags & -3 | 4096, o = o.sibling;
          else {
            if (Wr(), s === u) {
              n = pn(e, n, o);
              break e;
            }
            st(e, n, s, o);
          }
          n = n.child;
        }
        return n;
      case 5:
        return jf(n), e === null && za(n), s = n.type, u = n.pendingProps, d = e !== null ? e.memoizedProps : null, w = u.children, wa(s, u) ? w = null : d !== null && wa(s, d) && (n.flags |= 32), xd(e, n), st(e, n, w, o), n.child;
      case 6:
        return e === null && za(n), null;
      case 13:
        return Ed(e, n, o);
      case 4:
        return Oa(n, n.stateNode.containerInfo), s = n.pendingProps, e === null ? n.child = Xr(n, null, s, o) : st(e, n, s, o), n.child;
      case 11:
        return s = n.type, u = n.pendingProps, u = n.elementType === s ? u : Ot(s, u), md(e, n, s, u, o);
      case 7:
        return st(e, n, n.pendingProps, o), n.child;
      case 8:
        return st(e, n, n.pendingProps.children, o), n.child;
      case 12:
        return st(e, n, n.pendingProps.children, o), n.child;
      case 10:
        e: {
          if (s = n.type._context, u = n.pendingProps, d = n.memoizedProps, w = u.value, Re(gs, s._currentValue), s._currentValue = w, d !== null) if (Dt(d.value, w)) {
            if (d.children === u.children && !ct.current) {
              n = pn(e, n, o);
              break e;
            }
          } else for (d = n.child, d !== null && (d.return = n); d !== null; ) {
            var z = d.dependencies;
            if (z !== null) {
              w = d.child;
              for (var I = z.firstContext; I !== null; ) {
                if (I.context === s) {
                  if (d.tag === 1) {
                    I = dn(-1, o & -o), I.tag = 2;
                    var G = d.updateQueue;
                    if (G !== null) {
                      G = G.shared;
                      var ne = G.pending;
                      ne === null ? I.next = I : (I.next = ne.next, ne.next = I), G.pending = I;
                    }
                  }
                  d.lanes |= o, I = d.alternate, I !== null && (I.lanes |= o), ba(
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
              w.lanes |= o, z = w.alternate, z !== null && (z.lanes |= o), ba(w, o, n), w = d.sibling;
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
        return s = n.type, u = Ot(s, n.pendingProps), u = Ot(s.type, u), yd(e, n, s, u, o);
      case 15:
        return vd(e, n, n.type, n.pendingProps, o);
      case 17:
        return s = n.type, u = n.pendingProps, u = n.elementType === s ? u : Ot(s, u), Ms(e, n), n.tag = 1, ft(s) ? (e = !0, us(n)) : e = !1, Zr(n, o), ud(n, s, u), Qa(n, s, u, o), Ja(null, n, s, !0, e, o);
      case 19:
        return Nd(e, n, o);
      case 22:
        return wd(e, n, o);
    }
    throw Error(i(156, n.tag));
  };
  function Kd(e, n) {
    return Hi(e, n);
  }
  function iy(e, n, o, s) {
    this.tag = e, this.key = o, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = n, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = s, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function bt(e, n, o, s) {
    return new iy(e, n, o, s);
  }
  function wu(e) {
    return e = e.prototype, !(!e || !e.isReactComponent);
  }
  function sy(e) {
    if (typeof e == "function") return wu(e) ? 1 : 0;
    if (e != null) {
      if (e = e.$$typeof, e === J) return 11;
      if (e === O) return 14;
    }
    return 2;
  }
  function jn(e, n) {
    var o = e.alternate;
    return o === null ? (o = bt(e.tag, n, e.key, e.mode), o.elementType = e.elementType, o.type = e.type, o.stateNode = e.stateNode, o.alternate = e, e.alternate = o) : (o.pendingProps = n, o.type = e.type, o.flags = 0, o.subtreeFlags = 0, o.deletions = null), o.flags = e.flags & 14680064, o.childLanes = e.childLanes, o.lanes = e.lanes, o.child = e.child, o.memoizedProps = e.memoizedProps, o.memoizedState = e.memoizedState, o.updateQueue = e.updateQueue, n = e.dependencies, o.dependencies = n === null ? null : { lanes: n.lanes, firstContext: n.firstContext }, o.sibling = e.sibling, o.index = e.index, o.ref = e.ref, o;
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
        return e = bt(12, o, n, u | 2), e.elementType = K, e.lanes = d, e;
      case ee:
        return e = bt(13, o, n, u), e.elementType = ee, e.lanes = d, e;
      case C:
        return e = bt(19, o, n, u), e.elementType = C, e.lanes = d, e;
      case B:
        return Hs(o, u, d, n);
      default:
        if (typeof e == "object" && e !== null) switch (e.$$typeof) {
          case $:
            w = 10;
            break e;
          case W:
            w = 9;
            break e;
          case J:
            w = 11;
            break e;
          case O:
            w = 14;
            break e;
          case H:
            w = 16, s = null;
            break e;
        }
        throw Error(i(130, e == null ? e : typeof e, ""));
    }
    return n = bt(w, o, n, u), n.elementType = e, n.type = s, n.lanes = d, n;
  }
  function pr(e, n, o, s) {
    return e = bt(7, e, s, n), e.lanes = o, e;
  }
  function Hs(e, n, o, s) {
    return e = bt(22, e, s, n), e.elementType = B, e.lanes = o, e.stateNode = { isHidden: !1 }, e;
  }
  function xu(e, n, o) {
    return e = bt(6, e, null, n), e.lanes = o, e;
  }
  function _u(e, n, o) {
    return n = bt(4, e.children !== null ? e.children : [], e.key, n), n.lanes = o, n.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, n;
  }
  function ly(e, n, o, s, u) {
    this.tag = n, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = er(0), this.expirationTimes = er(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = er(0), this.identifierPrefix = s, this.onRecoverableError = u, this.mutableSourceEagerHydrationData = null;
  }
  function Su(e, n, o, s, u, d, w, z, I) {
    return e = new ly(e, n, o, z, I), n === 1 ? (n = 1, d === !0 && (n |= 8)) : n = 0, d = bt(3, null, null, n), e.current = d, d.stateNode = e, d.memoizedState = { element: s, isDehydrated: o, cache: null, transitions: null, pendingSuspenseBoundaries: null }, La(d), e;
  }
  function ay(e, n, o) {
    var s = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: b, key: s == null ? null : "" + s, children: e, containerInfo: n, implementation: o };
  }
  function Gd(e) {
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
      if (ft(o)) return Cf(e, o, n);
    }
    return n;
  }
  function qd(e, n, o, s, u, d, w, z, I) {
    return e = Su(o, s, !0, e, u, d, w, z, I), e.context = Gd(null), o = e.current, s = lt(), u = An(o), d = dn(s, u), d.callback = n ?? null, Dn(o, d, u), e.current.lanes = u, tr(e, u, s), ht(e, s), e;
  }
  function js(e, n, o, s) {
    var u = n.current, d = lt(), w = An(u);
    return o = Gd(o), n.context === null ? n.context = o : n.pendingContext = o, n = dn(d, w), n.payload = { element: e }, s = s === void 0 ? null : s, s !== null && (n.callback = s), e = Dn(u, n, w), e !== null && (Ht(e, u, w, d), ys(e, u, w)), w;
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
  function Jd(e, n) {
    if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
      var o = e.retryLane;
      e.retryLane = o !== 0 && o < n ? o : n;
    }
  }
  function ku(e, n) {
    Jd(e, n), (e = e.alternate) && Jd(e, n);
  }
  function uy() {
    return null;
  }
  var ep = typeof reportError == "function" ? reportError : function(e) {
    console.error(e);
  };
  function Eu(e) {
    this._internalRoot = e;
  }
  Vs.prototype.render = Eu.prototype.render = function(e) {
    var n = this._internalRoot;
    if (n === null) throw Error(i(409));
    js(e, n, null, null);
  }, Vs.prototype.unmount = Eu.prototype.unmount = function() {
    var e = this._internalRoot;
    if (e !== null) {
      this._internalRoot = null;
      var n = e.containerInfo;
      cr(function() {
        js(null, e, null, null);
      }), n[ln] = null;
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
  function tp() {
  }
  function cy(e, n, o, s, u) {
    if (u) {
      if (typeof s == "function") {
        var d = s;
        s = function() {
          var G = Fs(w);
          d.call(G);
        };
      }
      var w = qd(n, s, e, 0, null, !1, !1, "", tp);
      return e._reactRootContainer = w, e[ln] = w.current, Vo(e.nodeType === 8 ? e.parentNode : e), cr(), w;
    }
    for (; u = e.lastChild; ) e.removeChild(u);
    if (typeof s == "function") {
      var z = s;
      s = function() {
        var G = Fs(I);
        z.call(G);
      };
    }
    var I = Su(e, 0, !1, null, null, !1, !1, "", tp);
    return e._reactRootContainer = I, e[ln] = I.current, Vo(e.nodeType === 8 ? e.parentNode : e), cr(function() {
      js(n, I, o, s);
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
      js(n, w, e, u);
    } else w = cy(o, n, e, u, s);
    return Fs(w);
  }
  Dc = function(e) {
    switch (e.tag) {
      case 3:
        var n = e.stateNode;
        if (n.current.memoizedState.isDehydrated) {
          var o = qn(n.pendingLanes);
          o !== 0 && (Rr(n, o | 1), ht(n, $e()), (Pe & 6) === 0 && (Jr = $e() + 500, Rn()));
        }
        break;
      case 13:
        cr(function() {
          var s = fn(e, 1);
          if (s !== null) {
            var u = lt();
            Ht(s, e, 1, u);
          }
        }), ku(e, 1);
    }
  }, Kl = function(e) {
    if (e.tag === 13) {
      var n = fn(e, 134217728);
      if (n !== null) {
        var o = lt();
        Ht(n, e, 134217728, o);
      }
      ku(e, 134217728);
    }
  }, Lc = function(e) {
    if (e.tag === 13) {
      var n = An(e), o = fn(e, n);
      if (o !== null) {
        var s = lt();
        Ht(o, e, n, s);
      }
      ku(e, n);
    }
  }, Oc = function() {
    return Te;
  }, $c = function(e, n) {
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
  var fy = { usingClientEntryPoint: !1, Events: [Wo, jr, ls, Ri, bi, mu] }, ii = { findFiberByHostInstance: nr, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, dy = { bundleType: ii.bundleType, version: ii.version, rendererPackageName: ii.rendererPackageName, rendererConfig: ii.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: P.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
    return e = $i(e), e === null ? null : e.stateNode;
  }, findFiberByHostInstance: ii.findFiberByHostInstance || uy, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Ws = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Ws.isDisabled && Ws.supportsFiber) try {
      Pr = Ws.inject(dy), yt = Ws;
    } catch {
    }
  }
  return gt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = fy, gt.createPortal = function(e, n) {
    var o = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!Cu(n)) throw Error(i(200));
    return ay(e, n, null, o);
  }, gt.createRoot = function(e, n) {
    if (!Cu(e)) throw Error(i(299));
    var o = !1, s = "", u = ep;
    return n != null && (n.unstable_strictMode === !0 && (o = !0), n.identifierPrefix !== void 0 && (s = n.identifierPrefix), n.onRecoverableError !== void 0 && (u = n.onRecoverableError)), n = Su(e, 1, !1, null, null, o, !1, s, u), e[ln] = n.current, Vo(e.nodeType === 8 ? e.parentNode : e), new Eu(n);
  }, gt.findDOMNode = function(e) {
    if (e == null) return null;
    if (e.nodeType === 1) return e;
    var n = e._reactInternals;
    if (n === void 0)
      throw typeof e.render == "function" ? Error(i(188)) : (e = Object.keys(e).join(","), Error(i(268, e)));
    return e = $i(n), e = e === null ? null : e.stateNode, e;
  }, gt.flushSync = function(e) {
    return cr(e);
  }, gt.hydrate = function(e, n, o) {
    if (!Bs(n)) throw Error(i(200));
    return Us(null, e, n, !0, o);
  }, gt.hydrateRoot = function(e, n, o) {
    if (!Cu(e)) throw Error(i(405));
    var s = o != null && o.hydratedSources || null, u = !1, d = "", w = ep;
    if (o != null && (o.unstable_strictMode === !0 && (u = !0), o.identifierPrefix !== void 0 && (d = o.identifierPrefix), o.onRecoverableError !== void 0 && (w = o.onRecoverableError)), n = qd(n, null, e, 1, o ?? null, u, !1, d, w), e[ln] = n.current, Vo(e), s) for (e = 0; e < s.length; e++) o = s[e], u = o._getVersion, u = u(o._source), n.mutableSourceEagerHydrationData == null ? n.mutableSourceEagerHydrationData = [o, u] : n.mutableSourceEagerHydrationData.push(
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
        e._reactRootContainer = null, e[ln] = null;
      });
    }), !0) : !1;
  }, gt.unstable_batchedUpdates = mu, gt.unstable_renderSubtreeIntoContainer = function(e, n, o, s) {
    if (!Bs(o)) throw Error(i(200));
    if (e == null || e._reactInternals === void 0) throw Error(i(38));
    return Us(e, n, o, !1, s);
  }, gt.version = "18.3.1-next-f1338f8080-20240426", gt;
}
var up;
function Ih() {
  if (up) return zu.exports;
  up = 1;
  function t() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(t);
      } catch (r) {
        console.error(r);
      }
  }
  return t(), zu.exports = wy(), zu.exports;
}
var cp;
function xy() {
  if (cp) return Xs;
  cp = 1;
  var t = Ih();
  return Xs.createRoot = t.createRoot, Xs.hydrateRoot = t.hydrateRoot, Xs;
}
var Th = xy();
const _y = ".react-flow{direction:ltr;--xy-edge-stroke-default: #b1b1b7;--xy-edge-stroke-width-default: 1;--xy-edge-stroke-selected-default: #555;--xy-connectionline-stroke-default: #b1b1b7;--xy-connectionline-stroke-width-default: 1;--xy-attribution-background-color-default: rgba(255, 255, 255, .5);--xy-minimap-background-color-default: #fff;--xy-minimap-mask-background-color-default: rgba(240, 240, 240, .6);--xy-minimap-mask-stroke-color-default: transparent;--xy-minimap-mask-stroke-width-default: 1;--xy-minimap-node-background-color-default: #e2e2e2;--xy-minimap-node-stroke-color-default: transparent;--xy-minimap-node-stroke-width-default: 2;--xy-background-color-default: transparent;--xy-background-pattern-dots-color-default: #91919a;--xy-background-pattern-lines-color-default: #eee;--xy-background-pattern-cross-color-default: #e2e2e2;background-color:var(--xy-background-color, var(--xy-background-color-default));--xy-node-color-default: inherit;--xy-node-border-default: 1px solid #1a192b;--xy-node-background-color-default: #fff;--xy-node-group-background-color-default: rgba(240, 240, 240, .25);--xy-node-boxshadow-hover-default: 0 1px 4px 1px rgba(0, 0, 0, .08);--xy-node-boxshadow-selected-default: 0 0 0 .5px #1a192b;--xy-node-border-radius-default: 3px;--xy-handle-background-color-default: #1a192b;--xy-handle-border-color-default: #fff;--xy-selection-background-color-default: rgba(0, 89, 220, .08);--xy-selection-border-default: 1px dotted rgba(0, 89, 220, .8);--xy-controls-button-background-color-default: #fefefe;--xy-controls-button-background-color-hover-default: #f4f4f4;--xy-controls-button-color-default: inherit;--xy-controls-button-color-hover-default: inherit;--xy-controls-button-border-color-default: #eee;--xy-controls-box-shadow-default: 0 0 2px 1px rgba(0, 0, 0, .08);--xy-edge-label-background-color-default: #ffffff;--xy-edge-label-color-default: inherit;--xy-resize-background-color-default: #3367d9}.react-flow.dark{--xy-edge-stroke-default: #3e3e3e;--xy-edge-stroke-width-default: 1;--xy-edge-stroke-selected-default: #727272;--xy-connectionline-stroke-default: #b1b1b7;--xy-connectionline-stroke-width-default: 1;--xy-attribution-background-color-default: rgba(150, 150, 150, .25);--xy-minimap-background-color-default: #141414;--xy-minimap-mask-background-color-default: rgba(60, 60, 60, .6);--xy-minimap-mask-stroke-color-default: transparent;--xy-minimap-mask-stroke-width-default: 1;--xy-minimap-node-background-color-default: #2b2b2b;--xy-minimap-node-stroke-color-default: transparent;--xy-minimap-node-stroke-width-default: 2;--xy-background-color-default: #141414;--xy-background-pattern-dots-color-default: #555;--xy-background-pattern-lines-color-default: #333;--xy-background-pattern-cross-color-default: #333;--xy-node-color-default: #f8f8f8;--xy-node-border-default: 1px solid #3c3c3c;--xy-node-background-color-default: #1e1e1e;--xy-node-group-background-color-default: rgba(240, 240, 240, .25);--xy-node-boxshadow-hover-default: 0 1px 4px 1px rgba(255, 255, 255, .08);--xy-node-boxshadow-selected-default: 0 0 0 .5px #999;--xy-handle-background-color-default: #bebebe;--xy-handle-border-color-default: #1e1e1e;--xy-selection-background-color-default: rgba(200, 200, 220, .08);--xy-selection-border-default: 1px dotted rgba(200, 200, 220, .8);--xy-controls-button-background-color-default: #2b2b2b;--xy-controls-button-background-color-hover-default: #3e3e3e;--xy-controls-button-color-default: #f8f8f8;--xy-controls-button-color-hover-default: #fff;--xy-controls-button-border-color-default: #5b5b5b;--xy-controls-box-shadow-default: 0 0 2px 1px rgba(0, 0, 0, .08);--xy-edge-label-background-color-default: #141414;--xy-edge-label-color-default: #f8f8f8}.react-flow__background{background-color:var(--xy-background-color-props, var(--xy-background-color, var(--xy-background-color-default)));pointer-events:none;z-index:-1}.react-flow__container{position:absolute;width:100%;height:100%;top:0;left:0}.react-flow__pane{z-index:1;touch-action:none}.react-flow__pane.draggable{cursor:grab}.react-flow__pane.dragging{cursor:grabbing}.react-flow__pane.selection{cursor:pointer}.react-flow__viewport{transform-origin:0 0;z-index:2;pointer-events:none}.react-flow__renderer{z-index:4}.react-flow__selection{z-index:6}.react-flow__nodesselection-rect:focus,.react-flow__nodesselection-rect:focus-visible{outline:none}.react-flow__edge-path{stroke:var(--xy-edge-stroke, var(--xy-edge-stroke-default));stroke-width:var(--xy-edge-stroke-width, var(--xy-edge-stroke-width-default));fill:none}.react-flow__connection-path{stroke:var(--xy-connectionline-stroke, var(--xy-connectionline-stroke-default));stroke-width:var(--xy-connectionline-stroke-width, var(--xy-connectionline-stroke-width-default));fill:none}.react-flow .react-flow__edges{position:absolute}.react-flow .react-flow__edges svg{overflow:visible;position:absolute;pointer-events:none}.react-flow__edge{pointer-events:visibleStroke}.react-flow__edge.selectable{cursor:pointer}.react-flow__edge.animated path{stroke-dasharray:5;animation:dashdraw .5s linear infinite}.react-flow__edge.animated path.react-flow__edge-interaction{stroke-dasharray:none;animation:none}.react-flow__edge.inactive{pointer-events:none}.react-flow__edge.selected,.react-flow__edge:focus,.react-flow__edge:focus-visible{outline:none}.react-flow__edge.selected .react-flow__edge-path,.react-flow__edge.selectable:focus .react-flow__edge-path,.react-flow__edge.selectable:focus-visible .react-flow__edge-path{stroke:var(--xy-edge-stroke-selected, var(--xy-edge-stroke-selected-default))}.react-flow__edge-textwrapper{pointer-events:all}.react-flow__edge .react-flow__edge-text{pointer-events:none;-webkit-user-select:none;-moz-user-select:none;user-select:none}.react-flow__arrowhead polyline{stroke:var(--xy-edge-stroke, var(--xy-edge-stroke-default))}.react-flow__arrowhead polyline.arrowclosed{fill:var(--xy-edge-stroke, var(--xy-edge-stroke-default))}.react-flow__connection{pointer-events:none}.react-flow__connection .animated{stroke-dasharray:5;animation:dashdraw .5s linear infinite}svg.react-flow__connectionline{z-index:1001;overflow:visible;position:absolute}.react-flow__nodes{pointer-events:none;transform-origin:0 0}.react-flow__node{position:absolute;-webkit-user-select:none;-moz-user-select:none;user-select:none;pointer-events:all;transform-origin:0 0;box-sizing:border-box;cursor:default}.react-flow__node.selectable{cursor:pointer}.react-flow__node.draggable{cursor:grab;pointer-events:all}.react-flow__node.draggable.dragging{cursor:grabbing}.react-flow__nodesselection{z-index:3;transform-origin:left top;pointer-events:none}.react-flow__nodesselection-rect{position:absolute;pointer-events:all;cursor:grab}.react-flow__handle{position:absolute;pointer-events:none;min-width:5px;min-height:5px;width:6px;height:6px;background-color:var(--xy-handle-background-color, var(--xy-handle-background-color-default));border:1px solid var(--xy-handle-border-color, var(--xy-handle-border-color-default));border-radius:100%}.react-flow__handle.connectingfrom{pointer-events:all}.react-flow__handle.connectionindicator{pointer-events:all;cursor:crosshair}.react-flow__handle-bottom{top:auto;left:50%;bottom:0;transform:translate(-50%,50%)}.react-flow__handle-top{top:0;left:50%;transform:translate(-50%,-50%)}.react-flow__handle-left{top:50%;left:0;transform:translate(-50%,-50%)}.react-flow__handle-right{top:50%;right:0;transform:translate(50%,-50%)}.react-flow__edgeupdater{cursor:move;pointer-events:all}.react-flow__pane.selection .react-flow__panel{pointer-events:none}.react-flow__panel{position:absolute;z-index:5;margin:15px}.react-flow__panel.top{top:0}.react-flow__panel.bottom{bottom:0}.react-flow__panel.top.center,.react-flow__panel.bottom.center{left:50%;transform:translate(-15px) translate(-50%)}.react-flow__panel.left{left:0}.react-flow__panel.right{right:0}.react-flow__panel.left.center,.react-flow__panel.right.center{top:50%;transform:translateY(-15px) translateY(-50%)}.react-flow__attribution{font-size:10px;background:var(--xy-attribution-background-color, var(--xy-attribution-background-color-default));padding:2px 3px;margin:0}.react-flow__attribution a{text-decoration:none;color:#999}@keyframes dashdraw{0%{stroke-dashoffset:10}}.react-flow__edgelabel-renderer{position:absolute;width:100%;height:100%;pointer-events:none;-webkit-user-select:none;-moz-user-select:none;user-select:none;left:0;top:0}.react-flow__viewport-portal{position:absolute;width:100%;height:100%;left:0;top:0;-webkit-user-select:none;-moz-user-select:none;user-select:none}.react-flow__minimap{background:var( --xy-minimap-background-color-props, var(--xy-minimap-background-color, var(--xy-minimap-background-color-default)) )}.react-flow__minimap-svg{display:block}.react-flow__minimap-mask{fill:var( --xy-minimap-mask-background-color-props, var(--xy-minimap-mask-background-color, var(--xy-minimap-mask-background-color-default)) );stroke:var( --xy-minimap-mask-stroke-color-props, var(--xy-minimap-mask-stroke-color, var(--xy-minimap-mask-stroke-color-default)) );stroke-width:var( --xy-minimap-mask-stroke-width-props, var(--xy-minimap-mask-stroke-width, var(--xy-minimap-mask-stroke-width-default)) )}.react-flow__minimap-node{fill:var( --xy-minimap-node-background-color-props, var(--xy-minimap-node-background-color, var(--xy-minimap-node-background-color-default)) );stroke:var( --xy-minimap-node-stroke-color-props, var(--xy-minimap-node-stroke-color, var(--xy-minimap-node-stroke-color-default)) );stroke-width:var( --xy-minimap-node-stroke-width-props, var(--xy-minimap-node-stroke-width, var(--xy-minimap-node-stroke-width-default)) )}.react-flow__background-pattern.dots{fill:var( --xy-background-pattern-color-props, var(--xy-background-pattern-color, var(--xy-background-pattern-dots-color-default)) )}.react-flow__background-pattern.lines{stroke:var( --xy-background-pattern-color-props, var(--xy-background-pattern-color, var(--xy-background-pattern-lines-color-default)) )}.react-flow__background-pattern.cross{stroke:var( --xy-background-pattern-color-props, var(--xy-background-pattern-color, var(--xy-background-pattern-cross-color-default)) )}.react-flow__controls{display:flex;flex-direction:column;box-shadow:var(--xy-controls-box-shadow, var(--xy-controls-box-shadow-default))}.react-flow__controls.horizontal{flex-direction:row}.react-flow__controls-button{display:flex;justify-content:center;align-items:center;height:26px;width:26px;padding:4px;border:none;background:var(--xy-controls-button-background-color, var(--xy-controls-button-background-color-default));border-bottom:1px solid var( --xy-controls-button-border-color-props, var(--xy-controls-button-border-color, var(--xy-controls-button-border-color-default)) );color:var( --xy-controls-button-color-props, var(--xy-controls-button-color, var(--xy-controls-button-color-default)) );cursor:pointer;-webkit-user-select:none;-moz-user-select:none;user-select:none}.react-flow__controls-button svg{width:100%;max-width:12px;max-height:12px;fill:currentColor}.react-flow__edge.updating .react-flow__edge-path{stroke:#777}.react-flow__edge-text{font-size:10px}.react-flow__node.selectable:focus,.react-flow__node.selectable:focus-visible{outline:none}.react-flow__node-input,.react-flow__node-default,.react-flow__node-output,.react-flow__node-group{padding:10px;border-radius:var(--xy-node-border-radius, var(--xy-node-border-radius-default));width:150px;font-size:12px;color:var(--xy-node-color, var(--xy-node-color-default));text-align:center;border:var(--xy-node-border, var(--xy-node-border-default));background-color:var(--xy-node-background-color, var(--xy-node-background-color-default))}.react-flow__node-input.selectable:hover,.react-flow__node-default.selectable:hover,.react-flow__node-output.selectable:hover,.react-flow__node-group.selectable:hover{box-shadow:var(--xy-node-boxshadow-hover, var(--xy-node-boxshadow-hover-default))}.react-flow__node-input.selectable.selected,.react-flow__node-input.selectable:focus,.react-flow__node-input.selectable:focus-visible,.react-flow__node-default.selectable.selected,.react-flow__node-default.selectable:focus,.react-flow__node-default.selectable:focus-visible,.react-flow__node-output.selectable.selected,.react-flow__node-output.selectable:focus,.react-flow__node-output.selectable:focus-visible,.react-flow__node-group.selectable.selected,.react-flow__node-group.selectable:focus,.react-flow__node-group.selectable:focus-visible{box-shadow:var(--xy-node-boxshadow-selected, var(--xy-node-boxshadow-selected-default))}.react-flow__node-group{background-color:var(--xy-node-group-background-color, var(--xy-node-group-background-color-default))}.react-flow__nodesselection-rect,.react-flow__selection{background:var(--xy-selection-background-color, var(--xy-selection-background-color-default));border:var(--xy-selection-border, var(--xy-selection-border-default))}.react-flow__nodesselection-rect:focus,.react-flow__nodesselection-rect:focus-visible,.react-flow__selection:focus,.react-flow__selection:focus-visible{outline:none}.react-flow__controls-button:hover{background:var( --xy-controls-button-background-color-hover-props, var(--xy-controls-button-background-color-hover, var(--xy-controls-button-background-color-hover-default)) );color:var( --xy-controls-button-color-hover-props, var(--xy-controls-button-color-hover, var(--xy-controls-button-color-hover-default)) )}.react-flow__controls-button:disabled{pointer-events:none}.react-flow__controls-button:disabled svg{fill-opacity:.4}.react-flow__controls-button:last-child{border-bottom:none}.react-flow__controls.horizontal .react-flow__controls-button{border-bottom:none;border-right:1px solid var( --xy-controls-button-border-color-props, var(--xy-controls-button-border-color, var(--xy-controls-button-border-color-default)) )}.react-flow__controls.horizontal .react-flow__controls-button:last-child{border-right:none}.react-flow__resize-control{position:absolute}.react-flow__resize-control.left,.react-flow__resize-control.right{cursor:ew-resize}.react-flow__resize-control.top,.react-flow__resize-control.bottom{cursor:ns-resize}.react-flow__resize-control.top.left,.react-flow__resize-control.bottom.right{cursor:nwse-resize}.react-flow__resize-control.bottom.left,.react-flow__resize-control.top.right{cursor:nesw-resize}.react-flow__resize-control.handle{width:5px;height:5px;border:1px solid #fff;border-radius:1px;background-color:var(--xy-resize-background-color, var(--xy-resize-background-color-default));translate:-50% -50%}.react-flow__resize-control.handle.left{left:0;top:50%}.react-flow__resize-control.handle.right{left:100%;top:50%}.react-flow__resize-control.handle.top{left:50%;top:0}.react-flow__resize-control.handle.bottom{left:50%;top:100%}.react-flow__resize-control.handle.top.left,.react-flow__resize-control.handle.bottom.left{left:0}.react-flow__resize-control.handle.top.right,.react-flow__resize-control.handle.bottom.right{left:100%}.react-flow__resize-control.line{border-color:var(--xy-resize-background-color, var(--xy-resize-background-color-default));border-width:0;border-style:solid}.react-flow__resize-control.line.left,.react-flow__resize-control.line.right{width:1px;transform:translate(-50%);top:0;height:100%}.react-flow__resize-control.line.left{left:0;border-left-width:1px}.react-flow__resize-control.line.right{left:100%;border-right-width:1px}.react-flow__resize-control.line.top,.react-flow__resize-control.line.bottom{height:1px;transform:translateY(-50%);left:0;width:100%}.react-flow__resize-control.line.top{top:0;border-top-width:1px}.react-flow__resize-control.line.bottom{border-bottom-width:1px;top:100%}.react-flow__edge-textbg{fill:var(--xy-edge-label-background-color, var(--xy-edge-label-background-color-default))}.react-flow__edge-text{fill:var(--xy-edge-label-color, var(--xy-edge-label-color-default))}";
var Y = Si();
const Sy = /* @__PURE__ */ Ph(Y);
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
var ky = { value: () => {
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
function Ey(t, r) {
  return t.trim().split(/^|\s+/).map(function(i) {
    var l = "", a = i.indexOf(".");
    if (a >= 0 && (l = i.slice(a + 1), i = i.slice(0, a)), i && !r.hasOwnProperty(i)) throw new Error("unknown type: " + i);
    return { type: i, name: l };
  });
}
nl.prototype = wl.prototype = {
  constructor: nl,
  on: function(t, r) {
    var i = this._, l = Ey(t + "", i), a, c = -1, f = l.length;
    if (arguments.length < 2) {
      for (; ++c < f; ) if ((a = (t = l[c]).type) && (a = Cy(i[a], t.name))) return a;
      return;
    }
    if (r != null && typeof r != "function") throw new Error("invalid callback: " + r);
    for (; ++c < f; )
      if (a = (t = l[c]).type) i[a] = fp(i[a], t.name, r);
      else if (r == null) for (a in i) i[a] = fp(i[a], t.name, null);
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
function Cy(t, r) {
  for (var i = 0, l = t.length, a; i < l; ++i)
    if ((a = t[i]).name === r)
      return a.value;
}
function fp(t, r, i) {
  for (var l = 0, a = t.length; l < a; ++l)
    if (t[l].name === r) {
      t[l] = ky, t = t.slice(0, l).concat(t.slice(l + 1));
      break;
    }
  return i != null && t.push({ name: r, value: i }), t;
}
var Zu = "http://www.w3.org/1999/xhtml", dp = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: Zu,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function xl(t) {
  var r = t += "", i = r.indexOf(":");
  return i >= 0 && (r = t.slice(0, i)) !== "xmlns" && (t = t.slice(i + 1)), dp.hasOwnProperty(r) ? { space: dp[r], local: t } : t;
}
function Ny(t) {
  return function() {
    var r = this.ownerDocument, i = this.namespaceURI;
    return i === Zu && r.documentElement.namespaceURI === Zu ? r.createElement(t) : r.createElementNS(i, t);
  };
}
function My(t) {
  return function() {
    return this.ownerDocument.createElementNS(t.space, t.local);
  };
}
function Rh(t) {
  var r = xl(t);
  return (r.local ? My : Ny)(r);
}
function zy() {
}
function uc(t) {
  return t == null ? zy : function() {
    return this.querySelector(t);
  };
}
function Py(t) {
  typeof t != "function" && (t = uc(t));
  for (var r = this._groups, i = r.length, l = new Array(i), a = 0; a < i; ++a)
    for (var c = r[a], f = c.length, p = l[a] = new Array(f), h, g, m = 0; m < f; ++m)
      (h = c[m]) && (g = t.call(h, h.__data__, m, c)) && ("__data__" in h && (g.__data__ = h.__data__), p[m] = g);
  return new Et(l, this._parents);
}
function Iy(t) {
  return t == null ? [] : Array.isArray(t) ? t : Array.from(t);
}
function Ty() {
  return [];
}
function bh(t) {
  return t == null ? Ty : function() {
    return this.querySelectorAll(t);
  };
}
function Ry(t) {
  return function() {
    return Iy(t.apply(this, arguments));
  };
}
function by(t) {
  typeof t == "function" ? t = Ry(t) : t = bh(t);
  for (var r = this._groups, i = r.length, l = [], a = [], c = 0; c < i; ++c)
    for (var f = r[c], p = f.length, h, g = 0; g < p; ++g)
      (h = f[g]) && (l.push(t.call(h, h.__data__, g, f)), a.push(h));
  return new Et(l, a);
}
function Dh(t) {
  return function() {
    return this.matches(t);
  };
}
function Lh(t) {
  return function(r) {
    return r.matches(t);
  };
}
var Dy = Array.prototype.find;
function Ly(t) {
  return function() {
    return Dy.call(this.children, t);
  };
}
function Oy() {
  return this.firstElementChild;
}
function $y(t) {
  return this.select(t == null ? Oy : Ly(typeof t == "function" ? t : Lh(t)));
}
var Ay = Array.prototype.filter;
function Hy() {
  return Array.from(this.children);
}
function jy(t) {
  return function() {
    return Ay.call(this.children, t);
  };
}
function Fy(t) {
  return this.selectAll(t == null ? Hy : jy(typeof t == "function" ? t : Lh(t)));
}
function Vy(t) {
  typeof t != "function" && (t = Dh(t));
  for (var r = this._groups, i = r.length, l = new Array(i), a = 0; a < i; ++a)
    for (var c = r[a], f = c.length, p = l[a] = [], h, g = 0; g < f; ++g)
      (h = c[g]) && t.call(h, h.__data__, g, c) && p.push(h);
  return new Et(l, this._parents);
}
function Oh(t) {
  return new Array(t.length);
}
function By() {
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
function Uy(t) {
  return function() {
    return t;
  };
}
function Wy(t, r, i, l, a, c) {
  for (var f = 0, p, h = r.length, g = c.length; f < g; ++f)
    (p = r[f]) ? (p.__data__ = c[f], l[f] = p) : i[f] = new ll(t, c[f]);
  for (; f < h; ++f)
    (p = r[f]) && (a[f] = p);
}
function Xy(t, r, i, l, a, c, f) {
  var p, h, g = /* @__PURE__ */ new Map(), m = r.length, v = c.length, y = new Array(m), x;
  for (p = 0; p < m; ++p)
    (h = r[p]) && (y[p] = x = f.call(h, h.__data__, p, r) + "", g.has(x) ? a[p] = h : g.set(x, h));
  for (p = 0; p < v; ++p)
    x = f.call(t, c[p], p, c) + "", (h = g.get(x)) ? (l[p] = h, h.__data__ = c[p], g.delete(x)) : i[p] = new ll(t, c[p]);
  for (p = 0; p < m; ++p)
    (h = r[p]) && g.get(y[p]) === h && (a[p] = h);
}
function Yy(t) {
  return t.__data__;
}
function Zy(t, r) {
  if (!arguments.length) return Array.from(this, Yy);
  var i = r ? Xy : Wy, l = this._parents, a = this._groups;
  typeof t != "function" && (t = Uy(t));
  for (var c = a.length, f = new Array(c), p = new Array(c), h = new Array(c), g = 0; g < c; ++g) {
    var m = l[g], v = a[g], y = v.length, x = Qy(t.call(m, m && m.__data__, g, l)), _ = x.length, M = p[g] = new Array(_), N = f[g] = new Array(_), E = h[g] = new Array(y);
    i(m, v, M, N, E, x, r);
    for (var D = 0, S = 0, P, V; D < _; ++D)
      if (P = M[D]) {
        for (D >= S && (S = D + 1); !(V = N[S]) && ++S < _; ) ;
        P._next = V || null;
      }
  }
  return f = new Et(f, l), f._enter = p, f._exit = h, f;
}
function Qy(t) {
  return typeof t == "object" && "length" in t ? t : Array.from(t);
}
function Ky() {
  return new Et(this._exit || this._groups.map(Oh), this._parents);
}
function Gy(t, r, i) {
  var l = this.enter(), a = this, c = this.exit();
  return typeof t == "function" ? (l = t(l), l && (l = l.selection())) : l = l.append(t + ""), r != null && (a = r(a), a && (a = a.selection())), i == null ? c.remove() : i(c), l && a ? l.merge(a).order() : a;
}
function qy(t) {
  for (var r = t.selection ? t.selection() : t, i = this._groups, l = r._groups, a = i.length, c = l.length, f = Math.min(a, c), p = new Array(a), h = 0; h < f; ++h)
    for (var g = i[h], m = l[h], v = g.length, y = p[h] = new Array(v), x, _ = 0; _ < v; ++_)
      (x = g[_] || m[_]) && (y[_] = x);
  for (; h < a; ++h)
    p[h] = i[h];
  return new Et(p, this._parents);
}
function Jy() {
  for (var t = this._groups, r = -1, i = t.length; ++r < i; )
    for (var l = t[r], a = l.length - 1, c = l[a], f; --a >= 0; )
      (f = l[a]) && (c && f.compareDocumentPosition(c) ^ 4 && c.parentNode.insertBefore(f, c), c = f);
  return this;
}
function ev(t) {
  t || (t = tv);
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
function tv(t, r) {
  return t < r ? -1 : t > r ? 1 : t >= r ? 0 : NaN;
}
function nv() {
  var t = arguments[0];
  return arguments[0] = this, t.apply(null, arguments), this;
}
function rv() {
  return Array.from(this);
}
function ov() {
  for (var t = this._groups, r = 0, i = t.length; r < i; ++r)
    for (var l = t[r], a = 0, c = l.length; a < c; ++a) {
      var f = l[a];
      if (f) return f;
    }
  return null;
}
function iv() {
  let t = 0;
  for (const r of this) ++t;
  return t;
}
function sv() {
  return !this.node();
}
function lv(t) {
  for (var r = this._groups, i = 0, l = r.length; i < l; ++i)
    for (var a = r[i], c = 0, f = a.length, p; c < f; ++c)
      (p = a[c]) && t.call(p, p.__data__, c, a);
  return this;
}
function av(t) {
  return function() {
    this.removeAttribute(t);
  };
}
function uv(t) {
  return function() {
    this.removeAttributeNS(t.space, t.local);
  };
}
function cv(t, r) {
  return function() {
    this.setAttribute(t, r);
  };
}
function fv(t, r) {
  return function() {
    this.setAttributeNS(t.space, t.local, r);
  };
}
function dv(t, r) {
  return function() {
    var i = r.apply(this, arguments);
    i == null ? this.removeAttribute(t) : this.setAttribute(t, i);
  };
}
function pv(t, r) {
  return function() {
    var i = r.apply(this, arguments);
    i == null ? this.removeAttributeNS(t.space, t.local) : this.setAttributeNS(t.space, t.local, i);
  };
}
function hv(t, r) {
  var i = xl(t);
  if (arguments.length < 2) {
    var l = this.node();
    return i.local ? l.getAttributeNS(i.space, i.local) : l.getAttribute(i);
  }
  return this.each((r == null ? i.local ? uv : av : typeof r == "function" ? i.local ? pv : dv : i.local ? fv : cv)(i, r));
}
function $h(t) {
  return t.ownerDocument && t.ownerDocument.defaultView || t.document && t || t.defaultView;
}
function gv(t) {
  return function() {
    this.style.removeProperty(t);
  };
}
function mv(t, r, i) {
  return function() {
    this.style.setProperty(t, r, i);
  };
}
function yv(t, r, i) {
  return function() {
    var l = r.apply(this, arguments);
    l == null ? this.style.removeProperty(t) : this.style.setProperty(t, l, i);
  };
}
function vv(t, r, i) {
  return arguments.length > 1 ? this.each((r == null ? gv : typeof r == "function" ? yv : mv)(t, r, i ?? "")) : lo(this.node(), t);
}
function lo(t, r) {
  return t.style.getPropertyValue(r) || $h(t).getComputedStyle(t, null).getPropertyValue(r);
}
function wv(t) {
  return function() {
    delete this[t];
  };
}
function xv(t, r) {
  return function() {
    this[t] = r;
  };
}
function _v(t, r) {
  return function() {
    var i = r.apply(this, arguments);
    i == null ? delete this[t] : this[t] = i;
  };
}
function Sv(t, r) {
  return arguments.length > 1 ? this.each((r == null ? wv : typeof r == "function" ? _v : xv)(t, r)) : this.node()[t];
}
function Ah(t) {
  return t.trim().split(/^|\s+/);
}
function cc(t) {
  return t.classList || new Hh(t);
}
function Hh(t) {
  this._node = t, this._names = Ah(t.getAttribute("class") || "");
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
function jh(t, r) {
  for (var i = cc(t), l = -1, a = r.length; ++l < a; ) i.add(r[l]);
}
function Fh(t, r) {
  for (var i = cc(t), l = -1, a = r.length; ++l < a; ) i.remove(r[l]);
}
function kv(t) {
  return function() {
    jh(this, t);
  };
}
function Ev(t) {
  return function() {
    Fh(this, t);
  };
}
function Cv(t, r) {
  return function() {
    (r.apply(this, arguments) ? jh : Fh)(this, t);
  };
}
function Nv(t, r) {
  var i = Ah(t + "");
  if (arguments.length < 2) {
    for (var l = cc(this.node()), a = -1, c = i.length; ++a < c; ) if (!l.contains(i[a])) return !1;
    return !0;
  }
  return this.each((typeof r == "function" ? Cv : r ? kv : Ev)(i, r));
}
function Mv() {
  this.textContent = "";
}
function zv(t) {
  return function() {
    this.textContent = t;
  };
}
function Pv(t) {
  return function() {
    var r = t.apply(this, arguments);
    this.textContent = r ?? "";
  };
}
function Iv(t) {
  return arguments.length ? this.each(t == null ? Mv : (typeof t == "function" ? Pv : zv)(t)) : this.node().textContent;
}
function Tv() {
  this.innerHTML = "";
}
function Rv(t) {
  return function() {
    this.innerHTML = t;
  };
}
function bv(t) {
  return function() {
    var r = t.apply(this, arguments);
    this.innerHTML = r ?? "";
  };
}
function Dv(t) {
  return arguments.length ? this.each(t == null ? Tv : (typeof t == "function" ? bv : Rv)(t)) : this.node().innerHTML;
}
function Lv() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function Ov() {
  return this.each(Lv);
}
function $v() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function Av() {
  return this.each($v);
}
function Hv(t) {
  var r = typeof t == "function" ? t : Rh(t);
  return this.select(function() {
    return this.appendChild(r.apply(this, arguments));
  });
}
function jv() {
  return null;
}
function Fv(t, r) {
  var i = typeof t == "function" ? t : Rh(t), l = r == null ? jv : typeof r == "function" ? r : uc(r);
  return this.select(function() {
    return this.insertBefore(i.apply(this, arguments), l.apply(this, arguments) || null);
  });
}
function Vv() {
  var t = this.parentNode;
  t && t.removeChild(this);
}
function Bv() {
  return this.each(Vv);
}
function Uv() {
  var t = this.cloneNode(!1), r = this.parentNode;
  return r ? r.insertBefore(t, this.nextSibling) : t;
}
function Wv() {
  var t = this.cloneNode(!0), r = this.parentNode;
  return r ? r.insertBefore(t, this.nextSibling) : t;
}
function Xv(t) {
  return this.select(t ? Wv : Uv);
}
function Yv(t) {
  return arguments.length ? this.property("__data__", t) : this.node().__data__;
}
function Zv(t) {
  return function(r) {
    t.call(this, r, this.__data__);
  };
}
function Qv(t) {
  return t.trim().split(/^|\s+/).map(function(r) {
    var i = "", l = r.indexOf(".");
    return l >= 0 && (i = r.slice(l + 1), r = r.slice(0, l)), { type: r, name: i };
  });
}
function Kv(t) {
  return function() {
    var r = this.__on;
    if (r) {
      for (var i = 0, l = -1, a = r.length, c; i < a; ++i)
        c = r[i], (!t.type || c.type === t.type) && c.name === t.name ? this.removeEventListener(c.type, c.listener, c.options) : r[++l] = c;
      ++l ? r.length = l : delete this.__on;
    }
  };
}
function Gv(t, r, i) {
  return function() {
    var l = this.__on, a, c = Zv(r);
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
function qv(t, r, i) {
  var l = Qv(t + ""), a, c = l.length, f;
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
  for (p = r ? Gv : Kv, a = 0; a < c; ++a) this.each(p(l[a], r, i));
  return this;
}
function Vh(t, r, i) {
  var l = $h(t), a = l.CustomEvent;
  typeof a == "function" ? a = new a(r, i) : (a = l.document.createEvent("Event"), i ? (a.initEvent(r, i.bubbles, i.cancelable), a.detail = i.detail) : a.initEvent(r, !1, !1)), t.dispatchEvent(a);
}
function Jv(t, r) {
  return function() {
    return Vh(this, t, r);
  };
}
function ew(t, r) {
  return function() {
    return Vh(this, t, r.apply(this, arguments));
  };
}
function tw(t, r) {
  return this.each((typeof r == "function" ? ew : Jv)(t, r));
}
function* nw() {
  for (var t = this._groups, r = 0, i = t.length; r < i; ++r)
    for (var l = t[r], a = 0, c = l.length, f; a < c; ++a)
      (f = l[a]) && (yield f);
}
var Bh = [null];
function Et(t, r) {
  this._groups = t, this._parents = r;
}
function ki() {
  return new Et([[document.documentElement]], Bh);
}
function rw() {
  return this;
}
Et.prototype = ki.prototype = {
  constructor: Et,
  select: Py,
  selectAll: by,
  selectChild: $y,
  selectChildren: Fy,
  filter: Vy,
  data: Zy,
  enter: By,
  exit: Ky,
  join: Gy,
  merge: qy,
  selection: rw,
  order: Jy,
  sort: ev,
  call: nv,
  nodes: rv,
  node: ov,
  size: iv,
  empty: sv,
  each: lv,
  attr: hv,
  style: vv,
  property: Sv,
  classed: Nv,
  text: Iv,
  html: Dv,
  raise: Ov,
  lower: Av,
  append: Hv,
  insert: Fv,
  remove: Bv,
  clone: Xv,
  datum: Yv,
  on: qv,
  dispatch: tw,
  [Symbol.iterator]: nw
};
function kt(t) {
  return typeof t == "string" ? new Et([[document.querySelector(t)]], [document.documentElement]) : new Et([[t]], Bh);
}
var ow = 0;
function pp() {
  this._ = "@" + (++ow).toString(36);
}
pp.prototype = {
  constructor: pp,
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
function iw(t) {
  let r;
  for (; r = t.sourceEvent; ) t = r;
  return t;
}
function jt(t, r) {
  if (t = iw(t), r === void 0 && (r = t.currentTarget), r) {
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
const sw = { passive: !1 }, pi = { capture: !0, passive: !1 };
function Tu(t) {
  t.stopImmediatePropagation();
}
function ro(t) {
  t.preventDefault(), t.stopImmediatePropagation();
}
function Uh(t) {
  var r = t.document.documentElement, i = kt(t).on("dragstart.drag", ro, pi);
  "onselectstart" in r ? i.on("selectstart.drag", ro, pi) : (r.__noselect = r.style.MozUserSelect, r.style.MozUserSelect = "none");
}
function Wh(t, r) {
  var i = t.document.documentElement, l = kt(t).on("dragstart.drag", null);
  r && (l.on("click.drag", ro, pi), setTimeout(function() {
    l.on("click.drag", null);
  }, 0)), "onselectstart" in i ? l.on("selectstart.drag", null) : (i.style.MozUserSelect = i.__noselect, delete i.__noselect);
}
var Ys = (t) => () => t;
function Qu(t, {
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
Qu.prototype.on = function() {
  var t = this._.on.apply(this._, arguments);
  return t === this._ ? this : t;
};
function lw(t) {
  return !t.ctrlKey && !t.button;
}
function aw() {
  return this.parentNode;
}
function uw(t, r) {
  return r ?? { x: t.x, y: t.y };
}
function cw() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function Xh() {
  var t = lw, r = aw, i = uw, l = cw, a = {}, c = wl("start", "drag", "end"), f = 0, p, h, g, m, v = 0;
  function y(P) {
    P.on("mousedown.drag", x).filter(l).on("touchstart.drag", N).on("touchmove.drag", E, sw).on("touchend.drag touchcancel.drag", D).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function x(P, V) {
    if (!(m || !t.call(this, P, V))) {
      var b = S(this, r.call(this, P, V), P, V, "mouse");
      b && (kt(P.view).on("mousemove.drag", _, pi).on("mouseup.drag", M, pi), Uh(P.view), Tu(P), g = !1, p = P.clientX, h = P.clientY, b("start", P));
    }
  }
  function _(P) {
    if (ro(P), !g) {
      var V = P.clientX - p, b = P.clientY - h;
      g = V * V + b * b > v;
    }
    a.mouse("drag", P);
  }
  function M(P) {
    kt(P.view).on("mousemove.drag mouseup.drag", null), Wh(P.view, g), ro(P), a.mouse("end", P);
  }
  function N(P, V) {
    if (t.call(this, P, V)) {
      var b = P.changedTouches, F = r.call(this, P, V), Q = b.length, K, $;
      for (K = 0; K < Q; ++K)
        ($ = S(this, F, P, V, b[K].identifier, b[K])) && (Tu(P), $("start", P, b[K]));
    }
  }
  function E(P) {
    var V = P.changedTouches, b = V.length, F, Q;
    for (F = 0; F < b; ++F)
      (Q = a[V[F].identifier]) && (ro(P), Q("drag", P, V[F]));
  }
  function D(P) {
    var V = P.changedTouches, b = V.length, F, Q;
    for (m && clearTimeout(m), m = setTimeout(function() {
      m = null;
    }, 500), F = 0; F < b; ++F)
      (Q = a[V[F].identifier]) && (Tu(P), Q("end", P, V[F]));
  }
  function S(P, V, b, F, Q, K) {
    var $ = c.copy(), W = jt(K || b, V), J, ee, C;
    if ((C = i.call(P, new Qu("beforestart", {
      sourceEvent: b,
      target: y,
      identifier: Q,
      active: f,
      x: W[0],
      y: W[1],
      dx: 0,
      dy: 0,
      dispatch: $
    }), F)) != null)
      return J = C.x - W[0] || 0, ee = C.y - W[1] || 0, function O(H, B, T) {
        var j = W, U;
        switch (H) {
          case "start":
            a[Q] = O, U = f++;
            break;
          case "end":
            delete a[Q], --f;
          // falls through
          case "drag":
            W = jt(T || B, V), U = f;
            break;
        }
        $.call(
          H,
          P,
          new Qu(H, {
            sourceEvent: B,
            subject: C,
            target: y,
            identifier: Q,
            active: U,
            x: W[0] + J,
            y: W[1] + ee,
            dx: W[0] - j[0],
            dy: W[1] - j[1],
            dispatch: $
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
var wr = 0.7, ao = 1 / wr, oo = "\\s*([+-]?\\d+)\\s*", hi = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", tn = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", fw = /^#([0-9a-f]{3,8})$/, dw = new RegExp(`^rgb\\(${oo},${oo},${oo}\\)$`), pw = new RegExp(`^rgb\\(${tn},${tn},${tn}\\)$`), hw = new RegExp(`^rgba\\(${oo},${oo},${oo},${hi}\\)$`), gw = new RegExp(`^rgba\\(${tn},${tn},${tn},${hi}\\)$`), mw = new RegExp(`^hsl\\(${hi},${tn},${tn}\\)$`), yw = new RegExp(`^hsla\\(${hi},${tn},${tn},${hi}\\)$`), hp = {
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
  hex: gp,
  // Deprecated! Use color.formatHex.
  formatHex: gp,
  formatHex8: vw,
  formatHsl: ww,
  formatRgb: mp,
  toString: mp
});
function gp() {
  return this.rgb().formatHex();
}
function vw() {
  return this.rgb().formatHex8();
}
function ww() {
  return Yh(this).formatHsl();
}
function mp() {
  return this.rgb().formatRgb();
}
function xr(t) {
  var r, i;
  return t = (t + "").trim().toLowerCase(), (r = fw.exec(t)) ? (i = r[1].length, r = parseInt(r[1], 16), i === 6 ? yp(r) : i === 3 ? new Ge(r >> 8 & 15 | r >> 4 & 240, r >> 4 & 15 | r & 240, (r & 15) << 4 | r & 15, 1) : i === 8 ? Zs(r >> 24 & 255, r >> 16 & 255, r >> 8 & 255, (r & 255) / 255) : i === 4 ? Zs(r >> 12 & 15 | r >> 8 & 240, r >> 8 & 15 | r >> 4 & 240, r >> 4 & 15 | r & 240, ((r & 15) << 4 | r & 15) / 255) : null) : (r = dw.exec(t)) ? new Ge(r[1], r[2], r[3], 1) : (r = pw.exec(t)) ? new Ge(r[1] * 255 / 100, r[2] * 255 / 100, r[3] * 255 / 100, 1) : (r = hw.exec(t)) ? Zs(r[1], r[2], r[3], r[4]) : (r = gw.exec(t)) ? Zs(r[1] * 255 / 100, r[2] * 255 / 100, r[3] * 255 / 100, r[4]) : (r = mw.exec(t)) ? xp(r[1], r[2] / 100, r[3] / 100, 1) : (r = yw.exec(t)) ? xp(r[1], r[2] / 100, r[3] / 100, r[4]) : hp.hasOwnProperty(t) ? yp(hp[t]) : t === "transparent" ? new Ge(NaN, NaN, NaN, 0) : null;
}
function yp(t) {
  return new Ge(t >> 16 & 255, t >> 8 & 255, t & 255, 1);
}
function Zs(t, r, i, l) {
  return l <= 0 && (t = r = i = NaN), new Ge(t, r, i, l);
}
function fc(t) {
  return t instanceof Yn || (t = xr(t)), t ? (t = t.rgb(), new Ge(t.r, t.g, t.b, t.opacity)) : new Ge();
}
function Ku(t, r, i, l) {
  return arguments.length === 1 ? fc(t) : new Ge(t, r, i, l ?? 1);
}
function Ge(t, r, i, l) {
  this.r = +t, this.g = +r, this.b = +i, this.opacity = +l;
}
mo(Ge, Ku, Ei(Yn, {
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
  hex: vp,
  // Deprecated! Use color.formatHex.
  formatHex: vp,
  formatHex8: xw,
  formatRgb: wp,
  toString: wp
}));
function vp() {
  return `#${gr(this.r)}${gr(this.g)}${gr(this.b)}`;
}
function xw() {
  return `#${gr(this.r)}${gr(this.g)}${gr(this.b)}${gr((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function wp() {
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
function xp(t, r, i, l) {
  return l <= 0 ? t = r = i = NaN : i <= 0 || i >= 1 ? t = r = NaN : r <= 0 && (t = NaN), new Ft(t, r, i, l);
}
function Yh(t) {
  if (t instanceof Ft) return new Ft(t.h, t.s, t.l, t.opacity);
  if (t instanceof Yn || (t = xr(t)), !t) return new Ft();
  if (t instanceof Ft) return t;
  t = t.rgb();
  var r = t.r / 255, i = t.g / 255, l = t.b / 255, a = Math.min(r, i, l), c = Math.max(r, i, l), f = NaN, p = c - a, h = (c + a) / 2;
  return p ? (r === c ? f = (i - l) / p + (i < l) * 6 : i === c ? f = (l - r) / p + 2 : f = (r - i) / p + 4, p /= h < 0.5 ? c + a : 2 - c - a, f *= 60) : p = h > 0 && h < 1 ? 0 : f, new Ft(f, p, h, t.opacity);
}
function _w(t, r, i, l) {
  return arguments.length === 1 ? Yh(t) : new Ft(t, r, i, l ?? 1);
}
function Ft(t, r, i, l) {
  this.h = +t, this.s = +r, this.l = +i, this.opacity = +l;
}
mo(Ft, _w, Ei(Yn, {
  brighter(t) {
    return t = t == null ? ao : Math.pow(ao, t), new Ft(this.h, this.s, this.l * t, this.opacity);
  },
  darker(t) {
    return t = t == null ? wr : Math.pow(wr, t), new Ft(this.h, this.s, this.l * t, this.opacity);
  },
  rgb() {
    var t = this.h % 360 + (this.h < 0) * 360, r = isNaN(t) || isNaN(this.s) ? 0 : this.s, i = this.l, l = i + (i < 0.5 ? i : 1 - i) * r, a = 2 * i - l;
    return new Ge(
      Ru(t >= 240 ? t - 240 : t + 120, a, l),
      Ru(t, a, l),
      Ru(t < 120 ? t + 240 : t - 120, a, l),
      this.opacity
    );
  },
  clamp() {
    return new Ft(_p(this.h), Qs(this.s), Qs(this.l), al(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const t = al(this.opacity);
    return `${t === 1 ? "hsl(" : "hsla("}${_p(this.h)}, ${Qs(this.s) * 100}%, ${Qs(this.l) * 100}%${t === 1 ? ")" : `, ${t})`}`;
  }
}));
function _p(t) {
  return t = (t || 0) % 360, t < 0 ? t + 360 : t;
}
function Qs(t) {
  return Math.max(0, Math.min(1, t || 0));
}
function Ru(t, r, i) {
  return (t < 60 ? r + (i - r) * t / 60 : t < 180 ? i : t < 240 ? r + (i - r) * (240 - t) / 60 : r) * 255;
}
const Zh = Math.PI / 180, Qh = 180 / Math.PI, ul = 18, Kh = 0.96422, Gh = 1, qh = 0.82521, Jh = 4 / 29, io = 6 / 29, eg = 3 * io * io, Sw = io * io * io;
function tg(t) {
  if (t instanceof nn) return new nn(t.l, t.a, t.b, t.opacity);
  if (t instanceof yn) return ng(t);
  t instanceof Ge || (t = fc(t));
  var r = Ou(t.r), i = Ou(t.g), l = Ou(t.b), a = bu((0.2225045 * r + 0.7168786 * i + 0.0606169 * l) / Gh), c, f;
  return r === i && i === l ? c = f = a : (c = bu((0.4360747 * r + 0.3850649 * i + 0.1430804 * l) / Kh), f = bu((0.0139322 * r + 0.0971045 * i + 0.7141733 * l) / qh)), new nn(116 * a - 16, 500 * (c - a), 200 * (a - f), t.opacity);
}
function kw(t, r, i, l) {
  return arguments.length === 1 ? tg(t) : new nn(t, r, i, l ?? 1);
}
function nn(t, r, i, l) {
  this.l = +t, this.a = +r, this.b = +i, this.opacity = +l;
}
mo(nn, kw, Ei(Yn, {
  brighter(t) {
    return new nn(this.l + ul * (t ?? 1), this.a, this.b, this.opacity);
  },
  darker(t) {
    return new nn(this.l - ul * (t ?? 1), this.a, this.b, this.opacity);
  },
  rgb() {
    var t = (this.l + 16) / 116, r = isNaN(this.a) ? t : t + this.a / 500, i = isNaN(this.b) ? t : t - this.b / 200;
    return r = Kh * Du(r), t = Gh * Du(t), i = qh * Du(i), new Ge(
      Lu(3.1338561 * r - 1.6168667 * t - 0.4906146 * i),
      Lu(-0.9787684 * r + 1.9161415 * t + 0.033454 * i),
      Lu(0.0719453 * r - 0.2289914 * t + 1.4052427 * i),
      this.opacity
    );
  }
}));
function bu(t) {
  return t > Sw ? Math.pow(t, 1 / 3) : t / eg + Jh;
}
function Du(t) {
  return t > io ? t * t * t : eg * (t - Jh);
}
function Lu(t) {
  return 255 * (t <= 31308e-7 ? 12.92 * t : 1.055 * Math.pow(t, 1 / 2.4) - 0.055);
}
function Ou(t) {
  return (t /= 255) <= 0.04045 ? t / 12.92 : Math.pow((t + 0.055) / 1.055, 2.4);
}
function Ew(t) {
  if (t instanceof yn) return new yn(t.h, t.c, t.l, t.opacity);
  if (t instanceof nn || (t = tg(t)), t.a === 0 && t.b === 0) return new yn(NaN, 0 < t.l && t.l < 100 ? 0 : NaN, t.l, t.opacity);
  var r = Math.atan2(t.b, t.a) * Qh;
  return new yn(r < 0 ? r + 360 : r, Math.sqrt(t.a * t.a + t.b * t.b), t.l, t.opacity);
}
function Cw(t, r, i, l) {
  return arguments.length === 1 ? Ew(t) : new yn(t, r, i, l ?? 1);
}
function yn(t, r, i, l) {
  this.h = +t, this.c = +r, this.l = +i, this.opacity = +l;
}
function ng(t) {
  if (isNaN(t.h)) return new nn(t.l, 0, 0, t.opacity);
  var r = t.h * Zh;
  return new nn(t.l, Math.cos(r) * t.c, Math.sin(r) * t.c, t.opacity);
}
mo(yn, Cw, Ei(Yn, {
  brighter(t) {
    return new yn(this.h, this.c, this.l + ul * (t ?? 1), this.opacity);
  },
  darker(t) {
    return new yn(this.h, this.c, this.l - ul * (t ?? 1), this.opacity);
  },
  rgb() {
    return ng(this).rgb();
  }
}));
var rg = -0.14861, dc = 1.78277, pc = -0.29227, _l = -0.90649, gi = 1.97294, Sp = gi * _l, kp = gi * dc, Ep = dc * pc - _l * rg;
function Nw(t) {
  if (t instanceof yr) return new yr(t.h, t.s, t.l, t.opacity);
  t instanceof Ge || (t = fc(t));
  var r = t.r / 255, i = t.g / 255, l = t.b / 255, a = (Ep * l + Sp * r - kp * i) / (Ep + Sp - kp), c = l - a, f = (gi * (i - a) - pc * c) / _l, p = Math.sqrt(f * f + c * c) / (gi * a * (1 - a)), h = p ? Math.atan2(f, c) * Qh - 120 : NaN;
  return new yr(h < 0 ? h + 360 : h, p, a, t.opacity);
}
function Gu(t, r, i, l) {
  return arguments.length === 1 ? Nw(t) : new yr(t, r, i, l ?? 1);
}
function yr(t, r, i, l) {
  this.h = +t, this.s = +r, this.l = +i, this.opacity = +l;
}
mo(yr, Gu, Ei(Yn, {
  brighter(t) {
    return t = t == null ? ao : Math.pow(ao, t), new yr(this.h, this.s, this.l * t, this.opacity);
  },
  darker(t) {
    return t = t == null ? wr : Math.pow(wr, t), new yr(this.h, this.s, this.l * t, this.opacity);
  },
  rgb() {
    var t = isNaN(this.h) ? 0 : (this.h + 120) * Zh, r = +this.l, i = isNaN(this.s) ? 0 : this.s * r * (1 - r), l = Math.cos(t), a = Math.sin(t);
    return new Ge(
      255 * (r + i * (rg * l + dc * a)),
      255 * (r + i * (pc * l + _l * a)),
      255 * (r + i * (gi * l)),
      this.opacity
    );
  }
}));
var Sl = (t) => () => t;
function og(t, r) {
  return function(i) {
    return t + i * r;
  };
}
function Mw(t, r, i) {
  return t = Math.pow(t, i), r = Math.pow(r, i) - t, i = 1 / i, function(l) {
    return Math.pow(t + l * r, i);
  };
}
function zw(t, r) {
  var i = r - t;
  return i ? og(t, i > 180 || i < -180 ? i - 360 * Math.round(i / 360) : i) : Sl(isNaN(t) ? r : t);
}
function Pw(t) {
  return (t = +t) == 1 ? so : function(r, i) {
    return i - r ? Mw(r, i, t) : Sl(isNaN(r) ? i : r);
  };
}
function so(t, r) {
  var i = r - t;
  return i ? og(t, i) : Sl(isNaN(t) ? r : t);
}
var cl = (function t(r) {
  var i = Pw(r);
  function l(a, c) {
    var f = i((a = Ku(a)).r, (c = Ku(c)).r), p = i(a.g, c.g), h = i(a.b, c.b), g = so(a.opacity, c.opacity);
    return function(m) {
      return a.r = f(m), a.g = p(m), a.b = h(m), a.opacity = g(m), a + "";
    };
  }
  return l.gamma = t, l;
})(1);
function Iw(t, r) {
  r || (r = []);
  var i = t ? Math.min(r.length, t.length) : 0, l = r.slice(), a;
  return function(c) {
    for (a = 0; a < i; ++a) l[a] = t[a] * (1 - c) + r[a] * c;
    return l;
  };
}
function Tw(t) {
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
function bw(t, r) {
  var i = /* @__PURE__ */ new Date();
  return t = +t, r = +r, function(l) {
    return i.setTime(t * (1 - l) + r * l), i;
  };
}
function en(t, r) {
  return t = +t, r = +r, function(i) {
    return t * (1 - i) + r * i;
  };
}
function Dw(t, r) {
  var i = {}, l = {}, a;
  (t === null || typeof t != "object") && (t = {}), (r === null || typeof r != "object") && (r = {});
  for (a in r)
    a in t ? i[a] = fi(t[a], r[a]) : l[a] = r[a];
  return function(c) {
    for (a in i) l[a] = i[a](c);
    return l;
  };
}
var qu = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, $u = new RegExp(qu.source, "g");
function Lw(t) {
  return function() {
    return t;
  };
}
function Ow(t) {
  return function(r) {
    return t(r) + "";
  };
}
function ig(t, r) {
  var i = qu.lastIndex = $u.lastIndex = 0, l, a, c, f = -1, p = [], h = [];
  for (t = t + "", r = r + ""; (l = qu.exec(t)) && (a = $u.exec(r)); )
    (c = a.index) > i && (c = r.slice(i, c), p[f] ? p[f] += c : p[++f] = c), (l = l[0]) === (a = a[0]) ? p[f] ? p[f] += a : p[++f] = a : (p[++f] = null, h.push({ i: f, x: en(l, a) })), i = $u.lastIndex;
  return i < r.length && (c = r.slice(i), p[f] ? p[f] += c : p[++f] = c), p.length < 2 ? h[0] ? Ow(h[0].x) : Lw(r) : (r = h.length, function(g) {
    for (var m = 0, v; m < r; ++m) p[(v = h[m]).i] = v.x(g);
    return p.join("");
  });
}
function fi(t, r) {
  var i = typeof r, l;
  return r == null || i === "boolean" ? Sl(r) : (i === "number" ? en : i === "string" ? (l = xr(r)) ? (r = l, cl) : ig : r instanceof xr ? cl : r instanceof Date ? bw : Tw(r) ? Iw : Array.isArray(r) ? Rw : typeof r.valueOf != "function" && typeof r.toString != "function" || isNaN(r) ? Dw : en)(t, r);
}
var Cp = 180 / Math.PI, Ju = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function sg(t, r, i, l, a, c) {
  var f, p, h;
  return (f = Math.sqrt(t * t + r * r)) && (t /= f, r /= f), (h = t * i + r * l) && (i -= t * h, l -= r * h), (p = Math.sqrt(i * i + l * l)) && (i /= p, l /= p, h /= p), t * l < r * i && (t = -t, r = -r, h = -h, f = -f), {
    translateX: a,
    translateY: c,
    rotate: Math.atan2(r, t) * Cp,
    skewX: Math.atan(h) * Cp,
    scaleX: f,
    scaleY: p
  };
}
var Ks;
function $w(t) {
  const r = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(t + "");
  return r.isIdentity ? Ju : sg(r.a, r.b, r.c, r.d, r.e, r.f);
}
function Aw(t) {
  return t == null || (Ks || (Ks = document.createElementNS("http://www.w3.org/2000/svg", "g")), Ks.setAttribute("transform", t), !(t = Ks.transform.baseVal.consolidate())) ? Ju : (t = t.matrix, sg(t.a, t.b, t.c, t.d, t.e, t.f));
}
function lg(t, r, i, l) {
  function a(g) {
    return g.length ? g.pop() + " " : "";
  }
  function c(g, m, v, y, x, _) {
    if (g !== v || m !== y) {
      var M = x.push("translate(", null, r, null, i);
      _.push({ i: M - 4, x: en(g, v) }, { i: M - 2, x: en(m, y) });
    } else (v || y) && x.push("translate(" + v + r + y + i);
  }
  function f(g, m, v, y) {
    g !== m ? (g - m > 180 ? m += 360 : m - g > 180 && (g += 360), y.push({ i: v.push(a(v) + "rotate(", null, l) - 2, x: en(g, m) })) : m && v.push(a(v) + "rotate(" + m + l);
  }
  function p(g, m, v, y) {
    g !== m ? y.push({ i: v.push(a(v) + "skewX(", null, l) - 2, x: en(g, m) }) : m && v.push(a(v) + "skewX(" + m + l);
  }
  function h(g, m, v, y, x, _) {
    if (g !== v || m !== y) {
      var M = x.push(a(x) + "scale(", null, ",", null, ")");
      _.push({ i: M - 4, x: en(g, v) }, { i: M - 2, x: en(m, y) });
    } else (v !== 1 || y !== 1) && x.push(a(x) + "scale(" + v + "," + y + ")");
  }
  return function(g, m) {
    var v = [], y = [];
    return g = t(g), m = t(m), c(g.translateX, g.translateY, m.translateX, m.translateY, v, y), f(g.rotate, m.rotate, v, y), p(g.skewX, m.skewX, v, y), h(g.scaleX, g.scaleY, m.scaleX, m.scaleY, v, y), g = m = null, function(x) {
      for (var _ = -1, M = y.length, N; ++_ < M; ) v[(N = y[_]).i] = N.x(x);
      return v.join("");
    };
  };
}
var Hw = lg($w, "px, ", "px)", "deg)"), jw = lg(Aw, ", ", ")", ")"), Fw = 1e-12;
function Np(t) {
  return ((t = Math.exp(t)) + 1 / t) / 2;
}
function Vw(t) {
  return ((t = Math.exp(t)) - 1 / t) / 2;
}
function Bw(t) {
  return ((t = Math.exp(2 * t)) - 1) / (t + 1);
}
var rl = (function t(r, i, l) {
  function a(c, f) {
    var p = c[0], h = c[1], g = c[2], m = f[0], v = f[1], y = f[2], x = m - p, _ = v - h, M = x * x + _ * _, N, E;
    if (M < Fw)
      E = Math.log(y / g) / r, N = function(F) {
        return [
          p + F * x,
          h + F * _,
          g * Math.exp(r * F * E)
        ];
      };
    else {
      var D = Math.sqrt(M), S = (y * y - g * g + l * M) / (2 * g * i * D), P = (y * y - g * g - l * M) / (2 * y * i * D), V = Math.log(Math.sqrt(S * S + 1) - S), b = Math.log(Math.sqrt(P * P + 1) - P);
      E = (b - V) / r, N = function(F) {
        var Q = F * E, K = Np(V), $ = g / (i * D) * (K * Bw(r * Q + V) - Vw(V));
        return [
          p + $ * x,
          h + $ * _,
          g * K / Np(r * Q + V)
        ];
      };
    }
    return N.duration = Math.abs(E) * 1e3 * r / Math.SQRT2, N;
  }
  return a.rho = function(c) {
    var f = Math.max(1e-3, +c), p = f * f, h = p * p;
    return t(f, p, h);
  }, a;
})(Math.SQRT2, 2, 4);
function ag(t) {
  return (function r(i) {
    i = +i;
    function l(a, c) {
      var f = t((a = Gu(a)).h, (c = Gu(c)).h), p = so(a.s, c.s), h = so(a.l, c.l), g = so(a.opacity, c.opacity);
      return function(m) {
        return a.h = f(m), a.s = p(m), a.l = h(Math.pow(m, i)), a.opacity = g(m), a + "";
      };
    }
    return l.gamma = r, l;
  })(1);
}
ag(zw);
ag(so);
var uo = 0, ui = 0, li = 0, ug = 1e3, fl, ci, dl = 0, _r = 0, kl = 0, mi = typeof performance == "object" && performance.now ? performance : Date, cg = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(t) {
  setTimeout(t, 17);
};
function hc() {
  return _r || (cg(Uw), _r = mi.now() + kl);
}
function Uw() {
  _r = 0;
}
function pl() {
  this._call = this._time = this._next = null;
}
pl.prototype = fg.prototype = {
  constructor: pl,
  restart: function(t, r, i) {
    if (typeof t != "function") throw new TypeError("callback is not a function");
    i = (i == null ? hc() : +i) + (r == null ? 0 : +r), !this._next && ci !== this && (ci ? ci._next = this : fl = this, ci = this), this._call = t, this._time = i, ec();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, ec());
  }
};
function fg(t, r, i) {
  var l = new pl();
  return l.restart(t, r, i), l;
}
function Ww() {
  hc(), ++uo;
  for (var t = fl, r; t; )
    (r = _r - t._time) >= 0 && t._call.call(void 0, r), t = t._next;
  --uo;
}
function Mp() {
  _r = (dl = mi.now()) + kl, uo = ui = 0;
  try {
    Ww();
  } finally {
    uo = 0, Yw(), _r = 0;
  }
}
function Xw() {
  var t = mi.now(), r = t - dl;
  r > ug && (kl -= r, dl = t);
}
function Yw() {
  for (var t, r = fl, i, l = 1 / 0; r; )
    r._call ? (l > r._time && (l = r._time), t = r, r = r._next) : (i = r._next, r._next = null, r = t ? t._next = i : fl = i);
  ci = t, ec(l);
}
function ec(t) {
  if (!uo) {
    ui && (ui = clearTimeout(ui));
    var r = t - _r;
    r > 24 ? (t < 1 / 0 && (ui = setTimeout(Mp, Math.ceil(t - mi.now() - kl) + 1)), li && (li = clearInterval(li))) : (li || (dl = mi.now(), li = setInterval(Xw, ug)), uo = 1, cg(Mp));
  }
}
function zp(t, r, i) {
  var l = new pl();
  return r = r == null ? 0 : +r, l.restart((a) => {
    l.stop(), t(a + r);
  }, r, i), l;
}
function Zw(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}
var gc = 3;
(function t(r) {
  r = +r;
  function i(l) {
    return Math.pow(l, r);
  }
  return i.exponent = t, i;
})(gc);
(function t(r) {
  r = +r;
  function i(l) {
    return 1 - Math.pow(1 - l, r);
  }
  return i.exponent = t, i;
})(gc);
(function t(r) {
  r = +r;
  function i(l) {
    return ((l *= 2) <= 1 ? Math.pow(l, r) : 2 - Math.pow(2 - l, r)) / 2;
  }
  return i.exponent = t, i;
})(gc);
function hl(t) {
  return (Math.pow(2, -10 * t) - 9765625e-10) * 1.0009775171065494;
}
var mc = 1.70158;
(function t(r) {
  r = +r;
  function i(l) {
    return (l = +l) * l * (r * (l - 1) + l);
  }
  return i.overshoot = t, i;
})(mc);
(function t(r) {
  r = +r;
  function i(l) {
    return --l * l * ((l + 1) * r + l) + 1;
  }
  return i.overshoot = t, i;
})(mc);
(function t(r) {
  r = +r;
  function i(l) {
    return ((l *= 2) < 1 ? l * l * ((r + 1) * l - r) : (l -= 2) * l * ((r + 1) * l + r) + 2) / 2;
  }
  return i.overshoot = t, i;
})(mc);
var co = 2 * Math.PI, yc = 1, vc = 0.3;
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
})(yc, vc);
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
})(yc, vc);
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
})(yc, vc);
var Qw = wl("start", "end", "cancel", "interrupt"), Kw = [], dg = 0, Pp = 1, tc = 2, ol = 3, Ip = 4, nc = 5, il = 6;
function El(t, r, i, l, a, c) {
  var f = t.__transition;
  if (!f) t.__transition = {};
  else if (i in f) return;
  Gw(t, i, {
    name: r,
    index: l,
    // For context during callback.
    group: a,
    // For context during callback.
    on: Qw,
    tween: Kw,
    time: c.time,
    delay: c.delay,
    duration: c.duration,
    ease: c.ease,
    timer: null,
    state: dg
  });
}
function wc(t, r) {
  var i = Wt(t, r);
  if (i.state > dg) throw new Error("too late; already scheduled");
  return i;
}
function rn(t, r) {
  var i = Wt(t, r);
  if (i.state > ol) throw new Error("too late; already running");
  return i;
}
function Wt(t, r) {
  var i = t.__transition;
  if (!i || !(i = i[r])) throw new Error("transition not found");
  return i;
}
function Gw(t, r, i) {
  var l = t.__transition, a;
  l[r] = i, i.timer = fg(c, 0, i.time);
  function c(g) {
    i.state = Pp, i.timer.restart(f, i.delay, i.time), i.delay <= g && f(g - i.delay);
  }
  function f(g) {
    var m, v, y, x;
    if (i.state !== Pp) return h();
    for (m in l)
      if (x = l[m], x.name === i.name) {
        if (x.state === ol) return zp(f);
        x.state === Ip ? (x.state = il, x.timer.stop(), x.on.call("interrupt", t, t.__data__, x.index, x.group), delete l[m]) : +m < r && (x.state = il, x.timer.stop(), x.on.call("cancel", t, t.__data__, x.index, x.group), delete l[m]);
      }
    if (zp(function() {
      i.state === ol && (i.state = Ip, i.timer.restart(p, i.delay, i.time), p(g));
    }), i.state = tc, i.on.call("start", t, t.__data__, i.index, i.group), i.state === tc) {
      for (i.state = ol, a = new Array(y = i.tween.length), m = 0, v = -1; m < y; ++m)
        (x = i.tween[m].value.call(t, t.__data__, i.index, i.group)) && (a[++v] = x);
      a.length = v + 1;
    }
  }
  function p(g) {
    for (var m = g < i.duration ? i.ease.call(null, g / i.duration) : (i.timer.restart(h), i.state = nc, 1), v = -1, y = a.length; ++v < y; )
      a[v].call(t, m);
    i.state === nc && (i.on.call("end", t, t.__data__, i.index, i.group), h());
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
      a = l.state > tc && l.state < nc, l.state = il, l.timer.stop(), l.on.call(a ? "interrupt" : "cancel", t, t.__data__, l.index, l.group), delete i[f];
    }
    c && delete t.__transition;
  }
}
function qw(t) {
  return this.each(function() {
    sl(this, t);
  });
}
function Jw(t, r) {
  var i, l;
  return function() {
    var a = rn(this, t), c = a.tween;
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
function ex(t, r, i) {
  var l, a;
  if (typeof i != "function") throw new Error();
  return function() {
    var c = rn(this, t), f = c.tween;
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
function tx(t, r) {
  var i = this._id;
  if (t += "", arguments.length < 2) {
    for (var l = Wt(this.node(), i).tween, a = 0, c = l.length, f; a < c; ++a)
      if ((f = l[a]).name === t)
        return f.value;
    return null;
  }
  return this.each((r == null ? Jw : ex)(i, t, r));
}
function xc(t, r, i) {
  var l = t._id;
  return t.each(function() {
    var a = rn(this, l);
    (a.value || (a.value = {}))[r] = i.apply(this, arguments);
  }), function(a) {
    return Wt(a, l).value[r];
  };
}
function pg(t, r) {
  var i;
  return (typeof r == "number" ? en : r instanceof xr ? cl : (i = xr(r)) ? (r = i, cl) : ig)(t, r);
}
function nx(t) {
  return function() {
    this.removeAttribute(t);
  };
}
function rx(t) {
  return function() {
    this.removeAttributeNS(t.space, t.local);
  };
}
function ox(t, r, i) {
  var l, a = i + "", c;
  return function() {
    var f = this.getAttribute(t);
    return f === a ? null : f === l ? c : c = r(l = f, i);
  };
}
function ix(t, r, i) {
  var l, a = i + "", c;
  return function() {
    var f = this.getAttributeNS(t.space, t.local);
    return f === a ? null : f === l ? c : c = r(l = f, i);
  };
}
function sx(t, r, i) {
  var l, a, c;
  return function() {
    var f, p = i(this), h;
    return p == null ? void this.removeAttribute(t) : (f = this.getAttribute(t), h = p + "", f === h ? null : f === l && h === a ? c : (a = h, c = r(l = f, p)));
  };
}
function lx(t, r, i) {
  var l, a, c;
  return function() {
    var f, p = i(this), h;
    return p == null ? void this.removeAttributeNS(t.space, t.local) : (f = this.getAttributeNS(t.space, t.local), h = p + "", f === h ? null : f === l && h === a ? c : (a = h, c = r(l = f, p)));
  };
}
function ax(t, r) {
  var i = xl(t), l = i === "transform" ? jw : pg;
  return this.attrTween(t, typeof r == "function" ? (i.local ? lx : sx)(i, l, xc(this, "attr." + t, r)) : r == null ? (i.local ? rx : nx)(i) : (i.local ? ix : ox)(i, l, r));
}
function ux(t, r) {
  return function(i) {
    this.setAttribute(t, r.call(this, i));
  };
}
function cx(t, r) {
  return function(i) {
    this.setAttributeNS(t.space, t.local, r.call(this, i));
  };
}
function fx(t, r) {
  var i, l;
  function a() {
    var c = r.apply(this, arguments);
    return c !== l && (i = (l = c) && cx(t, c)), i;
  }
  return a._value = r, a;
}
function dx(t, r) {
  var i, l;
  function a() {
    var c = r.apply(this, arguments);
    return c !== l && (i = (l = c) && ux(t, c)), i;
  }
  return a._value = r, a;
}
function px(t, r) {
  var i = "attr." + t;
  if (arguments.length < 2) return (i = this.tween(i)) && i._value;
  if (r == null) return this.tween(i, null);
  if (typeof r != "function") throw new Error();
  var l = xl(t);
  return this.tween(i, (l.local ? fx : dx)(l, r));
}
function hx(t, r) {
  return function() {
    wc(this, t).delay = +r.apply(this, arguments);
  };
}
function gx(t, r) {
  return r = +r, function() {
    wc(this, t).delay = r;
  };
}
function mx(t) {
  var r = this._id;
  return arguments.length ? this.each((typeof t == "function" ? hx : gx)(r, t)) : Wt(this.node(), r).delay;
}
function yx(t, r) {
  return function() {
    rn(this, t).duration = +r.apply(this, arguments);
  };
}
function vx(t, r) {
  return r = +r, function() {
    rn(this, t).duration = r;
  };
}
function wx(t) {
  var r = this._id;
  return arguments.length ? this.each((typeof t == "function" ? yx : vx)(r, t)) : Wt(this.node(), r).duration;
}
function xx(t, r) {
  if (typeof r != "function") throw new Error();
  return function() {
    rn(this, t).ease = r;
  };
}
function _x(t) {
  var r = this._id;
  return arguments.length ? this.each(xx(r, t)) : Wt(this.node(), r).ease;
}
function Sx(t, r) {
  return function() {
    var i = r.apply(this, arguments);
    if (typeof i != "function") throw new Error();
    rn(this, t).ease = i;
  };
}
function kx(t) {
  if (typeof t != "function") throw new Error();
  return this.each(Sx(this._id, t));
}
function Ex(t) {
  typeof t != "function" && (t = Dh(t));
  for (var r = this._groups, i = r.length, l = new Array(i), a = 0; a < i; ++a)
    for (var c = r[a], f = c.length, p = l[a] = [], h, g = 0; g < f; ++g)
      (h = c[g]) && t.call(h, h.__data__, g, c) && p.push(h);
  return new wn(l, this._parents, this._name, this._id);
}
function Cx(t) {
  if (t._id !== this._id) throw new Error();
  for (var r = this._groups, i = t._groups, l = r.length, a = i.length, c = Math.min(l, a), f = new Array(l), p = 0; p < c; ++p)
    for (var h = r[p], g = i[p], m = h.length, v = f[p] = new Array(m), y, x = 0; x < m; ++x)
      (y = h[x] || g[x]) && (v[x] = y);
  for (; p < l; ++p)
    f[p] = r[p];
  return new wn(f, this._parents, this._name, this._id);
}
function Nx(t) {
  return (t + "").trim().split(/^|\s+/).every(function(r) {
    var i = r.indexOf(".");
    return i >= 0 && (r = r.slice(0, i)), !r || r === "start";
  });
}
function Mx(t, r, i) {
  var l, a, c = Nx(r) ? wc : rn;
  return function() {
    var f = c(this, t), p = f.on;
    p !== l && (a = (l = p).copy()).on(r, i), f.on = a;
  };
}
function zx(t, r) {
  var i = this._id;
  return arguments.length < 2 ? Wt(this.node(), i).on.on(t) : this.each(Mx(i, t, r));
}
function Px(t) {
  return function() {
    var r = this.parentNode;
    for (var i in this.__transition) if (+i !== t) return;
    r && r.removeChild(this);
  };
}
function Ix() {
  return this.on("end.remove", Px(this._id));
}
function Tx(t) {
  var r = this._name, i = this._id;
  typeof t != "function" && (t = uc(t));
  for (var l = this._groups, a = l.length, c = new Array(a), f = 0; f < a; ++f)
    for (var p = l[f], h = p.length, g = c[f] = new Array(h), m, v, y = 0; y < h; ++y)
      (m = p[y]) && (v = t.call(m, m.__data__, y, p)) && ("__data__" in m && (v.__data__ = m.__data__), g[y] = v, El(g[y], r, i, y, g, Wt(m, i)));
  return new wn(c, this._parents, r, i);
}
function Rx(t) {
  var r = this._name, i = this._id;
  typeof t != "function" && (t = bh(t));
  for (var l = this._groups, a = l.length, c = [], f = [], p = 0; p < a; ++p)
    for (var h = l[p], g = h.length, m, v = 0; v < g; ++v)
      if (m = h[v]) {
        for (var y = t.call(m, m.__data__, v, h), x, _ = Wt(m, i), M = 0, N = y.length; M < N; ++M)
          (x = y[M]) && El(x, r, i, M, y, _);
        c.push(y), f.push(m);
      }
  return new wn(c, f, r, i);
}
var bx = ki.prototype.constructor;
function Dx() {
  return new bx(this._groups, this._parents);
}
function Lx(t, r) {
  var i, l, a;
  return function() {
    var c = lo(this, t), f = (this.style.removeProperty(t), lo(this, t));
    return c === f ? null : c === i && f === l ? a : a = r(i = c, l = f);
  };
}
function hg(t) {
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
function $x(t, r, i) {
  var l, a, c;
  return function() {
    var f = lo(this, t), p = i(this), h = p + "";
    return p == null && (h = p = (this.style.removeProperty(t), lo(this, t))), f === h ? null : f === l && h === a ? c : (a = h, c = r(l = f, p));
  };
}
function Ax(t, r) {
  var i, l, a, c = "style." + r, f = "end." + c, p;
  return function() {
    var h = rn(this, t), g = h.on, m = h.value[c] == null ? p || (p = hg(r)) : void 0;
    (g !== i || a !== m) && (l = (i = g).copy()).on(f, a = m), h.on = l;
  };
}
function Hx(t, r, i) {
  var l = (t += "") == "transform" ? Hw : pg;
  return r == null ? this.styleTween(t, Lx(t, l)).on("end.style." + t, hg(t)) : typeof r == "function" ? this.styleTween(t, $x(t, l, xc(this, "style." + t, r))).each(Ax(this._id, t)) : this.styleTween(t, Ox(t, l, r), i).on("end.style." + t, null);
}
function jx(t, r, i) {
  return function(l) {
    this.style.setProperty(t, r.call(this, l), i);
  };
}
function Fx(t, r, i) {
  var l, a;
  function c() {
    var f = r.apply(this, arguments);
    return f !== a && (l = (a = f) && jx(t, f, i)), l;
  }
  return c._value = r, c;
}
function Vx(t, r, i) {
  var l = "style." + (t += "");
  if (arguments.length < 2) return (l = this.tween(l)) && l._value;
  if (r == null) return this.tween(l, null);
  if (typeof r != "function") throw new Error();
  return this.tween(l, Fx(t, r, i ?? ""));
}
function Bx(t) {
  return function() {
    this.textContent = t;
  };
}
function Ux(t) {
  return function() {
    var r = t(this);
    this.textContent = r ?? "";
  };
}
function Wx(t) {
  return this.tween("text", typeof t == "function" ? Ux(xc(this, "text", t)) : Bx(t == null ? "" : t + ""));
}
function Xx(t) {
  return function(r) {
    this.textContent = t.call(this, r);
  };
}
function Yx(t) {
  var r, i;
  function l() {
    var a = t.apply(this, arguments);
    return a !== i && (r = (i = a) && Xx(a)), r;
  }
  return l._value = t, l;
}
function Zx(t) {
  var r = "text";
  if (arguments.length < 1) return (r = this.tween(r)) && r._value;
  if (t == null) return this.tween(r, null);
  if (typeof t != "function") throw new Error();
  return this.tween(r, Yx(t));
}
function Qx() {
  for (var t = this._name, r = this._id, i = gg(), l = this._groups, a = l.length, c = 0; c < a; ++c)
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
function Kx() {
  var t, r, i = this, l = i._id, a = i.size();
  return new Promise(function(c, f) {
    var p = { value: f }, h = { value: function() {
      --a === 0 && c();
    } };
    i.each(function() {
      var g = rn(this, l), m = g.on;
      m !== t && (r = (t = m).copy(), r._.cancel.push(p), r._.interrupt.push(p), r._.end.push(h)), g.on = r;
    }), a === 0 && c();
  });
}
var Gx = 0;
function wn(t, r, i, l) {
  this._groups = t, this._parents = r, this._name = i, this._id = l;
}
function gg() {
  return ++Gx;
}
var gn = ki.prototype;
wn.prototype = {
  constructor: wn,
  select: Tx,
  selectAll: Rx,
  selectChild: gn.selectChild,
  selectChildren: gn.selectChildren,
  filter: Ex,
  merge: Cx,
  selection: Dx,
  transition: Qx,
  call: gn.call,
  nodes: gn.nodes,
  node: gn.node,
  size: gn.size,
  empty: gn.empty,
  each: gn.each,
  on: zx,
  attr: ax,
  attrTween: px,
  style: Hx,
  styleTween: Vx,
  text: Wx,
  textTween: Zx,
  remove: Ix,
  tween: tx,
  delay: mx,
  duration: wx,
  ease: _x,
  easeVarying: kx,
  end: Kx,
  [Symbol.iterator]: gn[Symbol.iterator]
};
var qx = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: Zw
};
function Jx(t, r) {
  for (var i; !(i = t.__transition) || !(i = i[r]); )
    if (!(t = t.parentNode))
      throw new Error(`transition ${r} not found`);
  return i;
}
function e1(t) {
  var r, i;
  t instanceof wn ? (r = t._id, t = t._name) : (r = gg(), (i = qx).time = hc(), t = t == null ? null : t + "");
  for (var l = this._groups, a = l.length, c = 0; c < a; ++c)
    for (var f = l[c], p = f.length, h, g = 0; g < p; ++g)
      (h = f[g]) && El(h, t, r, g, f, i || Jx(h, r));
  return new wn(l, this._parents, t, r);
}
ki.prototype.interrupt = qw;
ki.prototype.transition = e1;
var Gs = (t) => () => t;
function t1(t, {
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
mg.prototype = vn.prototype;
function mg(t) {
  for (; !t.__zoom; ) if (!(t = t.parentNode)) return Cl;
  return t.__zoom;
}
function Au(t) {
  t.stopImmediatePropagation();
}
function ai(t) {
  t.preventDefault(), t.stopImmediatePropagation();
}
function n1(t) {
  return (!t.ctrlKey || t.type === "wheel") && !t.button;
}
function r1() {
  var t = this;
  return t instanceof SVGElement ? (t = t.ownerSVGElement || t, t.hasAttribute("viewBox") ? (t = t.viewBox.baseVal, [[t.x, t.y], [t.x + t.width, t.y + t.height]]) : [[0, 0], [t.width.baseVal.value, t.height.baseVal.value]]) : [[0, 0], [t.clientWidth, t.clientHeight]];
}
function Tp() {
  return this.__zoom || Cl;
}
function o1(t) {
  return -t.deltaY * (t.deltaMode === 1 ? 0.05 : t.deltaMode ? 1 : 2e-3) * (t.ctrlKey ? 10 : 1);
}
function i1() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function s1(t, r, i) {
  var l = t.invertX(r[0][0]) - i[0][0], a = t.invertX(r[1][0]) - i[1][0], c = t.invertY(r[0][1]) - i[0][1], f = t.invertY(r[1][1]) - i[1][1];
  return t.translate(
    a > l ? (l + a) / 2 : Math.min(0, l) || Math.max(0, a),
    f > c ? (c + f) / 2 : Math.min(0, c) || Math.max(0, f)
  );
}
function yg() {
  var t = n1, r = r1, i = s1, l = o1, a = i1, c = [0, 1 / 0], f = [[-1 / 0, -1 / 0], [1 / 0, 1 / 0]], p = 250, h = rl, g = wl("start", "zoom", "end"), m, v, y, x = 500, _ = 150, M = 0, N = 10;
  function E(C) {
    C.property("__zoom", Tp).on("wheel.zoom", Q, { passive: !1 }).on("mousedown.zoom", K).on("dblclick.zoom", $).filter(a).on("touchstart.zoom", W).on("touchmove.zoom", J).on("touchend.zoom touchcancel.zoom", ee).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  E.transform = function(C, O, H, B) {
    var T = C.selection ? C.selection() : C;
    T.property("__zoom", Tp), C !== T ? V(C, O, H, B) : T.interrupt().each(function() {
      b(this, arguments).event(B).start().zoom(null, typeof O == "function" ? O.apply(this, arguments) : O).end();
    });
  }, E.scaleBy = function(C, O, H, B) {
    E.scaleTo(C, function() {
      var T = this.__zoom.k, j = typeof O == "function" ? O.apply(this, arguments) : O;
      return T * j;
    }, H, B);
  }, E.scaleTo = function(C, O, H, B) {
    E.transform(C, function() {
      var T = r.apply(this, arguments), j = this.__zoom, U = H == null ? P(T) : typeof H == "function" ? H.apply(this, arguments) : H, k = j.invert(U), A = typeof O == "function" ? O.apply(this, arguments) : O;
      return i(S(D(j, A), U, k), T, f);
    }, H, B);
  }, E.translateBy = function(C, O, H, B) {
    E.transform(C, function() {
      return i(this.__zoom.translate(
        typeof O == "function" ? O.apply(this, arguments) : O,
        typeof H == "function" ? H.apply(this, arguments) : H
      ), r.apply(this, arguments), f);
    }, null, B);
  }, E.translateTo = function(C, O, H, B, T) {
    E.transform(C, function() {
      var j = r.apply(this, arguments), U = this.__zoom, k = B == null ? P(j) : typeof B == "function" ? B.apply(this, arguments) : B;
      return i(Cl.translate(k[0], k[1]).scale(U.k).translate(
        typeof O == "function" ? -O.apply(this, arguments) : -O,
        typeof H == "function" ? -H.apply(this, arguments) : -H
      ), j, f);
    }, B, T);
  };
  function D(C, O) {
    return O = Math.max(c[0], Math.min(c[1], O)), O === C.k ? C : new vn(O, C.x, C.y);
  }
  function S(C, O, H) {
    var B = O[0] - H[0] * C.k, T = O[1] - H[1] * C.k;
    return B === C.x && T === C.y ? C : new vn(C.k, B, T);
  }
  function P(C) {
    return [(+C[0][0] + +C[1][0]) / 2, (+C[0][1] + +C[1][1]) / 2];
  }
  function V(C, O, H, B) {
    C.on("start.zoom", function() {
      b(this, arguments).event(B).start();
    }).on("interrupt.zoom end.zoom", function() {
      b(this, arguments).event(B).end();
    }).tween("zoom", function() {
      var T = this, j = arguments, U = b(T, j).event(B), k = r.apply(T, j), A = H == null ? P(k) : typeof H == "function" ? H.apply(T, j) : H, ie = Math.max(k[1][0] - k[0][0], k[1][1] - k[0][1]), re = T.__zoom, ae = typeof O == "function" ? O.apply(T, j) : O, ce = h(re.invert(A).concat(ie / re.k), ae.invert(A).concat(ie / ae.k));
      return function(ue) {
        if (ue === 1) ue = ae;
        else {
          var q = ce(ue), le = ie / q[2];
          ue = new vn(le, A[0] - q[0] * le, A[1] - q[1] * le);
        }
        U.zoom(null, ue);
      };
    });
  }
  function b(C, O, H) {
    return !H && C.__zooming || new F(C, O);
  }
  function F(C, O) {
    this.that = C, this.args = O, this.active = 0, this.sourceEvent = null, this.extent = r.apply(C, O), this.taps = 0;
  }
  F.prototype = {
    event: function(C) {
      return C && (this.sourceEvent = C), this;
    },
    start: function() {
      return ++this.active === 1 && (this.that.__zooming = this, this.emit("start")), this;
    },
    zoom: function(C, O) {
      return this.mouse && C !== "mouse" && (this.mouse[1] = O.invert(this.mouse[0])), this.touch0 && C !== "touch" && (this.touch0[1] = O.invert(this.touch0[0])), this.touch1 && C !== "touch" && (this.touch1[1] = O.invert(this.touch1[0])), this.that.__zoom = O, this.emit("zoom"), this;
    },
    end: function() {
      return --this.active === 0 && (delete this.that.__zooming, this.emit("end")), this;
    },
    emit: function(C) {
      var O = kt(this.that).datum();
      g.call(
        C,
        this.that,
        new t1(C, {
          sourceEvent: this.sourceEvent,
          target: E,
          transform: this.that.__zoom,
          dispatch: g
        }),
        O
      );
    }
  };
  function Q(C, ...O) {
    if (!t.apply(this, arguments)) return;
    var H = b(this, O).event(C), B = this.__zoom, T = Math.max(c[0], Math.min(c[1], B.k * Math.pow(2, l.apply(this, arguments)))), j = jt(C);
    if (H.wheel)
      (H.mouse[0][0] !== j[0] || H.mouse[0][1] !== j[1]) && (H.mouse[1] = B.invert(H.mouse[0] = j)), clearTimeout(H.wheel);
    else {
      if (B.k === T) return;
      H.mouse = [j, B.invert(j)], sl(this), H.start();
    }
    ai(C), H.wheel = setTimeout(U, _), H.zoom("mouse", i(S(D(B, T), H.mouse[0], H.mouse[1]), H.extent, f));
    function U() {
      H.wheel = null, H.end();
    }
  }
  function K(C, ...O) {
    if (y || !t.apply(this, arguments)) return;
    var H = C.currentTarget, B = b(this, O, !0).event(C), T = kt(C.view).on("mousemove.zoom", A, !0).on("mouseup.zoom", ie, !0), j = jt(C, H), U = C.clientX, k = C.clientY;
    Uh(C.view), Au(C), B.mouse = [j, this.__zoom.invert(j)], sl(this), B.start();
    function A(re) {
      if (ai(re), !B.moved) {
        var ae = re.clientX - U, ce = re.clientY - k;
        B.moved = ae * ae + ce * ce > M;
      }
      B.event(re).zoom("mouse", i(S(B.that.__zoom, B.mouse[0] = jt(re, H), B.mouse[1]), B.extent, f));
    }
    function ie(re) {
      T.on("mousemove.zoom mouseup.zoom", null), Wh(re.view, B.moved), ai(re), B.event(re).end();
    }
  }
  function $(C, ...O) {
    if (t.apply(this, arguments)) {
      var H = this.__zoom, B = jt(C.changedTouches ? C.changedTouches[0] : C, this), T = H.invert(B), j = H.k * (C.shiftKey ? 0.5 : 2), U = i(S(D(H, j), B, T), r.apply(this, O), f);
      ai(C), p > 0 ? kt(this).transition().duration(p).call(V, U, B, C) : kt(this).call(E.transform, U, B, C);
    }
  }
  function W(C, ...O) {
    if (t.apply(this, arguments)) {
      var H = C.touches, B = H.length, T = b(this, O, C.changedTouches.length === B).event(C), j, U, k, A;
      for (Au(C), U = 0; U < B; ++U)
        k = H[U], A = jt(k, this), A = [A, this.__zoom.invert(A), k.identifier], T.touch0 ? !T.touch1 && T.touch0[2] !== A[2] && (T.touch1 = A, T.taps = 0) : (T.touch0 = A, j = !0, T.taps = 1 + !!m);
      m && (m = clearTimeout(m)), j && (T.taps < 2 && (v = A[0], m = setTimeout(function() {
        m = null;
      }, x)), sl(this), T.start());
    }
  }
  function J(C, ...O) {
    if (this.__zooming) {
      var H = b(this, O).event(C), B = C.changedTouches, T = B.length, j, U, k, A;
      for (ai(C), j = 0; j < T; ++j)
        U = B[j], k = jt(U, this), H.touch0 && H.touch0[2] === U.identifier ? H.touch0[0] = k : H.touch1 && H.touch1[2] === U.identifier && (H.touch1[0] = k);
      if (U = H.that.__zoom, H.touch1) {
        var ie = H.touch0[0], re = H.touch0[1], ae = H.touch1[0], ce = H.touch1[1], ue = (ue = ae[0] - ie[0]) * ue + (ue = ae[1] - ie[1]) * ue, q = (q = ce[0] - re[0]) * q + (q = ce[1] - re[1]) * q;
        U = D(U, Math.sqrt(ue / q)), k = [(ie[0] + ae[0]) / 2, (ie[1] + ae[1]) / 2], A = [(re[0] + ce[0]) / 2, (re[1] + ce[1]) / 2];
      } else if (H.touch0) k = H.touch0[0], A = H.touch0[1];
      else return;
      H.zoom("touch", i(S(U, k, A), H.extent, f));
    }
  }
  function ee(C, ...O) {
    if (this.__zooming) {
      var H = b(this, O).event(C), B = C.changedTouches, T = B.length, j, U;
      for (Au(C), y && clearTimeout(y), y = setTimeout(function() {
        y = null;
      }, x), j = 0; j < T; ++j)
        U = B[j], H.touch0 && H.touch0[2] === U.identifier ? delete H.touch0 : H.touch1 && H.touch1[2] === U.identifier && delete H.touch1;
      if (H.touch1 && !H.touch0 && (H.touch0 = H.touch1, delete H.touch1), H.touch0) H.touch0[1] = this.__zoom.invert(H.touch0[0]);
      else if (H.end(), H.taps === 2 && (U = jt(U, this), Math.hypot(v[0] - U[0], v[1] - U[1]) < N)) {
        var k = kt(this).on("dblclick.zoom");
        k && k.apply(this, arguments);
      }
    }
  }
  return E.wheelDelta = function(C) {
    return arguments.length ? (l = typeof C == "function" ? C : Gs(+C), E) : l;
  }, E.filter = function(C) {
    return arguments.length ? (t = typeof C == "function" ? C : Gs(!!C), E) : t;
  }, E.touchable = function(C) {
    return arguments.length ? (a = typeof C == "function" ? C : Gs(!!C), E) : a;
  }, E.extent = function(C) {
    return arguments.length ? (r = typeof C == "function" ? C : Gs([[+C[0][0], +C[0][1]], [+C[1][0], +C[1][1]]]), E) : r;
  }, E.scaleExtent = function(C) {
    return arguments.length ? (c[0] = +C[0], c[1] = +C[1], E) : [c[0], c[1]];
  }, E.translateExtent = function(C) {
    return arguments.length ? (f[0][0] = +C[0][0], f[1][0] = +C[1][0], f[0][1] = +C[0][1], f[1][1] = +C[1][1], E) : [[f[0][0], f[0][1]], [f[1][0], f[1][1]]];
  }, E.constrain = function(C) {
    return arguments.length ? (i = C, E) : i;
  }, E.duration = function(C) {
    return arguments.length ? (p = +C, E) : p;
  }, E.interpolate = function(C) {
    return arguments.length ? (h = C, E) : h;
  }, E.on = function() {
    var C = g.on.apply(g, arguments);
    return C === g ? E : C;
  }, E.clickDistance = function(C) {
    return arguments.length ? (M = (C = +C) * C, E) : Math.sqrt(M);
  }, E.tapDistance = function(C) {
    return arguments.length ? (N = +C, E) : N;
  }, E;
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
], vg = ["Enter", " ", "Escape"], wg = {
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
const xg = {
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
}, _g = (t) => !!t && typeof t == "object" && "id" in t && "source" in t && "target" in t, l1 = (t) => !!t && typeof t == "object" && "id" in t && "position" in t && !("source" in t) && !("target" in t), _c = (t) => !!t && typeof t == "object" && "id" in t && "internals" in t && !("source" in t) && !("target" in t), Ci = (t, r = [0, 0]) => {
  const { width: i, height: l } = Xt(t), a = t.origin ?? r, c = i * a[0], f = l * a[1];
  return {
    x: t.position.x - c,
    y: t.position.y - f
  };
}, a1 = (t, r = { nodeOrigin: [0, 0] }) => {
  if (t.length === 0)
    return { x: 0, y: 0, width: 0, height: 0 };
  let i = !1;
  const l = t.reduce((a, c) => {
    const f = typeof c == "string";
    let p = !r.nodeLookup && !f ? c : void 0;
    return r.nodeLookup && (p = f ? r.nodeLookup.get(c) : _c(c) ? c : r.nodeLookup.get(c.id)), p ? (i = !0, Nl(a, ml(p, r.nodeOrigin))) : a;
  }, { x: 1 / 0, y: 1 / 0, x2: -1 / 0, y2: -1 / 0 });
  return i ? Ml(l) : { x: 0, y: 0, width: 0, height: 0 };
}, Ni = (t, r = {}) => {
  let i = { x: 1 / 0, y: 1 / 0, x2: -1 / 0, y2: -1 / 0 }, l = !1;
  return t.forEach((a) => {
    (r.filter === void 0 || r.filter(a)) && (i = Nl(i, ml(a)), l = !0);
  }), l ? Ml(i) : { x: 0, y: 0, width: 0, height: 0 };
}, Sc = (t, r, [i, l, a] = [0, 0, 1], c = !1, f = !1) => {
  const p = (r.x - i) / a, h = (r.y - l) / a, g = r.width / a, m = r.height / a, v = [];
  for (const y of t.values()) {
    const { measured: x, selectable: _ = !0, hidden: M = !1 } = y;
    if (f && !_ || M)
      continue;
    const N = x.width ?? y.width ?? y.initialWidth ?? 0, E = x.height ?? y.height ?? y.initialHeight ?? 0, { x: D, y: S } = y.internals.positionAbsolute, P = Cg(p, h, g, m, D, S, N, E), V = N * E, b = c && P > 0;
    (!y.internals.handleBounds || b || P >= V || y.dragging) && v.push(y);
  }
  return v;
}, u1 = (t, r) => {
  const i = /* @__PURE__ */ new Set();
  return t.forEach((l) => {
    i.add(l.id);
  }), r.filter((l) => i.has(l.source) || i.has(l.target));
};
function c1(t, r) {
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
async function f1({ nodes: t, width: r, height: i, panZoom: l, minZoom: a, maxZoom: c }, f) {
  if (t.size === 0)
    return !0;
  const p = c1(t, f), h = Ni(p), g = Ec(h, r, i, f?.minZoom ?? a, f?.maxZoom ?? c, f?.padding ?? 0.1);
  return await l.setViewport(g, {
    duration: f?.duration,
    ease: f?.ease,
    interpolate: f?.interpolate
  }), !0;
}
function Sg({ nodeId: t, nextPosition: r, nodeLookup: i, nodeOrigin: l = [0, 0], nodeExtent: a, onError: c }) {
  const f = i.get(t), p = f.parentId ? i.get(f.parentId) : void 0, { x: h, y: g } = p ? p.internals.positionAbsolute : { x: 0, y: 0 }, m = f.origin ?? l;
  let v = f.extent || a;
  if (f.extent === "parent" && !f.expandParent)
    if (!p)
      c?.("005", Ut.error005());
    else {
      const { width: x, height: _ } = Xt(p);
      x && _ && (v = [
        [h, g],
        [h + x, g + _]
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
async function d1({ nodesToRemove: t = [], edgesToRemove: r = [], nodes: i, edges: l, onBeforeDelete: a }) {
  const c = new Set(t.map((y) => y.id)), f = [];
  for (const y of i) {
    if (y.deletable === !1)
      continue;
    const x = c.has(y.id), _ = !x && y.parentId && f.find((M) => M.id === y.parentId);
    (x || _) && f.push(y);
  }
  const p = new Set(r.map((y) => y.id)), h = l.filter((y) => y.deletable !== !1), m = u1(f, h);
  for (const y of h)
    p.has(y.id) && !m.find((_) => _.id === y.id) && m.push(y);
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
function kg(t, r, i) {
  const { width: l, height: a } = Xt(i), { x: c, y: f } = i.internals.positionAbsolute;
  return Sr(t, [
    [c, f],
    [c + l, f + a]
  ], r);
}
const bp = (t, r, i) => t < r ? po(Math.abs(t - r), 1, r) / r : t > i ? -po(Math.abs(t - i), 1, r) / r : 0, kc = (t, r, i = 15, l = 40) => {
  const a = bp(t.x, l, r.width - l) * i, c = bp(t.y, l, r.height - l) * i;
  return [a, c];
}, Nl = (t, r) => ({
  x: Math.min(t.x, r.x),
  y: Math.min(t.y, r.y),
  x2: Math.max(t.x2, r.x2),
  y2: Math.max(t.y2, r.y2)
}), rc = ({ x: t, y: r, width: i, height: l }) => ({
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
  const { x: i, y: l } = _c(t) ? t.internals.positionAbsolute : Ci(t, r);
  return {
    x: i,
    y: l,
    width: t.measured?.width ?? t.width ?? t.initialWidth ?? 0,
    height: t.measured?.height ?? t.height ?? t.initialHeight ?? 0
  };
}, ml = (t, r = [0, 0]) => {
  const { x: i, y: l } = _c(t) ? t.internals.positionAbsolute : Ci(t, r);
  return {
    x: i,
    y: l,
    x2: i + (t.measured?.width ?? t.width ?? t.initialWidth ?? 0),
    y2: l + (t.measured?.height ?? t.height ?? t.initialHeight ?? 0)
  };
}, Eg = (t, r) => Ml(Nl(rc(t), rc(r))), Cg = (t, r, i, l, a, c, f, p) => {
  const h = Math.max(0, Math.min(t + i, a + f) - Math.max(t, a)), g = Math.max(0, Math.min(r + l, c + p) - Math.max(r, c));
  return Math.ceil(h * g);
}, yl = (t, r) => Cg(t.x, t.y, t.width, t.height, r.x, r.y, r.width, r.height), Dp = (t) => Vt(t.width) && Vt(t.height) && Vt(t.x) && Vt(t.y), Vt = (t) => !isNaN(t) && isFinite(t), Ng = (t, r) => (i, l) => {
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
function p1(t, r, i) {
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
function h1(t, r, i, l, a, c) {
  const { x: f, y: p } = ho(t, [r, i, l]), { x: h, y: g } = ho({ x: t.x + t.width, y: t.y + t.height }, [r, i, l]), m = a - h, v = c - g;
  return {
    left: Math.floor(f),
    top: Math.floor(p),
    right: Math.floor(m),
    bottom: Math.floor(v)
  };
}
const Ec = (t, r, i, l, a, c) => {
  const f = p1(c, r, i), p = (r - f.x) / t.width, h = (i - f.y) / t.height, g = Math.min(p, h), m = po(g, l, a), v = t.x + t.width / 2, y = t.y + t.height / 2, x = r / 2 - v * m, _ = i / 2 - y * m, M = h1(t, x, _, m, r, i), N = {
    left: Math.min(M.left - f.left, 0),
    top: Math.min(M.top - f.top, 0),
    right: Math.min(M.right - f.right, 0),
    bottom: Math.min(M.bottom - f.bottom, 0)
  };
  return {
    x: x - N.left + N.right,
    y: _ - N.top + N.bottom,
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
function Mg(t) {
  return (t.measured?.width ?? t.width ?? t.initialWidth) !== void 0 && (t.measured?.height ?? t.height ?? t.initialHeight) !== void 0;
}
function zg(t, r = { width: 0, height: 0 }, i, l, a) {
  const c = { ...t }, f = l.get(i);
  if (f) {
    const p = f.origin || a;
    c.x += f.internals.positionAbsolute.x - (r.width ?? 0) * p[0], c.y += f.internals.positionAbsolute.y - (r.height ?? 0) * p[1];
  }
  return c;
}
function Lp(t, r) {
  if (t.size !== r.size)
    return !1;
  for (const i of t)
    if (!r.has(i))
      return !1;
  return !0;
}
function g1() {
  let t, r;
  return { promise: new Promise((l, a) => {
    t = l, r = a;
  }), resolve: t, reject: r };
}
function m1(t) {
  return { ...wg, ...t || {} };
}
function Pg(t) {
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
const Cc = (t) => ({
  width: t.offsetWidth,
  height: t.offsetHeight
}), Ig = (t) => t?.getRootNode?.() || window?.document, y1 = ["INPUT", "SELECT", "TEXTAREA"];
function Tg(t) {
  const r = t.composedPath?.()?.[0] || t.target;
  return r?.nodeType !== 1 ? !1 : y1.includes(r.nodeName) || r.hasAttribute("contenteditable") || !!r.closest(".nokey");
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
      ...Cc(f)
    };
  });
};
function bg({ sourceX: t, sourceY: r, targetX: i, targetY: l, sourceControlX: a, sourceControlY: c, targetControlX: f, targetControlY: p }) {
  const h = t * 0.125 + a * 0.375 + f * 0.375 + i * 0.125, g = r * 0.125 + c * 0.375 + p * 0.375 + l * 0.125, m = Math.abs(h - t), v = Math.abs(g - r);
  return [h, g, m, v];
}
function qs(t, r) {
  return t >= 0 ? 0.5 * t : r * 25 * Math.sqrt(-t);
}
function $p({ pos: t, x1: r, y1: i, x2: l, y2: a, c }) {
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
function Dg({ sourceX: t, sourceY: r, sourcePosition: i = ye.Bottom, targetX: l, targetY: a, targetPosition: c = ye.Top, curvature: f = 0.25 }) {
  const [p, h] = $p({
    pos: i,
    x1: t,
    y1: r,
    x2: l,
    y2: a,
    c: f
  }), [g, m] = $p({
    pos: c,
    x1: l,
    y1: a,
    x2: t,
    y2: r,
    c: f
  }), [v, y, x, _] = bg({
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
    x,
    _
  ];
}
function Lg({ sourceX: t, sourceY: r, targetX: i, targetY: l }) {
  const a = Math.abs(i - t) / 2, c = i < t ? i + a : i - a, f = Math.abs(l - r) / 2, p = l < r ? l + f : l - f;
  return [c, p, a, f];
}
function v1({ sourceNode: t, targetNode: r, selected: i = !1, zIndex: l = 0, elevateOnSelect: a = !1, zIndexMode: c = "basic" }) {
  if (c === "manual")
    return l;
  const f = a && i ? l + 1e3 : l, p = Math.max(t.parentId || a && t.selected ? t.internals.z : 0, r.parentId || a && r.selected ? r.internals.z : 0);
  return f + p;
}
function w1({ sourceNode: t, targetNode: r, width: i, height: l, transform: a }) {
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
const x1 = ({ source: t, sourceHandle: r, target: i, targetHandle: l }) => `xy-edge__${t}${r || ""}-${i}${l || ""}`, _1 = (t, r) => r.some((i) => i.source === t.source && i.target === t.target && (i.sourceHandle === t.sourceHandle || !i.sourceHandle && !t.sourceHandle) && (i.targetHandle === t.targetHandle || !i.targetHandle && !t.targetHandle)), S1 = (t, r, i = {}) => {
  if (!t.source || !t.target)
    return i.onError?.("006", Ut.error006()), r;
  const l = i.getEdgeId || x1;
  let a;
  return _g(t) ? a = { ...t } : a = {
    ...t,
    id: l(t)
  }, _1(a, r) ? r : (a.sourceHandle === null && delete a.sourceHandle, a.targetHandle === null && delete a.targetHandle, r.concat(a));
};
function Og({ sourceX: t, sourceY: r, targetX: i, targetY: l }) {
  const [a, c, f, p] = Lg({
    sourceX: t,
    sourceY: r,
    targetX: i,
    targetY: l
  });
  return [`M ${t},${r}L ${i},${l}`, a, c, f, p];
}
const Ap = {
  [ye.Left]: { x: -1, y: 0 },
  [ye.Right]: { x: 1, y: 0 },
  [ye.Top]: { x: 0, y: -1 },
  [ye.Bottom]: { x: 0, y: 1 }
}, k1 = ({ source: t, sourcePosition: r = ye.Bottom, target: i }) => r === ye.Left || r === ye.Right ? t.x < i.x ? { x: 1, y: 0 } : { x: -1, y: 0 } : t.y < i.y ? { x: 0, y: 1 } : { x: 0, y: -1 }, Hp = (t, r) => Math.sqrt(Math.pow(r.x - t.x, 2) + Math.pow(r.y - t.y, 2)), E1 = (t, r, i) => t.x === r.x && r.x === i.x && (r.y - t.y) * (i.y - r.y) >= 0 || t.y === r.y && r.y === i.y && (r.x - t.x) * (i.x - r.x) >= 0;
function C1({ source: t, sourcePosition: r = ye.Bottom, target: i, targetPosition: l = ye.Top, center: a, offset: c, stepPosition: f }) {
  const p = Ap[r], h = Ap[l], g = { x: t.x + p.x * c, y: t.y + p.y * c }, m = { x: i.x + h.x * c, y: i.y + h.y * c }, v = k1({
    source: g,
    sourcePosition: r,
    target: m
  }), y = v.x !== 0 ? "x" : "y", x = v[y];
  let _ = [], M, N;
  const E = { x: 0, y: 0 }, D = { x: 0, y: 0 }, [, , S, P] = Lg({
    sourceX: t.x,
    sourceY: t.y,
    targetX: i.x,
    targetY: i.y
  });
  if (p[y] * h[y] === -1) {
    y === "x" ? (M = a.x ?? g.x + (m.x - g.x) * f, N = a.y ?? (g.y + m.y) / 2) : (M = a.x ?? (g.x + m.x) / 2, N = a.y ?? g.y + (m.y - g.y) * f);
    const Q = [
      { x: M, y: g.y },
      { x: M, y: m.y }
    ], K = [
      { x: g.x, y: N },
      { x: m.x, y: N }
    ];
    p[y] === x ? _ = y === "x" ? Q : K : _ = y === "x" ? K : Q;
  } else {
    const Q = [{ x: g.x, y: m.y }], K = [{ x: m.x, y: g.y }];
    if (y === "x" ? _ = p.x === x ? K : Q : _ = p.y === x ? Q : K, r === l) {
      const C = Math.abs(t[y] - i[y]);
      if (C <= c) {
        const O = Math.min(c - 1, c - C);
        p[y] === x ? E[y] = (g[y] > t[y] ? -1 : 1) * O : D[y] = (m[y] > i[y] ? -1 : 1) * O;
      }
    }
    if (r !== l) {
      const C = y === "x" ? "y" : "x", O = p[y] === h[C], H = g[C] > m[C], B = g[C] < m[C];
      (p[y] === 1 && (!O && H || O && B) || p[y] !== 1 && (!O && B || O && H)) && (_ = y === "x" ? Q : K);
    }
    const $ = { x: g.x + E.x, y: g.y + E.y }, W = { x: m.x + D.x, y: m.y + D.y }, J = Math.max(Math.abs($.x - _[0].x), Math.abs(W.x - _[0].x)), ee = Math.max(Math.abs($.y - _[0].y), Math.abs(W.y - _[0].y));
    J >= ee ? (M = ($.x + W.x) / 2, N = _[0].y) : (M = _[0].x, N = ($.y + W.y) / 2);
  }
  const V = { x: g.x + E.x, y: g.y + E.y }, b = { x: m.x + D.x, y: m.y + D.y }, F = [];
  for (const Q of [t, V, ..._, b, i]) {
    const [K, $] = F.slice(-2);
    $ && E1(K, $, Q) && F.pop(), F.push(Q);
  }
  return [F, M, N, S, P];
}
function N1(t, r, i, l) {
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
function oc({ sourceX: t, sourceY: r, sourcePosition: i = ye.Bottom, targetX: l, targetY: a, targetPosition: c = ye.Top, borderRadius: f = 5, centerX: p, centerY: h, offset: g = 20, stepPosition: m = 0.5 }) {
  const [v, y, x, _, M] = C1({
    source: { x: t, y: r },
    sourcePosition: i,
    target: { x: l, y: a },
    targetPosition: c,
    center: { x: p, y: h },
    offset: g,
    stepPosition: m
  });
  let N = `M${v[0].x} ${v[0].y}`;
  for (let E = 1; E < v.length - 1; E++)
    N += N1(v[E - 1], v[E], v[E + 1], f);
  return N += `L${v[v.length - 1].x} ${v[v.length - 1].y}`, [N, y, x, _, M];
}
function jp(t) {
  return t && !!(t.internals.handleBounds || t.handles?.length) && !!(t.measured.width || t.width || t.initialWidth);
}
function M1(t) {
  const { sourceNode: r, targetNode: i } = t;
  if (!jp(r) || !jp(i))
    return null;
  const l = r.internals.handleBounds || Fp(r.handles), a = i.internals.handleBounds || Fp(i.handles), c = Vp(l?.source ?? [], t.sourceHandle), f = Vp(
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
function Fp(t) {
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
function Vp(t, r) {
  return t && (r ? t.find((i) => i.id === r) : t[0]) || null;
}
function ic(t, r) {
  return t ? typeof t == "string" ? t : `${r ? `${r}__` : ""}${Object.keys(t).sort().map((l) => `${l}=${t[l]}`).join("&")}` : "";
}
function z1(t, { id: r, defaultColor: i, defaultMarkerStart: l, defaultMarkerEnd: a }) {
  const c = /* @__PURE__ */ new Set();
  return t.reduce((f, p) => ([p.markerStart || l, p.markerEnd || a].forEach((h) => {
    if (h && typeof h == "object") {
      const g = ic(h, r);
      c.has(g) || (f.push({ id: g, color: h.color || i, ...h }), c.add(g));
    }
  }), f), []).sort((f, p) => f.id.localeCompare(p.id));
}
const $g = 1e3, P1 = 10, Nc = {
  nodeOrigin: [0, 0],
  nodeExtent: yi,
  elevateNodesOnSelect: !0,
  zIndexMode: "basic",
  defaults: {}
}, I1 = {
  ...Nc,
  checkEquality: !0
};
function Mc(t, r) {
  const i = { ...t };
  for (const l in r)
    r[l] !== void 0 && (i[l] = r[l]);
  return i;
}
function T1(t, r, i) {
  const l = Mc(Nc, i);
  for (const a of t.values())
    if (a.parentId)
      Pc(a, t, r, l);
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
function zc(t) {
  return t === "manual";
}
function sc(t, r, i, l = {}) {
  const a = Mc(I1, l), c = { i: 0 }, f = new Map(r), p = a?.elevateNodesOnSelect && !zc(a.zIndexMode) ? $g : 0;
  let h = t.length > 0, g = !1;
  r.clear(), i.clear();
  for (const m of t) {
    let v = f.get(m.id);
    if (a.checkEquality && m === v?.internals.userNode)
      r.set(m.id, v);
    else {
      const y = Ci(m, a.nodeOrigin), x = kr(m.extent) ? m.extent : a.nodeExtent, _ = Sr(y, x, Xt(m));
      v = {
        ...a.defaults,
        ...m,
        measured: {
          width: m.measured?.width,
          height: m.measured?.height
        },
        internals: {
          positionAbsolute: _,
          // if user re-initializes the node or removes `measured` for whatever reason, we reset the handleBounds so that the node gets re-measured
          handleBounds: R1(m, v),
          z: Ag(m, p, a.zIndexMode),
          userNode: m
        }
      }, r.set(m.id, v);
    }
    (v.measured === void 0 || v.measured.width === void 0 || v.measured.height === void 0) && !v.hidden && (h = !1), m.parentId && Pc(v, r, i, l, c), g ||= m.selected ?? !1;
  }
  return { nodesInitialized: h, hasSelectedNodes: g };
}
function b1(t, r) {
  if (!t.parentId)
    return;
  const i = r.get(t.parentId);
  i ? i.set(t.id, t) : r.set(t.parentId, /* @__PURE__ */ new Map([[t.id, t]]));
}
function Pc(t, r, i, l, a) {
  const { elevateNodesOnSelect: c, nodeOrigin: f, nodeExtent: p, zIndexMode: h } = Mc(Nc, l), g = t.parentId, m = r.get(g);
  if (!m) {
    console.warn(`Parent node ${g} not found. Please make sure that parent nodes are in front of their child nodes in the nodes array.`);
    return;
  }
  b1(t, i), a && !m.parentId && m.internals.rootParentIndex === void 0 && h === "auto" && (m.internals.rootParentIndex = ++a.i, m.internals.z = m.internals.z + a.i * P1), a && m.internals.rootParentIndex !== void 0 && (a.i = m.internals.rootParentIndex);
  const v = c && !zc(h) ? $g : 0, { x: y, y: x, z: _ } = D1(t, m, f, p, v, h), { positionAbsolute: M } = t.internals, N = y !== M.x || x !== M.y;
  (N || _ !== t.internals.z) && r.set(t.id, {
    ...t,
    internals: {
      ...t.internals,
      positionAbsolute: N ? { x: y, y: x } : M,
      z: _
    }
  });
}
function Ag(t, r, i) {
  const l = Vt(t.zIndex) ? t.zIndex : 0;
  return zc(i) ? l : l + (t.selected ? r : 0);
}
function D1(t, r, i, l, a, c) {
  const { x: f, y: p } = r.internals.positionAbsolute, h = Xt(t), g = Ci(t, i), m = kr(t.extent) ? Sr(g, t.extent, h) : g;
  let v = Sr({ x: f + m.x, y: p + m.y }, l, h);
  t.extent === "parent" && (v = kg(v, h, r));
  const y = Ag(t, a, c), x = r.internals.z ?? 0;
  return {
    x: v.x,
    y: v.y,
    z: x >= y ? x + 1 : y
  };
}
function Ic(t, r, i, l = [0, 0]) {
  const a = [], c = /* @__PURE__ */ new Map();
  for (const f of t) {
    const p = r.get(f.parentId);
    if (!p)
      continue;
    const h = c.get(f.parentId)?.expandedRect ?? wi(p), g = Eg(h, f.rect);
    c.set(f.parentId, { expandedRect: g, parent: p });
  }
  return c.size > 0 && c.forEach(({ expandedRect: f, parent: p }, h) => {
    const g = p.internals.positionAbsolute, m = Xt(p), v = p.origin ?? l, y = f.x < g.x ? Math.round(Math.abs(g.x - f.x)) : 0, x = f.y < g.y ? Math.round(Math.abs(g.y - f.y)) : 0, _ = Math.max(m.width, Math.round(f.width)), M = Math.max(m.height, Math.round(f.height)), N = (_ - m.width) * v[0], E = (M - m.height) * v[1];
    (y > 0 || x > 0 || N || E) && (a.push({
      id: h,
      type: "position",
      position: {
        x: p.position.x - y + N,
        y: p.position.y - x + E
      }
    }), i.get(h)?.forEach((D) => {
      t.some((S) => S.id === D.id) || a.push({
        id: D.id,
        type: "position",
        position: {
          x: D.position.x + y,
          y: D.position.y + x
        }
      });
    })), (m.width < f.width || m.height < f.height || y || x) && a.push({
      id: h,
      type: "dimensions",
      setAttributes: !0,
      dimensions: {
        width: _ + (y ? v[0] * y - N : 0),
        height: M + (x ? v[1] * x - E : 0)
      }
    });
  }), a;
}
function L1(t, r, i, l, a, c, f) {
  const p = l?.querySelector(".xyflow__viewport");
  let h = !1;
  if (!p)
    return { changes: [], updatedInternals: h };
  const g = [], m = window.getComputedStyle(p), { m22: v } = new window.DOMMatrixReadOnly(m.transform), y = [];
  for (const x of t.values()) {
    const _ = r.get(x.id);
    if (!_)
      continue;
    if (_.hidden) {
      r.set(_.id, {
        ..._,
        internals: {
          ..._.internals,
          handleBounds: void 0
        }
      }), h = !0;
      continue;
    }
    const M = Cc(x.nodeElement), N = _.measured.width !== M.width || _.measured.height !== M.height;
    if (!!(M.width && M.height && (N || !_.internals.handleBounds || x.force))) {
      const D = x.nodeElement.getBoundingClientRect(), S = kr(_.extent) ? _.extent : c;
      let { positionAbsolute: P } = _.internals;
      if (_.parentId && _.extent === "parent") {
        const b = r.get(_.parentId);
        b && (P = kg(P, M, b));
      } else S && (P = Sr(P, S, M));
      const V = {
        ..._,
        measured: M,
        internals: {
          ..._.internals,
          positionAbsolute: P,
          handleBounds: {
            source: Op("source", x.nodeElement, D, v, _.id),
            target: Op("target", x.nodeElement, D, v, _.id)
          }
        }
      };
      r.set(_.id, V), _.parentId && Pc(V, r, i, { nodeOrigin: a, zIndexMode: f }), h = !0, N && (g.push({
        id: _.id,
        type: "dimensions",
        dimensions: M
      }), _.expandParent && _.parentId && y.push({
        id: _.id,
        parentId: _.parentId,
        rect: wi(V, a)
      }));
    }
  }
  if (y.length > 0) {
    const x = Ic(y, r, i, a);
    g.push(...x);
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
function Bp(t, r, i, l, a, c) {
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
    Bp("source", h, m, t, a, f), Bp("target", h, g, t, c, p), r.set(l.id, l);
  }
}
function jg(t, r) {
  if (!t.parentId)
    return !1;
  const i = r.get(t.parentId);
  return i ? i.selected ? !0 : jg(i, r) : !1;
}
function Up(t, r, i) {
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
function $1(t, r, i, l, a) {
  const c = /* @__PURE__ */ new Map();
  for (const [f, p] of t)
    if ((a ? p.id === l : p.selected || p.id === l) && (a || !p.parentId || !jg(p, t)) && (p.draggable || r && typeof p.draggable > "u")) {
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
function Hu({ nodeId: t, dragItems: r, nodeLookup: i, dragging: l = !0 }) {
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
function A1({ dragItems: t, snapGrid: r, x: i, y: l }) {
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
  let c = { x: null, y: null }, f = 0, p = /* @__PURE__ */ new Map(), h = !1, g = { x: 0, y: 0 }, m = null, v = !1, y = null, x = !1, _ = !1, M = null;
  function N({ noDragClassName: D, handleSelector: S, domNode: P, isSelectable: V, nodeId: b, nodeClickDistance: F = 0 }) {
    y = kt(P);
    function Q({ x: J, y: ee }) {
      const { nodeLookup: C, nodeExtent: O, snapGrid: H, snapToGrid: B, nodeOrigin: T, onNodeDrag: j, onSelectionDrag: U, onError: k, updateNodePositions: A } = r();
      c = { x: J, y: ee };
      let ie = !1;
      const re = p.size > 1, ae = re && O ? rc(Ni(p)) : null, ce = re && B ? A1({
        dragItems: p,
        snapGrid: H,
        x: J,
        y: ee
      }) : null;
      for (const [ue, q] of p) {
        if (!C.has(ue))
          continue;
        let le = { x: J - q.distance.x, y: ee - q.distance.y };
        B && (le = ce ? {
          x: Math.round(le.x + ce.x),
          y: Math.round(le.y + ce.y)
        } : Mi(le, H));
        let we = null;
        if (re && O && !q.extent && ae) {
          const { positionAbsolute: ve } = q.internals, Ee = ve.x - ae.x + O[0][0], Ce = ve.x + q.measured.width - ae.x2 + O[1][0], ze = ve.y - ae.y + O[0][1], Ve = ve.y + q.measured.height - ae.y2 + O[1][1];
          we = [
            [Ee, ze],
            [Ce, Ve]
          ];
        }
        const { position: Se, positionAbsolute: me } = Sg({
          nodeId: ue,
          nextPosition: le,
          nodeLookup: C,
          nodeExtent: we || O,
          nodeOrigin: T,
          onError: k
        });
        ie = ie || q.position.x !== Se.x || q.position.y !== Se.y, q.position = Se, q.internals.positionAbsolute = me;
      }
      if (_ = _ || ie, !!ie && (A(p, !0), M && (l || j || !b && U))) {
        const [ue, q] = Hu({
          nodeId: b,
          dragItems: p,
          nodeLookup: C
        });
        l?.(M, p, ue, q), j?.(M, ue, q), b || U?.(M, q);
      }
    }
    async function K() {
      if (!m)
        return;
      const { transform: J, panBy: ee, autoPanSpeed: C, autoPanOnNodeDrag: O } = r();
      if (!O) {
        h = !1, cancelAnimationFrame(f);
        return;
      }
      const [H, B] = kc(g, m, C);
      (H !== 0 || B !== 0) && (c.x = (c.x ?? 0) - H / J[2], c.y = (c.y ?? 0) - B / J[2], await ee({ x: H, y: B }) && Q(c)), f = requestAnimationFrame(K);
    }
    function $(J) {
      const { nodeLookup: ee, multiSelectionActive: C, nodesDraggable: O, transform: H, snapGrid: B, snapToGrid: T, selectNodesOnDrag: j, onNodeDragStart: U, onSelectionDragStart: k, unselectNodesAndEdges: A } = r();
      v = !0;
      const ie = !!b && !C && !ee.get(b)?.selected;
      (!j || !V) && !C && b && (ee.get(b)?.selected || A()), V && j && b && t?.(b);
      const re = di(J.sourceEvent, { transform: H, snapGrid: B, snapToGrid: T, containerBounds: m });
      if (c = re, p = $1(ee, O, re, b, ie), p.size > 0 && (i || U || !b && k)) {
        const [ae, ce] = Hu({
          nodeId: b,
          dragItems: p,
          nodeLookup: ee
        });
        i?.(J.sourceEvent, p, ae, ce), U?.(J.sourceEvent, ae, ce), b || k?.(J.sourceEvent, ce);
      }
    }
    const W = Xh().clickDistance(F).on("start", (J) => {
      const { domNode: ee, nodeDragThreshold: C, transform: O, snapGrid: H, snapToGrid: B } = r();
      m = ee?.getBoundingClientRect() || null, x = !1, _ = !1, M = J.sourceEvent, C === 0 && $(J), c = di(J.sourceEvent, { transform: O, snapGrid: H, snapToGrid: B, containerBounds: m }), g = Bt(J.sourceEvent, m);
    }).on("drag", (J) => {
      const { autoPanOnNodeDrag: ee, transform: C, snapGrid: O, snapToGrid: H, nodeDragThreshold: B, nodeLookup: T } = r(), j = di(J.sourceEvent, { transform: C, snapGrid: O, snapToGrid: H, containerBounds: m });
      if (M = J.sourceEvent, (J.sourceEvent.type === "touchmove" && J.sourceEvent.touches.length > 1 || // if user deletes a node while dragging, we need to abort the drag to prevent errors
      b && !T.has(b)) && (x = !0), !x) {
        if (!h && ee && v && (h = !0, K()), !v) {
          const U = Bt(J.sourceEvent, m), k = U.x - g.x, A = U.y - g.y;
          Math.sqrt(k * k + A * A) > B && $(J);
        }
        (c.x !== j.xSnapped || c.y !== j.ySnapped) && p && v && (g = Bt(J.sourceEvent, m), Q(j));
      }
    }).on("end", (J) => {
      if (!v || x) {
        x && p.size > 0 && r().updateNodePositions(p, !1);
        return;
      }
      if (h = !1, v = !1, cancelAnimationFrame(f), p.size > 0) {
        const { nodeLookup: ee, updateNodePositions: C, onNodeDragStop: O, onSelectionDragStop: H } = r();
        if (_ && (C(p, !1), _ = !1), a || O || !b && H) {
          const [B, T] = Hu({
            nodeId: b,
            dragItems: p,
            nodeLookup: ee,
            dragging: !1
          });
          a?.(J.sourceEvent, p, B, T), O?.(J.sourceEvent, B, T), b || H?.(J.sourceEvent, T);
        }
      }
    }).filter((J) => {
      const ee = J.target;
      return !J.button && (!D || !Up(ee, `.${D}`, P)) && (!S || Up(ee, S, P));
    });
    y.call(W);
  }
  function E() {
    y?.on(".drag", null);
  }
  return {
    update: N,
    destroy: E
  };
}
function j1(t, r, i) {
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
const F1 = 250;
function V1(t, r, i, l) {
  let a = [], c = 1 / 0;
  const f = j1(t, i, r + F1);
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
function Fg(t, r, i, l, a, c = !1) {
  const f = l.get(t);
  if (!f)
    return null;
  const p = a === "strict" ? f.internals.handleBounds?.[r] : [...f.internals.handleBounds?.source ?? [], ...f.internals.handleBounds?.target ?? []], h = (i ? p?.find((g) => g.id === i) : p?.[0]) ?? null;
  return h && c ? { ...h, ...Er(f, h, h.position, !0) } : h;
}
function Vg(t, r) {
  return t || (r?.classList.contains("target") ? "target" : r?.classList.contains("source") ? "source" : null);
}
function B1(t, r) {
  let i = null;
  return r ? i = !0 : t && !r && (i = !1), i;
}
const Bg = () => !0;
function U1(t, { connectionMode: r, connectionRadius: i, handleId: l, nodeId: a, edgeUpdaterType: c, isTarget: f, domNode: p, nodeLookup: h, lib: g, autoPanOnConnect: m, flowId: v, panBy: y, cancelConnection: x, onConnectStart: _, onConnect: M, onConnectEnd: N, isValidConnection: E = Bg, onReconnectEnd: D, updateConnection: S, getTransform: P, getFromHandle: V, autoPanSpeed: b, dragThreshold: F = 1, handleDomNode: Q }) {
  const K = Ig(t.target);
  let $ = 0, W;
  const { x: J, y: ee } = Bt(t), C = Vg(c, Q), O = p?.getBoundingClientRect();
  let H = !1;
  if (!O || !C)
    return;
  const B = Fg(a, C, l, h, r);
  if (!B)
    return;
  let T = Bt(t, O), j = !1, U = null, k = !1, A = null;
  function ie() {
    if (!m || !O)
      return;
    const [Se, me] = kc(T, O, b);
    y({ x: Se, y: me }), $ = requestAnimationFrame(ie);
  }
  const re = {
    ...B,
    nodeId: a,
    type: C,
    position: B.position
  }, ae = h.get(a);
  let ue = {
    inProgress: !0,
    isValid: null,
    from: Er(ae, re, ye.Left, !0),
    fromHandle: re,
    fromPosition: re.position,
    fromNode: ae,
    to: T,
    toHandle: null,
    toPosition: Rp[re.position],
    toNode: null,
    pointer: T
  };
  function q() {
    H = !0, S(ue), _?.(t, { nodeId: a, handleId: l, handleType: C });
  }
  F === 0 && q();
  function le(Se) {
    if (!H) {
      const { x: Ve, y: Ct } = Bt(Se), at = Ve - J, et = Ct - ee;
      if (!(at * at + et * et > F * F))
        return;
      q();
    }
    if (!V() || !re) {
      we(Se);
      return;
    }
    const me = P();
    T = Bt(Se, O), W = V1(zi(T, me, !1, [1, 1]), i, h, re), j || (ie(), j = !0);
    const ve = Ug(Se, {
      handle: W,
      connectionMode: r,
      fromNodeId: a,
      fromHandleId: l,
      fromType: f ? "target" : "source",
      isValidConnection: E,
      doc: K,
      lib: g,
      flowId: v,
      nodeLookup: h
    });
    A = ve.handleDomNode, U = ve.connection, k = B1(!!W, ve.isValid);
    const Ee = h.get(a), Ce = Ee ? Er(Ee, re, ye.Left, !0) : ue.from, ze = {
      ...ue,
      from: Ce,
      isValid: k,
      to: ve.toHandle && k ? ho({ x: ve.toHandle.x, y: ve.toHandle.y }, me) : T,
      toHandle: ve.toHandle,
      toPosition: k && ve.toHandle ? ve.toHandle.position : Rp[re.position],
      toNode: ve.toHandle ? h.get(ve.toHandle.nodeId) : null,
      pointer: T
    };
    S(ze), ue = ze;
  }
  function we(Se) {
    if (!("touches" in Se && Se.touches.length > 0)) {
      if (H) {
        (W || A) && U && k && M?.(U);
        const { inProgress: me, ...ve } = ue, Ee = {
          ...ve,
          toPosition: ue.toHandle ? ue.toPosition : null
        };
        N?.(Se, Ee), c && D?.(Se, Ee);
      }
      x(), cancelAnimationFrame($), j = !1, k = !1, U = null, A = null, K.removeEventListener("mousemove", le), K.removeEventListener("mouseup", we), K.removeEventListener("touchmove", le), K.removeEventListener("touchend", we);
    }
  }
  K.addEventListener("mousemove", le), K.addEventListener("mouseup", we), K.addEventListener("touchmove", le), K.addEventListener("touchend", we);
}
function Ug(t, { handle: r, connectionMode: i, fromNodeId: l, fromHandleId: a, fromType: c, doc: f, lib: p, flowId: h, isValidConnection: g = Bg, nodeLookup: m }) {
  const v = c === "target", y = r ? f.querySelector(`.${p}-flow__handle[data-id="${h}-${r?.nodeId}-${r?.id}-${r?.type}"]`) : null, { x, y: _ } = Bt(t), M = f.elementFromPoint(x, _), N = M?.classList.contains(`${p}-flow__handle`) ? M : y, E = {
    handleDomNode: N,
    isValid: !1,
    connection: null,
    toHandle: null
  };
  if (N) {
    const D = Vg(void 0, N), S = N.getAttribute("data-nodeid"), P = N.getAttribute("data-handleid"), V = N.classList.contains("connectable"), b = N.classList.contains("connectableend");
    if (!S || !D)
      return E;
    const F = {
      source: v ? S : l,
      sourceHandle: v ? P : a,
      target: v ? l : S,
      targetHandle: v ? a : P
    };
    E.connection = F;
    const K = V && b && (i === fo.Strict ? v && D === "source" || !v && D === "target" : S !== l || P !== a);
    E.isValid = K && g(F), E.toHandle = Fg(S, D, P, m, i, !0);
  }
  return E;
}
const lc = {
  onPointerDown: U1,
  isValid: Ug
};
function W1({ domNode: t, panZoom: r, getTransform: i, getViewScale: l }) {
  const a = kt(t);
  function c({ translateExtent: p, width: h, height: g, zoomStep: m = 1, pannable: v = !0, zoomable: y = !0, inversePan: x = !1 }) {
    const _ = (S) => {
      if (S.sourceEvent.type !== "wheel" || !r)
        return;
      const P = i(), V = S.sourceEvent.ctrlKey && xi() ? 10 : 1, b = -S.sourceEvent.deltaY * (S.sourceEvent.deltaMode === 1 ? 0.05 : S.sourceEvent.deltaMode ? 1 : 2e-3) * m, F = P[2] * Math.pow(2, b * V);
      r.scaleTo(F);
    };
    let M = [0, 0];
    const N = (S) => {
      (S.sourceEvent.type === "mousedown" || S.sourceEvent.type === "touchstart") && (M = [
        S.sourceEvent.clientX ?? S.sourceEvent.touches[0].clientX,
        S.sourceEvent.clientY ?? S.sourceEvent.touches[0].clientY
      ]);
    }, E = (S) => {
      const P = i();
      if (S.sourceEvent.type !== "mousemove" && S.sourceEvent.type !== "touchmove" || !r)
        return;
      const V = [
        S.sourceEvent.clientX ?? S.sourceEvent.touches[0].clientX,
        S.sourceEvent.clientY ?? S.sourceEvent.touches[0].clientY
      ], b = [V[0] - M[0], V[1] - M[1]];
      M = V;
      const F = l() * Math.max(P[2], Math.log(P[2])) * (x ? -1 : 1), Q = {
        x: P[0] - b[0] * F,
        y: P[1] - b[1] * F
      }, K = [
        [0, 0],
        [h, g]
      ];
      r.setViewportConstrained({
        x: Q.x,
        y: Q.y,
        zoom: P[2]
      }, K, p);
    }, D = yg().on("start", N).on("zoom", v ? E : null).on("zoom.wheel", y ? _ : null);
    a.call(D, {});
  }
  function f() {
    a.on("zoom", null);
  }
  return {
    update: c,
    destroy: f,
    pointer: jt
  };
}
const zl = (t) => ({
  x: t.x,
  y: t.y,
  zoom: t.k
}), ju = ({ x: t, y: r, zoom: i }) => Cl.translate(t, r).scale(i), Un = (t, r) => t.target.closest(`.${r}`), Wg = (t, r) => r === 2 && Array.isArray(t) && t.includes(2), X1 = (t) => ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2, Fu = (t, r = 0, i = X1, l = () => {
}) => {
  const a = typeof r == "number" && r > 0;
  return a || l(), a ? t.transition().duration(r).ease(i).on("end", l) : t;
}, Xg = (t) => {
  const r = t.ctrlKey && xi() ? 10 : 1;
  return -t.deltaY * (t.deltaMode === 1 ? 0.05 : t.deltaMode ? 1 : 2e-3) * r;
};
function Y1({ zoomPanValues: t, noWheelClassName: r, d3Selection: i, d3Zoom: l, panOnScrollMode: a, panOnScrollSpeed: c, zoomOnPinch: f, onPanZoomStart: p, onPanZoom: h, onPanZoomEnd: g }) {
  return (m) => {
    if (Un(m, r))
      return m.ctrlKey && m.preventDefault(), !1;
    m.preventDefault(), m.stopImmediatePropagation();
    const v = i.property("__zoom").k || 1;
    if (m.ctrlKey && f) {
      const N = jt(m), E = Xg(m), D = v * Math.pow(2, E);
      l.scaleTo(i, D, N, m);
      return;
    }
    const y = m.deltaMode === 1 ? 20 : 1;
    let x = a === vr.Vertical ? 0 : m.deltaX * y, _ = a === vr.Horizontal ? 0 : m.deltaY * y;
    !xi() && m.shiftKey && a !== vr.Vertical && (x = m.deltaY * y, _ = 0), l.translateBy(
      i,
      -(x / v) * c,
      -(_ / v) * c,
      // @ts-ignore
      { internal: !0 }
    );
    const M = zl(i.property("__zoom"));
    clearTimeout(t.panScrollTimeout), t.isPanScrolling ? h?.(m, M) : (t.isPanScrolling = !0, p?.(m, M)), t.panScrollTimeout = setTimeout(() => {
      g?.(m, M), t.isPanScrolling = !1;
    }, 150);
  };
}
function Z1({ noWheelClassName: t, preventScrolling: r, d3ZoomHandler: i }) {
  return function(l, a) {
    const c = l.type === "wheel", f = !r && c && !l.ctrlKey, p = Un(l, t);
    if (l.ctrlKey && c && p && l.preventDefault(), f || p)
      return null;
    l.preventDefault(), i.call(this, l, a);
  };
}
function Q1({ zoomPanValues: t, onDraggingChange: r, onPanZoomStart: i }) {
  return (l) => {
    if (l.sourceEvent?.internal)
      return;
    const a = zl(l.transform);
    t.mouseButton = l.sourceEvent?.button || 0, t.isZoomingOrPanning = !0, t.prevViewport = a, l.sourceEvent?.type === "mousedown" && r(!0), i && i?.(l.sourceEvent, a);
  };
}
function K1({ zoomPanValues: t, panOnDrag: r, onPaneContextMenu: i, onTransformChange: l, onPanZoom: a }) {
  return (c) => {
    t.usedRightMouseButton = !!(i && Wg(r, t.mouseButton ?? 0)), c.sourceEvent?.sync || l([c.transform.x, c.transform.y, c.transform.k]), a && !c.sourceEvent?.internal && a?.(c.sourceEvent, zl(c.transform));
  };
}
function G1({ zoomPanValues: t, panOnDrag: r, panOnScroll: i, onDraggingChange: l, onPanZoomEnd: a, onPaneContextMenu: c }) {
  return (f) => {
    if (!f.sourceEvent?.internal && (t.isZoomingOrPanning = !1, c && Wg(r, t.mouseButton ?? 0) && !t.usedRightMouseButton && f.sourceEvent && c(f.sourceEvent), t.usedRightMouseButton = !1, l(!1), a)) {
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
function q1({ panActivationKeyPressed: t, zoomActivationKeyPressed: r, zoomOnScroll: i, zoomOnPinch: l, panOnDrag: a, panOnScroll: c, zoomOnDoubleClick: f, userSelectionActive: p, noWheelClassName: h, noPanClassName: g, lib: m, connectionInProgress: v }) {
  return (y) => {
    const x = r || i, _ = l && y.ctrlKey, M = y.type === "wheel";
    if (y.button === 1 && y.type === "mousedown" && (Un(y, `${m}-flow__node`) || Un(y, `${m}-flow__edge`) || Un(y, `${m}-flow__selection`) || Un(y, `${m}-flow__nodesselection`)))
      return !0;
    if (!a && !x && !c && !f && !l || p || v && !M || Un(y, h) && M || Un(y, g) && (!M || c && M && !r) || !l && y.ctrlKey && M)
      return !1;
    if (!l && y.type === "touchstart" && y.touches?.length > 1)
      return y.preventDefault(), !1;
    if (!x && !c && !_ && M || !a && (y.type === "mousedown" || y.type === "touchstart") || Array.isArray(a) && !a.includes(y.button) && y.type === "mousedown")
      return !1;
    const N = Array.isArray(a) && a.includes(y.button) || !y.button || y.button <= 1;
    return (!y.ctrlKey || M || t) && N;
  };
}
function J1({ domNode: t, minZoom: r, maxZoom: i, translateExtent: l, viewport: a, onPanZoom: c, onPanZoomStart: f, onPanZoomEnd: p, onDraggingChange: h }) {
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
  const y = typeof ResizeObserver < "u" ? new ResizeObserver((ee) => {
    const C = ee[0];
    C?.contentRect && (v = [
      [0, 0],
      [C.contentRect.width, C.contentRect.height]
    ]);
  }) : null;
  y?.observe(t);
  const x = yg().extent(() => v).scaleExtent([r, i]).translateExtent(l), _ = kt(t).call(x);
  P({
    x: a.x,
    y: a.y,
    zoom: po(a.zoom, r, i)
  }, [
    [0, 0],
    [m.width, m.height]
  ], l);
  const M = _.on("wheel.zoom"), N = _.on("dblclick.zoom");
  x.wheelDelta(Xg);
  async function E(ee, C) {
    return _ ? new Promise((O) => {
      x?.interpolate(C?.interpolate === "linear" ? fi : rl).transform(Fu(_, C?.duration, C?.ease, () => O(!0)), ee);
    }) : !1;
  }
  function D({ noWheelClassName: ee, noPanClassName: C, onPaneContextMenu: O, userSelectionActive: H, panOnScroll: B, panOnDrag: T, panOnScrollMode: j, panOnScrollSpeed: U, preventScrolling: k, zoomOnPinch: A, zoomOnScroll: ie, zoomOnDoubleClick: re, panActivationKeyPressed: ae = !1, zoomActivationKeyPressed: ce, lib: ue, onTransformChange: q, connectionInProgress: le, paneClickDistance: we, selectionOnDrag: Se }) {
    H && !g.isZoomingOrPanning && x.on("zoom", null);
    const me = B && !ce && !H;
    x.clickDistance(Se ? 1 / 0 : !Vt(we) || we < 0 ? 0 : we);
    const ve = me ? Y1({
      zoomPanValues: g,
      noWheelClassName: ee,
      d3Selection: _,
      d3Zoom: x,
      panOnScrollMode: j,
      panOnScrollSpeed: U,
      zoomOnPinch: A,
      onPanZoomStart: f,
      onPanZoom: c,
      onPanZoomEnd: p
    }) : Z1({
      noWheelClassName: ee,
      preventScrolling: k,
      d3ZoomHandler: M
    });
    _.on("wheel.zoom", ve, { passive: !1 });
    const Ee = Q1({
      zoomPanValues: g,
      onDraggingChange: h,
      onPanZoomStart: f
    });
    x.on("start", Ee);
    const Ce = K1({
      zoomPanValues: g,
      panOnDrag: T,
      onPaneContextMenu: !!O,
      onPanZoom: c,
      onTransformChange: q
    });
    x.on("zoom", Ce);
    const ze = G1({
      zoomPanValues: g,
      panOnDrag: T,
      panOnScroll: B,
      onPaneContextMenu: O,
      onPanZoomEnd: p,
      onDraggingChange: h
    });
    x.on("end", ze);
    const Ve = q1({
      panActivationKeyPressed: ae,
      zoomActivationKeyPressed: ce,
      panOnDrag: T,
      zoomOnScroll: ie,
      panOnScroll: B,
      zoomOnDoubleClick: re,
      zoomOnPinch: A,
      userSelectionActive: H,
      noPanClassName: C,
      noWheelClassName: ee,
      lib: ue,
      connectionInProgress: le
    });
    x.filter(Ve), re ? _.on("dblclick.zoom", N) : _.on("dblclick.zoom", null);
  }
  function S() {
    x.on("zoom", null), y?.disconnect();
  }
  async function P(ee, C, O) {
    const H = ju(ee), B = x?.constrain()(H, C, O);
    return B && await E(B), B;
  }
  async function V(ee, C) {
    const O = ju(ee);
    return await E(O, C), O;
  }
  function b(ee) {
    if (_) {
      const C = ju(ee), O = _.property("__zoom");
      (O.k !== ee.zoom || O.x !== ee.x || O.y !== ee.y) && x?.transform(_, C, null, { sync: !0 });
    }
  }
  function F() {
    const ee = _ ? mg(_.node()) : { x: 0, y: 0, k: 1 };
    return { x: ee.x, y: ee.y, zoom: ee.k };
  }
  async function Q(ee, C) {
    return _ ? new Promise((O) => {
      x?.interpolate(C?.interpolate === "linear" ? fi : rl).scaleTo(Fu(_, C?.duration, C?.ease, () => O(!0)), ee);
    }) : !1;
  }
  async function K(ee, C) {
    return _ ? new Promise((O) => {
      x?.interpolate(C?.interpolate === "linear" ? fi : rl).scaleBy(Fu(_, C?.duration, C?.ease, () => O(!0)), ee);
    }) : !1;
  }
  function $(ee) {
    x?.scaleExtent(ee);
  }
  function W(ee) {
    x?.translateExtent(ee);
  }
  function J(ee) {
    const C = !Vt(ee) || ee < 0 ? 0 : ee;
    x?.clickDistance(C);
  }
  return {
    update: D,
    destroy: S,
    setViewport: V,
    setViewportConstrained: P,
    getViewport: F,
    scaleTo: Q,
    scaleBy: K,
    setScaleExtent: $,
    setTranslateExtent: W,
    syncViewport: b,
    setClickDistance: J
  };
}
var go;
(function(t) {
  t.Line = "line", t.Handle = "handle";
})(go || (go = {}));
function e_({ width: t, prevWidth: r, height: i, prevHeight: l, affectsX: a, affectsY: c }) {
  const f = t - r, p = i - l, h = [f > 0 ? 1 : f < 0 ? -1 : 0, p > 0 ? 1 : p < 0 ? -1 : 0];
  return f && a && (h[0] = h[0] * -1), p && c && (h[1] = h[1] * -1), h;
}
function Wp(t) {
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
function Xp(t, r) {
  return t ? !r : r;
}
function t_(t, r, i, l, a, c, f, p) {
  let { affectsX: h, affectsY: g } = r;
  const { isHorizontal: m, isVertical: v } = r, y = m && v, { xSnapped: x, ySnapped: _ } = i, { minWidth: M, maxWidth: N, minHeight: E, maxHeight: D } = l, { x: S, y: P, width: V, height: b, aspectRatio: F } = t;
  let Q = Math.floor(m ? x - t.pointerX : 0), K = Math.floor(v ? _ - t.pointerY : 0);
  const $ = V + (h ? -Q : Q), W = b + (g ? -K : K), J = -c[0] * V, ee = -c[1] * b;
  let C = Js($, M, N), O = Js(W, E, D);
  if (f) {
    let T = 0, j = 0;
    h && Q < 0 ? T = Vn(S + Q + J, f[0][0]) : !h && Q > 0 && (T = Bn(S + $ + J, f[1][0])), g && K < 0 ? j = Vn(P + K + ee, f[0][1]) : !g && K > 0 && (j = Bn(P + W + ee, f[1][1])), C = Math.max(C, T), O = Math.max(O, j);
  }
  if (p) {
    let T = 0, j = 0;
    h && Q > 0 ? T = Bn(S + Q, p[0][0]) : !h && Q < 0 && (T = Vn(S + $, p[1][0])), g && K > 0 ? j = Bn(P + K, p[0][1]) : !g && K < 0 && (j = Vn(P + W, p[1][1])), C = Math.max(C, T), O = Math.max(O, j);
  }
  if (a) {
    if (m) {
      const T = Js($ / F, E, D) * F;
      if (C = Math.max(C, T), f) {
        let j = 0;
        !h && !g || h && !g && y ? j = Bn(P + ee + $ / F, f[1][1]) * F : j = Vn(P + ee + (h ? Q : -Q) / F, f[0][1]) * F, C = Math.max(C, j);
      }
      if (p) {
        let j = 0;
        !h && !g || h && !g && y ? j = Vn(P + $ / F, p[1][1]) * F : j = Bn(P + (h ? Q : -Q) / F, p[0][1]) * F, C = Math.max(C, j);
      }
    }
    if (v) {
      const T = Js(W * F, M, N) / F;
      if (O = Math.max(O, T), f) {
        let j = 0;
        !h && !g || g && !h && y ? j = Bn(S + W * F + J, f[1][0]) / F : j = Vn(S + (g ? K : -K) * F + J, f[0][0]) / F, O = Math.max(O, j);
      }
      if (p) {
        let j = 0;
        !h && !g || g && !h && y ? j = Vn(S + W * F, p[1][0]) / F : j = Bn(S + (g ? K : -K) * F, p[0][0]) / F, O = Math.max(O, j);
      }
    }
  }
  K = K + (K < 0 ? O : -O), Q = Q + (Q < 0 ? C : -C), a && (y ? $ > W * F ? K = (Xp(h, g) ? -Q : Q) / F : Q = (Xp(h, g) ? -K : K) * F : m ? (K = Q / F, g = h) : (Q = K * F, h = g));
  const H = h ? S + Q : S, B = g ? P + K : P;
  return {
    width: V + (h ? -Q : Q),
    height: b + (g ? -K : K),
    x: c[0] * Q * (h ? -1 : 1) + H,
    y: c[1] * K * (g ? -1 : 1) + B
  };
}
const Yg = { width: 0, height: 0, x: 0, y: 0 }, n_ = {
  ...Yg,
  pointerX: 0,
  pointerY: 0,
  aspectRatio: 1
};
function r_(t, r, i) {
  const l = r.position.x + t.position.x, a = r.position.y + t.position.y, c = t.measured.width ?? 0, f = t.measured.height ?? 0, p = i[0] * c, h = i[1] * f;
  return [
    [l - p, a - h],
    [l + c - p, a + f - h]
  ];
}
function o_({ domNode: t, nodeId: r, getStoreItems: i, onChange: l, onEnd: a }) {
  const c = kt(t);
  let f = {
    controlDirection: Wp("bottom-right"),
    boundaries: {
      minWidth: 0,
      minHeight: 0,
      maxWidth: Number.MAX_VALUE,
      maxHeight: Number.MAX_VALUE
    },
    resizeDirection: void 0,
    keepAspectRatio: !1
  };
  function p({ controlPosition: g, boundaries: m, keepAspectRatio: v, resizeDirection: y, onResizeStart: x, onResize: _, onResizeEnd: M, shouldResize: N }) {
    let E = { ...Yg }, D = { ...n_ };
    f = {
      boundaries: m,
      resizeDirection: y,
      keepAspectRatio: v,
      controlDirection: Wp(g)
    };
    let S, P = null, V = [], b, F, Q;
    const K = Xh().on("start", ($) => {
      const { nodeLookup: W, transform: J, snapGrid: ee, snapToGrid: C, nodeOrigin: O, paneDomNode: H } = i();
      if (S = W.get(r), !S)
        return;
      P = H?.getBoundingClientRect() ?? null;
      const { xSnapped: B, ySnapped: T } = di($.sourceEvent, {
        transform: J,
        snapGrid: ee,
        snapToGrid: C,
        containerBounds: P
      });
      E = {
        width: S.measured.width ?? 0,
        height: S.measured.height ?? 0,
        x: S.position.x ?? 0,
        y: S.position.y ?? 0
      }, D = {
        ...E,
        pointerX: B,
        pointerY: T,
        aspectRatio: E.width / E.height
      }, b = void 0, F = kr(S.extent) ? S.extent : void 0, S.parentId && (S.extent === "parent" || S.expandParent) && (b = W.get(S.parentId)), b && S.extent === "parent" && (F = [
        [0, 0],
        [b.measured.width, b.measured.height]
      ]), V = [], Q = void 0;
      for (const [j, U] of W)
        if (U.parentId === r && (V.push({
          id: j,
          position: { ...U.position },
          extent: U.extent
        }), U.extent === "parent" || U.expandParent)) {
          const k = r_(U, S, U.origin ?? O);
          Q ? Q = [
            [Math.min(k[0][0], Q[0][0]), Math.min(k[0][1], Q[0][1])],
            [Math.max(k[1][0], Q[1][0]), Math.max(k[1][1], Q[1][1])]
          ] : Q = k;
        }
      x?.($, { ...E });
    }).on("drag", ($) => {
      const { transform: W, snapGrid: J, snapToGrid: ee, nodeOrigin: C } = i(), O = di($.sourceEvent, {
        transform: W,
        snapGrid: J,
        snapToGrid: ee,
        containerBounds: P
      }), H = [];
      if (!S)
        return;
      const { x: B, y: T, width: j, height: U } = E, k = {}, A = S.origin ?? C, { width: ie, height: re, x: ae, y: ce } = t_(D, f.controlDirection, O, f.boundaries, f.keepAspectRatio, A, F, Q), ue = ie !== j, q = re !== U, le = ae !== B && ue, we = ce !== T && q;
      if (!le && !we && !ue && !q)
        return;
      const Se = {
        prevValues: { ...E },
        startX: D.x,
        startY: D.y,
        childNodes: V.map((Ce) => ({
          ...Ce,
          position: { ...Ce.position }
        }))
      };
      if ((le || we || A[0] === 1 || A[1] === 1) && (k.x = le ? ae : E.x, k.y = we ? ce : E.y, E.x = k.x, E.y = k.y, V.length > 0)) {
        const Ce = ae - B, ze = ce - T;
        for (const Ve of V)
          Ve.position = {
            x: Ve.position.x - Ce + A[0] * (ie - j),
            y: Ve.position.y - ze + A[1] * (re - U)
          }, H.push(Ve);
      }
      if ((ue || q) && (k.width = ue && (!f.resizeDirection || f.resizeDirection === "horizontal") ? ie : E.width, k.height = q && (!f.resizeDirection || f.resizeDirection === "vertical") ? re : E.height, E.width = k.width, E.height = k.height), b && S.expandParent) {
        const Ce = A[0] * (k.width ?? 0);
        k.x && k.x < Ce && (E.x = Ce, D.x = D.x - (k.x - Ce));
        const ze = A[1] * (k.height ?? 0);
        k.y && k.y < ze && (E.y = ze, D.y = D.y - (k.y - ze));
      }
      const me = e_({
        width: E.width,
        prevWidth: j,
        height: E.height,
        prevHeight: U,
        affectsX: f.controlDirection.affectsX,
        affectsY: f.controlDirection.affectsY
      }), ve = { ...E, direction: me };
      if (N?.($, ve) === !1) {
        E = Se.prevValues, D.x = Se.startX, D.y = Se.startY, V.forEach((Ce, ze) => {
          Ce.position = Se.childNodes[ze].position;
        });
        return;
      }
      _?.($, ve), l(k, H);
    }).on("end", ($) => {
      M?.($, { ...E }), a?.({ ...E });
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
var Yp;
function i_() {
  if (Yp) return Wu;
  Yp = 1;
  var t = Si();
  function r(v, y) {
    return v === y && (v !== 0 || 1 / v === 1 / y) || v !== v && y !== y;
  }
  var i = typeof Object.is == "function" ? Object.is : r, l = t.useState, a = t.useEffect, c = t.useLayoutEffect, f = t.useDebugValue;
  function p(v, y) {
    var x = y(), _ = l({ inst: { value: x, getSnapshot: y } }), M = _[0].inst, N = _[1];
    return c(
      function() {
        M.value = x, M.getSnapshot = y, h(M) && N({ inst: M });
      },
      [v, x, y]
    ), a(
      function() {
        return h(M) && N({ inst: M }), v(function() {
          h(M) && N({ inst: M });
        });
      },
      [v]
    ), f(x), x;
  }
  function h(v) {
    var y = v.getSnapshot;
    v = v.value;
    try {
      var x = y();
      return !i(v, x);
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
var Zp;
function s_() {
  return Zp || (Zp = 1, Uu.exports = i_()), Uu.exports;
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
var Qp;
function l_() {
  if (Qp) return Bu;
  Qp = 1;
  var t = Si(), r = s_();
  function i(g, m) {
    return g === m && (g !== 0 || 1 / g === 1 / m) || g !== g && m !== m;
  }
  var l = typeof Object.is == "function" ? Object.is : i, a = r.useSyncExternalStore, c = t.useRef, f = t.useEffect, p = t.useMemo, h = t.useDebugValue;
  return Bu.useSyncExternalStoreWithSelector = function(g, m, v, y, x) {
    var _ = c(null);
    if (_.current === null) {
      var M = { hasValue: !1, value: null };
      _.current = M;
    } else M = _.current;
    _ = p(
      function() {
        function E(b) {
          if (!D) {
            if (D = !0, S = b, b = y(b), x !== void 0 && M.hasValue) {
              var F = M.value;
              if (x(F, b))
                return P = F;
            }
            return P = b;
          }
          if (F = P, l(S, b)) return F;
          var Q = y(b);
          return x !== void 0 && x(F, Q) ? (S = b, F) : (S = b, P = Q);
        }
        var D = !1, S, P, V = v === void 0 ? null : v;
        return [
          function() {
            return E(m());
          },
          V === null ? void 0 : function() {
            return E(V());
          }
        ];
      },
      [m, v, y, x]
    );
    var N = a(g, _[0], _[1]);
    return f(
      function() {
        M.hasValue = !0, M.value = N;
      },
      [N]
    ), h(N), N;
  }, Bu;
}
var Kp;
function a_() {
  return Kp || (Kp = 1, Vu.exports = l_()), Vu.exports;
}
var u_ = a_();
const c_ = /* @__PURE__ */ Ph(u_), f_ = {}, Gp = (t) => {
  let r;
  const i = /* @__PURE__ */ new Set(), l = (m, v) => {
    const y = typeof m == "function" ? m(r) : m;
    if (!Object.is(y, r)) {
      const x = r;
      r = v ?? (typeof y != "object" || y === null) ? y : Object.assign({}, r, y), i.forEach((_) => _(r, x));
    }
  }, a = () => r, h = { setState: l, getState: a, getInitialState: () => g, subscribe: (m) => (i.add(m), () => i.delete(m)), destroy: () => {
    (f_ ? "production" : void 0) !== "production" && console.warn(
      "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
    ), i.clear();
  } }, g = r = t(l, a, h);
  return h;
}, d_ = (t) => t ? Gp(t) : Gp, { useDebugValue: p_ } = Sy, { useSyncExternalStoreWithSelector: h_ } = c_, g_ = (t) => t;
function Zg(t, r = g_, i) {
  const l = h_(
    t.subscribe,
    t.getState,
    t.getServerState || t.getInitialState,
    r,
    i
  );
  return p_(l), l;
}
const qp = (t, r) => {
  const i = d_(t), l = (a, c = r) => Zg(i, a, c);
  return Object.assign(l, i), l;
}, m_ = (t, r) => t ? qp(t, r) : qp;
function je(t, r) {
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
Ih();
const Pl = Y.createContext(null), y_ = Pl.Provider, Qg = Ut.error001("react");
function Me(t, r) {
  const i = Y.useContext(Pl);
  if (i === null)
    throw new Error(Qg);
  return Zg(i, t, r);
}
function be() {
  const t = Y.useContext(Pl);
  if (t === null)
    throw new Error(Qg);
  return Y.useMemo(() => ({
    getState: t.getState,
    setState: t.setState,
    subscribe: t.subscribe
  }), [t]);
}
const Jp = { display: "none" }, v_ = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  border: 0,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0px, 0px, 0px, 0px)",
  clipPath: "inset(100%)"
}, Kg = "react-flow__node-desc", Gg = "react-flow__edge-desc", w_ = "react-flow__aria-live", x_ = (t) => t.ariaLiveMessage, __ = (t) => t.ariaLabelConfig;
function S_({ rfId: t }) {
  const r = Me(x_);
  return R.jsx("div", { id: `${w_}-${t}`, "aria-live": "assertive", "aria-atomic": "true", style: v_, children: r });
}
function k_({ rfId: t, disableKeyboardA11y: r }) {
  const i = Me(__);
  return R.jsxs(R.Fragment, { children: [R.jsx("div", { id: `${Kg}-${t}`, style: Jp, children: r ? i["node.a11yDescription.default"] : i["node.a11yDescription.keyboardDisabled"] }), R.jsx("div", { id: `${Gg}-${t}`, style: Jp, children: i["edge.a11yDescription.default"] }), !r && R.jsx(S_, { rfId: t })] });
}
const Il = Y.forwardRef(({ position: t = "top-left", children: r, className: i, style: l, ...a }, c) => {
  const f = `${t}`.split("-");
  return R.jsx("div", { className: We(["react-flow__panel", i, ...f]), style: l, ref: c, ...a, children: r });
});
Il.displayName = "Panel";
const eh = "https://reactflow.dev?utm_source=attribution";
function E_({ proOptions: t, position: r = "bottom-right" }) {
  return Y.useEffect(() => {
  }, []), t?.hideAttribution ? null : R.jsx(Il, { position: r, className: "react-flow__attribution", "data-message": `Please only hide this attribution when you are subscribed to React Flow Pro: ${eh}`, children: R.jsx("a", { href: eh, target: "_blank", rel: "noopener noreferrer", "aria-label": "React Flow attribution", children: "React Flow" }) });
}
const C_ = (t) => {
  const r = [], i = [];
  for (const [, l] of t.nodeLookup)
    l.selected && r.push(l.internals.userNode);
  for (const [, l] of t.edgeLookup)
    l.selected && i.push(l);
  return { selectedNodes: r, selectedEdges: i };
}, el = (t) => t.id;
function N_(t, r) {
  return je(t.selectedNodes.map(el), r.selectedNodes.map(el)) && je(t.selectedEdges.map(el), r.selectedEdges.map(el));
}
function M_({ onSelectionChange: t }) {
  const r = be(), { selectedNodes: i, selectedEdges: l } = Me(C_, N_);
  return Y.useEffect(() => {
    const a = { nodes: i, edges: l };
    t?.(a), r.getState().onSelectionChangeHandlers.forEach((c) => c(a));
  }, [i, l, t]), null;
}
const z_ = (t) => !!t.onSelectionChangeHandlers;
function P_({ onSelectionChange: t }) {
  const r = Me(z_);
  return t || r ? R.jsx(M_, { onSelectionChange: t }) : null;
}
const qg = [0, 0], I_ = { x: 0, y: 0, zoom: 1 }, T_ = [
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
], th = [...T_, "rfId"], R_ = (t) => ({
  setNodes: t.setNodes,
  setEdges: t.setEdges,
  setMinZoom: t.setMinZoom,
  setMaxZoom: t.setMaxZoom,
  setTranslateExtent: t.setTranslateExtent,
  setNodeExtent: t.setNodeExtent,
  reset: t.reset,
  setDefaultNodesAndEdges: t.setDefaultNodesAndEdges
}), nh = {
  /*
   * these are values that are also passed directly to other components
   * than the StoreUpdater. We can reduce the number of setStore calls
   * by setting the same values here as prev fields.
   */
  translateExtent: yi,
  nodeOrigin: qg,
  minZoom: 0.5,
  maxZoom: 2,
  elementsSelectable: !0,
  noPanClassName: "nopan",
  rfId: "1"
};
function b_(t) {
  const { setNodes: r, setEdges: i, setMinZoom: l, setMaxZoom: a, setTranslateExtent: c, setNodeExtent: f, reset: p, setDefaultNodesAndEdges: h } = Me(R_, je), g = be();
  Y.useEffect(() => (h(t.defaultNodes, t.defaultEdges), () => {
    m.current = nh, p();
  }), []);
  const m = Y.useRef(nh);
  return Y.useEffect(
    () => {
      for (const v of th) {
        const y = t[v], x = m.current[v];
        y !== x && (typeof t[v] > "u" || (v === "nodes" ? r(y) : v === "edges" ? i(y) : v === "minZoom" ? l(y) : v === "maxZoom" ? a(y) : v === "translateExtent" ? c(y) : v === "nodeExtent" ? f(y) : v === "ariaLabelConfig" ? g.setState({ ariaLabelConfig: m1(y) }) : v === "fitView" ? g.setState({ fitViewQueued: y }) : v === "fitViewOptions" ? g.setState({ fitViewOptions: y }) : g.setState({ [v]: y })));
      }
      m.current = t;
    },
    // Only re-run the effect if one of the fields we track changes
    th.map((v) => t[v])
  ), null;
}
function rh() {
  return typeof window > "u" || !window.matchMedia ? null : window.matchMedia("(prefers-color-scheme: dark)");
}
function D_(t) {
  const [r, i] = Y.useState(t === "system" ? null : t);
  return Y.useEffect(() => {
    if (t !== "system") {
      i(t);
      return;
    }
    const l = rh(), a = () => i(l?.matches ? "dark" : "light");
    return a(), l?.addEventListener("change", a), () => {
      l?.removeEventListener("change", a);
    };
  }, [t]), r !== null ? r : rh()?.matches ? "dark" : "light";
}
const oh = typeof document < "u" ? document : null;
function _i(t = null, r = { target: oh, actInsideInputWithModifier: !0 }) {
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
    const h = r?.target ?? oh, g = r?.actInsideInputWithModifier ?? !0;
    if (t !== null) {
      const m = (x) => {
        if (a.current = x.ctrlKey || x.metaKey || x.shiftKey || x.altKey, (!a.current || a.current && !g) && Tg(x))
          return !1;
        const M = sh(x.code, p);
        if (c.current.add(x[M]), ih(f, c.current, !1)) {
          const N = x.composedPath?.()?.[0] || x.target, E = N?.nodeName === "BUTTON" || N?.nodeName === "A";
          r.preventDefault !== !1 && (a.current || !E) && x.preventDefault(), l(!0);
        }
      }, v = (x) => {
        const _ = sh(x.code, p);
        ih(f, c.current, !0) ? (l(!1), c.current.clear()) : c.current.delete(x[_]), x.key === "Meta" && c.current.clear(), a.current = !1;
      }, y = () => {
        c.current.clear(), l(!1);
      };
      return h?.addEventListener("keydown", m), h?.addEventListener("keyup", v), window.addEventListener("blur", y), window.addEventListener("contextmenu", y), () => {
        h?.removeEventListener("keydown", m), h?.removeEventListener("keyup", v), window.removeEventListener("blur", y), window.removeEventListener("contextmenu", y);
      };
    }
  }, [t, l]), i;
}
function ih(t, r, i) {
  return t.filter((l) => i || l.length === r.size).some((l) => l.every((a) => r.has(a)));
}
function sh(t, r) {
  return r.includes(t) ? "code" : "key";
}
const L_ = () => {
  const t = be();
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
      const { width: l, height: a, minZoom: c, maxZoom: f, panZoom: p } = t.getState(), h = Ec(r, l, a, c, f, i?.padding ?? 0.1);
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
function Jg(t, r) {
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
function Tc(t, r) {
  return Jg(t, r);
}
function em(t, r) {
  return Jg(t, r);
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
function lh({ items: t = [], lookup: r }) {
  const i = [], l = new Map(t.map((a) => [a.id, a]));
  for (const [a, c] of t.entries()) {
    const f = r.get(c.id), p = f?.internals?.userNode ?? f;
    p !== void 0 && p !== c && i.push({ id: c.id, item: c, type: "replace" }), p === void 0 && i.push({ item: c, type: "add", index: a });
  }
  for (const [a] of r)
    l.get(a) === void 0 && i.push({ id: a, type: "remove" });
  return i;
}
function ah(t) {
  return {
    id: t.id,
    type: "remove"
  };
}
const $_ = Ng();
function A_(t, r, i = {}) {
  return S1(t, r, {
    ...i,
    onError: i.onError ?? $_
  });
}
const uh = (t) => l1(t), H_ = (t) => _g(t);
function tm(t) {
  return Y.forwardRef(t);
}
const nm = typeof window < "u" ? Y.useLayoutEffect : Y.useEffect;
function ch(t) {
  const [r, i] = Y.useState(BigInt(0)), [l] = Y.useState(() => j_(() => i((a) => a + BigInt(1))));
  return nm(() => {
    const a = l.get();
    a.length && (t(a), l.reset());
  }, [r]), l;
}
function j_(t) {
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
const rm = Y.createContext(null);
function F_({ children: t }) {
  const r = be(), i = Y.useCallback((p) => {
    const { nodes: h = [], setNodes: g, hasDefaultNodes: m, onNodesChange: v, nodeLookup: y, fitViewQueued: x, onNodesChangeMiddlewareMap: _ } = r.getState();
    let M = h;
    for (const E of p)
      M = typeof E == "function" ? E(M) : E;
    let N = lh({
      items: M,
      lookup: y
    });
    for (const E of _.values())
      N = E(N);
    m && g(M), N.length > 0 ? v?.(N) : x && window.requestAnimationFrame(() => {
      const { fitViewQueued: E, nodes: D, setNodes: S } = r.getState();
      E && S(D);
    });
  }, []), l = ch(i), a = Y.useCallback((p) => {
    const { edges: h = [], setEdges: g, hasDefaultEdges: m, onEdgesChange: v, edgeLookup: y } = r.getState();
    let x = h;
    for (const _ of p)
      x = typeof _ == "function" ? _(x) : _;
    m ? g(x) : v && v(lh({
      items: x,
      lookup: y
    }));
  }, []), c = ch(a), f = Y.useMemo(() => ({ nodeQueue: l, edgeQueue: c }), []);
  return R.jsx(rm.Provider, { value: f, children: t });
}
function V_() {
  const t = Y.useContext(rm);
  if (!t)
    throw new Error("useBatchContext must be used within a BatchProvider");
  return t;
}
const B_ = (t) => !!t.panZoom;
function Tl() {
  const t = L_(), r = be(), i = V_(), l = Me(B_), a = Y.useMemo(() => {
    const c = (v) => r.getState().nodeLookup.get(v), f = (v) => {
      i.nodeQueue.push(v);
    }, p = (v) => {
      i.edgeQueue.push(v);
    }, h = (v) => {
      const { nodeLookup: y, nodeOrigin: x } = r.getState(), _ = uh(v) ? v : y.get(v.id), M = _.parentId ? zg(_.position, _.measured, _.parentId, y, x) : _.position, N = {
        ..._,
        position: M,
        width: _.measured?.width ?? _.width,
        height: _.measured?.height ?? _.height
      };
      return wi(N, _.parentId ? void 0 : x);
    }, g = (v, y, x = { replace: !1 }) => {
      f((_) => _.map((M) => {
        if (M.id === v) {
          const N = typeof y == "function" ? y(M) : y;
          return x.replace && uh(N) ? N : { ...M, ...N };
        }
        return M;
      }));
    }, m = (v, y, x = { replace: !1 }) => {
      p((_) => _.map((M) => {
        if (M.id === v) {
          const N = typeof y == "function" ? y(M) : y;
          return x.replace && H_(N) ? N : { ...M, ...N };
        }
        return M;
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
        i.nodeQueue.push((x) => [...x, ...y]);
      },
      addEdges: (v) => {
        const y = Array.isArray(v) ? v : [v];
        i.edgeQueue.push((x) => [...x, ...y]);
      },
      toObject: () => {
        const { nodes: v = [], edges: y = [], transform: x } = r.getState(), [_, M, N] = x;
        return {
          nodes: v.map((E) => ({ ...E })),
          edges: y.map((E) => ({ ...E })),
          viewport: {
            x: _,
            y: M,
            zoom: N
          }
        };
      },
      deleteElements: async ({ nodes: v = [], edges: y = [] }) => {
        const { nodes: x, edges: _, onNodesDelete: M, onEdgesDelete: N, triggerNodeChanges: E, triggerEdgeChanges: D, onDelete: S, onBeforeDelete: P } = r.getState(), { nodes: V, edges: b } = await d1({
          nodesToRemove: v,
          edgesToRemove: y,
          nodes: x,
          edges: _,
          onBeforeDelete: P
        }), F = b.length > 0, Q = V.length > 0;
        if (F) {
          const K = b.map(ah);
          N?.(b), D(K);
        }
        if (Q) {
          const K = V.map(ah);
          M?.(V), E(K);
        }
        return (Q || F) && S?.({ nodes: V, edges: b }), { deletedNodes: V, deletedEdges: b };
      },
      /**
       * Partial is defined as "the 2 nodes/areas are intersecting partially".
       * If a is contained in b or b is contained in a, they are both
       * considered fully intersecting.
       */
      getIntersectingNodes: (v, y = !0, x) => {
        const _ = Dp(v), M = _ ? v : h(v), N = x !== void 0;
        if (!M)
          return [];
        const { nodeOrigin: E } = r.getState();
        return (x || r.getState().nodes).filter((D) => {
          const S = r.getState().nodeLookup.get(D.id);
          if (S && !_ && (D.id === v.id || !S.internals.positionAbsolute))
            return !1;
          const P = wi(N ? D : S, E), V = yl(P, M);
          return y && V > 0 || V >= P.width * P.height || V >= M.width * M.height;
        });
      },
      isNodeIntersecting: (v, y, x = !0) => {
        const M = Dp(v) ? v : h(v);
        if (!M)
          return !1;
        const N = yl(M, y);
        return x && N > 0 || N >= y.width * y.height || N >= M.width * M.height;
      },
      updateNode: g,
      updateNodeData: (v, y, x = { replace: !1 }) => {
        g(v, (_) => {
          const M = typeof y == "function" ? y(_) : y;
          return x.replace ? { ..._, data: M } : { ..._, data: { ..._.data, ...M } };
        }, x);
      },
      updateEdge: m,
      updateEdgeData: (v, y, x = { replace: !1 }) => {
        m(v, (_) => {
          const M = typeof y == "function" ? y(_) : y;
          return x.replace ? { ..._, data: M } : { ..._, data: { ..._.data, ...M } };
        }, x);
      },
      getNodesBounds: (v) => {
        const { nodeLookup: y, nodeOrigin: x } = r.getState();
        return a1(v, { nodeLookup: y, nodeOrigin: x });
      },
      getHandleConnections: ({ type: v, id: y, nodeId: x }) => Array.from(r.getState().connectionLookup.get(`${x}-${v}${y ? `-${y}` : ""}`)?.values() ?? []),
      getNodeConnections: ({ type: v, handleId: y, nodeId: x }) => Array.from(r.getState().connectionLookup.get(`${x}${v ? y ? `-${v}-${y}` : `-${v}` : ""}`)?.values() ?? []),
      fitView: async (v) => {
        const y = r.getState().fitViewResolver ?? g1();
        return r.setState({ fitViewQueued: !0, fitViewOptions: v, fitViewResolver: y }), i.nodeQueue.push((x) => [...x]), y.promise;
      }
    };
  }, []);
  return Y.useMemo(() => ({
    ...a,
    ...t,
    viewportInitialized: l
  }), [l]);
}
const fh = (t) => t.selected, U_ = typeof window < "u" ? window : void 0;
function W_({ deleteKeyCode: t, multiSelectionKeyCode: r }) {
  const i = be(), { deleteElements: l } = Tl(), a = _i(t, { actInsideInputWithModifier: !1 }), c = _i(r, { target: U_ });
  Y.useEffect(() => {
    if (a) {
      const { edges: f, nodes: p } = i.getState();
      l({ nodes: p.filter(fh), edges: f.filter(fh) }), i.setState({ nodesSelectionActive: !1 });
    }
  }, [a]), Y.useEffect(() => {
    i.setState({ multiSelectionActive: c });
  }, [c]);
}
function X_(t) {
  const r = be();
  Y.useEffect(() => {
    const i = () => {
      if (!t.current || !(t.current.checkVisibility?.() ?? !0))
        return !1;
      const l = Cc(t.current);
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
const Rl = {
  position: "absolute",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0
}, Y_ = (t) => ({
  userSelectionActive: t.userSelectionActive,
  lib: t.lib,
  connectionInProgress: t.connection.inProgress
});
function Z_({ onPaneContextMenu: t, zoomOnScroll: r = !0, zoomOnPinch: i = !0, panOnScroll: l = !1, panActivationKeyPressed: a, panOnScrollSpeed: c = 0.5, panOnScrollMode: f = vr.Free, zoomOnDoubleClick: p = !0, panOnDrag: h = !0, defaultViewport: g, translateExtent: m, minZoom: v, maxZoom: y, zoomActivationKeyCode: x, preventScrolling: _ = !0, children: M, noWheelClassName: N, noPanClassName: E, onViewportChange: D, isControlledViewport: S, paneClickDistance: P, selectionOnDrag: V }) {
  const b = be(), F = Y.useRef(null), { userSelectionActive: Q, lib: K, connectionInProgress: $ } = Me(Y_, je), W = _i(x), J = Y.useRef();
  X_(F);
  const ee = Y.useCallback((C) => {
    D?.({ x: C[0], y: C[1], zoom: C[2] }), S || b.setState({ transform: C });
  }, [D, S]);
  return Y.useEffect(() => {
    if (F.current) {
      J.current = J1({
        domNode: F.current,
        minZoom: v,
        maxZoom: y,
        translateExtent: m,
        viewport: g,
        onDraggingChange: (B) => b.setState((T) => T.paneDragging === B ? T : { paneDragging: B }),
        onPanZoomStart: (B, T) => {
          const { onViewportChangeStart: j, onMoveStart: U } = b.getState();
          U?.(B, T), j?.(T);
        },
        onPanZoom: (B, T) => {
          const { onViewportChange: j, onMove: U } = b.getState();
          U?.(B, T), j?.(T);
        },
        onPanZoomEnd: (B, T) => {
          const { onViewportChangeEnd: j, onMoveEnd: U } = b.getState();
          U?.(B, T), j?.(T);
        }
      });
      const { x: C, y: O, zoom: H } = J.current.getViewport();
      return b.setState({
        panZoom: J.current,
        transform: [C, O, H],
        domNode: F.current.closest(".react-flow")
      }), () => {
        J.current?.destroy();
      };
    }
  }, []), Y.useEffect(() => {
    J.current?.update({
      onPaneContextMenu: t,
      zoomOnScroll: r,
      zoomOnPinch: i,
      panOnScroll: l,
      panActivationKeyPressed: a,
      panOnScrollSpeed: c,
      panOnScrollMode: f,
      zoomOnDoubleClick: p,
      panOnDrag: h,
      zoomActivationKeyPressed: W,
      preventScrolling: _,
      noPanClassName: E,
      userSelectionActive: Q,
      noWheelClassName: N,
      lib: K,
      onTransformChange: ee,
      connectionInProgress: $,
      selectionOnDrag: V,
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
    W,
    _,
    E,
    Q,
    N,
    K,
    ee,
    $,
    V,
    P
  ]), R.jsx("div", { className: "react-flow__renderer", ref: F, style: Rl, children: M });
}
const Q_ = (t) => ({
  userSelectionActive: t.userSelectionActive,
  userSelectionRect: t.userSelectionRect
});
function K_() {
  const { userSelectionActive: t, userSelectionRect: r } = Me(Q_, je);
  return t && r ? R.jsx("div", { className: "react-flow__selection react-flow__container", style: {
    width: r.width,
    height: r.height,
    transform: `translate(${r.x}px, ${r.y}px)`
  } }) : null;
}
const Xu = (t, r) => (i) => {
  i.target === r.current && t?.(i);
}, G_ = (t) => ({
  userSelectionActive: t.userSelectionActive,
  elementsSelectable: t.elementsSelectable,
  dragging: t.paneDragging,
  panBy: t.panBy,
  autoPanSpeed: t.autoPanSpeed
});
function q_({ isSelecting: t, selectionKeyPressed: r, selectionMode: i = vi.Full, panOnDrag: l, autoPanOnSelection: a, paneClickDistance: c, selectionOnDrag: f, onSelectionStart: p, onSelectionEnd: h, onPaneClick: g, onPaneContextMenu: m, onPaneScroll: v, onPaneMouseEnter: y, onPaneMouseMove: x, onPaneMouseLeave: _, children: M }) {
  const N = Y.useRef(0), E = be(), { userSelectionActive: D, elementsSelectable: S, dragging: P, panBy: V, autoPanSpeed: b } = Me(G_, je), F = S && (t || D), Q = Y.useRef(null), K = Y.useRef(), $ = Y.useRef(/* @__PURE__ */ new Set()), W = Y.useRef(/* @__PURE__ */ new Set()), J = Y.useRef(!1), ee = Y.useRef(!1), C = Y.useRef({ x: 0, y: 0 }), O = Y.useRef(!1), H = (q) => {
    if (ee.current || J.current || E.getState().connection.inProgress) {
      ee.current = !1, J.current = !1;
      return;
    }
    const { connectionClickStartHandle: le, connection: we, onClickConnectEnd: Se, resetSelectedElements: me } = E.getState();
    if (le) {
      const ve = structuredClone(we);
      delete ve.inProgress, ve.toPosition = ve.toHandle ? ve.toHandle.position : null, Se?.(q.nativeEvent, ve), E.setState({ connectionClickStartHandle: null });
    }
    g?.(q), me(), E.setState({ nodesSelectionActive: !1 });
  }, B = (q) => {
    if (Array.isArray(l) && l?.includes(2)) {
      q.preventDefault();
      return;
    }
    m?.(q);
  }, T = v ? (q) => v(q) : void 0, j = (q) => {
    ee.current && (q.stopPropagation(), ee.current = !1);
  }, U = (q) => {
    if (q.pointerType === "touch" && l !== !1 && !r)
      return;
    const { domNode: le, transform: we } = E.getState();
    if (K.current = le?.getBoundingClientRect(), !K.current)
      return;
    const Se = q.target === Q.current;
    if (!Se && !!q.target.closest(".nokey") || !t || !(f && Se || r) || q.button !== 0 || !q.isPrimary)
      return;
    q.target?.setPointerCapture?.(q.pointerId), ee.current = !1;
    const { x: Ee, y: Ce } = Bt(q.nativeEvent, K.current), ze = zi({ x: Ee, y: Ce }, we);
    E.setState({
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
  function k(q, le) {
    const { userSelectionRect: we } = E.getState();
    if (!we)
      return;
    const { transform: Se, nodeLookup: me, edgeLookup: ve, connectionLookup: Ee, triggerNodeChanges: Ce, triggerEdgeChanges: ze, defaultEdgeOptions: Ve } = E.getState(), Ct = { x: we.startX, y: we.startY }, { x: at, y: et } = ho(Ct, Se), tt = {
      startX: Ct.x,
      startY: Ct.y,
      x: q < at ? q : at,
      y: le < et ? le : et,
      width: Math.abs(q - at),
      height: Math.abs(le - et)
    }, on = $.current, Yt = W.current;
    $.current = new Set(Sc(me, tt, Se, i === vi.Partial, !0).map((ut) => ut.id)), W.current = /* @__PURE__ */ new Set();
    const Zt = Ve?.selectable ?? !0;
    for (const ut of $.current) {
      const Nt = Ee.get(ut);
      if (Nt)
        for (const { edgeId: mt } of Nt.values()) {
          const Mt = ve.get(mt);
          Mt && (Mt.selectable ?? Zt) && W.current.add(mt);
        }
    }
    if (!Lp(on, $.current)) {
      const ut = no(me, $.current);
      Ce(ut);
    }
    if (!Lp(Yt, W.current)) {
      const ut = no(ve, W.current);
      ze(ut);
    }
    E.setState({
      userSelectionRect: tt,
      userSelectionActive: !0,
      nodesSelectionActive: !1
    });
  }
  function A() {
    if (!a || !K.current)
      return;
    const [q, le] = kc(C.current, K.current, b);
    V({ x: q, y: le }).then((we) => {
      if (!ee.current || !we) {
        N.current = requestAnimationFrame(A);
        return;
      }
      const { x: Se, y: me } = C.current;
      k(Se, me), N.current = requestAnimationFrame(A);
    });
  }
  const ie = () => {
    cancelAnimationFrame(N.current), N.current = 0, O.current = !1;
  };
  Y.useEffect(() => () => ie(), []);
  const re = (q) => {
    const { userSelectionRect: le, transform: we, resetSelectedElements: Se } = E.getState();
    if (!K.current || !le)
      return;
    const { x: me, y: ve } = Bt(q.nativeEvent, K.current);
    C.current = { x: me, y: ve };
    const Ee = ho({ x: le.startX, y: le.startY }, we);
    if (!ee.current) {
      const Ce = r ? 0 : c;
      if (Math.hypot(me - Ee.x, ve - Ee.y) <= Ce)
        return;
      Se(), p?.(q);
    }
    ee.current = !0, O.current || (A(), O.current = !0), k(me, ve);
  }, ae = (q) => {
    if (!F) {
      q.target === Q.current && E.getState().connection.inProgress && (J.current = !0);
      return;
    }
    q.button === 0 && (q.target?.releasePointerCapture?.(q.pointerId), !D && q.target === Q.current && E.getState().userSelectionRect && H?.(q), E.setState({
      userSelectionActive: !1,
      userSelectionRect: null
    }), ee.current && (h?.(q), E.setState({
      nodesSelectionActive: $.current.size > 0
    })), ie());
  }, ce = (q) => {
    q.target?.releasePointerCapture?.(q.pointerId), ie();
  }, ue = l === !0 || Array.isArray(l) && l.includes(0);
  return R.jsxs("div", { className: We(["react-flow__pane", { draggable: ue, dragging: P, selection: t }]), onClick: F ? void 0 : Xu(H, Q), onContextMenu: Xu(B, Q), onWheel: Xu(T, Q), onPointerEnter: F ? void 0 : y, onPointerMove: F ? re : x, onPointerUp: ae, onPointerCancel: F ? ce : void 0, onPointerDownCapture: F ? U : void 0, onClickCapture: F ? j : void 0, onPointerLeave: _, ref: Q, style: Rl, children: [M, R.jsx(K_, {})] });
}
function ac({ id: t, store: r, unselect: i = !1, nodeRef: l }) {
  const { addSelectedNodes: a, unselectNodesAndEdges: c, multiSelectionActive: f, nodeLookup: p, onError: h } = r.getState(), g = p.get(t);
  if (!g) {
    h?.("012", Ut.error012(t));
    return;
  }
  r.setState({ nodesSelectionActive: !1 }), g.selected ? (i || g.selected && f) && (c({ nodes: [g], edges: [] }), requestAnimationFrame(() => l?.current?.blur())) : a([t]);
}
function om({ nodeRef: t, disabled: r = !1, noDragClassName: i, handleSelector: l, nodeId: a, isSelectable: c, nodeClickDistance: f }) {
  const p = be(), [h, g] = Y.useState(!1), m = Y.useRef();
  return Y.useEffect(() => {
    if (!r)
      return m.current = H1({
        getStoreItems: () => p.getState(),
        onNodeMouseDown: (v) => {
          ac({
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
const J_ = (t) => (r) => r.selected && (r.draggable || t && typeof r.draggable > "u");
function im() {
  const t = be();
  return Y.useCallback((i) => {
    const { nodeExtent: l, snapToGrid: a, snapGrid: c, nodesDraggable: f, onError: p, updateNodePositions: h, nodeLookup: g, nodeOrigin: m } = t.getState(), v = /* @__PURE__ */ new Map(), y = J_(f), x = a ? c[0] : 5, _ = a ? c[1] : 5, M = i.direction.x * x * i.factor, N = i.direction.y * _ * i.factor;
    for (const [, E] of g) {
      if (!y(E))
        continue;
      let D = {
        x: E.internals.positionAbsolute.x + M,
        y: E.internals.positionAbsolute.y + N
      };
      a && (D = Mi(D, c));
      const { position: S, positionAbsolute: P } = Sg({
        nodeId: E.id,
        nextPosition: D,
        nodeLookup: g,
        nodeExtent: l,
        nodeOrigin: m,
        onError: p
      });
      E.position = S, E.internals.positionAbsolute = P, v.set(E.id, E);
    }
    h(v);
  }, []);
}
const Rc = Y.createContext(null), eS = Rc.Provider;
Rc.Consumer;
const sm = () => Y.useContext(Rc), tS = (t) => ({
  connectOnClick: t.connectOnClick,
  noPanClassName: t.noPanClassName,
  rfId: t.rfId
}), lm = Y.createContext(null);
function nS({ children: t }) {
  const r = Me(tS, je);
  return R.jsx(lm.Provider, { value: r, children: t });
}
function rS() {
  const t = Y.useContext(lm);
  if (!t)
    throw new Error("useHandleConfig must be used within a HandleConfigProvider");
  return t;
}
const oS = {
  connectingFrom: !1,
  connectingTo: !1,
  clickConnecting: !1,
  isPossibleEndHandle: !0,
  connectionInProcess: !1,
  clickConnectionInProcess: !1,
  valid: !1
}, iS = (t, r, i) => (l) => {
  const { connectionClickStartHandle: a, connectionMode: c, connection: f } = l, { fromHandle: p, toHandle: h, isValid: g } = f;
  if (!p && !a)
    return oS;
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
function sS({ type: t = "source", position: r = ye.Top, isValidConnection: i, isConnectable: l = !0, isConnectableStart: a = !0, isConnectableEnd: c = !0, id: f, onConnect: p, children: h, className: g, onMouseDown: m, onTouchStart: v, ...y }, x) {
  const _ = f || null, M = t === "target", N = be(), E = sm(), { connectOnClick: D, noPanClassName: S, rfId: P } = rS(), { connectingFrom: V, connectingTo: b, clickConnecting: F, isPossibleEndHandle: Q, connectionInProcess: K, clickConnectionInProcess: $, valid: W } = Me(iS(E, _, t), je);
  E || N.getState().onError?.("010", Ut.error010());
  const J = (O) => {
    const { defaultEdgeOptions: H, onConnect: B, hasDefaultEdges: T } = N.getState(), j = {
      ...H,
      ...O
    };
    if (T) {
      const { edges: U, setEdges: k, onError: A } = N.getState();
      k(A_(j, U, { onError: A }));
    }
    B?.(j), p?.(j);
  }, ee = (O) => {
    if (!E)
      return;
    const H = Rg(O.nativeEvent);
    if (a && (H && O.button === 0 || !H)) {
      const B = N.getState();
      lc.onPointerDown(O.nativeEvent, {
        handleDomNode: O.currentTarget,
        autoPanOnConnect: B.autoPanOnConnect,
        connectionMode: B.connectionMode,
        connectionRadius: B.connectionRadius,
        domNode: B.domNode,
        nodeLookup: B.nodeLookup,
        lib: B.lib,
        isTarget: M,
        handleId: _,
        nodeId: E,
        flowId: B.rfId,
        panBy: B.panBy,
        cancelConnection: B.cancelConnection,
        onConnectStart: B.onConnectStart,
        onConnectEnd: (...T) => N.getState().onConnectEnd?.(...T),
        updateConnection: B.updateConnection,
        onConnect: J,
        isValidConnection: i || ((...T) => N.getState().isValidConnection?.(...T) ?? !0),
        getTransform: () => N.getState().transform,
        getFromHandle: () => N.getState().connection.fromHandle,
        autoPanSpeed: B.autoPanSpeed,
        dragThreshold: B.connectionDragThreshold
      });
    }
    H ? m?.(O) : v?.(O);
  }, C = (O) => {
    const { onClickConnectStart: H, onClickConnectEnd: B, connectionClickStartHandle: T, connectionMode: j, isValidConnection: U, lib: k, rfId: A, nodeLookup: ie, connection: re } = N.getState();
    if (!E || !T && !a)
      return;
    if (!T) {
      H?.(O.nativeEvent, { nodeId: E, handleId: _, handleType: t }), N.setState({ connectionClickStartHandle: { nodeId: E, type: t, id: _ } });
      return;
    }
    const ae = Ig(O.target), ce = i || U, { connection: ue, isValid: q } = lc.isValid(O.nativeEvent, {
      handle: {
        nodeId: E,
        id: _,
        type: t
      },
      connectionMode: j,
      fromNodeId: T.nodeId,
      fromHandleId: T.id || null,
      fromType: T.type,
      isValidConnection: ce,
      flowId: A,
      doc: ae,
      lib: k,
      nodeLookup: ie
    });
    q && ue && J(ue);
    const le = structuredClone(re);
    delete le.inProgress, le.toPosition = le.toHandle ? le.toHandle.position : null, B?.(O, le), N.setState({ connectionClickStartHandle: null });
  };
  return R.jsx("div", { "data-handleid": _, "data-nodeid": E, "data-handlepos": r, "data-id": `${P}-${E}-${_}-${t}`, className: We([
    "react-flow__handle",
    `react-flow__handle-${r}`,
    "nodrag",
    S,
    g,
    {
      source: !M,
      target: M,
      connectable: l,
      connectablestart: a,
      connectableend: c,
      clickconnecting: F,
      connectingfrom: V,
      connectingto: b,
      valid: W,
      /*
       * shows where you can start a connection from
       * and where you can end it while connecting
       */
      connectionindicator: l && (!K || Q) && (K || $ ? c : a)
    }
  ]), onMouseDown: ee, onTouchStart: ee, onClick: D ? C : void 0, ref: x, ...y, children: h });
}
const xn = Y.memo(tm(sS));
function lS({ data: t, isConnectable: r, sourcePosition: i = ye.Bottom }) {
  return R.jsxs(R.Fragment, { children: [t?.label, R.jsx(xn, { type: "source", position: i, isConnectable: r })] });
}
function aS({ data: t, isConnectable: r, targetPosition: i = ye.Top, sourcePosition: l = ye.Bottom }) {
  return R.jsxs(R.Fragment, { children: [R.jsx(xn, { type: "target", position: i, isConnectable: r }), t?.label, R.jsx(xn, { type: "source", position: l, isConnectable: r })] });
}
function uS() {
  return null;
}
function cS({ data: t, isConnectable: r, targetPosition: i = ye.Top }) {
  return R.jsxs(R.Fragment, { children: [R.jsx(xn, { type: "target", position: i, isConnectable: r }), t?.label] });
}
const vl = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
}, dh = {
  input: lS,
  default: aS,
  output: cS,
  group: uS
};
function fS(t) {
  return t.internals.handleBounds === void 0 ? {
    width: t.width ?? t.initialWidth ?? t.style?.width,
    height: t.height ?? t.initialHeight ?? t.style?.height
  } : {
    width: t.width ?? t.style?.width,
    height: t.height ?? t.style?.height
  };
}
const dS = (t) => {
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
function pS({ onSelectionContextMenu: t, noPanClassName: r, disableKeyboardA11y: i }) {
  const l = be(), { width: a, height: c, transformString: f, userSelectionActive: p } = Me(dS, je), h = im(), g = Y.useRef(null);
  Y.useEffect(() => {
    i || g.current?.focus({
      preventScroll: !0
    });
  }, [i]);
  const m = !p && a !== null && c !== null;
  if (om({
    nodeRef: g,
    disabled: !m
  }), !m)
    return null;
  const v = t ? (x) => {
    const _ = l.getState().nodes.filter((M) => M.selected);
    t(x, _);
  } : void 0, y = (x) => {
    Object.prototype.hasOwnProperty.call(vl, x.key) && (x.preventDefault(), h({
      direction: vl[x.key],
      factor: x.shiftKey ? 4 : 1
    }));
  };
  return R.jsx("div", { className: We(["react-flow__nodesselection", "react-flow__container", r]), style: {
    transform: f
  }, children: R.jsx("div", { ref: g, className: "react-flow__nodesselection-rect", onContextMenu: v, tabIndex: i ? void 0 : -1, onKeyDown: i ? void 0 : y, style: {
    width: a,
    height: c
  } }) });
}
const ph = typeof window < "u" ? window : void 0, hS = (t) => ({ nodesSelectionActive: t.nodesSelectionActive, userSelectionActive: t.userSelectionActive });
function am({ children: t, onPaneClick: r, onPaneMouseEnter: i, onPaneMouseMove: l, onPaneMouseLeave: a, onPaneContextMenu: c, onPaneScroll: f, paneClickDistance: p, deleteKeyCode: h, selectionKeyCode: g, selectionOnDrag: m, selectionMode: v, onSelectionStart: y, onSelectionEnd: x, multiSelectionKeyCode: _, panActivationKeyCode: M, zoomActivationKeyCode: N, elementsSelectable: E, zoomOnScroll: D, zoomOnPinch: S, panOnScroll: P, panOnScrollSpeed: V, panOnScrollMode: b, zoomOnDoubleClick: F, panOnDrag: Q, autoPanOnSelection: K, defaultViewport: $, translateExtent: W, minZoom: J, maxZoom: ee, preventScrolling: C, onSelectionContextMenu: O, noWheelClassName: H, noPanClassName: B, disableKeyboardA11y: T, onViewportChange: j, isControlledViewport: U }) {
  const { nodesSelectionActive: k, userSelectionActive: A } = Me(hS, je), ie = _i(g, { target: ph }), re = _i(M, { target: ph }), ae = re || Q, ce = re || P, ue = m && ae !== !0, q = ie || A || ue;
  return W_({ deleteKeyCode: h, multiSelectionKeyCode: _ }), R.jsx(Z_, { onPaneContextMenu: c, elementsSelectable: E, zoomOnScroll: D, zoomOnPinch: S, panOnScroll: ce, panActivationKeyPressed: re, panOnScrollSpeed: V, panOnScrollMode: b, zoomOnDoubleClick: F, panOnDrag: !ie && ae, defaultViewport: $, translateExtent: W, minZoom: J, maxZoom: ee, zoomActivationKeyCode: N, preventScrolling: C, noWheelClassName: H, noPanClassName: B, onViewportChange: j, isControlledViewport: U, paneClickDistance: p, selectionOnDrag: ue, children: R.jsxs(q_, { onSelectionStart: y, onSelectionEnd: x, onPaneClick: r, onPaneMouseEnter: i, onPaneMouseMove: l, onPaneMouseLeave: a, onPaneContextMenu: c, onPaneScroll: f, panOnDrag: ae, autoPanOnSelection: K, isSelecting: !!q, selectionMode: v, selectionKeyPressed: ie, paneClickDistance: p, selectionOnDrag: ue, children: [t, k && R.jsx(pS, { onSelectionContextMenu: O, noPanClassName: B, disableKeyboardA11y: T })] }) });
}
am.displayName = "FlowRenderer";
const gS = Y.memo(am), mS = (t) => (r) => t ? Sc(r.nodeLookup, { x: 0, y: 0, width: r.width, height: r.height }, r.transform, !0).map((i) => i.id) : Array.from(r.nodeLookup.keys());
function yS(t) {
  return Me(Y.useCallback(mS(t), [t]), je);
}
const vS = (t) => t.updateNodeInternals;
function wS() {
  const t = Me(vS), [r] = Y.useState(() => typeof ResizeObserver > "u" ? null : new ResizeObserver((i) => {
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
function xS({ node: t, nodeType: r, hasDimensions: i, resizeObserver: l }) {
  const a = be(), c = Y.useRef(null), f = Y.useRef(null), p = Y.useRef(t.sourcePosition), h = Y.useRef(t.targetPosition), g = Y.useRef(r), m = i && !!t.internals.handleBounds;
  return Y.useEffect(() => {
    c.current && !t.hidden && (!m || f.current !== c.current) && (f.current && l?.unobserve(f.current), l?.observe(c.current), f.current = c.current);
  }, [m, t.hidden]), Y.useEffect(() => () => {
    f.current && (l?.unobserve(f.current), f.current = null);
  }, []), Y.useEffect(() => {
    if (c.current) {
      const v = g.current !== r, y = p.current !== t.sourcePosition, x = h.current !== t.targetPosition;
      (v || y || x) && (g.current = r, p.current = t.sourcePosition, h.current = t.targetPosition, a.getState().updateNodeInternals(/* @__PURE__ */ new Map([[t.id, { id: t.id, nodeElement: c.current, force: !0 }]])));
    }
  }, [t.id, r, t.sourcePosition, t.targetPosition]), c;
}
function _S({ id: t, onClick: r, onMouseEnter: i, onMouseMove: l, onMouseLeave: a, onContextMenu: c, onDoubleClick: f, nodesDraggable: p, elementsSelectable: h, nodesConnectable: g, nodesFocusable: m, resizeObserver: v, noDragClassName: y, noPanClassName: x, disableKeyboardA11y: _, rfId: M, nodeTypes: N, nodeClickDistance: E, onError: D }) {
  const { node: S, internals: P, isParent: V } = Me((q) => {
    const le = q.nodeLookup.get(t), we = q.parentLookup.has(t);
    return {
      node: le,
      internals: le.internals,
      isParent: we
    };
  }, je);
  let b = S.type || "default", F = N?.[b] || dh[b];
  F === void 0 && (D?.("003", Ut.error003(b)), b = "default", F = N?.default || dh.default);
  const Q = !!(S.draggable || p && typeof S.draggable > "u"), K = !!(S.selectable || h && typeof S.selectable > "u"), $ = !!(S.connectable || g && typeof S.connectable > "u"), W = !!(S.focusable || m && typeof S.focusable > "u"), J = be(), ee = Mg(S), C = xS({ node: S, nodeType: b, hasDimensions: ee, resizeObserver: v }), O = om({
    nodeRef: C,
    disabled: S.hidden || !Q,
    noDragClassName: y,
    handleSelector: S.dragHandle,
    nodeId: t,
    isSelectable: K,
    nodeClickDistance: E
  }), H = im();
  if (S.hidden)
    return null;
  const B = Xt(S), T = fS(S), j = K || Q || r || i || l || a, U = i ? (q) => i(q, { ...P.userNode }) : void 0, k = l ? (q) => l(q, { ...P.userNode }) : void 0, A = a ? (q) => a(q, { ...P.userNode }) : void 0, ie = c ? (q) => c(q, { ...P.userNode }) : void 0, re = f ? (q) => f(q, { ...P.userNode }) : void 0, ae = (q) => {
    const { selectNodesOnDrag: le, nodeDragThreshold: we } = J.getState();
    K && (!le || !Q || we > 0) && ac({
      id: t,
      store: J,
      nodeRef: C
    }), r && r(q, { ...P.userNode });
  }, ce = (q) => {
    if (!(Tg(q.nativeEvent) || _)) {
      if (vg.includes(q.key) && K) {
        const le = q.key === "Escape";
        ac({
          id: t,
          store: J,
          unselect: le,
          nodeRef: C
        });
      } else if (Q && S.selected && Object.prototype.hasOwnProperty.call(vl, q.key)) {
        q.preventDefault();
        const { ariaLabelConfig: le } = J.getState();
        J.setState({
          ariaLiveMessage: le["node.a11yDescription.ariaLiveMessage"]({
            direction: q.key.replace("Arrow", "").toLowerCase(),
            x: ~~P.positionAbsolute.x,
            y: ~~P.positionAbsolute.y
          })
        }), H({
          direction: vl[q.key],
          factor: q.shiftKey ? 4 : 1
        });
      }
    }
  }, ue = () => {
    if (_ || !C.current?.matches(":focus-visible"))
      return;
    const { transform: q, width: le, height: we, autoPanOnNodeFocus: Se, setCenter: me } = J.getState();
    if (!Se)
      return;
    Sc(/* @__PURE__ */ new Map([[t, S]]), { x: 0, y: 0, width: le, height: we }, q, !0).length > 0 || me(S.position.x + B.width / 2, S.position.y + B.height / 2, {
      zoom: q[2]
    });
  };
  return R.jsx("div", { className: We([
    "react-flow__node",
    `react-flow__node-${b}`,
    {
      // this is overwritable by passing `nopan` as a class name
      [x]: Q
    },
    S.className,
    {
      selected: S.selected,
      selectable: K,
      parent: V,
      draggable: Q,
      dragging: O
    }
  ]), ref: C, style: {
    zIndex: P.z,
    transform: `translate(${P.positionAbsolute.x}px,${P.positionAbsolute.y}px)`,
    pointerEvents: j ? "all" : "none",
    visibility: ee ? "visible" : "hidden",
    ...S.style,
    ...T
  }, "data-id": t, "data-testid": `rf__node-${t}`, onMouseEnter: U, onMouseMove: k, onMouseLeave: A, onContextMenu: ie, onClick: ae, onDoubleClick: re, onKeyDown: W ? ce : void 0, tabIndex: W ? 0 : void 0, onFocus: W ? ue : void 0, role: S.ariaRole ?? (W ? "group" : void 0), "aria-roledescription": "node", "aria-describedby": _ ? void 0 : `${Kg}-${M}`, "aria-label": S.ariaLabel, ...S.domAttributes, children: R.jsx(eS, { value: t, children: R.jsx(F, { id: t, data: S.data, type: b, positionAbsoluteX: P.positionAbsolute.x, positionAbsoluteY: P.positionAbsolute.y, selected: S.selected ?? !1, selectable: K, draggable: Q, deletable: S.deletable ?? !0, isConnectable: $, sourcePosition: S.sourcePosition, targetPosition: S.targetPosition, dragging: O, dragHandle: S.dragHandle, zIndex: P.z, parentId: S.parentId, ...B }) }) });
}
var SS = Y.memo(_S);
const kS = (t) => ({
  nodesConnectable: t.nodesConnectable,
  nodesFocusable: t.nodesFocusable,
  elementsSelectable: t.elementsSelectable,
  onError: t.onError
});
function um(t) {
  const { nodesConnectable: r, nodesFocusable: i, elementsSelectable: l, onError: a } = Me(kS, je), c = yS(t.onlyRenderVisibleElements), f = wS();
  return R.jsx("div", { className: "react-flow__nodes", style: Rl, children: c.map((p) => (
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
    R.jsx(SS, { id: p, nodeTypes: t.nodeTypes, nodeExtent: t.nodeExtent, onClick: t.onNodeClick, onMouseEnter: t.onNodeMouseEnter, onMouseMove: t.onNodeMouseMove, onMouseLeave: t.onNodeMouseLeave, onContextMenu: t.onNodeContextMenu, onDoubleClick: t.onNodeDoubleClick, noDragClassName: t.noDragClassName, noPanClassName: t.noPanClassName, rfId: t.rfId, disableKeyboardA11y: t.disableKeyboardA11y, resizeObserver: f, nodesDraggable: t.nodesDraggable ?? !0, nodesConnectable: r, nodesFocusable: i, elementsSelectable: l, nodeClickDistance: t.nodeClickDistance, onError: a }, p)
  )) });
}
um.displayName = "NodeRenderer";
const ES = Y.memo(um);
function CS(t) {
  return Me(Y.useCallback((i) => {
    if (!t)
      return i.edges.map((a) => a.id);
    const l = [];
    if (i.width && i.height)
      for (const a of i.edges) {
        const c = i.nodeLookup.get(a.source), f = i.nodeLookup.get(a.target);
        c && f && w1({
          sourceNode: c,
          targetNode: f,
          width: i.width,
          height: i.height,
          transform: i.transform
        }) && l.push(a.id);
      }
    return l;
  }, [t]), je);
}
const NS = ({ color: t = "none", strokeWidth: r = 1 }) => {
  const i = {
    strokeWidth: r,
    ...t && { stroke: t }
  };
  return R.jsx("polyline", { className: "arrow", style: i, strokeLinecap: "round", fill: "none", strokeLinejoin: "round", points: "-5,-4 0,0 -5,4" });
}, MS = ({ color: t = "none", strokeWidth: r = 1 }) => {
  const i = {
    strokeWidth: r,
    ...t && { stroke: t, fill: t }
  };
  return R.jsx("polyline", { className: "arrowclosed", style: i, strokeLinecap: "round", strokeLinejoin: "round", points: "-5,-4 0,0 -5,4 -5,-4" });
}, hh = {
  [gl.Arrow]: NS,
  [gl.ArrowClosed]: MS
};
function zS(t) {
  const r = be();
  return Y.useMemo(() => Object.prototype.hasOwnProperty.call(hh, t) ? hh[t] : (r.getState().onError?.("009", Ut.error009(t)), null), [t]);
}
const PS = ({ id: t, type: r, color: i, width: l = 12.5, height: a = 12.5, markerUnits: c = "strokeWidth", strokeWidth: f, orient: p = "auto-start-reverse" }) => {
  const h = zS(r);
  return h ? R.jsx("marker", { className: "react-flow__arrowhead", id: t, markerWidth: `${l}`, markerHeight: `${a}`, viewBox: "-10 -10 20 20", markerUnits: c, orient: p, refX: "0", refY: "0", children: R.jsx(h, { color: i, strokeWidth: f }) }) : null;
}, cm = ({ defaultColor: t, rfId: r }) => {
  const i = Me((c) => c.edges), l = Me((c) => c.defaultEdgeOptions), a = Y.useMemo(() => z1(i, {
    id: r,
    defaultColor: t,
    defaultMarkerStart: l?.markerStart,
    defaultMarkerEnd: l?.markerEnd
  }), [i, l, r, t]);
  return a.length ? R.jsx("svg", { className: "react-flow__marker", "aria-hidden": "true", children: R.jsx("defs", { children: a.map((c) => R.jsx(PS, { id: c.id, type: c.type, color: c.color, width: c.width, height: c.height, markerUnits: c.markerUnits, strokeWidth: c.strokeWidth, orient: c.orient }, c.id)) }) }) : null;
};
cm.displayName = "MarkerDefinitions";
var IS = Y.memo(cm);
function fm({ x: t, y: r, label: i, labelStyle: l, labelShowBg: a = !0, labelBgStyle: c, labelBgPadding: f = [2, 4], labelBgBorderRadius: p = 2, children: h, className: g, ...m }) {
  const [v, y] = Y.useState({ x: 1, y: 0, width: 0, height: 0 }), x = We(["react-flow__edge-textwrapper", g]), _ = Y.useRef(null);
  return Y.useEffect(() => {
    if (_.current) {
      const M = _.current.getBBox();
      y({
        x: M.x,
        y: M.y,
        width: M.width,
        height: M.height
      });
    }
  }, [i]), i ? R.jsxs("g", { transform: `translate(${t - v.width / 2} ${r - v.height / 2})`, className: x, visibility: v.width ? "visible" : "hidden", ...m, children: [a && R.jsx("rect", { width: v.width + 2 * f[0], x: -f[0], y: -f[1], height: v.height + 2 * f[1], className: "react-flow__edge-textbg", style: c, rx: p, ry: p }), R.jsx("text", { className: "react-flow__edge-text", y: v.height / 2, dy: "0.3em", ref: _, style: l, children: i }), h] }) : null;
}
fm.displayName = "EdgeText";
const TS = Y.memo(fm);
function bl({ path: t, labelX: r, labelY: i, label: l, labelStyle: a, labelShowBg: c, labelBgStyle: f, labelBgPadding: p, labelBgBorderRadius: h, interactionWidth: g = 20, ...m }) {
  return R.jsxs(R.Fragment, { children: [R.jsx("path", { ...m, d: t, fill: "none", className: We(["react-flow__edge-path", m.className]) }), g ? R.jsx("path", { d: t, fill: "none", strokeOpacity: 0, strokeWidth: g, className: "react-flow__edge-interaction" }) : null, l && Vt(r) && Vt(i) ? R.jsx(TS, { x: r, y: i, label: l, labelStyle: a, labelShowBg: c, labelBgStyle: f, labelBgPadding: p, labelBgBorderRadius: h }) : null] });
}
function gh({ pos: t, x1: r, y1: i, x2: l, y2: a }) {
  return t === ye.Left || t === ye.Right ? [0.5 * (r + l), i] : [r, 0.5 * (i + a)];
}
function dm({ sourceX: t, sourceY: r, sourcePosition: i = ye.Bottom, targetX: l, targetY: a, targetPosition: c = ye.Top }) {
  const [f, p] = gh({
    pos: i,
    x1: t,
    y1: r,
    x2: l,
    y2: a
  }), [h, g] = gh({
    pos: c,
    x1: l,
    y1: a,
    x2: t,
    y2: r
  }), [m, v, y, x] = bg({
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
    x
  ];
}
function pm(t) {
  return Y.memo(({ id: r, sourceX: i, sourceY: l, targetX: a, targetY: c, sourcePosition: f, targetPosition: p, label: h, labelStyle: g, labelShowBg: m, labelBgStyle: v, labelBgPadding: y, labelBgBorderRadius: x, style: _, markerEnd: M, markerStart: N, interactionWidth: E }) => {
    const [D, S, P] = dm({
      sourceX: i,
      sourceY: l,
      sourcePosition: f,
      targetX: a,
      targetY: c,
      targetPosition: p
    }), V = t.isInternal ? void 0 : r;
    return R.jsx(bl, { id: V, path: D, labelX: S, labelY: P, label: h, labelStyle: g, labelShowBg: m, labelBgStyle: v, labelBgPadding: y, labelBgBorderRadius: x, style: _, markerEnd: M, markerStart: N, interactionWidth: E });
  });
}
const RS = pm({ isInternal: !1 }), hm = pm({ isInternal: !0 });
RS.displayName = "SimpleBezierEdge";
hm.displayName = "SimpleBezierEdgeInternal";
function gm(t) {
  return Y.memo(({ id: r, sourceX: i, sourceY: l, targetX: a, targetY: c, label: f, labelStyle: p, labelShowBg: h, labelBgStyle: g, labelBgPadding: m, labelBgBorderRadius: v, style: y, sourcePosition: x = ye.Bottom, targetPosition: _ = ye.Top, markerEnd: M, markerStart: N, pathOptions: E, interactionWidth: D }) => {
    const [S, P, V] = oc({
      sourceX: i,
      sourceY: l,
      sourcePosition: x,
      targetX: a,
      targetY: c,
      targetPosition: _,
      borderRadius: E?.borderRadius,
      offset: E?.offset,
      stepPosition: E?.stepPosition
    }), b = t.isInternal ? void 0 : r;
    return R.jsx(bl, { id: b, path: S, labelX: P, labelY: V, label: f, labelStyle: p, labelShowBg: h, labelBgStyle: g, labelBgPadding: m, labelBgBorderRadius: v, style: y, markerEnd: M, markerStart: N, interactionWidth: D });
  });
}
const mm = gm({ isInternal: !1 }), ym = gm({ isInternal: !0 });
mm.displayName = "SmoothStepEdge";
ym.displayName = "SmoothStepEdgeInternal";
function vm(t) {
  return Y.memo(({ id: r, ...i }) => {
    const l = t.isInternal ? void 0 : r;
    return R.jsx(mm, { ...i, id: l, pathOptions: Y.useMemo(() => ({ borderRadius: 0, offset: i.pathOptions?.offset }), [i.pathOptions?.offset]) });
  });
}
const bS = vm({ isInternal: !1 }), wm = vm({ isInternal: !0 });
bS.displayName = "StepEdge";
wm.displayName = "StepEdgeInternal";
function xm(t) {
  return Y.memo(({ id: r, sourceX: i, sourceY: l, targetX: a, targetY: c, label: f, labelStyle: p, labelShowBg: h, labelBgStyle: g, labelBgPadding: m, labelBgBorderRadius: v, style: y, markerEnd: x, markerStart: _, interactionWidth: M }) => {
    const [N, E, D] = Og({ sourceX: i, sourceY: l, targetX: a, targetY: c }), S = t.isInternal ? void 0 : r;
    return R.jsx(bl, { id: S, path: N, labelX: E, labelY: D, label: f, labelStyle: p, labelShowBg: h, labelBgStyle: g, labelBgPadding: m, labelBgBorderRadius: v, style: y, markerEnd: x, markerStart: _, interactionWidth: M });
  });
}
const DS = xm({ isInternal: !1 }), _m = xm({ isInternal: !0 });
DS.displayName = "StraightEdge";
_m.displayName = "StraightEdgeInternal";
function Sm(t) {
  return Y.memo(({ id: r, sourceX: i, sourceY: l, targetX: a, targetY: c, sourcePosition: f = ye.Bottom, targetPosition: p = ye.Top, label: h, labelStyle: g, labelShowBg: m, labelBgStyle: v, labelBgPadding: y, labelBgBorderRadius: x, style: _, markerEnd: M, markerStart: N, pathOptions: E, interactionWidth: D }) => {
    const [S, P, V] = Dg({
      sourceX: i,
      sourceY: l,
      sourcePosition: f,
      targetX: a,
      targetY: c,
      targetPosition: p,
      curvature: E?.curvature
    }), b = t.isInternal ? void 0 : r;
    return R.jsx(bl, { id: b, path: S, labelX: P, labelY: V, label: h, labelStyle: g, labelShowBg: m, labelBgStyle: v, labelBgPadding: y, labelBgBorderRadius: x, style: _, markerEnd: M, markerStart: N, interactionWidth: D });
  });
}
const LS = Sm({ isInternal: !1 }), km = Sm({ isInternal: !0 });
LS.displayName = "BezierEdge";
km.displayName = "BezierEdgeInternal";
const mh = {
  default: km,
  straight: _m,
  step: wm,
  smoothstep: ym,
  simplebezier: hm
}, yh = {
  sourceX: null,
  sourceY: null,
  targetX: null,
  targetY: null,
  sourcePosition: null,
  targetPosition: null,
  zIndex: void 0
}, OS = (t, r, i) => i === ye.Left ? t - r : i === ye.Right ? t + r : t, $S = (t, r, i) => i === ye.Top ? t - r : i === ye.Bottom ? t + r : t, vh = "react-flow__edgeupdater";
function wh({ position: t, centerX: r, centerY: i, radius: l = 10, onMouseDown: a, onMouseEnter: c, onMouseOut: f, type: p }) {
  return R.jsx("circle", { onMouseDown: a, onMouseEnter: c, onMouseOut: f, className: We([vh, `${vh}-${p}`]), cx: OS(r, l, t), cy: $S(i, l, t), r: l, stroke: "transparent", fill: "transparent" });
}
function AS({ isReconnectable: t, reconnectRadius: r, edge: i, sourceX: l, sourceY: a, targetX: c, targetY: f, sourcePosition: p, targetPosition: h, onReconnect: g, onReconnectStart: m, onReconnectEnd: v, setReconnecting: y, setUpdateHover: x }) {
  const _ = be(), M = (P, V) => {
    if (P.button !== 0)
      return;
    const { autoPanOnConnect: b, domNode: F, connectionMode: Q, connectionRadius: K, lib: $, onConnectStart: W, cancelConnection: J, nodeLookup: ee, rfId: C, panBy: O, updateConnection: H } = _.getState(), B = V.type === "target", T = (k, A) => {
      y(!1), v?.(k, i, V.type, A);
    }, j = (k) => g?.(i, k), U = (k, A) => {
      y(!0), m?.(P, i, V.type), W?.(k, A);
    };
    lc.onPointerDown(P.nativeEvent, {
      autoPanOnConnect: b,
      connectionMode: Q,
      connectionRadius: K,
      domNode: F,
      handleId: V.id,
      nodeId: V.nodeId,
      nodeLookup: ee,
      isTarget: B,
      edgeUpdaterType: V.type,
      lib: $,
      flowId: C,
      cancelConnection: J,
      panBy: O,
      isValidConnection: (...k) => _.getState().isValidConnection?.(...k) ?? !0,
      onConnect: j,
      onConnectStart: U,
      onConnectEnd: (...k) => _.getState().onConnectEnd?.(...k),
      onReconnectEnd: T,
      updateConnection: H,
      getTransform: () => _.getState().transform,
      getFromHandle: () => _.getState().connection.fromHandle,
      dragThreshold: _.getState().connectionDragThreshold,
      handleDomNode: P.currentTarget
    });
  }, N = (P) => M(P, { nodeId: i.target, id: i.targetHandle ?? null, type: "target" }), E = (P) => M(P, { nodeId: i.source, id: i.sourceHandle ?? null, type: "source" }), D = () => x(!0), S = () => x(!1);
  return R.jsxs(R.Fragment, { children: [(t === !0 || t === "source") && R.jsx(wh, { position: p, centerX: l, centerY: a, radius: r, onMouseDown: N, onMouseEnter: D, onMouseOut: S, type: "source" }), (t === !0 || t === "target") && R.jsx(wh, { position: h, centerX: c, centerY: f, radius: r, onMouseDown: E, onMouseEnter: D, onMouseOut: S, type: "target" })] });
}
function HS({ id: t, edgesFocusable: r, edgesReconnectable: i, elementsSelectable: l, onClick: a, onDoubleClick: c, onContextMenu: f, onMouseEnter: p, onMouseMove: h, onMouseLeave: g, reconnectRadius: m, onReconnect: v, onReconnectStart: y, onReconnectEnd: x, rfId: _, edgeTypes: M, noPanClassName: N, onError: E, disableKeyboardA11y: D }) {
  let S = Me((me) => me.edgeLookup.get(t));
  const P = Me((me) => me.defaultEdgeOptions);
  S = P ? { ...P, ...S } : S;
  let V = S.type || "default", b = M?.[V] || mh[V];
  b === void 0 && (E?.("011", Ut.error011(V)), V = "default", b = M?.default || mh.default);
  const F = !!(S.focusable || r && typeof S.focusable > "u"), Q = typeof v < "u" && (S.reconnectable || i && typeof S.reconnectable > "u"), K = !!(S.selectable || l && typeof S.selectable > "u"), $ = Y.useRef(null), [W, J] = Y.useState(!1), [ee, C] = Y.useState(!1), O = be(), { zIndex: H = S.zIndex, sourceX: B, sourceY: T, targetX: j, targetY: U, sourcePosition: k, targetPosition: A } = Me(Y.useCallback((me) => {
    const ve = me.nodeLookup.get(S.source), Ee = me.nodeLookup.get(S.target);
    if (!ve || !Ee)
      return yh;
    const Ce = M1({
      id: t,
      sourceNode: ve,
      targetNode: Ee,
      sourceHandle: S.sourceHandle || null,
      targetHandle: S.targetHandle || null,
      connectionMode: me.connectionMode,
      onError: E
    }), ze = v1({
      selected: S.selected,
      zIndex: S.zIndex,
      sourceNode: ve,
      targetNode: Ee,
      elevateOnSelect: me.elevateEdgesOnSelect,
      zIndexMode: me.zIndexMode
    });
    return {
      ...Ce || yh,
      zIndex: ze
    };
  }, [S.source, S.target, S.sourceHandle, S.targetHandle, S.selected, S.zIndex, E]), je), ie = Y.useMemo(() => S.markerStart ? `url('#${ic(S.markerStart, _)}')` : void 0, [S.markerStart, _]), re = Y.useMemo(() => S.markerEnd ? `url('#${ic(S.markerEnd, _)}')` : void 0, [S.markerEnd, _]);
  if (S.hidden || B === null || T === null || j === null || U === null)
    return null;
  const ae = (me) => {
    const { addSelectedEdges: ve, unselectNodesAndEdges: Ee, multiSelectionActive: Ce } = O.getState();
    K && (O.setState({ nodesSelectionActive: !1 }), S.selected && Ce ? (Ee({ nodes: [], edges: [S] }), $.current?.blur()) : ve([t])), a && a(me, S);
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
    if (!D && vg.includes(me.key) && K) {
      const { unselectNodesAndEdges: ve, addSelectedEdges: Ee } = O.getState();
      me.key === "Escape" ? ($.current?.blur(), ve({ edges: [S] })) : Ee([t]);
    }
  };
  return R.jsx("svg", { style: { zIndex: H }, children: R.jsxs("g", { className: We([
    "react-flow__edge",
    `react-flow__edge-${V}`,
    S.className,
    N,
    {
      selected: S.selected,
      animated: S.animated,
      inactive: !K && !a,
      updating: W,
      selectable: K
    }
  ]), onClick: ae, onDoubleClick: ce, onContextMenu: ue, onMouseEnter: q, onMouseMove: le, onMouseLeave: we, onKeyDown: F ? Se : void 0, tabIndex: F ? 0 : void 0, role: S.ariaRole ?? (F ? "group" : "img"), "aria-roledescription": "edge", "data-id": t, "data-testid": `rf__edge-${t}`, "aria-label": S.ariaLabel === null ? void 0 : S.ariaLabel || `Edge from ${S.source} to ${S.target}`, "aria-describedby": F ? `${Gg}-${_}` : void 0, ref: $, ...S.domAttributes, children: [!ee && R.jsx(b, { id: t, source: S.source, target: S.target, type: S.type, selected: S.selected, animated: S.animated, selectable: K, deletable: S.deletable ?? !0, label: S.label, labelStyle: S.labelStyle, labelShowBg: S.labelShowBg, labelBgStyle: S.labelBgStyle, labelBgPadding: S.labelBgPadding, labelBgBorderRadius: S.labelBgBorderRadius, sourceX: B, sourceY: T, targetX: j, targetY: U, sourcePosition: k, targetPosition: A, data: S.data, style: S.style, sourceHandleId: S.sourceHandle, targetHandleId: S.targetHandle, markerStart: ie, markerEnd: re, pathOptions: "pathOptions" in S ? S.pathOptions : void 0, interactionWidth: S.interactionWidth }), Q && R.jsx(AS, { edge: S, isReconnectable: Q, reconnectRadius: m, onReconnect: v, onReconnectStart: y, onReconnectEnd: x, sourceX: B, sourceY: T, targetX: j, targetY: U, sourcePosition: k, targetPosition: A, setUpdateHover: J, setReconnecting: C })] }) });
}
var jS = Y.memo(HS);
const FS = (t) => ({
  edgesFocusable: t.edgesFocusable,
  edgesReconnectable: t.edgesReconnectable,
  elementsSelectable: t.elementsSelectable,
  connectionMode: t.connectionMode,
  onError: t.onError
});
function Em({ defaultMarkerColor: t, onlyRenderVisibleElements: r, rfId: i, edgeTypes: l, noPanClassName: a, onReconnect: c, onEdgeContextMenu: f, onEdgeMouseEnter: p, onEdgeMouseMove: h, onEdgeMouseLeave: g, onEdgeClick: m, reconnectRadius: v, onEdgeDoubleClick: y, onReconnectStart: x, onReconnectEnd: _, disableKeyboardA11y: M }) {
  const { edgesFocusable: N, edgesReconnectable: E, elementsSelectable: D, onError: S } = Me(FS, je), P = CS(r);
  return R.jsxs("div", { className: "react-flow__edges", children: [R.jsx(IS, { defaultColor: t, rfId: i }), P.map((V) => R.jsx(jS, { id: V, edgesFocusable: N, edgesReconnectable: E, elementsSelectable: D, noPanClassName: a, onReconnect: c, onContextMenu: f, onMouseEnter: p, onMouseMove: h, onMouseLeave: g, onClick: m, reconnectRadius: v, onDoubleClick: y, onReconnectStart: x, onReconnectEnd: _, rfId: i, onError: S, edgeTypes: l, disableKeyboardA11y: M }, V))] });
}
Em.displayName = "EdgeRenderer";
const VS = Y.memo(Em), xh = (t) => `translate(${t[0]}px,${t[1]}px) scale(${t[2]})`;
function BS({ children: t }) {
  const r = be(), i = Y.useRef(null), [l] = Y.useState(() => r.getState().transform);
  return nm(() => {
    let a = null;
    const c = () => {
      const f = r.getState().transform;
      a && f[0] === a[0] && f[1] === a[1] && f[2] === a[2] || (a = f, i.current && (i.current.style.transform = xh(f)));
    };
    return c(), r.subscribe(c);
  }, [r]), R.jsx("div", { ref: i, className: "react-flow__viewport xyflow__viewport react-flow__container", style: { transform: xh(l) }, children: t });
}
function US(t) {
  const r = Tl(), i = Y.useRef(!1);
  Y.useEffect(() => {
    !i.current && r.viewportInitialized && t && (setTimeout(() => t(r), 1), i.current = !0);
  }, [t, r.viewportInitialized]);
}
const WS = (t) => t.panZoom?.syncViewport;
function XS(t) {
  const r = Me(WS), i = be();
  return Y.useEffect(() => {
    t && (r?.(t), i.setState({ transform: [t.x, t.y, t.zoom] }));
  }, [t, r]), null;
}
function YS(t) {
  return t.connection.inProgress ? { ...t.connection, to: zi(t.connection.to, t.transform) } : { ...t.connection };
}
function ZS(t) {
  return YS;
}
function QS(t) {
  const r = ZS();
  return Me(r, je);
}
const KS = (t) => ({
  nodesConnectable: t.nodesConnectable,
  isValid: t.connection.isValid,
  inProgress: t.connection.inProgress,
  width: t.width,
  height: t.height
});
function GS({ containerStyle: t, style: r, type: i, component: l }) {
  const { nodesConnectable: a, width: c, height: f, isValid: p, inProgress: h } = Me(KS, je);
  return !(c && a && h) ? null : R.jsx("svg", { style: t, width: c, height: f, className: "react-flow__connectionline react-flow__container", children: R.jsx("g", { className: We(["react-flow__connection", Pg(p)]), children: R.jsx(Cm, { style: r, type: i, CustomComponent: l, isValid: p }) }) });
}
const Cm = ({ style: t, type: r = Wn.Bezier, CustomComponent: i, isValid: l }) => {
  const { inProgress: a, from: c, fromNode: f, fromHandle: p, fromPosition: h, to: g, toNode: m, toHandle: v, toPosition: y, pointer: x } = QS();
  if (!a)
    return;
  if (i)
    return R.jsx(i, { connectionLineType: r, connectionLineStyle: t, fromNode: f, fromHandle: p, fromX: c.x, fromY: c.y, toX: g.x, toY: g.y, fromPosition: h, toPosition: y, connectionStatus: Pg(l), toNode: m, toHandle: v, pointer: x });
  let _ = "";
  const M = {
    sourceX: c.x,
    sourceY: c.y,
    sourcePosition: h,
    targetX: g.x,
    targetY: g.y,
    targetPosition: y
  };
  switch (r) {
    case Wn.Bezier:
      [_] = Dg(M);
      break;
    case Wn.SimpleBezier:
      [_] = dm(M);
      break;
    case Wn.Step:
      [_] = oc({
        ...M,
        borderRadius: 0
      });
      break;
    case Wn.SmoothStep:
      [_] = oc(M);
      break;
    default:
      [_] = Og(M);
  }
  return R.jsx("path", { d: _, fill: "none", className: "react-flow__connection-path", style: t });
};
Cm.displayName = "ConnectionLine";
const qS = {};
function _h(t = qS) {
  Y.useRef(t), be(), Y.useEffect(() => {
  }, [t]);
}
function JS() {
  be(), Y.useRef(!1), Y.useEffect(() => {
  }, []);
}
function Nm({ nodeTypes: t, edgeTypes: r, onInit: i, onNodeClick: l, onEdgeClick: a, onNodeDoubleClick: c, onEdgeDoubleClick: f, onNodeMouseEnter: p, onNodeMouseMove: h, onNodeMouseLeave: g, onNodeContextMenu: m, onSelectionContextMenu: v, onSelectionStart: y, onSelectionEnd: x, connectionLineType: _, connectionLineStyle: M, connectionLineComponent: N, connectionLineContainerStyle: E, selectionKeyCode: D, selectionOnDrag: S, selectionMode: P, multiSelectionKeyCode: V, panActivationKeyCode: b, zoomActivationKeyCode: F, deleteKeyCode: Q, onlyRenderVisibleElements: K, elementsSelectable: $, defaultViewport: W, translateExtent: J, minZoom: ee, maxZoom: C, preventScrolling: O, defaultMarkerColor: H, zoomOnScroll: B, zoomOnPinch: T, panOnScroll: j, panOnScrollSpeed: U, panOnScrollMode: k, zoomOnDoubleClick: A, panOnDrag: ie, autoPanOnSelection: re, onPaneClick: ae, onPaneMouseEnter: ce, onPaneMouseMove: ue, onPaneMouseLeave: q, onPaneScroll: le, onPaneContextMenu: we, paneClickDistance: Se, nodeClickDistance: me, onEdgeContextMenu: ve, onEdgeMouseEnter: Ee, onEdgeMouseMove: Ce, onEdgeMouseLeave: ze, reconnectRadius: Ve, onReconnect: Ct, onReconnectStart: at, onReconnectEnd: et, noDragClassName: tt, noWheelClassName: on, noPanClassName: Yt, disableKeyboardA11y: Zt, nodeExtent: ut, rfId: Nt, viewport: mt, onViewportChange: Mt, nodesDraggable: Cr }) {
  return _h(t), _h(r), JS(), US(i), XS(mt), R.jsx(gS, { onPaneClick: ae, onPaneMouseEnter: ce, onPaneMouseMove: ue, onPaneMouseLeave: q, onPaneContextMenu: we, onPaneScroll: le, paneClickDistance: Se, deleteKeyCode: Q, selectionKeyCode: D, selectionOnDrag: S, selectionMode: P, onSelectionStart: y, onSelectionEnd: x, multiSelectionKeyCode: V, panActivationKeyCode: b, zoomActivationKeyCode: F, elementsSelectable: $, zoomOnScroll: B, zoomOnPinch: T, zoomOnDoubleClick: A, panOnScroll: j, panOnScrollSpeed: U, panOnScrollMode: k, panOnDrag: ie, autoPanOnSelection: re, defaultViewport: W, translateExtent: J, minZoom: ee, maxZoom: C, onSelectionContextMenu: v, preventScrolling: O, noDragClassName: tt, noWheelClassName: on, noPanClassName: Yt, disableKeyboardA11y: Zt, onViewportChange: Mt, isControlledViewport: !!mt, children: R.jsxs(BS, { children: [R.jsx(VS, { edgeTypes: r, onEdgeClick: a, onEdgeDoubleClick: f, onReconnect: Ct, onReconnectStart: at, onReconnectEnd: et, onlyRenderVisibleElements: K, onEdgeContextMenu: ve, onEdgeMouseEnter: Ee, onEdgeMouseMove: Ce, onEdgeMouseLeave: ze, reconnectRadius: Ve, defaultMarkerColor: H, noPanClassName: Yt, disableKeyboardA11y: Zt, rfId: Nt }), R.jsx(GS, { style: M, type: _, component: N, containerStyle: E }), R.jsx("div", { className: "react-flow__edgelabel-renderer" }), R.jsx(ES, { nodeTypes: t, onNodeClick: l, onNodeDoubleClick: c, onNodeMouseEnter: p, onNodeMouseMove: h, onNodeMouseLeave: g, onNodeContextMenu: m, nodeClickDistance: me, onlyRenderVisibleElements: K, noPanClassName: Yt, noDragClassName: tt, disableKeyboardA11y: Zt, nodeExtent: ut, rfId: Nt, nodesDraggable: Cr }), R.jsx("div", { className: "react-flow__viewport-portal" })] }) });
}
Nm.displayName = "GraphView";
const ek = Y.memo(Nm), tk = Ng(), Sh = ({ nodes: t, edges: r, defaultNodes: i, defaultEdges: l, width: a, height: c, fitView: f, fitViewOptions: p, minZoom: h = 0.5, maxZoom: g = 2, nodeOrigin: m, nodeExtent: v, zIndexMode: y = "basic" } = {}) => {
  const x = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), M = /* @__PURE__ */ new Map(), N = /* @__PURE__ */ new Map(), E = l ?? r ?? [], D = i ?? t ?? [], S = m ?? [0, 0], P = v ?? yi;
  Hg(M, N, E);
  const { nodesInitialized: V } = sc(D, x, _, {
    nodeOrigin: S,
    nodeExtent: P,
    zIndexMode: y
  });
  let b = [0, 0, 1];
  if (f && a && c) {
    const F = Ni(x, {
      filter: (W) => !!((W.width || W.initialWidth) && (W.height || W.initialHeight))
    }), { x: Q, y: K, zoom: $ } = Ec(F, a, c, h, g, p?.padding ?? 0.1);
    b = [Q, K, $];
  }
  return {
    rfId: "1",
    width: a ?? 0,
    height: c ?? 0,
    transform: b,
    nodes: D,
    nodesInitialized: V,
    nodeLookup: x,
    parentLookup: _,
    edges: E,
    edgeLookup: N,
    connectionLookup: M,
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
    connection: { ...xg },
    connectionClickStartHandle: null,
    connectOnClick: !0,
    ariaLiveMessage: "",
    autoPanOnConnect: !0,
    autoPanOnNodeDrag: !0,
    autoPanOnNodeFocus: !0,
    autoPanSpeed: 15,
    connectionRadius: 20,
    onError: tk,
    isValidConnection: void 0,
    onSelectionChangeHandlers: [],
    lib: "react",
    debug: !1,
    ariaLabelConfig: wg,
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
}, nk = ({ nodes: t, edges: r, defaultNodes: i, defaultEdges: l, width: a, height: c, fitView: f, fitViewOptions: p, minZoom: h, maxZoom: g, nodeOrigin: m, nodeExtent: v, zIndexMode: y }) => m_((x, _) => {
  async function M() {
    const { nodeLookup: N, panZoom: E, fitViewOptions: D, fitViewResolver: S, width: P, height: V, minZoom: b, maxZoom: F } = _();
    E && (await f1({
      nodes: N,
      width: P,
      height: V,
      panZoom: E,
      minZoom: b,
      maxZoom: F
    }, D), S?.resolve(!0), x({ fitViewResolver: null }));
  }
  return {
    ...Sh({
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
    setNodes: (N) => {
      const { nodeLookup: E, parentLookup: D, nodeOrigin: S, nodeExtent: P, elevateNodesOnSelect: V, fitViewQueued: b, zIndexMode: F, nodesSelectionActive: Q } = _(), { nodesInitialized: K, hasSelectedNodes: $ } = sc(N, E, D, {
        nodeOrigin: S,
        nodeExtent: P,
        elevateNodesOnSelect: V,
        checkEquality: !0,
        zIndexMode: F
      }), W = Q && $;
      b && K ? (M(), x({
        nodes: N,
        nodesInitialized: K,
        fitViewQueued: !1,
        fitViewOptions: void 0,
        nodesSelectionActive: W
      })) : x({ nodes: N, nodesInitialized: K, nodesSelectionActive: W });
    },
    setEdges: (N) => {
      const { connectionLookup: E, edgeLookup: D } = _();
      Hg(E, D, N), x({ edges: N });
    },
    setDefaultNodesAndEdges: (N, E) => {
      if (N) {
        const { setNodes: D } = _();
        D(N), x({ hasDefaultNodes: !0 });
      }
      if (E) {
        const { setEdges: D } = _();
        D(E), x({ hasDefaultEdges: !0 });
      }
    },
    /*
     * Every node gets registered at a ResizeObserver. Whenever a node
     * changes its dimensions, this function is called to measure the
     * new dimensions and update the nodes.
     */
    updateNodeInternals: (N) => {
      const { triggerNodeChanges: E, nodeLookup: D, parentLookup: S, domNode: P, nodeOrigin: V, nodeExtent: b, debug: F, fitViewQueued: Q, zIndexMode: K } = _(), { changes: $, updatedInternals: W } = L1(N, D, S, P, V, b, K);
      W && (T1(D, S, { nodeOrigin: V, nodeExtent: b, zIndexMode: K }), Q ? (M(), x({ fitViewQueued: !1, fitViewOptions: void 0 })) : x({}), $?.length > 0 && (F && console.log("React Flow: trigger node changes", $), E?.($)));
    },
    updateNodePositions: (N, E = !1) => {
      const D = [];
      let S = [];
      const { nodeLookup: P, triggerNodeChanges: V, connection: b, updateConnection: F, onNodesChangeMiddlewareMap: Q } = _();
      for (const [K, $] of N) {
        const W = P.get(K), J = !!(W?.expandParent && W?.parentId && $?.position), ee = {
          id: K,
          type: "position",
          position: J ? {
            x: Math.max(0, $.position.x),
            y: Math.max(0, $.position.y)
          } : $.position,
          dragging: E
        };
        if (W && b.inProgress && b.fromNode.id === W.id) {
          const C = Er(W, b.fromHandle, ye.Left, !0);
          F({ ...b, from: C });
        }
        J && W.parentId && D.push({
          id: K,
          parentId: W.parentId,
          rect: {
            ...$.internals.positionAbsolute,
            width: $.measured.width ?? 0,
            height: $.measured.height ?? 0
          }
        }), S.push(ee);
      }
      if (D.length > 0) {
        const { parentLookup: K, nodeOrigin: $ } = _(), W = Ic(D, P, K, $);
        S.push(...W);
      }
      for (const K of Q.values())
        S = K(S);
      V(S);
    },
    triggerNodeChanges: (N) => {
      const { onNodesChange: E, setNodes: D, nodes: S, hasDefaultNodes: P, debug: V } = _();
      if (N?.length) {
        if (P) {
          const b = Tc(N, S);
          D(b);
        }
        V && console.log("React Flow: trigger node changes", N), E?.(N);
      }
    },
    triggerEdgeChanges: (N) => {
      const { onEdgesChange: E, setEdges: D, edges: S, hasDefaultEdges: P, debug: V } = _();
      if (N?.length) {
        if (P) {
          const b = em(N, S);
          D(b);
        }
        V && console.log("React Flow: trigger edge changes", N), E?.(N);
      }
    },
    addSelectedNodes: (N) => {
      const { multiSelectionActive: E, edgeLookup: D, nodeLookup: S, triggerNodeChanges: P, triggerEdgeChanges: V } = _();
      if (E) {
        const b = N.map((F) => hr(F, !0));
        P(b);
        return;
      }
      P(no(S, /* @__PURE__ */ new Set([...N]))), V(no(D));
    },
    addSelectedEdges: (N) => {
      const { multiSelectionActive: E, edgeLookup: D, nodeLookup: S, triggerNodeChanges: P, triggerEdgeChanges: V } = _();
      if (E) {
        const b = N.map((F) => hr(F, !0));
        V(b);
        return;
      }
      V(no(D, /* @__PURE__ */ new Set([...N]))), P(no(S, /* @__PURE__ */ new Set()));
    },
    unselectNodesAndEdges: ({ nodes: N, edges: E } = {}) => {
      const { edges: D, nodes: S, nodeLookup: P, triggerNodeChanges: V, triggerEdgeChanges: b } = _(), F = N || S, Q = E || D, K = [];
      for (const W of F)
        W.selected && K.push(hr(W.id, !1));
      const $ = [];
      for (const W of Q)
        W.selected && $.push(hr(W.id, !1));
      V(K), b($);
    },
    setMinZoom: (N) => {
      const { panZoom: E, maxZoom: D } = _();
      E?.setScaleExtent([N, D]), x({ minZoom: N });
    },
    setMaxZoom: (N) => {
      const { panZoom: E, minZoom: D } = _();
      E?.setScaleExtent([D, N]), x({ maxZoom: N });
    },
    setTranslateExtent: (N) => {
      _().panZoom?.setTranslateExtent(N), x({ translateExtent: N });
    },
    resetSelectedElements: () => {
      const { edges: N, nodes: E, triggerNodeChanges: D, triggerEdgeChanges: S, elementsSelectable: P } = _();
      if (!P)
        return;
      const V = E.reduce((F, Q) => Q.selected ? [...F, hr(Q.id, !1)] : F, []), b = N.reduce((F, Q) => Q.selected ? [...F, hr(Q.id, !1)] : F, []);
      D(V), S(b);
    },
    setNodeExtent: (N) => {
      const { nodes: E, nodeLookup: D, parentLookup: S, nodeOrigin: P, elevateNodesOnSelect: V, nodeExtent: b, zIndexMode: F } = _();
      N[0][0] === b[0][0] && N[0][1] === b[0][1] && N[1][0] === b[1][0] && N[1][1] === b[1][1] || (sc(E, D, S, {
        nodeOrigin: P,
        nodeExtent: N,
        elevateNodesOnSelect: V,
        checkEquality: !1,
        zIndexMode: F
      }), x({ nodeExtent: N }));
    },
    panBy: (N) => {
      const { transform: E, width: D, height: S, panZoom: P, translateExtent: V } = _();
      return O1({ delta: N, panZoom: P, transform: E, translateExtent: V, width: D, height: S });
    },
    setCenter: async (N, E, D) => {
      const { width: S, height: P, maxZoom: V, panZoom: b } = _();
      if (!b)
        return !1;
      const F = typeof D?.zoom < "u" ? D.zoom : V;
      return await b.setViewport({
        x: S / 2 - N * F,
        y: P / 2 - E * F,
        zoom: F
      }, { duration: D?.duration, ease: D?.ease, interpolate: D?.interpolate }), !0;
    },
    cancelConnection: () => {
      x({
        connection: { ...xg }
      });
    },
    updateConnection: (N) => {
      x({ connection: N });
    },
    reset: () => x({ ...Sh() })
  };
}, Object.is);
function rk({ initialNodes: t, initialEdges: r, defaultNodes: i, defaultEdges: l, initialWidth: a, initialHeight: c, initialMinZoom: f, initialMaxZoom: p, initialFitViewOptions: h, fitView: g, nodeOrigin: m, nodeExtent: v, zIndexMode: y, children: x }) {
  const [_] = Y.useState(() => nk({
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
  return R.jsx(y_, { value: _, children: R.jsx(F_, { children: R.jsx(nS, { children: x }) }) });
}
function ok({ children: t, nodes: r, edges: i, defaultNodes: l, defaultEdges: a, width: c, height: f, fitView: p, fitViewOptions: h, minZoom: g, maxZoom: m, nodeOrigin: v, nodeExtent: y, zIndexMode: x }) {
  return Y.useContext(Pl) ? R.jsx(R.Fragment, { children: t }) : R.jsx(rk, { initialNodes: r, initialEdges: i, defaultNodes: l, defaultEdges: a, initialWidth: c, initialHeight: f, fitView: p, initialFitViewOptions: h, initialMinZoom: g, initialMaxZoom: m, nodeOrigin: v, nodeExtent: y, zIndexMode: x, children: t });
}
const ik = {
  width: "100%",
  height: "100%",
  overflow: "hidden",
  position: "relative",
  zIndex: 0
};
function sk({ nodes: t, edges: r, defaultNodes: i, defaultEdges: l, className: a, nodeTypes: c, edgeTypes: f, onNodeClick: p, onEdgeClick: h, onInit: g, onMove: m, onMoveStart: v, onMoveEnd: y, onConnect: x, onConnectStart: _, onConnectEnd: M, onClickConnectStart: N, onClickConnectEnd: E, onNodeMouseEnter: D, onNodeMouseMove: S, onNodeMouseLeave: P, onNodeContextMenu: V, onNodeDoubleClick: b, onNodeDragStart: F, onNodeDrag: Q, onNodeDragStop: K, onNodesDelete: $, onEdgesDelete: W, onDelete: J, onSelectionChange: ee, onSelectionDragStart: C, onSelectionDrag: O, onSelectionDragStop: H, onSelectionContextMenu: B, onSelectionStart: T, onSelectionEnd: j, onBeforeDelete: U, connectionMode: k, connectionLineType: A = Wn.Bezier, connectionLineStyle: ie, connectionLineComponent: re, connectionLineContainerStyle: ae, deleteKeyCode: ce = "Backspace", selectionKeyCode: ue = "Shift", selectionOnDrag: q = !1, selectionMode: le = vi.Full, panActivationKeyCode: we = "Space", multiSelectionKeyCode: Se = xi() ? "Meta" : "Control", zoomActivationKeyCode: me = xi() ? "Meta" : "Control", snapToGrid: ve, snapGrid: Ee, onlyRenderVisibleElements: Ce = !1, selectNodesOnDrag: ze, nodesDraggable: Ve, autoPanOnNodeFocus: Ct, nodesConnectable: at, nodesFocusable: et, nodeOrigin: tt = qg, edgesFocusable: on, edgesReconnectable: Yt, elementsSelectable: Zt = !0, defaultViewport: ut = I_, minZoom: Nt = 0.5, maxZoom: mt = 2, translateExtent: Mt = yi, preventScrolling: Cr = !0, nodeExtent: sn, defaultMarkerColor: Zn = "#b1b1b7", zoomOnScroll: Dl = !0, zoomOnPinch: Pi = !0, panOnScroll: Ii = !1, panOnScrollSpeed: Ll = 0.5, panOnScrollMode: yo = vr.Free, zoomOnDoubleClick: vo = !0, panOnDrag: wo = !0, onPaneClick: xo, onPaneMouseEnter: _o, onPaneMouseMove: _n, onPaneMouseLeave: Sn, onPaneScroll: Ti, onPaneContextMenu: Ri, paneClickDistance: bi = 1, nodeClickDistance: Di = 0, children: Li, onReconnect: So, onReconnectStart: Oi, onReconnectEnd: Qn, onEdgeContextMenu: ko, onEdgeDoubleClick: Kn, onEdgeMouseEnter: Ol, onEdgeMouseMove: Gn, onEdgeMouseLeave: Nr, reconnectRadius: Mr = 10, onNodesChange: Eo, onEdgesChange: $l, noDragClassName: Al = "nodrag", noWheelClassName: Hl = "nowheel", noPanClassName: Qt = "nopan", fitView: Co, fitViewOptions: No, connectOnClick: jl, attributionPosition: $i, proOptions: Ai, defaultEdgeOptions: Hi, elevateNodesOnSelect: ji = !0, elevateEdgesOnSelect: Fl = !1, disableKeyboardA11y: Fi = !1, autoPanOnConnect: $e, autoPanOnNodeDrag: Vl, autoPanOnSelection: Mo = !0, autoPanSpeed: Vi, connectionRadius: zr, isValidConnection: Bl, onError: Bi, style: Pr, id: yt, nodeDragThreshold: Ul, connectionDragThreshold: vt, viewport: Wl, onViewportChange: Xl, width: Yl, height: Ir, colorMode: Tr = "light", debug: qn, onScroll: Jn, ariaLabelConfig: Zl, zIndexMode: Ui = "basic", ...zo }, Wi) {
  const er = yt || "1", tr = D_(Tr), Ql = Y.useCallback((Rr) => {
    Rr.currentTarget.scrollTo({ top: 0, left: 0, behavior: "instant" }), Jn?.(Rr);
  }, [Jn]);
  return R.jsx("div", { "data-testid": "rf__wrapper", ...zo, onScroll: Ql, style: { ...Pr, ...ik }, ref: Wi, className: We(["react-flow", a, tr]), id: yt, role: "application", children: R.jsxs(ok, { nodes: t, edges: r, width: Yl, height: Ir, fitView: Co, fitViewOptions: No, minZoom: Nt, maxZoom: mt, nodeOrigin: tt, nodeExtent: sn, zIndexMode: Ui, children: [R.jsx(b_, { nodes: t, edges: r, defaultNodes: i, defaultEdges: l, onConnect: x, onConnectStart: _, onConnectEnd: M, onClickConnectStart: N, onClickConnectEnd: E, nodesDraggable: Ve, autoPanOnNodeFocus: Ct, nodesConnectable: at, nodesFocusable: et, edgesFocusable: on, edgesReconnectable: Yt, elementsSelectable: Zt, elevateNodesOnSelect: ji, elevateEdgesOnSelect: Fl, minZoom: Nt, maxZoom: mt, nodeExtent: sn, onNodesChange: Eo, onEdgesChange: $l, snapToGrid: ve, snapGrid: Ee, connectionMode: k, translateExtent: Mt, connectOnClick: jl, defaultEdgeOptions: Hi, fitView: Co, fitViewOptions: No, onNodesDelete: $, onEdgesDelete: W, onDelete: J, onNodeDragStart: F, onNodeDrag: Q, onNodeDragStop: K, onSelectionDrag: O, onSelectionDragStart: C, onSelectionDragStop: H, onMove: m, onMoveStart: v, onMoveEnd: y, noPanClassName: Qt, nodeOrigin: tt, rfId: er, autoPanOnConnect: $e, autoPanOnNodeDrag: Vl, autoPanSpeed: Vi, onError: Bi, connectionRadius: zr, isValidConnection: Bl, selectNodesOnDrag: ze, nodeDragThreshold: Ul, connectionDragThreshold: vt, onBeforeDelete: U, debug: qn, ariaLabelConfig: Zl, zIndexMode: Ui }), R.jsx(ek, { onInit: g, onNodeClick: p, onEdgeClick: h, onNodeMouseEnter: D, onNodeMouseMove: S, onNodeMouseLeave: P, onNodeContextMenu: V, onNodeDoubleClick: b, nodeTypes: c, edgeTypes: f, connectionLineType: A, connectionLineStyle: ie, connectionLineComponent: re, connectionLineContainerStyle: ae, selectionKeyCode: ue, selectionOnDrag: q, selectionMode: le, deleteKeyCode: ce, multiSelectionKeyCode: Se, panActivationKeyCode: we, zoomActivationKeyCode: me, onlyRenderVisibleElements: Ce, defaultViewport: ut, translateExtent: Mt, minZoom: Nt, maxZoom: mt, preventScrolling: Cr, zoomOnScroll: Dl, zoomOnPinch: Pi, zoomOnDoubleClick: vo, panOnScroll: Ii, panOnScrollSpeed: Ll, panOnScrollMode: yo, panOnDrag: wo, autoPanOnSelection: Mo, onPaneClick: xo, onPaneMouseEnter: _o, onPaneMouseMove: _n, onPaneMouseLeave: Sn, onPaneScroll: Ti, onPaneContextMenu: Ri, paneClickDistance: bi, nodeClickDistance: Di, onSelectionContextMenu: B, onSelectionStart: T, onSelectionEnd: j, onReconnect: So, onReconnectStart: Oi, onReconnectEnd: Qn, onEdgeContextMenu: ko, onEdgeDoubleClick: Kn, onEdgeMouseEnter: Ol, onEdgeMouseMove: Gn, onEdgeMouseLeave: Nr, reconnectRadius: Mr, defaultMarkerColor: Zn, noDragClassName: Al, noWheelClassName: Hl, noPanClassName: Qt, rfId: er, disableKeyboardA11y: Fi, nodeExtent: sn, viewport: Wl, onViewportChange: Xl, nodesDraggable: Ve }), R.jsx(P_, { onSelectionChange: ee }), Li, R.jsx(E_, { proOptions: Ai, position: $i }), R.jsx(k_, { rfId: er, disableKeyboardA11y: Fi })] }) });
}
var Mm = tm(sk);
function lk() {
  const t = be();
  return Y.useCallback((r) => {
    const { domNode: i, updateNodeInternals: l } = t.getState(), a = Array.isArray(r) ? r : [r], c = /* @__PURE__ */ new Map();
    a.forEach((f) => {
      const p = i?.querySelector(`.react-flow__node[data-id="${f}"]`);
      p && c.set(f, { id: f, nodeElement: p, force: !0 });
    }), requestAnimationFrame(() => l(c, { triggerFitView: !1 }));
  }, []);
}
function ak({ dimensions: t, lineWidth: r, variant: i, className: l }) {
  return R.jsx("path", { strokeWidth: r, d: `M${t[0] / 2} 0 V${t[1]} M0 ${t[1] / 2} H${t[0]}`, className: We(["react-flow__background-pattern", i, l]) });
}
function uk({ radius: t, className: r }) {
  return R.jsx("circle", { cx: t, cy: t, r: t, className: We(["react-flow__background-pattern", "dots", r]) });
}
var Xn;
(function(t) {
  t.Lines = "lines", t.Dots = "dots", t.Cross = "cross";
})(Xn || (Xn = {}));
const ck = {
  [Xn.Dots]: 1,
  [Xn.Lines]: 1,
  [Xn.Cross]: 6
}, fk = (t) => ({ transform: t.transform, patternId: `pattern-${t.rfId}` });
function zm({
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
  const v = Y.useRef(null), { transform: y, patternId: x } = Me(fk, je), _ = l || ck[r], M = r === Xn.Dots, N = r === Xn.Cross, E = Array.isArray(i) ? i : [i, i], D = [E[0] * y[2] || 1, E[1] * y[2] || 1], S = _ * y[2], P = Array.isArray(c) ? c : [c, c], V = N ? [S, S] : D, b = [
    P[0] * y[2] + V[0] / 2,
    P[1] * y[2] + V[1] / 2
  ], F = `${x}${t || ""}`;
  return R.jsxs("svg", { className: We(["react-flow__background", g]), style: {
    ...h,
    ...Rl,
    "--xy-background-color-props": p,
    "--xy-background-pattern-color-props": f
  }, ref: v, "data-testid": "rf__background", children: [R.jsx("pattern", { id: F, x: y[0] % D[0], y: y[1] % D[1], width: D[0], height: D[1], patternUnits: "userSpaceOnUse", patternTransform: `translate(-${b[0]},-${b[1]})`, children: M ? R.jsx(uk, { radius: S / 2, className: m }) : R.jsx(ak, { dimensions: V, lineWidth: a, variant: r, className: m }) }), R.jsx("rect", { x: "0", y: "0", width: "100%", height: "100%", fill: `url(#${F})` })] });
}
zm.displayName = "Background";
const Pm = Y.memo(zm);
function dk() {
  return R.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 32", children: R.jsx("path", { d: "M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z" }) });
}
function pk() {
  return R.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 5", children: R.jsx("path", { d: "M0 0h32v4.2H0z" }) });
}
function hk() {
  return R.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 30", children: R.jsx("path", { d: "M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0027.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94c-.531 0-.939-.4-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z" }) });
}
function gk() {
  return R.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 25 32", children: R.jsx("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z" }) });
}
function mk() {
  return R.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 25 32", children: R.jsx("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047z" }) });
}
function tl({ children: t, className: r, ...i }) {
  return R.jsx("button", { type: "button", className: We(["react-flow__controls-button", r]), ...i, children: t });
}
const yk = (t) => ({
  isInteractive: t.nodesDraggable || t.nodesConnectable || t.elementsSelectable,
  minZoomReached: t.transform[2] <= t.minZoom,
  maxZoomReached: t.transform[2] >= t.maxZoom,
  ariaLabelConfig: t.ariaLabelConfig
});
function Im({ style: t, showZoom: r = !0, showFitView: i = !0, showInteractive: l = !0, fitViewOptions: a, onZoomIn: c, onZoomOut: f, onFitView: p, onInteractiveChange: h, className: g, children: m, position: v = "bottom-left", orientation: y = "vertical", "aria-label": x }) {
  const _ = be(), { isInteractive: M, minZoomReached: N, maxZoomReached: E, ariaLabelConfig: D } = Me(yk, je), { zoomIn: S, zoomOut: P, fitView: V } = Tl(), b = () => {
    S(), c?.();
  }, F = () => {
    P(), f?.();
  }, Q = () => {
    V(a), p?.();
  }, K = () => {
    _.setState({
      nodesDraggable: !M,
      nodesConnectable: !M,
      elementsSelectable: !M
    }), h?.(!M);
  }, $ = y === "horizontal" ? "horizontal" : "vertical";
  return R.jsxs(Il, { className: We(["react-flow__controls", $, g]), position: v, style: t, "data-testid": "rf__controls", "aria-label": x ?? D["controls.ariaLabel"], children: [r && R.jsxs(R.Fragment, { children: [R.jsx(tl, { onClick: b, className: "react-flow__controls-zoomin", title: D["controls.zoomIn.ariaLabel"], "aria-label": D["controls.zoomIn.ariaLabel"], disabled: E, children: R.jsx(dk, {}) }), R.jsx(tl, { onClick: F, className: "react-flow__controls-zoomout", title: D["controls.zoomOut.ariaLabel"], "aria-label": D["controls.zoomOut.ariaLabel"], disabled: N, children: R.jsx(pk, {}) })] }), i && R.jsx(tl, { className: "react-flow__controls-fitview", onClick: Q, title: D["controls.fitView.ariaLabel"], "aria-label": D["controls.fitView.ariaLabel"], children: R.jsx(hk, {}) }), l && R.jsx(tl, { className: "react-flow__controls-interactive", onClick: K, title: D["controls.interactive.ariaLabel"], "aria-label": D["controls.interactive.ariaLabel"], children: M ? R.jsx(mk, {}) : R.jsx(gk, {}) }), m] });
}
Im.displayName = "Controls";
const Tm = Y.memo(Im);
function vk({ id: t, x: r, y: i, width: l, height: a, style: c, color: f, strokeColor: p, strokeWidth: h, className: g, borderRadius: m, shapeRendering: v, selected: y, onClick: x }) {
  const { background: _, backgroundColor: M } = c || {}, N = f || _ || M;
  return R.jsx("rect", { className: We(["react-flow__minimap-node", { selected: y }, g]), x: r, y: i, rx: m, ry: m, width: l, height: a, style: {
    fill: N,
    stroke: p,
    strokeWidth: h
  }, shapeRendering: v, onClick: x ? (E) => x(E, t) : void 0 });
}
const wk = Y.memo(vk), xk = (t) => t.nodes.map((r) => r.id), Yu = (t) => t instanceof Function ? t : () => t;
function _k({
  nodeStrokeColor: t,
  nodeColor: r,
  nodeClassName: i = "",
  nodeBorderRadius: l = 5,
  nodeStrokeWidth: a,
  /*
   * We need to rename the prop to be `CapitalCase` so that JSX will render it as
   * a component properly.
   */
  nodeComponent: c = wk,
  onClick: f
}) {
  const p = Me(xk, je), h = Yu(r), g = Yu(t), m = Yu(i), v = typeof window > "u" || window.chrome ? "crispEdges" : "geometricPrecision";
  return R.jsx(R.Fragment, { children: p.map((y) => (
    /*
     * The split of responsibilities between MiniMapNodes and
     * NodeComponentWrapper may appear weird. However, it’s designed to
     * minimize the cost of updates when individual nodes change.
     *
     * For more details, see a similar commit in `NodeRenderer/index.tsx`.
     */
    R.jsx(kk, { id: y, nodeColorFunc: h, nodeStrokeColorFunc: g, nodeClassNameFunc: m, nodeBorderRadius: l, nodeStrokeWidth: a, NodeComponent: c, onClick: f, shapeRendering: v }, y)
  )) });
}
function Sk({ id: t, nodeColorFunc: r, nodeStrokeColorFunc: i, nodeClassNameFunc: l, nodeBorderRadius: a, nodeStrokeWidth: c, shapeRendering: f, NodeComponent: p, onClick: h }) {
  const { node: g, x: m, y: v, width: y, height: x } = Me((_) => {
    const M = _.nodeLookup.get(t);
    if (!M)
      return { node: void 0, x: 0, y: 0, width: 0, height: 0 };
    const N = M.internals.userNode, { x: E, y: D } = M.internals.positionAbsolute, { width: S, height: P } = Xt(N);
    return {
      node: N,
      x: E,
      y: D,
      width: S,
      height: P
    };
  }, je);
  return !g || g.hidden || !Mg(g) ? null : R.jsx(p, { x: m, y: v, width: y, height: x, style: g.style, selected: !!g.selected, className: l(g), color: r(g), borderRadius: a, strokeColor: i(g), strokeWidth: c, shapeRendering: f, onClick: h, id: g.id });
}
const kk = Y.memo(Sk);
var Ek = Y.memo(_k);
const Ck = 200, Nk = 150, Mk = (t) => !t.hidden, zk = (t) => {
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
    boundingRect: i ? Eg(Ni(t.nodeLookup, { filter: Mk }), r) : r,
    rfId: t.rfId,
    panZoom: t.panZoom,
    translateExtent: t.translateExtent,
    flowWidth: t.width,
    flowHeight: t.height,
    ariaLabelConfig: t.ariaLabelConfig
  };
}, kh = (t, r) => t.x === r.x && t.y === r.y && t.width === r.width && t.height === r.height, Pk = (t, r) => kh(t.viewBB, r.viewBB) && kh(t.boundingRect, r.boundingRect) && t.rfId === r.rfId && t.panZoom === r.panZoom && t.translateExtent === r.translateExtent && t.flowWidth === r.flowWidth && t.flowHeight === r.flowHeight && t.ariaLabelConfig === r.ariaLabelConfig, Ik = "react-flow__minimap-desc";
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
  onClick: x,
  onNodeClick: _,
  pannable: M = !1,
  zoomable: N = !1,
  ariaLabel: E,
  inversePan: D,
  zoomStep: S = 1,
  offsetScale: P = 5
}) {
  const V = be(), b = Y.useRef(null), { boundingRect: F, panZoom: Q, viewBB: K, rfId: $, translateExtent: W, flowWidth: J, flowHeight: ee, ariaLabelConfig: C } = Me(zk, Pk), O = t?.width ?? Ck, H = t?.height ?? Nk, B = F.width / O, T = F.height / H, j = Math.max(B, T), U = j * O, k = j * H, A = P * j, ie = F.x - (U - F.width) / 2 - A, re = F.y - (k - F.height) / 2 - A, ae = U + A * 2, ce = k + A * 2, ue = `${Ik}-${$}`, q = Y.useRef(0), le = Y.useRef();
  q.current = j, Y.useEffect(() => {
    const Ee = V.getState().panZoom;
    if (b.current && Ee)
      return le.current = W1({
        domNode: b.current,
        panZoom: Ee,
        getTransform: () => V.getState().transform,
        getViewScale: () => q.current
      }), () => {
        le.current?.destroy();
      };
  }, [Q]), Y.useEffect(() => {
    le.current?.update({
      translateExtent: W,
      width: J,
      height: ee,
      inversePan: D,
      pannable: M,
      zoomStep: S,
      zoomable: N
    });
  }, [M, N, D, S, W, J, ee]);
  const we = x ? (Ee) => {
    const [Ce, ze] = le.current?.pointer(Ee) || [0, 0];
    x(Ee, { x: Ce, y: ze });
  } : void 0, Se = Y.useCallback((Ee, Ce) => {
    const ze = V.getState().nodeLookup.get(Ce).internals.userNode;
    _?.(Ee, ze);
  }, [_]), me = _ ? Se : void 0, ve = E ?? C["minimap.ariaLabel"];
  return R.jsx(Il, { position: y, style: {
    ...t,
    "--xy-minimap-background-color-props": typeof h == "string" ? h : void 0,
    "--xy-minimap-mask-background-color-props": typeof g == "string" ? g : void 0,
    "--xy-minimap-mask-stroke-color-props": typeof m == "string" ? m : void 0,
    "--xy-minimap-mask-stroke-width-props": typeof v == "number" ? v * j : void 0,
    "--xy-minimap-node-background-color-props": typeof l == "string" ? l : void 0,
    "--xy-minimap-node-stroke-color-props": typeof i == "string" ? i : void 0,
    "--xy-minimap-node-stroke-width-props": typeof f == "number" ? f : void 0
  }, className: We(["react-flow__minimap", r]), "data-testid": "rf__minimap", children: R.jsxs("svg", { width: O, height: H, viewBox: `${ie} ${re} ${ae} ${ce}`, className: "react-flow__minimap-svg", role: "img", "aria-labelledby": ue, ref: b, onClick: we, children: [ve && R.jsx("title", { id: ue, children: ve }), R.jsx(Ek, { onClick: me, nodeColor: l, nodeStrokeColor: i, nodeBorderRadius: c, nodeClassName: a, nodeStrokeWidth: f, nodeComponent: p }), R.jsx("path", { className: "react-flow__minimap-mask", d: `M${ie - A},${re - A}h${ae + A * 2}v${ce + A * 2}h${-ae - A * 2}z
        M${K.x},${K.y}h${K.width}v${K.height}h${-K.width}z`, fillRule: "evenodd", pointerEvents: "none" })] }) });
}
Rm.displayName = "MiniMap";
const Tk = Y.memo(Rm), Rk = (t) => (r) => t ? `${Math.max(1 / r.transform[2], 1)}` : void 0, bk = {
  [go.Line]: "right",
  [go.Handle]: "bottom-right"
};
function Dk({ nodeId: t, position: r, variant: i = go.Handle, className: l, style: a = void 0, children: c, color: f, minWidth: p = 10, minHeight: h = 10, maxWidth: g = Number.MAX_VALUE, maxHeight: m = Number.MAX_VALUE, keepAspectRatio: v = !1, resizeDirection: y, autoScale: x = !0, shouldResize: _, onResizeStart: M, onResize: N, onResizeEnd: E }) {
  const D = sm(), S = typeof t == "string" ? t : D, P = be(), V = Y.useRef(null), b = i === go.Handle, F = Me(Y.useCallback(Rk(b && x), [b, x]), je), Q = Y.useRef(null), K = r ?? bk[i];
  Y.useEffect(() => {
    if (!(!V.current || !S))
      return Q.current || (Q.current = o_({
        domNode: V.current,
        nodeId: S,
        getStoreItems: () => {
          const { nodeLookup: W, transform: J, snapGrid: ee, snapToGrid: C, nodeOrigin: O, domNode: H } = P.getState();
          return {
            nodeLookup: W,
            transform: J,
            snapGrid: ee,
            snapToGrid: C,
            nodeOrigin: O,
            paneDomNode: H
          };
        },
        onChange: (W, J) => {
          const { triggerNodeChanges: ee, nodeLookup: C, parentLookup: O, nodeOrigin: H } = P.getState(), B = [], T = { x: W.x, y: W.y }, j = C.get(S);
          if (j && j.expandParent && j.parentId) {
            const U = j.origin ?? H, k = W.width ?? j.measured.width ?? 0, A = W.height ?? j.measured.height ?? 0, ie = {
              id: j.id,
              parentId: j.parentId,
              rect: {
                width: k,
                height: A,
                ...zg({
                  x: W.x ?? j.position.x,
                  y: W.y ?? j.position.y
                }, { width: k, height: A }, j.parentId, C, U)
              }
            }, re = Ic([ie], C, O, H);
            B.push(...re), T.x = W.x ? Math.max(U[0] * k, W.x) : void 0, T.y = W.y ? Math.max(U[1] * A, W.y) : void 0;
          }
          if (T.x !== void 0 && T.y !== void 0) {
            const U = {
              id: S,
              type: "position",
              position: { ...T }
            };
            B.push(U);
          }
          if (W.width !== void 0 && W.height !== void 0) {
            const k = {
              id: S,
              type: "dimensions",
              resizing: !0,
              setAttributes: y ? y === "horizontal" ? "width" : "height" : !0,
              dimensions: {
                width: W.width,
                height: W.height
              }
            };
            B.push(k);
          }
          for (const U of J) {
            const k = {
              ...U,
              type: "position"
            };
            B.push(k);
          }
          ee(B);
        },
        onEnd: ({ width: W, height: J }) => {
          const ee = {
            id: S,
            type: "dimensions",
            resizing: !1,
            dimensions: {
              width: W,
              height: J
            }
          };
          P.getState().triggerNodeChanges([ee]);
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
        onResizeStart: M,
        onResize: N,
        onResizeEnd: E,
        shouldResize: _
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
    M,
    N,
    E,
    _
  ]);
  const $ = K.split("-");
  return R.jsx("div", { className: We(["react-flow__resize-control", "nodrag", ...$, i, l]), ref: V, style: {
    ...a,
    scale: F,
    ...f && { [b ? "backgroundColor" : "borderColor"]: f }
  }, children: c });
}
Y.memo(Dk);
function bm({ ids: t }) {
  const r = Me((l) => l.domNode !== null), i = lk();
  return Y.useEffect(() => {
    r && requestAnimationFrame(() => i(t.split(",")));
  }, [r, t, i]), null;
}
const mn = "outputs";
function Eh(t, r) {
  const i = /* @__PURE__ */ new Set(), l = (a) => {
    if (!i.has(a)) {
      i.add(a);
      for (const c of Object.values(t.nodes.find((f) => f.id === a)?.inputs ?? {})) c && l(c);
    }
  };
  return r.forEach(l), i;
}
function Dm(t, r) {
  const i = (c) => Object.entries(t.outputs).filter(([f, p]) => p && c(f)).map(([, f]) => f), l = Eh(t, i((c) => !r.includes(c))), a = Eh(t, i((c) => r.includes(c)));
  return new Set([...a].filter((c) => !l.has(c)));
}
const Ch = 260, Lk = 210;
function Zk(t, r = []) {
  const i = /* @__PURE__ */ new Map(), l = (h, g) => {
    if (i.has(h)) return i.get(h);
    if (g.has(h)) return 0;
    g.add(h);
    const m = t.nodes.find((x) => x.id === h), v = Object.values(m?.inputs ?? {}).filter((x) => !!x), y = v.length === 0 ? 0 : 1 + Math.max(...v.map((x) => l(x, g)));
    return i.set(h, y), y;
  };
  t.nodes.forEach((h) => l(h.id, /* @__PURE__ */ new Set()));
  const a = Math.max(0, ...i.values()) + 1, c = Dm(t, r), f = (h, g) => {
    const m = /* @__PURE__ */ new Map();
    for (const v of h) {
      const y = i.get(v) ?? 0, x = m.get(y) ?? 0;
      m.set(y, x + 1), p[v] = { x: y * Ch, y: g + x * Lk };
    }
  }, p = {};
  return f(t.nodes.map((h) => h.id).filter((h) => !c.has(h)), 0), p[mn] = { x: a * Ch, y: 0 }, p;
}
function Ok({ missing: t, onPlace: r }) {
  const i = Tl(), l = Me((a) => a.domNode);
  return Y.useEffect(() => {
    if (!t || !l) return;
    const a = l.getBoundingClientRect(), c = i.screenToFlowPosition({ x: a.left + a.width / 2, y: a.top + a.height / 2 });
    r(Object.fromEntries(t.split(",").map((f, p) => [f, { x: c.x - 110 + p * 30, y: c.y - 80 + p * 30 }])));
  }, [t, l, i, r]), null;
}
function $k({ data: t, selected: r }) {
  const { lib: i, node: l, idle: a, live: c, onParam: f, onRemove: p, issues: h } = t, g = i.KINDS[l.kind], m = i.KIND_WORDS[l.kind], v = i.NODE_GROUPS[i.KIND_GROUP[l.kind]], y = (x) => l.kind === "subtract" ? x === "a" ? "A - kept" : "B - removed from A" : x === "a" || x === "b" ? x.toUpperCase() : x;
  return /* @__PURE__ */ R.jsxs("div", { className: `zn${a ? " idle" : ""}${g.fixed ? " fixed" : ""}${h.some((x) => !x.warn) ? " has-issue" : ""}`, style: { "--zn-group": `var(${v?.token ?? "--muted"})` }, children: [
    /* @__PURE__ */ R.jsx("div", { className: "zn-group", children: v?.title }),
    /* @__PURE__ */ R.jsxs("div", { className: "zn-head", title: `${l.id} - ${m.says}`, children: [
      /* @__PURE__ */ R.jsx("b", { children: m.title }),
      r && !g.fixed && /* @__PURE__ */ R.jsx("button", { type: "button", className: "zn-remove nodrag", "aria-label": `Remove ${m.title}`, title: "Remove this node (or press Delete)", onClick: () => p(l.id), children: "×" })
    ] }),
    h.map((x) => /* @__PURE__ */ R.jsx("div", { className: x.warn ? "zn-warn" : "zn-issue", children: x.text }, x.text)),
    /* @__PURE__ */ R.jsx("div", { className: "zn-says", children: m.says }),
    Object.entries(g.inputs).map(([x, _]) => (
      // The handle lives INSIDE its row, so it lines up with its label however the sentence above wraps.
      /* @__PURE__ */ R.jsxs("div", { className: "zn-row zn-socket", children: [
        /* @__PURE__ */ R.jsx(xn, { type: "target", position: ye.Left, id: x, className: `h-${_.split("|")[0]}` }),
        /* @__PURE__ */ R.jsx("span", { className: "zn-in", children: y(x) }),
        /* @__PURE__ */ R.jsx("span", { className: "zn-type", children: _ === "mask|rim" ? "faces or a rim line" : _ === "depthMap" ? "depth map" : _ === "mask" ? "faces" : _ })
      ] }, x)
    )),
    Object.entries(l.params).map(([x, _]) => {
      const M = i.PARAM_WORDS[x] ?? { label: x, help: "" }, N = c.includes(`${l.id}.${x}`);
      if (i.FIXED.params[l.kind]?.includes(x)) {
        const E = M.choices?.find(([D]) => D === _)?.[1] ?? String(_);
        return /* @__PURE__ */ R.jsxs("div", { className: "zn-row", title: `${M.help} Locked: this version of the engine does not read a change to it yet.`, children: [
          /* @__PURE__ */ R.jsx("span", { className: "zn-in", children: M.label }),
          /* @__PURE__ */ R.jsxs("span", { className: "zn-fixed", children: [
            E,
            " · locked"
          ] })
        ] }, x);
      }
      return /* @__PURE__ */ R.jsxs("label", { className: "zn-row", title: N ? `${M.help} LIVE: this one runs today.` : M.help, children: [
        /* @__PURE__ */ R.jsxs("span", { className: "zn-in", children: [
          M.label,
          N && /* @__PURE__ */ R.jsx("b", { className: "zn-live", children: " · live" })
        ] }),
        M.choices ? /* @__PURE__ */ R.jsx("select", { className: "nodrag", defaultValue: String(_), title: M.choices.find(([E]) => E === String(_))?.[1], onChange: (E) => f(l.id, x, E.target.value), children: M.choices.map(([E, D]) => /* @__PURE__ */ R.jsx("option", { value: E, children: D }, E)) }) : /* @__PURE__ */ R.jsx(
          "input",
          {
            className: "nodrag",
            defaultValue: String(_),
            type: "number",
            step: "any",
            onBlur: (E) => f(l.id, x, Number(E.target.value))
          }
        )
      ] }, `${x}=${String(_)}`);
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
const Ak = ["rim", "rim_band", "low_rim_band"];
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
          Ak.includes(l) ? "in Orient" : "by the engine"
        ] }),
        /* @__PURE__ */ R.jsx("div", { className: "zo-says", children: r.OUTPUT_WORDS[l].says })
      ] })
    ] }, l))
  ] });
}
const jk = { zone: $k, zoneOutput: Hk };
function Fk(t) {
  const r = t.data, i = r.lib && r.node ? r.lib.NODE_GROUPS[r.lib.KIND_GROUP[r.node.kind]]?.token : void 0;
  return i ? getComputedStyle(document.documentElement).getPropertyValue(i).trim() || "gray" : getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();
}
function Nh({ lib: t, graph: r, positions: i, liveParams: l = [], onGraph: a, onPositions: c }) {
  const f = Y.useMemo(() => new Set(t.unreached(r)), [t, r]), p = Y.useMemo(() => Dm(r, t.FIXED.outputs), [r, t]), h = Y.useMemo(() => {
    const { problems: $, warnings: W } = t.validate(r), J = /* @__PURE__ */ new Map(), ee = (C, O) => {
      const H = C.indexOf(": "), B = H > 0 ? C.slice(0, H) : "";
      r.nodes.some((T) => T.id === B) && J.set(B, [...J.get(B) ?? [], { text: C.slice(H + 2), warn: O }]);
    };
    return $.forEach((C) => ee(C, !1)), W.forEach((C) => ee(C, !0)), J;
  }, [t, r]), g = Y.useCallback(($, W, J) => a(t.setParam(r, $, W, J)), [t, r, a]), m = Y.useCallback(($) => a(t.removeNode(r, $)), [t, r, a]), v = Y.useMemo(() => [
    // What only a fixed output needs (the rim line and its strips from Orient, the sockets) is not
    // drawn: the owner's call, 2026-11-20 - "no reason to make it into a node, just show it is already
    // set". It stays in the graph, because the engine checks those outputs by name.
    ...r.nodes.filter(($) => !p.has($.id)).map(($) => ({
      id: $.id,
      type: "zone",
      position: i[$.id] ?? { x: 0, y: 0 },
      deletable: !t.KINDS[$.kind].fixed,
      data: { lib: t, node: $, idle: f.has($.id), live: l, onParam: g, onRemove: m, issues: h.get($.id) ?? [] }
    })),
    {
      id: mn,
      type: "zoneOutput",
      position: i[mn] ?? { x: 0, y: 0 },
      deletable: !1,
      data: { lib: t, filled: Object.fromEntries(Object.keys(t.REQUIRED_OUTPUTS).map(($) => [$, !!r.outputs[$]])) }
    }
  ], [r, i, t, f, l, g, m, h, p]), [y, x] = Y.useState(v);
  Y.useEffect(() => {
    x(($) => v.map((W) => {
      const J = $.find((ee) => ee.id === W.id);
      return J ? { ...W, measured: J.measured, selected: J.selected } : W;
    }));
  }, [v]);
  const _ = Y.useCallback(($) => x((W) => Tc($, W)), []), M = Y.useMemo(() => [
    ...r.nodes.filter(($) => !p.has($.id)).flatMap(($) => Object.entries($.inputs).filter(([, W]) => W && !p.has(W)).map(([W, J]) => ({
      id: `${J}->${$.id}.${W}`,
      source: J,
      sourceHandle: "out",
      target: $.id,
      targetHandle: W
    }))),
    ...Object.entries(r.outputs).filter(([$, W]) => W && !t.FIXED.outputs.includes($)).map(([$, W]) => ({
      id: `${W}->${mn}.${$}`,
      source: W,
      sourceHandle: "out",
      target: mn,
      targetHandle: $,
      className: "to-output"
    }))
  ], [r, p, t]), [N, E] = Y.useState(M);
  Y.useEffect(() => {
    E(($) => M.map((W) => ({ ...W, selected: $.find((J) => J.id === W.id)?.selected ?? !1 })));
  }, [M]);
  const D = Y.useCallback(($) => E((W) => em($, W)), []), S = Y.useCallback(($) => {
    const W = r.nodes.find((O) => O.id === $.source);
    if (!W || $.source === $.target) return !1;
    const J = t.KINDS[W.kind].out;
    if ($.target === mn) return !!$.targetHandle && !t.FIXED.outputs.includes($.targetHandle) && t.REQUIRED_OUTPUTS[$.targetHandle] === J;
    const ee = r.nodes.find((O) => O.id === $.target), C = ee && $.targetHandle ? t.KINDS[ee.kind].inputs[$.targetHandle] : void 0;
    return !!(C && C.split("|").includes(J));
  }, [r, t]), P = Y.useCallback(($) => {
    !$.source || !$.target || ($.target === mn ? $.targetHandle && a(t.bindOutput(r, $.targetHandle, $.source)) : $.targetHandle && a(t.rewire(r, $.target, $.targetHandle, $.source)));
  }, [r, t, a]), V = Y.useCallback(($) => {
    let W = r;
    for (const J of $)
      J.target === mn ? J.targetHandle && (W = t.bindOutput(W, J.targetHandle, null)) : J.targetHandle && (W = t.rewire(W, J.target, J.targetHandle, null));
    a(W);
  }, [r, t, a]), b = Y.useCallback(($) => {
    let W = r;
    for (const J of $) J.type === "zone" && (W = t.removeNode(W, J.id));
    a(W);
  }, [r, t, a]), F = Y.useCallback(($, W) => c({ ...i, [W.id]: W.position }), [i, c]), Q = Y.useMemo(() => ({
    minZoom: 0.6,
    padding: 0.05,
    nodes: [...r.nodes.filter(($) => !p.has($.id)).map(($) => ({ id: $.id })), { id: mn }]
  }), [r, p]), K = Y.useCallback(($) => c({ ...i, ...$ }), [i, c]);
  return /* @__PURE__ */ R.jsxs(
    Mm,
    {
      nodes: y,
      edges: N,
      nodeTypes: jk,
      isValidConnection: S,
      onConnect: P,
      onEdgesDelete: V,
      onNodesDelete: b,
      onNodeDragStop: F,
      onNodesChange: _,
      onEdgesChange: D,
      deleteKeyCode: ["Backspace", "Delete"],
      fitView: !0,
      fitViewOptions: Q,
      minZoom: 0.2,
      proOptions: { hideAttribution: !1 },
      children: [
        /* @__PURE__ */ R.jsx(bm, { ids: y.map(($) => $.id).join(",") }),
        /* @__PURE__ */ R.jsx(Ok, { missing: r.nodes.filter(($) => !i[$.id]).map(($) => $.id).join(","), onPlace: K }),
        /* @__PURE__ */ R.jsx(Pm, {}),
        /* @__PURE__ */ R.jsx(Tm, { fitViewOptions: Q }),
        /* @__PURE__ */ R.jsx(Tk, { pannable: !0, zoomable: !0, nodeColor: Fk })
      ]
    }
  );
}
const Vk = { frame: "a frame", direction: "a direction", rim: "a rim line", mask: "faces", plane: "a plane", position: "a point" };
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
        r.inputs.map(([i]) => /* @__PURE__ */ R.jsxs("div", { className: "zn-row zn-socket", children: [
          /* @__PURE__ */ R.jsx(xn, { type: "target", position: ye.Left, id: i, isConnectable: !1 }),
          /* @__PURE__ */ R.jsx("span", { className: "zn-in", children: i })
        ] }, i)),
        /* @__PURE__ */ R.jsxs("div", { className: "zn-row zn-out-row", children: [
          /* @__PURE__ */ R.jsxs("span", { className: "zn-outtype", children: [
            "gives ",
            Vk[r.out] ?? r.out
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
function Mh({ view: t }) {
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
  const c = Y.useCallback((h) => a((g) => Tc(h, g)), []), f = Y.useMemo(() => t.flatMap((h) => h.inputs.map(([g, m]) => ({
    id: `${m}->${h.id}.${g}`,
    source: m,
    sourceHandle: "out",
    target: h.id,
    targetHandle: g,
    className: h.derived ? "to-derived" : void 0
  }))), [t]), p = Y.useMemo(() => ({ padding: 0.06, minZoom: 0.8, maxZoom: 1 }), []);
  return /* @__PURE__ */ R.jsxs(
    Mm,
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
        /* @__PURE__ */ R.jsx(bm, { ids: l.map((h) => h.id).join(",") }),
        /* @__PURE__ */ R.jsx(Pm, {}),
        /* @__PURE__ */ R.jsx(Tm, { showInteractive: !1, fitViewOptions: p })
      ]
    }
  );
}
let zh = !1;
function Lm() {
  if (zh) return;
  const t = document.createElement("style");
  t.dataset.ui = "node-editor-css", t.textContent = _y, document.head.append(t), zh = !0;
}
function Qk(t, r) {
  Lm();
  const i = Th.createRoot(t);
  return i.render(/* @__PURE__ */ R.jsx(Nh, { ...r })), {
    update: (l) => i.render(/* @__PURE__ */ R.jsx(Nh, { ...l })),
    unmount: () => i.unmount()
  };
}
function Kk(t, r) {
  Lm();
  const i = Th.createRoot(t);
  return i.render(/* @__PURE__ */ R.jsx(Mh, { ...r }, r.kind)), {
    update: (l) => i.render(/* @__PURE__ */ R.jsx(Mh, { ...l }, l.kind)),
    unmount: () => i.unmount()
  };
}
export {
  Zk as autoLayout,
  Kk as mountRimCanvas,
  Qk as mountZoneEditor
};
