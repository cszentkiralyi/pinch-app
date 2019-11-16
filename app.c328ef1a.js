// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../node_modules/mithril/render/vnode.js":[function(require,module,exports) {
"use strict"

function Vnode(tag, key, attrs, children, text, dom) {
	return {tag: tag, key: key, attrs: attrs, children: children, text: text, dom: dom, domSize: undefined, state: undefined, events: undefined, instance: undefined}
}
Vnode.normalize = function(node) {
	if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
	if (node == null || typeof node === "boolean") return null
	if (typeof node === "object") return node
	return Vnode("#", undefined, undefined, String(node), undefined, undefined)
}
Vnode.normalizeChildren = function(input) {
	var children = []
	if (input.length) {
		var isKeyed = input[0] != null && input[0].key != null
		// Note: this is a *very* perf-sensitive check.
		// Fun fact: merging the loop like this is somehow faster than splitting
		// it, noticeably so.
		for (var i = 1; i < input.length; i++) {
			if ((input[i] != null && input[i].key != null) !== isKeyed) {
				throw new TypeError("Vnodes must either always have keys or never have keys!")
			}
		}
		for (var i = 0; i < input.length; i++) {
			children[i] = Vnode.normalize(input[i])
		}
	}
	return children
}

module.exports = Vnode

},{}],"../node_modules/mithril/render/hyperscriptVnode.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")

// Call via `hyperscriptVnode.apply(startOffset, arguments)`
//
// The reason I do it this way, forwarding the arguments and passing the start
// offset in `this`, is so I don't have to create a temporary array in a
// performance-critical path.
//
// In native ES6, I'd instead add a final `...args` parameter to the
// `hyperscript` and `fragment` factories and define this as
// `hyperscriptVnode(...args)`, since modern engines do optimize that away. But
// ES5 (what Mithril requires thanks to IE support) doesn't give me that luxury,
// and engines aren't nearly intelligent enough to do either of these:
//
// 1. Elide the allocation for `[].slice.call(arguments, 1)` when it's passed to
//    another function only to be indexed.
// 2. Elide an `arguments` allocation when it's passed to any function other
//    than `Function.prototype.apply` or `Reflect.apply`.
//
// In ES6, it'd probably look closer to this (I'd need to profile it, though):
// module.exports = function(attrs, ...children) {
//     if (attrs == null || typeof attrs === "object" && attrs.tag == null && !Array.isArray(attrs)) {
//         if (children.length === 1 && Array.isArray(children[0])) children = children[0]
//     } else {
//         children = children.length === 0 && Array.isArray(attrs) ? attrs : [attrs, ...children]
//         attrs = undefined
//     }
//
//     if (attrs == null) attrs = {}
//     return Vnode("", attrs.key, attrs, children)
// }
module.exports = function() {
	var attrs = arguments[this], start = this + 1, children

	if (attrs == null) {
		attrs = {}
	} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
		attrs = {}
		start = this
	}

	if (arguments.length === start + 1) {
		children = arguments[start]
		if (!Array.isArray(children)) children = [children]
	} else {
		children = []
		while (start < arguments.length) children.push(arguments[start++])
	}

	return Vnode("", attrs.key, attrs, children)
}

},{"../render/vnode":"../node_modules/mithril/render/vnode.js"}],"../node_modules/mithril/render/hyperscript.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")
var hyperscriptVnode = require("./hyperscriptVnode")

var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g
var selectorCache = {}
var hasOwn = {}.hasOwnProperty

function isEmpty(object) {
	for (var key in object) if (hasOwn.call(object, key)) return false
	return true
}

function compileSelector(selector) {
	var match, tag = "div", classes = [], attrs = {}
	while (match = selectorParser.exec(selector)) {
		var type = match[1], value = match[2]
		if (type === "" && value !== "") tag = value
		else if (type === "#") attrs.id = value
		else if (type === ".") classes.push(value)
		else if (match[3][0] === "[") {
			var attrValue = match[6]
			if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\")
			if (match[4] === "class") classes.push(attrValue)
			else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true
		}
	}
	if (classes.length > 0) attrs.className = classes.join(" ")
	return selectorCache[selector] = {tag: tag, attrs: attrs}
}

function execSelector(state, vnode) {
	var attrs = vnode.attrs
	var children = Vnode.normalizeChildren(vnode.children)
	var hasClass = hasOwn.call(attrs, "class")
	var className = hasClass ? attrs.class : attrs.className

	vnode.tag = state.tag
	vnode.attrs = null
	vnode.children = undefined

	if (!isEmpty(state.attrs) && !isEmpty(attrs)) {
		var newAttrs = {}

		for (var key in attrs) {
			if (hasOwn.call(attrs, key)) newAttrs[key] = attrs[key]
		}

		attrs = newAttrs
	}

	for (var key in state.attrs) {
		if (hasOwn.call(state.attrs, key) && key !== "className" && !hasOwn.call(attrs, key)){
			attrs[key] = state.attrs[key]
		}
	}
	if (className != null || state.attrs.className != null) attrs.className =
		className != null
			? state.attrs.className != null
				? String(state.attrs.className) + " " + String(className)
				: className
			: state.attrs.className != null
				? state.attrs.className
				: null

	if (hasClass) attrs.class = null

	for (var key in attrs) {
		if (hasOwn.call(attrs, key) && key !== "key") {
			vnode.attrs = attrs
			break
		}
	}

	if (Array.isArray(children) && children.length === 1 && children[0] != null && children[0].tag === "#") {
		vnode.text = children[0].children
	} else {
		vnode.children = children
	}

	return vnode
}

function hyperscript(selector) {
	if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
		throw Error("The selector must be either a string or a component.");
	}

	var vnode = hyperscriptVnode.apply(1, arguments)

	if (typeof selector === "string") {
		vnode.children = Vnode.normalizeChildren(vnode.children)
		if (selector !== "[") return execSelector(selectorCache[selector] || compileSelector(selector), vnode)
	}

	vnode.tag = selector
	return vnode
}

module.exports = hyperscript

},{"../render/vnode":"../node_modules/mithril/render/vnode.js","./hyperscriptVnode":"../node_modules/mithril/render/hyperscriptVnode.js"}],"../node_modules/mithril/render/trust.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")

module.exports = function(html) {
	if (html == null) html = ""
	return Vnode("<", undefined, undefined, html, undefined, undefined)
}

},{"../render/vnode":"../node_modules/mithril/render/vnode.js"}],"../node_modules/mithril/render/fragment.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")
var hyperscriptVnode = require("./hyperscriptVnode")

module.exports = function() {
	var vnode = hyperscriptVnode.apply(0, arguments)

	vnode.tag = "["
	vnode.children = Vnode.normalizeChildren(vnode.children)
	return vnode
}

},{"../render/vnode":"../node_modules/mithril/render/vnode.js","./hyperscriptVnode":"../node_modules/mithril/render/hyperscriptVnode.js"}],"../node_modules/mithril/hyperscript.js":[function(require,module,exports) {
"use strict"

var hyperscript = require("./render/hyperscript")

hyperscript.trust = require("./render/trust")
hyperscript.fragment = require("./render/fragment")

module.exports = hyperscript

},{"./render/hyperscript":"../node_modules/mithril/render/hyperscript.js","./render/trust":"../node_modules/mithril/render/trust.js","./render/fragment":"../node_modules/mithril/render/fragment.js"}],"../node_modules/mithril/promise/polyfill.js":[function(require,module,exports) {
"use strict"
/** @constructor */
var PromisePolyfill = function(executor) {
	if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with `new`")
	if (typeof executor !== "function") throw new TypeError("executor must be a function")

	var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false)
	var instance = self._instance = {resolvers: resolvers, rejectors: rejectors}
	var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout
	function handler(list, shouldAbsorb) {
		return function execute(value) {
			var then
			try {
				if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
					if (value === self) throw new TypeError("Promise can't be resolved w/ itself")
					executeOnce(then.bind(value))
				}
				else {
					callAsync(function() {
						if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value)
						for (var i = 0; i < list.length; i++) list[i](value)
						resolvers.length = 0, rejectors.length = 0
						instance.state = shouldAbsorb
						instance.retry = function() {execute(value)}
					})
				}
			}
			catch (e) {
				rejectCurrent(e)
			}
		}
	}
	function executeOnce(then) {
		var runs = 0
		function run(fn) {
			return function(value) {
				if (runs++ > 0) return
				fn(value)
			}
		}
		var onerror = run(rejectCurrent)
		try {then(run(resolveCurrent), onerror)} catch (e) {onerror(e)}
	}

	executeOnce(executor)
}
PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
	var self = this, instance = self._instance
	function handle(callback, list, next, state) {
		list.push(function(value) {
			if (typeof callback !== "function") next(value)
			else try {resolveNext(callback(value))} catch (e) {if (rejectNext) rejectNext(e)}
		})
		if (typeof instance.retry === "function" && state === instance.state) instance.retry()
	}
	var resolveNext, rejectNext
	var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject})
	handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false)
	return promise
}
PromisePolyfill.prototype.catch = function(onRejection) {
	return this.then(null, onRejection)
}
PromisePolyfill.prototype.finally = function(callback) {
	return this.then(
		function(value) {
			return PromisePolyfill.resolve(callback()).then(function() {
				return value
			})
		},
		function(reason) {
			return PromisePolyfill.resolve(callback()).then(function() {
				return PromisePolyfill.reject(reason);
			})
		}
	)
}
PromisePolyfill.resolve = function(value) {
	if (value instanceof PromisePolyfill) return value
	return new PromisePolyfill(function(resolve) {resolve(value)})
}
PromisePolyfill.reject = function(value) {
	return new PromisePolyfill(function(resolve, reject) {reject(value)})
}
PromisePolyfill.all = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		var total = list.length, count = 0, values = []
		if (list.length === 0) resolve([])
		else for (var i = 0; i < list.length; i++) {
			(function(i) {
				function consume(value) {
					count++
					values[i] = value
					if (count === total) resolve(values)
				}
				if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
					list[i].then(consume, reject)
				}
				else consume(list[i])
			})(i)
		}
	})
}
PromisePolyfill.race = function(list) {
	return new PromisePolyfill(function(resolve, reject) {
		for (var i = 0; i < list.length; i++) {
			list[i].then(resolve, reject)
		}
	})
}

module.exports = PromisePolyfill

},{}],"../node_modules/mithril/promise/promise.js":[function(require,module,exports) {
var global = arguments[3];
"use strict"

var PromisePolyfill = require("./polyfill")

if (typeof window !== "undefined") {
	if (typeof window.Promise === "undefined") {
		window.Promise = PromisePolyfill
	} else if (!window.Promise.prototype.finally) {
		window.Promise.prototype.finally = PromisePolyfill.prototype.finally
	}
	module.exports = window.Promise
} else if (typeof global !== "undefined") {
	if (typeof global.Promise === "undefined") {
		global.Promise = PromisePolyfill
	} else if (!global.Promise.prototype.finally) {
		global.Promise.prototype.finally = PromisePolyfill.prototype.finally
	}
	module.exports = global.Promise
} else {
	module.exports = PromisePolyfill
}

},{"./polyfill":"../node_modules/mithril/promise/polyfill.js"}],"../node_modules/mithril/render/render.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")

module.exports = function($window) {
	var $doc = $window && $window.document
	var currentRedraw

	var nameSpace = {
		svg: "http://www.w3.org/2000/svg",
		math: "http://www.w3.org/1998/Math/MathML"
	}

	function getNameSpace(vnode) {
		return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag]
	}

	//sanity check to discourage people from doing `vnode.state = ...`
	function checkState(vnode, original) {
		if (vnode.state !== original) throw new Error("`vnode.state` must not be modified")
	}

	//Note: the hook is passed as the `this` argument to allow proxying the
	//arguments without requiring a full array allocation to do so. It also
	//takes advantage of the fact the current `vnode` is the first argument in
	//all lifecycle methods.
	function callHook(vnode) {
		var original = vnode.state
		try {
			return this.apply(original, arguments)
		} finally {
			checkState(vnode, original)
		}
	}

	// IE11 (at least) throws an UnspecifiedError when accessing document.activeElement when
	// inside an iframe. Catch and swallow this error, and heavy-handidly return null.
	function activeElement() {
		try {
			return $doc.activeElement
		} catch (e) {
			return null
		}
	}
	//create
	function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) {
				createNode(parent, vnode, hooks, ns, nextSibling)
			}
		}
	}
	function createNode(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		if (typeof tag === "string") {
			vnode.state = {}
			if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
			switch (tag) {
				case "#": createText(parent, vnode, nextSibling); break
				case "<": createHTML(parent, vnode, ns, nextSibling); break
				case "[": createFragment(parent, vnode, hooks, ns, nextSibling); break
				default: createElement(parent, vnode, hooks, ns, nextSibling)
			}
		}
		else createComponent(parent, vnode, hooks, ns, nextSibling)
	}
	function createText(parent, vnode, nextSibling) {
		vnode.dom = $doc.createTextNode(vnode.children)
		insertNode(parent, vnode.dom, nextSibling)
	}
	var possibleParents = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"}
	function createHTML(parent, vnode, ns, nextSibling) {
		var match = vnode.children.match(/^\s*?<(\w+)/im) || []
		// not using the proper parent makes the child element(s) vanish.
		//     var div = document.createElement("div")
		//     div.innerHTML = "<td>i</td><td>j</td>"
		//     console.log(div.innerHTML)
		// --> "ij", no <td> in sight.
		var temp = $doc.createElement(possibleParents[match[1]] || "div")
		if (ns === "http://www.w3.org/2000/svg") {
			temp.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\">" + vnode.children + "</svg>"
			temp = temp.firstChild
		} else {
			temp.innerHTML = vnode.children
		}
		vnode.dom = temp.firstChild
		vnode.domSize = temp.childNodes.length
		// Capture nodes to remove, so we don't confuse them.
		vnode.instance = []
		var fragment = $doc.createDocumentFragment()
		var child
		while (child = temp.firstChild) {
			vnode.instance.push(child)
			fragment.appendChild(child)
		}
		insertNode(parent, fragment, nextSibling)
	}
	function createFragment(parent, vnode, hooks, ns, nextSibling) {
		var fragment = $doc.createDocumentFragment()
		if (vnode.children != null) {
			var children = vnode.children
			createNodes(fragment, children, 0, children.length, hooks, null, ns)
		}
		vnode.dom = fragment.firstChild
		vnode.domSize = fragment.childNodes.length
		insertNode(parent, fragment, nextSibling)
	}
	function createElement(parent, vnode, hooks, ns, nextSibling) {
		var tag = vnode.tag
		var attrs = vnode.attrs
		var is = attrs && attrs.is

		ns = getNameSpace(vnode) || ns

		var element = ns ?
			is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
			is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag)
		vnode.dom = element

		if (attrs != null) {
			setAttrs(vnode, attrs, ns)
		}

		insertNode(parent, element, nextSibling)

		if (!maybeSetContentEditable(vnode)) {
			if (vnode.text != null) {
				if (vnode.text !== "") element.textContent = vnode.text
				else vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
			}
			if (vnode.children != null) {
				var children = vnode.children
				createNodes(element, children, 0, children.length, hooks, null, ns)
				if (vnode.tag === "select" && attrs != null) setLateSelectAttrs(vnode, attrs)
			}
		}
	}
	function initComponent(vnode, hooks) {
		var sentinel
		if (typeof vnode.tag.view === "function") {
			vnode.state = Object.create(vnode.tag)
			sentinel = vnode.state.view
			if (sentinel.$$reentrantLock$$ != null) return
			sentinel.$$reentrantLock$$ = true
		} else {
			vnode.state = void 0
			sentinel = vnode.tag
			if (sentinel.$$reentrantLock$$ != null) return
			sentinel.$$reentrantLock$$ = true
			vnode.state = (vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function") ? new vnode.tag(vnode) : vnode.tag(vnode)
		}
		initLifecycle(vnode.state, vnode, hooks)
		if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
		vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode))
		if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
		sentinel.$$reentrantLock$$ = null
	}
	function createComponent(parent, vnode, hooks, ns, nextSibling) {
		initComponent(vnode, hooks)
		if (vnode.instance != null) {
			createNode(parent, vnode.instance, hooks, ns, nextSibling)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0
		}
		else {
			vnode.domSize = 0
		}
	}

	//update
	/**
	 * @param {Element|Fragment} parent - the parent element
	 * @param {Vnode[] | null} old - the list of vnodes of the last `render()` call for
	 *                               this part of the tree
	 * @param {Vnode[] | null} vnodes - as above, but for the current `render()` call.
	 * @param {Function[]} hooks - an accumulator of post-render hooks (oncreate/onupdate)
	 * @param {Element | null} nextSibling - the next DOM node if we're dealing with a
	 *                                       fragment that is not the last item in its
	 *                                       parent
	 * @param {'svg' | 'math' | String | null} ns) - the current XML namespace, if any
	 * @returns void
	 */
	// This function diffs and patches lists of vnodes, both keyed and unkeyed.
	//
	// We will:
	//
	// 1. describe its general structure
	// 2. focus on the diff algorithm optimizations
	// 3. discuss DOM node operations.

	// ## Overview:
	//
	// The updateNodes() function:
	// - deals with trivial cases
	// - determines whether the lists are keyed or unkeyed based on the first non-null node
	//   of each list.
	// - diffs them and patches the DOM if needed (that's the brunt of the code)
	// - manages the leftovers: after diffing, are there:
	//   - old nodes left to remove?
	// 	 - new nodes to insert?
	// 	 deal with them!
	//
	// The lists are only iterated over once, with an exception for the nodes in `old` that
	// are visited in the fourth part of the diff and in the `removeNodes` loop.

	// ## Diffing
	//
	// Reading https://github.com/localvoid/ivi/blob/ddc09d06abaef45248e6133f7040d00d3c6be853/packages/ivi/src/vdom/implementation.ts#L617-L837
	// may be good for context on longest increasing subsequence-based logic for moving nodes.
	//
	// In order to diff keyed lists, one has to
	//
	// 1) match nodes in both lists, per key, and update them accordingly
	// 2) create the nodes present in the new list, but absent in the old one
	// 3) remove the nodes present in the old list, but absent in the new one
	// 4) figure out what nodes in 1) to move in order to minimize the DOM operations.
	//
	// To achieve 1) one can create a dictionary of keys => index (for the old list), then iterate
	// over the new list and for each new vnode, find the corresponding vnode in the old list using
	// the map.
	// 2) is achieved in the same step: if a new node has no corresponding entry in the map, it is new
	// and must be created.
	// For the removals, we actually remove the nodes that have been updated from the old list.
	// The nodes that remain in that list after 1) and 2) have been performed can be safely removed.
	// The fourth step is a bit more complex and relies on the longest increasing subsequence (LIS)
	// algorithm.
	//
	// the longest increasing subsequence is the list of nodes that can remain in place. Imagine going
	// from `1,2,3,4,5` to `4,5,1,2,3` where the numbers are not necessarily the keys, but the indices
	// corresponding to the keyed nodes in the old list (keyed nodes `e,d,c,b,a` => `b,a,e,d,c` would
	//  match the above lists, for example).
	//
	// In there are two increasing subsequences: `4,5` and `1,2,3`, the latter being the longest. We
	// can update those nodes without moving them, and only call `insertNode` on `4` and `5`.
	//
	// @localvoid adapted the algo to also support node deletions and insertions (the `lis` is actually
	// the longest increasing subsequence *of old nodes still present in the new list*).
	//
	// It is a general algorithm that is fireproof in all circumstances, but it requires the allocation
	// and the construction of a `key => oldIndex` map, and three arrays (one with `newIndex => oldIndex`,
	// the `LIS` and a temporary one to create the LIS).
	//
	// So we cheat where we can: if the tails of the lists are identical, they are guaranteed to be part of
	// the LIS and can be updated without moving them.
	//
	// If two nodes are swapped, they are guaranteed not to be part of the LIS, and must be moved (with
	// the exception of the last node if the list is fully reversed).
	//
	// ## Finding the next sibling.
	//
	// `updateNode()` and `createNode()` expect a nextSibling parameter to perform DOM operations.
	// When the list is being traversed top-down, at any index, the DOM nodes up to the previous
	// vnode reflect the content of the new list, whereas the rest of the DOM nodes reflect the old
	// list. The next sibling must be looked for in the old list using `getNextSibling(... oldStart + 1 ...)`.
	//
	// In the other scenarios (swaps, upwards traversal, map-based diff),
	// the new vnodes list is traversed upwards. The DOM nodes at the bottom of the list reflect the
	// bottom part of the new vnodes list, and we can use the `v.dom`  value of the previous node
	// as the next sibling (cached in the `nextSibling` variable).


	// ## DOM node moves
	//
	// In most scenarios `updateNode()` and `createNode()` perform the DOM operations. However,
	// this is not the case if the node moved (second and fourth part of the diff algo). We move
	// the old DOM nodes before updateNode runs because it enables us to use the cached `nextSibling`
	// variable rather than fetching it using `getNextSibling()`.
	//
	// The fourth part of the diff currently inserts nodes unconditionally, leading to issues
	// like #1791 and #1999. We need to be smarter about those situations where adjascent old
	// nodes remain together in the new list in a way that isn't covered by parts one and
	// three of the diff algo.

	function updateNodes(parent, old, vnodes, hooks, nextSibling, ns) {
		if (old === vnodes || old == null && vnodes == null) return
		else if (old == null || old.length === 0) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns)
		else if (vnodes == null || vnodes.length === 0) removeNodes(parent, old, 0, old.length)
		else {
			var isOldKeyed = old[0] != null && old[0].key != null
			var isKeyed = vnodes[0] != null && vnodes[0].key != null
			var start = 0, oldStart = 0
			if (!isOldKeyed) while (oldStart < old.length && old[oldStart] == null) oldStart++
			if (!isKeyed) while (start < vnodes.length && vnodes[start] == null) start++
			if (isKeyed === null && isOldKeyed == null) return // both lists are full of nulls
			if (isOldKeyed !== isKeyed) {
				removeNodes(parent, old, oldStart, old.length)
				createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
			} else if (!isKeyed) {
				// Don't index past the end of either list (causes deopts).
				var commonLength = old.length < vnodes.length ? old.length : vnodes.length
				// Rewind if necessary to the first non-null index on either side.
				// We could alternatively either explicitly create or remove nodes when `start !== oldStart`
				// but that would be optimizing for sparse lists which are more rare than dense ones.
				start = start < oldStart ? start : oldStart
				for (; start < commonLength; start++) {
					o = old[start]
					v = vnodes[start]
					if (o === v || o == null && v == null) continue
					else if (o == null) createNode(parent, v, hooks, ns, getNextSibling(old, start + 1, nextSibling))
					else if (v == null) removeNode(parent, o)
					else updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, nextSibling), ns)
				}
				if (old.length > commonLength) removeNodes(parent, old, start, old.length)
				if (vnodes.length > commonLength) createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
			} else {
				// keyed diff
				var oldEnd = old.length - 1, end = vnodes.length - 1, map, o, v, oe, ve, topSibling

				// bottom-up
				while (oldEnd >= oldStart && end >= start) {
					oe = old[oldEnd]
					ve = vnodes[end]
					if (oe.key !== ve.key) break
					if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldEnd--, end--
				}
				// top-down
				while (oldEnd >= oldStart && end >= start) {
					o = old[oldStart]
					v = vnodes[start]
					if (o.key !== v.key) break
					oldStart++, start++
					if (o !== v) updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), ns)
				}
				// swaps and list reversals
				while (oldEnd >= oldStart && end >= start) {
					if (start === end) break
					if (o.key !== ve.key || oe.key !== v.key) break
					topSibling = getNextSibling(old, oldStart, nextSibling)
					moveNodes(parent, oe, topSibling)
					if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns)
					if (++start <= --end) moveNodes(parent, o, nextSibling)
					if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldStart++; oldEnd--
					oe = old[oldEnd]
					ve = vnodes[end]
					o = old[oldStart]
					v = vnodes[start]
				}
				// bottom up once again
				while (oldEnd >= oldStart && end >= start) {
					if (oe.key !== ve.key) break
					if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					oldEnd--, end--
					oe = old[oldEnd]
					ve = vnodes[end]
				}
				if (start > end) removeNodes(parent, old, oldStart, oldEnd + 1)
				else if (oldStart > oldEnd) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
				else {
					// inspired by ivi https://github.com/ivijs/ivi/ by Boris Kaul
					var originalNextSibling = nextSibling, vnodesLength = end - start + 1, oldIndices = new Array(vnodesLength), li=0, i=0, pos = 2147483647, matched = 0, map, lisIndices
					for (i = 0; i < vnodesLength; i++) oldIndices[i] = -1
					for (i = end; i >= start; i--) {
						if (map == null) map = getKeyMap(old, oldStart, oldEnd + 1)
						ve = vnodes[i]
						var oldIndex = map[ve.key]
						if (oldIndex != null) {
							pos = (oldIndex < pos) ? oldIndex : -1 // becomes -1 if nodes were re-ordered
							oldIndices[i-start] = oldIndex
							oe = old[oldIndex]
							old[oldIndex] = null
							if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
							if (ve.dom != null) nextSibling = ve.dom
							matched++
						}
					}
					nextSibling = originalNextSibling
					if (matched !== oldEnd - oldStart + 1) removeNodes(parent, old, oldStart, oldEnd + 1)
					if (matched === 0) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
					else {
						if (pos === -1) {
							// the indices of the indices of the items that are part of the
							// longest increasing subsequence in the oldIndices list
							lisIndices = makeLisIndices(oldIndices)
							li = lisIndices.length - 1
							for (i = end; i >= start; i--) {
								v = vnodes[i]
								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
								else {
									if (lisIndices[li] === i - start) li--
									else moveNodes(parent, v, nextSibling)
								}
								if (v.dom != null) nextSibling = vnodes[i].dom
							}
						} else {
							for (i = end; i >= start; i--) {
								v = vnodes[i]
								if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
								if (v.dom != null) nextSibling = vnodes[i].dom
							}
						}
					}
				}
			}
		}
	}
	function updateNode(parent, old, vnode, hooks, nextSibling, ns) {
		var oldTag = old.tag, tag = vnode.tag
		if (oldTag === tag) {
			vnode.state = old.state
			vnode.events = old.events
			if (shouldNotUpdate(vnode, old)) return
			if (typeof oldTag === "string") {
				if (vnode.attrs != null) {
					updateLifecycle(vnode.attrs, vnode, hooks)
				}
				switch (oldTag) {
					case "#": updateText(old, vnode); break
					case "<": updateHTML(parent, old, vnode, ns, nextSibling); break
					case "[": updateFragment(parent, old, vnode, hooks, nextSibling, ns); break
					default: updateElement(old, vnode, hooks, ns)
				}
			}
			else updateComponent(parent, old, vnode, hooks, nextSibling, ns)
		}
		else {
			removeNode(parent, old)
			createNode(parent, vnode, hooks, ns, nextSibling)
		}
	}
	function updateText(old, vnode) {
		if (old.children.toString() !== vnode.children.toString()) {
			old.dom.nodeValue = vnode.children
		}
		vnode.dom = old.dom
	}
	function updateHTML(parent, old, vnode, ns, nextSibling) {
		if (old.children !== vnode.children) {
			removeHTML(parent, old)
			createHTML(parent, vnode, ns, nextSibling)
		}
		else {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
			vnode.instance = old.instance
		}
	}
	function updateFragment(parent, old, vnode, hooks, nextSibling, ns) {
		updateNodes(parent, old.children, vnode.children, hooks, nextSibling, ns)
		var domSize = 0, children = vnode.children
		vnode.dom = null
		if (children != null) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i]
				if (child != null && child.dom != null) {
					if (vnode.dom == null) vnode.dom = child.dom
					domSize += child.domSize || 1
				}
			}
			if (domSize !== 1) vnode.domSize = domSize
		}
	}
	function updateElement(old, vnode, hooks, ns) {
		var element = vnode.dom = old.dom
		ns = getNameSpace(vnode) || ns

		if (vnode.tag === "textarea") {
			if (vnode.attrs == null) vnode.attrs = {}
			if (vnode.text != null) {
				vnode.attrs.value = vnode.text //FIXME handle multiple children
				vnode.text = undefined
			}
		}
		updateAttrs(vnode, old.attrs, vnode.attrs, ns)
		if (!maybeSetContentEditable(vnode)) {
			if (old.text != null && vnode.text != null && vnode.text !== "") {
				if (old.text.toString() !== vnode.text.toString()) old.dom.firstChild.nodeValue = vnode.text
			}
			else {
				if (old.text != null) old.children = [Vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)]
				if (vnode.text != null) vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
				updateNodes(element, old.children, vnode.children, hooks, null, ns)
			}
		}
	}
	function updateComponent(parent, old, vnode, hooks, nextSibling, ns) {
		vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode))
		if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
		updateLifecycle(vnode.state, vnode, hooks)
		if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks)
		if (vnode.instance != null) {
			if (old.instance == null) createNode(parent, vnode.instance, hooks, ns, nextSibling)
			else updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, ns)
			vnode.dom = vnode.instance.dom
			vnode.domSize = vnode.instance.domSize
		}
		else if (old.instance != null) {
			removeNode(parent, old.instance)
			vnode.dom = undefined
			vnode.domSize = 0
		}
		else {
			vnode.dom = old.dom
			vnode.domSize = old.domSize
		}
	}
	function getKeyMap(vnodes, start, end) {
		var map = Object.create(null)
		for (; start < end; start++) {
			var vnode = vnodes[start]
			if (vnode != null) {
				var key = vnode.key
				if (key != null) map[key] = start
			}
		}
		return map
	}
	// Lifted from ivi https://github.com/ivijs/ivi/
	// takes a list of unique numbers (-1 is special and can
	// occur multiple times) and returns an array with the indices
	// of the items that are part of the longest increasing
	// subsequece
	var lisTemp = []
	function makeLisIndices(a) {
		var result = [0]
		var u = 0, v = 0, i = 0
		var il = lisTemp.length = a.length
		for (var i = 0; i < il; i++) lisTemp[i] = a[i]
		for (var i = 0; i < il; ++i) {
			if (a[i] === -1) continue
			var j = result[result.length - 1]
			if (a[j] < a[i]) {
				lisTemp[i] = j
				result.push(i)
				continue
			}
			u = 0
			v = result.length - 1
			while (u < v) {
				// Fast integer average without overflow.
				// eslint-disable-next-line no-bitwise
				var c = (u >>> 1) + (v >>> 1) + (u & v & 1)
				if (a[result[c]] < a[i]) {
					u = c + 1
				}
				else {
					v = c
				}
			}
			if (a[i] < a[result[u]]) {
				if (u > 0) lisTemp[i] = result[u - 1]
				result[u] = i
			}
		}
		u = result.length
		v = result[u - 1]
		while (u-- > 0) {
			result[u] = v
			v = lisTemp[v]
		}
		lisTemp.length = 0
		return result
	}

	function getNextSibling(vnodes, i, nextSibling) {
		for (; i < vnodes.length; i++) {
			if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
		}
		return nextSibling
	}

	// This covers a really specific edge case:
	// - Parent node is keyed and contains child
	// - Child is removed, returns unresolved promise in `onbeforeremove`
	// - Parent node is moved in keyed diff
	// - Remaining children still need moved appropriately
	//
	// Ideally, I'd track removed nodes as well, but that introduces a lot more
	// complexity and I'm not exactly interested in doing that.
	function moveNodes(parent, vnode, nextSibling) {
		var frag = $doc.createDocumentFragment()
		moveChildToFrag(parent, frag, vnode)
		insertNode(parent, frag, nextSibling)
	}
	function moveChildToFrag(parent, frag, vnode) {
		// Dodge the recursion overhead in a few of the most common cases.
		while (vnode.dom != null && vnode.dom.parentNode === parent) {
			if (typeof vnode.tag !== "string") {
				vnode = vnode.instance
				if (vnode != null) continue
			} else if (vnode.tag === "<") {
				for (var i = 0; i < vnode.instance.length; i++) {
					frag.appendChild(vnode.instance[i])
				}
			} else if (vnode.tag !== "[") {
				// Don't recurse for text nodes *or* elements, just fragments
				frag.appendChild(vnode.dom)
			} else if (vnode.children.length === 1) {
				vnode = vnode.children[0]
				if (vnode != null) continue
			} else {
				for (var i = 0; i < vnode.children.length; i++) {
					var child = vnode.children[i]
					if (child != null) moveChildToFrag(parent, frag, child)
				}
			}
			break
		}
	}

	function insertNode(parent, dom, nextSibling) {
		if (nextSibling != null) parent.insertBefore(dom, nextSibling)
		else parent.appendChild(dom)
	}

	function maybeSetContentEditable(vnode) {
		if (vnode.attrs == null || (
			vnode.attrs.contenteditable == null && // attribute
			vnode.attrs.contentEditable == null // property
		)) return false
		var children = vnode.children
		if (children != null && children.length === 1 && children[0].tag === "<") {
			var content = children[0].children
			if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content
		}
		else if (vnode.text != null || children != null && children.length !== 0) throw new Error("Child node of a contenteditable must be trusted")
		return true
	}

	//remove
	function removeNodes(parent, vnodes, start, end) {
		for (var i = start; i < end; i++) {
			var vnode = vnodes[i]
			if (vnode != null) removeNode(parent, vnode)
		}
	}
	function removeNode(parent, vnode) {
		var mask = 0
		var original = vnode.state
		var stateResult, attrsResult
		if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeremove === "function") {
			var result = callHook.call(vnode.state.onbeforeremove, vnode)
			if (result != null && typeof result.then === "function") {
				mask = 1
				stateResult = result
			}
		}
		if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
			var result = callHook.call(vnode.attrs.onbeforeremove, vnode)
			if (result != null && typeof result.then === "function") {
				// eslint-disable-next-line no-bitwise
				mask |= 2
				attrsResult = result
			}
		}
		checkState(vnode, original)

		// If we can, try to fast-path it and avoid all the overhead of awaiting
		if (!mask) {
			onremove(vnode)
			removeChild(parent, vnode)
		} else {
			if (stateResult != null) {
				var next = function () {
					// eslint-disable-next-line no-bitwise
					if (mask & 1) { mask &= 2; if (!mask) reallyRemove() }
				}
				stateResult.then(next, next)
			}
			if (attrsResult != null) {
				var next = function () {
					// eslint-disable-next-line no-bitwise
					if (mask & 2) { mask &= 1; if (!mask) reallyRemove() }
				}
				attrsResult.then(next, next)
			}
		}

		function reallyRemove() {
			checkState(vnode, original)
			onremove(vnode)
			removeChild(parent, vnode)
		}
	}
	function removeHTML(parent, vnode) {
		for (var i = 0; i < vnode.instance.length; i++) {
			parent.removeChild(vnode.instance[i])
		}
	}
	function removeChild(parent, vnode) {
		// Dodge the recursion overhead in a few of the most common cases.
		while (vnode.dom != null && vnode.dom.parentNode === parent) {
			if (typeof vnode.tag !== "string") {
				vnode = vnode.instance
				if (vnode != null) continue
			} else if (vnode.tag === "<") {
				removeHTML(parent, vnode)
			} else {
				if (vnode.tag !== "[") {
					parent.removeChild(vnode.dom)
					if (!Array.isArray(vnode.children)) break
				}
				if (vnode.children.length === 1) {
					vnode = vnode.children[0]
					if (vnode != null) continue
				} else {
					for (var i = 0; i < vnode.children.length; i++) {
						var child = vnode.children[i]
						if (child != null) removeChild(parent, child)
					}
				}
			}
			break
		}
	}
	function onremove(vnode) {
		if (typeof vnode.tag !== "string" && typeof vnode.state.onremove === "function") callHook.call(vnode.state.onremove, vnode)
		if (vnode.attrs && typeof vnode.attrs.onremove === "function") callHook.call(vnode.attrs.onremove, vnode)
		if (typeof vnode.tag !== "string") {
			if (vnode.instance != null) onremove(vnode.instance)
		} else {
			var children = vnode.children
			if (Array.isArray(children)) {
				for (var i = 0; i < children.length; i++) {
					var child = children[i]
					if (child != null) onremove(child)
				}
			}
		}
	}

	//attrs
	function setAttrs(vnode, attrs, ns) {
		for (var key in attrs) {
			setAttr(vnode, key, null, attrs[key], ns)
		}
	}
	function setAttr(vnode, key, old, value, ns) {
		if (key === "key" || key === "is" || value == null || isLifecycleMethod(key) || (old === value && !isFormAttribute(vnode, key)) && typeof value !== "object") return
		if (key[0] === "o" && key[1] === "n") return updateEvent(vnode, key, value)
		if (key.slice(0, 6) === "xlink:") vnode.dom.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value)
		else if (key === "style") updateStyle(vnode.dom, old, value)
		else if (hasPropertyKey(vnode, key, ns)) {
			if (key === "value") {
				// Only do the coercion if we're actually going to check the value.
				/* eslint-disable no-implicit-coercion */
				//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
				if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === "" + value && vnode.dom === activeElement()) return
				//setting select[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "select" && old !== null && vnode.dom.value === "" + value) return
				//setting option[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "option" && old !== null && vnode.dom.value === "" + value) return
				/* eslint-enable no-implicit-coercion */
			}
			// If you assign an input type that is not supported by IE 11 with an assignment expression, an error will occur.
			if (vnode.tag === "input" && key === "type") vnode.dom.setAttribute(key, value)
			else vnode.dom[key] = value
		} else {
			if (typeof value === "boolean") {
				if (value) vnode.dom.setAttribute(key, "")
				else vnode.dom.removeAttribute(key)
			}
			else vnode.dom.setAttribute(key === "className" ? "class" : key, value)
		}
	}
	function removeAttr(vnode, key, old, ns) {
		if (key === "key" || key === "is" || old == null || isLifecycleMethod(key)) return
		if (key[0] === "o" && key[1] === "n" && !isLifecycleMethod(key)) updateEvent(vnode, key, undefined)
		else if (key === "style") updateStyle(vnode.dom, old, null)
		else if (
			hasPropertyKey(vnode, key, ns)
			&& key !== "className"
			&& !(key === "value" && (
				vnode.tag === "option"
				|| vnode.tag === "select" && vnode.dom.selectedIndex === -1 && vnode.dom === activeElement()
			))
			&& !(vnode.tag === "input" && key === "type")
		) {
			vnode.dom[key] = null
		} else {
			var nsLastIndex = key.indexOf(":")
			if (nsLastIndex !== -1) key = key.slice(nsLastIndex + 1)
			if (old !== false) vnode.dom.removeAttribute(key === "className" ? "class" : key)
		}
	}
	function setLateSelectAttrs(vnode, attrs) {
		if ("value" in attrs) {
			if(attrs.value === null) {
				if (vnode.dom.selectedIndex !== -1) vnode.dom.value = null
			} else {
				var normalized = "" + attrs.value // eslint-disable-line no-implicit-coercion
				if (vnode.dom.value !== normalized || vnode.dom.selectedIndex === -1) {
					vnode.dom.value = normalized
				}
			}
		}
		if ("selectedIndex" in attrs) setAttr(vnode, "selectedIndex", null, attrs.selectedIndex, undefined)
	}
	function updateAttrs(vnode, old, attrs, ns) {
		if (attrs != null) {
			for (var key in attrs) {
				setAttr(vnode, key, old && old[key], attrs[key], ns)
			}
		}
		var val
		if (old != null) {
			for (var key in old) {
				if (((val = old[key]) != null) && (attrs == null || attrs[key] == null)) {
					removeAttr(vnode, key, val, ns)
				}
			}
		}
	}
	function isFormAttribute(vnode, attr) {
		return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === activeElement() || vnode.tag === "option" && vnode.dom.parentNode === $doc.activeElement
	}
	function isLifecycleMethod(attr) {
		return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
	}
	function hasPropertyKey(vnode, key, ns) {
		// Filter out namespaced keys
		return ns === undefined && (
			// If it's a custom element, just keep it.
			vnode.tag.indexOf("-") > -1 || vnode.attrs != null && vnode.attrs.is ||
			// If it's a normal element, let's try to avoid a few browser bugs.
			key !== "href" && key !== "list" && key !== "form" && key !== "width" && key !== "height"// && key !== "type"
			// Defer the property check until *after* we check everything.
		) && key in vnode.dom
	}

	//style
	var uppercaseRegex = /[A-Z]/g
	function toLowerCase(capital) { return "-" + capital.toLowerCase() }
	function normalizeKey(key) {
		return key[0] === "-" && key[1] === "-" ? key :
			key === "cssFloat" ? "float" :
				key.replace(uppercaseRegex, toLowerCase)
	}
	function updateStyle(element, old, style) {
		if (old === style) {
			// Styles are equivalent, do nothing.
		} else if (style == null) {
			// New style is missing, just clear it.
			element.style.cssText = ""
		} else if (typeof style !== "object") {
			// New style is a string, let engine deal with patching.
			element.style.cssText = style
		} else if (old == null || typeof old !== "object") {
			// `old` is missing or a string, `style` is an object.
			element.style.cssText = ""
			// Add new style properties
			for (var key in style) {
				var value = style[key]
				if (value != null) element.style.setProperty(normalizeKey(key), String(value))
			}
		} else {
			// Both old & new are (different) objects.
			// Update style properties that have changed
			for (var key in style) {
				var value = style[key]
				if (value != null && (value = String(value)) !== String(old[key])) {
					element.style.setProperty(normalizeKey(key), value)
				}
			}
			// Remove style properties that no longer exist
			for (var key in old) {
				if (old[key] != null && style[key] == null) {
					element.style.removeProperty(normalizeKey(key))
				}
			}
		}
	}

	// Here's an explanation of how this works:
	// 1. The event names are always (by design) prefixed by `on`.
	// 2. The EventListener interface accepts either a function or an object
	//    with a `handleEvent` method.
	// 3. The object does not inherit from `Object.prototype`, to avoid
	//    any potential interference with that (e.g. setters).
	// 4. The event name is remapped to the handler before calling it.
	// 5. In function-based event handlers, `ev.target === this`. We replicate
	//    that below.
	// 6. In function-based event handlers, `return false` prevents the default
	//    action and stops event propagation. We replicate that below.
	function EventDict() {
		// Save this, so the current redraw is correctly tracked.
		this._ = currentRedraw
	}
	EventDict.prototype = Object.create(null)
	EventDict.prototype.handleEvent = function (ev) {
		var handler = this["on" + ev.type]
		var result
		if (typeof handler === "function") result = handler.call(ev.currentTarget, ev)
		else if (typeof handler.handleEvent === "function") handler.handleEvent(ev)
		if (this._ && ev.redraw !== false) (0, this._)()
		if (result === false) {
			ev.preventDefault()
			ev.stopPropagation()
		}
	}

	//event
	function updateEvent(vnode, key, value) {
		if (vnode.events != null) {
			if (vnode.events[key] === value) return
			if (value != null && (typeof value === "function" || typeof value === "object")) {
				if (vnode.events[key] == null) vnode.dom.addEventListener(key.slice(2), vnode.events, false)
				vnode.events[key] = value
			} else {
				if (vnode.events[key] != null) vnode.dom.removeEventListener(key.slice(2), vnode.events, false)
				vnode.events[key] = undefined
			}
		} else if (value != null && (typeof value === "function" || typeof value === "object")) {
			vnode.events = new EventDict()
			vnode.dom.addEventListener(key.slice(2), vnode.events, false)
			vnode.events[key] = value
		}
	}

	//lifecycle
	function initLifecycle(source, vnode, hooks) {
		if (typeof source.oninit === "function") callHook.call(source.oninit, vnode)
		if (typeof source.oncreate === "function") hooks.push(callHook.bind(source.oncreate, vnode))
	}
	function updateLifecycle(source, vnode, hooks) {
		if (typeof source.onupdate === "function") hooks.push(callHook.bind(source.onupdate, vnode))
	}
	function shouldNotUpdate(vnode, old) {
		do {
			if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") {
				var force = callHook.call(vnode.attrs.onbeforeupdate, vnode, old)
				if (force !== undefined && !force) break
			}
			if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeupdate === "function") {
				var force = callHook.call(vnode.state.onbeforeupdate, vnode, old)
				if (force !== undefined && !force) break
			}
			return false
		} while (false); // eslint-disable-line no-constant-condition
		vnode.dom = old.dom
		vnode.domSize = old.domSize
		vnode.instance = old.instance
		// One would think having the actual latest attributes would be ideal,
		// but it doesn't let us properly diff based on our current internal
		// representation. We have to save not only the old DOM info, but also
		// the attributes used to create it, as we diff *that*, not against the
		// DOM directly (with a few exceptions in `setAttr`). And, of course, we
		// need to save the children and text as they are conceptually not
		// unlike special "attributes" internally.
		vnode.attrs = old.attrs
		vnode.children = old.children
		vnode.text = old.text
		return true
	}

	return function(dom, vnodes, redraw) {
		if (!dom) throw new TypeError("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.")
		var hooks = []
		var active = activeElement()
		var namespace = dom.namespaceURI

		// First time rendering into a node clears it out
		if (dom.vnodes == null) dom.textContent = ""

		vnodes = Vnode.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes])
		var prevRedraw = currentRedraw
		try {
			currentRedraw = typeof redraw === "function" ? redraw : undefined
			updateNodes(dom, dom.vnodes, vnodes, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace)
		} finally {
			currentRedraw = prevRedraw
		}
		dom.vnodes = vnodes
		// `document.activeElement` can return null: https://html.spec.whatwg.org/multipage/interaction.html#dom-document-activeelement
		if (active != null && activeElement() !== active && typeof active.focus === "function") active.focus()
		for (var i = 0; i < hooks.length; i++) hooks[i]()
	}
}

},{"../render/vnode":"../node_modules/mithril/render/vnode.js"}],"../node_modules/mithril/render.js":[function(require,module,exports) {
"use strict"

module.exports = require("./render/render")(window)

},{"./render/render":"../node_modules/mithril/render/render.js"}],"../node_modules/mithril/api/mount-redraw.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")

