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

    var fpsMeter = new FPSMeter($('.col-left')[0]);

    var particle = new AnthParticle({
      fps: 60,
      canvas: myCanvas,
      fpsMeter: fpsMeter
    });

    $('footer em').text(AnthParticle.VERSION);

    return {
      stop: function() {
        particle.stop();
      },
      play: function() {
        particle.play();
      },
      pause: function() {
        particle.pause();
      },
      start: function() {

        var xmlData = xmlEditor.getValue();
        var imgData = document.getElementById('imgRes');


        setTimeout(function() {
          particle.reload(new AnthParticleXmlLoader({
            data: xmlData,
            image: imgData
          }), function(err) {
            if(err) {
              throw err;
            }
            particle.start();
          });
        }, 0);

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
