
var fs = require('fs');
var path = require('path');

var chai = require('chai');
var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;

var testResConfigFile = path.join(__dirname, 'res/snow/config.xml');

describe('Parse xml configs', function() {
  "use strict";
  this.timeout(5000);

  var configXml = fs.readFileSync(__dirname + '/res/snow/config.xml').toString();
  var sceneImage = new Image();
  sceneImage.src = 'data:image/png;base64,' + fs.readFileSync(__dirname + '/res/snow/cypic.png').toString('base64');

  var xmlLoader = require('../lib/loader/xml.js');

  it('create loader instance', function(done) {

    var XmlLoader = xmlLoader;
    var ins = new XmlLoader({
      data: configXml,
      image: sceneImage
    });

    ins.load(function(err, data, img) {
      expect(err).to.be.not.ok;
      expect(data).to.be.ok;
      expect(img).to.be.ok;
      done();
    });

  });

  it('parse simple xml text', function(done) {
    xmlLoader.parse.should.be.a('function');
    xmlLoader
      .parse('<xml>Hello, <who calls="world">world</who>!</xml>', function(err, obj) {
        // console.log(JSON.stringify(obj, null, ' '));
        obj.should.be.a('object');
        done(err);
      });
  });

  it('parse animation config xml sample', function(done) {

    var xmlStrs = '' + fs.readFileSync('test/res/snow/config.xml');

    xmlLoader
      .parse(xmlStrs, function(err, obj) {
        // console.log(JSON.stringify(obj, null, ' '));
        obj.should.be.a('object');
        // obj.should.have.property('scene');
        expect(obj.scene).to.have.keys([
            'pic_name', 'width_height', 'src_scale', 'max', 'model'
        ]);

        // obj.scene.should.have.properties([
        //     'pic_name', 'width_height', 'src_scale', 'max', 'model'
        // ]);
        //
        // if there is only one mode tag, it is an object.
        // obj.scene.model.should.be.a('array');
        // obj.scene.model.should.have.a.lengthOf(6);

        // if there is only one model, it isnt an array.
        var mode = obj.scene.model[0] || obj.scene.model;
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

        done(err);

      });
  });
});
