/**
 * Quote from kamo.js v0.0.4
 * (c) 2014 Ryo Nakamura (https://github.com/r7kamura/kamo.js)
 * License: MIT
 */

module.exports = Stream;

function Stream(src) {
  this.src = src || this;
  this.subscriptions = [];
}

Stream.fromEventTarget = function(target, eventType) {
  var stream = new Stream();

  target.addEventListener(eventType, function(event) {
    stream.publish(event);
  });
  return stream;
};

Stream.prototype.publish = function(msg) {
  var i = 0;
  var len = this.subscriptions.length;

  for (; i < len; i++) {
    this.subscriptions[i](msg);
  }

  return this;
};

Stream.prototype.subscribe = function(subscription) {
  this.subscriptions.push(subscription);

  return this;
};

Stream.prototype.property = function(msg) {
  this.src.publish(msg);
  return this;
};

Stream.prototype.filter = function (filter) {
  var filteredStream = new Stream(this);

  this.subscribe(function(msg) {
    if (filter(msg)) {
      filteredStream.publish(msg);
    }
  });

  return filteredStream;
};

Stream.prototype.map = function(map) {
  var mapStream = new Stream(this);

  this.subscribe(function(msg) {
    mapStream.publish(map(msg));
  });

  return mapStream;
};

Stream.prototype.merge = function(stream) {
  var mergedStream = new Stream(this);
  var publisher = mergedStream.publish.bind(mergedStream);

  this.subscribe(publisher);
  stream.subscribe(publisher);

  return mergedStream;
};

Stream.prototype.combine = function(anotherStream, combiner) {
  var combinedStream = new Stream(this);
  var latestMsgOfThis;
  var latestMsgOfAnother;
  var hasAnyMsgOfThis = false;
  var hasAnyMsgOfAnother = false;

  this.subscribe(function (msg) {
    latestMsgOfThis = msg;
    hasAnyMsgOfThis = true;
    if (hasAnyMsgOfAnother) {
      combinedStream.publish(combiner(latestMsgOfThis, latestMsgOfAnother));
    }
  });
  anotherStream.subscribe(function (msg) {
    latestMsgOfAnother = msg;
    hasAnyMsgOfAnother = true;
    if (hasAnyMsgOfThis) {
      combinedStream.publish(combiner(latestMsgOfThis, latestMsgOfAnother));
    }
  });

  return combinedStream;
};

Stream.prototype.scan = function(initial, accumulator) {
  var accumulatorStream = new Stream(this);
  var prevMsg = initial;

  this.subscribe(function(msg) {
    prevMsg = accumulator(prevMsg, msg);
    accumulatorStream.publish(prevMsg);
  });

  return accumulatorStream;
};
