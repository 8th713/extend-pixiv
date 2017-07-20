// @flow
import {observable, computed} from 'mobx'

export class Illust {
  element: HTMLElement;
  index: number;

  constructor(element: HTMLElement, index: number) {
    this.element = element
    this.index = index
  }
}

export class IllustStore {
  @observable asc: boolean;
  @observable.shallow items: Illust[];
  lastIndex: number;

  constructor() {
    this.asc = false
    this.items = []
    this.lastIndex = 0
  }

  @computed get sortedItems(): Illust[] {
    const items = [...this.items]

    return this.asc ? items.sort((a, b) => {
      return b.index - a.index
    }) : items
  }

  push(element: HTMLElement) {
    const illust = new Illust(element, this.lastIndex++)

    this.items.push(illust)
  }

  toggle(force: boolean = !this.asc) {
    this.asc = force
  }
}
