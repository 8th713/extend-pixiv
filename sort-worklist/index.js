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

var Stream = require('stream');

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
