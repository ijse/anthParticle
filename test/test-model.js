var chai = require('chai');
var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;

var fs = require('fs');
var Model = require('../lib/model.js');
var Particle = require('../lib/particle.js');
var util = require('../lib/util.js');

describe('Test model', function() {
    "use strict";
    var modelData = require('./res/snow/config.json').scene.model[0];
    var modelImage = new Image();
    modelImage.src = 'data:image/png;base64,' + fs.readFileSync(__dirname + '/res/snow/cypic.png').toString('base64');

    it('should get an instance of Model', function() {
        var model = new Model(modelData, function(ltwh) {
            return util.clipImageToCanvas.bind(null, modelImage).apply(null, ltwh);
        });

        expect(model instanceof Model).to.be.true;
        expect(model instanceof Particle).to.be.true;
    });
});
