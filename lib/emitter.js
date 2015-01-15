"use strict";

var util = require('./util.js');
var Model = require('./model.js');
var Vector = require('./vector.js');
/**
 * Particle Emitter
 */
function Emitter(options) {
    // Disable cache as default
    this.spritPool = {};

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

Emitter.prototype.fire = function() {
    var _this = this;
    var modelData = this.randomModel();
    var model = new Model(modelData, function imageLoader(ltwh) {
        var result = null;

        // Cache image sprit
        if(_this.spritPool[ltwh]) {
            result = _this.spritPool[ltwh];
        } else {
            result = util.clipImageToCanvas.bind(null, _this.image).apply(null, ltwh);
            _this.spritPool[ltwh] = result;
        }

        return result;
    });

    model.initPosition(this.sceneWidth, this.sceneHeight);

    return model;
};

module.exports = Emitter;