module.exports = function(render, schedule, console) {
	var subscriptions = []
	var rendering = false
	var pending = false

	function sync() {
		if (rendering) throw new Error("Nested m.redraw.sync() call")
		rendering = true
		for (var i = 0; i < subscriptions.length; i += 2) {
			try { render(subscriptions[i], Vnode(subscriptions[i + 1]), redraw) }
			catch (e) { console.error(e) }
		}
		rendering = false
	}

	function redraw() {
		if (!pending) {
			pending = true
			schedule(function() {
				pending = false
				sync()
			})
		}
	}

	redraw.sync = sync

	function mount(root, component) {
		if (component != null && component.view == null && typeof component !== "function") {
			throw new TypeError("m.mount(element, component) expects a component, not a vnode")
		}

		var index = subscriptions.indexOf(root)
		if (index >= 0) {
			subscriptions.splice(index, 2)
			render(root, [], redraw)
		}

		if (component != null) {
			subscriptions.push(root, component)
			render(root, Vnode(component), redraw)
		}
	}

	return {mount: mount, redraw: redraw}
}

},{"../render/vnode":"../node_modules/mithril/render/vnode.js"}],"../node_modules/mithril/mount-redraw.js":[function(require,module,exports) {
"use strict"

var render = require("./render")

module.exports = require("./api/mount-redraw")(render, requestAnimationFrame, console)

},{"./render":"../node_modules/mithril/render.js","./api/mount-redraw":"../node_modules/mithril/api/mount-redraw.js"}],"../node_modules/mithril/querystring/build.js":[function(require,module,exports) {
"use strict"

module.exports = function(object) {
	if (Object.prototype.toString.call(object) !== "[object Object]") return ""

	var args = []
	for (var key in object) {
		destructure(key, object[key])
	}

	return args.join("&")

	function destructure(key, value) {
		if (Array.isArray(value)) {
			for (var i = 0; i < value.length; i++) {
				destructure(key + "[" + i + "]", value[i])
			}
		}
		else if (Object.prototype.toString.call(value) === "[object Object]") {
			for (var i in value) {
				destructure(key + "[" + i + "]", value[i])
			}
		}
		else args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""))
	}
}

},{}],"../node_modules/mithril/pathname/assign.js":[function(require,module,exports) {
"use strict"

module.exports = Object.assign || function(target, source) {
	if(source) Object.keys(source).forEach(function(key) { target[key] = source[key] })
}

},{}],"../node_modules/mithril/pathname/build.js":[function(require,module,exports) {
"use strict"

var buildQueryString = require("../querystring/build")
var assign = require("./assign")

// Returns `path` from `template` + `params`
module.exports = function(template, params) {
	if ((/:([^\/\.-]+)(\.{3})?:/).test(template)) {
		throw new SyntaxError("Template parameter names *must* be separated")
	}
	if (params == null) return template
	var queryIndex = template.indexOf("?")
	var hashIndex = template.indexOf("#")
	var queryEnd = hashIndex < 0 ? template.length : hashIndex
	var pathEnd = queryIndex < 0 ? queryEnd : queryIndex
	var path = template.slice(0, pathEnd)
	var query = {}

	assign(query, params)

	var resolved = path.replace(/:([^\/\.-]+)(\.{3})?/g, function(m, key, variadic) {
		delete query[key]
		// If no such parameter exists, don't interpolate it.
		if (params[key] == null) return m
		// Escape normal parameters, but not variadic ones.
		return variadic ? params[key] : encodeURIComponent(String(params[key]))
	})

	// In case the template substitution adds new query/hash parameters.
	var newQueryIndex = resolved.indexOf("?")
	var newHashIndex = resolved.indexOf("#")
	var newQueryEnd = newHashIndex < 0 ? resolved.length : newHashIndex
	var newPathEnd = newQueryIndex < 0 ? newQueryEnd : newQueryIndex
	var result = resolved.slice(0, newPathEnd)

	if (queryIndex >= 0) result += template.slice(queryIndex, queryEnd)
	if (newQueryIndex >= 0) result += (queryIndex < 0 ? "?" : "&") + resolved.slice(newQueryIndex, newQueryEnd)
	var querystring = buildQueryString(query)
	if (querystring) result += (queryIndex < 0 && newQueryIndex < 0 ? "?" : "&") + querystring
	if (hashIndex >= 0) result += template.slice(hashIndex)
	if (newHashIndex >= 0) result += (hashIndex < 0 ? "" : "&") + resolved.slice(newHashIndex)
	return result
}

},{"../querystring/build":"../node_modules/mithril/querystring/build.js","./assign":"../node_modules/mithril/pathname/assign.js"}],"../node_modules/mithril/request/request.js":[function(require,module,exports) {
"use strict"

var buildPathname = require("../pathname/build")

module.exports = function($window, Promise, oncompletion) {
	var callbackCount = 0

	function PromiseProxy(executor) {
		return new Promise(executor)
	}

	// In case the global Promise is some userland library's where they rely on
	// `foo instanceof this.constructor`, `this.constructor.resolve(value)`, or
	// similar. Let's *not* break them.
	PromiseProxy.prototype = Promise.prototype
	PromiseProxy.__proto__ = Promise // eslint-disable-line no-proto

	function makeRequest(factory) {
		return function(url, args) {
			if (typeof url !== "string") { args = url; url = url.url }
			else if (args == null) args = {}
			var promise = new Promise(function(resolve, reject) {
				factory(buildPathname(url, args.params), args, function (data) {
					if (typeof args.type === "function") {
						if (Array.isArray(data)) {
							for (var i = 0; i < data.length; i++) {
								data[i] = new args.type(data[i])
							}
						}
						else data = new args.type(data)
					}
					resolve(data)
				}, reject)
			})
			if (args.background === true) return promise
			var count = 0
			function complete() {
				if (--count === 0 && typeof oncompletion === "function") oncompletion()
			}

			return wrap(promise)

			function wrap(promise) {
				var then = promise.then
				// Set the constructor, so engines know to not await or resolve
				// this as a native promise. At the time of writing, this is
				// only necessary for V8, but their behavior is the correct
				// behavior per spec. See this spec issue for more details:
				// https://github.com/tc39/ecma262/issues/1577. Also, see the
				// corresponding comment in `request/tests/test-request.js` for
				// a bit more background on the issue at hand.
				promise.constructor = PromiseProxy
				promise.then = function() {
					count++
					var next = then.apply(promise, arguments)
					next.then(complete, function(e) {
						complete()
						if (count === 0) throw e
					})
					return wrap(next)
				}
				return promise
			}
		}
	}

	function hasHeader(args, name) {
		for (var key in args.headers) {
			if ({}.hasOwnProperty.call(args.headers, key) && name.test(key)) return true
		}
		return false
	}

	return {
		request: makeRequest(function(url, args, resolve, reject) {
			var method = args.method != null ? args.method.toUpperCase() : "GET"
			var body = args.body
			var assumeJSON = (args.serialize == null || args.serialize === JSON.serialize) && !(body instanceof $window.FormData)
			var responseType = args.responseType || (typeof args.extract === "function" ? "" : "json")

			var xhr = new $window.XMLHttpRequest(), aborted = false
			var original = xhr, replacedAbort
			var abort = xhr.abort

			xhr.abort = function() {
				aborted = true
				abort.call(this)
			}

			xhr.open(method, url, args.async !== false, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined)

			if (assumeJSON && body != null && !hasHeader(args, /^content-type$/i)) {
				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8")
			}
			if (typeof args.deserialize !== "function" && !hasHeader(args, /^accept$/i)) {
				xhr.setRequestHeader("Accept", "application/json, text/*")
			}
			if (args.withCredentials) xhr.withCredentials = args.withCredentials
			if (args.timeout) xhr.timeout = args.timeout
			xhr.responseType = responseType

			for (var key in args.headers) {
				if ({}.hasOwnProperty.call(args.headers, key)) {
					xhr.setRequestHeader(key, args.headers[key])
				}
			}

			xhr.onreadystatechange = function(ev) {
				// Don't throw errors on xhr.abort().
				if (aborted) return

				if (ev.target.readyState === 4) {
					try {
						var success = (ev.target.status >= 200 && ev.target.status < 300) || ev.target.status === 304 || (/^file:\/\//i).test(url)
						// When the response type isn't "" or "text",
						// `xhr.responseText` is the wrong thing to use.
						// Browsers do the right thing and throw here, and we
						// should honor that and do the right thing by
						// preferring `xhr.response` where possible/practical.
						var response = ev.target.response, message

						if (responseType === "json") {
							// For IE and Edge, which don't implement
							// `responseType: "json"`.
							if (!ev.target.responseType && typeof args.extract !== "function") response = JSON.parse(ev.target.responseText)
						} else if (!responseType || responseType === "text") {
							// Only use this default if it's text. If a parsed
							// document is needed on old IE and friends (all
							// unsupported), the user should use a custom
							// `config` instead. They're already using this at
							// their own risk.
							if (response == null) response = ev.target.responseText
						}

						if (typeof args.extract === "function") {
							response = args.extract(ev.target, args)
							success = true
						} else if (typeof args.deserialize === "function") {
							response = args.deserialize(response)
						}
						if (success) resolve(response)
						else {
							try { message = ev.target.responseText }
							catch (e) { message = response }
							var error = new Error(message)
							error.code = ev.target.status
							error.response = response
							reject(error)
						}
					}
					catch (e) {
						reject(e)
					}
				}
			}

			if (typeof args.config === "function") {
				xhr = args.config(xhr, args, url) || xhr

				// Propagate the `abort` to any replacement XHR as well.
				if (xhr !== original) {
					replacedAbort = xhr.abort
					xhr.abort = function() {
						aborted = true
						replacedAbort.call(this)
					}
				}
			}

			if (body == null) xhr.send()
			else if (typeof args.serialize === "function") xhr.send(args.serialize(body))
			else if (body instanceof $window.FormData) xhr.send(body)
			else xhr.send(JSON.stringify(body))
		}),
		jsonp: makeRequest(function(url, args, resolve, reject) {
			var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++
			var script = $window.document.createElement("script")
			$window[callbackName] = function(data) {
				delete $window[callbackName]
				script.parentNode.removeChild(script)
				resolve(data)
			}
			script.onerror = function() {
				delete $window[callbackName]
				script.parentNode.removeChild(script)
				reject(new Error("JSONP request failed"))
			}
			script.src = url + (url.indexOf("?") < 0 ? "?" : "&") +
				encodeURIComponent(args.callbackKey || "callback") + "=" +
				encodeURIComponent(callbackName)
			$window.document.documentElement.appendChild(script)
		}),
	}
}

},{"../pathname/build":"../node_modules/mithril/pathname/build.js"}],"../node_modules/mithril/request.js":[function(require,module,exports) {
"use strict"

var PromisePolyfill = require("./promise/promise")
var mountRedraw = require("./mount-redraw")

module.exports = require("./request/request")(window, PromisePolyfill, mountRedraw.redraw)

},{"./promise/promise":"../node_modules/mithril/promise/promise.js","./mount-redraw":"../node_modules/mithril/mount-redraw.js","./request/request":"../node_modules/mithril/request/request.js"}],"../node_modules/mithril/querystring/parse.js":[function(require,module,exports) {
"use strict"

module.exports = function(string) {
	if (string === "" || string == null) return {}
	if (string.charAt(0) === "?") string = string.slice(1)

	var entries = string.split("&"), counters = {}, data = {}
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i].split("=")
		var key = decodeURIComponent(entry[0])
		var value = entry.length === 2 ? decodeURIComponent(entry[1]) : ""

		if (value === "true") value = true
		else if (value === "false") value = false

		var levels = key.split(/\]\[?|\[/)
		var cursor = data
		if (key.indexOf("[") > -1) levels.pop()
		for (var j = 0; j < levels.length; j++) {
			var level = levels[j], nextLevel = levels[j + 1]
			var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10))
			if (level === "") {
				var key = levels.slice(0, j).join()
				if (counters[key] == null) {
					counters[key] = Array.isArray(cursor) ? cursor.length : 0
				}
				level = counters[key]++
			}
			// Disallow direct prototype pollution
			else if (level === "__proto__") break
			if (j === levels.length - 1) cursor[level] = value
			else {
				// Read own properties exclusively to disallow indirect
				// prototype pollution
				var desc = Object.getOwnPropertyDescriptor(cursor, level)
				if (desc != null) desc = desc.value
				if (desc == null) cursor[level] = desc = isNumber ? [] : {}
				cursor = desc
			}
		}
	}
	return data
}

},{}],"../node_modules/mithril/pathname/parse.js":[function(require,module,exports) {
"use strict"

var parseQueryString = require("../querystring/parse")

// Returns `{path, params}` from `url`
module.exports = function(url) {
	var queryIndex = url.indexOf("?")
	var hashIndex = url.indexOf("#")
	var queryEnd = hashIndex < 0 ? url.length : hashIndex
	var pathEnd = queryIndex < 0 ? queryEnd : queryIndex
	var path = url.slice(0, pathEnd).replace(/\/{2,}/g, "/")

	if (!path) path = "/"
	else {
		if (path[0] !== "/") path = "/" + path
		if (path.length > 1 && path[path.length - 1] === "/") path = path.slice(0, -1)
	}
	return {
		path: path,
		params: queryIndex < 0
			? {}
			: parseQueryString(url.slice(queryIndex + 1, queryEnd)),
	}
}

},{"../querystring/parse":"../node_modules/mithril/querystring/parse.js"}],"../node_modules/mithril/pathname/compileTemplate.js":[function(require,module,exports) {
"use strict"

var parsePathname = require("./parse")

// Compiles a template into a function that takes a resolved path (without query
// strings) and returns an object containing the template parameters with their
// parsed values. This expects the input of the compiled template to be the
// output of `parsePathname`. Note that it does *not* remove query parameters
// specified in the template.
module.exports = function(template) {
	var templateData = parsePathname(template)
	var templateKeys = Object.keys(templateData.params)
	var keys = []
	var regexp = new RegExp("^" + templateData.path.replace(
		// I escape literal text so people can use things like `:file.:ext` or
		// `:lang-:locale` in routes. This is all merged into one pass so I
		// don't also accidentally escape `-` and make it harder to detect it to
		// ban it from template parameters.
		/:([^\/.-]+)(\.{3}|\.(?!\.)|-)?|[\\^$*+.()|\[\]{}]/g,
		function(m, key, extra) {
			if (key == null) return "\\" + m
			keys.push({k: key, r: extra === "..."})
			if (extra === "...") return "(.*)"
			if (extra === ".") return "([^/]+)\\."
			return "([^/]+)" + (extra || "")
		}
	) + "$")
	return function(data) {
		// First, check the params. Usually, there isn't any, and it's just
		// checking a static set.
		for (var i = 0; i < templateKeys.length; i++) {
			if (templateData.params[templateKeys[i]] !== data.params[templateKeys[i]]) return false
		}
		// If no interpolations exist, let's skip all the ceremony
		if (!keys.length) return regexp.test(data.path)
		var values = regexp.exec(data.path)
		if (values == null) return false
		for (var i = 0; i < keys.length; i++) {
			data.params[keys[i].k] = keys[i].r ? values[i + 1] : decodeURIComponent(values[i + 1])
		}
		return true
	}
}

},{"./parse":"../node_modules/mithril/pathname/parse.js"}],"../node_modules/mithril/api/router.js":[function(require,module,exports) {
"use strict"

var Vnode = require("../render/vnode")
var m = require("../render/hyperscript")
var Promise = require("../promise/promise")

var buildPathname = require("../pathname/build")
var parsePathname = require("../pathname/parse")
var compileTemplate = require("../pathname/compileTemplate")
var assign = require("../pathname/assign")

var sentinel = {}

module.exports = function($window, mountRedraw) {
	var fireAsync

	function setPath(path, data, options) {
		path = buildPathname(path, data)
		if (fireAsync != null) {
			fireAsync()
			var state = options ? options.state : null
			var title = options ? options.title : null
			if (options && options.replace) $window.history.replaceState(state, title, route.prefix + path)
			else $window.history.pushState(state, title, route.prefix + path)
		}
		else {
			$window.location.href = route.prefix + path
		}
	}

	var currentResolver = sentinel, component, attrs, currentPath, lastUpdate

	var SKIP = route.SKIP = {}

	function route(root, defaultRoute, routes) {
		if (root == null) throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined")
		// 0 = start
		// 1 = init
		// 2 = ready
		var state = 0

		var compiled = Object.keys(routes).map(function(route) {
			if (route[0] !== "/") throw new SyntaxError("Routes must start with a `/`")
			if ((/:([^\/\.-]+)(\.{3})?:/).test(route)) {
				throw new SyntaxError("Route parameter names must be separated with either `/`, `.`, or `-`")
			}
			return {
				route: route,
				component: routes[route],
				check: compileTemplate(route),
			}
		})
		var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout
		var p = Promise.resolve()
		var scheduled = false
		var onremove

		fireAsync = null

		if (defaultRoute != null) {
			var defaultData = parsePathname(defaultRoute)

			if (!compiled.some(function (i) { return i.check(defaultData) })) {
				throw new ReferenceError("Default route doesn't match any known routes")
			}
		}

		function resolveRoute() {
			scheduled = false
			// Consider the pathname holistically. The prefix might even be invalid,
			// but that's not our problem.
			var prefix = $window.location.hash
			if (route.prefix[0] !== "#") {
				prefix = $window.location.search + prefix
				if (route.prefix[0] !== "?") {
					prefix = $window.location.pathname + prefix
					if (prefix[0] !== "/") prefix = "/" + prefix
				}
			}
			// This seemingly useless `.concat()` speeds up the tests quite a bit,
			// since the representation is consistently a relatively poorly
			// optimized cons string.
			var path = prefix.concat()
				.replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent)
				.slice(route.prefix.length)
			var data = parsePathname(path)

			assign(data.params, $window.history.state)

			function fail() {
				if (path === defaultRoute) throw new Error("Could not resolve default route " + defaultRoute)
				setPath(defaultRoute, null, {replace: true})
			}

			loop(0)
			function loop(i) {
				// 0 = init
				// 1 = scheduled
				// 2 = done
				for (; i < compiled.length; i++) {
					if (compiled[i].check(data)) {
						var payload = compiled[i].component
						var matchedRoute = compiled[i].route
						var localComp = payload
						var update = lastUpdate = function(comp) {
							if (update !== lastUpdate) return
							if (comp === SKIP) return loop(i + 1)
							component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div"
							attrs = data.params, currentPath = path, lastUpdate = null
							currentResolver = payload.render ? payload : null
							if (state === 2) mountRedraw.redraw()
							else {
								state = 2
								mountRedraw.redraw.sync()
							}
						}
						// There's no understating how much I *wish* I could
						// use `async`/`await` here...
						if (payload.view || typeof payload === "function") {
							payload = {}
							update(localComp)
						}
						else if (payload.onmatch) {
							p.then(function () {
								return payload.onmatch(data.params, path, matchedRoute)
							}).then(update, fail)
						}
						else update("div")
						return
					}
				}
				fail()
			}
		}

		// Set it unconditionally so `m.route.set` and `m.route.Link` both work,
		// even if neither `pushState` nor `hashchange` are supported. It's
		// cleared if `hashchange` is used, since that makes it automatically
		// async.
		fireAsync = function() {
			if (!scheduled) {
				scheduled = true
				callAsync(resolveRoute)
			}
		}

		if (typeof $window.history.pushState === "function") {
			onremove = function() {
				$window.removeEventListener("popstate", fireAsync, false)
			}
			$window.addEventListener("popstate", fireAsync, false)
		} else if (route.prefix[0] === "#") {
			fireAsync = null
			onremove = function() {
				$window.removeEventListener("hashchange", resolveRoute, false)
			}
			$window.addEventListener("hashchange", resolveRoute, false)
		}

		return mountRedraw.mount(root, {
			onbeforeupdate: function() {
				state = state ? 2 : 1
				return !(!state || sentinel === currentResolver)
			},
			oncreate: resolveRoute,
			onremove: onremove,
			view: function() {
				if (!state || sentinel === currentResolver) return
				// Wrap in a fragment to preserve existing key semantics
				var vnode = [Vnode(component, attrs.key, attrs)]
				if (currentResolver) vnode = currentResolver.render(vnode[0])
				return vnode
			},
		})
	}
	route.set = function(path, data, options) {
		if (lastUpdate != null) {
			options = options || {}
			options.replace = true
		}
		lastUpdate = null
		setPath(path, data, options)
	}
	route.get = function() {return currentPath}
	route.prefix = "#!"
	route.Link = {
		view: function(vnode) {
			var options = vnode.attrs.options
			// Remove these so they don't get overwritten
			var attrs = {}, onclick, href
			assign(attrs, vnode.attrs)
			// The first two are internal, but the rest are magic attributes
			// that need censored to not screw up rendering.
			attrs.selector = attrs.options = attrs.key = attrs.oninit =
			attrs.oncreate = attrs.onbeforeupdate = attrs.onupdate =
			attrs.onbeforeremove = attrs.onremove = null

			// Do this now so we can get the most current `href` and `disabled`.
			// Those attributes may also be specified in the selector, and we
			// should honor that.
			var child = m(vnode.attrs.selector || "a", attrs, vnode.children)

			// Let's provide a *right* way to disable a route link, rather than
			// letting people screw up accessibility on accident.
			//
			// The attribute is coerced so users don't get surprised over
			// `disabled: 0` resulting in a button that's somehow routable
			// despite being visibly disabled.
			if (child.attrs.disabled = Boolean(child.attrs.disabled)) {
				child.attrs.href = null
				child.attrs["aria-disabled"] = "true"
				// If you *really* do want to do this on a disabled link, use
				// an `oncreate` hook to add it.
				child.attrs.onclick = null
			} else {
				onclick = child.attrs.onclick
				href = child.attrs.href
				child.attrs.href = route.prefix + href
				child.attrs.onclick = function(e) {
					var result
					if (typeof onclick === "function") {
						result = onclick.call(e.currentTarget, e)
					} else if (onclick == null || typeof onclick !== "object") {
						// do nothing
					} else if (typeof onclick.handleEvent === "function") {
						onclick.handleEvent(e)
					}

					// Adapted from React Router's implementation:
					// https://github.com/ReactTraining/react-router/blob/520a0acd48ae1b066eb0b07d6d4d1790a1d02482/packages/react-router-dom/modules/Link.js
					//
					// Try to be flexible and intuitive in how we handle links.
					// Fun fact: links aren't as obvious to get right as you
					// would expect. There's a lot more valid ways to click a
					// link than this, and one might want to not simply click a
					// link, but right click or command-click it to copy the
					// link target, etc. Nope, this isn't just for blind people.
					if (
						// Skip if `onclick` prevented default
						result !== false && !e.defaultPrevented &&
						// Ignore everything but left clicks
						(e.button === 0 || e.which === 0 || e.which === 1) &&
						// Let the browser handle `target=_blank`, etc.
						(!e.currentTarget.target || e.currentTarget.target === "_self") &&
						// No modifier keys
						!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey
					) {
						e.preventDefault()
						e.redraw = false
						route.set(href, null, options)
					}
				}
			}
			return child
		},
	}
	route.param = function(key) {
		return attrs && key != null ? attrs[key] : attrs
	}

	return route
}

},{"../render/vnode":"../node_modules/mithril/render/vnode.js","../render/hyperscript":"../node_modules/mithril/render/hyperscript.js","../promise/promise":"../node_modules/mithril/promise/promise.js","../pathname/build":"../node_modules/mithril/pathname/build.js","../pathname/parse":"../node_modules/mithril/pathname/parse.js","../pathname/compileTemplate":"../node_modules/mithril/pathname/compileTemplate.js","../pathname/assign":"../node_modules/mithril/pathname/assign.js"}],"../node_modules/mithril/route.js":[function(require,module,exports) {
"use strict"

var mountRedraw = require("./mount-redraw")

module.exports = require("./api/router")(window, mountRedraw)

},{"./mount-redraw":"../node_modules/mithril/mount-redraw.js","./api/router":"../node_modules/mithril/api/router.js"}],"../node_modules/mithril/index.js":[function(require,module,exports) {
"use strict"

var hyperscript = require("./hyperscript")
var request = require("./request")
var mountRedraw = require("./mount-redraw")

var m = function m() { return hyperscript.apply(this, arguments) }
m.m = hyperscript
m.trust = hyperscript.trust
m.fragment = hyperscript.fragment
m.mount = mountRedraw.mount
m.route = require("./route")
m.render = require("./render")
m.redraw = mountRedraw.redraw
m.request = request.request
m.jsonp = request.jsonp
m.parseQueryString = require("./querystring/parse")
m.buildQueryString = require("./querystring/build")
m.parsePathname = require("./pathname/parse")
m.buildPathname = require("./pathname/build")
m.vnode = require("./render/vnode")
m.PromisePolyfill = require("./promise/polyfill")

module.exports = m

},{"./hyperscript":"../node_modules/mithril/hyperscript.js","./request":"../node_modules/mithril/request.js","./mount-redraw":"../node_modules/mithril/mount-redraw.js","./route":"../node_modules/mithril/route.js","./render":"../node_modules/mithril/render.js","./querystring/parse":"../node_modules/mithril/querystring/parse.js","./querystring/build":"../node_modules/mithril/querystring/build.js","./pathname/parse":"../node_modules/mithril/pathname/parse.js","./pathname/build":"../node_modules/mithril/pathname/build.js","./render/vnode":"../node_modules/mithril/render/vnode.js","./promise/polyfill":"../node_modules/mithril/promise/polyfill.js"}],"../node_modules/dexie/dist/dexie.es.js":[function(require,module,exports) {
var global = arguments[3];
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function (obj) { return typeof obj; }; } else { _typeof = function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*
 * Dexie.js - a minimalistic wrapper for IndexedDB
 * ===============================================
 *
 * By David Fahlander, david.fahlander@gmail.com
 *
 * Version {version}, {date}
 *
 * http://dexie.org
 *
 * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
 */
var keys = Object.keys;
var isArray = Array.isArray;

var _global = typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : global;

function extend(obj, extension) {
  if (_typeof(extension) !== 'object') return obj;
  keys(extension).forEach(function (key) {
    obj[key] = extension[key];
  });
  return obj;
}

var getProto = Object.getPrototypeOf;
var _hasOwn = {}.hasOwnProperty;

function hasOwn(obj, prop) {
  return _hasOwn.call(obj, prop);
}

function props(proto, extension) {
  if (typeof extension === 'function') extension = extension(getProto(proto));
  keys(extension).forEach(function (key) {
    setProp(proto, key, extension[key]);
  });
}

var defineProperty = Object.defineProperty;

function setProp(obj, prop, functionOrGetSet, options) {
  defineProperty(obj, prop, extend(functionOrGetSet && hasOwn(functionOrGetSet, "get") && typeof functionOrGetSet.get === 'function' ? {
    get: functionOrGetSet.get,
    set: functionOrGetSet.set,
    configurable: true
  } : {
    value: functionOrGetSet,
    configurable: true,
    writable: true
  }, options));
}

function derive(Child) {
  return {
    from: function (Parent) {
      Child.prototype = Object.create(Parent.prototype);
      setProp(Child.prototype, "constructor", Child);
      return {
        extend: props.bind(null, Child.prototype)
      };
    }
  };
}

var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

function getPropertyDescriptor(obj, prop) {
  var pd = getOwnPropertyDescriptor(obj, prop),
      proto;
  return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
}

var _slice = [].slice;

function slice(args, start, end) {
  return _slice.call(args, start, end);
}

function override(origFunc, overridedFactory) {
  return overridedFactory(origFunc);
}

function assert(b) {
  if (!b) throw new Error("Assertion Failed");
}

function asap(fn) {
  if (_global.setImmediate) setImmediate(fn);else setTimeout(fn, 0);
}
/** Generate an object (hash map) based on given array.
 * @param extractor Function taking an array item and its index and returning an array of 2 items ([key, value]) to
 *        instert on the resulting object for each item in the array. If this function returns a falsy value, the
 *        current item wont affect the resulting object.
 */


function arrayToObject(array, extractor) {
  return array.reduce(function (result, item, i) {
    var nameAndValue = extractor(item, i);
    if (nameAndValue) result[nameAndValue[0]] = nameAndValue[1];
    return result;
  }, {});
}

function trycatcher(fn, reject) {
  return function () {
    try {
      fn.apply(this, arguments);
    } catch (e) {
      reject(e);
    }
  };
}

function tryCatch(fn, onerror, args) {
  try {
    fn.apply(null, args);
  } catch (ex) {
    onerror && onerror(ex);
  }
}

function getByKeyPath(obj, keyPath) {
  // http://www.w3.org/TR/IndexedDB/#steps-for-extracting-a-key-from-a-value-using-a-key-path
  if (hasOwn(obj, keyPath)) return obj[keyPath]; // This line is moved from last to first for optimization purpose.

  if (!keyPath) return obj;

  if (typeof keyPath !== 'string') {
    var rv = [];

    for (var i = 0, l = keyPath.length; i < l; ++i) {
      var val = getByKeyPath(obj, keyPath[i]);
      rv.push(val);
    }

    return rv;
  }

  var period = keyPath.indexOf('.');

  if (period !== -1) {
    var innerObj = obj[keyPath.substr(0, period)];
    return innerObj === undefined ? undefined : getByKeyPath(innerObj, keyPath.substr(period + 1));
  }

  return undefined;
}

function setByKeyPath(obj, keyPath, value) {
  if (!obj || keyPath === undefined) return;
  if ('isFrozen' in Object && Object.isFrozen(obj)) return;

  if (typeof keyPath !== 'string' && 'length' in keyPath) {
    assert(typeof value !== 'string' && 'length' in value);

    for (var i = 0, l = keyPath.length; i < l; ++i) {
      setByKeyPath(obj, keyPath[i], value[i]);
    }
  } else {
    var period = keyPath.indexOf('.');

    if (period !== -1) {
      var currentKeyPath = keyPath.substr(0, period);
      var remainingKeyPath = keyPath.substr(period + 1);
      if (remainingKeyPath === "") {
        if (value === undefined) delete obj[currentKeyPath];else obj[currentKeyPath] = value;
      } else {
        var innerObj = obj[currentKeyPath];
        if (!innerObj) innerObj = obj[currentKeyPath] = {};
        setByKeyPath(innerObj, remainingKeyPath, value);
      }
    } else {
      if (value === undefined) delete obj[keyPath];else obj[keyPath] = value;
    }
  }
}

function delByKeyPath(obj, keyPath) {
  if (typeof keyPath === 'string') setByKeyPath(obj, keyPath, undefined);else if ('length' in keyPath) [].map.call(keyPath, function (kp) {
    setByKeyPath(obj, kp, undefined);
  });
}

function shallowClone(obj) {
  var rv = {};

  for (var m in obj) {
    if (hasOwn(obj, m)) rv[m] = obj[m];
  }

  return rv;
}

var concat = [].concat;

function flatten(a) {
  return concat.apply([], a);
} //https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm


var intrinsicTypes = "Boolean,String,Date,RegExp,Blob,File,FileList,ArrayBuffer,DataView,Uint8ClampedArray,ImageData,Map,Set".split(',').concat(flatten([8, 16, 32, 64].map(function (num) {
  return ["Int", "Uint", "Float"].map(function (t) {
    return t + num + "Array";
  });
}))).filter(function (t) {
  return _global[t];
}).map(function (t) {
  return _global[t];
});

function deepClone(any) {
  if (!any || _typeof(any) !== 'object') return any;
  var rv;

  if (isArray(any)) {
    rv = [];

    for (var i = 0, l = any.length; i < l; ++i) {
      rv.push(deepClone(any[i]));
    }
  } else if (intrinsicTypes.indexOf(any.constructor) >= 0) {
    rv = any;
  } else {
    rv = any.constructor ? Object.create(any.constructor.prototype) : {};

    for (var prop in any) {
      if (hasOwn(any, prop)) {
        rv[prop] = deepClone(any[prop]);
      }
    }
  }

  return rv;
}

function getObjectDiff(a, b, rv, prfx) {
  // Compares objects a and b and produces a diff object.
  rv = rv || {};
  prfx = prfx || '';
  keys(a).forEach(function (prop) {
    if (!hasOwn(b, prop)) rv[prfx + prop] = undefined; // Property removed
    else {
        var ap = a[prop],
            bp = b[prop];
        if (_typeof(ap) === 'object' && _typeof(bp) === 'object' && ap && bp && // Now compare constructors are same (not equal because wont work in Safari)
        '' + ap.constructor === '' + bp.constructor) // Same type of object but its properties may have changed
          getObjectDiff(ap, bp, rv, prfx + prop + ".");else if (ap !== bp) rv[prfx + prop] = b[prop]; // Primitive value changed
      }
  });
  keys(b).forEach(function (prop) {
    if (!hasOwn(a, prop)) {
      rv[prfx + prop] = b[prop]; // Property added
    }
  });
  return rv;
} // If first argument is iterable or array-like, return it as an array


var iteratorSymbol = typeof Symbol !== 'undefined' && Symbol.iterator;
var getIteratorOf = iteratorSymbol ? function (x) {
  var i;
  return x != null && (i = x[iteratorSymbol]) && i.apply(x);
} : function () {
  return null;
};
var NO_CHAR_ARRAY = {}; // Takes one or several arguments and returns an array based on the following criteras:
// * If several arguments provided, return arguments converted to an array in a way that
//   still allows javascript engine to optimize the code.
// * If single argument is an array, return a clone of it.
// * If this-pointer equals NO_CHAR_ARRAY, don't accept strings as valid iterables as a special
//   case to the two bullets below.
// * If single argument is an iterable, convert it to an array and return the resulting array.
// * If single argument is array-like (has length of type number), convert it to an array.

function getArrayOf(arrayLike) {
  var i, a, x, it;

  if (arguments.length === 1) {
    if (isArray(arrayLike)) return arrayLike.slice();
    if (this === NO_CHAR_ARRAY && typeof arrayLike === 'string') return [arrayLike];

    if (it = getIteratorOf(arrayLike)) {
      a = [];

      while (x = it.next(), !x.done) {
        a.push(x.value);
      }

      return a;
    }

    if (arrayLike == null) return [arrayLike];
    i = arrayLike.length;

    if (typeof i === 'number') {
      a = new Array(i);

      while (i--) {
        a[i] = arrayLike[i];
      }

      return a;
    }

    return [arrayLike];
  }

  i = arguments.length;
  a = new Array(i);

  while (i--) {
    a[i] = arguments[i];
  }

  return a;
} // By default, debug will be true only if platform is a web platform and its page is served from localhost.
// When debug = true, error's stacks will contain asyncronic long stacks.


var debug = typeof location !== 'undefined' && // By default, use debug mode if served from localhost.
/^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);

function setDebug(value, filter) {
  debug = value;
  libraryFilter = filter;
}

var libraryFilter = function () {
  return true;
};

var NEEDS_THROW_FOR_STACK = !new Error("").stack;

function getErrorWithStack() {
  "use strict";

  if (NEEDS_THROW_FOR_STACK) try {
    // Doing something naughty in strict mode here to trigger a specific error
    // that can be explicitely ignored in debugger's exception settings.
    // If we'd just throw new Error() here, IE's debugger's exception settings
    // will just consider it as "exception thrown by javascript code" which is
    // something you wouldn't want it to ignore.
    getErrorWithStack.arguments;
    throw new Error(); // Fallback if above line don't throw.
  } catch (e) {
    return e;
  }
  return new Error();
}

function prettyStack(exception, numIgnoredFrames) {
  var stack = exception.stack;
  if (!stack) return "";
  numIgnoredFrames = numIgnoredFrames || 0;
  if (stack.indexOf(exception.name) === 0) numIgnoredFrames += (exception.name + exception.message).split('\n').length;
  return stack.split('\n').slice(numIgnoredFrames).filter(libraryFilter).map(function (frame) {
    return "\n" + frame;
  }).join('');
}

function deprecated(what, fn) {
  return function () {
    console.warn(what + " is deprecated. See https://github.com/dfahlander/Dexie.js/wiki/Deprecations. " + prettyStack(getErrorWithStack(), 1));
    return fn.apply(this, arguments);
  };
}

var dexieErrorNames = ['Modify', 'Bulk', 'OpenFailed', 'VersionChange', 'Schema', 'Upgrade', 'InvalidTable', 'MissingAPI', 'NoSuchDatabase', 'InvalidArgument', 'SubTransaction', 'Unsupported', 'Internal', 'DatabaseClosed', 'PrematureCommit', 'ForeignAwait'];
var idbDomErrorNames = ['Unknown', 'Constraint', 'Data', 'TransactionInactive', 'ReadOnly', 'Version', 'NotFound', 'InvalidState', 'InvalidAccess', 'Abort', 'Timeout', 'QuotaExceeded', 'Syntax', 'DataClone'];
var errorList = dexieErrorNames.concat(idbDomErrorNames);
var defaultTexts = {
  VersionChanged: "Database version changed by other database connection",
  DatabaseClosed: "Database has been closed",
  Abort: "Transaction aborted",
  TransactionInactive: "Transaction has already completed or failed"
}; //
// DexieError - base class of all out exceptions.
//

function DexieError(name, msg) {
  // Reason we don't use ES6 classes is because:
  // 1. It bloats transpiled code and increases size of minified code.
  // 2. It doesn't give us much in this case.
  // 3. It would require sub classes to call super(), which
  //    is not needed when deriving from Error.
  this._e = getErrorWithStack();
  this.name = name;
  this.message = msg;
}

derive(DexieError).from(Error).extend({
  stack: {
    get: function () {
      return this._stack || (this._stack = this.name + ": " + this.message + prettyStack(this._e, 2));
    }
  },
  toString: function () {
    return this.name + ": " + this.message;
  }
});

function getMultiErrorMessage(msg, failures) {
  return msg + ". Errors: " + failures.map(function (f) {
    return f.toString();
  }).filter(function (v, i, s) {
    return s.indexOf(v) === i;
  }) // Only unique error strings
  .join('\n');
} //
// ModifyError - thrown in Collection.modify()
// Specific constructor because it contains members failures and failedKeys.
//


function ModifyError(msg, failures, successCount, failedKeys) {
  this._e = getErrorWithStack();
  this.failures = failures;
  this.failedKeys = failedKeys;
  this.successCount = successCount;
}

derive(ModifyError).from(DexieError);

function BulkError(msg, failures) {
  this._e = getErrorWithStack();
  this.name = "BulkError";
  this.failures = failures;
  this.message = getMultiErrorMessage(msg, failures);
}

derive(BulkError).from(DexieError); //
//
// Dynamically generate error names and exception classes based
// on the names in errorList.
//
//
// Map of {ErrorName -> ErrorName + "Error"}

var errnames = errorList.reduce(function (obj, name) {
  return obj[name] = name + "Error", obj;
}, {}); // Need an alias for DexieError because we're gonna create subclasses with the same name.

var BaseException = DexieError; // Map of {ErrorName -> exception constructor}

var exceptions = errorList.reduce(function (obj, name) {
  // Let the name be "DexieError" because this name may
  // be shown in call stack and when debugging. DexieError is
  // the most true name because it derives from DexieError,
  // and we cannot change Function.name programatically without
  // dynamically create a Function object, which would be considered
  // 'eval-evil'.
  var fullName = name + "Error";

  function DexieError(msgOrInner, inner) {
    this._e = getErrorWithStack();
    this.name = fullName;

    if (!msgOrInner) {
      this.message = defaultTexts[name] || fullName;
      this.inner = null;
    } else if (typeof msgOrInner === 'string') {
      this.message = msgOrInner;
      this.inner = inner || null;
    } else if (_typeof(msgOrInner) === 'object') {
      this.message = msgOrInner.name + " " + msgOrInner.message;
      this.inner = msgOrInner;
    }
  }

  derive(DexieError).from(BaseException);
  obj[name] = DexieError;
  return obj;
}, {}); // Use ECMASCRIPT standard exceptions where applicable:

exceptions.Syntax = SyntaxError;
exceptions.Type = TypeError;
exceptions.Range = RangeError;
var exceptionMap = idbDomErrorNames.reduce(function (obj, name) {
  obj[name + "Error"] = exceptions[name];
  return obj;
}, {});

function mapError(domError, message) {
  if (!domError || domError instanceof DexieError || domError instanceof TypeError || domError instanceof SyntaxError || !domError.name || !exceptionMap[domError.name]) return domError;
  var rv = new exceptionMap[domError.name](message || domError.message, domError);

  if ("stack" in domError) {
    // Derive stack from inner exception if it has a stack
    setProp(rv, "stack", {
      get: function () {
        return this.inner.stack;
      }
    });
  }

  return rv;
}

var fullNameExceptions = errorList.reduce(function (obj, name) {
  if (["Syntax", "Type", "Range"].indexOf(name) === -1) obj[name + "Error"] = exceptions[name];
  return obj;
}, {});
fullNameExceptions.ModifyError = ModifyError;
fullNameExceptions.DexieError = DexieError;
fullNameExceptions.BulkError = BulkError;

function nop() {}

function mirror(val) {
  return val;
}

function pureFunctionChain(f1, f2) {
  // Enables chained events that takes ONE argument and returns it to the next function in chain.
  // This pattern is used in the hook("reading") event.
  if (f1 == null || f1 === mirror) return f2;
  return function (val) {
    return f2(f1(val));
  };
}

function callBoth(on1, on2) {
  return function () {
    on1.apply(this, arguments);
    on2.apply(this, arguments);
  };
}

function hookCreatingChain(f1, f2) {
  // Enables chained events that takes several arguments and may modify first argument by making a modification and then returning the same instance.
  // This pattern is used in the hook("creating") event.
  if (f1 === nop) return f2;
  return function () {
    var res = f1.apply(this, arguments);
    if (res !== undefined) arguments[0] = res;
    var onsuccess = this.onsuccess,
        // In case event listener has set this.onsuccess
    onerror = this.onerror; // In case event listener has set this.onerror

    this.onsuccess = null;
    this.onerror = null;
    var res2 = f2.apply(this, arguments);
    if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
    if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
    return res2 !== undefined ? res2 : res;
  };
}

function hookDeletingChain(f1, f2) {
  if (f1 === nop) return f2;
  return function () {
    f1.apply(this, arguments);
    var onsuccess = this.onsuccess,
        // In case event listener has set this.onsuccess
    onerror = this.onerror; // In case event listener has set this.onerror

    this.onsuccess = this.onerror = null;
    f2.apply(this, arguments);
    if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
    if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
  };
}

function hookUpdatingChain(f1, f2) {
  if (f1 === nop) return f2;
  return function (modifications) {
    var res = f1.apply(this, arguments);
    extend(modifications, res); // If f1 returns new modifications, extend caller's modifications with the result before calling next in chain.

    var onsuccess = this.onsuccess,
        // In case event listener has set this.onsuccess
    onerror = this.onerror; // In case event listener has set this.onerror

    this.onsuccess = null;
    this.onerror = null;
    var res2 = f2.apply(this, arguments);
    if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
    if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
    return res === undefined ? res2 === undefined ? undefined : res2 : extend(res, res2);
  };
}

function reverseStoppableEventChain(f1, f2) {
  if (f1 === nop) return f2;
  return function () {
    if (f2.apply(this, arguments) === false) return false;
    return f1.apply(this, arguments);
  };
}

function promisableChain(f1, f2) {
  if (f1 === nop) return f2;
  return function () {
    var res = f1.apply(this, arguments);

    if (res && typeof res.then === 'function') {
      var thiz = this,
          i = arguments.length,
          args = new Array(i);

      while (i--) {
        args[i] = arguments[i];
      }

      return res.then(function () {
        return f2.apply(thiz, args);
      });
    }

    return f2.apply(this, arguments);
  };
}
/*
 * Copyright (c) 2014-2017 David Fahlander
 * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/LICENSE-2.0
 */
//
// Promise and Zone (PSD) for Dexie library
//
// I started out writing this Promise class by copying promise-light (https://github.com/taylorhakes/promise-light) by
// https://github.com/taylorhakes - an A+ and ECMASCRIPT 6 compliant Promise implementation.
//
// In previous versions this was fixed by not calling setTimeout when knowing that the resolve() or reject() came from another
// tick. In Dexie v1.4.0, I've rewritten the Promise class entirely. Just some fragments of promise-light is left. I use
// another strategy now that simplifies everything a lot: to always execute callbacks in a new micro-task, but have an own micro-task
// engine that is indexedDB compliant across all browsers.
// Promise class has also been optimized a lot with inspiration from bluebird - to avoid closures as much as possible.
// Also with inspiration from bluebird, asyncronic stacks in debug mode.
//
// Specific non-standard features of this Promise class:
// * Custom zone support (a.k.a. PSD) with ability to keep zones also when using native promises as well as
//   native async / await.
// * Promise.follow() method built upon the custom zone engine, that allows user to track all promises created from current stack frame
//   and below + all promises that those promises creates or awaits.
// * Detect any unhandled promise in a PSD-scope (PSD.onunhandled). 
//
// David Fahlander, https://github.com/dfahlander
//
// Just a pointer that only this module knows about.
// Used in Promise constructor to emulate a private constructor.


var INTERNAL = {}; // Async stacks (long stacks) must not grow infinitely.

var LONG_STACKS_CLIP_LIMIT = 100;
var MAX_LONG_STACKS = 20;
var ZONE_ECHO_LIMIT = 7;

var nativePromiseInstanceAndProto = function () {
  try {
    // Be able to patch native async functions
    return new Function("let F=async ()=>{},p=F();return [p,Object.getPrototypeOf(p),Promise.resolve(),F.constructor];")();
  } catch (e) {
    var P = _global.Promise;
    return P ? [P.resolve(), P.prototype, P.resolve()] : [];
  }
}();

var resolvedNativePromise = nativePromiseInstanceAndProto[0];
var nativePromiseProto = nativePromiseInstanceAndProto[1];
var resolvedGlobalPromise = nativePromiseInstanceAndProto[2];
var nativePromiseThen = nativePromiseProto && nativePromiseProto.then;
var NativePromise = resolvedNativePromise && resolvedNativePromise.constructor;
var AsyncFunction = nativePromiseInstanceAndProto[3];
var patchGlobalPromise = !!resolvedGlobalPromise;
var stack_being_generated = false;
/* The default function used only for the very first promise in a promise chain.
   As soon as then promise is resolved or rejected, all next tasks will be executed in micro ticks
   emulated in this module. For indexedDB compatibility, this means that every method needs to
   execute at least one promise before doing an indexedDB operation. Dexie will always call
   db.ready().then() for every operation to make sure the indexedDB event is started in an
   indexedDB-compatible emulated micro task loop.
*/

var schedulePhysicalTick = resolvedGlobalPromise ? function () {
  resolvedGlobalPromise.then(physicalTick);
} : _global.setImmediate ? // setImmediate supported. Those modern platforms also supports Function.bind().
setImmediate.bind(null, physicalTick) : _global.MutationObserver ? // MutationObserver supported
function () {
  var hiddenDiv = document.createElement("div");
  new MutationObserver(function () {
    physicalTick();
    hiddenDiv = null;
  }).observe(hiddenDiv, {
    attributes: true
  });
  hiddenDiv.setAttribute('i', '1');
} : // No support for setImmediate or MutationObserver. No worry, setTimeout is only called
// once time. Every tick that follows will be our emulated micro tick.
// Could have uses setTimeout.bind(null, 0, physicalTick) if it wasnt for that FF13 and below has a bug 
function () {
  setTimeout(physicalTick, 0);
}; // Configurable through Promise.scheduler.
// Don't export because it would be unsafe to let unknown
// code call it unless they do try..catch within their callback.
// This function can be retrieved through getter of Promise.scheduler though,
// but users must not do Promise.scheduler = myFuncThatThrowsException

var asap$1 = function (callback, args) {
  microtickQueue.push([callback, args]);

  if (needsNewPhysicalTick) {
    schedulePhysicalTick();
    needsNewPhysicalTick = false;
  }
};

var isOutsideMicroTick = true;
var needsNewPhysicalTick = true;
var unhandledErrors = [];
var rejectingErrors = [];
var currentFulfiller = null;
var rejectionMapper = mirror; // Remove in next major when removing error mapping of DOMErrors and DOMExceptions

var globalPSD = {
  id: 'global',
  global: true,
  ref: 0,
  unhandleds: [],
  onunhandled: globalError,
  pgp: false,
  env: {},
  finalize: function () {
    this.unhandleds.forEach(function (uh) {
      try {
        globalError(uh[0], uh[1]);
      } catch (e) {}
    });
  }
};
var PSD = globalPSD;
var microtickQueue = []; // Callbacks to call in this or next physical tick.

var numScheduledCalls = 0; // Number of listener-calls left to do in this physical tick.

var tickFinalizers = []; // Finalizers to call when there are no more async calls scheduled within current physical tick.

function Promise(fn) {
  if (_typeof(this) !== 'object') throw new TypeError('Promises must be constructed via new');
  this._listeners = [];
  this.onuncatched = nop; // Deprecate in next major. Not needed. Better to use global error handler.
  // A library may set `promise._lib = true;` after promise is created to make resolve() or reject()
  // execute the microtask engine implicitely within the call to resolve() or reject().
  // To remain A+ compliant, a library must only set `_lib=true` if it can guarantee that the stack
  // only contains library code when calling resolve() or reject().
  // RULE OF THUMB: ONLY set _lib = true for promises explicitely resolving/rejecting directly from
  // global scope (event handler, timer etc)!

  this._lib = false; // Current async scope

  var psd = this._PSD = PSD;

  if (debug) {
    this._stackHolder = getErrorWithStack();
    this._prev = null;
    this._numPrev = 0; // Number of previous promises (for long stacks)
  }

  if (typeof fn !== 'function') {
    if (fn !== INTERNAL) throw new TypeError('Not a function'); // Private constructor (INTERNAL, state, value).
    // Used internally by Promise.resolve() and Promise.reject().

    this._state = arguments[1];
    this._value = arguments[2];
    if (this._state === false) handleRejection(this, this._value); // Map error, set stack and addPossiblyUnhandledError().

    return;
  }

  this._state = null; // null (=pending), false (=rejected) or true (=resolved)

  this._value = null; // error or result

  ++psd.ref; // Refcounting current scope

  executePromiseTask(this, fn);
} // Prepare a property descriptor to put onto Promise.prototype.then


var thenProp = {
  get: function () {
    var psd = PSD,
        microTaskId = totalEchoes;

    function then(onFulfilled, onRejected) {
      var _this = this;

      var possibleAwait = !psd.global && (psd !== PSD || microTaskId !== totalEchoes);
      if (possibleAwait) decrementExpectedAwaits();
      var rv = new Promise(function (resolve, reject) {
        propagateToListener(_this, new Listener(nativeAwaitCompatibleWrap(onFulfilled, psd, possibleAwait), nativeAwaitCompatibleWrap(onRejected, psd, possibleAwait), resolve, reject, psd));
      });
      debug && linkToPreviousPromise(rv, this);
      return rv;
    }

    then.prototype = INTERNAL; // For idempotense, see setter below.

    return then;
  },
  // Be idempotent and allow another framework (such as zone.js or another instance of a Dexie.Promise module) to replace Promise.prototype.then
  // and when that framework wants to restore the original property, we must identify that and restore the original property descriptor.
  set: function (value) {
    setProp(this, 'then', value && value.prototype === INTERNAL ? thenProp : // Restore to original property descriptor.
    {
      get: function () {
        return value; // Getter returning provided value (behaves like value is just changed)
      },
      set: thenProp.set // Keep a setter that is prepared to restore original.

    });
  }
};
props(Promise.prototype, {
  then: thenProp,
  _then: function (onFulfilled, onRejected) {
    // A little tinier version of then() that don't have to create a resulting promise.
    propagateToListener(this, new Listener(null, null, onFulfilled, onRejected, PSD));
  },
  catch: function (onRejected) {
    if (arguments.length === 1) return this.then(null, onRejected); // First argument is the Error type to catch

    var type = arguments[0],
        handler = arguments[1];
    return typeof type === 'function' ? this.then(null, function (err) {
      // Catching errors by its constructor type (similar to java / c++ / c#)
      // Sample: promise.catch(TypeError, function (e) { ... });
      return err instanceof type ? handler(err) : PromiseReject(err);
    }) : this.then(null, function (err) {
      // Catching errors by the error.name property. Makes sense for indexedDB where error type
      // is always DOMError but where e.name tells the actual error type.
      // Sample: promise.catch('ConstraintError', function (e) { ... });
      return err && err.name === type ? handler(err) : PromiseReject(err);
    });
  },
  finally: function (onFinally) {
    return this.then(function (value) {
      onFinally();
      return value;
    }, function (err) {
      onFinally();
      return PromiseReject(err);
    });
  },
  stack: {
    get: function () {
      if (this._stack) return this._stack;

      try {
        stack_being_generated = true;
        var stacks = getStack(this, [], MAX_LONG_STACKS);
        var stack = stacks.join("\nFrom previous: ");
        if (this._state !== null) this._stack = stack; // Stack may be updated on reject.

        return stack;
      } finally {
        stack_being_generated = false;
      }
    }
  },
  timeout: function (ms, msg) {
    var _this = this;

    return ms < Infinity ? new Promise(function (resolve, reject) {
      var handle = setTimeout(function () {
        return reject(new exceptions.Timeout(msg));
      }, ms);

      _this.then(resolve, reject).finally(clearTimeout.bind(null, handle));
    }) : this;
  }
});
if (typeof Symbol !== 'undefined' && Symbol.toStringTag) setProp(Promise.prototype, Symbol.toStringTag, 'Promise'); // Now that Promise.prototype is defined, we have all it takes to set globalPSD.env.
// Environment globals snapshotted on leaving global zone

globalPSD.env = snapShot();

function Listener(onFulfilled, onRejected, resolve, reject, zone) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.resolve = resolve;
  this.reject = reject;
  this.psd = zone;
} // Promise Static Properties


