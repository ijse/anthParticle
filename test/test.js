/*jshint -W030 */

var fs = require('fs');
var path = require('path');

var testResConfigFile = path.join(__dirname, 'res/snow/config.xml');

describe('Test', function() {
  "use strict";
  var xmlParser = require('../lib/xmlParser.js');
  it('parse simple xml text', function(done) {
    xmlParser.parse.should.be.a.type('function');
    xmlParser
      .parse('<xml>Hello, <who calls="world">world</who>!</xml>')
      .fail(done)
      .then(function(obj) {
        // console.log(JSON.stringify(obj, null, ' '));
        obj.should.be.a.type('object');
        done();
      });
  });

  it('parse animation config xml sample', function(done) {
    var xmlStrs = '' + fs.readFileSync(testResConfigFile);
    xmlParser
      .parse(xmlStrs)
      .fail(done)
      .then(function(obj) {
        // console.log(JSON.stringify(obj, null, ' '));
        obj.should.be.type('object');
        obj.should.have.property('scene');
        obj.scene.should.have.properties([
            'pic_name', 'width_height', 'src_scale', 'max', 'model'
        ]);
        obj.scene.model.should.be.an.Array;
        obj.scene.model.should.have.a.lengthOf(6);

        var mode = obj.scene.model[0];
        mode.should.be.a.Object;
        mode.should.have.properties([
            'chance_range', 'active_time', 'src_ltwh', 'move_from_rect',
            'move_to_rect', 'rotate', 'alpha', 'scale'
          ]);

        mode.chance_range.should.have.property('text');
        mode.chance_range.text[0].should.be.an.String;

        done();
      });
  });
});
