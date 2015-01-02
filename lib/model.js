
"use strict";

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

  // destination position
  var destX = data['move_to_rect'].values[0];
  var destY = data['move_to_rect'].values[1];
  var destPosition = new Vector(destX, destY);

  Model.superClass.constructor.call(this, {
    position: originalPosition,
    life: life,
  });

}

util.extend(Model, Particle);

module.exports = Model;
