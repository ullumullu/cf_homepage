var adminControllers = angular.module('adminControllers', []);


adminControllers.controller('ManageArticlesCtrl',
  function ($scope, $http) {

  });


adminControllers.controller('ArticleCtrl', ['$scope', '$http',
  function ($scope, $http) {

  }]);

adminControllers.controller('ManageHomeCtrl',
  function ($scope, $http, $timeout, $log) {

	$http.get('/adminarea/homeContent').success(function(data) {	
       $scope.home = data;
       $scope.welcome_text_new = data.welcome_text;
    });

	 $scope.submit = function(form) {
		  // Trigger validation flag.
		  $scope.submitted = true;

		  // If form is invalid, return and let AngularJS show validation errors.
		  if (form.$invalid) {
		    return;
		  }

		  // Default values for the request.

		  var config = {
			callback : 'JSON_CALLBACK',
			_id : $scope.home._id,
			welcome_text_new : $scope.welcome_text_new
		  };

		  // Perform JSONP request.
		  $http.post('/adminarea/homeContent', config)
		    .success(function(data, status, headers, config) {
		      if (data.status == 'OK') {
		        $scope.messages = 'Your form has been sent!';
		        $scope.submitted = false;
		      } else {
		        $scope.messages = 'Oops, we received your request, but there was an error.';
		        $log.error(data);
		      }
		    })
		    .error(function(data, status, headers, config) {
		      $scope.messages = 'There was a network error. Try again later.';
		      $log.error(data);
		    });
		  
		  // Hide the status message which was set above after 3 seconds.
		  $timeout(function() {
		    $scope.messages = null;
		  }, 3000);
		};
  });