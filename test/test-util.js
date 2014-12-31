
var chai = require('chai');
var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;

var fs = require('fs');
var path = require('path');

describe('Utils test', function() {
  "use strict";
  var util =  require('../lib/util.js');

  it('check integrality', function() {
    util.should.have.a('object');
    expect(util).to.contain.keys([
      'extend', 'deepExtend', 'isArray', 'type', 'getRandom'
    ]);
    // util.should.have.properties([
    //   'extend', 'deepExtend', 'isArray', 'type',
    //   'getRandom'
    //   ]);
  });

  it('util.extend()', function() {
    var o1 = { a: 4 };
    var o2 = { b: 5 };

    var r = util.extend({}, o1, o2);
    assert.propertyVal(r, 'a', 4);
    assert.propertyVal(r, 'b', 5);
    // r.should.have.properties({
    //   a: 4,
    //   b: 5
    // });
  });

  it('util.deepExtend()', function() {
    var o1 = { a: { b: 5 } };
    var o2 = { a: { b: 2, c: 9}, b: 9 };

    var r = util.deepExtend({}, o1, o2);
    assert.deepPropertyVal(r, 'a.b', 2);
    assert.deepPropertyVal(r, 'a.c', 9);
    assert.deepPropertyVal(r, 'b', 9);
    // r.should.have.properties({
    //   a: {
    //     b: 2,
    //     c: 9
    //   },
    //   b: 9
    // });
  });

  it('util.isArray()', function() {
    /*jshint -W009 */
    util.isArray(5).should.be.false;
    util.isArray('5').should.be.false;
    util.isArray(false).should.be.false;
    util.isArray(undefined).should.be.false;
    util.isArray(null).should.be.false;
    util.isArray({}).should.be.false;

    util.isArray([]).should.be.true;
    util.isArray(new Array()).should.be.true;
    util.isArray([5]).should.be.true;
  });

  it('util.type()', function() {
    util.type([]).should.be.eql('array');
    util.type(6).should.be.eql('number');
    util.type('4').should.be.eql('string');
    util.type({}).should.be.eql('object');
  });

  it('util.getRandom()', function() {
    var x;
    var n = 100;
    while(n--) {
      x = util.getRandom(1, 9);
      x.should.be.within(1, 9);
      (x%1).should.be.equal(0);
    }
  });

  it('util.getRandomArbitry()', function() {
    var x;
    var n = 100;
    while(n--) {
      x = util.getRandomArbitry(1, 9);
      x.should.be.within(1, 9);
      (x%1).should.not.be.equal(0);
    }

  });

  it('util.createCanvas()', function() {
    var cvs = util.createCanvas(100, 100);
    cvs.should.be.a('object');
    cvs.width.should.be.equal(100);
    cvs.height.should.be.equal(100);
  });

  it('util.clipImage()', function(done) {
    var imgFile = fs.readFileSync('test/res/snow/cypic.png');
    var img = new Image();
    img.src = 'data:image/png;base64,' + imgFile.toString('base64');
    var clipImg = util.clipImage(img, 149, 0, 50, 43);
    done();
  });

});