props(Promise, {
  all: function () {
    var values = getArrayOf.apply(null, arguments) // Supports iterables, implicit arguments and array-like.
    .map(onPossibleParallellAsync); // Handle parallell async/awaits 

    return new Promise(function (resolve, reject) {
      if (values.length === 0) resolve([]);
      var remaining = values.length;
      values.forEach(function (a, i) {
        return Promise.resolve(a).then(function (x) {
          values[i] = x;
          if (! --remaining) resolve(values);
        }, reject);
      });
    });
  },
  resolve: function (value) {
    if (value instanceof Promise) return value;
    if (value && typeof value.then === 'function') return new Promise(function (resolve, reject) {
      value.then(resolve, reject);
    });
    var rv = new Promise(INTERNAL, true, value);
    linkToPreviousPromise(rv, currentFulfiller);
    return rv;
  },
  reject: PromiseReject,
  race: function () {
    var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
    return new Promise(function (resolve, reject) {
      values.map(function (value) {
        return Promise.resolve(value).then(resolve, reject);
      });
    });
  },
  PSD: {
    get: function () {
      return PSD;
    },
    set: function (value) {
      return PSD = value;
    }
  },
  //totalEchoes: {get: ()=>totalEchoes},
  //task: {get: ()=>task},
  newPSD: newScope,
  usePSD: usePSD,
  scheduler: {
    get: function () {
      return asap$1;
    },
    set: function (value) {
      asap$1 = value;
    }
  },
  rejectionMapper: {
    get: function () {
      return rejectionMapper;
    },
    set: function (value) {
      rejectionMapper = value;
    } // Map reject failures

  },
  follow: function (fn, zoneProps) {
    return new Promise(function (resolve, reject) {
      return newScope(function (resolve, reject) {
        var psd = PSD;
        psd.unhandleds = []; // For unhandled standard- or 3rd party Promises. Checked at psd.finalize()

        psd.onunhandled = reject; // Triggered directly on unhandled promises of this library.

        psd.finalize = callBoth(function () {
          var _this = this; // Unhandled standard or 3rd part promises are put in PSD.unhandleds and
          // examined upon scope completion while unhandled rejections in this Promise
          // will trigger directly through psd.onunhandled


          run_at_end_of_this_or_next_physical_tick(function () {
            _this.unhandleds.length === 0 ? resolve() : reject(_this.unhandleds[0]);
          });
        }, psd.finalize);
        fn();
      }, zoneProps, resolve, reject);
    });
  }
});
/**
* Take a potentially misbehaving resolver function and make sure
* onFulfilled and onRejected are only called once.
*
* Makes no guarantees about asynchrony.
*/

