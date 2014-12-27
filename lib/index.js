"use strict";

var xmlParser = require('./xmlParser.js');
var AnimationFrame = require('animation-frame');
// var _ = require('lodash');

AnimationFrame.FRAME_RATE = 30;
module.exports = Particle;

//TODO: This will include the whole package.json file
Particle.VERSION = require('../package.json').version;

function Particle(options) {
  this.frameId = 0;
  this.animationFrame = new AnimationFrame(options.fps);

  this._id = options.id || ('id_' + (+ new Date()));

  this.status = {
    animating: false
  };

  Particle._stats.create++;
}

Particle._stats = {
  create: 0
};

Particle.create = function(options) {
  return new Particle(options);
};

Particle.prototype.loadXml = function(xmlStr) {
  this.animData = xmlParser.parse(xmlStr);
  return this.animData;
};

Particle.prototype.start = function() {
  var AF = this.animationFrame;
  var fn = this.draw;
  var status = this.status;

  this.status.animating = true;
  this.frameId = (function loop() {
    return AF.request(function() {
      fn();
      if(status.animating) {
        loop();
      }
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
