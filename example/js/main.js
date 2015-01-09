$(function() {

  var xmlEditorDom = document.getElementById('xmlEditor');

  var xmlEditor = CodeMirror.fromTextArea(xmlEditorDom, {
    lineNumbers: true,
    theme: 'lesser-dark',
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
        .load(xmlData, imgData, function(err) {
          if(err) {
            throw err;
          }
          particle.start();
        });

      },
      setImage: function(event) {
        var file = event.target.files[0];

        if(!file.type.match('image.*')) {
          alert('Image Error!!');
          return ;
        }

        var reader = new FileReader();
        var imgInput = $('#imgRes')[0];
        reader.onload = function(e) {
            imgInput.src = e.target.result;
          }
        reader.readAsDataURL(file);
      }
    }
  })();

  window.app = app;

});
