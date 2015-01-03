"use strict";

var xmlParser = require('./xmlParser.js');
var AnimationFrame = require('animation-frame');
var Model = require('./model.js');
var Emitter = require('./emitter.js');
var Scene = require('./scene.js');

var util = require('./util.js');
var Q = require('q');

AnimationFrame.FRAME_RATE = 30;
module.exports = AnthParticle;

//TODO: This will include the whole package.json file
AnthParticle.VERSION = require('../package.json').version;

function AnthParticle(options) {
  this.frameId = 0;
  options = options || {};
  this.animationFrame = new AnimationFrame(options.fps);

  this._id = options.id || ('id_' + (+ new Date()));
  this._canvas = options.canvas;

  this.animData = null;
  this.curScene = null;
  this.emitter = null;

  this.status = {
    error: false,
    loading: true,
    animating: false
  };

  AnthParticle._stats.create++;
}

AnthParticle._stats = {
  create: 0
};

AnthParticle.util = util;

//TODO
AnthParticle.prototype.load = function(xmlStr, pic) {
  var _this = this;
  return xmlParser
    .parse(xmlStr)
    .then(function(data) {
      _this.animData = data;
      return data;
    })
    .then(function(data) {

      // create the scene
      _this.curScene = new Scene({
        canvas: _this._canvas,
        image: pic,
        data: data.scene
      });

    });

};

AnthParticle.prototype.start = function() {
  var _this = this;
  var AF = _this.animationFrame;
  var fn = _this.tick;
  var status = _this.status;

  _this.status.animating = true;
  _this.frameId = (function loop() {
    return AF.request(function() {
      fn.call(_this);
      status.animating && loop();
    });
  }).call(_this);
};

AnthParticle.prototype.stop = function() {
  this.animationFrame.cancel(this.frameId);
  this.status.animating = false;
};

AnthParticle.prototype.tick = function() {

  // current scene render
  this.curScene.render();

};
