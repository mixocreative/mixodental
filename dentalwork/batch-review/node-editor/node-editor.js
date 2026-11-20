/* node-editor sources b3bce3f4ccf3b03d - rebuild with npm run review:editor */
/*! Contains third-party code - React, React DOM, @xyflow/react and their dependencies, each MIT or ISC. Full licence texts: THIRD-PARTY-NOTICES.txt, written by npm run build. */
function Ch(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var Cu = { exports: {} }, li = {}, Nu = { exports: {} }, Ne = {};
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
function oy() {
  if (tp) return Ne;
  tp = 1;
  var t = Symbol.for("react.element"), r = Symbol.for("react.portal"), i = Symbol.for("react.fragment"), s = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), c = Symbol.for("react.provider"), f = Symbol.for("react.context"), p = Symbol.for("react.forward_ref"), h = Symbol.for("react.suspense"), g = Symbol.for("react.memo"), m = Symbol.for("react.lazy"), w = Symbol.iterator;
  function y(k) {
    return k === null || typeof k != "object" ? null : (k = w && k[w] || k["@@iterator"], typeof k == "function" ? k : null);
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
  function A(k, $, ie) {
    this.props = k, this.context = $, this.refs = M, this.updater = ie || x;
  }
  var S = A.prototype = new C();
  S.constructor = A, _(S, E.prototype), S.isPureReactComponent = !0;
  var P = Array.isArray, T = Object.prototype.hasOwnProperty, I = { current: null }, D = { key: !0, ref: !0, __self: !0, __source: !0 };
  function Y(k, $, ie) {
    var re, ae = {}, ce = null, ue = null;
    if ($ != null) for (re in $.ref !== void 0 && (ue = $.ref), $.key !== void 0 && (ce = "" + $.key), $) T.call($, re) && !D.hasOwnProperty(re) && (ae[re] = $[re]);
    var Q = arguments.length - 2;
    if (Q === 1) ae.children = ie;
    else if (1 < Q) {
      for (var se = Array(Q), ve = 0; ve < Q; ve++) se[ve] = arguments[ve + 2];
      ae.children = se;
    }
    if (k && k.defaultProps) for (re in Q = k.defaultProps, Q) ae[re] === void 0 && (ae[re] = Q[re]);
    return { $$typeof: t, type: k, key: ce, ref: ue, props: ae, _owner: I.current };
  }
  function X(k, $) {
    return { $$typeof: t, type: k.type, key: $, ref: k.ref, props: k.props, _owner: k._owner };
  }
  function J(k) {
    return typeof k == "object" && k !== null && k.$$typeof === t;
  }
  function q(k) {
    var $ = { "=": "=0", ":": "=2" };
    return "$" + k.replace(/[=:]/g, function(ie) {
      return $[ie];
    });
  }
  var ee = /\/+/g;
  function G(k, $) {
    return typeof k == "object" && k !== null && k.key != null ? q("" + k.key) : $.toString(36);
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
    if (ue) return ue = k, ae = ae(ue), k = re === "" ? "." + G(ue, 0) : re, P(ae) ? (ie = "", k != null && (ie = k.replace(ee, "$&/") + "/"), N(ae, $, ie, "", function(ve) {
      return ve;
    })) : ae != null && (J(ae) && (ae = X(ae, ie + (!ae.key || ue && ue.key === ae.key ? "" : ("" + ae.key).replace(ee, "$&/") + "/") + k)), $.push(ae)), 1;
    if (ue = 0, re = re === "" ? "." : re + ":", P(k)) for (var Q = 0; Q < k.length; Q++) {
      ce = k[Q];
      var se = re + G(ce, Q);
      ue += N(ce, $, ie, se, ae);
    }
    else if (se = y(k), typeof se == "function") for (k = se.call(k), Q = 0; !(ce = k.next()).done; ) ce = ce.value, se = re + G(ce, Q++), ue += N(ce, $, ie, se, ae);
    else if (ce === "object") throw $ = String(k), Error("Objects are not valid as a React child (found: " + ($ === "[object Object]" ? "object with keys {" + Object.keys(k).join(", ") + "}" : $) + "). If you meant to render a collection of children, use an array instead.");
    return ue;
  }
  function H(k, $, ie) {
    if (k == null) return k;
    var re = [], ae = 0;
    return N(k, re, "", "", function(ce) {
      return $.call(ie, ce, ae++);
    }), re;
  }
  function F(k) {
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
  var j = { current: null }, R = { transition: null }, O = { ReactCurrentDispatcher: j, ReactCurrentBatchConfig: R, ReactCurrentOwner: I };
  function V() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return Ne.Children = { map: H, forEach: function(k, $, ie) {
    H(k, function() {
      $.apply(this, arguments);
    }, ie);
  }, count: function(k) {
    var $ = 0;
    return H(k, function() {
      $++;
    }), $;
  }, toArray: function(k) {
    return H(k, function($) {
      return $;
    }) || [];
  }, only: function(k) {
    if (!J(k)) throw Error("React.Children.only expected to receive a single React element child.");
    return k;
  } }, Ne.Component = E, Ne.Fragment = i, Ne.Profiler = a, Ne.PureComponent = A, Ne.StrictMode = s, Ne.Suspense = h, Ne.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = O, Ne.act = V, Ne.cloneElement = function(k, $, ie) {
    if (k == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + k + ".");
    var re = _({}, k.props), ae = k.key, ce = k.ref, ue = k._owner;
    if ($ != null) {
      if ($.ref !== void 0 && (ce = $.ref, ue = I.current), $.key !== void 0 && (ae = "" + $.key), k.type && k.type.defaultProps) var Q = k.type.defaultProps;
      for (se in $) T.call($, se) && !D.hasOwnProperty(se) && (re[se] = $[se] === void 0 && Q !== void 0 ? Q[se] : $[se]);
    }
    var se = arguments.length - 2;
    if (se === 1) re.children = ie;
    else if (1 < se) {
      Q = Array(se);
      for (var ve = 0; ve < se; ve++) Q[ve] = arguments[ve + 2];
      re.children = Q;
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
  }, Ne.isValidElement = J, Ne.lazy = function(k) {
    return { $$typeof: m, _payload: { _status: -1, _result: k }, _init: F };
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
  }, Ne.unstable_act = V, Ne.useCallback = function(k, $) {
    return j.current.useCallback(k, $);
  }, Ne.useContext = function(k) {
    return j.current.useContext(k);
  }, Ne.useDebugValue = function() {
  }, Ne.useDeferredValue = function(k) {
    return j.current.useDeferredValue(k);
  }, Ne.useEffect = function(k, $) {
    return j.current.useEffect(k, $);
  }, Ne.useId = function() {
    return j.current.useId();
  }, Ne.useImperativeHandle = function(k, $, ie) {
    return j.current.useImperativeHandle(k, $, ie);
  }, Ne.useInsertionEffect = function(k, $) {
    return j.current.useInsertionEffect(k, $);
  }, Ne.useLayoutEffect = function(k, $) {
    return j.current.useLayoutEffect(k, $);
  }, Ne.useMemo = function(k, $) {
    return j.current.useMemo(k, $);
  }, Ne.useReducer = function(k, $, ie) {
    return j.current.useReducer(k, $, ie);
  }, Ne.useRef = function(k) {
    return j.current.useRef(k);
  }, Ne.useState = function(k) {
    return j.current.useState(k);
  }, Ne.useSyncExternalStore = function(k, $, ie) {
    return j.current.useSyncExternalStore(k, $, ie);
  }, Ne.useTransition = function() {
    return j.current.useTransition();
  }, Ne.version = "18.3.1", Ne;
}
var np;
function Si() {
  return np || (np = 1, Nu.exports = oy()), Nu.exports;
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
function iy() {
  if (rp) return li;
  rp = 1;
  var t = Si(), r = Symbol.for("react.element"), i = Symbol.for("react.fragment"), s = Object.prototype.hasOwnProperty, a = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, c = { key: !0, ref: !0, __self: !0, __source: !0 };
  function f(p, h, g) {
    var m, w = {}, y = null, x = null;
    g !== void 0 && (y = "" + g), h.key !== void 0 && (y = "" + h.key), h.ref !== void 0 && (x = h.ref);
    for (m in h) s.call(h, m) && !c.hasOwnProperty(m) && (w[m] = h[m]);
    if (p && p.defaultProps) for (m in h = p.defaultProps, h) w[m] === void 0 && (w[m] = h[m]);
    return { $$typeof: r, type: p, key: y, ref: x, props: w, _owner: a.current };
  }
  return li.Fragment = i, li.jsx = f, li.jsxs = f, li;
}
var op;
function ly() {
  return op || (op = 1, Cu.exports = iy()), Cu.exports;
}
var U = ly(), Yl = {}, Mu = { exports: {} }, gt = {}, zu = { exports: {} }, Pu = {};
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
function sy() {
  return ip || (ip = 1, (function(t) {
    function r(R, O) {
      var V = R.length;
      R.push(O);
      e: for (; 0 < V; ) {
        var k = V - 1 >>> 1, $ = R[k];
        if (0 < a($, O)) R[k] = O, R[V] = $, V = k;
        else break e;
      }
    }
    function i(R) {
      return R.length === 0 ? null : R[0];
    }
    function s(R) {
      if (R.length === 0) return null;
      var O = R[0], V = R.pop();
      if (V !== O) {
        R[0] = V;
        e: for (var k = 0, $ = R.length, ie = $ >>> 1; k < ie; ) {
          var re = 2 * (k + 1) - 1, ae = R[re], ce = re + 1, ue = R[ce];
          if (0 > a(ae, V)) ce < $ && 0 > a(ue, ae) ? (R[k] = ue, R[ce] = V, k = ce) : (R[k] = ae, R[re] = V, k = re);
          else if (ce < $ && 0 > a(ue, V)) R[k] = ue, R[ce] = V, k = ce;
          else break e;
        }
      }
      return O;
    }
    function a(R, O) {
      var V = R.sortIndex - O.sortIndex;
      return V !== 0 ? V : R.id - O.id;
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
    var h = [], g = [], m = 1, w = null, y = 3, x = !1, _ = !1, M = !1, E = typeof setTimeout == "function" ? setTimeout : null, C = typeof clearTimeout == "function" ? clearTimeout : null, A = typeof setImmediate < "u" ? setImmediate : null;
    typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function S(R) {
      for (var O = i(g); O !== null; ) {
        if (O.callback === null) s(g);
        else if (O.startTime <= R) s(g), O.sortIndex = O.expirationTime, r(h, O);
        else break;
        O = i(g);
      }
    }
    function P(R) {
      if (M = !1, S(R), !_) if (i(h) !== null) _ = !0, F(T);
      else {
        var O = i(g);
        O !== null && j(P, O.startTime - R);
      }
    }
    function T(R, O) {
      _ = !1, M && (M = !1, C(Y), Y = -1), x = !0;
      var V = y;
      try {
        for (S(O), w = i(h); w !== null && (!(w.expirationTime > O) || R && !q()); ) {
          var k = w.callback;
          if (typeof k == "function") {
            w.callback = null, y = w.priorityLevel;
            var $ = k(w.expirationTime <= O);
            O = t.unstable_now(), typeof $ == "function" ? w.callback = $ : w === i(h) && s(h), S(O);
          } else s(h);
          w = i(h);
        }
        if (w !== null) var ie = !0;
        else {
          var re = i(g);
          re !== null && j(P, re.startTime - O), ie = !1;
        }
        return ie;
      } finally {
        w = null, y = V, x = !1;
      }
    }
    var I = !1, D = null, Y = -1, X = 5, J = -1;
    function q() {
      return !(t.unstable_now() - J < X);
    }
    function ee() {
      if (D !== null) {
        var R = t.unstable_now();
        J = R;
        var O = !0;
        try {
          O = D(!0, R);
        } finally {
          O ? G() : (I = !1, D = null);
        }
      } else I = !1;
    }
    var G;
    if (typeof A == "function") G = function() {
      A(ee);
    };
    else if (typeof MessageChannel < "u") {
      var N = new MessageChannel(), H = N.port2;
      N.port1.onmessage = ee, G = function() {
        H.postMessage(null);
      };
    } else G = function() {
      E(ee, 0);
    };
    function F(R) {
      D = R, I || (I = !0, G());
    }
    function j(R, O) {
      Y = E(function() {
        R(t.unstable_now());
      }, O);
    }
    t.unstable_IdlePriority = 5, t.unstable_ImmediatePriority = 1, t.unstable_LowPriority = 4, t.unstable_NormalPriority = 3, t.unstable_Profiling = null, t.unstable_UserBlockingPriority = 2, t.unstable_cancelCallback = function(R) {
      R.callback = null;
    }, t.unstable_continueExecution = function() {
      _ || x || (_ = !0, F(T));
    }, t.unstable_forceFrameRate = function(R) {
      0 > R || 125 < R ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : X = 0 < R ? Math.floor(1e3 / R) : 5;
    }, t.unstable_getCurrentPriorityLevel = function() {
      return y;
    }, t.unstable_getFirstCallbackNode = function() {
      return i(h);
    }, t.unstable_next = function(R) {
      switch (y) {
        case 1:
        case 2:
        case 3:
          var O = 3;
          break;
        default:
          O = y;
      }
      var V = y;
      y = O;
      try {
        return R();
      } finally {
        y = V;
      }
    }, t.unstable_pauseExecution = function() {
    }, t.unstable_requestPaint = function() {
    }, t.unstable_runWithPriority = function(R, O) {
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
      var V = y;
      y = R;
      try {
        return O();
      } finally {
        y = V;
      }
    }, t.unstable_scheduleCallback = function(R, O, V) {
      var k = t.unstable_now();
      switch (typeof V == "object" && V !== null ? (V = V.delay, V = typeof V == "number" && 0 < V ? k + V : k) : V = k, R) {
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
      return $ = V + $, R = { id: m++, callback: O, priorityLevel: R, startTime: V, expirationTime: $, sortIndex: -1 }, V > k ? (R.sortIndex = V, r(g, R), i(h) === null && R === i(g) && (M ? (C(Y), Y = -1) : M = !0, j(P, V - k))) : (R.sortIndex = $, r(h, R), _ || x || (_ = !0, F(T))), R;
    }, t.unstable_shouldYield = q, t.unstable_wrapCallback = function(R) {
      var O = y;
      return function() {
        var V = y;
        y = O;
        try {
          return R.apply(this, arguments);
        } finally {
          y = V;
        }
      };
    };
  })(Pu)), Pu;
}
var lp;
function ay() {
  return lp || (lp = 1, zu.exports = sy()), zu.exports;
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
var sp;
function uy() {
  if (sp) return gt;
  sp = 1;
  var t = Si(), r = ay();
  function i(e) {
    for (var n = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, o = 1; o < arguments.length; o++) n += "&args[]=" + encodeURIComponent(arguments[o]);
    return "Minified React error #" + e + "; visit " + n + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  var s = /* @__PURE__ */ new Set(), a = {};
  function c(e, n) {
    f(e, n), f(e + "Capture", n);
  }
  function f(e, n) {
    for (a[e] = n, e = 0; e < n.length; e++) s.add(n[e]);
  }
  var p = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), h = Object.prototype.hasOwnProperty, g = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, m = {}, w = {};
  function y(e) {
    return h.call(w, e) ? !0 : h.call(m, e) ? !1 : g.test(e) ? w[e] = !0 : (m[e] = !0, !1);
  }
  function x(e, n, o, l) {
    if (o !== null && o.type === 0) return !1;
    switch (typeof n) {
      case "function":
      case "symbol":
        return !0;
      case "boolean":
        return l ? !1 : o !== null ? !o.acceptsBooleans : (e = e.toLowerCase().slice(0, 5), e !== "data-" && e !== "aria-");
      default:
        return !1;
    }
  }
  function _(e, n, o, l) {
    if (n === null || typeof n > "u" || x(e, n, o, l)) return !0;
    if (l) return !1;
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
  function M(e, n, o, l, u, d, v) {
    this.acceptsBooleans = n === 2 || n === 3 || n === 4, this.attributeName = l, this.attributeNamespace = u, this.mustUseProperty = o, this.propertyName = e, this.type = n, this.sanitizeURL = d, this.removeEmptyString = v;
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
  function A(e) {
    return e[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
    var n = e.replace(
      C,
      A
    );
    E[n] = new M(n, 1, !1, e, null, !1, !1);
  }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
    var n = e.replace(C, A);
    E[n] = new M(n, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
  }), ["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
    var n = e.replace(C, A);
    E[n] = new M(n, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
  }), ["tabIndex", "crossOrigin"].forEach(function(e) {
    E[e] = new M(e, 1, !1, e.toLowerCase(), null, !1, !1);
  }), E.xlinkHref = new M("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), ["src", "href", "action", "formAction"].forEach(function(e) {
    E[e] = new M(e, 1, !1, e.toLowerCase(), null, !0, !0);
  });
  function S(e, n, o, l) {
    var u = E.hasOwnProperty(n) ? E[n] : null;
    (u !== null ? u.type !== 0 : l || !(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && (_(n, o, u, l) && (o = null), l || u === null ? y(n) && (o === null ? e.removeAttribute(n) : e.setAttribute(n, "" + o)) : u.mustUseProperty ? e[u.propertyName] = o === null ? u.type === 3 ? !1 : "" : o : (n = u.attributeName, l = u.attributeNamespace, o === null ? e.removeAttribute(n) : (u = u.type, o = u === 3 || u === 4 && o === !0 ? "" : "" + o, l ? e.setAttributeNS(l, n, o) : e.setAttribute(n, o))));
  }
  var P = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, T = Symbol.for("react.element"), I = Symbol.for("react.portal"), D = Symbol.for("react.fragment"), Y = Symbol.for("react.strict_mode"), X = Symbol.for("react.profiler"), J = Symbol.for("react.provider"), q = Symbol.for("react.context"), ee = Symbol.for("react.forward_ref"), G = Symbol.for("react.suspense"), N = Symbol.for("react.suspense_list"), H = Symbol.for("react.memo"), F = Symbol.for("react.lazy"), j = Symbol.for("react.offscreen"), R = Symbol.iterator;
  function O(e) {
    return e === null || typeof e != "object" ? null : (e = R && e[R] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var V = Object.assign, k;
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
        } catch (Z) {
          var l = Z;
        }
        Reflect.construct(e, [], n);
      } else {
        try {
          n.call();
        } catch (Z) {
          l = Z;
        }
        e.call(n.prototype);
      }
      else {
        try {
          throw Error();
        } catch (Z) {
          l = Z;
        }
        e();
      }
    } catch (Z) {
      if (Z && l && typeof Z.stack == "string") {
        for (var u = Z.stack.split(`
`), d = l.stack.split(`
`), v = u.length - 1, z = d.length - 1; 1 <= v && 0 <= z && u[v] !== d[z]; ) z--;
        for (; 1 <= v && 0 <= z; v--, z--) if (u[v] !== d[z]) {
          if (v !== 1 || z !== 1)
            do
              if (v--, z--, 0 > z || u[v] !== d[z]) {
                var b = `
` + u[v].replace(" at new ", " at ");
                return e.displayName && b.includes("<anonymous>") && (b = b.replace("<anonymous>", e.displayName)), b;
              }
            while (1 <= v && 0 <= z);
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
      case D:
        return "Fragment";
      case I:
        return "Portal";
      case X:
        return "Profiler";
      case Y:
        return "StrictMode";
      case G:
        return "Suspense";
      case N:
        return "SuspenseList";
    }
    if (typeof e == "object") switch (e.$$typeof) {
      case q:
        return (e.displayName || "Context") + ".Consumer";
      case J:
        return (e._context.displayName || "Context") + ".Provider";
      case ee:
        var n = e.render;
        return e = e.displayName, e || (e = n.displayName || n.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
      case H:
        return n = e.displayName || null, n !== null ? n : ce(e.type) || "Memo";
      case F:
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
  function Q(e) {
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
  function se(e) {
    var n = e.type;
    return (e = e.nodeName) && e.toLowerCase() === "input" && (n === "checkbox" || n === "radio");
  }
  function ve(e) {
    var n = se(e) ? "checked" : "value", o = Object.getOwnPropertyDescriptor(e.constructor.prototype, n), l = "" + e[n];
    if (!e.hasOwnProperty(n) && typeof o < "u" && typeof o.get == "function" && typeof o.set == "function") {
      var u = o.get, d = o.set;
      return Object.defineProperty(e, n, { configurable: !0, get: function() {
        return u.call(this);
      }, set: function(v) {
        l = "" + v, d.call(this, v);
      } }), Object.defineProperty(e, n, { enumerable: o.enumerable }), { getValue: function() {
        return l;
      }, setValue: function(v) {
        l = "" + v;
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
    var o = n.getValue(), l = "";
    return e && (l = se(e) ? e.checked ? "true" : "false" : e.value), e = l, e !== o ? (n.setValue(e), !0) : !1;
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
    return V({}, n, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: o ?? e._wrapperState.initialChecked });
  }
  function Ce(e, n) {
    var o = n.defaultValue == null ? "" : n.defaultValue, l = n.checked != null ? n.checked : n.defaultChecked;
    o = Q(n.value != null ? n.value : o), e._wrapperState = { initialChecked: l, initialValue: o, controlled: n.type === "checkbox" || n.type === "radio" ? n.checked != null : n.value != null };
  }
  function ze(e, n) {
    n = n.checked, n != null && S(e, "checked", n, !1);
  }
  function Ve(e, n) {
    ze(e, n);
    var o = Q(n.value), l = n.type;
    if (o != null) l === "number" ? (o === 0 && e.value === "" || e.value != o) && (e.value = "" + o) : e.value !== "" + o && (e.value = "" + o);
    else if (l === "submit" || l === "reset") {
      e.removeAttribute("value");
      return;
    }
    n.hasOwnProperty("value") ? at(e, n.type, o) : n.hasOwnProperty("defaultValue") && at(e, n.type, Q(n.defaultValue)), n.checked == null && n.defaultChecked != null && (e.defaultChecked = !!n.defaultChecked);
  }
  function Ct(e, n, o) {
    if (n.hasOwnProperty("value") || n.hasOwnProperty("defaultValue")) {
      var l = n.type;
      if (!(l !== "submit" && l !== "reset" || n.value !== void 0 && n.value !== null)) return;
      n = "" + e._wrapperState.initialValue, o || n === e.value || (e.value = n), e.defaultValue = n;
    }
    o = e.name, o !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, o !== "" && (e.name = o);
  }
  function at(e, n, o) {
    (n !== "number" || ye(e.ownerDocument) !== e) && (o == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + o && (e.defaultValue = "" + o));
  }
  var et = Array.isArray;
  function tt(e, n, o, l) {
    if (e = e.options, n) {
      n = {};
      for (var u = 0; u < o.length; u++) n["$" + o[u]] = !0;
      for (o = 0; o < e.length; o++) u = n.hasOwnProperty("$" + e[o].value), e[o].selected !== u && (e[o].selected = u), u && l && (e[o].defaultSelected = !0);
    } else {
      for (o = "" + Q(o), n = null, u = 0; u < e.length; u++) {
        if (e[u].value === o) {
          e[u].selected = !0, l && (e[u].defaultSelected = !0);
          return;
        }
        n !== null || e[u].disabled || (n = e[u]);
      }
      n !== null && (n.selected = !0);
    }
  }
  function ln(e, n) {
    if (n.dangerouslySetInnerHTML != null) throw Error(i(91));
    return V({}, n, { value: void 0, defaultValue: void 0, children: "" + e._wrapperState.initialValue });
  }
  function Zt(e, n) {
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
    e._wrapperState = { initialValue: Q(o) };
  }
  function Qt(e, n) {
    var o = Q(n.value), l = Q(n.defaultValue);
    o != null && (o = "" + o, o !== e.value && (e.value = o), n.defaultValue == null && e.defaultValue !== o && (e.defaultValue = o)), l != null && (e.defaultValue = "" + l);
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
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(n, o, l, u) {
      MSApp.execUnsafeLocalFunction(function() {
        return e(n, o, l, u);
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
  var Xn = {
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
  }, Rs = ["Webkit", "ms", "Moz", "O"];
  Object.keys(Xn).forEach(function(e) {
    Rs.forEach(function(n) {
      n = n + e.charAt(0).toUpperCase() + e.substring(1), Xn[n] = Xn[e];
    });
  });
  function Pi(e, n, o) {
    return n == null || typeof n == "boolean" || n === "" ? "" : o || typeof n != "number" || n === 0 || Xn.hasOwnProperty(e) && Xn[e] ? ("" + n).trim() : n + "px";
  }
  function Ii(e, n) {
    e = e.style;
    for (var o in n) if (n.hasOwnProperty(o)) {
      var l = o.indexOf("--") === 0, u = Pi(o, n[o], l);
      o === "float" && (o = "cssFloat"), l ? e.setProperty(o, u) : e[o] = u;
    }
  }
  var Ds = V({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
  function yo(e, n) {
    if (n) {
      if (Ds[e] && (n.children != null || n.dangerouslySetInnerHTML != null)) throw Error(i(137, e));
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
      n && (n = sl(n), _o(e.stateNode, e.type, n));
    }
  }
  function bi(e) {
    xn ? _n ? _n.push(e) : _n = [e] : xn = e;
  }
  function Ri() {
    if (xn) {
      var e = xn, n = _n;
      if (_n = xn = null, Ti(e), n) for (e = 0; e < n.length; e++) Ti(n[e]);
    }
  }
  function Di(e, n) {
    return e(n);
  }
  function Li() {
  }
  var So = !1;
  function Ai(e, n, o) {
    if (So) return e(n, o);
    So = !0;
    try {
      return Di(e, n, o);
    } finally {
      So = !1, (xn !== null || _n !== null) && (Li(), Ri());
    }
  }
  function Zn(e, n) {
    var o = e.stateNode;
    if (o === null) return null;
    var l = sl(o);
    if (l === null) return null;
    o = l[n];
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
        (l = !l.disabled) || (e = e.type, l = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !l;
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
  function Ls(e, n, o, l, u, d, v, z, b) {
    var Z = Array.prototype.slice.call(arguments, 3);
    try {
      n.apply(o, Z);
    } catch (ne) {
      this.onError(ne);
    }
  }
  var Kn = !1, Nr = null, Mr = !1, Eo = null, As = { onError: function(e) {
    Kn = !0, Nr = e;
  } };
  function $s(e, n, o, l, u, d, v, z, b) {
    Kn = !1, Nr = null, Ls.apply(As, arguments);
  }
  function Os(e, n, o, l, u, d, v, z, b) {
    if ($s.apply(this, arguments), Kn) {
      if (Kn) {
        var Z = Nr;
        Kn = !1, Nr = null;
      } else throw Error(i(198));
      Mr || (Mr = !0, Eo = Z);
    }
  }
  function Kt(e) {
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
    if (Kt(e) !== e) throw Error(i(188));
  }
  function Hs(e) {
    var n = e.alternate;
    if (!n) {
      if (n = Kt(e), n === null) throw Error(i(188));
      return n !== e ? null : e;
    }
    for (var o = e, l = n; ; ) {
      var u = o.return;
      if (u === null) break;
      var d = u.alternate;
      if (d === null) {
        if (l = u.return, l !== null) {
          o = l;
          continue;
        }
        break;
      }
      if (u.child === d.child) {
        for (d = u.child; d; ) {
          if (d === o) return No(u), e;
          if (d === l) return No(u), n;
          d = d.sibling;
        }
        throw Error(i(188));
      }
      if (o.return !== l.return) o = u, l = d;
      else {
        for (var v = !1, z = u.child; z; ) {
          if (z === o) {
            v = !0, o = u, l = d;
            break;
          }
          if (z === l) {
            v = !0, l = u, o = d;
            break;
          }
          z = z.sibling;
        }
        if (!v) {
          for (z = d.child; z; ) {
            if (z === o) {
              v = !0, o = d, l = u;
              break;
            }
            if (z === l) {
              v = !0, l = d, o = u;
              break;
            }
            z = z.sibling;
          }
          if (!v) throw Error(i(189));
        }
      }
      if (o.alternate !== l) throw Error(i(190));
    }
    if (o.tag !== 3) throw Error(i(188));
    return o.stateNode.current === o ? e : n;
  }
  function $i(e) {
    return e = Hs(e), e !== null ? Oi(e) : null;
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
  var Hi = r.unstable_scheduleCallback, Fi = r.unstable_cancelCallback, Fs = r.unstable_shouldYield, ji = r.unstable_requestPaint, $e = r.unstable_now, js = r.unstable_getCurrentPriorityLevel, Mo = r.unstable_ImmediatePriority, Vi = r.unstable_UserBlockingPriority, zr = r.unstable_NormalPriority, Vs = r.unstable_LowPriority, Bi = r.unstable_IdlePriority, Pr = null, yt = null;
  function Bs(e) {
    if (yt && typeof yt.onCommitFiberRoot == "function") try {
      yt.onCommitFiberRoot(Pr, e, void 0, (e.current.flags & 128) === 128);
    } catch {
    }
  }
  var vt = Math.clz32 ? Math.clz32 : Ys, Us = Math.log, Ws = Math.LN2;
  function Ys(e) {
    return e >>>= 0, e === 0 ? 32 : 31 - (Us(e) / Ws | 0) | 0;
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
    var l = 0, u = e.suspendedLanes, d = e.pingedLanes, v = o & 268435455;
    if (v !== 0) {
      var z = v & ~u;
      z !== 0 ? l = Gn(z) : (d &= v, d !== 0 && (l = Gn(d)));
    } else v = o & ~u, v !== 0 ? l = Gn(v) : d !== 0 && (l = Gn(d));
    if (l === 0) return 0;
    if (n !== 0 && n !== l && (n & u) === 0 && (u = l & -l, d = n & -n, u >= d || u === 16 && (d & 4194240) !== 0)) return n;
    if ((l & 4) !== 0 && (l |= o & 16), n = e.entangledLanes, n !== 0) for (e = e.entanglements, n &= l; 0 < n; ) o = 31 - vt(n), u = 1 << o, l |= e[o], n &= ~u;
    return l;
  }
  function Xs(e, n) {
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
    for (var o = e.suspendedLanes, l = e.pingedLanes, u = e.expirationTimes, d = e.pendingLanes; 0 < d; ) {
      var v = 31 - vt(d), z = 1 << v, b = u[v];
      b === -1 ? ((z & o) === 0 || (z & l) !== 0) && (u[v] = Xs(z, n)) : b <= n && (e.expiredLanes |= z), d &= ~z;
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
  function Zs(e, n) {
    var o = e.pendingLanes & ~n;
    e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= n, e.mutableReadLanes &= n, e.entangledLanes &= n, n = e.entanglements;
    var l = e.eventTimes;
    for (e = e.expirationTimes; 0 < o; ) {
      var u = 31 - vt(o), d = 1 << u;
      n[u] = 0, l[u] = -1, e[u] = -1, o &= ~d;
    }
  }
  function br(e, n) {
    var o = e.entangledLanes |= n;
    for (e = e.entanglements; o; ) {
      var l = 31 - vt(o), u = 1 << l;
      u & n | e[l] & n && (e[l] |= n), o &= ~u;
    }
  }
  var Te = 0;
  function bc(e) {
    return e &= -e, 1 < e ? 4 < e ? (e & 268435455) !== 0 ? 16 : 536870912 : 4 : 1;
  }
  var Rc, Qs, Dc, Lc, Ac, Ks = !1, Yi = [], Sn = null, kn = null, En = null, Po = /* @__PURE__ */ new Map(), Io = /* @__PURE__ */ new Map(), Cn = [], Nm = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
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
  function To(e, n, o, l, u, d) {
    return e === null || e.nativeEvent !== d ? (e = { blockedOn: n, domEventName: o, eventSystemFlags: l, nativeEvent: d, targetContainers: [u] }, n !== null && (n = Wo(n), n !== null && Qs(n)), e) : (e.eventSystemFlags |= l, n = e.targetContainers, u !== null && n.indexOf(u) === -1 && n.push(u), e);
  }
  function Mm(e, n, o, l, u) {
    switch (n) {
      case "focusin":
        return Sn = To(Sn, e, n, o, l, u), !0;
      case "dragenter":
        return kn = To(kn, e, n, o, l, u), !0;
      case "mouseover":
        return En = To(En, e, n, o, l, u), !0;
      case "pointerover":
        var d = u.pointerId;
        return Po.set(d, To(Po.get(d) || null, e, n, o, l, u)), !0;
      case "gotpointercapture":
        return d = u.pointerId, Io.set(d, To(Io.get(d) || null, e, n, o, l, u)), !0;
    }
    return !1;
  }
  function Oc(e) {
    var n = tr(e.target);
    if (n !== null) {
      var o = Kt(n);
      if (o !== null) {
        if (n = o.tag, n === 13) {
          if (n = Co(o), n !== null) {
            e.blockedOn = n, Ac(e.priority, function() {
              Dc(o);
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
  function Xi(e) {
    if (e.blockedOn !== null) return !1;
    for (var n = e.targetContainers; 0 < n.length; ) {
      var o = qs(e.domEventName, e.eventSystemFlags, n[0], e.nativeEvent);
      if (o === null) {
        o = e.nativeEvent;
        var l = new o.constructor(o.type, o);
        wo = l, o.target.dispatchEvent(l), wo = null;
      } else return n = Wo(o), n !== null && Qs(n), e.blockedOn = o, !1;
      n.shift();
    }
    return !0;
  }
  function Hc(e, n, o) {
    Xi(e) && o.delete(n);
  }
  function zm() {
    Ks = !1, Sn !== null && Xi(Sn) && (Sn = null), kn !== null && Xi(kn) && (kn = null), En !== null && Xi(En) && (En = null), Po.forEach(Hc), Io.forEach(Hc);
  }
  function bo(e, n) {
    e.blockedOn === n && (e.blockedOn = null, Ks || (Ks = !0, r.unstable_scheduleCallback(r.unstable_NormalPriority, zm)));
  }
  function Ro(e) {
    function n(u) {
      return bo(u, e);
    }
    if (0 < Yi.length) {
      bo(Yi[0], e);
      for (var o = 1; o < Yi.length; o++) {
        var l = Yi[o];
        l.blockedOn === e && (l.blockedOn = null);
      }
    }
    for (Sn !== null && bo(Sn, e), kn !== null && bo(kn, e), En !== null && bo(En, e), Po.forEach(n), Io.forEach(n), o = 0; o < Cn.length; o++) l = Cn[o], l.blockedOn === e && (l.blockedOn = null);
    for (; 0 < Cn.length && (o = Cn[0], o.blockedOn === null); ) Oc(o), o.blockedOn === null && Cn.shift();
  }
  var Rr = P.ReactCurrentBatchConfig, Zi = !0;
  function Pm(e, n, o, l) {
    var u = Te, d = Rr.transition;
    Rr.transition = null;
    try {
      Te = 1, Gs(e, n, o, l);
    } finally {
      Te = u, Rr.transition = d;
    }
  }
  function Im(e, n, o, l) {
    var u = Te, d = Rr.transition;
    Rr.transition = null;
    try {
      Te = 4, Gs(e, n, o, l);
    } finally {
      Te = u, Rr.transition = d;
    }
  }
  function Gs(e, n, o, l) {
    if (Zi) {
      var u = qs(e, n, o, l);
      if (u === null) ga(e, n, l, Qi, o), $c(e, l);
      else if (Mm(u, e, n, o, l)) l.stopPropagation();
      else if ($c(e, l), n & 4 && -1 < Nm.indexOf(e)) {
        for (; u !== null; ) {
          var d = Wo(u);
          if (d !== null && Rc(d), d = qs(e, n, o, l), d === null && ga(e, n, l, Qi, o), d === u) break;
          u = d;
        }
        u !== null && l.stopPropagation();
      } else ga(e, n, l, null, o);
    }
  }
  var Qi = null;
  function qs(e, n, o, l) {
    if (Qi = null, e = xo(l), e = tr(e), e !== null) if (n = Kt(e), n === null) e = null;
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
        switch (js()) {
          case Mo:
            return 1;
          case Vi:
            return 4;
          case zr:
          case Vs:
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
  var Nn = null, Js = null, Ki = null;
  function jc() {
    if (Ki) return Ki;
    var e, n = Js, o = n.length, l, u = "value" in Nn ? Nn.value : Nn.textContent, d = u.length;
    for (e = 0; e < o && n[e] === u[e]; e++) ;
    var v = o - e;
    for (l = 1; l <= v && n[o - l] === u[d - l]; l++) ;
    return Ki = u.slice(e, 1 < l ? 1 - l : void 0);
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
    function n(o, l, u, d, v) {
      this._reactName = o, this._targetInst = u, this.type = l, this.nativeEvent = d, this.target = v, this.currentTarget = null;
      for (var z in e) e.hasOwnProperty(z) && (o = e[z], this[z] = o ? o(d) : d[z]);
      return this.isDefaultPrevented = (d.defaultPrevented != null ? d.defaultPrevented : d.returnValue === !1) ? qi : Vc, this.isPropagationStopped = Vc, this;
    }
    return V(n.prototype, { preventDefault: function() {
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
  }, defaultPrevented: 0, isTrusted: 0 }, ea = wt(Dr), Do = V({}, Dr, { view: 0, detail: 0 }), Tm = wt(Do), ta, na, Lo, Ji = V({}, Do, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: oa, button: 0, buttons: 0, relatedTarget: function(e) {
    return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
  }, movementX: function(e) {
    return "movementX" in e ? e.movementX : (e !== Lo && (Lo && e.type === "mousemove" ? (ta = e.screenX - Lo.screenX, na = e.screenY - Lo.screenY) : na = ta = 0, Lo = e), ta);
  }, movementY: function(e) {
    return "movementY" in e ? e.movementY : na;
  } }), Bc = wt(Ji), bm = V({}, Ji, { dataTransfer: 0 }), Rm = wt(bm), Dm = V({}, Do, { relatedTarget: 0 }), ra = wt(Dm), Lm = V({}, Dr, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), Am = wt(Lm), $m = V({}, Dr, { clipboardData: function(e) {
    return "clipboardData" in e ? e.clipboardData : window.clipboardData;
  } }), Om = wt($m), Hm = V({}, Dr, { data: 0 }), Uc = wt(Hm), Fm = {
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
  }, jm = {
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
  }, Vm = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function Bm(e) {
    var n = this.nativeEvent;
    return n.getModifierState ? n.getModifierState(e) : (e = Vm[e]) ? !!n[e] : !1;
  }
  function oa() {
    return Bm;
  }
  var Um = V({}, Do, { key: function(e) {
    if (e.key) {
      var n = Fm[e.key] || e.key;
      if (n !== "Unidentified") return n;
    }
    return e.type === "keypress" ? (e = Gi(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? jm[e.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: oa, charCode: function(e) {
    return e.type === "keypress" ? Gi(e) : 0;
  }, keyCode: function(e) {
    return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
  }, which: function(e) {
    return e.type === "keypress" ? Gi(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
  } }), Wm = wt(Um), Ym = V({}, Ji, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Wc = wt(Ym), Xm = V({}, Do, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: oa }), Zm = wt(Xm), Qm = V({}, Dr, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Km = wt(Qm), Gm = V({}, Ji, {
    deltaX: function(e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function(e) {
      return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), qm = wt(Gm), Jm = [9, 13, 27, 32], ia = p && "CompositionEvent" in window, Ao = null;
  p && "documentMode" in document && (Ao = document.documentMode);
  var e0 = p && "TextEvent" in window && !Ao, Yc = p && (!ia || Ao && 8 < Ao && 11 >= Ao), Xc = " ", Zc = !1;
  function Qc(e, n) {
    switch (e) {
      case "keyup":
        return Jm.indexOf(n.keyCode) !== -1;
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
  function t0(e, n) {
    switch (e) {
      case "compositionend":
        return Kc(n);
      case "keypress":
        return n.which !== 32 ? null : (Zc = !0, Xc);
      case "textInput":
        return e = n.data, e === Xc && Zc ? null : e;
      default:
        return null;
    }
  }
  function n0(e, n) {
    if (Lr) return e === "compositionend" || !ia && Qc(e, n) ? (e = jc(), Ki = Js = Nn = null, Lr = !1, e) : null;
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
  var r0 = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
  function Gc(e) {
    var n = e && e.nodeName && e.nodeName.toLowerCase();
    return n === "input" ? !!r0[e.type] : n === "textarea";
  }
  function qc(e, n, o, l) {
    bi(l), n = ol(n, "onChange"), 0 < n.length && (o = new ea("onChange", "change", null, o, l), e.push({ event: o, listeners: n }));
  }
  var $o = null, Oo = null;
  function o0(e) {
    yf(e, 0);
  }
  function el(e) {
    var n = Fr(e);
    if (me(n)) return e;
  }
  function i0(e, n) {
    if (e === "change") return n;
  }
  var Jc = !1;
  if (p) {
    var la;
    if (p) {
      var sa = "oninput" in document;
      if (!sa) {
        var ef = document.createElement("div");
        ef.setAttribute("oninput", "return;"), sa = typeof ef.oninput == "function";
      }
      la = sa;
    } else la = !1;
    Jc = la && (!document.documentMode || 9 < document.documentMode);
  }
  function tf() {
    $o && ($o.detachEvent("onpropertychange", nf), Oo = $o = null);
  }
  function nf(e) {
    if (e.propertyName === "value" && el(Oo)) {
      var n = [];
      qc(n, Oo, e, xo(e)), Ai(o0, n);
    }
  }
  function l0(e, n, o) {
    e === "focusin" ? (tf(), $o = n, Oo = o, $o.attachEvent("onpropertychange", nf)) : e === "focusout" && tf();
  }
  function s0(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown") return el(Oo);
  }
  function a0(e, n) {
    if (e === "click") return el(n);
  }
  function u0(e, n) {
    if (e === "input" || e === "change") return el(n);
  }
  function c0(e, n) {
    return e === n && (e !== 0 || 1 / e === 1 / n) || e !== e && n !== n;
  }
  var Dt = typeof Object.is == "function" ? Object.is : c0;
  function Ho(e, n) {
    if (Dt(e, n)) return !0;
    if (typeof e != "object" || e === null || typeof n != "object" || n === null) return !1;
    var o = Object.keys(e), l = Object.keys(n);
    if (o.length !== l.length) return !1;
    for (l = 0; l < o.length; l++) {
      var u = o[l];
      if (!h.call(n, u) || !Dt(e[u], n[u])) return !1;
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
    for (var l; o; ) {
      if (o.nodeType === 3) {
        if (l = e + o.textContent.length, e <= n && l >= n) return { node: o, offset: n - e };
        e = l;
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
  function lf(e, n) {
    return e && n ? e === n ? !0 : e && e.nodeType === 3 ? !1 : n && n.nodeType === 3 ? lf(e, n.parentNode) : "contains" in e ? e.contains(n) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(n) & 16) : !1 : !1;
  }
  function sf() {
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
  function aa(e) {
    var n = e && e.nodeName && e.nodeName.toLowerCase();
    return n && (n === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || n === "textarea" || e.contentEditable === "true");
  }
  function f0(e) {
    var n = sf(), o = e.focusedElem, l = e.selectionRange;
    if (n !== o && o && o.ownerDocument && lf(o.ownerDocument.documentElement, o)) {
      if (l !== null && aa(o)) {
        if (n = l.start, e = l.end, e === void 0 && (e = n), "selectionStart" in o) o.selectionStart = n, o.selectionEnd = Math.min(e, o.value.length);
        else if (e = (n = o.ownerDocument || document) && n.defaultView || window, e.getSelection) {
          e = e.getSelection();
          var u = o.textContent.length, d = Math.min(l.start, u);
          l = l.end === void 0 ? d : Math.min(l.end, u), !e.extend && d > l && (u = l, l = d, d = u), u = of(o, d);
          var v = of(
            o,
            l
          );
          u && v && (e.rangeCount !== 1 || e.anchorNode !== u.node || e.anchorOffset !== u.offset || e.focusNode !== v.node || e.focusOffset !== v.offset) && (n = n.createRange(), n.setStart(u.node, u.offset), e.removeAllRanges(), d > l ? (e.addRange(n), e.extend(v.node, v.offset)) : (n.setEnd(v.node, v.offset), e.addRange(n)));
        }
      }
      for (n = [], e = o; e = e.parentNode; ) e.nodeType === 1 && n.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
      for (typeof o.focus == "function" && o.focus(), o = 0; o < n.length; o++) e = n[o], e.element.scrollLeft = e.left, e.element.scrollTop = e.top;
    }
  }
  var d0 = p && "documentMode" in document && 11 >= document.documentMode, Ar = null, ua = null, Fo = null, ca = !1;
  function af(e, n, o) {
    var l = o.window === o ? o.document : o.nodeType === 9 ? o : o.ownerDocument;
    ca || Ar == null || Ar !== ye(l) || (l = Ar, "selectionStart" in l && aa(l) ? l = { start: l.selectionStart, end: l.selectionEnd } : (l = (l.ownerDocument && l.ownerDocument.defaultView || window).getSelection(), l = { anchorNode: l.anchorNode, anchorOffset: l.anchorOffset, focusNode: l.focusNode, focusOffset: l.focusOffset }), Fo && Ho(Fo, l) || (Fo = l, l = ol(ua, "onSelect"), 0 < l.length && (n = new ea("onSelect", "select", null, n, o), e.push({ event: n, listeners: l }), n.target = Ar)));
  }
  function tl(e, n) {
    var o = {};
    return o[e.toLowerCase()] = n.toLowerCase(), o["Webkit" + e] = "webkit" + n, o["Moz" + e] = "moz" + n, o;
  }
  var $r = { animationend: tl("Animation", "AnimationEnd"), animationiteration: tl("Animation", "AnimationIteration"), animationstart: tl("Animation", "AnimationStart"), transitionend: tl("Transition", "TransitionEnd") }, fa = {}, uf = {};
  p && (uf = document.createElement("div").style, "AnimationEvent" in window || (delete $r.animationend.animation, delete $r.animationiteration.animation, delete $r.animationstart.animation), "TransitionEvent" in window || delete $r.transitionend.transition);
  function nl(e) {
    if (fa[e]) return fa[e];
    if (!$r[e]) return e;
    var n = $r[e], o;
    for (o in n) if (n.hasOwnProperty(o) && o in uf) return fa[e] = n[o];
    return e;
  }
  var cf = nl("animationend"), ff = nl("animationiteration"), df = nl("animationstart"), pf = nl("transitionend"), hf = /* @__PURE__ */ new Map(), gf = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function Mn(e, n) {
    hf.set(e, n), c(n, [e]);
  }
  for (var da = 0; da < gf.length; da++) {
    var pa = gf[da], p0 = pa.toLowerCase(), h0 = pa[0].toUpperCase() + pa.slice(1);
    Mn(p0, "on" + h0);
  }
  Mn(cf, "onAnimationEnd"), Mn(ff, "onAnimationIteration"), Mn(df, "onAnimationStart"), Mn("dblclick", "onDoubleClick"), Mn("focusin", "onFocus"), Mn("focusout", "onBlur"), Mn(pf, "onTransitionEnd"), f("onMouseEnter", ["mouseout", "mouseover"]), f("onMouseLeave", ["mouseout", "mouseover"]), f("onPointerEnter", ["pointerout", "pointerover"]), f("onPointerLeave", ["pointerout", "pointerover"]), c("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), c("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), c("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), c("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), c("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var jo = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), g0 = new Set("cancel close invalid load scroll toggle".split(" ").concat(jo));
  function mf(e, n, o) {
    var l = e.type || "unknown-event";
    e.currentTarget = o, Os(l, n, void 0, e), e.currentTarget = null;
  }
  function yf(e, n) {
    n = (n & 4) !== 0;
    for (var o = 0; o < e.length; o++) {
      var l = e[o], u = l.event;
      l = l.listeners;
      e: {
        var d = void 0;
        if (n) for (var v = l.length - 1; 0 <= v; v--) {
          var z = l[v], b = z.instance, Z = z.currentTarget;
          if (z = z.listener, b !== d && u.isPropagationStopped()) break e;
          mf(u, z, Z), d = b;
        }
        else for (v = 0; v < l.length; v++) {
          if (z = l[v], b = z.instance, Z = z.currentTarget, z = z.listener, b !== d && u.isPropagationStopped()) break e;
          mf(u, z, Z), d = b;
        }
      }
    }
    if (Mr) throw e = Eo, Mr = !1, Eo = null, e;
  }
  function De(e, n) {
    var o = n[_a];
    o === void 0 && (o = n[_a] = /* @__PURE__ */ new Set());
    var l = e + "__bubble";
    o.has(l) || (vf(n, e, 2, !1), o.add(l));
  }
  function ha(e, n, o) {
    var l = 0;
    n && (l |= 4), vf(o, e, l, n);
  }
  var rl = "_reactListening" + Math.random().toString(36).slice(2);
  function Vo(e) {
    if (!e[rl]) {
      e[rl] = !0, s.forEach(function(o) {
        o !== "selectionchange" && (g0.has(o) || ha(o, !1, e), ha(o, !0, e));
      });
      var n = e.nodeType === 9 ? e : e.ownerDocument;
      n === null || n[rl] || (n[rl] = !0, ha("selectionchange", !1, n));
    }
  }
  function vf(e, n, o, l) {
    switch (Fc(n)) {
      case 1:
        var u = Pm;
        break;
      case 4:
        u = Im;
        break;
      default:
        u = Gs;
    }
    o = u.bind(null, n, o, e), u = void 0, !ko || n !== "touchstart" && n !== "touchmove" && n !== "wheel" || (u = !0), l ? u !== void 0 ? e.addEventListener(n, o, { capture: !0, passive: u }) : e.addEventListener(n, o, !0) : u !== void 0 ? e.addEventListener(n, o, { passive: u }) : e.addEventListener(n, o, !1);
  }
  function ga(e, n, o, l, u) {
    var d = l;
    if ((n & 1) === 0 && (n & 2) === 0 && l !== null) e: for (; ; ) {
      if (l === null) return;
      var v = l.tag;
      if (v === 3 || v === 4) {
        var z = l.stateNode.containerInfo;
        if (z === u || z.nodeType === 8 && z.parentNode === u) break;
        if (v === 4) for (v = l.return; v !== null; ) {
          var b = v.tag;
          if ((b === 3 || b === 4) && (b = v.stateNode.containerInfo, b === u || b.nodeType === 8 && b.parentNode === u)) return;
          v = v.return;
        }
        for (; z !== null; ) {
          if (v = tr(z), v === null) return;
          if (b = v.tag, b === 5 || b === 6) {
            l = d = v;
            continue e;
          }
          z = z.parentNode;
        }
      }
      l = l.return;
    }
    Ai(function() {
      var Z = d, ne = xo(o), oe = [];
      e: {
        var te = hf.get(e);
        if (te !== void 0) {
          var fe = ea, pe = e;
          switch (e) {
            case "keypress":
              if (Gi(o) === 0) break e;
            case "keydown":
            case "keyup":
              fe = Wm;
              break;
            case "focusin":
              pe = "focus", fe = ra;
              break;
            case "focusout":
              pe = "blur", fe = ra;
              break;
            case "beforeblur":
            case "afterblur":
              fe = ra;
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
              fe = Rm;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              fe = Zm;
              break;
            case cf:
            case ff:
            case df:
              fe = Am;
              break;
            case pf:
              fe = Km;
              break;
            case "scroll":
              fe = Tm;
              break;
            case "wheel":
              fe = qm;
              break;
            case "copy":
            case "cut":
            case "paste":
              fe = Om;
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
          var he = (n & 4) !== 0, Be = !he && e === "scroll", B = he ? te !== null ? te + "Capture" : null : te;
          he = [];
          for (var L = Z, W; L !== null; ) {
            W = L;
            var le = W.stateNode;
            if (W.tag === 5 && le !== null && (W = le, B !== null && (le = Zn(L, B), le != null && he.push(Bo(L, le, W)))), Be) break;
            L = L.return;
          }
          0 < he.length && (te = new fe(te, pe, null, o, ne), oe.push({ event: te, listeners: he }));
        }
      }
      if ((n & 7) === 0) {
        e: {
          if (te = e === "mouseover" || e === "pointerover", fe = e === "mouseout" || e === "pointerout", te && o !== wo && (pe = o.relatedTarget || o.fromElement) && (tr(pe) || pe[an])) break e;
          if ((fe || te) && (te = ne.window === ne ? ne : (te = ne.ownerDocument) ? te.defaultView || te.parentWindow : window, fe ? (pe = o.relatedTarget || o.toElement, fe = Z, pe = pe ? tr(pe) : null, pe !== null && (Be = Kt(pe), pe !== Be || pe.tag !== 5 && pe.tag !== 6) && (pe = null)) : (fe = null, pe = Z), fe !== pe)) {
            if (he = Bc, le = "onMouseLeave", B = "onMouseEnter", L = "mouse", (e === "pointerout" || e === "pointerover") && (he = Wc, le = "onPointerLeave", B = "onPointerEnter", L = "pointer"), Be = fe == null ? te : Fr(fe), W = pe == null ? te : Fr(pe), te = new he(le, L + "leave", fe, o, ne), te.target = Be, te.relatedTarget = W, le = null, tr(ne) === Z && (he = new he(B, L + "enter", pe, o, ne), he.target = W, he.relatedTarget = Be, le = he), Be = le, fe && pe) t: {
              for (he = fe, B = pe, L = 0, W = he; W; W = Or(W)) L++;
              for (W = 0, le = B; le; le = Or(le)) W++;
              for (; 0 < L - W; ) he = Or(he), L--;
              for (; 0 < W - L; ) B = Or(B), W--;
              for (; L--; ) {
                if (he === B || B !== null && he === B.alternate) break t;
                he = Or(he), B = Or(B);
              }
              he = null;
            }
            else he = null;
            fe !== null && wf(oe, te, fe, he, !1), pe !== null && Be !== null && wf(oe, Be, pe, he, !0);
          }
        }
        e: {
          if (te = Z ? Fr(Z) : window, fe = te.nodeName && te.nodeName.toLowerCase(), fe === "select" || fe === "input" && te.type === "file") var ge = i0;
          else if (Gc(te)) if (Jc) ge = u0;
          else {
            ge = s0;
            var xe = l0;
          }
          else (fe = te.nodeName) && fe.toLowerCase() === "input" && (te.type === "checkbox" || te.type === "radio") && (ge = a0);
          if (ge && (ge = ge(e, Z))) {
            qc(oe, ge, o, ne);
            break e;
          }
          xe && xe(e, te, Z), e === "focusout" && (xe = te._wrapperState) && xe.controlled && te.type === "number" && at(te, "number", te.value);
        }
        switch (xe = Z ? Fr(Z) : window, e) {
          case "focusin":
            (Gc(xe) || xe.contentEditable === "true") && (Ar = xe, ua = Z, Fo = null);
            break;
          case "focusout":
            Fo = ua = Ar = null;
            break;
          case "mousedown":
            ca = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            ca = !1, af(oe, o, ne);
            break;
          case "selectionchange":
            if (d0) break;
          case "keydown":
          case "keyup":
            af(oe, o, ne);
        }
        var _e;
        if (ia) e: {
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
        ke && (Yc && o.locale !== "ko" && (Lr || ke !== "onCompositionStart" ? ke === "onCompositionEnd" && Lr && (_e = jc()) : (Nn = ne, Js = "value" in Nn ? Nn.value : Nn.textContent, Lr = !0)), xe = ol(Z, ke), 0 < xe.length && (ke = new Uc(ke, e, null, o, ne), oe.push({ event: ke, listeners: xe }), _e ? ke.data = _e : (_e = Kc(o), _e !== null && (ke.data = _e)))), (_e = e0 ? t0(e, o) : n0(e, o)) && (Z = ol(Z, "onBeforeInput"), 0 < Z.length && (ne = new Uc("onBeforeInput", "beforeinput", null, o, ne), oe.push({ event: ne, listeners: Z }), ne.data = _e));
      }
      yf(oe, n);
    });
  }
  function Bo(e, n, o) {
    return { instance: e, listener: n, currentTarget: o };
  }
  function ol(e, n) {
    for (var o = n + "Capture", l = []; e !== null; ) {
      var u = e, d = u.stateNode;
      u.tag === 5 && d !== null && (u = d, d = Zn(e, o), d != null && l.unshift(Bo(e, d, u)), d = Zn(e, n), d != null && l.push(Bo(e, d, u))), e = e.return;
    }
    return l;
  }
  function Or(e) {
    if (e === null) return null;
    do
      e = e.return;
    while (e && e.tag !== 5);
    return e || null;
  }
  function wf(e, n, o, l, u) {
    for (var d = n._reactName, v = []; o !== null && o !== l; ) {
      var z = o, b = z.alternate, Z = z.stateNode;
      if (b !== null && b === l) break;
      z.tag === 5 && Z !== null && (z = Z, u ? (b = Zn(o, d), b != null && v.unshift(Bo(o, b, z))) : u || (b = Zn(o, d), b != null && v.push(Bo(o, b, z)))), o = o.return;
    }
    v.length !== 0 && e.push({ event: n, listeners: v });
  }
  var m0 = /\r\n?/g, y0 = /\u0000|\uFFFD/g;
  function xf(e) {
    return (typeof e == "string" ? e : "" + e).replace(m0, `
`).replace(y0, "");
  }
  function il(e, n, o) {
    if (n = xf(n), xf(e) !== n && o) throw Error(i(425));
  }
  function ll() {
  }
  var ma = null, ya = null;
  function va(e, n) {
    return e === "textarea" || e === "noscript" || typeof n.children == "string" || typeof n.children == "number" || typeof n.dangerouslySetInnerHTML == "object" && n.dangerouslySetInnerHTML !== null && n.dangerouslySetInnerHTML.__html != null;
  }
  var wa = typeof setTimeout == "function" ? setTimeout : void 0, v0 = typeof clearTimeout == "function" ? clearTimeout : void 0, _f = typeof Promise == "function" ? Promise : void 0, w0 = typeof queueMicrotask == "function" ? queueMicrotask : typeof _f < "u" ? function(e) {
    return _f.resolve(null).then(e).catch(x0);
  } : wa;
  function x0(e) {
    setTimeout(function() {
      throw e;
    });
  }
  function xa(e, n) {
    var o = n, l = 0;
    do {
      var u = o.nextSibling;
      if (e.removeChild(o), u && u.nodeType === 8) if (o = u.data, o === "/$") {
        if (l === 0) {
          e.removeChild(u), Ro(n);
          return;
        }
        l--;
      } else o !== "$" && o !== "$?" && o !== "$!" || l++;
      o = u;
    } while (o);
    Ro(n);
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
  var Hr = Math.random().toString(36).slice(2), Gt = "__reactFiber$" + Hr, Uo = "__reactProps$" + Hr, an = "__reactContainer$" + Hr, _a = "__reactEvents$" + Hr, _0 = "__reactListeners$" + Hr, S0 = "__reactHandles$" + Hr;
  function tr(e) {
    var n = e[Gt];
    if (n) return n;
    for (var o = e.parentNode; o; ) {
      if (n = o[an] || o[Gt]) {
        if (o = n.alternate, n.child !== null || o !== null && o.child !== null) for (e = Sf(e); e !== null; ) {
          if (o = e[Gt]) return o;
          e = Sf(e);
        }
        return n;
      }
      e = o, o = e.parentNode;
    }
    return null;
  }
  function Wo(e) {
    return e = e[Gt] || e[an], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
  }
  function Fr(e) {
    if (e.tag === 5 || e.tag === 6) return e.stateNode;
    throw Error(i(33));
  }
  function sl(e) {
    return e[Uo] || null;
  }
  var Sa = [], jr = -1;
  function Pn(e) {
    return { current: e };
  }
  function Le(e) {
    0 > jr || (e.current = Sa[jr], Sa[jr] = null, jr--);
  }
  function be(e, n) {
    jr++, Sa[jr] = e.current, e.current = n;
  }
  var In = {}, nt = Pn(In), ct = Pn(!1), nr = In;
  function Vr(e, n) {
    var o = e.type.contextTypes;
    if (!o) return In;
    var l = e.stateNode;
    if (l && l.__reactInternalMemoizedUnmaskedChildContext === n) return l.__reactInternalMemoizedMaskedChildContext;
    var u = {}, d;
    for (d in o) u[d] = n[d];
    return l && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = n, e.__reactInternalMemoizedMaskedChildContext = u), u;
  }
  function ft(e) {
    return e = e.childContextTypes, e != null;
  }
  function al() {
    Le(ct), Le(nt);
  }
  function kf(e, n, o) {
    if (nt.current !== In) throw Error(i(168));
    be(nt, n), be(ct, o);
  }
  function Ef(e, n, o) {
    var l = e.stateNode;
    if (n = n.childContextTypes, typeof l.getChildContext != "function") return o;
    l = l.getChildContext();
    for (var u in l) if (!(u in n)) throw Error(i(108, ue(e) || "Unknown", u));
    return V({}, o, l);
  }
  function ul(e) {
    return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || In, nr = nt.current, be(nt, e), be(ct, ct.current), !0;
  }
  function Cf(e, n, o) {
    var l = e.stateNode;
    if (!l) throw Error(i(169));
    o ? (e = Ef(e, n, nr), l.__reactInternalMemoizedMergedChildContext = e, Le(ct), Le(nt), be(nt, e)) : Le(ct), be(ct, o);
  }
  var un = null, cl = !1, ka = !1;
  function Nf(e) {
    un === null ? un = [e] : un.push(e);
  }
  function k0(e) {
    cl = !0, Nf(e);
  }
  function Tn() {
    if (!ka && un !== null) {
      ka = !0;
      var e = 0, n = Te;
      try {
        var o = un;
        for (Te = 1; e < o.length; e++) {
          var l = o[e];
          do
            l = l(!0);
          while (l !== null);
        }
        un = null, cl = !1;
      } catch (u) {
        throw un !== null && (un = un.slice(e + 1)), Hi(Mo, Tn), u;
      } finally {
        Te = n, ka = !1;
      }
    }
    return null;
  }
  var Br = [], Ur = 0, fl = null, dl = 0, zt = [], Pt = 0, rr = null, cn = 1, fn = "";
  function or(e, n) {
    Br[Ur++] = dl, Br[Ur++] = fl, fl = e, dl = n;
  }
  function Mf(e, n, o) {
    zt[Pt++] = cn, zt[Pt++] = fn, zt[Pt++] = rr, rr = e;
    var l = cn;
    e = fn;
    var u = 32 - vt(l) - 1;
    l &= ~(1 << u), o += 1;
    var d = 32 - vt(n) + u;
    if (30 < d) {
      var v = u - u % 5;
      d = (l & (1 << v) - 1).toString(32), l >>= v, u -= v, cn = 1 << 32 - vt(n) + u | o << u | l, fn = d + e;
    } else cn = 1 << d | o << u | l, fn = e;
  }
  function Ea(e) {
    e.return !== null && (or(e, 1), Mf(e, 1, 0));
  }
  function Ca(e) {
    for (; e === fl; ) fl = Br[--Ur], Br[Ur] = null, dl = Br[--Ur], Br[Ur] = null;
    for (; e === rr; ) rr = zt[--Pt], zt[Pt] = null, fn = zt[--Pt], zt[Pt] = null, cn = zt[--Pt], zt[Pt] = null;
  }
  var xt = null, _t = null, Ae = !1, Lt = null;
  function zf(e, n) {
    var o = Rt(5, null, null, 0);
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
        return n = n.nodeType !== 8 ? null : n, n !== null ? (o = rr !== null ? { id: cn, overflow: fn } : null, e.memoizedState = { dehydrated: n, treeContext: o, retryLane: 1073741824 }, o = Rt(18, null, null, 0), o.stateNode = n, o.return = e, e.child = o, xt = e, _t = null, !0) : !1;
      default:
        return !1;
    }
  }
  function Na(e) {
    return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
  }
  function Ma(e) {
    if (Ae) {
      var n = _t;
      if (n) {
        var o = n;
        if (!Pf(e, n)) {
          if (Na(e)) throw Error(i(418));
          n = zn(o.nextSibling);
          var l = xt;
          n && Pf(e, n) ? zf(l, o) : (e.flags = e.flags & -4097 | 2, Ae = !1, xt = e);
        }
      } else {
        if (Na(e)) throw Error(i(418));
        e.flags = e.flags & -4097 | 2, Ae = !1, xt = e;
      }
    }
  }
  function If(e) {
    for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
    xt = e;
  }
  function pl(e) {
    if (e !== xt) return !1;
    if (!Ae) return If(e), Ae = !0, !1;
    var n;
    if ((n = e.tag !== 3) && !(n = e.tag !== 5) && (n = e.type, n = n !== "head" && n !== "body" && !va(e.type, e.memoizedProps)), n && (n = _t)) {
      if (Na(e)) throw Tf(), Error(i(418));
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
  function za(e) {
    Lt === null ? Lt = [e] : Lt.push(e);
  }
  var E0 = P.ReactCurrentBatchConfig;
  function Yo(e, n, o) {
    if (e = o.ref, e !== null && typeof e != "function" && typeof e != "object") {
      if (o._owner) {
        if (o = o._owner, o) {
          if (o.tag !== 1) throw Error(i(309));
          var l = o.stateNode;
        }
        if (!l) throw Error(i(147, e));
        var u = l, d = "" + e;
        return n !== null && n.ref !== null && typeof n.ref == "function" && n.ref._stringRef === d ? n.ref : (n = function(v) {
          var z = u.refs;
          v === null ? delete z[d] : z[d] = v;
        }, n._stringRef = d, n);
      }
      if (typeof e != "string") throw Error(i(284));
      if (!o._owner) throw Error(i(290, e));
    }
    return e;
  }
  function hl(e, n) {
    throw e = Object.prototype.toString.call(n), Error(i(31, e === "[object Object]" ? "object with keys {" + Object.keys(n).join(", ") + "}" : e));
  }
  function bf(e) {
    var n = e._init;
    return n(e._payload);
  }
  function Rf(e) {
    function n(B, L) {
      if (e) {
        var W = B.deletions;
        W === null ? (B.deletions = [L], B.flags |= 16) : W.push(L);
      }
    }
    function o(B, L) {
      if (!e) return null;
      for (; L !== null; ) n(B, L), L = L.sibling;
      return null;
    }
    function l(B, L) {
      for (B = /* @__PURE__ */ new Map(); L !== null; ) L.key !== null ? B.set(L.key, L) : B.set(L.index, L), L = L.sibling;
      return B;
    }
    function u(B, L) {
      return B = Hn(B, L), B.index = 0, B.sibling = null, B;
    }
    function d(B, L, W) {
      return B.index = W, e ? (W = B.alternate, W !== null ? (W = W.index, W < L ? (B.flags |= 2, L) : W) : (B.flags |= 2, L)) : (B.flags |= 1048576, L);
    }
    function v(B) {
      return e && B.alternate === null && (B.flags |= 2), B;
    }
    function z(B, L, W, le) {
      return L === null || L.tag !== 6 ? (L = wu(W, B.mode, le), L.return = B, L) : (L = u(L, W), L.return = B, L);
    }
    function b(B, L, W, le) {
      var ge = W.type;
      return ge === D ? ne(B, L, W.props.children, le, W.key) : L !== null && (L.elementType === ge || typeof ge == "object" && ge !== null && ge.$$typeof === F && bf(ge) === L.type) ? (le = u(L, W.props), le.ref = Yo(B, L, W), le.return = B, le) : (le = Ol(W.type, W.key, W.props, null, B.mode, le), le.ref = Yo(B, L, W), le.return = B, le);
    }
    function Z(B, L, W, le) {
      return L === null || L.tag !== 4 || L.stateNode.containerInfo !== W.containerInfo || L.stateNode.implementation !== W.implementation ? (L = xu(W, B.mode, le), L.return = B, L) : (L = u(L, W.children || []), L.return = B, L);
    }
    function ne(B, L, W, le, ge) {
      return L === null || L.tag !== 7 ? (L = dr(W, B.mode, le, ge), L.return = B, L) : (L = u(L, W), L.return = B, L);
    }
    function oe(B, L, W) {
      if (typeof L == "string" && L !== "" || typeof L == "number") return L = wu("" + L, B.mode, W), L.return = B, L;
      if (typeof L == "object" && L !== null) {
        switch (L.$$typeof) {
          case T:
            return W = Ol(L.type, L.key, L.props, null, B.mode, W), W.ref = Yo(B, null, L), W.return = B, W;
          case I:
            return L = xu(L, B.mode, W), L.return = B, L;
          case F:
            var le = L._init;
            return oe(B, le(L._payload), W);
        }
        if (et(L) || O(L)) return L = dr(L, B.mode, W, null), L.return = B, L;
        hl(B, L);
      }
      return null;
    }
    function te(B, L, W, le) {
      var ge = L !== null ? L.key : null;
      if (typeof W == "string" && W !== "" || typeof W == "number") return ge !== null ? null : z(B, L, "" + W, le);
      if (typeof W == "object" && W !== null) {
        switch (W.$$typeof) {
          case T:
            return W.key === ge ? b(B, L, W, le) : null;
          case I:
            return W.key === ge ? Z(B, L, W, le) : null;
          case F:
            return ge = W._init, te(
              B,
              L,
              ge(W._payload),
              le
            );
        }
        if (et(W) || O(W)) return ge !== null ? null : ne(B, L, W, le, null);
        hl(B, W);
      }
      return null;
    }
    function fe(B, L, W, le, ge) {
      if (typeof le == "string" && le !== "" || typeof le == "number") return B = B.get(W) || null, z(L, B, "" + le, ge);
      if (typeof le == "object" && le !== null) {
        switch (le.$$typeof) {
          case T:
            return B = B.get(le.key === null ? W : le.key) || null, b(L, B, le, ge);
          case I:
            return B = B.get(le.key === null ? W : le.key) || null, Z(L, B, le, ge);
          case F:
            var xe = le._init;
            return fe(B, L, W, xe(le._payload), ge);
        }
        if (et(le) || O(le)) return B = B.get(W) || null, ne(L, B, le, ge, null);
        hl(L, le);
      }
      return null;
    }
    function pe(B, L, W, le) {
      for (var ge = null, xe = null, _e = L, ke = L = 0, Ke = null; _e !== null && ke < W.length; ke++) {
        _e.index > ke ? (Ke = _e, _e = null) : Ke = _e.sibling;
        var Ie = te(B, _e, W[ke], le);
        if (Ie === null) {
          _e === null && (_e = Ke);
          break;
        }
        e && _e && Ie.alternate === null && n(B, _e), L = d(Ie, L, ke), xe === null ? ge = Ie : xe.sibling = Ie, xe = Ie, _e = Ke;
      }
      if (ke === W.length) return o(B, _e), Ae && or(B, ke), ge;
      if (_e === null) {
        for (; ke < W.length; ke++) _e = oe(B, W[ke], le), _e !== null && (L = d(_e, L, ke), xe === null ? ge = _e : xe.sibling = _e, xe = _e);
        return Ae && or(B, ke), ge;
      }
      for (_e = l(B, _e); ke < W.length; ke++) Ke = fe(_e, B, ke, W[ke], le), Ke !== null && (e && Ke.alternate !== null && _e.delete(Ke.key === null ? ke : Ke.key), L = d(Ke, L, ke), xe === null ? ge = Ke : xe.sibling = Ke, xe = Ke);
      return e && _e.forEach(function(Fn) {
        return n(B, Fn);
      }), Ae && or(B, ke), ge;
    }
    function he(B, L, W, le) {
      var ge = O(W);
      if (typeof ge != "function") throw Error(i(150));
      if (W = ge.call(W), W == null) throw Error(i(151));
      for (var xe = ge = null, _e = L, ke = L = 0, Ke = null, Ie = W.next(); _e !== null && !Ie.done; ke++, Ie = W.next()) {
        _e.index > ke ? (Ke = _e, _e = null) : Ke = _e.sibling;
        var Fn = te(B, _e, Ie.value, le);
        if (Fn === null) {
          _e === null && (_e = Ke);
          break;
        }
        e && _e && Fn.alternate === null && n(B, _e), L = d(Fn, L, ke), xe === null ? ge = Fn : xe.sibling = Fn, xe = Fn, _e = Ke;
      }
      if (Ie.done) return o(
        B,
        _e
      ), Ae && or(B, ke), ge;
      if (_e === null) {
        for (; !Ie.done; ke++, Ie = W.next()) Ie = oe(B, Ie.value, le), Ie !== null && (L = d(Ie, L, ke), xe === null ? ge = Ie : xe.sibling = Ie, xe = Ie);
        return Ae && or(B, ke), ge;
      }
      for (_e = l(B, _e); !Ie.done; ke++, Ie = W.next()) Ie = fe(_e, B, ke, Ie.value, le), Ie !== null && (e && Ie.alternate !== null && _e.delete(Ie.key === null ? ke : Ie.key), L = d(Ie, L, ke), xe === null ? ge = Ie : xe.sibling = Ie, xe = Ie);
      return e && _e.forEach(function(ry) {
        return n(B, ry);
      }), Ae && or(B, ke), ge;
    }
    function Be(B, L, W, le) {
      if (typeof W == "object" && W !== null && W.type === D && W.key === null && (W = W.props.children), typeof W == "object" && W !== null) {
        switch (W.$$typeof) {
          case T:
            e: {
              for (var ge = W.key, xe = L; xe !== null; ) {
                if (xe.key === ge) {
                  if (ge = W.type, ge === D) {
                    if (xe.tag === 7) {
                      o(B, xe.sibling), L = u(xe, W.props.children), L.return = B, B = L;
                      break e;
                    }
                  } else if (xe.elementType === ge || typeof ge == "object" && ge !== null && ge.$$typeof === F && bf(ge) === xe.type) {
                    o(B, xe.sibling), L = u(xe, W.props), L.ref = Yo(B, xe, W), L.return = B, B = L;
                    break e;
                  }
                  o(B, xe);
                  break;
                } else n(B, xe);
                xe = xe.sibling;
              }
              W.type === D ? (L = dr(W.props.children, B.mode, le, W.key), L.return = B, B = L) : (le = Ol(W.type, W.key, W.props, null, B.mode, le), le.ref = Yo(B, L, W), le.return = B, B = le);
            }
            return v(B);
          case I:
            e: {
              for (xe = W.key; L !== null; ) {
                if (L.key === xe) if (L.tag === 4 && L.stateNode.containerInfo === W.containerInfo && L.stateNode.implementation === W.implementation) {
                  o(B, L.sibling), L = u(L, W.children || []), L.return = B, B = L;
                  break e;
                } else {
                  o(B, L);
                  break;
                }
                else n(B, L);
                L = L.sibling;
              }
              L = xu(W, B.mode, le), L.return = B, B = L;
            }
            return v(B);
          case F:
            return xe = W._init, Be(B, L, xe(W._payload), le);
        }
        if (et(W)) return pe(B, L, W, le);
        if (O(W)) return he(B, L, W, le);
        hl(B, W);
      }
      return typeof W == "string" && W !== "" || typeof W == "number" ? (W = "" + W, L !== null && L.tag === 6 ? (o(B, L.sibling), L = u(L, W), L.return = B, B = L) : (o(B, L), L = wu(W, B.mode, le), L.return = B, B = L), v(B)) : o(B, L);
    }
    return Be;
  }
  var Yr = Rf(!0), Df = Rf(!1), gl = Pn(null), ml = null, Xr = null, Pa = null;
  function Ia() {
    Pa = Xr = ml = null;
  }
  function Ta(e) {
    var n = gl.current;
    Le(gl), e._currentValue = n;
  }
  function ba(e, n, o) {
    for (; e !== null; ) {
      var l = e.alternate;
      if ((e.childLanes & n) !== n ? (e.childLanes |= n, l !== null && (l.childLanes |= n)) : l !== null && (l.childLanes & n) !== n && (l.childLanes |= n), e === o) break;
      e = e.return;
    }
  }
  function Zr(e, n) {
    ml = e, Pa = Xr = null, e = e.dependencies, e !== null && e.firstContext !== null && ((e.lanes & n) !== 0 && (dt = !0), e.firstContext = null);
  }
  function It(e) {
    var n = e._currentValue;
    if (Pa !== e) if (e = { context: e, memoizedValue: n, next: null }, Xr === null) {
      if (ml === null) throw Error(i(308));
      Xr = e, ml.dependencies = { lanes: 0, firstContext: e };
    } else Xr = Xr.next = e;
    return n;
  }
  var ir = null;
  function Ra(e) {
    ir === null ? ir = [e] : ir.push(e);
  }
  function Lf(e, n, o, l) {
    var u = n.interleaved;
    return u === null ? (o.next = o, Ra(n)) : (o.next = u.next, u.next = o), n.interleaved = o, dn(e, l);
  }
  function dn(e, n) {
    e.lanes |= n;
    var o = e.alternate;
    for (o !== null && (o.lanes |= n), o = e, e = e.return; e !== null; ) e.childLanes |= n, o = e.alternate, o !== null && (o.childLanes |= n), o = e, e = e.return;
    return o.tag === 3 ? o.stateNode : null;
  }
  var bn = !1;
  function Da(e) {
    e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
  }
  function Af(e, n) {
    e = e.updateQueue, n.updateQueue === e && (n.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
  }
  function pn(e, n) {
    return { eventTime: e, lane: n, tag: 0, payload: null, callback: null, next: null };
  }
  function Rn(e, n, o) {
    var l = e.updateQueue;
    if (l === null) return null;
    if (l = l.shared, (Pe & 2) !== 0) {
      var u = l.pending;
      return u === null ? n.next = n : (n.next = u.next, u.next = n), l.pending = n, dn(e, o);
    }
    return u = l.interleaved, u === null ? (n.next = n, Ra(l)) : (n.next = u.next, u.next = n), l.interleaved = n, dn(e, o);
  }
  function yl(e, n, o) {
    if (n = n.updateQueue, n !== null && (n = n.shared, (o & 4194240) !== 0)) {
      var l = n.lanes;
      l &= e.pendingLanes, o |= l, n.lanes = o, br(e, o);
    }
  }
  function $f(e, n) {
    var o = e.updateQueue, l = e.alternate;
    if (l !== null && (l = l.updateQueue, o === l)) {
      var u = null, d = null;
      if (o = o.firstBaseUpdate, o !== null) {
        do {
          var v = { eventTime: o.eventTime, lane: o.lane, tag: o.tag, payload: o.payload, callback: o.callback, next: null };
          d === null ? u = d = v : d = d.next = v, o = o.next;
        } while (o !== null);
        d === null ? u = d = n : d = d.next = n;
      } else u = d = n;
      o = { baseState: l.baseState, firstBaseUpdate: u, lastBaseUpdate: d, shared: l.shared, effects: l.effects }, e.updateQueue = o;
      return;
    }
    e = o.lastBaseUpdate, e === null ? o.firstBaseUpdate = n : e.next = n, o.lastBaseUpdate = n;
  }
  function vl(e, n, o, l) {
    var u = e.updateQueue;
    bn = !1;
    var d = u.firstBaseUpdate, v = u.lastBaseUpdate, z = u.shared.pending;
    if (z !== null) {
      u.shared.pending = null;
      var b = z, Z = b.next;
      b.next = null, v === null ? d = Z : v.next = Z, v = b;
      var ne = e.alternate;
      ne !== null && (ne = ne.updateQueue, z = ne.lastBaseUpdate, z !== v && (z === null ? ne.firstBaseUpdate = Z : z.next = Z, ne.lastBaseUpdate = b));
    }
    if (d !== null) {
      var oe = u.baseState;
      v = 0, ne = Z = b = null, z = d;
      do {
        var te = z.lane, fe = z.eventTime;
        if ((l & te) === te) {
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
                oe = V({}, oe, te);
                break e;
              case 2:
                bn = !0;
            }
          }
          z.callback !== null && z.lane !== 0 && (e.flags |= 64, te = u.effects, te === null ? u.effects = [z] : te.push(z));
        } else fe = { eventTime: fe, lane: te, tag: z.tag, payload: z.payload, callback: z.callback, next: null }, ne === null ? (Z = ne = fe, b = oe) : ne = ne.next = fe, v |= te;
        if (z = z.next, z === null) {
          if (z = u.shared.pending, z === null) break;
          te = z, z = te.next, te.next = null, u.lastBaseUpdate = te, u.shared.pending = null;
        }
      } while (!0);
      if (ne === null && (b = oe), u.baseState = b, u.firstBaseUpdate = Z, u.lastBaseUpdate = ne, n = u.shared.interleaved, n !== null) {
        u = n;
        do
          v |= u.lane, u = u.next;
        while (u !== n);
      } else d === null && (u.shared.lanes = 0);
      ar |= v, e.lanes = v, e.memoizedState = oe;
    }
  }
  function Of(e, n, o) {
    if (e = n.effects, n.effects = null, e !== null) for (n = 0; n < e.length; n++) {
      var l = e[n], u = l.callback;
      if (u !== null) {
        if (l.callback = null, l = o, typeof u != "function") throw Error(i(191, u));
        u.call(l);
      }
    }
  }
  var Xo = {}, qt = Pn(Xo), Zo = Pn(Xo), Qo = Pn(Xo);
  function lr(e) {
    if (e === Xo) throw Error(i(174));
    return e;
  }
  function La(e, n) {
    switch (be(Qo, n), be(Zo, e), be(qt, Xo), e = n.nodeType, e) {
      case 9:
      case 11:
        n = (n = n.documentElement) ? n.namespaceURI : mt(null, "");
        break;
      default:
        e = e === 8 ? n.parentNode : n, n = e.namespaceURI || null, e = e.tagName, n = mt(n, e);
    }
    Le(qt), be(qt, n);
  }
  function Qr() {
    Le(qt), Le(Zo), Le(Qo);
  }
  function Hf(e) {
    lr(Qo.current);
    var n = lr(qt.current), o = mt(n, e.type);
    n !== o && (be(Zo, e), be(qt, o));
  }
  function Aa(e) {
    Zo.current === e && (Le(qt), Le(Zo));
  }
  var Oe = Pn(0);
  function wl(e) {
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
  var $a = [];
  function Oa() {
    for (var e = 0; e < $a.length; e++) $a[e]._workInProgressVersionPrimary = null;
    $a.length = 0;
  }
  var xl = P.ReactCurrentDispatcher, Ha = P.ReactCurrentBatchConfig, sr = 0, He = null, Ye = null, Ze = null, _l = !1, Ko = !1, Go = 0, C0 = 0;
  function rt() {
    throw Error(i(321));
  }
  function Fa(e, n) {
    if (n === null) return !1;
    for (var o = 0; o < n.length && o < e.length; o++) if (!Dt(e[o], n[o])) return !1;
    return !0;
  }
  function ja(e, n, o, l, u, d) {
    if (sr = d, He = n, n.memoizedState = null, n.updateQueue = null, n.lanes = 0, xl.current = e === null || e.memoizedState === null ? P0 : I0, e = o(l, u), Ko) {
      d = 0;
      do {
        if (Ko = !1, Go = 0, 25 <= d) throw Error(i(301));
        d += 1, Ze = Ye = null, n.updateQueue = null, xl.current = T0, e = o(l, u);
      } while (Ko);
    }
    if (xl.current = El, n = Ye !== null && Ye.next !== null, sr = 0, Ze = Ye = He = null, _l = !1, n) throw Error(i(300));
    return e;
  }
  function Va() {
    var e = Go !== 0;
    return Go = 0, e;
  }
  function Jt() {
    var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
    return Ze === null ? He.memoizedState = Ze = e : Ze = Ze.next = e, Ze;
  }
  function Tt() {
    if (Ye === null) {
      var e = He.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = Ye.next;
    var n = Ze === null ? He.memoizedState : Ze.next;
    if (n !== null) Ze = n, Ye = e;
    else {
      if (e === null) throw Error(i(310));
      Ye = e, e = { memoizedState: Ye.memoizedState, baseState: Ye.baseState, baseQueue: Ye.baseQueue, queue: Ye.queue, next: null }, Ze === null ? He.memoizedState = Ze = e : Ze = Ze.next = e;
    }
    return Ze;
  }
  function qo(e, n) {
    return typeof n == "function" ? n(e) : n;
  }
  function Ba(e) {
    var n = Tt(), o = n.queue;
    if (o === null) throw Error(i(311));
    o.lastRenderedReducer = e;
    var l = Ye, u = l.baseQueue, d = o.pending;
    if (d !== null) {
      if (u !== null) {
        var v = u.next;
        u.next = d.next, d.next = v;
      }
      l.baseQueue = u = d, o.pending = null;
    }
    if (u !== null) {
      d = u.next, l = l.baseState;
      var z = v = null, b = null, Z = d;
      do {
        var ne = Z.lane;
        if ((sr & ne) === ne) b !== null && (b = b.next = { lane: 0, action: Z.action, hasEagerState: Z.hasEagerState, eagerState: Z.eagerState, next: null }), l = Z.hasEagerState ? Z.eagerState : e(l, Z.action);
        else {
          var oe = {
            lane: ne,
            action: Z.action,
            hasEagerState: Z.hasEagerState,
            eagerState: Z.eagerState,
            next: null
          };
          b === null ? (z = b = oe, v = l) : b = b.next = oe, He.lanes |= ne, ar |= ne;
        }
        Z = Z.next;
      } while (Z !== null && Z !== d);
      b === null ? v = l : b.next = z, Dt(l, n.memoizedState) || (dt = !0), n.memoizedState = l, n.baseState = v, n.baseQueue = b, o.lastRenderedState = l;
    }
    if (e = o.interleaved, e !== null) {
      u = e;
      do
        d = u.lane, He.lanes |= d, ar |= d, u = u.next;
      while (u !== e);
    } else u === null && (o.lanes = 0);
    return [n.memoizedState, o.dispatch];
  }
  function Ua(e) {
    var n = Tt(), o = n.queue;
    if (o === null) throw Error(i(311));
    o.lastRenderedReducer = e;
    var l = o.dispatch, u = o.pending, d = n.memoizedState;
    if (u !== null) {
      o.pending = null;
      var v = u = u.next;
      do
        d = e(d, v.action), v = v.next;
      while (v !== u);
      Dt(d, n.memoizedState) || (dt = !0), n.memoizedState = d, n.baseQueue === null && (n.baseState = d), o.lastRenderedState = d;
    }
    return [d, l];
  }
  function Ff() {
  }
  function jf(e, n) {
    var o = He, l = Tt(), u = n(), d = !Dt(l.memoizedState, u);
    if (d && (l.memoizedState = u, dt = !0), l = l.queue, Wa(Uf.bind(null, o, l, e), [e]), l.getSnapshot !== n || d || Ze !== null && Ze.memoizedState.tag & 1) {
      if (o.flags |= 2048, Jo(9, Bf.bind(null, o, l, u, n), void 0, null), Qe === null) throw Error(i(349));
      (sr & 30) !== 0 || Vf(o, n, u);
    }
    return u;
  }
  function Vf(e, n, o) {
    e.flags |= 16384, e = { getSnapshot: n, value: o }, n = He.updateQueue, n === null ? (n = { lastEffect: null, stores: null }, He.updateQueue = n, n.stores = [e]) : (o = n.stores, o === null ? n.stores = [e] : o.push(e));
  }
  function Bf(e, n, o, l) {
    n.value = o, n.getSnapshot = l, Wf(n) && Yf(e);
  }
  function Uf(e, n, o) {
    return o(function() {
      Wf(n) && Yf(e);
    });
  }
  function Wf(e) {
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
    var n = dn(e, 1);
    n !== null && Ht(n, e, 1, -1);
  }
  function Xf(e) {
    var n = Jt();
    return typeof e == "function" && (e = e()), n.memoizedState = n.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: qo, lastRenderedState: e }, n.queue = e, e = e.dispatch = z0.bind(null, He, e), [n.memoizedState, e];
  }
  function Jo(e, n, o, l) {
    return e = { tag: e, create: n, destroy: o, deps: l, next: null }, n = He.updateQueue, n === null ? (n = { lastEffect: null, stores: null }, He.updateQueue = n, n.lastEffect = e.next = e) : (o = n.lastEffect, o === null ? n.lastEffect = e.next = e : (l = o.next, o.next = e, e.next = l, n.lastEffect = e)), e;
  }
  function Zf() {
    return Tt().memoizedState;
  }
  function Sl(e, n, o, l) {
    var u = Jt();
    He.flags |= e, u.memoizedState = Jo(1 | n, o, void 0, l === void 0 ? null : l);
  }
  function kl(e, n, o, l) {
    var u = Tt();
    l = l === void 0 ? null : l;
    var d = void 0;
    if (Ye !== null) {
      var v = Ye.memoizedState;
      if (d = v.destroy, l !== null && Fa(l, v.deps)) {
        u.memoizedState = Jo(n, o, d, l);
        return;
      }
    }
    He.flags |= e, u.memoizedState = Jo(1 | n, o, d, l);
  }
  function Qf(e, n) {
    return Sl(8390656, 8, e, n);
  }
  function Wa(e, n) {
    return kl(2048, 8, e, n);
  }
  function Kf(e, n) {
    return kl(4, 2, e, n);
  }
  function Gf(e, n) {
    return kl(4, 4, e, n);
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
    return o = o != null ? o.concat([e]) : null, kl(4, 4, qf.bind(null, n, e), o);
  }
  function Ya() {
  }
  function ed(e, n) {
    var o = Tt();
    n = n === void 0 ? null : n;
    var l = o.memoizedState;
    return l !== null && n !== null && Fa(n, l[1]) ? l[0] : (o.memoizedState = [e, n], e);
  }
  function td(e, n) {
    var o = Tt();
    n = n === void 0 ? null : n;
    var l = o.memoizedState;
    return l !== null && n !== null && Fa(n, l[1]) ? l[0] : (e = e(), o.memoizedState = [e, n], e);
  }
  function nd(e, n, o) {
    return (sr & 21) === 0 ? (e.baseState && (e.baseState = !1, dt = !0), e.memoizedState = o) : (Dt(o, n) || (o = Wi(), He.lanes |= o, ar |= o, e.baseState = !0), n);
  }
  function N0(e, n) {
    var o = Te;
    Te = o !== 0 && 4 > o ? o : 4, e(!0);
    var l = Ha.transition;
    Ha.transition = {};
    try {
      e(!1), n();
    } finally {
      Te = o, Ha.transition = l;
    }
  }
  function rd() {
    return Tt().memoizedState;
  }
  function M0(e, n, o) {
    var l = $n(e);
    if (o = { lane: l, action: o, hasEagerState: !1, eagerState: null, next: null }, od(e)) id(n, o);
    else if (o = Lf(e, n, o, l), o !== null) {
      var u = st();
      Ht(o, e, l, u), ld(o, n, l);
    }
  }
  function z0(e, n, o) {
    var l = $n(e), u = { lane: l, action: o, hasEagerState: !1, eagerState: null, next: null };
    if (od(e)) id(n, u);
    else {
      var d = e.alternate;
      if (e.lanes === 0 && (d === null || d.lanes === 0) && (d = n.lastRenderedReducer, d !== null)) try {
        var v = n.lastRenderedState, z = d(v, o);
        if (u.hasEagerState = !0, u.eagerState = z, Dt(z, v)) {
          var b = n.interleaved;
          b === null ? (u.next = u, Ra(n)) : (u.next = b.next, b.next = u), n.interleaved = u;
          return;
        }
      } catch {
      } finally {
      }
      o = Lf(e, n, u, l), o !== null && (u = st(), Ht(o, e, l, u), ld(o, n, l));
    }
  }
  function od(e) {
    var n = e.alternate;
    return e === He || n !== null && n === He;
  }
  function id(e, n) {
    Ko = _l = !0;
    var o = e.pending;
    o === null ? n.next = n : (n.next = o.next, o.next = n), e.pending = n;
  }
  function ld(e, n, o) {
    if ((o & 4194240) !== 0) {
      var l = n.lanes;
      l &= e.pendingLanes, o |= l, n.lanes = o, br(e, o);
    }
  }
  var El = { readContext: It, useCallback: rt, useContext: rt, useEffect: rt, useImperativeHandle: rt, useInsertionEffect: rt, useLayoutEffect: rt, useMemo: rt, useReducer: rt, useRef: rt, useState: rt, useDebugValue: rt, useDeferredValue: rt, useTransition: rt, useMutableSource: rt, useSyncExternalStore: rt, useId: rt, unstable_isNewReconciler: !1 }, P0 = { readContext: It, useCallback: function(e, n) {
    return Jt().memoizedState = [e, n === void 0 ? null : n], e;
  }, useContext: It, useEffect: Qf, useImperativeHandle: function(e, n, o) {
    return o = o != null ? o.concat([e]) : null, Sl(
      4194308,
      4,
      qf.bind(null, n, e),
      o
    );
  }, useLayoutEffect: function(e, n) {
    return Sl(4194308, 4, e, n);
  }, useInsertionEffect: function(e, n) {
    return Sl(4, 2, e, n);
  }, useMemo: function(e, n) {
    var o = Jt();
    return n = n === void 0 ? null : n, e = e(), o.memoizedState = [e, n], e;
  }, useReducer: function(e, n, o) {
    var l = Jt();
    return n = o !== void 0 ? o(n) : n, l.memoizedState = l.baseState = n, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: n }, l.queue = e, e = e.dispatch = M0.bind(null, He, e), [l.memoizedState, e];
  }, useRef: function(e) {
    var n = Jt();
    return e = { current: e }, n.memoizedState = e;
  }, useState: Xf, useDebugValue: Ya, useDeferredValue: function(e) {
    return Jt().memoizedState = e;
  }, useTransition: function() {
    var e = Xf(!1), n = e[0];
    return e = N0.bind(null, e[1]), Jt().memoizedState = e, [n, e];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(e, n, o) {
    var l = He, u = Jt();
    if (Ae) {
      if (o === void 0) throw Error(i(407));
      o = o();
    } else {
      if (o = n(), Qe === null) throw Error(i(349));
      (sr & 30) !== 0 || Vf(l, n, o);
    }
    u.memoizedState = o;
    var d = { value: o, getSnapshot: n };
    return u.queue = d, Qf(Uf.bind(
      null,
      l,
      d,
      e
    ), [e]), l.flags |= 2048, Jo(9, Bf.bind(null, l, d, o, n), void 0, null), o;
  }, useId: function() {
    var e = Jt(), n = Qe.identifierPrefix;
    if (Ae) {
      var o = fn, l = cn;
      o = (l & ~(1 << 32 - vt(l) - 1)).toString(32) + o, n = ":" + n + "R" + o, o = Go++, 0 < o && (n += "H" + o.toString(32)), n += ":";
    } else o = C0++, n = ":" + n + "r" + o.toString(32) + ":";
    return e.memoizedState = n;
  }, unstable_isNewReconciler: !1 }, I0 = {
    readContext: It,
    useCallback: ed,
    useContext: It,
    useEffect: Wa,
    useImperativeHandle: Jf,
    useInsertionEffect: Kf,
    useLayoutEffect: Gf,
    useMemo: td,
    useReducer: Ba,
    useRef: Zf,
    useState: function() {
      return Ba(qo);
    },
    useDebugValue: Ya,
    useDeferredValue: function(e) {
      var n = Tt();
      return nd(n, Ye.memoizedState, e);
    },
    useTransition: function() {
      var e = Ba(qo)[0], n = Tt().memoizedState;
      return [e, n];
    },
    useMutableSource: Ff,
    useSyncExternalStore: jf,
    useId: rd,
    unstable_isNewReconciler: !1
  }, T0 = { readContext: It, useCallback: ed, useContext: It, useEffect: Wa, useImperativeHandle: Jf, useInsertionEffect: Kf, useLayoutEffect: Gf, useMemo: td, useReducer: Ua, useRef: Zf, useState: function() {
    return Ua(qo);
  }, useDebugValue: Ya, useDeferredValue: function(e) {
    var n = Tt();
    return Ye === null ? n.memoizedState = e : nd(n, Ye.memoizedState, e);
  }, useTransition: function() {
    var e = Ua(qo)[0], n = Tt().memoizedState;
    return [e, n];
  }, useMutableSource: Ff, useSyncExternalStore: jf, useId: rd, unstable_isNewReconciler: !1 };
  function At(e, n) {
    if (e && e.defaultProps) {
      n = V({}, n), e = e.defaultProps;
      for (var o in e) n[o] === void 0 && (n[o] = e[o]);
      return n;
    }
    return n;
  }
  function Xa(e, n, o, l) {
    n = e.memoizedState, o = o(l, n), o = o == null ? n : V({}, n, o), e.memoizedState = o, e.lanes === 0 && (e.updateQueue.baseState = o);
  }
  var Cl = { isMounted: function(e) {
    return (e = e._reactInternals) ? Kt(e) === e : !1;
  }, enqueueSetState: function(e, n, o) {
    e = e._reactInternals;
    var l = st(), u = $n(e), d = pn(l, u);
    d.payload = n, o != null && (d.callback = o), n = Rn(e, d, u), n !== null && (Ht(n, e, u, l), yl(n, e, u));
  }, enqueueReplaceState: function(e, n, o) {
    e = e._reactInternals;
    var l = st(), u = $n(e), d = pn(l, u);
    d.tag = 1, d.payload = n, o != null && (d.callback = o), n = Rn(e, d, u), n !== null && (Ht(n, e, u, l), yl(n, e, u));
  }, enqueueForceUpdate: function(e, n) {
    e = e._reactInternals;
    var o = st(), l = $n(e), u = pn(o, l);
    u.tag = 2, n != null && (u.callback = n), n = Rn(e, u, l), n !== null && (Ht(n, e, l, o), yl(n, e, l));
  } };
  function sd(e, n, o, l, u, d, v) {
    return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(l, d, v) : n.prototype && n.prototype.isPureReactComponent ? !Ho(o, l) || !Ho(u, d) : !0;
  }
  function ad(e, n, o) {
    var l = !1, u = In, d = n.contextType;
    return typeof d == "object" && d !== null ? d = It(d) : (u = ft(n) ? nr : nt.current, l = n.contextTypes, d = (l = l != null) ? Vr(e, u) : In), n = new n(o, d), e.memoizedState = n.state !== null && n.state !== void 0 ? n.state : null, n.updater = Cl, e.stateNode = n, n._reactInternals = e, l && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = u, e.__reactInternalMemoizedMaskedChildContext = d), n;
  }
  function ud(e, n, o, l) {
    e = n.state, typeof n.componentWillReceiveProps == "function" && n.componentWillReceiveProps(o, l), typeof n.UNSAFE_componentWillReceiveProps == "function" && n.UNSAFE_componentWillReceiveProps(o, l), n.state !== e && Cl.enqueueReplaceState(n, n.state, null);
  }
  function Za(e, n, o, l) {
    var u = e.stateNode;
    u.props = o, u.state = e.memoizedState, u.refs = {}, Da(e);
    var d = n.contextType;
    typeof d == "object" && d !== null ? u.context = It(d) : (d = ft(n) ? nr : nt.current, u.context = Vr(e, d)), u.state = e.memoizedState, d = n.getDerivedStateFromProps, typeof d == "function" && (Xa(e, n, d, o), u.state = e.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof u.getSnapshotBeforeUpdate == "function" || typeof u.UNSAFE_componentWillMount != "function" && typeof u.componentWillMount != "function" || (n = u.state, typeof u.componentWillMount == "function" && u.componentWillMount(), typeof u.UNSAFE_componentWillMount == "function" && u.UNSAFE_componentWillMount(), n !== u.state && Cl.enqueueReplaceState(u, u.state, null), vl(e, o, u, l), u.state = e.memoizedState), typeof u.componentDidMount == "function" && (e.flags |= 4194308);
  }
  function Kr(e, n) {
    try {
      var o = "", l = n;
      do
        o += ae(l), l = l.return;
      while (l);
      var u = o;
    } catch (d) {
      u = `
Error generating stack: ` + d.message + `
` + d.stack;
    }
    return { value: e, source: n, stack: u, digest: null };
  }
  function Qa(e, n, o) {
    return { value: e, source: null, stack: o ?? null, digest: n ?? null };
  }
  function Ka(e, n) {
    try {
      console.error(n.value);
    } catch (o) {
      setTimeout(function() {
        throw o;
      });
    }
  }
  var b0 = typeof WeakMap == "function" ? WeakMap : Map;
  function cd(e, n, o) {
    o = pn(-1, o), o.tag = 3, o.payload = { element: null };
    var l = n.value;
    return o.callback = function() {
      bl || (bl = !0, fu = l), Ka(e, n);
    }, o;
  }
  function fd(e, n, o) {
    o = pn(-1, o), o.tag = 3;
    var l = e.type.getDerivedStateFromError;
    if (typeof l == "function") {
      var u = n.value;
      o.payload = function() {
        return l(u);
      }, o.callback = function() {
        Ka(e, n);
      };
    }
    var d = e.stateNode;
    return d !== null && typeof d.componentDidCatch == "function" && (o.callback = function() {
      Ka(e, n), typeof l != "function" && (Ln === null ? Ln = /* @__PURE__ */ new Set([this]) : Ln.add(this));
      var v = n.stack;
      this.componentDidCatch(n.value, { componentStack: v !== null ? v : "" });
    }), o;
  }
  function dd(e, n, o) {
    var l = e.pingCache;
    if (l === null) {
      l = e.pingCache = new b0();
      var u = /* @__PURE__ */ new Set();
      l.set(n, u);
    } else u = l.get(n), u === void 0 && (u = /* @__PURE__ */ new Set(), l.set(n, u));
    u.has(o) || (u.add(o), e = Y0.bind(null, e, n, o), n.then(e, e));
  }
  function pd(e) {
    do {
      var n;
      if ((n = e.tag === 13) && (n = e.memoizedState, n = n !== null ? n.dehydrated !== null : !0), n) return e;
      e = e.return;
    } while (e !== null);
    return null;
  }
  function hd(e, n, o, l, u) {
    return (e.mode & 1) === 0 ? (e === n ? e.flags |= 65536 : (e.flags |= 128, o.flags |= 131072, o.flags &= -52805, o.tag === 1 && (o.alternate === null ? o.tag = 17 : (n = pn(-1, 1), n.tag = 2, Rn(o, n, 1))), o.lanes |= 1), e) : (e.flags |= 65536, e.lanes = u, e);
  }
  var R0 = P.ReactCurrentOwner, dt = !1;
  function lt(e, n, o, l) {
    n.child = e === null ? Df(n, null, o, l) : Yr(n, e.child, o, l);
  }
  function gd(e, n, o, l, u) {
    o = o.render;
    var d = n.ref;
    return Zr(n, u), l = ja(e, n, o, l, d, u), o = Va(), e !== null && !dt ? (n.updateQueue = e.updateQueue, n.flags &= -2053, e.lanes &= ~u, hn(e, n, u)) : (Ae && o && Ea(n), n.flags |= 1, lt(e, n, l, u), n.child);
  }
  function md(e, n, o, l, u) {
    if (e === null) {
      var d = o.type;
      return typeof d == "function" && !vu(d) && d.defaultProps === void 0 && o.compare === null && o.defaultProps === void 0 ? (n.tag = 15, n.type = d, yd(e, n, d, l, u)) : (e = Ol(o.type, null, l, n, n.mode, u), e.ref = n.ref, e.return = n, n.child = e);
    }
    if (d = e.child, (e.lanes & u) === 0) {
      var v = d.memoizedProps;
      if (o = o.compare, o = o !== null ? o : Ho, o(v, l) && e.ref === n.ref) return hn(e, n, u);
    }
    return n.flags |= 1, e = Hn(d, l), e.ref = n.ref, e.return = n, n.child = e;
  }
  function yd(e, n, o, l, u) {
    if (e !== null) {
      var d = e.memoizedProps;
      if (Ho(d, l) && e.ref === n.ref) if (dt = !1, n.pendingProps = l = d, (e.lanes & u) !== 0) (e.flags & 131072) !== 0 && (dt = !0);
      else return n.lanes = e.lanes, hn(e, n, u);
    }
    return Ga(e, n, o, l, u);
  }
  function vd(e, n, o) {
    var l = n.pendingProps, u = l.children, d = e !== null ? e.memoizedState : null;
    if (l.mode === "hidden") if ((n.mode & 1) === 0) n.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, be(qr, St), St |= o;
    else {
      if ((o & 1073741824) === 0) return e = d !== null ? d.baseLanes | o : o, n.lanes = n.childLanes = 1073741824, n.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, n.updateQueue = null, be(qr, St), St |= e, null;
      n.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, l = d !== null ? d.baseLanes : o, be(qr, St), St |= l;
    }
    else d !== null ? (l = d.baseLanes | o, n.memoizedState = null) : l = o, be(qr, St), St |= l;
    return lt(e, n, u, o), n.child;
  }
  function wd(e, n) {
    var o = n.ref;
    (e === null && o !== null || e !== null && e.ref !== o) && (n.flags |= 512, n.flags |= 2097152);
  }
  function Ga(e, n, o, l, u) {
    var d = ft(o) ? nr : nt.current;
    return d = Vr(n, d), Zr(n, u), o = ja(e, n, o, l, d, u), l = Va(), e !== null && !dt ? (n.updateQueue = e.updateQueue, n.flags &= -2053, e.lanes &= ~u, hn(e, n, u)) : (Ae && l && Ea(n), n.flags |= 1, lt(e, n, o, u), n.child);
  }
  function xd(e, n, o, l, u) {
    if (ft(o)) {
      var d = !0;
      ul(n);
    } else d = !1;
    if (Zr(n, u), n.stateNode === null) Ml(e, n), ad(n, o, l), Za(n, o, l, u), l = !0;
    else if (e === null) {
      var v = n.stateNode, z = n.memoizedProps;
      v.props = z;
      var b = v.context, Z = o.contextType;
      typeof Z == "object" && Z !== null ? Z = It(Z) : (Z = ft(o) ? nr : nt.current, Z = Vr(n, Z));
      var ne = o.getDerivedStateFromProps, oe = typeof ne == "function" || typeof v.getSnapshotBeforeUpdate == "function";
      oe || typeof v.UNSAFE_componentWillReceiveProps != "function" && typeof v.componentWillReceiveProps != "function" || (z !== l || b !== Z) && ud(n, v, l, Z), bn = !1;
      var te = n.memoizedState;
      v.state = te, vl(n, l, v, u), b = n.memoizedState, z !== l || te !== b || ct.current || bn ? (typeof ne == "function" && (Xa(n, o, ne, l), b = n.memoizedState), (z = bn || sd(n, o, z, l, te, b, Z)) ? (oe || typeof v.UNSAFE_componentWillMount != "function" && typeof v.componentWillMount != "function" || (typeof v.componentWillMount == "function" && v.componentWillMount(), typeof v.UNSAFE_componentWillMount == "function" && v.UNSAFE_componentWillMount()), typeof v.componentDidMount == "function" && (n.flags |= 4194308)) : (typeof v.componentDidMount == "function" && (n.flags |= 4194308), n.memoizedProps = l, n.memoizedState = b), v.props = l, v.state = b, v.context = Z, l = z) : (typeof v.componentDidMount == "function" && (n.flags |= 4194308), l = !1);
    } else {
      v = n.stateNode, Af(e, n), z = n.memoizedProps, Z = n.type === n.elementType ? z : At(n.type, z), v.props = Z, oe = n.pendingProps, te = v.context, b = o.contextType, typeof b == "object" && b !== null ? b = It(b) : (b = ft(o) ? nr : nt.current, b = Vr(n, b));
      var fe = o.getDerivedStateFromProps;
      (ne = typeof fe == "function" || typeof v.getSnapshotBeforeUpdate == "function") || typeof v.UNSAFE_componentWillReceiveProps != "function" && typeof v.componentWillReceiveProps != "function" || (z !== oe || te !== b) && ud(n, v, l, b), bn = !1, te = n.memoizedState, v.state = te, vl(n, l, v, u);
      var pe = n.memoizedState;
      z !== oe || te !== pe || ct.current || bn ? (typeof fe == "function" && (Xa(n, o, fe, l), pe = n.memoizedState), (Z = bn || sd(n, o, Z, l, te, pe, b) || !1) ? (ne || typeof v.UNSAFE_componentWillUpdate != "function" && typeof v.componentWillUpdate != "function" || (typeof v.componentWillUpdate == "function" && v.componentWillUpdate(l, pe, b), typeof v.UNSAFE_componentWillUpdate == "function" && v.UNSAFE_componentWillUpdate(l, pe, b)), typeof v.componentDidUpdate == "function" && (n.flags |= 4), typeof v.getSnapshotBeforeUpdate == "function" && (n.flags |= 1024)) : (typeof v.componentDidUpdate != "function" || z === e.memoizedProps && te === e.memoizedState || (n.flags |= 4), typeof v.getSnapshotBeforeUpdate != "function" || z === e.memoizedProps && te === e.memoizedState || (n.flags |= 1024), n.memoizedProps = l, n.memoizedState = pe), v.props = l, v.state = pe, v.context = b, l = Z) : (typeof v.componentDidUpdate != "function" || z === e.memoizedProps && te === e.memoizedState || (n.flags |= 4), typeof v.getSnapshotBeforeUpdate != "function" || z === e.memoizedProps && te === e.memoizedState || (n.flags |= 1024), l = !1);
    }
    return qa(e, n, o, l, d, u);
  }
  function qa(e, n, o, l, u, d) {
    wd(e, n);
    var v = (n.flags & 128) !== 0;
    if (!l && !v) return u && Cf(n, o, !1), hn(e, n, d);
    l = n.stateNode, R0.current = n;
    var z = v && typeof o.getDerivedStateFromError != "function" ? null : l.render();
    return n.flags |= 1, e !== null && v ? (n.child = Yr(n, e.child, null, d), n.child = Yr(n, null, z, d)) : lt(e, n, z, d), n.memoizedState = l.state, u && Cf(n, o, !0), n.child;
  }
  function _d(e) {
    var n = e.stateNode;
    n.pendingContext ? kf(e, n.pendingContext, n.pendingContext !== n.context) : n.context && kf(e, n.context, !1), La(e, n.containerInfo);
  }
  function Sd(e, n, o, l, u) {
    return Wr(), za(u), n.flags |= 256, lt(e, n, o, l), n.child;
  }
  var Ja = { dehydrated: null, treeContext: null, retryLane: 0 };
  function eu(e) {
    return { baseLanes: e, cachePool: null, transitions: null };
  }
  function kd(e, n, o) {
    var l = n.pendingProps, u = Oe.current, d = !1, v = (n.flags & 128) !== 0, z;
    if ((z = v) || (z = e !== null && e.memoizedState === null ? !1 : (u & 2) !== 0), z ? (d = !0, n.flags &= -129) : (e === null || e.memoizedState !== null) && (u |= 1), be(Oe, u & 1), e === null)
      return Ma(n), e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? ((n.mode & 1) === 0 ? n.lanes = 1 : e.data === "$!" ? n.lanes = 8 : n.lanes = 1073741824, null) : (v = l.children, e = l.fallback, d ? (l = n.mode, d = n.child, v = { mode: "hidden", children: v }, (l & 1) === 0 && d !== null ? (d.childLanes = 0, d.pendingProps = v) : d = Hl(v, l, 0, null), e = dr(e, l, o, null), d.return = n, e.return = n, d.sibling = e, n.child = d, n.child.memoizedState = eu(o), n.memoizedState = Ja, e) : tu(n, v));
    if (u = e.memoizedState, u !== null && (z = u.dehydrated, z !== null)) return D0(e, n, v, l, z, u, o);
    if (d) {
      d = l.fallback, v = n.mode, u = e.child, z = u.sibling;
      var b = { mode: "hidden", children: l.children };
      return (v & 1) === 0 && n.child !== u ? (l = n.child, l.childLanes = 0, l.pendingProps = b, n.deletions = null) : (l = Hn(u, b), l.subtreeFlags = u.subtreeFlags & 14680064), z !== null ? d = Hn(z, d) : (d = dr(d, v, o, null), d.flags |= 2), d.return = n, l.return = n, l.sibling = d, n.child = l, l = d, d = n.child, v = e.child.memoizedState, v = v === null ? eu(o) : { baseLanes: v.baseLanes | o, cachePool: null, transitions: v.transitions }, d.memoizedState = v, d.childLanes = e.childLanes & ~o, n.memoizedState = Ja, l;
    }
    return d = e.child, e = d.sibling, l = Hn(d, { mode: "visible", children: l.children }), (n.mode & 1) === 0 && (l.lanes = o), l.return = n, l.sibling = null, e !== null && (o = n.deletions, o === null ? (n.deletions = [e], n.flags |= 16) : o.push(e)), n.child = l, n.memoizedState = null, l;
  }
  function tu(e, n) {
    return n = Hl({ mode: "visible", children: n }, e.mode, 0, null), n.return = e, e.child = n;
  }
  function Nl(e, n, o, l) {
    return l !== null && za(l), Yr(n, e.child, null, o), e = tu(n, n.pendingProps.children), e.flags |= 2, n.memoizedState = null, e;
  }
  function D0(e, n, o, l, u, d, v) {
    if (o)
      return n.flags & 256 ? (n.flags &= -257, l = Qa(Error(i(422))), Nl(e, n, v, l)) : n.memoizedState !== null ? (n.child = e.child, n.flags |= 128, null) : (d = l.fallback, u = n.mode, l = Hl({ mode: "visible", children: l.children }, u, 0, null), d = dr(d, u, v, null), d.flags |= 2, l.return = n, d.return = n, l.sibling = d, n.child = l, (n.mode & 1) !== 0 && Yr(n, e.child, null, v), n.child.memoizedState = eu(v), n.memoizedState = Ja, d);
    if ((n.mode & 1) === 0) return Nl(e, n, v, null);
    if (u.data === "$!") {
      if (l = u.nextSibling && u.nextSibling.dataset, l) var z = l.dgst;
      return l = z, d = Error(i(419)), l = Qa(d, l, void 0), Nl(e, n, v, l);
    }
    if (z = (v & e.childLanes) !== 0, dt || z) {
      if (l = Qe, l !== null) {
        switch (v & -v) {
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
        u = (u & (l.suspendedLanes | v)) !== 0 ? 0 : u, u !== 0 && u !== d.retryLane && (d.retryLane = u, dn(e, u), Ht(l, e, u, -1));
      }
      return yu(), l = Qa(Error(i(421))), Nl(e, n, v, l);
    }
    return u.data === "$?" ? (n.flags |= 128, n.child = e.child, n = X0.bind(null, e), u._reactRetry = n, null) : (e = d.treeContext, _t = zn(u.nextSibling), xt = n, Ae = !0, Lt = null, e !== null && (zt[Pt++] = cn, zt[Pt++] = fn, zt[Pt++] = rr, cn = e.id, fn = e.overflow, rr = n), n = tu(n, l.children), n.flags |= 4096, n);
  }
  function Ed(e, n, o) {
    e.lanes |= n;
    var l = e.alternate;
    l !== null && (l.lanes |= n), ba(e.return, n, o);
  }
  function nu(e, n, o, l, u) {
    var d = e.memoizedState;
    d === null ? e.memoizedState = { isBackwards: n, rendering: null, renderingStartTime: 0, last: l, tail: o, tailMode: u } : (d.isBackwards = n, d.rendering = null, d.renderingStartTime = 0, d.last = l, d.tail = o, d.tailMode = u);
  }
  function Cd(e, n, o) {
    var l = n.pendingProps, u = l.revealOrder, d = l.tail;
    if (lt(e, n, l.children, o), l = Oe.current, (l & 2) !== 0) l = l & 1 | 2, n.flags |= 128;
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
      l &= 1;
    }
    if (be(Oe, l), (n.mode & 1) === 0) n.memoizedState = null;
    else switch (u) {
      case "forwards":
        for (o = n.child, u = null; o !== null; ) e = o.alternate, e !== null && wl(e) === null && (u = o), o = o.sibling;
        o = u, o === null ? (u = n.child, n.child = null) : (u = o.sibling, o.sibling = null), nu(n, !1, u, o, d);
        break;
      case "backwards":
        for (o = null, u = n.child, n.child = null; u !== null; ) {
          if (e = u.alternate, e !== null && wl(e) === null) {
            n.child = u;
            break;
          }
          e = u.sibling, u.sibling = o, o = u, u = e;
        }
        nu(n, !0, o, null, d);
        break;
      case "together":
        nu(n, !1, null, null, void 0);
        break;
      default:
        n.memoizedState = null;
    }
    return n.child;
  }
  function Ml(e, n) {
    (n.mode & 1) === 0 && e !== null && (e.alternate = null, n.alternate = null, n.flags |= 2);
  }
  function hn(e, n, o) {
    if (e !== null && (n.dependencies = e.dependencies), ar |= n.lanes, (o & n.childLanes) === 0) return null;
    if (e !== null && n.child !== e.child) throw Error(i(153));
    if (n.child !== null) {
      for (e = n.child, o = Hn(e, e.pendingProps), n.child = o, o.return = n; e.sibling !== null; ) e = e.sibling, o = o.sibling = Hn(e, e.pendingProps), o.return = n;
      o.sibling = null;
    }
    return n.child;
  }
  function L0(e, n, o) {
    switch (n.tag) {
      case 3:
        _d(n), Wr();
        break;
      case 5:
        Hf(n);
        break;
      case 1:
        ft(n.type) && ul(n);
        break;
      case 4:
        La(n, n.stateNode.containerInfo);
        break;
      case 10:
        var l = n.type._context, u = n.memoizedProps.value;
        be(gl, l._currentValue), l._currentValue = u;
        break;
      case 13:
        if (l = n.memoizedState, l !== null)
          return l.dehydrated !== null ? (be(Oe, Oe.current & 1), n.flags |= 128, null) : (o & n.child.childLanes) !== 0 ? kd(e, n, o) : (be(Oe, Oe.current & 1), e = hn(e, n, o), e !== null ? e.sibling : null);
        be(Oe, Oe.current & 1);
        break;
      case 19:
        if (l = (o & n.childLanes) !== 0, (e.flags & 128) !== 0) {
          if (l) return Cd(e, n, o);
          n.flags |= 128;
        }
        if (u = n.memoizedState, u !== null && (u.rendering = null, u.tail = null, u.lastEffect = null), be(Oe, Oe.current), l) break;
        return null;
      case 22:
      case 23:
        return n.lanes = 0, vd(e, n, o);
    }
    return hn(e, n, o);
  }
  var Nd, ru, Md, zd;
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
  }, ru = function() {
  }, Md = function(e, n, o, l) {
    var u = e.memoizedProps;
    if (u !== l) {
      e = n.stateNode, lr(qt.current);
      var d = null;
      switch (o) {
        case "input":
          u = Ee(e, u), l = Ee(e, l), d = [];
          break;
        case "select":
          u = V({}, u, { value: void 0 }), l = V({}, l, { value: void 0 }), d = [];
          break;
        case "textarea":
          u = ln(e, u), l = ln(e, l), d = [];
          break;
        default:
          typeof u.onClick != "function" && typeof l.onClick == "function" && (e.onclick = ll);
      }
      yo(o, l);
      var v;
      o = null;
      for (Z in u) if (!l.hasOwnProperty(Z) && u.hasOwnProperty(Z) && u[Z] != null) if (Z === "style") {
        var z = u[Z];
        for (v in z) z.hasOwnProperty(v) && (o || (o = {}), o[v] = "");
      } else Z !== "dangerouslySetInnerHTML" && Z !== "children" && Z !== "suppressContentEditableWarning" && Z !== "suppressHydrationWarning" && Z !== "autoFocus" && (a.hasOwnProperty(Z) ? d || (d = []) : (d = d || []).push(Z, null));
      for (Z in l) {
        var b = l[Z];
        if (z = u?.[Z], l.hasOwnProperty(Z) && b !== z && (b != null || z != null)) if (Z === "style") if (z) {
          for (v in z) !z.hasOwnProperty(v) || b && b.hasOwnProperty(v) || (o || (o = {}), o[v] = "");
          for (v in b) b.hasOwnProperty(v) && z[v] !== b[v] && (o || (o = {}), o[v] = b[v]);
        } else o || (d || (d = []), d.push(
          Z,
          o
        )), o = b;
        else Z === "dangerouslySetInnerHTML" ? (b = b ? b.__html : void 0, z = z ? z.__html : void 0, b != null && z !== b && (d = d || []).push(Z, b)) : Z === "children" ? typeof b != "string" && typeof b != "number" || (d = d || []).push(Z, "" + b) : Z !== "suppressContentEditableWarning" && Z !== "suppressHydrationWarning" && (a.hasOwnProperty(Z) ? (b != null && Z === "onScroll" && De("scroll", e), d || z === b || (d = [])) : (d = d || []).push(Z, b));
      }
      o && (d = d || []).push("style", o);
      var Z = d;
      (n.updateQueue = Z) && (n.flags |= 4);
    }
  }, zd = function(e, n, o, l) {
    o !== l && (n.flags |= 4);
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
        for (var l = null; o !== null; ) o.alternate !== null && (l = o), o = o.sibling;
        l === null ? n || e.tail === null ? e.tail = null : e.tail.sibling = null : l.sibling = null;
    }
  }
  function ot(e) {
    var n = e.alternate !== null && e.alternate.child === e.child, o = 0, l = 0;
    if (n) for (var u = e.child; u !== null; ) o |= u.lanes | u.childLanes, l |= u.subtreeFlags & 14680064, l |= u.flags & 14680064, u.return = e, u = u.sibling;
    else for (u = e.child; u !== null; ) o |= u.lanes | u.childLanes, l |= u.subtreeFlags, l |= u.flags, u.return = e, u = u.sibling;
    return e.subtreeFlags |= l, e.childLanes = o, n;
  }
  function A0(e, n, o) {
    var l = n.pendingProps;
    switch (Ca(n), n.tag) {
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
        return ft(n.type) && al(), ot(n), null;
      case 3:
        return l = n.stateNode, Qr(), Le(ct), Le(nt), Oa(), l.pendingContext && (l.context = l.pendingContext, l.pendingContext = null), (e === null || e.child === null) && (pl(n) ? n.flags |= 4 : e === null || e.memoizedState.isDehydrated && (n.flags & 256) === 0 || (n.flags |= 1024, Lt !== null && (hu(Lt), Lt = null))), ru(e, n), ot(n), null;
      case 5:
        Aa(n);
        var u = lr(Qo.current);
        if (o = n.type, e !== null && n.stateNode != null) Md(e, n, o, l, u), e.ref !== n.ref && (n.flags |= 512, n.flags |= 2097152);
        else {
          if (!l) {
            if (n.stateNode === null) throw Error(i(166));
            return ot(n), null;
          }
          if (e = lr(qt.current), pl(n)) {
            l = n.stateNode, o = n.type;
            var d = n.memoizedProps;
            switch (l[Gt] = n, l[Uo] = d, e = (n.mode & 1) !== 0, o) {
              case "dialog":
                De("cancel", l), De("close", l);
                break;
              case "iframe":
              case "object":
              case "embed":
                De("load", l);
                break;
              case "video":
              case "audio":
                for (u = 0; u < jo.length; u++) De(jo[u], l);
                break;
              case "source":
                De("error", l);
                break;
              case "img":
              case "image":
              case "link":
                De(
                  "error",
                  l
                ), De("load", l);
                break;
              case "details":
                De("toggle", l);
                break;
              case "input":
                Ce(l, d), De("invalid", l);
                break;
              case "select":
                l._wrapperState = { wasMultiple: !!d.multiple }, De("invalid", l);
                break;
              case "textarea":
                Zt(l, d), De("invalid", l);
            }
            yo(o, d), u = null;
            for (var v in d) if (d.hasOwnProperty(v)) {
              var z = d[v];
              v === "children" ? typeof z == "string" ? l.textContent !== z && (d.suppressHydrationWarning !== !0 && il(l.textContent, z, e), u = ["children", z]) : typeof z == "number" && l.textContent !== "" + z && (d.suppressHydrationWarning !== !0 && il(
                l.textContent,
                z,
                e
              ), u = ["children", "" + z]) : a.hasOwnProperty(v) && z != null && v === "onScroll" && De("scroll", l);
            }
            switch (o) {
              case "input":
                Se(l), Ct(l, d, !0);
                break;
              case "textarea":
                Se(l), ut(l);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof d.onClick == "function" && (l.onclick = ll);
            }
            l = u, n.updateQueue = l, l !== null && (n.flags |= 4);
          } else {
            v = u.nodeType === 9 ? u : u.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = Nt(o)), e === "http://www.w3.org/1999/xhtml" ? o === "script" ? (e = v.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof l.is == "string" ? e = v.createElement(o, { is: l.is }) : (e = v.createElement(o), o === "select" && (v = e, l.multiple ? v.multiple = !0 : l.size && (v.size = l.size))) : e = v.createElementNS(e, o), e[Gt] = n, e[Uo] = l, Nd(e, n, !1, !1), n.stateNode = e;
            e: {
              switch (v = vo(o, l), o) {
                case "dialog":
                  De("cancel", e), De("close", e), u = l;
                  break;
                case "iframe":
                case "object":
                case "embed":
                  De("load", e), u = l;
                  break;
                case "video":
                case "audio":
                  for (u = 0; u < jo.length; u++) De(jo[u], e);
                  u = l;
                  break;
                case "source":
                  De("error", e), u = l;
                  break;
                case "img":
                case "image":
                case "link":
                  De(
                    "error",
                    e
                  ), De("load", e), u = l;
                  break;
                case "details":
                  De("toggle", e), u = l;
                  break;
                case "input":
                  Ce(e, l), u = Ee(e, l), De("invalid", e);
                  break;
                case "option":
                  u = l;
                  break;
                case "select":
                  e._wrapperState = { wasMultiple: !!l.multiple }, u = V({}, l, { value: void 0 }), De("invalid", e);
                  break;
                case "textarea":
                  Zt(e, l), u = ln(e, l), De("invalid", e);
                  break;
                default:
                  u = l;
              }
              yo(o, u), z = u;
              for (d in z) if (z.hasOwnProperty(d)) {
                var b = z[d];
                d === "style" ? Ii(e, b) : d === "dangerouslySetInnerHTML" ? (b = b ? b.__html : void 0, b != null && Cr(e, b)) : d === "children" ? typeof b == "string" ? (o !== "textarea" || b !== "") && sn(e, b) : typeof b == "number" && sn(e, "" + b) : d !== "suppressContentEditableWarning" && d !== "suppressHydrationWarning" && d !== "autoFocus" && (a.hasOwnProperty(d) ? b != null && d === "onScroll" && De("scroll", e) : b != null && S(e, d, b, v));
              }
              switch (o) {
                case "input":
                  Se(e), Ct(e, l, !1);
                  break;
                case "textarea":
                  Se(e), ut(e);
                  break;
                case "option":
                  l.value != null && e.setAttribute("value", "" + Q(l.value));
                  break;
                case "select":
                  e.multiple = !!l.multiple, d = l.value, d != null ? tt(e, !!l.multiple, d, !1) : l.defaultValue != null && tt(
                    e,
                    !!l.multiple,
                    l.defaultValue,
                    !0
                  );
                  break;
                default:
                  typeof u.onClick == "function" && (e.onclick = ll);
              }
              switch (o) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  l = !!l.autoFocus;
                  break e;
                case "img":
                  l = !0;
                  break e;
                default:
                  l = !1;
              }
            }
            l && (n.flags |= 4);
          }
          n.ref !== null && (n.flags |= 512, n.flags |= 2097152);
        }
        return ot(n), null;
      case 6:
        if (e && n.stateNode != null) zd(e, n, e.memoizedProps, l);
        else {
          if (typeof l != "string" && n.stateNode === null) throw Error(i(166));
          if (o = lr(Qo.current), lr(qt.current), pl(n)) {
            if (l = n.stateNode, o = n.memoizedProps, l[Gt] = n, (d = l.nodeValue !== o) && (e = xt, e !== null)) switch (e.tag) {
              case 3:
                il(l.nodeValue, o, (e.mode & 1) !== 0);
                break;
              case 5:
                e.memoizedProps.suppressHydrationWarning !== !0 && il(l.nodeValue, o, (e.mode & 1) !== 0);
            }
            d && (n.flags |= 4);
          } else l = (o.nodeType === 9 ? o : o.ownerDocument).createTextNode(l), l[Gt] = n, n.stateNode = l;
        }
        return ot(n), null;
      case 13:
        if (Le(Oe), l = n.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
          if (Ae && _t !== null && (n.mode & 1) !== 0 && (n.flags & 128) === 0) Tf(), Wr(), n.flags |= 98560, d = !1;
          else if (d = pl(n), l !== null && l.dehydrated !== null) {
            if (e === null) {
              if (!d) throw Error(i(318));
              if (d = n.memoizedState, d = d !== null ? d.dehydrated : null, !d) throw Error(i(317));
              d[Gt] = n;
            } else Wr(), (n.flags & 128) === 0 && (n.memoizedState = null), n.flags |= 4;
            ot(n), d = !1;
          } else Lt !== null && (hu(Lt), Lt = null), d = !0;
          if (!d) return n.flags & 65536 ? n : null;
        }
        return (n.flags & 128) !== 0 ? (n.lanes = o, n) : (l = l !== null, l !== (e !== null && e.memoizedState !== null) && l && (n.child.flags |= 8192, (n.mode & 1) !== 0 && (e === null || (Oe.current & 1) !== 0 ? Xe === 0 && (Xe = 3) : yu())), n.updateQueue !== null && (n.flags |= 4), ot(n), null);
      case 4:
        return Qr(), ru(e, n), e === null && Vo(n.stateNode.containerInfo), ot(n), null;
      case 10:
        return Ta(n.type._context), ot(n), null;
      case 17:
        return ft(n.type) && al(), ot(n), null;
      case 19:
        if (Le(Oe), d = n.memoizedState, d === null) return ot(n), null;
        if (l = (n.flags & 128) !== 0, v = d.rendering, v === null) if (l) ei(d, !1);
        else {
          if (Xe !== 0 || e !== null && (e.flags & 128) !== 0) for (e = n.child; e !== null; ) {
            if (v = wl(e), v !== null) {
              for (n.flags |= 128, ei(d, !1), l = v.updateQueue, l !== null && (n.updateQueue = l, n.flags |= 4), n.subtreeFlags = 0, l = o, o = n.child; o !== null; ) d = o, e = l, d.flags &= 14680066, v = d.alternate, v === null ? (d.childLanes = 0, d.lanes = e, d.child = null, d.subtreeFlags = 0, d.memoizedProps = null, d.memoizedState = null, d.updateQueue = null, d.dependencies = null, d.stateNode = null) : (d.childLanes = v.childLanes, d.lanes = v.lanes, d.child = v.child, d.subtreeFlags = 0, d.deletions = null, d.memoizedProps = v.memoizedProps, d.memoizedState = v.memoizedState, d.updateQueue = v.updateQueue, d.type = v.type, e = v.dependencies, d.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), o = o.sibling;
              return be(Oe, Oe.current & 1 | 2), n.child;
            }
            e = e.sibling;
          }
          d.tail !== null && $e() > Jr && (n.flags |= 128, l = !0, ei(d, !1), n.lanes = 4194304);
        }
        else {
          if (!l) if (e = wl(v), e !== null) {
            if (n.flags |= 128, l = !0, o = e.updateQueue, o !== null && (n.updateQueue = o, n.flags |= 4), ei(d, !0), d.tail === null && d.tailMode === "hidden" && !v.alternate && !Ae) return ot(n), null;
          } else 2 * $e() - d.renderingStartTime > Jr && o !== 1073741824 && (n.flags |= 128, l = !0, ei(d, !1), n.lanes = 4194304);
          d.isBackwards ? (v.sibling = n.child, n.child = v) : (o = d.last, o !== null ? o.sibling = v : n.child = v, d.last = v);
        }
        return d.tail !== null ? (n = d.tail, d.rendering = n, d.tail = n.sibling, d.renderingStartTime = $e(), n.sibling = null, o = Oe.current, be(Oe, l ? o & 1 | 2 : o & 1), n) : (ot(n), null);
      case 22:
      case 23:
        return mu(), l = n.memoizedState !== null, e !== null && e.memoizedState !== null !== l && (n.flags |= 8192), l && (n.mode & 1) !== 0 ? (St & 1073741824) !== 0 && (ot(n), n.subtreeFlags & 6 && (n.flags |= 8192)) : ot(n), null;
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(i(156, n.tag));
  }
  function $0(e, n) {
    switch (Ca(n), n.tag) {
      case 1:
        return ft(n.type) && al(), e = n.flags, e & 65536 ? (n.flags = e & -65537 | 128, n) : null;
      case 3:
        return Qr(), Le(ct), Le(nt), Oa(), e = n.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (n.flags = e & -65537 | 128, n) : null;
      case 5:
        return Aa(n), null;
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
        return Ta(n.type._context), null;
      case 22:
      case 23:
        return mu(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var zl = !1, it = !1, O0 = typeof WeakSet == "function" ? WeakSet : Set, de = null;
  function Gr(e, n) {
    var o = e.ref;
    if (o !== null) if (typeof o == "function") try {
      o(null);
    } catch (l) {
      je(e, n, l);
    }
    else o.current = null;
  }
  function ou(e, n, o) {
    try {
      o();
    } catch (l) {
      je(e, n, l);
    }
  }
  var Pd = !1;
  function H0(e, n) {
    if (ma = Zi, e = sf(), aa(e)) {
      if ("selectionStart" in e) var o = { start: e.selectionStart, end: e.selectionEnd };
      else e: {
        o = (o = e.ownerDocument) && o.defaultView || window;
        var l = o.getSelection && o.getSelection();
        if (l && l.rangeCount !== 0) {
          o = l.anchorNode;
          var u = l.anchorOffset, d = l.focusNode;
          l = l.focusOffset;
          try {
            o.nodeType, d.nodeType;
          } catch {
            o = null;
            break e;
          }
          var v = 0, z = -1, b = -1, Z = 0, ne = 0, oe = e, te = null;
          t: for (; ; ) {
            for (var fe; oe !== o || u !== 0 && oe.nodeType !== 3 || (z = v + u), oe !== d || l !== 0 && oe.nodeType !== 3 || (b = v + l), oe.nodeType === 3 && (v += oe.nodeValue.length), (fe = oe.firstChild) !== null; )
              te = oe, oe = fe;
            for (; ; ) {
              if (oe === e) break t;
              if (te === o && ++Z === u && (z = v), te === d && ++ne === l && (b = v), (fe = oe.nextSibling) !== null) break;
              oe = te, te = oe.parentNode;
            }
            oe = fe;
          }
          o = z === -1 || b === -1 ? null : { start: z, end: b };
        } else o = null;
      }
      o = o || { start: 0, end: 0 };
    } else o = null;
    for (ya = { focusedElem: e, selectionRange: o }, Zi = !1, de = n; de !== null; ) if (n = de, e = n.child, (n.subtreeFlags & 1028) !== 0 && e !== null) e.return = n, de = e;
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
              var he = pe.memoizedProps, Be = pe.memoizedState, B = n.stateNode, L = B.getSnapshotBeforeUpdate(n.elementType === n.type ? he : At(n.type, he), Be);
              B.__reactInternalSnapshotBeforeUpdate = L;
            }
            break;
          case 3:
            var W = n.stateNode.containerInfo;
            W.nodeType === 1 ? W.textContent = "" : W.nodeType === 9 && W.documentElement && W.removeChild(W.documentElement);
            break;
          case 5:
          case 6:
          case 4:
          case 17:
            break;
          default:
            throw Error(i(163));
        }
      } catch (le) {
        je(n, n.return, le);
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
    var l = n.updateQueue;
    if (l = l !== null ? l.lastEffect : null, l !== null) {
      var u = l = l.next;
      do {
        if ((u.tag & e) === e) {
          var d = u.destroy;
          u.destroy = void 0, d !== void 0 && ou(n, o, d);
        }
        u = u.next;
      } while (u !== l);
    }
  }
  function Pl(e, n) {
    if (n = n.updateQueue, n = n !== null ? n.lastEffect : null, n !== null) {
      var o = n = n.next;
      do {
        if ((o.tag & e) === e) {
          var l = o.create;
          o.destroy = l();
        }
        o = o.next;
      } while (o !== n);
    }
  }
  function iu(e) {
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
    n !== null && (e.alternate = null, Id(n)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (n = e.stateNode, n !== null && (delete n[Gt], delete n[Uo], delete n[_a], delete n[_0], delete n[S0])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
  }
  function Td(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 4;
  }
  function bd(e) {
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
    var l = e.tag;
    if (l === 5 || l === 6) e = e.stateNode, n ? o.nodeType === 8 ? o.parentNode.insertBefore(e, n) : o.insertBefore(e, n) : (o.nodeType === 8 ? (n = o.parentNode, n.insertBefore(e, o)) : (n = o, n.appendChild(e)), o = o._reactRootContainer, o != null || n.onclick !== null || (n.onclick = ll));
    else if (l !== 4 && (e = e.child, e !== null)) for (lu(e, n, o), e = e.sibling; e !== null; ) lu(e, n, o), e = e.sibling;
  }
  function su(e, n, o) {
    var l = e.tag;
    if (l === 5 || l === 6) e = e.stateNode, n ? o.insertBefore(e, n) : o.appendChild(e);
    else if (l !== 4 && (e = e.child, e !== null)) for (su(e, n, o), e = e.sibling; e !== null; ) su(e, n, o), e = e.sibling;
  }
  var qe = null, $t = !1;
  function Dn(e, n, o) {
    for (o = o.child; o !== null; ) Rd(e, n, o), o = o.sibling;
  }
  function Rd(e, n, o) {
    if (yt && typeof yt.onCommitFiberUnmount == "function") try {
      yt.onCommitFiberUnmount(Pr, o);
    } catch {
    }
    switch (o.tag) {
      case 5:
        it || Gr(o, n);
      case 6:
        var l = qe, u = $t;
        qe = null, Dn(e, n, o), qe = l, $t = u, qe !== null && ($t ? (e = qe, o = o.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(o) : e.removeChild(o)) : qe.removeChild(o.stateNode));
        break;
      case 18:
        qe !== null && ($t ? (e = qe, o = o.stateNode, e.nodeType === 8 ? xa(e.parentNode, o) : e.nodeType === 1 && xa(e, o), Ro(e)) : xa(qe, o.stateNode));
        break;
      case 4:
        l = qe, u = $t, qe = o.stateNode.containerInfo, $t = !0, Dn(e, n, o), qe = l, $t = u;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (!it && (l = o.updateQueue, l !== null && (l = l.lastEffect, l !== null))) {
          u = l = l.next;
          do {
            var d = u, v = d.destroy;
            d = d.tag, v !== void 0 && ((d & 2) !== 0 || (d & 4) !== 0) && ou(o, n, v), u = u.next;
          } while (u !== l);
        }
        Dn(e, n, o);
        break;
      case 1:
        if (!it && (Gr(o, n), l = o.stateNode, typeof l.componentWillUnmount == "function")) try {
          l.props = o.memoizedProps, l.state = o.memoizedState, l.componentWillUnmount();
        } catch (z) {
          je(o, n, z);
        }
        Dn(e, n, o);
        break;
      case 21:
        Dn(e, n, o);
        break;
      case 22:
        o.mode & 1 ? (it = (l = it) || o.memoizedState !== null, Dn(e, n, o), it = l) : Dn(e, n, o);
        break;
      default:
        Dn(e, n, o);
    }
  }
  function Dd(e) {
    var n = e.updateQueue;
    if (n !== null) {
      e.updateQueue = null;
      var o = e.stateNode;
      o === null && (o = e.stateNode = new O0()), n.forEach(function(l) {
        var u = Z0.bind(null, e, l);
        o.has(l) || (o.add(l), l.then(u, u));
      });
    }
  }
  function Ot(e, n) {
    var o = n.deletions;
    if (o !== null) for (var l = 0; l < o.length; l++) {
      var u = o[l];
      try {
        var d = e, v = n, z = v;
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
        Rd(d, v, u), qe = null, $t = !1;
        var b = u.alternate;
        b !== null && (b.return = null), u.return = null;
      } catch (Z) {
        je(u, n, Z);
      }
    }
    if (n.subtreeFlags & 12854) for (n = n.child; n !== null; ) Ld(n, e), n = n.sibling;
  }
  function Ld(e, n) {
    var o = e.alternate, l = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (Ot(n, e), en(e), l & 4) {
          try {
            ti(3, e, e.return), Pl(3, e);
          } catch (he) {
            je(e, e.return, he);
          }
          try {
            ti(5, e, e.return);
          } catch (he) {
            je(e, e.return, he);
          }
        }
        break;
      case 1:
        Ot(n, e), en(e), l & 512 && o !== null && Gr(o, o.return);
        break;
      case 5:
        if (Ot(n, e), en(e), l & 512 && o !== null && Gr(o, o.return), e.flags & 32) {
          var u = e.stateNode;
          try {
            sn(u, "");
          } catch (he) {
            je(e, e.return, he);
          }
        }
        if (l & 4 && (u = e.stateNode, u != null)) {
          var d = e.memoizedProps, v = o !== null ? o.memoizedProps : d, z = e.type, b = e.updateQueue;
          if (e.updateQueue = null, b !== null) try {
            z === "input" && d.type === "radio" && d.name != null && ze(u, d), vo(z, v);
            var Z = vo(z, d);
            for (v = 0; v < b.length; v += 2) {
              var ne = b[v], oe = b[v + 1];
              ne === "style" ? Ii(u, oe) : ne === "dangerouslySetInnerHTML" ? Cr(u, oe) : ne === "children" ? sn(u, oe) : S(u, ne, oe, Z);
            }
            switch (z) {
              case "input":
                Ve(u, d);
                break;
              case "textarea":
                Qt(u, d);
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
            je(e, e.return, he);
          }
        }
        break;
      case 6:
        if (Ot(n, e), en(e), l & 4) {
          if (e.stateNode === null) throw Error(i(162));
          u = e.stateNode, d = e.memoizedProps;
          try {
            u.nodeValue = d;
          } catch (he) {
            je(e, e.return, he);
          }
        }
        break;
      case 3:
        if (Ot(n, e), en(e), l & 4 && o !== null && o.memoizedState.isDehydrated) try {
          Ro(n.containerInfo);
        } catch (he) {
          je(e, e.return, he);
        }
        break;
      case 4:
        Ot(n, e), en(e);
        break;
      case 13:
        Ot(n, e), en(e), u = e.child, u.flags & 8192 && (d = u.memoizedState !== null, u.stateNode.isHidden = d, !d || u.alternate !== null && u.alternate.memoizedState !== null || (cu = $e())), l & 4 && Dd(e);
        break;
      case 22:
        if (ne = o !== null && o.memoizedState !== null, e.mode & 1 ? (it = (Z = it) || ne, Ot(n, e), it = Z) : Ot(n, e), en(e), l & 8192) {
          if (Z = e.memoizedState !== null, (e.stateNode.isHidden = Z) && !ne && (e.mode & 1) !== 0) for (de = e, ne = e.child; ne !== null; ) {
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
                    l = te, o = te.return;
                    try {
                      n = l, pe.props = n.memoizedProps, pe.state = n.memoizedState, pe.componentWillUnmount();
                    } catch (he) {
                      je(l, o, he);
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
                  u = oe.stateNode, Z ? (d = u.style, typeof d.setProperty == "function" ? d.setProperty("display", "none", "important") : d.display = "none") : (z = oe.stateNode, b = oe.memoizedProps.style, v = b != null && b.hasOwnProperty("display") ? b.display : null, z.style.display = Pi("display", v));
                } catch (he) {
                  je(e, e.return, he);
                }
              }
            } else if (oe.tag === 6) {
              if (ne === null) try {
                oe.stateNode.nodeValue = Z ? "" : oe.memoizedProps;
              } catch (he) {
                je(e, e.return, he);
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
        Ot(n, e), en(e), l & 4 && Dd(e);
        break;
      case 21:
        break;
      default:
        Ot(
          n,
          e
        ), en(e);
    }
  }
  function en(e) {
    var n = e.flags;
    if (n & 2) {
      try {
        e: {
          for (var o = e.return; o !== null; ) {
            if (Td(o)) {
              var l = o;
              break e;
            }
            o = o.return;
          }
          throw Error(i(160));
        }
        switch (l.tag) {
          case 5:
            var u = l.stateNode;
            l.flags & 32 && (sn(u, ""), l.flags &= -33);
            var d = bd(e);
            su(e, d, u);
            break;
          case 3:
          case 4:
            var v = l.stateNode.containerInfo, z = bd(e);
            lu(e, z, v);
            break;
          default:
            throw Error(i(161));
        }
      } catch (b) {
        je(e, e.return, b);
      }
      e.flags &= -3;
    }
    n & 4096 && (e.flags &= -4097);
  }
  function F0(e, n, o) {
    de = e, Ad(e);
  }
  function Ad(e, n, o) {
    for (var l = (e.mode & 1) !== 0; de !== null; ) {
      var u = de, d = u.child;
      if (u.tag === 22 && l) {
        var v = u.memoizedState !== null || zl;
        if (!v) {
          var z = u.alternate, b = z !== null && z.memoizedState !== null || it;
          z = zl;
          var Z = it;
          if (zl = v, (it = b) && !Z) for (de = u; de !== null; ) v = de, b = v.child, v.tag === 22 && v.memoizedState !== null ? Hd(u) : b !== null ? (b.return = v, de = b) : Hd(u);
          for (; d !== null; ) de = d, Ad(d), d = d.sibling;
          de = u, zl = z, it = Z;
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
              it || Pl(5, n);
              break;
            case 1:
              var l = n.stateNode;
              if (n.flags & 4 && !it) if (o === null) l.componentDidMount();
              else {
                var u = n.elementType === n.type ? o.memoizedProps : At(n.type, o.memoizedProps);
                l.componentDidUpdate(u, o.memoizedState, l.__reactInternalSnapshotBeforeUpdate);
              }
              var d = n.updateQueue;
              d !== null && Of(n, d, l);
              break;
            case 3:
              var v = n.updateQueue;
              if (v !== null) {
                if (o = null, n.child !== null) switch (n.child.tag) {
                  case 5:
                    o = n.child.stateNode;
                    break;
                  case 1:
                    o = n.child.stateNode;
                }
                Of(n, v, o);
              }
              break;
            case 5:
              var z = n.stateNode;
              if (o === null && n.flags & 4) {
                o = z;
                var b = n.memoizedProps;
                switch (n.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    b.autoFocus && o.focus();
                    break;
                  case "img":
                    b.src && (o.src = b.src);
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
                var Z = n.alternate;
                if (Z !== null) {
                  var ne = Z.memoizedState;
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
          it || n.flags & 512 && iu(n);
        } catch (te) {
          je(n, n.return, te);
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
              Pl(4, n);
            } catch (b) {
              je(n, o, b);
            }
            break;
          case 1:
            var l = n.stateNode;
            if (typeof l.componentDidMount == "function") {
              var u = n.return;
              try {
                l.componentDidMount();
              } catch (b) {
                je(n, u, b);
              }
            }
            var d = n.return;
            try {
              iu(n);
            } catch (b) {
              je(n, d, b);
            }
            break;
          case 5:
            var v = n.return;
            try {
              iu(n);
            } catch (b) {
              je(n, v, b);
            }
        }
      } catch (b) {
        je(n, n.return, b);
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
  var j0 = Math.ceil, Il = P.ReactCurrentDispatcher, au = P.ReactCurrentOwner, bt = P.ReactCurrentBatchConfig, Pe = 0, Qe = null, Ue = null, Je = 0, St = 0, qr = Pn(0), Xe = 0, ni = null, ar = 0, Tl = 0, uu = 0, ri = null, pt = null, cu = 0, Jr = 1 / 0, gn = null, bl = !1, fu = null, Ln = null, Rl = !1, An = null, Dl = 0, oi = 0, du = null, Ll = -1, Al = 0;
  function st() {
    return (Pe & 6) !== 0 ? $e() : Ll !== -1 ? Ll : Ll = $e();
  }
  function $n(e) {
    return (e.mode & 1) === 0 ? 1 : (Pe & 2) !== 0 && Je !== 0 ? Je & -Je : E0.transition !== null ? (Al === 0 && (Al = Wi()), Al) : (e = Te, e !== 0 || (e = window.event, e = e === void 0 ? 16 : Fc(e.type)), e);
  }
  function Ht(e, n, o, l) {
    if (50 < oi) throw oi = 0, du = null, Error(i(185));
    er(e, o, l), ((Pe & 2) === 0 || e !== Qe) && (e === Qe && ((Pe & 2) === 0 && (Tl |= o), Xe === 4 && On(e, Je)), ht(e, l), o === 1 && Pe === 0 && (n.mode & 1) === 0 && (Jr = $e() + 500, cl && Tn()));
  }
  function ht(e, n) {
    var o = e.callbackNode;
    Ui(e, n);
    var l = qn(e, e === Qe ? Je : 0);
    if (l === 0) o !== null && Fi(o), e.callbackNode = null, e.callbackPriority = 0;
    else if (n = l & -l, e.callbackPriority !== n) {
      if (o != null && Fi(o), n === 1) e.tag === 0 ? k0(jd.bind(null, e)) : Nf(jd.bind(null, e)), w0(function() {
        (Pe & 6) === 0 && Tn();
      }), o = null;
      else {
        switch (bc(l)) {
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
        o = Qd(o, Fd.bind(null, e));
      }
      e.callbackPriority = n, e.callbackNode = o;
    }
  }
  function Fd(e, n) {
    if (Ll = -1, Al = 0, (Pe & 6) !== 0) throw Error(i(327));
    var o = e.callbackNode;
    if (eo() && e.callbackNode !== o) return null;
    var l = qn(e, e === Qe ? Je : 0);
    if (l === 0) return null;
    if ((l & 30) !== 0 || (l & e.expiredLanes) !== 0 || n) n = $l(e, l);
    else {
      n = l;
      var u = Pe;
      Pe |= 2;
      var d = Bd();
      (Qe !== e || Je !== n) && (gn = null, Jr = $e() + 500, cr(e, n));
      do
        try {
          U0();
          break;
        } catch (z) {
          Vd(e, z);
        }
      while (!0);
      Ia(), Il.current = d, Pe = u, Ue !== null ? n = 0 : (Qe = null, Je = 0, n = Xe);
    }
    if (n !== 0) {
      if (n === 2 && (u = zo(e), u !== 0 && (l = u, n = pu(e, u))), n === 1) throw o = ni, cr(e, 0), On(e, l), ht(e, $e()), o;
      if (n === 6) On(e, l);
      else {
        if (u = e.current.alternate, (l & 30) === 0 && !V0(u) && (n = $l(e, l), n === 2 && (d = zo(e), d !== 0 && (l = d, n = pu(e, d))), n === 1)) throw o = ni, cr(e, 0), On(e, l), ht(e, $e()), o;
        switch (e.finishedWork = u, e.finishedLanes = l, n) {
          case 0:
          case 1:
            throw Error(i(345));
          case 2:
            fr(e, pt, gn);
            break;
          case 3:
            if (On(e, l), (l & 130023424) === l && (n = cu + 500 - $e(), 10 < n)) {
              if (qn(e, 0) !== 0) break;
              if (u = e.suspendedLanes, (u & l) !== l) {
                st(), e.pingedLanes |= e.suspendedLanes & u;
                break;
              }
              e.timeoutHandle = wa(fr.bind(null, e, pt, gn), n);
              break;
            }
            fr(e, pt, gn);
            break;
          case 4:
            if (On(e, l), (l & 4194240) === l) break;
            for (n = e.eventTimes, u = -1; 0 < l; ) {
              var v = 31 - vt(l);
              d = 1 << v, v = n[v], v > u && (u = v), l &= ~d;
            }
            if (l = u, l = $e() - l, l = (120 > l ? 120 : 480 > l ? 480 : 1080 > l ? 1080 : 1920 > l ? 1920 : 3e3 > l ? 3e3 : 4320 > l ? 4320 : 1960 * j0(l / 1960)) - l, 10 < l) {
              e.timeoutHandle = wa(fr.bind(null, e, pt, gn), l);
              break;
            }
            fr(e, pt, gn);
            break;
          case 5:
            fr(e, pt, gn);
            break;
          default:
            throw Error(i(329));
        }
      }
    }
    return ht(e, $e()), e.callbackNode === o ? Fd.bind(null, e) : null;
  }
  function pu(e, n) {
    var o = ri;
    return e.current.memoizedState.isDehydrated && (cr(e, n).flags |= 256), e = $l(e, n), e !== 2 && (n = pt, pt = o, n !== null && hu(n)), e;
  }
  function hu(e) {
    pt === null ? pt = e : pt.push.apply(pt, e);
  }
  function V0(e) {
    for (var n = e; ; ) {
      if (n.flags & 16384) {
        var o = n.updateQueue;
        if (o !== null && (o = o.stores, o !== null)) for (var l = 0; l < o.length; l++) {
          var u = o[l], d = u.getSnapshot;
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
  function On(e, n) {
    for (n &= ~uu, n &= ~Tl, e.suspendedLanes |= n, e.pingedLanes &= ~n, e = e.expirationTimes; 0 < n; ) {
      var o = 31 - vt(n), l = 1 << o;
      e[o] = -1, n &= ~l;
    }
  }
  function jd(e) {
    if ((Pe & 6) !== 0) throw Error(i(327));
    eo();
    var n = qn(e, 0);
    if ((n & 1) === 0) return ht(e, $e()), null;
    var o = $l(e, n);
    if (e.tag !== 0 && o === 2) {
      var l = zo(e);
      l !== 0 && (n = l, o = pu(e, l));
    }
    if (o === 1) throw o = ni, cr(e, 0), On(e, n), ht(e, $e()), o;
    if (o === 6) throw Error(i(345));
    return e.finishedWork = e.current.alternate, e.finishedLanes = n, fr(e, pt, gn), ht(e, $e()), null;
  }
  function gu(e, n) {
    var o = Pe;
    Pe |= 1;
    try {
      return e(n);
    } finally {
      Pe = o, Pe === 0 && (Jr = $e() + 500, cl && Tn());
    }
  }
  function ur(e) {
    An !== null && An.tag === 0 && (Pe & 6) === 0 && eo();
    var n = Pe;
    Pe |= 1;
    var o = bt.transition, l = Te;
    try {
      if (bt.transition = null, Te = 1, e) return e();
    } finally {
      Te = l, bt.transition = o, Pe = n, (Pe & 6) === 0 && Tn();
    }
  }
  function mu() {
    St = qr.current, Le(qr);
  }
  function cr(e, n) {
    e.finishedWork = null, e.finishedLanes = 0;
    var o = e.timeoutHandle;
    if (o !== -1 && (e.timeoutHandle = -1, v0(o)), Ue !== null) for (o = Ue.return; o !== null; ) {
      var l = o;
      switch (Ca(l), l.tag) {
        case 1:
          l = l.type.childContextTypes, l != null && al();
          break;
        case 3:
          Qr(), Le(ct), Le(nt), Oa();
          break;
        case 5:
          Aa(l);
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
          Ta(l.type._context);
          break;
        case 22:
        case 23:
          mu();
      }
      o = o.return;
    }
    if (Qe = e, Ue = e = Hn(e.current, null), Je = St = n, Xe = 0, ni = null, uu = Tl = ar = 0, pt = ri = null, ir !== null) {
      for (n = 0; n < ir.length; n++) if (o = ir[n], l = o.interleaved, l !== null) {
        o.interleaved = null;
        var u = l.next, d = o.pending;
        if (d !== null) {
          var v = d.next;
          d.next = u, l.next = v;
        }
        o.pending = l;
      }
      ir = null;
    }
    return e;
  }
  function Vd(e, n) {
    do {
      var o = Ue;
      try {
        if (Ia(), xl.current = El, _l) {
          for (var l = He.memoizedState; l !== null; ) {
            var u = l.queue;
            u !== null && (u.pending = null), l = l.next;
          }
          _l = !1;
        }
        if (sr = 0, Ze = Ye = He = null, Ko = !1, Go = 0, au.current = null, o === null || o.return === null) {
          Xe = 1, ni = n, Ue = null;
          break;
        }
        e: {
          var d = e, v = o.return, z = o, b = n;
          if (n = Je, z.flags |= 32768, b !== null && typeof b == "object" && typeof b.then == "function") {
            var Z = b, ne = z, oe = ne.tag;
            if ((ne.mode & 1) === 0 && (oe === 0 || oe === 11 || oe === 15)) {
              var te = ne.alternate;
              te ? (ne.updateQueue = te.updateQueue, ne.memoizedState = te.memoizedState, ne.lanes = te.lanes) : (ne.updateQueue = null, ne.memoizedState = null);
            }
            var fe = pd(v);
            if (fe !== null) {
              fe.flags &= -257, hd(fe, v, z, d, n), fe.mode & 1 && dd(d, Z, n), n = fe, b = Z;
              var pe = n.updateQueue;
              if (pe === null) {
                var he = /* @__PURE__ */ new Set();
                he.add(b), n.updateQueue = he;
              } else pe.add(b);
              break e;
            } else {
              if ((n & 1) === 0) {
                dd(d, Z, n), yu();
                break e;
              }
              b = Error(i(426));
            }
          } else if (Ae && z.mode & 1) {
            var Be = pd(v);
            if (Be !== null) {
              (Be.flags & 65536) === 0 && (Be.flags |= 256), hd(Be, v, z, d, n), za(Kr(b, z));
              break e;
            }
          }
          d = b = Kr(b, z), Xe !== 4 && (Xe = 2), ri === null ? ri = [d] : ri.push(d), d = v;
          do {
            switch (d.tag) {
              case 3:
                d.flags |= 65536, n &= -n, d.lanes |= n;
                var B = cd(d, b, n);
                $f(d, B);
                break e;
              case 1:
                z = b;
                var L = d.type, W = d.stateNode;
                if ((d.flags & 128) === 0 && (typeof L.getDerivedStateFromError == "function" || W !== null && typeof W.componentDidCatch == "function" && (Ln === null || !Ln.has(W)))) {
                  d.flags |= 65536, n &= -n, d.lanes |= n;
                  var le = fd(d, z, n);
                  $f(d, le);
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
    var e = Il.current;
    return Il.current = El, e === null ? El : e;
  }
  function yu() {
    (Xe === 0 || Xe === 3 || Xe === 2) && (Xe = 4), Qe === null || (ar & 268435455) === 0 && (Tl & 268435455) === 0 || On(Qe, Je);
  }
  function $l(e, n) {
    var o = Pe;
    Pe |= 2;
    var l = Bd();
    (Qe !== e || Je !== n) && (gn = null, cr(e, n));
    do
      try {
        B0();
        break;
      } catch (u) {
        Vd(e, u);
      }
    while (!0);
    if (Ia(), Pe = o, Il.current = l, Ue !== null) throw Error(i(261));
    return Qe = null, Je = 0, Xe;
  }
  function B0() {
    for (; Ue !== null; ) Ud(Ue);
  }
  function U0() {
    for (; Ue !== null && !Fs(); ) Ud(Ue);
  }
  function Ud(e) {
    var n = Zd(e.alternate, e, St);
    e.memoizedProps = e.pendingProps, n === null ? Wd(e) : Ue = n, au.current = null;
  }
  function Wd(e) {
    var n = e;
    do {
      var o = n.alternate;
      if (e = n.return, (n.flags & 32768) === 0) {
        if (o = A0(o, n, St), o !== null) {
          Ue = o;
          return;
        }
      } else {
        if (o = $0(o, n), o !== null) {
          o.flags &= 32767, Ue = o;
          return;
        }
        if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
        else {
          Xe = 6, Ue = null;
          return;
        }
      }
      if (n = n.sibling, n !== null) {
        Ue = n;
        return;
      }
      Ue = n = e;
    } while (n !== null);
    Xe === 0 && (Xe = 5);
  }
  function fr(e, n, o) {
    var l = Te, u = bt.transition;
    try {
      bt.transition = null, Te = 1, W0(e, n, o, l);
    } finally {
      bt.transition = u, Te = l;
    }
    return null;
  }
  function W0(e, n, o, l) {
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
    if (Zs(e, d), e === Qe && (Ue = Qe = null, Je = 0), (o.subtreeFlags & 2064) === 0 && (o.flags & 2064) === 0 || Rl || (Rl = !0, Qd(zr, function() {
      return eo(), null;
    })), d = (o.flags & 15990) !== 0, (o.subtreeFlags & 15990) !== 0 || d) {
      d = bt.transition, bt.transition = null;
      var v = Te;
      Te = 1;
      var z = Pe;
      Pe |= 4, au.current = null, H0(e, o), Ld(o, e), f0(ya), Zi = !!ma, ya = ma = null, e.current = o, F0(o), ji(), Pe = z, Te = v, bt.transition = d;
    } else e.current = o;
    if (Rl && (Rl = !1, An = e, Dl = u), d = e.pendingLanes, d === 0 && (Ln = null), Bs(o.stateNode), ht(e, $e()), n !== null) for (l = e.onRecoverableError, o = 0; o < n.length; o++) u = n[o], l(u.value, { componentStack: u.stack, digest: u.digest });
    if (bl) throw bl = !1, e = fu, fu = null, e;
    return (Dl & 1) !== 0 && e.tag !== 0 && eo(), d = e.pendingLanes, (d & 1) !== 0 ? e === du ? oi++ : (oi = 0, du = e) : oi = 0, Tn(), null;
  }
  function eo() {
    if (An !== null) {
      var e = bc(Dl), n = bt.transition, o = Te;
      try {
        if (bt.transition = null, Te = 16 > e ? 16 : e, An === null) var l = !1;
        else {
          if (e = An, An = null, Dl = 0, (Pe & 6) !== 0) throw Error(i(331));
          var u = Pe;
          for (Pe |= 4, de = e.current; de !== null; ) {
            var d = de, v = d.child;
            if ((de.flags & 16) !== 0) {
              var z = d.deletions;
              if (z !== null) {
                for (var b = 0; b < z.length; b++) {
                  var Z = z[b];
                  for (de = Z; de !== null; ) {
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
                      if (Id(ne), ne === Z) {
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
            if ((d.subtreeFlags & 2064) !== 0 && v !== null) v.return = d, de = v;
            else e: for (; de !== null; ) {
              if (d = de, (d.flags & 2048) !== 0) switch (d.tag) {
                case 0:
                case 11:
                case 15:
                  ti(9, d, d.return);
              }
              var B = d.sibling;
              if (B !== null) {
                B.return = d.return, de = B;
                break e;
              }
              de = d.return;
            }
          }
          var L = e.current;
          for (de = L; de !== null; ) {
            v = de;
            var W = v.child;
            if ((v.subtreeFlags & 2064) !== 0 && W !== null) W.return = v, de = W;
            else e: for (v = L; de !== null; ) {
              if (z = de, (z.flags & 2048) !== 0) try {
                switch (z.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Pl(9, z);
                }
              } catch (ge) {
                je(z, z.return, ge);
              }
              if (z === v) {
                de = null;
                break e;
              }
              var le = z.sibling;
              if (le !== null) {
                le.return = z.return, de = le;
                break e;
              }
              de = z.return;
            }
          }
          if (Pe = u, Tn(), yt && typeof yt.onPostCommitFiberRoot == "function") try {
            yt.onPostCommitFiberRoot(Pr, e);
          } catch {
          }
          l = !0;
        }
        return l;
      } finally {
        Te = o, bt.transition = n;
      }
    }
    return !1;
  }
  function Yd(e, n, o) {
    n = Kr(o, n), n = cd(e, n, 1), e = Rn(e, n, 1), n = st(), e !== null && (er(e, 1, n), ht(e, n));
  }
  function je(e, n, o) {
    if (e.tag === 3) Yd(e, e, o);
    else for (; n !== null; ) {
      if (n.tag === 3) {
        Yd(n, e, o);
        break;
      } else if (n.tag === 1) {
        var l = n.stateNode;
        if (typeof n.type.getDerivedStateFromError == "function" || typeof l.componentDidCatch == "function" && (Ln === null || !Ln.has(l))) {
          e = Kr(o, e), e = fd(n, e, 1), n = Rn(n, e, 1), e = st(), n !== null && (er(n, 1, e), ht(n, e));
          break;
        }
      }
      n = n.return;
    }
  }
  function Y0(e, n, o) {
    var l = e.pingCache;
    l !== null && l.delete(n), n = st(), e.pingedLanes |= e.suspendedLanes & o, Qe === e && (Je & o) === o && (Xe === 4 || Xe === 3 && (Je & 130023424) === Je && 500 > $e() - cu ? cr(e, 0) : uu |= o), ht(e, n);
  }
  function Xd(e, n) {
    n === 0 && ((e.mode & 1) === 0 ? n = 1 : (n = Tr, Tr <<= 1, (Tr & 130023424) === 0 && (Tr = 4194304)));
    var o = st();
    e = dn(e, n), e !== null && (er(e, n, o), ht(e, o));
  }
  function X0(e) {
    var n = e.memoizedState, o = 0;
    n !== null && (o = n.retryLane), Xd(e, o);
  }
  function Z0(e, n) {
    var o = 0;
    switch (e.tag) {
      case 13:
        var l = e.stateNode, u = e.memoizedState;
        u !== null && (o = u.retryLane);
        break;
      case 19:
        l = e.stateNode;
        break;
      default:
        throw Error(i(314));
    }
    l !== null && l.delete(n), Xd(e, o);
  }
  var Zd;
  Zd = function(e, n, o) {
    if (e !== null) if (e.memoizedProps !== n.pendingProps || ct.current) dt = !0;
    else {
      if ((e.lanes & o) === 0 && (n.flags & 128) === 0) return dt = !1, L0(e, n, o);
      dt = (e.flags & 131072) !== 0;
    }
    else dt = !1, Ae && (n.flags & 1048576) !== 0 && Mf(n, dl, n.index);
    switch (n.lanes = 0, n.tag) {
      case 2:
        var l = n.type;
        Ml(e, n), e = n.pendingProps;
        var u = Vr(n, nt.current);
        Zr(n, o), u = ja(null, n, l, e, u, o);
        var d = Va();
        return n.flags |= 1, typeof u == "object" && u !== null && typeof u.render == "function" && u.$$typeof === void 0 ? (n.tag = 1, n.memoizedState = null, n.updateQueue = null, ft(l) ? (d = !0, ul(n)) : d = !1, n.memoizedState = u.state !== null && u.state !== void 0 ? u.state : null, Da(n), u.updater = Cl, n.stateNode = u, u._reactInternals = n, Za(n, l, e, o), n = qa(null, n, l, !0, d, o)) : (n.tag = 0, Ae && d && Ea(n), lt(null, n, u, o), n = n.child), n;
      case 16:
        l = n.elementType;
        e: {
          switch (Ml(e, n), e = n.pendingProps, u = l._init, l = u(l._payload), n.type = l, u = n.tag = K0(l), e = At(l, e), u) {
            case 0:
              n = Ga(null, n, l, e, o);
              break e;
            case 1:
              n = xd(null, n, l, e, o);
              break e;
            case 11:
              n = gd(null, n, l, e, o);
              break e;
            case 14:
              n = md(null, n, l, At(l.type, e), o);
              break e;
          }
          throw Error(i(
            306,
            l,
            ""
          ));
        }
        return n;
      case 0:
        return l = n.type, u = n.pendingProps, u = n.elementType === l ? u : At(l, u), Ga(e, n, l, u, o);
      case 1:
        return l = n.type, u = n.pendingProps, u = n.elementType === l ? u : At(l, u), xd(e, n, l, u, o);
      case 3:
        e: {
          if (_d(n), e === null) throw Error(i(387));
          l = n.pendingProps, d = n.memoizedState, u = d.element, Af(e, n), vl(n, l, null, o);
          var v = n.memoizedState;
          if (l = v.element, d.isDehydrated) if (d = { element: l, isDehydrated: !1, cache: v.cache, pendingSuspenseBoundaries: v.pendingSuspenseBoundaries, transitions: v.transitions }, n.updateQueue.baseState = d, n.memoizedState = d, n.flags & 256) {
            u = Kr(Error(i(423)), n), n = Sd(e, n, l, o, u);
            break e;
          } else if (l !== u) {
            u = Kr(Error(i(424)), n), n = Sd(e, n, l, o, u);
            break e;
          } else for (_t = zn(n.stateNode.containerInfo.firstChild), xt = n, Ae = !0, Lt = null, o = Df(n, null, l, o), n.child = o; o; ) o.flags = o.flags & -3 | 4096, o = o.sibling;
          else {
            if (Wr(), l === u) {
              n = hn(e, n, o);
              break e;
            }
            lt(e, n, l, o);
          }
          n = n.child;
        }
        return n;
      case 5:
        return Hf(n), e === null && Ma(n), l = n.type, u = n.pendingProps, d = e !== null ? e.memoizedProps : null, v = u.children, va(l, u) ? v = null : d !== null && va(l, d) && (n.flags |= 32), wd(e, n), lt(e, n, v, o), n.child;
      case 6:
        return e === null && Ma(n), null;
      case 13:
        return kd(e, n, o);
      case 4:
        return La(n, n.stateNode.containerInfo), l = n.pendingProps, e === null ? n.child = Yr(n, null, l, o) : lt(e, n, l, o), n.child;
      case 11:
        return l = n.type, u = n.pendingProps, u = n.elementType === l ? u : At(l, u), gd(e, n, l, u, o);
      case 7:
        return lt(e, n, n.pendingProps, o), n.child;
      case 8:
        return lt(e, n, n.pendingProps.children, o), n.child;
      case 12:
        return lt(e, n, n.pendingProps.children, o), n.child;
      case 10:
        e: {
          if (l = n.type._context, u = n.pendingProps, d = n.memoizedProps, v = u.value, be(gl, l._currentValue), l._currentValue = v, d !== null) if (Dt(d.value, v)) {
            if (d.children === u.children && !ct.current) {
              n = hn(e, n, o);
              break e;
            }
          } else for (d = n.child, d !== null && (d.return = n); d !== null; ) {
            var z = d.dependencies;
            if (z !== null) {
              v = d.child;
              for (var b = z.firstContext; b !== null; ) {
                if (b.context === l) {
                  if (d.tag === 1) {
                    b = pn(-1, o & -o), b.tag = 2;
                    var Z = d.updateQueue;
                    if (Z !== null) {
                      Z = Z.shared;
                      var ne = Z.pending;
                      ne === null ? b.next = b : (b.next = ne.next, ne.next = b), Z.pending = b;
                    }
                  }
                  d.lanes |= o, b = d.alternate, b !== null && (b.lanes |= o), ba(
                    d.return,
                    o,
                    n
                  ), z.lanes |= o;
                  break;
                }
                b = b.next;
              }
            } else if (d.tag === 10) v = d.type === n.type ? null : d.child;
            else if (d.tag === 18) {
              if (v = d.return, v === null) throw Error(i(341));
              v.lanes |= o, z = v.alternate, z !== null && (z.lanes |= o), ba(v, o, n), v = d.sibling;
            } else v = d.child;
            if (v !== null) v.return = d;
            else for (v = d; v !== null; ) {
              if (v === n) {
                v = null;
                break;
              }
              if (d = v.sibling, d !== null) {
                d.return = v.return, v = d;
                break;
              }
              v = v.return;
            }
            d = v;
          }
          lt(e, n, u.children, o), n = n.child;
        }
        return n;
      case 9:
        return u = n.type, l = n.pendingProps.children, Zr(n, o), u = It(u), l = l(u), n.flags |= 1, lt(e, n, l, o), n.child;
      case 14:
        return l = n.type, u = At(l, n.pendingProps), u = At(l.type, u), md(e, n, l, u, o);
      case 15:
        return yd(e, n, n.type, n.pendingProps, o);
      case 17:
        return l = n.type, u = n.pendingProps, u = n.elementType === l ? u : At(l, u), Ml(e, n), n.tag = 1, ft(l) ? (e = !0, ul(n)) : e = !1, Zr(n, o), ad(n, l, u), Za(n, l, u, o), qa(null, n, l, !0, e, o);
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
  function Q0(e, n, o, l) {
    this.tag = e, this.key = o, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = n, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = l, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Rt(e, n, o, l) {
    return new Q0(e, n, o, l);
  }
  function vu(e) {
    return e = e.prototype, !(!e || !e.isReactComponent);
  }
  function K0(e) {
    if (typeof e == "function") return vu(e) ? 1 : 0;
    if (e != null) {
      if (e = e.$$typeof, e === ee) return 11;
      if (e === H) return 14;
    }
    return 2;
  }
  function Hn(e, n) {
    var o = e.alternate;
    return o === null ? (o = Rt(e.tag, n, e.key, e.mode), o.elementType = e.elementType, o.type = e.type, o.stateNode = e.stateNode, o.alternate = e, e.alternate = o) : (o.pendingProps = n, o.type = e.type, o.flags = 0, o.subtreeFlags = 0, o.deletions = null), o.flags = e.flags & 14680064, o.childLanes = e.childLanes, o.lanes = e.lanes, o.child = e.child, o.memoizedProps = e.memoizedProps, o.memoizedState = e.memoizedState, o.updateQueue = e.updateQueue, n = e.dependencies, o.dependencies = n === null ? null : { lanes: n.lanes, firstContext: n.firstContext }, o.sibling = e.sibling, o.index = e.index, o.ref = e.ref, o;
  }
  function Ol(e, n, o, l, u, d) {
    var v = 2;
    if (l = e, typeof e == "function") vu(e) && (v = 1);
    else if (typeof e == "string") v = 5;
    else e: switch (e) {
      case D:
        return dr(o.children, u, d, n);
      case Y:
        v = 8, u |= 8;
        break;
      case X:
        return e = Rt(12, o, n, u | 2), e.elementType = X, e.lanes = d, e;
      case G:
        return e = Rt(13, o, n, u), e.elementType = G, e.lanes = d, e;
      case N:
        return e = Rt(19, o, n, u), e.elementType = N, e.lanes = d, e;
      case j:
        return Hl(o, u, d, n);
      default:
        if (typeof e == "object" && e !== null) switch (e.$$typeof) {
          case J:
            v = 10;
            break e;
          case q:
            v = 9;
            break e;
          case ee:
            v = 11;
            break e;
          case H:
            v = 14;
            break e;
          case F:
            v = 16, l = null;
            break e;
        }
        throw Error(i(130, e == null ? e : typeof e, ""));
    }
    return n = Rt(v, o, n, u), n.elementType = e, n.type = l, n.lanes = d, n;
  }
  function dr(e, n, o, l) {
    return e = Rt(7, e, l, n), e.lanes = o, e;
  }
  function Hl(e, n, o, l) {
    return e = Rt(22, e, l, n), e.elementType = j, e.lanes = o, e.stateNode = { isHidden: !1 }, e;
  }
  function wu(e, n, o) {
    return e = Rt(6, e, null, n), e.lanes = o, e;
  }
  function xu(e, n, o) {
    return n = Rt(4, e.children !== null ? e.children : [], e.key, n), n.lanes = o, n.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, n;
  }
  function G0(e, n, o, l, u) {
    this.tag = n, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Jn(0), this.expirationTimes = Jn(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Jn(0), this.identifierPrefix = l, this.onRecoverableError = u, this.mutableSourceEagerHydrationData = null;
  }
  function _u(e, n, o, l, u, d, v, z, b) {
    return e = new G0(e, n, o, z, b), n === 1 ? (n = 1, d === !0 && (n |= 8)) : n = 0, d = Rt(3, null, null, n), e.current = d, d.stateNode = e, d.memoizedState = { element: l, isDehydrated: o, cache: null, transitions: null, pendingSuspenseBoundaries: null }, Da(d), e;
  }
  function q0(e, n, o) {
    var l = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: I, key: l == null ? null : "" + l, children: e, containerInfo: n, implementation: o };
  }
  function Kd(e) {
    if (!e) return In;
    e = e._reactInternals;
    e: {
      if (Kt(e) !== e || e.tag !== 1) throw Error(i(170));
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
  function Gd(e, n, o, l, u, d, v, z, b) {
    return e = _u(o, l, !0, e, u, d, v, z, b), e.context = Kd(null), o = e.current, l = st(), u = $n(o), d = pn(l, u), d.callback = n ?? null, Rn(o, d, u), e.current.lanes = u, er(e, u, l), ht(e, l), e;
  }
  function Fl(e, n, o, l) {
    var u = n.current, d = st(), v = $n(u);
    return o = Kd(o), n.context === null ? n.context = o : n.pendingContext = o, n = pn(d, v), n.payload = { element: e }, l = l === void 0 ? null : l, l !== null && (n.callback = l), e = Rn(u, n, v), e !== null && (Ht(e, u, v, d), yl(e, u, v)), v;
  }
  function jl(e) {
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
  function Su(e, n) {
    qd(e, n), (e = e.alternate) && qd(e, n);
  }
  function J0() {
    return null;
  }
  var Jd = typeof reportError == "function" ? reportError : function(e) {
    console.error(e);
  };
  function ku(e) {
    this._internalRoot = e;
  }
  Vl.prototype.render = ku.prototype.render = function(e) {
    var n = this._internalRoot;
    if (n === null) throw Error(i(409));
    Fl(e, n, null, null);
  }, Vl.prototype.unmount = ku.prototype.unmount = function() {
    var e = this._internalRoot;
    if (e !== null) {
      this._internalRoot = null;
      var n = e.containerInfo;
      ur(function() {
        Fl(null, e, null, null);
      }), n[an] = null;
    }
  };
  function Vl(e) {
    this._internalRoot = e;
  }
  Vl.prototype.unstable_scheduleHydration = function(e) {
    if (e) {
      var n = Lc();
      e = { blockedOn: null, target: e, priority: n };
      for (var o = 0; o < Cn.length && n !== 0 && n < Cn[o].priority; o++) ;
      Cn.splice(o, 0, e), o === 0 && Oc(e);
    }
  };
  function Eu(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
  }
  function Bl(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
  }
  function ep() {
  }
  function ey(e, n, o, l, u) {
    if (u) {
      if (typeof l == "function") {
        var d = l;
        l = function() {
          var Z = jl(v);
          d.call(Z);
        };
      }
      var v = Gd(n, l, e, 0, null, !1, !1, "", ep);
      return e._reactRootContainer = v, e[an] = v.current, Vo(e.nodeType === 8 ? e.parentNode : e), ur(), v;
    }
    for (; u = e.lastChild; ) e.removeChild(u);
    if (typeof l == "function") {
      var z = l;
      l = function() {
        var Z = jl(b);
        z.call(Z);
      };
    }
    var b = _u(e, 0, !1, null, null, !1, !1, "", ep);
    return e._reactRootContainer = b, e[an] = b.current, Vo(e.nodeType === 8 ? e.parentNode : e), ur(function() {
      Fl(n, b, o, l);
    }), b;
  }
  function Ul(e, n, o, l, u) {
    var d = o._reactRootContainer;
    if (d) {
      var v = d;
      if (typeof u == "function") {
        var z = u;
        u = function() {
          var b = jl(v);
          z.call(b);
        };
      }
      Fl(n, v, e, u);
    } else v = ey(o, n, e, u, l);
    return jl(v);
  }
  Rc = function(e) {
    switch (e.tag) {
      case 3:
        var n = e.stateNode;
        if (n.current.memoizedState.isDehydrated) {
          var o = Gn(n.pendingLanes);
          o !== 0 && (br(n, o | 1), ht(n, $e()), (Pe & 6) === 0 && (Jr = $e() + 500, Tn()));
        }
        break;
      case 13:
        ur(function() {
          var l = dn(e, 1);
          if (l !== null) {
            var u = st();
            Ht(l, e, 1, u);
          }
        }), Su(e, 1);
    }
  }, Qs = function(e) {
    if (e.tag === 13) {
      var n = dn(e, 134217728);
      if (n !== null) {
        var o = st();
        Ht(n, e, 134217728, o);
      }
      Su(e, 134217728);
    }
  }, Dc = function(e) {
    if (e.tag === 13) {
      var n = $n(e), o = dn(e, n);
      if (o !== null) {
        var l = st();
        Ht(o, e, n, l);
      }
      Su(e, n);
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
            var l = o[n];
            if (l !== e && l.form === e.form) {
              var u = sl(l);
              if (!u) throw Error(i(90));
              me(l), Ve(l, u);
            }
          }
        }
        break;
      case "textarea":
        Qt(e, o);
        break;
      case "select":
        n = o.value, n != null && tt(e, !!o.multiple, n, !1);
    }
  }, Di = gu, Li = ur;
  var ty = { usingClientEntryPoint: !1, Events: [Wo, Fr, sl, bi, Ri, gu] }, ii = { findFiberByHostInstance: tr, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, ny = { bundleType: ii.bundleType, version: ii.version, rendererPackageName: ii.rendererPackageName, rendererConfig: ii.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: P.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
    return e = $i(e), e === null ? null : e.stateNode;
  }, findFiberByHostInstance: ii.findFiberByHostInstance || J0, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Wl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Wl.isDisabled && Wl.supportsFiber) try {
      Pr = Wl.inject(ny), yt = Wl;
    } catch {
    }
  }
  return gt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ty, gt.createPortal = function(e, n) {
    var o = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!Eu(n)) throw Error(i(200));
    return q0(e, n, null, o);
  }, gt.createRoot = function(e, n) {
    if (!Eu(e)) throw Error(i(299));
    var o = !1, l = "", u = Jd;
    return n != null && (n.unstable_strictMode === !0 && (o = !0), n.identifierPrefix !== void 0 && (l = n.identifierPrefix), n.onRecoverableError !== void 0 && (u = n.onRecoverableError)), n = _u(e, 1, !1, null, null, o, !1, l, u), e[an] = n.current, Vo(e.nodeType === 8 ? e.parentNode : e), new ku(n);
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
    if (!Bl(n)) throw Error(i(200));
    return Ul(null, e, n, !0, o);
  }, gt.hydrateRoot = function(e, n, o) {
    if (!Eu(e)) throw Error(i(405));
    var l = o != null && o.hydratedSources || null, u = !1, d = "", v = Jd;
    if (o != null && (o.unstable_strictMode === !0 && (u = !0), o.identifierPrefix !== void 0 && (d = o.identifierPrefix), o.onRecoverableError !== void 0 && (v = o.onRecoverableError)), n = Gd(n, null, e, 1, o ?? null, u, !1, d, v), e[an] = n.current, Vo(e), l) for (e = 0; e < l.length; e++) o = l[e], u = o._getVersion, u = u(o._source), n.mutableSourceEagerHydrationData == null ? n.mutableSourceEagerHydrationData = [o, u] : n.mutableSourceEagerHydrationData.push(
      o,
      u
    );
    return new Vl(n);
  }, gt.render = function(e, n, o) {
    if (!Bl(n)) throw Error(i(200));
    return Ul(null, e, n, !1, o);
  }, gt.unmountComponentAtNode = function(e) {
    if (!Bl(e)) throw Error(i(40));
    return e._reactRootContainer ? (ur(function() {
      Ul(null, null, e, !1, function() {
        e._reactRootContainer = null, e[an] = null;
      });
    }), !0) : !1;
  }, gt.unstable_batchedUpdates = gu, gt.unstable_renderSubtreeIntoContainer = function(e, n, o, l) {
    if (!Bl(o)) throw Error(i(200));
    if (e == null || e._reactInternals === void 0) throw Error(i(38));
    return Ul(e, n, o, !1, l);
  }, gt.version = "18.3.1-next-f1338f8080-20240426", gt;
}
var ap;
function Nh() {
  if (ap) return Mu.exports;
  ap = 1;
  function t() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(t);
      } catch (r) {
        console.error(r);
      }
  }
  return t(), Mu.exports = uy(), Mu.exports;
}
var up;
function cy() {
  if (up) return Yl;
  up = 1;
  var t = Nh();
  return Yl.createRoot = t.createRoot, Yl.hydrateRoot = t.hydrateRoot, Yl;
}
var fy = cy();
const dy = ".react-flow{direction:ltr;--xy-edge-stroke-default: #b1b1b7;--xy-edge-stroke-width-default: 1;--xy-edge-stroke-selected-default: #555;--xy-connectionline-stroke-default: #b1b1b7;--xy-connectionline-stroke-width-default: 1;--xy-attribution-background-color-default: rgba(255, 255, 255, .5);--xy-minimap-background-color-default: #fff;--xy-minimap-mask-background-color-default: rgba(240, 240, 240, .6);--xy-minimap-mask-stroke-color-default: transparent;--xy-minimap-mask-stroke-width-default: 1;--xy-minimap-node-background-color-default: #e2e2e2;--xy-minimap-node-stroke-color-default: transparent;--xy-minimap-node-stroke-width-default: 2;--xy-background-color-default: transparent;--xy-background-pattern-dots-color-default: #91919a;--xy-background-pattern-lines-color-default: #eee;--xy-background-pattern-cross-color-default: #e2e2e2;background-color:var(--xy-background-color, var(--xy-background-color-default));--xy-node-color-default: inherit;--xy-node-border-default: 1px solid #1a192b;--xy-node-background-color-default: #fff;--xy-node-group-background-color-default: rgba(240, 240, 240, .25);--xy-node-boxshadow-hover-default: 0 1px 4px 1px rgba(0, 0, 0, .08);--xy-node-boxshadow-selected-default: 0 0 0 .5px #1a192b;--xy-node-border-radius-default: 3px;--xy-handle-background-color-default: #1a192b;--xy-handle-border-color-default: #fff;--xy-selection-background-color-default: rgba(0, 89, 220, .08);--xy-selection-border-default: 1px dotted rgba(0, 89, 220, .8);--xy-controls-button-background-color-default: #fefefe;--xy-controls-button-background-color-hover-default: #f4f4f4;--xy-controls-button-color-default: inherit;--xy-controls-button-color-hover-default: inherit;--xy-controls-button-border-color-default: #eee;--xy-controls-box-shadow-default: 0 0 2px 1px rgba(0, 0, 0, .08);--xy-edge-label-background-color-default: #ffffff;--xy-edge-label-color-default: inherit;--xy-resize-background-color-default: #3367d9}.react-flow.dark{--xy-edge-stroke-default: #3e3e3e;--xy-edge-stroke-width-default: 1;--xy-edge-stroke-selected-default: #727272;--xy-connectionline-stroke-default: #b1b1b7;--xy-connectionline-stroke-width-default: 1;--xy-attribution-background-color-default: rgba(150, 150, 150, .25);--xy-minimap-background-color-default: #141414;--xy-minimap-mask-background-color-default: rgba(60, 60, 60, .6);--xy-minimap-mask-stroke-color-default: transparent;--xy-minimap-mask-stroke-width-default: 1;--xy-minimap-node-background-color-default: #2b2b2b;--xy-minimap-node-stroke-color-default: transparent;--xy-minimap-node-stroke-width-default: 2;--xy-background-color-default: #141414;--xy-background-pattern-dots-color-default: #555;--xy-background-pattern-lines-color-default: #333;--xy-background-pattern-cross-color-default: #333;--xy-node-color-default: #f8f8f8;--xy-node-border-default: 1px solid #3c3c3c;--xy-node-background-color-default: #1e1e1e;--xy-node-group-background-color-default: rgba(240, 240, 240, .25);--xy-node-boxshadow-hover-default: 0 1px 4px 1px rgba(255, 255, 255, .08);--xy-node-boxshadow-selected-default: 0 0 0 .5px #999;--xy-handle-background-color-default: #bebebe;--xy-handle-border-color-default: #1e1e1e;--xy-selection-background-color-default: rgba(200, 200, 220, .08);--xy-selection-border-default: 1px dotted rgba(200, 200, 220, .8);--xy-controls-button-background-color-default: #2b2b2b;--xy-controls-button-background-color-hover-default: #3e3e3e;--xy-controls-button-color-default: #f8f8f8;--xy-controls-button-color-hover-default: #fff;--xy-controls-button-border-color-default: #5b5b5b;--xy-controls-box-shadow-default: 0 0 2px 1px rgba(0, 0, 0, .08);--xy-edge-label-background-color-default: #141414;--xy-edge-label-color-default: #f8f8f8}.react-flow__background{background-color:var(--xy-background-color-props, var(--xy-background-color, var(--xy-background-color-default)));pointer-events:none;z-index:-1}.react-flow__container{position:absolute;width:100%;height:100%;top:0;left:0}.react-flow__pane{z-index:1;touch-action:none}.react-flow__pane.draggable{cursor:grab}.react-flow__pane.dragging{cursor:grabbing}.react-flow__pane.selection{cursor:pointer}.react-flow__viewport{transform-origin:0 0;z-index:2;pointer-events:none}.react-flow__renderer{z-index:4}.react-flow__selection{z-index:6}.react-flow__nodesselection-rect:focus,.react-flow__nodesselection-rect:focus-visible{outline:none}.react-flow__edge-path{stroke:var(--xy-edge-stroke, var(--xy-edge-stroke-default));stroke-width:var(--xy-edge-stroke-width, var(--xy-edge-stroke-width-default));fill:none}.react-flow__connection-path{stroke:var(--xy-connectionline-stroke, var(--xy-connectionline-stroke-default));stroke-width:var(--xy-connectionline-stroke-width, var(--xy-connectionline-stroke-width-default));fill:none}.react-flow .react-flow__edges{position:absolute}.react-flow .react-flow__edges svg{overflow:visible;position:absolute;pointer-events:none}.react-flow__edge{pointer-events:visibleStroke}.react-flow__edge.selectable{cursor:pointer}.react-flow__edge.animated path{stroke-dasharray:5;animation:dashdraw .5s linear infinite}.react-flow__edge.animated path.react-flow__edge-interaction{stroke-dasharray:none;animation:none}.react-flow__edge.inactive{pointer-events:none}.react-flow__edge.selected,.react-flow__edge:focus,.react-flow__edge:focus-visible{outline:none}.react-flow__edge.selected .react-flow__edge-path,.react-flow__edge.selectable:focus .react-flow__edge-path,.react-flow__edge.selectable:focus-visible .react-flow__edge-path{stroke:var(--xy-edge-stroke-selected, var(--xy-edge-stroke-selected-default))}.react-flow__edge-textwrapper{pointer-events:all}.react-flow__edge .react-flow__edge-text{pointer-events:none;-webkit-user-select:none;-moz-user-select:none;user-select:none}.react-flow__arrowhead polyline{stroke:var(--xy-edge-stroke, var(--xy-edge-stroke-default))}.react-flow__arrowhead polyline.arrowclosed{fill:var(--xy-edge-stroke, var(--xy-edge-stroke-default))}.react-flow__connection{pointer-events:none}.react-flow__connection .animated{stroke-dasharray:5;animation:dashdraw .5s linear infinite}svg.react-flow__connectionline{z-index:1001;overflow:visible;position:absolute}.react-flow__nodes{pointer-events:none;transform-origin:0 0}.react-flow__node{position:absolute;-webkit-user-select:none;-moz-user-select:none;user-select:none;pointer-events:all;transform-origin:0 0;box-sizing:border-box;cursor:default}.react-flow__node.selectable{cursor:pointer}.react-flow__node.draggable{cursor:grab;pointer-events:all}.react-flow__node.draggable.dragging{cursor:grabbing}.react-flow__nodesselection{z-index:3;transform-origin:left top;pointer-events:none}.react-flow__nodesselection-rect{position:absolute;pointer-events:all;cursor:grab}.react-flow__handle{position:absolute;pointer-events:none;min-width:5px;min-height:5px;width:6px;height:6px;background-color:var(--xy-handle-background-color, var(--xy-handle-background-color-default));border:1px solid var(--xy-handle-border-color, var(--xy-handle-border-color-default));border-radius:100%}.react-flow__handle.connectingfrom{pointer-events:all}.react-flow__handle.connectionindicator{pointer-events:all;cursor:crosshair}.react-flow__handle-bottom{top:auto;left:50%;bottom:0;transform:translate(-50%,50%)}.react-flow__handle-top{top:0;left:50%;transform:translate(-50%,-50%)}.react-flow__handle-left{top:50%;left:0;transform:translate(-50%,-50%)}.react-flow__handle-right{top:50%;right:0;transform:translate(50%,-50%)}.react-flow__edgeupdater{cursor:move;pointer-events:all}.react-flow__pane.selection .react-flow__panel{pointer-events:none}.react-flow__panel{position:absolute;z-index:5;margin:15px}.react-flow__panel.top{top:0}.react-flow__panel.bottom{bottom:0}.react-flow__panel.top.center,.react-flow__panel.bottom.center{left:50%;transform:translate(-15px) translate(-50%)}.react-flow__panel.left{left:0}.react-flow__panel.right{right:0}.react-flow__panel.left.center,.react-flow__panel.right.center{top:50%;transform:translateY(-15px) translateY(-50%)}.react-flow__attribution{font-size:10px;background:var(--xy-attribution-background-color, var(--xy-attribution-background-color-default));padding:2px 3px;margin:0}.react-flow__attribution a{text-decoration:none;color:#999}@keyframes dashdraw{0%{stroke-dashoffset:10}}.react-flow__edgelabel-renderer{position:absolute;width:100%;height:100%;pointer-events:none;-webkit-user-select:none;-moz-user-select:none;user-select:none;left:0;top:0}.react-flow__viewport-portal{position:absolute;width:100%;height:100%;left:0;top:0;-webkit-user-select:none;-moz-user-select:none;user-select:none}.react-flow__minimap{background:var( --xy-minimap-background-color-props, var(--xy-minimap-background-color, var(--xy-minimap-background-color-default)) )}.react-flow__minimap-svg{display:block}.react-flow__minimap-mask{fill:var( --xy-minimap-mask-background-color-props, var(--xy-minimap-mask-background-color, var(--xy-minimap-mask-background-color-default)) );stroke:var( --xy-minimap-mask-stroke-color-props, var(--xy-minimap-mask-stroke-color, var(--xy-minimap-mask-stroke-color-default)) );stroke-width:var( --xy-minimap-mask-stroke-width-props, var(--xy-minimap-mask-stroke-width, var(--xy-minimap-mask-stroke-width-default)) )}.react-flow__minimap-node{fill:var( --xy-minimap-node-background-color-props, var(--xy-minimap-node-background-color, var(--xy-minimap-node-background-color-default)) );stroke:var( --xy-minimap-node-stroke-color-props, var(--xy-minimap-node-stroke-color, var(--xy-minimap-node-stroke-color-default)) );stroke-width:var( --xy-minimap-node-stroke-width-props, var(--xy-minimap-node-stroke-width, var(--xy-minimap-node-stroke-width-default)) )}.react-flow__background-pattern.dots{fill:var( --xy-background-pattern-color-props, var(--xy-background-pattern-color, var(--xy-background-pattern-dots-color-default)) )}.react-flow__background-pattern.lines{stroke:var( --xy-background-pattern-color-props, var(--xy-background-pattern-color, var(--xy-background-pattern-lines-color-default)) )}.react-flow__background-pattern.cross{stroke:var( --xy-background-pattern-color-props, var(--xy-background-pattern-color, var(--xy-background-pattern-cross-color-default)) )}.react-flow__controls{display:flex;flex-direction:column;box-shadow:var(--xy-controls-box-shadow, var(--xy-controls-box-shadow-default))}.react-flow__controls.horizontal{flex-direction:row}.react-flow__controls-button{display:flex;justify-content:center;align-items:center;height:26px;width:26px;padding:4px;border:none;background:var(--xy-controls-button-background-color, var(--xy-controls-button-background-color-default));border-bottom:1px solid var( --xy-controls-button-border-color-props, var(--xy-controls-button-border-color, var(--xy-controls-button-border-color-default)) );color:var( --xy-controls-button-color-props, var(--xy-controls-button-color, var(--xy-controls-button-color-default)) );cursor:pointer;-webkit-user-select:none;-moz-user-select:none;user-select:none}.react-flow__controls-button svg{width:100%;max-width:12px;max-height:12px;fill:currentColor}.react-flow__edge.updating .react-flow__edge-path{stroke:#777}.react-flow__edge-text{font-size:10px}.react-flow__node.selectable:focus,.react-flow__node.selectable:focus-visible{outline:none}.react-flow__node-input,.react-flow__node-default,.react-flow__node-output,.react-flow__node-group{padding:10px;border-radius:var(--xy-node-border-radius, var(--xy-node-border-radius-default));width:150px;font-size:12px;color:var(--xy-node-color, var(--xy-node-color-default));text-align:center;border:var(--xy-node-border, var(--xy-node-border-default));background-color:var(--xy-node-background-color, var(--xy-node-background-color-default))}.react-flow__node-input.selectable:hover,.react-flow__node-default.selectable:hover,.react-flow__node-output.selectable:hover,.react-flow__node-group.selectable:hover{box-shadow:var(--xy-node-boxshadow-hover, var(--xy-node-boxshadow-hover-default))}.react-flow__node-input.selectable.selected,.react-flow__node-input.selectable:focus,.react-flow__node-input.selectable:focus-visible,.react-flow__node-default.selectable.selected,.react-flow__node-default.selectable:focus,.react-flow__node-default.selectable:focus-visible,.react-flow__node-output.selectable.selected,.react-flow__node-output.selectable:focus,.react-flow__node-output.selectable:focus-visible,.react-flow__node-group.selectable.selected,.react-flow__node-group.selectable:focus,.react-flow__node-group.selectable:focus-visible{box-shadow:var(--xy-node-boxshadow-selected, var(--xy-node-boxshadow-selected-default))}.react-flow__node-group{background-color:var(--xy-node-group-background-color, var(--xy-node-group-background-color-default))}.react-flow__nodesselection-rect,.react-flow__selection{background:var(--xy-selection-background-color, var(--xy-selection-background-color-default));border:var(--xy-selection-border, var(--xy-selection-border-default))}.react-flow__nodesselection-rect:focus,.react-flow__nodesselection-rect:focus-visible,.react-flow__selection:focus,.react-flow__selection:focus-visible{outline:none}.react-flow__controls-button:hover{background:var( --xy-controls-button-background-color-hover-props, var(--xy-controls-button-background-color-hover, var(--xy-controls-button-background-color-hover-default)) );color:var( --xy-controls-button-color-hover-props, var(--xy-controls-button-color-hover, var(--xy-controls-button-color-hover-default)) )}.react-flow__controls-button:disabled{pointer-events:none}.react-flow__controls-button:disabled svg{fill-opacity:.4}.react-flow__controls-button:last-child{border-bottom:none}.react-flow__controls.horizontal .react-flow__controls-button{border-bottom:none;border-right:1px solid var( --xy-controls-button-border-color-props, var(--xy-controls-button-border-color, var(--xy-controls-button-border-color-default)) )}.react-flow__controls.horizontal .react-flow__controls-button:last-child{border-right:none}.react-flow__resize-control{position:absolute}.react-flow__resize-control.left,.react-flow__resize-control.right{cursor:ew-resize}.react-flow__resize-control.top,.react-flow__resize-control.bottom{cursor:ns-resize}.react-flow__resize-control.top.left,.react-flow__resize-control.bottom.right{cursor:nwse-resize}.react-flow__resize-control.bottom.left,.react-flow__resize-control.top.right{cursor:nesw-resize}.react-flow__resize-control.handle{width:5px;height:5px;border:1px solid #fff;border-radius:1px;background-color:var(--xy-resize-background-color, var(--xy-resize-background-color-default));translate:-50% -50%}.react-flow__resize-control.handle.left{left:0;top:50%}.react-flow__resize-control.handle.right{left:100%;top:50%}.react-flow__resize-control.handle.top{left:50%;top:0}.react-flow__resize-control.handle.bottom{left:50%;top:100%}.react-flow__resize-control.handle.top.left,.react-flow__resize-control.handle.bottom.left{left:0}.react-flow__resize-control.handle.top.right,.react-flow__resize-control.handle.bottom.right{left:100%}.react-flow__resize-control.line{border-color:var(--xy-resize-background-color, var(--xy-resize-background-color-default));border-width:0;border-style:solid}.react-flow__resize-control.line.left,.react-flow__resize-control.line.right{width:1px;transform:translate(-50%);top:0;height:100%}.react-flow__resize-control.line.left{left:0;border-left-width:1px}.react-flow__resize-control.line.right{left:100%;border-right-width:1px}.react-flow__resize-control.line.top,.react-flow__resize-control.line.bottom{height:1px;transform:translateY(-50%);left:0;width:100%}.react-flow__resize-control.line.top{top:0;border-top-width:1px}.react-flow__resize-control.line.bottom{border-bottom-width:1px;top:100%}.react-flow__edge-textbg{fill:var(--xy-edge-label-background-color, var(--xy-edge-label-background-color-default))}.react-flow__edge-text{fill:var(--xy-edge-label-color, var(--xy-edge-label-color-default))}";
var K = Si();
const py = /* @__PURE__ */ Ch(K);
function We(t) {
  if (typeof t == "string" || typeof t == "number") return "" + t;
  let r = "";
  if (Array.isArray(t))
    for (let i = 0, s; i < t.length; i++)
      (s = We(t[i])) !== "" && (r += (r && " ") + s);
  else
    for (let i in t)
      t[i] && (r += (r && " ") + i);
  return r;
}
var hy = { value: () => {
} };
function ws() {
  for (var t = 0, r = arguments.length, i = {}, s; t < r; ++t) {
    if (!(s = arguments[t] + "") || s in i || /[\s.]/.test(s)) throw new Error("illegal type: " + s);
    i[s] = [];
  }
  return new ns(i);
}
function ns(t) {
  this._ = t;
}
function gy(t, r) {
  return t.trim().split(/^|\s+/).map(function(i) {
    var s = "", a = i.indexOf(".");
    if (a >= 0 && (s = i.slice(a + 1), i = i.slice(0, a)), i && !r.hasOwnProperty(i)) throw new Error("unknown type: " + i);
    return { type: i, name: s };
  });
}
ns.prototype = ws.prototype = {
  constructor: ns,
  on: function(t, r) {
    var i = this._, s = gy(t + "", i), a, c = -1, f = s.length;
    if (arguments.length < 2) {
      for (; ++c < f; ) if ((a = (t = s[c]).type) && (a = my(i[a], t.name))) return a;
      return;
    }
    if (r != null && typeof r != "function") throw new Error("invalid callback: " + r);
    for (; ++c < f; )
      if (a = (t = s[c]).type) i[a] = cp(i[a], t.name, r);
      else if (r == null) for (a in i) i[a] = cp(i[a], t.name, null);
    return this;
  },
  copy: function() {
    var t = {}, r = this._;
    for (var i in r) t[i] = r[i].slice();
    return new ns(t);
  },
  call: function(t, r) {
    if ((a = arguments.length - 2) > 0) for (var i = new Array(a), s = 0, a, c; s < a; ++s) i[s] = arguments[s + 2];
    if (!this._.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    for (c = this._[t], s = 0, a = c.length; s < a; ++s) c[s].value.apply(r, i);
  },
  apply: function(t, r, i) {
    if (!this._.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    for (var s = this._[t], a = 0, c = s.length; a < c; ++a) s[a].value.apply(r, i);
  }
};
function my(t, r) {
  for (var i = 0, s = t.length, a; i < s; ++i)
    if ((a = t[i]).name === r)
      return a.value;
}
function cp(t, r, i) {
  for (var s = 0, a = t.length; s < a; ++s)
    if (t[s].name === r) {
      t[s] = hy, t = t.slice(0, s).concat(t.slice(s + 1));
      break;
    }
  return i != null && t.push({ name: r, value: i }), t;
}
var Xu = "http://www.w3.org/1999/xhtml", fp = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: Xu,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function xs(t) {
  var r = t += "", i = r.indexOf(":");
  return i >= 0 && (r = t.slice(0, i)) !== "xmlns" && (t = t.slice(i + 1)), fp.hasOwnProperty(r) ? { space: fp[r], local: t } : t;
}
function yy(t) {
  return function() {
    var r = this.ownerDocument, i = this.namespaceURI;
    return i === Xu && r.documentElement.namespaceURI === Xu ? r.createElement(t) : r.createElementNS(i, t);
  };
}
function vy(t) {
  return function() {
    return this.ownerDocument.createElementNS(t.space, t.local);
  };
}
function Mh(t) {
  var r = xs(t);
  return (r.local ? vy : yy)(r);
}
function wy() {
}
function ac(t) {
  return t == null ? wy : function() {
    return this.querySelector(t);
  };
}
function xy(t) {
  typeof t != "function" && (t = ac(t));
  for (var r = this._groups, i = r.length, s = new Array(i), a = 0; a < i; ++a)
    for (var c = r[a], f = c.length, p = s[a] = new Array(f), h, g, m = 0; m < f; ++m)
      (h = c[m]) && (g = t.call(h, h.__data__, m, c)) && ("__data__" in h && (g.__data__ = h.__data__), p[m] = g);
  return new Et(s, this._parents);
}
function _y(t) {
  return t == null ? [] : Array.isArray(t) ? t : Array.from(t);
}
function Sy() {
  return [];
}
function zh(t) {
  return t == null ? Sy : function() {
    return this.querySelectorAll(t);
  };
}
function ky(t) {
  return function() {
    return _y(t.apply(this, arguments));
  };
}
function Ey(t) {
  typeof t == "function" ? t = ky(t) : t = zh(t);
  for (var r = this._groups, i = r.length, s = [], a = [], c = 0; c < i; ++c)
    for (var f = r[c], p = f.length, h, g = 0; g < p; ++g)
      (h = f[g]) && (s.push(t.call(h, h.__data__, g, f)), a.push(h));
  return new Et(s, a);
}
function Ph(t) {
  return function() {
    return this.matches(t);
  };
}
function Ih(t) {
  return function(r) {
    return r.matches(t);
  };
}
var Cy = Array.prototype.find;
function Ny(t) {
  return function() {
    return Cy.call(this.children, t);
  };
}
function My() {
  return this.firstElementChild;
}
function zy(t) {
  return this.select(t == null ? My : Ny(typeof t == "function" ? t : Ih(t)));
}
var Py = Array.prototype.filter;
function Iy() {
  return Array.from(this.children);
}
function Ty(t) {
  return function() {
    return Py.call(this.children, t);
  };
}
function by(t) {
  return this.selectAll(t == null ? Iy : Ty(typeof t == "function" ? t : Ih(t)));
}
function Ry(t) {
  typeof t != "function" && (t = Ph(t));
  for (var r = this._groups, i = r.length, s = new Array(i), a = 0; a < i; ++a)
    for (var c = r[a], f = c.length, p = s[a] = [], h, g = 0; g < f; ++g)
      (h = c[g]) && t.call(h, h.__data__, g, c) && p.push(h);
  return new Et(s, this._parents);
}
function Th(t) {
  return new Array(t.length);
}
function Dy() {
  return new Et(this._enter || this._groups.map(Th), this._parents);
}
function ss(t, r) {
  this.ownerDocument = t.ownerDocument, this.namespaceURI = t.namespaceURI, this._next = null, this._parent = t, this.__data__ = r;
}
ss.prototype = {
  constructor: ss,
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
function Ly(t) {
  return function() {
    return t;
  };
}
function Ay(t, r, i, s, a, c) {
  for (var f = 0, p, h = r.length, g = c.length; f < g; ++f)
    (p = r[f]) ? (p.__data__ = c[f], s[f] = p) : i[f] = new ss(t, c[f]);
  for (; f < h; ++f)
    (p = r[f]) && (a[f] = p);
}
function $y(t, r, i, s, a, c, f) {
  var p, h, g = /* @__PURE__ */ new Map(), m = r.length, w = c.length, y = new Array(m), x;
  for (p = 0; p < m; ++p)
    (h = r[p]) && (y[p] = x = f.call(h, h.__data__, p, r) + "", g.has(x) ? a[p] = h : g.set(x, h));
  for (p = 0; p < w; ++p)
    x = f.call(t, c[p], p, c) + "", (h = g.get(x)) ? (s[p] = h, h.__data__ = c[p], g.delete(x)) : i[p] = new ss(t, c[p]);
  for (p = 0; p < m; ++p)
    (h = r[p]) && g.get(y[p]) === h && (a[p] = h);
}
function Oy(t) {
  return t.__data__;
}
function Hy(t, r) {
  if (!arguments.length) return Array.from(this, Oy);
  var i = r ? $y : Ay, s = this._parents, a = this._groups;
  typeof t != "function" && (t = Ly(t));
  for (var c = a.length, f = new Array(c), p = new Array(c), h = new Array(c), g = 0; g < c; ++g) {
    var m = s[g], w = a[g], y = w.length, x = Fy(t.call(m, m && m.__data__, g, s)), _ = x.length, M = p[g] = new Array(_), E = f[g] = new Array(_), C = h[g] = new Array(y);
    i(m, w, M, E, C, x, r);
    for (var A = 0, S = 0, P, T; A < _; ++A)
      if (P = M[A]) {
        for (A >= S && (S = A + 1); !(T = E[S]) && ++S < _; ) ;
        P._next = T || null;
      }
  }
  return f = new Et(f, s), f._enter = p, f._exit = h, f;
}
function Fy(t) {
  return typeof t == "object" && "length" in t ? t : Array.from(t);
}
function jy() {
  return new Et(this._exit || this._groups.map(Th), this._parents);
}
function Vy(t, r, i) {
  var s = this.enter(), a = this, c = this.exit();
  return typeof t == "function" ? (s = t(s), s && (s = s.selection())) : s = s.append(t + ""), r != null && (a = r(a), a && (a = a.selection())), i == null ? c.remove() : i(c), s && a ? s.merge(a).order() : a;
}
function By(t) {
  for (var r = t.selection ? t.selection() : t, i = this._groups, s = r._groups, a = i.length, c = s.length, f = Math.min(a, c), p = new Array(a), h = 0; h < f; ++h)
    for (var g = i[h], m = s[h], w = g.length, y = p[h] = new Array(w), x, _ = 0; _ < w; ++_)
      (x = g[_] || m[_]) && (y[_] = x);
  for (; h < a; ++h)
    p[h] = i[h];
  return new Et(p, this._parents);
}
function Uy() {
  for (var t = this._groups, r = -1, i = t.length; ++r < i; )
    for (var s = t[r], a = s.length - 1, c = s[a], f; --a >= 0; )
      (f = s[a]) && (c && f.compareDocumentPosition(c) ^ 4 && c.parentNode.insertBefore(f, c), c = f);
  return this;
}
function Wy(t) {
  t || (t = Yy);
  function r(w, y) {
    return w && y ? t(w.__data__, y.__data__) : !w - !y;
  }
  for (var i = this._groups, s = i.length, a = new Array(s), c = 0; c < s; ++c) {
    for (var f = i[c], p = f.length, h = a[c] = new Array(p), g, m = 0; m < p; ++m)
      (g = f[m]) && (h[m] = g);
    h.sort(r);
  }
  return new Et(a, this._parents).order();
}
function Yy(t, r) {
  return t < r ? -1 : t > r ? 1 : t >= r ? 0 : NaN;
}
function Xy() {
  var t = arguments[0];
  return arguments[0] = this, t.apply(null, arguments), this;
}
function Zy() {
  return Array.from(this);
}
function Qy() {
  for (var t = this._groups, r = 0, i = t.length; r < i; ++r)
    for (var s = t[r], a = 0, c = s.length; a < c; ++a) {
      var f = s[a];
      if (f) return f;
    }
  return null;
}
function Ky() {
  let t = 0;
  for (const r of this) ++t;
  return t;
}
function Gy() {
  return !this.node();
}
function qy(t) {
  for (var r = this._groups, i = 0, s = r.length; i < s; ++i)
    for (var a = r[i], c = 0, f = a.length, p; c < f; ++c)
      (p = a[c]) && t.call(p, p.__data__, c, a);
  return this;
}
function Jy(t) {
  return function() {
    this.removeAttribute(t);
  };
}
function ev(t) {
  return function() {
    this.removeAttributeNS(t.space, t.local);
  };
}
function tv(t, r) {
  return function() {
    this.setAttribute(t, r);
  };
}
function nv(t, r) {
  return function() {
    this.setAttributeNS(t.space, t.local, r);
  };
}
function rv(t, r) {
  return function() {
    var i = r.apply(this, arguments);
    i == null ? this.removeAttribute(t) : this.setAttribute(t, i);
  };
}
function ov(t, r) {
  return function() {
    var i = r.apply(this, arguments);
    i == null ? this.removeAttributeNS(t.space, t.local) : this.setAttributeNS(t.space, t.local, i);
  };
}
function iv(t, r) {
  var i = xs(t);
  if (arguments.length < 2) {
    var s = this.node();
    return i.local ? s.getAttributeNS(i.space, i.local) : s.getAttribute(i);
  }
  return this.each((r == null ? i.local ? ev : Jy : typeof r == "function" ? i.local ? ov : rv : i.local ? nv : tv)(i, r));
}
function bh(t) {
  return t.ownerDocument && t.ownerDocument.defaultView || t.document && t || t.defaultView;
}
function lv(t) {
  return function() {
    this.style.removeProperty(t);
  };
}
function sv(t, r, i) {
  return function() {
    this.style.setProperty(t, r, i);
  };
}
function av(t, r, i) {
  return function() {
    var s = r.apply(this, arguments);
    s == null ? this.style.removeProperty(t) : this.style.setProperty(t, s, i);
  };
}
function uv(t, r, i) {
  return arguments.length > 1 ? this.each((r == null ? lv : typeof r == "function" ? av : sv)(t, r, i ?? "")) : so(this.node(), t);
}
function so(t, r) {
  return t.style.getPropertyValue(r) || bh(t).getComputedStyle(t, null).getPropertyValue(r);
}
function cv(t) {
  return function() {
    delete this[t];
  };
}
function fv(t, r) {
  return function() {
    this[t] = r;
  };
}
function dv(t, r) {
  return function() {
    var i = r.apply(this, arguments);
    i == null ? delete this[t] : this[t] = i;
  };
}
function pv(t, r) {
  return arguments.length > 1 ? this.each((r == null ? cv : typeof r == "function" ? dv : fv)(t, r)) : this.node()[t];
}
function Rh(t) {
  return t.trim().split(/^|\s+/);
}
function uc(t) {
  return t.classList || new Dh(t);
}
function Dh(t) {
  this._node = t, this._names = Rh(t.getAttribute("class") || "");
}
Dh.prototype = {
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
function Lh(t, r) {
  for (var i = uc(t), s = -1, a = r.length; ++s < a; ) i.add(r[s]);
}
function Ah(t, r) {
  for (var i = uc(t), s = -1, a = r.length; ++s < a; ) i.remove(r[s]);
}
function hv(t) {
  return function() {
    Lh(this, t);
  };
}
function gv(t) {
  return function() {
    Ah(this, t);
  };
}
function mv(t, r) {
  return function() {
    (r.apply(this, arguments) ? Lh : Ah)(this, t);
  };
}
function yv(t, r) {
  var i = Rh(t + "");
  if (arguments.length < 2) {
    for (var s = uc(this.node()), a = -1, c = i.length; ++a < c; ) if (!s.contains(i[a])) return !1;
    return !0;
  }
  return this.each((typeof r == "function" ? mv : r ? hv : gv)(i, r));
}
function vv() {
  this.textContent = "";
}
function wv(t) {
  return function() {
    this.textContent = t;
  };
}
function xv(t) {
  return function() {
    var r = t.apply(this, arguments);
    this.textContent = r ?? "";
  };
}
function _v(t) {
  return arguments.length ? this.each(t == null ? vv : (typeof t == "function" ? xv : wv)(t)) : this.node().textContent;
}
function Sv() {
  this.innerHTML = "";
}
function kv(t) {
  return function() {
    this.innerHTML = t;
  };
}
function Ev(t) {
  return function() {
    var r = t.apply(this, arguments);
    this.innerHTML = r ?? "";
  };
}
function Cv(t) {
  return arguments.length ? this.each(t == null ? Sv : (typeof t == "function" ? Ev : kv)(t)) : this.node().innerHTML;
}
function Nv() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function Mv() {
  return this.each(Nv);
}
function zv() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function Pv() {
  return this.each(zv);
}
function Iv(t) {
  var r = typeof t == "function" ? t : Mh(t);
  return this.select(function() {
    return this.appendChild(r.apply(this, arguments));
  });
}
function Tv() {
  return null;
}
function bv(t, r) {
  var i = typeof t == "function" ? t : Mh(t), s = r == null ? Tv : typeof r == "function" ? r : ac(r);
  return this.select(function() {
    return this.insertBefore(i.apply(this, arguments), s.apply(this, arguments) || null);
  });
}
function Rv() {
  var t = this.parentNode;
  t && t.removeChild(this);
}
function Dv() {
  return this.each(Rv);
}
function Lv() {
  var t = this.cloneNode(!1), r = this.parentNode;
  return r ? r.insertBefore(t, this.nextSibling) : t;
}
function Av() {
  var t = this.cloneNode(!0), r = this.parentNode;
  return r ? r.insertBefore(t, this.nextSibling) : t;
}
function $v(t) {
  return this.select(t ? Av : Lv);
}
function Ov(t) {
  return arguments.length ? this.property("__data__", t) : this.node().__data__;
}
function Hv(t) {
  return function(r) {
    t.call(this, r, this.__data__);
  };
}
function Fv(t) {
  return t.trim().split(/^|\s+/).map(function(r) {
    var i = "", s = r.indexOf(".");
    return s >= 0 && (i = r.slice(s + 1), r = r.slice(0, s)), { type: r, name: i };
  });
}
function jv(t) {
  return function() {
    var r = this.__on;
    if (r) {
      for (var i = 0, s = -1, a = r.length, c; i < a; ++i)
        c = r[i], (!t.type || c.type === t.type) && c.name === t.name ? this.removeEventListener(c.type, c.listener, c.options) : r[++s] = c;
      ++s ? r.length = s : delete this.__on;
    }
  };
}
function Vv(t, r, i) {
  return function() {
    var s = this.__on, a, c = Hv(r);
    if (s) {
      for (var f = 0, p = s.length; f < p; ++f)
        if ((a = s[f]).type === t.type && a.name === t.name) {
          this.removeEventListener(a.type, a.listener, a.options), this.addEventListener(a.type, a.listener = c, a.options = i), a.value = r;
          return;
        }
    }
    this.addEventListener(t.type, c, i), a = { type: t.type, name: t.name, value: r, listener: c, options: i }, s ? s.push(a) : this.__on = [a];
  };
}
function Bv(t, r, i) {
  var s = Fv(t + ""), a, c = s.length, f;
  if (arguments.length < 2) {
    var p = this.node().__on;
    if (p) {
      for (var h = 0, g = p.length, m; h < g; ++h)
        for (a = 0, m = p[h]; a < c; ++a)
          if ((f = s[a]).type === m.type && f.name === m.name)
            return m.value;
    }
    return;
  }
  for (p = r ? Vv : jv, a = 0; a < c; ++a) this.each(p(s[a], r, i));
  return this;
}
function $h(t, r, i) {
  var s = bh(t), a = s.CustomEvent;
  typeof a == "function" ? a = new a(r, i) : (a = s.document.createEvent("Event"), i ? (a.initEvent(r, i.bubbles, i.cancelable), a.detail = i.detail) : a.initEvent(r, !1, !1)), t.dispatchEvent(a);
}
function Uv(t, r) {
  return function() {
    return $h(this, t, r);
  };
}
function Wv(t, r) {
  return function() {
    return $h(this, t, r.apply(this, arguments));
  };
}
function Yv(t, r) {
  return this.each((typeof r == "function" ? Wv : Uv)(t, r));
}
function* Xv() {
  for (var t = this._groups, r = 0, i = t.length; r < i; ++r)
    for (var s = t[r], a = 0, c = s.length, f; a < c; ++a)
      (f = s[a]) && (yield f);
}
var Oh = [null];
function Et(t, r) {
  this._groups = t, this._parents = r;
}
function ki() {
  return new Et([[document.documentElement]], Oh);
}
function Zv() {
  return this;
}
Et.prototype = ki.prototype = {
  constructor: Et,
  select: xy,
  selectAll: Ey,
  selectChild: zy,
  selectChildren: by,
  filter: Ry,
  data: Hy,
  enter: Dy,
  exit: jy,
  join: Vy,
  merge: By,
  selection: Zv,
  order: Uy,
  sort: Wy,
  call: Xy,
  nodes: Zy,
  node: Qy,
  size: Ky,
  empty: Gy,
  each: qy,
  attr: iv,
  style: uv,
  property: pv,
  classed: yv,
  text: _v,
  html: Cv,
  raise: Mv,
  lower: Pv,
  append: Iv,
  insert: bv,
  remove: Dv,
  clone: $v,
  datum: Ov,
  on: Bv,
  dispatch: Yv,
  [Symbol.iterator]: Xv
};
function kt(t) {
  return typeof t == "string" ? new Et([[document.querySelector(t)]], [document.documentElement]) : new Et([[t]], Oh);
}
var Qv = 0;
function dp() {
  this._ = "@" + (++Qv).toString(36);
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
function Kv(t) {
  let r;
  for (; r = t.sourceEvent; ) t = r;
  return t;
}
function jt(t, r) {
  if (t = Kv(t), r === void 0 && (r = t.currentTarget), r) {
    var i = r.ownerSVGElement || r;
    if (i.createSVGPoint) {
      var s = i.createSVGPoint();
      return s.x = t.clientX, s.y = t.clientY, s = s.matrixTransform(r.getScreenCTM().inverse()), [s.x, s.y];
    }
    if (r.getBoundingClientRect) {
      var a = r.getBoundingClientRect();
      return [t.clientX - a.left - r.clientLeft, t.clientY - a.top - r.clientTop];
    }
  }
  return [t.pageX, t.pageY];
}
const Gv = { passive: !1 }, pi = { capture: !0, passive: !1 };
function Iu(t) {
  t.stopImmediatePropagation();
}
function ro(t) {
  t.preventDefault(), t.stopImmediatePropagation();
}
function Hh(t) {
  var r = t.document.documentElement, i = kt(t).on("dragstart.drag", ro, pi);
  "onselectstart" in r ? i.on("selectstart.drag", ro, pi) : (r.__noselect = r.style.MozUserSelect, r.style.MozUserSelect = "none");
}
function Fh(t, r) {
  var i = t.document.documentElement, s = kt(t).on("dragstart.drag", null);
  r && (s.on("click.drag", ro, pi), setTimeout(function() {
    s.on("click.drag", null);
  }, 0)), "onselectstart" in i ? s.on("selectstart.drag", null) : (i.style.MozUserSelect = i.__noselect, delete i.__noselect);
}
var Xl = (t) => () => t;
function Zu(t, {
  sourceEvent: r,
  subject: i,
  target: s,
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
    target: { value: s, enumerable: !0, configurable: !0 },
    identifier: { value: a, enumerable: !0, configurable: !0 },
    active: { value: c, enumerable: !0, configurable: !0 },
    x: { value: f, enumerable: !0, configurable: !0 },
    y: { value: p, enumerable: !0, configurable: !0 },
    dx: { value: h, enumerable: !0, configurable: !0 },
    dy: { value: g, enumerable: !0, configurable: !0 },
    _: { value: m }
  });
}
Zu.prototype.on = function() {
  var t = this._.on.apply(this._, arguments);
  return t === this._ ? this : t;
};
function qv(t) {
  return !t.ctrlKey && !t.button;
}
function Jv() {
  return this.parentNode;
}
function ew(t, r) {
  return r ?? { x: t.x, y: t.y };
}
function tw() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function jh() {
  var t = qv, r = Jv, i = ew, s = tw, a = {}, c = ws("start", "drag", "end"), f = 0, p, h, g, m, w = 0;
  function y(P) {
    P.on("mousedown.drag", x).filter(s).on("touchstart.drag", E).on("touchmove.drag", C, Gv).on("touchend.drag touchcancel.drag", A).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function x(P, T) {
    if (!(m || !t.call(this, P, T))) {
      var I = S(this, r.call(this, P, T), P, T, "mouse");
      I && (kt(P.view).on("mousemove.drag", _, pi).on("mouseup.drag", M, pi), Hh(P.view), Iu(P), g = !1, p = P.clientX, h = P.clientY, I("start", P));
    }
  }
  function _(P) {
    if (ro(P), !g) {
      var T = P.clientX - p, I = P.clientY - h;
      g = T * T + I * I > w;
    }
    a.mouse("drag", P);
  }
  function M(P) {
    kt(P.view).on("mousemove.drag mouseup.drag", null), Fh(P.view, g), ro(P), a.mouse("end", P);
  }
  function E(P, T) {
    if (t.call(this, P, T)) {
      var I = P.changedTouches, D = r.call(this, P, T), Y = I.length, X, J;
      for (X = 0; X < Y; ++X)
        (J = S(this, D, P, T, I[X].identifier, I[X])) && (Iu(P), J("start", P, I[X]));
    }
  }
  function C(P) {
    var T = P.changedTouches, I = T.length, D, Y;
    for (D = 0; D < I; ++D)
      (Y = a[T[D].identifier]) && (ro(P), Y("drag", P, T[D]));
  }
  function A(P) {
    var T = P.changedTouches, I = T.length, D, Y;
    for (m && clearTimeout(m), m = setTimeout(function() {
      m = null;
    }, 500), D = 0; D < I; ++D)
      (Y = a[T[D].identifier]) && (Iu(P), Y("end", P, T[D]));
  }
  function S(P, T, I, D, Y, X) {
    var J = c.copy(), q = jt(X || I, T), ee, G, N;
    if ((N = i.call(P, new Zu("beforestart", {
      sourceEvent: I,
      target: y,
      identifier: Y,
      active: f,
      x: q[0],
      y: q[1],
      dx: 0,
      dy: 0,
      dispatch: J
    }), D)) != null)
      return ee = N.x - q[0] || 0, G = N.y - q[1] || 0, function H(F, j, R) {
        var O = q, V;
        switch (F) {
          case "start":
            a[Y] = H, V = f++;
            break;
          case "end":
            delete a[Y], --f;
          // falls through
          case "drag":
            q = jt(R || j, T), V = f;
            break;
        }
        J.call(
          F,
          P,
          new Zu(F, {
            sourceEvent: j,
            subject: N,
            target: y,
            identifier: Y,
            active: V,
            x: q[0] + ee,
            y: q[1] + G,
            dx: q[0] - O[0],
            dy: q[1] - O[1],
            dispatch: J
          }),
          D
        );
      };
  }
  return y.filter = function(P) {
    return arguments.length ? (t = typeof P == "function" ? P : Xl(!!P), y) : t;
  }, y.container = function(P) {
    return arguments.length ? (r = typeof P == "function" ? P : Xl(P), y) : r;
  }, y.subject = function(P) {
    return arguments.length ? (i = typeof P == "function" ? P : Xl(P), y) : i;
  }, y.touchable = function(P) {
    return arguments.length ? (s = typeof P == "function" ? P : Xl(!!P), y) : s;
  }, y.on = function() {
    var P = c.on.apply(c, arguments);
    return P === c ? y : P;
  }, y.clickDistance = function(P) {
    return arguments.length ? (w = (P = +P) * P, y) : Math.sqrt(w);
  }, y;
}
function mo(t, r, i) {
  t.prototype = r.prototype = i, i.constructor = t;
}
function Ei(t, r) {
  var i = Object.create(t.prototype);
  for (var s in r) i[s] = r[s];
  return i;
}
function Yn() {
}
var vr = 0.7, ao = 1 / vr, oo = "\\s*([+-]?\\d+)\\s*", hi = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", nn = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", nw = /^#([0-9a-f]{3,8})$/, rw = new RegExp(`^rgb\\(${oo},${oo},${oo}\\)$`), ow = new RegExp(`^rgb\\(${nn},${nn},${nn}\\)$`), iw = new RegExp(`^rgba\\(${oo},${oo},${oo},${hi}\\)$`), lw = new RegExp(`^rgba\\(${nn},${nn},${nn},${hi}\\)$`), sw = new RegExp(`^hsl\\(${hi},${nn},${nn}\\)$`), aw = new RegExp(`^hsla\\(${hi},${nn},${nn},${hi}\\)$`), pp = {
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
mo(Yn, wr, {
  copy(t) {
    return Object.assign(new this.constructor(), this, t);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: hp,
  // Deprecated! Use color.formatHex.
  formatHex: hp,
  formatHex8: uw,
  formatHsl: cw,
  formatRgb: gp,
  toString: gp
});
function hp() {
  return this.rgb().formatHex();
}
function uw() {
  return this.rgb().formatHex8();
}
function cw() {
  return Vh(this).formatHsl();
}
function gp() {
  return this.rgb().formatRgb();
}
function wr(t) {
  var r, i;
  return t = (t + "").trim().toLowerCase(), (r = nw.exec(t)) ? (i = r[1].length, r = parseInt(r[1], 16), i === 6 ? mp(r) : i === 3 ? new Ge(r >> 8 & 15 | r >> 4 & 240, r >> 4 & 15 | r & 240, (r & 15) << 4 | r & 15, 1) : i === 8 ? Zl(r >> 24 & 255, r >> 16 & 255, r >> 8 & 255, (r & 255) / 255) : i === 4 ? Zl(r >> 12 & 15 | r >> 8 & 240, r >> 8 & 15 | r >> 4 & 240, r >> 4 & 15 | r & 240, ((r & 15) << 4 | r & 15) / 255) : null) : (r = rw.exec(t)) ? new Ge(r[1], r[2], r[3], 1) : (r = ow.exec(t)) ? new Ge(r[1] * 255 / 100, r[2] * 255 / 100, r[3] * 255 / 100, 1) : (r = iw.exec(t)) ? Zl(r[1], r[2], r[3], r[4]) : (r = lw.exec(t)) ? Zl(r[1] * 255 / 100, r[2] * 255 / 100, r[3] * 255 / 100, r[4]) : (r = sw.exec(t)) ? wp(r[1], r[2] / 100, r[3] / 100, 1) : (r = aw.exec(t)) ? wp(r[1], r[2] / 100, r[3] / 100, r[4]) : pp.hasOwnProperty(t) ? mp(pp[t]) : t === "transparent" ? new Ge(NaN, NaN, NaN, 0) : null;
}
function mp(t) {
  return new Ge(t >> 16 & 255, t >> 8 & 255, t & 255, 1);
}
function Zl(t, r, i, s) {
  return s <= 0 && (t = r = i = NaN), new Ge(t, r, i, s);
}
function cc(t) {
  return t instanceof Yn || (t = wr(t)), t ? (t = t.rgb(), new Ge(t.r, t.g, t.b, t.opacity)) : new Ge();
}
function Qu(t, r, i, s) {
  return arguments.length === 1 ? cc(t) : new Ge(t, r, i, s ?? 1);
}
function Ge(t, r, i, s) {
  this.r = +t, this.g = +r, this.b = +i, this.opacity = +s;
}
mo(Ge, Qu, Ei(Yn, {
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
    return new Ge(gr(this.r), gr(this.g), gr(this.b), as(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: yp,
  // Deprecated! Use color.formatHex.
  formatHex: yp,
  formatHex8: fw,
  formatRgb: vp,
  toString: vp
}));
function yp() {
  return `#${hr(this.r)}${hr(this.g)}${hr(this.b)}`;
}
function fw() {
  return `#${hr(this.r)}${hr(this.g)}${hr(this.b)}${hr((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function vp() {
  const t = as(this.opacity);
  return `${t === 1 ? "rgb(" : "rgba("}${gr(this.r)}, ${gr(this.g)}, ${gr(this.b)}${t === 1 ? ")" : `, ${t})`}`;
}
function as(t) {
  return isNaN(t) ? 1 : Math.max(0, Math.min(1, t));
}
function gr(t) {
  return Math.max(0, Math.min(255, Math.round(t) || 0));
}
function hr(t) {
  return t = gr(t), (t < 16 ? "0" : "") + t.toString(16);
}
function wp(t, r, i, s) {
  return s <= 0 ? t = r = i = NaN : i <= 0 || i >= 1 ? t = r = NaN : r <= 0 && (t = NaN), new Vt(t, r, i, s);
}
function Vh(t) {
  if (t instanceof Vt) return new Vt(t.h, t.s, t.l, t.opacity);
  if (t instanceof Yn || (t = wr(t)), !t) return new Vt();
  if (t instanceof Vt) return t;
  t = t.rgb();
  var r = t.r / 255, i = t.g / 255, s = t.b / 255, a = Math.min(r, i, s), c = Math.max(r, i, s), f = NaN, p = c - a, h = (c + a) / 2;
  return p ? (r === c ? f = (i - s) / p + (i < s) * 6 : i === c ? f = (s - r) / p + 2 : f = (r - i) / p + 4, p /= h < 0.5 ? c + a : 2 - c - a, f *= 60) : p = h > 0 && h < 1 ? 0 : f, new Vt(f, p, h, t.opacity);
}
function dw(t, r, i, s) {
  return arguments.length === 1 ? Vh(t) : new Vt(t, r, i, s ?? 1);
}
function Vt(t, r, i, s) {
  this.h = +t, this.s = +r, this.l = +i, this.opacity = +s;
}
mo(Vt, dw, Ei(Yn, {
  brighter(t) {
    return t = t == null ? ao : Math.pow(ao, t), new Vt(this.h, this.s, this.l * t, this.opacity);
  },
  darker(t) {
    return t = t == null ? vr : Math.pow(vr, t), new Vt(this.h, this.s, this.l * t, this.opacity);
  },
  rgb() {
    var t = this.h % 360 + (this.h < 0) * 360, r = isNaN(t) || isNaN(this.s) ? 0 : this.s, i = this.l, s = i + (i < 0.5 ? i : 1 - i) * r, a = 2 * i - s;
    return new Ge(
      Tu(t >= 240 ? t - 240 : t + 120, a, s),
      Tu(t, a, s),
      Tu(t < 120 ? t + 240 : t - 120, a, s),
      this.opacity
    );
  },
  clamp() {
    return new Vt(xp(this.h), Ql(this.s), Ql(this.l), as(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const t = as(this.opacity);
    return `${t === 1 ? "hsl(" : "hsla("}${xp(this.h)}, ${Ql(this.s) * 100}%, ${Ql(this.l) * 100}%${t === 1 ? ")" : `, ${t})`}`;
  }
}));
function xp(t) {
  return t = (t || 0) % 360, t < 0 ? t + 360 : t;
}
function Ql(t) {
  return Math.max(0, Math.min(1, t || 0));
}
function Tu(t, r, i) {
  return (t < 60 ? r + (i - r) * t / 60 : t < 180 ? i : t < 240 ? r + (i - r) * (240 - t) / 60 : r) * 255;
}
const Bh = Math.PI / 180, Uh = 180 / Math.PI, us = 18, Wh = 0.96422, Yh = 1, Xh = 0.82521, Zh = 4 / 29, io = 6 / 29, Qh = 3 * io * io, pw = io * io * io;
function Kh(t) {
  if (t instanceof rn) return new rn(t.l, t.a, t.b, t.opacity);
  if (t instanceof yn) return Gh(t);
  t instanceof Ge || (t = cc(t));
  var r = Lu(t.r), i = Lu(t.g), s = Lu(t.b), a = bu((0.2225045 * r + 0.7168786 * i + 0.0606169 * s) / Yh), c, f;
  return r === i && i === s ? c = f = a : (c = bu((0.4360747 * r + 0.3850649 * i + 0.1430804 * s) / Wh), f = bu((0.0139322 * r + 0.0971045 * i + 0.7141733 * s) / Xh)), new rn(116 * a - 16, 500 * (c - a), 200 * (a - f), t.opacity);
}
function hw(t, r, i, s) {
  return arguments.length === 1 ? Kh(t) : new rn(t, r, i, s ?? 1);
}
function rn(t, r, i, s) {
  this.l = +t, this.a = +r, this.b = +i, this.opacity = +s;
}
mo(rn, hw, Ei(Yn, {
  brighter(t) {
    return new rn(this.l + us * (t ?? 1), this.a, this.b, this.opacity);
  },
  darker(t) {
    return new rn(this.l - us * (t ?? 1), this.a, this.b, this.opacity);
  },
  rgb() {
    var t = (this.l + 16) / 116, r = isNaN(this.a) ? t : t + this.a / 500, i = isNaN(this.b) ? t : t - this.b / 200;
    return r = Wh * Ru(r), t = Yh * Ru(t), i = Xh * Ru(i), new Ge(
      Du(3.1338561 * r - 1.6168667 * t - 0.4906146 * i),
      Du(-0.9787684 * r + 1.9161415 * t + 0.033454 * i),
      Du(0.0719453 * r - 0.2289914 * t + 1.4052427 * i),
      this.opacity
    );
  }
}));
function bu(t) {
  return t > pw ? Math.pow(t, 1 / 3) : t / Qh + Zh;
}
function Ru(t) {
  return t > io ? t * t * t : Qh * (t - Zh);
}
function Du(t) {
  return 255 * (t <= 31308e-7 ? 12.92 * t : 1.055 * Math.pow(t, 1 / 2.4) - 0.055);
}
function Lu(t) {
  return (t /= 255) <= 0.04045 ? t / 12.92 : Math.pow((t + 0.055) / 1.055, 2.4);
}
function gw(t) {
  if (t instanceof yn) return new yn(t.h, t.c, t.l, t.opacity);
  if (t instanceof rn || (t = Kh(t)), t.a === 0 && t.b === 0) return new yn(NaN, 0 < t.l && t.l < 100 ? 0 : NaN, t.l, t.opacity);
  var r = Math.atan2(t.b, t.a) * Uh;
  return new yn(r < 0 ? r + 360 : r, Math.sqrt(t.a * t.a + t.b * t.b), t.l, t.opacity);
}
function mw(t, r, i, s) {
  return arguments.length === 1 ? gw(t) : new yn(t, r, i, s ?? 1);
}
function yn(t, r, i, s) {
  this.h = +t, this.c = +r, this.l = +i, this.opacity = +s;
}
function Gh(t) {
  if (isNaN(t.h)) return new rn(t.l, 0, 0, t.opacity);
  var r = t.h * Bh;
  return new rn(t.l, Math.cos(r) * t.c, Math.sin(r) * t.c, t.opacity);
}
mo(yn, mw, Ei(Yn, {
  brighter(t) {
    return new yn(this.h, this.c, this.l + us * (t ?? 1), this.opacity);
  },
  darker(t) {
    return new yn(this.h, this.c, this.l - us * (t ?? 1), this.opacity);
  },
  rgb() {
    return Gh(this).rgb();
  }
}));
var qh = -0.14861, fc = 1.78277, dc = -0.29227, _s = -0.90649, gi = 1.97294, _p = gi * _s, Sp = gi * fc, kp = fc * dc - _s * qh;
function yw(t) {
  if (t instanceof mr) return new mr(t.h, t.s, t.l, t.opacity);
  t instanceof Ge || (t = cc(t));
  var r = t.r / 255, i = t.g / 255, s = t.b / 255, a = (kp * s + _p * r - Sp * i) / (kp + _p - Sp), c = s - a, f = (gi * (i - a) - dc * c) / _s, p = Math.sqrt(f * f + c * c) / (gi * a * (1 - a)), h = p ? Math.atan2(f, c) * Uh - 120 : NaN;
  return new mr(h < 0 ? h + 360 : h, p, a, t.opacity);
}
function Ku(t, r, i, s) {
  return arguments.length === 1 ? yw(t) : new mr(t, r, i, s ?? 1);
}
function mr(t, r, i, s) {
  this.h = +t, this.s = +r, this.l = +i, this.opacity = +s;
}
mo(mr, Ku, Ei(Yn, {
  brighter(t) {
    return t = t == null ? ao : Math.pow(ao, t), new mr(this.h, this.s, this.l * t, this.opacity);
  },
  darker(t) {
    return t = t == null ? vr : Math.pow(vr, t), new mr(this.h, this.s, this.l * t, this.opacity);
  },
  rgb() {
    var t = isNaN(this.h) ? 0 : (this.h + 120) * Bh, r = +this.l, i = isNaN(this.s) ? 0 : this.s * r * (1 - r), s = Math.cos(t), a = Math.sin(t);
    return new Ge(
      255 * (r + i * (qh * s + fc * a)),
      255 * (r + i * (dc * s + _s * a)),
      255 * (r + i * (gi * s)),
      this.opacity
    );
  }
}));
var Ss = (t) => () => t;
function Jh(t, r) {
  return function(i) {
    return t + i * r;
  };
}
function vw(t, r, i) {
  return t = Math.pow(t, i), r = Math.pow(r, i) - t, i = 1 / i, function(s) {
    return Math.pow(t + s * r, i);
  };
}
function ww(t, r) {
  var i = r - t;
  return i ? Jh(t, i > 180 || i < -180 ? i - 360 * Math.round(i / 360) : i) : Ss(isNaN(t) ? r : t);
}
function xw(t) {
  return (t = +t) == 1 ? lo : function(r, i) {
    return i - r ? vw(r, i, t) : Ss(isNaN(r) ? i : r);
  };
}
function lo(t, r) {
  var i = r - t;
  return i ? Jh(t, i) : Ss(isNaN(t) ? r : t);
}
var cs = (function t(r) {
  var i = xw(r);
  function s(a, c) {
    var f = i((a = Qu(a)).r, (c = Qu(c)).r), p = i(a.g, c.g), h = i(a.b, c.b), g = lo(a.opacity, c.opacity);
    return function(m) {
      return a.r = f(m), a.g = p(m), a.b = h(m), a.opacity = g(m), a + "";
    };
  }
  return s.gamma = t, s;
})(1);
function _w(t, r) {
  r || (r = []);
  var i = t ? Math.min(r.length, t.length) : 0, s = r.slice(), a;
  return function(c) {
    for (a = 0; a < i; ++a) s[a] = t[a] * (1 - c) + r[a] * c;
    return s;
  };
}
function Sw(t) {
  return ArrayBuffer.isView(t) && !(t instanceof DataView);
}
function kw(t, r) {
  var i = r ? r.length : 0, s = t ? Math.min(i, t.length) : 0, a = new Array(s), c = new Array(i), f;
  for (f = 0; f < s; ++f) a[f] = fi(t[f], r[f]);
  for (; f < i; ++f) c[f] = r[f];
  return function(p) {
    for (f = 0; f < s; ++f) c[f] = a[f](p);
    return c;
  };
}
function Ew(t, r) {
  var i = /* @__PURE__ */ new Date();
  return t = +t, r = +r, function(s) {
    return i.setTime(t * (1 - s) + r * s), i;
  };
}
function tn(t, r) {
  return t = +t, r = +r, function(i) {
    return t * (1 - i) + r * i;
  };
}
function Cw(t, r) {
  var i = {}, s = {}, a;
  (t === null || typeof t != "object") && (t = {}), (r === null || typeof r != "object") && (r = {});
  for (a in r)
    a in t ? i[a] = fi(t[a], r[a]) : s[a] = r[a];
  return function(c) {
    for (a in i) s[a] = i[a](c);
    return s;
  };
}
var Gu = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, Au = new RegExp(Gu.source, "g");
function Nw(t) {
  return function() {
    return t;
  };
}
function Mw(t) {
  return function(r) {
    return t(r) + "";
  };
}
function eg(t, r) {
  var i = Gu.lastIndex = Au.lastIndex = 0, s, a, c, f = -1, p = [], h = [];
  for (t = t + "", r = r + ""; (s = Gu.exec(t)) && (a = Au.exec(r)); )
    (c = a.index) > i && (c = r.slice(i, c), p[f] ? p[f] += c : p[++f] = c), (s = s[0]) === (a = a[0]) ? p[f] ? p[f] += a : p[++f] = a : (p[++f] = null, h.push({ i: f, x: tn(s, a) })), i = Au.lastIndex;
  return i < r.length && (c = r.slice(i), p[f] ? p[f] += c : p[++f] = c), p.length < 2 ? h[0] ? Mw(h[0].x) : Nw(r) : (r = h.length, function(g) {
    for (var m = 0, w; m < r; ++m) p[(w = h[m]).i] = w.x(g);
    return p.join("");
  });
}
function fi(t, r) {
  var i = typeof r, s;
  return r == null || i === "boolean" ? Ss(r) : (i === "number" ? tn : i === "string" ? (s = wr(r)) ? (r = s, cs) : eg : r instanceof wr ? cs : r instanceof Date ? Ew : Sw(r) ? _w : Array.isArray(r) ? kw : typeof r.valueOf != "function" && typeof r.toString != "function" || isNaN(r) ? Cw : tn)(t, r);
}
var Ep = 180 / Math.PI, qu = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function tg(t, r, i, s, a, c) {
  var f, p, h;
  return (f = Math.sqrt(t * t + r * r)) && (t /= f, r /= f), (h = t * i + r * s) && (i -= t * h, s -= r * h), (p = Math.sqrt(i * i + s * s)) && (i /= p, s /= p, h /= p), t * s < r * i && (t = -t, r = -r, h = -h, f = -f), {
    translateX: a,
    translateY: c,
    rotate: Math.atan2(r, t) * Ep,
    skewX: Math.atan(h) * Ep,
    scaleX: f,
    scaleY: p
  };
}
var Kl;
function zw(t) {
  const r = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(t + "");
  return r.isIdentity ? qu : tg(r.a, r.b, r.c, r.d, r.e, r.f);
}
function Pw(t) {
  return t == null || (Kl || (Kl = document.createElementNS("http://www.w3.org/2000/svg", "g")), Kl.setAttribute("transform", t), !(t = Kl.transform.baseVal.consolidate())) ? qu : (t = t.matrix, tg(t.a, t.b, t.c, t.d, t.e, t.f));
}
function ng(t, r, i, s) {
  function a(g) {
    return g.length ? g.pop() + " " : "";
  }
  function c(g, m, w, y, x, _) {
    if (g !== w || m !== y) {
      var M = x.push("translate(", null, r, null, i);
      _.push({ i: M - 4, x: tn(g, w) }, { i: M - 2, x: tn(m, y) });
    } else (w || y) && x.push("translate(" + w + r + y + i);
  }
  function f(g, m, w, y) {
    g !== m ? (g - m > 180 ? m += 360 : m - g > 180 && (g += 360), y.push({ i: w.push(a(w) + "rotate(", null, s) - 2, x: tn(g, m) })) : m && w.push(a(w) + "rotate(" + m + s);
  }
  function p(g, m, w, y) {
    g !== m ? y.push({ i: w.push(a(w) + "skewX(", null, s) - 2, x: tn(g, m) }) : m && w.push(a(w) + "skewX(" + m + s);
  }
  function h(g, m, w, y, x, _) {
    if (g !== w || m !== y) {
      var M = x.push(a(x) + "scale(", null, ",", null, ")");
      _.push({ i: M - 4, x: tn(g, w) }, { i: M - 2, x: tn(m, y) });
    } else (w !== 1 || y !== 1) && x.push(a(x) + "scale(" + w + "," + y + ")");
  }
  return function(g, m) {
    var w = [], y = [];
    return g = t(g), m = t(m), c(g.translateX, g.translateY, m.translateX, m.translateY, w, y), f(g.rotate, m.rotate, w, y), p(g.skewX, m.skewX, w, y), h(g.scaleX, g.scaleY, m.scaleX, m.scaleY, w, y), g = m = null, function(x) {
      for (var _ = -1, M = y.length, E; ++_ < M; ) w[(E = y[_]).i] = E.x(x);
      return w.join("");
    };
  };
}
var Iw = ng(zw, "px, ", "px)", "deg)"), Tw = ng(Pw, ", ", ")", ")"), bw = 1e-12;
function Cp(t) {
  return ((t = Math.exp(t)) + 1 / t) / 2;
}
function Rw(t) {
  return ((t = Math.exp(t)) - 1 / t) / 2;
}
function Dw(t) {
  return ((t = Math.exp(2 * t)) - 1) / (t + 1);
}
var rs = (function t(r, i, s) {
  function a(c, f) {
    var p = c[0], h = c[1], g = c[2], m = f[0], w = f[1], y = f[2], x = m - p, _ = w - h, M = x * x + _ * _, E, C;
    if (M < bw)
      C = Math.log(y / g) / r, E = function(D) {
        return [
          p + D * x,
          h + D * _,
          g * Math.exp(r * D * C)
        ];
      };
    else {
      var A = Math.sqrt(M), S = (y * y - g * g + s * M) / (2 * g * i * A), P = (y * y - g * g - s * M) / (2 * y * i * A), T = Math.log(Math.sqrt(S * S + 1) - S), I = Math.log(Math.sqrt(P * P + 1) - P);
      C = (I - T) / r, E = function(D) {
        var Y = D * C, X = Cp(T), J = g / (i * A) * (X * Dw(r * Y + T) - Rw(T));
        return [
          p + J * x,
          h + J * _,
          g * X / Cp(r * Y + T)
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
function rg(t) {
  return (function r(i) {
    i = +i;
    function s(a, c) {
      var f = t((a = Ku(a)).h, (c = Ku(c)).h), p = lo(a.s, c.s), h = lo(a.l, c.l), g = lo(a.opacity, c.opacity);
      return function(m) {
        return a.h = f(m), a.s = p(m), a.l = h(Math.pow(m, i)), a.opacity = g(m), a + "";
      };
    }
    return s.gamma = r, s;
  })(1);
}
rg(ww);
rg(lo);
var uo = 0, ui = 0, si = 0, og = 1e3, fs, ci, ds = 0, xr = 0, ks = 0, mi = typeof performance == "object" && performance.now ? performance : Date, ig = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(t) {
  setTimeout(t, 17);
};
function pc() {
  return xr || (ig(Lw), xr = mi.now() + ks);
}
function Lw() {
  xr = 0;
}
function ps() {
  this._call = this._time = this._next = null;
}
ps.prototype = lg.prototype = {
  constructor: ps,
  restart: function(t, r, i) {
    if (typeof t != "function") throw new TypeError("callback is not a function");
    i = (i == null ? pc() : +i) + (r == null ? 0 : +r), !this._next && ci !== this && (ci ? ci._next = this : fs = this, ci = this), this._call = t, this._time = i, Ju();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, Ju());
  }
};
function lg(t, r, i) {
  var s = new ps();
  return s.restart(t, r, i), s;
}
function Aw() {
  pc(), ++uo;
  for (var t = fs, r; t; )
    (r = xr - t._time) >= 0 && t._call.call(void 0, r), t = t._next;
  --uo;
}
function Np() {
  xr = (ds = mi.now()) + ks, uo = ui = 0;
  try {
    Aw();
  } finally {
    uo = 0, Ow(), xr = 0;
  }
}
function $w() {
  var t = mi.now(), r = t - ds;
  r > og && (ks -= r, ds = t);
}
function Ow() {
  for (var t, r = fs, i, s = 1 / 0; r; )
    r._call ? (s > r._time && (s = r._time), t = r, r = r._next) : (i = r._next, r._next = null, r = t ? t._next = i : fs = i);
  ci = t, Ju(s);
}
function Ju(t) {
  if (!uo) {
    ui && (ui = clearTimeout(ui));
    var r = t - xr;
    r > 24 ? (t < 1 / 0 && (ui = setTimeout(Np, Math.ceil(t - mi.now() - ks) + 1)), si && (si = clearInterval(si))) : (si || (ds = mi.now(), si = setInterval($w, og)), uo = 1, ig(Np));
  }
}
function Mp(t, r, i) {
  var s = new ps();
  return r = r == null ? 0 : +r, s.restart((a) => {
    s.stop(), t(a + r);
  }, r, i), s;
}
function Hw(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}
var hc = 3;
(function t(r) {
  r = +r;
  function i(s) {
    return Math.pow(s, r);
  }
  return i.exponent = t, i;
})(hc);
(function t(r) {
  r = +r;
  function i(s) {
    return 1 - Math.pow(1 - s, r);
  }
  return i.exponent = t, i;
})(hc);
(function t(r) {
  r = +r;
  function i(s) {
    return ((s *= 2) <= 1 ? Math.pow(s, r) : 2 - Math.pow(2 - s, r)) / 2;
  }
  return i.exponent = t, i;
})(hc);
function hs(t) {
  return (Math.pow(2, -10 * t) - 9765625e-10) * 1.0009775171065494;
}
var gc = 1.70158;
(function t(r) {
  r = +r;
  function i(s) {
    return (s = +s) * s * (r * (s - 1) + s);
  }
  return i.overshoot = t, i;
})(gc);
(function t(r) {
  r = +r;
  function i(s) {
    return --s * s * ((s + 1) * r + s) + 1;
  }
  return i.overshoot = t, i;
})(gc);
(function t(r) {
  r = +r;
  function i(s) {
    return ((s *= 2) < 1 ? s * s * ((r + 1) * s - r) : (s -= 2) * s * ((r + 1) * s + r) + 2) / 2;
  }
  return i.overshoot = t, i;
})(gc);
var co = 2 * Math.PI, mc = 1, yc = 0.3;
(function t(r, i) {
  var s = Math.asin(1 / (r = Math.max(1, r))) * (i /= co);
  function a(c) {
    return r * hs(- --c) * Math.sin((s - c) / i);
  }
  return a.amplitude = function(c) {
    return t(c, i * co);
  }, a.period = function(c) {
    return t(r, c);
  }, a;
})(mc, yc);
(function t(r, i) {
  var s = Math.asin(1 / (r = Math.max(1, r))) * (i /= co);
  function a(c) {
    return 1 - r * hs(c = +c) * Math.sin((c + s) / i);
  }
  return a.amplitude = function(c) {
    return t(c, i * co);
  }, a.period = function(c) {
    return t(r, c);
  }, a;
})(mc, yc);
(function t(r, i) {
  var s = Math.asin(1 / (r = Math.max(1, r))) * (i /= co);
  function a(c) {
    return ((c = c * 2 - 1) < 0 ? r * hs(-c) * Math.sin((s - c) / i) : 2 - r * hs(c) * Math.sin((s + c) / i)) / 2;
  }
  return a.amplitude = function(c) {
    return t(c, i * co);
  }, a.period = function(c) {
    return t(r, c);
  }, a;
})(mc, yc);
var Fw = ws("start", "end", "cancel", "interrupt"), jw = [], sg = 0, zp = 1, ec = 2, os = 3, Pp = 4, tc = 5, is = 6;
function Es(t, r, i, s, a, c) {
  var f = t.__transition;
  if (!f) t.__transition = {};
  else if (i in f) return;
  Vw(t, i, {
    name: r,
    index: s,
    // For context during callback.
    group: a,
    // For context during callback.
    on: Fw,
    tween: jw,
    time: c.time,
    delay: c.delay,
    duration: c.duration,
    ease: c.ease,
    timer: null,
    state: sg
  });
}
function vc(t, r) {
  var i = Yt(t, r);
  if (i.state > sg) throw new Error("too late; already scheduled");
  return i;
}
function on(t, r) {
  var i = Yt(t, r);
  if (i.state > os) throw new Error("too late; already running");
  return i;
}
function Yt(t, r) {
  var i = t.__transition;
  if (!i || !(i = i[r])) throw new Error("transition not found");
  return i;
}
function Vw(t, r, i) {
  var s = t.__transition, a;
  s[r] = i, i.timer = lg(c, 0, i.time);
  function c(g) {
    i.state = zp, i.timer.restart(f, i.delay, i.time), i.delay <= g && f(g - i.delay);
  }
  function f(g) {
    var m, w, y, x;
    if (i.state !== zp) return h();
    for (m in s)
      if (x = s[m], x.name === i.name) {
        if (x.state === os) return Mp(f);
        x.state === Pp ? (x.state = is, x.timer.stop(), x.on.call("interrupt", t, t.__data__, x.index, x.group), delete s[m]) : +m < r && (x.state = is, x.timer.stop(), x.on.call("cancel", t, t.__data__, x.index, x.group), delete s[m]);
      }
    if (Mp(function() {
      i.state === os && (i.state = Pp, i.timer.restart(p, i.delay, i.time), p(g));
    }), i.state = ec, i.on.call("start", t, t.__data__, i.index, i.group), i.state === ec) {
      for (i.state = os, a = new Array(y = i.tween.length), m = 0, w = -1; m < y; ++m)
        (x = i.tween[m].value.call(t, t.__data__, i.index, i.group)) && (a[++w] = x);
      a.length = w + 1;
    }
  }
  function p(g) {
    for (var m = g < i.duration ? i.ease.call(null, g / i.duration) : (i.timer.restart(h), i.state = tc, 1), w = -1, y = a.length; ++w < y; )
      a[w].call(t, m);
    i.state === tc && (i.on.call("end", t, t.__data__, i.index, i.group), h());
  }
  function h() {
    i.state = is, i.timer.stop(), delete s[r];
    for (var g in s) return;
    delete t.__transition;
  }
}
function ls(t, r) {
  var i = t.__transition, s, a, c = !0, f;
  if (i) {
    r = r == null ? null : r + "";
    for (f in i) {
      if ((s = i[f]).name !== r) {
        c = !1;
        continue;
      }
      a = s.state > ec && s.state < tc, s.state = is, s.timer.stop(), s.on.call(a ? "interrupt" : "cancel", t, t.__data__, s.index, s.group), delete i[f];
    }
    c && delete t.__transition;
  }
}
function Bw(t) {
  return this.each(function() {
    ls(this, t);
  });
}
function Uw(t, r) {
  var i, s;
  return function() {
    var a = on(this, t), c = a.tween;
    if (c !== i) {
      s = i = c;
      for (var f = 0, p = s.length; f < p; ++f)
        if (s[f].name === r) {
          s = s.slice(), s.splice(f, 1);
          break;
        }
    }
    a.tween = s;
  };
}
function Ww(t, r, i) {
  var s, a;
  if (typeof i != "function") throw new Error();
  return function() {
    var c = on(this, t), f = c.tween;
    if (f !== s) {
      a = (s = f).slice();
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
function Yw(t, r) {
  var i = this._id;
  if (t += "", arguments.length < 2) {
    for (var s = Yt(this.node(), i).tween, a = 0, c = s.length, f; a < c; ++a)
      if ((f = s[a]).name === t)
        return f.value;
    return null;
  }
  return this.each((r == null ? Uw : Ww)(i, t, r));
}
function wc(t, r, i) {
  var s = t._id;
  return t.each(function() {
    var a = on(this, s);
    (a.value || (a.value = {}))[r] = i.apply(this, arguments);
  }), function(a) {
    return Yt(a, s).value[r];
  };
}
function ag(t, r) {
  var i;
  return (typeof r == "number" ? tn : r instanceof wr ? cs : (i = wr(r)) ? (r = i, cs) : eg)(t, r);
}
function Xw(t) {
  return function() {
    this.removeAttribute(t);
  };
}
function Zw(t) {
  return function() {
    this.removeAttributeNS(t.space, t.local);
  };
}
function Qw(t, r, i) {
  var s, a = i + "", c;
  return function() {
    var f = this.getAttribute(t);
    return f === a ? null : f === s ? c : c = r(s = f, i);
  };
}
function Kw(t, r, i) {
  var s, a = i + "", c;
  return function() {
    var f = this.getAttributeNS(t.space, t.local);
    return f === a ? null : f === s ? c : c = r(s = f, i);
  };
}
function Gw(t, r, i) {
  var s, a, c;
  return function() {
    var f, p = i(this), h;
    return p == null ? void this.removeAttribute(t) : (f = this.getAttribute(t), h = p + "", f === h ? null : f === s && h === a ? c : (a = h, c = r(s = f, p)));
  };
}
function qw(t, r, i) {
  var s, a, c;
  return function() {
    var f, p = i(this), h;
    return p == null ? void this.removeAttributeNS(t.space, t.local) : (f = this.getAttributeNS(t.space, t.local), h = p + "", f === h ? null : f === s && h === a ? c : (a = h, c = r(s = f, p)));
  };
}
function Jw(t, r) {
  var i = xs(t), s = i === "transform" ? Tw : ag;
  return this.attrTween(t, typeof r == "function" ? (i.local ? qw : Gw)(i, s, wc(this, "attr." + t, r)) : r == null ? (i.local ? Zw : Xw)(i) : (i.local ? Kw : Qw)(i, s, r));
}
function ex(t, r) {
  return function(i) {
    this.setAttribute(t, r.call(this, i));
  };
}
function tx(t, r) {
  return function(i) {
    this.setAttributeNS(t.space, t.local, r.call(this, i));
  };
}
function nx(t, r) {
  var i, s;
  function a() {
    var c = r.apply(this, arguments);
    return c !== s && (i = (s = c) && tx(t, c)), i;
  }
  return a._value = r, a;
}
function rx(t, r) {
  var i, s;
  function a() {
    var c = r.apply(this, arguments);
    return c !== s && (i = (s = c) && ex(t, c)), i;
  }
  return a._value = r, a;
}
function ox(t, r) {
  var i = "attr." + t;
  if (arguments.length < 2) return (i = this.tween(i)) && i._value;
  if (r == null) return this.tween(i, null);
  if (typeof r != "function") throw new Error();
  var s = xs(t);
  return this.tween(i, (s.local ? nx : rx)(s, r));
}
function ix(t, r) {
  return function() {
    vc(this, t).delay = +r.apply(this, arguments);
  };
}
function lx(t, r) {
  return r = +r, function() {
    vc(this, t).delay = r;
  };
}
function sx(t) {
  var r = this._id;
  return arguments.length ? this.each((typeof t == "function" ? ix : lx)(r, t)) : Yt(this.node(), r).delay;
}
function ax(t, r) {
  return function() {
    on(this, t).duration = +r.apply(this, arguments);
  };
}
function ux(t, r) {
  return r = +r, function() {
    on(this, t).duration = r;
  };
}
function cx(t) {
  var r = this._id;
  return arguments.length ? this.each((typeof t == "function" ? ax : ux)(r, t)) : Yt(this.node(), r).duration;
}
function fx(t, r) {
  if (typeof r != "function") throw new Error();
  return function() {
    on(this, t).ease = r;
  };
}
function dx(t) {
  var r = this._id;
  return arguments.length ? this.each(fx(r, t)) : Yt(this.node(), r).ease;
}
function px(t, r) {
  return function() {
    var i = r.apply(this, arguments);
    if (typeof i != "function") throw new Error();
    on(this, t).ease = i;
  };
}
function hx(t) {
  if (typeof t != "function") throw new Error();
  return this.each(px(this._id, t));
}
function gx(t) {
  typeof t != "function" && (t = Ph(t));
  for (var r = this._groups, i = r.length, s = new Array(i), a = 0; a < i; ++a)
    for (var c = r[a], f = c.length, p = s[a] = [], h, g = 0; g < f; ++g)
      (h = c[g]) && t.call(h, h.__data__, g, c) && p.push(h);
  return new wn(s, this._parents, this._name, this._id);
}
function mx(t) {
  if (t._id !== this._id) throw new Error();
  for (var r = this._groups, i = t._groups, s = r.length, a = i.length, c = Math.min(s, a), f = new Array(s), p = 0; p < c; ++p)
    for (var h = r[p], g = i[p], m = h.length, w = f[p] = new Array(m), y, x = 0; x < m; ++x)
      (y = h[x] || g[x]) && (w[x] = y);
  for (; p < s; ++p)
    f[p] = r[p];
  return new wn(f, this._parents, this._name, this._id);
}
function yx(t) {
  return (t + "").trim().split(/^|\s+/).every(function(r) {
    var i = r.indexOf(".");
    return i >= 0 && (r = r.slice(0, i)), !r || r === "start";
  });
}
function vx(t, r, i) {
  var s, a, c = yx(r) ? vc : on;
  return function() {
    var f = c(this, t), p = f.on;
    p !== s && (a = (s = p).copy()).on(r, i), f.on = a;
  };
}
function wx(t, r) {
  var i = this._id;
  return arguments.length < 2 ? Yt(this.node(), i).on.on(t) : this.each(vx(i, t, r));
}
function xx(t) {
  return function() {
    var r = this.parentNode;
    for (var i in this.__transition) if (+i !== t) return;
    r && r.removeChild(this);
  };
}
function _x() {
  return this.on("end.remove", xx(this._id));
}
function Sx(t) {
  var r = this._name, i = this._id;
  typeof t != "function" && (t = ac(t));
  for (var s = this._groups, a = s.length, c = new Array(a), f = 0; f < a; ++f)
    for (var p = s[f], h = p.length, g = c[f] = new Array(h), m, w, y = 0; y < h; ++y)
      (m = p[y]) && (w = t.call(m, m.__data__, y, p)) && ("__data__" in m && (w.__data__ = m.__data__), g[y] = w, Es(g[y], r, i, y, g, Yt(m, i)));
  return new wn(c, this._parents, r, i);
}
function kx(t) {
  var r = this._name, i = this._id;
  typeof t != "function" && (t = zh(t));
  for (var s = this._groups, a = s.length, c = [], f = [], p = 0; p < a; ++p)
    for (var h = s[p], g = h.length, m, w = 0; w < g; ++w)
      if (m = h[w]) {
        for (var y = t.call(m, m.__data__, w, h), x, _ = Yt(m, i), M = 0, E = y.length; M < E; ++M)
          (x = y[M]) && Es(x, r, i, M, y, _);
        c.push(y), f.push(m);
      }
  return new wn(c, f, r, i);
}
var Ex = ki.prototype.constructor;
function Cx() {
  return new Ex(this._groups, this._parents);
}
function Nx(t, r) {
  var i, s, a;
  return function() {
    var c = so(this, t), f = (this.style.removeProperty(t), so(this, t));
    return c === f ? null : c === i && f === s ? a : a = r(i = c, s = f);
  };
}
function ug(t) {
  return function() {
    this.style.removeProperty(t);
  };
}
function Mx(t, r, i) {
  var s, a = i + "", c;
  return function() {
    var f = so(this, t);
    return f === a ? null : f === s ? c : c = r(s = f, i);
  };
}
function zx(t, r, i) {
  var s, a, c;
  return function() {
    var f = so(this, t), p = i(this), h = p + "";
    return p == null && (h = p = (this.style.removeProperty(t), so(this, t))), f === h ? null : f === s && h === a ? c : (a = h, c = r(s = f, p));
  };
}
function Px(t, r) {
  var i, s, a, c = "style." + r, f = "end." + c, p;
  return function() {
    var h = on(this, t), g = h.on, m = h.value[c] == null ? p || (p = ug(r)) : void 0;
    (g !== i || a !== m) && (s = (i = g).copy()).on(f, a = m), h.on = s;
  };
}
function Ix(t, r, i) {
  var s = (t += "") == "transform" ? Iw : ag;
  return r == null ? this.styleTween(t, Nx(t, s)).on("end.style." + t, ug(t)) : typeof r == "function" ? this.styleTween(t, zx(t, s, wc(this, "style." + t, r))).each(Px(this._id, t)) : this.styleTween(t, Mx(t, s, r), i).on("end.style." + t, null);
}
function Tx(t, r, i) {
  return function(s) {
    this.style.setProperty(t, r.call(this, s), i);
  };
}
function bx(t, r, i) {
  var s, a;
  function c() {
    var f = r.apply(this, arguments);
    return f !== a && (s = (a = f) && Tx(t, f, i)), s;
  }
  return c._value = r, c;
}
function Rx(t, r, i) {
  var s = "style." + (t += "");
  if (arguments.length < 2) return (s = this.tween(s)) && s._value;
  if (r == null) return this.tween(s, null);
  if (typeof r != "function") throw new Error();
  return this.tween(s, bx(t, r, i ?? ""));
}
function Dx(t) {
  return function() {
    this.textContent = t;
  };
}
function Lx(t) {
  return function() {
    var r = t(this);
    this.textContent = r ?? "";
  };
}
function Ax(t) {
  return this.tween("text", typeof t == "function" ? Lx(wc(this, "text", t)) : Dx(t == null ? "" : t + ""));
}
function $x(t) {
  return function(r) {
    this.textContent = t.call(this, r);
  };
}
function Ox(t) {
  var r, i;
  function s() {
    var a = t.apply(this, arguments);
    return a !== i && (r = (i = a) && $x(a)), r;
  }
  return s._value = t, s;
}
function Hx(t) {
  var r = "text";
  if (arguments.length < 1) return (r = this.tween(r)) && r._value;
  if (t == null) return this.tween(r, null);
  if (typeof t != "function") throw new Error();
  return this.tween(r, Ox(t));
}
function Fx() {
  for (var t = this._name, r = this._id, i = cg(), s = this._groups, a = s.length, c = 0; c < a; ++c)
    for (var f = s[c], p = f.length, h, g = 0; g < p; ++g)
      if (h = f[g]) {
        var m = Yt(h, r);
        Es(h, t, i, g, f, {
          time: m.time + m.delay + m.duration,
          delay: 0,
          duration: m.duration,
          ease: m.ease
        });
      }
  return new wn(s, this._parents, t, i);
}
function jx() {
  var t, r, i = this, s = i._id, a = i.size();
  return new Promise(function(c, f) {
    var p = { value: f }, h = { value: function() {
      --a === 0 && c();
    } };
    i.each(function() {
      var g = on(this, s), m = g.on;
      m !== t && (r = (t = m).copy(), r._.cancel.push(p), r._.interrupt.push(p), r._.end.push(h)), g.on = r;
    }), a === 0 && c();
  });
}
var Vx = 0;
function wn(t, r, i, s) {
  this._groups = t, this._parents = r, this._name = i, this._id = s;
}
function cg() {
  return ++Vx;
}
var mn = ki.prototype;
wn.prototype = {
  constructor: wn,
  select: Sx,
  selectAll: kx,
  selectChild: mn.selectChild,
  selectChildren: mn.selectChildren,
  filter: gx,
  merge: mx,
  selection: Cx,
  transition: Fx,
  call: mn.call,
  nodes: mn.nodes,
  node: mn.node,
  size: mn.size,
  empty: mn.empty,
  each: mn.each,
  on: wx,
  attr: Jw,
  attrTween: ox,
  style: Ix,
  styleTween: Rx,
  text: Ax,
  textTween: Hx,
  remove: _x,
  tween: Yw,
  delay: sx,
  duration: cx,
  ease: dx,
  easeVarying: hx,
  end: jx,
  [Symbol.iterator]: mn[Symbol.iterator]
};
var Bx = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: Hw
};
function Ux(t, r) {
  for (var i; !(i = t.__transition) || !(i = i[r]); )
    if (!(t = t.parentNode))
      throw new Error(`transition ${r} not found`);
  return i;
}
function Wx(t) {
  var r, i;
  t instanceof wn ? (r = t._id, t = t._name) : (r = cg(), (i = Bx).time = pc(), t = t == null ? null : t + "");
  for (var s = this._groups, a = s.length, c = 0; c < a; ++c)
    for (var f = s[c], p = f.length, h, g = 0; g < p; ++g)
      (h = f[g]) && Es(h, t, r, g, f, i || Ux(h, r));
  return new wn(s, this._parents, t, r);
}
ki.prototype.interrupt = Bw;
ki.prototype.transition = Wx;
var Gl = (t) => () => t;
function Yx(t, {
  sourceEvent: r,
  target: i,
  transform: s,
  dispatch: a
}) {
  Object.defineProperties(this, {
    type: { value: t, enumerable: !0, configurable: !0 },
    sourceEvent: { value: r, enumerable: !0, configurable: !0 },
    target: { value: i, enumerable: !0, configurable: !0 },
    transform: { value: s, enumerable: !0, configurable: !0 },
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
var Cs = new vn(1, 0, 0);
fg.prototype = vn.prototype;
function fg(t) {
  for (; !t.__zoom; ) if (!(t = t.parentNode)) return Cs;
  return t.__zoom;
}
function $u(t) {
  t.stopImmediatePropagation();
}
function ai(t) {
  t.preventDefault(), t.stopImmediatePropagation();
}
function Xx(t) {
  return (!t.ctrlKey || t.type === "wheel") && !t.button;
}
function Zx() {
  var t = this;
  return t instanceof SVGElement ? (t = t.ownerSVGElement || t, t.hasAttribute("viewBox") ? (t = t.viewBox.baseVal, [[t.x, t.y], [t.x + t.width, t.y + t.height]]) : [[0, 0], [t.width.baseVal.value, t.height.baseVal.value]]) : [[0, 0], [t.clientWidth, t.clientHeight]];
}
function Ip() {
  return this.__zoom || Cs;
}
function Qx(t) {
  return -t.deltaY * (t.deltaMode === 1 ? 0.05 : t.deltaMode ? 1 : 2e-3) * (t.ctrlKey ? 10 : 1);
}
function Kx() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function Gx(t, r, i) {
  var s = t.invertX(r[0][0]) - i[0][0], a = t.invertX(r[1][0]) - i[1][0], c = t.invertY(r[0][1]) - i[0][1], f = t.invertY(r[1][1]) - i[1][1];
  return t.translate(
    a > s ? (s + a) / 2 : Math.min(0, s) || Math.max(0, a),
    f > c ? (c + f) / 2 : Math.min(0, c) || Math.max(0, f)
  );
}
function dg() {
  var t = Xx, r = Zx, i = Gx, s = Qx, a = Kx, c = [0, 1 / 0], f = [[-1 / 0, -1 / 0], [1 / 0, 1 / 0]], p = 250, h = rs, g = ws("start", "zoom", "end"), m, w, y, x = 500, _ = 150, M = 0, E = 10;
  function C(N) {
    N.property("__zoom", Ip).on("wheel.zoom", Y, { passive: !1 }).on("mousedown.zoom", X).on("dblclick.zoom", J).filter(a).on("touchstart.zoom", q).on("touchmove.zoom", ee).on("touchend.zoom touchcancel.zoom", G).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  C.transform = function(N, H, F, j) {
    var R = N.selection ? N.selection() : N;
    R.property("__zoom", Ip), N !== R ? T(N, H, F, j) : R.interrupt().each(function() {
      I(this, arguments).event(j).start().zoom(null, typeof H == "function" ? H.apply(this, arguments) : H).end();
    });
  }, C.scaleBy = function(N, H, F, j) {
    C.scaleTo(N, function() {
      var R = this.__zoom.k, O = typeof H == "function" ? H.apply(this, arguments) : H;
      return R * O;
    }, F, j);
  }, C.scaleTo = function(N, H, F, j) {
    C.transform(N, function() {
      var R = r.apply(this, arguments), O = this.__zoom, V = F == null ? P(R) : typeof F == "function" ? F.apply(this, arguments) : F, k = O.invert(V), $ = typeof H == "function" ? H.apply(this, arguments) : H;
      return i(S(A(O, $), V, k), R, f);
    }, F, j);
  }, C.translateBy = function(N, H, F, j) {
    C.transform(N, function() {
      return i(this.__zoom.translate(
        typeof H == "function" ? H.apply(this, arguments) : H,
        typeof F == "function" ? F.apply(this, arguments) : F
      ), r.apply(this, arguments), f);
    }, null, j);
  }, C.translateTo = function(N, H, F, j, R) {
    C.transform(N, function() {
      var O = r.apply(this, arguments), V = this.__zoom, k = j == null ? P(O) : typeof j == "function" ? j.apply(this, arguments) : j;
      return i(Cs.translate(k[0], k[1]).scale(V.k).translate(
        typeof H == "function" ? -H.apply(this, arguments) : -H,
        typeof F == "function" ? -F.apply(this, arguments) : -F
      ), O, f);
    }, j, R);
  };
  function A(N, H) {
    return H = Math.max(c[0], Math.min(c[1], H)), H === N.k ? N : new vn(H, N.x, N.y);
  }
  function S(N, H, F) {
    var j = H[0] - F[0] * N.k, R = H[1] - F[1] * N.k;
    return j === N.x && R === N.y ? N : new vn(N.k, j, R);
  }
  function P(N) {
    return [(+N[0][0] + +N[1][0]) / 2, (+N[0][1] + +N[1][1]) / 2];
  }
  function T(N, H, F, j) {
    N.on("start.zoom", function() {
      I(this, arguments).event(j).start();
    }).on("interrupt.zoom end.zoom", function() {
      I(this, arguments).event(j).end();
    }).tween("zoom", function() {
      var R = this, O = arguments, V = I(R, O).event(j), k = r.apply(R, O), $ = F == null ? P(k) : typeof F == "function" ? F.apply(R, O) : F, ie = Math.max(k[1][0] - k[0][0], k[1][1] - k[0][1]), re = R.__zoom, ae = typeof H == "function" ? H.apply(R, O) : H, ce = h(re.invert($).concat(ie / re.k), ae.invert($).concat(ie / ae.k));
      return function(ue) {
        if (ue === 1) ue = ae;
        else {
          var Q = ce(ue), se = ie / Q[2];
          ue = new vn(se, $[0] - Q[0] * se, $[1] - Q[1] * se);
        }
        V.zoom(null, ue);
      };
    });
  }
  function I(N, H, F) {
    return !F && N.__zooming || new D(N, H);
  }
  function D(N, H) {
    this.that = N, this.args = H, this.active = 0, this.sourceEvent = null, this.extent = r.apply(N, H), this.taps = 0;
  }
  D.prototype = {
    event: function(N) {
      return N && (this.sourceEvent = N), this;
    },
    start: function() {
      return ++this.active === 1 && (this.that.__zooming = this, this.emit("start")), this;
    },
    zoom: function(N, H) {
      return this.mouse && N !== "mouse" && (this.mouse[1] = H.invert(this.mouse[0])), this.touch0 && N !== "touch" && (this.touch0[1] = H.invert(this.touch0[0])), this.touch1 && N !== "touch" && (this.touch1[1] = H.invert(this.touch1[0])), this.that.__zoom = H, this.emit("zoom"), this;
    },
    end: function() {
      return --this.active === 0 && (delete this.that.__zooming, this.emit("end")), this;
    },
    emit: function(N) {
      var H = kt(this.that).datum();
      g.call(
        N,
        this.that,
        new Yx(N, {
          sourceEvent: this.sourceEvent,
          target: C,
          transform: this.that.__zoom,
          dispatch: g
        }),
        H
      );
    }
  };
  function Y(N, ...H) {
    if (!t.apply(this, arguments)) return;
    var F = I(this, H).event(N), j = this.__zoom, R = Math.max(c[0], Math.min(c[1], j.k * Math.pow(2, s.apply(this, arguments)))), O = jt(N);
    if (F.wheel)
      (F.mouse[0][0] !== O[0] || F.mouse[0][1] !== O[1]) && (F.mouse[1] = j.invert(F.mouse[0] = O)), clearTimeout(F.wheel);
    else {
      if (j.k === R) return;
      F.mouse = [O, j.invert(O)], ls(this), F.start();
    }
    ai(N), F.wheel = setTimeout(V, _), F.zoom("mouse", i(S(A(j, R), F.mouse[0], F.mouse[1]), F.extent, f));
    function V() {
      F.wheel = null, F.end();
    }
  }
  function X(N, ...H) {
    if (y || !t.apply(this, arguments)) return;
    var F = N.currentTarget, j = I(this, H, !0).event(N), R = kt(N.view).on("mousemove.zoom", $, !0).on("mouseup.zoom", ie, !0), O = jt(N, F), V = N.clientX, k = N.clientY;
    Hh(N.view), $u(N), j.mouse = [O, this.__zoom.invert(O)], ls(this), j.start();
    function $(re) {
      if (ai(re), !j.moved) {
        var ae = re.clientX - V, ce = re.clientY - k;
        j.moved = ae * ae + ce * ce > M;
      }
      j.event(re).zoom("mouse", i(S(j.that.__zoom, j.mouse[0] = jt(re, F), j.mouse[1]), j.extent, f));
    }
    function ie(re) {
      R.on("mousemove.zoom mouseup.zoom", null), Fh(re.view, j.moved), ai(re), j.event(re).end();
    }
  }
  function J(N, ...H) {
    if (t.apply(this, arguments)) {
      var F = this.__zoom, j = jt(N.changedTouches ? N.changedTouches[0] : N, this), R = F.invert(j), O = F.k * (N.shiftKey ? 0.5 : 2), V = i(S(A(F, O), j, R), r.apply(this, H), f);
      ai(N), p > 0 ? kt(this).transition().duration(p).call(T, V, j, N) : kt(this).call(C.transform, V, j, N);
    }
  }
  function q(N, ...H) {
    if (t.apply(this, arguments)) {
      var F = N.touches, j = F.length, R = I(this, H, N.changedTouches.length === j).event(N), O, V, k, $;
      for ($u(N), V = 0; V < j; ++V)
        k = F[V], $ = jt(k, this), $ = [$, this.__zoom.invert($), k.identifier], R.touch0 ? !R.touch1 && R.touch0[2] !== $[2] && (R.touch1 = $, R.taps = 0) : (R.touch0 = $, O = !0, R.taps = 1 + !!m);
      m && (m = clearTimeout(m)), O && (R.taps < 2 && (w = $[0], m = setTimeout(function() {
        m = null;
      }, x)), ls(this), R.start());
    }
  }
  function ee(N, ...H) {
    if (this.__zooming) {
      var F = I(this, H).event(N), j = N.changedTouches, R = j.length, O, V, k, $;
      for (ai(N), O = 0; O < R; ++O)
        V = j[O], k = jt(V, this), F.touch0 && F.touch0[2] === V.identifier ? F.touch0[0] = k : F.touch1 && F.touch1[2] === V.identifier && (F.touch1[0] = k);
      if (V = F.that.__zoom, F.touch1) {
        var ie = F.touch0[0], re = F.touch0[1], ae = F.touch1[0], ce = F.touch1[1], ue = (ue = ae[0] - ie[0]) * ue + (ue = ae[1] - ie[1]) * ue, Q = (Q = ce[0] - re[0]) * Q + (Q = ce[1] - re[1]) * Q;
        V = A(V, Math.sqrt(ue / Q)), k = [(ie[0] + ae[0]) / 2, (ie[1] + ae[1]) / 2], $ = [(re[0] + ce[0]) / 2, (re[1] + ce[1]) / 2];
      } else if (F.touch0) k = F.touch0[0], $ = F.touch0[1];
      else return;
      F.zoom("touch", i(S(V, k, $), F.extent, f));
    }
  }
  function G(N, ...H) {
    if (this.__zooming) {
      var F = I(this, H).event(N), j = N.changedTouches, R = j.length, O, V;
      for ($u(N), y && clearTimeout(y), y = setTimeout(function() {
        y = null;
      }, x), O = 0; O < R; ++O)
        V = j[O], F.touch0 && F.touch0[2] === V.identifier ? delete F.touch0 : F.touch1 && F.touch1[2] === V.identifier && delete F.touch1;
      if (F.touch1 && !F.touch0 && (F.touch0 = F.touch1, delete F.touch1), F.touch0) F.touch0[1] = this.__zoom.invert(F.touch0[0]);
      else if (F.end(), F.taps === 2 && (V = jt(V, this), Math.hypot(w[0] - V[0], w[1] - V[1]) < E)) {
        var k = kt(this).on("dblclick.zoom");
        k && k.apply(this, arguments);
      }
    }
  }
  return C.wheelDelta = function(N) {
    return arguments.length ? (s = typeof N == "function" ? N : Gl(+N), C) : s;
  }, C.filter = function(N) {
    return arguments.length ? (t = typeof N == "function" ? N : Gl(!!N), C) : t;
  }, C.touchable = function(N) {
    return arguments.length ? (a = typeof N == "function" ? N : Gl(!!N), C) : a;
  }, C.extent = function(N) {
    return arguments.length ? (r = typeof N == "function" ? N : Gl([[+N[0][0], +N[0][1]], [+N[1][0], +N[1][1]]]), C) : r;
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
const Wt = {
  error001: (t = "react") => `Seems like you have not used ${t === "svelte" ? "SvelteFlowProvider" : "ReactFlowProvider"} as an ancestor. Help: https://${t}flow.dev/error#001`,
  error002: () => "It looks like you've created a new nodeTypes or edgeTypes object. If this wasn't on purpose please define the nodeTypes/edgeTypes outside of the component or memoize them.",
  error003: (t) => `Node type "${t}" not found. Using fallback type "default".`,
  error004: () => "The parent container needs a width and a height to render the graph.",
  error005: () => "Only child nodes can use a parent extent.",
  error006: () => "Can't create edge. An edge needs a source and a target.",
  error007: (t) => `The old edge with id=${t} does not exist.`,
  error009: (t) => `Marker type "${t}" doesn't exist.`,
  error008: (t, { id: r, sourceHandle: i, targetHandle: s }) => `Couldn't create edge for ${t} handle id: "${t === "source" ? i : s}", edge id: ${r}.`,
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
], pg = ["Enter", " ", "Escape"], hg = {
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
const gg = {
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
var gs;
(function(t) {
  t.Arrow = "arrow", t.ArrowClosed = "arrowclosed";
})(gs || (gs = {}));
var we;
(function(t) {
  t.Left = "left", t.Top = "top", t.Right = "right", t.Bottom = "bottom";
})(we || (we = {}));
const Tp = {
  [we.Left]: we.Right,
  [we.Right]: we.Left,
  [we.Top]: we.Bottom,
  [we.Bottom]: we.Top
}, mg = (t) => !!t && typeof t == "object" && "id" in t && "source" in t && "target" in t, qx = (t) => !!t && typeof t == "object" && "id" in t && "position" in t && !("source" in t) && !("target" in t), xc = (t) => !!t && typeof t == "object" && "id" in t && "internals" in t && !("source" in t) && !("target" in t), Ci = (t, r = [0, 0]) => {
  const { width: i, height: s } = Xt(t), a = t.origin ?? r, c = i * a[0], f = s * a[1];
  return {
    x: t.position.x - c,
    y: t.position.y - f
  };
}, Jx = (t, r = { nodeOrigin: [0, 0] }) => {
  if (t.length === 0)
    return { x: 0, y: 0, width: 0, height: 0 };
  let i = !1;
  const s = t.reduce((a, c) => {
    const f = typeof c == "string";
    let p = !r.nodeLookup && !f ? c : void 0;
    return r.nodeLookup && (p = f ? r.nodeLookup.get(c) : xc(c) ? c : r.nodeLookup.get(c.id)), p ? (i = !0, Ns(a, ms(p, r.nodeOrigin))) : a;
  }, { x: 1 / 0, y: 1 / 0, x2: -1 / 0, y2: -1 / 0 });
  return i ? Ms(s) : { x: 0, y: 0, width: 0, height: 0 };
}, Ni = (t, r = {}) => {
  let i = { x: 1 / 0, y: 1 / 0, x2: -1 / 0, y2: -1 / 0 }, s = !1;
  return t.forEach((a) => {
    (r.filter === void 0 || r.filter(a)) && (i = Ns(i, ms(a)), s = !0);
  }), s ? Ms(i) : { x: 0, y: 0, width: 0, height: 0 };
}, _c = (t, r, [i, s, a] = [0, 0, 1], c = !1, f = !1) => {
  const p = (r.x - i) / a, h = (r.y - s) / a, g = r.width / a, m = r.height / a, w = [];
  for (const y of t.values()) {
    const { measured: x, selectable: _ = !0, hidden: M = !1 } = y;
    if (f && !_ || M)
      continue;
    const E = x.width ?? y.width ?? y.initialWidth ?? 0, C = x.height ?? y.height ?? y.initialHeight ?? 0, { x: A, y: S } = y.internals.positionAbsolute, P = xg(p, h, g, m, A, S, E, C), T = E * C, I = c && P > 0;
    (!y.internals.handleBounds || I || P >= T || y.dragging) && w.push(y);
  }
  return w;
}, e1 = (t, r) => {
  const i = /* @__PURE__ */ new Set();
  return t.forEach((s) => {
    i.add(s.id);
  }), r.filter((s) => i.has(s.source) || i.has(s.target));
};
function t1(t, r) {
  const i = /* @__PURE__ */ new Map(), s = r?.nodes ? new Set(r.nodes.map((a) => a.id)) : null;
  return t.forEach((a) => {
    let c;
    if (r?.includeHiddenNodes) {
      const { width: f, height: p } = Xt(a);
      c = f > 0 && p > 0;
    } else
      c = !!(a.measured.width && a.measured.height && !a.hidden);
    c && (!s || s.has(a.id)) && i.set(a.id, a);
  }), i;
}
async function n1({ nodes: t, width: r, height: i, panZoom: s, minZoom: a, maxZoom: c }, f) {
  if (t.size === 0)
    return !0;
  const p = t1(t, f), h = Ni(p), g = kc(h, r, i, f?.minZoom ?? a, f?.maxZoom ?? c, f?.padding ?? 0.1);
  return await s.setViewport(g, {
    duration: f?.duration,
    ease: f?.ease,
    interpolate: f?.interpolate
  }), !0;
}
function yg({ nodeId: t, nextPosition: r, nodeLookup: i, nodeOrigin: s = [0, 0], nodeExtent: a, onError: c }) {
  const f = i.get(t), p = f.parentId ? i.get(f.parentId) : void 0, { x: h, y: g } = p ? p.internals.positionAbsolute : { x: 0, y: 0 }, m = f.origin ?? s;
  let w = f.extent || a;
  if (f.extent === "parent" && !f.expandParent)
    if (!p)
      c?.("005", Wt.error005());
    else {
      const { width: x, height: _ } = Xt(p);
      x && _ && (w = [
        [h, g],
        [h + x, g + _]
      ]);
    }
  else p && Sr(f.extent) && (w = [
    [f.extent[0][0] + h, f.extent[0][1] + g],
    [f.extent[1][0] + h, f.extent[1][1] + g]
  ]);
  const y = Sr(w) ? _r(r, w, f.measured) : r;
  return (f.measured.width === void 0 || f.measured.height === void 0) && c?.("015", Wt.error015()), {
    position: {
      x: y.x - h + (f.measured.width ?? 0) * m[0],
      y: y.y - g + (f.measured.height ?? 0) * m[1]
    },
    positionAbsolute: y
  };
}
async function r1({ nodesToRemove: t = [], edgesToRemove: r = [], nodes: i, edges: s, onBeforeDelete: a }) {
  const c = new Set(t.map((y) => y.id)), f = [];
  for (const y of i) {
    if (y.deletable === !1)
      continue;
    const x = c.has(y.id), _ = !x && y.parentId && f.find((M) => M.id === y.parentId);
    (x || _) && f.push(y);
  }
  const p = new Set(r.map((y) => y.id)), h = s.filter((y) => y.deletable !== !1), m = e1(f, h);
  for (const y of h)
    p.has(y.id) && !m.find((_) => _.id === y.id) && m.push(y);
  if (!a)
    return {
      edges: m,
      nodes: f
    };
  const w = await a({
    nodes: f,
    edges: m
  });
  return typeof w == "boolean" ? w ? { edges: m, nodes: f } : { edges: [], nodes: [] } : w;
}
const po = (t, r = 0, i = 1) => Math.min(Math.max(t, r), i), _r = (t = { x: 0, y: 0 }, r, i) => ({
  x: po(t.x, r[0][0], r[1][0] - (i?.width ?? 0)),
  y: po(t.y, r[0][1], r[1][1] - (i?.height ?? 0))
});
function vg(t, r, i) {
  const { width: s, height: a } = Xt(i), { x: c, y: f } = i.internals.positionAbsolute;
  return _r(t, [
    [c, f],
    [c + s, f + a]
  ], r);
}
const bp = (t, r, i) => t < r ? po(Math.abs(t - r), 1, r) / r : t > i ? -po(Math.abs(t - i), 1, r) / r : 0, Sc = (t, r, i = 15, s = 40) => {
  const a = bp(t.x, s, r.width - s) * i, c = bp(t.y, s, r.height - s) * i;
  return [a, c];
}, Ns = (t, r) => ({
  x: Math.min(t.x, r.x),
  y: Math.min(t.y, r.y),
  x2: Math.max(t.x2, r.x2),
  y2: Math.max(t.y2, r.y2)
}), nc = ({ x: t, y: r, width: i, height: s }) => ({
  x: t,
  y: r,
  x2: t + i,
  y2: r + s
}), Ms = ({ x: t, y: r, x2: i, y2: s }) => ({
  x: t,
  y: r,
  width: i - t,
  height: s - r
}), wi = (t, r = [0, 0]) => {
  const { x: i, y: s } = xc(t) ? t.internals.positionAbsolute : Ci(t, r);
  return {
    x: i,
    y: s,
    width: t.measured?.width ?? t.width ?? t.initialWidth ?? 0,
    height: t.measured?.height ?? t.height ?? t.initialHeight ?? 0
  };
}, ms = (t, r = [0, 0]) => {
  const { x: i, y: s } = xc(t) ? t.internals.positionAbsolute : Ci(t, r);
  return {
    x: i,
    y: s,
    x2: i + (t.measured?.width ?? t.width ?? t.initialWidth ?? 0),
    y2: s + (t.measured?.height ?? t.height ?? t.initialHeight ?? 0)
  };
}, wg = (t, r) => Ms(Ns(nc(t), nc(r))), xg = (t, r, i, s, a, c, f, p) => {
  const h = Math.max(0, Math.min(t + i, a + f) - Math.max(t, a)), g = Math.max(0, Math.min(r + s, c + p) - Math.max(r, c));
  return Math.ceil(h * g);
}, ys = (t, r) => xg(t.x, t.y, t.width, t.height, r.x, r.y, r.width, r.height), Rp = (t) => Bt(t.width) && Bt(t.height) && Bt(t.x) && Bt(t.y), Bt = (t) => !isNaN(t) && isFinite(t), _g = (t, r) => (i, s) => {
}, Mi = (t, r = [1, 1]) => ({
  x: r[0] * Math.round(t.x / r[0]),
  y: r[1] * Math.round(t.y / r[1])
}), zi = ({ x: t, y: r }, [i, s, a], c = !1, f = [1, 1]) => {
  const p = {
    x: (t - i) / a,
    y: (r - s) / a
  };
  return c ? Mi(p, f) : p;
}, ho = ({ x: t, y: r }, [i, s, a]) => ({
  x: t * a + i,
  y: r * a + s
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
function o1(t, r, i) {
  if (typeof t == "string" || typeof t == "number") {
    const s = to(t, i), a = to(t, r);
    return {
      top: s,
      right: a,
      bottom: s,
      left: a,
      x: a * 2,
      y: s * 2
    };
  }
  if (typeof t == "object") {
    const s = to(t.top ?? t.y ?? 0, i), a = to(t.bottom ?? t.y ?? 0, i), c = to(t.left ?? t.x ?? 0, r), f = to(t.right ?? t.x ?? 0, r);
    return { top: s, right: f, bottom: a, left: c, x: c + f, y: s + a };
  }
  return { top: 0, right: 0, bottom: 0, left: 0, x: 0, y: 0 };
}
function i1(t, r, i, s, a, c) {
  const { x: f, y: p } = ho(t, [r, i, s]), { x: h, y: g } = ho({ x: t.x + t.width, y: t.y + t.height }, [r, i, s]), m = a - h, w = c - g;
  return {
    left: Math.floor(f),
    top: Math.floor(p),
    right: Math.floor(m),
    bottom: Math.floor(w)
  };
}
const kc = (t, r, i, s, a, c) => {
  const f = o1(c, r, i), p = (r - f.x) / t.width, h = (i - f.y) / t.height, g = Math.min(p, h), m = po(g, s, a), w = t.x + t.width / 2, y = t.y + t.height / 2, x = r / 2 - w * m, _ = i / 2 - y * m, M = i1(t, x, _, m, r, i), E = {
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
function Sg(t) {
  return (t.measured?.width ?? t.width ?? t.initialWidth) !== void 0 && (t.measured?.height ?? t.height ?? t.initialHeight) !== void 0;
}
function kg(t, r = { width: 0, height: 0 }, i, s, a) {
  const c = { ...t }, f = s.get(i);
  if (f) {
    const p = f.origin || a;
    c.x += f.internals.positionAbsolute.x - (r.width ?? 0) * p[0], c.y += f.internals.positionAbsolute.y - (r.height ?? 0) * p[1];
  }
  return c;
}
function Dp(t, r) {
  if (t.size !== r.size)
    return !1;
  for (const i of t)
    if (!r.has(i))
      return !1;
  return !0;
}
function l1() {
  let t, r;
  return { promise: new Promise((s, a) => {
    t = s, r = a;
  }), resolve: t, reject: r };
}
function s1(t) {
  return { ...hg, ...t || {} };
}
function Eg(t) {
  return t === null ? null : t ? "valid" : "invalid";
}
function di(t, { snapGrid: r = [0, 0], snapToGrid: i = !1, transform: s, containerBounds: a }) {
  const { x: c, y: f } = Ut(t), p = zi({ x: c - (a?.left ?? 0), y: f - (a?.top ?? 0) }, s), { x: h, y: g } = i ? Mi(p, r) : p;
  return {
    xSnapped: h,
    ySnapped: g,
    ...p
  };
}
const Ec = (t) => ({
  width: t.offsetWidth,
  height: t.offsetHeight
}), Cg = (t) => t?.getRootNode?.() || window?.document, a1 = ["INPUT", "SELECT", "TEXTAREA"];
function Ng(t) {
  const r = t.composedPath?.()?.[0] || t.target;
  return r?.nodeType !== 1 ? !1 : a1.includes(r.nodeName) || r.hasAttribute("contenteditable") || !!r.closest(".nokey");
}
const Mg = (t) => "clientX" in t, Ut = (t, r) => {
  const i = Mg(t), s = i ? t.clientX : t.touches?.[0].clientX, a = i ? t.clientY : t.touches?.[0].clientY;
  return {
    x: s - (r?.left ?? 0),
    y: a - (r?.top ?? 0)
  };
}, Lp = (t, r, i, s, a) => {
  const c = r.querySelectorAll(`.${t}`);
  return !c || !c.length ? null : Array.from(c).map((f) => {
    const p = f.getBoundingClientRect();
    return {
      id: f.getAttribute("data-handleid"),
      type: t,
      nodeId: a,
      position: f.getAttribute("data-handlepos"),
      x: (p.left - i.left) / s,
      y: (p.top - i.top) / s,
      ...Ec(f)
    };
  });
};
function zg({ sourceX: t, sourceY: r, targetX: i, targetY: s, sourceControlX: a, sourceControlY: c, targetControlX: f, targetControlY: p }) {
  const h = t * 0.125 + a * 0.375 + f * 0.375 + i * 0.125, g = r * 0.125 + c * 0.375 + p * 0.375 + s * 0.125, m = Math.abs(h - t), w = Math.abs(g - r);
  return [h, g, m, w];
}
function ql(t, r) {
  return t >= 0 ? 0.5 * t : r * 25 * Math.sqrt(-t);
}
function Ap({ pos: t, x1: r, y1: i, x2: s, y2: a, c }) {
  switch (t) {
    case we.Left:
      return [r - ql(r - s, c), i];
    case we.Right:
      return [r + ql(s - r, c), i];
    case we.Top:
      return [r, i - ql(i - a, c)];
    case we.Bottom:
      return [r, i + ql(a - i, c)];
  }
}
function Pg({ sourceX: t, sourceY: r, sourcePosition: i = we.Bottom, targetX: s, targetY: a, targetPosition: c = we.Top, curvature: f = 0.25 }) {
  const [p, h] = Ap({
    pos: i,
    x1: t,
    y1: r,
    x2: s,
    y2: a,
    c: f
  }), [g, m] = Ap({
    pos: c,
    x1: s,
    y1: a,
    x2: t,
    y2: r,
    c: f
  }), [w, y, x, _] = zg({
    sourceX: t,
    sourceY: r,
    targetX: s,
    targetY: a,
    sourceControlX: p,
    sourceControlY: h,
    targetControlX: g,
    targetControlY: m
  });
  return [
    `M${t},${r} C${p},${h} ${g},${m} ${s},${a}`,
    w,
    y,
    x,
    _
  ];
}
function Ig({ sourceX: t, sourceY: r, targetX: i, targetY: s }) {
  const a = Math.abs(i - t) / 2, c = i < t ? i + a : i - a, f = Math.abs(s - r) / 2, p = s < r ? s + f : s - f;
  return [c, p, a, f];
}
function u1({ sourceNode: t, targetNode: r, selected: i = !1, zIndex: s = 0, elevateOnSelect: a = !1, zIndexMode: c = "basic" }) {
  if (c === "manual")
    return s;
  const f = a && i ? s + 1e3 : s, p = Math.max(t.parentId || a && t.selected ? t.internals.z : 0, r.parentId || a && r.selected ? r.internals.z : 0);
  return f + p;
}
function c1({ sourceNode: t, targetNode: r, width: i, height: s, transform: a }) {
  const c = Ns(ms(t), ms(r));
  c.x === c.x2 && (c.x2 += 1), c.y === c.y2 && (c.y2 += 1);
  const f = {
    x: -a[0] / a[2],
    y: -a[1] / a[2],
    width: i / a[2],
    height: s / a[2]
  };
  return ys(f, Ms(c)) > 0;
}
const f1 = ({ source: t, sourceHandle: r, target: i, targetHandle: s }) => `xy-edge__${t}${r || ""}-${i}${s || ""}`, d1 = (t, r) => r.some((i) => i.source === t.source && i.target === t.target && (i.sourceHandle === t.sourceHandle || !i.sourceHandle && !t.sourceHandle) && (i.targetHandle === t.targetHandle || !i.targetHandle && !t.targetHandle)), p1 = (t, r, i = {}) => {
  if (!t.source || !t.target)
    return i.onError?.("006", Wt.error006()), r;
  const s = i.getEdgeId || f1;
  let a;
  return mg(t) ? a = { ...t } : a = {
    ...t,
    id: s(t)
  }, d1(a, r) ? r : (a.sourceHandle === null && delete a.sourceHandle, a.targetHandle === null && delete a.targetHandle, r.concat(a));
};
function Tg({ sourceX: t, sourceY: r, targetX: i, targetY: s }) {
  const [a, c, f, p] = Ig({
    sourceX: t,
    sourceY: r,
    targetX: i,
    targetY: s
  });
  return [`M ${t},${r}L ${i},${s}`, a, c, f, p];
}
const $p = {
  [we.Left]: { x: -1, y: 0 },
  [we.Right]: { x: 1, y: 0 },
  [we.Top]: { x: 0, y: -1 },
  [we.Bottom]: { x: 0, y: 1 }
}, h1 = ({ source: t, sourcePosition: r = we.Bottom, target: i }) => r === we.Left || r === we.Right ? t.x < i.x ? { x: 1, y: 0 } : { x: -1, y: 0 } : t.y < i.y ? { x: 0, y: 1 } : { x: 0, y: -1 }, Op = (t, r) => Math.sqrt(Math.pow(r.x - t.x, 2) + Math.pow(r.y - t.y, 2)), g1 = (t, r, i) => t.x === r.x && r.x === i.x && (r.y - t.y) * (i.y - r.y) >= 0 || t.y === r.y && r.y === i.y && (r.x - t.x) * (i.x - r.x) >= 0;
function m1({ source: t, sourcePosition: r = we.Bottom, target: i, targetPosition: s = we.Top, center: a, offset: c, stepPosition: f }) {
  const p = $p[r], h = $p[s], g = { x: t.x + p.x * c, y: t.y + p.y * c }, m = { x: i.x + h.x * c, y: i.y + h.y * c }, w = h1({
    source: g,
    sourcePosition: r,
    target: m
  }), y = w.x !== 0 ? "x" : "y", x = w[y];
  let _ = [], M, E;
  const C = { x: 0, y: 0 }, A = { x: 0, y: 0 }, [, , S, P] = Ig({
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
    ], X = [
      { x: g.x, y: E },
      { x: m.x, y: E }
    ];
    p[y] === x ? _ = y === "x" ? Y : X : _ = y === "x" ? X : Y;
  } else {
    const Y = [{ x: g.x, y: m.y }], X = [{ x: m.x, y: g.y }];
    if (y === "x" ? _ = p.x === x ? X : Y : _ = p.y === x ? Y : X, r === s) {
      const N = Math.abs(t[y] - i[y]);
      if (N <= c) {
        const H = Math.min(c - 1, c - N);
        p[y] === x ? C[y] = (g[y] > t[y] ? -1 : 1) * H : A[y] = (m[y] > i[y] ? -1 : 1) * H;
      }
    }
    if (r !== s) {
      const N = y === "x" ? "y" : "x", H = p[y] === h[N], F = g[N] > m[N], j = g[N] < m[N];
      (p[y] === 1 && (!H && F || H && j) || p[y] !== 1 && (!H && j || H && F)) && (_ = y === "x" ? Y : X);
    }
    const J = { x: g.x + C.x, y: g.y + C.y }, q = { x: m.x + A.x, y: m.y + A.y }, ee = Math.max(Math.abs(J.x - _[0].x), Math.abs(q.x - _[0].x)), G = Math.max(Math.abs(J.y - _[0].y), Math.abs(q.y - _[0].y));
    ee >= G ? (M = (J.x + q.x) / 2, E = _[0].y) : (M = _[0].x, E = (J.y + q.y) / 2);
  }
  const T = { x: g.x + C.x, y: g.y + C.y }, I = { x: m.x + A.x, y: m.y + A.y }, D = [];
  for (const Y of [t, T, ..._, I, i]) {
    const [X, J] = D.slice(-2);
    J && g1(X, J, Y) && D.pop(), D.push(Y);
  }
  return [D, M, E, S, P];
}
function y1(t, r, i, s) {
  const a = Math.min(Op(t, r) / 2, Op(r, i) / 2, s), { x: c, y: f } = r;
  if (t.x === c && c === i.x || t.y === f && f === i.y)
    return `L${c} ${f}`;
  if (t.y === f) {
    const g = t.x < i.x ? -1 : 1, m = t.y < i.y ? 1 : -1;
    return `L ${c + a * g},${f}Q ${c},${f} ${c},${f + a * m}`;
  }
  const p = t.x < i.x ? 1 : -1, h = t.y < i.y ? -1 : 1;
  return `L ${c},${f + a * h}Q ${c},${f} ${c + a * p},${f}`;
}
function rc({ sourceX: t, sourceY: r, sourcePosition: i = we.Bottom, targetX: s, targetY: a, targetPosition: c = we.Top, borderRadius: f = 5, centerX: p, centerY: h, offset: g = 20, stepPosition: m = 0.5 }) {
  const [w, y, x, _, M] = m1({
    source: { x: t, y: r },
    sourcePosition: i,
    target: { x: s, y: a },
    targetPosition: c,
    center: { x: p, y: h },
    offset: g,
    stepPosition: m
  });
  let E = `M${w[0].x} ${w[0].y}`;
  for (let C = 1; C < w.length - 1; C++)
    E += y1(w[C - 1], w[C], w[C + 1], f);
  return E += `L${w[w.length - 1].x} ${w[w.length - 1].y}`, [E, y, x, _, M];
}
function Hp(t) {
  return t && !!(t.internals.handleBounds || t.handles?.length) && !!(t.measured.width || t.width || t.initialWidth);
}
function v1(t) {
  const { sourceNode: r, targetNode: i } = t;
  if (!Hp(r) || !Hp(i))
    return null;
  const s = r.internals.handleBounds || Fp(r.handles), a = i.internals.handleBounds || Fp(i.handles), c = jp(s?.source ?? [], t.sourceHandle), f = jp(
    // when connection type is loose we can define all handles as sources and connect source -> source
    t.connectionMode === fo.Strict ? a?.target ?? [] : (a?.target ?? []).concat(a?.source ?? []),
    t.targetHandle
  );
  if (!c || !f)
    return t.onError?.("008", Wt.error008(c ? "target" : "source", {
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
function Fp(t) {
  if (!t)
    return null;
  const r = [], i = [];
  for (const s of t)
    s.width = s.width ?? 1, s.height = s.height ?? 1, s.type === "source" ? r.push(s) : s.type === "target" && i.push(s);
  return {
    source: r,
    target: i
  };
}
function kr(t, r, i = we.Left, s = !1) {
  const a = (r?.x ?? 0) + t.internals.positionAbsolute.x, c = (r?.y ?? 0) + t.internals.positionAbsolute.y, { width: f, height: p } = r ?? Xt(t);
  if (s)
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
function jp(t, r) {
  return t && (r ? t.find((i) => i.id === r) : t[0]) || null;
}
function oc(t, r) {
  return t ? typeof t == "string" ? t : `${r ? `${r}__` : ""}${Object.keys(t).sort().map((s) => `${s}=${t[s]}`).join("&")}` : "";
}
function w1(t, { id: r, defaultColor: i, defaultMarkerStart: s, defaultMarkerEnd: a }) {
  const c = /* @__PURE__ */ new Set();
  return t.reduce((f, p) => ([p.markerStart || s, p.markerEnd || a].forEach((h) => {
    if (h && typeof h == "object") {
      const g = oc(h, r);
      c.has(g) || (f.push({ id: g, color: h.color || i, ...h }), c.add(g));
    }
  }), f), []).sort((f, p) => f.id.localeCompare(p.id));
}
const bg = 1e3, x1 = 10, Cc = {
  nodeOrigin: [0, 0],
  nodeExtent: yi,
  elevateNodesOnSelect: !0,
  zIndexMode: "basic",
  defaults: {}
}, _1 = {
  ...Cc,
  checkEquality: !0
};
function Nc(t, r) {
  const i = { ...t };
  for (const s in r)
    r[s] !== void 0 && (i[s] = r[s]);
  return i;
}
function S1(t, r, i) {
  const s = Nc(Cc, i);
  for (const a of t.values())
    if (a.parentId)
      zc(a, t, r, s);
    else {
      const c = Ci(a, s.nodeOrigin), f = Sr(a.extent) ? a.extent : s.nodeExtent, p = _r(c, f, Xt(a));
      a.internals.positionAbsolute = p;
    }
}
function k1(t, r) {
  if (!t.handles)
    return t.measured ? r?.internals.handleBounds : void 0;
  const i = [], s = [];
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
    a.type === "source" ? i.push(c) : a.type === "target" && s.push(c);
  }
  return {
    source: i,
    target: s
  };
}
function Mc(t) {
  return t === "manual";
}
function ic(t, r, i, s = {}) {
  const a = Nc(_1, s), c = { i: 0 }, f = new Map(r), p = a?.elevateNodesOnSelect && !Mc(a.zIndexMode) ? bg : 0;
  let h = t.length > 0, g = !1;
  r.clear(), i.clear();
  for (const m of t) {
    let w = f.get(m.id);
    if (a.checkEquality && m === w?.internals.userNode)
      r.set(m.id, w);
    else {
      const y = Ci(m, a.nodeOrigin), x = Sr(m.extent) ? m.extent : a.nodeExtent, _ = _r(y, x, Xt(m));
      w = {
        ...a.defaults,
        ...m,
        measured: {
          width: m.measured?.width,
          height: m.measured?.height
        },
        internals: {
          positionAbsolute: _,
          // if user re-initializes the node or removes `measured` for whatever reason, we reset the handleBounds so that the node gets re-measured
          handleBounds: k1(m, w),
          z: Rg(m, p, a.zIndexMode),
          userNode: m
        }
      }, r.set(m.id, w);
    }
    (w.measured === void 0 || w.measured.width === void 0 || w.measured.height === void 0) && !w.hidden && (h = !1), m.parentId && zc(w, r, i, s, c), g ||= m.selected ?? !1;
  }
  return { nodesInitialized: h, hasSelectedNodes: g };
}
function E1(t, r) {
  if (!t.parentId)
    return;
  const i = r.get(t.parentId);
  i ? i.set(t.id, t) : r.set(t.parentId, /* @__PURE__ */ new Map([[t.id, t]]));
}
function zc(t, r, i, s, a) {
  const { elevateNodesOnSelect: c, nodeOrigin: f, nodeExtent: p, zIndexMode: h } = Nc(Cc, s), g = t.parentId, m = r.get(g);
  if (!m) {
    console.warn(`Parent node ${g} not found. Please make sure that parent nodes are in front of their child nodes in the nodes array.`);
    return;
  }
  E1(t, i), a && !m.parentId && m.internals.rootParentIndex === void 0 && h === "auto" && (m.internals.rootParentIndex = ++a.i, m.internals.z = m.internals.z + a.i * x1), a && m.internals.rootParentIndex !== void 0 && (a.i = m.internals.rootParentIndex);
  const w = c && !Mc(h) ? bg : 0, { x: y, y: x, z: _ } = C1(t, m, f, p, w, h), { positionAbsolute: M } = t.internals, E = y !== M.x || x !== M.y;
  (E || _ !== t.internals.z) && r.set(t.id, {
    ...t,
    internals: {
      ...t.internals,
      positionAbsolute: E ? { x: y, y: x } : M,
      z: _
    }
  });
}
function Rg(t, r, i) {
  const s = Bt(t.zIndex) ? t.zIndex : 0;
  return Mc(i) ? s : s + (t.selected ? r : 0);
}
function C1(t, r, i, s, a, c) {
  const { x: f, y: p } = r.internals.positionAbsolute, h = Xt(t), g = Ci(t, i), m = Sr(t.extent) ? _r(g, t.extent, h) : g;
  let w = _r({ x: f + m.x, y: p + m.y }, s, h);
  t.extent === "parent" && (w = vg(w, h, r));
  const y = Rg(t, a, c), x = r.internals.z ?? 0;
  return {
    x: w.x,
    y: w.y,
    z: x >= y ? x + 1 : y
  };
}
function Pc(t, r, i, s = [0, 0]) {
  const a = [], c = /* @__PURE__ */ new Map();
  for (const f of t) {
    const p = r.get(f.parentId);
    if (!p)
      continue;
    const h = c.get(f.parentId)?.expandedRect ?? wi(p), g = wg(h, f.rect);
    c.set(f.parentId, { expandedRect: g, parent: p });
  }
  return c.size > 0 && c.forEach(({ expandedRect: f, parent: p }, h) => {
    const g = p.internals.positionAbsolute, m = Xt(p), w = p.origin ?? s, y = f.x < g.x ? Math.round(Math.abs(g.x - f.x)) : 0, x = f.y < g.y ? Math.round(Math.abs(g.y - f.y)) : 0, _ = Math.max(m.width, Math.round(f.width)), M = Math.max(m.height, Math.round(f.height)), E = (_ - m.width) * w[0], C = (M - m.height) * w[1];
    (y > 0 || x > 0 || E || C) && (a.push({
      id: h,
      type: "position",
      position: {
        x: p.position.x - y + E,
        y: p.position.y - x + C
      }
    }), i.get(h)?.forEach((A) => {
      t.some((S) => S.id === A.id) || a.push({
        id: A.id,
        type: "position",
        position: {
          x: A.position.x + y,
          y: A.position.y + x
        }
      });
    })), (m.width < f.width || m.height < f.height || y || x) && a.push({
      id: h,
      type: "dimensions",
      setAttributes: !0,
      dimensions: {
        width: _ + (y ? w[0] * y - E : 0),
        height: M + (x ? w[1] * x - C : 0)
      }
    });
  }), a;
}
function N1(t, r, i, s, a, c, f) {
  const p = s?.querySelector(".xyflow__viewport");
  let h = !1;
  if (!p)
    return { changes: [], updatedInternals: h };
  const g = [], m = window.getComputedStyle(p), { m22: w } = new window.DOMMatrixReadOnly(m.transform), y = [];
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
    const M = Ec(x.nodeElement), E = _.measured.width !== M.width || _.measured.height !== M.height;
    if (!!(M.width && M.height && (E || !_.internals.handleBounds || x.force))) {
      const A = x.nodeElement.getBoundingClientRect(), S = Sr(_.extent) ? _.extent : c;
      let { positionAbsolute: P } = _.internals;
      if (_.parentId && _.extent === "parent") {
        const I = r.get(_.parentId);
        I && (P = vg(P, M, I));
      } else S && (P = _r(P, S, M));
      const T = {
        ..._,
        measured: M,
        internals: {
          ..._.internals,
          positionAbsolute: P,
          handleBounds: {
            source: Lp("source", x.nodeElement, A, w, _.id),
            target: Lp("target", x.nodeElement, A, w, _.id)
          }
        }
      };
      r.set(_.id, T), _.parentId && zc(T, r, i, { nodeOrigin: a, zIndexMode: f }), h = !0, E && (g.push({
        id: _.id,
        type: "dimensions",
        dimensions: M
      }), _.expandParent && _.parentId && y.push({
        id: _.id,
        parentId: _.parentId,
        rect: wi(T, a)
      }));
    }
  }
  if (y.length > 0) {
    const x = Pc(y, r, i, a);
    g.push(...x);
  }
  return { changes: g, updatedInternals: h };
}
async function M1({ delta: t, panZoom: r, transform: i, translateExtent: s, width: a, height: c }) {
  if (!r || !t.x && !t.y)
    return !1;
  const f = await r.setViewportConstrained({
    x: i[0] + t.x,
    y: i[1] + t.y,
    zoom: i[2]
  }, [
    [0, 0],
    [a, c]
  ], s);
  return !!f && (f.x !== i[0] || f.y !== i[1] || f.k !== i[2]);
}
function Vp(t, r, i, s, a, c) {
  let f = a;
  const p = s.get(f) || /* @__PURE__ */ new Map();
  s.set(f, p.set(i, r)), f = `${a}-${t}`;
  const h = s.get(f) || /* @__PURE__ */ new Map();
  if (s.set(f, h.set(i, r)), c) {
    f = `${a}-${t}-${c}`;
    const g = s.get(f) || /* @__PURE__ */ new Map();
    s.set(f, g.set(i, r));
  }
}
function Dg(t, r, i) {
  t.clear(), r.clear();
  for (const s of i) {
    const { source: a, target: c, sourceHandle: f = null, targetHandle: p = null } = s, h = { edgeId: s.id, source: a, target: c, sourceHandle: f, targetHandle: p }, g = `${a}-${f}--${c}-${p}`, m = `${c}-${p}--${a}-${f}`;
    Vp("source", h, m, t, a, f), Vp("target", h, g, t, c, p), r.set(s.id, s);
  }
}
function Lg(t, r) {
  if (!t.parentId)
    return !1;
  const i = r.get(t.parentId);
  return i ? i.selected ? !0 : Lg(i, r) : !1;
}
function Bp(t, r, i) {
  let s = t;
  do {
    if (s?.matches?.(r))
      return !0;
    if (s === i)
      return !1;
    s = s?.parentElement;
  } while (s);
  return !1;
}
function z1(t, r, i, s, a) {
  const c = /* @__PURE__ */ new Map();
  for (const [f, p] of t)
    if ((a ? p.id === s : p.selected || p.id === s) && (a || !p.parentId || !Lg(p, t)) && (p.draggable || r && typeof p.draggable > "u")) {
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
function Ou({ nodeId: t, dragItems: r, nodeLookup: i, dragging: s = !0 }) {
  const a = [];
  for (const [f, p] of r) {
    const h = i.get(f)?.internals.userNode;
    h && a.push({
      ...h,
      position: p.position,
      dragging: s
    });
  }
  if (!t)
    return [a[0], a];
  const c = i.get(t)?.internals.userNode;
  return [
    c ? {
      ...c,
      position: r.get(t)?.position || c.position,
      dragging: s
    } : a[0],
    a
  ];
}
function P1({ dragItems: t, snapGrid: r, x: i, y: s }) {
  const a = t.values().next().value;
  if (!a)
    return null;
  const c = {
    x: i - a.distance.x,
    y: s - a.distance.y
  }, f = Mi(c, r);
  return {
    x: f.x - c.x,
    y: f.y - c.y
  };
}
function I1({ onNodeMouseDown: t, getStoreItems: r, onDragStart: i, onDrag: s, onDragStop: a }) {
  let c = { x: null, y: null }, f = 0, p = /* @__PURE__ */ new Map(), h = !1, g = { x: 0, y: 0 }, m = null, w = !1, y = null, x = !1, _ = !1, M = null;
  function E({ noDragClassName: A, handleSelector: S, domNode: P, isSelectable: T, nodeId: I, nodeClickDistance: D = 0 }) {
    y = kt(P);
    function Y({ x: ee, y: G }) {
      const { nodeLookup: N, nodeExtent: H, snapGrid: F, snapToGrid: j, nodeOrigin: R, onNodeDrag: O, onSelectionDrag: V, onError: k, updateNodePositions: $ } = r();
      c = { x: ee, y: G };
      let ie = !1;
      const re = p.size > 1, ae = re && H ? nc(Ni(p)) : null, ce = re && j ? P1({
        dragItems: p,
        snapGrid: F,
        x: ee,
        y: G
      }) : null;
      for (const [ue, Q] of p) {
        if (!N.has(ue))
          continue;
        let se = { x: ee - Q.distance.x, y: G - Q.distance.y };
        j && (se = ce ? {
          x: Math.round(se.x + ce.x),
          y: Math.round(se.y + ce.y)
        } : Mi(se, F));
        let ve = null;
        if (re && H && !Q.extent && ae) {
          const { positionAbsolute: ye } = Q.internals, Ee = ye.x - ae.x + H[0][0], Ce = ye.x + Q.measured.width - ae.x2 + H[1][0], ze = ye.y - ae.y + H[0][1], Ve = ye.y + Q.measured.height - ae.y2 + H[1][1];
          ve = [
            [Ee, ze],
            [Ce, Ve]
          ];
        }
        const { position: Se, positionAbsolute: me } = yg({
          nodeId: ue,
          nextPosition: se,
          nodeLookup: N,
          nodeExtent: ve || H,
          nodeOrigin: R,
          onError: k
        });
        ie = ie || Q.position.x !== Se.x || Q.position.y !== Se.y, Q.position = Se, Q.internals.positionAbsolute = me;
      }
      if (_ = _ || ie, !!ie && ($(p, !0), M && (s || O || !I && V))) {
        const [ue, Q] = Ou({
          nodeId: I,
          dragItems: p,
          nodeLookup: N
        });
        s?.(M, p, ue, Q), O?.(M, ue, Q), I || V?.(M, Q);
      }
    }
    async function X() {
      if (!m)
        return;
      const { transform: ee, panBy: G, autoPanSpeed: N, autoPanOnNodeDrag: H } = r();
      if (!H) {
        h = !1, cancelAnimationFrame(f);
        return;
      }
      const [F, j] = Sc(g, m, N);
      (F !== 0 || j !== 0) && (c.x = (c.x ?? 0) - F / ee[2], c.y = (c.y ?? 0) - j / ee[2], await G({ x: F, y: j }) && Y(c)), f = requestAnimationFrame(X);
    }
    function J(ee) {
      const { nodeLookup: G, multiSelectionActive: N, nodesDraggable: H, transform: F, snapGrid: j, snapToGrid: R, selectNodesOnDrag: O, onNodeDragStart: V, onSelectionDragStart: k, unselectNodesAndEdges: $ } = r();
      w = !0;
      const ie = !!I && !N && !G.get(I)?.selected;
      (!O || !T) && !N && I && (G.get(I)?.selected || $()), T && O && I && t?.(I);
      const re = di(ee.sourceEvent, { transform: F, snapGrid: j, snapToGrid: R, containerBounds: m });
      if (c = re, p = z1(G, H, re, I, ie), p.size > 0 && (i || V || !I && k)) {
        const [ae, ce] = Ou({
          nodeId: I,
          dragItems: p,
          nodeLookup: G
        });
        i?.(ee.sourceEvent, p, ae, ce), V?.(ee.sourceEvent, ae, ce), I || k?.(ee.sourceEvent, ce);
      }
    }
    const q = jh().clickDistance(D).on("start", (ee) => {
      const { domNode: G, nodeDragThreshold: N, transform: H, snapGrid: F, snapToGrid: j } = r();
      m = G?.getBoundingClientRect() || null, x = !1, _ = !1, M = ee.sourceEvent, N === 0 && J(ee), c = di(ee.sourceEvent, { transform: H, snapGrid: F, snapToGrid: j, containerBounds: m }), g = Ut(ee.sourceEvent, m);
    }).on("drag", (ee) => {
      const { autoPanOnNodeDrag: G, transform: N, snapGrid: H, snapToGrid: F, nodeDragThreshold: j, nodeLookup: R } = r(), O = di(ee.sourceEvent, { transform: N, snapGrid: H, snapToGrid: F, containerBounds: m });
      if (M = ee.sourceEvent, (ee.sourceEvent.type === "touchmove" && ee.sourceEvent.touches.length > 1 || // if user deletes a node while dragging, we need to abort the drag to prevent errors
      I && !R.has(I)) && (x = !0), !x) {
        if (!h && G && w && (h = !0, X()), !w) {
          const V = Ut(ee.sourceEvent, m), k = V.x - g.x, $ = V.y - g.y;
          Math.sqrt(k * k + $ * $) > j && J(ee);
        }
        (c.x !== O.xSnapped || c.y !== O.ySnapped) && p && w && (g = Ut(ee.sourceEvent, m), Y(O));
      }
    }).on("end", (ee) => {
      if (!w || x) {
        x && p.size > 0 && r().updateNodePositions(p, !1);
        return;
      }
      if (h = !1, w = !1, cancelAnimationFrame(f), p.size > 0) {
        const { nodeLookup: G, updateNodePositions: N, onNodeDragStop: H, onSelectionDragStop: F } = r();
        if (_ && (N(p, !1), _ = !1), a || H || !I && F) {
          const [j, R] = Ou({
            nodeId: I,
            dragItems: p,
            nodeLookup: G,
            dragging: !1
          });
          a?.(ee.sourceEvent, p, j, R), H?.(ee.sourceEvent, j, R), I || F?.(ee.sourceEvent, R);
        }
      }
    }).filter((ee) => {
      const G = ee.target;
      return !ee.button && (!A || !Bp(G, `.${A}`, P)) && (!S || Bp(G, S, P));
    });
    y.call(q);
  }
  function C() {
    y?.on(".drag", null);
  }
  return {
    update: E,
    destroy: C
  };
}
function T1(t, r, i) {
  const s = [], a = {
    x: t.x - i,
    y: t.y - i,
    width: i * 2,
    height: i * 2
  };
  for (const c of r.values())
    ys(a, wi(c)) > 0 && s.push(c);
  return s;
}
const b1 = 250;
function R1(t, r, i, s) {
  let a = [], c = 1 / 0;
  const f = T1(t, i, r + b1);
  for (const p of f) {
    const h = [...p.internals.handleBounds?.source ?? [], ...p.internals.handleBounds?.target ?? []];
    for (const g of h) {
      if (s.nodeId === g.nodeId && s.type === g.type && s.id === g.id)
        continue;
      const { x: m, y: w } = kr(p, g, g.position, !0), y = Math.sqrt(Math.pow(m - t.x, 2) + Math.pow(w - t.y, 2));
      y > r || (y < c ? (a = [{ ...g, x: m, y: w }], c = y) : y === c && a.push({ ...g, x: m, y: w }));
    }
  }
  if (!a.length)
    return null;
  if (a.length > 1) {
    const p = s.type === "source" ? "target" : "source";
    return a.find((h) => h.type === p) ?? a[0];
  }
  return a[0];
}
function Ag(t, r, i, s, a, c = !1) {
  const f = s.get(t);
  if (!f)
    return null;
  const p = a === "strict" ? f.internals.handleBounds?.[r] : [...f.internals.handleBounds?.source ?? [], ...f.internals.handleBounds?.target ?? []], h = (i ? p?.find((g) => g.id === i) : p?.[0]) ?? null;
  return h && c ? { ...h, ...kr(f, h, h.position, !0) } : h;
}
function $g(t, r) {
  return t || (r?.classList.contains("target") ? "target" : r?.classList.contains("source") ? "source" : null);
}
function D1(t, r) {
  let i = null;
  return r ? i = !0 : t && !r && (i = !1), i;
}
const Og = () => !0;
function L1(t, { connectionMode: r, connectionRadius: i, handleId: s, nodeId: a, edgeUpdaterType: c, isTarget: f, domNode: p, nodeLookup: h, lib: g, autoPanOnConnect: m, flowId: w, panBy: y, cancelConnection: x, onConnectStart: _, onConnect: M, onConnectEnd: E, isValidConnection: C = Og, onReconnectEnd: A, updateConnection: S, getTransform: P, getFromHandle: T, autoPanSpeed: I, dragThreshold: D = 1, handleDomNode: Y }) {
  const X = Cg(t.target);
  let J = 0, q;
  const { x: ee, y: G } = Ut(t), N = $g(c, Y), H = p?.getBoundingClientRect();
  let F = !1;
  if (!H || !N)
    return;
  const j = Ag(a, N, s, h, r);
  if (!j)
    return;
  let R = Ut(t, H), O = !1, V = null, k = !1, $ = null;
  function ie() {
    if (!m || !H)
      return;
    const [Se, me] = Sc(R, H, I);
    y({ x: Se, y: me }), J = requestAnimationFrame(ie);
  }
  const re = {
    ...j,
    nodeId: a,
    type: N,
    position: j.position
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
  function Q() {
    F = !0, S(ue), _?.(t, { nodeId: a, handleId: s, handleType: N });
  }
  D === 0 && Q();
  function se(Se) {
    if (!F) {
      const { x: Ve, y: Ct } = Ut(Se), at = Ve - ee, et = Ct - G;
      if (!(at * at + et * et > D * D))
        return;
      Q();
    }
    if (!T() || !re) {
      ve(Se);
      return;
    }
    const me = P();
    R = Ut(Se, H), q = R1(zi(R, me, !1, [1, 1]), i, h, re), O || (ie(), O = !0);
    const ye = Hg(Se, {
      handle: q,
      connectionMode: r,
      fromNodeId: a,
      fromHandleId: s,
      fromType: f ? "target" : "source",
      isValidConnection: C,
      doc: X,
      lib: g,
      flowId: w,
      nodeLookup: h
    });
    $ = ye.handleDomNode, V = ye.connection, k = D1(!!q, ye.isValid);
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
      if (F) {
        (q || $) && V && k && M?.(V);
        const { inProgress: me, ...ye } = ue, Ee = {
          ...ye,
          toPosition: ue.toHandle ? ue.toPosition : null
        };
        E?.(Se, Ee), c && A?.(Se, Ee);
      }
      x(), cancelAnimationFrame(J), O = !1, k = !1, V = null, $ = null, X.removeEventListener("mousemove", se), X.removeEventListener("mouseup", ve), X.removeEventListener("touchmove", se), X.removeEventListener("touchend", ve);
    }
  }
  X.addEventListener("mousemove", se), X.addEventListener("mouseup", ve), X.addEventListener("touchmove", se), X.addEventListener("touchend", ve);
}
function Hg(t, { handle: r, connectionMode: i, fromNodeId: s, fromHandleId: a, fromType: c, doc: f, lib: p, flowId: h, isValidConnection: g = Og, nodeLookup: m }) {
  const w = c === "target", y = r ? f.querySelector(`.${p}-flow__handle[data-id="${h}-${r?.nodeId}-${r?.id}-${r?.type}"]`) : null, { x, y: _ } = Ut(t), M = f.elementFromPoint(x, _), E = M?.classList.contains(`${p}-flow__handle`) ? M : y, C = {
    handleDomNode: E,
    isValid: !1,
    connection: null,
    toHandle: null
  };
  if (E) {
    const A = $g(void 0, E), S = E.getAttribute("data-nodeid"), P = E.getAttribute("data-handleid"), T = E.classList.contains("connectable"), I = E.classList.contains("connectableend");
    if (!S || !A)
      return C;
    const D = {
      source: w ? S : s,
      sourceHandle: w ? P : a,
      target: w ? s : S,
      targetHandle: w ? a : P
    };
    C.connection = D;
    const X = T && I && (i === fo.Strict ? w && A === "source" || !w && A === "target" : S !== s || P !== a);
    C.isValid = X && g(D), C.toHandle = Ag(S, A, P, m, i, !0);
  }
  return C;
}
const lc = {
  onPointerDown: L1,
  isValid: Hg
};
function A1({ domNode: t, panZoom: r, getTransform: i, getViewScale: s }) {
  const a = kt(t);
  function c({ translateExtent: p, width: h, height: g, zoomStep: m = 1, pannable: w = !0, zoomable: y = !0, inversePan: x = !1 }) {
    const _ = (S) => {
      if (S.sourceEvent.type !== "wheel" || !r)
        return;
      const P = i(), T = S.sourceEvent.ctrlKey && xi() ? 10 : 1, I = -S.sourceEvent.deltaY * (S.sourceEvent.deltaMode === 1 ? 0.05 : S.sourceEvent.deltaMode ? 1 : 2e-3) * m, D = P[2] * Math.pow(2, I * T);
      r.scaleTo(D);
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
      const T = [
        S.sourceEvent.clientX ?? S.sourceEvent.touches[0].clientX,
        S.sourceEvent.clientY ?? S.sourceEvent.touches[0].clientY
      ], I = [T[0] - M[0], T[1] - M[1]];
      M = T;
      const D = s() * Math.max(P[2], Math.log(P[2])) * (x ? -1 : 1), Y = {
        x: P[0] - I[0] * D,
        y: P[1] - I[1] * D
      }, X = [
        [0, 0],
        [h, g]
      ];
      r.setViewportConstrained({
        x: Y.x,
        y: Y.y,
        zoom: P[2]
      }, X, p);
    }, A = dg().on("start", E).on("zoom", w ? C : null).on("zoom.wheel", y ? _ : null);
    a.call(A, {});
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
const zs = (t) => ({
  x: t.x,
  y: t.y,
  zoom: t.k
}), Hu = ({ x: t, y: r, zoom: i }) => Cs.translate(t, r).scale(i), Bn = (t, r) => t.target.closest(`.${r}`), Fg = (t, r) => r === 2 && Array.isArray(t) && t.includes(2), $1 = (t) => ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2, Fu = (t, r = 0, i = $1, s = () => {
}) => {
  const a = typeof r == "number" && r > 0;
  return a || s(), a ? t.transition().duration(r).ease(i).on("end", s) : t;
}, jg = (t) => {
  const r = t.ctrlKey && xi() ? 10 : 1;
  return -t.deltaY * (t.deltaMode === 1 ? 0.05 : t.deltaMode ? 1 : 2e-3) * r;
};
function O1({ zoomPanValues: t, noWheelClassName: r, d3Selection: i, d3Zoom: s, panOnScrollMode: a, panOnScrollSpeed: c, zoomOnPinch: f, onPanZoomStart: p, onPanZoom: h, onPanZoomEnd: g }) {
  return (m) => {
    if (Bn(m, r))
      return m.ctrlKey && m.preventDefault(), !1;
    m.preventDefault(), m.stopImmediatePropagation();
    const w = i.property("__zoom").k || 1;
    if (m.ctrlKey && f) {
      const E = jt(m), C = jg(m), A = w * Math.pow(2, C);
      s.scaleTo(i, A, E, m);
      return;
    }
    const y = m.deltaMode === 1 ? 20 : 1;
    let x = a === yr.Vertical ? 0 : m.deltaX * y, _ = a === yr.Horizontal ? 0 : m.deltaY * y;
    !xi() && m.shiftKey && a !== yr.Vertical && (x = m.deltaY * y, _ = 0), s.translateBy(
      i,
      -(x / w) * c,
      -(_ / w) * c,
      // @ts-ignore
      { internal: !0 }
    );
    const M = zs(i.property("__zoom"));
    clearTimeout(t.panScrollTimeout), t.isPanScrolling ? h?.(m, M) : (t.isPanScrolling = !0, p?.(m, M)), t.panScrollTimeout = setTimeout(() => {
      g?.(m, M), t.isPanScrolling = !1;
    }, 150);
  };
}
function H1({ noWheelClassName: t, preventScrolling: r, d3ZoomHandler: i }) {
  return function(s, a) {
    const c = s.type === "wheel", f = !r && c && !s.ctrlKey, p = Bn(s, t);
    if (s.ctrlKey && c && p && s.preventDefault(), f || p)
      return null;
    s.preventDefault(), i.call(this, s, a);
  };
}
function F1({ zoomPanValues: t, onDraggingChange: r, onPanZoomStart: i }) {
  return (s) => {
    if (s.sourceEvent?.internal)
      return;
    const a = zs(s.transform);
    t.mouseButton = s.sourceEvent?.button || 0, t.isZoomingOrPanning = !0, t.prevViewport = a, s.sourceEvent?.type === "mousedown" && r(!0), i && i?.(s.sourceEvent, a);
  };
}
function j1({ zoomPanValues: t, panOnDrag: r, onPaneContextMenu: i, onTransformChange: s, onPanZoom: a }) {
  return (c) => {
    t.usedRightMouseButton = !!(i && Fg(r, t.mouseButton ?? 0)), c.sourceEvent?.sync || s([c.transform.x, c.transform.y, c.transform.k]), a && !c.sourceEvent?.internal && a?.(c.sourceEvent, zs(c.transform));
  };
}
function V1({ zoomPanValues: t, panOnDrag: r, panOnScroll: i, onDraggingChange: s, onPanZoomEnd: a, onPaneContextMenu: c }) {
  return (f) => {
    if (!f.sourceEvent?.internal && (t.isZoomingOrPanning = !1, c && Fg(r, t.mouseButton ?? 0) && !t.usedRightMouseButton && f.sourceEvent && c(f.sourceEvent), t.usedRightMouseButton = !1, s(!1), a)) {
      const p = zs(f.transform);
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
function B1({ panActivationKeyPressed: t, zoomActivationKeyPressed: r, zoomOnScroll: i, zoomOnPinch: s, panOnDrag: a, panOnScroll: c, zoomOnDoubleClick: f, userSelectionActive: p, noWheelClassName: h, noPanClassName: g, lib: m, connectionInProgress: w }) {
  return (y) => {
    const x = r || i, _ = s && y.ctrlKey, M = y.type === "wheel";
    if (y.button === 1 && y.type === "mousedown" && (Bn(y, `${m}-flow__node`) || Bn(y, `${m}-flow__edge`) || Bn(y, `${m}-flow__selection`) || Bn(y, `${m}-flow__nodesselection`)))
      return !0;
    if (!a && !x && !c && !f && !s || p || w && !M || Bn(y, h) && M || Bn(y, g) && (!M || c && M && !r) || !s && y.ctrlKey && M)
      return !1;
    if (!s && y.type === "touchstart" && y.touches?.length > 1)
      return y.preventDefault(), !1;
    if (!x && !c && !_ && M || !a && (y.type === "mousedown" || y.type === "touchstart") || Array.isArray(a) && !a.includes(y.button) && y.type === "mousedown")
      return !1;
    const E = Array.isArray(a) && a.includes(y.button) || !y.button || y.button <= 1;
    return (!y.ctrlKey || M || t) && E;
  };
}
function U1({ domNode: t, minZoom: r, maxZoom: i, translateExtent: s, viewport: a, onPanZoom: c, onPanZoomStart: f, onPanZoomEnd: p, onDraggingChange: h }) {
  const g = {
    isZoomingOrPanning: !1,
    usedRightMouseButton: !1,
    prevViewport: {},
    mouseButton: 0,
    timerId: void 0,
    panScrollTimeout: void 0,
    isPanScrolling: !1
  }, m = t.getBoundingClientRect();
  let w = [
    [0, 0],
    [m.width, m.height]
  ];
  const y = typeof ResizeObserver < "u" ? new ResizeObserver((G) => {
    const N = G[0];
    N?.contentRect && (w = [
      [0, 0],
      [N.contentRect.width, N.contentRect.height]
    ]);
  }) : null;
  y?.observe(t);
  const x = dg().extent(() => w).scaleExtent([r, i]).translateExtent(s), _ = kt(t).call(x);
  P({
    x: a.x,
    y: a.y,
    zoom: po(a.zoom, r, i)
  }, [
    [0, 0],
    [m.width, m.height]
  ], s);
  const M = _.on("wheel.zoom"), E = _.on("dblclick.zoom");
  x.wheelDelta(jg);
  async function C(G, N) {
    return _ ? new Promise((H) => {
      x?.interpolate(N?.interpolate === "linear" ? fi : rs).transform(Fu(_, N?.duration, N?.ease, () => H(!0)), G);
    }) : !1;
  }
  function A({ noWheelClassName: G, noPanClassName: N, onPaneContextMenu: H, userSelectionActive: F, panOnScroll: j, panOnDrag: R, panOnScrollMode: O, panOnScrollSpeed: V, preventScrolling: k, zoomOnPinch: $, zoomOnScroll: ie, zoomOnDoubleClick: re, panActivationKeyPressed: ae = !1, zoomActivationKeyPressed: ce, lib: ue, onTransformChange: Q, connectionInProgress: se, paneClickDistance: ve, selectionOnDrag: Se }) {
    F && !g.isZoomingOrPanning && x.on("zoom", null);
    const me = j && !ce && !F;
    x.clickDistance(Se ? 1 / 0 : !Bt(ve) || ve < 0 ? 0 : ve);
    const ye = me ? O1({
      zoomPanValues: g,
      noWheelClassName: G,
      d3Selection: _,
      d3Zoom: x,
      panOnScrollMode: O,
      panOnScrollSpeed: V,
      zoomOnPinch: $,
      onPanZoomStart: f,
      onPanZoom: c,
      onPanZoomEnd: p
    }) : H1({
      noWheelClassName: G,
      preventScrolling: k,
      d3ZoomHandler: M
    });
    _.on("wheel.zoom", ye, { passive: !1 });
    const Ee = F1({
      zoomPanValues: g,
      onDraggingChange: h,
      onPanZoomStart: f
    });
    x.on("start", Ee);
    const Ce = j1({
      zoomPanValues: g,
      panOnDrag: R,
      onPaneContextMenu: !!H,
      onPanZoom: c,
      onTransformChange: Q
    });
    x.on("zoom", Ce);
    const ze = V1({
      zoomPanValues: g,
      panOnDrag: R,
      panOnScroll: j,
      onPaneContextMenu: H,
      onPanZoomEnd: p,
      onDraggingChange: h
    });
    x.on("end", ze);
    const Ve = B1({
      panActivationKeyPressed: ae,
      zoomActivationKeyPressed: ce,
      panOnDrag: R,
      zoomOnScroll: ie,
      panOnScroll: j,
      zoomOnDoubleClick: re,
      zoomOnPinch: $,
      userSelectionActive: F,
      noPanClassName: N,
      noWheelClassName: G,
      lib: ue,
      connectionInProgress: se
    });
    x.filter(Ve), re ? _.on("dblclick.zoom", E) : _.on("dblclick.zoom", null);
  }
  function S() {
    x.on("zoom", null), y?.disconnect();
  }
  async function P(G, N, H) {
    const F = Hu(G), j = x?.constrain()(F, N, H);
    return j && await C(j), j;
  }
  async function T(G, N) {
    const H = Hu(G);
    return await C(H, N), H;
  }
  function I(G) {
    if (_) {
      const N = Hu(G), H = _.property("__zoom");
      (H.k !== G.zoom || H.x !== G.x || H.y !== G.y) && x?.transform(_, N, null, { sync: !0 });
    }
  }
  function D() {
    const G = _ ? fg(_.node()) : { x: 0, y: 0, k: 1 };
    return { x: G.x, y: G.y, zoom: G.k };
  }
  async function Y(G, N) {
    return _ ? new Promise((H) => {
      x?.interpolate(N?.interpolate === "linear" ? fi : rs).scaleTo(Fu(_, N?.duration, N?.ease, () => H(!0)), G);
    }) : !1;
  }
  async function X(G, N) {
    return _ ? new Promise((H) => {
      x?.interpolate(N?.interpolate === "linear" ? fi : rs).scaleBy(Fu(_, N?.duration, N?.ease, () => H(!0)), G);
    }) : !1;
  }
  function J(G) {
    x?.scaleExtent(G);
  }
  function q(G) {
    x?.translateExtent(G);
  }
  function ee(G) {
    const N = !Bt(G) || G < 0 ? 0 : G;
    x?.clickDistance(N);
  }
  return {
    update: A,
    destroy: S,
    setViewport: T,
    setViewportConstrained: P,
    getViewport: D,
    scaleTo: Y,
    scaleBy: X,
    setScaleExtent: J,
    setTranslateExtent: q,
    syncViewport: I,
    setClickDistance: ee
  };
}
var go;
(function(t) {
  t.Line = "line", t.Handle = "handle";
})(go || (go = {}));
function W1({ width: t, prevWidth: r, height: i, prevHeight: s, affectsX: a, affectsY: c }) {
  const f = t - r, p = i - s, h = [f > 0 ? 1 : f < 0 ? -1 : 0, p > 0 ? 1 : p < 0 ? -1 : 0];
  return f && a && (h[0] = h[0] * -1), p && c && (h[1] = h[1] * -1), h;
}
function Up(t) {
  const r = t.includes("right") || t.includes("left"), i = t.includes("bottom") || t.includes("top"), s = t.includes("left"), a = t.includes("top");
  return {
    isHorizontal: r,
    isVertical: i,
    affectsX: s,
    affectsY: a
  };
}
function jn(t, r) {
  return Math.max(0, r - t);
}
function Vn(t, r) {
  return Math.max(0, t - r);
}
function Jl(t, r, i) {
  return Math.max(0, r - t, t - i);
}
function Wp(t, r) {
  return t ? !r : r;
}
function Y1(t, r, i, s, a, c, f, p) {
  let { affectsX: h, affectsY: g } = r;
  const { isHorizontal: m, isVertical: w } = r, y = m && w, { xSnapped: x, ySnapped: _ } = i, { minWidth: M, maxWidth: E, minHeight: C, maxHeight: A } = s, { x: S, y: P, width: T, height: I, aspectRatio: D } = t;
  let Y = Math.floor(m ? x - t.pointerX : 0), X = Math.floor(w ? _ - t.pointerY : 0);
  const J = T + (h ? -Y : Y), q = I + (g ? -X : X), ee = -c[0] * T, G = -c[1] * I;
  let N = Jl(J, M, E), H = Jl(q, C, A);
  if (f) {
    let R = 0, O = 0;
    h && Y < 0 ? R = jn(S + Y + ee, f[0][0]) : !h && Y > 0 && (R = Vn(S + J + ee, f[1][0])), g && X < 0 ? O = jn(P + X + G, f[0][1]) : !g && X > 0 && (O = Vn(P + q + G, f[1][1])), N = Math.max(N, R), H = Math.max(H, O);
  }
  if (p) {
    let R = 0, O = 0;
    h && Y > 0 ? R = Vn(S + Y, p[0][0]) : !h && Y < 0 && (R = jn(S + J, p[1][0])), g && X > 0 ? O = Vn(P + X, p[0][1]) : !g && X < 0 && (O = jn(P + q, p[1][1])), N = Math.max(N, R), H = Math.max(H, O);
  }
  if (a) {
    if (m) {
      const R = Jl(J / D, C, A) * D;
      if (N = Math.max(N, R), f) {
        let O = 0;
        !h && !g || h && !g && y ? O = Vn(P + G + J / D, f[1][1]) * D : O = jn(P + G + (h ? Y : -Y) / D, f[0][1]) * D, N = Math.max(N, O);
      }
      if (p) {
        let O = 0;
        !h && !g || h && !g && y ? O = jn(P + J / D, p[1][1]) * D : O = Vn(P + (h ? Y : -Y) / D, p[0][1]) * D, N = Math.max(N, O);
      }
    }
    if (w) {
      const R = Jl(q * D, M, E) / D;
      if (H = Math.max(H, R), f) {
        let O = 0;
        !h && !g || g && !h && y ? O = Vn(S + q * D + ee, f[1][0]) / D : O = jn(S + (g ? X : -X) * D + ee, f[0][0]) / D, H = Math.max(H, O);
      }
      if (p) {
        let O = 0;
        !h && !g || g && !h && y ? O = jn(S + q * D, p[1][0]) / D : O = Vn(S + (g ? X : -X) * D, p[0][0]) / D, H = Math.max(H, O);
      }
    }
  }
  X = X + (X < 0 ? H : -H), Y = Y + (Y < 0 ? N : -N), a && (y ? J > q * D ? X = (Wp(h, g) ? -Y : Y) / D : Y = (Wp(h, g) ? -X : X) * D : m ? (X = Y / D, g = h) : (Y = X * D, h = g));
  const F = h ? S + Y : S, j = g ? P + X : P;
  return {
    width: T + (h ? -Y : Y),
    height: I + (g ? -X : X),
    x: c[0] * Y * (h ? -1 : 1) + F,
    y: c[1] * X * (g ? -1 : 1) + j
  };
}
const Vg = { width: 0, height: 0, x: 0, y: 0 }, X1 = {
  ...Vg,
  pointerX: 0,
  pointerY: 0,
  aspectRatio: 1
};
function Z1(t, r, i) {
  const s = r.position.x + t.position.x, a = r.position.y + t.position.y, c = t.measured.width ?? 0, f = t.measured.height ?? 0, p = i[0] * c, h = i[1] * f;
  return [
    [s - p, a - h],
    [s + c - p, a + f - h]
  ];
}
function Q1({ domNode: t, nodeId: r, getStoreItems: i, onChange: s, onEnd: a }) {
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
  function p({ controlPosition: g, boundaries: m, keepAspectRatio: w, resizeDirection: y, onResizeStart: x, onResize: _, onResizeEnd: M, shouldResize: E }) {
    let C = { ...Vg }, A = { ...X1 };
    f = {
      boundaries: m,
      resizeDirection: y,
      keepAspectRatio: w,
      controlDirection: Up(g)
    };
    let S, P = null, T = [], I, D, Y;
    const X = jh().on("start", (J) => {
      const { nodeLookup: q, transform: ee, snapGrid: G, snapToGrid: N, nodeOrigin: H, paneDomNode: F } = i();
      if (S = q.get(r), !S)
        return;
      P = F?.getBoundingClientRect() ?? null;
      const { xSnapped: j, ySnapped: R } = di(J.sourceEvent, {
        transform: ee,
        snapGrid: G,
        snapToGrid: N,
        containerBounds: P
      });
      C = {
        width: S.measured.width ?? 0,
        height: S.measured.height ?? 0,
        x: S.position.x ?? 0,
        y: S.position.y ?? 0
      }, A = {
        ...C,
        pointerX: j,
        pointerY: R,
        aspectRatio: C.width / C.height
      }, I = void 0, D = Sr(S.extent) ? S.extent : void 0, S.parentId && (S.extent === "parent" || S.expandParent) && (I = q.get(S.parentId)), I && S.extent === "parent" && (D = [
        [0, 0],
        [I.measured.width, I.measured.height]
      ]), T = [], Y = void 0;
      for (const [O, V] of q)
        if (V.parentId === r && (T.push({
          id: O,
          position: { ...V.position },
          extent: V.extent
        }), V.extent === "parent" || V.expandParent)) {
          const k = Z1(V, S, V.origin ?? H);
          Y ? Y = [
            [Math.min(k[0][0], Y[0][0]), Math.min(k[0][1], Y[0][1])],
            [Math.max(k[1][0], Y[1][0]), Math.max(k[1][1], Y[1][1])]
          ] : Y = k;
        }
      x?.(J, { ...C });
    }).on("drag", (J) => {
      const { transform: q, snapGrid: ee, snapToGrid: G, nodeOrigin: N } = i(), H = di(J.sourceEvent, {
        transform: q,
        snapGrid: ee,
        snapToGrid: G,
        containerBounds: P
      }), F = [];
      if (!S)
        return;
      const { x: j, y: R, width: O, height: V } = C, k = {}, $ = S.origin ?? N, { width: ie, height: re, x: ae, y: ce } = Y1(A, f.controlDirection, H, f.boundaries, f.keepAspectRatio, $, D, Y), ue = ie !== O, Q = re !== V, se = ae !== j && ue, ve = ce !== R && Q;
      if (!se && !ve && !ue && !Q)
        return;
      const Se = {
        prevValues: { ...C },
        startX: A.x,
        startY: A.y,
        childNodes: T.map((Ce) => ({
          ...Ce,
          position: { ...Ce.position }
        }))
      };
      if ((se || ve || $[0] === 1 || $[1] === 1) && (k.x = se ? ae : C.x, k.y = ve ? ce : C.y, C.x = k.x, C.y = k.y, T.length > 0)) {
        const Ce = ae - j, ze = ce - R;
        for (const Ve of T)
          Ve.position = {
            x: Ve.position.x - Ce + $[0] * (ie - O),
            y: Ve.position.y - ze + $[1] * (re - V)
          }, F.push(Ve);
      }
      if ((ue || Q) && (k.width = ue && (!f.resizeDirection || f.resizeDirection === "horizontal") ? ie : C.width, k.height = Q && (!f.resizeDirection || f.resizeDirection === "vertical") ? re : C.height, C.width = k.width, C.height = k.height), I && S.expandParent) {
        const Ce = $[0] * (k.width ?? 0);
        k.x && k.x < Ce && (C.x = Ce, A.x = A.x - (k.x - Ce));
        const ze = $[1] * (k.height ?? 0);
        k.y && k.y < ze && (C.y = ze, A.y = A.y - (k.y - ze));
      }
      const me = W1({
        width: C.width,
        prevWidth: O,
        height: C.height,
        prevHeight: V,
        affectsX: f.controlDirection.affectsX,
        affectsY: f.controlDirection.affectsY
      }), ye = { ...C, direction: me };
      if (E?.(J, ye) === !1) {
        C = Se.prevValues, A.x = Se.startX, A.y = Se.startY, T.forEach((Ce, ze) => {
          Ce.position = Se.childNodes[ze].position;
        });
        return;
      }
      _?.(J, ye), s(k, F);
    }).on("end", (J) => {
      M?.(J, { ...C }), a?.({ ...C });
    });
    c.call(X);
  }
  function h() {
    c.on(".drag", null);
  }
  return {
    update: p,
    destroy: h
  };
}
var ju = { exports: {} }, Vu = {}, Bu = { exports: {} }, Uu = {};
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
function K1() {
  if (Yp) return Uu;
  Yp = 1;
  var t = Si();
  function r(w, y) {
    return w === y && (w !== 0 || 1 / w === 1 / y) || w !== w && y !== y;
  }
  var i = typeof Object.is == "function" ? Object.is : r, s = t.useState, a = t.useEffect, c = t.useLayoutEffect, f = t.useDebugValue;
  function p(w, y) {
    var x = y(), _ = s({ inst: { value: x, getSnapshot: y } }), M = _[0].inst, E = _[1];
    return c(
      function() {
        M.value = x, M.getSnapshot = y, h(M) && E({ inst: M });
      },
      [w, x, y]
    ), a(
      function() {
        return h(M) && E({ inst: M }), w(function() {
          h(M) && E({ inst: M });
        });
      },
      [w]
    ), f(x), x;
  }
  function h(w) {
    var y = w.getSnapshot;
    w = w.value;
    try {
      var x = y();
      return !i(w, x);
    } catch {
      return !0;
    }
  }
  function g(w, y) {
    return y();
  }
  var m = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? g : p;
  return Uu.useSyncExternalStore = t.useSyncExternalStore !== void 0 ? t.useSyncExternalStore : m, Uu;
}
var Xp;
function G1() {
  return Xp || (Xp = 1, Bu.exports = K1()), Bu.exports;
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
function q1() {
  if (Zp) return Vu;
  Zp = 1;
  var t = Si(), r = G1();
  function i(g, m) {
    return g === m && (g !== 0 || 1 / g === 1 / m) || g !== g && m !== m;
  }
  var s = typeof Object.is == "function" ? Object.is : i, a = r.useSyncExternalStore, c = t.useRef, f = t.useEffect, p = t.useMemo, h = t.useDebugValue;
  return Vu.useSyncExternalStoreWithSelector = function(g, m, w, y, x) {
    var _ = c(null);
    if (_.current === null) {
      var M = { hasValue: !1, value: null };
      _.current = M;
    } else M = _.current;
    _ = p(
      function() {
        function C(I) {
          if (!A) {
            if (A = !0, S = I, I = y(I), x !== void 0 && M.hasValue) {
              var D = M.value;
              if (x(D, I))
                return P = D;
            }
            return P = I;
          }
          if (D = P, s(S, I)) return D;
          var Y = y(I);
          return x !== void 0 && x(D, Y) ? (S = I, D) : (S = I, P = Y);
        }
        var A = !1, S, P, T = w === void 0 ? null : w;
        return [
          function() {
            return C(m());
          },
          T === null ? void 0 : function() {
            return C(T());
          }
        ];
      },
      [m, w, y, x]
    );
    var E = a(g, _[0], _[1]);
    return f(
      function() {
        M.hasValue = !0, M.value = E;
      },
      [E]
    ), h(E), E;
  }, Vu;
}
var Qp;
function J1() {
  return Qp || (Qp = 1, ju.exports = q1()), ju.exports;
}
var e_ = J1();
const t_ = /* @__PURE__ */ Ch(e_), n_ = {}, Kp = (t) => {
  let r;
  const i = /* @__PURE__ */ new Set(), s = (m, w) => {
    const y = typeof m == "function" ? m(r) : m;
    if (!Object.is(y, r)) {
      const x = r;
      r = w ?? (typeof y != "object" || y === null) ? y : Object.assign({}, r, y), i.forEach((_) => _(r, x));
    }
  }, a = () => r, h = { setState: s, getState: a, getInitialState: () => g, subscribe: (m) => (i.add(m), () => i.delete(m)), destroy: () => {
    (n_ ? "production" : void 0) !== "production" && console.warn(
      "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
    ), i.clear();
  } }, g = r = t(s, a, h);
  return h;
}, r_ = (t) => t ? Kp(t) : Kp, { useDebugValue: o_ } = py, { useSyncExternalStoreWithSelector: i_ } = t_, l_ = (t) => t;
function Bg(t, r = l_, i) {
  const s = i_(
    t.subscribe,
    t.getState,
    t.getServerState || t.getInitialState,
    r,
    i
  );
  return o_(s), s;
}
const Gp = (t, r) => {
  const i = r_(t), s = (a, c = r) => Bg(i, a, c);
  return Object.assign(s, i), s;
}, s_ = (t, r) => t ? Gp(t, r) : Gp;
function Fe(t, r) {
  if (Object.is(t, r))
    return !0;
  if (typeof t != "object" || t === null || typeof r != "object" || r === null)
    return !1;
  if (t instanceof Map && r instanceof Map) {
    if (t.size !== r.size) return !1;
    for (const [s, a] of t)
      if (!Object.is(a, r.get(s)))
        return !1;
    return !0;
  }
  if (t instanceof Set && r instanceof Set) {
    if (t.size !== r.size) return !1;
    for (const s of t)
      if (!r.has(s))
        return !1;
    return !0;
  }
  const i = Object.keys(t);
  if (i.length !== Object.keys(r).length)
    return !1;
  for (const s of i)
    if (!Object.prototype.hasOwnProperty.call(r, s) || !Object.is(t[s], r[s]))
      return !1;
  return !0;
}
Nh();
const Ps = K.createContext(null), a_ = Ps.Provider, Ug = Wt.error001("react");
function Me(t, r) {
  const i = K.useContext(Ps);
  if (i === null)
    throw new Error(Ug);
  return Bg(i, t, r);
}
function Re() {
  const t = K.useContext(Ps);
  if (t === null)
    throw new Error(Ug);
  return K.useMemo(() => ({
    getState: t.getState,
    setState: t.setState,
    subscribe: t.subscribe
  }), [t]);
}
const qp = { display: "none" }, u_ = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  border: 0,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0px, 0px, 0px, 0px)",
  clipPath: "inset(100%)"
}, Wg = "react-flow__node-desc", Yg = "react-flow__edge-desc", c_ = "react-flow__aria-live", f_ = (t) => t.ariaLiveMessage, d_ = (t) => t.ariaLabelConfig;
function p_({ rfId: t }) {
  const r = Me(f_);
  return U.jsx("div", { id: `${c_}-${t}`, "aria-live": "assertive", "aria-atomic": "true", style: u_, children: r });
}
function h_({ rfId: t, disableKeyboardA11y: r }) {
  const i = Me(d_);
  return U.jsxs(U.Fragment, { children: [U.jsx("div", { id: `${Wg}-${t}`, style: qp, children: r ? i["node.a11yDescription.default"] : i["node.a11yDescription.keyboardDisabled"] }), U.jsx("div", { id: `${Yg}-${t}`, style: qp, children: i["edge.a11yDescription.default"] }), !r && U.jsx(p_, { rfId: t })] });
}
const Is = K.forwardRef(({ position: t = "top-left", children: r, className: i, style: s, ...a }, c) => {
  const f = `${t}`.split("-");
  return U.jsx("div", { className: We(["react-flow__panel", i, ...f]), style: s, ref: c, ...a, children: r });
});
Is.displayName = "Panel";
const Jp = "https://reactflow.dev?utm_source=attribution";
function g_({ proOptions: t, position: r = "bottom-right" }) {
  return K.useEffect(() => {
  }, []), t?.hideAttribution ? null : U.jsx(Is, { position: r, className: "react-flow__attribution", "data-message": `Please only hide this attribution when you are subscribed to React Flow Pro: ${Jp}`, children: U.jsx("a", { href: Jp, target: "_blank", rel: "noopener noreferrer", "aria-label": "React Flow attribution", children: "React Flow" }) });
}
const m_ = (t) => {
  const r = [], i = [];
  for (const [, s] of t.nodeLookup)
    s.selected && r.push(s.internals.userNode);
  for (const [, s] of t.edgeLookup)
    s.selected && i.push(s);
  return { selectedNodes: r, selectedEdges: i };
}, es = (t) => t.id;
function y_(t, r) {
  return Fe(t.selectedNodes.map(es), r.selectedNodes.map(es)) && Fe(t.selectedEdges.map(es), r.selectedEdges.map(es));
}
function v_({ onSelectionChange: t }) {
  const r = Re(), { selectedNodes: i, selectedEdges: s } = Me(m_, y_);
  return K.useEffect(() => {
    const a = { nodes: i, edges: s };
    t?.(a), r.getState().onSelectionChangeHandlers.forEach((c) => c(a));
  }, [i, s, t]), null;
}
const w_ = (t) => !!t.onSelectionChangeHandlers;
function x_({ onSelectionChange: t }) {
  const r = Me(w_);
  return t || r ? U.jsx(v_, { onSelectionChange: t }) : null;
}
const Xg = [0, 0], __ = { x: 0, y: 0, zoom: 1 }, S_ = [
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
], eh = [...S_, "rfId"], k_ = (t) => ({
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
  nodeOrigin: Xg,
  minZoom: 0.5,
  maxZoom: 2,
  elementsSelectable: !0,
  noPanClassName: "nopan",
  rfId: "1"
};
function E_(t) {
  const { setNodes: r, setEdges: i, setMinZoom: s, setMaxZoom: a, setTranslateExtent: c, setNodeExtent: f, reset: p, setDefaultNodesAndEdges: h } = Me(k_, Fe), g = Re();
  K.useEffect(() => (h(t.defaultNodes, t.defaultEdges), () => {
    m.current = th, p();
  }), []);
  const m = K.useRef(th);
  return K.useEffect(
    () => {
      for (const w of eh) {
        const y = t[w], x = m.current[w];
        y !== x && (typeof t[w] > "u" || (w === "nodes" ? r(y) : w === "edges" ? i(y) : w === "minZoom" ? s(y) : w === "maxZoom" ? a(y) : w === "translateExtent" ? c(y) : w === "nodeExtent" ? f(y) : w === "ariaLabelConfig" ? g.setState({ ariaLabelConfig: s1(y) }) : w === "fitView" ? g.setState({ fitViewQueued: y }) : w === "fitViewOptions" ? g.setState({ fitViewOptions: y }) : g.setState({ [w]: y })));
      }
      m.current = t;
    },
    // Only re-run the effect if one of the fields we track changes
    eh.map((w) => t[w])
  ), null;
}
function nh() {
  return typeof window > "u" || !window.matchMedia ? null : window.matchMedia("(prefers-color-scheme: dark)");
}
function C_(t) {
  const [r, i] = K.useState(t === "system" ? null : t);
  return K.useEffect(() => {
    if (t !== "system") {
      i(t);
      return;
    }
    const s = nh(), a = () => i(s?.matches ? "dark" : "light");
    return a(), s?.addEventListener("change", a), () => {
      s?.removeEventListener("change", a);
    };
  }, [t]), r !== null ? r : nh()?.matches ? "dark" : "light";
}
const rh = typeof document < "u" ? document : null;
function _i(t = null, r = { target: rh, actInsideInputWithModifier: !0 }) {
  const [i, s] = K.useState(!1), a = K.useRef(!1), c = K.useRef(/* @__PURE__ */ new Set([])), [f, p] = K.useMemo(() => {
    if (t !== null) {
      const g = (Array.isArray(t) ? t : [t]).filter((w) => typeof w == "string").map((w) => w.replace(/\+/g, `
`).replace(`

`, `
+`).split(`
`)), m = g.reduce((w, y) => w.concat(...y), []);
      return [g, m];
    }
    return [[], []];
  }, [t]);
  return K.useEffect(() => {
    const h = r?.target ?? rh, g = r?.actInsideInputWithModifier ?? !0;
    if (t !== null) {
      const m = (x) => {
        if (a.current = x.ctrlKey || x.metaKey || x.shiftKey || x.altKey, (!a.current || a.current && !g) && Ng(x))
          return !1;
        const M = ih(x.code, p);
        if (c.current.add(x[M]), oh(f, c.current, !1)) {
          const E = x.composedPath?.()?.[0] || x.target, C = E?.nodeName === "BUTTON" || E?.nodeName === "A";
          r.preventDefault !== !1 && (a.current || !C) && x.preventDefault(), s(!0);
        }
      }, w = (x) => {
        const _ = ih(x.code, p);
        oh(f, c.current, !0) ? (s(!1), c.current.clear()) : c.current.delete(x[_]), x.key === "Meta" && c.current.clear(), a.current = !1;
      }, y = () => {
        c.current.clear(), s(!1);
      };
      return h?.addEventListener("keydown", m), h?.addEventListener("keyup", w), window.addEventListener("blur", y), window.addEventListener("contextmenu", y), () => {
        h?.removeEventListener("keydown", m), h?.removeEventListener("keyup", w), window.removeEventListener("blur", y), window.removeEventListener("contextmenu", y);
      };
    }
  }, [t, s]), i;
}
function oh(t, r, i) {
  return t.filter((s) => i || s.length === r.size).some((s) => s.every((a) => r.has(a)));
}
function ih(t, r) {
  return r.includes(t) ? "code" : "key";
}
const N_ = () => {
  const t = Re();
  return K.useMemo(() => ({
    zoomIn: async (r) => {
      const { panZoom: i } = t.getState();
      return i ? i.scaleBy(1.2, r) : !1;
    },
    zoomOut: async (r) => {
      const { panZoom: i } = t.getState();
      return i ? i.scaleBy(1 / 1.2, r) : !1;
    },
    zoomTo: async (r, i) => {
      const { panZoom: s } = t.getState();
      return s ? s.scaleTo(r, i) : !1;
    },
    getZoom: () => t.getState().transform[2],
    setViewport: async (r, i) => {
      const { transform: [s, a, c], panZoom: f } = t.getState();
      return f ? (await f.setViewport({
        x: r.x ?? s,
        y: r.y ?? a,
        zoom: r.zoom ?? c
      }, i), !0) : !1;
    },
    getViewport: () => {
      const [r, i, s] = t.getState().transform;
      return { x: r, y: i, zoom: s };
    },
    setCenter: async (r, i, s) => t.getState().setCenter(r, i, s),
    fitBounds: async (r, i) => {
      const { width: s, height: a, minZoom: c, maxZoom: f, panZoom: p } = t.getState(), h = kc(r, s, a, c, f, i?.padding ?? 0.1);
      return p ? (await p.setViewport(h, {
        duration: i?.duration,
        ease: i?.ease,
        interpolate: i?.interpolate
      }), !0) : !1;
    },
    screenToFlowPosition: (r, i = {}) => {
      const { transform: s, snapGrid: a, snapToGrid: c, domNode: f } = t.getState();
      if (!f)
        return r;
      const { x: p, y: h } = f.getBoundingClientRect(), g = {
        x: r.x - p,
        y: r.y - h
      }, m = i.snapGrid ?? a, w = i.snapToGrid ?? c;
      return zi(g, s, w, m);
    },
    flowToScreenPosition: (r) => {
      const { transform: i, domNode: s } = t.getState();
      if (!s)
        return r;
      const { x: a, y: c } = s.getBoundingClientRect(), f = ho(r, i);
      return {
        x: f.x + a,
        y: f.y + c
      };
    }
  }), []);
};
function Zg(t, r) {
  const i = [], s = /* @__PURE__ */ new Map(), a = [];
  for (const c of t)
    if (c.type === "add") {
      a.push(c);
      continue;
    } else if (c.type === "remove" || c.type === "replace")
      s.set(c.id, [c]);
    else {
      const f = s.get(c.id);
      f ? f.push(c) : s.set(c.id, [c]);
    }
  for (const c of r) {
    const f = s.get(c.id);
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
      M_(h, p);
    i.push(p);
  }
  return a.length && a.forEach((c) => {
    c.index !== void 0 ? i.splice(c.index, 0, { ...c.item }) : i.push({ ...c.item });
  }), i;
}
function M_(t, r) {
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
function Qg(t, r) {
  return Zg(t, r);
}
function Kg(t, r) {
  return Zg(t, r);
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
  for (const [s, a] of t) {
    const c = r.has(s);
    !(a.selected === void 0 && !c) && a.selected !== c && i.push(pr(a.id, c));
  }
  return i;
}
function lh({ items: t = [], lookup: r }) {
  const i = [], s = new Map(t.map((a) => [a.id, a]));
  for (const [a, c] of t.entries()) {
    const f = r.get(c.id), p = f?.internals?.userNode ?? f;
    p !== void 0 && p !== c && i.push({ id: c.id, item: c, type: "replace" }), p === void 0 && i.push({ item: c, type: "add", index: a });
  }
  for (const [a] of r)
    s.get(a) === void 0 && i.push({ id: a, type: "remove" });
  return i;
}
function sh(t) {
  return {
    id: t.id,
    type: "remove"
  };
}
const z_ = _g();
function P_(t, r, i = {}) {
  return p1(t, r, {
    ...i,
    onError: i.onError ?? z_
  });
}
const ah = (t) => qx(t), I_ = (t) => mg(t);
function Gg(t) {
  return K.forwardRef(t);
}
const qg = typeof window < "u" ? K.useLayoutEffect : K.useEffect;
function uh(t) {
  const [r, i] = K.useState(BigInt(0)), [s] = K.useState(() => T_(() => i((a) => a + BigInt(1))));
  return qg(() => {
    const a = s.get();
    a.length && (t(a), s.reset());
  }, [r]), s;
}
function T_(t) {
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
const Jg = K.createContext(null);
function b_({ children: t }) {
  const r = Re(), i = K.useCallback((p) => {
    const { nodes: h = [], setNodes: g, hasDefaultNodes: m, onNodesChange: w, nodeLookup: y, fitViewQueued: x, onNodesChangeMiddlewareMap: _ } = r.getState();
    let M = h;
    for (const C of p)
      M = typeof C == "function" ? C(M) : C;
    let E = lh({
      items: M,
      lookup: y
    });
    for (const C of _.values())
      E = C(E);
    m && g(M), E.length > 0 ? w?.(E) : x && window.requestAnimationFrame(() => {
      const { fitViewQueued: C, nodes: A, setNodes: S } = r.getState();
      C && S(A);
    });
  }, []), s = uh(i), a = K.useCallback((p) => {
    const { edges: h = [], setEdges: g, hasDefaultEdges: m, onEdgesChange: w, edgeLookup: y } = r.getState();
    let x = h;
    for (const _ of p)
      x = typeof _ == "function" ? _(x) : _;
    m ? g(x) : w && w(lh({
      items: x,
      lookup: y
    }));
  }, []), c = uh(a), f = K.useMemo(() => ({ nodeQueue: s, edgeQueue: c }), []);
  return U.jsx(Jg.Provider, { value: f, children: t });
}
function R_() {
  const t = K.useContext(Jg);
  if (!t)
    throw new Error("useBatchContext must be used within a BatchProvider");
  return t;
}
const D_ = (t) => !!t.panZoom;
function Ic() {
  const t = N_(), r = Re(), i = R_(), s = Me(D_), a = K.useMemo(() => {
    const c = (w) => r.getState().nodeLookup.get(w), f = (w) => {
      i.nodeQueue.push(w);
    }, p = (w) => {
      i.edgeQueue.push(w);
    }, h = (w) => {
      const { nodeLookup: y, nodeOrigin: x } = r.getState(), _ = ah(w) ? w : y.get(w.id), M = _.parentId ? kg(_.position, _.measured, _.parentId, y, x) : _.position, E = {
        ..._,
        position: M,
        width: _.measured?.width ?? _.width,
        height: _.measured?.height ?? _.height
      };
      return wi(E, _.parentId ? void 0 : x);
    }, g = (w, y, x = { replace: !1 }) => {
      f((_) => _.map((M) => {
        if (M.id === w) {
          const E = typeof y == "function" ? y(M) : y;
          return x.replace && ah(E) ? E : { ...M, ...E };
        }
        return M;
      }));
    }, m = (w, y, x = { replace: !1 }) => {
      p((_) => _.map((M) => {
        if (M.id === w) {
          const E = typeof y == "function" ? y(M) : y;
          return x.replace && I_(E) ? E : { ...M, ...E };
        }
        return M;
      }));
    };
    return {
      getNodes: () => r.getState().nodes.map((w) => ({ ...w })),
      getNode: (w) => c(w)?.internals.userNode,
      getInternalNode: c,
      getEdges: () => {
        const { edges: w = [] } = r.getState();
        return w.map((y) => ({ ...y }));
      },
      getEdge: (w) => r.getState().edgeLookup.get(w),
      setNodes: f,
      setEdges: p,
      addNodes: (w) => {
        const y = Array.isArray(w) ? w : [w];
        i.nodeQueue.push((x) => [...x, ...y]);
      },
      addEdges: (w) => {
        const y = Array.isArray(w) ? w : [w];
        i.edgeQueue.push((x) => [...x, ...y]);
      },
      toObject: () => {
        const { nodes: w = [], edges: y = [], transform: x } = r.getState(), [_, M, E] = x;
        return {
          nodes: w.map((C) => ({ ...C })),
          edges: y.map((C) => ({ ...C })),
          viewport: {
            x: _,
            y: M,
            zoom: E
          }
        };
      },
      deleteElements: async ({ nodes: w = [], edges: y = [] }) => {
        const { nodes: x, edges: _, onNodesDelete: M, onEdgesDelete: E, triggerNodeChanges: C, triggerEdgeChanges: A, onDelete: S, onBeforeDelete: P } = r.getState(), { nodes: T, edges: I } = await r1({
          nodesToRemove: w,
          edgesToRemove: y,
          nodes: x,
          edges: _,
          onBeforeDelete: P
        }), D = I.length > 0, Y = T.length > 0;
        if (D) {
          const X = I.map(sh);
          E?.(I), A(X);
        }
        if (Y) {
          const X = T.map(sh);
          M?.(T), C(X);
        }
        return (Y || D) && S?.({ nodes: T, edges: I }), { deletedNodes: T, deletedEdges: I };
      },
      /**
       * Partial is defined as "the 2 nodes/areas are intersecting partially".
       * If a is contained in b or b is contained in a, they are both
       * considered fully intersecting.
       */
      getIntersectingNodes: (w, y = !0, x) => {
        const _ = Rp(w), M = _ ? w : h(w), E = x !== void 0;
        if (!M)
          return [];
        const { nodeOrigin: C } = r.getState();
        return (x || r.getState().nodes).filter((A) => {
          const S = r.getState().nodeLookup.get(A.id);
          if (S && !_ && (A.id === w.id || !S.internals.positionAbsolute))
            return !1;
          const P = wi(E ? A : S, C), T = ys(P, M);
          return y && T > 0 || T >= P.width * P.height || T >= M.width * M.height;
        });
      },
      isNodeIntersecting: (w, y, x = !0) => {
        const M = Rp(w) ? w : h(w);
        if (!M)
          return !1;
        const E = ys(M, y);
        return x && E > 0 || E >= y.width * y.height || E >= M.width * M.height;
      },
      updateNode: g,
      updateNodeData: (w, y, x = { replace: !1 }) => {
        g(w, (_) => {
          const M = typeof y == "function" ? y(_) : y;
          return x.replace ? { ..._, data: M } : { ..._, data: { ..._.data, ...M } };
        }, x);
      },
      updateEdge: m,
      updateEdgeData: (w, y, x = { replace: !1 }) => {
        m(w, (_) => {
          const M = typeof y == "function" ? y(_) : y;
          return x.replace ? { ..._, data: M } : { ..._, data: { ..._.data, ...M } };
        }, x);
      },
      getNodesBounds: (w) => {
        const { nodeLookup: y, nodeOrigin: x } = r.getState();
        return Jx(w, { nodeLookup: y, nodeOrigin: x });
      },
      getHandleConnections: ({ type: w, id: y, nodeId: x }) => Array.from(r.getState().connectionLookup.get(`${x}-${w}${y ? `-${y}` : ""}`)?.values() ?? []),
      getNodeConnections: ({ type: w, handleId: y, nodeId: x }) => Array.from(r.getState().connectionLookup.get(`${x}${w ? y ? `-${w}-${y}` : `-${w}` : ""}`)?.values() ?? []),
      fitView: async (w) => {
        const y = r.getState().fitViewResolver ?? l1();
        return r.setState({ fitViewQueued: !0, fitViewOptions: w, fitViewResolver: y }), i.nodeQueue.push((x) => [...x]), y.promise;
      }
    };
  }, []);
  return K.useMemo(() => ({
    ...a,
    ...t,
    viewportInitialized: s
  }), [s]);
}
const ch = (t) => t.selected, L_ = typeof window < "u" ? window : void 0;
function A_({ deleteKeyCode: t, multiSelectionKeyCode: r }) {
  const i = Re(), { deleteElements: s } = Ic(), a = _i(t, { actInsideInputWithModifier: !1 }), c = _i(r, { target: L_ });
  K.useEffect(() => {
    if (a) {
      const { edges: f, nodes: p } = i.getState();
      s({ nodes: p.filter(ch), edges: f.filter(ch) }), i.setState({ nodesSelectionActive: !1 });
    }
  }, [a]), K.useEffect(() => {
    i.setState({ multiSelectionActive: c });
  }, [c]);
}
function $_(t) {
  const r = Re();
  K.useEffect(() => {
    const i = () => {
      if (!t.current || !(t.current.checkVisibility?.() ?? !0))
        return !1;
      const s = Ec(t.current);
      (s.height === 0 || s.width === 0) && r.getState().onError?.("004", Wt.error004()), r.setState({ width: s.width || 500, height: s.height || 500 });
    };
    if (t.current) {
      i(), window.addEventListener("resize", i);
      const s = new ResizeObserver(() => i());
      return s.observe(t.current), () => {
        window.removeEventListener("resize", i), s.disconnect();
      };
    }
  }, []);
}
const Ts = {
  position: "absolute",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0
}, O_ = (t) => ({
  userSelectionActive: t.userSelectionActive,
  lib: t.lib,
  connectionInProgress: t.connection.inProgress
});
function H_({ onPaneContextMenu: t, zoomOnScroll: r = !0, zoomOnPinch: i = !0, panOnScroll: s = !1, panActivationKeyPressed: a, panOnScrollSpeed: c = 0.5, panOnScrollMode: f = yr.Free, zoomOnDoubleClick: p = !0, panOnDrag: h = !0, defaultViewport: g, translateExtent: m, minZoom: w, maxZoom: y, zoomActivationKeyCode: x, preventScrolling: _ = !0, children: M, noWheelClassName: E, noPanClassName: C, onViewportChange: A, isControlledViewport: S, paneClickDistance: P, selectionOnDrag: T }) {
  const I = Re(), D = K.useRef(null), { userSelectionActive: Y, lib: X, connectionInProgress: J } = Me(O_, Fe), q = _i(x), ee = K.useRef();
  $_(D);
  const G = K.useCallback((N) => {
    A?.({ x: N[0], y: N[1], zoom: N[2] }), S || I.setState({ transform: N });
  }, [A, S]);
  return K.useEffect(() => {
    if (D.current) {
      ee.current = U1({
        domNode: D.current,
        minZoom: w,
        maxZoom: y,
        translateExtent: m,
        viewport: g,
        onDraggingChange: (j) => I.setState((R) => R.paneDragging === j ? R : { paneDragging: j }),
        onPanZoomStart: (j, R) => {
          const { onViewportChangeStart: O, onMoveStart: V } = I.getState();
          V?.(j, R), O?.(R);
        },
        onPanZoom: (j, R) => {
          const { onViewportChange: O, onMove: V } = I.getState();
          V?.(j, R), O?.(R);
        },
        onPanZoomEnd: (j, R) => {
          const { onViewportChangeEnd: O, onMoveEnd: V } = I.getState();
          V?.(j, R), O?.(R);
        }
      });
      const { x: N, y: H, zoom: F } = ee.current.getViewport();
      return I.setState({
        panZoom: ee.current,
        transform: [N, H, F],
        domNode: D.current.closest(".react-flow")
      }), () => {
        ee.current?.destroy();
      };
    }
  }, []), K.useEffect(() => {
    ee.current?.update({
      onPaneContextMenu: t,
      zoomOnScroll: r,
      zoomOnPinch: i,
      panOnScroll: s,
      panActivationKeyPressed: a,
      panOnScrollSpeed: c,
      panOnScrollMode: f,
      zoomOnDoubleClick: p,
      panOnDrag: h,
      zoomActivationKeyPressed: q,
      preventScrolling: _,
      noPanClassName: C,
      userSelectionActive: Y,
      noWheelClassName: E,
      lib: X,
      onTransformChange: G,
      connectionInProgress: J,
      selectionOnDrag: T,
      paneClickDistance: P
    });
  }, [
    t,
    r,
    i,
    s,
    a,
    c,
    f,
    p,
    h,
    q,
    _,
    C,
    Y,
    E,
    X,
    G,
    J,
    T,
    P
  ]), U.jsx("div", { className: "react-flow__renderer", ref: D, style: Ts, children: M });
}
const F_ = (t) => ({
  userSelectionActive: t.userSelectionActive,
  userSelectionRect: t.userSelectionRect
});
function j_() {
  const { userSelectionActive: t, userSelectionRect: r } = Me(F_, Fe);
  return t && r ? U.jsx("div", { className: "react-flow__selection react-flow__container", style: {
    width: r.width,
    height: r.height,
    transform: `translate(${r.x}px, ${r.y}px)`
  } }) : null;
}
const Wu = (t, r) => (i) => {
  i.target === r.current && t?.(i);
}, V_ = (t) => ({
  userSelectionActive: t.userSelectionActive,
  elementsSelectable: t.elementsSelectable,
  dragging: t.paneDragging,
  panBy: t.panBy,
  autoPanSpeed: t.autoPanSpeed
});
function B_({ isSelecting: t, selectionKeyPressed: r, selectionMode: i = vi.Full, panOnDrag: s, autoPanOnSelection: a, paneClickDistance: c, selectionOnDrag: f, onSelectionStart: p, onSelectionEnd: h, onPaneClick: g, onPaneContextMenu: m, onPaneScroll: w, onPaneMouseEnter: y, onPaneMouseMove: x, onPaneMouseLeave: _, children: M }) {
  const E = K.useRef(0), C = Re(), { userSelectionActive: A, elementsSelectable: S, dragging: P, panBy: T, autoPanSpeed: I } = Me(V_, Fe), D = S && (t || A), Y = K.useRef(null), X = K.useRef(), J = K.useRef(/* @__PURE__ */ new Set()), q = K.useRef(/* @__PURE__ */ new Set()), ee = K.useRef(!1), G = K.useRef(!1), N = K.useRef({ x: 0, y: 0 }), H = K.useRef(!1), F = (Q) => {
    if (G.current || ee.current || C.getState().connection.inProgress) {
      G.current = !1, ee.current = !1;
      return;
    }
    const { connectionClickStartHandle: se, connection: ve, onClickConnectEnd: Se, resetSelectedElements: me } = C.getState();
    if (se) {
      const ye = structuredClone(ve);
      delete ye.inProgress, ye.toPosition = ye.toHandle ? ye.toHandle.position : null, Se?.(Q.nativeEvent, ye), C.setState({ connectionClickStartHandle: null });
    }
    g?.(Q), me(), C.setState({ nodesSelectionActive: !1 });
  }, j = (Q) => {
    if (Array.isArray(s) && s?.includes(2)) {
      Q.preventDefault();
      return;
    }
    m?.(Q);
  }, R = w ? (Q) => w(Q) : void 0, O = (Q) => {
    G.current && (Q.stopPropagation(), G.current = !1);
  }, V = (Q) => {
    if (Q.pointerType === "touch" && s !== !1 && !r)
      return;
    const { domNode: se, transform: ve } = C.getState();
    if (X.current = se?.getBoundingClientRect(), !X.current)
      return;
    const Se = Q.target === Y.current;
    if (!Se && !!Q.target.closest(".nokey") || !t || !(f && Se || r) || Q.button !== 0 || !Q.isPrimary)
      return;
    Q.target?.setPointerCapture?.(Q.pointerId), G.current = !1;
    const { x: Ee, y: Ce } = Ut(Q.nativeEvent, X.current), ze = zi({ x: Ee, y: Ce }, ve);
    C.setState({
      userSelectionRect: {
        width: 0,
        height: 0,
        startX: ze.x,
        startY: ze.y,
        x: Ee,
        y: Ce
      }
    }), Se || (Q.stopPropagation(), Q.preventDefault());
  };
  function k(Q, se) {
    const { userSelectionRect: ve } = C.getState();
    if (!ve)
      return;
    const { transform: Se, nodeLookup: me, edgeLookup: ye, connectionLookup: Ee, triggerNodeChanges: Ce, triggerEdgeChanges: ze, defaultEdgeOptions: Ve } = C.getState(), Ct = { x: ve.startX, y: ve.startY }, { x: at, y: et } = ho(Ct, Se), tt = {
      startX: Ct.x,
      startY: Ct.y,
      x: Q < at ? Q : at,
      y: se < et ? se : et,
      width: Math.abs(Q - at),
      height: Math.abs(se - et)
    }, ln = J.current, Zt = q.current;
    J.current = new Set(_c(me, tt, Se, i === vi.Partial, !0).map((ut) => ut.id)), q.current = /* @__PURE__ */ new Set();
    const Qt = Ve?.selectable ?? !0;
    for (const ut of J.current) {
      const Nt = Ee.get(ut);
      if (Nt)
        for (const { edgeId: mt } of Nt.values()) {
          const Mt = ye.get(mt);
          Mt && (Mt.selectable ?? Qt) && q.current.add(mt);
        }
    }
    if (!Dp(ln, J.current)) {
      const ut = no(me, J.current);
      Ce(ut);
    }
    if (!Dp(Zt, q.current)) {
      const ut = no(ye, q.current);
      ze(ut);
    }
    C.setState({
      userSelectionRect: tt,
      userSelectionActive: !0,
      nodesSelectionActive: !1
    });
  }
  function $() {
    if (!a || !X.current)
      return;
    const [Q, se] = Sc(N.current, X.current, I);
    T({ x: Q, y: se }).then((ve) => {
      if (!G.current || !ve) {
        E.current = requestAnimationFrame($);
        return;
      }
      const { x: Se, y: me } = N.current;
      k(Se, me), E.current = requestAnimationFrame($);
    });
  }
  const ie = () => {
    cancelAnimationFrame(E.current), E.current = 0, H.current = !1;
  };
  K.useEffect(() => () => ie(), []);
  const re = (Q) => {
    const { userSelectionRect: se, transform: ve, resetSelectedElements: Se } = C.getState();
    if (!X.current || !se)
      return;
    const { x: me, y: ye } = Ut(Q.nativeEvent, X.current);
    N.current = { x: me, y: ye };
    const Ee = ho({ x: se.startX, y: se.startY }, ve);
    if (!G.current) {
      const Ce = r ? 0 : c;
      if (Math.hypot(me - Ee.x, ye - Ee.y) <= Ce)
        return;
      Se(), p?.(Q);
    }
    G.current = !0, H.current || ($(), H.current = !0), k(me, ye);
  }, ae = (Q) => {
    if (!D) {
      Q.target === Y.current && C.getState().connection.inProgress && (ee.current = !0);
      return;
    }
    Q.button === 0 && (Q.target?.releasePointerCapture?.(Q.pointerId), !A && Q.target === Y.current && C.getState().userSelectionRect && F?.(Q), C.setState({
      userSelectionActive: !1,
      userSelectionRect: null
    }), G.current && (h?.(Q), C.setState({
      nodesSelectionActive: J.current.size > 0
    })), ie());
  }, ce = (Q) => {
    Q.target?.releasePointerCapture?.(Q.pointerId), ie();
  }, ue = s === !0 || Array.isArray(s) && s.includes(0);
  return U.jsxs("div", { className: We(["react-flow__pane", { draggable: ue, dragging: P, selection: t }]), onClick: D ? void 0 : Wu(F, Y), onContextMenu: Wu(j, Y), onWheel: Wu(R, Y), onPointerEnter: D ? void 0 : y, onPointerMove: D ? re : x, onPointerUp: ae, onPointerCancel: D ? ce : void 0, onPointerDownCapture: D ? V : void 0, onClickCapture: D ? O : void 0, onPointerLeave: _, ref: Y, style: Ts, children: [M, U.jsx(j_, {})] });
}
function sc({ id: t, store: r, unselect: i = !1, nodeRef: s }) {
  const { addSelectedNodes: a, unselectNodesAndEdges: c, multiSelectionActive: f, nodeLookup: p, onError: h } = r.getState(), g = p.get(t);
  if (!g) {
    h?.("012", Wt.error012(t));
    return;
  }
  r.setState({ nodesSelectionActive: !1 }), g.selected ? (i || g.selected && f) && (c({ nodes: [g], edges: [] }), requestAnimationFrame(() => s?.current?.blur())) : a([t]);
}
function em({ nodeRef: t, disabled: r = !1, noDragClassName: i, handleSelector: s, nodeId: a, isSelectable: c, nodeClickDistance: f }) {
  const p = Re(), [h, g] = K.useState(!1), m = K.useRef();
  return K.useEffect(() => {
    if (!r)
      return m.current = I1({
        getStoreItems: () => p.getState(),
        onNodeMouseDown: (w) => {
          sc({
            id: w,
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
  }, [r, p, t]), K.useEffect(() => {
    r || !t.current || !m.current || m.current.update({
      noDragClassName: i,
      handleSelector: s,
      domNode: t.current,
      isSelectable: c,
      nodeId: a,
      nodeClickDistance: f
    });
  }, [i, s, r, c, t, a, f]), h;
}
const U_ = (t) => (r) => r.selected && (r.draggable || t && typeof r.draggable > "u");
function tm() {
  const t = Re();
  return K.useCallback((i) => {
    const { nodeExtent: s, snapToGrid: a, snapGrid: c, nodesDraggable: f, onError: p, updateNodePositions: h, nodeLookup: g, nodeOrigin: m } = t.getState(), w = /* @__PURE__ */ new Map(), y = U_(f), x = a ? c[0] : 5, _ = a ? c[1] : 5, M = i.direction.x * x * i.factor, E = i.direction.y * _ * i.factor;
    for (const [, C] of g) {
      if (!y(C))
        continue;
      let A = {
        x: C.internals.positionAbsolute.x + M,
        y: C.internals.positionAbsolute.y + E
      };
      a && (A = Mi(A, c));
      const { position: S, positionAbsolute: P } = yg({
        nodeId: C.id,
        nextPosition: A,
        nodeLookup: g,
        nodeExtent: s,
        nodeOrigin: m,
        onError: p
      });
      C.position = S, C.internals.positionAbsolute = P, w.set(C.id, C);
    }
    h(w);
  }, []);
}
const Tc = K.createContext(null), W_ = Tc.Provider;
Tc.Consumer;
const nm = () => K.useContext(Tc), Y_ = (t) => ({
  connectOnClick: t.connectOnClick,
  noPanClassName: t.noPanClassName,
  rfId: t.rfId
}), rm = K.createContext(null);
function X_({ children: t }) {
  const r = Me(Y_, Fe);
  return U.jsx(rm.Provider, { value: r, children: t });
}
function Z_() {
  const t = K.useContext(rm);
  if (!t)
    throw new Error("useHandleConfig must be used within a HandleConfigProvider");
  return t;
}
const Q_ = {
  connectingFrom: !1,
  connectingTo: !1,
  clickConnecting: !1,
  isPossibleEndHandle: !0,
  connectionInProcess: !1,
  clickConnectionInProcess: !1,
  valid: !1
}, K_ = (t, r, i) => (s) => {
  const { connectionClickStartHandle: a, connectionMode: c, connection: f } = s, { fromHandle: p, toHandle: h, isValid: g } = f;
  if (!p && !a)
    return Q_;
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
function G_({ type: t = "source", position: r = we.Top, isValidConnection: i, isConnectable: s = !0, isConnectableStart: a = !0, isConnectableEnd: c = !0, id: f, onConnect: p, children: h, className: g, onMouseDown: m, onTouchStart: w, ...y }, x) {
  const _ = f || null, M = t === "target", E = Re(), C = nm(), { connectOnClick: A, noPanClassName: S, rfId: P } = Z_(), { connectingFrom: T, connectingTo: I, clickConnecting: D, isPossibleEndHandle: Y, connectionInProcess: X, clickConnectionInProcess: J, valid: q } = Me(K_(C, _, t), Fe);
  C || E.getState().onError?.("010", Wt.error010());
  const ee = (H) => {
    const { defaultEdgeOptions: F, onConnect: j, hasDefaultEdges: R } = E.getState(), O = {
      ...F,
      ...H
    };
    if (R) {
      const { edges: V, setEdges: k, onError: $ } = E.getState();
      k(P_(O, V, { onError: $ }));
    }
    j?.(O), p?.(O);
  }, G = (H) => {
    if (!C)
      return;
    const F = Mg(H.nativeEvent);
    if (a && (F && H.button === 0 || !F)) {
      const j = E.getState();
      lc.onPointerDown(H.nativeEvent, {
        handleDomNode: H.currentTarget,
        autoPanOnConnect: j.autoPanOnConnect,
        connectionMode: j.connectionMode,
        connectionRadius: j.connectionRadius,
        domNode: j.domNode,
        nodeLookup: j.nodeLookup,
        lib: j.lib,
        isTarget: M,
        handleId: _,
        nodeId: C,
        flowId: j.rfId,
        panBy: j.panBy,
        cancelConnection: j.cancelConnection,
        onConnectStart: j.onConnectStart,
        onConnectEnd: (...R) => E.getState().onConnectEnd?.(...R),
        updateConnection: j.updateConnection,
        onConnect: ee,
        isValidConnection: i || ((...R) => E.getState().isValidConnection?.(...R) ?? !0),
        getTransform: () => E.getState().transform,
        getFromHandle: () => E.getState().connection.fromHandle,
        autoPanSpeed: j.autoPanSpeed,
        dragThreshold: j.connectionDragThreshold
      });
    }
    F ? m?.(H) : w?.(H);
  }, N = (H) => {
    const { onClickConnectStart: F, onClickConnectEnd: j, connectionClickStartHandle: R, connectionMode: O, isValidConnection: V, lib: k, rfId: $, nodeLookup: ie, connection: re } = E.getState();
    if (!C || !R && !a)
      return;
    if (!R) {
      F?.(H.nativeEvent, { nodeId: C, handleId: _, handleType: t }), E.setState({ connectionClickStartHandle: { nodeId: C, type: t, id: _ } });
      return;
    }
    const ae = Cg(H.target), ce = i || V, { connection: ue, isValid: Q } = lc.isValid(H.nativeEvent, {
      handle: {
        nodeId: C,
        id: _,
        type: t
      },
      connectionMode: O,
      fromNodeId: R.nodeId,
      fromHandleId: R.id || null,
      fromType: R.type,
      isValidConnection: ce,
      flowId: $,
      doc: ae,
      lib: k,
      nodeLookup: ie
    });
    Q && ue && ee(ue);
    const se = structuredClone(re);
    delete se.inProgress, se.toPosition = se.toHandle ? se.toHandle.position : null, j?.(H, se), E.setState({ connectionClickStartHandle: null });
  };
  return U.jsx("div", { "data-handleid": _, "data-nodeid": C, "data-handlepos": r, "data-id": `${P}-${C}-${_}-${t}`, className: We([
    "react-flow__handle",
    `react-flow__handle-${r}`,
    "nodrag",
    S,
    g,
    {
      source: !M,
      target: M,
      connectable: s,
      connectablestart: a,
      connectableend: c,
      clickconnecting: D,
      connectingfrom: T,
      connectingto: I,
      valid: q,
      /*
       * shows where you can start a connection from
       * and where you can end it while connecting
       */
      connectionindicator: s && (!X || Y) && (X || J ? c : a)
    }
  ]), onMouseDown: G, onTouchStart: G, onClick: A ? N : void 0, ref: x, ...y, children: h });
}
const Er = K.memo(Gg(G_));
function q_({ data: t, isConnectable: r, sourcePosition: i = we.Bottom }) {
  return U.jsxs(U.Fragment, { children: [t?.label, U.jsx(Er, { type: "source", position: i, isConnectable: r })] });
}
function J_({ data: t, isConnectable: r, targetPosition: i = we.Top, sourcePosition: s = we.Bottom }) {
  return U.jsxs(U.Fragment, { children: [U.jsx(Er, { type: "target", position: i, isConnectable: r }), t?.label, U.jsx(Er, { type: "source", position: s, isConnectable: r })] });
}
function eS() {
  return null;
}
function tS({ data: t, isConnectable: r, targetPosition: i = we.Top }) {
  return U.jsxs(U.Fragment, { children: [U.jsx(Er, { type: "target", position: i, isConnectable: r }), t?.label] });
}
const vs = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
}, fh = {
  input: q_,
  default: J_,
  output: tS,
  group: eS
};
function nS(t) {
  return t.internals.handleBounds === void 0 ? {
    width: t.width ?? t.initialWidth ?? t.style?.width,
    height: t.height ?? t.initialHeight ?? t.style?.height
  } : {
    width: t.width ?? t.style?.width,
    height: t.height ?? t.style?.height
  };
}
const rS = (t) => {
  const { width: r, height: i, x: s, y: a } = Ni(t.nodeLookup, {
    filter: (c) => !!c.selected
  });
  return {
    width: Bt(r) ? r : null,
    height: Bt(i) ? i : null,
    userSelectionActive: t.userSelectionActive,
    transformString: `translate(${t.transform[0]}px,${t.transform[1]}px) scale(${t.transform[2]}) translate(${s}px,${a}px)`
  };
};
function oS({ onSelectionContextMenu: t, noPanClassName: r, disableKeyboardA11y: i }) {
  const s = Re(), { width: a, height: c, transformString: f, userSelectionActive: p } = Me(rS, Fe), h = tm(), g = K.useRef(null);
  K.useEffect(() => {
    i || g.current?.focus({
      preventScroll: !0
    });
  }, [i]);
  const m = !p && a !== null && c !== null;
  if (em({
    nodeRef: g,
    disabled: !m
  }), !m)
    return null;
  const w = t ? (x) => {
    const _ = s.getState().nodes.filter((M) => M.selected);
    t(x, _);
  } : void 0, y = (x) => {
    Object.prototype.hasOwnProperty.call(vs, x.key) && (x.preventDefault(), h({
      direction: vs[x.key],
      factor: x.shiftKey ? 4 : 1
    }));
  };
  return U.jsx("div", { className: We(["react-flow__nodesselection", "react-flow__container", r]), style: {
    transform: f
  }, children: U.jsx("div", { ref: g, className: "react-flow__nodesselection-rect", onContextMenu: w, tabIndex: i ? void 0 : -1, onKeyDown: i ? void 0 : y, style: {
    width: a,
    height: c
  } }) });
}
const dh = typeof window < "u" ? window : void 0, iS = (t) => ({ nodesSelectionActive: t.nodesSelectionActive, userSelectionActive: t.userSelectionActive });
function om({ children: t, onPaneClick: r, onPaneMouseEnter: i, onPaneMouseMove: s, onPaneMouseLeave: a, onPaneContextMenu: c, onPaneScroll: f, paneClickDistance: p, deleteKeyCode: h, selectionKeyCode: g, selectionOnDrag: m, selectionMode: w, onSelectionStart: y, onSelectionEnd: x, multiSelectionKeyCode: _, panActivationKeyCode: M, zoomActivationKeyCode: E, elementsSelectable: C, zoomOnScroll: A, zoomOnPinch: S, panOnScroll: P, panOnScrollSpeed: T, panOnScrollMode: I, zoomOnDoubleClick: D, panOnDrag: Y, autoPanOnSelection: X, defaultViewport: J, translateExtent: q, minZoom: ee, maxZoom: G, preventScrolling: N, onSelectionContextMenu: H, noWheelClassName: F, noPanClassName: j, disableKeyboardA11y: R, onViewportChange: O, isControlledViewport: V }) {
  const { nodesSelectionActive: k, userSelectionActive: $ } = Me(iS, Fe), ie = _i(g, { target: dh }), re = _i(M, { target: dh }), ae = re || Y, ce = re || P, ue = m && ae !== !0, Q = ie || $ || ue;
  return A_({ deleteKeyCode: h, multiSelectionKeyCode: _ }), U.jsx(H_, { onPaneContextMenu: c, elementsSelectable: C, zoomOnScroll: A, zoomOnPinch: S, panOnScroll: ce, panActivationKeyPressed: re, panOnScrollSpeed: T, panOnScrollMode: I, zoomOnDoubleClick: D, panOnDrag: !ie && ae, defaultViewport: J, translateExtent: q, minZoom: ee, maxZoom: G, zoomActivationKeyCode: E, preventScrolling: N, noWheelClassName: F, noPanClassName: j, onViewportChange: O, isControlledViewport: V, paneClickDistance: p, selectionOnDrag: ue, children: U.jsxs(B_, { onSelectionStart: y, onSelectionEnd: x, onPaneClick: r, onPaneMouseEnter: i, onPaneMouseMove: s, onPaneMouseLeave: a, onPaneContextMenu: c, onPaneScroll: f, panOnDrag: ae, autoPanOnSelection: X, isSelecting: !!Q, selectionMode: w, selectionKeyPressed: ie, paneClickDistance: p, selectionOnDrag: ue, children: [t, k && U.jsx(oS, { onSelectionContextMenu: H, noPanClassName: j, disableKeyboardA11y: R })] }) });
}
om.displayName = "FlowRenderer";
const lS = K.memo(om), sS = (t) => (r) => t ? _c(r.nodeLookup, { x: 0, y: 0, width: r.width, height: r.height }, r.transform, !0).map((i) => i.id) : Array.from(r.nodeLookup.keys());
function aS(t) {
  return Me(K.useCallback(sS(t), [t]), Fe);
}
const uS = (t) => t.updateNodeInternals;
function cS() {
  const t = Me(uS), [r] = K.useState(() => typeof ResizeObserver > "u" ? null : new ResizeObserver((i) => {
    const s = /* @__PURE__ */ new Map();
    i.forEach((a) => {
      const c = a.target.getAttribute("data-id");
      s.set(c, {
        id: c,
        nodeElement: a.target,
        force: !0
      });
    }), t(s);
  }));
  return K.useEffect(() => () => {
    r?.disconnect();
  }, [r]), r;
}
function fS({ node: t, nodeType: r, hasDimensions: i, resizeObserver: s }) {
  const a = Re(), c = K.useRef(null), f = K.useRef(null), p = K.useRef(t.sourcePosition), h = K.useRef(t.targetPosition), g = K.useRef(r), m = i && !!t.internals.handleBounds;
  return K.useEffect(() => {
    c.current && !t.hidden && (!m || f.current !== c.current) && (f.current && s?.unobserve(f.current), s?.observe(c.current), f.current = c.current);
  }, [m, t.hidden]), K.useEffect(() => () => {
    f.current && (s?.unobserve(f.current), f.current = null);
  }, []), K.useEffect(() => {
    if (c.current) {
      const w = g.current !== r, y = p.current !== t.sourcePosition, x = h.current !== t.targetPosition;
      (w || y || x) && (g.current = r, p.current = t.sourcePosition, h.current = t.targetPosition, a.getState().updateNodeInternals(/* @__PURE__ */ new Map([[t.id, { id: t.id, nodeElement: c.current, force: !0 }]])));
    }
  }, [t.id, r, t.sourcePosition, t.targetPosition]), c;
}
function dS({ id: t, onClick: r, onMouseEnter: i, onMouseMove: s, onMouseLeave: a, onContextMenu: c, onDoubleClick: f, nodesDraggable: p, elementsSelectable: h, nodesConnectable: g, nodesFocusable: m, resizeObserver: w, noDragClassName: y, noPanClassName: x, disableKeyboardA11y: _, rfId: M, nodeTypes: E, nodeClickDistance: C, onError: A }) {
  const { node: S, internals: P, isParent: T } = Me((Q) => {
    const se = Q.nodeLookup.get(t), ve = Q.parentLookup.has(t);
    return {
      node: se,
      internals: se.internals,
      isParent: ve
    };
  }, Fe);
  let I = S.type || "default", D = E?.[I] || fh[I];
  D === void 0 && (A?.("003", Wt.error003(I)), I = "default", D = E?.default || fh.default);
  const Y = !!(S.draggable || p && typeof S.draggable > "u"), X = !!(S.selectable || h && typeof S.selectable > "u"), J = !!(S.connectable || g && typeof S.connectable > "u"), q = !!(S.focusable || m && typeof S.focusable > "u"), ee = Re(), G = Sg(S), N = fS({ node: S, nodeType: I, hasDimensions: G, resizeObserver: w }), H = em({
    nodeRef: N,
    disabled: S.hidden || !Y,
    noDragClassName: y,
    handleSelector: S.dragHandle,
    nodeId: t,
    isSelectable: X,
    nodeClickDistance: C
  }), F = tm();
  if (S.hidden)
    return null;
  const j = Xt(S), R = nS(S), O = X || Y || r || i || s || a, V = i ? (Q) => i(Q, { ...P.userNode }) : void 0, k = s ? (Q) => s(Q, { ...P.userNode }) : void 0, $ = a ? (Q) => a(Q, { ...P.userNode }) : void 0, ie = c ? (Q) => c(Q, { ...P.userNode }) : void 0, re = f ? (Q) => f(Q, { ...P.userNode }) : void 0, ae = (Q) => {
    const { selectNodesOnDrag: se, nodeDragThreshold: ve } = ee.getState();
    X && (!se || !Y || ve > 0) && sc({
      id: t,
      store: ee,
      nodeRef: N
    }), r && r(Q, { ...P.userNode });
  }, ce = (Q) => {
    if (!(Ng(Q.nativeEvent) || _)) {
      if (pg.includes(Q.key) && X) {
        const se = Q.key === "Escape";
        sc({
          id: t,
          store: ee,
          unselect: se,
          nodeRef: N
        });
      } else if (Y && S.selected && Object.prototype.hasOwnProperty.call(vs, Q.key)) {
        Q.preventDefault();
        const { ariaLabelConfig: se } = ee.getState();
        ee.setState({
          ariaLiveMessage: se["node.a11yDescription.ariaLiveMessage"]({
            direction: Q.key.replace("Arrow", "").toLowerCase(),
            x: ~~P.positionAbsolute.x,
            y: ~~P.positionAbsolute.y
          })
        }), F({
          direction: vs[Q.key],
          factor: Q.shiftKey ? 4 : 1
        });
      }
    }
  }, ue = () => {
    if (_ || !N.current?.matches(":focus-visible"))
      return;
    const { transform: Q, width: se, height: ve, autoPanOnNodeFocus: Se, setCenter: me } = ee.getState();
    if (!Se)
      return;
    _c(/* @__PURE__ */ new Map([[t, S]]), { x: 0, y: 0, width: se, height: ve }, Q, !0).length > 0 || me(S.position.x + j.width / 2, S.position.y + j.height / 2, {
      zoom: Q[2]
    });
  };
  return U.jsx("div", { className: We([
    "react-flow__node",
    `react-flow__node-${I}`,
    {
      // this is overwritable by passing `nopan` as a class name
      [x]: Y
    },
    S.className,
    {
      selected: S.selected,
      selectable: X,
      parent: T,
      draggable: Y,
      dragging: H
    }
  ]), ref: N, style: {
    zIndex: P.z,
    transform: `translate(${P.positionAbsolute.x}px,${P.positionAbsolute.y}px)`,
    pointerEvents: O ? "all" : "none",
    visibility: G ? "visible" : "hidden",
    ...S.style,
    ...R
  }, "data-id": t, "data-testid": `rf__node-${t}`, onMouseEnter: V, onMouseMove: k, onMouseLeave: $, onContextMenu: ie, onClick: ae, onDoubleClick: re, onKeyDown: q ? ce : void 0, tabIndex: q ? 0 : void 0, onFocus: q ? ue : void 0, role: S.ariaRole ?? (q ? "group" : void 0), "aria-roledescription": "node", "aria-describedby": _ ? void 0 : `${Wg}-${M}`, "aria-label": S.ariaLabel, ...S.domAttributes, children: U.jsx(W_, { value: t, children: U.jsx(D, { id: t, data: S.data, type: I, positionAbsoluteX: P.positionAbsolute.x, positionAbsoluteY: P.positionAbsolute.y, selected: S.selected ?? !1, selectable: X, draggable: Y, deletable: S.deletable ?? !0, isConnectable: J, sourcePosition: S.sourcePosition, targetPosition: S.targetPosition, dragging: H, dragHandle: S.dragHandle, zIndex: P.z, parentId: S.parentId, ...j }) }) });
}
var pS = K.memo(dS);
const hS = (t) => ({
  nodesConnectable: t.nodesConnectable,
  nodesFocusable: t.nodesFocusable,
  elementsSelectable: t.elementsSelectable,
  onError: t.onError
});
function im(t) {
  const { nodesConnectable: r, nodesFocusable: i, elementsSelectable: s, onError: a } = Me(hS, Fe), c = aS(t.onlyRenderVisibleElements), f = cS();
  return U.jsx("div", { className: "react-flow__nodes", style: Ts, children: c.map((p) => (
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
    U.jsx(pS, { id: p, nodeTypes: t.nodeTypes, nodeExtent: t.nodeExtent, onClick: t.onNodeClick, onMouseEnter: t.onNodeMouseEnter, onMouseMove: t.onNodeMouseMove, onMouseLeave: t.onNodeMouseLeave, onContextMenu: t.onNodeContextMenu, onDoubleClick: t.onNodeDoubleClick, noDragClassName: t.noDragClassName, noPanClassName: t.noPanClassName, rfId: t.rfId, disableKeyboardA11y: t.disableKeyboardA11y, resizeObserver: f, nodesDraggable: t.nodesDraggable ?? !0, nodesConnectable: r, nodesFocusable: i, elementsSelectable: s, nodeClickDistance: t.nodeClickDistance, onError: a }, p)
  )) });
}
im.displayName = "NodeRenderer";
const gS = K.memo(im);
function mS(t) {
  return Me(K.useCallback((i) => {
    if (!t)
      return i.edges.map((a) => a.id);
    const s = [];
    if (i.width && i.height)
      for (const a of i.edges) {
        const c = i.nodeLookup.get(a.source), f = i.nodeLookup.get(a.target);
        c && f && c1({
          sourceNode: c,
          targetNode: f,
          width: i.width,
          height: i.height,
          transform: i.transform
        }) && s.push(a.id);
      }
    return s;
  }, [t]), Fe);
}
const yS = ({ color: t = "none", strokeWidth: r = 1 }) => {
  const i = {
    strokeWidth: r,
    ...t && { stroke: t }
  };
  return U.jsx("polyline", { className: "arrow", style: i, strokeLinecap: "round", fill: "none", strokeLinejoin: "round", points: "-5,-4 0,0 -5,4" });
}, vS = ({ color: t = "none", strokeWidth: r = 1 }) => {
  const i = {
    strokeWidth: r,
    ...t && { stroke: t, fill: t }
  };
  return U.jsx("polyline", { className: "arrowclosed", style: i, strokeLinecap: "round", strokeLinejoin: "round", points: "-5,-4 0,0 -5,4 -5,-4" });
}, ph = {
  [gs.Arrow]: yS,
  [gs.ArrowClosed]: vS
};
function wS(t) {
  const r = Re();
  return K.useMemo(() => Object.prototype.hasOwnProperty.call(ph, t) ? ph[t] : (r.getState().onError?.("009", Wt.error009(t)), null), [t]);
}
const xS = ({ id: t, type: r, color: i, width: s = 12.5, height: a = 12.5, markerUnits: c = "strokeWidth", strokeWidth: f, orient: p = "auto-start-reverse" }) => {
  const h = wS(r);
  return h ? U.jsx("marker", { className: "react-flow__arrowhead", id: t, markerWidth: `${s}`, markerHeight: `${a}`, viewBox: "-10 -10 20 20", markerUnits: c, orient: p, refX: "0", refY: "0", children: U.jsx(h, { color: i, strokeWidth: f }) }) : null;
}, lm = ({ defaultColor: t, rfId: r }) => {
  const i = Me((c) => c.edges), s = Me((c) => c.defaultEdgeOptions), a = K.useMemo(() => w1(i, {
    id: r,
    defaultColor: t,
    defaultMarkerStart: s?.markerStart,
    defaultMarkerEnd: s?.markerEnd
  }), [i, s, r, t]);
  return a.length ? U.jsx("svg", { className: "react-flow__marker", "aria-hidden": "true", children: U.jsx("defs", { children: a.map((c) => U.jsx(xS, { id: c.id, type: c.type, color: c.color, width: c.width, height: c.height, markerUnits: c.markerUnits, strokeWidth: c.strokeWidth, orient: c.orient }, c.id)) }) }) : null;
};
lm.displayName = "MarkerDefinitions";
var _S = K.memo(lm);
function sm({ x: t, y: r, label: i, labelStyle: s, labelShowBg: a = !0, labelBgStyle: c, labelBgPadding: f = [2, 4], labelBgBorderRadius: p = 2, children: h, className: g, ...m }) {
  const [w, y] = K.useState({ x: 1, y: 0, width: 0, height: 0 }), x = We(["react-flow__edge-textwrapper", g]), _ = K.useRef(null);
  return K.useEffect(() => {
    if (_.current) {
      const M = _.current.getBBox();
      y({
        x: M.x,
        y: M.y,
        width: M.width,
        height: M.height
      });
    }
  }, [i]), i ? U.jsxs("g", { transform: `translate(${t - w.width / 2} ${r - w.height / 2})`, className: x, visibility: w.width ? "visible" : "hidden", ...m, children: [a && U.jsx("rect", { width: w.width + 2 * f[0], x: -f[0], y: -f[1], height: w.height + 2 * f[1], className: "react-flow__edge-textbg", style: c, rx: p, ry: p }), U.jsx("text", { className: "react-flow__edge-text", y: w.height / 2, dy: "0.3em", ref: _, style: s, children: i }), h] }) : null;
}
sm.displayName = "EdgeText";
const SS = K.memo(sm);
function bs({ path: t, labelX: r, labelY: i, label: s, labelStyle: a, labelShowBg: c, labelBgStyle: f, labelBgPadding: p, labelBgBorderRadius: h, interactionWidth: g = 20, ...m }) {
  return U.jsxs(U.Fragment, { children: [U.jsx("path", { ...m, d: t, fill: "none", className: We(["react-flow__edge-path", m.className]) }), g ? U.jsx("path", { d: t, fill: "none", strokeOpacity: 0, strokeWidth: g, className: "react-flow__edge-interaction" }) : null, s && Bt(r) && Bt(i) ? U.jsx(SS, { x: r, y: i, label: s, labelStyle: a, labelShowBg: c, labelBgStyle: f, labelBgPadding: p, labelBgBorderRadius: h }) : null] });
}
function hh({ pos: t, x1: r, y1: i, x2: s, y2: a }) {
  return t === we.Left || t === we.Right ? [0.5 * (r + s), i] : [r, 0.5 * (i + a)];
}
function am({ sourceX: t, sourceY: r, sourcePosition: i = we.Bottom, targetX: s, targetY: a, targetPosition: c = we.Top }) {
  const [f, p] = hh({
    pos: i,
    x1: t,
    y1: r,
    x2: s,
    y2: a
  }), [h, g] = hh({
    pos: c,
    x1: s,
    y1: a,
    x2: t,
    y2: r
  }), [m, w, y, x] = zg({
    sourceX: t,
    sourceY: r,
    targetX: s,
    targetY: a,
    sourceControlX: f,
    sourceControlY: p,
    targetControlX: h,
    targetControlY: g
  });
  return [
    `M${t},${r} C${f},${p} ${h},${g} ${s},${a}`,
    m,
    w,
    y,
    x
  ];
}
function um(t) {
  return K.memo(({ id: r, sourceX: i, sourceY: s, targetX: a, targetY: c, sourcePosition: f, targetPosition: p, label: h, labelStyle: g, labelShowBg: m, labelBgStyle: w, labelBgPadding: y, labelBgBorderRadius: x, style: _, markerEnd: M, markerStart: E, interactionWidth: C }) => {
    const [A, S, P] = am({
      sourceX: i,
      sourceY: s,
      sourcePosition: f,
      targetX: a,
      targetY: c,
      targetPosition: p
    }), T = t.isInternal ? void 0 : r;
    return U.jsx(bs, { id: T, path: A, labelX: S, labelY: P, label: h, labelStyle: g, labelShowBg: m, labelBgStyle: w, labelBgPadding: y, labelBgBorderRadius: x, style: _, markerEnd: M, markerStart: E, interactionWidth: C });
  });
}
const kS = um({ isInternal: !1 }), cm = um({ isInternal: !0 });
kS.displayName = "SimpleBezierEdge";
cm.displayName = "SimpleBezierEdgeInternal";
function fm(t) {
  return K.memo(({ id: r, sourceX: i, sourceY: s, targetX: a, targetY: c, label: f, labelStyle: p, labelShowBg: h, labelBgStyle: g, labelBgPadding: m, labelBgBorderRadius: w, style: y, sourcePosition: x = we.Bottom, targetPosition: _ = we.Top, markerEnd: M, markerStart: E, pathOptions: C, interactionWidth: A }) => {
    const [S, P, T] = rc({
      sourceX: i,
      sourceY: s,
      sourcePosition: x,
      targetX: a,
      targetY: c,
      targetPosition: _,
      borderRadius: C?.borderRadius,
      offset: C?.offset,
      stepPosition: C?.stepPosition
    }), I = t.isInternal ? void 0 : r;
    return U.jsx(bs, { id: I, path: S, labelX: P, labelY: T, label: f, labelStyle: p, labelShowBg: h, labelBgStyle: g, labelBgPadding: m, labelBgBorderRadius: w, style: y, markerEnd: M, markerStart: E, interactionWidth: A });
  });
}
const dm = fm({ isInternal: !1 }), pm = fm({ isInternal: !0 });
dm.displayName = "SmoothStepEdge";
pm.displayName = "SmoothStepEdgeInternal";
function hm(t) {
  return K.memo(({ id: r, ...i }) => {
    const s = t.isInternal ? void 0 : r;
    return U.jsx(dm, { ...i, id: s, pathOptions: K.useMemo(() => ({ borderRadius: 0, offset: i.pathOptions?.offset }), [i.pathOptions?.offset]) });
  });
}
const ES = hm({ isInternal: !1 }), gm = hm({ isInternal: !0 });
ES.displayName = "StepEdge";
gm.displayName = "StepEdgeInternal";
function mm(t) {
  return K.memo(({ id: r, sourceX: i, sourceY: s, targetX: a, targetY: c, label: f, labelStyle: p, labelShowBg: h, labelBgStyle: g, labelBgPadding: m, labelBgBorderRadius: w, style: y, markerEnd: x, markerStart: _, interactionWidth: M }) => {
    const [E, C, A] = Tg({ sourceX: i, sourceY: s, targetX: a, targetY: c }), S = t.isInternal ? void 0 : r;
    return U.jsx(bs, { id: S, path: E, labelX: C, labelY: A, label: f, labelStyle: p, labelShowBg: h, labelBgStyle: g, labelBgPadding: m, labelBgBorderRadius: w, style: y, markerEnd: x, markerStart: _, interactionWidth: M });
  });
}
const CS = mm({ isInternal: !1 }), ym = mm({ isInternal: !0 });
CS.displayName = "StraightEdge";
ym.displayName = "StraightEdgeInternal";
function vm(t) {
  return K.memo(({ id: r, sourceX: i, sourceY: s, targetX: a, targetY: c, sourcePosition: f = we.Bottom, targetPosition: p = we.Top, label: h, labelStyle: g, labelShowBg: m, labelBgStyle: w, labelBgPadding: y, labelBgBorderRadius: x, style: _, markerEnd: M, markerStart: E, pathOptions: C, interactionWidth: A }) => {
    const [S, P, T] = Pg({
      sourceX: i,
      sourceY: s,
      sourcePosition: f,
      targetX: a,
      targetY: c,
      targetPosition: p,
      curvature: C?.curvature
    }), I = t.isInternal ? void 0 : r;
    return U.jsx(bs, { id: I, path: S, labelX: P, labelY: T, label: h, labelStyle: g, labelShowBg: m, labelBgStyle: w, labelBgPadding: y, labelBgBorderRadius: x, style: _, markerEnd: M, markerStart: E, interactionWidth: A });
  });
}
const NS = vm({ isInternal: !1 }), wm = vm({ isInternal: !0 });
NS.displayName = "BezierEdge";
wm.displayName = "BezierEdgeInternal";
const gh = {
  default: wm,
  straight: ym,
  step: gm,
  smoothstep: pm,
  simplebezier: cm
}, mh = {
  sourceX: null,
  sourceY: null,
  targetX: null,
  targetY: null,
  sourcePosition: null,
  targetPosition: null,
  zIndex: void 0
}, MS = (t, r, i) => i === we.Left ? t - r : i === we.Right ? t + r : t, zS = (t, r, i) => i === we.Top ? t - r : i === we.Bottom ? t + r : t, yh = "react-flow__edgeupdater";
function vh({ position: t, centerX: r, centerY: i, radius: s = 10, onMouseDown: a, onMouseEnter: c, onMouseOut: f, type: p }) {
  return U.jsx("circle", { onMouseDown: a, onMouseEnter: c, onMouseOut: f, className: We([yh, `${yh}-${p}`]), cx: MS(r, s, t), cy: zS(i, s, t), r: s, stroke: "transparent", fill: "transparent" });
}
function PS({ isReconnectable: t, reconnectRadius: r, edge: i, sourceX: s, sourceY: a, targetX: c, targetY: f, sourcePosition: p, targetPosition: h, onReconnect: g, onReconnectStart: m, onReconnectEnd: w, setReconnecting: y, setUpdateHover: x }) {
  const _ = Re(), M = (P, T) => {
    if (P.button !== 0)
      return;
    const { autoPanOnConnect: I, domNode: D, connectionMode: Y, connectionRadius: X, lib: J, onConnectStart: q, cancelConnection: ee, nodeLookup: G, rfId: N, panBy: H, updateConnection: F } = _.getState(), j = T.type === "target", R = (k, $) => {
      y(!1), w?.(k, i, T.type, $);
    }, O = (k) => g?.(i, k), V = (k, $) => {
      y(!0), m?.(P, i, T.type), q?.(k, $);
    };
    lc.onPointerDown(P.nativeEvent, {
      autoPanOnConnect: I,
      connectionMode: Y,
      connectionRadius: X,
      domNode: D,
      handleId: T.id,
      nodeId: T.nodeId,
      nodeLookup: G,
      isTarget: j,
      edgeUpdaterType: T.type,
      lib: J,
      flowId: N,
      cancelConnection: ee,
      panBy: H,
      isValidConnection: (...k) => _.getState().isValidConnection?.(...k) ?? !0,
      onConnect: O,
      onConnectStart: V,
      onConnectEnd: (...k) => _.getState().onConnectEnd?.(...k),
      onReconnectEnd: R,
      updateConnection: F,
      getTransform: () => _.getState().transform,
      getFromHandle: () => _.getState().connection.fromHandle,
      dragThreshold: _.getState().connectionDragThreshold,
      handleDomNode: P.currentTarget
    });
  }, E = (P) => M(P, { nodeId: i.target, id: i.targetHandle ?? null, type: "target" }), C = (P) => M(P, { nodeId: i.source, id: i.sourceHandle ?? null, type: "source" }), A = () => x(!0), S = () => x(!1);
  return U.jsxs(U.Fragment, { children: [(t === !0 || t === "source") && U.jsx(vh, { position: p, centerX: s, centerY: a, radius: r, onMouseDown: E, onMouseEnter: A, onMouseOut: S, type: "source" }), (t === !0 || t === "target") && U.jsx(vh, { position: h, centerX: c, centerY: f, radius: r, onMouseDown: C, onMouseEnter: A, onMouseOut: S, type: "target" })] });
}
function IS({ id: t, edgesFocusable: r, edgesReconnectable: i, elementsSelectable: s, onClick: a, onDoubleClick: c, onContextMenu: f, onMouseEnter: p, onMouseMove: h, onMouseLeave: g, reconnectRadius: m, onReconnect: w, onReconnectStart: y, onReconnectEnd: x, rfId: _, edgeTypes: M, noPanClassName: E, onError: C, disableKeyboardA11y: A }) {
  let S = Me((me) => me.edgeLookup.get(t));
  const P = Me((me) => me.defaultEdgeOptions);
  S = P ? { ...P, ...S } : S;
  let T = S.type || "default", I = M?.[T] || gh[T];
  I === void 0 && (C?.("011", Wt.error011(T)), T = "default", I = M?.default || gh.default);
  const D = !!(S.focusable || r && typeof S.focusable > "u"), Y = typeof w < "u" && (S.reconnectable || i && typeof S.reconnectable > "u"), X = !!(S.selectable || s && typeof S.selectable > "u"), J = K.useRef(null), [q, ee] = K.useState(!1), [G, N] = K.useState(!1), H = Re(), { zIndex: F = S.zIndex, sourceX: j, sourceY: R, targetX: O, targetY: V, sourcePosition: k, targetPosition: $ } = Me(K.useCallback((me) => {
    const ye = me.nodeLookup.get(S.source), Ee = me.nodeLookup.get(S.target);
    if (!ye || !Ee)
      return mh;
    const Ce = v1({
      id: t,
      sourceNode: ye,
      targetNode: Ee,
      sourceHandle: S.sourceHandle || null,
      targetHandle: S.targetHandle || null,
      connectionMode: me.connectionMode,
      onError: C
    }), ze = u1({
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
  }, [S.source, S.target, S.sourceHandle, S.targetHandle, S.selected, S.zIndex, C]), Fe), ie = K.useMemo(() => S.markerStart ? `url('#${oc(S.markerStart, _)}')` : void 0, [S.markerStart, _]), re = K.useMemo(() => S.markerEnd ? `url('#${oc(S.markerEnd, _)}')` : void 0, [S.markerEnd, _]);
  if (S.hidden || j === null || R === null || O === null || V === null)
    return null;
  const ae = (me) => {
    const { addSelectedEdges: ye, unselectNodesAndEdges: Ee, multiSelectionActive: Ce } = H.getState();
    X && (H.setState({ nodesSelectionActive: !1 }), S.selected && Ce ? (Ee({ nodes: [], edges: [S] }), J.current?.blur()) : ye([t])), a && a(me, S);
  }, ce = c ? (me) => {
    c(me, { ...S });
  } : void 0, ue = f ? (me) => {
    f(me, { ...S });
  } : void 0, Q = p ? (me) => {
    p(me, { ...S });
  } : void 0, se = h ? (me) => {
    h(me, { ...S });
  } : void 0, ve = g ? (me) => {
    g(me, { ...S });
  } : void 0, Se = (me) => {
    if (!A && pg.includes(me.key) && X) {
      const { unselectNodesAndEdges: ye, addSelectedEdges: Ee } = H.getState();
      me.key === "Escape" ? (J.current?.blur(), ye({ edges: [S] })) : Ee([t]);
    }
  };
  return U.jsx("svg", { style: { zIndex: F }, children: U.jsxs("g", { className: We([
    "react-flow__edge",
    `react-flow__edge-${T}`,
    S.className,
    E,
    {
      selected: S.selected,
      animated: S.animated,
      inactive: !X && !a,
      updating: q,
      selectable: X
    }
  ]), onClick: ae, onDoubleClick: ce, onContextMenu: ue, onMouseEnter: Q, onMouseMove: se, onMouseLeave: ve, onKeyDown: D ? Se : void 0, tabIndex: D ? 0 : void 0, role: S.ariaRole ?? (D ? "group" : "img"), "aria-roledescription": "edge", "data-id": t, "data-testid": `rf__edge-${t}`, "aria-label": S.ariaLabel === null ? void 0 : S.ariaLabel || `Edge from ${S.source} to ${S.target}`, "aria-describedby": D ? `${Yg}-${_}` : void 0, ref: J, ...S.domAttributes, children: [!G && U.jsx(I, { id: t, source: S.source, target: S.target, type: S.type, selected: S.selected, animated: S.animated, selectable: X, deletable: S.deletable ?? !0, label: S.label, labelStyle: S.labelStyle, labelShowBg: S.labelShowBg, labelBgStyle: S.labelBgStyle, labelBgPadding: S.labelBgPadding, labelBgBorderRadius: S.labelBgBorderRadius, sourceX: j, sourceY: R, targetX: O, targetY: V, sourcePosition: k, targetPosition: $, data: S.data, style: S.style, sourceHandleId: S.sourceHandle, targetHandleId: S.targetHandle, markerStart: ie, markerEnd: re, pathOptions: "pathOptions" in S ? S.pathOptions : void 0, interactionWidth: S.interactionWidth }), Y && U.jsx(PS, { edge: S, isReconnectable: Y, reconnectRadius: m, onReconnect: w, onReconnectStart: y, onReconnectEnd: x, sourceX: j, sourceY: R, targetX: O, targetY: V, sourcePosition: k, targetPosition: $, setUpdateHover: ee, setReconnecting: N })] }) });
}
var TS = K.memo(IS);
const bS = (t) => ({
  edgesFocusable: t.edgesFocusable,
  edgesReconnectable: t.edgesReconnectable,
  elementsSelectable: t.elementsSelectable,
  connectionMode: t.connectionMode,
  onError: t.onError
});
function xm({ defaultMarkerColor: t, onlyRenderVisibleElements: r, rfId: i, edgeTypes: s, noPanClassName: a, onReconnect: c, onEdgeContextMenu: f, onEdgeMouseEnter: p, onEdgeMouseMove: h, onEdgeMouseLeave: g, onEdgeClick: m, reconnectRadius: w, onEdgeDoubleClick: y, onReconnectStart: x, onReconnectEnd: _, disableKeyboardA11y: M }) {
  const { edgesFocusable: E, edgesReconnectable: C, elementsSelectable: A, onError: S } = Me(bS, Fe), P = mS(r);
  return U.jsxs("div", { className: "react-flow__edges", children: [U.jsx(_S, { defaultColor: t, rfId: i }), P.map((T) => U.jsx(TS, { id: T, edgesFocusable: E, edgesReconnectable: C, elementsSelectable: A, noPanClassName: a, onReconnect: c, onContextMenu: f, onMouseEnter: p, onMouseMove: h, onMouseLeave: g, onClick: m, reconnectRadius: w, onDoubleClick: y, onReconnectStart: x, onReconnectEnd: _, rfId: i, onError: S, edgeTypes: s, disableKeyboardA11y: M }, T))] });
}
xm.displayName = "EdgeRenderer";
const RS = K.memo(xm), wh = (t) => `translate(${t[0]}px,${t[1]}px) scale(${t[2]})`;
function DS({ children: t }) {
  const r = Re(), i = K.useRef(null), [s] = K.useState(() => r.getState().transform);
  return qg(() => {
    let a = null;
    const c = () => {
      const f = r.getState().transform;
      a && f[0] === a[0] && f[1] === a[1] && f[2] === a[2] || (a = f, i.current && (i.current.style.transform = wh(f)));
    };
    return c(), r.subscribe(c);
  }, [r]), U.jsx("div", { ref: i, className: "react-flow__viewport xyflow__viewport react-flow__container", style: { transform: wh(s) }, children: t });
}
function LS(t) {
  const r = Ic(), i = K.useRef(!1);
  K.useEffect(() => {
    !i.current && r.viewportInitialized && t && (setTimeout(() => t(r), 1), i.current = !0);
  }, [t, r.viewportInitialized]);
}
const AS = (t) => t.panZoom?.syncViewport;
function $S(t) {
  const r = Me(AS), i = Re();
  return K.useEffect(() => {
    t && (r?.(t), i.setState({ transform: [t.x, t.y, t.zoom] }));
  }, [t, r]), null;
}
function OS(t) {
  return t.connection.inProgress ? { ...t.connection, to: zi(t.connection.to, t.transform) } : { ...t.connection };
}
function HS(t) {
  return OS;
}
function FS(t) {
  const r = HS();
  return Me(r, Fe);
}
const jS = (t) => ({
  nodesConnectable: t.nodesConnectable,
  isValid: t.connection.isValid,
  inProgress: t.connection.inProgress,
  width: t.width,
  height: t.height
});
function VS({ containerStyle: t, style: r, type: i, component: s }) {
  const { nodesConnectable: a, width: c, height: f, isValid: p, inProgress: h } = Me(jS, Fe);
  return !(c && a && h) ? null : U.jsx("svg", { style: t, width: c, height: f, className: "react-flow__connectionline react-flow__container", children: U.jsx("g", { className: We(["react-flow__connection", Eg(p)]), children: U.jsx(_m, { style: r, type: i, CustomComponent: s, isValid: p }) }) });
}
const _m = ({ style: t, type: r = Un.Bezier, CustomComponent: i, isValid: s }) => {
  const { inProgress: a, from: c, fromNode: f, fromHandle: p, fromPosition: h, to: g, toNode: m, toHandle: w, toPosition: y, pointer: x } = FS();
  if (!a)
    return;
  if (i)
    return U.jsx(i, { connectionLineType: r, connectionLineStyle: t, fromNode: f, fromHandle: p, fromX: c.x, fromY: c.y, toX: g.x, toY: g.y, fromPosition: h, toPosition: y, connectionStatus: Eg(s), toNode: m, toHandle: w, pointer: x });
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
      [_] = Pg(M);
      break;
    case Un.SimpleBezier:
      [_] = am(M);
      break;
    case Un.Step:
      [_] = rc({
        ...M,
        borderRadius: 0
      });
      break;
    case Un.SmoothStep:
      [_] = rc(M);
      break;
    default:
      [_] = Tg(M);
  }
  return U.jsx("path", { d: _, fill: "none", className: "react-flow__connection-path", style: t });
};
_m.displayName = "ConnectionLine";
const BS = {};
function xh(t = BS) {
  K.useRef(t), Re(), K.useEffect(() => {
  }, [t]);
}
function US() {
  Re(), K.useRef(!1), K.useEffect(() => {
  }, []);
}
function Sm({ nodeTypes: t, edgeTypes: r, onInit: i, onNodeClick: s, onEdgeClick: a, onNodeDoubleClick: c, onEdgeDoubleClick: f, onNodeMouseEnter: p, onNodeMouseMove: h, onNodeMouseLeave: g, onNodeContextMenu: m, onSelectionContextMenu: w, onSelectionStart: y, onSelectionEnd: x, connectionLineType: _, connectionLineStyle: M, connectionLineComponent: E, connectionLineContainerStyle: C, selectionKeyCode: A, selectionOnDrag: S, selectionMode: P, multiSelectionKeyCode: T, panActivationKeyCode: I, zoomActivationKeyCode: D, deleteKeyCode: Y, onlyRenderVisibleElements: X, elementsSelectable: J, defaultViewport: q, translateExtent: ee, minZoom: G, maxZoom: N, preventScrolling: H, defaultMarkerColor: F, zoomOnScroll: j, zoomOnPinch: R, panOnScroll: O, panOnScrollSpeed: V, panOnScrollMode: k, zoomOnDoubleClick: $, panOnDrag: ie, autoPanOnSelection: re, onPaneClick: ae, onPaneMouseEnter: ce, onPaneMouseMove: ue, onPaneMouseLeave: Q, onPaneScroll: se, onPaneContextMenu: ve, paneClickDistance: Se, nodeClickDistance: me, onEdgeContextMenu: ye, onEdgeMouseEnter: Ee, onEdgeMouseMove: Ce, onEdgeMouseLeave: ze, reconnectRadius: Ve, onReconnect: Ct, onReconnectStart: at, onReconnectEnd: et, noDragClassName: tt, noWheelClassName: ln, noPanClassName: Zt, disableKeyboardA11y: Qt, nodeExtent: ut, rfId: Nt, viewport: mt, onViewportChange: Mt, nodesDraggable: Cr }) {
  return xh(t), xh(r), US(), LS(i), $S(mt), U.jsx(lS, { onPaneClick: ae, onPaneMouseEnter: ce, onPaneMouseMove: ue, onPaneMouseLeave: Q, onPaneContextMenu: ve, onPaneScroll: se, paneClickDistance: Se, deleteKeyCode: Y, selectionKeyCode: A, selectionOnDrag: S, selectionMode: P, onSelectionStart: y, onSelectionEnd: x, multiSelectionKeyCode: T, panActivationKeyCode: I, zoomActivationKeyCode: D, elementsSelectable: J, zoomOnScroll: j, zoomOnPinch: R, zoomOnDoubleClick: $, panOnScroll: O, panOnScrollSpeed: V, panOnScrollMode: k, panOnDrag: ie, autoPanOnSelection: re, defaultViewport: q, translateExtent: ee, minZoom: G, maxZoom: N, onSelectionContextMenu: w, preventScrolling: H, noDragClassName: tt, noWheelClassName: ln, noPanClassName: Zt, disableKeyboardA11y: Qt, onViewportChange: Mt, isControlledViewport: !!mt, children: U.jsxs(DS, { children: [U.jsx(RS, { edgeTypes: r, onEdgeClick: a, onEdgeDoubleClick: f, onReconnect: Ct, onReconnectStart: at, onReconnectEnd: et, onlyRenderVisibleElements: X, onEdgeContextMenu: ye, onEdgeMouseEnter: Ee, onEdgeMouseMove: Ce, onEdgeMouseLeave: ze, reconnectRadius: Ve, defaultMarkerColor: F, noPanClassName: Zt, disableKeyboardA11y: Qt, rfId: Nt }), U.jsx(VS, { style: M, type: _, component: E, containerStyle: C }), U.jsx("div", { className: "react-flow__edgelabel-renderer" }), U.jsx(gS, { nodeTypes: t, onNodeClick: s, onNodeDoubleClick: c, onNodeMouseEnter: p, onNodeMouseMove: h, onNodeMouseLeave: g, onNodeContextMenu: m, nodeClickDistance: me, onlyRenderVisibleElements: X, noPanClassName: Zt, noDragClassName: tt, disableKeyboardA11y: Qt, nodeExtent: ut, rfId: Nt, nodesDraggable: Cr }), U.jsx("div", { className: "react-flow__viewport-portal" })] }) });
}
Sm.displayName = "GraphView";
const WS = K.memo(Sm), YS = _g(), _h = ({ nodes: t, edges: r, defaultNodes: i, defaultEdges: s, width: a, height: c, fitView: f, fitViewOptions: p, minZoom: h = 0.5, maxZoom: g = 2, nodeOrigin: m, nodeExtent: w, zIndexMode: y = "basic" } = {}) => {
  const x = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), M = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map(), C = s ?? r ?? [], A = i ?? t ?? [], S = m ?? [0, 0], P = w ?? yi;
  Dg(M, E, C);
  const { nodesInitialized: T } = ic(A, x, _, {
    nodeOrigin: S,
    nodeExtent: P,
    zIndexMode: y
  });
  let I = [0, 0, 1];
  if (f && a && c) {
    const D = Ni(x, {
      filter: (q) => !!((q.width || q.initialWidth) && (q.height || q.initialHeight))
    }), { x: Y, y: X, zoom: J } = kc(D, a, c, h, g, p?.padding ?? 0.1);
    I = [Y, X, J];
  }
  return {
    rfId: "1",
    width: a ?? 0,
    height: c ?? 0,
    transform: I,
    nodes: A,
    nodesInitialized: T,
    nodeLookup: x,
    parentLookup: _,
    edges: C,
    edgeLookup: E,
    connectionLookup: M,
    onNodesChange: null,
    onEdgesChange: null,
    hasDefaultNodes: i !== void 0,
    hasDefaultEdges: s !== void 0,
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
    connection: { ...gg },
    connectionClickStartHandle: null,
    connectOnClick: !0,
    ariaLiveMessage: "",
    autoPanOnConnect: !0,
    autoPanOnNodeDrag: !0,
    autoPanOnNodeFocus: !0,
    autoPanSpeed: 15,
    connectionRadius: 20,
    onError: YS,
    isValidConnection: void 0,
    onSelectionChangeHandlers: [],
    lib: "react",
    debug: !1,
    ariaLabelConfig: hg,
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
}, XS = ({ nodes: t, edges: r, defaultNodes: i, defaultEdges: s, width: a, height: c, fitView: f, fitViewOptions: p, minZoom: h, maxZoom: g, nodeOrigin: m, nodeExtent: w, zIndexMode: y }) => s_((x, _) => {
  async function M() {
    const { nodeLookup: E, panZoom: C, fitViewOptions: A, fitViewResolver: S, width: P, height: T, minZoom: I, maxZoom: D } = _();
    C && (await n1({
      nodes: E,
      width: P,
      height: T,
      panZoom: C,
      minZoom: I,
      maxZoom: D
    }, A), S?.resolve(!0), x({ fitViewResolver: null }));
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
      nodeExtent: w,
      defaultNodes: i,
      defaultEdges: s,
      zIndexMode: y
    }),
    setNodes: (E) => {
      const { nodeLookup: C, parentLookup: A, nodeOrigin: S, nodeExtent: P, elevateNodesOnSelect: T, fitViewQueued: I, zIndexMode: D, nodesSelectionActive: Y } = _(), { nodesInitialized: X, hasSelectedNodes: J } = ic(E, C, A, {
        nodeOrigin: S,
        nodeExtent: P,
        elevateNodesOnSelect: T,
        checkEquality: !0,
        zIndexMode: D
      }), q = Y && J;
      I && X ? (M(), x({
        nodes: E,
        nodesInitialized: X,
        fitViewQueued: !1,
        fitViewOptions: void 0,
        nodesSelectionActive: q
      })) : x({ nodes: E, nodesInitialized: X, nodesSelectionActive: q });
    },
    setEdges: (E) => {
      const { connectionLookup: C, edgeLookup: A } = _();
      Dg(C, A, E), x({ edges: E });
    },
    setDefaultNodesAndEdges: (E, C) => {
      if (E) {
        const { setNodes: A } = _();
        A(E), x({ hasDefaultNodes: !0 });
      }
      if (C) {
        const { setEdges: A } = _();
        A(C), x({ hasDefaultEdges: !0 });
      }
    },
    /*
     * Every node gets registered at a ResizeObserver. Whenever a node
     * changes its dimensions, this function is called to measure the
     * new dimensions and update the nodes.
     */
    updateNodeInternals: (E) => {
      const { triggerNodeChanges: C, nodeLookup: A, parentLookup: S, domNode: P, nodeOrigin: T, nodeExtent: I, debug: D, fitViewQueued: Y, zIndexMode: X } = _(), { changes: J, updatedInternals: q } = N1(E, A, S, P, T, I, X);
      q && (S1(A, S, { nodeOrigin: T, nodeExtent: I, zIndexMode: X }), Y ? (M(), x({ fitViewQueued: !1, fitViewOptions: void 0 })) : x({}), J?.length > 0 && (D && console.log("React Flow: trigger node changes", J), C?.(J)));
    },
    updateNodePositions: (E, C = !1) => {
      const A = [];
      let S = [];
      const { nodeLookup: P, triggerNodeChanges: T, connection: I, updateConnection: D, onNodesChangeMiddlewareMap: Y } = _();
      for (const [X, J] of E) {
        const q = P.get(X), ee = !!(q?.expandParent && q?.parentId && J?.position), G = {
          id: X,
          type: "position",
          position: ee ? {
            x: Math.max(0, J.position.x),
            y: Math.max(0, J.position.y)
          } : J.position,
          dragging: C
        };
        if (q && I.inProgress && I.fromNode.id === q.id) {
          const N = kr(q, I.fromHandle, we.Left, !0);
          D({ ...I, from: N });
        }
        ee && q.parentId && A.push({
          id: X,
          parentId: q.parentId,
          rect: {
            ...J.internals.positionAbsolute,
            width: J.measured.width ?? 0,
            height: J.measured.height ?? 0
          }
        }), S.push(G);
      }
      if (A.length > 0) {
        const { parentLookup: X, nodeOrigin: J } = _(), q = Pc(A, P, X, J);
        S.push(...q);
      }
      for (const X of Y.values())
        S = X(S);
      T(S);
    },
    triggerNodeChanges: (E) => {
      const { onNodesChange: C, setNodes: A, nodes: S, hasDefaultNodes: P, debug: T } = _();
      if (E?.length) {
        if (P) {
          const I = Qg(E, S);
          A(I);
        }
        T && console.log("React Flow: trigger node changes", E), C?.(E);
      }
    },
    triggerEdgeChanges: (E) => {
      const { onEdgesChange: C, setEdges: A, edges: S, hasDefaultEdges: P, debug: T } = _();
      if (E?.length) {
        if (P) {
          const I = Kg(E, S);
          A(I);
        }
        T && console.log("React Flow: trigger edge changes", E), C?.(E);
      }
    },
    addSelectedNodes: (E) => {
      const { multiSelectionActive: C, edgeLookup: A, nodeLookup: S, triggerNodeChanges: P, triggerEdgeChanges: T } = _();
      if (C) {
        const I = E.map((D) => pr(D, !0));
        P(I);
        return;
      }
      P(no(S, /* @__PURE__ */ new Set([...E]))), T(no(A));
    },
    addSelectedEdges: (E) => {
      const { multiSelectionActive: C, edgeLookup: A, nodeLookup: S, triggerNodeChanges: P, triggerEdgeChanges: T } = _();
      if (C) {
        const I = E.map((D) => pr(D, !0));
        T(I);
        return;
      }
      T(no(A, /* @__PURE__ */ new Set([...E]))), P(no(S, /* @__PURE__ */ new Set()));
    },
    unselectNodesAndEdges: ({ nodes: E, edges: C } = {}) => {
      const { edges: A, nodes: S, nodeLookup: P, triggerNodeChanges: T, triggerEdgeChanges: I } = _(), D = E || S, Y = C || A, X = [];
      for (const q of D)
        q.selected && X.push(pr(q.id, !1));
      const J = [];
      for (const q of Y)
        q.selected && J.push(pr(q.id, !1));
      T(X), I(J);
    },
    setMinZoom: (E) => {
      const { panZoom: C, maxZoom: A } = _();
      C?.setScaleExtent([E, A]), x({ minZoom: E });
    },
    setMaxZoom: (E) => {
      const { panZoom: C, minZoom: A } = _();
      C?.setScaleExtent([A, E]), x({ maxZoom: E });
    },
    setTranslateExtent: (E) => {
      _().panZoom?.setTranslateExtent(E), x({ translateExtent: E });
    },
    resetSelectedElements: () => {
      const { edges: E, nodes: C, triggerNodeChanges: A, triggerEdgeChanges: S, elementsSelectable: P } = _();
      if (!P)
        return;
      const T = C.reduce((D, Y) => Y.selected ? [...D, pr(Y.id, !1)] : D, []), I = E.reduce((D, Y) => Y.selected ? [...D, pr(Y.id, !1)] : D, []);
      A(T), S(I);
    },
    setNodeExtent: (E) => {
      const { nodes: C, nodeLookup: A, parentLookup: S, nodeOrigin: P, elevateNodesOnSelect: T, nodeExtent: I, zIndexMode: D } = _();
      E[0][0] === I[0][0] && E[0][1] === I[0][1] && E[1][0] === I[1][0] && E[1][1] === I[1][1] || (ic(C, A, S, {
        nodeOrigin: P,
        nodeExtent: E,
        elevateNodesOnSelect: T,
        checkEquality: !1,
        zIndexMode: D
      }), x({ nodeExtent: E }));
    },
    panBy: (E) => {
      const { transform: C, width: A, height: S, panZoom: P, translateExtent: T } = _();
      return M1({ delta: E, panZoom: P, transform: C, translateExtent: T, width: A, height: S });
    },
    setCenter: async (E, C, A) => {
      const { width: S, height: P, maxZoom: T, panZoom: I } = _();
      if (!I)
        return !1;
      const D = typeof A?.zoom < "u" ? A.zoom : T;
      return await I.setViewport({
        x: S / 2 - E * D,
        y: P / 2 - C * D,
        zoom: D
      }, { duration: A?.duration, ease: A?.ease, interpolate: A?.interpolate }), !0;
    },
    cancelConnection: () => {
      x({
        connection: { ...gg }
      });
    },
    updateConnection: (E) => {
      x({ connection: E });
    },
    reset: () => x({ ..._h() })
  };
}, Object.is);
function ZS({ initialNodes: t, initialEdges: r, defaultNodes: i, defaultEdges: s, initialWidth: a, initialHeight: c, initialMinZoom: f, initialMaxZoom: p, initialFitViewOptions: h, fitView: g, nodeOrigin: m, nodeExtent: w, zIndexMode: y, children: x }) {
  const [_] = K.useState(() => XS({
    nodes: t,
    edges: r,
    defaultNodes: i,
    defaultEdges: s,
    width: a,
    height: c,
    fitView: g,
    minZoom: f,
    maxZoom: p,
    fitViewOptions: h,
    nodeOrigin: m,
    nodeExtent: w,
    zIndexMode: y
  }));
  return U.jsx(a_, { value: _, children: U.jsx(b_, { children: U.jsx(X_, { children: x }) }) });
}
function QS({ children: t, nodes: r, edges: i, defaultNodes: s, defaultEdges: a, width: c, height: f, fitView: p, fitViewOptions: h, minZoom: g, maxZoom: m, nodeOrigin: w, nodeExtent: y, zIndexMode: x }) {
  return K.useContext(Ps) ? U.jsx(U.Fragment, { children: t }) : U.jsx(ZS, { initialNodes: r, initialEdges: i, defaultNodes: s, defaultEdges: a, initialWidth: c, initialHeight: f, fitView: p, initialFitViewOptions: h, initialMinZoom: g, initialMaxZoom: m, nodeOrigin: w, nodeExtent: y, zIndexMode: x, children: t });
}
const KS = {
  width: "100%",
  height: "100%",
  overflow: "hidden",
  position: "relative",
  zIndex: 0
};
function GS({ nodes: t, edges: r, defaultNodes: i, defaultEdges: s, className: a, nodeTypes: c, edgeTypes: f, onNodeClick: p, onEdgeClick: h, onInit: g, onMove: m, onMoveStart: w, onMoveEnd: y, onConnect: x, onConnectStart: _, onConnectEnd: M, onClickConnectStart: E, onClickConnectEnd: C, onNodeMouseEnter: A, onNodeMouseMove: S, onNodeMouseLeave: P, onNodeContextMenu: T, onNodeDoubleClick: I, onNodeDragStart: D, onNodeDrag: Y, onNodeDragStop: X, onNodesDelete: J, onEdgesDelete: q, onDelete: ee, onSelectionChange: G, onSelectionDragStart: N, onSelectionDrag: H, onSelectionDragStop: F, onSelectionContextMenu: j, onSelectionStart: R, onSelectionEnd: O, onBeforeDelete: V, connectionMode: k, connectionLineType: $ = Un.Bezier, connectionLineStyle: ie, connectionLineComponent: re, connectionLineContainerStyle: ae, deleteKeyCode: ce = "Backspace", selectionKeyCode: ue = "Shift", selectionOnDrag: Q = !1, selectionMode: se = vi.Full, panActivationKeyCode: ve = "Space", multiSelectionKeyCode: Se = xi() ? "Meta" : "Control", zoomActivationKeyCode: me = xi() ? "Meta" : "Control", snapToGrid: ye, snapGrid: Ee, onlyRenderVisibleElements: Ce = !1, selectNodesOnDrag: ze, nodesDraggable: Ve, autoPanOnNodeFocus: Ct, nodesConnectable: at, nodesFocusable: et, nodeOrigin: tt = Xg, edgesFocusable: ln, edgesReconnectable: Zt, elementsSelectable: Qt = !0, defaultViewport: ut = __, minZoom: Nt = 0.5, maxZoom: mt = 2, translateExtent: Mt = yi, preventScrolling: Cr = !0, nodeExtent: sn, defaultMarkerColor: Xn = "#b1b1b7", zoomOnScroll: Rs = !0, zoomOnPinch: Pi = !0, panOnScroll: Ii = !1, panOnScrollSpeed: Ds = 0.5, panOnScrollMode: yo = yr.Free, zoomOnDoubleClick: vo = !0, panOnDrag: wo = !0, onPaneClick: xo, onPaneMouseEnter: _o, onPaneMouseMove: xn, onPaneMouseLeave: _n, onPaneScroll: Ti, onPaneContextMenu: bi, paneClickDistance: Ri = 1, nodeClickDistance: Di = 0, children: Li, onReconnect: So, onReconnectStart: Ai, onReconnectEnd: Zn, onEdgeContextMenu: ko, onEdgeDoubleClick: Qn, onEdgeMouseEnter: Ls, onEdgeMouseMove: Kn, onEdgeMouseLeave: Nr, reconnectRadius: Mr = 10, onNodesChange: Eo, onEdgesChange: As, noDragClassName: $s = "nodrag", noWheelClassName: Os = "nowheel", noPanClassName: Kt = "nopan", fitView: Co, fitViewOptions: No, connectOnClick: Hs, attributionPosition: $i, proOptions: Oi, defaultEdgeOptions: Hi, elevateNodesOnSelect: Fi = !0, elevateEdgesOnSelect: Fs = !1, disableKeyboardA11y: ji = !1, autoPanOnConnect: $e, autoPanOnNodeDrag: js, autoPanOnSelection: Mo = !0, autoPanSpeed: Vi, connectionRadius: zr, isValidConnection: Vs, onError: Bi, style: Pr, id: yt, nodeDragThreshold: Bs, connectionDragThreshold: vt, viewport: Us, onViewportChange: Ws, width: Ys, height: Ir, colorMode: Tr = "light", debug: Gn, onScroll: qn, ariaLabelConfig: Xs, zIndexMode: Ui = "basic", ...zo }, Wi) {
  const Jn = yt || "1", er = C_(Tr), Zs = K.useCallback((br) => {
    br.currentTarget.scrollTo({ top: 0, left: 0, behavior: "instant" }), qn?.(br);
  }, [qn]);
  return U.jsx("div", { "data-testid": "rf__wrapper", ...zo, onScroll: Zs, style: { ...Pr, ...KS }, ref: Wi, className: We(["react-flow", a, er]), id: yt, role: "application", children: U.jsxs(QS, { nodes: t, edges: r, width: Ys, height: Ir, fitView: Co, fitViewOptions: No, minZoom: Nt, maxZoom: mt, nodeOrigin: tt, nodeExtent: sn, zIndexMode: Ui, children: [U.jsx(E_, { nodes: t, edges: r, defaultNodes: i, defaultEdges: s, onConnect: x, onConnectStart: _, onConnectEnd: M, onClickConnectStart: E, onClickConnectEnd: C, nodesDraggable: Ve, autoPanOnNodeFocus: Ct, nodesConnectable: at, nodesFocusable: et, edgesFocusable: ln, edgesReconnectable: Zt, elementsSelectable: Qt, elevateNodesOnSelect: Fi, elevateEdgesOnSelect: Fs, minZoom: Nt, maxZoom: mt, nodeExtent: sn, onNodesChange: Eo, onEdgesChange: As, snapToGrid: ye, snapGrid: Ee, connectionMode: k, translateExtent: Mt, connectOnClick: Hs, defaultEdgeOptions: Hi, fitView: Co, fitViewOptions: No, onNodesDelete: J, onEdgesDelete: q, onDelete: ee, onNodeDragStart: D, onNodeDrag: Y, onNodeDragStop: X, onSelectionDrag: H, onSelectionDragStart: N, onSelectionDragStop: F, onMove: m, onMoveStart: w, onMoveEnd: y, noPanClassName: Kt, nodeOrigin: tt, rfId: Jn, autoPanOnConnect: $e, autoPanOnNodeDrag: js, autoPanSpeed: Vi, onError: Bi, connectionRadius: zr, isValidConnection: Vs, selectNodesOnDrag: ze, nodeDragThreshold: Bs, connectionDragThreshold: vt, onBeforeDelete: V, debug: Gn, ariaLabelConfig: Xs, zIndexMode: Ui }), U.jsx(WS, { onInit: g, onNodeClick: p, onEdgeClick: h, onNodeMouseEnter: A, onNodeMouseMove: S, onNodeMouseLeave: P, onNodeContextMenu: T, onNodeDoubleClick: I, nodeTypes: c, edgeTypes: f, connectionLineType: $, connectionLineStyle: ie, connectionLineComponent: re, connectionLineContainerStyle: ae, selectionKeyCode: ue, selectionOnDrag: Q, selectionMode: se, deleteKeyCode: ce, multiSelectionKeyCode: Se, panActivationKeyCode: ve, zoomActivationKeyCode: me, onlyRenderVisibleElements: Ce, defaultViewport: ut, translateExtent: Mt, minZoom: Nt, maxZoom: mt, preventScrolling: Cr, zoomOnScroll: Rs, zoomOnPinch: Pi, zoomOnDoubleClick: vo, panOnScroll: Ii, panOnScrollSpeed: Ds, panOnScrollMode: yo, panOnDrag: wo, autoPanOnSelection: Mo, onPaneClick: xo, onPaneMouseEnter: _o, onPaneMouseMove: xn, onPaneMouseLeave: _n, onPaneScroll: Ti, onPaneContextMenu: bi, paneClickDistance: Ri, nodeClickDistance: Di, onSelectionContextMenu: j, onSelectionStart: R, onSelectionEnd: O, onReconnect: So, onReconnectStart: Ai, onReconnectEnd: Zn, onEdgeContextMenu: ko, onEdgeDoubleClick: Qn, onEdgeMouseEnter: Ls, onEdgeMouseMove: Kn, onEdgeMouseLeave: Nr, reconnectRadius: Mr, defaultMarkerColor: Xn, noDragClassName: $s, noWheelClassName: Os, noPanClassName: Kt, rfId: Jn, disableKeyboardA11y: ji, nodeExtent: sn, viewport: Us, onViewportChange: Ws, nodesDraggable: Ve }), U.jsx(x_, { onSelectionChange: G }), Li, U.jsx(g_, { proOptions: Oi, position: $i }), U.jsx(h_, { rfId: Jn, disableKeyboardA11y: ji })] }) });
}
var qS = Gg(GS);
function JS() {
  const t = Re();
  return K.useCallback((r) => {
    const { domNode: i, updateNodeInternals: s } = t.getState(), a = Array.isArray(r) ? r : [r], c = /* @__PURE__ */ new Map();
    a.forEach((f) => {
      const p = i?.querySelector(`.react-flow__node[data-id="${f}"]`);
      p && c.set(f, { id: f, nodeElement: p, force: !0 });
    }), requestAnimationFrame(() => s(c, { triggerFitView: !1 }));
  }, []);
}
function ek({ dimensions: t, lineWidth: r, variant: i, className: s }) {
  return U.jsx("path", { strokeWidth: r, d: `M${t[0] / 2} 0 V${t[1]} M0 ${t[1] / 2} H${t[0]}`, className: We(["react-flow__background-pattern", i, s]) });
}
function tk({ radius: t, className: r }) {
  return U.jsx("circle", { cx: t, cy: t, r: t, className: We(["react-flow__background-pattern", "dots", r]) });
}
var Wn;
(function(t) {
  t.Lines = "lines", t.Dots = "dots", t.Cross = "cross";
})(Wn || (Wn = {}));
const nk = {
  [Wn.Dots]: 1,
  [Wn.Lines]: 1,
  [Wn.Cross]: 6
}, rk = (t) => ({ transform: t.transform, patternId: `pattern-${t.rfId}` });
function km({
  id: t,
  variant: r = Wn.Dots,
  // only used for dots and cross
  gap: i = 20,
  // only used for lines and cross
  size: s,
  lineWidth: a = 1,
  offset: c = 0,
  color: f,
  bgColor: p,
  style: h,
  className: g,
  patternClassName: m
}) {
  const w = K.useRef(null), { transform: y, patternId: x } = Me(rk, Fe), _ = s || nk[r], M = r === Wn.Dots, E = r === Wn.Cross, C = Array.isArray(i) ? i : [i, i], A = [C[0] * y[2] || 1, C[1] * y[2] || 1], S = _ * y[2], P = Array.isArray(c) ? c : [c, c], T = E ? [S, S] : A, I = [
    P[0] * y[2] + T[0] / 2,
    P[1] * y[2] + T[1] / 2
  ], D = `${x}${t || ""}`;
  return U.jsxs("svg", { className: We(["react-flow__background", g]), style: {
    ...h,
    ...Ts,
    "--xy-background-color-props": p,
    "--xy-background-pattern-color-props": f
  }, ref: w, "data-testid": "rf__background", children: [U.jsx("pattern", { id: D, x: y[0] % A[0], y: y[1] % A[1], width: A[0], height: A[1], patternUnits: "userSpaceOnUse", patternTransform: `translate(-${I[0]},-${I[1]})`, children: M ? U.jsx(tk, { radius: S / 2, className: m }) : U.jsx(ek, { dimensions: T, lineWidth: a, variant: r, className: m }) }), U.jsx("rect", { x: "0", y: "0", width: "100%", height: "100%", fill: `url(#${D})` })] });
}
km.displayName = "Background";
const ok = K.memo(km);
function ik() {
  return U.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 32", children: U.jsx("path", { d: "M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z" }) });
}
function lk() {
  return U.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 5", children: U.jsx("path", { d: "M0 0h32v4.2H0z" }) });
}
function sk() {
  return U.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 30", children: U.jsx("path", { d: "M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0027.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94c-.531 0-.939-.4-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z" }) });
}
function ak() {
  return U.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 25 32", children: U.jsx("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z" }) });
}
function uk() {
  return U.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 25 32", children: U.jsx("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047z" }) });
}
function ts({ children: t, className: r, ...i }) {
  return U.jsx("button", { type: "button", className: We(["react-flow__controls-button", r]), ...i, children: t });
}
const ck = (t) => ({
  isInteractive: t.nodesDraggable || t.nodesConnectable || t.elementsSelectable,
  minZoomReached: t.transform[2] <= t.minZoom,
  maxZoomReached: t.transform[2] >= t.maxZoom,
  ariaLabelConfig: t.ariaLabelConfig
});
function Em({ style: t, showZoom: r = !0, showFitView: i = !0, showInteractive: s = !0, fitViewOptions: a, onZoomIn: c, onZoomOut: f, onFitView: p, onInteractiveChange: h, className: g, children: m, position: w = "bottom-left", orientation: y = "vertical", "aria-label": x }) {
  const _ = Re(), { isInteractive: M, minZoomReached: E, maxZoomReached: C, ariaLabelConfig: A } = Me(ck, Fe), { zoomIn: S, zoomOut: P, fitView: T } = Ic(), I = () => {
    S(), c?.();
  }, D = () => {
    P(), f?.();
  }, Y = () => {
    T(a), p?.();
  }, X = () => {
    _.setState({
      nodesDraggable: !M,
      nodesConnectable: !M,
      elementsSelectable: !M
    }), h?.(!M);
  }, J = y === "horizontal" ? "horizontal" : "vertical";
  return U.jsxs(Is, { className: We(["react-flow__controls", J, g]), position: w, style: t, "data-testid": "rf__controls", "aria-label": x ?? A["controls.ariaLabel"], children: [r && U.jsxs(U.Fragment, { children: [U.jsx(ts, { onClick: I, className: "react-flow__controls-zoomin", title: A["controls.zoomIn.ariaLabel"], "aria-label": A["controls.zoomIn.ariaLabel"], disabled: C, children: U.jsx(ik, {}) }), U.jsx(ts, { onClick: D, className: "react-flow__controls-zoomout", title: A["controls.zoomOut.ariaLabel"], "aria-label": A["controls.zoomOut.ariaLabel"], disabled: E, children: U.jsx(lk, {}) })] }), i && U.jsx(ts, { className: "react-flow__controls-fitview", onClick: Y, title: A["controls.fitView.ariaLabel"], "aria-label": A["controls.fitView.ariaLabel"], children: U.jsx(sk, {}) }), s && U.jsx(ts, { className: "react-flow__controls-interactive", onClick: X, title: A["controls.interactive.ariaLabel"], "aria-label": A["controls.interactive.ariaLabel"], children: M ? U.jsx(uk, {}) : U.jsx(ak, {}) }), m] });
}
Em.displayName = "Controls";
const fk = K.memo(Em);
function dk({ id: t, x: r, y: i, width: s, height: a, style: c, color: f, strokeColor: p, strokeWidth: h, className: g, borderRadius: m, shapeRendering: w, selected: y, onClick: x }) {
  const { background: _, backgroundColor: M } = c || {}, E = f || _ || M;
  return U.jsx("rect", { className: We(["react-flow__minimap-node", { selected: y }, g]), x: r, y: i, rx: m, ry: m, width: s, height: a, style: {
    fill: E,
    stroke: p,
    strokeWidth: h
  }, shapeRendering: w, onClick: x ? (C) => x(C, t) : void 0 });
}
const pk = K.memo(dk), hk = (t) => t.nodes.map((r) => r.id), Yu = (t) => t instanceof Function ? t : () => t;
function gk({
  nodeStrokeColor: t,
  nodeColor: r,
  nodeClassName: i = "",
  nodeBorderRadius: s = 5,
  nodeStrokeWidth: a,
  /*
   * We need to rename the prop to be `CapitalCase` so that JSX will render it as
   * a component properly.
   */
  nodeComponent: c = pk,
  onClick: f
}) {
  const p = Me(hk, Fe), h = Yu(r), g = Yu(t), m = Yu(i), w = typeof window > "u" || window.chrome ? "crispEdges" : "geometricPrecision";
  return U.jsx(U.Fragment, { children: p.map((y) => (
    /*
     * The split of responsibilities between MiniMapNodes and
     * NodeComponentWrapper may appear weird. However, it’s designed to
     * minimize the cost of updates when individual nodes change.
     *
     * For more details, see a similar commit in `NodeRenderer/index.tsx`.
     */
    U.jsx(yk, { id: y, nodeColorFunc: h, nodeStrokeColorFunc: g, nodeClassNameFunc: m, nodeBorderRadius: s, nodeStrokeWidth: a, NodeComponent: c, onClick: f, shapeRendering: w }, y)
  )) });
}
function mk({ id: t, nodeColorFunc: r, nodeStrokeColorFunc: i, nodeClassNameFunc: s, nodeBorderRadius: a, nodeStrokeWidth: c, shapeRendering: f, NodeComponent: p, onClick: h }) {
  const { node: g, x: m, y: w, width: y, height: x } = Me((_) => {
    const M = _.nodeLookup.get(t);
    if (!M)
      return { node: void 0, x: 0, y: 0, width: 0, height: 0 };
    const E = M.internals.userNode, { x: C, y: A } = M.internals.positionAbsolute, { width: S, height: P } = Xt(E);
    return {
      node: E,
      x: C,
      y: A,
      width: S,
      height: P
    };
  }, Fe);
  return !g || g.hidden || !Sg(g) ? null : U.jsx(p, { x: m, y: w, width: y, height: x, style: g.style, selected: !!g.selected, className: s(g), color: r(g), borderRadius: a, strokeColor: i(g), strokeWidth: c, shapeRendering: f, onClick: h, id: g.id });
}
const yk = K.memo(mk);
var vk = K.memo(gk);
const wk = 200, xk = 150, _k = (t) => !t.hidden, Sk = (t) => {
  const r = {
    x: -t.transform[0] / t.transform[2],
    y: -t.transform[1] / t.transform[2],
    width: t.width / t.transform[2],
    height: t.height / t.transform[2]
  };
  let i = !1;
  for (const s of t.nodeLookup.values())
    if (!s.hidden) {
      i = !0;
      break;
    }
  return {
    viewBB: r,
    boundingRect: i ? wg(Ni(t.nodeLookup, { filter: _k }), r) : r,
    rfId: t.rfId,
    panZoom: t.panZoom,
    translateExtent: t.translateExtent,
    flowWidth: t.width,
    flowHeight: t.height,
    ariaLabelConfig: t.ariaLabelConfig
  };
}, Sh = (t, r) => t.x === r.x && t.y === r.y && t.width === r.width && t.height === r.height, kk = (t, r) => Sh(t.viewBB, r.viewBB) && Sh(t.boundingRect, r.boundingRect) && t.rfId === r.rfId && t.panZoom === r.panZoom && t.translateExtent === r.translateExtent && t.flowWidth === r.flowWidth && t.flowHeight === r.flowHeight && t.ariaLabelConfig === r.ariaLabelConfig, Ek = "react-flow__minimap-desc";
function Cm({
  style: t,
  className: r,
  nodeStrokeColor: i,
  nodeColor: s,
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
  maskStrokeWidth: w,
  position: y = "bottom-right",
  onClick: x,
  onNodeClick: _,
  pannable: M = !1,
  zoomable: E = !1,
  ariaLabel: C,
  inversePan: A,
  zoomStep: S = 1,
  offsetScale: P = 5
}) {
  const T = Re(), I = K.useRef(null), { boundingRect: D, panZoom: Y, viewBB: X, rfId: J, translateExtent: q, flowWidth: ee, flowHeight: G, ariaLabelConfig: N } = Me(Sk, kk), H = t?.width ?? wk, F = t?.height ?? xk, j = D.width / H, R = D.height / F, O = Math.max(j, R), V = O * H, k = O * F, $ = P * O, ie = D.x - (V - D.width) / 2 - $, re = D.y - (k - D.height) / 2 - $, ae = V + $ * 2, ce = k + $ * 2, ue = `${Ek}-${J}`, Q = K.useRef(0), se = K.useRef();
  Q.current = O, K.useEffect(() => {
    const Ee = T.getState().panZoom;
    if (I.current && Ee)
      return se.current = A1({
        domNode: I.current,
        panZoom: Ee,
        getTransform: () => T.getState().transform,
        getViewScale: () => Q.current
      }), () => {
        se.current?.destroy();
      };
  }, [Y]), K.useEffect(() => {
    se.current?.update({
      translateExtent: q,
      width: ee,
      height: G,
      inversePan: A,
      pannable: M,
      zoomStep: S,
      zoomable: E
    });
  }, [M, E, A, S, q, ee, G]);
  const ve = x ? (Ee) => {
    const [Ce, ze] = se.current?.pointer(Ee) || [0, 0];
    x(Ee, { x: Ce, y: ze });
  } : void 0, Se = K.useCallback((Ee, Ce) => {
    const ze = T.getState().nodeLookup.get(Ce).internals.userNode;
    _?.(Ee, ze);
  }, [_]), me = _ ? Se : void 0, ye = C ?? N["minimap.ariaLabel"];
  return U.jsx(Is, { position: y, style: {
    ...t,
    "--xy-minimap-background-color-props": typeof h == "string" ? h : void 0,
    "--xy-minimap-mask-background-color-props": typeof g == "string" ? g : void 0,
    "--xy-minimap-mask-stroke-color-props": typeof m == "string" ? m : void 0,
    "--xy-minimap-mask-stroke-width-props": typeof w == "number" ? w * O : void 0,
    "--xy-minimap-node-background-color-props": typeof s == "string" ? s : void 0,
    "--xy-minimap-node-stroke-color-props": typeof i == "string" ? i : void 0,
    "--xy-minimap-node-stroke-width-props": typeof f == "number" ? f : void 0
  }, className: We(["react-flow__minimap", r]), "data-testid": "rf__minimap", children: U.jsxs("svg", { width: H, height: F, viewBox: `${ie} ${re} ${ae} ${ce}`, className: "react-flow__minimap-svg", role: "img", "aria-labelledby": ue, ref: I, onClick: ve, children: [ye && U.jsx("title", { id: ue, children: ye }), U.jsx(vk, { onClick: me, nodeColor: s, nodeStrokeColor: i, nodeBorderRadius: c, nodeClassName: a, nodeStrokeWidth: f, nodeComponent: p }), U.jsx("path", { className: "react-flow__minimap-mask", d: `M${ie - $},${re - $}h${ae + $ * 2}v${ce + $ * 2}h${-ae - $ * 2}z
        M${X.x},${X.y}h${X.width}v${X.height}h${-X.width}z`, fillRule: "evenodd", pointerEvents: "none" })] }) });
}
Cm.displayName = "MiniMap";
const Ck = K.memo(Cm), Nk = (t) => (r) => t ? `${Math.max(1 / r.transform[2], 1)}` : void 0, Mk = {
  [go.Line]: "right",
  [go.Handle]: "bottom-right"
};
function zk({ nodeId: t, position: r, variant: i = go.Handle, className: s, style: a = void 0, children: c, color: f, minWidth: p = 10, minHeight: h = 10, maxWidth: g = Number.MAX_VALUE, maxHeight: m = Number.MAX_VALUE, keepAspectRatio: w = !1, resizeDirection: y, autoScale: x = !0, shouldResize: _, onResizeStart: M, onResize: E, onResizeEnd: C }) {
  const A = nm(), S = typeof t == "string" ? t : A, P = Re(), T = K.useRef(null), I = i === go.Handle, D = Me(K.useCallback(Nk(I && x), [I, x]), Fe), Y = K.useRef(null), X = r ?? Mk[i];
  K.useEffect(() => {
    if (!(!T.current || !S))
      return Y.current || (Y.current = Q1({
        domNode: T.current,
        nodeId: S,
        getStoreItems: () => {
          const { nodeLookup: q, transform: ee, snapGrid: G, snapToGrid: N, nodeOrigin: H, domNode: F } = P.getState();
          return {
            nodeLookup: q,
            transform: ee,
            snapGrid: G,
            snapToGrid: N,
            nodeOrigin: H,
            paneDomNode: F
          };
        },
        onChange: (q, ee) => {
          const { triggerNodeChanges: G, nodeLookup: N, parentLookup: H, nodeOrigin: F } = P.getState(), j = [], R = { x: q.x, y: q.y }, O = N.get(S);
          if (O && O.expandParent && O.parentId) {
            const V = O.origin ?? F, k = q.width ?? O.measured.width ?? 0, $ = q.height ?? O.measured.height ?? 0, ie = {
              id: O.id,
              parentId: O.parentId,
              rect: {
                width: k,
                height: $,
                ...kg({
                  x: q.x ?? O.position.x,
                  y: q.y ?? O.position.y
                }, { width: k, height: $ }, O.parentId, N, V)
              }
            }, re = Pc([ie], N, H, F);
            j.push(...re), R.x = q.x ? Math.max(V[0] * k, q.x) : void 0, R.y = q.y ? Math.max(V[1] * $, q.y) : void 0;
          }
          if (R.x !== void 0 && R.y !== void 0) {
            const V = {
              id: S,
              type: "position",
              position: { ...R }
            };
            j.push(V);
          }
          if (q.width !== void 0 && q.height !== void 0) {
            const k = {
              id: S,
              type: "dimensions",
              resizing: !0,
              setAttributes: y ? y === "horizontal" ? "width" : "height" : !0,
              dimensions: {
                width: q.width,
                height: q.height
              }
            };
            j.push(k);
          }
          for (const V of ee) {
            const k = {
              ...V,
              type: "position"
            };
            j.push(k);
          }
          G(j);
        },
        onEnd: ({ width: q, height: ee }) => {
          const G = {
            id: S,
            type: "dimensions",
            resizing: !1,
            dimensions: {
              width: q,
              height: ee
            }
          };
          P.getState().triggerNodeChanges([G]);
        }
      })), Y.current.update({
        controlPosition: X,
        boundaries: {
          minWidth: p,
          minHeight: h,
          maxWidth: g,
          maxHeight: m
        },
        keepAspectRatio: w,
        resizeDirection: y,
        onResizeStart: M,
        onResize: E,
        onResizeEnd: C,
        shouldResize: _
      }), () => {
        Y.current?.destroy();
      };
  }, [
    X,
    p,
    h,
    g,
    m,
    w,
    M,
    E,
    C,
    _
  ]);
  const J = X.split("-");
  return U.jsx("div", { className: We(["react-flow__resize-control", "nodrag", ...J, i, s]), ref: T, style: {
    ...a,
    scale: D,
    ...f && { [I ? "backgroundColor" : "borderColor"]: f }
  }, children: c });
}
K.memo(zk);
function Pk({ ids: t }) {
  const r = Me((s) => s.domNode !== null), i = JS();
  return K.useEffect(() => {
    r && requestAnimationFrame(() => i(t.split(",")));
  }, [r, t, i]), null;
}
const Ft = "out:";
function Rk(t, r) {
  const i = /* @__PURE__ */ new Map(), s = (h, g) => {
    if (i.has(h)) return i.get(h);
    if (g.has(h)) return 0;
    g.add(h);
    const m = r.nodes.find((x) => x.id === h), w = Object.values(m?.inputs ?? {}).filter((x) => !!x), y = w.length === 0 ? 0 : 1 + Math.max(...w.map((x) => s(x, g)));
    return i.set(h, y), y;
  };
  r.nodes.forEach((h) => s(h.id, /* @__PURE__ */ new Set()));
  const a = Math.max(0, ...i.values()) + 1, c = /* @__PURE__ */ new Map(), f = (h) => {
    const g = c.get(h) ?? 0;
    return c.set(h, g + 1), g;
  }, p = {};
  for (const h of r.nodes) {
    const g = i.get(h.id) ?? 0;
    p[h.id] = { x: g * 240, y: f(g) * 150 };
  }
  for (const h of Object.keys(t.REQUIRED_OUTPUTS)) p[Ft + h] = { x: a * 240, y: f(a) * 64 };
  return p;
}
function Ik({ data: t }) {
  const { lib: r, node: i, idle: s, live: a, onParam: c } = t, f = r.KINDS[i.kind], p = Object.entries(f.inputs);
  return /* @__PURE__ */ U.jsxs("div", { className: `zn${s ? " idle" : ""}${f.fixed ? " fixed" : ""}`, title: `${f.reads}${i.note ? ` - ${i.note}` : ""}`, children: [
    /* @__PURE__ */ U.jsxs("div", { className: "zn-head", children: [
      /* @__PURE__ */ U.jsx("b", { children: i.id }),
      " ",
      f.label
    ] }),
    p.map(([h, g], m) => /* @__PURE__ */ U.jsxs("div", { className: "zn-row", children: [
      /* @__PURE__ */ U.jsx(Er, { type: "target", position: we.Left, id: h, className: `h-${g.split("|")[0]}`, style: { top: 38 + m * 22 } }),
      /* @__PURE__ */ U.jsx("span", { className: "zn-in", children: i.kind === "subtract" ? h === "a" ? "A (kept)" : "B (removed)" : h }),
      /* @__PURE__ */ U.jsx("span", { className: "zn-type", children: g.replace("|", " / ") })
    ] }, h)),
    Object.entries(i.params).map(([h, g]) => /* @__PURE__ */ U.jsxs("label", { className: "zn-row", title: a.includes(`${i.id}.${h}`) ? "LIVE: this one runs today - press Apply and run again beside the stages." : void 0, children: [
      /* @__PURE__ */ U.jsxs("span", { className: "zn-in", children: [
        h,
        a.includes(`${i.id}.${h}`) && /* @__PURE__ */ U.jsx("b", { className: "zn-live", children: " · live" })
      ] }),
      /* @__PURE__ */ U.jsx(
        "input",
        {
          className: "nodrag",
          defaultValue: String(g),
          type: typeof f.params[h] == "number" ? "number" : "text",
          step: "any",
          onBlur: (m) => c(i.id, h, typeof f.params[h] == "number" ? Number(m.target.value) : m.target.value)
        }
      )
    ] }, h)),
    s && /* @__PURE__ */ U.jsx("div", { className: "zn-note", children: "reaches no output - not evaluated" }),
    /* @__PURE__ */ U.jsx(Er, { type: "source", position: we.Right, id: "out", className: `h-${f.out}` }),
    /* @__PURE__ */ U.jsx("span", { className: "zn-outtype", children: f.out })
  ] });
}
function Tk({ data: t }) {
  return /* @__PURE__ */ U.jsxs("div", { className: `zo${t.filled ? "" : " empty"}`, title: `The engine reads "${t.name}" by name. It needs a ${t.want}; left empty, the run is refused.`, children: [
    /* @__PURE__ */ U.jsx(Er, { type: "target", position: we.Left, id: "in", className: `h-${t.want}` }),
    /* @__PURE__ */ U.jsx("b", { children: t.name }),
    " ",
    /* @__PURE__ */ U.jsx("span", { className: "zn-type", children: t.want })
  ] });
}
const bk = { zone: Ik, output: Tk };
function kh({ lib: t, graph: r, positions: i, liveParams: s = [], onGraph: a, onPositions: c }) {
  const f = K.useMemo(() => new Set(t.unreached(r)), [t, r]), p = K.useCallback((T, I, D) => a(t.setParam(r, T, I, D)), [t, r, a]), h = K.useMemo(() => [
    ...r.nodes.map((T) => ({
      id: T.id,
      type: "zone",
      position: i[T.id] ?? { x: 0, y: 0 },
      deletable: !t.KINDS[T.kind].fixed,
      data: { lib: t, node: T, idle: f.has(T.id), live: s, onParam: p }
    })),
    ...Object.entries(t.REQUIRED_OUTPUTS).map(([T, I]) => ({
      id: Ft + T,
      type: "output",
      position: i[Ft + T] ?? { x: 0, y: 0 },
      deletable: !1,
      data: { name: T, want: I, filled: !!r.outputs[T] }
    }))
  ], [r, i, t, f, s, p]), [g, m] = K.useState(h);
  K.useEffect(() => {
    m((T) => h.map((I) => {
      const D = T.find((Y) => Y.id === I.id);
      return D ? { ...I, measured: D.measured, selected: D.selected } : I;
    }));
  }, [h]);
  const w = K.useCallback((T) => m((I) => Qg(T, I)), []), y = K.useMemo(() => [
    ...r.nodes.flatMap((T) => Object.entries(T.inputs).filter(([, I]) => I).map(([I, D]) => ({
      id: `${D}->${T.id}.${I}`,
      source: D,
      sourceHandle: "out",
      target: T.id,
      targetHandle: I
    }))),
    ...Object.entries(r.outputs).filter(([, T]) => T).map(([T, I]) => ({
      id: `${I}->${Ft}${T}`,
      source: I,
      sourceHandle: "out",
      target: Ft + T,
      targetHandle: "in",
      className: "to-output"
    }))
  ], [r]), [x, _] = K.useState(y);
  K.useEffect(() => {
    _((T) => y.map((I) => ({ ...I, selected: T.find((D) => D.id === I.id)?.selected ?? !1 })));
  }, [y]);
  const M = K.useCallback((T) => _((I) => Kg(T, I)), []), E = K.useCallback((T) => {
    const I = r.nodes.find((J) => J.id === T.source);
    if (!I || T.source === T.target) return !1;
    const D = t.KINDS[I.kind].out;
    if (T.target?.startsWith(Ft)) return t.REQUIRED_OUTPUTS[T.target.slice(Ft.length)] === D;
    const Y = r.nodes.find((J) => J.id === T.target), X = Y && T.targetHandle ? t.KINDS[Y.kind].inputs[T.targetHandle] : void 0;
    return !!(X && X.split("|").includes(D));
  }, [r, t]), C = K.useCallback((T) => {
    !T.source || !T.target || (T.target.startsWith(Ft) ? a(t.bindOutput(r, T.target.slice(Ft.length), T.source)) : T.targetHandle && a(t.rewire(r, T.target, T.targetHandle, T.source)));
  }, [r, t, a]), A = K.useCallback((T) => {
    let I = r;
    for (const D of T)
      D.target.startsWith(Ft) ? I = t.bindOutput(I, D.target.slice(Ft.length), null) : D.targetHandle && (I = t.rewire(I, D.target, D.targetHandle, null));
    a(I);
  }, [r, t, a]), S = K.useCallback((T) => {
    let I = r;
    for (const D of T) D.type === "zone" && (I = t.removeNode(I, D.id));
    a(I);
  }, [r, t, a]), P = K.useCallback((T, I) => c({ ...i, [I.id]: I.position }), [i, c]);
  return /* @__PURE__ */ U.jsxs(
    qS,
    {
      nodes: g,
      edges: x,
      nodeTypes: bk,
      isValidConnection: E,
      onConnect: C,
      onEdgesDelete: A,
      onNodesDelete: S,
      onNodeDragStop: P,
      onNodesChange: w,
      onEdgesChange: M,
      deleteKeyCode: ["Backspace", "Delete"],
      fitView: !0,
      fitViewOptions: { minZoom: 0.6, padding: 0.05 },
      minZoom: 0.2,
      proOptions: { hideAttribution: !1 },
      children: [
        /* @__PURE__ */ U.jsx(Pk, { ids: g.map((T) => T.id).join(",") }),
        /* @__PURE__ */ U.jsx(ok, {}),
        /* @__PURE__ */ U.jsx(fk, {}),
        /* @__PURE__ */ U.jsx(Ck, { pannable: !0, zoomable: !0 })
      ]
    }
  );
}
let Eh = !1;
function Dk(t, r) {
  if (!Eh) {
    const s = document.createElement("style");
    s.dataset.ui = "node-editor-css", s.textContent = dy, document.head.append(s), Eh = !0;
  }
  const i = fy.createRoot(t);
  return i.render(/* @__PURE__ */ U.jsx(kh, { ...r })), {
    update: (s) => i.render(/* @__PURE__ */ U.jsx(kh, { ...s })),
    unmount: () => i.unmount()
  };
}
export {
  Rk as autoLayout,
  Dk as mountZoneEditor
};
