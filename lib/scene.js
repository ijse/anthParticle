"use strict";

var Emitter = require('./emitter.js');
var util = require('./util.js');

function Scene(options) {
    this.canvas = options.canvas;
    this.maxModels = options.data.max.values[0];
    this.gravity = options.gravity || 0;
    this.actorList = [];

    this.emitter = new Emitter({
        image: options.image,
        imageScale: options.data['src_scale'].values,
        models: options.data.model
    });
}

Scene.prototype.render = function(timePassed) {
    var cvs = this.canvas;
    var ctx = this.canvas.getContext('2d');
    var i;
    var deadList = [];

    console.log('time passed: ', timePassed);

    // Create new actor if need
    if(this.actorList.length < this.maxModels) {
        var newActor = this.emitter.fire();
        this.actorList.push(newActor);
    }

    // Actors move and get older
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    for(i=0; i<this.actorList.length; i++) {
        var actor = this.actorList[i];

        var img = actor.image;
        var x = util.getRandom(0, cvs.width - img.width);
        var y = util.getRandom(0, cvs.height - img.height);

        ctx.drawImage(img, x, y, img.width, img.height);

        //actor die
        actor.life -= timePassed;
        if(actor.life < 0) {
            deadList.push(i);
        }
    }

    // burn the dead
    for(i=0; i<deadList.length; i++) {
        var deadActorId = deadList[i];
        this.actorList[deadActorId] = this.actorList[this.actorList.length-1];
        this.actorList.length --;
    }

};

module.exports = Scene;
