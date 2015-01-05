"use strict";
var debug = require('debug')('ap:scene');

var Emitter = require('./emitter.js');
var util = require('./util.js');
var Vector = require('./vector.js');

function Scene(options) {
    this.canvas = options.canvas;
    this.canvas.width = parseInt(options.data['width_height'].values[0]);
    this.canvas.height = parseInt(options.data['width_height'].values[1]);
    this.maxModels = options.data.max.values[0];
    this.gravity = options.gravity || 0;
    this.actorList = [];
    this.lastEmitTime = null;

    this.emitter = new Emitter({
        position: Vector.zero,
        width: this.canvas.width,
        height: 0,
        image: options.image,
        imageScale: options.data['src_scale'].values,
        models: options.data.model
    });

    this.hireWork = util.throttle(this.hireActor, this.initialInterval || 100);
}

Scene.prototype.render = function(timePassed, fps) {
    var cvs = this.canvas;
    var ctx = this.canvas.getContext('2d');
    var nowTime = Date.now();
    var i;
    var newActor;
    var agep = 0;
    var deadList = [];

    // debug('time passed: ', timePassed);
    if(!this.lastEmitTime) {
        agep = util.getRandom(0, 100);

        this.lastEmitTime = Date.now();
    } else {
        var timeEscaped = nowTime - this.lastEmitTime;
    }

    // Create new actor if need
    if(this.actorList.length < this.maxModels) {
        this.hireWork(agep);
    }

    // Actors move and get older
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    for(i=0; i<this.actorList.length; i++) {
        var actor = this.actorList[i];

        var img = actor.getImage();

        var pos = actor.position;

        // down to the ground
        if(pos.y > (cvs.height-img.height)) {
            pos.y = (cvs.height-img.height);
        }

        ctx.drawImage(img,
            pos.x, pos.y,
            img.width, img.height);

        // debug('Draw actor at ', actor.position);

        //Update next actor status
        actor.grow(timePassed);

        if(actor.isDead()) {
            deadList.push(i);
        }
    }

    // burn the dead
    this.fireActors(deadList);

};

/**
 * Create new actor to scene
 * @param  {number} agep 0~100
 * @return {object} the new actor
 */
Scene.prototype.hireActor = function(agep) {
    var newActor = this.emitter.fire();

    var age = newActor.life * (agep%100) / 100;
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
