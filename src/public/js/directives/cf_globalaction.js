var cfGlobalAction = angular.module('CF-GlobalAction', []);

cfGlobalAction.directive('globalActions', ['$window', '$rootScope', 
  function($window, $rootScope){
    // Runs during compile
  return {
    // name: '',
    // priority: 1,
    // terminal: true,
    scope: {},
    // controller: function($scope, $element, $attrs, $transclude) {},
    // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
    restrict: 'EA', // E = Element, A = Attribute, C = Class, M = Comment
    // template: '',
    templateUrl: '../partials/globalAction.html',
    // replace: true,
    transclude: false,
    // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
    link: function($scope, iElm, iAttrs, controller, transcludeFn) {
      $rootScope.$watch('globalActions', function(newVal, oldVal){
        $scope.globalActions = newVal;
      });
    }
  };
  }]);

