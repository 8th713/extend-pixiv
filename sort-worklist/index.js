// ==UserScript==
// @name         Sort the work list for pixiv
// @version      0.3.0
// @description  Makes possible to toggle the asc/desc of work list.
// @author       8th713
// @namespace    http://8th713.tumblr.com/
// @match        http://www.pixiv.net/member_illust.php?id*
// @noframes
// @copyright    2014, 8th713
// @license      MIT
// ==/UserScript==

import Kefir from 'kefir';
import {
  ACTIVE_CLASS,
  $$,
  insertButton,
  createFragment,
  getApStream
} from 'utils';

const MENU_ITEMS = '.menu-items';
const IMAGE_ITEMS = '._image-items';
const IMAGE_ITEM = '.image-item';

function createList() {
  const pool = Kefir.pool();
  const list = pool
    .scan((acc, el) => acc.concat(el), [])
    .debounce(0);

  list.add = (el) => {
    pool.plug(Kefir.constant(el));
  };

  return list;
}

const listStream = createList();

insertButton('古い順', MENU_ITEMS)
  .map(event => {
    return event.target.classList.contains(ACTIVE_CLASS);
  })
  .combine(listStream, (sorted, list) => {
    if (sorted) {
      return list.slice().reverse();
    }
    return list.slice();
  })
  .map(createFragment)
  .onValue(fragment => {
    document.querySelector(IMAGE_ITEMS).appendChild(fragment);
  });

getApStream()
  .map(event => event.target)
  .onValue(listStream.add);

$$(IMAGE_ITEM).forEach(listStream.add);
