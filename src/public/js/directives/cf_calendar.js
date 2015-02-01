var cfCal = angular.module('CF-Calendar', []);

/**
 * Simple comparison helper to check if a number is between
 * min and max.
 * @param  {int} x   Number to compare
 * @param  {int} min Minimum
 * @param  {int} max Maximum
 * @return {boolean}     true if min <= x <= max 
 */
function between(x, min, max) {
  return x >= min && x <= max;
}

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
    controller: ['$scope', 'CFCalService', function($scope, CFCalService) {
      $scope.today = function() {
        $scope.dt = new Date();
      };
      $scope.today();

      $scope.clear = function () {
        $scope.dt = null;
      };

      $scope.toggleMin = function() {
        $scope.minDate = $scope.minDate ? null : new Date();
      };
      $scope.toggleMin();

      $scope.calendarInitialized = false;

      var calendarEntries = CFCalService.query(function() {
        $scope.calendarInitialized = true;
        $scope.dt = new Date();    // Workaround to disable dates
        $scope.disabled = function(date, mode) {
          for (var index = calendarEntries.length - 1; index >= 0; index--) {
            var calEntry = calendarEntries[index];
            var startDate = new Date(calEntry.start),
                endDate = new Date(calEntry.end);

            var sameDay = between(date.getDate(), startDate.getDate(), endDate.getDate()),
                sameMonth = between(date.getMonth(), startDate.getMonth(), endDate.getMonth()),
                sameYear = between(date.getYear(), startDate.getYear(), endDate.getYear());

            if(sameDay && sameMonth && sameYear) {
              return true;
            }
          };
          return false;
        }  
      });

    }],
    link: function($scope, iElm, iAttrs, cfCalendarManager) { 
      $scope.$watch(function($scope) { return $scope.dt}, function(newValue) {
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
    controller: ['$scope', 'CFCalService', function($scope, CFCalService) {  
        $scope.rentrequest = {};
        
        $scope.submitRent = function() {

          $scope.rentrequest.date = $scope.cfmanager.dt;
          var newRequest = new CFCalService($scope.rentrequest);
          newRequest.$save(function(test) {
            console.log("GTEST ", test);
          });

        };

      }],
    templateUrl: '../partials/templates/cf_CalendarDetails.html',
    scope: {},
    link: function($scope, iElm, iAttrs, cfCalendarManager) {
      cfCalendarManager.mgrscope.$watch("dt", function(newValue) {
        $scope.dt = newValue;
      });

      $scope.cfmanager = cfCalendarManager.mgrscope;
    }
  };
});

cfCal.factory('CFCalService', ['$resource', function($resource){
    var CFCalendar = $resource('/calendar', {});

    angular.extend(CFCalendar.prototype, {
        getDetails: function() {
          // TODO: Maybe make the whole thing a two staged process
          // in order to save some bandwidth... (nobody will read all articles at once.
        }
    });

    return CFCalendar;
}]);