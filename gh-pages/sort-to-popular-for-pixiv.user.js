/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	// ==UserScript==
	// @name         Sort to popular order for pixiv
	// @version      0.2.0
	// @description  Makes possible to sort the search result to popular order.
	// @author       8th713
	// @namespace    http://8th713.tumblr.com/
	// @match        http://www.pixiv.net/search.php*
	// @match        http://www.pixiv.net/bookmark.php?id=*
	// @noframes
	// @copyright    2014, 8th713
	// @license      MIT
	// ==/UserScript==

	__webpack_require__(4);
	__webpack_require__(1);

	var Stream = __webpack_require__(3);

	var BKMK_COUNT_CLASS = 'bookmark-count';
	var SEARCH = {
	  ROOT_SELECTOR: '._image-items',
	  ITEM_SELECTOR: '.image-item',
	  AP_TARGER:     '_image-items'
	};
	var BKMK = {
	  ROOT_SELECTOR: '.display_works>ul',
	  ITEM_SELECTOR: '.display_works>ul>li',
	  AP_TARGER:     'display_works'
	};
	var PAGERIZE_EVENTS = [
	  'AutoPagerize_DOMNodeInserted',
	  'AutoPatchWork.DOMNodeInserted',
	  'AutoPagerAfterInsert'
	];

	function $$(selector, ctx) {
	  var collection = (ctx || document).querySelectorAll(selector);

	  return [].slice.call(collection);
	}

	function createBtn(text) {
	  var container = document.createElement('ul');
	  var li = document.createElement('li');
	  var btn = document.createElement('a');

	  btn.textContent = text;
	  btn.href = '';

	  li.appendChild(btn);
	  container.className = 'menu-items stp-el';
	  container.appendChild(li);
	  document.querySelector('.column-order-menu').appendChild(container);

	  return btn;
	}

	function sortByPopular(nodeList) {
	  return nodeList.slice().sort(function(a, b) {
	    var ac = -a.count;
	    var bc = -b.count;

	    if (ac !== bc) { return ac > bc ? 1 : -1; }
	    return a.index - b.index;
	  });
	}

	var preset = /^\/bookmark\.php/.test(location.pathname) ? BKMK : SEARCH;
	var pagerizeStream = PAGERIZE_EVENTS.reduce(function(stream, eventType) {
	  return stream.merge(Stream.fromEventTarget(document.body, eventType));
	}, new Stream());

	var workList = pagerizeStream
	  .filter(function(event) {
	    return event.target.classList.contains(preset.AP_TARGER);
	  })
	  .scan([], function(nodeList, event) {
	    var index = nodeList.length;
	    var newNOdeList = $$(preset.ITEM_SELECTOR, event.target).map(function(el) {
	      var bkmk = el.getElementsByClassName(BKMK_COUNT_CLASS)[0];

	      el.count = +(bkmk && bkmk.textContent || 0);
	      el.index = index++;
	      return el;
	    });

	    return nodeList.concat(newNOdeList);
	  });

	Stream.fromEventTarget(createBtn('人気順'), 'click')
	  .map(function(event) {
	    event.preventDefault();
	    return event.target.classList.toggle('current');
	  })
	  .combine(workList, function(enabled, workList) {
	    if (enabled) {
	      return sortByPopular(workList);
	    }
	    return workList;
	  })
	  .subscribe(function(data) {
	    var roots = $$(preset.ROOT_SELECTOR);

	    data.forEach(function add(el, index) {
	      roots[~~(index / 20)].appendChild(el);
	    });
	  });

	workList.property($$(preset.ITEM_SELECTOR));

	__webpack_require__(2)($$, pagerizeStream);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	// popular-introduction をじゃまにならない場所に移動
	var pi = document.querySelector('.popular-introduction');

	if (pi) {
	  document.querySelector('._unit').insertBefore(pi);
	}


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	// 継ぎ足しページ内のショーケースアイテムを適切な位置に挿入
	var showcase = document.querySelector('.showcase>.images');

	function contains(nodeList, child) {
	  var text = child.textContent;

	  return [].some.call(nodeList, function(el) {
	    return el.textContent === text;
	  });
	}

	function remove(el) {
	  if (el.parentNode) {
	    el.parentNode.removeChild(el);
	  }
	}

	module.exports = function($$, stream) {
	  if (!showcase) { return; }

	  stream
	    .filter(function(event) {
	      return event.target.classList.contains('images');
	    })
	    .map(function(event) {
	      return $$('.image', event.target);
	    })
	    .subscribe(function(nodeList) {
	      var addNodes = document.createDocumentFragment();

	      nodeList.forEach(function(el) {
	        remove(el);
	        if (!contains(showcase.children, el)) {
	          addNodes.appendChild(el);
	        }
	      });
	      showcase.appendChild(addNodes);
	    });
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Quote from kamo.js v0.0.4
	 * (c) 2014 Ryo Nakamura (https://github.com/r7kamura/kamo.js)
	 * License: MIT
	 */

	module.exports = Stream;

	function Stream(src) {
	  this.src = src || this;
	  this.subscriptions = [];
	}

	Stream.fromEventTarget = function(target, eventType) {
	  var stream = new Stream();

	  target.addEventListener(eventType, function(event) {
	    stream.publish(event);
	  });
	  return stream;
	};

	Stream.prototype.publish = function(msg) {
	  var i = 0;
	  var len = this.subscriptions.length;

	  for (; i < len; i++) {
	    this.subscriptions[i](msg);
	  }

	  return this;
	};

	Stream.prototype.subscribe = function(subscription) {
	  this.subscriptions.push(subscription);

	  return this;
	};

	Stream.prototype.property = function(msg) {
	  this.src.publish(msg);
	  return this;
	};

	Stream.prototype.filter = function (filter) {
	  var filteredStream = new Stream(this);

	  this.subscribe(function(msg) {
	    if (filter(msg)) {
	      filteredStream.publish(msg);
	    }
	  });

	  return filteredStream;
	};

	Stream.prototype.map = function(map) {
	  var mapStream = new Stream(this);

	  this.subscribe(function(msg) {
	    mapStream.publish(map(msg));
	  });

	  return mapStream;
	};

	Stream.prototype.merge = function(stream) {
	  var mergedStream = new Stream(this);
	  var publisher = mergedStream.publish.bind(mergedStream);

	  this.subscribe(publisher);
	  stream.subscribe(publisher);

	  return mergedStream;
	};

	Stream.prototype.combine = function(anotherStream, combiner) {
	  var combinedStream = new Stream(this);
	  var latestMsgOfThis;
	  var latestMsgOfAnother;
	  var hasAnyMsgOfThis = false;
	  var hasAnyMsgOfAnother = false;

	  this.subscribe(function (msg) {
	    latestMsgOfThis = msg;
	    hasAnyMsgOfThis = true;
	    if (hasAnyMsgOfAnother) {
	      combinedStream.publish(combiner(latestMsgOfThis, latestMsgOfAnother));
	    }
	  });
	  anotherStream.subscribe(function (msg) {
	    latestMsgOfAnother = msg;
	    hasAnyMsgOfAnother = true;
	    if (hasAnyMsgOfThis) {
	      combinedStream.publish(combiner(latestMsgOfThis, latestMsgOfAnother));
	    }
	  });

	  return combinedStream;
	};

	Stream.prototype.scan = function(initial, accumulator) {
	  var accumulatorStream = new Stream(this);
	  var prevMsg = initial;

	  this.subscribe(function(msg) {
	    prevMsg = accumulator(prevMsg, msg);
	    accumulatorStream.publish(prevMsg);
	  });

	  return accumulatorStream;
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(5);
	if(typeof content === 'string') content = [module.id, content, ''];
	// add the styles to the DOM
	var update = __webpack_require__(6)(content);
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		module.hot.accept("!!D:\\Repositories\\extend-pixiv\\node_modules\\css-loader\\index.js!D:\\Repositories\\extend-pixiv\\node_modules\\less-loader\\index.js!D:\\Repositories\\extend-pixiv\\sort-to-popular\\style.less", function() {
			var newContent = require("!!D:\\Repositories\\extend-pixiv\\node_modules\\css-loader\\index.js!D:\\Repositories\\extend-pixiv\\node_modules\\less-loader\\index.js!D:\\Repositories\\extend-pixiv\\sort-to-popular\\style.less");
			if(typeof newContent === 'string') newContent = [module.id, newContent, ''];
			update(newContent);
		});
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(7)();
	exports.push([module.id, ".user-ad-container {\n  position: absolute;\n  left: 100%;\n}\n.popular-introduction {\n  position: static;\n}\n.stp-el.menu-items {\n  position: absolute;\n  right: 0;\n  top: 0;\n}\n.image-item {\n  height: 230px!important;\n}\n.pv-muted {\n  opacity: 0.2;\n  transition: opacity .2s;\n}\n.pv-muted:hover {\n  opacity: 1;\n}\n", ""]);

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {};

	module.exports = function(list) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
		var styles = listToStyles(list);
		addStylesToDom(styles);
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j]));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j]));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			// var sourceMap = item[3];
			var part = {css: css, media: media/*, sourceMap: sourceMap*/};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function addStyle(obj) {
		var styleElement = document.createElement("style");
		var head = document.head || document.getElementsByTagName("head")[0];
		styleElement.type = "text/css";
		head.appendChild(styleElement);
		applyToTag(styleElement, obj);
		return function(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media /*&& newObj.sourceMap === obj.sourceMap*/)
					return;
				applyToTag(styleElement, obj = newObj);
			} else {
				head.removeChild(styleElement);
			}
		};
	};

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		// var sourceMap = obj.sourceMap;

		// No browser support
		// if(sourceMap && typeof btoa === "function") {
			// try {
				// css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(JSON.stringify(sourceMap)) + " */";
			// } catch(e) {}
		// }
		if(media) {
			styleElement.setAttribute("media", media)
		}
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}

	}


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function() {
		var list = [];
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};
		return list;
	}

/***/ }
/******/ ])