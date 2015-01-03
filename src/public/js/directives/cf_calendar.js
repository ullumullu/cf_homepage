var cfCalendar = angular.module('CF-Calendar', []);

cfCalendar.directive('cfCalendarManager', ['$window', function($window){
  // Runs during compile
  return {
    controller: function($scope) {
        this.scope = $scope;
    }
  };
}]);


cfCalendar.directive('cfCalendar', ['$window', function($window){
  // Runs during compile
  return {
    require: '^cfCalendarManager', // Array = multiple requires, ? = optional, ^ = check parent elements
    restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
    templateUrl: '../partials/templates/cf_Calendar.html',
    scope: {

    },
    controller: function($scope, $element, $attrs, $transclude) {
      $scope.today = function() {
        $scope.dt = new Date();
      };
      $scope.today();

      $scope.clear = function () {
        $scope.dt = null;
      };

      // Disable weekend selection
      $scope.disabled = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
      };

      $scope.toggleMin = function() {
        $scope.minDate = $scope.minDate ? null : new Date();
      };
      $scope.toggleMin();

    },
    link: function($scope, iElm, iAttrs, cfCalendarManager, transcludeFn) { 
      $scope.$watch(function($scope) { return $scope.dt}, function(newValue) {
        console.log('DEBUG: ', newValue);
        cfCalendarManager.scope.dt = $scope.dt;
      });
    }
  };
}]);

cfCalendar.directive('cfCalendarDetails', ['$window', '$compile', function($window, $compile){
  // Runs during compile
  return {
    require: '^cfCalendarManager', // Array = multiple requires, ? = optional, ^ = check parent elements
    restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
    templateUrl: '../partials/templates/cf_CalendarDetails.html',
    scope: {

    },
    controller: function($scope, $element, $attrs, $transclude) {

    },
    link: function($scope, iElm, iAttrs, cfCalendarManager, transcludeFn) {
      cfCalendarManager.scope.$watch("dt", function(newValue) {
        console.log("TEST ", newValue);
        $scope.dt = newValue;
      });

      $scope.cfmanager = cfCalendarManager.scope;
    }
  };
}]);