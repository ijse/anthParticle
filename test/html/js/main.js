$(function() {

  var myCanvas = document.getElementById('my');
  var myCtx = myCanvas.getContext('2d');

  var particle = new anthParticle({
    fps: 1,
    canvas: myCanvas
  });

  // get xml
  $.ajax({
    type: 'GET',
    url: '../res/snow/config.xml',
    dataType: 'text'
  }).success(function(data) {

    var resImg = new Image();
    resImg.src = '/anthParticle/test/res/snow/cypic.png?' + (+new Date());
    resImg.onload = function() {
      particle
      .load(data, this)
      .then(function(result) {
        console.log("config.xml parse result: ", result);
      })
      .then(function() {
        particle.start();

        setTimeout(function() {
          console.log('stop!');
          particle.stop();
        }, 5000);

      }).fail(function(e) {
        console.log(e);
      });
    };

  });
  // todo: draw something with Particle

});
