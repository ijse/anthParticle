
"use strict";
var debug = require('debug')('ap:model');

var util = require('./util.js');
var Particle = require('./particle.js');
var Vector = require('./vector.js');

/**
 *
 */
function Model(data, imageLoad) {

  this.data = data;

  // random life value
  this.life = util.getRandom.apply(null, data['active_time'].values);
  this.age = 0;

  this.position = Vector.zero;
  this.oriPosition = Vector.zero;
  this.destPosition = Vector.zero;
  this.velocity = Vector.zero;
  this.acceleration = Vector.zero;

  Model.superClass.constructor.call(this, {
    image: imageLoad(data['src_ltwh'].values),
    rotate: data['rotate'].values,
    alpha: data['alpha'].values,
    scale: data['scale'].values
  });

}
util.extend(Model, Particle);

/**
 * Initialize position data
 * @param  {number} width  scene width
 * @param  {number} height scene height
 */
Model.prototype.initPosition = function(width, height) {
  var oriValues = this.data.move_from_rect.values;
  var destValues = this.data.move_to_rect.values;

  function genPos(ltwh) {
    var result = Vector.zero;
    var t = null;

    var x1 = +ltwh[0];
    var y1 = +ltwh[1];
    var x2 = (t=ltwh[2])==='match_parent' ? width : (x1+(+t));
    var y2 = (t=ltwh[3])==='match_parent' ? height : (y1+(+t));

    var x = util.getRandom(x1, x2);
    var y = util.getRandom(y1, y2);

    result = new Vector(x, y);

    return result;
  }

  // original position
  var oriPosition = genPos(oriValues);
  debug('model original position', oriPosition);

  // destination position
  var destPosition = genPos(destValues);
  debug('model destinate position', destPosition);

  // velocity: move distance per second
  var distance = destPosition.subtract(oriPosition);
  var velocity = distance.divide(this.life);

  this.oriPosition = oriPosition;
  this.position = oriPosition.copy();
  this.destPosition = destPosition;
  this.velocity = velocity;

};

Model.prototype.draw = function(ctx) {
  ctx.save();
  //TODO: transition, ...
  ctx.drawImage(this.image, this.position.x, this.position.y);
  ctx.restore();
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
