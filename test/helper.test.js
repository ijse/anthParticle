

describe('Helper', function() {
  "use strict";

  var helper = require('../lib/helper.js');
  it('check integrality', function() {
    helper.should.have.a.type('object');
    helper.should.have.properties([
        'extend', 'isArray', 'isDate', 'isRegExp', 'isNum'
      ]);
  });


});
