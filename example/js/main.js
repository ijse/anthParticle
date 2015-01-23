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

    var xmlData = '';

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

        xmlData = xmlEditor.getValue();
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
      },
      pack: function() {

        xmlData = xmlEditor.getValue();
        var imgData = document.getElementById('imgRes');

        var cvs = document.createElement('canvas');
        cvs.width = imgData.width;
        cvs.height = imgData.height;
        cvs.getContext('2d').drawImage(imgData, 0, 0);
        var dataUrl = cvs.toDataURL();
        var base64Str = dataUrl.split(',')[1];
        var mimeStr = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        var imgFile = base64toBlob(base64Str, mimeStr);
        // var imgFile = new Blob(ia, {type: mimeStr});

        var fd = new FormData();
        fd.append('image', imgFile);
        fd.append('xmlData', xmlData);
        $.ajax({
          url: '/pack',
          type: 'POST',
          data: fd,
          enctype: 'multipart/form-data',
          processData: false,
          contentType: false
        })
        .success(function(data) {
          $('#zipFile')
            .prop('href', data.zipFile)
            .text(data.zipFile);
        })
        .fail(function(err) {
          alert('Error! ');
        });

      },
      toJson: function() {
        xmlData = xmlEditor.getValue();
        AnthParticleXmlLoader.parse(xmlData, function(err, json) {
          $('#jsonDiv').text(JSON.stringify(json, false, ' '));
        });
      }
    }
  })();

  window.app = app;

  function base64toBlob(base64Data, contentType) {
      contentType = contentType || '';
      var sliceSize = 1024;
      var byteCharacters = atob(base64Data);
      var bytesLength = byteCharacters.length;
      var slicesCount = Math.ceil(bytesLength / sliceSize);
      var byteArrays = new Array(slicesCount);

      for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
          var begin = sliceIndex * sliceSize;
          var end = Math.min(begin + sliceSize, bytesLength);

          var bytes = new Array(end - begin);
          for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
              bytes[i] = byteCharacters[offset].charCodeAt(0);
          }
          byteArrays[sliceIndex] = new Uint8Array(bytes);
      }
      return new Blob(byteArrays, { type: contentType });
  }
});
