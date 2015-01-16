"use strict";
var debug = require('debug')('ap:scene');

var Emitter = require('./emitter.js');
var util = require('./util.js');
var Vector = require('./vector.js');

function Scene(options) {
    this.width = parseInt(options.data['width_height'].values[0]);
    this.height = parseInt(options.data['width_height'].values[1]);

    this.canvas = options.canvas;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.maxModels = options.data.max.values[0];
    this.gravity = options.gravity || 0;
    this.actorList = [];

    // Throttle max trigger interval
    this.initialInterval = 300;
    // Max age% initial particle
    this.initialAgep = 10;

    this.status = {
        atStart: true,
        totalever: 0
    };

    var w = options.image.width;
    var h = options.image.height;
    var imgCvs = util.createCanvas(w, h);
    var imgCtx = imgCvs.getContext('2d');
    imgCtx.drawImage(options.image, 0, 0);

    this.emitter = new Emitter({
        sceneWidth: this.width,
        sceneHeight: this.height,

        image: imgCvs,
        imageScale: options.data['src_scale'].values,

        models: options.data.model
    });

    this.initialInterval = calculateThrottleInterval(this.maxModels, options.data.model);
    this._hireActorThrottled = util.throttle(hire, this.initialInterval || 300);

    debug('initial throttle interval: ', this.initialInterval);

}

function calculateThrottleInterval(max, models) {
    /*jshint -W052*/
    var result = 0;
    var sum = 0;
    for(var i=0; i<models.length; i++) {
        var m = models[i];
        var p = m.chance_range.values[1] - m.chance_range.values[0];
        var d = +m.active_time.values[1] +~~ m.active_time.values[0];
        sum += p * d/2;
    }

    result = sum / max;

    return result;
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


    // Create new actor if need
    if(this.actorList.length < this.maxModels) {
        if(this.status.atStart) {
            agep = util.getRandom(0, this.initialAgep);
            this.hireActor(agep, true);
            debug('hire actor with throttled');
        } else {
            debug('hire actor without throttled');
            this.hireActor();
        }
    } else {
        this.status.atStart = false;
    }

    // Actors move and get older
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    for(i=0; i<this.actorList.length; i++) {
        var actor = this.actorList[i];
        actor.draw(ctx);

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
 * Actors that are fired would be here waiting for reusing.
 *
 * @param  {number} agep 0~100
 * @return {object} the new actor
 */
 function hire(scene, agep) {
     var newActor = null;
     newActor = scene.emitter.fire();

     var age = newActor.life * (agep%100) / 100;
     newActor.setAge(age);
     scene.actorList.push(newActor);

     return newActor;
 }

Scene.prototype.hireActor = function(age, isThrottled) {
    var fn = this._hireActorThrottled;
    var newActor = null;
    age = age || 0;
    if(isThrottled) {
        newActor = fn(this, age);
    } else {
        newActor = hire(this, age);
    }

    return newActor;
};

/**
 * Move actor out of scene
 * @param  {array} actorIds actor id list
 */
Scene.prototype.fireActors = function(actorIds) {

    while(actorIds.length) {
        var deadActorId = actorIds[actorIds.length-1];
        var deadActor = this.actorList[deadActorId];

        // Push in pool for reusing.
        this.emitter.addToPool(deadActor);

        this.actorList[deadActorId] = this.actorList[this.actorList.length-1];
        this.actorList.length --;
        actorIds.length --;
        debug('actor die', deadActorId);
    }
};

module.exports = Scene;
