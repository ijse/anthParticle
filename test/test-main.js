var chai = require('chai');
var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;

var anthParticle = require('../lib/index.js');

describe('Test main', function(){

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

});
