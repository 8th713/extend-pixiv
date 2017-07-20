// @flow
/*global $ */
import {extras, reaction} from 'mobx'
import {IllustStore} from './illust'

// $FlowFixMe
extras.isolateGlobalState()

const MENU = '.column-menu>.menu-items'
const LIST = '._image-items'
const ITEM = '.image-item'
const AP_EVENT = 'AutoPagerize_DOMNodeInserted AutoPatchWork.DOMNodeInserted'

const store = new IllustStore()
const list = document.querySelector(LIST)
const $li = $('<li/>').append('<a href="#">逆順</a>')
const $a = $li.find('a')

$li.appendTo(MENU)
$li.on('click', 'a', (event: JQueryEventObject) => {
  event.preventDefault()
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
reaction(() => store.asc, (asc) => {
  $a.toggleClass('current', asc)
  sortList()
})

