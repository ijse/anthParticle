var chai = require('chai');
var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;

var fs = require('fs');
var Scene = require('../lib/scene.js');

var anthParticle = require('../lib/index.js');
var xmlLoader = require('../lib/loader/xml.js');

describe('Test main', function(){

  var configXml = fs.readFileSync(__dirname + '/res/snow/config.xml').toString();
  var sceneData = require('./res/snow/config.json').scene;
  var sceneImage = new Image();
  sceneImage.src = 'data:image/png;base64,' + fs.readFileSync(__dirname + '/res/snow/cypic.png').toString('base64');

  var ins = null;
  it('check function', function() {

    anthParticle.should.be.a('function');

  });

  it('create and init one scene', function(done) {
    ins = new anthParticle({
      fps: 10,
      canvas: document.createElement('canvas')
    });
    ins.reload(new xmlLoader({
      data: configXml,
      image: sceneImage
    }), function(err) {
      expect(ins.curScene instanceof Scene).to.be.true;
      done(err);
    });
  });

  it('create a instance', function(done) {

    var counter = 0;
    // override draw func
    ins.tick = function() {
      counter ++;
    };

    ins.start();

    setTimeout(function() {
      ins.stop();
      expect(counter).to.not.equal(0);
      // expect(counter).to.within(fps-5, fps+5);
      // console.log(counter);
      done();
    }, 1200);
  });

  it('test play and pause', function(done) {
    var counter = 0;
    var save1 = 0;

    ins.tick = function() {
      counter ++;
    };

    ins.start();

    setTimeout(function() {
      expect(counter).to.not.equal(0);
      save1 = counter;
      ins.pause();
    }, 1000);

    setTimeout(function() {
      expect(counter).to.equal(save1);
      ins.play();
    }, 1500);

    setTimeout(function() {
      expect(counter).to.be.above(save1);
      ins.stop();
      done();
    }, 1800);
  });


});
