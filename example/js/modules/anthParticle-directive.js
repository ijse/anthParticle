
angular.module('anthParticle', [])

.directive('ngAnthParticle', function() {

  return {
    template: '<canvas></canvas>',
    restrict: "E",
    replace: true,
    transclude: true,
    scope: {
      fps: '@',
      args: '='
    },
    link: function(scope, element, attrs) {
      var canv = element[0];
      var fps = attrs.fps;
      var ap = new AnthParticle({
        canvas: canv
      });

      scope.$on('$destroy', function cleanLiveWallpaper() {
        // Veley important!
        ap.stop();
        ap = null;
      });

      scope.$watch('args', function(newValue) {
        if(!newValue) return ;

        ap.reload(new AnthParticleXmlLoader({
          data: newValue.data,
          image: newValue.image
        }), function(err) {

          ap.start();

        });

      });

      return ;

    }
  }

});
