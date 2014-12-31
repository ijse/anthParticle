
"use strict";

var Vector = require('./vector.js');

/**
 * Particle
 * @param {Object} args position, velocity, life, color, size
 */
function Particle(args) {
  this.position = args.position;
  this.velocity = args.velocity;
  this.acceleration = Vector.zero;
  this.age = 0;
  this.life = args.life;
}

module.exports = Particle;