function executePromiseTask(promise, fn) {
  // Promise Resolution Procedure:
  // https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
  try {
    fn(function (value) {
      if (promise._state !== null) return; // Already settled

      if (value === promise) throw new TypeError('A promise cannot be resolved with itself.');
      var shouldExecuteTick = promise._lib && beginMicroTickScope();

      if (value && typeof value.then === 'function') {
        executePromiseTask(promise, function (resolve, reject) {
          value instanceof Promise ? value._then(resolve, reject) : value.then(resolve, reject);
        });
      } else {
        promise._state = true;
        promise._value = value;
        propagateAllListeners(promise);
      }

      if (shouldExecuteTick) endMicroTickScope();
    }, handleRejection.bind(null, promise)); // If Function.bind is not supported. Exception is handled in catch below
  } catch (ex) {
    handleRejection(promise, ex);
  }
}

function handleRejection(promise, reason) {
  rejectingErrors.push(reason);
  if (promise._state !== null) return;
  var shouldExecuteTick = promise._lib && beginMicroTickScope();
  reason = rejectionMapper(reason);
  promise._state = false;
  promise._value = reason;
  debug && reason !== null && _typeof(reason) === 'object' && !reason._promise && tryCatch(function () {
    var origProp = getPropertyDescriptor(reason, "stack");
    reason._promise = promise;
    setProp(reason, "stack", {
      get: function () {
        return stack_being_generated ? origProp && (origProp.get ? origProp.get.apply(reason) : origProp.value) : promise.stack;
      }
    });
  }); // Add the failure to a list of possibly uncaught errors

  addPossiblyUnhandledError(promise);
  propagateAllListeners(promise);
  if (shouldExecuteTick) endMicroTickScope();
}

function propagateAllListeners(promise) {
  //debug && linkToPreviousPromise(promise);
  var listeners = promise._listeners;
  promise._listeners = [];

  for (var i = 0, len = listeners.length; i < len; ++i) {
    propagateToListener(promise, listeners[i]);
  }

  var psd = promise._PSD;
  --psd.ref || psd.finalize(); // if psd.ref reaches zero, call psd.finalize();

  if (numScheduledCalls === 0) {
    // If numScheduledCalls is 0, it means that our stack is not in a callback of a scheduled call,
    // and that no deferreds where listening to this rejection or success.
    // Since there is a risk that our stack can contain application code that may
    // do stuff after this code is finished that may generate new calls, we cannot
    // call finalizers here.
    ++numScheduledCalls;
    asap$1(function () {
      if (--numScheduledCalls === 0) finalizePhysicalTick(); // Will detect unhandled errors
    }, []);
  }
}

function propagateToListener(promise, listener) {
  if (promise._state === null) {
    promise._listeners.push(listener);

    return;
  }

  var cb = promise._state ? listener.onFulfilled : listener.onRejected;

  if (cb === null) {
    // This Listener doesnt have a listener for the event being triggered (onFulfilled or onReject) so lets forward the event to any eventual listeners on the Promise instance returned by then() or catch()
    return (promise._state ? listener.resolve : listener.reject)(promise._value);
  }

  ++listener.psd.ref;
  ++numScheduledCalls;
  asap$1(callListener, [cb, promise, listener]);
}

function callListener(cb, promise, listener) {
  try {
    // Set static variable currentFulfiller to the promise that is being fullfilled,
    // so that we connect the chain of promises (for long stacks support)
    currentFulfiller = promise; // Call callback and resolve our listener with it's return value.

    var ret,
        value = promise._value;

    if (promise._state) {
      // cb is onResolved
      ret = cb(value);
    } else {
      // cb is onRejected
      if (rejectingErrors.length) rejectingErrors = [];
      ret = cb(value);
      if (rejectingErrors.indexOf(value) === -1) markErrorAsHandled(promise); // Callback didnt do Promise.reject(err) nor reject(err) onto another promise.
    }

    listener.resolve(ret);
  } catch (e) {
    // Exception thrown in callback. Reject our listener.
    listener.reject(e);
  } finally {
    // Restore env and currentFulfiller.
    currentFulfiller = null;
    if (--numScheduledCalls === 0) finalizePhysicalTick();
    --listener.psd.ref || listener.psd.finalize();
  }
}

function getStack(promise, stacks, limit) {
  if (stacks.length === limit) return stacks;
  var stack = "";

  if (promise._state === false) {
    var failure = promise._value,
        errorName,
        message;

    if (failure != null) {
      errorName = failure.name || "Error";
      message = failure.message || failure;
      stack = prettyStack(failure, 0);
    } else {
      errorName = failure; // If error is undefined or null, show that.

      message = "";
    }

    stacks.push(errorName + (message ? ": " + message : "") + stack);
  }

  if (debug) {
    stack = prettyStack(promise._stackHolder, 2);
    if (stack && stacks.indexOf(stack) === -1) stacks.push(stack);
    if (promise._prev) getStack(promise._prev, stacks, limit);
  }

  return stacks;
}

function linkToPreviousPromise(promise, prev) {
  // Support long stacks by linking to previous completed promise.
  var numPrev = prev ? prev._numPrev + 1 : 0;

  if (numPrev < LONG_STACKS_CLIP_LIMIT) {
    promise._prev = prev;
    promise._numPrev = numPrev;
  }
}
/* The callback to schedule with setImmediate() or setTimeout().
   It runs a virtual microtick and executes any callback registered in microtickQueue.
 */


function physicalTick() {
  beginMicroTickScope() && endMicroTickScope();
}

function beginMicroTickScope() {
  var wasRootExec = isOutsideMicroTick;
  isOutsideMicroTick = false;
  needsNewPhysicalTick = false;
  return wasRootExec;
}
/* Executes micro-ticks without doing try..catch.
   This can be possible because we only use this internally and
   the registered functions are exception-safe (they do try..catch
   internally before calling any external method). If registering
   functions in the microtickQueue that are not exception-safe, this
   would destroy the framework and make it instable. So we don't export
   our asap method.
*/


function endMicroTickScope() {
  var callbacks, i, l;

  do {
    while (microtickQueue.length > 0) {
      callbacks = microtickQueue;
      microtickQueue = [];
      l = callbacks.length;

      for (i = 0; i < l; ++i) {
        var item = callbacks[i];
        item[0].apply(null, item[1]);
      }
    }
  } while (microtickQueue.length > 0);

  isOutsideMicroTick = true;
  needsNewPhysicalTick = true;
}

function finalizePhysicalTick() {
  var unhandledErrs = unhandledErrors;
  unhandledErrors = [];
  unhandledErrs.forEach(function (p) {
    p._PSD.onunhandled.call(null, p._value, p);
  });
  var finalizers = tickFinalizers.slice(0); // Clone first because finalizer may remove itself from list.

  var i = finalizers.length;

  while (i) {
    finalizers[--i]();
  }
}

function run_at_end_of_this_or_next_physical_tick(fn) {
  function finalizer() {
    fn();
    tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
  }

  tickFinalizers.push(finalizer);
  ++numScheduledCalls;
  asap$1(function () {
    if (--numScheduledCalls === 0) finalizePhysicalTick();
  }, []);
}

function addPossiblyUnhandledError(promise) {
  // Only add to unhandledErrors if not already there. The first one to add to this list
  // will be upon the first rejection so that the root cause (first promise in the
  // rejection chain) is the one listed.
  if (!unhandledErrors.some(function (p) {
    return p._value === promise._value;
  })) unhandledErrors.push(promise);
}

function markErrorAsHandled(promise) {
  // Called when a reject handled is actually being called.
  // Search in unhandledErrors for any promise whos _value is this promise_value (list
  // contains only rejected promises, and only one item per error)
  var i = unhandledErrors.length;

  while (i) {
    if (unhandledErrors[--i]._value === promise._value) {
      // Found a promise that failed with this same error object pointer,
      // Remove that since there is a listener that actually takes care of it.
      unhandledErrors.splice(i, 1);
      return;
    }
  }
}

function PromiseReject(reason) {
  return new Promise(INTERNAL, false, reason);
}

function wrap(fn, errorCatcher) {
  var psd = PSD;
  return function () {
    var wasRootExec = beginMicroTickScope(),
        outerScope = PSD;

    try {
      switchToZone(psd, true);
      return fn.apply(this, arguments);
    } catch (e) {
      errorCatcher && errorCatcher(e);
    } finally {
      switchToZone(outerScope, false);
      if (wasRootExec) endMicroTickScope();
    }
  };
} //
// variables used for native await support
//


var task = {
  awaits: 0,
  echoes: 0,
  id: 0
}; // The ongoing macro-task when using zone-echoing.

var taskCounter = 0; // ID counter for macro tasks.

var zoneStack = []; // Stack of left zones to restore asynchronically.

var zoneEchoes = 0; // zoneEchoes is a must in order to persist zones between native await expressions.

var totalEchoes = 0; // ID counter for micro-tasks. Used to detect possible native await in our Promise.prototype.then.

var zone_id_counter = 0;

function newScope(fn, props$$1, a1, a2) {
  var parent = PSD,
      psd = Object.create(parent);
  psd.parent = parent;
  psd.ref = 0;
  psd.global = false;
  psd.id = ++zone_id_counter; // Prepare for promise patching (done in usePSD):

  var globalEnv = globalPSD.env;
  psd.env = patchGlobalPromise ? {
    Promise: Promise,
    PromiseProp: {
      value: Promise,
      configurable: true,
      writable: true
    },
    all: Promise.all,
    race: Promise.race,
    resolve: Promise.resolve,
    reject: Promise.reject,
    nthen: getPatchedPromiseThen(globalEnv.nthen, psd),
    gthen: getPatchedPromiseThen(globalEnv.gthen, psd) // global then

  } : {};
  if (props$$1) extend(psd, props$$1); // unhandleds and onunhandled should not be specifically set here.
  // Leave them on parent prototype.
  // unhandleds.push(err) will push to parent's prototype
  // onunhandled() will call parents onunhandled (with this scope's this-pointer though!)

  ++parent.ref;

  psd.finalize = function () {
    --this.parent.ref || this.parent.finalize();
  };

  var rv = usePSD(psd, fn, a1, a2);
  if (psd.ref === 0) psd.finalize();
  return rv;
} // Function to call if scopeFunc returns NativePromise
// Also for each NativePromise in the arguments to Promise.all()


function incrementExpectedAwaits() {
  if (!task.id) task.id = ++taskCounter;
  ++task.awaits;
  task.echoes += ZONE_ECHO_LIMIT;
  return task.id;
} // Function to call when 'then' calls back on a native promise where onAwaitExpected() had been called.
// Also call this when a native await calls then method on a promise. In that case, don't supply
// sourceTaskId because we already know it refers to current task.


function decrementExpectedAwaits(sourceTaskId) {
  if (!task.awaits || sourceTaskId && sourceTaskId !== task.id) return;
  if (--task.awaits === 0) task.id = 0;
  task.echoes = task.awaits * ZONE_ECHO_LIMIT; // Will reset echoes to 0 if awaits is 0.
} // Call from Promise.all() and Promise.race()


function onPossibleParallellAsync(possiblePromise) {
  if (task.echoes && possiblePromise && possiblePromise.constructor === NativePromise) {
    incrementExpectedAwaits();
    return possiblePromise.then(function (x) {
      decrementExpectedAwaits();
      return x;
    }, function (e) {
      decrementExpectedAwaits();
      return rejection(e);
    });
  }

  return possiblePromise;
}

function zoneEnterEcho(targetZone) {
  ++totalEchoes;

  if (!task.echoes || --task.echoes === 0) {
    task.echoes = task.id = 0; // Cancel zone echoing.
  }

  zoneStack.push(PSD);
  switchToZone(targetZone, true);
}

function zoneLeaveEcho() {
  var zone = zoneStack[zoneStack.length - 1];
  zoneStack.pop();
  switchToZone(zone, false);
}

function switchToZone(targetZone, bEnteringZone) {
  var currentZone = PSD;

  if (bEnteringZone ? task.echoes && (!zoneEchoes++ || targetZone !== PSD) : zoneEchoes && (! --zoneEchoes || targetZone !== PSD)) {
    // Enter or leave zone asynchronically as well, so that tasks initiated during current tick
    // will be surrounded by the zone when they are invoked.
    enqueueNativeMicroTask(bEnteringZone ? zoneEnterEcho.bind(null, targetZone) : zoneLeaveEcho);
  }

  if (targetZone === PSD) return;
  PSD = targetZone; // The actual zone switch occurs at this line.
  // Snapshot on every leave from global zone.

  if (currentZone === globalPSD) globalPSD.env = snapShot();

  if (patchGlobalPromise) {
    // Let's patch the global and native Promises (may be same or may be different)
    var GlobalPromise = globalPSD.env.Promise; // Swich environments (may be PSD-zone or the global zone. Both apply.)

    var targetEnv = targetZone.env; // Change Promise.prototype.then for native and global Promise (they MAY differ on polyfilled environments, but both can be accessed)
    // Must be done on each zone change because the patched method contains targetZone in its closure.

    nativePromiseProto.then = targetEnv.nthen;
    GlobalPromise.prototype.then = targetEnv.gthen;

    if (currentZone.global || targetZone.global) {
      // Leaving or entering global zone. It's time to patch / restore global Promise.
      // Set this Promise to window.Promise so that transiled async functions will work on Firefox, Safari and IE, as well as with Zonejs and angular.
      Object.defineProperty(_global, 'Promise', targetEnv.PromiseProp); // Support Promise.all() etc to work indexedDB-safe also when people are including es6-promise as a module (they might
      // not be accessing global.Promise but a local reference to it)

      GlobalPromise.all = targetEnv.all;
      GlobalPromise.race = targetEnv.race;
      GlobalPromise.resolve = targetEnv.resolve;
      GlobalPromise.reject = targetEnv.reject;
    }
  }
}

function snapShot() {
  var GlobalPromise = _global.Promise;
  return patchGlobalPromise ? {
    Promise: GlobalPromise,
    PromiseProp: Object.getOwnPropertyDescriptor(_global, "Promise"),
    all: GlobalPromise.all,
    race: GlobalPromise.race,
    resolve: GlobalPromise.resolve,
    reject: GlobalPromise.reject,
    nthen: nativePromiseProto.then,
    gthen: GlobalPromise.prototype.then
  } : {};
}

function usePSD(psd, fn, a1, a2, a3) {
  var outerScope = PSD;

  try {
    switchToZone(psd, true);
    return fn(a1, a2, a3);
  } finally {
    switchToZone(outerScope, false);
  }
}

function enqueueNativeMicroTask(job) {
  //
  // Precondition: nativePromiseThen !== undefined
  //
  nativePromiseThen.call(resolvedNativePromise, job);
}

function nativeAwaitCompatibleWrap(fn, zone, possibleAwait) {
  return typeof fn !== 'function' ? fn : function () {
    var outerZone = PSD;
    if (possibleAwait) incrementExpectedAwaits();
    switchToZone(zone, true);

    try {
      return fn.apply(this, arguments);
    } finally {
      switchToZone(outerZone, false);
    }
  };
}

function getPatchedPromiseThen(origThen, zone) {
  return function (onResolved, onRejected) {
    return origThen.call(this, nativeAwaitCompatibleWrap(onResolved, zone, false), nativeAwaitCompatibleWrap(onRejected, zone, false));
  };
}

var UNHANDLEDREJECTION = "unhandledrejection";

function globalError(err, promise) {
  var rv;

  try {
    rv = promise.onuncatched(err);
  } catch (e) {}

  if (rv !== false) try {
    var event,
        eventData = {
      promise: promise,
      reason: err
    };

    if (_global.document && document.createEvent) {
      event = document.createEvent('Event');
      event.initEvent(UNHANDLEDREJECTION, true, true);
      extend(event, eventData);
    } else if (_global.CustomEvent) {
      event = new CustomEvent(UNHANDLEDREJECTION, {
        detail: eventData
      });
      extend(event, eventData);
    }

    if (event && _global.dispatchEvent) {
      dispatchEvent(event);
      if (!_global.PromiseRejectionEvent && _global.onunhandledrejection) // No native support for PromiseRejectionEvent but user has set window.onunhandledrejection. Manually call it.
        try {
          _global.onunhandledrejection(event);
        } catch (_) {}
    }

    if (!event.defaultPrevented) {
      console.warn("Unhandled rejection: " + (err.stack || err));
    }
  } catch (e) {}
}

var rejection = Promise.reject;

function Events(ctx) {
  var evs = {};

  var rv = function (eventName, subscriber) {
    if (subscriber) {
      // Subscribe. If additional arguments than just the subscriber was provided, forward them as well.
      var i = arguments.length,
          args = new Array(i - 1);

      while (--i) {
        args[i - 1] = arguments[i];
      }

      evs[eventName].subscribe.apply(null, args);
      return ctx;
    } else if (typeof eventName === 'string') {
      // Return interface allowing to fire or unsubscribe from event
      return evs[eventName];
    }
  };

  rv.addEventType = add;

  for (var i = 1, l = arguments.length; i < l; ++i) {
    add(arguments[i]);
  }

  return rv;

  function add(eventName, chainFunction, defaultFunction) {
    if (_typeof(eventName) === 'object') return addConfiguredEvents(eventName);
    if (!chainFunction) chainFunction = reverseStoppableEventChain;
    if (!defaultFunction) defaultFunction = nop;
    var context = {
      subscribers: [],
      fire: defaultFunction,
      subscribe: function (cb) {
        if (context.subscribers.indexOf(cb) === -1) {
          context.subscribers.push(cb);
          context.fire = chainFunction(context.fire, cb);
        }
      },
      unsubscribe: function (cb) {
        context.subscribers = context.subscribers.filter(function (fn) {
          return fn !== cb;
        });
        context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
      }
    };
    evs[eventName] = rv[eventName] = context;
    return context;
  }

  function addConfiguredEvents(cfg) {
    // events(this, {reading: [functionChain, nop]});
    keys(cfg).forEach(function (eventName) {
      var args = cfg[eventName];

      if (isArray(args)) {
        add(eventName, cfg[eventName][0], cfg[eventName][1]);
      } else if (args === 'asap') {
        // Rather than approaching event subscription using a functional approach, we here do it in a for-loop where subscriber is executed in its own stack
        // enabling that any exception that occur wont disturb the initiator and also not nescessary be catched and forgotten.
        var context = add(eventName, mirror, function fire() {
          // Optimazation-safe cloning of arguments into args.
          var i = arguments.length,
              args = new Array(i);

          while (i--) {
            args[i] = arguments[i];
          } // All each subscriber:


          context.subscribers.forEach(function (fn) {
            asap(function fireEvent() {
              fn.apply(null, args);
            });
          });
        });
      } else throw new exceptions.InvalidArgument("Invalid event config");
    });
  }
}
/*
 * Dexie.js - a minimalistic wrapper for IndexedDB
 * ===============================================
 *
 * Copyright (c) 2014-2017 David Fahlander
 *
 * Version {version}, {date}
 *
 * http://dexie.org
 *
 * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/LICENSE-2.0
 *
 */


var DEXIE_VERSION = '{version}';
var maxString = String.fromCharCode(65535);

var maxKey = function () {
  try {
    IDBKeyRange.only([[]]);
    return [[]];
  } catch (e) {
    return maxString;
  }
}();

var minKey = -Infinity;
var INVALID_KEY_ARGUMENT = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
var STRING_EXPECTED = "String expected.";
var connections = [];
var isIEOrEdge = typeof navigator !== 'undefined' && /(MSIE|Trident|Edge)/.test(navigator.userAgent);
var hasIEDeleteObjectStoreBug = isIEOrEdge;
var hangsOnDeleteLargeKeyRange = isIEOrEdge;

var dexieStackFrameFilter = function (frame) {
  return !/(dexie\.js|dexie\.min\.js)/.test(frame);
};

var dbNamesDB; // Global database for backing Dexie.getDatabaseNames() on browser without indexedDB.webkitGetDatabaseNames() 
// Init debug

setDebug(debug, dexieStackFrameFilter);

