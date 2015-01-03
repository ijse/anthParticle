$(function() {

  if(typeof debug !== 'undefined') {
    debug.enable('ap:*');
  }

  var myCanvas = document.getElementById('my');
  myCanvas.width = 800;
  myCanvas.height = 600;
  var myCtx = myCanvas.getContext('2d');

  var particle = new anthParticle({
    fps: 5,
    canvas: myCanvas
  });

  // get xml
  $.ajax({
    type: 'GET',
    url: '../res/snow/config.xml',
    dataType: 'text'
  }).success(function(data) {
    // get picture
    var resImg = new Image();
    resImg.src = '../res/snow/cypic.png?' + (+new Date());
    resImg.onload = function() {

      // create particle
      particle
      .load(data, this)
      .then(function() {
        particle.start();

        setTimeout(function() {
          console.log('stop!');
          particle.stop();
        }, 50000);

      }).fail(function(e) {
        // console.log(e);
        throw e;
      });
    };

  });
  // todo: draw something with Particle


});
