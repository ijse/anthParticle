
angular.module('anthParticleApp')
.controller('previewController', function($scope, $http) {
  $scope.name = 'preview section';
  $scope.particleData = null;
  $scope.$on('applyParticle', function(event, particleData) {
    $scope.particleData = particleData;
    $scope.$apply();
  });
});
