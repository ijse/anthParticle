
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
  var imgData = imageLoad(data['src_ltwh'].values);
  this.image = imgData.image;
  this.imageCanvas = imgData.canvas;
  imgData = null;

  this.initAffects();
}

Model.prototype.initAffects = function() {
  // tweens
  var alphaData = this.data['alpha'].values;
  var scaleData = this.data['scale'].values;
  this.finalAlpha = util.getRandom.apply(null, alphaData)/255;
  this.fromScale = util.getRandomArbitry.apply(null, scaleData);
  this.toScale = util.getRandomArbitry.apply(null, scaleData.slice(2));
  this.alpha = 0;
  this.scale = 0;

  this.momentIn = +alphaData[2];
  this.momentOut = +alphaData[3];

};
/**
 * Initialize position data
 * @param  {number} width  scene width
 * @param  {number} height scene height
 * @param  {Vector} offset position to oriPosition and destPosition
 */
Model.prototype.initPosition = function(width, height, offsetPos) {
  var oriValues = this.data.move_from_rect.values;
  var destValues = this.data.move_to_rect.values;
  offsetPos = offsetPos instanceof Vector ? offsetPos : Vector.zero;

  function genPos(ltwh, offsetPos) {
    offsetPos = offsetPos || Vector.zero;
    var result = Vector.zero;
    var t = null;

    var x1 = (t=/^offset:(\d+)$/.exec(ltwh[0])) ? (+t[1] + offsetPos.x) : +ltwh[0];
    var y1 = (t=/^offset:(\d+)$/.exec(ltwh[1])) ? (+t[1] + offsetPos.y) : +ltwh[1];

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
  var destPosition = genPos(destValues, oriPosition).add(offset);
  debug('model destinate position', destPosition);

  // velocity: move distance per second
  var distance = destPosition.subtract(oriPosition);
  var velocity = distance.divide(this.life);

  this.oriPosition = oriPosition.add(offsetPos);
  this.position = oriPosition.copy();
  this.destPosition = destPosition.add(offsetPos);
  this.velocity = velocity;

  this.initRotation();
};

Model.prototype.initRotation = function() {
  var rotateData = this.data.rotate.values;
  var rtX = +rotateData[4];
  var rtY = +rotateData[5];
  this.rotateOn = new Vector(rtX, rtY);

  var w = this.image.width;
  var h = this.image.height;
  var iL = Math.sqrt(w*w + h*h);
  var tL = this.rotateOn.length();
  if(tL > iL) {
    this.imageCanvas = util.createCanvas(2*tL, 2*tL);
  } else {
    this.imageCanvas = util.createCanvas(2*iL, 2*iL);
  }

  this.rotateFrom = util.getRandom(rotateData[0], rotateData[1]);
  this.rotateTo = util.getRandom(rotateData[2], rotateData[3]);

  this.rotateStep = (this.rotateTo - this.rotateFrom) / this.life;
  this.rotateAngle = this.rotateFrom;

};

Model.prototype.draw = function(sceneCtx) {
  var w = this.imageCanvas.width;
  var h = this.imageCanvas.height;
  var imgCtx = this.imageCanvas.getContext('2d');
  var translateX = w/2; //w/4+this.rotateOn.x;
  var translateY = h/2; //h/4+this.rotateOn.y;
  imgCtx.save();
  imgCtx.clearRect(0, 0, w, h);
  imgCtx.globalAlpha = this.alpha;
  imgCtx.fillStyle = 'transparent';
  // debug
  // imgCtx.fillStyle = 'green';
  // imgCtx.fillRect(0, 0, w, h);
  imgCtx.translate(translateX, translateY);
  imgCtx.rotate(this.rotateAngle*Math.PI / 180);
  imgCtx.drawImage(this.image, 0, 0);

  imgCtx.scale(this.scale, this.scale);

  imgCtx.restore();

  debug('My alpha is: ', this.alpha);
  debug('My scale is: ', this.scale);

  sceneCtx.drawImage(this.imageCanvas, this.position.x, this.position.y);
};

// Model.prototype.draw = function(sceneCtx) {
//   sceneCtx.save();

//   sceneCtx.globalAlpha - this.alpha;
//   sceneCtx.fillStyle = 'transparent';
//   sceneCtx.scale(this.scale, this.scale);

//   sceneCtx.save();
//   var transVect = this.position.add(this.rotateOn);
//   sceneCtx.translate(transVect.x, transVect.y);
//   sceneCtx.rotate(this.rotateAngle*Math.PI / 180);
//   sceneCtx.restore();

//   sceneCtx.drawImage(this.image, this.position.x, this.position.y);
//   sceneCtx.restore();
// }

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
