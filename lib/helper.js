
"use strict";
var util = require('util');
module.exports = {
  extend: util._extend,
  isArray: util.isArray,
  isDate: util.isDate,
  isRegExp: util.isRegExp,
  isNum: function(x) {
    return typeof x === 'number';
  }
};
