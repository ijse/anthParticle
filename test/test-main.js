var chai = require('chai');
var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;

var fs = require('fs');
var Scene = require('../lib/scene.js');

var anthParticle = require('../lib/index.js');

describe('Test main', function(){

  var configXml = fs.readFileSync(__dirname + '/res/snow/config.xml').toString();
  var sceneData = require('./res/snow/config.json').scene;
  var sceneImage = new Image();
  sceneImage.src = 'data:image/png;base64,' + fs.readFileSync(__dirname + '/res/snow/cypic.png').toString('base64');

  it('check function', function() {

    anthParticle.should.be.a('function');

  });

  it('create a instance', function(done) {

    var fps = 10;
    var ins = new anthParticle({
      fps: fps,
      canvas: document.createElement('canvas')
    });
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

  it('create and init one scene', function(done) {
    var ins = new anthParticle({
      fps: 10,
      canvas: document.createElement('canvas')
    });
    ins.load(configXml, sceneImage, function(err) {
      expect(ins.curScene instanceof Scene).to.be.true;
      done(err);
    });
  });

});
