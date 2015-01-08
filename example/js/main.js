$(function() {

  if(typeof debug !== 'undefined') {
    debug.enable('ap:*');
  }
  var xmlEditorDom = document.getElementById('xmlEditor');

  var xmlEditor = CodeMirror.fromTextArea(xmlEditorDom, {
    lineNumbers: true,
    theme: 'night',
    mode: 'xml'
  });


  // get xml
  $.ajax({
    type: 'GET',
    url: './data/config.xml',
    dataType: 'text'
  }).success(function(data) {

    xmlEditor.setValue(data);
  });


  var app = (function() {
    var myCanvas = document.getElementById('my');
    // myCanvas.width = 800;
    // myCanvas.height = 600;
    var myCtx = myCanvas.getContext('2d');

    var particle = new anthParticle({
      fps: 60,
      canvas: myCanvas
    });

    return {
      stopEmulator: function() {
        $('#stopBtn').hide();
        $('#startBtn').show();
        particle.stop();
      },
      startEmulator: function() {

        $('#startBtn').hide();
        $('#stopBtn').show();

        var xmlData = xmlEditor.getValue();
        var imgData = document.getElementById('imgRes');

        particle.stop();

        particle
        .load(xmlData, imgData)
        .then(function() {
          particle.start();

          // setTimeout(function() {
          //   console.log('stop!');
          //   particle.stop();
          // }, 50000);

        }).fail(function(e) {
          // console.log(e);
          throw e;
        });

      },
      setImage: function(img) {
        return this.imgData = img;
      },
      setXml: function(xml) {
        return this.xmlData = xml;
      }
    }
  })();

  window.app = app;

});
