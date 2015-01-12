"use strict";

var debug = require('debug')('ap:index');

var xmlParser = require('./xmlParser.js');
var AnimationFrame = require('animation-frame');
var Model = require('./model.js');
var Emitter = require('./emitter.js');
var Scene = require('./scene.js');

var util = require('./util.js');

AnimationFrame.FRAME_RATE = 30;
module.exports = AnthParticle;

//TODO: This will include the whole package.json file
AnthParticle.VERSION = require('../package.json').version;

function AnthParticle(options) {
  this.frameId = 0;
  options = options || {};
  this.fps = options.fps;
  this.animationFrame = new AnimationFrame(this.fps);

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

AnthParticle.prototype.load = function(xmlStr, pic, callback) {
  var _this = this;
  _this.stop();
  debug('start to load particle configs');
  return xmlParser
    .parse(xmlStr, function(err, data) {
      debug('configs loaded');
      _this.animData = data;

      debug('create the scene');
      // create the scene
      _this.curScene = new Scene({
        canvas: _this._canvas,
        image: pic,
        data: data.scene
      });

      callback(err);
    });

};

AnthParticle.prototype.start = function() {
  debug('start play animation frames');
  var _this = this;
  var AF = _this.animationFrame;
  var fn = _this.tick;
  var status = _this.status;
  var startTime = Date.now();

  var shouldInterval = 1000/_this.fps;
  _this.status.animating = true;

  _this.frameId = (function loop() {
    var tickTime = Date.now();
    return AF.request(function() {
      if(!status.animating) {
        return ;
      }
      // time passed since last tick
      var timePassed = Date.now() - tickTime;

      // 10% deviation
      if(Math.abs(timePassed-shouldInterval) <= (shouldInterval*0.1)) {
        fn.call(_this, timePassed, _this.fps);
      }

      loop();
    });
  }).call(_this);
};

AnthParticle.prototype.pause = function() {
  this.status.animating = false;
};

AnthParticle.prototype.play = function() {
  this.status.animating = true;
  this.start();
};

AnthParticle.prototype.stop = function() {
  debug('stop play animation frames');
  this.animationFrame.cancel(this.frameId);
  this.status.animating = false;
};

// can be overrided
AnthParticle.prototype.tick = function(timePassed, fps) {

  // current scene render
  this.curScene.render(timePassed, fps);

};
