
"use strict";
var debug = require('debug')('ap:model');

var util = require('./util.js');
var Particle = require('./particle.js');
var Vector = require('./vector.js');

/**
 *
 */
function Model(data, imageLoad) {

  // random life value
  var minActiveTime = data['active_time'].values[0];
  var maxActiveTime = data['active_time'].values[1];
  var life = util.getRandom(minActiveTime, maxActiveTime);

  // load pic
  this.srcLtwh = data['src_ltwh'].values;
  this.image = imageLoad(this.srcLtwh);

  // original position
  var oriX = data['move_from_rect'].values[0];
  var oriY = data['move_from_rect'].values[1];
  var originalPosition = new Vector(oriX, oriY);
  debug('model original position', originalPosition);

  // destination position
  var destX = data['move_to_rect'].values[0];
  var destY = data['move_to_rect'].values[1];
  var destPosition = new Vector(destX, destY);
  debug('model destinate position', destPosition);

  // velocity
  var velocity = destPosition.subtract(originalPosition);
  debug('model velocity', velocity);

  Model.superClass.constructor.call(this, {
    position: originalPosition,
    velocity: velocity,
    life: life,
  });

}

util.extend(Model, Particle);

module.exports = Model;
