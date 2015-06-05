// ==UserScript==
// @name         Sort to popular order for pixiv
// @version      0.3.0
// @description  Makes possible to sort the search result to popular order.
// @author       8th713
// @namespace    http://8th713.tumblr.com/
// @match        http://www.pixiv.net/search.php*
// @match        http://www.pixiv.net/bookmark.php?id=*
// @noframes
// @copyright    2014, 8th713
// @license      MIT
// ==/UserScript==

import './style.less';
import Kefir from 'kefir';
import {
  ACTIVE_CLASS,
  $$,
  insertButton,
  createFragment,
  getApStream
} from 'utils';

const MENU_ITEMS = '.column-order-menu > .menu-items';
const IMAGE_ITEMS = '._image-items';
const IMAGE_ITEM = '.autopagerize_page_element .image-item';
const BKMK_COUNT_CLASS = 'bookmark-count';

function createList() {
  let count = 0;
  const pool = Kefir.pool();
  const list = pool
    .map(el => {
      const bkmk = el.getElementsByClassName(BKMK_COUNT_CLASS)[0];
      const score = +(bkmk && bkmk.textContent || 0);
      const index = count++;

      el.score = score;
      el.index = index;
      return el;
    })
    .scan((acc, el) => acc.concat(el), [])
    .debounce(0);

  list.add = (el) => {
    pool.plug(Kefir.constant(el));
  };

  return list;
}

function sortByPopular(list) {
  return list.slice().sort((a, b) => {
    const aScore = -a.score;
    const bScore = -b.score;

    if (aScore !== bScore) {
      return aScore > bScore ? 1 : -1;
    }
    return a.index - b.index;
  });
}

const listStream = createList();

insertButton('人気順', MENU_ITEMS)
  .map(event => {
    return event.target.classList.contains(ACTIVE_CLASS);
  })
  .combine(listStream, (sorted, list) => {
    if (sorted) {
      return sortByPopular(list);
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
