var articlesControllers = angular.module('ArticlesControllers', [
   'AdminUtils',
   'CFfacebook'
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

    $scope.isPublished = function(value, status) {
      var date = new Date(value);
      var now = new Date();
      var dateComp =  (+date <= +now);
      var statusComp = (status.indexOf('Published') > -1);
      return dateComp && statusComp;
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


articlesControllers.controller('ArticleCtrl', ['$scope', '$timeout', '$log', '$routeParams', '$location', '$modal', 'sharedArticle', 'articleUtils', 'VerifyDeleteActionCtrl', 'FileUploader', 'Facebook',
	function ($scope, $timeout, $log, $routeParams, $location, $modal, sharedArticle, articleUtils, VerifyDeleteActionCtrl, FileUploader, Facebook) {
  	 
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


    /*==========  File Upload  ==========*/

    var file = { 
        file: undefined,
        width: 220,
        height: 220,
        ready: false,
        uploaded: false,
        clear: false
    };
     
    var uploader = new FileUploader({
      queueLimit : 1
    });

    // FILTERS

    uploader.filters.push({
        name: 'imageFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });

    // EVENTS

    FileUploader.prototype.onAfterAddingFile = function(fileItem) {
      file.uploaded = true;
      file.clear = false;
      file.file = fileItem._file;
      file.ready = true;
      uploader.clearQueue();

    };

    // FUNCTIONS

    function revertFileUpload() {
      file.uploaded = false;
      file.file = undefined;
    }

    function clearFile() {
      file.uploaded = false;
      file.clear = true;
      file.file = undefined;
    }

    // SET

    $scope.file = file;
    $scope.revertFileUpload = revertFileUpload;
    $scope.clearFile = clearFile;
    $scope.uploader = uploader;

    /*==========  Publish Area Functions  ==========*/

    // Preview Function

    $scope.PreviewArticle = function(){
      // TODO THIS METHOD ISN'T IMPLEMENTED YET
      console.log("PREVIEW CALLED");
    }

    // Set Publish Date Function
    $scope.minDate = new Date();

    $scope.openDatePicker = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.opened = true;
    };

    $scope.setPublished = function () {
       $scope.article.published = $scope.dt;
    };

    // Set Status Function

    $scope.setNewStatus = function(){
        $scope.article.status = $scope.article.newstatus.name;
    }
		
    /*==========  Delete Article  ==========*/

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
            articleUtils.deleteArticle($scope.selected, function() {});
            $location.path('/managearticles');
         });
      } 

      $scope.fbtest = function() {
        // 153097184732527
        Facebook.post("/me/feed", {}, {message:'THIS IS A TEST MESSAGE', link:'http://clubforum.de:3000/#news'});
      }

      /*==========  Submit Article  ==========*/

		 $scope.submit = function(form, actionType) {
			// Trigger validation flag.
			$scope.submitted = true;

		  // If form is invalid, return and let AngularJS show validation errors.
			if (form.$invalid) {
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

      // If the article is submitted the first time set the current date
      if($scope.article.published == undefined) {
         if(actionType == 'publish') {
            $scope.article.published = new Date();
         }
      }

      var file2Up = $scope.file;
      var isNew = $scope.isNewArticle();
      var articleId = $scope.article._id;

      var imagepromise = articleUtils.generateImage(file2Up.file);
      var article = articleUtils.generateArticle($scope.article);

      // The image has to be processed first...
      imagepromise.then(function(image) {
         var message = {};
         if(image) {
          if(file2Up.uploaded) {
            article.hasImg = true;
          }
          message = {
            "article" : article,
            "image": (file2Up.uploaded) ? image : 'none'
          }
         } else {
           if(file2Up.clear) {
            article.hasImg = false;
           }
            message = {
              "article" : article,
              "image": (file2Up.clear) ? 'clear' : 'none'
            }
         }
        
        articleUtils.sendArticle(message, isNew, articleId, actionType).then(
          function(resp) {

           var articleId = (resp.articledata) ? resp.articledata._id : $scope.article._id;
           if($scope.article.status == $scope.sitestate.articleStatusEnum[0].name && $scope.article.config.publish_fb) {
              Facebook.login('manage_pages,publish_actions').then(
                function () {
                  Facebook.post("/me/feed", {},
                   {
                    message:$scope.article.abstract,
                    link:'http://clubforum.de:3000/#!/news/'+ articleId,
                    place:'153097184732527',
                    name: $scope.article.title_short,
                    caption: $scope.article.title,
                    picture: 'http://clubforum.de:3000/img/articles/'+articleId+'.png' 
                   }
                  ).success(function(resp) {
                      alert('Sucessfully postet to FB');
                      console.log(resp.id);
                    });
                },
                function (resp) {
                  console.log("Fail");
                  alert('FB login failed');
                });
            }

            if(resp.articledata) {
              $location.path('/managearticles/'+resp.articledata._id);
              sharedArticle.setArticle(resp.articledata);
            }

            $scope.article.initstatus = $scope.article.status;
            
            $scope.messages = resp.msg;
            // Hide the status message which was set above after 3 seconds.
            $timeout(function() {
              $scope.messages = null;
            }, 3000);
          }, 
          function(fail) {
            $scope.messages = fail;
            // Hide the status message which was set above after 3 seconds.
            $timeout(function() {
              $scope.messages = null;
            }, 3000);
          } 
        );

      });
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

articlesControllers.controller('ManageMembersCtrl', [function(){
    
}]);