function Dexie(dbName, options) {
  /// <param name="options" type="Object" optional="true">Specify only if you wich to control which addons that should run on this instance</param>
  var deps = Dexie.dependencies;
  var opts = extend({
    // Default Options
    addons: Dexie.addons,
    autoOpen: true,
    indexedDB: deps.indexedDB,
    IDBKeyRange: deps.IDBKeyRange // Backend IDBKeyRange api. Default to browser env.

  }, options);
  var addons = opts.addons,
      autoOpen = opts.autoOpen,
      indexedDB = opts.indexedDB,
      IDBKeyRange = opts.IDBKeyRange;
  var globalSchema = this._dbSchema = {};
  var versions = [];
  var dbStoreNames = [];
  var allTables = {}; ///<var type="IDBDatabase" />

  var idbdb = null; // Instance of IDBDatabase

  var dbOpenError = null;
  var isBeingOpened = false;
  var onReadyBeingFired = null;
  var openComplete = false;
  var READONLY = "readonly",
      READWRITE = "readwrite";
  var db = this;
  var dbReadyResolve,
      dbReadyPromise = new Promise(function (resolve) {
    dbReadyResolve = resolve;
  }),
      cancelOpen,
      openCanceller = new Promise(function (_, reject) {
    cancelOpen = reject;
  });
  var autoSchema = true;
  var hasNativeGetDatabaseNames = !!getNativeGetDatabaseNamesFn(indexedDB),
      hasGetAll;

  function init() {
    // Default subscribers to "versionchange" and "blocked".
    // Can be overridden by custom handlers. If custom handlers return false, these default
    // behaviours will be prevented.
    db.on("versionchange", function (ev) {
      // Default behavior for versionchange event is to close database connection.
      // Caller can override this behavior by doing db.on("versionchange", function(){ return false; });
      // Let's not block the other window from making it's delete() or open() call.
      // NOTE! This event is never fired in IE,Edge or Safari.
      if (ev.newVersion > 0) console.warn("Another connection wants to upgrade database '" + db.name + "'. Closing db now to resume the upgrade.");else console.warn("Another connection wants to delete database '" + db.name + "'. Closing db now to resume the delete request.");
      db.close(); // In many web applications, it would be recommended to force window.reload()
      // when this event occurs. To do that, subscribe to the versionchange event
      // and call window.location.reload(true) if ev.newVersion > 0 (not a deletion)
      // The reason for this is that your current web app obviously has old schema code that needs
      // to be updated. Another window got a newer version of the app and needs to upgrade DB but
      // your window is blocking it unless we close it here.
    });
    db.on("blocked", function (ev) {
      if (!ev.newVersion || ev.newVersion < ev.oldVersion) console.warn("Dexie.delete('" + db.name + "') was blocked");else console.warn("Upgrade '" + db.name + "' blocked by other connection holding version " + ev.oldVersion / 10);
    });
  } //
  //
  //
  // ------------------------- Versioning Framework---------------------------
  //
  //
  //


  this.version = function (versionNumber) {
    /// <param name="versionNumber" type="Number"></param>
    /// <returns type="Version"></returns>
    if (idbdb || isBeingOpened) throw new exceptions.Schema("Cannot add version when database is open");
    this.verno = Math.max(this.verno, versionNumber);
    var versionInstance = versions.filter(function (v) {
      return v._cfg.version === versionNumber;
    })[0];
    if (versionInstance) return versionInstance;
    versionInstance = new Version(versionNumber);
    versions.push(versionInstance);
    versions.sort(lowerVersionFirst); // Disable autoschema mode, as at least one version is specified.

    autoSchema = false;
    return versionInstance;
  };

  function Version(versionNumber) {
    this._cfg = {
      version: versionNumber,
      storesSource: null,
      dbschema: {},
      tables: {},
      contentUpgrade: null
    };
    this.stores({}); // Derive earlier schemas by default.
  }

  extend(Version.prototype, {
    stores: function (stores) {
      /// <summary>
      ///   Defines the schema for a particular version
      /// </summary>
      /// <param name="stores" type="Object">
      /// Example: <br/>
      ///   {users: "id++,first,last,&amp;username,*email", <br/>
      ///   passwords: "id++,&amp;username"}<br/>
      /// <br/>
      /// Syntax: {Table: "[primaryKey][++],[&amp;][*]index1,[&amp;][*]index2,..."}<br/><br/>
      /// Special characters:<br/>
      ///  "&amp;"  means unique key, <br/>
      ///  "*"  means value is multiEntry, <br/>
      ///  "++" means auto-increment and only applicable for primary key <br/>
      /// </param>
      this._cfg.storesSource = this._cfg.storesSource ? extend(this._cfg.storesSource, stores) : stores; // Derive stores from earlier versions if they are not explicitely specified as null or a new syntax.

      var storesSpec = {};
      versions.forEach(function (version) {
        extend(storesSpec, version._cfg.storesSource);
      });
      var dbschema = this._cfg.dbschema = {};

      this._parseStoresSpec(storesSpec, dbschema); // Update the latest schema to this version
      // Update API


      globalSchema = db._dbSchema = dbschema;
      removeTablesApi([allTables, db, Transaction.prototype]); // Keep Transaction.prototype even though it should be depr.

      setApiOnPlace([allTables, db, Transaction.prototype, this._cfg.tables], keys(dbschema), dbschema);
      dbStoreNames = keys(dbschema);
      return this;
    },
    upgrade: function (upgradeFunction) {
      this._cfg.contentUpgrade = upgradeFunction;
      return this;
    },
    _parseStoresSpec: function (stores, outSchema) {
      keys(stores).forEach(function (tableName) {
        if (stores[tableName] !== null) {
          var instanceTemplate = {};
          var indexes = parseIndexSyntax(stores[tableName]);
          var primKey = indexes.shift();
          if (primKey.multi) throw new exceptions.Schema("Primary key cannot be multi-valued");
          if (primKey.keyPath) setByKeyPath(instanceTemplate, primKey.keyPath, primKey.auto ? 0 : primKey.keyPath);
          indexes.forEach(function (idx) {
            if (idx.auto) throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
            if (!idx.keyPath) throw new exceptions.Schema("Index must have a name and cannot be an empty string");
            setByKeyPath(instanceTemplate, idx.keyPath, idx.compound ? idx.keyPath.map(function () {
              return "";
            }) : "");
          });
          outSchema[tableName] = new TableSchema(tableName, primKey, indexes, instanceTemplate);
        }
      });
    }
  });

  function runUpgraders(oldVersion, idbtrans, reject) {
    var trans = db._createTransaction(READWRITE, dbStoreNames, globalSchema);

    trans.create(idbtrans);

    trans._completion.catch(reject);

    var rejectTransaction = trans._reject.bind(trans);

    newScope(function () {
      PSD.trans = trans;

      if (oldVersion === 0) {
        // Create tables:
        keys(globalSchema).forEach(function (tableName) {
          createTable(idbtrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
        });
        Promise.follow(function () {
          return db.on.populate.fire(trans);
        }).catch(rejectTransaction);
      } else updateTablesAndIndexes(oldVersion, trans, idbtrans).catch(rejectTransaction);
    });
  }

  function updateTablesAndIndexes(oldVersion, trans, idbtrans) {
    // Upgrade version to version, step-by-step from oldest to newest version.
    // Each transaction object will contain the table set that was current in that version (but also not-yet-deleted tables from its previous version)
    var queue = [];
    var oldVersionStruct = versions.filter(function (version) {
      return version._cfg.version === oldVersion;
    })[0];
    if (!oldVersionStruct) throw new exceptions.Upgrade("Dexie specification of currently installed DB version is missing");
    globalSchema = db._dbSchema = oldVersionStruct._cfg.dbschema;
    var anyContentUpgraderHasRun = false;
    var versToRun = versions.filter(function (v) {
      return v._cfg.version > oldVersion;
    });
    versToRun.forEach(function (version) {
      /// <param name="version" type="Version"></param>
      queue.push(function () {
        var oldSchema = globalSchema;
        var newSchema = version._cfg.dbschema;
        adjustToExistingIndexNames(oldSchema, idbtrans);
        adjustToExistingIndexNames(newSchema, idbtrans);
        globalSchema = db._dbSchema = newSchema;
        var diff = getSchemaDiff(oldSchema, newSchema); // Add tables           

        diff.add.forEach(function (tuple) {
          createTable(idbtrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
        }); // Change tables

        diff.change.forEach(function (change) {
          if (change.recreate) {
            throw new exceptions.Upgrade("Not yet support for changing primary key");
          } else {
            var store = idbtrans.objectStore(change.name); // Add indexes

            change.add.forEach(function (idx) {
              addIndex(store, idx);
            }); // Update indexes

            change.change.forEach(function (idx) {
              store.deleteIndex(idx.name);
              addIndex(store, idx);
            }); // Delete indexes

            change.del.forEach(function (idxName) {
              store.deleteIndex(idxName);
            });
          }
        });

        if (version._cfg.contentUpgrade) {
          anyContentUpgraderHasRun = true;
          return Promise.follow(function () {
            version._cfg.contentUpgrade(trans);
          });
        }
      });
      queue.push(function (idbtrans) {
        if (!anyContentUpgraderHasRun || !hasIEDeleteObjectStoreBug) {
          var newSchema = version._cfg.dbschema; // Delete old tables

          deleteRemovedTables(newSchema, idbtrans);
        }
      });
    }); // Now, create a queue execution engine

    function runQueue() {
      return queue.length ? Promise.resolve(queue.shift()(trans.idbtrans)).then(runQueue) : Promise.resolve();
    }

    return runQueue().then(function () {
      createMissingTables(globalSchema, idbtrans); // At last, make sure to create any missing tables. (Needed by addons that add stores to DB without specifying version)
    });
  }

  function getSchemaDiff(oldSchema, newSchema) {
    var diff = {
      del: [],
      add: [],
      change: [] // Array of {name: tableName, recreate: newDefinition, del: delIndexNames, add: newIndexDefs, change: changedIndexDefs}

    };

    for (var table in oldSchema) {
      if (!newSchema[table]) diff.del.push(table);
    }

    for (table in newSchema) {
      var oldDef = oldSchema[table],
          newDef = newSchema[table];

      if (!oldDef) {
        diff.add.push([table, newDef]);
      } else {
        var change = {
          name: table,
          def: newDef,
          recreate: false,
          del: [],
          add: [],
          change: []
        };

        if (oldDef.primKey.src !== newDef.primKey.src) {
          // Primary key has changed. Remove and re-add table.
          change.recreate = true;
          diff.change.push(change);
        } else {
          // Same primary key. Just find out what differs:
          var oldIndexes = oldDef.idxByName;
          var newIndexes = newDef.idxByName;

          for (var idxName in oldIndexes) {
            if (!newIndexes[idxName]) change.del.push(idxName);
          }

          for (idxName in newIndexes) {
            var oldIdx = oldIndexes[idxName],
                newIdx = newIndexes[idxName];
            if (!oldIdx) change.add.push(newIdx);else if (oldIdx.src !== newIdx.src) change.change.push(newIdx);
          }

          if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
            diff.change.push(change);
          }
        }
      }
    }

    return diff;
  }

  function createTable(idbtrans, tableName, primKey, indexes) {
    /// <param name="idbtrans" type="IDBTransaction"></param>
    var store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ? {
      keyPath: primKey.keyPath,
      autoIncrement: primKey.auto
    } : {
      autoIncrement: primKey.auto
    });
    indexes.forEach(function (idx) {
      addIndex(store, idx);
    });
    return store;
  }

  function createMissingTables(newSchema, idbtrans) {
    keys(newSchema).forEach(function (tableName) {
      if (!idbtrans.db.objectStoreNames.contains(tableName)) {
        createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
      }
    });
  }

  function deleteRemovedTables(newSchema, idbtrans) {
    for (var i = 0; i < idbtrans.db.objectStoreNames.length; ++i) {
      var storeName = idbtrans.db.objectStoreNames[i];

      if (newSchema[storeName] == null) {
        idbtrans.db.deleteObjectStore(storeName);
      }
    }
  }

  function addIndex(store, idx) {
    store.createIndex(idx.name, idx.keyPath, {
      unique: idx.unique,
      multiEntry: idx.multi
    });
  } //
  //
  //      Dexie Protected API
  //
  //


  this._allTables = allTables;

  this._createTransaction = function (mode, storeNames, dbschema, parentTransaction) {
    return new Transaction(mode, storeNames, dbschema, parentTransaction);
  };
  /* Generate a temporary transaction when db operations are done outside a transaction scope.
  */


  function tempTransaction(mode, storeNames, fn) {
    if (!openComplete && !PSD.letThrough) {
      if (!isBeingOpened) {
        if (!autoOpen) return rejection(new exceptions.DatabaseClosed());
        db.open().catch(nop); // Open in background. If if fails, it will be catched by the final promise anyway.
      }

      return dbReadyPromise.then(function () {
        return tempTransaction(mode, storeNames, fn);
      });
    } else {
      var trans = db._createTransaction(mode, storeNames, globalSchema);

      try {
        trans.create();
      } catch (ex) {
        return rejection(ex);
      }

      return trans._promise(mode, function (resolve, reject) {
        return newScope(function () {
          PSD.trans = trans;
          return fn(resolve, reject, trans);
        });
      }).then(function (result) {
        // Instead of resolving value directly, wait with resolving it until transaction has completed.
        // Otherwise the data would not be in the DB if requesting it in the then() operation.
        // Specifically, to ensure that the following expression will work:
        //
        //   db.friends.put({name: "Arne"}).then(function () {
        //       db.friends.where("name").equals("Arne").count(function(count) {
        //           assert (count === 1);
        //       });
        //   });
        //
        return trans._completion.then(function () {
          return result;
        });
      });
      /*.catch(err => { // Don't do this as of now. If would affect bulk- and modify methods in a way that could be more intuitive. But wait! Maybe change in next major.
      trans._reject(err);
      return rejection(err);
      });*/
    }
  }

  this._whenReady = function (fn) {
    return openComplete || PSD.letThrough ? fn() : new Promise(function (resolve, reject) {
      if (!isBeingOpened) {
        if (!autoOpen) {
          reject(new exceptions.DatabaseClosed());
          return;
        }

        db.open().catch(nop); // Open in background. If if fails, it will be catched by the final promise anyway.
      }

      dbReadyPromise.then(resolve, reject);
    }).then(fn);
  }; //
  //
  //
  //
  //      Dexie API
  //
  //
  //


  this.verno = 0;

  this.open = function () {
    if (isBeingOpened || idbdb) return dbReadyPromise.then(function () {
      return dbOpenError ? rejection(dbOpenError) : db;
    });
    debug && (openCanceller._stackHolder = getErrorWithStack()); // Let stacks point to when open() was called rather than where new Dexie() was called.

    isBeingOpened = true;
    dbOpenError = null;
    openComplete = false; // Function pointers to call when the core opening process completes.

    var resolveDbReady = dbReadyResolve,
        // upgradeTransaction to abort on failure.
    upgradeTransaction = null;
    return Promise.race([openCanceller, new Promise(function (resolve, reject) {
      // Multiply db.verno with 10 will be needed to workaround upgrading bug in IE:
      // IE fails when deleting objectStore after reading from it.
      // A future version of Dexie.js will stopover an intermediate version to workaround this.
      // At that point, we want to be backward compatible. Could have been multiplied with 2, but by using 10, it is easier to map the number to the real version number.
      // If no API, throw!
      if (!indexedDB) throw new exceptions.MissingAPI("indexedDB API not found. If using IE10+, make sure to run your code on a server URL " + "(not locally). If using old Safari versions, make sure to include indexedDB polyfill.");
      var req = autoSchema ? indexedDB.open(dbName) : indexedDB.open(dbName, Math.round(db.verno * 10));
      if (!req) throw new exceptions.MissingAPI("IndexedDB API not available"); // May happen in Safari private mode, see https://github.com/dfahlander/Dexie.js/issues/134

      req.onerror = eventRejectHandler(reject);
      req.onblocked = wrap(fireOnBlocked);
      req.onupgradeneeded = wrap(function (e) {
        upgradeTransaction = req.transaction;

        if (autoSchema && !db._allowEmptyDB) {
          // Caller did not specify a version or schema. Doing that is only acceptable for opening alread existing databases.
          // If onupgradeneeded is called it means database did not exist. Reject the open() promise and make sure that we
          // do not create a new database by accident here.
          req.onerror = preventDefault; // Prohibit onabort error from firing before we're done!

          upgradeTransaction.abort(); // Abort transaction (would hope that this would make DB disappear but it doesnt.)
          // Close database and delete it.

          req.result.close();
          var delreq = indexedDB.deleteDatabase(dbName); // The upgrade transaction is atomic, and javascript is single threaded - meaning that there is no risk that we delete someone elses database here!

          delreq.onsuccess = delreq.onerror = wrap(function () {
            reject(new exceptions.NoSuchDatabase("Database " + dbName + " doesnt exist"));
          });
        } else {
          upgradeTransaction.onerror = eventRejectHandler(reject);
          var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion; // Safari 8 fix.

          runUpgraders(oldVer / 10, upgradeTransaction, reject, req);
        }
      }, reject);
      req.onsuccess = wrap(function () {
        // Core opening procedure complete. Now let's just record some stuff.
        upgradeTransaction = null;
        idbdb = req.result;
        connections.push(db); // Used for emulating versionchange event on IE/Edge/Safari.

        if (autoSchema) readGlobalSchema();else if (idbdb.objectStoreNames.length > 0) {
          try {
            adjustToExistingIndexNames(globalSchema, idbdb.transaction(safariMultiStoreFix(idbdb.objectStoreNames), READONLY));
          } catch (e) {// Safari may bail out if > 1 store names. However, this shouldnt be a showstopper. Issue #120.
          }
        }
        idbdb.onversionchange = wrap(function (ev) {
          db._vcFired = true; // detect implementations that not support versionchange (IE/Edge/Safari)

          db.on("versionchange").fire(ev);
        });

        if (!hasNativeGetDatabaseNames && dbName !== '__dbnames') {
          dbNamesDB.dbnames.put({
            name: dbName
          }).catch(nop);
        }

        resolve();
      }, reject);
    })]).then(function () {
      // Before finally resolving the dbReadyPromise and this promise,
      // call and await all on('ready') subscribers:
      // Dexie.vip() makes subscribers able to use the database while being opened.
      // This is a must since these subscribers take part of the opening procedure.
      onReadyBeingFired = [];
      return Promise.resolve(Dexie.vip(db.on.ready.fire)).then(function fireRemainders() {
        if (onReadyBeingFired.length > 0) {
          // In case additional subscribers to db.on('ready') were added during the time db.on.ready.fire was executed.
          var remainders = onReadyBeingFired.reduce(promisableChain, nop);
          onReadyBeingFired = [];
          return Promise.resolve(Dexie.vip(remainders)).then(fireRemainders);
        }
      });
    }).finally(function () {
      onReadyBeingFired = null;
    }).then(function () {
      // Resolve the db.open() with the db instance.
      isBeingOpened = false;
      return db;
    }).catch(function (err) {
      try {
        // Did we fail within onupgradeneeded? Make sure to abort the upgrade transaction so it doesnt commit.
        upgradeTransaction && upgradeTransaction.abort();
      } catch (e) {}

      isBeingOpened = false; // Set before calling db.close() so that it doesnt reject openCanceller again (leads to unhandled rejection event).

      db.close(); // Closes and resets idbdb, removes connections, resets dbReadyPromise and openCanceller so that a later db.open() is fresh.
      // A call to db.close() may have made on-ready subscribers fail. Use dbOpenError if set, since err could be a follow-up error on that.

      dbOpenError = err; // Record the error. It will be used to reject further promises of db operations.

      return rejection(dbOpenError);
    }).finally(function () {
      openComplete = true;
      resolveDbReady(); // dbReadyPromise is resolved no matter if open() rejects or resolved. It's just to wake up waiters.
    });
  };

  this.close = function () {
    var idx = connections.indexOf(db);
    if (idx >= 0) connections.splice(idx, 1);

    if (idbdb) {
      try {
        idbdb.close();
      } catch (e) {}

      idbdb = null;
    }

    autoOpen = false;
    dbOpenError = new exceptions.DatabaseClosed();
    if (isBeingOpened) cancelOpen(dbOpenError); // Reset dbReadyPromise promise:

    dbReadyPromise = new Promise(function (resolve) {
      dbReadyResolve = resolve;
    });
    openCanceller = new Promise(function (_, reject) {
      cancelOpen = reject;
    });
  };

  this.delete = function () {
    var hasArguments = arguments.length > 0;
    return new Promise(function (resolve, reject) {
      if (hasArguments) throw new exceptions.InvalidArgument("Arguments not allowed in db.delete()");

      if (isBeingOpened) {
        dbReadyPromise.then(doDelete);
      } else {
        doDelete();
      }

      function doDelete() {
        db.close();
        var req = indexedDB.deleteDatabase(dbName);
        req.onsuccess = wrap(function () {
          if (!hasNativeGetDatabaseNames) {
            dbNamesDB.dbnames.delete(dbName).catch(nop);
          }

          resolve();
        });
        req.onerror = eventRejectHandler(reject);
        req.onblocked = fireOnBlocked;
      }
    });
  };

  this.backendDB = function () {
    return idbdb;
  };

  this.isOpen = function () {
    return idbdb !== null;
  };

  this.hasBeenClosed = function () {
    return dbOpenError && dbOpenError instanceof exceptions.DatabaseClosed;
  };

  this.hasFailed = function () {
    return dbOpenError !== null;
  };

  this.dynamicallyOpened = function () {
    return autoSchema;
  }; //
  // Properties
  //


  this.name = dbName; // db.tables - an array of all Table instances.

  props(this, {
    tables: {
      get: function () {
        /// <returns type="Array" elementType="Table" />
        return keys(allTables).map(function (name) {
          return allTables[name];
        });
      }
    }
  }); //
  // Events
  //

  this.on = Events(this, "populate", "blocked", "versionchange", {
    ready: [promisableChain, nop]
  });
  this.on.ready.subscribe = override(this.on.ready.subscribe, function (subscribe) {
    return function (subscriber, bSticky) {
      Dexie.vip(function () {
        if (openComplete) {
          // Database already open. Call subscriber asap.
          if (!dbOpenError) Promise.resolve().then(subscriber); // bSticky: Also subscribe to future open sucesses (after close / reopen) 

          if (bSticky) subscribe(subscriber);
        } else if (onReadyBeingFired) {
          // db.on('ready') subscribers are currently being executed and have not yet resolved or rejected
          onReadyBeingFired.push(subscriber);
          if (bSticky) subscribe(subscriber);
        } else {
          // Database not yet open. Subscribe to it.
          subscribe(subscriber); // If bSticky is falsy, make sure to unsubscribe subscriber when fired once.

          if (!bSticky) subscribe(function unsubscribe() {
            db.on.ready.unsubscribe(subscriber);
            db.on.ready.unsubscribe(unsubscribe);
          });
        }
      });
    };
  });

  this.transaction = function () {
    /// <summary>
    ///
    /// </summary>
    /// <param name="mode" type="String">"r" for readonly, or "rw" for readwrite</param>
    /// <param name="tableInstances">Table instance, Array of Table instances, String or String Array of object stores to include in the transaction</param>
    /// <param name="scopeFunc" type="Function">Function to execute with transaction</param>
    var args = extractTransactionArgs.apply(this, arguments);
    return this._transaction.apply(this, args);
  };

  function extractTransactionArgs(mode, _tableArgs_, scopeFunc) {
    // Let table arguments be all arguments between mode and last argument.
    var i = arguments.length;
    if (i < 2) throw new exceptions.InvalidArgument("Too few arguments"); // Prevent optimzation killer (https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments)
    // and clone arguments except the first one into local var 'args'.

    var args = new Array(i - 1);

    while (--i) {
      args[i - 1] = arguments[i];
    } // Let scopeFunc be the last argument and pop it so that args now only contain the table arguments.


    scopeFunc = args.pop();
    var tables = flatten(args); // Support using array as middle argument, or a mix of arrays and non-arrays.

    return [mode, tables, scopeFunc];
  }

  this._transaction = function (mode, tables, scopeFunc) {
    var parentTransaction = PSD.trans; // Check if parent transactions is bound to this db instance, and if caller wants to reuse it

    if (!parentTransaction || parentTransaction.db !== db || mode.indexOf('!') !== -1) parentTransaction = null;
    var onlyIfCompatible = mode.indexOf('?') !== -1;
    mode = mode.replace('!', '').replace('?', ''); // Ok. Will change arguments[0] as well but we wont touch arguments henceforth.

    try {
      //
      // Get storeNames from arguments. Either through given table instances, or through given table names.
      //
      var storeNames = tables.map(function (table) {
        var storeName = table instanceof Table ? table.name : table;
        if (typeof storeName !== 'string') throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
        return storeName;
      }); //
      // Resolve mode. Allow shortcuts "r" and "rw".
      //

      if (mode == "r" || mode == READONLY) mode = READONLY;else if (mode == "rw" || mode == READWRITE) mode = READWRITE;else throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);

      if (parentTransaction) {
        // Basic checks
        if (parentTransaction.mode === READONLY && mode === READWRITE) {
          if (onlyIfCompatible) {
            // Spawn new transaction instead.
            parentTransaction = null;
          } else throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
        }

        if (parentTransaction) {
          storeNames.forEach(function (storeName) {
            if (parentTransaction && parentTransaction.storeNames.indexOf(storeName) === -1) {
              if (onlyIfCompatible) {
                // Spawn new transaction instead.
                parentTransaction = null;
              } else throw new exceptions.SubTransaction("Table " + storeName + " not included in parent transaction.");
            }
          });
        }

        if (onlyIfCompatible && parentTransaction && !parentTransaction.active) {
          // '?' mode should not keep using an inactive transaction.
          parentTransaction = null;
        }
      }
    } catch (e) {
      return parentTransaction ? parentTransaction._promise(null, function (_, reject) {
        reject(e);
      }) : rejection(e);
    } // If this is a sub-transaction, lock the parent and then launch the sub-transaction.


    return parentTransaction ? parentTransaction._promise(mode, enterTransactionScope, "lock") : PSD.trans ? // no parent transaction despite PSD.trans exists. Make sure also
    // that the zone we create is not a sub-zone of current, because
    // Promise.follow() should not wait for it if so.
    usePSD(PSD.transless, function () {
      return db._whenReady(enterTransactionScope);
    }) : db._whenReady(enterTransactionScope);

    function enterTransactionScope() {
      return Promise.resolve().then(function () {
        // Keep a pointer to last non-transactional PSD to use if someone calls Dexie.ignoreTransaction().
        var transless = PSD.transless || PSD; // Our transaction.
        //return new Promise((resolve, reject) => {

        var trans = db._createTransaction(mode, storeNames, globalSchema, parentTransaction); // Let the transaction instance be part of a Promise-specific data (PSD) value.


        var zoneProps = {
          trans: trans,
          transless: transless
        };

        if (parentTransaction) {
          // Emulate transaction commit awareness for inner transaction (must 'commit' when the inner transaction has no more operations ongoing)
          trans.idbtrans = parentTransaction.idbtrans;
        } else {
          trans.create(); // Create the backend transaction so that complete() or error() will trigger even if no operation is made upon it.
        } // Support for native async await.


        if (scopeFunc.constructor === AsyncFunction) {
          incrementExpectedAwaits();
        }

        var returnValue;
        var promiseFollowed = Promise.follow(function () {
          // Finally, call the scope function with our table and transaction arguments.
          returnValue = scopeFunc.call(trans, trans);

          if (returnValue) {
            if (returnValue.constructor === NativePromise) {
              var decrementor = decrementExpectedAwaits.bind(null, null);
              returnValue.then(decrementor, decrementor);
            } else if (typeof returnValue.next === 'function' && typeof returnValue.throw === 'function') {
              // scopeFunc returned an iterator with throw-support. Handle yield as await.
              returnValue = awaitIterator(returnValue);
            }
          }
        }, zoneProps);
        return (returnValue && typeof returnValue.then === 'function' ? // Promise returned. User uses promise-style transactions.
        Promise.resolve(returnValue).then(function (x) {
          return trans.active ? x // Transaction still active. Continue.
          : rejection(new exceptions.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"));
        }) // No promise returned. Wait for all outstanding promises before continuing. 
        : promiseFollowed.then(function () {
          return returnValue;
        })).then(function (x) {
          // sub transactions don't react to idbtrans.oncomplete. We must trigger a completion:
          if (parentTransaction) trans._resolve(); // wait for trans._completion
          // (if root transaction, this means 'complete' event. If sub-transaction, we've just fired it ourselves)

          return trans._completion.then(function () {
            return x;
          });
        }).catch(function (e) {
          trans._reject(e); // Yes, above then-handler were maybe not called because of an unhandled rejection in scopeFunc!


          return rejection(e);
        });
      });
    }
  };

  this.table = function (tableName) {
    /// <returns type="Table"></returns>
    if (!hasOwn(allTables, tableName)) {
      throw new exceptions.InvalidTable("Table " + tableName + " does not exist");
    }

    return allTables[tableName];
  }; //
  //
  //
  // Table Class
  //
  //
  //


  function Table(name, tableSchema, optionalTrans) {
    /// <param name="name" type="String"></param>
    this.name = name;
    this.schema = tableSchema;
    this._tx = optionalTrans;
    this.hook = allTables[name] ? allTables[name].hook : Events(null, {
      "creating": [hookCreatingChain, nop],
      "reading": [pureFunctionChain, mirror],
      "updating": [hookUpdatingChain, nop],
      "deleting": [hookDeletingChain, nop]
    });
  }

  function BulkErrorHandlerCatchAll(errorList, done, supportHooks) {
    return (supportHooks ? hookedEventRejectHandler : eventRejectHandler)(function (e) {
      errorList.push(e);
      done && done();
    });
  }

  function bulkDelete(idbstore, trans, keysOrTuples, hasDeleteHook, deletingHook) {
    // If hasDeleteHook, keysOrTuples must be an array of tuples: [[key1, value2],[key2,value2],...],
    // else keysOrTuples must be just an array of keys: [key1, key2, ...].
    return new Promise(function (resolve, reject) {
      var len = keysOrTuples.length,
          lastItem = len - 1;
      if (len === 0) return resolve();

      if (!hasDeleteHook) {
        for (var i = 0; i < len; ++i) {
          var req = idbstore.delete(keysOrTuples[i]);
          req.onerror = eventRejectHandler(reject);
          if (i === lastItem) req.onsuccess = wrap(function () {
            return resolve();
          });
        }
      } else {
        var hookCtx,
            errorHandler = hookedEventRejectHandler(reject),
            successHandler = hookedEventSuccessHandler(null);
        tryCatch(function () {
          for (var i = 0; i < len; ++i) {
            hookCtx = {
              onsuccess: null,
              onerror: null
            };
            var tuple = keysOrTuples[i];
            deletingHook.call(hookCtx, tuple[0], tuple[1], trans);
            var req = idbstore.delete(tuple[0]);
            req._hookCtx = hookCtx;
            req.onerror = errorHandler;
            if (i === lastItem) req.onsuccess = hookedEventSuccessHandler(resolve);else req.onsuccess = successHandler;
          }
        }, function (err) {
          hookCtx.onerror && hookCtx.onerror(err);
          throw err;
        });
      }
    });
  }

  props(Table.prototype, {
    //
    // Table Protected Methods
    //
    _trans: function getTransaction(mode, fn, writeLocked) {
      var trans = this._tx || PSD.trans;
      return trans && trans.db === db ? trans === PSD.trans ? trans._promise(mode, fn, writeLocked) : newScope(function () {
        return trans._promise(mode, fn, writeLocked);
      }, {
        trans: trans,
        transless: PSD.transless || PSD
      }) : tempTransaction(mode, [this.name], fn);
    },
    _idbstore: function getIDBObjectStore(mode, fn, writeLocked) {
      var tableName = this.name;

      function supplyIdbStore(resolve, reject, trans) {
        if (trans.storeNames.indexOf(tableName) === -1) throw new exceptions.NotFound("Table" + tableName + " not part of transaction");
        return fn(resolve, reject, trans.idbtrans.objectStore(tableName), trans);
      }

      return this._trans(mode, supplyIdbStore, writeLocked);
    },
    //
    // Table Public Methods
    //
    get: function (keyOrCrit, cb) {
      if (keyOrCrit && keyOrCrit.constructor === Object) return this.where(keyOrCrit).first(cb);
      var self = this;
      return this._idbstore(READONLY, function (resolve, reject, idbstore) {
        var req = idbstore.get(keyOrCrit);
        req.onerror = eventRejectHandler(reject);
        req.onsuccess = wrap(function () {
          resolve(self.hook.reading.fire(req.result));
        }, reject);
      }).then(cb);
    },
    where: function (indexOrCrit) {
      if (typeof indexOrCrit === 'string') return new WhereClause(this, indexOrCrit);
      if (isArray(indexOrCrit)) return new WhereClause(this, "[" + indexOrCrit.join('+') + "]"); // indexOrCrit is an object map of {[keyPath]:value} 

      var keyPaths = keys(indexOrCrit);
      if (keyPaths.length === 1) // Only one critera. This was the easy case:
        return this.where(keyPaths[0]).equals(indexOrCrit[keyPaths[0]]); // Multiple criterias.
      // Let's try finding a compound index that matches all keyPaths in
      // arbritary order:

      var compoundIndex = this.schema.indexes.concat(this.schema.primKey).filter(function (ix) {
        return ix.compound && keyPaths.every(function (keyPath) {
          return ix.keyPath.indexOf(keyPath) >= 0;
        }) && ix.keyPath.every(function (keyPath) {
          return keyPaths.indexOf(keyPath) >= 0;
        });
      })[0];
      if (compoundIndex && maxKey !== maxString) // Cool! We found such compound index
        // and this browser supports compound indexes (maxKey !== maxString)!
        return this.where(compoundIndex.name).equals(compoundIndex.keyPath.map(function (kp) {
          return indexOrCrit[kp];
        }));
      if (!compoundIndex) console.warn("The query " + JSON.stringify(indexOrCrit) + " on " + this.name + " would benefit of a " + ("compound index [" + keyPaths.join('+') + "]")); // Ok, now let's fallback to finding at least one matching index
      // and filter the rest.

      var idxByName = this.schema.idxByName;
      var simpleIndex = keyPaths.reduce(function (r, keyPath) {
        return [r[0] || idxByName[keyPath], r[0] || !idxByName[keyPath] ? combine(r[1], function (x) {
          return '' + getByKeyPath(x, keyPath) == '' + indexOrCrit[keyPath];
        }) : r[1]];
      }, [null, null]);
      var idx = simpleIndex[0];
      return idx ? this.where(idx.name).equals(indexOrCrit[idx.keyPath]).filter(simpleIndex[1]) : compoundIndex ? this.filter(simpleIndex[1]) : // Has compound but browser bad. Allow filter.
      this.where(keyPaths).equals(''); // No index at all. Fail lazily.
    },
    count: function (cb) {
      return this.toCollection().count(cb);
    },
    offset: function (offset) {
      return this.toCollection().offset(offset);
    },
    limit: function (numRows) {
      return this.toCollection().limit(numRows);
    },
    reverse: function () {
      return this.toCollection().reverse();
    },
    filter: function (filterFunction) {
      return this.toCollection().and(filterFunction);
    },
    each: function (fn) {
      return this.toCollection().each(fn);
    },
    toArray: function (cb) {
      return this.toCollection().toArray(cb);
    },
    orderBy: function (index) {
      return new Collection(new WhereClause(this, isArray(index) ? "[" + index.join('+') + "]" : index));
    },
    toCollection: function () {
      return new Collection(new WhereClause(this));
    },
    mapToClass: function (constructor, structure) {
      /// <summary>
      ///     Map table to a javascript constructor function. Objects returned from the database will be instances of this class, making
      ///     it possible to the instanceOf operator as well as extending the class using constructor.prototype.method = function(){...}.
      /// </summary>
      /// <param name="constructor">Constructor function representing the class.</param>
      /// <param name="structure" optional="true">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
      /// know what type each member has. Example: {name: String, emailAddresses: [String], password}</param>
      this.schema.mappedClass = constructor;
      var instanceTemplate = Object.create(constructor.prototype);

      if (structure) {
        // structure and instanceTemplate is for IDE code competion only while constructor.prototype is for actual inheritance.
        applyStructure(instanceTemplate, structure);
      }

      this.schema.instanceTemplate = instanceTemplate; // Now, subscribe to the when("reading") event to make all objects that come out from this table inherit from given class
      // no matter which method to use for reading (Table.get() or Table.where(...)... )

      var readHook = function (obj) {
        if (!obj) return obj; // No valid object. (Value is null). Return as is.
        // Create a new object that derives from constructor:

        var res = Object.create(constructor.prototype); // Clone members:

        for (var m in obj) {
          if (hasOwn(obj, m)) try {
            res[m] = obj[m];
          } catch (_) {}
        }

        return res;
      };

      if (this.schema.readHook) {
        this.hook.reading.unsubscribe(this.schema.readHook);
      }

      this.schema.readHook = readHook;
      this.hook("reading", readHook);
      return constructor;
    },
    defineClass: function (structure) {
      /// <summary>
      ///     Define all members of the class that represents the table. This will help code completion of when objects are read from the database
      ///     as well as making it possible to extend the prototype of the returned constructor function.
      /// </summary>
      /// <param name="structure">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
      /// know what type each member has. Example: {name: String, emailAddresses: [String], properties: {shoeSize: Number}}</param>
      return this.mapToClass(Dexie.defineClass(structure), structure);
    },
    bulkDelete: function (keys$$1) {
      if (this.hook.deleting.fire === nop) {
        return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
          resolve(bulkDelete(idbstore, trans, keys$$1, false, nop));
        });
      } else {
        return this.where(':id').anyOf(keys$$1).delete().then(function () {}); // Resolve with undefined.
      }
    },
    bulkPut: function (objects, keys$$1) {
      var _this = this;

      return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
        if (!idbstore.keyPath && !_this.schema.primKey.auto && !keys$$1) throw new exceptions.InvalidArgument("bulkPut() with non-inbound keys requires keys array in second argument");
        if (idbstore.keyPath && keys$$1) throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
        if (keys$$1 && keys$$1.length !== objects.length) throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
        if (objects.length === 0) return resolve(); // Caller provided empty list.

        var done = function (result) {
          if (errorList.length === 0) resolve(result);else reject(new BulkError(_this.name + ".bulkPut(): " + errorList.length + " of " + numObjs + " operations failed", errorList));
        };

        var req,
            errorList = [],
            errorHandler,
            numObjs = objects.length,
            table = _this;

        if (_this.hook.creating.fire === nop && _this.hook.updating.fire === nop) {
          //
          // Standard Bulk (no 'creating' or 'updating' hooks to care about)
          //
          errorHandler = BulkErrorHandlerCatchAll(errorList);

          for (var i = 0, l = objects.length; i < l; ++i) {
            req = keys$$1 ? idbstore.put(objects[i], keys$$1[i]) : idbstore.put(objects[i]);
            req.onerror = errorHandler;
          } // Only need to catch success or error on the last operation
          // according to the IDB spec.


          req.onerror = BulkErrorHandlerCatchAll(errorList, done);
          req.onsuccess = eventSuccessHandler(done);
        } else {
          var effectiveKeys = keys$$1 || idbstore.keyPath && objects.map(function (o) {
            return getByKeyPath(o, idbstore.keyPath);
          }); // Generate map of {[key]: object}

          var objectLookup = effectiveKeys && arrayToObject(effectiveKeys, function (key, i) {
            return key != null && [key, objects[i]];
          });
          var promise = !effectiveKeys ? // Auto-incremented key-less objects only without any keys argument.
          table.bulkAdd(objects) : // Keys provided. Either as inbound in provided objects, or as a keys argument.
          // Begin with updating those that exists in DB:
          table.where(':id').anyOf(effectiveKeys.filter(function (key) {
            return key != null;
          })).modify(function () {
            this.value = objectLookup[this.primKey];
            objectLookup[this.primKey] = null; // Mark as "don't add this"
          }).catch(ModifyError, function (e) {
            errorList = e.failures; // No need to concat here. These are the first errors added.
          }).then(function () {
            // Now, let's examine which items didnt exist so we can add them:
            var objsToAdd = [],
                keysToAdd = keys$$1 && []; // Iterate backwards. Why? Because if same key was used twice, just add the last one.

            for (var i = effectiveKeys.length - 1; i >= 0; --i) {
              var key = effectiveKeys[i];

              if (key == null || objectLookup[key]) {
                objsToAdd.push(objects[i]);
                keys$$1 && keysToAdd.push(key);
                if (key != null) objectLookup[key] = null; // Mark as "dont add again"
              }
            } // The items are in reverse order so reverse them before adding.
            // Could be important in order to get auto-incremented keys the way the caller
            // would expect. Could have used unshift instead of push()/reverse(),
            // but: http://jsperf.com/unshift-vs-reverse


            objsToAdd.reverse();
            keys$$1 && keysToAdd.reverse();
            return table.bulkAdd(objsToAdd, keysToAdd);
          }).then(function (lastAddedKey) {
            // Resolve with key of the last object in given arguments to bulkPut():
            var lastEffectiveKey = effectiveKeys[effectiveKeys.length - 1]; // Key was provided.

            return lastEffectiveKey != null ? lastEffectiveKey : lastAddedKey;
          });
          promise.then(done).catch(BulkError, function (e) {
            // Concat failure from ModifyError and reject using our 'done' method.
            errorList = errorList.concat(e.failures);
            done();
          }).catch(reject);
        }
      }, "locked"); // If called from transaction scope, lock transaction til all steps are done.
    },
    bulkAdd: function (objects, keys$$1) {
      var self = this,
          creatingHook = this.hook.creating.fire;
      return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
        if (!idbstore.keyPath && !self.schema.primKey.auto && !keys$$1) throw new exceptions.InvalidArgument("bulkAdd() with non-inbound keys requires keys array in second argument");
        if (idbstore.keyPath && keys$$1) throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
        if (keys$$1 && keys$$1.length !== objects.length) throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
        if (objects.length === 0) return resolve(); // Caller provided empty list.

        function done(result) {
          if (errorList.length === 0) resolve(result);else reject(new BulkError(self.name + ".bulkAdd(): " + errorList.length + " of " + numObjs + " operations failed", errorList));
        }

        var req,
            errorList = [],
            errorHandler,
            successHandler,
            numObjs = objects.length;

        if (creatingHook !== nop) {
          //
          // There are subscribers to hook('creating')
          // Must behave as documented.
          //
          var keyPath = idbstore.keyPath,
              hookCtx;
          errorHandler = BulkErrorHandlerCatchAll(errorList, null, true);
          successHandler = hookedEventSuccessHandler(null);
          tryCatch(function () {
            for (var i = 0, l = objects.length; i < l; ++i) {
              hookCtx = {
                onerror: null,
                onsuccess: null
              };
              var key = keys$$1 && keys$$1[i];
              var obj = objects[i],
                  effectiveKey = keys$$1 ? key : keyPath ? getByKeyPath(obj, keyPath) : undefined,
                  keyToUse = creatingHook.call(hookCtx, effectiveKey, obj, trans);

              if (effectiveKey == null && keyToUse != null) {
                if (keyPath) {
                  obj = deepClone(obj);
                  setByKeyPath(obj, keyPath, keyToUse);
                } else {
                  key = keyToUse;
                }
              }

              req = key != null ? idbstore.add(obj, key) : idbstore.add(obj);
              req._hookCtx = hookCtx;

              if (i < l - 1) {
                req.onerror = errorHandler;
                if (hookCtx.onsuccess) req.onsuccess = successHandler;
              }
            }
          }, function (err) {
            hookCtx.onerror && hookCtx.onerror(err);
            throw err;
          });
          req.onerror = BulkErrorHandlerCatchAll(errorList, done, true);
          req.onsuccess = hookedEventSuccessHandler(done);
        } else {
          //
          // Standard Bulk (no 'creating' hook to care about)
          //
          errorHandler = BulkErrorHandlerCatchAll(errorList);

          for (var i = 0, l = objects.length; i < l; ++i) {
            req = keys$$1 ? idbstore.add(objects[i], keys$$1[i]) : idbstore.add(objects[i]);
            req.onerror = errorHandler;
          } // Only need to catch success or error on the last operation
          // according to the IDB spec.


          req.onerror = BulkErrorHandlerCatchAll(errorList, done);
          req.onsuccess = eventSuccessHandler(done);
        }
      });
    },
    add: function (obj, key) {
      /// <summary>
      ///   Add an object to the database. In case an object with same primary key already exists, the object will not be added.
      /// </summary>
      /// <param name="obj" type="Object">A javascript object to insert</param>
      /// <param name="key" optional="true">Primary key</param>
      var creatingHook = this.hook.creating.fire;
      return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
        var hookCtx = {
          onsuccess: null,
          onerror: null
        };

        if (creatingHook !== nop) {
          var effectiveKey = key != null ? key : idbstore.keyPath ? getByKeyPath(obj, idbstore.keyPath) : undefined;
          var keyToUse = creatingHook.call(hookCtx, effectiveKey, obj, trans); // Allow subscribers to when("creating") to generate the key.

          if (effectiveKey == null && keyToUse != null) {
            if (idbstore.keyPath) setByKeyPath(obj, idbstore.keyPath, keyToUse);else key = keyToUse;
          }
        }

        try {
          var req = key != null ? idbstore.add(obj, key) : idbstore.add(obj);
          req._hookCtx = hookCtx;
          req.onerror = hookedEventRejectHandler(reject);
          req.onsuccess = hookedEventSuccessHandler(function (result) {
            // TODO: Remove these two lines in next major release (2.0?)
            // It's no good practice to have side effects on provided parameters
            var keyPath = idbstore.keyPath;
            if (keyPath) setByKeyPath(obj, keyPath, result);
            resolve(result);
          });
        } catch (e) {
          if (hookCtx.onerror) hookCtx.onerror(e);
          throw e;
        }
      });
    },
    put: function (obj, key) {
      var _this = this; /// <summary>
      ///   Add an object to the database but in case an object with same primary key alread exists, the existing one will get updated.
      /// </summary>
      /// <param name="obj" type="Object">A javascript object to insert or update</param>
      /// <param name="key" optional="true">Primary key</param>


      var creatingHook = this.hook.creating.fire,
          updatingHook = this.hook.updating.fire;

      if (creatingHook !== nop || updatingHook !== nop) {
        //
        // People listens to when("creating") or when("updating") events!
        // We must know whether the put operation results in an CREATE or UPDATE.
        //
        var keyPath = this.schema.primKey.keyPath;
        var effectiveKey = key !== undefined ? key : keyPath && getByKeyPath(obj, keyPath);
        if (effectiveKey == null) return this.add(obj); // Since key is optional, make sure we get it from obj if not provided
        // Primary key exist. Lock transaction and try modifying existing. If nothing modified, call add().
        // clone obj before this async call. If caller modifies obj the line after put(), the IDB spec requires that it should not affect operation.

        obj = deepClone(obj);
        return this._trans(READWRITE, function () {
          return _this.where(":id").equals(effectiveKey).modify(function () {
            // Replace extisting value with our object
            // CRUD event firing handled in Collection.modify()
            this.value = obj;
          }).then(function (count) {
            return count === 0 ? _this.add(obj, key) : effectiveKey;
          });
        }, "locked"); // Lock needed because operation is splitted into modify() and add().
      } else {
        // Use the standard IDB put() method.
        return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
          var req = key !== undefined ? idbstore.put(obj, key) : idbstore.put(obj);
          req.onerror = eventRejectHandler(reject);
          req.onsuccess = wrap(function (ev) {
            var keyPath = idbstore.keyPath;
            if (keyPath) setByKeyPath(obj, keyPath, ev.target.result);
            resolve(req.result);
          });
        });
      }
    },
    'delete': function (key) {
      /// <param name="key">Primary key of the object to delete</param>
      if (this.hook.deleting.subscribers.length) {
        // People listens to when("deleting") event. Must implement delete using Collection.delete() that will
        // call the CRUD event. Only Collection.delete() will know whether an object was actually deleted.
        return this.where(":id").equals(key).delete();
      } else {
        // No one listens. Use standard IDB delete() method.
        return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
          var req = idbstore.delete(key);
          req.onerror = eventRejectHandler(reject);
          req.onsuccess = wrap(function () {
            resolve(req.result);
          });
        });
      }
    },
    clear: function () {
      if (this.hook.deleting.subscribers.length) {
        // People listens to when("deleting") event. Must implement delete using Collection.delete() that will
        // call the CRUD event. Only Collection.delete() will knows which objects that are actually deleted.
        return this.toCollection().delete();
      } else {
        return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
          var req = idbstore.clear();
          req.onerror = eventRejectHandler(reject);
          req.onsuccess = wrap(function () {
            resolve(req.result);
          });
        });
      }
    },
    update: function (keyOrObject, modifications) {
      if (_typeof(modifications) !== 'object' || isArray(modifications)) throw new exceptions.InvalidArgument("Modifications must be an object.");

      if (_typeof(keyOrObject) === 'object' && !isArray(keyOrObject)) {
        // object to modify. Also modify given object with the modifications:
        keys(modifications).forEach(function (keyPath) {
          setByKeyPath(keyOrObject, keyPath, modifications[keyPath]);
        });
        var key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
        if (key === undefined) return rejection(new exceptions.InvalidArgument("Given object does not contain its primary key"));
        return this.where(":id").equals(key).modify(modifications);
      } else {
        // key to modify
        return this.where(":id").equals(keyOrObject).modify(modifications);
      }
    }
  }); //
  //
  //
  // Transaction Class
  //
  //
  //

  function Transaction(mode, storeNames, dbschema, parent) {
    var _this = this; /// <summary>
    ///    Transaction class. Represents a database transaction. All operations on db goes through a Transaction.
    /// </summary>
    /// <param name="mode" type="String">Any of "readwrite" or "readonly"</param>
    /// <param name="storeNames" type="Array">Array of table names to operate on</param>


    this.db = db;
    this.mode = mode;
    this.storeNames = storeNames;
    this.idbtrans = null;
    this.on = Events(this, "complete", "error", "abort");
    this.parent = parent || null;
    this.active = true;
    this._reculock = 0;
    this._blockedFuncs = [];
    this._resolve = null;
    this._reject = null;
    this._waitingFor = null;
    this._waitingQueue = null;
    this._spinCount = 0; // Just for debugging waitFor()

    this._completion = new Promise(function (resolve, reject) {
      _this._resolve = resolve;
      _this._reject = reject;
    });

    this._completion.then(function () {
      _this.active = false;

      _this.on.complete.fire();
    }, function (e) {
      var wasActive = _this.active;
      _this.active = false;

      _this.on.error.fire(e);

      _this.parent ? _this.parent._reject(e) : wasActive && _this.idbtrans && _this.idbtrans.abort();
      return rejection(e); // Indicate we actually DO NOT catch this error.
    });
  }

  props(Transaction.prototype, {
    //
    // Transaction Protected Methods (not required by API users, but needed internally and eventually by dexie extensions)
    //
    _lock: function () {
      assert(!PSD.global); // Locking and unlocking reuires to be within a PSD scope.
      // Temporary set all requests into a pending queue if they are called before database is ready.

      ++this._reculock; // Recursive read/write lock pattern using PSD (Promise Specific Data) instead of TLS (Thread Local Storage)

      if (this._reculock === 1 && !PSD.global) PSD.lockOwnerFor = this;
      return this;
    },
    _unlock: function () {
      assert(!PSD.global); // Locking and unlocking reuires to be within a PSD scope.

      if (--this._reculock === 0) {
        if (!PSD.global) PSD.lockOwnerFor = null;

        while (this._blockedFuncs.length > 0 && !this._locked()) {
          var fnAndPSD = this._blockedFuncs.shift();

          try {
            usePSD(fnAndPSD[1], fnAndPSD[0]);
          } catch (e) {}
        }
      }

      return this;
    },
    _locked: function () {
      // Checks if any write-lock is applied on this transaction.
      // To simplify the Dexie API for extension implementations, we support recursive locks.
      // This is accomplished by using "Promise Specific Data" (PSD).
      // PSD data is bound to a Promise and any child Promise emitted through then() or resolve( new Promise() ).
      // PSD is local to code executing on top of the call stacks of any of any code executed by Promise():
      //         * callback given to the Promise() constructor  (function (resolve, reject){...})
      //         * callbacks given to then()/catch()/finally() methods (function (value){...})
      // If creating a new independant Promise instance from within a Promise call stack, the new Promise will derive the PSD from the call stack of the parent Promise.
      // Derivation is done so that the inner PSD __proto__ points to the outer PSD.
      // PSD.lockOwnerFor will point to current transaction object if the currently executing PSD scope owns the lock.
      return this._reculock && PSD.lockOwnerFor !== this;
    },
    create: function (idbtrans) {
      var _this = this;

      if (!this.mode) return this;
      assert(!this.idbtrans);

      if (!idbtrans && !idbdb) {
        switch (dbOpenError && dbOpenError.name) {
          case "DatabaseClosedError":
            // Errors where it is no difference whether it was caused by the user operation or an earlier call to db.open()
            throw new exceptions.DatabaseClosed(dbOpenError);

          case "MissingAPIError":
            // Errors where it is no difference whether it was caused by the user operation or an earlier call to db.open()
            throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);

          default:
            // Make it clear that the user operation was not what caused the error - the error had occurred earlier on db.open()!
            throw new exceptions.OpenFailed(dbOpenError);
        }
      }

      if (!this.active) throw new exceptions.TransactionInactive();
      assert(this._completion._state === null);
      idbtrans = this.idbtrans = idbtrans || idbdb.transaction(safariMultiStoreFix(this.storeNames), this.mode);
      idbtrans.onerror = wrap(function (ev) {
        preventDefault(ev); // Prohibit default bubbling to window.error

        _this._reject(idbtrans.error);
      });
      idbtrans.onabort = wrap(function (ev) {
        preventDefault(ev);
        _this.active && _this._reject(new exceptions.Abort(idbtrans.error));
        _this.active = false;

        _this.on("abort").fire(ev);
      });
      idbtrans.oncomplete = wrap(function () {
        _this.active = false;

        _this._resolve();
      });
      return this;
    },
    _promise: function (mode, fn, bWriteLock) {
      var _this = this;

      if (mode === READWRITE && this.mode !== READWRITE) return rejection(new exceptions.ReadOnly("Transaction is readonly"));
      if (!this.active) return rejection(new exceptions.TransactionInactive());

      if (this._locked()) {
        return new Promise(function (resolve, reject) {
          _this._blockedFuncs.push([function () {
            _this._promise(mode, fn, bWriteLock).then(resolve, reject);
          }, PSD]);
        });
      } else if (bWriteLock) {
        return newScope(function () {
          var p = new Promise(function (resolve, reject) {
            _this._lock();

            var rv = fn(resolve, reject, _this);
            if (rv && rv.then) rv.then(resolve, reject);
          });
          p.finally(function () {
            return _this._unlock();
          });
          p._lib = true;
          return p;
        });
      } else {
        var p = new Promise(function (resolve, reject) {
          var rv = fn(resolve, reject, _this);
          if (rv && rv.then) rv.then(resolve, reject);
        });
        p._lib = true;
        return p;
      }
    },
    _root: function () {
      return this.parent ? this.parent._root() : this;
    },
    waitFor: function (promise) {
      // Always operate on the root transaction (in case this is a sub stransaction)
      var root = this._root(); // For stability reasons, convert parameter to promise no matter what type is passed to waitFor().
      // (We must be able to call .then() on it.)


      promise = Promise.resolve(promise);

      if (root._waitingFor) {
        // Already called waitFor(). Wait for both to complete.
        root._waitingFor = root._waitingFor.then(function () {
          return promise;
        });
      } else {
        // We're not in waiting state. Start waiting state.
        root._waitingFor = promise;
        root._waitingQueue = []; // Start interacting with indexedDB until promise completes:

        var store = root.idbtrans.objectStore(root.storeNames[0]);

        (function spin() {
          ++root._spinCount; // For debugging only

          while (root._waitingQueue.length) {
            root._waitingQueue.shift()();
          }

          if (root._waitingFor) store.get(-Infinity).onsuccess = spin;
        })();
      }

      var currentWaitPromise = root._waitingFor;
      return new Promise(function (resolve, reject) {
        promise.then(function (res) {
          return root._waitingQueue.push(wrap(resolve.bind(null, res)));
        }, function (err) {
          return root._waitingQueue.push(wrap(reject.bind(null, err)));
        }).finally(function () {
          if (root._waitingFor === currentWaitPromise) {
            // No one added a wait after us. Safe to stop the spinning.
            root._waitingFor = null;
          }
        });
      });
    },
    //
    // Transaction Public Properties and Methods
    //
    abort: function () {
      this.active && this._reject(new exceptions.Abort());
      this.active = false;
    },
    tables: {
      get: deprecated("Transaction.tables", function () {
        return allTables;
      })
    },
    table: function (name) {
      var table = db.table(name); // Don't check that table is part of transaction. It must fail lazily!

      return new Table(name, table.schema, this);
    }
  }); //
  //
  //
  // WhereClause
  //
  //
  //

  function WhereClause(table, index, orCollection) {
    /// <param name="table" type="Table"></param>
    /// <param name="index" type="String" optional="true"></param>
    /// <param name="orCollection" type="Collection" optional="true"></param>
    this._ctx = {
      table: table,
      index: index === ":id" ? null : index,
      or: orCollection
    };
  }

  props(WhereClause.prototype, function () {
    // WhereClause private methods
    function fail(collectionOrWhereClause, err, T) {
      var collection = collectionOrWhereClause instanceof WhereClause ? new Collection(collectionOrWhereClause) : collectionOrWhereClause;
      collection._ctx.error = T ? new T(err) : new TypeError(err);
      return collection;
    }

    function emptyCollection(whereClause) {
      return new Collection(whereClause, function () {
        return IDBKeyRange.only("");
      }).limit(0);
    }

    function upperFactory(dir) {
      return dir === "next" ? function (s) {
        return s.toUpperCase();
      } : function (s) {
        return s.toLowerCase();
      };
    }

    function lowerFactory(dir) {
      return dir === "next" ? function (s) {
        return s.toLowerCase();
      } : function (s) {
        return s.toUpperCase();
      };
    }

    function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp, dir) {
      var length = Math.min(key.length, lowerNeedle.length);
      var llp = -1;

      for (var i = 0; i < length; ++i) {
        var lwrKeyChar = lowerKey[i];

        if (lwrKeyChar !== lowerNeedle[i]) {
          if (cmp(key[i], upperNeedle[i]) < 0) return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
          if (cmp(key[i], lowerNeedle[i]) < 0) return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
          if (llp >= 0) return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
          return null;
        }

        if (cmp(key[i], lwrKeyChar) < 0) llp = i;
      }

      if (length < lowerNeedle.length && dir === "next") return key + upperNeedle.substr(key.length);
      if (length < key.length && dir === "prev") return key.substr(0, upperNeedle.length);
      return llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1);
    }

    function addIgnoreCaseAlgorithm(whereClause, match, needles, suffix) {
      /// <param name="needles" type="Array" elementType="String"></param>
      var upper,
          lower,
          compare,
          upperNeedles,
          lowerNeedles,
          direction,
          nextKeySuffix,
          needlesLen = needles.length;

      if (!needles.every(function (s) {
        return typeof s === 'string';
      })) {
        return fail(whereClause, STRING_EXPECTED);
      }

      function initDirection(dir) {
        upper = upperFactory(dir);
        lower = lowerFactory(dir);
        compare = dir === "next" ? simpleCompare : simpleCompareReverse;
        var needleBounds = needles.map(function (needle) {
          return {
            lower: lower(needle),
            upper: upper(needle)
          };
        }).sort(function (a, b) {
          return compare(a.lower, b.lower);
        });
        upperNeedles = needleBounds.map(function (nb) {
          return nb.upper;
        });
        lowerNeedles = needleBounds.map(function (nb) {
          return nb.lower;
        });
        direction = dir;
        nextKeySuffix = dir === "next" ? "" : suffix;
      }

      initDirection("next");
      var c = new Collection(whereClause, function () {
        return IDBKeyRange.bound(upperNeedles[0], lowerNeedles[needlesLen - 1] + suffix);
      });

      c._ondirectionchange = function (direction) {
        // This event onlys occur before filter is called the first time.
        initDirection(direction);
      };

      var firstPossibleNeedle = 0;

      c._addAlgorithm(function (cursor, advance, resolve) {
        /// <param name="cursor" type="IDBCursor"></param>
        /// <param name="advance" type="Function"></param>
        /// <param name="resolve" type="Function"></param>
        var key = cursor.key;
        if (typeof key !== 'string') return false;
        var lowerKey = lower(key);

        if (match(lowerKey, lowerNeedles, firstPossibleNeedle)) {
          return true;
        } else {
          var lowestPossibleCasing = null;

          for (var i = firstPossibleNeedle; i < needlesLen; ++i) {
            var casing = nextCasing(key, lowerKey, upperNeedles[i], lowerNeedles[i], compare, direction);
            if (casing === null && lowestPossibleCasing === null) firstPossibleNeedle = i + 1;else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
              lowestPossibleCasing = casing;
            }
          }

          if (lowestPossibleCasing !== null) {
            advance(function () {
              cursor.continue(lowestPossibleCasing + nextKeySuffix);
            });
          } else {
            advance(resolve);
          }

          return false;
        }
      });

      return c;
    } //
    // WhereClause public methods
    //


    return {
      between: function (lower, upper, includeLower, includeUpper) {
        /// <summary>
        ///     Filter out records whose where-field lays between given lower and upper values. Applies to Strings, Numbers and Dates.
        /// </summary>
        /// <param name="lower"></param>
        /// <param name="upper"></param>
        /// <param name="includeLower" optional="true">Whether items that equals lower should be included. Default true.</param>
        /// <param name="includeUpper" optional="true">Whether items that equals upper should be included. Default false.</param>
        /// <returns type="Collection"></returns>
        includeLower = includeLower !== false; // Default to true

        includeUpper = includeUpper === true; // Default to false

        try {
          if (cmp(lower, upper) > 0 || cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper)) return emptyCollection(this); // Workaround for idiotic W3C Specification that DataError must be thrown if lower > upper. The natural result would be to return an empty collection.

          return new Collection(this, function () {
            return IDBKeyRange.bound(lower, upper, !includeLower, !includeUpper);
          });
        } catch (e) {
          return fail(this, INVALID_KEY_ARGUMENT);
        }
      },
      equals: function (value) {
        return new Collection(this, function () {
          return IDBKeyRange.only(value);
        });
      },
      above: function (value) {
        return new Collection(this, function () {
          return IDBKeyRange.lowerBound(value, true);
        });
      },
      aboveOrEqual: function (value) {
        return new Collection(this, function () {
          return IDBKeyRange.lowerBound(value);
        });
      },
      below: function (value) {
        return new Collection(this, function () {
          return IDBKeyRange.upperBound(value, true);
        });
      },
      belowOrEqual: function (value) {
        return new Collection(this, function () {
          return IDBKeyRange.upperBound(value);
        });
      },
      startsWith: function (str) {
        /// <param name="str" type="String"></param>
        if (typeof str !== 'string') return fail(this, STRING_EXPECTED);
        return this.between(str, str + maxString, true, true);
      },
      startsWithIgnoreCase: function (str) {
        /// <param name="str" type="String"></param>
        if (str === "") return this.startsWith(str);
        return addIgnoreCaseAlgorithm(this, function (x, a) {
          return x.indexOf(a[0]) === 0;
        }, [str], maxString);
      },
      equalsIgnoreCase: function (str) {
        /// <param name="str" type="String"></param>
        return addIgnoreCaseAlgorithm(this, function (x, a) {
          return x === a[0];
        }, [str], "");
      },
      anyOfIgnoreCase: function () {
        var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
        if (set.length === 0) return emptyCollection(this);
        return addIgnoreCaseAlgorithm(this, function (x, a) {
          return a.indexOf(x) !== -1;
        }, set, "");
      },
      startsWithAnyOfIgnoreCase: function () {
        var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
        if (set.length === 0) return emptyCollection(this);
        return addIgnoreCaseAlgorithm(this, function (x, a) {
          return a.some(function (n) {
            return x.indexOf(n) === 0;
          });
        }, set, maxString);
      },
      anyOf: function () {
        var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
        var compare = ascending;

        try {
          set.sort(compare);
        } catch (e) {
          return fail(this, INVALID_KEY_ARGUMENT);
        }

        if (set.length === 0) return emptyCollection(this);
        var c = new Collection(this, function () {
          return IDBKeyRange.bound(set[0], set[set.length - 1]);
        });

        c._ondirectionchange = function (direction) {
          compare = direction === "next" ? ascending : descending;
          set.sort(compare);
        };

        var i = 0;

        c._addAlgorithm(function (cursor, advance, resolve) {
          var key = cursor.key;

          while (compare(key, set[i]) > 0) {
            // The cursor has passed beyond this key. Check next.
            ++i;

            if (i === set.length) {
              // There is no next. Stop searching.
              advance(resolve);
              return false;
            }
          }

          if (compare(key, set[i]) === 0) {
            // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
            return true;
          } else {
            // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
            advance(function () {
              cursor.continue(set[i]);
            });
            return false;
          }
        });

        return c;
      },
      notEqual: function (value) {
        return this.inAnyRange([[minKey, value], [value, maxKey]], {
          includeLowers: false,
          includeUppers: false
        });
      },
      noneOf: function () {
        var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
        if (set.length === 0) return new Collection(this); // Return entire collection.

        try {
          set.sort(ascending);
        } catch (e) {
          return fail(this, INVALID_KEY_ARGUMENT);
        } // Transform ["a","b","c"] to a set of ranges for between/above/below: [[minKey,"a"], ["a","b"], ["b","c"], ["c",maxKey]]


        var ranges = set.reduce(function (res, val) {
          return res ? res.concat([[res[res.length - 1][1], val]]) : [[minKey, val]];
        }, null);
        ranges.push([set[set.length - 1], maxKey]);
        return this.inAnyRange(ranges, {
          includeLowers: false,
          includeUppers: false
        });
      },

      /** Filter out values withing given set of ranges.
      * Example, give children and elders a rebate of 50%:
      *
      *   db.friends.where('age').inAnyRange([[0,18],[65,Infinity]]).modify({Rebate: 1/2});
      *
      * @param {(string|number|Date|Array)[][]} ranges
      * @param {{includeLowers: boolean, includeUppers: boolean}} options
      */
      inAnyRange: function (ranges, options) {
        if (ranges.length === 0) return emptyCollection(this);

        if (!ranges.every(function (range) {
          return range[0] !== undefined && range[1] !== undefined && ascending(range[0], range[1]) <= 0;
        })) {
          return fail(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", exceptions.InvalidArgument);
        }

        var includeLowers = !options || options.includeLowers !== false; // Default to true

        var includeUppers = options && options.includeUppers === true; // Default to false

        function addRange(ranges, newRange) {
          for (var i = 0, l = ranges.length; i < l; ++i) {
            var range = ranges[i];

            if (cmp(newRange[0], range[1]) < 0 && cmp(newRange[1], range[0]) > 0) {
              range[0] = min(range[0], newRange[0]);
              range[1] = max(range[1], newRange[1]);
              break;
            }
          }

          if (i === l) ranges.push(newRange);
          return ranges;
        }

        var sortDirection = ascending;

        function rangeSorter(a, b) {
          return sortDirection(a[0], b[0]);
        } // Join overlapping ranges


        var set;

        try {
          set = ranges.reduce(addRange, []);
          set.sort(rangeSorter);
        } catch (ex) {
          return fail(this, INVALID_KEY_ARGUMENT);
        }

        var i = 0;
        var keyIsBeyondCurrentEntry = includeUppers ? function (key) {
          return ascending(key, set[i][1]) > 0;
        } : function (key) {
          return ascending(key, set[i][1]) >= 0;
        };
        var keyIsBeforeCurrentEntry = includeLowers ? function (key) {
          return descending(key, set[i][0]) > 0;
        } : function (key) {
          return descending(key, set[i][0]) >= 0;
        };

        function keyWithinCurrentRange(key) {
          return !keyIsBeyondCurrentEntry(key) && !keyIsBeforeCurrentEntry(key);
        }

        var checkKey = keyIsBeyondCurrentEntry;
        var c = new Collection(this, function () {
          return IDBKeyRange.bound(set[0][0], set[set.length - 1][1], !includeLowers, !includeUppers);
        });

        c._ondirectionchange = function (direction) {
          if (direction === "next") {
            checkKey = keyIsBeyondCurrentEntry;
            sortDirection = ascending;
          } else {
            checkKey = keyIsBeforeCurrentEntry;
            sortDirection = descending;
          }

          set.sort(rangeSorter);
        };

        c._addAlgorithm(function (cursor, advance, resolve) {
          var key = cursor.key;

          while (checkKey(key)) {
            // The cursor has passed beyond this key. Check next.
            ++i;

            if (i === set.length) {
              // There is no next. Stop searching.
              advance(resolve);
              return false;
            }
          }

          if (keyWithinCurrentRange(key)) {
            // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
            return true;
          } else if (cmp(key, set[i][1]) === 0 || cmp(key, set[i][0]) === 0) {
            // includeUpper or includeLower is false so keyWithinCurrentRange() returns false even though we are at range border.
            // Continue to next key but don't include this one.
            return false;
          } else {
            // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
            advance(function () {
              if (sortDirection === ascending) cursor.continue(set[i][0]);else cursor.continue(set[i][1]);
            });
            return false;
          }
        });

        return c;
      },
      startsWithAnyOf: function () {
        var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);

        if (!set.every(function (s) {
          return typeof s === 'string';
        })) {
          return fail(this, "startsWithAnyOf() only works with strings");
        }

        if (set.length === 0) return emptyCollection(this);
        return this.inAnyRange(set.map(function (str) {
          return [str, str + maxString];
        }));
      }
    };
  }); //
  //
  //
  // Collection Class
  //
  //
  //

  function Collection(whereClause, keyRangeGenerator) {
    /// <summary>
    ///
    /// </summary>
    /// <param name="whereClause" type="WhereClause">Where clause instance</param>
    /// <param name="keyRangeGenerator" value="function(){ return IDBKeyRange.bound(0,1);}" optional="true"></param>
    var keyRange = null,
        error = null;
    if (keyRangeGenerator) try {
      keyRange = keyRangeGenerator();
    } catch (ex) {
      error = ex;
    }
    var whereCtx = whereClause._ctx,
        table = whereCtx.table;
    this._ctx = {
      table: table,
      index: whereCtx.index,
      isPrimKey: !whereCtx.index || table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name,
      range: keyRange,
      keysOnly: false,
      dir: "next",
      unique: "",
      algorithm: null,
      filter: null,
      replayFilter: null,
      justLimit: true,
      isMatch: null,
      offset: 0,
      limit: Infinity,
      error: error,
      or: whereCtx.or,
      valueMapper: table.hook.reading.fire
    };
  }

  function isPlainKeyRange(ctx, ignoreLimitFilter) {
    return !(ctx.filter || ctx.algorithm || ctx.or) && (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
  }

  props(Collection.prototype, function () {
    //
    // Collection Private Functions
    //
    function addFilter(ctx, fn) {
      ctx.filter = combine(ctx.filter, fn);
    }

    function addReplayFilter(ctx, factory, isLimitFilter) {
      var curr = ctx.replayFilter;
      ctx.replayFilter = curr ? function () {
        return combine(curr(), factory());
      } : factory;
      ctx.justLimit = isLimitFilter && !curr;
    }

    function addMatchFilter(ctx, fn) {
      ctx.isMatch = combine(ctx.isMatch, fn);
    }
    /** @param ctx {
     *      isPrimKey: boolean,
     *      table: Table,
     *      index: string
     * }
     * @param store IDBObjectStore
     **/


    function getIndexOrStore(ctx, store) {
      if (ctx.isPrimKey) return store;
      var indexSpec = ctx.table.schema.idxByName[ctx.index];
      if (!indexSpec) throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + store.name + " is not indexed");
      return store.index(indexSpec.name);
    }
    /** @param ctx {
     *      isPrimKey: boolean,
     *      table: Table,
     *      index: string,
     *      keysOnly: boolean,
     *      range?: IDBKeyRange,
     *      dir: "next" | "prev"
     * }
     */


    function openCursor(ctx, store) {
      var idxOrStore = getIndexOrStore(ctx, store);
      return ctx.keysOnly && 'openKeyCursor' in idxOrStore ? idxOrStore.openKeyCursor(ctx.range || null, ctx.dir + ctx.unique) : idxOrStore.openCursor(ctx.range || null, ctx.dir + ctx.unique);
    }

    function iter(ctx, fn, resolve, reject, idbstore) {
      var filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;

      if (!ctx.or) {
        iterate(openCursor(ctx, idbstore), combine(ctx.algorithm, filter), fn, resolve, reject, !ctx.keysOnly && ctx.valueMapper);
      } else (function () {
        var set = {};
        var resolved = 0;

        function resolveboth() {
          if (++resolved === 2) resolve(); // Seems like we just support or btwn max 2 expressions, but there are no limit because we do recursion.
        }

        function union(item, cursor, advance) {
          if (!filter || filter(cursor, advance, resolveboth, reject)) {
            var primaryKey = cursor.primaryKey;
            var key = '' + primaryKey;
            if (key === '[object ArrayBuffer]') key = '' + new Uint8Array(primaryKey);

            if (!hasOwn(set, key)) {
              set[key] = true;
              fn(item, cursor, advance);
            }
          }
        }

        ctx.or._iterate(union, resolveboth, reject, idbstore);

        iterate(openCursor(ctx, idbstore), ctx.algorithm, union, resolveboth, reject, !ctx.keysOnly && ctx.valueMapper);
      })();
    }

    return {
      //
      // Collection Protected Functions
      //
      _read: function (fn, cb) {
        var ctx = this._ctx;
        return ctx.error ? ctx.table._trans(null, rejection.bind(null, ctx.error)) : ctx.table._idbstore(READONLY, fn).then(cb);
      },
      _write: function (fn) {
        var ctx = this._ctx;
        return ctx.error ? ctx.table._trans(null, rejection.bind(null, ctx.error)) : ctx.table._idbstore(READWRITE, fn, "locked"); // When doing write operations on collections, always lock the operation so that upcoming operations gets queued.
      },
      _addAlgorithm: function (fn) {
        var ctx = this._ctx;
        ctx.algorithm = combine(ctx.algorithm, fn);
      },
      _iterate: function (fn, resolve, reject, idbstore) {
        return iter(this._ctx, fn, resolve, reject, idbstore);
      },
      clone: function (props$$1) {
        var rv = Object.create(this.constructor.prototype),
            ctx = Object.create(this._ctx);
        if (props$$1) extend(ctx, props$$1);
        rv._ctx = ctx;
        return rv;
      },
      raw: function () {
        this._ctx.valueMapper = null;
        return this;
      },
      //
      // Collection Public methods
      //
      each: function (fn) {
        var ctx = this._ctx;
        return this._read(function (resolve, reject, idbstore) {
          iter(ctx, fn, resolve, reject, idbstore);
        });
      },
      count: function (cb) {
        var ctx = this._ctx;

        if (isPlainKeyRange(ctx, true)) {
          // This is a plain key range. We can use the count() method if the index.
          return this._read(function (resolve, reject, idbstore) {
            var idx = getIndexOrStore(ctx, idbstore);
            var req = ctx.range ? idx.count(ctx.range) : idx.count();
            req.onerror = eventRejectHandler(reject);

            req.onsuccess = function (e) {
              resolve(Math.min(e.target.result, ctx.limit));
            };
          }, cb);
        } else {
          // Algorithms, filters or expressions are applied. Need to count manually.
          var count = 0;
          return this._read(function (resolve, reject, idbstore) {
            iter(ctx, function () {
              ++count;
              return false;
            }, function () {
              resolve(count);
            }, reject, idbstore);
          }, cb);
        }
      },
      sortBy: function (keyPath, cb) {
        /// <param name="keyPath" type="String"></param>
        var parts = keyPath.split('.').reverse(),
            lastPart = parts[0],
            lastIndex = parts.length - 1;

        function getval(obj, i) {
          if (i) return getval(obj[parts[i]], i - 1);
          return obj[lastPart];
        }

        var order = this._ctx.dir === "next" ? 1 : -1;

        function sorter(a, b) {
          var aVal = getval(a, lastIndex),
              bVal = getval(b, lastIndex);
          return aVal < bVal ? -order : aVal > bVal ? order : 0;
        }

        return this.toArray(function (a) {
          return a.sort(sorter);
        }).then(cb);
      },
      toArray: function (cb) {
        var ctx = this._ctx;
        return this._read(function (resolve, reject, idbstore) {
          if (hasGetAll && ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
            // Special optimation if we could use IDBObjectStore.getAll() or
            // IDBKeyRange.getAll():
            var readingHook = ctx.table.hook.reading.fire;
            var idxOrStore = getIndexOrStore(ctx, idbstore);
            var req = ctx.limit < Infinity ? idxOrStore.getAll(ctx.range, ctx.limit) : idxOrStore.getAll(ctx.range);
            req.onerror = eventRejectHandler(reject);
            req.onsuccess = readingHook === mirror ? eventSuccessHandler(resolve) : eventSuccessHandler(function (res) {
              try {
                resolve(res.map(readingHook));
              } catch (e) {
                reject(e);
              }
            });
          } else {
            // Getting array through a cursor.
            var a = [];
            iter(ctx, function (item) {
              a.push(item);
            }, function arrayComplete() {
              resolve(a);
            }, reject, idbstore);
          }
        }, cb);
      },
      offset: function (offset) {
        var ctx = this._ctx;
        if (offset <= 0) return this;
        ctx.offset += offset; // For count()

        if (isPlainKeyRange(ctx)) {
          addReplayFilter(ctx, function () {
            var offsetLeft = offset;
            return function (cursor, advance) {
              if (offsetLeft === 0) return true;

              if (offsetLeft === 1) {
                --offsetLeft;
                return false;
              }

              advance(function () {
                cursor.advance(offsetLeft);
                offsetLeft = 0;
              });
              return false;
            };
          });
        } else {
          addReplayFilter(ctx, function () {
            var offsetLeft = offset;
            return function () {
              return --offsetLeft < 0;
            };
          });
        }

        return this;
      },
      limit: function (numRows) {
        this._ctx.limit = Math.min(this._ctx.limit, numRows); // For count()

        addReplayFilter(this._ctx, function () {
          var rowsLeft = numRows;
          return function (cursor, advance, resolve) {
            if (--rowsLeft <= 0) advance(resolve); // Stop after this item has been included

            return rowsLeft >= 0; // If numRows is already below 0, return false because then 0 was passed to numRows initially. Otherwise we wouldnt come here.
          };
        }, true);
        return this;
      },
      until: function (filterFunction, bIncludeStopEntry) {
        addFilter(this._ctx, function (cursor, advance, resolve) {
          if (filterFunction(cursor.value)) {
            advance(resolve);
            return bIncludeStopEntry;
          } else {
            return true;
          }
        });
        return this;
      },
      first: function (cb) {
        return this.limit(1).toArray(function (a) {
          return a[0];
        }).then(cb);
      },
      last: function (cb) {
        return this.reverse().first(cb);
      },
      filter: function (filterFunction) {
        /// <param name="jsFunctionFilter" type="Function">function(val){return true/false}</param>
        addFilter(this._ctx, function (cursor) {
          return filterFunction(cursor.value);
        }); // match filters not used in Dexie.js but can be used by 3rd part libraries to test a
        // collection for a match without querying DB. Used by Dexie.Observable.

        addMatchFilter(this._ctx, filterFunction);
        return this;
      },
      and: function (filterFunction) {
        return this.filter(filterFunction);
      },
      or: function (indexName) {
        return new WhereClause(this._ctx.table, indexName, this);
      },
      reverse: function () {
        this._ctx.dir = this._ctx.dir === "prev" ? "next" : "prev";
        if (this._ondirectionchange) this._ondirectionchange(this._ctx.dir);
        return this;
      },
      desc: function () {
        return this.reverse();
      },
      eachKey: function (cb) {
        var ctx = this._ctx;
        ctx.keysOnly = !ctx.isMatch;
        return this.each(function (val, cursor) {
          cb(cursor.key, cursor);
        });
      },
      eachUniqueKey: function (cb) {
        this._ctx.unique = "unique";
        return this.eachKey(cb);
      },
      eachPrimaryKey: function (cb) {
        var ctx = this._ctx;
        ctx.keysOnly = !ctx.isMatch;
        return this.each(function (val, cursor) {
          cb(cursor.primaryKey, cursor);
        });
      },
      keys: function (cb) {
        var ctx = this._ctx;
        ctx.keysOnly = !ctx.isMatch;
        var a = [];
        return this.each(function (item, cursor) {
          a.push(cursor.key);
        }).then(function () {
          return a;
        }).then(cb);
      },
      primaryKeys: function (cb) {
        var ctx = this._ctx;

        if (hasGetAll && ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
          // Special optimation if we could use IDBObjectStore.getAllKeys() or
          // IDBKeyRange.getAllKeys():
          return this._read(function (resolve, reject, idbstore) {
            var idxOrStore = getIndexOrStore(ctx, idbstore);
            var req = ctx.limit < Infinity ? idxOrStore.getAllKeys(ctx.range, ctx.limit) : idxOrStore.getAllKeys(ctx.range);
            req.onerror = eventRejectHandler(reject);
            req.onsuccess = eventSuccessHandler(resolve);
          }).then(cb);
        }

        ctx.keysOnly = !ctx.isMatch;
        var a = [];
        return this.each(function (item, cursor) {
          a.push(cursor.primaryKey);
        }).then(function () {
          return a;
        }).then(cb);
      },
      uniqueKeys: function (cb) {
        this._ctx.unique = "unique";
        return this.keys(cb);
      },
      firstKey: function (cb) {
        return this.limit(1).keys(function (a) {
          return a[0];
        }).then(cb);
      },
      lastKey: function (cb) {
        return this.reverse().firstKey(cb);
      },
      distinct: function () {
        var ctx = this._ctx,
            idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
        if (!idx || !idx.multi) return this; // distinct() only makes differencies on multiEntry indexes.

        var set = {};
        addFilter(this._ctx, function (cursor) {
          var strKey = cursor.primaryKey.toString(); // Converts any Date to String, String to String, Number to String and Array to comma-separated string

          var found = hasOwn(set, strKey);
          set[strKey] = true;
          return !found;
        });
        return this;
      },
      //
      // Methods that mutate storage
      //
      modify: function (changes) {
        var self = this,
            ctx = this._ctx,
            hook = ctx.table.hook,
            updatingHook = hook.updating.fire,
            deletingHook = hook.deleting.fire;
        return this._write(function (resolve, reject, idbstore, trans) {
          var modifyer;

          if (typeof changes === 'function') {
            // Changes is a function that may update, add or delete propterties or even require a deletion the object itself (delete this.item)
            if (updatingHook === nop && deletingHook === nop) {
              // Noone cares about what is being changed. Just let the modifier function be the given argument as is.
              modifyer = changes;
            } else {
              // People want to know exactly what is being modified or deleted.
              // Let modifyer be a proxy function that finds out what changes the caller is actually doing
              // and call the hooks accordingly!
              modifyer = function (item) {
                var origItem = deepClone(item); // Clone the item first so we can compare laters.

                if (changes.call(this, item, this) === false) return false; // Call the real modifyer function (If it returns false explicitely, it means it dont want to modify anyting on this object)

                if (!hasOwn(this, "value")) {
                  // The real modifyer function requests a deletion of the object. Inform the deletingHook that a deletion is taking place.
                  deletingHook.call(this, this.primKey, item, trans);
                } else {
                  // No deletion. Check what was changed
                  var objectDiff = getObjectDiff(origItem, this.value);
                  var additionalChanges = updatingHook.call(this, objectDiff, this.primKey, origItem, trans);

                  if (additionalChanges) {
                    // Hook want to apply additional modifications. Make sure to fullfill the will of the hook.
                    item = this.value;
                    keys(additionalChanges).forEach(function (keyPath) {
                      setByKeyPath(item, keyPath, additionalChanges[keyPath]); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
                    });
                  }
                }
              };
            }
          } else if (updatingHook === nop) {
            // changes is a set of {keyPath: value} and no one is listening to the updating hook.
            var keyPaths = keys(changes);
            var numKeys = keyPaths.length;

            modifyer = function (item) {
              var anythingModified = false;

              for (var i = 0; i < numKeys; ++i) {
                var keyPath = keyPaths[i],
                    val = changes[keyPath];

                if (getByKeyPath(item, keyPath) !== val) {
                  setByKeyPath(item, keyPath, val); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath

                  anythingModified = true;
                }
              }

              return anythingModified;
            };
          } else {
            // changes is a set of {keyPath: value} and people are listening to the updating hook so we need to call it and
            // allow it to add additional modifications to make.
            var origChanges = changes;
            changes = shallowClone(origChanges); // Let's work with a clone of the changes keyPath/value set so that we can restore it in case a hook extends it.

            modifyer = function (item) {
              var anythingModified = false;
              var additionalChanges = updatingHook.call(this, changes, this.primKey, deepClone(item), trans);
              if (additionalChanges) extend(changes, additionalChanges);
              keys(changes).forEach(function (keyPath) {
                var val = changes[keyPath];

                if (getByKeyPath(item, keyPath) !== val) {
                  setByKeyPath(item, keyPath, val);
                  anythingModified = true;
                }
              });
              if (additionalChanges) changes = shallowClone(origChanges); // Restore original changes for next iteration

              return anythingModified;
            };
          }

          var count = 0;
          var successCount = 0;
          var iterationComplete = false;
          var failures = [];
          var failKeys = [];
          var currentKey = null;

          function modifyItem(item, cursor) {
            currentKey = cursor.primaryKey;
            var thisContext = {
              primKey: cursor.primaryKey,
              value: item,
              onsuccess: null,
              onerror: null
            };

            function onerror(e) {
              failures.push(e);
              failKeys.push(thisContext.primKey);
              checkFinished();
              return true; // Catch these errors and let a final rejection decide whether or not to abort entire transaction
            }

            if (modifyer.call(thisContext, item, thisContext) !== false) {
              var bDelete = !hasOwn(thisContext, "value");
              ++count;
              tryCatch(function () {
                var req = bDelete ? cursor.delete() : cursor.update(thisContext.value);
                req._hookCtx = thisContext;
                req.onerror = hookedEventRejectHandler(onerror);
                req.onsuccess = hookedEventSuccessHandler(function () {
                  ++successCount;
                  checkFinished();
                });
              }, onerror);
            } else if (thisContext.onsuccess) {
              // Hook will expect either onerror or onsuccess to always be called!
              thisContext.onsuccess(thisContext.value);
            }
          }

          function doReject(e) {
            if (e) {
              failures.push(e);
              failKeys.push(currentKey);
            }

            return reject(new ModifyError("Error modifying one or more objects", failures, successCount, failKeys));
          }

          function checkFinished() {
            if (iterationComplete && successCount + failures.length === count) {
              if (failures.length > 0) doReject();else resolve(successCount);
            }
          }

          self.clone().raw()._iterate(modifyItem, function () {
            iterationComplete = true;
            checkFinished();
          }, doReject, idbstore);
        });
      },
      'delete': function () {
        var _this = this;

        var ctx = this._ctx,
            range = ctx.range,
            deletingHook = ctx.table.hook.deleting.fire,
            hasDeleteHook = deletingHook !== nop;

        if (!hasDeleteHook && isPlainKeyRange(ctx) && (ctx.isPrimKey && !hangsOnDeleteLargeKeyRange || !range)) {
          // May use IDBObjectStore.delete(IDBKeyRange) in this case (Issue #208)
          // For chromium, this is the way most optimized version.
          // For IE/Edge, this could hang the indexedDB engine and make operating system instable
          // (https://gist.github.com/dfahlander/5a39328f029de18222cf2125d56c38f7)
          return this._write(function (resolve, reject, idbstore) {
            // Our API contract is to return a count of deleted items, so we have to count() before delete().
            var onerror = eventRejectHandler(reject),
                countReq = range ? idbstore.count(range) : idbstore.count();
            countReq.onerror = onerror;

            countReq.onsuccess = function () {
              var count = countReq.result;
              tryCatch(function () {
                var delReq = range ? idbstore.delete(range) : idbstore.clear();
                delReq.onerror = onerror;

                delReq.onsuccess = function () {
                  return resolve(count);
                };
              }, function (err) {
                return reject(err);
              });
            };
          });
        } // Default version to use when collection is not a vanilla IDBKeyRange on the primary key.
        // Divide into chunks to not starve RAM.
        // If has delete hook, we will have to collect not just keys but also objects, so it will use
        // more memory and need lower chunk size.


        var CHUNKSIZE = hasDeleteHook ? 2000 : 10000;
        return this._write(function (resolve, reject, idbstore, trans) {
          var totalCount = 0; // Clone collection and change its table and set a limit of CHUNKSIZE on the cloned Collection instance.

          var collection = _this.clone({
            keysOnly: !ctx.isMatch && !hasDeleteHook
          }) // load just keys (unless filter() or and() or deleteHook has subscribers)
          .distinct() // In case multiEntry is used, never delete same key twice because resulting count
          .limit(CHUNKSIZE).raw(); // Don't filter through reading-hooks (like mapped classes etc)


          var keysOrTuples = []; // We're gonna do things on as many chunks that are needed.
          // Use recursion of nextChunk function:

          var nextChunk = function () {
            return collection.each(hasDeleteHook ? function (val, cursor) {
              // Somebody subscribes to hook('deleting'). Collect all primary keys and their values,
              // so that the hook can be called with its values in bulkDelete().
              keysOrTuples.push([cursor.primaryKey, cursor.value]);
            } : function (val, cursor) {
              // No one subscribes to hook('deleting'). Collect only primary keys:
              keysOrTuples.push(cursor.primaryKey);
            }).then(function () {
              // Chromium deletes faster when doing it in sort order.
              hasDeleteHook ? keysOrTuples.sort(function (a, b) {
                return ascending(a[0], b[0]);
              }) : keysOrTuples.sort(ascending);
              return bulkDelete(idbstore, trans, keysOrTuples, hasDeleteHook, deletingHook);
            }).then(function () {
              var count = keysOrTuples.length;
              totalCount += count;
              keysOrTuples = [];
              return count < CHUNKSIZE ? totalCount : nextChunk();
            });
          };

          resolve(nextChunk());
        });
      }
    };
  }); //
  //
  //
  // ------------------------- Help functions ---------------------------
  //
  //
  //

  function lowerVersionFirst(a, b) {
    return a._cfg.version - b._cfg.version;
  }

  function setApiOnPlace(objs, tableNames, dbschema) {
    tableNames.forEach(function (tableName) {
      var schema = dbschema[tableName];
      objs.forEach(function (obj) {
        if (!(tableName in obj)) {
          if (obj === Transaction.prototype || obj instanceof Transaction) {
            // obj is a Transaction prototype (or prototype of a subclass to Transaction)
            // Make the API a getter that returns this.table(tableName)
            setProp(obj, tableName, {
              get: function () {
                return this.table(tableName);
              }
            });
          } else {
            // Table will not be bound to a transaction (will use Dexie.currentTransaction)
            obj[tableName] = new Table(tableName, schema);
          }
        }
      });
    });
  }

  function removeTablesApi(objs) {
    objs.forEach(function (obj) {
      for (var key in obj) {
        if (obj[key] instanceof Table) delete obj[key];
      }
    });
  }

  function iterate(req, filter, fn, resolve, reject, valueMapper) {
    // Apply valueMapper (hook('reading') or mappped class)
    var mappedFn = valueMapper ? function (x, c, a) {
      return fn(valueMapper(x), c, a);
    } : fn; // Wrap fn with PSD and microtick stuff from Promise.

    var wrappedFn = wrap(mappedFn, reject);
    if (!req.onerror) req.onerror = eventRejectHandler(reject);

    if (filter) {
      req.onsuccess = trycatcher(function filter_record() {
        var cursor = req.result;

        if (cursor) {
          var c = function () {
            cursor.continue();
          };

          if (filter(cursor, function (advancer) {
            c = advancer;
          }, resolve, reject)) wrappedFn(cursor.value, cursor, function (advancer) {
            c = advancer;
          });
          c();
        } else {
          resolve();
        }
      }, reject);
    } else {
      req.onsuccess = trycatcher(function filter_record() {
        var cursor = req.result;

        if (cursor) {
          var c = function () {
            cursor.continue();
          };

          wrappedFn(cursor.value, cursor, function (advancer) {
            c = advancer;
          });
          c();
        } else {
          resolve();
        }
      }, reject);
    }
  }

  function parseIndexSyntax(indexes) {
    /// <param name="indexes" type="String"></param>
    /// <returns type="Array" elementType="IndexSpec"></returns>
    var rv = [];
    indexes.split(',').forEach(function (index) {
      index = index.trim();
      var name = index.replace(/([&*]|\+\+)/g, ""); // Remove "&", "++" and "*"
      // Let keyPath of "[a+b]" be ["a","b"]:

      var keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split('+') : name;
      rv.push(new IndexSpec(name, keyPath || null, /\&/.test(index), /\*/.test(index), /\+\+/.test(index), isArray(keyPath), /\./.test(index)));
    });
    return rv;
  }

  function cmp(key1, key2) {
    return indexedDB.cmp(key1, key2);
  }

  function min(a, b) {
    return cmp(a, b) < 0 ? a : b;
  }

  function max(a, b) {
    return cmp(a, b) > 0 ? a : b;
  }

  function ascending(a, b) {
    return indexedDB.cmp(a, b);
  }

  function descending(a, b) {
    return indexedDB.cmp(b, a);
  }

  function simpleCompare(a, b) {
    return a < b ? -1 : a === b ? 0 : 1;
  }

  function simpleCompareReverse(a, b) {
    return a > b ? -1 : a === b ? 0 : 1;
  }

  function combine(filter1, filter2) {
    return filter1 ? filter2 ? function () {
      return filter1.apply(this, arguments) && filter2.apply(this, arguments);
    } : filter1 : filter2;
  }

  function readGlobalSchema() {
    db.verno = idbdb.version / 10;
    db._dbSchema = globalSchema = {};
    dbStoreNames = slice(idbdb.objectStoreNames, 0);
    if (dbStoreNames.length === 0) return; // Database contains no stores.

    var trans = idbdb.transaction(safariMultiStoreFix(dbStoreNames), 'readonly');
    dbStoreNames.forEach(function (storeName) {
      var store = trans.objectStore(storeName),
          keyPath = store.keyPath,
          dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
      var primKey = new IndexSpec(keyPath, keyPath || "", false, false, !!store.autoIncrement, keyPath && typeof keyPath !== 'string', dotted);
      var indexes = [];

      for (var j = 0; j < store.indexNames.length; ++j) {
        var idbindex = store.index(store.indexNames[j]);
        keyPath = idbindex.keyPath;
        dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
        var index = new IndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== 'string', dotted);
        indexes.push(index);
      }

      globalSchema[storeName] = new TableSchema(storeName, primKey, indexes, {});
    });
    setApiOnPlace([allTables], keys(globalSchema), globalSchema);
  }

  function adjustToExistingIndexNames(schema, idbtrans) {
    /// <summary>
    /// Issue #30 Problem with existing db - adjust to existing index names when migrating from non-dexie db
    /// </summary>
    /// <param name="schema" type="Object">Map between name and TableSchema</param>
    /// <param name="idbtrans" type="IDBTransaction"></param>
    var storeNames = idbtrans.db.objectStoreNames;

    for (var i = 0; i < storeNames.length; ++i) {
      var storeName = storeNames[i];
      var store = idbtrans.objectStore(storeName);
      hasGetAll = 'getAll' in store;

      for (var j = 0; j < store.indexNames.length; ++j) {
        var indexName = store.indexNames[j];
        var keyPath = store.index(indexName).keyPath;
        var dexieName = typeof keyPath === 'string' ? keyPath : "[" + slice(keyPath).join('+') + "]";

        if (schema[storeName]) {
          var indexSpec = schema[storeName].idxByName[dexieName];
          if (indexSpec) indexSpec.name = indexName;
        }
      }
    } // Bug with getAll() on Safari ver<604 on Workers only, see discussion following PR #579


    if (/Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && _global.WorkerGlobalScope && _global instanceof _global.WorkerGlobalScope && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604) {
      hasGetAll = false;
    }
  }

  function fireOnBlocked(ev) {
    db.on("blocked").fire(ev); // Workaround (not fully*) for missing "versionchange" event in IE,Edge and Safari:

    connections.filter(function (c) {
      return c.name === db.name && c !== db && !c._vcFired;
    }).map(function (c) {
      return c.on("versionchange").fire(ev);
    });
  }

  extend(this, {
    Collection: Collection,
    Table: Table,
    Transaction: Transaction,
    Version: Version,
    WhereClause: WhereClause
  });
  init();
  addons.forEach(function (fn) {
    fn(db);
  });
}

