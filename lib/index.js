"use strict";

var xmlParser = require('./xmlParser.js');
var AnimationFrame = require('animation-frame');
var Model = require('./model.js');
var util = require('./util.js');
var Q = require('q');

AnimationFrame.FRAME_RATE = 30;
module.exports = Particle;

//TODO: This will include the whole package.json file
Particle.VERSION = require('../package.json').version;

function Particle(options) {
  this.frameId = 0;
  options = options || {};
  this.animationFrame = new AnimationFrame(options.fps);

  this._id = options.id || ('id_' + (+ new Date()));
  this._canvas = options.canvas;

  this.animPic = null;
  this.animData = null;
  this.modelList = [];
  this.status = {
    animating: false
  };

  Particle._stats.create++;
}

Particle._stats = {
  create: 0
};

Particle.util = util;

Particle.create = function(options) {
  return new Particle(options);
};

/**
 * Create all Models
 * @param  {array} models list
 */
Particle.prototype.initModel = function(models) {
  var def = Q.defer();
  this.modelList = [];
  for(var i=0; i<models.length; i++) {
    var modelData = models[i];
    var model = new Model(modelData);

    this.modelList.push(model);
  }
  def.resolve(this);
  return def.promise;
};

//TODO
Particle.prototype.load = function(xmlStr, pic) {
  var _this = this;
  _this.animPic = pic;
  return xmlParser
    .parse(xmlStr)
    .then(function(data) {
      _this.animData = data;
      return data;
    })
    .then(function(data) {
      // init models
      return _this.initModel(data.scene.model);
    });

};

Particle.prototype.start = function() {
  var AF = this.animationFrame;
  var fn = this.draw;
  var status = this.status;

  this.status.animating = true;
  this.frameId = (function loop() {
    return AF.request(function() {
      fn();
      status.animating && loop();
    });
  }());
};

Particle.prototype.stop = function() {
  this.animationFrame.cancel(this.frameId);
  this.status.animating = false;
};

Particle.prototype.draw = function() {
  //TODO:
  console.log('-----');
};
