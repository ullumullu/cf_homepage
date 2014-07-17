var adminApp = angular.module('adminApp', [
  'ngRoute',
  'ngAnimate',
  'ngSanitize',
  'ArticlesControllers',
  'ui.bootstrap'
]);


/* CONFIGURATION TASKS */
adminApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/managehome', {
        templateUrl: '../partials/managehome.html',
        controller: 'ManageHomeCtrl'
      }).
      when('/managearticles', {
        templateUrl: '../partials/managearticles.html',
        controller: 'ManageArticlesCtrl'
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
            $rootScope.activetab = newVal.split('/')[1];
          });
}]);                  

/* DIRECTIVES */

/**
  ckEditor directive, inits the div with a running ckEditor. This is 
  necessary in order to add specific event listeners that update changes
  into the scope object.
*/
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

adminApp.directive('clickAnimateFlash', function($animate, $parse) {
  return {
    restrict: 'A',
    link: function(scope, elm, attr) {
      var pipeChain = attr.clickAnimateFlash.split('|');
      var clickFn = $parse(pipeChain[0]);
      if(pipeChain[1]) {
        var animationEleID = pipeChain[1].trim();
        elm.on('click', function (event){
          var animationele = $('#'+animationEleID);
          $animate.addClass(animationele, 'hideEle', function() {
              $animate.removeClass(animationele, 'hideEle', scope.$apply(clickFn));
          });
        });
      }
    }
  };
});

/* FILTER */
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


