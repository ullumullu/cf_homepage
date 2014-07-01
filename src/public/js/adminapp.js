var adminApp = angular.module('adminApp', [
  'ngRoute',
  'ngAnimate',
  'ngSanitize',
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
          $rootScope.$watch(path, function(newVal, oldVal){
          $rootScope.activetab = newVal;
      });
}]);                  

adminApp.directive('ckEditor', function() {
  return {
    require: '?ngModel',
    link: function(scope, elm, attr, ngModel) {
      var ck = CKEDITOR.replace(elm[0]);

      if (!ngModel) return;

      ck.on('instanceReady', function() {
        ck.setData(ngModel.$viewValue);
      });

      function updateModel() {
          scope.$apply(function() {
              ngModel.$setViewValue(ck.getData());
          });
      }

      ck.on('change', updateModel);
      ck.on('key', updateModel);
      ck.on('dataReady', updateModel);

      ngModel.$render = function(value) {
        ck.setData(ngModel.$viewValue);
      };
    }
  };
});


adminApp.filter('listOfArticlesFilter',['$filter',function ($filter) {
  return function(input, searchText) {
    if(searchText) {
      var searchTextLow = searchText.toLowerCase();
      var filteredInput = [];
      for(articleCount in input) {
        var article = input[articleCount];
        if (article.title.toLowerCase().indexOf(searchTextLow) > -1
          || article.author.toLowerCase().indexOf(searchTextLow) > -1
          || $filter('date')(article.date, 'medium').toLowerCase().indexOf(searchTextLow) > -1) {
          filteredInput.push(article);
        }
      }
      return filteredInput;
    } else {
      return input;
    }
  };
}]);


adminApp.service('sharedArticle', function(){
        var article= {};
        return{
            getArticle: function(){
                return article;
            },
            setArticle: function(value){
                article=value;
            }
        };
    });