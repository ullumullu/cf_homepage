var adminControllers = angular.module('adminControllers', []);


adminControllers.controller('ManageArticlesCtrl', ['$scope', '$http', '$log', '$timeout','sharedArticle',
  function ($scope, $http, $log, $timeout, sharedArticle) {
  		$scope.articles = {};

  		$http.get('/adminarea/managearticles/articles')
  			.success(function(data, status, headers, config) {
  				$log.log(data);

  				var articles = [];
  				angular.forEach(data.articles, function(value, key){
			        articles.push(value);
			    });
  				$log.log(articles);
  				$scope.articles = articles;

  				$scope.selected = $scope.articles[0];
  				sharedArticle.setArticle($scope.selected);

  			    $scope.select= function(item) {
			       $scope.selected = item;
			       sharedArticle.setArticle(item);
			    };

  			});

		$scope.keyEvent = function($svent) {
			if($event.keyCode == 46) {
				$scope.deleteArticle();
			}
		}  			

		$scope.deleteArticle = function() {
			 $scope.submitted = true;
			 var selectedid = $scope.selected._id;
			 $http.delete('managearticles/articles/'+selectedid)
  			.success(function(data, status, headers, config) {
  					if(status == 200) {
  						var oldTitle= $scope.selected.title;
  						var removedObj = $scope.articles.indexOf($scope.selected);
  						console.log(removedObj);
  						if(removedObj != -1) {
  							$scope.articles.splice(removedObj, 1);
  						}
  						if(removedObj == 0) {
  						   $scope.selected = $scope.articles[removedObj];
  						} else {
  						  $scope.selected = $scope.articles[removedObj-1];
  						}
  					}

  				 	// Hide the status message which was set above after 3 seconds.
					$timeout(function() {
					  $scope.messages = null;
					}, 3000);
  			});
		};
  }]);


adminControllers.controller('ArticleCtrl', ['$scope', '$http', '$timeout', '$log', '$routeParams', '$location', 'sharedArticle',
	function ($scope, $http, $timeout, $log, $routeParams, $location, sharedArticle) {
  	


  		/* INITIALIZE ALL REQUIRED VARIABLEs */
  		// sitestate = Sub-domain for all variables revoling about the current state inside the article page
  		// article = Contains all variables that will be submitted to the server in order to create update save an article/ draft of an article

		$scope.sitestate = {};
		$scope.article = {};



  		var sitestate = {};
  		var article = {};

  		/* FIRST INITIALIZE SITE STATE*/
		
  		sitestate.articleStatusEnum = [
  			{name: 'Published'},
  			{name: 'Draft'}
  			];

  		sitestate.newstatus = sitestate.articleStatusEnum[0];

  		/* SECOND INITIALIZE THE ARTICLE */
  		if ($routeParams.articleId != 'newarticle') {
  			if(sharedArticle.getArticle()) {
  			 article = sharedArticle.getArticle();
          $log.log(article.status);
          article.initstatus = article.status;
  			} else {
  				// THE USER REFRESHED THE PAGE...
  				// TODO: Retrieve the article baser on the :articleId
  			}
		} else {
	  		article.config = {};
	  		article.config.publish_fb = false;
	  		article.config.enable_comments = false;
	  		article.meta = {};
	  		article.meta.favs = 0;
	  		article.meta.votes = 0;

		}

  		article.newstatus = sitestate.articleStatusEnum[0];

		$scope.article = article;
		$scope.sitestate = sitestate;


		/* FUNCTIONS */

		$scope.deleteArticle = function(){
	  		console.log("DELETE CALLED");


	  	}

		$scope.saveDraft = function(){
	  		console.log("SAVE DRAFT CALLED");
	  	}

		$scope.PreviewArticle = function(){
	  		console.log("PREVIEW CALLED");
	  	}

		$scope.setNewStatus = function(){
		  	$scope.article.status = $scope.article.newstatus.name;
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

			var article = {
				title: $scope.article.title,
				title_short: $scope.article.title_short,
				author: $scope.article.author,
				author_edit: $scope.article.author,
				body:   $scope.article.body,
				abstract: $scope.article.abstract,
				comments: [],
				date: new Date(), // Jul 1, 2012 @ 18:32
				date_edit: new Date(), // Jul 1, 2012 @ 18:32
				status: $scope.article.status,
				visibility: $scope.article.visibility,
				tags: [],
				meta: {
					votes: $scope.article.meta.votes,
				    favs:  $scope.article.meta.favs
				},
				config: {
					publish_fb: $scope.article.config.publish_fb,
					enablecomments: $scope.article.config.enable_comments
				}
			} 

			console.log("This article will be send", article);
			if($scope.isNewArticle()) {
				// Use POST to insert a new draft or published article
				$http.post('/adminarea/managearticles/articles', article)
					.success(function(data, status, headers, config) {						
						if(actionType == 'saveDraft') {
							if($routeParams.articleId == 'newarticle') {
								$location.path('/managearticles/'+data._id);
								sharedArticle.setArticle(data);
							}
							$scope.messages = 'Draft saved successfully!';
						} else if(actionType == 'publish') {
							if($routeParams.articleId == 'newarticle') {
								$location.path('/managearticles/'+data._id);
								sharedArticle.setArticle(data);
							}
							$scope.messages = 'The article was successfully published!';
						} else if(actionType == 'update') {
							if($routeParams.articleId == 'newarticle') {
								$location.path('/managearticles/'+data._id);
								sharedArticle.setArticle(data);
							}
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
                     $scope.messages = 'Draft saved successfully!';
                  } else if(actionType == 'publish') {
                     $scope.messages = 'The article was successfully published!';
                  } else if(actionType == 'update') {
                     $scope.messages = 'The article was successfully updated!';
                  } else {
                     $scope.messages = 'The action type wasn\'t understood.';
                  }
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