var articlesControllers = angular.module('ArticlesControllers', [
   'AdminUtils'
]);

articlesControllers.controller('ManageArticlesCtrl', ['$scope', '$http', '$log', '$timeout', '$sce', '$modal', 'sharedArticle', 'VerifyDeleteActionCtrl', 'articleUtils',
  function ($scope, $http, $log, $timeout, $sce, $modal, sharedArticle, VerifyDeleteActionCtrl, articleUtils) {
  		$scope.articles = {};

  		$http.get('/adminarea/managearticles/articles')
  			.success(function(data, status, headers, config) {

  				var articles = [];
  				angular.forEach(data.articles, function(value, key){
			        articles.push(value);
			    });

  				$scope.articles = articles;

  				$scope.selected = $scope.articles[0];
  				sharedArticle.setArticle($scope.selected);

  			    $scope.select= function(item) {
			       $scope.selected = item;
			       sharedArticle.setArticle(item);
			    };

  			});


      $scope.getSelectedBody = function (){
         if($scope.selected)
            return $sce.trustAsHtml($scope.selected.body);
      }

		$scope.keyEvent = function($svent) {
			if($event.keyCode == 46) {
				$scope.deleteArticle();
			}
		}  		

      $scope.verifyDeleteAction = function() {
         var modalInstance = $modal.open({
               templateUrl : 'deleteVerification.html',
               controller : VerifyDeleteActionCtrl,
               resolve: {
                  content: function() {
                     return {
                        selectedArticle: $scope.selected,
                        header: 'Alert - Delete Verification',
                        body: 'Are you sure to delete the selected article:'
                     };
                  }
               }
            });

            modalInstance.result.then(function (deleteArticle) {
               articleUtils.deleteArticle($scope.selected, function() {
                  var oldTitle= $scope.articles.title;
                  var removedObj = $scope.articles.indexOf($scope.selected);
                  if(removedObj != -1) {
                    $scope.articles.splice(removedObj, 1);
                  }
                  if(removedObj == 0) {
                     $scope.selected = $scope.articles[removedObj];
                  } else {
                    $scope.selected = $scope.articles[removedObj-1];
                  }
                  // Hide the status message which was set above after 3 seconds.
                   $timeout(function() {
                     $scope.messages = null;
                   }, 3000);
                        }); 
                  }, function () {
                     
                  });
      }	

  }]);


