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
    var sceneWidth = 720;
    var sceneHeight = 1280;
    var model = null;
    var modelData = require('./res/snow/config.json').scene.model[0];
    var modelImage = new Image();
    modelImage.src = 'data:image/png;base64,' + fs.readFileSync(__dirname + '/res/snow/cypic.png').toString('base64');

    it('should get an instance of Model', function() {
        model = new Model(modelData, function(ltwh) {
            return util.clipImageToCanvas.bind(null, modelImage).apply(null, ltwh);
        });

        model.initPosition(sceneWidth, sceneHeight);

        expect(model instanceof Model).to.be.true;
    });

    it('should have some initial attributes', function() {
        expect(model.grow).to.be.a('function');
        expect(model.life).to.be.above(0);
        expect(model.age).to.be.equal(0);
        expect(model.position instanceof Vector).to.be.true;
        expect(model.velocity instanceof Vector).to.be.true;
    });

    it('should be able to set age and change position.y', function() {
        var minY = model.oriPosition.y;
        var maxY = model.destPosition.y;

        var life = model.life;
        var age = model.age;
        var py = 0;

        model.setAge(0);
        // ...cause it is a float
        py = Math.round(model.position.y);
        expect(py).to.be.equal(minY);

        model.setAge(life/2);
        py = Math.round(model.position.y);
        expect(py).to.be.equal(Math.round((maxY+minY)/2));

        model.setAge(life);
        py = Math.round(model.position.y);
        expect(py).to.be.equal(maxY);

    });

    it('should init at random position.x', function() {
        var minX = modelData.move_from_rect.values[0];
        var maxX = modelData.move_from_rect.values[2];
        var offset = model.imageCanvas.width;

        minX = +minX;
        maxX = maxX === 'match_parent' ? sceneWidth : maxX;

        var py = Math.round(model.oriPosition.x + offset);
        expect(py).to.be.within(minX, maxX);
    });

    it('should init at random position.y', function() {
        var min = modelData.move_from_rect.values[1];
        var max = modelData.move_from_rect.values[3];
        var offset = model.imageCanvas.height;

        min = +min;
        max = max === 'match_parent' ? sceneWidth : (min + (+max));

        var py = Math.round(model.oriPosition.y + offset);
        expect(py).to.be.within(min, max);
    });

    it('should end at random position.x', function() {
        var minX = modelData.move_to_rect.values[0];
        var maxX = modelData.move_to_rect.values[2];
        var offset = model.imageCanvas.width;

        minX = +minX;
        maxX = maxX === 'match_parent' ? sceneHeight : maxX;

        var py = Math.round(model.destPosition.x - offset);
        expect(py).to.be.within(minX, maxX);
    });

    it('should end at random position.y', function() {
        var min = modelData.move_to_rect.values[1];
        var max = modelData.move_to_rect.values[3];
        var offset = model.imageCanvas.height;

        min = +min;
        max = max === 'match_parent' ? sceneHeight : (min + (+max));

        var py = Math.round(model.destPosition.y - offset);
        expect(py).to.be.within(min, max);
    });

    it('should has right moment values', function() {
        expect(model.momentIn).to.be.equal(0.1);
        expect(model.momentOut).to.be.equal(0.9);
    });

    it('should has right alpha data', function() {
        var min = +modelData.alpha.values[0]/255;
        var max = +modelData.alpha.values[1]/255;
        expect(model.finalAlpha).to.be.within(min, max);
    });

    it('should has right scale datas', function() {
        var minFrom = modelData.scale.values[0];
        var maxFrom = modelData.scale.values[1];
        var minTo = modelData.scale.values[2];
        var maxTo = modelData.scale.values[3];
        expect(model.fromScale).to.be.within(minFrom, maxFrom);
        expect(model.toScale).to.be.within(minTo, maxTo);
    });

});
