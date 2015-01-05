var chai = require('chai');
var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;

var fs = require('fs');
var Model = require('../lib/model.js');
var Particle = require('../lib/particle.js');
var Vector = require('../lib/vector.js');
var util = require('../lib/util.js');

describe('Test model', function() {
    "use strict";
    var model = null;
    var modelData = require('./res/snow/config.json').scene.model[0];
    var modelImage = new Image();
    modelImage.src = 'data:image/png;base64,' + fs.readFileSync(__dirname + '/res/snow/cypic.png').toString('base64');

    it('should get an instance of Model', function() {
        model = new Model(modelData, function(ltwh) {
            return util.clipImageToCanvas.bind(null, modelImage).apply(null, ltwh);
        });

        expect(model instanceof Model).to.be.true;
        expect(model instanceof Particle).to.be.true;
    });

    it('should have some initial attributes', function() {
        expect(model.grow).to.be.a('function');
        expect(model.life).to.be.above(0);
        expect(model.age).to.be.equal(0);
        expect(model.position instanceof Vector).to.be.true;
        expect(model.velocity instanceof Vector).to.be.true;
    });

    it('should be able to set age ', function() {
        var minY = +modelData.move_from_rect.values[1];
        var maxY = +modelData.move_to_rect.values[1];

        var life = model.life;
        var age = model.age;
        var py = 0;

        model.setAge(0);
        // ...cause it is a float
        py = Math.round(model.position.y);
        expect(py).to.be.equal(minY);

        model.setAge(life/2);
        py = Math.round(model.position.y);
        expect(py).to.be.equal((maxY+minY)/2);

        model.setAge(life);
        py = Math.round(model.position.y);
        expect(py).to.be.equal(maxY);

    });
});
