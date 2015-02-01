"use strict";
var debug = require('debug')('ap:emitter');

var util = require('./util.js');
var Model = require('./model.js');
var Vector = require('./vector.js');
/**
 * Particle Emitter
 */
function Emitter(options) {
    // Disable cache as default
    this.spritPool = {};
    this.modelPool = [];

    this.image = options.image;
    //TODO: scale image
    this.imageScale = options.imageScale;

    this.models = options.models;

    this.sceneWidth = options.sceneWidth;
    this.sceneHeight = options.sceneHeight;

    // init chance range data
    this.chanceBox = this.models.map(function(mod) {
        var chanceRange = mod.chance_range.values;
        return [chanceRange, mod];
    });
}

Emitter.prototype.randomModel = function() {
    var chance = util.getRandomArbitry(0, 1);
    var luckyList = this.chanceBox.filter(function(t) {
        return chance >= t[0][0] && chance < t[0][1];
    }, this);
    if(!luckyList) {
        throw "Model chance range must be added up to 1.";
    }
    return luckyList[0][1];
};

Emitter.prototype.fire = function(offsetVector) {
    var _this = this;
    var modelData = this.randomModel();

    var model = null;
    function imageLoader(ltwh) {
        var result = {};

        // Cache image sprit
        if(_this.spritPool[ltwh]) {
            result = _this.spritPool[ltwh];
            debug('reuse image sprit.');
        } else {
            result.image = util.clipImageToCanvas.bind(null, _this.image).apply(null, ltwh);
            result.canvas = util.createCanvas(result.image.width*3, result.image.height*3);
            _this.spritPool[ltwh] = result;
        }

        return result;
    }

    if(this.modelPool.length > 0) {
        model = this.modelPool.pop();
        Model.call(model, modelData, imageLoader);
        debug('reuse model object', this.modelPool.length);
    } else {
        model = new Model(modelData, imageLoader);
    }

    model.initPosition(this.sceneWidth, this.sceneHeight, offsetVector);

    return model;
};

Emitter.prototype.addToPool = function(model) {
    this.modelPool.push(model);
};


module.exports = Emitter;
