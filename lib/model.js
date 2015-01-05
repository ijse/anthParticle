
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
  var life = this.generateLife(minActiveTime, maxActiveTime);

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

  // velocity: move distance per second
  var distance = destPosition.subtract(originalPosition);
  var velocity = distance.divide(life);//.multiply(1000);

  this.life = life;
  this.age = 0;

  this.oriPosition = originalPosition;
  this.position = originalPosition;
  this.velocity = velocity;
  this.acceleration = Vector.zero;

  Model.superClass.constructor.call(this, {
    image: image
  });

}
util.extend(Model, Particle);

Model.prototype.generateLife = function(min, max) {
  return util.getRandom(min, max);
};

Model.prototype.update = function() {
  this.move();
  //TODO: other state changes

  return this;
};

Particle.prototype.move = function() {

  var distance = this.velocity.multiply(this.age);
  debug('move distance: ', distance);
  this.position = this.oriPosition.add(distance);
  // this.position.y = this.oriPosition.add(distance).y;
  // this.velocity = this.velocity.add(this.acceleration);
};

Model.prototype.setAge = function(age) {
  // var delta = age - this.age;
  // this.position = this.position.add(this.velocity.multiply(this.life/delta));
  this.age = age;

  this.update();
};

Model.prototype.grow = function(t) {
  this.age += parseInt(t);

  this.update();
};

Model.prototype.isDead = function() {
  // debug('this.life=', this.life, 'this.age=', this.age);
  return this.life <= this.age;
};


module.exports = Model;
