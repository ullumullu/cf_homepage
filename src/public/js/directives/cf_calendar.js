var cfCal = angular.module('CF-Calendar', []);

cfCal.directive('cfCalendarManager', function(){
  // Runs during compile
  return {
    scope: {},
    controller: ['$scope', function($scope) {
        this.mgrscope = $scope;
    }]
  };
});

cfCal.directive('cfCalendar', function(){
  // Runs during compile
  return {
    require: '^cfCalendarManager', // Array = multiple requires, ? = optional, ^ = check parent elements
    restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
    templateUrl: '../partials/templates/cf_Calendar.html',
    scope: {},
    controller: ['$scope', function($scope) {
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

    }],
    link: function($scope, iElm, iAttrs, cfCalendarManager) { 
      $scope.$watch(function($scope) { return $scope.dt}, function(newValue) {
        console.log('DEBUG: ', newValue);
        cfCalendarManager.mgrscope.dt = $scope.dt;
      });
    }
  };
});

cfCal.directive('cfCalendarDetails', function(){
  // Runs during compile
  return {
    require: '^cfCalendarManager', // Array = multiple requires, ? = optional, ^ = check parent elements
    restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
    templateUrl: '../partials/templates/cf_CalendarDetails.html',
    scope: {},
    link: function($scope, iElm, iAttrs, cfCalendarManager) {
      cfCalendarManager.mgrscope.$watch("dt", function(newValue) {
        console.log("TEST ", newValue);
        $scope.dt = newValue;
      });

      $scope.cfmanager = cfCalendarManager.mgrscope;
    }
  };
});