function parseType(type) {
  if (typeof type === 'function') {
    return new type();
  } else if (isArray(type)) {
    return [parseType(type[0])];
  } else if (type && _typeof(type) === 'object') {
    var rv = {};
    applyStructure(rv, type);
    return rv;
  } else {
    return type;
  }
}

function applyStructure(obj, structure) {
  keys(structure).forEach(function (member) {
    var value = parseType(structure[member]);
    obj[member] = value;
  });
  return obj;
}

function hookedEventSuccessHandler(resolve) {
  // wrap() is needed when calling hooks because the rare scenario of:
  //  * hook does a db operation that fails immediately (IDB throws exception)
  //    For calling db operations on correct transaction, wrap makes sure to set PSD correctly.
  //    wrap() will also execute in a virtual tick.
  //  * If not wrapped in a virtual tick, direct exception will launch a new physical tick.
  //  * If this was the last event in the bulk, the promise will resolve after a physical tick
  //    and the transaction will have committed already.
  // If no hook, the virtual tick will be executed in the reject()/resolve of the final promise,
  // because it is always marked with _lib = true when created using Transaction._promise().
  return wrap(function (event) {
    var req = event.target,
        ctx = req._hookCtx,
        // Contains the hook error handler. Put here instead of closure to boost performance.
    result = ctx.value || req.result,
        // Pass the object value on updates. The result from IDB is the primary key.
    hookSuccessHandler = ctx && ctx.onsuccess;
    hookSuccessHandler && hookSuccessHandler(result);
    resolve && resolve(result);
  }, resolve);
}

