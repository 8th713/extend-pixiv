// @flow
/* global $ */
import {observable, computed} from 'mobx'

export class Illust {
  element: HTMLElement;
  index: number;
  score: number;

  constructor(element: HTMLElement, index: number) {
    this.element = element
    this.index = index
    this.score = Number($(element).find('.bookmark-count').text())
  }
}

export class IllustStore {
  @observable sort: boolean;
  @observable.shallow items: Illust[];
  lastIndex: number;

  constructor() {
    this.sort = false
    this.items = []
    this.lastIndex = 0
  }

  @computed get sortedItems(): Illust[] {
    const items = [...this.items]

    return this.sort ? items.sort((a, b) => {
      const diff = b.score - a.score

      return diff || a.index - b.index
    }) : items
  }

  push(element: HTMLElement) {
    const illust = new Illust(element, this.lastIndex++)

    this.items.push(illust)
  }

  toggle(force: boolean = !this.sort) {
    this.sort = force
  }
}
