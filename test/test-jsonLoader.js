var fs = require('fs');
var path = require('path');

var chai = require('chai');
var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;

var JsonLoader = require('../lib/loader/json.js');

describe.only('Test jsonLoader', function() {
  "use strict";
  this.timeout(5000);

  var imgSrc = 'test/res/snow/cypic.png';
  // var imgSrc = 'http://localhost:8088/test/res/snow/cypic.png';
  // var imgSrc = 'http://karma-runner.github.io/assets/img/banner.png';
  var jsonData =  require('./res/snow/config.json');
  var sceneImage = new Image();
  sceneImage.src = 'data:image/png;base64,' + fs.readFileSync(__dirname + '/res/snow/cypic.png').toString('base64');


  it('should create new instance with data and image', function() {
    var ins = new JsonLoader({
      data: jsonData,
      image: sceneImage
    });

    expect(ins instanceof JsonLoader).to.be.ok;
    expect(ins.load).to.be.a('function');
  });

  it('should load json data and image', function(done) {
    var ins = new JsonLoader({
      data: jsonData,
      image: sceneImage
    });

    ins.load(function(err, data, image) {
      expect(err).to.not.be.ok;
      expect(data).to.be.an('object');
      expect(data.scene).to.be.an('object');
      expect(image).to.be.an('object');
      done();
    });
  });

  it('should load image from src', function(done) {
    var ins = new JsonLoader({
      data: jsonData,
      image: imgSrc
    });

    ins.load(function(err, data, image) {
      expect(err).to.not.be.ok;
      expect(image).to.be.an('object');
      done();
    });
  });

  it('should throw exception if image src is wrong', function(done) {
    var ins = new JsonLoader({
      data: jsonData,
      image: 'wrong-image-src.png'
    });

    ins.load(function(err, data, image) {
      expect(err).to.be.equal('Image Not Found.');
      done();
    });
  });

});
