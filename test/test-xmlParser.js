
var fs = require('fs');
var path = require('path');

var chai = require('chai');
var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;

var testResConfigFile = path.join(__dirname, 'res/snow/config.xml');

describe('Parse xml configs', function() {
  "use strict";

  var xmlParser = require('../lib/xmlParser.js');
  it('parse simple xml text', function(done) {
    xmlParser.parse.should.be.a('function');
    xmlParser
      .parse('<xml>Hello, <who calls="world">world</who>!</xml>')
      .fail(done)
      .then(function(obj) {
        // console.log(JSON.stringify(obj, null, ' '));
        obj.should.be.a('object');
        done();
      });
  });

  it('parse animation config xml sample', function(done) {

    var xmlStrs = '' + fs.readFileSync('test/res/snow/config.xml');

    xmlParser
      .parse(xmlStrs)
      .fail(done)
      .then(function(obj) {
        // console.log(JSON.stringify(obj, null, ' '));
        obj.should.be.a('object');
        // obj.should.have.property('scene');
        expect(obj.scene).to.have.keys([
            'pic_name', 'width_height', 'src_scale', 'max', 'model'
        ]);

        // obj.scene.should.have.properties([
        //     'pic_name', 'width_height', 'src_scale', 'max', 'model'
        // ]);
        obj.scene.model.should.be.a('array');
        // obj.scene.model.should.have.a.lengthOf(6);

        var mode = obj.scene.model[0];
        mode.should.be.a('object');

        expect(mode).to.have.keys([
          'chance_range', 'active_time', 'src_ltwh', 'move_from_rect',
          'move_to_rect', 'rotate', 'alpha', 'scale'
        ]);
        // mode.should.have.properties([
        //     'chance_range', 'active_time', 'src_ltwh', 'move_from_rect',
        //     'move_to_rect', 'rotate', 'alpha', 'scale'
        //   ]);

        mode.chance_range.should.have.property('values');
        mode.chance_range.values[0].should.be.a('string');

        done();
      });
  });
});