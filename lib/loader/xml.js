
"use strict";

var sax = require('sax');

function anthParticleXmlParser(options) {
  /*jshint -W040*/
  this.data = options.data;
  this.image = options.image;
}
anthParticleXmlParser.prototype.load = function(callback) {

  var img = this.image;
  anthParticleXmlParser.parse(this.data, function(err, data) {

    callback(err, data, img);

  });
};
module.exports = anthParticleXmlParser;


anthParticleXmlParser.parse = function parse(xmlStr, callback) {
  var result = {};
  var stack = [ result ];

  // set in strict mode
  var parser = sax.parser(true, {
    trim: true,
    xmlns: true
  });

  parser.onerror = function (e) {
    // an error happened.
    callback(e);
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
    callback(null, result);
  };

  parser.write(xmlStr).close();

  return parser;
};
