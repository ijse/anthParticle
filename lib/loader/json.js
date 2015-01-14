
"use strict";

/**
 * anthParticleJsonLoader
 * @param  {options} options data, image
 */
function AnthParticleJsonLoader(options) {
  this.data = options.data;
  this.image = options.image;
}

AnthParticleJsonLoader.prototype.load = function(callback) {

  var data = this.data;
  if(typeof this.image === 'string') {

    var img = new Image();
    img.onload = function() {
      callback(null, data, this);
    };
    img.onerror = function() {
      callback('Image Not Found.');
    };
    img.src = this.image;
  } else {
    callback(null, data, this.image);
  }

};

module.exports = AnthParticleJsonLoader;
