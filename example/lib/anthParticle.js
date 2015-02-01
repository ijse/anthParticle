!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.AnthParticle=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
"use strict";
var debug = _dereq_('debug')('ap:emitter');

var util = _dereq_('./util.js');
var Model = _dereq_('./model.js');
var Vector = _dereq_('./vector.js');
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

},{"./model.js":3,"./util.js":5,"./vector.js":6,"debug":8}],2:[function(_dereq_,module,exports){
"use strict";

var debug = _dereq_('debug')('ap:index');

var AnimationFrame = _dereq_('animation-frame');
var Model = _dereq_('./model.js');
var Emitter = _dereq_('./emitter.js');
var Scene = _dereq_('./scene.js');

AnimationFrame.FRAME_RATE = 30;
module.exports = AnthParticle;

//TODO: This will include the whole package.json file
AnthParticle.VERSION = _dereq_('../package.json').version;

function AnthParticle(options, callback) {

  if(!options.canvas) {
    throw 'AnthParticle need canvas and loader options.';
  }

  this.frameId = 0;
  options = options || {};
  this.fps = options.fps || 60;
  this.fpsMeter = options.fpsMeter;

  this.animationFrame = new AnimationFrame(this.fps);

  this._id = options.id || ('id_' + (+ new Date()));
  this._canvas = options.canvas;

  // On which element catch touch/mouse events for touch mode
  this.touchElement = options.touchElement || this._canvas;

  this.loader = options.loader;

  this.curScene = null;
  this.emitter = null;

  this.status = {
    error: false,
    loaded: false,
    roundKey: Date.now(),
    animating: false
  };

  if(this.loader) {
    this.reload(this.loader, callback);
  }

  AnthParticle._stats.create++;

  debug('Create new anthParticle instance', this);
}

AnthParticle._stats = {
  create: 0
};

AnthParticle.prototype.reload = function(newLoader, callback) {
  var _this = this;

  if(newLoader) {
    this.loader = newLoader;
  }

  this.loader.load(function(err, data, pic) {
    if(!err) {
      // create the scene
      _this.curScene = new Scene({
        canvas: _this._canvas,
        image: pic,
        touchElement: _this.touchElement,
        data: data.scene
      });

      _this.status.loaded = true;
      _this.status.touchMode = !!data.scene.touch_mode;

      _this.stop();
    }

    callback && callback.call(_this, err);
  });

};

AnthParticle.prototype.start = function(isContinued) {
  var _this = this;

  if(!this.status.loaded) {
    throw 'anthParticle have not loaded.';
  }

  if(this.status.animating) {
    return ;
  }

  if(!isContinued) {
    this.status.roundKey = Date.now();
  }

  debug('start play animation frames');
  var AF = _this.animationFrame;
  var fn = _this.tick;
  var status = _this.status;

  var shouldInterval = 1000/_this.fps;

  _this.status.animating = true;
  _this.frameId = (function loop(key) {
    if(key !== _this.status.roundKey) {
      return ;
    }

    var tickTime = Date.now();
    return AF.request(function() {
      _this.fpsMeter && _this.fpsMeter.tickStart();
      if(!status.animating) {
        return ;
      }

      // time passed since last tick
      var timePassed = Date.now() - tickTime;

      // 10% deviation
      if(Math.abs(timePassed-shouldInterval) <= (shouldInterval*0.1)) {
        fn.call(_this, timePassed, _this.fps);
      }

      _this.fpsMeter && _this.fpsMeter.tick();

      loop(key);
    });
  }).call(_this, _this.status.roundKey);
};

AnthParticle.prototype.pause = function() {
  this.status.animating = false;
};

AnthParticle.prototype.play = function() {
  this.start(true);
};

AnthParticle.prototype.stop = function() {
  debug('stop play animation frames');
  this.animationFrame.cancel(this.frameId);
  this.status.animating = false;
};

// can be overrided
AnthParticle.prototype.tick = function(timePassed, fps) {


  // current scene render
  this.curScene.render(timePassed, fps);

};

},{"../package.json":11,"./emitter.js":1,"./model.js":3,"./scene.js":4,"animation-frame":7,"debug":8}],3:[function(_dereq_,module,exports){

"use strict";
var debug = _dereq_('debug')('ap:model');

var util = _dereq_('./util.js');
// var Particle = require('./particle.js');
var Vector = _dereq_('./vector.js');

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

},{"./util.js":5,"./vector.js":6,"debug":8}],4:[function(_dereq_,module,exports){
"use strict";
var debug = _dereq_('debug')('ap:scene');

var Emitter = _dereq_('./emitter.js');
var util = _dereq_('./util.js');
var Vector = _dereq_('./vector.js');

function Scene(options) {
    this.width = parseInt(options.data['width_height'].values[0]);
    this.height = parseInt(options.data['width_height'].values[1]);

    this.canvas = options.canvas;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.touchElement = options.touchElement || this.canvas;

    this.maxModels = options.data.max.values[0];
    this.gravity = options.gravity || 0;
    this.actorList = [];

    // Throttle max trigger interval
    this.initialInterval = 300;
    // Max age% initial particle
    this.initialAgep = 10;

    this.status = {
        atStart: true,
        totalever: 0,

        isTouching: false
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

    this.configTouch(options.data.touch_mode);
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

/**
 * Touch mode settings
 * @param  {object} data {values:[]}
 */
Scene.prototype.configTouch = function(data) {
    if(!data || !data.values) {
        this.touchConfig = null;
        return ;
    }
    var _this = this;
    var touchInterval = data.values[0];
    var touchNum = data.values[1];

    _this.touchConfig = {
        interval: data.values[0],
        num: data.values[1],
        position: Vector.zero
    };

    // new throttled function
    _this._hireActorThrottled = util.throttle(hire, touchInterval/touchNum);

    var updateMousePosition = util.throttle(function(event) {

        // Skip if no currentTarget
        if(!event.currentTarget) {
            return ;
        }

        var delX = _this.width / event.currentTarget.offsetWidth;
        var delY = _this.height / event.currentTarget.offsetHeight;
        _this.updatePosition(event.offsetX*delX, event.offsetY*delY);
        debug('------At:', _this.touchConfig.position);
    }, 10);

    var startTouch = function(event) {
        debug('start touching');
        _this.status.isTouching = true;
    };

    var stopTouch = function(event) {
        debug('stop touching');
        _this.status.isTouching = false;
    };

    // Update mouse position on event mouseover
    _this.touchElement.removeEventListener('mousemove', updateMousePosition, true);
    _this.touchElement.addEventListener('mousemove', updateMousePosition, true);

    // Update status
    _this.touchElement.addEventListener('mouseenter', startTouch);
    _this.touchElement.addEventListener('mouseleave', stopTouch);
};

Scene.prototype.updatePosition = function(x, y) {
    if(!this.touchConfig) {
        return ;
    }
    this.touchConfig.position.set(x, y);
};

Scene.prototype.render = function(timePassed) {
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
        if(!this.status.isTouching && this.touchConfig) {
            222;
        } else if(this.status.atStart) {
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
 function hire(_this, agep) {
     var newActor = null;
     var pos = _this.touchConfig ? _this.touchConfig.position : null;
     newActor = _this.emitter.fire(pos);

     var age = newActor.life * (agep%100) / 100;
     newActor.setAge(age);
     _this.actorList.push(newActor);

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

},{"./emitter.js":1,"./util.js":5,"./vector.js":6,"debug":8}],5:[function(_dereq_,module,exports){

"use strict";

var util = module.exports = {};

util.extend = function(subClass, baseClass) {
  function Inheritance() { }
  Inheritance.prototype = baseClass.prototype;
  subClass.prototype = new Inheritance();
  subClass.prototype.constructor = subClass;
  subClass.baseConstructor = baseClass;
  subClass.superClass = baseClass.prototype;

  return subClass;
};

// function (ctor, superCtor) {
//   ctor.super_ = superCtor;
//   ctor.prototype = Object.create(superCtor.prototype, {
//     constructor: {
//       value: ctor,
//       enumerable: false,
//       writable: true,
//       configurable: true
//     }
//   });
// }

util.merge = function(out) {
  out = out || {};

  for (var i = 1; i < arguments.length; i++) {
    if (!arguments[i])
      continue;

    for (var key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key))
        out[key] = arguments[i][key];
    }
  }

  return out;
};

util.deepMerge = function(out) {
  out = out || {};

  for (var i = 1; i < arguments.length; i++) {
    var obj = arguments[i];

    if (!obj)
      continue;

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object')
          util.deepMerge(out[key]||(out[key]={}), obj[key]);
        else
          out[key] = obj[key];
      }
    }
  }

  return out;
};

util.isArray = Array.isArray || function(arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

util.type = function(obj) {
  return Object.prototype.toString.call(obj).replace(/^\[object (.+)\]$/, "$1").toLowerCase();
};

util.getRandom = function(min, max) {
  min = parseInt(min);
  max = parseInt(max);
  return Math.floor(Math.random()*(max-min)) + min;
};

util.getRandomArbitry = function(min, max) {
  min = parseFloat(min);
  max = parseFloat(max);
  return Math.random() * (max-min) + min;
};

util.createCanvas = function(w, h) {
  var canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;

  return canvas;
};

util.clipImageToCanvas = function(simg, sx, sy, dw, dh) {
  var canvas = util.createCanvas(dw, dh);
  var ctx = canvas.getContext('2d');
  ctx.drawImage(simg, sx, sy, dw, dh, 0, 0, dw, dh);

  return canvas;
};

util.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : Date.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = Date.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

},{}],6:[function(_dereq_,module,exports){
"use strict";

/**
 * Vector
 * @param {number} x
 * @param {number} y
 */
function Vector(x, y) {
  this.x = parseFloat(x);
  this.y = parseFloat(y);
}

Vector.prototype = {
    copy: function() { return new Vector(this.x, this.y); },
    length: function() { return Math.sqrt(this.x * this.x + this.y * this.y); },
    sqrLength: function() { return this.x * this.x + this.y * this.y; },
    normalize: function() { var inv = 1/this.length(); return new Vector(this.x * inv, this.y * inv); },
    negate: function() { return new Vector(-this.x, -this.y); },
    add: function(v) { return new Vector(this.x + v.x, this.y + v.y); },
    subtract: function(v) { return new Vector(this.x - v.x, this.y - v.y); },
    multiply: function(f) { return new Vector(this.x * f, this.y * f); },
    divide: function(f) { var invf = 1/f; return new Vector(this.x * invf, this.y * invf); },
    dot: function(v) { return this.x * v.x + this.y * v.y; },
    set: function(x, y) { this.x = x; this.y = y; return this; }
};

Vector.zero = new Vector(0, 0);

module.exports = Vector;

},{}],7:[function(_dereq_,module,exports){
/**
 * An even better animation frame.
 *
 * @copyright Oleg Slobodskoi 2013
 * @website https://github.com/kof/animationFrame
 * @license MIT
 */

;(function(window) {
'use strict'

var nativeRequestAnimationFrame,
    nativeCancelAnimationFrame

// Grab the native request and cancel functions.
;(function() {
    var i,
        vendors = ['webkit', 'moz', 'ms', 'o'],
        top

    // Test if we are within a foreign domain. Use raf from the top if possible.
    try {
        // Accessing .name will throw SecurityError within a foreign domain.
        window.top.name
        top = window.top
    } catch(e) {
        top = window
    }

    nativeRequestAnimationFrame = top.requestAnimationFrame
    nativeCancelAnimationFrame = top.cancelAnimationFrame || top.cancelRequestAnimationFrame


    // Grab the native implementation.
    for (i = 0; i < vendors.length && !nativeRequestAnimationFrame; i++) {
        nativeRequestAnimationFrame = top[vendors[i] + 'RequestAnimationFrame']
        nativeCancelAnimationFrame = top[vendors[i] + 'CancelAnimationFrame'] ||
            top[vendors[i] + 'CancelRequestAnimationFrame']
    }

    // Test if native implementation works.
    // There are some issues on ios6
    // http://shitwebkitdoes.tumblr.com/post/47186945856/native-requestanimationframe-broken-on-ios-6
    // https://gist.github.com/KrofDrakula/5318048
    nativeRequestAnimationFrame && nativeRequestAnimationFrame(function() {
        AnimationFrame.hasNative = true
    })
}())

/**
 * Animation frame constructor.
 *
 * Options:
 *   - `useNative` use the native animation frame if possible, defaults to true
 *   - `frameRate` pass a custom frame rate
 *
 * @param {Object|Number} options
 */
function AnimationFrame(options) {
    if (!(this instanceof AnimationFrame)) return new AnimationFrame(options)
    options || (options = {})

    // Its a frame rate.
    if (typeof options == 'number') options = {frameRate: options}
    options.useNative != null || (options.useNative = true)
    this.options = options
    this.frameRate = options.frameRate || AnimationFrame.FRAME_RATE
    this._frameLength = 1000 / this.frameRate
    this._isCustomFrameRate = this.frameRate !== AnimationFrame.FRAME_RATE
    this._timeoutId = null
    this._callbacks = {}
    this._lastTickTime = 0
    this._tickCounter = 0
}

/**
 * Default frame rate used for shim implementation. Native implementation
 * will use the screen frame rate, but js have no way to detect it.
 *
 * If you know your target device, define it manually.
 *
 * @type {Number}
 * @api public
 */
AnimationFrame.FRAME_RATE = 60

/**
 * Replace the globally defined implementation or define it globally.
 *
 * @param {Object|Number} [options]
 * @api public
 */
AnimationFrame.shim = function(options) {
    var animationFrame = new AnimationFrame(options)

    window.requestAnimationFrame = function(callback) {
        return animationFrame.request(callback)
    }
    window.cancelAnimationFrame = function(id) {
        return animationFrame.cancel(id)
    }

    return animationFrame
}

/**
 * Crossplatform Date.now()
 *
 * @return {Number} time in ms
 * @api public
 */
AnimationFrame.now = Date.now || function() {
    return (new Date).getTime()
}

/**
 * Replacement for PerformanceTiming.navigationStart for the case when
 * performance.now is not implemented.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/PerformanceTiming.navigationStart
 *
 * @type {Number}
 * @api public
 */
AnimationFrame.navigationStart = AnimationFrame.now()

/**
 * Crossplatform performance.now()
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Performance.now()
 *
 * @return {Number} relative time in ms
 * @api public
 */
AnimationFrame.perfNow = function() {
    if (window.performance && window.performance.now) return window.performance.now()
    return AnimationFrame.now() - AnimationFrame.navigationStart
}

/**
 * Is native animation frame implemented. The right value is set during feature
 * detection step.
 *
 * @type {Boolean}
 * @api public
 */
AnimationFrame.hasNative = false

/**
 * Request animation frame.
 * We will use the native RAF as soon as we know it does works.
 *
 * @param {Function} callback
 * @return {Number} timeout id or requested animation frame id
 * @api public
 */
AnimationFrame.prototype.request = function(callback) {
    var self = this,
        delay

    // Alawys inc counter to ensure it never has a conflict with the native counter.
    // After the feature test phase we don't know exactly which implementation has been used.
    // Therefore on #cancel we do it for both.
    ++this._tickCounter

    if (AnimationFrame.hasNative && self.options.useNative && !this._isCustomFrameRate) {
        return nativeRequestAnimationFrame(callback)
    }

    if (!callback) throw new TypeError('Not enough arguments')

    if (this._timeoutId == null) {
        // Much faster than Math.max
        // http://jsperf.com/math-max-vs-comparison/3
        // http://jsperf.com/date-now-vs-date-gettime/11
        delay = this._frameLength + this._lastTickTime - AnimationFrame.now()
        if (delay < 0) delay = 0

        this._timeoutId = window.setTimeout(function() {
            var id

            self._lastTickTime = AnimationFrame.now()
            self._timeoutId = null
            ++self._tickCounter

            for (id in self._callbacks) {
                if (self._callbacks[id]) {
                    if (AnimationFrame.hasNative && self.options.useNative) {
                        nativeRequestAnimationFrame(self._callbacks[id])
                    } else {
                        self._callbacks[id](AnimationFrame.perfNow())
                    }
                    delete self._callbacks[id]
                }
            }
        }, delay)
    }

    this._callbacks[this._tickCounter] = callback
    return this._tickCounter
}

/**
 * Cancel animation frame.
 *
 * @param {Number} timeout id or requested animation frame id
 *
 * @api public
 */
AnimationFrame.prototype.cancel = function(id) {
    if (AnimationFrame.hasNative && this.options.useNative) nativeCancelAnimationFrame(id)
    delete this._callbacks[id]
}


// Support commonjs wrapper, amd define and plain window.
if (typeof exports == 'object' && typeof module == 'object') {
    module.exports = AnimationFrame
} else if (typeof define == 'function' && define.amd) {
    define(function() { return AnimationFrame })
} else {
    window.AnimationFrame = AnimationFrame
}

}(window));

},{}],8:[function(_dereq_,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = _dereq_('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Use chrome.storage.local if we are in an app
 */

var storage;

if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined')
  storage = chrome.storage.local;
else
  storage = window.localStorage;

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      storage.removeItem('debug');
    } else {
      storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

},{"./debug":9}],9:[function(_dereq_,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = _dereq_('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":10}],10:[function(_dereq_,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  var match = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 's':
      return n * s;
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],11:[function(_dereq_,module,exports){
module.exports={
  "name": "anthParticle",
  "version": "1.3.2",
  "description": "",
  "main": "index.js",
  "scripts": {
    "release": "./node_modules/.bin/gulp release",
    "test": "./node_modules/.bin/gulp karma"
  },
  "keywords": [
    "cyParticle"
  ],
  "author": "ijse",
  "license": "ISC",
  "devDependencies": {
    "brfs": "^1.2.0",
    "browserify": "^8.0.2",
    "chai": "^1.10.0",
    "gulp": "^3.8.10",
    "gulp-browserify": "^0.5.0",
    "gulp-connect": "^2.2.0",
    "gulp-jshint": "^1.9.0",
    "gulp-karma": "0.0.4",
    "gulp-livereload": "^3.0.2",
    "gulp-mocha": "^2.0.0",
    "gulp-notify": "^2.1.0",
    "gulp-rename": "^1.2.0",
    "gulp-uglify": "^1.0.2",
    "gulp-util": "^3.0.1",
    "karma": "^0.12.28",
    "karma-browserify": "^1.0.0",
    "karma-chai": "^0.1.0",
    "karma-chrome-launcher": "^0.1.7",
    "karma-coverage": "^0.2.7",
    "karma-growl-reporter": "^0.1.1",
    "karma-mocha": "^0.1.10",
    "karma-spec-reporter": "0.0.16",
    "mocha": "^2.1.0",
    "requirejs": "^2.1.15",
    "run-sequence": "^1.0.2"
  },
  "dependencies": {
    "animation-frame": "^0.1.7",
    "anthlivewp": "latest",
    "body-parser": "^1.10.1",
    "connect": "^3.3.4",
    "cookie-session": "^1.1.0",
    "debug": "^2.1.1",
    "multiparty": "^4.1.1",
    "sax": "^0.6.1",
    "serve-static": "^1.8.0"
  }
}

},{}]},{},[2])
(2)
});