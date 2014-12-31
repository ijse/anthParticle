"use strict";

var xmlParser = require('./xmlParser.js');
var AnimationFrame = require('animation-frame');
var Model = require('./model.js');
var util = require('./util.js');
var Q = require('q');

AnimationFrame.FRAME_RATE = 30;
module.exports = AnthParticle;

//TODO: This will include the whole package.json file
AnthParticle.VERSION = require('../package.json').version;

function AnthParticle(options) {
  this.frameId = 0;
  options = options || {};
  this.animationFrame = new AnimationFrame(options.fps);

  this._id = options.id || ('id_' + (+ new Date()));
  this._canvas = options.canvas;

  this.animPic = null;
  this.animData = null;
  this.modelList = [];
  this.particles = [];

  this.status = {
    animating: false
  };

  AnthParticle._stats.create++;
}

AnthParticle._stats = {
  create: 0
};

AnthParticle.util = util;

/**
 * Create all Models
 * @param  {array} models list
 */
AnthParticle.prototype.initModel = function(models) {
  var def = Q.defer();
  var _this = this;
  _this.modelList = [];

  for(var i=0; i<models.length; i++) {
    var modelData = models[i];
    var model = new Model(modelData, function imageLoader(ltwh) {
      return util.clipImageToCanvas.bind(null, _this.animPic).apply(null, ltwh);
    });

    _this.modelList.push(model);
  }
  def.resolve(_this);
  return def.promise;
};

//TODO
AnthParticle.prototype.load = function(xmlStr, pic) {
  var _this = this;
  _this.animPic = pic;
  return xmlParser
    .parse(xmlStr)
    .then(function(data) {
      _this.animData = data;
      return data;
    })
    .then(function(data) {
      // init models
      var models = [].concat(data.scene.model);
      return _this.initModel(models);
    });

};

AnthParticle.prototype.start = function() {
  var _this = this;
  var AF = _this.animationFrame;
  var fn = _this.tick;
  var status = _this.status;

  _this.status.animating = true;
  _this.frameId = (function loop() {
    return AF.request(function() {
      fn.call(_this);
      status.animating && loop();
    });
  }).call(_this);
};

AnthParticle.prototype.stop = function() {
  this.animationFrame.cancel(this.frameId);
  this.status.animating = false;
};

AnthParticle.prototype.tick = function() {
  //TODO:
  var _this = this;
  var cvs = this._canvas;
  var ctx = cvs.getContext('2d');

  var modelNo = util.getRandom(0, this.modelList.length);
  var mode = this.modelList[modelNo];
  if(!mode) return ;

  var img = mode.image;
  var x = util.getRandom(0, cvs.width - img.width);
  var y = util.getRandom(0, cvs.height - img.height);

  ctx.drawImage(img, x, y, mode.image.width, mode.image.height);
};