articlesControllers.controller('ArticleCtrl', ['$scope', '$http', '$timeout', '$log', '$routeParams', '$location', '$modal', 'sharedArticle', 'articleUtils', 'VerifyDeleteActionCtrl',
	function ($scope, $http, $timeout, $log, $routeParams, $location, $modal, sharedArticle, articleUtils, VerifyDeleteActionCtrl) {
  	
  		/* INITIALIZE ALL REQUIRED VARIABLEs */
  		// sitestate = Sub-domain for all variables revoling about the current state inside the article page
  		// article = Contains all variables that will be submitted to the server in order to create update save an article/ draft of an article

		$scope.sitestate = {};
  		var sitestate = {};
  		
  		/* FIRST INITIALIZE SITE STATE*/
		
  		sitestate.articleStatusEnum = [
  			{name: 'Published'},
  			{name: 'Draft'}
  			];

  		sitestate.newstatus = sitestate.articleStatusEnum[0];
      $scope.sitestate = sitestate;

      $scope.article = {};
      var article = {};
  		
  		if ($routeParams.articleId != 'newarticle') {
  			if(sharedArticle.getArticle()) {
  			 article = sharedArticle.getArticle();
          // Copy the initial status for comparision if sth. has changed
          // This variable should be treated as a final
          article.initstatus = article.status;
  			} else {
  				// THE USER REFRESHED THE PAGE...
  				// TODO: Retrieve the article baser on the :articleId
  			}
		} else {
         article = articleUtils.generateArticle({});
      }

  		article.newstatus = sitestate.articleStatusEnum[0];

		$scope.article = article;

      /* INIT DATEPICKER */
      $scope.minDate = new Date();

		/* FUNCTIONS */
		$scope.PreviewArticle = function(){
	  		console.log("PREVIEW CALLED");
	  	}

      $scope.openDatePicker = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
      };

      $scope.setPublished = function () {
         $scope.article.published = $scope.dt;
      };

		$scope.setNewStatus = function(){
		  	$scope.article.status = $scope.article.newstatus.name;
		}

     $scope.verifyDeleteAction = function() {
      var modalInstance = $modal.open({
            templateUrl : 'deleteVerification.html',
            controller : VerifyDeleteActionCtrl,
            resolve: {
               content: function() {
                  return {
                     selectedArticle: $scope.article,
                     header: 'Alert - Delete Verification',
                     body: 'Are you sure to delete this article:'
                  };
               }
            }
         });

         modalInstance.result.then(function (deleteArticle) {
                     $location.path('/managearticles');
               });
      }  

		 $scope.submit = function(form, actionType) {
			 // Trigger validation flag.
			 $scope.submitted = true;

		  	// If form is invalid, return and let AngularJS show validation errors.
			if (form.$invalid) {
			  $log.log("THE FORM IS INVALID");
			  $scope.errmessages = "The form isn't valid. Please check all required fields!"
			  return;
			}

         if($scope.article.status == undefined) {
            if(actionType == 'saveDraft') {
               $scope.article.status = $scope.sitestate.articleStatusEnum[1].name
            } else if(actionType == 'publish') {
               $scope.article.status = $scope.sitestate.articleStatusEnum[0].name
            }
         } else {
            if(actionType == 'saveDraft') {
               $scope.article.status = $scope.sitestate.articleStatusEnum[1].name
            } else if(actionType == 'publish') {
               $scope.article.status = $scope.sitestate.articleStatusEnum[0].name
            }
         }


      if($scope.article.published == undefined) {
         if(actionType == 'publish') {
            $scope.article.published = new Date();
         }
      }

			var article = articleUtils.generateArticle($scope.article);

			console.log("This article will be send", article);
			if($scope.isNewArticle()) {
				// Use POST to insert a new draft or published article
				$http.post('/adminarea/managearticles/articles', article)
					.success(function(data, status, headers, config) {						
						if(actionType == 'saveDraft') {
							$location.path('/managearticles/'+data._id);
							sharedArticle.setArticle(data);
							$scope.messages = 'Draft saved successfully!';
						} else if(actionType == 'publish') {
							$location.path('/managearticles/'+data._id);
							sharedArticle.setArticle(data);
							$scope.messages = 'The article was successfully published!';
						} else if(actionType == 'update') {
							$location.path('/managearticles/'+data._id);
							sharedArticle.setArticle(data);
							$scope.messages = 'The article was successfully updated!';
						} else {
							$scope.messages = 'The action type wasn\'t understood.';
						}
					});
			} else {
            var selectedid = $scope.article._id;
            // Use PUT to update an article
            $http.put('/adminarea/managearticles/articles/'+selectedid, article)
               .success(function(data, status, headers, config) {                
                  if(actionType == 'saveDraft') {
                     $scope.article.initstatus = article.status;
                     $scope.messages = 'Draft saved successfully!';
                  } else if(actionType == 'publish') {
                     $scope.article.initstatus = article.status;
                     $scope.messages = 'The article was successfully published!';
                  } else if(actionType == 'update') {
                     $log.log("Article:Status "+article.status)
                     $scope.article.initstatus = article.status;
                     $scope.messages = 'The article was successfully updated!';
                  } else {
                     $scope.messages = 'The action type wasn\'t understood.';
                  }
               }).error(function(data, status, headers, config) {
                  $scope.errmessages = 'The article could not be found in the database... maybe someone deleted the article in parallel';
               });
			}

		  	// Hide the status message which was set above after 3 seconds.
			$timeout(function() {
			  $scope.messages = null;
			}, 3000);
		 	};

		 	/* HELPER METHODS */

			$scope.isNewArticle = function() {
				return ($routeParams.articleId == 'newarticle');
			};

			$scope.isPublished = function() {
				return $scope.article.initstatus == $scope.sitestate.articleStatusEnum[0].name;
			};

 }]);

articlesControllers.controller('ManageHomeCtrl',
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