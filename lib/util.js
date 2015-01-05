
"use strict";

var util = module.exports = {};

util.extend = function(subClass, baseClass) {
  function Inheritance() { }
  Inheritance.prototype = baseClass.prototype;
  subClass.prototype = new Inheritance();
  subClass.prototype.constructor = subClass;
  subClass.baseConstructor = baseClass;
  subClass.superClass = baseClass.prototype;

  return subClass;
};

// function (ctor, superCtor) {
//   ctor.super_ = superCtor;
//   ctor.prototype = Object.create(superCtor.prototype, {
//     constructor: {
//       value: ctor,
//       enumerable: false,
//       writable: true,
//       configurable: true
//     }
//   });
// }

util.merge = function(out) {
  out = out || {};

  for (var i = 1; i < arguments.length; i++) {
    if (!arguments[i])
      continue;

    for (var key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key))
        out[key] = arguments[i][key];
    }
  }

  return out;
};

util.deepMerge = function(out) {
  out = out || {};

  for (var i = 1; i < arguments.length; i++) {
    var obj = arguments[i];

    if (!obj)
      continue;

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object')
          util.deepMerge(out[key]||(out[key]={}), obj[key]);
        else
          out[key] = obj[key];
      }
    }
  }

  return out;
};

util.isArray = Array.isArray || function(arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

util.type = function(obj) {
  return Object.prototype.toString.call(obj).replace(/^\[object (.+)\]$/, "$1").toLowerCase();
};

util.getRandom = function(min, max) {
  min = parseInt(min);
  max = parseInt(max);
  return Math.floor(Math.random()*(max-min)) + min;
};

util.getRandomArbitry = function(min, max) {
  min = parseFloat(min);
  max = parseFloat(max);
  return Math.random() * (max-min) + min;
};

util.createCanvas = function(w, h) {
  var canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;

  return canvas;
};

util.clipImageToCanvas = function(simg, sx, sy, dw, dh) {
  var canvas = util.createCanvas(dw, dh);
  var ctx = canvas.getContext('2d');
  ctx.drawImage(simg, sx, sy, dw, dh, 0, 0, dw, dh);

  return canvas;
};

util.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : Date.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = Date.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };
