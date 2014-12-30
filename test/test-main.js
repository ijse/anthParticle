var chai = require('chai');
var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;

var anthParticle = require('../lib/index.js');

describe('Test main', function(){

  it('check function', function() {

    anthParticle.should.be.a('function');

  });
});
