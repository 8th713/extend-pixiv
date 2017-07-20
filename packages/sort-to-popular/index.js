// @flow
/* global $ */
import './style.css'
import {extras, reaction} from 'mobx'
import {IllustStore} from './illust'

// $FlowFixMe
extras.isolateGlobalState()

const BUTTON = '.menu-items a[href="/premium.php?ref=popular_d_popup&page=visitor"]'
const LIST = '.column-search-result > ._image-items'
const ITEM = `${LIST} .image-item`
const AP_EVENT = 'AutoPagerize_DOMNodeInserted AutoPatchWork.DOMNodeInserted'

const store = new IllustStore()
const list = document.querySelector(LIST)

$(BUTTON).on('click', (event: JQueryEventObject) => {
  event.preventDefault()
  event.stopPropagation()
  store.toggle()
})
$('body').on(AP_EVENT, (event: JQueryEventObject) => {
  if (event.target instanceof HTMLElement) {
    store.push(event.target)
  }
})

$(ITEM).get().forEach(store.push, store)

function sortList() {
  const fragment = document.createDocumentFragment()
  const separators = $('.autopagerize_page_separator').get()
  const infos = $('.autopagerize_page_info').get()

  if (list) {
    store.sortedItems.forEach((illust, index) => {
      if (index && index % 20 === 0 && infos.length) {
        fragment.appendChild(separators.shift());
        fragment.appendChild(infos.shift());
      }
      fragment.appendChild(illust.element);
    })
    list.appendChild(fragment)
  }
}

// $FlowFixMe
reaction(() => store.items.length, sortList, {delay: 100})
reaction(() => store.sort, (sort) => {
  $(BUTTON).parent('li').toggleClass('_selected', sort)
  sortList()
})
