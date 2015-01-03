"use strict";

var debug = require('debug')('ap:index');

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

  debug('Create new anthParticle instance', this);
}

AnthParticle._stats = {
  create: 0
};

AnthParticle.util = util;

//TODO
AnthParticle.prototype.load = function(xmlStr, pic) {
  var _this = this;
  debug('start to load particle configs');
  return xmlParser
    .parse(xmlStr)
    .then(function(data) {
      _this.animData = data;
      debug('configs loaded');
      return data;
    })
    .then(function(data) {
      debug('create the scene');

      // create the scene
      _this.curScene = new Scene({
        canvas: _this._canvas,
        image: pic,
        data: data.scene
      });

    });

};

AnthParticle.prototype.start = function() {
  debug('start play animation frames');
  var _this = this;
  var AF = _this.animationFrame;
  var fn = _this.tick;
  var status = _this.status;
  var startTime = Date.now();

  _this.status.animating = true;

  _this.frameId = (function loop() {
    var tickTime = Date.now();
    return AF.request(function() {
      // time passed since last tick
      fn.call(_this, Date.now() - tickTime);
      status.animating && loop();
    });
  }).call(_this);
};

AnthParticle.prototype.stop = function() {
  debug('stop play animation frames');
  this.animationFrame.cancel(this.frameId);
  this.status.animating = false;
};

// can be overrided
AnthParticle.prototype.tick = function(timePassed) {

  // current scene render
  this.curScene.render(timePassed);

};
