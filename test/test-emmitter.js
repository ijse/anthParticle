
var chai = require('chai');
var should = chai.should();
var assert = chai.assert;
var expect = chai.expect;

var Model = require('../lib/model.js');
var Emitter = require('../lib/emitter.js');
var fs = require('fs');

describe('Test emmitter', function() {
    "use strict";
    var picData;
    var modelList;
    var emitter;
    before(function(done) {
        var imgFile = fs.readFileSync('test/res/snow/cypic.png');
        picData = new Image();
        picData.src = 'data:image/png;base64,' + imgFile.toString('base64');

        modelList = require('./res/snow/config.json').scene.model;

        done();
    });

    it('should make an instance', function() {
        emitter = new Emitter({
            image: picData,
            models: modelList
        });

        expect(emitter.chanceBox).to.be.an('array');
        expect(emitter.chanceBox.length).to.be.equal(6);
    });

    it('should get a random model ', function() {
        var randomModel = emitter.randomModel();
        expect(randomModel).to.be.an('object');
        expect(randomModel.src_ltwh.values).to.be.ok;
    });

    it('should get an model instance when fire()', function() {

        var model = emitter.fire();

        expect(model).to.be.an('object');
        expect(model instanceof Model).to.be.true;

    });
});
