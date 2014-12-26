
"use strict";

var anthParticle = require('./lib/anthParticle.js');

module.exports = anthParticle;

if(window) {
  window.anthParticle = anthParticle;
}
