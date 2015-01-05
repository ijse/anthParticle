"use strict";

var util = require('./util.js');
var Model = require('./model.js');
var Vector = require('./vector.js');
/**
 * Particle Emitter
 */
function Emitter(options) {
    this.image = options.image;
    //TODO: scale image
    this.imageScale = options.imageScale;

    this.models = options.models;

    // from where the particle fire out, default is (0, 0)
    this.position = options.position || Vector.zero;
    // if there is no size, it is a dot.
    this.width = options.width || 0;
    this.height = options.height || 0;

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
    return luckyList[0][1];
};

Emitter.prototype.fire = function() {
    var _this = this;
    var modelData = this.randomModel();
    var model = new Model(modelData, function imageLoader(ltwh) {
      return util.clipImageToCanvas.bind(null, _this.image).apply(null, ltwh);
    });

    // generate the particle initial location
    if(this.width) {
        model.position.x = util.getRandom(this.position.x, this.width);
    }
    if(this.height) {
        model.position.y = util.getRandom(this.position.y, this.height);
    }

    model.oriPosition = model.position.copy();

    return model;
};

module.exports = Emitter;
