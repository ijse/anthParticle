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
    copy : function() { return new Vector(this.x, this.y); },
    length : function() { return Math.sqrt(this.x * this.x + this.y * this.y); },
    sqrLength : function() { return this.x * this.x + this.y * this.y; },
    normalize : function() { var inv = 1/this.length(); return new Vector(this.x * inv, this.y * inv); },
    negate : function() { return new Vector(-this.x, -this.y); },
    add : function(v) { return new Vector(this.x + v.x, this.y + v.y); },
    subtract : function(v) { return new Vector(this.x - v.x, this.y - v.y); },
    multiply : function(f) { return new Vector(this.x * f, this.y * f); },
    divide : function(f) { var invf = 1/f; return new Vector(this.x * invf, this.y * invf); },
    dot : function(v) { return this.x * v.x + this.y * v.y; }
};

Vector.zero = new Vector(0, 0);

module.exports = Vector;
