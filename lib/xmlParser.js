
"use strict";

var sax = require('sax');
var Q = require('q');

exports.parse = function(xmlStr) {
  var deferred = Q.defer();
  var result = {};
  var stack = [ result ];

  // set in strict mode
  var parser = sax.parser(true, {
    trim: true,
    xmlns: true
  });

  parser.onerror = function (e) {
    // an error happened.
    deferred.reject(e);
  };
  parser.ontext = function (t) {
    // got some text.  t is the string of text.
    var cur = stack[stack.length-1];
    cur.values = t.split(',');
  };
  parser.onopentag = function (tag) {
    // opened a tag.  node has "name" and "attributes"
    var cur = stack[stack.length-1];
    var node = tag.attributes || {};
    if(cur[tag.name] instanceof Array) {
      cur[tag.name].push(node);
    } else if(!cur[tag.name]) {
      cur[tag.name] = node;
    } else {
      cur[tag.name] = [ cur[tag.name] ];
      cur[tag.name].push(node);
    }
    stack.push(node);
  };
  parser.onclosetag = function(tagName) {
    stack.pop();
  };

  parser.onend = function () {
    // parser stream is done, and ready to have more stuff written to it.
    deferred.resolve(result);
  };

  parser.write(xmlStr).close();

  return deferred.promise;
};
