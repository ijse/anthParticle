
"use strict";
var debug = require('debug')('ap:model');

var util = require('./util.js');
// var Particle = require('./particle.js');
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

  this.image = imageLoad(data['src_ltwh'].values);

}

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

  this.initRotation();
};

Model.prototype.initRotation = function() {
  var rotateData = this.data.rotate.values;
  var rtX = +rotateData[4];
  var rtY = +rotateData[5];
  this.rotateOn = new Vector(rtX, rtY);

  this.rotateFrom = util.getRandom(rotateData[0], rotateData[1]);
  this.rotateTo = util.getRandom(rotateData[2], rotateData[3]);

  this.rotateStep = (this.rotateTo - this.rotateFrom) / this.life;
  this.rotateAngle = this.rotateFrom;

};

Model.prototype.draw = function(sceneCtx) {

  var w = 3 * this.image.width;
  var h = 3 * this.image.height;
  var imgCvs = util.createCanvas(w, h);
  var imgCtx = imgCvs.getContext('2d');
  imgCtx.save();
  imgCtx.fillStyle = 'transparent';
  // imgCtx.fillRect(0, 0, w, h);
  imgCtx.translate(w/4+this.rotateOn.x, h/4+this.rotateOn.y);
  imgCtx.rotate(this.rotateAngle*Math.PI / 180);
  imgCtx.drawImage(this.image, 0, 0);
  imgCtx.restore();

  // var rotateOn = this.rotateOn.subtract(this.position);
  sceneCtx.drawImage(imgCvs, this.position.x, this.position.y);
};

Model.prototype.update = function() {
  this.move();
  //TODO: other state changes
  this.rotate();

  return this;
};

Model.prototype.move = function() {
  var distance = this.velocity.multiply(this.age);
  debug('move distance: ', distance);
  this.position = this.oriPosition.add(distance);
};

Model.prototype.rotate = function() {
  this.rotateAngle = this.rotateStep * this.age;
  debug('Rotate angule: ', this.rotateAngle);
};

Model.prototype.setAge = function(age) {
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
