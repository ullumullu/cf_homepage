var adminApp = angular.module('adminApp', [
  'ngRoute',
  'adminControllers'
]);

adminApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/managehome', {
        templateUrl: '../partials/managehome.html',
        controller: 'ManageHomeCtrl',
        activeTab: 'managehome'
      }).
      when('/managearticles', {
        templateUrl: '../partials/managearticles.html',
        controller: 'ManageArticlesCtrl',
        activeTab: 'managearticles'
      }).
      when('/managearticles/:articleId', {
        templateUrl: '../partials/article.html',
        controller: 'ArticleCtrl'
      }).
      otherwise({
        redirectTo: '/'
      })
  }]).run(['$rootScope', '$location', function($rootScope, $location){
          var path = function() { return $location.path();};
          console.log(path);
          $rootScope.$watch(path, function(newVal, oldVal){
          $rootScope.activetab = newVal;
      });
}]);                    