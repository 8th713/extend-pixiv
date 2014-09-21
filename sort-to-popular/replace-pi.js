// popular-introduction をじゃまにならない場所に移動
var pi = document.querySelector('.popular-introduction');

if (pi) {
  document.querySelector('._unit').insertBefore(pi);
}
