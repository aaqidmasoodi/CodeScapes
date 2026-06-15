var __create = Object.create
var __defProp = Object.defineProperty
var __getOwnPropDesc = Object.getOwnPropertyDescriptor
var __getOwnPropNames = Object.getOwnPropertyNames
var __getProtoOf = Object.getPrototypeOf
var __hasOwnProp = Object.prototype.hasOwnProperty
var __esm = (fn, res, err) =>
  function __init() {
    if (err) throw err[0]
    try {
      return (fn && (res = (0, fn[__getOwnPropNames(fn)[0]])((fn = 0))), res)
    } catch (e) {
      throw ((err = [e]), e)
    }
  }
var __commonJS = (cb, mod) =>
  function __require() {
    try {
      return (
        mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod),
        mod.exports
      )
    } catch (e) {
      throw ((mod = 0), e)
    }
  }
var __export = (target, all) => {
  for (var name in all) __defProp(target, name, { get: all[name], enumerable: true })
}
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        })
  }
  return to
}
var __reExport = (target, mod, secondTarget) => (
  __copyProps(target, mod, "default"),
  secondTarget && __copyProps(secondTarget, mod, "default")
)
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
)
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod)

// node_modules/tslib/tslib.es6.mjs
var tslib_es6_exports = {}
__export(tslib_es6_exports, {
  __addDisposableResource: () => __addDisposableResource,
  __assign: () => __assign,
  __asyncDelegator: () => __asyncDelegator,
  __asyncGenerator: () => __asyncGenerator,
  __asyncValues: () => __asyncValues,
  __await: () => __await,
  __awaiter: () => __awaiter,
  __classPrivateFieldGet: () => __classPrivateFieldGet,
  __classPrivateFieldIn: () => __classPrivateFieldIn,
  __classPrivateFieldSet: () => __classPrivateFieldSet,
  __createBinding: () => __createBinding,
  __decorate: () => __decorate,
  __disposeResources: () => __disposeResources,
  __esDecorate: () => __esDecorate,
  __exportStar: () => __exportStar,
  __extends: () => __extends,
  __generator: () => __generator,
  __importDefault: () => __importDefault,
  __importStar: () => __importStar,
  __makeTemplateObject: () => __makeTemplateObject,
  __metadata: () => __metadata,
  __param: () => __param,
  __propKey: () => __propKey,
  __read: () => __read,
  __rest: () => __rest,
  __rewriteRelativeImportExtension: () => __rewriteRelativeImportExtension,
  __runInitializers: () => __runInitializers,
  __setFunctionName: () => __setFunctionName,
  __spread: () => __spread,
  __spreadArray: () => __spreadArray,
  __spreadArrays: () => __spreadArrays,
  __values: () => __values,
  default: () => tslib_es6_default,
})
function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
    throw new TypeError("Class extends value " + String(b) + " is not a constructor or null")
  extendStatics(d, b)
  function __() {
    this.constructor = d
  }
  d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __())
}
function __rest(s, e) {
  var t = {}
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p]
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]]
    }
  return t
}
function __decorate(decorators, target, key, desc) {
  var c = arguments.length,
    r =
      c < 3 ? target : desc === null ? (desc = Object.getOwnPropertyDescriptor(target, key)) : desc,
    d
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc)
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if ((d = decorators[i])) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r
  return (c > 3 && r && Object.defineProperty(target, key, r), r)
}
function __param(paramIndex, decorator) {
  return function (target, key) {
    decorator(target, key, paramIndex)
  }
}
function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) {
    if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected")
    return f
  }
  var kind = contextIn.kind,
    key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value"
  var target = !descriptorIn && ctor ? (contextIn["static"] ? ctor : ctor.prototype) : null
  var descriptor =
    descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {})
  var _,
    done = false
  for (var i = decorators.length - 1; i >= 0; i--) {
    var context = {}
    for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p]
    for (var p in contextIn.access) context.access[p] = contextIn.access[p]
    context.addInitializer = function (f) {
      if (done) throw new TypeError("Cannot add initializers after decoration has completed")
      extraInitializers.push(accept(f || null))
    }
    var result = (0, decorators[i])(
      kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key],
      context
    )
    if (kind === "accessor") {
      if (result === void 0) continue
      if (result === null || typeof result !== "object") throw new TypeError("Object expected")
      if ((_ = accept(result.get))) descriptor.get = _
      if ((_ = accept(result.set))) descriptor.set = _
      if ((_ = accept(result.init))) initializers.unshift(_)
    } else if ((_ = accept(result))) {
      if (kind === "field") initializers.unshift(_)
      else descriptor[key] = _
    }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor)
  done = true
}
function __runInitializers(thisArg, initializers, value) {
  var useValue = arguments.length > 2
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg)
  }
  return useValue ? value : void 0
}
function __propKey(x) {
  return typeof x === "symbol" ? x : "".concat(x)
}
function __setFunctionName(f, name, prefix) {
  if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : ""
  return Object.defineProperty(f, "name", {
    configurable: true,
    value: prefix ? "".concat(prefix, " ", name) : name,
  })
}
function __metadata(metadataKey, metadataValue) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
    return Reflect.metadata(metadataKey, metadataValue)
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P
      ? value
      : new P(function (resolve) {
          resolve(value)
        })
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value))
      } catch (e) {
        reject(e)
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value))
      } catch (e) {
        reject(e)
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected)
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next())
  })
}
function __generator(thisArg, body) {
  var _ = {
      label: 0,
      sent: function () {
        if (t[0] & 1) throw t[1]
        return t[1]
      },
      trys: [],
      ops: [],
    },
    f,
    y,
    t,
    g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype)
  return (
    (g.next = verb(0)),
    (g["throw"] = verb(1)),
    (g["return"] = verb(2)),
    typeof Symbol === "function" &&
      (g[Symbol.iterator] = function () {
        return this
      }),
    g
  )
  function verb(n) {
    return function (v) {
      return step([n, v])
    }
  }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.")
    while ((g && ((g = 0), op[0] && (_ = 0)), _))
      try {
        if (
          ((f = 1),
          y &&
            (t =
              op[0] & 2
                ? y["return"]
                : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
            !(t = t.call(y, op[1])).done)
        )
          return t
        if (((y = 0), t)) op = [op[0] & 2, t.value]
        switch (op[0]) {
          case 0:
          case 1:
            t = op
            break
          case 4:
            _.label++
            return { value: op[1], done: false }
          case 5:
            _.label++
            y = op[1]
            op = [0]
            continue
          case 7:
            op = _.ops.pop()
            _.trys.pop()
            continue
          default:
            if (
              !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
              (op[0] === 6 || op[0] === 2)
            ) {
              _ = 0
              continue
            }
            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
              _.label = op[1]
              break
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1]
              t = op
              break
            }
            if (t && _.label < t[2]) {
              _.label = t[2]
              _.ops.push(op)
              break
            }
            if (t[2]) _.ops.pop()
            _.trys.pop()
            continue
        }
        op = body.call(thisArg, _)
      } catch (e) {
        op = [6, e]
        y = 0
      } finally {
        f = t = 0
      }
    if (op[0] & 5) throw op[1]
    return { value: op[0] ? op[1] : void 0, done: true }
  }
}
function __exportStar(m, o) {
  for (var p in m)
    if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p)
}
function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator,
    m = s && o[s],
    i = 0
  if (m) return m.call(o)
  if (o && typeof o.length === "number")
    return {
      next: function () {
        if (o && i >= o.length) o = void 0
        return { value: o && o[i++], done: !o }
      },
    }
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.")
}
function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator]
  if (!m) return o
  var i = m.call(o),
    r,
    ar = [],
    e
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value)
  } catch (error) {
    e = { error }
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i)
    } finally {
      if (e) throw e.error
    }
  }
  return ar
}
function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]))
  return ar
}
function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length
  for (var r = Array(s), k = 0, i = 0; i < il; i++)
    for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j]
  return r
}
function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2)
    for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar) ar = Array.prototype.slice.call(from, 0, i)
        ar[i] = from[i]
      }
    }
  return to.concat(ar || Array.prototype.slice.call(from))
}
function __await(v) {
  return this instanceof __await ? ((this.v = v), this) : new __await(v)
}
function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.")
  var g = generator.apply(thisArg, _arguments || []),
    i,
    q = []
  return (
    (i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype)),
    verb("next"),
    verb("throw"),
    verb("return", awaitReturn),
    (i[Symbol.asyncIterator] = function () {
      return this
    }),
    i
  )
  function awaitReturn(f) {
    return function (v) {
      return Promise.resolve(v).then(f, reject)
    }
  }
  function verb(n, f) {
    if (g[n]) {
      i[n] = function (v) {
        return new Promise(function (a, b) {
          q.push([n, v, a, b]) > 1 || resume(n, v)
        })
      }
      if (f) i[n] = f(i[n])
    }
  }
  function resume(n, v) {
    try {
      step(g[n](v))
    } catch (e) {
      settle(q[0][3], e)
    }
  }
  function step(r) {
    r.value instanceof __await
      ? Promise.resolve(r.value.v).then(fulfill, reject)
      : settle(q[0][2], r)
  }
  function fulfill(value) {
    resume("next", value)
  }
  function reject(value) {
    resume("throw", value)
  }
  function settle(f, v) {
    if ((f(v), q.shift(), q.length)) resume(q[0][0], q[0][1])
  }
}
function __asyncDelegator(o) {
  var i, p
  return (
    (i = {}),
    verb("next"),
    verb("throw", function (e) {
      throw e
    }),
    verb("return"),
    (i[Symbol.iterator] = function () {
      return this
    }),
    i
  )
  function verb(n, f) {
    i[n] = o[n]
      ? function (v) {
          return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v
        }
      : f
  }
}
function __asyncValues(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.")
  var m = o[Symbol.asyncIterator],
    i
  return m
    ? m.call(o)
    : ((o = typeof __values === "function" ? __values(o) : o[Symbol.iterator]()),
      (i = {}),
      verb("next"),
      verb("throw"),
      verb("return"),
      (i[Symbol.asyncIterator] = function () {
        return this
      }),
      i)
  function verb(n) {
    i[n] =
      o[n] &&
      function (v) {
        return new Promise(function (resolve, reject) {
          ;((v = o[n](v)), settle(resolve, reject, v.done, v.value))
        })
      }
  }
  function settle(resolve, reject, d, v) {
    Promise.resolve(v).then(function (v2) {
      resolve({ value: v2, done: d })
    }, reject)
  }
}
function __makeTemplateObject(cooked, raw) {
  if (Object.defineProperty) {
    Object.defineProperty(cooked, "raw", { value: raw })
  } else {
    cooked.raw = raw
  }
  return cooked
}
function __importStar(mod) {
  if (mod && mod.__esModule) return mod
  var result = {}
  if (mod != null) {
    for (var k = ownKeys(mod), i = 0; i < k.length; i++)
      if (k[i] !== "default") __createBinding(result, mod, k[i])
  }
  __setModuleDefault(result, mod)
  return result
}
function __importDefault(mod) {
  return mod && mod.__esModule ? mod : { default: mod }
}
function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter")
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it")
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver)
}
function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable")
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter")
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it")
  return (
    kind === "a" ? f.call(receiver, value) : f ? (f.value = value) : state.set(receiver, value),
    value
  )
}
function __classPrivateFieldIn(state, receiver) {
  if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function"))
    throw new TypeError("Cannot use 'in' operator on non-object")
  return typeof state === "function" ? receiver === state : state.has(receiver)
}
function __addDisposableResource(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function")
      throw new TypeError("Object expected.")
    var dispose, inner
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.")
      dispose = value[Symbol.asyncDispose]
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.")
      dispose = value[Symbol.dispose]
      if (async) inner = dispose
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.")
    if (inner)
      dispose = function () {
        try {
          inner.call(this)
        } catch (e) {
          return Promise.reject(e)
        }
      }
    env.stack.push({ value, dispose, async })
  } else if (async) {
    env.stack.push({ async: true })
  }
  return value
}
function __disposeResources(env) {
  function fail(e) {
    env.error = env.hasError
      ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.")
      : e
    env.hasError = true
  }
  var r,
    s = 0
  function next() {
    while ((r = env.stack.pop())) {
      try {
        if (!r.async && s === 1) return ((s = 0), env.stack.push(r), Promise.resolve().then(next))
        if (r.dispose) {
          var result = r.dispose.call(r.value)
          if (r.async)
            return (
              (s |= 2),
              Promise.resolve(result).then(next, function (e) {
                fail(e)
                return next()
              })
            )
        } else s |= 1
      } catch (e) {
        fail(e)
      }
    }
    if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve()
    if (env.hasError) throw env.error
  }
  return next()
}
function __rewriteRelativeImportExtension(path, preserveJsx) {
  if (typeof path === "string" && /^\.\.?\//.test(path)) {
    return path.replace(
      /\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i,
      function (m, tsx, d, ext, cm) {
        return tsx
          ? preserveJsx
            ? ".jsx"
            : ".js"
          : d && (!ext || !cm)
            ? m
            : d + ext + "." + cm.toLowerCase() + "js"
      }
    )
  }
  return path
}
var extendStatics,
  __assign,
  __createBinding,
  __setModuleDefault,
  ownKeys,
  _SuppressedError,
  tslib_es6_default
var init_tslib_es6 = __esm({
  "node_modules/tslib/tslib.es6.mjs"() {
    extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d2, b2) {
            d2.__proto__ = b2
          }) ||
        function (d2, b2) {
          for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p]
        }
      return extendStatics(d, b)
    }
    __assign = function () {
      __assign =
        Object.assign ||
        function __assign2(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i]
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
          }
          return t
        }
      return __assign.apply(this, arguments)
    }
    __createBinding = Object.create
      ? function (o, m, k, k2) {
          if (k2 === void 0) k2 = k
          var desc = Object.getOwnPropertyDescriptor(m, k)
          if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
            desc = {
              enumerable: true,
              get: function () {
                return m[k]
              },
            }
          }
          Object.defineProperty(o, k2, desc)
        }
      : function (o, m, k, k2) {
          if (k2 === void 0) k2 = k
          o[k2] = m[k]
        }
    __setModuleDefault = Object.create
      ? function (o, v) {
          Object.defineProperty(o, "default", { enumerable: true, value: v })
        }
      : function (o, v) {
          o["default"] = v
        }
    ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o2) {
          var ar = []
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k
          return ar
        }
      return ownKeys(o)
    }
    _SuppressedError =
      typeof SuppressedError === "function"
        ? SuppressedError
        : function (error, suppressed, message) {
            var e = new Error(message)
            return ((e.name = "SuppressedError"), (e.error = error), (e.suppressed = suppressed), e)
          }
    tslib_es6_default = {
      __extends,
      __assign,
      __rest,
      __decorate,
      __param,
      __esDecorate,
      __runInitializers,
      __propKey,
      __setFunctionName,
      __metadata,
      __awaiter,
      __generator,
      __createBinding,
      __exportStar,
      __values,
      __read,
      __spread,
      __spreadArrays,
      __spreadArray,
      __await,
      __asyncGenerator,
      __asyncDelegator,
      __asyncValues,
      __makeTemplateObject,
      __importStar,
      __importDefault,
      __classPrivateFieldGet,
      __classPrivateFieldSet,
      __classPrivateFieldIn,
      __addDisposableResource,
      __disposeResources,
      __rewriteRelativeImportExtension,
    }
  },
})

// node_modules/@supabase/functions-js/dist/main/helper.js
var require_helper = __commonJS({
  "node_modules/@supabase/functions-js/dist/main/helper.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.resolveFetch = void 0
    var resolveFetch3 = (customFetch) => {
      if (customFetch) {
        return (...args) => customFetch(...args)
      }
      return (...args) => fetch(...args)
    }
    exports.resolveFetch = resolveFetch3
  },
})

// node_modules/@supabase/functions-js/dist/main/types.js
var require_types = __commonJS({
  "node_modules/@supabase/functions-js/dist/main/types.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.FunctionRegion =
      exports.FunctionsHttpError =
      exports.FunctionsRelayError =
      exports.FunctionsFetchError =
      exports.FunctionsError =
        void 0
    var FunctionsError2 = class extends Error {
      constructor(message, name = "FunctionsError", context) {
        super(message)
        this.name = name
        this.context = context
      }
    }
    exports.FunctionsError = FunctionsError2
    var FunctionsFetchError2 = class extends FunctionsError2 {
      constructor(context) {
        super("Failed to send a request to the Edge Function", "FunctionsFetchError", context)
      }
    }
    exports.FunctionsFetchError = FunctionsFetchError2
    var FunctionsRelayError2 = class extends FunctionsError2 {
      constructor(context) {
        super("Relay Error invoking the Edge Function", "FunctionsRelayError", context)
      }
    }
    exports.FunctionsRelayError = FunctionsRelayError2
    var FunctionsHttpError2 = class extends FunctionsError2 {
      constructor(context) {
        super("Edge Function returned a non-2xx status code", "FunctionsHttpError", context)
      }
    }
    exports.FunctionsHttpError = FunctionsHttpError2
    var FunctionRegion2
    ;(function (FunctionRegion3) {
      FunctionRegion3["Any"] = "any"
      FunctionRegion3["ApNortheast1"] = "ap-northeast-1"
      FunctionRegion3["ApNortheast2"] = "ap-northeast-2"
      FunctionRegion3["ApSouth1"] = "ap-south-1"
      FunctionRegion3["ApSoutheast1"] = "ap-southeast-1"
      FunctionRegion3["ApSoutheast2"] = "ap-southeast-2"
      FunctionRegion3["CaCentral1"] = "ca-central-1"
      FunctionRegion3["EuCentral1"] = "eu-central-1"
      FunctionRegion3["EuWest1"] = "eu-west-1"
      FunctionRegion3["EuWest2"] = "eu-west-2"
      FunctionRegion3["EuWest3"] = "eu-west-3"
      FunctionRegion3["SaEast1"] = "sa-east-1"
      FunctionRegion3["UsEast1"] = "us-east-1"
      FunctionRegion3["UsWest1"] = "us-west-1"
      FunctionRegion3["UsWest2"] = "us-west-2"
    })(FunctionRegion2 || (exports.FunctionRegion = FunctionRegion2 = {}))
  },
})

// node_modules/@supabase/functions-js/dist/main/FunctionsClient.js
var require_FunctionsClient = __commonJS({
  "node_modules/@supabase/functions-js/dist/main/FunctionsClient.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.FunctionsClient = void 0
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports))
    var helper_1 = require_helper()
    var types_1 = require_types()
    var FunctionsClient2 = class {
      /**
       * Creates a new Functions client bound to an Edge Functions URL.
       *
       * @example
       * ```ts
       * import { FunctionsClient, FunctionRegion } from '@supabase/functions-js'
       *
       * const functions = new FunctionsClient('https://xyzcompany.supabase.co/functions/v1', {
       *   headers: { apikey: 'public-anon-key' },
       *   region: FunctionRegion.UsEast1,
       * })
       * ```
       */
      constructor(url, { headers = {}, customFetch, region = types_1.FunctionRegion.Any } = {}) {
        this.url = url
        this.headers = headers
        this.region = region
        this.fetch = (0, helper_1.resolveFetch)(customFetch)
      }
      /**
       * Updates the authorization header
       * @param token - the new jwt token sent in the authorisation header
       * @example
       * ```ts
       * functions.setAuth(session.access_token)
       * ```
       */
      setAuth(token) {
        this.headers.Authorization = `Bearer ${token}`
      }
      /**
       * Invokes a function
       * @param functionName - The name of the Function to invoke.
       * @param options - Options for invoking the Function.
       * @example
       * ```ts
       * const { data, error } = await functions.invoke('hello-world', {
       *   body: { name: 'Ada' },
       * })
       * ```
       */
      invoke(functionName_1) {
        return tslib_1.__awaiter(this, arguments, void 0, function* (functionName, options = {}) {
          var _a
          let timeoutId
          let timeoutController
          try {
            const { headers, method, body: functionArgs, signal, timeout } = options
            let _headers = {}
            let { region } = options
            if (!region) {
              region = this.region
            }
            const url = new URL(`${this.url}/${functionName}`)
            if (region && region !== "any") {
              _headers["x-region"] = region
              url.searchParams.set("forceFunctionRegion", region)
            }
            let body
            if (
              functionArgs &&
              ((headers && !Object.prototype.hasOwnProperty.call(headers, "Content-Type")) ||
                !headers)
            ) {
              if (
                (typeof Blob !== "undefined" && functionArgs instanceof Blob) ||
                functionArgs instanceof ArrayBuffer
              ) {
                _headers["Content-Type"] = "application/octet-stream"
                body = functionArgs
              } else if (typeof functionArgs === "string") {
                _headers["Content-Type"] = "text/plain"
                body = functionArgs
              } else if (typeof FormData !== "undefined" && functionArgs instanceof FormData) {
                body = functionArgs
              } else {
                _headers["Content-Type"] = "application/json"
                body = JSON.stringify(functionArgs)
              }
            } else {
              body = functionArgs
            }
            let effectiveSignal = signal
            if (timeout) {
              timeoutController = new AbortController()
              timeoutId = setTimeout(() => timeoutController.abort(), timeout)
              if (signal) {
                effectiveSignal = timeoutController.signal
                signal.addEventListener("abort", () => timeoutController.abort())
              } else {
                effectiveSignal = timeoutController.signal
              }
            }
            const response = yield this.fetch(url.toString(), {
              method: method || "POST",
              // headers priority is (high to low):
              // 1. invoke-level headers
              // 2. client-level headers
              // 3. default Content-Type header
              headers: Object.assign(
                Object.assign(Object.assign({}, _headers), this.headers),
                headers
              ),
              body,
              signal: effectiveSignal,
            }).catch((fetchError) => {
              throw new types_1.FunctionsFetchError(fetchError)
            })
            const isRelayError = response.headers.get("x-relay-error")
            if (isRelayError && isRelayError === "true") {
              throw new types_1.FunctionsRelayError(response)
            }
            if (!response.ok) {
              throw new types_1.FunctionsHttpError(response)
            }
            let responseType = (
              (_a = response.headers.get("Content-Type")) !== null && _a !== void 0
                ? _a
                : "text/plain"
            )
              .split(";")[0]
              .trim()
            let data
            if (responseType === "application/json") {
              data = yield response.json()
            } else if (
              responseType === "application/octet-stream" ||
              responseType === "application/pdf"
            ) {
              data = yield response.blob()
            } else if (responseType === "text/event-stream") {
              data = response
            } else if (responseType === "multipart/form-data") {
              data = yield response.formData()
            } else {
              data = yield response.text()
            }
            return { data, error: null, response }
          } catch (error) {
            return {
              data: null,
              error,
              response:
                error instanceof types_1.FunctionsHttpError ||
                error instanceof types_1.FunctionsRelayError
                  ? error.context
                  : void 0,
            }
          } finally {
            if (timeoutId) {
              clearTimeout(timeoutId)
            }
          }
        })
      }
    }
    exports.FunctionsClient = FunctionsClient2
  },
})

// node_modules/@supabase/functions-js/dist/main/index.js
var require_main = __commonJS({
  "node_modules/@supabase/functions-js/dist/main/index.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.FunctionRegion =
      exports.FunctionsRelayError =
      exports.FunctionsHttpError =
      exports.FunctionsFetchError =
      exports.FunctionsError =
      exports.FunctionsClient =
        void 0
    var FunctionsClient_1 = require_FunctionsClient()
    Object.defineProperty(exports, "FunctionsClient", {
      enumerable: true,
      get: function () {
        return FunctionsClient_1.FunctionsClient
      },
    })
    var types_1 = require_types()
    Object.defineProperty(exports, "FunctionsError", {
      enumerable: true,
      get: function () {
        return types_1.FunctionsError
      },
    })
    Object.defineProperty(exports, "FunctionsFetchError", {
      enumerable: true,
      get: function () {
        return types_1.FunctionsFetchError
      },
    })
    Object.defineProperty(exports, "FunctionsHttpError", {
      enumerable: true,
      get: function () {
        return types_1.FunctionsHttpError
      },
    })
    Object.defineProperty(exports, "FunctionsRelayError", {
      enumerable: true,
      get: function () {
        return types_1.FunctionsRelayError
      },
    })
    Object.defineProperty(exports, "FunctionRegion", {
      enumerable: true,
      get: function () {
        return types_1.FunctionRegion
      },
    })
  },
})

// node_modules/@supabase/realtime-js/dist/main/lib/websocket-factory.js
var require_websocket_factory = __commonJS({
  "node_modules/@supabase/realtime-js/dist/main/lib/websocket-factory.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.WebSocketFactory = void 0
    var WebSocketFactory = class {
      /**
       * Static-only utility – prevent instantiation.
       */
      constructor() {}
      static detectEnvironment() {
        var _a
        if (typeof WebSocket !== "undefined") {
          return { type: "native", constructor: WebSocket }
        }
        if (typeof globalThis !== "undefined" && typeof globalThis.WebSocket !== "undefined") {
          return { type: "native", constructor: globalThis.WebSocket }
        }
        if (typeof global !== "undefined" && typeof global.WebSocket !== "undefined") {
          return { type: "native", constructor: global.WebSocket }
        }
        if (
          typeof globalThis !== "undefined" &&
          typeof globalThis.WebSocketPair !== "undefined" &&
          typeof globalThis.WebSocket === "undefined"
        ) {
          return {
            type: "cloudflare",
            error:
              "Cloudflare Workers detected. WebSocket clients are not supported in Cloudflare Workers.",
            workaround:
              "Use Cloudflare Workers WebSocket API for server-side WebSocket handling, or deploy to a different runtime.",
          }
        }
        if (
          (typeof globalThis !== "undefined" && globalThis.EdgeRuntime) ||
          (typeof navigator !== "undefined" &&
            ((_a = navigator.userAgent) === null || _a === void 0
              ? void 0
              : _a.includes("Vercel-Edge")))
        ) {
          return {
            type: "unsupported",
            error:
              "Edge runtime detected (Vercel Edge/Netlify Edge). WebSockets are not supported in edge functions.",
            workaround:
              "Use serverless functions or a different deployment target for WebSocket functionality.",
          }
        }
        if (typeof process !== "undefined") {
          const processVersions = process["versions"]
          if (processVersions && processVersions["node"]) {
            const versionString = processVersions["node"]
            const nodeVersion = parseInt(versionString.replace(/^v/, "").split(".")[0])
            if (nodeVersion >= 22) {
              if (typeof globalThis.WebSocket !== "undefined") {
                return { type: "native", constructor: globalThis.WebSocket }
              }
              return {
                type: "unsupported",
                error: `Node.js ${nodeVersion} detected but native WebSocket not found.`,
                workaround: "Provide a WebSocket implementation via the transport option.",
              }
            }
            return {
              type: "unsupported",
              error: `Node.js ${nodeVersion} detected without native WebSocket support.`,
              workaround:
                'For Node.js < 22, install "ws" package and provide it via the transport option:\nimport ws from "ws"\nnew RealtimeClient(url, { transport: ws })',
            }
          }
        }
        return {
          type: "unsupported",
          error: "Unknown JavaScript runtime without WebSocket support.",
          workaround:
            "Ensure you're running in a supported environment (browser, Node.js, Deno) or provide a custom WebSocket implementation.",
        }
      }
      /**
       * Returns the best available WebSocket constructor for the current runtime.
       *
       * @example
       * ```ts
       * const WS = WebSocketFactory.getWebSocketConstructor()
       * const socket = new WS('wss://realtime.supabase.co/socket')
       * ```
       */
      static getWebSocketConstructor() {
        const env = this.detectEnvironment()
        if (env.constructor) {
          return env.constructor
        }
        let errorMessage = env.error || "WebSocket not supported in this environment."
        if (env.workaround) {
          errorMessage += `

Suggested solution: ${env.workaround}`
        }
        throw new Error(errorMessage)
      }
      /**
       * Creates a WebSocket using the detected constructor.
       *
       * @example
       * ```ts
       * const socket = WebSocketFactory.createWebSocket('wss://realtime.supabase.co/socket')
       * ```
       */
      static createWebSocket(url, protocols) {
        const WS = this.getWebSocketConstructor()
        return new WS(url, protocols)
      }
      /**
       * Detects whether the runtime can establish WebSocket connections.
       *
       * @example
       * ```ts
       * if (!WebSocketFactory.isWebSocketSupported()) {
       *   console.warn('Falling back to long polling')
       * }
       * ```
       */
      static isWebSocketSupported() {
        try {
          const env = this.detectEnvironment()
          return env.type === "native" || env.type === "ws"
        } catch (_a) {
          return false
        }
      }
    }
    exports.WebSocketFactory = WebSocketFactory
    exports.default = WebSocketFactory
  },
})

// node_modules/@supabase/realtime-js/dist/main/lib/version.js
var require_version = __commonJS({
  "node_modules/@supabase/realtime-js/dist/main/lib/version.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.version = void 0
    exports.version = "2.88.0"
  },
})

// node_modules/@supabase/realtime-js/dist/main/lib/constants.js
var require_constants = __commonJS({
  "node_modules/@supabase/realtime-js/dist/main/lib/constants.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.CONNECTION_STATE =
      exports.TRANSPORTS =
      exports.CHANNEL_EVENTS =
      exports.CHANNEL_STATES =
      exports.SOCKET_STATES =
      exports.MAX_PUSH_BUFFER_SIZE =
      exports.WS_CLOSE_NORMAL =
      exports.DEFAULT_TIMEOUT =
      exports.VERSION =
      exports.DEFAULT_VSN =
      exports.VSN_2_0_0 =
      exports.VSN_1_0_0 =
      exports.DEFAULT_VERSION =
        void 0
    var version_1 = require_version()
    exports.DEFAULT_VERSION = `realtime-js/${version_1.version}`
    exports.VSN_1_0_0 = "1.0.0"
    exports.VSN_2_0_0 = "2.0.0"
    exports.DEFAULT_VSN = exports.VSN_1_0_0
    exports.VERSION = version_1.version
    exports.DEFAULT_TIMEOUT = 1e4
    exports.WS_CLOSE_NORMAL = 1e3
    exports.MAX_PUSH_BUFFER_SIZE = 100
    var SOCKET_STATES
    ;(function (SOCKET_STATES2) {
      SOCKET_STATES2[(SOCKET_STATES2["connecting"] = 0)] = "connecting"
      SOCKET_STATES2[(SOCKET_STATES2["open"] = 1)] = "open"
      SOCKET_STATES2[(SOCKET_STATES2["closing"] = 2)] = "closing"
      SOCKET_STATES2[(SOCKET_STATES2["closed"] = 3)] = "closed"
    })(SOCKET_STATES || (exports.SOCKET_STATES = SOCKET_STATES = {}))
    var CHANNEL_STATES
    ;(function (CHANNEL_STATES2) {
      CHANNEL_STATES2["closed"] = "closed"
      CHANNEL_STATES2["errored"] = "errored"
      CHANNEL_STATES2["joined"] = "joined"
      CHANNEL_STATES2["joining"] = "joining"
      CHANNEL_STATES2["leaving"] = "leaving"
    })(CHANNEL_STATES || (exports.CHANNEL_STATES = CHANNEL_STATES = {}))
    var CHANNEL_EVENTS
    ;(function (CHANNEL_EVENTS2) {
      CHANNEL_EVENTS2["close"] = "phx_close"
      CHANNEL_EVENTS2["error"] = "phx_error"
      CHANNEL_EVENTS2["join"] = "phx_join"
      CHANNEL_EVENTS2["reply"] = "phx_reply"
      CHANNEL_EVENTS2["leave"] = "phx_leave"
      CHANNEL_EVENTS2["access_token"] = "access_token"
    })(CHANNEL_EVENTS || (exports.CHANNEL_EVENTS = CHANNEL_EVENTS = {}))
    var TRANSPORTS
    ;(function (TRANSPORTS2) {
      TRANSPORTS2["websocket"] = "websocket"
    })(TRANSPORTS || (exports.TRANSPORTS = TRANSPORTS = {}))
    var CONNECTION_STATE
    ;(function (CONNECTION_STATE2) {
      CONNECTION_STATE2["Connecting"] = "connecting"
      CONNECTION_STATE2["Open"] = "open"
      CONNECTION_STATE2["Closing"] = "closing"
      CONNECTION_STATE2["Closed"] = "closed"
    })(CONNECTION_STATE || (exports.CONNECTION_STATE = CONNECTION_STATE = {}))
  },
})

// node_modules/@supabase/realtime-js/dist/main/lib/serializer.js
var require_serializer = __commonJS({
  "node_modules/@supabase/realtime-js/dist/main/lib/serializer.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    var Serializer = class {
      constructor(allowedMetadataKeys) {
        this.HEADER_LENGTH = 1
        this.USER_BROADCAST_PUSH_META_LENGTH = 6
        this.KINDS = { userBroadcastPush: 3, userBroadcast: 4 }
        this.BINARY_ENCODING = 0
        this.JSON_ENCODING = 1
        this.BROADCAST_EVENT = "broadcast"
        this.allowedMetadataKeys = []
        this.allowedMetadataKeys =
          allowedMetadataKeys !== null && allowedMetadataKeys !== void 0 ? allowedMetadataKeys : []
      }
      encode(msg, callback) {
        if (
          msg.event === this.BROADCAST_EVENT &&
          !(msg.payload instanceof ArrayBuffer) &&
          typeof msg.payload.event === "string"
        ) {
          return callback(this._binaryEncodeUserBroadcastPush(msg))
        }
        let payload = [msg.join_ref, msg.ref, msg.topic, msg.event, msg.payload]
        return callback(JSON.stringify(payload))
      }
      _binaryEncodeUserBroadcastPush(message) {
        var _a
        if (
          this._isArrayBuffer(
            (_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload
          )
        ) {
          return this._encodeBinaryUserBroadcastPush(message)
        } else {
          return this._encodeJsonUserBroadcastPush(message)
        }
      }
      _encodeBinaryUserBroadcastPush(message) {
        var _a, _b
        const userPayload =
          (_b = (_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload) !== null &&
          _b !== void 0
            ? _b
            : new ArrayBuffer(0)
        return this._encodeUserBroadcastPush(message, this.BINARY_ENCODING, userPayload)
      }
      _encodeJsonUserBroadcastPush(message) {
        var _a, _b
        const userPayload =
          (_b = (_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload) !== null &&
          _b !== void 0
            ? _b
            : {}
        const encoder = new TextEncoder()
        const encodedUserPayload = encoder.encode(JSON.stringify(userPayload)).buffer
        return this._encodeUserBroadcastPush(message, this.JSON_ENCODING, encodedUserPayload)
      }
      _encodeUserBroadcastPush(message, encodingType, encodedPayload) {
        var _a, _b
        const topic = message.topic
        const ref = (_a = message.ref) !== null && _a !== void 0 ? _a : ""
        const joinRef = (_b = message.join_ref) !== null && _b !== void 0 ? _b : ""
        const userEvent = message.payload.event
        const rest = this.allowedMetadataKeys
          ? this._pick(message.payload, this.allowedMetadataKeys)
          : {}
        const metadata = Object.keys(rest).length === 0 ? "" : JSON.stringify(rest)
        if (joinRef.length > 255) {
          throw new Error(`joinRef length ${joinRef.length} exceeds maximum of 255`)
        }
        if (ref.length > 255) {
          throw new Error(`ref length ${ref.length} exceeds maximum of 255`)
        }
        if (topic.length > 255) {
          throw new Error(`topic length ${topic.length} exceeds maximum of 255`)
        }
        if (userEvent.length > 255) {
          throw new Error(`userEvent length ${userEvent.length} exceeds maximum of 255`)
        }
        if (metadata.length > 255) {
          throw new Error(`metadata length ${metadata.length} exceeds maximum of 255`)
        }
        const metaLength =
          this.USER_BROADCAST_PUSH_META_LENGTH +
          joinRef.length +
          ref.length +
          topic.length +
          userEvent.length +
          metadata.length
        const header = new ArrayBuffer(this.HEADER_LENGTH + metaLength)
        let view = new DataView(header)
        let offset = 0
        view.setUint8(offset++, this.KINDS.userBroadcastPush)
        view.setUint8(offset++, joinRef.length)
        view.setUint8(offset++, ref.length)
        view.setUint8(offset++, topic.length)
        view.setUint8(offset++, userEvent.length)
        view.setUint8(offset++, metadata.length)
        view.setUint8(offset++, encodingType)
        Array.from(joinRef, (char) => view.setUint8(offset++, char.charCodeAt(0)))
        Array.from(ref, (char) => view.setUint8(offset++, char.charCodeAt(0)))
        Array.from(topic, (char) => view.setUint8(offset++, char.charCodeAt(0)))
        Array.from(userEvent, (char) => view.setUint8(offset++, char.charCodeAt(0)))
        Array.from(metadata, (char) => view.setUint8(offset++, char.charCodeAt(0)))
        var combined = new Uint8Array(header.byteLength + encodedPayload.byteLength)
        combined.set(new Uint8Array(header), 0)
        combined.set(new Uint8Array(encodedPayload), header.byteLength)
        return combined.buffer
      }
      decode(rawPayload, callback) {
        if (this._isArrayBuffer(rawPayload)) {
          let result = this._binaryDecode(rawPayload)
          return callback(result)
        }
        if (typeof rawPayload === "string") {
          const jsonPayload = JSON.parse(rawPayload)
          const [join_ref, ref, topic, event, payload] = jsonPayload
          return callback({ join_ref, ref, topic, event, payload })
        }
        return callback({})
      }
      _binaryDecode(buffer) {
        const view = new DataView(buffer)
        const kind = view.getUint8(0)
        const decoder = new TextDecoder()
        switch (kind) {
          case this.KINDS.userBroadcast:
            return this._decodeUserBroadcast(buffer, view, decoder)
        }
      }
      _decodeUserBroadcast(buffer, view, decoder) {
        const topicSize = view.getUint8(1)
        const userEventSize = view.getUint8(2)
        const metadataSize = view.getUint8(3)
        const payloadEncoding = view.getUint8(4)
        let offset = this.HEADER_LENGTH + 4
        const topic = decoder.decode(buffer.slice(offset, offset + topicSize))
        offset = offset + topicSize
        const userEvent = decoder.decode(buffer.slice(offset, offset + userEventSize))
        offset = offset + userEventSize
        const metadata = decoder.decode(buffer.slice(offset, offset + metadataSize))
        offset = offset + metadataSize
        const payload = buffer.slice(offset, buffer.byteLength)
        const parsedPayload =
          payloadEncoding === this.JSON_ENCODING ? JSON.parse(decoder.decode(payload)) : payload
        const data = {
          type: this.BROADCAST_EVENT,
          event: userEvent,
          payload: parsedPayload,
        }
        if (metadataSize > 0) {
          data["meta"] = JSON.parse(metadata)
        }
        return { join_ref: null, ref: null, topic, event: this.BROADCAST_EVENT, payload: data }
      }
      _isArrayBuffer(buffer) {
        var _a
        return (
          buffer instanceof ArrayBuffer ||
          ((_a = buffer === null || buffer === void 0 ? void 0 : buffer.constructor) === null ||
          _a === void 0
            ? void 0
            : _a.name) === "ArrayBuffer"
        )
      }
      _pick(obj, keys) {
        if (!obj || typeof obj !== "object") {
          return {}
        }
        return Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key)))
      }
    }
    exports.default = Serializer
  },
})

// node_modules/@supabase/realtime-js/dist/main/lib/timer.js
var require_timer = __commonJS({
  "node_modules/@supabase/realtime-js/dist/main/lib/timer.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    var Timer = class {
      constructor(callback, timerCalc) {
        this.callback = callback
        this.timerCalc = timerCalc
        this.timer = void 0
        this.tries = 0
        this.callback = callback
        this.timerCalc = timerCalc
      }
      reset() {
        this.tries = 0
        clearTimeout(this.timer)
        this.timer = void 0
      }
      // Cancels any previous scheduleTimeout and schedules callback
      scheduleTimeout() {
        clearTimeout(this.timer)
        this.timer = setTimeout(
          () => {
            this.tries = this.tries + 1
            this.callback()
          },
          this.timerCalc(this.tries + 1)
        )
      }
    }
    exports.default = Timer
  },
})

// node_modules/@supabase/realtime-js/dist/main/lib/transformers.js
var require_transformers = __commonJS({
  "node_modules/@supabase/realtime-js/dist/main/lib/transformers.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.httpEndpointURL =
      exports.toTimestampString =
      exports.toArray =
      exports.toJson =
      exports.toNumber =
      exports.toBoolean =
      exports.convertCell =
      exports.convertColumn =
      exports.convertChangeData =
      exports.PostgresTypes =
        void 0
    var PostgresTypes
    ;(function (PostgresTypes2) {
      PostgresTypes2["abstime"] = "abstime"
      PostgresTypes2["bool"] = "bool"
      PostgresTypes2["date"] = "date"
      PostgresTypes2["daterange"] = "daterange"
      PostgresTypes2["float4"] = "float4"
      PostgresTypes2["float8"] = "float8"
      PostgresTypes2["int2"] = "int2"
      PostgresTypes2["int4"] = "int4"
      PostgresTypes2["int4range"] = "int4range"
      PostgresTypes2["int8"] = "int8"
      PostgresTypes2["int8range"] = "int8range"
      PostgresTypes2["json"] = "json"
      PostgresTypes2["jsonb"] = "jsonb"
      PostgresTypes2["money"] = "money"
      PostgresTypes2["numeric"] = "numeric"
      PostgresTypes2["oid"] = "oid"
      PostgresTypes2["reltime"] = "reltime"
      PostgresTypes2["text"] = "text"
      PostgresTypes2["time"] = "time"
      PostgresTypes2["timestamp"] = "timestamp"
      PostgresTypes2["timestamptz"] = "timestamptz"
      PostgresTypes2["timetz"] = "timetz"
      PostgresTypes2["tsrange"] = "tsrange"
      PostgresTypes2["tstzrange"] = "tstzrange"
    })(PostgresTypes || (exports.PostgresTypes = PostgresTypes = {}))
    var convertChangeData = (columns, record, options = {}) => {
      var _a
      const skipTypes = (_a = options.skipTypes) !== null && _a !== void 0 ? _a : []
      if (!record) {
        return {}
      }
      return Object.keys(record).reduce((acc, rec_key) => {
        acc[rec_key] = (0, exports.convertColumn)(rec_key, columns, record, skipTypes)
        return acc
      }, {})
    }
    exports.convertChangeData = convertChangeData
    var convertColumn = (columnName, columns, record, skipTypes) => {
      const column = columns.find((x) => x.name === columnName)
      const colType = column === null || column === void 0 ? void 0 : column.type
      const value = record[columnName]
      if (colType && !skipTypes.includes(colType)) {
        return (0, exports.convertCell)(colType, value)
      }
      return noop(value)
    }
    exports.convertColumn = convertColumn
    var convertCell = (type, value) => {
      if (type.charAt(0) === "_") {
        const dataType = type.slice(1, type.length)
        return (0, exports.toArray)(value, dataType)
      }
      switch (type) {
        case PostgresTypes.bool:
          return (0, exports.toBoolean)(value)
        case PostgresTypes.float4:
        case PostgresTypes.float8:
        case PostgresTypes.int2:
        case PostgresTypes.int4:
        case PostgresTypes.int8:
        case PostgresTypes.numeric:
        case PostgresTypes.oid:
          return (0, exports.toNumber)(value)
        case PostgresTypes.json:
        case PostgresTypes.jsonb:
          return (0, exports.toJson)(value)
        case PostgresTypes.timestamp:
          return (0, exports.toTimestampString)(value)
        // Format to be consistent with PostgREST
        case PostgresTypes.abstime:
        // To allow users to cast it based on Timezone
        case PostgresTypes.date:
        // To allow users to cast it based on Timezone
        case PostgresTypes.daterange:
        case PostgresTypes.int4range:
        case PostgresTypes.int8range:
        case PostgresTypes.money:
        case PostgresTypes.reltime:
        // To allow users to cast it based on Timezone
        case PostgresTypes.text:
        case PostgresTypes.time:
        // To allow users to cast it based on Timezone
        case PostgresTypes.timestamptz:
        // To allow users to cast it based on Timezone
        case PostgresTypes.timetz:
        // To allow users to cast it based on Timezone
        case PostgresTypes.tsrange:
        case PostgresTypes.tstzrange:
          return noop(value)
        default:
          return noop(value)
      }
    }
    exports.convertCell = convertCell
    var noop = (value) => {
      return value
    }
    var toBoolean = (value) => {
      switch (value) {
        case "t":
          return true
        case "f":
          return false
        default:
          return value
      }
    }
    exports.toBoolean = toBoolean
    var toNumber = (value) => {
      if (typeof value === "string") {
        const parsedValue = parseFloat(value)
        if (!Number.isNaN(parsedValue)) {
          return parsedValue
        }
      }
      return value
    }
    exports.toNumber = toNumber
    var toJson = (value) => {
      if (typeof value === "string") {
        try {
          return JSON.parse(value)
        } catch (_a) {
          return value
        }
      }
      return value
    }
    exports.toJson = toJson
    var toArray = (value, type) => {
      if (typeof value !== "string") {
        return value
      }
      const lastIdx = value.length - 1
      const closeBrace = value[lastIdx]
      const openBrace = value[0]
      if (openBrace === "{" && closeBrace === "}") {
        let arr
        const valTrim = value.slice(1, lastIdx)
        try {
          arr = JSON.parse("[" + valTrim + "]")
        } catch (_) {
          arr = valTrim ? valTrim.split(",") : []
        }
        return arr.map((val) => (0, exports.convertCell)(type, val))
      }
      return value
    }
    exports.toArray = toArray
    var toTimestampString = (value) => {
      if (typeof value === "string") {
        return value.replace(" ", "T")
      }
      return value
    }
    exports.toTimestampString = toTimestampString
    var httpEndpointURL = (socketUrl) => {
      const wsUrl = new URL(socketUrl)
      wsUrl.protocol = wsUrl.protocol.replace(/^ws/i, "http")
      wsUrl.pathname = wsUrl.pathname
        .replace(/\/+$/, "")
        .replace(/\/socket\/websocket$/i, "")
        .replace(/\/socket$/i, "")
        .replace(/\/websocket$/i, "")
      if (wsUrl.pathname === "" || wsUrl.pathname === "/") {
        wsUrl.pathname = "/api/broadcast"
      } else {
        wsUrl.pathname = wsUrl.pathname + "/api/broadcast"
      }
      return wsUrl.href
    }
    exports.httpEndpointURL = httpEndpointURL
  },
})

// node_modules/@supabase/realtime-js/dist/main/lib/push.js
var require_push = __commonJS({
  "node_modules/@supabase/realtime-js/dist/main/lib/push.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    var constants_1 = require_constants()
    var Push = class {
      /**
       * Initializes the Push
       *
       * @param channel The Channel
       * @param event The event, for example `"phx_join"`
       * @param payload The payload, for example `{user_id: 123}`
       * @param timeout The push timeout in milliseconds
       */
      constructor(channel, event, payload = {}, timeout = constants_1.DEFAULT_TIMEOUT) {
        this.channel = channel
        this.event = event
        this.payload = payload
        this.timeout = timeout
        this.sent = false
        this.timeoutTimer = void 0
        this.ref = ""
        this.receivedResp = null
        this.recHooks = []
        this.refEvent = null
      }
      resend(timeout) {
        this.timeout = timeout
        this._cancelRefEvent()
        this.ref = ""
        this.refEvent = null
        this.receivedResp = null
        this.sent = false
        this.send()
      }
      send() {
        if (this._hasReceived("timeout")) {
          return
        }
        this.startTimeout()
        this.sent = true
        this.channel.socket.push({
          topic: this.channel.topic,
          event: this.event,
          payload: this.payload,
          ref: this.ref,
          join_ref: this.channel._joinRef(),
        })
      }
      updatePayload(payload) {
        this.payload = Object.assign(Object.assign({}, this.payload), payload)
      }
      receive(status, callback) {
        var _a
        if (this._hasReceived(status)) {
          callback((_a = this.receivedResp) === null || _a === void 0 ? void 0 : _a.response)
        }
        this.recHooks.push({ status, callback })
        return this
      }
      startTimeout() {
        if (this.timeoutTimer) {
          return
        }
        this.ref = this.channel.socket._makeRef()
        this.refEvent = this.channel._replyEventName(this.ref)
        const callback = (payload) => {
          this._cancelRefEvent()
          this._cancelTimeout()
          this.receivedResp = payload
          this._matchReceive(payload)
        }
        this.channel._on(this.refEvent, {}, callback)
        this.timeoutTimer = setTimeout(() => {
          this.trigger("timeout", {})
        }, this.timeout)
      }
      trigger(status, response) {
        if (this.refEvent) this.channel._trigger(this.refEvent, { status, response })
      }
      destroy() {
        this._cancelRefEvent()
        this._cancelTimeout()
      }
      _cancelRefEvent() {
        if (!this.refEvent) {
          return
        }
        this.channel._off(this.refEvent, {})
      }
      _cancelTimeout() {
        clearTimeout(this.timeoutTimer)
        this.timeoutTimer = void 0
      }
      _matchReceive({ status, response }) {
        this.recHooks.filter((h) => h.status === status).forEach((h) => h.callback(response))
      }
      _hasReceived(status) {
        return this.receivedResp && this.receivedResp.status === status
      }
    }
    exports.default = Push
  },
})

// node_modules/@supabase/realtime-js/dist/main/RealtimePresence.js
var require_RealtimePresence = __commonJS({
  "node_modules/@supabase/realtime-js/dist/main/RealtimePresence.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.REALTIME_PRESENCE_LISTEN_EVENTS = void 0
    var REALTIME_PRESENCE_LISTEN_EVENTS
    ;(function (REALTIME_PRESENCE_LISTEN_EVENTS2) {
      REALTIME_PRESENCE_LISTEN_EVENTS2["SYNC"] = "sync"
      REALTIME_PRESENCE_LISTEN_EVENTS2["JOIN"] = "join"
      REALTIME_PRESENCE_LISTEN_EVENTS2["LEAVE"] = "leave"
    })(
      REALTIME_PRESENCE_LISTEN_EVENTS ||
        (exports.REALTIME_PRESENCE_LISTEN_EVENTS = REALTIME_PRESENCE_LISTEN_EVENTS = {})
    )
    var RealtimePresence = class _RealtimePresence {
      /**
       * Creates a Presence helper that keeps the local presence state in sync with the server.
       *
       * @param channel - The realtime channel to bind to.
       * @param opts - Optional custom event names, e.g. `{ events: { state: 'state', diff: 'diff' } }`.
       *
       * @example
       * ```ts
       * const presence = new RealtimePresence(channel)
       *
       * channel.on('presence', ({ event, key }) => {
       *   console.log(`Presence ${event} on ${key}`)
       * })
       * ```
       */
      constructor(channel, opts) {
        this.channel = channel
        this.state = {}
        this.pendingDiffs = []
        this.joinRef = null
        this.enabled = false
        this.caller = {
          onJoin: () => {},
          onLeave: () => {},
          onSync: () => {},
        }
        const events = (opts === null || opts === void 0 ? void 0 : opts.events) || {
          state: "presence_state",
          diff: "presence_diff",
        }
        this.channel._on(events.state, {}, (newState) => {
          const { onJoin, onLeave, onSync } = this.caller
          this.joinRef = this.channel._joinRef()
          this.state = _RealtimePresence.syncState(this.state, newState, onJoin, onLeave)
          this.pendingDiffs.forEach((diff) => {
            this.state = _RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave)
          })
          this.pendingDiffs = []
          onSync()
        })
        this.channel._on(events.diff, {}, (diff) => {
          const { onJoin, onLeave, onSync } = this.caller
          if (this.inPendingSyncState()) {
            this.pendingDiffs.push(diff)
          } else {
            this.state = _RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave)
            onSync()
          }
        })
        this.onJoin((key, currentPresences, newPresences) => {
          this.channel._trigger("presence", {
            event: "join",
            key,
            currentPresences,
            newPresences,
          })
        })
        this.onLeave((key, currentPresences, leftPresences) => {
          this.channel._trigger("presence", {
            event: "leave",
            key,
            currentPresences,
            leftPresences,
          })
        })
        this.onSync(() => {
          this.channel._trigger("presence", { event: "sync" })
        })
      }
      /**
       * Used to sync the list of presences on the server with the
       * client's state.
       *
       * An optional `onJoin` and `onLeave` callback can be provided to
       * react to changes in the client's local presences across
       * disconnects and reconnects with the server.
       *
       * @internal
       */
      static syncState(currentState, newState, onJoin, onLeave) {
        const state = this.cloneDeep(currentState)
        const transformedState = this.transformState(newState)
        const joins = {}
        const leaves = {}
        this.map(state, (key, presences) => {
          if (!transformedState[key]) {
            leaves[key] = presences
          }
        })
        this.map(transformedState, (key, newPresences) => {
          const currentPresences = state[key]
          if (currentPresences) {
            const newPresenceRefs = newPresences.map((m) => m.presence_ref)
            const curPresenceRefs = currentPresences.map((m) => m.presence_ref)
            const joinedPresences = newPresences.filter(
              (m) => curPresenceRefs.indexOf(m.presence_ref) < 0
            )
            const leftPresences = currentPresences.filter(
              (m) => newPresenceRefs.indexOf(m.presence_ref) < 0
            )
            if (joinedPresences.length > 0) {
              joins[key] = joinedPresences
            }
            if (leftPresences.length > 0) {
              leaves[key] = leftPresences
            }
          } else {
            joins[key] = newPresences
          }
        })
        return this.syncDiff(state, { joins, leaves }, onJoin, onLeave)
      }
      /**
       * Used to sync a diff of presence join and leave events from the
       * server, as they happen.
       *
       * Like `syncState`, `syncDiff` accepts optional `onJoin` and
       * `onLeave` callbacks to react to a user joining or leaving from a
       * device.
       *
       * @internal
       */
      static syncDiff(state, diff, onJoin, onLeave) {
        const { joins, leaves } = {
          joins: this.transformState(diff.joins),
          leaves: this.transformState(diff.leaves),
        }
        if (!onJoin) {
          onJoin = () => {}
        }
        if (!onLeave) {
          onLeave = () => {}
        }
        this.map(joins, (key, newPresences) => {
          var _a
          const currentPresences = (_a = state[key]) !== null && _a !== void 0 ? _a : []
          state[key] = this.cloneDeep(newPresences)
          if (currentPresences.length > 0) {
            const joinedPresenceRefs = state[key].map((m) => m.presence_ref)
            const curPresences = currentPresences.filter(
              (m) => joinedPresenceRefs.indexOf(m.presence_ref) < 0
            )
            state[key].unshift(...curPresences)
          }
          onJoin(key, currentPresences, newPresences)
        })
        this.map(leaves, (key, leftPresences) => {
          let currentPresences = state[key]
          if (!currentPresences) return
          const presenceRefsToRemove = leftPresences.map((m) => m.presence_ref)
          currentPresences = currentPresences.filter(
            (m) => presenceRefsToRemove.indexOf(m.presence_ref) < 0
          )
          state[key] = currentPresences
          onLeave(key, currentPresences, leftPresences)
          if (currentPresences.length === 0) delete state[key]
        })
        return state
      }
      /** @internal */
      static map(obj, func) {
        return Object.getOwnPropertyNames(obj).map((key) => func(key, obj[key]))
      }
      /**
       * Remove 'metas' key
       * Change 'phx_ref' to 'presence_ref'
       * Remove 'phx_ref' and 'phx_ref_prev'
       *
       * @example
       * // returns {
       *  abc123: [
       *    { presence_ref: '2', user_id: 1 },
       *    { presence_ref: '3', user_id: 2 }
       *  ]
       * }
       * RealtimePresence.transformState({
       *  abc123: {
       *    metas: [
       *      { phx_ref: '2', phx_ref_prev: '1' user_id: 1 },
       *      { phx_ref: '3', user_id: 2 }
       *    ]
       *  }
       * })
       *
       * @internal
       */
      static transformState(state) {
        state = this.cloneDeep(state)
        return Object.getOwnPropertyNames(state).reduce((newState, key) => {
          const presences = state[key]
          if ("metas" in presences) {
            newState[key] = presences.metas.map((presence) => {
              presence["presence_ref"] = presence["phx_ref"]
              delete presence["phx_ref"]
              delete presence["phx_ref_prev"]
              return presence
            })
          } else {
            newState[key] = presences
          }
          return newState
        }, {})
      }
      /** @internal */
      static cloneDeep(obj) {
        return JSON.parse(JSON.stringify(obj))
      }
      /** @internal */
      onJoin(callback) {
        this.caller.onJoin = callback
      }
      /** @internal */
      onLeave(callback) {
        this.caller.onLeave = callback
      }
      /** @internal */
      onSync(callback) {
        this.caller.onSync = callback
      }
      /** @internal */
      inPendingSyncState() {
        return !this.joinRef || this.joinRef !== this.channel._joinRef()
      }
    }
    exports.default = RealtimePresence
  },
})

// node_modules/@supabase/realtime-js/dist/main/RealtimeChannel.js
var require_RealtimeChannel = __commonJS({
  "node_modules/@supabase/realtime-js/dist/main/RealtimeChannel.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.REALTIME_CHANNEL_STATES =
      exports.REALTIME_SUBSCRIBE_STATES =
      exports.REALTIME_LISTEN_TYPES =
      exports.REALTIME_POSTGRES_CHANGES_LISTEN_EVENT =
        void 0
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports))
    var constants_1 = require_constants()
    var push_1 = tslib_1.__importDefault(require_push())
    var timer_1 = tslib_1.__importDefault(require_timer())
    var RealtimePresence_1 = tslib_1.__importDefault(require_RealtimePresence())
    var Transformers = tslib_1.__importStar(require_transformers())
    var transformers_1 = require_transformers()
    var REALTIME_POSTGRES_CHANGES_LISTEN_EVENT
    ;(function (REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2) {
      REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["ALL"] = "*"
      REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["INSERT"] = "INSERT"
      REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["UPDATE"] = "UPDATE"
      REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["DELETE"] = "DELETE"
    })(
      REALTIME_POSTGRES_CHANGES_LISTEN_EVENT ||
        (exports.REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = REALTIME_POSTGRES_CHANGES_LISTEN_EVENT =
          {})
    )
    var REALTIME_LISTEN_TYPES
    ;(function (REALTIME_LISTEN_TYPES2) {
      REALTIME_LISTEN_TYPES2["BROADCAST"] = "broadcast"
      REALTIME_LISTEN_TYPES2["PRESENCE"] = "presence"
      REALTIME_LISTEN_TYPES2["POSTGRES_CHANGES"] = "postgres_changes"
      REALTIME_LISTEN_TYPES2["SYSTEM"] = "system"
    })(REALTIME_LISTEN_TYPES || (exports.REALTIME_LISTEN_TYPES = REALTIME_LISTEN_TYPES = {}))
    var REALTIME_SUBSCRIBE_STATES
    ;(function (REALTIME_SUBSCRIBE_STATES2) {
      REALTIME_SUBSCRIBE_STATES2["SUBSCRIBED"] = "SUBSCRIBED"
      REALTIME_SUBSCRIBE_STATES2["TIMED_OUT"] = "TIMED_OUT"
      REALTIME_SUBSCRIBE_STATES2["CLOSED"] = "CLOSED"
      REALTIME_SUBSCRIBE_STATES2["CHANNEL_ERROR"] = "CHANNEL_ERROR"
    })(
      REALTIME_SUBSCRIBE_STATES ||
        (exports.REALTIME_SUBSCRIBE_STATES = REALTIME_SUBSCRIBE_STATES = {})
    )
    exports.REALTIME_CHANNEL_STATES = constants_1.CHANNEL_STATES
    var RealtimeChannel = class _RealtimeChannel {
      /**
       * Creates a channel that can broadcast messages, sync presence, and listen to Postgres changes.
       *
       * The topic determines which realtime stream you are subscribing to. Config options let you
       * enable acknowledgement for broadcasts, presence tracking, or private channels.
       *
       * @example
       * ```ts
       * import RealtimeClient from '@supabase/realtime-js'
       *
       * const client = new RealtimeClient('https://xyzcompany.supabase.co/realtime/v1', {
       *   params: { apikey: 'public-anon-key' },
       * })
       * const channel = new RealtimeChannel('realtime:public:messages', { config: {} }, client)
       * ```
       */
      constructor(topic, params = { config: {} }, socket) {
        var _a, _b
        this.topic = topic
        this.params = params
        this.socket = socket
        this.bindings = {}
        this.state = constants_1.CHANNEL_STATES.closed
        this.joinedOnce = false
        this.pushBuffer = []
        this.subTopic = topic.replace(/^realtime:/i, "")
        this.params.config = Object.assign(
          {
            broadcast: { ack: false, self: false },
            presence: { key: "", enabled: false },
            private: false,
          },
          params.config
        )
        this.timeout = this.socket.timeout
        this.joinPush = new push_1.default(
          this,
          constants_1.CHANNEL_EVENTS.join,
          this.params,
          this.timeout
        )
        this.rejoinTimer = new timer_1.default(
          () => this._rejoinUntilConnected(),
          this.socket.reconnectAfterMs
        )
        this.joinPush.receive("ok", () => {
          this.state = constants_1.CHANNEL_STATES.joined
          this.rejoinTimer.reset()
          this.pushBuffer.forEach((pushEvent) => pushEvent.send())
          this.pushBuffer = []
        })
        this._onClose(() => {
          this.rejoinTimer.reset()
          this.socket.log("channel", `close ${this.topic} ${this._joinRef()}`)
          this.state = constants_1.CHANNEL_STATES.closed
          this.socket._remove(this)
        })
        this._onError((reason) => {
          if (this._isLeaving() || this._isClosed()) {
            return
          }
          this.socket.log("channel", `error ${this.topic}`, reason)
          this.state = constants_1.CHANNEL_STATES.errored
          this.rejoinTimer.scheduleTimeout()
        })
        this.joinPush.receive("timeout", () => {
          if (!this._isJoining()) {
            return
          }
          this.socket.log("channel", `timeout ${this.topic}`, this.joinPush.timeout)
          this.state = constants_1.CHANNEL_STATES.errored
          this.rejoinTimer.scheduleTimeout()
        })
        this.joinPush.receive("error", (reason) => {
          if (this._isLeaving() || this._isClosed()) {
            return
          }
          this.socket.log("channel", `error ${this.topic}`, reason)
          this.state = constants_1.CHANNEL_STATES.errored
          this.rejoinTimer.scheduleTimeout()
        })
        this._on(constants_1.CHANNEL_EVENTS.reply, {}, (payload, ref) => {
          this._trigger(this._replyEventName(ref), payload)
        })
        this.presence = new RealtimePresence_1.default(this)
        this.broadcastEndpointURL = (0, transformers_1.httpEndpointURL)(this.socket.endPoint)
        this.private = this.params.config.private || false
        if (
          !this.private &&
          ((_b = (_a = this.params.config) === null || _a === void 0 ? void 0 : _a.broadcast) ===
            null || _b === void 0
            ? void 0
            : _b.replay)
        ) {
          throw `tried to use replay on public channel '${this.topic}'. It must be a private channel.`
        }
      }
      /** Subscribe registers your client with the server */
      subscribe(callback, timeout = this.timeout) {
        var _a, _b, _c
        if (!this.socket.isConnected()) {
          this.socket.connect()
        }
        if (this.state == constants_1.CHANNEL_STATES.closed) {
          const {
            config: { broadcast, presence, private: isPrivate },
          } = this.params
          const postgres_changes =
            (_b =
              (_a = this.bindings.postgres_changes) === null || _a === void 0
                ? void 0
                : _a.map((r) => r.filter)) !== null && _b !== void 0
              ? _b
              : []
          const presence_enabled =
            (!!this.bindings[REALTIME_LISTEN_TYPES.PRESENCE] &&
              this.bindings[REALTIME_LISTEN_TYPES.PRESENCE].length > 0) ||
            ((_c = this.params.config.presence) === null || _c === void 0 ? void 0 : _c.enabled) ===
              true
          const accessTokenPayload = {}
          const config = {
            broadcast,
            presence: Object.assign(Object.assign({}, presence), { enabled: presence_enabled }),
            postgres_changes,
            private: isPrivate,
          }
          if (this.socket.accessTokenValue) {
            accessTokenPayload.access_token = this.socket.accessTokenValue
          }
          this._onError((e) =>
            callback === null || callback === void 0
              ? void 0
              : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, e)
          )
          this._onClose(() =>
            callback === null || callback === void 0
              ? void 0
              : callback(REALTIME_SUBSCRIBE_STATES.CLOSED)
          )
          this.updateJoinPayload(Object.assign({ config }, accessTokenPayload))
          this.joinedOnce = true
          this._rejoin(timeout)
          this.joinPush
            .receive("ok", async ({ postgres_changes: postgres_changes2 }) => {
              var _a2
              if (!this.socket._isManualToken()) {
                this.socket.setAuth()
              }
              if (postgres_changes2 === void 0) {
                callback === null || callback === void 0
                  ? void 0
                  : callback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED)
                return
              } else {
                const clientPostgresBindings = this.bindings.postgres_changes
                const bindingsLen =
                  (_a2 =
                    clientPostgresBindings === null || clientPostgresBindings === void 0
                      ? void 0
                      : clientPostgresBindings.length) !== null && _a2 !== void 0
                    ? _a2
                    : 0
                const newPostgresBindings = []
                for (let i = 0; i < bindingsLen; i++) {
                  const clientPostgresBinding = clientPostgresBindings[i]
                  const {
                    filter: { event, schema, table, filter },
                  } = clientPostgresBinding
                  const serverPostgresFilter = postgres_changes2 && postgres_changes2[i]
                  if (
                    serverPostgresFilter &&
                    serverPostgresFilter.event === event &&
                    _RealtimeChannel.isFilterValueEqual(serverPostgresFilter.schema, schema) &&
                    _RealtimeChannel.isFilterValueEqual(serverPostgresFilter.table, table) &&
                    _RealtimeChannel.isFilterValueEqual(serverPostgresFilter.filter, filter)
                  ) {
                    newPostgresBindings.push(
                      Object.assign(Object.assign({}, clientPostgresBinding), {
                        id: serverPostgresFilter.id,
                      })
                    )
                  } else {
                    this.unsubscribe()
                    this.state = constants_1.CHANNEL_STATES.errored
                    callback === null || callback === void 0
                      ? void 0
                      : callback(
                          REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR,
                          new Error(
                            "mismatch between server and client bindings for postgres changes"
                          )
                        )
                    return
                  }
                }
                this.bindings.postgres_changes = newPostgresBindings
                callback && callback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED)
                return
              }
            })
            .receive("error", (error) => {
              this.state = constants_1.CHANNEL_STATES.errored
              callback === null || callback === void 0
                ? void 0
                : callback(
                    REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR,
                    new Error(JSON.stringify(Object.values(error).join(", ") || "error"))
                  )
              return
            })
            .receive("timeout", () => {
              callback === null || callback === void 0
                ? void 0
                : callback(REALTIME_SUBSCRIBE_STATES.TIMED_OUT)
              return
            })
        }
        return this
      }
      /**
       * Returns the current presence state for this channel.
       *
       * The shape is a map keyed by presence key (for example a user id) where each entry contains the
       * tracked metadata for that user.
       */
      presenceState() {
        return this.presence.state
      }
      /**
       * Sends the supplied payload to the presence tracker so other subscribers can see that this
       * client is online. Use `untrack` to stop broadcasting presence for the same key.
       */
      async track(payload, opts = {}) {
        return await this.send(
          {
            type: "presence",
            event: "track",
            payload,
          },
          opts.timeout || this.timeout
        )
      }
      /**
       * Removes the current presence state for this client.
       */
      async untrack(opts = {}) {
        return await this.send(
          {
            type: "presence",
            event: "untrack",
          },
          opts
        )
      }
      on(type, filter, callback) {
        if (
          this.state === constants_1.CHANNEL_STATES.joined &&
          type === REALTIME_LISTEN_TYPES.PRESENCE
        ) {
          this.socket.log(
            "channel",
            `resubscribe to ${this.topic} due to change in presence callbacks on joined channel`
          )
          this.unsubscribe().then(async () => await this.subscribe())
        }
        return this._on(type, filter, callback)
      }
      /**
       * Sends a broadcast message explicitly via REST API.
       *
       * This method always uses the REST API endpoint regardless of WebSocket connection state.
       * Useful when you want to guarantee REST delivery or when gradually migrating from implicit REST fallback.
       *
       * @param event The name of the broadcast event
       * @param payload Payload to be sent (required)
       * @param opts Options including timeout
       * @returns Promise resolving to object with success status, and error details if failed
       */
      async httpSend(event, payload, opts = {}) {
        var _a
        if (payload === void 0 || payload === null) {
          return Promise.reject("Payload is required for httpSend()")
        }
        const headers = {
          apikey: this.socket.apiKey ? this.socket.apiKey : "",
          "Content-Type": "application/json",
        }
        if (this.socket.accessTokenValue) {
          headers["Authorization"] = `Bearer ${this.socket.accessTokenValue}`
        }
        const options = {
          method: "POST",
          headers,
          body: JSON.stringify({
            messages: [
              {
                topic: this.subTopic,
                event,
                payload,
                private: this.private,
              },
            ],
          }),
        }
        const response = await this._fetchWithTimeout(
          this.broadcastEndpointURL,
          options,
          (_a = opts.timeout) !== null && _a !== void 0 ? _a : this.timeout
        )
        if (response.status === 202) {
          return { success: true }
        }
        let errorMessage = response.statusText
        try {
          const errorBody = await response.json()
          errorMessage = errorBody.error || errorBody.message || errorMessage
        } catch (_b) {}
        return Promise.reject(new Error(errorMessage))
      }
      /**
       * Sends a message into the channel.
       *
       * @param args Arguments to send to channel
       * @param args.type The type of event to send
       * @param args.event The name of the event being sent
       * @param args.payload Payload to be sent
       * @param opts Options to be used during the send process
       */
      async send(args, opts = {}) {
        var _a, _b
        if (!this._canPush() && args.type === "broadcast") {
          console.warn(
            "Realtime send() is automatically falling back to REST API. This behavior will be deprecated in the future. Please use httpSend() explicitly for REST delivery."
          )
          const { event, payload: endpoint_payload } = args
          const headers = {
            apikey: this.socket.apiKey ? this.socket.apiKey : "",
            "Content-Type": "application/json",
          }
          if (this.socket.accessTokenValue) {
            headers["Authorization"] = `Bearer ${this.socket.accessTokenValue}`
          }
          const options = {
            method: "POST",
            headers,
            body: JSON.stringify({
              messages: [
                {
                  topic: this.subTopic,
                  event,
                  payload: endpoint_payload,
                  private: this.private,
                },
              ],
            }),
          }
          try {
            const response = await this._fetchWithTimeout(
              this.broadcastEndpointURL,
              options,
              (_a = opts.timeout) !== null && _a !== void 0 ? _a : this.timeout
            )
            await ((_b = response.body) === null || _b === void 0 ? void 0 : _b.cancel())
            return response.ok ? "ok" : "error"
          } catch (error) {
            if (error.name === "AbortError") {
              return "timed out"
            } else {
              return "error"
            }
          }
        } else {
          return new Promise((resolve) => {
            var _a2, _b2, _c
            const push = this._push(args.type, args, opts.timeout || this.timeout)
            if (
              args.type === "broadcast" &&
              !((_c =
                (_b2 = (_a2 = this.params) === null || _a2 === void 0 ? void 0 : _a2.config) ===
                  null || _b2 === void 0
                  ? void 0
                  : _b2.broadcast) === null || _c === void 0
                ? void 0
                : _c.ack)
            ) {
              resolve("ok")
            }
            push.receive("ok", () => resolve("ok"))
            push.receive("error", () => resolve("error"))
            push.receive("timeout", () => resolve("timed out"))
          })
        }
      }
      /**
       * Updates the payload that will be sent the next time the channel joins (reconnects).
       * Useful for rotating access tokens or updating config without re-creating the channel.
       */
      updateJoinPayload(payload) {
        this.joinPush.updatePayload(payload)
      }
      /**
       * Leaves the channel.
       *
       * Unsubscribes from server events, and instructs channel to terminate on server.
       * Triggers onClose() hooks.
       *
       * To receive leave acknowledgements, use the a `receive` hook to bind to the server ack, ie:
       * channel.unsubscribe().receive("ok", () => alert("left!") )
       */
      unsubscribe(timeout = this.timeout) {
        this.state = constants_1.CHANNEL_STATES.leaving
        const onClose = () => {
          this.socket.log("channel", `leave ${this.topic}`)
          this._trigger(constants_1.CHANNEL_EVENTS.close, "leave", this._joinRef())
        }
        this.joinPush.destroy()
        let leavePush = null
        return new Promise((resolve) => {
          leavePush = new push_1.default(this, constants_1.CHANNEL_EVENTS.leave, {}, timeout)
          leavePush
            .receive("ok", () => {
              onClose()
              resolve("ok")
            })
            .receive("timeout", () => {
              onClose()
              resolve("timed out")
            })
            .receive("error", () => {
              resolve("error")
            })
          leavePush.send()
          if (!this._canPush()) {
            leavePush.trigger("ok", {})
          }
        }).finally(() => {
          leavePush === null || leavePush === void 0 ? void 0 : leavePush.destroy()
        })
      }
      /**
       * Teardown the channel.
       *
       * Destroys and stops related timers.
       */
      teardown() {
        this.pushBuffer.forEach((push) => push.destroy())
        this.pushBuffer = []
        this.rejoinTimer.reset()
        this.joinPush.destroy()
        this.state = constants_1.CHANNEL_STATES.closed
        this.bindings = {}
      }
      /** @internal */
      async _fetchWithTimeout(url, options, timeout) {
        const controller = new AbortController()
        const id = setTimeout(() => controller.abort(), timeout)
        const response = await this.socket.fetch(
          url,
          Object.assign(Object.assign({}, options), { signal: controller.signal })
        )
        clearTimeout(id)
        return response
      }
      /** @internal */
      _push(event, payload, timeout = this.timeout) {
        if (!this.joinedOnce) {
          throw `tried to push '${event}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`
        }
        let pushEvent = new push_1.default(this, event, payload, timeout)
        if (this._canPush()) {
          pushEvent.send()
        } else {
          this._addToPushBuffer(pushEvent)
        }
        return pushEvent
      }
      /** @internal */
      _addToPushBuffer(pushEvent) {
        pushEvent.startTimeout()
        this.pushBuffer.push(pushEvent)
        if (this.pushBuffer.length > constants_1.MAX_PUSH_BUFFER_SIZE) {
          const removedPush = this.pushBuffer.shift()
          if (removedPush) {
            removedPush.destroy()
            this.socket.log(
              "channel",
              `discarded push due to buffer overflow: ${removedPush.event}`,
              removedPush.payload
            )
          }
        }
      }
      /**
       * Overridable message hook
       *
       * Receives all events for specialized message handling before dispatching to the channel callbacks.
       * Must return the payload, modified or unmodified.
       *
       * @internal
       */
      _onMessage(_event, payload, _ref) {
        return payload
      }
      /** @internal */
      _isMember(topic) {
        return this.topic === topic
      }
      /** @internal */
      _joinRef() {
        return this.joinPush.ref
      }
      /** @internal */
      _trigger(type, payload, ref) {
        var _a, _b
        const typeLower = type.toLocaleLowerCase()
        const { close, error, leave, join } = constants_1.CHANNEL_EVENTS
        const events = [close, error, leave, join]
        if (ref && events.indexOf(typeLower) >= 0 && ref !== this._joinRef()) {
          return
        }
        let handledPayload = this._onMessage(typeLower, payload, ref)
        if (payload && !handledPayload) {
          throw "channel onMessage callbacks must return the payload, modified or unmodified"
        }
        if (["insert", "update", "delete"].includes(typeLower)) {
          ;(_a = this.bindings.postgres_changes) === null || _a === void 0
            ? void 0
            : _a
                .filter((bind) => {
                  var _a2, _b2, _c
                  return (
                    ((_a2 = bind.filter) === null || _a2 === void 0 ? void 0 : _a2.event) === "*" ||
                    ((_c = (_b2 = bind.filter) === null || _b2 === void 0 ? void 0 : _b2.event) ===
                      null || _c === void 0
                      ? void 0
                      : _c.toLocaleLowerCase()) === typeLower
                  )
                })
                .map((bind) => bind.callback(handledPayload, ref))
        } else {
          ;(_b = this.bindings[typeLower]) === null || _b === void 0
            ? void 0
            : _b
                .filter((bind) => {
                  var _a2, _b2, _c, _d, _e, _f
                  if (["broadcast", "presence", "postgres_changes"].includes(typeLower)) {
                    if ("id" in bind) {
                      const bindId = bind.id
                      const bindEvent =
                        (_a2 = bind.filter) === null || _a2 === void 0 ? void 0 : _a2.event
                      return (
                        bindId &&
                        ((_b2 = payload.ids) === null || _b2 === void 0
                          ? void 0
                          : _b2.includes(bindId)) &&
                        (bindEvent === "*" ||
                          (bindEvent === null || bindEvent === void 0
                            ? void 0
                            : bindEvent.toLocaleLowerCase()) ===
                            ((_c = payload.data) === null || _c === void 0
                              ? void 0
                              : _c.type.toLocaleLowerCase()))
                      )
                    } else {
                      const bindEvent =
                        (_e =
                          (_d = bind === null || bind === void 0 ? void 0 : bind.filter) === null ||
                          _d === void 0
                            ? void 0
                            : _d.event) === null || _e === void 0
                          ? void 0
                          : _e.toLocaleLowerCase()
                      return (
                        bindEvent === "*" ||
                        bindEvent ===
                          ((_f =
                            payload === null || payload === void 0 ? void 0 : payload.event) ===
                            null || _f === void 0
                            ? void 0
                            : _f.toLocaleLowerCase())
                      )
                    }
                  } else {
                    return bind.type.toLocaleLowerCase() === typeLower
                  }
                })
                .map((bind) => {
                  if (typeof handledPayload === "object" && "ids" in handledPayload) {
                    const postgresChanges = handledPayload.data
                    const { schema, table, commit_timestamp, type: type2, errors } = postgresChanges
                    const enrichedPayload = {
                      schema,
                      table,
                      commit_timestamp,
                      eventType: type2,
                      new: {},
                      old: {},
                      errors,
                    }
                    handledPayload = Object.assign(
                      Object.assign({}, enrichedPayload),
                      this._getPayloadRecords(postgresChanges)
                    )
                  }
                  bind.callback(handledPayload, ref)
                })
        }
      }
      /** @internal */
      _isClosed() {
        return this.state === constants_1.CHANNEL_STATES.closed
      }
      /** @internal */
      _isJoined() {
        return this.state === constants_1.CHANNEL_STATES.joined
      }
      /** @internal */
      _isJoining() {
        return this.state === constants_1.CHANNEL_STATES.joining
      }
      /** @internal */
      _isLeaving() {
        return this.state === constants_1.CHANNEL_STATES.leaving
      }
      /** @internal */
      _replyEventName(ref) {
        return `chan_reply_${ref}`
      }
      /** @internal */
      _on(type, filter, callback) {
        const typeLower = type.toLocaleLowerCase()
        const binding = {
          type: typeLower,
          filter,
          callback,
        }
        if (this.bindings[typeLower]) {
          this.bindings[typeLower].push(binding)
        } else {
          this.bindings[typeLower] = [binding]
        }
        return this
      }
      /** @internal */
      _off(type, filter) {
        const typeLower = type.toLocaleLowerCase()
        if (this.bindings[typeLower]) {
          this.bindings[typeLower] = this.bindings[typeLower].filter((bind) => {
            var _a
            return !(
              ((_a = bind.type) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()) ===
                typeLower && _RealtimeChannel.isEqual(bind.filter, filter)
            )
          })
        }
        return this
      }
      /** @internal */
      static isEqual(obj1, obj2) {
        if (Object.keys(obj1).length !== Object.keys(obj2).length) {
          return false
        }
        for (const k in obj1) {
          if (obj1[k] !== obj2[k]) {
            return false
          }
        }
        return true
      }
      /**
       * Compares two optional filter values for equality.
       * Treats undefined, null, and empty string as equivalent empty values.
       * @internal
       */
      static isFilterValueEqual(serverValue, clientValue) {
        const normalizedServer =
          serverValue !== null && serverValue !== void 0 ? serverValue : void 0
        const normalizedClient =
          clientValue !== null && clientValue !== void 0 ? clientValue : void 0
        return normalizedServer === normalizedClient
      }
      /** @internal */
      _rejoinUntilConnected() {
        this.rejoinTimer.scheduleTimeout()
        if (this.socket.isConnected()) {
          this._rejoin()
        }
      }
      /**
       * Registers a callback that will be executed when the channel closes.
       *
       * @internal
       */
      _onClose(callback) {
        this._on(constants_1.CHANNEL_EVENTS.close, {}, callback)
      }
      /**
       * Registers a callback that will be executed when the channel encounteres an error.
       *
       * @internal
       */
      _onError(callback) {
        this._on(constants_1.CHANNEL_EVENTS.error, {}, (reason) => callback(reason))
      }
      /**
       * Returns `true` if the socket is connected and the channel has been joined.
       *
       * @internal
       */
      _canPush() {
        return this.socket.isConnected() && this._isJoined()
      }
      /** @internal */
      _rejoin(timeout = this.timeout) {
        if (this._isLeaving()) {
          return
        }
        this.socket._leaveOpenTopic(this.topic)
        this.state = constants_1.CHANNEL_STATES.joining
        this.joinPush.resend(timeout)
      }
      /** @internal */
      _getPayloadRecords(payload) {
        const records = {
          new: {},
          old: {},
        }
        if (payload.type === "INSERT" || payload.type === "UPDATE") {
          records.new = Transformers.convertChangeData(payload.columns, payload.record)
        }
        if (payload.type === "UPDATE" || payload.type === "DELETE") {
          records.old = Transformers.convertChangeData(payload.columns, payload.old_record)
        }
        return records
      }
    }
    exports.default = RealtimeChannel
  },
})

// node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js
var require_RealtimeClient = __commonJS({
  "node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports))
    var websocket_factory_1 = tslib_1.__importDefault(require_websocket_factory())
    var constants_1 = require_constants()
    var serializer_1 = tslib_1.__importDefault(require_serializer())
    var timer_1 = tslib_1.__importDefault(require_timer())
    var transformers_1 = require_transformers()
    var RealtimeChannel_1 = tslib_1.__importDefault(require_RealtimeChannel())
    var noop = () => {}
    var CONNECTION_TIMEOUTS = {
      HEARTBEAT_INTERVAL: 25e3,
      RECONNECT_DELAY: 10,
      HEARTBEAT_TIMEOUT_FALLBACK: 100,
    }
    var RECONNECT_INTERVALS = [1e3, 2e3, 5e3, 1e4]
    var DEFAULT_RECONNECT_FALLBACK = 1e4
    var WORKER_SCRIPT = `
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`
    var RealtimeClient2 = class {
      /**
       * Initializes the Socket.
       *
       * @param endPoint The string WebSocket endpoint, ie, "ws://example.com/socket", "wss://example.com", "/socket" (inherited host & protocol)
       * @param httpEndpoint The string HTTP endpoint, ie, "https://example.com", "/" (inherited host & protocol)
       * @param options.transport The Websocket Transport, for example WebSocket. This can be a custom implementation
       * @param options.timeout The default timeout in milliseconds to trigger push timeouts.
       * @param options.params The optional params to pass when connecting.
       * @param options.headers Deprecated: headers cannot be set on websocket connections and this option will be removed in the future.
       * @param options.heartbeatIntervalMs The millisec interval to send a heartbeat message.
       * @param options.heartbeatCallback The optional function to handle heartbeat status.
       * @param options.logger The optional function for specialized logging, ie: logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
       * @param options.logLevel Sets the log level for Realtime
       * @param options.encode The function to encode outgoing messages. Defaults to JSON: (payload, callback) => callback(JSON.stringify(payload))
       * @param options.decode The function to decode incoming messages. Defaults to Serializer's decode.
       * @param options.reconnectAfterMs he optional function that returns the millsec reconnect interval. Defaults to stepped backoff off.
       * @param options.worker Use Web Worker to set a side flow. Defaults to false.
       * @param options.workerUrl The URL of the worker script. Defaults to https://realtime.supabase.com/worker.js that includes a heartbeat event call to keep the connection alive.
       * @example
       * ```ts
       * import RealtimeClient from '@supabase/realtime-js'
       *
       * const client = new RealtimeClient('https://xyzcompany.supabase.co/realtime/v1', {
       *   params: { apikey: 'public-anon-key' },
       * })
       * client.connect()
       * ```
       */
      constructor(endPoint, options) {
        var _a
        this.accessTokenValue = null
        this.apiKey = null
        this._manuallySetToken = false
        this.channels = new Array()
        this.endPoint = ""
        this.httpEndpoint = ""
        this.headers = {}
        this.params = {}
        this.timeout = constants_1.DEFAULT_TIMEOUT
        this.transport = null
        this.heartbeatIntervalMs = CONNECTION_TIMEOUTS.HEARTBEAT_INTERVAL
        this.heartbeatTimer = void 0
        this.pendingHeartbeatRef = null
        this.heartbeatCallback = noop
        this.ref = 0
        this.reconnectTimer = null
        this.vsn = constants_1.DEFAULT_VSN
        this.logger = noop
        this.conn = null
        this.sendBuffer = []
        this.serializer = new serializer_1.default()
        this.stateChangeCallbacks = {
          open: [],
          close: [],
          error: [],
          message: [],
        }
        this.accessToken = null
        this._connectionState = "disconnected"
        this._wasManualDisconnect = false
        this._authPromise = null
        this._resolveFetch = (customFetch) => {
          if (customFetch) {
            return (...args) => customFetch(...args)
          }
          return (...args) => fetch(...args)
        }
        if (
          !((_a = options === null || options === void 0 ? void 0 : options.params) === null ||
          _a === void 0
            ? void 0
            : _a.apikey)
        ) {
          throw new Error("API key is required to connect to Realtime")
        }
        this.apiKey = options.params.apikey
        this.endPoint = `${endPoint}/${constants_1.TRANSPORTS.websocket}`
        this.httpEndpoint = (0, transformers_1.httpEndpointURL)(endPoint)
        this._initializeOptions(options)
        this._setupReconnectionTimer()
        this.fetch = this._resolveFetch(
          options === null || options === void 0 ? void 0 : options.fetch
        )
      }
      /**
       * Connects the socket, unless already connected.
       */
      connect() {
        if (
          this.isConnecting() ||
          this.isDisconnecting() ||
          (this.conn !== null && this.isConnected())
        ) {
          return
        }
        this._setConnectionState("connecting")
        if (this.accessToken && !this._authPromise) {
          this._setAuthSafely("connect")
        }
        if (this.transport) {
          this.conn = new this.transport(this.endpointURL())
        } else {
          try {
            this.conn = websocket_factory_1.default.createWebSocket(this.endpointURL())
          } catch (error) {
            this._setConnectionState("disconnected")
            const errorMessage = error.message
            if (errorMessage.includes("Node.js")) {
              throw new Error(`${errorMessage}

To use Realtime in Node.js, you need to provide a WebSocket implementation:

Option 1: Use Node.js 22+ which has native WebSocket support
Option 2: Install and provide the "ws" package:

  npm install ws

  import ws from "ws"
  const client = new RealtimeClient(url, {
    ...options,
    transport: ws
  })`)
            }
            throw new Error(`WebSocket not available: ${errorMessage}`)
          }
        }
        this._setupConnectionHandlers()
      }
      /**
       * Returns the URL of the websocket.
       * @returns string The URL of the websocket.
       */
      endpointURL() {
        return this._appendParams(this.endPoint, Object.assign({}, this.params, { vsn: this.vsn }))
      }
      /**
       * Disconnects the socket.
       *
       * @param code A numeric status code to send on disconnect.
       * @param reason A custom reason for the disconnect.
       */
      disconnect(code, reason) {
        if (this.isDisconnecting()) {
          return
        }
        this._setConnectionState("disconnecting", true)
        if (this.conn) {
          const fallbackTimer = setTimeout(() => {
            this._setConnectionState("disconnected")
          }, 100)
          this.conn.onclose = () => {
            clearTimeout(fallbackTimer)
            this._setConnectionState("disconnected")
          }
          if (typeof this.conn.close === "function") {
            if (code) {
              this.conn.close(code, reason !== null && reason !== void 0 ? reason : "")
            } else {
              this.conn.close()
            }
          }
          this._teardownConnection()
        } else {
          this._setConnectionState("disconnected")
        }
      }
      /**
       * Returns all created channels
       */
      getChannels() {
        return this.channels
      }
      /**
       * Unsubscribes and removes a single channel
       * @param channel A RealtimeChannel instance
       */
      async removeChannel(channel) {
        const status = await channel.unsubscribe()
        if (this.channels.length === 0) {
          this.disconnect()
        }
        return status
      }
      /**
       * Unsubscribes and removes all channels
       */
      async removeAllChannels() {
        const values_1 = await Promise.all(this.channels.map((channel) => channel.unsubscribe()))
        this.channels = []
        this.disconnect()
        return values_1
      }
      /**
       * Logs the message.
       *
       * For customized logging, `this.logger` can be overridden.
       */
      log(kind, msg, data) {
        this.logger(kind, msg, data)
      }
      /**
       * Returns the current state of the socket.
       */
      connectionState() {
        switch (this.conn && this.conn.readyState) {
          case constants_1.SOCKET_STATES.connecting:
            return constants_1.CONNECTION_STATE.Connecting
          case constants_1.SOCKET_STATES.open:
            return constants_1.CONNECTION_STATE.Open
          case constants_1.SOCKET_STATES.closing:
            return constants_1.CONNECTION_STATE.Closing
          default:
            return constants_1.CONNECTION_STATE.Closed
        }
      }
      /**
       * Returns `true` is the connection is open.
       */
      isConnected() {
        return this.connectionState() === constants_1.CONNECTION_STATE.Open
      }
      /**
       * Returns `true` if the connection is currently connecting.
       */
      isConnecting() {
        return this._connectionState === "connecting"
      }
      /**
       * Returns `true` if the connection is currently disconnecting.
       */
      isDisconnecting() {
        return this._connectionState === "disconnecting"
      }
      /**
       * Creates (or reuses) a {@link RealtimeChannel} for the provided topic.
       *
       * Topics are automatically prefixed with `realtime:` to match the Realtime service.
       * If a channel with the same topic already exists it will be returned instead of creating
       * a duplicate connection.
       */
      channel(topic, params = { config: {} }) {
        const realtimeTopic = `realtime:${topic}`
        const exists = this.getChannels().find((c) => c.topic === realtimeTopic)
        if (!exists) {
          const chan = new RealtimeChannel_1.default(`realtime:${topic}`, params, this)
          this.channels.push(chan)
          return chan
        } else {
          return exists
        }
      }
      /**
       * Push out a message if the socket is connected.
       *
       * If the socket is not connected, the message gets enqueued within a local buffer, and sent out when a connection is next established.
       */
      push(data) {
        const { topic, event, payload, ref } = data
        const callback = () => {
          this.encode(data, (result) => {
            var _a
            ;(_a = this.conn) === null || _a === void 0 ? void 0 : _a.send(result)
          })
        }
        this.log("push", `${topic} ${event} (${ref})`, payload)
        if (this.isConnected()) {
          callback()
        } else {
          this.sendBuffer.push(callback)
        }
      }
      /**
       * Sets the JWT access token used for channel subscription authorization and Realtime RLS.
       *
       * If param is null it will use the `accessToken` callback function or the token set on the client.
       *
       * On callback used, it will set the value of the token internal to the client.
       *
       * When a token is explicitly provided, it will be preserved across channel operations
       * (including removeChannel and resubscribe). The `accessToken` callback will not be
       * invoked until `setAuth()` is called without arguments.
       *
       * @param token A JWT string to override the token set on the client.
       *
       * @example
       * // Use a manual token (preserved across resubscribes, ignores accessToken callback)
       * client.realtime.setAuth('my-custom-jwt')
       *
       * // Switch back to using the accessToken callback
       * client.realtime.setAuth()
       */
      async setAuth(token = null) {
        this._authPromise = this._performAuth(token)
        try {
          await this._authPromise
        } finally {
          this._authPromise = null
        }
      }
      /**
       * Returns true if the current access token was explicitly set via setAuth(token),
       * false if it was obtained via the accessToken callback.
       * @internal
       */
      _isManualToken() {
        return this._manuallySetToken
      }
      /**
       * Sends a heartbeat message if the socket is connected.
       */
      async sendHeartbeat() {
        var _a
        if (!this.isConnected()) {
          try {
            this.heartbeatCallback("disconnected")
          } catch (e) {
            this.log("error", "error in heartbeat callback", e)
          }
          return
        }
        if (this.pendingHeartbeatRef) {
          this.pendingHeartbeatRef = null
          this.log("transport", "heartbeat timeout. Attempting to re-establish connection")
          try {
            this.heartbeatCallback("timeout")
          } catch (e) {
            this.log("error", "error in heartbeat callback", e)
          }
          this._wasManualDisconnect = false
          ;(_a = this.conn) === null || _a === void 0
            ? void 0
            : _a.close(constants_1.WS_CLOSE_NORMAL, "heartbeat timeout")
          setTimeout(() => {
            var _a2
            if (!this.isConnected()) {
              ;(_a2 = this.reconnectTimer) === null || _a2 === void 0
                ? void 0
                : _a2.scheduleTimeout()
            }
          }, CONNECTION_TIMEOUTS.HEARTBEAT_TIMEOUT_FALLBACK)
          return
        }
        this.pendingHeartbeatRef = this._makeRef()
        this.push({
          topic: "phoenix",
          event: "heartbeat",
          payload: {},
          ref: this.pendingHeartbeatRef,
        })
        try {
          this.heartbeatCallback("sent")
        } catch (e) {
          this.log("error", "error in heartbeat callback", e)
        }
        this._setAuthSafely("heartbeat")
      }
      /**
       * Sets a callback that receives lifecycle events for internal heartbeat messages.
       * Useful for instrumenting connection health (e.g. sent/ok/timeout/disconnected).
       */
      onHeartbeat(callback) {
        this.heartbeatCallback = callback
      }
      /**
       * Flushes send buffer
       */
      flushSendBuffer() {
        if (this.isConnected() && this.sendBuffer.length > 0) {
          this.sendBuffer.forEach((callback) => callback())
          this.sendBuffer = []
        }
      }
      /**
       * Return the next message ref, accounting for overflows
       *
       * @internal
       */
      _makeRef() {
        let newRef = this.ref + 1
        if (newRef === this.ref) {
          this.ref = 0
        } else {
          this.ref = newRef
        }
        return this.ref.toString()
      }
      /**
       * Unsubscribe from channels with the specified topic.
       *
       * @internal
       */
      _leaveOpenTopic(topic) {
        let dupChannel = this.channels.find(
          (c) => c.topic === topic && (c._isJoined() || c._isJoining())
        )
        if (dupChannel) {
          this.log("transport", `leaving duplicate topic "${topic}"`)
          dupChannel.unsubscribe()
        }
      }
      /**
       * Removes a subscription from the socket.
       *
       * @param channel An open subscription.
       *
       * @internal
       */
      _remove(channel) {
        this.channels = this.channels.filter((c) => c.topic !== channel.topic)
      }
      /** @internal */
      _onConnMessage(rawMessage) {
        this.decode(rawMessage.data, (msg) => {
          if (msg.topic === "phoenix" && msg.event === "phx_reply") {
            try {
              this.heartbeatCallback(msg.payload.status === "ok" ? "ok" : "error")
            } catch (e) {
              this.log("error", "error in heartbeat callback", e)
            }
          }
          if (msg.ref && msg.ref === this.pendingHeartbeatRef) {
            this.pendingHeartbeatRef = null
          }
          const { topic, event, payload, ref } = msg
          const refString = ref ? `(${ref})` : ""
          const status = payload.status || ""
          this.log("receive", `${status} ${topic} ${event} ${refString}`.trim(), payload)
          this.channels
            .filter((channel) => channel._isMember(topic))
            .forEach((channel) => channel._trigger(event, payload, ref))
          this._triggerStateCallbacks("message", msg)
        })
      }
      /**
       * Clear specific timer
       * @internal
       */
      _clearTimer(timer) {
        var _a
        if (timer === "heartbeat" && this.heartbeatTimer) {
          clearInterval(this.heartbeatTimer)
          this.heartbeatTimer = void 0
        } else if (timer === "reconnect") {
          ;(_a = this.reconnectTimer) === null || _a === void 0 ? void 0 : _a.reset()
        }
      }
      /**
       * Clear all timers
       * @internal
       */
      _clearAllTimers() {
        this._clearTimer("heartbeat")
        this._clearTimer("reconnect")
      }
      /**
       * Setup connection handlers for WebSocket events
       * @internal
       */
      _setupConnectionHandlers() {
        if (!this.conn) return
        if ("binaryType" in this.conn) {
          this.conn.binaryType = "arraybuffer"
        }
        this.conn.onopen = () => this._onConnOpen()
        this.conn.onerror = (error) => this._onConnError(error)
        this.conn.onmessage = (event) => this._onConnMessage(event)
        this.conn.onclose = (event) => this._onConnClose(event)
        if (this.conn.readyState === constants_1.SOCKET_STATES.open) {
          this._onConnOpen()
        }
      }
      /**
       * Teardown connection and cleanup resources
       * @internal
       */
      _teardownConnection() {
        if (this.conn) {
          if (
            this.conn.readyState === constants_1.SOCKET_STATES.open ||
            this.conn.readyState === constants_1.SOCKET_STATES.connecting
          ) {
            try {
              this.conn.close()
            } catch (e) {
              this.log("error", "Error closing connection", e)
            }
          }
          this.conn.onopen = null
          this.conn.onerror = null
          this.conn.onmessage = null
          this.conn.onclose = null
          this.conn = null
        }
        this._clearAllTimers()
        this._terminateWorker()
        this.channels.forEach((channel) => channel.teardown())
      }
      /** @internal */
      _onConnOpen() {
        this._setConnectionState("connected")
        this.log("transport", `connected to ${this.endpointURL()}`)
        const authPromise =
          this._authPromise ||
          (this.accessToken && !this.accessTokenValue ? this.setAuth() : Promise.resolve())
        authPromise
          .then(() => {
            this.flushSendBuffer()
          })
          .catch((e) => {
            this.log("error", "error waiting for auth on connect", e)
            this.flushSendBuffer()
          })
        this._clearTimer("reconnect")
        if (!this.worker) {
          this._startHeartbeat()
        } else {
          if (!this.workerRef) {
            this._startWorkerHeartbeat()
          }
        }
        this._triggerStateCallbacks("open")
      }
      /** @internal */
      _startHeartbeat() {
        this.heartbeatTimer && clearInterval(this.heartbeatTimer)
        this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), this.heartbeatIntervalMs)
      }
      /** @internal */
      _startWorkerHeartbeat() {
        if (this.workerUrl) {
          this.log("worker", `starting worker for from ${this.workerUrl}`)
        } else {
          this.log("worker", `starting default worker`)
        }
        const objectUrl = this._workerObjectUrl(this.workerUrl)
        this.workerRef = new Worker(objectUrl)
        this.workerRef.onerror = (error) => {
          this.log("worker", "worker error", error.message)
          this._terminateWorker()
        }
        this.workerRef.onmessage = (event) => {
          if (event.data.event === "keepAlive") {
            this.sendHeartbeat()
          }
        }
        this.workerRef.postMessage({
          event: "start",
          interval: this.heartbeatIntervalMs,
        })
      }
      /**
       * Terminate the Web Worker and clear the reference
       * @internal
       */
      _terminateWorker() {
        if (this.workerRef) {
          this.log("worker", "terminating worker")
          this.workerRef.terminate()
          this.workerRef = void 0
        }
      }
      /** @internal */
      _onConnClose(event) {
        var _a
        this._setConnectionState("disconnected")
        this.log("transport", "close", event)
        this._triggerChanError()
        this._clearTimer("heartbeat")
        if (!this._wasManualDisconnect) {
          ;(_a = this.reconnectTimer) === null || _a === void 0 ? void 0 : _a.scheduleTimeout()
        }
        this._triggerStateCallbacks("close", event)
      }
      /** @internal */
      _onConnError(error) {
        this._setConnectionState("disconnected")
        this.log("transport", `${error}`)
        this._triggerChanError()
        this._triggerStateCallbacks("error", error)
      }
      /** @internal */
      _triggerChanError() {
        this.channels.forEach((channel) => channel._trigger(constants_1.CHANNEL_EVENTS.error))
      }
      /** @internal */
      _appendParams(url, params) {
        if (Object.keys(params).length === 0) {
          return url
        }
        const prefix = url.match(/\?/) ? "&" : "?"
        const query = new URLSearchParams(params)
        return `${url}${prefix}${query}`
      }
      _workerObjectUrl(url) {
        let result_url
        if (url) {
          result_url = url
        } else {
          const blob = new Blob([WORKER_SCRIPT], { type: "application/javascript" })
          result_url = URL.createObjectURL(blob)
        }
        return result_url
      }
      /**
       * Set connection state with proper state management
       * @internal
       */
      _setConnectionState(state, manual = false) {
        this._connectionState = state
        if (state === "connecting") {
          this._wasManualDisconnect = false
        } else if (state === "disconnecting") {
          this._wasManualDisconnect = manual
        }
      }
      /**
       * Perform the actual auth operation
       * @internal
       */
      async _performAuth(token = null) {
        let tokenToSend
        let isManualToken = false
        if (token) {
          tokenToSend = token
          isManualToken = true
        } else if (this.accessToken) {
          try {
            tokenToSend = await this.accessToken()
          } catch (e) {
            this.log("error", "Error fetching access token from callback", e)
            tokenToSend = this.accessTokenValue
          }
        } else {
          tokenToSend = this.accessTokenValue
        }
        if (isManualToken) {
          this._manuallySetToken = true
        } else if (this.accessToken) {
          this._manuallySetToken = false
        }
        if (this.accessTokenValue != tokenToSend) {
          this.accessTokenValue = tokenToSend
          this.channels.forEach((channel) => {
            const payload = {
              access_token: tokenToSend,
              version: constants_1.DEFAULT_VERSION,
            }
            tokenToSend && channel.updateJoinPayload(payload)
            if (channel.joinedOnce && channel._isJoined()) {
              channel._push(constants_1.CHANNEL_EVENTS.access_token, {
                access_token: tokenToSend,
              })
            }
          })
        }
      }
      /**
       * Wait for any in-flight auth operations to complete
       * @internal
       */
      async _waitForAuthIfNeeded() {
        if (this._authPromise) {
          await this._authPromise
        }
      }
      /**
       * Safely call setAuth with standardized error handling
       * @internal
       */
      _setAuthSafely(context = "general") {
        if (!this._isManualToken()) {
          this.setAuth().catch((e) => {
            this.log("error", `Error setting auth in ${context}`, e)
          })
        }
      }
      /**
       * Trigger state change callbacks with proper error handling
       * @internal
       */
      _triggerStateCallbacks(event, data) {
        try {
          this.stateChangeCallbacks[event].forEach((callback) => {
            try {
              callback(data)
            } catch (e) {
              this.log("error", `error in ${event} callback`, e)
            }
          })
        } catch (e) {
          this.log("error", `error triggering ${event} callbacks`, e)
        }
      }
      /**
       * Setup reconnection timer with proper configuration
       * @internal
       */
      _setupReconnectionTimer() {
        this.reconnectTimer = new timer_1.default(async () => {
          setTimeout(async () => {
            await this._waitForAuthIfNeeded()
            if (!this.isConnected()) {
              this.connect()
            }
          }, CONNECTION_TIMEOUTS.RECONNECT_DELAY)
        }, this.reconnectAfterMs)
      }
      /**
       * Initialize client options with defaults
       * @internal
       */
      _initializeOptions(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m
        this.transport =
          (_a = options === null || options === void 0 ? void 0 : options.transport) !== null &&
          _a !== void 0
            ? _a
            : null
        this.timeout =
          (_b = options === null || options === void 0 ? void 0 : options.timeout) !== null &&
          _b !== void 0
            ? _b
            : constants_1.DEFAULT_TIMEOUT
        this.heartbeatIntervalMs =
          (_c = options === null || options === void 0 ? void 0 : options.heartbeatIntervalMs) !==
            null && _c !== void 0
            ? _c
            : CONNECTION_TIMEOUTS.HEARTBEAT_INTERVAL
        this.worker =
          (_d = options === null || options === void 0 ? void 0 : options.worker) !== null &&
          _d !== void 0
            ? _d
            : false
        this.accessToken =
          (_e = options === null || options === void 0 ? void 0 : options.accessToken) !== null &&
          _e !== void 0
            ? _e
            : null
        this.heartbeatCallback =
          (_f = options === null || options === void 0 ? void 0 : options.heartbeatCallback) !==
            null && _f !== void 0
            ? _f
            : noop
        this.vsn =
          (_g = options === null || options === void 0 ? void 0 : options.vsn) !== null &&
          _g !== void 0
            ? _g
            : constants_1.DEFAULT_VSN
        if (options === null || options === void 0 ? void 0 : options.params)
          this.params = options.params
        if (options === null || options === void 0 ? void 0 : options.logger)
          this.logger = options.logger
        if (
          (options === null || options === void 0 ? void 0 : options.logLevel) ||
          (options === null || options === void 0 ? void 0 : options.log_level)
        ) {
          this.logLevel = options.logLevel || options.log_level
          this.params = Object.assign(Object.assign({}, this.params), { log_level: this.logLevel })
        }
        this.reconnectAfterMs =
          (_h = options === null || options === void 0 ? void 0 : options.reconnectAfterMs) !==
            null && _h !== void 0
            ? _h
            : (tries) => {
                return RECONNECT_INTERVALS[tries - 1] || DEFAULT_RECONNECT_FALLBACK
              }
        switch (this.vsn) {
          case constants_1.VSN_1_0_0:
            this.encode =
              (_j = options === null || options === void 0 ? void 0 : options.encode) !== null &&
              _j !== void 0
                ? _j
                : (payload, callback) => {
                    return callback(JSON.stringify(payload))
                  }
            this.decode =
              (_k = options === null || options === void 0 ? void 0 : options.decode) !== null &&
              _k !== void 0
                ? _k
                : (payload, callback) => {
                    return callback(JSON.parse(payload))
                  }
            break
          case constants_1.VSN_2_0_0:
            this.encode =
              (_l = options === null || options === void 0 ? void 0 : options.encode) !== null &&
              _l !== void 0
                ? _l
                : this.serializer.encode.bind(this.serializer)
            this.decode =
              (_m = options === null || options === void 0 ? void 0 : options.decode) !== null &&
              _m !== void 0
                ? _m
                : this.serializer.decode.bind(this.serializer)
            break
          default:
            throw new Error(`Unsupported serializer version: ${this.vsn}`)
        }
        if (this.worker) {
          if (typeof window !== "undefined" && !window.Worker) {
            throw new Error("Web Worker is not supported")
          }
          this.workerUrl = options === null || options === void 0 ? void 0 : options.workerUrl
        }
      }
    }
    exports.default = RealtimeClient2
  },
})

// node_modules/@supabase/realtime-js/dist/main/index.js
var require_main2 = __commonJS({
  "node_modules/@supabase/realtime-js/dist/main/index.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.WebSocketFactory =
      exports.REALTIME_CHANNEL_STATES =
      exports.REALTIME_SUBSCRIBE_STATES =
      exports.REALTIME_PRESENCE_LISTEN_EVENTS =
      exports.REALTIME_POSTGRES_CHANGES_LISTEN_EVENT =
      exports.REALTIME_LISTEN_TYPES =
      exports.RealtimeClient =
      exports.RealtimeChannel =
      exports.RealtimePresence =
        void 0
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports))
    var RealtimeClient_1 = tslib_1.__importDefault(require_RealtimeClient())
    exports.RealtimeClient = RealtimeClient_1.default
    var RealtimeChannel_1 = tslib_1.__importStar(require_RealtimeChannel())
    exports.RealtimeChannel = RealtimeChannel_1.default
    Object.defineProperty(exports, "REALTIME_LISTEN_TYPES", {
      enumerable: true,
      get: function () {
        return RealtimeChannel_1.REALTIME_LISTEN_TYPES
      },
    })
    Object.defineProperty(exports, "REALTIME_POSTGRES_CHANGES_LISTEN_EVENT", {
      enumerable: true,
      get: function () {
        return RealtimeChannel_1.REALTIME_POSTGRES_CHANGES_LISTEN_EVENT
      },
    })
    Object.defineProperty(exports, "REALTIME_SUBSCRIBE_STATES", {
      enumerable: true,
      get: function () {
        return RealtimeChannel_1.REALTIME_SUBSCRIBE_STATES
      },
    })
    Object.defineProperty(exports, "REALTIME_CHANNEL_STATES", {
      enumerable: true,
      get: function () {
        return RealtimeChannel_1.REALTIME_CHANNEL_STATES
      },
    })
    var RealtimePresence_1 = tslib_1.__importStar(require_RealtimePresence())
    exports.RealtimePresence = RealtimePresence_1.default
    Object.defineProperty(exports, "REALTIME_PRESENCE_LISTEN_EVENTS", {
      enumerable: true,
      get: function () {
        return RealtimePresence_1.REALTIME_PRESENCE_LISTEN_EVENTS
      },
    })
    var websocket_factory_1 = tslib_1.__importDefault(require_websocket_factory())
    exports.WebSocketFactory = websocket_factory_1.default
  },
})

// node_modules/@supabase/auth-js/dist/main/lib/version.js
var require_version2 = __commonJS({
  "node_modules/@supabase/auth-js/dist/main/lib/version.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.version = void 0
    exports.version = "2.88.0"
  },
})

// node_modules/@supabase/auth-js/dist/main/lib/constants.js
var require_constants2 = __commonJS({
  "node_modules/@supabase/auth-js/dist/main/lib/constants.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.JWKS_TTL =
      exports.BASE64URL_REGEX =
      exports.API_VERSIONS =
      exports.API_VERSION_HEADER_NAME =
      exports.NETWORK_FAILURE =
      exports.DEFAULT_HEADERS =
      exports.AUDIENCE =
      exports.STORAGE_KEY =
      exports.GOTRUE_URL =
      exports.EXPIRY_MARGIN_MS =
      exports.AUTO_REFRESH_TICK_THRESHOLD =
      exports.AUTO_REFRESH_TICK_DURATION_MS =
        void 0
    var version_1 = require_version2()
    exports.AUTO_REFRESH_TICK_DURATION_MS = 30 * 1e3
    exports.AUTO_REFRESH_TICK_THRESHOLD = 3
    exports.EXPIRY_MARGIN_MS =
      exports.AUTO_REFRESH_TICK_THRESHOLD * exports.AUTO_REFRESH_TICK_DURATION_MS
    exports.GOTRUE_URL = "http://localhost:9999"
    exports.STORAGE_KEY = "supabase.auth.token"
    exports.AUDIENCE = ""
    exports.DEFAULT_HEADERS = { "X-Client-Info": `gotrue-js/${version_1.version}` }
    exports.NETWORK_FAILURE = {
      MAX_RETRIES: 10,
      RETRY_INTERVAL: 2,
      // in deciseconds
    }
    exports.API_VERSION_HEADER_NAME = "X-Supabase-Api-Version"
    exports.API_VERSIONS = {
      "2024-01-01": {
        timestamp: Date.parse("2024-01-01T00:00:00.0Z"),
        name: "2024-01-01",
      },
    }
    exports.BASE64URL_REGEX = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i
    exports.JWKS_TTL = 10 * 60 * 1e3
  },
})

// node_modules/@supabase/auth-js/dist/main/lib/errors.js
var require_errors = __commonJS({
  "node_modules/@supabase/auth-js/dist/main/lib/errors.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.AuthInvalidJwtError =
      exports.AuthWeakPasswordError =
      exports.AuthRetryableFetchError =
      exports.AuthPKCECodeVerifierMissingError =
      exports.AuthPKCEGrantCodeExchangeError =
      exports.AuthImplicitGrantRedirectError =
      exports.AuthInvalidCredentialsError =
      exports.AuthInvalidTokenResponseError =
      exports.AuthSessionMissingError =
      exports.CustomAuthError =
      exports.AuthUnknownError =
      exports.AuthApiError =
      exports.AuthError =
        void 0
    exports.isAuthError = isAuthError
    exports.isAuthApiError = isAuthApiError
    exports.isAuthSessionMissingError = isAuthSessionMissingError
    exports.isAuthImplicitGrantRedirectError = isAuthImplicitGrantRedirectError
    exports.isAuthPKCECodeVerifierMissingError = isAuthPKCECodeVerifierMissingError
    exports.isAuthRetryableFetchError = isAuthRetryableFetchError
    exports.isAuthWeakPasswordError = isAuthWeakPasswordError
    var AuthError = class extends Error {
      constructor(message, status, code) {
        super(message)
        this.__isAuthError = true
        this.name = "AuthError"
        this.status = status
        this.code = code
      }
    }
    exports.AuthError = AuthError
    function isAuthError(error) {
      return typeof error === "object" && error !== null && "__isAuthError" in error
    }
    var AuthApiError = class extends AuthError {
      constructor(message, status, code) {
        super(message, status, code)
        this.name = "AuthApiError"
        this.status = status
        this.code = code
      }
    }
    exports.AuthApiError = AuthApiError
    function isAuthApiError(error) {
      return isAuthError(error) && error.name === "AuthApiError"
    }
    var AuthUnknownError = class extends AuthError {
      constructor(message, originalError) {
        super(message)
        this.name = "AuthUnknownError"
        this.originalError = originalError
      }
    }
    exports.AuthUnknownError = AuthUnknownError
    var CustomAuthError = class extends AuthError {
      constructor(message, name, status, code) {
        super(message, status, code)
        this.name = name
        this.status = status
      }
    }
    exports.CustomAuthError = CustomAuthError
    var AuthSessionMissingError = class extends CustomAuthError {
      constructor() {
        super("Auth session missing!", "AuthSessionMissingError", 400, void 0)
      }
    }
    exports.AuthSessionMissingError = AuthSessionMissingError
    function isAuthSessionMissingError(error) {
      return isAuthError(error) && error.name === "AuthSessionMissingError"
    }
    var AuthInvalidTokenResponseError = class extends CustomAuthError {
      constructor() {
        super("Auth session or user missing", "AuthInvalidTokenResponseError", 500, void 0)
      }
    }
    exports.AuthInvalidTokenResponseError = AuthInvalidTokenResponseError
    var AuthInvalidCredentialsError = class extends CustomAuthError {
      constructor(message) {
        super(message, "AuthInvalidCredentialsError", 400, void 0)
      }
    }
    exports.AuthInvalidCredentialsError = AuthInvalidCredentialsError
    var AuthImplicitGrantRedirectError = class extends CustomAuthError {
      constructor(message, details = null) {
        super(message, "AuthImplicitGrantRedirectError", 500, void 0)
        this.details = null
        this.details = details
      }
      toJSON() {
        return {
          name: this.name,
          message: this.message,
          status: this.status,
          details: this.details,
        }
      }
    }
    exports.AuthImplicitGrantRedirectError = AuthImplicitGrantRedirectError
    function isAuthImplicitGrantRedirectError(error) {
      return isAuthError(error) && error.name === "AuthImplicitGrantRedirectError"
    }
    var AuthPKCEGrantCodeExchangeError = class extends CustomAuthError {
      constructor(message, details = null) {
        super(message, "AuthPKCEGrantCodeExchangeError", 500, void 0)
        this.details = null
        this.details = details
      }
      toJSON() {
        return {
          name: this.name,
          message: this.message,
          status: this.status,
          details: this.details,
        }
      }
    }
    exports.AuthPKCEGrantCodeExchangeError = AuthPKCEGrantCodeExchangeError
    var AuthPKCECodeVerifierMissingError = class extends CustomAuthError {
      constructor() {
        super(
          "PKCE code verifier not found in storage. This can happen if the auth flow was initiated in a different browser or device, or if the storage was cleared. For SSR frameworks (Next.js, SvelteKit, etc.), use @supabase/ssr on both the server and client to store the code verifier in cookies.",
          "AuthPKCECodeVerifierMissingError",
          400,
          "pkce_code_verifier_not_found"
        )
      }
    }
    exports.AuthPKCECodeVerifierMissingError = AuthPKCECodeVerifierMissingError
    function isAuthPKCECodeVerifierMissingError(error) {
      return isAuthError(error) && error.name === "AuthPKCECodeVerifierMissingError"
    }
    var AuthRetryableFetchError = class extends CustomAuthError {
      constructor(message, status) {
        super(message, "AuthRetryableFetchError", status, void 0)
      }
    }
    exports.AuthRetryableFetchError = AuthRetryableFetchError
    function isAuthRetryableFetchError(error) {
      return isAuthError(error) && error.name === "AuthRetryableFetchError"
    }
    var AuthWeakPasswordError = class extends CustomAuthError {
      constructor(message, status, reasons) {
        super(message, "AuthWeakPasswordError", status, "weak_password")
        this.reasons = reasons
      }
    }
    exports.AuthWeakPasswordError = AuthWeakPasswordError
    function isAuthWeakPasswordError(error) {
      return isAuthError(error) && error.name === "AuthWeakPasswordError"
    }
    var AuthInvalidJwtError = class extends CustomAuthError {
      constructor(message) {
        super(message, "AuthInvalidJwtError", 400, "invalid_jwt")
      }
    }
    exports.AuthInvalidJwtError = AuthInvalidJwtError
  },
})

// node_modules/@supabase/auth-js/dist/main/lib/base64url.js
var require_base64url = __commonJS({
  "node_modules/@supabase/auth-js/dist/main/lib/base64url.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.byteToBase64URL = byteToBase64URL
    exports.byteFromBase64URL = byteFromBase64URL
    exports.stringToBase64URL = stringToBase64URL
    exports.stringFromBase64URL = stringFromBase64URL
    exports.codepointToUTF8 = codepointToUTF8
    exports.stringToUTF8 = stringToUTF8
    exports.stringFromUTF8 = stringFromUTF8
    exports.base64UrlToUint8Array = base64UrlToUint8Array
    exports.stringToUint8Array = stringToUint8Array
    exports.bytesToBase64URL = bytesToBase64URL
    var TO_BASE64URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split("")
    var IGNORE_BASE64URL = " 	\n\r=".split("")
    var FROM_BASE64URL = (() => {
      const charMap = new Array(128)
      for (let i = 0; i < charMap.length; i += 1) {
        charMap[i] = -1
      }
      for (let i = 0; i < IGNORE_BASE64URL.length; i += 1) {
        charMap[IGNORE_BASE64URL[i].charCodeAt(0)] = -2
      }
      for (let i = 0; i < TO_BASE64URL.length; i += 1) {
        charMap[TO_BASE64URL[i].charCodeAt(0)] = i
      }
      return charMap
    })()
    function byteToBase64URL(byte, state, emit) {
      if (byte !== null) {
        state.queue = (state.queue << 8) | byte
        state.queuedBits += 8
        while (state.queuedBits >= 6) {
          const pos = (state.queue >> (state.queuedBits - 6)) & 63
          emit(TO_BASE64URL[pos])
          state.queuedBits -= 6
        }
      } else if (state.queuedBits > 0) {
        state.queue = state.queue << (6 - state.queuedBits)
        state.queuedBits = 6
        while (state.queuedBits >= 6) {
          const pos = (state.queue >> (state.queuedBits - 6)) & 63
          emit(TO_BASE64URL[pos])
          state.queuedBits -= 6
        }
      }
    }
    function byteFromBase64URL(charCode, state, emit) {
      const bits = FROM_BASE64URL[charCode]
      if (bits > -1) {
        state.queue = (state.queue << 6) | bits
        state.queuedBits += 6
        while (state.queuedBits >= 8) {
          emit((state.queue >> (state.queuedBits - 8)) & 255)
          state.queuedBits -= 8
        }
      } else if (bits === -2) {
        return
      } else {
        throw new Error(`Invalid Base64-URL character "${String.fromCharCode(charCode)}"`)
      }
    }
    function stringToBase64URL(str) {
      const base64 = []
      const emitter = (char) => {
        base64.push(char)
      }
      const state = { queue: 0, queuedBits: 0 }
      stringToUTF8(str, (byte) => {
        byteToBase64URL(byte, state, emitter)
      })
      byteToBase64URL(null, state, emitter)
      return base64.join("")
    }
    function stringFromBase64URL(str) {
      const conv = []
      const utf8Emit = (codepoint) => {
        conv.push(String.fromCodePoint(codepoint))
      }
      const utf8State = {
        utf8seq: 0,
        codepoint: 0,
      }
      const b64State = { queue: 0, queuedBits: 0 }
      const byteEmit = (byte) => {
        stringFromUTF8(byte, utf8State, utf8Emit)
      }
      for (let i = 0; i < str.length; i += 1) {
        byteFromBase64URL(str.charCodeAt(i), b64State, byteEmit)
      }
      return conv.join("")
    }
    function codepointToUTF8(codepoint, emit) {
      if (codepoint <= 127) {
        emit(codepoint)
        return
      } else if (codepoint <= 2047) {
        emit(192 | (codepoint >> 6))
        emit(128 | (codepoint & 63))
        return
      } else if (codepoint <= 65535) {
        emit(224 | (codepoint >> 12))
        emit(128 | ((codepoint >> 6) & 63))
        emit(128 | (codepoint & 63))
        return
      } else if (codepoint <= 1114111) {
        emit(240 | (codepoint >> 18))
        emit(128 | ((codepoint >> 12) & 63))
        emit(128 | ((codepoint >> 6) & 63))
        emit(128 | (codepoint & 63))
        return
      }
      throw new Error(`Unrecognized Unicode codepoint: ${codepoint.toString(16)}`)
    }
    function stringToUTF8(str, emit) {
      for (let i = 0; i < str.length; i += 1) {
        let codepoint = str.charCodeAt(i)
        if (codepoint > 55295 && codepoint <= 56319) {
          const highSurrogate = ((codepoint - 55296) * 1024) & 65535
          const lowSurrogate = (str.charCodeAt(i + 1) - 56320) & 65535
          codepoint = (lowSurrogate | highSurrogate) + 65536
          i += 1
        }
        codepointToUTF8(codepoint, emit)
      }
    }
    function stringFromUTF8(byte, state, emit) {
      if (state.utf8seq === 0) {
        if (byte <= 127) {
          emit(byte)
          return
        }
        for (let leadingBit = 1; leadingBit < 6; leadingBit += 1) {
          if (((byte >> (7 - leadingBit)) & 1) === 0) {
            state.utf8seq = leadingBit
            break
          }
        }
        if (state.utf8seq === 2) {
          state.codepoint = byte & 31
        } else if (state.utf8seq === 3) {
          state.codepoint = byte & 15
        } else if (state.utf8seq === 4) {
          state.codepoint = byte & 7
        } else {
          throw new Error("Invalid UTF-8 sequence")
        }
        state.utf8seq -= 1
      } else if (state.utf8seq > 0) {
        if (byte <= 127) {
          throw new Error("Invalid UTF-8 sequence")
        }
        state.codepoint = (state.codepoint << 6) | (byte & 63)
        state.utf8seq -= 1
        if (state.utf8seq === 0) {
          emit(state.codepoint)
        }
      }
    }
    function base64UrlToUint8Array(str) {
      const result = []
      const state = { queue: 0, queuedBits: 0 }
      const onByte = (byte) => {
        result.push(byte)
      }
      for (let i = 0; i < str.length; i += 1) {
        byteFromBase64URL(str.charCodeAt(i), state, onByte)
      }
      return new Uint8Array(result)
    }
    function stringToUint8Array(str) {
      const result = []
      stringToUTF8(str, (byte) => result.push(byte))
      return new Uint8Array(result)
    }
    function bytesToBase64URL(bytes) {
      const result = []
      const state = { queue: 0, queuedBits: 0 }
      const onChar = (char) => {
        result.push(char)
      }
      bytes.forEach((byte) => byteToBase64URL(byte, state, onChar))
      byteToBase64URL(null, state, onChar)
      return result.join("")
    }
  },
})

// node_modules/@supabase/auth-js/dist/main/lib/helpers.js
var require_helpers = __commonJS({
  "node_modules/@supabase/auth-js/dist/main/lib/helpers.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.Deferred =
      exports.removeItemAsync =
      exports.getItemAsync =
      exports.setItemAsync =
      exports.looksLikeFetchResponse =
      exports.resolveFetch =
      exports.supportsLocalStorage =
      exports.isBrowser =
        void 0
    exports.expiresAt = expiresAt
    exports.generateCallbackId = generateCallbackId
    exports.parseParametersFromURL = parseParametersFromURL
    exports.decodeJWT = decodeJWT
    exports.sleep = sleep
    exports.retryable = retryable
    exports.generatePKCEVerifier = generatePKCEVerifier
    exports.generatePKCEChallenge = generatePKCEChallenge
    exports.getCodeChallengeAndMethod = getCodeChallengeAndMethod
    exports.parseResponseAPIVersion = parseResponseAPIVersion
    exports.validateExp = validateExp
    exports.getAlgorithm = getAlgorithm
    exports.validateUUID = validateUUID
    exports.userNotAvailableProxy = userNotAvailableProxy
    exports.insecureUserWarningProxy = insecureUserWarningProxy
    exports.deepClone = deepClone
    var constants_1 = require_constants2()
    var errors_1 = require_errors()
    var base64url_1 = require_base64url()
    function expiresAt(expiresIn) {
      const timeNow = Math.round(Date.now() / 1e3)
      return timeNow + expiresIn
    }
    function generateCallbackId() {
      return /* @__PURE__ */ Symbol("auth-callback")
    }
    var isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined"
    exports.isBrowser = isBrowser
    var localStorageWriteTests = {
      tested: false,
      writable: false,
    }
    var supportsLocalStorage = () => {
      if (!(0, exports.isBrowser)()) {
        return false
      }
      try {
        if (typeof globalThis.localStorage !== "object") {
          return false
        }
      } catch (e) {
        return false
      }
      if (localStorageWriteTests.tested) {
        return localStorageWriteTests.writable
      }
      const randomKey = `lswt-${Math.random()}${Math.random()}`
      try {
        globalThis.localStorage.setItem(randomKey, randomKey)
        globalThis.localStorage.removeItem(randomKey)
        localStorageWriteTests.tested = true
        localStorageWriteTests.writable = true
      } catch (e) {
        localStorageWriteTests.tested = true
        localStorageWriteTests.writable = false
      }
      return localStorageWriteTests.writable
    }
    exports.supportsLocalStorage = supportsLocalStorage
    function parseParametersFromURL(href) {
      const result = {}
      const url = new URL(href)
      if (url.hash && url.hash[0] === "#") {
        try {
          const hashSearchParams = new URLSearchParams(url.hash.substring(1))
          hashSearchParams.forEach((value, key) => {
            result[key] = value
          })
        } catch (e) {}
      }
      url.searchParams.forEach((value, key) => {
        result[key] = value
      })
      return result
    }
    var resolveFetch3 = (customFetch) => {
      if (customFetch) {
        return (...args) => customFetch(...args)
      }
      return (...args) => fetch(...args)
    }
    exports.resolveFetch = resolveFetch3
    var looksLikeFetchResponse = (maybeResponse) => {
      return (
        typeof maybeResponse === "object" &&
        maybeResponse !== null &&
        "status" in maybeResponse &&
        "ok" in maybeResponse &&
        "json" in maybeResponse &&
        typeof maybeResponse.json === "function"
      )
    }
    exports.looksLikeFetchResponse = looksLikeFetchResponse
    var setItemAsync = async (storage, key, data) => {
      await storage.setItem(key, JSON.stringify(data))
    }
    exports.setItemAsync = setItemAsync
    var getItemAsync = async (storage, key) => {
      const value = await storage.getItem(key)
      if (!value) {
        return null
      }
      try {
        return JSON.parse(value)
      } catch (_a) {
        return value
      }
    }
    exports.getItemAsync = getItemAsync
    var removeItemAsync = async (storage, key) => {
      await storage.removeItem(key)
    }
    exports.removeItemAsync = removeItemAsync
    var Deferred = class _Deferred {
      constructor() {
        this.promise = new _Deferred.promiseConstructor((res, rej) => {
          this.resolve = res
          this.reject = rej
        })
      }
    }
    exports.Deferred = Deferred
    Deferred.promiseConstructor = Promise
    function decodeJWT(token) {
      const parts = token.split(".")
      if (parts.length !== 3) {
        throw new errors_1.AuthInvalidJwtError("Invalid JWT structure")
      }
      for (let i = 0; i < parts.length; i++) {
        if (!constants_1.BASE64URL_REGEX.test(parts[i])) {
          throw new errors_1.AuthInvalidJwtError("JWT not in base64url format")
        }
      }
      const data = {
        // using base64url lib
        header: JSON.parse((0, base64url_1.stringFromBase64URL)(parts[0])),
        payload: JSON.parse((0, base64url_1.stringFromBase64URL)(parts[1])),
        signature: (0, base64url_1.base64UrlToUint8Array)(parts[2]),
        raw: {
          header: parts[0],
          payload: parts[1],
        },
      }
      return data
    }
    async function sleep(time) {
      return await new Promise((accept) => {
        setTimeout(() => accept(null), time)
      })
    }
    function retryable(fn, isRetryable) {
      const promise = new Promise((accept, reject) => {
        ;(async () => {
          for (let attempt = 0; attempt < Infinity; attempt++) {
            try {
              const result = await fn(attempt)
              if (!isRetryable(attempt, null, result)) {
                accept(result)
                return
              }
            } catch (e) {
              if (!isRetryable(attempt, e)) {
                reject(e)
                return
              }
            }
          }
        })()
      })
      return promise
    }
    function dec2hex(dec) {
      return ("0" + dec.toString(16)).substr(-2)
    }
    function generatePKCEVerifier() {
      const verifierLength = 56
      const array = new Uint32Array(verifierLength)
      if (typeof crypto === "undefined") {
        const charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
        const charSetLen = charSet.length
        let verifier = ""
        for (let i = 0; i < verifierLength; i++) {
          verifier += charSet.charAt(Math.floor(Math.random() * charSetLen))
        }
        return verifier
      }
      crypto.getRandomValues(array)
      return Array.from(array, dec2hex).join("")
    }
    async function sha256(randomString) {
      const encoder = new TextEncoder()
      const encodedData = encoder.encode(randomString)
      const hash = await crypto.subtle.digest("SHA-256", encodedData)
      const bytes = new Uint8Array(hash)
      return Array.from(bytes)
        .map((c) => String.fromCharCode(c))
        .join("")
    }
    async function generatePKCEChallenge(verifier) {
      const hasCryptoSupport =
        typeof crypto !== "undefined" &&
        typeof crypto.subtle !== "undefined" &&
        typeof TextEncoder !== "undefined"
      if (!hasCryptoSupport) {
        console.warn(
          "WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256."
        )
        return verifier
      }
      const hashed = await sha256(verifier)
      return btoa(hashed).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
    }
    async function getCodeChallengeAndMethod(storage, storageKey, isPasswordRecovery = false) {
      const codeVerifier = generatePKCEVerifier()
      let storedCodeVerifier = codeVerifier
      if (isPasswordRecovery) {
        storedCodeVerifier += "/PASSWORD_RECOVERY"
      }
      await (0, exports.setItemAsync)(storage, `${storageKey}-code-verifier`, storedCodeVerifier)
      const codeChallenge = await generatePKCEChallenge(codeVerifier)
      const codeChallengeMethod = codeVerifier === codeChallenge ? "plain" : "s256"
      return [codeChallenge, codeChallengeMethod]
    }
    var API_VERSION_REGEX = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i
    function parseResponseAPIVersion(response) {
      const apiVersion = response.headers.get(constants_1.API_VERSION_HEADER_NAME)
      if (!apiVersion) {
        return null
      }
      if (!apiVersion.match(API_VERSION_REGEX)) {
        return null
      }
      try {
        const date = /* @__PURE__ */ new Date(`${apiVersion}T00:00:00.0Z`)
        return date
      } catch (e) {
        return null
      }
    }
    function validateExp(exp) {
      if (!exp) {
        throw new Error("Missing exp claim")
      }
      const timeNow = Math.floor(Date.now() / 1e3)
      if (exp <= timeNow) {
        throw new Error("JWT has expired")
      }
    }
    function getAlgorithm(alg) {
      switch (alg) {
        case "RS256":
          return {
            name: "RSASSA-PKCS1-v1_5",
            hash: { name: "SHA-256" },
          }
        case "ES256":
          return {
            name: "ECDSA",
            namedCurve: "P-256",
            hash: { name: "SHA-256" },
          }
        default:
          throw new Error("Invalid alg claim")
      }
    }
    var UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    function validateUUID(str) {
      if (!UUID_REGEX.test(str)) {
        throw new Error("@supabase/auth-js: Expected parameter to be UUID but is not")
      }
    }
    function userNotAvailableProxy() {
      const proxyTarget = {}
      return new Proxy(proxyTarget, {
        get: (target, prop) => {
          if (prop === "__isUserNotAvailableProxy") {
            return true
          }
          if (typeof prop === "symbol") {
            const sProp = prop.toString()
            if (
              sProp === "Symbol(Symbol.toPrimitive)" ||
              sProp === "Symbol(Symbol.toStringTag)" ||
              sProp === "Symbol(util.inspect.custom)"
            ) {
              return void 0
            }
          }
          throw new Error(
            `@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Accessing the "${prop}" property of the session object is not supported. Please use getUser() instead.`
          )
        },
        set: (_target, prop) => {
          throw new Error(
            `@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Setting the "${prop}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`
          )
        },
        deleteProperty: (_target, prop) => {
          throw new Error(
            `@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Deleting the "${prop}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`
          )
        },
      })
    }
    function insecureUserWarningProxy(user, suppressWarningRef) {
      return new Proxy(user, {
        get: (target, prop, receiver) => {
          if (prop === "__isInsecureUserWarningProxy") {
            return true
          }
          if (typeof prop === "symbol") {
            const sProp = prop.toString()
            if (
              sProp === "Symbol(Symbol.toPrimitive)" ||
              sProp === "Symbol(Symbol.toStringTag)" ||
              sProp === "Symbol(util.inspect.custom)" ||
              sProp === "Symbol(nodejs.util.inspect.custom)"
            ) {
              return Reflect.get(target, prop, receiver)
            }
          }
          if (!suppressWarningRef.value && typeof prop === "string") {
            console.warn(
              "Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server."
            )
            suppressWarningRef.value = true
          }
          return Reflect.get(target, prop, receiver)
        },
      })
    }
    function deepClone(obj) {
      return JSON.parse(JSON.stringify(obj))
    }
  },
})

// node_modules/@supabase/auth-js/dist/main/lib/fetch.js
var require_fetch = __commonJS({
  "node_modules/@supabase/auth-js/dist/main/lib/fetch.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.handleError = handleError2
    exports._request = _request
    exports._sessionResponse = _sessionResponse
    exports._sessionResponsePassword = _sessionResponsePassword
    exports._userResponse = _userResponse
    exports._ssoResponse = _ssoResponse
    exports._generateLinkResponse = _generateLinkResponse
    exports._noResolveJsonResponse = _noResolveJsonResponse
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports))
    var constants_1 = require_constants2()
    var helpers_1 = require_helpers()
    var errors_1 = require_errors()
    var _getErrorMessage2 = (err) =>
      err.msg || err.message || err.error_description || err.error || JSON.stringify(err)
    var NETWORK_ERROR_CODES = [502, 503, 504]
    async function handleError2(error) {
      var _a
      if (!(0, helpers_1.looksLikeFetchResponse)(error)) {
        throw new errors_1.AuthRetryableFetchError(_getErrorMessage2(error), 0)
      }
      if (NETWORK_ERROR_CODES.includes(error.status)) {
        throw new errors_1.AuthRetryableFetchError(_getErrorMessage2(error), error.status)
      }
      let data
      try {
        data = await error.json()
      } catch (e) {
        throw new errors_1.AuthUnknownError(_getErrorMessage2(e), e)
      }
      let errorCode = void 0
      const responseAPIVersion = (0, helpers_1.parseResponseAPIVersion)(error)
      if (
        responseAPIVersion &&
        responseAPIVersion.getTime() >= constants_1.API_VERSIONS["2024-01-01"].timestamp &&
        typeof data === "object" &&
        data &&
        typeof data.code === "string"
      ) {
        errorCode = data.code
      } else if (typeof data === "object" && data && typeof data.error_code === "string") {
        errorCode = data.error_code
      }
      if (!errorCode) {
        if (
          typeof data === "object" &&
          data &&
          typeof data.weak_password === "object" &&
          data.weak_password &&
          Array.isArray(data.weak_password.reasons) &&
          data.weak_password.reasons.length &&
          data.weak_password.reasons.reduce((a, i) => a && typeof i === "string", true)
        ) {
          throw new errors_1.AuthWeakPasswordError(
            _getErrorMessage2(data),
            error.status,
            data.weak_password.reasons
          )
        }
      } else if (errorCode === "weak_password") {
        throw new errors_1.AuthWeakPasswordError(
          _getErrorMessage2(data),
          error.status,
          ((_a = data.weak_password) === null || _a === void 0 ? void 0 : _a.reasons) || []
        )
      } else if (errorCode === "session_not_found") {
        throw new errors_1.AuthSessionMissingError()
      }
      throw new errors_1.AuthApiError(_getErrorMessage2(data), error.status || 500, errorCode)
    }
    var _getRequestParams2 = (method, options, parameters, body) => {
      const params = {
        method,
        headers: (options === null || options === void 0 ? void 0 : options.headers) || {},
      }
      if (method === "GET") {
        return params
      }
      params.headers = Object.assign(
        { "Content-Type": "application/json;charset=UTF-8" },
        options === null || options === void 0 ? void 0 : options.headers
      )
      params.body = JSON.stringify(body)
      return Object.assign(Object.assign({}, params), parameters)
    }
    async function _request(fetcher, method, url, options) {
      var _a
      const headers = Object.assign(
        {},
        options === null || options === void 0 ? void 0 : options.headers
      )
      if (!headers[constants_1.API_VERSION_HEADER_NAME]) {
        headers[constants_1.API_VERSION_HEADER_NAME] = constants_1.API_VERSIONS["2024-01-01"].name
      }
      if (options === null || options === void 0 ? void 0 : options.jwt) {
        headers["Authorization"] = `Bearer ${options.jwt}`
      }
      const qs =
        (_a = options === null || options === void 0 ? void 0 : options.query) !== null &&
        _a !== void 0
          ? _a
          : {}
      if (options === null || options === void 0 ? void 0 : options.redirectTo) {
        qs["redirect_to"] = options.redirectTo
      }
      const queryString = Object.keys(qs).length ? "?" + new URLSearchParams(qs).toString() : ""
      const data = await _handleRequest2(
        fetcher,
        method,
        url + queryString,
        {
          headers,
          noResolveJson: options === null || options === void 0 ? void 0 : options.noResolveJson,
        },
        {},
        options === null || options === void 0 ? void 0 : options.body
      )
      return (options === null || options === void 0 ? void 0 : options.xform)
        ? options === null || options === void 0
          ? void 0
          : options.xform(data)
        : { data: Object.assign({}, data), error: null }
    }
    async function _handleRequest2(fetcher, method, url, options, parameters, body) {
      const requestParams = _getRequestParams2(method, options, parameters, body)
      let result
      try {
        result = await fetcher(url, Object.assign({}, requestParams))
      } catch (e) {
        console.error(e)
        throw new errors_1.AuthRetryableFetchError(_getErrorMessage2(e), 0)
      }
      if (!result.ok) {
        await handleError2(result)
      }
      if (options === null || options === void 0 ? void 0 : options.noResolveJson) {
        return result
      }
      try {
        return await result.json()
      } catch (e) {
        await handleError2(e)
      }
    }
    function _sessionResponse(data) {
      var _a
      let session = null
      if (hasSession(data)) {
        session = Object.assign({}, data)
        if (!data.expires_at) {
          session.expires_at = (0, helpers_1.expiresAt)(data.expires_in)
        }
      }
      const user = (_a = data.user) !== null && _a !== void 0 ? _a : data
      return { data: { session, user }, error: null }
    }
    function _sessionResponsePassword(data) {
      const response = _sessionResponse(data)
      if (
        !response.error &&
        data.weak_password &&
        typeof data.weak_password === "object" &&
        Array.isArray(data.weak_password.reasons) &&
        data.weak_password.reasons.length &&
        data.weak_password.message &&
        typeof data.weak_password.message === "string" &&
        data.weak_password.reasons.reduce((a, i) => a && typeof i === "string", true)
      ) {
        response.data.weak_password = data.weak_password
      }
      return response
    }
    function _userResponse(data) {
      var _a
      const user = (_a = data.user) !== null && _a !== void 0 ? _a : data
      return { data: { user }, error: null }
    }
    function _ssoResponse(data) {
      return { data, error: null }
    }
    function _generateLinkResponse(data) {
      const { action_link, email_otp, hashed_token, redirect_to, verification_type } = data,
        rest = tslib_1.__rest(data, [
          "action_link",
          "email_otp",
          "hashed_token",
          "redirect_to",
          "verification_type",
        ])
      const properties = {
        action_link,
        email_otp,
        hashed_token,
        redirect_to,
        verification_type,
      }
      const user = Object.assign({}, rest)
      return {
        data: {
          properties,
          user,
        },
        error: null,
      }
    }
    function _noResolveJsonResponse(data) {
      return data
    }
    function hasSession(data) {
      return data.access_token && data.refresh_token && data.expires_in
    }
  },
})

// node_modules/@supabase/auth-js/dist/main/lib/types.js
var require_types2 = __commonJS({
  "node_modules/@supabase/auth-js/dist/main/lib/types.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.SIGN_OUT_SCOPES = void 0
    exports.SIGN_OUT_SCOPES = ["global", "local", "others"]
  },
})

// node_modules/@supabase/auth-js/dist/main/GoTrueAdminApi.js
var require_GoTrueAdminApi = __commonJS({
  "node_modules/@supabase/auth-js/dist/main/GoTrueAdminApi.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports))
    var fetch_1 = require_fetch()
    var helpers_1 = require_helpers()
    var types_1 = require_types2()
    var errors_1 = require_errors()
    var GoTrueAdminApi = class {
      /**
       * Creates an admin API client that can be used to manage users and OAuth clients.
       *
       * @example
       * ```ts
       * import { GoTrueAdminApi } from '@supabase/auth-js'
       *
       * const admin = new GoTrueAdminApi({
       *   url: 'https://xyzcompany.supabase.co/auth/v1',
       *   headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
       * })
       * ```
       */
      constructor({ url = "", headers = {}, fetch: fetch2 }) {
        this.url = url
        this.headers = headers
        this.fetch = (0, helpers_1.resolveFetch)(fetch2)
        this.mfa = {
          listFactors: this._listFactors.bind(this),
          deleteFactor: this._deleteFactor.bind(this),
        }
        this.oauth = {
          listClients: this._listOAuthClients.bind(this),
          createClient: this._createOAuthClient.bind(this),
          getClient: this._getOAuthClient.bind(this),
          updateClient: this._updateOAuthClient.bind(this),
          deleteClient: this._deleteOAuthClient.bind(this),
          regenerateClientSecret: this._regenerateOAuthClientSecret.bind(this),
        }
      }
      /**
       * Removes a logged-in session.
       * @param jwt A valid, logged-in JWT.
       * @param scope The logout sope.
       */
      async signOut(jwt, scope = types_1.SIGN_OUT_SCOPES[0]) {
        if (types_1.SIGN_OUT_SCOPES.indexOf(scope) < 0) {
          throw new Error(
            `@supabase/auth-js: Parameter scope must be one of ${types_1.SIGN_OUT_SCOPES.join(", ")}`
          )
        }
        try {
          await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/logout?scope=${scope}`, {
            headers: this.headers,
            jwt,
            noResolveJson: true,
          })
          return { data: null, error: null }
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error }
          }
          throw error
        }
      }
      /**
       * Sends an invite link to an email address.
       * @param email The email address of the user.
       * @param options Additional options to be included when inviting.
       */
      async inviteUserByEmail(email, options = {}) {
        try {
          return await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/invite`, {
            body: { email, data: options.data },
            headers: this.headers,
            redirectTo: options.redirectTo,
            xform: fetch_1._userResponse,
          })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: { user: null }, error }
          }
          throw error
        }
      }
      /**
       * Generates email links and OTPs to be sent via a custom email provider.
       * @param email The user's email.
       * @param options.password User password. For signup only.
       * @param options.data Optional user metadata. For signup only.
       * @param options.redirectTo The redirect url which should be appended to the generated link
       */
      async generateLink(params) {
        try {
          const { options } = params,
            rest = tslib_1.__rest(params, ["options"])
          const body = Object.assign(Object.assign({}, rest), options)
          if ("newEmail" in rest) {
            body.new_email = rest === null || rest === void 0 ? void 0 : rest.newEmail
            delete body["newEmail"]
          }
          return await (0, fetch_1._request)(
            this.fetch,
            "POST",
            `${this.url}/admin/generate_link`,
            {
              body,
              headers: this.headers,
              xform: fetch_1._generateLinkResponse,
              redirectTo: options === null || options === void 0 ? void 0 : options.redirectTo,
            }
          )
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return {
              data: {
                properties: null,
                user: null,
              },
              error,
            }
          }
          throw error
        }
      }
      // User Admin API
      /**
       * Creates a new user.
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async createUser(attributes) {
        try {
          return await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/admin/users`, {
            body: attributes,
            headers: this.headers,
            xform: fetch_1._userResponse,
          })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: { user: null }, error }
          }
          throw error
        }
      }
      /**
       * Get a list of users.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       * @param params An object which supports `page` and `perPage` as numbers, to alter the paginated results.
       */
      async listUsers(params) {
        var _a, _b, _c, _d, _e, _f, _g
        try {
          const pagination = { nextPage: null, lastPage: 0, total: 0 }
          const response = await (0, fetch_1._request)(
            this.fetch,
            "GET",
            `${this.url}/admin/users`,
            {
              headers: this.headers,
              noResolveJson: true,
              query: {
                page:
                  (_b =
                    (_a = params === null || params === void 0 ? void 0 : params.page) === null ||
                    _a === void 0
                      ? void 0
                      : _a.toString()) !== null && _b !== void 0
                    ? _b
                    : "",
                per_page:
                  (_d =
                    (_c = params === null || params === void 0 ? void 0 : params.perPage) ===
                      null || _c === void 0
                      ? void 0
                      : _c.toString()) !== null && _d !== void 0
                    ? _d
                    : "",
              },
              xform: fetch_1._noResolveJsonResponse,
            }
          )
          if (response.error) throw response.error
          const users = await response.json()
          const total =
            (_e = response.headers.get("x-total-count")) !== null && _e !== void 0 ? _e : 0
          const links =
            (_g =
              (_f = response.headers.get("link")) === null || _f === void 0
                ? void 0
                : _f.split(",")) !== null && _g !== void 0
              ? _g
              : []
          if (links.length > 0) {
            links.forEach((link) => {
              const page = parseInt(link.split(";")[0].split("=")[1].substring(0, 1))
              const rel = JSON.parse(link.split(";")[1].split("=")[1])
              pagination[`${rel}Page`] = page
            })
            pagination.total = parseInt(total)
          }
          return { data: Object.assign(Object.assign({}, users), pagination), error: null }
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: { users: [] }, error }
          }
          throw error
        }
      }
      /**
       * Get user by id.
       *
       * @param uid The user's unique identifier
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async getUserById(uid) {
        ;(0, helpers_1.validateUUID)(uid)
        try {
          return await (0, fetch_1._request)(this.fetch, "GET", `${this.url}/admin/users/${uid}`, {
            headers: this.headers,
            xform: fetch_1._userResponse,
          })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: { user: null }, error }
          }
          throw error
        }
      }
      /**
       * Updates the user data.
       *
       * @param attributes The data you want to update.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async updateUserById(uid, attributes) {
        ;(0, helpers_1.validateUUID)(uid)
        try {
          return await (0, fetch_1._request)(this.fetch, "PUT", `${this.url}/admin/users/${uid}`, {
            body: attributes,
            headers: this.headers,
            xform: fetch_1._userResponse,
          })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: { user: null }, error }
          }
          throw error
        }
      }
      /**
       * Delete a user. Requires a `service_role` key.
       *
       * @param id The user id you want to remove.
       * @param shouldSoftDelete If true, then the user will be soft-deleted from the auth schema. Soft deletion allows user identification from the hashed user ID but is not reversible.
       * Defaults to false for backward compatibility.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async deleteUser(id, shouldSoftDelete = false) {
        ;(0, helpers_1.validateUUID)(id)
        try {
          return await (0, fetch_1._request)(
            this.fetch,
            "DELETE",
            `${this.url}/admin/users/${id}`,
            {
              headers: this.headers,
              body: {
                should_soft_delete: shouldSoftDelete,
              },
              xform: fetch_1._userResponse,
            }
          )
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: { user: null }, error }
          }
          throw error
        }
      }
      async _listFactors(params) {
        ;(0, helpers_1.validateUUID)(params.userId)
        try {
          const { data, error } = await (0, fetch_1._request)(
            this.fetch,
            "GET",
            `${this.url}/admin/users/${params.userId}/factors`,
            {
              headers: this.headers,
              xform: (factors) => {
                return { data: { factors }, error: null }
              },
            }
          )
          return { data, error }
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error }
          }
          throw error
        }
      }
      async _deleteFactor(params) {
        ;(0, helpers_1.validateUUID)(params.userId)
        ;(0, helpers_1.validateUUID)(params.id)
        try {
          const data = await (0, fetch_1._request)(
            this.fetch,
            "DELETE",
            `${this.url}/admin/users/${params.userId}/factors/${params.id}`,
            {
              headers: this.headers,
            }
          )
          return { data, error: null }
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error }
          }
          throw error
        }
      }
      /**
       * Lists all OAuth clients with optional pagination.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _listOAuthClients(params) {
        var _a, _b, _c, _d, _e, _f, _g
        try {
          const pagination = { nextPage: null, lastPage: 0, total: 0 }
          const response = await (0, fetch_1._request)(
            this.fetch,
            "GET",
            `${this.url}/admin/oauth/clients`,
            {
              headers: this.headers,
              noResolveJson: true,
              query: {
                page:
                  (_b =
                    (_a = params === null || params === void 0 ? void 0 : params.page) === null ||
                    _a === void 0
                      ? void 0
                      : _a.toString()) !== null && _b !== void 0
                    ? _b
                    : "",
                per_page:
                  (_d =
                    (_c = params === null || params === void 0 ? void 0 : params.perPage) ===
                      null || _c === void 0
                      ? void 0
                      : _c.toString()) !== null && _d !== void 0
                    ? _d
                    : "",
              },
              xform: fetch_1._noResolveJsonResponse,
            }
          )
          if (response.error) throw response.error
          const clients = await response.json()
          const total =
            (_e = response.headers.get("x-total-count")) !== null && _e !== void 0 ? _e : 0
          const links =
            (_g =
              (_f = response.headers.get("link")) === null || _f === void 0
                ? void 0
                : _f.split(",")) !== null && _g !== void 0
              ? _g
              : []
          if (links.length > 0) {
            links.forEach((link) => {
              const page = parseInt(link.split(";")[0].split("=")[1].substring(0, 1))
              const rel = JSON.parse(link.split(";")[1].split("=")[1])
              pagination[`${rel}Page`] = page
            })
            pagination.total = parseInt(total)
          }
          return { data: Object.assign(Object.assign({}, clients), pagination), error: null }
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: { clients: [] }, error }
          }
          throw error
        }
      }
      /**
       * Creates a new OAuth client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _createOAuthClient(params) {
        try {
          return await (0, fetch_1._request)(
            this.fetch,
            "POST",
            `${this.url}/admin/oauth/clients`,
            {
              body: params,
              headers: this.headers,
              xform: (client) => {
                return { data: client, error: null }
              },
            }
          )
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error }
          }
          throw error
        }
      }
      /**
       * Gets details of a specific OAuth client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _getOAuthClient(clientId) {
        try {
          return await (0, fetch_1._request)(
            this.fetch,
            "GET",
            `${this.url}/admin/oauth/clients/${clientId}`,
            {
              headers: this.headers,
              xform: (client) => {
                return { data: client, error: null }
              },
            }
          )
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error }
          }
          throw error
        }
      }
      /**
       * Updates an existing OAuth client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _updateOAuthClient(clientId, params) {
        try {
          return await (0, fetch_1._request)(
            this.fetch,
            "PUT",
            `${this.url}/admin/oauth/clients/${clientId}`,
            {
              body: params,
              headers: this.headers,
              xform: (client) => {
                return { data: client, error: null }
              },
            }
          )
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error }
          }
          throw error
        }
      }
      /**
       * Deletes an OAuth client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _deleteOAuthClient(clientId) {
        try {
          await (0, fetch_1._request)(
            this.fetch,
            "DELETE",
            `${this.url}/admin/oauth/clients/${clientId}`,
            {
              headers: this.headers,
              noResolveJson: true,
            }
          )
          return { data: null, error: null }
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error }
          }
          throw error
        }
      }
      /**
       * Regenerates the secret for an OAuth client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * This function should only be called on a server. Never expose your `service_role` key in the browser.
       */
      async _regenerateOAuthClientSecret(clientId) {
        try {
          return await (0, fetch_1._request)(
            this.fetch,
            "POST",
            `${this.url}/admin/oauth/clients/${clientId}/regenerate_secret`,
            {
              headers: this.headers,
              xform: (client) => {
                return { data: client, error: null }
              },
            }
          )
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error }
          }
          throw error
        }
      }
    }
    exports.default = GoTrueAdminApi
  },
})

// node_modules/@supabase/auth-js/dist/main/lib/local-storage.js
var require_local_storage = __commonJS({
  "node_modules/@supabase/auth-js/dist/main/lib/local-storage.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.memoryLocalStorageAdapter = memoryLocalStorageAdapter
    function memoryLocalStorageAdapter(store = {}) {
      return {
        getItem: (key) => {
          return store[key] || null
        },
        setItem: (key, value) => {
          store[key] = value
        },
        removeItem: (key) => {
          delete store[key]
        },
      }
    }
  },
})

// node_modules/@supabase/auth-js/dist/main/lib/locks.js
var require_locks = __commonJS({
  "node_modules/@supabase/auth-js/dist/main/lib/locks.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.ProcessLockAcquireTimeoutError =
      exports.NavigatorLockAcquireTimeoutError =
      exports.LockAcquireTimeoutError =
      exports.internals =
        void 0
    exports.navigatorLock = navigatorLock
    exports.processLock = processLock
    var helpers_1 = require_helpers()
    exports.internals = {
      /**
       * @experimental
       */
      debug: !!(
        globalThis &&
        (0, helpers_1.supportsLocalStorage)() &&
        globalThis.localStorage &&
        globalThis.localStorage.getItem("supabase.gotrue-js.locks.debug") === "true"
      ),
    }
    var LockAcquireTimeoutError = class extends Error {
      constructor(message) {
        super(message)
        this.isAcquireTimeout = true
      }
    }
    exports.LockAcquireTimeoutError = LockAcquireTimeoutError
    var NavigatorLockAcquireTimeoutError = class extends LockAcquireTimeoutError {}
    exports.NavigatorLockAcquireTimeoutError = NavigatorLockAcquireTimeoutError
    var ProcessLockAcquireTimeoutError = class extends LockAcquireTimeoutError {}
    exports.ProcessLockAcquireTimeoutError = ProcessLockAcquireTimeoutError
    async function navigatorLock(name, acquireTimeout, fn) {
      if (exports.internals.debug) {
        console.log("@supabase/gotrue-js: navigatorLock: acquire lock", name, acquireTimeout)
      }
      const abortController = new globalThis.AbortController()
      if (acquireTimeout > 0) {
        setTimeout(() => {
          abortController.abort()
          if (exports.internals.debug) {
            console.log("@supabase/gotrue-js: navigatorLock acquire timed out", name)
          }
        }, acquireTimeout)
      }
      return await Promise.resolve().then(() =>
        globalThis.navigator.locks.request(
          name,
          acquireTimeout === 0
            ? {
                mode: "exclusive",
                ifAvailable: true,
              }
            : {
                mode: "exclusive",
                signal: abortController.signal,
              },
          async (lock) => {
            if (lock) {
              if (exports.internals.debug) {
                console.log("@supabase/gotrue-js: navigatorLock: acquired", name, lock.name)
              }
              try {
                return await fn()
              } finally {
                if (exports.internals.debug) {
                  console.log("@supabase/gotrue-js: navigatorLock: released", name, lock.name)
                }
              }
            } else {
              if (acquireTimeout === 0) {
                if (exports.internals.debug) {
                  console.log("@supabase/gotrue-js: navigatorLock: not immediately available", name)
                }
                throw new NavigatorLockAcquireTimeoutError(
                  `Acquiring an exclusive Navigator LockManager lock "${name}" immediately failed`
                )
              } else {
                if (exports.internals.debug) {
                  try {
                    const result = await globalThis.navigator.locks.query()
                    console.log(
                      "@supabase/gotrue-js: Navigator LockManager state",
                      JSON.stringify(result, null, "  ")
                    )
                  } catch (e) {
                    console.warn(
                      "@supabase/gotrue-js: Error when querying Navigator LockManager state",
                      e
                    )
                  }
                }
                console.warn(
                  "@supabase/gotrue-js: Navigator LockManager returned a null lock when using #request without ifAvailable set to true, it appears this browser is not following the LockManager spec https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request"
                )
                return await fn()
              }
            }
          }
        )
      )
    }
    var PROCESS_LOCKS = {}
    async function processLock(name, acquireTimeout, fn) {
      var _a
      const previousOperation =
        (_a = PROCESS_LOCKS[name]) !== null && _a !== void 0 ? _a : Promise.resolve()
      const currentOperation = Promise.race(
        [
          previousOperation.catch(() => {
            return null
          }),
          acquireTimeout >= 0
            ? new Promise((_, reject) => {
                setTimeout(() => {
                  reject(
                    new ProcessLockAcquireTimeoutError(
                      `Acquiring process lock with name "${name}" timed out`
                    )
                  )
                }, acquireTimeout)
              })
            : null,
        ].filter((x) => x)
      )
        .catch((e) => {
          if (e && e.isAcquireTimeout) {
            throw e
          }
          return null
        })
        .then(async () => {
          return await fn()
        })
      PROCESS_LOCKS[name] = currentOperation.catch(async (e) => {
        if (e && e.isAcquireTimeout) {
          await previousOperation
          return null
        }
        throw e
      })
      return await currentOperation
    }
  },
})

// node_modules/@supabase/auth-js/dist/main/lib/polyfills.js
var require_polyfills = __commonJS({
  "node_modules/@supabase/auth-js/dist/main/lib/polyfills.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.polyfillGlobalThis = polyfillGlobalThis
    function polyfillGlobalThis() {
      if (typeof globalThis === "object") return
      try {
        Object.defineProperty(Object.prototype, "__magic__", {
          get: function () {
            return this
          },
          configurable: true,
        })
        __magic__.globalThis = __magic__
        delete Object.prototype.__magic__
      } catch (e) {
        if (typeof self !== "undefined") {
          self.globalThis = self
        }
      }
    }
  },
})

// node_modules/@supabase/auth-js/dist/main/lib/web3/ethereum.js
var require_ethereum = __commonJS({
  "node_modules/@supabase/auth-js/dist/main/lib/web3/ethereum.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.getAddress = getAddress
    exports.fromHex = fromHex
    exports.toHex = toHex
    exports.createSiweMessage = createSiweMessage
    function getAddress(address) {
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new Error(`@supabase/auth-js: Address "${address}" is invalid.`)
      }
      return address.toLowerCase()
    }
    function fromHex(hex) {
      return parseInt(hex, 16)
    }
    function toHex(value) {
      const bytes = new TextEncoder().encode(value)
      const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
      return "0x" + hex
    }
    function createSiweMessage(parameters) {
      var _a
      const {
        chainId,
        domain,
        expirationTime,
        issuedAt = /* @__PURE__ */ new Date(),
        nonce,
        notBefore,
        requestId,
        resources,
        scheme,
        uri,
        version: version3,
      } = parameters
      {
        if (!Number.isInteger(chainId))
          throw new Error(
            `@supabase/auth-js: Invalid SIWE message field "chainId". Chain ID must be a EIP-155 chain ID. Provided value: ${chainId}`
          )
        if (!domain)
          throw new Error(
            `@supabase/auth-js: Invalid SIWE message field "domain". Domain must be provided.`
          )
        if (nonce && nonce.length < 8)
          throw new Error(
            `@supabase/auth-js: Invalid SIWE message field "nonce". Nonce must be at least 8 characters. Provided value: ${nonce}`
          )
        if (!uri)
          throw new Error(
            `@supabase/auth-js: Invalid SIWE message field "uri". URI must be provided.`
          )
        if (version3 !== "1")
          throw new Error(
            `@supabase/auth-js: Invalid SIWE message field "version". Version must be '1'. Provided value: ${version3}`
          )
        if ((_a = parameters.statement) === null || _a === void 0 ? void 0 : _a.includes("\n"))
          throw new Error(
            `@supabase/auth-js: Invalid SIWE message field "statement". Statement must not include '\\n'. Provided value: ${parameters.statement}`
          )
      }
      const address = getAddress(parameters.address)
      const origin = scheme ? `${scheme}://${domain}` : domain
      const statement = parameters.statement
        ? `${parameters.statement}
`
        : ""
      const prefix = `${origin} wants you to sign in with your Ethereum account:
${address}

${statement}`
      let suffix = `URI: ${uri}
Version: ${version3}
Chain ID: ${chainId}${
        nonce
          ? `
Nonce: ${nonce}`
          : ""
      }
Issued At: ${issuedAt.toISOString()}`
      if (expirationTime)
        suffix += `
Expiration Time: ${expirationTime.toISOString()}`
      if (notBefore)
        suffix += `
Not Before: ${notBefore.toISOString()}`
      if (requestId)
        suffix += `
Request ID: ${requestId}`
      if (resources) {
        let content = "\nResources:"
        for (const resource of resources) {
          if (!resource || typeof resource !== "string")
            throw new Error(
              `@supabase/auth-js: Invalid SIWE message field "resources". Every resource must be a valid string. Provided value: ${resource}`
            )
          content += `
- ${resource}`
        }
        suffix += content
      }
      return `${prefix}
${suffix}`
    }
  },
})

// node_modules/@supabase/auth-js/dist/main/lib/webauthn.errors.js
var require_webauthn_errors = __commonJS({
  "node_modules/@supabase/auth-js/dist/main/lib/webauthn.errors.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.WebAuthnUnknownError = exports.WebAuthnError = void 0
    exports.isWebAuthnError = isWebAuthnError
    exports.identifyRegistrationError = identifyRegistrationError
    exports.identifyAuthenticationError = identifyAuthenticationError
    var webauthn_1 = require_webauthn()
    var WebAuthnError = class extends Error {
      constructor({ message, code, cause, name }) {
        var _a
        super(message, { cause })
        this.__isWebAuthnError = true
        this.name =
          (_a =
            name !== null && name !== void 0
              ? name
              : cause instanceof Error
                ? cause.name
                : void 0) !== null && _a !== void 0
            ? _a
            : "Unknown Error"
        this.code = code
      }
    }
    exports.WebAuthnError = WebAuthnError
    var WebAuthnUnknownError = class extends WebAuthnError {
      constructor(message, originalError) {
        super({
          code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
          cause: originalError,
          message,
        })
        this.name = "WebAuthnUnknownError"
        this.originalError = originalError
      }
    }
    exports.WebAuthnUnknownError = WebAuthnUnknownError
    function isWebAuthnError(error) {
      return typeof error === "object" && error !== null && "__isWebAuthnError" in error
    }
    function identifyRegistrationError({ error, options }) {
      var _a, _b, _c
      const { publicKey } = options
      if (!publicKey) {
        throw Error("options was missing required publicKey property")
      }
      if (error.name === "AbortError") {
        if (options.signal instanceof AbortSignal) {
          return new WebAuthnError({
            message: "Registration ceremony was sent an abort signal",
            code: "ERROR_CEREMONY_ABORTED",
            cause: error,
          })
        }
      } else if (error.name === "ConstraintError") {
        if (
          ((_a = publicKey.authenticatorSelection) === null || _a === void 0
            ? void 0
            : _a.requireResidentKey) === true
        ) {
          return new WebAuthnError({
            message:
              "Discoverable credentials were required but no available authenticator supported it",
            code: "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT",
            cause: error,
          })
        } else if (
          // @ts-ignore: `mediation` doesn't yet exist on CredentialCreationOptions but it's possible as of Sept 2024
          options.mediation === "conditional" &&
          ((_b = publicKey.authenticatorSelection) === null || _b === void 0
            ? void 0
            : _b.userVerification) === "required"
        ) {
          return new WebAuthnError({
            message:
              "User verification was required during automatic registration but it could not be performed",
            code: "ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE",
            cause: error,
          })
        } else if (
          ((_c = publicKey.authenticatorSelection) === null || _c === void 0
            ? void 0
            : _c.userVerification) === "required"
        ) {
          return new WebAuthnError({
            message: "User verification was required but no available authenticator supported it",
            code: "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT",
            cause: error,
          })
        }
      } else if (error.name === "InvalidStateError") {
        return new WebAuthnError({
          message: "The authenticator was previously registered",
          code: "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",
          cause: error,
        })
      } else if (error.name === "NotAllowedError") {
        return new WebAuthnError({
          message: error.message,
          code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
          cause: error,
        })
      } else if (error.name === "NotSupportedError") {
        const validPubKeyCredParams = publicKey.pubKeyCredParams.filter(
          (param) => param.type === "public-key"
        )
        if (validPubKeyCredParams.length === 0) {
          return new WebAuthnError({
            message: 'No entry in pubKeyCredParams was of type "public-key"',
            code: "ERROR_MALFORMED_PUBKEYCREDPARAMS",
            cause: error,
          })
        }
        return new WebAuthnError({
          message:
            "No available authenticator supported any of the specified pubKeyCredParams algorithms",
          code: "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG",
          cause: error,
        })
      } else if (error.name === "SecurityError") {
        const effectiveDomain = window.location.hostname
        if (!(0, webauthn_1.isValidDomain)(effectiveDomain)) {
          return new WebAuthnError({
            message: `${window.location.hostname} is an invalid domain`,
            code: "ERROR_INVALID_DOMAIN",
            cause: error,
          })
        } else if (publicKey.rp.id !== effectiveDomain) {
          return new WebAuthnError({
            message: `The RP ID "${publicKey.rp.id}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: error,
          })
        }
      } else if (error.name === "TypeError") {
        if (publicKey.user.id.byteLength < 1 || publicKey.user.id.byteLength > 64) {
          return new WebAuthnError({
            message: "User ID was not between 1 and 64 characters",
            code: "ERROR_INVALID_USER_ID_LENGTH",
            cause: error,
          })
        }
      } else if (error.name === "UnknownError") {
        return new WebAuthnError({
          message:
            "The authenticator was unable to process the specified options, or could not create a new credential",
          code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
          cause: error,
        })
      }
      return new WebAuthnError({
        message: "a Non-Webauthn related error has occurred",
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: error,
      })
    }
    function identifyAuthenticationError({ error, options }) {
      const { publicKey } = options
      if (!publicKey) {
        throw Error("options was missing required publicKey property")
      }
      if (error.name === "AbortError") {
        if (options.signal instanceof AbortSignal) {
          return new WebAuthnError({
            message: "Authentication ceremony was sent an abort signal",
            code: "ERROR_CEREMONY_ABORTED",
            cause: error,
          })
        }
      } else if (error.name === "NotAllowedError") {
        return new WebAuthnError({
          message: error.message,
          code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
          cause: error,
        })
      } else if (error.name === "SecurityError") {
        const effectiveDomain = window.location.hostname
        if (!(0, webauthn_1.isValidDomain)(effectiveDomain)) {
          return new WebAuthnError({
            message: `${window.location.hostname} is an invalid domain`,
            code: "ERROR_INVALID_DOMAIN",
            cause: error,
          })
        } else if (publicKey.rpId !== effectiveDomain) {
          return new WebAuthnError({
            message: `The RP ID "${publicKey.rpId}" is invalid for this domain`,
            code: "ERROR_INVALID_RP_ID",
            cause: error,
          })
        }
      } else if (error.name === "UnknownError") {
        return new WebAuthnError({
          message:
            "The authenticator was unable to process the specified options, or could not create a new assertion signature",
          code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
          cause: error,
        })
      }
      return new WebAuthnError({
        message: "a Non-Webauthn related error has occurred",
        code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
        cause: error,
      })
    }
  },
})

// node_modules/@supabase/auth-js/dist/main/lib/webauthn.js
var require_webauthn = __commonJS({
  "node_modules/@supabase/auth-js/dist/main/lib/webauthn.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.WebAuthnApi =
      exports.DEFAULT_REQUEST_OPTIONS =
      exports.DEFAULT_CREATION_OPTIONS =
      exports.webAuthnAbortService =
      exports.WebAuthnAbortService =
      exports.identifyAuthenticationError =
      exports.identifyRegistrationError =
      exports.isWebAuthnError =
      exports.WebAuthnError =
        void 0
    exports.deserializeCredentialCreationOptions = deserializeCredentialCreationOptions
    exports.deserializeCredentialRequestOptions = deserializeCredentialRequestOptions
    exports.serializeCredentialCreationResponse = serializeCredentialCreationResponse
    exports.serializeCredentialRequestResponse = serializeCredentialRequestResponse
    exports.isValidDomain = isValidDomain
    exports.createCredential = createCredential
    exports.getCredential = getCredential
    exports.mergeCredentialCreationOptions = mergeCredentialCreationOptions
    exports.mergeCredentialRequestOptions = mergeCredentialRequestOptions
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports))
    var base64url_1 = require_base64url()
    var errors_1 = require_errors()
    var helpers_1 = require_helpers()
    var webauthn_errors_1 = require_webauthn_errors()
    Object.defineProperty(exports, "identifyAuthenticationError", {
      enumerable: true,
      get: function () {
        return webauthn_errors_1.identifyAuthenticationError
      },
    })
    Object.defineProperty(exports, "identifyRegistrationError", {
      enumerable: true,
      get: function () {
        return webauthn_errors_1.identifyRegistrationError
      },
    })
    Object.defineProperty(exports, "isWebAuthnError", {
      enumerable: true,
      get: function () {
        return webauthn_errors_1.isWebAuthnError
      },
    })
    Object.defineProperty(exports, "WebAuthnError", {
      enumerable: true,
      get: function () {
        return webauthn_errors_1.WebAuthnError
      },
    })
    var WebAuthnAbortService = class {
      /**
       * Create an abort signal for a new WebAuthn operation.
       * Automatically cancels any existing operation.
       *
       * @returns {AbortSignal} Signal to pass to navigator.credentials.create() or .get()
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal MDN - AbortSignal}
       */
      createNewAbortSignal() {
        if (this.controller) {
          const abortError = new Error("Cancelling existing WebAuthn API call for new one")
          abortError.name = "AbortError"
          this.controller.abort(abortError)
        }
        const newController = new AbortController()
        this.controller = newController
        return newController.signal
      }
      /**
       * Manually cancel the current WebAuthn operation.
       * Useful for cleaning up when user cancels or navigates away.
       *
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort MDN - AbortController.abort}
       */
      cancelCeremony() {
        if (this.controller) {
          const abortError = new Error("Manually cancelling existing WebAuthn API call")
          abortError.name = "AbortError"
          this.controller.abort(abortError)
          this.controller = void 0
        }
      }
    }
    exports.WebAuthnAbortService = WebAuthnAbortService
    exports.webAuthnAbortService = new WebAuthnAbortService()
    function deserializeCredentialCreationOptions(options) {
      if (!options) {
        throw new Error("Credential creation options are required")
      }
      if (
        typeof PublicKeyCredential !== "undefined" &&
        "parseCreationOptionsFromJSON" in PublicKeyCredential &&
        typeof PublicKeyCredential.parseCreationOptionsFromJSON === "function"
      ) {
        return PublicKeyCredential.parseCreationOptionsFromJSON(
          /** we assert the options here as typescript still doesn't know about future webauthn types */
          options
        )
      }
      const { challenge: challengeStr, user: userOpts, excludeCredentials } = options,
        restOptions = tslib_1.__rest(options, ["challenge", "user", "excludeCredentials"])
      const challenge = (0, base64url_1.base64UrlToUint8Array)(challengeStr).buffer
      const user = Object.assign(Object.assign({}, userOpts), {
        id: (0, base64url_1.base64UrlToUint8Array)(userOpts.id).buffer,
      })
      const result = Object.assign(Object.assign({}, restOptions), {
        challenge,
        user,
      })
      if (excludeCredentials && excludeCredentials.length > 0) {
        result.excludeCredentials = new Array(excludeCredentials.length)
        for (let i = 0; i < excludeCredentials.length; i++) {
          const cred = excludeCredentials[i]
          result.excludeCredentials[i] = Object.assign(Object.assign({}, cred), {
            id: (0, base64url_1.base64UrlToUint8Array)(cred.id).buffer,
            type: cred.type || "public-key",
            // Cast transports to handle future transport types like "cable"
            transports: cred.transports,
          })
        }
      }
      return result
    }
    function deserializeCredentialRequestOptions(options) {
      if (!options) {
        throw new Error("Credential request options are required")
      }
      if (
        typeof PublicKeyCredential !== "undefined" &&
        "parseRequestOptionsFromJSON" in PublicKeyCredential &&
        typeof PublicKeyCredential.parseRequestOptionsFromJSON === "function"
      ) {
        return PublicKeyCredential.parseRequestOptionsFromJSON(options)
      }
      const { challenge: challengeStr, allowCredentials } = options,
        restOptions = tslib_1.__rest(options, ["challenge", "allowCredentials"])
      const challenge = (0, base64url_1.base64UrlToUint8Array)(challengeStr).buffer
      const result = Object.assign(Object.assign({}, restOptions), { challenge })
      if (allowCredentials && allowCredentials.length > 0) {
        result.allowCredentials = new Array(allowCredentials.length)
        for (let i = 0; i < allowCredentials.length; i++) {
          const cred = allowCredentials[i]
          result.allowCredentials[i] = Object.assign(Object.assign({}, cred), {
            id: (0, base64url_1.base64UrlToUint8Array)(cred.id).buffer,
            type: cred.type || "public-key",
            // Cast transports to handle future transport types like "cable"
            transports: cred.transports,
          })
        }
      }
      return result
    }
    function serializeCredentialCreationResponse(credential) {
      var _a
      if ("toJSON" in credential && typeof credential.toJSON === "function") {
        return credential.toJSON()
      }
      const credentialWithAttachment = credential
      return {
        id: credential.id,
        rawId: credential.id,
        response: {
          attestationObject: (0, base64url_1.bytesToBase64URL)(
            new Uint8Array(credential.response.attestationObject)
          ),
          clientDataJSON: (0, base64url_1.bytesToBase64URL)(
            new Uint8Array(credential.response.clientDataJSON)
          ),
        },
        type: "public-key",
        clientExtensionResults: credential.getClientExtensionResults(),
        // Convert null to undefined and cast to AuthenticatorAttachment type
        authenticatorAttachment:
          (_a = credentialWithAttachment.authenticatorAttachment) !== null && _a !== void 0
            ? _a
            : void 0,
      }
    }
    function serializeCredentialRequestResponse(credential) {
      var _a
      if ("toJSON" in credential && typeof credential.toJSON === "function") {
        return credential.toJSON()
      }
      const credentialWithAttachment = credential
      const clientExtensionResults = credential.getClientExtensionResults()
      const assertionResponse = credential.response
      return {
        id: credential.id,
        rawId: credential.id,
        // W3C spec expects rawId to match id for JSON format
        response: {
          authenticatorData: (0, base64url_1.bytesToBase64URL)(
            new Uint8Array(assertionResponse.authenticatorData)
          ),
          clientDataJSON: (0, base64url_1.bytesToBase64URL)(
            new Uint8Array(assertionResponse.clientDataJSON)
          ),
          signature: (0, base64url_1.bytesToBase64URL)(new Uint8Array(assertionResponse.signature)),
          userHandle: assertionResponse.userHandle
            ? (0, base64url_1.bytesToBase64URL)(new Uint8Array(assertionResponse.userHandle))
            : void 0,
        },
        type: "public-key",
        clientExtensionResults,
        // Convert null to undefined and cast to AuthenticatorAttachment type
        authenticatorAttachment:
          (_a = credentialWithAttachment.authenticatorAttachment) !== null && _a !== void 0
            ? _a
            : void 0,
      }
    }
    function isValidDomain(hostname) {
      return (
        // Consider localhost valid as well since it's okay wrt Secure Contexts
        hostname === "localhost" || /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(hostname)
      )
    }
    function browserSupportsWebAuthn() {
      var _a, _b
      return !!(
        (0, helpers_1.isBrowser)() &&
        "PublicKeyCredential" in window &&
        window.PublicKeyCredential &&
        "credentials" in navigator &&
        typeof ((_a =
          navigator === null || navigator === void 0 ? void 0 : navigator.credentials) === null ||
        _a === void 0
          ? void 0
          : _a.create) === "function" &&
        typeof ((_b =
          navigator === null || navigator === void 0 ? void 0 : navigator.credentials) === null ||
        _b === void 0
          ? void 0
          : _b.get) === "function"
      )
    }
    async function createCredential(options) {
      try {
        const response = await navigator.credentials.create(
          /** we assert the type here until typescript types are updated */
          options
        )
        if (!response) {
          return {
            data: null,
            error: new webauthn_errors_1.WebAuthnUnknownError(
              "Empty credential response",
              response
            ),
          }
        }
        if (!(response instanceof PublicKeyCredential)) {
          return {
            data: null,
            error: new webauthn_errors_1.WebAuthnUnknownError(
              "Browser returned unexpected credential type",
              response
            ),
          }
        }
        return { data: response, error: null }
      } catch (err) {
        return {
          data: null,
          error: (0, webauthn_errors_1.identifyRegistrationError)({
            error: err,
            options,
          }),
        }
      }
    }
    async function getCredential(options) {
      try {
        const response = await navigator.credentials.get(
          /** we assert the type here until typescript types are updated */
          options
        )
        if (!response) {
          return {
            data: null,
            error: new webauthn_errors_1.WebAuthnUnknownError(
              "Empty credential response",
              response
            ),
          }
        }
        if (!(response instanceof PublicKeyCredential)) {
          return {
            data: null,
            error: new webauthn_errors_1.WebAuthnUnknownError(
              "Browser returned unexpected credential type",
              response
            ),
          }
        }
        return { data: response, error: null }
      } catch (err) {
        return {
          data: null,
          error: (0, webauthn_errors_1.identifyAuthenticationError)({
            error: err,
            options,
          }),
        }
      }
    }
    exports.DEFAULT_CREATION_OPTIONS = {
      hints: ["security-key"],
      authenticatorSelection: {
        authenticatorAttachment: "cross-platform",
        requireResidentKey: false,
        /** set to preferred because older yubikeys don't have PIN/Biometric */
        userVerification: "preferred",
        residentKey: "discouraged",
      },
      attestation: "direct",
    }
    exports.DEFAULT_REQUEST_OPTIONS = {
      /** set to preferred because older yubikeys don't have PIN/Biometric */
      userVerification: "preferred",
      hints: ["security-key"],
      attestation: "direct",
    }
    function deepMerge(...sources) {
      const isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val)
      const isArrayBufferLike = (val) => val instanceof ArrayBuffer || ArrayBuffer.isView(val)
      const result = {}
      for (const source of sources) {
        if (!source) continue
        for (const key in source) {
          const value = source[key]
          if (value === void 0) continue
          if (Array.isArray(value)) {
            result[key] = value
          } else if (isArrayBufferLike(value)) {
            result[key] = value
          } else if (isObject(value)) {
            const existing = result[key]
            if (isObject(existing)) {
              result[key] = deepMerge(existing, value)
            } else {
              result[key] = deepMerge(value)
            }
          } else {
            result[key] = value
          }
        }
      }
      return result
    }
    function mergeCredentialCreationOptions(baseOptions, overrides) {
      return deepMerge(exports.DEFAULT_CREATION_OPTIONS, baseOptions, overrides || {})
    }
    function mergeCredentialRequestOptions(baseOptions, overrides) {
      return deepMerge(exports.DEFAULT_REQUEST_OPTIONS, baseOptions, overrides || {})
    }
    var WebAuthnApi = class {
      constructor(client) {
        this.client = client
        this.enroll = this._enroll.bind(this)
        this.challenge = this._challenge.bind(this)
        this.verify = this._verify.bind(this)
        this.authenticate = this._authenticate.bind(this)
        this.register = this._register.bind(this)
      }
      /**
       * Enroll a new WebAuthn factor.
       * Creates an unverified WebAuthn factor that must be verified with a credential.
       *
       * @experimental This method is experimental and may change in future releases
       * @param {Omit<MFAEnrollWebauthnParams, 'factorType'>} params - Enrollment parameters (friendlyName required)
       * @returns {Promise<AuthMFAEnrollWebauthnResponse>} Enrolled factor details or error
       * @see {@link https://w3c.github.io/webauthn/#sctn-registering-a-new-credential W3C WebAuthn Spec - Registering a New Credential}
       */
      async _enroll(params) {
        return this.client.mfa.enroll(
          Object.assign(Object.assign({}, params), { factorType: "webauthn" })
        )
      }
      /**
       * Challenge for WebAuthn credential creation or authentication.
       * Combines server challenge with browser credential operations.
       * Handles both registration (create) and authentication (request) flows.
       *
       * @experimental This method is experimental and may change in future releases
       * @param {MFAChallengeWebauthnParams & { friendlyName?: string; signal?: AbortSignal }} params - Challenge parameters including factorId
       * @param {Object} overrides - Allows you to override the parameters passed to navigator.credentials
       * @param {PublicKeyCredentialCreationOptionsFuture} overrides.create - Override options for credential creation
       * @param {PublicKeyCredentialRequestOptionsFuture} overrides.request - Override options for credential request
       * @returns {Promise<RequestResult>} Challenge response with credential or error
       * @see {@link https://w3c.github.io/webauthn/#sctn-credential-creation W3C WebAuthn Spec - Credential Creation}
       * @see {@link https://w3c.github.io/webauthn/#sctn-verifying-assertion W3C WebAuthn Spec - Verifying Assertion}
       */
      async _challenge({ factorId, webauthn, friendlyName, signal }, overrides) {
        try {
          const { data: challengeResponse, error: challengeError } =
            await this.client.mfa.challenge({
              factorId,
              webauthn,
            })
          if (!challengeResponse) {
            return { data: null, error: challengeError }
          }
          const abortSignal =
            signal !== null && signal !== void 0
              ? signal
              : exports.webAuthnAbortService.createNewAbortSignal()
          if (challengeResponse.webauthn.type === "create") {
            const { user } = challengeResponse.webauthn.credential_options.publicKey
            if (!user.name) {
              user.name = `${user.id}:${friendlyName}`
            }
            if (!user.displayName) {
              user.displayName = user.name
            }
          }
          switch (challengeResponse.webauthn.type) {
            case "create": {
              const options = mergeCredentialCreationOptions(
                challengeResponse.webauthn.credential_options.publicKey,
                overrides === null || overrides === void 0 ? void 0 : overrides.create
              )
              const { data, error } = await createCredential({
                publicKey: options,
                signal: abortSignal,
              })
              if (data) {
                return {
                  data: {
                    factorId,
                    challengeId: challengeResponse.id,
                    webauthn: {
                      type: challengeResponse.webauthn.type,
                      credential_response: data,
                    },
                  },
                  error: null,
                }
              }
              return { data: null, error }
            }
            case "request": {
              const options = mergeCredentialRequestOptions(
                challengeResponse.webauthn.credential_options.publicKey,
                overrides === null || overrides === void 0 ? void 0 : overrides.request
              )
              const { data, error } = await getCredential(
                Object.assign(Object.assign({}, challengeResponse.webauthn.credential_options), {
                  publicKey: options,
                  signal: abortSignal,
                })
              )
              if (data) {
                return {
                  data: {
                    factorId,
                    challengeId: challengeResponse.id,
                    webauthn: {
                      type: challengeResponse.webauthn.type,
                      credential_response: data,
                    },
                  },
                  error: null,
                }
              }
              return { data: null, error }
            }
          }
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error }
          }
          return {
            data: null,
            error: new errors_1.AuthUnknownError("Unexpected error in challenge", error),
          }
        }
      }
      /**
       * Verify a WebAuthn credential with the server.
       * Completes the WebAuthn ceremony by sending the credential to the server for verification.
       *
       * @experimental This method is experimental and may change in future releases
       * @param {Object} params - Verification parameters
       * @param {string} params.challengeId - ID of the challenge being verified
       * @param {string} params.factorId - ID of the WebAuthn factor
       * @param {MFAVerifyWebauthnParams<T>['webauthn']} params.webauthn - WebAuthn credential response
       * @returns {Promise<AuthMFAVerifyResponse>} Verification result with session or error
       * @see {@link https://w3c.github.io/webauthn/#sctn-verifying-assertion W3C WebAuthn Spec - Verifying an Authentication Assertion}
       * */
      async _verify({ challengeId, factorId, webauthn }) {
        return this.client.mfa.verify({
          factorId,
          challengeId,
          webauthn,
        })
      }
      /**
       * Complete WebAuthn authentication flow.
       * Performs challenge and verification in a single operation for existing credentials.
       *
       * @experimental This method is experimental and may change in future releases
       * @param {Object} params - Authentication parameters
       * @param {string} params.factorId - ID of the WebAuthn factor to authenticate with
       * @param {Object} params.webauthn - WebAuthn configuration
       * @param {string} params.webauthn.rpId - Relying Party ID (defaults to current hostname)
       * @param {string[]} params.webauthn.rpOrigins - Allowed origins (defaults to current origin)
       * @param {AbortSignal} params.webauthn.signal - Optional abort signal
       * @param {PublicKeyCredentialRequestOptionsFuture} overrides - Override options for navigator.credentials.get
       * @returns {Promise<RequestResult<AuthMFAVerifyResponseData, WebAuthnError | AuthError>>} Authentication result
       * @see {@link https://w3c.github.io/webauthn/#sctn-authentication W3C WebAuthn Spec - Authentication Ceremony}
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialRequestOptions MDN - PublicKeyCredentialRequestOptions}
       */
      async _authenticate(
        {
          factorId,
          webauthn: {
            rpId = typeof window !== "undefined" ? window.location.hostname : void 0,
            rpOrigins = typeof window !== "undefined" ? [window.location.origin] : void 0,
            signal,
          } = {},
        },
        overrides
      ) {
        if (!rpId) {
          return {
            data: null,
            error: new errors_1.AuthError("rpId is required for WebAuthn authentication"),
          }
        }
        try {
          if (!browserSupportsWebAuthn()) {
            return {
              data: null,
              error: new errors_1.AuthUnknownError("Browser does not support WebAuthn", null),
            }
          }
          const { data: challengeResponse, error: challengeError } = await this.challenge(
            {
              factorId,
              webauthn: { rpId, rpOrigins },
              signal,
            },
            { request: overrides }
          )
          if (!challengeResponse) {
            return { data: null, error: challengeError }
          }
          const { webauthn } = challengeResponse
          return this._verify({
            factorId,
            challengeId: challengeResponse.challengeId,
            webauthn: {
              type: webauthn.type,
              rpId,
              rpOrigins,
              credential_response: webauthn.credential_response,
            },
          })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error }
          }
          return {
            data: null,
            error: new errors_1.AuthUnknownError("Unexpected error in authenticate", error),
          }
        }
      }
      /**
       * Complete WebAuthn registration flow.
       * Performs enrollment, challenge, and verification in a single operation for new credentials.
       *
       * @experimental This method is experimental and may change in future releases
       * @param {Object} params - Registration parameters
       * @param {string} params.friendlyName - User-friendly name for the credential
       * @param {string} params.rpId - Relying Party ID (defaults to current hostname)
       * @param {string[]} params.rpOrigins - Allowed origins (defaults to current origin)
       * @param {AbortSignal} params.signal - Optional abort signal
       * @param {PublicKeyCredentialCreationOptionsFuture} overrides - Override options for navigator.credentials.create
       * @returns {Promise<RequestResult<AuthMFAVerifyResponseData, WebAuthnError | AuthError>>} Registration result
       * @see {@link https://w3c.github.io/webauthn/#sctn-registering-a-new-credential W3C WebAuthn Spec - Registration Ceremony}
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialCreationOptions MDN - PublicKeyCredentialCreationOptions}
       */
      async _register(
        {
          friendlyName,
          webauthn: {
            rpId = typeof window !== "undefined" ? window.location.hostname : void 0,
            rpOrigins = typeof window !== "undefined" ? [window.location.origin] : void 0,
            signal,
          } = {},
        },
        overrides
      ) {
        if (!rpId) {
          return {
            data: null,
            error: new errors_1.AuthError("rpId is required for WebAuthn registration"),
          }
        }
        try {
          if (!browserSupportsWebAuthn()) {
            return {
              data: null,
              error: new errors_1.AuthUnknownError("Browser does not support WebAuthn", null),
            }
          }
          const { data: factor, error: enrollError } = await this._enroll({
            friendlyName,
          })
          if (!factor) {
            await this.client.mfa
              .listFactors()
              .then((factors) => {
                var _a
                return (_a = factors.data) === null || _a === void 0
                  ? void 0
                  : _a.all.find(
                      (v) =>
                        v.factor_type === "webauthn" &&
                        v.friendly_name === friendlyName &&
                        v.status !== "unverified"
                    )
              })
              .then((factor2) =>
                factor2
                  ? this.client.mfa.unenroll({
                      factorId: factor2 === null || factor2 === void 0 ? void 0 : factor2.id,
                    })
                  : void 0
              )
            return { data: null, error: enrollError }
          }
          const { data: challengeResponse, error: challengeError } = await this._challenge(
            {
              factorId: factor.id,
              friendlyName: factor.friendly_name,
              webauthn: { rpId, rpOrigins },
              signal,
            },
            {
              create: overrides,
            }
          )
          if (!challengeResponse) {
            return { data: null, error: challengeError }
          }
          return this._verify({
            factorId: factor.id,
            challengeId: challengeResponse.challengeId,
            webauthn: {
              rpId,
              rpOrigins,
              type: challengeResponse.webauthn.type,
              credential_response: challengeResponse.webauthn.credential_response,
            },
          })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return { data: null, error }
          }
          return {
            data: null,
            error: new errors_1.AuthUnknownError("Unexpected error in register", error),
          }
        }
      }
    }
    exports.WebAuthnApi = WebAuthnApi
  },
})

// node_modules/@supabase/auth-js/dist/main/GoTrueClient.js
var require_GoTrueClient = __commonJS({
  "node_modules/@supabase/auth-js/dist/main/GoTrueClient.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports))
    var GoTrueAdminApi_1 = tslib_1.__importDefault(require_GoTrueAdminApi())
    var constants_1 = require_constants2()
    var errors_1 = require_errors()
    var fetch_1 = require_fetch()
    var helpers_1 = require_helpers()
    var local_storage_1 = require_local_storage()
    var locks_1 = require_locks()
    var polyfills_1 = require_polyfills()
    var version_1 = require_version2()
    var base64url_1 = require_base64url()
    var ethereum_1 = require_ethereum()
    var webauthn_1 = require_webauthn()
    ;(0, polyfills_1.polyfillGlobalThis)()
    var DEFAULT_OPTIONS = {
      url: constants_1.GOTRUE_URL,
      storageKey: constants_1.STORAGE_KEY,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      headers: constants_1.DEFAULT_HEADERS,
      flowType: "implicit",
      debug: false,
      hasCustomAuthorizationHeader: false,
      throwOnError: false,
    }
    async function lockNoOp(name, acquireTimeout, fn) {
      return await fn()
    }
    var GLOBAL_JWKS = {}
    var GoTrueClient = class _GoTrueClient {
      /**
       * The JWKS used for verifying asymmetric JWTs
       */
      get jwks() {
        var _a, _b
        return (_b =
          (_a = GLOBAL_JWKS[this.storageKey]) === null || _a === void 0 ? void 0 : _a.jwks) !==
          null && _b !== void 0
          ? _b
          : { keys: [] }
      }
      set jwks(value) {
        GLOBAL_JWKS[this.storageKey] = Object.assign(
          Object.assign({}, GLOBAL_JWKS[this.storageKey]),
          { jwks: value }
        )
      }
      get jwks_cached_at() {
        var _a, _b
        return (_b =
          (_a = GLOBAL_JWKS[this.storageKey]) === null || _a === void 0 ? void 0 : _a.cachedAt) !==
          null && _b !== void 0
          ? _b
          : Number.MIN_SAFE_INTEGER
      }
      set jwks_cached_at(value) {
        GLOBAL_JWKS[this.storageKey] = Object.assign(
          Object.assign({}, GLOBAL_JWKS[this.storageKey]),
          { cachedAt: value }
        )
      }
      /**
       * Create a new client for use in the browser.
       *
       * @example
       * ```ts
       * import { GoTrueClient } from '@supabase/auth-js'
       *
       * const auth = new GoTrueClient({
       *   url: 'https://xyzcompany.supabase.co/auth/v1',
       *   headers: { apikey: 'public-anon-key' },
       *   storageKey: 'supabase-auth',
       * })
       * ```
       */
      constructor(options) {
        var _a, _b, _c
        this.userStorage = null
        this.memoryStorage = null
        this.stateChangeEmitters = /* @__PURE__ */ new Map()
        this.autoRefreshTicker = null
        this.visibilityChangedCallback = null
        this.refreshingDeferred = null
        this.initializePromise = null
        this.detectSessionInUrl = true
        this.hasCustomAuthorizationHeader = false
        this.suppressGetSessionWarning = false
        this.lockAcquired = false
        this.pendingInLock = []
        this.broadcastChannel = null
        this.logger = console.log
        const settings = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options)
        this.storageKey = settings.storageKey
        this.instanceID =
          (_a = _GoTrueClient.nextInstanceID[this.storageKey]) !== null && _a !== void 0 ? _a : 0
        _GoTrueClient.nextInstanceID[this.storageKey] = this.instanceID + 1
        this.logDebugMessages = !!settings.debug
        if (typeof settings.debug === "function") {
          this.logger = settings.debug
        }
        if (this.instanceID > 0 && (0, helpers_1.isBrowser)()) {
          const message = `${this._logPrefix()} Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.`
          console.warn(message)
          if (this.logDebugMessages) {
            console.trace(message)
          }
        }
        this.persistSession = settings.persistSession
        this.autoRefreshToken = settings.autoRefreshToken
        this.admin = new GoTrueAdminApi_1.default({
          url: settings.url,
          headers: settings.headers,
          fetch: settings.fetch,
        })
        this.url = settings.url
        this.headers = settings.headers
        this.fetch = (0, helpers_1.resolveFetch)(settings.fetch)
        this.lock = settings.lock || lockNoOp
        this.detectSessionInUrl = settings.detectSessionInUrl
        this.flowType = settings.flowType
        this.hasCustomAuthorizationHeader = settings.hasCustomAuthorizationHeader
        this.throwOnError = settings.throwOnError
        if (settings.lock) {
          this.lock = settings.lock
        } else if (
          this.persistSession &&
          (0, helpers_1.isBrowser)() &&
          ((_b = globalThis === null || globalThis === void 0 ? void 0 : globalThis.navigator) ===
            null || _b === void 0
            ? void 0
            : _b.locks)
        ) {
          this.lock = locks_1.navigatorLock
        } else {
          this.lock = lockNoOp
        }
        if (!this.jwks) {
          this.jwks = { keys: [] }
          this.jwks_cached_at = Number.MIN_SAFE_INTEGER
        }
        this.mfa = {
          verify: this._verify.bind(this),
          enroll: this._enroll.bind(this),
          unenroll: this._unenroll.bind(this),
          challenge: this._challenge.bind(this),
          listFactors: this._listFactors.bind(this),
          challengeAndVerify: this._challengeAndVerify.bind(this),
          getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this),
          webauthn: new webauthn_1.WebAuthnApi(this),
        }
        this.oauth = {
          getAuthorizationDetails: this._getAuthorizationDetails.bind(this),
          approveAuthorization: this._approveAuthorization.bind(this),
          denyAuthorization: this._denyAuthorization.bind(this),
          listGrants: this._listOAuthGrants.bind(this),
          revokeGrant: this._revokeOAuthGrant.bind(this),
        }
        if (this.persistSession) {
          if (settings.storage) {
            this.storage = settings.storage
          } else {
            if ((0, helpers_1.supportsLocalStorage)()) {
              this.storage = globalThis.localStorage
            } else {
              this.memoryStorage = {}
              this.storage = (0, local_storage_1.memoryLocalStorageAdapter)(this.memoryStorage)
            }
          }
          if (settings.userStorage) {
            this.userStorage = settings.userStorage
          }
        } else {
          this.memoryStorage = {}
          this.storage = (0, local_storage_1.memoryLocalStorageAdapter)(this.memoryStorage)
        }
        if (
          (0, helpers_1.isBrowser)() &&
          globalThis.BroadcastChannel &&
          this.persistSession &&
          this.storageKey
        ) {
          try {
            this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey)
          } catch (e) {
            console.error(
              "Failed to create a new BroadcastChannel, multi-tab state changes will not be available",
              e
            )
          }
          ;(_c = this.broadcastChannel) === null || _c === void 0
            ? void 0
            : _c.addEventListener("message", async (event) => {
                this._debug("received broadcast notification from other tab or client", event)
                await this._notifyAllSubscribers(event.data.event, event.data.session, false)
              })
        }
        this.initialize()
      }
      /**
       * Returns whether error throwing mode is enabled for this client.
       */
      isThrowOnErrorEnabled() {
        return this.throwOnError
      }
      /**
       * Centralizes return handling with optional error throwing. When `throwOnError` is enabled
       * and the provided result contains a non-nullish error, the error is thrown instead of
       * being returned. This ensures consistent behavior across all public API methods.
       */
      _returnResult(result) {
        if (this.throwOnError && result && result.error) {
          throw result.error
        }
        return result
      }
      _logPrefix() {
        return `GoTrueClient@${this.storageKey}:${this.instanceID} (${version_1.version}) ${/* @__PURE__ */ new Date().toISOString()}`
      }
      _debug(...args) {
        if (this.logDebugMessages) {
          this.logger(this._logPrefix(), ...args)
        }
        return this
      }
      /**
       * Initializes the client session either from the url or from storage.
       * This method is automatically called when instantiating the client, but should also be called
       * manually when checking for an error from an auth redirect (oauth, magiclink, password recovery, etc).
       */
      async initialize() {
        if (this.initializePromise) {
          return await this.initializePromise
        }
        this.initializePromise = (async () => {
          return await this._acquireLock(-1, async () => {
            return await this._initialize()
          })
        })()
        return await this.initializePromise
      }
      /**
       * IMPORTANT:
       * 1. Never throw in this method, as it is called from the constructor
       * 2. Never return a session from this method as it would be cached over
       *    the whole lifetime of the client
       */
      async _initialize() {
        var _a
        try {
          let params = {}
          let callbackUrlType = "none"
          if ((0, helpers_1.isBrowser)()) {
            params = (0, helpers_1.parseParametersFromURL)(window.location.href)
            if (this._isImplicitGrantCallback(params)) {
              callbackUrlType = "implicit"
            } else if (await this._isPKCECallback(params)) {
              callbackUrlType = "pkce"
            }
          }
          if ((0, helpers_1.isBrowser)() && this.detectSessionInUrl && callbackUrlType !== "none") {
            const { data, error } = await this._getSessionFromURL(params, callbackUrlType)
            if (error) {
              this._debug("#_initialize()", "error detecting session from URL", error)
              if ((0, errors_1.isAuthImplicitGrantRedirectError)(error)) {
                const errorCode = (_a = error.details) === null || _a === void 0 ? void 0 : _a.code
                if (
                  errorCode === "identity_already_exists" ||
                  errorCode === "identity_not_found" ||
                  errorCode === "single_identity_not_deletable"
                ) {
                  return { error }
                }
              }
              await this._removeSession()
              return { error }
            }
            const { session, redirectType } = data
            this._debug(
              "#_initialize()",
              "detected session in URL",
              session,
              "redirect type",
              redirectType
            )
            await this._saveSession(session)
            setTimeout(async () => {
              if (redirectType === "recovery") {
                await this._notifyAllSubscribers("PASSWORD_RECOVERY", session)
              } else {
                await this._notifyAllSubscribers("SIGNED_IN", session)
              }
            }, 0)
            return { error: null }
          }
          await this._recoverAndRefresh()
          return { error: null }
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ error })
          }
          return this._returnResult({
            error: new errors_1.AuthUnknownError("Unexpected error during initialization", error),
          })
        } finally {
          await this._handleVisibilityChange()
          this._debug("#_initialize()", "end")
        }
      }
      /**
       * Creates a new anonymous user.
       *
       * @returns A session where the is_anonymous claim in the access token JWT set to true
       */
      async signInAnonymously(credentials) {
        var _a, _b, _c
        try {
          const res = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/signup`, {
            headers: this.headers,
            body: {
              data:
                (_b =
                  (_a =
                    credentials === null || credentials === void 0
                      ? void 0
                      : credentials.options) === null || _a === void 0
                    ? void 0
                    : _a.data) !== null && _b !== void 0
                  ? _b
                  : {},
              gotrue_meta_security: {
                captcha_token:
                  (_c =
                    credentials === null || credentials === void 0
                      ? void 0
                      : credentials.options) === null || _c === void 0
                    ? void 0
                    : _c.captchaToken,
              },
            },
            xform: fetch_1._sessionResponse,
          })
          const { data, error } = res
          if (error || !data) {
            return this._returnResult({ data: { user: null, session: null }, error })
          }
          const session = data.session
          const user = data.user
          if (data.session) {
            await this._saveSession(data.session)
            await this._notifyAllSubscribers("SIGNED_IN", session)
          }
          return this._returnResult({ data: { user, session }, error: null })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error })
          }
          throw error
        }
      }
      /**
       * Creates a new user.
       *
       * Be aware that if a user account exists in the system you may get back an
       * error message that attempts to hide this information from the user.
       * This method has support for PKCE via email signups. The PKCE flow cannot be used when autoconfirm is enabled.
       *
       * @returns A logged-in session if the server has "autoconfirm" ON
       * @returns A user if the server has "autoconfirm" OFF
       */
      async signUp(credentials) {
        var _a, _b, _c
        try {
          let res
          if ("email" in credentials) {
            const { email, password, options } = credentials
            let codeChallenge = null
            let codeChallengeMethod = null
            if (this.flowType === "pkce") {
              ;[codeChallenge, codeChallengeMethod] = await (0,
              helpers_1.getCodeChallengeAndMethod)(this.storage, this.storageKey)
            }
            res = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/signup`, {
              headers: this.headers,
              redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
              body: {
                email,
                password,
                data:
                  (_a = options === null || options === void 0 ? void 0 : options.data) !== null &&
                  _a !== void 0
                    ? _a
                    : {},
                gotrue_meta_security: {
                  captcha_token:
                    options === null || options === void 0 ? void 0 : options.captchaToken,
                },
                code_challenge: codeChallenge,
                code_challenge_method: codeChallengeMethod,
              },
              xform: fetch_1._sessionResponse,
            })
          } else if ("phone" in credentials) {
            const { phone, password, options } = credentials
            res = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/signup`, {
              headers: this.headers,
              body: {
                phone,
                password,
                data:
                  (_b = options === null || options === void 0 ? void 0 : options.data) !== null &&
                  _b !== void 0
                    ? _b
                    : {},
                channel:
                  (_c = options === null || options === void 0 ? void 0 : options.channel) !==
                    null && _c !== void 0
                    ? _c
                    : "sms",
                gotrue_meta_security: {
                  captcha_token:
                    options === null || options === void 0 ? void 0 : options.captchaToken,
                },
              },
              xform: fetch_1._sessionResponse,
            })
          } else {
            throw new errors_1.AuthInvalidCredentialsError(
              "You must provide either an email or phone number and a password"
            )
          }
          const { data, error } = res
          if (error || !data) {
            await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`)
            return this._returnResult({ data: { user: null, session: null }, error })
          }
          const session = data.session
          const user = data.user
          if (data.session) {
            await this._saveSession(data.session)
            await this._notifyAllSubscribers("SIGNED_IN", session)
          }
          return this._returnResult({ data: { user, session }, error: null })
        } catch (error) {
          await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`)
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error })
          }
          throw error
        }
      }
      /**
       * Log in an existing user with an email and password or phone and password.
       *
       * Be aware that you may get back an error message that will not distinguish
       * between the cases where the account does not exist or that the
       * email/phone and password combination is wrong or that the account can only
       * be accessed via social login.
       */
      async signInWithPassword(credentials) {
        try {
          let res
          if ("email" in credentials) {
            const { email, password, options } = credentials
            res = await (0, fetch_1._request)(
              this.fetch,
              "POST",
              `${this.url}/token?grant_type=password`,
              {
                headers: this.headers,
                body: {
                  email,
                  password,
                  gotrue_meta_security: {
                    captcha_token:
                      options === null || options === void 0 ? void 0 : options.captchaToken,
                  },
                },
                xform: fetch_1._sessionResponsePassword,
              }
            )
          } else if ("phone" in credentials) {
            const { phone, password, options } = credentials
            res = await (0, fetch_1._request)(
              this.fetch,
              "POST",
              `${this.url}/token?grant_type=password`,
              {
                headers: this.headers,
                body: {
                  phone,
                  password,
                  gotrue_meta_security: {
                    captcha_token:
                      options === null || options === void 0 ? void 0 : options.captchaToken,
                  },
                },
                xform: fetch_1._sessionResponsePassword,
              }
            )
          } else {
            throw new errors_1.AuthInvalidCredentialsError(
              "You must provide either an email or phone number and a password"
            )
          }
          const { data, error } = res
          if (error) {
            return this._returnResult({ data: { user: null, session: null }, error })
          } else if (!data || !data.session || !data.user) {
            const invalidTokenError = new errors_1.AuthInvalidTokenResponseError()
            return this._returnResult({
              data: { user: null, session: null },
              error: invalidTokenError,
            })
          }
          if (data.session) {
            await this._saveSession(data.session)
            await this._notifyAllSubscribers("SIGNED_IN", data.session)
          }
          return this._returnResult({
            data: Object.assign(
              { user: data.user, session: data.session },
              data.weak_password ? { weakPassword: data.weak_password } : null
            ),
            error,
          })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error })
          }
          throw error
        }
      }
      /**
       * Log in an existing user via a third-party provider.
       * This method supports the PKCE flow.
       */
      async signInWithOAuth(credentials) {
        var _a, _b, _c, _d
        return await this._handleProviderSignIn(credentials.provider, {
          redirectTo: (_a = credentials.options) === null || _a === void 0 ? void 0 : _a.redirectTo,
          scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
          queryParams:
            (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
          skipBrowserRedirect:
            (_d = credentials.options) === null || _d === void 0 ? void 0 : _d.skipBrowserRedirect,
        })
      }
      /**
       * Log in an existing user by exchanging an Auth Code issued during the PKCE flow.
       */
      async exchangeCodeForSession(authCode) {
        await this.initializePromise
        return this._acquireLock(-1, async () => {
          return this._exchangeCodeForSession(authCode)
        })
      }
      /**
       * Signs in a user by verifying a message signed by the user's private key.
       * Supports Ethereum (via Sign-In-With-Ethereum) & Solana (Sign-In-With-Solana) standards,
       * both of which derive from the EIP-4361 standard
       * With slight variation on Solana's side.
       * @reference https://eips.ethereum.org/EIPS/eip-4361
       */
      async signInWithWeb3(credentials) {
        const { chain } = credentials
        switch (chain) {
          case "ethereum":
            return await this.signInWithEthereum(credentials)
          case "solana":
            return await this.signInWithSolana(credentials)
          default:
            throw new Error(`@supabase/auth-js: Unsupported chain "${chain}"`)
        }
      }
      async signInWithEthereum(credentials) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l
        let message
        let signature
        if ("message" in credentials) {
          message = credentials.message
          signature = credentials.signature
        } else {
          const { chain, wallet, statement, options } = credentials
          let resolvedWallet
          if (!(0, helpers_1.isBrowser)()) {
            if (
              typeof wallet !== "object" ||
              !(options === null || options === void 0 ? void 0 : options.url)
            ) {
              throw new Error(
                "@supabase/auth-js: Both wallet and url must be specified in non-browser environments."
              )
            }
            resolvedWallet = wallet
          } else if (typeof wallet === "object") {
            resolvedWallet = wallet
          } else {
            const windowAny = window
            if (
              "ethereum" in windowAny &&
              typeof windowAny.ethereum === "object" &&
              "request" in windowAny.ethereum &&
              typeof windowAny.ethereum.request === "function"
            ) {
              resolvedWallet = windowAny.ethereum
            } else {
              throw new Error(
                `@supabase/auth-js: No compatible Ethereum wallet interface on the window object (window.ethereum) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'ethereum', wallet: resolvedUserWallet }) instead.`
              )
            }
          }
          const url = new URL(
            (_a = options === null || options === void 0 ? void 0 : options.url) !== null &&
              _a !== void 0
              ? _a
              : window.location.href
          )
          const accounts = await resolvedWallet
            .request({
              method: "eth_requestAccounts",
            })
            .then((accs) => accs)
            .catch(() => {
              throw new Error(
                `@supabase/auth-js: Wallet method eth_requestAccounts is missing or invalid`
              )
            })
          if (!accounts || accounts.length === 0) {
            throw new Error(
              `@supabase/auth-js: No accounts available. Please ensure the wallet is connected.`
            )
          }
          const address = (0, ethereum_1.getAddress)(accounts[0])
          let chainId =
            (_b = options === null || options === void 0 ? void 0 : options.signInWithEthereum) ===
              null || _b === void 0
              ? void 0
              : _b.chainId
          if (!chainId) {
            const chainIdHex = await resolvedWallet.request({
              method: "eth_chainId",
            })
            chainId = (0, ethereum_1.fromHex)(chainIdHex)
          }
          const siweMessage = {
            domain: url.host,
            address,
            statement,
            uri: url.href,
            version: "1",
            chainId,
            nonce:
              (_c =
                options === null || options === void 0 ? void 0 : options.signInWithEthereum) ===
                null || _c === void 0
                ? void 0
                : _c.nonce,
            issuedAt:
              (_e =
                (_d =
                  options === null || options === void 0 ? void 0 : options.signInWithEthereum) ===
                  null || _d === void 0
                  ? void 0
                  : _d.issuedAt) !== null && _e !== void 0
                ? _e
                : /* @__PURE__ */ new Date(),
            expirationTime:
              (_f =
                options === null || options === void 0 ? void 0 : options.signInWithEthereum) ===
                null || _f === void 0
                ? void 0
                : _f.expirationTime,
            notBefore:
              (_g =
                options === null || options === void 0 ? void 0 : options.signInWithEthereum) ===
                null || _g === void 0
                ? void 0
                : _g.notBefore,
            requestId:
              (_h =
                options === null || options === void 0 ? void 0 : options.signInWithEthereum) ===
                null || _h === void 0
                ? void 0
                : _h.requestId,
            resources:
              (_j =
                options === null || options === void 0 ? void 0 : options.signInWithEthereum) ===
                null || _j === void 0
                ? void 0
                : _j.resources,
          }
          message = (0, ethereum_1.createSiweMessage)(siweMessage)
          signature = await resolvedWallet.request({
            method: "personal_sign",
            params: [(0, ethereum_1.toHex)(message), address],
          })
        }
        try {
          const { data, error } = await (0, fetch_1._request)(
            this.fetch,
            "POST",
            `${this.url}/token?grant_type=web3`,
            {
              headers: this.headers,
              body: Object.assign(
                {
                  chain: "ethereum",
                  message,
                  signature,
                },
                ((_k = credentials.options) === null || _k === void 0 ? void 0 : _k.captchaToken)
                  ? {
                      gotrue_meta_security: {
                        captcha_token:
                          (_l = credentials.options) === null || _l === void 0
                            ? void 0
                            : _l.captchaToken,
                      },
                    }
                  : null
              ),
              xform: fetch_1._sessionResponse,
            }
          )
          if (error) {
            throw error
          }
          if (!data || !data.session || !data.user) {
            const invalidTokenError = new errors_1.AuthInvalidTokenResponseError()
            return this._returnResult({
              data: { user: null, session: null },
              error: invalidTokenError,
            })
          }
          if (data.session) {
            await this._saveSession(data.session)
            await this._notifyAllSubscribers("SIGNED_IN", data.session)
          }
          return this._returnResult({ data: Object.assign({}, data), error })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error })
          }
          throw error
        }
      }
      async signInWithSolana(credentials) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m
        let message
        let signature
        if ("message" in credentials) {
          message = credentials.message
          signature = credentials.signature
        } else {
          const { chain, wallet, statement, options } = credentials
          let resolvedWallet
          if (!(0, helpers_1.isBrowser)()) {
            if (
              typeof wallet !== "object" ||
              !(options === null || options === void 0 ? void 0 : options.url)
            ) {
              throw new Error(
                "@supabase/auth-js: Both wallet and url must be specified in non-browser environments."
              )
            }
            resolvedWallet = wallet
          } else if (typeof wallet === "object") {
            resolvedWallet = wallet
          } else {
            const windowAny = window
            if (
              "solana" in windowAny &&
              typeof windowAny.solana === "object" &&
              (("signIn" in windowAny.solana && typeof windowAny.solana.signIn === "function") ||
                ("signMessage" in windowAny.solana &&
                  typeof windowAny.solana.signMessage === "function"))
            ) {
              resolvedWallet = windowAny.solana
            } else {
              throw new Error(
                `@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.`
              )
            }
          }
          const url = new URL(
            (_a = options === null || options === void 0 ? void 0 : options.url) !== null &&
              _a !== void 0
              ? _a
              : window.location.href
          )
          if ("signIn" in resolvedWallet && resolvedWallet.signIn) {
            const output = await resolvedWallet.signIn(
              Object.assign(
                Object.assign(
                  Object.assign(
                    { issuedAt: /* @__PURE__ */ new Date().toISOString() },
                    options === null || options === void 0 ? void 0 : options.signInWithSolana
                  ),
                  {
                    // non-overridable properties
                    version: "1",
                    domain: url.host,
                    uri: url.href,
                  }
                ),
                statement ? { statement } : null
              )
            )
            let outputToProcess
            if (Array.isArray(output) && output[0] && typeof output[0] === "object") {
              outputToProcess = output[0]
            } else if (
              output &&
              typeof output === "object" &&
              "signedMessage" in output &&
              "signature" in output
            ) {
              outputToProcess = output
            } else {
              throw new Error(
                "@supabase/auth-js: Wallet method signIn() returned unrecognized value"
              )
            }
            if (
              "signedMessage" in outputToProcess &&
              "signature" in outputToProcess &&
              (typeof outputToProcess.signedMessage === "string" ||
                outputToProcess.signedMessage instanceof Uint8Array) &&
              outputToProcess.signature instanceof Uint8Array
            ) {
              message =
                typeof outputToProcess.signedMessage === "string"
                  ? outputToProcess.signedMessage
                  : new TextDecoder().decode(outputToProcess.signedMessage)
              signature = outputToProcess.signature
            } else {
              throw new Error(
                "@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields"
              )
            }
          } else {
            if (
              !("signMessage" in resolvedWallet) ||
              typeof resolvedWallet.signMessage !== "function" ||
              !("publicKey" in resolvedWallet) ||
              typeof resolvedWallet !== "object" ||
              !resolvedWallet.publicKey ||
              !("toBase58" in resolvedWallet.publicKey) ||
              typeof resolvedWallet.publicKey.toBase58 !== "function"
            ) {
              throw new Error(
                "@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API"
              )
            }
            message = [
              `${url.host} wants you to sign in with your Solana account:`,
              resolvedWallet.publicKey.toBase58(),
              ...(statement ? ["", statement, ""] : [""]),
              "Version: 1",
              `URI: ${url.href}`,
              `Issued At: ${(_c = (_b = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _b === void 0 ? void 0 : _b.issuedAt) !== null && _c !== void 0 ? _c : /* @__PURE__ */ new Date().toISOString()}`,
              ...((
                (_d =
                  options === null || options === void 0 ? void 0 : options.signInWithSolana) ===
                  null || _d === void 0
                  ? void 0
                  : _d.notBefore
              )
                ? [`Not Before: ${options.signInWithSolana.notBefore}`]
                : []),
              ...((
                (_e =
                  options === null || options === void 0 ? void 0 : options.signInWithSolana) ===
                  null || _e === void 0
                  ? void 0
                  : _e.expirationTime
              )
                ? [`Expiration Time: ${options.signInWithSolana.expirationTime}`]
                : []),
              ...((
                (_f =
                  options === null || options === void 0 ? void 0 : options.signInWithSolana) ===
                  null || _f === void 0
                  ? void 0
                  : _f.chainId
              )
                ? [`Chain ID: ${options.signInWithSolana.chainId}`]
                : []),
              ...((
                (_g =
                  options === null || options === void 0 ? void 0 : options.signInWithSolana) ===
                  null || _g === void 0
                  ? void 0
                  : _g.nonce
              )
                ? [`Nonce: ${options.signInWithSolana.nonce}`]
                : []),
              ...((
                (_h =
                  options === null || options === void 0 ? void 0 : options.signInWithSolana) ===
                  null || _h === void 0
                  ? void 0
                  : _h.requestId
              )
                ? [`Request ID: ${options.signInWithSolana.requestId}`]
                : []),
              ...((
                (_k =
                  (_j =
                    options === null || options === void 0 ? void 0 : options.signInWithSolana) ===
                    null || _j === void 0
                    ? void 0
                    : _j.resources) === null || _k === void 0
                  ? void 0
                  : _k.length
              )
                ? [
                    "Resources",
                    ...options.signInWithSolana.resources.map((resource) => `- ${resource}`),
                  ]
                : []),
            ].join("\n")
            const maybeSignature = await resolvedWallet.signMessage(
              new TextEncoder().encode(message),
              "utf8"
            )
            if (!maybeSignature || !(maybeSignature instanceof Uint8Array)) {
              throw new Error(
                "@supabase/auth-js: Wallet signMessage() API returned an recognized value"
              )
            }
            signature = maybeSignature
          }
        }
        try {
          const { data, error } = await (0, fetch_1._request)(
            this.fetch,
            "POST",
            `${this.url}/token?grant_type=web3`,
            {
              headers: this.headers,
              body: Object.assign(
                {
                  chain: "solana",
                  message,
                  signature: (0, base64url_1.bytesToBase64URL)(signature),
                },
                ((_l = credentials.options) === null || _l === void 0 ? void 0 : _l.captchaToken)
                  ? {
                      gotrue_meta_security: {
                        captcha_token:
                          (_m = credentials.options) === null || _m === void 0
                            ? void 0
                            : _m.captchaToken,
                      },
                    }
                  : null
              ),
              xform: fetch_1._sessionResponse,
            }
          )
          if (error) {
            throw error
          }
          if (!data || !data.session || !data.user) {
            const invalidTokenError = new errors_1.AuthInvalidTokenResponseError()
            return this._returnResult({
              data: { user: null, session: null },
              error: invalidTokenError,
            })
          }
          if (data.session) {
            await this._saveSession(data.session)
            await this._notifyAllSubscribers("SIGNED_IN", data.session)
          }
          return this._returnResult({ data: Object.assign({}, data), error })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error })
          }
          throw error
        }
      }
      async _exchangeCodeForSession(authCode) {
        const storageItem = await (0, helpers_1.getItemAsync)(
          this.storage,
          `${this.storageKey}-code-verifier`
        )
        const [codeVerifier, redirectType] = (
          storageItem !== null && storageItem !== void 0 ? storageItem : ""
        ).split("/")
        try {
          if (!codeVerifier && this.flowType === "pkce") {
            throw new errors_1.AuthPKCECodeVerifierMissingError()
          }
          const { data, error } = await (0, fetch_1._request)(
            this.fetch,
            "POST",
            `${this.url}/token?grant_type=pkce`,
            {
              headers: this.headers,
              body: {
                auth_code: authCode,
                code_verifier: codeVerifier,
              },
              xform: fetch_1._sessionResponse,
            }
          )
          await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`)
          if (error) {
            throw error
          }
          if (!data || !data.session || !data.user) {
            const invalidTokenError = new errors_1.AuthInvalidTokenResponseError()
            return this._returnResult({
              data: { user: null, session: null, redirectType: null },
              error: invalidTokenError,
            })
          }
          if (data.session) {
            await this._saveSession(data.session)
            await this._notifyAllSubscribers("SIGNED_IN", data.session)
          }
          return this._returnResult({
            data: Object.assign(Object.assign({}, data), {
              redirectType: redirectType !== null && redirectType !== void 0 ? redirectType : null,
            }),
            error,
          })
        } catch (error) {
          await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`)
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({
              data: { user: null, session: null, redirectType: null },
              error,
            })
          }
          throw error
        }
      }
      /**
       * Allows signing in with an OIDC ID token. The authentication provider used
       * should be enabled and configured.
       */
      async signInWithIdToken(credentials) {
        try {
          const { options, provider, token, access_token, nonce } = credentials
          const res = await (0, fetch_1._request)(
            this.fetch,
            "POST",
            `${this.url}/token?grant_type=id_token`,
            {
              headers: this.headers,
              body: {
                provider,
                id_token: token,
                access_token,
                nonce,
                gotrue_meta_security: {
                  captcha_token:
                    options === null || options === void 0 ? void 0 : options.captchaToken,
                },
              },
              xform: fetch_1._sessionResponse,
            }
          )
          const { data, error } = res
          if (error) {
            return this._returnResult({ data: { user: null, session: null }, error })
          } else if (!data || !data.session || !data.user) {
            const invalidTokenError = new errors_1.AuthInvalidTokenResponseError()
            return this._returnResult({
              data: { user: null, session: null },
              error: invalidTokenError,
            })
          }
          if (data.session) {
            await this._saveSession(data.session)
            await this._notifyAllSubscribers("SIGNED_IN", data.session)
          }
          return this._returnResult({ data, error })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error })
          }
          throw error
        }
      }
      /**
       * Log in a user using magiclink or a one-time password (OTP).
       *
       * If the `{{ .ConfirmationURL }}` variable is specified in the email template, a magiclink will be sent.
       * If the `{{ .Token }}` variable is specified in the email template, an OTP will be sent.
       * If you're using phone sign-ins, only an OTP will be sent. You won't be able to send a magiclink for phone sign-ins.
       *
       * Be aware that you may get back an error message that will not distinguish
       * between the cases where the account does not exist or, that the account
       * can only be accessed via social login.
       *
       * Do note that you will need to configure a Whatsapp sender on Twilio
       * if you are using phone sign in with the 'whatsapp' channel. The whatsapp
       * channel is not supported on other providers
       * at this time.
       * This method supports PKCE when an email is passed.
       */
      async signInWithOtp(credentials) {
        var _a, _b, _c, _d, _e
        try {
          if ("email" in credentials) {
            const { email, options } = credentials
            let codeChallenge = null
            let codeChallengeMethod = null
            if (this.flowType === "pkce") {
              ;[codeChallenge, codeChallengeMethod] = await (0,
              helpers_1.getCodeChallengeAndMethod)(this.storage, this.storageKey)
            }
            const { error } = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/otp`, {
              headers: this.headers,
              body: {
                email,
                data:
                  (_a = options === null || options === void 0 ? void 0 : options.data) !== null &&
                  _a !== void 0
                    ? _a
                    : {},
                create_user:
                  (_b =
                    options === null || options === void 0 ? void 0 : options.shouldCreateUser) !==
                    null && _b !== void 0
                    ? _b
                    : true,
                gotrue_meta_security: {
                  captcha_token:
                    options === null || options === void 0 ? void 0 : options.captchaToken,
                },
                code_challenge: codeChallenge,
                code_challenge_method: codeChallengeMethod,
              },
              redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
            })
            return this._returnResult({ data: { user: null, session: null }, error })
          }
          if ("phone" in credentials) {
            const { phone, options } = credentials
            const { data, error } = await (0, fetch_1._request)(
              this.fetch,
              "POST",
              `${this.url}/otp`,
              {
                headers: this.headers,
                body: {
                  phone,
                  data:
                    (_c = options === null || options === void 0 ? void 0 : options.data) !==
                      null && _c !== void 0
                      ? _c
                      : {},
                  create_user:
                    (_d =
                      options === null || options === void 0
                        ? void 0
                        : options.shouldCreateUser) !== null && _d !== void 0
                      ? _d
                      : true,
                  gotrue_meta_security: {
                    captcha_token:
                      options === null || options === void 0 ? void 0 : options.captchaToken,
                  },
                  channel:
                    (_e = options === null || options === void 0 ? void 0 : options.channel) !==
                      null && _e !== void 0
                      ? _e
                      : "sms",
                },
              }
            )
            return this._returnResult({
              data: {
                user: null,
                session: null,
                messageId: data === null || data === void 0 ? void 0 : data.message_id,
              },
              error,
            })
          }
          throw new errors_1.AuthInvalidCredentialsError(
            "You must provide either an email or phone number."
          )
        } catch (error) {
          await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`)
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error })
          }
          throw error
        }
      }
      /**
       * Log in a user given a User supplied OTP or TokenHash received through mobile or email.
       */
      async verifyOtp(params) {
        var _a, _b
        try {
          let redirectTo = void 0
          let captchaToken = void 0
          if ("options" in params) {
            redirectTo = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo
            captchaToken =
              (_b = params.options) === null || _b === void 0 ? void 0 : _b.captchaToken
          }
          const { data, error } = await (0, fetch_1._request)(
            this.fetch,
            "POST",
            `${this.url}/verify`,
            {
              headers: this.headers,
              body: Object.assign(Object.assign({}, params), {
                gotrue_meta_security: { captcha_token: captchaToken },
              }),
              redirectTo,
              xform: fetch_1._sessionResponse,
            }
          )
          if (error) {
            throw error
          }
          if (!data) {
            const tokenVerificationError = new Error("An error occurred on token verification.")
            throw tokenVerificationError
          }
          const session = data.session
          const user = data.user
          if (session === null || session === void 0 ? void 0 : session.access_token) {
            await this._saveSession(session)
            await this._notifyAllSubscribers(
              params.type == "recovery" ? "PASSWORD_RECOVERY" : "SIGNED_IN",
              session
            )
          }
          return this._returnResult({ data: { user, session }, error: null })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error })
          }
          throw error
        }
      }
      /**
       * Attempts a single-sign on using an enterprise Identity Provider. A
       * successful SSO attempt will redirect the current page to the identity
       * provider authorization page. The redirect URL is implementation and SSO
       * protocol specific.
       *
       * You can use it by providing a SSO domain. Typically you can extract this
       * domain by asking users for their email address. If this domain is
       * registered on the Auth instance the redirect will use that organization's
       * currently active SSO Identity Provider for the login.
       *
       * If you have built an organization-specific login page, you can use the
       * organization's SSO Identity Provider UUID directly instead.
       */
      async signInWithSSO(params) {
        var _a, _b, _c, _d, _e
        try {
          let codeChallenge = null
          let codeChallengeMethod = null
          if (this.flowType === "pkce") {
            ;[codeChallenge, codeChallengeMethod] = await (0, helpers_1.getCodeChallengeAndMethod)(
              this.storage,
              this.storageKey
            )
          }
          const result = await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/sso`, {
            body: Object.assign(
              Object.assign(
                Object.assign(
                  Object.assign(
                    Object.assign(
                      {},
                      "providerId" in params ? { provider_id: params.providerId } : null
                    ),
                    "domain" in params ? { domain: params.domain } : null
                  ),
                  {
                    redirect_to:
                      (_b =
                        (_a = params.options) === null || _a === void 0
                          ? void 0
                          : _a.redirectTo) !== null && _b !== void 0
                        ? _b
                        : void 0,
                  }
                ),
                (
                  (_c = params === null || params === void 0 ? void 0 : params.options) === null ||
                  _c === void 0
                    ? void 0
                    : _c.captchaToken
                )
                  ? { gotrue_meta_security: { captcha_token: params.options.captchaToken } }
                  : null
              ),
              {
                skip_http_redirect: true,
                code_challenge: codeChallenge,
                code_challenge_method: codeChallengeMethod,
              }
            ),
            headers: this.headers,
            xform: fetch_1._ssoResponse,
          })
          if (
            ((_d = result.data) === null || _d === void 0 ? void 0 : _d.url) &&
            (0, helpers_1.isBrowser)() &&
            !((_e = params.options) === null || _e === void 0 ? void 0 : _e.skipBrowserRedirect)
          ) {
            window.location.assign(result.data.url)
          }
          return this._returnResult(result)
        } catch (error) {
          await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`)
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error })
          }
          throw error
        }
      }
      /**
       * Sends a reauthentication OTP to the user's email or phone number.
       * Requires the user to be signed-in.
       */
      async reauthenticate() {
        await this.initializePromise
        return await this._acquireLock(-1, async () => {
          return await this._reauthenticate()
        })
      }
      async _reauthenticate() {
        try {
          return await this._useSession(async (result) => {
            const {
              data: { session },
              error: sessionError,
            } = result
            if (sessionError) throw sessionError
            if (!session) throw new errors_1.AuthSessionMissingError()
            const { error } = await (0, fetch_1._request)(
              this.fetch,
              "GET",
              `${this.url}/reauthenticate`,
              {
                headers: this.headers,
                jwt: session.access_token,
              }
            )
            return this._returnResult({ data: { user: null, session: null }, error })
          })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error })
          }
          throw error
        }
      }
      /**
       * Resends an existing signup confirmation email, email change email, SMS OTP or phone change OTP.
       */
      async resend(credentials) {
        try {
          const endpoint = `${this.url}/resend`
          if ("email" in credentials) {
            const { email, type, options } = credentials
            const { error } = await (0, fetch_1._request)(this.fetch, "POST", endpoint, {
              headers: this.headers,
              body: {
                email,
                type,
                gotrue_meta_security: {
                  captcha_token:
                    options === null || options === void 0 ? void 0 : options.captchaToken,
                },
              },
              redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
            })
            return this._returnResult({ data: { user: null, session: null }, error })
          } else if ("phone" in credentials) {
            const { phone, type, options } = credentials
            const { data, error } = await (0, fetch_1._request)(this.fetch, "POST", endpoint, {
              headers: this.headers,
              body: {
                phone,
                type,
                gotrue_meta_security: {
                  captcha_token:
                    options === null || options === void 0 ? void 0 : options.captchaToken,
                },
              },
            })
            return this._returnResult({
              data: {
                user: null,
                session: null,
                messageId: data === null || data === void 0 ? void 0 : data.message_id,
              },
              error,
            })
          }
          throw new errors_1.AuthInvalidCredentialsError(
            "You must provide either an email or phone number and a type"
          )
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error })
          }
          throw error
        }
      }
      /**
       * Returns the session, refreshing it if necessary.
       *
       * The session returned can be null if the session is not detected which can happen in the event a user is not signed-in or has logged out.
       *
       * **IMPORTANT:** This method loads values directly from the storage attached
       * to the client. If that storage is based on request cookies for example,
       * the values in it may not be authentic and therefore it's strongly advised
       * against using this method and its results in such circumstances. A warning
       * will be emitted if this is detected. Use {@link #getUser()} instead.
       */
      async getSession() {
        await this.initializePromise
        const result = await this._acquireLock(-1, async () => {
          return this._useSession(async (result2) => {
            return result2
          })
        })
        return result
      }
      /**
       * Acquires a global lock based on the storage key.
       */
      async _acquireLock(acquireTimeout, fn) {
        this._debug("#_acquireLock", "begin", acquireTimeout)
        try {
          if (this.lockAcquired) {
            const last = this.pendingInLock.length
              ? this.pendingInLock[this.pendingInLock.length - 1]
              : Promise.resolve()
            const result = (async () => {
              await last
              return await fn()
            })()
            this.pendingInLock.push(
              (async () => {
                try {
                  await result
                } catch (e) {}
              })()
            )
            return result
          }
          return await this.lock(`lock:${this.storageKey}`, acquireTimeout, async () => {
            this._debug("#_acquireLock", "lock acquired for storage key", this.storageKey)
            try {
              this.lockAcquired = true
              const result = fn()
              this.pendingInLock.push(
                (async () => {
                  try {
                    await result
                  } catch (e) {}
                })()
              )
              await result
              while (this.pendingInLock.length) {
                const waitOn = [...this.pendingInLock]
                await Promise.all(waitOn)
                this.pendingInLock.splice(0, waitOn.length)
              }
              return await result
            } finally {
              this._debug("#_acquireLock", "lock released for storage key", this.storageKey)
              this.lockAcquired = false
            }
          })
        } finally {
          this._debug("#_acquireLock", "end")
        }
      }
      /**
       * Use instead of {@link #getSession} inside the library. It is
       * semantically usually what you want, as getting a session involves some
       * processing afterwards that requires only one client operating on the
       * session at once across multiple tabs or processes.
       */
      async _useSession(fn) {
        this._debug("#_useSession", "begin")
        try {
          const result = await this.__loadSession()
          return await fn(result)
        } finally {
          this._debug("#_useSession", "end")
        }
      }
      /**
       * NEVER USE DIRECTLY!
       *
       * Always use {@link #_useSession}.
       */
      async __loadSession() {
        this._debug("#__loadSession()", "begin")
        if (!this.lockAcquired) {
          this._debug("#__loadSession()", "used outside of an acquired lock!", new Error().stack)
        }
        try {
          let currentSession = null
          const maybeSession = await (0, helpers_1.getItemAsync)(this.storage, this.storageKey)
          this._debug("#getSession()", "session from storage", maybeSession)
          if (maybeSession !== null) {
            if (this._isValidSession(maybeSession)) {
              currentSession = maybeSession
            } else {
              this._debug("#getSession()", "session from storage is not valid")
              await this._removeSession()
            }
          }
          if (!currentSession) {
            return { data: { session: null }, error: null }
          }
          const hasExpired = currentSession.expires_at
            ? currentSession.expires_at * 1e3 - Date.now() < constants_1.EXPIRY_MARGIN_MS
            : false
          this._debug(
            "#__loadSession()",
            `session has${hasExpired ? "" : " not"} expired`,
            "expires_at",
            currentSession.expires_at
          )
          if (!hasExpired) {
            if (this.userStorage) {
              const maybeUser = await (0, helpers_1.getItemAsync)(
                this.userStorage,
                this.storageKey + "-user"
              )
              if (maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.user) {
                currentSession.user = maybeUser.user
              } else {
                currentSession.user = (0, helpers_1.userNotAvailableProxy)()
              }
            }
            if (
              this.storage.isServer &&
              currentSession.user &&
              !currentSession.user.__isUserNotAvailableProxy
            ) {
              const suppressWarningRef = { value: this.suppressGetSessionWarning }
              currentSession.user = (0, helpers_1.insecureUserWarningProxy)(
                currentSession.user,
                suppressWarningRef
              )
              if (suppressWarningRef.value) {
                this.suppressGetSessionWarning = true
              }
            }
            return { data: { session: currentSession }, error: null }
          }
          const { data: session, error } = await this._callRefreshToken(
            currentSession.refresh_token
          )
          if (error) {
            return this._returnResult({ data: { session: null }, error })
          }
          return this._returnResult({ data: { session }, error: null })
        } finally {
          this._debug("#__loadSession()", "end")
        }
      }
      /**
       * Gets the current user details if there is an existing session. This method
       * performs a network request to the Supabase Auth server, so the returned
       * value is authentic and can be used to base authorization rules on.
       *
       * @param jwt Takes in an optional access token JWT. If no JWT is provided, the JWT from the current session is used.
       */
      async getUser(jwt) {
        if (jwt) {
          return await this._getUser(jwt)
        }
        await this.initializePromise
        const result = await this._acquireLock(-1, async () => {
          return await this._getUser()
        })
        if (result.data.user) {
          this.suppressGetSessionWarning = true
        }
        return result
      }
      async _getUser(jwt) {
        try {
          if (jwt) {
            return await (0, fetch_1._request)(this.fetch, "GET", `${this.url}/user`, {
              headers: this.headers,
              jwt,
              xform: fetch_1._userResponse,
            })
          }
          return await this._useSession(async (result) => {
            var _a, _b, _c
            const { data, error } = result
            if (error) {
              throw error
            }
            if (
              !((_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) &&
              !this.hasCustomAuthorizationHeader
            ) {
              return { data: { user: null }, error: new errors_1.AuthSessionMissingError() }
            }
            return await (0, fetch_1._request)(this.fetch, "GET", `${this.url}/user`, {
              headers: this.headers,
              jwt:
                (_c = (_b = data.session) === null || _b === void 0 ? void 0 : _b.access_token) !==
                  null && _c !== void 0
                  ? _c
                  : void 0,
              xform: fetch_1._userResponse,
            })
          })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            if ((0, errors_1.isAuthSessionMissingError)(error)) {
              await this._removeSession()
              await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`)
            }
            return this._returnResult({ data: { user: null }, error })
          }
          throw error
        }
      }
      /**
       * Updates user data for a logged in user.
       */
      async updateUser(attributes, options = {}) {
        await this.initializePromise
        return await this._acquireLock(-1, async () => {
          return await this._updateUser(attributes, options)
        })
      }
      async _updateUser(attributes, options = {}) {
        try {
          return await this._useSession(async (result) => {
            const { data: sessionData, error: sessionError } = result
            if (sessionError) {
              throw sessionError
            }
            if (!sessionData.session) {
              throw new errors_1.AuthSessionMissingError()
            }
            const session = sessionData.session
            let codeChallenge = null
            let codeChallengeMethod = null
            if (this.flowType === "pkce" && attributes.email != null) {
              ;[codeChallenge, codeChallengeMethod] = await (0,
              helpers_1.getCodeChallengeAndMethod)(this.storage, this.storageKey)
            }
            const { data, error: userError } = await (0, fetch_1._request)(
              this.fetch,
              "PUT",
              `${this.url}/user`,
              {
                headers: this.headers,
                redirectTo:
                  options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                body: Object.assign(Object.assign({}, attributes), {
                  code_challenge: codeChallenge,
                  code_challenge_method: codeChallengeMethod,
                }),
                jwt: session.access_token,
                xform: fetch_1._userResponse,
              }
            )
            if (userError) {
              throw userError
            }
            session.user = data.user
            await this._saveSession(session)
            await this._notifyAllSubscribers("USER_UPDATED", session)
            return this._returnResult({ data: { user: session.user }, error: null })
          })
        } catch (error) {
          await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`)
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null }, error })
          }
          throw error
        }
      }
      /**
       * Sets the session data from the current session. If the current session is expired, setSession will take care of refreshing it to obtain a new session.
       * If the refresh token or access token in the current session is invalid, an error will be thrown.
       * @param currentSession The current session that minimally contains an access token and refresh token.
       */
      async setSession(currentSession) {
        await this.initializePromise
        return await this._acquireLock(-1, async () => {
          return await this._setSession(currentSession)
        })
      }
      async _setSession(currentSession) {
        try {
          if (!currentSession.access_token || !currentSession.refresh_token) {
            throw new errors_1.AuthSessionMissingError()
          }
          const timeNow = Date.now() / 1e3
          let expiresAt = timeNow
          let hasExpired = true
          let session = null
          const { payload } = (0, helpers_1.decodeJWT)(currentSession.access_token)
          if (payload.exp) {
            expiresAt = payload.exp
            hasExpired = expiresAt <= timeNow
          }
          if (hasExpired) {
            const { data: refreshedSession, error } = await this._callRefreshToken(
              currentSession.refresh_token
            )
            if (error) {
              return this._returnResult({ data: { user: null, session: null }, error })
            }
            if (!refreshedSession) {
              return { data: { user: null, session: null }, error: null }
            }
            session = refreshedSession
          } else {
            const { data, error } = await this._getUser(currentSession.access_token)
            if (error) {
              throw error
            }
            session = {
              access_token: currentSession.access_token,
              refresh_token: currentSession.refresh_token,
              user: data.user,
              token_type: "bearer",
              expires_in: expiresAt - timeNow,
              expires_at: expiresAt,
            }
            await this._saveSession(session)
            await this._notifyAllSubscribers("SIGNED_IN", session)
          }
          return this._returnResult({ data: { user: session.user, session }, error: null })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { session: null, user: null }, error })
          }
          throw error
        }
      }
      /**
       * Returns a new session, regardless of expiry status.
       * Takes in an optional current session. If not passed in, then refreshSession() will attempt to retrieve it from getSession().
       * If the current session's refresh token is invalid, an error will be thrown.
       * @param currentSession The current session. If passed in, it must contain a refresh token.
       */
      async refreshSession(currentSession) {
        await this.initializePromise
        return await this._acquireLock(-1, async () => {
          return await this._refreshSession(currentSession)
        })
      }
      async _refreshSession(currentSession) {
        try {
          return await this._useSession(async (result) => {
            var _a
            if (!currentSession) {
              const { data, error: error2 } = result
              if (error2) {
                throw error2
              }
              currentSession = (_a = data.session) !== null && _a !== void 0 ? _a : void 0
            }
            if (
              !(currentSession === null || currentSession === void 0
                ? void 0
                : currentSession.refresh_token)
            ) {
              throw new errors_1.AuthSessionMissingError()
            }
            const { data: session, error } = await this._callRefreshToken(
              currentSession.refresh_token
            )
            if (error) {
              return this._returnResult({ data: { user: null, session: null }, error })
            }
            if (!session) {
              return this._returnResult({ data: { user: null, session: null }, error: null })
            }
            return this._returnResult({ data: { user: session.user, session }, error: null })
          })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { user: null, session: null }, error })
          }
          throw error
        }
      }
      /**
       * Gets the session data from a URL string
       */
      async _getSessionFromURL(params, callbackUrlType) {
        try {
          if (!(0, helpers_1.isBrowser)())
            throw new errors_1.AuthImplicitGrantRedirectError("No browser detected.")
          if (params.error || params.error_description || params.error_code) {
            throw new errors_1.AuthImplicitGrantRedirectError(
              params.error_description || "Error in URL with unspecified error_description",
              {
                error: params.error || "unspecified_error",
                code: params.error_code || "unspecified_code",
              }
            )
          }
          switch (callbackUrlType) {
            case "implicit":
              if (this.flowType === "pkce") {
                throw new errors_1.AuthPKCEGrantCodeExchangeError("Not a valid PKCE flow url.")
              }
              break
            case "pkce":
              if (this.flowType === "implicit") {
                throw new errors_1.AuthImplicitGrantRedirectError(
                  "Not a valid implicit grant flow url."
                )
              }
              break
            default:
          }
          if (callbackUrlType === "pkce") {
            this._debug("#_initialize()", "begin", "is PKCE flow", true)
            if (!params.code) throw new errors_1.AuthPKCEGrantCodeExchangeError("No code detected.")
            const { data: data2, error: error2 } = await this._exchangeCodeForSession(params.code)
            if (error2) throw error2
            const url = new URL(window.location.href)
            url.searchParams.delete("code")
            window.history.replaceState(window.history.state, "", url.toString())
            return { data: { session: data2.session, redirectType: null }, error: null }
          }
          const {
            provider_token,
            provider_refresh_token,
            access_token,
            refresh_token,
            expires_in,
            expires_at,
            token_type,
          } = params
          if (!access_token || !expires_in || !refresh_token || !token_type) {
            throw new errors_1.AuthImplicitGrantRedirectError("No session defined in URL")
          }
          const timeNow = Math.round(Date.now() / 1e3)
          const expiresIn = parseInt(expires_in)
          let expiresAt = timeNow + expiresIn
          if (expires_at) {
            expiresAt = parseInt(expires_at)
          }
          const actuallyExpiresIn = expiresAt - timeNow
          if (actuallyExpiresIn * 1e3 <= constants_1.AUTO_REFRESH_TICK_DURATION_MS) {
            console.warn(
              `@supabase/gotrue-js: Session as retrieved from URL expires in ${actuallyExpiresIn}s, should have been closer to ${expiresIn}s`
            )
          }
          const issuedAt = expiresAt - expiresIn
          if (timeNow - issuedAt >= 120) {
            console.warn(
              "@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale",
              issuedAt,
              expiresAt,
              timeNow
            )
          } else if (timeNow - issuedAt < 0) {
            console.warn(
              "@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew",
              issuedAt,
              expiresAt,
              timeNow
            )
          }
          const { data, error } = await this._getUser(access_token)
          if (error) throw error
          const session = {
            provider_token,
            provider_refresh_token,
            access_token,
            expires_in: expiresIn,
            expires_at: expiresAt,
            refresh_token,
            token_type,
            user: data.user,
          }
          window.location.hash = ""
          this._debug("#_getSessionFromURL()", "clearing window.location.hash")
          return this._returnResult({ data: { session, redirectType: params.type }, error: null })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { session: null, redirectType: null }, error })
          }
          throw error
        }
      }
      /**
       * Checks if the current URL contains parameters given by an implicit oauth grant flow (https://www.rfc-editor.org/rfc/rfc6749.html#section-4.2)
       *
       * If `detectSessionInUrl` is a function, it will be called with the URL and params to determine
       * if the URL should be processed as a Supabase auth callback. This allows users to exclude
       * URLs from other OAuth providers (e.g., Facebook Login) that also return access_token in the fragment.
       */
      _isImplicitGrantCallback(params) {
        if (typeof this.detectSessionInUrl === "function") {
          return this.detectSessionInUrl(new URL(window.location.href), params)
        }
        return Boolean(params.access_token || params.error_description)
      }
      /**
       * Checks if the current URL and backing storage contain parameters given by a PKCE flow
       */
      async _isPKCECallback(params) {
        const currentStorageContent = await (0, helpers_1.getItemAsync)(
          this.storage,
          `${this.storageKey}-code-verifier`
        )
        return !!(params.code && currentStorageContent)
      }
      /**
       * Inside a browser context, `signOut()` will remove the logged in user from the browser session and log them out - removing all items from localstorage and then trigger a `"SIGNED_OUT"` event.
       *
       * For server-side management, you can revoke all refresh tokens for a user by passing a user's JWT through to `auth.api.signOut(JWT: string)`.
       * There is no way to revoke a user's access token jwt until it expires. It is recommended to set a shorter expiry on the jwt for this reason.
       *
       * If using `others` scope, no `SIGNED_OUT` event is fired!
       */
      async signOut(options = { scope: "global" }) {
        await this.initializePromise
        return await this._acquireLock(-1, async () => {
          return await this._signOut(options)
        })
      }
      async _signOut({ scope } = { scope: "global" }) {
        return await this._useSession(async (result) => {
          var _a
          const { data, error: sessionError } = result
          if (sessionError) {
            return this._returnResult({ error: sessionError })
          }
          const accessToken =
            (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token
          if (accessToken) {
            const { error } = await this.admin.signOut(accessToken, scope)
            if (error) {
              if (
                !(
                  (0, errors_1.isAuthApiError)(error) &&
                  (error.status === 404 || error.status === 401 || error.status === 403)
                )
              ) {
                return this._returnResult({ error })
              }
            }
          }
          if (scope !== "others") {
            await this._removeSession()
            await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`)
          }
          return this._returnResult({ error: null })
        })
      }
      onAuthStateChange(callback) {
        const id = (0, helpers_1.generateCallbackId)()
        const subscription = {
          id,
          callback,
          unsubscribe: () => {
            this._debug("#unsubscribe()", "state change callback with id removed", id)
            this.stateChangeEmitters.delete(id)
          },
        }
        this._debug("#onAuthStateChange()", "registered callback with id", id)
        this.stateChangeEmitters.set(id, subscription)
        ;(async () => {
          await this.initializePromise
          await this._acquireLock(-1, async () => {
            this._emitInitialSession(id)
          })
        })()
        return { data: { subscription } }
      }
      async _emitInitialSession(id) {
        return await this._useSession(async (result) => {
          var _a, _b
          try {
            const {
              data: { session },
              error,
            } = result
            if (error) throw error
            await ((_a = this.stateChangeEmitters.get(id)) === null || _a === void 0
              ? void 0
              : _a.callback("INITIAL_SESSION", session))
            this._debug("INITIAL_SESSION", "callback id", id, "session", session)
          } catch (err) {
            await ((_b = this.stateChangeEmitters.get(id)) === null || _b === void 0
              ? void 0
              : _b.callback("INITIAL_SESSION", null))
            this._debug("INITIAL_SESSION", "callback id", id, "error", err)
            console.error(err)
          }
        })
      }
      /**
       * Sends a password reset request to an email address. This method supports the PKCE flow.
       *
       * @param email The email address of the user.
       * @param options.redirectTo The URL to send the user to after they click the password reset link.
       * @param options.captchaToken Verification token received when the user completes the captcha on the site.
       */
      async resetPasswordForEmail(email, options = {}) {
        let codeChallenge = null
        let codeChallengeMethod = null
        if (this.flowType === "pkce") {
          ;[codeChallenge, codeChallengeMethod] = await (0, helpers_1.getCodeChallengeAndMethod)(
            this.storage,
            this.storageKey,
            true
            // isPasswordRecovery
          )
        }
        try {
          return await (0, fetch_1._request)(this.fetch, "POST", `${this.url}/recover`, {
            body: {
              email,
              code_challenge: codeChallenge,
              code_challenge_method: codeChallengeMethod,
              gotrue_meta_security: { captcha_token: options.captchaToken },
            },
            headers: this.headers,
            redirectTo: options.redirectTo,
          })
        } catch (error) {
          await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`)
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error })
          }
          throw error
        }
      }
      /**
       * Gets all the identities linked to a user.
       */
      async getUserIdentities() {
        var _a
        try {
          const { data, error } = await this.getUser()
          if (error) throw error
          return this._returnResult({
            data: { identities: (_a = data.user.identities) !== null && _a !== void 0 ? _a : [] },
            error: null,
          })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error })
          }
          throw error
        }
      }
      async linkIdentity(credentials) {
        if ("token" in credentials) {
          return this.linkIdentityIdToken(credentials)
        }
        return this.linkIdentityOAuth(credentials)
      }
      async linkIdentityOAuth(credentials) {
        var _a
        try {
          const { data, error } = await this._useSession(async (result) => {
            var _a2, _b, _c, _d, _e
            const { data: data2, error: error2 } = result
            if (error2) throw error2
            const url = await this._getUrlForProvider(
              `${this.url}/user/identities/authorize`,
              credentials.provider,
              {
                redirectTo:
                  (_a2 = credentials.options) === null || _a2 === void 0 ? void 0 : _a2.redirectTo,
                scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
                queryParams:
                  (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
                skipBrowserRedirect: true,
              }
            )
            return await (0, fetch_1._request)(this.fetch, "GET", url, {
              headers: this.headers,
              jwt:
                (_e = (_d = data2.session) === null || _d === void 0 ? void 0 : _d.access_token) !==
                  null && _e !== void 0
                  ? _e
                  : void 0,
            })
          })
          if (error) throw error
          if (
            (0, helpers_1.isBrowser)() &&
            !((_a = credentials.options) === null || _a === void 0
              ? void 0
              : _a.skipBrowserRedirect)
          ) {
            window.location.assign(data === null || data === void 0 ? void 0 : data.url)
          }
          return this._returnResult({
            data: {
              provider: credentials.provider,
              url: data === null || data === void 0 ? void 0 : data.url,
            },
            error: null,
          })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({
              data: { provider: credentials.provider, url: null },
              error,
            })
          }
          throw error
        }
      }
      async linkIdentityIdToken(credentials) {
        return await this._useSession(async (result) => {
          var _a
          try {
            const {
              error: sessionError,
              data: { session },
            } = result
            if (sessionError) throw sessionError
            const { options, provider, token, access_token, nonce } = credentials
            const res = await (0, fetch_1._request)(
              this.fetch,
              "POST",
              `${this.url}/token?grant_type=id_token`,
              {
                headers: this.headers,
                jwt:
                  (_a = session === null || session === void 0 ? void 0 : session.access_token) !==
                    null && _a !== void 0
                    ? _a
                    : void 0,
                body: {
                  provider,
                  id_token: token,
                  access_token,
                  nonce,
                  link_identity: true,
                  gotrue_meta_security: {
                    captcha_token:
                      options === null || options === void 0 ? void 0 : options.captchaToken,
                  },
                },
                xform: fetch_1._sessionResponse,
              }
            )
            const { data, error } = res
            if (error) {
              return this._returnResult({ data: { user: null, session: null }, error })
            } else if (!data || !data.session || !data.user) {
              return this._returnResult({
                data: { user: null, session: null },
                error: new errors_1.AuthInvalidTokenResponseError(),
              })
            }
            if (data.session) {
              await this._saveSession(data.session)
              await this._notifyAllSubscribers("USER_UPDATED", data.session)
            }
            return this._returnResult({ data, error })
          } catch (error) {
            await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`)
            if ((0, errors_1.isAuthError)(error)) {
              return this._returnResult({ data: { user: null, session: null }, error })
            }
            throw error
          }
        })
      }
      /**
       * Unlinks an identity from a user by deleting it. The user will no longer be able to sign in with that identity once it's unlinked.
       */
      async unlinkIdentity(identity) {
        try {
          return await this._useSession(async (result) => {
            var _a, _b
            const { data, error } = result
            if (error) {
              throw error
            }
            return await (0, fetch_1._request)(
              this.fetch,
              "DELETE",
              `${this.url}/user/identities/${identity.identity_id}`,
              {
                headers: this.headers,
                jwt:
                  (_b =
                    (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !==
                    null && _b !== void 0
                    ? _b
                    : void 0,
              }
            )
          })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error })
          }
          throw error
        }
      }
      /**
       * Generates a new JWT.
       * @param refreshToken A valid refresh token that was returned on login.
       */
      async _refreshAccessToken(refreshToken) {
        const debugName = `#_refreshAccessToken(${refreshToken.substring(0, 5)}...)`
        this._debug(debugName, "begin")
        try {
          const startedAt = Date.now()
          return await (0, helpers_1.retryable)(
            async (attempt) => {
              if (attempt > 0) {
                await (0, helpers_1.sleep)(200 * Math.pow(2, attempt - 1))
              }
              this._debug(debugName, "refreshing attempt", attempt)
              return await (0, fetch_1._request)(
                this.fetch,
                "POST",
                `${this.url}/token?grant_type=refresh_token`,
                {
                  body: { refresh_token: refreshToken },
                  headers: this.headers,
                  xform: fetch_1._sessionResponse,
                }
              )
            },
            (attempt, error) => {
              const nextBackOffInterval = 200 * Math.pow(2, attempt)
              return (
                error &&
                (0, errors_1.isAuthRetryableFetchError)(error) && // retryable only if the request can be sent before the backoff overflows the tick duration
                Date.now() + nextBackOffInterval - startedAt <
                  constants_1.AUTO_REFRESH_TICK_DURATION_MS
              )
            }
          )
        } catch (error) {
          this._debug(debugName, "error", error)
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: { session: null, user: null }, error })
          }
          throw error
        } finally {
          this._debug(debugName, "end")
        }
      }
      _isValidSession(maybeSession) {
        const isValidSession =
          typeof maybeSession === "object" &&
          maybeSession !== null &&
          "access_token" in maybeSession &&
          "refresh_token" in maybeSession &&
          "expires_at" in maybeSession
        return isValidSession
      }
      async _handleProviderSignIn(provider, options) {
        const url = await this._getUrlForProvider(`${this.url}/authorize`, provider, {
          redirectTo: options.redirectTo,
          scopes: options.scopes,
          queryParams: options.queryParams,
        })
        this._debug(
          "#_handleProviderSignIn()",
          "provider",
          provider,
          "options",
          options,
          "url",
          url
        )
        if ((0, helpers_1.isBrowser)() && !options.skipBrowserRedirect) {
          window.location.assign(url)
        }
        return { data: { provider, url }, error: null }
      }
      /**
       * Recovers the session from LocalStorage and refreshes the token
       * Note: this method is async to accommodate for AsyncStorage e.g. in React native.
       */
      async _recoverAndRefresh() {
        var _a, _b
        const debugName = "#_recoverAndRefresh()"
        this._debug(debugName, "begin")
        try {
          const currentSession = await (0, helpers_1.getItemAsync)(this.storage, this.storageKey)
          if (currentSession && this.userStorage) {
            let maybeUser = await (0, helpers_1.getItemAsync)(
              this.userStorage,
              this.storageKey + "-user"
            )
            if (!this.storage.isServer && Object.is(this.storage, this.userStorage) && !maybeUser) {
              maybeUser = { user: currentSession.user }
              await (0, helpers_1.setItemAsync)(
                this.userStorage,
                this.storageKey + "-user",
                maybeUser
              )
            }
            currentSession.user =
              (_a = maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.user) !==
                null && _a !== void 0
                ? _a
                : (0, helpers_1.userNotAvailableProxy)()
          } else if (currentSession && !currentSession.user) {
            if (!currentSession.user) {
              const separateUser = await (0, helpers_1.getItemAsync)(
                this.storage,
                this.storageKey + "-user"
              )
              if (
                separateUser &&
                (separateUser === null || separateUser === void 0 ? void 0 : separateUser.user)
              ) {
                currentSession.user = separateUser.user
                await (0, helpers_1.removeItemAsync)(this.storage, this.storageKey + "-user")
                await (0, helpers_1.setItemAsync)(this.storage, this.storageKey, currentSession)
              } else {
                currentSession.user = (0, helpers_1.userNotAvailableProxy)()
              }
            }
          }
          this._debug(debugName, "session from storage", currentSession)
          if (!this._isValidSession(currentSession)) {
            this._debug(debugName, "session is not valid")
            if (currentSession !== null) {
              await this._removeSession()
            }
            return
          }
          const expiresWithMargin =
            ((_b = currentSession.expires_at) !== null && _b !== void 0 ? _b : Infinity) * 1e3 -
              Date.now() <
            constants_1.EXPIRY_MARGIN_MS
          this._debug(
            debugName,
            `session has${expiresWithMargin ? "" : " not"} expired with margin of ${constants_1.EXPIRY_MARGIN_MS}s`
          )
          if (expiresWithMargin) {
            if (this.autoRefreshToken && currentSession.refresh_token) {
              const { error } = await this._callRefreshToken(currentSession.refresh_token)
              if (error) {
                console.error(error)
                if (!(0, errors_1.isAuthRetryableFetchError)(error)) {
                  this._debug(
                    debugName,
                    "refresh failed with a non-retryable error, removing the session",
                    error
                  )
                  await this._removeSession()
                }
              }
            }
          } else if (
            currentSession.user &&
            currentSession.user.__isUserNotAvailableProxy === true
          ) {
            try {
              const { data, error: userError } = await this._getUser(currentSession.access_token)
              if (!userError && (data === null || data === void 0 ? void 0 : data.user)) {
                currentSession.user = data.user
                await this._saveSession(currentSession)
                await this._notifyAllSubscribers("SIGNED_IN", currentSession)
              } else {
                this._debug(debugName, "could not get user data, skipping SIGNED_IN notification")
              }
            } catch (getUserError) {
              console.error("Error getting user data:", getUserError)
              this._debug(
                debugName,
                "error getting user data, skipping SIGNED_IN notification",
                getUserError
              )
            }
          } else {
            await this._notifyAllSubscribers("SIGNED_IN", currentSession)
          }
        } catch (err) {
          this._debug(debugName, "error", err)
          console.error(err)
          return
        } finally {
          this._debug(debugName, "end")
        }
      }
      async _callRefreshToken(refreshToken) {
        var _a, _b
        if (!refreshToken) {
          throw new errors_1.AuthSessionMissingError()
        }
        if (this.refreshingDeferred) {
          return this.refreshingDeferred.promise
        }
        const debugName = `#_callRefreshToken(${refreshToken.substring(0, 5)}...)`
        this._debug(debugName, "begin")
        try {
          this.refreshingDeferred = new helpers_1.Deferred()
          const { data, error } = await this._refreshAccessToken(refreshToken)
          if (error) throw error
          if (!data.session) throw new errors_1.AuthSessionMissingError()
          await this._saveSession(data.session)
          await this._notifyAllSubscribers("TOKEN_REFRESHED", data.session)
          const result = { data: data.session, error: null }
          this.refreshingDeferred.resolve(result)
          return result
        } catch (error) {
          this._debug(debugName, "error", error)
          if ((0, errors_1.isAuthError)(error)) {
            const result = { data: null, error }
            if (!(0, errors_1.isAuthRetryableFetchError)(error)) {
              await this._removeSession()
            }
            ;(_a = this.refreshingDeferred) === null || _a === void 0 ? void 0 : _a.resolve(result)
            return result
          }
          ;(_b = this.refreshingDeferred) === null || _b === void 0 ? void 0 : _b.reject(error)
          throw error
        } finally {
          this.refreshingDeferred = null
          this._debug(debugName, "end")
        }
      }
      async _notifyAllSubscribers(event, session, broadcast = true) {
        const debugName = `#_notifyAllSubscribers(${event})`
        this._debug(debugName, "begin", session, `broadcast = ${broadcast}`)
        try {
          if (this.broadcastChannel && broadcast) {
            this.broadcastChannel.postMessage({ event, session })
          }
          const errors = []
          const promises = Array.from(this.stateChangeEmitters.values()).map(async (x) => {
            try {
              await x.callback(event, session)
            } catch (e) {
              errors.push(e)
            }
          })
          await Promise.all(promises)
          if (errors.length > 0) {
            for (let i = 0; i < errors.length; i += 1) {
              console.error(errors[i])
            }
            throw errors[0]
          }
        } finally {
          this._debug(debugName, "end")
        }
      }
      /**
       * set currentSession and currentUser
       * process to _startAutoRefreshToken if possible
       */
      async _saveSession(session) {
        this._debug("#_saveSession()", session)
        this.suppressGetSessionWarning = true
        await (0, helpers_1.removeItemAsync)(this.storage, `${this.storageKey}-code-verifier`)
        const sessionToProcess = Object.assign({}, session)
        const userIsProxy =
          sessionToProcess.user && sessionToProcess.user.__isUserNotAvailableProxy === true
        if (this.userStorage) {
          if (!userIsProxy && sessionToProcess.user) {
            await (0, helpers_1.setItemAsync)(this.userStorage, this.storageKey + "-user", {
              user: sessionToProcess.user,
            })
          } else if (userIsProxy) {
          }
          const mainSessionData = Object.assign({}, sessionToProcess)
          delete mainSessionData.user
          const clonedMainSessionData = (0, helpers_1.deepClone)(mainSessionData)
          await (0, helpers_1.setItemAsync)(this.storage, this.storageKey, clonedMainSessionData)
        } else {
          const clonedSession = (0, helpers_1.deepClone)(sessionToProcess)
          await (0, helpers_1.setItemAsync)(this.storage, this.storageKey, clonedSession)
        }
      }
      async _removeSession() {
        this._debug("#_removeSession()")
        this.suppressGetSessionWarning = false
        await (0, helpers_1.removeItemAsync)(this.storage, this.storageKey)
        await (0, helpers_1.removeItemAsync)(this.storage, this.storageKey + "-code-verifier")
        await (0, helpers_1.removeItemAsync)(this.storage, this.storageKey + "-user")
        if (this.userStorage) {
          await (0, helpers_1.removeItemAsync)(this.userStorage, this.storageKey + "-user")
        }
        await this._notifyAllSubscribers("SIGNED_OUT", null)
      }
      /**
       * Removes any registered visibilitychange callback.
       *
       * {@see #startAutoRefresh}
       * {@see #stopAutoRefresh}
       */
      _removeVisibilityChangedCallback() {
        this._debug("#_removeVisibilityChangedCallback()")
        const callback = this.visibilityChangedCallback
        this.visibilityChangedCallback = null
        try {
          if (
            callback &&
            (0, helpers_1.isBrowser)() &&
            (window === null || window === void 0 ? void 0 : window.removeEventListener)
          ) {
            window.removeEventListener("visibilitychange", callback)
          }
        } catch (e) {
          console.error("removing visibilitychange callback failed", e)
        }
      }
      /**
       * This is the private implementation of {@link #startAutoRefresh}. Use this
       * within the library.
       */
      async _startAutoRefresh() {
        await this._stopAutoRefresh()
        this._debug("#_startAutoRefresh()")
        const ticker = setInterval(
          () => this._autoRefreshTokenTick(),
          constants_1.AUTO_REFRESH_TICK_DURATION_MS
        )
        this.autoRefreshTicker = ticker
        if (ticker && typeof ticker === "object" && typeof ticker.unref === "function") {
          ticker.unref()
        } else if (typeof Deno !== "undefined" && typeof Deno.unrefTimer === "function") {
          Deno.unrefTimer(ticker)
        }
        setTimeout(async () => {
          await this.initializePromise
          await this._autoRefreshTokenTick()
        }, 0)
      }
      /**
       * This is the private implementation of {@link #stopAutoRefresh}. Use this
       * within the library.
       */
      async _stopAutoRefresh() {
        this._debug("#_stopAutoRefresh()")
        const ticker = this.autoRefreshTicker
        this.autoRefreshTicker = null
        if (ticker) {
          clearInterval(ticker)
        }
      }
      /**
       * Starts an auto-refresh process in the background. The session is checked
       * every few seconds. Close to the time of expiration a process is started to
       * refresh the session. If refreshing fails it will be retried for as long as
       * necessary.
       *
       * If you set the {@link GoTrueClientOptions#autoRefreshToken} you don't need
       * to call this function, it will be called for you.
       *
       * On browsers the refresh process works only when the tab/window is in the
       * foreground to conserve resources as well as prevent race conditions and
       * flooding auth with requests. If you call this method any managed
       * visibility change callback will be removed and you must manage visibility
       * changes on your own.
       *
       * On non-browser platforms the refresh process works *continuously* in the
       * background, which may not be desirable. You should hook into your
       * platform's foreground indication mechanism and call these methods
       * appropriately to conserve resources.
       *
       * {@see #stopAutoRefresh}
       */
      async startAutoRefresh() {
        this._removeVisibilityChangedCallback()
        await this._startAutoRefresh()
      }
      /**
       * Stops an active auto refresh process running in the background (if any).
       *
       * If you call this method any managed visibility change callback will be
       * removed and you must manage visibility changes on your own.
       *
       * See {@link #startAutoRefresh} for more details.
       */
      async stopAutoRefresh() {
        this._removeVisibilityChangedCallback()
        await this._stopAutoRefresh()
      }
      /**
       * Runs the auto refresh token tick.
       */
      async _autoRefreshTokenTick() {
        this._debug("#_autoRefreshTokenTick()", "begin")
        try {
          await this._acquireLock(0, async () => {
            try {
              const now = Date.now()
              try {
                return await this._useSession(async (result) => {
                  const {
                    data: { session },
                  } = result
                  if (!session || !session.refresh_token || !session.expires_at) {
                    this._debug("#_autoRefreshTokenTick()", "no session")
                    return
                  }
                  const expiresInTicks = Math.floor(
                    (session.expires_at * 1e3 - now) / constants_1.AUTO_REFRESH_TICK_DURATION_MS
                  )
                  this._debug(
                    "#_autoRefreshTokenTick()",
                    `access token expires in ${expiresInTicks} ticks, a tick lasts ${constants_1.AUTO_REFRESH_TICK_DURATION_MS}ms, refresh threshold is ${constants_1.AUTO_REFRESH_TICK_THRESHOLD} ticks`
                  )
                  if (expiresInTicks <= constants_1.AUTO_REFRESH_TICK_THRESHOLD) {
                    await this._callRefreshToken(session.refresh_token)
                  }
                })
              } catch (e) {
                console.error(
                  "Auto refresh tick failed with error. This is likely a transient error.",
                  e
                )
              }
            } finally {
              this._debug("#_autoRefreshTokenTick()", "end")
            }
          })
        } catch (e) {
          if (e.isAcquireTimeout || e instanceof locks_1.LockAcquireTimeoutError) {
            this._debug("auto refresh token tick lock not available")
          } else {
            throw e
          }
        }
      }
      /**
       * Registers callbacks on the browser / platform, which in-turn run
       * algorithms when the browser window/tab are in foreground. On non-browser
       * platforms it assumes always foreground.
       */
      async _handleVisibilityChange() {
        this._debug("#_handleVisibilityChange()")
        if (
          !(0, helpers_1.isBrowser)() ||
          !(window === null || window === void 0 ? void 0 : window.addEventListener)
        ) {
          if (this.autoRefreshToken) {
            this.startAutoRefresh()
          }
          return false
        }
        try {
          this.visibilityChangedCallback = async () => await this._onVisibilityChanged(false)
          window === null || window === void 0
            ? void 0
            : window.addEventListener("visibilitychange", this.visibilityChangedCallback)
          await this._onVisibilityChanged(true)
        } catch (error) {
          console.error("_handleVisibilityChange", error)
        }
      }
      /**
       * Callback registered with `window.addEventListener('visibilitychange')`.
       */
      async _onVisibilityChanged(calledFromInitialize) {
        const methodName = `#_onVisibilityChanged(${calledFromInitialize})`
        this._debug(methodName, "visibilityState", document.visibilityState)
        if (document.visibilityState === "visible") {
          if (this.autoRefreshToken) {
            this._startAutoRefresh()
          }
          if (!calledFromInitialize) {
            await this.initializePromise
            await this._acquireLock(-1, async () => {
              if (document.visibilityState !== "visible") {
                this._debug(
                  methodName,
                  "acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting"
                )
                return
              }
              await this._recoverAndRefresh()
            })
          }
        } else if (document.visibilityState === "hidden") {
          if (this.autoRefreshToken) {
            this._stopAutoRefresh()
          }
        }
      }
      /**
       * Generates the relevant login URL for a third-party provider.
       * @param options.redirectTo A URL or mobile address to send the user to after they are confirmed.
       * @param options.scopes A space-separated list of scopes granted to the OAuth application.
       * @param options.queryParams An object of key-value pairs containing query parameters granted to the OAuth application.
       */
      async _getUrlForProvider(url, provider, options) {
        const urlParams = [`provider=${encodeURIComponent(provider)}`]
        if (options === null || options === void 0 ? void 0 : options.redirectTo) {
          urlParams.push(`redirect_to=${encodeURIComponent(options.redirectTo)}`)
        }
        if (options === null || options === void 0 ? void 0 : options.scopes) {
          urlParams.push(`scopes=${encodeURIComponent(options.scopes)}`)
        }
        if (this.flowType === "pkce") {
          const [codeChallenge, codeChallengeMethod] = await (0,
          helpers_1.getCodeChallengeAndMethod)(this.storage, this.storageKey)
          const flowParams = new URLSearchParams({
            code_challenge: `${encodeURIComponent(codeChallenge)}`,
            code_challenge_method: `${encodeURIComponent(codeChallengeMethod)}`,
          })
          urlParams.push(flowParams.toString())
        }
        if (options === null || options === void 0 ? void 0 : options.queryParams) {
          const query = new URLSearchParams(options.queryParams)
          urlParams.push(query.toString())
        }
        if (options === null || options === void 0 ? void 0 : options.skipBrowserRedirect) {
          urlParams.push(`skip_http_redirect=${options.skipBrowserRedirect}`)
        }
        return `${url}?${urlParams.join("&")}`
      }
      async _unenroll(params) {
        try {
          return await this._useSession(async (result) => {
            var _a
            const { data: sessionData, error: sessionError } = result
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError })
            }
            return await (0, fetch_1._request)(
              this.fetch,
              "DELETE",
              `${this.url}/factors/${params.factorId}`,
              {
                headers: this.headers,
                jwt:
                  (_a =
                    sessionData === null || sessionData === void 0
                      ? void 0
                      : sessionData.session) === null || _a === void 0
                    ? void 0
                    : _a.access_token,
              }
            )
          })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error })
          }
          throw error
        }
      }
      async _enroll(params) {
        try {
          return await this._useSession(async (result) => {
            var _a, _b
            const { data: sessionData, error: sessionError } = result
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError })
            }
            const body = Object.assign(
              { friendly_name: params.friendlyName, factor_type: params.factorType },
              params.factorType === "phone"
                ? { phone: params.phone }
                : params.factorType === "totp"
                  ? { issuer: params.issuer }
                  : {}
            )
            const { data, error } = await (0, fetch_1._request)(
              this.fetch,
              "POST",
              `${this.url}/factors`,
              {
                body,
                headers: this.headers,
                jwt:
                  (_a =
                    sessionData === null || sessionData === void 0
                      ? void 0
                      : sessionData.session) === null || _a === void 0
                    ? void 0
                    : _a.access_token,
              }
            )
            if (error) {
              return this._returnResult({ data: null, error })
            }
            if (
              params.factorType === "totp" &&
              data.type === "totp" &&
              ((_b = data === null || data === void 0 ? void 0 : data.totp) === null ||
              _b === void 0
                ? void 0
                : _b.qr_code)
            ) {
              data.totp.qr_code = `data:image/svg+xml;utf-8,${data.totp.qr_code}`
            }
            return this._returnResult({ data, error: null })
          })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error })
          }
          throw error
        }
      }
      async _verify(params) {
        return this._acquireLock(-1, async () => {
          try {
            return await this._useSession(async (result) => {
              var _a
              const { data: sessionData, error: sessionError } = result
              if (sessionError) {
                return this._returnResult({ data: null, error: sessionError })
              }
              const body = Object.assign(
                { challenge_id: params.challengeId },
                "webauthn" in params
                  ? {
                      webauthn: Object.assign(Object.assign({}, params.webauthn), {
                        credential_response:
                          params.webauthn.type === "create"
                            ? (0, webauthn_1.serializeCredentialCreationResponse)(
                                params.webauthn.credential_response
                              )
                            : (0, webauthn_1.serializeCredentialRequestResponse)(
                                params.webauthn.credential_response
                              ),
                      }),
                    }
                  : { code: params.code }
              )
              const { data, error } = await (0, fetch_1._request)(
                this.fetch,
                "POST",
                `${this.url}/factors/${params.factorId}/verify`,
                {
                  body,
                  headers: this.headers,
                  jwt:
                    (_a =
                      sessionData === null || sessionData === void 0
                        ? void 0
                        : sessionData.session) === null || _a === void 0
                      ? void 0
                      : _a.access_token,
                }
              )
              if (error) {
                return this._returnResult({ data: null, error })
              }
              await this._saveSession(
                Object.assign({ expires_at: Math.round(Date.now() / 1e3) + data.expires_in }, data)
              )
              await this._notifyAllSubscribers("MFA_CHALLENGE_VERIFIED", data)
              return this._returnResult({ data, error })
            })
          } catch (error) {
            if ((0, errors_1.isAuthError)(error)) {
              return this._returnResult({ data: null, error })
            }
            throw error
          }
        })
      }
      async _challenge(params) {
        return this._acquireLock(-1, async () => {
          try {
            return await this._useSession(async (result) => {
              var _a
              const { data: sessionData, error: sessionError } = result
              if (sessionError) {
                return this._returnResult({ data: null, error: sessionError })
              }
              const response = await (0, fetch_1._request)(
                this.fetch,
                "POST",
                `${this.url}/factors/${params.factorId}/challenge`,
                {
                  body: params,
                  headers: this.headers,
                  jwt:
                    (_a =
                      sessionData === null || sessionData === void 0
                        ? void 0
                        : sessionData.session) === null || _a === void 0
                      ? void 0
                      : _a.access_token,
                }
              )
              if (response.error) {
                return response
              }
              const { data } = response
              if (data.type !== "webauthn") {
                return { data, error: null }
              }
              switch (data.webauthn.type) {
                case "create":
                  return {
                    data: Object.assign(Object.assign({}, data), {
                      webauthn: Object.assign(Object.assign({}, data.webauthn), {
                        credential_options: Object.assign(
                          Object.assign({}, data.webauthn.credential_options),
                          {
                            publicKey: (0, webauthn_1.deserializeCredentialCreationOptions)(
                              data.webauthn.credential_options.publicKey
                            ),
                          }
                        ),
                      }),
                    }),
                    error: null,
                  }
                case "request":
                  return {
                    data: Object.assign(Object.assign({}, data), {
                      webauthn: Object.assign(Object.assign({}, data.webauthn), {
                        credential_options: Object.assign(
                          Object.assign({}, data.webauthn.credential_options),
                          {
                            publicKey: (0, webauthn_1.deserializeCredentialRequestOptions)(
                              data.webauthn.credential_options.publicKey
                            ),
                          }
                        ),
                      }),
                    }),
                    error: null,
                  }
              }
            })
          } catch (error) {
            if ((0, errors_1.isAuthError)(error)) {
              return this._returnResult({ data: null, error })
            }
            throw error
          }
        })
      }
      /**
       * {@see GoTrueMFAApi#challengeAndVerify}
       */
      async _challengeAndVerify(params) {
        const { data: challengeData, error: challengeError } = await this._challenge({
          factorId: params.factorId,
        })
        if (challengeError) {
          return this._returnResult({ data: null, error: challengeError })
        }
        return await this._verify({
          factorId: params.factorId,
          challengeId: challengeData.id,
          code: params.code,
        })
      }
      /**
       * {@see GoTrueMFAApi#listFactors}
       */
      async _listFactors() {
        var _a
        const {
          data: { user },
          error: userError,
        } = await this.getUser()
        if (userError) {
          return { data: null, error: userError }
        }
        const data = {
          all: [],
          phone: [],
          totp: [],
          webauthn: [],
        }
        for (const factor of (_a = user === null || user === void 0 ? void 0 : user.factors) !==
          null && _a !== void 0
          ? _a
          : []) {
          data.all.push(factor)
          if (factor.status === "verified") {
            data[factor.factor_type].push(factor)
          }
        }
        return {
          data,
          error: null,
        }
      }
      /**
       * {@see GoTrueMFAApi#getAuthenticatorAssuranceLevel}
       */
      async _getAuthenticatorAssuranceLevel() {
        var _a, _b
        const {
          data: { session },
          error: sessionError,
        } = await this.getSession()
        if (sessionError) {
          return this._returnResult({ data: null, error: sessionError })
        }
        if (!session) {
          return {
            data: { currentLevel: null, nextLevel: null, currentAuthenticationMethods: [] },
            error: null,
          }
        }
        const { payload } = (0, helpers_1.decodeJWT)(session.access_token)
        let currentLevel = null
        if (payload.aal) {
          currentLevel = payload.aal
        }
        let nextLevel = currentLevel
        const verifiedFactors =
          (_b =
            (_a = session.user.factors) === null || _a === void 0
              ? void 0
              : _a.filter((factor) => factor.status === "verified")) !== null && _b !== void 0
            ? _b
            : []
        if (verifiedFactors.length > 0) {
          nextLevel = "aal2"
        }
        const currentAuthenticationMethods = payload.amr || []
        return { data: { currentLevel, nextLevel, currentAuthenticationMethods }, error: null }
      }
      /**
       * Retrieves details about an OAuth authorization request.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       *
       * Returns authorization details including client info, scopes, and user information.
       * If the API returns a redirect_uri, it means consent was already given - the caller
       * should handle the redirect manually if needed.
       */
      async _getAuthorizationDetails(authorizationId) {
        try {
          return await this._useSession(async (result) => {
            const {
              data: { session },
              error: sessionError,
            } = result
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError })
            }
            if (!session) {
              return this._returnResult({
                data: null,
                error: new errors_1.AuthSessionMissingError(),
              })
            }
            return await (0, fetch_1._request)(
              this.fetch,
              "GET",
              `${this.url}/oauth/authorizations/${authorizationId}`,
              {
                headers: this.headers,
                jwt: session.access_token,
                xform: (data) => ({ data, error: null }),
              }
            )
          })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error })
          }
          throw error
        }
      }
      /**
       * Approves an OAuth authorization request.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       */
      async _approveAuthorization(authorizationId, options) {
        try {
          return await this._useSession(async (result) => {
            const {
              data: { session },
              error: sessionError,
            } = result
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError })
            }
            if (!session) {
              return this._returnResult({
                data: null,
                error: new errors_1.AuthSessionMissingError(),
              })
            }
            const response = await (0, fetch_1._request)(
              this.fetch,
              "POST",
              `${this.url}/oauth/authorizations/${authorizationId}/consent`,
              {
                headers: this.headers,
                jwt: session.access_token,
                body: { action: "approve" },
                xform: (data) => ({ data, error: null }),
              }
            )
            if (response.data && response.data.redirect_url) {
              if (
                (0, helpers_1.isBrowser)() &&
                !(options === null || options === void 0 ? void 0 : options.skipBrowserRedirect)
              ) {
                window.location.assign(response.data.redirect_url)
              }
            }
            return response
          })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error })
          }
          throw error
        }
      }
      /**
       * Denies an OAuth authorization request.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       */
      async _denyAuthorization(authorizationId, options) {
        try {
          return await this._useSession(async (result) => {
            const {
              data: { session },
              error: sessionError,
            } = result
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError })
            }
            if (!session) {
              return this._returnResult({
                data: null,
                error: new errors_1.AuthSessionMissingError(),
              })
            }
            const response = await (0, fetch_1._request)(
              this.fetch,
              "POST",
              `${this.url}/oauth/authorizations/${authorizationId}/consent`,
              {
                headers: this.headers,
                jwt: session.access_token,
                body: { action: "deny" },
                xform: (data) => ({ data, error: null }),
              }
            )
            if (response.data && response.data.redirect_url) {
              if (
                (0, helpers_1.isBrowser)() &&
                !(options === null || options === void 0 ? void 0 : options.skipBrowserRedirect)
              ) {
                window.location.assign(response.data.redirect_url)
              }
            }
            return response
          })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error })
          }
          throw error
        }
      }
      /**
       * Lists all OAuth grants that the authenticated user has authorized.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       */
      async _listOAuthGrants() {
        try {
          return await this._useSession(async (result) => {
            const {
              data: { session },
              error: sessionError,
            } = result
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError })
            }
            if (!session) {
              return this._returnResult({
                data: null,
                error: new errors_1.AuthSessionMissingError(),
              })
            }
            return await (0, fetch_1._request)(this.fetch, "GET", `${this.url}/user/oauth/grants`, {
              headers: this.headers,
              jwt: session.access_token,
              xform: (data) => ({ data, error: null }),
            })
          })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error })
          }
          throw error
        }
      }
      /**
       * Revokes a user's OAuth grant for a specific client.
       * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
       */
      async _revokeOAuthGrant(options) {
        try {
          return await this._useSession(async (result) => {
            const {
              data: { session },
              error: sessionError,
            } = result
            if (sessionError) {
              return this._returnResult({ data: null, error: sessionError })
            }
            if (!session) {
              return this._returnResult({
                data: null,
                error: new errors_1.AuthSessionMissingError(),
              })
            }
            await (0, fetch_1._request)(this.fetch, "DELETE", `${this.url}/user/oauth/grants`, {
              headers: this.headers,
              jwt: session.access_token,
              query: { client_id: options.clientId },
              noResolveJson: true,
            })
            return { data: {}, error: null }
          })
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error })
          }
          throw error
        }
      }
      async fetchJwk(kid, jwks = { keys: [] }) {
        let jwk = jwks.keys.find((key) => key.kid === kid)
        if (jwk) {
          return jwk
        }
        const now = Date.now()
        jwk = this.jwks.keys.find((key) => key.kid === kid)
        if (jwk && this.jwks_cached_at + constants_1.JWKS_TTL > now) {
          return jwk
        }
        const { data, error } = await (0, fetch_1._request)(
          this.fetch,
          "GET",
          `${this.url}/.well-known/jwks.json`,
          {
            headers: this.headers,
          }
        )
        if (error) {
          throw error
        }
        if (!data.keys || data.keys.length === 0) {
          return null
        }
        this.jwks = data
        this.jwks_cached_at = now
        jwk = data.keys.find((key) => key.kid === kid)
        if (!jwk) {
          return null
        }
        return jwk
      }
      /**
       * Extracts the JWT claims present in the access token by first verifying the
       * JWT against the server's JSON Web Key Set endpoint
       * `/.well-known/jwks.json` which is often cached, resulting in significantly
       * faster responses. Prefer this method over {@link #getUser} which always
       * sends a request to the Auth server for each JWT.
       *
       * If the project is not using an asymmetric JWT signing key (like ECC or
       * RSA) it always sends a request to the Auth server (similar to {@link
       * #getUser}) to verify the JWT.
       *
       * @param jwt An optional specific JWT you wish to verify, not the one you
       *            can obtain from {@link #getSession}.
       * @param options Various additional options that allow you to customize the
       *                behavior of this method.
       */
      async getClaims(jwt, options = {}) {
        try {
          let token = jwt
          if (!token) {
            const { data, error } = await this.getSession()
            if (error || !data.session) {
              return this._returnResult({ data: null, error })
            }
            token = data.session.access_token
          }
          const {
            header,
            payload,
            signature,
            raw: { header: rawHeader, payload: rawPayload },
          } = (0, helpers_1.decodeJWT)(token)
          if (!(options === null || options === void 0 ? void 0 : options.allowExpired)) {
            ;(0, helpers_1.validateExp)(payload.exp)
          }
          const signingKey =
            !header.alg ||
            header.alg.startsWith("HS") ||
            !header.kid ||
            !("crypto" in globalThis && "subtle" in globalThis.crypto)
              ? null
              : await this.fetchJwk(
                  header.kid,
                  (options === null || options === void 0 ? void 0 : options.keys)
                    ? { keys: options.keys }
                    : options === null || options === void 0
                      ? void 0
                      : options.jwks
                )
          if (!signingKey) {
            const { error } = await this.getUser(token)
            if (error) {
              throw error
            }
            return {
              data: {
                claims: payload,
                header,
                signature,
              },
              error: null,
            }
          }
          const algorithm = (0, helpers_1.getAlgorithm)(header.alg)
          const publicKey = await crypto.subtle.importKey("jwk", signingKey, algorithm, true, [
            "verify",
          ])
          const isValid = await crypto.subtle.verify(
            algorithm,
            publicKey,
            signature,
            (0, base64url_1.stringToUint8Array)(`${rawHeader}.${rawPayload}`)
          )
          if (!isValid) {
            throw new errors_1.AuthInvalidJwtError("Invalid JWT signature")
          }
          return {
            data: {
              claims: payload,
              header,
              signature,
            },
            error: null,
          }
        } catch (error) {
          if ((0, errors_1.isAuthError)(error)) {
            return this._returnResult({ data: null, error })
          }
          throw error
        }
      }
    }
    GoTrueClient.nextInstanceID = {}
    exports.default = GoTrueClient
  },
})

// node_modules/@supabase/auth-js/dist/main/AuthAdminApi.js
var require_AuthAdminApi = __commonJS({
  "node_modules/@supabase/auth-js/dist/main/AuthAdminApi.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports))
    var GoTrueAdminApi_1 = tslib_1.__importDefault(require_GoTrueAdminApi())
    var AuthAdminApi = GoTrueAdminApi_1.default
    exports.default = AuthAdminApi
  },
})

// node_modules/@supabase/auth-js/dist/main/AuthClient.js
var require_AuthClient = __commonJS({
  "node_modules/@supabase/auth-js/dist/main/AuthClient.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports))
    var GoTrueClient_1 = tslib_1.__importDefault(require_GoTrueClient())
    var AuthClient2 = GoTrueClient_1.default
    exports.default = AuthClient2
  },
})

// node_modules/@supabase/auth-js/dist/main/index.js
var require_main3 = __commonJS({
  "node_modules/@supabase/auth-js/dist/main/index.js"(exports) {
    "use strict"
    Object.defineProperty(exports, "__esModule", { value: true })
    exports.processLock =
      exports.lockInternals =
      exports.NavigatorLockAcquireTimeoutError =
      exports.navigatorLock =
      exports.AuthClient =
      exports.AuthAdminApi =
      exports.GoTrueClient =
      exports.GoTrueAdminApi =
        void 0
    var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports))
    var GoTrueAdminApi_1 = tslib_1.__importDefault(require_GoTrueAdminApi())
    exports.GoTrueAdminApi = GoTrueAdminApi_1.default
    var GoTrueClient_1 = tslib_1.__importDefault(require_GoTrueClient())
    exports.GoTrueClient = GoTrueClient_1.default
    var AuthAdminApi_1 = tslib_1.__importDefault(require_AuthAdminApi())
    exports.AuthAdminApi = AuthAdminApi_1.default
    var AuthClient_1 = tslib_1.__importDefault(require_AuthClient())
    exports.AuthClient = AuthClient_1.default
    tslib_1.__exportStar(require_types2(), exports)
    tslib_1.__exportStar(require_errors(), exports)
    var locks_1 = require_locks()
    Object.defineProperty(exports, "navigatorLock", {
      enumerable: true,
      get: function () {
        return locks_1.navigatorLock
      },
    })
    Object.defineProperty(exports, "NavigatorLockAcquireTimeoutError", {
      enumerable: true,
      get: function () {
        return locks_1.NavigatorLockAcquireTimeoutError
      },
    })
    Object.defineProperty(exports, "lockInternals", {
      enumerable: true,
      get: function () {
        return locks_1.internals
      },
    })
    Object.defineProperty(exports, "processLock", {
      enumerable: true,
      get: function () {
        return locks_1.processLock
      },
    })
  },
})

// node_modules/@upstash/core-analytics/dist/index.js
var require_dist = __commonJS({
  "node_modules/@upstash/core-analytics/dist/index.js"(exports, module) {
    "use strict"
    var g = Object.defineProperty
    var k = Object.getOwnPropertyDescriptor
    var _ = Object.getOwnPropertyNames
    var y = Object.prototype.hasOwnProperty
    var w = (l, e) => {
      for (var t in e) g(l, t, { get: e[t], enumerable: true })
    }
    var A = (l, e, t, i) => {
      if ((e && typeof e == "object") || typeof e == "function")
        for (let s of _(e))
          !y.call(l, s) &&
            s !== t &&
            g(l, s, { get: () => e[s], enumerable: !(i = k(e, s)) || i.enumerable })
      return l
    }
    var x = (l) => A(g({}, "__esModule", { value: true }), l)
    var S = {}
    w(S, { Analytics: () => b })
    module.exports = x(S)
    var p = `
local key = KEYS[1]
local field = ARGV[1]

local data = redis.call("ZRANGE", key, 0, -1, "WITHSCORES")
local count = {}

for i = 1, #data, 2 do
  local json_str = data[i]
  local score = tonumber(data[i + 1])
  local obj = cjson.decode(json_str)

  local fieldValue = obj[field]

  if count[fieldValue] == nil then
    count[fieldValue] = score
  else
    count[fieldValue] = count[fieldValue] + score
  end
end

local result = {}
for k, v in pairs(count) do
  table.insert(result, {k, v})
end

return result
`
    var f = `
local prefix = KEYS[1]
local first_timestamp = tonumber(ARGV[1]) -- First timestamp to check
local increment = tonumber(ARGV[2])       -- Increment between each timestamp
local num_timestamps = tonumber(ARGV[3])  -- Number of timestampts to check (24 for a day and 24 * 7 for a week)
local num_elements = tonumber(ARGV[4])    -- Number of elements to fetch in each category
local check_at_most = tonumber(ARGV[5])   -- Number of elements to check at most.

local keys = {}
for i = 1, num_timestamps do
  local timestamp = first_timestamp - (i - 1) * increment
  table.insert(keys, prefix .. ":" .. timestamp)
end

-- get the union of the groups
local zunion_params = {"ZUNION", num_timestamps, unpack(keys)}
table.insert(zunion_params, "WITHSCORES")
local result = redis.call(unpack(zunion_params))

-- select num_elements many items
local true_group = {}
local false_group = {}
local denied_group = {}
local true_count = 0
local false_count = 0
local denied_count = 0
local i = #result - 1

-- index to stop at after going through "checkAtMost" many items:
local cutoff_index = #result - 2 * check_at_most

-- iterate over the results
while (true_count + false_count + denied_count) < (num_elements * 3) and 1 <= i and i >= cutoff_index do
  local score = tonumber(result[i + 1])
  if score > 0 then
    local element = result[i]
    if string.find(element, "success\\":true") and true_count < num_elements then
      table.insert(true_group, {score, element})
      true_count = true_count + 1
    elseif string.find(element, "success\\":false") and false_count < num_elements then
      table.insert(false_group, {score, element})
      false_count = false_count + 1
    elseif string.find(element, "success\\":\\"denied") and denied_count < num_elements then
      table.insert(denied_group, {score, element})
      denied_count = denied_count + 1
    end
  end
  i = i - 2
end

return {true_group, false_group, denied_group}
`
    var h = `
local prefix = KEYS[1]
local first_timestamp = tonumber(ARGV[1])
local increment = tonumber(ARGV[2])
local num_timestamps = tonumber(ARGV[3])

local keys = {}
for i = 1, num_timestamps do
  local timestamp = first_timestamp - (i - 1) * increment
  table.insert(keys, prefix .. ":" .. timestamp)
end

-- get the union of the groups
local zunion_params = {"ZUNION", num_timestamps, unpack(keys)}
table.insert(zunion_params, "WITHSCORES")
local result = redis.call(unpack(zunion_params))

return result
`
    var b = class {
      redis
      prefix
      bucketSize
      constructor(e) {
        ;((this.redis = e.redis),
          (this.prefix = e.prefix ?? "@upstash/analytics"),
          (this.bucketSize = this.parseWindow(e.window)))
      }
      validateTableName(e) {
        if (!/^[a-zA-Z0-9_-]+$/.test(e))
          throw new Error(
            `Invalid table name: ${e}. Table names can only contain letters, numbers, dashes and underscores.`
          )
      }
      parseWindow(e) {
        if (typeof e == "number") {
          if (e <= 0) throw new Error(`Invalid window: ${e}`)
          return e
        }
        let t = /^(\d+)([smhd])$/
        if (!t.test(e)) throw new Error(`Invalid window: ${e}`)
        let [, i, s] = e.match(t),
          n = parseInt(i)
        switch (s) {
          case "s":
            return n * 1e3
          case "m":
            return n * 1e3 * 60
          case "h":
            return n * 1e3 * 60 * 60
          case "d":
            return n * 1e3 * 60 * 60 * 24
          default:
            throw new Error(`Invalid window unit: ${s}`)
        }
      }
      getBucket(e) {
        let t = e ?? Date.now()
        return Math.floor(t / this.bucketSize) * this.bucketSize
      }
      async ingest(e, ...t) {
        ;(this.validateTableName(e),
          await Promise.all(
            t.map(async (i) => {
              let s = this.getBucket(i.time),
                n = [this.prefix, e, s].join(":")
              await this.redis.zincrby(n, 1, JSON.stringify({ ...i, time: void 0 }))
            })
          ))
      }
      formatBucketAggregate(e, t, i) {
        let s = {}
        return (
          e.forEach(([n, r]) => {
            ;(t == "success" && (n = n === 1 ? "true" : n === null ? "false" : n),
              (s[t] = s[t] || {}),
              (s[t][(n ?? "null").toString()] = r))
          }),
          { time: i, ...s }
        )
      }
      async aggregateBucket(e, t, i) {
        this.validateTableName(e)
        let s = this.getBucket(i),
          n = [this.prefix, e, s].join(":"),
          r = await this.redis.eval(p, [n], [t])
        return this.formatBucketAggregate(r, t, s)
      }
      async aggregateBuckets(e, t, i, s) {
        this.validateTableName(e)
        let n = this.getBucket(s),
          r = []
        for (let o = 0; o < i; o += 1)
          (r.push(this.aggregateBucket(e, t, n)), (n = n - this.bucketSize))
        return Promise.all(r)
      }
      async aggregateBucketsWithPipeline(e, t, i, s, n) {
        ;(this.validateTableName(e), (n = n ?? 48))
        let r = this.getBucket(s),
          o = [],
          c = this.redis.pipeline(),
          u = []
        for (let a = 1; a <= i; a += 1) {
          let d = [this.prefix, e, r].join(":")
          ;(c.eval(p, [d], [t]),
            o.push(r),
            (r = r - this.bucketSize),
            (a % n == 0 || a == i) && (u.push(c.exec()), (c = this.redis.pipeline())))
        }
        return (await Promise.all(u)).flat().map((a, d) => this.formatBucketAggregate(a, t, o[d]))
      }
      async getAllowedBlocked(e, t, i) {
        this.validateTableName(e)
        let s = [this.prefix, e].join(":"),
          n = this.getBucket(i),
          r = await this.redis.eval(h, [s], [n, this.bucketSize, t]),
          o = {}
        for (let c = 0; c < r.length; c += 2) {
          let u = r[c],
            m = u.identifier,
            a = +r[c + 1]
          ;(o[m] || (o[m] = { success: 0, blocked: 0 }),
            (o[m][u.success ? "success" : "blocked"] = a))
        }
        return o
      }
      async getMostAllowedBlocked(e, t, i, s, n) {
        this.validateTableName(e)
        let r = [this.prefix, e].join(":"),
          o = this.getBucket(s),
          c = n ?? i * 5,
          [u, m, a] = await this.redis.eval(f, [r], [o, this.bucketSize, t, i, c])
        return { allowed: this.toDicts(u), ratelimited: this.toDicts(m), denied: this.toDicts(a) }
      }
      toDicts(e) {
        let t = []
        for (let i = 0; i < e.length; i += 1) {
          let s = +e[i][0],
            n = e[i][1]
          t.push({ identifier: n.identifier, count: s })
        }
        return t
      }
    }
  },
})

// node_modules/@upstash/ratelimit/dist/index.js
var require_dist2 = __commonJS({
  "node_modules/@upstash/ratelimit/dist/index.js"(exports, module) {
    "use strict"
    var __defProp3 = Object.defineProperty
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor
    var __getOwnPropNames2 = Object.getOwnPropertyNames
    var __hasOwnProp2 = Object.prototype.hasOwnProperty
    var __export3 = (target, all) => {
      for (var name in all) __defProp3(target, name, { get: all[name], enumerable: true })
    }
    var __copyProps2 = (to, from, except, desc) => {
      if ((from && typeof from === "object") || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp3(to, key, {
              get: () => from[key],
              enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable,
            })
      }
      return to
    }
    var __toCommonJS2 = (mod) => __copyProps2(__defProp3({}, "__esModule", { value: true }), mod)
    var src_exports = {}
    __export3(src_exports, {
      Analytics: () => Analytics2,
      IpDenyList: () => ip_deny_list_exports,
      MultiRegionRatelimit: () => MultiRegionRatelimit,
      Ratelimit: () => RegionRatelimit,
    })
    module.exports = __toCommonJS2(src_exports)
    var import_core_analytics = require_dist()
    var Analytics2 = class {
      analytics
      table = "events"
      constructor(config) {
        this.analytics = new import_core_analytics.Analytics({
          // @ts-expect-error we need to fix the types in core-analytics, it should only require the methods it needs, not the whole sdk
          redis: config.redis,
          window: "1h",
          prefix: config.prefix ?? "@upstash/ratelimit",
          retention: "90d",
        })
      }
      /**
       * Try to extract the geo information from the request
       *
       * This handles Vercel's `req.geo` and  and Cloudflare's `request.cf` properties
       * @param req
       * @returns
       */
      extractGeo(req) {
        if (req.geo !== void 0) {
          return req.geo
        }
        if (req.cf !== void 0) {
          return req.cf
        }
        return {}
      }
      async record(event) {
        await this.analytics.ingest(this.table, event)
      }
      async series(filter, cutoff) {
        const timestampCount = Math.min(
          (this.analytics.getBucket(Date.now()) - this.analytics.getBucket(cutoff)) /
            (60 * 60 * 1e3),
          256
        )
        return this.analytics.aggregateBucketsWithPipeline(this.table, filter, timestampCount)
      }
      async getUsage(cutoff = 0) {
        const timestampCount = Math.min(
          (this.analytics.getBucket(Date.now()) - this.analytics.getBucket(cutoff)) /
            (60 * 60 * 1e3),
          256
        )
        const records = await this.analytics.getAllowedBlocked(this.table, timestampCount)
        return records
      }
      async getUsageOverTime(timestampCount, groupby) {
        const result = await this.analytics.aggregateBucketsWithPipeline(
          this.table,
          groupby,
          timestampCount
        )
        return result
      }
      async getMostAllowedBlocked(timestampCount, getTop, checkAtMost) {
        getTop = getTop ?? 5
        const timestamp = void 0
        return this.analytics.getMostAllowedBlocked(
          this.table,
          timestampCount,
          getTop,
          timestamp,
          checkAtMost
        )
      }
    }
    var Cache = class {
      /**
       * Stores identifier -> reset (in milliseconds)
       */
      cache
      constructor(cache) {
        this.cache = cache
      }
      isBlocked(identifier) {
        if (!this.cache.has(identifier)) {
          return { blocked: false, reset: 0 }
        }
        const reset = this.cache.get(identifier)
        if (reset < Date.now()) {
          this.cache.delete(identifier)
          return { blocked: false, reset: 0 }
        }
        return { blocked: true, reset }
      }
      blockUntil(identifier, reset) {
        this.cache.set(identifier, reset)
      }
      set(key, value) {
        this.cache.set(key, value)
      }
      get(key) {
        return this.cache.get(key) || null
      }
      incr(key, incrementAmount = 1) {
        let value = this.cache.get(key) ?? 0
        value += incrementAmount
        this.cache.set(key, value)
        return value
      }
      pop(key) {
        this.cache.delete(key)
      }
      empty() {
        this.cache.clear()
      }
      size() {
        return this.cache.size
      }
    }
    var DYNAMIC_LIMIT_KEY_SUFFIX = ":dynamic:global"
    var DEFAULT_PREFIX = "@upstash/ratelimit"
    function ms(d) {
      const match = d.match(/^(\d+)\s?(ms|s|m|h|d)$/)
      if (!match) {
        throw new Error(`Unable to parse window size: ${d}`)
      }
      const time = Number.parseInt(match[1])
      const unit = match[2]
      switch (unit) {
        case "ms": {
          return time
        }
        case "s": {
          return time * 1e3
        }
        case "m": {
          return time * 1e3 * 60
        }
        case "h": {
          return time * 1e3 * 60 * 60
        }
        case "d": {
          return time * 1e3 * 60 * 60 * 24
        }
        default: {
          throw new Error(`Unable to parse window size: ${d}`)
        }
      }
    }
    var safeEval = async (ctx, script, keys, args) => {
      try {
        return await ctx.redis.evalsha(script.hash, keys, args)
      } catch (error) {
        if (`${error}`.includes("NOSCRIPT")) {
          return await ctx.redis.eval(script.script, keys, args)
        }
        throw error
      }
    }
    var fixedWindowLimitScript = `
  local key           = KEYS[1]
  local dynamicLimitKey = KEYS[2]  -- optional: key for dynamic limit in redis
  local tokens        = tonumber(ARGV[1])  -- default limit
  local window        = ARGV[2]
  local incrementBy   = ARGV[3] -- increment rate per request at a given value, default is 1

  -- Check for dynamic limit
  local effectiveLimit = tokens
  if dynamicLimitKey ~= "" then
    local dynamicLimit = redis.call("GET", dynamicLimitKey)
    if dynamicLimit then
      effectiveLimit = tonumber(dynamicLimit)
    end
  end

  local r = redis.call("INCRBY", key, incrementBy)
  if r == tonumber(incrementBy) then
  -- The first time this key is set, the value will be equal to incrementBy.
  -- So we only need the expire command once
  redis.call("PEXPIRE", key, window)
  end

  return {r, effectiveLimit}
`
    var fixedWindowRemainingTokensScript = `
  local key = KEYS[1]
  local dynamicLimitKey = KEYS[2]  -- optional: key for dynamic limit in redis
  local tokens = tonumber(ARGV[1])  -- default limit

  -- Check for dynamic limit
  local effectiveLimit = tokens
  if dynamicLimitKey ~= "" then
    local dynamicLimit = redis.call("GET", dynamicLimitKey)
    if dynamicLimit then
      effectiveLimit = tonumber(dynamicLimit)
    end
  end

  local value = redis.call('GET', key)
  local usedTokens = 0
  if value then
    usedTokens = tonumber(value)
  end
  
  return {effectiveLimit - usedTokens, effectiveLimit}
`
    var slidingWindowLimitScript = `
  local currentKey  = KEYS[1]           -- identifier including prefixes
  local previousKey = KEYS[2]           -- key of the previous bucket
  local dynamicLimitKey = KEYS[3]       -- optional: key for dynamic limit in redis
  local tokens      = tonumber(ARGV[1]) -- default tokens per window
  local now         = ARGV[2]           -- current timestamp in milliseconds
  local window      = ARGV[3]           -- interval in milliseconds
  local incrementBy = tonumber(ARGV[4]) -- increment rate per request at a given value, default is 1

  -- Check for dynamic limit
  local effectiveLimit = tokens
  if dynamicLimitKey ~= "" then
    local dynamicLimit = redis.call("GET", dynamicLimitKey)
    if dynamicLimit then
      effectiveLimit = tonumber(dynamicLimit)
    end
  end

  local requestsInCurrentWindow = redis.call("GET", currentKey)
  if requestsInCurrentWindow == false then
    requestsInCurrentWindow = 0
  end

  local requestsInPreviousWindow = redis.call("GET", previousKey)
  if requestsInPreviousWindow == false then
    requestsInPreviousWindow = 0
  end
  local percentageInCurrent = ( now % window ) / window
  -- weighted requests to consider from the previous window
  requestsInPreviousWindow = math.floor(( 1 - percentageInCurrent ) * requestsInPreviousWindow)

  -- Only check limit if not refunding (negative rate)
  if incrementBy > 0 and requestsInPreviousWindow + requestsInCurrentWindow >= effectiveLimit then
    return {-1, effectiveLimit}
  end

  local newValue = redis.call("INCRBY", currentKey, incrementBy)
  if newValue == incrementBy then
    -- The first time this key is set, the value will be equal to incrementBy.
    -- So we only need the expire command once
    redis.call("PEXPIRE", currentKey, window * 2 + 1000) -- Enough time to overlap with a new window + 1 second
  end
  return {effectiveLimit - ( newValue + requestsInPreviousWindow ), effectiveLimit}
`
    var slidingWindowRemainingTokensScript = `
  local currentKey  = KEYS[1]           -- identifier including prefixes
  local previousKey = KEYS[2]           -- key of the previous bucket
  local dynamicLimitKey = KEYS[3]       -- optional: key for dynamic limit in redis
  local tokens      = tonumber(ARGV[1]) -- default tokens per window
  local now         = ARGV[2]           -- current timestamp in milliseconds
  local window      = ARGV[3]           -- interval in milliseconds

  -- Check for dynamic limit
  local effectiveLimit = tokens
  if dynamicLimitKey ~= "" then
    local dynamicLimit = redis.call("GET", dynamicLimitKey)
    if dynamicLimit then
      effectiveLimit = tonumber(dynamicLimit)
    end
  end

  local requestsInCurrentWindow = redis.call("GET", currentKey)
  if requestsInCurrentWindow == false then
    requestsInCurrentWindow = 0
  end

  local requestsInPreviousWindow = redis.call("GET", previousKey)
  if requestsInPreviousWindow == false then
    requestsInPreviousWindow = 0
  end

  local percentageInCurrent = ( now % window ) / window
  -- weighted requests to consider from the previous window
  requestsInPreviousWindow = math.floor(( 1 - percentageInCurrent ) * requestsInPreviousWindow)

  local usedTokens = requestsInPreviousWindow + requestsInCurrentWindow
  return {effectiveLimit - usedTokens, effectiveLimit}
`
    var tokenBucketLimitScript = `
  local key         = KEYS[1]           -- identifier including prefixes
  local dynamicLimitKey = KEYS[2]       -- optional: key for dynamic limit in redis
  local maxTokens   = tonumber(ARGV[1]) -- default maximum number of tokens
  local interval    = tonumber(ARGV[2]) -- size of the window in milliseconds
  local refillRate  = tonumber(ARGV[3]) -- how many tokens are refilled after each interval
  local now         = tonumber(ARGV[4]) -- current timestamp in milliseconds
  local incrementBy = tonumber(ARGV[5]) -- how many tokens to consume, default is 1

  -- Check for dynamic limit
  local effectiveLimit = maxTokens
  if dynamicLimitKey ~= "" then
    local dynamicLimit = redis.call("GET", dynamicLimitKey)
    if dynamicLimit then
      effectiveLimit = tonumber(dynamicLimit)
    end
  end
        
  local bucket = redis.call("HMGET", key, "refilledAt", "tokens")
        
  local refilledAt
  local tokens

  if bucket[1] == false then
    refilledAt = now
    tokens = effectiveLimit
  else
    refilledAt = tonumber(bucket[1])
    tokens = tonumber(bucket[2])
  end
        
  if now >= refilledAt + interval then
    local numRefills = math.floor((now - refilledAt) / interval)
    tokens = math.min(effectiveLimit, tokens + numRefills * refillRate)

    refilledAt = refilledAt + numRefills * interval
  end

  -- Only reject if tokens are 0 and we're consuming (not refunding)
  if tokens == 0 and incrementBy > 0 then
    return {-1, refilledAt + interval, effectiveLimit}
  end

  local remaining = tokens - incrementBy
  local expireAt = math.ceil(((effectiveLimit - remaining) / refillRate)) * interval
        
  redis.call("HSET", key, "refilledAt", refilledAt, "tokens", remaining)

  if (expireAt > 0) then
    redis.call("PEXPIRE", key, expireAt)
  end
  return {remaining, refilledAt + interval, effectiveLimit}
`
    var tokenBucketIdentifierNotFound = -1
    var tokenBucketRemainingTokensScript = `
  local key         = KEYS[1]
  local dynamicLimitKey = KEYS[2]       -- optional: key for dynamic limit in redis
  local maxTokens   = tonumber(ARGV[1]) -- default maximum number of tokens

  -- Check for dynamic limit
  local effectiveLimit = maxTokens
  if dynamicLimitKey ~= "" then
    local dynamicLimit = redis.call("GET", dynamicLimitKey)
    if dynamicLimit then
      effectiveLimit = tonumber(dynamicLimit)
    end
  end
        
  local bucket = redis.call("HMGET", key, "refilledAt", "tokens")

  if bucket[1] == false then
    return {effectiveLimit, ${tokenBucketIdentifierNotFound}, effectiveLimit}
  end
        
  return {tonumber(bucket[2]), tonumber(bucket[1]), effectiveLimit}
`
    var cachedFixedWindowLimitScript = `
  local key     = KEYS[1]
  local window  = ARGV[1]
  local incrementBy   = ARGV[2] -- increment rate per request at a given value, default is 1

  local r = redis.call("INCRBY", key, incrementBy)
  if r == incrementBy then
  -- The first time this key is set, the value will be equal to incrementBy.
  -- So we only need the expire command once
  redis.call("PEXPIRE", key, window)
  end
      
  return r
`
    var cachedFixedWindowRemainingTokenScript = `
  local key = KEYS[1]
  local tokens = 0

  local value = redis.call('GET', key)
  if value then
      tokens = value
  end
  return tokens
`
    var fixedWindowLimitScript2 = `
	local key           = KEYS[1]
	local id            = ARGV[1]
	local window        = ARGV[2]
	local incrementBy   = tonumber(ARGV[3])

	redis.call("HSET", key, id, incrementBy)
	local fields = redis.call("HGETALL", key)
	if #fields == 2 and tonumber(fields[2])==incrementBy then
	-- The first time this key is set, and the value will be equal to incrementBy.
	-- So we only need the expire command once
	  redis.call("PEXPIRE", key, window)
	end

	return fields
`
    var fixedWindowRemainingTokensScript2 = `
      local key = KEYS[1]
      local tokens = 0

      local fields = redis.call("HGETALL", key)

      return fields
    `
    var slidingWindowLimitScript2 = `
	local currentKey    = KEYS[1]           -- identifier including prefixes
	local previousKey   = KEYS[2]           -- key of the previous bucket
	local tokens        = tonumber(ARGV[1]) -- tokens per window
	local now           = ARGV[2]           -- current timestamp in milliseconds
	local window        = ARGV[3]           -- interval in milliseconds
	local requestId     = ARGV[4]           -- uuid for this request
	local incrementBy   = tonumber(ARGV[5]) -- custom rate, default is  1

	local currentFields = redis.call("HGETALL", currentKey)
	local requestsInCurrentWindow = 0
	for i = 2, #currentFields, 2 do
	requestsInCurrentWindow = requestsInCurrentWindow + tonumber(currentFields[i])
	end

	local previousFields = redis.call("HGETALL", previousKey)
	local requestsInPreviousWindow = 0
	for i = 2, #previousFields, 2 do
	requestsInPreviousWindow = requestsInPreviousWindow + tonumber(previousFields[i])
	end

	local percentageInCurrent = ( now % window) / window

	-- Only check limit if not refunding (negative rate)
	if incrementBy > 0 and requestsInPreviousWindow * (1 - percentageInCurrent ) + requestsInCurrentWindow + incrementBy > tokens then
	  return {currentFields, previousFields, false}
	end

	redis.call("HSET", currentKey, requestId, incrementBy)

	if requestsInCurrentWindow == 0 then 
	  -- The first time this key is set, the value will be equal to incrementBy.
	  -- So we only need the expire command once
	  redis.call("PEXPIRE", currentKey, window * 2 + 1000) -- Enough time to overlap with a new window + 1 second
	end
	return {currentFields, previousFields, true}
`
    var slidingWindowRemainingTokensScript2 = `
	local currentKey    = KEYS[1]           -- identifier including prefixes
	local previousKey   = KEYS[2]           -- key of the previous bucket
	local now         	= ARGV[1]           -- current timestamp in milliseconds
  	local window      	= ARGV[2]           -- interval in milliseconds

	local currentFields = redis.call("HGETALL", currentKey)
	local requestsInCurrentWindow = 0
	for i = 2, #currentFields, 2 do
	requestsInCurrentWindow = requestsInCurrentWindow + tonumber(currentFields[i])
	end

	local previousFields = redis.call("HGETALL", previousKey)
	local requestsInPreviousWindow = 0
	for i = 2, #previousFields, 2 do
	requestsInPreviousWindow = requestsInPreviousWindow + tonumber(previousFields[i])
	end

	local percentageInCurrent = ( now % window) / window
  	requestsInPreviousWindow = math.floor(( 1 - percentageInCurrent ) * requestsInPreviousWindow)
	
	return requestsInCurrentWindow + requestsInPreviousWindow
`
    var resetScript = `
      local pattern = KEYS[1]

      -- Initialize cursor to start from 0
      local cursor = "0"

      repeat
          -- Scan for keys matching the pattern
          local scan_result = redis.call('SCAN', cursor, 'MATCH', pattern)

          -- Extract cursor for the next iteration
          cursor = scan_result[1]

          -- Extract keys from the scan result
          local keys = scan_result[2]

          for i=1, #keys do
          redis.call('DEL', keys[i])
          end

      -- Continue scanning until cursor is 0 (end of keyspace)
      until cursor == "0"
    `
    var SCRIPTS = {
      singleRegion: {
        fixedWindow: {
          limit: {
            script: fixedWindowLimitScript,
            hash: "472e55443b62f60d0991028456c57815a387066d",
          },
          getRemaining: {
            script: fixedWindowRemainingTokensScript,
            hash: "40515c9dd0a08f8584f5f9b593935f6a87c1c1c3",
          },
        },
        slidingWindow: {
          limit: {
            script: slidingWindowLimitScript,
            hash: "977fb636fb5ceb7e98a96d1b3a1272ba018efdae",
          },
          getRemaining: {
            script: slidingWindowRemainingTokensScript,
            hash: "ee3a3265fad822f83acad23f8a1e2f5c0b156b03",
          },
        },
        tokenBucket: {
          limit: {
            script: tokenBucketLimitScript,
            hash: "b35c5bc0b7fdae7dd0573d4529911cabaf9d1d89",
          },
          getRemaining: {
            script: tokenBucketRemainingTokensScript,
            hash: "deb03663e8af5a968deee895dd081be553d2611b",
          },
        },
        cachedFixedWindow: {
          limit: {
            script: cachedFixedWindowLimitScript,
            hash: "c26b12703dd137939b9a69a3a9b18e906a2d940f",
          },
          getRemaining: {
            script: cachedFixedWindowRemainingTokenScript,
            hash: "8e8f222ccae68b595ee6e3f3bf2199629a62b91a",
          },
        },
      },
      multiRegion: {
        fixedWindow: {
          limit: {
            script: fixedWindowLimitScript2,
            hash: "a8c14f3835aa87bd70e5e2116081b81664abcf5c",
          },
          getRemaining: {
            script: fixedWindowRemainingTokensScript2,
            hash: "8ab8322d0ed5fe5ac8eb08f0c2e4557f1b4816fd",
          },
        },
        slidingWindow: {
          limit: {
            script: slidingWindowLimitScript2,
            hash: "1e7ca8dcd2d600a6d0124a67a57ea225ed62921b",
          },
          getRemaining: {
            script: slidingWindowRemainingTokensScript2,
            hash: "558c9306b7ec54abb50747fe0b17e5d44bd24868",
          },
        },
      },
    }
    var RESET_SCRIPT = {
      script: resetScript,
      hash: "54bd274ddc59fb3be0f42deee2f64322a10e2b50",
    }
    var DenyListExtension = "denyList"
    var IpDenyListKey = "ipDenyList"
    var IpDenyListStatusKey = "ipDenyListStatus"
    var checkDenyListScript = `
  -- Checks if values provideed in ARGV are present in the deny lists.
  -- This is done using the allDenyListsKey below.

  -- Additionally, checks the status of the ip deny list using the
  -- ipDenyListStatusKey below. Here are the possible states of the
  -- ipDenyListStatusKey key:
  -- * status == -1: set to "disabled" with no TTL
  -- * status == -2: not set, meaning that is was set before but expired
  -- * status  >  0: set to "valid", with a TTL
  --
  -- In the case of status == -2, we set the status to "pending" with
  -- 30 second ttl. During this time, the process which got status == -2
  -- will update the ip deny list.

  local allDenyListsKey     = KEYS[1]
  local ipDenyListStatusKey = KEYS[2]

  local results = redis.call('SMISMEMBER', allDenyListsKey, unpack(ARGV))
  local status  = redis.call('TTL', ipDenyListStatusKey)
  if status == -2 then
    redis.call('SETEX', ipDenyListStatusKey, 30, "pending")
  end

  return { results, status }
`
    var ip_deny_list_exports = {}
    __export3(ip_deny_list_exports, {
      ThresholdError: () => ThresholdError,
      disableIpDenyList: () => disableIpDenyList,
      updateIpDenyList: () => updateIpDenyList,
    })
    var MILLISECONDS_IN_HOUR = 60 * 60 * 1e3
    var MILLISECONDS_IN_DAY = 24 * MILLISECONDS_IN_HOUR
    var MILLISECONDS_TO_2AM = 2 * MILLISECONDS_IN_HOUR
    var getIpListTTL = (time) => {
      const now = time || Date.now()
      const timeSinceLast2AM = (now - MILLISECONDS_TO_2AM) % MILLISECONDS_IN_DAY
      return MILLISECONDS_IN_DAY - timeSinceLast2AM
    }
    var baseUrl = "https://raw.githubusercontent.com/stamparm/ipsum/master/levels"
    var ThresholdError = class extends Error {
      constructor(threshold) {
        super(`Allowed threshold values are from 1 to 8, 1 and 8 included. Received: ${threshold}`)
        this.name = "ThresholdError"
      }
    }
    var getIpDenyList = async (threshold) => {
      if (typeof threshold !== "number" || threshold < 1 || threshold > 8) {
        throw new ThresholdError(threshold)
      }
      try {
        const response = await fetch(`${baseUrl}/${threshold}.txt`)
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`)
        }
        const data = await response.text()
        const lines = data.split("\n")
        return lines.filter((value) => value.length > 0)
      } catch (error) {
        throw new Error(`Failed to fetch ip deny list: ${error}`)
      }
    }
    var updateIpDenyList = async (redis2, prefix, threshold, ttl) => {
      const allIps = await getIpDenyList(threshold)
      const allDenyLists = [prefix, DenyListExtension, "all"].join(":")
      const ipDenyList = [prefix, DenyListExtension, IpDenyListKey].join(":")
      const statusKey = [prefix, IpDenyListStatusKey].join(":")
      const transaction = redis2.multi()
      transaction.sdiffstore(allDenyLists, allDenyLists, ipDenyList)
      transaction.del(ipDenyList)
      transaction.sadd(ipDenyList, allIps.at(0), ...allIps.slice(1))
      transaction.sdiffstore(ipDenyList, ipDenyList, allDenyLists)
      transaction.sunionstore(allDenyLists, allDenyLists, ipDenyList)
      transaction.set(statusKey, "valid", { px: ttl ?? getIpListTTL() })
      return await transaction.exec()
    }
    var disableIpDenyList = async (redis2, prefix) => {
      const allDenyListsKey = [prefix, DenyListExtension, "all"].join(":")
      const ipDenyListKey = [prefix, DenyListExtension, IpDenyListKey].join(":")
      const statusKey = [prefix, IpDenyListStatusKey].join(":")
      const transaction = redis2.multi()
      transaction.sdiffstore(allDenyListsKey, allDenyListsKey, ipDenyListKey)
      transaction.del(ipDenyListKey)
      transaction.set(statusKey, "disabled")
      return await transaction.exec()
    }
    var denyListCache = new Cache(/* @__PURE__ */ new Map())
    var checkDenyListCache = (members) => {
      return members.find((member) => denyListCache.isBlocked(member).blocked)
    }
    var blockMember = (member) => {
      if (denyListCache.size() > 1e3) denyListCache.empty()
      denyListCache.blockUntil(member, Date.now() + 6e4)
    }
    var checkDenyList = async (redis2, prefix, members) => {
      const [deniedValues, ipDenyListStatus] = await redis2.eval(
        checkDenyListScript,
        [[prefix, DenyListExtension, "all"].join(":"), [prefix, IpDenyListStatusKey].join(":")],
        members
      )
      let deniedValue = void 0
      deniedValues.map((memberDenied, index) => {
        if (memberDenied) {
          blockMember(members[index])
          deniedValue = members[index]
        }
      })
      return {
        deniedValue,
        invalidIpDenyList: ipDenyListStatus === -2,
      }
    }
    var resolveLimitPayload = (
      redis2,
      prefix,
      [ratelimitResponse, denyListResponse],
      threshold
    ) => {
      if (denyListResponse.deniedValue) {
        ratelimitResponse.success = false
        ratelimitResponse.remaining = 0
        ratelimitResponse.reason = "denyList"
        ratelimitResponse.deniedValue = denyListResponse.deniedValue
      }
      if (denyListResponse.invalidIpDenyList) {
        const updatePromise = updateIpDenyList(redis2, prefix, threshold)
        ratelimitResponse.pending = Promise.all([ratelimitResponse.pending, updatePromise])
      }
      return ratelimitResponse
    }
    var defaultDeniedResponse = (deniedValue) => {
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: 0,
        pending: Promise.resolve(),
        reason: "denyList",
        deniedValue,
      }
    }
    var Ratelimit2 = class {
      limiter
      ctx
      prefix
      timeout
      primaryRedis
      analytics
      enableProtection
      denyListThreshold
      dynamicLimits
      constructor(config) {
        this.ctx = config.ctx
        this.limiter = config.limiter
        this.timeout = config.timeout ?? 5e3
        this.prefix = config.prefix ?? DEFAULT_PREFIX
        this.dynamicLimits = config.dynamicLimits ?? false
        this.enableProtection = config.enableProtection ?? false
        this.denyListThreshold = config.denyListThreshold ?? 6
        this.primaryRedis = "redis" in this.ctx ? this.ctx.redis : this.ctx.regionContexts[0].redis
        if ("redis" in this.ctx) {
          this.ctx.dynamicLimits = this.dynamicLimits
          this.ctx.prefix = this.prefix
        }
        this.analytics = config.analytics
          ? new Analytics2({
              redis: this.primaryRedis,
              prefix: this.prefix,
            })
          : void 0
        if (config.ephemeralCache instanceof Map) {
          this.ctx.cache = new Cache(config.ephemeralCache)
        } else if (config.ephemeralCache === void 0) {
          this.ctx.cache = new Cache(/* @__PURE__ */ new Map())
        }
      }
      /**
       * Determine if a request should pass or be rejected based on the identifier and previously chosen ratelimit.
       *
       * Use this if you want to reject all requests that you can not handle right now.
       *
       * @example
       * ```ts
       *  const ratelimit = new Ratelimit({
       *    redis: Redis.fromEnv(),
       *    limiter: Ratelimit.slidingWindow(10, "10 s")
       *  })
       *
       *  const { success } = await ratelimit.limit(id)
       *  if (!success){
       *    return "Nope"
       *  }
       *  return "Yes"
       * ```
       *
       * @param req.rate - The rate at which tokens will be added or consumed from the token bucket. A higher rate allows for more requests to be processed. Defaults to 1 token per interval if not specified.
       *
       * Usage with `req.rate`
       * @example
       * ```ts
       *  const ratelimit = new Ratelimit({
       *    redis: Redis.fromEnv(),
       *    limiter: Ratelimit.slidingWindow(100, "10 s")
       *  })
       *
       *  const { success } = await ratelimit.limit(id, {rate: 10})
       *  if (!success){
       *    return "Nope"
       *  }
       *  return "Yes"
       * ```
       */
      limit = async (identifier, req) => {
        let timeoutId = null
        try {
          const response = this.getRatelimitResponse(identifier, req)
          const { responseArray, newTimeoutId } = this.applyTimeout(response)
          timeoutId = newTimeoutId
          const timedResponse = await Promise.race(responseArray)
          const finalResponse = this.submitAnalytics(timedResponse, identifier, req)
          return finalResponse
        } finally {
          if (timeoutId) {
            clearTimeout(timeoutId)
          }
        }
      }
      /**
       * Block until the request may pass or timeout is reached.
       *
       * This method returns a promise that resolves as soon as the request may be processed
       * or after the timeout has been reached.
       *
       * Use this if you want to delay the request until it is ready to get processed.
       *
       * @example
       * ```ts
       *  const ratelimit = new Ratelimit({
       *    redis: Redis.fromEnv(),
       *    limiter: Ratelimit.slidingWindow(10, "10 s")
       *  })
       *
       *  const { success } = await ratelimit.blockUntilReady(id, 60_000)
       *  if (!success){
       *    return "Nope"
       *  }
       *  return "Yes"
       * ```
       */
      blockUntilReady = async (identifier, timeout) => {
        if (timeout <= 0) {
          throw new Error("timeout must be positive")
        }
        let res
        const deadline = Date.now() + timeout
        while (true) {
          res = await this.limit(identifier)
          if (res.success) {
            break
          }
          if (res.reset === 0) {
            throw new Error("This should not happen")
          }
          const wait = Math.min(res.reset, deadline) - Date.now()
          await new Promise((r) => setTimeout(r, wait))
          if (Date.now() > deadline) {
            break
          }
        }
        return res
      }
      resetUsedTokens = async (identifier) => {
        const pattern = [this.prefix, identifier].join(":")
        await this.limiter().resetTokens(this.ctx, pattern)
      }
      /**
       * Returns the remaining token count together with a reset timestamps
       *
       * @param identifier identifir to check
       * @returns object with `remaining`, `reset`, and `limit` fields. `remaining` denotes
       *          the remaining tokens, `limit` is the effective limit (considering dynamic
       *          limits if enabled), and `reset` denotes the timestamp when the tokens reset.
       */
      getRemaining = async (identifier) => {
        const pattern = [this.prefix, identifier].join(":")
        return await this.limiter().getRemaining(this.ctx, pattern)
      }
      /**
       * Checks if the identifier or the values in req are in the deny list cache.
       * If so, returns the default denied response.
       *
       * Otherwise, calls redis to check the rate limit and deny list. Returns after
       * resolving the result. Resolving is overriding the rate limit result if
       * the some value is in deny list.
       *
       * @param identifier identifier to block
       * @param req options with ip, user agent, country, rate and geo info
       * @returns rate limit response
       */
      getRatelimitResponse = async (identifier, req) => {
        const key = this.getKey(identifier)
        const definedMembers = this.getDefinedMembers(identifier, req)
        const deniedValue = checkDenyListCache(definedMembers)
        const result = deniedValue
          ? [defaultDeniedResponse(deniedValue), { deniedValue, invalidIpDenyList: false }]
          : await Promise.all([
              this.limiter().limit(this.ctx, key, req?.rate),
              this.enableProtection
                ? checkDenyList(this.primaryRedis, this.prefix, definedMembers)
                : { deniedValue: void 0, invalidIpDenyList: false },
            ])
        return resolveLimitPayload(this.primaryRedis, this.prefix, result, this.denyListThreshold)
      }
      /**
       * Creates an array with the original response promise and a timeout promise
       * if this.timeout > 0.
       *
       * @param response Ratelimit response promise
       * @returns array with the response and timeout promise. also includes the timeout id
       */
      applyTimeout = (response) => {
        let newTimeoutId = null
        const responseArray = [response]
        if (this.timeout > 0) {
          const timeoutResponse = new Promise((resolve) => {
            newTimeoutId = setTimeout(() => {
              resolve({
                success: true,
                limit: 0,
                remaining: 0,
                reset: 0,
                pending: Promise.resolve(),
                reason: "timeout",
              })
            }, this.timeout)
          })
          responseArray.push(timeoutResponse)
        }
        return {
          responseArray,
          newTimeoutId,
        }
      }
      /**
       * submits analytics if this.analytics is set
       *
       * @param ratelimitResponse final rate limit response
       * @param identifier identifier to submit
       * @param req limit options
       * @returns rate limit response after updating the .pending field
       */
      submitAnalytics = (ratelimitResponse, identifier, req) => {
        if (this.analytics) {
          try {
            const geo = req ? this.analytics.extractGeo(req) : void 0
            const analyticsP = this.analytics
              .record({
                identifier:
                  ratelimitResponse.reason === "denyList"
                    ? ratelimitResponse.deniedValue
                    : identifier,
                time: Date.now(),
                success:
                  ratelimitResponse.reason === "denyList" ? "denied" : ratelimitResponse.success,
                ...geo,
              })
              .catch((error) => {
                let errorMessage = "Failed to record analytics"
                if (`${error}`.includes("WRONGTYPE")) {
                  errorMessage = `
    Failed to record analytics. See the information below:

    This can occur when you uprade to Ratelimit version 1.1.2
    or later from an earlier version.

    This occurs simply because the way we store analytics data
    has changed. To avoid getting this error, disable analytics
    for *an hour*, then simply enable it back.

    `
                }
                console.warn(errorMessage, error)
              })
            ratelimitResponse.pending = Promise.all([ratelimitResponse.pending, analyticsP])
          } catch (error) {
            console.warn("Failed to record analytics", error)
          }
        }
        return ratelimitResponse
      }
      getKey = (identifier) => {
        return [this.prefix, identifier].join(":")
      }
      /**
       * returns a list of defined values from
       * [identifier, req.ip, req.userAgent, req.country]
       *
       * @param identifier identifier
       * @param req limit options
       * @returns list of defined values
       */
      getDefinedMembers = (identifier, req) => {
        const members = [identifier, req?.ip, req?.userAgent, req?.country]
        return members.filter(Boolean)
      }
      /**
       * Set a dynamic rate limit globally.
       *
       * When dynamicLimits is enabled, this limit will override the default limit
       * set in the constructor for all requests.
       *
       * @example
       * ```ts
       * const ratelimit = new Ratelimit({
       *   redis: Redis.fromEnv(),
       *   limiter: Ratelimit.slidingWindow(10, "10 s"),
       *   dynamicLimits: true
       * });
       *
       * // Set global dynamic limit to 120 requests
       * await ratelimit.setDynamicLimit({ limit: 120 });
       *
       * // Disable dynamic limit (falls back to default)
       * await ratelimit.setDynamicLimit({ limit: false });
       * ```
       *
       * @param options.limit - The new rate limit to apply globally, or false to disable
       */
      setDynamicLimit = async (options) => {
        if (!this.dynamicLimits) {
          throw new Error(
            "dynamicLimits must be enabled in the Ratelimit constructor to use setDynamicLimit()"
          )
        }
        const globalKey = `${this.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}`
        await (options.limit === false
          ? this.primaryRedis.del(globalKey)
          : this.primaryRedis.set(globalKey, options.limit))
      }
      /**
       * Get the current global dynamic rate limit.
       *
       * @example
       * ```ts
       * const { dynamicLimit } = await ratelimit.getDynamicLimit();
       * console.log(dynamicLimit); // 120 or null if not set
       * ```
       *
       * @returns Object containing the current global dynamic limit, or null if not set
       */
      getDynamicLimit = async () => {
        if (!this.dynamicLimits) {
          throw new Error(
            "dynamicLimits must be enabled in the Ratelimit constructor to use getDynamicLimit()"
          )
        }
        const globalKey = `${this.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}`
        const result = await this.primaryRedis.get(globalKey)
        return { dynamicLimit: result === null ? null : Number(result) }
      }
    }
    function randomId() {
      let result = ""
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
      const charactersLength = characters.length
      for (let i = 0; i < 16; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
      }
      return result
    }
    var MultiRegionRatelimit = class extends Ratelimit2 {
      /**
       * Create a new Ratelimit instance by providing a `@upstash/redis` instance and the algorithn of your choice.
       */
      constructor(config) {
        super({
          prefix: config.prefix,
          limiter: config.limiter,
          timeout: config.timeout,
          analytics: config.analytics,
          dynamicLimits: config.dynamicLimits,
          ctx: {
            regionContexts: config.redis.map((redis2) => ({
              redis: redis2,
              prefix: config.prefix ?? DEFAULT_PREFIX,
            })),
            cache: config.ephemeralCache ? new Cache(config.ephemeralCache) : void 0,
          },
        })
        if (config.dynamicLimits) {
          console.warn(
            "Warning: Dynamic limits are not yet supported for multi-region rate limiters. The dynamicLimits option will be ignored."
          )
        }
      }
      /**
       * Each request inside a fixed time increases a counter.
       * Once the counter reaches the maximum allowed number, all further requests are
       * rejected.
       *
       * **Pro:**
       *
       * - Newer requests are not starved by old ones.
       * - Low storage cost.
       *
       * **Con:**
       *
       * A burst of requests near the boundary of a window can result in a very
       * high request rate because two windows will be filled with requests quickly.
       *
       * @param tokens - How many requests a user can make in each time window.
       * @param window - A fixed timeframe
       */
      static fixedWindow(tokens, window2) {
        const windowDuration = ms(window2)
        return () => ({
          async limit(ctx, identifier, rate) {
            const requestId = randomId()
            const bucket = Math.floor(Date.now() / windowDuration)
            const key = [identifier, bucket].join(":")
            const incrementBy = rate ?? 1
            if (ctx.cache && incrementBy > 0) {
              const { blocked, reset: reset2 } = ctx.cache.isBlocked(identifier)
              if (blocked) {
                return {
                  success: false,
                  limit: tokens,
                  remaining: 0,
                  reset: reset2,
                  pending: Promise.resolve(),
                  reason: "cacheBlock",
                }
              }
            }
            const dbs = ctx.regionContexts.map((regionContext) => ({
              redis: regionContext.redis,
              request: safeEval(
                regionContext,
                SCRIPTS.multiRegion.fixedWindow.limit,
                [key],
                [requestId, windowDuration, incrementBy]
              ),
            }))
            const firstResponse = await Promise.any(dbs.map((s) => s.request))
            const usedTokens = firstResponse.reduce((accTokens, usedToken, index) => {
              let parsedToken = 0
              if (index % 2) {
                parsedToken = Number.parseInt(usedToken)
              }
              return accTokens + parsedToken
            }, 0)
            const remaining = tokens - usedTokens
            async function sync() {
              const individualIDs = await Promise.all(dbs.map((s) => s.request))
              const allIDs = [
                ...new Set(
                  individualIDs.flat().reduce((acc, curr, index) => {
                    if (index % 2 === 0) {
                      acc.push(curr)
                    }
                    return acc
                  }, [])
                ).values(),
              ]
              for (const db of dbs) {
                const usedDbTokensRequest = await db.request
                const usedDbTokens = usedDbTokensRequest.reduce((accTokens, usedToken, index) => {
                  let parsedToken = 0
                  if (index % 2) {
                    parsedToken = Number.parseInt(usedToken)
                  }
                  return accTokens + parsedToken
                }, 0)
                const dbIdsRequest = await db.request
                const dbIds = dbIdsRequest.reduce((ids, currentId, index) => {
                  if (index % 2 === 0) {
                    ids.push(currentId)
                  }
                  return ids
                }, [])
                if (usedDbTokens >= tokens) {
                  continue
                }
                const diff = allIDs.filter((id) => !dbIds.includes(id))
                if (diff.length === 0) {
                  continue
                }
                for (const requestId2 of diff) {
                  await db.redis.hset(key, { [requestId2]: incrementBy })
                }
              }
            }
            const success = remaining >= 0
            const reset = (bucket + 1) * windowDuration
            if (ctx.cache) {
              if (!success) {
                ctx.cache.blockUntil(identifier, reset)
              } else if (incrementBy < 0) {
                ctx.cache.pop(identifier)
              }
            }
            return {
              success,
              limit: tokens,
              remaining,
              reset,
              pending: sync(),
            }
          },
          async getRemaining(ctx, identifier) {
            const bucket = Math.floor(Date.now() / windowDuration)
            const key = [identifier, bucket].join(":")
            const dbs = ctx.regionContexts.map((regionContext) => ({
              redis: regionContext.redis,
              request: safeEval(
                regionContext,
                SCRIPTS.multiRegion.fixedWindow.getRemaining,
                [key],
                [null]
              ),
            }))
            const firstResponse = await Promise.any(dbs.map((s) => s.request))
            const usedTokens = firstResponse.reduce((accTokens, usedToken, index) => {
              let parsedToken = 0
              if (index % 2) {
                parsedToken = Number.parseInt(usedToken)
              }
              return accTokens + parsedToken
            }, 0)
            return {
              remaining: Math.max(0, tokens - usedTokens),
              reset: (bucket + 1) * windowDuration,
              limit: tokens,
            }
          },
          async resetTokens(ctx, identifier) {
            const pattern = [identifier, "*"].join(":")
            if (ctx.cache) {
              ctx.cache.pop(identifier)
            }
            await Promise.all(
              ctx.regionContexts.map((regionContext) => {
                safeEval(regionContext, RESET_SCRIPT, [pattern], [null])
              })
            )
          },
        })
      }
      /**
       * Combined approach of `slidingLogs` and `fixedWindow` with lower storage
       * costs than `slidingLogs` and improved boundary behavior by calculating a
       * weighted score between two windows.
       *
       * **Pro:**
       *
       * Good performance allows this to scale to very high loads.
       *
       * **Con:**
       *
       * Nothing major.
       *
       * @param tokens - How many requests a user can make in each time window.
       * @param window - The duration in which the user can max X requests.
       */
      static slidingWindow(tokens, window2) {
        const windowSize = ms(window2)
        const windowDuration = ms(window2)
        return () => ({
          async limit(ctx, identifier, rate) {
            const requestId = randomId()
            const now = Date.now()
            const currentWindow = Math.floor(now / windowSize)
            const currentKey = [identifier, currentWindow].join(":")
            const previousWindow = currentWindow - 1
            const previousKey = [identifier, previousWindow].join(":")
            const incrementBy = rate ?? 1
            if (ctx.cache && incrementBy > 0) {
              const { blocked, reset: reset2 } = ctx.cache.isBlocked(identifier)
              if (blocked) {
                return {
                  success: false,
                  limit: tokens,
                  remaining: 0,
                  reset: reset2,
                  pending: Promise.resolve(),
                  reason: "cacheBlock",
                }
              }
            }
            const dbs = ctx.regionContexts.map((regionContext) => ({
              redis: regionContext.redis,
              request: safeEval(
                regionContext,
                SCRIPTS.multiRegion.slidingWindow.limit,
                [currentKey, previousKey],
                [tokens, now, windowDuration, requestId, incrementBy]
                // lua seems to return `1` for true and `null` for false
              ),
            }))
            const percentageInCurrent = (now % windowDuration) / windowDuration
            const [current, previous, success] = await Promise.any(dbs.map((s) => s.request))
            if (success) {
              current.push(requestId, incrementBy.toString())
            }
            const previousUsedTokens = previous.reduce((accTokens, usedToken, index) => {
              let parsedToken = 0
              if (index % 2) {
                parsedToken = Number.parseInt(usedToken)
              }
              return accTokens + parsedToken
            }, 0)
            const currentUsedTokens = current.reduce((accTokens, usedToken, index) => {
              let parsedToken = 0
              if (index % 2) {
                parsedToken = Number.parseInt(usedToken)
              }
              return accTokens + parsedToken
            }, 0)
            const previousPartialUsed = Math.ceil(previousUsedTokens * (1 - percentageInCurrent))
            const usedTokens = previousPartialUsed + currentUsedTokens
            const remaining = tokens - usedTokens
            async function sync() {
              const res = await Promise.all(dbs.map((s) => s.request))
              const allCurrentIds = [
                ...new Set(
                  res
                    .flatMap(([current2]) => current2)
                    .reduce((acc, curr, index) => {
                      if (index % 2 === 0) {
                        acc.push(curr)
                      }
                      return acc
                    }, [])
                ).values(),
              ]
              for (const db of dbs) {
                const [current2, _previous, _success] = await db.request
                const dbIds = current2.reduce((ids, currentId, index) => {
                  if (index % 2 === 0) {
                    ids.push(currentId)
                  }
                  return ids
                }, [])
                const usedDbTokens = current2.reduce((accTokens, usedToken, index) => {
                  let parsedToken = 0
                  if (index % 2) {
                    parsedToken = Number.parseInt(usedToken)
                  }
                  return accTokens + parsedToken
                }, 0)
                if (usedDbTokens >= tokens) {
                  continue
                }
                const diff = allCurrentIds.filter((id) => !dbIds.includes(id))
                if (diff.length === 0) {
                  continue
                }
                for (const requestId2 of diff) {
                  await db.redis.hset(currentKey, { [requestId2]: incrementBy })
                }
              }
            }
            const reset = (currentWindow + 1) * windowDuration
            if (ctx.cache) {
              if (!success) {
                ctx.cache.blockUntil(identifier, reset)
              } else if (incrementBy < 0) {
                ctx.cache.pop(identifier)
              }
            }
            return {
              success: Boolean(success),
              limit: tokens,
              remaining: Math.max(0, remaining),
              reset,
              pending: sync(),
            }
          },
          async getRemaining(ctx, identifier) {
            const now = Date.now()
            const currentWindow = Math.floor(now / windowSize)
            const currentKey = [identifier, currentWindow].join(":")
            const previousWindow = currentWindow - 1
            const previousKey = [identifier, previousWindow].join(":")
            const dbs = ctx.regionContexts.map((regionContext) => ({
              redis: regionContext.redis,
              request: safeEval(
                regionContext,
                SCRIPTS.multiRegion.slidingWindow.getRemaining,
                [currentKey, previousKey],
                [now, windowSize]
                // lua seems to return `1` for true and `null` for false
              ),
            }))
            const usedTokens = await Promise.any(dbs.map((s) => s.request))
            return {
              remaining: Math.max(0, tokens - usedTokens),
              reset: (currentWindow + 1) * windowSize,
              limit: tokens,
            }
          },
          async resetTokens(ctx, identifier) {
            const pattern = [identifier, "*"].join(":")
            if (ctx.cache) {
              ctx.cache.pop(identifier)
            }
            await Promise.all(
              ctx.regionContexts.map((regionContext) => {
                safeEval(regionContext, RESET_SCRIPT, [pattern], [null])
              })
            )
          },
        })
      }
    }
    var RegionRatelimit = class extends Ratelimit2 {
      /**
       * Create a new Ratelimit instance by providing a `@upstash/redis` instance and the algorithm of your choice.
       */
      constructor(config) {
        super({
          prefix: config.prefix,
          limiter: config.limiter,
          timeout: config.timeout,
          analytics: config.analytics,
          ctx: {
            redis: config.redis,
            prefix: config.prefix ?? DEFAULT_PREFIX,
          },
          ephemeralCache: config.ephemeralCache,
          enableProtection: config.enableProtection,
          denyListThreshold: config.denyListThreshold,
          dynamicLimits: config.dynamicLimits,
        })
      }
      /**
       * Each request inside a fixed time increases a counter.
       * Once the counter reaches the maximum allowed number, all further requests are
       * rejected.
       *
       * **Pro:**
       *
       * - Newer requests are not starved by old ones.
       * - Low storage cost.
       *
       * **Con:**
       *
       * A burst of requests near the boundary of a window can result in a very
       * high request rate because two windows will be filled with requests quickly.
       *
       * @param tokens - How many requests a user can make in each time window.
       * @param window - A fixed timeframe
       */
      static fixedWindow(tokens, window2) {
        const windowDuration = ms(window2)
        return () => ({
          async limit(ctx, identifier, rate) {
            const bucket = Math.floor(Date.now() / windowDuration)
            const key = [identifier, bucket].join(":")
            const incrementBy = rate ?? 1
            if (ctx.cache && incrementBy > 0) {
              const { blocked, reset: reset2 } = ctx.cache.isBlocked(identifier)
              if (blocked) {
                return {
                  success: false,
                  limit: tokens,
                  remaining: 0,
                  reset: reset2,
                  pending: Promise.resolve(),
                  reason: "cacheBlock",
                }
              }
            }
            const dynamicLimitKey = ctx.dynamicLimits
              ? `${ctx.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}`
              : ""
            const [usedTokensAfterUpdate, effectiveLimit] = await safeEval(
              ctx,
              SCRIPTS.singleRegion.fixedWindow.limit,
              [key, dynamicLimitKey],
              [tokens, windowDuration, incrementBy]
            )
            const success = usedTokensAfterUpdate <= effectiveLimit
            const remainingTokens = Math.max(0, effectiveLimit - usedTokensAfterUpdate)
            const reset = (bucket + 1) * windowDuration
            if (ctx.cache) {
              if (!success) {
                ctx.cache.blockUntil(identifier, reset)
              } else if (incrementBy < 0) {
                ctx.cache.pop(identifier)
              }
            }
            return {
              success,
              limit: effectiveLimit,
              remaining: remainingTokens,
              reset,
              pending: Promise.resolve(),
            }
          },
          async getRemaining(ctx, identifier) {
            const bucket = Math.floor(Date.now() / windowDuration)
            const key = [identifier, bucket].join(":")
            const dynamicLimitKey = ctx.dynamicLimits
              ? `${ctx.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}`
              : ""
            const [remaining, effectiveLimit] = await safeEval(
              ctx,
              SCRIPTS.singleRegion.fixedWindow.getRemaining,
              [key, dynamicLimitKey],
              [tokens]
            )
            return {
              remaining: Math.max(0, remaining),
              reset: (bucket + 1) * windowDuration,
              limit: effectiveLimit,
            }
          },
          async resetTokens(ctx, identifier) {
            const pattern = [identifier, "*"].join(":")
            if (ctx.cache) {
              ctx.cache.pop(identifier)
            }
            await safeEval(ctx, RESET_SCRIPT, [pattern], [null])
          },
        })
      }
      /**
       * Combined approach of `slidingLogs` and `fixedWindow` with lower storage
       * costs than `slidingLogs` and improved boundary behavior by calculating a
       * weighted score between two windows.
       *
       * **Pro:**
       *
       * Good performance allows this to scale to very high loads.
       *
       * **Con:**
       *
       * Nothing major.
       *
       * @param tokens - How many requests a user can make in each time window.
       * @param window - The duration in which the user can max X requests.
       */
      static slidingWindow(tokens, window2) {
        const windowSize = ms(window2)
        return () => ({
          async limit(ctx, identifier, rate) {
            const now = Date.now()
            const currentWindow = Math.floor(now / windowSize)
            const currentKey = [identifier, currentWindow].join(":")
            const previousWindow = currentWindow - 1
            const previousKey = [identifier, previousWindow].join(":")
            const incrementBy = rate ?? 1
            if (ctx.cache && incrementBy > 0) {
              const { blocked, reset: reset2 } = ctx.cache.isBlocked(identifier)
              if (blocked) {
                return {
                  success: false,
                  limit: tokens,
                  remaining: 0,
                  reset: reset2,
                  pending: Promise.resolve(),
                  reason: "cacheBlock",
                }
              }
            }
            const dynamicLimitKey = ctx.dynamicLimits
              ? `${ctx.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}`
              : ""
            const [remainingTokens, effectiveLimit] = await safeEval(
              ctx,
              SCRIPTS.singleRegion.slidingWindow.limit,
              [currentKey, previousKey, dynamicLimitKey],
              [tokens, now, windowSize, incrementBy]
            )
            const success = remainingTokens >= 0
            const reset = (currentWindow + 1) * windowSize
            if (ctx.cache) {
              if (!success) {
                ctx.cache.blockUntil(identifier, reset)
              } else if (incrementBy < 0) {
                ctx.cache.pop(identifier)
              }
            }
            return {
              success,
              limit: effectiveLimit,
              remaining: Math.max(0, remainingTokens),
              reset,
              pending: Promise.resolve(),
            }
          },
          async getRemaining(ctx, identifier) {
            const now = Date.now()
            const currentWindow = Math.floor(now / windowSize)
            const currentKey = [identifier, currentWindow].join(":")
            const previousWindow = currentWindow - 1
            const previousKey = [identifier, previousWindow].join(":")
            const dynamicLimitKey = ctx.dynamicLimits
              ? `${ctx.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}`
              : ""
            const [remaining, effectiveLimit] = await safeEval(
              ctx,
              SCRIPTS.singleRegion.slidingWindow.getRemaining,
              [currentKey, previousKey, dynamicLimitKey],
              [tokens, now, windowSize]
            )
            return {
              remaining: Math.max(0, remaining),
              reset: (currentWindow + 1) * windowSize,
              limit: effectiveLimit,
            }
          },
          async resetTokens(ctx, identifier) {
            const pattern = [identifier, "*"].join(":")
            if (ctx.cache) {
              ctx.cache.pop(identifier)
            }
            await safeEval(ctx, RESET_SCRIPT, [pattern], [null])
          },
        })
      }
      /**
       * You have a bucket filled with `{maxTokens}` tokens that refills constantly
       * at `{refillRate}` per `{interval}`.
       * Every request will remove one token from the bucket and if there is no
       * token to take, the request is rejected.
       *
       * **Pro:**
       *
       * - Bursts of requests are smoothed out and you can process them at a constant
       * rate.
       * - Allows to set a higher initial burst limit by setting `maxTokens` higher
       * than `refillRate`
       */
      static tokenBucket(refillRate, interval, maxTokens) {
        const intervalDuration = ms(interval)
        return () => ({
          async limit(ctx, identifier, rate) {
            const now = Date.now()
            const incrementBy = rate ?? 1
            if (ctx.cache && incrementBy > 0) {
              const { blocked, reset: reset2 } = ctx.cache.isBlocked(identifier)
              if (blocked) {
                return {
                  success: false,
                  limit: maxTokens,
                  remaining: 0,
                  reset: reset2,
                  pending: Promise.resolve(),
                  reason: "cacheBlock",
                }
              }
            }
            const dynamicLimitKey = ctx.dynamicLimits
              ? `${ctx.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}`
              : ""
            const [remaining, reset, effectiveLimit] = await safeEval(
              ctx,
              SCRIPTS.singleRegion.tokenBucket.limit,
              [identifier, dynamicLimitKey],
              [maxTokens, intervalDuration, refillRate, now, incrementBy]
            )
            const success = remaining >= 0
            if (ctx.cache) {
              if (!success) {
                ctx.cache.blockUntil(identifier, reset)
              } else if (incrementBy < 0) {
                ctx.cache.pop(identifier)
              }
            }
            return {
              success,
              limit: effectiveLimit,
              remaining: Math.max(0, remaining),
              reset,
              pending: Promise.resolve(),
            }
          },
          async getRemaining(ctx, identifier) {
            const dynamicLimitKey = ctx.dynamicLimits
              ? `${ctx.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}`
              : ""
            const [remainingTokens, refilledAt, effectiveLimit] = await safeEval(
              ctx,
              SCRIPTS.singleRegion.tokenBucket.getRemaining,
              [identifier, dynamicLimitKey],
              [maxTokens]
            )
            const freshRefillAt = Date.now() + intervalDuration
            const identifierRefillsAt = refilledAt + intervalDuration
            return {
              remaining: Math.max(0, remainingTokens),
              reset:
                refilledAt === tokenBucketIdentifierNotFound ? freshRefillAt : identifierRefillsAt,
              limit: effectiveLimit,
            }
          },
          async resetTokens(ctx, identifier) {
            const pattern = identifier
            if (ctx.cache) {
              ctx.cache.pop(identifier)
            }
            await safeEval(ctx, RESET_SCRIPT, [pattern], [null])
          },
        })
      }
      /**
       * cachedFixedWindow first uses the local cache to decide if a request may pass and then updates
       * it asynchronously.
       * This is experimental and not yet recommended for production use.
       *
       * @experimental
       *
       * Each request inside a fixed time increases a counter.
       * Once the counter reaches the maximum allowed number, all further requests are
       * rejected.
       *
       * **Pro:**
       *
       * - Newer requests are not starved by old ones.
       * - Low storage cost.
       *
       * **Con:**
       *
       * A burst of requests near the boundary of a window can result in a very
       * high request rate because two windows will be filled with requests quickly.
       *
       * @param tokens - How many requests a user can make in each time window.
       * @param window - A fixed timeframe
       */
      static cachedFixedWindow(tokens, window2) {
        const windowDuration = ms(window2)
        return () => ({
          async limit(ctx, identifier, rate) {
            if (!ctx.cache) {
              throw new Error("This algorithm requires a cache")
            }
            if (ctx.dynamicLimits) {
              console.warn(
                "Warning: Dynamic limits are not yet supported for cachedFixedWindow algorithm. The dynamicLimits option will be ignored."
              )
            }
            const bucket = Math.floor(Date.now() / windowDuration)
            const key = [identifier, bucket].join(":")
            const reset = (bucket + 1) * windowDuration
            const incrementBy = rate ?? 1
            const hit = typeof ctx.cache.get(key) === "number"
            if (hit) {
              const cachedTokensAfterUpdate = ctx.cache.incr(key, incrementBy)
              const success = cachedTokensAfterUpdate < tokens
              const pending = success
                ? safeEval(
                    ctx,
                    SCRIPTS.singleRegion.cachedFixedWindow.limit,
                    [key],
                    [windowDuration, incrementBy]
                  )
                : Promise.resolve()
              return {
                success,
                limit: tokens,
                remaining: tokens - cachedTokensAfterUpdate,
                reset,
                pending,
              }
            }
            const usedTokensAfterUpdate = await safeEval(
              ctx,
              SCRIPTS.singleRegion.cachedFixedWindow.limit,
              [key],
              [windowDuration, incrementBy]
            )
            ctx.cache.set(key, usedTokensAfterUpdate)
            const remaining = tokens - usedTokensAfterUpdate
            return {
              success: remaining >= 0,
              limit: tokens,
              remaining,
              reset,
              pending: Promise.resolve(),
            }
          },
          async getRemaining(ctx, identifier) {
            if (!ctx.cache) {
              throw new Error("This algorithm requires a cache")
            }
            const bucket = Math.floor(Date.now() / windowDuration)
            const key = [identifier, bucket].join(":")
            const hit = typeof ctx.cache.get(key) === "number"
            if (hit) {
              const cachedUsedTokens = ctx.cache.get(key) ?? 0
              return {
                remaining: Math.max(0, tokens - cachedUsedTokens),
                reset: (bucket + 1) * windowDuration,
                limit: tokens,
              }
            }
            const usedTokens = await safeEval(
              ctx,
              SCRIPTS.singleRegion.cachedFixedWindow.getRemaining,
              [key],
              [null]
            )
            return {
              remaining: Math.max(0, tokens - usedTokens),
              reset: (bucket + 1) * windowDuration,
              limit: tokens,
            }
          },
          async resetTokens(ctx, identifier) {
            if (!ctx.cache) {
              throw new Error("This algorithm requires a cache")
            }
            const bucket = Math.floor(Date.now() / windowDuration)
            const key = [identifier, bucket].join(":")
            ctx.cache.pop(key)
            const pattern = [identifier, "*"].join(":")
            await safeEval(ctx, RESET_SCRIPT, [pattern], [null])
          },
        })
      }
    }
  },
})

// node_modules/@supabase/supabase-js/dist/index.mjs
var dist_exports = {}
__export(dist_exports, {
  FunctionRegion: () => import_functions_js.FunctionRegion,
  FunctionsError: () => import_functions_js.FunctionsError,
  FunctionsFetchError: () => import_functions_js.FunctionsFetchError,
  FunctionsHttpError: () => import_functions_js.FunctionsHttpError,
  FunctionsRelayError: () => import_functions_js.FunctionsRelayError,
  PostgrestError: () => PostgrestError,
  SupabaseClient: () => SupabaseClient,
  createClient: () => createClient,
})
var import_functions_js = __toESM(require_main(), 1)

// node_modules/@supabase/postgrest-js/dist/index.mjs
var PostgrestError = class extends Error {
  /**
   * @example
   * ```ts
   * import PostgrestError from '@supabase/postgrest-js'
   *
   * throw new PostgrestError({
   *   message: 'Row level security prevented the request',
   *   details: 'RLS denied the insert',
   *   hint: 'Check your policies',
   *   code: 'PGRST301',
   * })
   * ```
   */
  constructor(context) {
    super(context.message)
    this.name = "PostgrestError"
    this.details = context.details
    this.hint = context.hint
    this.code = context.code
  }
}
var PostgrestBuilder = class {
  /**
   * Creates a builder configured for a specific PostgREST request.
   *
   * @example
   * ```ts
   * import PostgrestQueryBuilder from '@supabase/postgrest-js'
   *
   * const builder = new PostgrestQueryBuilder(
   *   new URL('https://xyzcompany.supabase.co/rest/v1/users'),
   *   { headers: new Headers({ apikey: 'public-anon-key' }) }
   * )
   * ```
   */
  constructor(builder) {
    var _builder$shouldThrowO, _builder$isMaybeSingl
    this.shouldThrowOnError = false
    this.method = builder.method
    this.url = builder.url
    this.headers = new Headers(builder.headers)
    this.schema = builder.schema
    this.body = builder.body
    this.shouldThrowOnError =
      (_builder$shouldThrowO = builder.shouldThrowOnError) !== null &&
      _builder$shouldThrowO !== void 0
        ? _builder$shouldThrowO
        : false
    this.signal = builder.signal
    this.isMaybeSingle =
      (_builder$isMaybeSingl = builder.isMaybeSingle) !== null && _builder$isMaybeSingl !== void 0
        ? _builder$isMaybeSingl
        : false
    if (builder.fetch) this.fetch = builder.fetch
    else this.fetch = fetch
  }
  /**
   * If there's an error with the query, throwOnError will reject the promise by
   * throwing the error instead of returning it as part of a successful response.
   *
   * {@link https://github.com/supabase/supabase-js/issues/92}
   */
  throwOnError() {
    this.shouldThrowOnError = true
    return this
  }
  /**
   * Set an HTTP header for the request.
   */
  setHeader(name, value) {
    this.headers = new Headers(this.headers)
    this.headers.set(name, value)
    return this
  }
  then(onfulfilled, onrejected) {
    var _this = this
    if (this.schema === void 0) {
    } else if (["GET", "HEAD"].includes(this.method))
      this.headers.set("Accept-Profile", this.schema)
    else this.headers.set("Content-Profile", this.schema)
    if (this.method !== "GET" && this.method !== "HEAD")
      this.headers.set("Content-Type", "application/json")
    const _fetch = this.fetch
    let res = _fetch(this.url.toString(), {
      method: this.method,
      headers: this.headers,
      body: JSON.stringify(this.body),
      signal: this.signal,
    }).then(async (res$1) => {
      let error = null
      let data = null
      let count = null
      let status = res$1.status
      let statusText = res$1.statusText
      if (res$1.ok) {
        var _this$headers$get2, _res$headers$get
        if (_this.method !== "HEAD") {
          var _this$headers$get
          const body = await res$1.text()
          if (body === "") {
          } else if (_this.headers.get("Accept") === "text/csv") data = body
          else if (
            _this.headers.get("Accept") &&
            ((_this$headers$get = _this.headers.get("Accept")) === null ||
            _this$headers$get === void 0
              ? void 0
              : _this$headers$get.includes("application/vnd.pgrst.plan+text"))
          )
            data = body
          else data = JSON.parse(body)
        }
        const countHeader =
          (_this$headers$get2 = _this.headers.get("Prefer")) === null ||
          _this$headers$get2 === void 0
            ? void 0
            : _this$headers$get2.match(/count=(exact|planned|estimated)/)
        const contentRange =
          (_res$headers$get = res$1.headers.get("content-range")) === null ||
          _res$headers$get === void 0
            ? void 0
            : _res$headers$get.split("/")
        if (countHeader && contentRange && contentRange.length > 1)
          count = parseInt(contentRange[1])
        if (_this.isMaybeSingle && _this.method === "GET" && Array.isArray(data))
          if (data.length > 1) {
            error = {
              code: "PGRST116",
              details: `Results contain ${data.length} rows, application/vnd.pgrst.object+json requires 1 row`,
              hint: null,
              message: "JSON object requested, multiple (or no) rows returned",
            }
            data = null
            count = null
            status = 406
            statusText = "Not Acceptable"
          } else if (data.length === 1) data = data[0]
          else data = null
      } else {
        var _error$details
        const body = await res$1.text()
        try {
          error = JSON.parse(body)
          if (Array.isArray(error) && res$1.status === 404) {
            data = []
            error = null
            status = 200
            statusText = "OK"
          }
        } catch (_unused) {
          if (res$1.status === 404 && body === "") {
            status = 204
            statusText = "No Content"
          } else error = { message: body }
        }
        if (
          error &&
          _this.isMaybeSingle &&
          (error === null ||
          error === void 0 ||
          (_error$details = error.details) === null ||
          _error$details === void 0
            ? void 0
            : _error$details.includes("0 rows"))
        ) {
          error = null
          status = 200
          statusText = "OK"
        }
        if (error && _this.shouldThrowOnError) throw new PostgrestError(error)
      }
      return {
        error,
        data,
        count,
        status,
        statusText,
      }
    })
    if (!this.shouldThrowOnError)
      res = res.catch((fetchError) => {
        var _fetchError$name2
        let errorDetails = ""
        const cause = fetchError === null || fetchError === void 0 ? void 0 : fetchError.cause
        if (cause) {
          var _cause$message, _cause$code, _fetchError$name, _cause$name
          const causeMessage =
            (_cause$message = cause === null || cause === void 0 ? void 0 : cause.message) !==
              null && _cause$message !== void 0
              ? _cause$message
              : ""
          const causeCode =
            (_cause$code = cause === null || cause === void 0 ? void 0 : cause.code) !== null &&
            _cause$code !== void 0
              ? _cause$code
              : ""
          errorDetails = `${(_fetchError$name = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _fetchError$name !== void 0 ? _fetchError$name : "FetchError"}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`
          errorDetails += `

Caused by: ${(_cause$name = cause === null || cause === void 0 ? void 0 : cause.name) !== null && _cause$name !== void 0 ? _cause$name : "Error"}: ${causeMessage}`
          if (causeCode) errorDetails += ` (${causeCode})`
          if (cause === null || cause === void 0 ? void 0 : cause.stack)
            errorDetails += `
${cause.stack}`
        } else {
          var _fetchError$stack
          errorDetails =
            (_fetchError$stack =
              fetchError === null || fetchError === void 0 ? void 0 : fetchError.stack) !== null &&
            _fetchError$stack !== void 0
              ? _fetchError$stack
              : ""
        }
        return {
          error: {
            message: `${(_fetchError$name2 = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _fetchError$name2 !== void 0 ? _fetchError$name2 : "FetchError"}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`,
            details: errorDetails,
            hint: "",
            code: "",
          },
          data: null,
          count: null,
          status: 0,
          statusText: "",
        }
      })
    return res.then(onfulfilled, onrejected)
  }
  /**
   * Override the type of the returned `data`.
   *
   * @typeParam NewResult - The new result type to override with
   * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
   */
  returns() {
    return this
  }
  /**
   * Override the type of the returned `data` field in the response.
   *
   * @typeParam NewResult - The new type to cast the response data to
   * @typeParam Options - Optional type configuration (defaults to { merge: true })
   * @typeParam Options.merge - When true, merges the new type with existing return type. When false, replaces the existing types entirely (defaults to true)
   * @example
   * ```typescript
   * // Merge with existing types (default behavior)
   * const query = supabase
   *   .from('users')
   *   .select()
   *   .overrideTypes<{ custom_field: string }>()
   *
   * // Replace existing types completely
   * const replaceQuery = supabase
   *   .from('users')
   *   .select()
   *   .overrideTypes<{ id: number; name: string }, { merge: false }>()
   * ```
   * @returns A PostgrestBuilder instance with the new type
   */
  overrideTypes() {
    return this
  }
}
var PostgrestTransformBuilder = class extends PostgrestBuilder {
  /**
   * Perform a SELECT on the query result.
   *
   * By default, `.insert()`, `.update()`, `.upsert()`, and `.delete()` do not
   * return modified rows. By calling this method, modified rows are returned in
   * `data`.
   *
   * @param columns - The columns to retrieve, separated by commas
   */
  select(columns) {
    let quoted = false
    const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*")
      .split("")
      .map((c) => {
        if (/\s/.test(c) && !quoted) return ""
        if (c === '"') quoted = !quoted
        return c
      })
      .join("")
    this.url.searchParams.set("select", cleanedColumns)
    this.headers.append("Prefer", "return=representation")
    return this
  }
  /**
   * Order the query result by `column`.
   *
   * You can call this method multiple times to order by multiple columns.
   *
   * You can order referenced tables, but it only affects the ordering of the
   * parent table if you use `!inner` in the query.
   *
   * @param column - The column to order by
   * @param options - Named parameters
   * @param options.ascending - If `true`, the result will be in ascending order
   * @param options.nullsFirst - If `true`, `null`s appear first. If `false`,
   * `null`s appear last.
   * @param options.referencedTable - Set this to order a referenced table by
   * its columns
   * @param options.foreignTable - Deprecated, use `options.referencedTable`
   * instead
   */
  order(
    column,
    { ascending = true, nullsFirst, foreignTable, referencedTable = foreignTable } = {}
  ) {
    const key = referencedTable ? `${referencedTable}.order` : "order"
    const existingOrder = this.url.searchParams.get(key)
    this.url.searchParams.set(
      key,
      `${existingOrder ? `${existingOrder},` : ""}${column}.${ascending ? "asc" : "desc"}${nullsFirst === void 0 ? "" : nullsFirst ? ".nullsfirst" : ".nullslast"}`
    )
    return this
  }
  /**
   * Limit the query result by `count`.
   *
   * @param count - The maximum number of rows to return
   * @param options - Named parameters
   * @param options.referencedTable - Set this to limit rows of referenced
   * tables instead of the parent table
   * @param options.foreignTable - Deprecated, use `options.referencedTable`
   * instead
   */
  limit(count, { foreignTable, referencedTable = foreignTable } = {}) {
    const key = typeof referencedTable === "undefined" ? "limit" : `${referencedTable}.limit`
    this.url.searchParams.set(key, `${count}`)
    return this
  }
  /**
   * Limit the query result by starting at an offset `from` and ending at the offset `to`.
   * Only records within this range are returned.
   * This respects the query order and if there is no order clause the range could behave unexpectedly.
   * The `from` and `to` values are 0-based and inclusive: `range(1, 3)` will include the second, third
   * and fourth rows of the query.
   *
   * @param from - The starting index from which to limit the result
   * @param to - The last index to which to limit the result
   * @param options - Named parameters
   * @param options.referencedTable - Set this to limit rows of referenced
   * tables instead of the parent table
   * @param options.foreignTable - Deprecated, use `options.referencedTable`
   * instead
   */
  range(from, to, { foreignTable, referencedTable = foreignTable } = {}) {
    const keyOffset =
      typeof referencedTable === "undefined" ? "offset" : `${referencedTable}.offset`
    const keyLimit = typeof referencedTable === "undefined" ? "limit" : `${referencedTable}.limit`
    this.url.searchParams.set(keyOffset, `${from}`)
    this.url.searchParams.set(keyLimit, `${to - from + 1}`)
    return this
  }
  /**
   * Set the AbortSignal for the fetch request.
   *
   * @param signal - The AbortSignal to use for the fetch request
   */
  abortSignal(signal) {
    this.signal = signal
    return this
  }
  /**
   * Return `data` as a single object instead of an array of objects.
   *
   * Query result must be one row (e.g. using `.limit(1)`), otherwise this
   * returns an error.
   */
  single() {
    this.headers.set("Accept", "application/vnd.pgrst.object+json")
    return this
  }
  /**
   * Return `data` as a single object instead of an array of objects.
   *
   * Query result must be zero or one row (e.g. using `.limit(1)`), otherwise
   * this returns an error.
   */
  maybeSingle() {
    if (this.method === "GET") this.headers.set("Accept", "application/json")
    else this.headers.set("Accept", "application/vnd.pgrst.object+json")
    this.isMaybeSingle = true
    return this
  }
  /**
   * Return `data` as a string in CSV format.
   */
  csv() {
    this.headers.set("Accept", "text/csv")
    return this
  }
  /**
   * Return `data` as an object in [GeoJSON](https://geojson.org) format.
   */
  geojson() {
    this.headers.set("Accept", "application/geo+json")
    return this
  }
  /**
   * Return `data` as the EXPLAIN plan for the query.
   *
   * You need to enable the
   * [db_plan_enabled](https://supabase.com/docs/guides/database/debugging-performance#enabling-explain)
   * setting before using this method.
   *
   * @param options - Named parameters
   *
   * @param options.analyze - If `true`, the query will be executed and the
   * actual run time will be returned
   *
   * @param options.verbose - If `true`, the query identifier will be returned
   * and `data` will include the output columns of the query
   *
   * @param options.settings - If `true`, include information on configuration
   * parameters that affect query planning
   *
   * @param options.buffers - If `true`, include information on buffer usage
   *
   * @param options.wal - If `true`, include information on WAL record generation
   *
   * @param options.format - The format of the output, can be `"text"` (default)
   * or `"json"`
   */
  explain({
    analyze = false,
    verbose = false,
    settings = false,
    buffers = false,
    wal = false,
    format = "text",
  } = {}) {
    var _this$headers$get
    const options = [
      analyze ? "analyze" : null,
      verbose ? "verbose" : null,
      settings ? "settings" : null,
      buffers ? "buffers" : null,
      wal ? "wal" : null,
    ]
      .filter(Boolean)
      .join("|")
    const forMediatype =
      (_this$headers$get = this.headers.get("Accept")) !== null && _this$headers$get !== void 0
        ? _this$headers$get
        : "application/json"
    this.headers.set(
      "Accept",
      `application/vnd.pgrst.plan+${format}; for="${forMediatype}"; options=${options};`
    )
    if (format === "json") return this
    else return this
  }
  /**
   * Rollback the query.
   *
   * `data` will still be returned, but the query is not committed.
   */
  rollback() {
    this.headers.append("Prefer", "tx=rollback")
    return this
  }
  /**
   * Override the type of the returned `data`.
   *
   * @typeParam NewResult - The new result type to override with
   * @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
   */
  returns() {
    return this
  }
  /**
   * Set the maximum number of rows that can be affected by the query.
   * Only available in PostgREST v13+ and only works with PATCH and DELETE methods.
   *
   * @param value - The maximum number of rows that can be affected
   */
  maxAffected(value) {
    this.headers.append("Prefer", "handling=strict")
    this.headers.append("Prefer", `max-affected=${value}`)
    return this
  }
}
var PostgrestReservedCharsRegexp = /* @__PURE__ */ new RegExp("[,()]")
var PostgrestFilterBuilder = class extends PostgrestTransformBuilder {
  /**
   * Match only rows where `column` is equal to `value`.
   *
   * To check if the value of `column` is NULL, you should use `.is()` instead.
   *
   * @param column - The column to filter on
   * @param value - The value to filter with
   */
  eq(column, value) {
    this.url.searchParams.append(column, `eq.${value}`)
    return this
  }
  /**
   * Match only rows where `column` is not equal to `value`.
   *
   * @param column - The column to filter on
   * @param value - The value to filter with
   */
  neq(column, value) {
    this.url.searchParams.append(column, `neq.${value}`)
    return this
  }
  /**
   * Match only rows where `column` is greater than `value`.
   *
   * @param column - The column to filter on
   * @param value - The value to filter with
   */
  gt(column, value) {
    this.url.searchParams.append(column, `gt.${value}`)
    return this
  }
  /**
   * Match only rows where `column` is greater than or equal to `value`.
   *
   * @param column - The column to filter on
   * @param value - The value to filter with
   */
  gte(column, value) {
    this.url.searchParams.append(column, `gte.${value}`)
    return this
  }
  /**
   * Match only rows where `column` is less than `value`.
   *
   * @param column - The column to filter on
   * @param value - The value to filter with
   */
  lt(column, value) {
    this.url.searchParams.append(column, `lt.${value}`)
    return this
  }
  /**
   * Match only rows where `column` is less than or equal to `value`.
   *
   * @param column - The column to filter on
   * @param value - The value to filter with
   */
  lte(column, value) {
    this.url.searchParams.append(column, `lte.${value}`)
    return this
  }
  /**
   * Match only rows where `column` matches `pattern` case-sensitively.
   *
   * @param column - The column to filter on
   * @param pattern - The pattern to match with
   */
  like(column, pattern) {
    this.url.searchParams.append(column, `like.${pattern}`)
    return this
  }
  /**
   * Match only rows where `column` matches all of `patterns` case-sensitively.
   *
   * @param column - The column to filter on
   * @param patterns - The patterns to match with
   */
  likeAllOf(column, patterns) {
    this.url.searchParams.append(column, `like(all).{${patterns.join(",")}}`)
    return this
  }
  /**
   * Match only rows where `column` matches any of `patterns` case-sensitively.
   *
   * @param column - The column to filter on
   * @param patterns - The patterns to match with
   */
  likeAnyOf(column, patterns) {
    this.url.searchParams.append(column, `like(any).{${patterns.join(",")}}`)
    return this
  }
  /**
   * Match only rows where `column` matches `pattern` case-insensitively.
   *
   * @param column - The column to filter on
   * @param pattern - The pattern to match with
   */
  ilike(column, pattern) {
    this.url.searchParams.append(column, `ilike.${pattern}`)
    return this
  }
  /**
   * Match only rows where `column` matches all of `patterns` case-insensitively.
   *
   * @param column - The column to filter on
   * @param patterns - The patterns to match with
   */
  ilikeAllOf(column, patterns) {
    this.url.searchParams.append(column, `ilike(all).{${patterns.join(",")}}`)
    return this
  }
  /**
   * Match only rows where `column` matches any of `patterns` case-insensitively.
   *
   * @param column - The column to filter on
   * @param patterns - The patterns to match with
   */
  ilikeAnyOf(column, patterns) {
    this.url.searchParams.append(column, `ilike(any).{${patterns.join(",")}}`)
    return this
  }
  /**
   * Match only rows where `column` matches the PostgreSQL regex `pattern`
   * case-sensitively (using the `~` operator).
   *
   * @param column - The column to filter on
   * @param pattern - The PostgreSQL regular expression pattern to match with
   */
  regexMatch(column, pattern) {
    this.url.searchParams.append(column, `match.${pattern}`)
    return this
  }
  /**
   * Match only rows where `column` matches the PostgreSQL regex `pattern`
   * case-insensitively (using the `~*` operator).
   *
   * @param column - The column to filter on
   * @param pattern - The PostgreSQL regular expression pattern to match with
   */
  regexIMatch(column, pattern) {
    this.url.searchParams.append(column, `imatch.${pattern}`)
    return this
  }
  /**
   * Match only rows where `column` IS `value`.
   *
   * For non-boolean columns, this is only relevant for checking if the value of
   * `column` is NULL by setting `value` to `null`.
   *
   * For boolean columns, you can also set `value` to `true` or `false` and it
   * will behave the same way as `.eq()`.
   *
   * @param column - The column to filter on
   * @param value - The value to filter with
   */
  is(column, value) {
    this.url.searchParams.append(column, `is.${value}`)
    return this
  }
  /**
   * Match only rows where `column` IS DISTINCT FROM `value`.
   *
   * Unlike `.neq()`, this treats `NULL` as a comparable value. Two `NULL` values
   * are considered equal (not distinct), and comparing `NULL` with any non-NULL
   * value returns true (distinct).
   *
   * @param column - The column to filter on
   * @param value - The value to filter with
   */
  isDistinct(column, value) {
    this.url.searchParams.append(column, `isdistinct.${value}`)
    return this
  }
  /**
   * Match only rows where `column` is included in the `values` array.
   *
   * @param column - The column to filter on
   * @param values - The values array to filter with
   */
  in(column, values) {
    const cleanedValues = Array.from(new Set(values))
      .map((s) => {
        if (typeof s === "string" && PostgrestReservedCharsRegexp.test(s)) return `"${s}"`
        else return `${s}`
      })
      .join(",")
    this.url.searchParams.append(column, `in.(${cleanedValues})`)
    return this
  }
  /**
   * Match only rows where `column` is NOT included in the `values` array.
   *
   * @param column - The column to filter on
   * @param values - The values array to filter with
   */
  notIn(column, values) {
    const cleanedValues = Array.from(new Set(values))
      .map((s) => {
        if (typeof s === "string" && PostgrestReservedCharsRegexp.test(s)) return `"${s}"`
        else return `${s}`
      })
      .join(",")
    this.url.searchParams.append(column, `not.in.(${cleanedValues})`)
    return this
  }
  /**
   * Only relevant for jsonb, array, and range columns. Match only rows where
   * `column` contains every element appearing in `value`.
   *
   * @param column - The jsonb, array, or range column to filter on
   * @param value - The jsonb, array, or range value to filter with
   */
  contains(column, value) {
    if (typeof value === "string") this.url.searchParams.append(column, `cs.${value}`)
    else if (Array.isArray(value)) this.url.searchParams.append(column, `cs.{${value.join(",")}}`)
    else this.url.searchParams.append(column, `cs.${JSON.stringify(value)}`)
    return this
  }
  /**
   * Only relevant for jsonb, array, and range columns. Match only rows where
   * every element appearing in `column` is contained by `value`.
   *
   * @param column - The jsonb, array, or range column to filter on
   * @param value - The jsonb, array, or range value to filter with
   */
  containedBy(column, value) {
    if (typeof value === "string") this.url.searchParams.append(column, `cd.${value}`)
    else if (Array.isArray(value)) this.url.searchParams.append(column, `cd.{${value.join(",")}}`)
    else this.url.searchParams.append(column, `cd.${JSON.stringify(value)}`)
    return this
  }
  /**
   * Only relevant for range columns. Match only rows where every element in
   * `column` is greater than any element in `range`.
   *
   * @param column - The range column to filter on
   * @param range - The range to filter with
   */
  rangeGt(column, range) {
    this.url.searchParams.append(column, `sr.${range}`)
    return this
  }
  /**
   * Only relevant for range columns. Match only rows where every element in
   * `column` is either contained in `range` or greater than any element in
   * `range`.
   *
   * @param column - The range column to filter on
   * @param range - The range to filter with
   */
  rangeGte(column, range) {
    this.url.searchParams.append(column, `nxl.${range}`)
    return this
  }
  /**
   * Only relevant for range columns. Match only rows where every element in
   * `column` is less than any element in `range`.
   *
   * @param column - The range column to filter on
   * @param range - The range to filter with
   */
  rangeLt(column, range) {
    this.url.searchParams.append(column, `sl.${range}`)
    return this
  }
  /**
   * Only relevant for range columns. Match only rows where every element in
   * `column` is either contained in `range` or less than any element in
   * `range`.
   *
   * @param column - The range column to filter on
   * @param range - The range to filter with
   */
  rangeLte(column, range) {
    this.url.searchParams.append(column, `nxr.${range}`)
    return this
  }
  /**
   * Only relevant for range columns. Match only rows where `column` is
   * mutually exclusive to `range` and there can be no element between the two
   * ranges.
   *
   * @param column - The range column to filter on
   * @param range - The range to filter with
   */
  rangeAdjacent(column, range) {
    this.url.searchParams.append(column, `adj.${range}`)
    return this
  }
  /**
   * Only relevant for array and range columns. Match only rows where
   * `column` and `value` have an element in common.
   *
   * @param column - The array or range column to filter on
   * @param value - The array or range value to filter with
   */
  overlaps(column, value) {
    if (typeof value === "string") this.url.searchParams.append(column, `ov.${value}`)
    else this.url.searchParams.append(column, `ov.{${value.join(",")}}`)
    return this
  }
  /**
   * Only relevant for text and tsvector columns. Match only rows where
   * `column` matches the query string in `query`.
   *
   * @param column - The text or tsvector column to filter on
   * @param query - The query text to match with
   * @param options - Named parameters
   * @param options.config - The text search configuration to use
   * @param options.type - Change how the `query` text is interpreted
   */
  textSearch(column, query, { config, type } = {}) {
    let typePart = ""
    if (type === "plain") typePart = "pl"
    else if (type === "phrase") typePart = "ph"
    else if (type === "websearch") typePart = "w"
    const configPart = config === void 0 ? "" : `(${config})`
    this.url.searchParams.append(column, `${typePart}fts${configPart}.${query}`)
    return this
  }
  /**
   * Match only rows where each column in `query` keys is equal to its
   * associated value. Shorthand for multiple `.eq()`s.
   *
   * @param query - The object to filter with, with column names as keys mapped
   * to their filter values
   */
  match(query) {
    Object.entries(query).forEach(([column, value]) => {
      this.url.searchParams.append(column, `eq.${value}`)
    })
    return this
  }
  /**
   * Match only rows which doesn't satisfy the filter.
   *
   * Unlike most filters, `opearator` and `value` are used as-is and need to
   * follow [PostgREST
   * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
   * to make sure they are properly sanitized.
   *
   * @param column - The column to filter on
   * @param operator - The operator to be negated to filter with, following
   * PostgREST syntax
   * @param value - The value to filter with, following PostgREST syntax
   */
  not(column, operator, value) {
    this.url.searchParams.append(column, `not.${operator}.${value}`)
    return this
  }
  /**
   * Match only rows which satisfy at least one of the filters.
   *
   * Unlike most filters, `filters` is used as-is and needs to follow [PostgREST
   * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
   * to make sure it's properly sanitized.
   *
   * It's currently not possible to do an `.or()` filter across multiple tables.
   *
   * @param filters - The filters to use, following PostgREST syntax
   * @param options - Named parameters
   * @param options.referencedTable - Set this to filter on referenced tables
   * instead of the parent table
   * @param options.foreignTable - Deprecated, use `referencedTable` instead
   */
  or(filters, { foreignTable, referencedTable = foreignTable } = {}) {
    const key = referencedTable ? `${referencedTable}.or` : "or"
    this.url.searchParams.append(key, `(${filters})`)
    return this
  }
  /**
   * Match only rows which satisfy the filter. This is an escape hatch - you
   * should use the specific filter methods wherever possible.
   *
   * Unlike most filters, `opearator` and `value` are used as-is and need to
   * follow [PostgREST
   * syntax](https://postgrest.org/en/stable/api.html#operators). You also need
   * to make sure they are properly sanitized.
   *
   * @param column - The column to filter on
   * @param operator - The operator to filter with, following PostgREST syntax
   * @param value - The value to filter with, following PostgREST syntax
   */
  filter(column, operator, value) {
    this.url.searchParams.append(column, `${operator}.${value}`)
    return this
  }
}
var PostgrestQueryBuilder = class {
  /**
   * Creates a query builder scoped to a Postgres table or view.
   *
   * @example
   * ```ts
   * import PostgrestQueryBuilder from '@supabase/postgrest-js'
   *
   * const query = new PostgrestQueryBuilder(
   *   new URL('https://xyzcompany.supabase.co/rest/v1/users'),
   *   { headers: { apikey: 'public-anon-key' } }
   * )
   * ```
   */
  constructor(url, { headers = {}, schema, fetch: fetch$1 }) {
    this.url = url
    this.headers = new Headers(headers)
    this.schema = schema
    this.fetch = fetch$1
  }
  /**
   * Perform a SELECT query on the table or view.
   *
   * @param columns - The columns to retrieve, separated by commas. Columns can be renamed when returned with `customName:columnName`
   *
   * @param options - Named parameters
   *
   * @param options.head - When set to `true`, `data` will not be returned.
   * Useful if you only need the count.
   *
   * @param options.count - Count algorithm to use to count rows in the table or view.
   *
   * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
   * hood.
   *
   * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
   * statistics under the hood.
   *
   * `"estimated"`: Uses exact count for low numbers and planned count for high
   * numbers.
   */
  select(columns, options) {
    const { head: head2 = false, count } = options !== null && options !== void 0 ? options : {}
    const method = head2 ? "HEAD" : "GET"
    let quoted = false
    const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*")
      .split("")
      .map((c) => {
        if (/\s/.test(c) && !quoted) return ""
        if (c === '"') quoted = !quoted
        return c
      })
      .join("")
    this.url.searchParams.set("select", cleanedColumns)
    if (count) this.headers.append("Prefer", `count=${count}`)
    return new PostgrestFilterBuilder({
      method,
      url: this.url,
      headers: this.headers,
      schema: this.schema,
      fetch: this.fetch,
    })
  }
  /**
   * Perform an INSERT into the table or view.
   *
   * By default, inserted rows are not returned. To return it, chain the call
   * with `.select()`.
   *
   * @param values - The values to insert. Pass an object to insert a single row
   * or an array to insert multiple rows.
   *
   * @param options - Named parameters
   *
   * @param options.count - Count algorithm to use to count inserted rows.
   *
   * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
   * hood.
   *
   * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
   * statistics under the hood.
   *
   * `"estimated"`: Uses exact count for low numbers and planned count for high
   * numbers.
   *
   * @param options.defaultToNull - Make missing fields default to `null`.
   * Otherwise, use the default value for the column. Only applies for bulk
   * inserts.
   */
  insert(values, { count, defaultToNull = true } = {}) {
    var _this$fetch
    const method = "POST"
    if (count) this.headers.append("Prefer", `count=${count}`)
    if (!defaultToNull) this.headers.append("Prefer", `missing=default`)
    if (Array.isArray(values)) {
      const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), [])
      if (columns.length > 0) {
        const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`)
        this.url.searchParams.set("columns", uniqueColumns.join(","))
      }
    }
    return new PostgrestFilterBuilder({
      method,
      url: this.url,
      headers: this.headers,
      schema: this.schema,
      body: values,
      fetch: (_this$fetch = this.fetch) !== null && _this$fetch !== void 0 ? _this$fetch : fetch,
    })
  }
  /**
   * Perform an UPSERT on the table or view. Depending on the column(s) passed
   * to `onConflict`, `.upsert()` allows you to perform the equivalent of
   * `.insert()` if a row with the corresponding `onConflict` columns doesn't
   * exist, or if it does exist, perform an alternative action depending on
   * `ignoreDuplicates`.
   *
   * By default, upserted rows are not returned. To return it, chain the call
   * with `.select()`.
   *
   * @param values - The values to upsert with. Pass an object to upsert a
   * single row or an array to upsert multiple rows.
   *
   * @param options - Named parameters
   *
   * @param options.onConflict - Comma-separated UNIQUE column(s) to specify how
   * duplicate rows are determined. Two rows are duplicates if all the
   * `onConflict` columns are equal.
   *
   * @param options.ignoreDuplicates - If `true`, duplicate rows are ignored. If
   * `false`, duplicate rows are merged with existing rows.
   *
   * @param options.count - Count algorithm to use to count upserted rows.
   *
   * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
   * hood.
   *
   * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
   * statistics under the hood.
   *
   * `"estimated"`: Uses exact count for low numbers and planned count for high
   * numbers.
   *
   * @param options.defaultToNull - Make missing fields default to `null`.
   * Otherwise, use the default value for the column. This only applies when
   * inserting new rows, not when merging with existing rows under
   * `ignoreDuplicates: false`. This also only applies when doing bulk upserts.
   *
   * @example Upsert a single row using a unique key
   * ```ts
   * // Upserting a single row, overwriting based on the 'username' unique column
   * const { data, error } = await supabase
   *   .from('users')
   *   .upsert({ username: 'supabot' }, { onConflict: 'username' })
   *
   * // Example response:
   * // {
   * //   data: [
   * //     { id: 4, message: 'bar', username: 'supabot' }
   * //   ],
   * //   error: null
   * // }
   * ```
   *
   * @example Upsert with conflict resolution and exact row counting
   * ```ts
   * // Upserting and returning exact count
   * const { data, error, count } = await supabase
   *   .from('users')
   *   .upsert(
   *     {
   *       id: 3,
   *       message: 'foo',
   *       username: 'supabot'
   *     },
   *     {
   *       onConflict: 'username',
   *       count: 'exact'
   *     }
   *   )
   *
   * // Example response:
   * // {
   * //   data: [
   * //     {
   * //       id: 42,
   * //       handle: "saoirse",
   * //       display_name: "Saoirse"
   * //     }
   * //   ],
   * //   count: 1,
   * //   error: null
   * // }
   * ```
   */
  upsert(values, { onConflict, ignoreDuplicates = false, count, defaultToNull = true } = {}) {
    var _this$fetch2
    const method = "POST"
    this.headers.append("Prefer", `resolution=${ignoreDuplicates ? "ignore" : "merge"}-duplicates`)
    if (onConflict !== void 0) this.url.searchParams.set("on_conflict", onConflict)
    if (count) this.headers.append("Prefer", `count=${count}`)
    if (!defaultToNull) this.headers.append("Prefer", "missing=default")
    if (Array.isArray(values)) {
      const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), [])
      if (columns.length > 0) {
        const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`)
        this.url.searchParams.set("columns", uniqueColumns.join(","))
      }
    }
    return new PostgrestFilterBuilder({
      method,
      url: this.url,
      headers: this.headers,
      schema: this.schema,
      body: values,
      fetch: (_this$fetch2 = this.fetch) !== null && _this$fetch2 !== void 0 ? _this$fetch2 : fetch,
    })
  }
  /**
   * Perform an UPDATE on the table or view.
   *
   * By default, updated rows are not returned. To return it, chain the call
   * with `.select()` after filters.
   *
   * @param values - The values to update with
   *
   * @param options - Named parameters
   *
   * @param options.count - Count algorithm to use to count updated rows.
   *
   * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
   * hood.
   *
   * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
   * statistics under the hood.
   *
   * `"estimated"`: Uses exact count for low numbers and planned count for high
   * numbers.
   */
  update(values, { count } = {}) {
    var _this$fetch3
    const method = "PATCH"
    if (count) this.headers.append("Prefer", `count=${count}`)
    return new PostgrestFilterBuilder({
      method,
      url: this.url,
      headers: this.headers,
      schema: this.schema,
      body: values,
      fetch: (_this$fetch3 = this.fetch) !== null && _this$fetch3 !== void 0 ? _this$fetch3 : fetch,
    })
  }
  /**
   * Perform a DELETE on the table or view.
   *
   * By default, deleted rows are not returned. To return it, chain the call
   * with `.select()` after filters.
   *
   * @param options - Named parameters
   *
   * @param options.count - Count algorithm to use to count deleted rows.
   *
   * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
   * hood.
   *
   * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
   * statistics under the hood.
   *
   * `"estimated"`: Uses exact count for low numbers and planned count for high
   * numbers.
   */
  delete({ count } = {}) {
    var _this$fetch4
    const method = "DELETE"
    if (count) this.headers.append("Prefer", `count=${count}`)
    return new PostgrestFilterBuilder({
      method,
      url: this.url,
      headers: this.headers,
      schema: this.schema,
      fetch: (_this$fetch4 = this.fetch) !== null && _this$fetch4 !== void 0 ? _this$fetch4 : fetch,
    })
  }
}
var PostgrestClient = class PostgrestClient2 {
  /**
   * Creates a PostgREST client.
   *
   * @param url - URL of the PostgREST endpoint
   * @param options - Named parameters
   * @param options.headers - Custom headers
   * @param options.schema - Postgres schema to switch to
   * @param options.fetch - Custom fetch
   * @example
   * ```ts
   * import PostgrestClient from '@supabase/postgrest-js'
   *
   * const postgrest = new PostgrestClient('https://xyzcompany.supabase.co/rest/v1', {
   *   headers: { apikey: 'public-anon-key' },
   *   schema: 'public',
   * })
   * ```
   */
  constructor(url, { headers = {}, schema, fetch: fetch$1 } = {}) {
    this.url = url
    this.headers = new Headers(headers)
    this.schemaName = schema
    this.fetch = fetch$1
  }
  /**
   * Perform a query on a table or a view.
   *
   * @param relation - The table or view name to query
   */
  from(relation) {
    if (!relation || typeof relation !== "string" || relation.trim() === "")
      throw new Error("Invalid relation name: relation must be a non-empty string.")
    return new PostgrestQueryBuilder(new URL(`${this.url}/${relation}`), {
      headers: new Headers(this.headers),
      schema: this.schemaName,
      fetch: this.fetch,
    })
  }
  /**
   * Select a schema to query or perform an function (rpc) call.
   *
   * The schema needs to be on the list of exposed schemas inside Supabase.
   *
   * @param schema - The schema to query
   */
  schema(schema) {
    return new PostgrestClient2(this.url, {
      headers: this.headers,
      schema,
      fetch: this.fetch,
    })
  }
  /**
   * Perform a function call.
   *
   * @param fn - The function name to call
   * @param args - The arguments to pass to the function call
   * @param options - Named parameters
   * @param options.head - When set to `true`, `data` will not be returned.
   * Useful if you only need the count.
   * @param options.get - When set to `true`, the function will be called with
   * read-only access mode.
   * @param options.count - Count algorithm to use to count rows returned by the
   * function. Only applicable for [set-returning
   * functions](https://www.postgresql.org/docs/current/functions-srf.html).
   *
   * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
   * hood.
   *
   * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
   * statistics under the hood.
   *
   * `"estimated"`: Uses exact count for low numbers and planned count for high
   * numbers.
   *
   * @example
   * ```ts
   * // For cross-schema functions where type inference fails, use overrideTypes:
   * const { data } = await supabase
   *   .schema('schema_b')
   *   .rpc('function_a', {})
   *   .overrideTypes<{ id: string; user_id: string }[]>()
   * ```
   */
  rpc(fn, args = {}, { head: head2 = false, get: get2 = false, count } = {}) {
    var _this$fetch
    let method
    const url = new URL(`${this.url}/rpc/${fn}`)
    let body
    if (head2 || get2) {
      method = head2 ? "HEAD" : "GET"
      Object.entries(args)
        .filter(([_, value]) => value !== void 0)
        .map(([name, value]) => [name, Array.isArray(value) ? `{${value.join(",")}}` : `${value}`])
        .forEach(([name, value]) => {
          url.searchParams.append(name, value)
        })
    } else {
      method = "POST"
      body = args
    }
    const headers = new Headers(this.headers)
    if (count) headers.set("Prefer", `count=${count}`)
    return new PostgrestFilterBuilder({
      method,
      url,
      headers,
      schema: this.schemaName,
      body,
      fetch: (_this$fetch = this.fetch) !== null && _this$fetch !== void 0 ? _this$fetch : fetch,
    })
  }
}

// node_modules/@supabase/supabase-js/dist/index.mjs
var import_realtime_js = __toESM(require_main2(), 1)

// node_modules/iceberg-js/dist/index.mjs
var IcebergError = class extends Error {
  constructor(message, opts) {
    super(message)
    this.name = "IcebergError"
    this.status = opts.status
    this.icebergType = opts.icebergType
    this.icebergCode = opts.icebergCode
    this.details = opts.details
    this.isCommitStateUnknown =
      opts.icebergType === "CommitStateUnknownException" ||
      ([500, 502, 504].includes(opts.status) && opts.icebergType?.includes("CommitState") === true)
  }
  /**
   * Returns true if the error is a 404 Not Found error.
   */
  isNotFound() {
    return this.status === 404
  }
  /**
   * Returns true if the error is a 409 Conflict error.
   */
  isConflict() {
    return this.status === 409
  }
  /**
   * Returns true if the error is a 419 Authentication Timeout error.
   */
  isAuthenticationTimeout() {
    return this.status === 419
  }
}
function buildUrl(baseUrl, path, query) {
  const url = new URL(path, baseUrl)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== void 0) {
        url.searchParams.set(key, value)
      }
    }
  }
  return url.toString()
}
async function buildAuthHeaders(auth) {
  if (!auth || auth.type === "none") {
    return {}
  }
  if (auth.type === "bearer") {
    return { Authorization: `Bearer ${auth.token}` }
  }
  if (auth.type === "header") {
    return { [auth.name]: auth.value }
  }
  if (auth.type === "custom") {
    return await auth.getHeaders()
  }
  return {}
}
function createFetchClient(options) {
  const fetchFn = options.fetchImpl ?? globalThis.fetch
  return {
    async request({ method, path, query, body, headers }) {
      const url = buildUrl(options.baseUrl, path, query)
      const authHeaders = await buildAuthHeaders(options.auth)
      const res = await fetchFn(url, {
        method,
        headers: {
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...authHeaders,
          ...headers,
        },
        body: body ? JSON.stringify(body) : void 0,
      })
      const text = await res.text()
      const isJson = (res.headers.get("content-type") || "").includes("application/json")
      const data = isJson && text ? JSON.parse(text) : text
      if (!res.ok) {
        const errBody = isJson ? data : void 0
        const errorDetail = errBody?.error
        throw new IcebergError(errorDetail?.message ?? `Request failed with status ${res.status}`, {
          status: res.status,
          icebergType: errorDetail?.type,
          icebergCode: errorDetail?.code,
          details: errBody,
        })
      }
      return { status: res.status, headers: res.headers, data }
    },
  }
}
function namespaceToPath(namespace) {
  return namespace.join("")
}
var NamespaceOperations = class {
  constructor(client, prefix = "") {
    this.client = client
    this.prefix = prefix
  }
  async listNamespaces(parent) {
    const query = parent ? { parent: namespaceToPath(parent.namespace) } : void 0
    const response = await this.client.request({
      method: "GET",
      path: `${this.prefix}/namespaces`,
      query,
    })
    return response.data.namespaces.map((ns) => ({ namespace: ns }))
  }
  async createNamespace(id, metadata) {
    const request = {
      namespace: id.namespace,
      properties: metadata?.properties,
    }
    const response = await this.client.request({
      method: "POST",
      path: `${this.prefix}/namespaces`,
      body: request,
    })
    return response.data
  }
  async dropNamespace(id) {
    await this.client.request({
      method: "DELETE",
      path: `${this.prefix}/namespaces/${namespaceToPath(id.namespace)}`,
    })
  }
  async loadNamespaceMetadata(id) {
    const response = await this.client.request({
      method: "GET",
      path: `${this.prefix}/namespaces/${namespaceToPath(id.namespace)}`,
    })
    return {
      properties: response.data.properties,
    }
  }
  async namespaceExists(id) {
    try {
      await this.client.request({
        method: "HEAD",
        path: `${this.prefix}/namespaces/${namespaceToPath(id.namespace)}`,
      })
      return true
    } catch (error) {
      if (error instanceof IcebergError && error.status === 404) {
        return false
      }
      throw error
    }
  }
  async createNamespaceIfNotExists(id, metadata) {
    try {
      return await this.createNamespace(id, metadata)
    } catch (error) {
      if (error instanceof IcebergError && error.status === 409) {
        return
      }
      throw error
    }
  }
}
function namespaceToPath2(namespace) {
  return namespace.join("")
}
var TableOperations = class {
  constructor(client, prefix = "", accessDelegation) {
    this.client = client
    this.prefix = prefix
    this.accessDelegation = accessDelegation
  }
  async listTables(namespace) {
    const response = await this.client.request({
      method: "GET",
      path: `${this.prefix}/namespaces/${namespaceToPath2(namespace.namespace)}/tables`,
    })
    return response.data.identifiers
  }
  async createTable(namespace, request) {
    const headers = {}
    if (this.accessDelegation) {
      headers["X-Iceberg-Access-Delegation"] = this.accessDelegation
    }
    const response = await this.client.request({
      method: "POST",
      path: `${this.prefix}/namespaces/${namespaceToPath2(namespace.namespace)}/tables`,
      body: request,
      headers,
    })
    return response.data.metadata
  }
  async updateTable(id, request) {
    const response = await this.client.request({
      method: "POST",
      path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
      body: request,
    })
    return {
      "metadata-location": response.data["metadata-location"],
      metadata: response.data.metadata,
    }
  }
  async dropTable(id, options) {
    await this.client.request({
      method: "DELETE",
      path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
      query: { purgeRequested: String(options?.purge ?? false) },
    })
  }
  async loadTable(id) {
    const headers = {}
    if (this.accessDelegation) {
      headers["X-Iceberg-Access-Delegation"] = this.accessDelegation
    }
    const response = await this.client.request({
      method: "GET",
      path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
      headers,
    })
    return response.data.metadata
  }
  async tableExists(id) {
    const headers = {}
    if (this.accessDelegation) {
      headers["X-Iceberg-Access-Delegation"] = this.accessDelegation
    }
    try {
      await this.client.request({
        method: "HEAD",
        path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
        headers,
      })
      return true
    } catch (error) {
      if (error instanceof IcebergError && error.status === 404) {
        return false
      }
      throw error
    }
  }
  async createTableIfNotExists(namespace, request) {
    try {
      return await this.createTable(namespace, request)
    } catch (error) {
      if (error instanceof IcebergError && error.status === 409) {
        return await this.loadTable({ namespace: namespace.namespace, name: request.name })
      }
      throw error
    }
  }
}
var IcebergRestCatalog = class {
  /**
   * Creates a new Iceberg REST Catalog client.
   *
   * @param options - Configuration options for the catalog client
   */
  constructor(options) {
    let prefix = "v1"
    if (options.catalogName) {
      prefix += `/${options.catalogName}`
    }
    const baseUrl = options.baseUrl.endsWith("/") ? options.baseUrl : `${options.baseUrl}/`
    this.client = createFetchClient({
      baseUrl,
      auth: options.auth,
      fetchImpl: options.fetch,
    })
    this.accessDelegation = options.accessDelegation?.join(",")
    this.namespaceOps = new NamespaceOperations(this.client, prefix)
    this.tableOps = new TableOperations(this.client, prefix, this.accessDelegation)
  }
  /**
   * Lists all namespaces in the catalog.
   *
   * @param parent - Optional parent namespace to list children under
   * @returns Array of namespace identifiers
   *
   * @example
   * ```typescript
   * // List all top-level namespaces
   * const namespaces = await catalog.listNamespaces();
   *
   * // List namespaces under a parent
   * const children = await catalog.listNamespaces({ namespace: ['analytics'] });
   * ```
   */
  async listNamespaces(parent) {
    return this.namespaceOps.listNamespaces(parent)
  }
  /**
   * Creates a new namespace in the catalog.
   *
   * @param id - Namespace identifier to create
   * @param metadata - Optional metadata properties for the namespace
   * @returns Response containing the created namespace and its properties
   *
   * @example
   * ```typescript
   * const response = await catalog.createNamespace(
   *   { namespace: ['analytics'] },
   *   { properties: { owner: 'data-team' } }
   * );
   * console.log(response.namespace); // ['analytics']
   * console.log(response.properties); // { owner: 'data-team', ... }
   * ```
   */
  async createNamespace(id, metadata) {
    return this.namespaceOps.createNamespace(id, metadata)
  }
  /**
   * Drops a namespace from the catalog.
   *
   * The namespace must be empty (contain no tables) before it can be dropped.
   *
   * @param id - Namespace identifier to drop
   *
   * @example
   * ```typescript
   * await catalog.dropNamespace({ namespace: ['analytics'] });
   * ```
   */
  async dropNamespace(id) {
    await this.namespaceOps.dropNamespace(id)
  }
  /**
   * Loads metadata for a namespace.
   *
   * @param id - Namespace identifier to load
   * @returns Namespace metadata including properties
   *
   * @example
   * ```typescript
   * const metadata = await catalog.loadNamespaceMetadata({ namespace: ['analytics'] });
   * console.log(metadata.properties);
   * ```
   */
  async loadNamespaceMetadata(id) {
    return this.namespaceOps.loadNamespaceMetadata(id)
  }
  /**
   * Lists all tables in a namespace.
   *
   * @param namespace - Namespace identifier to list tables from
   * @returns Array of table identifiers
   *
   * @example
   * ```typescript
   * const tables = await catalog.listTables({ namespace: ['analytics'] });
   * console.log(tables); // [{ namespace: ['analytics'], name: 'events' }, ...]
   * ```
   */
  async listTables(namespace) {
    return this.tableOps.listTables(namespace)
  }
  /**
   * Creates a new table in the catalog.
   *
   * @param namespace - Namespace to create the table in
   * @param request - Table creation request including name, schema, partition spec, etc.
   * @returns Table metadata for the created table
   *
   * @example
   * ```typescript
   * const metadata = await catalog.createTable(
   *   { namespace: ['analytics'] },
   *   {
   *     name: 'events',
   *     schema: {
   *       type: 'struct',
   *       fields: [
   *         { id: 1, name: 'id', type: 'long', required: true },
   *         { id: 2, name: 'timestamp', type: 'timestamp', required: true }
   *       ],
   *       'schema-id': 0
   *     },
   *     'partition-spec': {
   *       'spec-id': 0,
   *       fields: [
   *         { source_id: 2, field_id: 1000, name: 'ts_day', transform: 'day' }
   *       ]
   *     }
   *   }
   * );
   * ```
   */
  async createTable(namespace, request) {
    return this.tableOps.createTable(namespace, request)
  }
  /**
   * Updates an existing table's metadata.
   *
   * Can update the schema, partition spec, or properties of a table.
   *
   * @param id - Table identifier to update
   * @param request - Update request with fields to modify
   * @returns Response containing the metadata location and updated table metadata
   *
   * @example
   * ```typescript
   * const response = await catalog.updateTable(
   *   { namespace: ['analytics'], name: 'events' },
   *   {
   *     properties: { 'read.split.target-size': '134217728' }
   *   }
   * );
   * console.log(response['metadata-location']); // s3://...
   * console.log(response.metadata); // TableMetadata object
   * ```
   */
  async updateTable(id, request) {
    return this.tableOps.updateTable(id, request)
  }
  /**
   * Drops a table from the catalog.
   *
   * @param id - Table identifier to drop
   *
   * @example
   * ```typescript
   * await catalog.dropTable({ namespace: ['analytics'], name: 'events' });
   * ```
   */
  async dropTable(id, options) {
    await this.tableOps.dropTable(id, options)
  }
  /**
   * Loads metadata for a table.
   *
   * @param id - Table identifier to load
   * @returns Table metadata including schema, partition spec, location, etc.
   *
   * @example
   * ```typescript
   * const metadata = await catalog.loadTable({ namespace: ['analytics'], name: 'events' });
   * console.log(metadata.schema);
   * console.log(metadata.location);
   * ```
   */
  async loadTable(id) {
    return this.tableOps.loadTable(id)
  }
  /**
   * Checks if a namespace exists in the catalog.
   *
   * @param id - Namespace identifier to check
   * @returns True if the namespace exists, false otherwise
   *
   * @example
   * ```typescript
   * const exists = await catalog.namespaceExists({ namespace: ['analytics'] });
   * console.log(exists); // true or false
   * ```
   */
  async namespaceExists(id) {
    return this.namespaceOps.namespaceExists(id)
  }
  /**
   * Checks if a table exists in the catalog.
   *
   * @param id - Table identifier to check
   * @returns True if the table exists, false otherwise
   *
   * @example
   * ```typescript
   * const exists = await catalog.tableExists({ namespace: ['analytics'], name: 'events' });
   * console.log(exists); // true or false
   * ```
   */
  async tableExists(id) {
    return this.tableOps.tableExists(id)
  }
  /**
   * Creates a namespace if it does not exist.
   *
   * If the namespace already exists, returns void. If created, returns the response.
   *
   * @param id - Namespace identifier to create
   * @param metadata - Optional metadata properties for the namespace
   * @returns Response containing the created namespace and its properties, or void if it already exists
   *
   * @example
   * ```typescript
   * const response = await catalog.createNamespaceIfNotExists(
   *   { namespace: ['analytics'] },
   *   { properties: { owner: 'data-team' } }
   * );
   * if (response) {
   *   console.log('Created:', response.namespace);
   * } else {
   *   console.log('Already exists');
   * }
   * ```
   */
  async createNamespaceIfNotExists(id, metadata) {
    return this.namespaceOps.createNamespaceIfNotExists(id, metadata)
  }
  /**
   * Creates a table if it does not exist.
   *
   * If the table already exists, returns its metadata instead.
   *
   * @param namespace - Namespace to create the table in
   * @param request - Table creation request including name, schema, partition spec, etc.
   * @returns Table metadata for the created or existing table
   *
   * @example
   * ```typescript
   * const metadata = await catalog.createTableIfNotExists(
   *   { namespace: ['analytics'] },
   *   {
   *     name: 'events',
   *     schema: {
   *       type: 'struct',
   *       fields: [
   *         { id: 1, name: 'id', type: 'long', required: true },
   *         { id: 2, name: 'timestamp', type: 'timestamp', required: true }
   *       ],
   *       'schema-id': 0
   *     }
   *   }
   * );
   * ```
   */
  async createTableIfNotExists(namespace, request) {
    return this.tableOps.createTableIfNotExists(namespace, request)
  }
}

// node_modules/@supabase/storage-js/dist/index.mjs
var StorageError = class extends Error {
  constructor(message) {
    super(message)
    this.__isStorageError = true
    this.name = "StorageError"
  }
}
function isStorageError(error) {
  return typeof error === "object" && error !== null && "__isStorageError" in error
}
var StorageApiError = class extends StorageError {
  constructor(message, status, statusCode) {
    super(message)
    this.name = "StorageApiError"
    this.status = status
    this.statusCode = statusCode
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      statusCode: this.statusCode,
    }
  }
}
var StorageUnknownError = class extends StorageError {
  constructor(message, originalError) {
    super(message)
    this.name = "StorageUnknownError"
    this.originalError = originalError
  }
}
var resolveFetch$1 = (customFetch) => {
  if (customFetch) return (...args) => customFetch(...args)
  return (...args) => fetch(...args)
}
var resolveResponse$1 = () => {
  return Response
}
var recursiveToCamel = (item) => {
  if (Array.isArray(item)) return item.map((el) => recursiveToCamel(el))
  else if (typeof item === "function" || item !== Object(item)) return item
  const result = {}
  Object.entries(item).forEach(([key, value]) => {
    const newKey = key.replace(/([-_][a-z])/gi, (c) => c.toUpperCase().replace(/[-_]/g, ""))
    result[newKey] = recursiveToCamel(value)
  })
  return result
}
var isPlainObject$1 = (value) => {
  if (typeof value !== "object" || value === null) return false
  const prototype = Object.getPrototypeOf(value)
  return (
    (prototype === null ||
      prototype === Object.prototype ||
      Object.getPrototypeOf(prototype) === null) &&
    !(Symbol.toStringTag in value) &&
    !(Symbol.iterator in value)
  )
}
var isValidBucketName = (bucketName) => {
  if (!bucketName || typeof bucketName !== "string") return false
  if (bucketName.length === 0 || bucketName.length > 100) return false
  if (bucketName.trim() !== bucketName) return false
  if (bucketName.includes("/") || bucketName.includes("\\")) return false
  return /^[\w!.\*'() &$@=;:+,?-]+$/.test(bucketName)
}
function _typeof(o) {
  "@babel/helpers - typeof"
  return (
    (_typeof =
      "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
        ? function (o$1) {
            return typeof o$1
          }
        : function (o$1) {
            return o$1 &&
              "function" == typeof Symbol &&
              o$1.constructor === Symbol &&
              o$1 !== Symbol.prototype
              ? "symbol"
              : typeof o$1
          }),
    _typeof(o)
  )
}
function toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t
  var e = t[Symbol.toPrimitive]
  if (void 0 !== e) {
    var i = e.call(t, r || "default")
    if ("object" != _typeof(i)) return i
    throw new TypeError("@@toPrimitive must return a primitive value.")
  }
  return ("string" === r ? String : Number)(t)
}
function toPropertyKey(t) {
  var i = toPrimitive(t, "string")
  return "symbol" == _typeof(i) ? i : i + ""
}
function _defineProperty(e, r, t) {
  return (
    (r = toPropertyKey(r)) in e
      ? Object.defineProperty(e, r, {
          value: t,
          enumerable: true,
          configurable: true,
          writable: true,
        })
      : (e[r] = t),
    e
  )
}
function ownKeys2(e, r) {
  var t = Object.keys(e)
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e)
    ;(r &&
      (o = o.filter(function (r$1) {
        return Object.getOwnPropertyDescriptor(e, r$1).enumerable
      })),
      t.push.apply(t, o))
  }
  return t
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {}
    r % 2
      ? ownKeys2(Object(t), true).forEach(function (r$1) {
          _defineProperty(e, r$1, t[r$1])
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
        : ownKeys2(Object(t)).forEach(function (r$1) {
            Object.defineProperty(e, r$1, Object.getOwnPropertyDescriptor(t, r$1))
          })
  }
  return e
}
var _getErrorMessage$1 = (err) => {
  var _err$error
  return (
    err.msg ||
    err.message ||
    err.error_description ||
    (typeof err.error === "string"
      ? err.error
      : (_err$error = err.error) === null || _err$error === void 0
        ? void 0
        : _err$error.message) ||
    JSON.stringify(err)
  )
}
var handleError$1 = async (error, reject, options) => {
  if (
    error instanceof (await resolveResponse$1()) &&
    !(options === null || options === void 0 ? void 0 : options.noResolveJson)
  )
    error
      .json()
      .then((err) => {
        const status = error.status || 500
        const statusCode = (err === null || err === void 0 ? void 0 : err.statusCode) || status + ""
        reject(new StorageApiError(_getErrorMessage$1(err), status, statusCode))
      })
      .catch((err) => {
        reject(new StorageUnknownError(_getErrorMessage$1(err), err))
      })
  else reject(new StorageUnknownError(_getErrorMessage$1(error), error))
}
var _getRequestParams$1 = (method, options, parameters, body) => {
  const params = {
    method,
    headers: (options === null || options === void 0 ? void 0 : options.headers) || {},
  }
  if (method === "GET" || !body) return params
  if (isPlainObject$1(body)) {
    params.headers = _objectSpread2(
      { "Content-Type": "application/json" },
      options === null || options === void 0 ? void 0 : options.headers
    )
    params.body = JSON.stringify(body)
  } else params.body = body
  if (options === null || options === void 0 ? void 0 : options.duplex)
    params.duplex = options.duplex
  return _objectSpread2(_objectSpread2({}, params), parameters)
}
async function _handleRequest$1(fetcher, method, url, options, parameters, body) {
  return new Promise((resolve, reject) => {
    fetcher(url, _getRequestParams$1(method, options, parameters, body))
      .then((result) => {
        if (!result.ok) throw result
        if (options === null || options === void 0 ? void 0 : options.noResolveJson) return result
        return result.json()
      })
      .then((data) => resolve(data))
      .catch((error) => handleError$1(error, reject, options))
  })
}
async function get(fetcher, url, options, parameters) {
  return _handleRequest$1(fetcher, "GET", url, options, parameters)
}
async function post$1(fetcher, url, body, options, parameters) {
  return _handleRequest$1(fetcher, "POST", url, options, parameters, body)
}
async function put(fetcher, url, body, options, parameters) {
  return _handleRequest$1(fetcher, "PUT", url, options, parameters, body)
}
async function head(fetcher, url, options, parameters) {
  return _handleRequest$1(
    fetcher,
    "HEAD",
    url,
    _objectSpread2(_objectSpread2({}, options), {}, { noResolveJson: true }),
    parameters
  )
}
async function remove(fetcher, url, body, options, parameters) {
  return _handleRequest$1(fetcher, "DELETE", url, options, parameters, body)
}
var StreamDownloadBuilder = class {
  constructor(downloadFn, shouldThrowOnError) {
    this.downloadFn = downloadFn
    this.shouldThrowOnError = shouldThrowOnError
  }
  then(onfulfilled, onrejected) {
    return this.execute().then(onfulfilled, onrejected)
  }
  async execute() {
    var _this = this
    try {
      return {
        data: (await _this.downloadFn()).body,
        error: null,
      }
    } catch (error) {
      if (_this.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
}
var _Symbol$toStringTag
_Symbol$toStringTag = Symbol.toStringTag
var BlobDownloadBuilder = class {
  constructor(downloadFn, shouldThrowOnError) {
    this.downloadFn = downloadFn
    this.shouldThrowOnError = shouldThrowOnError
    this[_Symbol$toStringTag] = "BlobDownloadBuilder"
    this.promise = null
  }
  asStream() {
    return new StreamDownloadBuilder(this.downloadFn, this.shouldThrowOnError)
  }
  then(onfulfilled, onrejected) {
    return this.getPromise().then(onfulfilled, onrejected)
  }
  catch(onrejected) {
    return this.getPromise().catch(onrejected)
  }
  finally(onfinally) {
    return this.getPromise().finally(onfinally)
  }
  getPromise() {
    if (!this.promise) this.promise = this.execute()
    return this.promise
  }
  async execute() {
    var _this = this
    try {
      return {
        data: await (await _this.downloadFn()).blob(),
        error: null,
      }
    } catch (error) {
      if (_this.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
}
var DEFAULT_SEARCH_OPTIONS = {
  limit: 100,
  offset: 0,
  sortBy: {
    column: "name",
    order: "asc",
  },
}
var DEFAULT_FILE_OPTIONS = {
  cacheControl: "3600",
  contentType: "text/plain;charset=UTF-8",
  upsert: false,
}
var StorageFileApi = class {
  constructor(url, headers = {}, bucketId, fetch$1) {
    this.shouldThrowOnError = false
    this.url = url
    this.headers = headers
    this.bucketId = bucketId
    this.fetch = resolveFetch$1(fetch$1)
  }
  /**
   * Enable throwing errors instead of returning them.
   *
   * @category File Buckets
   */
  throwOnError() {
    this.shouldThrowOnError = true
    return this
  }
  /**
   * Uploads a file to an existing bucket or replaces an existing file at the specified path with a new one.
   *
   * @param method HTTP method.
   * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
   * @param fileBody The body of the file to be stored in the bucket.
   */
  async uploadOrUpdate(method, path, fileBody, fileOptions) {
    var _this = this
    try {
      let body
      const options = _objectSpread2(_objectSpread2({}, DEFAULT_FILE_OPTIONS), fileOptions)
      let headers = _objectSpread2(
        _objectSpread2({}, _this.headers),
        method === "POST" && { "x-upsert": String(options.upsert) }
      )
      const metadata = options.metadata
      if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
        body = new FormData()
        body.append("cacheControl", options.cacheControl)
        if (metadata) body.append("metadata", _this.encodeMetadata(metadata))
        body.append("", fileBody)
      } else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
        body = fileBody
        if (!body.has("cacheControl")) body.append("cacheControl", options.cacheControl)
        if (metadata && !body.has("metadata"))
          body.append("metadata", _this.encodeMetadata(metadata))
      } else {
        body = fileBody
        headers["cache-control"] = `max-age=${options.cacheControl}`
        headers["content-type"] = options.contentType
        if (metadata) headers["x-metadata"] = _this.toBase64(_this.encodeMetadata(metadata))
        if (
          ((typeof ReadableStream !== "undefined" && body instanceof ReadableStream) ||
            (body &&
              typeof body === "object" &&
              "pipe" in body &&
              typeof body.pipe === "function")) &&
          !options.duplex
        )
          options.duplex = "half"
      }
      if (fileOptions === null || fileOptions === void 0 ? void 0 : fileOptions.headers)
        headers = _objectSpread2(_objectSpread2({}, headers), fileOptions.headers)
      const cleanPath = _this._removeEmptyFolders(path)
      const _path = _this._getFinalPath(cleanPath)
      const data = await (method == "PUT" ? put : post$1)(
        _this.fetch,
        `${_this.url}/object/${_path}`,
        body,
        _objectSpread2(
          { headers },
          (options === null || options === void 0 ? void 0 : options.duplex)
            ? { duplex: options.duplex }
            : {}
        )
      )
      return {
        data: {
          path: cleanPath,
          id: data.Id,
          fullPath: data.Key,
        },
        error: null,
      }
    } catch (error) {
      if (_this.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /**
   * Uploads a file to an existing bucket.
   *
   * @category File Buckets
   * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
   * @param fileBody The body of the file to be stored in the bucket.
   * @param fileOptions Optional file upload options including cacheControl, contentType, upsert, and metadata.
   * @returns Promise with response containing file path, id, and fullPath or error
   *
   * @example Upload file
   * ```js
   * const avatarFile = event.target.files[0]
   * const { data, error } = await supabase
   *   .storage
   *   .from('avatars')
   *   .upload('public/avatar1.png', avatarFile, {
   *     cacheControl: '3600',
   *     upsert: false
   *   })
   * ```
   *
   * Response:
   * ```json
   * {
   *   "data": {
   *     "path": "public/avatar1.png",
   *     "fullPath": "avatars/public/avatar1.png"
   *   },
   *   "error": null
   * }
   * ```
   *
   * @example Upload file using `ArrayBuffer` from base64 file data
   * ```js
   * import { decode } from 'base64-arraybuffer'
   *
   * const { data, error } = await supabase
   *   .storage
   *   .from('avatars')
   *   .upload('public/avatar1.png', decode('base64FileData'), {
   *     contentType: 'image/png'
   *   })
   * ```
   */
  async upload(path, fileBody, fileOptions) {
    return this.uploadOrUpdate("POST", path, fileBody, fileOptions)
  }
  /**
   * Upload a file with a token generated from `createSignedUploadUrl`.
   *
   * @category File Buckets
   * @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
   * @param token The token generated from `createSignedUploadUrl`
   * @param fileBody The body of the file to be stored in the bucket.
   * @param fileOptions HTTP headers (cacheControl, contentType, etc.).
   * **Note:** The `upsert` option has no effect here. To enable upsert behavior,
   * pass `{ upsert: true }` when calling `createSignedUploadUrl()` instead.
   * @returns Promise with response containing file path and fullPath or error
   *
   * @example Upload to a signed URL
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .from('avatars')
   *   .uploadToSignedUrl('folder/cat.jpg', 'token-from-createSignedUploadUrl', file)
   * ```
   *
   * Response:
   * ```json
   * {
   *   "data": {
   *     "path": "folder/cat.jpg",
   *     "fullPath": "avatars/folder/cat.jpg"
   *   },
   *   "error": null
   * }
   * ```
   */
  async uploadToSignedUrl(path, token, fileBody, fileOptions) {
    var _this3 = this
    const cleanPath = _this3._removeEmptyFolders(path)
    const _path = _this3._getFinalPath(cleanPath)
    const url = new URL(_this3.url + `/object/upload/sign/${_path}`)
    url.searchParams.set("token", token)
    try {
      let body
      const options = _objectSpread2({ upsert: DEFAULT_FILE_OPTIONS.upsert }, fileOptions)
      const headers = _objectSpread2(_objectSpread2({}, _this3.headers), {
        "x-upsert": String(options.upsert),
      })
      if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
        body = new FormData()
        body.append("cacheControl", options.cacheControl)
        body.append("", fileBody)
      } else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
        body = fileBody
        body.append("cacheControl", options.cacheControl)
      } else {
        body = fileBody
        headers["cache-control"] = `max-age=${options.cacheControl}`
        headers["content-type"] = options.contentType
      }
      return {
        data: {
          path: cleanPath,
          fullPath: (await put(_this3.fetch, url.toString(), body, { headers })).Key,
        },
        error: null,
      }
    } catch (error) {
      if (_this3.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /**
   * Creates a signed upload URL.
   * Signed upload URLs can be used to upload files to the bucket without further authentication.
   * They are valid for 2 hours.
   *
   * @category File Buckets
   * @param path The file path, including the current file name. For example `folder/image.png`.
   * @param options.upsert If set to true, allows the file to be overwritten if it already exists.
   * @returns Promise with response containing signed upload URL, token, and path or error
   *
   * @example Create Signed Upload URL
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .from('avatars')
   *   .createSignedUploadUrl('folder/cat.jpg')
   * ```
   *
   * Response:
   * ```json
   * {
   *   "data": {
   *     "signedUrl": "https://example.supabase.co/storage/v1/object/upload/sign/avatars/folder/cat.jpg?token=<TOKEN>",
   *     "path": "folder/cat.jpg",
   *     "token": "<TOKEN>"
   *   },
   *   "error": null
   * }
   * ```
   */
  async createSignedUploadUrl(path, options) {
    var _this4 = this
    try {
      let _path = _this4._getFinalPath(path)
      const headers = _objectSpread2({}, _this4.headers)
      if (options === null || options === void 0 ? void 0 : options.upsert)
        headers["x-upsert"] = "true"
      const data = await post$1(
        _this4.fetch,
        `${_this4.url}/object/upload/sign/${_path}`,
        {},
        { headers }
      )
      const url = new URL(_this4.url + data.url)
      const token = url.searchParams.get("token")
      if (!token) throw new StorageError("No token returned by API")
      return {
        data: {
          signedUrl: url.toString(),
          path,
          token,
        },
        error: null,
      }
    } catch (error) {
      if (_this4.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /**
   * Replaces an existing file at the specified path with a new one.
   *
   * @category File Buckets
   * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to update.
   * @param fileBody The body of the file to be stored in the bucket.
   * @param fileOptions Optional file upload options including cacheControl, contentType, upsert, and metadata.
   * @returns Promise with response containing file path, id, and fullPath or error
   *
   * @example Update file
   * ```js
   * const avatarFile = event.target.files[0]
   * const { data, error } = await supabase
   *   .storage
   *   .from('avatars')
   *   .update('public/avatar1.png', avatarFile, {
   *     cacheControl: '3600',
   *     upsert: true
   *   })
   * ```
   *
   * Response:
   * ```json
   * {
   *   "data": {
   *     "path": "public/avatar1.png",
   *     "fullPath": "avatars/public/avatar1.png"
   *   },
   *   "error": null
   * }
   * ```
   *
   * @example Update file using `ArrayBuffer` from base64 file data
   * ```js
   * import {decode} from 'base64-arraybuffer'
   *
   * const { data, error } = await supabase
   *   .storage
   *   .from('avatars')
   *   .update('public/avatar1.png', decode('base64FileData'), {
   *     contentType: 'image/png'
   *   })
   * ```
   */
  async update(path, fileBody, fileOptions) {
    return this.uploadOrUpdate("PUT", path, fileBody, fileOptions)
  }
  /**
   * Moves an existing file to a new path in the same bucket.
   *
   * @category File Buckets
   * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
   * @param toPath The new file path, including the new file name. For example `folder/image-new.png`.
   * @param options The destination options.
   * @returns Promise with response containing success message or error
   *
   * @example Move file
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .from('avatars')
   *   .move('public/avatar1.png', 'private/avatar2.png')
   * ```
   *
   * Response:
   * ```json
   * {
   *   "data": {
   *     "message": "Successfully moved"
   *   },
   *   "error": null
   * }
   * ```
   */
  async move(fromPath, toPath, options) {
    var _this6 = this
    try {
      return {
        data: await post$1(
          _this6.fetch,
          `${_this6.url}/object/move`,
          {
            bucketId: _this6.bucketId,
            sourceKey: fromPath,
            destinationKey: toPath,
            destinationBucket:
              options === null || options === void 0 ? void 0 : options.destinationBucket,
          },
          { headers: _this6.headers }
        ),
        error: null,
      }
    } catch (error) {
      if (_this6.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /**
   * Copies an existing file to a new path in the same bucket.
   *
   * @category File Buckets
   * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
   * @param toPath The new file path, including the new file name. For example `folder/image-copy.png`.
   * @param options The destination options.
   * @returns Promise with response containing copied file path or error
   *
   * @example Copy file
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .from('avatars')
   *   .copy('public/avatar1.png', 'private/avatar2.png')
   * ```
   *
   * Response:
   * ```json
   * {
   *   "data": {
   *     "path": "avatars/private/avatar2.png"
   *   },
   *   "error": null
   * }
   * ```
   */
  async copy(fromPath, toPath, options) {
    var _this7 = this
    try {
      return {
        data: {
          path: (
            await post$1(
              _this7.fetch,
              `${_this7.url}/object/copy`,
              {
                bucketId: _this7.bucketId,
                sourceKey: fromPath,
                destinationKey: toPath,
                destinationBucket:
                  options === null || options === void 0 ? void 0 : options.destinationBucket,
              },
              { headers: _this7.headers }
            )
          ).Key,
        },
        error: null,
      }
    } catch (error) {
      if (_this7.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /**
   * Creates a signed URL. Use a signed URL to share a file for a fixed amount of time.
   *
   * @category File Buckets
   * @param path The file path, including the current file name. For example `folder/image.png`.
   * @param expiresIn The number of seconds until the signed URL expires. For example, `60` for a URL which is valid for one minute.
   * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
   * @param options.transform Transform the asset before serving it to the client.
   * @returns Promise with response containing signed URL or error
   *
   * @example Create Signed URL
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .from('avatars')
   *   .createSignedUrl('folder/avatar1.png', 60)
   * ```
   *
   * Response:
   * ```json
   * {
   *   "data": {
   *     "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar1.png?token=<TOKEN>"
   *   },
   *   "error": null
   * }
   * ```
   *
   * @example Create a signed URL for an asset with transformations
   * ```js
   * const { data } = await supabase
   *   .storage
   *   .from('avatars')
   *   .createSignedUrl('folder/avatar1.png', 60, {
   *     transform: {
   *       width: 100,
   *       height: 100,
   *     }
   *   })
   * ```
   *
   * @example Create a signed URL which triggers the download of the asset
   * ```js
   * const { data } = await supabase
   *   .storage
   *   .from('avatars')
   *   .createSignedUrl('folder/avatar1.png', 60, {
   *     download: true,
   *   })
   * ```
   */
  async createSignedUrl(path, expiresIn, options) {
    var _this8 = this
    try {
      let _path = _this8._getFinalPath(path)
      let data = await post$1(
        _this8.fetch,
        `${_this8.url}/object/sign/${_path}`,
        _objectSpread2(
          { expiresIn },
          (options === null || options === void 0 ? void 0 : options.transform)
            ? { transform: options.transform }
            : {}
        ),
        { headers: _this8.headers }
      )
      const downloadQueryParam = (
        options === null || options === void 0 ? void 0 : options.download
      )
        ? `&download=${options.download === true ? "" : options.download}`
        : ""
      data = { signedUrl: encodeURI(`${_this8.url}${data.signedURL}${downloadQueryParam}`) }
      return {
        data,
        error: null,
      }
    } catch (error) {
      if (_this8.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /**
   * Creates multiple signed URLs. Use a signed URL to share a file for a fixed amount of time.
   *
   * @category File Buckets
   * @param paths The file paths to be downloaded, including the current file names. For example `['folder/image.png', 'folder2/image2.png']`.
   * @param expiresIn The number of seconds until the signed URLs expire. For example, `60` for URLs which are valid for one minute.
   * @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
   * @returns Promise with response containing array of objects with signedUrl, path, and error or error
   *
   * @example Create Signed URLs
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .from('avatars')
   *   .createSignedUrls(['folder/avatar1.png', 'folder/avatar2.png'], 60)
   * ```
   *
   * Response:
   * ```json
   * {
   *   "data": [
   *     {
   *       "error": null,
   *       "path": "folder/avatar1.png",
   *       "signedURL": "/object/sign/avatars/folder/avatar1.png?token=<TOKEN>",
   *       "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar1.png?token=<TOKEN>"
   *     },
   *     {
   *       "error": null,
   *       "path": "folder/avatar2.png",
   *       "signedURL": "/object/sign/avatars/folder/avatar2.png?token=<TOKEN>",
   *       "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar2.png?token=<TOKEN>"
   *     }
   *   ],
   *   "error": null
   * }
   * ```
   */
  async createSignedUrls(paths, expiresIn, options) {
    var _this9 = this
    try {
      const data = await post$1(
        _this9.fetch,
        `${_this9.url}/object/sign/${_this9.bucketId}`,
        {
          expiresIn,
          paths,
        },
        { headers: _this9.headers }
      )
      const downloadQueryParam = (
        options === null || options === void 0 ? void 0 : options.download
      )
        ? `&download=${options.download === true ? "" : options.download}`
        : ""
      return {
        data: data.map((datum) =>
          _objectSpread2(
            _objectSpread2({}, datum),
            {},
            {
              signedUrl: datum.signedURL
                ? encodeURI(`${_this9.url}${datum.signedURL}${downloadQueryParam}`)
                : null,
            }
          )
        ),
        error: null,
      }
    } catch (error) {
      if (_this9.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /**
   * Downloads a file from a private bucket. For public buckets, make a request to the URL returned from `getPublicUrl` instead.
   *
   * @category File Buckets
   * @param path The full path and file name of the file to be downloaded. For example `folder/image.png`.
   * @param options.transform Transform the asset before serving it to the client.
   * @returns BlobDownloadBuilder instance for downloading the file
   *
   * @example Download file
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .from('avatars')
   *   .download('folder/avatar1.png')
   * ```
   *
   * Response:
   * ```json
   * {
   *   "data": <BLOB>,
   *   "error": null
   * }
   * ```
   *
   * @example Download file with transformations
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .from('avatars')
   *   .download('folder/avatar1.png', {
   *     transform: {
   *       width: 100,
   *       height: 100,
   *       quality: 80
   *     }
   *   })
   * ```
   */
  download(path, options) {
    const renderPath =
      typeof (options === null || options === void 0 ? void 0 : options.transform) !== "undefined"
        ? "render/image/authenticated"
        : "object"
    const transformationQuery = this.transformOptsToQueryString(
      (options === null || options === void 0 ? void 0 : options.transform) || {}
    )
    const queryString = transformationQuery ? `?${transformationQuery}` : ""
    const _path = this._getFinalPath(path)
    const downloadFn = () =>
      get(this.fetch, `${this.url}/${renderPath}/${_path}${queryString}`, {
        headers: this.headers,
        noResolveJson: true,
      })
    return new BlobDownloadBuilder(downloadFn, this.shouldThrowOnError)
  }
  /**
   * Retrieves the details of an existing file.
   *
   * @category File Buckets
   * @param path The file path, including the file name. For example `folder/image.png`.
   * @returns Promise with response containing file metadata or error
   *
   * @example Get file info
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .from('avatars')
   *   .info('folder/avatar1.png')
   * ```
   */
  async info(path) {
    var _this10 = this
    const _path = _this10._getFinalPath(path)
    try {
      return {
        data: recursiveToCamel(
          await get(_this10.fetch, `${_this10.url}/object/info/${_path}`, {
            headers: _this10.headers,
          })
        ),
        error: null,
      }
    } catch (error) {
      if (_this10.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /**
   * Checks the existence of a file.
   *
   * @category File Buckets
   * @param path The file path, including the file name. For example `folder/image.png`.
   * @returns Promise with response containing boolean indicating file existence or error
   *
   * @example Check file existence
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .from('avatars')
   *   .exists('folder/avatar1.png')
   * ```
   */
  async exists(path) {
    var _this11 = this
    const _path = _this11._getFinalPath(path)
    try {
      await head(_this11.fetch, `${_this11.url}/object/${_path}`, { headers: _this11.headers })
      return {
        data: true,
        error: null,
      }
    } catch (error) {
      if (_this11.shouldThrowOnError) throw error
      if (isStorageError(error) && error instanceof StorageUnknownError) {
        const originalError = error.originalError
        if (
          [400, 404].includes(
            originalError === null || originalError === void 0 ? void 0 : originalError.status
          )
        )
          return {
            data: false,
            error,
          }
      }
      throw error
    }
  }
  /**
   * A simple convenience function to get the URL for an asset in a public bucket. If you do not want to use this function, you can construct the public URL by concatenating the bucket URL with the path to the asset.
   * This function does not verify if the bucket is public. If a public URL is created for a bucket which is not public, you will not be able to download the asset.
   *
   * @category File Buckets
   * @param path The path and name of the file to generate the public URL for. For example `folder/image.png`.
   * @param options.download Triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
   * @param options.transform Transform the asset before serving it to the client.
   * @returns Object with public URL
   *
   * @example Returns the URL for an asset in a public bucket
   * ```js
   * const { data } = supabase
   *   .storage
   *   .from('public-bucket')
   *   .getPublicUrl('folder/avatar1.png')
   * ```
   *
   * Response:
   * ```json
   * {
   *   "data": {
   *     "publicUrl": "https://example.supabase.co/storage/v1/object/public/public-bucket/folder/avatar1.png"
   *   }
   * }
   * ```
   *
   * @example Returns the URL for an asset in a public bucket with transformations
   * ```js
   * const { data } = supabase
   *   .storage
   *   .from('public-bucket')
   *   .getPublicUrl('folder/avatar1.png', {
   *     transform: {
   *       width: 100,
   *       height: 100,
   *     }
   *   })
   * ```
   *
   * @example Returns the URL which triggers the download of an asset in a public bucket
   * ```js
   * const { data } = supabase
   *   .storage
   *   .from('public-bucket')
   *   .getPublicUrl('folder/avatar1.png', {
   *     download: true,
   *   })
   * ```
   */
  getPublicUrl(path, options) {
    const _path = this._getFinalPath(path)
    const _queryString = []
    const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download)
      ? `download=${options.download === true ? "" : options.download}`
      : ""
    if (downloadQueryParam !== "") _queryString.push(downloadQueryParam)
    const renderPath =
      typeof (options === null || options === void 0 ? void 0 : options.transform) !== "undefined"
        ? "render/image"
        : "object"
    const transformationQuery = this.transformOptsToQueryString(
      (options === null || options === void 0 ? void 0 : options.transform) || {}
    )
    if (transformationQuery !== "") _queryString.push(transformationQuery)
    let queryString = _queryString.join("&")
    if (queryString !== "") queryString = `?${queryString}`
    return {
      data: { publicUrl: encodeURI(`${this.url}/${renderPath}/public/${_path}${queryString}`) },
    }
  }
  /**
   * Deletes files within the same bucket
   *
   * @category File Buckets
   * @param paths An array of files to delete, including the path and file name. For example [`'folder/image.png'`].
   * @returns Promise with response containing array of deleted file objects or error
   *
   * @example Delete file
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .from('avatars')
   *   .remove(['folder/avatar1.png'])
   * ```
   *
   * Response:
   * ```json
   * {
   *   "data": [],
   *   "error": null
   * }
   * ```
   */
  async remove(paths) {
    var _this12 = this
    try {
      return {
        data: await remove(
          _this12.fetch,
          `${_this12.url}/object/${_this12.bucketId}`,
          { prefixes: paths },
          { headers: _this12.headers }
        ),
        error: null,
      }
    } catch (error) {
      if (_this12.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /**
   * Get file metadata
   * @param id the file id to retrieve metadata
   */
  /**
   * Update file metadata
   * @param id the file id to update metadata
   * @param meta the new file metadata
   */
  /**
   * Lists all the files and folders within a path of the bucket.
   *
   * @category File Buckets
   * @param path The folder path.
   * @param options Search options including limit (defaults to 100), offset, sortBy, and search
   * @param parameters Optional fetch parameters including signal for cancellation
   * @returns Promise with response containing array of files or error
   *
   * @example List files in a bucket
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .from('avatars')
   *   .list('folder', {
   *     limit: 100,
   *     offset: 0,
   *     sortBy: { column: 'name', order: 'asc' },
   *   })
   * ```
   *
   * Response:
   * ```json
   * {
   *   "data": [
   *     {
   *       "name": "avatar1.png",
   *       "id": "e668cf7f-821b-4a2f-9dce-7dfa5dd1cfd2",
   *       "updated_at": "2024-05-22T23:06:05.580Z",
   *       "created_at": "2024-05-22T23:04:34.443Z",
   *       "last_accessed_at": "2024-05-22T23:04:34.443Z",
   *       "metadata": {
   *         "eTag": "\"c5e8c553235d9af30ef4f6e280790b92\"",
   *         "size": 32175,
   *         "mimetype": "image/png",
   *         "cacheControl": "max-age=3600",
   *         "lastModified": "2024-05-22T23:06:05.574Z",
   *         "contentLength": 32175,
   *         "httpStatusCode": 200
   *       }
   *     }
   *   ],
   *   "error": null
   * }
   * ```
   *
   * @example Search files in a bucket
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .from('avatars')
   *   .list('folder', {
   *     limit: 100,
   *     offset: 0,
   *     sortBy: { column: 'name', order: 'asc' },
   *     search: 'jon'
   *   })
   * ```
   */
  async list(path, options, parameters) {
    var _this13 = this
    try {
      const body = _objectSpread2(
        _objectSpread2(_objectSpread2({}, DEFAULT_SEARCH_OPTIONS), options),
        {},
        { prefix: path || "" }
      )
      return {
        data: await post$1(
          _this13.fetch,
          `${_this13.url}/object/list/${_this13.bucketId}`,
          body,
          { headers: _this13.headers },
          parameters
        ),
        error: null,
      }
    } catch (error) {
      if (_this13.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /**
   * @experimental this method signature might change in the future
   *
   * @category File Buckets
   * @param options search options
   * @param parameters
   */
  async listV2(options, parameters) {
    var _this14 = this
    try {
      const body = _objectSpread2({}, options)
      return {
        data: await post$1(
          _this14.fetch,
          `${_this14.url}/object/list-v2/${_this14.bucketId}`,
          body,
          { headers: _this14.headers },
          parameters
        ),
        error: null,
      }
    } catch (error) {
      if (_this14.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  encodeMetadata(metadata) {
    return JSON.stringify(metadata)
  }
  toBase64(data) {
    if (typeof Buffer !== "undefined") return Buffer.from(data).toString("base64")
    return btoa(data)
  }
  _getFinalPath(path) {
    return `${this.bucketId}/${path.replace(/^\/+/, "")}`
  }
  _removeEmptyFolders(path) {
    return path.replace(/^\/|\/$/g, "").replace(/\/+/g, "/")
  }
  transformOptsToQueryString(transform2) {
    const params = []
    if (transform2.width) params.push(`width=${transform2.width}`)
    if (transform2.height) params.push(`height=${transform2.height}`)
    if (transform2.resize) params.push(`resize=${transform2.resize}`)
    if (transform2.format) params.push(`format=${transform2.format}`)
    if (transform2.quality) params.push(`quality=${transform2.quality}`)
    return params.join("&")
  }
}
var version = "2.88.0"
var DEFAULT_HEADERS$1 = { "X-Client-Info": `storage-js/${version}` }
var StorageBucketApi = class {
  constructor(url, headers = {}, fetch$1, opts) {
    this.shouldThrowOnError = false
    const baseUrl = new URL(url)
    if (opts === null || opts === void 0 ? void 0 : opts.useNewHostname) {
      if (
        /supabase\.(co|in|red)$/.test(baseUrl.hostname) &&
        !baseUrl.hostname.includes("storage.supabase.")
      )
        baseUrl.hostname = baseUrl.hostname.replace("supabase.", "storage.supabase.")
    }
    this.url = baseUrl.href.replace(/\/$/, "")
    this.headers = _objectSpread2(_objectSpread2({}, DEFAULT_HEADERS$1), headers)
    this.fetch = resolveFetch$1(fetch$1)
  }
  /**
   * Enable throwing errors instead of returning them.
   *
   * @category File Buckets
   */
  throwOnError() {
    this.shouldThrowOnError = true
    return this
  }
  /**
   * Retrieves the details of all Storage buckets within an existing project.
   *
   * @category File Buckets
   * @param options Query parameters for listing buckets
   * @param options.limit Maximum number of buckets to return
   * @param options.offset Number of buckets to skip
   * @param options.sortColumn Column to sort by ('id', 'name', 'created_at', 'updated_at')
   * @param options.sortOrder Sort order ('asc' or 'desc')
   * @param options.search Search term to filter bucket names
   * @returns Promise with response containing array of buckets or error
   *
   * @example List buckets
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .listBuckets()
   * ```
   *
   * @example List buckets with options
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .listBuckets({
   *     limit: 10,
   *     offset: 0,
   *     sortColumn: 'created_at',
   *     sortOrder: 'desc',
   *     search: 'prod'
   *   })
   * ```
   */
  async listBuckets(options) {
    var _this = this
    try {
      const queryString = _this.listBucketOptionsToQueryString(options)
      return {
        data: await get(_this.fetch, `${_this.url}/bucket${queryString}`, {
          headers: _this.headers,
        }),
        error: null,
      }
    } catch (error) {
      if (_this.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /**
   * Retrieves the details of an existing Storage bucket.
   *
   * @category File Buckets
   * @param id The unique identifier of the bucket you would like to retrieve.
   * @returns Promise with response containing bucket details or error
   *
   * @example Get bucket
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .getBucket('avatars')
   * ```
   *
   * Response:
   * ```json
   * {
   *   "data": {
   *     "id": "avatars",
   *     "name": "avatars",
   *     "owner": "",
   *     "public": false,
   *     "file_size_limit": 1024,
   *     "allowed_mime_types": [
   *       "image/png"
   *     ],
   *     "created_at": "2024-05-22T22:26:05.100Z",
   *     "updated_at": "2024-05-22T22:26:05.100Z"
   *   },
   *   "error": null
   * }
   * ```
   */
  async getBucket(id) {
    var _this2 = this
    try {
      return {
        data: await get(_this2.fetch, `${_this2.url}/bucket/${id}`, { headers: _this2.headers }),
        error: null,
      }
    } catch (error) {
      if (_this2.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /**
   * Creates a new Storage bucket
   *
   * @category File Buckets
   * @param id A unique identifier for the bucket you are creating.
   * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations. By default, buckets are private.
   * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
   * The global file size limit takes precedence over this value.
   * The default value is null, which doesn't set a per bucket file size limit.
   * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
   * The default value is null, which allows files with all mime types to be uploaded.
   * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
   * @param options.type (private-beta) specifies the bucket type. see `BucketType` for more details.
   *   - default bucket type is `STANDARD`
   * @returns Promise with response containing newly created bucket name or error
   *
   * @example Create bucket
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .createBucket('avatars', {
   *     public: false,
   *     allowedMimeTypes: ['image/png'],
   *     fileSizeLimit: 1024
   *   })
   * ```
   *
   * Response:
   * ```json
   * {
   *   "data": {
   *     "name": "avatars"
   *   },
   *   "error": null
   * }
   * ```
   */
  async createBucket(id, options = { public: false }) {
    var _this3 = this
    try {
      return {
        data: await post$1(
          _this3.fetch,
          `${_this3.url}/bucket`,
          {
            id,
            name: id,
            type: options.type,
            public: options.public,
            file_size_limit: options.fileSizeLimit,
            allowed_mime_types: options.allowedMimeTypes,
          },
          { headers: _this3.headers }
        ),
        error: null,
      }
    } catch (error) {
      if (_this3.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /**
   * Updates a Storage bucket
   *
   * @category File Buckets
   * @param id A unique identifier for the bucket you are updating.
   * @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations.
   * @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
   * The global file size limit takes precedence over this value.
   * The default value is null, which doesn't set a per bucket file size limit.
   * @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
   * The default value is null, which allows files with all mime types to be uploaded.
   * Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
   * @returns Promise with response containing success message or error
   *
   * @example Update bucket
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .updateBucket('avatars', {
   *     public: false,
   *     allowedMimeTypes: ['image/png'],
   *     fileSizeLimit: 1024
   *   })
   * ```
   *
   * Response:
   * ```json
   * {
   *   "data": {
   *     "message": "Successfully updated"
   *   },
   *   "error": null
   * }
   * ```
   */
  async updateBucket(id, options) {
    var _this4 = this
    try {
      return {
        data: await put(
          _this4.fetch,
          `${_this4.url}/bucket/${id}`,
          {
            id,
            name: id,
            public: options.public,
            file_size_limit: options.fileSizeLimit,
            allowed_mime_types: options.allowedMimeTypes,
          },
          { headers: _this4.headers }
        ),
        error: null,
      }
    } catch (error) {
      if (_this4.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /**
   * Removes all objects inside a single bucket.
   *
   * @category File Buckets
   * @param id The unique identifier of the bucket you would like to empty.
   * @returns Promise with success message or error
   *
   * @example Empty bucket
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .emptyBucket('avatars')
   * ```
   *
   * Response:
   * ```json
   * {
   *   "data": {
   *     "message": "Successfully emptied"
   *   },
   *   "error": null
   * }
   * ```
   */
  async emptyBucket(id) {
    var _this5 = this
    try {
      return {
        data: await post$1(
          _this5.fetch,
          `${_this5.url}/bucket/${id}/empty`,
          {},
          { headers: _this5.headers }
        ),
        error: null,
      }
    } catch (error) {
      if (_this5.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /**
   * Deletes an existing bucket. A bucket can't be deleted with existing objects inside it.
   * You must first `empty()` the bucket.
   *
   * @category File Buckets
   * @param id The unique identifier of the bucket you would like to delete.
   * @returns Promise with success message or error
   *
   * @example Delete bucket
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .deleteBucket('avatars')
   * ```
   *
   * Response:
   * ```json
   * {
   *   "data": {
   *     "message": "Successfully deleted"
   *   },
   *   "error": null
   * }
   * ```
   */
  async deleteBucket(id) {
    var _this6 = this
    try {
      return {
        data: await remove(
          _this6.fetch,
          `${_this6.url}/bucket/${id}`,
          {},
          { headers: _this6.headers }
        ),
        error: null,
      }
    } catch (error) {
      if (_this6.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  listBucketOptionsToQueryString(options) {
    const params = {}
    if (options) {
      if ("limit" in options) params.limit = String(options.limit)
      if ("offset" in options) params.offset = String(options.offset)
      if (options.search) params.search = options.search
      if (options.sortColumn) params.sortColumn = options.sortColumn
      if (options.sortOrder) params.sortOrder = options.sortOrder
    }
    return Object.keys(params).length > 0 ? "?" + new URLSearchParams(params).toString() : ""
  }
}
var StorageAnalyticsClient = class {
  /**
   * @alpha
   *
   * Creates a new StorageAnalyticsClient instance
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Analytics Buckets
   * @param url - The base URL for the storage API
   * @param headers - HTTP headers to include in requests
   * @param fetch - Optional custom fetch implementation
   *
   * @example
   * ```typescript
   * const client = new StorageAnalyticsClient(url, headers)
   * ```
   */
  constructor(url, headers = {}, fetch$1) {
    this.shouldThrowOnError = false
    this.url = url.replace(/\/$/, "")
    this.headers = _objectSpread2(_objectSpread2({}, DEFAULT_HEADERS$1), headers)
    this.fetch = resolveFetch$1(fetch$1)
  }
  /**
   * @alpha
   *
   * Enable throwing errors instead of returning them in the response
   * When enabled, failed operations will throw instead of returning { data: null, error }
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Analytics Buckets
   * @returns This instance for method chaining
   */
  throwOnError() {
    this.shouldThrowOnError = true
    return this
  }
  /**
   * @alpha
   *
   * Creates a new analytics bucket using Iceberg tables
   * Analytics buckets are optimized for analytical queries and data processing
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Analytics Buckets
   * @param name A unique name for the bucket you are creating
   * @returns Promise with response containing newly created analytics bucket or error
   *
   * @example Create analytics bucket
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .analytics
   *   .createBucket('analytics-data')
   * ```
   *
   * Response:
   * ```json
   * {
   *   "data": {
   *     "name": "analytics-data",
   *     "type": "ANALYTICS",
   *     "format": "iceberg",
   *     "created_at": "2024-05-22T22:26:05.100Z",
   *     "updated_at": "2024-05-22T22:26:05.100Z"
   *   },
   *   "error": null
   * }
   * ```
   */
  async createBucket(name) {
    var _this = this
    try {
      return {
        data: await post$1(
          _this.fetch,
          `${_this.url}/bucket`,
          { name },
          { headers: _this.headers }
        ),
        error: null,
      }
    } catch (error) {
      if (_this.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /**
   * @alpha
   *
   * Retrieves the details of all Analytics Storage buckets within an existing project
   * Only returns buckets of type 'ANALYTICS'
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Analytics Buckets
   * @param options Query parameters for listing buckets
   * @param options.limit Maximum number of buckets to return
   * @param options.offset Number of buckets to skip
   * @param options.sortColumn Column to sort by ('name', 'created_at', 'updated_at')
   * @param options.sortOrder Sort order ('asc' or 'desc')
   * @param options.search Search term to filter bucket names
   * @returns Promise with response containing array of analytics buckets or error
   *
   * @example List analytics buckets
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .analytics
   *   .listBuckets({
   *     limit: 10,
   *     offset: 0,
   *     sortColumn: 'created_at',
   *     sortOrder: 'desc'
   *   })
   * ```
   *
   * Response:
   * ```json
   * {
   *   "data": [
   *     {
   *       "name": "analytics-data",
   *       "type": "ANALYTICS",
   *       "format": "iceberg",
   *       "created_at": "2024-05-22T22:26:05.100Z",
   *       "updated_at": "2024-05-22T22:26:05.100Z"
   *     }
   *   ],
   *   "error": null
   * }
   * ```
   */
  async listBuckets(options) {
    var _this2 = this
    try {
      const queryParams = new URLSearchParams()
      if ((options === null || options === void 0 ? void 0 : options.limit) !== void 0)
        queryParams.set("limit", options.limit.toString())
      if ((options === null || options === void 0 ? void 0 : options.offset) !== void 0)
        queryParams.set("offset", options.offset.toString())
      if (options === null || options === void 0 ? void 0 : options.sortColumn)
        queryParams.set("sortColumn", options.sortColumn)
      if (options === null || options === void 0 ? void 0 : options.sortOrder)
        queryParams.set("sortOrder", options.sortOrder)
      if (options === null || options === void 0 ? void 0 : options.search)
        queryParams.set("search", options.search)
      const queryString = queryParams.toString()
      const url = queryString ? `${_this2.url}/bucket?${queryString}` : `${_this2.url}/bucket`
      return {
        data: await get(_this2.fetch, url, { headers: _this2.headers }),
        error: null,
      }
    } catch (error) {
      if (_this2.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /**
   * @alpha
   *
   * Deletes an existing analytics bucket
   * A bucket can't be deleted with existing objects inside it
   * You must first empty the bucket before deletion
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Analytics Buckets
   * @param bucketName The unique identifier of the bucket you would like to delete
   * @returns Promise with response containing success message or error
   *
   * @example Delete analytics bucket
   * ```js
   * const { data, error } = await supabase
   *   .storage
   *   .analytics
   *   .deleteBucket('analytics-data')
   * ```
   *
   * Response:
   * ```json
   * {
   *   "data": {
   *     "message": "Successfully deleted"
   *   },
   *   "error": null
   * }
   * ```
   */
  async deleteBucket(bucketName) {
    var _this3 = this
    try {
      return {
        data: await remove(
          _this3.fetch,
          `${_this3.url}/bucket/${bucketName}`,
          {},
          { headers: _this3.headers }
        ),
        error: null,
      }
    } catch (error) {
      if (_this3.shouldThrowOnError) throw error
      if (isStorageError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /**
   * @alpha
   *
   * Get an Iceberg REST Catalog client configured for a specific analytics bucket
   * Use this to perform advanced table and namespace operations within the bucket
   * The returned client provides full access to the Apache Iceberg REST Catalog API
   * with the Supabase `{ data, error }` pattern for consistent error handling on all operations.
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Analytics Buckets
   * @param bucketName - The name of the analytics bucket (warehouse) to connect to
   * @returns The wrapped Iceberg catalog client
   * @throws {StorageError} If the bucket name is invalid
   *
   * @example Get catalog and create table
   * ```js
   * // First, create an analytics bucket
   * const { data: bucket, error: bucketError } = await supabase
   *   .storage
   *   .analytics
   *   .createBucket('analytics-data')
   *
   * // Get the Iceberg catalog for that bucket
   * const catalog = supabase.storage.analytics.from('analytics-data')
   *
   * // Create a namespace
   * const { error: nsError } = await catalog.createNamespace({ namespace: ['default'] })
   *
   * // Create a table with schema
   * const { data: tableMetadata, error: tableError } = await catalog.createTable(
   *   { namespace: ['default'] },
   *   {
   *     name: 'events',
   *     schema: {
   *       type: 'struct',
   *       fields: [
   *         { id: 1, name: 'id', type: 'long', required: true },
   *         { id: 2, name: 'timestamp', type: 'timestamp', required: true },
   *         { id: 3, name: 'user_id', type: 'string', required: false }
   *       ],
   *       'schema-id': 0,
   *       'identifier-field-ids': [1]
   *     },
   *     'partition-spec': {
   *       'spec-id': 0,
   *       fields: []
   *     },
   *     'write-order': {
   *       'order-id': 0,
   *       fields: []
   *     },
   *     properties: {
   *       'write.format.default': 'parquet'
   *     }
   *   }
   * )
   * ```
   *
   * @example List tables in namespace
   * ```js
   * const catalog = supabase.storage.analytics.from('analytics-data')
   *
   * // List all tables in the default namespace
   * const { data: tables, error: listError } = await catalog.listTables({ namespace: ['default'] })
   * if (listError) {
   *   if (listError.isNotFound()) {
   *     console.log('Namespace not found')
   *   }
   *   return
   * }
   * console.log(tables) // [{ namespace: ['default'], name: 'events' }]
   * ```
   *
   * @example Working with namespaces
   * ```js
   * const catalog = supabase.storage.analytics.from('analytics-data')
   *
   * // List all namespaces
   * const { data: namespaces } = await catalog.listNamespaces()
   *
   * // Create namespace with properties
   * await catalog.createNamespace(
   *   { namespace: ['production'] },
   *   { properties: { owner: 'data-team', env: 'prod' } }
   * )
   * ```
   *
   * @example Cleanup operations
   * ```js
   * const catalog = supabase.storage.analytics.from('analytics-data')
   *
   * // Drop table with purge option (removes all data)
   * const { error: dropError } = await catalog.dropTable(
   *   { namespace: ['default'], name: 'events' },
   *   { purge: true }
   * )
   *
   * if (dropError?.isNotFound()) {
   *   console.log('Table does not exist')
   * }
   *
   * // Drop namespace (must be empty)
   * await catalog.dropNamespace({ namespace: ['default'] })
   * ```
   *
   * @remarks
   * This method provides a bridge between Supabase's bucket management and the standard
   * Apache Iceberg REST Catalog API. The bucket name maps to the Iceberg warehouse parameter.
   * All authentication and configuration is handled automatically using your Supabase credentials.
   *
   * **Error Handling**: Invalid bucket names throw immediately. All catalog
   * operations return `{ data, error }` where errors are `IcebergError` instances from iceberg-js.
   * Use helper methods like `error.isNotFound()` or check `error.status` for specific error handling.
   * Use `.throwOnError()` on the analytics client if you prefer exceptions for catalog operations.
   *
   * **Cleanup Operations**: When using `dropTable`, the `purge: true` option permanently
   * deletes all table data. Without it, the table is marked as deleted but data remains.
   *
   * **Library Dependency**: The returned catalog wraps `IcebergRestCatalog` from iceberg-js.
   * For complete API documentation and advanced usage, refer to the
   * [iceberg-js documentation](https://supabase.github.io/iceberg-js/).
   */
  from(bucketName) {
    var _this4 = this
    if (!isValidBucketName(bucketName))
      throw new StorageError(
        "Invalid bucket name: File, folder, and bucket names must follow AWS object key naming guidelines and should avoid the use of any other characters."
      )
    const catalog = new IcebergRestCatalog({
      baseUrl: this.url,
      catalogName: bucketName,
      auth: {
        type: "custom",
        getHeaders: async () => _this4.headers,
      },
      fetch: this.fetch,
    })
    const shouldThrowOnError = this.shouldThrowOnError
    return new Proxy(catalog, {
      get(target, prop) {
        const value = target[prop]
        if (typeof value !== "function") return value
        return async (...args) => {
          try {
            return {
              data: await value.apply(target, args),
              error: null,
            }
          } catch (error) {
            if (shouldThrowOnError) throw error
            return {
              data: null,
              error,
            }
          }
        }
      },
    })
  }
}
var DEFAULT_HEADERS = {
  "X-Client-Info": `storage-js/${version}`,
  "Content-Type": "application/json",
}
var StorageVectorsError = class extends Error {
  constructor(message) {
    super(message)
    this.__isStorageVectorsError = true
    this.name = "StorageVectorsError"
  }
}
function isStorageVectorsError(error) {
  return typeof error === "object" && error !== null && "__isStorageVectorsError" in error
}
var StorageVectorsApiError = class extends StorageVectorsError {
  constructor(message, status, statusCode) {
    super(message)
    this.name = "StorageVectorsApiError"
    this.status = status
    this.statusCode = statusCode
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      statusCode: this.statusCode,
    }
  }
}
var StorageVectorsUnknownError = class extends StorageVectorsError {
  constructor(message, originalError) {
    super(message)
    this.name = "StorageVectorsUnknownError"
    this.originalError = originalError
  }
}
var resolveFetch = (customFetch) => {
  if (customFetch) return (...args) => customFetch(...args)
  return (...args) => fetch(...args)
}
var isPlainObject = (value) => {
  if (typeof value !== "object" || value === null) return false
  const prototype = Object.getPrototypeOf(value)
  return (
    (prototype === null ||
      prototype === Object.prototype ||
      Object.getPrototypeOf(prototype) === null) &&
    !(Symbol.toStringTag in value) &&
    !(Symbol.iterator in value)
  )
}
var _getErrorMessage = (err) =>
  err.msg || err.message || err.error_description || err.error || JSON.stringify(err)
var handleError = async (error, reject, options) => {
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    "ok" in error &&
    typeof error.status === "number" &&
    !(options === null || options === void 0 ? void 0 : options.noResolveJson)
  ) {
    const status = error.status || 500
    const responseError = error
    if (typeof responseError.json === "function")
      responseError
        .json()
        .then((err) => {
          const statusCode =
            (err === null || err === void 0 ? void 0 : err.statusCode) ||
            (err === null || err === void 0 ? void 0 : err.code) ||
            status + ""
          reject(new StorageVectorsApiError(_getErrorMessage(err), status, statusCode))
        })
        .catch(() => {
          const statusCode = status + ""
          reject(
            new StorageVectorsApiError(
              responseError.statusText || `HTTP ${status} error`,
              status,
              statusCode
            )
          )
        })
    else {
      const statusCode = status + ""
      reject(
        new StorageVectorsApiError(
          responseError.statusText || `HTTP ${status} error`,
          status,
          statusCode
        )
      )
    }
  } else reject(new StorageVectorsUnknownError(_getErrorMessage(error), error))
}
var _getRequestParams = (method, options, parameters, body) => {
  const params = {
    method,
    headers: (options === null || options === void 0 ? void 0 : options.headers) || {},
  }
  if (method === "GET" || !body) return params
  if (isPlainObject(body)) {
    params.headers = _objectSpread2(
      { "Content-Type": "application/json" },
      options === null || options === void 0 ? void 0 : options.headers
    )
    params.body = JSON.stringify(body)
  } else params.body = body
  return _objectSpread2(_objectSpread2({}, params), parameters)
}
async function _handleRequest(fetcher, method, url, options, parameters, body) {
  return new Promise((resolve, reject) => {
    fetcher(url, _getRequestParams(method, options, parameters, body))
      .then((result) => {
        if (!result.ok) throw result
        if (options === null || options === void 0 ? void 0 : options.noResolveJson) return result
        const contentType = result.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) return {}
        return result.json()
      })
      .then((data) => resolve(data))
      .catch((error) => handleError(error, reject, options))
  })
}
async function post(fetcher, url, body, options, parameters) {
  return _handleRequest(fetcher, "POST", url, options, parameters, body)
}
var VectorIndexApi = class {
  /** Creates a new VectorIndexApi instance */
  constructor(url, headers = {}, fetch$1) {
    this.shouldThrowOnError = false
    this.url = url.replace(/\/$/, "")
    this.headers = _objectSpread2(_objectSpread2({}, DEFAULT_HEADERS), headers)
    this.fetch = resolveFetch(fetch$1)
  }
  /** Enable throwing errors instead of returning them in the response */
  throwOnError() {
    this.shouldThrowOnError = true
    return this
  }
  /** Creates a new vector index within a bucket */
  async createIndex(options) {
    var _this = this
    try {
      return {
        data:
          (await post(_this.fetch, `${_this.url}/CreateIndex`, options, {
            headers: _this.headers,
          })) || {},
        error: null,
      }
    } catch (error) {
      if (_this.shouldThrowOnError) throw error
      if (isStorageVectorsError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /** Retrieves metadata for a specific vector index */
  async getIndex(vectorBucketName, indexName) {
    var _this2 = this
    try {
      return {
        data: await post(
          _this2.fetch,
          `${_this2.url}/GetIndex`,
          {
            vectorBucketName,
            indexName,
          },
          { headers: _this2.headers }
        ),
        error: null,
      }
    } catch (error) {
      if (_this2.shouldThrowOnError) throw error
      if (isStorageVectorsError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /** Lists vector indexes within a bucket with optional filtering and pagination */
  async listIndexes(options) {
    var _this3 = this
    try {
      return {
        data: await post(_this3.fetch, `${_this3.url}/ListIndexes`, options, {
          headers: _this3.headers,
        }),
        error: null,
      }
    } catch (error) {
      if (_this3.shouldThrowOnError) throw error
      if (isStorageVectorsError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /** Deletes a vector index and all its data */
  async deleteIndex(vectorBucketName, indexName) {
    var _this4 = this
    try {
      return {
        data:
          (await post(
            _this4.fetch,
            `${_this4.url}/DeleteIndex`,
            {
              vectorBucketName,
              indexName,
            },
            { headers: _this4.headers }
          )) || {},
        error: null,
      }
    } catch (error) {
      if (_this4.shouldThrowOnError) throw error
      if (isStorageVectorsError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
}
var VectorDataApi = class {
  /** Creates a new VectorDataApi instance */
  constructor(url, headers = {}, fetch$1) {
    this.shouldThrowOnError = false
    this.url = url.replace(/\/$/, "")
    this.headers = _objectSpread2(_objectSpread2({}, DEFAULT_HEADERS), headers)
    this.fetch = resolveFetch(fetch$1)
  }
  /** Enable throwing errors instead of returning them in the response */
  throwOnError() {
    this.shouldThrowOnError = true
    return this
  }
  /** Inserts or updates vectors in batch (1-500 per request) */
  async putVectors(options) {
    var _this = this
    try {
      if (options.vectors.length < 1 || options.vectors.length > 500)
        throw new Error("Vector batch size must be between 1 and 500 items")
      return {
        data:
          (await post(_this.fetch, `${_this.url}/PutVectors`, options, {
            headers: _this.headers,
          })) || {},
        error: null,
      }
    } catch (error) {
      if (_this.shouldThrowOnError) throw error
      if (isStorageVectorsError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /** Retrieves vectors by their keys in batch */
  async getVectors(options) {
    var _this2 = this
    try {
      return {
        data: await post(_this2.fetch, `${_this2.url}/GetVectors`, options, {
          headers: _this2.headers,
        }),
        error: null,
      }
    } catch (error) {
      if (_this2.shouldThrowOnError) throw error
      if (isStorageVectorsError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /** Lists vectors in an index with pagination */
  async listVectors(options) {
    var _this3 = this
    try {
      if (options.segmentCount !== void 0) {
        if (options.segmentCount < 1 || options.segmentCount > 16)
          throw new Error("segmentCount must be between 1 and 16")
        if (options.segmentIndex !== void 0) {
          if (options.segmentIndex < 0 || options.segmentIndex >= options.segmentCount)
            throw new Error(`segmentIndex must be between 0 and ${options.segmentCount - 1}`)
        }
      }
      return {
        data: await post(_this3.fetch, `${_this3.url}/ListVectors`, options, {
          headers: _this3.headers,
        }),
        error: null,
      }
    } catch (error) {
      if (_this3.shouldThrowOnError) throw error
      if (isStorageVectorsError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /** Queries for similar vectors using approximate nearest neighbor search */
  async queryVectors(options) {
    var _this4 = this
    try {
      return {
        data: await post(_this4.fetch, `${_this4.url}/QueryVectors`, options, {
          headers: _this4.headers,
        }),
        error: null,
      }
    } catch (error) {
      if (_this4.shouldThrowOnError) throw error
      if (isStorageVectorsError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /** Deletes vectors by their keys in batch (1-500 per request) */
  async deleteVectors(options) {
    var _this5 = this
    try {
      if (options.keys.length < 1 || options.keys.length > 500)
        throw new Error("Keys batch size must be between 1 and 500 items")
      return {
        data:
          (await post(_this5.fetch, `${_this5.url}/DeleteVectors`, options, {
            headers: _this5.headers,
          })) || {},
        error: null,
      }
    } catch (error) {
      if (_this5.shouldThrowOnError) throw error
      if (isStorageVectorsError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
}
var VectorBucketApi = class {
  /** Creates a new VectorBucketApi instance */
  constructor(url, headers = {}, fetch$1) {
    this.shouldThrowOnError = false
    this.url = url.replace(/\/$/, "")
    this.headers = _objectSpread2(_objectSpread2({}, DEFAULT_HEADERS), headers)
    this.fetch = resolveFetch(fetch$1)
  }
  /** Enable throwing errors instead of returning them in the response */
  throwOnError() {
    this.shouldThrowOnError = true
    return this
  }
  /** Creates a new vector bucket */
  async createBucket(vectorBucketName) {
    var _this = this
    try {
      return {
        data:
          (await post(
            _this.fetch,
            `${_this.url}/CreateVectorBucket`,
            { vectorBucketName },
            { headers: _this.headers }
          )) || {},
        error: null,
      }
    } catch (error) {
      if (_this.shouldThrowOnError) throw error
      if (isStorageVectorsError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /** Retrieves metadata for a specific vector bucket */
  async getBucket(vectorBucketName) {
    var _this2 = this
    try {
      return {
        data: await post(
          _this2.fetch,
          `${_this2.url}/GetVectorBucket`,
          { vectorBucketName },
          { headers: _this2.headers }
        ),
        error: null,
      }
    } catch (error) {
      if (_this2.shouldThrowOnError) throw error
      if (isStorageVectorsError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /** Lists vector buckets with optional filtering and pagination */
  async listBuckets(options = {}) {
    var _this3 = this
    try {
      return {
        data: await post(_this3.fetch, `${_this3.url}/ListVectorBuckets`, options, {
          headers: _this3.headers,
        }),
        error: null,
      }
    } catch (error) {
      if (_this3.shouldThrowOnError) throw error
      if (isStorageVectorsError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
  /** Deletes a vector bucket (must be empty first) */
  async deleteBucket(vectorBucketName) {
    var _this4 = this
    try {
      return {
        data:
          (await post(
            _this4.fetch,
            `${_this4.url}/DeleteVectorBucket`,
            { vectorBucketName },
            { headers: _this4.headers }
          )) || {},
        error: null,
      }
    } catch (error) {
      if (_this4.shouldThrowOnError) throw error
      if (isStorageVectorsError(error))
        return {
          data: null,
          error,
        }
      throw error
    }
  }
}
var StorageVectorsClient = class extends VectorBucketApi {
  /**
   * @alpha
   *
   * Creates a StorageVectorsClient that can manage buckets, indexes, and vectors.
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Vector Buckets
   * @param url - Base URL of the Storage Vectors REST API.
   * @param options.headers - Optional headers (for example `Authorization`) applied to every request.
   * @param options.fetch - Optional custom `fetch` implementation for non-browser runtimes.
   *
   * @example
   * ```typescript
   * const client = new StorageVectorsClient(url, options)
   * ```
   */
  constructor(url, options = {}) {
    super(url, options.headers || {}, options.fetch)
  }
  /**
   *
   * @alpha
   *
   * Access operations for a specific vector bucket
   * Returns a scoped client for index and vector operations within the bucket
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Vector Buckets
   * @param vectorBucketName - Name of the vector bucket
   * @returns Bucket-scoped client with index and vector operations
   *
   * @example
   * ```typescript
   * const bucket = supabase.storage.vectors.from('embeddings-prod')
   * ```
   */
  from(vectorBucketName) {
    return new VectorBucketScope(this.url, this.headers, vectorBucketName, this.fetch)
  }
  /**
   *
   * @alpha
   *
   * Creates a new vector bucket
   * Vector buckets are containers for vector indexes and their data
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Vector Buckets
   * @param vectorBucketName - Unique name for the vector bucket
   * @returns Promise with empty response on success or error
   *
   * @example
   * ```typescript
   * const { data, error } = await supabase
   *   .storage
   *   .vectors
   *   .createBucket('embeddings-prod')
   * ```
   */
  async createBucket(vectorBucketName) {
    var _superprop_getCreateBucket = () => super.createBucket,
      _this = this
    return _superprop_getCreateBucket().call(_this, vectorBucketName)
  }
  /**
   *
   * @alpha
   *
   * Retrieves metadata for a specific vector bucket
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Vector Buckets
   * @param vectorBucketName - Name of the vector bucket
   * @returns Promise with bucket metadata or error
   *
   * @example
   * ```typescript
   * const { data, error } = await supabase
   *   .storage
   *   .vectors
   *   .getBucket('embeddings-prod')
   *
   * console.log('Bucket created:', data?.vectorBucket.creationTime)
   * ```
   */
  async getBucket(vectorBucketName) {
    var _superprop_getGetBucket = () => super.getBucket,
      _this2 = this
    return _superprop_getGetBucket().call(_this2, vectorBucketName)
  }
  /**
   *
   * @alpha
   *
   * Lists all vector buckets with optional filtering and pagination
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Vector Buckets
   * @param options - Optional filters (prefix, maxResults, nextToken)
   * @returns Promise with list of buckets or error
   *
   * @example
   * ```typescript
   * const { data, error } = await supabase
   *   .storage
   *   .vectors
   *   .listBuckets({ prefix: 'embeddings-' })
   *
   * data?.vectorBuckets.forEach(bucket => {
   *   console.log(bucket.vectorBucketName)
   * })
   * ```
   */
  async listBuckets(options = {}) {
    var _superprop_getListBuckets = () => super.listBuckets,
      _this3 = this
    return _superprop_getListBuckets().call(_this3, options)
  }
  /**
   *
   * @alpha
   *
   * Deletes a vector bucket (bucket must be empty)
   * All indexes must be deleted before deleting the bucket
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Vector Buckets
   * @param vectorBucketName - Name of the vector bucket to delete
   * @returns Promise with empty response on success or error
   *
   * @example
   * ```typescript
   * const { data, error } = await supabase
   *   .storage
   *   .vectors
   *   .deleteBucket('embeddings-old')
   * ```
   */
  async deleteBucket(vectorBucketName) {
    var _superprop_getDeleteBucket = () => super.deleteBucket,
      _this4 = this
    return _superprop_getDeleteBucket().call(_this4, vectorBucketName)
  }
}
var VectorBucketScope = class extends VectorIndexApi {
  /**
   * @alpha
   *
   * Creates a helper that automatically scopes all index operations to the provided bucket.
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Vector Buckets
   * @example
   * ```typescript
   * const bucket = supabase.storage.vectors.from('embeddings-prod')
   * ```
   */
  constructor(url, headers, vectorBucketName, fetch$1) {
    super(url, headers, fetch$1)
    this.vectorBucketName = vectorBucketName
  }
  /**
   *
   * @alpha
   *
   * Creates a new vector index in this bucket
   * Convenience method that automatically includes the bucket name
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Vector Buckets
   * @param options - Index configuration (vectorBucketName is automatically set)
   * @returns Promise with empty response on success or error
   *
   * @example
   * ```typescript
   * const bucket = supabase.storage.vectors.from('embeddings-prod')
   * await bucket.createIndex({
   *   indexName: 'documents-openai',
   *   dataType: 'float32',
   *   dimension: 1536,
   *   distanceMetric: 'cosine',
   *   metadataConfiguration: {
   *     nonFilterableMetadataKeys: ['raw_text']
   *   }
   * })
   * ```
   */
  async createIndex(options) {
    var _superprop_getCreateIndex = () => super.createIndex,
      _this5 = this
    return _superprop_getCreateIndex().call(
      _this5,
      _objectSpread2(_objectSpread2({}, options), {}, { vectorBucketName: _this5.vectorBucketName })
    )
  }
  /**
   *
   * @alpha
   *
   * Lists indexes in this bucket
   * Convenience method that automatically includes the bucket name
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Vector Buckets
   * @param options - Listing options (vectorBucketName is automatically set)
   * @returns Promise with response containing indexes array and pagination token or error
   *
   * @example
   * ```typescript
   * const bucket = supabase.storage.vectors.from('embeddings-prod')
   * const { data } = await bucket.listIndexes({ prefix: 'documents-' })
   * ```
   */
  async listIndexes(options = {}) {
    var _superprop_getListIndexes = () => super.listIndexes,
      _this6 = this
    return _superprop_getListIndexes().call(
      _this6,
      _objectSpread2(_objectSpread2({}, options), {}, { vectorBucketName: _this6.vectorBucketName })
    )
  }
  /**
   *
   * @alpha
   *
   * Retrieves metadata for a specific index in this bucket
   * Convenience method that automatically includes the bucket name
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Vector Buckets
   * @param indexName - Name of the index to retrieve
   * @returns Promise with index metadata or error
   *
   * @example
   * ```typescript
   * const bucket = supabase.storage.vectors.from('embeddings-prod')
   * const { data } = await bucket.getIndex('documents-openai')
   * console.log('Dimension:', data?.index.dimension)
   * ```
   */
  async getIndex(indexName) {
    var _superprop_getGetIndex = () => super.getIndex,
      _this7 = this
    return _superprop_getGetIndex().call(_this7, _this7.vectorBucketName, indexName)
  }
  /**
   *
   * @alpha
   *
   * Deletes an index from this bucket
   * Convenience method that automatically includes the bucket name
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Vector Buckets
   * @param indexName - Name of the index to delete
   * @returns Promise with empty response on success or error
   *
   * @example
   * ```typescript
   * const bucket = supabase.storage.vectors.from('embeddings-prod')
   * await bucket.deleteIndex('old-index')
   * ```
   */
  async deleteIndex(indexName) {
    var _superprop_getDeleteIndex = () => super.deleteIndex,
      _this8 = this
    return _superprop_getDeleteIndex().call(_this8, _this8.vectorBucketName, indexName)
  }
  /**
   *
   * @alpha
   *
   * Access operations for a specific index within this bucket
   * Returns a scoped client for vector data operations
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Vector Buckets
   * @param indexName - Name of the index
   * @returns Index-scoped client with vector data operations
   *
   * @example
   * ```typescript
   * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
   *
   * // Insert vectors
   * await index.putVectors({
   *   vectors: [
   *     { key: 'doc-1', data: { float32: [...] }, metadata: { title: 'Intro' } }
   *   ]
   * })
   *
   * // Query similar vectors
   * const { data } = await index.queryVectors({
   *   queryVector: { float32: [...] },
   *   topK: 5
   * })
   * ```
   */
  index(indexName) {
    return new VectorIndexScope(
      this.url,
      this.headers,
      this.vectorBucketName,
      indexName,
      this.fetch
    )
  }
}
var VectorIndexScope = class extends VectorDataApi {
  /**
   *
   * @alpha
   *
   * Creates a helper that automatically scopes all vector operations to the provided bucket/index names.
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Vector Buckets
   * @example
   * ```typescript
   * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
   * ```
   */
  constructor(url, headers, vectorBucketName, indexName, fetch$1) {
    super(url, headers, fetch$1)
    this.vectorBucketName = vectorBucketName
    this.indexName = indexName
  }
  /**
   *
   * @alpha
   *
   * Inserts or updates vectors in this index
   * Convenience method that automatically includes bucket and index names
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Vector Buckets
   * @param options - Vector insertion options (bucket and index names automatically set)
   * @returns Promise with empty response on success or error
   *
   * @example
   * ```typescript
   * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
   * await index.putVectors({
   *   vectors: [
   *     {
   *       key: 'doc-1',
   *       data: { float32: [0.1, 0.2, ...] },
   *       metadata: { title: 'Introduction', page: 1 }
   *     }
   *   ]
   * })
   * ```
   */
  async putVectors(options) {
    var _superprop_getPutVectors = () => super.putVectors,
      _this9 = this
    return _superprop_getPutVectors().call(
      _this9,
      _objectSpread2(
        _objectSpread2({}, options),
        {},
        {
          vectorBucketName: _this9.vectorBucketName,
          indexName: _this9.indexName,
        }
      )
    )
  }
  /**
   *
   * @alpha
   *
   * Retrieves vectors by keys from this index
   * Convenience method that automatically includes bucket and index names
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Vector Buckets
   * @param options - Vector retrieval options (bucket and index names automatically set)
   * @returns Promise with response containing vectors array or error
   *
   * @example
   * ```typescript
   * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
   * const { data } = await index.getVectors({
   *   keys: ['doc-1', 'doc-2'],
   *   returnMetadata: true
   * })
   * ```
   */
  async getVectors(options) {
    var _superprop_getGetVectors = () => super.getVectors,
      _this10 = this
    return _superprop_getGetVectors().call(
      _this10,
      _objectSpread2(
        _objectSpread2({}, options),
        {},
        {
          vectorBucketName: _this10.vectorBucketName,
          indexName: _this10.indexName,
        }
      )
    )
  }
  /**
   *
   * @alpha
   *
   * Lists vectors in this index with pagination
   * Convenience method that automatically includes bucket and index names
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Vector Buckets
   * @param options - Listing options (bucket and index names automatically set)
   * @returns Promise with response containing vectors array and pagination token or error
   *
   * @example
   * ```typescript
   * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
   * const { data } = await index.listVectors({
   *   maxResults: 500,
   *   returnMetadata: true
   * })
   * ```
   */
  async listVectors(options = {}) {
    var _superprop_getListVectors = () => super.listVectors,
      _this11 = this
    return _superprop_getListVectors().call(
      _this11,
      _objectSpread2(
        _objectSpread2({}, options),
        {},
        {
          vectorBucketName: _this11.vectorBucketName,
          indexName: _this11.indexName,
        }
      )
    )
  }
  /**
   *
   * @alpha
   *
   * Queries for similar vectors in this index
   * Convenience method that automatically includes bucket and index names
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Vector Buckets
   * @param options - Query options (bucket and index names automatically set)
   * @returns Promise with response containing matches array of similar vectors ordered by distance or error
   *
   * @example
   * ```typescript
   * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
   * const { data } = await index.queryVectors({
   *   queryVector: { float32: [0.1, 0.2, ...] },
   *   topK: 5,
   *   filter: { category: 'technical' },
   *   returnDistance: true,
   *   returnMetadata: true
   * })
   * ```
   */
  async queryVectors(options) {
    var _superprop_getQueryVectors = () => super.queryVectors,
      _this12 = this
    return _superprop_getQueryVectors().call(
      _this12,
      _objectSpread2(
        _objectSpread2({}, options),
        {},
        {
          vectorBucketName: _this12.vectorBucketName,
          indexName: _this12.indexName,
        }
      )
    )
  }
  /**
   *
   * @alpha
   *
   * Deletes vectors by keys from this index
   * Convenience method that automatically includes bucket and index names
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Vector Buckets
   * @param options - Deletion options (bucket and index names automatically set)
   * @returns Promise with empty response on success or error
   *
   * @example
   * ```typescript
   * const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
   * await index.deleteVectors({
   *   keys: ['doc-1', 'doc-2', 'doc-3']
   * })
   * ```
   */
  async deleteVectors(options) {
    var _superprop_getDeleteVectors = () => super.deleteVectors,
      _this13 = this
    return _superprop_getDeleteVectors().call(
      _this13,
      _objectSpread2(
        _objectSpread2({}, options),
        {},
        {
          vectorBucketName: _this13.vectorBucketName,
          indexName: _this13.indexName,
        }
      )
    )
  }
}
var StorageClient = class extends StorageBucketApi {
  /**
   * Creates a client for Storage buckets, files, analytics, and vectors.
   *
   * @category File Buckets
   * @example
   * ```ts
   * import { StorageClient } from '@supabase/storage-js'
   *
   * const storage = new StorageClient('https://xyzcompany.supabase.co/storage/v1', {
   *   apikey: 'public-anon-key',
   * })
   * const avatars = storage.from('avatars')
   * ```
   */
  constructor(url, headers = {}, fetch$1, opts) {
    super(url, headers, fetch$1, opts)
  }
  /**
   * Perform file operation in a bucket.
   *
   * @category File Buckets
   * @param id The bucket id to operate on.
   *
   * @example
   * ```typescript
   * const avatars = supabase.storage.from('avatars')
   * ```
   */
  from(id) {
    return new StorageFileApi(this.url, this.headers, id, this.fetch)
  }
  /**
   *
   * @alpha
   *
   * Access vector storage operations.
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Vector Buckets
   * @returns A StorageVectorsClient instance configured with the current storage settings.
   */
  get vectors() {
    return new StorageVectorsClient(this.url + "/vector", {
      headers: this.headers,
      fetch: this.fetch,
    })
  }
  /**
   *
   * @alpha
   *
   * Access analytics storage operations using Iceberg tables.
   *
   * **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
   *
   * @category Analytics Buckets
   * @returns A StorageAnalyticsClient instance configured with the current storage settings.
   */
  get analytics() {
    return new StorageAnalyticsClient(this.url + "/iceberg", this.headers, this.fetch)
  }
}

// node_modules/@supabase/supabase-js/dist/index.mjs
var import_auth_js = __toESM(require_main3(), 1)
__reExport(dist_exports, __toESM(require_main2(), 1))
__reExport(dist_exports, __toESM(require_main3(), 1))
var version2 = "2.88.0"
var JS_ENV = ""
if (typeof Deno !== "undefined") JS_ENV = "deno"
else if (typeof document !== "undefined") JS_ENV = "web"
else if (typeof navigator !== "undefined" && navigator.product === "ReactNative")
  JS_ENV = "react-native"
else JS_ENV = "node"
var DEFAULT_HEADERS2 = { "X-Client-Info": `supabase-js-${JS_ENV}/${version2}` }
var DEFAULT_GLOBAL_OPTIONS = { headers: DEFAULT_HEADERS2 }
var DEFAULT_DB_OPTIONS = { schema: "public" }
var DEFAULT_AUTH_OPTIONS = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  flowType: "implicit",
}
var DEFAULT_REALTIME_OPTIONS = {}
function _typeof2(o) {
  "@babel/helpers - typeof"
  return (
    (_typeof2 =
      "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
        ? function (o$1) {
            return typeof o$1
          }
        : function (o$1) {
            return o$1 &&
              "function" == typeof Symbol &&
              o$1.constructor === Symbol &&
              o$1 !== Symbol.prototype
              ? "symbol"
              : typeof o$1
          }),
    _typeof2(o)
  )
}
function toPrimitive2(t, r) {
  if ("object" != _typeof2(t) || !t) return t
  var e = t[Symbol.toPrimitive]
  if (void 0 !== e) {
    var i = e.call(t, r || "default")
    if ("object" != _typeof2(i)) return i
    throw new TypeError("@@toPrimitive must return a primitive value.")
  }
  return ("string" === r ? String : Number)(t)
}
function toPropertyKey2(t) {
  var i = toPrimitive2(t, "string")
  return "symbol" == _typeof2(i) ? i : i + ""
}
function _defineProperty2(e, r, t) {
  return (
    (r = toPropertyKey2(r)) in e
      ? Object.defineProperty(e, r, {
          value: t,
          enumerable: true,
          configurable: true,
          writable: true,
        })
      : (e[r] = t),
    e
  )
}
function ownKeys3(e, r) {
  var t = Object.keys(e)
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e)
    ;(r &&
      (o = o.filter(function (r$1) {
        return Object.getOwnPropertyDescriptor(e, r$1).enumerable
      })),
      t.push.apply(t, o))
  }
  return t
}
function _objectSpread22(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {}
    r % 2
      ? ownKeys3(Object(t), true).forEach(function (r$1) {
          _defineProperty2(e, r$1, t[r$1])
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
        : ownKeys3(Object(t)).forEach(function (r$1) {
            Object.defineProperty(e, r$1, Object.getOwnPropertyDescriptor(t, r$1))
          })
  }
  return e
}
var resolveFetch2 = (customFetch) => {
  if (customFetch) return (...args) => customFetch(...args)
  return (...args) => fetch(...args)
}
var resolveHeadersConstructor = () => {
  return Headers
}
var fetchWithAuth = (supabaseKey, getAccessToken, customFetch) => {
  const fetch$1 = resolveFetch2(customFetch)
  const HeadersConstructor = resolveHeadersConstructor()
  return async (input, init) => {
    var _await$getAccessToken
    const accessToken =
      (_await$getAccessToken = await getAccessToken()) !== null && _await$getAccessToken !== void 0
        ? _await$getAccessToken
        : supabaseKey
    let headers = new HeadersConstructor(init === null || init === void 0 ? void 0 : init.headers)
    if (!headers.has("apikey")) headers.set("apikey", supabaseKey)
    if (!headers.has("Authorization")) headers.set("Authorization", `Bearer ${accessToken}`)
    return fetch$1(input, _objectSpread22(_objectSpread22({}, init), {}, { headers }))
  }
}
function ensureTrailingSlash(url) {
  return url.endsWith("/") ? url : url + "/"
}
function applySettingDefaults(options, defaults) {
  var _DEFAULT_GLOBAL_OPTIO, _globalOptions$header
  const {
    db: dbOptions,
    auth: authOptions,
    realtime: realtimeOptions,
    global: globalOptions,
  } = options
  const {
    db: DEFAULT_DB_OPTIONS$1,
    auth: DEFAULT_AUTH_OPTIONS$1,
    realtime: DEFAULT_REALTIME_OPTIONS$1,
    global: DEFAULT_GLOBAL_OPTIONS$1,
  } = defaults
  const result = {
    db: _objectSpread22(_objectSpread22({}, DEFAULT_DB_OPTIONS$1), dbOptions),
    auth: _objectSpread22(_objectSpread22({}, DEFAULT_AUTH_OPTIONS$1), authOptions),
    realtime: _objectSpread22(_objectSpread22({}, DEFAULT_REALTIME_OPTIONS$1), realtimeOptions),
    storage: {},
    global: _objectSpread22(
      _objectSpread22(_objectSpread22({}, DEFAULT_GLOBAL_OPTIONS$1), globalOptions),
      {},
      {
        headers: _objectSpread22(
          _objectSpread22(
            {},
            (_DEFAULT_GLOBAL_OPTIO =
              DEFAULT_GLOBAL_OPTIONS$1 === null || DEFAULT_GLOBAL_OPTIONS$1 === void 0
                ? void 0
                : DEFAULT_GLOBAL_OPTIONS$1.headers) !== null && _DEFAULT_GLOBAL_OPTIO !== void 0
              ? _DEFAULT_GLOBAL_OPTIO
              : {}
          ),
          (_globalOptions$header =
            globalOptions === null || globalOptions === void 0 ? void 0 : globalOptions.headers) !==
            null && _globalOptions$header !== void 0
            ? _globalOptions$header
            : {}
        ),
      }
    ),
    accessToken: async () => "",
  }
  if (options.accessToken) result.accessToken = options.accessToken
  else delete result.accessToken
  return result
}
function validateSupabaseUrl(supabaseUrl) {
  const trimmedUrl = supabaseUrl === null || supabaseUrl === void 0 ? void 0 : supabaseUrl.trim()
  if (!trimmedUrl) throw new Error("supabaseUrl is required.")
  if (!trimmedUrl.match(/^https?:\/\//i))
    throw new Error("Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.")
  try {
    return new URL(ensureTrailingSlash(trimmedUrl))
  } catch (_unused) {
    throw Error("Invalid supabaseUrl: Provided URL is malformed.")
  }
}
var SupabaseAuthClient = class extends import_auth_js.AuthClient {
  constructor(options) {
    super(options)
  }
}
var SupabaseClient = class {
  /**
   * Create a new client for use in the browser.
   * @param supabaseUrl The unique Supabase URL which is supplied when you create a new project in your project dashboard.
   * @param supabaseKey The unique Supabase Key which is supplied when you create a new project in your project dashboard.
   * @param options.db.schema You can switch in between schemas. The schema needs to be on the list of exposed schemas inside Supabase.
   * @param options.auth.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
   * @param options.auth.persistSession Set to "true" if you want to automatically save the user session into local storage.
   * @param options.auth.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
   * @param options.realtime Options passed along to realtime-js constructor.
   * @param options.storage Options passed along to the storage-js constructor.
   * @param options.global.fetch A custom fetch implementation.
   * @param options.global.headers Any additional headers to send with each network request.
   * @example
   * ```ts
   * import { createClient } from '@supabase/supabase-js'
   *
   * const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
   * const { data } = await supabase.from('profiles').select('*')
   * ```
   */
  constructor(supabaseUrl, supabaseKey, options) {
    var _settings$auth$storag, _settings$global$head
    this.supabaseUrl = supabaseUrl
    this.supabaseKey = supabaseKey
    const baseUrl = validateSupabaseUrl(supabaseUrl)
    if (!supabaseKey) throw new Error("supabaseKey is required.")
    this.realtimeUrl = new URL("realtime/v1", baseUrl)
    this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace("http", "ws")
    this.authUrl = new URL("auth/v1", baseUrl)
    this.storageUrl = new URL("storage/v1", baseUrl)
    this.functionsUrl = new URL("functions/v1", baseUrl)
    const defaultStorageKey = `sb-${baseUrl.hostname.split(".")[0]}-auth-token`
    const DEFAULTS = {
      db: DEFAULT_DB_OPTIONS,
      realtime: DEFAULT_REALTIME_OPTIONS,
      auth: _objectSpread22(
        _objectSpread22({}, DEFAULT_AUTH_OPTIONS),
        {},
        { storageKey: defaultStorageKey }
      ),
      global: DEFAULT_GLOBAL_OPTIONS,
    }
    const settings = applySettingDefaults(
      options !== null && options !== void 0 ? options : {},
      DEFAULTS
    )
    this.storageKey =
      (_settings$auth$storag = settings.auth.storageKey) !== null &&
      _settings$auth$storag !== void 0
        ? _settings$auth$storag
        : ""
    this.headers =
      (_settings$global$head = settings.global.headers) !== null && _settings$global$head !== void 0
        ? _settings$global$head
        : {}
    if (!settings.accessToken) {
      var _settings$auth
      this.auth = this._initSupabaseAuthClient(
        (_settings$auth = settings.auth) !== null && _settings$auth !== void 0
          ? _settings$auth
          : {},
        this.headers,
        settings.global.fetch
      )
    } else {
      this.accessToken = settings.accessToken
      this.auth = new Proxy(
        {},
        {
          get: (_, prop) => {
            throw new Error(
              `@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(prop)} is not possible`
            )
          },
        }
      )
    }
    this.fetch = fetchWithAuth(supabaseKey, this._getAccessToken.bind(this), settings.global.fetch)
    this.realtime = this._initRealtimeClient(
      _objectSpread22(
        {
          headers: this.headers,
          accessToken: this._getAccessToken.bind(this),
        },
        settings.realtime
      )
    )
    if (this.accessToken)
      this.accessToken()
        .then((token) => this.realtime.setAuth(token))
        .catch((e) => console.warn("Failed to set initial Realtime auth token:", e))
    this.rest = new PostgrestClient(new URL("rest/v1", baseUrl).href, {
      headers: this.headers,
      schema: settings.db.schema,
      fetch: this.fetch,
    })
    this.storage = new StorageClient(
      this.storageUrl.href,
      this.headers,
      this.fetch,
      options === null || options === void 0 ? void 0 : options.storage
    )
    if (!settings.accessToken) this._listenForAuthEvents()
  }
  /**
   * Supabase Functions allows you to deploy and invoke edge functions.
   */
  get functions() {
    return new import_functions_js.FunctionsClient(this.functionsUrl.href, {
      headers: this.headers,
      customFetch: this.fetch,
    })
  }
  /**
   * Perform a query on a table or a view.
   *
   * @param relation - The table or view name to query
   */
  from(relation) {
    return this.rest.from(relation)
  }
  /**
   * Select a schema to query or perform an function (rpc) call.
   *
   * The schema needs to be on the list of exposed schemas inside Supabase.
   *
   * @param schema - The schema to query
   */
  schema(schema) {
    return this.rest.schema(schema)
  }
  /**
   * Perform a function call.
   *
   * @param fn - The function name to call
   * @param args - The arguments to pass to the function call
   * @param options - Named parameters
   * @param options.head - When set to `true`, `data` will not be returned.
   * Useful if you only need the count.
   * @param options.get - When set to `true`, the function will be called with
   * read-only access mode.
   * @param options.count - Count algorithm to use to count rows returned by the
   * function. Only applicable for [set-returning
   * functions](https://www.postgresql.org/docs/current/functions-srf.html).
   *
   * `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
   * hood.
   *
   * `"planned"`: Approximated but fast count algorithm. Uses the Postgres
   * statistics under the hood.
   *
   * `"estimated"`: Uses exact count for low numbers and planned count for high
   * numbers.
   */
  rpc(
    fn,
    args = {},
    options = {
      head: false,
      get: false,
      count: void 0,
    }
  ) {
    return this.rest.rpc(fn, args, options)
  }
  /**
   * Creates a Realtime channel with Broadcast, Presence, and Postgres Changes.
   *
   * @param {string} name - The name of the Realtime channel.
   * @param {Object} opts - The options to pass to the Realtime channel.
   *
   */
  channel(name, opts = { config: {} }) {
    return this.realtime.channel(name, opts)
  }
  /**
   * Returns all Realtime channels.
   */
  getChannels() {
    return this.realtime.getChannels()
  }
  /**
   * Unsubscribes and removes Realtime channel from Realtime client.
   *
   * @param {RealtimeChannel} channel - The name of the Realtime channel.
   *
   */
  removeChannel(channel) {
    return this.realtime.removeChannel(channel)
  }
  /**
   * Unsubscribes and removes all Realtime channels from Realtime client.
   */
  removeAllChannels() {
    return this.realtime.removeAllChannels()
  }
  async _getAccessToken() {
    var _this = this
    var _data$session$access_, _data$session
    if (_this.accessToken) return await _this.accessToken()
    const { data } = await _this.auth.getSession()
    return (_data$session$access_ =
      (_data$session = data.session) === null || _data$session === void 0
        ? void 0
        : _data$session.access_token) !== null && _data$session$access_ !== void 0
      ? _data$session$access_
      : _this.supabaseKey
  }
  _initSupabaseAuthClient(
    {
      autoRefreshToken,
      persistSession,
      detectSessionInUrl,
      storage,
      userStorage,
      storageKey,
      flowType,
      lock,
      debug,
      throwOnError,
    },
    headers,
    fetch$1
  ) {
    const authHeaders = {
      Authorization: `Bearer ${this.supabaseKey}`,
      apikey: `${this.supabaseKey}`,
    }
    return new SupabaseAuthClient({
      url: this.authUrl.href,
      headers: _objectSpread22(_objectSpread22({}, authHeaders), headers),
      storageKey,
      autoRefreshToken,
      persistSession,
      detectSessionInUrl,
      storage,
      userStorage,
      flowType,
      lock,
      debug,
      throwOnError,
      fetch: fetch$1,
      hasCustomAuthorizationHeader: Object.keys(this.headers).some(
        (key) => key.toLowerCase() === "authorization"
      ),
    })
  }
  _initRealtimeClient(options) {
    return new import_realtime_js.RealtimeClient(
      this.realtimeUrl.href,
      _objectSpread22(
        _objectSpread22({}, options),
        {},
        {
          params: _objectSpread22(
            _objectSpread22({}, { apikey: this.supabaseKey }),
            options === null || options === void 0 ? void 0 : options.params
          ),
        }
      )
    )
  }
  _listenForAuthEvents() {
    return this.auth.onAuthStateChange((event, session) => {
      this._handleTokenChanged(
        event,
        "CLIENT",
        session === null || session === void 0 ? void 0 : session.access_token
      )
    })
  }
  _handleTokenChanged(event, source, token) {
    if (
      (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") &&
      this.changedAccessToken !== token
    ) {
      this.changedAccessToken = token
      this.realtime.setAuth(token)
    } else if (event === "SIGNED_OUT") {
      this.realtime.setAuth()
      if (source == "STORAGE") this.auth.signOut()
      this.changedAccessToken = void 0
    }
  }
}
var createClient = (supabaseUrl, supabaseKey, options) => {
  return new SupabaseClient(supabaseUrl, supabaseKey, options)
}
function shouldShowDeprecationWarning() {
  if (typeof window !== "undefined") return false
  if (typeof process === "undefined") return false
  const processVersion = process["version"]
  if (processVersion === void 0 || processVersion === null) return false
  const versionMatch = processVersion.match(/^v(\d+)\./)
  if (!versionMatch) return false
  return parseInt(versionMatch[1], 10) <= 18
}
if (shouldShowDeprecationWarning())
  console.warn(
    "\u26A0\uFE0F  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 20 or later. For more information, visit: https://github.com/orgs/supabase/discussions/37217"
  )

// api-src/lib/rateLimit.ts
var import_ratelimit = __toESM(require_dist2(), 1)

// node_modules/uncrypto/dist/crypto.node.mjs
import nodeCrypto from "node:crypto"
var subtle = nodeCrypto.webcrypto?.subtle || {}

// node_modules/@upstash/redis/chunk-LLI2WIYN.mjs
var __defProp2 = Object.defineProperty
var __export2 = (target, all) => {
  for (var name in all) __defProp2(target, name, { get: all[name], enumerable: true })
}
var error_exports = {}
__export2(error_exports, {
  UpstashError: () => UpstashError,
  UpstashJSONParseError: () => UpstashJSONParseError,
  UrlError: () => UrlError,
})
var UpstashError = class extends Error {
  constructor(message, options) {
    super(message, options)
    this.name = "UpstashError"
  }
}
var UrlError = class extends Error {
  constructor(url) {
    super(
      `Upstash Redis client was passed an invalid URL. You should pass a URL starting with https. Received: "${url}". `
    )
    this.name = "UrlError"
  }
}
var UpstashJSONParseError = class extends UpstashError {
  constructor(body, options) {
    const truncatedBody = body.length > 200 ? body.slice(0, 200) + "..." : body
    super(`Unable to parse response body: ${truncatedBody}`, options)
    this.name = "UpstashJSONParseError"
  }
}
function parseRecursive(obj) {
  const parsed = Array.isArray(obj)
    ? obj.map((o) => {
        try {
          return parseRecursive(o)
        } catch {
          return o
        }
      })
    : JSON.parse(obj)
  if (typeof parsed === "number" && parsed.toString() !== obj) {
    return obj
  }
  return parsed
}
function parseResponse(result) {
  try {
    return parseRecursive(result)
  } catch {
    return result
  }
}
function deserializeScanResponse(result) {
  return [result[0], ...parseResponse(result.slice(1))]
}
function deserializeScanWithTypesResponse(result) {
  const [cursor, keys] = result
  const parsedKeys = []
  for (let i = 0; i < keys.length; i += 2) {
    parsedKeys.push({ key: keys[i], type: keys[i + 1] })
  }
  return [cursor, parsedKeys]
}
function mergeHeaders(...headers) {
  const merged = {}
  for (const header of headers) {
    if (!header) continue
    for (const [key, value] of Object.entries(header)) {
      if (value !== void 0 && value !== null) {
        merged[key] = value
      }
    }
  }
  return merged
}
function kvArrayToObject(v) {
  if (typeof v === "object" && v !== null && !Array.isArray(v)) return v
  if (!Array.isArray(v)) return {}
  const obj = {}
  for (let i = 0; i < v.length; i += 2) {
    if (typeof v[i] === "string") obj[v[i]] = v[i + 1]
  }
  return obj
}
var MAX_BUFFER_SIZE = 1024 * 1024
var HttpClient = class {
  baseUrl
  headers
  options
  readYourWrites
  upstashSyncToken = ""
  hasCredentials
  retry
  constructor(config) {
    this.options = {
      backend: config.options?.backend,
      agent: config.agent,
      responseEncoding: config.responseEncoding ?? "base64",
      // default to base64
      cache: config.cache,
      signal: config.signal,
      keepAlive: config.keepAlive ?? true,
    }
    this.upstashSyncToken = ""
    this.readYourWrites = config.readYourWrites ?? true
    this.baseUrl = (config.baseUrl || "").replace(/\/$/, "")
    const urlRegex = /^https?:\/\/[^\s#$./?].\S*$/
    if (this.baseUrl && !urlRegex.test(this.baseUrl)) {
      throw new UrlError(this.baseUrl)
    }
    this.headers = {
      "Content-Type": "application/json",
      ...config.headers,
    }
    this.hasCredentials = Boolean(this.baseUrl && this.headers.authorization.split(" ")[1])
    if (this.options.responseEncoding === "base64") {
      this.headers["Upstash-Encoding"] = "base64"
    }
    this.retry =
      typeof config.retry === "boolean" && !config.retry
        ? {
            attempts: 1,
            backoff: () => 0,
          }
        : {
            attempts: config.retry?.retries ?? 5,
            backoff: config.retry?.backoff ?? ((retryCount) => Math.exp(retryCount) * 50),
          }
  }
  mergeTelemetry(telemetry) {
    this.headers = merge(this.headers, "Upstash-Telemetry-Runtime", telemetry.runtime)
    this.headers = merge(this.headers, "Upstash-Telemetry-Platform", telemetry.platform)
    this.headers = merge(this.headers, "Upstash-Telemetry-Sdk", telemetry.sdk)
  }
  async request(req) {
    const requestHeaders = mergeHeaders(this.headers, req.headers ?? {})
    const requestUrl = [this.baseUrl, ...(req.path ?? [])].join("/")
    const isEventStream = requestHeaders.Accept === "text/event-stream"
    const signal = req.signal ?? this.options.signal
    const isSignalFunction = typeof signal === "function"
    const requestOptions = {
      //@ts-expect-error this should throw due to bun regression
      cache: this.options.cache,
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(req.body),
      keepalive: this.options.keepAlive,
      agent: this.options.agent,
      signal: isSignalFunction ? signal() : signal,
      /**
       * Fastly specific
       */
      backend: this.options.backend,
    }
    if (!this.hasCredentials) {
      console.warn(
        "[Upstash Redis] Redis client was initialized without url or token. Failed to execute command."
      )
    }
    if (this.readYourWrites) {
      const newHeader = this.upstashSyncToken
      this.headers["upstash-sync-token"] = newHeader
    }
    let res = null
    let error = null
    for (let i = 0; i <= this.retry.attempts; i++) {
      try {
        res = await fetch(requestUrl, requestOptions)
        break
      } catch (error_) {
        if (requestOptions.signal?.aborted && isSignalFunction) {
          throw error_
        } else if (requestOptions.signal?.aborted) {
          const myBlob = new Blob([
            JSON.stringify({ result: requestOptions.signal.reason ?? "Aborted" }),
          ])
          const myOptions = {
            status: 200,
            statusText: requestOptions.signal.reason ?? "Aborted",
          }
          res = new Response(myBlob, myOptions)
          break
        }
        error = error_
        if (i < this.retry.attempts) {
          await new Promise((r) => setTimeout(r, this.retry.backoff(i)))
        }
      }
    }
    if (!res) {
      throw error ?? new Error("Exhausted all retries")
    }
    if (!res.ok) {
      let body2
      const rawBody2 = await res.text()
      try {
        body2 = JSON.parse(rawBody2)
      } catch (error2) {
        throw new UpstashJSONParseError(rawBody2, { cause: error2 })
      }
      throw new UpstashError(`${body2.error}, command was: ${JSON.stringify(req.body)}`)
    }
    if (this.readYourWrites) {
      const headers = res.headers
      this.upstashSyncToken = headers.get("upstash-sync-token") ?? ""
    }
    if (isEventStream && req && req.onMessage && res.body) {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      ;(async () => {
        try {
          let buffer = ""
          while (true) {
            const { value, done } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split("\n")
            buffer = lines.pop() || ""
            if (buffer.length > MAX_BUFFER_SIZE) {
              throw new Error("Buffer size exceeded (1MB)")
            }
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                req.onMessage?.(data)
              }
            }
          }
        } catch (error2) {
          if (error2 instanceof Error && error2.name === "AbortError") {
          } else {
            console.error("Stream reading error:", error2)
          }
        } finally {
          try {
            await reader.cancel()
          } catch {}
        }
      })()
      return { result: 1 }
    }
    let body
    const rawBody = await res.text()
    try {
      body = JSON.parse(rawBody)
    } catch (error2) {
      throw new UpstashJSONParseError(rawBody, { cause: error2 })
    }
    if (this.readYourWrites) {
      const headers = res.headers
      this.upstashSyncToken = headers.get("upstash-sync-token") ?? ""
    }
    if (this.options.responseEncoding === "base64") {
      if (Array.isArray(body)) {
        return body.map(({ result: result2, error: error2 }) => ({
          result: decode(result2),
          error: error2,
        }))
      }
      const result = decode(body.result)
      return { result, error: body.error }
    }
    return body
  }
}
function base64decode(b64) {
  let dec = ""
  try {
    const binString = atob(b64)
    const size = binString.length
    const bytes = new Uint8Array(size)
    for (let i = 0; i < size; i++) {
      bytes[i] = binString.charCodeAt(i)
    }
    dec = new TextDecoder().decode(bytes)
  } catch {
    dec = b64
  }
  return dec
}
function decode(raw) {
  let result = void 0
  switch (typeof raw) {
    case "undefined": {
      return raw
    }
    case "number": {
      result = raw
      break
    }
    case "object": {
      if (Array.isArray(raw)) {
        result = raw.map((v) =>
          typeof v === "string"
            ? base64decode(v)
            : Array.isArray(v)
              ? v.map((element) => decode(element))
              : v
        )
      } else {
        result = null
      }
      break
    }
    case "string": {
      result = raw === "OK" ? "OK" : base64decode(raw)
      break
    }
    default: {
      break
    }
  }
  return result
}
function merge(obj, key, value) {
  if (!value) {
    return obj
  }
  obj[key] = obj[key] ? [obj[key], value].join(",") : value
  return obj
}
var defaultSerializer = (c) => {
  switch (typeof c) {
    case "string":
    case "number":
    case "boolean": {
      return c
    }
    default: {
      return JSON.stringify(c)
    }
  }
}
var Command = class {
  command
  serialize
  deserialize
  headers
  path
  onMessage
  isStreaming
  signal
  /**
   * Create a new command instance.
   *
   * You can define a custom `deserialize` function. By default we try to deserialize as json.
   */
  constructor(command, opts) {
    this.serialize = defaultSerializer
    this.deserialize =
      opts?.automaticDeserialization === void 0 || opts.automaticDeserialization
        ? (opts?.deserialize ?? parseResponse)
        : (x) => x
    this.command = command.map((c) => this.serialize(c))
    this.headers = opts?.headers
    this.path = opts?.path
    this.onMessage = opts?.streamOptions?.onMessage
    this.isStreaming = opts?.streamOptions?.isStreaming ?? false
    this.signal = opts?.streamOptions?.signal
    if (opts?.latencyLogging) {
      const originalExec = this.exec.bind(this)
      this.exec = async (client) => {
        const start = performance.now()
        const result = await originalExec(client)
        const end = performance.now()
        const loggerResult = (end - start).toFixed(2)
        console.log(
          `Latency for \x1B[38;2;19;185;39m${this.command[0].toString().toUpperCase()}\x1B[0m: \x1B[38;2;0;255;255m${loggerResult} ms\x1B[0m`
        )
        return result
      }
    }
  }
  /**
   * Execute the command using a client.
   */
  async exec(client) {
    const { result, error } = await client.request({
      body: this.command,
      path: this.path,
      upstashSyncToken: client.upstashSyncToken,
      headers: this.headers,
      onMessage: this.onMessage,
      isStreaming: this.isStreaming,
      signal: this.signal,
    })
    if (error) {
      throw new UpstashError(error)
    }
    if (result === void 0) {
      throw new TypeError("Request did not return a result")
    }
    return this.deserialize(result)
  }
}
function deserialize(result) {
  if (result.length === 0) {
    return null
  }
  const obj = {}
  for (let i = 0; i < result.length; i += 2) {
    const key = result[i]
    const value = result[i + 1]
    try {
      obj[key] = JSON.parse(value)
    } catch {
      obj[key] = value
    }
  }
  return obj
}
var HRandFieldCommand = class extends Command {
  constructor(cmd, opts) {
    const command = ["hrandfield", cmd[0]]
    if (typeof cmd[1] === "number") {
      command.push(cmd[1])
    }
    if (cmd[2]) {
      command.push("WITHVALUES")
    }
    super(command, {
      // @ts-expect-error to silence compiler
      deserialize: cmd[2] ? (result) => deserialize(result) : opts?.deserialize,
      ...opts,
    })
  }
}
var AppendCommand = class extends Command {
  constructor(cmd, opts) {
    super(["append", ...cmd], opts)
  }
}
var BitCountCommand = class extends Command {
  constructor([key, start, end], opts) {
    const command = ["bitcount", key]
    if (typeof start === "number") {
      command.push(start)
    }
    if (typeof end === "number") {
      command.push(end)
    }
    super(command, opts)
  }
}
var BitFieldCommand = class {
  constructor(args, client, opts, execOperation = (command) => command.exec(this.client)) {
    this.client = client
    this.opts = opts
    this.execOperation = execOperation
    this.command = ["bitfield", ...args]
  }
  command
  chain(...args) {
    this.command.push(...args)
    return this
  }
  get(...args) {
    return this.chain("get", ...args)
  }
  set(...args) {
    return this.chain("set", ...args)
  }
  incrby(...args) {
    return this.chain("incrby", ...args)
  }
  overflow(overflow) {
    return this.chain("overflow", overflow)
  }
  exec() {
    const command = new Command(this.command, this.opts)
    return this.execOperation(command)
  }
}
var BitOpCommand = class extends Command {
  constructor(cmd, opts) {
    super(["bitop", ...cmd], opts)
  }
}
var BitPosCommand = class extends Command {
  constructor(cmd, opts) {
    super(["bitpos", ...cmd], opts)
  }
}
var CopyCommand = class extends Command {
  constructor([key, destinationKey, opts], commandOptions) {
    super(["COPY", key, destinationKey, ...(opts?.replace ? ["REPLACE"] : [])], {
      ...commandOptions,
      deserialize(result) {
        if (result > 0) {
          return "COPIED"
        }
        return "NOT_COPIED"
      },
    })
  }
}
var DBSizeCommand = class extends Command {
  constructor(opts) {
    super(["dbsize"], opts)
  }
}
var DecrCommand = class extends Command {
  constructor(cmd, opts) {
    super(["decr", ...cmd], opts)
  }
}
var DecrByCommand = class extends Command {
  constructor(cmd, opts) {
    super(["decrby", ...cmd], opts)
  }
}
var DelCommand = class extends Command {
  constructor(cmd, opts) {
    super(["del", ...cmd], opts)
  }
}
var EchoCommand = class extends Command {
  constructor(cmd, opts) {
    super(["echo", ...cmd], opts)
  }
}
var EvalROCommand = class extends Command {
  constructor([script, keys, args], opts) {
    super(["eval_ro", script, keys.length, ...keys, ...(args ?? [])], opts)
  }
}
var EvalCommand = class extends Command {
  constructor([script, keys, args], opts) {
    super(["eval", script, keys.length, ...keys, ...(args ?? [])], opts)
  }
}
var EvalshaROCommand = class extends Command {
  constructor([sha, keys, args], opts) {
    super(["evalsha_ro", sha, keys.length, ...keys, ...(args ?? [])], opts)
  }
}
var EvalshaCommand = class extends Command {
  constructor([sha, keys, args], opts) {
    super(["evalsha", sha, keys.length, ...keys, ...(args ?? [])], opts)
  }
}
var ExecCommand = class extends Command {
  constructor(cmd, opts) {
    const normalizedCmd = cmd.map((arg) => (typeof arg === "string" ? arg : String(arg)))
    super(normalizedCmd, opts)
  }
}
var ExistsCommand = class extends Command {
  constructor(cmd, opts) {
    super(["exists", ...cmd], opts)
  }
}
var ExpireCommand = class extends Command {
  constructor(cmd, opts) {
    super(["expire", ...cmd.filter(Boolean)], opts)
  }
}
var ExpireAtCommand = class extends Command {
  constructor(cmd, opts) {
    super(["expireat", ...cmd], opts)
  }
}
var FCallCommand = class extends Command {
  constructor([functionName, keys, args], opts) {
    super(["fcall", functionName, ...(keys ? [keys.length, ...keys] : [0]), ...(args ?? [])], opts)
  }
}
var FCallRoCommand = class extends Command {
  constructor([functionName, keys, args], opts) {
    super(
      ["fcall_ro", functionName, ...(keys ? [keys.length, ...keys] : [0]), ...(args ?? [])],
      opts
    )
  }
}
var FlushAllCommand = class extends Command {
  constructor(args, opts) {
    const command = ["flushall"]
    if (args && args.length > 0 && args[0].async) {
      command.push("async")
    }
    super(command, opts)
  }
}
var FlushDBCommand = class extends Command {
  constructor([opts], cmdOpts) {
    const command = ["flushdb"]
    if (opts?.async) {
      command.push("async")
    }
    super(command, cmdOpts)
  }
}
var FunctionDeleteCommand = class extends Command {
  constructor([libraryName], opts) {
    super(["function", "delete", libraryName], opts)
  }
}
var FunctionFlushCommand = class extends Command {
  constructor(opts) {
    super(["function", "flush"], opts)
  }
}
var FunctionListCommand = class extends Command {
  constructor([args], opts) {
    const command = ["function", "list"]
    if (args?.libraryName) {
      command.push("libraryname", args.libraryName)
    }
    if (args?.withCode) {
      command.push("withcode")
    }
    super(command, { deserialize: deserialize2, ...opts })
  }
}
function deserialize2(result) {
  if (!Array.isArray(result)) return []
  return result.map((libRaw) => {
    const lib = kvArrayToObject(libRaw)
    const functionsParsed = lib.functions.map((fnRaw) => kvArrayToObject(fnRaw))
    return {
      libraryName: lib.library_name,
      engine: lib.engine,
      functions: functionsParsed.map((fn) => ({
        name: fn.name,
        description: fn.description ?? void 0,
        flags: fn.flags,
      })),
      libraryCode: lib.library_code,
    }
  })
}
var FunctionLoadCommand = class extends Command {
  constructor([args], opts) {
    super(["function", "load", ...(args.replace ? ["replace"] : []), args.code], opts)
  }
}
var FunctionStatsCommand = class extends Command {
  constructor(opts) {
    super(["function", "stats"], { deserialize: deserialize3, ...opts })
  }
}
function deserialize3(result) {
  const rawEngines = kvArrayToObject(kvArrayToObject(result).engines)
  const parsedEngines = Object.fromEntries(
    Object.entries(rawEngines).map(([key, value]) => [key, kvArrayToObject(value)])
  )
  const final = {
    engines: Object.fromEntries(
      Object.entries(parsedEngines).map(([key, value]) => [
        key,
        {
          librariesCount: value.libraries_count,
          functionsCount: value.functions_count,
        },
      ])
    ),
  }
  return final
}
var GeoAddCommand = class extends Command {
  constructor([key, arg1, ...arg2], opts) {
    const command = ["geoadd", key]
    if ("nx" in arg1 && arg1.nx) {
      command.push("nx")
    } else if ("xx" in arg1 && arg1.xx) {
      command.push("xx")
    }
    if ("ch" in arg1 && arg1.ch) {
      command.push("ch")
    }
    if ("latitude" in arg1 && arg1.latitude) {
      command.push(arg1.longitude, arg1.latitude, arg1.member)
    }
    command.push(
      ...arg2.flatMap(({ latitude, longitude, member }) => [longitude, latitude, member])
    )
    super(command, opts)
  }
}
var GeoDistCommand = class extends Command {
  constructor([key, member1, member2, unit = "M"], opts) {
    super(["GEODIST", key, member1, member2, unit], opts)
  }
}
var GeoHashCommand = class extends Command {
  constructor(cmd, opts) {
    const [key] = cmd
    const members = Array.isArray(cmd[1]) ? cmd[1] : cmd.slice(1)
    super(["GEOHASH", key, ...members], opts)
  }
}
var GeoPosCommand = class extends Command {
  constructor(cmd, opts) {
    const [key] = cmd
    const members = Array.isArray(cmd[1]) ? cmd[1] : cmd.slice(1)
    super(["GEOPOS", key, ...members], {
      deserialize: (result) => transform(result),
      ...opts,
    })
  }
}
function transform(result) {
  const final = []
  for (const pos of result) {
    if (!pos?.[0] || !pos?.[1]) {
      continue
    }
    final.push({ lng: Number.parseFloat(pos[0]), lat: Number.parseFloat(pos[1]) })
  }
  return final
}
var GeoSearchCommand = class extends Command {
  constructor([key, centerPoint, shape, order, opts], commandOptions) {
    const command = ["GEOSEARCH", key]
    if (centerPoint.type === "FROMMEMBER" || centerPoint.type === "frommember") {
      command.push(centerPoint.type, centerPoint.member)
    }
    if (centerPoint.type === "FROMLONLAT" || centerPoint.type === "fromlonlat") {
      command.push(centerPoint.type, centerPoint.coordinate.lon, centerPoint.coordinate.lat)
    }
    if (shape.type === "BYRADIUS" || shape.type === "byradius") {
      command.push(shape.type, shape.radius, shape.radiusType)
    }
    if (shape.type === "BYBOX" || shape.type === "bybox") {
      command.push(shape.type, shape.rect.width, shape.rect.height, shape.rectType)
    }
    command.push(order)
    if (opts?.count) {
      command.push("COUNT", opts.count.limit, ...(opts.count.any ? ["ANY"] : []))
    }
    const transform2 = (result) => {
      if (!opts?.withCoord && !opts?.withDist && !opts?.withHash) {
        return result.map((member) => {
          try {
            return { member: JSON.parse(member) }
          } catch {
            return { member }
          }
        })
      }
      return result.map((members) => {
        let counter = 1
        const obj = {}
        try {
          obj.member = JSON.parse(members[0])
        } catch {
          obj.member = members[0]
        }
        if (opts.withDist) {
          obj.dist = Number.parseFloat(members[counter++])
        }
        if (opts.withHash) {
          obj.hash = members[counter++].toString()
        }
        if (opts.withCoord) {
          obj.coord = {
            long: Number.parseFloat(members[counter][0]),
            lat: Number.parseFloat(members[counter][1]),
          }
        }
        return obj
      })
    }
    super(
      [
        ...command,
        ...(opts?.withCoord ? ["WITHCOORD"] : []),
        ...(opts?.withDist ? ["WITHDIST"] : []),
        ...(opts?.withHash ? ["WITHHASH"] : []),
      ],
      {
        deserialize: transform2,
        ...commandOptions,
      }
    )
  }
}
var GeoSearchStoreCommand = class extends Command {
  constructor([destination, key, centerPoint, shape, order, opts], commandOptions) {
    const command = ["GEOSEARCHSTORE", destination, key]
    if (centerPoint.type === "FROMMEMBER" || centerPoint.type === "frommember") {
      command.push(centerPoint.type, centerPoint.member)
    }
    if (centerPoint.type === "FROMLONLAT" || centerPoint.type === "fromlonlat") {
      command.push(centerPoint.type, centerPoint.coordinate.lon, centerPoint.coordinate.lat)
    }
    if (shape.type === "BYRADIUS" || shape.type === "byradius") {
      command.push(shape.type, shape.radius, shape.radiusType)
    }
    if (shape.type === "BYBOX" || shape.type === "bybox") {
      command.push(shape.type, shape.rect.width, shape.rect.height, shape.rectType)
    }
    command.push(order)
    if (opts?.count) {
      command.push("COUNT", opts.count.limit, ...(opts.count.any ? ["ANY"] : []))
    }
    super([...command, ...(opts?.storeDist ? ["STOREDIST"] : [])], commandOptions)
  }
}
var GetCommand = class extends Command {
  constructor(cmd, opts) {
    super(["get", ...cmd], opts)
  }
}
var GetBitCommand = class extends Command {
  constructor(cmd, opts) {
    super(["getbit", ...cmd], opts)
  }
}
var GetDelCommand = class extends Command {
  constructor(cmd, opts) {
    super(["getdel", ...cmd], opts)
  }
}
var GetExCommand = class extends Command {
  constructor([key, opts], cmdOpts) {
    const command = ["getex", key]
    if (opts) {
      if ("ex" in opts && typeof opts.ex === "number") {
        command.push("ex", opts.ex)
      } else if ("px" in opts && typeof opts.px === "number") {
        command.push("px", opts.px)
      } else if ("exat" in opts && typeof opts.exat === "number") {
        command.push("exat", opts.exat)
      } else if ("pxat" in opts && typeof opts.pxat === "number") {
        command.push("pxat", opts.pxat)
      } else if ("persist" in opts && opts.persist) {
        command.push("persist")
      }
    }
    super(command, cmdOpts)
  }
}
var GetRangeCommand = class extends Command {
  constructor(cmd, opts) {
    super(["getrange", ...cmd], opts)
  }
}
var GetSetCommand = class extends Command {
  constructor(cmd, opts) {
    super(["getset", ...cmd], opts)
  }
}
var HDelCommand = class extends Command {
  constructor(cmd, opts) {
    super(["hdel", ...cmd], opts)
  }
}
var HExistsCommand = class extends Command {
  constructor(cmd, opts) {
    super(["hexists", ...cmd], opts)
  }
}
var HExpireCommand = class extends Command {
  constructor(cmd, opts) {
    const [key, fields, seconds, option] = cmd
    const fieldArray = Array.isArray(fields) ? fields : [fields]
    super(
      [
        "hexpire",
        key,
        seconds,
        ...(option ? [option] : []),
        "FIELDS",
        fieldArray.length,
        ...fieldArray,
      ],
      opts
    )
  }
}
var HExpireAtCommand = class extends Command {
  constructor(cmd, opts) {
    const [key, fields, timestamp, option] = cmd
    const fieldArray = Array.isArray(fields) ? fields : [fields]
    super(
      [
        "hexpireat",
        key,
        timestamp,
        ...(option ? [option] : []),
        "FIELDS",
        fieldArray.length,
        ...fieldArray,
      ],
      opts
    )
  }
}
var HExpireTimeCommand = class extends Command {
  constructor(cmd, opts) {
    const [key, fields] = cmd
    const fieldArray = Array.isArray(fields) ? fields : [fields]
    super(["hexpiretime", key, "FIELDS", fieldArray.length, ...fieldArray], opts)
  }
}
var HPersistCommand = class extends Command {
  constructor(cmd, opts) {
    const [key, fields] = cmd
    const fieldArray = Array.isArray(fields) ? fields : [fields]
    super(["hpersist", key, "FIELDS", fieldArray.length, ...fieldArray], opts)
  }
}
var HPExpireCommand = class extends Command {
  constructor(cmd, opts) {
    const [key, fields, milliseconds, option] = cmd
    const fieldArray = Array.isArray(fields) ? fields : [fields]
    super(
      [
        "hpexpire",
        key,
        milliseconds,
        ...(option ? [option] : []),
        "FIELDS",
        fieldArray.length,
        ...fieldArray,
      ],
      opts
    )
  }
}
var HPExpireAtCommand = class extends Command {
  constructor(cmd, opts) {
    const [key, fields, timestamp, option] = cmd
    const fieldArray = Array.isArray(fields) ? fields : [fields]
    super(
      [
        "hpexpireat",
        key,
        timestamp,
        ...(option ? [option] : []),
        "FIELDS",
        fieldArray.length,
        ...fieldArray,
      ],
      opts
    )
  }
}
var HPExpireTimeCommand = class extends Command {
  constructor(cmd, opts) {
    const [key, fields] = cmd
    const fieldArray = Array.isArray(fields) ? fields : [fields]
    super(["hpexpiretime", key, "FIELDS", fieldArray.length, ...fieldArray], opts)
  }
}
var HPTtlCommand = class extends Command {
  constructor(cmd, opts) {
    const [key, fields] = cmd
    const fieldArray = Array.isArray(fields) ? fields : [fields]
    super(["hpttl", key, "FIELDS", fieldArray.length, ...fieldArray], opts)
  }
}
var HGetCommand = class extends Command {
  constructor(cmd, opts) {
    super(["hget", ...cmd], opts)
  }
}
function deserialize4(result) {
  if (result.length === 0) {
    return null
  }
  const obj = {}
  for (let i = 0; i < result.length; i += 2) {
    const key = result[i]
    const value = result[i + 1]
    try {
      const valueIsNumberAndNotSafeInteger =
        !Number.isNaN(Number(value)) && !Number.isSafeInteger(Number(value))
      obj[key] = valueIsNumberAndNotSafeInteger ? value : JSON.parse(value)
    } catch {
      obj[key] = value
    }
  }
  return obj
}
var HGetAllCommand = class extends Command {
  constructor(cmd, opts) {
    super(["hgetall", ...cmd], {
      deserialize: (result) => deserialize4(result),
      ...opts,
    })
  }
}
var HIncrByCommand = class extends Command {
  constructor(cmd, opts) {
    super(["hincrby", ...cmd], opts)
  }
}
var HIncrByFloatCommand = class extends Command {
  constructor(cmd, opts) {
    super(["hincrbyfloat", ...cmd], opts)
  }
}
var HKeysCommand = class extends Command {
  constructor([key], opts) {
    super(["hkeys", key], opts)
  }
}
var HLenCommand = class extends Command {
  constructor(cmd, opts) {
    super(["hlen", ...cmd], opts)
  }
}
function deserialize5(fields, result) {
  if (result.every((field) => field === null)) {
    return null
  }
  const obj = {}
  for (const [i, field] of fields.entries()) {
    try {
      obj[field] = JSON.parse(result[i])
    } catch {
      obj[field] = result[i]
    }
  }
  return obj
}
var HMGetCommand = class extends Command {
  constructor([key, ...fields], opts) {
    super(["hmget", key, ...fields], {
      deserialize: (result) => deserialize5(fields, result),
      ...opts,
    })
  }
}
var HMSetCommand = class extends Command {
  constructor([key, kv], opts) {
    super(["hmset", key, ...Object.entries(kv).flatMap(([field, value]) => [field, value])], opts)
  }
}
var HScanCommand = class extends Command {
  constructor([key, cursor, cmdOpts], opts) {
    const command = ["hscan", key, cursor]
    if (cmdOpts?.match) {
      command.push("match", cmdOpts.match)
    }
    if (typeof cmdOpts?.count === "number") {
      command.push("count", cmdOpts.count)
    }
    super(command, {
      deserialize: deserializeScanResponse,
      ...opts,
    })
  }
}
var HSetCommand = class extends Command {
  constructor([key, kv], opts) {
    super(["hset", key, ...Object.entries(kv).flatMap(([field, value]) => [field, value])], opts)
  }
}
var HSetNXCommand = class extends Command {
  constructor(cmd, opts) {
    super(["hsetnx", ...cmd], opts)
  }
}
var HStrLenCommand = class extends Command {
  constructor(cmd, opts) {
    super(["hstrlen", ...cmd], opts)
  }
}
var HTtlCommand = class extends Command {
  constructor(cmd, opts) {
    const [key, fields] = cmd
    const fieldArray = Array.isArray(fields) ? fields : [fields]
    super(["httl", key, "FIELDS", fieldArray.length, ...fieldArray], opts)
  }
}
var HValsCommand = class extends Command {
  constructor(cmd, opts) {
    super(["hvals", ...cmd], opts)
  }
}
var IncrCommand = class extends Command {
  constructor(cmd, opts) {
    super(["incr", ...cmd], opts)
  }
}
var IncrByCommand = class extends Command {
  constructor(cmd, opts) {
    super(["incrby", ...cmd], opts)
  }
}
var IncrByFloatCommand = class extends Command {
  constructor(cmd, opts) {
    super(["incrbyfloat", ...cmd], opts)
  }
}
var JsonArrAppendCommand = class extends Command {
  constructor(cmd, opts) {
    super(["JSON.ARRAPPEND", ...cmd], opts)
  }
}
var JsonArrIndexCommand = class extends Command {
  constructor(cmd, opts) {
    super(["JSON.ARRINDEX", ...cmd], opts)
  }
}
var JsonArrInsertCommand = class extends Command {
  constructor(cmd, opts) {
    super(["JSON.ARRINSERT", ...cmd], opts)
  }
}
var JsonArrLenCommand = class extends Command {
  constructor(cmd, opts) {
    super(["JSON.ARRLEN", cmd[0], cmd[1] ?? "$"], opts)
  }
}
var JsonArrPopCommand = class extends Command {
  constructor(cmd, opts) {
    super(["JSON.ARRPOP", ...cmd], opts)
  }
}
var JsonArrTrimCommand = class extends Command {
  constructor(cmd, opts) {
    const path = cmd[1] ?? "$"
    const start = cmd[2] ?? 0
    const stop = cmd[3] ?? 0
    super(["JSON.ARRTRIM", cmd[0], path, start, stop], opts)
  }
}
var JsonClearCommand = class extends Command {
  constructor(cmd, opts) {
    super(["JSON.CLEAR", ...cmd], opts)
  }
}
var JsonDelCommand = class extends Command {
  constructor(cmd, opts) {
    super(["JSON.DEL", ...cmd], opts)
  }
}
var JsonForgetCommand = class extends Command {
  constructor(cmd, opts) {
    super(["JSON.FORGET", ...cmd], opts)
  }
}
var JsonGetCommand = class extends Command {
  constructor(cmd, opts) {
    const command = ["JSON.GET"]
    if (typeof cmd[1] === "string") {
      command.push(...cmd)
    } else {
      command.push(cmd[0])
      if (cmd[1]) {
        if (cmd[1].indent) {
          command.push("INDENT", cmd[1].indent)
        }
        if (cmd[1].newline) {
          command.push("NEWLINE", cmd[1].newline)
        }
        if (cmd[1].space) {
          command.push("SPACE", cmd[1].space)
        }
      }
      command.push(...cmd.slice(2))
    }
    super(command, opts)
  }
}
var JsonMergeCommand = class extends Command {
  constructor(cmd, opts) {
    const command = ["JSON.MERGE", ...cmd]
    super(command, opts)
  }
}
var JsonMGetCommand = class extends Command {
  constructor(cmd, opts) {
    super(["JSON.MGET", ...cmd[0], cmd[1]], opts)
  }
}
var JsonMSetCommand = class extends Command {
  constructor(cmd, opts) {
    const command = ["JSON.MSET"]
    for (const c of cmd) {
      command.push(c.key, c.path, c.value)
    }
    super(command, opts)
  }
}
var JsonNumIncrByCommand = class extends Command {
  constructor(cmd, opts) {
    super(["JSON.NUMINCRBY", ...cmd], opts)
  }
}
var JsonNumMultByCommand = class extends Command {
  constructor(cmd, opts) {
    super(["JSON.NUMMULTBY", ...cmd], opts)
  }
}
var JsonObjKeysCommand = class extends Command {
  constructor(cmd, opts) {
    super(["JSON.OBJKEYS", ...cmd], opts)
  }
}
var JsonObjLenCommand = class extends Command {
  constructor(cmd, opts) {
    super(["JSON.OBJLEN", ...cmd], opts)
  }
}
var JsonRespCommand = class extends Command {
  constructor(cmd, opts) {
    super(["JSON.RESP", ...cmd], opts)
  }
}
var JsonSetCommand = class extends Command {
  constructor(cmd, opts) {
    const command = ["JSON.SET", cmd[0], cmd[1], cmd[2]]
    if (cmd[3]) {
      if (cmd[3].nx) {
        command.push("NX")
      } else if (cmd[3].xx) {
        command.push("XX")
      }
    }
    super(command, opts)
  }
}
var JsonStrAppendCommand = class extends Command {
  constructor(cmd, opts) {
    super(["JSON.STRAPPEND", ...cmd], opts)
  }
}
var JsonStrLenCommand = class extends Command {
  constructor(cmd, opts) {
    super(["JSON.STRLEN", ...cmd], opts)
  }
}
var JsonToggleCommand = class extends Command {
  constructor(cmd, opts) {
    super(["JSON.TOGGLE", ...cmd], opts)
  }
}
var JsonTypeCommand = class extends Command {
  constructor(cmd, opts) {
    super(["JSON.TYPE", ...cmd], opts)
  }
}
var KeysCommand = class extends Command {
  constructor(cmd, opts) {
    super(["keys", ...cmd], opts)
  }
}
var LIndexCommand = class extends Command {
  constructor(cmd, opts) {
    super(["lindex", ...cmd], opts)
  }
}
var LInsertCommand = class extends Command {
  constructor(cmd, opts) {
    super(["linsert", ...cmd], opts)
  }
}
var LLenCommand = class extends Command {
  constructor(cmd, opts) {
    super(["llen", ...cmd], opts)
  }
}
var LMoveCommand = class extends Command {
  constructor(cmd, opts) {
    super(["lmove", ...cmd], opts)
  }
}
var LmPopCommand = class extends Command {
  constructor(cmd, opts) {
    const [numkeys, keys, direction, count] = cmd
    super(["LMPOP", numkeys, ...keys, direction, ...(count ? ["COUNT", count] : [])], opts)
  }
}
var LPopCommand = class extends Command {
  constructor(cmd, opts) {
    super(["lpop", ...cmd], opts)
  }
}
var LPosCommand = class extends Command {
  constructor(cmd, opts) {
    const args = ["lpos", cmd[0], cmd[1]]
    if (typeof cmd[2]?.rank === "number") {
      args.push("rank", cmd[2].rank)
    }
    if (typeof cmd[2]?.count === "number") {
      args.push("count", cmd[2].count)
    }
    if (typeof cmd[2]?.maxLen === "number") {
      args.push("maxLen", cmd[2].maxLen)
    }
    super(args, opts)
  }
}
var LPushCommand = class extends Command {
  constructor(cmd, opts) {
    super(["lpush", ...cmd], opts)
  }
}
var LPushXCommand = class extends Command {
  constructor(cmd, opts) {
    super(["lpushx", ...cmd], opts)
  }
}
var LRangeCommand = class extends Command {
  constructor(cmd, opts) {
    super(["lrange", ...cmd], opts)
  }
}
var LRemCommand = class extends Command {
  constructor(cmd, opts) {
    super(["lrem", ...cmd], opts)
  }
}
var LSetCommand = class extends Command {
  constructor(cmd, opts) {
    super(["lset", ...cmd], opts)
  }
}
var LTrimCommand = class extends Command {
  constructor(cmd, opts) {
    super(["ltrim", ...cmd], opts)
  }
}
var MGetCommand = class extends Command {
  constructor(cmd, opts) {
    const keys = Array.isArray(cmd[0]) ? cmd[0] : cmd
    super(["mget", ...keys], opts)
  }
}
var MSetCommand = class extends Command {
  constructor([kv], opts) {
    super(["mset", ...Object.entries(kv).flatMap(([key, value]) => [key, value])], opts)
  }
}
var MSetNXCommand = class extends Command {
  constructor([kv], opts) {
    super(["msetnx", ...Object.entries(kv).flat()], opts)
  }
}
var PersistCommand = class extends Command {
  constructor(cmd, opts) {
    super(["persist", ...cmd], opts)
  }
}
var PExpireCommand = class extends Command {
  constructor(cmd, opts) {
    super(["pexpire", ...cmd], opts)
  }
}
var PExpireAtCommand = class extends Command {
  constructor(cmd, opts) {
    super(["pexpireat", ...cmd], opts)
  }
}
var PfAddCommand = class extends Command {
  constructor(cmd, opts) {
    super(["pfadd", ...cmd], opts)
  }
}
var PfCountCommand = class extends Command {
  constructor(cmd, opts) {
    super(["pfcount", ...cmd], opts)
  }
}
var PfMergeCommand = class extends Command {
  constructor(cmd, opts) {
    super(["pfmerge", ...cmd], opts)
  }
}
var PingCommand = class extends Command {
  constructor(cmd, opts) {
    const command = ["ping"]
    if (cmd?.[0] !== void 0) {
      command.push(cmd[0])
    }
    super(command, opts)
  }
}
var PSetEXCommand = class extends Command {
  constructor(cmd, opts) {
    super(["psetex", ...cmd], opts)
  }
}
var PTtlCommand = class extends Command {
  constructor(cmd, opts) {
    super(["pttl", ...cmd], opts)
  }
}
var PublishCommand = class extends Command {
  constructor(cmd, opts) {
    super(["publish", ...cmd], opts)
  }
}
var RandomKeyCommand = class extends Command {
  constructor(opts) {
    super(["randomkey"], opts)
  }
}
var RenameCommand = class extends Command {
  constructor(cmd, opts) {
    super(["rename", ...cmd], opts)
  }
}
var RenameNXCommand = class extends Command {
  constructor(cmd, opts) {
    super(["renamenx", ...cmd], opts)
  }
}
var RPopCommand = class extends Command {
  constructor(cmd, opts) {
    super(["rpop", ...cmd], opts)
  }
}
var RPushCommand = class extends Command {
  constructor(cmd, opts) {
    super(["rpush", ...cmd], opts)
  }
}
var RPushXCommand = class extends Command {
  constructor(cmd, opts) {
    super(["rpushx", ...cmd], opts)
  }
}
var SAddCommand = class extends Command {
  constructor(cmd, opts) {
    super(["sadd", ...cmd], opts)
  }
}
var ScanCommand = class extends Command {
  constructor([cursor, opts], cmdOpts) {
    const command = ["scan", cursor]
    if (opts?.match) {
      command.push("match", opts.match)
    }
    if (typeof opts?.count === "number") {
      command.push("count", opts.count)
    }
    if (opts && "withType" in opts && opts.withType === true) {
      command.push("withtype")
    } else if (opts && "type" in opts && opts.type && opts.type.length > 0) {
      command.push("type", opts.type)
    }
    super(command, {
      // @ts-expect-error ignore types here
      deserialize: opts?.withType ? deserializeScanWithTypesResponse : deserializeScanResponse,
      ...cmdOpts,
    })
  }
}
var SCardCommand = class extends Command {
  constructor(cmd, opts) {
    super(["scard", ...cmd], opts)
  }
}
var ScriptExistsCommand = class extends Command {
  constructor(hashes, opts) {
    super(["script", "exists", ...hashes], {
      deserialize: (result) => result,
      ...opts,
    })
  }
}
var ScriptFlushCommand = class extends Command {
  constructor([opts], cmdOpts) {
    const cmd = ["script", "flush"]
    if (opts?.sync) {
      cmd.push("sync")
    } else if (opts?.async) {
      cmd.push("async")
    }
    super(cmd, cmdOpts)
  }
}
var ScriptLoadCommand = class extends Command {
  constructor(args, opts) {
    super(["script", "load", ...args], opts)
  }
}
var SDiffCommand = class extends Command {
  constructor(cmd, opts) {
    super(["sdiff", ...cmd], opts)
  }
}
var SDiffStoreCommand = class extends Command {
  constructor(cmd, opts) {
    super(["sdiffstore", ...cmd], opts)
  }
}
var SetCommand = class extends Command {
  constructor([key, value, opts], cmdOpts) {
    const command = ["set", key, value]
    if (opts) {
      if ("nx" in opts && opts.nx) {
        command.push("nx")
      } else if ("xx" in opts && opts.xx) {
        command.push("xx")
      }
      if ("get" in opts && opts.get) {
        command.push("get")
      }
      if ("ex" in opts && typeof opts.ex === "number") {
        command.push("ex", opts.ex)
      } else if ("px" in opts && typeof opts.px === "number") {
        command.push("px", opts.px)
      } else if ("exat" in opts && typeof opts.exat === "number") {
        command.push("exat", opts.exat)
      } else if ("pxat" in opts && typeof opts.pxat === "number") {
        command.push("pxat", opts.pxat)
      } else if ("keepTtl" in opts && opts.keepTtl) {
        command.push("keepTtl")
      }
    }
    super(command, cmdOpts)
  }
}
var SetBitCommand = class extends Command {
  constructor(cmd, opts) {
    super(["setbit", ...cmd], opts)
  }
}
var SetExCommand = class extends Command {
  constructor(cmd, opts) {
    super(["setex", ...cmd], opts)
  }
}
var SetNxCommand = class extends Command {
  constructor(cmd, opts) {
    super(["setnx", ...cmd], opts)
  }
}
var SetRangeCommand = class extends Command {
  constructor(cmd, opts) {
    super(["setrange", ...cmd], opts)
  }
}
var SInterCommand = class extends Command {
  constructor(cmd, opts) {
    super(["sinter", ...cmd], opts)
  }
}
var SInterStoreCommand = class extends Command {
  constructor(cmd, opts) {
    super(["sinterstore", ...cmd], opts)
  }
}
var SIsMemberCommand = class extends Command {
  constructor(cmd, opts) {
    super(["sismember", ...cmd], opts)
  }
}
var SMembersCommand = class extends Command {
  constructor(cmd, opts) {
    super(["smembers", ...cmd], opts)
  }
}
var SMIsMemberCommand = class extends Command {
  constructor(cmd, opts) {
    super(["smismember", cmd[0], ...cmd[1]], opts)
  }
}
var SMoveCommand = class extends Command {
  constructor(cmd, opts) {
    super(["smove", ...cmd], opts)
  }
}
var SPopCommand = class extends Command {
  constructor([key, count], opts) {
    const command = ["spop", key]
    if (typeof count === "number") {
      command.push(count)
    }
    super(command, opts)
  }
}
var SRandMemberCommand = class extends Command {
  constructor([key, count], opts) {
    const command = ["srandmember", key]
    if (typeof count === "number") {
      command.push(count)
    }
    super(command, opts)
  }
}
var SRemCommand = class extends Command {
  constructor(cmd, opts) {
    super(["srem", ...cmd], opts)
  }
}
var SScanCommand = class extends Command {
  constructor([key, cursor, opts], cmdOpts) {
    const command = ["sscan", key, cursor]
    if (opts?.match) {
      command.push("match", opts.match)
    }
    if (typeof opts?.count === "number") {
      command.push("count", opts.count)
    }
    super(command, {
      deserialize: deserializeScanResponse,
      ...cmdOpts,
    })
  }
}
var StrLenCommand = class extends Command {
  constructor(cmd, opts) {
    super(["strlen", ...cmd], opts)
  }
}
var SUnionCommand = class extends Command {
  constructor(cmd, opts) {
    super(["sunion", ...cmd], opts)
  }
}
var SUnionStoreCommand = class extends Command {
  constructor(cmd, opts) {
    super(["sunionstore", ...cmd], opts)
  }
}
var TimeCommand = class extends Command {
  constructor(opts) {
    super(["time"], opts)
  }
}
var TouchCommand = class extends Command {
  constructor(cmd, opts) {
    super(["touch", ...cmd], opts)
  }
}
var TtlCommand = class extends Command {
  constructor(cmd, opts) {
    super(["ttl", ...cmd], opts)
  }
}
var TypeCommand = class extends Command {
  constructor(cmd, opts) {
    super(["type", ...cmd], opts)
  }
}
var UnlinkCommand = class extends Command {
  constructor(cmd, opts) {
    super(["unlink", ...cmd], opts)
  }
}
var XAckCommand = class extends Command {
  constructor([key, group, id], opts) {
    const ids = Array.isArray(id) ? [...id] : [id]
    super(["XACK", key, group, ...ids], opts)
  }
}
var XAddCommand = class extends Command {
  constructor([key, id, entries, opts], commandOptions) {
    const command = ["XADD", key]
    if (opts) {
      if (opts.nomkStream) {
        command.push("NOMKSTREAM")
      }
      if (opts.trim) {
        command.push(opts.trim.type, opts.trim.comparison, opts.trim.threshold)
        if (opts.trim.limit !== void 0) {
          command.push("LIMIT", opts.trim.limit)
        }
      }
    }
    command.push(id)
    for (const [k, v] of Object.entries(entries)) {
      command.push(k, v)
    }
    super(command, commandOptions)
  }
}
var XAutoClaim = class extends Command {
  constructor([key, group, consumer, minIdleTime, start, options], opts) {
    const commands = []
    if (options?.count) {
      commands.push("COUNT", options.count)
    }
    if (options?.justId) {
      commands.push("JUSTID")
    }
    super(["XAUTOCLAIM", key, group, consumer, minIdleTime, start, ...commands], opts)
  }
}
var XClaimCommand = class extends Command {
  constructor([key, group, consumer, minIdleTime, id, options], opts) {
    const ids = Array.isArray(id) ? [...id] : [id]
    const commands = []
    if (options?.idleMS) {
      commands.push("IDLE", options.idleMS)
    }
    if (options?.idleMS) {
      commands.push("TIME", options.timeMS)
    }
    if (options?.retryCount) {
      commands.push("RETRYCOUNT", options.retryCount)
    }
    if (options?.force) {
      commands.push("FORCE")
    }
    if (options?.justId) {
      commands.push("JUSTID")
    }
    if (options?.lastId) {
      commands.push("LASTID", options.lastId)
    }
    super(["XCLAIM", key, group, consumer, minIdleTime, ...ids, ...commands], opts)
  }
}
var XDelCommand = class extends Command {
  constructor([key, ids], opts) {
    const cmds = Array.isArray(ids) ? [...ids] : [ids]
    super(["XDEL", key, ...cmds], opts)
  }
}
var XGroupCommand = class extends Command {
  constructor([key, opts], commandOptions) {
    const command = ["XGROUP"]
    switch (opts.type) {
      case "CREATE": {
        command.push("CREATE", key, opts.group, opts.id)
        if (opts.options) {
          if (opts.options.MKSTREAM) {
            command.push("MKSTREAM")
          }
          if (opts.options.ENTRIESREAD !== void 0) {
            command.push("ENTRIESREAD", opts.options.ENTRIESREAD.toString())
          }
        }
        break
      }
      case "CREATECONSUMER": {
        command.push("CREATECONSUMER", key, opts.group, opts.consumer)
        break
      }
      case "DELCONSUMER": {
        command.push("DELCONSUMER", key, opts.group, opts.consumer)
        break
      }
      case "DESTROY": {
        command.push("DESTROY", key, opts.group)
        break
      }
      case "SETID": {
        command.push("SETID", key, opts.group, opts.id)
        if (opts.options?.ENTRIESREAD !== void 0) {
          command.push("ENTRIESREAD", opts.options.ENTRIESREAD.toString())
        }
        break
      }
      default: {
        throw new Error("Invalid XGROUP")
      }
    }
    super(command, commandOptions)
  }
}
var XInfoCommand = class extends Command {
  constructor([key, options], opts) {
    const cmds = []
    if (options.type === "CONSUMERS") {
      cmds.push("CONSUMERS", key, options.group)
    } else {
      cmds.push("GROUPS", key)
    }
    super(["XINFO", ...cmds], opts)
  }
}
var XLenCommand = class extends Command {
  constructor(cmd, opts) {
    super(["XLEN", ...cmd], opts)
  }
}
var XPendingCommand = class extends Command {
  constructor([key, group, start, end, count, options], opts) {
    const consumers =
      options?.consumer === void 0
        ? []
        : Array.isArray(options.consumer)
          ? [...options.consumer]
          : [options.consumer]
    super(
      [
        "XPENDING",
        key,
        group,
        ...(options?.idleTime ? ["IDLE", options.idleTime] : []),
        start,
        end,
        count,
        ...consumers,
      ],
      opts
    )
  }
}
function deserialize6(result) {
  const obj = {}
  for (const e of result) {
    for (let i = 0; i < e.length; i += 2) {
      const streamId = e[i]
      const entries = e[i + 1]
      if (!(streamId in obj)) {
        obj[streamId] = {}
      }
      for (let j = 0; j < entries.length; j += 2) {
        const field = entries[j]
        const value = entries[j + 1]
        try {
          obj[streamId][field] = JSON.parse(value)
        } catch {
          obj[streamId][field] = value
        }
      }
    }
  }
  return obj
}
var XRangeCommand = class extends Command {
  constructor([key, start, end, count], opts) {
    const command = ["XRANGE", key, start, end]
    if (typeof count === "number") {
      command.push("COUNT", count)
    }
    super(command, {
      deserialize: (result) => deserialize6(result),
      ...opts,
    })
  }
}
var UNBALANCED_XREAD_ERR =
  "ERR Unbalanced XREAD list of streams: for each stream key an ID or '$' must be specified"
var XReadCommand = class extends Command {
  constructor([key, id, options], opts) {
    if (Array.isArray(key) && Array.isArray(id) && key.length !== id.length) {
      throw new Error(UNBALANCED_XREAD_ERR)
    }
    const commands = []
    if (typeof options?.count === "number") {
      commands.push("COUNT", options.count)
    }
    if (typeof options?.blockMS === "number") {
      commands.push("BLOCK", options.blockMS)
    }
    commands.push(
      "STREAMS",
      ...(Array.isArray(key) ? [...key] : [key]),
      ...(Array.isArray(id) ? [...id] : [id])
    )
    super(["XREAD", ...commands], opts)
  }
}
var UNBALANCED_XREADGROUP_ERR =
  "ERR Unbalanced XREADGROUP list of streams: for each stream key an ID or '$' must be specified"
var XReadGroupCommand = class extends Command {
  constructor([group, consumer, key, id, options], opts) {
    if (Array.isArray(key) && Array.isArray(id) && key.length !== id.length) {
      throw new Error(UNBALANCED_XREADGROUP_ERR)
    }
    const commands = []
    if (typeof options?.count === "number") {
      commands.push("COUNT", options.count)
    }
    if (typeof options?.blockMS === "number") {
      commands.push("BLOCK", options.blockMS)
    }
    if (typeof options?.NOACK === "boolean" && options.NOACK) {
      commands.push("NOACK")
    }
    commands.push(
      "STREAMS",
      ...(Array.isArray(key) ? [...key] : [key]),
      ...(Array.isArray(id) ? [...id] : [id])
    )
    super(["XREADGROUP", "GROUP", group, consumer, ...commands], opts)
  }
}
var XRevRangeCommand = class extends Command {
  constructor([key, end, start, count], opts) {
    const command = ["XREVRANGE", key, end, start]
    if (typeof count === "number") {
      command.push("COUNT", count)
    }
    super(command, {
      deserialize: (result) => deserialize7(result),
      ...opts,
    })
  }
}
function deserialize7(result) {
  const obj = {}
  for (const e of result) {
    for (let i = 0; i < e.length; i += 2) {
      const streamId = e[i]
      const entries = e[i + 1]
      if (!(streamId in obj)) {
        obj[streamId] = {}
      }
      for (let j = 0; j < entries.length; j += 2) {
        const field = entries[j]
        const value = entries[j + 1]
        try {
          obj[streamId][field] = JSON.parse(value)
        } catch {
          obj[streamId][field] = value
        }
      }
    }
  }
  return obj
}
var XTrimCommand = class extends Command {
  constructor([key, options], opts) {
    const { limit, strategy, threshold, exactness = "~" } = options
    super(["XTRIM", key, strategy, exactness, threshold, ...(limit ? ["LIMIT", limit] : [])], opts)
  }
}
var ZAddCommand = class extends Command {
  constructor([key, arg1, ...arg2], opts) {
    const command = ["zadd", key]
    if ("nx" in arg1 && arg1.nx) {
      command.push("nx")
    } else if ("xx" in arg1 && arg1.xx) {
      command.push("xx")
    }
    if ("ch" in arg1 && arg1.ch) {
      command.push("ch")
    }
    if ("incr" in arg1 && arg1.incr) {
      command.push("incr")
    }
    if ("lt" in arg1 && arg1.lt) {
      command.push("lt")
    } else if ("gt" in arg1 && arg1.gt) {
      command.push("gt")
    }
    if ("score" in arg1 && "member" in arg1) {
      command.push(arg1.score, arg1.member)
    }
    command.push(...arg2.flatMap(({ score, member }) => [score, member]))
    super(command, opts)
  }
}
var ZCardCommand = class extends Command {
  constructor(cmd, opts) {
    super(["zcard", ...cmd], opts)
  }
}
var ZCountCommand = class extends Command {
  constructor(cmd, opts) {
    super(["zcount", ...cmd], opts)
  }
}
var ZIncrByCommand = class extends Command {
  constructor(cmd, opts) {
    super(["zincrby", ...cmd], opts)
  }
}
var ZInterStoreCommand = class extends Command {
  constructor([destination, numKeys, keyOrKeys, opts], cmdOpts) {
    const command = ["zinterstore", destination, numKeys]
    if (Array.isArray(keyOrKeys)) {
      command.push(...keyOrKeys)
    } else {
      command.push(keyOrKeys)
    }
    if (opts) {
      if ("weights" in opts && opts.weights) {
        command.push("weights", ...opts.weights)
      } else if ("weight" in opts && typeof opts.weight === "number") {
        command.push("weights", opts.weight)
      }
      if ("aggregate" in opts) {
        command.push("aggregate", opts.aggregate)
      }
    }
    super(command, cmdOpts)
  }
}
var ZLexCountCommand = class extends Command {
  constructor(cmd, opts) {
    super(["zlexcount", ...cmd], opts)
  }
}
var ZPopMaxCommand = class extends Command {
  constructor([key, count], opts) {
    const command = ["zpopmax", key]
    if (typeof count === "number") {
      command.push(count)
    }
    super(command, opts)
  }
}
var ZPopMinCommand = class extends Command {
  constructor([key, count], opts) {
    const command = ["zpopmin", key]
    if (typeof count === "number") {
      command.push(count)
    }
    super(command, opts)
  }
}
var ZRangeCommand = class extends Command {
  constructor([key, min, max, opts], cmdOpts) {
    const command = ["zrange", key, min, max]
    if (opts?.byScore) {
      command.push("byscore")
    }
    if (opts?.byLex) {
      command.push("bylex")
    }
    if (opts?.rev) {
      command.push("rev")
    }
    if (opts?.count !== void 0 && opts.offset !== void 0) {
      command.push("limit", opts.offset, opts.count)
    }
    if (opts?.withScores) {
      command.push("withscores")
    }
    super(command, cmdOpts)
  }
}
var ZRankCommand = class extends Command {
  constructor(cmd, opts) {
    super(["zrank", ...cmd], opts)
  }
}
var ZRemCommand = class extends Command {
  constructor(cmd, opts) {
    super(["zrem", ...cmd], opts)
  }
}
var ZRemRangeByLexCommand = class extends Command {
  constructor(cmd, opts) {
    super(["zremrangebylex", ...cmd], opts)
  }
}
var ZRemRangeByRankCommand = class extends Command {
  constructor(cmd, opts) {
    super(["zremrangebyrank", ...cmd], opts)
  }
}
var ZRemRangeByScoreCommand = class extends Command {
  constructor(cmd, opts) {
    super(["zremrangebyscore", ...cmd], opts)
  }
}
var ZRevRankCommand = class extends Command {
  constructor(cmd, opts) {
    super(["zrevrank", ...cmd], opts)
  }
}
var ZScanCommand = class extends Command {
  constructor([key, cursor, opts], cmdOpts) {
    const command = ["zscan", key, cursor]
    if (opts?.match) {
      command.push("match", opts.match)
    }
    if (typeof opts?.count === "number") {
      command.push("count", opts.count)
    }
    super(command, {
      deserialize: deserializeScanResponse,
      ...cmdOpts,
    })
  }
}
var ZScoreCommand = class extends Command {
  constructor(cmd, opts) {
    super(["zscore", ...cmd], opts)
  }
}
var ZUnionCommand = class extends Command {
  constructor([numKeys, keyOrKeys, opts], cmdOpts) {
    const command = ["zunion", numKeys]
    if (Array.isArray(keyOrKeys)) {
      command.push(...keyOrKeys)
    } else {
      command.push(keyOrKeys)
    }
    if (opts) {
      if ("weights" in opts && opts.weights) {
        command.push("weights", ...opts.weights)
      } else if ("weight" in opts && typeof opts.weight === "number") {
        command.push("weights", opts.weight)
      }
      if ("aggregate" in opts) {
        command.push("aggregate", opts.aggregate)
      }
      if (opts.withScores) {
        command.push("withscores")
      }
    }
    super(command, cmdOpts)
  }
}
var ZUnionStoreCommand = class extends Command {
  constructor([destination, numKeys, keyOrKeys, opts], cmdOpts) {
    const command = ["zunionstore", destination, numKeys]
    if (Array.isArray(keyOrKeys)) {
      command.push(...keyOrKeys)
    } else {
      command.push(keyOrKeys)
    }
    if (opts) {
      if ("weights" in opts && opts.weights) {
        command.push("weights", ...opts.weights)
      } else if ("weight" in opts && typeof opts.weight === "number") {
        command.push("weights", opts.weight)
      }
      if ("aggregate" in opts) {
        command.push("aggregate", opts.aggregate)
      }
    }
    super(command, cmdOpts)
  }
}
var ZDiffStoreCommand = class extends Command {
  constructor(cmd, opts) {
    super(["zdiffstore", ...cmd], opts)
  }
}
var ZMScoreCommand = class extends Command {
  constructor(cmd, opts) {
    const [key, members] = cmd
    super(["zmscore", key, ...members], opts)
  }
}
var Pipeline = class {
  client
  commands
  commandOptions
  multiExec
  constructor(opts) {
    this.client = opts.client
    this.commands = []
    this.commandOptions = opts.commandOptions
    this.multiExec = opts.multiExec ?? false
    if (this.commandOptions?.latencyLogging) {
      const originalExec = this.exec.bind(this)
      this.exec = async (options) => {
        const start = performance.now()
        const result = await (options ? originalExec(options) : originalExec())
        const end = performance.now()
        const loggerResult = (end - start).toFixed(2)
        console.log(
          `Latency for \x1B[38;2;19;185;39m${this.multiExec ? ["MULTI-EXEC"] : ["PIPELINE"].toString().toUpperCase()}\x1B[0m: \x1B[38;2;0;255;255m${loggerResult} ms\x1B[0m`
        )
        return result
      }
    }
  }
  exec = async (options) => {
    if (this.commands.length === 0) {
      throw new Error("Pipeline is empty")
    }
    const path = this.multiExec ? ["multi-exec"] : ["pipeline"]
    const res = await this.client.request({
      path,
      body: Object.values(this.commands).map((c) => c.command),
    })
    return options?.keepErrors
      ? res.map(({ error, result }, i) => {
          return {
            error,
            result: this.commands[i].deserialize(result),
          }
        })
      : res.map(({ error, result }, i) => {
          if (error) {
            throw new UpstashError(
              `Command ${i + 1} [ ${this.commands[i].command[0]} ] failed: ${error}`
            )
          }
          return this.commands[i].deserialize(result)
        })
  }
  /**
   * Returns the length of pipeline before the execution
   */
  length() {
    return this.commands.length
  }
  /**
   * Pushes a command into the pipeline and returns a chainable instance of the
   * pipeline
   */
  chain(command) {
    this.commands.push(command)
    return this
  }
  /**
   * @see https://redis.io/commands/append
   */
  append = (...args) => this.chain(new AppendCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/bitcount
   */
  bitcount = (...args) => this.chain(new BitCountCommand(args, this.commandOptions))
  /**
   * Returns an instance that can be used to execute `BITFIELD` commands on one key.
   *
   * @example
   * ```typescript
   * redis.set("mykey", 0);
   * const result = await redis.pipeline()
   *   .bitfield("mykey")
   *   .set("u4", 0, 16)
   *   .incr("u4", "#1", 1)
   *   .exec();
   * console.log(result); // [[0, 1]]
   * ```
   *
   * @see https://redis.io/commands/bitfield
   */
  bitfield = (...args) =>
    new BitFieldCommand(args, this.client, this.commandOptions, this.chain.bind(this))
  /**
   * @see https://redis.io/commands/bitop
   */
  bitop = (op, destinationKey, sourceKey, ...sourceKeys) =>
    this.chain(
      new BitOpCommand([op, destinationKey, sourceKey, ...sourceKeys], this.commandOptions)
    )
  /**
   * @see https://redis.io/commands/bitpos
   */
  bitpos = (...args) => this.chain(new BitPosCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/copy
   */
  copy = (...args) => this.chain(new CopyCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/zdiffstore
   */
  zdiffstore = (...args) => this.chain(new ZDiffStoreCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/dbsize
   */
  dbsize = () => this.chain(new DBSizeCommand(this.commandOptions))
  /**
   * @see https://redis.io/commands/decr
   */
  decr = (...args) => this.chain(new DecrCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/decrby
   */
  decrby = (...args) => this.chain(new DecrByCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/del
   */
  del = (...args) => this.chain(new DelCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/echo
   */
  echo = (...args) => this.chain(new EchoCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/eval_ro
   */
  evalRo = (...args) => this.chain(new EvalROCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/eval
   */
  eval = (...args) => this.chain(new EvalCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/evalsha_ro
   */
  evalshaRo = (...args) => this.chain(new EvalshaROCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/evalsha
   */
  evalsha = (...args) => this.chain(new EvalshaCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/exists
   */
  exists = (...args) => this.chain(new ExistsCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/expire
   */
  expire = (...args) => this.chain(new ExpireCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/expireat
   */
  expireat = (...args) => this.chain(new ExpireAtCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/flushall
   */
  flushall = (args) => this.chain(new FlushAllCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/flushdb
   */
  flushdb = (...args) => this.chain(new FlushDBCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/geoadd
   */
  geoadd = (...args) => this.chain(new GeoAddCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/geodist
   */
  geodist = (...args) => this.chain(new GeoDistCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/geopos
   */
  geopos = (...args) => this.chain(new GeoPosCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/geohash
   */
  geohash = (...args) => this.chain(new GeoHashCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/geosearch
   */
  geosearch = (...args) => this.chain(new GeoSearchCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/geosearchstore
   */
  geosearchstore = (...args) => this.chain(new GeoSearchStoreCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/get
   */
  get = (...args) => this.chain(new GetCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/getbit
   */
  getbit = (...args) => this.chain(new GetBitCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/getdel
   */
  getdel = (...args) => this.chain(new GetDelCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/getex
   */
  getex = (...args) => this.chain(new GetExCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/getrange
   */
  getrange = (...args) => this.chain(new GetRangeCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/getset
   */
  getset = (key, value) => this.chain(new GetSetCommand([key, value], this.commandOptions))
  /**
   * @see https://redis.io/commands/hdel
   */
  hdel = (...args) => this.chain(new HDelCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/hexists
   */
  hexists = (...args) => this.chain(new HExistsCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/hexpire
   */
  hexpire = (...args) => this.chain(new HExpireCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/hexpireat
   */
  hexpireat = (...args) => this.chain(new HExpireAtCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/hexpiretime
   */
  hexpiretime = (...args) => this.chain(new HExpireTimeCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/httl
   */
  httl = (...args) => this.chain(new HTtlCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/hpexpire
   */
  hpexpire = (...args) => this.chain(new HPExpireCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/hpexpireat
   */
  hpexpireat = (...args) => this.chain(new HPExpireAtCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/hpexpiretime
   */
  hpexpiretime = (...args) => this.chain(new HPExpireTimeCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/hpttl
   */
  hpttl = (...args) => this.chain(new HPTtlCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/hpersist
   */
  hpersist = (...args) => this.chain(new HPersistCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/hget
   */
  hget = (...args) => this.chain(new HGetCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/hgetall
   */
  hgetall = (...args) => this.chain(new HGetAllCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/hincrby
   */
  hincrby = (...args) => this.chain(new HIncrByCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/hincrbyfloat
   */
  hincrbyfloat = (...args) => this.chain(new HIncrByFloatCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/hkeys
   */
  hkeys = (...args) => this.chain(new HKeysCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/hlen
   */
  hlen = (...args) => this.chain(new HLenCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/hmget
   */
  hmget = (...args) => this.chain(new HMGetCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/hmset
   */
  hmset = (key, kv) => this.chain(new HMSetCommand([key, kv], this.commandOptions))
  /**
   * @see https://redis.io/commands/hrandfield
   */
  hrandfield = (key, count, withValues) =>
    this.chain(new HRandFieldCommand([key, count, withValues], this.commandOptions))
  /**
   * @see https://redis.io/commands/hscan
   */
  hscan = (...args) => this.chain(new HScanCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/hset
   */
  hset = (key, kv) => this.chain(new HSetCommand([key, kv], this.commandOptions))
  /**
   * @see https://redis.io/commands/hsetnx
   */
  hsetnx = (key, field, value) =>
    this.chain(new HSetNXCommand([key, field, value], this.commandOptions))
  /**
   * @see https://redis.io/commands/hstrlen
   */
  hstrlen = (...args) => this.chain(new HStrLenCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/hvals
   */
  hvals = (...args) => this.chain(new HValsCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/incr
   */
  incr = (...args) => this.chain(new IncrCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/incrby
   */
  incrby = (...args) => this.chain(new IncrByCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/incrbyfloat
   */
  incrbyfloat = (...args) => this.chain(new IncrByFloatCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/keys
   */
  keys = (...args) => this.chain(new KeysCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/lindex
   */
  lindex = (...args) => this.chain(new LIndexCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/linsert
   */
  linsert = (key, direction, pivot, value) =>
    this.chain(new LInsertCommand([key, direction, pivot, value], this.commandOptions))
  /**
   * @see https://redis.io/commands/llen
   */
  llen = (...args) => this.chain(new LLenCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/lmove
   */
  lmove = (...args) => this.chain(new LMoveCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/lpop
   */
  lpop = (...args) => this.chain(new LPopCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/lmpop
   */
  lmpop = (...args) => this.chain(new LmPopCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/lpos
   */
  lpos = (...args) => this.chain(new LPosCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/lpush
   */
  lpush = (key, ...elements) =>
    this.chain(new LPushCommand([key, ...elements], this.commandOptions))
  /**
   * @see https://redis.io/commands/lpushx
   */
  lpushx = (key, ...elements) =>
    this.chain(new LPushXCommand([key, ...elements], this.commandOptions))
  /**
   * @see https://redis.io/commands/lrange
   */
  lrange = (...args) => this.chain(new LRangeCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/lrem
   */
  lrem = (key, count, value) =>
    this.chain(new LRemCommand([key, count, value], this.commandOptions))
  /**
   * @see https://redis.io/commands/lset
   */
  lset = (key, index, value) =>
    this.chain(new LSetCommand([key, index, value], this.commandOptions))
  /**
   * @see https://redis.io/commands/ltrim
   */
  ltrim = (...args) => this.chain(new LTrimCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/mget
   */
  mget = (...args) => this.chain(new MGetCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/mset
   */
  mset = (kv) => this.chain(new MSetCommand([kv], this.commandOptions))
  /**
   * @see https://redis.io/commands/msetnx
   */
  msetnx = (kv) => this.chain(new MSetNXCommand([kv], this.commandOptions))
  /**
   * @see https://redis.io/commands/persist
   */
  persist = (...args) => this.chain(new PersistCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/pexpire
   */
  pexpire = (...args) => this.chain(new PExpireCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/pexpireat
   */
  pexpireat = (...args) => this.chain(new PExpireAtCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/pfadd
   */
  pfadd = (...args) => this.chain(new PfAddCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/pfcount
   */
  pfcount = (...args) => this.chain(new PfCountCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/pfmerge
   */
  pfmerge = (...args) => this.chain(new PfMergeCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/ping
   */
  ping = (args) => this.chain(new PingCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/psetex
   */
  psetex = (key, ttl, value) =>
    this.chain(new PSetEXCommand([key, ttl, value], this.commandOptions))
  /**
   * @see https://redis.io/commands/pttl
   */
  pttl = (...args) => this.chain(new PTtlCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/publish
   */
  publish = (...args) => this.chain(new PublishCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/randomkey
   */
  randomkey = () => this.chain(new RandomKeyCommand(this.commandOptions))
  /**
   * @see https://redis.io/commands/rename
   */
  rename = (...args) => this.chain(new RenameCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/renamenx
   */
  renamenx = (...args) => this.chain(new RenameNXCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/rpop
   */
  rpop = (...args) => this.chain(new RPopCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/rpush
   */
  rpush = (key, ...elements) =>
    this.chain(new RPushCommand([key, ...elements], this.commandOptions))
  /**
   * @see https://redis.io/commands/rpushx
   */
  rpushx = (key, ...elements) =>
    this.chain(new RPushXCommand([key, ...elements], this.commandOptions))
  /**
   * @see https://redis.io/commands/sadd
   */
  sadd = (key, member, ...members) =>
    this.chain(new SAddCommand([key, member, ...members], this.commandOptions))
  /**
   * @see https://redis.io/commands/scan
   */
  scan = (...args) => this.chain(new ScanCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/scard
   */
  scard = (...args) => this.chain(new SCardCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/script-exists
   */
  scriptExists = (...args) => this.chain(new ScriptExistsCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/script-flush
   */
  scriptFlush = (...args) => this.chain(new ScriptFlushCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/script-load
   */
  scriptLoad = (...args) => this.chain(new ScriptLoadCommand(args, this.commandOptions))
  /*)*
   * @see https://redis.io/commands/sdiff
   */
  sdiff = (...args) => this.chain(new SDiffCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/sdiffstore
   */
  sdiffstore = (...args) => this.chain(new SDiffStoreCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/set
   */
  set = (key, value, opts) => this.chain(new SetCommand([key, value, opts], this.commandOptions))
  /**
   * @see https://redis.io/commands/setbit
   */
  setbit = (...args) => this.chain(new SetBitCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/setex
   */
  setex = (key, ttl, value) => this.chain(new SetExCommand([key, ttl, value], this.commandOptions))
  /**
   * @see https://redis.io/commands/setnx
   */
  setnx = (key, value) => this.chain(new SetNxCommand([key, value], this.commandOptions))
  /**
   * @see https://redis.io/commands/setrange
   */
  setrange = (...args) => this.chain(new SetRangeCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/sinter
   */
  sinter = (...args) => this.chain(new SInterCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/sinterstore
   */
  sinterstore = (...args) => this.chain(new SInterStoreCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/sismember
   */
  sismember = (key, member) => this.chain(new SIsMemberCommand([key, member], this.commandOptions))
  /**
   * @see https://redis.io/commands/smembers
   */
  smembers = (...args) => this.chain(new SMembersCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/smismember
   */
  smismember = (key, members) =>
    this.chain(new SMIsMemberCommand([key, members], this.commandOptions))
  /**
   * @see https://redis.io/commands/smove
   */
  smove = (source, destination, member) =>
    this.chain(new SMoveCommand([source, destination, member], this.commandOptions))
  /**
   * @see https://redis.io/commands/spop
   */
  spop = (...args) => this.chain(new SPopCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/srandmember
   */
  srandmember = (...args) => this.chain(new SRandMemberCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/srem
   */
  srem = (key, ...members) => this.chain(new SRemCommand([key, ...members], this.commandOptions))
  /**
   * @see https://redis.io/commands/sscan
   */
  sscan = (...args) => this.chain(new SScanCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/strlen
   */
  strlen = (...args) => this.chain(new StrLenCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/sunion
   */
  sunion = (...args) => this.chain(new SUnionCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/sunionstore
   */
  sunionstore = (...args) => this.chain(new SUnionStoreCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/time
   */
  time = () => this.chain(new TimeCommand(this.commandOptions))
  /**
   * @see https://redis.io/commands/touch
   */
  touch = (...args) => this.chain(new TouchCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/ttl
   */
  ttl = (...args) => this.chain(new TtlCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/type
   */
  type = (...args) => this.chain(new TypeCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/unlink
   */
  unlink = (...args) => this.chain(new UnlinkCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/zadd
   */
  zadd = (...args) => {
    if ("score" in args[1]) {
      return this.chain(new ZAddCommand([args[0], args[1], ...args.slice(2)], this.commandOptions))
    }
    return this.chain(new ZAddCommand([args[0], args[1], ...args.slice(2)], this.commandOptions))
  }
  /**
   * @see https://redis.io/commands/xadd
   */
  xadd = (...args) => this.chain(new XAddCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/xack
   */
  xack = (...args) => this.chain(new XAckCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/xdel
   */
  xdel = (...args) => this.chain(new XDelCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/xgroup
   */
  xgroup = (...args) => this.chain(new XGroupCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/xread
   */
  xread = (...args) => this.chain(new XReadCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/xreadgroup
   */
  xreadgroup = (...args) => this.chain(new XReadGroupCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/xinfo
   */
  xinfo = (...args) => this.chain(new XInfoCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/xlen
   */
  xlen = (...args) => this.chain(new XLenCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/xpending
   */
  xpending = (...args) => this.chain(new XPendingCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/xclaim
   */
  xclaim = (...args) => this.chain(new XClaimCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/xautoclaim
   */
  xautoclaim = (...args) => this.chain(new XAutoClaim(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/xtrim
   */
  xtrim = (...args) => this.chain(new XTrimCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/xrange
   */
  xrange = (...args) => this.chain(new XRangeCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/xrevrange
   */
  xrevrange = (...args) => this.chain(new XRevRangeCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/zcard
   */
  zcard = (...args) => this.chain(new ZCardCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/zcount
   */
  zcount = (...args) => this.chain(new ZCountCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/zincrby
   */
  zincrby = (key, increment, member) =>
    this.chain(new ZIncrByCommand([key, increment, member], this.commandOptions))
  /**
   * @see https://redis.io/commands/zinterstore
   */
  zinterstore = (...args) => this.chain(new ZInterStoreCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/zlexcount
   */
  zlexcount = (...args) => this.chain(new ZLexCountCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/zmscore
   */
  zmscore = (...args) => this.chain(new ZMScoreCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/zpopmax
   */
  zpopmax = (...args) => this.chain(new ZPopMaxCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/zpopmin
   */
  zpopmin = (...args) => this.chain(new ZPopMinCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/zrange
   */
  zrange = (...args) => this.chain(new ZRangeCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/zrank
   */
  zrank = (key, member) => this.chain(new ZRankCommand([key, member], this.commandOptions))
  /**
   * @see https://redis.io/commands/zrem
   */
  zrem = (key, ...members) => this.chain(new ZRemCommand([key, ...members], this.commandOptions))
  /**
   * @see https://redis.io/commands/zremrangebylex
   */
  zremrangebylex = (...args) => this.chain(new ZRemRangeByLexCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/zremrangebyrank
   */
  zremrangebyrank = (...args) => this.chain(new ZRemRangeByRankCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/zremrangebyscore
   */
  zremrangebyscore = (...args) => this.chain(new ZRemRangeByScoreCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/zrevrank
   */
  zrevrank = (key, member) => this.chain(new ZRevRankCommand([key, member], this.commandOptions))
  /**
   * @see https://redis.io/commands/zscan
   */
  zscan = (...args) => this.chain(new ZScanCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/zscore
   */
  zscore = (key, member) => this.chain(new ZScoreCommand([key, member], this.commandOptions))
  /**
   * @see https://redis.io/commands/zunionstore
   */
  zunionstore = (...args) => this.chain(new ZUnionStoreCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/zunion
   */
  zunion = (...args) => this.chain(new ZUnionCommand(args, this.commandOptions))
  /**
   * @see https://redis.io/commands/?group=json
   */
  get json() {
    return {
      /**
       * @see https://redis.io/commands/json.arrappend
       */
      arrappend: (...args) => this.chain(new JsonArrAppendCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.arrindex
       */
      arrindex: (...args) => this.chain(new JsonArrIndexCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.arrinsert
       */
      arrinsert: (...args) => this.chain(new JsonArrInsertCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.arrlen
       */
      arrlen: (...args) => this.chain(new JsonArrLenCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.arrpop
       */
      arrpop: (...args) => this.chain(new JsonArrPopCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.arrtrim
       */
      arrtrim: (...args) => this.chain(new JsonArrTrimCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.clear
       */
      clear: (...args) => this.chain(new JsonClearCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.del
       */
      del: (...args) => this.chain(new JsonDelCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.forget
       */
      forget: (...args) => this.chain(new JsonForgetCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.get
       */
      get: (...args) => this.chain(new JsonGetCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.merge
       */
      merge: (...args) => this.chain(new JsonMergeCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.mget
       */
      mget: (...args) => this.chain(new JsonMGetCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.mset
       */
      mset: (...args) => this.chain(new JsonMSetCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.numincrby
       */
      numincrby: (...args) => this.chain(new JsonNumIncrByCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.nummultby
       */
      nummultby: (...args) => this.chain(new JsonNumMultByCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.objkeys
       */
      objkeys: (...args) => this.chain(new JsonObjKeysCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.objlen
       */
      objlen: (...args) => this.chain(new JsonObjLenCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.resp
       */
      resp: (...args) => this.chain(new JsonRespCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.set
       */
      set: (...args) => this.chain(new JsonSetCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.strappend
       */
      strappend: (...args) => this.chain(new JsonStrAppendCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.strlen
       */
      strlen: (...args) => this.chain(new JsonStrLenCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.toggle
       */
      toggle: (...args) => this.chain(new JsonToggleCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/commands/json.type
       */
      type: (...args) => this.chain(new JsonTypeCommand(args, this.commandOptions)),
    }
  }
  get functions() {
    return {
      /**
       * @see https://redis.io/docs/latest/commands/function-load/
       */
      load: (...args) => this.chain(new FunctionLoadCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/docs/latest/commands/function-list/
       */
      list: (...args) => this.chain(new FunctionListCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/docs/latest/commands/function-delete/
       */
      delete: (...args) => this.chain(new FunctionDeleteCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/docs/latest/commands/function-flush/
       */
      flush: () => this.chain(new FunctionFlushCommand(this.commandOptions)),
      /**
       * @see https://redis.io/docs/latest/commands/function-stats/
       */
      stats: () => this.chain(new FunctionStatsCommand(this.commandOptions)),
      /**
       * @see https://redis.io/docs/latest/commands/fcall/
       */
      call: (...args) => this.chain(new FCallCommand(args, this.commandOptions)),
      /**
       * @see https://redis.io/docs/latest/commands/fcall_ro/
       */
      callRo: (...args) => this.chain(new FCallRoCommand(args, this.commandOptions)),
    }
  }
}
var EXCLUDE_COMMANDS = /* @__PURE__ */ new Set([
  "scan",
  "keys",
  "flushdb",
  "flushall",
  "dbsize",
  "hscan",
  "hgetall",
  "hkeys",
  "lrange",
  "sscan",
  "smembers",
  "xrange",
  "xrevrange",
  "zscan",
  "zrange",
  "exec",
])
function createAutoPipelineProxy(_redis, namespace = "root") {
  const redis2 = _redis
  if (!redis2.autoPipelineExecutor) {
    redis2.autoPipelineExecutor = new AutoPipelineExecutor(redis2)
  }
  return new Proxy(redis2, {
    get: (redis22, command) => {
      if (command === "pipelineCounter") {
        return redis22.autoPipelineExecutor.pipelineCounter
      }
      if (namespace === "root" && command === "json") {
        return createAutoPipelineProxy(redis22, "json")
      }
      if (namespace === "root" && command === "functions") {
        return createAutoPipelineProxy(redis22, "functions")
      }
      if (namespace === "root") {
        const commandInRedisButNotPipeline =
          command in redis22 && !(command in redis22.autoPipelineExecutor.pipeline)
        const isCommandExcluded = EXCLUDE_COMMANDS.has(command)
        if (commandInRedisButNotPipeline || isCommandExcluded) {
          return redis22[command]
        }
      }
      const pipeline = redis22.autoPipelineExecutor.pipeline
      const targetFunction =
        namespace === "json"
          ? pipeline.json[command]
          : namespace === "functions"
            ? pipeline.functions[command]
            : pipeline[command]
      const isFunction = typeof targetFunction === "function"
      if (isFunction) {
        return (...args) => {
          return redis22.autoPipelineExecutor.withAutoPipeline((pipeline2) => {
            const targetFunction2 =
              namespace === "json"
                ? pipeline2.json[command]
                : namespace === "functions"
                  ? pipeline2.functions[command]
                  : pipeline2[command]
            targetFunction2(...args)
          })
        }
      }
      return targetFunction
    },
  })
}
var AutoPipelineExecutor = class {
  pipelinePromises = /* @__PURE__ */ new WeakMap()
  activePipeline = null
  indexInCurrentPipeline = 0
  redis
  pipeline
  // only to make sure that proxy can work
  pipelineCounter = 0
  // to keep track of how many times a pipeline was executed
  constructor(redis2) {
    this.redis = redis2
    this.pipeline = redis2.pipeline()
  }
  async withAutoPipeline(executeWithPipeline) {
    const pipeline = this.activePipeline ?? this.redis.pipeline()
    if (!this.activePipeline) {
      this.activePipeline = pipeline
      this.indexInCurrentPipeline = 0
    }
    const index = this.indexInCurrentPipeline++
    executeWithPipeline(pipeline)
    const pipelineDone = this.deferExecution().then(() => {
      if (!this.pipelinePromises.has(pipeline)) {
        const pipelinePromise = pipeline.exec({ keepErrors: true })
        this.pipelineCounter += 1
        this.pipelinePromises.set(pipeline, pipelinePromise)
        this.activePipeline = null
      }
      return this.pipelinePromises.get(pipeline)
    })
    const results = await pipelineDone
    const commandResult = results[index]
    if (commandResult.error) {
      throw new UpstashError(`Command failed: ${commandResult.error}`)
    }
    return commandResult.result
  }
  async deferExecution() {
    await Promise.resolve()
    await Promise.resolve()
  }
}
var PSubscribeCommand = class extends Command {
  constructor(cmd, opts) {
    const sseHeaders = {
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    }
    super([], {
      ...opts,
      headers: sseHeaders,
      path: ["psubscribe", ...cmd],
      streamOptions: {
        isStreaming: true,
        onMessage: opts?.streamOptions?.onMessage,
        signal: opts?.streamOptions?.signal,
      },
    })
  }
}
var Subscriber = class extends EventTarget {
  subscriptions
  client
  listeners
  opts
  constructor(client, channels, isPattern = false, opts) {
    super()
    this.client = client
    this.subscriptions = /* @__PURE__ */ new Map()
    this.listeners = /* @__PURE__ */ new Map()
    this.opts = opts
    for (const channel of channels) {
      if (isPattern) {
        this.subscribeToPattern(channel)
      } else {
        this.subscribeToChannel(channel)
      }
    }
  }
  subscribeToChannel(channel) {
    const controller = new AbortController()
    const command = new SubscribeCommand([channel], {
      streamOptions: {
        signal: controller.signal,
        onMessage: (data) => this.handleMessage(data, false),
      },
    })
    command.exec(this.client).catch((error) => {
      if (error.name !== "AbortError") {
        this.dispatchToListeners("error", error)
      }
    })
    this.subscriptions.set(channel, {
      command,
      controller,
      isPattern: false,
    })
  }
  subscribeToPattern(pattern) {
    const controller = new AbortController()
    const command = new PSubscribeCommand([pattern], {
      streamOptions: {
        signal: controller.signal,
        onMessage: (data) => this.handleMessage(data, true),
      },
    })
    command.exec(this.client).catch((error) => {
      if (error.name !== "AbortError") {
        this.dispatchToListeners("error", error)
      }
    })
    this.subscriptions.set(pattern, {
      command,
      controller,
      isPattern: true,
    })
  }
  handleMessage(data, isPattern) {
    const messageData = data.replace(/^data:\s*/, "")
    const firstCommaIndex = messageData.indexOf(",")
    const secondCommaIndex = messageData.indexOf(",", firstCommaIndex + 1)
    const thirdCommaIndex = isPattern ? messageData.indexOf(",", secondCommaIndex + 1) : -1
    if (firstCommaIndex !== -1 && secondCommaIndex !== -1) {
      const type = messageData.slice(0, firstCommaIndex)
      if (isPattern && type === "pmessage" && thirdCommaIndex !== -1) {
        const pattern = messageData.slice(firstCommaIndex + 1, secondCommaIndex)
        const channel = messageData.slice(secondCommaIndex + 1, thirdCommaIndex)
        const messageStr = messageData.slice(thirdCommaIndex + 1)
        try {
          const message =
            this.opts?.automaticDeserialization === false ? messageStr : JSON.parse(messageStr)
          this.dispatchToListeners("pmessage", { pattern, channel, message })
          this.dispatchToListeners(`pmessage:${pattern}`, { pattern, channel, message })
        } catch (error) {
          this.dispatchToListeners("error", new Error(`Failed to parse message: ${error}`))
        }
      } else {
        const channel = messageData.slice(firstCommaIndex + 1, secondCommaIndex)
        const messageStr = messageData.slice(secondCommaIndex + 1)
        try {
          if (
            type === "subscribe" ||
            type === "psubscribe" ||
            type === "unsubscribe" ||
            type === "punsubscribe"
          ) {
            const count = Number.parseInt(messageStr)
            this.dispatchToListeners(type, count)
          } else {
            const message =
              this.opts?.automaticDeserialization === false
                ? messageStr
                : parseWithTryCatch(messageStr)
            this.dispatchToListeners(type, { channel, message })
            this.dispatchToListeners(`${type}:${channel}`, { channel, message })
          }
        } catch (error) {
          this.dispatchToListeners("error", new Error(`Failed to parse message: ${error}`))
        }
      }
    }
  }
  dispatchToListeners(type, data) {
    const listeners = this.listeners.get(type)
    if (listeners) {
      for (const listener of listeners) {
        listener(data)
      }
    }
  }
  on(type, listener) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, /* @__PURE__ */ new Set())
    }
    this.listeners.get(type)?.add(listener)
  }
  removeAllListeners() {
    this.listeners.clear()
  }
  async unsubscribe(channels) {
    if (channels) {
      for (const channel of channels) {
        const subscription = this.subscriptions.get(channel)
        if (subscription) {
          try {
            subscription.controller.abort()
          } catch {}
          this.subscriptions.delete(channel)
        }
      }
    } else {
      for (const subscription of this.subscriptions.values()) {
        try {
          subscription.controller.abort()
        } catch {}
      }
      this.subscriptions.clear()
      this.removeAllListeners()
    }
  }
  getSubscribedChannels() {
    return [...this.subscriptions.keys()]
  }
}
var SubscribeCommand = class extends Command {
  constructor(cmd, opts) {
    const sseHeaders = {
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    }
    super([], {
      ...opts,
      headers: sseHeaders,
      path: ["subscribe", ...cmd],
      streamOptions: {
        isStreaming: true,
        onMessage: opts?.streamOptions?.onMessage,
        signal: opts?.streamOptions?.signal,
      },
    })
  }
}
var parseWithTryCatch = (str) => {
  try {
    return JSON.parse(str)
  } catch {
    return str
  }
}
var Script = class {
  script
  /**
   * @deprecated This property is initialized to an empty string and will be set in the init method
   * asynchronously. Do not use this property immidiately after the constructor.
   *
   * This property is only exposed for backwards compatibility and will be removed in the
   * future major release.
   */
  sha1
  redis
  constructor(redis2, script) {
    this.redis = redis2
    this.script = script
    this.sha1 = ""
    void this.init(script)
  }
  /**
   * Initialize the script by computing its SHA-1 hash.
   */
  async init(script) {
    if (this.sha1) return
    this.sha1 = await this.digest(script)
  }
  /**
   * Send an `EVAL` command to redis.
   */
  async eval(keys, args) {
    await this.init(this.script)
    return await this.redis.eval(this.script, keys, args)
  }
  /**
   * Calculates the sha1 hash of the script and then calls `EVALSHA`.
   */
  async evalsha(keys, args) {
    await this.init(this.script)
    return await this.redis.evalsha(this.sha1, keys, args)
  }
  /**
   * Optimistically try to run `EVALSHA` first.
   * If the script is not loaded in redis, it will fall back and try again with `EVAL`.
   *
   * Following calls will be able to use the cached script
   */
  async exec(keys, args) {
    await this.init(this.script)
    const res = await this.redis.evalsha(this.sha1, keys, args).catch(async (error) => {
      if (error instanceof Error && error.message.toLowerCase().includes("noscript")) {
        return await this.redis.eval(this.script, keys, args)
      }
      throw error
    })
    return res
  }
  /**
   * Compute the sha1 hash of the script and return its hex representation.
   */
  async digest(s) {
    const data = new TextEncoder().encode(s)
    const hashBuffer = await subtle.digest("SHA-1", data)
    const hashArray = [...new Uint8Array(hashBuffer)]
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }
}
var ScriptRO = class {
  script
  /**
   * @deprecated This property is initialized to an empty string and will be set in the init method
   * asynchronously. Do not use this property immidiately after the constructor.
   *
   * This property is only exposed for backwards compatibility and will be removed in the
   * future major release.
   */
  sha1
  redis
  constructor(redis2, script) {
    this.redis = redis2
    this.sha1 = ""
    this.script = script
    void this.init(script)
  }
  async init(script) {
    if (this.sha1) return
    this.sha1 = await this.digest(script)
  }
  /**
   * Send an `EVAL_RO` command to redis.
   */
  async evalRo(keys, args) {
    await this.init(this.script)
    return await this.redis.evalRo(this.script, keys, args)
  }
  /**
   * Calculates the sha1 hash of the script and then calls `EVALSHA_RO`.
   */
  async evalshaRo(keys, args) {
    await this.init(this.script)
    return await this.redis.evalshaRo(this.sha1, keys, args)
  }
  /**
   * Optimistically try to run `EVALSHA_RO` first.
   * If the script is not loaded in redis, it will fall back and try again with `EVAL_RO`.
   *
   * Following calls will be able to use the cached script
   */
  async exec(keys, args) {
    await this.init(this.script)
    const res = await this.redis.evalshaRo(this.sha1, keys, args).catch(async (error) => {
      if (error instanceof Error && error.message.toLowerCase().includes("noscript")) {
        return await this.redis.evalRo(this.script, keys, args)
      }
      throw error
    })
    return res
  }
  /**
   * Compute the sha1 hash of the script and return its hex representation.
   */
  async digest(s) {
    const data = new TextEncoder().encode(s)
    const hashBuffer = await subtle.digest("SHA-1", data)
    const hashArray = [...new Uint8Array(hashBuffer)]
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }
}
var Redis = class {
  client
  opts
  enableTelemetry
  enableAutoPipelining
  /**
   * Create a new redis client
   *
   * @example
   * ```typescript
   * const redis = new Redis({
   *  url: "<UPSTASH_REDIS_REST_URL>",
   *  token: "<UPSTASH_REDIS_REST_TOKEN>",
   * });
   * ```
   */
  constructor(client, opts) {
    this.client = client
    this.opts = opts
    this.enableTelemetry = opts?.enableTelemetry ?? true
    if (opts?.readYourWrites === false) {
      this.client.readYourWrites = false
    }
    this.enableAutoPipelining = opts?.enableAutoPipelining ?? true
  }
  get readYourWritesSyncToken() {
    return this.client.upstashSyncToken
  }
  set readYourWritesSyncToken(session) {
    this.client.upstashSyncToken = session
  }
  get json() {
    return {
      /**
       * @see https://redis.io/commands/json.arrappend
       */
      arrappend: (...args) => new JsonArrAppendCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.arrindex
       */
      arrindex: (...args) => new JsonArrIndexCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.arrinsert
       */
      arrinsert: (...args) => new JsonArrInsertCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.arrlen
       */
      arrlen: (...args) => new JsonArrLenCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.arrpop
       */
      arrpop: (...args) => new JsonArrPopCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.arrtrim
       */
      arrtrim: (...args) => new JsonArrTrimCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.clear
       */
      clear: (...args) => new JsonClearCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.del
       */
      del: (...args) => new JsonDelCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.forget
       */
      forget: (...args) => new JsonForgetCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.get
       */
      get: (...args) => new JsonGetCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.merge
       */
      merge: (...args) => new JsonMergeCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.mget
       */
      mget: (...args) => new JsonMGetCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.mset
       */
      mset: (...args) => new JsonMSetCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.numincrby
       */
      numincrby: (...args) => new JsonNumIncrByCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.nummultby
       */
      nummultby: (...args) => new JsonNumMultByCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.objkeys
       */
      objkeys: (...args) => new JsonObjKeysCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.objlen
       */
      objlen: (...args) => new JsonObjLenCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.resp
       */
      resp: (...args) => new JsonRespCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.set
       */
      set: (...args) => new JsonSetCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.strappend
       */
      strappend: (...args) => new JsonStrAppendCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.strlen
       */
      strlen: (...args) => new JsonStrLenCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.toggle
       */
      toggle: (...args) => new JsonToggleCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/commands/json.type
       */
      type: (...args) => new JsonTypeCommand(args, this.opts).exec(this.client),
    }
  }
  get functions() {
    return {
      /**
       * @see https://redis.io/docs/latest/commands/function-load/
       */
      load: (...args) => new FunctionLoadCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/docs/latest/commands/function-list/
       */
      list: (...args) => new FunctionListCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/docs/latest/commands/function-delete/
       */
      delete: (...args) => new FunctionDeleteCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/docs/latest/commands/function-flush/
       */
      flush: () => new FunctionFlushCommand(this.opts).exec(this.client),
      /**
       * @see https://redis.io/docs/latest/commands/function-stats/
       *
       * Note: `running_script` field is not supported and therefore not included in the type.
       */
      stats: () => new FunctionStatsCommand(this.opts).exec(this.client),
      /**
       * @see https://redis.io/docs/latest/commands/fcall/
       */
      call: (...args) => new FCallCommand(args, this.opts).exec(this.client),
      /**
       * @see https://redis.io/docs/latest/commands/fcall_ro/
       */
      callRo: (...args) => new FCallRoCommand(args, this.opts).exec(this.client),
    }
  }
  /**
   * Wrap a new middleware around the HTTP client.
   */
  use = (middleware) => {
    const makeRequest = this.client.request.bind(this.client)
    this.client.request = (req) => middleware(req, makeRequest)
  }
  /**
   * Technically this is not private, we can hide it from intellisense by doing this
   */
  addTelemetry = (telemetry) => {
    if (!this.enableTelemetry) {
      return
    }
    try {
      this.client.mergeTelemetry(telemetry)
    } catch {}
  }
  /**
   * Creates a new script.
   *
   * Scripts offer the ability to optimistically try to execute a script without having to send the
   * entire script to the server. If the script is loaded on the server, it tries again by sending
   * the entire script. Afterwards, the script is cached on the server.
   *
   * @param script - The script to create
   * @param opts - Optional options to pass to the script `{ readonly?: boolean }`
   * @returns A new script
   *
   * @example
   * ```ts
   * const redis = new Redis({...})
   *
   * const script = redis.createScript<string>("return ARGV[1];")
   * const arg1 = await script.eval([], ["Hello World"])
   * expect(arg1, "Hello World")
   * ```
   * @example
   * ```ts
   * const redis = new Redis({...})
   *
   * const script = redis.createScript<string>("return ARGV[1];", { readonly: true })
   * const arg1 = await script.evalRo([], ["Hello World"])
   * expect(arg1, "Hello World")
   * ```
   */
  createScript(script, opts) {
    return opts?.readonly ? new ScriptRO(this, script) : new Script(this, script)
  }
  /**
   * Create a new pipeline that allows you to send requests in bulk.
   *
   * @see {@link Pipeline}
   */
  pipeline = () =>
    new Pipeline({
      client: this.client,
      commandOptions: this.opts,
      multiExec: false,
    })
  autoPipeline = () => {
    return createAutoPipelineProxy(this)
  }
  /**
   * Create a new transaction to allow executing multiple steps atomically.
   *
   * All the commands in a transaction are serialized and executed sequentially. A request sent by
   * another client will never be served in the middle of the execution of a Redis Transaction. This
   * guarantees that the commands are executed as a single isolated operation.
   *
   * @see {@link Pipeline}
   */
  multi = () =>
    new Pipeline({
      client: this.client,
      commandOptions: this.opts,
      multiExec: true,
    })
  /**
   * Returns an instance that can be used to execute `BITFIELD` commands on one key.
   *
   * @example
   * ```typescript
   * redis.set("mykey", 0);
   * const result = await redis.bitfield("mykey")
   *   .set("u4", 0, 16)
   *   .incr("u4", "#1", 1)
   *   .exec();
   * console.log(result); // [0, 1]
   * ```
   *
   * @see https://redis.io/commands/bitfield
   */
  bitfield = (...args) => new BitFieldCommand(args, this.client, this.opts)
  /**
   * @see https://redis.io/commands/append
   */
  append = (...args) => new AppendCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/bitcount
   */
  bitcount = (...args) => new BitCountCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/bitop
   */
  bitop = (op, destinationKey, sourceKey, ...sourceKeys) =>
    new BitOpCommand([op, destinationKey, sourceKey, ...sourceKeys], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/bitpos
   */
  bitpos = (...args) => new BitPosCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/copy
   */
  copy = (...args) => new CopyCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/dbsize
   */
  dbsize = () => new DBSizeCommand(this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/decr
   */
  decr = (...args) => new DecrCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/decrby
   */
  decrby = (...args) => new DecrByCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/del
   */
  del = (...args) => new DelCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/echo
   */
  echo = (...args) => new EchoCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/eval_ro
   */
  evalRo = (...args) => new EvalROCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/eval
   */
  eval = (...args) => new EvalCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/evalsha_ro
   */
  evalshaRo = (...args) => new EvalshaROCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/evalsha
   */
  evalsha = (...args) => new EvalshaCommand(args, this.opts).exec(this.client)
  /**
   * Generic method to execute any Redis command.
   */
  exec = (args) => new ExecCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/exists
   */
  exists = (...args) => new ExistsCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/expire
   */
  expire = (...args) => new ExpireCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/expireat
   */
  expireat = (...args) => new ExpireAtCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/flushall
   */
  flushall = (args) => new FlushAllCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/flushdb
   */
  flushdb = (...args) => new FlushDBCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/geoadd
   */
  geoadd = (...args) => new GeoAddCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/geopos
   */
  geopos = (...args) => new GeoPosCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/geodist
   */
  geodist = (...args) => new GeoDistCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/geohash
   */
  geohash = (...args) => new GeoHashCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/geosearch
   */
  geosearch = (...args) => new GeoSearchCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/geosearchstore
   */
  geosearchstore = (...args) => new GeoSearchStoreCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/get
   */
  get = (...args) => new GetCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/getbit
   */
  getbit = (...args) => new GetBitCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/getdel
   */
  getdel = (...args) => new GetDelCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/getex
   */
  getex = (...args) => new GetExCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/getrange
   */
  getrange = (...args) => new GetRangeCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/getset
   */
  getset = (key, value) => new GetSetCommand([key, value], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hdel
   */
  hdel = (...args) => new HDelCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hexists
   */
  hexists = (...args) => new HExistsCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hexpire
   */
  hexpire = (...args) => new HExpireCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hexpireat
   */
  hexpireat = (...args) => new HExpireAtCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hexpiretime
   */
  hexpiretime = (...args) => new HExpireTimeCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/httl
   */
  httl = (...args) => new HTtlCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hpexpire
   */
  hpexpire = (...args) => new HPExpireCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hpexpireat
   */
  hpexpireat = (...args) => new HPExpireAtCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hpexpiretime
   */
  hpexpiretime = (...args) => new HPExpireTimeCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hpttl
   */
  hpttl = (...args) => new HPTtlCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hpersist
   */
  hpersist = (...args) => new HPersistCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hget
   */
  hget = (...args) => new HGetCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hgetall
   */
  hgetall = (...args) => new HGetAllCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hincrby
   */
  hincrby = (...args) => new HIncrByCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hincrbyfloat
   */
  hincrbyfloat = (...args) => new HIncrByFloatCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hkeys
   */
  hkeys = (...args) => new HKeysCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hlen
   */
  hlen = (...args) => new HLenCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hmget
   */
  hmget = (...args) => new HMGetCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hmset
   */
  hmset = (key, kv) => new HMSetCommand([key, kv], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hrandfield
   */
  hrandfield = (key, count, withValues) =>
    new HRandFieldCommand([key, count, withValues], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hscan
   */
  hscan = (...args) => new HScanCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hset
   */
  hset = (key, kv) => new HSetCommand([key, kv], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hsetnx
   */
  hsetnx = (key, field, value) =>
    new HSetNXCommand([key, field, value], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hstrlen
   */
  hstrlen = (...args) => new HStrLenCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/hvals
   */
  hvals = (...args) => new HValsCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/incr
   */
  incr = (...args) => new IncrCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/incrby
   */
  incrby = (...args) => new IncrByCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/incrbyfloat
   */
  incrbyfloat = (...args) => new IncrByFloatCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/keys
   */
  keys = (...args) => new KeysCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/lindex
   */
  lindex = (...args) => new LIndexCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/linsert
   */
  linsert = (key, direction, pivot, value) =>
    new LInsertCommand([key, direction, pivot, value], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/llen
   */
  llen = (...args) => new LLenCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/lmove
   */
  lmove = (...args) => new LMoveCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/lpop
   */
  lpop = (...args) => new LPopCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/lmpop
   */
  lmpop = (...args) => new LmPopCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/lpos
   */
  lpos = (...args) => new LPosCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/lpush
   */
  lpush = (key, ...elements) => new LPushCommand([key, ...elements], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/lpushx
   */
  lpushx = (key, ...elements) => new LPushXCommand([key, ...elements], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/lrange
   */
  lrange = (...args) => new LRangeCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/lrem
   */
  lrem = (key, count, value) => new LRemCommand([key, count, value], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/lset
   */
  lset = (key, index, value) => new LSetCommand([key, index, value], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/ltrim
   */
  ltrim = (...args) => new LTrimCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/mget
   */
  mget = (...args) => new MGetCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/mset
   */
  mset = (kv) => new MSetCommand([kv], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/msetnx
   */
  msetnx = (kv) => new MSetNXCommand([kv], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/persist
   */
  persist = (...args) => new PersistCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/pexpire
   */
  pexpire = (...args) => new PExpireCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/pexpireat
   */
  pexpireat = (...args) => new PExpireAtCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/pfadd
   */
  pfadd = (...args) => new PfAddCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/pfcount
   */
  pfcount = (...args) => new PfCountCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/pfmerge
   */
  pfmerge = (...args) => new PfMergeCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/ping
   */
  ping = (args) => new PingCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/psetex
   */
  psetex = (key, ttl, value) => new PSetEXCommand([key, ttl, value], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/psubscribe
   */
  psubscribe = (patterns) => {
    const patternArray = Array.isArray(patterns) ? patterns : [patterns]
    return new Subscriber(this.client, patternArray, true, this.opts)
  }
  /**
   * @see https://redis.io/commands/pttl
   */
  pttl = (...args) => new PTtlCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/publish
   */
  publish = (...args) => new PublishCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/randomkey
   */
  randomkey = () => new RandomKeyCommand().exec(this.client)
  /**
   * @see https://redis.io/commands/rename
   */
  rename = (...args) => new RenameCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/renamenx
   */
  renamenx = (...args) => new RenameNXCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/rpop
   */
  rpop = (...args) => new RPopCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/rpush
   */
  rpush = (key, ...elements) => new RPushCommand([key, ...elements], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/rpushx
   */
  rpushx = (key, ...elements) => new RPushXCommand([key, ...elements], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/sadd
   */
  sadd = (key, member, ...members) =>
    new SAddCommand([key, member, ...members], this.opts).exec(this.client)
  scan(cursor, opts) {
    return new ScanCommand([cursor, opts], this.opts).exec(this.client)
  }
  /**
   * @see https://redis.io/commands/scard
   */
  scard = (...args) => new SCardCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/script-exists
   */
  scriptExists = (...args) => new ScriptExistsCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/script-flush
   */
  scriptFlush = (...args) => new ScriptFlushCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/script-load
   */
  scriptLoad = (...args) => new ScriptLoadCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/sdiff
   */
  sdiff = (...args) => new SDiffCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/sdiffstore
   */
  sdiffstore = (...args) => new SDiffStoreCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/set
   */
  set = (key, value, opts) => new SetCommand([key, value, opts], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/setbit
   */
  setbit = (...args) => new SetBitCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/setex
   */
  setex = (key, ttl, value) => new SetExCommand([key, ttl, value], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/setnx
   */
  setnx = (key, value) => new SetNxCommand([key, value], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/setrange
   */
  setrange = (...args) => new SetRangeCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/sinter
   */
  sinter = (...args) => new SInterCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/sinterstore
   */
  sinterstore = (...args) => new SInterStoreCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/sismember
   */
  sismember = (key, member) => new SIsMemberCommand([key, member], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/smismember
   */
  smismember = (key, members) => new SMIsMemberCommand([key, members], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/smembers
   */
  smembers = (...args) => new SMembersCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/smove
   */
  smove = (source, destination, member) =>
    new SMoveCommand([source, destination, member], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/spop
   */
  spop = (...args) => new SPopCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/srandmember
   */
  srandmember = (...args) => new SRandMemberCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/srem
   */
  srem = (key, ...members) => new SRemCommand([key, ...members], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/sscan
   */
  sscan = (...args) => new SScanCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/strlen
   */
  strlen = (...args) => new StrLenCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/subscribe
   */
  subscribe = (channels) => {
    const channelArray = Array.isArray(channels) ? channels : [channels]
    return new Subscriber(this.client, channelArray, false, this.opts)
  }
  /**
   * @see https://redis.io/commands/sunion
   */
  sunion = (...args) => new SUnionCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/sunionstore
   */
  sunionstore = (...args) => new SUnionStoreCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/time
   */
  time = () => new TimeCommand().exec(this.client)
  /**
   * @see https://redis.io/commands/touch
   */
  touch = (...args) => new TouchCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/ttl
   */
  ttl = (...args) => new TtlCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/type
   */
  type = (...args) => new TypeCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/unlink
   */
  unlink = (...args) => new UnlinkCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/xadd
   */
  xadd = (...args) => new XAddCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/xack
   */
  xack = (...args) => new XAckCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/xdel
   */
  xdel = (...args) => new XDelCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/xgroup
   */
  xgroup = (...args) => new XGroupCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/xread
   */
  xread = (...args) => new XReadCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/xreadgroup
   */
  xreadgroup = (...args) => new XReadGroupCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/xinfo
   */
  xinfo = (...args) => new XInfoCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/xlen
   */
  xlen = (...args) => new XLenCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/xpending
   */
  xpending = (...args) => new XPendingCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/xclaim
   */
  xclaim = (...args) => new XClaimCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/xautoclaim
   */
  xautoclaim = (...args) => new XAutoClaim(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/xtrim
   */
  xtrim = (...args) => new XTrimCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/xrange
   */
  xrange = (...args) => new XRangeCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/xrevrange
   */
  xrevrange = (...args) => new XRevRangeCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/zadd
   */
  zadd = (...args) => {
    if ("score" in args[1]) {
      return new ZAddCommand([args[0], args[1], ...args.slice(2)], this.opts).exec(this.client)
    }
    return new ZAddCommand([args[0], args[1], ...args.slice(2)], this.opts).exec(this.client)
  }
  /**
   * @see https://redis.io/commands/zcard
   */
  zcard = (...args) => new ZCardCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/zcount
   */
  zcount = (...args) => new ZCountCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/zdiffstore
   */
  zdiffstore = (...args) => new ZDiffStoreCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/zincrby
   */
  zincrby = (key, increment, member) =>
    new ZIncrByCommand([key, increment, member], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/zinterstore
   */
  zinterstore = (...args) => new ZInterStoreCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/zlexcount
   */
  zlexcount = (...args) => new ZLexCountCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/zmscore
   */
  zmscore = (...args) => new ZMScoreCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/zpopmax
   */
  zpopmax = (...args) => new ZPopMaxCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/zpopmin
   */
  zpopmin = (...args) => new ZPopMinCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/zrange
   */
  zrange = (...args) => new ZRangeCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/zrank
   */
  zrank = (key, member) => new ZRankCommand([key, member], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/zrem
   */
  zrem = (key, ...members) => new ZRemCommand([key, ...members], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/zremrangebylex
   */
  zremrangebylex = (...args) => new ZRemRangeByLexCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/zremrangebyrank
   */
  zremrangebyrank = (...args) => new ZRemRangeByRankCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/zremrangebyscore
   */
  zremrangebyscore = (...args) => new ZRemRangeByScoreCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/zrevrank
   */
  zrevrank = (key, member) => new ZRevRankCommand([key, member], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/zscan
   */
  zscan = (...args) => new ZScanCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/zscore
   */
  zscore = (key, member) => new ZScoreCommand([key, member], this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/zunion
   */
  zunion = (...args) => new ZUnionCommand(args, this.opts).exec(this.client)
  /**
   * @see https://redis.io/commands/zunionstore
   */
  zunionstore = (...args) => new ZUnionStoreCommand(args, this.opts).exec(this.client)
}
var VERSION = "v1.36.1"

// node_modules/@upstash/redis/nodejs.mjs
if (typeof atob === "undefined") {
  global.atob = (b64) => Buffer.from(b64, "base64").toString("utf8")
}
var Redis2 = class _Redis extends Redis {
  /**
   * Create a new redis client by providing a custom `Requester` implementation
   *
   * @example
   * ```ts
   *
   * import { UpstashRequest, Requester, UpstashResponse, Redis } from "@upstash/redis"
   *
   *  const requester: Requester = {
   *    request: <TResult>(req: UpstashRequest): Promise<UpstashResponse<TResult>> => {
   *      // ...
   *    }
   *  }
   *
   * const redis = new Redis(requester)
   * ```
   */
  constructor(configOrRequester) {
    if ("request" in configOrRequester) {
      super(configOrRequester)
      return
    }
    if (!configOrRequester.url) {
      console.warn(
        `[Upstash Redis] The 'url' property is missing or undefined in your Redis config.`
      )
    } else if (
      configOrRequester.url.startsWith(" ") ||
      configOrRequester.url.endsWith(" ") ||
      /\r|\n/.test(configOrRequester.url)
    ) {
      console.warn(
        "[Upstash Redis] The redis url contains whitespace or newline, which can cause errors!"
      )
    }
    if (!configOrRequester.token) {
      console.warn(
        `[Upstash Redis] The 'token' property is missing or undefined in your Redis config.`
      )
    } else if (
      configOrRequester.token.startsWith(" ") ||
      configOrRequester.token.endsWith(" ") ||
      /\r|\n/.test(configOrRequester.token)
    ) {
      console.warn(
        "[Upstash Redis] The redis token contains whitespace or newline, which can cause errors!"
      )
    }
    const client = new HttpClient({
      baseUrl: configOrRequester.url,
      retry: configOrRequester.retry,
      headers: { authorization: `Bearer ${configOrRequester.token}` },
      agent: configOrRequester.agent,
      responseEncoding: configOrRequester.responseEncoding,
      cache: configOrRequester.cache ?? "no-store",
      signal: configOrRequester.signal,
      keepAlive: configOrRequester.keepAlive,
      readYourWrites: configOrRequester.readYourWrites,
    })
    const safeEnv =
      typeof process === "object" && process && typeof process.env === "object" && process.env
        ? process.env
        : {}
    super(client, {
      automaticDeserialization: configOrRequester.automaticDeserialization,
      enableTelemetry: configOrRequester.enableTelemetry ?? !safeEnv.UPSTASH_DISABLE_TELEMETRY,
      latencyLogging: configOrRequester.latencyLogging,
      enableAutoPipelining: configOrRequester.enableAutoPipelining,
    })
    const nodeVersion = typeof process === "object" && process ? process.version : void 0
    this.addTelemetry({
      runtime:
        // @ts-expect-error to silence compiler
        typeof EdgeRuntime === "string"
          ? "edge-light"
          : nodeVersion
            ? `node@${nodeVersion}`
            : "unknown",
      platform: safeEnv.UPSTASH_CONSOLE
        ? "console"
        : safeEnv.VERCEL
          ? "vercel"
          : safeEnv.AWS_REGION
            ? "aws"
            : "unknown",
      sdk: `@upstash/redis@${VERSION}`,
    })
    if (this.enableAutoPipelining) {
      return this.autoPipeline()
    }
  }
  /**
   * Create a new Upstash Redis instance from environment variables.
   *
   * Use this to automatically load connection secrets from your environment
   * variables. For instance when using the Vercel integration.
   *
   * This tries to load connection details from your environment using `process.env`:
   * - URL: `UPSTASH_REDIS_REST_URL` or fallback to `KV_REST_API_URL`
   * - Token: `UPSTASH_REDIS_REST_TOKEN` or fallback to `KV_REST_API_TOKEN`
   *
   * The fallback variables provide compatibility with Vercel KV and other platforms
   * that may use different naming conventions.
   */
  static fromEnv(config) {
    if (
      typeof process !== "object" ||
      !process ||
      typeof process.env !== "object" ||
      !process.env
    ) {
      throw new TypeError(
        '[Upstash Redis] Unable to get environment variables, `process.env` is undefined. If you are deploying to cloudflare, please import from "@upstash/redis/cloudflare" instead'
      )
    }
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
    if (!url) {
      console.warn("[Upstash Redis] Unable to find environment variable: `UPSTASH_REDIS_REST_URL`")
    }
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
    if (!token) {
      console.warn(
        "[Upstash Redis] Unable to find environment variable: `UPSTASH_REDIS_REST_TOKEN`"
      )
    }
    return new _Redis({ ...config, url, token })
  }
}

// api-src/lib/rateLimit.ts
var redis = null
function getRedis() {
  if (redis) return redis
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) {
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
      console.warn(
        `[RateLimit] Config Error: URL=${!!url}, Token=${!!token}. Check Vercel Env Vars.`
      )
    }
    return null
  }
  redis = new Redis2({ url, token })
  return redis
}
var limiters = {}
function getLimiter(prefix, requests, window2) {
  const redis2 = getRedis()
  if (!redis2) return null
  const key = `${prefix}:${requests}:${window2}`
  if (!limiters[key]) {
    limiters[key] = new import_ratelimit.Ratelimit({
      redis: redis2,
      limiter: import_ratelimit.Ratelimit.slidingWindow(requests, window2),
      prefix: `ratelimit:${prefix}`,
      analytics: false,
    })
  }
  return limiters[key]
}
function getClientId(req) {
  const forwarded = req.headers["x-forwarded-for"]
  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0]
    return ip.trim()
  }
  const realIp = req.headers["x-real-ip"]
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp
  }
  const auth = req.headers["authorization"]
  if (auth) {
    const token = Array.isArray(auth) ? auth[0] : auth
    return `token:${token.substring(0, 16)}`
  }
  return `anon:${Math.random().toString(36).substring(2, 10)}`
}
async function rateLimit(req, prefix, requests, window2 = "60 s") {
  const limiter = getLimiter(prefix, requests, window2)
  if (!limiter) {
    return { success: true, limit: requests, remaining: requests, reset: 0 }
  }
  const clientId = getClientId(req)
  const result = await limiter.limit(clientId)
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}
var rateLimiters = {
  /** CORS Proxy: 60 requests per minute per IP */
  corsProxy: (req) => rateLimit(req, "cors-proxy", 60, "60 s"),
  /** Scapper AI: 10 requests per minute per user */
  scapperAi: (req) => rateLimit(req, "scapper-ai", 10, "60 s"),
  /** Auth/Turnstile: 5 attempts per minute per IP */
  auth: (req) => rateLimit(req, "auth", 5, "60 s"),
}

// api-src/lib/security.ts
var ALLOWED_ORIGINS = /* @__PURE__ */ new Set([
  "https://codescapes.io",
  "https://www.codescapes.io",
  "https://staging.codescapes.io",
  "http://localhost:5173",
  "http://localhost:3000",
])
function isAllowedOrigin(rawOrigin, allowNullOrigin = false) {
  const origin = (rawOrigin || "").trim()
  if (origin === "") {
    return allowNullOrigin
  }
  if (origin === "null") {
    return allowNullOrigin
  }
  let candidate = origin
  try {
    candidate = new URL(origin).origin
  } catch {}
  return ALLOWED_ORIGINS.has(candidate)
}

// api-src/scapper-proxy.ts
function isNewUserPrompt(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return false
  const last = messages[messages.length - 1]
  if (!last || typeof last !== "object") return false
  return last.role === "user"
}
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }
  const origin = req.headers.origin || req.headers.referer || ""
  if (!isAllowedOrigin(origin)) {
    console.warn(`Scapper Proxy blocked: unauthorized origin ${origin}`)
    return res.status(403).json({ error: "Unauthorized origin" })
  }
  try {
    const { success, limit, remaining, reset } = await rateLimiters.scapperAi(req)
    res.setHeader("X-RateLimit-Limit", limit.toString())
    res.setHeader("X-RateLimit-Remaining", remaining.toString())
    res.setHeader("X-RateLimit-Reset", reset.toString())
    if (!success) {
      return res.status(429).json({
        error: "Too many requests",
        message: "AI rate limit exceeded. Please wait before sending more prompts.",
        retryAfter: Math.ceil((reset - Date.now()) / 1e3),
      })
    }
  } catch (err) {
    console.error("Rate limiting error:", err)
  }
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization header" })
    }
    const accessToken = authHeader.replace("Bearer ", "")
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase config missing")
      return res.status(500).json({ error: "Server configuration error" })
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" })
    }
    const body = req.body
    const groqBody = { ...body }
    delete groqBody.promptType
    if (isNewUserPrompt(groqBody.messages)) {
      const { data: quotaResult, error: quotaError } = await supabase.rpc(
        "check_and_increment_quota"
      )
      if (quotaError) {
        console.error("Quota check error:", quotaError)
        return res.status(500).json({ error: "Failed to check quota" })
      }
      if (!quotaResult.allowed) {
        return res.status(429).json({
          error: "quota_exceeded",
          message: quotaResult.message || "Daily prompt limit reached",
          prompts_used: quotaResult.prompts_used,
          prompts_limit: quotaResult.prompts_limit,
          tier: quotaResult.tier,
        })
      }
    }
    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      console.error("GROQ_API_KEY not configured")
      return res.status(500).json({ error: "AI service not configured" })
    }
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(groqBody),
    })
    if (body.stream && groqResponse.body) {
      res.setHeader("Content-Type", "text/event-stream")
      res.setHeader("Cache-Control", "no-cache")
      res.setHeader("Connection", "keep-alive")
      const reader = groqResponse.body.getReader()
      const decoder = new TextDecoder()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          res.write(chunk)
        }
        res.end()
      } catch (streamError) {
        console.error("Stream error:", streamError)
        res.end()
      }
      return
    }
    const groqData = await groqResponse.json()
    return res.status(groqResponse.status).json(groqData)
  } catch (error) {
    console.error("Scapper proxy error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
export { handler as default, isNewUserPrompt }
