
"use strict";

var xmlParser = require('./xmlParser.js');

var AnimationFrame = require('animation-frame');

module.exports = Particle;
function Particle(options) {
  //todo.
  var animationFrame = new AnimationFrame(options.fps);
}

Particle.prototype.loadXml = function(xmlStr) {
  return xmlParser.parse(xmlStr);
}

