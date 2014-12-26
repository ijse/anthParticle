
"use strict";

var xmlParser = require('./xmlParser.js');
var AnimationFrame = require('animation-frame');
var helper = require('./helper.js');

module.exports = Particle;
function Particle(options) {
  this.animationFrame = new AnimationFrame(options.fps);

  this._id = options.id || ('id_' + (+ new Date()));
  Particle._stats.create++;
}

// bind helper
helper.extend(Particle, helper);

Particle._stats = {
  create: 0
};

Particle.create = function(options) {
  return new Particle(options);
};

Particle.prototype.loadXml = function(xmlStr) {
  return xmlParser.parse(xmlStr);
};

