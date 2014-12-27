

describe('Utils test', function() {
  "use strict";

  var util = require('../lib/util.js');
  it('check integrality', function() {
    util.should.have.a.type('object');
    util.should.have.properties([
        'extend', 'deepExtend', 'isArray', 'type'
      ]);
  });

  it('util.extend()', function() {
    var o1 = { a: 4 };
    var o2 = { b: 5 };

    var r = util.extend({}, o1, o2);
    r.should.have.properties({
        a: 4,
        b: 5
    });

  });

  it('util.deepExtend()', function() {
    var o1 = { a: { b: 5 } };
    var o2 = { a: { b: 2, c: 9}, b: 9 };

    var r = util.deepExtend(o1, o2);
    r.should.have.properties({
        a: {
            b: 2,
            c: 9
        },
        b: 9
    });

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

});
