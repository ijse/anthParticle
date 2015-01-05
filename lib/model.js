
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
  var srcLtwh = data['src_ltwh'].values;
  var image = imageLoad(srcLtwh);

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
  var velocity = destPosition.subtract(originalPosition).divide(life/1000);
  debug('model velocity', velocity);

  this.life = life;
  this.age = 0;

  Model.superClass.constructor.call(this, {
    position: originalPosition,
    velocity: velocity,
    image: image
  });

}
util.extend(Model, Particle);



Model.prototype.setAge = function(age) {
  this.age = age;
};

Model.prototype.grow = function(t) {
  this.age += parseInt(t);
};

Model.prototype.isDead = function() {
  // debug('this.life=', this.life, 'this.age=', this.age);
  return this.life <= this.age;
};


module.exports = Model;