function eventRejectHandler(reject) {
  return wrap(function (event) {
    preventDefault(event);
    reject(event.target.error);
    return false;
  });
}

function eventSuccessHandler(resolve) {
  return wrap(function (event) {
    resolve(event.target.result);
  });
}

function hookedEventRejectHandler(reject) {
  return wrap(function (event) {
    // See comment on hookedEventSuccessHandler() why wrap() is needed only when supporting hooks.
    var req = event.target,
        err = req.error,
        ctx = req._hookCtx,
        // Contains the hook error handler. Put here instead of closure to boost performance.
    hookErrorHandler = ctx && ctx.onerror;
    hookErrorHandler && hookErrorHandler(err);
    preventDefault(event);
    reject(err);
    return false;
  });
}

function preventDefault(event) {
  if (event.stopPropagation) event.stopPropagation();
  if (event.preventDefault) event.preventDefault();
}

function awaitIterator(iterator) {
  var callNext = function (result) {
    return iterator.next(result);
  },
      doThrow = function (error) {
    return iterator.throw(error);
  },
      onSuccess = step(callNext),
      onError = step(doThrow);

  function step(getNext) {
    return function (val) {
      var next = getNext(val),
          value = next.value;
      return next.done ? value : !value || typeof value.then !== 'function' ? isArray(value) ? Promise.all(value).then(onSuccess, onError) : onSuccess(value) : value.then(onSuccess, onError);
    };
  }

  return step(callNext)();
} //
// IndexSpec struct
//


