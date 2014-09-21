// 継ぎ足しページ内のショーケースアイテムを適切な位置に挿入
var showcase = document.querySelector('.showcase>.images');

function contains(nodeList, child) {
  var text = child.textContent;

  return [].some.call(nodeList, function(el) {
    return el.textContent === text;
  });
}

function remove(el) {
  if (el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

module.exports = function($$, stream) {
  if (!showcase) { return; }

  stream
    .filter(function(event) {
      return event.target.classList.contains('images');
    })
    .map(function(event) {
      return $$('.image', event.target);
    })
    .subscribe(function(nodeList) {
      var addNodes = document.createDocumentFragment();

      nodeList.forEach(function(el) {
        remove(el);
        if (!contains(showcase.children, el)) {
          addNodes.appendChild(el);
        }
      });
      showcase.appendChild(addNodes);
    });
};
