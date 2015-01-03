"use strict";

var Emitter = require('./emitter.js');
var util = require('./util.js');

function Scene(options) {
    this.canvas = options.canvas;
    this.maxModels = options.data.max;

    this.emitter = new Emitter({
        image: options.image,
        imageScale: options.data['src_scale'].values,
        models: options.data.model
    });
}

Scene.prototype.render = function() {
    var cvs = this.canvas;
    var ctx = this.canvas.getContext('2d');
    //
    var mode = this.emitter.fire();
    if(!mode) return;

    var img = mode.image;
    var x = util.getRandom(0, cvs.width - img.width);
    var y = util.getRandom(0, cvs.height - img.height);

    ctx.drawImage(img, x, y, mode.image.width, mode.image.height);
};

module.exports = Scene;