function IndexSpec(name, keyPath, unique, multi, auto, compound, dotted) {
  /// <param name="name" type="String"></param>
  /// <param name="keyPath" type="String"></param>
  /// <param name="unique" type="Boolean"></param>
  /// <param name="multi" type="Boolean"></param>
  /// <param name="auto" type="Boolean"></param>
  /// <param name="compound" type="Boolean"></param>
  /// <param name="dotted" type="Boolean"></param>
  this.name = name;
  this.keyPath = keyPath;
  this.unique = unique;
  this.multi = multi;
  this.auto = auto;
  this.compound = compound;
  this.dotted = dotted;
  var keyPathSrc = typeof keyPath === 'string' ? keyPath : keyPath && '[' + [].join.call(keyPath, '+') + ']';
  this.src = (unique ? '&' : '') + (multi ? '*' : '') + (auto ? "++" : "") + keyPathSrc;
} //
// TableSchema struct
//


function TableSchema(name, primKey, indexes, instanceTemplate) {
  /// <param name="name" type="String"></param>
  /// <param name="primKey" type="IndexSpec"></param>
  /// <param name="indexes" type="Array" elementType="IndexSpec"></param>
  /// <param name="instanceTemplate" type="Object"></param>
  this.name = name;
  this.primKey = primKey || new IndexSpec();
  this.indexes = indexes || [new IndexSpec()];
  this.instanceTemplate = instanceTemplate;
  this.mappedClass = null;
  this.idxByName = arrayToObject(indexes, function (index) {
    return [index.name, index];
  });
}

function safariMultiStoreFix(storeNames) {
  return storeNames.length === 1 ? storeNames[0] : storeNames;
}

function getNativeGetDatabaseNamesFn(indexedDB) {
  var fn = indexedDB && (indexedDB.getDatabaseNames || indexedDB.webkitGetDatabaseNames);
  return fn && fn.bind(indexedDB);
} // Export Error classes


props(Dexie, fullNameExceptions); // Dexie.XXXError = class XXXError {...};
//
// Static methods and properties
// 

props(Dexie, {
  //
  // Static delete() method.
  //
  delete: function (databaseName) {
    var db = new Dexie(databaseName),
        promise = db.delete();

    promise.onblocked = function (fn) {
      db.on("blocked", fn);
      return this;
    };

    return promise;
  },
  //
  // Static exists() method.
  //
  exists: function (name) {
    return new Dexie(name).open().then(function (db) {
      db.close();
      return true;
    }).catch(Dexie.NoSuchDatabaseError, function () {
      return false;
    });
  },
  //
  // Static method for retrieving a list of all existing databases at current host.
  //
  getDatabaseNames: function (cb) {
    var getDatabaseNames = getNativeGetDatabaseNamesFn(Dexie.dependencies.indexedDB);
    return getDatabaseNames ? new Promise(function (resolve, reject) {
      var req = getDatabaseNames();

      req.onsuccess = function (event) {
        resolve(slice(event.target.result, 0)); // Converst DOMStringList to Array<String>
      };

      req.onerror = eventRejectHandler(reject);
    }).then(cb) : dbNamesDB.dbnames.toCollection().primaryKeys(cb);
  },
  defineClass: function () {
    // Default constructor able to copy given properties into this object.
    function Class(properties) {
      /// <param name="properties" type="Object" optional="true">Properties to initialize object with.
      /// </param>
      if (properties) extend(this, properties);
    }

    return Class;
  },
  applyStructure: applyStructure,
  ignoreTransaction: function (scopeFunc) {
    // In case caller is within a transaction but needs to create a separate transaction.
    // Example of usage:
    //
    // Let's say we have a logger function in our app. Other application-logic should be unaware of the
    // logger function and not need to include the 'logentries' table in all transaction it performs.
    // The logging should always be done in a separate transaction and not be dependant on the current
    // running transaction context. Then you could use Dexie.ignoreTransaction() to run code that starts a new transaction.
    //
    //     Dexie.ignoreTransaction(function() {
    //         db.logentries.add(newLogEntry);
    //     });
    //
    // Unless using Dexie.ignoreTransaction(), the above example would try to reuse the current transaction
    // in current Promise-scope.
    //
    // An alternative to Dexie.ignoreTransaction() would be setImmediate() or setTimeout(). The reason we still provide an
    // API for this because
    //  1) The intention of writing the statement could be unclear if using setImmediate() or setTimeout().
    //  2) setTimeout() would wait unnescessary until firing. This is however not the case with setImmediate().
    //  3) setImmediate() is not supported in the ES standard.
    //  4) You might want to keep other PSD state that was set in a parent PSD, such as PSD.letThrough.
    return PSD.trans ? usePSD(PSD.transless, scopeFunc) : // Use the closest parent that was non-transactional.
    scopeFunc(); // No need to change scope because there is no ongoing transaction.
  },
  vip: function (fn) {
    // To be used by subscribers to the on('ready') event.
    // This will let caller through to access DB even when it is blocked while the db.ready() subscribers are firing.
    // This would have worked automatically if we were certain that the Provider was using Dexie.Promise for all asyncronic operations. The promise PSD
    // from the provider.connect() call would then be derived all the way to when provider would call localDatabase.applyChanges(). But since
    // the provider more likely is using non-promise async APIs or other thenable implementations, we cannot assume that.
    // Note that this method is only useful for on('ready') subscribers that is returning a Promise from the event. If not using vip()
    // the database could deadlock since it wont open until the returned Promise is resolved, and any non-VIPed operation started by
    // the caller will not resolve until database is opened.
    return newScope(function () {
      PSD.letThrough = true; // Make sure we are let through if still blocking db due to onready is firing.

      return fn();
    });
  },
  async: function (generatorFn) {
    return function () {
      try {
        var rv = awaitIterator(generatorFn.apply(this, arguments));
        if (!rv || typeof rv.then !== 'function') return Promise.resolve(rv);
        return rv;
      } catch (e) {
        return rejection(e);
      }
    };
  },
  spawn: function (generatorFn, args, thiz) {
    try {
      var rv = awaitIterator(generatorFn.apply(thiz, args || []));
      if (!rv || typeof rv.then !== 'function') return Promise.resolve(rv);
      return rv;
    } catch (e) {
      return rejection(e);
    }
  },
  // Dexie.currentTransaction property
  currentTransaction: {
    get: function () {
      return PSD.trans || null;
    }
  },
  waitFor: function (promiseOrFunction, optionalTimeout) {
    // If a function is provided, invoke it and pass the returning value to Transaction.waitFor()
    var promise = Promise.resolve(typeof promiseOrFunction === 'function' ? Dexie.ignoreTransaction(promiseOrFunction) : promiseOrFunction).timeout(optionalTimeout || 60000); // Default the timeout to one minute. Caller may specify Infinity if required.       
    // Run given promise on current transaction. If no current transaction, just return a Dexie promise based
    // on given value.

    return PSD.trans ? PSD.trans.waitFor(promise) : promise;
  },
  // Export our Promise implementation since it can be handy as a standalone Promise implementation
  Promise: Promise,
  // Dexie.debug proptery:
  // Dexie.debug = false
  // Dexie.debug = true
  // Dexie.debug = "dexie" - don't hide dexie's stack frames.
  debug: {
    get: function () {
      return debug;
    },
    set: function (value) {
      setDebug(value, value === 'dexie' ? function () {
        return true;
      } : dexieStackFrameFilter);
    }
  },
  // Export our derive/extend/override methodology
  derive: derive,
  extend: extend,
  props: props,
  override: override,
  // Export our Events() function - can be handy as a toolkit
  Events: Events,
  // Utilities
  getByKeyPath: getByKeyPath,
  setByKeyPath: setByKeyPath,
  delByKeyPath: delByKeyPath,
  shallowClone: shallowClone,
  deepClone: deepClone,
  getObjectDiff: getObjectDiff,
  asap: asap,
  maxKey: maxKey,
  minKey: minKey,
  // Addon registry
  addons: [],
  // Global DB connection list
  connections: connections,
  MultiModifyError: exceptions.Modify,
  errnames: errnames,
  // Export other static classes
  IndexSpec: IndexSpec,
  TableSchema: TableSchema,
  //
  // Dependencies
  //
  // These will automatically work in browsers with indexedDB support, or where an indexedDB polyfill has been included.
  //
  // In node.js, however, these properties must be set "manually" before instansiating a new Dexie().
  // For node.js, you need to require indexeddb-js or similar and then set these deps.
  //
  dependencies: function () {
    try {
      return {
        // Required:
        indexedDB: _global.indexedDB || _global.mozIndexedDB || _global.webkitIndexedDB || _global.msIndexedDB,
        IDBKeyRange: _global.IDBKeyRange || _global.webkitIDBKeyRange
      };
    } catch (e) {
      return {
        indexedDB: null,
        IDBKeyRange: null
      };
    }
  }(),
  // API Version Number: Type Number, make sure to always set a version number that can be comparable correctly. Example: 0.9, 0.91, 0.92, 1.0, 1.01, 1.1, 1.2, 1.21, etc.
  semVer: DEXIE_VERSION,
  version: DEXIE_VERSION.split('.').map(function (n) {
    return parseInt(n);
  }).reduce(function (p, c, i) {
    return p + c / Math.pow(10, i * 2);
  }),
  // https://github.com/dfahlander/Dexie.js/issues/186
  // typescript compiler tsc in mode ts-->es5 & commonJS, will expect require() to return
  // x.default. Workaround: Set Dexie.default = Dexie.
  default: Dexie,
  // Make it possible to import {Dexie} (non-default import)
  // Reason 1: May switch to that in future.
  // Reason 2: We declare it both default and named exported in d.ts to make it possible
  // to let addons extend the Dexie interface with Typescript 2.1 (works only when explicitely
  // exporting the symbol, not just default exporting)
  Dexie: Dexie
}); // Map DOMErrors and DOMExceptions to corresponding Dexie errors. May change in Dexie v2.0.

Promise.rejectionMapper = mapError; // Initialize dbNamesDB (won't ever be opened on chromium browsers')

dbNamesDB = new Dexie('__dbnames');
dbNamesDB.version(1).stores({
  dbnames: 'name'
});

(function () {
  // Migrate from Dexie 1.x database names stored in localStorage:
  var DBNAMES = 'Dexie.DatabaseNames';

  try {
    if ((typeof localStorage === "undefined" ? "undefined" : _typeof(localStorage)) !== undefined && _global.document !== undefined) {
      // Have localStorage and is not executing in a worker. Lets migrate from Dexie 1.x.
      JSON.parse(localStorage.getItem(DBNAMES) || "[]").forEach(function (name) {
        return dbNamesDB.dbnames.put({
          name: name
        }).catch(nop);
      });
      localStorage.removeItem(DBNAMES);
    }
  } catch (_e) {}
})();

var _default = Dexie;
exports.default = _default;
},{}],"models.js":[function(require,module,exports) {
"use strict";

var _mithril = _interopRequireDefault(require("mithril"));

var _dexie = _interopRequireDefault(require("dexie"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var DB = new _dexie.default("pinch_app");
DB.version(1).stores({
  ledger: 'date,desc,*tags'
});

var LedgerModel =
/*#__PURE__*/
function () {
  function LedgerModel() {
    var _this = this;

    _classCallCheck(this, LedgerModel);

    this.recent = [];
    this.db().orderBy("date").reverse().limit(8).toArray().then(function (result) {
      return (_this.recent = _this.recent.concat(result)) && _mithril.default.redraw();
    });
  }

  _createClass(LedgerModel, [{
    key: "db",
    value: function db() {
      return DB.ledger;
    }
  }, {
    key: "all",
    value: function all() {
      return this.db().orderBy("date").reverse().toArray();
    }
  }, {
    key: "put",
    value: function put(obj) {
      return this.db().put(obj);
    }
  }, {
    key: "populate",
    value: function populate() {
      var i;

      for (i = 0; i < 10; i++) {
        this.db().put({
          date: Date.now(),
          desc: "chipotle",
          amt: 12.29
        });
      }
    }
  }]);

  return LedgerModel;
}();

var Ledger = new LedgerModel();
module.exports = {
  Ledger: Ledger
};
},{"mithril":"../node_modules/mithril/index.js","dexie":"../node_modules/dexie/dist/dexie.es.js"}],"app.js":[function(require,module,exports) {
"use strict";

var _mithril = _interopRequireDefault(require("mithril"));

var _models = require("./models.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var LOREM_IPSUM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
var NBSP = "\xA0";

var $ = function $(sel, node) {
  return (node || document).querySelector(sel);
};

var fmtDate = function fmtDate(d) {
  var now = Date.now(),
      nowDay = now.getDate(),
      nowMonth = now.getMonth(),
      nowYear = now.getYear();
  var day = d.getDate(),
      month = d.getMonth(),
      year = d.getYear();
  var dayDiff = nowDay - day;

  if (day === nowDay && month === nowMonth && year === nowYear) {
    return "today";
  } else if (year < nowYear) {
    var yearDiff = nowYear - year;
    return yearDiff > 1 ? "".concat(yearDiff, " years ago") : "last year";
  } else if (dayDiff === 1 && month === nowMonth) {
    return "yesterday";
  } else if (dayDiff < 7 && month === nowMonth) {
    return "this week";
  } else if (month === nowMonth) {
    return "this month";
  } else {
    return "this year";
  }
};

var STYLES = {
  input: "block my-2 p-2 border-gray-400 focus:border-purple-400 text-lg ",
  button_primary: "p-4 bg-purple-400 text-white font-weight-700 shadow ",
  button_alt: "p-4 text-purple-400 font-weight-700 ",
  corner_button: "absolute inset-b-0 inset-r-0 m-8 rounded-full bg-purple-400 text-black text-3x font-weight-300 flex size-xl justify-center items-center "
};

var Header =
/*#__PURE__*/
function () {
  function Header() {
    _classCallCheck(this, Header);
  }

  _createClass(Header, [{
    key: "view",
    value: function view(vnode) {
      return (0, _mithril.default)("div", {
        className: "flex bg-green-600 font-weight-600 text-lg text-white py-4 justify-center shadow border-none border-b border-green-700 relative ",
        id: "header",
        style: {
          zIndex: 999
        }
      }, vnode.attrs.left ? (0, _mithril.default)("div", {
        className: "absolute inset-y-0 inset-l-0 flex justify-center items-center"
      }, vnode.attrs.left) : null, vnode.children, vnode.attrs.right ? (0, _mithril.default)("div", {
        className: "absolute inset-y-0 inset-r-0 flex justify-center items-center"
      }, vnode.attrs.right) : null);
    }
  }]);

  return Header;
}();

var MainContent =
/*#__PURE__*/
function () {
  function MainContent() {
    _classCallCheck(this, MainContent);

    this.bodyHeight = "100vh";
  }

  _createClass(MainContent, [{
    key: "oncreate",
    value: function oncreate(vnode) {
      var header = vnode.dom.querySelector('div#header');
      var headerHeight = header.getBoundingClientRect().bottom;
      this.bodyHeight = "calc(100vh - ".concat(headerHeight, "px)");

      _mithril.default.redraw();
    }
  }, {
    key: "view",
    value: function view(vnode) {
      return (0, _mithril.default)("div", {
        className: "h-100 bg-gray-100 text-rg font-weight-400 overflow-hidden"
      }, vnode.attrs.header, (0, _mithril.default)("div", {
        className: "overflow-y-auto",
        style: {
          height: vnode.state.bodyHeight
        }
      }, vnode.children));
    }
  }]);

  return MainContent;
}();

var Card =
/*#__PURE__*/
function () {
  function Card() {
    _classCallCheck(this, Card);
  }

  _createClass(Card, [{
    key: "view",
    value: function view(vnode) {
      return (0, _mithril.default)("div", {
        className: "p-4 mb-8 bg-white text-black shadow border-none relative"
      }, vnode.children);
    }
  }]);

  return Card;
}();

var NewEntryCard =
/*#__PURE__*/
function () {
  function NewEntryCard() {
    _classCallCheck(this, NewEntryCard);

    this.amtStr = "";
  }

  _createClass(NewEntryCard, [{
    key: "saveEntry",
    value: function saveEntry() {
      if (!this.amt) return;
      var entry = {
        date: Date.now(),
        amt: this.amt,
        desc: this.desc
      };

      _models.Ledger.db().put(entry);
    }
  }, {
    key: "tryParseAmt",
    value: function tryParseAmt() {
      try {
        var v = parseFloat(this.amtStr);
        this.amt = v;
        this.amtStr = null;
      } catch (e) {
        this.amt = null;
      }
    }
  }, {
    key: "view",
    value: function view(vnode) {
      var _this = this;

      return (0, _mithril.default)(Card, null, (0, _mithril.default)("div", {
        className: "relative mb-8"
      }, (0, _mithril.default)("input", {
        className: STYLES.input + "w-100 pl-8",
        type: "number",
        value: this.amtStr || this.amt && this.amt.toFixed(2) || "",
        onchange: function onchange(e) {
          return _this.amtStr = e.target.value;
        },
        onblur: function onblur(_) {
          return _this.tryParseAmt();
        }
      }), (0, _mithril.default)("div", {
        className: "absolute inset-y-0 inset-l-0 ml-2 opacity-20 text-lg flex justify-center items-center"
      }, "$")), (0, _mithril.default)("div", {
        className: "mb-8"
      }, (0, _mithril.default)("input", {
        className: STYLES.input + "w-100",
        type: "text",
        onchange: function onchange(e) {
          return _this.desc = e.target.value;
        },
        autocapitalize: "none",
        placeholder: "description"
      })), (0, _mithril.default)("div", {
        className: "flex relative justify-center items-center p-4 mt-8"
      }, NBSP, (0, _mithril.default)("a", {
        className: STYLES.button_alt + "block absolute inset-l-0",
        href: "#!/entry"
      }, "more"), (0, _mithril.default)("button", {
        className: STYLES.button_primary + "absolute inset-r-0",
        onclick: function onclick(e) {
          return _this.saveEntry();
        }
      }, "enter")));
    }
  }]);

  return NewEntryCard;
}();

var LedgerEntryList =
/*#__PURE__*/
function () {
  function LedgerEntryList() {
    _classCallCheck(this, LedgerEntryList);
  }

  _createClass(LedgerEntryList, [{
    key: "view",
    value: function view(vnode) {
      var _vnode$attrs = vnode.attrs,
          showDate = _vnode$attrs.showDate,
          list = _vnode$attrs.list;
      var gridTemplate = showDate ? "3fr 1fr 1fr" : "3fr 1fr";
      return (0, _mithril.default)("div", {
        className: "grid",
        style: {
          gridTemplateColumns: gridTemplate
        }
      }, list.map(function (entry, i) {
        var desc = (0, _mithril.default)("div", {
          className: "border-none border-b border-gray-300 p-2 ml-2"
        }, entry.desc);
        var amt = (0, _mithril.default)("div", {
          className: "border-none border-b border-gray-300 p-2 mx-2"
        }, "$", entry.amt.toFixed(2));
        var frag = showDate ? [desc, (0, _mithril.default)("div", {
          className: "border-none border-b border-gray-300 p-2 ml-2"
        }, fmtDate(entry.date)), amt] : [desc, amt];
        return _mithril.default.fragment(null, frag);
      }));
    }
  }]);

  return LedgerEntryList;
}();

var RecentEntriesCard =
/*#__PURE__*/
function () {
  function RecentEntriesCard() {
    _classCallCheck(this, RecentEntriesCard);
  }

  _createClass(RecentEntriesCard, [{
    key: "view",
    value: function view(vnode) {
      var list = vnode.attrs.list;
      return (0, _mithril.default)(Card, null, (0, _mithril.default)("div", {
        className: "text-lg text-green-600 mb-4"
      }, "recent entries"), (0, _mithril.default)(LedgerEntryList, {
        showDate: false,
        list: list
      }), (0, _mithril.default)("div", {
        className: "flex mt-2 justify-center items-center"
      }, (0, _mithril.default)(_mithril.default.route.Link, {
        className: STYLES.button_alt,
        href: "/ledger"
      }, "more")));
    }
  }]);

  return RecentEntriesCard;
}();

var HomeScreen = {
  //oninit: () => Ledger.populate(),
  view: function HomeScreen_view() {
    return (0, _mithril.default)(MainContent, {
      header: (0, _mithril.default)(Header, null, "pinch")
    }, (0, _mithril.default)(NewEntryCard, null), (0, _mithril.default)(RecentEntriesCard, {
      list: _models.Ledger.recent.slice(0, 8)
    }));
  }
};

var EditScreen =
/*#__PURE__*/
function () {
  function EditScreen() {
    _classCallCheck(this, EditScreen);
  }

  _createClass(EditScreen, [{
    key: "view",
    value: function view() {
      var btnBack = (0, _mithril.default)(_mithril.default.route.Link, {
        className: "p-4 ml-2 text-white text-rg font-weight-700",
        href: "/"
      }, (0, _mithril.default)("i", {
        className: "material-icons"
      }, "arrow_back"));
      var calIcon = "\uE916"; // date_range, but the ligatures acted fucky and was 240px wide for no reason

      return (0, _mithril.default)(MainContent, {
        header: (0, _mithril.default)(Header, {
          left: btnBack
        }, "pinch")
      }, (0, _mithril.default)(Card, null, (0, _mithril.default)("div", {
        className: "relative mb-8"
      }, (0, _mithril.default)("input", {
        className: STYLES.input + "w-100 pl-8",
        type: "number"
      }), (0, _mithril.default)("div", {
        className: "absolute inset-y-0 inset-l-0 ml-2 opacity-20 text-lg flex justify-center items-center"
      }, "$")), (0, _mithril.default)("div", {
        className: "mb-8"
      }, (0, _mithril.default)("input", {
        className: STYLES.input + "w-100",
        type: "text",
        autocapitalize: "none",
        placeholder: "description"
      })), (0, _mithril.default)("div", {
        className: "relative mb-8"
      }, (0, _mithril.default)("input", {
        className: STYLES.input + "w-100 bg-white pl-8",
        type: "date"
      }), (0, _mithril.default)("div", {
        className: "absolute inset-y-0 inset-l-0 m-0 opacity-20 text-lg flex justify-center items-center"
      }, (0, _mithril.default)("i", {
        className: "material-icons"
      }, calIcon))), (0, _mithril.default)("div", {
        className: "flex relative justify-center items-center mt-8"
      }, (0, _mithril.default)("div", {
        className: STYLES.button_primary + "mx-4 flex-grow text-center"
      }, "enter"))));
    }
  }]);

  return EditScreen;
}();

var LedgerScreen =
/*#__PURE__*/
function () {
  function LedgerScreen() {
    var _this2 = this;

    _classCallCheck(this, LedgerScreen);

    this.entries = [];

    _models.Ledger.all().then(function (arr) {
      return _this2.entries = arr;
    }).then(function (_) {
      return _mithril.default.redraw();
    });
  }

  _createClass(LedgerScreen, [{
    key: "view",
    value: function view() {
      var btnBack = (0, _mithril.default)(_mithril.default.route.Link, {
        className: "p-4 ml-2 text-white text-rg font-weight-700",
        href: "/"
      }, (0, _mithril.default)("i", {
        className: "material-icons"
      }, "arrow_back"));
      return (0, _mithril.default)(MainContent, {
        header: (0, _mithril.default)(Header, {
          left: btnBack
        }, "pinch")
      }, (0, _mithril.default)(Card, null, (0, _mithril.default)(LedgerEntryList, {
        showDate: false,
        list: this.entries
      })));
    }
  }]);

  return LedgerScreen;
}();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register("/worker.js").then(function (registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function (err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

_mithril.default.route($("#app-container"), "/", {
  "/": HomeScreen,
  "/ledger": LedgerScreen,
  "/entry": EditScreen,
  "/entry/:id": EditScreen
});
},{"mithril":"../node_modules/mithril/index.js","./models.js":"models.js","./worker.js":[["worker.js","worker.js"],"worker.js.map","worker.js"]}]},{},["app.js"], null)
//# sourceMappingURL=/app.c328ef1a.js.map