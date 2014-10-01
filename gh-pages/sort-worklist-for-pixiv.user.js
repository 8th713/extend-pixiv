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
	// @name         Sort the work list for pixiv
	// @version      0.2.1
	// @description  Makes possible to toggle the asc/desc of work list.
	// @author       8th713
	// @namespace    http://8th713.tumblr.com/
	// @match        http://www.pixiv.net/member_illust.php?id*
	// @noframes
	// @copyright    2014, 8th713
	// @license      MIT
	// ==/UserScript==

	var Stream = __webpack_require__(3);

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
	  var container = document.createElement('li');
	  var btn = document.createElement('a');

	  btn.textContent = text;
	  btn.href = '';
	  container.appendChild(btn);
	  document.querySelector('.menu-items').appendChild(container);

	  return btn;
	}

	var workList = PAGERIZE_EVENTS
	  .reduce(function(stream, eventType) {
	    return stream.merge(Stream.fromEventTarget(document.body, eventType));
	  }, new Stream())
	  .filter(function(event) {
	    return event.target.classList.contains('image-item');
	  })
	  .map(function(event) {
	    return $$('.image-item', event.target);
	  })
	  .scan([], function(arr, insertedNodes) {
	    return arr.concat(insertedNodes);
	  });

	Stream.fromEventTarget(createBtn('古い順'), 'click')
	  .map(function(event) {
	    event.preventDefault();
	    return event.target.classList.toggle('current');
	  })
	  .combine(workList, function(enabled, workList) {
	    if (enabled) { return workList.slice().reverse(); }
	    return workList;
	  })
	  .subscribe(function(data) {
	    var roots = $$('._image-items');

	    data.forEach(function add(el, index) {
	      roots[~~(index / 20)].appendChild(el);
	    });
	  });

	workList.property($$('.image-item'));


/***/ },
/* 1 */,
/* 2 */,
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


/***/ }
/******/ ])