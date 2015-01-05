"use strict";
var debug = require('debug')('ap:scene');

var Emitter = require('./emitter.js');
var util = require('./util.js');

function Scene(options) {
    this.canvas = options.canvas;
    this.canvas.width = parseInt(options.data['width_height'].values[0]);
    this.canvas.height = parseInt(options.data['width_height'].values[1]);
    this.maxModels = options.data.max.values[0];
    this.gravity = options.gravity || 0;
    this.actorList = [];
    this.lastEmitTime = null;

    this.emitter = new Emitter({
        image: options.image,
        imageScale: options.data['src_scale'].values,
        models: options.data.model
    });
}

Scene.prototype.render = function(timePassed, fps) {
    var cvs = this.canvas;
    var ctx = this.canvas.getContext('2d');
    var nowTime = Date.now();
    var i;
    var deadList = [];

    // debug('time passed: ', timePassed);
    if(!this.lastEmitTime) {
        this.lastEmitTime = Date.now();
    } else {
        var timeEscaped = nowTime - this.lastEmitTime;
    }

    // Create new actor if need
    if(this.actorList.length < this.maxModels) {
        // var hc = Math.floor((nowTime - this.lastEmitTime) / 500);
        // debug('we have ' + hc + ' more actor.');
        // while(hc--) {

            var newActor = this.hireActor();
            newActor.position.x = util.getRandom(0, cvs.width - newActor.image.width);
            newActor.velocity = newActor.velocity.divide(fps);

        //     debug('create new actor ', newActor.life, fps, newActor.velocity);
        // }
        // this.lastEmitTime = Date.now();
    }

    // Actors move and get older
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    for(i=0; i<this.actorList.length; i++) {
        var actor = this.actorList[i];

        var img = actor.getImage();

        // down to the ground
        if(actor.position.y > (cvs.height-img.height)) {
            actor.position.y = (cvs.height-img.height);
        }

        ctx.drawImage(img,
            actor.position.x, actor.position.y,
            img.width, img.height);

        // debug('Draw actor at ', actor.position);

        //Update next actor status
        actor.grow(timePassed);
        actor.move();

        if(actor.isDead()) {
            deadList.push(i);
        }
    }

    // burn the dead
    this.fireActors(deadList);

};

/**
 * Create new actor to scene
 * @return {object} the new actor
 */
Scene.prototype.hireActor = function(age) {
    var newActor = this.emitter.fire();
    age = age || 0;
    newActor.setAge(age);
    this.actorList.push(newActor);

    return newActor;
};

/**
 * Move actor out of scene
 * @param  {array} actorIds actor id list
 */
Scene.prototype.fireActors = function(actorIds) {

    while(actorIds.length) {
        var deadActorId = actorIds[actorIds.length-1];
        this.actorList[deadActorId] = this.actorList[this.actorList.length-1];
        this.actorList.length --;
        actorIds.length --;
        debug('actor die', deadActorId);
    }
};

module.exports = Scene;
