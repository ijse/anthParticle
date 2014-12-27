
"use strict";

var anthParticle = require('./lib/');

module.exports = anthParticle;

if(window) {
  window.anthParticle = anthParticle;
}

