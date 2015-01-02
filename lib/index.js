"use strict";

var xmlParser = require('./xmlParser.js');
var AnimationFrame = require('animation-frame');
var Model = require('./model.js');
var Emitter = require('./emitter.js');
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

  this.animPic = null;
  this.animData = null;
  this.modelList = [];
  this.particles = [];
  this.emitter = null;

  this.status = {
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
  _this.animPic = pic;
  return xmlParser
    .parse(xmlStr)
    .then(function(data) {
      _this.animData = data;
      return data;
    })
    .then(function(data) {
      var models = [].concat(data.scene.model);
      // create emitter
      _this.emitter = new Emitter({
        image: pic,
        imageScale: null,
        models: models
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
  //TODO:
  var _this = this;
  var cvs = this._canvas;
  var ctx = cvs.getContext('2d');

  //TODO: Control the emitter
  var mode = this.emitter.fire();
  if(!mode) return ;

  var img = mode.image;
  var x = util.getRandom(0, cvs.width - img.width);
  var y = util.getRandom(0, cvs.height - img.height);

  ctx.drawImage(img, x, y, mode.image.width, mode.image.height);
};
