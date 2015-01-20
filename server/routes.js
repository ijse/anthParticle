
"use strict";

var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');
var path = require('path');
var AnthLiveWP = require('anthlivewp');

exports.packLiveWP = packLiveWP;
exports.applyRoute = function(app) {
  app.use('/pack', packLiveWP);
};

function packLiveWP(req, res, next) {

  var form = new multiparty.Form();

  form.parse(req, function(err, fields, files) {
    if(err) {
      return next(err);
    }

    var data;
    if(fields.xmlData) {
      data = fields.xmlData[0];
    } else {
      try {
        data = JSON.parse(fields.data[0]);
      } catch (e) {
        console.log(e);
        return next(e);
      }
    }

    if(!data) {
      return next('Json data is not valid.');
    }

    fs.readFile(files.image[0].path, function(err, imgData) {

      if(err) {
        return next('Read image file fail!');
      }

      var liveWallpaper = new AnthLiveWP({
        image: imgData,
        xmlData: data
      });

      liveWallpaper
      .pack()
      .saveToLocal(path.join(__dirname, '../example/data/'), function(err, zipFile) {
        if(err) {
          return next(err);
        }

        res.writeHead(200, {'content-type': 'text/json'});
        res.end(JSON.stringify({
          zipFile: '/data/' + liveWallpaper.id + '.zip'
        }));

      });
    });

  });

}
