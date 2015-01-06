
"use strict";

var Vector = require('./vector.js');

/**
 * Particle
 * @param {Object} args position, velocity
 */
function Particle(args) {
  this.image = args.image;
}

Particle.prototype.getImage = function() {

  // todo: rotate, scale

  return this.image;
};

Particle.prototype.rotate = function() {

};


module.exports = Particle;
