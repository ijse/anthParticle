(function() {
  var app = angular.module('anthParticleApp', [
    'anthParticle',
    'ngMaterial'
  ]).config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryColor('indigo')
      .accentColor('light-blue');
  });

  app.run(function($rootScope, $http) {
    var curParticle = null;
    var menus = [
      {
        name: '动效库',
        list: [
          {
            name: 'snow',
            image: '/data/snow/_cyPic',
            data: '/data/snow/config.xml'
          },
          {
            name: 'snow2',
            image: '/data/snow2/_cyPic',
            data: '/data/snow2/config.xml'
          },
          {
            name: 'snow3',
            image: '/data/snow3/_cyPic',
            data: '/data/snow3/config.xml'
          },
          {
            name: 'flower',
            image: '/data/flower/_cyPic',
            data: '/data/flower/config.xml'
          },
          {
            name: 'smallFlower',
            image: '/data/smallFlower/_cyPic',
            data: '/data/smallFlower/config.xml'
          },
          {
            name: 'rain',
            image: '/data/rain/_cyPic',
            data: '/data/rain/config.xml'
          },
          {
            name: 'star',
            image: '/data/star/_cyPic',
            data: '/data/star/config.xml'
          },

        ]
      }
    ];

    $rootScope.menus = menus;

    $rootScope.applyParticle = function(particle) {

      $http
      .get(particle.data)
      .success(function(data) {

        var img = new Image();
        img.onload = function() {

          particleData = {
            data: data,
            image: this
          };

          $rootScope.$broadcast('applyParticle', particleData);
          curParticle = particle;

        };
        img.src = particle.image;
      });

    };

  });

  app.controller('previewController', function($scope, $http) {
    $scope.name = 'preview section';
    $scope.particleData = null;
    $scope.$on('applyParticle', function(event, particleData) {
      $scope.particleData = particleData;
      $scope.$apply();
    });
  });

})();
