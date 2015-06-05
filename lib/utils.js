import Kefir from 'kefir';

export function $$(selector, ctx) {
  let collection = (ctx || document).querySelectorAll(selector);

  return [].slice.call(collection);
}

export const ACTIVE_CLASS = 'current';
export function insertButton(text, selector) {
  const container = document.createElement('li');
  const btn = document.createElement('a');

  btn.textContent = text;
  btn.href = '';
  container.appendChild(btn);
  document.querySelector(selector).appendChild(container);
  return Kefir.fromEvents(btn, 'click').onValue(event => {
    event.preventDefault();
    event.target.classList.toggle(ACTIVE_CLASS);
  });
}

export function createFragment(list) {
  const fragment = document.createDocumentFragment();
  const separators = $$('.autopagerize_page_separator');
  const infos = $$('.autopagerize_page_info');

  list.forEach((el, i) => {
    if (i && i % 20 === 0 && infos.length) {
      fragment.appendChild(separators.shift());
      fragment.appendChild(infos.shift());
    }
    fragment.appendChild(el);
  });

  return fragment;
}

export function getApStream() {
  return Kefir.merge([
    Kefir.fromEvents(document.body, 'AutoPagerize_DOMNodeInserted'),
    Kefir.fromEvents(document.body, 'AutoPatchWork.DOMNodeInserted')
  ]);
}
