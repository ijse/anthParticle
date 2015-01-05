
"use strict";

var Vector = require('./vector.js');

/**
 * Particle
 * @param {Object} args position, velocity
 */
function Particle(args) {
  this.position = args.position;
  this.velocity = args.velocity;
  this.acceleration = Vector.zero;
  this.image = args.image;
}

Particle.prototype.move = function() {
  this.position = this.position.add(this.velocity);
  // this.velocity = this.velocity.add(this.acceleration);
};

Particle.prototype.getImage = function() {

  // todo: rotate, scale

  return this.image;
};


module.exports = Particle;
