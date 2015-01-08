
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

  // positions
  this.position = Vector.zero;
  this.oriPosition = Vector.zero;
  this.destPosition = Vector.zero;
  this.velocity = Vector.zero;
  this.acceleration = Vector.zero;

  // image in canvas
  this.image = imageLoad(data['src_ltwh'].values);
  var w = 3 * this.image.width;
  var h = 3 * this.image.height;
  this.imageCanvas = util.createCanvas(w, h);

  // tweens
  var alphaData = data['alpha'].values;
  var scaleData = data['scale'].values;
  this.finalAlpha = util.getRandom.apply(null, alphaData)/255;
  this.fromScale = util.getRandomArbitry.apply(null, scaleData);
  this.toScale = util.getRandomArbitry.apply(null, scaleData.slice(2));
  this.alpha = 0;
  this.scale = 0;

  this.momentIn = +alphaData[2];
  this.momentOut = +alphaData[3];

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

  var offset = new Vector(this.imageCanvas.width, this.imageCanvas.height);
  // original position
  var oriPosition = genPos(oriValues).subtract(offset);
  debug('model original position', oriPosition);

  // destination position
  var destPosition = genPos(destValues).add(offset);
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
  var w = this.imageCanvas.width;
  var h = this.imageCanvas.height;
  var imgCtx = this.imageCanvas.getContext('2d');
  var translateX = w/4+this.rotateOn.x;
  var translateY = h/4+this.rotateOn.y;
  imgCtx.save();
  imgCtx.clearRect(0, 0, w, h);
  imgCtx.globalAlpha = this.alpha;
  imgCtx.fillStyle = 'transparent';
  imgCtx.scale(this.scale, this.scale);
  // debug
  // imgCtx.fillStyle = 'green';
  // imgCtx.fillRect(0, 0, w, h);
  imgCtx.translate(translateX, translateY);
  imgCtx.rotate(this.rotateAngle*Math.PI / 180);
  imgCtx.drawImage(this.image, 0, 0);
  imgCtx.restore();

  debug('My alpha is: ', this.alpha);
  debug('My scale is: ', this.scale);

  sceneCtx.drawImage(this.imageCanvas, this.position.x, this.position.y);
};

Model.prototype.update = function() {
  this.move();
  //TODO: other state changes
  this.setRotate();
  this.setAlpha();
  this.setScale();

  return this;
};

Model.prototype.move = function() {
  var distance = this.velocity.multiply(this.age);
  debug('move distance: ', distance);
  this.position = this.oriPosition.add(distance);
};

Model.prototype.setRotate = function() {
  this.rotateAngle = this.rotateStep * this.age;
  debug('Rotate angule: ', this.rotateAngle);
};

Model.prototype.setAlpha = function() {
  var inStep, outStep;
  if(this.age/this.life < this.momentIn) {
    inStep = this.finalAlpha/(this.life*this.momentIn);
    this.alpha = inStep*this.age;
  } else if(this.age/this.life > this.momentOut) {
    outStep = this.finalAlpha/(this.life*this.momentOut);
    this.alpha = outStep*(this.life-this.age);
  } else {
    this.alpha = this.finalAlpha;
  }
};

Model.prototype.setScale = function() {
  var inStep, midStep, outStep;
  if(this.age/this.life < this.momentIn) {
    inStep = this.fromScale/(this.life*this.momentIn);
    this.scale = inStep*this.age;
  } else if(this.age/this.life > this.momentOut) {
    outStep = this.toScale/(this.life*this.momentOut);
    this.scale = outStep*(this.life-this.age);
  } else {
    midStep = (this.toScale - this.fromScale) / this.life;
    this.scale = this.fromScale + midStep * (this.age - this.life * this.momentIn);
  }
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
