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

require('./style.less');
require('./replace-pi');

var Stream = require('stream');

var BKMK_COUNT_CLASS = 'bookmark-count';
var ROOT_SELECTOR    = '._image-items';
var ITEM_SELECTOR    = '.image-item';
var AP_TARGER        = '_image-items';
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

var pagerizeStream = PAGERIZE_EVENTS.reduce(function(stream, eventType) {
  return stream.merge(Stream.fromEventTarget(document.body, eventType));
}, new Stream());

var workList = pagerizeStream
  .filter(function(event) {
    return event.target.classList.contains(AP_TARGER);
  })
  .scan([], function(nodeList, event) {
    var index = nodeList.length;
    var newNOdeList = $$(ITEM_SELECTOR, event.target).map(function(el) {
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
    var roots = $$(ROOT_SELECTOR);

    data.forEach(function add(el, index) {
      roots[~~(index / 20)].appendChild(el);
    });
  });

workList.property($$(ITEM_SELECTOR));

require('./showcase')($$, pagerizeStream);
