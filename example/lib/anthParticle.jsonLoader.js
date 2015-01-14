!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),n.AnthParticleJsonLoader=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

"use strict";

/**
 * anthParticleJsonLoader
 * @param  {options} options data, image
 */
function AnthParticleJsonLoader(options) {
  this.data = options.data;
  this.image = options.image;
}

AnthParticleJsonLoader.prototype.load = function(callback) {

  var data = this.data;
  if(typeof this.image === 'string') {

    var img = new Image();
    img.onload = function() {
      callback(null, data, this);
    };
    img.onerror = function() {
      callback('Image Not Found.');
    };
    img.src = this.image;
  } else {
    callback(null, data, this.image);
  }

};

module.exports = AnthParticleJsonLoader;

},{}]},{},[1])
(1)
});