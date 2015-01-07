
"use strict";

var Vector = require('./vector.js');

/**
 * Particle
 * @param {Object} args position, velocity
 */
function Particle(args) {
  this.rotate = args.rotate;
  this.scale = args.scale;
  this.opacity = args.opacity;
  this.image = args.image;
}

Particle.prototype.rotate = function() {

};


module.exports = Particle;
