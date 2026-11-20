/* node-editor sources 92e9614a9a1b62cc - rebuild with npm run review:editor */
/*! Contains third-party code - React, React DOM, @xyflow/react and their dependencies, each MIT or ISC. Full licence texts: THIRD-PARTY-NOTICES.txt, written by npm run build. */
function Mh(t) {
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
var tp;
function ly() {
  if (tp) return Ne;
  tp = 1;
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
  function E(k, $, ie) {
    this.props = k, this.context = $, this.refs = M, this.updater = ie || x;
  }
  E.prototype.isReactComponent = {}, E.prototype.setState = function(k, $) {
    if (typeof k != "object" && typeof k != "function" && k != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, k, $, "setState");
  }, E.prototype.forceUpdate = function(k) {
    this.updater.enqueueForceUpdate(this, k, "forceUpdate");
  };
  function C() {
  }
  C.prototype = E.prototype;
  function L(k, $, ie) {
    this.props = k, this.context = $, this.refs = M, this.updater = ie || x;
  }
  var S = L.prototype = new C();
  S.constructor = L, _(S, E.prototype), S.isPureReactComponent = !0;
  var P = Array.isArray, V = Object.prototype.hasOwnProperty, D = { current: null }, j = { key: !0, ref: !0, __self: !0, __source: !0 };
  function Y(k, $, ie) {
    var re, ae = {}, ce = null, ue = null;
    if ($ != null) for (re in $.ref !== void 0 && (ue = $.ref), $.key !== void 0 && (ce = "" + $.key), $) V.call($, re) && !j.hasOwnProperty(re) && (ae[re] = $[re]);
    var q = arguments.length - 2;
    if (q === 1) ae.children = ie;
    else if (1 < q) {
      for (var le = Array(q), ve = 0; ve < q; ve++) le[ve] = arguments[ve + 2];
      ae.children = le;
    }
    if (k && k.defaultProps) for (re in q = k.defaultProps, q) ae[re] === void 0 && (ae[re] = q[re]);
    return { $$typeof: t, type: k, key: ce, ref: ue, props: ae, _owner: D.current };
  }
  function I(k, $) {
    return { $$typeof: t, type: k.type, key: $, ref: k.ref, props: k.props, _owner: k._owner };
  }
  function K(k) {
    return typeof k == "object" && k !== null && k.$$typeof === t;
  }
  function Z(k) {
    var $ = { "=": "=0", ":": "=2" };
    return "$" + k.replace(/[=:]/g, function(ie) {
      return $[ie];
    });
  }
  var ee = /\/+/g;
  function J(k, $) {
    return typeof k == "object" && k !== null && k.key != null ? Z("" + k.key) : $.toString(36);
  }
  function N(k, $, ie, re, ae) {
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
    if (ue) return ue = k, ae = ae(ue), k = re === "" ? "." + J(ue, 0) : re, P(ae) ? (ie = "", k != null && (ie = k.replace(ee, "$&/") + "/"), N(ae, $, ie, "", function(ve) {
      return ve;
    })) : ae != null && (K(ae) && (ae = I(ae, ie + (!ae.key || ue && ue.key === ae.key ? "" : ("" + ae.key).replace(ee, "$&/") + "/") + k)), $.push(ae)), 1;
    if (ue = 0, re = re === "" ? "." : re + ":", P(k)) for (var q = 0; q < k.length; q++) {
      ce = k[q];
      var le = re + J(ce, q);
      ue += N(ce, $, ie, le, ae);
    }
    else if (le = y(k), typeof le == "function") for (k = le.call(k), q = 0; !(ce = k.next()).done; ) ce = ce.value, le = re + J(ce, q++), ue += N(ce, $, ie, le, ae);
    else if (ce === "object") throw $ = String(k), Error("Objects are not valid as a React child (found: " + ($ === "[object Object]" ? "object with keys {" + Object.keys(k).join(", ") + "}" : $) + "). If you meant to render a collection of children, use an array instead.");
    return ue;
  }
  function A(k, $, ie) {
    if (k == null) return k;
    var re = [], ae = 0;
    return N(k, re, "", "", function(ce) {
      return $.call(ie, ce, ae++);
    }), re;
  }
  function O(k) {
    if (k._status === -1) {
      var $ = k._result;
      $ = $(), $.then(function(ie) {
        (k._status === 0 || k._status === -1) && (k._status = 1, k._result = ie);
      }, function(ie) {
        (k._status === 0 || k._status === -1) && (k._status = 2, k._result = ie);
      }), k._status === -1 && (k._status = 0, k._result = $);
    }
    if (k._status === 1) return k._result.default;
    throw k._result;
  }
  var B = { current: null }, R = { transition: null }, H = { ReactCurrentDispatcher: B, ReactCurrentBatchConfig: R, ReactCurrentOwner: D };
  function U() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return Ne.Children = { map: A, forEach: function(k, $, ie) {
    A(k, function() {
      $.apply(this, arguments);
    }, ie);
  }, count: function(k) {
    var $ = 0;
    return A(k, function() {
      $++;
    }), $;
  }, toArray: function(k) {
    return A(k, function($) {
      return $;
    }) || [];
  }, only: function(k) {
    if (!K(k)) throw Error("React.Children.only expected to receive a single React element child.");
    return k;
  } }, Ne.Component = E, Ne.Fragment = i, Ne.Profiler = a, Ne.PureComponent = L, Ne.StrictMode = l, Ne.Suspense = h, Ne.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = H, Ne.act = U, Ne.cloneElement = function(k, $, ie) {
    if (k == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + k + ".");
    var re = _({}, k.props), ae = k.key, ce = k.ref, ue = k._owner;
    if ($ != null) {
      if ($.ref !== void 0 && (ce = $.ref, ue = D.current), $.key !== void 0 && (ae = "" + $.key), k.type && k.type.defaultProps) var q = k.type.defaultProps;
      for (le in $) V.call($, le) && !j.hasOwnProperty(le) && (re[le] = $[le] === void 0 && q !== void 0 ? q[le] : $[le]);
    }
    var le = arguments.length - 2;
    if (le === 1) re.children = ie;
    else if (1 < le) {
      q = Array(le);
      for (var ve = 0; ve < le; ve++) q[ve] = arguments[ve + 2];
      re.children = q;
    }
    return { $$typeof: t, type: k.type, key: ae, ref: ce, props: re, _owner: ue };
  }, Ne.createContext = function(k) {
    return k = { $$typeof: f, _currentValue: k, _currentValue2: k, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, k.Provider = { $$typeof: c, _context: k }, k.Consumer = k;
  }, Ne.createElement = Y, Ne.createFactory = function(k) {
    var $ = Y.bind(null, k);
    return $.type = k, $;
  }, Ne.createRef = function() {
    return { current: null };
  }, Ne.forwardRef = function(k) {
    return { $$typeof: p, render: k };
  }, Ne.isValidElement = K, Ne.lazy = function(k) {
    return { $$typeof: m, _payload: { _status: -1, _result: k }, _init: O };
  }, Ne.memo = function(k, $) {
    return { $$typeof: g, type: k, compare: $ === void 0 ? null : $ };
  }, Ne.startTransition = function(k) {
    var $ = R.transition;
    R.transition = {};
    try {
      k();
    } finally {
      R.transition = $;
    }
  }, Ne.unstable_act = U, Ne.useCallback = function(k, $) {
    return B.current.useCallback(k, $);
  }, Ne.useContext = function(k) {
    return B.current.useContext(k);
  }, Ne.useDebugValue = function() {
  }, Ne.useDeferredValue = function(k) {
    return B.current.useDeferredValue(k);
  }, Ne.useEffect = function(k, $) {
    return B.current.useEffect(k, $);
  }, Ne.useId = function() {
    return B.current.useId();
  }, Ne.useImperativeHandle = function(k, $, ie) {
    return B.current.useImperativeHandle(k, $, ie);
  }, Ne.useInsertionEffect = function(k, $) {
    return B.current.useInsertionEffect(k, $);
  }, Ne.useLayoutEffect = function(k, $) {
    return B.current.useLayoutEffect(k, $);
  }, Ne.useMemo = function(k, $) {
    return B.current.useMemo(k, $);
  }, Ne.useReducer = function(k, $, ie) {
    return B.current.useReducer(k, $, ie);
  }, Ne.useRef = function(k) {
    return B.current.useRef(k);
  }, Ne.useState = function(k) {
    return B.current.useState(k);
  }, Ne.useSyncExternalStore = function(k, $, ie) {
    return B.current.useSyncExternalStore(k, $, ie);
  }, Ne.useTransition = function() {
    return B.current.useTransition();
  }, Ne.version = "18.3.1", Ne;
}
var np;
function Si() {
  return np || (np = 1, Mu.exports = ly()), Mu.exports;
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
var rp;
function ay() {
  if (rp) return si;
  rp = 1;
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
var op;
function uy() {
  return op || (op = 1, Nu.exports = ay()), Nu.exports;
}
var F = uy(), Xs = {}, zu = { exports: {} }, gt = {}, Pu = { exports: {} }, Iu = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ip;
function cy() {
  return ip || (ip = 1, (function(t) {
    function r(R, H) {
      var U = R.length;
      R.push(H);
      e: for (; 0 < U; ) {
        var k = U - 1 >>> 1, $ = R[k];
        if (0 < a($, H)) R[k] = H, R[U] = $, U = k;
        else break e;
      }
    }
    function i(R) {
      return R.length === 0 ? null : R[0];
    }
    function l(R) {
      if (R.length === 0) return null;
      var H = R[0], U = R.pop();
      if (U !== H) {
        R[0] = U;
        e: for (var k = 0, $ = R.length, ie = $ >>> 1; k < ie; ) {
          var re = 2 * (k + 1) - 1, ae = R[re], ce = re + 1, ue = R[ce];
          if (0 > a(ae, U)) ce < $ && 0 > a(ue, ae) ? (R[k] = ue, R[ce] = U, k = ce) : (R[k] = ae, R[re] = U, k = re);
          else if (ce < $ && 0 > a(ue, U)) R[k] = ue, R[ce] = U, k = ce;
          else break e;
        }
      }
      return H;
    }
    function a(R, H) {
      var U = R.sortIndex - H.sortIndex;
      return U !== 0 ? U : R.id - H.id;
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
    var h = [], g = [], m = 1, v = null, y = 3, x = !1, _ = !1, M = !1, E = typeof setTimeout == "function" ? setTimeout : null, C = typeof clearTimeout == "function" ? clearTimeout : null, L = typeof setImmediate < "u" ? setImmediate : null;
    typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function S(R) {
      for (var H = i(g); H !== null; ) {
        if (H.callback === null) l(g);
        else if (H.startTime <= R) l(g), H.sortIndex = H.expirationTime, r(h, H);
        else break;
        H = i(g);
      }
    }
    function P(R) {
      if (M = !1, S(R), !_) if (i(h) !== null) _ = !0, O(V);
      else {
        var H = i(g);
        H !== null && B(P, H.startTime - R);
      }
    }
    function V(R, H) {
      _ = !1, M && (M = !1, C(Y), Y = -1), x = !0;
      var U = y;
      try {
        for (S(H), v = i(h); v !== null && (!(v.expirationTime > H) || R && !Z()); ) {
          var k = v.callback;
          if (typeof k == "function") {
            v.callback = null, y = v.priorityLevel;
            var $ = k(v.expirationTime <= H);
            H = t.unstable_now(), typeof $ == "function" ? v.callback = $ : v === i(h) && l(h), S(H);
          } else l(h);
          v = i(h);
        }
        if (v !== null) var ie = !0;
        else {
          var re = i(g);
          re !== null && B(P, re.startTime - H), ie = !1;
        }
        return ie;
      } finally {
        v = null, y = U, x = !1;
      }
    }
    var D = !1, j = null, Y = -1, I = 5, K = -1;
    function Z() {
      return !(t.unstable_now() - K < I);
    }
    function ee() {
      if (j !== null) {
        var R = t.unstable_now();
        K = R;
        var H = !0;
        try {
          H = j(!0, R);
        } finally {
          H ? J() : (D = !1, j = null);
        }
      } else D = !1;
    }
    var J;
    if (typeof L == "function") J = function() {
      L(ee);
    };
    else if (typeof MessageChannel < "u") {
      var N = new MessageChannel(), A = N.port2;
      N.port1.onmessage = ee, J = function() {
        A.postMessage(null);
      };
    } else J = function() {
      E(ee, 0);
    };
    function O(R) {
      j = R, D || (D = !0, J());
    }
    function B(R, H) {
      Y = E(function() {
        R(t.unstable_now());
      }, H);
    }
    t.unstable_IdlePriority = 5, t.unstable_ImmediatePriority = 1, t.unstable_LowPriority = 4, t.unstable_NormalPriority = 3, t.unstable_Profiling = null, t.unstable_UserBlockingPriority = 2, t.unstable_cancelCallback = function(R) {
      R.callback = null;
    }, t.unstable_continueExecution = function() {
      _ || x || (_ = !0, O(V));
    }, t.unstable_forceFrameRate = function(R) {
      0 > R || 125 < R ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : I = 0 < R ? Math.floor(1e3 / R) : 5;
    }, t.unstable_getCurrentPriorityLevel = function() {
      return y;
    }, t.unstable_getFirstCallbackNode = function() {
      return i(h);
    }, t.unstable_next = function(R) {
      switch (y) {
        case 1:
        case 2:
        case 3:
          var H = 3;
          break;
        default:
          H = y;
      }
      var U = y;
      y = H;
      try {
        return R();
      } finally {
        y = U;
      }
    }, t.unstable_pauseExecution = function() {
    }, t.unstable_requestPaint = function() {
    }, t.unstable_runWithPriority = function(R, H) {
      switch (R) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          R = 3;
      }
      var U = y;
      y = R;
      try {
        return H();
      } finally {
        y = U;
      }
    }, t.unstable_scheduleCallback = function(R, H, U) {
      var k = t.unstable_now();
      switch (typeof U == "object" && U !== null ? (U = U.delay, U = typeof U == "number" && 0 < U ? k + U : k) : U = k, R) {
        case 1:
          var $ = -1;
          break;
        case 2:
          $ = 250;
          break;
        case 5:
          $ = 1073741823;
          break;
        case 4:
          $ = 1e4;
          break;
        default:
          $ = 5e3;
      }
      return $ = U + $, R = { id: m++, callback: H, priorityLevel: R, startTime: U, expirationTime: $, sortIndex: -1 }, U > k ? (R.sortIndex = U, r(g, R), i(h) === null && R === i(g) && (M ? (C(Y), Y = -1) : M = !0, B(P, U - k))) : (R.sortIndex = $, r(h, R), _ || x || (_ = !0, O(V))), R;
    }, t.unstable_shouldYield = Z, t.unstable_wrapCallback = function(R) {
      var H = y;
      return function() {
        var U = y;
        y = H;
        try {
          return R.apply(this, arguments);
        } finally {
          y = U;
        }
      };
    };
  })(Iu)), Iu;
}
var sp;
function fy() {
  return sp || (sp = 1, Pu.exports = cy()), Pu.exports;
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
var lp;
function dy() {
  if (lp) return gt;
  lp = 1;
  var t = Si(), r = fy();
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
  var E = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
    E[e] = new M(e, 0, !1, e, null, !1, !1);
  }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
    var n = e[0];
    E[n] = new M(n, 1, !1, e[1], null, !1, !1);
  }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
    E[e] = new M(e, 2, !1, e.toLowerCase(), null, !1, !1);
  }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
    E[e] = new M(e, 2, !1, e, null, !1, !1);
  }), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
    E[e] = new M(e, 3, !1, e.toLowerCase(), null, !1, !1);
  }), ["checked", "multiple", "muted", "selected"].forEach(function(e) {
    E[e] = new M(e, 3, !0, e, null, !1, !1);
  }), ["capture", "download"].forEach(function(e) {
    E[e] = new M(e, 4, !1, e, null, !1, !1);
  }), ["cols", "rows", "size", "span"].forEach(function(e) {
    E[e] = new M(e, 6, !1, e, null, !1, !1);
  }), ["rowSpan", "start"].forEach(function(e) {
    E[e] = new M(e, 5, !1, e.toLowerCase(), null, !1, !1);
  });
  var C = /[\-:]([a-z])/g;
  function L(e) {
    return e[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
    var n = e.replace(
      C,
      L
    );
    E[n] = new M(n, 1, !1, e, null, !1, !1);
  }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
    var n = e.replace(C, L);
    E[n] = new M(n, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
  }), ["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
    var n = e.replace(C, L);
    E[n] = new M(n, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
  }), ["tabIndex", "crossOrigin"].forEach(function(e) {
    E[e] = new M(e, 1, !1, e.toLowerCase(), null, !1, !1);
  }), E.xlinkHref = new M("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), ["src", "href", "action", "formAction"].forEach(function(e) {
    E[e] = new M(e, 1, !1, e.toLowerCase(), null, !0, !0);
  });
  function S(e, n, o, s) {
    var u = E.hasOwnProperty(n) ? E[n] : null;
    (u !== null ? u.type !== 0 : s || !(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && (_(n, o, u, s) && (o = null), s || u === null ? y(n) && (o === null ? e.removeAttribute(n) : e.setAttribute(n, "" + o)) : u.mustUseProperty ? e[u.propertyName] = o === null ? u.type === 3 ? !1 : "" : o : (n = u.attributeName, s = u.attributeNamespace, o === null ? e.removeAttribute(n) : (u = u.type, o = u === 3 || u === 4 && o === !0 ? "" : "" + o, s ? e.setAttributeNS(s, n, o) : e.setAttribute(n, o))));
  }
  var P = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, V = Symbol.for("react.element"), D = Symbol.for("react.portal"), j = Symbol.for("react.fragment"), Y = Symbol.for("react.strict_mode"), I = Symbol.for("react.profiler"), K = Symbol.for("react.provider"), Z = Symbol.for("react.context"), ee = Symbol.for("react.forward_ref"), J = Symbol.for("react.suspense"), N = Symbol.for("react.suspense_list"), A = Symbol.for("react.memo"), O = Symbol.for("react.lazy"), B = Symbol.for("react.offscreen"), R = Symbol.iterator;
  function H(e) {
    return e === null || typeof e != "object" ? null : (e = R && e[R] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var U = Object.assign, k;
  function $(e) {
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
                var T = `
` + u[w].replace(" at new ", " at ");
                return e.displayName && T.includes("<anonymous>") && (T = T.replace("<anonymous>", e.displayName)), T;
              }
            while (1 <= w && 0 <= z);
          break;
        }
      }
    } finally {
      ie = !1, Error.prepareStackTrace = o;
    }
    return (e = e ? e.displayName || e.name : "") ? $(e) : "";
  }
  function ae(e) {
    switch (e.tag) {
      case 5:
        return $(e.type);
      case 16:
        return $("Lazy");
      case 13:
        return $("Suspense");
      case 19:
        return $("SuspenseList");
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
      case j:
        return "Fragment";
      case D:
        return "Portal";
      case I:
        return "Profiler";
      case Y:
        return "StrictMode";
      case J:
        return "Suspense";
      case N:
        return "SuspenseList";
    }
    if (typeof e == "object") switch (e.$$typeof) {
      case Z:
        return (e.displayName || "Context") + ".Consumer";
      case K:
        return (e._context.displayName || "Context") + ".Provider";
      case ee:
        var n = e.render;
        return e = e.displayName, e || (e = n.displayName || n.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
      case A:
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
        return n === Y ? "StrictMode" : "Mode";
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
  function ve(e) {
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
    e._valueTracker || (e._valueTracker = ve(e));
  }
  function me(e) {
    if (!e) return !1;
    var n = e._valueTracker;
    if (!n) return !0;
    var o = n.getValue(), s = "";
    return e && (s = le(e) ? e.checked ? "true" : "false" : e.value), e = s, e !== o ? (n.setValue(e), !0) : !1;
  }
  function ye(e) {
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
    (n !== "number" || ye(e.ownerDocument) !== e) && (o == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + o && (e.defaultValue = "" + o));
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
  var Yn = {
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
  }, bl = ["Webkit", "ms", "Moz", "O"];
  Object.keys(Yn).forEach(function(e) {
    bl.forEach(function(n) {
      n = n + e.charAt(0).toUpperCase() + e.substring(1), Yn[n] = Yn[e];
    });
  });
  function Pi(e, n, o) {
    return n == null || typeof n == "boolean" || n === "" ? "" : o || typeof n != "number" || n === 0 || Yn.hasOwnProperty(e) && Yn[e] ? ("" + n).trim() : n + "px";
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
  var _o = null, xn = null, _n = null;
  function Ti(e) {
    if (e = Wo(e)) {
      if (typeof _o != "function") throw Error(i(280));
      var n = e.stateNode;
      n && (n = ls(n), _o(e.stateNode, e.type, n));
    }
  }
  function Ri(e) {
    xn ? _n ? _n.push(e) : _n = [e] : xn = e;
  }
  function Di() {
    if (xn) {
      var e = xn, n = _n;
      if (_n = xn = null, Ti(e), n) for (e = 0; e < n.length; e++) Ti(n[e]);
    }
  }
  function bi(e, n) {
    return e(n);
  }
  function Li() {
  }
  var So = !1;
  function Ai(e, n, o) {
    if (So) return e(n, o);
    So = !0;
    try {
      return bi(e, n, o);
    } finally {
      So = !1, (xn !== null || _n !== null) && (Li(), Di());
    }
  }
  function Zn(e, n) {
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
    var Qn = {};
    Object.defineProperty(Qn, "passive", { get: function() {
      ko = !0;
    } }), window.addEventListener("test", Qn, Qn), window.removeEventListener("test", Qn, Qn);
  } catch {
    ko = !1;
  }
  function Al(e, n, o, s, u, d, w, z, T) {
    var G = Array.prototype.slice.call(arguments, 3);
    try {
      n.apply(o, G);
    } catch (ne) {
      this.onError(ne);
    }
  }
  var Kn = !1, Nr = null, Mr = !1, Eo = null, $l = { onError: function(e) {
    Kn = !0, Nr = e;
  } };
  function Ol(e, n, o, s, u, d, w, z, T) {
    Kn = !1, Nr = null, Al.apply($l, arguments);
  }
  function Hl(e, n, o, s, u, d, w, z, T) {
    if (Ol.apply(this, arguments), Kn) {
      if (Kn) {
        var G = Nr;
        Kn = !1, Nr = null;
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
    return e = jl(e), e !== null ? Oi(e) : null;
  }
  function Oi(e) {
    if (e.tag === 5 || e.tag === 6) return e;
    for (e = e.child; e !== null; ) {
      var n = Oi(e);
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
  function Gn(e) {
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
  function qn(e, n) {
    var o = e.pendingLanes;
    if (o === 0) return 0;
    var s = 0, u = e.suspendedLanes, d = e.pingedLanes, w = o & 268435455;
    if (w !== 0) {
      var z = w & ~u;
      z !== 0 ? s = Gn(z) : (d &= w, d !== 0 && (s = Gn(d)));
    } else w = o & ~u, w !== 0 ? s = Gn(w) : d !== 0 && (s = Gn(d));
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
      var w = 31 - vt(d), z = 1 << w, T = u[w];
      T === -1 ? ((z & o) === 0 || (z & s) !== 0) && (u[w] = Zl(z, n)) : T <= n && (e.expiredLanes |= z), d &= ~z;
    }
  }
  function zo(e) {
    return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
  }
  function Wi() {
    var e = Ir;
    return Ir <<= 1, (Ir & 4194240) === 0 && (Ir = 64), e;
  }
  function Jn(e) {
    for (var n = [], o = 0; 31 > o; o++) n.push(e);
    return n;
  }
  function er(e, n, o) {
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
  function Rc(e) {
    return e &= -e, 1 < e ? 4 < e ? (e & 268435455) !== 0 ? 16 : 536870912 : 4 : 1;
  }
  var Dc, Kl, bc, Lc, Ac, Gl = !1, Xi = [], Sn = null, kn = null, En = null, Po = /* @__PURE__ */ new Map(), Io = /* @__PURE__ */ new Map(), Cn = [], Pm = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  function $c(e, n) {
    switch (e) {
      case "focusin":
      case "focusout":
        Sn = null;
        break;
      case "dragenter":
      case "dragleave":
        kn = null;
        break;
      case "mouseover":
      case "mouseout":
        En = null;
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
  function Im(e, n, o, s, u) {
    switch (n) {
      case "focusin":
        return Sn = To(Sn, e, n, o, s, u), !0;
      case "dragenter":
        return kn = To(kn, e, n, o, s, u), !0;
      case "mouseover":
        return En = To(En, e, n, o, s, u), !0;
      case "pointerover":
        var d = u.pointerId;
        return Po.set(d, To(Po.get(d) || null, e, n, o, s, u)), !0;
      case "gotpointercapture":
        return d = u.pointerId, Io.set(d, To(Io.get(d) || null, e, n, o, s, u)), !0;
    }
    return !1;
  }
  function Oc(e) {
    var n = tr(e.target);
    if (n !== null) {
      var o = Qt(n);
      if (o !== null) {
        if (n = o.tag, n === 13) {
          if (n = Co(o), n !== null) {
            e.blockedOn = n, Ac(e.priority, function() {
              bc(o);
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
  function Hc(e, n, o) {
    Yi(e) && o.delete(n);
  }
  function Tm() {
    Gl = !1, Sn !== null && Yi(Sn) && (Sn = null), kn !== null && Yi(kn) && (kn = null), En !== null && Yi(En) && (En = null), Po.forEach(Hc), Io.forEach(Hc);
  }
  function Ro(e, n) {
    e.blockedOn === n && (e.blockedOn = null, Gl || (Gl = !0, r.unstable_scheduleCallback(r.unstable_NormalPriority, Tm)));
  }
  function Do(e) {
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
    for (Sn !== null && Ro(Sn, e), kn !== null && Ro(kn, e), En !== null && Ro(En, e), Po.forEach(n), Io.forEach(n), o = 0; o < Cn.length; o++) s = Cn[o], s.blockedOn === e && (s.blockedOn = null);
    for (; 0 < Cn.length && (o = Cn[0], o.blockedOn === null); ) Oc(o), o.blockedOn === null && Cn.shift();
  }
  var Dr = P.ReactCurrentBatchConfig, Zi = !0;
  function Rm(e, n, o, s) {
    var u = Te, d = Dr.transition;
    Dr.transition = null;
    try {
      Te = 1, ql(e, n, o, s);
    } finally {
      Te = u, Dr.transition = d;
    }
  }
  function Dm(e, n, o, s) {
    var u = Te, d = Dr.transition;
    Dr.transition = null;
    try {
      Te = 4, ql(e, n, o, s);
    } finally {
      Te = u, Dr.transition = d;
    }
  }
  function ql(e, n, o, s) {
    if (Zi) {
      var u = Jl(e, n, o, s);
      if (u === null) ma(e, n, s, Qi, o), $c(e, s);
      else if (Im(u, e, n, o, s)) s.stopPropagation();
      else if ($c(e, s), n & 4 && -1 < Pm.indexOf(e)) {
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
    if (Qi = null, e = xo(s), e = tr(e), e !== null) if (n = Qt(e), n === null) e = null;
    else if (o = n.tag, o === 13) {
      if (e = Co(n), e !== null) return e;
      e = null;
    } else if (o === 3) {
      if (n.stateNode.current.memoizedState.isDehydrated) return n.tag === 3 ? n.stateNode.containerInfo : null;
      e = null;
    } else n !== e && (e = null);
    return Qi = e, null;
  }
  function jc(e) {
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
  var Nn = null, ea = null, Ki = null;
  function Fc() {
    if (Ki) return Ki;
    var e, n = ea, o = n.length, s, u = "value" in Nn ? Nn.value : Nn.textContent, d = u.length;
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
  function Vc() {
    return !1;
  }
  function wt(e) {
    function n(o, s, u, d, w) {
      this._reactName = o, this._targetInst = u, this.type = s, this.nativeEvent = d, this.target = w, this.currentTarget = null;
      for (var z in e) e.hasOwnProperty(z) && (o = e[z], this[z] = o ? o(d) : d[z]);
      return this.isDefaultPrevented = (d.defaultPrevented != null ? d.defaultPrevented : d.returnValue === !1) ? qi : Vc, this.isPropagationStopped = Vc, this;
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
  var br = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
    return e.timeStamp || Date.now();
  }, defaultPrevented: 0, isTrusted: 0 }, ta = wt(br), bo = U({}, br, { view: 0, detail: 0 }), bm = wt(bo), na, ra, Lo, Ji = U({}, bo, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: ia, button: 0, buttons: 0, relatedTarget: function(e) {
    return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
  }, movementX: function(e) {
    return "movementX" in e ? e.movementX : (e !== Lo && (Lo && e.type === "mousemove" ? (na = e.screenX - Lo.screenX, ra = e.screenY - Lo.screenY) : ra = na = 0, Lo = e), na);
  }, movementY: function(e) {
    return "movementY" in e ? e.movementY : ra;
  } }), Bc = wt(Ji), Lm = U({}, Ji, { dataTransfer: 0 }), Am = wt(Lm), $m = U({}, bo, { relatedTarget: 0 }), oa = wt($m), Om = U({}, br, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), Hm = wt(Om), jm = U({}, br, { clipboardData: function(e) {
    return "clipboardData" in e ? e.clipboardData : window.clipboardData;
  } }), Fm = wt(jm), Vm = U({}, br, { data: 0 }), Uc = wt(Vm), Bm = {
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
  }, Um = {
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
  }, Wm = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function Xm(e) {
    var n = this.nativeEvent;
    return n.getModifierState ? n.getModifierState(e) : (e = Wm[e]) ? !!n[e] : !1;
  }
  function ia() {
    return Xm;
  }
  var Ym = U({}, bo, { key: function(e) {
    if (e.key) {
      var n = Bm[e.key] || e.key;
      if (n !== "Unidentified") return n;
    }
    return e.type === "keypress" ? (e = Gi(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Um[e.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: ia, charCode: function(e) {
    return e.type === "keypress" ? Gi(e) : 0;
  }, keyCode: function(e) {
    return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
  }, which: function(e) {
    return e.type === "keypress" ? Gi(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
  } }), Zm = wt(Ym), Qm = U({}, Ji, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Wc = wt(Qm), Km = U({}, bo, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: ia }), Gm = wt(Km), qm = U({}, br, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Jm = wt(qm), e0 = U({}, Ji, {
    deltaX: function(e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function(e) {
      return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), t0 = wt(e0), n0 = [9, 13, 27, 32], sa = p && "CompositionEvent" in window, Ao = null;
  p && "documentMode" in document && (Ao = document.documentMode);
  var r0 = p && "TextEvent" in window && !Ao, Xc = p && (!sa || Ao && 8 < Ao && 11 >= Ao), Yc = " ", Zc = !1;
  function Qc(e, n) {
    switch (e) {
      case "keyup":
        return n0.indexOf(n.keyCode) !== -1;
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
  function Kc(e) {
    return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
  }
  var Lr = !1;
  function o0(e, n) {
    switch (e) {
      case "compositionend":
        return Kc(n);
      case "keypress":
        return n.which !== 32 ? null : (Zc = !0, Yc);
      case "textInput":
        return e = n.data, e === Yc && Zc ? null : e;
      default:
        return null;
    }
  }
  function i0(e, n) {
    if (Lr) return e === "compositionend" || !sa && Qc(e, n) ? (e = Fc(), Ki = ea = Nn = null, Lr = !1, e) : null;
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
        return Xc && n.locale !== "ko" ? null : n.data;
      default:
        return null;
    }
  }
  var s0 = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
  function Gc(e) {
    var n = e && e.nodeName && e.nodeName.toLowerCase();
    return n === "input" ? !!s0[e.type] : n === "textarea";
  }
  function qc(e, n, o, s) {
    Ri(s), n = os(n, "onChange"), 0 < n.length && (o = new ta("onChange", "change", null, o, s), e.push({ event: o, listeners: n }));
  }
  var $o = null, Oo = null;
  function l0(e) {
    yf(e, 0);
  }
  function es(e) {
    var n = jr(e);
    if (me(n)) return e;
  }
  function a0(e, n) {
    if (e === "change") return n;
  }
  var Jc = !1;
  if (p) {
    var la;
    if (p) {
      var aa = "oninput" in document;
      if (!aa) {
        var ef = document.createElement("div");
        ef.setAttribute("oninput", "return;"), aa = typeof ef.oninput == "function";
      }
      la = aa;
    } else la = !1;
    Jc = la && (!document.documentMode || 9 < document.documentMode);
  }
  function tf() {
    $o && ($o.detachEvent("onpropertychange", nf), Oo = $o = null);
  }
  function nf(e) {
    if (e.propertyName === "value" && es(Oo)) {
      var n = [];
      qc(n, Oo, e, xo(e)), Ai(l0, n);
    }
  }
  function u0(e, n, o) {
    e === "focusin" ? (tf(), $o = n, Oo = o, $o.attachEvent("onpropertychange", nf)) : e === "focusout" && tf();
  }
  function c0(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown") return es(Oo);
  }
  function f0(e, n) {
    if (e === "click") return es(n);
  }
  function d0(e, n) {
    if (e === "input" || e === "change") return es(n);
  }
  function p0(e, n) {
    return e === n && (e !== 0 || 1 / e === 1 / n) || e !== e && n !== n;
  }
  var bt = typeof Object.is == "function" ? Object.is : p0;
  function Ho(e, n) {
    if (bt(e, n)) return !0;
    if (typeof e != "object" || e === null || typeof n != "object" || n === null) return !1;
    var o = Object.keys(e), s = Object.keys(n);
    if (o.length !== s.length) return !1;
    for (s = 0; s < o.length; s++) {
      var u = o[s];
      if (!h.call(n, u) || !bt(e[u], n[u])) return !1;
    }
    return !0;
  }
  function rf(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function of(e, n) {
    var o = rf(e);
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
      o = rf(o);
    }
  }
  function sf(e, n) {
    return e && n ? e === n ? !0 : e && e.nodeType === 3 ? !1 : n && n.nodeType === 3 ? sf(e, n.parentNode) : "contains" in e ? e.contains(n) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(n) & 16) : !1 : !1;
  }
  function lf() {
    for (var e = window, n = ye(); n instanceof e.HTMLIFrameElement; ) {
      try {
        var o = typeof n.contentWindow.location.href == "string";
      } catch {
        o = !1;
      }
      if (o) e = n.contentWindow;
      else break;
      n = ye(e.document);
    }
    return n;
  }
  function ua(e) {
    var n = e && e.nodeName && e.nodeName.toLowerCase();
    return n && (n === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || n === "textarea" || e.contentEditable === "true");
  }
  function h0(e) {
    var n = lf(), o = e.focusedElem, s = e.selectionRange;
    if (n !== o && o && o.ownerDocument && sf(o.ownerDocument.documentElement, o)) {
      if (s !== null && ua(o)) {
        if (n = s.start, e = s.end, e === void 0 && (e = n), "selectionStart" in o) o.selectionStart = n, o.selectionEnd = Math.min(e, o.value.length);
        else if (e = (n = o.ownerDocument || document) && n.defaultView || window, e.getSelection) {
          e = e.getSelection();
          var u = o.textContent.length, d = Math.min(s.start, u);
          s = s.end === void 0 ? d : Math.min(s.end, u), !e.extend && d > s && (u = s, s = d, d = u), u = of(o, d);
          var w = of(
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
  var g0 = p && "documentMode" in document && 11 >= document.documentMode, Ar = null, ca = null, jo = null, fa = !1;
  function af(e, n, o) {
    var s = o.window === o ? o.document : o.nodeType === 9 ? o : o.ownerDocument;
    fa || Ar == null || Ar !== ye(s) || (s = Ar, "selectionStart" in s && ua(s) ? s = { start: s.selectionStart, end: s.selectionEnd } : (s = (s.ownerDocument && s.ownerDocument.defaultView || window).getSelection(), s = { anchorNode: s.anchorNode, anchorOffset: s.anchorOffset, focusNode: s.focusNode, focusOffset: s.focusOffset }), jo && Ho(jo, s) || (jo = s, s = os(ca, "onSelect"), 0 < s.length && (n = new ta("onSelect", "select", null, n, o), e.push({ event: n, listeners: s }), n.target = Ar)));
  }
  function ts(e, n) {
    var o = {};
    return o[e.toLowerCase()] = n.toLowerCase(), o["Webkit" + e] = "webkit" + n, o["Moz" + e] = "moz" + n, o;
  }
  var $r = { animationend: ts("Animation", "AnimationEnd"), animationiteration: ts("Animation", "AnimationIteration"), animationstart: ts("Animation", "AnimationStart"), transitionend: ts("Transition", "TransitionEnd") }, da = {}, uf = {};
  p && (uf = document.createElement("div").style, "AnimationEvent" in window || (delete $r.animationend.animation, delete $r.animationiteration.animation, delete $r.animationstart.animation), "TransitionEvent" in window || delete $r.transitionend.transition);
  function ns(e) {
    if (da[e]) return da[e];
    if (!$r[e]) return e;
    var n = $r[e], o;
    for (o in n) if (n.hasOwnProperty(o) && o in uf) return da[e] = n[o];
    return e;
  }
  var cf = ns("animationend"), ff = ns("animationiteration"), df = ns("animationstart"), pf = ns("transitionend"), hf = /* @__PURE__ */ new Map(), gf = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function Mn(e, n) {
    hf.set(e, n), c(n, [e]);
  }
  for (var pa = 0; pa < gf.length; pa++) {
    var ha = gf[pa], m0 = ha.toLowerCase(), y0 = ha[0].toUpperCase() + ha.slice(1);
    Mn(m0, "on" + y0);
  }
  Mn(cf, "onAnimationEnd"), Mn(ff, "onAnimationIteration"), Mn(df, "onAnimationStart"), Mn("dblclick", "onDoubleClick"), Mn("focusin", "onFocus"), Mn("focusout", "onBlur"), Mn(pf, "onTransitionEnd"), f("onMouseEnter", ["mouseout", "mouseover"]), f("onMouseLeave", ["mouseout", "mouseover"]), f("onPointerEnter", ["pointerout", "pointerover"]), f("onPointerLeave", ["pointerout", "pointerover"]), c("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), c("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), c("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), c("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var Fo = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), v0 = new Set("cancel close invalid load scroll toggle".split(" ").concat(Fo));
  function mf(e, n, o) {
    var s = e.type || "unknown-event";
    e.currentTarget = o, Hl(s, n, void 0, e), e.currentTarget = null;
  }
  function yf(e, n) {
    n = (n & 4) !== 0;
    for (var o = 0; o < e.length; o++) {
      var s = e[o], u = s.event;
      s = s.listeners;
      e: {
        var d = void 0;
        if (n) for (var w = s.length - 1; 0 <= w; w--) {
          var z = s[w], T = z.instance, G = z.currentTarget;
          if (z = z.listener, T !== d && u.isPropagationStopped()) break e;
          mf(u, z, G), d = T;
        }
        else for (w = 0; w < s.length; w++) {
          if (z = s[w], T = z.instance, G = z.currentTarget, z = z.listener, T !== d && u.isPropagationStopped()) break e;
          mf(u, z, G), d = T;
        }
      }
    }
    if (Mr) throw e = Eo, Mr = !1, Eo = null, e;
  }
  function be(e, n) {
    var o = n[Sa];
    o === void 0 && (o = n[Sa] = /* @__PURE__ */ new Set());
    var s = e + "__bubble";
    o.has(s) || (vf(n, e, 2, !1), o.add(s));
  }
  function ga(e, n, o) {
    var s = 0;
    n && (s |= 4), vf(o, e, s, n);
  }
  var rs = "_reactListening" + Math.random().toString(36).slice(2);
  function Vo(e) {
    if (!e[rs]) {
      e[rs] = !0, l.forEach(function(o) {
        o !== "selectionchange" && (v0.has(o) || ga(o, !1, e), ga(o, !0, e));
      });
      var n = e.nodeType === 9 ? e : e.ownerDocument;
      n === null || n[rs] || (n[rs] = !0, ga("selectionchange", !1, n));
    }
  }
  function vf(e, n, o, s) {
    switch (jc(n)) {
      case 1:
        var u = Rm;
        break;
      case 4:
        u = Dm;
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
          var T = w.tag;
          if ((T === 3 || T === 4) && (T = w.stateNode.containerInfo, T === u || T.nodeType === 8 && T.parentNode === u)) return;
          w = w.return;
        }
        for (; z !== null; ) {
          if (w = tr(z), w === null) return;
          if (T = w.tag, T === 5 || T === 6) {
            s = d = w;
            continue e;
          }
          z = z.parentNode;
        }
      }
      s = s.return;
    }
    Ai(function() {
      var G = d, ne = xo(o), oe = [];
      e: {
        var te = hf.get(e);
        if (te !== void 0) {
          var fe = ta, pe = e;
          switch (e) {
            case "keypress":
              if (Gi(o) === 0) break e;
            case "keydown":
            case "keyup":
              fe = Zm;
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
              fe = Bc;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              fe = Am;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              fe = Gm;
              break;
            case cf:
            case ff:
            case df:
              fe = Hm;
              break;
            case pf:
              fe = Jm;
              break;
            case "scroll":
              fe = bm;
              break;
            case "wheel":
              fe = t0;
              break;
            case "copy":
            case "cut":
            case "paste":
              fe = Fm;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              fe = Wc;
          }
          var he = (n & 4) !== 0, Be = !he && e === "scroll", W = he ? te !== null ? te + "Capture" : null : te;
          he = [];
          for (var b = G, X; b !== null; ) {
            X = b;
            var se = X.stateNode;
            if (X.tag === 5 && se !== null && (X = se, W !== null && (se = Zn(b, W), se != null && he.push(Bo(b, se, X)))), Be) break;
            b = b.return;
          }
          0 < he.length && (te = new fe(te, pe, null, o, ne), oe.push({ event: te, listeners: he }));
        }
      }
      if ((n & 7) === 0) {
        e: {
          if (te = e === "mouseover" || e === "pointerover", fe = e === "mouseout" || e === "pointerout", te && o !== wo && (pe = o.relatedTarget || o.fromElement) && (tr(pe) || pe[ln])) break e;
          if ((fe || te) && (te = ne.window === ne ? ne : (te = ne.ownerDocument) ? te.defaultView || te.parentWindow : window, fe ? (pe = o.relatedTarget || o.toElement, fe = G, pe = pe ? tr(pe) : null, pe !== null && (Be = Qt(pe), pe !== Be || pe.tag !== 5 && pe.tag !== 6) && (pe = null)) : (fe = null, pe = G), fe !== pe)) {
            if (he = Bc, se = "onMouseLeave", W = "onMouseEnter", b = "mouse", (e === "pointerout" || e === "pointerover") && (he = Wc, se = "onPointerLeave", W = "onPointerEnter", b = "pointer"), Be = fe == null ? te : jr(fe), X = pe == null ? te : jr(pe), te = new he(se, b + "leave", fe, o, ne), te.target = Be, te.relatedTarget = X, se = null, tr(ne) === G && (he = new he(W, b + "enter", pe, o, ne), he.target = X, he.relatedTarget = Be, se = he), Be = se, fe && pe) t: {
              for (he = fe, W = pe, b = 0, X = he; X; X = Or(X)) b++;
              for (X = 0, se = W; se; se = Or(se)) X++;
              for (; 0 < b - X; ) he = Or(he), b--;
              for (; 0 < X - b; ) W = Or(W), X--;
              for (; b--; ) {
                if (he === W || W !== null && he === W.alternate) break t;
                he = Or(he), W = Or(W);
              }
              he = null;
            }
            else he = null;
            fe !== null && wf(oe, te, fe, he, !1), pe !== null && Be !== null && wf(oe, Be, pe, he, !0);
          }
        }
        e: {
          if (te = G ? jr(G) : window, fe = te.nodeName && te.nodeName.toLowerCase(), fe === "select" || fe === "input" && te.type === "file") var ge = a0;
          else if (Gc(te)) if (Jc) ge = d0;
          else {
            ge = c0;
            var xe = u0;
          }
          else (fe = te.nodeName) && fe.toLowerCase() === "input" && (te.type === "checkbox" || te.type === "radio") && (ge = f0);
          if (ge && (ge = ge(e, G))) {
            qc(oe, ge, o, ne);
            break e;
          }
          xe && xe(e, te, G), e === "focusout" && (xe = te._wrapperState) && xe.controlled && te.type === "number" && at(te, "number", te.value);
        }
        switch (xe = G ? jr(G) : window, e) {
          case "focusin":
            (Gc(xe) || xe.contentEditable === "true") && (Ar = xe, ca = G, jo = null);
            break;
          case "focusout":
            jo = ca = Ar = null;
            break;
          case "mousedown":
            fa = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            fa = !1, af(oe, o, ne);
            break;
          case "selectionchange":
            if (g0) break;
          case "keydown":
          case "keyup":
            af(oe, o, ne);
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
        else Lr ? Qc(e, o) && (ke = "onCompositionEnd") : e === "keydown" && o.keyCode === 229 && (ke = "onCompositionStart");
        ke && (Xc && o.locale !== "ko" && (Lr || ke !== "onCompositionStart" ? ke === "onCompositionEnd" && Lr && (_e = Fc()) : (Nn = ne, ea = "value" in Nn ? Nn.value : Nn.textContent, Lr = !0)), xe = os(G, ke), 0 < xe.length && (ke = new Uc(ke, e, null, o, ne), oe.push({ event: ke, listeners: xe }), _e ? ke.data = _e : (_e = Kc(o), _e !== null && (ke.data = _e)))), (_e = r0 ? o0(e, o) : i0(e, o)) && (G = os(G, "onBeforeInput"), 0 < G.length && (ne = new Uc("onBeforeInput", "beforeinput", null, o, ne), oe.push({ event: ne, listeners: G }), ne.data = _e));
      }
      yf(oe, n);
    });
  }
  function Bo(e, n, o) {
    return { instance: e, listener: n, currentTarget: o };
  }
  function os(e, n) {
    for (var o = n + "Capture", s = []; e !== null; ) {
      var u = e, d = u.stateNode;
      u.tag === 5 && d !== null && (u = d, d = Zn(e, o), d != null && s.unshift(Bo(e, d, u)), d = Zn(e, n), d != null && s.push(Bo(e, d, u))), e = e.return;
    }
    return s;
  }
  function Or(e) {
    if (e === null) return null;
    do
      e = e.return;
    while (e && e.tag !== 5);
    return e || null;
  }
  function wf(e, n, o, s, u) {
    for (var d = n._reactName, w = []; o !== null && o !== s; ) {
      var z = o, T = z.alternate, G = z.stateNode;
      if (T !== null && T === s) break;
      z.tag === 5 && G !== null && (z = G, u ? (T = Zn(o, d), T != null && w.unshift(Bo(o, T, z))) : u || (T = Zn(o, d), T != null && w.push(Bo(o, T, z)))), o = o.return;
    }
    w.length !== 0 && e.push({ event: n, listeners: w });
  }
  var w0 = /\r\n?/g, x0 = /\u0000|\uFFFD/g;
  function xf(e) {
    return (typeof e == "string" ? e : "" + e).replace(w0, `
`).replace(x0, "");
  }
  function is(e, n, o) {
    if (n = xf(n), xf(e) !== n && o) throw Error(i(425));
  }
  function ss() {
  }
  var ya = null, va = null;
  function wa(e, n) {
    return e === "textarea" || e === "noscript" || typeof n.children == "string" || typeof n.children == "number" || typeof n.dangerouslySetInnerHTML == "object" && n.dangerouslySetInnerHTML !== null && n.dangerouslySetInnerHTML.__html != null;
  }
  var xa = typeof setTimeout == "function" ? setTimeout : void 0, _0 = typeof clearTimeout == "function" ? clearTimeout : void 0, _f = typeof Promise == "function" ? Promise : void 0, S0 = typeof queueMicrotask == "function" ? queueMicrotask : typeof _f < "u" ? function(e) {
    return _f.resolve(null).then(e).catch(k0);
  } : xa;
  function k0(e) {
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
          e.removeChild(u), Do(n);
          return;
        }
        s--;
      } else o !== "$" && o !== "$?" && o !== "$!" || s++;
      o = u;
    } while (o);
    Do(n);
  }
  function zn(e) {
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
  function Sf(e) {
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
  var Hr = Math.random().toString(36).slice(2), Kt = "__reactFiber$" + Hr, Uo = "__reactProps$" + Hr, ln = "__reactContainer$" + Hr, Sa = "__reactEvents$" + Hr, E0 = "__reactListeners$" + Hr, C0 = "__reactHandles$" + Hr;
  function tr(e) {
    var n = e[Kt];
    if (n) return n;
    for (var o = e.parentNode; o; ) {
      if (n = o[ln] || o[Kt]) {
        if (o = n.alternate, n.child !== null || o !== null && o.child !== null) for (e = Sf(e); e !== null; ) {
          if (o = e[Kt]) return o;
          e = Sf(e);
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
  function Pn(e) {
    return { current: e };
  }
  function Le(e) {
    0 > Fr || (e.current = ka[Fr], ka[Fr] = null, Fr--);
  }
  function Re(e, n) {
    Fr++, ka[Fr] = e.current, e.current = n;
  }
  var In = {}, nt = Pn(In), ct = Pn(!1), nr = In;
  function Vr(e, n) {
    var o = e.type.contextTypes;
    if (!o) return In;
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
  function kf(e, n, o) {
    if (nt.current !== In) throw Error(i(168));
    Re(nt, n), Re(ct, o);
  }
  function Ef(e, n, o) {
    var s = e.stateNode;
    if (n = n.childContextTypes, typeof s.getChildContext != "function") return o;
    s = s.getChildContext();
    for (var u in s) if (!(u in n)) throw Error(i(108, ue(e) || "Unknown", u));
    return U({}, o, s);
  }
  function us(e) {
    return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || In, nr = nt.current, Re(nt, e), Re(ct, ct.current), !0;
  }
  function Cf(e, n, o) {
    var s = e.stateNode;
    if (!s) throw Error(i(169));
    o ? (e = Ef(e, n, nr), s.__reactInternalMemoizedMergedChildContext = e, Le(ct), Le(nt), Re(nt, e)) : Le(ct), Re(ct, o);
  }
  var an = null, cs = !1, Ea = !1;
  function Nf(e) {
    an === null ? an = [e] : an.push(e);
  }
  function N0(e) {
    cs = !0, Nf(e);
  }
  function Tn() {
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
        throw an !== null && (an = an.slice(e + 1)), Hi(Mo, Tn), u;
      } finally {
        Te = n, Ea = !1;
      }
    }
    return null;
  }
  var Br = [], Ur = 0, fs = null, ds = 0, zt = [], Pt = 0, rr = null, un = 1, cn = "";
  function or(e, n) {
    Br[Ur++] = ds, Br[Ur++] = fs, fs = e, ds = n;
  }
  function Mf(e, n, o) {
    zt[Pt++] = un, zt[Pt++] = cn, zt[Pt++] = rr, rr = e;
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
    e.return !== null && (or(e, 1), Mf(e, 1, 0));
  }
  function Na(e) {
    for (; e === fs; ) fs = Br[--Ur], Br[Ur] = null, ds = Br[--Ur], Br[Ur] = null;
    for (; e === rr; ) rr = zt[--Pt], zt[Pt] = null, cn = zt[--Pt], zt[Pt] = null, un = zt[--Pt], zt[Pt] = null;
  }
  var xt = null, _t = null, Ae = !1, Lt = null;
  function zf(e, n) {
    var o = Dt(5, null, null, 0);
    o.elementType = "DELETED", o.stateNode = n, o.return = e, n = e.deletions, n === null ? (e.deletions = [o], e.flags |= 16) : n.push(o);
  }
  function Pf(e, n) {
    switch (e.tag) {
      case 5:
        var o = e.type;
        return n = n.nodeType !== 1 || o.toLowerCase() !== n.nodeName.toLowerCase() ? null : n, n !== null ? (e.stateNode = n, xt = e, _t = zn(n.firstChild), !0) : !1;
      case 6:
        return n = e.pendingProps === "" || n.nodeType !== 3 ? null : n, n !== null ? (e.stateNode = n, xt = e, _t = null, !0) : !1;
      case 13:
        return n = n.nodeType !== 8 ? null : n, n !== null ? (o = rr !== null ? { id: un, overflow: cn } : null, e.memoizedState = { dehydrated: n, treeContext: o, retryLane: 1073741824 }, o = Dt(18, null, null, 0), o.stateNode = n, o.return = e, e.child = o, xt = e, _t = null, !0) : !1;
      default:
        return !1;
    }
  }
  function Ma(e) {
    return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
  }
  function za(e) {
    if (Ae) {
      var n = _t;
      if (n) {
        var o = n;
        if (!Pf(e, n)) {
          if (Ma(e)) throw Error(i(418));
          n = zn(o.nextSibling);
          var s = xt;
          n && Pf(e, n) ? zf(s, o) : (e.flags = e.flags & -4097 | 2, Ae = !1, xt = e);
        }
      } else {
        if (Ma(e)) throw Error(i(418));
        e.flags = e.flags & -4097 | 2, Ae = !1, xt = e;
      }
    }
  }
  function If(e) {
    for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
    xt = e;
  }
  function ps(e) {
    if (e !== xt) return !1;
    if (!Ae) return If(e), Ae = !0, !1;
    var n;
    if ((n = e.tag !== 3) && !(n = e.tag !== 5) && (n = e.type, n = n !== "head" && n !== "body" && !wa(e.type, e.memoizedProps)), n && (n = _t)) {
      if (Ma(e)) throw Tf(), Error(i(418));
      for (; n; ) zf(e, n), n = zn(n.nextSibling);
    }
    if (If(e), e.tag === 13) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(i(317));
      e: {
        for (e = e.nextSibling, n = 0; e; ) {
          if (e.nodeType === 8) {
            var o = e.data;
            if (o === "/$") {
              if (n === 0) {
                _t = zn(e.nextSibling);
                break e;
              }
              n--;
            } else o !== "$" && o !== "$!" && o !== "$?" || n++;
          }
          e = e.nextSibling;
        }
        _t = null;
      }
    } else _t = xt ? zn(e.stateNode.nextSibling) : null;
    return !0;
  }
  function Tf() {
    for (var e = _t; e; ) e = zn(e.nextSibling);
  }
  function Wr() {
    _t = xt = null, Ae = !1;
  }
  function Pa(e) {
    Lt === null ? Lt = [e] : Lt.push(e);
  }
  var M0 = P.ReactCurrentBatchConfig;
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
  function Rf(e) {
    var n = e._init;
    return n(e._payload);
  }
  function Df(e) {
    function n(W, b) {
      if (e) {
        var X = W.deletions;
        X === null ? (W.deletions = [b], W.flags |= 16) : X.push(b);
      }
    }
    function o(W, b) {
      if (!e) return null;
      for (; b !== null; ) n(W, b), b = b.sibling;
      return null;
    }
    function s(W, b) {
      for (W = /* @__PURE__ */ new Map(); b !== null; ) b.key !== null ? W.set(b.key, b) : W.set(b.index, b), b = b.sibling;
      return W;
    }
    function u(W, b) {
      return W = Hn(W, b), W.index = 0, W.sibling = null, W;
    }
    function d(W, b, X) {
      return W.index = X, e ? (X = W.alternate, X !== null ? (X = X.index, X < b ? (W.flags |= 2, b) : X) : (W.flags |= 2, b)) : (W.flags |= 1048576, b);
    }
    function w(W) {
      return e && W.alternate === null && (W.flags |= 2), W;
    }
    function z(W, b, X, se) {
      return b === null || b.tag !== 6 ? (b = xu(X, W.mode, se), b.return = W, b) : (b = u(b, X), b.return = W, b);
    }
    function T(W, b, X, se) {
      var ge = X.type;
      return ge === j ? ne(W, b, X.props.children, se, X.key) : b !== null && (b.elementType === ge || typeof ge == "object" && ge !== null && ge.$$typeof === O && Rf(ge) === b.type) ? (se = u(b, X.props), se.ref = Xo(W, b, X), se.return = W, se) : (se = Os(X.type, X.key, X.props, null, W.mode, se), se.ref = Xo(W, b, X), se.return = W, se);
    }
    function G(W, b, X, se) {
      return b === null || b.tag !== 4 || b.stateNode.containerInfo !== X.containerInfo || b.stateNode.implementation !== X.implementation ? (b = _u(X, W.mode, se), b.return = W, b) : (b = u(b, X.children || []), b.return = W, b);
    }
    function ne(W, b, X, se, ge) {
      return b === null || b.tag !== 7 ? (b = dr(X, W.mode, se, ge), b.return = W, b) : (b = u(b, X), b.return = W, b);
    }
    function oe(W, b, X) {
      if (typeof b == "string" && b !== "" || typeof b == "number") return b = xu("" + b, W.mode, X), b.return = W, b;
      if (typeof b == "object" && b !== null) {
        switch (b.$$typeof) {
          case V:
            return X = Os(b.type, b.key, b.props, null, W.mode, X), X.ref = Xo(W, null, b), X.return = W, X;
          case D:
            return b = _u(b, W.mode, X), b.return = W, b;
          case O:
            var se = b._init;
            return oe(W, se(b._payload), X);
        }
        if (et(b) || H(b)) return b = dr(b, W.mode, X, null), b.return = W, b;
        hs(W, b);
      }
      return null;
    }
    function te(W, b, X, se) {
      var ge = b !== null ? b.key : null;
      if (typeof X == "string" && X !== "" || typeof X == "number") return ge !== null ? null : z(W, b, "" + X, se);
      if (typeof X == "object" && X !== null) {
        switch (X.$$typeof) {
          case V:
            return X.key === ge ? T(W, b, X, se) : null;
          case D:
            return X.key === ge ? G(W, b, X, se) : null;
          case O:
            return ge = X._init, te(
              W,
              b,
              ge(X._payload),
              se
            );
        }
        if (et(X) || H(X)) return ge !== null ? null : ne(W, b, X, se, null);
        hs(W, X);
      }
      return null;
    }
    function fe(W, b, X, se, ge) {
      if (typeof se == "string" && se !== "" || typeof se == "number") return W = W.get(X) || null, z(b, W, "" + se, ge);
      if (typeof se == "object" && se !== null) {
        switch (se.$$typeof) {
          case V:
            return W = W.get(se.key === null ? X : se.key) || null, T(b, W, se, ge);
          case D:
            return W = W.get(se.key === null ? X : se.key) || null, G(b, W, se, ge);
          case O:
            var xe = se._init;
            return fe(W, b, X, xe(se._payload), ge);
        }
        if (et(se) || H(se)) return W = W.get(X) || null, ne(b, W, se, ge, null);
        hs(b, se);
      }
      return null;
    }
    function pe(W, b, X, se) {
      for (var ge = null, xe = null, _e = b, ke = b = 0, Ke = null; _e !== null && ke < X.length; ke++) {
        _e.index > ke ? (Ke = _e, _e = null) : Ke = _e.sibling;
        var Ie = te(W, _e, X[ke], se);
        if (Ie === null) {
          _e === null && (_e = Ke);
          break;
        }
        e && _e && Ie.alternate === null && n(W, _e), b = d(Ie, b, ke), xe === null ? ge = Ie : xe.sibling = Ie, xe = Ie, _e = Ke;
      }
      if (ke === X.length) return o(W, _e), Ae && or(W, ke), ge;
      if (_e === null) {
        for (; ke < X.length; ke++) _e = oe(W, X[ke], se), _e !== null && (b = d(_e, b, ke), xe === null ? ge = _e : xe.sibling = _e, xe = _e);
        return Ae && or(W, ke), ge;
      }
      for (_e = s(W, _e); ke < X.length; ke++) Ke = fe(_e, W, ke, X[ke], se), Ke !== null && (e && Ke.alternate !== null && _e.delete(Ke.key === null ? ke : Ke.key), b = d(Ke, b, ke), xe === null ? ge = Ke : xe.sibling = Ke, xe = Ke);
      return e && _e.forEach(function(jn) {
        return n(W, jn);
      }), Ae && or(W, ke), ge;
    }
    function he(W, b, X, se) {
      var ge = H(X);
      if (typeof ge != "function") throw Error(i(150));
      if (X = ge.call(X), X == null) throw Error(i(151));
      for (var xe = ge = null, _e = b, ke = b = 0, Ke = null, Ie = X.next(); _e !== null && !Ie.done; ke++, Ie = X.next()) {
        _e.index > ke ? (Ke = _e, _e = null) : Ke = _e.sibling;
        var jn = te(W, _e, Ie.value, se);
        if (jn === null) {
          _e === null && (_e = Ke);
          break;
        }
        e && _e && jn.alternate === null && n(W, _e), b = d(jn, b, ke), xe === null ? ge = jn : xe.sibling = jn, xe = jn, _e = Ke;
      }
      if (Ie.done) return o(
        W,
        _e
      ), Ae && or(W, ke), ge;
      if (_e === null) {
        for (; !Ie.done; ke++, Ie = X.next()) Ie = oe(W, Ie.value, se), Ie !== null && (b = d(Ie, b, ke), xe === null ? ge = Ie : xe.sibling = Ie, xe = Ie);
        return Ae && or(W, ke), ge;
      }
      for (_e = s(W, _e); !Ie.done; ke++, Ie = X.next()) Ie = fe(_e, W, ke, Ie.value, se), Ie !== null && (e && Ie.alternate !== null && _e.delete(Ie.key === null ? ke : Ie.key), b = d(Ie, b, ke), xe === null ? ge = Ie : xe.sibling = Ie, xe = Ie);
      return e && _e.forEach(function(sy) {
        return n(W, sy);
      }), Ae && or(W, ke), ge;
    }
    function Be(W, b, X, se) {
      if (typeof X == "object" && X !== null && X.type === j && X.key === null && (X = X.props.children), typeof X == "object" && X !== null) {
        switch (X.$$typeof) {
          case V:
            e: {
              for (var ge = X.key, xe = b; xe !== null; ) {
                if (xe.key === ge) {
                  if (ge = X.type, ge === j) {
                    if (xe.tag === 7) {
                      o(W, xe.sibling), b = u(xe, X.props.children), b.return = W, W = b;
                      break e;
                    }
                  } else if (xe.elementType === ge || typeof ge == "object" && ge !== null && ge.$$typeof === O && Rf(ge) === xe.type) {
                    o(W, xe.sibling), b = u(xe, X.props), b.ref = Xo(W, xe, X), b.return = W, W = b;
                    break e;
                  }
                  o(W, xe);
                  break;
                } else n(W, xe);
                xe = xe.sibling;
              }
              X.type === j ? (b = dr(X.props.children, W.mode, se, X.key), b.return = W, W = b) : (se = Os(X.type, X.key, X.props, null, W.mode, se), se.ref = Xo(W, b, X), se.return = W, W = se);
            }
            return w(W);
          case D:
            e: {
              for (xe = X.key; b !== null; ) {
                if (b.key === xe) if (b.tag === 4 && b.stateNode.containerInfo === X.containerInfo && b.stateNode.implementation === X.implementation) {
                  o(W, b.sibling), b = u(b, X.children || []), b.return = W, W = b;
                  break e;
                } else {
                  o(W, b);
                  break;
                }
                else n(W, b);
                b = b.sibling;
              }
              b = _u(X, W.mode, se), b.return = W, W = b;
            }
            return w(W);
          case O:
            return xe = X._init, Be(W, b, xe(X._payload), se);
        }
        if (et(X)) return pe(W, b, X, se);
        if (H(X)) return he(W, b, X, se);
        hs(W, X);
      }
      return typeof X == "string" && X !== "" || typeof X == "number" ? (X = "" + X, b !== null && b.tag === 6 ? (o(W, b.sibling), b = u(b, X), b.return = W, W = b) : (o(W, b), b = xu(X, W.mode, se), b.return = W, W = b), w(W)) : o(W, b);
    }
    return Be;
  }
  var Xr = Df(!0), bf = Df(!1), gs = Pn(null), ms = null, Yr = null, Ia = null;
  function Ta() {
    Ia = Yr = ms = null;
  }
  function Ra(e) {
    var n = gs.current;
    Le(gs), e._currentValue = n;
  }
  function Da(e, n, o) {
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
  var ir = null;
  function ba(e) {
    ir === null ? ir = [e] : ir.push(e);
  }
  function Lf(e, n, o, s) {
    var u = n.interleaved;
    return u === null ? (o.next = o, ba(n)) : (o.next = u.next, u.next = o), n.interleaved = o, fn(e, s);
  }
  function fn(e, n) {
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
    return u = s.interleaved, u === null ? (n.next = n, ba(s)) : (n.next = u.next, u.next = n), s.interleaved = n, fn(e, o);
  }
  function ys(e, n, o) {
    if (n = n.updateQueue, n !== null && (n = n.shared, (o & 4194240) !== 0)) {
      var s = n.lanes;
      s &= e.pendingLanes, o |= s, n.lanes = o, Rr(e, o);
    }
  }
  function $f(e, n) {
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
      var T = z, G = T.next;
      T.next = null, w === null ? d = G : w.next = G, w = T;
      var ne = e.alternate;
      ne !== null && (ne = ne.updateQueue, z = ne.lastBaseUpdate, z !== w && (z === null ? ne.firstBaseUpdate = G : z.next = G, ne.lastBaseUpdate = T));
    }
    if (d !== null) {
      var oe = u.baseState;
      w = 0, ne = G = T = null, z = d;
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
        } else fe = { eventTime: fe, lane: te, tag: z.tag, payload: z.payload, callback: z.callback, next: null }, ne === null ? (G = ne = fe, T = oe) : ne = ne.next = fe, w |= te;
        if (z = z.next, z === null) {
          if (z = u.shared.pending, z === null) break;
          te = z, z = te.next, te.next = null, u.lastBaseUpdate = te, u.shared.pending = null;
        }
      } while (!0);
      if (ne === null && (T = oe), u.baseState = T, u.firstBaseUpdate = G, u.lastBaseUpdate = ne, n = u.shared.interleaved, n !== null) {
        u = n;
        do
          w |= u.lane, u = u.next;
        while (u !== n);
      } else d === null && (u.shared.lanes = 0);
      ar |= w, e.lanes = w, e.memoizedState = oe;
    }
  }
  function Of(e, n, o) {
    if (e = n.effects, n.effects = null, e !== null) for (n = 0; n < e.length; n++) {
      var s = e[n], u = s.callback;
      if (u !== null) {
        if (s.callback = null, s = o, typeof u != "function") throw Error(i(191, u));
        u.call(s);
      }
    }
  }
  var Yo = {}, Gt = Pn(Yo), Zo = Pn(Yo), Qo = Pn(Yo);
  function sr(e) {
    if (e === Yo) throw Error(i(174));
    return e;
  }
  function Aa(e, n) {
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
  function Hf(e) {
    sr(Qo.current);
    var n = sr(Gt.current), o = mt(n, e.type);
    n !== o && (Re(Zo, e), Re(Gt, o));
  }
  function $a(e) {
    Zo.current === e && (Le(Gt), Le(Zo));
  }
  var Oe = Pn(0);
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
  var Oa = [];
  function Ha() {
    for (var e = 0; e < Oa.length; e++) Oa[e]._workInProgressVersionPrimary = null;
    Oa.length = 0;
  }
  var xs = P.ReactCurrentDispatcher, ja = P.ReactCurrentBatchConfig, lr = 0, He = null, Xe = null, Ze = null, _s = !1, Ko = !1, Go = 0, z0 = 0;
  function rt() {
    throw Error(i(321));
  }
  function Fa(e, n) {
    if (n === null) return !1;
    for (var o = 0; o < n.length && o < e.length; o++) if (!bt(e[o], n[o])) return !1;
    return !0;
  }
  function Va(e, n, o, s, u, d) {
    if (lr = d, He = n, n.memoizedState = null, n.updateQueue = null, n.lanes = 0, xs.current = e === null || e.memoizedState === null ? R0 : D0, e = o(s, u), Ko) {
      d = 0;
      do {
        if (Ko = !1, Go = 0, 25 <= d) throw Error(i(301));
        d += 1, Ze = Xe = null, n.updateQueue = null, xs.current = b0, e = o(s, u);
      } while (Ko);
    }
    if (xs.current = Es, n = Xe !== null && Xe.next !== null, lr = 0, Ze = Xe = He = null, _s = !1, n) throw Error(i(300));
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
      var z = w = null, T = null, G = d;
      do {
        var ne = G.lane;
        if ((lr & ne) === ne) T !== null && (T = T.next = { lane: 0, action: G.action, hasEagerState: G.hasEagerState, eagerState: G.eagerState, next: null }), s = G.hasEagerState ? G.eagerState : e(s, G.action);
        else {
          var oe = {
            lane: ne,
            action: G.action,
            hasEagerState: G.hasEagerState,
            eagerState: G.eagerState,
            next: null
          };
          T === null ? (z = T = oe, w = s) : T = T.next = oe, He.lanes |= ne, ar |= ne;
        }
        G = G.next;
      } while (G !== null && G !== d);
      T === null ? w = s : T.next = z, bt(s, n.memoizedState) || (dt = !0), n.memoizedState = s, n.baseState = w, n.baseQueue = T, o.lastRenderedState = s;
    }
    if (e = o.interleaved, e !== null) {
      u = e;
      do
        d = u.lane, He.lanes |= d, ar |= d, u = u.next;
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
      bt(d, n.memoizedState) || (dt = !0), n.memoizedState = d, n.baseQueue === null && (n.baseState = d), o.lastRenderedState = d;
    }
    return [d, s];
  }
  function jf() {
  }
  function Ff(e, n) {
    var o = He, s = Tt(), u = n(), d = !bt(s.memoizedState, u);
    if (d && (s.memoizedState = u, dt = !0), s = s.queue, Xa(Uf.bind(null, o, s, e), [e]), s.getSnapshot !== n || d || Ze !== null && Ze.memoizedState.tag & 1) {
      if (o.flags |= 2048, Jo(9, Bf.bind(null, o, s, u, n), void 0, null), Qe === null) throw Error(i(349));
      (lr & 30) !== 0 || Vf(o, n, u);
    }
    return u;
  }
  function Vf(e, n, o) {
    e.flags |= 16384, e = { getSnapshot: n, value: o }, n = He.updateQueue, n === null ? (n = { lastEffect: null, stores: null }, He.updateQueue = n, n.stores = [e]) : (o = n.stores, o === null ? n.stores = [e] : o.push(e));
  }
  function Bf(e, n, o, s) {
    n.value = o, n.getSnapshot = s, Wf(n) && Xf(e);
  }
  function Uf(e, n, o) {
    return o(function() {
      Wf(n) && Xf(e);
    });
  }
  function Wf(e) {
    var n = e.getSnapshot;
    e = e.value;
    try {
      var o = n();
      return !bt(e, o);
    } catch {
      return !0;
    }
  }
  function Xf(e) {
    var n = fn(e, 1);
    n !== null && Ht(n, e, 1, -1);
  }
  function Yf(e) {
    var n = qt();
    return typeof e == "function" && (e = e()), n.memoizedState = n.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: qo, lastRenderedState: e }, n.queue = e, e = e.dispatch = T0.bind(null, He, e), [n.memoizedState, e];
  }
  function Jo(e, n, o, s) {
    return e = { tag: e, create: n, destroy: o, deps: s, next: null }, n = He.updateQueue, n === null ? (n = { lastEffect: null, stores: null }, He.updateQueue = n, n.lastEffect = e.next = e) : (o = n.lastEffect, o === null ? n.lastEffect = e.next = e : (s = o.next, o.next = e, e.next = s, n.lastEffect = e)), e;
  }
  function Zf() {
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
  function Qf(e, n) {
    return Ss(8390656, 8, e, n);
  }
  function Xa(e, n) {
    return ks(2048, 8, e, n);
  }
  function Kf(e, n) {
    return ks(4, 2, e, n);
  }
  function Gf(e, n) {
    return ks(4, 4, e, n);
  }
  function qf(e, n) {
    if (typeof n == "function") return e = e(), n(e), function() {
      n(null);
    };
    if (n != null) return e = e(), n.current = e, function() {
      n.current = null;
    };
  }
  function Jf(e, n, o) {
    return o = o != null ? o.concat([e]) : null, ks(4, 4, qf.bind(null, n, e), o);
  }
  function Ya() {
  }
  function ed(e, n) {
    var o = Tt();
    n = n === void 0 ? null : n;
    var s = o.memoizedState;
    return s !== null && n !== null && Fa(n, s[1]) ? s[0] : (o.memoizedState = [e, n], e);
  }
  function td(e, n) {
    var o = Tt();
    n = n === void 0 ? null : n;
    var s = o.memoizedState;
    return s !== null && n !== null && Fa(n, s[1]) ? s[0] : (e = e(), o.memoizedState = [e, n], e);
  }
  function nd(e, n, o) {
    return (lr & 21) === 0 ? (e.baseState && (e.baseState = !1, dt = !0), e.memoizedState = o) : (bt(o, n) || (o = Wi(), He.lanes |= o, ar |= o, e.baseState = !0), n);
  }
  function P0(e, n) {
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
  function rd() {
    return Tt().memoizedState;
  }
  function I0(e, n, o) {
    var s = $n(e);
    if (o = { lane: s, action: o, hasEagerState: !1, eagerState: null, next: null }, od(e)) id(n, o);
    else if (o = Lf(e, n, o, s), o !== null) {
      var u = lt();
      Ht(o, e, s, u), sd(o, n, s);
    }
  }
  function T0(e, n, o) {
    var s = $n(e), u = { lane: s, action: o, hasEagerState: !1, eagerState: null, next: null };
    if (od(e)) id(n, u);
    else {
      var d = e.alternate;
      if (e.lanes === 0 && (d === null || d.lanes === 0) && (d = n.lastRenderedReducer, d !== null)) try {
        var w = n.lastRenderedState, z = d(w, o);
        if (u.hasEagerState = !0, u.eagerState = z, bt(z, w)) {
          var T = n.interleaved;
          T === null ? (u.next = u, ba(n)) : (u.next = T.next, T.next = u), n.interleaved = u;
          return;
        }
      } catch {
      } finally {
      }
      o = Lf(e, n, u, s), o !== null && (u = lt(), Ht(o, e, s, u), sd(o, n, s));
    }
  }
  function od(e) {
    var n = e.alternate;
    return e === He || n !== null && n === He;
  }
  function id(e, n) {
    Ko = _s = !0;
    var o = e.pending;
    o === null ? n.next = n : (n.next = o.next, o.next = n), e.pending = n;
  }
  function sd(e, n, o) {
    if ((o & 4194240) !== 0) {
      var s = n.lanes;
      s &= e.pendingLanes, o |= s, n.lanes = o, Rr(e, o);
    }
  }
  var Es = { readContext: It, useCallback: rt, useContext: rt, useEffect: rt, useImperativeHandle: rt, useInsertionEffect: rt, useLayoutEffect: rt, useMemo: rt, useReducer: rt, useRef: rt, useState: rt, useDebugValue: rt, useDeferredValue: rt, useTransition: rt, useMutableSource: rt, useSyncExternalStore: rt, useId: rt, unstable_isNewReconciler: !1 }, R0 = { readContext: It, useCallback: function(e, n) {
    return qt().memoizedState = [e, n === void 0 ? null : n], e;
  }, useContext: It, useEffect: Qf, useImperativeHandle: function(e, n, o) {
    return o = o != null ? o.concat([e]) : null, Ss(
      4194308,
      4,
      qf.bind(null, n, e),
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
    return n = o !== void 0 ? o(n) : n, s.memoizedState = s.baseState = n, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: n }, s.queue = e, e = e.dispatch = I0.bind(null, He, e), [s.memoizedState, e];
  }, useRef: function(e) {
    var n = qt();
    return e = { current: e }, n.memoizedState = e;
  }, useState: Yf, useDebugValue: Ya, useDeferredValue: function(e) {
    return qt().memoizedState = e;
  }, useTransition: function() {
    var e = Yf(!1), n = e[0];
    return e = P0.bind(null, e[1]), qt().memoizedState = e, [n, e];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(e, n, o) {
    var s = He, u = qt();
    if (Ae) {
      if (o === void 0) throw Error(i(407));
      o = o();
    } else {
      if (o = n(), Qe === null) throw Error(i(349));
      (lr & 30) !== 0 || Vf(s, n, o);
    }
    u.memoizedState = o;
    var d = { value: o, getSnapshot: n };
    return u.queue = d, Qf(Uf.bind(
      null,
      s,
      d,
      e
    ), [e]), s.flags |= 2048, Jo(9, Bf.bind(null, s, d, o, n), void 0, null), o;
  }, useId: function() {
    var e = qt(), n = Qe.identifierPrefix;
    if (Ae) {
      var o = cn, s = un;
      o = (s & ~(1 << 32 - vt(s) - 1)).toString(32) + o, n = ":" + n + "R" + o, o = Go++, 0 < o && (n += "H" + o.toString(32)), n += ":";
    } else o = z0++, n = ":" + n + "r" + o.toString(32) + ":";
    return e.memoizedState = n;
  }, unstable_isNewReconciler: !1 }, D0 = {
    readContext: It,
    useCallback: ed,
    useContext: It,
    useEffect: Xa,
    useImperativeHandle: Jf,
    useInsertionEffect: Kf,
    useLayoutEffect: Gf,
    useMemo: td,
    useReducer: Ua,
    useRef: Zf,
    useState: function() {
      return Ua(qo);
    },
    useDebugValue: Ya,
    useDeferredValue: function(e) {
      var n = Tt();
      return nd(n, Xe.memoizedState, e);
    },
    useTransition: function() {
      var e = Ua(qo)[0], n = Tt().memoizedState;
      return [e, n];
    },
    useMutableSource: jf,
    useSyncExternalStore: Ff,
    useId: rd,
    unstable_isNewReconciler: !1
  }, b0 = { readContext: It, useCallback: ed, useContext: It, useEffect: Xa, useImperativeHandle: Jf, useInsertionEffect: Kf, useLayoutEffect: Gf, useMemo: td, useReducer: Wa, useRef: Zf, useState: function() {
    return Wa(qo);
  }, useDebugValue: Ya, useDeferredValue: function(e) {
    var n = Tt();
    return Xe === null ? n.memoizedState = e : nd(n, Xe.memoizedState, e);
  }, useTransition: function() {
    var e = Wa(qo)[0], n = Tt().memoizedState;
    return [e, n];
  }, useMutableSource: jf, useSyncExternalStore: Ff, useId: rd, unstable_isNewReconciler: !1 };
  function At(e, n) {
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
    var s = lt(), u = $n(e), d = dn(s, u);
    d.payload = n, o != null && (d.callback = o), n = Dn(e, d, u), n !== null && (Ht(n, e, u, s), ys(n, e, u));
  }, enqueueReplaceState: function(e, n, o) {
    e = e._reactInternals;
    var s = lt(), u = $n(e), d = dn(s, u);
    d.tag = 1, d.payload = n, o != null && (d.callback = o), n = Dn(e, d, u), n !== null && (Ht(n, e, u, s), ys(n, e, u));
  }, enqueueForceUpdate: function(e, n) {
    e = e._reactInternals;
    var o = lt(), s = $n(e), u = dn(o, s);
    u.tag = 2, n != null && (u.callback = n), n = Dn(e, u, s), n !== null && (Ht(n, e, s, o), ys(n, e, s));
  } };
  function ld(e, n, o, s, u, d, w) {
    return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(s, d, w) : n.prototype && n.prototype.isPureReactComponent ? !Ho(o, s) || !Ho(u, d) : !0;
  }
  function ad(e, n, o) {
    var s = !1, u = In, d = n.contextType;
    return typeof d == "object" && d !== null ? d = It(d) : (u = ft(n) ? nr : nt.current, s = n.contextTypes, d = (s = s != null) ? Vr(e, u) : In), n = new n(o, d), e.memoizedState = n.state !== null && n.state !== void 0 ? n.state : null, n.updater = Cs, e.stateNode = n, n._reactInternals = e, s && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = u, e.__reactInternalMemoizedMaskedChildContext = d), n;
  }
  function ud(e, n, o, s) {
    e = n.state, typeof n.componentWillReceiveProps == "function" && n.componentWillReceiveProps(o, s), typeof n.UNSAFE_componentWillReceiveProps == "function" && n.UNSAFE_componentWillReceiveProps(o, s), n.state !== e && Cs.enqueueReplaceState(n, n.state, null);
  }
  function Qa(e, n, o, s) {
    var u = e.stateNode;
    u.props = o, u.state = e.memoizedState, u.refs = {}, La(e);
    var d = n.contextType;
    typeof d == "object" && d !== null ? u.context = It(d) : (d = ft(n) ? nr : nt.current, u.context = Vr(e, d)), u.state = e.memoizedState, d = n.getDerivedStateFromProps, typeof d == "function" && (Za(e, n, d, o), u.state = e.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof u.getSnapshotBeforeUpdate == "function" || typeof u.UNSAFE_componentWillMount != "function" && typeof u.componentWillMount != "function" || (n = u.state, typeof u.componentWillMount == "function" && u.componentWillMount(), typeof u.UNSAFE_componentWillMount == "function" && u.UNSAFE_componentWillMount(), n !== u.state && Cs.enqueueReplaceState(u, u.state, null), vs(e, o, u, s), u.state = e.memoizedState), typeof u.componentDidMount == "function" && (e.flags |= 4194308);
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
  var L0 = typeof WeakMap == "function" ? WeakMap : Map;
  function cd(e, n, o) {
    o = dn(-1, o), o.tag = 3, o.payload = { element: null };
    var s = n.value;
    return o.callback = function() {
      Rs || (Rs = !0, du = s), Ga(e, n);
    }, o;
  }
  function fd(e, n, o) {
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
      Ga(e, n), typeof s != "function" && (Ln === null ? Ln = /* @__PURE__ */ new Set([this]) : Ln.add(this));
      var w = n.stack;
      this.componentDidCatch(n.value, { componentStack: w !== null ? w : "" });
    }), o;
  }
  function dd(e, n, o) {
    var s = e.pingCache;
    if (s === null) {
      s = e.pingCache = new L0();
      var u = /* @__PURE__ */ new Set();
      s.set(n, u);
    } else u = s.get(n), u === void 0 && (u = /* @__PURE__ */ new Set(), s.set(n, u));
    u.has(o) || (u.add(o), e = Q0.bind(null, e, n, o), n.then(e, e));
  }
  function pd(e) {
    do {
      var n;
      if ((n = e.tag === 13) && (n = e.memoizedState, n = n !== null ? n.dehydrated !== null : !0), n) return e;
      e = e.return;
    } while (e !== null);
    return null;
  }
  function hd(e, n, o, s, u) {
    return (e.mode & 1) === 0 ? (e === n ? e.flags |= 65536 : (e.flags |= 128, o.flags |= 131072, o.flags &= -52805, o.tag === 1 && (o.alternate === null ? o.tag = 17 : (n = dn(-1, 1), n.tag = 2, Dn(o, n, 1))), o.lanes |= 1), e) : (e.flags |= 65536, e.lanes = u, e);
  }
  var A0 = P.ReactCurrentOwner, dt = !1;
  function st(e, n, o, s) {
    n.child = e === null ? bf(n, null, o, s) : Xr(n, e.child, o, s);
  }
  function gd(e, n, o, s, u) {
    o = o.render;
    var d = n.ref;
    return Zr(n, u), s = Va(e, n, o, s, d, u), o = Ba(), e !== null && !dt ? (n.updateQueue = e.updateQueue, n.flags &= -2053, e.lanes &= ~u, pn(e, n, u)) : (Ae && o && Ca(n), n.flags |= 1, st(e, n, s, u), n.child);
  }
  function md(e, n, o, s, u) {
    if (e === null) {
      var d = o.type;
      return typeof d == "function" && !wu(d) && d.defaultProps === void 0 && o.compare === null && o.defaultProps === void 0 ? (n.tag = 15, n.type = d, yd(e, n, d, s, u)) : (e = Os(o.type, null, s, n, n.mode, u), e.ref = n.ref, e.return = n, n.child = e);
    }
    if (d = e.child, (e.lanes & u) === 0) {
      var w = d.memoizedProps;
      if (o = o.compare, o = o !== null ? o : Ho, o(w, s) && e.ref === n.ref) return pn(e, n, u);
    }
    return n.flags |= 1, e = Hn(d, s), e.ref = n.ref, e.return = n, n.child = e;
  }
  function yd(e, n, o, s, u) {
    if (e !== null) {
      var d = e.memoizedProps;
      if (Ho(d, s) && e.ref === n.ref) if (dt = !1, n.pendingProps = s = d, (e.lanes & u) !== 0) (e.flags & 131072) !== 0 && (dt = !0);
      else return n.lanes = e.lanes, pn(e, n, u);
    }
    return qa(e, n, o, s, u);
  }
  function vd(e, n, o) {
    var s = n.pendingProps, u = s.children, d = e !== null ? e.memoizedState : null;
    if (s.mode === "hidden") if ((n.mode & 1) === 0) n.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, Re(qr, St), St |= o;
    else {
      if ((o & 1073741824) === 0) return e = d !== null ? d.baseLanes | o : o, n.lanes = n.childLanes = 1073741824, n.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, n.updateQueue = null, Re(qr, St), St |= e, null;
      n.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, s = d !== null ? d.baseLanes : o, Re(qr, St), St |= s;
    }
    else d !== null ? (s = d.baseLanes | o, n.memoizedState = null) : s = o, Re(qr, St), St |= s;
    return st(e, n, u, o), n.child;
  }
  function wd(e, n) {
    var o = n.ref;
    (e === null && o !== null || e !== null && e.ref !== o) && (n.flags |= 512, n.flags |= 2097152);
  }
  function qa(e, n, o, s, u) {
    var d = ft(o) ? nr : nt.current;
    return d = Vr(n, d), Zr(n, u), o = Va(e, n, o, s, d, u), s = Ba(), e !== null && !dt ? (n.updateQueue = e.updateQueue, n.flags &= -2053, e.lanes &= ~u, pn(e, n, u)) : (Ae && s && Ca(n), n.flags |= 1, st(e, n, o, u), n.child);
  }
  function xd(e, n, o, s, u) {
    if (ft(o)) {
      var d = !0;
      us(n);
    } else d = !1;
    if (Zr(n, u), n.stateNode === null) Ms(e, n), ad(n, o, s), Qa(n, o, s, u), s = !0;
    else if (e === null) {
      var w = n.stateNode, z = n.memoizedProps;
      w.props = z;
      var T = w.context, G = o.contextType;
      typeof G == "object" && G !== null ? G = It(G) : (G = ft(o) ? nr : nt.current, G = Vr(n, G));
      var ne = o.getDerivedStateFromProps, oe = typeof ne == "function" || typeof w.getSnapshotBeforeUpdate == "function";
      oe || typeof w.UNSAFE_componentWillReceiveProps != "function" && typeof w.componentWillReceiveProps != "function" || (z !== s || T !== G) && ud(n, w, s, G), Rn = !1;
      var te = n.memoizedState;
      w.state = te, vs(n, s, w, u), T = n.memoizedState, z !== s || te !== T || ct.current || Rn ? (typeof ne == "function" && (Za(n, o, ne, s), T = n.memoizedState), (z = Rn || ld(n, o, z, s, te, T, G)) ? (oe || typeof w.UNSAFE_componentWillMount != "function" && typeof w.componentWillMount != "function" || (typeof w.componentWillMount == "function" && w.componentWillMount(), typeof w.UNSAFE_componentWillMount == "function" && w.UNSAFE_componentWillMount()), typeof w.componentDidMount == "function" && (n.flags |= 4194308)) : (typeof w.componentDidMount == "function" && (n.flags |= 4194308), n.memoizedProps = s, n.memoizedState = T), w.props = s, w.state = T, w.context = G, s = z) : (typeof w.componentDidMount == "function" && (n.flags |= 4194308), s = !1);
    } else {
      w = n.stateNode, Af(e, n), z = n.memoizedProps, G = n.type === n.elementType ? z : At(n.type, z), w.props = G, oe = n.pendingProps, te = w.context, T = o.contextType, typeof T == "object" && T !== null ? T = It(T) : (T = ft(o) ? nr : nt.current, T = Vr(n, T));
      var fe = o.getDerivedStateFromProps;
      (ne = typeof fe == "function" || typeof w.getSnapshotBeforeUpdate == "function") || typeof w.UNSAFE_componentWillReceiveProps != "function" && typeof w.componentWillReceiveProps != "function" || (z !== oe || te !== T) && ud(n, w, s, T), Rn = !1, te = n.memoizedState, w.state = te, vs(n, s, w, u);
      var pe = n.memoizedState;
      z !== oe || te !== pe || ct.current || Rn ? (typeof fe == "function" && (Za(n, o, fe, s), pe = n.memoizedState), (G = Rn || ld(n, o, G, s, te, pe, T) || !1) ? (ne || typeof w.UNSAFE_componentWillUpdate != "function" && typeof w.componentWillUpdate != "function" || (typeof w.componentWillUpdate == "function" && w.componentWillUpdate(s, pe, T), typeof w.UNSAFE_componentWillUpdate == "function" && w.UNSAFE_componentWillUpdate(s, pe, T)), typeof w.componentDidUpdate == "function" && (n.flags |= 4), typeof w.getSnapshotBeforeUpdate == "function" && (n.flags |= 1024)) : (typeof w.componentDidUpdate != "function" || z === e.memoizedProps && te === e.memoizedState || (n.flags |= 4), typeof w.getSnapshotBeforeUpdate != "function" || z === e.memoizedProps && te === e.memoizedState || (n.flags |= 1024), n.memoizedProps = s, n.memoizedState = pe), w.props = s, w.state = pe, w.context = T, s = G) : (typeof w.componentDidUpdate != "function" || z === e.memoizedProps && te === e.memoizedState || (n.flags |= 4), typeof w.getSnapshotBeforeUpdate != "function" || z === e.memoizedProps && te === e.memoizedState || (n.flags |= 1024), s = !1);
    }
    return Ja(e, n, o, s, d, u);
  }
  function Ja(e, n, o, s, u, d) {
    wd(e, n);
    var w = (n.flags & 128) !== 0;
    if (!s && !w) return u && Cf(n, o, !1), pn(e, n, d);
    s = n.stateNode, A0.current = n;
    var z = w && typeof o.getDerivedStateFromError != "function" ? null : s.render();
    return n.flags |= 1, e !== null && w ? (n.child = Xr(n, e.child, null, d), n.child = Xr(n, null, z, d)) : st(e, n, z, d), n.memoizedState = s.state, u && Cf(n, o, !0), n.child;
  }
  function _d(e) {
    var n = e.stateNode;
    n.pendingContext ? kf(e, n.pendingContext, n.pendingContext !== n.context) : n.context && kf(e, n.context, !1), Aa(e, n.containerInfo);
  }
  function Sd(e, n, o, s, u) {
    return Wr(), Pa(u), n.flags |= 256, st(e, n, o, s), n.child;
  }
  var eu = { dehydrated: null, treeContext: null, retryLane: 0 };
  function tu(e) {
    return { baseLanes: e, cachePool: null, transitions: null };
  }
  function kd(e, n, o) {
    var s = n.pendingProps, u = Oe.current, d = !1, w = (n.flags & 128) !== 0, z;
    if ((z = w) || (z = e !== null && e.memoizedState === null ? !1 : (u & 2) !== 0), z ? (d = !0, n.flags &= -129) : (e === null || e.memoizedState !== null) && (u |= 1), Re(Oe, u & 1), e === null)
      return za(n), e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? ((n.mode & 1) === 0 ? n.lanes = 1 : e.data === "$!" ? n.lanes = 8 : n.lanes = 1073741824, null) : (w = s.children, e = s.fallback, d ? (s = n.mode, d = n.child, w = { mode: "hidden", children: w }, (s & 1) === 0 && d !== null ? (d.childLanes = 0, d.pendingProps = w) : d = Hs(w, s, 0, null), e = dr(e, s, o, null), d.return = n, e.return = n, d.sibling = e, n.child = d, n.child.memoizedState = tu(o), n.memoizedState = eu, e) : nu(n, w));
    if (u = e.memoizedState, u !== null && (z = u.dehydrated, z !== null)) return $0(e, n, w, s, z, u, o);
    if (d) {
      d = s.fallback, w = n.mode, u = e.child, z = u.sibling;
      var T = { mode: "hidden", children: s.children };
      return (w & 1) === 0 && n.child !== u ? (s = n.child, s.childLanes = 0, s.pendingProps = T, n.deletions = null) : (s = Hn(u, T), s.subtreeFlags = u.subtreeFlags & 14680064), z !== null ? d = Hn(z, d) : (d = dr(d, w, o, null), d.flags |= 2), d.return = n, s.return = n, s.sibling = d, n.child = s, s = d, d = n.child, w = e.child.memoizedState, w = w === null ? tu(o) : { baseLanes: w.baseLanes | o, cachePool: null, transitions: w.transitions }, d.memoizedState = w, d.childLanes = e.childLanes & ~o, n.memoizedState = eu, s;
    }
    return d = e.child, e = d.sibling, s = Hn(d, { mode: "visible", children: s.children }), (n.mode & 1) === 0 && (s.lanes = o), s.return = n, s.sibling = null, e !== null && (o = n.deletions, o === null ? (n.deletions = [e], n.flags |= 16) : o.push(e)), n.child = s, n.memoizedState = null, s;
  }
  function nu(e, n) {
    return n = Hs({ mode: "visible", children: n }, e.mode, 0, null), n.return = e, e.child = n;
  }
  function Ns(e, n, o, s) {
    return s !== null && Pa(s), Xr(n, e.child, null, o), e = nu(n, n.pendingProps.children), e.flags |= 2, n.memoizedState = null, e;
  }
  function $0(e, n, o, s, u, d, w) {
    if (o)
      return n.flags & 256 ? (n.flags &= -257, s = Ka(Error(i(422))), Ns(e, n, w, s)) : n.memoizedState !== null ? (n.child = e.child, n.flags |= 128, null) : (d = s.fallback, u = n.mode, s = Hs({ mode: "visible", children: s.children }, u, 0, null), d = dr(d, u, w, null), d.flags |= 2, s.return = n, d.return = n, s.sibling = d, n.child = s, (n.mode & 1) !== 0 && Xr(n, e.child, null, w), n.child.memoizedState = tu(w), n.memoizedState = eu, d);
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
    return u.data === "$?" ? (n.flags |= 128, n.child = e.child, n = K0.bind(null, e), u._reactRetry = n, null) : (e = d.treeContext, _t = zn(u.nextSibling), xt = n, Ae = !0, Lt = null, e !== null && (zt[Pt++] = un, zt[Pt++] = cn, zt[Pt++] = rr, un = e.id, cn = e.overflow, rr = n), n = nu(n, s.children), n.flags |= 4096, n);
  }
  function Ed(e, n, o) {
    e.lanes |= n;
    var s = e.alternate;
    s !== null && (s.lanes |= n), Da(e.return, n, o);
  }
  function ru(e, n, o, s, u) {
    var d = e.memoizedState;
    d === null ? e.memoizedState = { isBackwards: n, rendering: null, renderingStartTime: 0, last: s, tail: o, tailMode: u } : (d.isBackwards = n, d.rendering = null, d.renderingStartTime = 0, d.last = s, d.tail = o, d.tailMode = u);
  }
  function Cd(e, n, o) {
    var s = n.pendingProps, u = s.revealOrder, d = s.tail;
    if (st(e, n, s.children, o), s = Oe.current, (s & 2) !== 0) s = s & 1 | 2, n.flags |= 128;
    else {
      if (e !== null && (e.flags & 128) !== 0) e: for (e = n.child; e !== null; ) {
        if (e.tag === 13) e.memoizedState !== null && Ed(e, o, n);
        else if (e.tag === 19) Ed(e, o, n);
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
    if (Re(Oe, s), (n.mode & 1) === 0) n.memoizedState = null;
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
    if (e !== null && (n.dependencies = e.dependencies), ar |= n.lanes, (o & n.childLanes) === 0) return null;
    if (e !== null && n.child !== e.child) throw Error(i(153));
    if (n.child !== null) {
      for (e = n.child, o = Hn(e, e.pendingProps), n.child = o, o.return = n; e.sibling !== null; ) e = e.sibling, o = o.sibling = Hn(e, e.pendingProps), o.return = n;
      o.sibling = null;
    }
    return n.child;
  }
  function O0(e, n, o) {
    switch (n.tag) {
      case 3:
        _d(n), Wr();
        break;
      case 5:
        Hf(n);
        break;
      case 1:
        ft(n.type) && us(n);
        break;
      case 4:
        Aa(n, n.stateNode.containerInfo);
        break;
      case 10:
        var s = n.type._context, u = n.memoizedProps.value;
        Re(gs, s._currentValue), s._currentValue = u;
        break;
      case 13:
        if (s = n.memoizedState, s !== null)
          return s.dehydrated !== null ? (Re(Oe, Oe.current & 1), n.flags |= 128, null) : (o & n.child.childLanes) !== 0 ? kd(e, n, o) : (Re(Oe, Oe.current & 1), e = pn(e, n, o), e !== null ? e.sibling : null);
        Re(Oe, Oe.current & 1);
        break;
      case 19:
        if (s = (o & n.childLanes) !== 0, (e.flags & 128) !== 0) {
          if (s) return Cd(e, n, o);
          n.flags |= 128;
        }
        if (u = n.memoizedState, u !== null && (u.rendering = null, u.tail = null, u.lastEffect = null), Re(Oe, Oe.current), s) break;
        return null;
      case 22:
      case 23:
        return n.lanes = 0, vd(e, n, o);
    }
    return pn(e, n, o);
  }
  var Nd, ou, Md, zd;
  Nd = function(e, n) {
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
  }, Md = function(e, n, o, s) {
    var u = e.memoizedProps;
    if (u !== s) {
      e = n.stateNode, sr(Gt.current);
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
        var T = s[G];
        if (z = u?.[G], s.hasOwnProperty(G) && T !== z && (T != null || z != null)) if (G === "style") if (z) {
          for (w in z) !z.hasOwnProperty(w) || T && T.hasOwnProperty(w) || (o || (o = {}), o[w] = "");
          for (w in T) T.hasOwnProperty(w) && z[w] !== T[w] && (o || (o = {}), o[w] = T[w]);
        } else o || (d || (d = []), d.push(
          G,
          o
        )), o = T;
        else G === "dangerouslySetInnerHTML" ? (T = T ? T.__html : void 0, z = z ? z.__html : void 0, T != null && z !== T && (d = d || []).push(G, T)) : G === "children" ? typeof T != "string" && typeof T != "number" || (d = d || []).push(G, "" + T) : G !== "suppressContentEditableWarning" && G !== "suppressHydrationWarning" && (a.hasOwnProperty(G) ? (T != null && G === "onScroll" && be("scroll", e), d || z === T || (d = [])) : (d = d || []).push(G, T));
      }
      o && (d = d || []).push("style", o);
      var G = d;
      (n.updateQueue = G) && (n.flags |= 4);
    }
  }, zd = function(e, n, o, s) {
    o !== s && (n.flags |= 4);
  };
  function ei(e, n) {
    if (!Ae) switch (e.tailMode) {
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
  function H0(e, n, o) {
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
        var u = sr(Qo.current);
        if (o = n.type, e !== null && n.stateNode != null) Md(e, n, o, s, u), e.ref !== n.ref && (n.flags |= 512, n.flags |= 2097152);
        else {
          if (!s) {
            if (n.stateNode === null) throw Error(i(166));
            return ot(n), null;
          }
          if (e = sr(Gt.current), ps(n)) {
            s = n.stateNode, o = n.type;
            var d = n.memoizedProps;
            switch (s[Kt] = n, s[Uo] = d, e = (n.mode & 1) !== 0, o) {
              case "dialog":
                be("cancel", s), be("close", s);
                break;
              case "iframe":
              case "object":
              case "embed":
                be("load", s);
                break;
              case "video":
              case "audio":
                for (u = 0; u < Fo.length; u++) be(Fo[u], s);
                break;
              case "source":
                be("error", s);
                break;
              case "img":
              case "image":
              case "link":
                be(
                  "error",
                  s
                ), be("load", s);
                break;
              case "details":
                be("toggle", s);
                break;
              case "input":
                Ce(s, d), be("invalid", s);
                break;
              case "select":
                s._wrapperState = { wasMultiple: !!d.multiple }, be("invalid", s);
                break;
              case "textarea":
                Yt(s, d), be("invalid", s);
            }
            yo(o, d), u = null;
            for (var w in d) if (d.hasOwnProperty(w)) {
              var z = d[w];
              w === "children" ? typeof z == "string" ? s.textContent !== z && (d.suppressHydrationWarning !== !0 && is(s.textContent, z, e), u = ["children", z]) : typeof z == "number" && s.textContent !== "" + z && (d.suppressHydrationWarning !== !0 && is(
                s.textContent,
                z,
                e
              ), u = ["children", "" + z]) : a.hasOwnProperty(w) && z != null && w === "onScroll" && be("scroll", s);
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
            w = u.nodeType === 9 ? u : u.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = Nt(o)), e === "http://www.w3.org/1999/xhtml" ? o === "script" ? (e = w.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof s.is == "string" ? e = w.createElement(o, { is: s.is }) : (e = w.createElement(o), o === "select" && (w = e, s.multiple ? w.multiple = !0 : s.size && (w.size = s.size))) : e = w.createElementNS(e, o), e[Kt] = n, e[Uo] = s, Nd(e, n, !1, !1), n.stateNode = e;
            e: {
              switch (w = vo(o, s), o) {
                case "dialog":
                  be("cancel", e), be("close", e), u = s;
                  break;
                case "iframe":
                case "object":
                case "embed":
                  be("load", e), u = s;
                  break;
                case "video":
                case "audio":
                  for (u = 0; u < Fo.length; u++) be(Fo[u], e);
                  u = s;
                  break;
                case "source":
                  be("error", e), u = s;
                  break;
                case "img":
                case "image":
                case "link":
                  be(
                    "error",
                    e
                  ), be("load", e), u = s;
                  break;
                case "details":
                  be("toggle", e), u = s;
                  break;
                case "input":
                  Ce(e, s), u = Ee(e, s), be("invalid", e);
                  break;
                case "option":
                  u = s;
                  break;
                case "select":
                  e._wrapperState = { wasMultiple: !!s.multiple }, u = U({}, s, { value: void 0 }), be("invalid", e);
                  break;
                case "textarea":
                  Yt(e, s), u = on(e, s), be("invalid", e);
                  break;
                default:
                  u = s;
              }
              yo(o, u), z = u;
              for (d in z) if (z.hasOwnProperty(d)) {
                var T = z[d];
                d === "style" ? Ii(e, T) : d === "dangerouslySetInnerHTML" ? (T = T ? T.__html : void 0, T != null && Cr(e, T)) : d === "children" ? typeof T == "string" ? (o !== "textarea" || T !== "") && sn(e, T) : typeof T == "number" && sn(e, "" + T) : d !== "suppressContentEditableWarning" && d !== "suppressHydrationWarning" && d !== "autoFocus" && (a.hasOwnProperty(d) ? T != null && d === "onScroll" && be("scroll", e) : T != null && S(e, d, T, w));
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
        if (e && n.stateNode != null) zd(e, n, e.memoizedProps, s);
        else {
          if (typeof s != "string" && n.stateNode === null) throw Error(i(166));
          if (o = sr(Qo.current), sr(Gt.current), ps(n)) {
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
        if (Le(Oe), s = n.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
          if (Ae && _t !== null && (n.mode & 1) !== 0 && (n.flags & 128) === 0) Tf(), Wr(), n.flags |= 98560, d = !1;
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
        return (n.flags & 128) !== 0 ? (n.lanes = o, n) : (s = s !== null, s !== (e !== null && e.memoizedState !== null) && s && (n.child.flags |= 8192, (n.mode & 1) !== 0 && (e === null || (Oe.current & 1) !== 0 ? Ye === 0 && (Ye = 3) : vu())), n.updateQueue !== null && (n.flags |= 4), ot(n), null);
      case 4:
        return Qr(), ou(e, n), e === null && Vo(n.stateNode.containerInfo), ot(n), null;
      case 10:
        return Ra(n.type._context), ot(n), null;
      case 17:
        return ft(n.type) && as(), ot(n), null;
      case 19:
        if (Le(Oe), d = n.memoizedState, d === null) return ot(n), null;
        if (s = (n.flags & 128) !== 0, w = d.rendering, w === null) if (s) ei(d, !1);
        else {
          if (Ye !== 0 || e !== null && (e.flags & 128) !== 0) for (e = n.child; e !== null; ) {
            if (w = ws(e), w !== null) {
              for (n.flags |= 128, ei(d, !1), s = w.updateQueue, s !== null && (n.updateQueue = s, n.flags |= 4), n.subtreeFlags = 0, s = o, o = n.child; o !== null; ) d = o, e = s, d.flags &= 14680066, w = d.alternate, w === null ? (d.childLanes = 0, d.lanes = e, d.child = null, d.subtreeFlags = 0, d.memoizedProps = null, d.memoizedState = null, d.updateQueue = null, d.dependencies = null, d.stateNode = null) : (d.childLanes = w.childLanes, d.lanes = w.lanes, d.child = w.child, d.subtreeFlags = 0, d.deletions = null, d.memoizedProps = w.memoizedProps, d.memoizedState = w.memoizedState, d.updateQueue = w.updateQueue, d.type = w.type, e = w.dependencies, d.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), o = o.sibling;
              return Re(Oe, Oe.current & 1 | 2), n.child;
            }
            e = e.sibling;
          }
          d.tail !== null && $e() > Jr && (n.flags |= 128, s = !0, ei(d, !1), n.lanes = 4194304);
        }
        else {
          if (!s) if (e = ws(w), e !== null) {
            if (n.flags |= 128, s = !0, o = e.updateQueue, o !== null && (n.updateQueue = o, n.flags |= 4), ei(d, !0), d.tail === null && d.tailMode === "hidden" && !w.alternate && !Ae) return ot(n), null;
          } else 2 * $e() - d.renderingStartTime > Jr && o !== 1073741824 && (n.flags |= 128, s = !0, ei(d, !1), n.lanes = 4194304);
          d.isBackwards ? (w.sibling = n.child, n.child = w) : (o = d.last, o !== null ? o.sibling = w : n.child = w, d.last = w);
        }
        return d.tail !== null ? (n = d.tail, d.rendering = n, d.tail = n.sibling, d.renderingStartTime = $e(), n.sibling = null, o = Oe.current, Re(Oe, s ? o & 1 | 2 : o & 1), n) : (ot(n), null);
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
  function j0(e, n) {
    switch (Na(n), n.tag) {
      case 1:
        return ft(n.type) && as(), e = n.flags, e & 65536 ? (n.flags = e & -65537 | 128, n) : null;
      case 3:
        return Qr(), Le(ct), Le(nt), Ha(), e = n.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (n.flags = e & -65537 | 128, n) : null;
      case 5:
        return $a(n), null;
      case 13:
        if (Le(Oe), e = n.memoizedState, e !== null && e.dehydrated !== null) {
          if (n.alternate === null) throw Error(i(340));
          Wr();
        }
        return e = n.flags, e & 65536 ? (n.flags = e & -65537 | 128, n) : null;
      case 19:
        return Le(Oe), null;
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
  var zs = !1, it = !1, F0 = typeof WeakSet == "function" ? WeakSet : Set, de = null;
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
  var Pd = !1;
  function V0(e, n) {
    if (ya = Zi, e = lf(), ua(e)) {
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
          var w = 0, z = -1, T = -1, G = 0, ne = 0, oe = e, te = null;
          t: for (; ; ) {
            for (var fe; oe !== o || u !== 0 && oe.nodeType !== 3 || (z = w + u), oe !== d || s !== 0 && oe.nodeType !== 3 || (T = w + s), oe.nodeType === 3 && (w += oe.nodeValue.length), (fe = oe.firstChild) !== null; )
              te = oe, oe = fe;
            for (; ; ) {
              if (oe === e) break t;
              if (te === o && ++G === u && (z = w), te === d && ++ne === s && (T = w), (fe = oe.nextSibling) !== null) break;
              oe = te, te = oe.parentNode;
            }
            oe = fe;
          }
          o = z === -1 || T === -1 ? null : { start: z, end: T };
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
              var he = pe.memoizedProps, Be = pe.memoizedState, W = n.stateNode, b = W.getSnapshotBeforeUpdate(n.elementType === n.type ? he : At(n.type, he), Be);
              W.__reactInternalSnapshotBeforeUpdate = b;
            }
            break;
          case 3:
            var X = n.stateNode.containerInfo;
            X.nodeType === 1 ? X.textContent = "" : X.nodeType === 9 && X.documentElement && X.removeChild(X.documentElement);
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
    return pe = Pd, Pd = !1, pe;
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
  function Id(e) {
    var n = e.alternate;
    n !== null && (e.alternate = null, Id(n)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (n = e.stateNode, n !== null && (delete n[Kt], delete n[Uo], delete n[Sa], delete n[E0], delete n[C0])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
  }
  function Td(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 4;
  }
  function Rd(e) {
    e: for (; ; ) {
      for (; e.sibling === null; ) {
        if (e.return === null || Td(e.return)) return null;
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
  function bn(e, n, o) {
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
        qe = null, bn(e, n, o), qe = s, $t = u, qe !== null && ($t ? (e = qe, o = o.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(o) : e.removeChild(o)) : qe.removeChild(o.stateNode));
        break;
      case 18:
        qe !== null && ($t ? (e = qe, o = o.stateNode, e.nodeType === 8 ? _a(e.parentNode, o) : e.nodeType === 1 && _a(e, o), Do(e)) : _a(qe, o.stateNode));
        break;
      case 4:
        s = qe, u = $t, qe = o.stateNode.containerInfo, $t = !0, bn(e, n, o), qe = s, $t = u;
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
        bn(e, n, o);
        break;
      case 1:
        if (!it && (Gr(o, n), s = o.stateNode, typeof s.componentWillUnmount == "function")) try {
          s.props = o.memoizedProps, s.state = o.memoizedState, s.componentWillUnmount();
        } catch (z) {
          Fe(o, n, z);
        }
        bn(e, n, o);
        break;
      case 21:
        bn(e, n, o);
        break;
      case 22:
        o.mode & 1 ? (it = (s = it) || o.memoizedState !== null, bn(e, n, o), it = s) : bn(e, n, o);
        break;
      default:
        bn(e, n, o);
    }
  }
  function bd(e) {
    var n = e.updateQueue;
    if (n !== null) {
      e.updateQueue = null;
      var o = e.stateNode;
      o === null && (o = e.stateNode = new F0()), n.forEach(function(s) {
        var u = G0.bind(null, e, s);
        o.has(s) || (o.add(s), s.then(u, u));
      });
    }
  }
  function Ot(e, n) {
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
        var T = u.alternate;
        T !== null && (T.return = null), u.return = null;
      } catch (G) {
        Fe(u, n, G);
      }
    }
    if (n.subtreeFlags & 12854) for (n = n.child; n !== null; ) Ld(n, e), n = n.sibling;
  }
  function Ld(e, n) {
    var o = e.alternate, s = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (Ot(n, e), Jt(e), s & 4) {
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
        Ot(n, e), Jt(e), s & 512 && o !== null && Gr(o, o.return);
        break;
      case 5:
        if (Ot(n, e), Jt(e), s & 512 && o !== null && Gr(o, o.return), e.flags & 32) {
          var u = e.stateNode;
          try {
            sn(u, "");
          } catch (he) {
            Fe(e, e.return, he);
          }
        }
        if (s & 4 && (u = e.stateNode, u != null)) {
          var d = e.memoizedProps, w = o !== null ? o.memoizedProps : d, z = e.type, T = e.updateQueue;
          if (e.updateQueue = null, T !== null) try {
            z === "input" && d.type === "radio" && d.name != null && ze(u, d), vo(z, w);
            var G = vo(z, d);
            for (w = 0; w < T.length; w += 2) {
              var ne = T[w], oe = T[w + 1];
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
        if (Ot(n, e), Jt(e), s & 4) {
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
        if (Ot(n, e), Jt(e), s & 4 && o !== null && o.memoizedState.isDehydrated) try {
          Do(n.containerInfo);
        } catch (he) {
          Fe(e, e.return, he);
        }
        break;
      case 4:
        Ot(n, e), Jt(e);
        break;
      case 13:
        Ot(n, e), Jt(e), u = e.child, u.flags & 8192 && (d = u.memoizedState !== null, u.stateNode.isHidden = d, !d || u.alternate !== null && u.alternate.memoizedState !== null || (fu = $e())), s & 4 && bd(e);
        break;
      case 22:
        if (ne = o !== null && o.memoizedState !== null, e.mode & 1 ? (it = (G = it) || ne, Ot(n, e), it = G) : Ot(n, e), Jt(e), s & 8192) {
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
                    Od(oe);
                    continue;
                  }
              }
              fe !== null ? (fe.return = te, de = fe) : Od(oe);
            }
            ne = ne.sibling;
          }
          e: for (ne = null, oe = e; ; ) {
            if (oe.tag === 5) {
              if (ne === null) {
                ne = oe;
                try {
                  u = oe.stateNode, G ? (d = u.style, typeof d.setProperty == "function" ? d.setProperty("display", "none", "important") : d.display = "none") : (z = oe.stateNode, T = oe.memoizedProps.style, w = T != null && T.hasOwnProperty("display") ? T.display : null, z.style.display = Pi("display", w));
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
        Ot(n, e), Jt(e), s & 4 && bd(e);
        break;
      case 21:
        break;
      default:
        Ot(
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
            if (Td(o)) {
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
            var d = Rd(e);
            au(e, d, u);
            break;
          case 3:
          case 4:
            var w = s.stateNode.containerInfo, z = Rd(e);
            lu(e, z, w);
            break;
          default:
            throw Error(i(161));
        }
      } catch (T) {
        Fe(e, e.return, T);
      }
      e.flags &= -3;
    }
    n & 4096 && (e.flags &= -4097);
  }
  function B0(e, n, o) {
    de = e, Ad(e);
  }
  function Ad(e, n, o) {
    for (var s = (e.mode & 1) !== 0; de !== null; ) {
      var u = de, d = u.child;
      if (u.tag === 22 && s) {
        var w = u.memoizedState !== null || zs;
        if (!w) {
          var z = u.alternate, T = z !== null && z.memoizedState !== null || it;
          z = zs;
          var G = it;
          if (zs = w, (it = T) && !G) for (de = u; de !== null; ) w = de, T = w.child, w.tag === 22 && w.memoizedState !== null ? Hd(u) : T !== null ? (T.return = w, de = T) : Hd(u);
          for (; d !== null; ) de = d, Ad(d), d = d.sibling;
          de = u, zs = z, it = G;
        }
        $d(e);
      } else (u.subtreeFlags & 8772) !== 0 && d !== null ? (d.return = u, de = d) : $d(e);
    }
  }
  function $d(e) {
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
                var u = n.elementType === n.type ? o.memoizedProps : At(n.type, o.memoizedProps);
                s.componentDidUpdate(u, o.memoizedState, s.__reactInternalSnapshotBeforeUpdate);
              }
              var d = n.updateQueue;
              d !== null && Of(n, d, s);
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
                Of(n, w, o);
              }
              break;
            case 5:
              var z = n.stateNode;
              if (o === null && n.flags & 4) {
                o = z;
                var T = n.memoizedProps;
                switch (n.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    T.autoFocus && o.focus();
                    break;
                  case "img":
                    T.src && (o.src = T.src);
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
                    oe !== null && Do(oe);
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
  function Od(e) {
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
  function Hd(e) {
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
            } catch (T) {
              Fe(n, o, T);
            }
            break;
          case 1:
            var s = n.stateNode;
            if (typeof s.componentDidMount == "function") {
              var u = n.return;
              try {
                s.componentDidMount();
              } catch (T) {
                Fe(n, u, T);
              }
            }
            var d = n.return;
            try {
              su(n);
            } catch (T) {
              Fe(n, d, T);
            }
            break;
          case 5:
            var w = n.return;
            try {
              su(n);
            } catch (T) {
              Fe(n, w, T);
            }
        }
      } catch (T) {
        Fe(n, n.return, T);
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
  var U0 = Math.ceil, Is = P.ReactCurrentDispatcher, uu = P.ReactCurrentOwner, Rt = P.ReactCurrentBatchConfig, Pe = 0, Qe = null, Ue = null, Je = 0, St = 0, qr = Pn(0), Ye = 0, ni = null, ar = 0, Ts = 0, cu = 0, ri = null, pt = null, fu = 0, Jr = 1 / 0, hn = null, Rs = !1, du = null, Ln = null, Ds = !1, An = null, bs = 0, oi = 0, pu = null, Ls = -1, As = 0;
  function lt() {
    return (Pe & 6) !== 0 ? $e() : Ls !== -1 ? Ls : Ls = $e();
  }
  function $n(e) {
    return (e.mode & 1) === 0 ? 1 : (Pe & 2) !== 0 && Je !== 0 ? Je & -Je : M0.transition !== null ? (As === 0 && (As = Wi()), As) : (e = Te, e !== 0 || (e = window.event, e = e === void 0 ? 16 : jc(e.type)), e);
  }
  function Ht(e, n, o, s) {
    if (50 < oi) throw oi = 0, pu = null, Error(i(185));
    er(e, o, s), ((Pe & 2) === 0 || e !== Qe) && (e === Qe && ((Pe & 2) === 0 && (Ts |= o), Ye === 4 && On(e, Je)), ht(e, s), o === 1 && Pe === 0 && (n.mode & 1) === 0 && (Jr = $e() + 500, cs && Tn()));
  }
  function ht(e, n) {
    var o = e.callbackNode;
    Ui(e, n);
    var s = qn(e, e === Qe ? Je : 0);
    if (s === 0) o !== null && ji(o), e.callbackNode = null, e.callbackPriority = 0;
    else if (n = s & -s, e.callbackPriority !== n) {
      if (o != null && ji(o), n === 1) e.tag === 0 ? N0(Fd.bind(null, e)) : Nf(Fd.bind(null, e)), S0(function() {
        (Pe & 6) === 0 && Tn();
      }), o = null;
      else {
        switch (Rc(s)) {
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
        o = Qd(o, jd.bind(null, e));
      }
      e.callbackPriority = n, e.callbackNode = o;
    }
  }
  function jd(e, n) {
    if (Ls = -1, As = 0, (Pe & 6) !== 0) throw Error(i(327));
    var o = e.callbackNode;
    if (eo() && e.callbackNode !== o) return null;
    var s = qn(e, e === Qe ? Je : 0);
    if (s === 0) return null;
    if ((s & 30) !== 0 || (s & e.expiredLanes) !== 0 || n) n = $s(e, s);
    else {
      n = s;
      var u = Pe;
      Pe |= 2;
      var d = Bd();
      (Qe !== e || Je !== n) && (hn = null, Jr = $e() + 500, cr(e, n));
      do
        try {
          Y0();
          break;
        } catch (z) {
          Vd(e, z);
        }
      while (!0);
      Ta(), Is.current = d, Pe = u, Ue !== null ? n = 0 : (Qe = null, Je = 0, n = Ye);
    }
    if (n !== 0) {
      if (n === 2 && (u = zo(e), u !== 0 && (s = u, n = hu(e, u))), n === 1) throw o = ni, cr(e, 0), On(e, s), ht(e, $e()), o;
      if (n === 6) On(e, s);
      else {
        if (u = e.current.alternate, (s & 30) === 0 && !W0(u) && (n = $s(e, s), n === 2 && (d = zo(e), d !== 0 && (s = d, n = hu(e, d))), n === 1)) throw o = ni, cr(e, 0), On(e, s), ht(e, $e()), o;
        switch (e.finishedWork = u, e.finishedLanes = s, n) {
          case 0:
          case 1:
            throw Error(i(345));
          case 2:
            fr(e, pt, hn);
            break;
          case 3:
            if (On(e, s), (s & 130023424) === s && (n = fu + 500 - $e(), 10 < n)) {
              if (qn(e, 0) !== 0) break;
              if (u = e.suspendedLanes, (u & s) !== s) {
                lt(), e.pingedLanes |= e.suspendedLanes & u;
                break;
              }
              e.timeoutHandle = xa(fr.bind(null, e, pt, hn), n);
              break;
            }
            fr(e, pt, hn);
            break;
          case 4:
            if (On(e, s), (s & 4194240) === s) break;
            for (n = e.eventTimes, u = -1; 0 < s; ) {
              var w = 31 - vt(s);
              d = 1 << w, w = n[w], w > u && (u = w), s &= ~d;
            }
            if (s = u, s = $e() - s, s = (120 > s ? 120 : 480 > s ? 480 : 1080 > s ? 1080 : 1920 > s ? 1920 : 3e3 > s ? 3e3 : 4320 > s ? 4320 : 1960 * U0(s / 1960)) - s, 10 < s) {
              e.timeoutHandle = xa(fr.bind(null, e, pt, hn), s);
              break;
            }
            fr(e, pt, hn);
            break;
          case 5:
            fr(e, pt, hn);
            break;
          default:
            throw Error(i(329));
        }
      }
    }
    return ht(e, $e()), e.callbackNode === o ? jd.bind(null, e) : null;
  }
  function hu(e, n) {
    var o = ri;
    return e.current.memoizedState.isDehydrated && (cr(e, n).flags |= 256), e = $s(e, n), e !== 2 && (n = pt, pt = o, n !== null && gu(n)), e;
  }
  function gu(e) {
    pt === null ? pt = e : pt.push.apply(pt, e);
  }
  function W0(e) {
    for (var n = e; ; ) {
      if (n.flags & 16384) {
        var o = n.updateQueue;
        if (o !== null && (o = o.stores, o !== null)) for (var s = 0; s < o.length; s++) {
          var u = o[s], d = u.getSnapshot;
          u = u.value;
          try {
            if (!bt(d(), u)) return !1;
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
  function On(e, n) {
    for (n &= ~cu, n &= ~Ts, e.suspendedLanes |= n, e.pingedLanes &= ~n, e = e.expirationTimes; 0 < n; ) {
      var o = 31 - vt(n), s = 1 << o;
      e[o] = -1, n &= ~s;
    }
  }
  function Fd(e) {
    if ((Pe & 6) !== 0) throw Error(i(327));
    eo();
    var n = qn(e, 0);
    if ((n & 1) === 0) return ht(e, $e()), null;
    var o = $s(e, n);
    if (e.tag !== 0 && o === 2) {
      var s = zo(e);
      s !== 0 && (n = s, o = hu(e, s));
    }
    if (o === 1) throw o = ni, cr(e, 0), On(e, n), ht(e, $e()), o;
    if (o === 6) throw Error(i(345));
    return e.finishedWork = e.current.alternate, e.finishedLanes = n, fr(e, pt, hn), ht(e, $e()), null;
  }
  function mu(e, n) {
    var o = Pe;
    Pe |= 1;
    try {
      return e(n);
    } finally {
      Pe = o, Pe === 0 && (Jr = $e() + 500, cs && Tn());
    }
  }
  function ur(e) {
    An !== null && An.tag === 0 && (Pe & 6) === 0 && eo();
    var n = Pe;
    Pe |= 1;
    var o = Rt.transition, s = Te;
    try {
      if (Rt.transition = null, Te = 1, e) return e();
    } finally {
      Te = s, Rt.transition = o, Pe = n, (Pe & 6) === 0 && Tn();
    }
  }
  function yu() {
    St = qr.current, Le(qr);
  }
  function cr(e, n) {
    e.finishedWork = null, e.finishedLanes = 0;
    var o = e.timeoutHandle;
    if (o !== -1 && (e.timeoutHandle = -1, _0(o)), Ue !== null) for (o = Ue.return; o !== null; ) {
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
          Le(Oe);
          break;
        case 19:
          Le(Oe);
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
    if (Qe = e, Ue = e = Hn(e.current, null), Je = St = n, Ye = 0, ni = null, cu = Ts = ar = 0, pt = ri = null, ir !== null) {
      for (n = 0; n < ir.length; n++) if (o = ir[n], s = o.interleaved, s !== null) {
        o.interleaved = null;
        var u = s.next, d = o.pending;
        if (d !== null) {
          var w = d.next;
          d.next = u, s.next = w;
        }
        o.pending = s;
      }
      ir = null;
    }
    return e;
  }
  function Vd(e, n) {
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
        if (lr = 0, Ze = Xe = He = null, Ko = !1, Go = 0, uu.current = null, o === null || o.return === null) {
          Ye = 1, ni = n, Ue = null;
          break;
        }
        e: {
          var d = e, w = o.return, z = o, T = n;
          if (n = Je, z.flags |= 32768, T !== null && typeof T == "object" && typeof T.then == "function") {
            var G = T, ne = z, oe = ne.tag;
            if ((ne.mode & 1) === 0 && (oe === 0 || oe === 11 || oe === 15)) {
              var te = ne.alternate;
              te ? (ne.updateQueue = te.updateQueue, ne.memoizedState = te.memoizedState, ne.lanes = te.lanes) : (ne.updateQueue = null, ne.memoizedState = null);
            }
            var fe = pd(w);
            if (fe !== null) {
              fe.flags &= -257, hd(fe, w, z, d, n), fe.mode & 1 && dd(d, G, n), n = fe, T = G;
              var pe = n.updateQueue;
              if (pe === null) {
                var he = /* @__PURE__ */ new Set();
                he.add(T), n.updateQueue = he;
              } else pe.add(T);
              break e;
            } else {
              if ((n & 1) === 0) {
                dd(d, G, n), vu();
                break e;
              }
              T = Error(i(426));
            }
          } else if (Ae && z.mode & 1) {
            var Be = pd(w);
            if (Be !== null) {
              (Be.flags & 65536) === 0 && (Be.flags |= 256), hd(Be, w, z, d, n), Pa(Kr(T, z));
              break e;
            }
          }
          d = T = Kr(T, z), Ye !== 4 && (Ye = 2), ri === null ? ri = [d] : ri.push(d), d = w;
          do {
            switch (d.tag) {
              case 3:
                d.flags |= 65536, n &= -n, d.lanes |= n;
                var W = cd(d, T, n);
                $f(d, W);
                break e;
              case 1:
                z = T;
                var b = d.type, X = d.stateNode;
                if ((d.flags & 128) === 0 && (typeof b.getDerivedStateFromError == "function" || X !== null && typeof X.componentDidCatch == "function" && (Ln === null || !Ln.has(X)))) {
                  d.flags |= 65536, n &= -n, d.lanes |= n;
                  var se = fd(d, z, n);
                  $f(d, se);
                  break e;
                }
            }
            d = d.return;
          } while (d !== null);
        }
        Wd(o);
      } catch (ge) {
        n = ge, Ue === o && o !== null && (Ue = o = o.return);
        continue;
      }
      break;
    } while (!0);
  }
  function Bd() {
    var e = Is.current;
    return Is.current = Es, e === null ? Es : e;
  }
  function vu() {
    (Ye === 0 || Ye === 3 || Ye === 2) && (Ye = 4), Qe === null || (ar & 268435455) === 0 && (Ts & 268435455) === 0 || On(Qe, Je);
  }
  function $s(e, n) {
    var o = Pe;
    Pe |= 2;
    var s = Bd();
    (Qe !== e || Je !== n) && (hn = null, cr(e, n));
    do
      try {
        X0();
        break;
      } catch (u) {
        Vd(e, u);
      }
    while (!0);
    if (Ta(), Pe = o, Is.current = s, Ue !== null) throw Error(i(261));
    return Qe = null, Je = 0, Ye;
  }
  function X0() {
    for (; Ue !== null; ) Ud(Ue);
  }
  function Y0() {
    for (; Ue !== null && !Fl(); ) Ud(Ue);
  }
  function Ud(e) {
    var n = Zd(e.alternate, e, St);
    e.memoizedProps = e.pendingProps, n === null ? Wd(e) : Ue = n, uu.current = null;
  }
  function Wd(e) {
    var n = e;
    do {
      var o = n.alternate;
      if (e = n.return, (n.flags & 32768) === 0) {
        if (o = H0(o, n, St), o !== null) {
          Ue = o;
          return;
        }
      } else {
        if (o = j0(o, n), o !== null) {
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
  function fr(e, n, o) {
    var s = Te, u = Rt.transition;
    try {
      Rt.transition = null, Te = 1, Z0(e, n, o, s);
    } finally {
      Rt.transition = u, Te = s;
    }
    return null;
  }
  function Z0(e, n, o, s) {
    do
      eo();
    while (An !== null);
    if ((Pe & 6) !== 0) throw Error(i(327));
    o = e.finishedWork;
    var u = e.finishedLanes;
    if (o === null) return null;
    if (e.finishedWork = null, e.finishedLanes = 0, o === e.current) throw Error(i(177));
    e.callbackNode = null, e.callbackPriority = 0;
    var d = o.lanes | o.childLanes;
    if (Ql(e, d), e === Qe && (Ue = Qe = null, Je = 0), (o.subtreeFlags & 2064) === 0 && (o.flags & 2064) === 0 || Ds || (Ds = !0, Qd(zr, function() {
      return eo(), null;
    })), d = (o.flags & 15990) !== 0, (o.subtreeFlags & 15990) !== 0 || d) {
      d = Rt.transition, Rt.transition = null;
      var w = Te;
      Te = 1;
      var z = Pe;
      Pe |= 4, uu.current = null, V0(e, o), Ld(o, e), h0(va), Zi = !!ya, va = ya = null, e.current = o, B0(o), Fi(), Pe = z, Te = w, Rt.transition = d;
    } else e.current = o;
    if (Ds && (Ds = !1, An = e, bs = u), d = e.pendingLanes, d === 0 && (Ln = null), Ul(o.stateNode), ht(e, $e()), n !== null) for (s = e.onRecoverableError, o = 0; o < n.length; o++) u = n[o], s(u.value, { componentStack: u.stack, digest: u.digest });
    if (Rs) throw Rs = !1, e = du, du = null, e;
    return (bs & 1) !== 0 && e.tag !== 0 && eo(), d = e.pendingLanes, (d & 1) !== 0 ? e === pu ? oi++ : (oi = 0, pu = e) : oi = 0, Tn(), null;
  }
  function eo() {
    if (An !== null) {
      var e = Rc(bs), n = Rt.transition, o = Te;
      try {
        if (Rt.transition = null, Te = 16 > e ? 16 : e, An === null) var s = !1;
        else {
          if (e = An, An = null, bs = 0, (Pe & 6) !== 0) throw Error(i(331));
          var u = Pe;
          for (Pe |= 4, de = e.current; de !== null; ) {
            var d = de, w = d.child;
            if ((de.flags & 16) !== 0) {
              var z = d.deletions;
              if (z !== null) {
                for (var T = 0; T < z.length; T++) {
                  var G = z[T];
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
                      if (Id(ne), ne === G) {
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
              var W = d.sibling;
              if (W !== null) {
                W.return = d.return, de = W;
                break e;
              }
              de = d.return;
            }
          }
          var b = e.current;
          for (de = b; de !== null; ) {
            w = de;
            var X = w.child;
            if ((w.subtreeFlags & 2064) !== 0 && X !== null) X.return = w, de = X;
            else e: for (w = b; de !== null; ) {
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
          if (Pe = u, Tn(), yt && typeof yt.onPostCommitFiberRoot == "function") try {
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
  function Xd(e, n, o) {
    n = Kr(o, n), n = cd(e, n, 1), e = Dn(e, n, 1), n = lt(), e !== null && (er(e, 1, n), ht(e, n));
  }
  function Fe(e, n, o) {
    if (e.tag === 3) Xd(e, e, o);
    else for (; n !== null; ) {
      if (n.tag === 3) {
        Xd(n, e, o);
        break;
      } else if (n.tag === 1) {
        var s = n.stateNode;
        if (typeof n.type.getDerivedStateFromError == "function" || typeof s.componentDidCatch == "function" && (Ln === null || !Ln.has(s))) {
          e = Kr(o, e), e = fd(n, e, 1), n = Dn(n, e, 1), e = lt(), n !== null && (er(n, 1, e), ht(n, e));
          break;
        }
      }
      n = n.return;
    }
  }
  function Q0(e, n, o) {
    var s = e.pingCache;
    s !== null && s.delete(n), n = lt(), e.pingedLanes |= e.suspendedLanes & o, Qe === e && (Je & o) === o && (Ye === 4 || Ye === 3 && (Je & 130023424) === Je && 500 > $e() - fu ? cr(e, 0) : cu |= o), ht(e, n);
  }
  function Yd(e, n) {
    n === 0 && ((e.mode & 1) === 0 ? n = 1 : (n = Tr, Tr <<= 1, (Tr & 130023424) === 0 && (Tr = 4194304)));
    var o = lt();
    e = fn(e, n), e !== null && (er(e, n, o), ht(e, o));
  }
  function K0(e) {
    var n = e.memoizedState, o = 0;
    n !== null && (o = n.retryLane), Yd(e, o);
  }
  function G0(e, n) {
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
    s !== null && s.delete(n), Yd(e, o);
  }
  var Zd;
  Zd = function(e, n, o) {
    if (e !== null) if (e.memoizedProps !== n.pendingProps || ct.current) dt = !0;
    else {
      if ((e.lanes & o) === 0 && (n.flags & 128) === 0) return dt = !1, O0(e, n, o);
      dt = (e.flags & 131072) !== 0;
    }
    else dt = !1, Ae && (n.flags & 1048576) !== 0 && Mf(n, ds, n.index);
    switch (n.lanes = 0, n.tag) {
      case 2:
        var s = n.type;
        Ms(e, n), e = n.pendingProps;
        var u = Vr(n, nt.current);
        Zr(n, o), u = Va(null, n, s, e, u, o);
        var d = Ba();
        return n.flags |= 1, typeof u == "object" && u !== null && typeof u.render == "function" && u.$$typeof === void 0 ? (n.tag = 1, n.memoizedState = null, n.updateQueue = null, ft(s) ? (d = !0, us(n)) : d = !1, n.memoizedState = u.state !== null && u.state !== void 0 ? u.state : null, La(n), u.updater = Cs, n.stateNode = u, u._reactInternals = n, Qa(n, s, e, o), n = Ja(null, n, s, !0, d, o)) : (n.tag = 0, Ae && d && Ca(n), st(null, n, u, o), n = n.child), n;
      case 16:
        s = n.elementType;
        e: {
          switch (Ms(e, n), e = n.pendingProps, u = s._init, s = u(s._payload), n.type = s, u = n.tag = J0(s), e = At(s, e), u) {
            case 0:
              n = qa(null, n, s, e, o);
              break e;
            case 1:
              n = xd(null, n, s, e, o);
              break e;
            case 11:
              n = gd(null, n, s, e, o);
              break e;
            case 14:
              n = md(null, n, s, At(s.type, e), o);
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
        return s = n.type, u = n.pendingProps, u = n.elementType === s ? u : At(s, u), qa(e, n, s, u, o);
      case 1:
        return s = n.type, u = n.pendingProps, u = n.elementType === s ? u : At(s, u), xd(e, n, s, u, o);
      case 3:
        e: {
          if (_d(n), e === null) throw Error(i(387));
          s = n.pendingProps, d = n.memoizedState, u = d.element, Af(e, n), vs(n, s, null, o);
          var w = n.memoizedState;
          if (s = w.element, d.isDehydrated) if (d = { element: s, isDehydrated: !1, cache: w.cache, pendingSuspenseBoundaries: w.pendingSuspenseBoundaries, transitions: w.transitions }, n.updateQueue.baseState = d, n.memoizedState = d, n.flags & 256) {
            u = Kr(Error(i(423)), n), n = Sd(e, n, s, o, u);
            break e;
          } else if (s !== u) {
            u = Kr(Error(i(424)), n), n = Sd(e, n, s, o, u);
            break e;
          } else for (_t = zn(n.stateNode.containerInfo.firstChild), xt = n, Ae = !0, Lt = null, o = bf(n, null, s, o), n.child = o; o; ) o.flags = o.flags & -3 | 4096, o = o.sibling;
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
        return Hf(n), e === null && za(n), s = n.type, u = n.pendingProps, d = e !== null ? e.memoizedProps : null, w = u.children, wa(s, u) ? w = null : d !== null && wa(s, d) && (n.flags |= 32), wd(e, n), st(e, n, w, o), n.child;
      case 6:
        return e === null && za(n), null;
      case 13:
        return kd(e, n, o);
      case 4:
        return Aa(n, n.stateNode.containerInfo), s = n.pendingProps, e === null ? n.child = Xr(n, null, s, o) : st(e, n, s, o), n.child;
      case 11:
        return s = n.type, u = n.pendingProps, u = n.elementType === s ? u : At(s, u), gd(e, n, s, u, o);
      case 7:
        return st(e, n, n.pendingProps, o), n.child;
      case 8:
        return st(e, n, n.pendingProps.children, o), n.child;
      case 12:
        return st(e, n, n.pendingProps.children, o), n.child;
      case 10:
        e: {
          if (s = n.type._context, u = n.pendingProps, d = n.memoizedProps, w = u.value, Re(gs, s._currentValue), s._currentValue = w, d !== null) if (bt(d.value, w)) {
            if (d.children === u.children && !ct.current) {
              n = pn(e, n, o);
              break e;
            }
          } else for (d = n.child, d !== null && (d.return = n); d !== null; ) {
            var z = d.dependencies;
            if (z !== null) {
              w = d.child;
              for (var T = z.firstContext; T !== null; ) {
                if (T.context === s) {
                  if (d.tag === 1) {
                    T = dn(-1, o & -o), T.tag = 2;
                    var G = d.updateQueue;
                    if (G !== null) {
                      G = G.shared;
                      var ne = G.pending;
                      ne === null ? T.next = T : (T.next = ne.next, ne.next = T), G.pending = T;
                    }
                  }
                  d.lanes |= o, T = d.alternate, T !== null && (T.lanes |= o), Da(
                    d.return,
                    o,
                    n
                  ), z.lanes |= o;
                  break;
                }
                T = T.next;
              }
            } else if (d.tag === 10) w = d.type === n.type ? null : d.child;
            else if (d.tag === 18) {
              if (w = d.return, w === null) throw Error(i(341));
              w.lanes |= o, z = w.alternate, z !== null && (z.lanes |= o), Da(w, o, n), w = d.sibling;
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
        return s = n.type, u = At(s, n.pendingProps), u = At(s.type, u), md(e, n, s, u, o);
      case 15:
        return yd(e, n, n.type, n.pendingProps, o);
      case 17:
        return s = n.type, u = n.pendingProps, u = n.elementType === s ? u : At(s, u), Ms(e, n), n.tag = 1, ft(s) ? (e = !0, us(n)) : e = !1, Zr(n, o), ad(n, s, u), Qa(n, s, u, o), Ja(null, n, s, !0, e, o);
      case 19:
        return Cd(e, n, o);
      case 22:
        return vd(e, n, o);
    }
    throw Error(i(156, n.tag));
  };
  function Qd(e, n) {
    return Hi(e, n);
  }
  function q0(e, n, o, s) {
    this.tag = e, this.key = o, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = n, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = s, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Dt(e, n, o, s) {
    return new q0(e, n, o, s);
  }
  function wu(e) {
    return e = e.prototype, !(!e || !e.isReactComponent);
  }
  function J0(e) {
    if (typeof e == "function") return wu(e) ? 1 : 0;
    if (e != null) {
      if (e = e.$$typeof, e === ee) return 11;
      if (e === A) return 14;
    }
    return 2;
  }
  function Hn(e, n) {
    var o = e.alternate;
    return o === null ? (o = Dt(e.tag, n, e.key, e.mode), o.elementType = e.elementType, o.type = e.type, o.stateNode = e.stateNode, o.alternate = e, e.alternate = o) : (o.pendingProps = n, o.type = e.type, o.flags = 0, o.subtreeFlags = 0, o.deletions = null), o.flags = e.flags & 14680064, o.childLanes = e.childLanes, o.lanes = e.lanes, o.child = e.child, o.memoizedProps = e.memoizedProps, o.memoizedState = e.memoizedState, o.updateQueue = e.updateQueue, n = e.dependencies, o.dependencies = n === null ? null : { lanes: n.lanes, firstContext: n.firstContext }, o.sibling = e.sibling, o.index = e.index, o.ref = e.ref, o;
  }
  function Os(e, n, o, s, u, d) {
    var w = 2;
    if (s = e, typeof e == "function") wu(e) && (w = 1);
    else if (typeof e == "string") w = 5;
    else e: switch (e) {
      case j:
        return dr(o.children, u, d, n);
      case Y:
        w = 8, u |= 8;
        break;
      case I:
        return e = Dt(12, o, n, u | 2), e.elementType = I, e.lanes = d, e;
      case J:
        return e = Dt(13, o, n, u), e.elementType = J, e.lanes = d, e;
      case N:
        return e = Dt(19, o, n, u), e.elementType = N, e.lanes = d, e;
      case B:
        return Hs(o, u, d, n);
      default:
        if (typeof e == "object" && e !== null) switch (e.$$typeof) {
          case K:
            w = 10;
            break e;
          case Z:
            w = 9;
            break e;
          case ee:
            w = 11;
            break e;
          case A:
            w = 14;
            break e;
          case O:
            w = 16, s = null;
            break e;
        }
        throw Error(i(130, e == null ? e : typeof e, ""));
    }
    return n = Dt(w, o, n, u), n.elementType = e, n.type = s, n.lanes = d, n;
  }
  function dr(e, n, o, s) {
    return e = Dt(7, e, s, n), e.lanes = o, e;
  }
  function Hs(e, n, o, s) {
    return e = Dt(22, e, s, n), e.elementType = B, e.lanes = o, e.stateNode = { isHidden: !1 }, e;
  }
  function xu(e, n, o) {
    return e = Dt(6, e, null, n), e.lanes = o, e;
  }
  function _u(e, n, o) {
    return n = Dt(4, e.children !== null ? e.children : [], e.key, n), n.lanes = o, n.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, n;
  }
  function ey(e, n, o, s, u) {
    this.tag = n, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Jn(0), this.expirationTimes = Jn(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Jn(0), this.identifierPrefix = s, this.onRecoverableError = u, this.mutableSourceEagerHydrationData = null;
  }
  function Su(e, n, o, s, u, d, w, z, T) {
    return e = new ey(e, n, o, z, T), n === 1 ? (n = 1, d === !0 && (n |= 8)) : n = 0, d = Dt(3, null, null, n), e.current = d, d.stateNode = e, d.memoizedState = { element: s, isDehydrated: o, cache: null, transitions: null, pendingSuspenseBoundaries: null }, La(d), e;
  }
  function ty(e, n, o) {
    var s = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: D, key: s == null ? null : "" + s, children: e, containerInfo: n, implementation: o };
  }
  function Kd(e) {
    if (!e) return In;
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
      if (ft(o)) return Ef(e, o, n);
    }
    return n;
  }
  function Gd(e, n, o, s, u, d, w, z, T) {
    return e = Su(o, s, !0, e, u, d, w, z, T), e.context = Kd(null), o = e.current, s = lt(), u = $n(o), d = dn(s, u), d.callback = n ?? null, Dn(o, d, u), e.current.lanes = u, er(e, u, s), ht(e, s), e;
  }
  function js(e, n, o, s) {
    var u = n.current, d = lt(), w = $n(u);
    return o = Kd(o), n.context === null ? n.context = o : n.pendingContext = o, n = dn(d, w), n.payload = { element: e }, s = s === void 0 ? null : s, s !== null && (n.callback = s), e = Dn(u, n, w), e !== null && (Ht(e, u, w, d), ys(e, u, w)), w;
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
  function qd(e, n) {
    if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
      var o = e.retryLane;
      e.retryLane = o !== 0 && o < n ? o : n;
    }
  }
  function ku(e, n) {
    qd(e, n), (e = e.alternate) && qd(e, n);
  }
  function ny() {
    return null;
  }
  var Jd = typeof reportError == "function" ? reportError : function(e) {
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
      ur(function() {
        js(null, e, null, null);
      }), n[ln] = null;
    }
  };
  function Vs(e) {
    this._internalRoot = e;
  }
  Vs.prototype.unstable_scheduleHydration = function(e) {
    if (e) {
      var n = Lc();
      e = { blockedOn: null, target: e, priority: n };
      for (var o = 0; o < Cn.length && n !== 0 && n < Cn[o].priority; o++) ;
      Cn.splice(o, 0, e), o === 0 && Oc(e);
    }
  };
  function Cu(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
  }
  function Bs(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
  }
  function ep() {
  }
  function ry(e, n, o, s, u) {
    if (u) {
      if (typeof s == "function") {
        var d = s;
        s = function() {
          var G = Fs(w);
          d.call(G);
        };
      }
      var w = Gd(n, s, e, 0, null, !1, !1, "", ep);
      return e._reactRootContainer = w, e[ln] = w.current, Vo(e.nodeType === 8 ? e.parentNode : e), ur(), w;
    }
    for (; u = e.lastChild; ) e.removeChild(u);
    if (typeof s == "function") {
      var z = s;
      s = function() {
        var G = Fs(T);
        z.call(G);
      };
    }
    var T = Su(e, 0, !1, null, null, !1, !1, "", ep);
    return e._reactRootContainer = T, e[ln] = T.current, Vo(e.nodeType === 8 ? e.parentNode : e), ur(function() {
      js(n, T, o, s);
    }), T;
  }
  function Us(e, n, o, s, u) {
    var d = o._reactRootContainer;
    if (d) {
      var w = d;
      if (typeof u == "function") {
        var z = u;
        u = function() {
          var T = Fs(w);
          z.call(T);
        };
      }
      js(n, w, e, u);
    } else w = ry(o, n, e, u, s);
    return Fs(w);
  }
  Dc = function(e) {
    switch (e.tag) {
      case 3:
        var n = e.stateNode;
        if (n.current.memoizedState.isDehydrated) {
          var o = Gn(n.pendingLanes);
          o !== 0 && (Rr(n, o | 1), ht(n, $e()), (Pe & 6) === 0 && (Jr = $e() + 500, Tn()));
        }
        break;
      case 13:
        ur(function() {
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
  }, bc = function(e) {
    if (e.tag === 13) {
      var n = $n(e), o = fn(e, n);
      if (o !== null) {
        var s = lt();
        Ht(o, e, n, s);
      }
      ku(e, n);
    }
  }, Lc = function() {
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
  }, bi = mu, Li = ur;
  var oy = { usingClientEntryPoint: !1, Events: [Wo, jr, ls, Ri, Di, mu] }, ii = { findFiberByHostInstance: tr, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, iy = { bundleType: ii.bundleType, version: ii.version, rendererPackageName: ii.rendererPackageName, rendererConfig: ii.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: P.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
    return e = $i(e), e === null ? null : e.stateNode;
  }, findFiberByHostInstance: ii.findFiberByHostInstance || ny, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Ws = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Ws.isDisabled && Ws.supportsFiber) try {
      Pr = Ws.inject(iy), yt = Ws;
    } catch {
    }
  }
  return gt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = oy, gt.createPortal = function(e, n) {
    var o = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!Cu(n)) throw Error(i(200));
    return ty(e, n, null, o);
  }, gt.createRoot = function(e, n) {
    if (!Cu(e)) throw Error(i(299));
    var o = !1, s = "", u = Jd;
    return n != null && (n.unstable_strictMode === !0 && (o = !0), n.identifierPrefix !== void 0 && (s = n.identifierPrefix), n.onRecoverableError !== void 0 && (u = n.onRecoverableError)), n = Su(e, 1, !1, null, null, o, !1, s, u), e[ln] = n.current, Vo(e.nodeType === 8 ? e.parentNode : e), new Eu(n);
  }, gt.findDOMNode = function(e) {
    if (e == null) return null;
    if (e.nodeType === 1) return e;
    var n = e._reactInternals;
    if (n === void 0)
      throw typeof e.render == "function" ? Error(i(188)) : (e = Object.keys(e).join(","), Error(i(268, e)));
    return e = $i(n), e = e === null ? null : e.stateNode, e;
  }, gt.flushSync = function(e) {
    return ur(e);
  }, gt.hydrate = function(e, n, o) {
    if (!Bs(n)) throw Error(i(200));
    return Us(null, e, n, !0, o);
  }, gt.hydrateRoot = function(e, n, o) {
    if (!Cu(e)) throw Error(i(405));
    var s = o != null && o.hydratedSources || null, u = !1, d = "", w = Jd;
    if (o != null && (o.unstable_strictMode === !0 && (u = !0), o.identifierPrefix !== void 0 && (d = o.identifierPrefix), o.onRecoverableError !== void 0 && (w = o.onRecoverableError)), n = Gd(n, null, e, 1, o ?? null, u, !1, d, w), e[ln] = n.current, Vo(e), s) for (e = 0; e < s.length; e++) o = s[e], u = o._getVersion, u = u(o._source), n.mutableSourceEagerHydrationData == null ? n.mutableSourceEagerHydrationData = [o, u] : n.mutableSourceEagerHydrationData.push(
      o,
      u
    );
    return new Vs(n);
  }, gt.render = function(e, n, o) {
    if (!Bs(n)) throw Error(i(200));
    return Us(null, e, n, !1, o);
  }, gt.unmountComponentAtNode = function(e) {
    if (!Bs(e)) throw Error(i(40));
    return e._reactRootContainer ? (ur(function() {
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
var ap;
function zh() {
  if (ap) return zu.exports;
  ap = 1;
  function t() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(t);
      } catch (r) {
        console.error(r);
      }
  }
  return t(), zu.exports = dy(), zu.exports;
}
var up;
function py() {
  if (up) return Xs;
  up = 1;
  var t = zh();
  return Xs.createRoot = t.createRoot, Xs.hydrateRoot = t.hydrateRoot, Xs;
}
var hy = py();
const gy = ".react-flow{direction:ltr;--xy-edge-stroke-default: #b1b1b7;--xy-edge-stroke-width-default: 1;--xy-edge-stroke-selected-default: #555;--xy-connectionline-stroke-default: #b1b1b7;--xy-connectionline-stroke-width-default: 1;--xy-attribution-background-color-default: rgba(255, 255, 255, .5);--xy-minimap-background-color-default: #fff;--xy-minimap-mask-background-color-default: rgba(240, 240, 240, .6);--xy-minimap-mask-stroke-color-default: transparent;--xy-minimap-mask-stroke-width-default: 1;--xy-minimap-node-background-color-default: #e2e2e2;--xy-minimap-node-stroke-color-default: transparent;--xy-minimap-node-stroke-width-default: 2;--xy-background-color-default: transparent;--xy-background-pattern-dots-color-default: #91919a;--xy-background-pattern-lines-color-default: #eee;--xy-background-pattern-cross-color-default: #e2e2e2;background-color:var(--xy-background-color, var(--xy-background-color-default));--xy-node-color-default: inherit;--xy-node-border-default: 1px solid #1a192b;--xy-node-background-color-default: #fff;--xy-node-group-background-color-default: rgba(240, 240, 240, .25);--xy-node-boxshadow-hover-default: 0 1px 4px 1px rgba(0, 0, 0, .08);--xy-node-boxshadow-selected-default: 0 0 0 .5px #1a192b;--xy-node-border-radius-default: 3px;--xy-handle-background-color-default: #1a192b;--xy-handle-border-color-default: #fff;--xy-selection-background-color-default: rgba(0, 89, 220, .08);--xy-selection-border-default: 1px dotted rgba(0, 89, 220, .8);--xy-controls-button-background-color-default: #fefefe;--xy-controls-button-background-color-hover-default: #f4f4f4;--xy-controls-button-color-default: inherit;--xy-controls-button-color-hover-default: inherit;--xy-controls-button-border-color-default: #eee;--xy-controls-box-shadow-default: 0 0 2px 1px rgba(0, 0, 0, .08);--xy-edge-label-background-color-default: #ffffff;--xy-edge-label-color-default: inherit;--xy-resize-background-color-default: #3367d9}.react-flow.dark{--xy-edge-stroke-default: #3e3e3e;--xy-edge-stroke-width-default: 1;--xy-edge-stroke-selected-default: #727272;--xy-connectionline-stroke-default: #b1b1b7;--xy-connectionline-stroke-width-default: 1;--xy-attribution-background-color-default: rgba(150, 150, 150, .25);--xy-minimap-background-color-default: #141414;--xy-minimap-mask-background-color-default: rgba(60, 60, 60, .6);--xy-minimap-mask-stroke-color-default: transparent;--xy-minimap-mask-stroke-width-default: 1;--xy-minimap-node-background-color-default: #2b2b2b;--xy-minimap-node-stroke-color-default: transparent;--xy-minimap-node-stroke-width-default: 2;--xy-background-color-default: #141414;--xy-background-pattern-dots-color-default: #555;--xy-background-pattern-lines-color-default: #333;--xy-background-pattern-cross-color-default: #333;--xy-node-color-default: #f8f8f8;--xy-node-border-default: 1px solid #3c3c3c;--xy-node-background-color-default: #1e1e1e;--xy-node-group-background-color-default: rgba(240, 240, 240, .25);--xy-node-boxshadow-hover-default: 0 1px 4px 1px rgba(255, 255, 255, .08);--xy-node-boxshadow-selected-default: 0 0 0 .5px #999;--xy-handle-background-color-default: #bebebe;--xy-handle-border-color-default: #1e1e1e;--xy-selection-background-color-default: rgba(200, 200, 220, .08);--xy-selection-border-default: 1px dotted rgba(200, 200, 220, .8);--xy-controls-button-background-color-default: #2b2b2b;--xy-controls-button-background-color-hover-default: #3e3e3e;--xy-controls-button-color-default: #f8f8f8;--xy-controls-button-color-hover-default: #fff;--xy-controls-button-border-color-default: #5b5b5b;--xy-controls-box-shadow-default: 0 0 2px 1px rgba(0, 0, 0, .08);--xy-edge-label-background-color-default: #141414;--xy-edge-label-color-default: #f8f8f8}.react-flow__background{background-color:var(--xy-background-color-props, var(--xy-background-color, var(--xy-background-color-default)));pointer-events:none;z-index:-1}.react-flow__container{position:absolute;width:100%;height:100%;top:0;left:0}.react-flow__pane{z-index:1;touch-action:none}.react-flow__pane.draggable{cursor:grab}.react-flow__pane.dragging{cursor:grabbing}.react-flow__pane.selection{cursor:pointer}.react-flow__viewport{transform-origin:0 0;z-index:2;pointer-events:none}.react-flow__renderer{z-index:4}.react-flow__selection{z-index:6}.react-flow__nodesselection-rect:focus,.react-flow__nodesselection-rect:focus-visible{outline:none}.react-flow__edge-path{stroke:var(--xy-edge-stroke, var(--xy-edge-stroke-default));stroke-width:var(--xy-edge-stroke-width, var(--xy-edge-stroke-width-default));fill:none}.react-flow__connection-path{stroke:var(--xy-connectionline-stroke, var(--xy-connectionline-stroke-default));stroke-width:var(--xy-connectionline-stroke-width, var(--xy-connectionline-stroke-width-default));fill:none}.react-flow .react-flow__edges{position:absolute}.react-flow .react-flow__edges svg{overflow:visible;position:absolute;pointer-events:none}.react-flow__edge{pointer-events:visibleStroke}.react-flow__edge.selectable{cursor:pointer}.react-flow__edge.animated path{stroke-dasharray:5;animation:dashdraw .5s linear infinite}.react-flow__edge.animated path.react-flow__edge-interaction{stroke-dasharray:none;animation:none}.react-flow__edge.inactive{pointer-events:none}.react-flow__edge.selected,.react-flow__edge:focus,.react-flow__edge:focus-visible{outline:none}.react-flow__edge.selected .react-flow__edge-path,.react-flow__edge.selectable:focus .react-flow__edge-path,.react-flow__edge.selectable:focus-visible .react-flow__edge-path{stroke:var(--xy-edge-stroke-selected, var(--xy-edge-stroke-selected-default))}.react-flow__edge-textwrapper{pointer-events:all}.react-flow__edge .react-flow__edge-text{pointer-events:none;-webkit-user-select:none;-moz-user-select:none;user-select:none}.react-flow__arrowhead polyline{stroke:var(--xy-edge-stroke, var(--xy-edge-stroke-default))}.react-flow__arrowhead polyline.arrowclosed{fill:var(--xy-edge-stroke, var(--xy-edge-stroke-default))}.react-flow__connection{pointer-events:none}.react-flow__connection .animated{stroke-dasharray:5;animation:dashdraw .5s linear infinite}svg.react-flow__connectionline{z-index:1001;overflow:visible;position:absolute}.react-flow__nodes{pointer-events:none;transform-origin:0 0}.react-flow__node{position:absolute;-webkit-user-select:none;-moz-user-select:none;user-select:none;pointer-events:all;transform-origin:0 0;box-sizing:border-box;cursor:default}.react-flow__node.selectable{cursor:pointer}.react-flow__node.draggable{cursor:grab;pointer-events:all}.react-flow__node.draggable.dragging{cursor:grabbing}.react-flow__nodesselection{z-index:3;transform-origin:left top;pointer-events:none}.react-flow__nodesselection-rect{position:absolute;pointer-events:all;cursor:grab}.react-flow__handle{position:absolute;pointer-events:none;min-width:5px;min-height:5px;width:6px;height:6px;background-color:var(--xy-handle-background-color, var(--xy-handle-background-color-default));border:1px solid var(--xy-handle-border-color, var(--xy-handle-border-color-default));border-radius:100%}.react-flow__handle.connectingfrom{pointer-events:all}.react-flow__handle.connectionindicator{pointer-events:all;cursor:crosshair}.react-flow__handle-bottom{top:auto;left:50%;bottom:0;transform:translate(-50%,50%)}.react-flow__handle-top{top:0;left:50%;transform:translate(-50%,-50%)}.react-flow__handle-left{top:50%;left:0;transform:translate(-50%,-50%)}.react-flow__handle-right{top:50%;right:0;transform:translate(50%,-50%)}.react-flow__edgeupdater{cursor:move;pointer-events:all}.react-flow__pane.selection .react-flow__panel{pointer-events:none}.react-flow__panel{position:absolute;z-index:5;margin:15px}.react-flow__panel.top{top:0}.react-flow__panel.bottom{bottom:0}.react-flow__panel.top.center,.react-flow__panel.bottom.center{left:50%;transform:translate(-15px) translate(-50%)}.react-flow__panel.left{left:0}.react-flow__panel.right{right:0}.react-flow__panel.left.center,.react-flow__panel.right.center{top:50%;transform:translateY(-15px) translateY(-50%)}.react-flow__attribution{font-size:10px;background:var(--xy-attribution-background-color, var(--xy-attribution-background-color-default));padding:2px 3px;margin:0}.react-flow__attribution a{text-decoration:none;color:#999}@keyframes dashdraw{0%{stroke-dashoffset:10}}.react-flow__edgelabel-renderer{position:absolute;width:100%;height:100%;pointer-events:none;-webkit-user-select:none;-moz-user-select:none;user-select:none;left:0;top:0}.react-flow__viewport-portal{position:absolute;width:100%;height:100%;left:0;top:0;-webkit-user-select:none;-moz-user-select:none;user-select:none}.react-flow__minimap{background:var( --xy-minimap-background-color-props, var(--xy-minimap-background-color, var(--xy-minimap-background-color-default)) )}.react-flow__minimap-svg{display:block}.react-flow__minimap-mask{fill:var( --xy-minimap-mask-background-color-props, var(--xy-minimap-mask-background-color, var(--xy-minimap-mask-background-color-default)) );stroke:var( --xy-minimap-mask-stroke-color-props, var(--xy-minimap-mask-stroke-color, var(--xy-minimap-mask-stroke-color-default)) );stroke-width:var( --xy-minimap-mask-stroke-width-props, var(--xy-minimap-mask-stroke-width, var(--xy-minimap-mask-stroke-width-default)) )}.react-flow__minimap-node{fill:var( --xy-minimap-node-background-color-props, var(--xy-minimap-node-background-color, var(--xy-minimap-node-background-color-default)) );stroke:var( --xy-minimap-node-stroke-color-props, var(--xy-minimap-node-stroke-color, var(--xy-minimap-node-stroke-color-default)) );stroke-width:var( --xy-minimap-node-stroke-width-props, var(--xy-minimap-node-stroke-width, var(--xy-minimap-node-stroke-width-default)) )}.react-flow__background-pattern.dots{fill:var( --xy-background-pattern-color-props, var(--xy-background-pattern-color, var(--xy-background-pattern-dots-color-default)) )}.react-flow__background-pattern.lines{stroke:var( --xy-background-pattern-color-props, var(--xy-background-pattern-color, var(--xy-background-pattern-lines-color-default)) )}.react-flow__background-pattern.cross{stroke:var( --xy-background-pattern-color-props, var(--xy-background-pattern-color, var(--xy-background-pattern-cross-color-default)) )}.react-flow__controls{display:flex;flex-direction:column;box-shadow:var(--xy-controls-box-shadow, var(--xy-controls-box-shadow-default))}.react-flow__controls.horizontal{flex-direction:row}.react-flow__controls-button{display:flex;justify-content:center;align-items:center;height:26px;width:26px;padding:4px;border:none;background:var(--xy-controls-button-background-color, var(--xy-controls-button-background-color-default));border-bottom:1px solid var( --xy-controls-button-border-color-props, var(--xy-controls-button-border-color, var(--xy-controls-button-border-color-default)) );color:var( --xy-controls-button-color-props, var(--xy-controls-button-color, var(--xy-controls-button-color-default)) );cursor:pointer;-webkit-user-select:none;-moz-user-select:none;user-select:none}.react-flow__controls-button svg{width:100%;max-width:12px;max-height:12px;fill:currentColor}.react-flow__edge.updating .react-flow__edge-path{stroke:#777}.react-flow__edge-text{font-size:10px}.react-flow__node.selectable:focus,.react-flow__node.selectable:focus-visible{outline:none}.react-flow__node-input,.react-flow__node-default,.react-flow__node-output,.react-flow__node-group{padding:10px;border-radius:var(--xy-node-border-radius, var(--xy-node-border-radius-default));width:150px;font-size:12px;color:var(--xy-node-color, var(--xy-node-color-default));text-align:center;border:var(--xy-node-border, var(--xy-node-border-default));background-color:var(--xy-node-background-color, var(--xy-node-background-color-default))}.react-flow__node-input.selectable:hover,.react-flow__node-default.selectable:hover,.react-flow__node-output.selectable:hover,.react-flow__node-group.selectable:hover{box-shadow:var(--xy-node-boxshadow-hover, var(--xy-node-boxshadow-hover-default))}.react-flow__node-input.selectable.selected,.react-flow__node-input.selectable:focus,.react-flow__node-input.selectable:focus-visible,.react-flow__node-default.selectable.selected,.react-flow__node-default.selectable:focus,.react-flow__node-default.selectable:focus-visible,.react-flow__node-output.selectable.selected,.react-flow__node-output.selectable:focus,.react-flow__node-output.selectable:focus-visible,.react-flow__node-group.selectable.selected,.react-flow__node-group.selectable:focus,.react-flow__node-group.selectable:focus-visible{box-shadow:var(--xy-node-boxshadow-selected, var(--xy-node-boxshadow-selected-default))}.react-flow__node-group{background-color:var(--xy-node-group-background-color, var(--xy-node-group-background-color-default))}.react-flow__nodesselection-rect,.react-flow__selection{background:var(--xy-selection-background-color, var(--xy-selection-background-color-default));border:var(--xy-selection-border, var(--xy-selection-border-default))}.react-flow__nodesselection-rect:focus,.react-flow__nodesselection-rect:focus-visible,.react-flow__selection:focus,.react-flow__selection:focus-visible{outline:none}.react-flow__controls-button:hover{background:var( --xy-controls-button-background-color-hover-props, var(--xy-controls-button-background-color-hover, var(--xy-controls-button-background-color-hover-default)) );color:var( --xy-controls-button-color-hover-props, var(--xy-controls-button-color-hover, var(--xy-controls-button-color-hover-default)) )}.react-flow__controls-button:disabled{pointer-events:none}.react-flow__controls-button:disabled svg{fill-opacity:.4}.react-flow__controls-button:last-child{border-bottom:none}.react-flow__controls.horizontal .react-flow__controls-button{border-bottom:none;border-right:1px solid var( --xy-controls-button-border-color-props, var(--xy-controls-button-border-color, var(--xy-controls-button-border-color-default)) )}.react-flow__controls.horizontal .react-flow__controls-button:last-child{border-right:none}.react-flow__resize-control{position:absolute}.react-flow__resize-control.left,.react-flow__resize-control.right{cursor:ew-resize}.react-flow__resize-control.top,.react-flow__resize-control.bottom{cursor:ns-resize}.react-flow__resize-control.top.left,.react-flow__resize-control.bottom.right{cursor:nwse-resize}.react-flow__resize-control.bottom.left,.react-flow__resize-control.top.right{cursor:nesw-resize}.react-flow__resize-control.handle{width:5px;height:5px;border:1px solid #fff;border-radius:1px;background-color:var(--xy-resize-background-color, var(--xy-resize-background-color-default));translate:-50% -50%}.react-flow__resize-control.handle.left{left:0;top:50%}.react-flow__resize-control.handle.right{left:100%;top:50%}.react-flow__resize-control.handle.top{left:50%;top:0}.react-flow__resize-control.handle.bottom{left:50%;top:100%}.react-flow__resize-control.handle.top.left,.react-flow__resize-control.handle.bottom.left{left:0}.react-flow__resize-control.handle.top.right,.react-flow__resize-control.handle.bottom.right{left:100%}.react-flow__resize-control.line{border-color:var(--xy-resize-background-color, var(--xy-resize-background-color-default));border-width:0;border-style:solid}.react-flow__resize-control.line.left,.react-flow__resize-control.line.right{width:1px;transform:translate(-50%);top:0;height:100%}.react-flow__resize-control.line.left{left:0;border-left-width:1px}.react-flow__resize-control.line.right{left:100%;border-right-width:1px}.react-flow__resize-control.line.top,.react-flow__resize-control.line.bottom{height:1px;transform:translateY(-50%);left:0;width:100%}.react-flow__resize-control.line.top{top:0;border-top-width:1px}.react-flow__resize-control.line.bottom{border-bottom-width:1px;top:100%}.react-flow__edge-textbg{fill:var(--xy-edge-label-background-color, var(--xy-edge-label-background-color-default))}.react-flow__edge-text{fill:var(--xy-edge-label-color, var(--xy-edge-label-color-default))}";
var Q = Si();
const my = /* @__PURE__ */ Mh(Q);
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
var yy = { value: () => {
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
function vy(t, r) {
  return t.trim().split(/^|\s+/).map(function(i) {
    var l = "", a = i.indexOf(".");
    if (a >= 0 && (l = i.slice(a + 1), i = i.slice(0, a)), i && !r.hasOwnProperty(i)) throw new Error("unknown type: " + i);
    return { type: i, name: l };
  });
}
nl.prototype = wl.prototype = {
  constructor: nl,
  on: function(t, r) {
    var i = this._, l = vy(t + "", i), a, c = -1, f = l.length;
    if (arguments.length < 2) {
      for (; ++c < f; ) if ((a = (t = l[c]).type) && (a = wy(i[a], t.name))) return a;
      return;
    }
    if (r != null && typeof r != "function") throw new Error("invalid callback: " + r);
    for (; ++c < f; )
      if (a = (t = l[c]).type) i[a] = cp(i[a], t.name, r);
      else if (r == null) for (a in i) i[a] = cp(i[a], t.name, null);
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
function wy(t, r) {
  for (var i = 0, l = t.length, a; i < l; ++i)
    if ((a = t[i]).name === r)
      return a.value;
}
function cp(t, r, i) {
  for (var l = 0, a = t.length; l < a; ++l)
    if (t[l].name === r) {
      t[l] = yy, t = t.slice(0, l).concat(t.slice(l + 1));
      break;
    }
  return i != null && t.push({ name: r, value: i }), t;
}
var Zu = "http://www.w3.org/1999/xhtml", fp = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: Zu,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function xl(t) {
  var r = t += "", i = r.indexOf(":");
  return i >= 0 && (r = t.slice(0, i)) !== "xmlns" && (t = t.slice(i + 1)), fp.hasOwnProperty(r) ? { space: fp[r], local: t } : t;
}
function xy(t) {
  return function() {
    var r = this.ownerDocument, i = this.namespaceURI;
    return i === Zu && r.documentElement.namespaceURI === Zu ? r.createElement(t) : r.createElementNS(i, t);
  };
}
function _y(t) {
  return function() {
    return this.ownerDocument.createElementNS(t.space, t.local);
  };
}
function Ph(t) {
  var r = xl(t);
  return (r.local ? _y : xy)(r);
}
function Sy() {
}
function uc(t) {
  return t == null ? Sy : function() {
    return this.querySelector(t);
  };
}
function ky(t) {
  typeof t != "function" && (t = uc(t));
  for (var r = this._groups, i = r.length, l = new Array(i), a = 0; a < i; ++a)
    for (var c = r[a], f = c.length, p = l[a] = new Array(f), h, g, m = 0; m < f; ++m)
      (h = c[m]) && (g = t.call(h, h.__data__, m, c)) && ("__data__" in h && (g.__data__ = h.__data__), p[m] = g);
  return new Et(l, this._parents);
}
function Ey(t) {
  return t == null ? [] : Array.isArray(t) ? t : Array.from(t);
}
function Cy() {
  return [];
}
function Ih(t) {
  return t == null ? Cy : function() {
    return this.querySelectorAll(t);
  };
}
function Ny(t) {
  return function() {
    return Ey(t.apply(this, arguments));
  };
}
function My(t) {
  typeof t == "function" ? t = Ny(t) : t = Ih(t);
  for (var r = this._groups, i = r.length, l = [], a = [], c = 0; c < i; ++c)
    for (var f = r[c], p = f.length, h, g = 0; g < p; ++g)
      (h = f[g]) && (l.push(t.call(h, h.__data__, g, f)), a.push(h));
  return new Et(l, a);
}
function Th(t) {
  return function() {
    return this.matches(t);
  };
}
function Rh(t) {
  return function(r) {
    return r.matches(t);
  };
}
var zy = Array.prototype.find;
function Py(t) {
  return function() {
    return zy.call(this.children, t);
  };
}
function Iy() {
  return this.firstElementChild;
}
function Ty(t) {
  return this.select(t == null ? Iy : Py(typeof t == "function" ? t : Rh(t)));
}
var Ry = Array.prototype.filter;
function Dy() {
  return Array.from(this.children);
}
function by(t) {
  return function() {
    return Ry.call(this.children, t);
  };
}
function Ly(t) {
  return this.selectAll(t == null ? Dy : by(typeof t == "function" ? t : Rh(t)));
}
function Ay(t) {
  typeof t != "function" && (t = Th(t));
  for (var r = this._groups, i = r.length, l = new Array(i), a = 0; a < i; ++a)
    for (var c = r[a], f = c.length, p = l[a] = [], h, g = 0; g < f; ++g)
      (h = c[g]) && t.call(h, h.__data__, g, c) && p.push(h);
  return new Et(l, this._parents);
}
function Dh(t) {
  return new Array(t.length);
}
function $y() {
  return new Et(this._enter || this._groups.map(Dh), this._parents);
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
function Oy(t) {
  return function() {
    return t;
  };
}
function Hy(t, r, i, l, a, c) {
  for (var f = 0, p, h = r.length, g = c.length; f < g; ++f)
    (p = r[f]) ? (p.__data__ = c[f], l[f] = p) : i[f] = new ll(t, c[f]);
  for (; f < h; ++f)
    (p = r[f]) && (a[f] = p);
}
function jy(t, r, i, l, a, c, f) {
  var p, h, g = /* @__PURE__ */ new Map(), m = r.length, v = c.length, y = new Array(m), x;
  for (p = 0; p < m; ++p)
    (h = r[p]) && (y[p] = x = f.call(h, h.__data__, p, r) + "", g.has(x) ? a[p] = h : g.set(x, h));
  for (p = 0; p < v; ++p)
    x = f.call(t, c[p], p, c) + "", (h = g.get(x)) ? (l[p] = h, h.__data__ = c[p], g.delete(x)) : i[p] = new ll(t, c[p]);
  for (p = 0; p < m; ++p)
    (h = r[p]) && g.get(y[p]) === h && (a[p] = h);
}
function Fy(t) {
  return t.__data__;
}
function Vy(t, r) {
  if (!arguments.length) return Array.from(this, Fy);
  var i = r ? jy : Hy, l = this._parents, a = this._groups;
  typeof t != "function" && (t = Oy(t));
  for (var c = a.length, f = new Array(c), p = new Array(c), h = new Array(c), g = 0; g < c; ++g) {
    var m = l[g], v = a[g], y = v.length, x = By(t.call(m, m && m.__data__, g, l)), _ = x.length, M = p[g] = new Array(_), E = f[g] = new Array(_), C = h[g] = new Array(y);
    i(m, v, M, E, C, x, r);
    for (var L = 0, S = 0, P, V; L < _; ++L)
      if (P = M[L]) {
        for (L >= S && (S = L + 1); !(V = E[S]) && ++S < _; ) ;
        P._next = V || null;
      }
  }
  return f = new Et(f, l), f._enter = p, f._exit = h, f;
}
function By(t) {
  return typeof t == "object" && "length" in t ? t : Array.from(t);
}
function Uy() {
  return new Et(this._exit || this._groups.map(Dh), this._parents);
}
function Wy(t, r, i) {
  var l = this.enter(), a = this, c = this.exit();
  return typeof t == "function" ? (l = t(l), l && (l = l.selection())) : l = l.append(t + ""), r != null && (a = r(a), a && (a = a.selection())), i == null ? c.remove() : i(c), l && a ? l.merge(a).order() : a;
}
function Xy(t) {
  for (var r = t.selection ? t.selection() : t, i = this._groups, l = r._groups, a = i.length, c = l.length, f = Math.min(a, c), p = new Array(a), h = 0; h < f; ++h)
    for (var g = i[h], m = l[h], v = g.length, y = p[h] = new Array(v), x, _ = 0; _ < v; ++_)
      (x = g[_] || m[_]) && (y[_] = x);
  for (; h < a; ++h)
    p[h] = i[h];
  return new Et(p, this._parents);
}
function Yy() {
  for (var t = this._groups, r = -1, i = t.length; ++r < i; )
    for (var l = t[r], a = l.length - 1, c = l[a], f; --a >= 0; )
      (f = l[a]) && (c && f.compareDocumentPosition(c) ^ 4 && c.parentNode.insertBefore(f, c), c = f);
  return this;
}
function Zy(t) {
  t || (t = Qy);
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
function Qy(t, r) {
  return t < r ? -1 : t > r ? 1 : t >= r ? 0 : NaN;
}
function Ky() {
  var t = arguments[0];
  return arguments[0] = this, t.apply(null, arguments), this;
}
function Gy() {
  return Array.from(this);
}
function qy() {
  for (var t = this._groups, r = 0, i = t.length; r < i; ++r)
    for (var l = t[r], a = 0, c = l.length; a < c; ++a) {
      var f = l[a];
      if (f) return f;
    }
  return null;
}
function Jy() {
  let t = 0;
  for (const r of this) ++t;
  return t;
}
function ev() {
  return !this.node();
}
function tv(t) {
  for (var r = this._groups, i = 0, l = r.length; i < l; ++i)
    for (var a = r[i], c = 0, f = a.length, p; c < f; ++c)
      (p = a[c]) && t.call(p, p.__data__, c, a);
  return this;
}
function nv(t) {
  return function() {
    this.removeAttribute(t);
  };
}
function rv(t) {
  return function() {
    this.removeAttributeNS(t.space, t.local);
  };
}
function ov(t, r) {
  return function() {
    this.setAttribute(t, r);
  };
}
function iv(t, r) {
  return function() {
    this.setAttributeNS(t.space, t.local, r);
  };
}
function sv(t, r) {
  return function() {
    var i = r.apply(this, arguments);
    i == null ? this.removeAttribute(t) : this.setAttribute(t, i);
  };
}
function lv(t, r) {
  return function() {
    var i = r.apply(this, arguments);
    i == null ? this.removeAttributeNS(t.space, t.local) : this.setAttributeNS(t.space, t.local, i);
  };
}
function av(t, r) {
  var i = xl(t);
  if (arguments.length < 2) {
    var l = this.node();
    return i.local ? l.getAttributeNS(i.space, i.local) : l.getAttribute(i);
  }
  return this.each((r == null ? i.local ? rv : nv : typeof r == "function" ? i.local ? lv : sv : i.local ? iv : ov)(i, r));
}
function bh(t) {
  return t.ownerDocument && t.ownerDocument.defaultView || t.document && t || t.defaultView;
}
function uv(t) {
  return function() {
    this.style.removeProperty(t);
  };
}
function cv(t, r, i) {
  return function() {
    this.style.setProperty(t, r, i);
  };
}
function fv(t, r, i) {
  return function() {
    var l = r.apply(this, arguments);
    l == null ? this.style.removeProperty(t) : this.style.setProperty(t, l, i);
  };
}
function dv(t, r, i) {
  return arguments.length > 1 ? this.each((r == null ? uv : typeof r == "function" ? fv : cv)(t, r, i ?? "")) : lo(this.node(), t);
}
function lo(t, r) {
  return t.style.getPropertyValue(r) || bh(t).getComputedStyle(t, null).getPropertyValue(r);
}
function pv(t) {
  return function() {
    delete this[t];
  };
}
function hv(t, r) {
  return function() {
    this[t] = r;
  };
}
function gv(t, r) {
  return function() {
    var i = r.apply(this, arguments);
    i == null ? delete this[t] : this[t] = i;
  };
}
function mv(t, r) {
  return arguments.length > 1 ? this.each((r == null ? pv : typeof r == "function" ? gv : hv)(t, r)) : this.node()[t];
}
function Lh(t) {
  return t.trim().split(/^|\s+/);
}
function cc(t) {
  return t.classList || new Ah(t);
}
function Ah(t) {
  this._node = t, this._names = Lh(t.getAttribute("class") || "");
}
Ah.prototype = {
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
function $h(t, r) {
  for (var i = cc(t), l = -1, a = r.length; ++l < a; ) i.add(r[l]);
}
function Oh(t, r) {
  for (var i = cc(t), l = -1, a = r.length; ++l < a; ) i.remove(r[l]);
}
function yv(t) {
  return function() {
    $h(this, t);
  };
}
function vv(t) {
  return function() {
    Oh(this, t);
  };
}
function wv(t, r) {
  return function() {
    (r.apply(this, arguments) ? $h : Oh)(this, t);
  };
}
function xv(t, r) {
  var i = Lh(t + "");
  if (arguments.length < 2) {
    for (var l = cc(this.node()), a = -1, c = i.length; ++a < c; ) if (!l.contains(i[a])) return !1;
    return !0;
  }
  return this.each((typeof r == "function" ? wv : r ? yv : vv)(i, r));
}
function _v() {
  this.textContent = "";
}
function Sv(t) {
  return function() {
    this.textContent = t;
  };
}
function kv(t) {
  return function() {
    var r = t.apply(this, arguments);
    this.textContent = r ?? "";
  };
}
function Ev(t) {
  return arguments.length ? this.each(t == null ? _v : (typeof t == "function" ? kv : Sv)(t)) : this.node().textContent;
}
function Cv() {
  this.innerHTML = "";
}
function Nv(t) {
  return function() {
    this.innerHTML = t;
  };
}
function Mv(t) {
  return function() {
    var r = t.apply(this, arguments);
    this.innerHTML = r ?? "";
  };
}
function zv(t) {
  return arguments.length ? this.each(t == null ? Cv : (typeof t == "function" ? Mv : Nv)(t)) : this.node().innerHTML;
}
function Pv() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function Iv() {
  return this.each(Pv);
}
function Tv() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function Rv() {
  return this.each(Tv);
}
function Dv(t) {
  var r = typeof t == "function" ? t : Ph(t);
  return this.select(function() {
    return this.appendChild(r.apply(this, arguments));
  });
}
function bv() {
  return null;
}
function Lv(t, r) {
  var i = typeof t == "function" ? t : Ph(t), l = r == null ? bv : typeof r == "function" ? r : uc(r);
  return this.select(function() {
    return this.insertBefore(i.apply(this, arguments), l.apply(this, arguments) || null);
  });
}
function Av() {
  var t = this.parentNode;
  t && t.removeChild(this);
}
function $v() {
  return this.each(Av);
}
function Ov() {
  var t = this.cloneNode(!1), r = this.parentNode;
  return r ? r.insertBefore(t, this.nextSibling) : t;
}
function Hv() {
  var t = this.cloneNode(!0), r = this.parentNode;
  return r ? r.insertBefore(t, this.nextSibling) : t;
}
function jv(t) {
  return this.select(t ? Hv : Ov);
}
function Fv(t) {
  return arguments.length ? this.property("__data__", t) : this.node().__data__;
}
function Vv(t) {
  return function(r) {
    t.call(this, r, this.__data__);
  };
}
function Bv(t) {
  return t.trim().split(/^|\s+/).map(function(r) {
    var i = "", l = r.indexOf(".");
    return l >= 0 && (i = r.slice(l + 1), r = r.slice(0, l)), { type: r, name: i };
  });
}
function Uv(t) {
  return function() {
    var r = this.__on;
    if (r) {
      for (var i = 0, l = -1, a = r.length, c; i < a; ++i)
        c = r[i], (!t.type || c.type === t.type) && c.name === t.name ? this.removeEventListener(c.type, c.listener, c.options) : r[++l] = c;
      ++l ? r.length = l : delete this.__on;
    }
  };
}
function Wv(t, r, i) {
  return function() {
    var l = this.__on, a, c = Vv(r);
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
function Xv(t, r, i) {
  var l = Bv(t + ""), a, c = l.length, f;
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
  for (p = r ? Wv : Uv, a = 0; a < c; ++a) this.each(p(l[a], r, i));
  return this;
}
function Hh(t, r, i) {
  var l = bh(t), a = l.CustomEvent;
  typeof a == "function" ? a = new a(r, i) : (a = l.document.createEvent("Event"), i ? (a.initEvent(r, i.bubbles, i.cancelable), a.detail = i.detail) : a.initEvent(r, !1, !1)), t.dispatchEvent(a);
}
function Yv(t, r) {
  return function() {
    return Hh(this, t, r);
  };
}
function Zv(t, r) {
  return function() {
    return Hh(this, t, r.apply(this, arguments));
  };
}
function Qv(t, r) {
  return this.each((typeof r == "function" ? Zv : Yv)(t, r));
}
function* Kv() {
  for (var t = this._groups, r = 0, i = t.length; r < i; ++r)
    for (var l = t[r], a = 0, c = l.length, f; a < c; ++a)
      (f = l[a]) && (yield f);
}
var jh = [null];
function Et(t, r) {
  this._groups = t, this._parents = r;
}
function ki() {
  return new Et([[document.documentElement]], jh);
}
function Gv() {
  return this;
}
Et.prototype = ki.prototype = {
  constructor: Et,
  select: ky,
  selectAll: My,
  selectChild: Ty,
  selectChildren: Ly,
  filter: Ay,
  data: Vy,
  enter: $y,
  exit: Uy,
  join: Wy,
  merge: Xy,
  selection: Gv,
  order: Yy,
  sort: Zy,
  call: Ky,
  nodes: Gy,
  node: qy,
  size: Jy,
  empty: ev,
  each: tv,
  attr: av,
  style: dv,
  property: mv,
  classed: xv,
  text: Ev,
  html: zv,
  raise: Iv,
  lower: Rv,
  append: Dv,
  insert: Lv,
  remove: $v,
  clone: jv,
  datum: Fv,
  on: Xv,
  dispatch: Qv,
  [Symbol.iterator]: Kv
};
function kt(t) {
  return typeof t == "string" ? new Et([[document.querySelector(t)]], [document.documentElement]) : new Et([[t]], jh);
}
var qv = 0;
function dp() {
  this._ = "@" + (++qv).toString(36);
}
dp.prototype = {
  constructor: dp,
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
function Jv(t) {
  let r;
  for (; r = t.sourceEvent; ) t = r;
  return t;
}
function jt(t, r) {
  if (t = Jv(t), r === void 0 && (r = t.currentTarget), r) {
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
const ew = { passive: !1 }, pi = { capture: !0, passive: !1 };
function Tu(t) {
  t.stopImmediatePropagation();
}
function ro(t) {
  t.preventDefault(), t.stopImmediatePropagation();
}
function Fh(t) {
  var r = t.document.documentElement, i = kt(t).on("dragstart.drag", ro, pi);
  "onselectstart" in r ? i.on("selectstart.drag", ro, pi) : (r.__noselect = r.style.MozUserSelect, r.style.MozUserSelect = "none");
}
function Vh(t, r) {
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
function tw(t) {
  return !t.ctrlKey && !t.button;
}
function nw() {
  return this.parentNode;
}
function rw(t, r) {
  return r ?? { x: t.x, y: t.y };
}
function ow() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function Bh() {
  var t = tw, r = nw, i = rw, l = ow, a = {}, c = wl("start", "drag", "end"), f = 0, p, h, g, m, v = 0;
  function y(P) {
    P.on("mousedown.drag", x).filter(l).on("touchstart.drag", E).on("touchmove.drag", C, ew).on("touchend.drag touchcancel.drag", L).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function x(P, V) {
    if (!(m || !t.call(this, P, V))) {
      var D = S(this, r.call(this, P, V), P, V, "mouse");
      D && (kt(P.view).on("mousemove.drag", _, pi).on("mouseup.drag", M, pi), Fh(P.view), Tu(P), g = !1, p = P.clientX, h = P.clientY, D("start", P));
    }
  }
  function _(P) {
    if (ro(P), !g) {
      var V = P.clientX - p, D = P.clientY - h;
      g = V * V + D * D > v;
    }
    a.mouse("drag", P);
  }
  function M(P) {
    kt(P.view).on("mousemove.drag mouseup.drag", null), Vh(P.view, g), ro(P), a.mouse("end", P);
  }
  function E(P, V) {
    if (t.call(this, P, V)) {
      var D = P.changedTouches, j = r.call(this, P, V), Y = D.length, I, K;
      for (I = 0; I < Y; ++I)
        (K = S(this, j, P, V, D[I].identifier, D[I])) && (Tu(P), K("start", P, D[I]));
    }
  }
  function C(P) {
    var V = P.changedTouches, D = V.length, j, Y;
    for (j = 0; j < D; ++j)
      (Y = a[V[j].identifier]) && (ro(P), Y("drag", P, V[j]));
  }
  function L(P) {
    var V = P.changedTouches, D = V.length, j, Y;
    for (m && clearTimeout(m), m = setTimeout(function() {
      m = null;
    }, 500), j = 0; j < D; ++j)
      (Y = a[V[j].identifier]) && (Tu(P), Y("end", P, V[j]));
  }
  function S(P, V, D, j, Y, I) {
    var K = c.copy(), Z = jt(I || D, V), ee, J, N;
    if ((N = i.call(P, new Qu("beforestart", {
      sourceEvent: D,
      target: y,
      identifier: Y,
      active: f,
      x: Z[0],
      y: Z[1],
      dx: 0,
      dy: 0,
      dispatch: K
    }), j)) != null)
      return ee = N.x - Z[0] || 0, J = N.y - Z[1] || 0, function A(O, B, R) {
        var H = Z, U;
        switch (O) {
          case "start":
            a[Y] = A, U = f++;
            break;
          case "end":
            delete a[Y], --f;
          // falls through
          case "drag":
            Z = jt(R || B, V), U = f;
            break;
        }
        K.call(
          O,
          P,
          new Qu(O, {
            sourceEvent: B,
            subject: N,
            target: y,
            identifier: Y,
            active: U,
            x: Z[0] + ee,
            y: Z[1] + J,
            dx: Z[0] - H[0],
            dy: Z[1] - H[1],
            dispatch: K
          }),
          j
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
function Xn() {
}
var vr = 0.7, ao = 1 / vr, oo = "\\s*([+-]?\\d+)\\s*", hi = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", tn = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", iw = /^#([0-9a-f]{3,8})$/, sw = new RegExp(`^rgb\\(${oo},${oo},${oo}\\)$`), lw = new RegExp(`^rgb\\(${tn},${tn},${tn}\\)$`), aw = new RegExp(`^rgba\\(${oo},${oo},${oo},${hi}\\)$`), uw = new RegExp(`^rgba\\(${tn},${tn},${tn},${hi}\\)$`), cw = new RegExp(`^hsl\\(${hi},${tn},${tn}\\)$`), fw = new RegExp(`^hsla\\(${hi},${tn},${tn},${hi}\\)$`), pp = {
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
mo(Xn, wr, {
  copy(t) {
    return Object.assign(new this.constructor(), this, t);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: hp,
  // Deprecated! Use color.formatHex.
  formatHex: hp,
  formatHex8: dw,
  formatHsl: pw,
  formatRgb: gp,
  toString: gp
});
function hp() {
  return this.rgb().formatHex();
}
function dw() {
  return this.rgb().formatHex8();
}
function pw() {
  return Uh(this).formatHsl();
}
function gp() {
  return this.rgb().formatRgb();
}
function wr(t) {
  var r, i;
  return t = (t + "").trim().toLowerCase(), (r = iw.exec(t)) ? (i = r[1].length, r = parseInt(r[1], 16), i === 6 ? mp(r) : i === 3 ? new Ge(r >> 8 & 15 | r >> 4 & 240, r >> 4 & 15 | r & 240, (r & 15) << 4 | r & 15, 1) : i === 8 ? Zs(r >> 24 & 255, r >> 16 & 255, r >> 8 & 255, (r & 255) / 255) : i === 4 ? Zs(r >> 12 & 15 | r >> 8 & 240, r >> 8 & 15 | r >> 4 & 240, r >> 4 & 15 | r & 240, ((r & 15) << 4 | r & 15) / 255) : null) : (r = sw.exec(t)) ? new Ge(r[1], r[2], r[3], 1) : (r = lw.exec(t)) ? new Ge(r[1] * 255 / 100, r[2] * 255 / 100, r[3] * 255 / 100, 1) : (r = aw.exec(t)) ? Zs(r[1], r[2], r[3], r[4]) : (r = uw.exec(t)) ? Zs(r[1] * 255 / 100, r[2] * 255 / 100, r[3] * 255 / 100, r[4]) : (r = cw.exec(t)) ? wp(r[1], r[2] / 100, r[3] / 100, 1) : (r = fw.exec(t)) ? wp(r[1], r[2] / 100, r[3] / 100, r[4]) : pp.hasOwnProperty(t) ? mp(pp[t]) : t === "transparent" ? new Ge(NaN, NaN, NaN, 0) : null;
}
function mp(t) {
  return new Ge(t >> 16 & 255, t >> 8 & 255, t & 255, 1);
}
function Zs(t, r, i, l) {
  return l <= 0 && (t = r = i = NaN), new Ge(t, r, i, l);
}
function fc(t) {
  return t instanceof Xn || (t = wr(t)), t ? (t = t.rgb(), new Ge(t.r, t.g, t.b, t.opacity)) : new Ge();
}
function Ku(t, r, i, l) {
  return arguments.length === 1 ? fc(t) : new Ge(t, r, i, l ?? 1);
}
function Ge(t, r, i, l) {
  this.r = +t, this.g = +r, this.b = +i, this.opacity = +l;
}
mo(Ge, Ku, Ei(Xn, {
  brighter(t) {
    return t = t == null ? ao : Math.pow(ao, t), new Ge(this.r * t, this.g * t, this.b * t, this.opacity);
  },
  darker(t) {
    return t = t == null ? vr : Math.pow(vr, t), new Ge(this.r * t, this.g * t, this.b * t, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Ge(gr(this.r), gr(this.g), gr(this.b), al(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: yp,
  // Deprecated! Use color.formatHex.
  formatHex: yp,
  formatHex8: hw,
  formatRgb: vp,
  toString: vp
}));
function yp() {
  return `#${hr(this.r)}${hr(this.g)}${hr(this.b)}`;
}
function hw() {
  return `#${hr(this.r)}${hr(this.g)}${hr(this.b)}${hr((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function vp() {
  const t = al(this.opacity);
  return `${t === 1 ? "rgb(" : "rgba("}${gr(this.r)}, ${gr(this.g)}, ${gr(this.b)}${t === 1 ? ")" : `, ${t})`}`;
}
function al(t) {
  return isNaN(t) ? 1 : Math.max(0, Math.min(1, t));
}
function gr(t) {
  return Math.max(0, Math.min(255, Math.round(t) || 0));
}
function hr(t) {
  return t = gr(t), (t < 16 ? "0" : "") + t.toString(16);
}
function wp(t, r, i, l) {
  return l <= 0 ? t = r = i = NaN : i <= 0 || i >= 1 ? t = r = NaN : r <= 0 && (t = NaN), new Ft(t, r, i, l);
}
function Uh(t) {
  if (t instanceof Ft) return new Ft(t.h, t.s, t.l, t.opacity);
  if (t instanceof Xn || (t = wr(t)), !t) return new Ft();
  if (t instanceof Ft) return t;
  t = t.rgb();
  var r = t.r / 255, i = t.g / 255, l = t.b / 255, a = Math.min(r, i, l), c = Math.max(r, i, l), f = NaN, p = c - a, h = (c + a) / 2;
  return p ? (r === c ? f = (i - l) / p + (i < l) * 6 : i === c ? f = (l - r) / p + 2 : f = (r - i) / p + 4, p /= h < 0.5 ? c + a : 2 - c - a, f *= 60) : p = h > 0 && h < 1 ? 0 : f, new Ft(f, p, h, t.opacity);
}
function gw(t, r, i, l) {
  return arguments.length === 1 ? Uh(t) : new Ft(t, r, i, l ?? 1);
}
function Ft(t, r, i, l) {
  this.h = +t, this.s = +r, this.l = +i, this.opacity = +l;
}
mo(Ft, gw, Ei(Xn, {
  brighter(t) {
    return t = t == null ? ao : Math.pow(ao, t), new Ft(this.h, this.s, this.l * t, this.opacity);
  },
  darker(t) {
    return t = t == null ? vr : Math.pow(vr, t), new Ft(this.h, this.s, this.l * t, this.opacity);
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
    return new Ft(xp(this.h), Qs(this.s), Qs(this.l), al(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const t = al(this.opacity);
    return `${t === 1 ? "hsl(" : "hsla("}${xp(this.h)}, ${Qs(this.s) * 100}%, ${Qs(this.l) * 100}%${t === 1 ? ")" : `, ${t})`}`;
  }
}));
function xp(t) {
  return t = (t || 0) % 360, t < 0 ? t + 360 : t;
}
function Qs(t) {
  return Math.max(0, Math.min(1, t || 0));
}
function Ru(t, r, i) {
  return (t < 60 ? r + (i - r) * t / 60 : t < 180 ? i : t < 240 ? r + (i - r) * (240 - t) / 60 : r) * 255;
}
const Wh = Math.PI / 180, Xh = 180 / Math.PI, ul = 18, Yh = 0.96422, Zh = 1, Qh = 0.82521, Kh = 4 / 29, io = 6 / 29, Gh = 3 * io * io, mw = io * io * io;
function qh(t) {
  if (t instanceof nn) return new nn(t.l, t.a, t.b, t.opacity);
  if (t instanceof yn) return Jh(t);
  t instanceof Ge || (t = fc(t));
  var r = Au(t.r), i = Au(t.g), l = Au(t.b), a = Du((0.2225045 * r + 0.7168786 * i + 0.0606169 * l) / Zh), c, f;
  return r === i && i === l ? c = f = a : (c = Du((0.4360747 * r + 0.3850649 * i + 0.1430804 * l) / Yh), f = Du((0.0139322 * r + 0.0971045 * i + 0.7141733 * l) / Qh)), new nn(116 * a - 16, 500 * (c - a), 200 * (a - f), t.opacity);
}
function yw(t, r, i, l) {
  return arguments.length === 1 ? qh(t) : new nn(t, r, i, l ?? 1);
}
function nn(t, r, i, l) {
  this.l = +t, this.a = +r, this.b = +i, this.opacity = +l;
}
mo(nn, yw, Ei(Xn, {
  brighter(t) {
    return new nn(this.l + ul * (t ?? 1), this.a, this.b, this.opacity);
  },
  darker(t) {
    return new nn(this.l - ul * (t ?? 1), this.a, this.b, this.opacity);
  },
  rgb() {
    var t = (this.l + 16) / 116, r = isNaN(this.a) ? t : t + this.a / 500, i = isNaN(this.b) ? t : t - this.b / 200;
    return r = Yh * bu(r), t = Zh * bu(t), i = Qh * bu(i), new Ge(
      Lu(3.1338561 * r - 1.6168667 * t - 0.4906146 * i),
      Lu(-0.9787684 * r + 1.9161415 * t + 0.033454 * i),
      Lu(0.0719453 * r - 0.2289914 * t + 1.4052427 * i),
      this.opacity
    );
  }
}));
function Du(t) {
  return t > mw ? Math.pow(t, 1 / 3) : t / Gh + Kh;
}
function bu(t) {
  return t > io ? t * t * t : Gh * (t - Kh);
}
function Lu(t) {
  return 255 * (t <= 31308e-7 ? 12.92 * t : 1.055 * Math.pow(t, 1 / 2.4) - 0.055);
}
function Au(t) {
  return (t /= 255) <= 0.04045 ? t / 12.92 : Math.pow((t + 0.055) / 1.055, 2.4);
}
function vw(t) {
  if (t instanceof yn) return new yn(t.h, t.c, t.l, t.opacity);
  if (t instanceof nn || (t = qh(t)), t.a === 0 && t.b === 0) return new yn(NaN, 0 < t.l && t.l < 100 ? 0 : NaN, t.l, t.opacity);
  var r = Math.atan2(t.b, t.a) * Xh;
  return new yn(r < 0 ? r + 360 : r, Math.sqrt(t.a * t.a + t.b * t.b), t.l, t.opacity);
}
function ww(t, r, i, l) {
  return arguments.length === 1 ? vw(t) : new yn(t, r, i, l ?? 1);
}
function yn(t, r, i, l) {
  this.h = +t, this.c = +r, this.l = +i, this.opacity = +l;
}
function Jh(t) {
  if (isNaN(t.h)) return new nn(t.l, 0, 0, t.opacity);
  var r = t.h * Wh;
  return new nn(t.l, Math.cos(r) * t.c, Math.sin(r) * t.c, t.opacity);
}
mo(yn, ww, Ei(Xn, {
  brighter(t) {
    return new yn(this.h, this.c, this.l + ul * (t ?? 1), this.opacity);
  },
  darker(t) {
    return new yn(this.h, this.c, this.l - ul * (t ?? 1), this.opacity);
  },
  rgb() {
    return Jh(this).rgb();
  }
}));
var eg = -0.14861, dc = 1.78277, pc = -0.29227, _l = -0.90649, gi = 1.97294, _p = gi * _l, Sp = gi * dc, kp = dc * pc - _l * eg;
function xw(t) {
  if (t instanceof mr) return new mr(t.h, t.s, t.l, t.opacity);
  t instanceof Ge || (t = fc(t));
  var r = t.r / 255, i = t.g / 255, l = t.b / 255, a = (kp * l + _p * r - Sp * i) / (kp + _p - Sp), c = l - a, f = (gi * (i - a) - pc * c) / _l, p = Math.sqrt(f * f + c * c) / (gi * a * (1 - a)), h = p ? Math.atan2(f, c) * Xh - 120 : NaN;
  return new mr(h < 0 ? h + 360 : h, p, a, t.opacity);
}
function Gu(t, r, i, l) {
  return arguments.length === 1 ? xw(t) : new mr(t, r, i, l ?? 1);
}
function mr(t, r, i, l) {
  this.h = +t, this.s = +r, this.l = +i, this.opacity = +l;
}
mo(mr, Gu, Ei(Xn, {
  brighter(t) {
    return t = t == null ? ao : Math.pow(ao, t), new mr(this.h, this.s, this.l * t, this.opacity);
  },
  darker(t) {
    return t = t == null ? vr : Math.pow(vr, t), new mr(this.h, this.s, this.l * t, this.opacity);
  },
  rgb() {
    var t = isNaN(this.h) ? 0 : (this.h + 120) * Wh, r = +this.l, i = isNaN(this.s) ? 0 : this.s * r * (1 - r), l = Math.cos(t), a = Math.sin(t);
    return new Ge(
      255 * (r + i * (eg * l + dc * a)),
      255 * (r + i * (pc * l + _l * a)),
      255 * (r + i * (gi * l)),
      this.opacity
    );
  }
}));
var Sl = (t) => () => t;
function tg(t, r) {
  return function(i) {
    return t + i * r;
  };
}
function _w(t, r, i) {
  return t = Math.pow(t, i), r = Math.pow(r, i) - t, i = 1 / i, function(l) {
    return Math.pow(t + l * r, i);
  };
}
function Sw(t, r) {
  var i = r - t;
  return i ? tg(t, i > 180 || i < -180 ? i - 360 * Math.round(i / 360) : i) : Sl(isNaN(t) ? r : t);
}
function kw(t) {
  return (t = +t) == 1 ? so : function(r, i) {
    return i - r ? _w(r, i, t) : Sl(isNaN(r) ? i : r);
  };
}
function so(t, r) {
  var i = r - t;
  return i ? tg(t, i) : Sl(isNaN(t) ? r : t);
}
var cl = (function t(r) {
  var i = kw(r);
  function l(a, c) {
    var f = i((a = Ku(a)).r, (c = Ku(c)).r), p = i(a.g, c.g), h = i(a.b, c.b), g = so(a.opacity, c.opacity);
    return function(m) {
      return a.r = f(m), a.g = p(m), a.b = h(m), a.opacity = g(m), a + "";
    };
  }
  return l.gamma = t, l;
})(1);
function Ew(t, r) {
  r || (r = []);
  var i = t ? Math.min(r.length, t.length) : 0, l = r.slice(), a;
  return function(c) {
    for (a = 0; a < i; ++a) l[a] = t[a] * (1 - c) + r[a] * c;
    return l;
  };
}
function Cw(t) {
  return ArrayBuffer.isView(t) && !(t instanceof DataView);
}
function Nw(t, r) {
  var i = r ? r.length : 0, l = t ? Math.min(i, t.length) : 0, a = new Array(l), c = new Array(i), f;
  for (f = 0; f < l; ++f) a[f] = fi(t[f], r[f]);
  for (; f < i; ++f) c[f] = r[f];
  return function(p) {
    for (f = 0; f < l; ++f) c[f] = a[f](p);
    return c;
  };
}
function Mw(t, r) {
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
function zw(t, r) {
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
function Pw(t) {
  return function() {
    return t;
  };
}
function Iw(t) {
  return function(r) {
    return t(r) + "";
  };
}
function ng(t, r) {
  var i = qu.lastIndex = $u.lastIndex = 0, l, a, c, f = -1, p = [], h = [];
  for (t = t + "", r = r + ""; (l = qu.exec(t)) && (a = $u.exec(r)); )
    (c = a.index) > i && (c = r.slice(i, c), p[f] ? p[f] += c : p[++f] = c), (l = l[0]) === (a = a[0]) ? p[f] ? p[f] += a : p[++f] = a : (p[++f] = null, h.push({ i: f, x: en(l, a) })), i = $u.lastIndex;
  return i < r.length && (c = r.slice(i), p[f] ? p[f] += c : p[++f] = c), p.length < 2 ? h[0] ? Iw(h[0].x) : Pw(r) : (r = h.length, function(g) {
    for (var m = 0, v; m < r; ++m) p[(v = h[m]).i] = v.x(g);
    return p.join("");
  });
}
function fi(t, r) {
  var i = typeof r, l;
  return r == null || i === "boolean" ? Sl(r) : (i === "number" ? en : i === "string" ? (l = wr(r)) ? (r = l, cl) : ng : r instanceof wr ? cl : r instanceof Date ? Mw : Cw(r) ? Ew : Array.isArray(r) ? Nw : typeof r.valueOf != "function" && typeof r.toString != "function" || isNaN(r) ? zw : en)(t, r);
}
var Ep = 180 / Math.PI, Ju = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function rg(t, r, i, l, a, c) {
  var f, p, h;
  return (f = Math.sqrt(t * t + r * r)) && (t /= f, r /= f), (h = t * i + r * l) && (i -= t * h, l -= r * h), (p = Math.sqrt(i * i + l * l)) && (i /= p, l /= p, h /= p), t * l < r * i && (t = -t, r = -r, h = -h, f = -f), {
    translateX: a,
    translateY: c,
    rotate: Math.atan2(r, t) * Ep,
    skewX: Math.atan(h) * Ep,
    scaleX: f,
    scaleY: p
  };
}
var Ks;
function Tw(t) {
  const r = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(t + "");
  return r.isIdentity ? Ju : rg(r.a, r.b, r.c, r.d, r.e, r.f);
}
function Rw(t) {
  return t == null || (Ks || (Ks = document.createElementNS("http://www.w3.org/2000/svg", "g")), Ks.setAttribute("transform", t), !(t = Ks.transform.baseVal.consolidate())) ? Ju : (t = t.matrix, rg(t.a, t.b, t.c, t.d, t.e, t.f));
}
function og(t, r, i, l) {
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
      for (var _ = -1, M = y.length, E; ++_ < M; ) v[(E = y[_]).i] = E.x(x);
      return v.join("");
    };
  };
}
var Dw = og(Tw, "px, ", "px)", "deg)"), bw = og(Rw, ", ", ")", ")"), Lw = 1e-12;
function Cp(t) {
  return ((t = Math.exp(t)) + 1 / t) / 2;
}
function Aw(t) {
  return ((t = Math.exp(t)) - 1 / t) / 2;
}
function $w(t) {
  return ((t = Math.exp(2 * t)) - 1) / (t + 1);
}
var rl = (function t(r, i, l) {
  function a(c, f) {
    var p = c[0], h = c[1], g = c[2], m = f[0], v = f[1], y = f[2], x = m - p, _ = v - h, M = x * x + _ * _, E, C;
    if (M < Lw)
      C = Math.log(y / g) / r, E = function(j) {
        return [
          p + j * x,
          h + j * _,
          g * Math.exp(r * j * C)
        ];
      };
    else {
      var L = Math.sqrt(M), S = (y * y - g * g + l * M) / (2 * g * i * L), P = (y * y - g * g - l * M) / (2 * y * i * L), V = Math.log(Math.sqrt(S * S + 1) - S), D = Math.log(Math.sqrt(P * P + 1) - P);
      C = (D - V) / r, E = function(j) {
        var Y = j * C, I = Cp(V), K = g / (i * L) * (I * $w(r * Y + V) - Aw(V));
        return [
          p + K * x,
          h + K * _,
          g * I / Cp(r * Y + V)
        ];
      };
    }
    return E.duration = Math.abs(C) * 1e3 * r / Math.SQRT2, E;
  }
  return a.rho = function(c) {
    var f = Math.max(1e-3, +c), p = f * f, h = p * p;
    return t(f, p, h);
  }, a;
})(Math.SQRT2, 2, 4);
function ig(t) {
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
ig(Sw);
ig(so);
var uo = 0, ui = 0, li = 0, sg = 1e3, fl, ci, dl = 0, xr = 0, kl = 0, mi = typeof performance == "object" && performance.now ? performance : Date, lg = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(t) {
  setTimeout(t, 17);
};
function hc() {
  return xr || (lg(Ow), xr = mi.now() + kl);
}
function Ow() {
  xr = 0;
}
function pl() {
  this._call = this._time = this._next = null;
}
pl.prototype = ag.prototype = {
  constructor: pl,
  restart: function(t, r, i) {
    if (typeof t != "function") throw new TypeError("callback is not a function");
    i = (i == null ? hc() : +i) + (r == null ? 0 : +r), !this._next && ci !== this && (ci ? ci._next = this : fl = this, ci = this), this._call = t, this._time = i, ec();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, ec());
  }
};
function ag(t, r, i) {
  var l = new pl();
  return l.restart(t, r, i), l;
}
function Hw() {
  hc(), ++uo;
  for (var t = fl, r; t; )
    (r = xr - t._time) >= 0 && t._call.call(void 0, r), t = t._next;
  --uo;
}
function Np() {
  xr = (dl = mi.now()) + kl, uo = ui = 0;
  try {
    Hw();
  } finally {
    uo = 0, Fw(), xr = 0;
  }
}
function jw() {
  var t = mi.now(), r = t - dl;
  r > sg && (kl -= r, dl = t);
}
function Fw() {
  for (var t, r = fl, i, l = 1 / 0; r; )
    r._call ? (l > r._time && (l = r._time), t = r, r = r._next) : (i = r._next, r._next = null, r = t ? t._next = i : fl = i);
  ci = t, ec(l);
}
function ec(t) {
  if (!uo) {
    ui && (ui = clearTimeout(ui));
    var r = t - xr;
    r > 24 ? (t < 1 / 0 && (ui = setTimeout(Np, Math.ceil(t - mi.now() - kl) + 1)), li && (li = clearInterval(li))) : (li || (dl = mi.now(), li = setInterval(jw, sg)), uo = 1, lg(Np));
  }
}
function Mp(t, r, i) {
  var l = new pl();
  return r = r == null ? 0 : +r, l.restart((a) => {
    l.stop(), t(a + r);
  }, r, i), l;
}
function Vw(t) {
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
var Bw = wl("start", "end", "cancel", "interrupt"), Uw = [], ug = 0, zp = 1, tc = 2, ol = 3, Pp = 4, nc = 5, il = 6;
function El(t, r, i, l, a, c) {
  var f = t.__transition;
  if (!f) t.__transition = {};
  else if (i in f) return;
  Ww(t, i, {
    name: r,
    index: l,
    // For context during callback.
    group: a,
    // For context during callback.
    on: Bw,
    tween: Uw,
    time: c.time,
    delay: c.delay,
    duration: c.duration,
    ease: c.ease,
    timer: null,
    state: ug
  });
}
function wc(t, r) {
  var i = Wt(t, r);
  if (i.state > ug) throw new Error("too late; already scheduled");
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
function Ww(t, r, i) {
  var l = t.__transition, a;
  l[r] = i, i.timer = ag(c, 0, i.time);
  function c(g) {
    i.state = zp, i.timer.restart(f, i.delay, i.time), i.delay <= g && f(g - i.delay);
  }
  function f(g) {
    var m, v, y, x;
    if (i.state !== zp) return h();
    for (m in l)
      if (x = l[m], x.name === i.name) {
        if (x.state === ol) return Mp(f);
        x.state === Pp ? (x.state = il, x.timer.stop(), x.on.call("interrupt", t, t.__data__, x.index, x.group), delete l[m]) : +m < r && (x.state = il, x.timer.stop(), x.on.call("cancel", t, t.__data__, x.index, x.group), delete l[m]);
      }
    if (Mp(function() {
      i.state === ol && (i.state = Pp, i.timer.restart(p, i.delay, i.time), p(g));
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
function Xw(t) {
  return this.each(function() {
    sl(this, t);
  });
}
function Yw(t, r) {
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
function Zw(t, r, i) {
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
function Qw(t, r) {
  var i = this._id;
  if (t += "", arguments.length < 2) {
    for (var l = Wt(this.node(), i).tween, a = 0, c = l.length, f; a < c; ++a)
      if ((f = l[a]).name === t)
        return f.value;
    return null;
  }
  return this.each((r == null ? Yw : Zw)(i, t, r));
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
function cg(t, r) {
  var i;
  return (typeof r == "number" ? en : r instanceof wr ? cl : (i = wr(r)) ? (r = i, cl) : ng)(t, r);
}
function Kw(t) {
  return function() {
    this.removeAttribute(t);
  };
}
function Gw(t) {
  return function() {
    this.removeAttributeNS(t.space, t.local);
  };
}
function qw(t, r, i) {
  var l, a = i + "", c;
  return function() {
    var f = this.getAttribute(t);
    return f === a ? null : f === l ? c : c = r(l = f, i);
  };
}
function Jw(t, r, i) {
  var l, a = i + "", c;
  return function() {
    var f = this.getAttributeNS(t.space, t.local);
    return f === a ? null : f === l ? c : c = r(l = f, i);
  };
}
function ex(t, r, i) {
  var l, a, c;
  return function() {
    var f, p = i(this), h;
    return p == null ? void this.removeAttribute(t) : (f = this.getAttribute(t), h = p + "", f === h ? null : f === l && h === a ? c : (a = h, c = r(l = f, p)));
  };
}
function tx(t, r, i) {
  var l, a, c;
  return function() {
    var f, p = i(this), h;
    return p == null ? void this.removeAttributeNS(t.space, t.local) : (f = this.getAttributeNS(t.space, t.local), h = p + "", f === h ? null : f === l && h === a ? c : (a = h, c = r(l = f, p)));
  };
}
function nx(t, r) {
  var i = xl(t), l = i === "transform" ? bw : cg;
  return this.attrTween(t, typeof r == "function" ? (i.local ? tx : ex)(i, l, xc(this, "attr." + t, r)) : r == null ? (i.local ? Gw : Kw)(i) : (i.local ? Jw : qw)(i, l, r));
}
function rx(t, r) {
  return function(i) {
    this.setAttribute(t, r.call(this, i));
  };
}
function ox(t, r) {
  return function(i) {
    this.setAttributeNS(t.space, t.local, r.call(this, i));
  };
}
function ix(t, r) {
  var i, l;
  function a() {
    var c = r.apply(this, arguments);
    return c !== l && (i = (l = c) && ox(t, c)), i;
  }
  return a._value = r, a;
}
function sx(t, r) {
  var i, l;
  function a() {
    var c = r.apply(this, arguments);
    return c !== l && (i = (l = c) && rx(t, c)), i;
  }
  return a._value = r, a;
}
function lx(t, r) {
  var i = "attr." + t;
  if (arguments.length < 2) return (i = this.tween(i)) && i._value;
  if (r == null) return this.tween(i, null);
  if (typeof r != "function") throw new Error();
  var l = xl(t);
  return this.tween(i, (l.local ? ix : sx)(l, r));
}
function ax(t, r) {
  return function() {
    wc(this, t).delay = +r.apply(this, arguments);
  };
}
function ux(t, r) {
  return r = +r, function() {
    wc(this, t).delay = r;
  };
}
function cx(t) {
  var r = this._id;
  return arguments.length ? this.each((typeof t == "function" ? ax : ux)(r, t)) : Wt(this.node(), r).delay;
}
function fx(t, r) {
  return function() {
    rn(this, t).duration = +r.apply(this, arguments);
  };
}
function dx(t, r) {
  return r = +r, function() {
    rn(this, t).duration = r;
  };
}
function px(t) {
  var r = this._id;
  return arguments.length ? this.each((typeof t == "function" ? fx : dx)(r, t)) : Wt(this.node(), r).duration;
}
function hx(t, r) {
  if (typeof r != "function") throw new Error();
  return function() {
    rn(this, t).ease = r;
  };
}
function gx(t) {
  var r = this._id;
  return arguments.length ? this.each(hx(r, t)) : Wt(this.node(), r).ease;
}
function mx(t, r) {
  return function() {
    var i = r.apply(this, arguments);
    if (typeof i != "function") throw new Error();
    rn(this, t).ease = i;
  };
}
function yx(t) {
  if (typeof t != "function") throw new Error();
  return this.each(mx(this._id, t));
}
function vx(t) {
  typeof t != "function" && (t = Th(t));
  for (var r = this._groups, i = r.length, l = new Array(i), a = 0; a < i; ++a)
    for (var c = r[a], f = c.length, p = l[a] = [], h, g = 0; g < f; ++g)
      (h = c[g]) && t.call(h, h.__data__, g, c) && p.push(h);
  return new wn(l, this._parents, this._name, this._id);
}
function wx(t) {
  if (t._id !== this._id) throw new Error();
  for (var r = this._groups, i = t._groups, l = r.length, a = i.length, c = Math.min(l, a), f = new Array(l), p = 0; p < c; ++p)
    for (var h = r[p], g = i[p], m = h.length, v = f[p] = new Array(m), y, x = 0; x < m; ++x)
      (y = h[x] || g[x]) && (v[x] = y);
  for (; p < l; ++p)
    f[p] = r[p];
  return new wn(f, this._parents, this._name, this._id);
}
function xx(t) {
  return (t + "").trim().split(/^|\s+/).every(function(r) {
    var i = r.indexOf(".");
    return i >= 0 && (r = r.slice(0, i)), !r || r === "start";
  });
}
function _x(t, r, i) {
  var l, a, c = xx(r) ? wc : rn;
  return function() {
    var f = c(this, t), p = f.on;
    p !== l && (a = (l = p).copy()).on(r, i), f.on = a;
  };
}
function Sx(t, r) {
  var i = this._id;
  return arguments.length < 2 ? Wt(this.node(), i).on.on(t) : this.each(_x(i, t, r));
}
function kx(t) {
  return function() {
    var r = this.parentNode;
    for (var i in this.__transition) if (+i !== t) return;
    r && r.removeChild(this);
  };
}
function Ex() {
  return this.on("end.remove", kx(this._id));
}
function Cx(t) {
  var r = this._name, i = this._id;
  typeof t != "function" && (t = uc(t));
  for (var l = this._groups, a = l.length, c = new Array(a), f = 0; f < a; ++f)
    for (var p = l[f], h = p.length, g = c[f] = new Array(h), m, v, y = 0; y < h; ++y)
      (m = p[y]) && (v = t.call(m, m.__data__, y, p)) && ("__data__" in m && (v.__data__ = m.__data__), g[y] = v, El(g[y], r, i, y, g, Wt(m, i)));
  return new wn(c, this._parents, r, i);
}
function Nx(t) {
  var r = this._name, i = this._id;
  typeof t != "function" && (t = Ih(t));
  for (var l = this._groups, a = l.length, c = [], f = [], p = 0; p < a; ++p)
    for (var h = l[p], g = h.length, m, v = 0; v < g; ++v)
      if (m = h[v]) {
        for (var y = t.call(m, m.__data__, v, h), x, _ = Wt(m, i), M = 0, E = y.length; M < E; ++M)
          (x = y[M]) && El(x, r, i, M, y, _);
        c.push(y), f.push(m);
      }
  return new wn(c, f, r, i);
}
var Mx = ki.prototype.constructor;
function zx() {
  return new Mx(this._groups, this._parents);
}
function Px(t, r) {
  var i, l, a;
  return function() {
    var c = lo(this, t), f = (this.style.removeProperty(t), lo(this, t));
    return c === f ? null : c === i && f === l ? a : a = r(i = c, l = f);
  };
}
function fg(t) {
  return function() {
    this.style.removeProperty(t);
  };
}
function Ix(t, r, i) {
  var l, a = i + "", c;
  return function() {
    var f = lo(this, t);
    return f === a ? null : f === l ? c : c = r(l = f, i);
  };
}
function Tx(t, r, i) {
  var l, a, c;
  return function() {
    var f = lo(this, t), p = i(this), h = p + "";
    return p == null && (h = p = (this.style.removeProperty(t), lo(this, t))), f === h ? null : f === l && h === a ? c : (a = h, c = r(l = f, p));
  };
}
function Rx(t, r) {
  var i, l, a, c = "style." + r, f = "end." + c, p;
  return function() {
    var h = rn(this, t), g = h.on, m = h.value[c] == null ? p || (p = fg(r)) : void 0;
    (g !== i || a !== m) && (l = (i = g).copy()).on(f, a = m), h.on = l;
  };
}
function Dx(t, r, i) {
  var l = (t += "") == "transform" ? Dw : cg;
  return r == null ? this.styleTween(t, Px(t, l)).on("end.style." + t, fg(t)) : typeof r == "function" ? this.styleTween(t, Tx(t, l, xc(this, "style." + t, r))).each(Rx(this._id, t)) : this.styleTween(t, Ix(t, l, r), i).on("end.style." + t, null);
}
function bx(t, r, i) {
  return function(l) {
    this.style.setProperty(t, r.call(this, l), i);
  };
}
function Lx(t, r, i) {
  var l, a;
  function c() {
    var f = r.apply(this, arguments);
    return f !== a && (l = (a = f) && bx(t, f, i)), l;
  }
  return c._value = r, c;
}
function Ax(t, r, i) {
  var l = "style." + (t += "");
  if (arguments.length < 2) return (l = this.tween(l)) && l._value;
  if (r == null) return this.tween(l, null);
  if (typeof r != "function") throw new Error();
  return this.tween(l, Lx(t, r, i ?? ""));
}
function $x(t) {
  return function() {
    this.textContent = t;
  };
}
function Ox(t) {
  return function() {
    var r = t(this);
    this.textContent = r ?? "";
  };
}
function Hx(t) {
  return this.tween("text", typeof t == "function" ? Ox(xc(this, "text", t)) : $x(t == null ? "" : t + ""));
}
function jx(t) {
  return function(r) {
    this.textContent = t.call(this, r);
  };
}
function Fx(t) {
  var r, i;
  function l() {
    var a = t.apply(this, arguments);
    return a !== i && (r = (i = a) && jx(a)), r;
  }
  return l._value = t, l;
}
function Vx(t) {
  var r = "text";
  if (arguments.length < 1) return (r = this.tween(r)) && r._value;
  if (t == null) return this.tween(r, null);
  if (typeof t != "function") throw new Error();
  return this.tween(r, Fx(t));
}
function Bx() {
  for (var t = this._name, r = this._id, i = dg(), l = this._groups, a = l.length, c = 0; c < a; ++c)
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
function Ux() {
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
var Wx = 0;
function wn(t, r, i, l) {
  this._groups = t, this._parents = r, this._name = i, this._id = l;
}
function dg() {
  return ++Wx;
}
var gn = ki.prototype;
wn.prototype = {
  constructor: wn,
  select: Cx,
  selectAll: Nx,
  selectChild: gn.selectChild,
  selectChildren: gn.selectChildren,
  filter: vx,
  merge: wx,
  selection: zx,
  transition: Bx,
  call: gn.call,
  nodes: gn.nodes,
  node: gn.node,
  size: gn.size,
  empty: gn.empty,
  each: gn.each,
  on: Sx,
  attr: nx,
  attrTween: lx,
  style: Dx,
  styleTween: Ax,
  text: Hx,
  textTween: Vx,
  remove: Ex,
  tween: Qw,
  delay: cx,
  duration: px,
  ease: gx,
  easeVarying: yx,
  end: Ux,
  [Symbol.iterator]: gn[Symbol.iterator]
};
var Xx = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: Vw
};
function Yx(t, r) {
  for (var i; !(i = t.__transition) || !(i = i[r]); )
    if (!(t = t.parentNode))
      throw new Error(`transition ${r} not found`);
  return i;
}
function Zx(t) {
  var r, i;
  t instanceof wn ? (r = t._id, t = t._name) : (r = dg(), (i = Xx).time = hc(), t = t == null ? null : t + "");
  for (var l = this._groups, a = l.length, c = 0; c < a; ++c)
    for (var f = l[c], p = f.length, h, g = 0; g < p; ++g)
      (h = f[g]) && El(h, t, r, g, f, i || Yx(h, r));
  return new wn(l, this._parents, t, r);
}
ki.prototype.interrupt = Xw;
ki.prototype.transition = Zx;
var Gs = (t) => () => t;
function Qx(t, {
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
pg.prototype = vn.prototype;
function pg(t) {
  for (; !t.__zoom; ) if (!(t = t.parentNode)) return Cl;
  return t.__zoom;
}
function Ou(t) {
  t.stopImmediatePropagation();
}
function ai(t) {
  t.preventDefault(), t.stopImmediatePropagation();
}
function Kx(t) {
  return (!t.ctrlKey || t.type === "wheel") && !t.button;
}
function Gx() {
  var t = this;
  return t instanceof SVGElement ? (t = t.ownerSVGElement || t, t.hasAttribute("viewBox") ? (t = t.viewBox.baseVal, [[t.x, t.y], [t.x + t.width, t.y + t.height]]) : [[0, 0], [t.width.baseVal.value, t.height.baseVal.value]]) : [[0, 0], [t.clientWidth, t.clientHeight]];
}
function Ip() {
  return this.__zoom || Cl;
}
function qx(t) {
  return -t.deltaY * (t.deltaMode === 1 ? 0.05 : t.deltaMode ? 1 : 2e-3) * (t.ctrlKey ? 10 : 1);
}
function Jx() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function e1(t, r, i) {
  var l = t.invertX(r[0][0]) - i[0][0], a = t.invertX(r[1][0]) - i[1][0], c = t.invertY(r[0][1]) - i[0][1], f = t.invertY(r[1][1]) - i[1][1];
  return t.translate(
    a > l ? (l + a) / 2 : Math.min(0, l) || Math.max(0, a),
    f > c ? (c + f) / 2 : Math.min(0, c) || Math.max(0, f)
  );
}
function hg() {
  var t = Kx, r = Gx, i = e1, l = qx, a = Jx, c = [0, 1 / 0], f = [[-1 / 0, -1 / 0], [1 / 0, 1 / 0]], p = 250, h = rl, g = wl("start", "zoom", "end"), m, v, y, x = 500, _ = 150, M = 0, E = 10;
  function C(N) {
    N.property("__zoom", Ip).on("wheel.zoom", Y, { passive: !1 }).on("mousedown.zoom", I).on("dblclick.zoom", K).filter(a).on("touchstart.zoom", Z).on("touchmove.zoom", ee).on("touchend.zoom touchcancel.zoom", J).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  C.transform = function(N, A, O, B) {
    var R = N.selection ? N.selection() : N;
    R.property("__zoom", Ip), N !== R ? V(N, A, O, B) : R.interrupt().each(function() {
      D(this, arguments).event(B).start().zoom(null, typeof A == "function" ? A.apply(this, arguments) : A).end();
    });
  }, C.scaleBy = function(N, A, O, B) {
    C.scaleTo(N, function() {
      var R = this.__zoom.k, H = typeof A == "function" ? A.apply(this, arguments) : A;
      return R * H;
    }, O, B);
  }, C.scaleTo = function(N, A, O, B) {
    C.transform(N, function() {
      var R = r.apply(this, arguments), H = this.__zoom, U = O == null ? P(R) : typeof O == "function" ? O.apply(this, arguments) : O, k = H.invert(U), $ = typeof A == "function" ? A.apply(this, arguments) : A;
      return i(S(L(H, $), U, k), R, f);
    }, O, B);
  }, C.translateBy = function(N, A, O, B) {
    C.transform(N, function() {
      return i(this.__zoom.translate(
        typeof A == "function" ? A.apply(this, arguments) : A,
        typeof O == "function" ? O.apply(this, arguments) : O
      ), r.apply(this, arguments), f);
    }, null, B);
  }, C.translateTo = function(N, A, O, B, R) {
    C.transform(N, function() {
      var H = r.apply(this, arguments), U = this.__zoom, k = B == null ? P(H) : typeof B == "function" ? B.apply(this, arguments) : B;
      return i(Cl.translate(k[0], k[1]).scale(U.k).translate(
        typeof A == "function" ? -A.apply(this, arguments) : -A,
        typeof O == "function" ? -O.apply(this, arguments) : -O
      ), H, f);
    }, B, R);
  };
  function L(N, A) {
    return A = Math.max(c[0], Math.min(c[1], A)), A === N.k ? N : new vn(A, N.x, N.y);
  }
  function S(N, A, O) {
    var B = A[0] - O[0] * N.k, R = A[1] - O[1] * N.k;
    return B === N.x && R === N.y ? N : new vn(N.k, B, R);
  }
  function P(N) {
    return [(+N[0][0] + +N[1][0]) / 2, (+N[0][1] + +N[1][1]) / 2];
  }
  function V(N, A, O, B) {
    N.on("start.zoom", function() {
      D(this, arguments).event(B).start();
    }).on("interrupt.zoom end.zoom", function() {
      D(this, arguments).event(B).end();
    }).tween("zoom", function() {
      var R = this, H = arguments, U = D(R, H).event(B), k = r.apply(R, H), $ = O == null ? P(k) : typeof O == "function" ? O.apply(R, H) : O, ie = Math.max(k[1][0] - k[0][0], k[1][1] - k[0][1]), re = R.__zoom, ae = typeof A == "function" ? A.apply(R, H) : A, ce = h(re.invert($).concat(ie / re.k), ae.invert($).concat(ie / ae.k));
      return function(ue) {
        if (ue === 1) ue = ae;
        else {
          var q = ce(ue), le = ie / q[2];
          ue = new vn(le, $[0] - q[0] * le, $[1] - q[1] * le);
        }
        U.zoom(null, ue);
      };
    });
  }
  function D(N, A, O) {
    return !O && N.__zooming || new j(N, A);
  }
  function j(N, A) {
    this.that = N, this.args = A, this.active = 0, this.sourceEvent = null, this.extent = r.apply(N, A), this.taps = 0;
  }
  j.prototype = {
    event: function(N) {
      return N && (this.sourceEvent = N), this;
    },
    start: function() {
      return ++this.active === 1 && (this.that.__zooming = this, this.emit("start")), this;
    },
    zoom: function(N, A) {
      return this.mouse && N !== "mouse" && (this.mouse[1] = A.invert(this.mouse[0])), this.touch0 && N !== "touch" && (this.touch0[1] = A.invert(this.touch0[0])), this.touch1 && N !== "touch" && (this.touch1[1] = A.invert(this.touch1[0])), this.that.__zoom = A, this.emit("zoom"), this;
    },
    end: function() {
      return --this.active === 0 && (delete this.that.__zooming, this.emit("end")), this;
    },
    emit: function(N) {
      var A = kt(this.that).datum();
      g.call(
        N,
        this.that,
        new Qx(N, {
          sourceEvent: this.sourceEvent,
          target: C,
          transform: this.that.__zoom,
          dispatch: g
        }),
        A
      );
    }
  };
  function Y(N, ...A) {
    if (!t.apply(this, arguments)) return;
    var O = D(this, A).event(N), B = this.__zoom, R = Math.max(c[0], Math.min(c[1], B.k * Math.pow(2, l.apply(this, arguments)))), H = jt(N);
    if (O.wheel)
      (O.mouse[0][0] !== H[0] || O.mouse[0][1] !== H[1]) && (O.mouse[1] = B.invert(O.mouse[0] = H)), clearTimeout(O.wheel);
    else {
      if (B.k === R) return;
      O.mouse = [H, B.invert(H)], sl(this), O.start();
    }
    ai(N), O.wheel = setTimeout(U, _), O.zoom("mouse", i(S(L(B, R), O.mouse[0], O.mouse[1]), O.extent, f));
    function U() {
      O.wheel = null, O.end();
    }
  }
  function I(N, ...A) {
    if (y || !t.apply(this, arguments)) return;
    var O = N.currentTarget, B = D(this, A, !0).event(N), R = kt(N.view).on("mousemove.zoom", $, !0).on("mouseup.zoom", ie, !0), H = jt(N, O), U = N.clientX, k = N.clientY;
    Fh(N.view), Ou(N), B.mouse = [H, this.__zoom.invert(H)], sl(this), B.start();
    function $(re) {
      if (ai(re), !B.moved) {
        var ae = re.clientX - U, ce = re.clientY - k;
        B.moved = ae * ae + ce * ce > M;
      }
      B.event(re).zoom("mouse", i(S(B.that.__zoom, B.mouse[0] = jt(re, O), B.mouse[1]), B.extent, f));
    }
    function ie(re) {
      R.on("mousemove.zoom mouseup.zoom", null), Vh(re.view, B.moved), ai(re), B.event(re).end();
    }
  }
  function K(N, ...A) {
    if (t.apply(this, arguments)) {
      var O = this.__zoom, B = jt(N.changedTouches ? N.changedTouches[0] : N, this), R = O.invert(B), H = O.k * (N.shiftKey ? 0.5 : 2), U = i(S(L(O, H), B, R), r.apply(this, A), f);
      ai(N), p > 0 ? kt(this).transition().duration(p).call(V, U, B, N) : kt(this).call(C.transform, U, B, N);
    }
  }
  function Z(N, ...A) {
    if (t.apply(this, arguments)) {
      var O = N.touches, B = O.length, R = D(this, A, N.changedTouches.length === B).event(N), H, U, k, $;
      for (Ou(N), U = 0; U < B; ++U)
        k = O[U], $ = jt(k, this), $ = [$, this.__zoom.invert($), k.identifier], R.touch0 ? !R.touch1 && R.touch0[2] !== $[2] && (R.touch1 = $, R.taps = 0) : (R.touch0 = $, H = !0, R.taps = 1 + !!m);
      m && (m = clearTimeout(m)), H && (R.taps < 2 && (v = $[0], m = setTimeout(function() {
        m = null;
      }, x)), sl(this), R.start());
    }
  }
  function ee(N, ...A) {
    if (this.__zooming) {
      var O = D(this, A).event(N), B = N.changedTouches, R = B.length, H, U, k, $;
      for (ai(N), H = 0; H < R; ++H)
        U = B[H], k = jt(U, this), O.touch0 && O.touch0[2] === U.identifier ? O.touch0[0] = k : O.touch1 && O.touch1[2] === U.identifier && (O.touch1[0] = k);
      if (U = O.that.__zoom, O.touch1) {
        var ie = O.touch0[0], re = O.touch0[1], ae = O.touch1[0], ce = O.touch1[1], ue = (ue = ae[0] - ie[0]) * ue + (ue = ae[1] - ie[1]) * ue, q = (q = ce[0] - re[0]) * q + (q = ce[1] - re[1]) * q;
        U = L(U, Math.sqrt(ue / q)), k = [(ie[0] + ae[0]) / 2, (ie[1] + ae[1]) / 2], $ = [(re[0] + ce[0]) / 2, (re[1] + ce[1]) / 2];
      } else if (O.touch0) k = O.touch0[0], $ = O.touch0[1];
      else return;
      O.zoom("touch", i(S(U, k, $), O.extent, f));
    }
  }
  function J(N, ...A) {
    if (this.__zooming) {
      var O = D(this, A).event(N), B = N.changedTouches, R = B.length, H, U;
      for (Ou(N), y && clearTimeout(y), y = setTimeout(function() {
        y = null;
      }, x), H = 0; H < R; ++H)
        U = B[H], O.touch0 && O.touch0[2] === U.identifier ? delete O.touch0 : O.touch1 && O.touch1[2] === U.identifier && delete O.touch1;
      if (O.touch1 && !O.touch0 && (O.touch0 = O.touch1, delete O.touch1), O.touch0) O.touch0[1] = this.__zoom.invert(O.touch0[0]);
      else if (O.end(), O.taps === 2 && (U = jt(U, this), Math.hypot(v[0] - U[0], v[1] - U[1]) < E)) {
        var k = kt(this).on("dblclick.zoom");
        k && k.apply(this, arguments);
      }
    }
  }
  return C.wheelDelta = function(N) {
    return arguments.length ? (l = typeof N == "function" ? N : Gs(+N), C) : l;
  }, C.filter = function(N) {
    return arguments.length ? (t = typeof N == "function" ? N : Gs(!!N), C) : t;
  }, C.touchable = function(N) {
    return arguments.length ? (a = typeof N == "function" ? N : Gs(!!N), C) : a;
  }, C.extent = function(N) {
    return arguments.length ? (r = typeof N == "function" ? N : Gs([[+N[0][0], +N[0][1]], [+N[1][0], +N[1][1]]]), C) : r;
  }, C.scaleExtent = function(N) {
    return arguments.length ? (c[0] = +N[0], c[1] = +N[1], C) : [c[0], c[1]];
  }, C.translateExtent = function(N) {
    return arguments.length ? (f[0][0] = +N[0][0], f[1][0] = +N[1][0], f[0][1] = +N[0][1], f[1][1] = +N[1][1], C) : [[f[0][0], f[0][1]], [f[1][0], f[1][1]]];
  }, C.constrain = function(N) {
    return arguments.length ? (i = N, C) : i;
  }, C.duration = function(N) {
    return arguments.length ? (p = +N, C) : p;
  }, C.interpolate = function(N) {
    return arguments.length ? (h = N, C) : h;
  }, C.on = function() {
    var N = g.on.apply(g, arguments);
    return N === g ? C : N;
  }, C.clickDistance = function(N) {
    return arguments.length ? (M = (N = +N) * N, C) : Math.sqrt(M);
  }, C.tapDistance = function(N) {
    return arguments.length ? (E = +N, C) : E;
  }, C;
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
], gg = ["Enter", " ", "Escape"], mg = {
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
var yr;
(function(t) {
  t.Free = "free", t.Vertical = "vertical", t.Horizontal = "horizontal";
})(yr || (yr = {}));
var vi;
(function(t) {
  t.Partial = "partial", t.Full = "full";
})(vi || (vi = {}));
const yg = {
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
var Un;
(function(t) {
  t.Bezier = "default", t.Straight = "straight", t.Step = "step", t.SmoothStep = "smoothstep", t.SimpleBezier = "simplebezier";
})(Un || (Un = {}));
var gl;
(function(t) {
  t.Arrow = "arrow", t.ArrowClosed = "arrowclosed";
})(gl || (gl = {}));
var we;
(function(t) {
  t.Left = "left", t.Top = "top", t.Right = "right", t.Bottom = "bottom";
})(we || (we = {}));
const Tp = {
  [we.Left]: we.Right,
  [we.Right]: we.Left,
  [we.Top]: we.Bottom,
  [we.Bottom]: we.Top
}, vg = (t) => !!t && typeof t == "object" && "id" in t && "source" in t && "target" in t, t1 = (t) => !!t && typeof t == "object" && "id" in t && "position" in t && !("source" in t) && !("target" in t), _c = (t) => !!t && typeof t == "object" && "id" in t && "internals" in t && !("source" in t) && !("target" in t), Ci = (t, r = [0, 0]) => {
  const { width: i, height: l } = Xt(t), a = t.origin ?? r, c = i * a[0], f = l * a[1];
  return {
    x: t.position.x - c,
    y: t.position.y - f
  };
}, n1 = (t, r = { nodeOrigin: [0, 0] }) => {
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
    const E = x.width ?? y.width ?? y.initialWidth ?? 0, C = x.height ?? y.height ?? y.initialHeight ?? 0, { x: L, y: S } = y.internals.positionAbsolute, P = Sg(p, h, g, m, L, S, E, C), V = E * C, D = c && P > 0;
    (!y.internals.handleBounds || D || P >= V || y.dragging) && v.push(y);
  }
  return v;
}, r1 = (t, r) => {
  const i = /* @__PURE__ */ new Set();
  return t.forEach((l) => {
    i.add(l.id);
  }), r.filter((l) => i.has(l.source) || i.has(l.target));
};
function o1(t, r) {
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
async function i1({ nodes: t, width: r, height: i, panZoom: l, minZoom: a, maxZoom: c }, f) {
  if (t.size === 0)
    return !0;
  const p = o1(t, f), h = Ni(p), g = Ec(h, r, i, f?.minZoom ?? a, f?.maxZoom ?? c, f?.padding ?? 0.1);
  return await l.setViewport(g, {
    duration: f?.duration,
    ease: f?.ease,
    interpolate: f?.interpolate
  }), !0;
}
function wg({ nodeId: t, nextPosition: r, nodeLookup: i, nodeOrigin: l = [0, 0], nodeExtent: a, onError: c }) {
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
  else p && Sr(f.extent) && (v = [
    [f.extent[0][0] + h, f.extent[0][1] + g],
    [f.extent[1][0] + h, f.extent[1][1] + g]
  ]);
  const y = Sr(v) ? _r(r, v, f.measured) : r;
  return (f.measured.width === void 0 || f.measured.height === void 0) && c?.("015", Ut.error015()), {
    position: {
      x: y.x - h + (f.measured.width ?? 0) * m[0],
      y: y.y - g + (f.measured.height ?? 0) * m[1]
    },
    positionAbsolute: y
  };
}
async function s1({ nodesToRemove: t = [], edgesToRemove: r = [], nodes: i, edges: l, onBeforeDelete: a }) {
  const c = new Set(t.map((y) => y.id)), f = [];
  for (const y of i) {
    if (y.deletable === !1)
      continue;
    const x = c.has(y.id), _ = !x && y.parentId && f.find((M) => M.id === y.parentId);
    (x || _) && f.push(y);
  }
  const p = new Set(r.map((y) => y.id)), h = l.filter((y) => y.deletable !== !1), m = r1(f, h);
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
const po = (t, r = 0, i = 1) => Math.min(Math.max(t, r), i), _r = (t = { x: 0, y: 0 }, r, i) => ({
  x: po(t.x, r[0][0], r[1][0] - (i?.width ?? 0)),
  y: po(t.y, r[0][1], r[1][1] - (i?.height ?? 0))
});
function xg(t, r, i) {
  const { width: l, height: a } = Xt(i), { x: c, y: f } = i.internals.positionAbsolute;
  return _r(t, [
    [c, f],
    [c + l, f + a]
  ], r);
}
const Rp = (t, r, i) => t < r ? po(Math.abs(t - r), 1, r) / r : t > i ? -po(Math.abs(t - i), 1, r) / r : 0, kc = (t, r, i = 15, l = 40) => {
  const a = Rp(t.x, l, r.width - l) * i, c = Rp(t.y, l, r.height - l) * i;
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
}, _g = (t, r) => Ml(Nl(rc(t), rc(r))), Sg = (t, r, i, l, a, c, f, p) => {
  const h = Math.max(0, Math.min(t + i, a + f) - Math.max(t, a)), g = Math.max(0, Math.min(r + l, c + p) - Math.max(r, c));
  return Math.ceil(h * g);
}, yl = (t, r) => Sg(t.x, t.y, t.width, t.height, r.x, r.y, r.width, r.height), Dp = (t) => Vt(t.width) && Vt(t.height) && Vt(t.x) && Vt(t.y), Vt = (t) => !isNaN(t) && isFinite(t), kg = (t, r) => (i, l) => {
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
function l1(t, r, i) {
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
function a1(t, r, i, l, a, c) {
  const { x: f, y: p } = ho(t, [r, i, l]), { x: h, y: g } = ho({ x: t.x + t.width, y: t.y + t.height }, [r, i, l]), m = a - h, v = c - g;
  return {
    left: Math.floor(f),
    top: Math.floor(p),
    right: Math.floor(m),
    bottom: Math.floor(v)
  };
}
const Ec = (t, r, i, l, a, c) => {
  const f = l1(c, r, i), p = (r - f.x) / t.width, h = (i - f.y) / t.height, g = Math.min(p, h), m = po(g, l, a), v = t.x + t.width / 2, y = t.y + t.height / 2, x = r / 2 - v * m, _ = i / 2 - y * m, M = a1(t, x, _, m, r, i), E = {
    left: Math.min(M.left - f.left, 0),
    top: Math.min(M.top - f.top, 0),
    right: Math.min(M.right - f.right, 0),
    bottom: Math.min(M.bottom - f.bottom, 0)
  };
  return {
    x: x - E.left + E.right,
    y: _ - E.top + E.bottom,
    zoom: m
  };
}, xi = () => typeof navigator < "u" && navigator?.userAgent?.indexOf("Mac") >= 0;
function Sr(t) {
  return t != null && t !== "parent";
}
function Xt(t) {
  return {
    width: t.measured?.width ?? t.width ?? t.initialWidth ?? 0,
    height: t.measured?.height ?? t.height ?? t.initialHeight ?? 0
  };
}
function Eg(t) {
  return (t.measured?.width ?? t.width ?? t.initialWidth) !== void 0 && (t.measured?.height ?? t.height ?? t.initialHeight) !== void 0;
}
function Cg(t, r = { width: 0, height: 0 }, i, l, a) {
  const c = { ...t }, f = l.get(i);
  if (f) {
    const p = f.origin || a;
    c.x += f.internals.positionAbsolute.x - (r.width ?? 0) * p[0], c.y += f.internals.positionAbsolute.y - (r.height ?? 0) * p[1];
  }
  return c;
}
function bp(t, r) {
  if (t.size !== r.size)
    return !1;
  for (const i of t)
    if (!r.has(i))
      return !1;
  return !0;
}
function u1() {
  let t, r;
  return { promise: new Promise((l, a) => {
    t = l, r = a;
  }), resolve: t, reject: r };
}
function c1(t) {
  return { ...mg, ...t || {} };
}
function Ng(t) {
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
}), Mg = (t) => t?.getRootNode?.() || window?.document, f1 = ["INPUT", "SELECT", "TEXTAREA"];
function zg(t) {
  const r = t.composedPath?.()?.[0] || t.target;
  return r?.nodeType !== 1 ? !1 : f1.includes(r.nodeName) || r.hasAttribute("contenteditable") || !!r.closest(".nokey");
}
const Pg = (t) => "clientX" in t, Bt = (t, r) => {
  const i = Pg(t), l = i ? t.clientX : t.touches?.[0].clientX, a = i ? t.clientY : t.touches?.[0].clientY;
  return {
    x: l - (r?.left ?? 0),
    y: a - (r?.top ?? 0)
  };
}, Lp = (t, r, i, l, a) => {
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
function Ig({ sourceX: t, sourceY: r, targetX: i, targetY: l, sourceControlX: a, sourceControlY: c, targetControlX: f, targetControlY: p }) {
  const h = t * 0.125 + a * 0.375 + f * 0.375 + i * 0.125, g = r * 0.125 + c * 0.375 + p * 0.375 + l * 0.125, m = Math.abs(h - t), v = Math.abs(g - r);
  return [h, g, m, v];
}
function qs(t, r) {
  return t >= 0 ? 0.5 * t : r * 25 * Math.sqrt(-t);
}
function Ap({ pos: t, x1: r, y1: i, x2: l, y2: a, c }) {
  switch (t) {
    case we.Left:
      return [r - qs(r - l, c), i];
    case we.Right:
      return [r + qs(l - r, c), i];
    case we.Top:
      return [r, i - qs(i - a, c)];
    case we.Bottom:
      return [r, i + qs(a - i, c)];
  }
}
function Tg({ sourceX: t, sourceY: r, sourcePosition: i = we.Bottom, targetX: l, targetY: a, targetPosition: c = we.Top, curvature: f = 0.25 }) {
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
  }), [v, y, x, _] = Ig({
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
function Rg({ sourceX: t, sourceY: r, targetX: i, targetY: l }) {
  const a = Math.abs(i - t) / 2, c = i < t ? i + a : i - a, f = Math.abs(l - r) / 2, p = l < r ? l + f : l - f;
  return [c, p, a, f];
}
function d1({ sourceNode: t, targetNode: r, selected: i = !1, zIndex: l = 0, elevateOnSelect: a = !1, zIndexMode: c = "basic" }) {
  if (c === "manual")
    return l;
  const f = a && i ? l + 1e3 : l, p = Math.max(t.parentId || a && t.selected ? t.internals.z : 0, r.parentId || a && r.selected ? r.internals.z : 0);
  return f + p;
}
function p1({ sourceNode: t, targetNode: r, width: i, height: l, transform: a }) {
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
const h1 = ({ source: t, sourceHandle: r, target: i, targetHandle: l }) => `xy-edge__${t}${r || ""}-${i}${l || ""}`, g1 = (t, r) => r.some((i) => i.source === t.source && i.target === t.target && (i.sourceHandle === t.sourceHandle || !i.sourceHandle && !t.sourceHandle) && (i.targetHandle === t.targetHandle || !i.targetHandle && !t.targetHandle)), m1 = (t, r, i = {}) => {
  if (!t.source || !t.target)
    return i.onError?.("006", Ut.error006()), r;
  const l = i.getEdgeId || h1;
  let a;
  return vg(t) ? a = { ...t } : a = {
    ...t,
    id: l(t)
  }, g1(a, r) ? r : (a.sourceHandle === null && delete a.sourceHandle, a.targetHandle === null && delete a.targetHandle, r.concat(a));
};
function Dg({ sourceX: t, sourceY: r, targetX: i, targetY: l }) {
  const [a, c, f, p] = Rg({
    sourceX: t,
    sourceY: r,
    targetX: i,
    targetY: l
  });
  return [`M ${t},${r}L ${i},${l}`, a, c, f, p];
}
const $p = {
  [we.Left]: { x: -1, y: 0 },
  [we.Right]: { x: 1, y: 0 },
  [we.Top]: { x: 0, y: -1 },
  [we.Bottom]: { x: 0, y: 1 }
}, y1 = ({ source: t, sourcePosition: r = we.Bottom, target: i }) => r === we.Left || r === we.Right ? t.x < i.x ? { x: 1, y: 0 } : { x: -1, y: 0 } : t.y < i.y ? { x: 0, y: 1 } : { x: 0, y: -1 }, Op = (t, r) => Math.sqrt(Math.pow(r.x - t.x, 2) + Math.pow(r.y - t.y, 2)), v1 = (t, r, i) => t.x === r.x && r.x === i.x && (r.y - t.y) * (i.y - r.y) >= 0 || t.y === r.y && r.y === i.y && (r.x - t.x) * (i.x - r.x) >= 0;
function w1({ source: t, sourcePosition: r = we.Bottom, target: i, targetPosition: l = we.Top, center: a, offset: c, stepPosition: f }) {
  const p = $p[r], h = $p[l], g = { x: t.x + p.x * c, y: t.y + p.y * c }, m = { x: i.x + h.x * c, y: i.y + h.y * c }, v = y1({
    source: g,
    sourcePosition: r,
    target: m
  }), y = v.x !== 0 ? "x" : "y", x = v[y];
  let _ = [], M, E;
  const C = { x: 0, y: 0 }, L = { x: 0, y: 0 }, [, , S, P] = Rg({
    sourceX: t.x,
    sourceY: t.y,
    targetX: i.x,
    targetY: i.y
  });
  if (p[y] * h[y] === -1) {
    y === "x" ? (M = a.x ?? g.x + (m.x - g.x) * f, E = a.y ?? (g.y + m.y) / 2) : (M = a.x ?? (g.x + m.x) / 2, E = a.y ?? g.y + (m.y - g.y) * f);
    const Y = [
      { x: M, y: g.y },
      { x: M, y: m.y }
    ], I = [
      { x: g.x, y: E },
      { x: m.x, y: E }
    ];
    p[y] === x ? _ = y === "x" ? Y : I : _ = y === "x" ? I : Y;
  } else {
    const Y = [{ x: g.x, y: m.y }], I = [{ x: m.x, y: g.y }];
    if (y === "x" ? _ = p.x === x ? I : Y : _ = p.y === x ? Y : I, r === l) {
      const N = Math.abs(t[y] - i[y]);
      if (N <= c) {
        const A = Math.min(c - 1, c - N);
        p[y] === x ? C[y] = (g[y] > t[y] ? -1 : 1) * A : L[y] = (m[y] > i[y] ? -1 : 1) * A;
      }
    }
    if (r !== l) {
      const N = y === "x" ? "y" : "x", A = p[y] === h[N], O = g[N] > m[N], B = g[N] < m[N];
      (p[y] === 1 && (!A && O || A && B) || p[y] !== 1 && (!A && B || A && O)) && (_ = y === "x" ? Y : I);
    }
    const K = { x: g.x + C.x, y: g.y + C.y }, Z = { x: m.x + L.x, y: m.y + L.y }, ee = Math.max(Math.abs(K.x - _[0].x), Math.abs(Z.x - _[0].x)), J = Math.max(Math.abs(K.y - _[0].y), Math.abs(Z.y - _[0].y));
    ee >= J ? (M = (K.x + Z.x) / 2, E = _[0].y) : (M = _[0].x, E = (K.y + Z.y) / 2);
  }
  const V = { x: g.x + C.x, y: g.y + C.y }, D = { x: m.x + L.x, y: m.y + L.y }, j = [];
  for (const Y of [t, V, ..._, D, i]) {
    const [I, K] = j.slice(-2);
    K && v1(I, K, Y) && j.pop(), j.push(Y);
  }
  return [j, M, E, S, P];
}
function x1(t, r, i, l) {
  const a = Math.min(Op(t, r) / 2, Op(r, i) / 2, l), { x: c, y: f } = r;
  if (t.x === c && c === i.x || t.y === f && f === i.y)
    return `L${c} ${f}`;
  if (t.y === f) {
    const g = t.x < i.x ? -1 : 1, m = t.y < i.y ? 1 : -1;
    return `L ${c + a * g},${f}Q ${c},${f} ${c},${f + a * m}`;
  }
  const p = t.x < i.x ? 1 : -1, h = t.y < i.y ? -1 : 1;
  return `L ${c},${f + a * h}Q ${c},${f} ${c + a * p},${f}`;
}
function oc({ sourceX: t, sourceY: r, sourcePosition: i = we.Bottom, targetX: l, targetY: a, targetPosition: c = we.Top, borderRadius: f = 5, centerX: p, centerY: h, offset: g = 20, stepPosition: m = 0.5 }) {
  const [v, y, x, _, M] = w1({
    source: { x: t, y: r },
    sourcePosition: i,
    target: { x: l, y: a },
    targetPosition: c,
    center: { x: p, y: h },
    offset: g,
    stepPosition: m
  });
  let E = `M${v[0].x} ${v[0].y}`;
  for (let C = 1; C < v.length - 1; C++)
    E += x1(v[C - 1], v[C], v[C + 1], f);
  return E += `L${v[v.length - 1].x} ${v[v.length - 1].y}`, [E, y, x, _, M];
}
function Hp(t) {
  return t && !!(t.internals.handleBounds || t.handles?.length) && !!(t.measured.width || t.width || t.initialWidth);
}
function _1(t) {
  const { sourceNode: r, targetNode: i } = t;
  if (!Hp(r) || !Hp(i))
    return null;
  const l = r.internals.handleBounds || jp(r.handles), a = i.internals.handleBounds || jp(i.handles), c = Fp(l?.source ?? [], t.sourceHandle), f = Fp(
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
  const p = c?.position || we.Bottom, h = f?.position || we.Top, g = kr(r, c, p), m = kr(i, f, h);
  return {
    sourceX: g.x,
    sourceY: g.y,
    targetX: m.x,
    targetY: m.y,
    sourcePosition: p,
    targetPosition: h
  };
}
function jp(t) {
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
function kr(t, r, i = we.Left, l = !1) {
  const a = (r?.x ?? 0) + t.internals.positionAbsolute.x, c = (r?.y ?? 0) + t.internals.positionAbsolute.y, { width: f, height: p } = r ?? Xt(t);
  if (l)
    return { x: a + f / 2, y: c + p / 2 };
  switch (r?.position ?? i) {
    case we.Top:
      return { x: a + f / 2, y: c };
    case we.Right:
      return { x: a + f, y: c + p / 2 };
    case we.Bottom:
      return { x: a + f / 2, y: c + p };
    case we.Left:
      return { x: a, y: c + p / 2 };
  }
}
function Fp(t, r) {
  return t && (r ? t.find((i) => i.id === r) : t[0]) || null;
}
function ic(t, r) {
  return t ? typeof t == "string" ? t : `${r ? `${r}__` : ""}${Object.keys(t).sort().map((l) => `${l}=${t[l]}`).join("&")}` : "";
}
function S1(t, { id: r, defaultColor: i, defaultMarkerStart: l, defaultMarkerEnd: a }) {
  const c = /* @__PURE__ */ new Set();
  return t.reduce((f, p) => ([p.markerStart || l, p.markerEnd || a].forEach((h) => {
    if (h && typeof h == "object") {
      const g = ic(h, r);
      c.has(g) || (f.push({ id: g, color: h.color || i, ...h }), c.add(g));
    }
  }), f), []).sort((f, p) => f.id.localeCompare(p.id));
}
const bg = 1e3, k1 = 10, Nc = {
  nodeOrigin: [0, 0],
  nodeExtent: yi,
  elevateNodesOnSelect: !0,
  zIndexMode: "basic",
  defaults: {}
}, E1 = {
  ...Nc,
  checkEquality: !0
};
function Mc(t, r) {
  const i = { ...t };
  for (const l in r)
    r[l] !== void 0 && (i[l] = r[l]);
  return i;
}
function C1(t, r, i) {
  const l = Mc(Nc, i);
  for (const a of t.values())
    if (a.parentId)
      Pc(a, t, r, l);
    else {
      const c = Ci(a, l.nodeOrigin), f = Sr(a.extent) ? a.extent : l.nodeExtent, p = _r(c, f, Xt(a));
      a.internals.positionAbsolute = p;
    }
}
function N1(t, r) {
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
  const a = Mc(E1, l), c = { i: 0 }, f = new Map(r), p = a?.elevateNodesOnSelect && !zc(a.zIndexMode) ? bg : 0;
  let h = t.length > 0, g = !1;
  r.clear(), i.clear();
  for (const m of t) {
    let v = f.get(m.id);
    if (a.checkEquality && m === v?.internals.userNode)
      r.set(m.id, v);
    else {
      const y = Ci(m, a.nodeOrigin), x = Sr(m.extent) ? m.extent : a.nodeExtent, _ = _r(y, x, Xt(m));
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
          handleBounds: N1(m, v),
          z: Lg(m, p, a.zIndexMode),
          userNode: m
        }
      }, r.set(m.id, v);
    }
    (v.measured === void 0 || v.measured.width === void 0 || v.measured.height === void 0) && !v.hidden && (h = !1), m.parentId && Pc(v, r, i, l, c), g ||= m.selected ?? !1;
  }
  return { nodesInitialized: h, hasSelectedNodes: g };
}
function M1(t, r) {
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
  M1(t, i), a && !m.parentId && m.internals.rootParentIndex === void 0 && h === "auto" && (m.internals.rootParentIndex = ++a.i, m.internals.z = m.internals.z + a.i * k1), a && m.internals.rootParentIndex !== void 0 && (a.i = m.internals.rootParentIndex);
  const v = c && !zc(h) ? bg : 0, { x: y, y: x, z: _ } = z1(t, m, f, p, v, h), { positionAbsolute: M } = t.internals, E = y !== M.x || x !== M.y;
  (E || _ !== t.internals.z) && r.set(t.id, {
    ...t,
    internals: {
      ...t.internals,
      positionAbsolute: E ? { x: y, y: x } : M,
      z: _
    }
  });
}
function Lg(t, r, i) {
  const l = Vt(t.zIndex) ? t.zIndex : 0;
  return zc(i) ? l : l + (t.selected ? r : 0);
}
function z1(t, r, i, l, a, c) {
  const { x: f, y: p } = r.internals.positionAbsolute, h = Xt(t), g = Ci(t, i), m = Sr(t.extent) ? _r(g, t.extent, h) : g;
  let v = _r({ x: f + m.x, y: p + m.y }, l, h);
  t.extent === "parent" && (v = xg(v, h, r));
  const y = Lg(t, a, c), x = r.internals.z ?? 0;
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
    const h = c.get(f.parentId)?.expandedRect ?? wi(p), g = _g(h, f.rect);
    c.set(f.parentId, { expandedRect: g, parent: p });
  }
  return c.size > 0 && c.forEach(({ expandedRect: f, parent: p }, h) => {
    const g = p.internals.positionAbsolute, m = Xt(p), v = p.origin ?? l, y = f.x < g.x ? Math.round(Math.abs(g.x - f.x)) : 0, x = f.y < g.y ? Math.round(Math.abs(g.y - f.y)) : 0, _ = Math.max(m.width, Math.round(f.width)), M = Math.max(m.height, Math.round(f.height)), E = (_ - m.width) * v[0], C = (M - m.height) * v[1];
    (y > 0 || x > 0 || E || C) && (a.push({
      id: h,
      type: "position",
      position: {
        x: p.position.x - y + E,
        y: p.position.y - x + C
      }
    }), i.get(h)?.forEach((L) => {
      t.some((S) => S.id === L.id) || a.push({
        id: L.id,
        type: "position",
        position: {
          x: L.position.x + y,
          y: L.position.y + x
        }
      });
    })), (m.width < f.width || m.height < f.height || y || x) && a.push({
      id: h,
      type: "dimensions",
      setAttributes: !0,
      dimensions: {
        width: _ + (y ? v[0] * y - E : 0),
        height: M + (x ? v[1] * x - C : 0)
      }
    });
  }), a;
}
function P1(t, r, i, l, a, c, f) {
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
    const M = Cc(x.nodeElement), E = _.measured.width !== M.width || _.measured.height !== M.height;
    if (!!(M.width && M.height && (E || !_.internals.handleBounds || x.force))) {
      const L = x.nodeElement.getBoundingClientRect(), S = Sr(_.extent) ? _.extent : c;
      let { positionAbsolute: P } = _.internals;
      if (_.parentId && _.extent === "parent") {
        const D = r.get(_.parentId);
        D && (P = xg(P, M, D));
      } else S && (P = _r(P, S, M));
      const V = {
        ..._,
        measured: M,
        internals: {
          ..._.internals,
          positionAbsolute: P,
          handleBounds: {
            source: Lp("source", x.nodeElement, L, v, _.id),
            target: Lp("target", x.nodeElement, L, v, _.id)
          }
        }
      };
      r.set(_.id, V), _.parentId && Pc(V, r, i, { nodeOrigin: a, zIndexMode: f }), h = !0, E && (g.push({
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
async function I1({ delta: t, panZoom: r, transform: i, translateExtent: l, width: a, height: c }) {
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
function Vp(t, r, i, l, a, c) {
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
function Ag(t, r, i) {
  t.clear(), r.clear();
  for (const l of i) {
    const { source: a, target: c, sourceHandle: f = null, targetHandle: p = null } = l, h = { edgeId: l.id, source: a, target: c, sourceHandle: f, targetHandle: p }, g = `${a}-${f}--${c}-${p}`, m = `${c}-${p}--${a}-${f}`;
    Vp("source", h, m, t, a, f), Vp("target", h, g, t, c, p), r.set(l.id, l);
  }
}
function $g(t, r) {
  if (!t.parentId)
    return !1;
  const i = r.get(t.parentId);
  return i ? i.selected ? !0 : $g(i, r) : !1;
}
function Bp(t, r, i) {
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
function T1(t, r, i, l, a) {
  const c = /* @__PURE__ */ new Map();
  for (const [f, p] of t)
    if ((a ? p.id === l : p.selected || p.id === l) && (a || !p.parentId || !$g(p, t)) && (p.draggable || r && typeof p.draggable > "u")) {
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
function R1({ dragItems: t, snapGrid: r, x: i, y: l }) {
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
function D1({ onNodeMouseDown: t, getStoreItems: r, onDragStart: i, onDrag: l, onDragStop: a }) {
  let c = { x: null, y: null }, f = 0, p = /* @__PURE__ */ new Map(), h = !1, g = { x: 0, y: 0 }, m = null, v = !1, y = null, x = !1, _ = !1, M = null;
  function E({ noDragClassName: L, handleSelector: S, domNode: P, isSelectable: V, nodeId: D, nodeClickDistance: j = 0 }) {
    y = kt(P);
    function Y({ x: ee, y: J }) {
      const { nodeLookup: N, nodeExtent: A, snapGrid: O, snapToGrid: B, nodeOrigin: R, onNodeDrag: H, onSelectionDrag: U, onError: k, updateNodePositions: $ } = r();
      c = { x: ee, y: J };
      let ie = !1;
      const re = p.size > 1, ae = re && A ? rc(Ni(p)) : null, ce = re && B ? R1({
        dragItems: p,
        snapGrid: O,
        x: ee,
        y: J
      }) : null;
      for (const [ue, q] of p) {
        if (!N.has(ue))
          continue;
        let le = { x: ee - q.distance.x, y: J - q.distance.y };
        B && (le = ce ? {
          x: Math.round(le.x + ce.x),
          y: Math.round(le.y + ce.y)
        } : Mi(le, O));
        let ve = null;
        if (re && A && !q.extent && ae) {
          const { positionAbsolute: ye } = q.internals, Ee = ye.x - ae.x + A[0][0], Ce = ye.x + q.measured.width - ae.x2 + A[1][0], ze = ye.y - ae.y + A[0][1], Ve = ye.y + q.measured.height - ae.y2 + A[1][1];
          ve = [
            [Ee, ze],
            [Ce, Ve]
          ];
        }
        const { position: Se, positionAbsolute: me } = wg({
          nodeId: ue,
          nextPosition: le,
          nodeLookup: N,
          nodeExtent: ve || A,
          nodeOrigin: R,
          onError: k
        });
        ie = ie || q.position.x !== Se.x || q.position.y !== Se.y, q.position = Se, q.internals.positionAbsolute = me;
      }
      if (_ = _ || ie, !!ie && ($(p, !0), M && (l || H || !D && U))) {
        const [ue, q] = Hu({
          nodeId: D,
          dragItems: p,
          nodeLookup: N
        });
        l?.(M, p, ue, q), H?.(M, ue, q), D || U?.(M, q);
      }
    }
    async function I() {
      if (!m)
        return;
      const { transform: ee, panBy: J, autoPanSpeed: N, autoPanOnNodeDrag: A } = r();
      if (!A) {
        h = !1, cancelAnimationFrame(f);
        return;
      }
      const [O, B] = kc(g, m, N);
      (O !== 0 || B !== 0) && (c.x = (c.x ?? 0) - O / ee[2], c.y = (c.y ?? 0) - B / ee[2], await J({ x: O, y: B }) && Y(c)), f = requestAnimationFrame(I);
    }
    function K(ee) {
      const { nodeLookup: J, multiSelectionActive: N, nodesDraggable: A, transform: O, snapGrid: B, snapToGrid: R, selectNodesOnDrag: H, onNodeDragStart: U, onSelectionDragStart: k, unselectNodesAndEdges: $ } = r();
      v = !0;
      const ie = !!D && !N && !J.get(D)?.selected;
      (!H || !V) && !N && D && (J.get(D)?.selected || $()), V && H && D && t?.(D);
      const re = di(ee.sourceEvent, { transform: O, snapGrid: B, snapToGrid: R, containerBounds: m });
      if (c = re, p = T1(J, A, re, D, ie), p.size > 0 && (i || U || !D && k)) {
        const [ae, ce] = Hu({
          nodeId: D,
          dragItems: p,
          nodeLookup: J
        });
        i?.(ee.sourceEvent, p, ae, ce), U?.(ee.sourceEvent, ae, ce), D || k?.(ee.sourceEvent, ce);
      }
    }
    const Z = Bh().clickDistance(j).on("start", (ee) => {
      const { domNode: J, nodeDragThreshold: N, transform: A, snapGrid: O, snapToGrid: B } = r();
      m = J?.getBoundingClientRect() || null, x = !1, _ = !1, M = ee.sourceEvent, N === 0 && K(ee), c = di(ee.sourceEvent, { transform: A, snapGrid: O, snapToGrid: B, containerBounds: m }), g = Bt(ee.sourceEvent, m);
    }).on("drag", (ee) => {
      const { autoPanOnNodeDrag: J, transform: N, snapGrid: A, snapToGrid: O, nodeDragThreshold: B, nodeLookup: R } = r(), H = di(ee.sourceEvent, { transform: N, snapGrid: A, snapToGrid: O, containerBounds: m });
      if (M = ee.sourceEvent, (ee.sourceEvent.type === "touchmove" && ee.sourceEvent.touches.length > 1 || // if user deletes a node while dragging, we need to abort the drag to prevent errors
      D && !R.has(D)) && (x = !0), !x) {
        if (!h && J && v && (h = !0, I()), !v) {
          const U = Bt(ee.sourceEvent, m), k = U.x - g.x, $ = U.y - g.y;
          Math.sqrt(k * k + $ * $) > B && K(ee);
        }
        (c.x !== H.xSnapped || c.y !== H.ySnapped) && p && v && (g = Bt(ee.sourceEvent, m), Y(H));
      }
    }).on("end", (ee) => {
      if (!v || x) {
        x && p.size > 0 && r().updateNodePositions(p, !1);
        return;
      }
      if (h = !1, v = !1, cancelAnimationFrame(f), p.size > 0) {
        const { nodeLookup: J, updateNodePositions: N, onNodeDragStop: A, onSelectionDragStop: O } = r();
        if (_ && (N(p, !1), _ = !1), a || A || !D && O) {
          const [B, R] = Hu({
            nodeId: D,
            dragItems: p,
            nodeLookup: J,
            dragging: !1
          });
          a?.(ee.sourceEvent, p, B, R), A?.(ee.sourceEvent, B, R), D || O?.(ee.sourceEvent, R);
        }
      }
    }).filter((ee) => {
      const J = ee.target;
      return !ee.button && (!L || !Bp(J, `.${L}`, P)) && (!S || Bp(J, S, P));
    });
    y.call(Z);
  }
  function C() {
    y?.on(".drag", null);
  }
  return {
    update: E,
    destroy: C
  };
}
function b1(t, r, i) {
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
const L1 = 250;
function A1(t, r, i, l) {
  let a = [], c = 1 / 0;
  const f = b1(t, i, r + L1);
  for (const p of f) {
    const h = [...p.internals.handleBounds?.source ?? [], ...p.internals.handleBounds?.target ?? []];
    for (const g of h) {
      if (l.nodeId === g.nodeId && l.type === g.type && l.id === g.id)
        continue;
      const { x: m, y: v } = kr(p, g, g.position, !0), y = Math.sqrt(Math.pow(m - t.x, 2) + Math.pow(v - t.y, 2));
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
function Og(t, r, i, l, a, c = !1) {
  const f = l.get(t);
  if (!f)
    return null;
  const p = a === "strict" ? f.internals.handleBounds?.[r] : [...f.internals.handleBounds?.source ?? [], ...f.internals.handleBounds?.target ?? []], h = (i ? p?.find((g) => g.id === i) : p?.[0]) ?? null;
  return h && c ? { ...h, ...kr(f, h, h.position, !0) } : h;
}
function Hg(t, r) {
  return t || (r?.classList.contains("target") ? "target" : r?.classList.contains("source") ? "source" : null);
}
function $1(t, r) {
  let i = null;
  return r ? i = !0 : t && !r && (i = !1), i;
}
const jg = () => !0;
function O1(t, { connectionMode: r, connectionRadius: i, handleId: l, nodeId: a, edgeUpdaterType: c, isTarget: f, domNode: p, nodeLookup: h, lib: g, autoPanOnConnect: m, flowId: v, panBy: y, cancelConnection: x, onConnectStart: _, onConnect: M, onConnectEnd: E, isValidConnection: C = jg, onReconnectEnd: L, updateConnection: S, getTransform: P, getFromHandle: V, autoPanSpeed: D, dragThreshold: j = 1, handleDomNode: Y }) {
  const I = Mg(t.target);
  let K = 0, Z;
  const { x: ee, y: J } = Bt(t), N = Hg(c, Y), A = p?.getBoundingClientRect();
  let O = !1;
  if (!A || !N)
    return;
  const B = Og(a, N, l, h, r);
  if (!B)
    return;
  let R = Bt(t, A), H = !1, U = null, k = !1, $ = null;
  function ie() {
    if (!m || !A)
      return;
    const [Se, me] = kc(R, A, D);
    y({ x: Se, y: me }), K = requestAnimationFrame(ie);
  }
  const re = {
    ...B,
    nodeId: a,
    type: N,
    position: B.position
  }, ae = h.get(a);
  let ue = {
    inProgress: !0,
    isValid: null,
    from: kr(ae, re, we.Left, !0),
    fromHandle: re,
    fromPosition: re.position,
    fromNode: ae,
    to: R,
    toHandle: null,
    toPosition: Tp[re.position],
    toNode: null,
    pointer: R
  };
  function q() {
    O = !0, S(ue), _?.(t, { nodeId: a, handleId: l, handleType: N });
  }
  j === 0 && q();
  function le(Se) {
    if (!O) {
      const { x: Ve, y: Ct } = Bt(Se), at = Ve - ee, et = Ct - J;
      if (!(at * at + et * et > j * j))
        return;
      q();
    }
    if (!V() || !re) {
      ve(Se);
      return;
    }
    const me = P();
    R = Bt(Se, A), Z = A1(zi(R, me, !1, [1, 1]), i, h, re), H || (ie(), H = !0);
    const ye = Fg(Se, {
      handle: Z,
      connectionMode: r,
      fromNodeId: a,
      fromHandleId: l,
      fromType: f ? "target" : "source",
      isValidConnection: C,
      doc: I,
      lib: g,
      flowId: v,
      nodeLookup: h
    });
    $ = ye.handleDomNode, U = ye.connection, k = $1(!!Z, ye.isValid);
    const Ee = h.get(a), Ce = Ee ? kr(Ee, re, we.Left, !0) : ue.from, ze = {
      ...ue,
      from: Ce,
      isValid: k,
      to: ye.toHandle && k ? ho({ x: ye.toHandle.x, y: ye.toHandle.y }, me) : R,
      toHandle: ye.toHandle,
      toPosition: k && ye.toHandle ? ye.toHandle.position : Tp[re.position],
      toNode: ye.toHandle ? h.get(ye.toHandle.nodeId) : null,
      pointer: R
    };
    S(ze), ue = ze;
  }
  function ve(Se) {
    if (!("touches" in Se && Se.touches.length > 0)) {
      if (O) {
        (Z || $) && U && k && M?.(U);
        const { inProgress: me, ...ye } = ue, Ee = {
          ...ye,
          toPosition: ue.toHandle ? ue.toPosition : null
        };
        E?.(Se, Ee), c && L?.(Se, Ee);
      }
      x(), cancelAnimationFrame(K), H = !1, k = !1, U = null, $ = null, I.removeEventListener("mousemove", le), I.removeEventListener("mouseup", ve), I.removeEventListener("touchmove", le), I.removeEventListener("touchend", ve);
    }
  }
  I.addEventListener("mousemove", le), I.addEventListener("mouseup", ve), I.addEventListener("touchmove", le), I.addEventListener("touchend", ve);
}
function Fg(t, { handle: r, connectionMode: i, fromNodeId: l, fromHandleId: a, fromType: c, doc: f, lib: p, flowId: h, isValidConnection: g = jg, nodeLookup: m }) {
  const v = c === "target", y = r ? f.querySelector(`.${p}-flow__handle[data-id="${h}-${r?.nodeId}-${r?.id}-${r?.type}"]`) : null, { x, y: _ } = Bt(t), M = f.elementFromPoint(x, _), E = M?.classList.contains(`${p}-flow__handle`) ? M : y, C = {
    handleDomNode: E,
    isValid: !1,
    connection: null,
    toHandle: null
  };
  if (E) {
    const L = Hg(void 0, E), S = E.getAttribute("data-nodeid"), P = E.getAttribute("data-handleid"), V = E.classList.contains("connectable"), D = E.classList.contains("connectableend");
    if (!S || !L)
      return C;
    const j = {
      source: v ? S : l,
      sourceHandle: v ? P : a,
      target: v ? l : S,
      targetHandle: v ? a : P
    };
    C.connection = j;
    const I = V && D && (i === fo.Strict ? v && L === "source" || !v && L === "target" : S !== l || P !== a);
    C.isValid = I && g(j), C.toHandle = Og(S, L, P, m, i, !0);
  }
  return C;
}
const lc = {
  onPointerDown: O1,
  isValid: Fg
};
function H1({ domNode: t, panZoom: r, getTransform: i, getViewScale: l }) {
  const a = kt(t);
  function c({ translateExtent: p, width: h, height: g, zoomStep: m = 1, pannable: v = !0, zoomable: y = !0, inversePan: x = !1 }) {
    const _ = (S) => {
      if (S.sourceEvent.type !== "wheel" || !r)
        return;
      const P = i(), V = S.sourceEvent.ctrlKey && xi() ? 10 : 1, D = -S.sourceEvent.deltaY * (S.sourceEvent.deltaMode === 1 ? 0.05 : S.sourceEvent.deltaMode ? 1 : 2e-3) * m, j = P[2] * Math.pow(2, D * V);
      r.scaleTo(j);
    };
    let M = [0, 0];
    const E = (S) => {
      (S.sourceEvent.type === "mousedown" || S.sourceEvent.type === "touchstart") && (M = [
        S.sourceEvent.clientX ?? S.sourceEvent.touches[0].clientX,
        S.sourceEvent.clientY ?? S.sourceEvent.touches[0].clientY
      ]);
    }, C = (S) => {
      const P = i();
      if (S.sourceEvent.type !== "mousemove" && S.sourceEvent.type !== "touchmove" || !r)
        return;
      const V = [
        S.sourceEvent.clientX ?? S.sourceEvent.touches[0].clientX,
        S.sourceEvent.clientY ?? S.sourceEvent.touches[0].clientY
      ], D = [V[0] - M[0], V[1] - M[1]];
      M = V;
      const j = l() * Math.max(P[2], Math.log(P[2])) * (x ? -1 : 1), Y = {
        x: P[0] - D[0] * j,
        y: P[1] - D[1] * j
      }, I = [
        [0, 0],
        [h, g]
      ];
      r.setViewportConstrained({
        x: Y.x,
        y: Y.y,
        zoom: P[2]
      }, I, p);
    }, L = hg().on("start", E).on("zoom", v ? C : null).on("zoom.wheel", y ? _ : null);
    a.call(L, {});
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
}), ju = ({ x: t, y: r, zoom: i }) => Cl.translate(t, r).scale(i), Bn = (t, r) => t.target.closest(`.${r}`), Vg = (t, r) => r === 2 && Array.isArray(t) && t.includes(2), j1 = (t) => ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2, Fu = (t, r = 0, i = j1, l = () => {
}) => {
  const a = typeof r == "number" && r > 0;
  return a || l(), a ? t.transition().duration(r).ease(i).on("end", l) : t;
}, Bg = (t) => {
  const r = t.ctrlKey && xi() ? 10 : 1;
  return -t.deltaY * (t.deltaMode === 1 ? 0.05 : t.deltaMode ? 1 : 2e-3) * r;
};
function F1({ zoomPanValues: t, noWheelClassName: r, d3Selection: i, d3Zoom: l, panOnScrollMode: a, panOnScrollSpeed: c, zoomOnPinch: f, onPanZoomStart: p, onPanZoom: h, onPanZoomEnd: g }) {
  return (m) => {
    if (Bn(m, r))
      return m.ctrlKey && m.preventDefault(), !1;
    m.preventDefault(), m.stopImmediatePropagation();
    const v = i.property("__zoom").k || 1;
    if (m.ctrlKey && f) {
      const E = jt(m), C = Bg(m), L = v * Math.pow(2, C);
      l.scaleTo(i, L, E, m);
      return;
    }
    const y = m.deltaMode === 1 ? 20 : 1;
    let x = a === yr.Vertical ? 0 : m.deltaX * y, _ = a === yr.Horizontal ? 0 : m.deltaY * y;
    !xi() && m.shiftKey && a !== yr.Vertical && (x = m.deltaY * y, _ = 0), l.translateBy(
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
function V1({ noWheelClassName: t, preventScrolling: r, d3ZoomHandler: i }) {
  return function(l, a) {
    const c = l.type === "wheel", f = !r && c && !l.ctrlKey, p = Bn(l, t);
    if (l.ctrlKey && c && p && l.preventDefault(), f || p)
      return null;
    l.preventDefault(), i.call(this, l, a);
  };
}
function B1({ zoomPanValues: t, onDraggingChange: r, onPanZoomStart: i }) {
  return (l) => {
    if (l.sourceEvent?.internal)
      return;
    const a = zl(l.transform);
    t.mouseButton = l.sourceEvent?.button || 0, t.isZoomingOrPanning = !0, t.prevViewport = a, l.sourceEvent?.type === "mousedown" && r(!0), i && i?.(l.sourceEvent, a);
  };
}
function U1({ zoomPanValues: t, panOnDrag: r, onPaneContextMenu: i, onTransformChange: l, onPanZoom: a }) {
  return (c) => {
    t.usedRightMouseButton = !!(i && Vg(r, t.mouseButton ?? 0)), c.sourceEvent?.sync || l([c.transform.x, c.transform.y, c.transform.k]), a && !c.sourceEvent?.internal && a?.(c.sourceEvent, zl(c.transform));
  };
}
function W1({ zoomPanValues: t, panOnDrag: r, panOnScroll: i, onDraggingChange: l, onPanZoomEnd: a, onPaneContextMenu: c }) {
  return (f) => {
    if (!f.sourceEvent?.internal && (t.isZoomingOrPanning = !1, c && Vg(r, t.mouseButton ?? 0) && !t.usedRightMouseButton && f.sourceEvent && c(f.sourceEvent), t.usedRightMouseButton = !1, l(!1), a)) {
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
function X1({ panActivationKeyPressed: t, zoomActivationKeyPressed: r, zoomOnScroll: i, zoomOnPinch: l, panOnDrag: a, panOnScroll: c, zoomOnDoubleClick: f, userSelectionActive: p, noWheelClassName: h, noPanClassName: g, lib: m, connectionInProgress: v }) {
  return (y) => {
    const x = r || i, _ = l && y.ctrlKey, M = y.type === "wheel";
    if (y.button === 1 && y.type === "mousedown" && (Bn(y, `${m}-flow__node`) || Bn(y, `${m}-flow__edge`) || Bn(y, `${m}-flow__selection`) || Bn(y, `${m}-flow__nodesselection`)))
      return !0;
    if (!a && !x && !c && !f && !l || p || v && !M || Bn(y, h) && M || Bn(y, g) && (!M || c && M && !r) || !l && y.ctrlKey && M)
      return !1;
    if (!l && y.type === "touchstart" && y.touches?.length > 1)
      return y.preventDefault(), !1;
    if (!x && !c && !_ && M || !a && (y.type === "mousedown" || y.type === "touchstart") || Array.isArray(a) && !a.includes(y.button) && y.type === "mousedown")
      return !1;
    const E = Array.isArray(a) && a.includes(y.button) || !y.button || y.button <= 1;
    return (!y.ctrlKey || M || t) && E;
  };
}
function Y1({ domNode: t, minZoom: r, maxZoom: i, translateExtent: l, viewport: a, onPanZoom: c, onPanZoomStart: f, onPanZoomEnd: p, onDraggingChange: h }) {
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
  const y = typeof ResizeObserver < "u" ? new ResizeObserver((J) => {
    const N = J[0];
    N?.contentRect && (v = [
      [0, 0],
      [N.contentRect.width, N.contentRect.height]
    ]);
  }) : null;
  y?.observe(t);
  const x = hg().extent(() => v).scaleExtent([r, i]).translateExtent(l), _ = kt(t).call(x);
  P({
    x: a.x,
    y: a.y,
    zoom: po(a.zoom, r, i)
  }, [
    [0, 0],
    [m.width, m.height]
  ], l);
  const M = _.on("wheel.zoom"), E = _.on("dblclick.zoom");
  x.wheelDelta(Bg);
  async function C(J, N) {
    return _ ? new Promise((A) => {
      x?.interpolate(N?.interpolate === "linear" ? fi : rl).transform(Fu(_, N?.duration, N?.ease, () => A(!0)), J);
    }) : !1;
  }
  function L({ noWheelClassName: J, noPanClassName: N, onPaneContextMenu: A, userSelectionActive: O, panOnScroll: B, panOnDrag: R, panOnScrollMode: H, panOnScrollSpeed: U, preventScrolling: k, zoomOnPinch: $, zoomOnScroll: ie, zoomOnDoubleClick: re, panActivationKeyPressed: ae = !1, zoomActivationKeyPressed: ce, lib: ue, onTransformChange: q, connectionInProgress: le, paneClickDistance: ve, selectionOnDrag: Se }) {
    O && !g.isZoomingOrPanning && x.on("zoom", null);
    const me = B && !ce && !O;
    x.clickDistance(Se ? 1 / 0 : !Vt(ve) || ve < 0 ? 0 : ve);
    const ye = me ? F1({
      zoomPanValues: g,
      noWheelClassName: J,
      d3Selection: _,
      d3Zoom: x,
      panOnScrollMode: H,
      panOnScrollSpeed: U,
      zoomOnPinch: $,
      onPanZoomStart: f,
      onPanZoom: c,
      onPanZoomEnd: p
    }) : V1({
      noWheelClassName: J,
      preventScrolling: k,
      d3ZoomHandler: M
    });
    _.on("wheel.zoom", ye, { passive: !1 });
    const Ee = B1({
      zoomPanValues: g,
      onDraggingChange: h,
      onPanZoomStart: f
    });
    x.on("start", Ee);
    const Ce = U1({
      zoomPanValues: g,
      panOnDrag: R,
      onPaneContextMenu: !!A,
      onPanZoom: c,
      onTransformChange: q
    });
    x.on("zoom", Ce);
    const ze = W1({
      zoomPanValues: g,
      panOnDrag: R,
      panOnScroll: B,
      onPaneContextMenu: A,
      onPanZoomEnd: p,
      onDraggingChange: h
    });
    x.on("end", ze);
    const Ve = X1({
      panActivationKeyPressed: ae,
      zoomActivationKeyPressed: ce,
      panOnDrag: R,
      zoomOnScroll: ie,
      panOnScroll: B,
      zoomOnDoubleClick: re,
      zoomOnPinch: $,
      userSelectionActive: O,
      noPanClassName: N,
      noWheelClassName: J,
      lib: ue,
      connectionInProgress: le
    });
    x.filter(Ve), re ? _.on("dblclick.zoom", E) : _.on("dblclick.zoom", null);
  }
  function S() {
    x.on("zoom", null), y?.disconnect();
  }
  async function P(J, N, A) {
    const O = ju(J), B = x?.constrain()(O, N, A);
    return B && await C(B), B;
  }
  async function V(J, N) {
    const A = ju(J);
    return await C(A, N), A;
  }
  function D(J) {
    if (_) {
      const N = ju(J), A = _.property("__zoom");
      (A.k !== J.zoom || A.x !== J.x || A.y !== J.y) && x?.transform(_, N, null, { sync: !0 });
    }
  }
  function j() {
    const J = _ ? pg(_.node()) : { x: 0, y: 0, k: 1 };
    return { x: J.x, y: J.y, zoom: J.k };
  }
  async function Y(J, N) {
    return _ ? new Promise((A) => {
      x?.interpolate(N?.interpolate === "linear" ? fi : rl).scaleTo(Fu(_, N?.duration, N?.ease, () => A(!0)), J);
    }) : !1;
  }
  async function I(J, N) {
    return _ ? new Promise((A) => {
      x?.interpolate(N?.interpolate === "linear" ? fi : rl).scaleBy(Fu(_, N?.duration, N?.ease, () => A(!0)), J);
    }) : !1;
  }
  function K(J) {
    x?.scaleExtent(J);
  }
  function Z(J) {
    x?.translateExtent(J);
  }
  function ee(J) {
    const N = !Vt(J) || J < 0 ? 0 : J;
    x?.clickDistance(N);
  }
  return {
    update: L,
    destroy: S,
    setViewport: V,
    setViewportConstrained: P,
    getViewport: j,
    scaleTo: Y,
    scaleBy: I,
    setScaleExtent: K,
    setTranslateExtent: Z,
    syncViewport: D,
    setClickDistance: ee
  };
}
var go;
(function(t) {
  t.Line = "line", t.Handle = "handle";
})(go || (go = {}));
function Z1({ width: t, prevWidth: r, height: i, prevHeight: l, affectsX: a, affectsY: c }) {
  const f = t - r, p = i - l, h = [f > 0 ? 1 : f < 0 ? -1 : 0, p > 0 ? 1 : p < 0 ? -1 : 0];
  return f && a && (h[0] = h[0] * -1), p && c && (h[1] = h[1] * -1), h;
}
function Up(t) {
  const r = t.includes("right") || t.includes("left"), i = t.includes("bottom") || t.includes("top"), l = t.includes("left"), a = t.includes("top");
  return {
    isHorizontal: r,
    isVertical: i,
    affectsX: l,
    affectsY: a
  };
}
function Fn(t, r) {
  return Math.max(0, r - t);
}
function Vn(t, r) {
  return Math.max(0, t - r);
}
function Js(t, r, i) {
  return Math.max(0, r - t, t - i);
}
function Wp(t, r) {
  return t ? !r : r;
}
function Q1(t, r, i, l, a, c, f, p) {
  let { affectsX: h, affectsY: g } = r;
  const { isHorizontal: m, isVertical: v } = r, y = m && v, { xSnapped: x, ySnapped: _ } = i, { minWidth: M, maxWidth: E, minHeight: C, maxHeight: L } = l, { x: S, y: P, width: V, height: D, aspectRatio: j } = t;
  let Y = Math.floor(m ? x - t.pointerX : 0), I = Math.floor(v ? _ - t.pointerY : 0);
  const K = V + (h ? -Y : Y), Z = D + (g ? -I : I), ee = -c[0] * V, J = -c[1] * D;
  let N = Js(K, M, E), A = Js(Z, C, L);
  if (f) {
    let R = 0, H = 0;
    h && Y < 0 ? R = Fn(S + Y + ee, f[0][0]) : !h && Y > 0 && (R = Vn(S + K + ee, f[1][0])), g && I < 0 ? H = Fn(P + I + J, f[0][1]) : !g && I > 0 && (H = Vn(P + Z + J, f[1][1])), N = Math.max(N, R), A = Math.max(A, H);
  }
  if (p) {
    let R = 0, H = 0;
    h && Y > 0 ? R = Vn(S + Y, p[0][0]) : !h && Y < 0 && (R = Fn(S + K, p[1][0])), g && I > 0 ? H = Vn(P + I, p[0][1]) : !g && I < 0 && (H = Fn(P + Z, p[1][1])), N = Math.max(N, R), A = Math.max(A, H);
  }
  if (a) {
    if (m) {
      const R = Js(K / j, C, L) * j;
      if (N = Math.max(N, R), f) {
        let H = 0;
        !h && !g || h && !g && y ? H = Vn(P + J + K / j, f[1][1]) * j : H = Fn(P + J + (h ? Y : -Y) / j, f[0][1]) * j, N = Math.max(N, H);
      }
      if (p) {
        let H = 0;
        !h && !g || h && !g && y ? H = Fn(P + K / j, p[1][1]) * j : H = Vn(P + (h ? Y : -Y) / j, p[0][1]) * j, N = Math.max(N, H);
      }
    }
    if (v) {
      const R = Js(Z * j, M, E) / j;
      if (A = Math.max(A, R), f) {
        let H = 0;
        !h && !g || g && !h && y ? H = Vn(S + Z * j + ee, f[1][0]) / j : H = Fn(S + (g ? I : -I) * j + ee, f[0][0]) / j, A = Math.max(A, H);
      }
      if (p) {
        let H = 0;
        !h && !g || g && !h && y ? H = Fn(S + Z * j, p[1][0]) / j : H = Vn(S + (g ? I : -I) * j, p[0][0]) / j, A = Math.max(A, H);
      }
    }
  }
  I = I + (I < 0 ? A : -A), Y = Y + (Y < 0 ? N : -N), a && (y ? K > Z * j ? I = (Wp(h, g) ? -Y : Y) / j : Y = (Wp(h, g) ? -I : I) * j : m ? (I = Y / j, g = h) : (Y = I * j, h = g));
  const O = h ? S + Y : S, B = g ? P + I : P;
  return {
    width: V + (h ? -Y : Y),
    height: D + (g ? -I : I),
    x: c[0] * Y * (h ? -1 : 1) + O,
    y: c[1] * I * (g ? -1 : 1) + B
  };
}
const Ug = { width: 0, height: 0, x: 0, y: 0 }, K1 = {
  ...Ug,
  pointerX: 0,
  pointerY: 0,
  aspectRatio: 1
};
function G1(t, r, i) {
  const l = r.position.x + t.position.x, a = r.position.y + t.position.y, c = t.measured.width ?? 0, f = t.measured.height ?? 0, p = i[0] * c, h = i[1] * f;
  return [
    [l - p, a - h],
    [l + c - p, a + f - h]
  ];
}
function q1({ domNode: t, nodeId: r, getStoreItems: i, onChange: l, onEnd: a }) {
  const c = kt(t);
  let f = {
    controlDirection: Up("bottom-right"),
    boundaries: {
      minWidth: 0,
      minHeight: 0,
      maxWidth: Number.MAX_VALUE,
      maxHeight: Number.MAX_VALUE
    },
    resizeDirection: void 0,
    keepAspectRatio: !1
  };
  function p({ controlPosition: g, boundaries: m, keepAspectRatio: v, resizeDirection: y, onResizeStart: x, onResize: _, onResizeEnd: M, shouldResize: E }) {
    let C = { ...Ug }, L = { ...K1 };
    f = {
      boundaries: m,
      resizeDirection: y,
      keepAspectRatio: v,
      controlDirection: Up(g)
    };
    let S, P = null, V = [], D, j, Y;
    const I = Bh().on("start", (K) => {
      const { nodeLookup: Z, transform: ee, snapGrid: J, snapToGrid: N, nodeOrigin: A, paneDomNode: O } = i();
      if (S = Z.get(r), !S)
        return;
      P = O?.getBoundingClientRect() ?? null;
      const { xSnapped: B, ySnapped: R } = di(K.sourceEvent, {
        transform: ee,
        snapGrid: J,
        snapToGrid: N,
        containerBounds: P
      });
      C = {
        width: S.measured.width ?? 0,
        height: S.measured.height ?? 0,
        x: S.position.x ?? 0,
        y: S.position.y ?? 0
      }, L = {
        ...C,
        pointerX: B,
        pointerY: R,
        aspectRatio: C.width / C.height
      }, D = void 0, j = Sr(S.extent) ? S.extent : void 0, S.parentId && (S.extent === "parent" || S.expandParent) && (D = Z.get(S.parentId)), D && S.extent === "parent" && (j = [
        [0, 0],
        [D.measured.width, D.measured.height]
      ]), V = [], Y = void 0;
      for (const [H, U] of Z)
        if (U.parentId === r && (V.push({
          id: H,
          position: { ...U.position },
          extent: U.extent
        }), U.extent === "parent" || U.expandParent)) {
          const k = G1(U, S, U.origin ?? A);
          Y ? Y = [
            [Math.min(k[0][0], Y[0][0]), Math.min(k[0][1], Y[0][1])],
            [Math.max(k[1][0], Y[1][0]), Math.max(k[1][1], Y[1][1])]
          ] : Y = k;
        }
      x?.(K, { ...C });
    }).on("drag", (K) => {
      const { transform: Z, snapGrid: ee, snapToGrid: J, nodeOrigin: N } = i(), A = di(K.sourceEvent, {
        transform: Z,
        snapGrid: ee,
        snapToGrid: J,
        containerBounds: P
      }), O = [];
      if (!S)
        return;
      const { x: B, y: R, width: H, height: U } = C, k = {}, $ = S.origin ?? N, { width: ie, height: re, x: ae, y: ce } = Q1(L, f.controlDirection, A, f.boundaries, f.keepAspectRatio, $, j, Y), ue = ie !== H, q = re !== U, le = ae !== B && ue, ve = ce !== R && q;
      if (!le && !ve && !ue && !q)
        return;
      const Se = {
        prevValues: { ...C },
        startX: L.x,
        startY: L.y,
        childNodes: V.map((Ce) => ({
          ...Ce,
          position: { ...Ce.position }
        }))
      };
      if ((le || ve || $[0] === 1 || $[1] === 1) && (k.x = le ? ae : C.x, k.y = ve ? ce : C.y, C.x = k.x, C.y = k.y, V.length > 0)) {
        const Ce = ae - B, ze = ce - R;
        for (const Ve of V)
          Ve.position = {
            x: Ve.position.x - Ce + $[0] * (ie - H),
            y: Ve.position.y - ze + $[1] * (re - U)
          }, O.push(Ve);
      }
      if ((ue || q) && (k.width = ue && (!f.resizeDirection || f.resizeDirection === "horizontal") ? ie : C.width, k.height = q && (!f.resizeDirection || f.resizeDirection === "vertical") ? re : C.height, C.width = k.width, C.height = k.height), D && S.expandParent) {
        const Ce = $[0] * (k.width ?? 0);
        k.x && k.x < Ce && (C.x = Ce, L.x = L.x - (k.x - Ce));
        const ze = $[1] * (k.height ?? 0);
        k.y && k.y < ze && (C.y = ze, L.y = L.y - (k.y - ze));
      }
      const me = Z1({
        width: C.width,
        prevWidth: H,
        height: C.height,
        prevHeight: U,
        affectsX: f.controlDirection.affectsX,
        affectsY: f.controlDirection.affectsY
      }), ye = { ...C, direction: me };
      if (E?.(K, ye) === !1) {
        C = Se.prevValues, L.x = Se.startX, L.y = Se.startY, V.forEach((Ce, ze) => {
          Ce.position = Se.childNodes[ze].position;
        });
        return;
      }
      _?.(K, ye), l(k, O);
    }).on("end", (K) => {
      M?.(K, { ...C }), a?.({ ...C });
    });
    c.call(I);
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
var Xp;
function J1() {
  if (Xp) return Wu;
  Xp = 1;
  var t = Si();
  function r(v, y) {
    return v === y && (v !== 0 || 1 / v === 1 / y) || v !== v && y !== y;
  }
  var i = typeof Object.is == "function" ? Object.is : r, l = t.useState, a = t.useEffect, c = t.useLayoutEffect, f = t.useDebugValue;
  function p(v, y) {
    var x = y(), _ = l({ inst: { value: x, getSnapshot: y } }), M = _[0].inst, E = _[1];
    return c(
      function() {
        M.value = x, M.getSnapshot = y, h(M) && E({ inst: M });
      },
      [v, x, y]
    ), a(
      function() {
        return h(M) && E({ inst: M }), v(function() {
          h(M) && E({ inst: M });
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
var Yp;
function e_() {
  return Yp || (Yp = 1, Uu.exports = J1()), Uu.exports;
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
var Zp;
function t_() {
  if (Zp) return Bu;
  Zp = 1;
  var t = Si(), r = e_();
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
        function C(D) {
          if (!L) {
            if (L = !0, S = D, D = y(D), x !== void 0 && M.hasValue) {
              var j = M.value;
              if (x(j, D))
                return P = j;
            }
            return P = D;
          }
          if (j = P, l(S, D)) return j;
          var Y = y(D);
          return x !== void 0 && x(j, Y) ? (S = D, j) : (S = D, P = Y);
        }
        var L = !1, S, P, V = v === void 0 ? null : v;
        return [
          function() {
            return C(m());
          },
          V === null ? void 0 : function() {
            return C(V());
          }
        ];
      },
      [m, v, y, x]
    );
    var E = a(g, _[0], _[1]);
    return f(
      function() {
        M.hasValue = !0, M.value = E;
      },
      [E]
    ), h(E), E;
  }, Bu;
}
var Qp;
function n_() {
  return Qp || (Qp = 1, Vu.exports = t_()), Vu.exports;
}
var r_ = n_();
const o_ = /* @__PURE__ */ Mh(r_), i_ = {}, Kp = (t) => {
  let r;
  const i = /* @__PURE__ */ new Set(), l = (m, v) => {
    const y = typeof m == "function" ? m(r) : m;
    if (!Object.is(y, r)) {
      const x = r;
      r = v ?? (typeof y != "object" || y === null) ? y : Object.assign({}, r, y), i.forEach((_) => _(r, x));
    }
  }, a = () => r, h = { setState: l, getState: a, getInitialState: () => g, subscribe: (m) => (i.add(m), () => i.delete(m)), destroy: () => {
    (i_ ? "production" : void 0) !== "production" && console.warn(
      "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
    ), i.clear();
  } }, g = r = t(l, a, h);
  return h;
}, s_ = (t) => t ? Kp(t) : Kp, { useDebugValue: l_ } = my, { useSyncExternalStoreWithSelector: a_ } = o_, u_ = (t) => t;
function Wg(t, r = u_, i) {
  const l = a_(
    t.subscribe,
    t.getState,
    t.getServerState || t.getInitialState,
    r,
    i
  );
  return l_(l), l;
}
const Gp = (t, r) => {
  const i = s_(t), l = (a, c = r) => Wg(i, a, c);
  return Object.assign(l, i), l;
}, c_ = (t, r) => t ? Gp(t, r) : Gp;
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
zh();
const Pl = Q.createContext(null), f_ = Pl.Provider, Xg = Ut.error001("react");
function Me(t, r) {
  const i = Q.useContext(Pl);
  if (i === null)
    throw new Error(Xg);
  return Wg(i, t, r);
}
function De() {
  const t = Q.useContext(Pl);
  if (t === null)
    throw new Error(Xg);
  return Q.useMemo(() => ({
    getState: t.getState,
    setState: t.setState,
    subscribe: t.subscribe
  }), [t]);
}
const qp = { display: "none" }, d_ = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  border: 0,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0px, 0px, 0px, 0px)",
  clipPath: "inset(100%)"
}, Yg = "react-flow__node-desc", Zg = "react-flow__edge-desc", p_ = "react-flow__aria-live", h_ = (t) => t.ariaLiveMessage, g_ = (t) => t.ariaLabelConfig;
function m_({ rfId: t }) {
  const r = Me(h_);
  return F.jsx("div", { id: `${p_}-${t}`, "aria-live": "assertive", "aria-atomic": "true", style: d_, children: r });
}
function y_({ rfId: t, disableKeyboardA11y: r }) {
  const i = Me(g_);
  return F.jsxs(F.Fragment, { children: [F.jsx("div", { id: `${Yg}-${t}`, style: qp, children: r ? i["node.a11yDescription.default"] : i["node.a11yDescription.keyboardDisabled"] }), F.jsx("div", { id: `${Zg}-${t}`, style: qp, children: i["edge.a11yDescription.default"] }), !r && F.jsx(m_, { rfId: t })] });
}
const Il = Q.forwardRef(({ position: t = "top-left", children: r, className: i, style: l, ...a }, c) => {
  const f = `${t}`.split("-");
  return F.jsx("div", { className: We(["react-flow__panel", i, ...f]), style: l, ref: c, ...a, children: r });
});
Il.displayName = "Panel";
const Jp = "https://reactflow.dev?utm_source=attribution";
function v_({ proOptions: t, position: r = "bottom-right" }) {
  return Q.useEffect(() => {
  }, []), t?.hideAttribution ? null : F.jsx(Il, { position: r, className: "react-flow__attribution", "data-message": `Please only hide this attribution when you are subscribed to React Flow Pro: ${Jp}`, children: F.jsx("a", { href: Jp, target: "_blank", rel: "noopener noreferrer", "aria-label": "React Flow attribution", children: "React Flow" }) });
}
const w_ = (t) => {
  const r = [], i = [];
  for (const [, l] of t.nodeLookup)
    l.selected && r.push(l.internals.userNode);
  for (const [, l] of t.edgeLookup)
    l.selected && i.push(l);
  return { selectedNodes: r, selectedEdges: i };
}, el = (t) => t.id;
function x_(t, r) {
  return je(t.selectedNodes.map(el), r.selectedNodes.map(el)) && je(t.selectedEdges.map(el), r.selectedEdges.map(el));
}
function __({ onSelectionChange: t }) {
  const r = De(), { selectedNodes: i, selectedEdges: l } = Me(w_, x_);
  return Q.useEffect(() => {
    const a = { nodes: i, edges: l };
    t?.(a), r.getState().onSelectionChangeHandlers.forEach((c) => c(a));
  }, [i, l, t]), null;
}
const S_ = (t) => !!t.onSelectionChangeHandlers;
function k_({ onSelectionChange: t }) {
  const r = Me(S_);
  return t || r ? F.jsx(__, { onSelectionChange: t }) : null;
}
const Qg = [0, 0], E_ = { x: 0, y: 0, zoom: 1 }, C_ = [
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
], eh = [...C_, "rfId"], N_ = (t) => ({
  setNodes: t.setNodes,
  setEdges: t.setEdges,
  setMinZoom: t.setMinZoom,
  setMaxZoom: t.setMaxZoom,
  setTranslateExtent: t.setTranslateExtent,
  setNodeExtent: t.setNodeExtent,
  reset: t.reset,
  setDefaultNodesAndEdges: t.setDefaultNodesAndEdges
}), th = {
  /*
   * these are values that are also passed directly to other components
   * than the StoreUpdater. We can reduce the number of setStore calls
   * by setting the same values here as prev fields.
   */
  translateExtent: yi,
  nodeOrigin: Qg,
  minZoom: 0.5,
  maxZoom: 2,
  elementsSelectable: !0,
  noPanClassName: "nopan",
  rfId: "1"
};
function M_(t) {
  const { setNodes: r, setEdges: i, setMinZoom: l, setMaxZoom: a, setTranslateExtent: c, setNodeExtent: f, reset: p, setDefaultNodesAndEdges: h } = Me(N_, je), g = De();
  Q.useEffect(() => (h(t.defaultNodes, t.defaultEdges), () => {
    m.current = th, p();
  }), []);
  const m = Q.useRef(th);
  return Q.useEffect(
    () => {
      for (const v of eh) {
        const y = t[v], x = m.current[v];
        y !== x && (typeof t[v] > "u" || (v === "nodes" ? r(y) : v === "edges" ? i(y) : v === "minZoom" ? l(y) : v === "maxZoom" ? a(y) : v === "translateExtent" ? c(y) : v === "nodeExtent" ? f(y) : v === "ariaLabelConfig" ? g.setState({ ariaLabelConfig: c1(y) }) : v === "fitView" ? g.setState({ fitViewQueued: y }) : v === "fitViewOptions" ? g.setState({ fitViewOptions: y }) : g.setState({ [v]: y })));
      }
      m.current = t;
    },
    // Only re-run the effect if one of the fields we track changes
    eh.map((v) => t[v])
  ), null;
}
function nh() {
  return typeof window > "u" || !window.matchMedia ? null : window.matchMedia("(prefers-color-scheme: dark)");
}
function z_(t) {
  const [r, i] = Q.useState(t === "system" ? null : t);
  return Q.useEffect(() => {
    if (t !== "system") {
      i(t);
      return;
    }
    const l = nh(), a = () => i(l?.matches ? "dark" : "light");
    return a(), l?.addEventListener("change", a), () => {
      l?.removeEventListener("change", a);
    };
  }, [t]), r !== null ? r : nh()?.matches ? "dark" : "light";
}
const rh = typeof document < "u" ? document : null;
function _i(t = null, r = { target: rh, actInsideInputWithModifier: !0 }) {
  const [i, l] = Q.useState(!1), a = Q.useRef(!1), c = Q.useRef(/* @__PURE__ */ new Set([])), [f, p] = Q.useMemo(() => {
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
  return Q.useEffect(() => {
    const h = r?.target ?? rh, g = r?.actInsideInputWithModifier ?? !0;
    if (t !== null) {
      const m = (x) => {
        if (a.current = x.ctrlKey || x.metaKey || x.shiftKey || x.altKey, (!a.current || a.current && !g) && zg(x))
          return !1;
        const M = ih(x.code, p);
        if (c.current.add(x[M]), oh(f, c.current, !1)) {
          const E = x.composedPath?.()?.[0] || x.target, C = E?.nodeName === "BUTTON" || E?.nodeName === "A";
          r.preventDefault !== !1 && (a.current || !C) && x.preventDefault(), l(!0);
        }
      }, v = (x) => {
        const _ = ih(x.code, p);
        oh(f, c.current, !0) ? (l(!1), c.current.clear()) : c.current.delete(x[_]), x.key === "Meta" && c.current.clear(), a.current = !1;
      }, y = () => {
        c.current.clear(), l(!1);
      };
      return h?.addEventListener("keydown", m), h?.addEventListener("keyup", v), window.addEventListener("blur", y), window.addEventListener("contextmenu", y), () => {
        h?.removeEventListener("keydown", m), h?.removeEventListener("keyup", v), window.removeEventListener("blur", y), window.removeEventListener("contextmenu", y);
      };
    }
  }, [t, l]), i;
}
function oh(t, r, i) {
  return t.filter((l) => i || l.length === r.size).some((l) => l.every((a) => r.has(a)));
}
function ih(t, r) {
  return r.includes(t) ? "code" : "key";
}
const P_ = () => {
  const t = De();
  return Q.useMemo(() => ({
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
function Kg(t, r) {
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
      I_(h, p);
    i.push(p);
  }
  return a.length && a.forEach((c) => {
    c.index !== void 0 ? i.splice(c.index, 0, { ...c.item }) : i.push({ ...c.item });
  }), i;
}
function I_(t, r) {
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
function Gg(t, r) {
  return Kg(t, r);
}
function qg(t, r) {
  return Kg(t, r);
}
function pr(t, r) {
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
    !(a.selected === void 0 && !c) && a.selected !== c && i.push(pr(a.id, c));
  }
  return i;
}
function sh({ items: t = [], lookup: r }) {
  const i = [], l = new Map(t.map((a) => [a.id, a]));
  for (const [a, c] of t.entries()) {
    const f = r.get(c.id), p = f?.internals?.userNode ?? f;
    p !== void 0 && p !== c && i.push({ id: c.id, item: c, type: "replace" }), p === void 0 && i.push({ item: c, type: "add", index: a });
  }
  for (const [a] of r)
    l.get(a) === void 0 && i.push({ id: a, type: "remove" });
  return i;
}
function lh(t) {
  return {
    id: t.id,
    type: "remove"
  };
}
const T_ = kg();
function R_(t, r, i = {}) {
  return m1(t, r, {
    ...i,
    onError: i.onError ?? T_
  });
}
const ah = (t) => t1(t), D_ = (t) => vg(t);
function Jg(t) {
  return Q.forwardRef(t);
}
const em = typeof window < "u" ? Q.useLayoutEffect : Q.useEffect;
function uh(t) {
  const [r, i] = Q.useState(BigInt(0)), [l] = Q.useState(() => b_(() => i((a) => a + BigInt(1))));
  return em(() => {
    const a = l.get();
    a.length && (t(a), l.reset());
  }, [r]), l;
}
function b_(t) {
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
const tm = Q.createContext(null);
function L_({ children: t }) {
  const r = De(), i = Q.useCallback((p) => {
    const { nodes: h = [], setNodes: g, hasDefaultNodes: m, onNodesChange: v, nodeLookup: y, fitViewQueued: x, onNodesChangeMiddlewareMap: _ } = r.getState();
    let M = h;
    for (const C of p)
      M = typeof C == "function" ? C(M) : C;
    let E = sh({
      items: M,
      lookup: y
    });
    for (const C of _.values())
      E = C(E);
    m && g(M), E.length > 0 ? v?.(E) : x && window.requestAnimationFrame(() => {
      const { fitViewQueued: C, nodes: L, setNodes: S } = r.getState();
      C && S(L);
    });
  }, []), l = uh(i), a = Q.useCallback((p) => {
    const { edges: h = [], setEdges: g, hasDefaultEdges: m, onEdgesChange: v, edgeLookup: y } = r.getState();
    let x = h;
    for (const _ of p)
      x = typeof _ == "function" ? _(x) : _;
    m ? g(x) : v && v(sh({
      items: x,
      lookup: y
    }));
  }, []), c = uh(a), f = Q.useMemo(() => ({ nodeQueue: l, edgeQueue: c }), []);
  return F.jsx(tm.Provider, { value: f, children: t });
}
function A_() {
  const t = Q.useContext(tm);
  if (!t)
    throw new Error("useBatchContext must be used within a BatchProvider");
  return t;
}
const $_ = (t) => !!t.panZoom;
function Tl() {
  const t = P_(), r = De(), i = A_(), l = Me($_), a = Q.useMemo(() => {
    const c = (v) => r.getState().nodeLookup.get(v), f = (v) => {
      i.nodeQueue.push(v);
    }, p = (v) => {
      i.edgeQueue.push(v);
    }, h = (v) => {
      const { nodeLookup: y, nodeOrigin: x } = r.getState(), _ = ah(v) ? v : y.get(v.id), M = _.parentId ? Cg(_.position, _.measured, _.parentId, y, x) : _.position, E = {
        ..._,
        position: M,
        width: _.measured?.width ?? _.width,
        height: _.measured?.height ?? _.height
      };
      return wi(E, _.parentId ? void 0 : x);
    }, g = (v, y, x = { replace: !1 }) => {
      f((_) => _.map((M) => {
        if (M.id === v) {
          const E = typeof y == "function" ? y(M) : y;
          return x.replace && ah(E) ? E : { ...M, ...E };
        }
        return M;
      }));
    }, m = (v, y, x = { replace: !1 }) => {
      p((_) => _.map((M) => {
        if (M.id === v) {
          const E = typeof y == "function" ? y(M) : y;
          return x.replace && D_(E) ? E : { ...M, ...E };
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
        const { nodes: v = [], edges: y = [], transform: x } = r.getState(), [_, M, E] = x;
        return {
          nodes: v.map((C) => ({ ...C })),
          edges: y.map((C) => ({ ...C })),
          viewport: {
            x: _,
            y: M,
            zoom: E
          }
        };
      },
      deleteElements: async ({ nodes: v = [], edges: y = [] }) => {
        const { nodes: x, edges: _, onNodesDelete: M, onEdgesDelete: E, triggerNodeChanges: C, triggerEdgeChanges: L, onDelete: S, onBeforeDelete: P } = r.getState(), { nodes: V, edges: D } = await s1({
          nodesToRemove: v,
          edgesToRemove: y,
          nodes: x,
          edges: _,
          onBeforeDelete: P
        }), j = D.length > 0, Y = V.length > 0;
        if (j) {
          const I = D.map(lh);
          E?.(D), L(I);
        }
        if (Y) {
          const I = V.map(lh);
          M?.(V), C(I);
        }
        return (Y || j) && S?.({ nodes: V, edges: D }), { deletedNodes: V, deletedEdges: D };
      },
      /**
       * Partial is defined as "the 2 nodes/areas are intersecting partially".
       * If a is contained in b or b is contained in a, they are both
       * considered fully intersecting.
       */
      getIntersectingNodes: (v, y = !0, x) => {
        const _ = Dp(v), M = _ ? v : h(v), E = x !== void 0;
        if (!M)
          return [];
        const { nodeOrigin: C } = r.getState();
        return (x || r.getState().nodes).filter((L) => {
          const S = r.getState().nodeLookup.get(L.id);
          if (S && !_ && (L.id === v.id || !S.internals.positionAbsolute))
            return !1;
          const P = wi(E ? L : S, C), V = yl(P, M);
          return y && V > 0 || V >= P.width * P.height || V >= M.width * M.height;
        });
      },
      isNodeIntersecting: (v, y, x = !0) => {
        const M = Dp(v) ? v : h(v);
        if (!M)
          return !1;
        const E = yl(M, y);
        return x && E > 0 || E >= y.width * y.height || E >= M.width * M.height;
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
        return n1(v, { nodeLookup: y, nodeOrigin: x });
      },
      getHandleConnections: ({ type: v, id: y, nodeId: x }) => Array.from(r.getState().connectionLookup.get(`${x}-${v}${y ? `-${y}` : ""}`)?.values() ?? []),
      getNodeConnections: ({ type: v, handleId: y, nodeId: x }) => Array.from(r.getState().connectionLookup.get(`${x}${v ? y ? `-${v}-${y}` : `-${v}` : ""}`)?.values() ?? []),
      fitView: async (v) => {
        const y = r.getState().fitViewResolver ?? u1();
        return r.setState({ fitViewQueued: !0, fitViewOptions: v, fitViewResolver: y }), i.nodeQueue.push((x) => [...x]), y.promise;
      }
    };
  }, []);
  return Q.useMemo(() => ({
    ...a,
    ...t,
    viewportInitialized: l
  }), [l]);
}
const ch = (t) => t.selected, O_ = typeof window < "u" ? window : void 0;
function H_({ deleteKeyCode: t, multiSelectionKeyCode: r }) {
  const i = De(), { deleteElements: l } = Tl(), a = _i(t, { actInsideInputWithModifier: !1 }), c = _i(r, { target: O_ });
  Q.useEffect(() => {
    if (a) {
      const { edges: f, nodes: p } = i.getState();
      l({ nodes: p.filter(ch), edges: f.filter(ch) }), i.setState({ nodesSelectionActive: !1 });
    }
  }, [a]), Q.useEffect(() => {
    i.setState({ multiSelectionActive: c });
  }, [c]);
}
function j_(t) {
  const r = De();
  Q.useEffect(() => {
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
}, F_ = (t) => ({
  userSelectionActive: t.userSelectionActive,
  lib: t.lib,
  connectionInProgress: t.connection.inProgress
});
function V_({ onPaneContextMenu: t, zoomOnScroll: r = !0, zoomOnPinch: i = !0, panOnScroll: l = !1, panActivationKeyPressed: a, panOnScrollSpeed: c = 0.5, panOnScrollMode: f = yr.Free, zoomOnDoubleClick: p = !0, panOnDrag: h = !0, defaultViewport: g, translateExtent: m, minZoom: v, maxZoom: y, zoomActivationKeyCode: x, preventScrolling: _ = !0, children: M, noWheelClassName: E, noPanClassName: C, onViewportChange: L, isControlledViewport: S, paneClickDistance: P, selectionOnDrag: V }) {
  const D = De(), j = Q.useRef(null), { userSelectionActive: Y, lib: I, connectionInProgress: K } = Me(F_, je), Z = _i(x), ee = Q.useRef();
  j_(j);
  const J = Q.useCallback((N) => {
    L?.({ x: N[0], y: N[1], zoom: N[2] }), S || D.setState({ transform: N });
  }, [L, S]);
  return Q.useEffect(() => {
    if (j.current) {
      ee.current = Y1({
        domNode: j.current,
        minZoom: v,
        maxZoom: y,
        translateExtent: m,
        viewport: g,
        onDraggingChange: (B) => D.setState((R) => R.paneDragging === B ? R : { paneDragging: B }),
        onPanZoomStart: (B, R) => {
          const { onViewportChangeStart: H, onMoveStart: U } = D.getState();
          U?.(B, R), H?.(R);
        },
        onPanZoom: (B, R) => {
          const { onViewportChange: H, onMove: U } = D.getState();
          U?.(B, R), H?.(R);
        },
        onPanZoomEnd: (B, R) => {
          const { onViewportChangeEnd: H, onMoveEnd: U } = D.getState();
          U?.(B, R), H?.(R);
        }
      });
      const { x: N, y: A, zoom: O } = ee.current.getViewport();
      return D.setState({
        panZoom: ee.current,
        transform: [N, A, O],
        domNode: j.current.closest(".react-flow")
      }), () => {
        ee.current?.destroy();
      };
    }
  }, []), Q.useEffect(() => {
    ee.current?.update({
      onPaneContextMenu: t,
      zoomOnScroll: r,
      zoomOnPinch: i,
      panOnScroll: l,
      panActivationKeyPressed: a,
      panOnScrollSpeed: c,
      panOnScrollMode: f,
      zoomOnDoubleClick: p,
      panOnDrag: h,
      zoomActivationKeyPressed: Z,
      preventScrolling: _,
      noPanClassName: C,
      userSelectionActive: Y,
      noWheelClassName: E,
      lib: I,
      onTransformChange: J,
      connectionInProgress: K,
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
    Z,
    _,
    C,
    Y,
    E,
    I,
    J,
    K,
    V,
    P
  ]), F.jsx("div", { className: "react-flow__renderer", ref: j, style: Rl, children: M });
}
const B_ = (t) => ({
  userSelectionActive: t.userSelectionActive,
  userSelectionRect: t.userSelectionRect
});
function U_() {
  const { userSelectionActive: t, userSelectionRect: r } = Me(B_, je);
  return t && r ? F.jsx("div", { className: "react-flow__selection react-flow__container", style: {
    width: r.width,
    height: r.height,
    transform: `translate(${r.x}px, ${r.y}px)`
  } }) : null;
}
const Xu = (t, r) => (i) => {
  i.target === r.current && t?.(i);
}, W_ = (t) => ({
  userSelectionActive: t.userSelectionActive,
  elementsSelectable: t.elementsSelectable,
  dragging: t.paneDragging,
  panBy: t.panBy,
  autoPanSpeed: t.autoPanSpeed
});
function X_({ isSelecting: t, selectionKeyPressed: r, selectionMode: i = vi.Full, panOnDrag: l, autoPanOnSelection: a, paneClickDistance: c, selectionOnDrag: f, onSelectionStart: p, onSelectionEnd: h, onPaneClick: g, onPaneContextMenu: m, onPaneScroll: v, onPaneMouseEnter: y, onPaneMouseMove: x, onPaneMouseLeave: _, children: M }) {
  const E = Q.useRef(0), C = De(), { userSelectionActive: L, elementsSelectable: S, dragging: P, panBy: V, autoPanSpeed: D } = Me(W_, je), j = S && (t || L), Y = Q.useRef(null), I = Q.useRef(), K = Q.useRef(/* @__PURE__ */ new Set()), Z = Q.useRef(/* @__PURE__ */ new Set()), ee = Q.useRef(!1), J = Q.useRef(!1), N = Q.useRef({ x: 0, y: 0 }), A = Q.useRef(!1), O = (q) => {
    if (J.current || ee.current || C.getState().connection.inProgress) {
      J.current = !1, ee.current = !1;
      return;
    }
    const { connectionClickStartHandle: le, connection: ve, onClickConnectEnd: Se, resetSelectedElements: me } = C.getState();
    if (le) {
      const ye = structuredClone(ve);
      delete ye.inProgress, ye.toPosition = ye.toHandle ? ye.toHandle.position : null, Se?.(q.nativeEvent, ye), C.setState({ connectionClickStartHandle: null });
    }
    g?.(q), me(), C.setState({ nodesSelectionActive: !1 });
  }, B = (q) => {
    if (Array.isArray(l) && l?.includes(2)) {
      q.preventDefault();
      return;
    }
    m?.(q);
  }, R = v ? (q) => v(q) : void 0, H = (q) => {
    J.current && (q.stopPropagation(), J.current = !1);
  }, U = (q) => {
    if (q.pointerType === "touch" && l !== !1 && !r)
      return;
    const { domNode: le, transform: ve } = C.getState();
    if (I.current = le?.getBoundingClientRect(), !I.current)
      return;
    const Se = q.target === Y.current;
    if (!Se && !!q.target.closest(".nokey") || !t || !(f && Se || r) || q.button !== 0 || !q.isPrimary)
      return;
    q.target?.setPointerCapture?.(q.pointerId), J.current = !1;
    const { x: Ee, y: Ce } = Bt(q.nativeEvent, I.current), ze = zi({ x: Ee, y: Ce }, ve);
    C.setState({
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
    const { userSelectionRect: ve } = C.getState();
    if (!ve)
      return;
    const { transform: Se, nodeLookup: me, edgeLookup: ye, connectionLookup: Ee, triggerNodeChanges: Ce, triggerEdgeChanges: ze, defaultEdgeOptions: Ve } = C.getState(), Ct = { x: ve.startX, y: ve.startY }, { x: at, y: et } = ho(Ct, Se), tt = {
      startX: Ct.x,
      startY: Ct.y,
      x: q < at ? q : at,
      y: le < et ? le : et,
      width: Math.abs(q - at),
      height: Math.abs(le - et)
    }, on = K.current, Yt = Z.current;
    K.current = new Set(Sc(me, tt, Se, i === vi.Partial, !0).map((ut) => ut.id)), Z.current = /* @__PURE__ */ new Set();
    const Zt = Ve?.selectable ?? !0;
    for (const ut of K.current) {
      const Nt = Ee.get(ut);
      if (Nt)
        for (const { edgeId: mt } of Nt.values()) {
          const Mt = ye.get(mt);
          Mt && (Mt.selectable ?? Zt) && Z.current.add(mt);
        }
    }
    if (!bp(on, K.current)) {
      const ut = no(me, K.current);
      Ce(ut);
    }
    if (!bp(Yt, Z.current)) {
      const ut = no(ye, Z.current);
      ze(ut);
    }
    C.setState({
      userSelectionRect: tt,
      userSelectionActive: !0,
      nodesSelectionActive: !1
    });
  }
  function $() {
    if (!a || !I.current)
      return;
    const [q, le] = kc(N.current, I.current, D);
    V({ x: q, y: le }).then((ve) => {
      if (!J.current || !ve) {
        E.current = requestAnimationFrame($);
        return;
      }
      const { x: Se, y: me } = N.current;
      k(Se, me), E.current = requestAnimationFrame($);
    });
  }
  const ie = () => {
    cancelAnimationFrame(E.current), E.current = 0, A.current = !1;
  };
  Q.useEffect(() => () => ie(), []);
  const re = (q) => {
    const { userSelectionRect: le, transform: ve, resetSelectedElements: Se } = C.getState();
    if (!I.current || !le)
      return;
    const { x: me, y: ye } = Bt(q.nativeEvent, I.current);
    N.current = { x: me, y: ye };
    const Ee = ho({ x: le.startX, y: le.startY }, ve);
    if (!J.current) {
      const Ce = r ? 0 : c;
      if (Math.hypot(me - Ee.x, ye - Ee.y) <= Ce)
        return;
      Se(), p?.(q);
    }
    J.current = !0, A.current || ($(), A.current = !0), k(me, ye);
  }, ae = (q) => {
    if (!j) {
      q.target === Y.current && C.getState().connection.inProgress && (ee.current = !0);
      return;
    }
    q.button === 0 && (q.target?.releasePointerCapture?.(q.pointerId), !L && q.target === Y.current && C.getState().userSelectionRect && O?.(q), C.setState({
      userSelectionActive: !1,
      userSelectionRect: null
    }), J.current && (h?.(q), C.setState({
      nodesSelectionActive: K.current.size > 0
    })), ie());
  }, ce = (q) => {
    q.target?.releasePointerCapture?.(q.pointerId), ie();
  }, ue = l === !0 || Array.isArray(l) && l.includes(0);
  return F.jsxs("div", { className: We(["react-flow__pane", { draggable: ue, dragging: P, selection: t }]), onClick: j ? void 0 : Xu(O, Y), onContextMenu: Xu(B, Y), onWheel: Xu(R, Y), onPointerEnter: j ? void 0 : y, onPointerMove: j ? re : x, onPointerUp: ae, onPointerCancel: j ? ce : void 0, onPointerDownCapture: j ? U : void 0, onClickCapture: j ? H : void 0, onPointerLeave: _, ref: Y, style: Rl, children: [M, F.jsx(U_, {})] });
}
function ac({ id: t, store: r, unselect: i = !1, nodeRef: l }) {
  const { addSelectedNodes: a, unselectNodesAndEdges: c, multiSelectionActive: f, nodeLookup: p, onError: h } = r.getState(), g = p.get(t);
  if (!g) {
    h?.("012", Ut.error012(t));
    return;
  }
  r.setState({ nodesSelectionActive: !1 }), g.selected ? (i || g.selected && f) && (c({ nodes: [g], edges: [] }), requestAnimationFrame(() => l?.current?.blur())) : a([t]);
}
function nm({ nodeRef: t, disabled: r = !1, noDragClassName: i, handleSelector: l, nodeId: a, isSelectable: c, nodeClickDistance: f }) {
  const p = De(), [h, g] = Q.useState(!1), m = Q.useRef();
  return Q.useEffect(() => {
    if (!r)
      return m.current = D1({
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
  }, [r, p, t]), Q.useEffect(() => {
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
const Y_ = (t) => (r) => r.selected && (r.draggable || t && typeof r.draggable > "u");
function rm() {
  const t = De();
  return Q.useCallback((i) => {
    const { nodeExtent: l, snapToGrid: a, snapGrid: c, nodesDraggable: f, onError: p, updateNodePositions: h, nodeLookup: g, nodeOrigin: m } = t.getState(), v = /* @__PURE__ */ new Map(), y = Y_(f), x = a ? c[0] : 5, _ = a ? c[1] : 5, M = i.direction.x * x * i.factor, E = i.direction.y * _ * i.factor;
    for (const [, C] of g) {
      if (!y(C))
        continue;
      let L = {
        x: C.internals.positionAbsolute.x + M,
        y: C.internals.positionAbsolute.y + E
      };
      a && (L = Mi(L, c));
      const { position: S, positionAbsolute: P } = wg({
        nodeId: C.id,
        nextPosition: L,
        nodeLookup: g,
        nodeExtent: l,
        nodeOrigin: m,
        onError: p
      });
      C.position = S, C.internals.positionAbsolute = P, v.set(C.id, C);
    }
    h(v);
  }, []);
}
const Tc = Q.createContext(null), Z_ = Tc.Provider;
Tc.Consumer;
const om = () => Q.useContext(Tc), Q_ = (t) => ({
  connectOnClick: t.connectOnClick,
  noPanClassName: t.noPanClassName,
  rfId: t.rfId
}), im = Q.createContext(null);
function K_({ children: t }) {
  const r = Me(Q_, je);
  return F.jsx(im.Provider, { value: r, children: t });
}
function G_() {
  const t = Q.useContext(im);
  if (!t)
    throw new Error("useHandleConfig must be used within a HandleConfigProvider");
  return t;
}
const q_ = {
  connectingFrom: !1,
  connectingTo: !1,
  clickConnecting: !1,
  isPossibleEndHandle: !0,
  connectionInProcess: !1,
  clickConnectionInProcess: !1,
  valid: !1
}, J_ = (t, r, i) => (l) => {
  const { connectionClickStartHandle: a, connectionMode: c, connection: f } = l, { fromHandle: p, toHandle: h, isValid: g } = f;
  if (!p && !a)
    return q_;
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
function eS({ type: t = "source", position: r = we.Top, isValidConnection: i, isConnectable: l = !0, isConnectableStart: a = !0, isConnectableEnd: c = !0, id: f, onConnect: p, children: h, className: g, onMouseDown: m, onTouchStart: v, ...y }, x) {
  const _ = f || null, M = t === "target", E = De(), C = om(), { connectOnClick: L, noPanClassName: S, rfId: P } = G_(), { connectingFrom: V, connectingTo: D, clickConnecting: j, isPossibleEndHandle: Y, connectionInProcess: I, clickConnectionInProcess: K, valid: Z } = Me(J_(C, _, t), je);
  C || E.getState().onError?.("010", Ut.error010());
  const ee = (A) => {
    const { defaultEdgeOptions: O, onConnect: B, hasDefaultEdges: R } = E.getState(), H = {
      ...O,
      ...A
    };
    if (R) {
      const { edges: U, setEdges: k, onError: $ } = E.getState();
      k(R_(H, U, { onError: $ }));
    }
    B?.(H), p?.(H);
  }, J = (A) => {
    if (!C)
      return;
    const O = Pg(A.nativeEvent);
    if (a && (O && A.button === 0 || !O)) {
      const B = E.getState();
      lc.onPointerDown(A.nativeEvent, {
        handleDomNode: A.currentTarget,
        autoPanOnConnect: B.autoPanOnConnect,
        connectionMode: B.connectionMode,
        connectionRadius: B.connectionRadius,
        domNode: B.domNode,
        nodeLookup: B.nodeLookup,
        lib: B.lib,
        isTarget: M,
        handleId: _,
        nodeId: C,
        flowId: B.rfId,
        panBy: B.panBy,
        cancelConnection: B.cancelConnection,
        onConnectStart: B.onConnectStart,
        onConnectEnd: (...R) => E.getState().onConnectEnd?.(...R),
        updateConnection: B.updateConnection,
        onConnect: ee,
        isValidConnection: i || ((...R) => E.getState().isValidConnection?.(...R) ?? !0),
        getTransform: () => E.getState().transform,
        getFromHandle: () => E.getState().connection.fromHandle,
        autoPanSpeed: B.autoPanSpeed,
        dragThreshold: B.connectionDragThreshold
      });
    }
    O ? m?.(A) : v?.(A);
  }, N = (A) => {
    const { onClickConnectStart: O, onClickConnectEnd: B, connectionClickStartHandle: R, connectionMode: H, isValidConnection: U, lib: k, rfId: $, nodeLookup: ie, connection: re } = E.getState();
    if (!C || !R && !a)
      return;
    if (!R) {
      O?.(A.nativeEvent, { nodeId: C, handleId: _, handleType: t }), E.setState({ connectionClickStartHandle: { nodeId: C, type: t, id: _ } });
      return;
    }
    const ae = Mg(A.target), ce = i || U, { connection: ue, isValid: q } = lc.isValid(A.nativeEvent, {
      handle: {
        nodeId: C,
        id: _,
        type: t
      },
      connectionMode: H,
      fromNodeId: R.nodeId,
      fromHandleId: R.id || null,
      fromType: R.type,
      isValidConnection: ce,
      flowId: $,
      doc: ae,
      lib: k,
      nodeLookup: ie
    });
    q && ue && ee(ue);
    const le = structuredClone(re);
    delete le.inProgress, le.toPosition = le.toHandle ? le.toHandle.position : null, B?.(A, le), E.setState({ connectionClickStartHandle: null });
  };
  return F.jsx("div", { "data-handleid": _, "data-nodeid": C, "data-handlepos": r, "data-id": `${P}-${C}-${_}-${t}`, className: We([
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
      clickconnecting: j,
      connectingfrom: V,
      connectingto: D,
      valid: Z,
      /*
       * shows where you can start a connection from
       * and where you can end it while connecting
       */
      connectionindicator: l && (!I || Y) && (I || K ? c : a)
    }
  ]), onMouseDown: J, onTouchStart: J, onClick: L ? N : void 0, ref: x, ...y, children: h });
}
const Er = Q.memo(Jg(eS));
function tS({ data: t, isConnectable: r, sourcePosition: i = we.Bottom }) {
  return F.jsxs(F.Fragment, { children: [t?.label, F.jsx(Er, { type: "source", position: i, isConnectable: r })] });
}
function nS({ data: t, isConnectable: r, targetPosition: i = we.Top, sourcePosition: l = we.Bottom }) {
  return F.jsxs(F.Fragment, { children: [F.jsx(Er, { type: "target", position: i, isConnectable: r }), t?.label, F.jsx(Er, { type: "source", position: l, isConnectable: r })] });
}
function rS() {
  return null;
}
function oS({ data: t, isConnectable: r, targetPosition: i = we.Top }) {
  return F.jsxs(F.Fragment, { children: [F.jsx(Er, { type: "target", position: i, isConnectable: r }), t?.label] });
}
const vl = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
}, fh = {
  input: tS,
  default: nS,
  output: oS,
  group: rS
};
function iS(t) {
  return t.internals.handleBounds === void 0 ? {
    width: t.width ?? t.initialWidth ?? t.style?.width,
    height: t.height ?? t.initialHeight ?? t.style?.height
  } : {
    width: t.width ?? t.style?.width,
    height: t.height ?? t.style?.height
  };
}
const sS = (t) => {
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
function lS({ onSelectionContextMenu: t, noPanClassName: r, disableKeyboardA11y: i }) {
  const l = De(), { width: a, height: c, transformString: f, userSelectionActive: p } = Me(sS, je), h = rm(), g = Q.useRef(null);
  Q.useEffect(() => {
    i || g.current?.focus({
      preventScroll: !0
    });
  }, [i]);
  const m = !p && a !== null && c !== null;
  if (nm({
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
  return F.jsx("div", { className: We(["react-flow__nodesselection", "react-flow__container", r]), style: {
    transform: f
  }, children: F.jsx("div", { ref: g, className: "react-flow__nodesselection-rect", onContextMenu: v, tabIndex: i ? void 0 : -1, onKeyDown: i ? void 0 : y, style: {
    width: a,
    height: c
  } }) });
}
const dh = typeof window < "u" ? window : void 0, aS = (t) => ({ nodesSelectionActive: t.nodesSelectionActive, userSelectionActive: t.userSelectionActive });
function sm({ children: t, onPaneClick: r, onPaneMouseEnter: i, onPaneMouseMove: l, onPaneMouseLeave: a, onPaneContextMenu: c, onPaneScroll: f, paneClickDistance: p, deleteKeyCode: h, selectionKeyCode: g, selectionOnDrag: m, selectionMode: v, onSelectionStart: y, onSelectionEnd: x, multiSelectionKeyCode: _, panActivationKeyCode: M, zoomActivationKeyCode: E, elementsSelectable: C, zoomOnScroll: L, zoomOnPinch: S, panOnScroll: P, panOnScrollSpeed: V, panOnScrollMode: D, zoomOnDoubleClick: j, panOnDrag: Y, autoPanOnSelection: I, defaultViewport: K, translateExtent: Z, minZoom: ee, maxZoom: J, preventScrolling: N, onSelectionContextMenu: A, noWheelClassName: O, noPanClassName: B, disableKeyboardA11y: R, onViewportChange: H, isControlledViewport: U }) {
  const { nodesSelectionActive: k, userSelectionActive: $ } = Me(aS, je), ie = _i(g, { target: dh }), re = _i(M, { target: dh }), ae = re || Y, ce = re || P, ue = m && ae !== !0, q = ie || $ || ue;
  return H_({ deleteKeyCode: h, multiSelectionKeyCode: _ }), F.jsx(V_, { onPaneContextMenu: c, elementsSelectable: C, zoomOnScroll: L, zoomOnPinch: S, panOnScroll: ce, panActivationKeyPressed: re, panOnScrollSpeed: V, panOnScrollMode: D, zoomOnDoubleClick: j, panOnDrag: !ie && ae, defaultViewport: K, translateExtent: Z, minZoom: ee, maxZoom: J, zoomActivationKeyCode: E, preventScrolling: N, noWheelClassName: O, noPanClassName: B, onViewportChange: H, isControlledViewport: U, paneClickDistance: p, selectionOnDrag: ue, children: F.jsxs(X_, { onSelectionStart: y, onSelectionEnd: x, onPaneClick: r, onPaneMouseEnter: i, onPaneMouseMove: l, onPaneMouseLeave: a, onPaneContextMenu: c, onPaneScroll: f, panOnDrag: ae, autoPanOnSelection: I, isSelecting: !!q, selectionMode: v, selectionKeyPressed: ie, paneClickDistance: p, selectionOnDrag: ue, children: [t, k && F.jsx(lS, { onSelectionContextMenu: A, noPanClassName: B, disableKeyboardA11y: R })] }) });
}
sm.displayName = "FlowRenderer";
const uS = Q.memo(sm), cS = (t) => (r) => t ? Sc(r.nodeLookup, { x: 0, y: 0, width: r.width, height: r.height }, r.transform, !0).map((i) => i.id) : Array.from(r.nodeLookup.keys());
function fS(t) {
  return Me(Q.useCallback(cS(t), [t]), je);
}
const dS = (t) => t.updateNodeInternals;
function pS() {
  const t = Me(dS), [r] = Q.useState(() => typeof ResizeObserver > "u" ? null : new ResizeObserver((i) => {
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
  return Q.useEffect(() => () => {
    r?.disconnect();
  }, [r]), r;
}
function hS({ node: t, nodeType: r, hasDimensions: i, resizeObserver: l }) {
  const a = De(), c = Q.useRef(null), f = Q.useRef(null), p = Q.useRef(t.sourcePosition), h = Q.useRef(t.targetPosition), g = Q.useRef(r), m = i && !!t.internals.handleBounds;
  return Q.useEffect(() => {
    c.current && !t.hidden && (!m || f.current !== c.current) && (f.current && l?.unobserve(f.current), l?.observe(c.current), f.current = c.current);
  }, [m, t.hidden]), Q.useEffect(() => () => {
    f.current && (l?.unobserve(f.current), f.current = null);
  }, []), Q.useEffect(() => {
    if (c.current) {
      const v = g.current !== r, y = p.current !== t.sourcePosition, x = h.current !== t.targetPosition;
      (v || y || x) && (g.current = r, p.current = t.sourcePosition, h.current = t.targetPosition, a.getState().updateNodeInternals(/* @__PURE__ */ new Map([[t.id, { id: t.id, nodeElement: c.current, force: !0 }]])));
    }
  }, [t.id, r, t.sourcePosition, t.targetPosition]), c;
}
function gS({ id: t, onClick: r, onMouseEnter: i, onMouseMove: l, onMouseLeave: a, onContextMenu: c, onDoubleClick: f, nodesDraggable: p, elementsSelectable: h, nodesConnectable: g, nodesFocusable: m, resizeObserver: v, noDragClassName: y, noPanClassName: x, disableKeyboardA11y: _, rfId: M, nodeTypes: E, nodeClickDistance: C, onError: L }) {
  const { node: S, internals: P, isParent: V } = Me((q) => {
    const le = q.nodeLookup.get(t), ve = q.parentLookup.has(t);
    return {
      node: le,
      internals: le.internals,
      isParent: ve
    };
  }, je);
  let D = S.type || "default", j = E?.[D] || fh[D];
  j === void 0 && (L?.("003", Ut.error003(D)), D = "default", j = E?.default || fh.default);
  const Y = !!(S.draggable || p && typeof S.draggable > "u"), I = !!(S.selectable || h && typeof S.selectable > "u"), K = !!(S.connectable || g && typeof S.connectable > "u"), Z = !!(S.focusable || m && typeof S.focusable > "u"), ee = De(), J = Eg(S), N = hS({ node: S, nodeType: D, hasDimensions: J, resizeObserver: v }), A = nm({
    nodeRef: N,
    disabled: S.hidden || !Y,
    noDragClassName: y,
    handleSelector: S.dragHandle,
    nodeId: t,
    isSelectable: I,
    nodeClickDistance: C
  }), O = rm();
  if (S.hidden)
    return null;
  const B = Xt(S), R = iS(S), H = I || Y || r || i || l || a, U = i ? (q) => i(q, { ...P.userNode }) : void 0, k = l ? (q) => l(q, { ...P.userNode }) : void 0, $ = a ? (q) => a(q, { ...P.userNode }) : void 0, ie = c ? (q) => c(q, { ...P.userNode }) : void 0, re = f ? (q) => f(q, { ...P.userNode }) : void 0, ae = (q) => {
    const { selectNodesOnDrag: le, nodeDragThreshold: ve } = ee.getState();
    I && (!le || !Y || ve > 0) && ac({
      id: t,
      store: ee,
      nodeRef: N
    }), r && r(q, { ...P.userNode });
  }, ce = (q) => {
    if (!(zg(q.nativeEvent) || _)) {
      if (gg.includes(q.key) && I) {
        const le = q.key === "Escape";
        ac({
          id: t,
          store: ee,
          unselect: le,
          nodeRef: N
        });
      } else if (Y && S.selected && Object.prototype.hasOwnProperty.call(vl, q.key)) {
        q.preventDefault();
        const { ariaLabelConfig: le } = ee.getState();
        ee.setState({
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
    if (_ || !N.current?.matches(":focus-visible"))
      return;
    const { transform: q, width: le, height: ve, autoPanOnNodeFocus: Se, setCenter: me } = ee.getState();
    if (!Se)
      return;
    Sc(/* @__PURE__ */ new Map([[t, S]]), { x: 0, y: 0, width: le, height: ve }, q, !0).length > 0 || me(S.position.x + B.width / 2, S.position.y + B.height / 2, {
      zoom: q[2]
    });
  };
  return F.jsx("div", { className: We([
    "react-flow__node",
    `react-flow__node-${D}`,
    {
      // this is overwritable by passing `nopan` as a class name
      [x]: Y
    },
    S.className,
    {
      selected: S.selected,
      selectable: I,
      parent: V,
      draggable: Y,
      dragging: A
    }
  ]), ref: N, style: {
    zIndex: P.z,
    transform: `translate(${P.positionAbsolute.x}px,${P.positionAbsolute.y}px)`,
    pointerEvents: H ? "all" : "none",
    visibility: J ? "visible" : "hidden",
    ...S.style,
    ...R
  }, "data-id": t, "data-testid": `rf__node-${t}`, onMouseEnter: U, onMouseMove: k, onMouseLeave: $, onContextMenu: ie, onClick: ae, onDoubleClick: re, onKeyDown: Z ? ce : void 0, tabIndex: Z ? 0 : void 0, onFocus: Z ? ue : void 0, role: S.ariaRole ?? (Z ? "group" : void 0), "aria-roledescription": "node", "aria-describedby": _ ? void 0 : `${Yg}-${M}`, "aria-label": S.ariaLabel, ...S.domAttributes, children: F.jsx(Z_, { value: t, children: F.jsx(j, { id: t, data: S.data, type: D, positionAbsoluteX: P.positionAbsolute.x, positionAbsoluteY: P.positionAbsolute.y, selected: S.selected ?? !1, selectable: I, draggable: Y, deletable: S.deletable ?? !0, isConnectable: K, sourcePosition: S.sourcePosition, targetPosition: S.targetPosition, dragging: A, dragHandle: S.dragHandle, zIndex: P.z, parentId: S.parentId, ...B }) }) });
}
var mS = Q.memo(gS);
const yS = (t) => ({
  nodesConnectable: t.nodesConnectable,
  nodesFocusable: t.nodesFocusable,
  elementsSelectable: t.elementsSelectable,
  onError: t.onError
});
function lm(t) {
  const { nodesConnectable: r, nodesFocusable: i, elementsSelectable: l, onError: a } = Me(yS, je), c = fS(t.onlyRenderVisibleElements), f = pS();
  return F.jsx("div", { className: "react-flow__nodes", style: Rl, children: c.map((p) => (
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
    F.jsx(mS, { id: p, nodeTypes: t.nodeTypes, nodeExtent: t.nodeExtent, onClick: t.onNodeClick, onMouseEnter: t.onNodeMouseEnter, onMouseMove: t.onNodeMouseMove, onMouseLeave: t.onNodeMouseLeave, onContextMenu: t.onNodeContextMenu, onDoubleClick: t.onNodeDoubleClick, noDragClassName: t.noDragClassName, noPanClassName: t.noPanClassName, rfId: t.rfId, disableKeyboardA11y: t.disableKeyboardA11y, resizeObserver: f, nodesDraggable: t.nodesDraggable ?? !0, nodesConnectable: r, nodesFocusable: i, elementsSelectable: l, nodeClickDistance: t.nodeClickDistance, onError: a }, p)
  )) });
}
lm.displayName = "NodeRenderer";
const vS = Q.memo(lm);
function wS(t) {
  return Me(Q.useCallback((i) => {
    if (!t)
      return i.edges.map((a) => a.id);
    const l = [];
    if (i.width && i.height)
      for (const a of i.edges) {
        const c = i.nodeLookup.get(a.source), f = i.nodeLookup.get(a.target);
        c && f && p1({
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
const xS = ({ color: t = "none", strokeWidth: r = 1 }) => {
  const i = {
    strokeWidth: r,
    ...t && { stroke: t }
  };
  return F.jsx("polyline", { className: "arrow", style: i, strokeLinecap: "round", fill: "none", strokeLinejoin: "round", points: "-5,-4 0,0 -5,4" });
}, _S = ({ color: t = "none", strokeWidth: r = 1 }) => {
  const i = {
    strokeWidth: r,
    ...t && { stroke: t, fill: t }
  };
  return F.jsx("polyline", { className: "arrowclosed", style: i, strokeLinecap: "round", strokeLinejoin: "round", points: "-5,-4 0,0 -5,4 -5,-4" });
}, ph = {
  [gl.Arrow]: xS,
  [gl.ArrowClosed]: _S
};
function SS(t) {
  const r = De();
  return Q.useMemo(() => Object.prototype.hasOwnProperty.call(ph, t) ? ph[t] : (r.getState().onError?.("009", Ut.error009(t)), null), [t]);
}
const kS = ({ id: t, type: r, color: i, width: l = 12.5, height: a = 12.5, markerUnits: c = "strokeWidth", strokeWidth: f, orient: p = "auto-start-reverse" }) => {
  const h = SS(r);
  return h ? F.jsx("marker", { className: "react-flow__arrowhead", id: t, markerWidth: `${l}`, markerHeight: `${a}`, viewBox: "-10 -10 20 20", markerUnits: c, orient: p, refX: "0", refY: "0", children: F.jsx(h, { color: i, strokeWidth: f }) }) : null;
}, am = ({ defaultColor: t, rfId: r }) => {
  const i = Me((c) => c.edges), l = Me((c) => c.defaultEdgeOptions), a = Q.useMemo(() => S1(i, {
    id: r,
    defaultColor: t,
    defaultMarkerStart: l?.markerStart,
    defaultMarkerEnd: l?.markerEnd
  }), [i, l, r, t]);
  return a.length ? F.jsx("svg", { className: "react-flow__marker", "aria-hidden": "true", children: F.jsx("defs", { children: a.map((c) => F.jsx(kS, { id: c.id, type: c.type, color: c.color, width: c.width, height: c.height, markerUnits: c.markerUnits, strokeWidth: c.strokeWidth, orient: c.orient }, c.id)) }) }) : null;
};
am.displayName = "MarkerDefinitions";
var ES = Q.memo(am);
function um({ x: t, y: r, label: i, labelStyle: l, labelShowBg: a = !0, labelBgStyle: c, labelBgPadding: f = [2, 4], labelBgBorderRadius: p = 2, children: h, className: g, ...m }) {
  const [v, y] = Q.useState({ x: 1, y: 0, width: 0, height: 0 }), x = We(["react-flow__edge-textwrapper", g]), _ = Q.useRef(null);
  return Q.useEffect(() => {
    if (_.current) {
      const M = _.current.getBBox();
      y({
        x: M.x,
        y: M.y,
        width: M.width,
        height: M.height
      });
    }
  }, [i]), i ? F.jsxs("g", { transform: `translate(${t - v.width / 2} ${r - v.height / 2})`, className: x, visibility: v.width ? "visible" : "hidden", ...m, children: [a && F.jsx("rect", { width: v.width + 2 * f[0], x: -f[0], y: -f[1], height: v.height + 2 * f[1], className: "react-flow__edge-textbg", style: c, rx: p, ry: p }), F.jsx("text", { className: "react-flow__edge-text", y: v.height / 2, dy: "0.3em", ref: _, style: l, children: i }), h] }) : null;
}
um.displayName = "EdgeText";
const CS = Q.memo(um);
function Dl({ path: t, labelX: r, labelY: i, label: l, labelStyle: a, labelShowBg: c, labelBgStyle: f, labelBgPadding: p, labelBgBorderRadius: h, interactionWidth: g = 20, ...m }) {
  return F.jsxs(F.Fragment, { children: [F.jsx("path", { ...m, d: t, fill: "none", className: We(["react-flow__edge-path", m.className]) }), g ? F.jsx("path", { d: t, fill: "none", strokeOpacity: 0, strokeWidth: g, className: "react-flow__edge-interaction" }) : null, l && Vt(r) && Vt(i) ? F.jsx(CS, { x: r, y: i, label: l, labelStyle: a, labelShowBg: c, labelBgStyle: f, labelBgPadding: p, labelBgBorderRadius: h }) : null] });
}
function hh({ pos: t, x1: r, y1: i, x2: l, y2: a }) {
  return t === we.Left || t === we.Right ? [0.5 * (r + l), i] : [r, 0.5 * (i + a)];
}
function cm({ sourceX: t, sourceY: r, sourcePosition: i = we.Bottom, targetX: l, targetY: a, targetPosition: c = we.Top }) {
  const [f, p] = hh({
    pos: i,
    x1: t,
    y1: r,
    x2: l,
    y2: a
  }), [h, g] = hh({
    pos: c,
    x1: l,
    y1: a,
    x2: t,
    y2: r
  }), [m, v, y, x] = Ig({
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
function fm(t) {
  return Q.memo(({ id: r, sourceX: i, sourceY: l, targetX: a, targetY: c, sourcePosition: f, targetPosition: p, label: h, labelStyle: g, labelShowBg: m, labelBgStyle: v, labelBgPadding: y, labelBgBorderRadius: x, style: _, markerEnd: M, markerStart: E, interactionWidth: C }) => {
    const [L, S, P] = cm({
      sourceX: i,
      sourceY: l,
      sourcePosition: f,
      targetX: a,
      targetY: c,
      targetPosition: p
    }), V = t.isInternal ? void 0 : r;
    return F.jsx(Dl, { id: V, path: L, labelX: S, labelY: P, label: h, labelStyle: g, labelShowBg: m, labelBgStyle: v, labelBgPadding: y, labelBgBorderRadius: x, style: _, markerEnd: M, markerStart: E, interactionWidth: C });
  });
}
const NS = fm({ isInternal: !1 }), dm = fm({ isInternal: !0 });
NS.displayName = "SimpleBezierEdge";
dm.displayName = "SimpleBezierEdgeInternal";
function pm(t) {
  return Q.memo(({ id: r, sourceX: i, sourceY: l, targetX: a, targetY: c, label: f, labelStyle: p, labelShowBg: h, labelBgStyle: g, labelBgPadding: m, labelBgBorderRadius: v, style: y, sourcePosition: x = we.Bottom, targetPosition: _ = we.Top, markerEnd: M, markerStart: E, pathOptions: C, interactionWidth: L }) => {
    const [S, P, V] = oc({
      sourceX: i,
      sourceY: l,
      sourcePosition: x,
      targetX: a,
      targetY: c,
      targetPosition: _,
      borderRadius: C?.borderRadius,
      offset: C?.offset,
      stepPosition: C?.stepPosition
    }), D = t.isInternal ? void 0 : r;
    return F.jsx(Dl, { id: D, path: S, labelX: P, labelY: V, label: f, labelStyle: p, labelShowBg: h, labelBgStyle: g, labelBgPadding: m, labelBgBorderRadius: v, style: y, markerEnd: M, markerStart: E, interactionWidth: L });
  });
}
const hm = pm({ isInternal: !1 }), gm = pm({ isInternal: !0 });
hm.displayName = "SmoothStepEdge";
gm.displayName = "SmoothStepEdgeInternal";
function mm(t) {
  return Q.memo(({ id: r, ...i }) => {
    const l = t.isInternal ? void 0 : r;
    return F.jsx(hm, { ...i, id: l, pathOptions: Q.useMemo(() => ({ borderRadius: 0, offset: i.pathOptions?.offset }), [i.pathOptions?.offset]) });
  });
}
const MS = mm({ isInternal: !1 }), ym = mm({ isInternal: !0 });
MS.displayName = "StepEdge";
ym.displayName = "StepEdgeInternal";
function vm(t) {
  return Q.memo(({ id: r, sourceX: i, sourceY: l, targetX: a, targetY: c, label: f, labelStyle: p, labelShowBg: h, labelBgStyle: g, labelBgPadding: m, labelBgBorderRadius: v, style: y, markerEnd: x, markerStart: _, interactionWidth: M }) => {
    const [E, C, L] = Dg({ sourceX: i, sourceY: l, targetX: a, targetY: c }), S = t.isInternal ? void 0 : r;
    return F.jsx(Dl, { id: S, path: E, labelX: C, labelY: L, label: f, labelStyle: p, labelShowBg: h, labelBgStyle: g, labelBgPadding: m, labelBgBorderRadius: v, style: y, markerEnd: x, markerStart: _, interactionWidth: M });
  });
}
const zS = vm({ isInternal: !1 }), wm = vm({ isInternal: !0 });
zS.displayName = "StraightEdge";
wm.displayName = "StraightEdgeInternal";
function xm(t) {
  return Q.memo(({ id: r, sourceX: i, sourceY: l, targetX: a, targetY: c, sourcePosition: f = we.Bottom, targetPosition: p = we.Top, label: h, labelStyle: g, labelShowBg: m, labelBgStyle: v, labelBgPadding: y, labelBgBorderRadius: x, style: _, markerEnd: M, markerStart: E, pathOptions: C, interactionWidth: L }) => {
    const [S, P, V] = Tg({
      sourceX: i,
      sourceY: l,
      sourcePosition: f,
      targetX: a,
      targetY: c,
      targetPosition: p,
      curvature: C?.curvature
    }), D = t.isInternal ? void 0 : r;
    return F.jsx(Dl, { id: D, path: S, labelX: P, labelY: V, label: h, labelStyle: g, labelShowBg: m, labelBgStyle: v, labelBgPadding: y, labelBgBorderRadius: x, style: _, markerEnd: M, markerStart: E, interactionWidth: L });
  });
}
const PS = xm({ isInternal: !1 }), _m = xm({ isInternal: !0 });
PS.displayName = "BezierEdge";
_m.displayName = "BezierEdgeInternal";
const gh = {
  default: _m,
  straight: wm,
  step: ym,
  smoothstep: gm,
  simplebezier: dm
}, mh = {
  sourceX: null,
  sourceY: null,
  targetX: null,
  targetY: null,
  sourcePosition: null,
  targetPosition: null,
  zIndex: void 0
}, IS = (t, r, i) => i === we.Left ? t - r : i === we.Right ? t + r : t, TS = (t, r, i) => i === we.Top ? t - r : i === we.Bottom ? t + r : t, yh = "react-flow__edgeupdater";
function vh({ position: t, centerX: r, centerY: i, radius: l = 10, onMouseDown: a, onMouseEnter: c, onMouseOut: f, type: p }) {
  return F.jsx("circle", { onMouseDown: a, onMouseEnter: c, onMouseOut: f, className: We([yh, `${yh}-${p}`]), cx: IS(r, l, t), cy: TS(i, l, t), r: l, stroke: "transparent", fill: "transparent" });
}
function RS({ isReconnectable: t, reconnectRadius: r, edge: i, sourceX: l, sourceY: a, targetX: c, targetY: f, sourcePosition: p, targetPosition: h, onReconnect: g, onReconnectStart: m, onReconnectEnd: v, setReconnecting: y, setUpdateHover: x }) {
  const _ = De(), M = (P, V) => {
    if (P.button !== 0)
      return;
    const { autoPanOnConnect: D, domNode: j, connectionMode: Y, connectionRadius: I, lib: K, onConnectStart: Z, cancelConnection: ee, nodeLookup: J, rfId: N, panBy: A, updateConnection: O } = _.getState(), B = V.type === "target", R = (k, $) => {
      y(!1), v?.(k, i, V.type, $);
    }, H = (k) => g?.(i, k), U = (k, $) => {
      y(!0), m?.(P, i, V.type), Z?.(k, $);
    };
    lc.onPointerDown(P.nativeEvent, {
      autoPanOnConnect: D,
      connectionMode: Y,
      connectionRadius: I,
      domNode: j,
      handleId: V.id,
      nodeId: V.nodeId,
      nodeLookup: J,
      isTarget: B,
      edgeUpdaterType: V.type,
      lib: K,
      flowId: N,
      cancelConnection: ee,
      panBy: A,
      isValidConnection: (...k) => _.getState().isValidConnection?.(...k) ?? !0,
      onConnect: H,
      onConnectStart: U,
      onConnectEnd: (...k) => _.getState().onConnectEnd?.(...k),
      onReconnectEnd: R,
      updateConnection: O,
      getTransform: () => _.getState().transform,
      getFromHandle: () => _.getState().connection.fromHandle,
      dragThreshold: _.getState().connectionDragThreshold,
      handleDomNode: P.currentTarget
    });
  }, E = (P) => M(P, { nodeId: i.target, id: i.targetHandle ?? null, type: "target" }), C = (P) => M(P, { nodeId: i.source, id: i.sourceHandle ?? null, type: "source" }), L = () => x(!0), S = () => x(!1);
  return F.jsxs(F.Fragment, { children: [(t === !0 || t === "source") && F.jsx(vh, { position: p, centerX: l, centerY: a, radius: r, onMouseDown: E, onMouseEnter: L, onMouseOut: S, type: "source" }), (t === !0 || t === "target") && F.jsx(vh, { position: h, centerX: c, centerY: f, radius: r, onMouseDown: C, onMouseEnter: L, onMouseOut: S, type: "target" })] });
}
function DS({ id: t, edgesFocusable: r, edgesReconnectable: i, elementsSelectable: l, onClick: a, onDoubleClick: c, onContextMenu: f, onMouseEnter: p, onMouseMove: h, onMouseLeave: g, reconnectRadius: m, onReconnect: v, onReconnectStart: y, onReconnectEnd: x, rfId: _, edgeTypes: M, noPanClassName: E, onError: C, disableKeyboardA11y: L }) {
  let S = Me((me) => me.edgeLookup.get(t));
  const P = Me((me) => me.defaultEdgeOptions);
  S = P ? { ...P, ...S } : S;
  let V = S.type || "default", D = M?.[V] || gh[V];
  D === void 0 && (C?.("011", Ut.error011(V)), V = "default", D = M?.default || gh.default);
  const j = !!(S.focusable || r && typeof S.focusable > "u"), Y = typeof v < "u" && (S.reconnectable || i && typeof S.reconnectable > "u"), I = !!(S.selectable || l && typeof S.selectable > "u"), K = Q.useRef(null), [Z, ee] = Q.useState(!1), [J, N] = Q.useState(!1), A = De(), { zIndex: O = S.zIndex, sourceX: B, sourceY: R, targetX: H, targetY: U, sourcePosition: k, targetPosition: $ } = Me(Q.useCallback((me) => {
    const ye = me.nodeLookup.get(S.source), Ee = me.nodeLookup.get(S.target);
    if (!ye || !Ee)
      return mh;
    const Ce = _1({
      id: t,
      sourceNode: ye,
      targetNode: Ee,
      sourceHandle: S.sourceHandle || null,
      targetHandle: S.targetHandle || null,
      connectionMode: me.connectionMode,
      onError: C
    }), ze = d1({
      selected: S.selected,
      zIndex: S.zIndex,
      sourceNode: ye,
      targetNode: Ee,
      elevateOnSelect: me.elevateEdgesOnSelect,
      zIndexMode: me.zIndexMode
    });
    return {
      ...Ce || mh,
      zIndex: ze
    };
  }, [S.source, S.target, S.sourceHandle, S.targetHandle, S.selected, S.zIndex, C]), je), ie = Q.useMemo(() => S.markerStart ? `url('#${ic(S.markerStart, _)}')` : void 0, [S.markerStart, _]), re = Q.useMemo(() => S.markerEnd ? `url('#${ic(S.markerEnd, _)}')` : void 0, [S.markerEnd, _]);
  if (S.hidden || B === null || R === null || H === null || U === null)
    return null;
  const ae = (me) => {
    const { addSelectedEdges: ye, unselectNodesAndEdges: Ee, multiSelectionActive: Ce } = A.getState();
    I && (A.setState({ nodesSelectionActive: !1 }), S.selected && Ce ? (Ee({ nodes: [], edges: [S] }), K.current?.blur()) : ye([t])), a && a(me, S);
  }, ce = c ? (me) => {
    c(me, { ...S });
  } : void 0, ue = f ? (me) => {
    f(me, { ...S });
  } : void 0, q = p ? (me) => {
    p(me, { ...S });
  } : void 0, le = h ? (me) => {
    h(me, { ...S });
  } : void 0, ve = g ? (me) => {
    g(me, { ...S });
  } : void 0, Se = (me) => {
    if (!L && gg.includes(me.key) && I) {
      const { unselectNodesAndEdges: ye, addSelectedEdges: Ee } = A.getState();
      me.key === "Escape" ? (K.current?.blur(), ye({ edges: [S] })) : Ee([t]);
    }
  };
  return F.jsx("svg", { style: { zIndex: O }, children: F.jsxs("g", { className: We([
    "react-flow__edge",
    `react-flow__edge-${V}`,
    S.className,
    E,
    {
      selected: S.selected,
      animated: S.animated,
      inactive: !I && !a,
      updating: Z,
      selectable: I
    }
  ]), onClick: ae, onDoubleClick: ce, onContextMenu: ue, onMouseEnter: q, onMouseMove: le, onMouseLeave: ve, onKeyDown: j ? Se : void 0, tabIndex: j ? 0 : void 0, role: S.ariaRole ?? (j ? "group" : "img"), "aria-roledescription": "edge", "data-id": t, "data-testid": `rf__edge-${t}`, "aria-label": S.ariaLabel === null ? void 0 : S.ariaLabel || `Edge from ${S.source} to ${S.target}`, "aria-describedby": j ? `${Zg}-${_}` : void 0, ref: K, ...S.domAttributes, children: [!J && F.jsx(D, { id: t, source: S.source, target: S.target, type: S.type, selected: S.selected, animated: S.animated, selectable: I, deletable: S.deletable ?? !0, label: S.label, labelStyle: S.labelStyle, labelShowBg: S.labelShowBg, labelBgStyle: S.labelBgStyle, labelBgPadding: S.labelBgPadding, labelBgBorderRadius: S.labelBgBorderRadius, sourceX: B, sourceY: R, targetX: H, targetY: U, sourcePosition: k, targetPosition: $, data: S.data, style: S.style, sourceHandleId: S.sourceHandle, targetHandleId: S.targetHandle, markerStart: ie, markerEnd: re, pathOptions: "pathOptions" in S ? S.pathOptions : void 0, interactionWidth: S.interactionWidth }), Y && F.jsx(RS, { edge: S, isReconnectable: Y, reconnectRadius: m, onReconnect: v, onReconnectStart: y, onReconnectEnd: x, sourceX: B, sourceY: R, targetX: H, targetY: U, sourcePosition: k, targetPosition: $, setUpdateHover: ee, setReconnecting: N })] }) });
}
var bS = Q.memo(DS);
const LS = (t) => ({
  edgesFocusable: t.edgesFocusable,
  edgesReconnectable: t.edgesReconnectable,
  elementsSelectable: t.elementsSelectable,
  connectionMode: t.connectionMode,
  onError: t.onError
});
function Sm({ defaultMarkerColor: t, onlyRenderVisibleElements: r, rfId: i, edgeTypes: l, noPanClassName: a, onReconnect: c, onEdgeContextMenu: f, onEdgeMouseEnter: p, onEdgeMouseMove: h, onEdgeMouseLeave: g, onEdgeClick: m, reconnectRadius: v, onEdgeDoubleClick: y, onReconnectStart: x, onReconnectEnd: _, disableKeyboardA11y: M }) {
  const { edgesFocusable: E, edgesReconnectable: C, elementsSelectable: L, onError: S } = Me(LS, je), P = wS(r);
  return F.jsxs("div", { className: "react-flow__edges", children: [F.jsx(ES, { defaultColor: t, rfId: i }), P.map((V) => F.jsx(bS, { id: V, edgesFocusable: E, edgesReconnectable: C, elementsSelectable: L, noPanClassName: a, onReconnect: c, onContextMenu: f, onMouseEnter: p, onMouseMove: h, onMouseLeave: g, onClick: m, reconnectRadius: v, onDoubleClick: y, onReconnectStart: x, onReconnectEnd: _, rfId: i, onError: S, edgeTypes: l, disableKeyboardA11y: M }, V))] });
}
Sm.displayName = "EdgeRenderer";
const AS = Q.memo(Sm), wh = (t) => `translate(${t[0]}px,${t[1]}px) scale(${t[2]})`;
function $S({ children: t }) {
  const r = De(), i = Q.useRef(null), [l] = Q.useState(() => r.getState().transform);
  return em(() => {
    let a = null;
    const c = () => {
      const f = r.getState().transform;
      a && f[0] === a[0] && f[1] === a[1] && f[2] === a[2] || (a = f, i.current && (i.current.style.transform = wh(f)));
    };
    return c(), r.subscribe(c);
  }, [r]), F.jsx("div", { ref: i, className: "react-flow__viewport xyflow__viewport react-flow__container", style: { transform: wh(l) }, children: t });
}
function OS(t) {
  const r = Tl(), i = Q.useRef(!1);
  Q.useEffect(() => {
    !i.current && r.viewportInitialized && t && (setTimeout(() => t(r), 1), i.current = !0);
  }, [t, r.viewportInitialized]);
}
const HS = (t) => t.panZoom?.syncViewport;
function jS(t) {
  const r = Me(HS), i = De();
  return Q.useEffect(() => {
    t && (r?.(t), i.setState({ transform: [t.x, t.y, t.zoom] }));
  }, [t, r]), null;
}
function FS(t) {
  return t.connection.inProgress ? { ...t.connection, to: zi(t.connection.to, t.transform) } : { ...t.connection };
}
function VS(t) {
  return FS;
}
function BS(t) {
  const r = VS();
  return Me(r, je);
}
const US = (t) => ({
  nodesConnectable: t.nodesConnectable,
  isValid: t.connection.isValid,
  inProgress: t.connection.inProgress,
  width: t.width,
  height: t.height
});
function WS({ containerStyle: t, style: r, type: i, component: l }) {
  const { nodesConnectable: a, width: c, height: f, isValid: p, inProgress: h } = Me(US, je);
  return !(c && a && h) ? null : F.jsx("svg", { style: t, width: c, height: f, className: "react-flow__connectionline react-flow__container", children: F.jsx("g", { className: We(["react-flow__connection", Ng(p)]), children: F.jsx(km, { style: r, type: i, CustomComponent: l, isValid: p }) }) });
}
const km = ({ style: t, type: r = Un.Bezier, CustomComponent: i, isValid: l }) => {
  const { inProgress: a, from: c, fromNode: f, fromHandle: p, fromPosition: h, to: g, toNode: m, toHandle: v, toPosition: y, pointer: x } = BS();
  if (!a)
    return;
  if (i)
    return F.jsx(i, { connectionLineType: r, connectionLineStyle: t, fromNode: f, fromHandle: p, fromX: c.x, fromY: c.y, toX: g.x, toY: g.y, fromPosition: h, toPosition: y, connectionStatus: Ng(l), toNode: m, toHandle: v, pointer: x });
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
    case Un.Bezier:
      [_] = Tg(M);
      break;
    case Un.SimpleBezier:
      [_] = cm(M);
      break;
    case Un.Step:
      [_] = oc({
        ...M,
        borderRadius: 0
      });
      break;
    case Un.SmoothStep:
      [_] = oc(M);
      break;
    default:
      [_] = Dg(M);
  }
  return F.jsx("path", { d: _, fill: "none", className: "react-flow__connection-path", style: t });
};
km.displayName = "ConnectionLine";
const XS = {};
function xh(t = XS) {
  Q.useRef(t), De(), Q.useEffect(() => {
  }, [t]);
}
function YS() {
  De(), Q.useRef(!1), Q.useEffect(() => {
  }, []);
}
function Em({ nodeTypes: t, edgeTypes: r, onInit: i, onNodeClick: l, onEdgeClick: a, onNodeDoubleClick: c, onEdgeDoubleClick: f, onNodeMouseEnter: p, onNodeMouseMove: h, onNodeMouseLeave: g, onNodeContextMenu: m, onSelectionContextMenu: v, onSelectionStart: y, onSelectionEnd: x, connectionLineType: _, connectionLineStyle: M, connectionLineComponent: E, connectionLineContainerStyle: C, selectionKeyCode: L, selectionOnDrag: S, selectionMode: P, multiSelectionKeyCode: V, panActivationKeyCode: D, zoomActivationKeyCode: j, deleteKeyCode: Y, onlyRenderVisibleElements: I, elementsSelectable: K, defaultViewport: Z, translateExtent: ee, minZoom: J, maxZoom: N, preventScrolling: A, defaultMarkerColor: O, zoomOnScroll: B, zoomOnPinch: R, panOnScroll: H, panOnScrollSpeed: U, panOnScrollMode: k, zoomOnDoubleClick: $, panOnDrag: ie, autoPanOnSelection: re, onPaneClick: ae, onPaneMouseEnter: ce, onPaneMouseMove: ue, onPaneMouseLeave: q, onPaneScroll: le, onPaneContextMenu: ve, paneClickDistance: Se, nodeClickDistance: me, onEdgeContextMenu: ye, onEdgeMouseEnter: Ee, onEdgeMouseMove: Ce, onEdgeMouseLeave: ze, reconnectRadius: Ve, onReconnect: Ct, onReconnectStart: at, onReconnectEnd: et, noDragClassName: tt, noWheelClassName: on, noPanClassName: Yt, disableKeyboardA11y: Zt, nodeExtent: ut, rfId: Nt, viewport: mt, onViewportChange: Mt, nodesDraggable: Cr }) {
  return xh(t), xh(r), YS(), OS(i), jS(mt), F.jsx(uS, { onPaneClick: ae, onPaneMouseEnter: ce, onPaneMouseMove: ue, onPaneMouseLeave: q, onPaneContextMenu: ve, onPaneScroll: le, paneClickDistance: Se, deleteKeyCode: Y, selectionKeyCode: L, selectionOnDrag: S, selectionMode: P, onSelectionStart: y, onSelectionEnd: x, multiSelectionKeyCode: V, panActivationKeyCode: D, zoomActivationKeyCode: j, elementsSelectable: K, zoomOnScroll: B, zoomOnPinch: R, zoomOnDoubleClick: $, panOnScroll: H, panOnScrollSpeed: U, panOnScrollMode: k, panOnDrag: ie, autoPanOnSelection: re, defaultViewport: Z, translateExtent: ee, minZoom: J, maxZoom: N, onSelectionContextMenu: v, preventScrolling: A, noDragClassName: tt, noWheelClassName: on, noPanClassName: Yt, disableKeyboardA11y: Zt, onViewportChange: Mt, isControlledViewport: !!mt, children: F.jsxs($S, { children: [F.jsx(AS, { edgeTypes: r, onEdgeClick: a, onEdgeDoubleClick: f, onReconnect: Ct, onReconnectStart: at, onReconnectEnd: et, onlyRenderVisibleElements: I, onEdgeContextMenu: ye, onEdgeMouseEnter: Ee, onEdgeMouseMove: Ce, onEdgeMouseLeave: ze, reconnectRadius: Ve, defaultMarkerColor: O, noPanClassName: Yt, disableKeyboardA11y: Zt, rfId: Nt }), F.jsx(WS, { style: M, type: _, component: E, containerStyle: C }), F.jsx("div", { className: "react-flow__edgelabel-renderer" }), F.jsx(vS, { nodeTypes: t, onNodeClick: l, onNodeDoubleClick: c, onNodeMouseEnter: p, onNodeMouseMove: h, onNodeMouseLeave: g, onNodeContextMenu: m, nodeClickDistance: me, onlyRenderVisibleElements: I, noPanClassName: Yt, noDragClassName: tt, disableKeyboardA11y: Zt, nodeExtent: ut, rfId: Nt, nodesDraggable: Cr }), F.jsx("div", { className: "react-flow__viewport-portal" })] }) });
}
Em.displayName = "GraphView";
const ZS = Q.memo(Em), QS = kg(), _h = ({ nodes: t, edges: r, defaultNodes: i, defaultEdges: l, width: a, height: c, fitView: f, fitViewOptions: p, minZoom: h = 0.5, maxZoom: g = 2, nodeOrigin: m, nodeExtent: v, zIndexMode: y = "basic" } = {}) => {
  const x = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), M = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map(), C = l ?? r ?? [], L = i ?? t ?? [], S = m ?? [0, 0], P = v ?? yi;
  Ag(M, E, C);
  const { nodesInitialized: V } = sc(L, x, _, {
    nodeOrigin: S,
    nodeExtent: P,
    zIndexMode: y
  });
  let D = [0, 0, 1];
  if (f && a && c) {
    const j = Ni(x, {
      filter: (Z) => !!((Z.width || Z.initialWidth) && (Z.height || Z.initialHeight))
    }), { x: Y, y: I, zoom: K } = Ec(j, a, c, h, g, p?.padding ?? 0.1);
    D = [Y, I, K];
  }
  return {
    rfId: "1",
    width: a ?? 0,
    height: c ?? 0,
    transform: D,
    nodes: L,
    nodesInitialized: V,
    nodeLookup: x,
    parentLookup: _,
    edges: C,
    edgeLookup: E,
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
    connection: { ...yg },
    connectionClickStartHandle: null,
    connectOnClick: !0,
    ariaLiveMessage: "",
    autoPanOnConnect: !0,
    autoPanOnNodeDrag: !0,
    autoPanOnNodeFocus: !0,
    autoPanSpeed: 15,
    connectionRadius: 20,
    onError: QS,
    isValidConnection: void 0,
    onSelectionChangeHandlers: [],
    lib: "react",
    debug: !1,
    ariaLabelConfig: mg,
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
}, KS = ({ nodes: t, edges: r, defaultNodes: i, defaultEdges: l, width: a, height: c, fitView: f, fitViewOptions: p, minZoom: h, maxZoom: g, nodeOrigin: m, nodeExtent: v, zIndexMode: y }) => c_((x, _) => {
  async function M() {
    const { nodeLookup: E, panZoom: C, fitViewOptions: L, fitViewResolver: S, width: P, height: V, minZoom: D, maxZoom: j } = _();
    C && (await i1({
      nodes: E,
      width: P,
      height: V,
      panZoom: C,
      minZoom: D,
      maxZoom: j
    }, L), S?.resolve(!0), x({ fitViewResolver: null }));
  }
  return {
    ..._h({
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
      const { nodeLookup: C, parentLookup: L, nodeOrigin: S, nodeExtent: P, elevateNodesOnSelect: V, fitViewQueued: D, zIndexMode: j, nodesSelectionActive: Y } = _(), { nodesInitialized: I, hasSelectedNodes: K } = sc(E, C, L, {
        nodeOrigin: S,
        nodeExtent: P,
        elevateNodesOnSelect: V,
        checkEquality: !0,
        zIndexMode: j
      }), Z = Y && K;
      D && I ? (M(), x({
        nodes: E,
        nodesInitialized: I,
        fitViewQueued: !1,
        fitViewOptions: void 0,
        nodesSelectionActive: Z
      })) : x({ nodes: E, nodesInitialized: I, nodesSelectionActive: Z });
    },
    setEdges: (E) => {
      const { connectionLookup: C, edgeLookup: L } = _();
      Ag(C, L, E), x({ edges: E });
    },
    setDefaultNodesAndEdges: (E, C) => {
      if (E) {
        const { setNodes: L } = _();
        L(E), x({ hasDefaultNodes: !0 });
      }
      if (C) {
        const { setEdges: L } = _();
        L(C), x({ hasDefaultEdges: !0 });
      }
    },
    /*
     * Every node gets registered at a ResizeObserver. Whenever a node
     * changes its dimensions, this function is called to measure the
     * new dimensions and update the nodes.
     */
    updateNodeInternals: (E) => {
      const { triggerNodeChanges: C, nodeLookup: L, parentLookup: S, domNode: P, nodeOrigin: V, nodeExtent: D, debug: j, fitViewQueued: Y, zIndexMode: I } = _(), { changes: K, updatedInternals: Z } = P1(E, L, S, P, V, D, I);
      Z && (C1(L, S, { nodeOrigin: V, nodeExtent: D, zIndexMode: I }), Y ? (M(), x({ fitViewQueued: !1, fitViewOptions: void 0 })) : x({}), K?.length > 0 && (j && console.log("React Flow: trigger node changes", K), C?.(K)));
    },
    updateNodePositions: (E, C = !1) => {
      const L = [];
      let S = [];
      const { nodeLookup: P, triggerNodeChanges: V, connection: D, updateConnection: j, onNodesChangeMiddlewareMap: Y } = _();
      for (const [I, K] of E) {
        const Z = P.get(I), ee = !!(Z?.expandParent && Z?.parentId && K?.position), J = {
          id: I,
          type: "position",
          position: ee ? {
            x: Math.max(0, K.position.x),
            y: Math.max(0, K.position.y)
          } : K.position,
          dragging: C
        };
        if (Z && D.inProgress && D.fromNode.id === Z.id) {
          const N = kr(Z, D.fromHandle, we.Left, !0);
          j({ ...D, from: N });
        }
        ee && Z.parentId && L.push({
          id: I,
          parentId: Z.parentId,
          rect: {
            ...K.internals.positionAbsolute,
            width: K.measured.width ?? 0,
            height: K.measured.height ?? 0
          }
        }), S.push(J);
      }
      if (L.length > 0) {
        const { parentLookup: I, nodeOrigin: K } = _(), Z = Ic(L, P, I, K);
        S.push(...Z);
      }
      for (const I of Y.values())
        S = I(S);
      V(S);
    },
    triggerNodeChanges: (E) => {
      const { onNodesChange: C, setNodes: L, nodes: S, hasDefaultNodes: P, debug: V } = _();
      if (E?.length) {
        if (P) {
          const D = Gg(E, S);
          L(D);
        }
        V && console.log("React Flow: trigger node changes", E), C?.(E);
      }
    },
    triggerEdgeChanges: (E) => {
      const { onEdgesChange: C, setEdges: L, edges: S, hasDefaultEdges: P, debug: V } = _();
      if (E?.length) {
        if (P) {
          const D = qg(E, S);
          L(D);
        }
        V && console.log("React Flow: trigger edge changes", E), C?.(E);
      }
    },
    addSelectedNodes: (E) => {
      const { multiSelectionActive: C, edgeLookup: L, nodeLookup: S, triggerNodeChanges: P, triggerEdgeChanges: V } = _();
      if (C) {
        const D = E.map((j) => pr(j, !0));
        P(D);
        return;
      }
      P(no(S, /* @__PURE__ */ new Set([...E]))), V(no(L));
    },
    addSelectedEdges: (E) => {
      const { multiSelectionActive: C, edgeLookup: L, nodeLookup: S, triggerNodeChanges: P, triggerEdgeChanges: V } = _();
      if (C) {
        const D = E.map((j) => pr(j, !0));
        V(D);
        return;
      }
      V(no(L, /* @__PURE__ */ new Set([...E]))), P(no(S, /* @__PURE__ */ new Set()));
    },
    unselectNodesAndEdges: ({ nodes: E, edges: C } = {}) => {
      const { edges: L, nodes: S, nodeLookup: P, triggerNodeChanges: V, triggerEdgeChanges: D } = _(), j = E || S, Y = C || L, I = [];
      for (const Z of j)
        Z.selected && I.push(pr(Z.id, !1));
      const K = [];
      for (const Z of Y)
        Z.selected && K.push(pr(Z.id, !1));
      V(I), D(K);
    },
    setMinZoom: (E) => {
      const { panZoom: C, maxZoom: L } = _();
      C?.setScaleExtent([E, L]), x({ minZoom: E });
    },
    setMaxZoom: (E) => {
      const { panZoom: C, minZoom: L } = _();
      C?.setScaleExtent([L, E]), x({ maxZoom: E });
    },
    setTranslateExtent: (E) => {
      _().panZoom?.setTranslateExtent(E), x({ translateExtent: E });
    },
    resetSelectedElements: () => {
      const { edges: E, nodes: C, triggerNodeChanges: L, triggerEdgeChanges: S, elementsSelectable: P } = _();
      if (!P)
        return;
      const V = C.reduce((j, Y) => Y.selected ? [...j, pr(Y.id, !1)] : j, []), D = E.reduce((j, Y) => Y.selected ? [...j, pr(Y.id, !1)] : j, []);
      L(V), S(D);
    },
    setNodeExtent: (E) => {
      const { nodes: C, nodeLookup: L, parentLookup: S, nodeOrigin: P, elevateNodesOnSelect: V, nodeExtent: D, zIndexMode: j } = _();
      E[0][0] === D[0][0] && E[0][1] === D[0][1] && E[1][0] === D[1][0] && E[1][1] === D[1][1] || (sc(C, L, S, {
        nodeOrigin: P,
        nodeExtent: E,
        elevateNodesOnSelect: V,
        checkEquality: !1,
        zIndexMode: j
      }), x({ nodeExtent: E }));
    },
    panBy: (E) => {
      const { transform: C, width: L, height: S, panZoom: P, translateExtent: V } = _();
      return I1({ delta: E, panZoom: P, transform: C, translateExtent: V, width: L, height: S });
    },
    setCenter: async (E, C, L) => {
      const { width: S, height: P, maxZoom: V, panZoom: D } = _();
      if (!D)
        return !1;
      const j = typeof L?.zoom < "u" ? L.zoom : V;
      return await D.setViewport({
        x: S / 2 - E * j,
        y: P / 2 - C * j,
        zoom: j
      }, { duration: L?.duration, ease: L?.ease, interpolate: L?.interpolate }), !0;
    },
    cancelConnection: () => {
      x({
        connection: { ...yg }
      });
    },
    updateConnection: (E) => {
      x({ connection: E });
    },
    reset: () => x({ ..._h() })
  };
}, Object.is);
function GS({ initialNodes: t, initialEdges: r, defaultNodes: i, defaultEdges: l, initialWidth: a, initialHeight: c, initialMinZoom: f, initialMaxZoom: p, initialFitViewOptions: h, fitView: g, nodeOrigin: m, nodeExtent: v, zIndexMode: y, children: x }) {
  const [_] = Q.useState(() => KS({
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
  return F.jsx(f_, { value: _, children: F.jsx(L_, { children: F.jsx(K_, { children: x }) }) });
}
function qS({ children: t, nodes: r, edges: i, defaultNodes: l, defaultEdges: a, width: c, height: f, fitView: p, fitViewOptions: h, minZoom: g, maxZoom: m, nodeOrigin: v, nodeExtent: y, zIndexMode: x }) {
  return Q.useContext(Pl) ? F.jsx(F.Fragment, { children: t }) : F.jsx(GS, { initialNodes: r, initialEdges: i, defaultNodes: l, defaultEdges: a, initialWidth: c, initialHeight: f, fitView: p, initialFitViewOptions: h, initialMinZoom: g, initialMaxZoom: m, nodeOrigin: v, nodeExtent: y, zIndexMode: x, children: t });
}
const JS = {
  width: "100%",
  height: "100%",
  overflow: "hidden",
  position: "relative",
  zIndex: 0
};
function ek({ nodes: t, edges: r, defaultNodes: i, defaultEdges: l, className: a, nodeTypes: c, edgeTypes: f, onNodeClick: p, onEdgeClick: h, onInit: g, onMove: m, onMoveStart: v, onMoveEnd: y, onConnect: x, onConnectStart: _, onConnectEnd: M, onClickConnectStart: E, onClickConnectEnd: C, onNodeMouseEnter: L, onNodeMouseMove: S, onNodeMouseLeave: P, onNodeContextMenu: V, onNodeDoubleClick: D, onNodeDragStart: j, onNodeDrag: Y, onNodeDragStop: I, onNodesDelete: K, onEdgesDelete: Z, onDelete: ee, onSelectionChange: J, onSelectionDragStart: N, onSelectionDrag: A, onSelectionDragStop: O, onSelectionContextMenu: B, onSelectionStart: R, onSelectionEnd: H, onBeforeDelete: U, connectionMode: k, connectionLineType: $ = Un.Bezier, connectionLineStyle: ie, connectionLineComponent: re, connectionLineContainerStyle: ae, deleteKeyCode: ce = "Backspace", selectionKeyCode: ue = "Shift", selectionOnDrag: q = !1, selectionMode: le = vi.Full, panActivationKeyCode: ve = "Space", multiSelectionKeyCode: Se = xi() ? "Meta" : "Control", zoomActivationKeyCode: me = xi() ? "Meta" : "Control", snapToGrid: ye, snapGrid: Ee, onlyRenderVisibleElements: Ce = !1, selectNodesOnDrag: ze, nodesDraggable: Ve, autoPanOnNodeFocus: Ct, nodesConnectable: at, nodesFocusable: et, nodeOrigin: tt = Qg, edgesFocusable: on, edgesReconnectable: Yt, elementsSelectable: Zt = !0, defaultViewport: ut = E_, minZoom: Nt = 0.5, maxZoom: mt = 2, translateExtent: Mt = yi, preventScrolling: Cr = !0, nodeExtent: sn, defaultMarkerColor: Yn = "#b1b1b7", zoomOnScroll: bl = !0, zoomOnPinch: Pi = !0, panOnScroll: Ii = !1, panOnScrollSpeed: Ll = 0.5, panOnScrollMode: yo = yr.Free, zoomOnDoubleClick: vo = !0, panOnDrag: wo = !0, onPaneClick: xo, onPaneMouseEnter: _o, onPaneMouseMove: xn, onPaneMouseLeave: _n, onPaneScroll: Ti, onPaneContextMenu: Ri, paneClickDistance: Di = 1, nodeClickDistance: bi = 0, children: Li, onReconnect: So, onReconnectStart: Ai, onReconnectEnd: Zn, onEdgeContextMenu: ko, onEdgeDoubleClick: Qn, onEdgeMouseEnter: Al, onEdgeMouseMove: Kn, onEdgeMouseLeave: Nr, reconnectRadius: Mr = 10, onNodesChange: Eo, onEdgesChange: $l, noDragClassName: Ol = "nodrag", noWheelClassName: Hl = "nowheel", noPanClassName: Qt = "nopan", fitView: Co, fitViewOptions: No, connectOnClick: jl, attributionPosition: $i, proOptions: Oi, defaultEdgeOptions: Hi, elevateNodesOnSelect: ji = !0, elevateEdgesOnSelect: Fl = !1, disableKeyboardA11y: Fi = !1, autoPanOnConnect: $e, autoPanOnNodeDrag: Vl, autoPanOnSelection: Mo = !0, autoPanSpeed: Vi, connectionRadius: zr, isValidConnection: Bl, onError: Bi, style: Pr, id: yt, nodeDragThreshold: Ul, connectionDragThreshold: vt, viewport: Wl, onViewportChange: Xl, width: Yl, height: Ir, colorMode: Tr = "light", debug: Gn, onScroll: qn, ariaLabelConfig: Zl, zIndexMode: Ui = "basic", ...zo }, Wi) {
  const Jn = yt || "1", er = z_(Tr), Ql = Q.useCallback((Rr) => {
    Rr.currentTarget.scrollTo({ top: 0, left: 0, behavior: "instant" }), qn?.(Rr);
  }, [qn]);
  return F.jsx("div", { "data-testid": "rf__wrapper", ...zo, onScroll: Ql, style: { ...Pr, ...JS }, ref: Wi, className: We(["react-flow", a, er]), id: yt, role: "application", children: F.jsxs(qS, { nodes: t, edges: r, width: Yl, height: Ir, fitView: Co, fitViewOptions: No, minZoom: Nt, maxZoom: mt, nodeOrigin: tt, nodeExtent: sn, zIndexMode: Ui, children: [F.jsx(M_, { nodes: t, edges: r, defaultNodes: i, defaultEdges: l, onConnect: x, onConnectStart: _, onConnectEnd: M, onClickConnectStart: E, onClickConnectEnd: C, nodesDraggable: Ve, autoPanOnNodeFocus: Ct, nodesConnectable: at, nodesFocusable: et, edgesFocusable: on, edgesReconnectable: Yt, elementsSelectable: Zt, elevateNodesOnSelect: ji, elevateEdgesOnSelect: Fl, minZoom: Nt, maxZoom: mt, nodeExtent: sn, onNodesChange: Eo, onEdgesChange: $l, snapToGrid: ye, snapGrid: Ee, connectionMode: k, translateExtent: Mt, connectOnClick: jl, defaultEdgeOptions: Hi, fitView: Co, fitViewOptions: No, onNodesDelete: K, onEdgesDelete: Z, onDelete: ee, onNodeDragStart: j, onNodeDrag: Y, onNodeDragStop: I, onSelectionDrag: A, onSelectionDragStart: N, onSelectionDragStop: O, onMove: m, onMoveStart: v, onMoveEnd: y, noPanClassName: Qt, nodeOrigin: tt, rfId: Jn, autoPanOnConnect: $e, autoPanOnNodeDrag: Vl, autoPanSpeed: Vi, onError: Bi, connectionRadius: zr, isValidConnection: Bl, selectNodesOnDrag: ze, nodeDragThreshold: Ul, connectionDragThreshold: vt, onBeforeDelete: U, debug: Gn, ariaLabelConfig: Zl, zIndexMode: Ui }), F.jsx(ZS, { onInit: g, onNodeClick: p, onEdgeClick: h, onNodeMouseEnter: L, onNodeMouseMove: S, onNodeMouseLeave: P, onNodeContextMenu: V, onNodeDoubleClick: D, nodeTypes: c, edgeTypes: f, connectionLineType: $, connectionLineStyle: ie, connectionLineComponent: re, connectionLineContainerStyle: ae, selectionKeyCode: ue, selectionOnDrag: q, selectionMode: le, deleteKeyCode: ce, multiSelectionKeyCode: Se, panActivationKeyCode: ve, zoomActivationKeyCode: me, onlyRenderVisibleElements: Ce, defaultViewport: ut, translateExtent: Mt, minZoom: Nt, maxZoom: mt, preventScrolling: Cr, zoomOnScroll: bl, zoomOnPinch: Pi, zoomOnDoubleClick: vo, panOnScroll: Ii, panOnScrollSpeed: Ll, panOnScrollMode: yo, panOnDrag: wo, autoPanOnSelection: Mo, onPaneClick: xo, onPaneMouseEnter: _o, onPaneMouseMove: xn, onPaneMouseLeave: _n, onPaneScroll: Ti, onPaneContextMenu: Ri, paneClickDistance: Di, nodeClickDistance: bi, onSelectionContextMenu: B, onSelectionStart: R, onSelectionEnd: H, onReconnect: So, onReconnectStart: Ai, onReconnectEnd: Zn, onEdgeContextMenu: ko, onEdgeDoubleClick: Qn, onEdgeMouseEnter: Al, onEdgeMouseMove: Kn, onEdgeMouseLeave: Nr, reconnectRadius: Mr, defaultMarkerColor: Yn, noDragClassName: Ol, noWheelClassName: Hl, noPanClassName: Qt, rfId: Jn, disableKeyboardA11y: Fi, nodeExtent: sn, viewport: Wl, onViewportChange: Xl, nodesDraggable: Ve }), F.jsx(k_, { onSelectionChange: J }), Li, F.jsx(v_, { proOptions: Oi, position: $i }), F.jsx(y_, { rfId: Jn, disableKeyboardA11y: Fi })] }) });
}
var tk = Jg(ek);
function nk() {
  const t = De();
  return Q.useCallback((r) => {
    const { domNode: i, updateNodeInternals: l } = t.getState(), a = Array.isArray(r) ? r : [r], c = /* @__PURE__ */ new Map();
    a.forEach((f) => {
      const p = i?.querySelector(`.react-flow__node[data-id="${f}"]`);
      p && c.set(f, { id: f, nodeElement: p, force: !0 });
    }), requestAnimationFrame(() => l(c, { triggerFitView: !1 }));
  }, []);
}
function rk({ dimensions: t, lineWidth: r, variant: i, className: l }) {
  return F.jsx("path", { strokeWidth: r, d: `M${t[0] / 2} 0 V${t[1]} M0 ${t[1] / 2} H${t[0]}`, className: We(["react-flow__background-pattern", i, l]) });
}
function ok({ radius: t, className: r }) {
  return F.jsx("circle", { cx: t, cy: t, r: t, className: We(["react-flow__background-pattern", "dots", r]) });
}
var Wn;
(function(t) {
  t.Lines = "lines", t.Dots = "dots", t.Cross = "cross";
})(Wn || (Wn = {}));
const ik = {
  [Wn.Dots]: 1,
  [Wn.Lines]: 1,
  [Wn.Cross]: 6
}, sk = (t) => ({ transform: t.transform, patternId: `pattern-${t.rfId}` });
function Cm({
  id: t,
  variant: r = Wn.Dots,
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
  const v = Q.useRef(null), { transform: y, patternId: x } = Me(sk, je), _ = l || ik[r], M = r === Wn.Dots, E = r === Wn.Cross, C = Array.isArray(i) ? i : [i, i], L = [C[0] * y[2] || 1, C[1] * y[2] || 1], S = _ * y[2], P = Array.isArray(c) ? c : [c, c], V = E ? [S, S] : L, D = [
    P[0] * y[2] + V[0] / 2,
    P[1] * y[2] + V[1] / 2
  ], j = `${x}${t || ""}`;
  return F.jsxs("svg", { className: We(["react-flow__background", g]), style: {
    ...h,
    ...Rl,
    "--xy-background-color-props": p,
    "--xy-background-pattern-color-props": f
  }, ref: v, "data-testid": "rf__background", children: [F.jsx("pattern", { id: j, x: y[0] % L[0], y: y[1] % L[1], width: L[0], height: L[1], patternUnits: "userSpaceOnUse", patternTransform: `translate(-${D[0]},-${D[1]})`, children: M ? F.jsx(ok, { radius: S / 2, className: m }) : F.jsx(rk, { dimensions: V, lineWidth: a, variant: r, className: m }) }), F.jsx("rect", { x: "0", y: "0", width: "100%", height: "100%", fill: `url(#${j})` })] });
}
Cm.displayName = "Background";
const lk = Q.memo(Cm);
function ak() {
  return F.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 32", children: F.jsx("path", { d: "M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z" }) });
}
function uk() {
  return F.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 5", children: F.jsx("path", { d: "M0 0h32v4.2H0z" }) });
}
function ck() {
  return F.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 30", children: F.jsx("path", { d: "M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0027.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94c-.531 0-.939-.4-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z" }) });
}
function fk() {
  return F.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 25 32", children: F.jsx("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z" }) });
}
function dk() {
  return F.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 25 32", children: F.jsx("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047z" }) });
}
function tl({ children: t, className: r, ...i }) {
  return F.jsx("button", { type: "button", className: We(["react-flow__controls-button", r]), ...i, children: t });
}
const pk = (t) => ({
  isInteractive: t.nodesDraggable || t.nodesConnectable || t.elementsSelectable,
  minZoomReached: t.transform[2] <= t.minZoom,
  maxZoomReached: t.transform[2] >= t.maxZoom,
  ariaLabelConfig: t.ariaLabelConfig
});
function Nm({ style: t, showZoom: r = !0, showFitView: i = !0, showInteractive: l = !0, fitViewOptions: a, onZoomIn: c, onZoomOut: f, onFitView: p, onInteractiveChange: h, className: g, children: m, position: v = "bottom-left", orientation: y = "vertical", "aria-label": x }) {
  const _ = De(), { isInteractive: M, minZoomReached: E, maxZoomReached: C, ariaLabelConfig: L } = Me(pk, je), { zoomIn: S, zoomOut: P, fitView: V } = Tl(), D = () => {
    S(), c?.();
  }, j = () => {
    P(), f?.();
  }, Y = () => {
    V(a), p?.();
  }, I = () => {
    _.setState({
      nodesDraggable: !M,
      nodesConnectable: !M,
      elementsSelectable: !M
    }), h?.(!M);
  }, K = y === "horizontal" ? "horizontal" : "vertical";
  return F.jsxs(Il, { className: We(["react-flow__controls", K, g]), position: v, style: t, "data-testid": "rf__controls", "aria-label": x ?? L["controls.ariaLabel"], children: [r && F.jsxs(F.Fragment, { children: [F.jsx(tl, { onClick: D, className: "react-flow__controls-zoomin", title: L["controls.zoomIn.ariaLabel"], "aria-label": L["controls.zoomIn.ariaLabel"], disabled: C, children: F.jsx(ak, {}) }), F.jsx(tl, { onClick: j, className: "react-flow__controls-zoomout", title: L["controls.zoomOut.ariaLabel"], "aria-label": L["controls.zoomOut.ariaLabel"], disabled: E, children: F.jsx(uk, {}) })] }), i && F.jsx(tl, { className: "react-flow__controls-fitview", onClick: Y, title: L["controls.fitView.ariaLabel"], "aria-label": L["controls.fitView.ariaLabel"], children: F.jsx(ck, {}) }), l && F.jsx(tl, { className: "react-flow__controls-interactive", onClick: I, title: L["controls.interactive.ariaLabel"], "aria-label": L["controls.interactive.ariaLabel"], children: M ? F.jsx(dk, {}) : F.jsx(fk, {}) }), m] });
}
Nm.displayName = "Controls";
const hk = Q.memo(Nm);
function gk({ id: t, x: r, y: i, width: l, height: a, style: c, color: f, strokeColor: p, strokeWidth: h, className: g, borderRadius: m, shapeRendering: v, selected: y, onClick: x }) {
  const { background: _, backgroundColor: M } = c || {}, E = f || _ || M;
  return F.jsx("rect", { className: We(["react-flow__minimap-node", { selected: y }, g]), x: r, y: i, rx: m, ry: m, width: l, height: a, style: {
    fill: E,
    stroke: p,
    strokeWidth: h
  }, shapeRendering: v, onClick: x ? (C) => x(C, t) : void 0 });
}
const mk = Q.memo(gk), yk = (t) => t.nodes.map((r) => r.id), Yu = (t) => t instanceof Function ? t : () => t;
function vk({
  nodeStrokeColor: t,
  nodeColor: r,
  nodeClassName: i = "",
  nodeBorderRadius: l = 5,
  nodeStrokeWidth: a,
  /*
   * We need to rename the prop to be `CapitalCase` so that JSX will render it as
   * a component properly.
   */
  nodeComponent: c = mk,
  onClick: f
}) {
  const p = Me(yk, je), h = Yu(r), g = Yu(t), m = Yu(i), v = typeof window > "u" || window.chrome ? "crispEdges" : "geometricPrecision";
  return F.jsx(F.Fragment, { children: p.map((y) => (
    /*
     * The split of responsibilities between MiniMapNodes and
     * NodeComponentWrapper may appear weird. However, it’s designed to
     * minimize the cost of updates when individual nodes change.
     *
     * For more details, see a similar commit in `NodeRenderer/index.tsx`.
     */
    F.jsx(xk, { id: y, nodeColorFunc: h, nodeStrokeColorFunc: g, nodeClassNameFunc: m, nodeBorderRadius: l, nodeStrokeWidth: a, NodeComponent: c, onClick: f, shapeRendering: v }, y)
  )) });
}
function wk({ id: t, nodeColorFunc: r, nodeStrokeColorFunc: i, nodeClassNameFunc: l, nodeBorderRadius: a, nodeStrokeWidth: c, shapeRendering: f, NodeComponent: p, onClick: h }) {
  const { node: g, x: m, y: v, width: y, height: x } = Me((_) => {
    const M = _.nodeLookup.get(t);
    if (!M)
      return { node: void 0, x: 0, y: 0, width: 0, height: 0 };
    const E = M.internals.userNode, { x: C, y: L } = M.internals.positionAbsolute, { width: S, height: P } = Xt(E);
    return {
      node: E,
      x: C,
      y: L,
      width: S,
      height: P
    };
  }, je);
  return !g || g.hidden || !Eg(g) ? null : F.jsx(p, { x: m, y: v, width: y, height: x, style: g.style, selected: !!g.selected, className: l(g), color: r(g), borderRadius: a, strokeColor: i(g), strokeWidth: c, shapeRendering: f, onClick: h, id: g.id });
}
const xk = Q.memo(wk);
var _k = Q.memo(vk);
const Sk = 200, kk = 150, Ek = (t) => !t.hidden, Ck = (t) => {
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
    boundingRect: i ? _g(Ni(t.nodeLookup, { filter: Ek }), r) : r,
    rfId: t.rfId,
    panZoom: t.panZoom,
    translateExtent: t.translateExtent,
    flowWidth: t.width,
    flowHeight: t.height,
    ariaLabelConfig: t.ariaLabelConfig
  };
}, Sh = (t, r) => t.x === r.x && t.y === r.y && t.width === r.width && t.height === r.height, Nk = (t, r) => Sh(t.viewBB, r.viewBB) && Sh(t.boundingRect, r.boundingRect) && t.rfId === r.rfId && t.panZoom === r.panZoom && t.translateExtent === r.translateExtent && t.flowWidth === r.flowWidth && t.flowHeight === r.flowHeight && t.ariaLabelConfig === r.ariaLabelConfig, Mk = "react-flow__minimap-desc";
function Mm({
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
  zoomable: E = !1,
  ariaLabel: C,
  inversePan: L,
  zoomStep: S = 1,
  offsetScale: P = 5
}) {
  const V = De(), D = Q.useRef(null), { boundingRect: j, panZoom: Y, viewBB: I, rfId: K, translateExtent: Z, flowWidth: ee, flowHeight: J, ariaLabelConfig: N } = Me(Ck, Nk), A = t?.width ?? Sk, O = t?.height ?? kk, B = j.width / A, R = j.height / O, H = Math.max(B, R), U = H * A, k = H * O, $ = P * H, ie = j.x - (U - j.width) / 2 - $, re = j.y - (k - j.height) / 2 - $, ae = U + $ * 2, ce = k + $ * 2, ue = `${Mk}-${K}`, q = Q.useRef(0), le = Q.useRef();
  q.current = H, Q.useEffect(() => {
    const Ee = V.getState().panZoom;
    if (D.current && Ee)
      return le.current = H1({
        domNode: D.current,
        panZoom: Ee,
        getTransform: () => V.getState().transform,
        getViewScale: () => q.current
      }), () => {
        le.current?.destroy();
      };
  }, [Y]), Q.useEffect(() => {
    le.current?.update({
      translateExtent: Z,
      width: ee,
      height: J,
      inversePan: L,
      pannable: M,
      zoomStep: S,
      zoomable: E
    });
  }, [M, E, L, S, Z, ee, J]);
  const ve = x ? (Ee) => {
    const [Ce, ze] = le.current?.pointer(Ee) || [0, 0];
    x(Ee, { x: Ce, y: ze });
  } : void 0, Se = Q.useCallback((Ee, Ce) => {
    const ze = V.getState().nodeLookup.get(Ce).internals.userNode;
    _?.(Ee, ze);
  }, [_]), me = _ ? Se : void 0, ye = C ?? N["minimap.ariaLabel"];
  return F.jsx(Il, { position: y, style: {
    ...t,
    "--xy-minimap-background-color-props": typeof h == "string" ? h : void 0,
    "--xy-minimap-mask-background-color-props": typeof g == "string" ? g : void 0,
    "--xy-minimap-mask-stroke-color-props": typeof m == "string" ? m : void 0,
    "--xy-minimap-mask-stroke-width-props": typeof v == "number" ? v * H : void 0,
    "--xy-minimap-node-background-color-props": typeof l == "string" ? l : void 0,
    "--xy-minimap-node-stroke-color-props": typeof i == "string" ? i : void 0,
    "--xy-minimap-node-stroke-width-props": typeof f == "number" ? f : void 0
  }, className: We(["react-flow__minimap", r]), "data-testid": "rf__minimap", children: F.jsxs("svg", { width: A, height: O, viewBox: `${ie} ${re} ${ae} ${ce}`, className: "react-flow__minimap-svg", role: "img", "aria-labelledby": ue, ref: D, onClick: ve, children: [ye && F.jsx("title", { id: ue, children: ye }), F.jsx(_k, { onClick: me, nodeColor: l, nodeStrokeColor: i, nodeBorderRadius: c, nodeClassName: a, nodeStrokeWidth: f, nodeComponent: p }), F.jsx("path", { className: "react-flow__minimap-mask", d: `M${ie - $},${re - $}h${ae + $ * 2}v${ce + $ * 2}h${-ae - $ * 2}z
        M${I.x},${I.y}h${I.width}v${I.height}h${-I.width}z`, fillRule: "evenodd", pointerEvents: "none" })] }) });
}
Mm.displayName = "MiniMap";
const zk = Q.memo(Mm), Pk = (t) => (r) => t ? `${Math.max(1 / r.transform[2], 1)}` : void 0, Ik = {
  [go.Line]: "right",
  [go.Handle]: "bottom-right"
};
function Tk({ nodeId: t, position: r, variant: i = go.Handle, className: l, style: a = void 0, children: c, color: f, minWidth: p = 10, minHeight: h = 10, maxWidth: g = Number.MAX_VALUE, maxHeight: m = Number.MAX_VALUE, keepAspectRatio: v = !1, resizeDirection: y, autoScale: x = !0, shouldResize: _, onResizeStart: M, onResize: E, onResizeEnd: C }) {
  const L = om(), S = typeof t == "string" ? t : L, P = De(), V = Q.useRef(null), D = i === go.Handle, j = Me(Q.useCallback(Pk(D && x), [D, x]), je), Y = Q.useRef(null), I = r ?? Ik[i];
  Q.useEffect(() => {
    if (!(!V.current || !S))
      return Y.current || (Y.current = q1({
        domNode: V.current,
        nodeId: S,
        getStoreItems: () => {
          const { nodeLookup: Z, transform: ee, snapGrid: J, snapToGrid: N, nodeOrigin: A, domNode: O } = P.getState();
          return {
            nodeLookup: Z,
            transform: ee,
            snapGrid: J,
            snapToGrid: N,
            nodeOrigin: A,
            paneDomNode: O
          };
        },
        onChange: (Z, ee) => {
          const { triggerNodeChanges: J, nodeLookup: N, parentLookup: A, nodeOrigin: O } = P.getState(), B = [], R = { x: Z.x, y: Z.y }, H = N.get(S);
          if (H && H.expandParent && H.parentId) {
            const U = H.origin ?? O, k = Z.width ?? H.measured.width ?? 0, $ = Z.height ?? H.measured.height ?? 0, ie = {
              id: H.id,
              parentId: H.parentId,
              rect: {
                width: k,
                height: $,
                ...Cg({
                  x: Z.x ?? H.position.x,
                  y: Z.y ?? H.position.y
                }, { width: k, height: $ }, H.parentId, N, U)
              }
            }, re = Ic([ie], N, A, O);
            B.push(...re), R.x = Z.x ? Math.max(U[0] * k, Z.x) : void 0, R.y = Z.y ? Math.max(U[1] * $, Z.y) : void 0;
          }
          if (R.x !== void 0 && R.y !== void 0) {
            const U = {
              id: S,
              type: "position",
              position: { ...R }
            };
            B.push(U);
          }
          if (Z.width !== void 0 && Z.height !== void 0) {
            const k = {
              id: S,
              type: "dimensions",
              resizing: !0,
              setAttributes: y ? y === "horizontal" ? "width" : "height" : !0,
              dimensions: {
                width: Z.width,
                height: Z.height
              }
            };
            B.push(k);
          }
          for (const U of ee) {
            const k = {
              ...U,
              type: "position"
            };
            B.push(k);
          }
          J(B);
        },
        onEnd: ({ width: Z, height: ee }) => {
          const J = {
            id: S,
            type: "dimensions",
            resizing: !1,
            dimensions: {
              width: Z,
              height: ee
            }
          };
          P.getState().triggerNodeChanges([J]);
        }
      })), Y.current.update({
        controlPosition: I,
        boundaries: {
          minWidth: p,
          minHeight: h,
          maxWidth: g,
          maxHeight: m
        },
        keepAspectRatio: v,
        resizeDirection: y,
        onResizeStart: M,
        onResize: E,
        onResizeEnd: C,
        shouldResize: _
      }), () => {
        Y.current?.destroy();
      };
  }, [
    I,
    p,
    h,
    g,
    m,
    v,
    M,
    E,
    C,
    _
  ]);
  const K = I.split("-");
  return F.jsx("div", { className: We(["react-flow__resize-control", "nodrag", ...K, i, l]), ref: V, style: {
    ...a,
    scale: j,
    ...f && { [D ? "backgroundColor" : "borderColor"]: f }
  }, children: c });
}
Q.memo(Tk);
function Rk({ ids: t }) {
  const r = Me((l) => l.domNode !== null), i = nk();
  return Q.useEffect(() => {
    r && requestAnimationFrame(() => i(t.split(",")));
  }, [r, t, i]), null;
}
const mn = "outputs";
function kh(t, r) {
  const i = /* @__PURE__ */ new Set(), l = (a) => {
    if (!i.has(a)) {
      i.add(a);
      for (const c of Object.values(t.nodes.find((f) => f.id === a)?.inputs ?? {})) c && l(c);
    }
  };
  return r.forEach(l), i;
}
function zm(t, r) {
  const i = (c) => Object.entries(t.outputs).filter(([f, p]) => p && c(f)).map(([, f]) => f), l = kh(t, i((c) => !r.includes(c))), a = kh(t, i((c) => r.includes(c)));
  return new Set([...a].filter((c) => !l.has(c)));
}
const Eh = 260, Dk = 210;
function Hk(t, r = []) {
  const i = /* @__PURE__ */ new Map(), l = (h, g) => {
    if (i.has(h)) return i.get(h);
    if (g.has(h)) return 0;
    g.add(h);
    const m = t.nodes.find((x) => x.id === h), v = Object.values(m?.inputs ?? {}).filter((x) => !!x), y = v.length === 0 ? 0 : 1 + Math.max(...v.map((x) => l(x, g)));
    return i.set(h, y), y;
  };
  t.nodes.forEach((h) => l(h.id, /* @__PURE__ */ new Set()));
  const a = Math.max(0, ...i.values()) + 1, c = zm(t, r), f = (h, g) => {
    const m = /* @__PURE__ */ new Map();
    for (const v of h) {
      const y = i.get(v) ?? 0, x = m.get(y) ?? 0;
      m.set(y, x + 1), p[v] = { x: y * Eh, y: g + x * Dk };
    }
  }, p = {};
  return f(t.nodes.map((h) => h.id).filter((h) => !c.has(h)), 0), p[mn] = { x: a * Eh, y: 0 }, p;
}
function bk({ missing: t, onPlace: r }) {
  const i = Tl(), l = Me((a) => a.domNode);
  return Q.useEffect(() => {
    if (!t || !l) return;
    const a = l.getBoundingClientRect(), c = i.screenToFlowPosition({ x: a.left + a.width / 2, y: a.top + a.height / 2 });
    r(Object.fromEntries(t.split(",").map((f, p) => [f, { x: c.x - 110 + p * 30, y: c.y - 80 + p * 30 }])));
  }, [t, l, i, r]), null;
}
function Lk({ data: t }) {
  const { lib: r, node: i, idle: l, live: a, onParam: c, issues: f } = t, p = r.KINDS[i.kind], h = r.KIND_WORDS[i.kind], g = (m) => i.kind === "subtract" ? m === "a" ? "A - kept" : "B - removed from A" : m === "a" || m === "b" ? m.toUpperCase() : m;
  return /* @__PURE__ */ F.jsxs("div", { className: `zn${l ? " idle" : ""}${p.fixed ? " fixed" : ""}${f.some((m) => !m.warn) ? " has-issue" : ""}`, children: [
    /* @__PURE__ */ F.jsxs("div", { className: "zn-head", children: [
      /* @__PURE__ */ F.jsx("b", { children: h.title }),
      /* @__PURE__ */ F.jsx("span", { className: "zn-id", children: i.id })
    ] }),
    f.map((m) => /* @__PURE__ */ F.jsx("div", { className: m.warn ? "zn-warn" : "zn-issue", children: m.text }, m.text)),
    /* @__PURE__ */ F.jsx("div", { className: "zn-says", children: h.says }),
    Object.entries(p.inputs).map(([m, v]) => (
      // The handle lives INSIDE its row, so it lines up with its label however the sentence above wraps.
      /* @__PURE__ */ F.jsxs("div", { className: "zn-row zn-socket", children: [
        /* @__PURE__ */ F.jsx(Er, { type: "target", position: we.Left, id: m, className: `h-${v.split("|")[0]}` }),
        /* @__PURE__ */ F.jsx("span", { className: "zn-in", children: g(m) }),
        /* @__PURE__ */ F.jsx("span", { className: "zn-type", children: v === "mask|curve" ? "faces or a line" : v === "depthMap" ? "depth map" : v === "mask" ? "faces" : v })
      ] }, m)
    )),
    Object.entries(i.params).map(([m, v]) => {
      const y = r.PARAM_WORDS[m] ?? { label: m, help: "" }, x = a.includes(`${i.id}.${m}`);
      if (r.FIXED.params[i.kind]?.includes(m)) {
        const _ = y.choices?.find(([M]) => M === v)?.[1] ?? String(v);
        return /* @__PURE__ */ F.jsxs("div", { className: "zn-row", title: `${y.help} Fixed in this version: the engine does not read an edit yet.`, children: [
          /* @__PURE__ */ F.jsx("span", { className: "zn-in", children: y.label }),
          /* @__PURE__ */ F.jsxs("span", { className: "zn-fixed", children: [
            _,
            " · fixed"
          ] })
        ] }, m);
      }
      return /* @__PURE__ */ F.jsxs("label", { className: "zn-row", title: x ? `${y.help} LIVE: this one runs today.` : y.help, children: [
        /* @__PURE__ */ F.jsxs("span", { className: "zn-in", children: [
          y.label,
          x && /* @__PURE__ */ F.jsx("b", { className: "zn-live", children: " · live" })
        ] }),
        y.choices ? /* @__PURE__ */ F.jsx("select", { className: "nodrag", defaultValue: String(v), onChange: (_) => c(i.id, m, _.target.value), children: y.choices.map(([_, M]) => /* @__PURE__ */ F.jsx("option", { value: _, children: M }, _)) }) : /* @__PURE__ */ F.jsx(
          "input",
          {
            className: "nodrag",
            defaultValue: String(v),
            type: "number",
            step: "any",
            onBlur: (_) => c(i.id, m, Number(_.target.value))
          }
        )
      ] }, `${m}=${String(v)}`);
    }),
    l && /* @__PURE__ */ F.jsx("div", { className: "zn-note", children: "Not connected to the output - not run, costs nothing." }),
    p.fixed && /* @__PURE__ */ F.jsx("div", { className: "zn-note", children: "Found in stage 1 (Orient); fixed here." }),
    /* @__PURE__ */ F.jsxs("div", { className: "zn-row zn-out-row", children: [
      /* @__PURE__ */ F.jsxs("span", { className: "zn-outtype", children: [
        "gives ",
        p.out === "mask" ? "faces" : p.out === "depthMap" ? "a depth map" : p.out === "position" ? "a point" : "a line"
      ] }),
      /* @__PURE__ */ F.jsx(Er, { type: "source", position: we.Right, id: "out", className: `h-${p.out}` })
    ] })
  ] });
}
const Ak = ["rim", "rim_band", "low_rim_band"];
function $k({ data: t }) {
  const { lib: r, filled: i } = t;
  return /* @__PURE__ */ F.jsxs("div", { className: "zo", children: [
    /* @__PURE__ */ F.jsx("div", { className: "zn-head", children: /* @__PURE__ */ F.jsx("b", { children: "Zone output" }) }),
    /* @__PURE__ */ F.jsx("div", { className: "zn-says", children: "What the engine reads. Each socket below decides one thing about where tips may go." }),
    Object.entries(r.REQUIRED_OUTPUTS).map(([l, a]) => /* @__PURE__ */ F.jsxs("div", { className: `zn-row zn-socket zo-row${i[l] ? "" : " empty"}${r.FIXED.outputs.includes(l) ? " fixed" : ""}`, title: r.OUTPUT_WORDS[l].says, children: [
      r.FIXED.outputs.includes(l) ? /* @__PURE__ */ F.jsx("span", { className: "zo-set", "aria-hidden": "true", children: "✓" }) : /* @__PURE__ */ F.jsx(Er, { type: "target", position: we.Left, id: l, className: `h-${a}` }),
      /* @__PURE__ */ F.jsxs("div", { children: [
        /* @__PURE__ */ F.jsx("b", { children: r.OUTPUT_WORDS[l].title }),
        r.FIXED.outputs.includes(l) && /* @__PURE__ */ F.jsxs("span", { className: "zo-from", children: [
          " · already set ",
          Ak.includes(l) ? "in Orient" : "by the engine"
        ] }),
        /* @__PURE__ */ F.jsx("div", { className: "zo-says", children: r.OUTPUT_WORDS[l].says })
      ] })
    ] }, l))
  ] });
}
const Ok = { zone: Lk, zoneOutput: $k };
function Ch({ lib: t, graph: r, positions: i, liveParams: l = [], onGraph: a, onPositions: c }) {
  const f = Q.useMemo(() => new Set(t.unreached(r)), [t, r]), p = Q.useMemo(() => zm(r, t.FIXED.outputs), [r, t]), h = Q.useMemo(() => {
    const { problems: I, warnings: K } = t.validate(r), Z = /* @__PURE__ */ new Map(), ee = (J, N) => {
      const A = J.indexOf(": "), O = A > 0 ? J.slice(0, A) : "";
      r.nodes.some((B) => B.id === O) && Z.set(O, [...Z.get(O) ?? [], { text: J.slice(A + 2), warn: N }]);
    };
    return I.forEach((J) => ee(J, !1)), K.forEach((J) => ee(J, !0)), Z;
  }, [t, r]), g = Q.useCallback((I, K, Z) => a(t.setParam(r, I, K, Z)), [t, r, a]), m = Q.useMemo(() => [
    // What only a fixed output needs (the rim line and its strips from Orient, the sockets) is not
    // drawn: the owner's call, 2026-11-20 - "no reason to make it into a node, just show it is already
    // set". It stays in the graph, because the engine checks those outputs by name.
    ...r.nodes.filter((I) => !p.has(I.id)).map((I) => ({
      id: I.id,
      type: "zone",
      position: i[I.id] ?? { x: 0, y: 0 },
      deletable: !t.KINDS[I.kind].fixed,
      data: { lib: t, node: I, idle: f.has(I.id), live: l, onParam: g, issues: h.get(I.id) ?? [] }
    })),
    {
      id: mn,
      type: "zoneOutput",
      position: i[mn] ?? { x: 0, y: 0 },
      deletable: !1,
      data: { lib: t, filled: Object.fromEntries(Object.keys(t.REQUIRED_OUTPUTS).map((I) => [I, !!r.outputs[I]])) }
    }
  ], [r, i, t, f, l, g, h, p]), [v, y] = Q.useState(m);
  Q.useEffect(() => {
    y((I) => m.map((K) => {
      const Z = I.find((ee) => ee.id === K.id);
      return Z ? { ...K, measured: Z.measured, selected: Z.selected } : K;
    }));
  }, [m]);
  const x = Q.useCallback((I) => y((K) => Gg(I, K)), []), _ = Q.useMemo(() => [
    ...r.nodes.filter((I) => !p.has(I.id)).flatMap((I) => Object.entries(I.inputs).filter(([, K]) => K && !p.has(K)).map(([K, Z]) => ({
      id: `${Z}->${I.id}.${K}`,
      source: Z,
      sourceHandle: "out",
      target: I.id,
      targetHandle: K
    }))),
    ...Object.entries(r.outputs).filter(([I, K]) => K && !t.FIXED.outputs.includes(I)).map(([I, K]) => ({
      id: `${K}->${mn}.${I}`,
      source: K,
      sourceHandle: "out",
      target: mn,
      targetHandle: I,
      className: "to-output"
    }))
  ], [r, p, t]), [M, E] = Q.useState(_);
  Q.useEffect(() => {
    E((I) => _.map((K) => ({ ...K, selected: I.find((Z) => Z.id === K.id)?.selected ?? !1 })));
  }, [_]);
  const C = Q.useCallback((I) => E((K) => qg(I, K)), []), L = Q.useCallback((I) => {
    const K = r.nodes.find((N) => N.id === I.source);
    if (!K || I.source === I.target) return !1;
    const Z = t.KINDS[K.kind].out;
    if (I.target === mn) return !!I.targetHandle && !t.FIXED.outputs.includes(I.targetHandle) && t.REQUIRED_OUTPUTS[I.targetHandle] === Z;
    const ee = r.nodes.find((N) => N.id === I.target), J = ee && I.targetHandle ? t.KINDS[ee.kind].inputs[I.targetHandle] : void 0;
    return !!(J && J.split("|").includes(Z));
  }, [r, t]), S = Q.useCallback((I) => {
    !I.source || !I.target || (I.target === mn ? I.targetHandle && a(t.bindOutput(r, I.targetHandle, I.source)) : I.targetHandle && a(t.rewire(r, I.target, I.targetHandle, I.source)));
  }, [r, t, a]), P = Q.useCallback((I) => {
    let K = r;
    for (const Z of I)
      Z.target === mn ? Z.targetHandle && (K = t.bindOutput(K, Z.targetHandle, null)) : Z.targetHandle && (K = t.rewire(K, Z.target, Z.targetHandle, null));
    a(K);
  }, [r, t, a]), V = Q.useCallback((I) => {
    let K = r;
    for (const Z of I) Z.type === "zone" && (K = t.removeNode(K, Z.id));
    a(K);
  }, [r, t, a]), D = Q.useCallback((I, K) => c({ ...i, [K.id]: K.position }), [i, c]), j = Q.useMemo(() => ({
    minZoom: 0.6,
    padding: 0.05,
    nodes: [...r.nodes.filter((I) => !p.has(I.id)).map((I) => ({ id: I.id })), { id: mn }]
  }), [r, p]), Y = Q.useCallback((I) => c({ ...i, ...I }), [i, c]);
  return /* @__PURE__ */ F.jsxs(
    tk,
    {
      nodes: v,
      edges: M,
      nodeTypes: Ok,
      isValidConnection: L,
      onConnect: S,
      onEdgesDelete: P,
      onNodesDelete: V,
      onNodeDragStop: D,
      onNodesChange: x,
      onEdgesChange: C,
      deleteKeyCode: ["Backspace", "Delete"],
      fitView: !0,
      fitViewOptions: j,
      minZoom: 0.2,
      proOptions: { hideAttribution: !1 },
      children: [
        /* @__PURE__ */ F.jsx(Rk, { ids: v.map((I) => I.id).join(",") }),
        /* @__PURE__ */ F.jsx(bk, { missing: r.nodes.filter((I) => !i[I.id]).map((I) => I.id).join(","), onPlace: Y }),
        /* @__PURE__ */ F.jsx(lk, {}),
        /* @__PURE__ */ F.jsx(hk, { fitViewOptions: j }),
        /* @__PURE__ */ F.jsx(zk, { pannable: !0, zoomable: !0 })
      ]
    }
  );
}
let Nh = !1;
function jk(t, r) {
  if (!Nh) {
    const l = document.createElement("style");
    l.dataset.ui = "node-editor-css", l.textContent = gy, document.head.append(l), Nh = !0;
  }
  const i = hy.createRoot(t);
  return i.render(/* @__PURE__ */ F.jsx(Ch, { ...r })), {
    update: (l) => i.render(/* @__PURE__ */ F.jsx(Ch, { ...l })),
    unmount: () => i.unmount()
  };
}
export {
  Hk as autoLayout,
  jk as mountZoneEditor
};
