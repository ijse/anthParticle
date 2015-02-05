"use strict";

var debug = require('debug')('ap:index');

var AnimationFrame = require('animation-frame');
var Model = require('./model.js');
var Emitter = require('./emitter.js');
var Scene = require('./scene.js');

AnimationFrame.FRAME_RATE = 30;
module.exports = AnthParticle;

//TODO: This will include the whole package.json file
AnthParticle.VERSION = require('../package.json').version;

function AnthParticle(options, callback) {

  if(!options.canvas) {
    throw 'AnthParticle need canvas and loader options.';
  }

  this.frameId = 0;
  options = options || {};
  this.fps = options.fps || 60;
  this.fpsMeter = options.fpsMeter;

  this.animationFrame = new AnimationFrame(this.fps);

  this._id = options.id || ('id_' + (+ new Date()));
  this._canvas = options.canvas;

  // On which element catch touch/mouse events for touch mode
  this.touchElement = options.touchElement || this._canvas;

  this.loader = options.loader;

  this.curScene = null;
  this.emitter = null;

  this.status = {
    error: false,
    loaded: false,
    roundKey: Date.now(),
    animating: false
  };

  if(this.loader) {
    this.reload(this.loader, callback);
  }

  AnthParticle._stats.create++;

  debug('Create new anthParticle instance', this);
}

AnthParticle._stats = {
  create: 0
};

AnthParticle.prototype.reload = function(newLoader, callback) {
  var _this = this;

  if(newLoader) {
    this.loader = newLoader;
  }

  this.loader.load(function(err, data, pic) {
    if(!err) {
      // create the scene
      _this.curScene = new Scene({
        canvas: _this._canvas,
        image: pic,
        touchElement: _this.touchElement,
        data: data.scene
      });

      _this.status.loaded = true;
      _this.status.touchMode = !!data.scene.touch_mode;

      _this.stop();
    }

    callback && callback.call(_this, err);
  });

};

AnthParticle.prototype.start = function(isContinued) {
  var _this = this;

  if(!this.status.loaded) {
    throw 'anthParticle have not loaded.';
  }

  if(this.status.animating) {
    return ;
  }

  if(!isContinued) {
    this.status.roundKey = Date.now();
  }

  debug('start play animation frames');
  var AF = _this.animationFrame;
  var fn = _this.tick;
  var status = _this.status;

  var shouldInterval = 1000/_this.fps;

  _this.status.animating = true;
  _this.frameId = (function loop(key) {
    if(key !== _this.status.roundKey) {
      return ;
    }

    var tickTime = Date.now();
    return AF.request(function() {
      _this.fpsMeter && _this.fpsMeter.tickStart();
      if(!status.animating) {
        return ;
      }

      // time passed since last tick
      var timePassed = Date.now() - tickTime;

      // 10% deviation
      if(Math.abs(timePassed-shouldInterval) <= (shouldInterval*0.1)) {
        fn.call(_this, timePassed, _this.fps);
      }

      _this.fpsMeter && _this.fpsMeter.tick();

      loop(key);
    });
  }).call(_this, _this.status.roundKey);
};

AnthParticle.prototype.pause = function() {
  this.status.animating = false;
};

AnthParticle.prototype.play = function() {
  this.start(true);
};

AnthParticle.prototype.stop = function() {
  debug('stop play animation frames');
  this.animationFrame.cancel(this.frameId);
  this.status.animating = false;
  this.curScene.destroy();
};

// can be overrided
AnthParticle.prototype.tick = function(timePassed, fps) {


  // current scene render
  this.curScene.render(timePassed, fps);

};
